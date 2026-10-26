/* Workbench column controls: resize without rebuilding the pane contents. */
(function (global) {
  'use strict';
  var navWidth = 256, navOpen = true, cuiWidth = null, drag = null;
  function app() { return document.querySelector('.aiops-app'); }
  function side() { return document.querySelector('.aiops-side'); }
  function split() { return document.querySelector('.resource-split'); }
  function tr(zh, en) { return document.documentElement.lang === 'en' ? en : zh; }
  function clamp(value, min, max) { return Math.round(Math.max(min, Math.min(Math.max(min, max), value))); }
  function layout() {
    var el = split();
    return el ? global.AIOpsResources.columnLayout(el.dataset.kind) : null;
  }
  function bounds(kind) {
    var el = split(), data = layout(), room = app().clientWidth;
    if (kind === 'nav') {
      var center = el && !el.classList.contains('is-max') ? (data.min || 300) + 320 : app().classList.contains('is-rail-open') ? 620 : 400;
      return { min: 224, max: Math.max(224, Math.min(400, room - center)) };
    }
    if (kind === 'resource') return { min: data.min, max: Math.max(data.min, el.clientWidth - 320) };
    return { min: 220, max: Math.max(220, room - (navOpen ? side().getBoundingClientRect().width : 0) - 400) };
  }
  function separator(id, kind, label) {
    var el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; el.className = 'aiops-column-resize'; el.dataset.columnResize = kind; el.setAttribute('role', 'separator'); el.setAttribute('aria-orientation', 'vertical'); el.tabIndex = 0; }
    el.setAttribute('aria-label', label); el.title = label; return el;
  }
  function updateAria(el, kind, width) {
    var range = bounds(kind); el.setAttribute('aria-valuemin', range.min); el.setAttribute('aria-valuemax', range.max); el.setAttribute('aria-valuenow', Math.round(width));
  }
  function setResourceWidth(width, remember) {
    var el = split(); if (!el) return;
    var range = bounds('resource'), value = clamp(width, range.min, range.max);
    global.AIOpsResources.resizeColumn(el.dataset.kind, value, remember);
    el.style.setProperty('--resource-list-width', value + 'px');
    el.style.setProperty('--resource-list-min', range.min + 'px');
  }
  function normalize() {
    if (!app()) return;
    var range = bounds('nav');
    app().style.setProperty('--sidebar-w', navOpen ? clamp(navWidth, range.min, range.max) + 'px' : '0px');
    app().classList.toggle('is-nav-collapsed', !navOpen);
    side().hidden = !navOpen;
    var close = document.getElementById('aiopsNavToggle'), open = document.getElementById('aiopsNavOpen');
    if (close) { close.setAttribute('aria-label', tr('收起左侧边栏', 'Collapse sidebar')); close.title = close.getAttribute('aria-label'); close.setAttribute('aria-expanded', String(navOpen)); }
    if (open) { open.hidden = navOpen; open.setAttribute('aria-label', tr('展开左侧边栏', 'Open sidebar')); open.title = open.getAttribute('aria-label'); }
    var el = split(), data = layout();
    if (el && !el.classList.contains('is-max')) setResourceWidth(data.width, false);
    if (app().classList.contains('is-rail-open') && !app().classList.contains('is-rail-max')) {
      var railRange = bounds('cui'); app().style.setProperty('--rail-w', clamp(cuiWidth == null ? Math.min(600, railRange.max) : cuiWidth, railRange.min, railRange.max) + 'px');
    }
    updateHandles();
  }
  function updateHandles() {
    var left = separator('aiopsNavResize', 'nav', tr('调整左侧边栏宽度', 'Resize navigation'));
    if (!left.isConnected) document.body.appendChild(left);
    left.hidden = !navOpen || getComputedStyle(side()).display === 'none';
    left.style.left = side().getBoundingClientRect().right - 4 + 'px';
    updateAria(left, 'nav', side().getBoundingClientRect().width);
    var el = split();
    if (el) {
      var middle = separator('aiopsResourceResize', 'resource', tr('调整中间栏和右侧边栏宽度', 'Resize middle and detail panes'));
      if (!middle.isConnected) el.appendChild(middle);
      middle.hidden = el.classList.contains('is-max');
      updateAria(middle, 'resource', layout().width);
    }
    var rail = document.getElementById('cuiRail'), right = separator('aiopsCuiResize', 'cui', tr('调整右侧边栏宽度', 'Resize agent panel'));
    if (!right.isConnected) document.body.appendChild(right);
    right.hidden = !rail || rail.hidden || app().classList.contains('is-rail-max');
    if (!right.hidden) { right.style.left = rail.getBoundingClientRect().left - 4 + 'px'; updateAria(right, 'cui', rail.getBoundingClientRect().width); }
  }
  function change(kind, value) {
    var range = bounds(kind), next = clamp(value, range.min, range.max);
    if (kind === 'nav') navWidth = next;
    else if (kind === 'resource') setResourceWidth(next, true);
    else cuiWidth = next;
    normalize();
  }
  function finish() {
    if (!drag) return;
    drag.handle.classList.remove('is-active'); drag = null;
    document.body.classList.remove('is-col-resizing');
    window.dispatchEvent(new Event('resize'));
  }
  document.addEventListener('pointerdown', function (event) {
    var handle = event.target.closest('[data-column-resize]');
    if (!handle || event.button !== 0) return;
    event.preventDefault(); event.stopImmediatePropagation();
    var kind = handle.dataset.columnResize;
    drag = { kind: kind, handle: handle, start: kind === 'nav' ? navWidth : kind === 'resource' ? layout().width : document.getElementById('cuiRail').getBoundingClientRect().width };
    handle.classList.add('is-active'); document.body.classList.add('is-col-resizing'); handle.setPointerCapture(event.pointerId);
  }, true);
  window.addEventListener('pointermove', function (event) {
    if (!drag) return;
    var value = drag.kind === 'nav' ? event.clientX - app().getBoundingClientRect().left : drag.kind === 'resource' ? event.clientX - split().getBoundingClientRect().left : app().getBoundingClientRect().right - event.clientX;
    change(drag.kind, value);
  });
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
  document.addEventListener('keydown', function (event) {
    if (drag && event.key === 'Escape') { change(drag.kind, drag.start); finish(); return; }
    var handle = event.target.closest('[data-column-resize]');
    if (!handle || ['ArrowLeft','ArrowRight','Home','End'].indexOf(event.key) < 0) return;
    event.preventDefault(); event.stopImmediatePropagation();
    var kind = handle.dataset.columnResize, range = bounds(kind), value = Number(handle.getAttribute('aria-valuenow'));
    var delta = (event.key === 'ArrowRight' ? 16 : -16) * (kind === 'cui' ? -1 : 1);
    change(kind, event.key === 'Home' ? range.min : event.key === 'End' ? range.max : value + delta);
    window.dispatchEvent(new Event('resize'));
  }, true);
  document.addEventListener('dblclick', function (event) {
    var handle = event.target.closest('[data-column-resize]'); if (!handle) return;
    change(handle.dataset.columnResize, handle.dataset.columnResize === 'nav' ? 256 : handle.dataset.columnResize === 'resource' ? bounds('resource').min : 600);
  });
  document.addEventListener('click', function (event) {
    var button = event.target.closest('#aiopsNavToggle, #aiopsNavOpen'); if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation(); navOpen = !navOpen; normalize();
    document.getElementById(navOpen ? 'aiopsNavToggle' : 'aiopsNavOpen').focus({ preventScroll: true });
    window.dispatchEvent(new Event('resize'));
  }, true);
  window.addEventListener('resize', normalize);
  global.AIOpsColumns = {
    afterRender: normalize,
    railWidth: function (room) { return clamp(cuiWidth == null ? Math.min(600, room) : cuiWidth, 220, room); }
  };
})(window);
