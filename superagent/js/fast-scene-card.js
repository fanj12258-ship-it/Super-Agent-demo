/**
 * Fast POC page ONLY — the sidebar "scene card" re-used inside the chat.
 * Same visual language as the left Scenarios card (kicker + stage chip + desc, business scenarios nested),
 * with a footer that adapts to the context. Footer buttons are replaced by a result line once one is picked.
 *
 *   FastSceneCard.create({
 *     title, desc, stage: 'crafting',
 *     biz: [{ name, desc, priority }],
 *     actions: [{ id, label }],            // first = primary
 *     results: { enter: '已选择：进入打造', later: '已选择：暂不进入' }
 *   }) → { node, picked: Promise<id> }
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function create(o) {
    var stage = o.stage || 'crafting';
    var stageLabel = { crafting: 'Crafting', ready: 'Ready', live: 'Live' }[stage] || 'Crafting';
    var biz = o.biz || [];
    var el = document.createElement('div');
    el.className = 'fsc';
    el.innerHTML =
      '<div class="fsc-app">' +
        '<h4 class="fsc-title">' + esc(o.title) + '</h4>' +
        '<div class="fsc-tags"><span class="scene-kicker">Application</span>' +
        '<span class="scene-stage is-' + stage + '"><span class="dot" aria-hidden="true"></span>' + stageLabel + '</span></div>' +
        (o.desc ? '<p class="fsc-desc">' + esc(o.desc) + '</p>' : '') +
      '</div>' +
      (biz.length
        ? '<div class="fsc-kids">' + biz.map(function (b) {
            return '<div class="fsc-biz">' +
              '<h5 class="fsc-biz-title">' + esc(b.name) + '</h5>' +
              '<div class="fsc-tags"><span class="scene-kicker scene-kicker-biz">Business</span>' +
              (b.priority ? '<span class="fsc-prio">' + esc(b.priority) + '</span>' : '') + '</div>' +
              (b.desc ? '<p class="fsc-desc">' + esc(b.desc) + '</p>' : '') +
            '</div>';
          }).join('') + '</div>'
        : '') +
      '<div class="fsc-foot">' + (o.actions || []).map(function (a, i) {
        return '<button type="button" class="fm-btn' + (i === 0 ? ' is-primary' : '') + '" data-pick="' + esc(a.id) + '">' + esc(a.label) + '</button>';
      }).join('') + '</div>';

    var foot = el.querySelector('.fsc-foot');
    var settled = false;
    function settle(id, label) {
      if (settled || foot.classList.contains('is-done')) return false;
      settled = true;
      foot.classList.add('is-done');
      // every action goes away — the footer becomes a plain result line
      foot.innerHTML = '<span class="fsc-result"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>' +
        esc((o.results && o.results[id]) || label || id) + '</span>';
      return true;
    }
    var resolvePick = null;
    var picked = new Promise(function (resolve) {
      resolvePick = function (id, label) {
        if (!settle(id, label)) return;
        resolve(id);
      };
      foot.addEventListener('click', function (e) {
        var b = e.target.closest('.fm-btn');
        if (!b) return;
        resolvePick(b.getAttribute('data-pick'), b.textContent);
      });
    });
    return {
      node: el,
      picked: picked,
      /* sidebar Continue crafting can settle the same choice without a second click in chat */
      pick: function (id) { if (resolvePick) resolvePick(id); },
    };
  }

  window.FastSceneCard = { create: create };
})();
