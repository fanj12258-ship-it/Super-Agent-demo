/**
 * Fast POC page ONLY — mock documents the user "uploads" in the T1 Sourcing journey.
 * 9 files in 4 folders (the Agent files them into Materials). Content is deliberately full:
 * contracts, admission standard, process notes, interview notes, supplier / price / incident tables, ERP export.
 *   kind: 'md'    → body is markdown (rendered with the same renderer as the chat: AgentBody)
 *   kind: 'sheet' → sheets: [{ name, cols, rows }]
 * NOTE: file names must not contain ( ) [ ] | — they are used as markdown link targets.
 * Write "~~~" for a code fence (replaced with three backticks at load).
 */
(function () {
  'use strict';

  var D = [];
  function md(o) { o.kind = 'md'; o.md = o.md.replace(/^~~~/gm, '```'); D.push(o); }
  function sheet(o) { o.kind = 'sheet'; D.push(o); }

  /* ─────────────────────────── Historical contracts ─────────────────────────── */

  md({
    folder: 'Historical contracts',
    name: 'Framework agreement - Hexin Microelectronics 2025.docx',
    size: '186 KB', pages: '14 页', updated: '2025-03-12', author: '采购中心 · 法务部',
    note: '价格年降 3%，交期承诺 3 周，延期罚则 0.5%/天',
    md:
'# 采购框架协议\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 协议编号 | FA-2025-003 |\n' +
'| 签订日期 | 2025-03-12 |\n' +
'| 有效期 | 2025-03-15 至 2027-03-14（到期前 90 天启动续约谈判） |\n' +
'| 甲方（买方） | DJI Innovations 采购中心 |\n' +
'| 乙方（卖方） | 华芯微电子（深圳）有限公司 Hexin Microelectronics |\n' +
'| 甲方联系人 | 林 ** · 电子物料采购经理 |\n' +
'| 乙方联系人 | 张 ** · 大客户销售总监 |\n\n' +
'## 第一条 合作范围\n\n' +
'1. 乙方向甲方供应 MCU、电源管理 IC 两个系列，具体型号见附件一《价格清单》。\n' +
'2. 本协议为框架协议，具体数量、交期以甲方采购订单（PO）为准；PO 与本协议冲突时以本协议为准。\n' +
'3. 乙方不得将甲方定制料号（HX32F407-D 系列）转供第三方。\n\n' +
'## 第二条 价格与调整\n\n' +
'| 料号 | 描述 | 封装 | 协议单价（CNY） | MOQ |\n|---|---|---|---|---|\n' +
'| HX32F407 | 32 位 MCU，168 MHz | LQFP100 | 12.80 | 10,000 |\n' +
'| HX-PM2201 | 电源管理 IC，双路降压 | QFN24 | 3.15 | 10,000 |\n' +
'| HX-PM2205 | 电源管理 IC，单路 LDO | SOT23-5 | 0.68 | 50,000 |\n\n' +
'1. 价格含税（13% 增值税），含包装，不含运费；交货条款 EXW 深圳。\n' +
'2. 年度降价：自第二个协议年度起，每年在上一年度价格基础上不低于 3% 的降幅。\n' +
'3. 原材料联动：晶圆成本波动超过 ±8% 时，任一方可发起价格复议，30 日内给出调整方案。\n' +
'4. 最优价格条款：乙方给予同等量级客户的价格低于本协议价格时，应在 15 日内向甲方同步。\n\n' +
'## 第三条 订单与交付\n\n' +
'| 项目 | 约定 |\n|---|---|\n' +
'| 标准交期 | PO 确认后 3 周（21 天） |\n' +
'| 紧急订单 | 1 周内交付，加急费不超过订单金额 5%，每季度不超过 2 次 |\n' +
'| 预测机制 | 甲方每月提供未来 6 个月滚动预测；前 3 个月为约束性预测 |\n' +
'| 安全库存 | 乙方为甲方保留相当于 4 周预测用量的成品库存 |\n' +
'| 交货准确率 | 准时交付率 ≥ 95%（按 PO 行计算） |\n\n' +
'## 第四条 质量\n\n' +
'1. 乙方须在协议期内保持有效的 ISO 9001 与 IATF 16949 认证，证书状态变更须 5 个工作日内通知甲方。\n' +
'2. 来料不良率目标：≤ 500 PPM；连续两个月超过 1,000 PPM，甲方有权暂停新增订单并要求现场整改。\n' +
'3. 质量异常响应：24 小时内书面回复，7 个工作日内提交 8D 报告。\n' +
'4. 甲方有权每年进行不少于 1 次现场审核，乙方应配合并开放生产与检测区域。\n' +
'5. 变更管理：工艺、材料、产地变更须提前 90 天书面通知并获得甲方认可（PCN 流程）。\n\n' +
'## 第五条 违约责任\n\n' +
'| 情形 | 违约金 |\n|---|---|\n' +
'| 延期交付 | 每延期一日按延期部分货款的 0.5% 计，累计不超过 10% |\n' +
'| 质量批退（因乙方原因） | 承担退换货及甲方产线停工的直接损失，上限为该批货款的 150% |\n' +
'| 无故拒绝按约束性预测供货 | 按短交部分货款的 15% 支付违约金 |\n' +
'| 擅自变更工艺或产地 | 按该批货款的 20% 支付违约金，并承担甲方复测与重新认证费用 |\n\n' +
'## 第六条 付款\n\n' +
'1. 付款条件：月结 45 天（Net 45），以收货并验收合格之日起算。\n' +
'2. 发票须在每月 25 日前提交；逾期顺延至下一结算周期。\n\n' +
'## 第七条 保密与知识产权\n\n' +
'1. 双方对对方提供的技术资料、价格、产能信息承担保密义务，协议终止后 5 年内继续有效。\n' +
'2. 甲方提供的图纸、固件、测试规范的知识产权归甲方所有；乙方基于其通用平台形成的产品知识产权归乙方所有。\n\n' +
'## 第八条 协议终止\n\n' +
'- 任一方严重违约且在收到书面通知后 30 日内未纠正，守约方可终止协议。\n' +
'- 乙方出现破产、丧失关键资质、控制权变更影响供货，甲方可立即终止。\n' +
'- 终止后，已确认的 PO 继续履行；乙方应提供不少于 6 个月的生命周期结束（EOL）备货。\n\n' +
'## 第九条 其他\n\n' +
'争议先协商，协商不成提交深圳国际仲裁院仲裁。本协议一式四份，双方各执两份。\n\n' +
'## 附件\n\n' +
'- 附件一：价格清单（含 MOQ、交期）\n' +
'- 附件二：质量协议（含 PPM 目标、检验标准）\n' +
'- 附件三：保密协议（NDA）\n' +
'- 附件四：供应连续性与 EOL 备货计划',
  });

  md({
    folder: 'Historical contracts',
    name: 'Framework agreement - Jinli Precision 2024.docx',
    size: '172 KB', pages: '12 页', updated: '2024-06-28', author: '采购中心 · 法务部',
    note: '铝价联动，模具归甲方，2026-12 到期待续签',
    md:
'# 采购框架协议\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 协议编号 | FA-2024-011 |\n' +
'| 签订日期 | 2024-06-28 |\n' +
'| 有效期 | 2024-07-01 至 2026-12-31（**续签谈判进行中**） |\n' +
'| 甲方（买方） | DJI Innovations 采购中心 |\n' +
'| 乙方（卖方） | 锦利精密零部件（东莞）有限公司 Jinli Precision Parts |\n' +
'| 标的 | CNC 铝合金机身框架（A、B 两款） |\n\n' +
'## 第一条 价格与联动机制\n\n' +
'| 料号 | 描述 | 规格 | 协议单价（CNY） | MOQ |\n|---|---|---|---|---|\n' +
'| JL-FR-A01 | 机身框架 A | 6061-T6 · 阳极氧化 | 38.50 | 5,000 |\n' +
'| JL-FR-B02 | 机身框架 B | 6061-T6 · 喷砂 | 31.20 | 5,000 |\n\n' +
'1. 铝材联动：以上海有色网 A00 铝月均价为基准，涨跌幅超过 ±6% 时，按铝材耗用量（A 款 0.42 kg/件，B 款 0.35 kg/件）调整单价。\n' +
'2. 加工费固定，年度降幅不低于 2%。\n' +
'3. 阳极氧化工序外协的，外协厂须在甲方认可名单内（目前认可 2 家）。\n\n' +
'## 第二条 模具与治具\n\n' +
'1. 夹具、专用刀具和检具由甲方出资，所有权归甲方，乙方负责保管、维护和保险。\n' +
'2. 未经甲方书面同意，不得将甲方专用治具用于其他客户。\n' +
'3. 协议终止后 30 日内，乙方应将治具完好交还或按甲方指示转运。\n\n' +
'## 第三条 交付\n\n' +
'| 项目 | 约定 |\n|---|---|\n' +
'| 标准交期 | 4 周（28 天） |\n' +
'| 月产能承诺 | A 款 ≥ 120,000 件，B 款 ≥ 60,000 件 |\n' +
'| 峰值弹性 | 提前 8 周通知的情况下，可提升至承诺产能的 130% |\n' +
'| 准时交付率 | ≥ 93% |\n\n' +
'## 第四条 质量\n\n' +
'- 尺寸关键特征（CTQ）CPK ≥ 1.33；外观 AQL 0.65。\n' +
'- 每批出货须附全尺寸检测报告（FAI 首件 + 批次抽检），电子版同步上传甲方供应商门户。\n' +
'- 批次不良率超过 1.5% 判定批退，乙方 48 小时内提交原因分析。\n' +
'- 阳极氧化色差 ΔE ≤ 1.0，以甲方限度样品为准。\n\n' +
'## 第五条 违约与奖励\n\n' +
'| 情形 | 处理 |\n|---|---|\n' +
'| 延期交付 | 每日 0.3%，上限 8% |\n' +
'| 批退 | 退换货并承担挑选、返工费用 |\n' +
'| 连续 3 个月准时率 ≥ 98% | 下一季度给予 0.5% 价格奖励 |\n\n' +
'## 第六条 付款\n\n' +
'月结 60 天（Net 60），验收合格后起算；模具维护费按季度结算。\n\n' +
'## 第七条 续约\n\n' +
'到期前 120 日内，双方就价格、产能与质量目标启动续约谈判；甲方可同时启动二供寻源，乙方不得因此降低供货优先级。\n\n' +
'## 当前状态（采购备注）\n\n' +
'- 2026-09 已启动续约谈判，乙方提出铝价联动阈值调到 ±4%，并要求交期放宽到 5 周。\n' +
'- 5 周交期与准入标准 H3（≤ 4 周）冲突，需走例外审批或引入二供。',
  });

  sheet({
    folder: 'Historical contracts',
    name: 'Contract price summary 2024-2026.xlsx',
    size: '64 KB', pages: '2 个工作表', updated: '2026-08-30', author: '采购中心 · 成本组',
    note: '9 份合同、12 条价格条款，价格变动 −4.5% 至 +2.8%',
    sheets: [
      {
        name: 'Price lines',
        cols: ['Contract no.', 'Supplier', 'Part', 'Spec', 'Unit price (CNY)', 'MOQ', 'Lead time (wks)', 'Valid from', 'Valid to', 'Payment terms', 'vs. prior price'],
        rows: [
          ['FA-2024-011', 'Jinli Precision Parts', 'CNC frame A', '6061-T6 · anodized', '38.50', '5,000', '4', '2024-07-01', '2026-12-31', 'Net 60', '−2.1%'],
          ['FA-2024-011', 'Jinli Precision Parts', 'CNC frame B', '6061-T6 · sandblast', '31.20', '5,000', '4', '2024-07-01', '2026-12-31', 'Net 60', '−1.8%'],
          ['FA-2024-018', 'Tianyi Plastic Molding', 'Housing upper', 'PC+ABS · 2-cavity', '4.20', '20,000', '3', '2024-09-01', '2026-08-31', 'Net 45', '+0.5%'],
          ['FA-2024-018', 'Tianyi Plastic Molding', 'Housing lower', 'PC+ABS · 2-cavity', '3.85', '20,000', '3', '2024-09-01', '2026-08-31', 'Net 45', '+0.5%'],
          ['FA-2025-003', 'Hexin Microelectronics', 'MCU HX32F407', 'LQFP100', '12.80', '10,000', '3', '2025-03-15', '2027-03-14', 'Net 45', '−3.0%'],
          ['FA-2025-003', 'Hexin Microelectronics', 'Power IC HX-PM2201', 'QFN24', '3.15', '10,000', '3', '2025-03-15', '2027-03-14', 'Net 45', '−2.5%'],
          ['FA-2025-009', 'Zhongke Sensing', 'IMU ZK-IMU6', 'LGA14', '9.60', '5,000', '4', '2025-05-01', '2027-04-30', 'Net 60', '+1.2%'],
          ['FA-2025-014', 'Yuanda Capacitors', 'MLCC 10uF', '0402 · X5R', '0.021', '500,000', '2', '2025-06-01', '2027-05-31', 'Net 30', '−4.5%'],
          ['FA-2025-016', 'Rongxin Circuit', 'PCB 6-layer HDI', '98 × 64 mm', '6.80', '2,000', '3', '2025-08-01', '2027-07-31', 'Net 60', '−1.0%'],
          ['FA-2025-021', 'Haoyu Die-casting', 'Mg die-cast arm', 'AZ91D', '22.40', '3,000', '4', '2025-09-01', '2027-08-31', 'Net 60', '+2.8%'],
          ['FA-2026-004', 'Hengtai Stamping', 'Bracket 0.8 mm', 'SUS304', '0.85', '50,000', '2', '2026-02-01', '2028-01-31', 'Net 45', '−1.5%'],
          ['FA-2026-007', 'Lianbo Connectors', 'B2B connector 40-pin', '0.4 mm pitch', '0.46', '100,000', '3', '2026-04-01', '2028-03-31', 'Net 45', '−0.8%'],
        ],
      },
      {
        name: 'Notes',
        cols: ['Item', 'Note'],
        rows: [
          ['Currency', 'CNY, tax included (13% VAT), EXW unless stated'],
          ['Price review', 'Annual; commodity-linked clauses: aluminum (Jinli), wafer cost (Hexin)'],
          ['Expiring within 6 months', 'FA-2024-011 Jinli (2026-12-31) · FA-2024-018 Tianyi (2026-08-31, extended by letter)'],
          ['Coverage gap', 'Optoelectronics (camera modules) and fasteners have no framework agreement; bought by PO'],
          ['Owner', 'Procurement · Cost team (updated monthly from ERP contract module)'],
        ],
      },
    ],
  });

  /* ─────────────────────────── Supplier standards ─────────────────────────── */

  md({
    folder: 'Supplier standards',
    name: 'Supplier admission standard v3.2.md',
    size: '18 KB', pages: '4 页', updated: '2026-02-18', author: '采购中心 · 质量部',
    note: '3 条硬性条件，评分权重：质量 35 / 交期 25 / 价格 25 / 稳定性 15',
    md:
'# 供应商准入标准 v3.2\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 适用范围 | 电子元器件、结构件两大类直接物料供应商 |\n' +
'| 发布 | 采购中心 · 质量部，2026-02-18 |\n' +
'| 下次修订 | 2027-02 |\n\n' +
'## 1. 目的\n\n' +
'统一新供应商引入与存量供应商年度复审的门槛和评分方法，保证关键物料的质量、交付和成本可控。\n\n' +
'## 2. 硬性条件（一票否决）\n\n' +
'| 编号 | 条件 | 判定标准 | 证明材料 |\n|---|---|---|---|\n' +
'| H1 | 质量体系认证 | 持有有效 ISO 9001；到期前 90 天须提交复审计划 | 认证证书 · 审核报告 |\n' +
'| H2 | 月产能 | 目标物料月产能 ≥ 10 万件（结构件按成品件数计） | 产能核定表 · 现场核查 |\n' +
'| H3 | 标准交期 | 标准订单交期 ≤ 4 周；超出须走例外审批 | 近 6 个月交付记录 |\n' +
'| H4 | 合规与财务 | 无重大行政处罚；近 2 年无严重亏损 | 企业信用报告 |\n' +
'| H5 | 保密与知识产权 | 签署 NDA 与 IP 条款 | 已签署文本 |\n\n' +
'## 3. 评分模型（总分 100）\n\n' +
'| 维度 | 权重 | 评价内容 | 数据来源 |\n|---|---|---|---|\n' +
'| 质量 | 35 | 来料不良率（PPM）、8D 响应时长、过程审核得分 | IQC 记录 · 审核报告 |\n' +
'| 交期 | 25 | 准时交付率、交期波动、紧急订单响应 | ERP 收货记录 |\n' +
'| 价格 | 25 | 与行业基准价差距、年降承诺、付款条件 | ERP 报价 · 合同 |\n' +
'| 稳定性 | 15 | 财务健康、产能余量、产品线匹配度 | 信用报告 · 现场核查 |\n\n' +
'## 4. 分级与处置\n\n' +
'| 等级 | 总分 | 处置 |\n|---|---|---|\n' +
'| A | ≥ 85 | 战略供应商：优先分配，纳入年度框架协议 |\n' +
'| B | 70–84 | 合格供应商：正常分配 |\n' +
'| C | 60–69 | 观察：限量分配，须提交改进计划 |\n' +
'| D | < 60 | 退出：不再新增订单 |\n\n' +
'## 5. 准入流程\n\n' +
'1. 采购工程师提交准入申请（含物料清单与目标量）\n' +
'2. 质量部审核资料，新品导入类强制现场审核\n' +
'3. 采购部比价并打分，出具《准入评估表》\n' +
'4. 采购总监审批；金额超过 500 万元的加会签财务\n' +
'5. 签署框架协议，录入 ERP 供应商主数据\n\n' +
'## 6. 例外审批\n\n' +
'- 仅限两类情形：新品导入且无替代来源；供应商异常需紧急替换。\n' +
'- 申请人须说明风险与缓解措施，有效期最长 6 个月。\n' +
'- 近 12 个月例外审批共 5 次，其中交期例外 3 次、产能例外 2 次。\n\n' +
'## 7. 复审周期\n\n' +
'A、B 级每年一次；C 级每半年一次；发生重大质量事故后立即复审。\n\n' +
'## 8. 修订记录与已知问题\n\n' +
'| 版本 | 日期 | 变更 |\n|---|---|---|\n' +
'| v3.0 | 2024-03 | 价格权重由 20 提升到 25（降本目标） |\n' +
'| v3.1 | 2025-04 | 新增 H5；明确例外审批有效期 |\n' +
'| v3.2 | 2026-02 | 产能口径改为"成品件数" |\n\n' +
'- 评分目前由采购工程师在 Excel 中手工计算，不同人对"稳定性"的打分口径不一致。\n' +
'- 新品导入阶段缺少历史交付数据，交期维度只能按承诺值打分。',
  });

  sheet({
    folder: 'Supplier standards',
    name: 'Qualified supplier list 2026.xlsx',
    size: '42 KB', pages: '2 个工作表', updated: '2026-09-10', author: '采购中心 · 供应商管理',
    note: '12 家供应商：9 家合格，2 家例外，1 家复核中；2 家证书年内到期',
    sheets: [
      {
        name: 'Suppliers',
        cols: ['Supplier ID', 'Supplier', 'Category', 'Main parts', 'ISO 9001 valid until', 'Monthly capacity (k pcs)', 'Lead time (wks)', 'Grade', 'Score', 'Status', 'Note'],
        rows: [
          ['S-001', 'Hexin Microelectronics', 'Electronic', 'MCU · power ICs', '2027-03', '1,200', '3', 'A', '91', 'Qualified', 'Framework FA-2025-003'],
          ['S-002', 'Zhongke Sensing', 'Electronic', 'IMU · barometer', '2027-11', '600', '4', 'A', '88', 'Qualified', 'Framework FA-2025-009'],
          ['S-003', 'Yuanda Capacitors', 'Electronic', 'MLCC · tantalum', '2027-06', '5,000', '2', 'B', '79', 'Qualified', 'Framework FA-2025-014'],
          ['S-004', 'Rongxin Circuit', 'Electronic', 'PCB · FPC', '2027-01', '300', '3', 'B', '76', 'Qualified', 'Fab fire in Jul — dual-sourced'],
          ['S-005', 'Lianbo Connectors', 'Electronic', 'B2B connectors', '2026-12', '800', '3', 'B', '74', 'Qualified', 'ISO renewal due Dec'],
          ['S-006', 'Kaisheng Optoelectronics', 'Electronic', 'Camera modules', '2027-09', '150', '6', 'A', '86', 'Exception', 'Lead time > 4 wks · EX-2026-02'],
          ['S-007', 'Jinli Precision Parts', 'Structural', 'CNC aluminum frames', '2027-10', '180', '4', 'A', '89', 'Qualified', 'Renewal under negotiation'],
          ['S-008', 'Haoyu Die-casting', 'Structural', 'Magnesium die-casting', '2027-02', '220', '4', 'B', '77', 'Qualified', 'Porosity issue in Sep'],
          ['S-009', 'Tianyi Plastic Molding', 'Structural', 'Injection housings', '2026-12', '400', '3', 'B', '72', 'Qualified', 'ISO expiring · re-audit scheduled'],
          ['S-010', 'Hengtai Stamping', 'Structural', 'Stamped brackets', '2027-04', '900', '2', 'B', '75', 'Qualified', 'Framework FA-2026-004'],
          ['S-011', 'Ruifeng Fasteners', 'Structural', 'Screws · fasteners', '—', '2,000', '2', 'C', '63', 'Under review', 'ISO 9001 certificate missing'],
          ['S-012', 'Mingda Rubber & Seals', 'Structural', 'Silicone seals', '2027-03', '80', '5', 'B', '70', 'Exception', 'Capacity < 100k · lead time > 4 wks'],
        ],
      },
      {
        name: 'Rules',
        cols: ['Rule', 'Threshold', 'Applies to', 'Source'],
        rows: [
          ['H1 · ISO 9001', 'Valid certificate', 'All suppliers', 'Admission standard v3.2 §2'],
          ['H2 · Monthly capacity', '≥ 100k pcs', 'Target material', 'Admission standard v3.2 §2'],
          ['H3 · Standard lead time', '≤ 4 weeks', 'Standard orders', 'Admission standard v3.2 §2'],
          ['Weight · Quality', '35', 'Scoring', 'Admission standard v3.2 §3'],
          ['Weight · Delivery', '25', 'Scoring', 'Admission standard v3.2 §3'],
          ['Weight · Price', '25', 'Scoring', 'Admission standard v3.2 §3'],
          ['Weight · Stability', '15', 'Scoring', 'Admission standard v3.2 §3'],
        ],
      },
    ],
  });

  /* ─────────────────────────── Process & notes ─────────────────────────── */

  md({
    folder: 'Process & notes',
    name: 'Sourcing process - current state.docx',
    size: '210 KB', pages: '9 页', updated: '2026-07-21', author: '采购中心 · 流程组',
    note: '7 个环节，主要靠 Excel 与邮件；筛选与比价各需约 2 天',
    md:
'# 寻源流程现状说明\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 编制 | 采购中心 · 流程组 |\n' +
'| 日期 | 2026-07-21 |\n' +
'| 范围 | 电子元器件、结构件的新供应商寻源与存量供应商替换 |\n\n' +
'## 1. 概览\n\n' +
'寻源由两类事件触发：**新品导入**（NPI，每年约 14 个项目）与**供应商异常替换**（2026 年已发生 8 起异常，其中 3 起走到替换）。目前整个流程依赖 ERP 导出、Excel 与邮件，缺少统一的候选库和评分工具。\n\n' +
'## 2. 流程总览\n\n' +
'~~~text\n' +
'触发（NPI / 异常）\n' +
'   ↓\n' +
'① 需求确认：物料清单 · 目标量 · 目标价 · 需求日期\n' +
'   ↓\n' +
'② 候选长名单：从合格供应商清单 + 行业渠道初筛（平均 15–20 家）\n' +
'   ↓\n' +
'③ 硬性条件核查：ISO 9001 · 月产能 · 交期\n' +
'   ↓\n' +
'④ 询价与比价：RFQ → ERP 报价 → 手工比价表\n' +
'   ↓\n' +
'⑤ 打分与排序：按准入标准评分模型\n' +
'   ↓\n' +
'⑥ 评审与审批：采购总监 · 质量部 · 研发（必要时财务）\n' +
'   ↓\n' +
'⑦ 合同与导入：框架协议 → 小批量试产 → 量产放行\n' +
'~~~\n\n' +
'## 3. 各环节说明\n\n' +
'| 环节 | 负责人 | 工具 | 平均耗时 | 主要痛点 |\n|---|---|---|---|---|\n' +
'| ① 需求确认 | 采购工程师 + 研发 | 邮件 · 会议 | 1–2 天 | 需求口径不统一，反复补充 |\n' +
'| ② 候选长名单 | 采购工程师 | Excel · 行业渠道 | 2 天 | 清单分散在个人手里，缺少统一候选库 |\n' +
'| ③ 硬性条件核查 | 采购工程师 | Excel · 供应商门户 | 2 天 | 证书到期、产能口径靠人工核对 |\n' +
'| ④ 询价与比价 | 采购工程师 | ERP · Excel | 3–5 天 | 报价格式不一，币种与交货条款需换算 |\n' +
'| ⑤ 打分与排序 | 采购工程师 | Excel | 1 天 | 打分口径不一致，历史数据取不全 |\n' +
'| ⑥ 评审与审批 | 总监 · 质量 · 研发 | 邮件 · 评审会 | 3–7 天 | 材料每次要重新整理 |\n' +
'| ⑦ 合同与导入 | 采购 + 法务 | OA · ERP | 2–4 周 | 条款模板多，版本管理混乱 |\n\n' +
'## 4. 关键指标（2026 年 1–6 月）\n\n' +
'| 指标 | 数值 |\n|---|---|\n' +
'| 平均寻源周期（触发到合同签署） | 38 个工作日 |\n' +
'| 新品导入项目数 | 7 |\n' +
'| 供应商异常数 | 8（质量 4、交期 3、产能 1） |\n' +
'| 触发替换数 | 3 |\n' +
'| 例外审批数 | 5 |\n' +
'| 采购工程师人均同时跟进寻源项目 | 4.5 个 |\n\n' +
'## 5. 痛点汇总\n\n' +
'1. **信息分散**：合同、报价、认证证书、异常记录分别存放在 ERP、共享盘和邮件里，每次寻源都要重新收集。\n' +
'2. **比价耗时**：不同供应商的报价单格式、币种、交货条款不同，人工换算容易出错。\n' +
'3. **评分口径不一致**：同一供应商在不同项目里被不同人打出不同分数。\n' +
'4. **异常时被动**：供应商出问题后才临时找替代，缺少预先评估过的备选清单。\n' +
'5. **审批材料重复整理**：每次评审会都要把同样的数据重新做成 PPT。\n\n' +
'## 6. 现有系统\n\n' +
'| 系统 | 用途 | 可否导出 |\n|---|---|---|\n' +
'| ERP（采购模块） | 报价、订单、收货、供应商主数据 | 可，Excel/CSV |\n' +
'| 供应商门户 | 证书、产能问卷、审核报告 | 可，PDF |\n' +
'| OA | 合同与审批流 | 仅审批状态 |\n' +
'| 共享盘 | 合同扫描件、会议纪要 | 文件 |',
  });

  md({
    folder: 'Process & notes',
    name: 'Kickoff interview notes-0918.md',
    size: '12 KB', pages: '3 页', updated: '2026-09-18', author: 'FDE 团队',
    note: '采购总监期望：筛选自动化、评分可解释、异常时能快速给出替代方案',
    md:
'# T1 寻源策略 · 启动访谈纪要\n\n' +
'| 项目 | 内容 |\n|---|---|\n' +
'| 日期 | 2026-09-18 14:00–15:30 |\n' +
'| 参会 | 采购总监 · 电子物料采购经理 · 结构件采购经理 · 质量部代表 · FDE 2 人 |\n' +
'| 目的 | 对齐 T1 场景范围、成功标准和可用数据 |\n\n' +
'## 1. 场景范围\n\n' +
'- 先做**电子元器件**与**结构件**两类；光学、包材暂不纳入。\n' +
'- 目标是帮采购工程师在"新品导入"和"供应商异常替换"两种场景下，快速给出**候选供应商清单 + 推荐理由**。\n' +
'- 不替代最终审批，审批仍由采购总监与质量部负责。\n\n' +
'## 2. 访谈要点\n\n' +
'### 采购总监\n\n' +
'- "最浪费时间的是长名单筛选和比价，这两步加起来占了一半的周期。"\n' +
'- 评估时**质量第一，交期第二，价格第三**；价格不能压倒质量，今年两次质量事故都出在价格最低的供应商上。\n' +
'- 希望评分**可解释**：每个分数要能追溯到合同条款、ERP 数据或审核报告。\n\n' +
'### 电子物料采购经理\n\n' +
'- 触发场景以新品导入为主，一般提前 4–6 个月；异常替换要求 2 周内给出可行方案。\n' +
'- ERP 里有近两年的报价和收货记录，字段比较规范，可以导出。\n' +
'- 光学类（摄像头模组）交期长，一直走例外，希望单独标记而不是被筛掉。\n\n' +
'### 结构件采购经理\n\n' +
'- 铝材、镁合金价格联动是关键，合同里的联动条款要被读出来。\n' +
'- 模具归我们所有，更换供应商时要考虑治具转运成本和周期。\n\n' +
'### 质量部\n\n' +
'- ISO 证书有效期、审核结论、PPM 要作为硬数据进入评分。\n' +
'- 现场审核结论目前只有 PDF，没有结构化。\n\n' +
'## 3. 成功标准（初稿）\n\n' +
'| 指标 | 现状 | 目标 |\n|---|---|---|\n' +
'| 长名单筛选耗时 | 约 2 天 | ≤ 2 小时 |\n' +
'| 比价耗时 | 3–5 天 | ≤ 1 天 |\n' +
'| 异常替换方案给出时间 | 约 3 周 | ≤ 2 周 |\n' +
'| 评分可追溯率 | 无 | 100% 有依据 |\n\n' +
'## 4. 数据与材料\n\n' +
'1. 历史合同：近 2 年的框架协议与价格清单（可提供扫描件与汇总表）\n' +
'2. 准入标准 v3.2 与合格供应商清单\n' +
'3. ERP 报价与收货记录（可导出样例）\n' +
'4. 流程现状说明与异常记录\n\n' +
'## 5. 待办与风险\n\n' +
'| 事项 | 负责人 | 截止 |\n|---|---|---|\n' +
'| 补充 12 个月 IQC 不良率数据 | 质量部 | 09-30 |\n' +
'| 导出 ERP 近 8 个季度报价与收货记录 | 电子物料采购经理 | 09-27 |\n' +
'| 确认评分权重是否按"质量>交期>价格"调整 | 采购总监 | 10-08 |\n' +
'| 光学类例外规则怎么表达 | 采购总监 · 质量部 | 待定 |\n\n' +
'**风险：** 现行准入标准的价格权重（25）高于访谈中的优先级，若直接复用会和总监的期望不一致。',
  });

  sheet({
    folder: 'Process & notes',
    name: 'Supplier incident log 2026.xlsx',
    size: '38 KB', pages: '1 个工作表', updated: '2026-09-05', author: '采购中心 · 质量部',
    note: '2026 年 8 起异常（质量 4 · 交期 3 · 产能 1），3 起触发替换',
    sheets: [
      {
        name: 'Incidents',
        cols: ['Date', 'Supplier', 'Part', 'Type', 'Description', 'Impact', 'Action', 'Replacement', 'Days to resolve'],
        rows: [
          ['2026-01-14', 'Ruifeng Fasteners', 'M1.4 screws', 'Quality', 'Thread defects 1.8% at IQC', 'Line stop 6 h', '8D · 100% sorting', 'No', '9'],
          ['2026-02-26', 'Kaisheng Optoelectronics', 'Camera module', 'Delay', 'Wafer shortage · +3 wks', 'Launch slip 2 wks', 'Expedite · air freight', 'Partial', '21'],
          ['2026-03-19', 'Tianyi Plastic Molding', 'Housing upper', 'Quality', 'Warpage out of spec', 'Rework 4,200 pcs', 'Mold adjustment', 'No', '12'],
          ['2026-04-08', 'Mingda Rubber & Seals', 'Silicone seal', 'Capacity', 'Peak demand above 80k / month', 'Shortfall 35k pcs', 'Second source qualified', 'Yes', '30'],
          ['2026-05-22', 'Zhongke Sensing', 'IMU ZK-IMU6', 'Delay', 'Customs hold', 'Delay 9 days', 'Re-routed shipment', 'No', '9'],
          ['2026-06-30', 'Lianbo Connectors', 'B2B connector 40-pin', 'Quality', 'Plating thickness drift', 'Batch returned', '8D · process audit', 'No', '14'],
          ['2026-07-17', 'Rongxin Circuit', 'PCB 6-layer HDI', 'Delay', 'Fab fire · shutdown', 'Shortfall 60%', 'Dual-sourced to alt. fab', 'Yes', '26'],
          ['2026-09-03', 'Haoyu Die-casting', 'Mg die-cast arm', 'Quality', 'Porosity above spec', 'Scrap 2.1%', 'Process change · re-FAI', 'Yes', '19'],
        ],
      },
    ],
  });

  /* ─────────────────────────── ERP exports ─────────────────────────── */

  sheet({
    folder: 'ERP exports',
    name: 'ERP quotation export 2026-Q3.xlsx',
    size: '96 KB', pages: '2 个工作表', updated: '2026-10-02', author: 'ERP · 采购模块',
    note: '14 条报价记录 · 含字段字典，可映射到供应商、料号、报价',
    sheets: [
      {
        name: 'Quotations',
        cols: ['Quote ID', 'Date', 'Supplier ID', 'Supplier', 'Part no.', 'Description', 'Qty tier', 'Unit price', 'Currency', 'Incoterm', 'Lead time (days)', 'Valid until', 'Buyer'],
        rows: [
          ['Q-26Q3-0412', '2026-07-03', 'S-001', 'Hexin Microelectronics', 'HX32F407', 'MCU LQFP100', '10k', '12.60', 'CNY', 'EXW', '21', '2026-09-30', 'L. Chen'],
          ['Q-26Q3-0413', '2026-07-03', 'S-001', 'Hexin Microelectronics', 'HX-PM2201', 'Power IC QFN24', '10k', '3.12', 'CNY', 'EXW', '21', '2026-09-30', 'L. Chen'],
          ['Q-26Q3-0420', '2026-07-08', 'S-002', 'Zhongke Sensing', 'ZK-IMU6', 'IMU LGA14', '5k', '9.75', 'CNY', 'FCA', '28', '2026-10-15', 'L. Chen'],
          ['Q-26Q3-0431', '2026-07-12', 'S-003', 'Yuanda Capacitors', 'MLCC-0402-10U', 'MLCC 10uF X5R', '500k', '0.020', 'CNY', 'EXW', '14', '2026-12-31', 'W. Zhao'],
          ['Q-26Q3-0447', '2026-07-19', 'S-004', 'Rongxin Circuit', 'PCB-6L-HDI-A', 'PCB 6L HDI 98×64', '2k', '6.95', 'CNY', 'DAP', '21', '2026-09-30', 'W. Zhao'],
          ['Q-26Q3-0448', '2026-07-19', 'S-013', 'Xinyue Circuit (new)', 'PCB-6L-HDI-A', 'PCB 6L HDI 98×64', '2k', '6.55', 'CNY', 'DAP', '28', '2026-09-30', 'W. Zhao'],
          ['Q-26Q3-0463', '2026-07-24', 'S-006', 'Kaisheng Optoelectronics', 'CAM-48MP-V3', 'Camera module 48MP', '5k', '41.80', 'USD', 'FOB', '42', '2026-10-31', 'L. Chen'],
          ['Q-26Q3-0479', '2026-08-02', 'S-007', 'Jinli Precision Parts', 'JL-FR-A01', 'CNC frame A', '5k', '38.50', 'CNY', 'EXW', '28', '2026-12-31', 'J. Wu'],
          ['Q-26Q3-0480', '2026-08-02', 'S-007', 'Jinli Precision Parts', 'JL-FR-B02', 'CNC frame B', '5k', '31.20', 'CNY', 'EXW', '28', '2026-12-31', 'J. Wu'],
          ['Q-26Q3-0492', '2026-08-09', 'S-008', 'Haoyu Die-casting', 'HY-ARM-AZ91', 'Mg die-cast arm', '3k', '23.10', 'CNY', 'EXW', '28', '2026-11-30', 'J. Wu'],
          ['Q-26Q3-0505', '2026-08-15', 'S-014', 'Shengda Die-casting (new)', 'HY-ARM-AZ91', 'Mg die-cast arm', '3k', '21.90', 'CNY', 'EXW', '35', '2026-11-30', 'J. Wu'],
          ['Q-26Q3-0517', '2026-08-23', 'S-010', 'Hengtai Stamping', 'HT-BRK-08', 'Bracket 0.8 mm', '50k', '0.84', 'CNY', 'EXW', '14', '2027-01-31', 'J. Wu'],
          ['Q-26Q3-0526', '2026-09-01', 'S-012', 'Mingda Rubber & Seals', 'MD-SEAL-S12', 'Silicone seal', '20k', '1.35', 'CNY', 'EXW', '35', '2026-12-31', 'J. Wu'],
          ['Q-26Q3-0538', '2026-09-11', 'S-005', 'Lianbo Connectors', 'LB-B2B-40', 'B2B connector 40-pin', '100k', '0.45', 'CNY', 'EXW', '21', '2026-12-31', 'L. Chen'],
        ],
      },
      {
        name: 'Field dictionary',
        cols: ['ERP field', 'Meaning', 'Type', 'Example', 'Maps to'],
        rows: [
          ['QUOT_ID', 'Quotation number', 'string', 'Q-26Q3-0412', 'Quotation.id'],
          ['QUOT_DT', 'Quotation date', 'date', '2026-07-03', 'Quotation.date'],
          ['SUPP_ID', 'Supplier master ID', 'string', 'S-001', 'Supplier.id'],
          ['PART_NO', 'Material / part number', 'string', 'HX32F407', 'Part.no'],
          ['QTY_TIER', 'Price break quantity', 'string', '10k', 'Quotation.qtyTier'],
          ['UNIT_PRC', 'Unit price in quote currency', 'decimal', '12.60', 'Quotation.unitPrice'],
          ['CURR', 'Currency', 'string', 'CNY', 'Quotation.currency'],
          ['INCO', 'Incoterm', 'string', 'EXW', 'Quotation.incoterm'],
          ['LEAD_D', 'Quoted lead time in days', 'int', '21', 'Quotation.leadTimeDays'],
          ['VALID_TO', 'Quote valid until', 'date', '2026-09-30', 'Quotation.validUntil'],
          ['BUYER', 'Buyer who requested the quote', 'string', 'L. Chen', 'Quotation.buyer'],
        ],
      },
    ],
  });

  window.FastDocsData = D;
})();
