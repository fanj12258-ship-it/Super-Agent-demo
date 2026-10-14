  ;(function initComposerModelPicker() {
    var MODELS = [
      'Auto',
      'deepseek-v4-pro',
      'MiniMax-M3',
      'qwen3.7-max',
      'kimi-k2.7-code',
      'kimi-k3',
      'glm-5.3',
      'glm-5.3-flash',
      'deepseek-v4-flash',
      'deepseek-v4.1-flash-free',
      'qwen3.8-flash'
    ]
    var INTENSITIES = ['Default', 'Low', 'Medium', 'High']
    var wrap = document.getElementById('composer-model')
    var trigger = document.getElementById('composer-model-trigger')
    var panel = document.getElementById('composer-model-panel')
    var menu = document.getElementById('composer-model-menu')
    var summaryEl = document.getElementById('composer-model-summary')
    var modelValueEl = document.getElementById('composer-model-value')
    var intensityValueEl = document.getElementById('composer-intensity-value')
    if (!wrap || !trigger || !panel || !menu) return

    var model = 'Auto'
    var intensity = 'Default'
    var openMenu = 'model'

    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu)
    }

    function syncView() {
      if (summaryEl) summaryEl.textContent = model === 'Auto' ? 'Auto' : model + ' ' + intensity
      if (modelValueEl) modelValueEl.textContent = model
      if (intensityValueEl) intensityValueEl.textContent = intensity
      trigger.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true')
      panel.querySelectorAll('[data-open]').forEach(function (row) {
        row.classList.toggle('is-active', !panel.hidden && row.getAttribute('data-open') === openMenu)
      })
    }

    function alignMenu() {
      if (menu.hidden || panel.hidden) return
      var row = panel.querySelector('[data-open="' + openMenu + '"]')
      if (!row) return
      var panelRect = panel.getBoundingClientRect()
      var rowRect = row.getBoundingClientRect()
      menu.style.visibility = 'hidden'
      menu.hidden = false
      var menuWidth = menu.offsetWidth || 200
      var menuHeight = menu.offsetHeight || 0
      var top = rowRect.top
      var maxTop = window.innerHeight - menuHeight - 8
      if (top > maxTop) top = Math.max(8, maxTop)
      menu.style.top = Math.round(top) + 'px'
      menu.style.left = Math.round(panelRect.left - menuWidth + 1) + 'px'
      menu.style.right = 'auto'
      menu.style.visibility = ''
    }

    function closeAll() {
      panel.hidden = true
      menu.hidden = true
      menu.style.top = ''
      menu.style.left = ''
      menu.style.right = ''
      menu.style.visibility = ''
      syncView()
    }

    function renderMenu(kind) {
      openMenu = kind || openMenu || 'model'
      var items = openMenu === 'model' ? MODELS : INTENSITIES
      var current = openMenu === 'model' ? model : intensity
      menu.innerHTML = items
        .map(function (item) {
          var selected = item === current
          return (
            '<button type="button" class="composer-model-option' + (selected ? ' is-selected' : '') + '" data-value="' + item + '">' +
            '<span>' + item + '</span>' +
            (selected
              ? '<svg class="composer-model-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
              : '') +
            '</button>'
          )
        })
        .join('')
      menu.hidden = false
      syncView()
      requestAnimationFrame(alignMenu)
    }

    function openPanel() {
      var tokenPanel = document.getElementById('composer-token-panel')
      var tokenBtn = document.getElementById('composer-token-btn')
      if (tokenPanel) tokenPanel.hidden = true
      if (tokenBtn) tokenBtn.setAttribute('aria-expanded', 'false')
      panel.hidden = false
      renderMenu(openMenu || 'model')
    }

    trigger.addEventListener('click', function (event) {
      event.stopPropagation()
      if (!panel.hidden) {
        closeAll()
        return
      }
      openPanel()
    })

    panel.querySelectorAll('[data-open]').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        if (panel.hidden) return
        renderMenu(row.getAttribute('data-open'))
      })
    })

    panel.addEventListener('click', function (event) {
      event.stopPropagation()
      var row = event.target.closest('[data-open]')
      if (row) renderMenu(row.getAttribute('data-open'))
    })

    menu.addEventListener('click', function (event) {
      event.stopPropagation()
      var option = event.target.closest('.composer-model-option')
      if (!option) return
      var value = option.getAttribute('data-value')
      if (!value) return
      if (openMenu === 'model') model = value
      else if (openMenu === 'intensity') intensity = value
      renderMenu(openMenu)
    })

    document.addEventListener('click', function (event) {
      if (!wrap.contains(event.target) && !menu.contains(event.target)) closeAll()
    })
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) closeAll()
    })
    window.addEventListener('resize', function () {
      if (!panel.hidden) alignMenu()
    })

    syncView()
  })()
