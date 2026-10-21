# AgentOS Demo 交互资产盘点

> **用途：** 为后续重新设计四条故事线提供现成能力索引。  
> **原则：** 本文只盘点资产，不替四条故事线命名，不把现有 UJ-1 / UJ-2 / UJ-3 当成新故事线约束。  
> **范围：** `superagent/` 打造台、`workbench/` 入口，以及已接入或可作为业务素材的独立页面。  
> **盘点日期：** 2026-10-21。

---

## 1. 当前 Demo 的真实结构

当前不是四套独立 Demo，而是：

1. 一套共享的三栏 Workshop 壳；
2. 一套对话与交付物承载能力；
3. 多组可组合的交互片段；
4. 两种主要初始状态：
   - `superagent-fast.html`：冷启动 / 从零开始；
   - `superagent.html`：已有工作进度 / 回访续作；
5. 若干尚未完整接线、但代码仍保留的能力。

后续四条故事线应尽量由这些资产重新编排，而不是复制四套页面。

---

## 2. 资产状态标记

| 标记 | 含义 |
|---|---|
| **可直接复用** | 已有完整触发、反馈和结束状态 |
| **可组合** | 能用，但需要故事线提供业务文案或前后节点 |
| **仅演示** | 依赖 Space、定时器或固定 Mock 数据 |
| **隐藏保留** | 代码存在，当前入口已撤下 |
| **占位** | 有可点击外观，但没有实际行为 |
| **需收敛** | 多套实现重复，继续扩展前应统一 |

---

## 3. 全局壳与导航资产

| 资产 | 用户动作与反馈 | 状态 | 主要实现 |
|---|---|---|---|
| Workbench → Workshop 进入 | Enter / Continue 跳转到不同初始态 | 可直接复用 | `workbench/js/workshop-entry.js` |
| 左栏展开 / 收起 | 点击 rail 或顶部按钮，恢复原宽度 | 可直接复用 | `js/workshop-panels.js` |
| 右栏展开 / 收起 | 打开 Agent / 文档工作区 | 可直接复用 | `js/workshop-panels.js` |
| 右栏宽屏 | 普通宽度与 expanded 状态切换 | 可直接复用 | `js/workshop-panels.js` |
| 左右栏拖拽 | pointer 拖动调整列宽 | 可直接复用 | `js/workshop-columns.js` |
| Overview 下拉 | 场景切换、当前项标记、外点 / Esc 关闭 | 可组合 | `js/overview-menu.js` |
| 账户菜单 | 点击、外点、Esc | 可直接复用 | `js/chrome-popovers.js` |
| 通知面板 | 点击、外点关闭 | 可直接复用，但 Esc 不一致 | `js/chrome-popovers.js` |
| 新建场景弹窗 | 打开、关闭、提交、Esc | 可组合 | `js/create-scene-modal.js` |
| Search / Filter / Background tasks | 有按钮外观，无业务反馈 | 占位 | `workshop/shell.html` |

### 使用建议

- 四条故事线共享同一壳层，不复制 panel、popover、modal。
- 每条故事线只定义：进入时的初始状态、默认选中的场景、右栏默认内容。

---

## 4. 左栏：场景、蓝图与文件资产

### 4.1 场景资产

| 资产 | 能力 | 状态 | 主要实现 |
|---|---|---|---|
| Scenarios / Files Tab | 两类信息承载切换 | 可直接复用 | `js/files-panel.js` |
| 场景卡 | 状态、描述、CTA、更多菜单 | 可组合 | `workshop/shell.html`、`js/scene-card-menu.js` |
| 场景卡更多菜单 | 打开、外点、Esc、菜单项收口 | 可直接复用 | `js/scene-card-menu.js` |
| 聊天中创建单场景 | 预览卡 → 创建 → 进入打造 | 可组合 | `js/fast-intake.js`、`js/fast-scene-create.js` |
| 聊天中创建多场景 | 勾选多个业务机会 → 批量生成场景卡 | 可组合 | `js/fast-company.js`、`js/fast-scene-create.js` |
| A2 / A3 进入打造 | 当前仅提示未接入 | 占位 | `js/fast-scene-create.js` |

