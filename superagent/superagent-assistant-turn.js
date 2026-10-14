(function (global) {
  var DEMO_THINKING = "Parse the user intent\nThe user gave a verbal task: “analyze an executive’s agent.” This is a typical open-ended analysis ask—not the same as “design an executive Agent” or “write a PRD.”\n\nAmbiguity scan (subject / purpose / deliverable)\n· Subject: an agent an executive already uses, a dedicated agent to build, or external market benchmarks?\n· Purpose: reuse capabilities into AgentOS, evaluate whether it is worth building, or deliver a version for that executive?\n· Deliverable: a one-page conclusion, a capability breakdown, or a shippable Skill / Agent plan?\n\nWithout aligning on those three, deep analysis easily lands on the wrong entity and the whole report gets sent back.\n\nReasoning & strategy\n1. Refuse default assumptions—do not presume a “CEO assistant” or a generic chat wrapper is the goal.\n2. First output a decision-ready structure: ambiguity table → three scenario priorities → six questions the sponsor should answer.\n3. If pressed to “just draft something”: use role → tasks → capabilities (sense / reason / act / boundaries), and map to AgentOS “Scenario insight / Scenario craft.”\n4. Final answer uses structured Markdown (including a table); then attach Four steps to turn open questions into executable next moves.";
  var FOUR_STEPS_GUIDE = [
  {
    step: 1,
    title: 'Clarify the subject',
    desc: 'Lock which executive and which agent—and whether accounts, configs, screenshots, or real chat samples exist.',
    action: 'Confirm names and available materials with the sponsor',
  },
  {
    step: 2,
    title: 'Align on purpose',
    desc: 'Decide whether this is reuse into AgentOS, a go / no-go evaluation, or a dedicated build for one executive.',
    action: 'Write one sentence for “what success looks like”',
  },
  {
    step: 3,
    title: 'Define the deliverable',
    desc: 'One-page conclusion, capability list, or Skill / Agent plan—depth, timeline, and risk differ a lot.',
    action: 'Align deadline, audience, and review format',
  },
  {
    step: 4,
    title: 'Close the loop',
    desc: 'Raise 6 key questions; after inputs land, analyze role → tasks → capabilities → reusable Skills.',
    action: 'Continue breakdown and delivery with Four steps in AgentOS',
  },
];

  
function splitMarkdownBlocks(md) {
  var lines = md.replace(/\r\n/g, '\n').split('\n')
  var blocks = []
  var buf = []
  var inTable = false

  function flush() {
    var text = buf.join('\n').trim()
    if (text) blocks.push(text)
    buf = []
  }

  var inFence = false
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li]
    var trimmed = line.trim()
    var isFence = trimmed.indexOf('```') === 0
    var isTableLine = !inFence && trimmed.indexOf('|') === 0

    if (isFence) {
      if (inTable) {
        flush()
        inTable = false
      }
      buf.push(line)
      if (inFence) {
        flush()
        inFence = false
      } else {
        inFence = true
      }
      continue
    }

    if (inFence) {
      buf.push(line)
      continue
    }

    if (isTableLine) {
      inTable = true
      buf.push(line)
      continue
    }

    if (inTable) {
      flush()
      inTable = false
    }

    if (!trimmed) {
      flush()
      continue
    }

    buf.push(line)
  }

  flush()
  return blocks
}

