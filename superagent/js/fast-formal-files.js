/**
 * Fast POC page ONLY — Files tab · Deliverables splits into two small tabs once the user switches to 按流程打造:
 *   轻量底稿  = everything the light mode produced (read-only from now on, kept for comparison)
 *   正式目录  = the real environment's directory (8 steps). Each document carries a status dot —
 *               沿用 / 需校对 / Mock 需改 / 需再创作 — and is either carried over from the draft or an empty placeholder.
 * Before the switch there is only the draft list (no tabs). Directory structure is illustrative until the PM's structure lands.
 * Data comes from FastSwitchDialog.data / .picked (what the user ticked).
 */
(function () {
  'use strict';
  var group = document.querySelector('#fast-files-scroll [data-section="deliverable"]');
  var draft = document.getElementById('fast-deliverables');
  if (!group || !draft || !window.FastSwitchDialog) return;
  var FTI = window.FileTypeIcons;

  /* real-env document → the draft file it can open (if the quick version really wrote one) */
  var OPEN = {
    'Product plan': 'Product plan v0.1.md', 'Ontology plan': 'Ontology plan v0.1.md', 'Agent plan': 'Agent plan v0.1.md',
    'Agent spec': 'Agent spec v0.1.md', 'Semantic graph': 'Ontology stub.json'
  };
  var EXT = { 'Product plan': 'md', 'Ontology plan': 'md', 'Agent plan': 'md', 'Agent spec': 'md', 'Semantic graph': 'json' };
  var APPX = ['Mapping list v0.1.md', 'Trial log v0.1.md', 'Release checklist v0.1.md'];
  var FOLDER = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';
  var CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5l7 7-7 7"/></svg>';
  var MORE = '<div class="row-actions"><button type="button" class="more" aria-label="More"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button></div>';
  var SEED = { 'Requirements brief': 'md', 'Success criteria': 'md', 'Contracts · rules': 'xlsx', 'Process notes': 'md', 'ERP export': 'xlsx', 'Data source spec': 'md', 'Skill specs': 'md', 'MCP specs': 'md', 'Resource list': 'md' };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fileIcon(name) {
    var type = FTI ? FTI.typeOf(name) : 'file';
    return '<span class="file-icon file-icon--' + type + '" aria-hidden="true">' + (FTI ? FTI.svg(type) : '') + '</span>';
  }

  /* ── the two small tabs ── */
  var seg = document.createElement('div');
  seg.className = 'ffm-seg'; seg.hidden = true;
  seg.innerHTML = '<button type="button" class="ffm-seg-b" data-v="formal">正式目录</button><button type="button" class="ffm-seg-b" data-v="draft">轻量底稿</button>';
  var formal = document.createElement('div');
  formal.className = 'tree ffm-tree'; formal.id = 'fast-formal'; formal.setAttribute('role', 'tree'); formal.setAttribute('aria-label', '正式目录'); formal.hidden = true;
  draft.parentNode.insertBefore(seg, draft);
  draft.parentNode.insertBefore(formal, draft.nextSibling);
  var view = 'draft', shown = false;

  function setView(v, flash) {
    view = v;
    seg.querySelectorAll('.ffm-seg-b').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-v') === v); });
    draft.hidden = v !== 'draft';
    formal.hidden = v !== 'formal';
    if (v === 'formal' && flash) formal.classList.add('ffm-flash');
    if (v !== 'formal') formal.classList.remove('ffm-flash');
  }
  seg.addEventListener('click', function (e) { var b = e.target.closest('.ffm-seg-b'); if (b) setView(b.getAttribute('data-v')); });

  /* ── the formal directory ── */
  function dotHtml(k, label) { return '<span class="ffm-dot ffm-' + k + '" title="' + esc(label) + '"></span>'; }
  /* first three folders read "Name · code"; the rest keep their own "n · Name" */
  var STEPTAG = { '1': 'SRP', '2': 'SKP', '3–5': 'SDP' };
  function folderName(g) { return STEPTAG[g[0]] ? g[1] + ' · ' + STEPTAG[g[0]] : g[0] + ' · ' + g[1]; }
  /* folders the user has collapsed (SRP / SKP / SDP start collapsed; survives rebuilds) */
  var closed = { '1': 1, '2': 1, '3–5': 1 };
  function build() {
    var D = window.FastSwitchDialog, picked = D.picked, S = window.FastSandbox && window.FastSandbox.state;
    var prod = S && S.phase === 'production';
    var html = '';
    D.data.forEach(function (g) {
      var gc = !!closed[g[0]];
      html += '<div class="node' + (gc ? '' : ' is-open') + '" data-kind="folder" data-key="' + esc(g[0]) + '" role="treeitem" aria-expanded="' + (gc ? 'false' : 'true') + '">' + CHEV + FOLDER + '<span class="label">' + esc(folderName(g)) + '</span>' + MORE + '</div>';
      g[2].forEach(function (r) {
        var name = r[0], k = r[3], st = D.status[k];
        var carried = !picked || picked.indexOf(name) >= 0;
        var ph = k === 'new' || !carried;                       // nothing to carry → empty placeholder
        var ext = EXT[name] || SEED[name] || 'md';
        var docName = !ph && OPEN[name] && window.FastDocs && window.FastDocs.find(OPEN[name]) ? OPEN[name] : '';
        var tag = ph ? (k === 'new' ? '待创作' : '未带过去') : '';
        var from = !ph ? '<span class="ffm-from">来自轻量底稿</span>' : '';
        html += '<div class="file indent-1' + (ph ? ' ffm-ph' : '') + (gc ? ' is-hidden' : '') + '" data-kind="file" role="treeitem"' + (docName ? ' data-doc="' + esc(docName) + '"' : '') + ' data-folder="' + esc(g[0]) + '">' +
          fileIcon(name + '.' + ext) +
          '<div class="info"><div class="name">' + esc(name) + '</div></div>' +
          (tag ? '<span class="ffm-note">' + tag + '</span>' : from) +
          (prod ? '' : dotHtml(k, st.t)) + MORE + '</div>';
      });
    });
    html += '<div class="node is-open" data-kind="folder" data-key="Appendix" role="treeitem" aria-expanded="true">' + CHEV + FOLDER + '<span class="label">Appendix · 交接记录</span>' + MORE + '</div>';
    APPX.concat(prod ? ['Release notes v1.0.md'] : []).forEach(function (n) {
      var ok = window.FastDocs && window.FastDocs.find(n);
      html += '<div class="file indent-1" data-kind="file" role="treeitem"' + (ok ? ' data-doc="' + esc(n) + '"' : '') + ' data-folder="Appendix">' + fileIcon(n) + '<div class="info"><div class="name">' + esc(n.replace(/\.[a-z]+$/, '')) + '</div></div>' + MORE + '</div>';
    });
    if (!prod) html += '<div class="ffm-legend" aria-label="状态说明"><span><i class="ffm-dot ffm-keep"></i>沿用</span><span><i class="ffm-dot ffm-chk"></i>需校对</span><span><i class="ffm-dot ffm-mock"></i>Mock 需改</span><span><i class="ffm-dot"></i>需再创作</span></div>';
    formal.innerHTML = html;
  }

  formal.addEventListener('click', function (e) {
    if (e.target.closest('.more')) return;
    var node = e.target.closest('.node');
    if (node) {
      var open = !node.classList.contains('is-open');
      node.classList.toggle('is-open', open); node.setAttribute('aria-expanded', open ? 'true' : 'false');
      var key = node.getAttribute('data-key');
      if (open) delete closed[key]; else closed[key] = 1;
      formal.querySelectorAll('.file[data-folder="' + key + '"]').forEach(function (r) { r.classList.toggle('is-hidden', !open); });
      return;
    }
    var row = e.target.closest('.file');
    if (!row) return;
    document.querySelectorAll('#fast-files-scroll .file.is-active').forEach(function (r) { r.classList.remove('is-active'); });
    row.classList.add('is-active');
  });

  /* ── follow the sandbox phase ── */
  function sync() {
    var S = window.FastSandbox && window.FastSandbox.state;
    var on = !!(S && S.generated && S.phase !== 'sandbox');
    if (on && !shown) {
      shown = true; seg.hidden = false;
      build();
      if (window.FastFiles) { window.FastFiles.hideFolders(['Handoff v0.1', 'Release v1.0'], true); window.FastFiles.markNew(); if (window.FastFiles.collapseFolders) window.FastFiles.collapseFolders('material'); }
      setView('formal', true);
    } else if (on) {
      build();
    } else if (!on && shown) {
      shown = false; seg.hidden = true; formal.hidden = true; draft.hidden = false;
      if (window.FastFiles) window.FastFiles.hideFolders([], false);
    }
  }
  document.addEventListener('fastsandbox', sync);
  window.FastFormalFiles = { sync: sync };
  setView('draft');
})();