### 4.2 Blueprint / 结构资产

| 资产 | 能力 | 状态 | 主要实现 |
|---|---|---|---|
| 六段 Blueprint | Requirement / Knowledge / Design / Ontology / Skill / Agent 的完成态、进行态、未开始态 | 可组合 | `js/fast-blueprint.js` |
| 状态闪动 | 业务变更时对应结构节点 Updated / flash | 可直接复用 | `js/fast-blueprint.js`、`js/fast-change.js` |
| 紧凑等距图 | hover / click 后与结构行联动 | 可直接复用 | `js/fast-blueprint-iso.js` |
| 展开结构图 | Overlay、关闭、Esc、节点联动 | 可直接复用 | `js/fast-blueprint-iso.js` |
| 缺口表达 | 未建、Mock、需校对、需再创作 | 可组合 | `js/fast-formal-files.js` |

### 4.3 Files 资产

| 资产 | 能力 | 状态 | 主要实现 |
|---|---|---|---|
| Materials / Deliverables 树 | 文件夹展开、文件选中、新文件提示 | 可直接复用 | `js/fast-files.js`、`css/file-tree.css` |
| 空目录壳 | 可在没有子文件时预置一级目录并显示 Files；支持专属目录图标、`Base` 标签与不可折叠状态；执行开始时可再次确保这些基础入口存在，后续内容直接在同一入口解锁 | 可直接复用 | `js/fast-files.js`、`js/fast-route.js` |
| 企业资产目录入口 | 使用 Workbench 同名资产 `Enterprise Documents / Business Landscape / Scenario Planning`；点击或键盘激活后在右栏打开独立 Tab；内容可按 Journey 节点逐项解锁 | 可直接复用 | `js/fast-files.js`、`js/enterprise-assets.js` |
| 动态添加文件 | 生成过程中逐个长出文档与业务板 | 可组合 | `js/fast-files.js` |
| Long task 版本留痕 | 确认并开始执行任务时，在 `Files → Deliverables → Long task` 下保存 `v1`；后续调整可继续保留 v2 等版本用于追溯 | 可直接复用 | `js/fast-flow.js` |
| 新内容反馈 | 蓝点、new 动画、Tab 提示点 | 可直接复用 | `js/fast-files.js` |
| 文档入口更新红点 | 文档由隐藏变为可查看、内容更新或新交付物出现时，在对应左侧入口显示红点；打开后自动清除 | 可直接复用 | `js/fast-files.js`、`js/enterprise-assets.js`、`css/file-tree.css` |
| 会话摘要入库 | 当前会话摘要保存为 Markdown | 可直接复用 | `js/fast-summary.js` |
| 正式目录 / 轻量底稿 | 分段展示交接前后资产 | 隐藏保留 | `js/fast-formal-files.js` |
| Sync 提示条 | 前往 Workbench / 忽略 | 可组合 | `js/fast-files.js` |

### 注意

当前仍存在两套 Files 树逻辑：

- `files-panel.js` 的静态树；
- `fast-files.js` 的动态树。

静态树被 CSS 隐藏，但仍会初始化。后续故事线不要继续向两套树同时加数据；以动态树作为演示资产来源。

---

## 5. 中区：对话与输入资产

