Super Agent workshop scripts（加载顺序见 HTML；改壳用 workshop/）

分层（改功能时先看这一层，少翻无关文件）：

════════════════════════════════════
SHARED — Fast + Returning 都加载
════════════════════════════════════
workshop-columns.js       — 左/中/右列宽拖拽与 clamp
workshop-panels.js        — 左右侧栏开关 + 右栏全屏
composer-model-picker.js  — Model / Reasoning 弹层
composer-token-usage.js   — Context usage 弹层
create-scene-modal.js     — 新建场景弹层
overview-menu.js          — Overview 菜单
chrome-popovers.js        — 顶栏账号等弹层
file-type-icons.js        — 文件类型图标
files-panel.js            — Files 树
fast-assets-tab.js        — 资产 Tab
fast-docs-data.js         — 文档数据
fast-plan-docs-data.js    — 方案文档数据
fast-files.js             — Files 驱动
fast-scenes.js            — 场景列表
fast-mode.js              — 轻量 / 按流程 模式切换
fast-scene-card.js        — 场景卡
fast-scene-create.js      — 场景创建
fast-blueprint.js         — Blueprint 侧栏（旧卡片）
fast-blueprint-iso.js     — Blueprint 等轴图
fast-flowmap.js           — 横向架构图
fast-journey.js           — Journey 进度
fast-intake.js            — 开场 intake
fast-flow-board.js        — Flow board
fast-company.js           — 企业了解（Side 线相关数据/UI）
scene-card-menu.js        — 场景卡菜单
cui-icons.js              — CUI 图标
agent-body.js             — Agent 正文渲染
fast-docs.js              — 文档面板
fast-agent-panel.js       — 右栏 Agent
fast-diagnosis.js         — 诊断 / 修复钩子
fast-onto-graph.js        — 本体图
fast-modules.js           — 模块层
fast-switch-dialog.js     — 转入按流程打造
fast-formal-files.js      — 正式 Files
fast-handoff.js           — POC → Steps 交接
fast-flow.js              — Fast 流程主驱动
fast-upload.js            — 上传
fast-mention.js           — @ 提及
fast-conversations.js     — 中央对话层
fast-summary.js           — 对话摘要
workbench-home.js         — 回工作台
fast-change.js            — 反改 / 变更
agent-chat-mock-fast.js   — Demo 对话 mock

════════════════════════════════════
FAST ONLY — 仅 superagent-fast.html
════════════════════════════════════
fast-route.js             — Space 演示路线 Main / Side 开关

════════════════════════════════════
RETURNING ONLY — 仅 superagent.html
════════════════════════════════════
returning.js              — 回访用户页状态与对话落点

════════════════════════════════════
页面壳（不要手改两个 HTML）
════════════════════════════════════
改共享布局 → superagent/workshop/shell.html
改页差异   → superagent/workshop/pages.mjs
然后跑     → npm run build:workshop

Legacy（当前 HTML 未引用）:
  ../superagent-chat.js
  ../superagent-doc-tree.js
  ../superagent-assistant-turn.js
  ../superagent-scenario-detail.js
