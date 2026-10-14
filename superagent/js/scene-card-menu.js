(function () {
  var root = document.getElementById('scene-cards')
  if (!root) return

  function closeAll(except) {
    root.querySelectorAll('.scene-menu').forEach(function (menu) {
      if (except && menu === except) return
      menu.hidden = true
      var btn = menu.parentElement && menu.parentElement.querySelector('.scene-unit-more')
      if (btn) btn.setAttribute('aria-expanded', 'false')
    })
  }

  root.addEventListener('click', function (e) {
    var more = e.target.closest('.scene-unit-more')
    if (more && root.contains(more)) {
      e.preventDefault()
      e.stopPropagation()
      var head = more.closest('.scene-unit-head')
      var menu = head ? head.querySelector('.scene-menu') : null
      if (!menu) return
      var open = menu.hidden
      closeAll(menu)
      menu.hidden = !open
      more.setAttribute('aria-expanded', open ? 'true' : 'false')
      return
    }
    if (e.target.closest('.scene-menu')) {
      // Edit / Delete: close after click for now
      closeAll()
      return
    }
  })

  document.addEventListener('click', function (e) {
    if (!root.contains(e.target)) closeAll()
    else if (!e.target.closest('.scene-unit-more') && !e.target.closest('.scene-menu')) closeAll()
  })

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll()
  })
})()
