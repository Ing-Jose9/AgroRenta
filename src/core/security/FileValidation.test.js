import assert from 'node:assert/strict';
import { DocumentPurpose, validateDocumentText } from './FileValidation.js';

const identityText = 'INSTITUTO NACIONAL ELECTORAL CREDENCIAL PARA VOTAR JUAN CARLOS PEREZ GOMEZ';

assert.equal(validateDocumentText(identityText, {
  purpose: DocumentPurpose.IDENTITY,
  identityData: { name: 'Juan Carlos', lastName: 'Pérez Gómez' },
  enforceMatch: true
}), true);
assert.throws(() => validateDocumentText(identityText, {
  purpose: DocumentPurpose.IDENTITY,
  identityData: { name: 'Juan Carlos', lastName: 'López Gómez' },
  enforceMatch: true
}), /no coinciden con los datos de la cuenta/);

const invoiceText = 'FACTURA CFDI RFC ABC123 TRACTOR JOHN DEERE MODELO 8R 340 ANO 2022';

assert.equal(validateDocumentText(invoiceText, {
  purpose: DocumentPurpose.OWNERSHIP,
  equipmentData: { brand: 'John Deere', model: '8R 340', year: 2022 },
  enforceMatch: true
}), true);
assert.throws(() => validateDocumentText(invoiceText, {
  purpose: DocumentPurpose.OWNERSHIP,
  equipmentData: { brand: 'John Deere', model: '9R 440', year: 2022 },
  enforceMatch: true
}), /no coincide con los datos de la maquinaria/);
assert.throws(() => validateDocumentText(invoiceText, {
  purpose: DocumentPurpose.OWNERSHIP,
  equipmentData: { brand: 'John Deere', model: '8R 340', year: 2020 },
  enforceMatch: true
}), /El año indicado no coincide/);
