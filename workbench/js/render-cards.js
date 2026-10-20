/* render-cards.js — card renderers per page: Agent, Scenario, Knowledge, Skill, Ontology, MCP, Files */

function renderAgent(list) {
  return '<div class="grid-agent">' + list.map(function (it) {
    var action = '';
    if (it.state === 'live') {
      action = '<button type="button" class="ag-cta try" data-agent-action="try" data-agent="' + escapeHtmlModal(it.name) + '">Try</button>';
    } else if (it.state === 'ready') {
      action = '<button type="button" class="ag-cta publish" data-agent-action="goto-publish" data-agent="' + escapeHtmlModal(it.name) + '">Go to publish</button>';
    } else if (it.state === 'draft') {
      action = '<button type="button" class="ag-cta build" data-agent-action="build" data-agent="' + escapeHtmlModal(it.name) + '">Continue building</button>';
    } else {
      action = '<span class="ag-runs">' + escapeHtmlModal(it.runs) + '</span>';
    }
    return '<div class="card ag-card' + (it.isNew ? ' is-new' : '') + '" data-agent-card="' + escapeHtmlModal(it.name) + '">' +
      (it.isNew ? '<span class="ag-new">New</span>' : '') +
      '<div class="ag-main">' +
      '<div class="ag-top"><span class="ag-ava" style="background:' + it.color + '">' + it.letter + '</span>' +
      '<div class="ag-copy"><div class="ag-name">' + escapeHtmlModal(it.name) + '</div><div class="ag-role">' + escapeHtmlModal(it.role) + '</div></div></div>' +
      '<div class="ag-meta"><span class="ag-model" title="' + escapeHtmlModal(it.model) + '">' + escapeHtmlModal(it.model) + '</span>' +
      it.caps.map(function (c) { return '<span class="ag-tag">' + escapeHtmlModal(c) + '</span>'; }).join('') +
      '</div></div>' +
      '<div class="ag-foot"><span class="ag-status"><span class="ag-dot ' + it.state + '"></span>' + escapeHtmlModal(it.status) + '</span>' + action + '</div>' +
      '</div>';
  }).join('') + '</div>';
}

var STAGE_LABEL = {
  not_started: 'Not started',
  crafting: 'Crafting',
  ready: 'Ready',
  live: 'Live'
};

function stageChip(stage) {
  var key = stage || 'not_started';
  var label = STAGE_LABEL[key] || STAGE_LABEL.not_started;
  return '<span class="sc-stage is-' + key + '"><span class="dot" aria-hidden="true"></span>' + label + '</span>';
}

function scenarioAppCta(stage) {
  if (stage === 'live') return { label: 'Iterate', cls: ' is-soft', mode: 'iterate' };
  if (stage === 'ready') return { label: 'Go to launch', cls: '', mode: 'launch' };
  if (stage === 'crafting') return { label: 'Continue crafting', cls: '', mode: 'craft' };
  return { label: 'Start crafting', cls: '', mode: 'craft' };
}
function scenarioBizCta(stage) {
  /* Biz rows stay ghost/outline — only app footer owns the solid CTA */
  if (stage === 'live') return { label: 'Iterate', cls: '', mode: 'iterate' };
  if (stage === 'ready') return { label: 'Finalize', cls: '', mode: 'launch' };
  if (stage === 'crafting') return { label: 'Continue crafting', cls: '', mode: 'craft' };
  return { label: 'Start crafting', cls: '', mode: 'craft' };
}

function renderBizRow(appName, biz, extra) {
  var cta = scenarioBizCta(biz.stage);
  return '<div class="sc-biz' + (extra ? ' is-extra' : '') + '">' +
    '<div><div class="sc-biz-name">' + escapeHtmlModal(biz.name) + '</div>' +
    '<div class="sc-biz-desc">' + escapeHtmlModal(biz.desc) + '</div>' +
    '<div class="sc-biz-meta"><span class="sc-chip pri">' + escapeHtmlModal(biz.priority) + '</span>' + stageChip(biz.stage) + '</div></div>' +
    '<div class="sc-biz-side">' +
    '<button type="button" class="sc-biz-build' + cta.cls + '" data-scene-action="build-biz" data-scene-mode="' + cta.mode + '" data-scene="' + escapeHtmlModal(appName) + '" data-biz="' + escapeHtmlModal(biz.name) + '">' + cta.label + '</button></div></div>';
}

