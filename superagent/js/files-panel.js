(function () {
  var root = document.getElementById('doc-explorer')
  if (!root) return

  var tabs = root.querySelectorAll('.sidebar-tabs .sidebar-tab')
  var panelScene = root.querySelector('[data-panel="scene"]')
  var panelFiles = root.querySelector('[data-panel="files"]')
  var materialsEl = document.getElementById('files-tree')
  var contextEl = document.getElementById('context-tree')
  if (!panelFiles || !materialsEl || !contextEl) return

  var MATERIALS = [
    {
      id: 'f-meetings',
      name: 'Meeting notes',
      open: true,
      children: [
        { id: 'm1', type: 'file', name: 'Sourcing process & AI plan.docx' },
        { id: 'm2', type: 'file', name: 'Screening & value assessment.txt' },
        { id: 'm3', type: 'file', name: 'Sourcing sync-0423.md' },
        { id: 'm4', type: 'file', name: 'Transcript: strategy & process.md' },
        { id: 'm5', type: 'file', name: 'Transcript: sourcing process.html' }
      ]
    },
    {
      id: 'f-samples',
      name: 'Deliverable samples',
      open: true,
      children: [
        { id: 's1', type: 'file', name: 'Procurement process.md' },
        { id: 's2', type: 'file', name: 'Info sources.md' },
        { id: 's3', type: 'file', name: 'Supplier list.png' },
        { id: 's4', type: 'file', name: 'Supplier profile.png' },
        { id: 's5', type: 'file', name: 'Threshold rules-0516.xlsx' },
        { id: 's6', type: 'file', name: 'Tianyancha lookup.png' },
        { id: 's7', type: 'file', name: 'Sourcing request.md' },
        { id: 's8', type: 'file', name: 'Longlist scoring.png' },
        { id: 's9', type: 'file', name: 'Longlist rules-0516.xlsx' },
        { id: 's10', type: 'file', name: 'Longlist data.png' }
      ]
    },
    {
      id: 'f-slices',
      name: 'Data slices',
      open: true,
      children: [
        { id: 'd1', type: 'file', name: 'Sourcing dataset - molding.xlsx' },
        { id: 'd2', type: 'file', name: 'Instance data checklist.xlsx' },
        { id: 'd3', type: 'file', name: 'Handheld sourcing sample.xlsx' }
      ]
    },
    {
      id: 'f-fde',
      name: 'FDE outputs',
      open: true,
      children: [
        { id: 'e1', type: 'file', name: 'Current-state & process data.png' },
        { id: 'e2', type: 'file', name: 'AI scenarios panorama.png' },
        { id: 'e3', type: 'file', name: 'Procurement process.md' },
        { id: 'e4', type: 'file', name: 'Industry research.docx' },
        { id: 'e5', type: 'file', name: 'Sourcing status-v2.png' }
      ]
    }
  ]

  var CONTEXT = [
    {
      id: 'c-t1',
      name: 'Sourcing strategy (T1)',
      open: true,
      children: [
        {
          id: 'c-sdp',
          type: 'folder',
          name: 'SDP',
          open: false,
          children: [
            { id: 'sdp1', type: 'file', name: 'Solution outline.md' },
            { id: 'sdp2', type: 'file', name: 'Architecture.pptx' },
            { id: 'sdp3', type: 'file', name: 'Design checklist.xlsx' }
          ]
        },
        {
          id: 'c-skp',
          type: 'folder',
          name: 'SKP',
          open: false,
          children: [
            { id: 'skp1', type: 'file', name: 'Domain glossary.md' },
            { id: 'skp2', type: 'file', name: 'Process map.png' },
            { id: 'skp3', type: 'file', name: 'Knowledge index.md' }
          ]
        },
        {
          id: 'c-srp',
          type: 'folder',
          name: 'SRP',
          open: false,
          children: [
            { id: 'srp1', type: 'file', name: 'Requirements.md' },
            { id: 'srp2', type: 'file', name: 'Acceptance criteria.docx' },
            { id: 'srp3', type: 'file', name: 'Scope matrix.xlsx' }
          ]
        }
      ]
    },
    { id: 'c-t2', name: 'Supplier discovery (T2)', open: false, children: [] },
    { id: 'c-t3', name: 'Deep research (T3)', open: false, children: [] },
    { id: 'c-t4', name: 'Screen & longlist (T4)', open: false, children: [] },
    { id: 'c-t4b', name: 'T4 Screen & longlist', open: false, children: [] }
  ]

  var openFolders = {}
  var selectedId = null

  function seedOpen(nodes) {
    nodes.forEach(function (n) {
      if (n.open) openFolders[n.id] = true
      ;(n.children || []).forEach(function (c) {
        if (c.type === 'folder' && c.open) openFolders[c.id] = true
        if (c.children) seedOpen([c])
      })
    })
  }
  seedOpen(MATERIALS)
  seedOpen(CONTEXT)

  var SVG = {
    chev:
      '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5l7 7-7 7"/></svg>',
    folder:
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
    more:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'
  }

  /* Seti-style icons — shared with body via js/file-type-icons.js */
  var FTI = window.FileTypeIcons

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function moreActions() {
    return (
      '<div class="row-actions">' +
      '<button type="button" class="more" data-row-more aria-label="More">' +
      SVG.more +
      '</button></div>'
    )
  }

  function extOf(name) {
    var i = name.lastIndexOf('.')
    return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
  }

  function fileTypeOf(name) {
    if (FTI) return FTI.typeOf(name)
    var ext = extOf(name)
    if (ext === 'md' || ext === 'markdown') return 'md'
    if (ext === 'html' || ext === 'htm') return 'html'
    if (ext === 'docx' || ext === 'doc') return 'doc'
    if (ext === 'txt') return 'txt'
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp') return 'img'
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'xls'
    if (ext === 'pptx' || ext === 'ppt') return 'ppt'
    if (ext === 'py') return 'py'
    if (ext === 'sh') return 'sh'
    return 'file'
  }

  function fileIcon(name) {
    var type = fileTypeOf(name)
    var svg = FTI ? FTI.svg(type) : ''
    return (
      '<span class="file-icon file-icon--' +
      type +
      '" aria-hidden="true">' +
      svg +
      '</span>'
    )
  }

  function indentClass(depth) {
    return depth > 0 ? ' indent-' + depth : ''
  }

  function walk(nodes, depth, parentOpen, html) {
    nodes.forEach(function (node) {
      var kind = node.type || 'folder'
      var isFolder = kind === 'folder'
      var isOpen = !!(isFolder && openFolders[node.id])
      var hidden = parentOpen ? '' : ' is-hidden'
      var active = selectedId === node.id ? (isFolder ? ' active' : ' is-active') : ''

      if (isFolder) {
        html.push(
          '<div class="node' +
            indentClass(depth) +
            (isOpen ? ' is-open' : '') +
            active +
            hidden +
            '" data-id="' +
            node.id +
            '" data-kind="folder" role="treeitem" aria-expanded="' +
            (isOpen ? 'true' : 'false') +
            '">' +
            SVG.chev +
            SVG.folder +
            '<span class="label">' +
            escapeHtml(node.name) +
            '</span>' +
            moreActions() +
            '</div>'
        )
        if (node.children && node.children.length) {
          walk(node.children, depth + 1, parentOpen && isOpen, html)
        }
      } else {
        html.push(
          '<div class="file' +
            indentClass(depth) +
            active +
            hidden +
            '" data-id="' +
            node.id +
            '" data-kind="file" role="treeitem">' +
            fileIcon(node.name) +
            '<div class="info"><div class="name">' +
            escapeHtml(node.name) +
            '</div></div>' +
            moreActions() +
            '</div>'
        )
      }
    })
  }

  function renderTree(el, nodes) {
    var html = []
    walk(nodes, 0, true, html)
    el.innerHTML = html.join('')
  }

  function render() {
    renderTree(materialsEl, MATERIALS)
    renderTree(contextEl, CONTEXT)
  }

  function onTreeClick(e) {
    if (e.target.closest('[data-row-more]')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    var row = e.target.closest('.node, .file')
    if (!row) return
    var id = row.getAttribute('data-id')
    var kind = row.getAttribute('data-kind')
    selectedId = id
    if (kind === 'folder') {
      openFolders[id] = !openFolders[id]
    }
    render()
  }

  materialsEl.addEventListener('click', onTreeClick)
  contextEl.addEventListener('click', onTreeClick)

  function activateTab(index) {
    tabs.forEach(function (tab, i) {
      var on = i === index
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    if (panelScene) panelScene.hidden = index !== 0
    panelFiles.hidden = index !== 1
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      activateTab(i)
    })
  })

  activateTab(0)
  render()
})()