| 资产 | 用户动作与反馈 | 状态 | 主要实现 |
|---|---|---|---|
| Composer 发送 | Enter / Send，进入 busy，逐段输出 | 可直接复用 | `js/agent-chat-mock-fast.js` |
| Space 演示填充 | 空输入按 Space，逐字填入当前 Journey 提供的首句；未提供时回落到现有脚本优先链 | 仅演示；文案归各故事线 | `js/fast-route.js`、`js/agent-chat-mock-fast.js` |
| Journey 1 / 2 / 3 / 4 / Main / Side 选择器 | 单一互斥路线选择；默认 Journey 1；Journey 1 预置 Files 目录但左栏仍默认 Scenarios；Main 与 Side 保留原有路线；选择后派发 `fastjourneychange` | 可组合；Journey 1-4 内容待设计 | `workshop/fragments/fast-route.html`、`js/fast-route.js`、`css/fast-overrides.css` |
| Journey 定位提示 | 无额外图标；13px；hover Journey 按钮后立即显示路线说明，移出立即关闭；键盘聚焦立即显示 | 可直接复用；文案归各故事线 | `workshop/fragments/fast-route.html`、`css/fast-overrides.css` |
| 附件上传 | 选择、附件条、取消、完成 | 可直接复用 | `js/fast-upload.js` |
| 模型选择 | Popover、子菜单、Esc / 外点 | 可直接复用 | `js/composer-model-picker.js` |
| Token 用量 | 小型 Popover | 可直接复用 | `js/composer-token-usage.js` |
| 多会话 Tab | 新建、切换、stash / restore | 可直接复用 | `js/fast-conversations.js` |
| 删除会话 | 两阶段确认 | 可直接复用 | `js/fast-conversations.js` |
| 当前会话摘要 | 四段摘要 + 存入 Files | 可直接复用 | `js/fast-summary.js` |
| 建议问题 Chip | 点击填入输入框 | 可直接复用 | `js/fast-conversations.js` |
| 深度思考 / 过程展示 | 状态变化、活动行、耗时、自动贴底 | 可直接复用 | `js/agent-chat-mock-fast.js`、`js/agent-body.js` |
| 自动贴底 | Agent 输出时贴底；用户上滑后暂停 | 可直接复用 | `js/agent-chat-mock-fast.js` |

### Space 触发优先级

当前预填内容由多个脚本竞争，优先链大致为：

`Journey → Change → Company → Intake → Conversation prompt → 默认文案`

四条新故事线应各自声明自己的 Space 脚本阶段，不再依赖隐式优先级叠加。

---

## 6. 对话内交互卡资产

这些卡片是故事线最重要的可复用积木。

| 卡片模式 | 现有交互 | 可用于 |
|---|---|---|
| 单选 / 多选决策卡 | 选择、选中态、确认、查看方案 | 需求确认、方案选择、范围裁剪 |
| 创建场景预览卡 | 创建场景 / 再聊聊 | 从自由对话进入业务场景 |
| 多场景勾选卡 | 勾选多个机会并批量创建 | 企业诊断、机会发现 |
| 长任务执行卡 | 可注入任务列表；逐项切换等待、执行、完成、审核与停止状态；下方可组合三行窗口，在单个步骤约 3 秒内高频滚动多条细粒度思考动作 | 文档生成、批量分析、结构更新 |
| 交付物人工审核卡 | 查看右栏方案、确认通过、暂停或提交修改意见；主操作与透明底“查看方案”并排展示；审核期间执行卡同步等待 | 阶段性交付审核、人在环卡点 |
| 产出物执行总结 | 以正文形式总结任务范围、推进过程与最终结论，不使用卡片外框；产出物逐行以“小图标 + 蓝色链接名称”列出并可打开右栏对应内容 | 多任务完成总结、交付物导航 |
| 深度思考 → 结构化结论 → Plan 任务卡 | 按分析维度展示可感知的思考过程；正文收敛结论；复用任务卡注入任务、Agent 标签、说明与 CTA | 售前诊断、规划类任务、执行前确认 |
| 模式 / 做法选择卡 | 两种做法、说明、结构图预览 | 演示不同工作策略 |
| 版本卡 | v1 / v2、查看差异、采用版本 | 迭代、反改、方案比较 |
| Ready to try 卡 | Open / Mocks / Prompts / Promote | 从生成进入试用 |
| 变更核对清单 | 已修改 / 无需改动 / 待办；查看差异；撤销 | 全链路联动 |
| 转入正式流程卡 | 文档映射、确认转入 | 隐藏保留的交接叙事 |
| 加固计划卡 | 分任务执行、打开模块 | 隐藏保留的发布前叙事 |

