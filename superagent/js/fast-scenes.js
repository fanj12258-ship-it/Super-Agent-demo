/**
 * Fast POC page ONLY. Scene visibility, one switch per scene.
 *   FastScenes.show('a1')                  → A1 card (sidebar) + dropdown entry, children hidden
 *   FastScenes.show('a1', {kids: true})    → also show its business scenarios
 *   FastScenes.hide('a1') / reset()
 *   FastScenes.set(true|false)             → legacy: show/hide everything (with kids)
 * #scene-cards.has-scenes drives the tall↔compact "New scenario" guide card.
 */
(function () {
  'use strict';
  var cards = document.getElementById('scene-cards');
  var ov = document.getElementById('fast-ov-scenes');

  function nodes(id) {
    return document.querySelectorAll('[data-fast-scene="' + id + '"]');
  }
  function sync() {
    var any = !!document.querySelector('#scene-cards .scene-pack.fast-on');
    if (cards) cards.classList.toggle('has-scenes', any);
    if (ov) ov.classList.toggle('has-scenes', !!document.querySelector('#fast-ov-scenes .ov-menu-pack.fast-on'));
  }
  function show(id, opt) {
    nodes(id).forEach(function (n) {
      var first = !n.classList.contains('fast-on');
      n.classList.add('fast-on');
      n.classList.toggle('fast-kids', !!(opt && opt.kids));
      if (first && n.classList.contains('scene-pack')) {
        n.classList.add('is-new');
        setTimeout(function () { n.classList.remove('is-new'); }, 900);
      }
    });
    sync();
  }
  function hide(id) {
    nodes(id).forEach(function (n) { n.classList.remove('fast-on', 'fast-kids', 'is-new'); });
    sync();
  }
  window.FastScenes = {
    show: show,
    hide: hide,
    reset: function () { ['a1', 'store'].forEach(hide); },
    set: function (on) { ['a1', 'store'].forEach(function (id) { on ? show(id, { kids: true }) : hide(id); }); },
  };
})();
