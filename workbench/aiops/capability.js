/* Schedules + artifacts — content from AIOps-Enhance, chrome from this workbench. */
(function (global) {
  'use strict';

  var MODELS = ['deepseek-v4-pro', 'qwen3.7-max', 'kimi-k2.7-code', 'kimi-k3', 'glm-5.3', 'deepseek-v4.1-flash', 'qwen3.8-flash', 'glm-5.3-flash', 'MiniMax-M2.7', 'MiniMax-M3'];
  var DEFAULT_WS = '默认工作区';
  var FOLDERS = ['关账审核智能体'];
  var CONTEXTS = ['核验项明细', '规则变更记录', '成本与性能日报', '最近 7 日会话', '制造业规则被否决原因', '10 月 9 日成本峰值排查', '高频重复提问与用户反馈'];
  var WEEK = ['一', '二', '三', '四', '五', '六', '日'];
  var WIDGET_ART = {
    'cost-perf': 'a-cost',
    'session-md': 'a-review',
    'summary-json': 'a-json',
    'check-items': 'a-findings',
    'rule-log': 'a-rules'
  };

  var seq = 1;
  var host = {
    lang: function () { return 'zh'; },
    t: function (key) { return key; },
    toast: function () {},
    rerender: function () {}
  };

  function uid(prefix) { seq += 1; return prefix + '-' + seq; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function lang() { return host.lang() === 'en' ? 'en' : 'zh'; }
  function tr(zh, en) { return lang() === 'en' ? en : zh; }
  function tt(key) { return host.t ? host.t(key) : key; }
  function ico(name) { return '<i data-lucide="' + name + '"></i>'; }
  function toast(msg) { if (host.toast) host.toast(msg); }
  function rerender(opts) {
    closeArtActionMenu();
    if (!opts || !opts.keepArtFilter) closeArtColumnFilter();
    if (host.rerender) host.rerender(opts);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function format(value) {
    var d = new Date(value);
    if (isNaN(d.getTime())) return String(value || '');
    return ymd(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function businessDay(started) { return ymd(new Date(started.getTime() - 86400000)); }

  var tasks = [
    {
      id: 'task-cost',
      name: '成本与业务指标日报',
      description: '',
      prompt: '每天分析前一自然日的成本、token、平均耗时，按文档解析、规则检索、推理、报告生成拆解；汇总会话数、用户数和报告生成率，写入成本与性能日报。',
      model: 'deepseek-v4.1-flash',
      workspace: '关账审核智能体',
      time: '08:00',
      paused: false,
      output: true,
      inputs: ['最近 7 日会话'],
      schedule: { repeat: 'daily', time: '08:00', weekdays: [1], monthdays: [1], intervalHours: 5, onceAt: '', intervalAnchor: '' },
      outputs: [{ type: '表', name: '成本与性能日报', schema: 'date: date\nagent_id: string\ncost_cny: number\ntokens: integer\navg_duration_s: number\nstage: string\nsessions: integer\nactive_users: integer\nreport_rate: number', format: 'Markdown' }],
      history: [],
      running: false
    },
    {
      id: 'task-extract',
      name: '核验项与规则变更抽取',
      description: '',
      prompt: '提取前一自然日所有关账审核会话的核验项及规则变更事件。Findings 按报告 ID、引用规则和核验内容去重；规则变更按客户、文件版本、用户操作和操作时间去重，来源会话留在执行血缘中。分别更新 核验项明细和规则变更记录，再汇总已撤回、被否决、规则新增与改写指标。',
      model: 'deepseek-v4.1-flash',
      workspace: '关账审核智能体',
      time: '08:15',
      paused: false,
      output: true,
      inputs: ['核验项明细', '规则变更记录'],
      schedule: { repeat: 'daily', time: '08:15', weekdays: [1], monthdays: [1], intervalHours: 5, onceAt: '', intervalAnchor: '' },
      outputs: [
        { type: '表', name: '核验项明细', schema: 'Finding report id: string\nReferred rule: string\ncheck result content: string\nCategory: string\nrule correctness: string\nresult correctness: string', format: 'Markdown' },
        { type: '表', name: '规则变更记录', schema: 'client id: string\nrule file version: string\nuser file content: string\nUser action: string\naction time: datetime', format: 'Markdown' }
      ],
      history: [],
      running: false
    }
  ];

  var arts = [
    {
      id: 'a-cost', taskId: 'task-cost', name: '成本与性能日报', kind: 'table',
      desc: '成本、token、平均耗时及阶段结构 · 按自然日汇总', rows: '28',
      schema: 'date: date\nagent_id: string\ncost_cny: number\ntokens: integer\navg_duration_s: number\nstage: string',
      cols: ['日期', '成本 / CNY', 'token', '平均耗时', '报告生成率'],
      data: [['10-12', '86.40', '12.8M', '42.6s', '94.2%'], ['10-11', '78.20', '11.6M', '40.8s', '93.7%'], ['10-10', '91.10', '13.4M', '46.2s', '92.9%'], ['10-09', '128.50', '18.9M', '58.1s', '90.4%']],
      updatedBy: '定时任务', updatedAt: '2026-10-14 08:02', workspace: '关账审核智能体'
    },
    {
      id: 'a-findings', taskId: 'task-extract', name: '核验项明细', kind: 'table',
      desc: '核验项记录 · 对应 Excel 第二个工作表 Sheet3 第 6 行 B–G 列', rows: '1,286',
      schema: 'Finding report id: string\nReferred rule: string\ncheck result content: string\nCategory: string\nrule correctness: string\nresult correctness: string',
      cols: ['Finding report id', 'Referred rule', 'check result content', 'Category', 'rule correctness', 'result correctness'],
      data: [
        ['CR-1024', 'R-028 v3', '预提费用跨期未冲回', 'reasoning', '待核验', '待核验'],
        ['CR-1023', 'R-014 v2', '收入确认时点不一致', 'user added', '已确认', '已确认'],
        ['CR-1022', 'R-031 v1', '存货减值准备不足', 'reasoning', '已确认', '待核验'],
        ['CR-1021', 'R-008 v2', '关联方余额需对账', 'user added', '已否决', '已撤回']
      ],
      updatedBy: '定时任务', updatedAt: '2026-10-14 08:16', workspace: '关账审核智能体'
    },
    {
      id: 'a-rules', taskId: 'task-extract', name: '规则变更记录', kind: 'table',
      desc: '规则文件与用户操作 · 对应 Excel 第二个工作表 Sheet3 第 11 行 B–F 列', rows: '96',
      schema: 'client id: string\nrule file version: string\nuser file content: string\nUser action: string\naction time: datetime',
      cols: ['client id', 'rule file version', 'user file content', 'User action', 'action time'],
      data: [
        ['CL-008', 'rules_v12', '将预提费用阈值调整为 3%，适用于制造业客户。', 'rewrite', '2026-10-12 16:32'],
        ['CL-021', 'rules_v08', '收入应依据已确认的交付节点进行核验。', 'add', '2026-10-12 14:18'],
        ['CL-008', 'rules_v11', '移除该客户不适用的税务规则。', 'remove', '2026-10-12 11:43']
      ],
      updatedBy: '定时任务', updatedAt: '2026-10-14 08:16', workspace: '关账审核智能体'
    },
    {
      id: 'a-advice', name: '制造业规则优化建议.md', kind: 'file', workspace: '关账审核智能体',
      desc: '工作区探索结果 · 含会话引用与待审核建议', rows: '文件',
      schema: 'Markdown', updatedBy: 'Feng Zhu', updatedAt: '2026-10-14 15:20',
      cols: ['章节', '内容', '状态'],
      data: [['高频问题', '跨期预提费用规则被否决 8 次', '待业务审核'], ['建议', '按行业设置阈值与生效日期', '待验证']]
    },
    {
      id: 'a-review', name: '会话质量复盘.md', kind: 'file', workspace: null,
      desc: '会话质量与待验证问题的汇总', rows: '文件', schema: 'Markdown',
      updatedBy: 'Feng Zhu', updatedAt: '2026-10-14 14:10', cols: ['章节', '内容'],
      data: [['复盘范围', '最近 7 日的工作区分析会话'], ['主要发现', '规则适用范围和用户纠正需要结合来源会话复核。'], ['后续行动', '在工作区中引用相关文档，补充业务证据后继续分析。']]
    },
    {
      id: 'a-json', name: '分析摘要.json', kind: 'file', workspace: null,
      desc: '工作区分析结果的结构化摘要', rows: '文件', schema: 'JSON',
      updatedBy: 'Feng Zhu', updatedAt: '2026-10-13 18:30', cols: ['字段', '值'],
      data: [['scope', '最近 7 日会话'], ['status', '待业务验证'], ['source', '工作区分析']]
    },
    {
      id: 'a-check', name: '规则优化复核清单', kind: 'table', workspace: '关账审核智能体',
      desc: '跟踪工作区规则复核事项', rows: '2', updatedBy: 'amy.chen', updatedAt: '2026-10-13 16:45',
      schema: 'rule_id: string\nissue: string\nstatus: string',
      cols: ['rule_id', 'issue', 'status'],
      data: [['R-028', '核对制造业阈值适用范围', '待验证'], ['R-014', '补充收入确认依据', '处理中']]
    }
  ];

  var ui = {
    taskQuery: '',
    taskFilter: 'all',
    listTab: 'tasks',
    searchOpen: false,
    composing: false,
    pointerDown: false,
    taskDetailId: null,
    runId: null,
    taskPreview: null,
    menu: null,
    createOpen: false,
    editor: null,
    keepEditor: null,
    pendingTask: null,
    pendingArtifact: null,
    filters: { query: '', type: [], by: [], sort: 'updated-desc', source: 'all' },
    artSearchOpen: false,
    artFilterMenu: null,
    artActionMenu: null,
    selected: [],
    collapsed: {},
    artifactPreview: null,
    artifactEdit: null,
    move: null,
    confirm: null,
    refs: [],
    focus: null
  };

  function taskById(id) {
    for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) return tasks[i];
    return null;
  }
  function artById(id) {
    for (var i = 0; i < arts.length; i++) if (arts[i].id === id && !arts[i].deleted) return arts[i];
    return null;
  }
  function findRun(id) {
    for (var i = 0; i < tasks.length; i++) {
      var hist = tasks[i].history || [];
      for (var j = 0; j < hist.length; j++) if (hist[j].id === id) return hist[j];
    }
    return null;
  }
  function artifactKind(a) { return a.kind === 'file' || a.rows === '文件' ? 'file' : 'table'; }
  function artifactType(a) {
    if (artifactKind(a) === 'table') return tr('数据表', 'Table');
    var schema = a.schema || '';
    var name = a.name || '';
    if (/markdown/i.test(schema) || /\.md$/i.test(name)) return 'Markdown';
    if (/json/i.test(schema) || /\.json$/i.test(name)) return 'JSON';
    if (/csv/i.test(schema) || /\.csv$/i.test(name)) return 'CSV';
    return 'Markdown';
  }
  function artifactWorkspace(a) {
    return a.workspace && workspaceChoices().indexOf(a.workspace) >= 0 ? a.workspace : global.AIOpsWorkspaces.defaultName();
  }
  function workspaceChoices() {
    return global.AIOpsWorkspaces ? global.AIOpsWorkspaces.names() : [DEFAULT_WS].concat(FOLDERS);
  }
  function stamp(value) {
    if (!value) return 0;
    var d = new Date(String(value).replace(' ', 'T'));
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }
  function displayName(name) {
    var v = tt(name);
    return v || name;
  }
  function historyLabel(value) {
    var d = new Date(value);
    var day = ymd(d);
    var today = ymd(new Date());
    var yest = ymd(new Date(Date.now() - 86400000));
    var prefix = day === today ? tr('今天 ', 'Today ') : day === yest ? tr('昨天 ', 'Yesterday ') : '';
    return prefix + (d.getMonth() + 1) + tr('月', '/') + d.getDate() + tr('日 ', ' ') + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function scheduleSummary(task) {
    var s = task.schedule || { repeat: 'daily', time: task.time || '09:00' };
    if (s.repeat === 'interval') return tr('每隔 ', 'Every ') + s.intervalHours + tr(' 小时', ' h');
    if (s.repeat === 'once') return tr('单次 ', 'Once ') + String(s.onceAt || '').replace('T', ' ');
    if (s.repeat === 'weekly') return tr('每周', 'Weekly ') + (s.weekdays || [1]).map(function (d) { return WEEK[d - 1] || d; }).join('、') + ' ' + (s.time || '');
    if (s.repeat === 'monthly') return tr('每月 ', 'Monthly ') + (s.monthdays || [1]).join('、') + tr(' 日 ', ' ') + (s.time || '');
    return tr('每天 ', 'Daily ') + (s.time || task.time || '');
  }
  function atTime(day, time) {
    var p = String(time || '09:00').split(':');
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(p[0]) || 0, Number(p[1]) || 0, 0, 0);
  }
  function nextTaskDate(task, now) {
    var s = task.schedule || { repeat: 'daily', time: task.time || '09:00' };
    now = now || new Date();
    if (s.repeat === 'once') {
      if (!s.onceAt) return null;
      var once = new Date(s.onceAt);
      return once > now ? once : null;
    }
    if (s.repeat === 'interval') {
      var hours = Number(s.intervalHours) || 0;
      if (hours < 1) return null;
      var anchor = s.intervalAnchor ? new Date(s.intervalAnchor) : now;
      if (isNaN(anchor.getTime())) anchor = now;
      if (anchor > now) return anchor;
      var step = hours * 3600000;
      var n = Math.floor((now - anchor) / step) + 1;
      return new Date(anchor.getTime() + n * step);
    }
    var time = s.time || task.time || '09:00';
    if (s.repeat === 'weekly') {
      var days = (s.weekdays && s.weekdays.length ? s.weekdays : [1]).slice();
      for (var i = 0; i < 21; i++) {
        var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        var wd = day.getDay() === 0 ? 7 : day.getDay();
        if (days.indexOf(wd) < 0) continue;
        var dt = atTime(day, time);
        if (dt > now) return dt;
      }
      return null;
    }
    if (s.repeat === 'monthly') {
      var md = (s.monthdays && s.monthdays.length ? s.monthdays : [1]).slice().sort(function (a, b) { return a - b; });
      for (var m = 0; m < 14; m++) {
        var base = new Date(now.getFullYear(), now.getMonth() + m, 1);
        var dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
        for (var k = 0; k < md.length; k++) {
          if (md[k] > dim) continue;
          var dtm = atTime(new Date(base.getFullYear(), base.getMonth(), md[k]), time);
          if (dtm > now) return dtm;
        }
      }
      return null;
    }
    var todayAt = atTime(now, time);
    return todayAt > now ? todayAt : new Date(todayAt.getTime() + 86400000);
  }
  function nextLabel(task) {
    var now = new Date();
    if (task.paused) return tr('暂停期间不执行', 'Paused');
    if (task.completedOnce) return tr('已执行完成', 'Completed');
    var next = nextTaskDate(task, now);
    if (!next) return (task.schedule && task.schedule.repeat === 'once') ? tr('执行时间已过', 'Time has passed') : tr('暂无可执行时间', 'No upcoming run');
    var minutes = Math.max(1, Math.ceil((next - now) / 60000));
    if (minutes < 60) return minutes + tr('分钟后执行', ' min');
    if (minutes < 1440) return Math.ceil(minutes / 60) + tr('小时后执行', ' h');
    return Math.ceil(minutes / 1440) + tr('天后执行', ' d');
  }
  function nextAbsolute(task) {
    if (task.paused) return tr('暂停期间不执行', 'Paused');
    if (task.completedOnce) return tr('已执行完成', 'Completed');
    var next = nextTaskDate(task, new Date());
    return next ? format(next) : nextLabel(task);
  }
  function statusText(status) {
    return {
      running: tr('执行中', 'Running'),
      completed: tr('已完成', 'Completed'),
      paused: tr('已暂停', 'Paused'),
      failed: tr('执行失败', 'Failed')
    }[status] || status;
  }
  function pill(status) {
    var tone = status === 'completed' ? 'ok' : status === 'failed' ? 'bad' : status === 'running' ? 'run' : 'warn';
    return '<span class="cap-pill is-' + tone + '">' + esc(statusText(status)) + '</span>';
  }
  function chip(a) {
    var type = artifactType(a);
    if (type === 'JSON') return '<span class="widget-file-chip is-json">' + ico('code-2') + '</span>';
    if (type === 'Markdown') return '<span class="widget-file-chip is-md">MD</span>';
    if (type === 'CSV') return '<span class="widget-file-chip is-md">CSV</span>';
    return '<span class="widget-file-chip is-table">' + ico('table-2') + '</span>';
  }
  function artMeta(a) {
    if (artifactKind(a) === 'file') return tr('产出物 · ', 'File · ') + artifactType(a);
    return tr('数据表 · ', 'Table · ') + (a.rows || (a.data || []).length) + tr(' 条记录', ' rows');
  }
  function heading(title, sub) {
    return '<div class="page-heading"><h1>' + esc(title) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>';
  }
  function runSummary(record) {
    if (record.status === 'running') return tr('正在读取任务配置和输入数据，完成分析后将更新执行结果与产出物。', 'Reading the task setup and inputs.');
    if (record.status === 'paused') return tr('本次执行已暂停，保留已完成的执行步骤。本次尚未生成产出物。', 'This run is paused. No artifacts were written.');
    if (record.status === 'failed') return tr('读取会话数据时发生超时，本次执行未完成，未生成产出物。', 'Session data timed out. This run produced no artifacts.');
    var names = (record.outputNames || []).filter(Boolean).join('、');
    var tail = names ? tr('已生成「', 'Wrote ') + names + tr('」，可查看本次执行对应的数据快照。', '.') : tr('本次未配置输出。', 'No output was configured.');
    if (String(record.taskName).indexOf('成本') >= 0) {
      return tr('已完成 ', 'Finished ') + record.businessDate + tr(' 的成本与业务指标汇总，分析 ', ' cost and business metrics across ') + record.inputCount + tr(' 个会话，归集 Token 消耗及文档解析、规则检索、推理和报告生成阶段数据。缓存命中率为 82.6%，文档解析是本次主要的 Token 消耗来源。', ' sessions. Cache hit rate 82.6%; document parsing drove most token use. ') + tail;
    }
    if (String(record.taskName).indexOf('核验项') >= 0) {
      return tr('已完成 ', 'Finished ') + record.businessDate + tr(' 的核验项与规则变更抽取。从 ', ' check-item and rule-change extraction from ') + record.inputCount + tr(' 个来源会话中提取 4 条核验项和 3 条规则变更，按来源会话、规则版本与操作时间去重，保留业务日期和执行来源。', ' sessions: 4 findings and 3 rule changes, deduped by session, version, and time. ') + tail;
    }
    return tr('已按「', 'Finished ') + record.taskName + tr('」的提示词完成输入读取、分析处理和结果整理。', '. ') + tail;
  }
  function schemaCols(schema) {
    var cols = [];
    String(schema || '').split('\n').forEach(function (line) {
      var m = line.match(/^\s*([^:\n]+?)\s*:\s*(string|number|integer|boolean|date|datetime)\b/i);
      if (m) cols.push(m[1].trim());
    });
    return cols;
  }
  function schemaRows(a) {
    var rows = [];
    String(a.schema || '').split(/\n|·/).forEach(function (part) {
      var m = part.trim().match(/^([^:]+):\s*(string|number|integer|boolean|date|datetime)(?:\s*\/\/\s*(.*))?$/i);
      if (m) rows.push([m[1].trim(), m[2], m[3] || '—']);
    });
    if (!rows.length && artifactKind(a) === 'file') {
      rows.push([tr('文件类型', 'File type'), artifactType(a), tr('输出格式', 'Format')], [tr('文件名', 'File name'), a.name, tr('产出物名称', 'Artifact name')]);
    }
    if (!rows.length) (a.cols || []).forEach(function (name) { rows.push([name, '—', tr('原型数据字段', 'Demo field')]); });
    return rows;
  }
  function createRecord(task, trigger, started) {
    var record = {
      id: uid('run'),
      taskId: task.id,
      taskName: task.name,
      prompt: task.prompt || task.description || '',
      startedAt: started.toISOString(),
      finishedAt: null,
      status: 'running',
      trigger: trigger,
      businessDate: businessDay(started),
      inputCount: 48,
      outputNames: task.output ? (task.outputs || []).map(function (o) { return o.name; }) : [],
      artifactIds: []
    };
    record.summary = runSummary(record);
    return record;
  }
  function makeRunArtifacts(record, task) {
    if (!task.output || record.artifactIds.length) return;
    (task.outputs || []).forEach(function (output, index) {
      var base = null;
      arts.forEach(function (a) {
        if (!base && !a.deleted && !a.runSnapshot && a.taskId === task.id && a.name === output.name) base = a;
      });
      var art;
      if (output.type === '文件') {
        art = {
          kind: 'file', rows: '文件', schema: (output.format || 'Markdown') + ' · ' + output.name,
          cols: [tr('章节', 'Section'), tr('内容', 'Content')],
          data: [[tr('执行结果', 'Result'), record.summary], [tr('业务日期', 'Business date'), record.businessDate], [tr('执行时间', 'Run time'), format(record.startedAt)]]
        };
      } else if (base && base.data && base.data.length) {
        var data = clone(base.data);
        if (task.id === 'task-cost' && data[0]) data[0][0] = record.businessDate.slice(5);
        art = { kind: 'table', rows: String(data.length), schema: base.schema || output.schema, cols: clone(base.cols), data: data };
      } else {
        var cols = schemaCols(output.schema);
        if (!cols.length) cols = [tr('业务日期', 'Business date'), tr('执行结果', 'Result')];
        art = {
          kind: 'table', rows: '1', schema: output.schema, cols: cols,
          data: [cols.map(function (_c, i) { return i === 0 ? record.businessDate : tr('本次任务分析结果', 'Run result'); })]
        };
      }
      art.id = record.id + '-o' + index;
      art.name = output.name;
      art.taskId = task.id;
      art.runId = record.id;
      art.runSnapshot = true;
      art.workspace = task.workspace;
      art.updatedBy = tr('定时任务', 'Schedule');
      art.updatedAt = format(record.finishedAt || new Date());
      art.desc = tr('本次执行快照 · ', 'Run snapshot · ') + format(record.startedAt) + tr(' · 业务日 ', ' · ') + record.businessDate;
      arts.push(art);
      record.artifactIds.push(art.id);
    });
  }
  function seedHistory() {
    tasks.forEach(function (task, index) {
      var now = new Date();
      var parts = String(task.time || '08:00').split(':');
      var latest = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(parts[0]) || 0, Number(parts[1]) || 0, 0, 0);
      var shift = latest > now ? 1 : 0;
      for (var days = 0; days < 3; days++) {
        var started = new Date(latest.getTime() - (days + shift) * 86400000);
        var record = createRecord(task, tr('定时触发', 'Scheduled'), started);
        record.inputCount = 48 - days * 4;
        record.status = index === 1 && days === 2 ? 'failed' : 'completed';
        record.finishedAt = new Date(started.getTime() + (index === 0 ? 32000 : 46000)).toISOString();
        record.summary = runSummary(record);
        if (record.status === 'completed') makeRunArtifacts(record, task);
        task.history.push(record);
      }
    });
  }
  seedHistory();

  function duration(record) {
    if (!record.finishedAt) return '—';
    var seconds = Math.max(0, Math.round((new Date(record.finishedAt) - new Date(record.startedAt)) / 1000));
    if (seconds < 60) return seconds + tr(' 秒', 's');
    return Math.floor(seconds / 60) + tr(' 分 ', 'm ') + (seconds % 60) + tr(' 秒', 's');
  }
  function switchHtml(task) {
    return '<button type="button" class="cap-switch" role="switch" aria-checked="' + (!task.paused) + '" data-cap="task-toggle" data-id="' + esc(task.id) + '" title="' + esc(task.paused ? tr('开启定时任务', 'Enable') : tr('暂停定时任务', 'Pause')) + '" aria-label="' + esc(displayName(task.name)) + '"><span></span></button>';
  }
  function menuHtml() {
    if (!ui.menu) return '';
    var task = taskById(ui.menu.id);
    if (!task) return '';
    var items = [
      [task.running ? tr('执行中', 'Running') : tr('立即执行', 'Run now'), task.running ? 'busy' : 'run'],
      task.running ? [tr('暂停本次执行', 'Pause this run'), 'pause'] : null,
      [task.paused ? tr('开启定时任务', 'Enable schedule') : tr('暂停定时任务', 'Pause schedule'), 'toggle'],
      [tr('编辑', 'Edit'), 'edit'],
      [tr('查看执行记录', 'View runs'), 'history'],
      [tr('删除', 'Delete'), 'delete']
    ].filter(Boolean);
    return '<div class="cap-menu" role="menu" style="left:' + ui.menu.x + 'px;top:' + ui.menu.y + 'px">' +
      items.map(function (item) {
        return '<button type="button" role="menuitem" data-cap="task-action" data-act="' + item[1] + '" data-id="' + esc(task.id) + '"' + (item[1] === 'delete' ? ' class="is-danger"' : '') + '>' + esc(item[0]) + '</button>';
      }).join('') + '</div>';
  }
  function visibleTasks() {
    var q = ui.taskQuery.trim().toLowerCase();
    return tasks.filter(function (t) {
      var blob = (t.name + ' ' + (t.description || '') + ' ' + (t.prompt || '')).toLowerCase();
      return !q || blob.indexOf(q) >= 0;
    });
  }
  function allRuns() {
    var q = ui.taskQuery.trim().toLowerCase();
    var rows = [];
    tasks.forEach(function (task) {
      (task.history || []).forEach(function (record) {
        var blob = (task.name + ' ' + (record.summary || '') + ' ' + (record.trigger || '') + ' ' + (record.status || '')).toLowerCase();
        if (!q || blob.indexOf(q) >= 0) rows.push({ task: task, record: record });
      });
    });
    rows.sort(function (a, b) { return new Date(b.record.startedAt) - new Date(a.record.startedAt); });
    return rows;
  }
  function searchControl() {
    var label = ui.listTab === 'runs' ? tr('搜索运行记录', 'Search runs') : tr('搜索定时任务', 'Search schedules');
    if (ui.searchOpen || ui.taskQuery.trim()) {
      return '<label class="search-field cap-search-field">' + ico('search') +
        '<input id="capTaskSearch" type="text" data-cap="task-query" placeholder="' + esc(label) + '" value="' + esc(ui.taskQuery) + '" aria-label="' + esc(label) + '" autocomplete="off"></label>';
    }
    return '<button type="button" class="fb-tool" data-cap="task-search-open" title="' + esc(label) + '" aria-label="' + esc(label) + '">' + ico('search') + '</button>';
  }
  function createSplit() {
    return '<div class="cap-split">' +
      '<button type="button" class="btn-ink" data-cap="task-create-manual">' + ico('plus') + ' ' + esc(tr('新建', 'New')) + '</button>' +
      '<button type="button" class="btn-ink cap-split-chev" data-cap="task-create-menu" aria-haspopup="menu" aria-label="' + esc(tr('展开新建方式', 'More ways to create')) + '" aria-expanded="' + (ui.createOpen ? 'true' : 'false') + '">' + ico('chevron-down') + '</button>' +
      (ui.createOpen
        ? '<div class="cap-pop" role="menu"><button type="button" role="menuitem" data-cap="task-create-manual">' + ico('plus') + ' ' + esc(tr('手动新建', 'New manually')) + '</button><button type="button" role="menuitem" data-cap="task-create-chat">' + ico('message-square-plus') + ' ' + esc(tr('对话新建', 'New in chat')) + '</button></div>'
        : '') +
    '</div>';
  }
  function listTabs() {
    var tabs = [['tasks', tr('定时任务', 'Schedules')], ['runs', tr('运行记录', 'Runs')]];
    return '<div class="ov-segment cap-list-tabs" role="tablist" aria-label="' + esc(tr('定时任务视图', 'Schedule view')) + '">' +
      tabs.map(function (tab) {
        var on = ui.listTab === tab[0];
        return '<button type="button" role="tab" data-cap="task-tab" data-value="' + tab[0] + '" class="' + (on ? 'is-active' : '') + '" aria-selected="' + on + '">' + esc(tab[1]) + '</button>';
      }).join('') +
    '</div>';
  }
  function taskCards(items) {
    if (!items.length) {
      return '<div class="cap-empty"><h3>' + esc(tasks.length ? tr('没有符合条件的定时任务', 'No matching schedules') : tr('暂无定时任务', 'No schedules yet')) + '</h3><p>' + esc(tasks.length ? tr('尝试调整搜索关键词。', 'Try another search.') : tr('点击「新建」，填写调度、模型和输出。', 'Create a schedule with a model and outputs.')) + '</p></div>';
    }
    return '<div class="cap-grid">' + items.map(function (t) {
      var blurb = t.description || t.prompt || tr('暂无描述', 'No description');
      return '<article class="cap-card" role="link" tabindex="0" data-cap="task-open" data-id="' + esc(t.id) + '" aria-label="' + esc(tr('查看', 'View ') + displayName(t.name)) + '">' +
        '<div class="cap-card-top"><h2 title="' + esc(displayName(t.name)) + '">' + esc(displayName(t.name)) + '</h2><div class="cap-card-tools">' + switchHtml(t) +
        '<button type="button" class="cap-icon-btn" data-cap="task-menu" data-id="' + esc(t.id) + '" aria-label="' + esc(displayName(t.name) + tr('的更多操作', ' actions')) + '">' + ico('ellipsis') + '</button></div></div>' +
        '<p class="cap-desc" title="' + esc(blurb) + '">' + esc(blurb) + '</p>' +
        '<div class="cap-schedule"><span title="' + esc(scheduleSummary(t)) + '">' + esc(scheduleSummary(t)) + '</span><span title="' + esc(nextAbsolute(t)) + '">' + esc(nextLabel(t)) + '</span></div>' +
        (t.running ? '<span class="cap-running"><i></i>' + esc(tr('执行中', 'Running')) + '</span>' : '') +
      '</article>';
    }).join('') + '</div>';
  }
  function runRows(rows) {
    if (!rows.length) {
      var any = tasks.some(function (t) { return (t.history || []).length; });
      return '<div class="cap-empty"><h3>' + esc(any ? tr('没有符合条件的运行记录', 'No matching runs') : tr('暂无运行记录', 'No runs yet')) + '</h3><p>' + esc(any ? tr('尝试调整搜索关键词。', 'Try another search.') : tr('任务执行后，会在这里汇总每次运行。', 'Runs appear here after a task executes.')) + '</p></div>';
    }
    return '<div class="cap-runs">' + rows.map(function (row) {
      var r = row.record;
      return '<button type="button" class="cap-run-row" data-cap="run-open" data-id="' + esc(r.id) + '">' +
        '<span class="cap-run-row-main"><b>' + esc(displayName(row.task.name)) + '</b><small>' + esc(historyLabel(r.startedAt) + ' · ' + r.trigger + ' · ' + duration(r)) + '</small></span>' +
        pill(r.status) + ico('chevron-right') + '</button>';
    }).join('') + '</div>';
  }
  function listPage() {
    return '<div class="page-heading has-actions cap-list-head"><h1>' + esc(tt('定时任务')) + '</h1>' +
      '<div class="cap-heading-actions">' + searchControl() + createSplit() + '</div></div>' +
      listTabs() +
      (ui.listTab === 'runs' ? runRows(allRuns()) : taskCards(visibleTasks())) +
      menuHtml();
  }
  function produced(task) {
    var ids = {};
    (task.history || []).forEach(function (r) { (r.artifactIds || []).forEach(function (id) { ids[id] = true; }); });
    return arts.filter(function (a) {
      if (a.deleted || a.templateOnly) return false;
      if (ids[a.id]) return true;
      return a.taskId === task.id && !a.runSnapshot;
    }).sort(function (a, b) { return stamp(b.updatedAt) - stamp(a.updatedAt); });
  }
  function artifactButton(a, capName) {
    return '<button type="button" class="cap-art" data-cap="' + capName + '" data-id="' + esc(a.id) + '">' + chip(a) +
      '<span><b>' + esc(displayName(a.name)) + '</b><small>' + esc(artMeta(a)) + '</small></span>' + ico('chevron-right') + '</button>';
  }
  function detailPage() {
    var task = taskById(ui.taskDetailId);
    if (!task) { ui.taskDetailId = null; return listPage(); }
    var records = (task.history || []).slice().sort(function (a, b) { return new Date(b.startedAt) - new Date(a.startedAt); });
    var artifacts = produced(task);
    var groups = [];
    var seen = {};
    artifacts.forEach(function (a) {
      var record = a.runId ? findRun(a.runId) : null;
      var label = record ? historyLabel(record.startedAt) : tr('任务产出', 'Task output');
      if (seen[label] == null) { seen[label] = groups.length; groups.push([label, []]); }
      groups[seen[label]][1].push(a);
    });
    return '<button type="button" class="btn-soft cap-back" data-cap="task-back">' + ico('arrow-left') + ' ' + esc(tr('返回定时任务', 'Back to schedules')) + '</button>' +
      '<div class="page-heading has-actions cap-detail-head"><div class="page-heading-main"><h1>' + esc(displayName(task.name)) + '</h1><p>' + esc(task.description || task.prompt || tr('暂无描述', 'No description')) + '</p></div>' +
      '<div class="cap-detail-actions">' + switchHtml(task) +
        '<button type="button" class="btn-soft" data-cap="task-action" data-act="edit" data-id="' + esc(task.id) + '">' + ico('pencil') + ' ' + esc(tr('编辑', 'Edit')) + '</button>' +
        (task.running
          ? '<button type="button" class="btn-soft" data-cap="task-action" data-act="pause" data-id="' + esc(task.id) + '">' + esc(tr('暂停本次执行', 'Pause this run')) + '</button>'
          : '<button type="button" class="btn-ink" data-cap="task-action" data-act="run" data-id="' + esc(task.id) + '">' + ico('play') + ' ' + esc(tr('立即执行', 'Run now')) + '</button>') +
        '<button type="button" class="cap-icon-btn" data-cap="task-menu" data-id="' + esc(task.id) + '" aria-label="' + esc(tr('更多操作', 'More')) + '">' + ico('ellipsis') + '</button>' +
      '</div></div>' +
      '<div class="cap-meta"><span>' + esc(scheduleSummary(task)) + '</span><span title="' + esc(nextAbsolute(task)) + '">' + esc(nextLabel(task)) + '</span><span>' + esc(task.model) + '</span><span>' + esc(task.workspace || tr('默认工作区', 'Default workspace')) + '</span></div>' +
      '<div class="cap-detail">' +
        '<section class="cap-panel"><div class="cap-panel-head"><h2>' + esc(tr('执行记录', 'Runs')) + ' <small>' + records.length + '</small></h2><span>' + esc(tr('每次执行后自动更新', 'Updates after each run')) + '</span></div>' +
          (records.length ? records.map(function (r) {
            var files = (r.artifactIds || []).map(artById).filter(Boolean);
            return '<article class="cap-run"><button type="button" class="cap-run-main" data-cap="run-open" data-id="' + esc(r.id) + '"><div class="cap-run-time"><b>' + esc(historyLabel(r.startedAt)) + '</b><span>' + esc(r.trigger) + ' · ' + esc(duration(r)) + '</span>' + pill(r.status) + '</div><p>' + esc(r.summary) + '</p></button>' +
              (files.length ? '<div class="cap-run-files">' + files.map(function (a) { return artifactButton(a, 'task-art'); }).join('') + '</div>' : '') +
              '<div class="cap-run-foot"><span>' + esc(tr('执行过程、结果和产出物', 'Process, result, and artifacts')) + '</span><button type="button" class="cap-link" data-cap="run-open" data-id="' + esc(r.id) + '">' + esc(tr('查看执行', 'View run')) + ' ' + ico('arrow-right') + '</button></div></article>';
          }).join('') : '<div class="cap-empty"><h3>' + esc(tr('暂无执行记录', 'No runs yet')) + '</h3><p>' + esc(tr('任务执行后，可在这里查看状态和产出。', 'Runs will show status and artifacts here.')) + '</p></div>') +
          '<p class="cap-next">' + esc(task.paused ? tr('定时任务已暂停', 'Schedule is paused') : task.completedOnce ? tr('本次调度已执行完成', 'This one-time schedule has finished') : tr('下次运行：', 'Next run: ') + nextAbsolute(task)) + '</p></section>' +
        '<aside class="cap-side"><div class="cap-panel-head"><h2>' + esc(tr('全部产出物', 'Artifacts')) + ' <small>' + artifacts.length + '</small></h2><span>' + esc(tr('点击预览', 'Preview')) + '</span></div>' +
          (artifacts.length ? groups.map(function (g) {
            return '<section class="cap-side-group"><h3>' + esc(g[0]) + '</h3>' + g[1].map(function (a) { return artifactButton(a, 'task-art'); }).join('') + '</section>';
          }).join('') : '<div class="cap-empty"><p>' + esc(tr('暂无产出物', 'No artifacts yet')) + '</p><small>' + esc(tr('任务执行完成后会在这里展示', 'They appear after a completed run')) + '</small></div>') +
        '</aside></div>' + menuHtml();
  }
  function steps(record) {
    var labels = [tr('读取任务配置', 'Read setup'), tr('获取输入数据', 'Load inputs'), tr('分析并整理结果', 'Analyze'), tr('生成产出物', 'Write artifacts')];
    var details = [
      tr('读取提示词、引用上下文与输出配置。', 'Read the prompt, context, and outputs.'),
      tr('读取 ', 'Read ') + record.businessDate + tr(' 的 ', ' · ') + record.inputCount + tr(' 个会话输入与输出。', ' session inputs and outputs.'),
      tr('按业务日期汇总并去重，保留来源会话和规则版本。', 'Aggregate by business date and keep source sessions.'),
      record.outputNames.length ? tr('生成 ', 'Write ') + record.outputNames.length + tr(' 份产出物并保存本次执行快照。', ' artifact snapshots.') : tr('本次未配置输出，保留执行结果。', 'No output configured.')
    ];
    return labels.map(function (label, i) {
      var status = 'pending';
      if (record.status === 'completed') status = 'done';
      else if (i === 0) status = 'done';
      else if (i === 1) status = record.status === 'running' ? 'running' : record.status === 'failed' ? 'failed' : 'paused';
      var note = status === 'pending' ? tr('尚未执行', 'Waiting') : status === 'failed' ? tr('会话数据读取超时，已停止后续步骤。', 'Timed out while reading sessions.') : status === 'paused' ? tr('本次执行在此暂停。', 'Paused here.') : details[i];
      var tag = { done: tr('已完成', 'Done'), running: tr('执行中', 'Running'), failed: tr('失败', 'Failed'), paused: tr('已暂停', 'Paused'), pending: tr('等待执行', 'Waiting') }[status];
      return { label: label, note: note, status: status, tag: tag, n: i + 1 };
    });
  }
  function runPage() {
    var record = findRun(ui.runId);
    var task = record ? taskById(record.taskId) : null;
    if (!record) { ui.runId = null; return detailPage(); }
    var files = (record.artifactIds || []).map(artById).filter(Boolean);
    return '<button type="button" class="btn-soft cap-back" data-cap="run-back">' + ico('arrow-left') + ' ' + esc(tr('返回执行记录', 'Back to runs')) + '</button>' +
      heading(displayName(record.taskName), historyLabel(record.startedAt) + ' · ' + record.trigger) +
      '<div class="cap-meta">' + pill(record.status) + '<span>' + esc(duration(record)) + '</span><span>' + esc(tr('业务日 ', 'Business date ') + record.businessDate) + '</span><span>' + esc(record.inputCount + tr(' 个会话', ' sessions')) + '</span></div>' +
      '<section class="cap-panel"><h2>' + esc(tr('执行过程', 'Process')) + '</h2><ol class="cap-steps">' +
        steps(record).map(function (s) {
          return '<li class="is-' + s.status + '"><span class="dot">' + (s.status === 'done' ? '✓' : s.n) + '</span><div><b>' + esc(s.label) + '</b><small>' + esc(s.note) + '</small></div><em>' + esc(s.tag) + '</em></li>';
        }).join('') +
      '</ol></section>' +
      '<section class="cap-panel"><h2>' + esc(tr('执行结果', 'Result')) + '</h2><p class="cap-copy">' + esc(record.summary) + '</p>' +
        (record.prompt ? '<p class="cap-note">' + esc(tr('提示词', 'Prompt')) + ' · ' + esc(record.prompt) + '</p>' : '') +
      '</section>' +
      '<section class="cap-panel"><div class="cap-panel-head"><h2>' + esc(tr('生成的产出物', 'Artifacts')) + ' <small>' + files.length + '</small></h2></div>' +
        (files.length ? '<div class="cap-run-files">' + files.map(function (a) { return artifactButton(a, 'task-art'); }).join('') + '</div>' : '<p class="cap-note">' + esc(record.status === 'running' ? tr('执行完成后展示本次产出物。', 'Artifacts appear when the run finishes.') : tr('本次没有生成产出物。', 'This run produced no artifacts.')) + '</p>') +
      '</section>' +
      (task ? '<div class="cap-inline-actions"><button type="button" class="btn-soft" data-cap="task-open" data-id="' + esc(task.id) + '">' + esc(tr('返回任务', 'Back to task')) + '</button></div>' : '');
  }

  function scopeList() {
    return arts.filter(function (a) { return a && !a.deleted && !a.templateOnly; });
  }
  function artifactSource(a) { return a.taskId || a.runId || a.runSnapshot ? 'schedule' : 'workspace'; }
  function filteredArts() {
    var f = ui.filters;
    var q = (f.query || '').trim().toLowerCase();
    return scopeList().filter(function (a) {
      if (f.source !== 'all' && artifactSource(a) !== f.source) return false;
      if (q && (a.name + ' ' + (a.desc || '') + ' ' + (a.updatedBy || '')).toLowerCase().indexOf(q) < 0) return false;
      if (f.type.length && f.type.indexOf(artifactType(a)) < 0) return false;
      if (f.by.length && f.by.indexOf(a.updatedBy || '—') < 0) return false;
      return true;
    }).sort(function (a, b) {
      var cmp = stamp(a.updatedAt) - stamp(b.updatedAt);
      return (f.sort === 'updated-asc' ? cmp : -cmp);
    });
  }
  function groupsFrom(list) {
    var map = [];
    var seen = {};
    list.forEach(function (a) {
      var key = artifactWorkspace(a);
      if (seen[key] == null) { seen[key] = map.length; map.push([key, []]); }
      map[seen[key]][1].push(a);
    });
    map.sort(function (a, b) {
      if (a[0] === DEFAULT_WS) return -1;
      if (b[0] === DEFAULT_WS) return 1;
      return String(a[0]).localeCompare(String(b[0]), 'zh-CN');
    });
    return map;
  }
  function currentGroups() { return groupsFrom(filteredArts()); }
  function filteredIds() { return filteredArts().map(function (a) { return a.id; }); }
  function artifactBatchBar(selected) {
    if (!selected.length) return '';
    var actions = [
      ['art-ref', 'quote', tr('引用', 'Reference'), tr('批量引用', 'Reference selected artifacts')],
      ['art-export', 'download', tr('下载', 'Download'), tr('批量下载', 'Download selected artifacts')],
      ['art-move', 'folder-input', tr('移动', 'Move'), tr('批量移动', 'Move selected artifacts')],
      ['art-delete', 'trash-2', tr('删除', 'Delete'), tr('批量删除', 'Delete selected artifacts')]
    ];
    return '<div class="session-bulk-dock cap-artifact-dock" role="toolbar" aria-label="' + esc(tr('产出物批量操作', 'Artifact actions')) + '"><span class="session-bulk-count" aria-live="polite">' + esc(tr('已选择 ', 'Selected ') + selected.length + tr(' 份', '')) + '</span><span class="session-bulk-divider" aria-hidden="true"></span>' +
      actions.map(function (action) {
        return '<button type="button" data-cap="' + action[0] + '" aria-label="' + esc(action[3]) + '" title="' + esc(action[3]) + '">' + ico(action[1]) + '<span class="cap-bulk-label">' + esc(action[2]) + '</span></button>';
      }).join('') + '<button type="button" class="session-bulk-clear" data-cap="art-clear" aria-label="' + esc(tr('取消选择', 'Clear selection')) + '" title="' + esc(tr('取消选择', 'Clear selection')) + '">' + ico('x') + '</button></div>';
  }

  function artSearchControl() {
    var label = tt('搜索产出物');
    if (ui.artSearchOpen || ui.filters.query.trim()) {
      return '<label class="search-field cap-search-field">' + ico('search') + '<input id="capArtSearch" type="text" data-cap="art-query" placeholder="' + esc(label) + '" value="' + esc(ui.filters.query) + '" aria-label="' + esc(label) + '" autocomplete="off"></label>';
    }
    return '<button type="button" class="fb-tool" data-cap="art-search-open" aria-label="' + esc(label) + '" title="' + esc(label) + '">' + ico('search') + '</button>';
  }
  function artSourceControl() {
    return '<div class="ov-segment cap-art-source" role="group" aria-label="' + esc(tr('产出物来源', 'Artifact source')) + '">' + [ ['all', tr('全部', 'All')], ['workspace', tr('工作区', 'Workspace')], ['schedule', tr('定时任务', 'Schedules')] ].map(function (item) {
      var active = ui.filters.source === item[0];
      return '<button type="button" data-cap="art-source" data-value="' + item[0] + '" class="' + (active ? 'is-active' : '') + '" aria-pressed="' + active + '">' + esc(item[1]) + '</button>';
    }).join('') + '</div>';
  }
  function artColumnLabel(key) { return key === 'type' ? tt('类型') : tt('更新人'); }
  function artColumnHeading(key) {
    var active = ui.filters[key].length > 0;
    var label = artColumnLabel(key);
    return '<th scope="col"><button type="button" class="session-col-control' + (active ? ' is-filtered' : '') + '" data-cap="art-column-filter" data-key="' + key + '" aria-label="' + esc(tr('筛选', 'Filter ') + label) + '" aria-haspopup="dialog" aria-expanded="false"><span>' + esc(label) + '</span>' + ico('list-filter') + '</button></th>';
  }
  function artSortHeading() {
    var asc = ui.filters.sort === 'updated-asc';
    return '<th scope="col" aria-sort="' + (asc ? 'ascending' : 'descending') + '"><button type="button" class="session-col-control" data-cap="art-column-sort" aria-label="' + esc(tr('排序更新时间', 'Sort updated time')) + '" title="' + esc(asc ? tr('降序', 'Descending') : tr('升序', 'Ascending')) + '"><span>' + esc(tt('更新时间')) + '</span><span class="session-sort-indicator" aria-hidden="true"><span class="' + (asc ? 'is-active' : '') + '"><svg viewBox="0 0 8 5"><path d="M4 0 8 5H0Z" fill="currentColor"/></svg></span><span class="' + (asc ? '' : 'is-active') + '"><svg viewBox="0 0 8 5"><path d="M0 0h8L4 5Z" fill="currentColor"/></svg></span></span></button></th>';
  }
  function artFilterOptions(key) {
    var values = [];
    scopeList().forEach(function (a) {
      var value = key === 'type' ? artifactType(a) : a.updatedBy || '—';
      if (values.indexOf(value) < 0) values.push(value);
    });
    return values.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
  }
  function closeArtColumnFilter(restoreFocus) {
    var menu = ui.artFilterMenu;
    var panel = document.getElementById('capArtColumnFilter');
    if (panel) panel.remove();
    if (menu && menu.anchor.isConnected) {
      menu.anchor.setAttribute('aria-expanded', 'false');
      if (restoreFocus) menu.anchor.focus({ preventScroll: true });
    }
    ui.artFilterMenu = null;
  }
  function positionArtColumnFilter() {
    var menu = ui.artFilterMenu;
    var panel = document.getElementById('capArtColumnFilter');
    if (!menu || !panel) return;
    var anchor = document.querySelector('[data-cap="art-column-filter"][data-key="' + menu.key + '"]');
    if (!anchor) { closeArtColumnFilter(); return; }
    menu.anchor = anchor;
    anchor.setAttribute('aria-expanded', 'true');
    var rect = anchor.getBoundingClientRect();
    panel.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 8)) + 'px';
    panel.style.top = Math.max(8, rect.bottom + panel.offsetHeight + 6 > window.innerHeight ? rect.top - panel.offsetHeight - 6 : rect.bottom + 6) + 'px';
  }
  function openArtColumnFilter(key, anchor) {
    var same = ui.artFilterMenu && ui.artFilterMenu.key === key;
    closeArtColumnFilter();
    if (same) return;
    ui.artFilterMenu = { key: key, anchor: anchor };
    var panel = document.createElement('div');
    panel.id = 'capArtColumnFilter'; panel.className = 'session-column-filter';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', tr('筛选', 'Filter ') + artColumnLabel(key));
    panel.innerHTML = '<header class="session-column-filter-header"><span>' + esc(artColumnLabel(key)) + '</span><button type="button" class="session-filter-clear" data-cap="art-column-clear"' + (ui.filters[key].length ? '' : ' disabled') + '>' + esc(tr('清空', 'Clear')) + '</button></header><div class="session-column-filter-options">' + artFilterOptions(key).map(function (value) {
      return '<label class="session-column-filter-option session-column-check"><input type="checkbox" data-cap="art-column-option" value="' + esc(value) + '"' + (ui.filters[key].indexOf(value) >= 0 ? ' checked' : '') + '><span>' + esc(value) + '</span></label>';
    }).join('') + '</div>';
    document.body.appendChild(panel);
    positionArtColumnFilter();
    var first = panel.querySelector('input'); if (first) first.focus({ preventScroll: true });
  }
  function applyArtColumnFilter(key, values) {
    ui.filters[key] = values.slice();
    ui.selected = [];
    var panel = document.getElementById('capArtColumnFilter');
    if (panel) {
      panel.querySelectorAll('input').forEach(function (input) { input.checked = values.indexOf(input.value) >= 0; });
      panel.querySelector('[data-cap="art-column-clear"]').disabled = !values.length;
    }
    rerender({ keepArtFilter: true });
  }
  function closeArtActionMenu(restoreFocus) {
    var menu = ui.artActionMenu;
    var panel = document.getElementById('capArtActionMenu');
    if (panel) panel.remove();
    if (menu && menu.anchor.isConnected) {
      menu.anchor.setAttribute('aria-expanded', 'false');
      if (restoreFocus) menu.anchor.focus({ preventScroll: true });
    }
    ui.artActionMenu = null;
  }
  function openArtActionMenu(id, anchor) {
    var same = ui.artActionMenu && ui.artActionMenu.id === id;
    closeArtActionMenu();
    var art = artById(id);
    if (same || !art) return;
    ui.artActionMenu = { id: id, anchor: anchor };
    var panel = document.createElement('div');
    panel.id = 'capArtActionMenu'; panel.className = 'cap-menu cap-art-action-menu';
    panel.setAttribute('role', 'menu'); panel.setAttribute('aria-label', art.name + tr('的更多操作', ' actions'));
    panel.innerHTML = (anchor.hasAttribute('data-compact') ? '<button type="button" role="menuitem" data-cap="art-ref" data-id="' + esc(id) + '">' + ico('quote') + tr('引用', 'Cite') + '</button><button type="button" role="menuitem" data-cap="art-export" data-id="' + esc(id) + '">' + ico('download') + tr('下载', 'Download') + '</button>' : '') + '<button type="button" role="menuitem" data-cap="art-edit" data-id="' + esc(id) + '">' + ico('pencil') + esc(tr('编辑', 'Edit')) + '</button><button type="button" role="menuitem" class="is-danger" data-cap="art-delete" data-id="' + esc(id) + '">' + ico('trash-2') + esc(tr('删除', 'Delete')) + '</button>';
    document.body.appendChild(panel);
    if (global.lucide && global.lucide.createIcons) global.lucide.createIcons({ attrs: { width: 15, height: 15, 'stroke-width': 1.5 } });
    var rect = anchor.getBoundingClientRect();
    panel.style.left = Math.max(8, Math.min(rect.right - panel.offsetWidth, window.innerWidth - panel.offsetWidth - 8)) + 'px';
    panel.style.top = Math.max(8, rect.bottom + panel.offsetHeight + 6 > window.innerHeight ? rect.top - panel.offsetHeight - 6 : rect.bottom + 6) + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    panel.querySelector('button').focus({ preventScroll: true });
  }
  function artRowActions(a) {
    var id = esc(a.id);
    return '<td class="cap-row-actions"><span class="fb-actions"><button type="button" class="fb-act" data-cap="art-ref" data-id="' + id + '">' + esc(tr('引用', 'Cite')) + '</button><button type="button" class="fb-act" data-cap="art-export" data-id="' + id + '">' + esc(tr('下载', 'Download')) + '</button><button type="button" class="fb-act ghost" data-cap="art-more" data-id="' + id + '" aria-label="' + esc(a.name + tr('的更多操作', ' actions')) + '" title="' + esc(tr('更多操作', 'More actions')) + '" aria-haspopup="menu" aria-expanded="false">···</button></span></td>';
  }

  function artifactFolderHtml(name, index, closed) {
    return '<div class="cap-folder"><button type="button" data-cap="art-folder" data-g="' + index + '" aria-expanded="' + (!closed) + '"><span class="cap-chev">' + ico('chevron-down') + '</span><span class="cap-folder-icon"><svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.2 2.2A1.2 1.2 0 0 1 2.4 1h2.7l1.1 1.3H11.6A1.2 1.2 0 0 1 12.8 3.5v6.3A1.2 1.2 0 0 1 11.6 11H2.4A1.2 1.2 0 0 1 1.2 9.8V2.2Z" fill="currentColor"/></svg></span><b>' + esc(displayName(name)) + '</b></button></div>';
  }

  function artPage() {
    var indices = filteredArts();
    var groups = groupsFrom(indices);
    var selected = ui.selected.filter(function (id) { return indices.some(function (a) { return a.id === id; }); });
    return '<div class="page-heading has-actions cap-list-head"><h1>' + esc(tt('产出物')) + '</h1><div class="cap-heading-actions">' + artSearchControl() + artSourceControl() + '</div></div>' +
      artifactBatchBar(selected) +
      '<div id="capArtResults" class="table-wrap"><table class="data-table cap-table"><colgroup><col style="width:5%"><col style="width:32%"><col style="width:12%"><col style="width:12%"><col style="width:19%"><col style="width:20%"></colgroup><thead><tr>' +
        '<th class="cap-check"><input id="capArtAll" type="checkbox" data-cap="art-all" aria-label="' + esc(tr('全选当前结果', 'Select all results')) + '" title="' + esc(tr('全选当前结果', 'Select all results')) + '"' + (indices.length && selected.length === indices.length ? ' checked' : '') + (indices.length ? '' : ' disabled') + '></th>' +
        '<th scope="col">' + esc(tt('名称')) + '</th>' + artColumnHeading('type') + artColumnHeading('by') + artSortHeading() + '<th scope="col">' + esc(tt('操作')) + '</th></tr></thead>' +
        (indices.length ? groups.map(function (g, gi) {
          var closed = !!ui.collapsed[g[0]];
          var allOn = g[1].every(function (a) { return ui.selected.indexOf(a.id) >= 0; });
          return '<tbody class="cap-group' + (closed ? ' is-closed' : '') + '"><tr class="cap-group-row"><td class="cap-check"><input type="checkbox" data-cap="art-group" data-g="' + gi + '"' + (allOn ? ' checked' : '') + ' aria-label="' + esc(g[0]) + '"></td>' +
            '<th scope="rowgroup" colspan="5">' + artifactFolderHtml(g[0], gi, closed) + '</th></tr>' +
            g[1].map(function (a) {
              var on = ui.selected.indexOf(a.id) >= 0;
              return '<tr tabindex="0" data-artifact-view="' + esc(a.id) + '" aria-label="' + esc('查看产出物：' + a.name) + '" class="cap-art-row' + (on ? ' is-selected' : '') + '"><td class="cap-check"><input type="checkbox" data-cap="art-one" data-id="' + esc(a.id) + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(a.name) + '"></td>' +
                '<td><button type="button" class="cap-name" data-cap="art-open" data-id="' + esc(a.id) + '" title="' + esc(a.desc || a.name) + '">' + chip(a) + '<span>' + esc(displayName(a.name)) + '</span></button></td>' +
                '<td><span class="cap-type">' + esc(artifactType(a)) + '</span></td><td class="is-muted">' + esc(a.updatedBy || '—') + '</td><td class="is-muted">' + esc(format(a.updatedAt).slice(0, 16)) + '</td>' +
                artRowActions(a) + '</tr>';
            }).join('') + '</tbody>';
        }).join('') : '<tbody><tr><td colspan="6"><div class="cap-empty"><h3>' + esc(tr('没有匹配的产出物', 'No matching artifacts')) + '</h3><p>' + esc(tr('调整搜索或筛选条件，或在任务执行后查看快照。', 'Adjust filters, or run a schedule to create a snapshot.')) + '</p><button type="button" class="btn-soft" data-cap="art-reset">' + esc(tr('重置筛选', 'Reset filters')) + '</button></div></td></tr></tbody>') + '</table></div>';
  }

  function docText(a) {
    if (a.content != null) return a.content;
    return '# ' + a.name + '\n\n' + (a.data || []).map(function (row) { return '## ' + row[0] + '\n\n' + row.slice(1).join('\n\n'); }).join('\n\n');
  }
  function renderMd(src) {
    return esc(src).split('\n').map(function (line) {
      var body = line;
      var tag = 'p';
      if (line.indexOf('### ') === 0) { tag = 'h3'; body = line.slice(4); }
      else if (line.indexOf('## ') === 0) { tag = 'h2'; body = line.slice(3); }
      else if (line.indexOf('# ') === 0) { tag = 'h1'; body = line.slice(2); }
      else if (!line.trim()) return '';
      body = body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return '<' + tag + '>' + body + '</' + tag + '>';
    }).join('');
  }
  function tableHtml(cols, rows, scope) {
    return '<div class="table-wrap cap-preview-table"><table class="data-table"><thead><tr>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.map(function (row, ri) {
        return '<tr data-cap="preview-row" data-scope="' + scope + '" data-row="' + ri + '">' + row.map(function (cell) { return '<td>' + esc(cell) + '</td>'; }).join('') + '</tr>';
      }).join('') : '<tr><td colspan="' + Math.max(cols.length, 1) + '">' + esc(tr('暂无记录', 'No rows')) + '</td></tr>') +
      '</tbody></table></div>';
  }
  function previewBody(a, preview, scope) {
    if (preview.tab === 'schema' && artifactKind(a) === 'table') {
      var rows = schemaRows(a);
      return '<p class="cap-note">' + rows.length + esc(tr(' 个字段 · 字段类型与说明来自任务输出配置', ' fields from the output setup')) + '</p>' +
        '<div class="table-wrap"><table class="data-table"><thead><tr><th>' + esc(tr('字段名', 'Field')) + '</th><th>' + esc(tr('类型', 'Type')) + '</th><th>' + esc(tr('说明', 'Notes')) + '</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td><code>' + esc(r[0]) + '</code></td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
    }
    if (artifactKind(a) === 'table') {
      var hint = String(a.rows) !== String((a.data || []).length) && a.rows !== '文件'
        ? '<p class="cap-note">' + esc(tr('显示样例 ', 'Sample ') + (a.data || []).length + tr(' 条 · 记录总数 ', ' of ') + a.rows) + '</p>'
        : '<p class="cap-note">' + esc(tr('点击记录查看完整字段', 'Select a row to see every field')) + '</p>';
      var record = Number.isInteger(preview.row) ? (a.data || [])[preview.row] : null;
      return hint + tableHtml(a.cols || [], a.data || [], scope) + (record
        ? '<section class="cap-record"><div class="cap-panel-head"><h3>' + esc(tr('第 ', 'Row ') + (preview.row + 1) + tr(' 条记录', '')) + '</h3><button type="button" class="cap-icon-btn" data-cap="preview-row" data-scope="' + scope + '" data-row="' + preview.row + '" aria-label="' + esc(tr('收起', 'Hide')) + '">' + ico('x') + '</button></div><dl>' +
          (a.cols || []).map(function (name, i) { return '<div><dt>' + esc(name) + '</dt><dd>' + esc(record[i] == null ? '—' : record[i]) + '</dd></div>'; }).join('') + '</dl></section>'
        : '');
    }
    if (artifactType(a) === 'Markdown') return '<article class="cap-doc">' + renderMd(docText(a)) + '</article>';
    var text = a.content != null ? a.content : (artifactType(a) === 'JSON' ? JSON.stringify(Object.fromEntries(a.data || []), null, 2) : docText(a));
    return '<pre class="cap-code">' + esc(text) + '</pre>';
  }
  function drawer(preview, scope) {
    if (!preview) return '';
    var a = artById(preview.id);
    if (!a) return '';
    var file = artifactKind(a) === 'file';
    var tabs = [['content', file ? tr('内容', 'Content') : tr('数据', 'Data')]];
    if (!file) tabs.push(['schema', tr('表结构', 'Schema')]);
    var owner = a.taskId ? (taskById(a.taskId) || {}).name || tr('来源任务已删除', 'Source task deleted') : artifactWorkspace(a);
    return '<div class="cap-drawer-back" data-cap="preview-close" data-scope="' + scope + '"></div><aside class="cap-drawer" role="dialog" aria-label="' + esc(tr('产出物预览', 'Artifact preview')) + '">' +
      '<header class="cap-drawer-head"><span class="cap-drawer-chip">' + chip(a) + '</span><div><small>' + esc(displayName(owner)) + ' / ' + esc(tr('产出物预览', 'Preview')) + '</small><h2>' + esc(displayName(a.name)) + '</h2></div>' +
      '<button type="button" class="cap-icon-btn" data-cap="preview-close" data-scope="' + scope + '" aria-label="' + esc(tr('关闭', 'Close')) + '">' + ico('x') + '</button></header>' +
      '<div class="cap-drawer-meta"><span class="cap-type">' + esc(artifactType(a)) + '</span><span>' + esc((a.updatedBy || '—') + ' · ' + format(a.updatedAt).slice(0, 16)) + '</span></div>' +
      (a.desc ? '<p class="cap-note">' + esc(a.desc) + '</p>' : '') +
      '<div class="cap-drawer-actions"><button type="button" class="btn-soft" data-cap="art-edit" data-id="' + esc(a.id) + '">' + esc(tr('编辑', 'Edit')) + '</button><button type="button" class="btn-soft" data-cap="art-ref" data-id="' + esc(a.id) + '">' + esc(tr('引用', 'Cite')) + '</button><button type="button" class="btn-soft" data-cap="art-export" data-id="' + esc(a.id) + '">' + esc(tr('下载', 'Download')) + '</button></div>' +
      '<div class="cap-tabs">' + tabs.map(function (tab) {
        return '<button type="button" data-cap="preview-tab" data-scope="' + scope + '" data-tab="' + tab[0] + '" class="' + (preview.tab === tab[0] ? 'is-active' : '') + '">' + esc(tab[1]) + '</button>';
      }).join('') + '</div><div class="cap-drawer-body">' + previewBody(a, preview, scope) + '</div></aside>';
  }

  function field(label, control) {
    return '<label class="cap-field"><span>' + esc(label) + '</span>' + control + '</label>';
  }
  function editorHtml() {
    var d = ui.editor.draft;
    var s = d.schedule;
    var repeat = '<select id="taskFreq" data-cap="editor-repeat" aria-label="' + esc(tr('重复', 'Repeat')) + '">' +
      [['daily', tr('每天', 'Daily')], ['weekly', tr('每周', 'Weekly')], ['monthly', tr('每月', 'Monthly')], ['interval', tr('间隔', 'Interval')], ['once', tr('单次', 'Once')]].map(function (o) {
        return '<option value="' + o[0] + '"' + (s.repeat === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      }).join('') + '</select>';
    var extra = '';
    if (s.repeat === 'weekly') {
      extra = '<div class="cap-chips" role="group" aria-label="' + esc(tr('星期', 'Weekdays')) + '">' + WEEK.map(function (name, i) {
        var n = i + 1;
        return '<button type="button" data-cap="editor-day" data-kind="week" data-n="' + n + '" class="' + ((s.weekdays || []).indexOf(n) >= 0 ? 'is-on' : '') + '">' + esc(tr('周', '') + name) + '</button>';
      }).join('') + '</div>';
    } else if (s.repeat === 'monthly') {
      extra = '<div class="cap-chips cap-days" role="group" aria-label="' + esc(tr('日期', 'Dates')) + '">' + Array.from({ length: 31 }, function (_v, i) {
        var n = i + 1;
        return '<button type="button" data-cap="editor-day" data-kind="month" data-n="' + n + '" class="' + ((s.monthdays || []).indexOf(n) >= 0 ? 'is-on' : '') + '">' + n + '</button>';
      }).join('') + '</div>';
    } else if (s.repeat === 'interval') {
      extra = field(tr('间隔小时', 'Hours'), '<input id="taskInterval" type="number" min="1" step="1" value="' + esc(s.intervalHours || 5) + '">');
    } else if (s.repeat === 'once') {
      extra = field(tr('执行时间', 'Run at'), '<input id="taskOnceAt" type="datetime-local" value="' + esc(s.onceAt || '') + '">');
    }
    var time = (s.repeat === 'daily' || s.repeat === 'weekly' || s.repeat === 'monthly')
      ? field(tr('时间', 'Time'), '<input id="taskTime" type="time" value="' + esc(s.time || '09:00') + '">')
      : '';
    var outputs = d.output ? '<div id="taskOutputs">' + (d.outputs || []).map(function (o, i) {
      return '<div class="cap-output" data-output-row="' + i + '">' +
        '<select data-out-type data-cap="editor-output-type" aria-label="' + esc(tr('输出类型', 'Output type')) + '"><option value="表"' + (o.type !== '文件' ? ' selected' : '') + '>' + esc(tr('数据表', 'Table')) + '</option><option value="文件"' + (o.type === '文件' ? ' selected' : '') + '>' + esc(tr('文件', 'File')) + '</option></select>' +
        '<input data-out-name placeholder="' + esc(o.type === '文件' ? tr('文档名称', 'Document name') : tr('表名称', 'Table name')) + '" value="' + esc(o.name) + '">' +
        (o.type === '文件'
          ? '<select data-out-format aria-label="' + esc(tr('格式', 'Format')) + '">' + ['Markdown', 'JSON', 'CSV'].map(function (fmt) { return '<option' + ((o.format || 'Markdown') === fmt ? ' selected' : '') + '>' + fmt + '</option>'; }).join('') + '</select>'
          : '<input data-out-schema placeholder="' + esc(tr('字段: 类型，每行一个', 'field: type, one per line')) + '" value="' + esc(o.schema || '') + '">') +
        '<button type="button" class="cap-icon-btn" data-cap="editor-remove-output" data-oi="' + i + '" aria-label="' + esc(tr('移除输出', 'Remove output')) + '">' + ico('x') + '</button></div>';
    }).join('') + '</div><button type="button" class="btn-soft" data-cap="editor-add-output">' + ico('plus') + ' ' + esc(tr('添加输出', 'Add output')) + '</button>' : '';
    return '<div class="cap-overlay" data-cap="editor-close"><section class="cap-dialog is-wide" role="dialog" aria-modal="true" aria-label="' + esc(ui.editor.id ? tr('编辑定时任务', 'Edit schedule') : tr('创建定时任务', 'Create schedule')) + '" id="capEditor" data-cap="dialog">' +
      '<header class="cap-dialog-head"><h2>' + esc(ui.editor.id ? tr('编辑定时任务', 'Edit schedule') : tr('创建定时任务', 'Create schedule')) + '</h2><button type="button" class="cap-icon-btn" data-cap="editor-close" aria-label="' + esc(tr('关闭', 'Close')) + '">' + ico('x') + '</button></header>' +
      '<div class="cap-dialog-body">' +
        (d.skill ? '<div class="cap-banner"><b>' + esc(tr('定时任务 Skill · 创建配置', 'Schedule skill')) + '</b><span>' + esc(tr('当前工作台没有对话栏。确认后会保存到定时任务列表，可再编辑调度和输出。', 'This workbench has no chat pane. Saving adds the schedule here.')) + '</span></div>' : '') +
        '<input id="taskName" class="cap-title-input" maxlength="80" placeholder="' + esc(tr('输入标题，例如：每日运行质量简报', 'Title, for example daily quality brief')) + '" value="' + esc(d.name) + '" aria-label="' + esc(tr('标题', 'Title')) + '">' +
        '<textarea id="taskDescription" rows="2" placeholder="' + esc(tr('描述任务目标与内容', 'What this task should do')) + '" aria-label="' + esc(tr('描述', 'Description')) + '">' + esc(d.description || '') + '</textarea>' +
        '<div class="cap-form-row">' + field(tr('重复', 'Repeat'), repeat) + time + '</div>' + extra +
        '<div class="cap-form-row">' +
          field(tr('工作区', 'Workspace'), '<select id="taskWorkspace"><option value="">' + esc(tr('选择工作区（可选）', 'Workspace (optional)')) + '</option>' + workspaceChoices().map(function (n) { return '<option value="' + esc(n) + '"' + (d.workspace === n ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select>') +
          field(tr('模型', 'Model'), '<select id="taskModel">' + MODELS.map(function (m) { return '<option value="' + esc(m) + '"' + (d.model === m ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select>') +
        '</div>' +
        field(tr('提示词', 'Prompt'), '<textarea id="taskPrompt" rows="5" placeholder="' + esc(tr('描述要分析的数据、口径和写入方式', 'Describe the data, rules, and outputs')) + '">' + esc(d.prompt || '') + '</textarea>') +
        '<div class="cap-field"><span>' + esc(tr('引用上下文', 'Context')) + '</span><div class="cap-refs">' + CONTEXTS.map(function (name) {
          return '<label><input type="checkbox" data-ref="' + esc(name) + '"' + ((d.inputs || []).indexOf(name) >= 0 ? ' checked' : '') + '>' + esc(displayName(name)) + '</label>';
        }).join('') + '</div></div>' +
        '<div class="cap-output-head"><h3>' + esc(tr('输出配置', 'Outputs')) + '</h3><label class="cap-checkline"><input id="outputEnabled" type="checkbox" data-cap="editor-output-enabled"' + (d.output ? ' checked' : '') + '> ' + esc(tr('启用输出', 'Enable output')) + '</label></div>' +
        outputs + '<p class="cap-note">' + esc(tr('保存至所选工作区；未选择时归入默认工作区。', 'Saved to the selected workspace, or the default workspace.')) + '</p>' +
      '</div><footer class="cap-dialog-foot"><button type="button" class="btn-soft" data-cap="editor-close">' + esc(tr('取消', 'Cancel')) + '</button><button type="button" class="btn-soft" data-cap="editor-save-run">' + esc(tr('保存并执行', 'Save and run')) + '</button><button type="button" class="btn-ink" data-cap="editor-save">' + esc(tr('保存', 'Save')) + '</button></footer></section></div>';
  }
  function artEditHtml() {
    var a = artById(ui.artifactEdit);
    if (!a) return '';
    var file = artifactKind(a) === 'file';
    var content = file
      ? (artifactType(a) === 'Markdown' ? docText(a) : (a.content != null ? a.content : (artifactType(a) === 'JSON' ? JSON.stringify(Object.fromEntries(a.data || []), null, 2) : exportFile(a).text)))
      : JSON.stringify(a.data || [], null, 2);
    return '<div class="cap-overlay" data-cap="art-edit-close"><section class="cap-dialog is-wide" role="dialog" aria-modal="true" aria-label="' + esc(tr('编辑产出物', 'Edit artifact')) + '" id="capArtEditor" data-cap="dialog">' +
      '<header class="cap-dialog-head"><h2>' + esc(tr('编辑产出物', 'Edit artifact')) + '</h2><button type="button" class="cap-icon-btn" data-cap="art-edit-close" aria-label="' + esc(tr('关闭', 'Close')) + '">' + ico('x') + '</button></header>' +
      '<div class="cap-dialog-body">' +
        field(tr('名称', 'Name'), '<input id="artifactEditName" maxlength="120" value="' + esc(a.name) + '">') +
        field(tr('工作区', 'Workspace'), '<select id="artifactEditWorkspace">' + workspaceChoices().map(function (n) { return '<option value="' + esc(n) + '"' + (artifactWorkspace(a) === n ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select>') +
        field(tr('描述', 'Description'), '<input id="artifactEditDesc" value="' + esc(a.desc || '') + '">') +
        field(file ? tr('文档内容', 'Document') + '（' + artifactType(a) + '）' : tr('表数据（JSON 二维数组）', 'Table data (JSON rows)'), '<textarea id="artifactEditContent" rows="12" spellcheck="false">' + esc(content) + '</textarea>') +
      '</div><footer class="cap-dialog-foot"><button type="button" class="btn-soft" data-cap="art-edit-close">' + esc(tr('取消', 'Cancel')) + '</button><button type="button" class="btn-ink" data-cap="art-save">' + esc(tr('保存', 'Save')) + '</button></footer></section></div>';
  }
  function moveHtml() {
    if (!ui.move) return '';
    return '<div class="cap-overlay" data-cap="move-close"><section class="cap-dialog" role="dialog" aria-modal="true" aria-label="' + esc(tr('批量移动产出物', 'Move artifacts')) + '" data-cap="dialog">' +
      '<header class="cap-dialog-head"><h2>' + esc(tr('批量移动产出物', 'Move artifacts')) + '</h2><button type="button" class="cap-icon-btn" data-cap="move-close" aria-label="' + esc(tr('关闭', 'Close')) + '">' + ico('x') + '</button></header>' +
      '<div class="cap-dialog-body"><p>' + esc(tr('将已选择的 ', 'Move ') + ui.move.ids.length + tr(' 份产出物移动到：', ' artifacts to:')) + '</p>' +
        field(tr('工作区', 'Workspace'), '<select id="artifactMoveWorkspace">' + workspaceChoices().map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + '</option>'; }).join('') + '</select>') +
      '</div><footer class="cap-dialog-foot"><button type="button" class="btn-soft" data-cap="move-close">' + esc(tr('取消', 'Cancel')) + '</button><button type="button" class="btn-ink" data-cap="move-save">' + esc(tr('移动', 'Move')) + '</button></footer></section></div>';
  }
  function confirmHtml() {
    if (!ui.confirm) return '';
    var title = ui.confirm.kind === 'task' ? tr('删除定时任务', 'Delete schedule') : tr('删除产出物', 'Delete artifacts');
    var body = '';
    if (ui.confirm.kind === 'task') {
      var task = taskById(ui.confirm.id);
      body = '<p>' + esc(tr('确认删除「', 'Delete ') + (task ? task.name : '') + tr('」？', '?')) + '</p><p class="cap-note">' + esc(tr('删除后将停止后续调度，并移除此任务的执行记录。已生成的产出物仍保留在产出物列表。', 'Future runs stop. Existing artifacts stay in the artifact list.')) + '</p>';
    } else {
      body = '<p>' + esc(tr('确认删除以下 ', 'Delete ') + ui.confirm.ids.length + tr(' 份产出物？', ' artifacts?')) + '</p><ul class="cap-delete-list">' + ui.confirm.ids.map(function (id) {
        var a = artById(id);
        return '<li>' + esc(a ? a.name : id) + '</li>';
      }).join('') + '</ul><p class="cap-note">' + esc(tr('删除后将从产出物列表和引用中移除。', 'Removed from the list and from citations.')) + '</p>';
    }
    return '<div class="cap-overlay" data-cap="confirm-close"><section class="cap-dialog" role="alertdialog" aria-modal="true" aria-label="' + esc(title) + '" data-cap="dialog">' +
      '<header class="cap-dialog-head"><h2>' + esc(title) + '</h2><button type="button" class="cap-icon-btn" data-cap="confirm-close" aria-label="' + esc(tr('关闭', 'Close')) + '">' + ico('x') + '</button></header>' +
      '<div class="cap-dialog-body">' + body + '</div><footer class="cap-dialog-foot"><button type="button" class="btn-soft" data-cap="confirm-close">' + esc(tr('取消', 'Cancel')) + '</button><button type="button" class="cap-danger" data-cap="confirm-ok">' + esc(tr('确认删除', 'Delete')) + '</button></footer></section></div>';
  }
  function overlays() {
    return (ui.editor ? editorHtml() : '') + (ui.artifactEdit ? artEditHtml() : '') + (ui.move ? moveHtml() : '') + (ui.confirm ? confirmHtml() : '');
  }
  function schedulesPage() {
    var body = ui.runId ? runPage() : ui.taskDetailId ? detailPage() : listPage();
    return body + drawer(ui.taskPreview, 'task') + overlays();
  }
  var artViews = {};
  function selectDetail(id) {
    if (ui.artifactPreview) artViews[ui.artifactPreview.id] = Object.assign({}, ui.artifactPreview);
    ui.artifactPreview = id ? Object.assign({}, artViews[id] || { id: id, tab: 'content', row: null }) : null;
    var art = id && artById(id); if (art) global.AIOpsResources.open('artifact', art);
  }
  function compactArtifacts() {
    var rows = filteredArts();
    return '<div class="page-heading"><h1>' + esc(tt('产出物')) + '</h1></div><div class="resource-list-controls">' + artSearchControl() + artSourceControl() + '</div><div class="resource-list-scroll">' + (rows.length ? groupsFrom(rows).map(function (group, gi) {
      var closed = !!ui.collapsed[group[0]];
      return '<section class="resource-art-group' + (closed ? ' is-closed' : '') + '">' + artifactFolderHtml(group[0], gi, closed) + (closed ? '' : group[1].map(function (a) {
        return '<div class="resource-list-item' + (ui.artifactPreview.id === a.id ? ' is-active' : '') + '" role="button" tabindex="0" data-artifact-view="' + esc(a.id) + '" aria-label="' + esc('查看产出物：' + a.name) + '">' + chip(a) + '<div><strong title="' + esc(a.name) + '">' + esc(displayName(a.name)) + '</strong></div><button type="button" class="resource-icon" data-cap="art-more" data-id="' + esc(a.id) + '" data-compact="true" aria-label="' + esc(a.name + '的更多操作') + '" aria-haspopup="menu">' + ico('ellipsis') + '</button></div>';
      }).join('')) + '</section>';
    }).join('') : '<div class="sd-empty">' + tr('没有匹配的产出物', 'No matching artifacts') + '</div>') + '</div>';
  }
  function artifactDetail() {
    var preview = ui.artifactPreview, a = artById(preview.id);
    if (!a) return '';
    var file = artifactKind(a) === 'file', tabs = [['content', file ? tr('内容', 'Content') : tr('数据', 'Data')]];
    if (!file) tabs.push(['schema', tr('表结构', 'Schema')]);
    return '<div class="resource-art-detail"><header class="cap-drawer-head">' + chip(a) + '<div><small>' + esc(artifactWorkspace(a)) + '</small><h2>' + esc(displayName(a.name)) + '</h2></div></header><div class="cap-drawer-meta"><span>' + esc(artifactType(a)) + '</span><span>' + esc((a.updatedBy || '—') + ' · ' + format(a.updatedAt).slice(0,16)) + '</span></div>' + (a.desc ? '<p class="cap-note">' + esc(a.desc) + '</p>' : '') + '<div class="cap-drawer-actions"><button type="button" class="btn-soft" data-cap="art-ref" data-id="' + esc(a.id) + '">' + tr('引用', 'Cite') + '</button><button type="button" class="btn-soft" data-cap="art-export" data-id="' + esc(a.id) + '">' + tr('下载', 'Download') + '</button><button type="button" class="resource-icon" data-cap="art-more" data-id="' + esc(a.id) + '" aria-label="' + esc(a.name + '的更多操作') + '">' + ico('ellipsis') + '</button></div><div class="cap-tabs" role="tablist" aria-label="' + tr('产出物内容', 'Artifact content') + '">' + tabs.map(function (tab) { return '<button type="button" role="tab" aria-selected="' + (preview.tab === tab[0]) + '" data-cap="preview-tab" data-scope="art" data-tab="' + tab[0] + '" class="' + (preview.tab === tab[0] ? 'is-active' : '') + '">' + tab[1] + '</button>'; }).join('') + '</div><div class="cap-drawer-body" role="tabpanel">' + previewBody(a, preview, 'art') + '</div></div>';
  }
  function artifactsPage() {
    if (ui.artifactPreview && !artById(ui.artifactPreview.id)) ui.artifactPreview = null;
    if (ui.artifactPreview) { global.AIOpsResources.open('artifact', artById(ui.artifactPreview.id)); return global.AIOpsResources.shell('artifact', compactArtifacts(), artifactDetail()) + overlays(); }
    return artPage() + overlays();
  }

  function readForm() {
    var root = document.getElementById('capEditor');
    if (!root || !ui.editor) return;
    var d = ui.editor.draft;
    function val(id) { var n = document.getElementById(id); return n ? n.value : ''; }
    d.name = val('taskName');
    d.description = val('taskDescription');
    d.prompt = val('taskPrompt');
    d.model = val('taskModel') || d.model;
    d.workspace = val('taskWorkspace');
    d.schedule.repeat = val('taskFreq') || d.schedule.repeat;
    if (val('taskTime')) d.schedule.time = val('taskTime');
    if (val('taskInterval')) d.schedule.intervalHours = Number(val('taskInterval'));
    if (document.getElementById('taskOnceAt')) d.schedule.onceAt = val('taskOnceAt');
    var enabled = document.getElementById('outputEnabled');
    if (enabled) d.output = enabled.checked;
    var rows = root.querySelectorAll('[data-output-row]');
    if (rows.length) {
      d.outputs = Array.prototype.map.call(rows, function (row) {
        var schema = row.querySelector('[data-out-schema]');
        var format = row.querySelector('[data-out-format]');
        return {
          type: row.querySelector('[data-out-type]').value,
          name: row.querySelector('[data-out-name]').value,
          schema: schema ? schema.value : '',
          format: format ? format.value : 'Markdown'
        };
      });
    }
    d.inputs = [];
    root.querySelectorAll('[data-ref]').forEach(function (n) { if (n.checked) d.inputs.push(n.getAttribute('data-ref')); });
  }
  function blankDraft(skill) {
    return {
      skill: !!skill, name: '', description: '', prompt: '', model: MODELS[0], workspace: workspaceChoices()[0] || '',
      inputs: [], output: true,
      schedule: { repeat: 'daily', time: '09:00', weekdays: [1], monthdays: [1], intervalHours: 5, onceAt: '', intervalAnchor: '' },
      outputs: [{ type: '表', name: '', schema: '', format: 'Markdown' }]
    };
  }
  function draftFrom(task) {
    var s = task.schedule || {};
    return {
      skill: false,
      name: task.name,
      description: task.description || '',
      prompt: task.prompt || '',
      model: MODELS.indexOf(task.model) >= 0 ? task.model : MODELS[0],
      workspace: task.workspace || '',
      inputs: (task.inputs || []).slice(),
      output: !!task.output,
      schedule: {
        repeat: s.repeat || 'daily', time: s.time || task.time || '09:00',
        weekdays: (s.weekdays || [1]).slice(), monthdays: (s.monthdays || [1]).slice(),
        intervalHours: s.intervalHours || 5, onceAt: s.onceAt || '', intervalAnchor: s.intervalAnchor || ''
      },
      outputs: (task.outputs || []).map(function (o) { return { type: o.type || '表', name: o.name || '', schema: o.schema || '', format: o.format || 'Markdown' }; })
    };
  }
  function openEditor(id, skill) {
    var task = id ? taskById(id) : null;
    ui.editor = { id: task ? task.id : null, draft: task ? draftFrom(task) : blankDraft(skill) };
    ui.createOpen = false;
    ui.menu = null;
  }
  function validOnce(value) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value || '')) return false;
    var d = new Date(value);
    if (isNaN(d.getTime())) return false;
    var y = Number(value.slice(0, 4));
    var m = Number(value.slice(5, 7));
    var day = Number(value.slice(8, 10));
    if (d.getFullYear() !== y || d.getMonth() + 1 !== m || d.getDate() !== day) return false;
    return d > new Date();
  }
  function syncTemplates(task) {
    arts.forEach(function (a) {
      if (a.taskId === task.id && !a.runSnapshot) {
        var keep = task.output && (task.outputs || []).some(function (o) { return o.name === a.name; });
        if (!keep) a.deleted = true;
      }
    });
    if (!task.output) return;
    (task.outputs || []).forEach(function (o) {
      var existing = null;
      arts.forEach(function (a) {
        if (!existing && a.taskId === task.id && !a.runSnapshot && !a.deleted && a.name === o.name) existing = a;
      });
      if (existing) {
        existing.kind = o.type === '文件' ? 'file' : 'table';
        existing.schema = o.type === '文件' ? (o.format || 'Markdown') + ' · ' + o.name : o.schema;
        existing.workspace = task.workspace;
        return;
      }
      arts.push({
        id: uid('a'), name: o.name, taskId: task.id, templateOnly: true, kind: o.type === '文件' ? 'file' : 'table',
        desc: task.name, rows: o.type === '文件' ? '文件' : '0',
        schema: o.type === '文件' ? (o.format || 'Markdown') + ' · ' + o.name : o.schema,
        cols: o.type === '文件' ? ['章节', '内容'] : schemaCols(o.schema),
        data: [], updatedBy: '定时任务', updatedAt: format(new Date()), workspace: task.workspace
      });
    });
  }
  function saveEditor(runAfter) {
    if (!ui.editor) return;
    readForm();
    var d = ui.editor.draft;
    var name = d.name.trim();
    var prompt = (d.prompt || '').trim();
    var description = (d.description || '').trim();
    if (!name || (!prompt && !description)) { toast(tr('请填写标题，并填写描述或提示词', 'Add a title and a description or prompt')); return; }
    if (MODELS.indexOf(d.model) < 0) { toast(tr('请选择模型', 'Choose a model')); return; }
    if (tasks.some(function (t) { return t.name === name && t.id !== ui.editor.id; })) { toast(tr('任务名称已存在', 'That name is already used')); return; }
    var s = d.schedule;
    if (s.repeat === 'interval' && (!Number.isInteger(Number(s.intervalHours)) || Number(s.intervalHours) < 1)) { toast(tr('间隔需为不小于 1 的整数小时', 'Interval must be a whole number of hours')); return; }
    if (s.repeat === 'once' && !validOnce(s.onceAt)) { toast(tr('请选择未来的单次执行时间', 'Choose a future one-time run')); return; }
    if (s.repeat === 'weekly' && !(s.weekdays && s.weekdays.length)) { toast(tr('请选择星期', 'Choose at least one weekday')); return; }
    if (s.repeat === 'monthly' && !(s.monthdays && s.monthdays.length)) { toast(tr('请选择日期', 'Choose at least one date')); return; }
    if ((s.repeat === 'daily' || s.repeat === 'weekly' || s.repeat === 'monthly') && !/^\d{2}:\d{2}$/.test(s.time || '')) { toast(tr('请选择执行时间', 'Choose a time')); return; }
    var outputs = [];
    if (d.output) {
      if (!d.outputs.length) { toast(tr('请添加输出，或关闭输出', 'Add an output, or turn output off')); return; }
      for (var i = 0; i < d.outputs.length; i++) {
        if (!String(d.outputs[i].name || '').trim()) { toast(tr('请填写输出名称', 'Name each output')); return; }
        outputs.push({ type: d.outputs[i].type === '文件' ? '文件' : '表', name: d.outputs[i].name.trim(), schema: (d.outputs[i].schema || '').trim(), format: d.outputs[i].format || 'Markdown' });
      }
    }
    var existing = ui.editor.id ? taskById(ui.editor.id) : null;
    if (s.repeat === 'interval' && (!existing || !existing.schedule || existing.schedule.repeat !== 'interval' || Number(existing.schedule.intervalHours) !== Number(s.intervalHours))) s.intervalAnchor = new Date().toISOString();
    else if (existing && existing.schedule) s.intervalAnchor = existing.schedule.intervalAnchor || '';
    var task = existing || { id: uid('task'), history: [], running: false, paused: false, completedOnce: false };
    var prevOnce = existing && existing.schedule ? existing.schedule.onceAt : '';
    task.name = name;
    task.description = description;
    task.prompt = prompt || description;
    task.model = d.model;
    task.workspace = d.workspace || null;
    task.inputs = d.inputs.slice();
    task.output = !!d.output;
    task.outputs = outputs;
    task.schedule = {
      repeat: s.repeat, time: s.time || '09:00', weekdays: (s.weekdays || []).slice(), monthdays: (s.monthdays || []).slice(),
      intervalHours: Number(s.intervalHours) || 5, onceAt: s.onceAt || '', intervalAnchor: s.intervalAnchor || ''
    };
    task.time = task.schedule.time;
    if (task.schedule.repeat !== 'once' || prevOnce !== task.schedule.onceAt) task.completedOnce = false;
    if (!existing) tasks.unshift(task);
    syncTemplates(task);
    if (host.taskSaved) host.taskSaved(task);
    ui.editor = null;
    toast(tr('任务已保存', 'Task saved'));
    if (runAfter) runTask(task.id);
    else rerender();
  }
  function runTask(id) {
    var task = taskById(id);
    if (!task) return;
    if (task.running) { toast(tr('该任务正在执行', 'This task is already running')); return; }
    var record = createRecord(task, tr('手动执行', 'Manual'), new Date());
    task.history.unshift(record);
    task.running = true;
    toast(tr('任务已开始执行', 'Run started'));
    rerender();
    task.runTimer = setTimeout(function () {
      if (!taskById(task.id) || record.status !== 'running') return;
      record.status = 'completed';
      record.finishedAt = new Date().toISOString();
      record.summary = runSummary(record);
      makeRunArtifacts(record, task);
      task.running = false;
      task.runTimer = null;
      if (task.schedule && task.schedule.repeat === 'once') task.completedOnce = true;
      toast(tr('模拟执行完成，结果已保存', 'Demo run finished'));
      rerender();
    }, 1600);
  }
  function pauseTask(id) {
    var task = taskById(id);
    if (!task || !task.running) return;
    clearTimeout(task.runTimer);
    task.runTimer = null;
    task.running = false;
    var rec = null;
    (task.history || []).forEach(function (r) { if (!rec && r.status === 'running') rec = r; });
    if (rec) {
      rec.status = 'paused';
      rec.finishedAt = new Date().toISOString();
      rec.summary = runSummary(rec);
    }
    toast(tr('本次执行已暂停', 'This run is paused'));
    rerender();
  }
  function toggleTask(id) {
    var task = taskById(id);
    if (!task) return;
    task.paused = !task.paused;
    toast(task.paused ? tr('定时任务已暂停', 'Schedule paused') : tr('定时任务已开启', 'Schedule enabled'));
    rerender();
  }
  function deleteTask(id) {
    var task = taskById(id);
    if (task && task.runTimer) clearTimeout(task.runTimer);
    tasks = tasks.filter(function (t) { return t.id !== id; });
    if (task && host.taskDeleted) host.taskDeleted(task);
    if (ui.taskDetailId === id) ui.taskDetailId = null;
    if (ui.runId && findRun(ui.runId) == null) ui.runId = null;
    ui.confirm = null;
    toast(tr('定时任务已删除', 'Schedule deleted'));
    rerender();
  }
  function chosen(cap) {
    var id = cap && cap.getAttribute('data-id');
    if (id) return artById(id) ? [id] : [];
    var ids = ui.selected.slice();
    var visible = {};
    filteredArts().forEach(function (a) { visible[a.id] = true; });
    return ids.filter(function (item) { return visible[item] && artById(item); });
  }
  function refLabel(a) {
    if (!a.runSnapshot) return a.name;
    var task = taskById(a.taskId);
    var record = findRun(a.runId);
    return a.name + ' / ' + (task ? task.name : '') + (record ? ' / ' + format(record.startedAt) : '');
  }
  function referenceArts(ids) {
    if (!ids.length) return;
    ids.forEach(function (id) {
      var a = artById(id);
      if (!a) return;
      var label = refLabel(a);
      if (ui.refs.indexOf(label) < 0) ui.refs.push(label);
    });
    if (host.referenceArtifacts) host.referenceArtifacts(ids.map(function (id) { var a = artById(id); return { id: a.id, name: a.name, kind: 'artifact', type: artifactType(a), workspace: artifactWorkspace(a), content: a.content, cols: a.cols, data: a.data }; }));
  }
  function csvOf(a) {
    var rows = [a.cols || []].concat(a.data || []);
    return '\ufeff' + rows.map(function (row) {
      return row.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
  }
  function exportFile(a) {
    var type = artifactType(a);
    var ext = type === 'Markdown' ? 'md' : type === 'JSON' ? 'json' : 'csv';
    var base = String(a.name).replace(/[\\/:*?"<>|]/g, '_');
    var name = new RegExp('\\.' + ext + '$', 'i').test(base) ? base : base + '.' + ext;
    var text = artifactKind(a) === 'table'
      ? csvOf(a)
      : (a.content != null ? a.content : (type === 'Markdown' ? docText(a) : type === 'JSON' ? JSON.stringify(Object.fromEntries(a.data || []), null, 2) : csvOf(a)));
    var mime = ext === 'json' ? 'application/json' : ext === 'md' ? 'text/markdown;charset=utf-8' : 'text/csv;charset=utf-8';
    return { name: name, text: text, mime: mime };
  }
  function crc32(bytes) {
    var c = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) {
      c ^= bytes[i];
      for (var k = 0; k < 8; k++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  function zipBlob(files) {
    var encoder = new TextEncoder();
    var parts = [];
    var central = [];
    var offset = 0;
    files.forEach(function (file) {
      var name = encoder.encode(file.name);
      var data = encoder.encode(file.text);
      var checksum = crc32(data);
      var local = new Uint8Array(30 + name.length);
      var v = new DataView(local.buffer);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true);
      v.setUint32(14, checksum, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, name.length, true);
      local.set(name, 30);
      parts.push(local, data);
      var entry = new Uint8Array(46 + name.length);
      var e = new DataView(entry.buffer);
      e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x800, true);
      e.setUint32(16, checksum, true); e.setUint32(20, data.length, true); e.setUint32(24, data.length, true); e.setUint16(28, name.length, true); e.setUint32(42, offset, true);
      entry.set(name, 46);
      central.push(entry);
      offset += local.length + data.length;
    });
    var end = new Uint8Array(22);
    var ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
    ev.setUint32(12, central.reduce(function (n, a) { return n + a.length; }, 0), true);
    ev.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [end]), { type: 'application/zip' });
  }
  function download(name, blob) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportArts(ids) {
    if (!ids.length) return;
    var used = {};
    var files = ids.map(function (id) {
      var file = exportFile(artById(id));
      var name = file.name;
      var n = 2;
      while (used[name]) {
        name = file.name.replace(/(\.[^.]+)$/, ' (' + n + ')$1');
        n += 1;
      }
      used[name] = true;
      file.name = name;
      return file;
    });
    if (files.length === 1) download(files[0].name, new Blob([files[0].text], { type: files[0].mime }));
    else download(tr('产出物-', 'artifacts-') + ymd(new Date()) + '.zip', zipBlob(files));
    toast(tr('已下载 ', 'Downloaded ') + ids.length + tr(' 份产出物', ' artifacts'));
  }
  function saveArtifact() {
    var a = artById(ui.artifactEdit);
    if (!a) return;
    var name = document.getElementById('artifactEditName').value.trim();
    var content = document.getElementById('artifactEditContent').value;
    var desc = document.getElementById('artifactEditDesc').value.trim();
    var workspace = document.getElementById('artifactEditWorkspace').value;
    if (!name) { toast(tr('请输入名称', 'Enter a name')); return; }
    if (name !== a.name && arts.some(function (other) { return other !== a && !other.deleted && other.name === name; })) { toast(tr('名称已存在', 'That name is already used')); return; }
    if (artifactKind(a) === 'table') {
      var data;
      try {
        data = JSON.parse(content);
        if (!Array.isArray(data) || data.some(function (row) { return !Array.isArray(row) || row.length !== (a.cols || []).length || row.some(function (v) { return v !== null && typeof v === 'object'; }); })) throw new Error('bad');
      } catch (err) {
        toast(tr('表数据需为二维数组，每行 ', 'Rows must be arrays of ') + (a.cols || []).length + tr(' 个值', ' values'));
        return;
      }
      a.data = data;
      a.rows = String(data.length);
    } else if (artifactType(a) === 'JSON') {
      try { JSON.parse(content); } catch (err2) { toast(tr('请输入有效的 JSON 内容', 'Enter valid JSON')); return; }
      a.content = content;
    } else a.content = content;
    var old = a.name;
    a.name = name;
    a.desc = desc;
    a.workspace = workspace === DEFAULT_WS ? null : workspace;
    a.updatedBy = 'Feng Zhu';
    a.updatedAt = format(new Date());
    ui.refs = ui.refs.map(function (r) { return r === old ? name : r; });
    ui.artifactEdit = null;
    toast(tr('产出物已更新', 'Artifact updated'));
    rerender();
  }
  function applyConfirm() {
    if (!ui.confirm) return;
    if (ui.confirm.kind === 'task') { deleteTask(ui.confirm.id); return; }
    ui.confirm.ids.forEach(function (id) {
      var a = artById(id);
      if (!a) return;
      a.deleted = true;
      global.AIOpsResources.remove('artifact', id);
      ui.refs = ui.refs.filter(function (r) { return r !== a.name && r.indexOf(a.name + ' / ') !== 0; });
      if (ui.artifactPreview && ui.artifactPreview.id === id) ui.artifactPreview = null;
      if (ui.taskPreview && ui.taskPreview.id === id) ui.taskPreview = null;
    });
    ui.selected = [];
    ui.confirm = null;
    toast(tr('已删除产出物', 'Artifacts deleted'));
    rerender();
  }

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-artifact-view]')) { e.preventDefault(); selectDetail(e.target.getAttribute('data-artifact-view')); rerender(); }
  });
  function onClick(e) {
    if (!e.target.closest('#capArtActionMenu') && !e.target.closest('[data-cap="art-more"]')) closeArtActionMenu();
    if (!e.target.closest('#capArtColumnFilter') && !e.target.closest('[data-cap="art-column-filter"]')) closeArtColumnFilter();
    if (e.target.closest && e.target.closest('.cap-overlay, .cap-drawer, .cap-menu, .cap-pop') && !(e.target.closest('[data-cap]'))) return;
    var cap = e.target.closest ? e.target.closest('[data-cap]') : null;
    if (cap && cap.matches('input, select, textarea')) cap = null;
    var action = cap ? cap.getAttribute('data-cap') : '';
    var closeMenu = !!(ui.menu && action !== 'task-menu');
    var closeCreate = !!(ui.createOpen && action !== 'task-create-menu' && action !== 'task-create-manual' && action !== 'task-create-chat');
    if (closeMenu) ui.menu = null;
    if (closeCreate) ui.createOpen = false;
    if (!action) {
      var row = e.target.closest('[data-artifact-view]');
      if (row && !e.target.closest('button,input,label,select,textarea')) { selectDetail(row.getAttribute('data-artifact-view')); rerender(); return; }
      if (closeMenu || closeCreate) rerender();
      return;
    }
    if (action === 'dialog') return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (host.closeShellMenus) host.closeShellMenus();
    var id = cap.getAttribute('data-id');
    if (action === 'task-query' || action === 'art-query') return;
    if (action === 'art-search-open') {
      ui.artSearchOpen = true;
      ui.focus = { sel: '#capArtSearch', pos: ui.filters.query.length };
      rerender(); return;
    }
    if (action === 'art-source') {
      ui.filters.source = cap.getAttribute('data-value');
      ui.selected = [];
      ui.focus = { sel: '[data-cap="art-source"][data-value="' + ui.filters.source + '"]' };
      rerender({ resetScroll: true }); return;
    }
    if (action === 'art-more') { openArtActionMenu(id, cap); return; }
    if (action === 'art-column-filter') { openArtColumnFilter(cap.getAttribute('data-key'), cap); return; }
    if (action === 'art-column-clear' && ui.artFilterMenu) { applyArtColumnFilter(ui.artFilterMenu.key, []); return; }
    if (action === 'art-column-sort') {
      ui.filters.sort = ui.filters.sort === 'updated-asc' ? 'updated-desc' : 'updated-asc';
      rerender(); return;
    }
    if (action === 'task-search-open') {
      ui.searchOpen = true;
      ui.focus = { sel: '#capTaskSearch', pos: (ui.taskQuery || '').length };
      rerender();
      return;
    }
    if (action === 'task-tab') { ui.listTab = cap.getAttribute('data-value') === 'runs' ? 'runs' : 'tasks'; rerender(); return; }
    if (action === 'task-filter') { ui.taskFilter = cap.getAttribute('data-value'); rerender(); return; }
    if (action === 'task-create-menu') {
      ui.createOpen = !ui.createOpen;
      ui.menu = null;
      if (ui.createOpen && host.closeShellMenus) host.closeShellMenus();
      rerender();
      return;
    }
    if (action === 'task-create-manual') { openEditor(null, false); rerender(); return; }
    if (action === 'task-create-chat') {
      ui.createOpen = false;
      ui.menu = null;
      if (host.openScheduleChat) host.openScheduleChat();
      else rerender();
      return;
    }
    if (action === 'task-open') { ui.taskDetailId = id; ui.runId = null; ui.taskPreview = null; ui.menu = null; rerender({ resetScroll: true }); return; }
    if (action === 'task-back') { ui.taskDetailId = null; ui.runId = null; ui.taskPreview = null; rerender({ resetScroll: true }); return; }
    if (action === 'run-back') { ui.runId = null; ui.taskPreview = null; rerender(); return; }
    if (action === 'run-open') { ui.runId = id; ui.taskPreview = null; rerender({ resetScroll: true }); return; }
    if (action === 'task-toggle') { toggleTask(id); return; }
    if (action === 'task-menu') {
      if (ui.menu && ui.menu.id === id) ui.menu = null;
      else {
        var rect = cap.getBoundingClientRect();
        ui.menu = { id: id, x: Math.max(8, Math.min(rect.right - 180, window.innerWidth - 196)), y: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 240)) };
        ui.createOpen = false;
        if (host.closeShellMenus) host.closeShellMenus();
      }
      rerender();
      return;
    }
    if (action === 'task-action') {
      var act = cap.getAttribute('data-act');
      ui.menu = null;
      if (act === 'run') runTask(id);
      else if (act === 'pause') pauseTask(id);
      else if (act === 'toggle') toggleTask(id);
      else if (act === 'edit') { openEditor(id, false); rerender(); }
      else if (act === 'history') { ui.taskDetailId = id; ui.runId = null; ui.taskPreview = null; rerender({ resetScroll: true }); }
      else if (act === 'delete') { ui.confirm = { kind: 'task', id: id }; rerender(); }
      else if (act === 'busy') toast(tr('该任务正在执行', 'This task is already running'));
      return;
    }
    if (action === 'task-art') { ui.taskPreview = { id: id, tab: 'content', row: null }; rerender(); return; }
    if (action === 'art-open') { selectDetail(id); rerender(); return; }
    if (action === 'preview-close') {
      if (cap.getAttribute('data-scope') === 'task') ui.taskPreview = null;
      else ui.artifactPreview = null;
      rerender();
      return;
    }
    if (action === 'preview-tab') {
      var preview = cap.getAttribute('data-scope') === 'task' ? ui.taskPreview : ui.artifactPreview;
      if (preview) { preview.tab = cap.getAttribute('data-tab'); preview.row = null; rerender(); }
      return;
    }
    if (action === 'preview-row') {
      var box = cap.getAttribute('data-scope') === 'task' ? ui.taskPreview : ui.artifactPreview;
      if (!box) return;
      var row = Number(cap.getAttribute('data-row'));
      box.row = box.row === row ? null : row;
      rerender();
      return;
    }
    if (action === 'art-reset') {
      ui.filters = { query: '', type: [], by: [], sort: 'updated-desc', source: 'all' };
      ui.artSearchOpen = false;
      ui.selected = [];
      rerender();
      return;
    }
    if (action === 'art-folder') {
      var group = currentGroups()[Number(cap.getAttribute('data-g'))];
      if (!group) return;
      var key = group[0];
      ui.collapsed[key] = !ui.collapsed[key];
      rerender({ keepResourcePanel: !!ui.artifactPreview });
      return;
    }
    if (action === 'art-clear') { ui.selected = []; rerender(); return; }
    if (action === 'art-ref') { referenceArts(chosen(cap)); return; }
    if (action === 'art-export') { exportArts(chosen(cap)); return; }
    if (action === 'art-edit') { ui.artifactEdit = id; rerender(); return; }
    if (action === 'art-delete') {
      var ids = chosen(cap);
      if (!ids.length) return;
      ui.confirm = { kind: 'arts', ids: ids };
      rerender();
      return;
    }
    if (action === 'art-move') {
      var moveIds = chosen(cap);
      if (!moveIds.length) return;
      ui.move = { ids: moveIds };
      rerender();
      return;
    }
    if (action === 'editor-close') { ui.editor = null; rerender(); return; }
    if (action === 'editor-save' || action === 'editor-save-run') { saveEditor(action === 'editor-save-run'); return; }
    if (action === 'editor-add-output') {
      readForm();
      ui.editor.draft.outputs.push({ type: '表', name: '', schema: '', format: 'Markdown' });
      rerender();
      return;
    }
    if (action === 'editor-remove-output') {
      readForm();
      ui.editor.draft.outputs.splice(Number(cap.getAttribute('data-oi')), 1);
      rerender();
      return;
    }
    if (action === 'editor-day') {
      readForm();
      var n = Number(cap.getAttribute('data-n'));
      var arr = cap.getAttribute('data-kind') === 'week' ? ui.editor.draft.schedule.weekdays : ui.editor.draft.schedule.monthdays;
      var at = arr.indexOf(n);
      if (at >= 0) arr.splice(at, 1);
      else arr.push(n);
      arr.sort(function (a, b) { return a - b; });
      rerender();
      return;
    }
    if (action === 'art-edit-close') { ui.artifactEdit = null; rerender(); return; }
    if (action === 'art-save') { saveArtifact(); return; }
    if (action === 'move-close') { ui.move = null; rerender(); return; }
    if (action === 'move-save') {
      var dest = document.getElementById('artifactMoveWorkspace').value;
      (ui.move.ids || []).forEach(function (artId) {
        var item = artById(artId);
        if (!item) return;
        item.workspace = dest === DEFAULT_WS ? null : dest;
        item.updatedBy = 'Feng Zhu';
        item.updatedAt = format(new Date());
      });
      ui.selected = [];
      ui.move = null;
      toast(tr('已移动至所选工作区', 'Moved to the selected workspace'));
      rerender();
      return;
    }
    if (action === 'confirm-close') { ui.confirm = null; rerender(); return; }
    if (action === 'confirm-ok') { applyConfirm(); return; }
  }
  function onInput(e) {
    var action = e.target.getAttribute && e.target.getAttribute('data-cap');
    if (action === 'task-query') {
      if (!e.target.isConnected || e.isComposing || ui.composing) return;
      ui.taskQuery = e.target.value;
      var pos = e.target.selectionStart;
      ui.focus = { sel: '#capTaskSearch', pos: pos == null ? e.target.value.length : pos };
      rerender();
    } else if (action === 'art-query') {
      if (!e.target.isConnected || e.isComposing || ui.composing) return;
      ui.filters.query = e.target.value;
      ui.selected = [];
      ui.focus = { sel: '#capArtSearch', pos: e.target.selectionStart };
      rerender();
    }
  }
  function onChange(e) {
    var el = e.target;
    var action = el.getAttribute && el.getAttribute('data-cap');
    if (!action) return;
    if (action === 'editor-repeat' || action === 'editor-output-type' || action === 'editor-output-enabled') {
      readForm();
      if (action === 'editor-output-enabled') {
        ui.editor.draft.output = el.checked;
        if (ui.editor.draft.output && !ui.editor.draft.outputs.length) ui.editor.draft.outputs.push({ type: '表', name: '', schema: '', format: 'Markdown' });
      }
      rerender();
      return;
    }
    if (action === 'art-column-option' && ui.artFilterMenu) {
      var key = ui.artFilterMenu.key;
      var values = ui.filters[key].filter(function (value) { return value !== el.value; });
      if (el.checked) values.push(el.value);
      applyArtColumnFilter(key, values);
      return;
    }
    if (action === 'art-all') { ui.selected = el.checked ? filteredIds() : []; rerender(); return; }
    if (action === 'art-one') {
      var one = el.getAttribute('data-id');
      if (el.checked) { if (ui.selected.indexOf(one) < 0) ui.selected.push(one); }
      else ui.selected = ui.selected.filter(function (item) { return item !== one; });
      rerender();
      return;
    }
    if (action === 'art-group') {
      var group = currentGroups()[Number(el.getAttribute('data-g'))];
      if (!group) return;
      var set = {};
      ui.selected.forEach(function (item) { set[item] = true; });
      group[1].forEach(function (a) { if (el.checked) set[a.id] = true; else delete set[a.id]; });
      ui.selected = Object.keys(set);
      rerender();
    }
  }
  function onKey(e) {
    if (ui.artActionMenu) {
      if (e.key === 'Escape') { closeArtActionMenu(true); e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (e.key === 'Tab') closeArtActionMenu(true);
      if (e.target.closest('#capArtActionMenu') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(e.key) >= 0) {
        var options = Array.from(document.querySelectorAll('#capArtActionMenu button'));
        var index = options.indexOf(document.activeElement);
        var next = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus(); e.preventDefault(); e.stopImmediatePropagation(); return;
      }
    }
    if (e.key === 'Escape' && ui.artFilterMenu) { closeArtColumnFilter(true); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (e.key === 'Enter' && e.target && e.target.id === 'capTaskSearch' && !e.isComposing && !ui.composing) {
      e.preventDefault();
      e.stopPropagation();
      ui.searchOpen = true;
      ui.taskQuery = '';
      ui.focus = { sel: '#capTaskSearch', pos: 0 };
      rerender();
      return;
    }
    if (e.key === 'Escape') {
      if (ui.confirm || ui.move || ui.artifactEdit || ui.editor || ui.menu || ui.createOpen || ui.taskPreview || ui.artifactPreview) {
        ui.confirm = null; ui.move = null; ui.artifactEdit = null; ui.editor = null; ui.menu = null; ui.createOpen = false; ui.taskPreview = null; ui.artifactPreview = null;
        rerender();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('data-cap') === 'task-open') {
      e.preventDefault();
      ui.taskDetailId = e.target.getAttribute('data-id');
      ui.runId = null;
      ui.taskPreview = null;
      rerender({ resetScroll: true });
    }
  }
  document.addEventListener('scroll', function (e) {
    if (ui.artFilterMenu && e.target.isConnected !== false && !e.target.closest?.('#capArtColumnFilter')) closeArtColumnFilter();
    if (ui.artActionMenu && e.target.isConnected !== false && !e.target.closest?.('#capArtActionMenu')) closeArtActionMenu();
  }, true);
  window.addEventListener('resize', function () { closeArtColumnFilter(); closeArtActionMenu(); });
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('keydown', onKey);
  document.addEventListener('compositionstart', function (e) {
    if (e.target && (e.target.id === 'capTaskSearch' || e.target.id === 'capArtSearch')) ui.composing = true;
  });
  document.addEventListener('compositionend', function (e) {
    if (!e.target || (e.target.id !== 'capTaskSearch' && e.target.id !== 'capArtSearch')) return;
    ui.composing = false;
    if (!e.target.isConnected) return;
    if (e.target.id === 'capArtSearch') { ui.filters.query = e.target.value; ui.selected = []; }
    else ui.taskQuery = e.target.value;
    ui.focus = { sel: '#' + e.target.id, pos: e.target.value.length };
    rerender();
  });
  document.addEventListener('pointerdown', function () { ui.pointerDown = true; }, true);
  document.addEventListener('pointerup', function () {
    setTimeout(function () { ui.pointerDown = false; }, 0);
  }, true);
  document.addEventListener('focusout', function (e) {
    if (e.target && e.target.id === 'capArtSearch') {
      if (ui.composing || e.target.value.trim()) return;
      setTimeout(function () {
        if (document.activeElement && document.activeElement.id === 'capArtSearch') return;
        if (ui.filters.query.trim()) return;
        ui.artSearchOpen = false;
        var input = document.getElementById('capArtSearch');
        if (input) {
          input.closest('label').outerHTML = artSearchControl();
          global.AIOpsResources.afterRender();
          global.AIOpsColumns.afterRender();
          if (global.lucide && global.lucide.createIcons) global.lucide.createIcons({ attrs: { width: 14, height: 14, 'stroke-width': 1.5 } });
        }
      }, 0);
      return;
    }
    if (!e.target || e.target.id !== 'capTaskSearch' || ui.composing || !ui.pointerDown) return;
    if (e.target.closest && e.relatedTarget && e.target.closest('.cap-search-field') && e.relatedTarget.closest && e.relatedTarget.closest('.cap-search-field')) return;
    if (String(e.target.value || '').trim()) return;
    setTimeout(function () {
      if (document.activeElement && document.activeElement.id === e.target.id) return;
      ui.taskQuery = '';
      ui.searchOpen = false;
      rerender();
    }, 0);
  });

  function onNavigate(page) {
    ui.artSearchOpen = false;
    closeArtColumnFilter(); closeArtActionMenu();
    ui.menu = null;
    ui.createOpen = false;
    var keep = page === '定时任务' ? ui.keepEditor : null;
    var pendingTask = page === '定时任务' ? ui.pendingTask : null;
    var pendingArt = page === '产出物' ? ui.pendingArtifact : null;
    ui.keepEditor = null;
    ui.pendingTask = null;
    ui.pendingArtifact = null;
    if (page !== '定时任务') {
      ui.taskDetailId = null;
      ui.runId = null;
      ui.taskPreview = null;
      ui.editor = null;
    } else if (pendingTask) {
      var task = null;
      tasks.forEach(function (t) { if (t.name === pendingTask) task = t; });
      ui.taskDetailId = task ? task.id : null;
      ui.runId = null;
      ui.taskPreview = null;
      ui.editor = null;
    } else if (keep) {
      ui.taskDetailId = null;
      ui.runId = null;
      ui.taskPreview = null;
      openEditor(null, keep === 'ai');
    } else {
      ui.taskDetailId = null;
      ui.runId = null;
      ui.taskPreview = null;
      ui.editor = null;
    }
    if (page !== '产出物') {
      global.AIOpsResources.dismiss('artifact');
      ui.artifactPreview = null;
      ui.artifactEdit = null;
    } else if (pendingArt && artById(pendingArt)) {
      var art = artById(pendingArt);
      ui.filters = { query: '', type: [], by: [], sort: 'updated-desc', source: 'all' };
      ui.artSearchOpen = false;
      ui.selected = [];
      ui.artifactPreview = { id: art.id, tab: 'content', row: null };
    } else {
      ui.artifactPreview = null;
      ui.artifactEdit = null;
    }
    if (page !== '定时任务' && page !== '产出物') ui.confirm = ui.move = null;
  }
  function afterRender() {
    if (ui.artActionMenu && !ui.artActionMenu.anchor.isConnected) closeArtActionMenu();
    positionArtColumnFilter();
    if (ui.focus) {
      var target = document.querySelector(ui.focus.sel);
      var pos = ui.focus.pos;
      ui.focus = null;
      if (target) {
        target.focus();
        if (pos != null && target.setSelectionRange) {
          var p = Math.min(pos, target.value.length);
          target.setSelectionRange(p, p);
        }
      }
    }
    if (!document.getElementById('capArtAll') && !document.querySelector('[data-cap="art-group"]')) return;
    var ids = filteredIds();
    var picked = ids.filter(function (id) { return ui.selected.indexOf(id) >= 0; }).length;
    var all = document.getElementById('capArtAll');
    if (all) all.indeterminate = picked > 0 && picked < ids.length;
    currentGroups().forEach(function (g, i) {
      var box = document.querySelector('[data-cap="art-group"][data-g="' + i + '"]');
      if (!box) return;
      var count = g[1].filter(function (a) { return ui.selected.indexOf(a.id) >= 0; }).length;
      box.indeterminate = count > 0 && count < g[1].length;
    });
  }

  global.AIOpsCapability = {
    bind: function (next) { if (next) host = next; },
    schedulesPage: schedulesPage,
    artifactsPage: artifactsPage,
    selectDetail: selectDetail,
    onNavigate: onNavigate,
    afterRender: afterRender,
    renameByName: function (oldName, name) {
      var task = tasks.filter(function (t) { return t.name === oldName; })[0];
      if (!task) return;
      task.name = name;
      (task.history || []).forEach(function (record) { record.taskName = name; });
      if (host.taskSaved) host.taskSaved(task);
    },
    deleteByName: function (name) {
      var task = tasks.filter(function (t) { return t.name === name; })[0];
      if (task) deleteTask(task.id);
    },
    moveWorkspace: function (oldName, newName) {
      var defaultName = global.AIOpsWorkspaces.defaultName();
      tasks.forEach(function (task) { if ((task.workspace || defaultName) === oldName) task.workspace = newName; });
      arts.forEach(function (art) { if ((art.workspace || defaultName) === oldName) art.workspace = newName; });
      if (ui.editor && ui.editor.draft.workspace === oldName) ui.editor.draft.workspace = newName;
    },
    focusTask: function (name) { ui.pendingTask = name; },
    focusArtifact: function (key) {
      var id = WIDGET_ART[key] || (artById(key) ? key : null);
      if (!id) return false;
      ui.pendingArtifact = id;
      return true;
    },
    isTaskName: function (name) { return tasks.some(function (t) { return t.name === name; }); },
    startCreate: function (mode) { ui.keepEditor = mode === 'ai' ? 'ai' : 'manual'; },
    dismissMenus: function () {
      if (!ui.createOpen && !ui.menu) return;
      ui.createOpen = false;
      ui.menu = null;
      rerender();
    }
  };
})(window);
