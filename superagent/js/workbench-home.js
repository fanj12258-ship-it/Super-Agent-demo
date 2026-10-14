/* Home (house icon) → back to Workbench.
   Covers both the sidebar button and the collapsed-sidebar rail button.
   Relative path works over file:// and any static host. */
(function () {
  var WORKBENCH_URL = '../workbench/agentos-workbench.html';
  ['home-workbench', 'home-workbench-rail'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.location.href = WORKBENCH_URL;
    });
  });
})();
