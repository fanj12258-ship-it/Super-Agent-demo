/* legacy-switch.js — confirm before opening the locked classic Workbench */
(function () {
  var LEGACY_URL = 'backups/agentos-workbench.LOCKED-2026-10-10.html';
  var btn = document.getElementById('btnLegacySwitch');
  var modal = document.getElementById('legacy-switch-modal');
  var confirmBtn = document.getElementById('legacy-switch-confirm');
  if (!btn || !modal || !confirmBtn) return;

  function open() {
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    confirmBtn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    btn.focus();
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    open();
  });

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-legacy-close]')) close();
  });

  confirmBtn.addEventListener('click', function () {
    window.location.href = LEGACY_URL;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      e.preventDefault();
      close();
    }
  });
})();
