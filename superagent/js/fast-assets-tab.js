/**
 * Fast POC page ONLY — third left-sidebar tab "Assets" (Skill / MCP / ontology graph), empty by default.
 * files-panel.js already switches the Scenarios / Files panels for any tab index; this only shows/hides the Assets panel.
 */
(function () {
  'use strict';
  var root = document.getElementById('doc-explorer');
  var panel = root && root.querySelector('[data-panel="assets"]');
  if (!panel) return;
  root.querySelectorAll('.sidebar-tabs .sidebar-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { panel.hidden = tab.getAttribute('data-tab') !== 'assets'; });
  });
})();
