Workbench styles (load order = cascade order, matches agentos-workbench.html)

tokens.css            — :root design tokens, base reset, body
layout-sidebar.css    — sidebar 256px, brand / header, nav, team switcher
popovers-notify.css   — account / team / notify popovers (shared chrome), notifications panel, + button on nav item
modal-create-scene.css— new scenario modal + import agent form (.sm*)
main-layout.css       — main pane, top bar, tab buttons, toolbar, grid base
cards-agent.css       — Agent persona cards
cards-scenario.css    — Scenario application + business cards
cards-assets.css      — Knowledge / Skill / Ontology / MCP cards
files.css             — Files hub + drill-down table
empty-states.css      — generic .empty, Market / AI Ops hero + art, page washes (.has-wash / .has-hero)

Rules
- Order matters: it is the original single <style> split at section comments, unchanged. Do not reorder.
- To change one page's look, open that page's file; do not add rules back into the HTML.
- Page backgrounds: .has-wash (content pages, light) / .has-hero (Market & AI Ops, deeper) live in empty-states.css.
