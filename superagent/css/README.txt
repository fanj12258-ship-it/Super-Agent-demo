Super Agent workshop styles (load order matches generated HTML)

改 CSS 列表 / 共享壳 → ../workshop/shell.html 然后 npm run build:workshop
不要手改 ../superagent.html 或 ../superagent-fast.html

tokens.css           — :root design tokens, base reset, body
layout-sidebar.css   —三栏 shell、拖拽分割、左栏 / 场景卡、doc explorer
panels-modals.css    —Workbench parity、弹层、文档树、销售 demo 等面板样式
chat-composer.css    —中间页、聊天区、composer、model/token popover
returning.css        — Returning 页专用（仅 superagent.html）

改 UI 时优先打开对应文件，避免回到单文件 HTML 堆 CSS。
