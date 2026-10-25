/**
 * Journey 2 — 售前 / 早期 POC：直接建单场景 → 场景确认 → 写入后询问进入打造。
 * 仅本故事线；确认创建后的深度思考 + 进入打造卡对齐主存档交互，不改 WorkshopCreateScene。
 */
(function () {
  'use strict';

  var PROMPT = '直接帮我新建一个‘研发绩效核算与自评答疑助手’的业务场景，用来核对研发人员季度绩效指标配额、解答考核规则并辅助写绩效自评。';
  var CRAFT_PROMPT = '帮我快速搭个Demo看看效果，先跑通一个能核对绩效配额规则、回答考核制度问题并帮员工润色自评草稿的Demo。';
  var TWEAK_PROMPT = '我刚试跑了一下Demo，有两个地方帮我快速调一下好拿去给客户演示：一是部门人数少于5人时允许有1个S档机动名额，别直接卡死为0；二是润色自评时固定按‘业绩成果、存在不足、下季度计划’三段式输出。';
  var SCENE_ID = 'j2';
  var pendingEnterCard = null;
  var entered = false;
  var craftStarted = false;
  var executionStarted = false;
  var executionCompleted = false;
  var tweakStarted = false;
  var tweakRunning = false;
  var tweakCompleted = false;
  var agentDemoPublished = false;
  var AGENT_DEMO_NAME = 'Agent demo';
  var AGENT_TRIAL_PROMPTS = [
    '4人小团队申请1个S档名额',
    '帮我润色一段后端开发自评',
  ];

  function buildPerfOntology(opts) {
    opts = opts || {};
    var sBand = !!opts.sBand;
    return {
      id: 'perf',
      name: '研发绩效对象集',
      desc: '员工绩效档案、部门配额、考核规则与自评草稿等 8 个对象；含关系边、规则动作与自动 Mock 数据。',
      version: sBand ? 'v0.2' : 'v0.1',
      hub: 'Employee',
      compact: true,
      zoom: 0.9,
      objects: {
        Employee: {
          key: 'employee_id',
          src: 'HR 主数据 · Demo Mock',
          props: [
            ['name', 'string', '王晨'],
            ['dept', 'string', '后端平台组'],
            ['level', 'enum', 'P6 / P7'],
            ['headcount_dept', 'int', sBand ? '4' : '12'],
          ],
          links: ['Employee ─member_of→ Department', 'Employee ─belongs_to→ DeptQuota', 'SelfReviewDraft ─belongs_to→ Employee'],
          gap: '绩效档案与组织编制尚未和 HR 正式系统打通。',
          fix: '已接入 HR 只读编制字段。',
        },
        Department: {
          key: 'dept_id',
          src: '组织架构 · Demo Mock',
          props: [
            ['name', 'string', '后端平台组'],
            ['headcount', 'int', sBand ? '4' : '12'],
            ['manager', 'string', '李然'],
          ],
          links: ['Employee ─member_of→ Department', 'Department ─owns→ DeptQuota'],
          gap: '编制人数来自样例表，未实时同步。',
          fix: '已与组织主数据抽样对齐。',
        },
        DeptQuota: {
          key: 'quota_id',
          src: '季度配额表 · Demo Mock',
          props: [
            ['quarter', 'string', '2026-Q4'],
            ['s_band_slots', 'int', sBand ? '1（小团队机动）' : '2'],
            ['a_band_slots', 'int', '4'],
            ['rule', 'string', sBand ? '部门人数<5 → 允许1个S档' : '按编制比例核算'],
          ],
          links: ['Employee ─belongs_to→ DeptQuota', 'AssessmentRule ─governs→ DeptQuota', 'Department ─owns→ DeptQuota'],
          gap: sBand ? '小团队机动名额规则已写入 Mock，待业务确认覆盖范围。' : '人数过少时 S 档会卡死为 0，缺少机动名额口径。',
          fix: '已支持部门人数 < 5 时允许 1 个 S 档机动名额。',
        },
        AssessmentRule: {
          key: 'rule_id',
          src: '考核制度摘录 · Demo Mock',
          props: [
            ['name', 'string', '季度绩效等级分布'],
            ['clause', 'string', sBand ? '小团队可申请1个S档机动名额' : 'S档按部门编制比例分配'],
            ['owner', 'string', 'HRBP'],
          ],
          links: ['AssessmentRule ─governs→ DeptQuota', 'AssessmentRule ─applies_in→ PerformanceCycle'],
          gap: '规则条文仍是摘录文本，未做全量结构化。',
          fix: '核心配额条款已结构化并可被 Agent 引用。',
        },
        PerformanceCycle: {
          key: 'cycle_id',
          src: '考核日历 · Demo Mock',
          props: [
            ['name', 'string', '2026-Q4'],
            ['status', 'enum', 'open / closed'],
            ['deadline', 'date', '2026-12-20'],
          ],
          links: ['AssessmentRule ─applies_in→ PerformanceCycle', 'SelfReviewDraft ─in_cycle→ PerformanceCycle'],
          gap: '周期开闭状态目前手工维护。',
          fix: '已支持按季度自动开闭样例周期。',
        },
        SelfReviewDraft: {
          key: 'draft_id',
          src: '员工草稿 · Demo Mock',
          props: [
            ['status', 'enum', 'draft / polished'],
            ['structure', 'string', sBand ? '业绩成果 / 存在不足 / 下季度计划' : '自由段落'],
            ['owner', 'ref', 'employee_id'],
          ],
          links: ['SelfReviewDraft ─belongs_to→ Employee', 'EvidenceItem ─supports→ SelfReviewDraft', 'ManagerReview ─reviews→ SelfReviewDraft'],
          gap: '润色结构未固定，输出不稳定。',
          fix: '已固定三段式输出结构。',
        },
        ManagerReview: {
          key: 'review_id',
          src: '上级评价 · Demo Mock',
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
          src: '项目与指标摘录 · Demo Mock',
          props: [
            ['type', 'enum', '交付 / 指标 / 协作'],
            ['summary', 'string', '核心接口 P99 下降 28%'],
            ['source', 'string', '监控周报'],
          ],
          links: ['EvidenceItem ─supports→ SelfReviewDraft'],
          gap: '证据仍需人工粘贴，缺少系统回流。',
          fix: '已支持从项目周报摘录样例证据。',
        },
      },
      edges: [
        { id: 'member_of', from: 'Employee', to: 'Department', cn: '所属部门' },
        { id: 'owns', from: 'Department', to: 'DeptQuota', cn: '拥有配额' },
        { id: 'belongs_to', from: 'Employee', to: 'DeptQuota', cn: '归属配额' },
        { id: 'governs', from: 'AssessmentRule', to: 'DeptQuota', cn: '约束配额' },
        { id: 'applies_in', from: 'AssessmentRule', to: 'PerformanceCycle', cn: '适用周期' },
        { id: 'owns_draft', from: 'SelfReviewDraft', to: 'Employee', cn: '归属员工' },
        { id: 'in_cycle', from: 'SelfReviewDraft', to: 'PerformanceCycle', cn: '所属周期' },
        { id: 'supports', from: 'EvidenceItem', to: 'SelfReviewDraft', cn: '支撑自评' },
        { id: 'reviews', from: 'ManagerReview', to: 'SelfReviewDraft', cn: '上级评价' },
      ],
      actions: [
        { id: 'check-quota', n: '核配额', cn: '核对部门 S/A 档名额', on: ['DeptQuota', 'Employee', 'Department'] },
        { id: 'apply-s-band', n: '机动名额', cn: '小团队申请 S 档机动名额', on: ['DeptQuota', 'AssessmentRule'] },
        { id: 'polish-draft', n: '润色', cn: '按三段式润色自评', on: ['SelfReviewDraft', 'EvidenceItem'] },
        { id: 'open-cycle', n: '开周期', cn: '打开本季度考核周期', on: ['PerformanceCycle'] },
      ],
      mockCols: ['对象', 'Mock 示例'],
      mockRows: [
        ['Employee', '王晨 · 后端平台组 · 编制 ' + (sBand ? '4' : '12') + ' 人'],
        ['Department', '后端平台组 · 负责人 李然'],
        ['DeptQuota', '2026-Q4 · S档 ' + (sBand ? '1（机动）' : '2') + ' · A档 4'],
        ['AssessmentRule', sBand ? '人数<5 允许 1 个 S 档机动名额' : '按编制比例分配 S 档'],
        ['PerformanceCycle', '2026-Q4 · open · 截止 12-20'],
        ['SelfReviewDraft', sBand ? '三段式：业绩成果 / 存在不足 / 下季度计划' : '自由段落草稿'],
        ['ManagerReview', '李然 · 建议 A · 交付稳定'],
        ['EvidenceItem', '核心接口 P99 下降 28% · 监控周报'],
      ],
      hint: '画布可点选节点调试属性与关系；右侧检查器展示规则动作与 Mock 缺口。数据均为 Demo 自动生成。',
    };
  }

  function publishPerfOntology(opts) {
    if (window.FastModules && window.FastModules.publishOntology) {
      window.FastModules.publishOntology(buildPerfOntology(opts));
    }
  }

  var TWEAK_DELIVERABLES = [
    {
      name: 'Ontology Design v2.md',
      display: '本体方案设计 v2',
      note: 'Updated ontology design — small-team S-band quota rule',
      md:
        '# 本体方案设计 v2\n\n' +
        '> 更新文档 · 相对 Ontology Design v1\n\n' +
        '## 变更摘要\n\n' +
        '- **PerformanceQuota**：新增小团队机动名额规则——部门人数少于 5 人时，允许 1 个 S 档机动名额（不再卡死为 0）。\n' +
        '- 其余对象与关系沿用 v1。\n\n' +
        '## 规则口径\n\n' +
        '| 条件 | 结果 |\n|---|---|\n| 部门人数 ≥ 5 | 按原配额表核算 S 档 |\n| 部门人数 < 5 | 允许 1 个 S 档机动名额 |\n\n' +
        '## 交付说明\n\n本文件为试跑反馈后的**更新文档**，供对象集与 Mock 同步使用。\n',
    },
    {
      name: 'Agent Design v2.md',
      display: 'Agent方案设计 v2',
      note: 'Updated agent design — three-part self-review polish',
      md:
        '# Agent方案设计 v2\n\n' +
        '> 更新文档 · 相对 Agent Design v1\n\n' +
        '## 变更摘要\n\n' +
        '- **Draft polish Skill / 提示词**：自评润色固定输出「业绩成果、存在不足、下季度计划」三段式。\n' +
        '- 配额答疑需识别小团队 S 档机动名额规则（与本体 v2 对齐）。\n\n' +
        '## 试跑话术\n\n1. 「4人小团队申请1个S档名额」\n2. 「帮我润色一段后端开发自评」\n\n' +
        '## 交付说明\n\n本文件为试跑反馈后的**更新文档**，供 Skill / Agent 配置同步使用。\n',
    },
  ];

  var TWEAK_TASKS = [
    {
      title: '同步更新Demo轻量技术方案',
      desc: '修改【本体方案设计】【Agent方案设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '更新本体对象集配额规则与Mock数据',
      desc: '修改【对象集】。',
      agent: '本体构建Agent',
      status: '自动继续',
    },
    {
      title: '更新智能体Skill与提示词配置',
      desc: '修改【Skill】【Agent】。',
      agent: '智能体打造Agent',
      status: '自动继续',
    },
  ];

  var DELIVERABLES = [
    {
      task: 0,
      name: 'Architecture Design v1.md',
      note: 'Architecture design for the R&D performance Demo',
      md:
        '# Architecture Design v1\n\n' +
        '> Demo scope: quarterly performance quota check · assessment policy Q&A · self-review polishing\n\n' +
        '## 1. Goal\n\nShip a **runnable Demo** with minimal assumptions. Skip heavy upfront requirement / knowledge design; keep a single conversational path that can be trial-run immediately.\n\n' +
        '## 2. System sketch\n\n| Layer | Responsibility |\n|---|---|\n| Conversation | Accept quota / policy / self-review questions |\n| Rule service | Resolve quota indicators and assessment clauses |\n| Draft assist | Rewrite self-review drafts with cited criteria |\n| Knowledge (light) | Policy snippets + quota table samples |\n\n' +
        '## 3. Runtime assumptions\n\n- Single Agent first; no multi-agent orchestration in v1\n- Policy and quota tables can start as Demo fixtures\n- Human remains accountable for final self-review submission\n\n' +
        '## 4. Deliverable of this step\n\nArchitecture Design v1 — used as the gate for Ontology / Agent design.\n',
    },
    {
      task: 1,
      name: 'Ontology Design v1.md',
      note: 'Ontology design for performance quota and review objects',
      md:
        '# Ontology Design v1\n\n> Condition: execute when Architecture Design includes ontology.\n\n' +
        '## 1. Core objects\n\n| Object | Purpose |\n|---|---|\n| Employee | R&D person under quarterly review |\n| PerformanceQuota | Indicator quotas / targets for the quarter |\n| AssessmentRule | Policy clauses used for Q&A |\n| SelfReviewDraft | Employee draft text pending polish |\n| EvidenceItem | Supporting facts linked to a draft statement |\n\n' +
        '## 2. Key relations\n\n- Employee **has** PerformanceQuota\n- AssessmentRule **governs** PerformanceQuota\n- SelfReviewDraft **belongs_to** Employee\n- EvidenceItem **supports** SelfReviewDraft\n\n' +
        '## 3. Query intents to support\n\n1. “What is my quota for indicator X this quarter?”\n2. “Does rule Y allow exception Z?”\n3. “Rewrite this self-review paragraph with stronger evidence.”\n\n' +
        '## 4. Deliverable of this step\n\nOntology Design v1 — input for Object Set build.\n',
    },
    {
      task: 2,
      name: 'Agent Design v1.md',
      note: 'Agent design for the runnable Demo assistant',
      md:
        '# Agent Design v1\n\n> Condition: execute when Architecture Design includes agents.\n\n' +
        '## 1. Agent profile\n\n- **Name:** Quarterly Performance Quota & Self-Review Assistant\n- **Type:** Single agent\n- **Owner scene:** R&D Performance Intelligence Management\n\n' +
        '## 2. Capability map\n\n| Capability | Behavior |\n|---|---|\n| Quota check | Look up indicator quotas and explain gaps |\n| Policy Q&A | Answer assessment-rule questions with citations |\n| Draft polish | Rewrite self-review text while keeping facts |\n\n' +
        '## 3. Supporting components (as needed)\n\n- **Skill:** quota lookup · rule retrieve · draft rewrite\n- **Knowledge:** assessment policy excerpts · sample quota tables\n- **MCP:** optional HR / performance system read (mocked in Demo)\n\n' +
        '## 4. Trial prompts\n\n1. “核对我本季度绩效指标配额”\n2. “这条考核规则怎么解释？”\n3. “帮我润色这段自评草稿”\n\n' +
        '## 5. Deliverable of this step\n\nAgent Design v1 — input for runnable Agent build.\n',
    },
  ];

  /* Long-task list: map product copy onto the shared card fields (title / desc / agent / status). */
  var DEMO_TASKS = [
    {
      title: '快速确定技术架构方案',
      desc: '新增【架构方案设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '快速设计本体方案',
      desc: '条件：架构方案包含本体时执行；新增【本体方案设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '快速设计智能体及配套组件方案',
      desc: '条件：架构方案包含智能体时执行；新增【Agent方案设计】。',
      agent: '技术方案设计Agent',
      status: '自动继续',
    },
    {
      title: '构建可运行的本体对象集',
      desc: '条件：架构方案包含本体时执行；新增【对象集】。',
      agent: '本体构建Agent',
      status: '自动继续',
    },
    {
      title: '构建可运行的智能体及配套组件',
      desc: '条件：架构方案包含智能体时执行；按需新增【Skill】【知识库】【MCP】、新增【Agent】。',
      agent: '智能体打造Agent',
      status: '自动继续',
    },
  ];

  var APP = {
    title: '研发绩效智能管理',
    desc: '面向研发组织的绩效管理应用场景，统一覆盖指标配额核算、考核规则答疑与自评辅助，便于后续按业务子场景逐步扩展 Agent 能力。',
  };
  var BIZ = {
    name: '季度绩效配额核算与自评答疑',
    desc: '核对研发人员季度绩效指标配额，解答考核规则疑问，并辅助撰写可提交的绩效自评。',
    priority: 'Quick win',
  };

  /* Sidebar + chat enter card stay English, matching existing Scenarios language. */
  var SIDEBAR = {
    title: 'R&D Performance Intelligence Management',
    desc: 'Application scenario for R&D performance accounting, policy Q&A, and self-review assistance.',
    biz: [{
      name: 'Quarterly Performance Quota & Self-Review Q&A',
      desc: 'Check quarterly performance quotas, answer assessment rules, and help draft self-reviews.',
      priority: 'Quick win',
    }],
  };

  /* Scenario Planning copy (Journey 2 only): longer Scenario + Rationale for the Business card. */
  var PLANNING_BIZ = {
    title: SIDEBAR.biz[0].name,
    badge: 'New',
    priority: 'Quick Win',
    scenario:
      'Each quarter, R&D managers and engineers spend hours reconciling indicator quotas, interpreting assessment rules, and rewriting self-reviews. Policies are scattered across HR docs and team notes, so answers stay inconsistent and drafts often miss required evidence. This business scenario checks quota allocation against the current policy, answers rule questions with cited criteria, and helps draft a structured self-review ready for submission.',
    rationale:
      'Quick Win with clear near-term POC value: cuts repetitive policy lookup and draft rewriting in every review cycle. Data readiness is moderate (assessment policy + quota tables), so a single-agent assistant can ship without waiting for full enterprise planning. Directly matches the demo ask—quota check, rule Q&A, and self-review support in one runnable flow.',
  };

  var MORE_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="4" cy="8" r="1.15" fill="currentColor"/><circle cx="8" cy="8" r="1.15" fill="currentColor"/><circle cx="12" cy="8" r="1.15" fill="currentColor"/></svg>';
  var MENU = '<div class="scene-menu" hidden role="menu"><button type="button" role="menuitem">Edit</button><button type="button" class="scene-menu-danger" role="menuitem">Delete</button></div>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function matches(text) {
    if (!window.FastJourneyRoute || window.FastJourneyRoute.get() !== '2') return false;
    var normalized = String(text || '').replace(/\s+/g, '');
    return normalized === PROMPT.replace(/\s+/g, '') ||
      (normalized.indexOf('研发绩效核算与自评答疑助手') !== -1 &&
        normalized.indexOf('业务场景') !== -1);
  }

  function matchesCraft(text) {
    if (!entered || craftStarted) return false;
    if (!window.FastJourneyRoute || window.FastJourneyRoute.get() !== '2') return false;
    var normalized = String(text || '').replace(/\s+/g, '');
    return normalized === CRAFT_PROMPT.replace(/\s+/g, '') ||
      (normalized.indexOf('快速搭个Demo') !== -1 &&
        normalized.indexOf('绩效配额') !== -1);
  }

  function matchesTweak(text) {
    if (!entered || !executionCompleted || tweakStarted) return false;
    if (!window.FastJourneyRoute || window.FastJourneyRoute.get() !== '2') return false;
    var normalized = String(text || '').replace(/\s+/g, '');
    return normalized === TWEAK_PROMPT.replace(/\s+/g, '') ||
      (normalized.indexOf('试跑了一下Demo') !== -1 &&
        normalized.indexOf('S档机动名额') !== -1);
  }

  function appendNode(ctx, node) {
    var segment = document.createElement('div');
    segment.className = 'ao-seg stream-enter';
    segment.appendChild(node);
    ctx.host.appendChild(segment);
    ctx.scroll();
  }

  function packHtml(o) {
    return '<div class="scene-unit scene-unit-app"><div class="scene-unit-head"><h4 class="scene-unit-title">' + esc(o.title) + '</h4>' +
      '<button type="button" class="scene-unit-more" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' + MORE_SVG + '</button>' + MENU + '</div>' +
      '<div class="scene-unit-tags"><span class="scene-kicker">Application</span><span class="scene-stage is-crafting"><span class="dot" aria-hidden="true"></span>Crafting</span></div>' +
      '<p class="scene-unit-desc">' + esc(o.desc) + '</p>' +
      '<div class="scene-unit-actions"><button type="button" class="scene-build">Continue crafting</button></div></div>' +
      '<div class="scene-children"><div class="scene-biz-list">' + o.biz.map(function (b) {
        return '<div class="scene-biz"><div class="scene-unit-head"><h4 class="scene-unit-title">' + esc(b.name) + '</h4>' +
          '<button type="button" class="scene-unit-more" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' + MORE_SVG + '</button>' + MENU + '</div>' +
          '<div class="scene-unit-tags"><span class="scene-kicker scene-kicker-biz">Business</span><span class="scene-stage is-crafting"><span class="dot" aria-hidden="true"></span>Crafting</span></div>' +
          '<p class="scene-unit-desc">' + esc(b.desc) + '</p>' +
          '<div class="scene-unit-actions"><button type="button" class="scene-biz-build">Continue crafting</button></div></div>';
      }).join('') + '</div></div>';
  }

  function ensureSidebarScene() {
    var host = document.getElementById('scene-cards');
    if (!host) return;
    var existing = host.querySelector('[data-fast-scene="' + SCENE_ID + '"]');
    if (!existing) {
      var art = document.createElement('article');
      art.className = 'scene-pack';
      art.setAttribute('role', 'listitem');
      art.setAttribute('data-fast-scene', SCENE_ID);
      art.innerHTML = packHtml(SIDEBAR);
      host.appendChild(art);
    }
    if (window.FastScenes) window.FastScenes.show(SCENE_ID, { kids: true });
    if (window.FastFiles) window.FastFiles.showTab(false);
  }

  function openScenarioPlanning() {
    if (window.FastJourneyRoute && window.FastJourneyRoute.ensureAssets) {
      window.FastJourneyRoute.ensureAssets();
    }
    if (window.EnterpriseAssets) {
      window.EnterpriseAssets.setPlanningAppLimit(1, 1);
      window.EnterpriseAssets.setPlanningOverride({
        title: SIDEBAR.title,
        badge: 'New',
        scenario: SIDEBAR.desc,
        biz: PLANNING_BIZ,
      });
      window.EnterpriseAssets.setContentVisible('planning', true);
      window.EnterpriseAssets.open('planning');
    }
  }

  function setCenterTitle(name) {
    var h = document.getElementById('center-head-title');
    if (h) h.textContent = name;
  }

  function setOverviewLabel(name) {
    var label = document.querySelector('#brandPicker .brand-picker-label');
    if (label) label.textContent = name;
    var menu = document.getElementById('overviewMenu');
    if (!menu) return;
    menu.querySelectorAll('.ov-menu-item').forEach(function (el) {
      var on = false;
      el.classList.toggle('is-current', on);
      el.setAttribute('aria-checked', 'false');
    });
  }

  function enterRoom() {
    if (entered) return;
    entered = true;
    pendingEnterCard = null;
    var app = SIDEBAR.title;
    var t1 = SIDEBAR.biz[0].name;

    /* Overview label → application name; Scenarios shows structure tree; Files cleared empty. */
    setOverviewLabel(app);
    setCenterTitle(t1);
    if (window.FastBlueprint) {
      window.FastBlueprint.show(
        t1,
        'For R&D performance management: a quota-check and self-review Agent that reconciles indicator quotas, answers assessment-rule questions with cited criteria, and helps draft structured self-reviews. Upgrade “look up policy → ask HR → rewrite drafts by hand” into an Agent-led flow: quota check, rule Q&A, evidence-backed draft polish, and human confirmation before submission.'
      );
    }
    if (window.FastFiles) {
      window.FastFiles.reset();
      window.FastFiles.showTab(false);
    }
    if (window.FastDocs && window.FastDocs.resetView) window.FastDocs.resetView();
    /* Keep the right panel as-is; user closes it manually. */

    /* Reuse the existing conversation tab as "new chat" — do not spawn the Main-route T1 tab. */
    if (window.FastConversations && window.FastConversations.resetCurrent) {
      window.FastConversations.resetCurrent('new chat');
    } else if (window.FastChat) {
      window.FastChat.clearThread();
    }
    window.FastChat.run({
      process: async function (api) {
        await api.sleep(280);
      },
      segments: [{
        md: '欢迎来到 **' + t1 + '**。\n\n' +
          '当前位于应用场景 **' + app + '** 下。左侧已切到场景结构树，Files 暂为空。\n\n' +
          '你可以直接说「快速搭个能试跑的 Demo」，我会以最小假设连跑出一个可对话试跑的智能体；也可以先补充考核口径、配额字段或自评模板等约束。',
        gap: 240,
      }],
    });
  }

  function askEnterAfterCreate() {
    var title = SIDEBAR.title;
    var desc = SIDEBAR.desc;
    var biz = SIDEBAR.biz;
    var t1 = biz[0].name;

    window.FastChat.run({
      process: async function (api) {
        await api.sleep(500);
        await api.W('先把我们聊到的内容整理成场景：1 个应用场景，下挂 1 个业务场景。');
        await api.sleep(450);
        await api.V({
          id: 'j2-sc-app',
          icon: 'tool',
          label: '已创建应用场景 · ' + title,
          details: ['类型 Application · AgentTeam', '写入场景名称与描述', '初始状态 Crafting'],
        });
        await api.sleep(280);
        await api.V({
          id: 'j2-sc-biz',
          icon: 'tool',
          label: '已创建业务场景 · ' + t1,
          details: ['类型 Business · Single agent', '优先级 Quick win', '挂到应用场景 ' + title],
        });
        await api.sleep(450);
        await api.W('场景已写入，现在同步左侧列表，并打开 Scenario Planning。');
        await api.sleep(300);
        ensureSidebarScene();
        openScenarioPlanning();
        await api.V({
          id: 'j2-sc-sync',
          icon: 'context',
          label: '已同步工作台',
          details: ['左侧 Scenarios 新增场景卡', '右侧打开 Scenario Planning', '仅展示第一套应用下的一张业务场景卡'],
        });
        await api.sleep(500);
      },
      segments: [{
        md: '场景已创建，并同步到了左侧的 **Scenarios**。识别到你接下来想打造 **' + t1 + '**，要现在就进入打造吗？',
        gap: 340,
      }],
      after: async function (c) {
        if (!window.FastSceneCard) return { journey: '2', action: 'enter-missing' };
        var card = window.FastSceneCard.create({
          title: title,
          desc: desc,
          stage: 'crafting',
          biz: biz,
          actions: [
            { id: 'enter', label: '进入打造' },
            { id: 'later', label: '暂不进入' },
          ],
          results: {
            enter: '已选择：进入打造',
            later: '已选择：暂不进入',
          },
        });
        appendNode(c, card.node);
        pendingEnterCard = card;
        var picked = await card.picked;
        pendingEnterCard = null;
        await c.sleep(420);
        if (picked === 'enter') {
          setTimeout(enterRoom, 700);
          return { skipFooter: true, journey: '2', action: 'enter' };
        }
        var part = document.createElement('div');
        c.host.appendChild(part);
        await c.run(part, [{
          md: '好的，暂不进入打造。场景已经保存好了，随时可以在左侧点 **Continue crafting** 进入——和刚才卡片上的「进入打造」是同一条路。\n\n' +
            '在这之前，你还有什么需要补充的吗？比如考核口径、配额字段，或直接要求快速搭 Demo。',
          gap: 360,
        }]);
        return { journey: '2', action: 'later' };
      },
    });
  }

  function createConfirm() {
    if (!window.FastSceneCard) return null;
    return window.FastSceneCard.create({
      title: APP.title,
      desc: APP.desc,
      stage: 'crafting',
      biz: [BIZ],
      actions: [
        { id: 'confirm', label: '确认创建' },
        { id: 'revise', label: '再调整' },
      ],
      results: {
        confirm: '已确认：创建该父子场景',
        revise: '已选择：再调整',
      },
    });
  }

  function createCraftPlan() {
    craftStarted = true;
    var card = window.FastFlow && window.FastFlow.taskPlanCard({
      tasks: DEMO_TASKS,
      progressive: true,
      title: '任务清单',
      brief: '快速 Demo 验证 · ' + DEMO_TASKS.length + ' 项长任务',
      buttonLabel: '开始执行',
      hint: '确认后将按顺序连跑；如需调整任务，直接告诉我。',
    });

    return {
      process: async function (api) {
        await api.W('你的目标是快速看到可试跑效果。我按【快速 Demo 验证】来处理：最小假设、跳过复杂前置、中间不停审。');
        await api.sleep(520);
        await api.V({
          id: 'j2-demo-scope',
          icon: 'search',
          label: '已收敛 Demo 试跑范围',
          details: [
            '核对绩效配额规则',
            '回答考核制度问题',
            '帮员工润色自评草稿',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-demo-strategy',
          icon: 'ontology',
          label: '已匹配快速 Demo 验证做法',
          details: [
            '先定架构方案，再按条件补齐本体与智能体设计',
            '构建可运行对象集与 Agent 配套能力',
            '五项任务完成后均自动继续',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-demo-plan',
          icon: 'edit',
          label: '已编排为长任务',
          details: DEMO_TASKS.map(function (task, i) {
            return (i + 1) + '. ' + task.title + ' · ' + task.agent;
          }),
        });
        await api.sleep(520);
        await api.W('范围和做法都清楚了。我会把它收敛成一张长任务清单，确认后再开始连跑。');
        await api.sleep(640);
      },
      segments: [{
        md: '### 任务判断\n\n' +
          '这不是要重新做企业全景规划，而是在当前业务场景下**快速搭一个能试跑的 Demo**。\n\n' +
          '我会按长任务推进：先快速确定技术架构，再按条件补齐本体与智能体方案，并构建可运行的对象集与 Agent 配套组件；五项任务完成后均自动继续。\n\n' +
          '**下面是建议的长任务安排，确认后即可开始执行。**',
        gap: 260,
      }],
      after: async function (ctx) {
        if (!card) return { journey: '2', action: 'craft-plan-missing' };
        appendNode(ctx, card.node);
        for (var i = 0; i < DEMO_TASKS.length; i++) {
          await ctx.sleep(300);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(240);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startCraftExecution, 0);
        return { journey: '2', action: 'craft-confirmed' };
      },
    };
  }

  function addDeliverable(doc) {
    if (window.FastDocs && !window.FastDocs.find(doc.name)) {
      window.FastDocs.register({
        kind: 'md',
        deliverable: true,
        name: doc.name,
        size: '6 KB',
        pages: '4 页',
        updated: '刚刚',
        author: '技术方案设计Agent',
        note: doc.note,
        md: doc.md,
      });
    }
    if (window.FastFiles) {
      window.FastFiles.addDeliverable(doc.name);
      window.FastFiles.markUpdated(doc.name);
      window.FastFiles.markNew();
      window.FastFiles.showTab(true);
    }
  }

  function createCraftExecution() {
    var titles = DEMO_TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    var thoughtSets = [
      [
        '正在收敛 Demo 技术边界',
        '正在确认配额核对与答疑主路径',
        '正在选择可跳过的复杂前置设计',
        '正在草拟系统分层与模块边界',
        '正在定义架构方案设计产出物',
        '正在校验与业务场景的对齐度',
        '正在固化最小可试跑架构假设',
        '正在生成 Architecture Design v1',
      ],
      [
        '正在检查架构方案是否包含本体',
        '正在抽取绩效配额与考核规则对象',
        '正在梳理自评草稿相关实体关系',
        '正在补齐对象属性与约束',
        '正在验证本体对答疑链路的支撑',
        '正在整理本体方案设计要点',
        '正在生成 Ontology Design v1',
      ],
      [
        '正在检查架构方案是否包含智能体',
        '正在定义 Demo Agent 职责边界',
        '正在规划配额核对对话能力',
        '正在规划考核制度答疑能力',
        '正在规划自评润色能力',
        '正在整理 Agent 方案设计要点',
        '正在生成 Agent Design v1',
      ],
      [
        '正在依据本体方案准备对象集',
        '正在构建可运行对象定义',
        '正在校验字段与关系完整性',
        '正在写入基础样例数据',
        '正在完成对象集构建',
      ],
      [
        '正在装配可运行智能体',
        '正在按需挂载 Skill / 知识库 / MCP',
        '正在接通配额规则核对通路',
        '正在接通考核答疑与自评润色',
        '正在做最小可对话试跑校验',
        '正在完成 Agent 及配套组件构建',
      ],
    ];

    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(300);
      }
    }

    return {
      process: async function (api) {
        await api.W('已收到确认执行。我先编排五项长任务的依赖，并准备在执行过程中同步左侧交付物。');
        await api.sleep(520);
        await api.V({
          id: 'j2-exec-map',
          icon: 'context',
          label: '已建立任务与交付物映射',
          details: [
            '任务 1 → Architecture Design v1',
            '任务 2 → Ontology Design v1',
            '任务 3 → Agent Design v1',
            '任务 4 / 5 → 可运行对象集与智能体',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-exec-mode',
          icon: 'search',
          label: '已设置连跑策略',
          details: ['五项任务完成后均自动继续', '中间不停审', '优先跑通可对话 Demo'],
        });
        await api.sleep(520);
        await api.W('依赖和策略已就绪，开始按清单连跑。');
        await api.sleep(640);
      },
      segments: [{
        md: '任务已启动。我会按已确认的顺序推进，并实时更新下面的任务进度。',
        gap: 220,
      }],
      after: async function (ctx) {
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        await ctx.sleep(320);

        for (var i = 0; i < DEMO_TASKS.length; i++) {
          progress.start(i);
          await runThoughts(ctx, thoughtSets[i]);
          var doc = DELIVERABLES.filter(function (item) { return item.task === i; })[0];
          if (doc) addDeliverable(doc);
          if (i === 3) publishPerfOntology({ sBand: false });
          if (i === 4) publishDemoSkills({ tweaked: false });
          progress.done(i);
          ctx.scroll();
          if (i < DEMO_TASKS.length - 1) await ctx.sleep(280);
        }

        progress.finish();
        thinking.finish();
        ctx.scroll();
        await ctx.sleep(420);

        var summary = window.FastFlow.deliverableSummary({
          title: '执行总结',
          body: '本轮按【快速 Demo 验证】连跑完成五项长任务：先快速确定技术架构，再按条件补齐本体与智能体方案，并构建可运行的对象集与 Agent 配套组件。中间不停审，已形成可继续试跑与轻量调整的 Demo 基础。',
          lead: '本轮共形成以下三项方案交付，均可直接查看：',
          items: DELIVERABLES.map(function (doc) {
            return {
              name: doc.name.replace(/\.md$/, ''),
              iconName: doc.name,
              open: function () {
                if (window.FastFiles) window.FastFiles.clearUpdated(doc.name);
                if (window.FastDocs) window.FastDocs.open(doc.name);
              },
            };
          }),
          entriesLabel: '相关入口',
          entries: [
            {
              name: '本体对象集',
              open: function () {
                if (window.FastModules) window.FastModules.open('ontology');
              },
            },
            {
              name: 'Agent 调试',
              open: openAgentDemo,
            },
          ],
          conclusion: '三项方案与可运行配套已就绪。可先打开方案核对，或从下方入口进入本体对象集 / Agent 调试继续验证。',
          ask: '如果试跑效果还需要小修小补，直接告诉我要改哪一块即可。',
        });
        publishAgentDemo();
        appendNode(ctx, summary);
        executionCompleted = true;
        return { journey: '2', completed: true };
      },
    };
  }

  async function startCraftExecution() {
    if (executionStarted || !window.FastChat) return;
    executionStarted = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('确认执行');
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, DEMO_TASKS, '', '快速 Demo 验证 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createCraftExecution());
  }

  function createPlan() {
    var card = createConfirm();

    return {
      process: async function (api) {
        await api.W('先判断你要建的是应用类场景还是业务类场景，并补齐二者之间的父子结构字段。');
        await api.sleep(520);
        await api.V({
          id: 'j2-classify',
          icon: 'search',
          label: '已区分场景类型',
          details: [
            '诉求表述为「业务场景」：季度绩效配额核算与自评答疑',
            '能力覆盖面更广，需要上挂「应用类场景」承载',
            '判定：业务类场景挂在应用类场景之下',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-parent',
          icon: 'ontology',
          label: '已补齐应用类场景字段',
          details: [
            '名称：研发绩效智能管理',
            '类型：Application · AgentTeam',
            '描述与目标：统一研发绩效核算、规则答疑与自评辅助',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-child',
          icon: 'context',
          label: '已补齐业务类场景字段',
          details: [
            '名称：季度绩效配额核算与自评答疑',
            '类型：Business · Single agent',
            '优先级：Quick win',
            '父场景：研发绩效智能管理',
          ],
        });
        await api.sleep(520);
        await api.W('父子结构已对齐。下面用场景确认格式展示，请你核对后确认创建。');
        await api.sleep(640);
      },
      segments: [
        {
          md: '你这次要建的其实是一个**业务类场景**；我补了一个上挂的**应用类场景**，方便后续扩展同主题能力。\n\n' +
            '- **应用类**：研发绩效智能管理（AgentTeam）\n' +
            '- **业务类**：季度绩效配额核算与自评答疑（Single agent · Quick win）\n\n' +
            '描述与目标已按你的诉求草拟。若没问题，确认创建即可。',
          gap: 260,
        },
      ],
      after: async function (ctx) {
        if (!card) return { journey: '2', action: 'confirm-missing' };
        appendNode(ctx, card.node);
        var picked = await card.picked;
        await ctx.sleep(360);
        var part = document.createElement('div');
        ctx.host.appendChild(part);
        if (picked === 'confirm') {
          if (window.FastIntake) window.FastIntake.stop();
          await ctx.run(part, [{
            md: '好，我这就把它整理成场景，并同步到左侧。',
            gap: 320,
          }]);
          setTimeout(askEnterAfterCreate, 700);
          return { skipFooter: true, journey: '2', action: 'creating' };
        }
        await ctx.run(part, [{
          md: '好的。你可以直接说想改名称、描述、目标或优先级；改完我再更新场景确认内容。',
          gap: 320,
        }]);
        return { journey: '2', action: 'revise' };
      },
    };
  }

  var cardsHost = document.getElementById('scene-cards');
  if (cardsHost) {
    cardsHost.addEventListener('click', function (e) {
      if (!window.FastJourneyRoute || window.FastJourneyRoute.get() !== '2') return;
      var btn = e.target.closest('[data-fast-scene="' + SCENE_ID + '"] .scene-build, [data-fast-scene="' + SCENE_ID + '"] .scene-biz-build');
      if (!btn) return;
      e.preventDefault();
      if (entered) return;
      if (pendingEnterCard && pendingEnterCard.pick) {
        pendingEnterCard.pick('enter');
        return;
      }
      enterRoom();
    });
  }

  function touchDeliverable(name, note) {
    if (window.FastDocs && window.FastDocs.find(name) && note) {
      /* keep registered doc; visual update is enough for demo */
    }
    if (window.FastFiles) {
      window.FastFiles.markUpdated(name);
      window.FastFiles.markNew();
      window.FastFiles.showTab(true);
    }
  }

  function createTweakPlan() {
    var card = window.FastFlow && window.FastFlow.taskPlanCard({
      tasks: TWEAK_TASKS,
      progressive: true,
      title: '任务清单',
      brief: 'Demo 轻量调优 · ' + TWEAK_TASKS.length + ' 项长任务',
      buttonLabel: '确认执行',
      hint: '确认后将按顺序连跑；如需调整任务，直接告诉我。',
    });

    return {
      process: async function (api) {
        await api.W('已确认要建立长任务。我先把两项试跑反馈收敛成可连跑的更新清单。');
        await api.sleep(520);
        await api.V({
          id: 'j2-tweak-map',
          icon: 'context',
          label: '已建立更新映射',
          details: [
            '任务 1 → 本体方案设计 / Agent方案设计',
            '任务 2 → 对象集配额规则与 Mock',
            '任务 3 → Skill / Agent 提示词',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-tweak-mode',
          icon: 'search',
          label: '已设置连跑策略',
          details: ['三项任务完成后均自动继续', '中间不停审', '优先保证客户演示可试跑'],
        });
        await api.sleep(520);
        await api.W('范围和映射都清楚了。我会收敛成一张长任务清单，确认执行后再开始连跑。');
        await api.sleep(640);
      },
      segments: [{
        md: '### 任务判断\n\n' +
          '这不是推倒重来，而是对已有 Demo 资产做**轻量同步更新**：\n\n' +
          '1. **技术方案**：同步本体方案设计与 Agent 方案设计中的规则口径\n' +
          '2. **对象集与 Mock**：部门人数少于 5 人时，允许 1 个 S 档机动名额\n' +
          '3. **Skill / 提示词**：自评润色固定按「业绩成果、存在不足、下季度计划」三段式\n\n' +
          '**下面是建议的长任务安排，确认执行后即可开始连跑。**',
        gap: 260,
      }],
      after: async function (ctx) {
        if (!card) return { journey: '2', action: 'tweak-plan-missing' };
        appendNode(ctx, card.node);
        for (var i = 0; i < TWEAK_TASKS.length; i++) {
          await ctx.sleep(300);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(240);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startTweakExecution, 0);
        return { journey: '2', action: 'tweak-plan-confirmed' };
      },
    };
  }

  function createTweakExecution() {
    var titles = TWEAK_TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    var thoughtSets = [
      [
        '正在核对两项试跑反馈的影响面',
        '正在定位本体方案中的配额规则段落',
        '正在定位 Agent 方案中的自评输出结构',
        '正在同步更新 Demo 轻量技术方案',
        '正在生成 本体方案设计 v2 / Agent方案设计 v2',
      ],
      [
        '正在打开本体对象集配额规则',
        '正在写入「部门人数 < 5 → 允许 1 个 S 档机动名额」',
        '正在刷新相关 Mock 数据',
        '正在校验小团队配额不再卡死为 0',
        '正在完成对象集更新',
      ],
      [
        '正在打开 Skill 与提示词配置',
        '正在固定自评三段式：业绩成果 / 存在不足 / 下季度计划',
        '正在同步 Agent 提示词约束',
        '正在做轻量回归试跑校验',
        '正在完成 Skill / Agent 更新',
      ],
    ];

    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(300);
      }
    }

    return {
      process: async function (api) {
        await api.W('已收到确认执行。我先编排三项长任务的依赖，并准备在执行过程中同步左侧资产。');
        await api.sleep(520);
        await api.V({
          id: 'j2-tweak-exec-map',
          icon: 'context',
          label: '已建立任务与资产映射',
          details: [
            '任务 1 → Ontology Design / Agent Design',
            '任务 2 → 对象集配额规则与 Mock',
            '任务 3 → Skill / Agent 提示词',
          ],
        });
        await api.sleep(520);
        await api.V({
          id: 'j2-tweak-exec-mode',
          icon: 'search',
          label: '已设置连跑策略',
          details: ['三项任务完成后均自动继续', '中间不停审', '优先保证客户演示可试跑'],
        });
        await api.sleep(520);
        await api.W('依赖和策略已就绪，开始按清单连跑。');
        await api.sleep(640);
      },
      segments: [{
        md: '任务已启动。我会按已确认的顺序推进，并实时更新下面的任务进度。',
        gap: 220,
      }],
      after: async function (ctx) {
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        await ctx.sleep(320);

        for (var i = 0; i < TWEAK_TASKS.length; i++) {
          progress.start(i);
          await runThoughts(ctx, thoughtSets[i]);
          if (i === 0) {
            TWEAK_DELIVERABLES.forEach(addDeliverable);
          }
          if (i === 1) publishPerfOntology({ sBand: true });
          if (i === 2) publishDemoSkills({ tweaked: true });
          progress.done(i);
          ctx.scroll();
          if (i < TWEAK_TASKS.length - 1) await ctx.sleep(280);
        }

        progress.finish();
        thinking.finish();
        ctx.scroll();
        await ctx.sleep(420);

        var summary = tweakSummaryCard();
        publishAgentDemo();
        appendNode(ctx, summary);
        tweakCompleted = true;
        return { journey: '2', action: 'tweak-done' };
      },
    };
  }

  function enableAgentTrial() {
    if (!window.FastAgentPanel || !window.FastAgentPanel.setTrialPrompts) return;
    window.FastAgentPanel.setTrialPrompts(AGENT_TRIAL_PROMPTS.map(function (q, i) {
      return {
        q: q,
        k: i === 0 ? 'j2-s-band' : 'j2-self-review',
      };
    }), {
      'j2-s-band': {
        tools: [
          'quota-rule · 读取部门人数与 S 档机动名额规则',
          'apply-exception · 部门人数 < 5 → 允许 1 个 S 档',
        ],
        md:
          '结论：**可以批准**。按更新后的配额规则，4 人小团队属于「部门人数 < 5」，允许 **1 个 S 档机动名额**，不再卡死为 0。\n\n' +
          '| 项 | 结果 |\n|---|---|\n| 团队人数 | 4 |\n| 规则版本 | 本体方案设计 v2 |\n| S 档机动名额 | 1 |\n| 处理建议 | 写入本季度配额表并同步考核答疑口径 |\n\n' +
          '**MOCK** · 规则来自本轮更新的对象集与技术方案。',
      },
      'j2-self-review': {
        tools: [
          'draft-polish · 按三段式重写自评',
          'structure-check · 业绩成果 / 存在不足 / 下季度计划',
        ],
        md:
          '已按固定三段式润色（后端开发自评）：\n\n' +
          '### 业绩成果\n\n本季度完成核心接口性能优化与稳定性治理，支撑业务高峰期的服务可用性目标。\n\n' +
          '### 存在不足\n\n跨团队需求对齐仍偏被动，部分评审反馈响应偏慢，影响联调节奏。\n\n' +
          '### 下季度计划\n\n前置参与需求评审，沉淀可复用组件与监控预案，缩短联调与故障定位时间。\n\n' +
          '**MOCK** · 输出结构由本轮更新的 Skill / 提示词约束。',
      },
    });
  }

  /* When chat shows 本体对象集 / Agent 调试, mirror a non-md "Agent demo" row under Files.
     Click opens the same trial panel as the mid-dialog Agent 调试 entry (#ws-agent icon). */
  function publishDemoSkills(opts) {
    opts = opts || {};
    if (!window.FastModules || !window.FastModules.publishSkill) return;
    window.FastModules.publishSkill({
      id: 'j2-skill-quota',
      name: 'Quota Q&A Skill',
      desc: 'Demo Skill for quota lookup and assessment-rule Q&A.',
      publishStatus: 'pending',
    });
    window.FastModules.publishSkill({
      id: 'j2-skill-polish',
      name: 'Self-Review Polish Skill',
      desc: opts.tweaked
        ? 'Demo Skill updated with the three-part self-review structure.'
        : 'Demo Skill for evidence-preserving self-review rewriting.',
      publishStatus: 'pending',
    });
  }

  function publishAgentDemo() {
    var ico = '<svg class="ws-ico" width="14" height="14" aria-hidden="true"><use href="#ws-agent"/></svg>';
    enableAgentTrial();
    if (window.FastModules && window.FastModules.publishAgent) {
      window.FastModules.publishAgent({
        id: 'j2-agent-demo',
        name: '绩效配额 · 自评答疑 Agent',
        letter: '绩',
        color: '#6a54f0',
        role: '配额核对、考核答疑与自评润色',
        status: '就绪 · 可调试',
        state: 'ready',
        cta: '调试',
        publishStatus: 'pending',
      });
    }
    if (window.FastAgentPanel) {
      if (window.FastAgentPanel.setIdentity) {
        window.FastAgentPanel.setIdentity({
          name: AGENT_DEMO_NAME,
          display: '绩效配额 · 自评答疑 Agent',
        });
      }
      if (window.FastAgentPanel.ensureRegistered) window.FastAgentPanel.ensureRegistered();
    }
    /* Always register under this exact Files name — don't gate the row on panel identity. */
    if (window.FastDocs && !window.FastDocs.find(AGENT_DEMO_NAME)) {
      window.FastDocs.register({
        name: AGENT_DEMO_NAME,
        kind: 'agent',
        deliverable: true,
        iconHtml: ico,
        build: function () {
          var host = document.createElement('div');
          host.className = 'fa-wrap';
          /* Prefer the live trial panel; fall back to an empty host if unavailable. */
          requestAnimationFrame(function () {
            if (window.FastAgentPanel) window.FastAgentPanel.open('try');
          });
          return host;
        },
      });
    }
    if (agentDemoPublished || !window.FastFiles) return;
    window.FastFiles.addDeliverable(AGENT_DEMO_NAME);
    window.FastFiles.markUpdated(AGENT_DEMO_NAME);
    window.FastFiles.markNew();
    window.FastFiles.showTab(true);
    agentDemoPublished = true;
  }

  function openAgentDemo() {
    if (window.FastAgentPanel) window.FastAgentPanel.open('try');
    else if (window.FastDocs && window.FastDocs.find(AGENT_DEMO_NAME)) window.FastDocs.open(AGENT_DEMO_NAME);
    else if (window.FastModules) window.FastModules.open('agent');
  }

  async function startTweakPlan() {
    if (!window.FastChat) return;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('确定');
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createTweakPlan());
  }

  async function startTweakExecution() {
    if (tweakRunning || !window.FastChat) return;
    tweakRunning = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('确认执行');
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(2, TWEAK_TASKS, '', 'Demo 轻量调优 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createTweakExecution());
  }

  function createTweakImpactPlan() {
    tweakStarted = true;
    return {
      process: async function (api) {
        await api.W('先评估这两处试跑反馈会撞到哪些已有资产，再决定是否拉起长任务做轻量更新。');
        await api.sleep(520);
        await api.V({
          id: 'j2-tweak-scope',
          icon: 'search',
          label: '已识别影响范围',
          details: [
            '技术方案：本体方案设计 / Agent方案设计',
            '本体对象集与 Mock 数据：S 档机动名额规则',
            '智能体 Skill / 提示词：自评三段式输出',
          ],
        });
        await api.sleep(520);
        await api.W('影响面已收敛。下面用表格汇总，并请你确认是否建立长任务同步更新。');
        await api.sleep(560);
      },
      segments: [{
        md: '### 影响范围\n\n' +
          '| 影响项 | 说明 |\n|---|---|\n' +
          '| 技术方案 | 同步更新【本体方案设计】【Agent方案设计】 |\n' +
          '| 本体对象集与 Mock | 部门人数<5时允许1个S档机动名额 |\n' +
          '| 智能体 Skill / 提示词 | 自评固定「业绩成果、存在不足、下季度计划」三段式 |\n\n' +
          '这两处调整会落到技术方案、本体对象集及 Mock 配置，以及智能体的 Skill 提示词。\n\n' +
          '**要不要建立一项长任务，把上述资产一起更新掉？**',
        gap: 240,
      }],
      after: async function (ctx) {
        if (!window.FastMode || !window.FastMode.choiceButtons) {
          setTimeout(startTweakPlan, 0);
          return { journey: '2', action: 'tweak-auto' };
        }
        var buttons = window.FastMode.choiceButtons([
          { id: 'confirm', label: '确定' },
          { id: 'later', label: '先不更新' },
        ]);
        buttons.node.classList.add('j2-tweak-confirm');
        appendNode(ctx, buttons.node);
        var picked = await buttons.picked;
        await ctx.sleep(280);
        if (picked === 'confirm') {
          setTimeout(startTweakPlan, 0);
          return { skipFooter: true, journey: '2', action: 'tweak-confirm' };
        }
        var part = document.createElement('div');
        ctx.host.appendChild(part);
        await ctx.run(part, [{
          md: '好的，先保留现状。你随时可以说「确定」，我再按这三项长任务帮你同步更新。',
          gap: 280,
        }]);
        tweakStarted = false;
        return { journey: '2', action: 'tweak-later' };
      },
    };
  }

  /* Space fills the next scripted ask for Journey 2 craft room. */
  function installSpaceHook() {
    if (!window.FastJourneyRoute || window.FastJourneyRoute.__j2SpaceHooked) return;
    var prev = window.FastJourneyRoute.prompt;
    window.FastJourneyRoute.prompt = function () {
      if (window.FastJourneyRoute.get() !== '2' || !entered) {
        return typeof prev === 'function' ? prev() : '';
      }
      if (executionCompleted && !tweakStarted) return TWEAK_PROMPT;
      if (!craftStarted) return CRAFT_PROMPT;
      return '';
    };
    window.FastJourneyRoute.__j2SpaceHooked = true;
  }
  installSpaceHook();

  function tweakSummaryCard() {
    return window.FastFlow.deliverableSummary({
      title: '执行总结',
      body: '本轮按【Demo 轻量调优】连跑完成三项长任务：已输出更新后的技术方案文档，同步对象集配额与 Mock，并固定自评三段式 Skill / 提示词。中间不停审，Demo 已可再试跑一轮用于客户演示。',
      lead: '以下为本轮更新的文档，可直接查看：',
      items: TWEAK_DELIVERABLES.map(function (doc) {
        return {
          name: doc.display,
          iconName: doc.name,
          open: function () {
            if (window.FastFiles) window.FastFiles.clearUpdated(doc.name);
            if (window.FastDocs) window.FastDocs.open(doc.name);
          },
        };
      }),
      entriesLabel: '相关入口',
      entries: [
        {
          name: '本体对象集',
          open: function () {
            if (window.FastModules) window.FastModules.open('ontology');
          },
        },
        {
          name: 'Agent 调试',
          open: openAgentDemo,
        },
      ],
      conclusion: '更新文档、对象集配额规则与 Skill / 提示词均已就绪。可从下方入口打开本体对象集或 Agent 调试，再试跑一轮确认客户演示效果。',
      ask: '如果还有小修小补，直接告诉我要改哪一块即可。',
    });
  }

  /* Frozen end-state of Journey 2 (post Demo + 小修小补). Journey 3 restores this as its entry. */
  function restoreEndSnapshot(opts) {
    opts = opts || {};
    entered = true;
    craftStarted = true;
    executionStarted = true;
    executionCompleted = true;
    tweakStarted = true;
    tweakRunning = false;
    tweakCompleted = true;
    agentDemoPublished = false;

    ensureSidebarScene();
    setOverviewLabel(SIDEBAR.title);
    setCenterTitle(SIDEBAR.biz[0].name);
    if (window.FastBlueprint) {
      window.FastBlueprint.show(
        SIDEBAR.biz[0].name,
        'For R&D performance management: a quota-check and self-review Agent that reconciles indicator quotas, answers assessment-rule questions with cited criteria, and helps draft structured self-reviews. Upgrade “look up policy → ask HR → rewrite drafts by hand” into an Agent-led flow: quota check, rule Q&A, evidence-backed draft polish, and human confirmation before submission.'
      );
    }
    if (window.FastDocs && window.FastDocs.resetView) window.FastDocs.resetView();
    if (window.FastFiles) window.FastFiles.reset();
    if (window.FastJourneyRoute && window.FastJourneyRoute.ensureAssets) {
      window.FastJourneyRoute.ensureAssets();
    }
    if (window.EnterpriseAssets) {
      window.EnterpriseAssets.setPlanningAppLimit(1, 1);
      window.EnterpriseAssets.setPlanningOverride({
        title: SIDEBAR.title,
        badge: 'New',
        scenario: SIDEBAR.desc,
        biz: PLANNING_BIZ,
      });
      window.EnterpriseAssets.setContentVisible('planning', true);
    }

    DELIVERABLES.forEach(addDeliverable);
    TWEAK_DELIVERABLES.forEach(addDeliverable);
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, DEMO_TASKS, '', '快速 Demo 验证 v1');
      window.FastFlow.createLongTaskVersion(2, TWEAK_TASKS, '', 'Demo 轻量调优 v1');
    }
    publishPerfOntology({ sBand: true });
    publishDemoSkills({ tweaked: true });
    publishAgentDemo();
    if (window.FastFiles) window.FastFiles.showTab(true);

    /* Journey 3: hide interaction replay / 执行总结 — only restore workspace.
       Full chat hist + summary card remain available when opts.compactChat is false. */
    if (!opts.compactChat) {
      var thread = document.getElementById('chat-thread');
      if (thread && window.FastChat && window.FastChat.staticThread) {
        if (window.FastChat.enterChatMode) window.FastChat.enterChatMode();
        var anchor = null;
        if (opts.keepLiveTurn) {
          anchor = thread.querySelector('.chat-msg-assistant:last-child');
          var prevUser = anchor && anchor.previousElementSibling;
          if (prevUser && prevUser.classList.contains('chat-msg-user')) anchor = prevUser;
        }
        var hist = window.FastChat.staticThread([
          { u: PROMPT },
          {
            a: '场景已创建并进入打造。当前位于 **' + SIDEBAR.biz[0].name + '**（应用场景 **' + SIDEBAR.title + '**）。\n\n' +
              '左侧已切到场景结构树；可直接要求快速搭 Demo，或以最小假设连跑可试跑智能体。',
            time: '09:12',
          },
          { u: CRAFT_PROMPT },
          {
            a: '已按【快速 Demo 验证】连跑完成五项长任务：架构 / 本体 / Agent 方案与可运行对象集、智能体配套已就绪。\n\n' +
              '可打开方案核对，或从入口进入 **本体对象集** / **Agent 调试** 继续验证。',
            time: '09:18',
          },
          { u: TWEAK_PROMPT },
          {
            a: '已按【Demo 轻量调优】完成：本体方案设计 v2、Agent方案设计 v2，以及对象集配额规则与自评三段式 Skill / 提示词同步。Demo 已可再试跑一轮用于客户演示。',
            time: '09:24',
          },
        ]);
        hist.forEach(function (node) {
          if (anchor) thread.insertBefore(node, anchor);
          else thread.appendChild(node);
        });
        if (window.FastFlow && window.FastFlow.deliverableSummary) {
          var summary = tweakSummaryCard();
          var wrap = document.createElement('div');
          wrap.className = 'chat-msg-assistant';
          var turn = document.createElement('div');
          turn.className = 'ao-turn';
          var body = document.createElement('div');
          body.className = 'ao-answer answer-body chat-prose ao-body';
          var seg = document.createElement('div');
          seg.className = 'ao-seg';
          seg.appendChild(summary);
          body.appendChild(seg);
          turn.appendChild(body);
          wrap.appendChild(turn);
          if (anchor) thread.insertBefore(wrap, anchor);
          else thread.appendChild(wrap);
        }
      }
    } else if (window.FastChat && window.FastChat.enterChatMode) {
      window.FastChat.enterChatMode();
    }
    return { journey: '2', snapshot: 'end' };
  }

  window.JourneyTwoPlan = {
    take: function (text) {
      if (matchesTweak(text)) return createTweakImpactPlan();
      if (matchesCraft(text)) return createCraftPlan();
      return matches(text) ? createPlan() : null;
    },
    craftPrompt: function () {
      if (!entered) return '';
      if (executionCompleted && !tweakStarted) return TWEAK_PROMPT;
      return craftStarted ? '' : CRAFT_PROMPT;
    },
    /** Journey 3 entry: freeze / restore Journey 2 end display + dialog state. */
    restoreEndSnapshot: restoreEndSnapshot,
    isEnded: function () { return !!tweakCompleted; },
  };
}());
