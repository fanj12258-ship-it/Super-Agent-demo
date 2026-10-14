# Super Agent 打造台：界面 IA + 改造路径

> **活文档搭档：** [DEMO-JOURNEY.md](./DEMO-JOURNEY.md)（journey / 双模背书）  
> **原则：** 主战场是打造台交互与 thinking model，不是视觉换皮；工作台已锁定，本阶段不接线。  
> **最近更新：** 2026-10-10

---

## 0. 工程默认（已选定）

| 项 | 决定 |
|---|---|
| 旧 [`superagent.html`](./superagent.html)（~4600 行） | **冻结** — reference-only，不继续堆双模/结构地图功能 |
| 新打造台壳 | 在 [`superagent-ui/`](./superagent-ui/)（React + Vite）新建 Workshop Shell |
| 视觉 | 对齐 [`../workbench/tokens/agentos-ui.md`](../workbench/tokens/agentos-ui.md) |
| 可挪用 | Workbench token；旧 demo 流式回复/四步文案作脚本素材 |
| 不挪用 | 旧页整页 DOM/CSS |
| 工作台 | **不动**；打造台稳定后再谈 `?entry=` |
| 代码开工顺序 | 见本文 §7；**须先出现在 DEMO-JOURNEY §8「已拍板可开工」** |

**为何不改旧 HTML：** 双模 + Structure Map + Agent 面 + Sync 是信息架构升级；在巨石单文件上打补丁成本高于重做壳，且与「贴近 Codex」冲突。

---

## 1. 「聪明感」从哪来（五块同时在场）

1. **目标锚** — 始终知道最终要可试用的 Agent / 场景  
2. **结构地图** — 有什么 / 缺什么 / 可选未建（非文档待办墙）  
3. **对话主航道** — Codex 式：输入 → 多轮 → 雏形 → POC  
4. **Agent 本体面** — 能看见、能试用  
5. **模式 + 同步** — Fast ↔ Formal；试验改动可一键同步  

长链路灵活性 = **地图可点跳 + 模式可切 + 步骤非强制线性**，不是不可跳过的 wizard。

```text
WorkshopShell
├── TopBar (goal / mode / sync)
└── Body
    ├── Left:  StructureMap
    ├── Center: Chat (Codex rail)
    └── Right: AgentSurface | Doc preview
```

- 左栏缺口 → 聚焦中栏继续聊/改  
- 中栏 POC ready → 打开右栏试用  
- 右栏试用反馈 → 回中栏；Sync → 更新左栏正式态  

---

## 2. 总布局（所有进房态共用一个壳）

### 2.1 Top bar（矮、信息密度高）

| 元素 | 作用 |
|---|---|
| 返回 / 空间名 | 回 Overview；接线后可回工作台 |
| **场景名 + 阶段芯片** | Crafting / Ready / Live |
| **ModeSwitch** | `Fast` / `Formal` — 同房双模，改版核心控件 |
| **GoalStrip** | 一行目标（可编辑），防 lost |
| **SyncControl** | 脏状态强调 + 一键同步 |
| 次要 | 会话列表、帮助 |

### 2.2 三栏（Codex 贴近法）

| 栏 | 宽 | 职责 |
|---|---|---|
| **左 · Structure Map** | ~260–300px | Agent / Docs / Ontology / Skill / Knowledge / MCP / Chat 痕迹；状态 Ready / In progress / Missing / **Optional** |
| **中 · Chat rail** | 弹性主列 | 多轮、思考流、Artifact 卡、门档条、Composer |
| **右 · Agent / Artifact** | ~360–420px，可收起 | 默认 Agent 面；点文档时切 Doc preview |

窄屏：右栏抽屉；左栏可折成图标条。

### 2.3 刻意不做

- 全屏步骤条霸占首屏（四步法进 Formal 顶条/左上 StepRail）  
- 灰底叠卡片仪表盘  
- 长 checklist 冒充进度  
- 工作台再开「快/正式」两个大门  

---

## 3. 分屏（对接 DEMO-JOURNEY 三条主路径）

### 屏 A · Codex 主界面（UJ-2 进门 · 已纠正）

**何时：** Enter Workshop。**不是**场景卡大厅。

- **主体 = 自由对话**（Codex）：闲聊 / 聊需求 / 聊出新场景都可以  
- **侧栏（或等价承载）= 已有场景列表**：随时可选一个去打造；也可以不选  
- 从对话「收成新场景」→ 再进入选模式  
- **此时不选 Fast/Steps**；模式在「开始打造」之后  

**证明：** 灵活自由；场景是承载物不是首页墙；归根结底 = Codex + 交付物/资产管理。  

