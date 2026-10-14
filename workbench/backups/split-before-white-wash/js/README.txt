Workbench scripts (classic scripts, order matters; no module / no build step, so file:// works)

data-catalog.js       — VIEWS, EMPTY_HERO copy, nav items, seed CATALOG data
data-files.js         — Files seed data, filesState, shared helpers (escapeHtmlModal, toolbar, listFor)
render-cards.js       — card renderers: Agent, Scenario, Knowledge, Skill, Ontology, MCP, Files
views.js              — RENDERERS, activateView / shiftView / render, Market & AI Ops hero art, nav + tab wiring
popovers-notify.js    — account / team menus, notifications panel (placement, open/close, mock data)
create-scene-modal.js — New scenario modal + sidebar "+" button
import-agent-modal.js  — Import Agent modal
lang-init.js          — language switch + first render('scenario')  — MUST load last

Rules
- All files share ONE global scope (this is the original single IIFE split at section boundaries).
  A file may call functions / read variables from earlier files at any time; top-level code may only
  use things defined in files loaded before it (or its own file).
- New code: put it in the file for that feature; if it is a new feature, add a new file and a <script> line
  before lang-init.js.
- Do not rename top-level variables without grepping all js/ files.
