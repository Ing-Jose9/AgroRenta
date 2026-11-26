# AgroRenta Candelaria

## Desarrollo

```sh
npm install
npm run dev
```

El portal público se abre en `/` y el módulo de administración en `/admin`.
Los archivos de prueba (INE, comprobantes y documentos de propiedad) se guardan en IndexedDB del navegador actual; no se sincronizan entre dispositivos ni deben usarse para información personal real.

Consulta la [guía funcional del sitio](./FUNCIONALIDAD-DEL-SITIO.md) para conocer los portales, formularios y acciones de cada botón.

## Notificaciones SMS

La interfaz puede conectarse a una API configurando `VITE_API_BASE_URL` (ver `.env.example`). La API debe implementar:

- `POST /auth/password-reset` con `{ "phone": "..." }`: validar una cuenta, limitar solicitudes y enviar un código temporal por SMS.
- `POST /auth/password-reset/confirm` con `{ "phone": "...", "code": "...", "password": "..." }`: validar el código y cambiar la contraseña de forma segura.
- `POST /notifications/cash-evidence` con `{ "phone": "...", "reservationId": "..." }`: enviar el recordatorio para subir evidencia del pago.

Estos endpoints no forman parte del frontend y el SMS no se envía hasta que se configure e implemente el backend y el proveedor. Las credenciales del proveedor deben permanecer exclusivamente en el servidor; nunca deben incluirse en variables `VITE_*`.

La aplicación todavía usa almacenamiento local para cuentas, maquinaria y reservas, y no tiene autenticación de servidor. No debe desplegarse como servicio de producción ni almacenar INE reales hasta incorporar backend, control de acceso y almacenamiento protegido de documentos.
