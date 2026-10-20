/**
 * superagent.html ONLY — the "returning user" page (not loaded by superagent-fast.html).
 *
 * Story: the user comes back to a scene that is half-way through: requirements, knowledge and the three plan documents
 * are done, the ontology is being built, Skills / MCP / Agent have not started. Nothing starts from zero:
 *   · Scenarios: A1 with T1 (we are inside the T1 room), blueprint with real states (Build ontology = in progress)
 *   · Files: 9 materials + the three plan documents
 *   · Conversations: five existing tabs (one per angle) + a "回顾" tab the Agent opens by itself
 * The recap tab (official tone): progress, recent document changes, assets, open issues with suggestions, the five sessions.
 *
 * Reuses the Fast engine (fast-*.js); only the seed below is specific to this page. All content is simulated.
 */
(function () {
  'use strict';
  var CV = window.FastConversations, CH = window.FastChat;
  if (!CV || !CH) return;

  var T1 = 'T1 Sourcing strategy (v2.1 new step)';
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var DAY = 86400000;

  /* ───────── 1 · the workspace is half-way through ───────── */
  function seedWorkspace() {
    var FD = window.FastDocsData || [], FF = window.FastFiles;

    /* the five decisions were confirmed at the time (D1 = the recommended weights) */
    if (window.FastPlanData && window.FastDocs) {
      var DEC = window.FastPlanData.decisions, pick = {};
      DEC.forEach(function (d) { pick[d.id] = 0; });
      window.FastPlanData.picks = pick;
      window.FastDocs.append('Product plan v0.1.md',
        '\n## 8. 已确认决策\n\n| 决策 | 结论 |\n|---|---|\n' +
        DEC.map(function (d) { return '| ' + d.id + ' ' + d.title + ' | ' + d.opts[0].t + ' |'; }).join('\n') + '\n');
    }

    if (FF) {
      FD.filter(function (d) { return !d.deliverable && d.folder; }).forEach(function (d) { FF.addMaterial(d.folder + '/' + d.name); });
      ['Design plans/Product plan v0.1.md', 'Design plans/Ontology plan v0.1.md', 'Design plans/Agent plan v0.1.md']
        .forEach(function (p) { FF.addDeliverable(p); });
      var ft = $('.sidebar-tab[data-tab="files"]'); if (ft) ft.classList.remove('has-dot');
    }

    if (window.FastScenes) window.FastScenes.show('a1', { kids: true });

    /* we are inside the T1 room: dropdown label + title (right panel stays closed) */
    var item = document.querySelector('.ov-menu-item[data-scene="biz-t1"]');
    if (item) item.click();
    var h = $('#center-head-title'); if (h) h.textContent = T1;
    if (window.WorkshopPanels) window.WorkshopPanels.setRightOpen(false);   // wide chat for the recap tables

    /* blueprint: 3 of 6 steps done, the ontology is being built, the rest has not started */
    var BP = window.FastBlueprint;
    if (BP) {
      BP.set('req', 'done', 'Defined');
      BP.set('know', 'done', 'Indexed');
      BP.set('doc', 'done', 'Confirmed');
      BP.set('onto', 'doing', 'Building');
      BP.set('skill', 'todo', 'Not built');
      BP.set('agent', 'todo', 'Not built');
    }

    /* already in the room — the sidebar "Continue crafting" must not restart the T1 journey */
    var host = $('#scene-cards');
    if (host) host.addEventListener('click', function (e) {
      if (e.target.closest('[data-fast-scene="a1"] .scene-build, [data-fast-scene="a1"] .scene-biz-build')) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ───────── 2 · five existing conversations ───────── */
  var SESSIONS = [
    { key: 's1', title: '需求梳理', mode: 'fast', ago: 8 * DAY, stop: '需求已定义', time: '10:24',
      u: '我想做一个供应商寻源的 Agent，新品导入时帮采购筛选候选供应商，并对比报价。',
      a: '需求已经梳理清楚：\n\n| 维度 | 内容 |\n|---|---|\n| 目标 | 新品导入时筛选候选供应商、对比报价 |\n| 使用者 | 采购、品质部 |\n| 物料范围 | 电子元器件、结构件 |\n| 覆盖环节 | 寻源 → 比价 → 准入评审 |\n\n蓝图里的 **Requirements** 已标为完成。' },
    { key: 's2', title: '资料整理', mode: 'steps', ago: 6 * DAY, stop: '9 份资料已索引', time: '15:02',
      u: '我上传了合同、准入标准和 ERP 导出，先帮我看一下哪些有用。',
      a: '9 份资料都已读取并索引：\n\n- 历史合同 3 份\n- 准入标准 2 份，其中 [Admission standard v3.2](Supplier admission standard v3.2.md) 是现行版\n- 流程与访谈记录 3 份\n- ERP 报价导出 1 份\n\n后面的方案和本体都会以这些资料为依据。' },
    { key: 's3', title: '评分权重与方案', mode: 'fast', ago: 5 * DAY, stop: '5 项决策已确认，方案定稿', time: '14:08',
      u: '质量比交期更重要，评分权重能改成质量 45、交期 30、价格 15、稳定性 10 吗？',
      a: '可以。我已经把 [Product plan v0.1](Product plan v0.1.md) 里的 **D1 评分权重** 改成 45 / 30 / 15 / 10，[Agent plan v0.1](Agent plan v0.1.md) 里的打分 Skill 也同步了。\n\n现行准入标准是 35 / 25 / 25 / 15，两者不一致，建议和品质部确认后再定稿。' },
    { key: 's4', title: '本体对象设计', mode: 'steps', ago: 4 * DAY, stop: '5 个对象已定，关系梳理中', time: '11:15',
      u: '本体里先确定哪些对象？和 ERP 的数据怎么对应？',
      a: '按 [Ontology plan v0.1](Ontology plan v0.1.md) 先确定 **5 个对象**：\n\n| 对象 | 说明 | 数据来源 |\n|---|---|---|\n| Supplier | 供应商主数据，含「例外」标记 | 供应商清单 |\n| Part | 料号与品类 | 物料主档 |\n| Quote | 报价，含税、币种、起订量 | ERP 报价导出 |\n| Contract | 合同条款与有效期 | 历史合同 |\n| Incident | 质量与交期异常 | 异常记录 |\n\n对象已经定下来，对象之间的关系和动作还在梳理。' },
    { key: 's5', title: 'ERP 字段映射', mode: 'steps', ago: 3 * DAY, stop: '已映射 8 / 13 个字段', time: '17:36',
      u: 'ERP 报价导出里的字段，怎么映射到本体？',
      a: '[ERP quotation export 2026-Q3](ERP quotation export 2026-Q3.xlsx) 共 13 个字段，目前 **8 个已映射**：\n\n| 状态 | 字段 |\n|---|---|\n| 已映射（8） | 供应商编码、料号、含税单价、币种、起订量、报价日期、有效期、交期 |\n| 待映射（5） | 税率、付款条件、阶梯价、折扣、备注 |\n\n待映射的 5 个字段需要业务确认口径，确认之后继续补关系和动作。' },
  ];

  function seedConversations() {
    var list = [{ key: 'recap', title: '回顾', mode: 'fast', ago: 0, n: 0, preview: '欢迎回来 · 做到哪了 · 最近谁改过什么', nodes: [] }];
    SESSIONS.forEach(function (s) {
      list.push({ key: s.key, title: s.title, mode: s.mode, ago: s.ago, preview: s.stop,
        nodes: CH.staticThread([{ u: s.u }, { a: s.a, time: s.time }]) });
    });
    CV.seed(list, 0);
  }

  /* the "摘要" button on the tab bar (js/fast-summary.js): curated per tab so the demo reads like a real digest */
  if (window.FastSummary) {
    var FS = window.FastSummary;
    FS.provide('需求梳理', {
      asks: ['建设供应商寻源 Agent，在新品导入时自动筛选候选供应商并完成报价对比', '首期聚焦电子元器件和结构件，服务采购与品质协作'],
      did: ['将需求归纳为目标、使用者、物料范围、覆盖环节 4 个维度', '将业务流程明确为寻源 → 比价 → 准入评审'],
      talked: ['采购负责发起寻源与确认推荐结果，品质部负责复核准入条件', '暂不覆盖合同审批、签署及供应商现场审核'],
      out: ['场景需求说明已形成', 'Requirements 已在蓝图中标记为完成'] });
    FS.provide('资料整理', {
      asks: ['审阅历史合同、准入标准、流程记录和 ERP 报价导出，判断哪些资料可用于方案设计'],
      did: ['读取并索引 9 份资料：合同 3、准入标准 2、流程记录 3、ERP 导出 1', '识别 Supplier admission standard v3.2 为当前有效版本'],
      talked: ['合同用于提取价格与交期条款，准入标准用于硬性条件校验', 'ERP 导出包含 13 个报价字段，可作为本体与数据连接的基础'],
      out: ['资料目录与来源索引已建立', 'Business knowledge 已在蓝图中标记为已索引'] });
    FS.provide('评分权重与方案', {
      asks: ['将评分权重调整为质量 45、交期 30、价格 15、稳定性 10', '确认例外供应商、硬性条件处理和首批覆盖品类'],
      did: ['Product plan：D1 评分权重更新为 45 / 30 / 15 / 10', 'Agent plan：score-suppliers Skill 同步新权重', '将 5 项关键决策写入方案并完成定稿'],
      talked: ['新权重与现行准入标准 35 / 25 / 25 / 15 不一致', '建议由品质部确认权重口径；确认前保留差异提示'],
      out: ['Product plan v0.1（已更新）', 'Agent plan v0.1（已更新）', '三份设计方案已确认'] });
    FS.provide('本体对象设计', {
      asks: ['明确本体首批对象，并说明对象与 ERP 数据的对应关系'],
      did: ['确定 Supplier、Part、Quote、Contract、Incident 5 个核心对象', 'Quote 增加含税价、币种与 CNY 折算口径', '完成 8 / 13 个 ERP 字段映射'],
      talked: ['逐项确认 5 个对象的数据来源、主键和用途', '对象关系与筛选、比价、替代推荐动作仍需补全'],
      out: ['Ontology plan v0.1', '本体对象清单与字段映射草稿'] });
    FS.provide('ERP 字段映射', {
      asks: ['将 ERP 报价导出字段映射到 Quote、Supplier 和 Part 对象'],
      did: ['完成供应商编码、料号、含税单价、币种、起订量等 8 个字段映射', '标记 5 个待确认字段并记录负责人'],
      talked: ['税率、付款条件、阶梯价、折扣、备注尚缺统一业务口径', '待 IT 与采购确认后继续补充对象关系和动作'],
      out: ['ERP → 本体字段映射表（8 / 13）', '待确认字段清单（5 项）'] });
    FS.provide('回顾', {
      asks: [],
      did: ['汇总离开 3 天期间的 4 条团队动态', '核对蓝图进度：已完成 3 / 6，当前处于 Build ontology', '关联并整理 5 个历史会话'],
      talked: ['ERP 映射剩余 5 个字段，需采购与 IT 明确口径', '评分权重等待品质部确认', '对象关系和动作完成后即可进入 Skills · MCP'],
      out: ['当前进度、近期改动与遗留事项回顾'] });
  }

  /* ───────── 3 · the Agent answers from this scene's state ───────── */
  var MD_ONTO =
    '**Build ontology** 目前的进度：\n\n' +
    '| 事项 | 状态 |\n|---|---|\n' +
    '| 对象（Supplier · Part · Quote · Contract · Incident） | 已确定 |\n' +
    '| ERP 字段映射 | 8 / 13，待映射：税率、付款条件、阶梯价、折扣、备注 |\n' +
    '| 对象之间的关系 | 草稿，待补全 |\n' +
    '| 动作（筛选、比价、替代推荐） | 未开始 |\n\n' +
    '建议先和业务确认 5 个待映射字段的口径，再补关系和动作。本体完成后，就可以进入 Skills · MCP。';
  var MD_DECISIONS =
    '目前还有两件事需要确认：\n\n' +
    '| 事项 | 现状 | 建议 |\n|---|---|---|\n' +
    '| 评分权重 | 方案是 45 / 30 / 15 / 10，现行准入标准是 35 / 25 / 25 / 15 | 和品质部确认后定稿 |\n' +
    '| 例外供应商 | Kaisheng、Mingda、Ruifeng 长期按例外合作 | 在本体里增加「例外」属性，推荐时提示风险 |';
  var MD_PROGRESS =
    '**T1 Sourcing strategy** 目前 6 步中完成了 3 步：\n\n' +
    '| 步骤 | 状态 |\n|---|---|\n' +
    '| Requirements | 已完成 |\n| Business knowledge | 已索引 |\n| Design plans | 已确认 |\n' +
    '| Build ontology | **进行中** |\n| Skills · MCP | 未开始 |\n| Generate Agent | 未开始 |\n\n' +
    '接下来的重点是把本体做完。想先处理哪一项，直接告诉我。';
  var MD_MOCK = '目前还没有生成 Agent，所以暂时没有 Mock。\n\n本体、Skill 规则和数据连接会在后面几步里逐项做出来；其中暂时由 AI 模拟的部分，我会在对应位置明确标注。';

  CV.reply = function (text) {
    var md = /mock|占位/i.test(text) ? MD_MOCK
      : /本体|对象|字段|映射|做完|关系|ERP/i.test(text) ? MD_ONTO
      : /权重|准入|决策|待确认|确认/.test(text) ? MD_DECISIONS
      : MD_PROGRESS;
    return {
      md: md,
      process: async function (api) {
        await api.sleep(350);
        await api.W('先看一下「T1」现在的进度，再回答你。');
        await api.sleep(300);
        await api.V({ id: 'rp-ctx', icon: 'context', label: '已读取场景状态 · T1', details: ['蓝图：6 步中完成 3 步', '正在进行：Build ontology', '资料 9 份 · 方案文档 3 份'] });
        await api.sleep(320);
      },
    };
  };

  /* ───────── 4 · the Agent opens the recap by itself ───────── */
  /* Activity avatars — same idea as the red “K” circle next to ke.wang */
  var ACTIVITY = [
    { what: '<a class="chat-cite" href="Product plan v0.1.md"><span>Product plan</span></a>：评分权重改为 45 / 30 / 15 / 10', name: '李婷', role: '采购', initial: '李', color: '#e24b4a', ago: '5 天前' },
    { what: '<a class="chat-cite" href="Agent plan v0.1.md"><span>Agent plan</span></a>：打分 Skill 同步新权重', name: 'AgentOS', role: '', initial: 'A', color: '#1f82eb', ago: '5 天前' },
    { what: '<a class="chat-cite" href="Ontology plan v0.1.md"><span>Ontology plan</span></a>：5 个对象；Quote 含税 / CNY；映射 8 / 13', name: '陈浩', role: '品质', initial: '陈', color: '#2f9e6b', ago: '4 天前' },
    { what: '补齐 ERP 报价字段说明（仍差 5 个）', name: '赵敏', role: 'IT', initial: '赵', color: '#7b6ad6', ago: '3 天前' },
  ];

  function activityCard() {
    var box = document.createElement('div');
    box.className = 'rt-act';
    box.innerHTML =
      '<table class="rt-act-tbl"><thead><tr><th>做了什么</th><th>谁</th><th>时间</th></tr></thead><tbody>' +
      ACTIVITY.map(function (a) {
        return '<tr><td class="rt-act-w">' + a.what + '</td>' +
          '<td class="rt-act-who"><span class="rt-ava" style="background:' + a.color + '" aria-hidden="true">' + esc(a.initial) + '</span>' +
          '<span class="rt-act-n">' + esc(a.name) + (a.role ? ' · ' + esc(a.role) : '') + '</span></td>' +
          '<td class="rt-act-t">' + esc(a.ago) + '</td></tr>';
      }).join('') + '</tbody></table>';
    box.addEventListener('click', function (e) {
      var a = e.target.closest('a.chat-cite');
      if (!a || !window.FastDocs) return;
      e.preventDefault();
      window.FastDocs.open(a.getAttribute('href'));
    });
    return box;
  }

  function sessionCard() {
    var box = document.createElement('div');
    box.className = 'ff-card rt-card';
    box.innerHTML =
      '<div class="ff-head"><span class="ff-t">你有 5 个会话</span><span class="ff-h">点一下回到对应会话</span></div>' +
      '<div class="rt-list">' + SESSIONS.slice().reverse().map(function (s) {
        return '<button type="button" class="rt-row" data-rt-open="' + s.key + '">' +
          '<span class="rt-main"><span class="rt-t">' + esc(s.title) + '</span><span class="rt-d">停在：' + esc(s.stop) + '</span></span>' +
          '<span class="rt-time">' + Math.round(s.ago / DAY) + ' 天前</span>' +
          '<svg class="rt-go" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>';
      }).join('') + '</div>';
    return box;
  }
  function nextButtons() {
    var box = document.createElement('div');
    box.className = 'fm-btns rt-next';
    ['本体还差哪些没做完？', '评分权重还有什么待确认？', '蓝图现在进展到哪了？'].forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fm-btn'; b.setAttribute('data-cv-fill', t); b.textContent = t;
      box.appendChild(b);
    });
    return box;
  }

  function runRecap() {
    return CH.run({
      process: async function (api) {
        await api.sleep(500);
        await api.W('你离开了几天，先看做到哪了、最近谁改过什么。');
        await api.sleep(320);
        await api.V({ id: 'rc1', icon: 'search', label: '已汇总最近动态', details: ['3 人有过改动 · 共 4 条', 'Product / Agent / Ontology plan'] });
        await api.sleep(280);
        await api.V({ id: 'rc2', icon: 'context', label: '已核对当前进度', details: ['蓝图 3 / 6 · Build ontology', 'Skill · MCP · Agent 未开始'] });
        await api.sleep(280);
        await api.V({ id: 'rc3', icon: 'context', label: '已汇总 5 个会话', details: SESSIONS.map(function (s) { return s.title + ' · ' + s.stop; }) });
        await api.sleep(420);
      },
      segments: [
        { md:
          '欢迎回来。你上次离开是 **3 天前**。\n\n' +
          '**做到哪了**\n\n' +
          '蓝图 **3 / 6** · 正在 **Build ontology**（对象 5 个已定，ERP 字段 8 / 13）· 下一步 Skills · MCP → Agent\n\n' +
          '**最近做了什么**', gap: 280 },
      ],
      after: async function (c) {
        var act = document.createElement('div');
        act.className = 'ao-seg stream-enter';
        act.appendChild(activityCard());
        c.host.appendChild(act);
        c.scroll();
        await c.sleep(280);
        var part = document.createElement('div');
        c.host.appendChild(part);
        await c.run(part, [{ md:
          '**还差什么**\n\n' +
          '- ERP 映射还差 5 个字段（税率、付款条件、阶梯价、折扣、备注）\n' +
          '- 评分权重待品质确认（方案 45/30/15/10 vs 准入标准 35/25/25/15）\n' +
          '- 对象关系和动作写完后，即可进入 Skills · MCP\n\n' +
          '下面是你的 5 个会话，点一下可以回到上次停下的地方：', gap: 320 }]);
        var seg = document.createElement('div');
        seg.className = 'ao-seg stream-enter';
        seg.appendChild(sessionCard());
        c.host.appendChild(seg);
        c.scroll();
        await c.sleep(280);
        var seg2 = document.createElement('div');
        seg2.className = 'ao-seg stream-enter';
        seg2.appendChild(nextButtons());
        c.host.appendChild(seg2);
        c.scroll();
        return null;
      },
    });
  }


  /* ───────── 5 · customer feedback → related content follows (shared: js/fast-change.js) ───────── */
  if (window.FastChange) {
    window.FastChange.setMode('building');
    window.FastChange.install(CV);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rt-open]');
    if (b) CV.open(b.getAttribute('data-rt-open'));
  });

  seedWorkspace();
  seedConversations();
  if (!new URLSearchParams(location.search).has('asset')) setTimeout(runRecap, 600);
})();
