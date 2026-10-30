/* popovers-notify.js — account / team menus, notifications panel (placement, open/close, mock data) */

var userBtn = document.getElementById('userBtn');
var acct = document.getElementById('acctMenu');
var teamBtn = document.getElementById('teamBtn');
var teamMenu = document.getElementById('teamMenu');
var notifyBtn = document.getElementById('notifyBtn');
var notifyPanel = document.getElementById('notifyPanel');
var ntList = document.getElementById('ntList');
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
];
function closeTeam() {
  teamMenu.hidden = true;
  teamBtn.classList.remove('is-open');
  teamBtn.setAttribute('aria-expanded', 'false');
}
function closeNotify() {
  notifyPanel.hidden = true;
  notifyBtn.classList.remove('is-open');
  notifyBtn.setAttribute('aria-expanded', 'false');
}
function closeAcct() {
  closeTeam();
  closeNotify();
  acct.hidden = true;
  userBtn.classList.remove('is-open');
  userBtn.setAttribute('aria-expanded', 'false');
}
/** Shared placement: same inset/width as account popover (source of truth). */
function placeSidebarPopover(el, anchor, side) {
  var sb = document.querySelector('.sidebar').getBoundingClientRect();
  var rc = anchor.getBoundingClientRect();
  var gap = 8;
  el.style.width = Math.max(0, sb.width - gap * 2) + 'px';
  el.style.left = (sb.left + gap) + 'px';
  if (side === 'below') {
    el.style.top = (rc.bottom + 4) + 'px';
    el.style.bottom = 'auto';
  } else {
    el.style.top = 'auto';
    el.style.bottom = (window.innerHeight - rc.top + 4) + 'px';
  }
}
function openAcct() {
  closeTeam();
  closeNotify();
  placeSidebarPopover(acct, userBtn, 'above');
  var accountLeft=document.querySelector('.sidebar').getBoundingClientRect().left+12;
  acct.style.left=accountLeft+'px';
  acct.style.width=Math.min(280,window.innerWidth-accountLeft-12)+'px';
  acct.hidden = false;
  userBtn.classList.add('is-open');
  userBtn.setAttribute('aria-expanded', 'true');
}
function renderNotifications() {
  if (!notifications.length) {
    ntList.innerHTML = '<div class="nt-empty">No notifications</div>';
    return;
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
    '</div>';
  }).join('');
}
function openNotify() {
  closeTeam();
  acct.hidden = true;
  userBtn.classList.remove('is-open');
  userBtn.setAttribute('aria-expanded', 'false');
  placeSidebarPopover(notifyPanel, notifyBtn, 'above');
  notifyPanel.style.width = Math.min(360, window.innerWidth - parseFloat(notifyPanel.style.left) - 16) + 'px'; // wider than sidebar, see CSS
  renderNotifications();
  notifyPanel.hidden = false;
  notifyBtn.classList.add('is-open');
  notifyBtn.setAttribute('aria-expanded', 'true');
}
userBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  acct.hidden ? openAcct() : closeAcct();
});
acct.addEventListener('click', function (e) {
  e.stopPropagation();
  if (e.target.closest('.acct-item')) closeAcct();
});
notifyBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  notifyPanel.hidden ? openNotify() : closeNotify();
});
notifyPanel.addEventListener('click', function (e) { e.stopPropagation(); });
teamBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  if (!teamMenu.hidden) { closeTeam(); return; }
  closeNotify();
  acct.hidden = true;
  userBtn.classList.remove('is-open');
  userBtn.setAttribute('aria-expanded', 'false');
  placeSidebarPopover(teamMenu, teamBtn, 'below');
  teamMenu.hidden = false;
  teamBtn.classList.add('is-open');
  teamBtn.setAttribute('aria-expanded', 'true');
});
teamMenu.addEventListener('click', function (e) {
  e.stopPropagation();
  var it = e.target.closest('.acct-item');
  if (!it) return;
  if (it.id === 'teamNew') {
    var nm = (window.prompt('New project space name') || '').trim();
    closeTeam();
    if (!nm) return;
    var colors = ['#f5a623', '#e5484d', '#0ea5e9', '#8e4ec6', '#14ae5c'];
    var cnt = teamMenu.querySelectorAll('.acct-item[data-team]').length;
    var btn = document.createElement('button');
    btn.className = 'acct-item';
    btn.type = 'button';
    btn.setAttribute('role', 'menuitemradio');
    btn.dataset.team = nm;
    btn.dataset.letter = nm.charAt(0).toUpperCase();
    btn.dataset.color = colors[cnt % colors.length];
    btn.innerHTML = '<span class="t-ava"></span><span class="t-name"></span>' +
      '<svg class="t-check" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3L5 8.8l4.5-5" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.querySelector('.t-ava').textContent = btn.dataset.letter;
    btn.querySelector('.t-ava').style.background = btn.dataset.color;
    btn.querySelector('.t-name').textContent = nm;
    teamMenu.querySelector('.acct-sec').appendChild(btn);
    btn.click();
    return;
  }
  teamMenu.querySelectorAll('.acct-item[data-team]').forEach(function (i) { i.classList.toggle('is-current', i === it); });
  currentTeam = it.dataset.team;
  document.getElementById('teamName').textContent = currentTeam;
  var av = document.getElementById('teamAvatar');
  av.textContent = it.dataset.letter;
  av.style.background = it.dataset.color;
  var active = document.querySelector('.nav-item.is-active');
  if (active) render(active.dataset.view);
  closeTeam();
});
document.addEventListener('click', closeAcct);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAcct(); });
window.addEventListener('resize', closeAcct);
renderNotifications();
