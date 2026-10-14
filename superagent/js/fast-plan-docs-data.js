/**
 * Fast POC page ONLY — documents the Agent writes in the Fast flow (deliverables, not uploaded materials).
 *   Design plans/   Product plan v0.1.md · Ontology plan v0.1.md · Agent plan v0.1.md      (drafted, then confirmed by the user)
 *   Agent v0.1/     Agent spec v0.1.md · Mock register v0.1.md · Ontology stub.json         (generated with the draft Agent)
 * Appended to window.FastDocsData with { deliverable: true } so they never show up in the "uploaded materials" lists.
 * The five decisions D1–D5 are defined once here (FastPlanData.decisions) and used by the decision card in chat.
 * NOTE: file names must not contain ( ) [ ] | — they are used as markdown link targets.
 */
(function () {
  'use strict';
  var D = window.FastDocsData = window.FastDocsData || [];
  function md(o) { o.kind = 'md'; o.deliverable = true; o.md = o.md.replace(/^~~~/gm, '```'); D.push(o); }

  /* ─────────── the five decisions the user confirms ─────────── */
  var decisions = [
    { id: 'D1', title: '评分权重', why: '现行准入标准是 质量35·交期25·价格25·稳定性15，与你说的「质量 > 交期 > 价格」不一致。',
      opts: [
        { t: '质量 45 · 交期 30 · 价格 15 · 稳定性 10', rec: true },
        { t: '沿用现行标准 35 / 25 / 25 / 15' } ] },
    { id: 'D2', title: '例外供应商', why: 'Kaisheng（交期 6 周）、Mingda（产能 8 万）长期按例外合作，Ruifeng 缺 ISO 9001。',
      opts: [
        { t: '保留，并打「例外」标记，推荐时提示风险', rec: true },
        { t: '直接剔除，不进入候选清单' } ] },
    { id: 'D3', title: '硬性条件处理', why: 'ISO 9001 · 月产能 ≥ 10 万件 · 交期 ≤ 4 周，是否全部一票否决。',
      opts: [
        { t: 'ISO 一票否决；产能和交期不达标则扣分并提示', rec: true },
        { t: '三项都一票否决' } ] },
    { id: 'D4', title: '首批覆盖品类', why: '你提到电子元器件和结构件，两类的报价口径和交期差异较大。',
      opts: [
        { t: '电子元器件 + 结构件，一起覆盖', rec: true },
        { t: '先只做电子元器件，结构件下一版' } ] },
    { id: 'D5', title: '价格口径', why: '合同价（年降条款）与 ERP 最近报价存在差异，比价时以谁为准。',
      opts: [
        { t: 'ERP 最近有效报价，合同价作为参考列', rec: true },
        { t: '合同价优先，ERP 报价作为参考列' } ] },
  ];

  /* ─────────── Design plans ─────────── */
  md({
    folder: 'Design plans', name: 'Product plan v0.1.md',
    size: '9 KB', pages: '4 页', updated: '今天', author: 'AgentOS · 草稿',
    note: '产品方案：目标用户、使用场景、功能范围、评分口径与成功标准',
    md:
'# 寻源策略 Agent · 产品方案 v0.1\n\n' +
'状态：**草稿，待确认**。文中标注「待决策」的 5 项需要你确认，其余按默认处理。\n\n' +
'| 生成方式 | 先起草，边做边完善：试用后哪里不够再回填 |\n|---|---|\n' +
'| 版本 | v0.1 · 草稿 |\n' +
'| 真实依据 | 你的需求回答、9 份上传资料（合同、准入标准、ERP 导出等） |\n' +
'| Mock 说明 | 本文是**真实内容**；但评分回测、报价与交期数据目前来自样例，成功标准尚未用真实案例验证 |\n\n' +
'## 1. 目标与用户\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 目标 | 把新品导入、供应商异常替换时的寻源准备时间，从 **约 1 周** 压到 **半天** |\n' +
'| 主要用户 | 电子物料采购经理、结构件采购工程师 |\n' +
'| 协作对象 | 品质工程师（确认评分）· 供应链总监（评审审批） |\n' +
'| 触发场景 | 新品导入时出候选供应商；现有供应商异常时找替代方案 |\n\n' +
'## 2. 使用场景\n\n' +
'1. **新品导入**：采购输入料号、品类、目标量，Agent 给出候选长名单、硬性条件核查、比价表、推荐排序。\n' +
'2. **异常替换**：某供应商出现质量或交期异常，Agent 给出可替代供应商、切换成本、风险提示，并生成评审材料草稿。\n' +
'3. **日常巡检**（二期）：定期扫描合格供应商的交期与异常趋势。\n\n' +
'## 3. 功能范围\n\n' +
'| 能力 | 说明 | Agent 介入程度 |\n|---|---|---|\n' +
'| 候选长名单 | 按品类、产能、交期从合格供应商清单筛出 | **高**：全自动 |\n' +
'| 硬性条件核查 | ISO 9001 · 产能 · 交期，逐项给出通过与否和依据 | **高**：全自动 |\n' +
'| 报价整理与比价 | 读取 ERP 报价，按币种、税率、起订量换算后出比价表 | **高**：全自动 |\n' +
'| 评分与排序 | 按权重打分，给出分项依据 | **中**：Agent 给分，人确认 |\n' +
'| 替代方案推荐 | 异常时给出备选清单和切换风险 | **中**：Agent 推荐，人决定 |\n' +
'| 评审材料 | 生成评审摘要，不做审批和合同动作 | **低**：只出草稿 |\n\n' +
'## 4. 评分口径（待决策 D1 · D3 · D5）\n\n' +
'| 维度 | 默认权重 | 数据来源 |\n|---|---|---|\n' +
'| 质量 | 45 | 异常记录 · 来料不良率 |\n' +
'| 交期 | 30 | 承诺交期 · 实际交付准时率 |\n' +
'| 价格 | 15 | ERP 最近有效报价（合同价作参考） |\n' +
'| 稳定性 | 10 | 合作年限 · 产能余量 |\n\n' +
'- 硬性条件：ISO 9001 一票否决；产能、交期不达标时扣分并提示风险。\n' +
'- 例外供应商（Kaisheng、Mingda）保留在清单中，推荐时显式标记。\n\n' +
'## 5. 成功标准\n\n' +
'- 新品导入的候选名单和比价表，能在 **30 分钟内** 给出。\n' +
'- 推荐结果与采购经理人工判断的重合度 **≥ 80%**（抽 10 个历史案例回测）。\n' +
'- 每条结论都能追溯到合同、准入标准或 ERP 记录。\n\n' +
'## 6. 不在本期范围\n\n' +
'- 合同条款谈判、审批流转与签署\n' +
'- 供应商现场审核排期\n' +
'- 非电子元器件、结构件之外的品类（待 D4 确认后再看）\n\n' +
'## 7. 待决策清单\n\n' +
'| 编号 | 决策 | 默认建议 |\n|---|---|---|\n' +
'| D1 | 评分权重 | 质量 45 · 交期 30 · 价格 15 · 稳定性 10 |\n' +
'| D2 | 例外供应商 | 保留并打「例外」标记 |\n' +
'| D3 | 硬性条件处理 | ISO 一票否决，其余扣分提示 |\n' +
'| D4 | 首批覆盖品类 | 电子元器件 + 结构件 |\n' +
'| D5 | 价格口径 | ERP 最近有效报价 |\n',
  });

  md({
    folder: 'Design plans', name: 'Ontology plan v0.1.md',
    size: '8 KB', pages: '3 页', updated: '今天', author: 'AgentOS · 草稿',
    note: '本体方案：对象、属性、关系、动作，以及和 ERP 字段的映射',
    md:
'# 寻源策略 Agent · 本体方案 v0.1\n\n' +
'状态：**草稿**。第一版用 ERP 字段字典直接生成本体桩（Mock），后续再按真实数据校对。\n\n' +
'| 生成方式 | 先起草，边做边完善：试用后哪里不够再回填 |\n|---|---|\n' +
'| 版本 | v0.1 · 草稿 |\n' +
'| Mock 范围 | **整份本体为 Mock**：对象、属性、关系由 ERP 字段字典直接推导，未经真实数据校对 |\n' +
'| 已知缺口 | 「例外」状态、合同年降条款尚未结构化（见第 6 节） |\n\n' +
'## 1. 对象\n\n' +
'| 对象 | 说明 | 主键 | 主要来源 |\n|---|---|---|---|\n' +
'| Supplier 供应商 | 供应商主数据与资质状态 | supplier_id | ERP 供应商主数据 · 合格供应商清单 |\n' +
'| Part 料号 | 物料及所属品类 | part_no | ERP 物料主数据 |\n' +
'| Quote 报价 | 某供应商对某料号的有效报价 | quote_id | ERP 报价导出（14 条） |\n' +
'| Contract 合同 | 框架协议与价格条款 | contract_id | 历史合同 · 价格汇总表 |\n' +
'| Incident 异常 | 质量、交期、产能异常记录 | incident_id | 异常记录 2026（8 起） |\n\n' +
'## 2. 关键属性\n\n' +
'| 对象 | 属性 |\n|---|---|\n' +
'| Supplier | name · status（qualified / exception / under_review）· iso_9001 · monthly_capacity · lead_time_weeks |\n' +
'| Part | category（electronic / structural）· spec · moq |\n' +
'| Quote | unit_price · currency · tax_rate · valid_until · moq |\n' +
'| Contract | start · end · annual_reduction · delay_penalty |\n' +
'| Incident | type · severity · replaced（是否触发替换）· date |\n\n' +
'## 3. 关系\n\n' +
'~~~text\n' +
'Supplier ──supplies──▶ Part\n' +
'Supplier ──quotes────▶ Quote ──for──▶ Part\n' +
'Supplier ──bound_by──▶ Contract\n' +
'Supplier ──has───────▶ Incident\n' +
'~~~\n\n' +
'## 4. 动作（供 Skill 调用）\n\n' +
'| 动作 | 输入 | 输出 |\n|---|---|---|\n' +
'| screen_suppliers | 品类、数量 | 通过硬性条件的候选清单 |\n' +
'| compare_quotes | 料号、供应商清单 | 换算后的比价表 |\n' +
'| score_suppliers | 清单、权重 | 分项得分与排序 |\n\n' +
'## 5. 与 ERP 的映射（Mock 阶段）\n\n' +
'- 供应商：`SUPPLIER_MASTER` → Supplier（字段名一一对应，缺 ISO 字段，用合格供应商清单补）\n' +
'- 报价：`QUOTATION_EXPORT` → Quote（含税价需按税率换算）\n' +
'- 第一版不做实时同步，使用导出样例数据。\n\n' +
'## 6. 待校对\n\n' +
'- 供应商的「例外」状态目前只存在于清单备注，需要在本体里单独建属性。\n' +
'- Contract 的年降条款是文本，需要结构化后才能参与比价。\n',
  });

  md({
    folder: 'Design plans', name: 'Agent plan v0.1.md',
    size: '7 KB', pages: '3 页', updated: '今天', author: 'AgentOS · 草稿',
    note: 'Agent 方案：角色、能力、Skill 与 MCP 清单、对话流程与边界',
    md:
'# 寻源策略 Agent · Agent 方案 v0.1\n\n' +
'状态：**草稿**。Skill 与 MCP 第一版用桩（Mock）实现，用来先跑通对话和输出格式。\n\n' +
'| 生成方式 | 先起草，边做边完善：试用后哪里不够再回填 |\n|---|---|\n' +
'| 版本 | v0.1 · 草稿 |\n' +
'| Mock 范围 | **3 处**：3 个 Skill（规则版）· ERP 连接（14 条样例报价）· 本体（来自本体方案） |\n' +
'| 真实部分 | 角色与边界、对话流程、输出格式、准入标准与评审模板 |\n\n' +
'## 1. 角色与边界\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 名称 | Sourcing Strategy Agent |\n' +
'| 定位 | 采购的寻源助手：筛选、比价、评分、找替代；不做审批、签约 |\n' +
'| 语气 | 先给结论，再给依据，不确定时直接说明 |\n' +
'| 禁区 | 不替用户做审批；不对外发送任何消息；不修改 ERP 数据 |\n\n' +
'## 2. 能力与 Skill\n\n' +
'| Skill | 做什么 | 第一版 |\n|---|---|---|\n' +
'| screen-suppliers | 按硬性条件筛选候选供应商 | Mock · 规则版 |\n' +
'| compare-quotes | 整理报价并换算后比价 | Mock · 读样例数据 |\n' +
'| score-suppliers | 按权重打分排序，附分项依据 | Mock · 固定权重 |\n' +
'| find-alternatives | 异常时推荐替代供应商 | 依赖前三个 Skill |\n\n' +
'## 3. MCP / 数据连接\n\n' +
'| 连接 | 用途 | 第一版 |\n|---|---|---|\n' +
'| ERP connector | 读取供应商、料号、报价 | Mock · 样例数据（14 条报价） |\n' +
'| 规则与模板库 | 准入标准、评审摘要模板 | 真实 · 来自你上传的资料 |\n\n' +
'## 4. 典型对话流程\n\n' +
'1. 用户描述需求（品类 / 料号 / 场景）\n' +
'2. Agent 复述理解，缺信息时只追问一个问题\n' +
'3. 调用 screen → compare → score，给出推荐与依据\n' +
'4. 标出例外与风险，提示需要人确认的点\n' +
'5. 用户要求时，生成评审摘要草稿\n\n' +
'## 5. 输出格式\n\n' +
'- 先写结论（推荐哪几家、为什么）\n' +
'- 比价表：供应商 · 单价 · 交期 · 得分 · 风险标记\n' +
'- 依据：每条结论附来源（合同 / 准入标准 / ERP 记录）\n' +
'- Mock 产生的数据在界面上标注 **MOCK**\n\n' +
'## 6. 评估方式\n\n' +
'- 回测 10 个历史新品导入与异常替换案例，对比人工结论\n' +
'- 每次试用后记录「缺什么」，进入 Mock 回填清单\n',
  });

  /* ─────────── Agent v0.1 (generated) ─────────── */
  md({
    folder: 'Agent v0.1', name: 'Agent spec v0.1.md',
    size: '6 KB', pages: '3 页', updated: '今天', author: 'AgentOS · 已生成',
    note: 'Sourcing Strategy Agent v0.1 的配置与能力清单',
    md:
'# Sourcing Strategy Agent · Spec v0.1\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 状态 | **Ready to try**（含 3 处 Mock） |\n' +
'| 场景 | T1 Sourcing strategy |\n' +
'| 基于 | Product plan v0.1 · Ontology plan v0.1 · Agent plan v0.1 |\n' +
'| 品类 | 电子元器件、结构件 |\n\n' +
'## 系统提示（摘要）\n\n' +
'~~~text\n' +
'你是采购的寻源助手。先给结论，再给依据。\n' +
'硬性条件：ISO 9001 一票否决；月产能 ≥ 10 万件、交期 ≤ 4 周不达标则扣分并提示。\n' +
'评分权重：质量 45 · 交期 30 · 价格 15 · 稳定性 10。\n' +
'例外供应商必须显式标记，不得静默剔除或静默放行。\n' +
'使用 Mock 数据时在回答里标注 MOCK。\n' +
'~~~\n\n' +
'## 能力\n\n' +
'| Skill / 工具 | 状态 |\n|---|---|\n' +
'| screen-suppliers | Mock |\n' +
'| compare-quotes | Mock |\n' +
'| score-suppliers | Mock |\n' +
'| ERP connector（MCP） | Mock · 样例数据 |\n' +
'| 准入标准 · 评审模板 | 真实 |\n\n' +
'## 已知限制\n\n' +
'- 价格和交期来自样例数据，不是 ERP 实时值\n' +
'- 评分权重固定，暂不支持按场景调整\n' +
'- 不支持审批与合同动作\n',
  });

  md({
    folder: 'Agent v0.1', name: 'Mock register v0.1.md',
    size: '4 KB', pages: '2 页', updated: '今天', author: 'AgentOS · 已生成',
    note: '第一版用到的所有 Mock，以及如何替换成真实实现',
    md:
'# Mock 清单 v0.1\n\n' +
'第一版为了尽快可试用，下面三处用了桩实现。试用中发现问题后，逐项替换。\n\n' +
'| # | Mock 项 | 现在是什么 | 替换成什么 | 优先级 |\n|---|---|---|---|---|\n' +
'| 1 | 本体 Ontology | 由 ERP 字段字典直接生成的对象和关系 | 按真实数据校对后的本体，补「例外」属性和合同结构化条款 | 高 |\n' +
'| 2 | Skill 规则 | 固定权重和阈值的规则版 screen / compare / score | 可配置规则、带版本，并用历史案例回测 | 中 |\n' +
'| 3 | ERP MCP | 14 条样例报价的静态数据 | 只读连接 ERP 实时接口 | 高 |\n\n' +
'## 影响范围\n\n' +
'- Mock 1 影响：供应商状态判断、例外标记\n' +
'- Mock 2 影响：评分结果的可解释性\n' +
'- Mock 3 影响：价格和交期是否实时\n\n' +
'## 建议顺序\n\n' +
'1. 先接 ERP（Mock 3），回答才有真实价格\n' +
'2. 再校对本体（Mock 1），解决例外与合同条款\n' +
'3. 最后固化 Skill 规则（Mock 2）\n',
  });

  md({
    folder: 'Agent v0.1', name: 'Ontology stub.json',
    size: '3 KB', pages: '', updated: '今天', author: 'AgentOS · 已生成',
    note: '由 ERP 字段字典生成的本体桩',
    md:
'# Ontology stub（Mock）\n\n' +
'~~~json\n' +
'{\n' +
'  "objects": {\n' +
'    "Supplier": { "key": "supplier_id", "props": ["name", "status", "iso_9001", "monthly_capacity", "lead_time_weeks"] },\n' +
'    "Part":     { "key": "part_no",     "props": ["category", "spec", "moq"] },\n' +
'    "Quote":    { "key": "quote_id",    "props": ["unit_price", "currency", "tax_rate", "valid_until"] },\n' +
'    "Contract": { "key": "contract_id", "props": ["start", "end", "annual_reduction", "delay_penalty"] },\n' +
'    "Incident": { "key": "incident_id", "props": ["type", "severity", "replaced", "date"] }\n' +
'  },\n' +
'  "links": [\n' +
'    ["Supplier", "supplies", "Part"],\n' +
'    ["Supplier", "quotes", "Quote"],\n' +
'    ["Quote", "for", "Part"],\n' +
'    ["Supplier", "bound_by", "Contract"],\n' +
'    ["Supplier", "has", "Incident"]\n' +
'  ],\n' +
'  "source": "ERP field dictionary (stub)",\n' +
'  "mock": true\n' +
'}\n' +
'~~~\n',
  });


  /* ─────────── Handoff v0.1 (sandbox → Steps) ─────────── */
  md({
    folder: 'Handoff v0.1', name: 'Mapping list v0.1.md',
    size: '5 KB', pages: '2 页', updated: '今天', author: 'AgentOS · 交接包',
    note: '轻量版对照真实环境文档结构的映射清单：沿用 / 校对 / 改 Mock / 再创作',
    md:
'# 映射清单 v0.1 · Mapping list\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 来源 | 轻量版 · Sourcing Strategy Agent v0.1（轻量模式），原样保留 |\n' +
'| 目标 | 在按流程打造里按真实环境的文档结构详细打造，发布为正式 v1.0 |\n' +
'| 说明 | 文档清单以产品经理定的结构为准，这里按蓝图现有文档列出 |\n\n' +
'## 1. 文档映射\n\n' +
'| 步骤 | 真实环境的文档 | 轻量版 | 状态 |\n|---|---|---|---|\n' +
'| 1 Requirements | Requirements brief | 对话整理的需求与 5 个决策 | **沿用** |\n' +
'| 1 Requirements | Success criteria | 只有试用时的口头判断 | **需再创作** |\n' +
'| 2 Knowledge | Contracts · rules | 已上传的合同与准入标准 | **沿用** |\n' +
'| 2 Knowledge | Process notes | 流程说明、访谈纪要、异常记录 | **沿用** |\n' +
'| 2 Knowledge | ERP export | 只有 14 条样例报价 | **需校对** |\n' +
'| 3–5 Design plans | Product / Ontology / Agent plan | 轻量模式起草，含临时假设 | **需校对** |\n' +
'| 6 Ontology | Data source spec · Semantic graph | 由 ERP 字段字典生成 | **Mock · 需要改** |\n' +
'| 7 Skills · MCP | Skill specs · MCP specs | 固定阈值与权重；样例 ERP 接口 | **Mock · 需要改** |\n' +
'| 7 Skills · MCP | Resource list | POC 没涉及 | **需再创作** |\n' +
'| 8 Agent | Agent spec | 基于 Mock 的本体和 Skill 生成 | **Mock · 需要改** |\n\n' +
'## 2. 打造顺序\n\n' +
'1. 接入 ERP 只读接口（Mock 3）\n2. 校对本体（Mock 1）\n3. 固化 Skill 规则（Mock 2）\n4. 发布检查，通过后发布 v1.0\n\n' +
'## 3. 已锁定的决策\n\n',
  });
  md({
    folder: 'Handoff v0.1', name: 'Trial log v0.1.md',
    size: '2 KB', pages: '1 页', updated: '今天', author: 'AgentOS · 交接包',
    note: '轻量版试用中问过的问题与结果，作为按流程打造的待办来源',
    md:
'# 试用日志 v0.1\n\n' +
'轻量版试用时问过的问题。结果为「缺口」的会转成按流程打造里的待办。\n\n' +
'| # | 问题 | 结果 | 转成待办 |\n|---|---|---|---|\n',
  });
  md({
    folder: 'Handoff v0.1', name: 'Release checklist v0.1.md',
    size: '3 KB', pages: '1 页', updated: '今天', author: 'AgentOS · 交接包',
    note: '从轻量版发布到正式环境的三道门槛',
    md:
'# 发布检查清单\n\n' +
'轻量版 v0.1 要变成正式 v1.0，三道门槛都要通过：\n\n' +
'| # | 门槛 | 标准 | 负责人 |\n|---|---|---|---|\n' +
'| 1 | Mock 清零 | 本体、Skill 规则、ERP 连接 3 项全部替换为真实实现 | 采购经理 + 平台 |\n' +
'| 2 | 权限就绪 | ERP 只读账号和数据权限已配置 | IT / 平台 |\n' +
'| 3 | 负责人签字 | 业务负责人确认可以上线 | 供应链总监 |\n\n' +
'## 环境与版本\n\n' +
'| 环境 | 版本 | 说明 |\n|---|---|---|\n' +
'| 轻量版 | v0.1 | 样例数据，仅用于试用，不影响正式环境 |\n' +
'| 加固中 | RC | 逐项替换 Mock |\n' +
'| 正式 | v1.0 | 真实数据，对业务用户开放 |\n',
  });
  md({
    folder: 'Release v1.0', name: 'Release notes v1.0.md',
    size: '3 KB', pages: '1 页', updated: '今天', author: 'AgentOS · 发布',
    note: 'Sourcing Strategy Agent v1.0 发布说明',
    md:
'# Sourcing Strategy Agent · v1.0 发布说明\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 环境 | **正式** |\n' +
'| 版本 | v1.0（由轻量版 v0.1 经按流程打造加固而来） |\n' +
'| 发布门槛 | 3 / 3 通过 |\n\n' +
'## 相比 v0.1\n\n' +
'- 本体：按真实数据校对，新增供应商「例外」属性，合同年降条款已结构化\n' +
'- Skill：规则可配置、带版本\n' +
'- ERP：接入只读接口，不再使用样例数据\n' +
'- 回答中不再出现 MOCK 标记\n\n' +
'## 已知限制\n\n' +
'- 不支持审批与合同动作\n' +
'- 首批品类：电子元器件、结构件\n',
  });

  window.FastPlanData = { decisions: decisions, picks: null };
})();