**示意：** [`small-test-for-user.html`](./small-test-for-user.html) 路径 ① / ①b。

---

### 屏 B · Fast 房间（UJ-2A · 改版主战场）

标准三栏；`mode = fast`。

中栏轻量阶段感（非 wizard）：

1. 空态 Composer：描述要的 Agent / 贴材料  
2. 多轮后 **ArtifactCard**（草稿 doc、结构变化）  
3. **POC ready** → Try in panel（右栏试用）  
4. 试用反馈进对话 → 左栏缺口高亮 → 点缺口继续  
5. Sync 可用  

左栏随对话变 Missing→Partial→Ready；Optional 可标「暂不需要」。  
右栏：**AgentSurface**（名称、一句话目标、能力点、Try 迷你对话、依赖回链左栏）。  
门档：**GateBanner** 非模态，不打断对话流。

---

### 屏 C · Formal 房间（UJ-2B · 四步法保留）

同壳；`mode = formal`。

- **StepRail**：需求 → 知识 → 设计文档 → 本体/生智能；**可点击跳步**；未完成可进但标风险  
- 中栏仍是对话，偏当前步；可随时切回 Fast  
- 从 2A Carry in：横幅「已代入 POC 资产」；左栏预填；StepRail 标已覆盖步  

Demo 点到即可，避免再演长征。

---

### 屏 D · 半成品续作（UJ-1）

同壳 + **预装数据**：结构半满、聊天历史、NextCard。  
首屏 3 秒内可读懂：到哪了、缺什么、Next 是什么。

---

### 屏 E · Live 迭代（UJ-3）

同壳；阶段 Live；Iterate 语境（非 Start crafting）。  
右栏 Try 更重；左栏多为 Ready，缺口是增强点；Sync = 迭代回写（demo 语义）。

---

## 4. 关键组件

| 组件 | 职责 |
|---|---|
| ModeSwitch | Fast / Formal |
| GoalStrip | 一行目标，可编辑 |
| StructureMap | 节点状态 + Optional + 点击聚焦 |
| NextCard | 一条系统建议 + 主按钮 |
| GateBanner | 门档，可忽略/去补 |
| ArtifactCard | 对话内产出（doc / POC / 结构 diff） |
| AgentSurface | 看样貌 + Try |
| SyncControl | dirty / syncing / clean + toast |
| StepRail | 仅 Formal；可跳步 |
| SceneOverviewCard | Overview 场景卡 |
| Composer | 能力密度对齐旧 demo；视觉跟 Workbench ink |

---

## 5. 状态机

```text
view: overview | room
mode: fast | formal
scene: null | SceneId
sync: clean | dirty | syncing
right: agent | doc | hidden
focusAsset: null | AssetId
```

接线后（另议）：`entry=overview|craft|iterate` + `scene` → overview 或 room + 预置 state。

---

## 6. 与 journey 的映射

| Journey | 屏 | 重点组件 |
|---|---|---|
| UJ-2 公共 | A Overview | SceneOverviewCard、双 CTA |
| UJ-2A | B Fast | StructureMap、ArtifactCard、AgentSurface、Sync、GateBanner |
| UJ-2B | C Formal | StepRail、Carry 横幅、ModeSwitch |
| UJ-1 | D | NextCard + 预装结构/聊天 |
| UJ-3 | E | Iterate 顶栏语境、Try、Sync |

房间内节拍（B-Fast / B-Try / B-Reverse / B-Sync…）见 [DEMO-JOURNEY.md](./DEMO-JOURNEY.md) §5。

---

## 7. 代码交付顺序（仅当 DEMO-JOURNEY §8 出现对应条目后）

1. Overview 页 + 场景卡假数据  
2. Fast 三栏空壳（TopBar ModeSwitch + 左中右框）  
3. StructureMap + NextCard 假数据  
4. AgentSurface Try + SyncControl 示意  
5. Formal StepRail + Carry 横幅  
6. UJ-1 / UJ-3 预置态  

默认演示入口走 **新壳**；旧 HTML 仅打开对比。

---

## 8. 方案默认（未单独拍板前按此设计）

| 项 | 默认 |
|---|---|
| 总布局 | 三栏：左结构 / 中对话 / 右 Agent |
| Overview CTA | 同时露出 Start Fast + Start Formal |
| 工程 | 冻结旧 HTML + React 新壳 |
| 第一屏代码 | Overview + Fast 空壳（开工后） |
| Formal | 可跳步；demo 缩短展示 |

若你改口，改本表 + DEMO-JOURNEY §7。

---

## 9. 变更记录

| 日期 | 变更 |
|---|---|
| 2026-10-10 | 初版：从 Workshop UI design plan 落入文档；工程默认冻结旧 HTML、React 新壳。 |
