/**
 * Journey 3 — Demo 转生产.
 *
 * 1) Space（未定格）→ 进入故事线 2 结尾；发送后锁定 J2 结束态
 * 2) Space（已定格）→ Demo 已给 HRVP/研发总监演示…；发送后建议先做产品方案
 * 3) Space（已建议产品方案）→ 「先做产品方案」；发送后深度思考 + 长任务清单（开始执行）
 * 4) Space（产品方案完成）→ 对焦反馈改 To-be/用户故事 → 画布升 V4
 * 5) Space（画布 V4 已定稿）→ 梳理业务规则方案 → 【规则方案设计v1】
 * 6) Space（规则定稿）→ 生产级技术方案 + 验收测试用例长任务卡
 * 7) Space（技术方案确认）→ 构建生产级本体对象集 v3，自动打开右侧对象集画板
 * 8) Space（本体调试反馈）→ 对象集补「入职折算系数」升 v4，待发布标签可切换已发布
 * 9) Space（对象集调试确认）→ 校验对象集与前置依赖 → Skill/MCP/知识库/智能体组装长任务卡
 *    确认执行后两项任务全自动完成 → 产出 Agent v3（绑定已发布对象集v4）+ Agent调试 / 本体对象集入口
 * 10) Space（联调发现问题）→ 跨部门借调 / 工时占比联动变更 · 五步长任务（任务1–2停下审核，3–5自动继续）
 */