function renderScenario(list) {
  return '<div class="sc-grid">' + list.map(function (app) {
    var assets = (app.assets || []);
    var readyN = assets.filter(function (a) { return a.state === 'is-done'; }).length;
    var workingN = assets.filter(function (a) { return a.state === 'is-partial'; }).length;
    var assetChips = assets.map(function (a) {
      return '<span class="sc-asset" title="' + escapeHtmlModal(a.label) + '"><span class="dot ' + a.state + '" aria-hidden="true"></span><b>' + escapeHtmlModal(a.type) + '</b></span>';
    }).join('');
    var summary = readyN + ' ready' + (workingN ? ' · ' + workingN + ' in progress' : '');
    var kids = (app.businesses || []);
    var visible = kids.slice(0, 2);
    var hidden = kids.slice(2);
    var moreN = hidden.length;
    var childHtml;
    if (!kids.length) {
      childHtml = '<div class="sc-children"><div class="sc-child-label">Business scenarios · 0</div>' +
        '<div class="sc-biz-list"><div class="sc-biz"><div><div class="sc-biz-name">No business scenarios yet</div>' +
        '<div class="sc-biz-desc">Add business scenarios under this application scenario.</div></div></div></div></div>';
    } else {
      childHtml = '<div class="sc-children">' +
        '<div class="sc-child-label">Business scenarios · ' + kids.length + '</div>' +
        '<div class="sc-biz-list">' +
        visible.map(function (biz) { return renderBizRow(app.name, biz, false); }).join('') +
        hidden.map(function (biz) { return renderBizRow(app.name, biz, true); }).join('') +
        '</div>' +
        (moreN
          ? '<button type="button" class="sc-more" data-scene-more="1" data-more-label="Show ' + moreN + ' more" data-less-label="Show less">Show ' + moreN + ' more</button>'
          : '') +
        '</div>';
    }
    var appCta = scenarioAppCta(app.stage);
    return '<section class="sc-app' + (app.isNew ? ' is-new' : '') + '">' +
      (app.isNew ? '<span class="sc-new">New</span>' : '') +
      '<div class="sc-app-main">' +
      '<div class="sc-app-top"><span class="sc-kicker">Application</span>' + stageChip(app.stage) + '</div>' +
      '<h3 class="sc-app-name">' + escapeHtmlModal(app.name) + '</h3>' +
      '<p class="sc-app-desc">' + escapeHtmlModal(app.desc) + '</p>' +
      '<div class="sc-assets">' + assetChips + '</div></div>' +
      '<div class="sc-app-actions"><span class="sc-asset-summary">' + summary + '</span>' +
      '<button type="button" class="sc-build' + appCta.cls + '" data-scene-action="build-app" data-scene-mode="' + appCta.mode + '" data-scene="' + escapeHtmlModal(app.name) + '">' + appCta.label + '</button></div>' +
      childHtml + '</section>';
  }).join('') + '</div>';
}

function renderKnowledge(list) {
  return '<div class="grid-agent">' + list.map(function (it) {
    return '<button type="button" class="card kb-card"><div class="kb-preview">' +
      '<span class="kb-src">' + escapeHtmlModal(it.source) + '</span>' +
      '<div class="kb-doc back"><div class="kb-line title"></div><div class="kb-line w90"></div><div class="kb-line w60"></div></div>' +
      '<div class="kb-doc front"><div class="kb-line title"></div><div class="kb-line w80"></div><div class="kb-line w90"></div><div class="kb-line w45"></div><div class="kb-line w60"></div></div>' +
      '</div><div class="kb-body"><div class="kb-name">' + escapeHtmlModal(it.name) + '</div>' +
      '<div class="kb-meta"><span class="kb-dot' + (it.ok ? '' : ' warn') + '"></span><span>' + escapeHtmlModal(it.chunks) + '</span><span>·</span><span>' + escapeHtmlModal(it.sync) + '</span></div></div></button>';
  }).join('') + '</div>';
}

