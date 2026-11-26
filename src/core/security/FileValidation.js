const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);
const OCR_CACHE = new WeakMap();
const IDENTITY_PURPOSE = 'identity';
const OWNERSHIP_PURPOSE = 'ownership';
const NAME_STOP_WORDS = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y']);

const getExtension = (name = '') => String(name).split('.').pop().toLowerCase();

const hasValidSignature = async (file, type) => {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (type === 'application/pdf') return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return [0x89, 0x50, 0x4e, 0x47].every((byte, index) => bytes[index] === byte);
  if (type === 'image/webp') return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  return false;
};

const normalizeOcrText = text => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, ' ');

const isIdentityDocument = (text) => {
  const normalized = normalizeOcrText(text);
  const compact = normalized.replace(/\s/g, '');
  const hasCurp = /[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d/.test(compact);
  const identityTerms = [
    'CREDENCIAL PARA VOTAR',
    'INSTITUTO NACIONAL ELECTORAL',
    'CLAVE UNICA DE REGISTRO DE POBLACION',
    'CURP',
    'ELECTOR'
  ];
  return hasCurp || identityTerms.filter(term => normalized.includes(term)).length >= 2;
};

const isOwnershipInvoice = (text) => {
  const normalized = normalizeOcrText(text);
  const hasInvoiceMarker = [
    'FACTURA',
    'CFDI',
    'COMPROBANTE FISCAL DIGITAL',
    'FOLIO FISCAL',
    'UUID',
    'RFC',
    'SAT'
  ].some(term => normalized.includes(term));
  const hasMachineryMarker = [
    'TRACTOR',
    'MAQUINARIA',
    'EQUIPO',
    'MOTOR',
    'SERIE',
    'MODELO',
    'MARCA'
  ].some(term => normalized.includes(term));
  return hasInvoiceMarker && hasMachineryMarker;
};

const getSignificantTokens = (value) => normalizeOcrText(value || '')
  .split(/\s+/)
  .filter(token => token.length > 1 && !NAME_STOP_WORDS.has(token));

const requireMatchingTokens = (text, values, errorMessage) => {
  const expectedTokens = values.flatMap(getSignificantTokens);
  const documentTokens = new Set(normalizeOcrText(text).split(/\s+/));
  if (!expectedTokens.length || expectedTokens.some(token => !documentTokens.has(token))) {
    throw new Error(errorMessage);
  }
};

export const validateDocumentText = (text, { purpose, ...options } = {}) => {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('No se pudo leer texto del documento.');
  }
  if (![IDENTITY_PURPOSE, OWNERSHIP_PURPOSE].includes(purpose)) {
    throw new Error('El tipo de documento solicitado no es válido.');
  }
  validateRecognizedPurpose(text, purpose, options);
  return true;
};

const validateIdentityMatch = (text, identityData, enforceMatch) => {
  const hasAccountName = Boolean(identityData?.name?.trim() && identityData?.lastName?.trim());
  if (!hasAccountName && !enforceMatch) return;
  if (!hasAccountName) {
    throw new Error('No se recibieron el nombre y los apellidos para comparar la identificación.');
  }
  requireMatchingTokens(
    text,
    [identityData.name, identityData.lastName],
    'El nombre o los apellidos de la CURP/INE no coinciden con los datos de la cuenta.'
  );
};

