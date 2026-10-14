# AgentOS Workbench（外侧工作台）

> **🔒 LOCKED（2026-10-10）** — `agentos-workbench.html` 已锁版。**没有用户明确说"改"，不要修改。**
> 锁定快照：`backups/agentos-workbench.LOCKED-2026-10-10.html`（拆分前的**单文件**版本，sha1 `abe1f895d0867dc59ac531ba5e80ec61bc373a74`）。
> 2026-10-10 已把单文件拆成 `css/` + `js/`（行为与锁定快照逐像素一致）。快照仍可单独打开，作为拆分前的对照。
> 要改时：先备份，再只改被点名的那一处，并去 `css/` 或 `js/` 里对应的文件改，不要把样式 / 脚本塞回 HTML。

Asset manager for a project space: Scenario / Agent / Knowledge / Skill / Ontology / MCP / Files, plus team switcher, account menu, and notifications.

## Files to confirm

| Path | Role |
|---|---|
| `agentos-workbench.html` | Page markup only (~270 lines). Styles → `css/`, behavior → `js/` |
| `css/` | Split stylesheets, load order = cascade order (see `css/README.txt`) |
| `js/` | Split scripts, classic scripts sharing one global scope, order matters (see `js/README.txt`) |
| `assets/agentos-logo.png` | Sidebar logo |
| `assets/agentos-nav-icons.locked.svg` | Locked nav icon family |
| `backups/` | Backups + the locked pre-split single-file snapshot |
| `tokens/agentos-ui.md` | Design tokens, display rules, interaction rules |

## How to open

Open `agentos-workbench.html` directly in the browser (file:// is fine).

## Relation to Superagent

Workbench = outer entry & asset management.  
`../superagent/` = workshop you enter to craft agents (larger, more complex). Do not wire the entry yet until Workbench is confirmed.
