;(function initWorkshopPanels() {
  var shell = document.getElementById('app-shell')
  var leftPanel = document.getElementById('sidebar-left')
  var rightPanel = document.getElementById('sidebar-right')
  var leftResize = document.getElementById('resize-left')
  var rightResize = document.getElementById('resize-right')
  var railLeft = document.getElementById('center-rail-left')
  var railRight = document.getElementById('center-rail-right')
  var toggleLeftHead = document.getElementById('toggle-left-sidebar')
  var toggleLeftRail = document.getElementById('toggle-left-rail')
  var toggleRightHead = document.getElementById('toggle-right-sidebar')
  var toggleRightRail = document.getElementById('toggle-right-rail')
  var fsRight = document.getElementById('right-fullscreen')
  var fsMain = document.getElementById('right-fullscreen-main')
  if (!shell || !leftPanel || !rightPanel) return

  var savedLeftWidth = null
  var savedRightWidth = null
  var expanded = false

  function pxVal(raw, fallback) {
    var n = parseFloat(raw)
    return Number.isFinite(n) ? n : fallback
  }
  function currentLeftWidth() {
    return pxVal(getComputedStyle(shell).getPropertyValue('--left-width'), 290)
  }
  function currentRightWidth() {
    return pxVal(getComputedStyle(shell).getPropertyValue('--right-width'), 600)
  }
  function setLeftWidth(px) {
    shell.style.setProperty('--left-width', px + 'px')
    leftPanel.style.setProperty('--left-width', px + 'px')
  }
  function setRightWidth(px) {
    shell.style.setProperty('--right-width', px + 'px')
    rightPanel.style.setProperty('--right-width', px + 'px')
  }
  function maxExpandWidth() {
    var CENTER_MIN = 400
    var RESIZE_GUTTER = 20
    var RIGHT_MAX = 1200
    var track = shell.getBoundingClientRect().width
    var left = leftPanel.classList.contains('is-open') ? currentLeftWidth() : 0
    var maxRight = track - left - CENTER_MIN - RESIZE_GUTTER
    return Math.round(Math.min(RIGHT_MAX, maxRight))
  }

  function syncChrome() {
    var leftOpen = leftPanel.classList.contains('is-open')
    var rightOpen = rightPanel.classList.contains('is-open')

    if (leftResize) leftResize.hidden = !leftOpen
    if (rightResize) rightResize.hidden = !rightOpen
    if (railLeft) railLeft.hidden = leftOpen
    if (railRight) railRight.hidden = rightOpen

    leftPanel.setAttribute('aria-hidden', leftOpen ? 'false' : 'true')
    rightPanel.setAttribute('aria-hidden', rightOpen ? 'false' : 'true')

    var leftLabel = leftOpen ? 'Collapse sidebar' : 'Open sidebar'
    ;[toggleLeftHead, toggleLeftRail].forEach(function (btn) {
      if (!btn) return
      btn.setAttribute('aria-pressed', leftOpen ? 'true' : 'false')
      btn.setAttribute('aria-label', leftLabel)
    })

    var rightLabel = rightOpen ? 'Close agent panel' : 'Open agent panel'
    ;[toggleRightHead, toggleRightRail].forEach(function (btn) {
      if (!btn) return
      btn.setAttribute('aria-pressed', rightOpen ? 'true' : 'false')
      btn.setAttribute('aria-label', rightLabel)
    })

    if (window.workshopColumnsNormalize) window.workshopColumnsNormalize()
  }

  function setLeftOpen(open) {
    if (open && !leftPanel.classList.contains('is-open') && savedLeftWidth != null) {
      setLeftWidth(savedLeftWidth)
    }
    if (!open && leftPanel.classList.contains('is-open')) {
      savedLeftWidth = currentLeftWidth()
    }
    leftPanel.classList.toggle('is-open', open)
    syncChrome()
  }

  function setRightOpen(open) {
    if (open && !rightPanel.classList.contains('is-open') && savedRightWidth != null) {
      setRightWidth(savedRightWidth)
    }
    if (!open && rightPanel.classList.contains('is-open')) {
      savedRightWidth = currentRightWidth()
      if (expanded) setExpanded(false)
    }
    rightPanel.classList.toggle('is-open', open)
    syncChrome()
  }

  function setExpanded(on) {
    expanded = on
    rightPanel.classList.toggle('is-expanded', on)
    if (on) {
      if (savedRightWidth == null) savedRightWidth = currentRightWidth()
      setRightWidth(maxExpandWidth())
    } else if (savedRightWidth != null) {
      setRightWidth(savedRightWidth)
    }
    ;[fsRight, fsMain].forEach(function (btn) {
      if (!btn) return
      btn.setAttribute('aria-pressed', on ? 'true' : 'false')
      btn.setAttribute('aria-label', on ? 'Restore agent panel width' : 'Expand agent panel')
    })
  }

  function bindPair(buttons, handler) {
    buttons.forEach(function (btn) {
      if (!btn) return
      btn.addEventListener('click', handler)
    })
  }

  bindPair([toggleLeftHead, toggleLeftRail], function () {
    setLeftOpen(!leftPanel.classList.contains('is-open'))
  })

  bindPair([toggleRightHead, toggleRightRail], function () {
    setRightOpen(!rightPanel.classList.contains('is-open'))
  })

  bindPair([fsRight, fsMain], function () {
    if (!rightPanel.classList.contains('is-open')) {
      setRightOpen(true)
      setExpanded(true)
      return
    }
    setExpanded(!expanded)
  })

  window.addEventListener('resize', function () {
    if (expanded && rightPanel.classList.contains('is-open')) {
      setRightWidth(maxExpandWidth())
    }
  })

  window.WorkshopPanels = {
    setLeftOpen: setLeftOpen,
    setRightOpen: setRightOpen,
    isRightOpen: function () { return rightPanel.classList.contains('is-open'); },
  };

  syncChrome()
})()
