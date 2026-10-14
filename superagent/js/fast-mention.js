/**
 * Fast POC page ONLY — "@" in the composer: reference a file from the left Files directory.
 *   Type "@" (at the start or after a space) → a small list of every file in the left directory
 *   (Materials + Deliverables) opens above the composer. Keep typing to filter, ↑ ↓ to move,
 *   Enter / Tab / click to pick, Esc to close. The pick becomes a file chip in the composer
 *   (same chip as an uploaded file) and the "@…" text is removed.
 */
(function () {
  'use strict';
  var input = document.getElementById('composer-input');
  var card = document.getElementById('composer-card');
  var scroll = document.getElementById('fast-files-scroll');
  if (!input || !card || !scroll) return;
  var FTI = window.FileTypeIcons;

  var pop = document.createElement('div');
  pop.className = 'fmn';
  pop.hidden = true;
  pop.setAttribute('role', 'listbox');
  pop.setAttribute('aria-label', '引用左侧目录的文件');
  document.body.appendChild(pop);

  var items = [], shown = [], active = 0, open = false, range = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* every file row currently in the left directory, with the folder it sits in */
  function collect() {
    var out = [], seen = {};
    scroll.querySelectorAll('#fast-materials, #fast-deliverables').forEach(function (tree) {
      var folder = '';
      Array.prototype.forEach.call(tree.children, function (n) {
        if (n.classList.contains('node')) {
          var l = n.querySelector('.label');
          folder = l ? l.textContent.trim() : '';
        } else if (n.classList.contains('file')) {
          var nm = n.querySelector('.name');
          var name = nm ? nm.textContent.trim() : '';
          if (!name) return;
          var indented = n.className.indexOf('indent-') >= 0;
          var key = (indented ? folder : '') + '/' + name;
          if (seen[key]) return;
          seen[key] = 1;
          out.push({ name: name, folder: indented ? folder : '', group: tree.id === 'fast-materials' ? 'Materials' : 'Deliverables' });
        }
      });
    });
    return out;
  }

  function icon(name) { return FTI ? FTI.markup(name, 16) : ''; }

  function render() {
    if (!shown.length) {
      pop.innerHTML = '<div class="fmn-empty">' + (items.length ? '没有匹配的文件' : '左侧目录里还没有文件') + '</div>';
      return;
    }
    var html = '<div class="fmn-h">引用文件</div>', last = '';
    shown.forEach(function (f, i) {
      if (f.group !== last) { last = f.group; html += '<div class="fmn-g">' + esc(f.group) + '</div>'; }
      html += '<div class="fmn-row' + (i === active ? ' is-on' : '') + '" role="option" aria-selected="' + (i === active) + '" data-i="' + i + '">' +
        '<span class="fmn-ico">' + icon(f.name) + '</span>' +
        '<span class="fmn-name">' + esc(f.name) + '</span>' +
        (f.folder ? '<span class="fmn-dir">' + esc(f.folder) + '</span>' : '') + '</div>';
    });
    pop.innerHTML = html;
    var on = pop.querySelector('.fmn-row.is-on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }

  function place() {
    var r = card.getBoundingClientRect(), w = Math.min(420, r.width);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(8, r.left) + 'px';
    var h = pop.offsetHeight;
    var top = r.top - h - 8;
    pop.style.top = (top < 8 ? Math.min(r.bottom + 8, window.innerHeight - h - 8) : top) + 'px';
  }

  function filter(q) {
    q = q.toLowerCase();
    shown = items.filter(function (f) { return !q || f.name.toLowerCase().indexOf(q) >= 0 || f.folder.toLowerCase().indexOf(q) >= 0; });
    active = 0;
    render();
    place();
  }

  function show(q) {
    if (!open) { items = collect(); open = true; pop.hidden = false; }
    filter(q);
  }
  function hide() { if (!open) return; open = false; pop.hidden = true; range = null; }

  /* is there an "@query" right before the caret? */
  function detect() {
    var v = input.value, pos = input.selectionStart == null ? v.length : input.selectionStart;
    var m = /(^|\s)@([^\s@]{0,40})$/.exec(v.slice(0, pos));
    if (!m) { hide(); return; }
    range = { from: pos - m[2].length - 1, to: pos };
    show(m[2]);
  }

  function pick(i) {
    var f = shown[i];
    if (!f || !range) return;
    var v = input.value;
    var before = v.slice(0, range.from).replace(/ +$/, ''), after = v.slice(range.to).replace(/^ +/, '');
    input.value = before + (before && after ? ' ' : '') + after;
    var caret = before.length + (before && after ? 1 : 0);
    hide();
    if (window.FastUpload && window.FastUpload.add) window.FastUpload.add(f.name);
    input.focus();
    try { input.setSelectionRange(caret, caret); } catch (e) { /* ignore */ }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  input.addEventListener('input', detect);
  input.addEventListener('click', detect);
  input.addEventListener('blur', function () { setTimeout(hide, 120); });
  input.addEventListener('keydown', function (e) {
    if (!open) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (shown.length) { active = (active + (k === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length; render(); }
    } else if ((k === 'Enter' || k === 'Tab') && !e.shiftKey && !e.isComposing) {
      if (shown.length) { e.preventDefault(); e.stopImmediatePropagation(); pick(active); }
      else hide();
    } else if (k === 'Escape') {
      e.preventDefault(); e.stopImmediatePropagation(); hide();
    }
  }, true);

  pop.addEventListener('mousedown', function (e) { e.preventDefault(); }); /* keep the caret in the input */
  pop.addEventListener('mousemove', function (e) {
    var r = e.target.closest('.fmn-row');
    if (!r) return;
    var i = +r.getAttribute('data-i');
    if (i !== active) { active = i; pop.querySelectorAll('.fmn-row').forEach(function (n) { n.classList.toggle('is-on', +n.getAttribute('data-i') === active); }); }
  });
  pop.addEventListener('click', function (e) {
    var r = e.target.closest('.fmn-row');
    if (r) pick(+r.getAttribute('data-i'));
  });
  window.addEventListener('resize', function () { if (open) place(); });
})();