(function () {
  'use strict';

  var SNAPSHOT_PROMPT =
    '进入故事线 2 的结尾：把工作台切到【季度绩效配额核算与自评答疑】Demo 已跑通并完成小修小补后的结束态。';

  var KICKOFF_PROMPT =
    '刚才的Demo给HRVP和研发总监演示过了，客户决定正式立项做生产交付，我们现在开始正式打造。';

  var PRODUCT_PROMPT = '先做产品方案';

  var FOCUS_PROMPT =
    '和业务方过完原型了，他们在To-be和用户故事里要补一个‘员工对初评结果有异议时发起复核说明’的环节，帮我把To-be和用户故事改一下';

  var RULES_PROMPT =
    '产品方案业务方已经定稿了，现在帮我把里面涉及的绩效核算、配额校验和异议复核判定的业务规则方案完整梳理出来。';

  var TECH_PROMPT =
    '产品方案和业务规则都定稿了，现在帮我把生产级的技术方案和验收测试用例做出来。';

  var ONTO_BUILD_PROMPT =
    '技术方案确认了，先把生产级的本体对象构建出来。我要先去调试里面的实体关系，配合规则和动作。';

  var ONTO_TWEAK_PROMPT =
    '刚才在本体调试时发现，年中入职员工需要按在岗天数折算考核权重，帮我在对象集的员工对象上补上‘入职折算系数’属性和对应计算规则。';

  var AGENT_ASSEMBLY_PROMPT =
    '本体对象集已经调试确认了，现在agent的方案把配套的skill，MCP，知识库或智能体构建组装出来';

  var SYNC_CHANGE_PROMPT =
    '刚才联调测试发现跨部门借调的流程和规则有问题，需要做一轮联动调整：1）流程与交互上（需求变化），跨部门或多项目人员不能只让单一主管初评，在员工自评后必须先增加‘各项目经理填写项目工时占比与项目贡献评语’的人机协同节点和对应交互页面；2）业务规则上（规则变化），员工最终绩效得分改为按各项目工时占比加权折算，且任一项目工时占比低于20%的不参与权重折算、仅作参考评语。帮我把这串变更从产品方案、业务规则到技术方案、本体和智能体全部同步改过来。';

  var SYNC_CHANGE_TASKS = [
    {
      title: '更新业务协同与交互方案',
      desc: '修改【To-be设计】【用户故事设计】【原型设计】。',
      agent: '场景需求Agent',
      status: '停下审核',
      gate: true,
    },
    {
      title: '更新业务规则方案',
      desc: '修改【规则方案设计】。',
      agent: '业务规则设计Agent',
      status: '停下审核',
      gate: true,
    },
    {
      title: '同步更新技术实现方案与测试用例',
      desc: '修改【架构方案设计】【本体方案设计】【Agent方案设计】【测试用例设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '迭代更新本体对象集',
      desc: '修改【对象集】。',
      agent: '本体构建Agent',
      status: '自动继续',
    },
    {
      title: '迭代更新智能体及配套组件',
      desc: '修改【Skill】【Agent】。',
      agent: '智能体打造Agent',
      status: '自动继续',
    },
  ];

  var AGENT_ASSEMBLY_TASKS = [
    {
      title: '构建生产级智能体配套组件',
      desc: '修改【Skill】【知识库】、新增【MCP】。',
      agent: '智能体打造Agent',
      status: '自动继续',
    },
    {
      title: '构建生产级智能体并完成组装绑定',
      desc: '修改【Agent】并绑定【对象集v4】及配套组件。',
      agent: '智能体打造Agent',
      status: '自动继续',
    },
  ];

  var TECH_TASKS = [
    {
      title: '继承并补齐生产级总体架构方案',
      desc: '修改【架构方案设计】。从 Demo 架构继承升级，面向生产部署补齐边界与验收口径。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '继承并补齐生产级本体详细方案',
      desc: '条件：现有架构包含本体时执行。修改【本体方案设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '继承并补齐生产级智能体及配套组件详细方案',
      desc: '条件：现有架构包含智能体时执行。修改【Agent方案设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '基于升级后的完整方案新增场景验收测试用例',
      desc: '新增【测试用例设计】。覆盖核算、配额、异议复核与校准主路径。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
  ];

  var PRODUCT_TASKS = [
    {
      title: '设计未来业务人机协同流程（To-be）',
      desc: '写入【场景定义画布】To-be 章节。',
      agent: '场景需求Agent',
      status: '自动继续',
    },
    {
      title: '设计人机交互用户故事旅程',
      desc: '写入【场景定义画布】用户故事章节。',
      agent: '场景需求Agent',
      status: '停下审核',
      gate: true,
    },
    {
      title: '设计视觉规范与高保真交互原型',
      desc: '新增【原型设计v1】。',
      agent: '场景需求Agent',
      status: '自动继续',
    },
  ];

  var snapshotReady = false;
  var kickoffDone = false;
  var productPlanStarted = false;
  var productExecStarted = false;
  var productPlanDone = false;
  var focusReviseDone = false;
  var rulesPlanDone = false;
  var techPlanStarted = false;
  var techExecStarted = false;
  var techExecDone = false;
  var ontoBuildDone = false;
  var ontoTweakDone = false;
  var agentAssemblyPlanStarted = false;
  var agentAssemblyExecStarted = false;
  var agentAssemblyDone = false;
  var syncChangePlanStarted = false;
  var syncChangeExecStarted = false;
  var lastBoundary = '';
  var lastStoryNote = '';
  var OBJECT_SET_V3 = '对象集v3';
  var OBJECT_SET_V4 = '对象集v4';
  var OBJECT_SET_V5 = '对象集v5';
  var currentObjectSetName = OBJECT_SET_V3;
  var PROJECT_HOURS_FLOW =
    '跨部门/多项目人员：员工自评后，须先由各项目经理填写「项目工时占比」与「项目贡献评语」，再进入主管初评；不可仅由单一主管初评。';
  var PROJECT_HOURS_RULE =
    '最终绩效得分按各项目工时占比加权折算；任一项目工时占比低于 20% 的不参与权重折算，仅作参考评语。';

  function onJourney3() {
    return !!(window.FastJourneyRoute && window.FastJourneyRoute.get() === '3');
  }

  function norm(text) {
    return String(text || '').replace(/\s+/g, '');
  }

  function appendNode(ctx, node) {
    var segment = document.createElement('div');
    segment.className = 'ao-seg stream-enter';
    segment.appendChild(node);
    ctx.host.appendChild(segment);
    ctx.scroll();
  }

  function matchesSnapshot(text) {
    if (!onJourney3() || snapshotReady) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(SNAPSHOT_PROMPT)) return true;
    return n.indexOf('故事线2') !== -1 &&
      (n.indexOf('结尾') !== -1 || n.indexOf('结束态') !== -1);
  }

  function matchesKickoff(text) {
    if (!onJourney3() || !snapshotReady || kickoffDone) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(KICKOFF_PROMPT)) return true;
    return n.indexOf('正式立项') !== -1 &&
      n.indexOf('生产交付') !== -1 &&
      (n.indexOf('正式打造') !== -1 || n.indexOf('Demo') !== -1);
  }

  function matchesProduct(text) {
    if (!onJourney3() || !kickoffDone || productPlanStarted) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(PRODUCT_PROMPT)) return true;
    return n.indexOf('先做产品方案') !== -1 ||
      (n.indexOf('产品方案') !== -1 && (n.indexOf('共创') !== -1 || n.indexOf('对齐') !== -1 || n.indexOf('开始') !== -1));
  }

  function matchesFocusRevise(text) {
    if (!onJourney3() || !productPlanDone || focusReviseDone) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(FOCUS_PROMPT)) return true;
    return n.indexOf('异议') !== -1 &&
      (n.indexOf('复核') !== -1 || n.indexOf('To-be') !== -1 || n.indexOf('用户故事') !== -1);
  }

  function matchesRules(text) {
    if (!onJourney3() || !focusReviseDone || rulesPlanDone) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(RULES_PROMPT)) return true;
    return n.indexOf('业务规则') !== -1 &&
      (n.indexOf('绩效核算') !== -1 || n.indexOf('配额校验') !== -1 || n.indexOf('异议复核') !== -1);
  }

  function matchesTech(text) {
    if (!onJourney3() || !rulesPlanDone || techPlanStarted) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(TECH_PROMPT)) return true;
    return n.indexOf('技术方案') !== -1 &&
      (n.indexOf('测试用例') !== -1 || n.indexOf('验收') !== -1 || n.indexOf('生产级') !== -1);
  }

  function matchesOntoBuild(text) {
    if (!onJourney3() || !techExecDone || ontoBuildDone) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(ONTO_BUILD_PROMPT)) return true;
    return n.indexOf('本体对象') !== -1 &&
      (n.indexOf('构建') !== -1 || n.indexOf('调试') !== -1 || n.indexOf('实体关系') !== -1);
  }

  function matchesOntoTweak(text) {
    if (!onJourney3() || !ontoBuildDone || ontoTweakDone) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(ONTO_TWEAK_PROMPT)) return true;
    return n.indexOf('入职折算') !== -1 ||
      (n.indexOf('在岗天数') !== -1 && n.indexOf('折算') !== -1);
  }

  function matchesAgentAssembly(text) {
    if (!onJourney3() || !ontoTweakDone || agentAssemblyPlanStarted) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(AGENT_ASSEMBLY_PROMPT)) return true;
    var ontoOk = n.indexOf('对象集') !== -1 || n.indexOf('本体') !== -1;
    var confirmOk = n.indexOf('调试确认') !== -1 || n.indexOf('已经调试') !== -1 || n.indexOf('调试完') !== -1;
    var buildOk = n.indexOf('skill') !== -1 || n.indexOf('Skill') !== -1 ||
      n.indexOf('MCP') !== -1 || n.indexOf('知识库') !== -1 ||
      n.indexOf('智能体') !== -1 || n.indexOf('组装') !== -1;
    return (ontoOk && confirmOk) || (ontoOk && buildOk) ||
      (buildOk && (n.indexOf('配套') !== -1 || n.indexOf('构建') !== -1));
  }

  function matchesSyncChange(text) {
    if (!onJourney3() || !agentAssemblyDone || syncChangePlanStarted) return false;
    var n = norm(text);
    if (!n) return false;
    if (n === norm(SYNC_CHANGE_PROMPT)) return true;
    return (n.indexOf('借调') !== -1 || n.indexOf('工时占比') !== -1) &&
      (n.indexOf('联动') !== -1 || n.indexOf('同步') !== -1 || n.indexOf('全部') !== -1);
  }

  function createSnapshotPlan() {
    return {
      process: async function (api) {
        await api.W('正在载入故事线 2 结束态…');
        await api.sleep(360);
        if (window.JourneyTwoPlan && window.JourneyTwoPlan.restoreEndSnapshot) {
          /* Keep J2 交互总结；hide the meta “进入结尾 / 已切到结束态” exchange. */
          window.JourneyTwoPlan.restoreEndSnapshot({ keepLiveTurn: true, compactChat: false });
        }
        var thread = document.getElementById('chat-thread');
        if (thread) {
          var users = thread.querySelectorAll('.chat-msg-user');
          var last = users.length ? users[users.length - 1] : null;
          if (last && /进入故事线\s*2|结束态/.test(last.textContent || '')) last.remove();
        }
        snapshotReady = true;
        await api.sleep(240);
      },
      segments: [{
        md: '如果还有小修小补，直接告诉我要改哪一块即可。',
        gap: 180,
      }],
      after: async function () {
        return { journey: '3', action: 'snapshot-locked' };
      },
    };
  }

  function createKickoffPlan(text) {
    return {
      process: async function (api) {
        await api.W('客户已立项做生产交付。先检查当前场景里 Demo 阶段留下了什么、还缺哪些生产级设计资产。');
        await api.sleep(400);
        await api.V({
          id: 'j3-status',
          icon: 'search',
          label: '已核对当前场景现状',
          details: [
            '已有：Demo 阶段轻量技术方案（Architecture / Ontology / Agent v1–v2）',
            '已有：可运行实体（本体对象集 · Agent demo）',
            '尚无：生产级【To-be 设计】',
            '尚无：【用户故事设计】【原型设计】【规则方案设计】',
          ],
        });
        await api.sleep(460);
        await api.W('盘点 Demo 已验证、且客户认可保留的核心能力，再对照生产级打造最佳实践选切入点。');
        await api.sleep(400);
        await api.V({
          id: 'j3-keep',
          icon: 'context',
          label: '已盘点 Demo 验证并获客户认可的能力',
          details: [
            '配额核对',
            '4 人以下小团队 1 个 S 档机动名额',
            '三段式自评润色（业绩成果 / 存在不足 / 下季度计划）',
          ],
        });
        await api.sleep(420);
        await api.V({
          id: 'j3-next',
          icon: 'ontology',
          label: '建议先做【产品方案共创与对齐】（设计优先）',
          details: [
            '设计① To-be 人机协同流程',
            '设计② 用户故事',
            '设计③ 高保真原型',
            '再拿流程 + 页面交互与业务方对齐',
          ],
        });
        await api.sleep(380);
        await api.W('核心建议已明确：先把产品方案里的三项设计做出来对齐；询问用户是否按此推进，或线下已有定稿应从别处切入。');
        await api.sleep(320);
      },
      segments: [{
        md: '好，正式打造就按生产交付来推进。我先看了下当前场景：\n\n' +
          '**现状**\n\n' +
          '- 已有 Demo 阶段的轻量技术方案与可运行实体（对象集 / Agent demo）\n' +
          '- 尚无生产级的【To-be 设计】【用户故事设计】【原型设计】与【规则方案设计】\n\n' +
          '**Demo 已验证且客户认可保留**\n\n' +
          '- 配额核对\n' +
          '- 4 人以下小团队 1 个 S 档机动名额\n' +
          '- 三段式自评润色\n\n' +
          '---\n\n' +
          '### 建议当下先从【产品方案共创与对齐】下手\n\n' +
          '按生产级打造最佳实践，这一步要先把 **设计** 做清楚、做完整，再拿去跟业务方对齐：\n\n' +
          '1. **To-be 人机协同流程** — 正式考核里人与 Agent 各自做什么、在哪一手交接\n' +
          '2. **用户故事** — 经理 / 员工 / HR 等角色的关键任务与验收口径\n' +
          '3. **高保真原型** — 配额核对、规则答疑、自评润色等主路径的页面交互\n\n' +
          '也就是说：先定 **流程设计 + 用户故事 + 高保真原型**，把正式考核流程与页面交互钉死，再去和业务方对齐；规则方案与生产级技术设计放在产品方案对齐之后。\n\n' +
          '是否按此推进【产品方案共创与对齐】？如果线下已有定稿流程，也可以告诉我应从哪个环节切入。',
        gap: 280,
      }],
      after: async function () {
        kickoffDone = true;
        return { journey: '3', action: 'kickoff-product-first', seed: text };
      },
    };
  }

  function createProductPlan() {
    productPlanStarted = true;
    var card = window.FastFlow && window.FastFlow.taskPlanCard({
      tasks: PRODUCT_TASKS,
      progressive: true,
      title: '任务清单',
      brief: '产品方案共创与对齐 · ' + PRODUCT_TASKS.length + ' 项长任务',
      buttonLabel: '开始执行',
      hint: '确认后按顺序推进；任务 2 完成后会停下审核。如需调整，直接告诉我。',
    });

    return {
      process: async function (api) {
        await api.W('用户确认先做产品方案。这是从 Demo 叙事拉到生产设计基线：需要从零到一补齐 To-be、用户故事与高保真原型。');
        await api.sleep(420);
        await api.V({
          id: 'j3-prod-scope',
          icon: 'search',
          label: '已界定产品方案共创范围',
          details: [
            '沿用 Demo 已验证能力：配额核对 / 小团队 S 档机动名额 / 三段式自评',
            '本轮只做设计对齐，不直接改生产本体与 Agent 组装',
            '产出：To-be设计 · 用户故事设计 · 原型设计',
          ],
        });
        await api.sleep(440);
        await api.V({
          id: 'j3-prod-order',
          icon: 'ontology',
          label: '已编排三项设计长任务',
          details: PRODUCT_TASKS.map(function (task, i) {
            return (i + 1) + '. ' + task.title + ' · ' + task.agent + ' · ' + task.status;
          }),
        });
        await api.sleep(400);
        await api.W('准备给出从零到一的产品方案总结，并弹出长任务清单供确认执行。');
        await api.sleep(320);
      },
      segments: [{
        md: '### 任务判断\n\n' +
          '好，就按 **【产品方案共创与对齐】** 推进。当前还没有生产级的 To-be / 用户故事 / 原型，所以这一轮我会 **从零到一生成产品方案**，而不是在 Demo 文案上打补丁。\n\n' +
          '长任务就是下面这三项（标题与清单一致）：\n\n' +
          '1. **设计未来业务人机协同流程（To-be）** — 负责：场景需求Agent｜新增【To-be设计】｜完成后：自动继续\n' +
          '2. **设计人机交互用户故事旅程** — 负责：场景需求Agent｜新增【用户故事设计】｜完成后：停下审核\n' +
          '3. **设计视觉规范与高保真交互原型** — 负责：场景需求Agent｜新增【原型设计】｜完成后：自动继续\n\n' +
          'Demo 里已验证且客户认可的能力（配额核对、4 人以下小团队 1 个 S 档机动名额、三段式自评润色）会作为设计输入保留进方案，而不是推倒重来。\n\n' +
          '**下面是建议的长任务安排，确认后即可开始执行。**',
        gap: 260,
      }],
      after: async function (ctx) {
        if (!card) return { journey: '3', action: 'product-plan-missing' };
        appendNode(ctx, card.node);
        for (var i = 0; i < PRODUCT_TASKS.length; i++) {
          await ctx.sleep(300);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(240);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startProductExecution, 0);
        return { journey: '3', action: 'product-plan-confirmed' };
      },
    };
  }

  var SCENARIO_PACKAGE = 'Scenario Knowledge Package';
  var SCENARIO_CANVAS_V1 = '场景定义画布V1.md';
  var SCENARIO_CANVAS_V2 = '场景定义画布V2.md';
  var SCENARIO_CANVAS_V3 = '场景定义画布V3.md';
  var SCENARIO_CANVAS_V4 = '场景定义画布V4.md';
  var SCENARIO_CANVAS_V5 = '场景定义画布V5.md';
  var scenarioCanvasName = SCENARIO_CANVAS_V1;

  function canvasFileName(ver) {
    if (ver === 5) return SCENARIO_CANVAS_V5;
    if (ver === 4) return SCENARIO_CANVAS_V4;
    if (ver === 3) return SCENARIO_CANVAS_V3;
    if (ver === 2) return SCENARIO_CANVAS_V2;
    return SCENARIO_CANVAS_V1;
  }

  var PROTO_DOC = '原型设计v1.md';
  var PROTO_DOC_V2 = '原型设计v2.md';
  var RULES_DOC = '规则方案设计v1.md';
  var RULES_DOC_V2 = '规则方案设计v2.md';
  var ARCH_DOC = '架构方案设计.md';
  var ARCH_DOC_V3 = '架构方案设计v3.md';
  var ONTO_DESIGN_V3 = '本体方案设计v3.md';
  var ONTO_DESIGN_V4 = '本体方案设计v4.md';
  var TEST_DOC = '测试用例设计.md';
  var TEST_DOC_V2 = '测试用例设计v2.md';
  var SKILL_V4 = 'Skillv4.md';
  var SOLUTION_PACKAGE = 'Solution Design Package';
  var ONTO_OBJ_V1 = '本体对象集v1.md';
  var ONTO_OBJ_V2 = '本体对象集v2.md';
  var SKILL_V1 = 'Skillv1.md';
  var SKILL_V2 = 'Skillv2.md';
  var SKILL_V3 = 'Skillv3.md';
  var KNOWLEDGE_V1 = '知识库v1.md';
  var KNOWLEDGE_V2 = '知识库v2.md';
  var MCP_V1 = 'MCPv1.md';
  var AGENT_DESIGN_V1 = 'Agent方案设计v1.md';
  var AGENT_DESIGN_V2 = 'Agent方案设计v2.md';
  var AGENT_DESIGN_V4 = 'Agent方案设计v4.md';
  var AGENT_V3 = 'Agent v3';
  var AGENT_V4 = 'Agent v4';

  /* Standalone deliverables outside / beside the canvas (e.g. 原型设计v1). */
  function saveDraft(doc) {
    if (window.FastDocs && !window.FastDocs.find(doc.name)) {
      window.FastDocs.register({
        kind: 'md',
        deliverable: true,
        name: doc.name,
        size: '4 KB',
        pages: '2 页',
        updated: '刚刚',
        author: '场景需求Agent',
        note: doc.note,
        md: doc.md,
      });
    }
    if (window.FastFiles) {
      var path = doc.folder ? doc.folder + '/' + doc.name : doc.name;
      window.FastFiles.addDeliverable(path);
      window.FastFiles.markUpdated(doc.name);
      window.FastFiles.markNew();
    }
  }

  function canvasMd(opts) {
    opts = opts || {};
    var ver = opts.version || 'V1';
    var parts = [
      '# 场景定义画布 ' + ver + '\n',
      '## 场景\n\n季度绩效配额核算与自评答疑\n',
      '## 范围\n\n- 部门配额核对\n- 小团队机动名额申请\n- 自评三段式润色\n',
    ];
    if (opts.boundary) {
      parts.push(
        '## To-be · 人机协同流程\n\n' +
        '### 已自动纳入（来自 Demo）\n\n' +
        '- 部门配额核对\n' +
        '- 小团队机动名额申请（人数 < 5 → 1 个 S 档）\n' +
        '- 自评三段式润色\n\n' +
        '### 业务方确认的人机职责边界\n\n' + opts.boundary + '\n'
      );
    } else {
      parts.push('## To-be · 人机协同流程\n\n待任务 1 确认职责边界后回写。\n');
    }
    if (opts.stories) {
      parts.push('## 用户故事旅程\n\n' + opts.stories + '\n');
    }
    parts.push('## 状态\n\n' + (opts.status || '草稿') + '\n');
    return parts.join('\n');
  }

  /* Task 1 start: Deliverables → Scenario Knowledge Package / 场景定义画布V1.md (no update dot yet). */
  function ensureScenarioPackage() {
    scenarioCanvasName = SCENARIO_CANVAS_V1;
    var known = [SCENARIO_CANVAS_V1, SCENARIO_CANVAS_V2, SCENARIO_CANVAS_V3, SCENARIO_CANVAS_V4, SCENARIO_CANVAS_V5];
    var hasDoc = window.FastDocs && known.some(function (n) { return window.FastDocs.find(n); });
    if (window.FastDocs && !hasDoc) {
      window.FastDocs.register({
        kind: 'md',
        deliverable: true,
        name: SCENARIO_CANVAS_V1,
        size: '3 KB',
        pages: '1 页',
        updated: '刚刚',
        author: '场景需求Agent',
        note: 'Scenario definition canvas v1',
        md: canvasMd({ version: 'V1', status: '草稿 · 待写入 To-be' }),
      });
    }
    if (window.FastFiles) {
      window.FastFiles.addFolder('deliverable', SCENARIO_PACKAGE, { open: true });
      var hasRow = Array.prototype.some.call(
        document.querySelectorAll('#fast-deliverables .file .name'),
        function (n) { return known.indexOf(n.textContent) !== -1; }
      );
      if (!hasRow) {
        window.FastFiles.addDeliverable(SCENARIO_PACKAGE + '/' + SCENARIO_CANVAS_V1);
      }
      if (window.FastFiles.clearUpdated) window.FastFiles.clearUpdated(SCENARIO_CANVAS_V1);
      window.FastFiles.showTab(true);
    }
  }

  /* To-be → V2；用户故事跑完 → V3。内容写进同一画布，侧栏改名 + 红点. */
  function bumpScenarioCanvas(opts) {
    opts = opts || {};
    var toVer = opts.toVersion || 2;
    var toName = canvasFileName(toVer);
    var fromName = scenarioCanvasName;
    var md = canvasMd({
      version: 'V' + toVer,
      boundary: opts.boundary,
      stories: opts.stories,
      status: opts.status || ('V' + toVer + ' · 已更新'),
    });
    if (window.FastDocs) {
      if (fromName !== toName && window.FastDocs.find(fromName) && window.FastDocs.rename) {
        window.FastDocs.rename(fromName, toName);
      }
      if (window.FastDocs.find(toName)) {
        window.FastDocs.setMd(toName, md);
      } else {
        window.FastDocs.register({
          kind: 'md',
          deliverable: true,
          name: toName,
          size: '5 KB',
          pages: '2 页',
          updated: '刚刚',
          author: '场景需求Agent',
          note: 'Scenario definition canvas v' + toVer,
          md: md,
        });
      }
      var d = window.FastDocs.find(toName);
      if (d) { d.updated = '刚刚'; d.size = '5 KB'; d.pages = '2 页'; }
    }
    if (window.FastFiles) {
      if (fromName !== toName && window.FastFiles.renameDeliverable) {
        window.FastFiles.renameDeliverable(fromName, toName);
      }
      window.FastFiles.markUpdated(toName);
      window.FastFiles.markNew();
    }
    scenarioCanvasName = toName;
  }

  /* deliverableConfirmation prefixes custom input with「已提交意见：」— strip for clean To-be copy. */
  function confirmedBoundary(answer) {
    var text = String(answer || '');
    if (text.indexOf('已提交意见：') === 0) return text.slice('已提交意见：'.length).trim();
    return text;
  }

  function createProductExecution() {
    var titles = PRODUCT_TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    var task1Thoughts = [
      '场景需求Agent 自动读取场景定义及前期 Demo 已有上下文',
      '已纳入 To-be：自评三段式润色 · 部门配额核对 · 小团队机动名额申请（不再重复追问）',
      '正在区分生产级仍需拍板的人机职责边界',
      '识别缺口①：绩效等级强制分布比例由谁最终审批拍板',
      '识别缺口②：跨部门借调人员由哪方主管打分',
      '准备发起确认：推荐口径或自定义补充',
    ];
    var task2Thoughts = [
      '正在展开员工 / 主管 / HRBP 三条人机交互旅程',
      '映射 To-be 边界到故事节点：强制分布拍板 · 借调满半季双评会签',
      '补齐自评润色、配额核对、机动名额申请的交互步骤',
      '识别评级校准入口是否存在交互缺口',
      '准备发起意图识别：校准前是否需先展示配额与影响',
    ];
    var task2ContinueThoughts = [
      '已纳入评级校准前置说明：配额占用 · 触发原因 · 调整影响',
      '回写【场景定义画布】用户故事与校准分支并升至 V3',
      '核对主管确认后再进入调整页的验收口径',
    ];
    var task3Thoughts = [
      '对齐视觉规范与关键页面信息架构',
      '绘制配额看板、自评润色、校准前置说明与审批会签状态',
      '标注人在环确认点与 Agent 辅助位',
      '生成【原型设计v1】',
    ];

    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(280);
      }
    }

    return {
      process: async function (api) {
        await api.W('已收到开始执行。先把产品方案长任务写入 Files 底稿，再按进度卡逐步推进。');
        await api.sleep(420);
        await api.V({
          id: 'j3-draft',
          icon: 'edit',
          label: '已存底稿 · 产品方案共创与对齐 v1',
          details: [
            'Files → Long task 已写入三项设计任务',
            '任务进度卡将逐步推进',
            '任务 1：设计未来业务人机协同流程（To-be）',
          ],
        });
        await api.sleep(400);
        await api.W('开始任务 1：读取 Demo 上下文，并对未明确的人机职责边界发起确认。');
        await api.sleep(480);
      },
      segments: [{
        md: '任务已启动。我会按进度卡逐步推进，并在需要时向你确认。',
        gap: 220,
      }],
      after: async function (ctx) {
        /* Keep the long-task plan card visible; progress lives only in the Agent reply. */
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        await ctx.sleep(280);

        /* ── Task 1: To-be + boundary confirm ── */
        progress.start(0);
        ensureScenarioPackage();
        await runThoughts(ctx, task1Thoughts);
        thinking.waitForUser();
        ctx.scroll();
        await ctx.sleep(240);

        var lead = document.createElement('div');
        ctx.host.appendChild(lead);
        await ctx.run(lead, [{
          md: 'Demo 已验证能力会自动写进 To-be。生产级还缺两处职责边界——请确认推荐口径，或在下方直接写清你们的约定后点确认通过。',
          gap: 180,
        }]);

        var boundaryReview = window.FastFlow.deliverableConfirmation({
          headTitle: '意图识别',
          headHint: '已预选推荐口径，可直接确认或自定义补充',
          title: 'To-be 人机职责边界',
          desc:
            '① 绩效等级强制分布比例由谁最终审批拍板？推荐：HRVP 终审。' +
            '② 跨部门借调人员由哪方主管打分？推荐：借入方主管主评，借出方提供参考。',
          passLabel: '按推荐口径确认通过',
          pauseLabel: '先暂停一下',
          placeholder: '也可以直接输入你们的口径…',
          fillOnFocus:
            '强制分布比例由二级部门负责人最终拍板；跨部门借调满半个季度的由借入部门主管初评、原部门主管会签。',
          result:
            '已确认推荐口径：强制分布由 HRVP 终审；借调人员以借入方主管打分为主，借出方提供参考',
        });
        appendNode(ctx, boundaryReview.node);
        ctx.scroll();
        var rawAnswer = await boundaryReview.done;

        if (rawAnswer === '已暂停') {
          progress.wait(0);
          thinking.waitForUser();
          var paused = document.createElement('div');
          ctx.host.appendChild(paused);
          await ctx.run(paused, [{
            md: '已暂停。你准备好继续时告诉我，我再从人机职责边界确认接着做。',
            gap: 200,
          }]);
          return { journey: '3', action: 'product-tobe-paused' };
        }

        var boundary = confirmedBoundary(rawAnswer);
        thinking.resume();
        thinking.add('已收到确认，正在回写【场景定义画布】To-be 章节并升至 V2');
        await ctx.sleep(320);

        bumpScenarioCanvas({
          toVersion: 2,
          boundary: boundary,
          status: 'V2 · To-be 已写入',
        });
        progress.done(0);
        ctx.scroll();

        var afterT1 = document.createElement('div');
        ctx.host.appendChild(afterT1);
        await ctx.run(afterT1, [{
          md: '**【场景定义画布】已升至 V2**，To-be 人机协同已写入。\n\n> ' +
            boundary.replace(/\n/g, '\n> ') +
            '\n\n自动继续第 2 项：**设计人机交互用户故事旅程**（写入同一画布，任务 2 完成后升至 V3）。',
          gap: 220,
        }]);

        /* ── Task 2: user stories → 意图识别(补充) → 续跑 → 再确认 → Task 3 ── */
        progress.start(1);
        await runThoughts(ctx, task2Thoughts);
        thinking.waitForUser();
        ctx.scroll();
        await ctx.sleep(200);

        var storyLead = document.createElement('div');
        ctx.host.appendChild(storyLead);
        await ctx.run(storyLead, [{
          md: '用户故事主路径已铺开。主管「评级校准」入口还有一处交互待你拍板——请确认或补充后我继续写进画布。',
          gap: 160,
        }]);

        var storyAsk = window.FastFlow.deliverableConfirmation({
          headTitle: '意图识别',
          headHint: '已预选推荐口径，可直接确认或自定义补充',
          title: '主管评级校准入口',
          desc:
            '主管从配额看板进入评级校准时，是否允许直接打开调整页？' +
            '推荐：先展示配额占用、触发原因与调整影响，确认后再进入调整。',
          passLabel: '按推荐口径确认通过',
          pauseLabel: '先暂停一下',
          placeholder: '也可以直接输入你们的交互要求…',
          fillOnFocus:
            '主管进行评级校准时，不能直接进入调整评级页面；先展示当前部门配额占用、触发校准的原因和调整影响，再由主管确认是否进入调整。',
          result:
            '已确认推荐口径：校准前先展示配额占用、触发原因与调整影响，确认后再进入调整页',
        });
        appendNode(ctx, storyAsk.node);
        ctx.scroll();
        var storyRaw = await storyAsk.done;

        if (storyRaw === '已暂停') {
          progress.wait(1);
          thinking.waitForUser();
          var storyPaused = document.createElement('div');
          ctx.host.appendChild(storyPaused);
          await ctx.run(storyPaused, [{
            md: '已暂停在用户故事。准备好后告诉我继续。',
            gap: 200,
          }]);
          return { journey: '3', action: 'product-stories-paused', boundary: boundary };
        }

        var storyNote = confirmedBoundary(storyRaw);
        thinking.resume();
        progress.start(1);
        thinking.add('已收到补充，继续完善用户故事旅程');
        await runThoughts(ctx, task2ContinueThoughts);
        await ctx.sleep(2000);

        var storiesBody =
          '1. **员工**：配额可见 → 自评三段式润色 → 提交\n' +
          '2. **主管**：部门配额核对 → 强制分布拍板 → 借调满半季初评/会签\n' +
          '3. **主管 · 评级校准**：' + storyNote + '\n' +
          '4. **HRBP**：机动名额申请复核 → 异常答疑';
        bumpScenarioCanvas({
          toVersion: 3,
          boundary: boundary,
          stories: storiesBody,
          status: 'V3 · To-be + 用户故事已写入',
        });

        thinking.waitForUser();
        ctx.scroll();

        var storyConfirmLead = document.createElement('div');
        ctx.host.appendChild(storyConfirmLead);
        await ctx.run(storyConfirmLead, [{
          md: '**【场景定义画布】已升至 V3**，用户故事与评级校准说明已写入。请确认通过后进入高保真原型。',
          gap: 160,
        }]);

        var storyConfirm = window.FastFlow.deliverableConfirmation({
          headTitle: '意图识别',
          headHint: '已预选确认通过，可直接确认',
          title: '用户故事旅程已就绪',
          desc: 'To-be、用户故事与评级校准前置说明均已写入【场景定义画布 V3】。确认后自动进入原型设计。',
          passLabel: '方案没问题，确认通过',
          pauseLabel: '先暂停一下',
          placeholder: '输入修改意见或补充要求…',
          file: SCENARIO_CANVAS_V3,
          result: '用户故事旅程已审核通过',
        });
        appendNode(ctx, storyConfirm.node);
        ctx.scroll();
        var storyResult = await storyConfirm.done;

        if (storyResult === '已暂停' || (storyResult && storyResult.indexOf('已提交意见') === 0)) {
          progress.wait(1);
          progress.stop(2);
          thinking.finish();
          var storyHeld = document.createElement('div');
          ctx.host.appendChild(storyHeld);
          await ctx.run(storyHeld, [{
            md: storyResult === '已暂停'
              ? '已暂停。准备好后告诉我再继续原型。'
              : '已记录修改意见，暂不进入原型。\n\n> ' +
                confirmedBoundary(storyResult).replace(/\n/g, '\n> '),
            gap: 200,
          }]);
          return { journey: '3', action: 'product-stories-held', boundary: boundary, storyNote: storyNote };
        }

        thinking.resume();
        thinking.add('用户故事已确认，开始原型设计');
        progress.done(1);
        await ctx.sleep(240);

        /* ── Task 3: hi-fi prototype → auto complete ── */
        progress.start(2);
        await runThoughts(ctx, task3Thoughts);

        saveDraft({
          name: PROTO_DOC,
          folder: SCENARIO_PACKAGE,
          note: 'Hi-fi prototype v1',
          md:
            '# 原型设计 v1\n\n' +
            '## 范围\n\n' +
            '- 配额看板与强制分布拍板态\n' +
            '- 自评三段式润色\n' +
            '- 评级校准前置说明（配额占用 / 触发原因 / 调整影响）→ 确认后进入调整\n' +
            '- 借调满半季：借入初评 + 原部门会签\n' +
            '- 机动名额申请\n\n' +
            '## 依据\n\n' +
            '### 人机职责边界\n\n' + boundary + '\n\n' +
            '### 评级校准\n\n' + storyNote + '\n',
        });
        progress.done(2);
        progress.finish();
        thinking.finish();
        ctx.scroll();

        var summaryLead = document.createElement('div');
        ctx.host.appendChild(summaryLead);
        await ctx.run(summaryLead, [{
          md: '三项产品方案任务已全部完成。下面是执行总结与交付物，建议拿去和业务方对焦。',
          gap: 180,
        }]);

        if (window.FastFlow && window.FastFlow.deliverableSummary) {
          appendNode(ctx, window.FastFlow.deliverableSummary({
            title: '执行总结',
            body: '已完成 To-be、用户故事与高保真原型。边界与校准规则已写入场景定义画布；原型可直接打开评审。',
            lead: '本轮产出：',
            items: [
              { name: SCENARIO_CANVAS_V3.replace(/\.md$/, ''), file: SCENARIO_CANVAS_V3, iconName: SCENARIO_CANVAS_V3, kind: 'md' },
              { name: PROTO_DOC.replace(/\.md$/, ''), file: PROTO_DOC, iconName: PROTO_DOC, kind: 'md' },
            ],
            conclusion:
              '建议拿去对焦：① 与 HRVP / 二级部门负责人确认强制分布与借调会签口径是否写死进制度；' +
              '② 与研发主管走一遍「评级校准前置说明 → 再进调整页」是否符合现场习惯；' +
              '③ 确认原型关键页是否可进入下一轮架构与 Agent 生产级加固。',
            ask: '对焦通过后，需要我接着排生产交付的技术与构建任务吗？',
          }));
        }

        if (window.FastFlow && window.FastFlow.deliverableInventory) {
          appendNode(ctx, window.FastFlow.deliverableInventory({
            title: '交付物清单',
            countLabel: '本轮新增 / 更新 2 项',
            groups: [
              {
                title: 'Scenario Knowledge Package',
                items: [
                  { name: '场景定义画布', ver: 'v3', state: 'confirmed', file: SCENARIO_CANVAS_V3 },
                  { name: '原型设计', ver: 'v1', state: 'confirmed', file: PROTO_DOC },
                ],
              },
            ],
          }));
        }

        var focusTip = document.createElement('div');
        ctx.host.appendChild(focusTip);
        await ctx.run(focusTip, [{
          md: '**拿去对焦的建议**\n\n' +
            '1. 先打开【场景定义画布 V3】核对 To-be 边界与评级校准故事是否被业务方认可。\n' +
            '2. 再打开【原型设计 v1】对着关键页走查：配额看板 → 校准前置说明 → 调整页。\n' +
            '3. 对焦纪要里只需回收「通过 / 要改哪一页」——改动我会回写同一 Package，不必另开文档。',
          gap: 200,
        }]);
        lastBoundary = boundary;
        lastStoryNote = storyNote;
        productPlanDone = true;
        ctx.scroll();
        return {
          journey: '3',
          action: 'product-plan-done',
          boundary: boundary,
          storyNote: storyNote,
        };
      },
    };
  }

  function createFocusRevisePlan() {
    focusReviseDone = true;
    var appealNote = '员工对初评结果有异议时，可发起复核说明；主管 / HRBP 按规则受理并回写结论。';
    return {
      process: async function (api) {
        await api.W('收到业务方对焦反馈：要在 To-be 与用户故事中补「员工对初评结果有异议时发起复核说明」。');
        await api.sleep(420);
        await api.V({
          id: 'j3-focus-read',
          icon: 'search',
          label: '已定位需改写的交付物',
          details: [
            '识别到：场景定义画布 V3',
            '改写范围：To-be 人机协同 · 用户故事旅程',
            '新增节点：员工异议 → 发起复核说明 → 受理回写',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-focus-tobe',
          icon: 'edit',
          label: '正在更新 To-be 人机职责',
          details: [
            '员工：初评可见 → 异议时可发起复核说明',
            '主管 / HRBP：受理复核、核对配额与证据、回写结论',
            'Agent：辅助整理异议理由与历史口径，不直接改评级',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j3-focus-story',
          icon: 'ontology',
          label: '正在回写用户故事旅程',
          details: [
            '新增故事：员工发起初评异议复核说明',
            '衔接评级校准前置说明与强制分布拍板',
            '验收：异议可追溯、受理有结论、不绕过配额规则',
          ],
        });
        await api.sleep(460);
        await api.W('改写完成，保存完整新版场景定义画布 V4，并同步左侧 Files。');
        var storiesBody =
          '1. **员工**：配额可见 → 自评三段式润色 → 提交\n' +
          '2. **员工 · 异议复核**：' + appealNote + '\n' +
          '3. **主管**：部门配额核对 → 强制分布拍板 → 借调满半季初评/会签\n' +
          '4. **主管 · 评级校准**：' + (lastStoryNote || '校准前先展示配额占用、触发原因与调整影响') + '\n' +
          '5. **HRBP**：机动名额申请复核 → 异常答疑 → 异议复核受理';
        bumpScenarioCanvas({
          toVersion: 4,
          boundary: (lastBoundary || '（沿用已确认边界）') +
            '\n\n补充：' + appealNote,
          stories: storiesBody,
          status: 'V4 · 已纳入异议复核说明',
        });
        if (window.FastFiles) window.FastFiles.showTab(true);
        await api.sleep(380);
      },
      segments: [{
        md: '已按业务方对焦意见改完。\n\n' +
          '**改动结论**\n\n' +
          '- 在 To-be 中补上「员工对初评结果有异议 → 发起复核说明 → 主管/HRBP 受理回写」的人机环节；Agent 只辅助整理理由与证据，不直接改评级。\n' +
          '- 在用户故事中新增对应旅程，并与现有配额核对、评级校准前置说明对齐，避免异议路径绕过强制分布与会签规则。\n' +
          '- 完整版本已保存为 **场景定义画布 V4**（由 V3 升级），可直接打开核对。\n\n' +
          '打开查看：[' + SCENARIO_CANVAS_V4 + '](' + SCENARIO_CANVAS_V4 + ')',
        gap: 280,
      }],
      after: async function () {
        return { journey: '3', action: 'focus-revise-v4' };
      },
    };
  }

  function createRulesPlan() {
    rulesPlanDone = true;
    return {
      process: async function (api) {
        await api.W('产品方案已定稿。开始梳理绩效核算、配额校验与异议复核判定的业务规则方案。');
        await api.sleep(420);
        await api.V({
          id: 'j3-rules-src',
          icon: 'context',
          label: '已读取定稿产品方案',
          details: [
            '场景定义画布 V4：To-be · 用户故事 · 异议复核',
            '原型设计 v1：校准前置说明与关键页状态',
            '抽取：绩效核算 / 配额校验 / 异议复核判定',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-rules-pack',
          icon: 'edit',
          label: '正在编排规则决策表',
          details: [
            '列：决策点 · 决策类型 · 决策逻辑 · 依赖数据 · 依赖知识',
            '纳入 Demo 已验证：小团队机动名额规则',
            '覆盖：绩效核算 / 配额校验 / 异议复核判定',
            '落盘：规则方案设计 v1',
          ],
        });
        await api.sleep(520);
        await api.W('规则方案已整理完成，写入 Files → Scenario Knowledge Package。');
        saveDraft({
          name: RULES_DOC,
          folder: SCENARIO_PACKAGE,
          note: 'Business rules design v1 — decision table',
          md:
            '# 规则方案设计 v1\n\n' +
            '> 覆盖绩效核算、配额校验、异议复核判定；已包含 Demo 验证过的小团队机动名额规则。\n\n' +
            '## 决策点总表\n\n' +
            '| 决策点 | 决策类型 | 决策逻辑 | 依赖数据 | 依赖知识 |\n' +
            '|---|---|---|---|---|\n' +
            '| 季度绩效初评核算 | 自动核算 + 人确认 | 窗口开启后汇总自评三段式与初评等级，生成可追溯核算快照；强制分布拍板后触发重算 | 自评（业绩成果/存在不足/下季度计划）、初评等级、考核窗口状态 | 场景定义画布 V4 · To-be 核算时点 |\n' +
            '| 强制分布比例拍板 | 人工决策 | 二级部门负责人对部门强制分布比例做最终拍板；未拍板前不得锁定终评 | 部门编制、各档位占用、初评分布 | To-be 边界：二级部门负责人终审 |\n' +
            '| 部门配额占用校验 | 自动校验 | 实时核对部门各档位占用是否超出配额表；超限则阻断提交并提示 | 部门配额表、当前占用、在途调整 | 配额看板规则 · 原型设计 v1 |\n' +
            '| 小团队 S 档机动名额 | 自动规则（Demo 已验证） | **部门人数 < 5 → 允许 1 个 S 档机动名额**（不再卡死为 0）；人数 ≥ 5 按原配额表核算 S 档 | 部门人数、S 档配额、机动名额申请记录 | Demo 调优规则 · Ontology AssessmentRule |\n' +
            '| 评级校准入口放行 | 人机协同 | 主管不可直接进入调整页；须先展示当前部门配额占用、触发校准原因与调整影响，主管确认后再进入调整 | 配额占用快照、校准触发原因、影响预估 | 用户故事：评级校准前置说明 |\n' +
            '| 跨部门借调评分归属 | 人工会签 | 借调满半个季度：借入部门主管初评，原部门主管会签后生效 | 借调起止、借入/原部门、初评与会签意见 | To-be 边界：借调满半季双评会签 |\n' +
            '| 员工初评异议受理 | 人机协同 | 员工可对初评发起复核说明；主管主责受理，HRBP 可会签；Agent 只整理理由与证据，不直接改评级 | 异议说明、证据附件、初评快照 | 画布 V4 · 异议复核说明 |\n' +
            '| 异议复核结论回写 | 人工决策 + 规则互斥 | 结论回写后进入下一核算窗口；**不得绕过**强制分布拍板与借调会签规则 | 复核结论、受理人、回写时点 | 规则互斥：分布/会签优先 |\n' +
            '| 自评三段式润色输出 | 自动生成 | 润色自评时固定按「业绩成果 / 存在不足 / 下季度计划」三段式输出 | 员工原始自评文本 | Demo 已验证 · 自评润色 Skill |\n\n' +
            '## 校验顺序建议\n\n' +
            '1. 绩效初评核算 → 2. 配额占用校验（含小团队机动名额）→ 3. 强制分布拍板 → 4. 校准/借调/异议等例外分支。\n\n' +
            '## 依据\n\n' +
            '- 场景定义画布 V4\n' +
            '- 原型设计 v1\n' +
            '- Demo 已验证：部门人数 < 5 → 1 个 S 档机动名额；自评三段式润色\n',
        });
        if (window.FastFiles) window.FastFiles.showTab(true);
        await api.sleep(360);
      },
      segments: [{
        md: '已生成 **【规则方案设计 v1】**，用表格列出全部决策点（决策类型 / 决策逻辑 / 依赖数据 / 依赖知识），并已纳入 Demo 验证过的 **小团队机动名额规则**（部门人数 < 5 → 允许 1 个 S 档）。\n\n' +
          '表中覆盖：绩效初评核算、强制分布拍板、配额占用校验、小团队 S 档机动名额、评级校准入口放行、借调评分归属、异议受理与结论回写、自评三段式润色。\n\n' +
          '打开查看：[' + RULES_DOC + '](' + RULES_DOC + ')',
        gap: 280,
      }],
      after: async function () {
        return { journey: '3', action: 'rules-v1-done' };
      },
    };
  }

  async function startProductExecution() {
    if (productExecStarted || !window.FastChat) return;
    productExecStarted = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('开始执行');
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, PRODUCT_TASKS, '', '产品方案共创与对齐 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createProductExecution());
  }

  function createTechPlan() {
    techPlanStarted = true;
    var card = window.FastFlow && window.FastFlow.taskPlanCard({
      tasks: TECH_TASKS,
      progressive: true,
      title: '任务清单',
      brief: '生产级技术方案与验收用例 · ' + TECH_TASKS.length + ' 项长任务',
      buttonLabel: '确认开始执行',
      hint: '跑完后审阅全套技术方案与测试用例。如需调整，直接告诉我。',
    });

    return {
      process: async function (api) {
        await api.W('产品方案与业务规则均已定稿。开始面向生产部署，规划完整打造中的技术方案与评审环节。');
        await api.sleep(440);
        await api.V({
          id: 'j3-tech-gap',
          icon: 'search',
          label: '已识别技术方案缺口',
          details: [
            '当前暂未生成生产级技术方案',
            'Demo 仅有轻量 Architecture / Ontology / Agent 方案',
            '不可从零重写，应从既有方案继承升级',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-tech-inherit',
          icon: 'context',
          label: '已 review 可继承的 Demo 结构',
          details: [
            'Architecture Design v1：系统分层与模块边界',
            'Ontology Design v2：配额 / 机动名额 / 考核对象',
            'Agent Design v2：答疑与润色主路径',
            '可运行 Demo：对象集 + Agent demo 已验证上游能力',
          ],
        });
        await api.sleep(500);
        await api.V({
          id: 'j3-tech-up',
          icon: 'ontology',
          label: '已对齐上游长久化输入',
          details: [
            '场景定义画布 V4：To-be · 用户故事 · 异议复核已定稿',
            '原型设计 v1：关键页与校准前置说明已定稿',
            '规则方案设计 v1：核算 / 配额 / 异议判定决策表已定稿',
          ],
        });
        await api.sleep(460);
        await api.W('结论：按「继承升级 → 补齐生产级详细方案 → 补验收测试用例」编排长任务，供确认后执行。');
        await api.sleep(360);
      },
      segments: [{
        md: '### 结论\n\n' +
          '面向生产部署，这一步要做的是 **技术方案与评审**，不是再推产品方案。\n\n' +
          '我核对后的判断是：\n\n' +
          '- **当前还没有生产级技术方案**（只有 Demo 期的 Architecture / Ontology / Agent 轻量稿）。\n' +
          '- 正确路径是 **从既有结构方案继承升级**：先 review Demo 架构与可运行实体，再按已定稿的 To-be、用户故事、原型与【规则方案设计 v1】补齐生产口径。\n' +
          '- 上游长久化输入已齐：场景定义画布 V4、原型设计 v1、规则决策表均已定稿，可以作为技术方案与验收用例的约束。\n\n' +
          '因此本轮长任务按「架构 → 本体（若架构含本体）→ Agent 及配套（若架构含智能体）→ 场景验收测试用例」推进；跑完后请你审阅全套技术方案与测试用例。\n\n' +
          '**下面是建议的长任务安排，确认后即可开始执行。**',
        gap: 280,
      }],
      after: async function (ctx) {
        if (!card) return { journey: '3', action: 'tech-plan-missing' };
        appendNode(ctx, card.node);
        for (var i = 0; i < TECH_TASKS.length; i++) {
          await ctx.sleep(300);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(240);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startTechExecution, 0);
        return { journey: '3', action: 'tech-plan-confirmed' };
      },
    };
  }

  function ensureSolutionPackageSeeds() {
    if (window.FastFiles) {
      window.FastFiles.addFolder('deliverable', SOLUTION_PACKAGE, { open: true });
      window.FastFiles.showTab(true);
    }
    [
      {
        name: ONTO_OBJ_V1,
        note: 'Ontology object set v1',
        md: '# 本体对象集 v1\n\n> Demo 可运行对象集底稿，待生产级升级。\n',
      },
      {
        name: SKILL_V1,
        note: 'Skill v1',
        md: '# Skill v1\n\n> Demo Skill / 提示词底稿，待生产级升级。\n',
      },
      {
        name: AGENT_DESIGN_V1,
        note: 'Agent design v1',
        md: '# Agent方案设计 v1\n\n> Demo Agent 方案底稿，待生产级升级。\n',
      },
    ].forEach(function (doc) {
      if (window.FastDocs && !window.FastDocs.find(doc.name) && !window.FastDocs.find(doc.name.replace('v1', 'v2'))) {
        window.FastDocs.register({
          kind: 'md',
          deliverable: true,
          name: doc.name,
          size: '3 KB',
          pages: '1 页',
          updated: '刚刚',
          author: '技术方案设计Agent',
          note: doc.note,
          md: doc.md,
        });
      }
      if (window.FastFiles) {
        var has = Array.prototype.some.call(
          document.querySelectorAll('#fast-deliverables .file .name'),
          function (n) {
            return n.textContent === doc.name || n.textContent === doc.name.replace('v1', 'v2');
          }
        );
        if (!has) {
          window.FastFiles.addDeliverable(SOLUTION_PACKAGE + '/' + doc.name);
          if (window.FastFiles.clearUpdated) window.FastFiles.clearUpdated(doc.name);
        }
      }
    });
  }

  function bumpSolutionFile(fromName, toName, doc) {
    if (window.FastDocs) {
      if (window.FastDocs.find(fromName) && window.FastDocs.rename) {
        window.FastDocs.rename(fromName, toName);
      }
      if (window.FastDocs.find(toName)) {
        window.FastDocs.setMd(toName, doc.md);
        var d = window.FastDocs.find(toName);
        if (d) {
          d.updated = '刚刚';
          d.note = doc.note || d.note;
          d.size = doc.size || '5 KB';
          d.pages = doc.pages || '2 页';
        }
      } else {
        window.FastDocs.register({
          kind: 'md',
          deliverable: true,
          name: toName,
          size: doc.size || '5 KB',
          pages: doc.pages || '2 页',
          updated: '刚刚',
          author: '技术方案设计Agent',
          note: doc.note,
          md: doc.md,
        });
      }
    }
    if (window.FastFiles) {
      var renamed = window.FastFiles.renameDeliverable && window.FastFiles.renameDeliverable(fromName, toName);
      if (!renamed) {
        window.FastFiles.addDeliverable(SOLUTION_PACKAGE + '/' + toName);
      }
      window.FastFiles.markUpdated(toName);
      window.FastFiles.markNew();
    }
  }

  function createTechExecution() {
    var titles = TECH_TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    var thoughts = [
      [
        '正在读取 Demo Architecture Design v1',
        '对照画布 V4 与规则方案补齐生产边界',
        '写入 Solution Design Package /【架构方案设计】',
      ],
      [
        '确认架构含本体模块，满足执行条件',
        '继承并升级本体对象集 v1 → v2',
        '写入【本体方案设计】，同步异议复核对象',
      ],
      [
        '确认架构含智能体模块，满足执行条件',
        'Skill v1 → v2，并新增知识库 v1',
        'Agent方案设计 v1 → v2，收拢进 Solution Design Package',
      ],
      [
        '按升级后的完整方案展开验收路径',
        '覆盖核算、配额、校准、异议复核',
        '新增【测试用例设计】',
      ],
    ];

    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(260);
      }
    }

    return {
      process: async function (api) {
        await api.W('已确认开始执行。先把生产级技术方案长任务写入底稿，再按顺序继承升级。');
        await api.sleep(400);
        ensureSolutionPackageSeeds();
        await api.V({
          id: 'j3-tech-run',
          icon: 'edit',
          label: '已存底稿 · 生产级技术方案与验收 v1',
          details: [
            'Files → Long task 已写入四项技术任务',
            '已建 Solution Design Package（含对象集/Skill/Agent 方案 v1 底稿）',
            '产出将收拢至 Solution Design Package',
          ],
        });
        await api.sleep(360);
      },
      segments: [{
        md: '任务已启动。我会按进度卡逐项继承升级，侧栏将同步把对象集 / Skill / Agent 方案升版，并收拢到 **Solution Design Package**；全部完成后请你审阅全套技术方案与测试用例。',
        gap: 200,
      }],
      after: async function (ctx) {
        /* Keep the long-task plan card visible; progress lives only in the Agent reply. */
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        ensureSolutionPackageSeeds();
        await ctx.sleep(240);

        /* Task 1 — architecture */
        progress.start(0);
        await runThoughts(ctx, thoughts[0]);
        saveDraft({
          name: '架构方案设计.md',
          folder: SOLUTION_PACKAGE,
          note: 'Production architecture design',
          md:
            '# 架构方案设计（生产级 · 继承升级）\n\n' +
            '> 继承自 Architecture Design v1，面向生产部署补齐。\n\n' +
            '## 升级要点\n\n' +
            '- 保留 Demo 分层与模块边界\n' +
            '- 对齐场景定义画布 V4 与规则方案设计 v1\n' +
            '- 明确本体与智能体仍为架构组成部分（故后续任务 2/3 执行）\n',
        });
        progress.done(0);
        await ctx.sleep(200);

        /* Task 2 — ontology + 对象集 v1→v2 */
        progress.start(1);
        await runThoughts(ctx, thoughts[1]);
        saveDraft({
          name: '本体方案设计v3.md',
          folder: SOLUTION_PACKAGE,
          note: 'Production ontology design v3',
          md:
            '# 本体方案设计 v3（生产级 · 继承升级）\n\n' +
            '> 条件：现有架构包含本体 — 已满足。相对 Demo 本体方案继续升级。\n\n' +
            '## 升级要点\n\n' +
            '- 保留配额、小团队机动名额（人数 < 5 → 1 个 S 档）\n' +
            '- 补齐异议复核说明相关对象与关系\n',
        });
        bumpSolutionFile(ONTO_OBJ_V1, ONTO_OBJ_V2, {
          note: 'Ontology object set v2',
          md:
            '# 本体对象集 v2\n\n' +
            '> 由 v1 升级 · 对齐生产级本体方案与规则决策表。\n\n' +
            '## 变更\n\n' +
            '- 保留 Demo：部门人数 < 5 → 1 个 S 档机动名额\n' +
            '- 新增：异议复核说明相关对象与关系\n' +
            '- 对齐：强制分布拍板、借调会签字段\n',
        });
        progress.done(1);
        await ctx.sleep(200);

        /* Task 3 — Skill v1→v2, 知识库 v1, Agent方案 v1→v2 */
        progress.start(2);
        await runThoughts(ctx, thoughts[2]);
        bumpSolutionFile(SKILL_V1, SKILL_V2, {
          note: 'Skill v2',
          md:
            '# Skill v2\n\n' +
            '> 由 v1 升级 · 对齐规则方案与异议复核。\n\n' +
            '## 变更\n\n' +
            '- 保留三段式自评润色\n' +
            '- 配额答疑识别小团队机动名额规则\n' +
            '- 新增：异议复核说明整理（不直接改评级）\n',
        });
        saveDraft({
          name: KNOWLEDGE_V1,
          folder: SOLUTION_PACKAGE,
          note: 'Knowledge base v1',
          md:
            '# 知识库 v1\n\n' +
            '> 生产级新增 · 支撑答疑与异议复核判定。\n\n' +
            '## 收录\n\n' +
            '- 考核政策与强制分布口径摘要\n' +
            '- 配额表与小团队机动名额样例\n' +
            '- 异议复核受理说明与证据要求\n',
        });
        bumpSolutionFile(AGENT_DESIGN_V1, AGENT_DESIGN_V2, {
          note: 'Agent design v2',
          md:
            '# Agent方案设计 v2\n\n' +
            '> 由 v1 升级 · 条件：现有架构包含智能体 — 已满足。\n\n' +
            '## 升级要点\n\n' +
            '- 保留答疑与三段式自评润色\n' +
            '- 对齐规则决策表：核算 / 配额 / 异议复核判定\n' +
            '- 挂载 Skill v2 + 知识库 v1；Agent 辅助整理异议证据，不直接改评级\n',
        });
        progress.done(2);
        await ctx.sleep(200);

        /* Task 4 — test cases */
        progress.start(3);
        await runThoughts(ctx, thoughts[3]);
        saveDraft({
          name: '测试用例设计.md',
          folder: SOLUTION_PACKAGE,
          note: 'Scenario acceptance test cases',
          md:
            '# 测试用例设计\n\n' +
            '## 场景验收用例（节选）\n\n' +
            '| 编号 | 路径 | 预期 |\n|---|---|---|\n' +
            '| TC-01 | 绩效初评核算 | 生成可追溯快照 |\n' +
            '| TC-02 | 人数 < 5 申请 S 档 | 允许 1 个机动名额 |\n' +
            '| TC-03 | 评级校准入口 | 先展示占用/原因/影响再进入调整 |\n' +
            '| TC-04 | 员工异议复核 | 可发起说明；Agent 不直接改评级 |\n',
        });
        progress.done(3);
        progress.finish();
        thinking.finish();
        ctx.scroll();

        var wrap = document.createElement('div');
        ctx.host.appendChild(wrap);
        await ctx.run(wrap, [{
          md: '四项任务已完成。全套技术方案与可运行配套已收拢至 **Solution Design Package**，请审阅：\n\n' +
            '- [架构方案设计.md](架构方案设计.md)\n' +
            '- [本体方案设计v3.md](本体方案设计v3.md)\n' +
            '- [' + ONTO_OBJ_V2 + '](' + ONTO_OBJ_V2 + ')\n' +
            '- [' + SKILL_V2 + '](' + SKILL_V2 + ')\n' +
            '- [' + KNOWLEDGE_V1 + '](' + KNOWLEDGE_V1 + ')\n' +
            '- [' + AGENT_DESIGN_V2 + '](' + AGENT_DESIGN_V2 + ')\n' +
            '- [测试用例设计.md](测试用例设计.md)',
          gap: 240,
        }]);
        techExecDone = true;
        ctx.scroll();
        return { journey: '3', action: 'tech-plan-done' };
      },
    };
  }

  function buildProductionOntology(opts) {
    opts = opts || {};
    var ver = opts.version || 3;
    var name = opts.name || (ver >= 4 ? OBJECT_SET_V4 : OBJECT_SET_V3);
    var hireFactor = !!opts.hireFactor;
    var empProps = [
      ['name', 'string', '王晨'],
      ['dept', 'string', '后端平台组'],
      ['level', 'enum', 'P6 / P7'],
      ['headcount_dept', 'int', '4'],
      ['hire_date', 'date', hireFactor ? '2026-07-15' : '2025-03-01'],
    ];
    if (hireFactor) {
      empProps.push(['入职折算系数', 'decimal', '0.46（在岗天数/周期天数）']);
    }
    return {
      id: ver >= 4 ? 'perf-v4' : 'perf-v3',
      name: name,
      desc: hireFactor
        ? '生产级对象集 v4：在 v3 基础上为员工补「入职折算系数」，并挂接按在岗天数折算考核权重的计算规则。'
        : '生产级对象集 v3：围绕绩效服务对象构建；含配额、机动名额、异议复核等实体关系、规则动作与 Mock。',
      version: 'v' + ver,
      publishStatus: opts.publishStatus || 'pending',
      hub: 'Employee',
      compact: true,
      zoom: 0.9,
      objects: {
        Employee: {
          key: 'employee_id',
          src: 'HR 主数据 · 生产 Mock',
          props: empProps,
          links: [
            'Employee ─member_of→ Department',
            'Employee ─belongs_to→ DeptQuota',
            'SelfReviewDraft ─belongs_to→ Employee',
            'AppealReview ─raised_by→ Employee',
          ],
          gap: '绩效档案与组织编制待与 HR 正式系统打通。',
          fix: '已按生产级方案预留编制只读字段。',
        },
        Department: {
          key: 'dept_id',
          src: '组织架构 · 生产 Mock',
          props: [
            ['name', 'string', '后端平台组'],
            ['headcount', 'int', '4'],
            ['manager', 'string', '李然'],
          ],
          links: ['Employee ─member_of→ Department', 'Department ─owns→ DeptQuota'],
          gap: '编制人数样例待实时同步。',
          fix: '已与组织主数据抽样对齐。',
        },
        DeptQuota: {
          key: 'quota_id',
          src: '季度配额表 · 生产 Mock',
          props: [
            ['quarter', 'string', '2026-Q4'],
            ['s_band_slots', 'int', '1（小团队机动）'],
            ['a_band_slots', 'int', '4'],
            ['rule', 'string', '部门人数<5 → 允许1个S档'],
          ],
          links: [
            'Employee ─belongs_to→ DeptQuota',
            'AssessmentRule ─governs→ DeptQuota',
            'Department ─owns→ DeptQuota',
          ],
          gap: '机动名额覆盖范围待业务确认。',
          fix: '已写入人数 < 5 → 1 个 S 档规则。',
        },
        AssessmentRule: {
          key: 'rule_id',
          src: '规则方案设计 v1',
          props: [
            ['name', 'string', '季度绩效等级分布'],
            ['clause', 'string', hireFactor
              ? '小团队机动名额 + 异议复核互斥 + 入职折算系数'
              : '小团队机动名额 + 异议复核互斥'],
            ['owner', 'string', 'HRBP'],
            ['calc', 'string', hireFactor
              ? '入职折算系数 = 在岗天数 / 考核周期天数；考核权重按系数折算'
              : '—'],
          ],
          links: [
            'AssessmentRule ─governs→ DeptQuota',
            'AssessmentRule ─applies_in→ PerformanceCycle',
            'AssessmentRule ─constrains→ AppealReview',
            'AssessmentRule ─applies_to→ Employee',
          ],
          gap: '全量条文待结构化。',
          fix: hireFactor
            ? '已补入职折算系数计算规则，可在员工对象上调试。'
            : '核心核算 / 配额 / 异议条款已可被 Agent 引用。',
        },
        PerformanceCycle: {
          key: 'cycle_id',
          src: '考核日历 · 生产 Mock',
          props: [
            ['name', 'string', '2026-Q4'],
            ['status', 'enum', 'open / closed'],
            ['deadline', 'date', '2026-12-20'],
          ],
          links: [
            'AssessmentRule ─applies_in→ PerformanceCycle',
            'SelfReviewDraft ─in_cycle→ PerformanceCycle',
          ],
          gap: '周期开闭仍可手工维护。',
          fix: '已支持按季度自动开闭样例周期。',
        },
        SelfReviewDraft: {
          key: 'draft_id',
          src: '员工草稿 · 生产 Mock',
          props: [
            ['status', 'enum', 'draft / polished'],
            ['structure', 'string', '业绩成果 / 存在不足 / 下季度计划'],
            ['owner', 'ref', 'employee_id'],
          ],
          links: [
            'SelfReviewDraft ─belongs_to→ Employee',
            'EvidenceItem ─supports→ SelfReviewDraft',
            'ManagerReview ─reviews→ SelfReviewDraft',
            'AppealReview ─targets→ SelfReviewDraft',
          ],
          gap: '无',
          fix: '已固定三段式输出结构。',
        },
        ManagerReview: {
          key: 'review_id',
          src: '上级评价 · 生产 Mock',
          props: [
            ['manager', 'string', '李然'],
            ['band_suggest', 'enum', 'S / A / B'],
            ['comment', 'string', '交付稳定，需加强横向对齐'],
          ],
          links: ['ManagerReview ─reviews→ SelfReviewDraft'],
          gap: '上级评价仍为样例文本。',
          fix: '已挂到自评草稿并可并排对照。',
        },
        EvidenceItem: {
          key: 'evidence_id',
          src: '项目与指标摘录 · 生产 Mock',
          props: [
            ['type', 'enum', '交付 / 指标 / 协作'],
            ['summary', 'string', '核心接口 P99 下降 28%'],
            ['source', 'string', '监控周报'],
          ],
          links: ['EvidenceItem ─supports→ SelfReviewDraft', 'EvidenceItem ─supports→ AppealReview'],
          gap: '证据系统回流待补。',
          fix: '已支持从项目周报摘录样例证据。',
        },
        AppealReview: {
          key: 'appeal_id',
          src: '异议复核 · 生产 Mock',
          props: [
            ['status', 'enum', 'submitted / accepted / closed'],
            ['reason', 'string', '对初评等级有异议'],
            ['handler', 'string', '主管主责 / HRBP 会签'],
          ],
          links: [
            'AppealReview ─raised_by→ Employee',
            'AppealReview ─targets→ SelfReviewDraft',
            'AssessmentRule ─constrains→ AppealReview',
            'EvidenceItem ─supports→ AppealReview',
          ],
          gap: '正式工单系统未打通。',
          fix: '已按画布 V4 落异议复核说明对象，Agent 只辅助整理不改评级。',
        },
      },
      edges: [
        { id: 'member_of', from: 'Employee', to: 'Department', cn: '所属部门' },
        { id: 'owns', from: 'Department', to: 'DeptQuota', cn: '拥有配额' },
        { id: 'belongs_to', from: 'Employee', to: 'DeptQuota', cn: '归属配额' },
        { id: 'governs', from: 'AssessmentRule', to: 'DeptQuota', cn: '约束配额' },
        { id: 'applies_in', from: 'AssessmentRule', to: 'PerformanceCycle', cn: '适用周期' },
        { id: 'applies_to', from: 'AssessmentRule', to: 'Employee', cn: '作用于员工' },
        { id: 'owns_draft', from: 'SelfReviewDraft', to: 'Employee', cn: '归属员工' },
        { id: 'in_cycle', from: 'SelfReviewDraft', to: 'PerformanceCycle', cn: '所属周期' },
        { id: 'supports', from: 'EvidenceItem', to: 'SelfReviewDraft', cn: '支撑自评' },
        { id: 'reviews', from: 'ManagerReview', to: 'SelfReviewDraft', cn: '上级评价' },
        { id: 'raised_by', from: 'AppealReview', to: 'Employee', cn: '由员工发起' },
        { id: 'targets', from: 'AppealReview', to: 'SelfReviewDraft', cn: '针对初评' },
        { id: 'constrains', from: 'AssessmentRule', to: 'AppealReview', cn: '约束复核' },
        { id: 'supports_appeal', from: 'EvidenceItem', to: 'AppealReview', cn: '支撑异议' },
      ],
      actions: [
        { id: 'check-quota', n: '核配额', cn: '核对部门 S/A 档名额', on: ['DeptQuota', 'Employee', 'Department'] },
        { id: 'apply-s-band', n: '机动名额', cn: '小团队申请 S 档机动名额', on: ['DeptQuota', 'AssessmentRule'] },
        { id: 'polish-draft', n: '润色', cn: '按三段式润色自评', on: ['SelfReviewDraft', 'EvidenceItem'] },
        { id: 'open-cycle', n: '开周期', cn: '打开本季度考核周期', on: ['PerformanceCycle'] },
        { id: 'submit-appeal', n: '异议复核', cn: '员工发起初评异议复核说明', on: ['AppealReview', 'Employee', 'AssessmentRule'] },
      ].concat(hireFactor ? [
        { id: 'calc-hire-factor', n: '入职折算', cn: '按在岗天数计算入职折算系数', on: ['Employee', 'PerformanceCycle', 'AssessmentRule'] },
      ] : []),
      mockCols: ['对象', 'Mock 示例'],
      mockRows: [
        ['Employee', hireFactor
          ? '王晨 · 2026-07-15 入职 · 折算系数 0.46'
          : '王晨 · 后端平台组 · 编制 4 人'],
        ['Department', '后端平台组 · 负责人 李然'],
        ['DeptQuota', '2026-Q4 · S档 1（机动） · A档 4'],
        ['AssessmentRule', hireFactor
          ? '折算系数=在岗天数/周期天数 · 异议不得绕过强制分布'
          : '人数<5 允许 1 个 S 档 · 异议不得绕过强制分布'],
        ['PerformanceCycle', '2026-Q4 · open · 截止 12-20'],
        ['SelfReviewDraft', '三段式：业绩成果 / 存在不足 / 下季度计划'],
        ['ManagerReview', '李然 · 建议 A · 交付稳定'],
        ['EvidenceItem', '核心接口 P99 下降 28% · 监控周报'],
        ['AppealReview', 'submitted · 对初评有异议 · 主管受理'],
      ],
      hint: hireFactor
        ? '生产级对象集 v4：Employee 已含「入职折算系数」；点选员工节点可查看属性与计算规则动作。标签默认为待发布，可手动切为已发布。'
        : '生产级对象集 v3：可点选节点调试实体关系；右侧检查器展示规则动作与 Mock。配合规则方案与 To-be 动作链路验证。',
    };
  }

  function publishObjectSet(opts) {
    if (window.FastModules && window.FastModules.publishOntology) {
      window.FastModules.publishOntology(buildProductionOntology(opts || { version: 3, name: OBJECT_SET_V3 }));
    }
  }

  function openObjectSet(opts) {
    publishObjectSet(opts);
    if (window.FastModules) window.FastModules.open('ontology');
  }

  function openCurrentObjectSet(opts) {
    opts = opts || {};
    var status = opts.publishStatus || (opts.asPublished ? 'published' : 'pending');
    if (currentObjectSetName === OBJECT_SET_V5) {
      openObjectSet({
        version: 5,
        name: OBJECT_SET_V5,
        hireFactor: true,
        publishStatus: status,
      });
    } else if (currentObjectSetName === OBJECT_SET_V4) {
      openObjectSet({
        version: 4,
        name: OBJECT_SET_V4,
        hireFactor: true,
        publishStatus: status,
      });
    } else {
      openObjectSet({ version: 3, name: OBJECT_SET_V3, publishStatus: status });
    }
  }

  function publishCompanionModules(opts) {
    opts = opts || {};
    var FM = window.FastModules;
    if (!FM) return;
    if (FM.publishSkill) {
      /* A production Skill supersedes the two Demo Skills restored from Journey 2. */
      FM.publishSkill(null);
      FM.publishSkill({
        id: 'journey-skill',
        name: opts.skillName || 'Skillv3',
        version: opts.skillVer || 'v3',
        slug: (opts.skillName || 'Skillv3').toLowerCase(),
        desc: opts.skillDesc || '生产级 Skill：配额答疑、自评润色、入职折算与异议复核。',
        file: opts.skillFile || SKILL_V3,
        publishStatus: opts.publishStatus || 'pending',
      });
    }
    if (FM.publishKnowledge) {
      FM.publishKnowledge({
        id: 'journey-kb',
        name: opts.kbName || '知识库v2',
        source: 'Craft',
        meta: opts.kbMeta || '政策 · 折算 · 复核 · 已索引',
        desc: opts.kbDesc || '生产级知识库：考核政策、折算口径、异议复核说明。',
        file: opts.kbFile || KNOWLEDGE_V2,
        publishStatus: opts.publishStatus || 'pending',
      });
    }
    if (FM.publishMcp) {
      FM.publishMcp({
        id: 'journey-mcp',
        name: opts.mcpName || 'MCPv1',
        letter: 'M',
        color: '#4f46e5',
        desc: opts.mcpDesc || '绩效服务只读连接：配额 / 周期 / 证据。',
        chip: 'read-only',
        file: opts.mcpFile || MCP_V1,
        publishStatus: opts.publishStatus || 'pending',
      });
    }
  }

  function publishProductionAgent() {
    publishCompanionModules({
      skillName: 'Skillv3',
      skillVer: 'v3',
      skillFile: SKILL_V3,
    });
    if (window.FastModules && window.FastModules.publishAgent) {
      window.FastModules.publishAgent({
        id: 'perf-agent-v3',
        name: AGENT_V3,
        letter: 'A',
        color: '#6a54f0',
        role: '绩效配额核算、自评润色与异议复核辅助 · 已绑定已发布对象集v4',
        model: 'Auto',
        caps: ['Skill × 生产级', '知识库', 'MCP'],
        boundOnto: OBJECT_SET_V4,
        status: '就绪 · 可调试',
        state: 'ready',
        cta: '调试',
        publishStatus: 'pending',
      });
    }
    if (window.FastAgentPanel) {
      if (window.FastAgentPanel.setIdentity) {
        window.FastAgentPanel.setIdentity({
          name: AGENT_V3,
          display: '绩效服务 Agent · v3',
        });
      }
      if (window.FastAgentPanel.ensureRegistered) window.FastAgentPanel.ensureRegistered();
    }
    if (window.FastDocs && !window.FastDocs.find(AGENT_V3)) {
      var ico = '<svg class="ws-ico" width="14" height="14" aria-hidden="true"><use href="#ws-agent"/></svg>';
      window.FastDocs.register({
        name: AGENT_V3,
        kind: 'agent',
        deliverable: true,
        iconHtml: ico,
        build: function () {
          var host = document.createElement('div');
          host.className = 'fa-wrap';
          requestAnimationFrame(function () {
            if (window.FastAgentPanel) window.FastAgentPanel.open('try');
          });
          return host;
        },
      });
    }
    if (window.FastFiles) {
      window.FastFiles.addDeliverable(SOLUTION_PACKAGE + '/' + AGENT_V3);
      window.FastFiles.markUpdated(AGENT_V3);
      window.FastFiles.markNew();
      window.FastFiles.showTab(true);
    }
  }

  function openAgentDebug() {
    if (window.FastAgentPanel) window.FastAgentPanel.open('try');
    else if (window.FastModules) window.FastModules.open('agent');
  }

  function publishAgentVersion(opts) {
    opts = opts || {};
    var name = opts.name || AGENT_V4;
    var fromName = opts.fromName || AGENT_V3;
    var bound = opts.boundOnto || currentObjectSetName || OBJECT_SET_V5;
    if (window.FastDocs && fromName && fromName !== name) {
      if (window.FastDocs.find(fromName) && window.FastDocs.rename) {
        window.FastDocs.rename(fromName, name);
      }
    }
    if (window.FastFiles && fromName && fromName !== name && window.FastFiles.renameDeliverable) {
      window.FastFiles.renameDeliverable(fromName, name);
    }
    if (window.FastModules && window.FastModules.publishAgent) {
      window.FastModules.publishAgent({
        id: opts.id || 'perf-agent-v4',
        name: name,
        letter: 'A',
        color: '#6a54f0',
        role: opts.role || ('绩效服务 Agent · 已绑定' + bound),
        model: 'Auto',
        caps: opts.caps || ['Skill × v4', '知识库', 'MCP'],
        boundOnto: bound,
        status: '就绪 · 可调试',
        state: 'ready',
        cta: '调试',
        publishStatus: opts.publishStatus || 'pending',
      });
    }
    if (window.FastAgentPanel) {
      if (window.FastAgentPanel.setIdentity) {
        window.FastAgentPanel.setIdentity({
          name: name,
          display: opts.display || ('绩效服务 Agent · ' + name.replace(/^Agent\s*/i, '')),
        });
      }
      if (window.FastAgentPanel.ensureRegistered) window.FastAgentPanel.ensureRegistered();
    }
    if (window.FastDocs && !window.FastDocs.find(name)) {
      var ico = '<svg class="ws-ico" width="14" height="14" aria-hidden="true"><use href="#ws-agent"/></svg>';
      window.FastDocs.register({
        name: name,
        kind: 'agent',
        deliverable: true,
        iconHtml: ico,
        build: function () {
          var host = document.createElement('div');
          host.className = 'fa-wrap';
          requestAnimationFrame(function () {
            if (window.FastAgentPanel) window.FastAgentPanel.open('try');
          });
          return host;
        },
      });
    }
    if (window.FastFiles) {
      window.FastFiles.addDeliverable(SOLUTION_PACKAGE + '/' + name);
      window.FastFiles.markUpdated(name);
      window.FastFiles.markNew();
      window.FastFiles.showTab(true);
    }
  }

  function createOntoBuildPlan() {
    ontoBuildDone = true;
    return {
      process: async function (api) {
        await api.W('技术方案已确认。开始围绕绩效服务对象，构建生产级本体对象集，便于调试实体关系、规则与动作。');
        await api.sleep(420);
        await api.V({
          id: 'j3-onto-scope',
          icon: 'ontology',
          label: '已界定本体构建范围',
          details: [
            '服务对象：员工 / 部门 / 配额 / 考核周期 / 自评 / 上级评价',
            '生产补齐：异议复核说明（AppealReview）',
            '约束来源：本体方案设计 v3 · 规则方案设计 v1 · 画布 V4',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-onto-rel',
          icon: 'search',
          label: '正在编织实体关系与动作',
          details: [
            '关系：归属、配额约束、周期适用、异议发起与受理',
            '动作：核配额 · 机动名额 · 润色 · 开周期 · 异议复核',
            '对齐：Skill v2 / 知识库 v1 / Agent方案设计 v2',
          ],
        });
        await api.sleep(500);
        await api.V({
          id: 'j3-onto-pub',
          icon: 'edit',
          label: '已生成可调试对象集 v3',
          details: [
            'Files → Solution Design Package / 对象集v3',
            '可由侧栏或入口打开本体对象集画板',
            '支持点选节点调试属性、关系、规则动作与 Mock',
          ],
        });
        await api.sleep(420);
        await api.W('本体对象集构建完成，正在打开右侧对象集画板供你调试。');
        bumpSolutionFile(ONTO_OBJ_V2, OBJECT_SET_V3 + '.md', {
          note: 'Production object set v3',
          size: '6 KB',
          pages: '3 页',
          md:
            '# 对象集 v3\n\n' +
            '> 生产级可运行本体对象集 · 由本体对象集 v2 升级。\n\n' +
            '## 服务对象\n\n' +
            'Employee / Department / DeptQuota / AssessmentRule / PerformanceCycle / SelfReviewDraft / ManagerReview / EvidenceItem / **AppealReview**\n\n' +
            '## 调试说明\n\n' +
            '请在右侧本体对象集画板中点选节点，核对实体关系、规则动作与 Mock 数据是否与规则方案、To-be 动作一致。\n',
        });
        /* Also keep a clean display name row if bump renamed from 本体对象集v2 */
        if (window.FastDocs && !window.FastDocs.find(OBJECT_SET_V3 + '.md')) {
          saveDraft({
            name: OBJECT_SET_V3 + '.md',
            folder: SOLUTION_PACKAGE,
            note: 'Production object set v3',
            md: '# 对象集 v3\n\n生产级可调试对象集。\n',
          });
        }
        currentObjectSetName = OBJECT_SET_V3;
        publishObjectSet({ version: 3, name: OBJECT_SET_V3, publishStatus: 'pending' });
        await api.sleep(360);
      },
      segments: [{
        md: '### 执行结论\n\n' +
          '已围绕绩效服务对象完成 **生产级本体对象构建**，并发布可调试的 **' + OBJECT_SET_V3 + '**。\n\n' +
          '- 在 Demo 对象集基础上，补齐异议复核等生产级实体与关系。\n' +
          '- 规则动作已挂到配额校验、机动名额、自评润色与异议复核链路，便于你对照【规则方案设计 v1】调试。\n' +
          '- 右侧已打开本体对象集画板；也可从下方入口再次进入。\n\n' +
          '打开对象集：[' + OBJECT_SET_V3 + '](' + OBJECT_SET_V3 + '.md)',
        gap: 280,
      }],
      after: async function (ctx) {
        if (window.FastFlow && window.FastFlow.deliverableSummary) {
          appendNode(ctx, window.FastFlow.deliverableSummary({
            title: '本体对象已就绪',
            body: '生产级对象集 v3 已生成，可直接在画板中调试实体关系、规则与动作。',
            lead: '相关交付：',
            items: [
              {
                name: OBJECT_SET_V3,
                file: OBJECT_SET_V3 + '.md',
                iconName: OBJECT_SET_V3 + '.md',
                kind: 'md',
                open: function () {
                  if (window.FastDocs) window.FastDocs.open(OBJECT_SET_V3 + '.md');
                },
              },
            ],
            entriesLabel: '相关入口',
            entries: [
              {
                name: '本体对象集',
                open: openCurrentObjectSet,
              },
            ],
            conclusion: '建议先在画板中核对接关系与动作，再继续生产级 Agent / Skill 联调。',
            ask: '实体关系若要改，直接告诉我要动哪条边或哪个对象。',
          }));
        }
        setTimeout(function () {
          openCurrentObjectSet();
        }, 420);
        ctx.scroll();
        return { journey: '3', action: 'onto-build-v3-done' };
      },
    };
  }

  function createOntoTweakPlan() {
    ontoTweakDone = true;
    return {
      process: async function (api) {
        await api.W('收到本体调试反馈：年中入职员工需按在岗天数折算考核权重，准备在员工对象上补「入职折算系数」及计算规则。');
        await api.sleep(420);
        await api.V({
          id: 'j3-onto-tweak-locate',
          icon: 'search',
          label: '已定位修改点',
          details: [
            '对象：Employee（员工）',
            '新增属性：入职折算系数',
            '依赖：hire_date · PerformanceCycle 周期天数',
          ],
        });
        await api.sleep(460);
        await api.V({
          id: 'j3-onto-tweak-rule',
          icon: 'edit',
          label: '正在写入计算规则',
          details: [
            '入职折算系数 = 在岗天数 / 考核周期天数',
            '考核权重按系数折算后参与核算',
            '挂到 AssessmentRule.calc，并新增「入职折算」动作',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-onto-tweak-pub',
          icon: 'ontology',
          label: '已产出对象集 v4（待发布）',
          details: [
            'Files → Solution Design Package / 对象集v4',
            '右侧本体卡片更名为对象集v4',
            '默认标签：待发布（可手动切换为已发布）',
          ],
        });
        await api.sleep(400);
        await api.W('改写完成，正在刷新对象集画板。');
        bumpSolutionFile(OBJECT_SET_V3 + '.md', OBJECT_SET_V4 + '.md', {
          note: 'Production object set v4 — hire proration factor',
          size: '7 KB',
          pages: '3 页',
          md:
            '# 对象集 v4\n\n' +
            '> 由对象集 v3 升级 · 待发布\n\n' +
            '## 变更\n\n' +
            '- **Employee** 新增属性：`入职折算系数`（decimal）\n' +
            '- **计算规则**：入职折算系数 = 在岗天数 / 考核周期天数；考核权重按系数折算\n' +
            '- **动作**：入职折算（Employee · PerformanceCycle · AssessmentRule）\n',
        });
        currentObjectSetName = OBJECT_SET_V4;
        publishObjectSet({
          version: 4,
          name: OBJECT_SET_V4,
          hireFactor: true,
          publishStatus: 'pending',
        });
        await api.sleep(320);
      },
      segments: [{
        md: '### 执行结论\n\n' +
          '已按调试反馈更新本体，并再次产出 **' + OBJECT_SET_V4 + '**。\n\n' +
          '1. 在 **Employee** 上新增属性 **入职折算系数**（示例：年中入职 → 0.46）。\n' +
          '2. 在 **AssessmentRule** 写入计算规则：`入职折算系数 = 在岗天数 / 考核周期天数`，考核权重按系数折算。\n' +
          '3. 对象集版本 **v3 → v4**；右侧本体卡片已同步为 **对象集v4**，默认 **待发布**（可手动点标签切为已发布）。\n\n' +
          '打开对象集：[' + OBJECT_SET_V4 + '](' + OBJECT_SET_V4 + '.md)',
        gap: 280,
      }],
      after: async function (ctx) {
        if (window.FastFlow && window.FastFlow.deliverableSummary) {
          appendNode(ctx, window.FastFlow.deliverableSummary({
            title: '对象集已升级为 v4',
            body: '入职折算系数与计算规则已写入；当前为待发布状态，可在本体卡片上切换为已发布。',
            lead: '相关交付：',
            items: [
              {
                name: OBJECT_SET_V4,
                file: OBJECT_SET_V4 + '.md',
                iconName: OBJECT_SET_V4 + '.md',
                kind: 'md',
                open: function () {
                  if (window.FastDocs) window.FastDocs.open(OBJECT_SET_V4 + '.md');
                },
              },
            ],
            entriesLabel: '相关入口',
            entries: [
              {
                name: '本体对象集',
                open: openCurrentObjectSet,
              },
            ],
            conclusion: '建议在画板中点选 Employee，确认「入职折算系数」属性与「入职折算」动作后，再决定是否切为已发布。',
            ask: '还要补别的属性或规则，直接说对象名即可。',
          }));
        }
        setTimeout(function () {
          openCurrentObjectSet();
        }, 420);
        ctx.scroll();
        return { journey: '3', action: 'onto-tweak-v4-done' };
      },
    };
  }

  async function startTechExecution() {
    if (techExecStarted || !window.FastChat) return;
    techExecStarted = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('确认开始执行');
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, TECH_TASKS, '', '生产级技术方案与验收 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createTechExecution());
  }

  function createAgentAssemblyPlan() {
    agentAssemblyPlanStarted = true;
    var objName = currentObjectSetName || OBJECT_SET_V4;
    var card = window.FastFlow && window.FastFlow.taskPlanCard({
      tasks: AGENT_ASSEMBLY_TASKS,
      progressive: true,
      title: '任务清单',
      brief: '生产级智能体配套与组装 · ' + AGENT_ASSEMBLY_TASKS.length + ' 项长任务',
      buttonLabel: '确认开始执行',
      hint: '确认后先构建配套组件，再组装绑定 Agent。如需调整，直接告诉我。',
    });

    return {
      process: async function (api) {
        await api.W('对象集已调试确认。进入智能体方案落地：先校验对象集与前置依赖，再编排配套组件与组装绑定长任务。');
        await api.sleep(420);
        await api.V({
          id: 'j3-agent-asm-onto',
          icon: 'ontology',
          label: '已校验对象集',
          details: [
            '当前基线：' + objName + '（含入职折算系数）',
            '实体关系 / 规则动作已可被 Skill · Agent 引用',
            '发布标签可作为生产联调口径',
          ],
        });
        await api.sleep(460);
        await api.V({
          id: 'j3-agent-asm-deps',
          icon: 'search',
          label: '已校验前置依赖',
          details: [
            'Agent方案设计：生产级智能体与配套组件范围已定',
            '技术方案 / 规则方案：核算 · 配额 · 异议复核口径可落地',
            '场景定义画布 V4 · 原型：人机交接与主路径已对齐',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-agent-asm-order',
          icon: 'edit',
          label: '已编排组装顺序',
          details: AGENT_ASSEMBLY_TASKS.map(function (task, i) {
            return (i + 1) + '. ' + task.title + ' · ' + task.agent + ' · ' + task.status;
          }),
        });
        await api.sleep(400);
        await api.W('结论：先补齐 Skill / 知识库 / MCP，再构建 Agent 并绑定对象集 v4 与配套组件。');
        await api.sleep(340);
      },
      segments: [{
        md: '### 结论\n\n' +
          '对象集已调试确认，这一步要做的是把 **Agent 方案落地为可运行的生产级智能体**。\n\n' +
          '我先做了两道校验：\n\n' +
          '1. **对象集校验** — 当前基线为 **' + objName + '**（含入职折算系数与考核权重规则），实体关系与规则动作已可被下游 Skill / Agent 引用。\n' +
          '2. **前置依赖校验** — Agent 方案、技术方案、规则方案与场景画布 V4 口径齐全，具备组装条件。\n\n' +
          '因此本轮按两步推进：先构建配套组件（修改 Skill、知识库，新增 MCP），再构建生产级智能体并完成与 **对象集v4** 及配套组件的组装绑定。\n\n' +
          '**下面是建议的长任务安排，确认后即可开始执行。**',
        gap: 280,
      }],
      after: async function (ctx) {
        if (!card) return { journey: '3', action: 'agent-assembly-plan-missing' };
        appendNode(ctx, card.node);
        for (var i = 0; i < AGENT_ASSEMBLY_TASKS.length; i++) {
          await ctx.sleep(300);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(240);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startAgentAssemblyExecution, 0);
        return { journey: '3', action: 'agent-assembly-plan-confirmed' };
      },
    };
  }

  function createAgentAssemblyExecution() {
    var titles = AGENT_ASSEMBLY_TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    var thoughts = [
      [
        '正在升级 Skill v2 → v3（对齐入职折算与异议复核）',
        '知识库 v1 → v2，收录折算口径与复核说明',
        '新增 MCP：绩效服务只读连接（配额 / 周期 / 证据）',
      ],
      [
        '将 Demo 轻量 Agent 升格为生产级 Agent v3',
        '绑定已发布对象集v4 与 Skill / 知识库 / MCP',
        '登记 Files → Solution Design Package / Agent v3',
      ],
    ];

    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(260);
      }
    }

    return {
      process: async function (api) {
        await api.W('已确认开始执行。先写入长任务底稿，再按顺序自动完成配套组件与智能体组装。');
        await api.sleep(380);
        ensureSolutionPackageSeeds();
        await api.V({
          id: 'j3-agent-asm-run',
          icon: 'edit',
          label: '已存底稿 · 生产级智能体配套与组装 v1',
          details: [
            'Files → Long task 已写入两项组装任务',
            '负责：智能体打造Agent · 完成后自动继续',
            '目标：产出 Agent v3，并绑定已发布对象集v4',
          ],
        });
        await api.sleep(320);
      },
      segments: [{
        md: '任务已启动。我会按进度卡自动跑完两项长任务：先补齐 Skill / 知识库 / MCP，再组装 **Agent v3** 并绑定已发布的 **对象集v4**。',
        gap: 200,
      }],
      after: async function (ctx) {
        /* Keep the long-task plan card visible; progress lives only in the Agent reply. */
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        ensureSolutionPackageSeeds();
        await ctx.sleep(240);

        /* Task 1 — companion components */
        progress.start(0);
        await runThoughts(ctx, thoughts[0]);
        bumpSolutionFile(SKILL_V2, SKILL_V3, {
          note: 'Skill v3 · production',
          md:
            '# Skill v3\n\n' +
            '> 由 Skill v2 升级 · 对齐对象集v4 与入职折算。\n\n' +
            '## 变更\n\n' +
            '- 保留三段式自评润色与配额答疑\n' +
            '- 新增：入职折算系数说明（在岗天数 / 周期天数）\n' +
            '- 异议复核说明整理（不直接改评级）\n',
        });
        bumpSolutionFile(KNOWLEDGE_V1, KNOWLEDGE_V2, {
          note: 'Knowledge base v2',
          md:
            '# 知识库 v2\n\n' +
            '> 由知识库 v1 升级 · 支撑生产级答疑与复核。\n\n' +
            '## 新增收录\n\n' +
            '- 入职折算系数口径与样例\n' +
            '- 异议复核受理说明与证据要求\n' +
            '- 小团队 S 档机动名额 FAQ\n',
        });
        saveDraft({
          name: MCP_V1,
          folder: SOLUTION_PACKAGE,
          note: 'Performance MCP v1',
          md:
            '# MCP v1\n\n' +
            '> 生产级新增 · 绩效服务只读连接。\n\n' +
            '## 能力\n\n' +
            '- 读取部门配额 / 考核周期 / 在岗天数\n' +
            '- 读取自评草稿与异议证据摘要\n' +
            '- 只读，不写回正式评级\n',
        });
        publishCompanionModules({
          skillName: 'Skillv3',
          skillVer: 'v3',
          skillFile: SKILL_V3,
          kbName: '知识库v2',
          kbFile: KNOWLEDGE_V2,
          mcpName: 'MCPv1',
          mcpFile: MCP_V1,
        });
        progress.done(0);
        await ctx.sleep(220);

        /* Task 2 — agent assemble + bind */
        progress.start(1);
        await runThoughts(ctx, thoughts[1]);
        publishObjectSet({
          version: 4,
          name: OBJECT_SET_V4,
          hireFactor: true,
          publishStatus: 'published',
        });
        currentObjectSetName = OBJECT_SET_V4;
        publishProductionAgent();
        progress.done(1);
        progress.finish();
        thinking.finish();
        ctx.scroll();
        await ctx.sleep(360);

        var wrap = document.createElement('div');
        ctx.host.appendChild(wrap);
        await ctx.run(wrap, [{
          md: '### 执行结论\n\n' +
            '两项长任务已全部自动完成。\n\n' +
            '1. **配套组件**：Skill v2 → **Skill v3**，知识库 v1 → **知识库 v2**，并新增 **MCP v1**。\n' +
            '2. **智能体组装**：Demo 轻量 Agent 已升格为生产级 **Agent v3**，并与已发布的 **对象集v4** 完成绑定（同时挂载 Skill / 知识库 / MCP）。\n\n' +
            '可运行交付已收拢至 **Solution Design Package**。',
          gap: 240,
        }]);

        if (window.FastFlow && window.FastFlow.deliverableSummary) {
          appendNode(ctx, window.FastFlow.deliverableSummary({
            title: '产出清单',
            body: '本轮可运行交付以智能体为主：Demo 轻量版已升级为生产级 Agent v3，并绑定已发布对象集v4。',
            lead: '本轮产出：',
            items: [
              {
                name: AGENT_V3,
                iconName: 'Agent.agent',
                kind: 'agent',
                open: openAgentDebug,
              },
            ],
            entriesLabel: '相关入口',
            entries: [
              {
                name: 'Agent 调试',
                open: openAgentDebug,
              },
              {
                name: '本体对象集',
                open: function () {
                  openCurrentObjectSet({ asPublished: true });
                },
              },
            ],
            conclusion: 'Agent v3 已就绪。可从下方入口进入 Agent 调试试跑，或打开本体对象集核对已发布的对象集v4 绑定关系。',
            ask: '试跑中若要改 Skill、绑定或对象关系，直接告诉我即可。',
          }));
        }
        agentAssemblyDone = true;
        ctx.scroll();
        return { journey: '3', action: 'agent-assembly-done' };
      },
    };
  }

  async function startAgentAssemblyExecution() {
    if (agentAssemblyExecStarted || !window.FastChat) return;
    agentAssemblyExecStarted = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('确认开始执行');
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, AGENT_ASSEMBLY_TASKS, '', '生产级智能体配套与组装 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createAgentAssemblyExecution());
  }

  function createSyncChangePlan() {
    syncChangePlanStarted = true;
    var card = window.FastFlow && window.FastFlow.taskPlanCard({
      tasks: SYNC_CHANGE_TASKS,
      progressive: true,
      title: '任务清单',
      brief: '跨部门借调联动变更 · ' + SYNC_CHANGE_TASKS.length + ' 项长任务',
      buttonLabel: '确认开始执行',
      hint: '任务 1、2 完成后停下审核；确认通过后任务 3–5 自动继续。',
    });

    return {
      process: async function (api) {
        await api.W('收到联调反馈：跨部门借调流程与规则需联动调整。先拆需求变化与规则变化，再编排全链路同步任务。');
        await api.sleep(420);
        await api.V({
          id: 'j3-sync-req',
          icon: 'search',
          label: '已识别需求变化',
          details: [
            '跨部门/多项目不可仅单一主管初评',
            '自评后新增：各项目经理填工时占比与贡献评语',
            '需同步 To-be · 用户故事 · 交互页面',
          ],
        });
        await api.sleep(460);
        await api.V({
          id: 'j3-sync-rule',
          icon: 'ontology',
          label: '已识别规则变化',
          details: [
            '最终绩效得分按项目工时占比加权',
            '工时占比 < 20%：不参与权重，仅作参考评语',
            '需同步规则方案 → 技术/本体/智能体',
          ],
        });
        await api.sleep(480);
        await api.V({
          id: 'j3-sync-order',
          icon: 'edit',
          label: '已编排五步同步顺序',
          details: SYNC_CHANGE_TASKS.map(function (task, i) {
            return (i + 1) + '. ' + task.title + ' · ' + task.status;
          }),
        });
        await api.sleep(400);
        await api.W('结论：产品与规则先改并停下审核；通过后技术、对象集、智能体自动跟齐。');
        await api.sleep(340);
      },
      segments: [{
        md: '### 结论\n\n' +
          '联调暴露的是 **需求 + 规则** 两处根因，需要从产品方案一路同步到本体与智能体：\n\n' +
          '1. **流程与交互** — 自评后增加「各项目经理填写项目工时占比与项目贡献评语」节点及页面；不可仅单一主管初评。\n' +
          '2. **业务规则** — 最终得分按项目工时占比加权；占比低于 **20%** 的项目不参与权重，仅作参考评语。\n\n' +
          '本轮长任务按「产品 → 规则（停下审核）→ 技术 → 对象集 → 智能体」推进；任务 1、2 确认通过后，后面三项自动继续。\n\n' +
          '**下面是建议的长任务安排，确认后即可开始执行。**',
        gap: 280,
      }],
      after: async function (ctx) {
        if (!card) return { journey: '3', action: 'sync-change-plan-missing' };
        appendNode(ctx, card.node);
        for (var i = 0; i < SYNC_CHANGE_TASKS.length; i++) {
          await ctx.sleep(280);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(220);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startSyncChangeExecution, 0);
        return { journey: '3', action: 'sync-change-plan-confirmed' };
      },
    };
  }

  function createSyncChangeExecution() {
    var titles = SYNC_CHANGE_TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    var thoughts = [
      [
        '回写 To-be：自评后插入项目经理工时占比 / 贡献评语节点',
        '更新用户故事：多项目人员不再单一主管初评',
        '原型补「项目工时与贡献」填写页',
      ],
      [
        '改写规则方案：最终得分 = 工时占比加权',
        '写入门槛：占比 < 20% 不参与权重、仅参考评语',
        '对齐借调 / 多项目场景判定表',
      ],
      [
        '架构方案设计 → v3',
        '本体方案设计 v3 → v4 · Agent方案设计 → v4',
        '测试用例设计 → v2',
      ],
      [
        '对象集 v4 → v5：项目工时占比 · 项目贡献评语',
        '挂接加权折算与参考评语动作',
        '右侧本体卡片同步为对象集v5',
      ],
      [
        'Skill v3 → v4',
        'Agent v3 → v4，绑定对象集v5',
        '刷新右侧 Agent 卡片与 Files',
      ],
    ];

    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(250);
      }
    }

    async function awaitPass(ctx, reviewOpts, taskIndex) {
      thinking.waitForUser();
      ctx.scroll();
      var review = window.FastFlow.deliverableConfirmation(reviewOpts);
      appendNode(ctx, review.node);
      ctx.scroll();
      var result = await review.done;
      if (result === '已暂停' || (result && result.indexOf('已提交意见') === 0)) {
        progress.wait(taskIndex);
        thinking.waitForUser();
        var held = document.createElement('div');
        ctx.host.appendChild(held);
        await ctx.run(held, [{
          md: result === '已暂停'
            ? '已暂停。准备好后告诉我，我再从当前任务继续。'
            : '已记录修改意见，暂不继续后续任务。\n\n> ' +
              confirmedBoundary(result).replace(/\n/g, '\n> '),
          gap: 200,
        }]);
        return null;
      }
      thinking.resume();
      return result;
    }

    return {
      process: async function (api) {
        await api.W('已确认开始执行。先写入联动变更长任务底稿，再按进度卡推进；任务 1、2 会停下请你确认通过。');
        await api.sleep(360);
        await api.V({
          id: 'j3-sync-run',
          icon: 'edit',
          label: '已存底稿 · 跨部门借调联动变更 v1',
          details: [
            'Files → Long task 已写入五项同步任务',
            '任务 1–2：停下审核',
            '任务 3–5：确认后自动继续',
          ],
        });
        await api.sleep(300);
      },
      segments: [{
        md: '任务已启动。我会先改产品方案与业务规则并停下审核；你确认通过后，技术、对象集与智能体将自动跟齐。',
        gap: 200,
      }],
      after: async function (ctx) {
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        await ctx.sleep(240);

        /* Task 1 — product / interaction */
        progress.start(0);
        await runThoughts(ctx, thoughts[0]);
        var flowBoundary = (lastBoundary ? lastBoundary + '\n\n' : '') + PROJECT_HOURS_FLOW;
        var flowStories =
          (lastStoryNote ? lastStoryNote + '\n\n' : '') +
          '5. **项目经理 · 工时与贡献**：员工自评后，各项目经理填写项目工时占比与项目贡献评语，再进入主管初评。\n' +
          '6. **约束**：跨部门/多项目人员不可仅由单一主管初评。';
        bumpScenarioCanvas({
          toVersion: 5,
          boundary: flowBoundary,
          stories: flowStories,
          status: 'V5 · 已纳入项目经理工时占比节点',
        });
        lastBoundary = flowBoundary;
        lastStoryNote = flowStories;
        bumpSolutionFile(PROTO_DOC, PROTO_DOC_V2, {
          note: 'Prototype v2 · project hours',
          md:
            '# 原型设计 v2\n\n' +
            '> 由原型设计 v1 升级 · 联调联动变更。\n\n' +
            '## 新增页面\n\n' +
            '- 项目工时占比与贡献评语填写页（项目经理）\n' +
            '- 主管初评前展示各项目工时/评语汇总\n',
        });
        var t1Pass = await awaitPass(ctx, {
          headTitle: '需要你确认',
          headHint: '已预选确认通过，可直接确认',
          title: '业务协同与交互方案已更新',
          desc: '场景定义画布已升至 V5，原型设计已升至 v2：自评后增加项目经理工时占比与贡献评语节点及对应页面。',
          passLabel: '方案没问题，确认通过',
          pauseLabel: '先暂停一下',
          file: SCENARIO_CANVAS_V5,
          result: '业务协同与交互方案已审核通过',
        }, 0);
        if (!t1Pass) return { journey: '3', action: 'sync-change-t1-held' };
        thinking.add('任务 1 已确认通过，继续更新业务规则方案');
        progress.done(0);
        await ctx.sleep(200);

        /* Task 2 — rules */
        progress.start(1);
        await runThoughts(ctx, thoughts[1]);
        bumpSolutionFile(RULES_DOC, RULES_DOC_V2, {
          note: 'Rules design v2 · hours weight',
          md:
            '# 规则方案设计 v2\n\n' +
            '> 由规则方案设计 v1 升级 · 联调联动变更。\n\n' +
            '## 变更\n\n' +
            '- ' + PROJECT_HOURS_RULE + '\n' +
            '- 与 To-be 项目经理填写节点对齐\n',
        });
        var t2Pass = await awaitPass(ctx, {
          headTitle: '需要你确认',
          headHint: '已预选确认通过，可直接确认',
          title: '业务规则方案已更新',
          desc: '规则方案设计已升至 v2：最终得分按项目工时占比加权；占比低于 20% 仅作参考评语。',
          passLabel: '方案没问题，确认通过',
          pauseLabel: '先暂停一下',
          file: RULES_DOC_V2,
          result: '业务规则方案已审核通过',
        }, 1);
        if (!t2Pass) return { journey: '3', action: 'sync-change-t2-held' };
        thinking.add('任务 2 已确认通过，自动继续技术 / 对象集 / 智能体同步');
        progress.done(1);
        await ctx.sleep(200);

        /* Task 3 — tech docs (named version bumps) */
        progress.start(2);
        await runThoughts(ctx, thoughts[2]);
        bumpSolutionFile(ARCH_DOC, ARCH_DOC_V3, {
          note: 'Architecture design v3',
          md:
            '# 架构方案设计 v3\n\n' +
            '> 由架构方案设计升级 · 联调联动变更。\n\n' +
            '## 变更\n\n' +
            '- 纳入项目工时占比采集与加权核算链路\n' +
            '- 对齐场景定义画布 V5 与规则方案设计 v2\n',
        });
        bumpSolutionFile(ONTO_DESIGN_V3, ONTO_DESIGN_V4, {
          note: 'Ontology design v4',
          md:
            '# 本体方案设计 v4\n\n' +
            '> 由本体方案设计 v3 升级 · 联调联动变更。\n\n' +
            '## 变更\n\n' +
            '- 新增项目工时占比 / 项目贡献评语相关对象与关系\n' +
            '- 加权折算与 20% 门槛写入计算规则\n',
        });
        bumpSolutionFile(AGENT_DESIGN_V2, AGENT_DESIGN_V4, {
          note: 'Agent design v4',
          md:
            '# Agent方案设计 v4\n\n' +
            '> 由 Agent方案设计 v2 升级 · 联调联动变更。\n\n' +
            '## 变更\n\n' +
            '- 答疑口径对齐工时占比加权\n' +
            '- 引导项目经理完成占比与评语填写\n',
        });
        bumpSolutionFile(TEST_DOC, TEST_DOC_V2, {
          note: 'Test cases v2',
          md:
            '# 测试用例设计 v2\n\n' +
            '> 由测试用例设计升级 · 联调联动变更。\n\n' +
            '| 编号 | 路径 | 预期 |\n|---|---|---|\n' +
            '| TC-11 | 多项目自评后 | 须各项目经理填占比与评语 |\n' +
            '| TC-12 | 占比 < 20% | 不参与权重，仅参考评语 |\n' +
            '| TC-13 | 加权核算 | 最终得分按有效占比折算 |\n',
        });
        progress.done(2);
        await ctx.sleep(200);

        /* Task 4 — object set v5 */
        progress.start(3);
        await runThoughts(ctx, thoughts[3]);
        bumpSolutionFile(OBJECT_SET_V4 + '.md', OBJECT_SET_V5 + '.md', {
          note: 'Object set v5 · project hours',
          md:
            '# 对象集 v5\n\n' +
            '> 由对象集 v4 升级 · 联调联动变更。\n\n' +
            '## 变更\n\n' +
            '- 新增：项目工时占比、项目贡献评语\n' +
            '- 计算规则：' + PROJECT_HOURS_RULE + '\n' +
            '- 动作：采集占比 · 加权折算 · 参考评语标记\n',
        });
        currentObjectSetName = OBJECT_SET_V5;
        publishObjectSet({
          version: 5,
          name: OBJECT_SET_V5,
          hireFactor: true,
          publishStatus: 'published',
        });
        progress.done(3);
        await ctx.sleep(200);

        /* Task 5 — Skill v4 + Agent v4 */
        progress.start(4);
        await runThoughts(ctx, thoughts[4]);
        bumpSolutionFile(SKILL_V3, SKILL_V4, {
          note: 'Skill v4 · project hours',
          md:
            '# Skill v4\n\n' +
            '> 由 Skill v3 升级 · 联调联动变更。\n\n' +
            '## 变更\n\n' +
            '- 引导项目经理填写工时占比与贡献评语\n' +
            '- 答疑说明 20% 门槛与加权折算\n',
        });
        publishCompanionModules({
          skillName: 'Skillv4',
          skillVer: 'v4',
          skillFile: SKILL_V4,
          skillDesc: '生产级 Skill：工时占比加权、项目经理填报引导、配额与异议答疑。',
          kbName: '知识库v2',
          kbFile: KNOWLEDGE_V2,
          mcpName: 'MCPv1',
          mcpFile: MCP_V1,
        });
        publishAgentVersion({
          fromName: AGENT_V3,
          name: AGENT_V4,
          boundOnto: OBJECT_SET_V5,
          role: '已同步借调/工时占比规则 · 绑定对象集v5',
          caps: ['Skill × v4', '知识库', 'MCP'],
          display: '绩效服务 Agent · v4',
          publishStatus: 'pending',
        });
        progress.done(4);
        progress.finish();
        var execTotal = progress.node.querySelector('[data-exec-total]');
        if (execTotal) execTotal.textContent = '已完成';
        thinking.finish();
        ctx.scroll();
        await ctx.sleep(320);

        var wrap = document.createElement('div');
        ctx.host.appendChild(wrap);
        await ctx.run(wrap, [{
          md: '### 执行总结\n\n' +
            '五步联动变更已全部完成（任务 1、2 经你确认通过，任务 3–5 自动跟齐）。任务组状态：**已完成**。\n\n' +
            '| 层级 | 本轮升版 |\n|---|---|\n' +
            '| 产品 / 交互 | 场景定义画布 **V5** · 原型设计 **v2** |\n' +
            '| 业务规则 | 规则方案设计 **v2** |\n' +
            '| 技术方案 | 架构方案设计 **v3** · 本体方案设计 **v4** · Agent方案设计 **v4** · 测试用例设计 **v2** |\n' +
            '| 可运行资产 | 对象集 **v5** · Skill **v4** · Agent **v4** |\n\n' +
            '左侧 Files 与右侧 Modules 已同步上述升版。',
          gap: 240,
        }]);

        if (window.FastFlow && window.FastFlow.deliverableSummary) {
          appendNode(ctx, window.FastFlow.deliverableSummary({
            title: '产出清单',
            body: '以下为本轮有变化的文档与可运行资产，点击蓝色链接可直接打开。',
            lead: '变化文档：',
            items: [
              { name: '场景定义画布V5', file: SCENARIO_CANVAS_V5, iconName: SCENARIO_CANVAS_V5, kind: 'md' },
              { name: '原型设计v2', file: PROTO_DOC_V2, iconName: PROTO_DOC_V2, kind: 'md' },
              { name: '规则方案设计v2', file: RULES_DOC_V2, iconName: RULES_DOC_V2, kind: 'md' },
              { name: '架构方案设计v3', file: ARCH_DOC_V3, iconName: ARCH_DOC_V3, kind: 'md' },
              { name: '本体方案设计v4', file: ONTO_DESIGN_V4, iconName: ONTO_DESIGN_V4, kind: 'md' },
              { name: 'Agent方案设计v4', file: AGENT_DESIGN_V4, iconName: AGENT_DESIGN_V4, kind: 'md' },
              { name: '测试用例设计v2', file: TEST_DOC_V2, iconName: TEST_DOC_V2, kind: 'md' },
              { name: OBJECT_SET_V5, file: OBJECT_SET_V5 + '.md', iconName: OBJECT_SET_V5 + '.md', kind: 'md' },
              { name: 'Skillv4', file: SKILL_V4, iconName: SKILL_V4, kind: 'md' },
              { name: AGENT_V4, iconName: 'Agent.agent', kind: 'agent', open: openAgentDebug },
            ],
            entriesLabel: '相关入口',
            entries: [
              { name: 'Agent 调试', open: openAgentDebug },
              {
                name: '本体对象集',
                open: function () { openCurrentObjectSet({ asPublished: true }); },
              },
            ],
            conclusion: '可再开一轮联调，核对项目经理填报与加权核算是否符合预期。',
            ask: '若还要改门槛比例或页面交互，直接说即可。',
          }));
        }
        ctx.scroll();
        return { journey: '3', action: 'sync-change-done' };
      },
    };
  }

  async function startSyncChangeExecution() {
    if (syncChangeExecStarted || !window.FastChat) return;
    syncChangeExecStarted = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('确认开始执行');
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, SYNC_CHANGE_TASKS, '', '跨部门借调联动变更 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createSyncChangeExecution());
  }

  function currentPrompt() {
    if (!snapshotReady) return SNAPSHOT_PROMPT;
    if (!kickoffDone) return KICKOFF_PROMPT;
    if (!productPlanStarted) return PRODUCT_PROMPT;
    if (productPlanDone && !focusReviseDone) return FOCUS_PROMPT;
    if (focusReviseDone && !rulesPlanDone) return RULES_PROMPT;
    if (rulesPlanDone && !techPlanStarted) return TECH_PROMPT;
    if (techExecDone && !ontoBuildDone) return ONTO_BUILD_PROMPT;
    if (ontoBuildDone && !ontoTweakDone) return ONTO_TWEAK_PROMPT;
    if (ontoTweakDone && !agentAssemblyPlanStarted) return AGENT_ASSEMBLY_PROMPT;
    if (agentAssemblyDone && !syncChangePlanStarted) return SYNC_CHANGE_PROMPT;
    return '';
  }

  function installSpaceHook() {
    if (!window.FastJourneyRoute || window.FastJourneyRoute.__j3SpaceHooked) return;
    var prev = window.FastJourneyRoute.prompt;
    window.FastJourneyRoute.prompt = function () {
      if (window.FastJourneyRoute.get() === '3') return currentPrompt();
      return typeof prev === 'function' ? prev() : '';
    };
    window.FastJourneyRoute.__j3SpaceHooked = true;
  }
  installSpaceHook();

  window.addEventListener('fastjourneychange', function (e) {
    if (!e.detail || e.detail.journey !== '3') {
      snapshotReady = false;
      kickoffDone = false;
      productPlanStarted = false;
      productExecStarted = false;
      productPlanDone = false;
      focusReviseDone = false;
      rulesPlanDone = false;
      techPlanStarted = false;
      techExecStarted = false;
      techExecDone = false;
      ontoBuildDone = false;
      ontoTweakDone = false;
      agentAssemblyPlanStarted = false;
      agentAssemblyExecStarted = false;
      agentAssemblyDone = false;
      syncChangePlanStarted = false;
      syncChangeExecStarted = false;
      currentObjectSetName = OBJECT_SET_V3;
      lastBoundary = '';
      lastStoryNote = '';
      scenarioCanvasName = SCENARIO_CANVAS_V1;
    }
  });

  /* Manual 待发布 ↔ 已发布 toggle on ontology card → Agent deep-think feedback. */
  var ontoPublishFeedbackRunning = false;
  function createOntoPublishFeedback(detail) {
    detail = detail || {};
    var name = detail.name || currentObjectSetName || OBJECT_SET_V4;
    var published = detail.status === 'published';
    return {
      process: async function (api) {
        if (published) {
          await api.W('检测到你把「' + name + '」从待发布切换为已发布。');
          await api.sleep(360);
          await api.V({
            id: 'j3-onto-pub-check',
            icon: 'search',
            label: '已核对发布前状态',
            details: [
              '对象集版本：' + (detail.version || name),
              '含入职折算系数与考核权重计算规则',
              '实体关系 / 规则动作已可被下游引用',
            ],
          });
          await api.sleep(420);
          await api.V({
            id: 'j3-onto-pub-lock',
            icon: 'ontology',
            label: '已标记为已发布',
            details: [
              '当前版本作为生产联调基线',
              '后续改动建议升版后再发',
              'Agent / Skill 将按已发布对象集读取口径',
            ],
          });
          await api.sleep(360);
          await api.W('发布状态已同步到会话，可继续联调或告诉我下一步。');
        } else {
          await api.W('检测到你把「' + name + '」从已发布切回待发布。');
          await api.sleep(320);
          await api.V({
            id: 'j3-onto-unpub',
            icon: 'edit',
            label: '已恢复为待发布',
            details: [
              '对象集仍可继续调试改属性 / 规则',
              '下游请暂勿按正式基线引用',
            ],
          });
          await api.sleep(300);
        }
      },
      segments: [{
        md: published
          ? '已记录：**' + name + '** 现为 **已发布**。\n\n' +
            '我会把它当作当前生产联调基线；若还要改「入职折算系数」或关系边，建议先切回待发布、改完再发新版。'
          : '已记录：**' + name + '** 现为 **待发布**。\n\n' +
            '可以继续在画板里改属性与规则；定稿后再切回已发布即可。',
        gap: 220,
      }],
    };
  }

  async function onOntologyPublishChange(e) {
    if (!onJourney3() || !e.detail) return;
    if (!window.FastChat || ontoPublishFeedbackRunning) return;
    ontoPublishFeedbackRunning = true;
    try {
      while (window.FastChat.isBusy && window.FastChat.isBusy()) {
        await new Promise(function (resolve) { setTimeout(resolve, 80); });
      }
      await window.FastChat.run(createOntoPublishFeedback(e.detail));
    } finally {
      ontoPublishFeedbackRunning = false;
    }
  }
  document.addEventListener('fastontologypublish', onOntologyPublishChange);

  window.JourneyThreePlan = {
    take: function (text) {
      if (matchesSyncChange(text)) return createSyncChangePlan();
      if (matchesAgentAssembly(text)) return createAgentAssemblyPlan();
      if (matchesOntoTweak(text)) return createOntoTweakPlan();
      if (matchesOntoBuild(text)) return createOntoBuildPlan();
      if (matchesTech(text)) return createTechPlan();
      if (matchesRules(text)) return createRulesPlan();
      if (matchesFocusRevise(text)) return createFocusRevisePlan();
      if (matchesProduct(text)) return createProductPlan();
      if (matchesKickoff(text)) return createKickoffPlan(text);
      if (matchesSnapshot(text)) return createSnapshotPlan();
      return null;
    },
    prompt: currentPrompt,
    isSnapshotReady: function () { return snapshotReady; },
  };
}());
