# AgentOS Workbench — Design tokens & UI rules

> Cursor rule (agent): `../../.cursor/rules/agentos-ui.mdc`  
> Visual reference / implementation: `../agentos-workbench.html`  
> Confirm this Workbench pack before aligning Superagent.  
> Last audit: **2026-10-10** (CSS + CTA stage mapping in workbench HTML).  
> Superagent alignment: **2026-10-10** — `superagent/superagent.html` `:root` + chrome remapped to this contract (warm paper / olive ink removed).

---

## Product layers

| Layer | Path | Role |
|---|---|---|
| **Workbench (outer)** | `workbench/agentos-workbench.html` | Project spaces, asset catalogs (Scenario / Agent / KB / Skill / Ontology / MCP / Files), Market / AI Ops empty, account & notifications. Entry shell. |
| **Workshop (inner)** | `superagent/superagent.html` (+ JS / `superagent-ui/`) | Agent crafting / chat / scenario build after entering from workbench. |

When changing Superagent UI: **match Workbench tokens and patterns first**. Do not invent a second visual language. Content may differ; chrome, density, cards, buttons, popovers, and status language should feel like the same product.

Folder map: `workbench/` (shell + tokens) · `superagent/` (workshop) · `_archive/` (old experiments).

---

## Consistency audit (2026-10-10) — report only

**Verdict:** Global chrome is **mostly unified** (popovers locked; stage colors shared; New badge / is-new glow paired; agent + scenario footers match). Remaining drift is **acceptable for now** (“差不多的就那样吧”) — document as known variance, do not hot-fix unless asked.

### Already locked

