export const DEMO_THINKING = `解析用户意图
用户给出的是一句口头任务：「分析一个高管的 agent」。这是典型的分析型、未约束需求，不能等同于「直接设计高管 Agent 方案」或「写一份 PRD」。

歧义扫描（对象 / 目的 / 交付）
· 对象：某位高管正在用的 agent、待建专属 agent，还是外部市场对标？
· 目的：能力复用到 AgentOS、评估值不值得做，还是给该高管单独交付一版？
· 交付：一页结论、能力拆解清单，还是可落地的 Skill / Agent 方案？

若不在前三项上对齐，后续极易在错误实体上做深度分析，导致报告被整体打回。

推理与策略
1. 拒绝默认假设——不预设「CEO 助手」或通用聊天封装就是目标。
2. 先输出可拍板结构：歧义对照表 → 三类场景优先级 → 老板该回答的 6 个问题。
3. 若被催「先出一版」：用角色 → 任务 → 能力（感知/推理/行动/边界）框架，并映射 AgentOS「场景洞察 / 场景打造」两条能力线。
4. 正式回答采用 Markdown 结构化输出（含表格）；完成后挂载 Four steps 四步法，把开放问题收成可执行下一步。`

export type FourStepItem = {
  step: number
  title: string
  desc: string
  action: string
}

export const FOUR_STEPS_GUIDE: FourStepItem[] = [
  {
    step: 1,
    title: '澄清对象',
    desc: '锁定是哪一位高管、哪个 agent，是否有账号、配置、截图或真实对话样本。',
    action: '向老板确认名称与可获取材料',
  },
  {
    step: 2,
    title: '对齐目的',
    desc: '明确是复用到 AgentOS、评估值不值得做，还是为某位高管单独做一版。',
    action: '用一句话写下「成功后看起来像什么」',
  },
  {
    step: 3,
    title: '定义交付',
    desc: '一页结论、能力清单，还是 Skill / Agent 方案——深度、周期与风险差异很大。',
    action: '对齐截止时间、读者与评审方式',
  },
  {
    step: 4,
    title: '推进闭环',
    desc: '抛出 6 个关键问题，收齐输入后做「角色 → 任务 → 能力 → 可沉淀 Skill」分析。',
    action: '在 AgentOS 用 Four steps 继续拆解与交付',
  },
]

export const DEMO_AGENT_REPLY = `这句话本身还不是一份可执行需求，而是一个**没收敛的分析任务**。老板要的是「分析一个高管的 agent」，但没说分析谁、分析什么、交付什么。先把这层拆开，你回去才问得准。

## 这句话里其实叠了三层歧义

| 没说清的点 | 可能是什么 | 做错了会怎样 |
|---|---|---|
| **分析对象** | 某位高管正在用的 agent；还是要给高管做的 agent；还是行业里的高管 agent 对标 | 拆错系统、写错报告 |
| **分析目的** | 复用、对标、评估值不值得做、拆能力、给老板汇报 | 交付物对不上预期 |
| **交付物** | 一页结论、能力清单、需求规格、Skill、Agent 方案 | 做深了浪费，做浅了被打回 |

「高管的 agent」在公司语境里通常只可能是下面三种之一，优先级从高到低：

1. **拆某个高管已经在用的 agent**  
   看它解决什么、接了哪些系统、哪些能力可沉淀到 AgentOS。
2. **给某类高管设计一个专属 agent**  
   例如 CEO / COO / 事业部负责人的工作流、决策节奏、信息入口。
3. **对标市场上的高管助手**  
   看竞品能力边界，决定我们做不做、做到哪一层。

没确认之前，不要直接做第 2 或第 3 种。

## 这个需求真正该产出什么

老板说「分析」，通常要的不是长文，而是能拍板的三件事：

1. **这个 agent 到底替高管干什么**（3–5 个核心任务，而不是功能罗列）
2. **哪些能力值得做成 Skill / Agent，哪些只是聊天包装**
3. **我们做还是不做、先做哪一块**（建议 + 依据）

如果最后只交一堆界面截图或 Prompt 摘录，大概率会被认为「没分析完」。

## 建议你先问老板的 6 个问题

1. 分析的是**哪一位高管、哪个 agent**？有账号、对话记录、配置，还是只有口头描述？
2. 目的是 **复用到我们产品**、**评估值不值得做**，还是 **给这位高管做一版**？
3. 交付物要 **一页结论**、**能力拆解**，还是 **可落地的 Skill / Agent 方案**？
4. 这位高管的核心工作是什么：经营决策、组织管理、客户、还是业务推进？
5. 有没有必须接入的系统：日历、邮件、OA、CRM、财报、会议纪要？
6. 什么时候要、给谁看：内部评审，还是直接给这位高管？

这 6 个里，**1、2、3** 不问清楚，后面都是空转。

## 如果老板说「你先出一版」

可以按这个框架交，而不是先写方案：

**1. 角色画像**  
谁、管什么、每天决策什么、最烦什么、不能错什么。

**2. 任务地图**  
把「高管的一天」收成 5–8 个任务，例如：会前简报、经营异常、跨部门催办、对外口径、决策备忘。  
每个任务标：高频 / 高价值 / 高风险。

**3. Agent 能力拆解**  
对现有 agent（或假设要做的 agent），拆成四层：

- 感知：读什么（日历、邮件、报表、会议）
- 推理：判断什么（优先级、风险、该不该升级）
- 行动：做什么（起草、催办、排程、生成纪要）
- 边界：哪些必须人确认（对外承诺、人事、财务、合规）

**4. 和 AgentOS 的映射**  
你们现在页面上已经有两条线，可以对上：

- **场景洞察**：需求分析、场景研究、企业洞察 —— 适合先把「这个高管到底要什么」讲清楚
- **场景打造**：需求洞察 / 全景规划 / 知识挖掘 —— 适合后面把它做成可复用的高管 Agent

**5. 结论页（给老板看的）**  
只留四句：

- 这个 agent 的核心价值是什么
- 最大缺口是什么
- 建议做 / 不做 / 先做哪一块
- 下一周需要什么输入才能继续

## 我对这份需求的判断

当前信息只够得出一句：**先确认对象和目的，再做分析，不要直接设计高管 Agent。**

最稳妥的下一步：你把上面 6 个问题丢给老板。  
如果他回「就是某某总在用的那个」，把 agent 名称、截图、配置、几段真实对话发我，我可以按「角色 → 任务 → 能力 → 可沉淀 Skill」帮你出一版能交差的分析。`

