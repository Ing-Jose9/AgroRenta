/** Validaciones locales; no sustituyen la validación de un servidor. */
export const cleanText = (value, maxLength = 160) => String(value ?? '')
  .replace(/[\u0000-\u001F\u007F]/g, '')
  .trim()
  .slice(0, maxLength);

export const normalizeEmail = (value) => cleanText(value, 254).toLowerCase();
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(value));
export const normalizePhone = (value) => cleanText(value, 24).replace(/[^\d+()\-\s]/g, '');
export const validatePassword = (value) => {
  const password = String(value ?? '');
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (password.length > 128) return 'La contraseña no puede superar 128 caracteres.';
  return '';
};
