# Guía de uso de AgroRenta Candelaria

## 1. Propósito y alcance

AgroRenta conecta a productores que necesitan maquinaria con propietarios que la ofrecen en renta. Tiene un portal público para productores y propietarios, y otro de administración municipal.

Esta versión es una demostración que guarda usuarios, maquinaria, reservas y reportes en el navegador. El cambio de perfil no es un inicio de sesión protegido. Los datos bancarios, las transferencias y los avisos SMS son demostrativos; no se hacen cargos ni se envían SMS sin configurar un servidor. No uses documentos ni datos personales reales.

## 2. Abrir la página

- `/`: portal público.
- `/admin`: consola administrativa. No hay un botón público para entrar; se abre escribiendo esta ruta en el navegador.

## 3. Barra superior del portal público

- **Logo AgroRenta:** vuelve a la vista del catálogo.
- **Productor (Rentar):** cambia a la vista de catálogo y reservas.
- **Propietario (Mi Flota):** cambia al panel de flota y solicitudes recibidas.
- **Crear Cuenta:** abre el registro de productor.
- **Poner en Renta:** abre el registro de propietario y su primera maquinaria.
- **Perfil de usuario:** abre Gestión de Cuentas. Seleccionar una tarjeta de perfil cambia el usuario de demostración activo. Los botones **Crear Cuenta Productor** y **Registrar Maquinaria** abren los respectivos registros.
- **¿Olvidaste tu contraseña? Recuperar por SMS:** muestra el formulario para solicitar un código y cambiar la contraseña. Requiere que se conecte el servicio SMS del servidor.
- **Enviar código por SMS / Cambiar contraseña:** solicita el código o confirma el cambio, según el paso mostrado.
- **Cerrar:** cierra el diálogo actual.
- **Botón de recarga con flechas:** pide confirmación y reinicia los datos de demostración en este navegador.

## 4. Registro de cuentas

### Productor

El formulario solicita nombre, apellidos, comunidad, dirección, contacto, correo y contraseña. **Mostrar/Ocultar contraseña** cambia la visibilidad del texto; **Seleccionar CURP / Credencial INE** permite cargar un PDF, una imagen de CURP o las dos caras de la INE. La verificación OCR compara el nombre y los apellidos reconocidos con los capturados en el formulario. La carga final vuelve a verificarlos antes de guardar.

- **Quitar (X) junto al archivo:** descarta la identificación seleccionada.
- **¿Tienes maquinaria? Regístrate aquí:** cambia al registro de propietario.
- **Cancelar:** cierra sin crear la cuenta.
- **Crear Mi Cuenta de Productor:** valida y guarda el registro.

### Propietario y maquinaria

El formulario tiene tres pasos:

1. Datos del propietario e identificación.
2. Datos de la máquina y factura.
3. Confirmación de envío.

La identificación debe mostrar el mismo nombre y apellidos de la cuenta. La factura debe incluir la marca y el modelo capturados; si presenta el año del equipo bajo una etiqueta reconocible, también se compara.

- **Elegir foto de perfil / Restaurar predeterminada:** selecciona una imagen de perfil o regresa a la imagen inicial.
- **Seleccionar CURP / Credencial INE** y botón **Quitar:** carga o descarta los documentos de identidad.
- **Subir factura:** carga el PDF o la imagen de la factura.
- **Regresar:** vuelve al paso anterior.
- **¿Quieres solo rentar? Crea cuenta aquí:** abre el registro de productor.
- **Siguiente:** valida el paso actual y continúa.
- **Enviar Solicitud a Aprobación:** guarda la solicitud para revisión administrativa. Hasta que se apruebe, la maquinaria no aparece en el catálogo y no se pueden publicar más equipos.
- **Cancelar / X:** cierra el formulario.

Los documentos de identidad y facturas aceptan PDF, JPG, PNG o WebP de hasta 5 MB. Se comprueba el formato, la firma del archivo y el contenido mediante OCR. Es un filtro de texto, no una certificación de autenticidad; el administrador debe revisar la documentación.

## 5. Portal de productor

### Catálogo

