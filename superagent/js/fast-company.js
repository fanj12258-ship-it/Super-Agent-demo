/**
 * Fast POC page ONLY — the "Side" route: explore the enterprise first (content is simulated, not live web data).
 *
 *   Space → "我想先了解一下我的企业"      → Agent asks which company
 *   Space → "大疆创新（DJI）…"            → 企业档案 (8 docs), switches to Files
 *   Space → "业务现在是怎么跑的…"        → 业务全景 (3 boards), switches to Files
 *   Space → "哪些环节最适合用 Agent？"    → Agent proposes 3 scenarios as checkboxes
 *   「创建所选场景」                       → 2–3 scene cards in Scenarios (WorkshopCreateScene.fromChatMulti)
 *                                            → user enters the same T1 as the Main route and continues there.
 *
 *   FastCompany.active() / prompt() / take() / stop()  — same contract as FastIntake (js/fast-intake.js)
 */
(function () {
  'use strict';
  var idx = 0, off = false, started = false;
  var FOLDER = '企业档案';
  var BIZ = '业务全景';
  var TAG = 'Base';
  /* light marks — same pale chip as the rest of the chrome, different glyph */
  var MARK =
    '<span class="dossier-mark" aria-hidden="true">' +
    '<svg viewBox="0 0 16 16" fill="none">' +
    '<rect x=".6" y=".6" width="14.8" height="14.8" rx="4" fill="#f4f8fd" stroke="#d7e4f2"/>' +
    '<path d="M4.1 11.5V7.3L8 5l3.9 2.3v4.2" stroke="#7aa2d4" stroke-width="1.15" stroke-linejoin="round"/>' +
    '<path d="M6.85 11.5V9h2.3v2.5" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '</svg></span>';
  var MARK_BIZ =
    '<span class="dossier-mark is-biz" aria-hidden="true">' +
    '<svg viewBox="0 0 16 16" fill="none">' +
    '<rect x=".6" y=".6" width="14.8" height="14.8" rx="4" fill="#f4f8fd" stroke="#d7e4f2"/>' +
    '<circle cx="4.7" cy="8" r="1.15" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '<circle cx="11.2" cy="5.15" r="1.15" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '<circle cx="11.2" cy="10.85" r="1.15" stroke="#7aa2d4" stroke-width="1.1"/>' +
    '<path d="M5.85 7.55 10 5.5M5.85 8.45 10 10.5" stroke="#b7cce6" stroke-width="1.05" stroke-linecap="round"/>' +
    '</svg></span>';

  function div(cls) { var n = document.createElement('div'); if (cls) n.className = cls; return n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ───────── eight dossier dimensions (simulated, public-information style) ───────── */
  var NOTE = '> 说明：演示用模拟整理。成立时间、主体、产品线按公开信息填写。大疆未披露完整财报，营收、占比、人员结构、产能分布，以及组织与系统判断，已标「演示口径」或「推断」，需要你确认。\n\n';
  var DOCS = [
    { name: '企业基本信息.md', note: '主体、成立时间、资本构成与上市状态', md:
'# 企业基本信息\n\n' + NOTE +
'| 字段 | 内容 | 口径 |\n|---|---|---|\n' +
'| 企业全称 | 深圳市大疆创新科技有限公司 | 公开 |\n' +
'| 品牌 | DJI | 公开 |\n' +
'| 成立时间 | 2006 年 | 公开 |\n' +
'| 总部 | 中国深圳 | 公开 |\n' +
'| 上市状态 | 未上市 | 公开 |\n' +
'| 股票代码 | — | 非上市公司，无公开交易代码 |\n' +
'| 资本构成 | 股权集中在创始团队。创始人汪滔为主要控股股东；早期机构投资方包括红杉中国等。具体股比未披露。 | 公开报道 |\n' +
'| 定位 | 全球消费级无人机与影像系统公司，产品延伸到行业应用与农业 | 公开 |\n' +
'| 发展阶段 | 成熟期。多产品线并行，研发、制造、销售与售后已经全球化 | 推断 |\n\n' +
'## 产品线\n\n' +
'| 板块 | 代表产品 | 主要客户 |\n|---|---|---|\n' +
'| 消费级航拍 | Mini · Air · Mavic | 个人创作者、旅行与运动用户 |\n' +
'| 手持影像 | Osmo · Pocket | 内容创作者 |\n' +
'| 专业影像 | Ronin · Inspire · Zenmuse | 影视制作团队 |\n' +
'| 行业应用 | Matrice · Dock | 电力、安防、测绘、应急 |\n' +
'| 农业 | Agras | 植保服务商、农场 |\n' +
'| 其他 | RoboMaster、便携储能 | 教育机构、户外用户 |\n\n' +
'外部看得到产品和品牌，看不到完整的股权和财务明细。后面的营收、人数和产能都按这个边界来写。\n\n' +
'## 发展节点\n\n' +
'| 时间 | 事件 | 对今天的影响 |\n|---|---|---|\n' +
'| 2006 | 深圳成立，从飞控起步 | 核心能力留在自研，而不是贴牌 |\n' +
'| 2013 前后 | 消费级航拍放量，Phantom 成为品类代名词 | 品牌和渠道按 To C 的节奏建起来 |\n' +
'| 2016–2018 | 手持影像、行业机、农业机并行 | 一条供应链要同时服务多条产品线 |\n' +
'| 2019 之后 | 部分海外市场准入收紧，行业机更受影响 | 合规从法务问题变成交付问题 |\n' +
'| 近两年 | Dock、农业、手持继续加密新品 | 计划、寻源、售后的并行度继续升高 |\n\n' +
'## 全球布局（公开 + 推断）\n\n' +
'| 职能 | 主要落点 | 说明 |\n|---|---|---|\n' +
'| 研发与制造 | 深圳及珠三角 | 飞控、云台、图传、整机 |\n' +
'| 销售 | 中国、北美、欧洲、日本、东南亚 | 消费级走零售，行业和农业走经销与集成 |\n' +
'| 售后 | 官方服务点 + 授权维修 | 工单和备件要跨区域调 |\n\n' +
'## 关键人物（公开）\n\n' +
'| 人物 | 角色 | 和这份档案的关系 |\n|---|---|---|\n' +
'| 汪滔 | 创始人，主要控股股东 | 产品与技术路线的最终拍板人（推断） |\n' +
'| 供应链负责人 | 未公开到个人 | 后面「供应商寻源」场景的 Sponsor，职位为推断 |\n\n' +
'## 阅读这份档案时先记住\n\n' +
'1. 未上市，所以没有苹果那种逐项披露的财报。数字凡是写了金额和占比，都是演示口径。\n' +
'2. 产品线宽，但制造仍然集中在珠三角。复杂度不在「有没有工厂」，在多条线共用一套计划和供应商池。\n' +
'3. 消费级贡献基本盘，行业和农业贡献增长，也贡献更长的交付和合规周期。\n' },
    { name: '组织规模.md', note: '人员规模，以及研发、供应链、销售的大致分布', md:
'# 组织规模\n\n' + NOTE +
'| 字段 | 内容 | 口径 |\n|---|---|---|\n' +
'| 员工数量 | 约 14,000 人 | 演示口径。公开报道多为「逾万人」，这里取常用量级 |\n' +
'| 人员特点 | 研发占比高；供应链与制造、销售与服务次之 | 推断 |\n' +
'| 地域 | 研发和制造集中在深圳及珠三角；销售与服务覆盖全球主要市场 | 公开 + 推断 |\n\n' +
'## 职能分布（推断）\n\n' +
'| 职能 | 大致占比 | 主要工作 |\n|---|---|---|\n' +
'| 研发 | ~40% | 飞控、影像、结构、软件、算法，按产品线分组 |\n' +
'| 供应链与制造 | ~25% | 采购、品质、生产计划、制造与物流 |\n' +
'| 销售与服务 | ~25% | 渠道、零售、行业销售、客户服务与维修 |\n' +
'| 职能 | ~10% | 财务、法务合规、人力、IT |\n\n' +
'研发项目并行多，供应链要跟着多条产品线走。人数本身不是瓶颈，**跨产品线对齐计划和供应商**才是。\n\n' +
'## 区域分布（推断）\n\n' +
'| 区域 | 大致人数 | 主要在做什么 |\n|---|---|---|\n' +
'| 深圳总部及周边 | ~9,000 | 研发、中试、整机制造、职能 |\n' +
'| 其他国内 | ~2,500 | 结构件、部分模组、销售与服务 |\n' +
'| 海外 | ~2,500 | 区域销售、市场、授权服务管理 |\n\n' +
'## 关键岗位密度\n\n' +
'| 岗位带 | 为什么人多 | 和 Agent 的关系 |\n|---|---|---|\n' +
'| 飞控 / 影像 / 结构研发 | 产品迭代的主体 | 项目风险要靠周报和里程碑，发现偏晚 |\n' +
'| 采购与供应商质量 | 型号多，合格供方池大 | 寻源和准入的资料最完整，适合先做 |\n' +
'| 客服与维修工程师 | 全球保有量大 | 工单分派和诊断解读仍然靠人 |\n' +
'| 计划与物流 | 新品爬坡和全球补货叠在一起 | 缺料和积压会同时出现 |\n\n' +
'## 管理跨度\n\n' +
'研发按产品线分组，供应链按物料和工厂分组，销售按区域和渠道分组。三套切法对不齐的时候，一个新品的「能不能按期交付」要在三个系统里各问一遍。人数规模大约 1.4 万，真正难管的是这三套切法之间的交接，不是人头本身。\n' },
    { name: '业务组合与收入结构.md', note: '年营收的演示口径，以及五条产品线的收入占比', md:
'# 业务组合与收入结构\n\n' + NOTE +
'## 年营收\n\n' +
'**约 280 亿元**（FY2024，演示口径）。不是公司披露的财报，是按公开报道的量级做的结构化估算，用来看结构，不用于对外引用。\n\n' +
'## 收入结构\n\n' +
'| 产品线 | 收入（亿元） | 占比 | 代表 |\n|---|---|---|---|\n' +
'| 消费级航拍 | 126 | 45% | Mini · Air · Mavic |\n' +
'| 手持影像 | 56 | 20% | Osmo · Pocket |\n' +
'| 行业应用 | 50 | 18% | Matrice · Dock |\n' +
'| 农业 | 34 | 12% | Agras |\n' +
'| 服务与其他 | 14 | 5% | 随心换、教育、储能 |\n' +
'| **合计** | **280** | **100%** | |\n\n' +
'## 收入怎么来\n\n' +
'| 来源 | 说明 | 特点 |\n|---|---|---|\n' +
'| 硬件销售 | 无人机、手持影像、云台整机 | 主要收入，跟新品周期走 |\n' +
'| 配件与耗材 | 电池、桨叶、滤镜、存储 | 跟着保有量走，毛利更好 |\n' +
'| 服务与保障 | 随心换、维修、延保 | 提高复购 |\n' +
'| 行业解决方案 | 无人机 + 软件平台 + 部署 | 客单价高、周期长（推断） |\n\n' +
'## 渠道\n\n' +
'- 官方线上商城：新品首发和主要自营渠道。\n' +
'- 线下体验店与授权零售：重点城市的体验和服务。\n' +
'- 经销商与行业集成商：行业和农业客户。\n' +
'- 第三方电商：补充覆盖。\n\n' +
'消费级仍是基本盘。行业和农业的占比在抬升，但交付方式已经从「卖一台飞机」变成「卖一套能落地的方案」。\n\n' +
'## 区域结构（演示口径）\n\n' +
'| 区域 | 占比 | 特点 |\n|---|---|---|\n' +
'| 中国 | ~32% | 消费级零售 + 农业 + 行业，政策变化直接影响空域和采购 |\n' +
'| 北美 | ~28% | 消费级仍在，行业机准入更敏感 |\n' +
'| 欧洲 | ~22% | 合规成本高，公共安全有区域对手 |\n' +
'| 其他 | ~18% | 日本、东南亚、中东，经销占比更高 |\n\n' +
'## 毛利与节奏（推断）\n\n' +
'| 观察 | 含义 |\n|---|---|\n' +
'| 整机毛利受新品和传感器成本拉动 | 传感器一旦锁规格，降本空间很小 |\n' +
'| 配件和随心换毛利更好，但体量跟保有量走 | 卖出一台，后面两三年还有服务收入 |\n' +
'| 消费级收入集中在发布后 1–2 个季度 | 爬坡晚一个月，当季补不回来 |\n' +
'| 行业和农业单笔更大、周期更长 | 收入确认慢，对计划和现金流的压力不同 |\n\n' +
'## 和后面场景的关系\n\n' +
'收入结构说明为什么不能只做一个「卖货 Agent」。消费级看的是新品窗口和库存，行业和农业看的是方案与合规。供应商寻源同时喂这几条线，所以它是最先值得做的公共环节。\n' },
    { name: '数字化成熟度.md', note: '五个领域的成熟度，以及适合先用 Agent 的三个环节', md:
'# 数字化成熟度\n\n' + NOTE +
'## 分域判断\n\n' +
'| 领域 | 成熟度 | 判断 | 依据 |\n|---|---|---|---|\n' +
'| 研发协同 | 高 | 工具链完整，项目计划在系统里 | 研发岗位与技术栈的公开描述 |\n' +
'| 产品与市场 | 中高 | 内容和渠道已经数字化，需求汇总仍靠人 | 推断 |\n' +
'| 供应链 | 中 | ERP 是主干；寻源、报价、准入资料散在多处 | 采购与品质岗位职责 |\n' +
'| 售后 | 中 | 有工单和知识库，分派仍靠经验 | 服务网络规模 |\n' +
'| 经营分析 | 中 | 有报表，跨产品线口径要对齐时仍靠人工 | 推断 |\n\n' +
'系统是有的。缺口在「资料散、判断靠人」的环节，不在有没有上一套大系统。\n\n' +
'## 适合 Agent 的环节\n\n' +
'| 环节 | 现状痛点 | 数据基础 | 落地难度 | 优先级 |\n|---|---|---|---|---|\n' +
'| 供应商寻源与准入 | 新品导入时筛选和比价耗时，依据分散 | 好：ERP 报价、准入标准、合同 | 低 | **高** |\n' +
'| 研发项目风险预警 | 里程碑延期往往发现得晚 | 中：项目计划与周报 | 中 | 中 |\n' +
'| 售后工单智能分派 | 工单类型杂，分派靠经验 | 中：历史工单、知识库 | 中 | 中 |\n\n' +
'## 建议\n\n' +
'先做 **供应商寻源与准入**。数据最完整，使用者明确，一个月内能看出效果。跑通之后，同一套方法可以复制到另外两个环节。\n\n' +
'## 已经在用的系统（推断）\n\n' +
'| 系统 | 覆盖 | 谁在用 | 缺口 |\n|---|---|---|---|\n' +
'| ERP | 采购、库存、财务 | 计划、采购、财务 | 寻源过程的邮件和比价表不在里面 |\n' +
'| 研发项目管理 | 里程碑、需求、缺陷 | 各产品线研发 | 风险要等人写周报才看得见 |\n' +
'| GSX / 服务系统 | 保修、工单、报价 | 客服、服务顾问、维修 | 和门店库存、知识库不是同一套 |\n' +
'| 知识库 / Radar | 已知问题 | 一线技术支持 | 靠关键词，命中率不稳定 |\n' +
'| AST 2 | 到店诊断 | 维修工程师 | 报告要人读，结论还要再录一遍 |\n\n' +
'## 数据断点\n\n' +
'| 断点 | 现在怎么接 | 后果 |\n|---|---|---|\n' +
'| 供应商资料 | ERP 里有编码，资质和报价在邮件与共享盘 | 准入周期被「找文件」吃掉 |\n' +
'| 诊断结论 | AST 2 出报告，GSX 和门店工单再录一次 | 同一台机器两套说法 |\n' +
'| 备件库存 | 门店一套，区域仓一套 | 缺件要人工对两次 |\n' +
'| 新品需求 | 产品、销售、计划各有一版 | 爬坡时缺料和积压一起出现 |\n\n' +
'成熟度不是「有没有上系统」。主干系统都在，断点集中在人要跨系统抄一遍的地方。Agent 适合先补这些断点，而不是再上一个大平台。\n' },
    { name: '战略痛点.md', note: '当前最值得先处理的三处压力', md:
'# 战略痛点\n\n' + NOTE +
'## 供应商准入慢\n\n' +
'新品导入时，筛选、比价、资质审核的依据散在 ERP、邮件和共享盘里。周期长，标准也不容易对齐。\n\n' +
'影响：寻源团队的时间花在找资料，而不是做判断。\n\n' +
'## 产能与交付爬坡不稳\n\n' +
'型号多、迭代快。新品放量时良率和交期容易波动，计划和采购要反复改。缺料和积压会同时出现。\n\n' +
'影响：消费级的窗口期很短，爬坡一旦慢，当季销售补不回来。\n\n' +
'## 多地合规成本高\n\n' +
'不同国家和地区对无人机的飞行、数据和出口要求不一样。认证和供应链合规要逐单核对，同一套产品进入新市场的准备周期被拉长。\n\n' +
'影响：行业机和农业机的成交，往往卡在准入材料，而不是卡在产品本身。\n\n' +
'## 三处压力怎么比\n\n' +
'| 痛点 | 谁在扛 | 现在的证据 | 先做 Agent 能看到什么 |\n|---|---|---|---|\n' +
'| 供应商准入慢 | 寻源与供应商质量 | 新品导入时比价和资质散落 | 一份可核对的对比，周期从「找资料」里省出来 |\n' +
'| 爬坡不稳 | 计划、采购、制造 | 消费级窗口只有一两个季度 | 缺料风险比周会更早冒出来 |\n' +
'| 多地合规 | 法务、认证、行业销售 | 同一型号，市场之间材料不一样 | 进新市场时缺哪份证明，一眼能列出来 |\n\n' +
'## 先不做的\n\n' +
'品牌营销、内容社区、零售陈列，痛感没有这三处集中，数据也更散。档案里先把力气放在「资料已经有，但人要来回翻」的环节。\n\n' +
'## 如果三个月不动\n\n' +
'准入继续靠老师傅，新品越多，合格供方越不可复用。爬坡仍然在放量当周才暴露缺料。合规材料每进一个市场重做一遍。这三件事会一起拖住下一轮产品，而不是单独拖住某一个部门。\n' },
    { name: '决策链角色.md', note: '谁发起、谁拍板、谁每天在用', md:
'# 决策链角色\n\n' + NOTE +
'下面这条链对应最可能先做的事：**供应商寻源与准入**。行业应用和农业的购买决策在销售与解决方案，不在这条链上。职位为推断，不是组织架构图。\n\n' +
'| 角色 | 职位 | 关心什么 |\n|---|---|---|\n' +
'| Sponsor | 供应链负责人 | 准入周期、供应风险、成本 |\n' +
'| 决策者 | 采购与供应商质量负责人 | 这家该不该引入，标准是否满足 |\n' +
'| 使用者 | 寻源与准入团队 | 每天筛供应商、收资料、写对比 |\n\n' +
'Agent 如果做在这一环，Sponsor 要看的是周期和风险有没有下降，使用者要看的是少找资料、对比能不能直接用。两件事都要对上，场景才立得住。\n\n' +
'## 售后：故障诊断\n\n' +
'这条链对应业务全景里的「故障诊断」。客服先收症状，技术支持决定要不要到店，维修工程师出结论，服务顾问判定保修。\n\n' +
'| 角色 | 职位 | 关心什么 |\n|---|---|---|\n' +
'| Sponsor | 服务负责人 | 远程闭环率、一次修复率、客诉 |\n' +
'| 决策者 | 区域服务经理 | 到店检测是否超时，方案是否一次做对 |\n' +
'| 使用者 | 客服专员、一线技术支持、维修工程师、服务顾问 | 少在 GSX、知识库、AST 2 之间抄同一段话 |\n\n' +
'## 售后：备件补给\n\n' +
'| 角色 | 职位 | 关心什么 |\n|---|---|---|\n' +
'| Sponsor | 服务供应链负责人 | 紧急件能不能当天出去 |\n' +
'| 决策者 | 区域备件计划 | 调拨还是请购，库存压在哪一层 |\n' +
'| 使用者 | 备件专员、门店仓 | 缺件清单和真实库存对得上 |\n\n' +
'## 三条链不要混成一个 Sponsor\n\n' +
'寻源的 Sponsor 在供应链，诊断的 Sponsor 在服务，备件夹在两边。一个 Agent 如果同时向三个人汇报，场景会做散。建议先锁寻源这一条，服务侧的两条等业务全景里的流程板被确认之后再开。\n' },
    { name: '行业环境.md', note: '主要竞品，以及中、美、欧三边的监管', md:
'# 行业环境\n\n' + NOTE +
'## 竞品\n\n' +
'| 对手 | 重叠在哪 | 差异 |\n|---|---|---|\n' +
'| 道通智能 Autel | 消费级与行业无人机 | 价格和渠道更激进 |\n' +
'| Skydio | 北美行业与公共安全 | 自主飞行强，区域市场 |\n' +
'| 极飞 XAG | 农业植保 | 农业场景更深，和 Agras 直接竞争 |\n' +
'| Parrot | 欧洲公共安全 | 体量较小，区域合规更熟 |\n\n' +
'消费级仍是品牌基本盘。增量竞争发生在行业和农业：对手更窄，但客户决策更慢，合规材料更重。\n\n' +
'## 监管环境\n\n' +
'- **中国**：实名登记、空域和运行管理持续收紧，产品功能和销售话术都要跟着改。\n' +
'- **美国**：出口管制和市场准入限制有公开的历史事件，行业机进入受影响大于消费级配件。\n' +
'- **欧盟**：无人机按开放类 / 特许类运营，产品合规和操作员要求抬高了进入成本。\n\n' +
'监管不是背景板。它直接决定一条产品线能不能卖、供应链要准备哪些证明。\n\n' +
'## 竞品再看一层\n\n' +
'| 对手 | 客群 | 价格与渠道 | 对我们的实际压力 |\n|---|---|---|---|\n' +
'| Autel | 要性价比的消费级，以及部分行业客户 | 价格更低，线上折扣更猛 | 消费级基本盘的价格锚 |\n' +
'| Skydio | 北美公共安全、巡检 | 项目制，自主飞行是卖点 | 行业机在北美的方案对比，不是消费级货架 |\n' +
'| 极飞 | 农场、植保队 | 农业经销深 | Agras 的直接对手，比的是亩效和服务 |\n' +
'| Parrot | 欧洲公共部门 | 体量小，本地合规熟 | 欧盟项目标案里会出现，很少出现在消费级柜台 |\n\n' +
'## 监管时间线（公开事件，演示整理）\n\n' +
'| 时间 | 地区 | 发生了什么 | 经营上的后果 |\n|---|---|---|---|\n' +
'| 持续 | 中国 | 实名登记、空域和运行规则收紧 | 产品功能说明和销售话术要跟着改 |\n' +
'| 近年 | 美国 | 出口管制与市场准入有公开限制 | 行业机比配件更难进 |\n' +
'| 持续 | 欧盟 | 开放类 / 特许类，对产品和操作员都有要求 | 进欧洲的认证周期变成销售周期的一部分 |\n\n' +
'## 对场景的含义\n\n' +
'消费级的竞争在货架和价格，行业与农业的竞争在「能不能合规地交付一套方案」。所以供应商准入不只是降本，也是在给新市场准备可追溯的物料和证明。\n' },
    { name: '供应链布局.md', note: '组装产能分布在哪，关键供应环节怎么分工', md:
'# 供应链布局\n\n' + NOTE +
'## 组装与制造产能\n\n' +
'演示口径，推断。大疆制造以自有工厂为主，不像消费电子那样高度外发给少数代工。\n\n' +
'| 区域 | 占比 | 主要内容 |\n|---|---|---|\n' +
'| 深圳及珠三角 | ~78% | 整机、飞控、云台、图传 |\n' +
'| 其他国内基地 | ~16% | 结构件、部分模组 |\n' +
'| 海外 | ~6% | 服务备件，以及少量本地化支持 |\n\n' +
'产能地理上仍然集中。好处是爬坡和品质好管，风险是单一区域的交付波动会传导到全球销售。\n\n' +
'## 关键供应环节\n\n' +
'| 环节 | 方式 | 关注点 |\n|---|---|---|\n' +
'| 影像传感器 | 外购 | 规格一旦锁定，交期和替代都难 |\n' +
'| 飞控 / 图传 / 云台 | 自研为主 | 核心能力留在内部 |\n' +
'| 电芯 | 外购电芯，自行封装 | 安全与成本 |\n' +
'| 电机与结构件 | 多家合格供应商 | 准入标准是否一致 |\n' +
'| 整机组装 | 自有制造为主 | 爬坡、良率、计划 |\n\n' +
'电子料和结构件的供应商数量大，**准入和寻源的管理工作量集中在采购**。这是企业档案里建议先做 Agent 的那一环。\n\n' +
'## 交期与风险（推断）\n\n' +
'| 环节 | 典型交期 | 替代难度 | 一旦断供 |\n|---|---|---|---|\n' +
'| 影像传感器 | 按季度锁货 | 高，规格一锁就难换 | 整机定义要改，或者当季缺货 |\n' +
'| 电芯 | 数周到一个季度 | 中，封装可以自己做，电芯品牌不能随便换 | 安全和认证要重走 |\n' +
'| 电机与结构件 | 数周 | 低到中，但合格供方要重新准入 | 爬坡期最容易在这里卡住 |\n' +
'| 飞控 / 图传 / 云台 | 内部排期 | 不外购核心，风险在研发产能 | 新品节点后移 |\n' +
'| 整机 | 自有工厂周计划 | 产能集中在珠三角 | 区域波动会传到全球销售 |\n\n' +
'## 三层库存\n\n' +
'| 层级 | 放什么 | 谁看得见 |\n|---|---|---|\n' +
'| 工厂与中心仓 | 原材料、半成品、整机 | 计划、ERP |\n' +
'| 区域仓 | 成品与常用备件 | 区域计划，门店往往看不到实时数 |\n' +
'| 门店 / 服务点 | 展陈机、周转备件 | 门店系统，和 GSX 不同步 |\n\n' +
'## 和业务全景的衔接\n\n' +
'这条供应链喂两条价值流：新品从「量产导入」出去，售后从「备件补给」回来。工厂侧的准入问题，和门店侧的库存对不上，是同一家公司的两头。企业档案解释是谁、赚什么钱；业务全景解释这两头具体怎么交接。\n' },
  ];

  /* ───────── 业务全景：三张可编辑流程板。备件补给的步骤按同一结构补全（截图只露出标题） ───────── */
  var FLOWS = [
    { name: '价值流 · 价值段拆解', note: '三条价值流：产品开发、订单到交付、问题到解决，痛点标在交接上', board: {
      title: '价值流 · 价值段拆解',
      sections: [
        { mode: 'stream', title: '产品开发（创意到上市）', nodes: [
          { title: '概念定义', note: '产品、市场、供应链一起定边界' },
          { title: '设计研发', note: '飞控、结构、影像并行' },
          { title: '验证测试', note: '实验室、外场、认证', pain: { tag: '痛点｜高耗时 · 低', text: '测试缺陷跨团队流转慢' } },
          { title: '量产导入', note: '工艺、良率、首批齐套' },
        ] },
        { mode: 'stream', title: '订单到交付（预测到到店）', nodes: [
          { title: '需求预测', note: '零售、经销、行业项目各一版' },
          { title: '计划排产', note: '多条产品线抢同一工厂' },
          { title: '齐套', note: '传感器和结构件最常缺', pain: { tag: '痛点｜高耗时 · 中', text: '缺料往往到排产周才暴露' } },
          { title: '组装出货', note: '珠三角工厂为主' },
          { title: '到店 / 到项目', note: '消费级走零售，行业走集成' },
        ] },
        { mode: 'stream', title: '问题到解决（受理到回访）', nodes: [
          { title: '受理', note: '客服收症状、核序列号' },
          { title: '诊断', note: '远程能关 60%，其余到店', pain: { tag: '痛点｜系统孤岛 · 高', text: '知识库、AST 2、GSX 各记一遍' } },
          { title: '方案', note: '保修判定和报价' },
          { title: '备件', note: '门店、区域仓、总部三层库存', pain: { tag: '痛点｜系统孤岛 · 高', text: '库存要对两次才知道有没有货' } },
          { title: '修复回访', note: '一次修复率和客诉' },
        ] },
      ],
    } },
    { name: '故障诊断', note: '售后「问题到解决」的下钻：远程初诊、到店检测、方案确定', board: {
      mode: 'lanes',
      title: '下钻拆解 · 售后服务（问题到解决） › 故障诊断',
      lanes: [
        { title: '业务流程：远程初诊', kpi: '60% 问题远程闭环', steps: [
          { title: '收集症状描述', pain: '高耗时 · 中：症状描述口语化，难以结构化', fields: [
            { k: '角色', v: '客服专员' }, { k: '输入', v: '客户口述、设备序列号、购买渠道' }, { k: '输出', v: '结构化症状记录' },
            { k: '系统', v: 'GSX、呼叫中心系统' }, { k: '规则', v: '必须核验设备序列号，对不上不进下一步' },
            { k: '耗时', v: '平均 8–12 分钟，描述含糊时会打回重问' },
          ] },
          { title: '匹配已知问题库', pain: '系统孤岛 · 高：问题库靠关键词检索，命中率低', fields: [
            { k: '角色', v: '一线技术支持' }, { k: '输入', v: '结构化症状记录' }, { k: '输出', v: '候选故障列表，含置信度' },
            { k: '系统', v: 'Radar、知识库' }, { k: '经验', v: '从症状组合判断高发故障，而不是单关键词' },
            { k: '耗时', v: '命中则 5 分钟，不中则转人工，经常超过 20 分钟' },
          ] },
          { title: '判断是否需到店', fields: [
            { k: '角色', v: '一线技术支持' }, { k: '输入', v: '候选故障列表、客户所在地、备件可用性' }, { k: '输出', v: '远程方案，或到店预约' },
            { k: '系统', v: 'GSX、门店预约' }, { k: '规则', v: '涉及拆机、校准、安全件的必须到店' },
            { k: '耗时', v: '判断本身很快，等门店档期会把客户留在线上' },
          ] },
        ] },
        { title: '业务流程：到店检测', kpi: '检测时长 ≤ 30 分钟', steps: [
          { title: '运行诊断工具', pain: '高经验 · 中：诊断结果需人工解读', fields: [
            { k: '角色', v: '维修工程师' }, { k: '输入', v: '设备、远程初诊记录' }, { k: '输出', v: '诊断报告' },
            { k: '系统', v: 'AST 2' }, { k: '经验', v: '报告里的代码要对照机型才知道是不是真故障' },
            { k: '耗时', v: '工具 10 分钟，解读经常再要 10 分钟' },
          ] },
          { title: '拆机检查', fields: [
            { k: '角色', v: '维修工程师' }, { k: '输入', v: '设备、诊断报告' }, { k: '输出', v: '检查记录、更换件预判' },
            { k: '系统', v: '维修工位记录' }, { k: '规则', v: '安全件和校准件按手册，不凭手感换' },
            { k: '耗时', v: '常规 15 分钟，云台和感光组件更长' },
          ] },
          { title: '记录检测结果', pain: '系统孤岛 · 中：结论需在两个系统重复录入', fields: [
            { k: '角色', v: '维修工程师' }, { k: '输入', v: '检查记录' }, { k: '输出', v: '检测结论，供保修判定使用' },
            { k: '系统', v: 'GSX、门店工单系统' }, { k: '规则', v: '两套系统的故障码要人工对齐' },
            { k: '耗时', v: '录入 5–8 分钟，对不齐时整单退回' },
          ] },
        ] },
        { title: '业务流程：维修方案确定', kpi: '方案一次通过率 ≥ 90%', steps: [
          { title: '判定保修范围', pain: '高频错误 · 高：保修条款复杂，判定错误率高', fields: [
            { k: '角色', v: '服务顾问' }, { k: '输入', v: '检测结论、保修记录、购买凭证' }, { k: '输出', v: '保修判定：在保 / 过保 / 人为' },
            { k: '系统', v: 'GSX' }, { k: '规则', v: '人为损坏、进水、非官方拆修不在保修范围' },
            { k: '经验', v: '边界情况靠区域老师傅，新人误判多' }, { k: '耗时', v: '标准件 3 分钟，边界件可能升级到区域' },
          ] },
          { title: '生成维修报价', fields: [
            { k: '角色', v: '服务顾问' }, { k: '输入', v: '保修判定、备件价格、工时' }, { k: '输出', v: '报价单' },
            { k: '系统', v: 'GSX' }, { k: '规则', v: '在保只收例外项，过保按官方价目' },
            { k: '耗时', v: '价目齐则即时，缺件价格要等备件专员回' },
          ] },
          { title: '客户确认', fields: [
            { k: '角色', v: '服务顾问' }, { k: '输入', v: '报价单、预计交期' }, { k: '输出', v: '确认的维修单，或客户放弃' },
            { k: '系统', v: 'GSX' }, { k: '规则', v: '未确认不动备件、不拆第二轮' },
            { k: '耗时', v: '在店当场确认；不在店则进入等待，工位被占着' },
          ] },
        ] },
      ],
    } },
    { name: '备件补给', note: '同一条售后链的下钻：缺件确认、调拨采购、到件闭环', board: {
      mode: 'lanes',
      title: '下钻拆解 · 售后服务（问题到解决） › 备件补给',
      lanes: [
        { title: '业务流程：缺件确认', kpi: '缺件 24h 内确认 ≥ 95%', steps: [
          { title: '识别维修缺件', fields: [
            { k: '角色', v: '服务顾问' }, { k: '输入', v: '确认的维修单、机型 BOM' }, { k: '输出', v: '缺件清单，含替代件' },
            { k: '系统', v: 'GSX' }, { k: '规则', v: '按维修方案带出 BOM，替代件要在合格清单里' },
            { k: '耗时', v: '标准机型即时，老机型 BOM 经常不全' },
          ] },
          { title: '核对可用库存', pain: '系统孤岛 · 高：门店库存和区域仓不在一个系统，要人工对两次', fields: [
            { k: '角色', v: '备件专员' }, { k: '输入', v: '缺件清单' }, { k: '输出', v: '库存结论：店内 / 区域 / 无货' },
            { k: '系统', v: '门店库存、区域仓' }, { k: '规则', v: '展陈和安全库存不能直接拿去修' },
            { k: '耗时', v: '两套系统各查一遍，忙时要 15 分钟' },
          ] },
          { title: '判定紧急程度', fields: [
            { k: '角色', v: '备件专员' }, { k: '输入', v: '库存结论、客户等待时长、是否安全相关' }, { k: '输出', v: '紧急或常规' },
            { k: '系统', v: 'GSX' }, { k: '规则', v: '安全相关和已拆机等待的优先' },
            { k: '耗时', v: '判定快，排队发运才是真等待' },
          ] },
        ] },
        { title: '业务流程：调拨与采购', kpi: '紧急件当日发出', steps: [
          { title: '店内预留', fields: [
            { k: '角色', v: '备件专员' }, { k: '输入', v: '紧急缺件' }, { k: '输出', v: '预留记录，锁定给这张维修单' },
            { k: '系统', v: '门店库存' }, { k: '规则', v: '预留 24 小时，超时释放' },
            { k: '耗时', v: '有货则分钟级' },
          ] },
          { title: '区域仓调拨', pain: '高耗时 · 中：调拨审批要跨店长和区域计划，常过夜', fields: [
            { k: '角色', v: '备件计划' }, { k: '输入', v: '预留失败的缺件、门店优先级' }, { k: '输出', v: '调拨单' },
            { k: '系统', v: '区域仓' }, { k: '规则', v: '不能把区域安全库存打空去填一个门店' },
            { k: '耗时', v: '审批经常过夜，运输再加 1–2 天' },
          ] },
          { title: '向总部请购', fields: [
            { k: '角色', v: '备件计划' }, { k: '输入', v: '区域无货的缺件、在途' }, { k: '输出', v: '请购单' },
            { k: '系统', v: 'ERP' }, { k: '规则', v: '停产机型走专用件池，不进常规请购' },
            { k: '耗时', v: '常规一周内，停产件不确定' },
          ] },
        ] },
        { title: '业务流程：到件与闭环', kpi: '到件后 4h 内通知客户', steps: [
          { title: '发运跟踪', fields: [
            { k: '角色', v: '物流' }, { k: '输入', v: '调拨单或请购单' }, { k: '输出', v: '在途状态，异常要回告计划' },
            { k: '系统', v: '物流' }, { k: '规则', v: '紧急件单独揽收，不进普通干线' },
            { k: '耗时', v: '同城当天，跨区 1–3 天' },
          ] },
          { title: '收货上架', pain: '系统孤岛 · 中：收货在门店系统，维修单在 GSX，状态要手改', fields: [
            { k: '角色', v: '门店仓' }, { k: '输入', v: '到货、运单' }, { k: '输出', v: '上架记录，并回写维修单' },
            { k: '系统', v: '门店库存、GSX' }, { k: '规则', v: '实物和单据不一致先隔离，不直接上架' },
            { k: '耗时', v: '收货 10 分钟，回写 GSX 经常被忘' },
          ] },
          { title: '通知开工', fields: [
            { k: '角色', v: '服务顾问' }, { k: '输入', v: '上架记录、客户联系方式' }, { k: '输出', v: '客户可维修通知，工位重新排期' },
            { k: '系统', v: 'GSX' }, { k: '规则', v: '通知后 48 小时客户未到，预留释放' },
            { k: '耗时', v: '通知本身很快，客户再上门才重新占工位' },
          ] },
        ] },
      ],
    } },
  ];

  /* English presentation copy for the three process boards. Keep the Chinese
     research model above as the source notes; the right-panel UI is English. */
  FLOWS = [
    { name: 'Value Stream Breakdown', note: 'Three end-to-end value streams with handoff friction highlighted', board: {
      title: 'Value Stream Breakdown',
      sections: [
        { mode: 'stream', title: 'Product Development / Concept to Launch', nodes: [
          { title: 'Concept Definition', note: 'Product, market and supply align the scope' },
          { title: 'Design & Engineering', note: 'Flight control, imaging and mechanics run in parallel' },
          { title: 'Validation', note: 'Lab, field and certification testing', pain: { tag: 'Slow handoff', text: 'Defects move between teams without a shared owner' } },
          { title: 'Production Ramp', note: 'Process readiness, yield and first-batch material coverage' },
        ] },
        { mode: 'stream', title: 'Order to Delivery / Forecast to Customer', nodes: [
          { title: 'Demand Forecast', note: 'Retail, channel and enterprise demand use different signals' },
          { title: 'Supply Planning', note: 'Product lines compete for shared capacity' },
          { title: 'Material Readiness', note: 'Sensors and precision parts carry the longest lead times', pain: { tag: 'Late visibility', text: 'Shortages surface only when the build plan is released' } },
          { title: 'Assembly & Ship', note: 'Final assembly remains concentrated in the Greater Bay Area' },
          { title: 'Customer Delivery', note: 'Retail fulfillment and project delivery follow different paths' },
        ] },
        { mode: 'stream', title: 'Issue to Resolution / Intake to Follow-up', nodes: [
          { title: 'Issue Intake', note: 'Capture symptoms and verify the serial number' },
          { title: 'Diagnosis', note: 'Remote resolution first, store inspection when required', pain: { tag: 'System gap', text: 'Knowledge, diagnostics and service records are entered separately' } },
          { title: 'Repair Decision', note: 'Warranty decision, scope and quotation' },
          { title: 'Parts Supply', note: 'Store, regional and central inventory', pain: { tag: 'System gap', text: 'Availability must be checked in multiple systems' } },
          { title: 'Repair & Follow-up', note: 'First-time fix, turnaround time and customer outcome' },
        ] },
      ],
    } },
    { name: 'Fault Diagnosis', note: 'Remote triage, in-store inspection and repair decision', board: {
      mode: 'lanes',
      title: 'After-sales Service / Fault Diagnosis',
      lanes: [
        { title: 'Remote Triage', kpi: 'Target: 60% resolved remotely', steps: [
          { title: 'Capture Symptoms', pain: 'Customer descriptions are conversational and difficult to structure consistently.', fields: [
            { k: 'Owner', v: 'Customer Support Specialist' },
            { k: 'Input', v: 'Customer description, serial number and purchase channel' },
            { k: 'Output', v: 'Structured symptom record' },
            { k: 'System', v: 'GSX and contact-center platform' },
            { k: 'Rule', v: 'Serial number must be verified before triage continues' },
            { k: 'Time', v: '8-12 minutes; unclear descriptions trigger another contact' },
          ] },
          { title: 'Match Known Issues', pain: 'Keyword search misses symptom combinations and sends too many cases to manual review.', fields: [
            { k: 'Owner', v: 'Frontline Technical Support' },
            { k: 'Input', v: 'Structured symptom record' },
            { k: 'Output', v: 'Ranked fault candidates with confidence' },
            { k: 'System', v: 'Radar and knowledge base' },
            { k: 'Rule', v: 'Match symptom combinations, not a single keyword' },
            { k: 'Time', v: '5 minutes when matched; 20+ minutes when escalated' },
          ] },
          { title: 'Route Remote or Store', fields: [
            { k: 'Owner', v: 'Frontline Technical Support' },
            { k: 'Input', v: 'Fault candidates, customer location and service capacity' },
            { k: 'Output', v: 'Remote resolution or store appointment' },
            { k: 'System', v: 'GSX and store scheduling' },
            { k: 'Rule', v: 'Disassembly, calibration and safety issues require a store visit' },
            { k: 'Time', v: 'Decision is quick; appointment availability creates the wait' },
          ] },
        ] },
        { title: 'In-store Inspection', kpi: 'Target: inspection within 30 min', steps: [
          { title: 'Run Diagnostics', pain: 'Diagnostic codes still require model-specific interpretation by an experienced engineer.', fields: [
            { k: 'Owner', v: 'Repair Engineer' },
            { k: 'Input', v: 'Device and remote-triage record' },
            { k: 'Output', v: 'Diagnostic report' },
            { k: 'System', v: 'AST 2' },
            { k: 'Rule', v: 'Interpret codes against the exact model and firmware' },
            { k: 'Time', v: '10 minutes to run; often another 10 to interpret' },
          ] },
          { title: 'Physical Inspection', fields: [
            { k: 'Owner', v: 'Repair Engineer' },
            { k: 'Input', v: 'Device and diagnostic report' },
            { k: 'Output', v: 'Inspection record and likely replacement parts' },
            { k: 'System', v: 'Repair-station record' },
            { k: 'Rule', v: 'Safety and calibration parts follow the service manual' },
            { k: 'Time', v: '15 minutes normally; longer for gimbal and imaging modules' },
          ] },
          { title: 'Record Findings', pain: 'The same conclusion is re-entered in the store order and GSX.', fields: [
            { k: 'Owner', v: 'Repair Engineer' },
            { k: 'Input', v: 'Inspection record' },
            { k: 'Output', v: 'Confirmed fault for warranty review' },
            { k: 'System', v: 'GSX and store work-order system' },
            { k: 'Rule', v: 'Fault codes must be aligned manually across systems' },
            { k: 'Time', v: '5-8 minutes; mismatches return the entire case' },
          ] },
        ] },
        { title: 'Repair Decision', kpi: 'Target: 90% first-pass approval', steps: [
          { title: 'Determine Warranty', pain: 'Complex exception rules make boundary cases error-prone.', fields: [
            { k: 'Owner', v: 'Service Advisor' },
            { k: 'Input', v: 'Findings, warranty history and proof of purchase' },
            { k: 'Output', v: 'In-warranty, out-of-warranty or accidental-damage decision' },
            { k: 'System', v: 'GSX' },
            { k: 'Rule', v: 'Liquid, accidental damage and unauthorized repair are excluded' },
            { k: 'Time', v: '3 minutes for standard cases; boundary cases escalate' },
          ] },
          { title: 'Generate Quote', fields: [
            { k: 'Owner', v: 'Service Advisor' },
            { k: 'Input', v: 'Warranty decision, parts price and labor' },
            { k: 'Output', v: 'Repair quotation' },
            { k: 'System', v: 'GSX' },
            { k: 'Rule', v: 'In-warranty cases charge only approved exceptions' },
            { k: 'Time', v: 'Immediate when prices are available; parts gaps create delay' },
          ] },
          { title: 'Customer Approval', fields: [
            { k: 'Owner', v: 'Service Advisor' },
            { k: 'Input', v: 'Quotation and expected completion date' },
            { k: 'Output', v: 'Approved repair order or declined service' },
            { k: 'System', v: 'GSX' },
            { k: 'Rule', v: 'No parts movement before approval' },
            { k: 'Time', v: 'Immediate in store; remote approval can hold the workbench' },
          ] },
        ] },
      ],
    } },
    { name: 'Parts Replenishment', note: 'Shortage confirmation, allocation and repair-ready closure', board: {
      mode: 'lanes',
      title: 'After-sales Service / Parts Replenishment',
      lanes: [
        { title: 'Shortage Confirmation', kpi: 'Target: confirm within 24 hours', steps: [
          { title: 'Identify Required Parts', fields: [
            { k: 'Owner', v: 'Service Advisor' },
            { k: 'Input', v: 'Approved repair order and model BOM' },
            { k: 'Output', v: 'Required parts with qualified substitutes' },
            { k: 'System', v: 'GSX' },
            { k: 'Rule', v: 'Substitutes must exist in the approved-parts list' },
            { k: 'Time', v: 'Immediate for current models; legacy BOMs often need review' },
          ] },
          { title: 'Check Available Stock', pain: 'Store and regional inventory sit in separate systems and must be checked twice.', fields: [
            { k: 'Owner', v: 'Parts Coordinator' },
            { k: 'Input', v: 'Required parts list' },
            { k: 'Output', v: 'Store, regional or unavailable status' },
            { k: 'System', v: 'Store inventory and regional warehouse' },
            { k: 'Rule', v: 'Display stock and safety stock cannot be consumed' },
            { k: 'Time', v: 'Up to 15 minutes during peak periods' },
          ] },
          { title: 'Set Priority', fields: [
            { k: 'Owner', v: 'Parts Coordinator' },
            { k: 'Input', v: 'Availability, customer wait and safety relevance' },
            { k: 'Output', v: 'Urgent or standard priority' },
            { k: 'System', v: 'GSX' },
            { k: 'Rule', v: 'Safety-related and disassembled devices take priority' },
            { k: 'Time', v: 'Decision is fast; the shipping queue creates delay' },
          ] },
        ] },
        { title: 'Allocation & Procurement', kpi: 'Target: urgent parts ship same day', steps: [
          { title: 'Reserve Store Stock', fields: [
            { k: 'Owner', v: 'Parts Coordinator' },
            { k: 'Input', v: 'Urgent parts request' },
            { k: 'Output', v: 'Reservation linked to the repair order' },
            { k: 'System', v: 'Store inventory' },
            { k: 'Rule', v: 'Reservation expires after 24 hours' },
            { k: 'Time', v: 'Minutes when stock is available' },
          ] },
          { title: 'Transfer from Region', pain: 'Approval crosses store and regional planning and often waits overnight.', fields: [
            { k: 'Owner', v: 'Regional Parts Planner' },
            { k: 'Input', v: 'Unfilled request and store priority' },
            { k: 'Output', v: 'Transfer order' },
            { k: 'System', v: 'Regional warehouse' },
            { k: 'Rule', v: 'A transfer cannot consume regional safety stock' },
            { k: 'Time', v: 'Approval may wait overnight, plus 1-2 days in transit' },
          ] },
          { title: 'Procure Centrally', fields: [
            { k: 'Owner', v: 'Regional Parts Planner' },
            { k: 'Input', v: 'Regional shortage and inbound supply' },
            { k: 'Output', v: 'Purchase request' },
            { k: 'System', v: 'ERP' },
            { k: 'Rule', v: 'Discontinued models use the legacy-parts pool' },
            { k: 'Time', v: 'Within one week normally; legacy parts are uncertain' },
          ] },
        ] },
        { title: 'Receipt & Closure', kpi: 'Target: notify within 4 hours of receipt', steps: [
          { title: 'Track Shipment', fields: [
            { k: 'Owner', v: 'Logistics' },
            { k: 'Input', v: 'Transfer or purchase order' },
            { k: 'Output', v: 'In-transit status and exception alert' },
            { k: 'System', v: 'Logistics platform' },
            { k: 'Rule', v: 'Urgent parts ship outside the standard consolidation lane' },
            { k: 'Time', v: 'Same day locally; 1-3 days across regions' },
          ] },
          { title: 'Receive & Put Away', pain: 'Receipt is recorded in store inventory, while the repair order remains unchanged in GSX.', fields: [
            { k: 'Owner', v: 'Store Stockroom' },
            { k: 'Input', v: 'Delivery and shipment record' },
            { k: 'Output', v: 'Available stock and updated repair order' },
            { k: 'System', v: 'Store inventory and GSX' },
            { k: 'Rule', v: 'Physical and document mismatches are quarantined' },
            { k: 'Time', v: '10 minutes to receive; GSX updates are often missed' },
          ] },
          { title: 'Release Repair', fields: [
            { k: 'Owner', v: 'Service Advisor' },
            { k: 'Input', v: 'Available part and customer details' },
            { k: 'Output', v: 'Repair-ready notice and rescheduled workbench' },
            { k: 'System', v: 'GSX' },
            { k: 'Rule', v: 'Unclaimed reservations expire after 48 hours' },
            { k: 'Time', v: 'Notification is immediate; customer return sets the schedule' },
          ] },
        ] },
      ],
    } },
  ];

  function echoCard(o) {
    var box = document.createElement('button');
    box.type = 'button';
    box.className = 'fc-dossier';
    box.title = '打开' + o.folder;
    box.innerHTML = o.mark +
      '<span class="fc-dossier-main">' +
      '<span class="fc-dossier-tline"><span class="fc-dossier-t">' + esc(o.folder) + '</span><span class="fc-dossier-tag">' + esc(TAG) + '</span></span>' +
      '<span class="fc-dossier-d">' + esc(o.meta) + '</span>' +
      '</span>';
    box.addEventListener('click', function () {
      if (window.FastFiles) window.FastFiles.showTab(true);
      if (window.FastDocs) window.FastDocs.open(o.open);
    });
    return box;
  }
  function showFiles() {
    if (window.FastFiles && window.FastFiles.showTab) window.FastFiles.showTab(true);
  }
  function markFolders() {
    if (!window.FastFiles || !window.FastFiles.markFolder) return;
    window.FastFiles.markFolder(FOLDER, { icon: MARK, tag: TAG });
    window.FastFiles.markFolder(BIZ, { icon: MARK_BIZ, tag: TAG });
  }
  function registerDocs() {
    if (!window.FastDocs) return;
    markFolders();
    DOCS.forEach(function (d) {
      window.FastDocs.register({ kind: 'md', deliverable: true, folder: FOLDER, name: d.name, note: d.note,
        size: '6 KB', pages: '4 页', updated: '今天', author: 'AgentOS · Base', md: d.md });
    });
  }
  function registerFlows() {
    if (!window.FastDocs) return;
    markFolders();
    FLOWS.forEach(function (f) {
      window.FastDocs.register({ kind: 'flow', deliverable: true, folder: BIZ, name: f.name, note: f.note,
        pages: '流程板', updated: '今天', author: 'AgentOS · Base',
        iconHtml: window.FastFlowBoard ? window.FastFlowBoard.tabIcon() : '',
        build: function () { return window.FastFlowBoard.mount(f.board); } });
    });
  }

  /* ───────── scenario proposals (checkbox card) ───────── */
  var SCENES = [
    { id: 'a1', title: 'A1 Supplier intelligent sourcing & admission', why: '数据最完整（ERP 报价、准入标准），使用者明确，最容易先跑通', rec: true },
    { id: 'a2', title: 'A2 R&D project risk early warning', why: '研发项目并行多，里程碑延期需要更早发现' },
    { id: 'a3', title: 'A3 After-sales ticket intelligent dispatch', why: '售后工单量大、类型杂，分派和答复可以更快' },
  ];

  function sceneCard() {
    var on = {};
    SCENES.forEach(function (s) { on[s.id] = true; });
    var box = div('ff-card fc-card');
    box.innerHTML =
      '<div class="ff-head"><span class="ff-t">选择要创建的场景</span><span class="ff-h">已全部预选，可取消</span></div>' +
      '<div class="fc-list">' + SCENES.map(function (s) {
        return '<button type="button" class="fc-row is-on" data-id="' + s.id + '">' +
          '<span class="fc-check" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3L5 8.8l4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
          '<span class="fc-main"><span class="fc-t">' + esc(s.title) + (s.rec ? '<span class="fm-opt-tag">推荐</span>' : '') + '</span>' +
          '<span class="fc-d">' + esc(s.why) + '</span></span></button>';
      }).join('') + '</div>' +
      '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="create"></button>' +
      '<button type="button" class="fm-btn" data-act="skip">先不建</button></div>';
    var go = box.querySelector('[data-act="create"]');
    function sync() {
      var n = SCENES.filter(function (s) { return on[s.id]; }).length;
      go.textContent = '创建所选场景（' + n + '）';
      go.disabled = !n;
    }
    sync();
    var done;
    var picked = new Promise(function (r) { done = r; });
    box.addEventListener('click', function (e) {
      var row = e.target.closest('.fc-row');
      if (row) {
        var id = row.getAttribute('data-id');
        on[id] = !on[id];
        row.classList.toggle('is-on', on[id]);
        sync();
        return;
      }
      var act = e.target.closest('[data-act]');
      if (!act || box.classList.contains('is-done')) return;
      box.classList.add('is-done');
      act.classList.add('is-picked');
      done({ act: act.getAttribute('data-act'), ids: SCENES.filter(function (s) { return on[s.id]; }).map(function (s) { return s.id; }) });
    });
    return { node: box, picked: picked };
  }

  async function askScenes(c) {
    var card = sceneCard();
    var seg = div('ao-seg stream-enter');
    seg.appendChild(card.node);
    c.host.appendChild(seg);
    c.scroll();
    var r = await card.picked;
    await c.sleep(420);
    var part = div();
    c.host.appendChild(part);
    if (r.act === 'create' && r.ids.length) {
      await c.run(part, [{ md: '好，我把这 ' + r.ids.length + ' 个场景建出来，并同步到左侧。', gap: 360 }]);
      setTimeout(function () { window.WorkshopCreateScene.fromChatMulti(r.ids); }, 700);
      return { skipFooter: true };
    }
    await c.run(part, [{ md: '好的，先不建。三个方向都记在「数字化成熟度」里了，你想好了随时告诉我，或者接着聊你最关心的环节。', gap: 360 }]);
    return null;
  }

  /* ───────── script ───────── */
  var STEPS = [
    {
      prompt: '我想先了解一下我自己的企业。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('用户想先了解企业，我需要先确认具体是哪一家。');
          await api.sleep(300);
          await api.V({ id: 'co1', icon: 'search', label: '已检索工作区', details: ['当前工作区：DJI Innovations', 'Files：暂无企业资料', 'Scenarios：暂无'] });
          await api.sleep(400);
        },
        segments: [{ md:
          '好的，我可以从公开信息里把你的企业整理成一份企业档案。\n\n' +
          '先确认一下：**你想了解哪家企业？** 给我企业全称或官网都可以。当前工作区是 **DJI Innovations**，如果就是它，直接告诉我即可。', gap: 340 }],
      },
    },
    {
      prompt: '就是我们公司，大疆创新（DJI）。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('确认对象：大疆创新。先从公开渠道收集信息，再按企业档案的八个维度整理。');
          await api.sleep(350);
          await api.V({ id: 'co2', icon: 'search', label: '已检索公开信息 · 官网与产品线', details: ['企业简介与发展历程', '消费级 / 专业影像 / 行业 / 农业 五大板块', '主要产品系列与目标客户'] });
          await api.sleep(320);
          await api.V({ id: 'co3', icon: 'search', label: '已检索公开信息 · 新闻与行业分析', details: ['近年新品发布节奏', '渠道与服务网络', '行业报告中的竞争格局'] });
          await api.sleep(320);
          await api.V({ id: 'co4', icon: 'search', label: '已检索公开信息 · 招聘与技术栈', details: ['研发、供应链、售后岗位职责', '推断：内部系统以 ERP 与项目管理为主'] });
          await api.sleep(420);
          await api.W('信息够了。这一轮只写企业档案，并切到 Files。业务全景留到下一轮。');
          registerDocs();
          showFiles();
          for (var i = 0; i < DOCS.length; i++) {
            if (i) await api.sleep(380);
            if (window.FastFiles) window.FastFiles.addDeliverable(FOLDER + '/' + DOCS[i].name);
          }
          await api.sleep(200);
          await api.V({ id: 'co5', icon: 'context', label: '已生成企业档案', details: DOCS.map(function (d) { return d.name; }) });
          await api.sleep(280);
        },
        segments: [
          { node: null, gap: 220 },
          { md:
          '企业档案在 Files 的 **Deliverables / ' + FOLDER + '**。文件夹后面的 **Base** 表示这是后面方案要站上去的基底。八个维度各一份：\n\n' +
          DOCS.map(function (d) { return '- [' + d.name.replace(/\.md$/, '') + '](' + d.name + ')：' + d.note + '\n'; }).join('') + '\n' +
          '**这一轮先看到这里**：大疆是未上市的多产品线硬件公司，消费级仍是基本盘。管理复杂度集中在 **供应商准入、新品爬坡、多地合规**。\n\n' +
          '业务现在怎么跑，我还没拆。你要的话，下一轮我写成业务全景。营收、人数和产能是演示口径。', gap: 340 }],
      },
    },
    {
      prompt: '业务现在是怎么跑的，也帮我理一份。',
      plan: {
        process: async function (api) {
          await api.sleep(360);
          await api.W('企业档案已经有了。这一轮只补业务全景：三条价值流，再下钻故障诊断和备件补给。');
          await api.sleep(280);
          await api.V({ id: 'co5c', icon: 'context', label: '已回看企业档案', details: ['供应链布局', '战略痛点', '决策链角色'] });
          await api.sleep(320);
          registerFlows();
          showFiles();
          for (var j = 0; j < FLOWS.length; j++) {
            if (j) await api.sleep(420);
            if (window.FastFiles) window.FastFiles.addDeliverable(BIZ + '/' + FLOWS[j].name);
          }
          await api.sleep(200);
          await api.V({ id: 'co5b', icon: 'context', label: '已生成业务全景', details: FLOWS.map(function (d) { return d.name; }) });
          await api.sleep(280);
        },
        segments: [
          { node: null, gap: 220 },
          { md:
          '业务全景在 **Deliverables / ' + BIZ + '**，同样标了 **Base**。三张都是流程板，打开后在右边直接改字：\n\n' +
          FLOWS.map(function (d) { return '- [' + d.name + '](' + d.name + ')：' + d.note + '\n'; }).join('') + '\n' +
          '价值流拆了三段：产品开发、订单到交付、问题到解决。故障诊断和备件补给是「问题到解决」的下钻，痛点集中在系统之间来回抄。\n\n' +
          '备件补给的步骤是按故障诊断同一套结构补上的。', gap: 340 }],
      },
    },
    {
      prompt: '这些里面，哪些环节最适合用 Agent 来做？',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('回看刚才的机会点，按「价值高、数据基础好、能快速验证」来筛。');
          await api.sleep(300);
          await api.V({ id: 'co6', icon: 'context', label: '已回看企业档案', details: ['数字化成熟度', '战略痛点', '供应链布局', '决策链角色'] });
          await api.sleep(320);
          await api.V({ id: 'co7', icon: 'search', label: '已评估候选场景', details: ['供应商寻源与准入：数据好、难度低', '研发项目风险预警：数据中等', '售后工单智能分派：数据中等'] });
          await api.sleep(400);
        },
        segments: [{ md:
          '按 **价值高 + 数据基础好 + 一个月内能跑通** 筛了一遍，我建议从下面三个场景里选。第一个最推荐：采购这块的数据最全，使用者也最明确，跑通后另外两个可以照着复制。\n\n' +
          '勾选你想建成场景卡的，我来创建：', gap: 340 }],
        after: askScenes,
      },
    },
  ];

  window.FastCompany = {
    active: function () {
      var CV = window.FastConversations;
      if (off || !(CV && CV.isPre && CV.isPre())) return false;
      return started || (window.FastRoute && window.FastRoute.get() === 'side');
    },
    prompt: function () { return STEPS[Math.min(idx, STEPS.length - 1)].prompt; },
    take: function () {
      started = true;
      var i = Math.min(idx, STEPS.length - 1);
      var p = STEPS[i].plan;
      if (idx < STEPS.length) idx++;
      if (i === 1) {
        p.segments[0] = { node: echoCard({ folder: FOLDER, mark: MARK, open: DOCS[0].name, meta: DOCS.length + ' 个维度' }), gap: 220 };
      }
      if (i === 2) {
        p.segments[0] = { node: echoCard({ folder: BIZ, mark: MARK_BIZ, open: FLOWS[0].name, meta: FLOWS.length + ' 张流程板' }), gap: 220 };
      }
      return p;
    },
    stop: function () { off = true; },
    scenes: SCENES,
  };
})();
