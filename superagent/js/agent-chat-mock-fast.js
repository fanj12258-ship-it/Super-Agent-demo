/**
 * Workshop Agent-turn mock
 *  - Space in empty composer → autofill sales-allocation prompt
 *  - Send → CUI deep-thinking process (ported 1:1 from agentos-cui-demo.vercel.app)
 *      status carousel · reasoning lines · deep thought · tool summaries ·
 *      command progress (code) · sub-agents · skills · file edits
 *  - then body mock: prose / table / list / code / cites / file cards /
 *      file-changes / four-steps / footer
 * Icons: js/cui-icons.js · Avatar: ink circle + A monogram (no robot / no orb)
 */
(function () {
  'use strict';

  /* Fast-POC journey: own body script. Edit freely; shell/DS stay shared. */
  var FAST_PART1 = [
    { md: '明白了，你想做一个**销售分货 Agent**：读库存 / 门店销量 / 规则，自动给出分货方案，并解释为什么这么分。\n\n这类场景有两种开始方式，我建议 **先快速出一版**：' },
  ];
  /* body after the choice: default segments minus the intro paragraph */
  var FAST_SEGMENTS = window.AgentBody.defaultSegments.slice(1);

  var SPACE_PROMPT = '我要制作一个销售分货的 Agent';

  /* Demo pacing — deep thinking compressed to ~5s; body keeps a readable pace. */
  var THINK_SPEED = 0.05;
  var BODY_SPEED = 0.55;
  var SPEED = THINK_SPEED; /* process-phase waits / streamChars use this */
  var PACE = 1.4 * THINK_SPEED;

  var ICON = window.CUI_ICONS || {};

  /** AgentOS avatar — a friendly little robot head: pale shell, deep-blue visor, glowing eyes (one winks), blinks now and then */
  var AV_N = 0;
  function avatarMarkHtml() {
    var id = 'aoav' + (++AV_N);
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var blink = still ? '' : '<animate attributeName="ry" values="1.85;1.85;.2;1.85;1.85" keyTimes="0;.9;.94;.98;1" dur="5s" repeatCount="indefinite"/>';
    var blinkG = still ? '' : '<animate attributeName="ry" values="2.6;2.6;.5;2.6;2.6" keyTimes="0;.9;.94;.98;1" dur="5s" repeatCount="indefinite"/>';
    return (
      '<svg width="100%" height="100%" viewBox="0 0 28 28" fill="none" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="' + id + 'b" x1="4" y1="2" x2="24" y2="28" gradientUnits="userSpaceOnUse"><stop stop-color="#f4f5ff"/><stop offset="1" stop-color="#d9defa"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="8" y1="7" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#cfd8fb"/></linearGradient>' +
      '<linearGradient id="' + id + 'v" x1="8" y1="9" x2="20" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#2a45d8"/><stop offset="1" stop-color="#0e1c80"/></linearGradient>' +
      '<filter id="' + id + 'g" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation=".7"/></filter>' +
      '</defs>' +
      '<circle cx="14" cy="14" r="14" fill="url(#' + id + 'b)"/>' +
      '<path d="M11 7V4.6" stroke="#aab6ee" stroke-width=".9" stroke-linecap="round"/><circle cx="11" cy="4" r="1" fill="#3a5af0"/>' +
      '<rect x="2.9" y="12" width="3.4" height="6.6" rx="1.7" fill="#2a47d6"/><rect x="21.7" y="12" width="3.4" height="6.6" rx="1.7" fill="#2a47d6"/>' +
      '<rect x="5" y="7" width="18" height="14.6" rx="6.4" fill="url(#' + id + 's)"/>' +
      '<rect x="7.1" y="9.2" width="13.8" height="10.2" rx="4.2" fill="url(#' + id + 'v)"/>' +
      '<path d="M9.4 10.6c1.6-.7 5.4-.9 9.2-.1" stroke="#fff" stroke-opacity=".28" stroke-width=".8" stroke-linecap="round"/>' +
      '<g filter="url(#' + id + 'g)" opacity=".9"><ellipse cx="11.1" cy="13.6" rx="1.9" ry="2.6" fill="#2de2ff">' + blinkG + '</ellipse>' +
      '<path d="M18.5 12.3 16.1 13.7 18.5 15.1" stroke="#2de2ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<ellipse cx="11.1" cy="13.6" rx="1.35" ry="1.85" fill="#fff">' + blink + '</ellipse>' +
      '<path d="M18.5 12.3 16.1 13.7 18.5 15.1" stroke="#a9f6ff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M11.9 16.9Q14.2 18.8 16.5 16.9" stroke="#b9f7ff" stroke-width=".95" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  var THINKING_STATUS_LABELS = [
    '思考中…', '斟酌中…', '沉思中…', '推演中…', '仔细推敲中…',
    '构思中…', '理清思路中…', '细致考量中…', '深入思考中…', '进一步思考中…',
  ];

  var CODE_LINES = [
    'type AllocationRow = { sku: string; store: string; stock: number; sales30d: number };',
    '',
    'async function generateAllocationPlan() {',
    '  const context = await project.getContext();',
    '  const schema = await files.read("allocation.schema.ts");',
    '',
    '  const rows: AllocationRow[] = await database.query({',
    '    table: "store_sku_sales",',
    '    period: "last_30_days",',
    '  });',
    '',
    '  const plan = rows.map((row) => ({',
    '    sku: row.sku,',
    '    store: row.store,',
    '    score: row.sales30d / Math.max(row.stock, 1),',
    '  }));',
    '',
    '  const report = await renderPlan({ context, schema, plan });',
    '  await files.write("allocation_plan.xlsx", report);',
    '  return { status: "completed", count: plan.length };',
    '}',
  ];

  var DEEP_1 =
    '确认任务目标与输出格式，先把用户的自然语言请求拆解成可执行的分货步骤，再整理项目上下文、已完成的工具调用、可用文件和当前工作区状态。接下来需要判断哪些信息可以直接复用，哪些信息必须重新检索，哪些结论需要通过库存与销量数据交叉验证，同时保留每个决策背后的依据，避免在后续生成方案时重复读取相同文件。分货函数已经准备好，因此下一步会围绕门店销量、库存压力、分货规则和异常判断建立一条连续的证据链；知识库负责提供分货口径和参考文档，数据库负责返回近期销售与库存记录，本体查询负责确认门店、SKU 与库存实体之间的关系。生成过程中还要持续记录工具调用的结果、返回行数、字段校验状态以及文件引用，确保最终输出既能解释结论，也能回溯到实际数据来源。为了让披露过程保持连贯，这些判断会作为一整段连续内容逐步追加到固定高度的思考区域中，而不是拆成多条零散的状态消息。';

  var DEEP_2 =
    '比较检索结果与数据源返回值时，需要先确认不同来源是否使用了同一时间范围、同一门店标识和同一库存口径，再判断异常值是数据缺失、字段类型不一致，还是确实反映了门店真实的销售状态。知识库中的参考文档可以帮助确定分货规则，数据库返回的销售记录可以验证实际分布，本体关系则用于避免把门店、SKU 和库存实体错误地关联起来。完成核对后，保留任务目标、关键决策、有效引用和后续交付线索，压缩已经失去作用的中间过程，把有限上下文留给方案生成、文件编辑和结果校验。随后还要检查分货建议表中的数量、保底量、封顶量、导出入口以及附件名称是否与分析结果一致，并确认每个交付文件都能被用户找到。为了演示真实的连续生成效果，这段思考会保持为一个较长的自然段，在固定高度的披露区域内持续追加，内容超出可视范围后只滚动内部区域，页面其他位置保持稳定，直到这一阶段完成后再柔和地折叠成一行摘要。';

  /* ───────────────────────── DOM refs ───────────────────────── */

  var input = document.getElementById('composer-input');
  var sendBtn = document.getElementById('composer-send');
  var wrap = document.querySelector('.wrap');
  var page = document.querySelector('.page');
  var thread = document.getElementById('chat-thread');
  var scrollEl = document.getElementById('chat-main-scroll');
  if (!input || !sendBtn || !wrap || !thread) return;

  var busy = false;
  var spaceArmed = true;
  var pendingExternalInput = null;

  /* textarea auto-grow: wraps long text and grows up to a cap */
  function autosize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 168) + 'px';
  }

  /* ───────────────────────── helpers ───────────────────────── */

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }
  function wait(nominalMs) {
    return sleep(Math.max(0, nominalMs * PACE));
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function img(src, cls, w, h) {
    var i = document.createElement('img');
    i.src = src || '';
    i.alt = '';
    if (cls) i.className = cls;
    if (w) i.width = w;
    if (h) i.height = h;
    return i;
  }
  function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setOpen(collapseEl, btn, open) {
    collapseEl.classList.toggle('is-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function makeCollapse(extraCls) {
    var c = el('div', 'collapse' + (extraCls ? ' ' + extraCls : ''));
    var clip = el('div', 'collapse-clip');
    var content = el('div', 'collapse-content');
    clip.appendChild(content);
    c.appendChild(clip);
    return { root: c, content: content };
  }
  function activityRow(cls, iconSrc, label, withChevron) {
    var b = el('button', 'activity-row' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    if (iconSrc !== null) b.appendChild(img(iconSrc, '', 16, 16));
    var span = el('span');
    span.textContent = label || '';
    b.appendChild(span);
    if (withChevron) b.appendChild(img(ICON.chevron, 'activity-hover-chevron', 16, 16));
    return { btn: b, icon: b.querySelector('img'), label: span };
  }
  function formatDuration(ms) {
    var secs = Math.max(1, Math.round(ms / 1000));
    if (secs < 60) return '用时 ' + secs + '秒';
    var m = Math.floor(secs / 60), s = secs % 60;
    return s ? '用时 ' + m + '分钟 ' + s + '秒' : '用时 ' + m + '分钟';
  }
  function formatSeconds(ms) { return (ms / 1000).toFixed(1) + 's'; }

  /* Stream text char by char with the demo's .stream-char fade */
  async function streamChars(container, text, opts) {
    opts = opts || { character: 40, punctuation: 180 };
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      var s = el('span', 'stream-char');
      s.textContent = chars[i];
      container.appendChild(s);
      if (opts.onTick) opts.onTick();
      var d = /[，。；：、！？\n]/.test(chars[i]) ? opts.punctuation : opts.character;
      await sleep(d * SPEED);
    }
  }

  function renderFooter() {
    var foot = el('div', 'ao-turn-foot');
    var time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    /* Proper stroke icons · grouped: feedback | regenerate/share | more */
    var groups = [
      [
        ['复制', 'M9 9h10v10H9z', 'M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1'],
        ['有帮助', 'M7 10v11', 'M15.5 10h2.1a2 2 0 0 1 1.95 2.45l-1.4 6A2 2 0 0 1 16.2 21H9a2 2 0 0 1-2-2v-7.2a2 2 0 0 1 .55-1.35L12.4 5a1.6 1.6 0 0 1 2.35.25 1.6 1.6 0 0 1-.25 2.25L13 9.5h2.5z'],
        ['没帮助', 'M17 14V3', 'M8.5 14H6.4a2 2 0 0 1-1.95-2.45l1.4-6A2 2 0 0 1 7.8 3H15a2 2 0 0 1 2 2v7.2a2 2 0 0 1-.55 1.35L11.6 19a1.6 1.6 0 0 1-2.35-.25 1.6 1.6 0 0 1 .25-2.25L11 14.5H8.5z'],
      ],
      [
        ['重新生成', 'M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5'],
        ['分享', 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7', 'M16 6l-4-4-4 4', 'M12 2v13'],
      ],
      [
        ['更多', 'M6 12h.01', 'M12 12h.01', 'M18 12h.01'],
      ],
    ];
    function btn(item) {
      var paths = item.slice(1).map(function (d) {
        return '<path d="' + d + '"/>';
      }).join('');
      return (
        '<button type="button" class="ao-icon-btn" title="' + item[0] + '" aria-label="' + item[0] + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        paths + '</svg></button>'
      );
    }
    var actionsHtml = groups.map(function (g, i) {
      return (i ? '<span class="ao-turn-actions-sep" aria-hidden="true"></span>' : '') + g.map(btn).join('');
    }).join('');
    foot.innerHTML =
      '<div class="ao-turn-actions">' + actionsHtml + '</div>' +
      '<div class="ao-turn-foot-meta">' +
      '<span>共消耗 0.5</span><span class="ao-turn-foot-dot" aria-hidden="true"></span>' +
      '<span>AgentOS</span><span class="ao-turn-foot-dot" aria-hidden="true"></span>' +
      '<span>' + time + '</span></div>';
    return foot;
  }

  /* ───────────────────────── chat plumbing ───────────────────────── */

  /* Stick the main chat to the bottom while the Agent is writing.
     User scrolls / wheels up → unstick until they return near the bottom. */
  var stickBottom = true;
  function scrollThreadToBottom() {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }
  function scrollThreadIfStick() {
    if (stickBottom) scrollThreadToBottom();
  }
  if (scrollEl) {
    scrollEl.addEventListener('wheel', function (e) { if (e.deltaY < 0) stickBottom = false; });
    scrollEl.addEventListener('touchstart', function () { stickBottom = false; });
    scrollEl.addEventListener('scroll', function () {
      if (scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 48) stickBottom = true;
    });
  }
  function enterChatMode() {
    wrap.classList.add('chat-started');
    if (page) page.classList.add('chat-started');
  }
  function appendUserBubble(text, files) {
    var row = el('div', 'chat-msg-user', '<div class="chat-bubble-user"></div>');
    var bub = row.querySelector('.chat-bubble-user');
    if (files && files.length && window.FastUpload) bub.appendChild(window.FastUpload.chips(files));
    if (text) bub.appendChild(document.createTextNode(text));
    thread.appendChild(row);
    return row;
  }

  /* ───────────────────────── assistant turn ───────────────────────── */

  async function runAssistantTurn(userText, userRow, plan) {
    /* plan (optional): { process(api), segments } — lets Fast flows reuse the same
       deep-thinking shell with their own short script. Without it: the full demo. */
    SPEED = THINK_SPEED;
    var afterRes = null;
    var startedAt = Date.now();

    /* shell */
    var root = el('div', 'chat-msg-assistant');
    var turn = el('div', 'ao-turn');
    var head = el('div', 'ao-turn-head');
    var avatar = el('span', 'ao-turn-avatar');
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML = avatarMarkHtml();
    var headMain = el('div', 'ao-turn-head-main', '<div class="ao-turn-name">AgentOS</div>');
    head.appendChild(avatar); head.appendChild(headMain);

    var process = el('div', 'ao-process');
    var statusRow = el('div', 'status-row');
    var statusBtn = el('button', 'ghost-btn muted small');
    statusBtn.type = 'button';
    statusBtn.setAttribute('aria-expanded', 'true');
    var statusText = el('span', 'thinking-copy');
    statusText.textContent = THINKING_STATUS_LABELS[0];
    var statusChevron = el('span', 'status-chevron');
    statusChevron.appendChild(img(ICON.statusChevron, '', 16, 16));
    statusBtn.appendChild(statusText); statusBtn.appendChild(statusChevron);
    statusRow.appendChild(statusBtn);

    var processCol = makeCollapse('process-collapse');
    processCol.root.classList.add('is-open');
    var viewport = el('div', 'process-viewport is-generating' + (plan && plan.dynamicProcess ? ' is-dynamic' : ''));
    var items = el('div', 'process-items');
    viewport.appendChild(items);
    processCol.content.appendChild(viewport);
    process.appendChild(statusRow); process.appendChild(processCol.root);

    var answerEl = el('div', 'ao-answer answer-body chat-prose');
    answerEl.hidden = true;

    turn.appendChild(head); turn.appendChild(process); turn.appendChild(answerEl);
    root.appendChild(turn);
    thread.appendChild(root);

    var processOpen = true;
    statusBtn.addEventListener('click', function () {
      processOpen = !processOpen;
      setOpen(processCol.root, statusBtn, processOpen);
      statusChevron.classList.toggle('closed', !processOpen);
    });

    /* Follow the turn as thinking / answer grows. (Older demo pinned the user
       bubble to the top, so long process blocks grew off-screen.) */
    stickBottom = true;
    scrollThreadToBottom();
    var turnResize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scrollThreadIfStick) : null;
    if (turnResize) turnResize.observe(root);

    /* viewport smooth follow (ported) — process panel’s own inner scroll */
    var stick = true;
    viewport.addEventListener('wheel', function (e) { if (e.deltaY < 0) stick = false; });
    viewport.addEventListener('touchstart', function () { stick = false; });
    viewport.addEventListener('scroll', function () {
      if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 2) stick = true;
    });
    (function follow() {
      var raf = 0, last = 0;
      function step(t) {
        raf = 0;
        if (!stick) return;
        var max = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        var diff = max - viewport.scrollTop;
        if (Math.abs(diff) < 0.5) { viewport.scrollTop = max; return; }
        var dt = last ? Math.min(t - last, 64) : 16;
        last = t;
        viewport.scrollTop += diff * (1 - Math.exp(-dt / 140));
        raf = requestAnimationFrame(step);
      }
      new ResizeObserver(function () {
        if (stick && !raf) { last = 0; raf = requestAnimationFrame(step); }
      }).observe(items);
    })();

    /* status label carousel */
    var statusIdx = 0;
    /* Faster carousel so ~5s think still shows a few labels */
    var statusTimer = setInterval(function () {
      statusIdx = (statusIdx + 1) % THINKING_STATUS_LABELS.length;
      statusText.textContent = THINKING_STATUS_LABELS[statusIdx];
    }, plan && plan.fastThinking ? 480 : 900);

    /* ───── process item builders ───── */

    var lastItem = null;     // 'group' | other
    var activeGroup = null;  // x2

    function addReason(text) {
      var d = el('div', 'answer stream-enter');
      items.appendChild(d);
      lastItem = { kind: 'reason' };
      return streamChars(d, text, { character: 40, punctuation: 180 });
    }

    function closeActive() {
      if (activeGroup) {
        activeGroup.S = false;
        var g = activeGroup;
        activeGroup = null;
        syncGroup(g);
      }
    }

    /* deep thought */
    async function runDeep(text) {
      var block = el('div', 'activity-block stream-enter');
      var row = activityRow('deep-thought-row', ICON.deepThought, '深度思考', true);
      row.label.className = 'thinking-copy';
      var col = makeCollapse();
      var details = el('div', 'activity-details deep-thought-details');
      var copy = el('div', 'deep-thought-copy');
      details.appendChild(copy);
      col.content.appendChild(details);
      block.appendChild(row.btn); block.appendChild(col.root);
      items.appendChild(block);
      lastItem = { kind: 'deep' };
      var open = true;
      setOpen(col.root, row.btn, true);
      row.btn.addEventListener('click', function () { open = !open; setOpen(col.root, row.btn, open); });

      await streamChars(copy, text, {
        character: 22, punctuation: 100,
        onTick: function () { details.scrollTop = details.scrollHeight; },
      });
      row.label.className = '';
      await wait(350);
      open = false;
      setOpen(col.root, row.btn, false);
    }

    /* tool summary groups */
    function buildCodeProgress() {
      var box = el('div', 'command-progress');
      var header = el('div', 'command-progress-header');
      var left = el('button', 'ghost-btn small');
      left.type = 'button';
      left.appendChild(document.createTextNode('TypeScript '));
      left.appendChild(img(ICON.statusChevron, '', 16, 16));
      var actions = el('div', 'command-progress-actions');
      ['Wrap', 'Copy'].forEach(function (t) {
        var b = el('button', 'ghost-btn small'); b.type = 'button'; b.textContent = t; actions.appendChild(b);
      });
      header.appendChild(left); header.appendChild(actions);
      var log = el('div', 'command-progress-log');
      log.tabIndex = 0;
      log.setAttribute('aria-label', '命令生成进度');
      box.appendChild(header); box.appendChild(el('div', 'code-split')); box.appendChild(log);
      return { root: box, log: log };
    }
    function highlight(line) {
      return line.split(/(\b(?:async|function|const|await|return|type|number|string)\b|"[^"\n]*")/g).map(function (p) {
        if (/^"/.test(p)) return '<span class="tok-str">' + escapeHtml(p) + '</span>';
        if (/^(async|function|const|await|return|type|number|string)$/.test(p)) return '<span class="tok-kw">' + escapeHtml(p) + '</span>';
        return '<span>' + escapeHtml(p) + '</span>';
      }).join('');
    }

    function newGroup(id) {
      var g = { id: id, kind: 'group', S: undefined, children: [], isCode: false };
      g.el = el('div', 'activity-block stream-enter');
      g.row = activityRow('', null, '', true);
      g.row.icon = img('', '', 16, 16);
      g.row.btn.insertBefore(g.row.icon, g.row.label);
      g.col = makeCollapse();
      g.composite = el('div', 'activity-composite tool-summary-items');
      g.col.content.appendChild(g.composite);
      g.el.appendChild(g.row.btn); g.el.appendChild(g.col.root);
      g.row.btn.addEventListener('click', function () {
        g.S = !isGroupOpen(g);
        syncGroup(g);
      });
      items.appendChild(g.el);
      return g;
    }
    function isGroupOpen(g) { return activeGroup === g || !!g.S; }

    function addChildEl(g, tool) {
      var c = { id: tool.id, icon: tool.icon, label: tool.label, running: !!tool.running, details: tool.details || [], code: !!tool.code, S: undefined, shown: 0 };
      c.el = el('div');
      c.nested = activityRow('nested', ICON[c.icon], c.label, true);
      c.col = makeCollapse();
      if (c.code) {
        c.progress = buildCodeProgress();
        c.col.content.appendChild(c.progress.root);
      } else {
        c.detailsEl = el('div', 'activity-details');
        c.col.content.appendChild(c.detailsEl);
      }
      c.el.appendChild(c.nested.btn); c.el.appendChild(c.col.root);
      c.nested.btn.addEventListener('click', function () {
        c.S = !isChildOpen(g, c);
        syncGroup(g);
      });
      g.children.push(c);
      g.composite.appendChild(c.el);
      return c;
    }
    function isChildOpen(g, c) {
      if (c.running) return true;
      if (c.S !== undefined) return c.S;
      return g.children.length === 1 && activeGroup !== g && isGroupOpen(g);
    }
    function syncGroup(g) {
      var open = isGroupOpen(g);
      setOpen(g.col.root, g.row.btn, open);
      var first = g.children[0];
      if (first) g.row.icon.src = ICON[first.icon] || '';
      g.row.label.textContent = g.children.map(function (c) { return c.label; }).join('、');
      g.row.label.className = g.children.some(function (c) { return c.running; }) ? 'thinking-copy' : '';
      g.composite.classList.toggle('code-tool-batch', g.isCode);
      g.children.forEach(function (c) {
        c.nested.btn.style.display = g.children.length > 1 ? '' : 'none';
        c.nested.label.textContent = c.label;
        c.nested.label.className = c.running ? 'thinking-copy' : '';
        c.nested.icon.src = ICON[c.icon] || '';
        var cOpen = isChildOpen(g, c);
        setOpen(c.col.root, c.nested.btn, cOpen);
        if (c.code) {
          while (c.shown < c.details.length) {
            var line = el('div', 'command-log-line');
            line.innerHTML = '<span class="command-log-number">' + (c.shown + 1) + '</span><span>' + highlight(c.details[c.shown]) + '</span>';
            c.progress.log.appendChild(line);
            c.shown += 1;
            c.progress.log.scrollTop = c.progress.log.scrollHeight;
          }
        } else {
          while (c.shown < c.details.length) {
            var d = el('div', 'activity-row detail');
            d.appendChild(img(ICON[detailIcon(c, c.details[c.shown])], '', 16, 16));
            var sp = el('span'); sp.textContent = c.details[c.shown]; d.appendChild(sp);
            c.detailsEl.appendChild(d);
            c.shown += 1;
          }
        }
      });
    }
    function detailIcon(c) { return c.icon; }

    function addTool(tool) {
      var g;
      if (lastItem && lastItem.kind === 'group') {
        g = lastItem.group;
      } else {
        g = newGroup(tool.id);
        lastItem = { kind: 'group', group: g };
        if (tool.code) g.isCode = true;
      }
      if (!activeGroup) activeGroup = g;
      var c = addChildEl(g, tool);
      syncGroup(g);
      return { g: g, c: c };
    }
    function updateTool(ref, patch) {
      Object.keys(patch).forEach(function (k) { ref.c[k] = patch[k]; });
      syncGroup(ref.g);
    }

    async function V(tool) {
      var active = tool.label
        .replace(/^已调用/, '正在调用').replace(/^已搜索/, '正在搜索')
        .replace(/^已使用/, '正在使用').replace(/^已编辑/, '正在编辑')
        .replace(/^已阅读/, '正在阅读').replace(/^已提取/, '正在提取')
        .replace(/^已起草/, '正在起草').replace(/^已生成/, '正在生成')
        .replace(/^已评估/, '正在评估').replace(/^已自测/, '正在自测')
        .replace(/^已建立/, '正在建立').replace(/^已识别/, '正在识别')
        .replace(/^已确定/, '正在确定').replace(/^已分析/, '正在分析')
        .replace(/^已拆分/, '正在拆分').replace(/^已规划/, '正在规划')
        .replace(/^已检查/, '正在检查');
      var ref = addTool({ id: tool.id, icon: tool.icon, label: active, details: [], running: true });
      /* tool.during (Fast flows): run work while the row shows "running" — e.g. files appearing one by one */
      if (tool.during) await tool.during(); else await wait(1600);
      updateTool(ref, { label: tool.label, details: tool.details, running: false });
    }

    async function W(text) {  // reasoning line
      if (activeGroup) { closeActive(); await sleep(320 * SPEED); }
      await addReason(text);
    }

    /* sub-agents */
    function runSubagentsSetup() {
      var agents = [
        { id: 'sa1', name: '子 Agent 1', task: '检索知识库', status: 'running', elapsed: 0, details: [], shown: 0, S: undefined },
        { id: 'sa2', name: '子 Agent 2', task: '核对数据源', status: 'queued', elapsed: 0, details: [], shown: 0, S: undefined },
        { id: 'sa3', name: '子 Agent 3', task: '查询本体', status: 'queued', elapsed: 0, details: [], shown: 0, S: undefined },
        { id: 'sa4', name: '子 Agent 4', task: '检查分货规则', status: 'queued', elapsed: 0, details: [], shown: 0, S: undefined },
      ];
      var block = el('div', 'activity-block stream-enter');
      var row = activityRow('', ICON.subagent, '', true);
      var col = makeCollapse();
      var list = el('div', 'activity-composite subagent-list');
      col.content.appendChild(list);
      block.appendChild(row.btn); block.appendChild(col.root);
      items.appendChild(block);
      lastItem = { kind: 'subagents' };
      var S = { subs: true };
      var done = false;

      agents.forEach(function (a) {
        a.item = el('div', 'subagent-item');
        a.toggle = el('button', 'activity-row nested subagent-toggle');
        a.toggle.type = 'button';
        a.toggle.setAttribute('aria-expanded', 'false');
        a.tLabel = el('span');
        a.chev = el('span', 'status-chevron');
        a.chev.appendChild(img(ICON.statusChevron, '', 16, 16));
        a.toggle.appendChild(a.tLabel); a.toggle.appendChild(a.chev);
        a.col = makeCollapse('subagent-details-collapse');
        a.item.appendChild(a.toggle); a.item.appendChild(a.col.root);
        list.appendChild(a.item);
        a.toggle.addEventListener('click', function () {
          a.S = !isAgentOpen(a);
          sync();
        });
      });
      row.btn.addEventListener('click', function () { S.subs = !isSubsOpen(); sync(); });

      function isSubsOpen() { return S.subs !== undefined ? S.subs : !done; }
      function isAgentOpen(a) { return a.S !== undefined ? a.S : a.status === 'running'; }
      function summary() {
        var c = agents.filter(function (a) { return a.status === 'completed'; }).length;
        var r = agents.filter(function (a) { return a.status === 'running'; }).length;
        var q = agents.filter(function (a) { return a.status === 'queued'; }).length;
        return agents.length + ' 个子 Agent · ' + c + ' 个已完成 · ' + r + ' 个运行中 · ' + q + ' 个排队';
      }
      function agentLabel(a) {
        if (a.status === 'queued') return a.name + ' · ' + a.task + ' · 排队中';
        if (a.status === 'running') return a.name + ' · ' + a.task + ' · 运行中… ' + formatSeconds(a.elapsed);
        return a.name + ' · ' + a.task + ' · 已完成 · ' + formatSeconds(a.elapsed);
      }
      function subIcon(t) {
        if (t.indexOf('知识库') !== -1) return 'knowledge';
        if (t.indexOf('阅读') !== -1 || t.indexOf('读取') !== -1) return 'read';
        if (t.indexOf('工具') !== -1 || t.indexOf('说明') !== -1) return 'tool';
        return 'subagent';
      }
      function sync() {
        row.label.textContent = summary();
        setOpen(col.root, row.btn, isSubsOpen());
        agents.forEach(function (a) {
          a.tLabel.textContent = agentLabel(a);
          a.toggle.classList.toggle('queued', a.status === 'queued');
          var open = isAgentOpen(a) && a.details.length > 0;
          setOpen(a.col.root, a.toggle, isAgentOpen(a));
          a.col.root.classList.toggle('is-open', open);
          a.a11y = open;
          while (a.shown < a.details.length) {
            var d = el('div', 'activity-row detail');
            d.appendChild(img(ICON[subIcon(a.details[a.shown])], '', 16, 16));
            var sp = el('span'); sp.textContent = a.details[a.shown]; d.appendChild(sp);
            a.col.content.appendChild(d);
            a.shown += 1;
          }
        });
      }
      function F(mutate) {
        agents.forEach(function (a) {
          var wasCompleted = a.status === 'completed';
          mutate(a);
          if (!wasCompleted && a.status === 'completed') a.S = false;
        });
        sync();
      }
      sync();
      return {
        agents: agents, F: F, sync: sync,
        finish: function () { done = true; S.subs = false; sync(); },
        settle: function () { S.subs = undefined; sync(); },
      };
    }

    /* ───── script (ported 1:1 from CUI demo, domain swapped to 销售分货) ───── */

    try {
      if (plan) {
        await plan.process({
          W: W,
          V: V,
          wait: wait,
          sleep: sleep,
          show: function (node) {
            answerEl.hidden = false;
            answerEl.appendChild(node);
            scrollThreadIfStick();
          },
          scroll: scrollThreadIfStick,
        });
      } else {
      await wait(700);
      await addReason('先理解你的请求「' + userText + '」，再决定要调用哪些工具。');

      // command progress (code)
      var cmdRef = addTool({ id: 'cmd', icon: 'command', label: '正在生成分析函数', details: [], running: true, code: true });
      cmdRef.g.S = true; syncGroup(cmdRef.g);
      for (var i = 0; i < CODE_LINES.length; i++) {
        await wait(380);
        cmdRef.c.details = CODE_LINES.slice(0, i + 1);
        syncGroup(cmdRef.g);
      }
      updateTool(cmdRef, { label: '已生成分货函数', running: false });
      await wait(700);
      cmdRef.g.S = undefined; syncGroup(cmdRef.g);
      await sleep(320 * SPEED);

      await V({ id: 'mcp1', icon: 'mcp', label: '已调用工具 · project.get_context', details: ['工作区：AgentOS', '收到项目上下文与可用工具 · 0.8s'] });
      await V({ id: 'mcp2', icon: 'mcp', label: '已调用工具 · files.read', details: ['读取 src/allocation/allocate.py', '收到 2 条结果 · 1.2s'] });
      await wait(500);

      await runDeep(DEEP_1);
      await W('分货函数、项目上下文和文件已准备好，接下来检索知识库并核对数据与本体关系。');

      var triple = [
        { id: 'knowledge', icon: 'knowledge', active: '正在搜索知识库', label: '已搜索知识库', details: ['检索分货规则与销售口径', '匹配 3 篇参考文档', '提取保底、封顶与箱规规则'] },
        { id: 'database', icon: 'datasource', active: '正在查询数据库', label: '已查询数据库', details: ['连接 Retail Analytics · 只读', '查询近 30 天门店 SKU 销量与库存', '返回 128 行 · 字段校验通过'] },
        { id: 'ontology', icon: 'ontology', active: '正在查询本体', label: '已查询本体', details: ['匹配门店、SKU、库存实体', '遍历 门店 → SKU → 库存 关系', '发现 12 个实体、8 条关系'] },
      ];
      for (var t = 0; t < triple.length; t++) {
        var spec = triple[t];
        var ref = addTool({ id: spec.id, icon: spec.icon, label: spec.active, details: [], running: true });
        for (var k = 0; k < spec.details.length; k++) {
          await wait(650);
          ref.c.details = spec.details.slice(0, k + 1);
          syncGroup(ref.g);
        }
        updateTool(ref, { label: spec.label, running: false });
        await wait(450);
      }

      await runDeep(DEEP_2);
      await W('上下文偏长，先压缩一轮，只保留任务目标、决策和文件引用。');

      var ctxRef = addTool({ id: 'ctx', icon: 'context', label: '正在压缩上下文', details: [], running: true });
      var ctxSteps = ['检查历史消息与工具结果', '保留任务要求、决策和文件引用', '上下文从 48k 降到 12k tokens'];
      for (var c = 0; c < ctxSteps.length; c++) {
        await wait(650);
        ctxRef.c.details = ctxSteps.slice(0, c + 1);
        syncGroup(ctxRef.g);
      }
      updateTool(ctxRef, { label: '已压缩上下文', running: false });
      await wait(450);

      await V({ id: 'web', icon: 'search', label: '已搜索网络', details: ['检索 “inventory allocation strategy retail”', '阅读 门店分货 · 保底与封顶策略', '阅读 补货与铺货 · 箱规取整'] });
      await wait(400);
      await W('接下来并行拉起 4 个子 Agent：知识检索、数据源核对、本体查询和分货规则检查。');

      var subs = runSubagentsSetup();
      await wait(900);
      subs.F(function (a) { if (a.id === 'sa2') a.status = 'running'; });
      var tick = setInterval(function () {
        subs.F(function (a) { if (a.status === 'running') a.elapsed += 120; });
      }, 120);
      await wait(1100);
      subs.F(function (a) { if (a.id === 'sa1') { a.status = 'completed'; a.details = ['已搜索知识库 · “allocation rules and caps”', '已阅读 AgentOS UI 规范 · 活动流', '已阅读工具事件说明 · 展开详情']; } });
      await wait(700);
      subs.F(function (a) { if (a.id === 'sa3') a.status = 'running'; });
      await wait(1300);
      subs.F(function (a) { if (a.id === 'sa2') { a.status = 'completed'; a.details = ['已连接数据源 · Analytics · 只读', '已查询 store_sku_sales · 近 30 天', '返回 128 行 · 240ms']; } });
      await wait(800);
      subs.F(function (a) { if (a.id === 'sa4') a.status = 'running'; });
      await wait(1200);
      subs.F(function (a) { if (a.id === 'sa3') { a.status = 'completed'; a.details = ['已查询实体 · 门店、SKU、库存', '已遍历关系 · 门店 → holds → 库存', '发现 12 个实体、8 条关系']; } });
      await wait(1400);
      subs.F(function (a) { if (a.id === 'sa4') { a.status = 'completed'; a.details = ['已启动 Rule Review Agent · 检查保底与封顶', '已核对禁配门店、箱规取整与超配', '已完成 · 返回 3 条建议']; } });
      clearInterval(tick);
      subs.finish();
      await wait(400);

      await W('子 Agent 都回来了。再补两条 Skill，然后落文件。');
      await V({ id: 'cskill', icon: 'skill', label: '已使用自定义 Skill · allocation-rule-review', details: ['加载工作区 Skill', '阅读 .agents/skills/allocation-rule-review/SKILL.md', '套用保底、封顶与禁配规则'] });
      await V({ id: 'oskill', icon: 'skill', label: '已使用官方 Skill · xlsx', details: ['加载官方 Skill', '阅读表格生成与格式指引', '复用已有模板与列定义'] });
      await V({ id: 'edit', icon: 'edit', label: '已编辑文件 · allocate.py · +24 −8', details: ['更新 src/allocation/allocate.py · +24 −8', '补充箱规取整与未满足原因输出'] });

      await W('分货脚本已写入，接下来生成分货建议表并整理输出结果。');
      await V({ id: 'report-build', icon: 'edit', label: '已生成文件 · allocation_plan.xlsx', details: ['合并门店得分、缺口与分货策略', '写入 Excel 分货建议表', '完成表结构校验'] });

      await W('建议表已生成并完成校验，下面提供下载入口和文件说明。');
      await V({ id: 'report-validate', icon: 'command', label: '已完成分货检查', details: ['检查分货总量不超过可分配库存', '校验 128 行数据与权重计算结果', '确认未满足需求均包含对应原因', '检查导出入口与附件列表', '完成输出格式与链接检查'] });

      await W('分货内容、数据依据和下载入口均已检查完成，现在展示最终输出。');
      await V({ id: 'report-delivery', icon: 'tool', label: '已准备交付内容', details: ['整理 Excel、Word、PPT 和 HTML 文件', '生成 JSON 与 Markdown 附件', '确认每个文件的名称与大小', '绑定下载按钮与文件入口', '准备最终分货方案'] });
      await W('交付文件已整理完毕，所有下载入口都已准备好。');
      await wait(500);

      } /* end: default demo script */

      /* ── process done: collapse & show duration (demo) ── */
      closeActive();
      processOpen = false;
      setOpen(processCol.root, statusBtn, false);
      statusChevron.classList.add('closed');
      viewport.classList.remove('is-generating');
      clearInterval(statusTimer);
      var thinkMs = Date.now() - startedAt;
      /* Demo label: always show ~5s even if wall-clock drifts a little */
      var duration = formatDuration(plan ? Math.max(thinkMs, 2000) : Math.min(Math.max(thinkMs, 4500), 5500));
      await sleep(480 * SPEED);
      if (subs) subs.settle();
      statusText.className = '';
      statusText.textContent = duration;
      statusRow.classList.add('done');

      /* ── body mock (js/agent-body.js) — separate readable pace ── */
      SPEED = BODY_SPEED;
      answerEl.hidden = false;
      var bodyCtx = { sleep: sleep, speed: BODY_SPEED, scroll: scrollThreadIfStick };

      if (plan) {
        if (!plan.preserveAnswer || (plan.segments && plan.segments.length)) {
          await window.AgentBody.run(Object.assign({ host: answerEl, segments: plan.segments }, bodyCtx));
        }
        if (plan.after) {
          afterRes = await plan.after({
            host: answerEl, scroll: scrollThreadIfStick, sleep: sleep,
            run: function (host, segments) { return window.AgentBody.run(Object.assign({ host: host, segments: segments }, bodyCtx)); },
          });
        }
      } else {
      /* part 1 — Agent restates the need, then asks how to build (mode choice) */
      var part1 = el('div');
      answerEl.appendChild(part1);
      await window.AgentBody.run(Object.assign({ host: part1, segments: FAST_PART1 }, bodyCtx));
      var choice = window.FastMode.choiceCard();
      var cseg = el('div', 'ao-seg stream-enter');
      cseg.appendChild(choice.node);
      part1.appendChild(cseg);
      scrollThreadToBottom();
      var picked = await choice.picked;
      await sleep(420);

      /* part 2 — continues in the chosen mode */
      var part2 = el('div');
      answerEl.appendChild(part2);
      var lead = picked === 'fast'
        ? '好，先快速出一版：先用现有信息跑出一版可试用的 Agent，试用后再回头补文档和本体。'
        : '好，一步步做扎实：先把需求、知识和设计文档做扎实，再建本体、生成 Agent。';
      await window.AgentBody.run(Object.assign({ host: part2, segments: [{ md: lead, gap: 360 }].concat(FAST_SEGMENTS) }, bodyCtx));
      } /* end: default body */
      await sleep(200 * BODY_SPEED);
      if (!(afterRes && afterRes.skipFooter)) turn.appendChild(renderFooter());
      scrollThreadToBottom();
    } finally {
      clearInterval(statusTimer);
      if (turnResize) turnResize.disconnect();
      busy = false;
    }
    return afterRes;
  }

  /* Public: post a plain Agent message (no deep-thinking) — used by Fast flows
     that react to UI actions (e.g. scenario created). */
  window.FastChat = {
    enterChatMode: enterChatMode,
    clearThread: function () {
      /* the scene room opens: keep the old thread as its own conversation and start a clean one for the journey */
      if (window.FastConversations) window.FastConversations.fresh({ title: 'T1 · 寻源策略', journey: true, archiveTitle: '创建场景' });
      else thread.innerHTML = '';
    },
    postUser: function (text) {
      if (!text) return;
      if (window.FastConversations) window.FastConversations.home();
      enterChatMode();
      appendUserBubble(text, []);
      stickBottom = true;
      scrollThreadToBottom();
    },
    fill: function (t) { return streamFill(t); },
    isBusy: function () { return busy; },
    waitForUserInput: function () {
      var receiver;
      var promise = new Promise(function (resolve) {
        receiver = function (text) { resolve(text); };
        pendingExternalInput = receiver;
      });
      promise.cancel = function () {
        if (pendingExternalInput === receiver) pendingExternalInput = null;
      };
      return promise;
    },
    /* Agent turn WITH the deep-thinking shell and a custom short script */
    run: function (plan) {
      if (busy) return Promise.resolve();
      if (window.FastConversations) window.FastConversations.home();
      busy = true;
      enterChatMode();
      return runAssistantTurn('', null, plan).catch(function (e) { console.error(e); busy = false; });
    },
    /* finished past turns (no streaming) → array of thread nodes: [{u:'user text'} | {a:'agent markdown', time:'09:12'}] */
    staticThread: function (items) {
      return items.map(function (it) {
        if (it.u != null) {
          var row = el('div', 'chat-msg-user', '<div class="chat-bubble-user"></div>');
          row.querySelector('.chat-bubble-user').appendChild(document.createTextNode(it.u));
          return row;
        }
        var root = el('div', 'chat-msg-assistant');
        var turn = el('div', 'ao-turn');
        var head = el('div', 'ao-turn-head');
        var avatar = el('span', 'ao-turn-avatar');
        avatar.setAttribute('aria-hidden', 'true');
        avatar.innerHTML = avatarMarkHtml();
        head.appendChild(avatar);
        head.appendChild(el('div', 'ao-turn-head-main', '<div class="ao-turn-name">AgentOS</div>'));
        var body = el('div', 'ao-answer answer-body chat-prose ao-body');
        body.innerHTML = '<div class="ao-seg">' + window.AgentBody.md(it.a) + '</div>';
        turn.appendChild(head); turn.appendChild(body);
        var foot = renderFooter();
        if (it.time) { var m = foot.querySelectorAll('.ao-turn-foot-meta span'); if (m.length) m[m.length - 1].textContent = it.time; }
        turn.appendChild(foot);
        root.appendChild(turn);
        return root;
      });
    },
    postAgent: async function (segments) {
      if (window.FastConversations) window.FastConversations.home();
      enterChatMode();
      var root = el('div', 'chat-msg-assistant');
      var turn = el('div', 'ao-turn');
      var head = el('div', 'ao-turn-head');
      var avatar = el('span', 'ao-turn-avatar');
      avatar.setAttribute('aria-hidden', 'true');
      avatar.innerHTML = avatarMarkHtml();
      head.appendChild(avatar);
      head.appendChild(el('div', 'ao-turn-head-main', '<div class="ao-turn-name">AgentOS</div>'));
      var body = el('div', 'ao-answer answer-body chat-prose');
      turn.appendChild(head); turn.appendChild(body);
      root.appendChild(turn);
      thread.appendChild(root);
      stickBottom = true;
      scrollThreadToBottom();
      await window.AgentBody.run({ host: body, sleep: sleep, speed: BODY_SPEED, scroll: scrollThreadIfStick, segments: segments });
      await sleep(160 * BODY_SPEED);
      turn.appendChild(renderFooter());
      scrollThreadToBottom();
    },
  };

  /* ───────────────────────── composer wiring ───────────────────────── */

  /* Space-fill is always streamed (typewriter), never dropped in at once */
  var filling = false;
  async function streamFill(text) {
    if (filling) return;
    filling = true;
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      input.value = chars.slice(0, i + 1).join('');
      input.setSelectionRange(input.value.length, input.value.length);
      autosize();
      syncSendState();
      await sleep(/[，。；：、！？,.]/.test(chars[i]) ? 70 : 18);
    }
    filling = false;
  }

  function sendMessage() {
    if (filling) return;
    var text = (input.value || '').trim();
    if (busy) {
      if (!pendingExternalInput || !text) return;
      enterChatMode();
      appendUserBubble(text, []);
      input.value = '';
      autosize();
      syncSendState();
      var receiver = pendingExternalInput;
      pendingExternalInput = null;
      receiver(text);
      return;
    }
    var FU = window.FastUpload;
    var FJ = window.FastJourney;
    if (FU && FU.busy()) return;
    /* upload round with nothing attached yet → attach the mock bundle so the story still holds */
    var CV = window.FastConversations, jOn = !!(FJ && FJ.active() && (!CV || CV.isJourney()));
    if (FU && !FU.has() && jOn && FJ.needsUpload && FJ.needsUpload()) FU.attachAll();
    var contextText = FU && FU.contextText ? FU.contextText() : '';
    var atts = FU ? FU.take() : [];
    if (!text && !atts.length) return;
    busy = true;
    enterChatMode();
    var row = appendUserBubble(text, atts);
    input.value = '';
    autosize();
    syncSendState();
    var FI = window.FastIntake;
    var FC = window.FastCompany;
    var planText = text + (text && contextText ? '\n\n' : '') + contextText;
    var diagnosisPlan = window.FastDiagnosis && window.FastDiagnosis.plan(planText);
    var journeyThreePlan = window.JourneyThreePlan && window.JourneyThreePlan.take(text);
    var journeyTwoPlan = window.JourneyTwoPlan && window.JourneyTwoPlan.take(text);
    var journeyOnePlan = window.JourneyOnePlan && window.JourneyOnePlan.take(text);
    var jPlan = diagnosisPlan || journeyThreePlan || journeyTwoPlan || journeyOnePlan || (jOn ? FJ.take()
      : (window.FastChange && window.FastChange.match(text) ? window.FastChange.plan()
      : (FC && FC.active() ? FC.take()
      : (FI && FI.active() ? FI.take()
      : (CV ? CV.plan(text) : null)))));
    runAssistantTurn(text, row, jPlan).catch(function (e) { console.error(e); busy = false; });
  }

  var composerCard = document.getElementById('composer-card');
  function syncSendState() {
    var has = !!(input.value || '').trim() || !!(window.FastUpload && window.FastUpload.has());
    if (composerCard) composerCard.classList.toggle('has-text', has);
    sendBtn.disabled = false;
    if (!has) spaceArmed = true;
  }
  input.addEventListener('input', function () { autosize(); syncSendState(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.code === 'Space') {
      if (filling) { e.preventDefault(); return; }
      if (spaceArmed && !(input.value || '').trim() && !pendingExternalInput) {
        e.preventDefault();
        var CV2 = window.FastConversations;
        var routePrompt = window.FastJourneyRoute && window.FastJourneyRoute.prompt
          ? window.FastJourneyRoute.prompt()
          : '';
        var sp = (window.FastJourney && window.FastJourney.active() && (!CV2 || CV2.isJourney())) ? window.FastJourney.prompt()
          : (window.FastChange && window.FastChange.available() ? window.FastChange.prompt()
          : (routePrompt || (window.FastCompany && window.FastCompany.active() ? window.FastCompany.prompt()
          : (window.FastIntake && window.FastIntake.active() ? window.FastIntake.prompt()
          : ((CV2 && CV2.prompt()) || SPACE_PROMPT)))));
        spaceArmed = false;
        streamFill(sp);
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  });
  sendBtn.addEventListener('click', function (e) {
    e.preventDefault();
    sendMessage();
  });
})();
