/**
 * views.js — Renderizado de las vistas de la intranet.
 *
 * RF-04: tablón de comunicados con visibilidad por rol.
 * RF-05: cada rol solo ve y edita las secciones que le corresponden.
 * RNF-01: etiquetas explícitas, contraste y navegación por teclado.
 */
const Views = (function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtDate(iso) {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function badge(status) {
    return status
      ? '<span class="badge badge-ok">Activo</span>'
      : '<span class="badge badge-off">Inactivo</span>';
  }

  function gradeClass(value) {
    if (value >= 70) {
      return 'grade-good';
    }
    if (value >= 40) {
      return 'grade-mid';
    }
    return 'grade-bad';
  }

  function subjectName(db, id) {
    const sub = db.subjects.find(function (s) {
      return s.id === id;
    });
    return sub ? sub.name : '—';
  }

  function fullName(db, id) {
    const u = db.users.find(function (x) {
      return x.id === id;
    });
    return u ? u.fullName : '—';
  }

  function students(db) {
    return db.users.filter(function (u) {
      return u.role === 'student' && u.active;
    });
  }

  function getGrade(db, studentId, subjectId, period) {
    const g = db.grades.find(function (x) {
      return x.studentId === studentId && x.subjectId === subjectId && x.period === period;
    });
    return g ? g.value : null;
  }

  function setGrade(db, studentId, subjectId, period, value) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return false;
    }
    const existing = db.grades.find(function (x) {
      return x.studentId === studentId && x.subjectId === subjectId && x.period === period;
    });
    if (existing) {
      existing.value = value;
    } else {
      db.grades.push({ id: DB.uid('g'), studentId: studentId, subjectId: subjectId, period: period, value: value });
    }
    return true;
  }

  function averageOf(db, studentId) {
    const list = db.grades.filter(function (g) {
      return g.studentId === studentId;
    });
    if (!list.length) {
      return null;
    }
    const total = list.reduce(function (acc, g) {
      return acc + g.value;
    }, 0);
    return total / list.length;
  }

  function attendanceRate(db, studentId) {
    const list = db.attendance.filter(function (a) {
      return a.studentId === studentId;
    });
    if (!list.length) {
      return null;
    }
    const present = list.filter(function (a) {
      return a.present;
    }).length;
    return Math.round((present / list.length) * 100);
  }

  function noticesFor(db, user) {
    return db.notices
      .filter(function (n) {
        return n.audience === 'all' || n.audience === user.role;
      })
      .sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }

  function render(viewId, container, user) {
    switch (viewId) {
      case 'dashboard':
        viewDashboard(container, user);
        break;
      case 'notices':
        viewNotices(container, user);
        break;
      case 'grades':
        viewGrades(container, user);
        break;
      case 'attendance':
        viewAttendance(container, user);
        break;
      case 'schedule':
        viewSchedule(container, user);
        break;
      case 'users':
        viewUsers(container, user);
        break;
      case 'profile':
        viewProfile(container, user);
        break;
      case 'assistant':
        viewAssistant(container, user);
        break;
      default:
        container.innerHTML = '<p>Vista no encontrada.</p>';
    }
  }

  function viewDashboard(container, user) {
    const db = DB.get();
    const activeStudents = students(db).length;
    let stats = [];

    if (user.role === 'admin') {
      stats = [
        { label: 'Usuarios', value: db.users.length },
        { label: 'Estudiantes activos', value: activeStudents },
        { label: 'Materias', value: db.subjects.length },
        { label: 'Comunicados', value: db.notices.length }
      ];
    } else if (user.role === 'teacher') {
      stats = [
        { label: 'Estudiantes activos', value: activeStudents },
        { label: 'Materias', value: db.subjects.length },
        { label: 'Mis comunicados', value: db.notices.filter(function (n) { return n.authorId === user.id; }).length }
      ];
    } else {
      const avg = averageOf(db, user.id);
      const rate = attendanceRate(db, user.id);
      stats = [
        { label: 'Promedio general', value: avg == null ? '—' : avg.toFixed(2) },
        { label: 'Asistencia', value: rate == null ? '—' : rate + '%' },
        { label: 'Comunicados visibles', value: noticesFor(db, user).length }
      ];
    }

    const recent = noticesFor(db, user).slice(0, 3);
    const quickActions = user.role === 'student'
      ? '<a class="btn btn-primary" href="#/profile">Editar mi perfil</a>'
      : '<a class="btn btn-primary" href="#/notices">Agregar comunicado</a><a class="btn btn-outline" href="#/grades">Editar calificaciones</a><a class="btn btn-outline" href="#/attendance">Editar asistencia</a>' + (user.role === 'admin' ? '<a class="btn btn-outline" href="#/schedule">Agregar horario</a><a class="btn btn-outline" href="#/users">Agregar usuario</a><a class="btn btn-outline" href="#/profile">Editar mi perfil</a>' : '<a class="btn btn-outline" href="#/profile">Editar mi perfil</a>');

    container.innerHTML =
      '<section class="card">' +
      '<h2>Bienvenido, ' + esc(user.fullName) + '</h2>' +
      '<p class="muted">Rol: <strong>' + esc(DB.ROLES[user.role]) + '</strong></p>' +
      '<div class="actions">' + quickActions + '</div>' +
      '<div class="stats-grid">' +
      stats.map(function (s) {
        return '<div class="stat-card"><span class="stat-value">' + esc(s.value) + '</span><span class="stat-label">' + esc(s.label) + '</span></div>';
      }).join('') +
      '</div>' +
      '</section>' +
      '<section class="card">' +
      '<h2>Últimos comunicados</h2>' +
      (recent.length
        ? '<ul class="notice-list">' + recent.map(function (n) {
            return '<li class="notice-item">' +
              '<h3>' + esc(n.title) + '</h3>' +
              '<p class="muted">' + fmtDate(n.createdAt) + ' · Publicado por ' + esc(fullName(db, n.authorId)) + '</p>' +
              '<p>' + esc(n.body) + '</p>' +
              '</li>';
          }).join('') + '</ul>'
        : '<p class="muted">No hay comunicados visibles.</p>') +
      '</section>';
  }

  function viewNotices(container, user) {
    const db = DB.get();
    const list = noticesFor(db, user);
    const canWrite = user.role === 'admin' || user.role === 'teacher';

    container.innerHTML =
      (canWrite
        ? '<section class="card">' +
          '<h2 id="notice-form-title">Publicar comunicado</h2>' +
          '<form id="notice-form">' +
          '<input type="hidden" id="notice-id">' +
          '<div class="field">' +
          '<label for="notice-title">Título</label>' +
          '<input type="text" id="notice-title" required maxlength="120">' +
          '</div>' +
          '<div class="field">' +
          '<label for="notice-body">Mensaje</label>' +
          '<textarea id="notice-body" rows="4" required maxlength="1000"></textarea>' +
          '</div>' +
          '<div class="field">' +
          '<label for="notice-audience">Visible para</label>' +
          '<select id="notice-audience">' +
          '<option value="all">Toda la comunidad</option>' +
          '<option value="student">Solo estudiantes / familias</option>' +
          (user.role === 'admin' ? '<option value="teacher">Solo docentes</option>' : '') +
          '</select>' +
          '</div>' +
          '<div class="actions"><button type="submit" class="btn btn-primary" id="notice-submit">Publicar</button>' +
          '<button type="button" class="btn btn-outline hidden" id="notice-cancel">Cancelar</button></div>' +
          '</form>' +
          '</section>'
        : '') +
      '<section class="card">' +
      '<h2>Tablón de comunicados</h2>' +
      (list.length
        ? '<ul class="notice-list">' + list.map(function (n) {
            const editable = user.role === 'admin' || n.authorId === user.id;
            return '<li class="notice-item">' +
              '<h3>' + esc(n.title) + '</h3>' +
              '<p class="muted">' + fmtDate(n.createdAt) + ' · Publicado por ' + esc(fullName(db, n.authorId)) + ' · Visible para ' + esc(n.audience === 'all' ? 'toda la comunidad' : DB.ROLES[n.audience]) + '</p>' +
              '<p>' + esc(n.body) + '</p>' +
              (editable ? '<div class="actions"><button class="btn btn-outline btn-sm js-edit-notice" data-id="' + esc(n.id) + '">Editar</button><button class="btn btn-danger btn-sm js-del-notice" data-id="' + esc(n.id) + '">Eliminar</button></div>' : '') +
              '</li>';
          }).join('') + '</ul>'
        : '<p class="muted">No hay comunicados visibles.</p>') +
      '</section>';

    if (canWrite) {
      container.querySelector('#notice-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('notice-id').value;
        DB.set(function (dbState) {
          const target = dbState.notices.find(function (notice) { return notice.id === id; });
          if (target) {
            if (user.role !== 'admin' && target.authorId !== user.id) {
              return;
            }
            target.title = document.getElementById('notice-title').value.trim();
            target.body = document.getElementById('notice-body').value.trim();
            target.audience = document.getElementById('notice-audience').value;
            return;
          }
          dbState.notices.push({ id: DB.uid('n'), title: document.getElementById('notice-title').value.trim(), body: document.getElementById('notice-body').value.trim(), audience: document.getElementById('notice-audience').value, authorId: user.id, createdAt: new Date().toISOString() });
        });
        render('notices', container, user);
        Toastify({ text: id ? 'Comunicado actualizado correctamente.' : 'Comunicado publicado correctamente.', className: 'toast-success' }).showToast();
      });

      container.querySelector('#notice-cancel').addEventListener('click', function () { render('notices', container, user); });
      container.querySelectorAll('.js-edit-notice').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const target = db.notices.find(function (notice) { return notice.id === btn.getAttribute('data-id'); });
          if (!target) { return; }
          document.getElementById('notice-id').value = target.id;
          document.getElementById('notice-title').value = target.title;
          document.getElementById('notice-body').value = target.body;
          document.getElementById('notice-audience').value = target.audience;
          document.getElementById('notice-form-title').textContent = 'Editar comunicado';
          document.getElementById('notice-submit').textContent = 'Guardar cambios';
          document.getElementById('notice-cancel').classList.remove('hidden');
          document.getElementById('notice-title').focus();
        });
      });
    }

    const delButtons = container.querySelectorAll('.js-del-notice');
    Array.prototype.forEach.call(delButtons, function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        DB.set(function (dbState) {
          dbState.notices = dbState.notices.filter(function (n) {
            return n.id !== id;
          });
        });
        render('notices', container, user);
        Toastify({ text: 'Comunicado eliminado correctamente.', className: 'toast-success' }).showToast();
      });
    });
  }

  function viewGrades(container, user) {
    const db = DB.get();
    const periods = [1, 2];

    if (user.role === 'student') {
      const rows = db.subjects.map(function (sub) {
        const values = periods.map(function (p) {
          const v = getGrade(db, user.id, sub.id, p);
          return v == null ? '<span class="muted">—</span>' : '<span class="' + gradeClass(v) + '">' + v + '</span>';
        });
        const avg = averageOf(db, user.id);
        return '<tr><td>' + esc(sub.name) + '</td>' + values.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '<td>' + (avg == null ? '—' : avg.toFixed(2)) + '</td></tr>';
      }).join('');
      container.innerHTML =
        '<section class="card">' +
        '<h2>Mis calificaciones</h2>' +
        '<p class="muted">Curso: ' + esc(user.course) + '</p>' +
        '<table class="table"><thead><tr><th>Materia</th><th>Período 1</th><th>Período 2</th><th>Promedio</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
        '</section>';
      return;
    }

    if (user.role === 'admin') {
      const body = db.subjects.map(function (sub) {
        const cells = students(db).map(function (st) {
          const values = periods.map(function (p) {
            const v = getGrade(db, st.id, sub.id, p);
            return v == null ? '—' : v;
          });
          return '<td>' + values.join(' / ') + '</td>';
        }).join('');
        return '<tr><td>' + esc(sub.name) + '</td>' + cells + '</tr>';
      }).join('');
      container.innerHTML =
        '<section class="card">' +
        '<h2>Calificaciones (vista general)</h2>' +
        '<p class="muted">Lectura de todas las materias y estudiantes.</p>' +
        '<table class="table"><thead><tr><th>Materia</th>' + students(db).map(function (st) {
          return '<th>' + esc(st.fullName) + '</th>';
        }).join('') + '</tr></thead><tbody>' + body + '</tbody></table>' +
        '</section>';
    }

    const teacherSubject = db.subjects.find(function (s) {
      return s.name === user.course;
    });
    const defaultGradeSubjectId = teacherSubject ? teacherSubject.id : (db.subjects[0] && db.subjects[0].id);

    const subjectSelect = '<select id="grade-subject">' + db.subjects.map(function (s) {
      return '<option value="' + esc(s.id) + '"' + (s.id === defaultGradeSubjectId ? ' selected' : '') + '>' + esc(s.name) + '</option>';
    }).join('') + '</select>';

    function subjectIdOfCurrentSelection() {
      const sel = container.querySelector('#grade-subject');
      return sel ? sel.value : defaultGradeSubjectId;
    }

    function rowsHtml(subjectId) {
      return students(db).map(function (st) {
        const inputs = periods.map(function (p) {
          const v = getGrade(db, st.id, subjectId, p);
          return '<td><label class="sr-only" for="g-' + esc(st.id) + '-' + p + '">Nota período ' + p + ' de ' + esc(st.fullName) + '</label>' +
            '<input type="number" id="g-' + esc(st.id) + '-' + p + '" class="grade-input" data-student="' + esc(st.id) + '" data-period="' + p + '" min="0" max="100" step="1" value="' + (v == null ? '' : v) + '"></td>';
        }).join('');
        return '<tr><td>' + esc(st.fullName) + '</td>' + inputs + '</tr>';
      }).join('');
    }

    container.innerHTML =
      '<section class="card">' +
      '<h2>Carga de calificaciones</h2>' +
      '<div class="field"><label for="grade-subject">Materia</label>' + subjectSelect + '</div>' +
      '<table class="table"><thead><tr><th>Estudiante</th><th>Período 1</th><th>Período 2</th></tr></thead>' +
      '<tbody>' + rowsHtml(defaultGradeSubjectId) + '</tbody></table>' +
      '<button type="button" class="btn btn-primary" id="grade-save">Guardar calificaciones</button>' +
      '</section>';

    container.querySelector('#grade-save').addEventListener('click', function () {
      const subjectId = subjectIdOfCurrentSelection();
      let invalidGrade = false;
      container.querySelectorAll('.grade-input').forEach(function (input) {
        const value = parseFloat(input.value);
        if (input.value !== '' && (isNaN(value) || value < 0 || value > 100)) {
          invalidGrade = true;
        }
      });
      if (invalidGrade) {
        Toastify({ text: 'Cada calificación debe estar entre 0 y 100.', className: 'toast-error' }).showToast();
        return;
      }
      DB.set(function (dbState) {
        container.querySelectorAll('.grade-input').forEach(function (input) {
          const value = parseFloat(input.value);
          if (!isNaN(value)) {
            setGrade(dbState, input.getAttribute('data-student'), subjectId, parseInt(input.getAttribute('data-period'), 10), value);
          }
        });
      });
      render('grades', container, user);
      Toastify({ text: 'Calificaciones guardadas correctamente.', className: 'toast-success' }).showToast();
    });

    container.querySelector('#grade-subject').addEventListener('change', function () {
      const tbody = container.querySelector('.table tbody');
      if (tbody) {
        tbody.innerHTML = rowsHtml(subjectIdOfCurrentSelection());
      }
    });
  }

  function viewAttendance(container, user) {
    const db = DB.get();

    if (user.role === 'student') {
      const days = db.attendance.filter(function (a) {
        return a.studentId === user.id;
      }).sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
      });
      const rows = days.map(function (a) {
        return '<tr><td>' + esc(a.date) + '</td><td>' + esc(subjectName(db, a.subjectId)) + '</td><td>' +
          (a.present ? '<span class="badge badge-ok">Presente</span>' : '<span class="badge badge-off">Ausente</span>') + '</td></tr>';
      }).join('');
      const rate = attendanceRate(db, user.id);
      container.innerHTML =
        '<section class="card">' +
        '<h2>Mi asistencia</h2>' +
        '<p class="muted">Asistencia total: ' + (rate == null ? '—' : rate + '%') + '</p>' +
        (rows ? '<table class="table"><thead><tr><th>Fecha</th><th>Materia</th><th>Estado</th></tr></thead><tbody>' + rows + '</tbody></table>'
              : '<p class="muted">Sin registros.</p>') +
        '</section>';
      return;
    }

    const teacherSubject = db.subjects.find(function (s) {
      return s.name === user.course;
    });
    const defaultSubjectId = teacherSubject ? teacherSubject.id : (db.subjects[0] && db.subjects[0].id);

    const subjectSelect = '<select id="att-subject">' + db.subjects.map(function (s) {
      return '<option value="' + esc(s.id) + '"' + (s.id === defaultSubjectId ? ' selected' : '') + '>' + esc(s.name) + '</option>';
    }).join('') + '</select>';

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (user.role === 'admin') {
      const rows = students(db).map(function (st) {
        return '<tr><td>' + esc(st.fullName) + '</td><td>' + (attendanceRate(db, st.id) == null ? '—' : attendanceRate(db, st.id) + '%') + '</td></tr>';
      }).join('');
      container.innerHTML =
        '<section class="card">' +
        '<h2>Asistencia (resumen por estudiante)</h2>' +
        '<table class="table"><thead><tr><th>Estudiante</th><th>Asistencia total</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '</section>';
      return;
    }

    function currentSelection() {
      const sel = container.querySelector('#att-subject');
      return sel ? sel.value : defaultSubjectId;
    }

    function rowsHtml(subjectId, dateStr) {
      const existing = {};
      db.attendance.forEach(function (a) {
        if (a.subjectId === subjectId && a.date === dateStr) {
          existing[a.studentId] = a.present;
        }
      });
      return students(db).map(function (st) {
        const checked = existing[st.id] === false ? '' : ' checked';
        const known = existing.hasOwnProperty(st.id) ? existing[st.id] : true;
        const state = known ? 'Presente' : 'Ausente';
        return '<tr><td>' + esc(st.fullName) + '</td><td>' +
          '<label class="sr-only" for="att-' + esc(st.id) + '">Asistencia de ' + esc(st.fullName) + '</label>' +
          '<input type="checkbox" id="att-' + esc(st.id) + '" class="att-check" data-student="' + esc(st.id) + '"' + checked + '> <span class="att-state">' + state + '</span></td></tr>';
      }).join('');
    }

    container.innerHTML =
      '<section class="card">' +
      '<h2>Carga de asistencia</h2>' +
      '<div class="field"><label for="att-subject">Materia</label>' + subjectSelect + '</div>' +
      '<div class="field"><label for="att-date">Fecha</label>' +
      '<input type="date" id="att-date" value="' + esc(todayStr) + '"></div>' +
      '<table class="table" id="att-table"><thead><tr><th>Estudiante</th><th>Estado</th></tr></thead>' +
      '<tbody>' + rowsHtml(currentSelection(), todayStr) + '</tbody></table>' +
      '<button type="button" class="btn btn-primary" id="att-save">Guardar asistencia</button>' +
      '</section>';

    container.querySelector('#att-save').addEventListener('click', function () {
      const subjectId = currentSelection();
      const dateStr = container.querySelector('#att-date').value;
      if (!dateStr) {
        Toastify({ text: 'Seleccioná una fecha válida.', className: 'toast-error' }).showToast();
        return;
      }
      DB.set(function (dbState) {
        dbState.attendance = dbState.attendance.filter(function (a) {
          return !(a.subjectId === subjectId && a.date === dateStr);
        });
        container.querySelectorAll('.att-check').forEach(function (cb) {
          dbState.attendance.push({
            id: DB.uid('a'),
            studentId: cb.getAttribute('data-student'),
            subjectId: subjectId,
            date: dateStr,
            present: cb.checked
          });
        });
      });
      render('attendance', container, user);
      Toastify({ text: 'Asistencia guardada.', className: 'toast-success' }).showToast();
    });

    container.querySelector('#att-subject').addEventListener('change', function () {
      render('attendance', container, user);
    });
    container.querySelector('#att-date').addEventListener('change', function () {
      const dateStr = container.querySelector('#att-date').value;
      container.querySelector('#att-table tbody').innerHTML = rowsHtml(currentSelection(), dateStr);
      bindAttendanceStates();
    });

    function bindAttendanceStates() {
      container.querySelectorAll('.att-check').forEach(function (cb) {
        cb.addEventListener('change', function () {
          const state = cb.parentElement.querySelector('.att-state');
          if (state) {
            state.textContent = cb.checked ? 'Presente' : 'Ausente';
          }
        });
      });
    }
    bindAttendanceStates();
  }

  function viewSchedule(container, user) {
    const db = DB.get();
    const availableCourses = Array.from(new Set(
      db.subjects.map(function (s) { return s.course; })
        .concat(db.users.map(function (u) { return u.course; }))
        .filter(Boolean)
    ));
    if (!availableCourses.length) {
      availableCourses.push('5° A');
    }
    const currentCourse = user.role === 'admin'
      ? (container._selectedCourse || availableCourses[0])
      : (user.course || '5° A');

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const defaultSlots = ['08:00', '10:00', '12:00', '14:00'];
    const extraSlots = db.schedule
      .filter(function (s) { return s.course === currentCourse; })
      .map(function (s) { return s.time; })
      .filter(function (t) { return defaultSlots.indexOf(t) === -1; });
    const timeSlots = defaultSlots.concat(extraSlots).sort();

    var courseSubjects = db.subjects.filter(function (s) {
      return !s.course || s.course === currentCourse;
    });
    if (!courseSubjects.length) {
      courseSubjects = db.subjects;
    }

    const courseSelectHtml = user.role === 'admin'
      ? '<div class="field"><label for="schedule-course-select">Curso</label><select id="schedule-course-select">' +
        availableCourses.map(function (c) {
          return '<option value="' + esc(c) + '"' + (c === currentCourse ? ' selected' : '') + '>' + esc(c) + '</option>';
        }).join('') + '</select></div>'
      : '';

    const ths = days.map(function (d) { return '<th>' + esc(d) + '</th>'; }).join('');

    const trs = timeSlots.map(function (slot) {
      const tds = days.map(function (day) {
        const match = db.schedule.find(function (s) {
          return s.course === currentCourse && s.day === day && s.time === slot;
        });
        const currentSubId = match ? match.subjectId : '';

        if (user.role === 'admin') {
          const options = '<option value="">-- Libre --</option>' +
            courseSubjects.map(function (s) {
              return '<option value="' + esc(s.id) + '"' + (s.id === currentSubId ? ' selected' : '') + '>' + esc(s.name) + '</option>';
            }).join('');
          return '<td><select class="schedule-cell-select" data-day="' + esc(day) + '" data-time="' + esc(slot) + '">' + options + '</select></td>';
        } else {
          const subName = currentSubId ? subjectName(db, currentSubId) : '';
          return '<td>' + (subName ? '<span class="badge badge-ok">' + esc(subName) + '</span>' : '<span class="muted">—</span>') + '</td>';
        }
      }).join('');

      return '<tr><td><strong>' + esc(slot) + ' hs</strong></td>' + tds + '</tr>';
    }).join('');

    container.innerHTML =
      '<section class="card">' +
      '<h2>Horario Semanal — Curso ' + esc(currentCourse) + '</h2>' +
      '<p class="muted">' + (user.role === 'admin' ? 'Organizá y asigná las materias existentes en el horario semanal.' : 'Consulta del horario semanal de materias.') + '</p>' +
      courseSelectHtml +
      '<table class="table"><thead><tr><th>Hora</th>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table>' +
      (user.role === 'admin' ? '<button type="button" class="btn btn-primary" id="schedule-save-all">Guardar horario semanal</button>' : '') +
      '</section>';

    if (user.role === 'admin') {
      const courseSelect = container.querySelector('#schedule-course-select');
      if (courseSelect) {
        courseSelect.addEventListener('change', function (e) {
          container._selectedCourse = e.target.value;
          render('schedule', container, user);
        });
      }

      const saveBtn = container.querySelector('#schedule-save-all');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          DB.set(function (dbState) {
            dbState.schedule = dbState.schedule.filter(function (s) {
              return s.course !== currentCourse;
            });
            container.querySelectorAll('.schedule-cell-select').forEach(function (sel) {
              const subId = sel.value;
              if (subId) {
                dbState.schedule.push({
                  id: DB.uid('sch'),
                  course: currentCourse,
                  day: sel.getAttribute('data-day'),
                  time: sel.getAttribute('data-time'),
                  subjectId: subId
                });
              }
            });
          });
          render('schedule', container, user);
          Toastify({ text: 'Horario semanal actualizado correctamente.', className: 'toast-success' }).showToast();
        });
      }
    }
  }

  function viewUsers(container, user) {
    if (!Auth.canAccess('users', user.role)) {
      container.innerHTML = '<p>Acceso restringido.</p>';
      return;
    }
    const db = DB.get();
    const userList = db.users.slice().sort(function (a, b) {
      return a.fullName < b.fullName ? -1 : 1;
    });

    container.innerHTML =
      '<section class="card">' +
      '<h2>Gestión de usuarios</h2>' +
      '<p class="muted">RF-02: alta, edición y baja de usuarios.</p>' +
      '<button type="button" class="btn btn-primary" id="btn-new-user">Nuevo usuario</button>' +
      '<form id="user-form" class="user-form hidden">' +
      '<input type="hidden" id="user-id">' +
      '<div class="form-grid">' +
      '<div class="field"><label for="user-username">Usuario</label><input type="text" id="user-username" required maxlength="30"></div>' +
      '<div class="field"><label for="user-fullname">Nombre completo</label><input type="text" id="user-fullname" required maxlength="80"></div>' +
      '<div class="field"><label for="user-email">Correo</label><input type="email" id="user-email" maxlength="80"></div>' +
      '<div class="field"><label for="user-role">Rol</label>' +
      '<select id="user-role"><option value="student">Estudiante / Familia</option><option value="teacher">Docente</option><option value="admin">Administración</option></select></div>' +
      '<div class="field" id="user-course-field"><label for="user-course">Curso / Materia</label><input type="text" id="user-course" maxlength="40" placeholder="Ej.: 5° A o Matemática"></div>' +
      '<div class="field" id="user-pass-field"><label for="user-password">Contraseña inicial</label><input type="password" id="user-password" minlength="6" maxlength="60"></div>' +
      '</div>' +
      '<div class="actions"><button type="submit" class="btn btn-primary" id="user-submit">Guardar</button>' +
      '<button type="button" class="btn btn-outline" id="user-cancel">Cancelar</button></div>' +
      '</form>' +
      '</section>' +
      '<section class="card">' +
      '<h2>Usuarios del sistema</h2>' +
      '<table class="table">' +
      '<thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Curso / Materia</th><th>Estado</th><th>Acciones</th></tr></thead>' +
      '<tbody>' +
      userList.map(function (u) {
        return '<tr>' +
          '<td>' + esc(u.fullName) + '</td>' +
          '<td>' + esc(u.username) + '</td>' +
          '<td>' + esc(DB.ROLES[u.role]) + '</td>' +
          '<td>' + esc(u.course || '—') + '</td>' +
          '<td>' + badge(u.active) + '</td>' +
          '<td class="actions">' +
          '<button class="btn btn-outline btn-sm js-edit-user" data-id="' + esc(u.id) + '">Editar</button> ' +
          '<button class="btn btn-sm ' + (u.active ? 'btn-danger' : 'btn-outline') + ' js-toggle-user" data-id="' + esc(u.id) + '">' + (u.active ? 'Dar de baja' : 'Activar') + '</button> ' +
          '<button class="btn btn-outline btn-sm js-reset-pass" data-id="' + esc(u.id) + '">Restablecer clave</button>' +
          '</td></tr>';
      }).join('') +
      '</tbody></table>' +
      '</section>';

    const form = container.querySelector('#user-form');

    container.querySelector('#btn-new-user').addEventListener('click', function () {
      form.reset();
      document.getElementById('user-id').value = '';
      form.classList.remove('hidden');
      document.getElementById('user-username').focus();
    });

    container.querySelector('#user-cancel').addEventListener('click', function () {
      form.classList.add('hidden');
    });

    container.querySelector('#user-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('user-id').value;
      const username = document.getElementById('user-username').value.trim();
      const fullName = document.getElementById('user-fullname').value.trim();
      const email = document.getElementById('user-email').value.trim();
      const role = document.getElementById('user-role').value;
      const course = document.getElementById('user-course').value.trim();
      const password = document.getElementById('user-password').value;

      const usernameTaken = db.users.some(function (u) {
        return u.username.toLowerCase() === username.toLowerCase() && u.id !== id;
      });
      if (usernameTaken) {
        Toastify({ text: 'Ese nombre de usuario ya existe.', className: 'toast-error' }).showToast();
        return;
      }
      if (id && password && password.length < 6) {
        Toastify({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', className: 'toast-error' }).showToast();
        return;
      }

      if (id) {
        DB.set(function (dbState) {
          const target = dbState.users.find(function (u) {
            return u.id === id;
          });
          if (target) {
            target.username = username;
            target.fullName = fullName;
            target.email = email;
            target.role = role;
            target.course = course;
            if (password) {
              if (password.length < 6) {
                return;
              }
              target.salt = DB.randomSalt();
              target.passwordHash = hashPassword(target.salt, password);
            }
          }
        });
      } else {
        if (!password || password.length < 6) {
          Toastify({ text: 'La contraseña inicial debe tener al menos 6 caracteres.', className: 'toast-error' }).showToast();
          return;
        }
        const salt = DB.randomSalt();
        DB.set(function (dbState) {
          dbState.users.push({
            id: DB.uid('u'),
            username: username,
            fullName: fullName,
            email: email,
            role: role,
            course: course,
            active: true,
            salt: salt,
            passwordHash: hashPassword(salt, password)
          });
        });
      }
      render('users', container, user);
      Toastify({ text: id ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.', className: 'toast-success' }).showToast();
    });

    const editButtons = container.querySelectorAll('.js-edit-user');
    Array.prototype.forEach.call(editButtons, function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        const target = db.users.find(function (u) {
          return u.id === id;
        });
        if (!target) {
          return;
        }
        document.getElementById('user-id').value = target.id;
        document.getElementById('user-username').value = target.username;
        document.getElementById('user-fullname').value = target.fullName;
        document.getElementById('user-email').value = target.email || '';
        document.getElementById('user-role').value = target.role;
        document.getElementById('user-course').value = target.course || '';
        document.getElementById('user-password').value = '';
        document.getElementById('user-password').placeholder = 'Dejar vacío para no cambiar';
        form.classList.remove('hidden');
        form.scrollIntoView();
      });
    });

    const toggleButtons = container.querySelectorAll('.js-toggle-user');
    Array.prototype.forEach.call(toggleButtons, function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        if (id === user.id) {
          Toastify({ text: 'No podés darte de baja a vos mismo.', className: 'toast-error' }).showToast();
          return;
        }
        let isNowActive = false;
        DB.set(function (dbState) {
          const target = dbState.users.find(function (u) {
            return u.id === id;
          });
          if (target) {
            target.active = !target.active;
            isNowActive = target.active;
          }
        });
        render('users', container, user);
        Toastify({ text: isNowActive ? 'Usuario activado.' : 'Usuario dado de baja.', className: 'toast-success' }).showToast();
      });
    });

    const resetButtons = container.querySelectorAll('.js-reset-pass');
    Array.prototype.forEach.call(resetButtons, function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        const defaultPass = '123456';
        DB.set(function (dbState) {
          const target = dbState.users.find(function (u) {
            return u.id === id;
          });
          if (target) {
            target.salt = DB.randomSalt();
            target.passwordHash = hashPassword(target.salt, defaultPass);
          }
        });
        Toastify({ text: 'Contraseña restablecida a 123456. Comunicá la nueva clave solo a la persona titular.', className: 'toast-success' }).showToast();
        render('users', container, user);
      });
    });
  }

  function viewProfile(container, user) {
    const db = DB.get();
    const me = db.users.find(function (u) {
      return u.id === user.id;
    });
    if (!me) {
      container.innerHTML = '<p>No se encontró tu cuenta.</p>';
      return;
    }

    container.innerHTML =
      '<section class="card">' +
      '<h2>Mi perfil</h2>' +
      '<p class="muted">Datos de tu cuenta. Los cambios se guardan en el sistema.</p>' +
      '<form id="profile-form">' +
      '<div class="field"><label for="p-username">Usuario</label>' +
      '<input type="text" id="p-username" value="' + esc(me.username) + '" disabled>' +
      '<p class="muted hint">El nombre de usuario no se puede modificar.</p></div>' +
      '<div class="field"><label for="p-role">Rol</label>' +
      '<input type="text" id="p-role" value="' + esc(DB.ROLES[me.role]) + '" disabled>' +
      '<p class="muted hint">El rol lo define la administración.</p></div>' +
      '<div class="field"><label for="p-course">Curso / Materia</label>' +
      '<input type="text" id="p-course" value="' + esc(me.course || '—') + '" disabled></div>' +
      '<div class="field"><label for="p-fullname">Nombre completo</label>' +
      '<input type="text" id="p-fullname" value="' + esc(me.fullName) + '" required maxlength="80"></div>' +
      '<div class="field"><label for="p-email">Correo electrónico</label>' +
      '<input type="email" id="p-email" value="' + esc(me.email || '') + '" maxlength="80"></div>' +
      '<p id="profile-msg" class="form-msg" role="alert" aria-live="polite"></p>' +
      '<button type="submit" class="btn btn-primary">Guardar perfil</button>' +
      '</form>' +
      '</section>' +
      '<section class="card">' +
      '<h2>Cambiar contraseña</h2>' +
      '<p class="muted">Verificá tu contraseña actual antes de cambiarla.</p>' +
      '<form id="pass-form">' +
      '<div class="field"><label for="pass-current">Contraseña actual</label>' +
      '<input type="password" id="pass-current" autocomplete="current-password" required></div>' +
      '<div class="field"><label for="pass-new">Nueva contraseña</label>' +
      '<input type="password" id="pass-new" autocomplete="new-password" minlength="6" maxlength="60" required></div>' +
      '<div class="field"><label for="pass-confirm">Confirmar nueva contraseña</label>' +
      '<input type="password" id="pass-confirm" autocomplete="new-password" minlength="6" maxlength="60" required></div>' +
      '<p id="pass-msg" class="form-msg" role="alert" aria-live="polite"></p>' +
      '<button type="submit" class="btn btn-primary">Actualizar contraseña</button>' +
      '</form>' +
      '</section>';

    container.querySelector('#profile-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const fullName = document.getElementById('p-fullname').value.trim();
      const email = document.getElementById('p-email').value.trim();
      if (!fullName) {
        document.getElementById('profile-msg').textContent = 'El nombre no puede estar vacío.';
        Toastify({ text: 'El nombre no puede estar vacío.', className: 'toast-error' }).showToast();
        return;
      }
      DB.set(function (dbState) {
        const target = dbState.users.find(function (u) {
          return u.id === user.id;
        });
        if (target) {
          target.fullName = fullName;
          target.email = email;
        }
      });
      document.getElementById('profile-msg').textContent = 'Perfil actualizado correctamente.';
      Toastify({ text: 'Perfil actualizado correctamente.', className: 'toast-success' }).showToast();
      document.dispatchEvent(new CustomEvent('user:updated'));
    });

    container.querySelector('#pass-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const current = document.getElementById('pass-current').value;
      const newPass = document.getElementById('pass-new').value;
      const confirmPass = document.getElementById('pass-confirm').value;
      const msg = document.getElementById('pass-msg');

      const fresh = DB.get().users.find(function (u) {
        return u.id === user.id;
      });
      if (!fresh || hashPassword(fresh.salt, current) !== fresh.passwordHash) {
        msg.textContent = 'La contraseña actual es incorrecta.';
        Toastify({ text: 'La contraseña actual es incorrecta.', className: 'toast-error' }).showToast();
        return;
      }
      if (newPass.length < 6) {
        msg.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
        Toastify({ text: 'La nueva contraseña debe tener al menos 6 caracteres.', className: 'toast-error' }).showToast();
        return;
      }
      if (newPass !== confirmPass) {
        msg.textContent = 'Las contraseñas nuevas no coinciden.';
        Toastify({ text: 'Las contraseñas nuevas no coinciden.', className: 'toast-error' }).showToast();
        return;
      }
      DB.set(function (dbState) {
        const target = dbState.users.find(function (u) {
          return u.id === user.id;
        });
        if (target) {
          target.salt = DB.randomSalt();
          target.passwordHash = hashPassword(target.salt, newPass);
        }
      });
      msg.textContent = 'Contraseña actualizada correctamente.';
      Toastify({ text: 'Contraseña actualizada correctamente.', className: 'toast-success' }).showToast();
      document.getElementById('pass-current').value = '';
      document.getElementById('pass-new').value = '';
      document.getElementById('pass-confirm').value = '';
    });
  }

  function formatChatMessage(text) {
    if (!text) return '';
    return esc(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function viewAssistant(container, user) {
    var history = [
      {
        sender: 'ai',
        text: '¡Hola, ' + user.fullName + '! Soy el Asistente IA de la Intranet Escolar. Estoy capacitado para responder tus preguntas sobre calificaciones, horarios, comunicados, asistencia y funciones del sistema.\n\n¿En qué te puedo ayudar hoy?'
      }
    ];

    container.innerHTML =
      '<header class="card assistant-header">' +
      '<h2>🤖 Asistente IA de Aclaración de Dudas</h2>' +
      '<p class="muted">Realizá tus preguntas sobre calificaciones, horarios, comunicados, asistencia, perfiles o normativa del colegio.</p>' +
      '<div class="assistant-notice" role="status"><span class="badge badge-ok">IA Operativa</span> <span>Para preguntas ajenas al ámbito escolar o el sistema, el asistente responderá estrictamente: <em>"No estoy calificada para responder dicha pregunta."</em></span></div>' +
      '</header>' +
      '<section class="card assistant-chat-card">' +
      '<div class="chat-header-actions">' +
      '<h3>Conversación en vivo</h3>' +
      '<button type="button" class="btn btn-outline btn-sm" id="btn-reset-chat">Reiniciar chat</button>' +
      '</div>' +
      '<div class="chat-box" id="chat-box" tabindex="0" aria-label="Historial de conversación" aria-live="polite"></div>' +
      '<div class="chat-chips-area">' +
      '<p class="hint muted">Preguntas sugeridas (hacé clic para probar):</p>' +
      '<div class="chip-list" id="chip-list"></div>' +
      '</div>' +
      '<form id="chat-form" class="chat-form">' +
      '<div class="chat-input-wrap">' +
      '<input type="text" id="chat-input" placeholder="Escribí tu pregunta sobre la intranet o colegio..." autocomplete="off" required aria-label="Pregunta para el Asistente IA">' +
      '<button type="submit" class="btn btn-primary" id="btn-chat-submit">Enviar</button>' +
      '</div>' +
      '</form>' +
      '</section>';

    var chatBox = container.querySelector('#chat-box');
    var chipList = container.querySelector('#chip-list');
    var chatForm = container.querySelector('#chat-form');
    var chatInput = container.querySelector('#chat-input');
    var btnReset = container.querySelector('#btn-reset-chat');

    function renderMessages() {
      chatBox.innerHTML = history.map(function (msg) {
        var isUser = msg.sender === 'user';
        var bubbleClass = isUser ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai';
        var senderName = isUser ? esc(user.fullName) : 'Asistente IA Escolar';
        var avatarIcon = isUser ? '👤' : '🤖';

        return '<div class="' + bubbleClass + '">' +
          '<div class="chat-bubble-header">' +
          '<span class="chat-bubble-icon" aria-hidden="true">' + avatarIcon + '</span>' +
          '<strong class="chat-bubble-author">' + senderName + '</strong>' +
          '</div>' +
          '<div class="chat-bubble-content">' + formatChatMessage(msg.text) + '</div>' +
          '</div>';
      }).join('');
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function renderChips() {
      var suggested = Assistant.getSuggestedQuestions();
      chipList.innerHTML = suggested.map(function (q) {
        return '<button type="button" class="chip-btn" data-question="' + esc(q) + '">' + esc(q) + '</button>';
      }).join('');
    }

    function handleSend(questionText) {
      if (!questionText.trim()) return;

      history.push({ sender: 'user', text: questionText });
      renderMessages();

      var typingEl = document.createElement('div');
      typingEl.className = 'chat-bubble chat-bubble-ai chat-typing';
      typingEl.innerHTML = '<div class="chat-bubble-header"><span class="chat-bubble-icon">🤖</span><strong>Asistente IA Escolar</strong></div><div class="typing-dots"><span>.</span><span>.</span><span>.</span></div>';
      chatBox.appendChild(typingEl);
      chatBox.scrollTop = chatBox.scrollHeight;

      setTimeout(function () {
        if (typingEl.parentNode) {
          typingEl.parentNode.removeChild(typingEl);
        }
        var response = Assistant.ask(questionText);
        history.push({ sender: 'ai', text: response });
        renderMessages();
      }, 300);
    }

    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = chatInput.value.trim();
      chatInput.value = '';
      handleSend(q);
    });

    chipList.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.chip-btn') : null;
      if (btn) {
        var q = btn.getAttribute('data-question');
        if (q) {
          handleSend(q);
        }
      }
    });

    btnReset.addEventListener('click', function () {
      history = [
        {
          sender: 'ai',
          text: '¡Hola, ' + user.fullName + '! Soy el Asistente IA de la Intranet Escolar. Estoy capacitado para responder tus preguntas sobre calificaciones, horarios, comunicados, asistencia y funciones del sistema.\n\n¿En qué te puedo ayudar hoy?'
        }
      ];
      renderMessages();
      Toastify({ text: 'Conversación reiniciada.', className: 'toast-info' }).showToast();
    });

    renderChips();
    renderMessages();
  }

  return {
    render: render,
    esc: esc,
    gradeClass: gradeClass
  };
})();
