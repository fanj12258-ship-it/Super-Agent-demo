/* Enter Workshop — sidebar button → Workshop (Super Agent Fast).
   Relative path works over file:// and any static host. */
var WORKSHOP_URL = '../superagent/superagent-fast.html?entry=workshop';

document.getElementById('btnWorkshop').addEventListener('click', function () {
  window.location.href = WORKSHOP_URL;
});

/* Scenario view: "Continue crafting" on the FIRST card (and its business rows) → Super Agent (returning-user page:
   assets already exist, several conversations, the Agent opens with a recap). Other cards stay as they are. */
var RETURNING_URL = '../superagent/superagent.html?entry=workshop';

document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-scene-action][data-scene-mode="craft"]');
  if (!btn) return;
  var card = btn.closest('.sc-app');
  var first = document.querySelector('.sc-grid .sc-app');
  if (!card || card !== first) return;
  window.location.href = RETURNING_URL;
});

// Enterprise cards open their content inside the Workbench pattern.
document.addEventListener('click', function (event) {
  var card = event.target.closest('[data-enterprise-asset]');
  if (card) openEnterpriseAsset(card.dataset.enterpriseAsset);
});
