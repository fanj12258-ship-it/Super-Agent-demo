/**
 * Fast POC page ONLY — Files tab driver (not loaded by superagent.html).
 *   FastFiles.addDeliverable('销售分货 Agent MVP.md')                → Deliverables group + row
 *   FastFiles.addMaterial('库存表.xlsx')                             → Materials group + row
 *   FastFiles.addMaterial('Historical contracts/Contract.xlsx')      → "Folder/File": the folder row is created on demand
 *   FastFiles.reset()                                                 → back to "暂无文档"
 *   FastFiles.showTab(true|false)                                     → switch the sidebar to Files / back to the scene tab
 * Rows reuse the shared tree markup (.node folder rows · .file rows · Seti icons) from js/files-panel.js,
 * so they look exactly like the original (now hidden) mock tree. Rows with a known doc get [data-doc]
 * → click opens it in the right panel (js/fast-docs.js). The Files tab shows a dot while new files arrive
 * and it is not the active tab.
 */
(function () {
  'use strict';
  var scroll = document.getElementById('fast-files-scroll');
  if (!scroll) return;
  var FTI = window.FileTypeIcons;
  var filesTab = document.querySelector('.sidebar-tab[data-tab="files"]');
  var sceneTab = document.querySelector('.sidebar-tab[data-tab="scene"]');
  var syncTip = document.getElementById('fast-sync-tip');
  var syncTipText = syncTip && syncTip.querySelector('.fast-sync-tip-text');
  var MORE =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
  var CHEV =
    '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5l7 7-7 7"/></svg>';
  var FOLDER =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';

  var groups = {
    material: {
      tree: document.getElementById('fast-materials'),
      group: scroll.querySelector('[data-section="material"]'),
      count: document.getElementById('files-count'),
      n: 0,
      folders: {},
    },
    deliverable: {
      tree: document.getElementById('fast-deliverables'),
      group: scroll.querySelector('[data-section="deliverable"]'),
      count: document.getElementById('deliverables-count'),
      n: 0,
      folders: {},
    },
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function sync() {
    var filesAny = false;
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      var hasItems = g.n > 0 || Object.keys(g.folders).length > 0;
      g.group.classList.toggle('has-items', hasItems);
      if (g.count) g.count.textContent = g.n;
      if (hasItems) filesAny = true;
    });
    scroll.classList.toggle('has-any', filesAny);
  }

  /* optional leading mark for one folder — the enterprise dossier uses its own, not the outline folder */
  var marks = {};
  var updatedEntries = {};
  function setEntryUpdated(name, on) {
    updatedEntries[name] = !!on;
    Object.keys(groups).forEach(function (kind) {
      var g = groups[kind];
      var folder = g.folders[name];
      if (folder) folder.node.classList.toggle('has-update-dot', !!on);
      Array.prototype.forEach.call(g.tree.querySelectorAll('.file'), function (row) {
        var label = row.querySelector('.name');
        if (label && label.textContent === name) row.classList.toggle('has-update-dot', !!on);
      });
    });
  }
  function ensureFolder(g, name, options) {
    if (g.folders[name]) return g.folders[name];
    var opts = options || {};
    var open = opts.open !== false;
    var collapsible = opts.collapsible !== false;
    var mark = marks[name];
    var icon = !mark ? '' : (typeof mark === 'string' ? mark : (mark.icon || ''));
    var tag = mark && typeof mark === 'object' ? mark.tag : '';
    var node = document.createElement('div');
    node.className = 'node' + (open ? ' is-open' : '') + (collapsible ? '' : ' is-static-folder') +
      (opts.animate === false ? '' : ' is-new') + (icon ? ' is-dossier' : '');
    node.setAttribute('data-kind', 'folder');
    node.setAttribute('role', 'treeitem');
    if (opts.openAsset) {
      node.setAttribute('data-enterprise-asset', opts.openAsset);
      node.setAttribute('tabindex', '0');
      node.setAttribute('aria-label', '打开' + name);
    }
    if (collapsible) node.setAttribute('aria-expanded', open ? 'true' : 'false');
    node.innerHTML = (collapsible ? CHEV : '') + (icon || FOLDER) + '<span class="label">' + esc(name) + '</span>' +
      (tag ? '<span class="folder-tag">' + esc(tag) + '</span>' : '') +
      '<div class="row-actions"><button type="button" class="more" aria-label="More">' + MORE + '</button></div>';
    node.classList.toggle('has-update-dot', !!updatedEntries[name]);
    node.addEventListener('animationend', function () { node.classList.remove('is-new'); });
    g.tree.appendChild(node);
    g.folders[name] = { node: node, files: [] };
    return g.folders[name];
  }

  /* once the formal directory exists, the hand-off / release folders live there (Appendix) — keep them out of the draft tab */
  var hideSet = {}, hideOn = false;
  function applyHide(g) {
    Object.keys(hideSet).forEach(function (name) {
      var f = g.folders[name]; if (!f) return;
      f.node.classList.toggle('ffm-gone', hideOn); f.files.forEach(function (r) { r.classList.toggle('ffm-gone', hideOn); });
    });
  }
  function add(kind, path) {
    var g = groups[kind];
    var parts = String(path).split('/');
    var name = parts.pop();
    var folder = parts.length ? ensureFolder(g, parts.join('/')) : null;
    var type = FTI ? FTI.typeOf(name) : 'file';
    var doc = window.FastDocs && window.FastDocs.find(name);
    var glyph = (doc && doc.kind === 'flow' && window.FastFlowBoard) ? window.FastFlowBoard.fileIcon() : (FTI ? FTI.svg(type) : '');
    var row = document.createElement('div');
    row.className = 'file is-new' + (kind === 'deliverable' ? ' has-update-dot' : '') + (folder ? ' indent-1' : '');
    row.setAttribute('data-kind', 'file');
    row.setAttribute('role', 'treeitem');
    if (doc) row.setAttribute('data-doc', doc.name);
    row.innerHTML =
      '<span class="file-icon file-icon--' + type + '" aria-hidden="true">' + glyph + '</span>' +
      '<div class="info"><div class="name">' + esc(name) + '</div></div>' +
      '<div class="row-actions"><button type="button" class="more" aria-label="More">' + MORE + '</button></div>';
    row.addEventListener('animationend', function () { row.classList.remove('is-new'); });
    if (folder) {
      var last = folder.files.length ? folder.files[folder.files.length - 1] : folder.node;
      last.parentNode.insertBefore(row, last.nextSibling);
      folder.files.push(row);
      if (!folder.node.classList.contains('is-open')) row.classList.add('is-hidden');
    } else {
      g.tree.appendChild(row);
    }
    g.n++;
    if (hideOn && kind === 'deliverable') applyHide(g);
    sync();
    if (filesTab && !filesTab.classList.contains('is-active')) filesTab.classList.add('has-dot');
    return row;
  }

  function onTreeClick(e) {
    if (e.target.closest('.more')) return;
    var folderRow = e.target.closest('#fast-materials .node, #fast-deliverables .node');
    if (folderRow) {
      if (folderRow.hasAttribute('data-enterprise-asset')) {
        setEntryUpdated(folderRow.querySelector('.label').textContent, false);
        if (window.EnterpriseAssets) window.EnterpriseAssets.open(folderRow.getAttribute('data-enterprise-asset'));
        return;
      }
      if (folderRow.classList.contains('is-static-folder')) return;
      var open = !folderRow.classList.contains('is-open');
      folderRow.classList.toggle('is-open', open);
      folderRow.setAttribute('aria-expanded', open ? 'true' : 'false');
      Object.keys(groups).forEach(function (k) {
        var f = groups[k].folders[folderRow.querySelector('.label').textContent];
        if (f && f.node === folderRow) f.files.forEach(function (r) { r.classList.toggle('is-hidden', !open); });
      });
      return;
    }
    var row = e.target.closest('#fast-materials .file, #fast-deliverables .file');
    if (!row) return;
    var rowName = row.querySelector('.name');
    if (rowName) setEntryUpdated(rowName.textContent, false);
    scroll.querySelectorAll('.file.is-active').forEach(function (r) { r.classList.remove('is-active'); });
    row.classList.add('is-active');
  }
  scroll.addEventListener('click', onTreeClick);
  scroll.addEventListener('keydown', function (e) {
    var folder = e.target.closest('[data-enterprise-asset]');
    if (!folder || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    setEntryUpdated(folder.querySelector('.label').textContent, false);
    if (window.EnterpriseAssets) window.EnterpriseAssets.open(folder.getAttribute('data-enterprise-asset'));
  });

  function showTab(files) {
    var t = files ? filesTab : sceneTab;
    if (t && !t.classList.contains('is-active')) t.click();
  }
  if (filesTab) filesTab.addEventListener('click', function () { filesTab.classList.remove('has-dot'); });
  if (syncTip) {
    syncTip.addEventListener('click', function (e) {
      if (e.target.closest('[data-sync-dismiss]')) {
        syncTip.hidden = true;
        return;
      }
      if (e.target.closest('[data-sync-open]')) {
        window.location.href = '../workbench/agentos-workbench.html';
      }
    });
  }

  window.FastFiles = {
    addDeliverable: function (name) { return add('deliverable', name); },
    markFolder: function (name, html) { marks[name] = html; },
    addMaterial: function (name) { return add('material', name); },
    addFolder: function (kind, name, options) {
      var g = groups[kind];
      if (!g) return null;
      var folder = ensureFolder(g, name, options);
      sync();
      return folder.node;
    },
    removeEmptyFolder: function (kind, name) {
      var g = groups[kind];
      var folder = g && g.folders[name];
      if (!folder || folder.files.length) return false;
      folder.node.remove();
      delete g.folders[name];
      sync();
      return true;
    },
    showTab: showTab,
    markUpdated: function (name) { setEntryUpdated(name, true); },
    clearUpdated: function (name) { setEntryUpdated(name, false); },
    showSyncTip: function (message) {
      if (!syncTip) return;
      if (syncTipText && message) syncTipText.textContent = message;
      syncTip.hidden = false;
    },
    hideFolders: function (names, on) { hideSet = {}; (names || []).forEach(function (n) { hideSet[n] = 1; }); hideOn = !!on; applyHide(groups.deliverable); },
    collapseFolders: function (kind) {
      var g = groups[kind]; if (!g) return;
      Object.keys(g.folders).forEach(function (k) {
        var f = g.folders[k];
        if (f.node.classList.contains('is-static-folder')) return;
        f.node.classList.remove('is-open'); f.node.setAttribute('aria-expanded', 'false');
        f.files.forEach(function (r) { r.classList.add('is-hidden'); });
      });
    },
    markNew: function () { if (filesTab && !filesTab.classList.contains('is-active')) filesTab.classList.add('has-dot'); },
    reset: function () {
      Object.keys(groups).forEach(function (k) { groups[k].tree.innerHTML = ''; groups[k].n = 0; groups[k].folders = {}; });
      updatedEntries = {};
      if (syncTip) syncTip.hidden = true;
      sync();
    },
  };
  sync();
})();