- **Buscar:** filtra por título, marca, modelo o descripción.
- **Selector de zona:** limita los resultados a una comunidad.
- **Selector de categoría:** filtra tractores, rastras, sembradoras, cosechadoras o aspersoras.
- **Limpiar Filtros:** restablece la búsqueda y los selectores.
- **Agregar / Agregada:** añade o quita esa máquina de la selección para una solicitud conjunta.
- **Rentar:** abre la solicitud de renta para esa máquina.
- **Detalles:** abre la ficha de maquinaria.
- **Rentar seleccionadas:** abre una solicitud conjunta para las máquinas agregadas.
- **Ver Mis Reservas:** muestra las solicitudes e historial del productor.

Las máquinas en mantenimiento, pendientes, rechazadas o pertenecientes a propietarios suspendidos no se muestran como disponibles.

### Detalle de maquinaria

- **WhatsApp / Llamar:** intenta contactar al propietario mediante la aplicación o el teléfono configurado.
- **Reportar propietario:** abre un formulario que pide nombre, dirección, persona reportada, causa y prueba adjunta. Requiere un perfil registrado; cada perfil puede enviar un reporte por propietario. Al tercer reporte de cuentas distintas, la cuenta del propietario y toda su maquinaria quedan suspendidas.
- **Solicitar Renta Ahora:** abre la solicitud para esa máquina.
- **Cerrar / X:** cierra la ficha.

### Solicitud de renta

Selecciona fechas, cantidad de días/horas/hectáreas cuando aplique, si necesita operador, ubicación de la parcela, instrucciones y método de pago. La pantalla calcula el costo estimado y avisa si las fechas están ocupadas o bloqueadas.

- **Transferencia SPEI / Efectivo en Campo:** selecciona el método demostrativo.
- **Copiar:** copia la CLABE mostrada.
- **Subir Comprobante / Cambiar Comprobante:** adjunta opcionalmente una imagen o PDF en la opción SPEI.
- **Confirmar Solicitud de Renta:** registra una solicitud por cada equipo seleccionado si las fechas están disponibles.
- **Cancelar / X:** cierra sin enviar.

La CLABE y la transferencia son solo de muestra. No realices pagos basándote en esos datos.

### Mis reservas

- **Todas, Pendientes, Aprobadas, En Campo, Finalizadas:** filtra las reservas por estado.
- **Datos para Transferir:** abre la información demostrativa de pago SPEI.
- **Copiar:** copia la CLABE del diálogo.
- **Contactar Dueño:** abre WhatsApp con el contacto de la reserva.
- **Subir foto de evidencia / Cambiar foto de evidencia:** adjunta o sustituye la prueba del pago en efectivo.
- **Cancelar Solicitud:** solicita confirmación y cancela una reserva pendiente.
- **Cerrar / Entendido:** cierra el diálogo de transferencia.

## 6. Portal de propietario

### Mi flota

El panel muestra resumen de equipos, solicitudes pendientes, trabajos activos y volumen acordado.

- **Elegir Foto de mi Dispositivo:** cambia la foto del perfil.
- **Mi Flota:** muestra los equipos registrados.
- **Solicitudes Recibidas:** muestra las solicitudes de productores.
- **Dar de Alta Maquinaria / Registrar Primera Máquina:** abre el formulario para añadir un equipo.
- **Disponibilidad & Calendario:** abre el calendario de fechas del equipo.
- **Mantenimiento / Reactivar:** oculta temporalmente el equipo por mantenimiento o vuelve a activarlo.
- **Eliminar (papelera):** pide confirmación y elimina el equipo de la flota.

En el alta se capturan título, tipo, marca, modelo, año, potencia, tarifa, modalidad, disponibilidad de operador, zona, ubicación, foto y descripción. La factura se compara con marca/modelo y el año cuando aparece claramente identificado.

- **Registrar Maquinaria en Flota:** valida y guarda el equipo.
- **Cancelar / X:** cierra sin guardar.

Si la cuenta aún está pendiente de aprobación, el botón de publicación aparece deshabilitado. Si la cuenta queda suspendida por reportes, se muestra el aviso de suspensión y no se puede administrar la flota.

