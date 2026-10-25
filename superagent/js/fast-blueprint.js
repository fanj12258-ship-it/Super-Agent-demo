/**
 * Fast POC page ONLY — in-scene blueprint (Agent 装修图) in the left sidebar.
 *   FastBlueprint.show(title)  → swap the scene list for the blueprint (tab label stays "Scenarios")
 *   FastBlueprint.hide()       → back to the Overview scene list
 *   FastBlueprint.set(node, state, text)   node: agent|onto|skill|doc|know|req
 *                              state: todo | doing | done | optional | mock | imported
 * Follows the Overview dropdown: picking T1 shows it, picking Overview hides it.
 */
(function () {
  'use strict';
  var bp = document.getElementById('fast-bp');
  if (!bp) return;
  var list = document.querySelector('.scene-panel-scroll');
  var tab = document.querySelector('.sidebar-tab[data-tab="scene"]');
  var titleEl = document.getElementById('bp-title');
  var modeEl = document.getElementById('bp-mode');
  var descRoot = document.getElementById('bp-desc');
  var descText = document.getElementById('bp-desc-text');
  var descToggle = document.getElementById('bp-desc-toggle');
  var menu = document.getElementById('overviewMenu');
  var pageTitle = document.getElementById('center-head-title');
  var T1 = 'T1 Sourcing strategy (v2.1 new step)';
  var T1_DESC =
    'For supplier sourcing strategy: discover candidates, apply admission criteria, and draft a ranked shortlist with evidence. Upgrade “manual screening → spreadsheet compare → email follow-up” into an Agent-led flow: hard-gate filters, quote comparison, risk flags, and human confirmation before outreach.';

  var S = 'width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    agent: '<svg ' + S + '><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
    onto: '<svg ' + S + '><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="8" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="m8 6.6 8 1M7 8l4 8M17 10l-4 6.5"/></svg>',
    skill: '<svg ' + S + '><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
    doc: '<svg ' + S + '><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    know: '<svg ' + S + '><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 19h16"/></svg>',
    req: '<svg ' + S + '><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
  };
  bp.querySelectorAll('[data-ico]').forEach(function (n) { n.innerHTML = ICON[n.getAttribute('data-ico')] || ''; });

  var DEFAULT_TEXT = { todo: 'Not built', doing: 'In progress', done: 'Ready', optional: 'Optional', mock: 'Mock', imported: 'Imported' };

  function setDesc(text) {
    if (!descText) return;
    var next = (text && String(text).trim()) || T1_DESC;
    descText.textContent = next;
    if (descRoot) descRoot.hidden = !next;
  }
  function show(title, desc) {
    if (titleEl && title) titleEl.textContent = title;
    if (desc !== undefined) setDesc(desc);
    else if (!descText || !descText.textContent.trim()) setDesc(T1_DESC);
    if (list) list.hidden = true;
    bp.hidden = false;
    if (window.FastBlueprintIso) window.FastBlueprintIso.render();
  }
  if (descToggle && descRoot) {
    descToggle.addEventListener('click', function () {
      var collapsed = descRoot.classList.toggle('is-collapsed');
      descToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
  }
  function hide() {
    bp.hidden = true;
    if (list) list.hidden = false;
    if (tab) tab.textContent = 'Scenarios';
    if (window.FastBlueprintIso) window.FastBlueprintIso.close();
  }
  function set(node, state, text) {
    var n = bp.querySelector('[data-node="' + node + '"]');
    if (!n) return;
    n.setAttribute('data-state', state);
    var st = n.querySelector('.bp-st');
    if (st) st.textContent = text || DEFAULT_TEXT[state] || '';
    n.classList.remove('is-flash');
    void n.offsetWidth; // restart animation
    n.classList.add('is-flash');
    if (window.FastBlueprintIso) window.FastBlueprintIso.render();
  }

  document.addEventListener('fastmodechange', function (e) {
    if (modeEl) modeEl.textContent = e.detail.mode === 'steps' ? 'Steps' : 'Fast';
  });

  if (menu) {
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('.ov-menu-item');
      if (!item) return;
      if (item.getAttribute('data-mode') === 'overview') {
        hide();
        if (pageTitle) pageTitle.textContent = 'DJI Innovations';
      } else if (item.getAttribute('data-scene') === 'biz-t1') {
        show(T1);
        if (pageTitle) pageTitle.textContent = T1;
      }
    });
  }
  var back = document.getElementById('bp-back');
  if (back && menu) {
    back.addEventListener('click', function () {
      var ov = menu.querySelector('.ov-menu-item[data-mode="overview"]');
      if (ov) ov.click();
    });
  }

  /* Sidebar scene picker: the long title never fits — show the short name, keep the full one as tooltip
     (the full title stays in the centre header and the blueprint card). Fast page only. */
  var pickerLabel = document.querySelector('#brandPicker .brand-picker-label');
  if (pickerLabel && window.MutationObserver) {
    var fixing = false;
    var shorten = function () {
      if (fixing) return;
      var full = pickerLabel.textContent;
      var short = full.replace(/\s*\([^)]*\)\s*$/, '');
      if (short === full) { pickerLabel.parentNode.removeAttribute('title'); return; }
      fixing = true;
      pickerLabel.parentNode.setAttribute('title', full);
      pickerLabel.textContent = short;
      fixing = false;
    };
    new MutationObserver(shorten).observe(pickerLabel, { childList: true, characterData: true, subtree: true });
    shorten();
  }

  /* Fixed shelf contract: all five category headings remain visible even when the
     scenario has no assets; renderAssets() puts "Not generated yet" below each one. */
  var ASSET_GROUPS = [
    { key: 'skill', label: 'Skill', icon: 'ws-skill', sample: [
      { id: 'sample-skill-quota', name: 'Quota Q&A Skill', status: 'Ready', state: 'pending', sample: true },
      { id: 'sample-skill-polish', name: 'Self-Review Polish Skill', status: 'Ready', state: 'pending', sample: true },
    ] },
    { key: 'mcp', label: 'MCP', icon: 'ws-mcp', sample: [] },
    { key: 'knowledge', label: 'Knowledge base', icon: 'ws-knowledge', sample: [] },
    { key: 'ontology', label: 'Object set', icon: 'ws-ontology', sample: [
      { id: 'sample-onto', name: 'R&D Performance Object Set', status: 'Published', state: 'published', sample: true },
    ] },
    { key: 'agent', label: 'Agent', icon: 'ws-agent', sample: [] },
  ];
  function escAsset(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function renderAssets() {
    var root = document.getElementById('bp-assets');
    if (!root) return;
    var cat = window.FastModules && window.FastModules.catalog ? window.FastModules.catalog() : null;
    var route = window.FastJourneyRoute && window.FastJourneyRoute.get ? window.FastJourneyRoute.get() : '';
    var useSamples = route !== '2' && route !== '3';
    var html = '';
    ASSET_GROUPS.forEach(function (g) {
      var items = (cat && cat[g.key] && cat[g.key].length)
        ? cat[g.key]
        : (useSamples ? (g.sample || []) : []);
      html += '<section class="bp-asset-group"><h3 class="bp-asset-k"><svg class="bp-asset-k-icon" width="14" height="14" aria-hidden="true"><use href="#' +
        g.icon + '"/></svg><span>' + g.label + '</span></h3>';
      if (items.length) {
        html += '<div class="bp-asset-list">';
        items.forEach(function (it) {
          html += '<button type="button" class="bp-asset" data-asset="' + g.key + '" data-asset-id="' + escAsset(it.id) +
            '" data-sample="' + (it.sample ? '1' : '0') + '"><span class="bp-asset-name">' + escAsset(it.name) +
            '</span><span class="bp-asset-status is-' + escAsset(it.state || 'pending') + '"><i></i>' +
            escAsset(it.status || 'Ready') + '</span></button>';
        });
        html += '</div>';
      } else {
        html += '<div class="bp-asset-empty">Not generated yet</div>';
      }
      html += '</section>';
    });
    root.innerHTML = html;
    root.hidden = false;
  }
  var assets = document.getElementById('bp-assets');
  if (assets) {
    assets.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-asset]');
      if (!btn || !window.FastModules) return;
      var key = btn.getAttribute('data-asset');
      var id = btn.getAttribute('data-asset-id');
      if (key === 'agent' && window.FastAgentPanel) {
        window.FastAgentPanel.open('try');
        return;
      }
      var isSample = btn.getAttribute('data-sample') === '1';
      window.FastModules.open(key, id && !isSample ? { drill: id } : undefined);
    });
  }
  document.addEventListener('fastsandbox', renderAssets);
  var prevShow = show;
  show = function (title, desc) {
    prevShow(title, desc);
    renderAssets();
  };
  renderAssets();

  window.FastBlueprint = { show: show, hide: hide, set: set, setDesc: setDesc };
})();
