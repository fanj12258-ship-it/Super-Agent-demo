# Workshop shell（公共层）

Fast（`superagent-fast.html`）和 Returning（`superagent.html`）共用同一套三栏壳。  
两边真正不同的只有几处，都收在这里，避免改一处要改两个巨型 HTML。

## 怎么改

| 你想改什么 | 改这里 | 然后 |
|---|---|---|
| 两边都有的布局 / 样式引用 / 脚本列表 | `shell.html` | `npm run build:workshop` |
| Fast 演示路线 Main/Side 开关 | `fragments/fast-route.html` | 同上 |
| 某一页独有的 CSS/JS | `pages.mjs` | 同上 |
| 具体交互逻辑 | `../js/*.js`（见下方分层） | 一般不用重建 HTML |

**不要手改**生成出来的：

- `../superagent-fast.html`
- `../superagent.html`

它们由脚本写出。入口 URL 不变，工作台跳转也不变。

## 占位符

`shell.html` 里只有这些差异点：

- `{{TITLE}}`
- `{{EXTRA_HEAD}}` — Returning 加 `returning.css`
- `{{COMPOSER_ROUTE}}` — Fast 加 Main/Side 路线开关
- `{{SCRIPT_ROUTE}}` — Fast 加 `fast-route.js`
- `{{SCRIPT_END}}` — Returning 加 `returning.js`

## 检查是否过期

```bash
npm run build:workshop:check
```