| Area | Status |
|---|---|
| Popover shell (account / team / notify) | Shared `--popover-*` + `.acct-menu, #notifyPanel` |
| Account / team menu items | h34 · pad-x 10 · r8 · `--hover` |
| Scenario stage palette | Live / Ready / Crafting / Not started pills reused by MCP / ontology tags |
| New badge | Brand-red top-right on agent + scenario |
| Footer band | `#fafafa` + top `#f2f2f2` on `.ag-foot` / `.sc-app-actions` |
| Scenario CTA by stage | Live → Iterate (soft); Ready / Crafting / Idle → solid primary labels |
| Sidebar list type (unified) | Primary **12/500** · nested **12/400** · desc **11/400** · Files section kicker **12.5/600** brand blue |
| Files / materials tree | Outline folder + type chips · guide line · hover/select only (no default select) |
| Agent turn chrome | `--ao-*` · avatar mock · name **AgentOS** · prose / foot |
| Deep thinking (CUI) | `--ao-dt-*` · [cui-demo](https://agentos-cui-demo.vercel.app/) · shimmer / 480 viewport / 深度思考 row |

### Known drift (leave unless product asks)

| Category | Drift | Suggested unify later |
|---|---|---|
| **Primary ink** | `#171717` (sidebar) · `#111` (card CTAs / chips) · `#1a1a1a` (modal) · `rgba(23,23,23,0.92)` (empty CTA) | One `--ink` (`#171717` or `#111`) + hover `#2a2a2a` |
| **Soft / secondary CTA** | `.sc-build.is-soft` r8/12px · `.ag-cta.build` r7/11px · `.sc-biz-build` r6/10px/h26 | One in-card soft recipe; biz may stay smaller |
| **Card radius** | `.card` **12** · `.sc-app` **14** | Prefer 14 for large cards, 12 for dense grids — or pick one |
| **Card hover** | Agent/KB grids lift + shadow; `.sc-app` none; `.fb-hub` weaker shadow | Optional: same hover on scenario |
| **Status dots** | Stage/agent **7px** · asset/kb **6px**; idle grays `#c0c0c0` / `#a3a3a3` / `#c4c4c4` / `#d4d4d8` | `--dot-lg` / `--dot-sm` + one idle |
| **Live ring** | Agent `0.16` opacity · Scenario `0.14` | Pick `0.14` |
| **Notify rows** | Pad `8×14`, hover `#fafafa` vs menu `--hover` `#f5f5f5` | Align hover to `--hover` |
| **Empty states** | Catalog dashed `.empty` vs full-bleed `.empty-hero` | Two languages OK (catalog vs Market/Ops) |
| **CTA copy matrix** | Scenario “crafting/launch/Iterate” vs Agent “building/publish/Try” | Intentional product language — keep distinct |
| **Business chip** | `.sc-chip.pri` ready-blue vs `.sm-chip-biz` `#e0f2ff`/`#0d8ae6` | Align modal biz chip to ready tokens |
| **Segment control** | `.lang-seg` ≈ `.sm-seg` duplicated | Extract one segment recipe |

---

## Tokenization rules

1. Prefer `var(--token)` over new raw hex.
2. If a color / radius / shadow appears ≥2 times, add or reuse a token.
3. Do **not** reintroduce the old heavy menu shadow (`0 5px 17px rgba(0,0,0,0.2)…`) on account / notify / team panels.
4. Workbench HTML `:root` is the **live subset**; tables below are the **canonical contract** (promote into `:root` when touching CSS).

### Live `:root` today (in HTML)

```css
:root {
  --text: #333333;
  --text-secondary: #8c8c8c;
  --placeholder: #b3b3b3;
  --divider: #e6e6e6;
  --hover: #f5f5f5;
  --selected: #e5f4ff;
  --search-bg: #f5f5f5;
  --brand-red: #f24822;
  --file-blue: #0d99ff;

  /* Locked popover chrome — account menu is the source of truth */
  --popover-bg: #ffffff;
  --popover-border: #ececec;
  --popover-radius: 14px;
  --popover-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03);
  --popover-sep: #f0f0f0;
  --popover-font: 13px;
  --popover-pad: 6px;
  --popover-item-h: 34px;
  --popover-item-radius: 8px;
  --popover-item-pad-x: 10px;
  --popover-gap: 8px;
}
```

---

## Design tokens (canonical contract)

### Color — text

| Token | Value | Use |
|---|---|---|
| `--text` | `#333333` | Body default, icon stroke default |
| `--text-primary` | `#111111` | Titles, emphasis, solid CTA fill twin |
| `--text-secondary` | `#8c8c8c` | Descriptions, email, meta (prefer over raw `#8c8c8c`) |
| `--text-tertiary` | `#9a9a9a` | Quieter meta / asset summaries / child labels |
| `--text-muted` | `#a0a0a0` | Footer runs (e.g. agent runs count) |
| `--text-quiet` | `#666666` | Stage default text, secondary icons |
| `--text-soft` | `#555555` | Filter chip off, tag text, status label |
| `--placeholder` | `#b3b3b3` | Inputs / empty field hints |

**Emphasis ladder (do not invent new blacks casually):**  
`#111` (primary) · `#171717` (ink CTA) · `#1a1a1a` (modal titles — fold into ink when hardening) · `#333` (body).

### Color — surfaces

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page, cards, popovers, biz rows |
| `--bg-subtle` | `#fafafa` | Card footers, nested soft bands, notify hover (legacy) |
| `--bg-muted` / `--hover` / `--search-bg` | `#f5f5f5` | Hover wash, search field (same value — keep aliases) |
| `--bg-nested` | `#fafbfc` | Scenario children band |
| `--bg-preview` | `#f3f4f6` | Skill / soft gray previews |
| `--bg-preview-alt` | `#f6f7f9` | Knowledge preview tray |
| `--bg-chip` | `#f7f7f8` | Asset chips, “show more” hover |
| `--bg-seg` | `#f2f2f4` | Segmented control track |
| `--selected` | `#e5f4ff` | Nav active — cool tint, **not** purple |

### Color — borders

| Token | Value | Use |
|---|---|---|
| `--divider` | `#e6e6e6` | Sidebar edge, major splits |
| `--border` | `#ececec` | Cards, panels, popover border (same as `--popover-border`) |
| `--border-strong` | `#d8d8d8` | Secondary / soft CTA border |
| `--border-hover` | `#c0c0c0` | Soft CTA hover border |
| `--border-dashed` | `#d0d0d0` | Ghost Import, show-more |
| `--border-soft` | `#f0f0f0` | Inner section splits (children top) |
| `--border-footer` | `#f2f2f2` | Footer band top |
| `--border-chip` | `#e8e8ea` | Asset chip / doc preview edge |
| `--border-filter` | `#ebebeb` | Filter chip off |
| `--border-card-hover` | `#dddddd` | Card hover border |

### Color — brand & ink

| Token | Value | Use |
|---|---|---|
| `--brand-red` | `#f24822` | User/team avatar fill, New badge, version-update alert dot |
| `--file-blue` | `#0d99ff` | Files icon tile, focus ring accent |
| `--ink` | `#171717` | Sidebar primary CTA fill (canonical) |
| `--ink-hover` | `#2a2a2a` | Primary hover |
| `--ink-active` | `#0f0f0f` | Primary active |
| `--ink-card` | `#111111` | In-card solid CTAs / filter on (current practice; may merge with `--ink`) |
| `--ink-modal` | `#1a1a1a` | Modal primary (current practice; merge later) |

### Color — status (qualitative stages, never fake %)

| Token | Value | Use |
|---|---|---|
| `--status-live` | `#22c55e` | Live / done dots |
| `--status-live-bg` | `#e8f8ef` | Live / Try chip bg |
| `--status-live-text` | `#1f7a45` | Live / Try text |
| `--status-live-border` | `#b7ebc9` | Try button border |
| `--status-live-ring` | `rgba(34,197,94,0.14)` | Soft outer ring on Live dot |
| `--status-ready` | `#3b82f6` | Ready dots |
| `--status-ready-bg` | `#eef4ff` | Ready chip / priority chip bg |
| `--status-ready-text` | `#3b6fd8` | Ready / priority text |
| `--status-crafting` | `#f59e0b` | Crafting / partial dots |
| `--status-crafting-bg` | `#fff4e5` | Crafting chip bg |
| `--status-crafting-text` | `#b76a00` | Crafting chip text |
| `--status-idle` | `#a3a3a3` | Draft / not-started stage dot |
| `--status-idle-alt` | `#c0c0c0` | Agent default gray (legacy twin) |
| `--status-idle-asset` | `#c4c4c4` | Asset chip idle |
| `--status-idle-empty` | `#d4d4d8` | Empty asset |
| `--status-idle-bg` | `#f4f4f5` | Neutral chip / not-started pill |

**Stage labels (Scenario):** `Not started` · `Crafting` · `Ready` · `Live`  
**Agent states:** `Draft` · `Ready` · `Live`

### Color — semantic tags (pastel, not neon)

| Role | Background | Text | Notes |
|---|---|---|---|
| Application kicker | `#eceaff` | `#6a54f0` | Only this purple tint — not page theme |
| Business / priority | `--status-ready-bg/text` | | Prefer over modal `#e0f2ff`/`#0d8ae6` |
| Neutral gray tag | `#f4f4f5` | `#555555` | Agent tags |
| Model tag (Agent) | `#111111` | `#ffffff` | Black pill exception |
| New badge | `--brand-red` | `#ffffff` | + shadow `0 1px 3px rgba(242,72,34,0.35)` |
| is-new card glow | border `#b7ddf7` | | `0 0 0 1px rgba(13,153,255,0.12), 0 8px 20px rgba(13,153,255,0.08)` |

Avoid purple-on-white page themes, glow pulses, and cream `#F4F1EA` hero looks.

### Color — empty heroes (Market / AI Ops)

| Token / role | Market | AI Ops |
|---|---|---|
| Wash | Cool blue-gray gradient | Soft green-gray gradient (`.is-ops`) |
| Eyebrow | `#9aa3b2` | `#8aa396` |
| CTA | Near-black pill `rgba(23,23,23,0.92)` + `0 8px 24px rgba(17,24,39,0.12)` | same |

### Typography

| Token / role | Value |
|---|---|
| `--font-sans` | `"Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif` |
| Base | **12px** / **16px** line-height, color `--text` |
| Anti-alias | `-webkit-font-smoothing: antialiased` |

**Type scale (established):**

| Size | Line | Weight | Use |
|---|---|---|---|
| 10px | 1 / 15 | 500–600 | Biz CTA, asset chip, tiny chips |
| 11px | 15–22 | 400–700 | **Desc 400/15** · stage pills / agent CTA / New badge / foot meta |
| 12px | 16 | **500** primary · **400** nested | Sidebar list, Files tree, scenario titles, kb/sk/on names |
| 12px | 16–17 | 400–600 | Body secondary, sidebar buttons, sc-build |
| 12.5px | — | 500–600 | Sidebar tabs · Files section kicker (`Materials`) |
| 13px | 16–20 | 400–600 | Nav, popover body, page desc |
| 14px | 16–20 | 600 | Team name, agent/mcp featured name, main tab |
| 18px / 24 | 600 | Modal title |
| 22px / 28 | 600 | Page title (`letter-spacing: -0.02em`) |
| 24px / 32 | 600 | Empty-hero title (marketing-soft exception) |

**Weights:** 400 body/nested · **500 list/card primary titles** · 600 chrome/emphasis · 700 rare (avatar letter, New badge).

### Radius

| Token | px | Use |
|---|---|---|
| `--radius-xs` | 6 | Chips, New badge, small tags, biz CTA |
| `--radius-sm` | 7 | Agent in-card CTA (current) |
| `--radius-md` | 8 | Nav, buttons, biz rows, sc-build, icon buttons |
| `--radius-btn` | 8–9 | Sidebar primary/ghost (use 8 today) |
| `--radius-card` | 12 | Dense asset cards (`.card`) |
| `--radius-card-lg` | 14 | Scenario app cards; popovers |
| `--radius-popover` | 14 | Account / team / notify |
| `--radius-modal` | 16 | Create/import dialogs |
| `--radius-ava` | 12 | Agent avatar square |
| `--radius-pill` | 999 | Stage pills, filter chips, empty CTA |

### Shadow

| Token | Value | Use |
|---|---|---|
| `--shadow-popover` | `0 4px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)` | Account / team / notify |
| `--shadow-card-hover` | `0 10px 28px rgba(0,0,0,0.07)` | `.card:hover` |
| `--shadow-hub-hover` | `0 8px 22px rgba(0,0,0,0.06)` | Files hub |
| `--shadow-btn` | `0 1px 2px rgba(0,0,0,0.10)` | Sidebar primary rest |
| `--shadow-btn-hover` | `0 2px 6px rgba(0,0,0,0.12)` | Sidebar primary hover |
| `--shadow-seg` | `0 1px 2px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)` | Segment active thumb |
| `--shadow-modal` | `0 0 0 1px rgba(0,0,0,0.05), 0 24px 64px rgba(0,0,0,0.2)` | Dialogs only |
| `--shadow-empty-cta` | `0 8px 24px rgba(17,24,39,0.12)` | Market / Ops CTA |
| `--shadow-doc` | `0 -2px 12px rgba(0,0,0,0.04)` | KB doc stack |
| `--shadow-new` | `0 0 0 1px rgba(13,153,255,0.12), 0 8px 20px rgba(13,153,255,0.08)` | is-new cards |

**Forbidden for chrome menus:** `0 5px 17px rgba(0,0,0,0.2)…`

### Spacing & layout chrome

| Measure | Value |
|---|---|
| Sidebar width | **256px**, white, `border-right: 1px solid var(--divider)` |
| Brand bar height | **54px** |
| Account head height | **52px** (bottom chrome) |
| Main top bar | align ~54px |
| Nav item | h **34px**, gap **4px**, r **8px**, icon **18px**, label **13px**, pad-l **10px**, icon-text gap **12px** |
| Main body padding | **32px** |
| Page title → desc | 4px; desc → toolbar **20px**; toolbar → grid **16px** |
| Card grids | Agent/KB/Skill/Ontology/MCP → **300px** columns, gap **14–16px**; Scenario → **3** cols (→2 @1280, →1 @900), gap **16px** |
| Popover inset | sidebar.left + **8px**; z-index **1000** |
| Modal z-index | **100** (below popovers) |
| Avatar (chrome) | 26px user · 18px team · 24px notify · 44px agent square |

### Motion

| Token | Value | Use |
|---|---|---|
| `--ease-fast` | `0.12s ease` | CTA / input micro |
| `--ease-ui` | `0.14s ease` | Hover bg / border / shadow / card lift |

Card hover: optional `translateY(-1px)` + `--shadow-card-hover`.  
No glow pulses, no decorative gradient motion on catalogs.

### Icons

- Stroke ~**1–1.3**, color `#333` / `#666` secondary  
- Sizes: **12px** inline meta · **13px** button ico · **16px** UI · **18px** nav  
- No emoji as UI icons  

### Focus

- Input focus: `box-shadow: 0 0 0 3px rgba(13, 153, 255, 0.15)` (file-blue family)  
- Color swatch on: ring with `#111`  

---

## Component recipes

### Popovers (locked)

```
background: var(--popover-bg)
border: 1px solid var(--popover-border)
border-radius: var(--popover-radius)   /* 14 */
box-shadow: var(--popover-shadow)
font-size: var(--popover-font)         /* 13 */
item: h 34 · pad-x 10 · radius 8 · hover var(--hover)
sep: var(--popover-sep)
```

- Account: left avatar + name/email; language segment; profile / version update (red **6px** dot only here) / log out  
- Team: same chrome; checkmark on current; “New project space”  
- Notifications: title only — no tabs, no gear, **no** unread bell badge  
- Open one chrome menu at a time; click-outside + Escape  

### Buttons

| Kind | Look | Height | Where |
|---|---|---|---|
| Primary (sidebar) | `--ink` fill, white text, light btn shadow | 32 | Enter Workshop |
| Ghost dashed | transparent + dashed `#d0d0d0` | 32 | Import Agent |
| Solid in-card | `#111`, white, r7–8 | 28 | Go to publish / Go to launch / Continue crafting |
| Soft secondary | white + `#d8d8d8`, text `#1a1a1a` | 28 | Iterate (app), Continue building (agent) |
| Soft positive | live-bg / live-text / live-border | 28 | Try (Live agents) |
| Biz row primary | `#111` solid | 26 | Start/Continue/Finalize |
| Biz row soft | bordered white | 26 | Iterate (biz) |
| Filter chip off | white + `#ebebeb`, text `#555`, pill | 28 | All / Recent |
| Filter chip on | `#111` fill | 28 | |
| Modal primary | `#1a1a1a`, h36, r8 | 36 | Create / Import confirm |
| Empty hero CTA | near-black pill r999 | 36 | Market / AI Ops |

Hover: darken fill or `#f7f7f7` soft; transitions ≤0.14s.

### Cards

```
border: 1px solid var(--border)   /* #ececec */
border-radius: 12 (dense) | 14 (scenario)
background: #fff
footer: bg #fafafa + border-top #f2f2f2
title: single-line ellipsis
desc: 2-line clamp where needed
```

- Scenario: max **2** business rows visible; rest behind “Show N more”  
- Screenshots / user content = **data only** — do not restyle card chrome unless asked  

### Status presentation

- Qualitative stages only — **never** fake precise % progress bars for craft  
- Pill + **7px** colored dot (asset chips **6px**)  
- Live may use soft outer ring `--status-live-ring`  

### Lists & files

- Many files → hub + dense list + breadcrumbs — **not** large tile walls  
- Avatar letters on solid circles / rounded squares  

### Modals

- Backdrop + centered dialog; radius **16**; heavy `--shadow-modal`  
- Required fields marked; segment controls match language-seg micro-shadow  

### Empty states

| Kind | Pattern |
|---|---|
| Catalog empty | Dashed panel `.empty` |
| Market / AI Ops | Full-bleed soft gradient `.empty-hero` (+ `.is-ops`) — no hard card tray |

---

## CTA stage matrix (product logic)

**Live = already shipped.** Re-entry is **product iteration**, not “Go to craft”.

### Scenario — Application (`.sc-build`)

| Stage | Label | Style | `data-scene-mode` |
|---|---|---|---|
| Live | **Iterate** | soft (`.is-soft`) | `iterate` |
| Ready | **Go to launch** | solid | `launch` |
| Crafting | **Continue crafting** | solid | `craft` |
| Not started | **Start crafting** | solid | `craft` |

### Scenario — Business row (`.sc-biz-build`)

| Stage | Label | Style | mode |
|---|---|---|---|
| Live | **Iterate** | bordered default | `iterate` |
| Ready | **Finalize** | `.is-primary` | `launch` |
| Crafting | **Continue crafting** | `.is-primary` | `craft` |
| Not started | **Start crafting** | `.is-primary` | `craft` |

### Agent card (`.ag-cta`) — keep distinct language

| State | Label | Style |
|---|---|---|
| Live | **Try** | positive soft |
| Ready | **Go to publish** | solid `.publish` |
| Draft | **Continue building** | soft `.build` |

Do not force Agent “Try” onto Scenario Live, or Scenario “Iterate” onto Agent Live — different jobs (use vs iterate product).

---

## Display logic

- Light mode only for these demos.  
- English UI for catalogs / notifications (scannable). Account menu ZH/EN toggle; default **EN**.  
- Hairline borders + white surfaces; **no** gray “stacked card on gray tray” for account menu.  
- One job per section: page title + one short desc + toolbar + grid.  

---

## Interaction logic

### Navigation & views

- Sidebar `data-view` switches main catalog; active uses `--selected`  
- Header `<` `>` cycles: `scenario → agent → skill → ontology → mcp → files` (not Market / AI Ops / KB unless product expands)  
- Scenario `+` always visible (not hover-only)  
- Team switcher: spaces + “New project space”; checkmark on current  

### Overlays

- Fixed positioning; one chrome menu at a time  
- Click outside + Escape closes  
- Account/notify: bottom-anchored above trigger; left = sidebar.left + 8px  

### Content vs chrome

- User-supplied screenshots/fields update **CATALOG data / labels only**  
- Do not redesign established card families (`sc` / `ag` / `kb` / `sk` / `on` / `mcp` / `fb`) unless explicitly requested  

---

## Superagent alignment checklist

1. **Tokens**: map new colors/radii/shadows to tables above (or extend `:root` deliberately).  
2. **Density**: 12–13px UI chrome; not oversized marketing type in tools.  
3. **Primary CTA**: near-black, not purple gradient / not brand-red fill.  
4. **Selection**: cool `#e5f4ff`, not purple wash.  
5. **Borders**: `#ececec` / `#e6e6e6` family; cards don’t float on heavy shadows at rest.  
6. **Status**: same Live / Ready / Crafting / Draft language and colors.  
7. **Popovers**: light shadow + 14px radius + hairline.  
8. **English** demo strings unless screen is bilingual.  
9. **No** notification unread dots unless product reopens.  
10. **Layer clarity**: Workbench = assets/spaces; Superagent = craft — don’t duplicate full asset grids inside Superagent without reason.  
11. **Live CTA**: Iterate (scenario) / Try (agent) — never “Go to craft” for Live.  

---

## LOCKED 2026-10-11 · Sidebar list type (Workbench + Workshop)

> One density for left lists / catalog titles so Files tree and scenario cards read as one system.

| Role | Size / weight / line | Notes |
|---|---|---|
| Primary title (app scenario, root folder, kb/sk/on name) | **12 / 500 / 16** | Not 13–15/600 |
| Nested title (biz scenario, indent folder, file name) | **12 / 400 / 16** | Lighter than primary |
| Description | **11 / 400 / 15** | Secondary ink |
| Section kicker (`Materials`, `Related context`) | **12.5 / 600** · brand `#1F82EB` · count `· N` quaternary | Hover reveals upload/new |
| Sidebar tab | **12.5 / 500** | |

**Impl:** Workshop `superagent/css/scene-cards.css` + `file-tree.css` · Workbench `cards-scenario.css` + `cards-assets.css` (kb/sk/on).

---

## LOCKED 2026-10-11 · Files / materials tree (Workshop)

> Material browser under Files tab (not code-explorer-only). Ported structure from personal-space design draft + AgentOS light surface.

| Token / rule | Value | Role |
|---|---|---|
| Label | **12px** | Folder / file name |
| Root folder weight | **500** | Primary |
| Nested / file weight | **400** | Secondary |
| Row pad y | **~1.75px** | ~3.5px between labels |
| Indent-1 | `padding-left: 18px` | Step 12 → 30/42/54 |
| Guide | `1px` · `rgba(15,23,42,0.088)` · `--tree-guide-x: 12px` | Under chevron column (slight offset OK) |
| Folder icon | Outline · root soft blue fill · nested gray stroke | Keep |
| File icon | **14px** type chip (r2.5) · colored face + white glyph | doc blue · md yellow · html orange · xls teal · img violet · ppt orange · txt soft |
| Select | brand active fill **only when selected** | No default selected · hover = brand hover fill |
| Section | `Materials · N` / `Related context · N` | EN demo copy |

**Impl:** `superagent/css/file-tree.css` + `superagent/js/files-panel.js`.  
**Code explorer (React):** `ExplorerTree` / `--ft-*` may stay denser Cursor-style; do not mix chip recipes without intent.

---

## LOCKED 2026-10-10 · Agent turn chrome (AgentOS)

> Name **AgentOS**; avatar is a **mock** ink circle + robot mark.

| Region | Spec |
|---|---|
| Header | 28px circular avatar + **AgentOS** 14/600 (`--ao-dt-label`) |
| Prose | 13px / 1.65 `#303030`; h2/h3 13/650 |
| Code pill | bg `#f0f0f0` r4 |
| Table | border `#ececec` r8; head `#8c8c8c` |
| Footer | copy / up / down / speak / retry / share / more |

---

## LOCKED · Deep thinking (CUI Demo)

> **Source of truth:** [agentos-cui-demo.vercel.app](https://agentos-cui-demo.vercel.app/)  
> Crawl snapshot: `workbench/tokens/refs/cui-demo.*` + extracted CSS.  
> Do not invent a second deep-thinking language.

### Tokens (`--ao-dt-*`)

| Token | Value | Role |
|---|---|---|
| `--ao-dt-text` | `rgba(0,0,0,.88)` | Done status text |
| `--ao-dt-label` | `rgba(0,0,0,.65)` | Agent name / row hover |
| `--ao-dt-desc` | `rgba(0,0,0,.45)` | Thinking labels, deep copy |
| `--ao-dt-fill` | `rgba(0,0,0,.03)` | Row / ghost hover |
| `--ao-dt-border` | `#f0f0f0` | Status done bottom rule |
| `--ao-dt-font` / `--ao-dt-lh` | `13px` / `18px` | Base chrome |
| `--ao-dt-copy-lh` | `24px` | `.deep-thought-copy` |
| `--ao-dt-details-max` | `120px` | Deep thought scroll pane + edge mask |
| `--ao-dt-viewport-max` | `480px` | Process viewport; fixed height while generating |
| `--ao-dt-row-min` | `18px` | Activity row |
| `--ao-dt-status-min` | `28px` | Status row |
| `--ao-dt-ease` | `cubic-bezier(.22,1,.36,1)` | Collapse / chevron |
| `--ao-dt-collapse-ms` | `0.32s` | Open/close |

### Structure

1. **status-row** — generating: shimmer label carousel (`思考中…` / `斟酌中…` … every 3s); done: `用时 Ns` **600** + bottom border  
2. **process-viewport** — max 480; `is-generating` → height 480  
3. **activity-block · deep** — icon `deep-thought.svg` + label `深度思考` (shimmer while running) + hover chevron → `.deep-thought-details` (mask fade) / `.deep-thought-copy`  
4. **activity-block · tool** — same row pattern; details = command log  

**Impl:** `superagent-ui/src/AssistantTurn.tsx` · icons in `public/deep-thought.svg`, `public/activity-chevron.svg`.

---

## Anti-patterns (reject in review)

- Purple-on-white or purple→indigo gradient page themes  
- Warm cream editorial landing aesthetic (`#F4F1EA` + terracotta)  
- Heavy multi-layer shadows / neon glow on menus  
- Progress bars with fake precise % for scenario craft  
- Giant media tiles for file browsers  
- Restyling card chrome when user only sent new field content  
- Interchanging Workbench IA with Workshop IA without an explicit entry  
- Live stage labeled as craft / build entry  

---

## Suggested next hardening (optional)

1. Promote full token block into HTML `:root`; replace top repeated hex (`#111`, `#ececec`, `#fafafa`, status greens).  
2. Collapse ink triad (`#171717` / `#111` / `#1a1a1a`) to `--ink` + optional size variants only.  
3. Extract shared `agentos-tokens.css` if bundling becomes real.  
4. Keep this doc + `.cursor/rules/agentos-ui.mdc` in sync when Workbench tokens change.  
