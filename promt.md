# Especificación Técnica y Guía de Proyecto: Intranet Escolar

Este documento contiene la especificación completa, la estructura de archivos, el plan de desarrollo y las pautas para la construcción del prototipo de la **Intranet Escolar para una Institución Pública**[cite: 1], así como la documentación técnica requerida expresada en **GitHub Flavored Markdown (GFM)**[cite: 1].

---

## 1. Visión General del Proyecto

### 1.1 Objetivo
Construir un prototipo funcional de intranet web para un colegio o escuela pública, permitiendo la gestión de información académica, avisos, usuarios y roles[cite: 1]. El proyecto prioriza la calidad técnica y la rigurosidad en la documentación en Markdown[cite: 1].

### 1.2 Audiencia y Perfiles de Usuario
* **Administración:** Gestión de usuarios (altas, bajas, cambios) y configuración global[cite: 1].
* **Docentes:** Registro e ingreso de calificaciones, control de asistencia y publicación de comunicados[cite: 1].
* **Estudiantes y Familias:** Consulta de calificaciones, asistencias, horarios y boletines oficiales[cite: 1].

---

## 2. Requerimientos del Sistema

### 2.1 Requerimientos Funcionales (RF)
* **RF-01 (Autenticación y Roles):** Inicio de sesión diferenciado para Administración, Docentes y Estudiantes/Familias[cite: 1].
* **RF-02 (Gestión de Usuarios):** Módulo para crear, editar y dar de baja usuarios del sistema[cite: 1].
* **RF-03 (Módulo Académico):** Registro y visualización de notas y/o asistencia por materia/curso[cite: 1].
* **RF-04 (Tablón de Comunicados):** Publicación de circulares y avisos oficiales visibles según el rol del usuario[cite: 1].
* **RF-05 (Vistas Restringidas):** Filtrado de interfaz y accesos de acuerdo con los permisos asignados[cite: 1].

### 2.2 Requerimientos No Funcionales (RNF)
* **RNF-01 (Accesibilidad):** Cumplimiento de contraste adecuado, etiquetas explícitas y soporte para navegación por teclado[cite: 1].
* **RNF-02 (Protección de Datos):** Ocultamiento de información sensible de menores y almacenamiento seguro de credenciales (contraseñas encriptadas/hacheadas)[cite: 1].
* **RNF-03 (Control de Versiones):** Historial progresivo de commits en Git desde el inicio de la implementación[cite: 1].

---

## 3. Estructura de Documentación (.md)

El repositorio debe organizar y mantener actualizados los siguientes archivos de documentación[cite: 1]:

| Archivo | Ubicación | Descripción |
| :--- | :--- | :--- |
| `README.md` | Raíz | Presentación del proyecto, guía de instalación paso a paso, ejemplos de uso y licencia[cite: 1]. |
| `CONTRIBUTING.md` | Raíz | Guía de colaboración: flujos de trabajo, políticas de ramas, commits y Pull Requests[cite: 1]. |
| `CHANGELOG.md` | Raíz | Registro cronológico de versiones, cambios y correcciones del sistema[cite: 1]. |
| `CLAUDE.md` / `AGENTS.md` | Raíz | Archivo de memoria para asistencia de IA (7 secciones obligatorias)[cite: 1]. |
| `arquitectura.md` | `docs/` | Decisiones de diseño técnico, stack tecnológico y diagramas del sistema[cite: 1]. |
| `requerimientos.md` | `docs/` | Listas de verificación de historias de usuario y tareas técnicas[cite: 1]. |

---

## 4. Estándares y Reglas de Formato Markdown

Para asegurar coherencia y legibilidad en crudo (raw), todo archivo `.md` debe cumplir con[cite: 1]:

1. **Encabezados:** Únicamente un `#` (H1) por archivo[cite: 1]. Usar `##` (H2) y `###` (H3) para subsecciones[cite: 1].
2. **Listas no ordenadas:** Utilizar exclusivamente el guion `-` para mantener uniformidad[cite: 1].
3. **Listas de tareas:** Usar el formato `- [ ]` (pendiente) y `- [x]` (completado)[cite: 1].
4. **Bloques de código:** Especificar el lenguaje explícito (ejemplo: ```javascript, ```sql, ```bash)[cite: 1].
5. **Imágenes:** Incluir siempre texto alternativo comprensible (`![Descripción de la imagen](ruta/imagen.png)`)[cite: 1].
6. **Espaciado:** Mantener una línea en blanco entre bloques de texto, títulos y listas para facilitar la lectura sin renderizar[cite: 1].

---

## 5. Especificación del Archivo de Memoria para IA (`CLAUDE.md`)

El archivo `CLAUDE.md` o `AGENTS.md` actúa como contexto para asistentes de código y debe contener las siguientes 7 secciones[cite: 1]:

```markdown
# CLAUDE.md — Memoria del Agente

## 1. Contexto
Intranet escolar para un colegio público. Permite la comunicación y consulta académica entre administración, docentes, estudiantes y familias.

## 2. Requerimientos
- Sistema de autenticación con control de acceso basado en roles (RBAC).
- Módulo de carga y consulta de calificaciones.
- Tablón de avisos y noticias institucionales.

## 3. Reglas de Código
- Nombres de archivos y variables en inglés usando camelCase.
- Uso de componentes funcionales y modulares.
- Cada commit debe asociarse a un cambio específico y probado.

## 4. Restricciones
- NO exponer datos personales o sensibles de estudiantes menores de edad en la interfaz.
- NO almacenar contraseñas en texto plano bajo ninguna circunstancia.

## 5. Objetivos
- Prototipo funcional ejecutable localmente.
- Cobertura completa de la documentación técnica en la carpeta docs/.

## 6. Memoria del Proyecto
- 2026-03: Definición del modelo de roles (Administrador, Docente, Estudiante/Familia).
- 2026-03: Adopción del estándar GitHub Flavored Markdown (GFM) para toda la documentación.

## 7. Buenas Prácticas
- Documentar las decisiones técnicas explicando el porqué y no solo el qué.
- Mantener mensajes de commit bajo la convención Conventional Commits.