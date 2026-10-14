/* views.js — RENDERERS, activateView / shiftView / render, coming-soon hero art, nav + tab wiring */

var RENDERERS = {
  agent: renderAgent,
  scenario: renderScenario,
  knowledge: renderKnowledge,
  skill: renderSkill,
  ontology: renderOntology,
  mcp: renderMcp,
  files: renderFiles
};

function renderList(key) {
  if (key === 'files') return renderFiles();
  var list = listFor(key);
  if (!list.length) {
    return '<div class="empty"><strong>Nothing here yet</strong>Create your first item for this project.</div>';
  }
  var fn = RENDERERS[key];
  return toolbar(list.length) + (fn ? fn(list) : '');
}

function activateView(key) {
  var target = null;
  items.forEach(function (i) {
    var on = i.dataset.view === key;
    i.classList.toggle('is-active', on);
    if (on) target = i;
  });
  if (!target) return;
  if (key === 'files') {
    filesState.rootId = null;
    filesState.space = 'public';
    filesState.path = [];
  }
  render(key);
}

var TAB_CYCLE = ['scenario', 'agent', 'skill', 'ontology', 'mcp', 'files'];

function shiftView(delta) {
  var active = document.querySelector('.nav-item.is-active');
  var cur = active ? active.dataset.view : 'scenario';
  var idx = TAB_CYCLE.indexOf(cur);
  if (idx < 0) idx = 0;
  var next = TAB_CYCLE[(idx + delta + TAB_CYCLE.length) % TAB_CYCLE.length];
  activateView(next);
}

function render(key) {
  var v = VIEWS[key] || { title: key, desc: '' };
  var titleEl = document.getElementById('mainTitle');
  var descEl = document.getElementById('mainDesc');
  document.getElementById('mainTopLabel').textContent = v.title;
  var mainEl = document.querySelector('main.main');
  mainEl.classList.toggle('has-hero', !!EMPTY_HERO[key]);
  mainEl.classList.toggle('is-ops', key === 'aiops');
  mainEl.classList.toggle('has-wash', !EMPTY_HERO[key]);        if (EMPTY_HERO[key]) {
    titleEl.hidden = true;
    descEl.hidden = true;
    content.innerHTML = renderEmptyHero(key);
    return;
  }
  titleEl.hidden = false;
  descEl.hidden = false;
  titleEl.textContent = v.title;
  descEl.textContent = SCOPED[key] ? (currentTeam + ' · ' + v.desc) : v.desc;
  if (key === 'files') {
    content.innerHTML = renderFiles();
    return;
  }
  if (CATALOG[key] || (key === 'scenario')) {
    content.innerHTML = renderList(key);
    return;
  }
  content.innerHTML = '<div class="empty"><strong>Nothing here yet</strong>' + escapeHtmlModal(v.desc) + '</div>';
}

