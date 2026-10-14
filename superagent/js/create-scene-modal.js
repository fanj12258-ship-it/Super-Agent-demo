/* New scenario modal logic — ported from workbench/agentos-workbench.html.
   Public hook: window.WorkshopCreateScene.open(onConfirm(payload)) */
;(function initCreateSceneModal() {
    function escapeHtmlModal(value) {
      return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escapeAttr(value) {
      return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
    }
    var createSceneModal = document.getElementById('create-scene-modal')
    var createSceneForm = document.getElementById('create-scene-form')
    var createSceneConfirm = document.getElementById('create-scene-confirm')
    var createSceneOnConfirm = null
    var createSceneBizSeq = 1
    var CREATE_PRIORITIES = ['Quick win', 'Important', 'Long-term']
    var createSceneDraft = null

    var ICON_APP = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M11.5 9.5v4M9.5 11.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    var ICON_BIZ = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="8.5" rx="1.6" stroke="currentColor" stroke-width="1.3"/><path d="M5.8 5V3.8c0-.7.5-1.2 1.2-1.2h2c.7 0 1.2.5 1.2 1.2V5M2 8.6h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    var ICON_TRASH = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2.8 4.2h10.4M6.2 4.2V2.8h3.6v1.4M4.2 4.2l.6 8.5a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9l.6-8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    var ICON_PLUS = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'

    function newCreateBiz() {
      createSceneBizSeq += 1
      return { id: createSceneBizSeq, name: '', desc: '', priority: CREATE_PRIORITIES[0] }
    }

    function resetCreateSceneDraft() {
      createSceneBizSeq = 1
      createSceneDraft = { appName: '', appDesc: '', businesses: [newCreateBiz()] }
    }

    function syncCreateSceneConfirm() {
      if (!createSceneConfirm || !createSceneDraft) return
      createSceneConfirm.disabled = !createSceneDraft.appName.trim()
    }

    function smField(label, opts) {
      var counter = '<span class="sm-count">' + opts.value.length + '/' + opts.max + '</span>'
      var control = opts.area
        ? '<textarea maxlength="' + opts.max + '" placeholder="' + opts.placeholder + '" ' + opts.attrs + '>' + escapeHtmlModal(opts.value) + '</textarea>'
        : '<input type="text"' + (opts.id ? ' id="' + opts.id + '"' : '') + ' maxlength="' + opts.max + '" placeholder="' + opts.placeholder + '" autocomplete="off" ' + opts.attrs + ' value="' + escapeAttr(opts.value) + '" />'
      return (
        '<div class="sm-field' + (opts.grow ? ' sm-grow' : '') + '">' +
        '<label class="sm-label">' + label + '</label>' +
        '<div class="sm-input">' + control + counter + '</div></div>'
      )
    }

    function renderCreateSceneForm() {
      if (!createSceneForm || !createSceneDraft) return
      var draft = createSceneDraft
      var bizHtml = draft.businesses.map(function (biz) {
        var seg = CREATE_PRIORITIES.map(function (item) {
          return '<button type="button" data-priority="' + item + '" data-biz-id="' + biz.id + '"' + (biz.priority === item ? ' class="is-on"' : '') + '>' + item + '</button>'
        }).join('')
        return (
          '<section class="sm-card" data-biz-id="' + biz.id + '">' +
          '<div class="sm-card-head">' +
          '<span class="sm-chip sm-chip-biz">' + ICON_BIZ + '</span>' +
          '<h3 class="sm-card-title">Business scenario</h3>' +
          '<span class="sm-tag">Single agent</span>' +
          '<span class="sm-spacer"></span>' +
          '<button type="button" class="sm-trash" data-remove-biz="' + biz.id + '" aria-label="Remove business scenario" title="Remove">' + ICON_TRASH + '</button>' +
          '</div>' +
          '<div class="sm-row">' +
          smField('Name', { grow: true, max: 50, value: biz.name, placeholder: 'e.g. Order refund handling', attrs: 'data-biz-field="name" data-biz-id="' + biz.id + '"' }) +
          '<div class="sm-field"><label class="sm-label">Priority</label><div class="sm-seg" role="group" aria-label="Priority">' + seg + '</div></div>' +
          '</div>' +
          smField('Description &amp; goals <span class="sm-opt">Optional</span>', { area: true, max: 500, value: biz.desc, placeholder: 'Describe the specific problem this scenario solves', attrs: 'data-biz-field="desc" data-biz-id="' + biz.id + '"' }) +
          '</section>'
        )
      }).join('')
      createSceneForm.innerHTML =
        '<section class="sm-card">' +
        '<div class="sm-card-head">' +
        '<span class="sm-chip sm-chip-app">' + ICON_APP + '</span>' +
        '<h3 class="sm-card-title">Application scenario</h3>' +
        '<span class="sm-tag">AgentTeam</span>' +
        '</div>' +
        smField('Name <span class="sm-req">*</span>', { id: 'create-scene-name', max: 50, value: draft.appName, placeholder: 'e.g. Customer service hub', attrs: 'data-app-field="appName"' }) +
        smField('Description &amp; goals <span class="sm-opt">Optional</span>', { area: true, max: 500, value: draft.appDesc, placeholder: 'Briefly describe the problem this application solves', attrs: 'data-app-field="appDesc"' }) +
        '</section>' +
        bizHtml +
        '<button type="button" class="sm-add" data-add-biz>' + ICON_PLUS + 'Add business scenario</button>'
      syncCreateSceneConfirm()
    }

    function findCreateBiz(id) {
      if (!createSceneDraft) return null
      for (var i = 0; i < createSceneDraft.businesses.length; i++) {
        if (String(createSceneDraft.businesses[i].id) === String(id)) return createSceneDraft.businesses[i]
      }
      return null
    }

    function closeCreateSceneModal() {
      if (!createSceneModal) return
      createSceneModal.classList.remove('is-open')
      createSceneModal.hidden = true
      createSceneModal.setAttribute('aria-hidden', 'true')
      createSceneOnConfirm = null
      createSceneDraft = null
      if (createSceneForm) createSceneForm.innerHTML = ''
      if (createSceneConfirm) createSceneConfirm.disabled = true
    }

    function openCreateSceneModal(onConfirm) {
      if (!createSceneModal) return
      createSceneOnConfirm = onConfirm
      resetCreateSceneDraft()
      renderCreateSceneForm()
      createSceneModal.hidden = false
      createSceneModal.classList.add('is-open')
      createSceneModal.setAttribute('aria-hidden', 'false')
      createSceneForm.scrollTop = 0
      requestAnimationFrame(function () {
        var name = document.getElementById('create-scene-name')
        if (name) name.focus()
      })
    }

    /** Demo helper: Space in any form field auto-fills English sample data. */
    function fillDemoCreateScene() {
      if (!createSceneDraft) return
      createSceneBizSeq = 2
      createSceneDraft.appName = 'Customer service hub'
      createSceneDraft.appDesc = 'Handle tickets, refunds, and escalations across channels with a shared AgentTeam.'
      createSceneDraft.businesses = [
        { id: 1, name: 'Order refund handling', desc: 'Review refund requests, check policy, and draft replies for CS.', priority: 'Quick win' },
        { id: 2, name: 'Ticket triage', desc: 'Route inbound tickets by urgency and topic before human takeover.', priority: 'Important' }
      ]
      renderCreateSceneForm()
      requestAnimationFrame(function () {
        if (createSceneConfirm) createSceneConfirm.focus()
      })
    }

    if (createSceneModal) {
      createSceneModal.addEventListener('click', function (event) {
        if (event.target.closest('[data-create-close]')) closeCreateSceneModal()
      })
      createSceneForm.addEventListener('keydown', function (event) {
        if (event.key !== ' ' && event.code !== 'Space') return
        if (event.metaKey || event.ctrlKey || event.altKey) return
        event.preventDefault()
        fillDemoCreateScene()
      })
      createSceneForm.addEventListener('input', function (event) {
        var t = event.target
        var appField = t.getAttribute('data-app-field')
        var bizField = t.getAttribute('data-biz-field')
        var count = t.parentNode.querySelector('.sm-count')
        if (count) count.textContent = t.value.length + '/' + t.maxLength
        if (appField && createSceneDraft) {
          createSceneDraft[appField] = t.value
          syncCreateSceneConfirm()
          return
        }
        var biz = findCreateBiz(t.getAttribute('data-biz-id'))
        if (bizField && biz) biz[bizField] = t.value
      })
      createSceneForm.addEventListener('click', function (event) {
        if (event.target.closest('[data-add-biz]')) {
          createSceneDraft.businesses.push(newCreateBiz())
          renderCreateSceneForm()
          var cards = createSceneForm.querySelectorAll('.sm-card')
          var last = cards[cards.length - 1]
          if (last) {
            last.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            var inp = last.querySelector('input')
            if (inp) inp.focus({ preventScroll: true })
          }
          return
        }
        var pri = event.target.closest('[data-priority]')
        if (pri) {
          var pb = findCreateBiz(pri.getAttribute('data-biz-id'))
          if (pb) pb.priority = pri.getAttribute('data-priority')
          Array.prototype.forEach.call(pri.parentNode.children, function (b) { b.classList.toggle('is-on', b === pri) })
          return
        }
        var remove = event.target.closest('[data-remove-biz]')
        if (!remove || !createSceneDraft) return
        var removeId = remove.getAttribute('data-remove-biz')
        createSceneDraft.businesses = createSceneDraft.businesses.filter(function (item) {
          return String(item.id) !== String(removeId)
        })
        renderCreateSceneForm()
      })
      createSceneForm.addEventListener('submit', function (event) {
        event.preventDefault()
        if (!createSceneDraft || !createSceneDraft.appName.trim() || !createSceneOnConfirm) return
        var fn = createSceneOnConfirm
        var businesses = createSceneDraft.businesses
          .filter(function (item) { return item.name.trim() })
          .map(function (item) { return { name: item.name.trim(), desc: item.desc.trim(), priority: item.priority } })
        var payload = {
          title: createSceneDraft.appName.trim(),
          desc: createSceneDraft.appDesc.trim() || (businesses[0] && businesses[0].desc) || 'No description yet',
          appName: createSceneDraft.appName.trim(),
          appDesc: createSceneDraft.appDesc.trim(),
          businesses: businesses
        }
        closeCreateSceneModal()
        fn(payload)
      })
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && createSceneModal.classList.contains('is-open')) closeCreateSceneModal()
      })
    }

  var trigger = document.getElementById('scene-new-btn')
  if (trigger) {
    trigger.addEventListener('click', function () {
      openCreateSceneModal(function (payload) {
        // Hook for later: add the new scenario card to the left list.
        if (window.WorkshopCreateScene && typeof window.WorkshopCreateScene.onCreate === 'function') {
          window.WorkshopCreateScene.onCreate(payload)
        }
      })
    })
  }
  window.WorkshopCreateScene = window.WorkshopCreateScene || {}
  window.WorkshopCreateScene.open = openCreateSceneModal
})()
