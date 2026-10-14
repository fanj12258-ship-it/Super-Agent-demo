  ;(function initComposerTokenUsage() {
    var wrap = document.getElementById('composer-token')
    var btn = document.getElementById('composer-token-btn')
    var panel = document.getElementById('composer-token-panel')
    var closeBtn = document.getElementById('composer-token-close')
    if (!wrap || !btn || !panel) return

    function setOpen(open) {
      panel.hidden = !open
      btn.setAttribute('aria-expanded', open ? 'true' : 'false')
      if (open) {
        var modelPanel = document.getElementById('composer-model-panel')
        var modelTrigger = document.getElementById('composer-model-trigger')
        if (modelPanel) modelPanel.hidden = true
        if (modelTrigger) modelTrigger.setAttribute('aria-expanded', 'false')
      }
    }

    btn.addEventListener('click', function (event) {
      event.stopPropagation()
      setOpen(panel.hidden)
    })
    if (closeBtn) {
      closeBtn.addEventListener('click', function (event) {
        event.stopPropagation()
        setOpen(false)
      })
    }
    document.addEventListener('click', function (event) {
      if (!wrap.contains(event.target)) setOpen(false)
    })
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false)
    })
  })()
