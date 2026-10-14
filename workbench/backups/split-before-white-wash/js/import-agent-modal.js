/* import-agent-modal.js — Import Agent modal */

// Import Agent modal
var importAgentModal = document.getElementById('import-agent-modal');
var importAgentForm = document.getElementById('import-agent-form');
var importAgentConfirm = document.getElementById('import-agent-confirm');
var importAgentDraft = null;
var IMPORT_MODELS = ['qwen3.7-max', 'deepseek-v4-pro', 'glm-5.3-flash'];
var IMPORT_COLORS = ['#0d8ae6', '#6a54f0', '#0f766e', '#c2410c', '#1d4ed8', '#64748b'];
var IMPORT_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10.2V3.8M5.5 6.2L8 3.7l2.5 2.5M3.8 12.2h8.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function resetImportAgentDraft() {
  importAgentDraft = {
    source: 'file',
    fileName: '',
    name: '',
    role: '',
    model: IMPORT_MODELS[0],
    kind: 'Single agent',
    mode: 'Autonomous planning',
    color: IMPORT_COLORS[0]
  };
}

function syncImportAgentConfirm() {
  if (!importAgentConfirm || !importAgentDraft) return;
  importAgentConfirm.disabled = !(importAgentDraft.name.trim() && importAgentDraft.fileName);
}

function renderImportAgentForm() {
  if (!importAgentForm || !importAgentDraft) return;
  var d = importAgentDraft;
  var letter = (d.name.trim().charAt(0) || 'A').toUpperCase();
  var sources = [
    { id: 'file', label: 'Package' },
    { id: 'url', label: 'URL' },
    { id: 'template', label: 'Template' }
  ].map(function (s) {
    return '<button type="button" data-im-source="' + s.id + '"' + (d.source === s.id ? ' class="is-on"' : '') + '>' + s.label + '</button>';
  }).join('');
  var models = IMPORT_MODELS.map(function (m) {
    return '<button type="button" data-im-model="' + m + '"' + (d.model === m ? ' class="is-on"' : '') + '>' + m + '</button>';
  }).join('');
  var kinds = ['Single agent', 'Multi-agent'].map(function (k) {
    return '<button type="button" data-im-kind="' + k + '"' + (d.kind === k ? ' class="is-on"' : '') + '>' + k + '</button>';
  }).join('');
  var modes = ['Autonomous planning', 'Workflow'].map(function (m) {
    return '<button type="button" data-im-mode="' + m + '"' + (d.mode === m ? ' class="is-on"' : '') + '>' + m + '</button>';
  }).join('');
  var colors = IMPORT_COLORS.map(function (c) {
    return '<button type="button" class="im-color' + (d.color === c ? ' is-on' : '') + '" data-im-color="' + c + '" style="background:' + c + '" aria-label="Color"></button>';
  }).join('');
  var dropOn = d.fileName ? ' is-on' : '';
  var dropBody = d.fileName
    ? '<div class="im-drop-ico">' + IMPORT_ICON + '</div><div class="im-drop-title">Package ready</div><div class="im-drop-sub">Click to replace · demo only</div><span class="im-drop-file">' + escapeHtmlModal(d.fileName) + '</span>'
    : '<div class="im-drop-ico">' + IMPORT_ICON + '</div><div class="im-drop-title">Drop agent package</div><div class="im-drop-sub">.agent.json / .zip · or click to choose (demo)</div>';

  importAgentForm.innerHTML =
    '<section class="sm-card">' +
    '<div class="sm-card-head"><span class="sm-chip sm-chip-agent">' + IMPORT_ICON + '</span><h3 class="sm-card-title">Source</h3><span class="sm-tag">Mock import</span></div>' +
    '<div class="sm-field"><label class="sm-label">Import from</label><div class="sm-seg" role="group">' + sources + '</div></div>' +
    '<button type="button" class="im-drop' + dropOn + '" data-im-pick>' + dropBody + '</button>' +
    '</section>' +
    '<section class="sm-card">' +
    '<div class="sm-card-head"><span class="sm-chip sm-chip-app">' + ICON_APP + '</span><h3 class="sm-card-title">Agent details</h3></div>' +
    smField('Name <span class="sm-req">*</span>', { id: 'import-agent-name', max: 50, value: d.name, placeholder: 'e.g. Contract review assistant', attrs: 'data-im-field="name"' }) +
    smField('Description <span class="sm-opt">Optional</span>', { area: true, max: 200, value: d.role, placeholder: 'What this agent does for the team', attrs: 'data-im-field="role"' }) +
    '<div class="sm-field"><label class="sm-label">Model</label><div class="sm-seg" role="group" style="flex-wrap:wrap">' + models + '</div></div>' +
    '<div class="sm-row">' +
    '<div class="sm-field sm-grow"><label class="sm-label">Type</label><div class="sm-seg" role="group">' + kinds + '</div></div>' +
    '<div class="sm-field sm-grow"><label class="sm-label">Planning</label><div class="sm-seg" role="group">' + modes + '</div></div>' +
    '</div>' +
    '<div class="sm-field"><label class="sm-label">Avatar color</label><div class="im-colors">' + colors + '</div></div>' +
    '</section>' +
    '<section class="sm-card" style="background:#fff">' +
    '<div class="sm-card-head"><h3 class="sm-card-title">Preview</h3><span class="sm-tag">Agent catalog</span></div>' +
    '<div class="im-preview">' +
    '<span class="ag-ava" style="background:' + d.color + '">' + letter + '</span>' +
    '<div><div class="im-preview-name">' + escapeHtmlModal(d.name.trim() || 'Untitled agent') + '</div>' +
    '<div class="im-preview-role">' + escapeHtmlModal(d.role.trim() || 'Description will show here') + '</div>' +
    '<div class="im-preview-meta"><span class="ag-model">' + escapeHtmlModal(d.model) + '</span>' +
    '<span class="ag-tag">' + escapeHtmlModal(d.kind) + '</span><span class="ag-tag">' + escapeHtmlModal(d.mode) + '</span></div></div></div>' +
    '</section>';
  syncImportAgentConfirm();
}

