# Requerimientos y Verificación

Listas de verificación de historias de usuario y tareas técnicas del prototipo de la **Intranet Escolar**, con trazabilidad a los requerimientos funcionales (RF-01 a RF-05) y no funcionales (RNF-01 a RNF-03).

## Cobertura funcional

### RF-01 — Autenticación y roles

Historias de usuario:

- [x] Como usuario, quiero iniciar sesión con mi usuario y contraseña.
- [x] Como administración, quiero una cuenta con acceso total.
- [x] Como docente, quiero una cuenta para cargar calificaciones y asistencia.
- [x] Como estudiante/familia, quiero una cuenta para consultar información académica.
- [x] Como sistema, quiero rechazar contraseñas incorrectas y usuarios desactivados.

Tareas técnicas:

- [x] Implementar `Auth.login()` con verificación de hash en `js/auth.js`.
- [x] Persistir la sesión del usuario conectado en `localStorage`.
- [x] Generar semilla con cuentas de demostración por rol en `js/data.js`.

### RF-02 — Gestión de usuarios

Historias de usuario:

- [x] Como administración, quiero crear usuarios del sistema.
- [x] Como administración, quiero editar los datos de un usuario.
- [x] Como administración, quiero dar de baja y reactivar usuarios.
- [x] Como administración, quiero restablecer la contraseña de un usuario.
- [x] Como usuario, quiero editar mi propio perfil (nombre y correo).
- [x] Como usuario, quiero cambiar mi contraseña verificando la actual.

Tareas técnicas:

- [x] Vista `users` con tabla y formulario de alta/edición en `js/views.js`.
- [x] Restringir la vista `users` al rol de administración (RBAC).
- [x] Aplicar hash con nueva sal al restablecer contraseñas.
- [x] Vista `profile` con formulario de datos y cambio de contraseña por rol.
- [x] Menú hamburguesa funcional en pantallas pequeñas con cierre por teclado.

### RF-03 — Módulo académico

Historias de usuario:

- [x] Como docente, quiero cargar calificaciones por materia y período.
- [x] Como estudiante/familia, quiero consultar mis calificaciones y promedio.
- [x] Como docente, quiero registrar asistencia por materia y fecha.
- [x] Como estudiante/familia, quiero consultar mi asistencia.
- [x] Como administración, quiero ver calificaciones y asistencia de todas las materias.

Tareas técnicas:

- [x] Colecciones `grades` y `attendance` en la capa de datos.
- [x] Vistas diferenciadas por rol para carga y consulta.
- [x] Validación de calificaciones entre 0 y 100.

### RF-04 — Tablón de comunicados

Historias de usuario:

- [x] Como administración o docente, quiero publicar comunicados.
- [x] Como usuario, quiero ver comunicados según mi rol.
- [x] Como autor o administración, quiero eliminar comunicados.

Tareas técnicas:

- [x] Colección `notices` con audiencia (`all`, `teacher`, `student`).
- [x] Filtrado por rol en la lista de comunicados.
- [x] Formulario de publicación accesible y con etiquetas.

### RF-05 — Vistas restringidas

Historias de usuario:

- [x] Como usuario, quiero ver solo las opciones permitidas para mi rol.
- [x] Como sistema, quiero impedir el acceso directo a vistas no permitidas.

Tareas técnicas:

- [x] Mapa de permisos `PERMISSIONS` en `js/auth.js`.
- [x] Menú lateral construido según las vistas permitidas.
- [x] Redirección automática en el ruteo ante una vista no permitida.

### RF-06 — Asistente IA de aclaración de dudas

Historias de usuario:

- [x] Como usuario, quiero realizar preguntas sobre el sistema y recibir aclaraciones automáticas estilo IA.
- [x] Como usuario, quiero seleccionar preguntas sugeridas para probar rápidamente las consultas comunes.
- [x] Como sistema, quiero responder la información relevante para temas escolares y responder estrictamente "No estoy calificada para responder dicha pregunta." ante cualquier consulta ajena.

Tareas técnicas:

- [x] Módulo `Assistant` (`js/assistant.js`) con base de conocimiento y normalización de texto.
- [x] Vista interactiva `viewAssistant` en `js/views.js` con chat en vivo e indicador de escritura.
- [x] Habilitación en menú lateral (`NAV`) y permisos (`PERMISSIONS`) para todos los roles.

## Cobertura no funcional

### RNF-01 — Accesibilidad

- [x] Contraste de colores con nivel AA.
- [x] Etiquetas explícitas en formularios y tablas.
- [x] Navegación por teclado con foco visible.
- [x] Mensajes de error con `role="alert"` y `aria-live`.
- [ ] Revisar el contraste en todas las variantes de tema antes del despliegue.

### RNF-02 — Protección de datos

- [x] Contraseñas almacenadas como hash SHA-256 con sal, nunca en texto plano.
- [x] Sin datos personales reales en la interfaz; semilla 100 % ficticia.
- [ ] Migrar la verificación de credenciales a un servidor en producción.
- [ ] Aplicar HTTPS en cualquier despliegue real.

### RNF-03 — Control de versiones

- [x] Historial de commits desde el inicio de la implementación.
- [x] Convención Conventional Commits documentada en `CONTRIBUTING.md`.
- [x] Cada commit asociado a un cambio específico y probado.

## Guía de verificación rápida

Pasos para comprobar el prototipo de forma manual:

1. Abrir `index.html` en el navegador.
2. Iniciar sesión como `admin` / `12345` y revisar el módulo de usuarios.
3. Iniciar sesión como `docente` / `docente123` y cargar una calificación y una asistencia.
4. Iniciar sesión como `estudiante` / `estudiante123` y verificar que se ven las calificaciones cargadas.
5. Publicar un comunicado como docente y verificarlo con la cuenta de estudiante.
6. Usar **Restablecer datos de demo** para volver al estado inicial.