function renderSkill(list) {
  return '<div class="grid-agent">' + list.map(function (it) {
    var tagYaml = it.tags.map(function (t) { return t; }).join(', ');
    var tagsHtml = it.tags.map(function (t) {
      return '<span class="sk-tag">' + escapeHtmlModal(t) + '</span>';
    }).join('');
    return '<button type="button" class="card sk-card"><div class="sk-code">' +
      '<div><span class="c">---</span></div>' +
      '<div><span class="k">name</span>: <span class="s">' + escapeHtmlModal(it.slug) + '</span></div>' +
      '<div><span class="k">version</span>: <span class="s">' + escapeHtmlModal(it.version) + '</span></div>' +
      '<div><span class="k">description</span>: <span class="s">|</span></div>' +
      '<div>  ' + escapeHtmlModal(it.desc.slice(0, 36)) + (it.desc.length > 36 ? '…' : '') + '</div>' +
      '<div><span class="k">tags</span>: <span class="s">[' + escapeHtmlModal(tagYaml) + ']</span></div>' +
      '<div><span class="c">---</span></div></div>' +
      '<div class="sk-body"><div class="sk-title-row"><div class="sk-name">' + escapeHtmlModal(it.title) + '</div>' +
      (it.version ? '<span class="sk-ver">' + escapeHtmlModal(it.version) + '</span>' : '') + '</div>' +
      '<div class="sk-desc">' + escapeHtmlModal(it.desc) + '</div>' +
      '<div class="sk-updated">Updated: ' + escapeHtmlModal(it.updated) + '</div>' +
      '<div class="sk-tags">' + tagsHtml + '</div></div></button>';
  }).join('') + '</div>';
}

function graphAva(theme) {
  var stroke = theme === 'blue' ? '#3b82f6' : theme === 'slate' ? '#64748b' : '#8b5cf6';
  var fill = theme === 'blue' ? '#dbeafe' : theme === 'slate' ? '#e2e8f0' : '#ede9fe';
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M6 7.5L12 12L6 16.5M12 12L18 7.5M12 12L18 16.5" stroke="' + stroke + '" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>' +
    '<circle cx="6" cy="7.5" r="2.4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>' +
    '<circle cx="6" cy="16.5" r="2.2" fill="#fff" stroke="' + stroke + '" stroke-width="1.2"/>' +
    '<circle cx="12" cy="12" r="2.8" fill="' + stroke + '"/>' +
    '<circle cx="18" cy="7.5" r="2.2" fill="#fff" stroke="' + stroke + '" stroke-width="1.2"/>' +
    '<circle cx="18" cy="16.5" r="2.3" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.2"/>' +
    '</svg>';
}

function renderOntology(list) {
  var cards = list.map(function (it) {
    var statusCls = it.statusKey === 'published' ? ' published' : '';
    return '<button type="button" class="card on-card">' +
      '<div class="on-head"><span class="on-ava">' + graphAva(it.theme) + '</span>' +
      '<div class="on-name">' + escapeHtmlModal(it.name) + '</div></div>' +
      '<div class="on-desc">' + escapeHtmlModal(it.desc) + '</div>' +
      '<div class="on-scenario"><span>Scenario</span><strong>' + escapeHtmlModal(it.scenario) + '</strong></div>' +
      '<div class="on-meta">Updated by ' + escapeHtmlModal(it.author) + ' · ' + escapeHtmlModal(it.updated) + '</div>' +
      '<div class="on-tags"><span class="on-tag status' + statusCls + '">' + escapeHtmlModal(it.status) + '</span>' +
      '<span class="on-tag">' + it.versions + ' versions</span></div></button>';
  }).join('');
  return '<div class="on-workspace">' +
    '<div class="on-panel" aria-label="Ontology catalog">' +
      '<section class="on-panel-section on-graphs">' +
        '<h2 class="on-section-title">Ontology Graph</h2>' +
        '<div class="on-graph-space">' +
          '<article class="on-graph-card">' +
            '<div class="on-graph-preview" aria-hidden="true">' +
              '<svg viewBox="0 0 620 210" fill="none">' +
                '<path d="M124 70 238 105M124 140l114-35M382 105l114-35M382 105l114 35M310 55v28M310 127v28" class="on-graph-link"/>' +
                '<circle cx="108" cy="66" r="24" class="on-graph-node on-graph-node-soft"/>' +
                '<circle cx="108" cy="144" r="24" class="on-graph-node"/>' +
                '<circle cx="512" cy="66" r="24" class="on-graph-node"/>' +
                '<circle cx="512" cy="144" r="24" class="on-graph-node on-graph-node-soft"/>' +
                '<circle cx="310" cy="38" r="18" class="on-graph-node"/>' +
                '<circle cx="310" cy="172" r="18" class="on-graph-node"/>' +
                '<rect x="238" y="78" width="144" height="54" rx="14" class="on-graph-core"/>' +
                '<rect x="274" y="101" width="72" height="7" rx="3.5" class="on-graph-core-mark"/>' +
                '<circle cx="108" cy="66" r="6" class="on-graph-dot"/><circle cx="108" cy="144" r="6" class="on-graph-dot"/>' +
                '<circle cx="512" cy="66" r="6" class="on-graph-dot"/><circle cx="512" cy="144" r="6" class="on-graph-dot"/>' +
              '</svg>' +
            '</div>' +
            '<div class="on-graph-body">' +
              '<div class="on-graph-kicker">ENTERPRISE ONTOLOGY</div>' +
              '<div class="on-graph-title-row"><h3>Enterprise ontology graph</h3></div>' +
              '<p>Explore object types, relationships, rules, and actions across every object set.</p>' +
              '<div class="on-graph-meta"><span>' + list.length + ' object sets</span><span>Cross-scenario</span></div>' +
            '</div>' +
          '</article>' +
        '</div>' +
      '</section>' +
      '<div class="on-divider"></div>' +
      '<section class="on-panel-section on-object-sets">' +
        '<div class="on-section-head"><h2 class="on-section-title">Object Sets</h2><span>' + list.length + '</span></div>' +
        '<div class="on-list">' + cards + '</div>' +
      '</section>' +
    '</div>' +
  '</div>';
}

