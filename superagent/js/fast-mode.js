/**
 * Fast POC page ONLY — build-mode indicator (composer) + Agent "pick a mode" card.
 *   FastMode.set('fast' | 'steps')   — default 'fast'
 *   FastMode.get()
 *   FastMode.choiceCard() → { node, picked: Promise<'fast'|'steps'> }
 * Chip sits next to "+" in the composer; click opens a small menu to switch any time.
 */
(function () {
  'use strict';
  var root = document.getElementById('fast-mode');
  if (!root) return;
  var chip = document.getElementById('fast-mode-chip');
  var menu = document.getElementById('fast-mode-menu');
  var label = chip.querySelector('.fm-label');
  var icoEl = chip.querySelector('.fm-ico');

  /* one stroke language for every choice / mode icon */
  var IA = 'width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
  function ico(d) { return '<svg ' + IA + '>' + d + '</svg>'; }
  var ICON = {
    fast: ico('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'),
    steps: ico('<path d="M12 3 3.5 7.75 12 12.5l8.5-4.75L12 3Z"/><path d="m3.5 12.25 8.5 4.75 8.5-4.75"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>'),
    enter: ico('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    go: ico('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'),
    refine: ico('<path d="M12 3 3.5 7.75 12 12.5l8.5-4.75L12 3Z"/><path d="m3.5 12.25 8.5 4.75 8.5-4.75"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>'),
    later: ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  };
  var NAME = { fast: '先快速出一版', steps: '一步步做扎实' };
  var mode = 'fast';

  menu.querySelectorAll('[data-ico]').forEach(function (n) { n.innerHTML = ICON[n.getAttribute('data-ico')]; });

  /* ── "!" after each mode name: hover shows both mode diagrams side by side, the hovered one highlighted ── */
  var INFO_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/></svg>';
  var TIP = {
    fast: { t: '先快速出一版', d: '几句话先得到一个 Agent，边试边问；哪里不满意，再回头补文档和本体。', w: '适合：想法还模糊，想先看一眼效果' },
    steps: { t: '一步步做扎实', d: '按步骤把需求、知识、设计和本体做扎实，最后生成 Agent。', w: '适合：已经清楚要做什么' }
  };
  var tip = document.createElement('div');
  tip.className = 'fm-tip'; tip.hidden = true; tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  function showTip(id, anchor) {
    var x = TIP[id];
    tip.innerHTML = '<div class="fm-tip-h"><b>' + x.t + '</b><span>' + x.w + '</span></div>' +
      '<div class="fm-tip-map">' + (window.FastFlowMap ? window.FastFlowMap.detail(id) : '') + '</div>' +
      '<p>' + x.d + '</p>';
    tip.hidden = false;
    var mr = (anchor || menu).getBoundingClientRect(), tr = tip.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    var left = Math.min(Math.max(16, mr.left - 24), vw - tr.width - 16);
    var top = mr.top - tr.height - 10;                       /* above the anchor, else below */
    if (top < 8) top = Math.min(mr.bottom + 10, vh - tr.height - 8);
    tip.style.left = left + 'px'; tip.style.top = Math.max(8, top) + 'px';
  }
  function hideTip() { tip.hidden = true; }
  menu.querySelectorAll('.fm-item').forEach(function (b) {
    var id = b.getAttribute('data-mode'), tt = b.querySelector('.fm-item-t');
    if (!tt) return;
    var i = document.createElement('span');
    i.className = 'fm-info'; i.tabIndex = 0; i.setAttribute('role', 'img'); i.setAttribute('aria-label', '了解两种方式的区别'); i.innerHTML = INFO_SVG;
    tt.appendChild(i);
    i.addEventListener('mouseenter', function () { showTip(id, i); });
    i.addEventListener('focus', function () { showTip(id, i); });
    i.addEventListener('mouseleave', hideTip);
    i.addEventListener('blur', hideTip);
  });

  function set(m) {
    if (!ICON[m]) return;
    mode = m;
    root.setAttribute('data-mode', m);
    label.textContent = NAME[m];
    icoEl.innerHTML = ICON[m];
    menu.querySelectorAll('.fm-item').forEach(function (b) {
      var on = b.getAttribute('data-mode') === m;
      b.classList.toggle('is-current', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('fastmodechange', { detail: { mode: m } }));
  }

  function close() { hideTip(); menu.hidden = true; chip.setAttribute('aria-expanded', 'false'); }
  chip.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    chip.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
  });
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('.fm-item');
    if (!b) return;
    set(b.getAttribute('data-mode'));
    close();
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('#fast-mode')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ── Agent-side choice card (lives in the chat body) ── */
  function choiceCard(opts) {
    opts = opts || {};
    var box = document.createElement('div');
    box.className = 'fm-choice' + (opts.compact ? ' is-compact' : '');
    box.innerHTML =
      '<div class="fm-choice-head"><span class="fm-choice-t">' + (opts.title || '想怎么开始打造？') + '</span>' +
      (opts.hint === false ? '' : '<span class="fm-choice-h">' + (opts.hint || '之后也可以随时告诉我换一种做法') + '</span>') + '</div>' +
      (opts.summary
        ? '<dl class="fm-choice-sum">' + opts.summary.map(function (r) {
            return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>';
          }).join('') + '</dl>'
        : '') +
      '<div class="fm-choice-opts' + (opts.list ? ' is-list' : '') + '">' +
      (opts.options || [
        { id: 'fast', name: '先快速出一版', tag: '推荐', map: 'fast', desc: '几句话先快速得到一个 Agent，边试边问；哪里不满意，再回头补文档和本体。' },
        { id: 'steps', name: '一步步做扎实', tag: '', map: 'steps', desc: '我清楚要做什么：按流程一步步来，先需求、知识和设计文档，再建本体，最后生成 Agent。' },
      ]).map(function (o) { return opt(o.id, o.name, o.tag, o.desc, o.map); }).join('') +
      '</div>' +
      (opts.mapLink ? '<button type="button" class="fm-maplink" data-maplink="1">' + opts.mapLink +
        ' <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></button>' : '');
    function mini(m) {
      return m && window.FastFlowMap ? '<span class="fm-opt-map">' + window.FastFlowMap.mini(m) + '</span>' : '';
    }
    function opt(id, name, tag, desc, map) {
      return '<button type="button" class="fm-opt' + (tag ? ' is-rec' : '') + '" data-pick="' + id + '">' +
        '<span class="fm-opt-top"><span class="fm-opt-ico" aria-hidden="true">' + (ICON[id] || ICON.enter) + '</span>' +
        '<span class="fm-opt-name">' + name + '</span>' +
        (tag ? '<span class="fm-opt-tag">' + tag + '</span>' : '') +
        '<svg class="fm-opt-check" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3L5 8.8l4.5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        (desc ? '<span class="fm-opt-desc">' + desc + '</span>' : '') + mini(map) + '</button>';
    }
    box.querySelectorAll('.fm-opt').forEach(function (b) {
      var id = b.getAttribute('data-pick'), nm = b.querySelector('.fm-opt-name');
      if (!TIP[id] || !nm) return;
      var i = document.createElement('span');
      i.className = 'fm-info'; i.tabIndex = 0; i.setAttribute('role', 'img'); i.setAttribute('aria-label', '了解这种做法'); i.innerHTML = INFO_SVG;
      nm.appendChild(i);
      i.addEventListener('mouseenter', function () { showTip(id, i); });
      i.addEventListener('focus', function () { showTip(id, i); });
      i.addEventListener('mouseleave', hideTip);
      i.addEventListener('blur', hideTip);
      i.addEventListener('click', function (e) { e.stopPropagation(); });
    });
    var link = box.querySelector('[data-maplink]');
    if (link) link.addEventListener('click', function () {
      if (window.FastBlueprintIso) window.FastBlueprintIso.open({ mode: opts.mapMode || 'fast' });
    });
    var picked = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('.fm-opt');
        if (!b || box.classList.contains('is-done')) return;
        var id = b.getAttribute('data-pick');
        box.classList.add('is-done');
        b.classList.add('is-picked');
        if ((id === 'fast' || id === 'steps') && !opts.noModeSet) set(id);
        resolve(id);
      });
    });
    return { node: box, picked: picked };
  }

  /* Plain button pair (no card chrome) — sits right under body text */
  function choiceButtons(list) {
    var box = document.createElement('div');
    box.className = 'fm-btns';
    box.innerHTML = list.map(function (o, i) {
      return '<button type="button" class="fm-btn' + (i === 0 ? ' is-primary' : '') + '" data-pick="' + o.id + '">' + o.label + '</button>';
    }).join('');
    var picked = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('.fm-btn');
        if (!b || box.classList.contains('is-done')) return;
        box.classList.add('is-done');
        b.classList.add('is-picked');
        resolve(b.getAttribute('data-pick'));
      });
    });
    return { node: box, picked: picked };
  }

  window.FastMode = { choiceButtons: choiceButtons, set: set, get: function () { return mode; }, choiceCard: choiceCard };
  set('fast');
})();