export const DEMO_ALLOCATION_THINKING = `解析用户意图
用户要做的是「销售分货 Agent」。目标已经比较具体：根据库存、门店/渠道需求和约束，自动给出分货方案并解释原因，而不是先做抽象的高管分析。

先收敛场景
· 分货对象：总部给门店，还是仓库给销售/客户/经销商？这会决定数据表、约束和责任人。
· 决策目标：公平、优先重点店、保底不断货，还是清库存/冲销量？
· 交付形态：Excel 方案 + 解释，还是可上传重算的小工具。

MVP 边界
1. 先做读取数据 → 打分 → 生成方案 → 解释未满足原因。
2. 人工可调策略和锁定条件，避免第一版就做成全自动黑盒。
3. 正式回答给出能力清单、流程和关键澄清问题，方便直接进入可落地设计。`

export const DEMO_ALLOCATION_REPLY = `可以。我们可以把它做成一个“销售分货 Agent”：输入库存、门店/销售渠道需求、历史销量、优先级和约束，自动给出分货方案，并解释为什么这么分。

我建议先做一个 MVP，核心能力是：

1. **读取数据**
   - SKU 库存
   - 各门店/渠道需求
   - 历史销量、售罄率、库存周转
   - 门店等级、区域、活动计划
   - 最小/最大分货量、箱规、补货周期等约束

2. **生成分货方案**
   - 按门店潜力、需求紧急度、历史表现、库存压力打分
   - 支持公平分配、优先分配、保底分配、爆品倾斜
   - 避免超库存、低效门店过量、重点门店断货

3. **输出解释**
   - 每个 SKU 分给谁、分多少
   - 哪些门店被优先满足
   - 哪些需求未满足以及原因
   - 可以导出 Excel/CSV

4. **人工可调**
   - 调整策略：保守、均衡、冲销量、清库存
   - 锁定某些门店或 SKU
   - 修改后重新计算

一个简单的 Agent 流程可以是：

\`\`\`text
用户上传销售/库存表
        ↓
Agent 清洗并识别字段
        ↓
计算门店需求分、销售潜力分、库存风险分
        ↓
根据策略和约束生成分货方案
        ↓
输出表格 + 分货解释 + 异常提醒
\`\`\`

如果你愿意，我可以下一步直接帮你设计一个可落地版本，包括：

- 数据表模板
- 分货算法逻辑
- Agent 提示词/系统指令
- Python 原型
- 或者做成一个可上传 Excel 的小工具

我先问一个关键问题：你这个“分货”主要是 **总部给门店分货**，还是 **仓库给销售/客户/经销商分货**？`

