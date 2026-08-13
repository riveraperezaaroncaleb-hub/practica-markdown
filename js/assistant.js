/**
 * assistant.js — Módulo de aclaración de dudas (Asistente IA Escolar).
 *
 * Responde preguntas relacionadas con el funcionamiento de la Intranet Escolar y
 * temas institucionales (calificaciones, horarios, comunicados, asistencia, perfiles, roles).
 * Para cualquier consulta fuera de tema o no reconocida, responde estrictamente:
 * "No estoy calificada para responder dicha pregunta."
 */
const Assistant = (function () {
  'use strict';

  const FALLBACK_MESSAGE = 'No estoy calificada para responder dicha pregunta.';

  const KNOWLEDGE_BASE = [
    {
      id: 'grades',
      keywords: ['calificaciones', 'calificacion', 'notas', 'nota', 'boletin', 'boletines', 'promedio', 'rendimiento', 'evaluacion'],
      answer: 'Para consultar o gestionar calificaciones:\n- **Estudiantes/Familias**: Ve a la sección **Calificaciones** (`#/grades`) para revisar tu promedio y notas por materia y período.\n- **Docentes y Administración**: En esa misma sección podés seleccionar curso, materia y registrar o editar notas (entre 0 y 100).'
    },
    {
      id: 'schedule',
      keywords: ['horario', 'horarios', 'clase', 'clases', 'dias', 'turno', 'turnos', 'materia', 'materias', 'grilla', 'semana'],
      answer: 'Para consultar los horarios de clases:\n- Accedé a la sección **Horario** (`#/schedule`) desde el menú lateral.\n- Visualizarás la grilla semanal de Lunes a Viernes con los turnos y materias asignadas.\n- La Administración organiza los horarios utilizando las materias del plan de estudio.'
    },
    {
      id: 'notices',
      keywords: ['comunicado', 'comunicados', 'aviso', 'avisos', 'noticia', 'noticias', 'novedad', 'novedades', 'publicar', 'anuncio'],
      answer: 'Sobre el tablón de comunicados:\n- Ingresá a la sección **Comunicados** (`#/notices`).\n- Muestra noticias publicadas según tu rol (Comunidad general, Docentes o Estudiantes/Familias).\n- Administración y Docentes pueden redactar nuevos avisos o eliminar comunicados existentes.'
    },
    {
      id: 'attendance',
      keywords: ['asistencia', 'inasistencia', 'inasistencias', 'falta', 'faltas', 'presente', 'ausente', 'asistir'],
      answer: 'Gestión y consulta de asistencia:\n- Ingresá a la sección **Asistencia** (`#/attendance`).\n- **Estudiantes**: Consultan su porcentaje global de asistencia y el historial por materia.\n- **Docentes/Administración**: Registran si cada estudiante estuvo presente o ausente en una fecha determinada.'
    },
    {
      id: 'profile',
      keywords: ['perfil', 'contraseña', 'clave', 'password', 'correo', 'email', 'nombre', 'datos', 'cambiar contraseña'],
      answer: 'Para modificar tus datos o contraseña:\n- Dirígete a **Mi perfil** (`#/profile`).\n- Podés actualizar tu nombre completo y correo electrónico.\n- Para cambiar tu contraseña, ingresá tu clave actual seguida de la nueva contraseña.'
    },
    {
      id: 'users',
      keywords: ['usuario', 'usuarios', 'roles', 'rol', 'alta', 'baja', 'crear usuario', 'desactivar', 'administracion', 'permisos'],
      answer: 'Gestión de usuarios y permisos (RBAC):\n- La sección **Usuarios** (`#/users`) está reservada exclusivamente para **Administración**.\n- Los roles del sistema son: **Administración** (acceso total), **Docentes** (calificaciones, asistencia y comunicados) y **Estudiantes/Familias** (consultas académicas).'
    },
    {
      id: 'demo',
      keywords: ['demo', 'demostracion', 'cuentas', 'ingresar', 'clave admin', 'usuario admin', 'reset', 'restablecer'],
      answer: 'Cuentas de prueba del prototipo:\n- **Administración**: usuario `admin` / contraseña `12345`\n- **Docentes**: usuario `docente` / contraseña `docente123`\n- **Estudiantes/Familias**: usuario `estudiante` / contraseña `estudiante123`\n- Podés restablecer todos los datos iniciales con el botón **Restablecer datos de demo** en el pie de página.'
    },
    {
      id: 'intranet',
      keywords: ['intranet', 'colegio', 'escuela', 'institucion', 'institucional', 'que es', 'objetivo', 'sistema', 'aclaracion', 'dudas', 'ayuda'],
      answer: 'La **Intranet Escolar** es una plataforma pensada para colegios públicos que centraliza la comunicación y la gestión académica entre la dirección, los docentes, los estudiantes y sus familias de forma segura y accesible.'
    },
    {
      id: 'security',
      keywords: ['seguridad', 'hash', 'sha256', 'sal', 'privacidad', 'proteccion', 'datos personales'],
      answer: 'Medidas de seguridad:\n- Ninguna contraseña se almacena en texto plano; se utiliza hash **SHA-256 con sal** (RNF-02).\n- No se exponen datos personales ni sensibles de estudiantes menores de edad en el sistema.'
    }
  ];

  function normalize(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  }

  function ask(question) {
    const clean = normalize(question);
    if (!clean) {
      return 'Por favor, escribí una pregunta para que pueda ayudarte.';
    }

    const words = clean.split(/\s+/).filter(function (w) { return w.length > 2; });
    let bestMatch = null;
    let maxScore = 0;

    KNOWLEDGE_BASE.forEach(function (item) {
      let score = 0;
      item.keywords.forEach(function (kw) {
        const cleanKw = normalize(kw);
        if (clean.indexOf(cleanKw) !== -1) {
          score += 3;
        } else {
          words.forEach(function (w) {
            if (cleanKw.indexOf(w) !== -1 || w.indexOf(cleanKw) !== -1) {
              score += 1;
            }
          });
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    });

    if (maxScore >= 2 && bestMatch) {
      return bestMatch.answer;
    }

    return FALLBACK_MESSAGE;
  }

  function getSuggestedQuestions() {
    return [
      '¿Cómo consulto mis calificaciones?',
      '¿Dónde veo los horarios de clases?',
      '¿Quiénes pueden publicar comunicados?',
      '¿Cómo se registra la asistencia?',
      '¿Cuáles son los roles del sistema?',
      '¿Cómo cambio mi contraseña?',
      '¿Cómo se hace un pastel de chocolate?'
    ];
  }

  return {
    ask: ask,
    getSuggestedQuestions: getSuggestedQuestions,
    FALLBACK_MESSAGE: FALLBACK_MESSAGE
  };
})();
