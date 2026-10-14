(function () {
  var userBtn = document.getElementById('userBtn')
  var acct = document.getElementById('acctMenu')
  var notifyBtn = document.getElementById('notifyBtn')
  var notifyPanel = document.getElementById('notifyPanel')
  var ntList = document.getElementById('ntList')
  var overviewMenu = document.getElementById('overviewMenu')
  var brandPicker = document.getElementById('brandPicker')
  if (!userBtn || !acct || !notifyBtn || !notifyPanel || !ntList) return

  var notifications = [
    { id: 1, name: 'Li Wei', letter: 'L', color: '#0ea5e9', time: '2h', action: 'Invited you to Ascentium' },
    { id: 2, name: 'Anna Chen', letter: 'A', color: '#14ae5c', time: '5h', action: 'Created ontology · Supplier Risk' },
    { id: 3, name: 'Tom Park', letter: 'T', color: '#f5a623', time: '1d', action: 'Published doc · Sourcing playbook' },
    { id: 4, name: 'Maya Liu', letter: 'M', color: '#8e4ec6', time: 'Oct 8', action: 'Scenario ready · Vendor onboarding' },
    { id: 5, name: 'Chris Wong', letter: 'C', color: '#e5484d', time: 'Oct 7', action: 'Shared skill · RFP scoring' },
    { id: 6, name: 'Sarah Kim', letter: 'S', color: '#14ae5c', time: 'Oct 7', action: 'Commented on scenario · Supplier research desk — "Can we add a CS confirmation checkpoint before shortlist?"' },
    { id: 7, name: 'Daniel Zhou', letter: 'D', color: '#0ea5e9', time: 'Oct 6', action: 'Updated knowledge base · Procurement policy v3' },
    { id: 8, name: 'Emma Liu', letter: 'E', color: '#f5a623', time: 'Oct 6', action: 'Added MCP · Slack workspace connector' },
    { id: 9, name: 'Kevin Wu', letter: 'K', color: '#8e4ec6', time: 'Oct 5', action: 'Agent went live · Store allocation assistant' },
    { id: 10, name: 'Nina Park', letter: 'N', color: '#e5484d', time: 'Oct 5', action: 'Requested review · Rule-based allocate' },
    { id: 11, name: 'Jason Lee', letter: 'J', color: '#14ae5c', time: 'Oct 4', action: 'Published skill · Contract risk check' },
    { id: 12, name: 'Olivia Chen', letter: 'O', color: '#0ea5e9', time: 'Oct 3', action: 'Invited you to project space · Retail Ops' },
    { id: 13, name: 'Henry Zhang', letter: 'H', color: '#f5a623', time: 'Oct 2', action: 'Created scenario · Hiring screening pipeline' },
    { id: 14, name: 'Grace Xu', letter: 'G', color: '#8e4ec6', time: 'Oct 1', action: 'Shared file · Q3 supplier scorecard.xlsx' }
  ]

  function closeOverview() {
    if (!overviewMenu || overviewMenu.hidden) return
    overviewMenu.hidden = true
    if (brandPicker) brandPicker.setAttribute('aria-expanded', 'false')
  }

  function closeNotify() {
    notifyPanel.hidden = true
    notifyBtn.classList.remove('is-open')
    notifyBtn.setAttribute('aria-expanded', 'false')
  }

  function closeAcct() {
    closeNotify()
    acct.hidden = true
    userBtn.classList.remove('is-open')
    userBtn.setAttribute('aria-expanded', 'false')
  }

  function placeSidebarPopover(el, anchor, side) {
    var sbEl = document.getElementById('sidebar-left') || document.querySelector('.sidebar-left')
    if (!sbEl) return
    var sb = sbEl.getBoundingClientRect()
    var rc = anchor.getBoundingClientRect()
    var gap = 8
    el.style.width = Math.max(0, sb.width - gap * 2) + 'px'
    el.style.left = sb.left + gap + 'px'
    if (side === 'below') {
      el.style.top = rc.bottom + 4 + 'px'
      el.style.bottom = 'auto'
    } else {
      el.style.top = 'auto'
      el.style.bottom = window.innerHeight - rc.top + 4 + 'px'
    }
  }

  function openAcct() {
    closeOverview()
    closeNotify()
    placeSidebarPopover(acct, userBtn, 'above')
    acct.hidden = false
    userBtn.classList.add('is-open')
    userBtn.setAttribute('aria-expanded', 'true')
  }

  function renderNotifications() {
    if (!notifications.length) {
      ntList.innerHTML = '<div class="nt-empty">No notifications</div>'
      return
    }
    ntList.innerHTML = notifications.map(function (n) {
      return '<div class="nt-item">' +
        '<span class="nt-ava" style="background:' + n.color + '">' + n.letter + '</span>' +
        '<span class="nt-body">' +
          '<span class="nt-row1">' +
            '<span class="nt-name">' + n.name + '</span>' +
            '<span class="nt-time">' + n.time + '</span>' +
          '</span>' +
          '<span class="nt-act">' + n.action + '</span>' +
        '</span>' +
      '</div>'
    }).join('')
  }

  function openNotify() {
    closeOverview()
    acct.hidden = true
    userBtn.classList.remove('is-open')
    userBtn.setAttribute('aria-expanded', 'false')
    placeSidebarPopover(notifyPanel, notifyBtn, 'above')
    notifyPanel.style.width = Math.min(360, window.innerWidth - parseFloat(notifyPanel.style.left) - 16) + 'px'
    renderNotifications()
    notifyPanel.hidden = false
    notifyBtn.classList.add('is-open')
    notifyBtn.setAttribute('aria-expanded', 'true')
  }

  userBtn.addEventListener('click', function (e) {
    e.stopPropagation()
    acct.hidden ? openAcct() : closeAcct()
  })
  acct.addEventListener('click', function (e) {
    e.stopPropagation()
    if (e.target.closest('.acct-item')) closeAcct()
  })
  notifyBtn.addEventListener('click', function (e) {
    e.stopPropagation()
    notifyPanel.hidden ? openNotify() : closeNotify()
  })
  notifyPanel.addEventListener('click', function (e) { e.stopPropagation() })

  document.addEventListener('click', function (e) {
    if (!acct.hidden || !notifyPanel.hidden) {
      if (e.target.closest('#acctMenu') || e.target.closest('#notifyPanel') ||
          e.target.closest('#userBtn') || e.target.closest('#notifyBtn')) return
      closeAcct()
    }
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAcct()
  })
  window.addEventListener('resize', function () {
    if (!acct.hidden) placeSidebarPopover(acct, userBtn, 'above')
    if (!notifyPanel.hidden) {
      placeSidebarPopover(notifyPanel, notifyBtn, 'above')
      notifyPanel.style.width = Math.min(360, window.innerWidth - parseFloat(notifyPanel.style.left) - 16) + 'px'
    }
  })

  var langBtns = acct.querySelectorAll('.lang-seg [data-lang]')
  function setLang(lang) {
    langBtns.forEach(function (b) { b.classList.toggle('is-on', b.dataset.lang === lang) })
    acct.querySelectorAll('[data-zh]').forEach(function (el) { el.textContent = el.dataset[lang] })
  }
  langBtns.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation()
      setLang(b.dataset.lang)
    })
  })
  setLang('en')
  renderNotifications()
})()