export const DEMO_STORE_THINKING = `确认分货对象
用户补充「给销售门店」，把上一轮开放问题收成明确场景：总部/仓库把货分到销售门店，而不是经销商或客户。

落地模型
· 输入：库存、门店、销售、需求、规则五张表。
· 决策：先算真实缺口，再给门店打分，再按冲销量/均衡/清库存/保底策略分配。
· 输出：建议分货量、未满足量、原因和异常提醒。

回答策略
给出可执行的表结构、核心公式和约束，并收口到最小可用版本：上传 Excel 生成《分货建议表》。最后询问是否继续出完整方案文档、字段模板和 Python 原型。`

export const DEMO_STORE_REPLY = `明白，那就是“总部/仓库 → 销售门店”的分货 Agent。

我建议先按这个业务模型做：

**输入表**
- \`库存表\`：SKU、款号、颜色、尺码、可分配库存、箱规
- \`门店表\`：门店、区域、等级、渠道类型
- \`销售表\`：门店、SKU、近7/14/30天销量、当前库存、在途库存
- \`需求表\`：门店、SKU、建议需求量或目标铺货量
- \`规则表\`：重点门店、保底量、封顶量、不可分配门店、活动门店

**Agent 决策逻辑**
1. 先判断每个门店每个 SKU 的真实缺口  
   \`缺口 = 目标库存 - 当前库存 - 在途库存\`

2. 给门店打分  
   可用维度：
   - 近30天销量
   - 售罄速度
   - 门店等级
   - 区域优先级
   - 是否活动门店
   - 是否新品首铺门店

3. 按策略分货  
   - \`冲销量\`：优先高销量/高等级门店
   - \`均衡铺货\`：尽量让更多门店有货
   - \`清库存\`：优先消化滞销 SKU 或指定仓库库存
   - \`保底优先\`：先满足核心门店最低陈列量

4. 输出结果  
   - 门店、SKU、建议分货量
   - 未满足需求量
   - 分货原因
   - 异常提醒：库存不足、门店超配、低销量门店高需求等

**最小可用版本可以这样做**
先做一个 Excel/Python Agent：你上传几张表，它自动生成一张《分货建议表》。

核心公式大概是：

\`\`\`text
需求缺口 = max(目标库存 - 当前库存 - 在途库存, 0)

门店分货权重 =
  近30天销量权重 * 0.4
+ 门店等级权重 * 0.25
+ 售罄率权重 * 0.2
+ 活动权重 * 0.15

建议分货量 =
  可分配库存 × 该门店权重 / 所有有需求门店权重
\`\`\`

然后再加约束：
- 不超过门店需求缺口
- 不低于重点门店保底量
- 不超过门店封顶量
- 按箱规/整手数取整

如果你要，我下一步可以直接给你做一个 **销售门店分货 Agent 的完整方案文档 + Excel字段模板 + Python计算原型**。`

export const DEMO_MVP_THINKING = `用户确认继续
上一轮已给出门店分货模型、公式和最小可用版本。用户回「好的」，按约定直接交付可跑的 MVP，而不是再问一轮范围。

交付内容
· 字段模板：inventory / stores / sales / targets / rules
· 样例数据与 Python 分货脚本
· 跑通后的分货建议表、异常提醒表
· 校验：SKU001/002/003 分配量等于可分配库存 96/54/38，禁配门店拦截

回答形态
用文件引用链出 README 与两张结果表，并给出已编辑文件清单，方便直接打开验收。`

export const DEMO_MVP_REPLY = `已经帮你做好一个可跑的“销售门店分货 Agent MVP”雏形，放在这里：

[销售门店分货 Agent MVP](/Users/ke.wang/Documents/Codex/2026-10-07/wo-xi/outputs/sales_allocation_agent/README.md)

里面包括：
- 字段模板：\`inventory / stores / sales / targets / rules\`
- 样例数据
- Python 分货脚本
- 跑出来的样例结果和异常提醒

我也已经用样例跑通了，输出在：

[分货建议表](/Users/ke.wang/Documents/Codex/2026-10-07/wo-xi/outputs/sales_allocation_agent/results/allocation_result.csv)

[异常提醒表](/Users/ke.wang/Documents/Codex/2026-10-07/wo-xi/outputs/sales_allocation_agent/results/allocation_alerts.csv)

验证结果：样例里 \`SKU001 / SKU002 / SKU003\` 的分配量分别等于可分配库存 \`96 / 54 / 38\`，没有超分；禁配门店也被正确拦截。下一步可以把它包装成一个真正的对话式 Agent，比如你上传 Excel 后，它自动识别字段、问缺失信息、按“冲销量/铺货/保底”策略生成方案。`

