/**
 * Fast POC page ONLY — the "conversation" layer of the centre chat (not loaded by superagent.html).
 *
 * One workspace can hold several conversations. A tab bar sits under the header divider:
 *   [≡ ▾ all conversations] | [tab] [tab] [tab] [+]
 * The first button opens a drop-down of every conversation (title · mode · last message · time) where each one
 * can be deleted (two clicks: 删除 → 确认); "+" starts a new conversation.
 *
 *   FastConversations.fresh({title, journey, archiveTitle})  start a new thread without any user action
 *                                         (used when the scene room opens; the old thread is kept as a conversation)
 *   FastConversations.rename(title)       rename the current conversation (the scripted journey does this)
 *   FastConversations.isJourney()         true when the current thread is the one the scripted journey runs in
 *   FastConversations.prompt()            Space-key text for a user-created conversation (null otherwise)
 *   FastConversations.plan(text)          short Agent turn { process, segments } for a user-created conversation (null otherwise)
 *
 * Switching keeps every thread alive: its DOM nodes are moved into a fragment and moved back on return,
 * together with scroll position and the unsent draft. Switching is disabled while the Agent is replying.
 */
(function () {
  'use strict';
  var thread = document.getElementById('chat-thread');
  var scrollEl = document.getElementById('chat-main-scroll');
  var input = document.getElementById('composer-input');
  var wrap = document.querySelector('.wrap');
  var page = document.querySelector('.page');
  var headEl = document.querySelector('.main-column-head');
  var heroStack = document.querySelector('.hero-stack');
  if (!thread || !headEl || !wrap) return;

  var DEFAULT = '新对话';
  var seq = 0, convs = [], cur = null, journeyId = null, menuOpen = false, confirmId = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }
  /* default conversation name: pull the topic out of the first message instead of cutting its first characters */
  var TOPICS = [
    [/mock|占位/i, 'Mock 清单'], [/上线|门槛|发布|生产/, '上线门槛'], [/进展|蓝图/, '蓝图进展'],
    [/缺.*资料|资料.*缺/, '缺失资料'], [/已知限制|限制/, '已知限制'], [/总结|变化/, 'v1.0 变化总结'],
  ];
  function nameOf(text) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return DEFAULT;
    if (t.length <= 20) for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i][0].test(t)) return TOPICS[i][1];
    var c = t.split(/[，。；！？,.;!?\n]/).filter(function (x) { return x.trim(); })[0] || t;
    c = c.trim()
      .replace(/^(请问|请|麻烦|帮我|帮忙|我们|我)?\s*(想要|想|要|需要|希望|打算|准备)?\s*(继续)?\s*(制作|做|打造|创建|搭建|开发|看看|看一下|查一下|分析一下)?\s*(一个|一款|一套|个)?\s*/, '')
      .replace(/^(主要是|主要|就是|是)/, '')
      .replace(/的\s*(Agent)/i, ' $1')
      .replace(/(吗|呢|吧|啊|了)$/, '').trim();
    return clip(c || t, 16);
  }
  function busy() { return !!(window.FastChat && window.FastChat.isBusy()); }
  function modeNow() { return window.FastMode ? window.FastMode.get() : 'fast'; }
  function sceneName() { var h = document.getElementById('center-head-title'); return h ? h.textContent : ''; }
  function ago(t) {
    var m = Math.floor((Date.now() - t) / 60000);
    if (m < 1) return '刚刚';
    if (m < 60) return m + ' 分钟前';
    if (m >= 1440) { var dd = Math.floor(m / 1440); return dd + ' 天前'; }
    var d = new Date(t); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  var I = {
    chat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12Z"/></svg>',
    list: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    newc: '<svg class="ws-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 20 9.5"/><path d="M17 3v6M14 6h6"/></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3 5 8.8l4.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fast: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>',
    steps: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3.5 7.75 12 12.5l8.5-4.75L12 3Z"/><path d="m3.5 12.25 8.5 4.75 8.5-4.75"/></svg>',
  };

  /* ───────── tab bar (under the header divider) ───────── */
  var bar = document.createElement('div');
  bar.className = 'cv-bar'; bar.id = 'cv-bar';
  bar.innerHTML =
    '<div class="cv-all"><button type="button" class="cv-allbtn" id="cv-all" aria-haspopup="listbox" aria-expanded="false" aria-label="所有对话" title="所有对话">' + I.list + '</button>' +
    '<div class="cv-menu" id="cv-menu" role="listbox" hidden></div></div>' +
    '<div class="cv-tabs" role="tablist"></div>' +
    '<button type="button" class="cv-add" id="cv-new" aria-label="新对话" title="新对话">' + I.plus + '</button>';
  headEl.parentNode.insertBefore(bar, headEl.nextSibling);
  var allBtn = bar.querySelector('.cv-allbtn'), menu = bar.querySelector('.cv-menu'), tabsEl = bar.querySelector('.cv-tabs'), newBtn = bar.querySelector('.cv-add');

  /* ───────── model ───────── */
  function mk(o) {
    return { id: 'c' + (++seq), title: o.title || DEFAULT, auto: !o.title, custom: !!o.custom, mode: modeNow(), t: Date.now(), n: 0, preview: '', frag: null, started: false, scroll: 0, draft: '' };
  }
  function hasContent() { return thread.children.length > 0; }
  function stash(c) {
    c.frag = document.createDocumentFragment();
    while (thread.firstChild) c.frag.appendChild(thread.firstChild);
    c.scroll = scrollEl ? scrollEl.scrollTop : 0;
    c.bottom = !scrollEl || (scrollEl.scrollHeight - scrollEl.clientHeight - scrollEl.scrollTop < 60);
    c.has = c.frag.childNodes.length > 0;
    c.started = wrap.classList.contains('chat-started');
    c.mode = modeNow();
    c.draft = input ? input.value : '';
  }
  function setStarted(on) {
    wrap.classList.toggle('chat-started', on);
    if (page) page.classList.toggle('chat-started', on);
  }
  function setDraft(v) {
    if (!input) return;
    input.value = v || '';
    input.dispatchEvent(new Event('input'));
  }
  function restore(c) {
    thread.innerHTML = '';
    if (c.frag) thread.appendChild(c.frag);
    c.frag = null;
    setStarted(c.started);
    setDraft(c.draft);
    function pos() { if (scrollEl) scrollEl.scrollTop = c.bottom ? scrollEl.scrollHeight : c.scroll; }
    pos(); requestAnimationFrame(pos);
    skip();
  }
  function init() {
    if (cur) return;
    cur = mk({}); convs.push(cur);
    cur.started = wrap.classList.contains('chat-started');
  }

  function go(c) {
    stash(cur);
    cur = c; restore(c);
    close(); render();
  }
  function switchTo(id) {
    var c = convs.filter(function (x) { return x.id === id; })[0];
    if (!c || c === cur || busy()) return;
    go(c);
  }
  /* scripted Agent messages (flows, hand-off notices) belong to the scene conversation — bring the user back to it */
  function home() {
    if (!journeyId || !cur || cur.id === journeyId) return;
    var c = convs.filter(function (x) { return x.id === journeyId; })[0];
    if (c) go(c);
  }
  var AVATAR = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2.2 3.05 13.4h2.05l.95-2.55h3.9l.95 2.55h2.05L8 2.2Zm-1.05 7.05h2.1L8 5.85l-1.05 3.4Z" fill="currentColor"/></svg>';
  function seedWelcome() {
    var scene = sceneName() || '当前场景';
    var tips = suggestions().slice(0, 3);
    var root = document.createElement('div');
    root.className = 'chat-msg-assistant cv-welcome';
    root.innerHTML =
      '<div class="ao-turn">' +
      '<div class="ao-turn-head"><span class="ao-turn-avatar" aria-hidden="true">' + AVATAR + '</span>' +
      '<div class="ao-turn-head-main"><div class="ao-turn-name">AgentOS</div></div></div>' +
      '<div class="ao-answer answer-body chat-prose">' +
      '<p>新对话已打开。我还带着「' + esc(scene) + '」的上下文，可以直接问蓝图进展、Mock 或上线相关的事。</p>' +
      (tips.length
        ? '<div class="cv-welcome-tips">' + tips.map(function (t) {
            return '<button type="button" class="cv-sg" data-cv-fill="' + esc(t) + '">' + esc(t) + '</button>';
          }).join('') + '</div>'
        : '') +
      '</div></div>';
    thread.appendChild(root);
    cur.preview = '新对话已打开';
    cur.started = true;
    cur.t = Date.now();
    skip();
    if (scrollEl) scrollEl.scrollTop = 0;
  }
  function openBlank() {
    thread.innerHTML = '';
    setStarted(true);
    setDraft('');
    seedWelcome();
  }
  function newConv() {
    if (busy()) return;
    /* already on an unused custom tab — stay put, keep composer at the bottom */
    if (cur && cur.custom && !cur.n) { close(); focus(); return; }
    stash(cur);
    cur = mk({ custom: true }); convs.push(cur);
    openBlank();
    close(); render(); focus();
  }
  function del(id) {
    var c = convs.filter(function (x) { return x.id === id; })[0];
    if (!c || (c === cur && busy())) return;
    confirmId = null;
    if (c === cur) {
      var rest = convs.filter(function (x) { return x !== c; }).sort(function (a, b) { return b.t - a.t; });
      thread.innerHTML = ''; skip();
      convs.splice(convs.indexOf(c), 1);
      if (rest[0]) { cur = rest[0]; restore(cur); }
      else { cur = mk({ custom: true }); convs.push(cur); openBlank(); }
    } else convs.splice(convs.indexOf(c), 1);
    if (c.id === journeyId) journeyId = '_gone';      // the scripted thread is gone — scripted turns do not move elsewhere
    render();
  }
  function focus() { if (input) setTimeout(function () { input.focus({ preventScroll: true }); }, 30); }

  /* the scene room opens → keep what was said so far as its own conversation, start a clean one for the journey */
  function fresh(o) {
    o = o || {};
    if (cur && (hasContent() || cur.n)) {
      if (cur.auto && o.archiveTitle) { cur.title = o.archiveTitle; cur.auto = false; }
      stash(cur);
      cur.started = true;
    } else if (cur) {
      convs.splice(convs.indexOf(cur), 1);          // never used → drop it
    }
    cur = mk({ title: o.title, custom: false }); convs.push(cur);
    if (o.journey) journeyId = cur.id;
    thread.innerHTML = '';
    skip(); render();
  }

  /* reuse the current tab in place (no new T1 tab): rename + clear thread */
  function resetCurrent(title) {
    init();
    if (!cur) cur = mk({ title: title || DEFAULT }); 
    else {
      cur.title = title || DEFAULT;
      cur.auto = false;
      cur.n = 0;
      cur.preview = '';
      cur.frag = null;
      cur.started = false;
      cur.draft = '';
    }
    if (journeyId == null) journeyId = cur.id;
    thread.innerHTML = '';
    skip();
    render();
  }

  /* learn titles / previews from what lands in the thread */
  var obs = new MutationObserver(function (list) {
    init();
    list.forEach(function (m) {
      [].forEach.call(m.addedNodes, function (n) {
        if (!n.classList) return;
        if (n.classList.contains('chat-msg-user')) {
          var bub = n.querySelector('.chat-bubble-user') || n, t = [].filter.call(bub.childNodes, function (x) { return x.nodeType === 3; }).map(function (x) { return x.nodeValue; }).join('').trim();
          if (!t && n.querySelector('.composer-ref, [class*="chip"]')) t = '已上传资料';
          cur.n++; cur.t = Date.now();
          if (t) { cur.preview = t; if (cur.auto) { cur.title = nameOf(t); cur.auto = false; } }
        } else if (n.classList.contains('chat-msg-assistant')) { cur.t = Date.now(); }
      });
    });
    render();
  });
  obs.observe(thread, { childList: true });
  function skip() { obs.takeRecords(); }   // moves done by this module are not new messages

  /* ───────── render ───────── */
  function render() {
    init();
    var b = busy();
    bar.hidden = !(convs.length > 1 || hasContent() || cur.n > 0 || wrap.classList.contains('chat-started'));
    tabsEl.innerHTML = convs.map(function (c) {
      var on = c === cur;
      return '<button type="button" class="cv-tab' + (on ? ' is-cur' : '') + '" role="tab" aria-selected="' + on + '" data-cv-id="' + c.id + '" title="' + esc(c.title) + '"' + (b && !on ? ' disabled' : '') + '>' +
        '<span class="cv-tab-t">' + esc(c.title) + '</span>' + (on && b ? '<i class="cv-run"></i>' : '') + '</button>';
    }).join('');
    var ct = tabsEl.querySelector('.is-cur'); if (ct && ct.scrollIntoView) ct.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    newBtn.disabled = b;
    newBtn.title = b ? 'Agent 正在回复，完成后可新建对话' : '新对话';
    renderSuggest();
    if (menuOpen) renderMenu();
  }
  function renderMenu() {
    var b = busy();
    var list = convs.slice().sort(function (a, c) { return (c === cur ? Date.now() : c.t) - (a === cur ? Date.now() : a.t); });
    menu.innerHTML =
      '<div class="cv-menu-head"><div class="cv-menu-t"><b>所有对话</b><span>' + esc(sceneName()) + ' · ' + convs.length + '</span></div>' +
      '<button type="button" class="cv-new-btn" data-cv-new' + (b ? ' disabled' : '') + '>' + I.plus + '新对话</button></div>' +
      '<ul class="cv-list">' + list.map(function (c) {
        var on = c === cur, m = on ? modeNow() : c.mode, asking = confirmId === c.id, lock = on && b;
        var prev = c.preview ? clip(c.preview, 40) : ((on ? hasContent() : c.has) ? 'Agent 已回复' : '还没有消息');
        return '<li class="cv-row' + (on ? ' is-cur' : '') + (asking ? ' is-ask' : '') + '">' +
          '<button type="button" class="cv-item" role="option" aria-selected="' + on + '" data-cv-id="' + c.id + '"' + (b && !on ? ' disabled' : '') + '>' +
          '<span class="cv-item-main"><span class="cv-item-t">' + esc(c.title) + '</span>' +
          '<span class="cv-item-m"><span class="cv-mode cv-mode--' + m + '">' + I[m === 'steps' ? 'steps' : 'fast'] + (m === 'steps' ? '一步步做扎实' : '先快速出一版') + '</span><span class="cv-item-p">' + esc(prev) + '</span></span></span>' +
          '<span class="cv-item-r">' + (on && b ? '<i class="cv-run"></i>' : '') + '<span class="cv-item-time">' + (on && b ? '回复中' : ago(on ? Date.now() : c.t)) + '</span></span></button>' +
          '<button type="button" class="cv-del' + (asking ? ' is-ask' : '') + '" data-cv-del="' + c.id + '"' + (lock ? ' disabled title="Agent 正在回复，暂不能删除"' : ' title="删除对话"') + '>' + (asking ? '确认删除' : I.trash) + '</button></li>';
      }).join('') + '</ul>' +
      (b ? '<div class="cv-menu-foot">Agent 正在回复，完成后可切换对话</div>' : '');
  }
  function place() {
    var col = document.querySelector('.main-column'); if (!col) return;
    var cr = col.getBoundingClientRect();
    menu.style.width = Math.min(360, cr.width - 16) + 'px'; menu.style.left = '0px';
    var r = menu.getBoundingClientRect(), dx = 0;
    if (r.right > cr.right - 8) dx = cr.right - 8 - r.right;
    if (r.left + dx < cr.left + 8) dx = cr.left + 8 - r.left;
    menu.style.left = dx + 'px';
  }
  function open() { menuOpen = true; confirmId = null; menu.hidden = false; allBtn.setAttribute('aria-expanded', 'true'); bar.classList.add('is-open'); renderMenu(); place(); }
  function close() { menuOpen = false; confirmId = null; menu.hidden = true; allBtn.setAttribute('aria-expanded', 'false'); bar.classList.remove('is-open'); }

  allBtn.addEventListener('click', function (e) { e.stopPropagation(); menuOpen ? close() : open(); });
  menu.addEventListener('click', function (e) {
    e.stopPropagation();
    var d = e.target.closest('[data-cv-del]');
    if (d) {
      if (d.disabled) return;
      var id = d.getAttribute('data-cv-del');
      if (confirmId === id) del(id); else { confirmId = id; renderMenu(); }
      return;
    }
    if (confirmId) { confirmId = null; renderMenu(); }
    var it = e.target.closest('[data-cv-id]'); if (it && !it.disabled) return switchTo(it.getAttribute('data-cv-id'));
    if (e.target.closest('[data-cv-new]')) newConv();
  });
  tabsEl.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cv-id]'); if (t && !t.disabled) switchTo(t.getAttribute('data-cv-id'));
  });
  newBtn.addEventListener('click', newConv);
  document.addEventListener('click', function () { if (menuOpen) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { close(); allBtn.focus(); } });
  var lastBusy = null;
  setInterval(function () { init(); var b = busy(); if (b !== lastBusy) { lastBusy = b; render(); } }, 400);

  /* ───────── prompt chips for a new custom conversation (shown in the welcome turn) ───────── */
  function suggestions() {
    var SB = window.FastSandbox, st = SB && SB.state;
    if (st && st.generated) {
      if (st.phase === 'production') return ['总结一下 v1.0 的变化', '这个 Agent 有哪些已知限制？'];
      if (st.phase === 'hardening') return ['现在还有哪些 Mock？', '蓝图现在进展到哪了？'];
      return ['这个 Agent 接下来该改哪里？', '现在还有哪些 Mock？', '蓝图现在进展到哪了？'];
    }
    return ['蓝图现在进展到哪了？', '我想继续梳理寻源策略', '现在还缺哪些资料？'];
  }
  function renderSuggest() {
    /* hero-centered suggestions retired — new tabs stay in chat layout with a welcome turn */
    if (heroStack) {
      var old = heroStack.querySelector('.cv-suggest');
      if (old) old.remove();
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cv-fill]');
    if (b && window.FastChat && window.FastChat.fill) { window.FastChat.fill(b.getAttribute('data-cv-fill')); focus(); }
  });
  document.addEventListener('fastsandbox', render);

  /* ───────── Agent turn for a user-created conversation (short thinking + streamed answer) ───────── */
  var SPACE = {
    sandbox: '这个 Agent 接下来该改哪里？',
    hardening: '现在还有哪些 Mock？',
    production: '总结一下 v1.0 的变化',
    none: '蓝图现在进展到哪了？',
  };
  function stateKey() { var st = window.FastSandbox && window.FastSandbox.state; return st && st.generated ? st.phase : 'none'; }
  function prompt() { return cur && cur.custom ? SPACE[stateKey()] : null; }

  function mocksMd(st) {
    var rows = [['本体（Ontology）', st.mocks.onto], ['Skill 规则', st.mocks.skill], ['ERP 连接', st.mocks.erp]];
    return '| 项目 | 状态 |\n|---|---|\n' + rows.map(function (r) { return '| ' + r[0] + ' | ' + (r[1] === 'verified' ? '已换成真实实现' : '**Mock** · 占位数据') + ' |'; }).join('\n');
  }
  function plan(text) {
    if (!cur || !cur.custom) return null;
    /* a page can answer for itself (superagent.html: workspace is mid-build) */
    var ov = window.FastConversations && window.FastConversations.reply ? window.FastConversations.reply(text) : null;
    if (ov) return { process: ov.process, segments: ov.segments || [{ md: ov.md, gap: 340 }], after: ov.after };
    var SB = window.FastSandbox, st = SB && SB.state, gen = !!(st && st.generated), scene = sceneName();
    var kind = /mock|占位/i.test(text) ? 'mock' : /进展|蓝图|到哪|缺哪|缺什么|资料/.test(text) ? 'progress' : /总结|变化|限制/.test(text) ? 'sum' : 'gen';
    var md;
    if (!gen) {
      md = kind === 'mock'
        ? '现在还没有生成 Agent，所以暂时没有 Mock。\n\n先快速出一版时，会先用 **Mock** 占位三样东西：本体、Skill 规则、ERP 连接；之后你可以在 **Sandbox** 里逐项换成真实实现。'
        : '**' + scene + '** 目前还在「理需求 → 备资料」阶段，Agent 还没有生成。\n\n' +
          '- 需求：条件、触发场景和评估优先级已经理清\n- 资料：合同、准入标准、流程说明可以在 Files 里查看\n- 下一步：选定「先快速出一版」或「一步步做扎实」之后，我会据此起草方案并生成第一版 Agent\n\n想继续推进的话，回到上一个对话里选择打造方式就可以。';
    } else if (kind === 'mock') {
      md = '当前是 **' + SB.envLabel() + '**，还有 **' + SB.mocksLeft() + ' 项** Mock 没有替换：\n\n' + mocksMd(st) + '\n\n建议先换 ERP 连接，它决定了报价数据是不是真实的，其余两项可以并行补。';
    } else if (kind === 'progress') {
      md = '**' + scene + '** 的 Agent 现在是 **' + SB.envLabel() + '**，可以在右侧 Agent 面板试用。\n\n' + mocksMd(st) + '\n\n还有 **' + SB.mocksLeft() + ' 项** Mock 没换，建议先换 ERP 连接。哪里不够用，直接告诉我。';
    } else if (kind === 'sum') {
      md = '**' + scene + '** 的 Agent 目前是 **' + SB.envLabel() + '**。\n\n- Mock 替换：' + (3 - SB.mocksLeft()) + ' / 3' + '\n- 权限：' + (st.access ? '已配置' : '待配置') + '\n- 负责人签字：' + (st.signoff ? '已签字' : '待签字');
    } else {
      md = '我先按 **' + scene + '** 现在的状态回答：Agent 是 **' + SB.envLabel() + '**，还有 **' + SB.mocksLeft() + ' 项** Mock 没换。\n\n你可以直接告诉我想做什么，比如：\n\n- 看看现在还有哪些 Mock\n- 逐项替换 Mock\n- 到右侧 Agent 面板试用一下';
    }
    return {
      process: async function (api) {
        await api.sleep(350);
        await api.W('先看一下「' + scene + '」现在的状态，再回答你。');
        await api.sleep(300);
        await api.V({ id: 'cv-ctx', icon: 'context', label: '已读取场景状态 · ' + scene, details: gen ? ['Agent：' + SB.envLabel(), 'Mock 剩余：' + SB.mocksLeft() + ' 项'] : ['Agent：尚未生成', '需求与资料已就绪', '等待选择打造方式'] });
        await api.sleep(320);
      },
      segments: [{ md: md, gap: 340 }],
    };
  }

  /* superagent.html (returning user): drop in conversations that already exist.
     list: [{ key, title, mode, ago(ms), preview, nodes:[…], custom }] — active = index to show first. */
  function seed(list, active) {
    init();
    if (!hasContent() && !cur.n) convs.splice(convs.indexOf(cur), 1); else stash(cur);
    var made = list.map(function (o) {
      var c = mk({ title: o.title });
      c.auto = false; c.custom = o.custom !== false; c.key = o.key; c.mode = o.mode || 'fast';
      c.t = Date.now() - (o.ago || 0); c.n = o.n == null ? 1 : o.n; c.preview = o.preview || '';
      c.started = true; c.has = !!(o.nodes && o.nodes.length); c.bottom = false; c.scroll = 0;
      c.frag = document.createDocumentFragment();
      (o.nodes || []).forEach(function (n) { c.frag.appendChild(n); });
      convs.push(c);
      return c;
    });
    cur = made[active || 0];
    restore(cur); close(); render();
    return made.map(function (c) { return c.id; });
  }
  function openKey(key) {
    var c = convs.filter(function (x) { return x.key === key; })[0];
    if (c) switchTo(c.id);
  }

  window.FastConversations = {
    seed: seed,
    open: openKey,
    fresh: fresh,
    resetCurrent: resetCurrent,
    home: home,
    rename: function (t) { init(); cur.title = t; cur.auto = false; render(); },
    isJourney: function () { init(); return !journeyId || cur.id === journeyId; },
    /* true on the first conversation before any scene room exists (the "no scene yet" entry path) */
    isPre: function () { init(); return !journeyId && !cur.custom; },
    prompt: prompt,
    plan: plan,
    list: function () { return convs.slice(); },
  };
  init(); render();
})();
