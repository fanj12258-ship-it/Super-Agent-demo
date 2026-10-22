/**
 * Fast POC page ONLY — one mutually exclusive demo selector in the composer.
 *   1 / 2 / 3 / 4 → numbered journeys; Journey 1 is the active design route.
 *   Main → existing supplier-sourcing route.
 *   Side → existing enterprise-exploration route (js/fast-company.js).
 * Only shown before the first message of the conversation; the choice is read when Space is pressed.
 */
(function () {
  'use strict';
  var root = document.getElementById('fast-route');
  if (!root) return;
  var selection = '1';
  var input = document.getElementById('composer-input');
  var JOURNEY_ONE_PROMPT = '我们正在接触DJI大疆创新。他们是消费电子与无人机龙头，目前重点看全球渠道销售运营板块，特别是新品首发与紧俏品分货业务，面临头部渠道压货、真实动销口径不清、人工分货例外多且防黄牛难闭环等问题。帮我做一份全景规划，看看切入哪些AI场景合适，并给我一份可以拿去跟客户汇报对齐的材料。';
  var JOURNEY_TWO_PROMPT = '直接帮我新建一个‘研发绩效核算与自评答疑助手’的业务场景，用来核对研发人员季度绩效指标配额、解答考核规则并辅助写绩效自评。';
  var ENTERPRISE_FOLDERS = [
    { name: 'Enterprise Documents', asset: 'documents' },
    { name: 'Business Landscape', asset: 'landscape' },
    { name: 'Scenario Planning', asset: 'planning' }
  ];
  var PLAN_FOLDER_MARK =
    '<span class="dossier-mark is-plan" aria-hidden="true">' +
    '<svg viewBox="0 0 16 16" fill="none">' +
    '<rect x=".6" y=".6" width="14.8" height="14.8" rx="4" fill="#f4f8fd" stroke="#d7e4f2"/>' +
    '<rect x="3.7" y="3.9" width="3.3" height="2.8" rx=".65" stroke="#7aa2d4" stroke-width="1.05"/>' +
    '<rect x="9" y="3.9" width="3.3" height="2.8" rx=".65" stroke="#7aa2d4" stroke-width="1.05"/>' +
    '<rect x="6.35" y="9.25" width="3.3" height="2.8" rx=".65" stroke="#7aa2d4" stroke-width="1.05"/>' +
    '<path d="M5.35 6.8v.75h5.3V6.8M8 7.55v1.7" stroke="#b7cce6" stroke-width="1.05" stroke-linecap="round"/>' +
    '</svg></span>';

  function normalize(value) {
    var next = String(value).toLowerCase();
    return next === 'main' || next === 'side' || /^[1-4]$/.test(next) ? next : '1';
  }

  function usesEnterpriseFolders(journey) {
    return journey === '1' || journey === '2';
  }

  function ensureEnterpriseFolders() {
    if (!window.FastFiles) return;
    window.FastFiles.markFolder('Scenario Planning', {
      icon: PLAN_FOLDER_MARK,
      tag: 'Base'
    });
    ENTERPRISE_FOLDERS.forEach(function (folder) {
      window.FastFiles.addFolder('deliverable', folder.name, {
        open: true,
        animate: false,
        collapsible: false,
        openAsset: folder.asset
      });
    });
  }

  function clearEnterpriseFolders() {
    if (!window.FastFiles) return;
    ENTERPRISE_FOLDERS.forEach(function (folder) {
      window.FastFiles.removeEmptyFolder('deliverable', folder.name);
    });
  }

  function setSelection(value) {
    selection = normalize(value);
    Array.prototype.forEach.call(root.querySelectorAll('button[data-journey]'), function (b) {
      var on = b.getAttribute('data-journey') === selection;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    root.setAttribute('data-journey', selection);
    root.setAttribute('data-route', selection === 'side' ? 'side' : 'main');
    if (window.FastFiles) {
      if (usesEnterpriseFolders(selection)) {
        ensureEnterpriseFolders();
        window.FastFiles.showTab(false);
      } else {
        clearEnterpriseFolders();
        window.FastFiles.showTab(false);
      }
    }
    if (window.EnterpriseAssets && window.EnterpriseAssets.setPlanningAppLimit) {
      /* Journey 2: first Application + first Business only, with J2 copy; others show all. */
      if (selection === '2') {
        window.EnterpriseAssets.setPlanningAppLimit(1, 1);
        if (window.EnterpriseAssets.setPlanningOverride) {
          window.EnterpriseAssets.setPlanningOverride({
            title: 'R&D Performance Intelligence Management',
            badge: 'New',
            scenario: 'Application scenario for R&D performance accounting, policy Q&A, and self-review assistance.',
            biz: {
              title: 'Quarterly Performance Quota & Self-Review Q&A',
              badge: 'New',
              priority: 'Quick Win',
              scenario:
                'Each quarter, R&D managers and engineers spend hours reconciling indicator quotas, interpreting assessment rules, and rewriting self-reviews. Policies are scattered across HR docs and team notes, so answers stay inconsistent and drafts often miss required evidence. This business scenario checks quota allocation against the current policy, answers rule questions with cited criteria, and helps draft a structured self-review ready for submission.',
              rationale:
                'Quick Win with clear near-term POC value: cuts repetitive policy lookup and draft rewriting in every review cycle. Data readiness is moderate (assessment policy + quota tables), so a single-agent assistant can ship without waiting for full enterprise planning. Directly matches the demo ask—quota check, rule Q&A, and self-review support in one runnable flow.',
            },
          });
        }
      } else {
        window.EnterpriseAssets.setPlanningAppLimit(null);
      }
    }
    window.dispatchEvent(new CustomEvent('fastjourneychange', {
      detail: { journey: selection, route: selection === 'side' ? 'side' : 'main' }
    }));
  }

  function keepComposerFocus(e) {
    e.preventDefault();
  }

  function restoreComposerFocus() {
    if (input) input.focus({ preventScroll: true });
  }

  root.addEventListener('mousedown', keepComposerFocus);
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-journey]');
    if (!b) return;
    setSelection(b.getAttribute('data-journey'));
    restoreComposerFocus();
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    var buttons = Array.prototype.slice.call(root.querySelectorAll('button[data-journey]'));
    var current = buttons.indexOf(document.activeElement);
    if (current < 0) {
      current = buttons.findIndex(function (button) {
        return button.getAttribute('data-journey') === selection;
      });
    }
    var delta = e.key === 'ArrowRight' ? 1 : -1;
    var nextIndex = (current + delta + buttons.length) % buttons.length;
    var button = buttons[nextIndex];
    setSelection(button.getAttribute('data-journey'));
    button.focus();
  });

  setTimeout(function () { setSelection('1'); }, 0);
  window.FastRoute = {
    get: function () { return selection === 'side' ? 'side' : 'main'; },
    set: function (route) { setSelection(route === 'side' ? 'side' : 'main'); }
  };
  window.FastJourneyRoute = {
    get: function () { return selection; },
    set: setSelection,
    ensureAssets: ensureEnterpriseFolders,
    prompt: function () {
      if (selection === '1') return JOURNEY_ONE_PROMPT;
      if (selection === '2') return JOURNEY_TWO_PROMPT;
      return '';
    }
  };
  window.FastDemoRoute = window.FastJourneyRoute;
})();