export type FileChangeItem = {
  path: string
  added: number
  removed: number
}

export type FileChangeSet = {
  added: number
  removed: number
  files: FileChangeItem[]
}

export const DEMO_MVP_FILE_CHANGES: FileChangeSet = {
  added: 422,
  removed: 0,
  files: [
    { path: 'outputs/sales_allocation_agent/README.md', added: 78, removed: 0 },
    { path: 'outputs/sales_allocation_agent/examples/inventory.csv', added: 4, removed: 0 },
    { path: 'outputs/sales_allocation_agent/examples/rules.csv', added: 19, removed: 0 },
    { path: 'outputs/sales_allocation_agent/examples/sales.csv', added: 19, removed: 0 },
    { path: 'outputs/sales_allocation_agent/examples/stores.csv', added: 7, removed: 0 },
    { path: 'outputs/sales_allocation_agent/examples/targets.csv', added: 19, removed: 0 },
    { path: 'outputs/sales_allocation_agent/src/allocate.py', added: 266, removed: 0 },
    { path: 'outputs/sales_allocation_agent/templates/inventory.csv', added: 2, removed: 0 },
    { path: 'outputs/sales_allocation_agent/templates/rules.csv', added: 2, removed: 0 },
    { path: 'outputs/sales_allocation_agent/templates/sales.csv', added: 2, removed: 0 },
    { path: 'outputs/sales_allocation_agent/templates/stores.csv', added: 2, removed: 0 },
    { path: 'outputs/sales_allocation_agent/templates/targets.csv', added: 2, removed: 0 },
  ],
}

export type ToolCallDemo = {
  label: string
  command?: string
  output?: string
}

export type DemoTurn = {
  id: string
  match: (text: string) => boolean
  thinking: string
  answer: string
  fourSteps: FourStepItem[]
  fileChanges?: FileChangeSet
  tools?: ToolCallDemo[]
  thinkDoneLabel?: string
  thinkVariant?: 'card' | 'plain'
}

/** Style-lock sample — WorkBuddy-like tool + terminal under 深度思考 */
export const DEMO_LIST_ROOT_TOOL: ToolCallDemo = {
  label: '列出工作区根目录文件',
  command: 'ls -la "/Users/ke.wang/Documents/SUPER AGENT"',
  output: `total 40
drwxr-xr-x@ 12 ke.wang  staff   384 Oct 10 14:18 .
drwx------@ 28 ke.wang  staff   896 Oct  8 09:12 ..
-rw-r--r--@  1 ke.wang  staff  8196 Oct 10 11:02 .DS_Store
drwxr-xr-x@  5 ke.wang  staff   160 Oct  9 16:40 .cursor
drwxr-xr-x@  4 ke.wang  staff   128 Oct  7 21:10 .qa
-rw-r--r--@  1 ke.wang  staff  2140 Oct 10 10:55 README.md
drwxr-xr-x@ 14 ke.wang  staff   448 Oct 10 13:40 superagent
drwxr-xr-x@ 10 ke.wang  staff   320 Oct 10 14:05 workbench`,
}

export const DEMO_TURNS: DemoTurn[] = [
  {
    id: 'executive',
    match: (text) => /高管/.test(text),
    thinking: DEMO_THINKING,
    answer: DEMO_AGENT_REPLY,
    fourSteps: FOUR_STEPS_GUIDE,
    tools: [DEMO_LIST_ROOT_TOOL],
  },
  {
    id: 'allocation',
    match: (text) => /分货|销售分货/.test(text),
    thinking: DEMO_ALLOCATION_THINKING,
    answer: DEMO_ALLOCATION_REPLY,
    fourSteps: [],
    tools: [DEMO_LIST_ROOT_TOOL],
  },
  {
    id: 'store-allocation',
    match: (text) => /给销售门店|销售门店/.test(text),
    thinking: DEMO_STORE_THINKING,
    answer: DEMO_STORE_REPLY,
    fourSteps: [],
    tools: [DEMO_LIST_ROOT_TOOL],
  },
  {
    id: 'mvp',
    match: (text) => /^\s*好的[。！]?\s*$/.test(text),
    thinking: DEMO_MVP_THINKING,
    answer: DEMO_MVP_REPLY,
    fourSteps: [],
    fileChanges: DEMO_MVP_FILE_CHANGES,
    tools: [DEMO_LIST_ROOT_TOOL],
    thinkDoneLabel: '用时 2分钟 4秒',
    thinkVariant: 'plain',
  },
]

