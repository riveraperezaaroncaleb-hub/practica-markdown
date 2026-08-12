/**
 * auth.js — Autenticación y control de acceso basado en roles (RBAC).
 *
 * RF-01: inicio de sesión diferenciado por rol.
 * RF-05: vistas restringidas según permisos.
 * RNF-02: las contraseñas se comparan contra su hash, nunca en texto plano.
 */
const Auth = (function () {
  'use strict';

  function login(username, password) {
    const db = DB.get();
    const user = db.users.find(function (u) {
      return u.username.toLowerCase() === username.trim().toLowerCase();
    });

    if (!user || !user.active) {
      return { ok: false, message: 'Usuario inexistente o desactivado.' };
    }

    const attempt = hashPassword(user.salt, password);
    if (attempt !== user.passwordHash) {
      return { ok: false, message: 'Contraseña incorrecta.' };
    }

    localStorage.setItem(DB.SESSION_KEY, JSON.stringify({ userId: user.id, loggedAt: new Date().toISOString() }));
    return { ok: true, user: publicUser(user) };
  }

  function logout() {
    localStorage.removeItem(DB.SESSION_KEY);
  }

  function currentUser() {
    const raw = localStorage.getItem(DB.SESSION_KEY);
    if (!raw) {
      return null;
    }
    let session;
    try {
      session = JSON.parse(raw);
    } catch (e) {
      return null;
    }
    const db = DB.get();
    const user = db.users.find(function (u) {
      return u.id === session.userId;
    });
    if (!user || !user.active) {
      return null;
    }
    return publicUser(user);
  }

  function publicUser(user) {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      course: user.course || ''
    };
  }

  /**
   * Permisos de navegación por rol. Cada clave es el id de una vista.
   * 'owner' habilita solo al usuario propietario (estudiantes).
   */
  const PERMISSIONS = {
    dashboard: ['admin', 'teacher', 'student'],
    notices: ['admin', 'teacher', 'student'],
    grades: ['admin', 'teacher', 'student'],
    attendance: ['admin', 'teacher', 'student'],
    schedule: ['admin', 'student'],
    users: ['admin'],
    profile: ['admin', 'teacher', 'student']
  };

  function canAccess(viewId, role) {
    const allowed = PERMISSIONS[viewId];
    return !!allowed && allowed.indexOf(role) !== -1;
  }

  function allowedViews(role) {
    return Object.keys(PERMISSIONS).filter(function (v) {
      return canAccess(v, role);
    });
  }

  return {
    login: login,
    logout: logout,
    currentUser: currentUser,
    canAccess: canAccess,
    allowedViews: allowedViews
  };
})();