function splitPlainChunks(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
}


  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderFileChanges(data) {
    if (!data || !data.files || !data.files.length) return '';
    var rows = data.files.map(function (file) {
      return (
        '<div class="file-change-row">' +
        '<span class="file-change-path">' + escapeHtml(file.path) + '</span>' +
        '<span class="file-change-stat"><span class="file-change-add">+' + file.added + '</span><span class="file-change-del">-' + file.removed + '</span></span>' +
        '</div>'
      );
    }).join('');
    return (
      '<div class="file-change-card">' +
      '<div class="file-change-head">' +
      '<div class="file-change-head-left">' +
      '<span class="file-change-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5.5h16v13H4z"/><path d="M8 2.5h8v3H8z"/></svg></span>' +
      '<div class="file-change-title">Edited ' + data.files.length + ' files</div>' +
      '<div class="file-change-sum"><span class="file-change-add">+' + data.added + '</span><span class="file-change-del">-' + data.removed + '</span></div></div>' +
      '<div class="file-change-actions">' +
      '<button type="button" title="Undo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg></button>' +
      '<button type="button" title="Review"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5L20 7"/></svg></button>' +
      '<button type="button" class="file-change-toggle" data-file-toggle>View <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>' +
      '</div></div>' +
      '<div class="file-change-list" hidden>' + rows + '</div>' +
      '</div>'
    );
  }

  function renderFourSteps(steps) {
    var cards = steps.map(function (item) {
      return (
        '<li class="four-step-card">' +
        '<div class="four-step-head"><span class="four-step-num">' + item.step + '</span><span class="four-step-title">' + escapeHtml(item.title) + '</span></div>' +
        '<p class="four-step-desc">' + escapeHtml(item.desc) + '</p>' +
        '<p class="four-step-action">' + escapeHtml(item.action) + '</p>' +
        '</li>'
      );
    }).join('');
    return (
      '<div class="four-steps-guide">' +
      '<div class="four-steps-header">' +
      '<div><p class="four-steps-kicker">Four steps</p><h3 class="four-steps-heading">Run this ask through Four steps</h3></div>' +
      '<p class="four-steps-lead">Turn the sponsor’s verbal ask into an executable chain—avoid deep analysis on the wrong subject.</p>' +
      '</div>' +
      '<ol class="four-steps-list">' + cards + '</ol>' +
      '</div>'
    );
  }

  function runAssistantTurn(options) {
    var chatApi = options.chatApi || global.WORKBUDDY_CHAT || {};
    var onScroll = options.onScroll || function () {};
    var row = document.createElement('div');
    row.className = 'chat-msg-assistant';
    row.innerHTML =
      '<div class="assistant-turn">' +
      '<div class="think-block is-streaming">' +
      '<button type="button" class="think-head" aria-expanded="true">' +
      '<span class="think-spinner" aria-hidden="true"></span>' +
      '<span class="think-head-label">Deep thinking…</span>' +
      '</button>' +
      '<div class="think-body"><pre class="think-pre"></pre></div>' +
      '</div>' +
      '<div class="chat-md chat-prose answer-body" hidden></div>' +
      '</div>';
    options.container.appendChild(row);

    var thinkBlock = row.querySelector('.think-block');
    var thinkHead = row.querySelector('.think-head');
    var thinkLabel = row.querySelector('.think-head-label');
    var thinkPre = row.querySelector('.think-pre');
    var answerEl = row.querySelector('.answer-body');
    var startedAt = Date.now();
    var timers = [];
    var thinkOpen = true;

    function schedule(fn, ms) {
      timers.push(setTimeout(fn, ms));
    }

    thinkHead.addEventListener('click', function () {
      if (thinkBlock.classList.contains('is-streaming')) return;
      thinkOpen = !thinkOpen;
      thinkHead.setAttribute('aria-expanded', thinkOpen ? 'true' : 'false');
      var body = thinkBlock.querySelector('.think-body');
      if (body) body.hidden = !thinkOpen;
      var chevron = thinkHead.querySelector('.think-chevron');
      if (chevron) chevron.classList.toggle('is-open', thinkOpen);
    });

    var thinking = options.thinking || DEMO_THINKING;
    var answer = options.answer || chatApi.DEMO_AGENT_REPLY || '';
    var fourSteps = options.fourSteps;
    if (fourSteps === 'default' || fourSteps == null) fourSteps = FOUR_STEPS_GUIDE;
    var thinkChunks = splitPlainChunks(thinking);
    var answerBlocks = splitMarkdownBlocks(answer);
    var thinkIdx = 0;
    var answerIdx = 0;
    var thinkText = '';

    function finishThink() {
      var secs = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      thinkBlock.classList.remove('is-streaming');
      var doneLabel = options.thinkDoneLabel || ('Thought for ' + secs + 's');
      thinkBlock.classList.add('is-plain');
      thinkHead.innerHTML =
        '<span class="think-head-label">' + escapeHtml(doneLabel) + '</span>' +
        '<span class="think-chevron" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></span>';
      thinkLabel = thinkHead.querySelector('.think-head-label');
      thinkOpen = false;
      thinkHead.setAttribute('aria-expanded', 'false');
      var body = thinkBlock.querySelector('.think-body');
      if (body) body.hidden = true;
      schedule(streamAnswer, 320);
    }

    function streamAnswer() {
      if (answerIdx >= answerBlocks.length) {
        var finalMd = answerEl.getAttribute('data-md') || '';
        if (chatApi.markdownToHtml && finalMd) answerEl.innerHTML = chatApi.markdownToHtml(finalMd);
        var turnRoot = row.querySelector('.assistant-turn');
        if (turnRoot && options.fileChanges) {
          var filesWrap = document.createElement('div');
          filesWrap.innerHTML = renderFileChanges(options.fileChanges);
          if (filesWrap.firstElementChild) {
            var card = filesWrap.firstElementChild;
            turnRoot.appendChild(card);
            var toggle = card.querySelector('[data-file-toggle]');
            var list = card.querySelector('.file-change-list');
            if (toggle && list) {
              toggle.addEventListener('click', function () {
                var hidden = list.hidden;
                list.hidden = !hidden;
                toggle.innerHTML = hidden
                  ? 'Collapse <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>'
                  : 'View <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';
              });
            }
          }
        }
        if (turnRoot && fourSteps && fourSteps.length) {
          var wrap = document.createElement('div');
          wrap.innerHTML = renderFourSteps(fourSteps);
          if (wrap.firstElementChild) turnRoot.appendChild(wrap.firstElementChild);
        }
        onScroll();
        if (typeof options.onComplete === 'function') options.onComplete(row);
        return;
      }
      answerEl.hidden = false;
      var block = answerBlocks[answerIdx++];
      var acc = (answerEl.getAttribute('data-md') || '') + (answerEl.getAttribute('data-md') ? '\n\n' : '') + block;
      answerEl.setAttribute('data-md', acc);
      if (chatApi.markdownToHtml) answerEl.innerHTML = chatApi.markdownToHtml(acc) + '<span class="answer-cursor"></span>';
      onScroll();
      var delay = block.indexOf('|') >= 0 ? 420 : 120 + Math.min(block.length, 280);
      schedule(streamAnswer, delay);
    }

    function streamThink() {
      if (thinkIdx >= thinkChunks.length) {
        thinkPre.textContent = thinkText;
        finishThink();
        onScroll();
        return;
      }
      thinkText += (thinkText ? '\n\n' : '') + thinkChunks[thinkIdx++];
      thinkPre.textContent = thinkText;
      onScroll();
      schedule(streamThink, 160 + Math.random() * 140);
    }

    streamThink();

    return {
      cancel: function () { timers.forEach(clearTimeout); }
    };
  }

  global.WORKBUDDY_ASSISTANT_TURN = { run: runAssistantTurn, DEMO_THINKING: DEMO_THINKING, FOUR_STEPS_GUIDE: FOUR_STEPS_GUIDE };
})(typeof window !== 'undefined' ? window : globalThis);