function renderMcp(list) {
  return '<div class="grid-agent">' + list.map(function (it) {
    return '<button type="button" class="card mcp-card"><span class="mcp-logo" style="background:' + it.color + '">' + it.letter + '</span>' +
      '<span><div class="mcp-name">' + escapeHtmlModal(it.name) + '</div>' +
      '<div class="mcp-desc">' + escapeHtmlModal(it.desc) + '</div>' +
      '<div class="mcp-updated">Updated: ' + escapeHtmlModal(it.updated) + '</div>' +
      '<div class="mcp-row"><span class="mcp-pill">' + escapeHtmlModal(it.tag) + '</span></div></span></button>';
  }).join('') + '</div>';
}

function enterpriseAssetPreview(kind) {
  if(kind==='planning')return '<img class="ea-planning-preview" src="../superagent/assets/enterprise/planning-roadmap.svg" width="418" height="175" alt="">';
  if (kind === 'canvas') {
    return '<svg class="ea-preview-svg" viewBox="0 0 300 152" fill="none" aria-hidden="true">' +
      '<rect x="58" y="22" width="184" height="108" rx="10" class="ea-page ea-page-main"/>' +
      '<rect x="72" y="36" width="74" height="7" rx="3.5" class="ea-heading"/>' +
      '<rect x="72" y="55" width="68" height="58" rx="6" class="ea-node ea-node-soft"/>' +
      '<rect x="150" y="55" width="78" height="24" rx="6" class="ea-node ea-node-soft"/>' +
      '<rect x="150" y="89" width="78" height="24" rx="6" class="ea-node ea-node-soft"/>' +
      '<rect x="82" y="65" width="32" height="5" rx="2.5" class="ea-chip"/>' +
      '<rect x="82" y="80" width="48" height="4" rx="2" class="ea-line"/>' +
      '<rect x="82" y="91" width="38" height="4" rx="2" class="ea-line"/>' +
      '<rect x="160" y="65" width="42" height="4" rx="2" class="ea-line"/>' +
      '<rect x="160" y="99" width="52" height="4" rx="2" class="ea-line"/>' +
      '</svg>';
  }
  if (kind === 'landscape') {
    return '<svg class="ea-preview-svg" viewBox="0 0 300 152" fill="none" aria-hidden="true">' +
      '<path d="M70 76h48M182 76h48M150 46v20M150 86v20" class="ea-link"/>' +
      '<path d="M92 43l26 15v36l-26 15-26-15V58l26-15ZM208 43l26 15v36l-26 15-26-15V58l26-15Z" class="ea-node ea-node-soft"/>' +
      '<rect x="118" y="56" width="64" height="40" rx="10" class="ea-node ea-node-main"/>' +
      '<circle cx="92" cy="76" r="7" class="ea-dot"/><circle cx="208" cy="76" r="7" class="ea-dot"/>' +
      '<rect x="141" y="70" width="18" height="4" rx="2" class="ea-mark"/>' +
      '<circle cx="150" cy="30" r="9" class="ea-node"/><circle cx="150" cy="122" r="9" class="ea-node"/>' +
      '</svg>';
  }
  return '<svg class="ea-preview-svg" viewBox="0 0 300 152" fill="none" aria-hidden="true">' +
    '<rect x="68" y="30" width="108" height="92" rx="10" class="ea-page ea-page-back"/>' +
    '<rect x="92" y="22" width="140" height="108" rx="10" class="ea-page ea-page-main"/>' +
    '<rect x="112" y="44" width="52" height="7" rx="3.5" class="ea-heading"/>' +
    '<rect x="112" y="65" width="96" height="5" rx="2.5" class="ea-line"/>' +
    '<rect x="112" y="78" width="82" height="5" rx="2.5" class="ea-line"/>' +
    '<rect x="112" y="91" width="91" height="5" rx="2.5" class="ea-line"/>' +
    '<rect x="112" y="108" width="44" height="8" rx="4" class="ea-chip"/>' +
    '</svg>';
}

