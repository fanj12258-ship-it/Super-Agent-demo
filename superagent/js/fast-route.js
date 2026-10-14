/**
 * Fast POC page ONLY — Main / Side capsule in the composer (demo control).
 *   Main → Space plays the original route (supplier sourcing → FastIntake → scene card → 进入打造 → …)
 *   Side → Space plays the enterprise-exploration route (js/fast-company.js) → 2–3 scene cards → same T1 → main route
 * Only shown before the first message of the conversation; the choice is read when Space is pressed.
 */
(function () {
  'use strict';
  var root = document.getElementById('fast-route');
  if (!root) return;
  var cur = 'main';
  var input = document.getElementById('composer-input');

  function set(r) {
    cur = r === 'side' ? 'side' : 'main';
    Array.prototype.forEach.call(root.querySelectorAll('button'), function (b) {
      var on = b.getAttribute('data-route') === cur;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    root.setAttribute('data-route', cur);
  }
  root.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep the caret in the composer so Space works right after
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-route]');
    if (!b) return;
    set(b.getAttribute('data-route'));
    if (input) input.focus({ preventScroll: true });
  });
  set('main');
  window.FastRoute = { get: function () { return cur; }, set: set };
})();