/** Soft line illustrations for the coming-soon pages (light cards, tinted by page hue). */
var EMPTY_ART = {
  market:
    '<svg class="empty-art" viewBox="0 0 220 132" fill="none" aria-hidden="true">' +
      '<defs><filter id="mkSh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0d99ff" flood-opacity="0.10"/></filter></defs>' +
      '<rect x="22" y="36" width="84" height="64" rx="10" fill="#fff" stroke="#e1ebf8" transform="rotate(-7 64 68)"/>' +
      '<rect x="34" y="52" width="36" height="5" rx="2.5" fill="#e6eef8" transform="rotate(-7 64 68)"/>' +
      '<rect x="34" y="62" width="52" height="4" rx="2" fill="#eef3fa" transform="rotate(-7 64 68)"/>' +
      '<rect x="114" y="32" width="84" height="64" rx="10" fill="#fff" stroke="#e1ebf8" transform="rotate(7 156 64)"/>' +
      '<rect x="126" y="48" width="36" height="5" rx="2.5" fill="#e6eef8" transform="rotate(7 156 64)"/>' +
      '<rect x="126" y="58" width="52" height="4" rx="2" fill="#eef3fa" transform="rotate(7 156 64)"/>' +
      '<g filter="url(#mkSh)"><rect x="60" y="20" width="100" height="88" rx="12" fill="#fff" stroke="#d9e6f6"/></g>' +
      '<circle cx="80" cy="42" r="8" fill="#0d99ff" fill-opacity="0.16"/>' +
      '<path d="M76.5 42.2l2.4 2.4 4.4-4.8" stroke="#0d99ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="94" y="37" width="44" height="5" rx="2.5" fill="#d5e3f5"/>' +
      '<rect x="94" y="46" width="28" height="4" rx="2" fill="#e8eff9"/>' +
      '<rect x="72" y="64" width="76" height="5" rx="2.5" fill="#e8eff9"/>' +
      '<rect x="72" y="74" width="58" height="5" rx="2.5" fill="#e8eff9"/>' +
      '<rect x="72" y="88" width="32" height="10" rx="5" fill="#0d99ff" fill-opacity="0.14"/>' +
      '<rect x="110" y="88" width="38" height="10" rx="5" fill="#171717" fill-opacity="0.88"/>' +
      '<path d="M194 20v8M190 24h8" stroke="#a9c9ee" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M24 22v6M21 25h6" stroke="#c4daf3" stroke-width="1.3" stroke-linecap="round"/>' +
      '<circle cx="200" cy="108" r="2.5" fill="#cfe2f6"/><circle cx="16" cy="96" r="2" fill="#dbe9f8"/>' +
    '</svg>',
  aiops:
    '<svg class="empty-art" viewBox="0 0 220 132" fill="none" aria-hidden="true">' +
      '<defs><filter id="opSh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#22c55e" flood-opacity="0.10"/></filter></defs>' +
      '<rect x="14" y="44" width="70" height="60" rx="10" fill="#fff" stroke="#e0eee6"/>' +
      '<circle cx="35" cy="68" r="11" stroke="#e4efe8" stroke-width="4"/>' +
      '<path d="M35 57a11 11 0 0 1 10.5 7.6" stroke="#22c55e" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="24" y="88" width="26" height="4" rx="2" fill="#e8f1ec"/>' +
      '<rect x="136" y="44" width="70" height="60" rx="10" fill="#fff" stroke="#e0eee6"/>' +
      '<circle cx="150" cy="60" r="3" fill="#22c55e"/><rect x="159" y="58" width="34" height="4" rx="2" fill="#e8f1ec"/>' +
      '<circle cx="150" cy="74" r="3" fill="#f59e0b"/><rect x="159" y="72" width="26" height="4" rx="2" fill="#e8f1ec"/>' +
      '<circle cx="150" cy="88" r="3" fill="#a3a3a3"/><rect x="159" y="86" width="30" height="4" rx="2" fill="#e8f1ec"/>' +
      '<g filter="url(#opSh)"><rect x="56" y="18" width="108" height="92" rx="12" fill="#fff" stroke="#d7eadf"/></g>' +
      '<circle cx="72" cy="34" r="3" fill="#22c55e"/><circle cx="72" cy="34" r="6" fill="#22c55e" fill-opacity="0.14"/>' +
      '<rect x="84" y="32" width="40" height="4" rx="2" fill="#d6e8dd"/>' +
      '<path d="M68 52h84M68 70h84M68 88h84" stroke="#eef5f0" stroke-width="1"/>' +
      '<path d="M68 78l12 0 6-14 8 24 8-30 8 22 6-10h28" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="152" cy="70" r="3" fill="#fff" stroke="#22c55e" stroke-width="1.6"/>' +
      '<rect x="68" y="96" width="30" height="5" rx="2.5" fill="#e8f1ec"/>' +
      '<rect x="124" y="96" width="28" height="5" rx="2.5" fill="#22c55e" fill-opacity="0.16"/>' +
      '<path d="M196 18v8M192 22h8" stroke="#a9dcbd" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M22 24v6M19 27h6" stroke="#c3e6d0" stroke-width="1.3" stroke-linecap="round"/>' +
      '<circle cx="204" cy="112" r="2.5" fill="#cfeadb"/><circle cx="12" cy="104" r="2" fill="#dbf0e3"/>' +
    '</svg>'
};

