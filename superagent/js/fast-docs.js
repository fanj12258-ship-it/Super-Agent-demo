/**
 * Fast POC page ONLY — document store + right-panel viewer (not loaded by superagent.html).
 *   FastDocs.all()               → every mock doc ({ name, folder, kind, size, … })
 *   FastDocs.find(nameOrHref)    → doc | null  (matches the last path segment)
 *   FastDocs.groups()            → [{ folder, files: [doc] }] in upload order
 *   FastDocs.open(nameOrHref)    → open the right panel and show the document (tabs for several)
 *   FastDocs.readCard(docs)      → "已阅读 N 个文件" card for the chat (same .ao-fc look as the shared file card)
 * Anything with [data-doc="<file name>"] (Files rows, chat chips, read-card rows) or a chat link
 * (a.chat-cite) whose href is a known file name opens here.
 */
(function () {
  'use strict';
  var DOCS = window.FastDocsData || [];
  var FTI = window.FileTypeIcons;
  var byName = {};
  // uploaded materials only — generated deliverables and the Agent pane are opened by name
  function mats() { return DOCS.filter(function (d) { return !d.deliverable && d.kind !== 'agent'; }); }
  DOCS.forEach(function (d) { byName[d.name.toLowerCase()] = d; });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function icon(name, size) { return FTI ? FTI.markup(name, size || 14) : ''; }
  function find(h) {
    if (!h) return null;
    var s = String(h);
    try { s = decodeURIComponent(s); } catch (e) { /* keep raw */ }
    return byName[s.split('/').pop().toLowerCase()] || null;
  }
  function groups() {
    var out = [], idx = {};
    mats().forEach(function (d) {
      if (idx[d.folder] == null) { idx[d.folder] = out.length; out.push({ folder: d.folder, files: [] }); }
      out[idx[d.folder]].files.push(d);
    });
    return out;
  }

  /* ───────── chat card: files the Agent read (same look as the shared .ao-fc card) ───────── */
  function readCard(list) {
    list = list || mats();
    var folders = {};
    list.forEach(function (d) { folders[d.folder] = 1; });
    var box = el('div', 'ao-fc fd-read');
    box.innerHTML =
      '<button type="button" class="ao-fc-head is-open" aria-expanded="true">' +
      '<span class="ao-fc-title">已阅读 ' + list.length + ' 个文件</span>' +
      '<span class="ao-fc-sum"><em>' + Object.keys(folders).length + ' 个文件夹</em></span>' +
      '<span class="ao-fc-toggle">收起<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
      '</button>' +
      '<div class="ao-fc-list">' +
      list.map(function (d) {
        return '<div class="ao-fc-row fd-row" role="button" tabindex="0" data-doc="' + esc(d.name) + '">' +
          icon(d.name, 16) +
          '<span class="ao-fc-path"><span class="d">' + esc(d.folder) + ' / </span>' + esc(d.name) + '</span>' +
          '<span class="ao-fc-stat"><em>' + esc(d.size) + '</em></span></div>';
      }).join('') +
      '</div>';
    var head = box.querySelector('.ao-fc-head');
    var listEl = box.querySelector('.ao-fc-list');
    var toggle = box.querySelector('.ao-fc-toggle');
    head.addEventListener('click', function () {
      var open = listEl.hasAttribute('hidden');
      if (open) listEl.removeAttribute('hidden'); else listEl.setAttribute('hidden', '');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.childNodes[0].textContent = open ? '收起' : '查看';
      head.classList.toggle('is-open', open);
    });
    box.addEventListener('keydown', function (e) {
      var row = e.target.closest('.fd-row');
      if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); row.click(); }
    });
    return box;
  }

  /* ───────── right-panel viewer ───────── */
  var panel = document.getElementById('sidebar-right');
  var inner = panel && panel.querySelector('.right-panel-inner');
  var head = inner && inner.querySelector('.right-panel-head');
  var launch = inner && inner.querySelector('.right-panel-body');
  var railBtn = document.getElementById('toggle-right-rail');
  var tabsEl, view, meta, scroll, openList = [], current = null, panes = {};

  if (inner && head) {
    tabsEl = el('div', 'fd-tabs');
    tabsEl.setAttribute('role', 'tablist');
    head.insertBefore(tabsEl, head.firstChild);
    view = el('div', 'fd-view');
    view.hidden = true;
    meta = el('div', 'fd-meta');
    scroll = el('div', 'fd-scroll');
    view.appendChild(meta);
    view.appendChild(scroll);
    inner.appendChild(view);
  }

  function isNum(v) { return /^[−+\-]?[\d,]+(\.\d+)?%?$/.test(String(v).trim()); }

  function buildSheet(d) {
    var wrap = el('div', 'fd-sheet');
    var bodies = [];
    var tabs = el('div', 'fd-sheet-tabs');
    var main = el('div', 'fd-sheet-main');
    d.sheets.forEach(function (sh, si) {
      var colLetters = sh.cols.map(function (_, i) { return String.fromCharCode(65 + i); });
      var html = '<table class="fd-grid"><thead><tr><th class="fd-corner"></th>' +
        colLetters.map(function (l) { return '<th class="fd-letter">' + l + '</th>'; }).join('') + '</tr>' +
        '<tr><th class="fd-rn">1</th>' + sh.cols.map(function (c) { return '<th class="fd-hd">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        sh.rows.map(function (r, ri) {
          return '<tr><th class="fd-rn">' + (ri + 2) + '</th>' + r.map(function (c) {
            return '<td' + (isNum(c) ? ' class="is-num"' : '') + '>' + esc(c) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
      var pane = el('div', 'fd-sheet-pane', html);
      pane.hidden = si !== 0;
      main.appendChild(pane);
      bodies.push(pane);
      var tb = el('button', 'fd-sheet-tab' + (si === 0 ? ' is-active' : ''));
      tb.type = 'button';
      tb.textContent = sh.name;
      tb.addEventListener('click', function () {
        bodies.forEach(function (b, i) { b.hidden = i !== si; });
        Array.prototype.forEach.call(tabs.children, function (t, i) { t.classList.toggle('is-active', i === si); });
      });
      tabs.appendChild(tb);
    });
    wrap.appendChild(main);
    wrap.appendChild(tabs);
    return wrap;
  }

  function buildPane(d) {
    var pane = el('div', 'fd-pane');
    if (d.kind === 'agent') {
      pane.classList.add('is-agent');
      pane.appendChild(d.build());
    } else if (d.kind === 'sheet') {
      pane.classList.add('is-sheet');
      pane.appendChild(buildSheet(d));
    } else if (d.kind === 'flow') {
      pane.classList.add('is-flow');
      pane.appendChild(d.build());
    } else if (d.build) {
      pane.classList.add('is-custom');
      pane.appendChild(d.build());
    } else {
      var host = el('div', 'fd-doc');
      pane.appendChild(host);
      if (window.AgentBody) {
        // same renderer as the chat body; no streaming delays here
        window.AgentBody.run({ host: host, segments: [{ md: d.md, gap: 0 }], speed: 0, sleep: function () { return Promise.resolve(); } });
      } else {
        host.textContent = d.md;
      }
    }
    return pane;
  }

  var HOME_ICO = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/></svg>';
  /* back to the default launcher page of the right panel (tabs stay open) */
  function home() {
    current = null;
    view.hidden = true;
    launch.hidden = false;
    renderTabs();
    syncRows();
  }
  function resetView() {
    Object.keys(panes).forEach(function (name) { panes[name].remove(); });
    panes = {};
    openList = [];
    current = null;
    if (view) view.hidden = true;
    if (launch) launch.hidden = false;
    renderTabs();
    syncRows();
  }
  function renderTabs() {
    tabsEl.innerHTML = '';
    if (openList.length) {
      var h = el('button', 'fd-home' + (current == null ? ' is-active' : ''), HOME_ICO);
      h.type = 'button';
      h.title = '返回功能选择页';
      h.setAttribute('aria-label', '返回功能选择页');
      h.addEventListener('click', home);
      tabsEl.appendChild(h);
    }
    openList.forEach(function (n) {
      var t = el('div', 'fd-tab' + (n === current ? ' is-active' : ''));
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-selected', n === current ? 'true' : 'false');
      t.title = n;
      var dd = byName[n.toLowerCase()];
      t.innerHTML = (dd && dd.iconHtml ? dd.iconHtml : icon(n, 14)) + '<span class="fd-tab-name">' + esc(n) + '</span>' +
        '<button type="button" class="fd-tab-x" aria-label="Close ' + esc(n) + '"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>';
      t.addEventListener('click', function (e) {
        if (e.target.closest('.fd-tab-x')) { close(n); return; }
        show(n);
      });
      tabsEl.appendChild(t);
    });
  }

  function show(name) {
    var d = byName[name.toLowerCase()];
    if (!d) return;
    current = d.name;
    if (!panes[d.name]) { panes[d.name] = buildPane(d); scroll.appendChild(panes[d.name]); }
    Object.keys(panes).forEach(function (k) { panes[k].hidden = k !== d.name; });
    scroll.scrollTop = 0;
    meta.hidden = d.kind === 'agent' || d.kind === 'enterprise';
    view.classList.toggle('is-enterprise', d.kind === 'enterprise');
    view.classList.toggle('is-agent', d.kind === 'agent');
    view.classList.toggle('is-flow', d.kind === 'flow');
    meta.innerHTML = d.kind === 'agent' ? '' :
      '<span class="fd-crumb">' + (d.deliverable ? 'Deliverables' : 'Materials') + '<i>/</i>' + esc(d.folder) + '<i>/</i><b>' + esc(d.name) + '</b></span>' +
      '<span class="fd-meta-r">' + [d.pages, d.size, '更新于 ' + d.updated, d.author].filter(Boolean).map(esc).join(' · ') + '</span>';
    renderTabs();
    syncRows();
  }

  function close(name) {
    var i = openList.indexOf(name);
    if (i < 0) return;
    openList.splice(i, 1);
    if (panes[name]) { panes[name].remove(); delete panes[name]; }
    if (!openList.length) {
      current = null;
      view.hidden = true;
      launch.hidden = false;
      tabsEl.innerHTML = '';
      syncRows();
      return;
    }
    if (current === name) show(openList[Math.min(i, openList.length - 1)]); else renderTabs();
  }

  function syncRows() {
    var rows = document.querySelectorAll('#fast-files-scroll .file[data-doc]');
    Array.prototype.forEach.call(rows, function (r) {
      r.classList.toggle('is-active', current != null && r.getAttribute('data-doc') === current);
    });
  }

  function open(h) {
    var d = find(h);
    if (!d || !view) return;
    if (panel && !panel.classList.contains('is-open') && railBtn) railBtn.click();
    if (openList.indexOf(d.name) < 0) openList.push(d.name);
    launch.hidden = true;
    view.hidden = false;
    show(d.name);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-doc]');
    if (t && !e.target.closest('.fd-chip-x, .more, .fd-tab-x')) {
      if (t.tagName === 'A') e.preventDefault();
      open(t.getAttribute('data-doc'));
      return;
    }
    var a = e.target.closest('a.chat-cite');
    if (a) {
      var d = find(a.getAttribute('href'));
      if (d) { e.preventDefault(); open(d.name); }
    }
  });

  /* register a synthetic doc (the Agent pane): { name, kind:'agent', build():Node, iconHtml } */
  function register(d) {
    if (byName[d.name.toLowerCase()]) return byName[d.name.toLowerCase()];
    d.folder = d.folder || ''; DOCS.push(d); byName[d.name.toLowerCase()] = d; return d;
  }
  /* append markdown to a doc and rebuild its pane if it was already opened */
  function append(name, md) {
    var d = find(name);
    if (!d || d.kind !== 'md') return;
    d.md += md; d.updated = '今天';
    if (panes[d.name]) {
      panes[d.name].remove(); delete panes[d.name];
      if (current === d.name) show(d.name);
    }
  }

  /* replace a doc's markdown and rebuild its pane if it was opened (used by "Agent updated these documents" + undo) */
  function setMd(name, md) {
    var d = find(name);
    if (!d || d.kind !== 'md') return;
    d.md = md;
    if (panes[d.name]) {
      panes[d.name].remove(); delete panes[d.name];
      if (current === d.name) show(d.name);
    }
  }

  function rename(oldName, newName) {
    var d = find(oldName);
    if (!d || !newName || d.name === newName) return d;
    delete byName[d.name.toLowerCase()];
    if (panes[d.name]) {
      panes[newName] = panes[d.name];
      delete panes[d.name];
    }
    if (current === d.name) current = newName;
    d.name = newName;
    byName[newName.toLowerCase()] = d;
    return d;
  }

  window.FastDocs = {
    register: register,
    setMd: setMd,
    rename: rename,
    append: append,
    all: function () { return mats(); },
    find: find,
    groups: groups,
    open: open,
    resetView: resetView,
    readCard: readCard,
    icon: icon,
  };
})();
