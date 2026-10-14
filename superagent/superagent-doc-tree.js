(function (global) {
  var WORKSPACE_NAME = "executive-agent-analysis";
  var DEFAULT_DOC_TREE = [
  {
    id: 'folder-sales-allocation',
    name: 'Sales store allocation Agent MVP',
    type: 'folder',
    defaultOpen: true,
    children: [
      { id: 'file-sales-readme', name: 'README.md', type: 'file' },
      { id: 'folder-sales-examples', name: 'examples', type: 'folder' },
      { id: 'folder-sales-results', name: 'results', type: 'folder' },
      { id: 'folder-sales-src', name: 'src', type: 'folder' },
      { id: 'folder-sales-templates', name: 'templates', type: 'folder' },
    ],
  },
  {
    id: 'folder-root',
    name: 'Executive agent analysis',
    type: 'folder',
    defaultOpen: true,
    children: [
      { id: 'file-bg', name: '00-Background & open questions.md', type: 'file' },
      { id: 'file-ambig', name: '01-Ambiguity breakdown.md', type: 'file' },
      { id: 'file-questions', name: '02-Six questions for the sponsor.md', type: 'file' },
      {
        id: 'folder-four',
        name: '03-Four steps',
        type: 'folder',
        defaultOpen: true,
        children: [
          { id: 'file-s1', name: 'Step 1-Clarify the subject.md', type: 'file' },
          { id: 'file-s2', name: 'Step 2-Align on purpose.md', type: 'file' },
          { id: 'file-s3', name: 'Step 3-Define the deliverable.md', type: 'file' },
          { id: 'file-s4', name: 'Step 4-Close the loop.md', type: 'file' },
        ],
      },
      {
        id: 'folder-deliver',
        name: 'Delivery templates',
        type: 'folder',
        defaultOpen: false,
        children: [
          { id: 'file-onepager', name: 'One-page conclusion.md', type: 'file' },
          { id: 'file-cap', name: 'Capability breakdown.md', type: 'file' },
          { id: 'file-skill', name: 'Skill-mapping draft.md', type: 'file' },
        ],
      },
    ],
  },
];
  var DEFAULT_SCENARIOS = [
    {
      id: 'sc-mock-sales',
      title: 'Smart store allocation',
      desc: 'Generate allocation recommendations from store sales, inventory, and display signals to cut stockouts and overstock.',
      status: 'Live',
      appName: 'Smart store allocation',
      appDesc: 'Generate allocation recommendations from store sales, inventory, and display signals to cut stockouts and overstock.',
      businesses: [
        { name: 'New-product launch allocation', desc: 'Set first-wave quantities and store priority from store profiles and historical sell-through.', priority: 'Quick win' },
      ],
    },
    {
      id: 'sc-mock-feedback',
      title: 'Smart feedback classification',
      desc: 'Aggregate multi-channel feedback, auto-classify intent, and route tickets to shorten response time.',
      status: 'Live',
      appName: 'Smart feedback classification',
      appDesc: 'Aggregate multi-channel feedback, auto-classify intent, and route tickets to shorten response time.',
      businesses: [
        { name: 'Intent detection & routing', desc: 'Detect complaint, inquiry, and suggestion intents, then assign to the right team.', priority: 'Quick win' },
      ],
    },
  ];
  var scenarioStore = { scenarios: DEFAULT_SCENARIOS.slice() };
  var ENTERPRISE_SCENARIO_SHOWCASE = {
    title: 'T4 smart feedback classifier',
    statusTags: [
      { label: 'App', variant: 'app' },
      { label: 'Planning', variant: 'muted' },
    ],
    summary:
      'Enterprise feedback volume is already 230,000+ / month, and manual sorting plus SLA pressure keep rising. The goal is an Agent chain that aggregates multi-channel feedback, detects intent, and routes tickets—cutting frontline triage and shortening response time.',
    agents: [
      {
        id: 'agent-sync',
        title: 'Employee data sync & anomaly Agent',
        tags: [
          { label: 'Business', variant: 'muted' },
          { label: 'Strategy', variant: 'strategy' },
          { label: 'Planning', variant: 'muted' },
        ],
        highlights: [
          {
            tone: 'orange',
            label: 'High-frequency errors',
            text: 'Multi-channel feeds with inconsistent formats cause sync misses; cleanup is slow and erodes employee trust',
          },
        ],
      },
      {
        id: 'agent-payroll',
        title: 'Multi-country payroll calc & check Agent',
        tags: [
          { label: 'Business', variant: 'muted' },
          { label: 'Strategy', variant: 'strategy' },
          { label: 'Planning', variant: 'muted' },
        ],
        highlights: [
          {
            tone: 'red',
            label: 'High effort',
            text: 'Rule checks for 72,000+ monthly payslips are still fully manual;',
          },
          {
            tone: 'yellow',
            label: 'High expertise',
            text: 'Senior payroll specialists are fluent in 3–5 markets; each new market needs fresh lookup and verification',
          },
        ],
      },
    ],
  };
  var DEFAULT_SELECTED_DOC_ID = "file-bg";
  var PERSONAL_DOC_TREE = [
    {
      id: 'personal-notes',
      name: 'My notes',
      type: 'folder',
      defaultOpen: true,
      children: [
        { id: 'personal-inbox', name: 'Inbox.md', type: 'file' },
        { id: 'personal-meeting', name: 'Meeting notes.md', type: 'file' },
        { id: 'personal-todo', name: 'This week.md', type: 'file' },
      ],
    },
    {
      id: 'personal-drafts',
      name: 'Drafts',
      type: 'folder',
      defaultOpen: false,
      children: [
        { id: 'personal-skill', name: 'skill-idea.md', type: 'file' },
        { id: 'personal-prompt', name: 'prompt-snippets.md', type: 'file' },
      ],
    },
  ];
  var DEFAULT_PERSONAL_SELECTED_DOC_ID = 'personal-inbox';

  function collectDefaultOpenIds(nodes) {
    var ids = {};
    function walk(list) {
      list.forEach(function (node) {
        if (node.type === 'folder' && node.defaultOpen) ids[node.id] = true;
        if (node.children) walk(node.children);
      });
    }
    walk(nodes);
    return ids;
  }

  function iconFile() {
    return '<svg class="doc-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.25h5l3 3v8.5H4v-11.5Z" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/><path d="M9 2.25v3h3M6 8h4M6 10.5h4" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/></svg>';
  }

  function iconFolder() {
    return '<svg class="doc-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.25 4.25h4l1.2 1.5h6.3v7H2.25v-8.5Z" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/></svg>';
  }

  function mountTree(panelEl, tree, defaultSelectedId, leafVariant) {
    var openFolders = collectDefaultOpenIds(tree);
    var selectedId = defaultSelectedId;
    var treeEl = panelEl.querySelector('.sidebar-tree');
    if (!treeEl) return;

    function flatten() {
      var rows = [];
      function walk(nodes, depth) {
        nodes.forEach(function (node) {
          rows.push({ node: node, depth: depth });
          if (node.type === 'folder' && node.children && openFolders[node.id]) {
            walk(node.children, depth + 1);
          }
        });
      }
      walk(tree, 0);
      return rows;
    }

    function render() {
      var rows = flatten();
      treeEl.innerHTML = rows.map(function (row) {
        var node = row.node;
        var depth = row.depth;
        var isFolder = node.type === 'folder';
        var isOpen = isFolder && openFolders[node.id];
        var isSelected = !isFolder && selectedId === node.id;
        var pl = 8 + depth * 12;
        var chevron = isFolder
          ? '<span class="doc-chevron' + (isOpen ? ' is-open' : '') + '" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="m3.5 2.5 3 2.5-3 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
          : '<span class="doc-chevron doc-chevron-spacer" aria-hidden="true"></span>';
        var leaf = isFolder ? iconFolder() : iconFile();
        return (
          '<button type="button" class="doc-row' + (isSelected ? ' is-active' : '') + '" data-id="' + node.id + '" data-type="' + node.type + '" style="padding-left:' + pl + 'px">' +
          chevron + leaf + '<span class="doc-label">' + node.name + '</span></button>'
        );
      }).join('');
    }

    treeEl.onclick = function (e) {
      var btn = e.target.closest('.doc-row');
      if (!btn) return;
      var id = btn.getAttribute('data-id');
      var type = btn.getAttribute('data-type');
      if (type === 'folder') {
        if (openFolders[id]) delete openFolders[id];
        else openFolders[id] = true;
        render();
      } else {
        selectedId = id;
        render();
        if (global.workbuddyOnScenarioSelect) global.workbuddyOnScenarioSelect(id);
      }
    };

    render();
  }

  function mountSceneCards(panelEl) {
    var listEl = panelEl.querySelector('.scene-cards');
    if (!listEl) return;
    var scenarios = scenarioStore.scenarios;
    var selectedId = scenarios[0] ? scenarios[0].id : null;
    var sceneMode = 'office';

    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderEnterpriseCard(data) {
      var statusTags = data.statusTags
        .map(function (tag) {
          var cls = tag.variant === 'app' ? 'scene-rich-tag-app' : 'scene-rich-tag-muted';
          return '<span class="scene-rich-tag ' + cls + '">' + escapeHtml(tag.label) + '</span>';
        })
        .join('');
      var agents = data.agents
        .map(function (agent) {
          var agentTags = agent.tags
            .map(function (tag) {
              var cls =
                tag.variant === 'strategy' ? 'scene-rich-agent-tag-strategy' : 'scene-rich-agent-tag-muted';
              return (
                '<span class="scene-rich-agent-tag ' + cls + '">' + escapeHtml(tag.label) + '</span>'
              );
            })
            .join('');
          var highlights = agent.highlights
            .map(function (item) {
              return (
                '<li class="scene-rich-highlight">' +
                '<span class="scene-rich-dot scene-rich-dot-' +
                item.tone +
                '" aria-hidden="true"></span>' +
                '<span><strong>' +
                escapeHtml(item.label) +
                ':</strong> ' +
                escapeHtml(item.text) +
                '</span></li>'
              );
            })
            .join('');
          return (
            '<div class="scene-rich-agent">' +
            '<p class="scene-rich-agent-title">' +
            escapeHtml(agent.title) +
            '</p>' +
            '<div class="scene-rich-agent-tags">' +
            agentTags +
            '</div>' +
            '<ul class="scene-rich-highlights">' +
            highlights +
            '</ul></div>'
          );
        })
        .join('');
      return (
        '<article class="scene-rich-card" role="listitem">' +
        '<div class="scene-rich-head">' +
        '<h3 class="scene-rich-title">' +
        escapeHtml(data.title) +
        '</h3>' +
        '<button type="button" class="scene-rich-menu" aria-label="More actions">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>' +
        '</button></div>' +
        '<div class="scene-rich-tags">' +
        statusTags +
        '</div>' +
        '<p class="scene-rich-summary">' +
        escapeHtml(data.summary) +
        '</p>' +
        '<div class="scene-rich-agents">' +
        agents +
        '</div></article>'
      );
    }

    function itemFromDraft(draft, id) {
      var appName = (draft && (draft.appName || draft.title)) || 'New scenario';
      var appDesc = (draft && (draft.appDesc || draft.desc)) || '';
      var businesses = ((draft && draft.businesses) || []).filter(function (item) {
        return (item.name && item.name.trim()) || (item.desc && item.desc.trim());
      });
      return {
        id: id || 'sc-' + Date.now(),
        title: appName,
        desc: appDesc || 'Add scenario goals and deliverables',
        status: 'Live',
        appName: appName,
        appDesc: appDesc,
        businesses: businesses,
      };
    }

    function newScenario() {
      return itemFromDraft(null);
    }

    function addScenario(onDone) {
      function commit(draft) {
        var item = itemFromDraft(draft);
        scenarios.push(item);
        selectedId = item.id;
        scenarioStore.scenarios = scenarios;
        render();
        if (typeof onDone === 'function') onDone(item);
      }
      if (typeof global.workbuddyOpenCreateScene === 'function') {
        global.workbuddyOpenCreateScene(commit);
        return;
      }
      commit(newScenario());
    }

    function editScenario(id) {
      var current = null;
      for (var i = 0; i < scenarios.length; i++) {
        if (scenarios[i].id === id) current = scenarios[i];
      }
      if (!current || typeof global.workbuddyOpenCreateScene !== 'function') return;
      global.workbuddyOpenCreateScene(function (draft) {
        var next = itemFromDraft(draft, current.id);
        for (var i = 0; i < scenarios.length; i++) {
          if (scenarios[i].id === current.id) scenarios[i] = next;
        }
        scenarioStore.scenarios = scenarios;
        render();
      }, current);
    }

    function deleteScenario(id) {
      scenarios = scenarios.filter(function (item) { return item.id !== id; });
      scenarioStore.scenarios = scenarios;
      if (selectedId === id) selectedId = scenarios[0] ? scenarios[0].id : null;
      render();
    }

    function sceneTag(label, extra) {
      return '<span class="scene-tag' + (extra ? ' ' + extra : '') + '">' + escapeHtml(label) + '</span>';
    }

    function renderMenu(packId) {
      return (
        '<div class="scene-menu" hidden>' +
        '<button type="button" data-action="add">New scenario</button>' +
        '<button type="button" data-edit="' + packId + '">Edit scenario</button>' +
        '<button type="button" class="scene-menu-danger" data-delete="' + packId + '">Delete scenario</button>' +
        '</div>'
      );
    }

    function renderUnit(kind, title, desc, extraTags, packId) {
      var tags = kind === 'app'
        ? sceneTag('App', 'scene-tag-app') + sceneTag('Live', 'scene-tag-live')
        : sceneTag('Business', 'scene-tag-business') + extraTags + sceneTag('Live', 'scene-tag-live');
      return (
        '<div class="scene-unit">' +
        '<div class="scene-unit-head">' +
        '<h4 class="scene-unit-title">' + escapeHtml(title || 'Untitled scenario') + '</h4>' +
        '<button type="button" class="scene-unit-more" data-open-menu="' + packId + '" aria-label="More actions"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg></button>' +
        '</div>' +
        '<div class="scene-unit-tags">' + tags + '</div>' +
        (desc ? '<p class="scene-unit-desc">' + escapeHtml(desc) + '</p>' : '') +
        renderMenu(packId) +
        '</div>'
      );
    }

    function closeMenus() {
      listEl.querySelectorAll('.scene-menu').forEach(function (menu) {
        menu.hidden = true;
      });
    }

    function renderGuideCard(title) {
      return (
        '<div class="scene-empty-card">' +
        '<h3 class="scene-empty-title">' + title + '</h3>' +
        '<p class="scene-empty-desc">No transformation idea yet? Start from chat and let AgentOS help derive the need. If the scenario is already clear, create it and start crafting right away.</p>' +
        '<div class="scene-empty-actions">' +
        '<button type="button" class="scene-empty-btn scene-empty-btn-ghost" data-action="add">New scenario+</button>' +
        '</div></div>'
      );
    }

    function render() {
      if (!scenarios.length) {
        listEl.innerHTML = renderGuideCard('No scenarios yet');
        return;
      }
      var cards = scenarios
        .map(function (item) {
          var bizUnits = (item.businesses || []).map(function (biz) {
            var extra = biz.priority
              ? sceneTag(biz.priority, 'scene-tag-priority' + (biz.priority === 'Quick win' ? ' scene-tag-win' : ''))
              : '';
            return renderUnit('biz', biz.name, biz.desc, extra, item.id);
          }).join('');
          return (
            '<article class="scene-pack" data-id="' + item.id + '" role="listitem">' +
            renderUnit('app', item.appName || item.title, item.appDesc || item.desc, '', item.id) +
            bizUnits +
            '</article>'
          );
        })
        .join('');
      listEl.innerHTML = renderGuideCard('New scenario') + cards;
    }

    listEl.onclick = function (e) {
      var addBtn = e.target.closest('[data-action="add"]');
      if (addBtn) {
        closeMenus();
        addScenario();
        return;
      }
      var editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        closeMenus();
        editScenario(editBtn.getAttribute('data-edit'));
        return;
      }
      var delBtn = e.target.closest('[data-delete]');
      if (delBtn) {
        closeMenus();
        deleteScenario(delBtn.getAttribute('data-delete'));
        return;
      }
      var more = e.target.closest('[data-open-menu]');
      if (more) {
        var unit = more.closest('.scene-unit');
        var menu = unit ? unit.querySelector('.scene-menu') : null;
        var wasOpen = menu && !menu.hidden;
        closeMenus();
        if (menu && !wasOpen) menu.hidden = false;
        e.stopPropagation();
      }
    };

    document.addEventListener('click', function (e) {
      if (!listEl.contains(e.target) || (!e.target.closest('.scene-menu') && !e.target.closest('[data-open-menu]'))) {
        closeMenus();
      }
    });

    global.WORKBUDDY_SCENE_PANEL = {
      add: function (onDone) { addScenario(onDone); },
      setMode: function (mode) {
        sceneMode = mode === 'enterprise' ? 'enterprise' : 'office';
        render();
      },
    };

    render();
  }

  function initLeftSidebar(rootEl) {
    if (!rootEl) return;
    var tabs = rootEl.querySelectorAll('.sidebar-tabs .sidebar-tab');
    var panelScene = rootEl.querySelector('[data-panel="scene"]');
    var panelDocs = rootEl.querySelector('[data-panel="docs"]');
    var docSubtabs = rootEl.querySelectorAll('.doc-subtab');
    var docPanelPersonal = panelDocs ? panelDocs.querySelector('[data-doc-panel="personal"]') : null;
    var docPanelSpace = panelDocs ? panelDocs.querySelector('[data-doc-panel="space"]') : null;
    var current = 'scene';

    function setDocScope(scope) {
      docSubtabs.forEach(function (tab) {
        var active = tab.getAttribute('data-doc-tab') === scope;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (docPanelPersonal) docPanelPersonal.hidden = scope !== 'personal';
      if (docPanelSpace) docPanelSpace.hidden = scope !== 'space';
    }

    function setTab(name) {
      current = name;
      tabs.forEach(function (tab) {
        var active = tab.getAttribute('data-tab') === name;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (panelScene) panelScene.hidden = name !== 'scene';
      if (panelDocs) panelDocs.hidden = name !== 'docs';
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setTab(tab.getAttribute('data-tab') || 'docs');
      });
    });

    docSubtabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setDocScope(tab.getAttribute('data-doc-tab') || 'space');
      });
    });

    if (docPanelPersonal) mountTree(docPanelPersonal, PERSONAL_DOC_TREE, DEFAULT_PERSONAL_SELECTED_DOC_ID, 'doc');
    if (docPanelSpace) mountTree(docPanelSpace, DEFAULT_DOC_TREE, DEFAULT_SELECTED_DOC_ID, 'doc');
    setDocScope('space');
    if (panelScene) mountSceneCards(panelScene);
    setTab('scene');

    global.WORKBUDDY_DOC_EXPLORER.openDocument = function (docId) {
      setTab('docs');
      setDocScope('space');
      var row = rootEl.querySelector('.doc-row[data-id="' + (docId || 'file-sales-readme') + '"]');
      if (row) row.click();
    };
  }

  global.WORKBUDDY_DOC_EXPLORER = {
    WORKSPACE_NAME: WORKSPACE_NAME,
    init: initLeftSidebar,
    setSceneMode: function (mode) {
      if (global.WORKBUDDY_SCENE_PANEL && global.WORKBUDDY_SCENE_PANEL.setMode) {
        global.WORKBUDDY_SCENE_PANEL.setMode(mode);
      }
    },
  };

  global.WORKBUDDY_SCENARIOS = {
    getList: function () {
      return scenarioStore.scenarios.slice();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
