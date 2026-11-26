import { validateDocumentFile, validateDocumentFiles, safeFileName } from '../security/FileValidation.js';

const DATABASE_NAME = 'agrorenta_documents';
const STORE_NAME = 'documents';

const openDatabase = () => new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('Este navegador no permite guardar documentos de forma local.'));
    return;
  }

  const request = window.indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento de documentos.'));
});

const storeDocument = async (file) => {
  const database = await openDatabase();
  const document = {
    id: window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Array.from(window.crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join(''),
    name: safeFileName(file.name),
    type: file.type,
    blob: file
  };

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(document);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('No se pudo guardar el documento.'));
      transaction.onabort = () => reject(transaction.error || new Error('No se pudo guardar el documento.'));
    });
  } finally {
    database.close();
  }

  return { id: document.id, name: document.name, type: document.type };
};

export const saveDocument = async (file, options) => {
  await validateDocumentFile(file, options);
  return storeDocument(file);
};

export const saveDocuments = async (files, options) => {
  await validateDocumentFiles(files, options);
  return Promise.all(files.map(storeDocument));
};

export const getDocumentBlob = async (id) => {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('No se pudo leer el documento.'));
    });
  } finally {
    database.close();
  }
};

export const deleteDocument = async (id) => {
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('No se pudo eliminar el documento.'));
      transaction.onabort = () => reject(transaction.error || new Error('No se pudo eliminar el documento.'));
    });
  } finally {
    database.close();
  }
};
