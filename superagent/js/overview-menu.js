(function () {
  var trigger = document.getElementById('brandPicker')
  var menu = document.getElementById('overviewMenu')
  var label = trigger && trigger.querySelector('.brand-picker-label')
  if (!trigger || !menu || !label) return

  function place() {
    var r = trigger.getBoundingClientRect()
    var pad = 8
    var top = r.bottom + 6
    var left = r.left
    menu.style.top = top + 'px'
    menu.style.left = left + 'px'
    menu.hidden = false
    var mr = menu.getBoundingClientRect()
    if (mr.right > window.innerWidth - pad) {
      menu.style.left = Math.max(pad, window.innerWidth - pad - mr.width) + 'px'
    }
    if (mr.bottom > window.innerHeight - pad) {
      menu.style.top = Math.max(pad, r.top - 6 - mr.height) + 'px'
    }
  }

  function open() {
    place()
    trigger.setAttribute('aria-expanded', 'true')
  }

  function close() {
    menu.hidden = true
    trigger.setAttribute('aria-expanded', 'false')
  }

  function toggle() {
    if (menu.hidden) open()
    else close()
  }

  trigger.addEventListener('click', function (e) {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  })

  menu.addEventListener('click', function (e) {
    var item = e.target.closest('.ov-menu-item')
    if (!item || !menu.contains(item)) return
    menu.querySelectorAll('.ov-menu-item').forEach(function (el) {
      var on = el === item
      el.classList.toggle('is-current', on)
      el.setAttribute('aria-checked', on ? 'true' : 'false')
    })
    var name = item.getAttribute('data-label') || item.querySelector('.ov-menu-name').textContent
    label.textContent = name
    close()
  })

  document.addEventListener('click', function (e) {
    if (menu.hidden) return
    if (e.target.closest('#overviewMenu') || e.target.closest('#brandPicker')) return
    close()
  })

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) close()
  })

  window.addEventListener('resize', function () {
    if (!menu.hidden) place()
  })
})()
