# Changelog

Registro cronológico de versiones, cambios y correcciones del sistema. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y versionado semántico.

## [Unreleased]

- Pendiente: mover autenticación a un backend con sesiones HTTP.
- Pendiente: reemplazar SHA-256 local por bcrypt/argon2 en el servidor.
- Pendiente: persistencia en base de datos (SQLite/PostgreSQL).

## [0.1.0] — 2026-08-12

### Agregado

- Inicio de sesión diferenciado por rol: Administración, Docentes y Estudiantes/Familias (RF-01).
- Módulo de gestión de usuarios con alta, edición, baja y restablecimiento de contraseña (RF-02).
- Módulo académico con carga y consulta de calificaciones por materia y período (RF-03).
- Registro y consulta de asistencia por materia y fecha (RF-03).
- Tablón de comunicados con visibilidad según el rol del usuario (RF-04).
- Vistas restringidas según permisos: el menú se filtra por rol (RF-05).
- Perfil de usuario funcional: edición de nombre y correo y cambio de contraseña con verificación de la actual.
- Menú hamburguesa funcional en pantallas pequeñas, con cierre por teclado (tecla Esc).
- Horario por curso visible para administración y estudiantes/familias.
- Contraseñas almacenadas como hash SHA-256 con sal aleatoria (RNF-02).
- Accesibilidad básica: contraste AA, etiquetas explícitas, foco visible y navegación por teclado (RNF-01).
- Semilla de datos de demostración con información 100 % ficticia.

### Corregido

- Padding de la longitud del mensaje en la implementación de SHA-256 (la longitud se codificaba en 32 bits en lugar de 64).

### Documentación

- Agregado `README.md` con guía de instalación y ejemplos de uso.
- Agregado `CONTRIBUTING.md` con políticas de ramas, commits y Pull Requests.
- Agregado `CHANGELOG.md` (este archivo).
- Agregado `AGENTS.md` con la memoria del agente en 7 secciones.
- Agregado `docs/arquitectura.md` y `docs/requerimientos.md`.

[0.1.0]: https://github.com/usuario/intranet-escolar/releases/tag/v0.1.0
