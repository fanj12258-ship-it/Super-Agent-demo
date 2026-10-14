(function (global) {
  function getScenarioDetailMock(item) {
    if (item.id === 'sc-executive') {
      return {
        status: 'Analyzing', statusTone: 'amber',
        goal: 'Turn “analyze an executive agent” into a decision-ready subject, purpose, and deliverable—then advance Four steps.',
        stageLabel: 'Step 1 · Clarify the subject',
        stageDesc: 'Confirm which executive, which agent, and what materials are available.',
        todos: [
          { done: true, text: 'Capture the verbal ask and three layers of ambiguity' },
          { done: true, text: 'Draft the six sponsor questions' },
          { done: false, text: 'Confirm agent name and sample artifacts with sponsor' },
          { done: false, text: 'Align deliverable: one-page conclusion vs capability breakdown' },
        ],
        docs: ['00-Background & open questions.md', '02-Six questions for the sponsor.md', 'Step 1-Clarify the subject.md'],
        activity: [
          { time: 'Today 14:32', text: 'Agent replied with ambiguity breakdown and Four steps frame' },
          { time: 'Today 11:05', text: 'Created scenario and linked executive-agent-analysis' },
        ],
      };
    }
    if (item.id === 'sc-req') {
      return {
        status: 'Insight', statusTone: 'green',
        goal: 'Break the business ask into testable requirement hypotheses and scenario boundaries.',
        stageLabel: 'Requirements clarity',
        stageDesc: 'Align stakeholders, success criteria, and first-release scope.',
        todos: [
          { done: true, text: 'Gather business context and constraints' },
          { done: false, text: 'Publish requirements notes' },
          { done: false, text: 'Flag high-risk assumptions' },
        ],
        docs: ['requirements-notes.md'],
        activity: [{ time: 'Yesterday 16:20', text: 'Referenced the “Requirements analysis” skill from AgentOS' }],
      };
    }
    if (item.id === 'sc-plan') {
      return {
        status: 'Draft', statusTone: 'gray',
        goal: 'Build a capability map and phased roadmap for the landscape-planning Agent.',
        stageLabel: 'Scenario craft · Planning',
        stageDesc: 'Define Agent boundaries, Skill list, and first MVP.',
        todos: [
          { done: false, text: 'Benchmark competitors and internal capabilities' },
          { done: false, text: 'Landscape planning outline v0.1' },
        ],
        docs: ['landscape-outline.md', 'Agent-capability-spec.md'],
        activity: [{ time: '3 days ago', text: 'Scenario created' }],
      };
    }
    return {
      status: 'In progress', statusTone: 'amber',
      goal: item.desc || 'Add scenario goals, deliverables, and acceptance criteria.',
      stageLabel: 'Initialize',
      stageDesc: 'Complete the scenario description and choose a craft path.',
      todos: [
        { done: false, text: 'Fill in scenario goals' },
        { done: false, text: 'Link documents or chats' },
      ],
      docs: [],
      activity: [{ time: 'Just now', text: 'Created scenario “' + item.title + '”' }],
    };
  }

  var STATUS_CLASS = { amber: 'scene-status-amber', green: 'scene-status-green', gray: 'scene-status-gray' };

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderScenarioDetailHtml(item) {
    var d = getScenarioDetailMock(item);
    var todos = d.todos.map(function (t) {
      return (
        '<li class="scene-detail-todo">' +
        '<span class="scene-detail-check' + (t.done ? ' is-done' : '') + '" aria-hidden="true">' + (t.done ? '✓' : '') + '</span>' +
        '<span class="' + (t.done ? 'is-struck' : '') + '">' + escapeHtml(t.text) + '</span></li>'
      );
    }).join('');
    var docs = d.docs.map(function (doc) {
      return '<li><button type="button" class="scene-detail-doc">' + escapeHtml(doc) + '</button></li>';
    }).join('');
    var activity = d.activity.map(function (a) {
      return '<li class="scene-detail-activity"><span class="scene-detail-time">' + escapeHtml(a.time) + '</span><p>' + escapeHtml(a.text) + '</p></li>';
    }).join('');
    return (
      '<div class="scene-detail-back-row">' +
      '<button type="button" class="scene-detail-back" data-scene-back type="button">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>All scenarios</button></div>' +
      '<div class="scene-detail-scroll">' +
      '<div class="scene-detail-head">' +
      '<div class="scene-detail-head-row"><h2 class="scene-detail-title">' + escapeHtml(item.title) + '</h2>' +
      '<span class="scene-detail-status ' + STATUS_CLASS[d.statusTone] + '">' + escapeHtml(d.status) + '</span></div>' +
      '<p class="scene-detail-sub">' + escapeHtml(item.desc) + '</p></div>' +
      '<section class="scene-detail-section"><h3 class="scene-detail-label">Scenario goal</h3><p class="scene-detail-text">' + escapeHtml(d.goal) + '</p></section>' +
      '<section class="scene-detail-section"><h3 class="scene-detail-label">Current stage</h3><p class="scene-detail-stage">' + escapeHtml(d.stageLabel) + '</p><p class="scene-detail-text">' + escapeHtml(d.stageDesc) + '</p></section>' +
      '<section class="scene-detail-section"><h3 class="scene-detail-label">Key todos</h3><ul class="scene-detail-todos">' + todos + '</ul></section>' +
      (d.docs.length ? '<section class="scene-detail-section"><h3 class="scene-detail-label">Linked documents</h3><ul class="scene-detail-docs">' + docs + '</ul></section>' : '') +
      '<section class="scene-detail-section scene-detail-section-last"><h3 class="scene-detail-label">Recent activity</h3><ul class="scene-detail-activity">' + activity + '</ul></section>' +
      '</div>'
    );
  }

  global.WORKBUDDY_SCENARIO_DETAIL = { renderHtml: renderScenarioDetailHtml, getMock: getScenarioDetailMock };
})(typeof window !== 'undefined' ? window : globalThis);