### Calendario

El calendario muestra fechas disponibles, bloqueadas por mantenimiento y reservadas. Haz clic en una fecha futura libre para bloquearla o desbloquearla; no se pueden cambiar fechas pasadas ni fechas de una renta aprobada.

- **Listo / X:** cierra el calendario.

### Solicitudes recibidas

Cada tarjeta muestra productor, equipo, fechas, ubicación, pago y monto.

- **WhatsApp:** contacta al productor.
- **Datos Transferencia:** muestra los datos SPEI demostrativos.
- **Rechazar:** solicita un motivo y rechaza la solicitud.
- **Aprobar Solicitud:** acepta una solicitud pendiente.
- **Iniciar Trabajo en Campo:** cambia una renta aprobada al estado activo.
- **Marcar Renta Finalizada:** concluye una renta activa.
- **Cerrar:** cierra el diálogo de transferencia.

## 7. Consola administrativa (`/admin`)

Las tarjetas de resumen superiores son accesos rápidos a **Solicitudes**, **Parque de Maquinaria**, **Rentas en Campo** y **Padrón de Usuarios**. Las siete pestañas también abren esas secciones:

1. **Solicitudes e INE:** revisa propietarios pendientes, identidad, datos y maquinaria. **Revisar Credencial INE** abre los documentos; **Aprobar Directamente** aprueba desde el visor; **Aprobar Propietario y Publicar Maquinaria** aprueba la solicitud; **Rechazar Solicitud** pide el motivo del rechazo. El administrador debe cotejar personalmente la identidad y la factura.
2. **Parque de Maquinaria:** busca y filtra por estado, categoría y zona. **Detalles** abre la ficha y comprobante; **Aprobar** activa un equipo; **Rechazar** pide un motivo; **Pausar** suspende un anuncio activo; **Activar** intenta aprobar o reactivar uno no activo.
3. **Padrón de Usuarios:** filtra por rol, verificación y búsqueda. **Alta Directa de Usuario** abre el formulario de alta; **Registrar en Padrón** guarda el perfil; **Cancelar** cierra sin guardar. **Certificar / Revocar** cambia la marca de verificación; **Ficha** abre los datos del usuario.
4. **Monitoreo de Rentas y Contratos:** busca y filtra por estado o método de pago. Al pulsar el método de pago se abre el detalle; **Aprobar** acepta administrativamente una solicitud pendiente; **Concluir** finaliza una renta activa; **Cancelar** solicita motivo y cancela una renta; **Cerrar** sale del detalle.
5. **Zonas y Ejidos:** muestra conteos de maquinaria, usuarios y rentas por zona. **Registrar Nuevo Ejido** abre un formulario y **Agregar a Candelaria** añade la zona a la lista temporal de esta vista; **Cancelar / X** cierra el formulario. En esta versión, las zonas nuevas no se guardan al recargar ni se propagan a los demás selectores.
6. **Analítica y Reportes:** muestra el historial de reportes enviados y las pruebas adjuntas, junto con estadísticas de rentas, equipos, usuarios, comunidades y demanda. La suspensión por tercer reporte ocurre automáticamente; esta pantalla no ofrece una acción para revertirla.
7. **Bitácora de Auditoría:** muestra acciones registradas. **Refrescar** vuelve a cargar la bitácora; **Vaciar Registro** pide confirmación y elimina sus eventos. El cuadro de búsqueda y el selector filtran lo mostrado.

- **Salir al Portal Público:** regresa a `/`.
- **X / Cerrar Visor / Cerrar:** cierra la ficha o diálogo abierto.

## 8. Límites de seguridad y datos

El OCR procesa el documento en el navegador y compara texto reconocido. Puede rechazar archivos legítimos poco legibles o no detectar alteraciones; no comprueba autenticidad oficial. El motor y los datos de idioma pueden descargarse desde CDN, pero el archivo no se envía a un servicio OCR. La cuenta, los reportes y la suspensión se guardan localmente y pueden alterarse desde el navegador. Para producción se requiere backend, autenticación/autorización real, almacenamiento privado y revisión administrativa.