function renderEnterpriseAssets(list) {
  return '<div class="ea-grid">' + list.map(function (it) {
    return '<button type="button" class="card ea-card ea-' + it.kind + '" data-enterprise-asset="' + it.kind + '">' +
      '<div class="ea-preview">' + enterpriseAssetPreview(it.kind) + '</div>' +
      '<div class="ea-body"><div class="ea-title-row"><span class="ea-icon">' +
      (it.kind === 'planning' ? '<img src="../superagent/assets/enterprise/planning-compass.svg" width="16" height="16" alt="">' : it.kind === 'canvas'
        ? '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="3" width="15" height="14" rx="2"/><path d="M2.5 7h15M9 7v10M9 12h8.5"/></svg>'
        : it.kind === 'landscape'
        ? '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="4" r="2"/><circle cx="4" cy="15" r="2"/><circle cx="16" cy="15" r="2"/><path d="m9 5.7-4 7.5m6-7.5 4 7.5M6 15h8"/></svg>'
        : '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2.5h7l3 3V17.5H5z"/><path d="M12 2.5v3h3M8 9h4M8 12h4"/></svg>') +
      '</span><span class="ea-name">' + escapeHtmlModal(it.name) + '</span><span class="ea-arrow" aria-hidden="true">→</span></div>' +
      '<p class="ea-desc">' + escapeHtmlModal(it.desc) + '</p>' +
      '<div class="ea-foot"><span>' + escapeHtmlModal(it.count) + '</span><span>' + escapeHtmlModal(it.meta) + '</span></div>' +
      '</div></button>';
  }).join('') + '</div>';
}

function filesRootById(id) {
  for (var i = 0; i < FILES_ROOTS.length; i++) {
    if (FILES_ROOTS[i].id === id) return FILES_ROOTS[i];
  }
  return null;
}

function filesNodesAtPath(root, space, path) {
  var nodes = root[space] || [];
  for (var i = 0; i < path.length; i++) {
    var hit = null;
    for (var j = 0; j < nodes.length; j++) {
      if (nodes[j].id === path[i]) { hit = nodes[j]; break; }
    }
    if (!hit || hit.kind !== 'folder') return [];
    nodes = hit.children || [];
  }
  return nodes;
}

function filesFolderName(root, space, folderId) {
  var nodes = root[space] || [];
  var stack = nodes.slice();
  while (stack.length) {
    var n = stack.shift();
    if (n.id === folderId) return n.name;
    if (n.children) stack = stack.concat(n.children);
  }
  return folderId;
}

function filesFolderIco() {
  return '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.2 2.2A1.2 1.2 0 0 1 2.4 1h2.7l1.1 1.3H11.6A1.2 1.2 0 0 1 12.8 3.5v6.3A1.2 1.2 0 0 1 11.6 11H2.4A1.2 1.2 0 0 1 1.2 9.8V2.2Z" fill="currentColor"/></svg>';
}

