/**
 * Fast POC page ONLY — what happens after the user picks "Fast" (not loaded by superagent.html).
 *   FastFlow.start()   → chains the turns below once the current Agent turn has finished
 *
 *   ① Draft plans      Agent drafts Product / Ontology / Agent plans into Files → Deliverables
 *   ② Confirm          decision card: 5 decisions with a recommendation each (gate 1 — the user confirms the docs)
 *   ③ Intent check     "generate the Agent now?" — go / keep refining (→ Steps) / later (gate 2)
 *   ④ Generate         ontology stub · skill stubs · sample-data MCP · assemble → blueprint plates turn "Mock", Agent "Ready to try"
 *   ⑤ Ready to try     card in chat + the Agent opens in the right panel (Try · Spec · Mocks)
 *
 * Plans use the same shape as js/fast-journey.js: { process(api), segments, after(ctx) }.
 */
(function () {
  'use strict';
  /* Temporary review lock: load the demo at the final planning turn.
     Set to false when product review asks to restore the full journey. */
  var TASK_CARD_PREVIEW_LOCK = false;
  var BP = function () { return window.FastBlueprint; };
  var FF = function () { return window.FastFiles; };
  var activeExecutionCard = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function files(list, gap) {
    return async function () {
      for (var i = 0; i < list.length; i++) {
        await new Promise(function (r) { setTimeout(r, gap || 520); });
        if (FF()) FF().addDeliverable(list[i]);
      }
      await new Promise(function (r) { setTimeout(r, 240); });
    };
  }
  function seg(c, node) {
    var s = el('div', 'ao-seg stream-enter');
    s.appendChild(node);
    c.host.appendChild(s);
    c.scroll();
  }
  async function say(c, md) {
    var part = el('div');
    c.host.appendChild(part);
    await c.run(part, [{ md: md, gap: 340 }]);
  }

  /* ───────── decision card ───────── */
  function decisionCard() {
    var DEC = window.FastPlanData.decisions;
    var pick = {};
    DEC.forEach(function (d) { pick[d.id] = 0; });
    var box = el('div', 'ff-card');
    box.innerHTML =
      '<div class="ff-head"><span class="ff-t">需要你确认的 5 个决策</span><span class="ff-h">已按推荐预选，可直接确认</span></div>' +
      '<div class="ff-list">' + DEC.map(function (d) {
        return '<div class="ff-d" data-d="' + d.id + '">' +
          '<div class="ff-d-top"><span class="ff-d-id">' + d.id + '</span><span class="ff-d-t">' + esc(d.title) + '</span></div>' +
          '<div class="ff-d-why">' + esc(d.why) + '</div>' +
          '<div class="ff-opts">' + d.opts.map(function (o, i) {
            return '<button type="button" class="ff-opt' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '"><span class="ff-radio"></span>' +
              '<span class="ff-opt-t">' + esc(o.t) + '</span>' + (o.rec ? '<span class="ff-rec">推荐</span>' : '') + '</button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>' +
      '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="confirm">确认并继续</button>' +
      '<button type="button" class="fm-btn" data-act="view">查看产品方案</button>' +
      '<span class="ff-sum"></span></div>';
    var sum = box.querySelector('.ff-sum');
    function sync() {
      var n = DEC.filter(function (d) { return pick[d.id] !== 0; }).length;
      sum.textContent = n ? '其中 ' + n + ' 项与推荐不同' : '全部采用推荐';
    }
    sync();
    var done = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        if (box.classList.contains('is-done')) return;
        var o = e.target.closest('.ff-opt');
        if (o) {
          var row = o.closest('.ff-d');
          row.querySelectorAll('.ff-opt').forEach(function (x) { x.classList.toggle('is-on', x === o); });
          pick[row.getAttribute('data-d')] = +o.getAttribute('data-i');
          sync();
          return;
        }
        var b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.getAttribute('data-act') === 'view') { window.FastDocs.open('Product plan v0.1.md'); return; }
        box.classList.add('is-done');
        b.classList.add('is-picked');
        resolve(JSON.parse(JSON.stringify(pick)));
      });
    });
    return { node: box, done: done };
  }

  /* ───────── long-task confirmation card ───────── */
  function taskPlanCard(opts) {
    opts = opts || {};
    var progressive = !!opts.progressive;
    var tasks = opts.tasks || [
      { title: '用户故事设计', desc: '明确各角色流程与关键异常处理。', agent: '场景需求Agent', status: '自动继续' },
      { title: '业务规则方案设计', desc: '梳理异常判定、容差放行与跨期规则。', agent: '业务规则设计Agent', status: '自动继续' },
      { title: '高保真交互原型设计', desc: '将用户故事转为可操作、可评审的原型。', agent: '场景需求Agent', status: '停下审核', gate: true },
      { title: '总体技术架构设计', desc: '基于原型和规则更新本体与 Agent 分工。', agent: '技术方案设计Agent', status: '自动继续' },
      { title: '详细技术方案设计', desc: '输出本体、Agent 与测试用例设计。', agent: '技术方案设计Agent', status: '自动继续' },
      { title: '本体对象集构建', desc: '依据本体方案新增或修改对象集。', agent: '本体构建Agent', status: '停下审核', gate: true },
      { title: '智能体及配套能力构建', desc: '构建 Skill、MCP、知识库与 Agent。', agent: '智能打造Agent', status: '停下审核', gate: true },
    ];
    var box = el('section', 'ff-card ff-task-plan');
    box.setAttribute('aria-labelledby', 'ff-task-plan-title');
    box.innerHTML =
      '<div class="ff-plan-head"><div><span class="ff-plan-kicker">PLAN</span>' +
      '<h3 class="ff-plan-title" id="ff-task-plan-title">' + esc(opts.title || '任务清单') + '</h3></div>' +
      '<span class="ff-plan-state' + (progressive ? ' is-building' : '') + '" data-plan-state>' + (progressive ? '正在规划' : '待确认') + '</span></div>' +
      '<div class="ff-plan-brief"><span>' + esc(opts.brief || '复用 To-be设计 v2') + '</span><b data-plan-count>' + (progressive ? '0 / ' + tasks.length : tasks.length) + ' 项任务</b></div>' +
      '<div class="ff-plan-body"><div class="ff-plan-tasks">' + tasks.map(function (task, index) {
        return '<div class="ff-plan-task"' + (progressive ? ' hidden' : '') + ' data-plan-task="' + index + '">' +
          '<span class="ff-plan-task-num">' + (index + 1) + '</span>' +
          '<span class="ff-plan-task-main"><span class="ff-plan-task-title">' + esc(task.title) + '</span>' +
          '<span class="ff-plan-task-desc">' + esc(task.desc) + '</span></span>' +
          '<span class="ff-plan-task-meta"><span class="ff-plan-task-agent"><b>A</b>' + esc(task.agent) + '</span>' +
          '<select class="ff-plan-task-mode" aria-label="' + esc(task.title) + '执行方式">' +
          '<option value="auto" selected>自动执行</option><option value="review">我来审核</option></select>' +
          '<span class="ff-plan-task-status' + (task.gate ? ' is-review' : '') + '">' + esc(task.status || '自动继续') + '</span></span></div>';
      }).join('') + '</div></div>' +
      '<div class="ff-foot"' + (progressive ? ' hidden' : '') + '><span class="ff-plan-hint">' + esc(opts.hint || '如需调整任务，直接在会话中告诉我你的要求。') + '</span>' +
      '<button type="button" class="fm-btn is-primary" data-act="confirm">' + esc(opts.buttonLabel || '确认开始执行') + '</button></div>';
    var picked = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b || box.classList.contains('is-done')) return;
        box.classList.add('is-done');
        b.classList.add('is-picked');
        var state = box.querySelector('[data-plan-state]');
        if (state) {
          state.textContent = opts.doneLabel || '已确认';
          state.classList.remove('is-building');
        }
        b.textContent = opts.confirmedButtonLabel || '已确认';
        resolve(b.getAttribute('data-act'));
      });
    });
    function reveal(index) {
      var task = box.querySelector('[data-plan-task="' + index + '"]');
      if (!task) return;
      task.hidden = false;
      task.classList.add('stream-enter');
      var count = box.querySelector('[data-plan-count]');
      if (count) count.textContent = (index + 1) + ' / ' + tasks.length + ' 项任务';
    }
    function finish() {
      var state = box.querySelector('[data-plan-state]');
      if (state) {
        state.textContent = '待确认';
        state.classList.remove('is-building');
      }
      var count = box.querySelector('[data-plan-count]');
      if (count) count.textContent = tasks.length + ' 项任务';
      var foot = box.querySelector('.ff-foot');
      if (foot) { foot.hidden = false; foot.classList.add('stream-enter'); }
    }
    return { node: box, picked: picked, reveal: reveal, finish: finish };
  }

  function executionTaskCard(customTitles) {
    var titles = customTitles || [
      '用户故事设计',
      '业务规则方案设计',
      '高保真交互原型设计',
      '总体技术架构设计',
      '详细技术方案设计',
      '本体对象集构建',
      '智能体及配套能力构建',
    ];
    var box = el('section', 'ff-exec-card');
    box.innerHTML =
      '<div class="ff-exec-head"><span class="ff-exec-title">任务执行</span>' +
      '<span class="ff-exec-total" data-exec-total>准备开始</span></div>' +
      '<div class="ff-exec-list">' + titles.map(function (title, index) {
        return '<div class="ff-exec-row" data-exec-step="' + index + '" data-state="waiting">' +
          '<span class="ff-exec-num">' + (index + 1) + '</span>' +
          '<span class="ff-exec-name">' + esc(title) + '</span>' +
          '<span class="ff-exec-state"><i></i><span>等待中</span></span></div>';
      }).join('') + '</div>';
    function set(index, state) {
      var row = box.querySelector('[data-exec-step="' + index + '"]');
      if (!row) return;
      row.setAttribute('data-state', state);
      var label = row.querySelector('.ff-exec-state span');
      if (label && !(state === 'done' && row.hasAttribute('data-decision'))) {
        label.textContent = state === 'running' ? '进行中' : state === 'review' ? '等待确认' :
          state === 'done' ? '已完成' : state === 'stopped' ? '已停止' : '等待中';
      }
      var total = box.querySelector('[data-exec-total]');
      if (total) {
        var done = box.querySelectorAll('[data-state="done"]').length;
        total.textContent = state === 'running' ? '正在执行 · ' + (index + 1) + ' / ' + titles.length :
          state === 'review' ? '等待确认 · ' + (index + 1) + ' / ' + titles.length :
          state === 'stopped' ? '任务已停止' : done + ' / ' + titles.length;
      }
    }
    function finish() {
      var total = box.querySelector('[data-exec-total]');
      if (total) total.textContent = '全部完成';
      box.classList.add('is-done');
    }
    return {
      node: box,
      start: function (index) { set(index, 'running'); },
      done: function (index) { set(index, 'done'); },
      wait: function (index) { set(index, 'review'); },
      stop: function (index) { set(index, 'stopped'); },
      decision: function (index, text) {
        var row = box.querySelector('[data-exec-step="' + index + '"]');
        if (!row) return;
        row.setAttribute('data-decision', text);
        set(index, 'done');
        var label = row.querySelector('.ff-exec-state span');
        if (label) label.textContent = text;
      },
      finish: finish,
    };
  }

  function deliverableInventory() {
    var groups = [
      {
        title: '方案与设计交付物',
        items: [
          { name: '用户故事设计', ver: 'v1', state: 'pending' },
          { name: '规则方案设计', ver: 'v1', state: 'pending' },
          { name: '原型设计', ver: 'v1', state: 'confirmed' },
          { name: '架构方案设计', ver: 'v2', state: 'confirmed' },
          { name: '本体方案设计', ver: 'v1', state: 'pending', file: 'Ontology plan v0.1.md' },
          { name: 'Agent方案设计', ver: 'v1', state: 'pending', file: 'Agent plan v0.1.md' },
          { name: '测试用例设计', ver: 'v1', state: 'pending' },
        ],
      },
      {
        title: '可运行交付物',
        items: [
          { name: '对象集', ver: 'v1', state: 'confirmed', file: 'Ontology stub.json' },
          { name: 'Skill', ver: 'v1', state: 'confirmed' },
          { name: 'MCP', ver: 'v1', state: 'confirmed' },
          { name: '知识库', ver: 'v1', state: 'confirmed' },
        ],
      },
    ];
    var confirmed = 0;
    groups.forEach(function (group) {
      group.items.forEach(function (item) { if (item.state === 'confirmed') confirmed += 1; });
    });
    var box = el('section', 'ff-card ff-deliverables');
    box.innerHTML =
      '<div class="ff-del-head"><span class="ff-del-title">交付清单</span>' +
      '<span class="ff-del-count">' + confirmed + ' 项已确认</span></div>' +
      groups.map(function (group) {
        return '<div class="ff-del-group"><div class="ff-del-kicker">' + esc(group.title) + '</div>' +
          '<div class="ff-del-grid">' + group.items.map(function (item) {
            var tag = item.file ? 'button' : 'div';
            var state = item.state === 'confirmed' ? 'is-confirmed' : 'is-pending';
            var label = item.state === 'confirmed' ? '已确认' : '待确认';
            return '<' + tag + (item.file ? ' type="button" data-doc="' + esc(item.file) + '"' : '') +
              ' class="ff-del-row"><span class="ff-del-name">' + esc(item.name) + '</span>' +
              '<span class="ff-del-ver">' + esc(item.ver) + '</span>' +
              '<span class="ff-del-state ' + state + '">' + label + '</span></' + tag + '>';
          }).join('') + '</div></div>';
      }).join('');
    box.addEventListener('click', function (e) {
      var row = e.target.closest('[data-doc]');
      if (row && window.FastDocs) window.FastDocs.open(row.getAttribute('data-doc'));
    });
    return box;
  }

  function deliverableSummary(opts) {
    opts = opts || {};
    var items = opts.items || [];
    var entries = opts.entries || [];
    var fallbackIcon = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9v-13Z" stroke="currentColor"/><path d="M9.5 1.5v3h3" stroke="currentColor"/></svg>';
    var box = el('section', 'ff-output-summary');
    box.innerHTML =
      '<h3 class="ff-output-title">' + esc(opts.title || '执行总结') + '</h3>' +
      (opts.body ? '<p class="ff-output-body">' + esc(opts.body) + '</p>' : '') +
      '<p class="ff-output-lead">' + esc(opts.lead || '本轮任务已完成，以下产出已生成并可直接查看。') + '</p>' +
      '<div class="ff-output-links">' + items.map(function (item, index) {
        var icon = window.FastDocs && window.FastDocs.icon
          ? window.FastDocs.icon(item.iconName || item.name, 16)
          : fallbackIcon;
        return '<button type="button" class="ff-output-link" data-output-index="' + index + '">' +
          '<span class="ff-output-icon" aria-hidden="true">' + (icon || fallbackIcon) + '</span>' +
          '<span class="ff-output-name">' + esc(item.name) + '</span></button>';
      }).join('') + '</div>' +
      (entries.length
        ? '<div class="ff-output-entries" role="group" aria-label="' + esc(opts.entriesLabel || '相关入口') + '">' +
          (opts.entriesLabel ? '<span class="ff-output-entries-label">' + esc(opts.entriesLabel) + '</span>' : '') +
          entries.map(function (entry, index) {
            return '<button type="button" class="ff-output-entry" data-entry-index="' + index + '">' +
              '<span class="ff-output-entry-dot" aria-hidden="true"></span>' +
              '<span class="ff-output-entry-name">' + esc(entry.name) + '</span></button>';
          }).join('') + '</div>'
        : '') +
      '<p class="ff-output-conclusion">' + esc(opts.conclusion || '') + '</p>' +
      (opts.ask ? '<p class="ff-output-ask">' + esc(opts.ask) + '</p>' : '');
    box.addEventListener('click', function (e) {
      var link = e.target.closest('[data-output-index]');
      if (link) {
        var item = items[Number(link.getAttribute('data-output-index'))];
        if (!item) return;
        if (item.open) item.open();
        else if (item.file && window.FastDocs) window.FastDocs.open(item.file);
        return;
      }
      var entryBtn = e.target.closest('[data-entry-index]');
      if (!entryBtn) return;
      var entry = entries[Number(entryBtn.getAttribute('data-entry-index'))];
      if (entry && entry.open) entry.open();
    });
    return box;
  }

  function agentUseCard() {
    var card = el('section', 'ff-app-launch');
    card.innerHTML =
      '<div class="ff-app-created"><span class="ff-app-created-check">' +
      '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m3 7.2 2.5 2.5L11 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span>应用已生成</span></div>' +
      '<div class="ff-app-main"><span class="ff-app-icon" aria-hidden="true">' +
      '<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="5" y="8.5" width="18" height="14" rx="5" stroke="currentColor" stroke-width="1.5"/><path d="M14 8.5V5.5M11 14v2M17 14v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="14" cy="4.5" r="1.2" fill="currentColor"/></svg></span>' +
      '<span class="ff-app-copy"><span class="ff-app-name">Sourcing Strategy Agent</span>' +
      '<span class="ff-app-version">Agent v0.1 · Ready to use</span></span>' +
      '<span class="ff-app-ready"><i></i>READY</span></div>' +
      '<p class="ff-app-desc">已按 4 项人在环确认结果完成配置，具备供应商筛选、报价比对、风险评估与异常替代能力。</p>' +
      '<div class="ff-app-foot"><span>现在可以进入应用，使用真实问题进行验证。</span>' +
      '<button type="button" data-act="open">打开 Agent 开始使用' +
      '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7h7M7.5 3.8 10.7 7l-3.2 3.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>';
    card.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || !window.FastAgentPanel) return;
      window.FastAgentPanel.open('try');
    });
    return card;
  }

  function executionThinkingBlock() {
    var box = el('div', 'ff-exec-think');
    box.innerHTML =
      '<button type="button" class="ff-exec-think-head" aria-expanded="true">' +
      '<span class="ff-exec-think-label thinking-copy">深度思考中…</span>' +
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m4.5 5.5 2.5 3 2.5-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="ff-exec-think-body"></div>';
    var head = box.querySelector('.ff-exec-think-head');
    var body = box.querySelector('.ff-exec-think-body');
    var label = box.querySelector('.ff-exec-think-label');
    var open = true;
    head.addEventListener('click', function () {
      open = !open;
      body.hidden = !open;
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    return {
      node: box,
      add: function (text) {
        var row = el('div', 'ff-exec-think-row stream-enter');
        row.innerHTML = '<i></i><span>' + esc(text) + '</span>';
        body.appendChild(row);
        body.scrollTop = body.scrollHeight;
      },
      finish: function () {
        label.textContent = '用时 10秒';
        label.classList.remove('thinking-copy');
        box.classList.add('is-done');
        setTimeout(function () {
          open = false;
          body.hidden = true;
          head.setAttribute('aria-expanded', 'false');
        }, 420);
      },
      waitForUser: function () {
        label.textContent = '等待你确认';
        label.classList.remove('thinking-copy');
        box.classList.add('is-waiting');
      },
      resume: function () {
        label.textContent = '深度思考中…';
        label.classList.add('thinking-copy');
        box.classList.remove('is-waiting');
      },
    };
  }

  function dismissReviewCard(box) {
    setTimeout(function () { box.classList.add('is-dismissed'); }, 320);
    setTimeout(function () { box.hidden = true; }, 620);
  }

  function businessRuleConfirmation() {
    var box = el('section', 'ff-review-card');
    box.innerHTML =
      '<div class="ff-review-head"><span class="ff-review-kicker">需要你确认</span>' +
      '<h4>月度关账尾差的自动放行口径是什么？</h4></div>' +
      '<div class="ff-review-options">' +
      '<button type="button" data-value="100">单笔尾差 ≤ 100 元自动放行</button>' +
      '<button type="button" class="is-on" data-value="500">单笔尾差 ≤ 500 元自动放行</button>' +
      '<button type="button" data-value="manual">不设置自动放行，全部人工复核</button></div>' +
      '<div class="ff-review-custom"><input type="text" placeholder="也可以直接输入其他口径…" aria-label="其他自动放行口径" />' +
      '<button type="button" class="ff-review-confirm">确认</button></div>';
    var picked = '500';
    var done = new Promise(function (resolve) {
      box.querySelector('.ff-review-options').addEventListener('click', function (e) {
        var b = e.target.closest('[data-value]');
        if (!b || box.classList.contains('is-done')) return;
        box.querySelectorAll('[data-value]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        picked = b.getAttribute('data-value');
      });
      box.querySelector('.ff-review-confirm').addEventListener('click', function () {
        if (box.classList.contains('is-done')) return;
        var custom = box.querySelector('input').value.trim();
        var result = custom || (picked === '100' ? '单笔尾差 ≤ 100 元自动放行' :
          picked === 'manual' ? '不设置自动放行，全部人工复核' : '单笔尾差 ≤ 500 元自动放行');
        box.classList.add('is-done');
        box.querySelectorAll('button, input').forEach(function (x) { x.disabled = true; });
        box.querySelector('.ff-review-confirm').textContent = '已确认';
        dismissReviewCard(box);
        resolve(result);
      });
    });
    return { node: box, done: done };
  }

  function deliverableConfirmation(opts) {
    var choice = 'pass';
    var box = el('section', 'ff-card ff-review-card ff-review-output');
    box.innerHTML =
      '<div class="ff-head"><span class="ff-t">需要你确认</span><span class="ff-h">已预选确认通过，可直接确认</span></div>' +
      '<div class="ff-d">' +
      '<div class="ff-d-top"><span class="ff-d-t">' + esc(opts.title) + '</span></div>' +
      '<div class="ff-d-why">' + esc(opts.desc) + '</div>' +
      '<div class="ff-opts">' +
      '<button type="button" class="ff-opt is-on" data-choice="pass"><span class="ff-radio"></span>' +
      '<span class="ff-opt-t">方案没问题，确认通过</span><span class="ff-rec">推荐</span></button>' +
      '<button type="button" class="ff-opt" data-choice="pause"><span class="ff-radio"></span>' +
      '<span class="ff-opt-t">先暂停一下</span></button></div>' +
      '<div class="ff-review-custom"><input type="text" placeholder="输入修改意见或补充要求…" aria-label="修改意见或补充要求" /></div></div>' +
      '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="submit">确认通过</button>' +
      '<button type="button" class="fm-btn ff-review-view" data-act="view">查看方案</button></div>';
    var input = box.querySelector('input');
    var submit = box.querySelector('[data-act="submit"]');
    function syncSubmit() {
      var feedback = input.value.trim();
      submit.textContent = feedback ? '发送修改意见' : (choice === 'pause' ? '先暂停' : '确认通过');
    }
    var done = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        if (box.classList.contains('is-done')) return;
        var opt = e.target.closest('[data-choice]');
        if (opt) {
          choice = opt.getAttribute('data-choice');
          box.querySelectorAll('[data-choice]').forEach(function (x) { x.classList.toggle('is-on', x === opt); });
          syncSubmit();
          return;
        }
        var b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.getAttribute('data-act') === 'view') {
          if (opts.file && window.FastDocs) window.FastDocs.open(opts.file);
          return;
        }
        var feedback = input.value.trim();
        var result = feedback ? '已提交意见：' + feedback : (choice === 'pause' ? '已暂停' : opts.result);
        box.classList.add('is-done');
        b.classList.add('is-picked');
        box.querySelectorAll('button, input').forEach(function (x) { x.disabled = true; });
        dismissReviewCard(box);
        resolve(result);
      });
      input.addEventListener('input', syncSubmit);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') submit.click();
      });
    });
    return {
      node: box,
      done: done,
      dismiss: function () {
        box.classList.add('is-done');
        box.querySelectorAll('button, input').forEach(function (x) { x.disabled = true; });
        dismissReviewCard(box);
      },
    };
  }

  function revisedPlanConfirmation() {
    var revised = [
      { title: '更新业务规则方案与设计', desc: '重新梳理客户变更后的规则、口径与异常处理。', agent: '业务规则设计Agent' },
      { title: '更新高保真交互原型设计', desc: '根据新需求更新关键页面、状态与操作流程。', agent: '场景需求Agent' },
      { title: '更新总体技术框架设计', desc: '重新校准系统边界、模块关系与 Agent 分工。', agent: '技术方案设计Agent' },
      { title: '详细技术方案设计', desc: '输出本体、Agent 与测试用例设计。', agent: '技术方案设计Agent' },
      { title: '智能体及配套能力构建', desc: '构建 Skill、MCP、知识库与 Agent。', agent: '智能打造Agent' },
    ];
    var box = el('section', 'ff-card ff-task-plan ff-plan-revision');
    box.innerHTML =
      '<div class="ff-plan-head"><div><span class="ff-plan-kicker">PLAN</span>' +
      '<h3 class="ff-plan-title">任务清单</h3></div><span class="ff-plan-state">待确认</span></div>' +
      '<div class="ff-plan-brief"><span>Long task · v2</span><b>5 项任务</b></div>' +
      '<div class="ff-plan-body"><div class="ff-plan-tasks">' + revised.map(function (task, index) {
        return '<div class="ff-plan-task"><span class="ff-plan-task-num">' + (index + 1) + '</span>' +
          '<span class="ff-plan-task-main"><span class="ff-plan-task-title">' + esc(task.title) + '</span>' +
          '<span class="ff-plan-task-desc">' + esc(task.desc) + '</span></span>' +
          '<span class="ff-plan-task-meta"><span class="ff-plan-task-agent"><b>A</b>' + esc(task.agent) + '</span>' +
          '<select class="ff-plan-task-mode" aria-label="' + esc(task.title) + '执行方式">' +
          '<option value="auto" selected>自动执行</option><option value="review">我来审核</option></select></span></div>';
      }).join('') + '</div></div>' +
      '<div class="ff-foot"><span class="ff-plan-hint">已根据客户侧需求变更重新整理任务范围。</span>' +
      '<button type="button" class="fm-btn is-primary" data-version="v2">开始执行</button></div>';
    var done = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-version]');
        if (!b || box.classList.contains('is-done')) return;
        box.classList.add('is-done');
        box.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        b.textContent = b.getAttribute('data-version') === 'v2' ? '已选择 v2' : '已选择 v1';
        dismissReviewCard(box);
        resolve(b.getAttribute('data-version'));
      });
    });
    return { node: box, done: done, tasks: revised };
  }

  function architectureConfirmation() {
    var box = el('section', 'ff-review-card ff-review-conflict');
    box.innerHTML =
      '<div class="ff-review-head"><span class="ff-review-kicker">发现版本差异</span>' +
      '<h4>架构方案设计 v1 为已确认结论，候选 v2 未直接覆盖</h4>' +
      '<p>候选 v2 根据新确认的原型和规则新增了关联本体与 Agent 协同架构。请对比差异后决定是否采纳；冲突处理前，后续构建保持暂停。</p></div>' +
      '<div class="ff-review-actions"><button type="button" data-act="diff">查看版本 Diff</button>' +
      '<button type="button" class="is-primary" data-act="v2">采纳候选 v2 并继续</button>' +
      '<button type="button" data-act="v1">保留 v1</button></div>';
    var done = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b || box.classList.contains('is-done')) return;
        var act = b.getAttribute('data-act');
        if (act === 'diff') {
          b.textContent = 'Diff 已查看';
          return;
        }
        box.classList.add('is-done');
        box.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        b.textContent = act === 'v2' ? '已采纳 v2' : '已保留 v1';
        dismissReviewCard(box);
        resolve(act === 'v2' ? '采纳候选 v2' : '保留架构方案 v1');
      });
    });
    return { node: box, done: done };
  }

  /* ───────── ① + ② draft & confirm ───────── */
  function planDraft() {
    var DEC = window.FastPlanData.decisions;
    return {
      process: async function (api) {
        await api.sleep(400);
        await api.W('资料和需求都齐了，先起草三份方案文档：产品、本体、Agent。');
        if (FF()) FF().showTab(true);
        BP() && BP().set('doc', 'doing', 'Drafting');
        BP() && BP().set('onto', 'mock', 'Will mock');
        BP() && BP().set('skill', 'mock', 'Will mock');
        await api.sleep(300);
        await api.V({ id: 'p1', icon: 'edit', label: '已起草 · 产品方案', details: ['目标用户、使用场景、功能范围', '评分口径与成功标准', '整理出 5 个待决策项'], during: files(['Design plans/Product plan v0.1.md']) });
        await api.V({ id: 'p2', icon: 'edit', label: '已起草 · 本体方案', details: ['对象：供应商、料号、报价、合同、异常', '关系与动作，ERP 字段映射'], during: files(['Design plans/Ontology plan v0.1.md']) });
        await api.V({ id: 'p3', icon: 'edit', label: '已起草 · Agent 方案', details: ['角色与边界，4 个 Skill，2 个数据连接', '对话流程与输出格式'], during: files(['Design plans/Agent plan v0.1.md']) });
        await api.W('三份草稿有了。其中有 5 处会直接影响结果，需要你来定。');
        BP() && BP().set('doc', 'doing', 'Review');
        await api.sleep(300);
        if (FF()) FF().showTab(false);
      },
      segments: [{ md:
        '三份方案文档起草好了，放在左侧 **Files → Deliverables**：\n\n' +
        '- [Product plan v0.1](Product plan v0.1.md)：目标、场景、功能范围、评分口径、成功标准\n' +
        '- [Ontology plan v0.1](Ontology plan v0.1.md)：对象、关系、动作，以及和 ERP 的映射\n' +
        '- [Agent plan v0.1](Agent plan v0.1.md)：角色、Skill、数据连接、对话流程\n\n' +
        '快速出一版时，不需要你逐页审阅。文档里只有下面 **5 个决策** 会影响后面的结果，每项我都给了推荐，其余部分先按默认处理：', gap: 340 }],
      after: async function (c) {
        var card = decisionCard();
        seg(c, card.node);
        var pick = await card.done;
        await c.sleep(420);
        window.FastPlanData.picks = pick;
        var diff = DEC.filter(function (d) { return pick[d.id] !== 0; });
        var rows = DEC.map(function (d) { return '| ' + d.id + ' ' + d.title + ' | ' + d.opts[pick[d.id]].t + ' |'; }).join('\n');
        window.FastDocs.append('Product plan v0.1.md',
          '\n## 8. 已确认决策\n\n| 决策 | 结论 |\n|---|---|\n' + rows + '\n\n由你在对话中确认，三份方案据此定稿。\n');
        BP() && BP().set('doc', 'done', 'Confirmed');
        BP() && BP().set('know', 'done', 'Indexed');
        await say(c,
          '已确认。' + (diff.length ? '和推荐不同的有 **' + diff.length + ' 项**（' + diff.map(function (d) { return d.id + ' ' + d.title; }).join('、') + '），' : '全部采用了推荐，') +
          '我已把结论写进 [Product plan v0.1](Product plan v0.1.md) 的「已确认决策」，三份方案定稿。');
      },
    };
  }

  /* ───────── ③ intent: generate now? ───────── */
  function planIntent() {
    var card = null;
    return {
      dynamicProcess: true,
      fastThinking: true,
      preserveAnswer: true,
      process: async function (api) {
        await api.sleep(160);
        await api.W('先核对现有资料和已确认内容，再决定这次计划需要覆盖到哪里。');
        await api.V({ id: 'i1', icon: 'search', label: '已评估生成条件', details: [
          '需求：品类、触发场景、硬性条件、评估优先级，已明确',
          '资料：9 份已读取，含合同、准入标准、ERP 导出',
          '设计：三份方案已确认，5 个决策已落定',
          '缺口：本体未校对、Skill 规则未固化、ERP 未连接，可先用 Mock 顶上',
        ] });
        await api.V({ id: 'i2', icon: 'read', label: '已读取 To-be设计 v2', details: ['提取已确认的目标流程', '标记无需重复处理的设计结论'] });
        await api.V({ id: 'i3', icon: 'context', label: '已建立任务依赖', details: ['业务规则先于技术架构', '交互原型先于详细方案', '本体与智能体构建依赖设计审核'] });
        await api.W('现有 To-be设计 v2 可以直接复用，不重复安排已经确认的内容。我从业务和体验缺口开始拆计划。');
        card = taskPlanCard({ progressive: true });
        var live = el('div', 'ao-seg ff-plan-live stream-enter');
        var lead = el('div', 'ff-plan-lead');
        lead.innerHTML = window.AgentBody.md(
          '我已校验你提交的 **9 份资料**，并把合同条款、准入标准、ERP 报价字段与前面确认的内容做了交叉核对。\n\n' +
          '**我会先补齐业务与体验方案，再进入技术设计和构建。** 下面正在逐步整理建议的任务安排：'
        );
        live.appendChild(lead);
        live.appendChild(card.node);
        api.show(live);
        function revealStep(index) {
          card.reveal(index);
          api.scroll();
        }

        await api.sleep(180);
        await api.W('先明确不同角色怎么完成关联审查，以及遇到关键异常时如何处理。');
        await api.V({ id: 's1', icon: 'context', label: '已梳理用户故事范围', details: ['角色：业务经办、审核人、系统管理员', '覆盖主流程与关键异常分支'] });
        revealStep(0);
        await api.sleep(180);
        await api.W('角色流程确定后，需要把异常判定、容差放行和跨期处理沉淀成独立规则方案。');
        await api.V({ id: 's2', icon: 'search', label: '已识别规则缺口', details: ['异常判定口径待统一', '容差放行需要明确权限', '跨期处理需要保留追溯依据'] });
        revealStep(1);
        await api.sleep(180);
        await api.W('业务输入已经成形，下一步把用户故事转成可以操作和评审的高保真原型。');
        await api.V({ id: 's3', icon: 'edit', label: '已确定原型覆盖范围', details: ['主操作流程', '异常反馈状态', '审核与回退节点'] });
        revealStep(2);
        await api.sleep(180);
        await api.W('原型和规则会改变系统分工，因此总体架构必须在详细设计之前更新。');
        await api.V({ id: 's4', icon: 'command', label: '已分析总体架构影响', details: ['更新本体与 Agent 分工', '补充前后端交互边界', '保留 ERP 集成替换位'] });
        revealStep(3);
        await api.sleep(180);
        await api.W('总体架构确定后，再按需展开本体、Agent 和测试用例的详细方案。');
        await api.V({ id: 's5', icon: 'edit', label: '已拆分详细设计交付物', details: ['本体方案设计', 'Agent 方案设计', '测试用例设计'] });
        revealStep(4);
        await api.sleep(180);
        await api.W('构建阶段先依据已确认的本体方案处理对象集，并保留人工审核。');
        await api.V({ id: 's6', icon: 'ontology', label: '已规划本体构建任务', details: ['新增或修改对象集', '校验对象关系与字段映射', '完成后停下审核'] });
        revealStep(5);
        await api.sleep(180);
        await api.W('最后生成智能体及 Skill、MCP、知识库等配套能力，并在完成后停下审核。');
        await api.V({ id: 's7', icon: 'skill', label: '已规划智能体构建任务', details: ['生成或修改 Skill', '配置 MCP 与知识库', '组装 Agent 并执行测试用例'] });
        revealStep(6);
        await api.sleep(260);
        await api.V({ id: 'i4', icon: 'search', label: '已检查计划完整性', details: ['7 个任务均有明确输入与产出', '3 个关键节点需要人工审核', '执行顺序无循环依赖'] });
        card.finish();
        api.scroll();
      },
      segments: [],
      after: async function (c) {
        if (!card) {
          card = taskPlanCard();
          seg(c, card.node);
        }
        var picked = await card.picked;
        await c.sleep(420);
        if (picked === 'adjust') {
          await say(c, '可以。直接告诉我需要增加、删除、合并或调整顺序的任务，我会更新任务安排后再请你确认。');
        } else if (picked === 'later') {
          await say(c, '好，当前资料校验结果和任务安排都已保留。想继续时直接告诉我，从确认任务安排这里接着走。');
        }
        return { picked: picked };
      },
    };
  }

  function planExecutionKickoff() {
    var card = executionTaskCard();
    var thinking = executionThinkingBlock();
    var thoughts = [
      '正在调用 files.read · 读取 To-be设计 v2 与已确认范围',
      '正在核对角色、触发条件和关键异常分支',
      '正在 Write · 用户故事设计 v1',
      '正在调用 rules.extract · 提取异常判定与容差规则',
      '正在 Write · 业务规则方案设计 v1',
      '正在校验月度关账尾差与跨期处理口径',
      '正在把用户故事映射到原型页面与交互状态',
      '正在标记原型完成后的人工审核节点',
      '正在分析原型与业务规则对总体架构的影响',
      '正在重新确认本体与 Agent 的职责边界',
      '正在拆分本体方案、Agent 方案与测试用例',
      '正在检查详细设计之间的前后依赖',
      '正在整理对象集、关系与 ERP 字段映射',
      '正在校验本体构建完成后的审核条件',
      '正在编排 Skill、MCP、知识库与 Agent',
      '正在检查 Skill 输入输出与业务规则是否一致',
      '正在核对 MCP 数据权限与失败回退策略',
      '正在整理知识库引用范围与更新方式',
      '正在生成 Agent 能力边界与禁止事项',
      '正在匹配测试用例与七项任务的验收条件',
      '正在复核人工审核节点是否完整',
      '正在汇总执行状态并检查剩余任务',
      '正在 Write · 智能体及配套能力构建草案',
      '正在检查候选架构与已确认版本的兼容性',
      '正在比对架构方案设计 v1 与候选 v2',
      '发现架构版本差异，正在准备决策信息',
    ];
    return {
      dynamicProcess: true,
      fastThinking: true,
      process: async function (api) {
        await api.sleep(160);
        await api.W('收到确认。我先把七个任务编排成可执行流程，并校验每一步的输入和审核点。');
        await api.V({ id: 'exec-plan', icon: 'context', label: '已规划任务流程', details: [
          '业务与体验方案优先',
          '技术设计依赖原型与规则结论',
          '原型、本体和智能体构建完成后停下审核',
        ] });
        await api.W('任务顺序和审核节点已经确定，准备按计划开始执行。');
      },
      segments: [{ node: card.node, gap: 160 }],
      after: async function (c) {
        activeExecutionCard = card;
        var taskSixInput = null;
        var taskSixFeedback = '';
        seg(c, thinking.node);
        card.start(0);
        for (var i = 0; i < thoughts.length; i++) {
          await c.sleep(700);
          thinking.add(thoughts[i]);
          if (i === 2) { card.done(0); card.start(1); }
          if (i === 5) {
            card.wait(1);
            thinking.waitForUser();
            var review = businessRuleConfirmation();
            seg(c, review.node);
            c.scroll();
            var decision = await review.done;
            thinking.resume();
            thinking.add('已接收确认 · ' + decision);
            card.decision(1, decision.indexOf('100 元') !== -1 ? '≤ 100 元自动放行' :
              decision.indexOf('500 元') !== -1 ? '≤ 500 元自动放行' :
              decision.indexOf('人工复核') !== -1 ? '全部人工复核' : '采用自定义口径');
            card.start(2);
          }
          if (i === 10) {
            card.wait(2);
            thinking.waitForUser();
            var prototypeVersion = 1;
            var prototypeDecision = '';
            var prototypeFeedback = '';
            while (true) {
              var prototypeLabel = prototypeVersion === 1 ? 'v1' : 'v1.' + (prototypeVersion - 1);
              var prototypeReview = deliverableConfirmation({
                title: '原型设计 ' + prototypeLabel + ' 已生成',
                desc: prototypeVersion === 1
                  ? '包含关联异常工作台、证据链查看和调账确认三个核心界面，请审核是否符合预期。'
                  : '已根据你的修改意见完成 3 项更新，请再次审核修改后的交互原型。',
                file: 'Prototype design v0.1.md',
                result: '原型设计 ' + prototypeLabel + ' 已确认',
              });
              seg(c, prototypeReview.node);
              c.scroll();
              prototypeDecision = await prototypeReview.done;
              if (prototypeDecision === '已暂停') {
                thinking.add('已暂停，当前步骤先停在这里');
                c.scroll();
                return;
              }
              if (prototypeDecision.indexOf('已提交意见：') !== 0) break;

              prototypeFeedback = prototypeDecision.slice('已提交意见：'.length);
              thinking.resume();
              thinking.add('已接收原型修改意见 · ' + prototypeFeedback);
              card.start(2);
              await c.sleep(650);
              thinking.add('正在重新梳理修改项并更新页面状态');
              await c.sleep(650);
              thinking.add('正在 Write · 原型交互与界面细节');
              await c.sleep(650);
              thinking.add('正在检查修改结果与原业务流程的一致性');
              await c.sleep(650);
              thinking.add('修改已完成，正在生成新版本供你确认');
              prototypeVersion += 1;
              card.wait(2);
              thinking.waitForUser();
            }
            thinking.resume();
            thinking.add('已接收确认 · ' + prototypeDecision);
            card.decision(2, '确认通过');
            card.start(3);
          }
          if (i === 13) { card.done(3); card.start(4); }
          if (i === 15) {
            card.done(4);
            card.start(5);
            if (window.FastChat.waitForUserInput) {
              taskSixInput = window.FastChat.waitForUserInput();
              taskSixInput.then(function (value) { taskSixFeedback = value; });
            }
          }
          if (i > 15 && i < 20 && taskSixFeedback) {
            card.stop(5);
            card.stop(6);
            thinking.finish();
            c.scroll();
            return { replan: true, feedback: taskSixFeedback };
          }
          if (i === 20) {
            card.wait(5);
            thinking.waitForUser();
            var ontologyReview = deliverableConfirmation({
              title: '对象集 v1 已构建完成',
              desc: '已按确认的本体方案完成对象集构建与基础校验，请审核产出后决定是否继续 Agent 构建。',
              file: 'Ontology stub.json',
              result: '对象集 v1 已确认',
            });
            seg(c, ontologyReview.node);
            c.scroll();
            var outerInput = taskSixInput || (window.FastChat.waitForUserInput ? window.FastChat.waitForUserInput() : null);
            var ontologyOutcome = await Promise.race([
              ontologyReview.done.then(function (value) { return { source: 'card', value: value }; }),
              outerInput ? outerInput.then(function (value) { return { source: 'composer', value: value }; }) : new Promise(function () {}),
            ]);
            if (outerInput && outerInput.cancel) outerInput.cancel();
            if (ontologyOutcome.source === 'card' && ontologyOutcome.value === '已暂停') {
              thinking.add('已暂停，当前步骤先停在这里');
              c.scroll();
              return;
            }
            if (ontologyOutcome.source === 'composer' || ontologyOutcome.value.indexOf('已提交意见：') === 0) {
              if (ontologyOutcome.source === 'composer') ontologyReview.dismiss();
              var planFeedback = ontologyOutcome.source === 'composer'
                ? ontologyOutcome.value
                : ontologyOutcome.value.slice('已提交意见：'.length);
              card.stop(5);
              card.stop(6);
              thinking.finish();
              c.scroll();
              return { replan: true, feedback: planFeedback };
            } else {
              thinking.resume();
              thinking.add('已接收确认 · ' + ontologyOutcome.value);
              card.decision(5, '确认通过');
            }
            card.start(6);
          }
          if (i === 25) {
            card.wait(6);
            thinking.waitForUser();
            var architectureReview = architectureConfirmation();
            seg(c, architectureReview.node);
            c.scroll();
            var architectureDecision = await architectureReview.done;
            thinking.resume();
            thinking.add('已接收确认 · ' + architectureDecision);
            card.decision(6, architectureDecision === '采纳候选 v2' ? '采纳候选 v2' : '保留 v1');
          }
          c.scroll();
        }
        card.done(6);
        card.finish();
        thinking.finish();
        c.scroll();
        await c.sleep(520);

        if (BP()) BP().set('agent', 'done', 'Ready to try');
        if (window.FastSandbox && window.FastSandbox.state) {
          window.FastSandbox.state.generated = true;
          if (window.FastSandbox.emit) window.FastSandbox.emit();
        }

        var summary = el('div');
        c.host.appendChild(summary);
        var ruleImpact = decision && decision.indexOf('100 元') !== -1
          ? '采用较严格的 100 元门槛。财务人员仍会看到更多待复核项目，但自动处理的风险更低，适合先小范围试运行。'
          : decision && decision.indexOf('500 元') !== -1
            ? '采用 500 元自动放行门槛。常见的小额尾差会直接处理，财务人员只需关注超过门槛的项目，可以明显减少重复复核。'
            : decision && decision.indexOf('人工复核') !== -1
              ? '暂不自动放行。所有尾差继续交给财务人员判断，控制更稳妥，但日常复核工作量不会减少。'
              : '采用你输入的自定义口径。系统会按这条口径分流，符合条件的自动处理，其余项目保留给财务人员复核。';
        var architectureImpact = architectureDecision === '采纳候选 v2'
          ? '采用候选 v2。后续体验会以刚确认的原型和业务规则为准，Agent 与业务流程之间的配合更完整，也更符合本轮讨论结果。'
          : '保留 v1。现有使用方式保持稳定，新原型和规则中尚未兼容的部分暂不进入本轮 Agent，后续可以再单独评估。';
        await c.run(summary, [{ md:
          '### 刚才确认的选择\n\n' +
          '- **给财务关账人员的自动处理口径**：' + ruleImpact + '\n' +
          '- **给业务经办人与审核人的操作界面**：原型设计 v1 已确认。用户会通过清晰的工作台查看异常、追溯相关证据，并在需要时完成调账确认；关键步骤仍由人做最终判断。\n' +
          '- **给业务资料维护人员的统一信息基础**：对象集 v1 已确认。供应商、报价、合同和异常记录会按照同一套含义组织，减少不同人员查看同一信息时产生的理解偏差。\n' +
          '- **给后续 Agent 使用与迭代的整体方案**：' + architectureImpact + '\n\n' +
          '### 结论\n\n' +
          '这四项选择已经把“哪些可以自动做、哪些必须由人确认、用户在哪里操作、Agent 应该依据什么信息工作”说明清楚了。对业务人员来说，第一版会优先减少重复查找、比对和整理工作，同时保留关键判断的人工确认，不会把重要决策完全交给系统。\n\n' +
          '**Sourcing Strategy Agent v0.1** 已按这些选择完成生成。建议先用一两个真实案例试跑：观察推荐结果是否容易理解、异常信息是否完整、人工确认的位置是否合适。确认体验符合预期后，再逐步扩大使用范围。', gap: 260 }]);

        seg(c, deliverableInventory());
        seg(c, agentUseCard());
        c.scroll();
        return {};
      },
    };
  }

  /* ───────── ④ generate (+ ⑤ ready to try card) ───────── */
  function planGenerate(execCard) {
    return {
      process: async function (api) {
        await api.sleep(400);
        await api.W('任务已确认。我先补齐业务与体验方案，再进入技术设计和构建。');
        function startStep(index) { if (execCard) execCard.start(index); }
        function doneStep(index) { if (execCard) execCard.done(index); }
        if (FF()) FF().showTab(true);
        await api.sleep(250);
        startStep(0);
        await api.V({ id: 'g1', icon: 'context', label: '已完成用户故事设计', details: ['明确关联审查中不同角色的操作流程', '补充关键异常及其处理方式'], during: files(['Design plans/User story design v0.1.md'], 600) });
        doneStep(0);
        startStep(1);
        await api.V({ id: 'g2', icon: 'edit', label: '已完成业务规则方案设计', details: ['梳理异常判定规则', '定义容差放行与跨期处理规则'], during: files(['Design plans/Rule design v0.1.md'], 600) });
        doneStep(1);
        await api.W('用户故事与业务规则已经补齐，接下来把它们转化为可操作、可评审的体验方案。');
        startStep(2);
        await api.V({ id: 'g3', icon: 'edit', label: '已完成高保真交互原型设计', details: ['将用户故事转化为关键页面与交互', '补充异常状态和审核节点'], during: files(['Design plans/Prototype design v0.1.md'], 600) });
        doneStep(2);
        startStep(3);
        await api.V({ id: 'g4', icon: 'command', label: '已完成总体技术架构设计', details: ['综合原型与业务规则更新架构方案设计 v1', '明确本体和 Agent 的分工及整体交互方式'], during: files(['Design plans/Architecture design v2.md'], 600) });
        doneStep(3);
        await api.W('总体架构已经确定，继续细化技术方案并进入构建。');
        startStep(4);
        await api.V({ id: 'g5', icon: 'edit', label: '已完成详细技术方案设计', details: ['新增本体方案设计与 Agent 方案设计', '补充测试用例设计'], during: files(['Design plans/Ontology design v0.1.md', 'Design plans/Agent design v0.1.md', 'Design plans/Test cases v0.1.md'], 600) });
        doneStep(4);
        startStep(5);
        await api.V({ id: 'g6', icon: 'ontology', label: '已完成本体对象集构建', details: ['依据本体方案新增或修改对象集', '完成对象关系与 ERP 字段映射'], during: files(['Agent v0.1/Ontology stub.json'], 600) });
        doneStep(5);
        BP() && BP().set('onto', 'mock', 'Mock');
        BP() && BP().set('skill', 'mock', 'Mock');
        await api.W('本体对象集已经构建，最后生成智能体及配套能力并完成自测。');
        BP() && BP().set('agent', 'doing', 'Generating');
        startStep(6);
        await api.V({ id: 'g7', icon: 'skill', label: '已完成智能体及配套能力构建', details: ['生成或更新 Skill、MCP、知识库和 Agent', '完成 PCB 比价、异常替代和供应商对比自测', '登记 3 项 Mock 与后续替换条件'], during: files(['Agent v0.1/Agent spec v0.1.md', 'Agent v0.1/Mock register v0.1.md'], 600) });
        doneStep(6);
        if (execCard) execCard.finish();
        BP() && BP().set('agent', 'done', 'Ready to try');
        window.FastSandbox.state.generated = true;
        window.FastSandbox.emit();
        await api.sleep(300);
        if (FF()) FF().showTab(false);
      },
      segments: [{ md:
        '**Sourcing Strategy Agent v0.1** 已生成，可以试用了。\n\n' +
        '这一版有 **3 处 Mock**，我在每个回答里都会标注，之后逐项替换：\n\n' +
        '| Mock 项 | 现在是什么 | 之后替换成 |\n|---|---|---|\n' +
        '| 本体 | 由 ERP 字段字典生成 | 按真实数据校对，补「例外」属性 |\n' +
        '| Skill 规则 | 固定权重和阈值 | 可配置、可回测的规则 |\n' +
        '| ERP 连接 | 14 条样例报价 | 只读连接 ERP 实时接口 |\n\n' +
        '文件在 **Files → Deliverables → Agent v0.1**：[Agent spec](Agent spec v0.1.md) · [Mock register](Mock register v0.1.md) · [Ontology stub](Ontology stub.json)。', gap: 340 }],
      after: async function (c) {
        var card = el('div', 'ff-card ff-ready');
        card.innerHTML =
          '<div class="ff-head"><span class="ff-t">Sourcing Strategy Agent</span><span class="ff-chip"><i></i>READY TO TRY</span></div>' +
          '<div class="ff-ready-s">Agent v0.1 · 3 处 Mock · 已在右侧面板打开，试试这些问题：</div>' +
          '<div class="ff-prompts">' + window.FastAgentPanel.prompts.map(function (p) { return '<button type="button" class="ff-prompt" data-k="' + p.k + '">' + esc(p.q) + '</button>'; }).join('') + '</div>' +
          '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="open">打开 Agent 试用</button>' +
          '<button type="button" class="fm-btn" data-act="mocks">查看 Mock 清单</button></div>';
        card.addEventListener('click', function (e) {
          var b = e.target.closest('[data-act], .ff-prompt');
          if (!b) return;
          if (b.classList.contains('ff-prompt')) {
            window.FastAgentPanel.open('try');
            var btn = document.querySelector('.fa-prompt[data-k="' + b.getAttribute('data-k') + '"]');
            if (btn) btn.click();
          } else if (b.getAttribute('data-act') === 'promote') window.FastHandoff.start();
          else window.FastAgentPanel.open(b.getAttribute('data-act') === 'mocks' ? 'mocks' : 'try');
        });
        seg(c, card);
        window.FastAgentPanel.open('try');
        await c.sleep(300);
      },
    };
  }

  /* ───────── chain ───────── */
  function createLongTaskVersion(version, tasks, note, customName) {
    version = version || 1;
    tasks = tasks || [
      { title: '用户故事设计', desc: '明确各角色流程与关键异常处理。', agent: '场景需求Agent' },
      { title: '业务规则方案设计', desc: '梳理异常判定、容差放行与跨期规则。', agent: '业务规则设计Agent' },
      { title: '高保真交互原型设计', desc: '将用户故事转为可操作、可评审的原型。', agent: '场景需求Agent' },
      { title: '总体技术架构设计', desc: '基于原型和规则更新本体与 Agent 分工。', agent: '技术方案设计Agent' },
      { title: '详细技术方案设计', desc: '输出本体、Agent 与测试用例设计。', agent: '技术方案设计Agent' },
      { title: '本体对象集构建', desc: '依据本体方案新增或修改对象集。', agent: '本体构建Agent' },
      { title: '智能体及配套能力构建', desc: '构建 Skill、MCP、知识库与 Agent。', agent: '智能打造Agent' },
    ];
    var name = customName || 'v' + version;
    var normalizedTasks = tasks.map(function (task) {
      return typeof task === 'string'
        ? { title: task, desc: '按当前版本计划完成该项任务。', agent: 'AgentOS' }
        : task;
    });
    function cell(value) {
      return String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    }
    var taskRows = normalizedTasks.map(function (task, index) {
      return '| ' + (index + 1) + ' | **' + cell(task.title) + '** | ' + cell(task.desc) + ' | ' +
        cell(task.agent) + ' | 自动执行 | ' + (version === 1 && index === 0 ? '进行中' : '等待中') + ' |';
    }).join('\n');
    var versionStatus = version === 1 ? '执行中' : '待确认';
    var changeSummary = version === 1
      ? '首次确认的长任务执行计划。'
      : '根据客户侧大量需求修改，重新整理业务规则、交互原型、技术方案与智能体构建范围。';
    if (window.FastDocs) {
      window.FastDocs.register({
        name: name,
        folder: 'Long task',
        kind: 'md',
        deliverable: true,
        size: '2 KB',
        pages: '1 页',
        updated: '今天',
        author: 'AgentOS',
        md: '# Long task · ' + name + '\n\n' +
          '> **版本状态：' + versionStatus + '** · ' + normalizedTasks.length + ' 项任务 · 创建于今天\n\n' +
          '## 版本信息\n\n' +
          '| 字段 | 内容 |\n|---|---|\n' +
          '| 版本 | ' + name + ' |\n' +
          '| 状态 | ' + versionStatus + ' |\n' +
          '| 创建者 | AgentOS |\n' +
          '| 任务数量 | ' + normalizedTasks.length + ' 项 |\n' +
          '| 版本说明 | ' + changeSummary + ' |\n' +
          (note ? '| 调整依据 | ' + cell(note) + ' |\n' : '') +
          '\n## 任务清单\n\n' +
          '| 序号 | 任务标题 | 任务说明 | 执行 Agent | 执行方式 | 当前状态 |\n' +
          '|---:|---|---|---|---|---|\n' + taskRows + '\n\n' +
          '## 执行约定\n\n' +
          '- **自动执行**：AgentOS 按任务顺序继续处理，并同步更新简版任务卡。\n' +
          '- **我来审核**：任务产出后暂停，等待确认或补充修改意见。\n' +
          '- 计划发生调整时，新版本会继续保存在 `Long task` 文件夹中，旧版本保留用于追溯。\n',
      });
    }
    if (FF()) FF().addDeliverable('Long task/' + name);
  }

  function planRevisionTurn(feedback) {
    var comparison = revisedPlanConfirmation();
    return {
      dynamicProcess: true,
      fastThinking: true,
      process: async function (api) {
        await api.sleep(160);
        await api.W('收到新的调整要求。先停止当前版本，再重新检查剩余任务的依赖关系。');
        await api.V({ id: 'revise-1', icon: 'context', label: '已识别计划调整意图', details: [
          '当前执行版本：Long task v1',
          '客户侧需求发生大量修改',
          '业务规则、交互原型和技术框架均受到影响',
        ] });
        await api.W('正在归纳修改范围，并重新建立业务规则、体验设计与技术方案之间的依赖关系。');
        await api.V({ id: 'revise-2', icon: 'edit', label: '已生成 Long task v2', details: [
          '业务规则方案与交互原型需要更新',
          '总体技术框架与详细技术方案需要重新校准',
          '完成设计更新后重新构建智能体及配套能力',
        ] });
        createLongTaskVersion(2, comparison.tasks, feedback);
      },
      segments: [
        { md:
          '我已把这次客户侧的大量修改整理为三类影响：\n\n' +
          '- **业务规则需要重整**：原有判断口径、异常处理和流程约束需要重新核对。\n' +
          '- **体验与技术设计需要同步更新**：交互原型、总体技术框架和详细方案必须保持一致。\n' +
          '- **智能体需要重新构建验证**：设计更新后，再调整 Skill、MCP、知识库和 Agent。\n\n' +
          '基于这些变化，我重新生成了 **Long task v2**：', gap: 260 },
        { node: comparison.node, gap: 180 },
      ],
      after: async function () {
        return comparison.done;
      },
    };
  }

  function selectedPlanExecution(version) {
    var titles = version === 'v2' ? [
      '更新业务规则方案与设计',
      '更新高保真交互原型设计',
      '更新总体技术框架设计',
      '详细技术方案设计',
      '智能体及配套能力构建'
    ] : [
      '用户故事设计',
      '业务规则方案设计',
      '高保真交互原型设计',
      '总体技术架构设计',
      '详细技术方案设计',
      '本体对象集构建',
      '智能体及配套能力构建',
    ];
    var card = executionTaskCard(titles);
    var thinking = executionThinkingBlock();
    if (version === 'v1') {
      for (var i = 0; i < 5; i++) card.done(i);
    }
    return {
      dynamicProcess: true,
      fastThinking: true,
      process: async function (api) {
        await api.sleep(160);
        await api.W(version === 'v2'
          ? '已确认执行 Long task v2，正在把五项更新任务编排为新的执行流程。'
          : '已确认恢复 Long task v1，正在接续已完成的五项任务。');
        await api.V({ id: 'resume-plan', icon: 'context', label: '已切换任务流程', details: [
          version === 'v2' ? '按客户最新需求重新执行五项更新任务' : '前五项任务沿用现有结果',
          version === 'v2' ? '从业务规则更新开始逐项向下执行' : '继续执行原任务 6 与任务 7',
          '后续状态将继续同步到简版任务卡',
        ] });
      },
      segments: [{ node: card.node, gap: 160 }],
      after: async function (c) {
        activeExecutionCard = card;
        seg(c, thinking.node);
        card.start(version === 'v2' ? 0 : 5);
        var messages = version === 'v2' ? [
          '正在重新提取客户变更中的业务规则',
          '正在更新异常口径、流程约束与验收条件',
          '正在将新规则映射到关键页面与交互状态',
          '正在更新高保真原型并检查流程完整性',
          '正在重新划分系统边界与 Agent 职责',
          '正在更新总体技术框架与模块依赖',
          '正在展开接口、本体、测试用例等详细设计',
          '正在校验详细方案与最新原型的一致性',
          '正在重新编排 Skill、MCP、知识库与 Agent',
          '正在运行客户变更后的核心场景测试',
        ] : [
          '正在恢复本体对象集构建',
          '正在校验对象关系与字段映射',
          '本体对象集构建已完成',
          '正在编排 Skill、MCP、知识库与 Agent',
          '正在运行 Agent 核心场景测试',
        ];
        for (var j = 0; j < messages.length; j++) {
          await c.sleep(700);
          thinking.add(messages[j]);
          if (version === 'v2' && j % 2 === 1) {
            var finishedStep = Math.floor(j / 2);
            card.done(finishedStep);
            if (finishedStep + 1 < titles.length) card.start(finishedStep + 1);
          } else if (version === 'v1' && j === 2) {
            card.done(5);
            card.start(6);
          }
        }
        if (version === 'v1') card.done(titles.length - 1);
        card.finish();
        thinking.finish();
        await c.sleep(420);
        await say(c, '已按 **Long task ' + version + '** 完成剩余任务，执行结果已同步到当前会话。');
        seg(c, agentUseCard());
        c.scroll();
      },
    };
  }

  async function runIntentThenGenerate(chat) {
    var res = null;
    var intent = planIntent(), after = intent.after;
    intent.after = async function (c) { res = await after(c); return res; };
    await chat.run(intent);
    if (!res || res.picked !== 'confirm') return;
    createLongTaskVersion(1);
    if (chat.postUser) chat.postUser('确认开始。对任务无异议。');
    await new Promise(function (r) { setTimeout(r, 360); });
    activeExecutionCard = null;
    var executionResult = await chat.run(planExecutionKickoff());
    if (!executionResult || !executionResult.replan) return;
    await new Promise(function (r) { setTimeout(r, 320); });
    var selectedVersion = await chat.run(planRevisionTurn(executionResult.feedback));
    if (!selectedVersion) return;
    if (chat.postUser) chat.postUser(selectedVersion === 'v2' ? '开始执行 Long task v2。' : '恢复执行原计划 v1。');
    await new Promise(function (r) { setTimeout(r, 320); });
    await chat.run(selectedPlanExecution(selectedVersion));
  }

  async function start() {
    var chat = window.FastChat;
    while (chat.isBusy()) await new Promise(function (r) { setTimeout(r, 150); });
    await new Promise(function (r) { setTimeout(r, 500); });
    await chat.run(planDraft());
    await new Promise(function (r) { setTimeout(r, 500); });
    await runIntentThenGenerate(chat);
  }

  async function previewTaskCard() {
    var chat = window.FastChat;
    if (!chat) return;
    while (chat.isBusy()) await new Promise(function (r) { setTimeout(r, 150); });
    await runIntentThenGenerate(chat);
  }

  window.FastFlow = {
    start: start,
    previewTaskCard: previewTaskCard,
    taskPlanCard: taskPlanCard,
    executionTaskCard: executionTaskCard,
    executionThinkingBlock: executionThinkingBlock,
    deliverableConfirmation: deliverableConfirmation,
    deliverableSummary: deliverableSummary,
    createLongTaskVersion: createLongTaskVersion,
  };

  if (TASK_CARD_PREVIEW_LOCK) {
    window.addEventListener('load', function () {
      setTimeout(previewTaskCard, 180);
    });
  }
})();