function renderEmptyHero(key) {
  var cfg = EMPTY_HERO[key];
  var eye = key === 'aiops' ? 'AI Ops' : 'Market';
  return '<div class="empty-hero' + (cfg.cls || '') + '"><div class="empty-hero-inner">' +
    (EMPTY_ART[key] || '') +
    '<div class="empty-eyebrow">Coming soon · ' + eye + '</div>' +
    '<h2>' + escapeHtmlModal(cfg.title) + '</h2>' +
    '<p>' + escapeHtmlModal(cfg.desc) + '</p>' +
    '<div class="empty-cta" aria-disabled="true">' + escapeHtmlModal(cfg.cta) + '<span class="chev">▾</span></div>' +
    '<div class="empty-link">' + escapeHtmlModal(cfg.note) + '</div></div></div>';
}


content.addEventListener('click', function (e) {
  var moreBtn = e.target.closest('[data-scene-more]');
  if (moreBtn) {
    e.stopPropagation();
    var wrap = moreBtn.closest('.sc-children');
    if (!wrap) return;
    var open = wrap.classList.toggle('is-open');
    moreBtn.textContent = open
      ? (moreBtn.getAttribute('data-less-label') || 'Show less')
      : (moreBtn.getAttribute('data-more-label') || 'Show more');
    return;
  }
  var filesRoot = e.target.closest('[data-files-open-root]');
  if (filesRoot) {
    filesState.rootId = filesRoot.getAttribute('data-files-open-root');
    filesState.space = 'public';
    filesState.path = [];
    content.innerHTML = renderFiles();
    return;
  }
  var filesSpace = e.target.closest('[data-files-space]');
  if (filesSpace) {
    filesState.space = filesSpace.getAttribute('data-files-space');
    filesState.path = [];
    content.innerHTML = renderFiles();
    return;
  }
  var filesFolder = e.target.closest('[data-files-open-folder]');
  if (filesFolder && !e.target.closest('[data-files-act]')) {
    filesState.path = filesState.path.concat([filesFolder.getAttribute('data-files-open-folder')]);
    content.innerHTML = renderFiles();
    return;
  }
  var filesCrumb = e.target.closest('[data-files-crumb]');
  if (filesCrumb) {
    var crumb = filesCrumb.getAttribute('data-files-crumb');
    if (crumb === 'root') {
      filesState.rootId = null;
      filesState.path = [];
    } else if (crumb === 'hub') {
      filesState.path = [];
    } else {
      var idx = parseInt(crumb, 10);
      if (!isNaN(idx)) filesState.path = filesState.path.slice(0, idx + 1);
    }
    content.innerHTML = renderFiles();
    return;
  }
  var filesAct = e.target.closest('[data-files-act]');
  if (filesAct) {
    e.stopPropagation();
    return;
  }

  var btn = e.target.closest('[data-agent-action]');
  if (!btn) return;
  e.stopPropagation();
  var action = btn.getAttribute('data-agent-action');
  var name = btn.getAttribute('data-agent') || 'Agent';
  if (action === 'try') {
    alert('Try “' + name + '” — wire this to a chat / run session.');
  } else if (action === 'goto-publish') {
    alert('Open system config to publish “' + name + '” (status is changed there, not on this card).');
  } else if (action === 'build') {
    alert('Continue building “' + name + '” — wire this to Workshop.');
  }
});

items.forEach(function (el) {
  el.addEventListener('click', function () {
    activateView(el.dataset.view);
  });
});

document.getElementById('mainTabPrev').addEventListener('click', function () { shiftView(-1); });
document.getElementById('mainTabNext').addEventListener('click', function () { shiftView(1); });
