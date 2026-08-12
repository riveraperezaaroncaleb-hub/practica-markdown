/**
 * app.js — Punto de entrada, sesión y ruteo de la intranet.
 *
 * Flujo: si hay sesión activa se muestra la aplicación, si no el login.
 * La navegación se controla con el hash de la URL (#/vista).
 */
(function () {
  'use strict';

  var app = document.getElementById('app');

  var NAV = [
    { id: 'dashboard', label: 'Inicio', icon: '⌂' },
    { id: 'notices', label: 'Comunicados', icon: '✉' },
    { id: 'grades', label: 'Calificaciones', icon: '✓' },
    { id: 'attendance', label: 'Asistencia', icon: '☑' },
    { id: 'schedule', label: 'Horario', icon: '◷' },
    { id: 'users', label: 'Usuarios', icon: '⚙' },
    { id: 'profile', label: 'Mi perfil', icon: '◉' }
  ];

  function currentHash() {
    return (window.location.hash || '#/dashboard').replace(/^#\//, '');
  }

  function navigate(viewId) {
    if (viewId === 'login') {
      window.location.hash = '#/dashboard';
      return;
    }
    window.location.hash = '#/' + viewId;
  }

  function showLogin() {
    app.innerHTML =
      '<main class="login-wrap">' +
      '<section class="card login-card" aria-labelledby="login-title">' +
      '<h1 id="login-title">Intranet Escolar</h1>' +
      '<p class="muted">Institución pública · Acceso según rol (RF-01)</p>' +
      '<form id="login-form">' +
      '<div class="field">' +
      '<label for="login-user">Usuario</label>' +
      '<input type="text" id="login-user" autocomplete="username" required autofocus aria-describedby="login-help">' +
      '</div>' +
      '<div class="field">' +
      '<label for="login-pass">Contraseña</label>' +
      '<input type="password" id="login-pass" autocomplete="current-password" required>' +
      '</div>' +
      '<p id="login-msg" class="form-msg" role="alert" aria-live="polite"></p>' +
      '<button type="submit" class="btn btn-primary btn-block">Ingresar</button>' +
      '</form>' +
      '<p id="login-help" class="muted">Cuentas de demostración (solo datos ficticios):</p>' +
      '<ul class="demo-accounts">' +
      '<li>admin / 12345 — Administración</li>' +
      '<li>docente / docente123 — Docentes</li>' +
      '<li>estudiante / estudiante123 — Estudiantes / Familias</li>' +
      '</ul>' +
      '<p class="muted">' +
      '<button type="button" class="link-like" id="btn-reset-login">Restablecer datos de demo</button>' +
      '</p>' +
      '</section>' +
      '</main>';

    document.getElementById('btn-reset-login').addEventListener('click', function () {
      if (window.confirm('Se restablecerán las cuentas de demostración y se perderán los cambios locales. ¿Continuar?')) {
        DB.resetDemo();
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
        document.getElementById('login-msg').textContent = 'Datos restablecidos. Probá con admin / 12345.';
      }
    });

    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('login-msg');
      var result = Auth.login(
        document.getElementById('login-user').value,
        document.getElementById('login-pass').value
      );
      if (result.ok) {
        msg.textContent = '';
        navigate('dashboard');
        showApp();
      } else {
        msg.textContent = result.message;
      }
    });
  }

  function showApp() {
    var user = Auth.currentUser();
    if (!user) {
      showLogin();
      return;
    }

    var allowed = Auth.allowedViews(user.role);
    var links = NAV
      .filter(function (item) {
        return allowed.indexOf(item.id) !== -1;
      })
      .map(function (item) {
        return '<a class="nav-link" href="#/' + item.id + '" data-view="' + item.id + '">' +
          '<span class="nav-icon" aria-hidden="true">' + item.icon + '</span>' +
          esc(item.label) + '</a>';
      })
      .join('');

    app.innerHTML =
      '<header class="topbar">' +
      '<a class="skip-link" href="#main">Saltar al contenido</a>' +
      '<div class="brand-wrap">' +
      '<button type="button" class="hamburger" id="btn-menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav">' +
      '<span class="hamburger-bar" aria-hidden="true"></span>' +
      '<span class="hamburger-bar" aria-hidden="true"></span>' +
      '<span class="hamburger-bar" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="brand"><span class="brand-mark" aria-hidden="true">IE</span> Intranet Escolar</div>' +
      '</div>' +
      '<div class="session">' +
      '<span class="session-user">' + esc(user.fullName) + ' · ' + esc(DB.ROLES[user.role]) + '</span>' +
      '<button type="button" class="btn btn-outline btn-sm" id="btn-logout">Salir</button>' +
      '</div>' +
      '</header>' +
      '<div class="layout">' +
      '<nav class="sidebar" id="main-nav" aria-label="Menú principal">' + links + '</nav>' +
      '<main id="main" class="content" tabindex="-1"></main>' +
      '</div>' +
      '<footer class="footer">' +
      '<p class="muted">Prototipo de demostración · Sin datos reales · <button type="button" class="link-like" id="btn-reset">Restablecer datos de demo</button></p>' +
      '</footer>';

    document.getElementById('btn-menu').addEventListener('click', function () {
      var sidebar = document.getElementById('main-nav');
      var btn = document.getElementById('btn-menu');
      var isOpen = sidebar.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    document.getElementById('btn-menu').addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var sidebar = document.getElementById('main-nav');
        if (sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          var btn = document.getElementById('btn-menu');
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', 'Abrir menú');
          btn.focus();
        }
      }
    });

    app.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('.nav-link') : null;
      var sidebar = document.getElementById('main-nav');
      if (link && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        var btn = document.getElementById('btn-menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menú');
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var sidebar = document.getElementById('main-nav');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
          var btn = document.getElementById('btn-menu');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Abrir menú');
          }
        }
      }
    });

    document.addEventListener('user:updated', function () {
      var fresh = Auth.currentUser();
      var label = document.querySelector('.session-user');
      if (fresh && label) {
        label.textContent = fresh.fullName + ' · ' + DB.ROLES[fresh.role];
      }
    });

    document.getElementById('btn-logout').addEventListener('click', function () {
      Auth.logout();
      window.location.hash = '';
      showLogin();
    });

    document.getElementById('btn-reset').addEventListener('click', function () {
      if (window.confirm('Se perderán los cambios y se restaurará la demo inicial. ¿Continuar?')) {
        DB.resetDemo();
        window.location.hash = '';
        Auth.logout();
        showLogin();
      }
    });

    var main = document.getElementById('main');
    var viewId = currentHash();
    if (!Auth.canAccess(viewId, user.role)) {
      viewId = 'dashboard';
    }
    renderView(viewId, main, user);
  }

  function renderView(viewId, main, user) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === viewId);
    });
    main.setAttribute('aria-label', 'Sección ' + viewId);
    Views.render(viewId, main, user);
    main.focus({ preventScroll: false });
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.addEventListener('hashchange', function () {
    var user = Auth.currentUser();
    if (!user) {
      return;
    }
    var viewId = currentHash();
    if (!Auth.canAccess(viewId, user.role)) {
      viewId = 'dashboard';
      window.location.hash = '#/dashboard';
      return;
    }
    renderView(viewId, document.getElementById('main'), user);
  });

  function boot() {
    if (Auth.currentUser()) {
      if (!window.location.hash) {
        window.location.hash = '#/dashboard';
      }
      showApp();
    } else {
      showLogin();
    }
  }

  boot();
})();
