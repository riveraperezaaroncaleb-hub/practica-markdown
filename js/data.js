/**
 * data.js — Capa de persistencia sobre localStorage.
 *
 * Almacena el estado del prototipo y, si no existe, carga una semilla
 * con datos 100% ficticios de demostración. No se incluye información
 * sensible ni datos reales de personas menores de edad (RNF-02).
 */
const DB = (function () {
  'use strict';

  const DB_KEY = 'intranetEscolarDB_v2';
  const SESSION_KEY = 'intranetEscolarSession_v1';

  const ROLES = {
    admin: 'Administración',
    teacher: 'Docentes',
    student: 'Estudiantes / Familias'
  };

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function randomSalt() {
    return SHA256(Date.now().toString() + Math.random().toString()).slice(0, 16);
  }

  function seed() {
    const salt = randomSalt();
    const now = new Date().toISOString();

    return {
      adminCredentialVersion: 2,
      users: [
        {
          id: 'u-admin',
          username: 'admin',
          fullName: 'Dirección Administrativa',
          email: 'admin@institucion.edu',
          role: 'admin',
          course: '',
          active: true,
          salt: salt,
          passwordHash: hashPassword(salt, '12345')
        },
        {
          id: 'u-doc1',
          username: 'docente',
          fullName: 'Prof. Ana López',
          email: 'ana.lopez@institucion.edu',
          role: 'teacher',
          course: 'Matemática',
          active: true,
          salt: salt,
          passwordHash: hashPassword(salt, 'docente123')
        },
        {
          id: 'u-doc2',
          username: 'docente2',
          fullName: 'Prof. Carlos Pérez',
          email: 'carlos.perez@institucion.edu',
          role: 'teacher',
          course: 'Lengua',
          active: true,
          salt: salt,
          passwordHash: hashPassword(salt, 'docente123')
        },
        {
          id: 'u-est1',
          username: 'estudiante',
          fullName: 'Estudiante Ejemplo',
          email: 'familia@institucion.edu',
          role: 'student',
          course: '5° A',
          active: true,
          salt: salt,
          passwordHash: hashPassword(salt, 'estudiante123')
        }
      ],
      subjects: [
        { id: 's-mat', name: 'Matemática', course: '5° A' },
        { id: 's-len', name: 'Lengua', course: '5° A' },
        { id: 's-cn', name: 'Ciencias Naturales', course: '5° A' },
        { id: 's-his', name: 'Historia', course: '5° A' }
      ],
      grades: [
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-mat', period: 1, value: 80 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-mat', period: 2, value: 90 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-len', period: 1, value: 70 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-len', period: 2, value: 80 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-cn', period: 1, value: 90 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-cn', period: 2, value: 100 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-his', period: 1, value: 60 },
        { id: uid('g'), studentId: 'u-est1', subjectId: 's-his', period: 2, value: 70 }
      ],
      attendance: [
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-mat', date: '2026-08-03', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-mat', date: '2026-08-04', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-mat', date: '2026-08-05', present: false },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-len', date: '2026-08-03', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-len', date: '2026-08-04', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-len', date: '2026-08-05', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-cn', date: '2026-08-03', present: false },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-cn', date: '2026-08-04', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-his', date: '2026-08-03', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-his', date: '2026-08-04', present: true },
        { id: uid('a'), studentId: 'u-est1', subjectId: 's-his', date: '2026-08-05', present: true }
      ],
      notices: [
        {
          id: uid('n'),
          title: 'Bienvenidos al ciclo lectivo 2026',
          body: 'Comunicamos a toda la comunidad que el ciclo lectivo 2026 ya está en curso. El calendario académico y los horarios están disponibles en la sección correspondiente.',
          audience: 'all',
          authorId: 'u-admin',
          createdAt: now
        },
        {
          id: uid('n'),
          title: 'Reunión de docentes',
          body: 'Se convoca a todos los docentes a la reunión mensual del día 15 en el SUM. Confirmar asistencia con la preceptoría.',
          audience: 'teacher',
          authorId: 'u-admin',
          createdAt: now
        },
        {
          id: uid('n'),
          title: 'Consulta de boletines',
          body: 'Recordamos a las familias que los boletines del primer trimestre ya pueden consultarse en la intranet.',
          audience: 'student',
          authorId: 'u-doc1',
          createdAt: now
        }
      ],
      schedule: [
        { id: uid('sch'), course: '5° A', day: 'Lunes', time: '08:00', subjectId: 's-mat' },
        { id: uid('sch'), course: '5° A', day: 'Lunes', time: '10:00', subjectId: 's-len' },
        { id: uid('sch'), course: '5° A', day: 'Martes', time: '08:00', subjectId: 's-cn' },
        { id: uid('sch'), course: '5° A', day: 'Martes', time: '10:00', subjectId: 's-his' },
        { id: uid('sch'), course: '5° A', day: 'Miércoles', time: '08:00', subjectId: 's-mat' },
        { id: uid('sch'), course: '5° A', day: 'Miércoles', time: '10:00', subjectId: 's-len' },
        { id: uid('sch'), course: '5° A', day: 'Jueves', time: '08:00', subjectId: 's-cn' },
        { id: uid('sch'), course: '5° A', day: 'Viernes', time: '08:00', subjectId: 's-his' }
      ]
    };
  }

  function load() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      try {
        const db = JSON.parse(raw);
        migrateAdminCredentials(db);
        return db;
      } catch (e) {
        localStorage.removeItem(DB_KEY);
      }
    }
    const db = seed();
    save(db);
    return db;
  }

  function save(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function migrateAdminCredentials(db) {
    if (db.adminCredentialVersion === 2) {
      return;
    }
    const admin = db.users.find(function (user) {
      return user.id === 'u-admin' && user.username === 'admin' && user.role === 'admin';
    });
    if (admin) {
      admin.salt = randomSalt();
      admin.passwordHash = hashPassword(admin.salt, '12345');
    }
    db.adminCredentialVersion = 2;
    save(db);
  }

  function get() {
    return load();
  }

  function set(updater) {
    const db = get();
    updater(db);
    save(db);
    return db;
  }

  function resetDemo() {
    localStorage.removeItem(DB_KEY);
    const db = seed();
    save(db);
    return db;
  }

  return {
    ROLES: ROLES,
    uid: uid,
    randomSalt: randomSalt,
    get: get,
    save: save,
    set: set,
    resetDemo: resetDemo,
    SESSION_KEY: SESSION_KEY
  };
})();
