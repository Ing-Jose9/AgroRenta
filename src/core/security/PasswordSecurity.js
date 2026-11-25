const ITERATIONS = 310000;
const HASH_LENGTH = 256;

const toBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

/** Hash PBKDF2-SHA-256 local para evitar guardar contraseñas legibles en el prototipo. */
export const hashPassword = async (password) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Este navegador no ofrece Web Crypto. No se puede guardar la contraseña de forma protegida.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(String(password)),
    'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256'
  }, keyMaterial, HASH_LENGTH);
  return { passwordHash: toBase64(bits), passwordSalt: toBase64(salt), passwordIterations: ITERATIONS };
};
