/* Live session inspection — read-only demo data, shared AIOps chrome. */
(function (global) {
  'use strict';
  var host = {};
  var ui = { id: null, tab: 'conversation', format: 'conversation', round: 1, jump: false, traceId: null, inspectorTab: 'io', inspectorOpen: true, query: '', type: '', abnormal: false };
  var cache = {};
  var TYPES = [ ['user', '用户'], ['model', '模型'], ['tool', '工具'], ['ontology', '本体'], ['agent', 'Agent'], ['guard', '安全围栏'], ['memory', '记忆'], ['other', '其他'] ];
  function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ico(name) { return '<i data-lucide="' + name + '"></i>'; }
  function tr(zh, en) { return host.lang && host.lang() === 'en' ? en : zh; }
  function typeLabel(type) { var found = TYPES.filter(function (item) { return item[0] === type; })[0]; return found ? found[1] : type; }
  function badge(type) { return '<span class="sd-type sd-type-' + type + '">' + esc(typeLabel(type)) + '</span>'; }
  function button(action, label, icon, extra) { return '<button type="button" class="btn-soft" data-sd="' + action + '"' + (extra || '') + '>' + ico(icon) + esc(label) + '</button>'; }
  function iconButton(action, label, icon, extra) { return '<button type="button" class="sd-icon" data-sd="' + action + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"' + (extra || '') + '>' + ico(icon) + '</button>'; }
  function currentRow() { return host.row ? host.row(ui.id) : null; }
  function timeAt(end, offset) { return new Date(Date.parse(end.replace(' ', 'T') + ':00+08:00') + offset + 8 * 3600000).toISOString().replace('Z', '+08:00'); }
  function clock(value) { return value.slice(11, 23); }
  function makeData(row) {
    var rounds = Math.ceil(row.messages / 2);
    var duration = row.id === 'CR-1024' ? 82 : Math.max(24, rounds * 4);
    var requestCount = rounds * 8 + 1;
    var prompts = [
      '请展开核验依据，保留规则版本和原始记录位置。',
      '把需要我补充的资料单独列出来，区分已确认和待确认的问题。',
      '请解释资料缺失与核验不通过的区别，避免直接判定业务错误。',
      '请按来源记录逐项复核，说明问题归属和适用的规则。',
      '请整理本轮复核后的待确认项，并列出下一步处理建议。',
      '请核对跨期调整记录，保留调整前后的差异。',
      '请补充来源会话、附件及原始数据的引用位置。',
      '这些结论分别依据哪一版规则？请说明生效范围。',
      '把已经解决的问题排除，只保留仍需业务确认的核验项。',
      '请按影响程度整理问题，说明哪些需要优先核实。',
      '请重新检查关联记录，确认是否存在重复核验。',
      '请汇总当前进展，给出可以直接交接的复核清单。'
    ];
    var initial = row.id === 'CR-1024'
      ? '请审核这份制造业客户的月末管理报表，重点核对预提费用跨期、收入确认和关联方余额。请列出核验依据及需要我确认的问题。'
      : '请分析「' + row.name + '」相关数据，核对原始记录、适用规则和异常情况，并列出需要确认的问题。';
    var firstAnswer = row.id === 'CR-1024'
      ? '已完成对上传报表的初步核验。\n\n1. 预提费用：有 2 笔费用的计提月份与冲回月份需要核对，已关联 R-028 v3。\n2. 收入确认：有 1 笔收入缺少交付确认附件，暂列为待补充证据，未直接判断为确认错误。\n3. 关联方余额：3 组往来余额需与对方对账单交叉核对。\n\n共整理 6 项待复核问题。请补充交付附件及对账单后，由业务负责人确认最终结论。'
      : '已完成「' + row.name + '」的初步分析。\n\n1. 已核对原始数据和适用规则，保留来源记录及版本。\n2. 发现的异常已与执行记录关联，缺失证据单独标记为待确认。\n3. 请由业务负责人补充资料并复核相关结论。';
    var data = { rounds: [], records: [], steps: requestCount, duration: duration, messageCount: row.messages };
    var step = 0, modelIndex = 0, messageIndex = 0, tokensUsed = 0;
    var totalTokens = Math.round(Number(row.tokens) * 1000000);
    function record(type, name, input, output, round, state, elapsed) {
      var isRequest = type !== 'user' && type !== 'other';
      var requestStep = isRequest ? ++step : null;
      var token = 0;
      if (type === 'model') {
        modelIndex += 1;
        token = modelIndex === 1 ? Math.min(327619, totalTokens) : modelIndex === rounds * 3 ? totalTokens - tokensUsed : Math.floor((totalTokens - Math.min(327619, totalTokens)) / Math.max(1, rounds * 3 - 1));
        tokensUsed += token;
      }
      var roundMs = duration * 1000 / rounds;
      var stepInRound = isRequest ? (round === 1 ? requestStep : requestStep - (9 + (round - 2) * 8)) : 0;
      var offset = -duration * 1000 + ((round || 1) - 1) * roundMs + (isRequest ? stepInRound / (round === 1 ? 9 : 8) * roundMs : type === 'other' ? data.records.length < 2 ? (data.records.length - 2) * 20 : 10 : 0);
      var item = { id: row.id + '-trace-' + String(data.records.length + 1).padStart(3, '0'), session_id: row.id, type: type, name: name, round: round || 0, step: requestStep, status: state || 'completed', duration_ms: elapsed || (isRequest ? 320 : 0), tokens: token, timestamp: timeAt(row.time, offset), input: input, output: output };
      data.records.push(item); return item;
    }
    record('other', '初始系统提示词', { agent: row.agent }, '依据给定规则、原始记录与本体对象关系核验；资料缺失时标记待确认。', 0);
    record('other', '已加载审核规则库', { version: 'v3' }, '规则版本、原始文件与来源引用随请求一同保留。', 0);
    for (var i = 1; i <= rounds; i++) {
      var prompt = i === 1 ? initial : prompts[(i - 2) % prompts.length];
      var answer = i === 1 ? firstAnswer : '第 ' + i + ' 轮复核已完成。\n\n' + ['已展开对应来源记录，保留规则 R-028 v3 和原始数据位置。', '缺失的交付证明、调整记录及对账附件已单独列为待补充资料。', '待确认问题已写入核验项清单，补充证据后再确认最终结论。', '已区分已确认事项与待核实事项，未将缺失资料直接判定为业务错误。'][(i - 2) % 4] + '\n\n建议继续补充证据，并由业务负责人确认。';
      var turn = { n: i, input: prompt, output: answer, inputId: row.id + '-msg-' + String(++messageIndex).padStart(3, '0'), inputAt: timeAt(row.time, -duration * 1000 + (i - 1) * duration * 1000 / rounds), outputAt: timeAt(row.time, -duration * 1000 + i * duration * 1000 / rounds), hasOutput: messageIndex < row.messages, attachment: i === 1 ? (row.id === 'CR-1024' ? '制造业_9月管理报表.xlsx' : row.name + '_原始资料.xlsx') : null, signal: i <= Math.max(row.errors, row.warnings), steps: i === 1 ? 9 : 8 };
      if (turn.hasOutput) turn.outputId = row.id + '-msg-' + String(++messageIndex).padStart(3, '0');
      turn.feedback = i === 1 && row.errors > 0 ? { sentiment: 'negative', tags: ['没有帮助', '信息虚假'], comment: row.id === 'CR-1024' ? '这两笔费用已在线下冲回，请先核对补充凭证，再判断是否需要调整。' : '请补充原始证据，并重新核实相关结论。', user: row.user, at: row.time + ':00' } : i === 3 ? { sentiment: 'positive', tags: ['有帮助', '依据清晰'], comment: '来源和待确认项已经说明清楚。', user: row.user, at: row.time + ':00' } : null;
      data.rounds.push(turn);
      record('user', '原始输入', { user: row.user }, prompt, i);
      if (i === 1) record('other', '已加载审核本体', { object_set: '关账核验对象集', version: 'v1.2' }, '本体对象集已就绪。', i);
      record('tool', 'document.parse', { file_name: turn.attachment || '补充核验资料', round: i }, { pages: i === 1 ? 28 : 3, source_refs: [turn.attachment || '补充记录-' + i] }, i);
      record('tool', 'knowledge.search', { query: row.name, rule_version: 'v3' }, i <= row.warnings ? 'RULE_SCOPE_UNCONFIRMED：适用范围需要业务确认。' : { rules: ['R-028 v3', 'R-014 v2'], source_refs: ['规则库 / 月末审核'] }, i, i <= row.warnings ? 'warning' : 'completed');
      record('ontology', 'ontology.query', { object_set: '关账核验对象集', session_id: row.id }, { finding_id: row.id + '-finding-' + i, status: '待确认' }, i);
      record('model', '模型核验推理', { system: '依据给定规则、原始记录与本体对象关系核验；资料缺失时标记待确认。', user: prompt, context: ['R-028 v3', '原始记录', '核验对象集'] }, { finding: '核验项已整理，业务结论待确认。', evidence: ['R-028 v3', row.id + '-finding-' + i] }, i, 'completed', 1560);
      record('ontology', 'ontology.action', { action: '创建待确认核验项', finding_id: row.id + '-finding-' + i }, { saved: true }, i);
      record('tool', 'report.create', { session_id: row.id, round: i, format: 'Markdown' }, i <= row.errors ? 'GATEWAY_TIMEOUT：报告网关超时，已保留核验结果。' : { report_id: 'report_' + row.id.toLowerCase() + '_' + i, status: 'completed' }, i, i <= row.errors ? 'error' : 'completed');
      if (i === 1) record('tool', 'report.create.retry', { session_id: row.id, idempotency_key: row.id + '-report-1' }, { report_id: 'report_' + row.id.toLowerCase() + '_01', status: 'completed' }, i);
      record('model', '整理核验结果', { findings: [row.id + '-finding-' + i], instructions: '保留证据，区分待确认与已确认。' }, answer, i);
      record('model', '原始输出', { conversation_id: row.id, round: i }, turn.hasOutput ? answer : '等待后续输出。', i);
    }
    return data;
  }
  function dataFor(row) { if (!cache[row.id]) cache[row.id] = makeData(row); return cache[row.id]; }
  function reset(id) { ui = { id: id, tab: 'conversation', format: 'conversation', round: 1, jump: false, traceId: null, inspectorTab: 'io', inspectorOpen: true, query: '', type: '', abnormal: false }; }
  function display(value) { return typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
  function rawMessages(row, data) {
    var messages = [];
    data.rounds.forEach(function (turn) {
      messages.push({ id: turn.inputId, role: 'user', user: row.user, created_at: turn.inputAt, content: turn.input, attachments: turn.attachment ? [turn.attachment] : [] });
      if (turn.hasOutput) messages.push({ id: turn.outputId, role: 'assistant', agent: row.agent, created_at: turn.outputAt, content: turn.output, feedback: turn.feedback });
    });
    return { session_id: row.id, agent: row.agent, messages: messages };
  }
  function feedbackHtml(feedback) {
    if (!feedback) return '';
    return '<aside class="sd-feedback"><header><strong>' + tr('用户反馈', 'User feedback') + '</strong><span class="' + (feedback.sentiment === 'negative' ? 'sd-negative' : 'sd-positive') + '">' + ico(feedback.sentiment === 'negative' ? 'thumbs-down' : 'thumbs-up') + tr(feedback.sentiment === 'negative' ? '点踩' : '点赞', feedback.sentiment === 'negative' ? 'Dislike' : 'Like') + '</span><small>' + esc(feedback.user + ' · ' + feedback.at) + '</small></header><div class="sd-feedback-tags">' + feedback.tags.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div><p><span>' + tr('补充说明', 'Comment') + '</span> ' + esc(feedback.comment) + '</p></aside>';
  }
  function messageHtml(row, turn, input) {
    var id = input ? turn.inputId : turn.outputId;
    return '<article class="sd-message' + (input ? ' is-user' : '') + '"><header><span class="sd-avatar' + (input ? '' : ' is-agent') + '">' + (input ? tr('用', 'U') : tr('智', 'A')) + '</span><strong>' + (input ? tr('原始输入', 'Original input') : tr('原始输出', 'Original output')) + '</strong><span class="sd-muted">' + (input ? tr('用户', 'User') : tr('智能体', 'Agent')) + '</span><time>' + esc(clock(input ? turn.inputAt : turn.outputAt)) + '</time>' + iconButton('copy-message', tr('复制消息', 'Copy message'), 'copy', ' data-round="' + turn.n + '" data-role="' + (input ? 'user' : 'assistant') + '"') + '</header><div class="sd-message-body"><p>' + esc(input ? turn.input : turn.output) + '</p>' + (input && turn.attachment ? '<span class="cui-session-ref sd-attachment">' + ico('file-spreadsheet') + esc(turn.attachment) + '</span>' : '') + (!input ? feedbackHtml(turn.feedback) : '') + '</div><footer><code>' + esc(id) + '</code><span>' + tr('原始消息正文', 'Original message') + '</span></footer></article>';
  }
  function conversationHtml(row, data) {
    return '<div class="sd-conversation"><aside class="sd-rounds"><header><strong>' + tr('对话轮次', 'Conversation turns') + '</strong><span>' + data.rounds.length + tr(' 轮', ' turns') + '</span></header><nav aria-label="' + tr('对话轮次', 'Conversation turns') + '">' + data.rounds.map(function (turn) {
      return '<button type="button" data-sd="round" data-round="' + turn.n + '" class="' + (ui.round === turn.n ? 'is-active' : '') + '"' + (ui.round === turn.n ? ' aria-current="true"' : '') + '><span>' + tr('第 ' + turn.n + ' 轮', 'Turn ' + turn.n) + '<i class="sd-round-dot' + (turn.signal ? ' has-signal' : '') + '"></i></span><small>' + esc(turn.input) + '</small></button>';
    }).join('') + '</nav></aside><section class="sd-conversation-main"><header class="sd-panel-heading"><strong>' + tr('全部对话', 'Full conversation') + '</strong><select id="sdRoundSelect" class="cap-select sd-round-select" aria-label="' + tr('跳转对话轮次', 'Jump to turn') + '">' + data.rounds.map(function (turn) { return '<option value="' + turn.n + '"' + (ui.round === turn.n ? ' selected' : '') + '>' + tr('第 ' + turn.n + ' 轮', 'Turn ' + turn.n) + '</option>'; }).join('') + '</select><span>' + data.rounds.length + tr(' 轮 · ', ' turns · ') + row.messages + tr(' 条消息', ' messages') + '</span><div class="ov-segment" role="group" aria-label="' + tr('会话显示方式', 'Conversation format') + '"><button type="button" data-sd="format" data-value="conversation" class="' + (ui.format === 'conversation' ? 'is-active' : '') + '" aria-pressed="' + (ui.format === 'conversation') + '">' + tr('对话', 'Conversation') + '</button><button type="button" data-sd="format" data-value="json" class="' + (ui.format === 'json' ? 'is-active' : '') + '" aria-pressed="' + (ui.format === 'json') + '">JSON</button></div>' + (ui.format === 'json' ? iconButton('copy-conversation', tr('复制会话 JSON', 'Copy conversation JSON'), 'copy') : '') + '</header><div class="sd-conversation-scroll">' + (ui.format === 'json' ? '<pre class="sd-json">' + esc(JSON.stringify(rawMessages(row, data), null, 2)) + '</pre>' : data.rounds.map(function (turn) {
      return '<section class="sd-turn" id="sd-turn-' + turn.n + '"><header><strong>' + tr('第 ' + turn.n + ' 轮', 'Turn ' + turn.n) + '</strong><time>' + esc(clock(turn.inputAt).slice(0, 8)) + '</time><button type="button" data-sd="round-trace" data-round="' + turn.n + '">' + turn.steps + tr(' 个执行步骤', ' steps') + ico('arrow-up-right') + '</button></header>' + messageHtml(row, turn, true) + (turn.hasOutput ? messageHtml(row, turn, false) : '<p class="sd-muted">' + tr('尚无后续输出', 'No response yet') + '</p>') + '</section>';
    }).join('')) + '</div></section></div>';
  }
  function filteredRecords(data) {
    var q = ui.query.trim().toLowerCase();
    return data.records.filter(function (record) { return (!ui.type || record.type === ui.type) && (!ui.abnormal || record.status === 'error' || record.status === 'warning') && (!q || (record.id + ' ' + record.name + ' ' + display(record.input) + ' ' + display(record.output)).toLowerCase().indexOf(q) >= 0); });
  }
  function timelineHtml(data) {
    return '<section class="sd-timeline"><header><strong>' + tr('全程轨迹', 'Full trace') + '</strong><span class="sd-muted">' + tr('按记录顺序', 'In record order') + '</span><div class="sd-timeline-legend">' + TYPES.map(function (type) { var count = data.records.filter(function (r) { return r.type === type[0]; }).length; return '<span class="sd-track-' + type[0] + '"><i></i>' + esc(type[1]) + ' <b>' + count + '</b></span>'; }).join('') + '</div></header><div class="sd-timeline-scroll">' + TYPES.map(function (type) {
      return '<div class="sd-track sd-track-' + type[0] + '"><span>' + esc(type[1]) + '</span><div>' + data.records.map(function (record, index) {
        if (record.type !== type[0]) return '';
        var label = type[1] + ' · ' + record.name + (record.round ? ' · 第 ' + record.round + ' 轮' : '');
        return '<button type="button" data-sd="trace-point" data-id="' + record.id + '" style="--point:' + ((index + 0.5) / data.records.length * 100).toFixed(3) + '%" class="' + (record.id === ui.traceId ? 'is-selected ' : '') + (record.status === 'error' ? 'is-error' : record.status === 'warning' ? 'is-warning' : '') + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"></button>';
      }).join('') + '</div></div>';
    }).join('') + '</div></section>';
  }
  function statusLabel(status) { return status === 'error' ? tr('错误', 'Error') : status === 'warning' ? tr('警告', 'Warning') : tr('已完成', 'Completed'); }
  function inspectorHtml(record) {
    if (!record || !ui.inspectorOpen) return '';
    var main = ui.inspectorTab === 'raw' ? '<pre class="sd-json">' + esc(JSON.stringify(record, null, 2)) + '</pre>' : ui.inspectorTab === 'details' ? '<table class="sd-record-meta"><tbody>' + [ [tr('请求编号', 'Request ID'), record.id], [tr('会话编号', 'Session ID'), record.session_id], [tr('记录类型', 'Type'), typeLabel(record.type)], [tr('操作', 'Operation'), record.name], [tr('状态', 'Status'), statusLabel(record.status)], [tr('时间', 'Timestamp'), record.timestamp], [tr('耗时', 'Duration'), (record.duration_ms / 1000).toFixed(2) + ' 秒'], ['Token', record.tokens.toLocaleString('en-US')], [tr('轮次 / 步骤', 'Turn / step'), (record.round || '—') + ' / ' + (record.step || '—')] ].map(function (pair) { return '<tr><th>' + esc(pair[0]) + '</th><td>' + esc(pair[1]) + '</td></tr>'; }).join('') + '</tbody></table>' : '<section><h3>' + tr('输入', 'Input') + '</h3><pre class="sd-json">' + esc(display(record.input)) + '</pre></section><section><h3>' + tr('输出', 'Output') + '</h3><pre class="sd-json">' + esc(display(record.output)) + '</pre></section>';
    return '<aside class="sd-inspector"><header>' + badge(record.type) + '<span>' + (record.round ? tr('第 ' + record.round + ' 轮', 'Turn ' + record.round) : tr('初始化', 'Initialization')) + (record.step ? ' · ' + tr('第 ' + record.step + ' 步', 'Step ' + record.step) : '') + '</span>' + iconButton('inspector-close', tr('关闭记录详情', 'Close record details'), 'x') + '</header><div class="sd-inspector-summary"><strong>' + esc(record.name) + '</strong><span class="sd-status-' + record.status + '">' + statusLabel(record.status) + '</span><small>' + (record.duration_ms / 1000).toFixed(2) + tr(' 秒', ' seconds') + ' · ' + record.tokens.toLocaleString('en-US') + ' token</small></div><div class="sd-inspector-tabs" role="tablist" aria-label="' + tr('记录详情', 'Record details') + '">' + [ ['io', tr('输入输出', 'Input / output')], ['details', tr('详情', 'Details')], ['raw', tr('原始记录', 'Raw record')] ].map(function (tab) { return '<button type="button" role="tab" data-sd="inspector-tab" data-value="' + tab[0] + '" aria-selected="' + (ui.inspectorTab === tab[0]) + '" class="' + (ui.inspectorTab === tab[0] ? 'is-active' : '') + '">' + tab[1] + '</button>'; }).join('') + '</div><div class="sd-inspector-content" role="tabpanel">' + main + '</div><footer>' + (record.round ? '<button type="button" data-sd="related-conversation" data-round="' + record.round + '">' + tr('查看关联原始会话', 'View original conversation') + ico('arrow-right') + '</button>' : '<span></span>') + iconButton('copy-record', tr('复制记录', 'Copy record'), 'copy', ' data-id="' + record.id + '"') + '</footer></aside>';
  }
  function traceHtml(data) {
    var records = filteredRecords(data);
    if (!records.some(function (r) { return r.id === ui.traceId; })) ui.traceId = records.length ? records[0].id : null;
    var selected = records.filter(function (r) { return r.id === ui.traceId; })[0];
    return '<div class="sd-trace">' + timelineHtml(data) + '<div class="sd-trace-toolbar"><label class="search-field">' + ico('search') + '<input id="sdTraceSearch" type="text" placeholder="' + tr('搜索消息、操作、请求编号或结果', 'Search messages, operations, IDs, or results') + '" aria-label="' + tr('搜索 Trace', 'Search trace') + '" value="' + esc(ui.query) + '"></label><select class="cap-select" id="sdTraceType" aria-label="' + tr('记录类型', 'Record type') + '"><option value="">' + tr('全部记录', 'All records') + '</option>' + TYPES.map(function (type) { return '<option value="' + type[0] + '"' + (ui.type === type[0] ? ' selected' : '') + '>' + type[1] + '</option>'; }).join('') + '</select><label class="session-column-check sd-abnormal"><input type="checkbox" id="sdTraceAbnormal"' + (ui.abnormal ? ' checked' : '') + '>' + tr('仅异常', 'Anomalies only') + '</label><span class="sd-trace-count">' + records.length + ' / ' + data.records.length + tr(' 条记录', ' records') + '</span>' + iconButton('copy-trace', tr('复制当前记录', 'Copy filtered records'), 'copy') + '</div><div class="sd-trace-body"><div class="sd-records" role="region" aria-label="' + tr('Trace 记录', 'Trace records') + '">' + (records.length ? records.map(function (record) {
      var summary = (record.type === 'tool' || record.type === 'ontology' ? display(record.input) + ' → ' : '') + display(record.output);
      return '<button type="button" class="sd-record' + (record.id === ui.traceId ? ' is-selected' : '') + ' sd-record-' + record.status + '" data-sd="trace-record" data-id="' + record.id + '" aria-current="' + (record.id === ui.traceId) + '" title="' + esc(record.name + ' · ' + display(record.output)) + '"><span class="sd-record-round">' + (record.type === 'user' ? tr('第 ' + record.round + ' 轮', 'Turn ' + record.round) : '') + '</span>' + badge(record.type) + '<span class="sd-record-text"><b>' + esc(record.name) + '</b> ' + esc(summary.replace(/\s+/g, ' ')) + '</span><small>' + (record.step ? '#' + record.step : '') + (record.duration_ms ? ' ' + (record.duration_ms / 1000).toFixed(2) + 's' : '') + (record.status !== 'completed' ? ' · ' + statusLabel(record.status) : '') + '</small></button>';
    }).join('') : '<div class="sd-empty"><p>' + tr('没有匹配的记录', 'No matching records') + '</p><button type="button" class="btn-soft" data-sd="trace-reset">' + tr('重置筛选', 'Reset filters') + '</button></div>') + '</div>' + inspectorHtml(selected) + '</div><footer class="sd-trace-footer"><span>' + data.steps + tr(' 个请求步骤', ' request steps') + '</span><span>' + tr('演示数据', 'Demo data') + '</span></footer></div>';
  }
  var savedViews = {};
  function page(row, docked) {
    if (ui.id !== row.id) { if (ui.id) savedViews[ui.id] = Object.assign({}, ui); if (savedViews[row.id]) ui = Object.assign({}, savedViews[row.id]); else reset(row.id); }
    var data = dataFor(row);
    if (!ui.traceId) { var model = data.records.filter(function (record) { return record.type === 'model'; })[0]; ui.traceId = model ? model.id : data.records[0].id; }
    return '<div class="session-detail"><div class="page-heading has-actions sd-heading"><div><h1>' + esc(row.name) + '</h1><div class="sd-session-meta"><code>' + esc(row.id) + '</code>' + iconButton('copy-id', tr('复制会话编号', 'Copy session ID'), 'copy') + '<span>·</span><span>' + esc(row.agent) + '</span><span>·</span><span>' + esc(row.user) + '</span><span class="sd-session-status' + (row.errors || row.warnings ? ' has-signal' : '') + '"><i></i>' + tr('已完成', 'Completed') + (row.errors || row.warnings ? tr(' · 含运行异常', ' · With anomalies') : '') + '</span></div></div><div class="sd-heading-actions">' + (docked ? '' : button('back', tr('返回列表', 'Back to list'), 'arrow-left')) + button('analyze', tr('AI 分析', 'AI analysis'), 'sparkles') + '</div></div><div class="sd-metrics"><span>' + tr('消息 / 对话轮次', 'Messages / turns') + ' <b>' + row.messages + '</b> / ' + data.rounds.length + tr(' 轮', ' turns') + '</span><span>' + tr('token 总用量', 'Total tokens') + ' <b>' + esc(row.tokens) + 'M</b> token</span><span>' + tr('执行步骤 / 总耗时', 'Steps / elapsed') + ' <b>' + data.steps + '</b> / ' + data.duration + tr(' 秒', 's') + '</span><span>' + tr('最近一次时间', 'Latest activity') + ' <b>' + esc(row.time.slice(5)) + '</b></span><span>' + tr('运行信号', 'Runtime signals') + ' <em class="sd-status-error">' + row.errors + tr(' 错误', ' errors') + '</em><em class="sd-status-warning">' + row.warnings + tr(' 警告', ' warnings') + '</em></span></div><div class="sd-tabs" role="tablist" aria-label="' + tr('会话详情', 'Session details') + '">' + [ ['conversation', tr('原始会话', 'Original conversation'), data.rounds.length + tr(' 轮', ' turns'), 'file-text'], ['trace', 'Trace', data.steps + tr(' 步', ' steps'), 'chart-no-axes-combined'] ].map(function (tab) { return '<button type="button" role="tab" data-sd="tab" data-value="' + tab[0] + '" aria-selected="' + (ui.tab === tab[0]) + '" class="' + (ui.tab === tab[0] ? 'is-active' : '') + '">' + ico(tab[3]) + tab[1] + '<small>' + tab[2] + '</small></button>'; }).join('') + '<span>' + tr('演示数据 · 北京时间', 'Demo data · Beijing time') + '</span></div><div class="sd-tab-content" role="tabpanel">' + (ui.tab === 'conversation' ? conversationHtml(row, data) : traceHtml(data)) + '</div></div>';
  }
  function repaint() { if (host.render) host.render(); }
  function afterRender() {
    if (!document.querySelector('.session-detail')) return;
    if (ui.jump) {
      ui.jump = false;
      var target = ui.tab === 'trace' ? document.querySelector('.sd-record[data-id="' + ui.traceId + '"]') : document.getElementById('sd-turn-' + ui.round);
      var scroller = document.querySelector(ui.tab === 'trace' ? '.sd-records' : '.sd-conversation-scroll');
      if (target && scroller) scroller.scrollTop = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      var nav = document.querySelector('.sd-rounds nav');
      var active = nav && nav.querySelector('.is-active');
      if (active) {
        var itemRect = active.getBoundingClientRect(), navRect = nav.getBoundingClientRect();
        if (itemRect.top < navRect.top) nav.scrollTop += itemRect.top - navRect.top;
        else if (itemRect.bottom > navRect.bottom) nav.scrollTop += itemRect.bottom - navRect.bottom;
      }
    }
  }
  function copy(value) {
    if (!navigator.clipboard) { if (host.toast) host.toast(tr('当前浏览器无法复制', 'Clipboard is unavailable')); return; }
    navigator.clipboard.writeText(value).then(function () { if (host.toast) host.toast(tr('已复制', 'Copied')); }).catch(function () { if (host.toast) host.toast(tr('复制失败，请重试', 'Could not copy. Try again.')); });
  }
  document.addEventListener('click', function (e) {
    var control = e.target.closest('[data-sd]');
    if (!control) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var row = currentRow(); if (!row) return;
    var data = dataFor(row), action = control.getAttribute('data-sd'), value = control.getAttribute('data-value'), round = Number(control.getAttribute('data-round')) || 1;
    if (action === 'back') { if (host.back) host.back(); return; }
    if (action === 'analyze') { if (host.analyze) host.analyze(row.id); return; }
    if (action === 'copy-id') { copy(row.id); return; }
    if (action === 'copy-message') { var turn = data.rounds[round - 1]; copy(control.getAttribute('data-role') === 'user' ? turn.input : turn.output); return; }
    if (action === 'copy-conversation') { copy(JSON.stringify(rawMessages(row, data), null, 2)); return; }
    if (action === 'copy-trace') { copy(JSON.stringify(filteredRecords(data), null, 2)); return; }
    if (action === 'copy-record') { var record = data.records.filter(function (item) { return item.id === control.getAttribute('data-id'); })[0]; if (record) copy(JSON.stringify(record, null, 2)); return; }
    var records = document.querySelector('.sd-records'), traceTop = records ? records.scrollTop : 0;
    if (action === 'tab') { ui.tab = value; ui.jump = true; }
    if (action === 'format') { ui.format = value; ui.jump = true; }
    if (action === 'round') { ui.round = round; ui.format = 'conversation'; ui.jump = true; }
    if (action === 'round-trace') { ui.tab = 'trace'; ui.type = ''; ui.query = ''; ui.abnormal = false; var first = data.records.filter(function (item) { return item.round === round && item.step; })[0]; ui.traceId = first.id; ui.inspectorOpen = true; ui.jump = true; }
    if (action === 'trace-record' || action === 'trace-point') { ui.traceId = control.getAttribute('data-id'); ui.inspectorOpen = true; ui.jump = action === 'trace-point'; if (action === 'trace-point') { ui.query = ''; ui.type = ''; ui.abnormal = false; } }
    if (action === 'inspector-close') ui.inspectorOpen = false;
    if (action === 'inspector-tab') ui.inspectorTab = value;
    if (action === 'related-conversation') { ui.tab = 'conversation'; ui.round = round; ui.format = 'conversation'; ui.jump = true; }
    if (action === 'trace-reset') { ui.query = ''; ui.type = ''; ui.abnormal = false; }
    var jumping = ui.jump;
    repaint();
    records = document.querySelector('.sd-records'); if (records && !jumping) records.scrollTop = traceTop;
  });
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'sdTraceSearch' || !e.target.isConnected || e.isComposing) return;
    var pos = e.target.selectionStart; ui.query = e.target.value;
    repaint();
    var field = document.getElementById('sdTraceSearch'); if (field) { field.focus(); field.setSelectionRange(pos, pos); }
  });
  document.addEventListener('compositionend', function (e) {
    if (e.target.id !== 'sdTraceSearch') return;
    ui.query = e.target.value; repaint();
    var field = document.getElementById('sdTraceSearch'); if (field) { field.focus(); field.setSelectionRange(field.value.length, field.value.length); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'sdRoundSelect') { ui.round = Number(e.target.value); ui.format = 'conversation'; ui.jump = true; repaint(); }
    if (e.target.id === 'sdTraceType') { ui.type = e.target.value; repaint(); }
    if (e.target.id === 'sdTraceAbnormal') { ui.abnormal = e.target.checked; repaint(); }
  });
  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest('.sd-tabs [role="tab"], .sd-inspector-tabs [role="tab"]');
    if (!tab || ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
    e.preventDefault();
    var tabs = Array.from(tab.parentElement.querySelectorAll('[role="tab"]')), at = tabs.indexOf(tab);
    var next = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : tabs[(at + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    var selector = '[data-sd="' + next.getAttribute('data-sd') + '"][data-value="' + next.getAttribute('data-value') + '"]';
    next.click(); var target = document.querySelector(selector); if (target) target.focus();
  });
  global.AIOpsSessionDetail = { bind: function (next) { host = next; }, page: page, afterRender: afterRender };
})(window);