function fillDemoImportAgent() {
  if (!importAgentDraft) return;
  importAgentDraft.source = 'file';
  importAgentDraft.fileName = 'contract-review.agent.json';
  importAgentDraft.name = 'Contract review assistant';
  importAgentDraft.role = 'Read contracts, flag risk clauses, and draft CS-ready summaries for the team.';
  importAgentDraft.model = 'qwen3.7-max';
  importAgentDraft.kind = 'Single agent';
  importAgentDraft.mode = 'Autonomous planning';
  importAgentDraft.color = '#0d8ae6';
  renderImportAgentForm();
  requestAnimationFrame(function () {
    if (importAgentConfirm) importAgentConfirm.focus();
  });
}

function closeImportAgentModal() {
  if (!importAgentModal) return;
  importAgentModal.classList.remove('is-open');
  importAgentModal.hidden = true;
  importAgentModal.setAttribute('aria-hidden', 'true');
  importAgentDraft = null;
  if (importAgentForm) importAgentForm.innerHTML = '';
  if (importAgentConfirm) importAgentConfirm.disabled = true;
}

function openImportAgentModal() {
  if (!importAgentModal) return;
  closeCreateSceneModal();
  closeAcct();
  resetImportAgentDraft();
  renderImportAgentForm();
  importAgentModal.hidden = false;
  importAgentModal.classList.add('is-open');
  importAgentModal.setAttribute('aria-hidden', 'false');
  importAgentForm.scrollTop = 0;
  requestAnimationFrame(function () {
    var name = document.getElementById('import-agent-name');
    if (name) name.focus();
  });
}

if (importAgentModal) {
  document.getElementById('btnImport').addEventListener('click', function (e) {
    e.stopPropagation();
    openImportAgentModal();
  });
  importAgentModal.addEventListener('click', function (event) {
    if (event.target.closest('[data-import-close]')) closeImportAgentModal();
  });
  importAgentForm.addEventListener('keydown', function (event) {
    if (event.key !== ' ' && event.code !== 'Space') return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    fillDemoImportAgent();
  });
  importAgentForm.addEventListener('input', function (event) {
    var t = event.target;
    var field = t.getAttribute('data-im-field');
    var count = t.parentNode.querySelector('.sm-count');
    if (count) count.textContent = t.value.length + '/' + t.maxLength;
    if (field && importAgentDraft) {
      importAgentDraft[field] = t.value;
      syncImportAgentConfirm();
      var letter = (importAgentDraft.name.trim().charAt(0) || 'A').toUpperCase();
      var prevName = importAgentForm.querySelector('.im-preview-name');
      var prevRole = importAgentForm.querySelector('.im-preview-role');
      var prevAva = importAgentForm.querySelector('.im-preview .ag-ava');
      if (prevName) prevName.textContent = importAgentDraft.name.trim() || 'Untitled agent';
      if (prevRole) prevRole.textContent = importAgentDraft.role.trim() || 'Description will show here';
      if (prevAva) prevAva.textContent = letter;
    }
  });
  importAgentForm.addEventListener('click', function (event) {
    var pick = event.target.closest('[data-im-pick]');
    if (pick && importAgentDraft) {
      importAgentDraft.fileName = importAgentDraft.fileName || 'contract-review.agent.json';
      if (!importAgentDraft.name.trim()) {
        importAgentDraft.name = 'Contract review assistant';
        importAgentDraft.role = 'Read contracts, flag risk clauses, and draft CS-ready summaries for the team.';
      }
      renderImportAgentForm();
      return;
    }
    var src = event.target.closest('[data-im-source]');
    if (src && importAgentDraft) {
      importAgentDraft.source = src.getAttribute('data-im-source');
      renderImportAgentForm();
      return;
    }
    var model = event.target.closest('[data-im-model]');
    if (model && importAgentDraft) {
      importAgentDraft.model = model.getAttribute('data-im-model');
      renderImportAgentForm();
      return;
    }
    var kind = event.target.closest('[data-im-kind]');
    if (kind && importAgentDraft) {
      importAgentDraft.kind = kind.getAttribute('data-im-kind');
      renderImportAgentForm();
      return;
    }
    var mode = event.target.closest('[data-im-mode]');
    if (mode && importAgentDraft) {
      importAgentDraft.mode = mode.getAttribute('data-im-mode');
      renderImportAgentForm();
      return;
    }
    var color = event.target.closest('[data-im-color]');
    if (color && importAgentDraft) {
      importAgentDraft.color = color.getAttribute('data-im-color');
      renderImportAgentForm();
    }
  });
  importAgentForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!importAgentDraft || !importAgentDraft.name.trim() || !importAgentDraft.fileName) return;
    var letter = importAgentDraft.name.trim().charAt(0).toUpperCase();
    importedAgents.push({
      name: importAgentDraft.name.trim(),
      role: importAgentDraft.role.trim() || 'Imported agent — no description yet.',
      model: importAgentDraft.model,
      caps: [importAgentDraft.kind, importAgentDraft.mode],
      status: 'Draft',
      state: 'draft',
      runs: 'Not published',
      color: importAgentDraft.color,
      letter: letter
    });
    closeImportAgentModal();
    items.forEach(function (i) { i.classList.toggle('is-active', i.dataset.view === 'agent'); });
    render('agent');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && importAgentModal.classList.contains('is-open')) closeImportAgentModal();
  });
}
