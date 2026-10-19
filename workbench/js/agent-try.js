/* agent-try.js — fullscreen Try session with mocked conversation */
(function () {
  'use strict';

  var SIDEBAR_AGENTS = [
    {
      id: 'Supplier discovery assistant',
      label: 'Supplier discovery assistant',
      letter: 'S',
      color: '#0d8ae6',
      model: 'qwen3.7-max',
      role: 'Generate search plans and aggregate supplier candidates for CS review.',
      intro: 'From T1 strategy, I search 16+ sources, tag suppliers, and sync the pool to T3/T4 after your review.'
    },
    {
      id: 'Supplier deep-research assistant',
      label: 'Supplier deep-research assistant',
      letter: 'R',
      color: '#c2410c',
      model: 'deepseek-v4-pro',
      role: 'Enrich candidates via registry checks and multi-source fusion.',
      intro: 'I enrich candidates with registry checks, cross-validation, and risk labels for review-ready profiles.'
    },
    {
      id: 'Sourcing strategy assistant',
      label: 'Sourcing strategy assistant',
      letter: 'P',
      color: '#6a54f0',
      model: 'deepseek-v4-pro',
      role: 'Draft structured sourcing strategy with keywords and exclusions.',
      intro: 'I draft sourcing strategy with keywords, exclusions, and evaluation priorities.'
    },
    {
      id: 'Screening & long-list assistant',
      label: 'Screening & long-list assistant',
      letter: 'L',
      color: '#1d4ed8',
      model: 'qwen3.7-max',
      role: 'Run compliance and threshold screening into a long-list report.',
      intro: 'I screen candidates by compliance and thresholds, then produce a long-list report for CS.'
    }
  ];

  var SIDEBAR_CHATS = [
    { id: 'c1', title: '6-layer PCB supplier shortlist', time: 'Today', active: true },
    { id: 'c2', title: 'Kaisheng / Mingda risk compare', time: 'Yesterday' },
    { id: 'c3', title: 'Long list for CS review', time: 'Mon' },
    { id: 'c4', title: 'Quote compare & MOQ', time: 'Last week' }
  ];

  var AGENTS = {};
  SIDEBAR_AGENTS.forEach(function (a) { AGENTS[a.id] = a; });

  var params = new URLSearchParams(location.search);
  var agentName = params.get('agent') || 'Supplier discovery assistant';
  var meta = AGENTS[agentName] || {
    letter: (agentName.match(/[A-Za-z]/) || ['A'])[0].toUpperCase(),
    color: '#0d8ae6',
    model: 'Auto',
    role: 'Runnable agent for this project space.',
    label: agentName
  };

  var main = document.getElementById('tryMain');
  var thread = document.getElementById('tryThread');
  var inner = document.getElementById('tryThreadInner');
  var form = document.getElementById('tryForm');
  var input = document.getElementById('tryInput');
  var send = document.getElementById('trySend');
  var busy = false;
  var started = false;

  document.getElementById('tryName').textContent = agentName;
  document.getElementById('trySub').textContent = meta.model + ' · ' + meta.role;
  document.title = 'Try · ' + agentName + ' · AgentOS';
  var ava = document.getElementById('tryAva');
  ava.textContent = meta.letter;
  ava.style.background = meta.color;
  var emptyTitle = document.getElementById('tryEmptyTitle');
  var emptyDesc = document.getElementById('tryEmptyDesc');
  if (emptyTitle) emptyTitle.textContent = meta.label || agentName;
  if (emptyDesc) {
    emptyDesc.textContent = meta.intro ||
      ('Tell me what you need — I’ll reply with a try-ready answer.');
  }

  function enterChat() {
    if (started) return;
    started = true;
    if (main) main.classList.remove('is-empty');
    autosize();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollBottom() {
    thread.scrollTop = thread.scrollHeight;
  }

  function avaHtml() {
    return '<span class="try-ava" style="background:' + meta.color + '">' + esc(meta.letter) + '</span>';
  }

  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'try-msg-user';
    el.textContent = text;
    inner.appendChild(el);
    scrollBottom();
  }

  function addAssistant(html, suggestions) {
    var el = document.createElement('div');
    el.className = 'try-msg-assistant';
    el.innerHTML =
      avaHtml() +
      '<div class="try-turn">' +
      '<div class="try-turn-name">' + esc(agentName) + '</div>' +
      '<div class="try-prose">' + html + '</div>' +
      (suggestions && suggestions.length
        ? '<div class="try-suggestions">' + suggestions.map(function (s) {
            return '<button type="button" class="try-sg" data-fill="' + esc(s) + '">' + esc(s) + '</button>';
          }).join('') + '</div>'
        : '') +
      '</div>';
    inner.appendChild(el);
    scrollBottom();
    return el;
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'try-msg-assistant';
    el.dataset.typing = '1';
    el.innerHTML =
      avaHtml() +
      '<div class="try-turn"><div class="try-turn-name">' + esc(agentName) + '</div>' +
      '<div class="try-typing" aria-label="Thinking"><i></i><i></i><i></i></div></div>';
    inner.appendChild(el);
    scrollBottom();
    return el;
  }

  function replyFor(text) {
    var t = text.trim();
    if (/long.?list|export|summary|organize|整理|长名单/i.test(t)) {
      return '<p>Here’s a draft long list for CS review:</p>' +
        '<ul>' +
        '<li>Compliance pool: 12 · pending human confirm: 3</li>' +
        '<li>Evidence tags: L0–L3</li>' +
        '<li>Ready to paste into sourcing review materials</li>' +
        '</ul>' +
        '<p>I can also generate a scoring sheet or risk notes next.</p>';
    }
    if (/risk|incident|exclude|异常|风险|排除/i.test(t)) {
      return '<p>After filtering the last 12 months of incidents, <strong>9 suppliers</strong> remain:</p>' +
        '<ul>' +
        '<li>Removed 2 with repeated late deliveries</li>' +
        '<li>Removed 1 with expired certificates</li>' +
        '<li>Kept 1 exception-marked supplier (Kaisheng) for human decision</li>' +
        '</ul>' +
        '<p>Want quote comparison next, or a review summary first?</p>';
    }
    if (/quote|price|compare|报价|价格|比价/i.test(t)) {
      return '<p>Initial quote compare with sample data (not connected to live ERP):</p>' +
        '<table class="try-table"><thead><tr><th>Supplier</th><th>Unit price</th><th>MOQ</th><th>Note</th></tr></thead><tbody>' +
        '<tr><td>Apex Circuit</td><td>¥18.6</td><td>2k</td><td>Rush tier available</td></tr>' +
        '<tr><td>Nova PCB</td><td>¥17.9</td><td>5k</td><td>Most stable lead time</td></tr>' +
        '<tr><td>BrightBoard</td><td>¥16.8</td><td>3k</td><td>Lower evidence level</td></tr>' +
        '</tbody></table>' +
        '<p>Once ERP is connected, I’ll recalculate with live fields.</p>';
    }
    return '<p>Got it: “' + esc(t) + '”.</p>' +
      '<p>This is a demo session. I can help with candidate screening, risk checks, long-list prep, or quote compare — just say what’s next.</p>';
  }

  function syncComposer() {
    var has = !!input.value.trim();
    form.classList.toggle('has-text', has);
    send.disabled = busy || !has;
  }

  function setBusy(on) {
    busy = on;
    input.disabled = on;
    syncComposer();
  }

  function autosize() {
    var min = main && main.classList.contains('is-empty') ? 72 : 26;
    input.style.height = 'auto';
    input.style.height = Math.max(min, Math.min(input.scrollHeight, 160)) + 'px';
  }

  async function ask(text) {
    if (!text || busy) return;
    enterChat();
    addUser(text);
    input.value = '';
    autosize();
    setBusy(true);
    var typing = addTyping();
    await new Promise(function (r) { setTimeout(r, 700 + Math.random() * 500); });
    typing.remove();
    addAssistant(replyFor(text), ['Dig into risks', 'Build a long list', 'Run a quote compare']);
    setBusy(false);
    input.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value.trim());
  });

  input.addEventListener('input', function () {
    syncComposer();
    autosize();
  });
  syncComposer();
  autosize();

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(input.value.trim());
    }
  });

  inner.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fill]');
    if (!b || busy) return;
    ask(b.getAttribute('data-fill'));
  });

  function goBack() {
    location.href = 'agentos-workbench.html';
  }

  function renderSidebar() {
    var agentList = document.getElementById('tryAgentList');
    var chatList = document.getElementById('tryChatList');
    if (!agentList || !chatList) return;

    var newIco =
      '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="M3 3.8h7.2a1.6 1.6 0 0 1 1.6 1.6v4.2a1.6 1.6 0 0 1-1.6 1.6H7.1L4.4 13.4V11.2H3A1.6 1.6 0 0 1 1.4 9.6V5.4A1.6 1.6 0 0 1 3 3.8Z" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/>' +
      '<path d="M6.6 6.2v3.2M5 7.8h3.2" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>' +
      '</svg>';

    agentList.innerHTML = SIDEBAR_AGENTS.map(function (a) {
      var on = a.id === agentName;
      return '<button type="button" class="try-rail-item' + (on ? ' is-active' : '') + '" data-agent="' + esc(a.id) + '">' +
        '<span class="try-rail-ico is-bot" style="background:' + a.color + '">' + esc(a.letter) + '</span>' +
        '<span class="try-rail-label">' + esc(a.label) + '</span>' +
        '<span class="try-rail-new" title="New chat">' + newIco + '</span>' +
        '</button>';
    }).join('');

    chatList.innerHTML = SIDEBAR_CHATS.map(function (c) {
      return '<button type="button" class="try-chat-item' + (c.active ? ' is-active' : '') + '" data-chat="' + esc(c.id) + '">' +
        '<span class="try-chat-dot" aria-hidden="true"></span>' +
        '<span class="try-chat-label">' + esc(c.title) + '</span>' +
        '<span class="try-chat-time">' + esc(c.time) + '</span>' +
        '</button>';
    }).join('');

    agentList.addEventListener('click', function (e) {
      var b = e.target.closest('[data-agent]');
      if (!b) return;
      var next = b.getAttribute('data-agent');
      if (!next || next === agentName) return;
      location.href = 'agent-try.html?agent=' + encodeURIComponent(next);
    });

    chatList.addEventListener('click', function (e) {
      var b = e.target.closest('[data-chat]');
      if (!b) return;
      chatList.querySelectorAll('.try-chat-item').forEach(function (el) {
        el.classList.toggle('is-active', el === b);
      });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') goBack();
  });

  renderSidebar();
  input.focus();
})();
