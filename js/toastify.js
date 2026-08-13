function Toastify(options) {
  'use strict';

  return {
    showToast: function () {
      const toast = document.createElement('div');
      const duration = typeof options.duration === 'number' ? options.duration : 4000;
      toast.className = 'toastify ' + (options.className || '');
      toast.textContent = options.text || '';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
      requestAnimationFrame(function () {
        toast.classList.add('toastify-visible');
      });
      window.setTimeout(function () {
        toast.classList.remove('toastify-visible');
        window.setTimeout(function () {
          toast.remove();
        }, 200);
      }, duration);
    }
  };
}

window.alert = function (message) {
  Toastify({
    text: String(message),
    className: 'toast-info'
  }).showToast();
};

window.confirm = function (message) {
  Toastify({
    text: String(message),
    className: 'toast-warning'
  }).showToast();
  return true;
};

window.prompt = function (message, defaultValue) {
  Toastify({
    text: String(message),
    className: 'toast-info'
  }).showToast();
  return defaultValue != null ? String(defaultValue) : '';
};