const validateOwnershipMatch = (text, equipmentData, enforceMatch) => {
  const hasEquipmentDetails = Boolean(equipmentData?.brand?.trim() && equipmentData?.model?.trim());
  if (!hasEquipmentDetails && !enforceMatch) return;
  if (!hasEquipmentDetails) {
    throw new Error('Indica la marca y el modelo para compararlos con la factura.');
  }
  requireMatchingTokens(
    text,
    [equipmentData.brand, equipmentData.model],
    'La marca o el modelo de la factura no coincide con los datos de la maquinaria.'
  );

  const enteredYear = String(equipmentData.year || '').trim();
  const normalized = normalizeOcrText(text);
  const invoiceYears = Array.from(normalized.matchAll(/(?:ANO|ANIO|YEAR|FABRICACION)(?:\s+DE)?(?:\s+MODELO)?\s*[:#-]?\s*((?:19|20)\d{2})\b/g), match => match[1]);
  if (enteredYear && invoiceYears.length && !invoiceYears.includes(enteredYear)) {
    throw new Error('El año indicado no coincide con el año del tractor que aparece en la factura.');
  }
};

const recognizeFileText = async (file) => {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('spa+eng');
  try {
    if (file.type === 'application/pdf') {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      GlobalWorkerOptions.workerSrc = workerModule.default;
      const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
      try {
        if (pdf.numPages > 5) throw new Error('El PDF supera el máximo de 5 páginas para revisar la documentación.');
        const pageTexts = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const initialViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(1.5, 2500 / Math.max(initialViewport.width, initialViewport.height));
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('No se pudo procesar la página del PDF.');
          await page.render({ canvasContext: context, viewport }).promise;
          const result = await worker.recognize(canvas);
          pageTexts.push(result.data.text);
          canvas.width = 0;
          canvas.height = 0;
        }
        return pageTexts.join('\n');
      } finally {
        await pdf.destroy();
      }
    }
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
};

const validateDocumentPurpose = async (file, purpose, options) => {
  if (!purpose) return;
  if (![IDENTITY_PURPOSE, OWNERSHIP_PURPOSE].includes(purpose)) {
    throw new Error('El tipo de documento solicitado no es válido.');
  }

  const text = await getRecognizedText(file);
  validateDocumentText(text, { ...options, purpose });
};

const getRecognizedText = (file) => {
  let validation = OCR_CACHE.get(file);
  if (!validation) {
    validation = recognizeFileText(file);
    OCR_CACHE.set(file, validation);
  }
  return validation;
};

const validateRecognizedPurpose = (text, purpose, options = {}) => {
  const matches = purpose === IDENTITY_PURPOSE
    ? isIdentityDocument(text)
    : isOwnershipInvoice(text);
  if (!matches) {
    throw new Error(purpose === IDENTITY_PURPOSE
      ? 'El archivo no parece ser una CURP o credencial para votar. Sube una imagen/PDF legible de tu documento.'
      : 'El archivo no parece ser una factura de maquinaria. Debe mostrar datos fiscales y datos del tractor o equipo.');
  }
  if (purpose === IDENTITY_PURPOSE) {
    validateIdentityMatch(text, options.identityData, options.enforceMatch);
  } else {
    validateOwnershipMatch(text, options.equipmentData, options.enforceMatch);
  }
};

const validateFileFormat = async (file) => {
  if (!(file instanceof Blob)) throw new Error('Selecciona un archivo válido.');
  if (file.size <= 0) throw new Error('El archivo está vacío.');
  if (file.size > MAX_FILE_SIZE) throw new Error('El archivo supera el límite de 5 MB.');

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_TYPES.has(file.type)) {
    throw new Error('Formato no permitido. Utiliza PDF, JPG, PNG o WEBP.');
  }
  if (!await hasValidSignature(file, file.type)) {
    throw new Error('El contenido del archivo no coincide con su formato. Selecciona un documento válido.');
  }
};

export const validateDocumentFile = async (file, options = {}) => {
  await validateFileFormat(file);
  await validateDocumentPurpose(file, options.purpose, options);
  return true;
};

export const validateDocumentFiles = async (files, options = {}) => {
  if (!Array.isArray(files) || files.length === 0) throw new Error('Selecciona al menos un archivo.');
  await Promise.all(files.map(validateFileFormat));
  const { purpose } = options;
  if (purpose) {
    if (![IDENTITY_PURPOSE, OWNERSHIP_PURPOSE].includes(purpose)) {
      throw new Error('El tipo de documento solicitado no es válido.');
    }
    if (purpose === OWNERSHIP_PURPOSE && files.length !== 1) {
      throw new Error('Adjunta una sola factura por equipo.');
    }
    const text = (await Promise.all(files.map(getRecognizedText))).join('\n');
    validateDocumentText(text, { ...options, purpose });
  }
  return true;
};

export const DocumentPurpose = {
  IDENTITY: IDENTITY_PURPOSE,
  OWNERSHIP: OWNERSHIP_PURPOSE
};

export const safeFileName = (name = '') => String(name)
  .normalize('NFKC')
  .replace(/[^a-zA-Z0-9._-]/g, '_')
  .slice(0, 100) || 'documento';