主要实现：

- `js/fast-flow.js`
- `js/journey-one.js`
- `js/fast-intake.js`
- `js/fast-company.js`
- `js/fast-change.js`
- `js/fast-switch-dialog.js`
- `js/fast-handoff.js`

### 重复使用纪律

新增故事节点前，先判断是否只是以下模式之一：

1. 信息展示；
2. 单选 / 多选；
3. 确认执行；
4. 执行进度；
5. 结果 / 差异；
6. 下一步 CTA。

若是，应换业务内容，不应再造新的卡片结构。

---

## 7. 右栏：文档、模块与 Agent 资产

| 资产 | 能力 | 状态 | 主要实现 |
|---|---|---|---|
| 文档 Tab Viewer | 打开多个文档、切换、关闭 | 可直接复用 | `js/fast-docs.js` |
| 资产未生成态 | 保留右栏 Tab、面包屑与资产标题；白色缺省内容块填满右栏剩余高度，底部保留 12px padding，内容垂直居中；通过 `EnterpriseAssets.setContentVisible` 在对应 Journey 节点揭示内容 | 可直接复用 | `js/enterprise-assets.js`、`css/enterprise-assets.css` |
| 对话引用打开文档 | Chat cite → 右栏文档 | 可直接复用 | `js/fast-docs.js` |
| 文档折叠块 | 标题区点击展开 / 收起 | 可直接复用 | `js/fast-docs.js` |
| 文档差异高亮 | `==内容==` 高亮修改处 | 可直接复用 | `js/fast-change.js`、`js/agent-body.js` |
| Agent Spec | 查看 Agent 结构与说明 | 可组合 | `js/fast-agent-panel.js` |
| Agent Try | 在右栏直接试用 | 可组合 | `js/fast-agent-panel.js` |
| Mock / Prompt 查看 | 从 Ready 卡打开 | 可组合 | `js/fast-agent-panel.js` |
| Ontology 图 | 节点、平移、缩放 | 可直接复用 | `js/fast-onto-graph.js` |
| 功能模块页 | Launcher、内部导航、返回 | 可组合 | `js/fast-modules.js` |
| Sandbox / Harden / Release | 完整代码仍在，入口已撤下 | 隐藏保留 | `js/fast-modules.js`、`js/fast-handoff.js` |

---

## 8. 已有业务内容资产

以下是内容资产，不等于新的四条故事线。

| 内容资产 | 已有内容 | 接入情况 |
|---|---|---|
| 供应商寻源 / 准入 | 需求、知识、方案、本体、Agent 生成与试用 | 主 Demo 最完整 |
| 企业认知 / 业务全景 | 企业档案、三张流程板、机会场景 A1/A2/A3 | 已接入 Side 路线 |
| 客户需求变更 | 纪要上传、13 项核对、文档 / 本体 / Agent 联动 | Fast 与 Returning 共用 |
| 半成品回访 | 3/6 蓝图、历史会话、回顾、下一步 | 已接入 Returning 页 |
| 销售分货 | 动作层图谱与默认对话文案 | 独立内容较多，未形成完整入口 |
| 分仓智能补货 | 本体可视化、流程、告警、补货计划 | Workbench iframe 已有接入 |
| 售后 / 备件 / 工单 | 业务全景流程板 | 作为企业认知素材存在 |

独立页面：

- `动作层图谱v4.html`
- `分仓智能补货本体可视化(1).html`

---

## 9. 跨故事线应统一复用的反馈语言

### 即时反馈

- Hover / selected / active；
- 按钮 pressed / disabled；
- Popover / tooltip；
- 文件蓝点与新内容动画。

### 过程反馈

- Agent thinking；
- 长任务逐项 reveal；
- Blueprint 节点依次闪动；
- busy 时禁止会话切换。

### 结果反馈

- 完成态 / Updated；
- 文件或文档自动长出；
- 变更差异高亮；
- 已修改 / 无需修改 / 待办汇总；
- 下一步建议卡。