export function pickDemoTurn(text: string, usedIds: string[] = []): DemoTurn | null {
  const unused = DEMO_TURNS.filter((item) => !usedIds.includes(item.id))
  const matchedUnused = unused.find((item) => item.match(text))
  if (matchedUnused) return matchedUnused
  const matchedAny = DEMO_TURNS.find((item) => item.match(text))
  if (matchedAny) return matchedAny
  return unused[0] ?? null
}

export function getDemoTurn(id: string | undefined): DemoTurn | null {
  if (!id) return DEMO_TURNS[0] ?? null
  return DEMO_TURNS.find((item) => item.id === id) ?? DEMO_TURNS[0] ?? null
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
      const icon =
        '<svg class="chat-cite-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.4h5.1L12 5.3v8.3H4V2.4Z" stroke="currentColor" stroke-width="1.2"/><path d="M9.1 2.4V5.4H12" stroke="currentColor" stroke-width="1.2"/></svg>'
      return `<a class="chat-cite" href="${escapeHtml(href)}">${icon}<span>${escapeHtml(label)}</span></a>`
    })
    .replace(/「([^」]+)」/g, '「$1」')
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0

  function flushParagraph(buf: string[]) {
    const text = buf.join(' ').trim()
    if (text) out.push(`<p>${inlineMarkdown(text)}</p>`)
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    if (trimmed.startsWith('## ')) {
      out.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      i += 1
      const code: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      out.push(`<pre class="chat-md-pre"><code>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i += 1
      }
      if (tableLines.length >= 2) {
        const header = tableLines[0].split('|').filter(Boolean).map((c) => c.trim())
        const bodyRows = tableLines.slice(2)
        out.push('<div class="chat-md-table-wrap"><table class="chat-md-table"><thead><tr>')
        header.forEach((cell) => {
          out.push(`<th>${inlineMarkdown(cell)}</th>`)
        })
        out.push('</tr></thead><tbody>')
        bodyRows.forEach((row) => {
          const cells = row.split('|').filter(Boolean).map((c) => c.trim())
          out.push('<tr>')
          cells.forEach((cell) => {
            out.push(`<td>${inlineMarkdown(cell)}</td>`)
          })
          out.push('</tr>')
        })
        out.push('</tbody></table></div>')
      }
      continue
    }

    if (/^\d+\.\s/.test(trimmed)) {
      out.push('<ol class="chat-md-ol">')
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        let item = lines[i].trim().replace(/^\d+\.\s*/, '')
        i += 1
        const nested: string[] = []
        const cont: string[] = []
        while (i < lines.length) {
          const next = lines[i].trim()
          if (!next) {
            const peek = lines[i + 1] ? lines[i + 1].trim() : ''
            if (!peek || /^\d+\.\s/.test(peek) || peek.startsWith('##') || peek.startsWith('```')) break
            i += 1
            continue
          }
          if (
            /^\d+\.\s/.test(next) ||
            next.startsWith('##') ||
            next.startsWith('```') ||
            (next.startsWith('|') && next.endsWith('|'))
          ) {
            break
          }
          if (next.startsWith('- ')) {
            nested.push(next.slice(2))
            i += 1
            continue
          }
          cont.push(next)
          i += 1
        }
        let html = inlineMarkdown(item)
        if (cont.length) html += `<br>${cont.map((line) => inlineMarkdown(line)).join('<br>')}`
        if (nested.length) {
          html += `<ul class="chat-md-ul">${nested.map((n) => `<li>${inlineMarkdown(n)}</li>`).join('')}</ul>`
        }
        out.push(`<li>${html}</li>`)
      }
      out.push('</ol>')
      continue
    }

    if (trimmed.startsWith('- ')) {
      out.push('<ul class="chat-md-ul">')
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        out.push(`<li>${inlineMarkdown(lines[i].trim().slice(2))}</li>`)
        i += 1
      }
      out.push('</ul>')
      continue
    }

    const para: string[] = [trimmed]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('##') &&
      !lines[i].trim().startsWith('###') &&
      !lines[i].trim().startsWith('|') &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i].trim())
      i += 1
    }
    flushParagraph(para)
  }

  return out.join('\n')
}
