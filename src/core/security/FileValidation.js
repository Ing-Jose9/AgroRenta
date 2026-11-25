const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);

const getExtension = (name = '') => String(name).split('.').pop().toLowerCase();

const hasValidSignature = async (file, type) => {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (type === 'application/pdf') return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return [0x89, 0x50, 0x4e, 0x47].every((byte, index) => bytes[index] === byte);
  if (type === 'image/webp') return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  return false;
};

export const validateDocumentFile = async (file) => {
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
  return true;
};

export const safeFileName = (name = '') => String(name)
  .normalize('NFKC')
  .replace(/[^a-zA-Z0-9._-]/g, '_')
  .slice(0, 100) || 'documento';