### 恢复与撤销

- Esc；
- 外部点击；
- 二次点击；
- 文档关闭；
- 方案修改撤销；
- 会话 stash / restore。

---

## 10. 重复实现与收敛提醒

### P0：编排新故事线前必须知道

1. `superagent-fast.html` 与 `superagent.html` 实际共享大部分 Fast 脚本；部分文件头“仅 Fast 页加载”的注释已过时。
2. Files 有静态树与动态树两套逻辑。
3. Popover、Dialog、聊天卡片的关闭和选中逻辑存在多份实现。
4. 多个看起来可点击的 Chrome 控件仍是占位。
5. A2 / A3、Live Iterate、Sandbox / Handoff 等不是完整可跑故事。

### P1：后续新增时优先收敛

1. 统一 Popover 的外点、Esc、焦点归还；
2. 统一 Dialog 的关闭协议；
3. 统一聊天卡的主按钮、完成态、禁用态；
4. 统一 `is-on / is-current / is-active / is-cur`；
5. 统一 Files 行点击是否打开右栏文档；
6. 将 Space 的故事脚本从隐式优先级改成显式 story state。

### P2：体验一致性

1. 中英文混用；
2. 空输入时 Send 仍显示可点；
3. 通知面板 Esc 行为与其他 Popover 不一致；
4. Blueprint 在隐藏 Tab 中更新后的重绘时机；
5. 装饰性按钮缺少“暂不可用”反馈。

---

## 11. 四条新故事线的资产映射模板

四条线确定后，每条只需要填写下表，不先复制代码：

| 字段 | 要回答的问题 |
|---|---|
| 故事目标 | 这条线最终证明什么？ |
| 用户与业务状态 | 谁，在什么上下文里进入？ |
| 入口 | Workbench CTA、冷启动、回访、Live 迭代或其他？ |
| 初始状态 | 场景、Files、Blueprint、会话、Agent 分别是什么状态？ |
| 关键触发 | 点击、输入、Space、上传还是选择？ |
| 核心交互卡 | 从第 6 节挑哪些现成卡？ |
| 过程反馈 | thinking、progress、结构闪动、文件生成选哪些？ |
| 右栏承载 | 文档、Ontology、Agent Spec、Try 还是 Module？ |
| 高潮 | 用户在哪一步第一次感到价值？ |
| 结果 | 生成、修改、同步、发布还是迭代？ |
| 恢复路径 | 如何返回、撤销、继续或切换会话？ |
| 复用资产 | 对应本文具体资产与文件 |
| 新增缺口 | 只有现有资产确实无法表达时才新增 |

---

## 12. 后续协作约定

当开始设计四条故事线时：

1. 先用第 11 节模板定义故事，不先改代码；
2. 从本文第 3–9 节选现成资产；
3. 标出“完全复用 / 换内容复用 / 需要补能力”；
4. 四条线共用同一交互模式时，只保留一个实现；
5. 每新增一个交互点，补回本文资产表；
6. 不把旧 UJ 名称自动套到新四条线上。

### 资产沉淀契约（2026-10-21）

四条故事线可以持续重新设计；交互资产是跨故事线积累的长期底座。

- 用户明确说“资产级别修改”时，在完成修改的同一轮同步更新本文。
- 即使用户没有使用“资产”二字，只要新增或改变的能力可被两条及以上故事线复用，也应主动更新本文。
- 应沉淀：交互结构、视觉样式、状态、反馈、触发与关闭方式、可复用组件、通用业务承载方式。
- 不沉淀：单条故事线的角色、台词、固定 Mock 数据、一次性剧情顺序；这些记录在对应故事线文档。
- 每项新增资产需要写清：能力名称、触发与反馈、成熟度、适用范围、主要实现文件。
- 资产被替换、隐藏或废弃时不直接从清单消失，应更新状态并注明替代项。
- 若一次改动同时包含“故事编排”和“资产能力”，分别记录，避免把剧情固化成组件规则。

