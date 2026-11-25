# Medidas de protección implementadas en AgroRenta (prototipo)

## Cambios realizados

1. **Contraseñas:** las contraseñas nuevas se procesan con PBKDF2-SHA-256, sal aleatoria de 16 bytes y 310,000 iteraciones antes de guardarse. Se almacenan el hash, la sal y el número de iteraciones; no se conserva la contraseña legible. Al iniciar esta versión también se eliminan los campos `password` en texto plano de los registros locales heredados.
2. **Sesión local:** el identificador del perfil activo se guarda en `sessionStorage`, de modo que se elimina al cerrar la pestaña/sesión del navegador, en lugar de permanecer en `localStorage`.
3. **Validación de entradas:** se normalizan correo y teléfono, se eliminan caracteres de control en campos de texto, se limitan longitudes y se validan correos y contraseñas de al menos 8 caracteres.
4. **Archivos adjuntos:** se permiten únicamente PDF, JPG, PNG y WEBP; se limita el tamaño a 5 MB, se comprueba la firma básica del archivo y se normaliza el nombre almacenado.
5. **Transparencia del prototipo:** la interfaz informa que el selector de perfiles es un mecanismo de demostración y no una autenticación real.

## Archivos principales modificados o agregados

- `src/core/security/InputValidation.js` (nuevo)
- `src/core/security/PasswordSecurity.js` (nuevo)
- `src/core/security/FileValidation.js` (nuevo)
- `src/core/storage/StorageAdapter.js`
- `src/core/storage/DocumentStorage.js`
- `src/core/models/User.js`
- `src/services/AuthService.js`
- `src/App.jsx`
- `src/presentation/modules/auth/AuthModal.jsx`
- `src/presentation/modules/auth/ProducerRegistrationModal.jsx`
- `src/presentation/modules/auth/OwnerRegistrationModal.jsx`

## Limitaciones que deben declararse

AgroRenta continúa siendo una aplicación frontend que guarda información en el navegador. PBKDF2 protege las contraseñas almacenadas frente a la lectura directa, pero el hash se calcula en el cliente. `localStorage`, `sessionStorage` e IndexedDB pueden ser inspeccionados por quien tenga acceso al perfil del navegador. El selector de perfiles sigue siendo de demostración y no verifica la contraseña; las restricciones de roles en React tampoco sustituyen autorización en un servidor. Los datos personales y documentos reales no deben utilizarse en esta versión. Para producción se requiere backend, autenticación y autorización del lado del servidor, almacenamiento privado de documentos y HTTPS.

## Pruebas manuales recomendadas

1. Registrar un usuario con contraseña de 8 o más caracteres y comprobar en DevTools > Application > Local Storage que aparece `passwordHash` y no `password`.
2. Cerrar la pestaña y volver a abrir la aplicación: el perfil activo debe solicitarse de nuevo porque la sesión se guarda en `sessionStorage`.
3. Intentar registrar un correo inválido y confirmar que el formulario muestra un error.
4. Intentar adjuntar un archivo de más de 5 MB o con formato no permitido y confirmar que se rechaza.
5. Adjuntar un PDF/JPG/PNG/WEBP válido de menos de 5 MB y confirmar que se guarda y se puede consultar.
6. Confirmar que los módulos principales de productor, propietario y administración de demostración siguen cargando.
