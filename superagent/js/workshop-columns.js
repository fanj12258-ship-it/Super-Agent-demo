  ;(function initWorkshopColumns() {
    var shell = document.getElementById('app-shell')
    var leftPanel = document.getElementById('sidebar-left')
    var rightPanel = document.getElementById('sidebar-right')
    var leftHandle = document.getElementById('resize-left')
    var rightHandle = document.getElementById('resize-right')
    if (!shell || !leftHandle || !rightHandle) return

    var LEFT_MIN = 208
    var LEFT_MAX = 400
    var RIGHT_MIN = 220
    var RIGHT_MAX = 1200
    var CENTER_MIN = 400
    var RESIZE_GUTTER = 20

    function pxVal(raw, fallback) {
      var n = parseFloat(raw)
      return Number.isFinite(n) ? n : fallback
    }
    function leftWidth() {
      if (leftPanel && !leftPanel.classList.contains('is-open')) return 0
      return pxVal(getComputedStyle(shell).getPropertyValue('--left-width'), 290)
    }
    function rightWidth() {
      if (rightPanel && !rightPanel.classList.contains('is-open')) return 0
      return pxVal(getComputedStyle(shell).getPropertyValue('--right-width'), 600)
    }
    function setLeftWidth(px) {
      shell.style.setProperty('--left-width', px + 'px')
      if (leftPanel) leftPanel.style.setProperty('--left-width', px + 'px')
    }
    function setRightWidth(px) {
      shell.style.setProperty('--right-width', px + 'px')
      if (rightPanel) rightPanel.style.setProperty('--right-width', px + 'px')
    }
    function trackWidth() {
      return shell.getBoundingClientRect().width
    }
    function shellRect() {
      return shell.getBoundingClientRect()
    }
    function clampLeft(next) {
      if (leftPanel && !leftPanel.classList.contains('is-open')) return 0
      var maxLeft = trackWidth() - rightWidth() - CENTER_MIN - RESIZE_GUTTER
      return Math.round(Math.min(LEFT_MAX, maxLeft, Math.max(LEFT_MIN, next)))
    }
    function clampRight(next) {
      if (rightPanel && !rightPanel.classList.contains('is-open')) return 0
      var maxRight = trackWidth() - leftWidth() - CENTER_MIN - RESIZE_GUTTER
      maxRight = Math.min(maxRight, RIGHT_MAX)
      return Math.round(Math.max(RIGHT_MIN, Math.min(maxRight, next)))
    }
    function normalizeWidths() {
      if (rightPanel && rightPanel.classList.contains('is-open')) {
        setRightWidth(clampRight(rightWidth()))
      }
      if (leftPanel && leftPanel.classList.contains('is-open')) {
        setLeftWidth(clampLeft(leftWidth()))
      }
    }

    var activeSide = null

    function onPointerMove(event) {
      if (!activeSide) return
      var rect = shellRect()
      if (activeSide === 'left') {
        setLeftWidth(clampLeft(event.clientX - rect.left))
      } else {
        setRightWidth(clampRight(rect.right - event.clientX))
      }
    }

    function endColumnDrag() {
      if (!activeSide) return
      activeSide = null
      leftHandle.classList.remove('is-active')
      rightHandle.classList.remove('is-active')
      document.body.classList.remove('is-col-resizing')
      if (leftPanel) leftPanel.classList.remove('is-resizing')
      if (rightPanel) rightPanel.classList.remove('is-resizing')
    }

    function bindResize(handle, side) {
      handle.addEventListener('pointerdown', function (event) {
        if (event.button !== 0) return
        event.preventDefault()
        activeSide = side
        handle.classList.add('is-active')
        document.body.classList.add('is-col-resizing')
        if (side === 'left' && leftPanel) leftPanel.classList.add('is-resizing')
        if (side === 'right' && rightPanel) rightPanel.classList.add('is-resizing')
        if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId)
      })
      handle.addEventListener('pointerup', endColumnDrag)
      handle.addEventListener('pointercancel', endColumnDrag)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endColumnDrag)
    window.addEventListener('pointercancel', endColumnDrag)

    bindResize(leftHandle, 'left')
    bindResize(rightHandle, 'right')
    window.addEventListener('resize', normalizeWidths)
    window.workshopColumnsNormalize = normalizeWidths
    normalizeWidths()
  })()
