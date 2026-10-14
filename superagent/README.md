# Superagent Workshop（内侧打造）

Agent crafting / chat / scenario workshop. Product journeys and dual-mode背书: [`DEMO-JOURNEY.md`](./DEMO-JOURNEY.md). UI IA + rebuild path: [`WORKSHOP-UI.md`](./WORKSHOP-UI.md). Visual tokens: [`../workbench/tokens/agentos-ui.md`](../workbench/tokens/agentos-ui.md).

## Layout

| Path | Role |
|---|---|
| **`superagent-ui/`** | **Target workshop shell** (React + Vite). New Codex-like dual-mode UI lands here. |
| `DEMO-JOURNEY.md` | Demo user journeys / 双模背书（活文档） |
| `WORKSHOP-UI.md` | 界面 IA、五屏、组件、状态机、改造顺序（活文档） |
| `superagent.html` | Workshop shell **markup only** (~260 lines). Styles → `css/`, behavior → `js/` (see each folder’s `README.txt`). |
| `css/` | Split stylesheets: tokens, layout/sidebar, panels/modals, chat/composer |
| `js/` | Active: column resize + composer popovers. Root `superagent-*.js` = legacy salvage |
| `superagent-chat.js` | Legacy chat demo replies / streaming helpers（素材可挪用） |
| `superagent-assistant-turn.js` | Legacy assistant turn / thinking demo（素材可挪用） |
| `superagent-doc-tree.js` | Legacy docs explorer tree |
| `superagent-scenario-detail.js` | Legacy scenario detail helpers |

## How to open

- **Legacy reference:** open `superagent.html` in the browser.  
- **New shell:** develop/run under `superagent-ui/` once §8 in `DEMO-JOURNEY.md` authorizes the first screen.

Workbench → Workshop deep-link is **not wired** while Workbench stays locked; see journey docs before any entry wiring.