function filesHubIco() {
  return '<svg viewBox="0 0 20 16" fill="none" aria-hidden="true"><path d="M1.5 3.2A1.7 1.7 0 0 1 3.2 1.5h3.2l1.3 1.5h8.6A1.7 1.7 0 0 1 18 4.7v8.1a1.7 1.7 0 0 1-1.7 1.7H3.2A1.7 1.7 0 0 1 1.5 12.8V3.2Z" fill="currentColor"/></svg>';
}

function renderFiles() {
  if (!filesState.rootId) {
    return '<div class="fb"><div class="fb-hubs">' + FILES_ROOTS.map(function (r) {
      return '<button type="button" class="fb-hub" data-files-open-root="' + r.id + '">' +
        '<div class="fb-hub-top"><span class="fb-hub-ico ' + r.tone + '">' + filesHubIco() + '</span>' +
        '<span class="fb-hub-count">' + r.count + ' files</span></div>' +
        '<div class="fb-hub-name">' + escapeHtmlModal(r.name) + '</div>' +
        '<div class="fb-hub-desc">' + escapeHtmlModal(r.desc) + '</div>' +
        '<div class="fb-hub-foot">' + escapeHtmlModal(r.size) + '</div></button>';
    }).join('') + '</div></div>';
  }

  var root = filesRootById(filesState.rootId);
  if (!root) {
    filesState.rootId = null;
    return renderFiles();
  }
  var space = filesState.space === 'personal' ? 'personal' : 'public';
  var nodes = filesNodesAtPath(root, space, filesState.path);

  var rows = nodes.length ? nodes.map(function (n) {
    var isFolder = n.kind === 'folder';
    var typeLabel = isFolder ? 'Folder' : (n.kind === 'md' ? 'Markdown' : 'File');
    var icoCls = isFolder ? 'folder' : (n.kind === 'md' ? 'md' : 'file');
    var icoHtml = isFolder ? filesFolderIco() : (n.kind === 'md' ? 'MD' : 'F');
    var openAttr = isFolder ? ' data-files-open-folder="' + n.id + '"' : '';
    var acts = (n.kind === 'md' ? '<button type="button" class="fb-act" data-files-act="edit">Edit</button>' : '') +
      '<button type="button" class="fb-act" data-files-act="download">Download</button>' +
      '<button type="button" class="fb-act ghost" data-files-act="more" aria-label="More">···</button>';
    return '<div class="fb-row' + (isFolder ? ' is-folder' : ' is-file') + '"' + openAttr + '>' +
      '<span class="fb-name"><span class="fb-chev' + (isFolder ? '' : ' is-file') + '" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M3.2 1.8L6.4 5 3.2 8.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span class="fb-fico ' + icoCls + '">' + icoHtml + '</span>' +
      '<span class="fb-label">' + escapeHtmlModal(n.name) + '</span></span>' +
      '<span class="fb-muted">' + typeLabel + '</span>' +
      '<span class="fb-muted">' + escapeHtmlModal(n.size) + '</span>' +
      '<span class="fb-muted">' + escapeHtmlModal(n.updated) + '</span>' +
      '<span class="fb-actions">' + acts + '</span></div>';
  }).join('') : '<div class="fb-empty">This folder is empty</div>';

  return '<div class="fb">' +
    '<div class="fb-bar">' +
    '<div class="fb-tools">' +
    '<button type="button" class="fb-tool" title="Search" aria-label="Search"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6.2" cy="6.2" r="3.7" stroke="currentColor" stroke-width="1.3"/><path d="M9 9l2.6 2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>' +
    '<button type="button" class="fb-tool" title="New" aria-label="New"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.8v8.4M2.8 7h8.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>' +
    '</div></div>' +
    '<div class="fb-spaces">' +
    '<button type="button" class="fb-space' + (space === 'public' ? ' is-on' : '') + '" data-files-space="public">Public space</button>' +
    '<button type="button" class="fb-space' + (space === 'personal' ? ' is-on' : '') + '" data-files-space="personal">Personal space</button>' +
    '</div>' +
    '<div class="fb-meta">' + nodes.length + ' item' + (nodes.length === 1 ? '' : 's') + '</div>' +
    '<div class="fb-table"><div class="fb-head"><span>Name</span><span>Type</span><span>Size</span><span>Updated</span><span style="text-align:right">Actions</span></div>' +
    rows + '</div></div>';
}
