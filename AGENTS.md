# AGENTS.md — Memoria del Agente

Archivo de memoria para asistentes de código (IA). Resume el contexto, los requerimientos y las reglas del proyecto **Intranet Escolar**.

## 1. Contexto

Intranet escolar para un colegio público. Permite la comunicación y consulta académica entre administración, docentes, estudiantes y familias.

## 2. Requerimientos

- Sistema de autenticación con control de acceso basado en roles (RBAC).
- Módulo de carga y consulta de calificaciones.
- Tablón de avisos y noticias institucionales.
- Gestión de usuarios (alta, edición, baja).
- Registro y consulta de asistencia.

## 3. Reglas de Código

- Nombres de archivos y variables en inglés usando `camelCase`.
- Uso de componentes funcionales y modulares.
- Cada commit debe asociarse a un cambio específico y probado.
- La documentación en Markdown sigue GitHub Flavored Markdown (GFM).
- Los archivos JavaScript se mantienen sin dependencias externas.

## 4. Restricciones

- NO exponer datos personales o sensibles de estudiantes menores de edad en la interfaz.
- NO almacenar contraseñas en texto plano bajo ninguna circunstancia.
- NO agregar comentarios de código salvo que aporten contexto real.
- NO usar otro símbolo que no sea el guion (`-`) en listas no ordenadas de Markdown.

## 5. Objetivos

- Prototipo funcional ejecutable localmente sin instalaciones adicionales.
- Cobertura completa de la documentación técnica en la carpeta `docs/`.
- Cumplimiento de los requerimientos funcionales RF-01 a RF-05 y no funcionales RNF-01 a RNF-03.

## 6. Memoria del Proyecto

- 2026-03: Definición del modelo de roles (Administrador, Docente, Estudiante/Familia).
- 2026-03: Adopción del estándar GitHub Flavored Markdown (GFM) para toda la documentación.
- 2026-08: Construcción del prototipo v0.1.0 en HTML, CSS y JavaScript puro con persistencia en `localStorage`.
- 2026-08: Implementación de hash SHA-256 con sal para contraseñas y corrección del padding de 64 bits.
- 2026-08: Adición del perfil de usuario funcional y del menú hamburguesa accesible.
- 2026-08: Unificación de absolutamente todas las alertas, notificaciones y mensajes del sistema mediante Toastify (`toastify.js`), eliminando todas las ventanas nativas (`alert`, `confirm`, `prompt`).
- 2026-08: Transformación del módulo de horarios a grilla semanal matricial donde la administración organiza únicamente materias existentes por día y turno horario.
- 2026-08: Integración del módulo de Asistente IA de aclaración de dudas para responder consultas escolares y responder estrictamente que no está calificada ante preguntas fuera de alcance.

## 7. Buenas Prácticas

- Documentar las decisiones técnicas explicando el porqué y no solo el qué.
- Mantener mensajes de commit bajo la convención Conventional Commits.
- Verificar la sintaxis de cada archivo JavaScript antes de confirmar cambios (`node --check`).
- Priorizar la accesibilidad (contraste, etiquetas y navegación por teclado) en cada vista nueva.