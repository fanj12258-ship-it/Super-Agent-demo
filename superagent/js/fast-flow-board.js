/**
 * Fast POC page ONLY — editable process boards opened from 业务全景.
 *   FastFlowBoard.mount(spec) → element
 *   spec.mode 'stream' : { title, nodes: [{ title, pain?: { tag, text } }] }
 *   spec.mode 'lanes'  : { title, lanes: [{ title, kpi, steps: [{ title, pain?, fields: [{ k, v }] }] }] }
 * Text on the board is contenteditable. Edits stay in the open pane.
 */
(function () {
  'use strict';

  var FILE_SVG =
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
    '<rect x=".6" y=".6" width="14.8" height="14.8" rx="4" fill="#f4f8fd" stroke="#d7e4f2"/>' +
    '<circle cx="4.7" cy="8" r="1.15" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '<circle cx="11.2" cy="5.15" r="1.15" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '<circle cx="11.2" cy="10.85" r="1.15" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '<path d="M5.85 7.55 10 5.5M5.85 8.45 10 10.5" stroke="#b7cce6" stroke-width="1.05" stroke-linecap="round"/>' +
    '</svg>';

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function ce(text) {
    var s = el('span', 'bp-ce');
    s.contentEditable = 'true';
    s.spellcheck = false;
    s.textContent = text || '';
    s.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); s.blur(); }
    });
    s.addEventListener('paste', function (e) {
      e.preventDefault();
      var t = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s+/g, ' ');
      document.execCommand('insertText', false, t);
    });
    return s;
  }
  function arrowH() {
    var s = el('span', 'bp-join');
    s.innerHTML = '<svg width="28" height="12" viewBox="0 0 28 12" fill="none" aria-hidden="true"><path d="M1 6h22M19 2l5 4-5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return s;
  }
  function arrowV() {
    var s = el('span', 'bp-down');
    s.innerHTML = '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true"><path d="M6 1v9M2.5 7.5 6 12l3.5-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return s;
  }

  function grip() {
    var g = el('button', 'bp-grip');
    g.type = 'button';
    g.title = 'Drag to reorder';
    g.setAttribute('aria-label', 'Drag to reorder');
    g.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="3" cy="2.2" r=".7" fill="currentColor"/><circle cx="7" cy="2.2" r=".7" fill="currentColor"/><circle cx="3" cy="5" r=".7" fill="currentColor"/><circle cx="7" cy="5" r=".7" fill="currentColor"/><circle cx="3" cy="7.8" r=".7" fill="currentColor"/><circle cx="7" cy="7.8" r=".7" fill="currentColor"/></svg>';
    return g;
  }
  function fixArrows(list) {
    var n = 0;
    Array.prototype.forEach.call(list.children, function (step) {
      if (!step.classList || !step.classList.contains('bp-step')) return;
      var a = step.querySelector('.bp-join, .bp-down');
      if (a) a.hidden = n === 0;
      n++;
    });
  }
  function bindReorder(list) {
    list.addEventListener('pointerdown', function (e) {
      var handle = e.target.closest('.bp-grip');
      if (!handle || !list.contains(handle)) return;
      var step = handle.closest('.bp-step');
      if (!step || step.parentElement !== list) return;
      e.preventDefault();
      var axis = list.classList.contains('bp-stream') ? 'x' : 'y';
      step.classList.add('is-dragging');
      function pos(ev) { return axis === 'x' ? ev.clientX : ev.clientY; }
      function move(ev) {
        var p = pos(ev);
        var siblings = Array.prototype.filter.call(list.children, function (n) {
          return n !== step && n.classList && n.classList.contains('bp-step');
        });
        var before = null;
        for (var i = 0; i < siblings.length; i++) {
          var r = siblings[i].getBoundingClientRect();
          var mid = axis === 'x' ? r.left + r.width / 2 : r.top + r.height / 2;
          if (p < mid) { before = siblings[i]; break; }
        }
        if (before) list.insertBefore(step, before);
        else list.appendChild(step);
        fixArrows(list);
      }
      function up() {
        step.classList.remove('is-dragging');
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
      }
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }
  function head(title) {
    var h = el('div', 'bp-top');
    var t = el('h2');
    t.appendChild(ce(title));
    var hint = el('span', 'bp-hint');
    hint.textContent = 'Click text to edit / Drag handles to reorder';
    h.appendChild(t);
    h.appendChild(hint);
    return h;
  }

  function stream(spec) {
    var board = el('div', 'bp-board');
    board.appendChild(head(spec.title));
    var row = el('div', 'bp-stream');
    (spec.nodes || []).forEach(function (node, i) {
      var step = el('div', 'bp-step');
      if (i) step.appendChild(arrowH());
      var wrap = el('div', 'bp-node');
      var box = el('div', 'bp-box');
      box.appendChild(grip());
      box.appendChild(ce(node.title));
      wrap.appendChild(box);
      if (node.note) {
        var note = el('div', 'bp-note');
        note.appendChild(ce(node.note));
        wrap.appendChild(note);
      }
      if (node.pain) {
        var p = el('div', 'bp-pain');
        var tag = el('div', 'bp-pain-tag');
        tag.appendChild(ce(node.pain.tag));
        var tx = el('div');
        tx.appendChild(ce(node.pain.text));
        p.appendChild(tag);
        p.appendChild(tx);
        wrap.appendChild(p);
      }
      step.appendChild(wrap);
      row.appendChild(step);
    });
    fixArrows(row);
    bindReorder(row);
    board.appendChild(row);
    return board;
  }

  function lanes(spec) {
    var board = el('div', 'bp-board');
    board.appendChild(head(spec.title));
    var grid = el('div', 'bp-lanes');
    (spec.lanes || []).forEach(function (lane) {
      var col = el('section', 'bp-lane');
      var hd = el('div', 'bp-lane-h');
      var name = el('b');
      name.appendChild(ce(lane.title));
      var kpi = el('span', 'bp-kpi');
      kpi.appendChild(ce(lane.kpi || ''));
      hd.appendChild(name);
      hd.appendChild(kpi);
      col.appendChild(hd);
      (lane.steps || []).forEach(function (step, i) {
        var wrap = el('div', 'bp-step');
        if (i) wrap.appendChild(arrowV());
        var card = el('article', 'bp-card' + (step.pain ? ' is-pain' : ''));
        card.appendChild(grip());
        var h = el('h3');
        h.appendChild(ce(step.title));
        card.appendChild(h);
        (step.fields || []).forEach(function (f) {
          var row = el('div', 'bp-field');
          var k = el('span', 'bp-k');
          k.textContent = f.k;
          row.appendChild(k);
          row.appendChild(ce(f.v));
          card.appendChild(row);
        });
        if (step.pain) {
          var p = el('div', 'bp-painline');
          p.appendChild(ce(step.pain));
          card.appendChild(p);
        }
        wrap.appendChild(card);
        col.appendChild(wrap);
      });
      fixArrows(col);
      bindReorder(col);
      grid.appendChild(col);
    });
    board.appendChild(grid);
    return board;
  }

  function mount(spec) {
    spec = spec || { title: '', nodes: [] };
    if (!spec.sections) return spec.mode === 'lanes' ? lanes(spec) : stream(spec);
    var board = el('div', 'bp-board');
    board.appendChild(head(spec.title));
    spec.sections.forEach(function (s) {
      var lab = el('div', 'bp-sec');
      lab.appendChild(ce(s.title));
      board.appendChild(lab);
      var inner = s.mode === 'lanes' ? lanes(s) : stream(s);
      Array.prototype.slice.call(inner.children).forEach(function (k, idx) {
        if (idx) board.appendChild(k);
      });
    });
    return board;
  }

  window.FastFlowBoard = {
    mount: mount,
    fileIcon: function () { return FILE_SVG; },
    tabIcon: function () {
      return '<span class="ft-type-icon" style="width:14px;height:14px" aria-hidden="true">' + FILE_SVG + '</span>';
    },
  };
})();
