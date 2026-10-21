/* AI Ops — left nav from Figma AgentOS-2.0 319:48545; homepage = configurable widgets schematic */

(function () {
  var state = {
    page: '工作台',
    range: 1,
    artifactTab: '工作区',
    notifyType: 'all',
    wsOpen: true,
    newOpen: false,
    lang: 'zh'
  };

  var I18N = {
    '工作台': { zh: '工作台', en: 'Workbench' },
    '定时任务': { zh: '定时任务', en: 'Schedules' },
    '线上会话': { zh: '线上会话', en: 'Live sessions' },
    '产出物': { zh: '产出物', en: 'Artifacts' },
    '成本分析': { zh: '成本分析', en: 'Cost analysis' },
    '健康度分析': { zh: '健康度分析', en: 'Health analysis' },
    '用户行为分析': { zh: '用户行为分析', en: 'User behavior' },
    '自定义看板': { zh: '自定义看板', en: 'Custom dashboards' },
    '分析任务': { zh: '分析任务', en: 'Analysis task' },
    '消息通知': { zh: '消息通知', en: 'Notifications' },
    '默认工作区': { zh: '默认工作区', en: 'Default workspace' },
    '关联审核智能体': { zh: '关联审核智能体', en: 'Linked audit agents' },
    '制造业规则被否决原因': { zh: '制造业规则被否决原因', en: 'Manufacturing rule rejections' },
    '10 月 9 日成本峰值排查': { zh: '10 月 9 日成本峰值排查', en: 'Oct 9 cost spike review' },
    '高频重复提问与用户反馈': { zh: '高频重复提问与用户反馈', en: 'Repeat questions & feedback' },
    '两会话问题复盘': { zh: '两会话问题复盘', en: 'Two-session postmortem' },
    '成本与业务指标日报': { zh: '成本与业务指标日报', en: 'Cost & business daily' },
    '核验项与规则变更抽取': { zh: '核验项与规则变更抽取', en: 'Checks & rule-change extract' },
    '监测': { zh: '监测', en: 'Monitor' },
    '工作区': { zh: '工作区', en: 'Workspace' },
    '本期不包含': { zh: '本期不包含', en: 'Not in this release' },
    '新建': { zh: '新建', en: 'New' },
    '创建工作区': { zh: '创建工作区', en: 'Create workspace' },
    '今日': { zh: '今日', en: 'Today' },
    '天': { zh: '天', en: 'd' },
    '全部': { zh: '全部', en: 'All' },
    '编辑组件': { zh: '编辑组件', en: 'Edit widgets' },
    '更新后缀': { zh: '更新', en: 'updated' },
    '核心监测看板': { zh: '核心监测看板', en: 'Core monitor' },
    '打开成本分析': { zh: '打开成本分析', en: 'Open cost analysis' },
    '活跃会话': { zh: '活跃会话', en: 'Active sessions' },
    '异常率': { zh: '异常率', en: 'Error rate' },
    '总 Token': { zh: '总 Token', en: 'Total tokens' },
    '警告': { zh: '警告', en: 'Warnings' },
    '定时任务执行情况': { zh: '定时任务执行情况', en: 'Schedule status' },
    '全部任务': { zh: '全部任务', en: 'All tasks' },
    '成功': { zh: '成功', en: 'Success' },
    '失败': { zh: '失败', en: 'Failed' },
    '今日时': { zh: '今日', en: 'Today' },
    '昨日': { zh: '昨日', en: 'Yesterday' },
    '慢响应周报': { zh: '慢响应周报', en: 'Slow-response weekly' },
    '新产出物': { zh: '新产出物', en: 'New artifacts' },
    '查看全部': { zh: '查看全部', en: 'View all' },
    '成本与性能日报': { zh: '成本与性能日报', en: 'Cost & performance daily' },
    '核验项明细': { zh: '核验项明细', en: 'Check-item details' },
    '表 · 系统': { zh: '表 · 系统', en: 'Table · System' },
    '文档 · Feng Zhu': { zh: '文档 · Feng Zhu', en: 'Doc · Feng Zhu' },
    '昨天': { zh: '昨天', en: 'Yesterday' },
    '通知': { zh: '通知', en: 'Alerts' },
    '消息中心': { zh: '消息中心', en: 'Inbox' },
    '规则变更待审批': { zh: '规则变更待审批', en: 'Rule change pending' },
    '采购 Agent 连续失败': { zh: '采购 Agent 连续失败', en: 'Procurement agent failing' },
    '慢响应轮次率升高': { zh: '慢响应轮次率升高', en: 'Slow-turn rate rising' },
    '审批': { zh: '审批', en: 'Approval' },
    '严重': { zh: '严重', en: 'Critical' },
    '告警': { zh: '告警', en: 'Alert' },
    '健康度快览': { zh: '健康度快览', en: 'Health snapshot' },
    '详情': { zh: '详情', en: 'Details' },
    '异常会话率': { zh: '异常会话率', en: 'Abnormal session rate' },
    '慢响应轮次率': { zh: '慢响应轮次率', en: 'Slow-turn rate' },
    '添加 Widget': { zh: '添加 Widget', en: 'Add widget' },
    '首页示意': { zh: '首页为可配置看板 · 示意', en: 'Configurable home · schematic' },
    '骨架说明': { zh: '页面骨架示意，细节与交互稍后按你的反馈调整。', en: 'Page scaffold — details to refine with your feedback.' },
    '分析任务副': { zh: '描述分析需求，创建一次探索。', en: 'Describe an analysis need and start exploring.' },
    '分析占位': { zh: '描述分析需求，@ 引用上下文，/ 选择技能', en: 'Describe need, @ context, / skills' },
    '附件': { zh: '＋ 附件', en: '+ Attach' },
    '发送': { zh: '发送', en: 'Send' },
    '定时任务副': { zh: '查看任务状态、调度和产出。', en: 'View status, schedule, and outputs.' },
    '搜索任务': { zh: '搜索任务名称或描述…', en: 'Search task name or description…' },
    '创建': { zh: '创建', en: 'Create' },
    '查看': { zh: '查看', en: 'View' },
    '运行中': { zh: '运行中', en: 'Running' },
    '任务描述1': { zh: '汇总前一日成本、token、平均耗时与报告生成率。', en: 'Summarize prior-day cost, tokens, latency, and report rate.' },
    '任务描述2': { zh: '抽取核验项明细与规则变更，写入产出物。', en: 'Extract check items and rule changes into artifacts.' },
    '每天': { zh: '每天', en: 'Daily' },
    '搜索会话': { zh: '搜索会话信息、编号或用户', en: 'Search session, ID, or user' },
    '会话数': { zh: '4 个会话', en: '4 sessions' },
    '会话': { zh: '会话', en: 'Session' },
    '用户': { zh: '用户', en: 'User' },
    '状态': { zh: '状态', en: 'Status' },
    '最新时间': { zh: '最新时间', en: 'Updated' },
    '消息数': { zh: '消息数', en: 'Messages' },
    '异常': { zh: '异常', en: 'Error' },
    '正常': { zh: '正常', en: 'OK' },
    '警告态': { zh: '警告', en: 'Warn' },
    '销售分货 Agent': { zh: '销售分货 Agent', en: 'Sales allocation agent' },
    '采购计划 Agent': { zh: '采购计划 Agent', en: 'Procurement plan agent' },
    '销售订单 Agent': { zh: '销售订单 Agent', en: 'Sales order agent' },
    '供应商评估 Agent': { zh: '供应商评估 Agent', en: 'Supplier eval agent' },
    '搜索产出物': { zh: '搜索名称、描述或更新人', en: 'Search name, description, or updater' },
    '名称': { zh: '名称', en: 'Name' },
    '类型': { zh: '类型', en: 'Type' },
    '更新人': { zh: '更新人', en: 'Updated by' },
    '更新时间': { zh: '更新时间', en: 'Updated at' },
    '表': { zh: '表', en: 'Table' },
    '文档': { zh: '文档', en: 'Doc' },
    '系统': { zh: '系统', en: 'System' },
    '关账审核智能体': { zh: '关账审核智能体', en: 'Close-audit agent' },
    '总Token': { zh: '总 Token', en: 'Total tokens' },
    '输入Token': { zh: '输入 Token', en: 'Input tokens' },
    '输出Token': { zh: '输出 Token', en: 'Output tokens' },
    '模型调用次数': { zh: '模型调用次数', en: 'Model calls' },
    '次': { zh: '次', en: '' },
    '平均每轮 Token 消耗': { zh: '平均每轮 Token 消耗', en: 'Avg tokens / turn' },
    '平均每会话 Token 消耗': { zh: '平均每会话 Token 消耗', en: 'Avg tokens / session' },
    'help总': { zh: '所选范围内使用的 Token 总量。', en: 'Total tokens in the selected range.' },
    'help入': { zh: '输入侧 Token 总量。', en: 'Input-side token total.' },
    'help出': { zh: '输出侧 Token 总量。', en: 'Output-side token total.' },
    'help次': { zh: '所选范围内模型调用总次数。', en: 'Model call count in range.' },
    'help轮': { zh: '总 Token / 轮次。', en: 'Total tokens / turns.' },
    'help会话': { zh: '总 Token / 会话数。', en: 'Total tokens / sessions.' },
    'Token 用量趋势': { zh: 'Token 用量趋势', en: 'Token usage trend' },
    '按日统计': { zh: 'Mock · 按日统计', en: 'Mock · daily' },
    '报错分析': { zh: '报错分析', en: 'Error analysis' },
    '工具调用失败率': { zh: '工具调用失败率', en: 'Tool failure rate' },
    '轮次错误率': { zh: '轮次错误率', en: 'Turn error rate' },
    '警告事件数': { zh: '警告事件数', en: 'Warning events' },
    '日环比下': { zh: '−0.3% 日环比', en: '−0.3% DoD' },
    '日环比上': { zh: '+0.2% 日环比', en: '+0.2% DoD' },
    '日环比平': { zh: '0% 日环比', en: '0% DoD' },
    '日环比警': { zh: '+8.0% 日环比', en: '+8.0% DoD' },
    'help异常': { zh: '异常会话 / 总会话。', en: 'Abnormal / total sessions.' },
    'help工具': { zh: '失败工具调用 / 总调用。', en: 'Failed tool calls / total.' },
    'help轮错': { zh: '错误轮次 / 总轮次。', en: 'Error turns / total turns.' },
    'help警告': { zh: '告警事件总数。', en: 'Total warning events.' },
    '健康度趋势': { zh: '健康度趋势', en: 'Health trend' },
    '活跃会话数': { zh: '活跃会话数', en: 'Active sessions' },
    '活跃用户数': { zh: '活跃用户数', en: 'Active users' },
    '人均会话数': { zh: '人均会话数', en: 'Sessions / user' },
    '平均会话轮次': { zh: '平均会话轮次', en: 'Avg turns / session' },
    '个会话': { zh: '个会话', en: 'sessions' },
    '位用户': { zh: '位用户', en: 'users' },
    '次每人': { zh: '次 / 人', en: '/ user' },
    '轮会话': { zh: '轮 / 会话', en: 'turns / session' },
    '活跃趋势': { zh: '活跃会话 / 活跃用户趋势', en: 'Sessions / users trend' },
    '自定义看板副': { zh: '围绕业务目标，组合数据与指标', en: 'Compose metrics around business goals' },
    '新建看板': { zh: '新建看板', en: 'New dashboard' },
    '自定义': { zh: '自定义', en: 'Custom' },
    '关账业务效果': { zh: '关账业务效果', en: 'Close-audit impact' },
    '关账描述': { zh: '追踪关账核验通过率与规则变更', en: 'Track pass rate and rule changes' },
    '销售分货健康度': { zh: '销售分货健康度', en: 'Sales allocation health' },
    '销售描述': { zh: '异常会话、慢响应与规则触发', en: 'Errors, slow turns, rule hits' },
    '指标数6': { zh: '6 个指标', en: '6 metrics' },
    '指标数4': { zh: '4 个指标', en: '4 metrics' },
    '全部标为已读': { zh: '全部标为已读', en: 'Mark all read' },
    '严重问题': { zh: '严重问题', en: 'Critical' },
    '今天': { zh: '今天', en: 'Today' },
    '工作区骨架': { zh: '工作区会话 / 任务详情骨架', en: 'Workspace session / task scaffold' },
    '筛选范围': { zh: '筛选范围', en: 'Filter scope' },
    '统计时间': { zh: '统计时间', en: 'Time range' },
    'Language': { zh: '选择语言', en: 'Language' },
    'Profile': { zh: '个人资料', en: 'Profile' },
    'Version update': { zh: '版本更新', en: 'Version update' },
    'Log out': { zh: '退出登录', en: 'Log out' },
    '账号菜单': { zh: '账号菜单', en: 'Account menu' },
    '切换项目': { zh: '切换项目', en: 'Switch project' }
  };

  function t(key) {
    var row = I18N[key];
    if (!row) return key;
    return row[state.lang] || row.zh || key;
  }

  function daysLabel(n) {
    return state.lang === 'en' ? n + 'd' : n + ' ' + t('天');
  }

  function updatedLabel() {
    return '2026-10-21 00:00 ' + t('更新后缀');
  }

  var NAV_PRIMARY = [
    { id: '工作台', icon: 'house' },
    { id: '定时任务', icon: 'clock' },
    { id: '线上会话', icon: 'messages-square' },
    { id: '产出物', icon: 'file-text' }
  ];

  var NAV_MONITOR = [
    { id: '成本分析', icon: 'report-money', iconSet: 'tabler' },
    { id: '健康度分析', icon: 'heartbeat', iconSet: 'tabler' },
    { id: '用户行为分析', icon: 'users-round' },
    { id: '自定义看板', icon: 'layout-grid', note: '本期不包含' }
  ];

  var WS_CHILDREN = [
    { id: '制造业规则被否决原因', kind: 'session' },
    { id: '10 月 9 日成本峰值排查', kind: 'session' },
    { id: '高频重复提问与用户反馈', kind: 'session' },
    { id: '两会话问题复盘', kind: 'session' },
    { id: '成本与业务指标日报', kind: 'schedule', icon: 'clock' },
    { id: '核验项与规则变更抽取', kind: 'schedule', icon: 'clock' }
  ];

  /* Tabler outline paths — stroke 1.5 to match Lucide nav chrome */
  var TABLER_ICONS = {
    'report-money':
      '<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/>' +
      '<path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"/>' +
      '<path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5"/>' +
      '<path d="M12 17v1m0 -8v1"/>',
    heartbeat:
      '<path d="M19.5 13.572l-7.5 7.428l-2.896 -2.868m-6.117 -8.104a5 5 0 0 1 9.013 -3.022a5 5 0 1 1 7.5 6.572"/>' +
      '<path d="M3 13h2l2 3l2 -6l1 3h3"/>',
    'layout-grid-add':
      '<path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>' +
      '<path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>' +
      '<path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>' +
      '<path d="M14 17h6m-3 -3v6"/>'
  };

  function lucideIcon(name) {
    return '<i data-lucide="' + name + '"></i>';
  }

  function tablerIcon(name) {
    var body = TABLER_ICONS[name];
    if (!body) return lucideIcon(name);
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon" data-tabler="' +
      name +
      '" aria-hidden="true">' +
      body +
      '</svg>'
    );
  }

  function navIcon(item) {
    if (!item || !item.icon) return lucideIcon('layout-grid');
    if (item.iconSet === 'tabler') return tablerIcon(item.icon);
    return lucideIcon(item.icon);
  }

  function paintIcons() {
    if (typeof lucide === 'undefined' || !lucide.createIcons) return;
    lucide.createIcons({
      attrs: {
        width: 16,
        height: 16,
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function navItem(item) {
    var active = state.page === item.id;
    return (
      '<button class="aiops-nav-item' + (active ? ' is-active' : '') + '" type="button" data-page="' + esc(item.id) + '"' +
        (active ? ' aria-current="page"' : '') + '>' +
        '<span class="ico" aria-hidden="true">' + navIcon(item) + '</span>' +
        '<span class="aiops-nav-label">' + esc(t(item.id)) + '</span>' +
        (item.note ? '<span class="aiops-nav-note">' + esc(t(item.note)) + '</span>' : '') +
      '</button>'
    );
  }

  function renderNav() {
    var nav = document.getElementById('aiopsNav');
    if (!nav) return;

    var children = state.wsOpen
      ? WS_CHILDREN.map(function (c) {
          var active = state.page === c.id;
          return (
            '<button class="aiops-nav-item is-child' + (active ? ' is-active' : '') + '" type="button" data-page="' + esc(c.id) + '"' +
              (active ? ' aria-current="page"' : '') + '>' +
              (c.icon ? '<span class="ico" aria-hidden="true">' + lucideIcon(c.icon) + '</span>' : '') +
              '<span class="aiops-nav-label">' + esc(t(c.id)) + '</span>' +
            '</button>'
          );
        }).join('')
      : '';

    nav.innerHTML =
      '<div class="aiops-nav-group">' +
        NAV_PRIMARY.map(navItem).join('') +
      '</div>' +
      '<div class="aiops-nav-group">' +
        '<div class="aiops-side-label">' + esc(t('监测')) + '</div>' +
        NAV_MONITOR.map(navItem).join('') +
      '</div>' +
      '<div class="aiops-nav-group is-last">' +
        '<div class="aiops-side-label has-action">' +
          '<span>' + esc(t('工作区')) + '</span>' +
          '<button type="button" class="aiops-label-plus" aria-label="' + esc(t('创建工作区')) + '" title="' + esc(t('创建工作区')) + '">' +
            lucideIcon('plus') +
          '</button>' +
        '</div>' +
        '<button class="aiops-nav-item is-folder' + (state.wsOpen ? ' is-open' : '') + '" type="button" data-ws-toggle="1">' +
          '<span class="ico" aria-hidden="true">' + lucideIcon(state.wsOpen ? 'folder-open' : 'folder-closed') + '</span>' +
          '<span class="aiops-nav-label">' + esc(t('关联审核智能体')) + '</span>' +
        '</button>' +
        children +
        '<button class="aiops-nav-item" type="button" data-page="默认工作区">' +
          '<span class="ico" aria-hidden="true">' + lucideIcon('folder-closed') + '</span>' +
          '<span class="aiops-nav-label">' + esc(t('默认工作区')) + '</span>' +
        '</button>' +
      '</div>';

    var notify = document.getElementById('navNotify');
    if (notify) notify.classList.toggle('is-active', state.page === '消息通知');

    var newMenu = document.getElementById('newMenu');
    var btnNew = document.getElementById('btnNew');
    if (newMenu) newMenu.hidden = !state.newOpen;
    if (btnNew) {
      btnNew.setAttribute('aria-expanded', state.newOpen ? 'true' : 'false');
      btnNew.classList.toggle('is-open', state.newOpen);
    }
  }

  function rangeActions(updated) {
    updated = updated || updatedLabel();
    var segs = [1, 7, 14]
      .map(function (x) {
        var label = x === 1 ? t('今日') : daysLabel(x);
        return (
          '<button type="button" data-range="' + x + '" class="' + (state.range === x ? 'is-active' : '') + '">' +
            label +
          '</button>'
        );
      })
      .join('');
    return (
      '<div class="res-toolbar-actions">' +
        '<span class="res-count">' + esc(updated) + '</span>' +
        '<span class="res-toolbar-sep" aria-hidden="true"></span>' +
        '<div class="ov-segment" role="group" aria-label="' + esc(t('统计时间')) + '">' + segs + '</div>' +
        (window.AIOpsBoards && isAnalysisPage(state.page)
          ? window.AIOpsBoards.scopePicker()
          : '<button class="ov-scope" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="' +
            esc(t('筛选范围')) +
            '">' +
            t('全部') +
            ' ' +
            lucideIcon('chevron-down') +
            '</button>') +
      '</div>'
    );
  }

  function isAnalysisPage(page) {
    return page === '成本分析' || page === '健康度分析' || page === '用户行为分析';
  }

  function heading(title, sub) {
    return (
      '<div class="page-heading">' +
        '<h1>' + esc(title) + '</h1>' +
        (sub ? '<p>' + esc(sub) + '</p>' : '') +
      '</div>'
    );
  }

  /* Title left; update time + range filters flush right of the heading row */
  function headingWithRange(title, updated) {
    return (
      '<div class="page-heading has-actions">' +
        '<h1>' + esc(title) + '</h1>' +
        rangeActions(updated) +
      '</div>'
    );
  }

  function metricCards(items) {
    return (
      '<div class="ov-metrics ov-metrics-' + Math.min(items.length, 6) + '">' +
        items
          .map(function (m) {
            return (
              '<div class="ov-card">' +
                '<div class="ov-card-label">' +
                  esc(m.name) +
                  '<span class="ov-info" title="' + esc(m.help || '') + '" aria-hidden="true">' + lucideIcon('info') + '</span>' +
                '</div>' +
                '<strong class="ov-value">' + esc(m.value) + '</strong>' +
                (m.unit ? '<span class="ov-unit">' + esc(m.unit) + '</span>' : '') +
                (m.change
                  ? '<span class="ov-change ' + (m.dir || 'is-neutral') + '">' + esc(m.change) + '</span>'
                  : '') +
              '</div>'
            );
          })
          .join('') +
      '</div>'
    );
  }

  function chartPlaceholder(title, note) {
    return (
      '<div class="ov-chart">' +
        '<div class="ov-chart-head"><div class="ov-chart-title">' + esc(title) + '</div></div>' +
        '<div class="chart-placeholder" aria-hidden="true">' +
          '<svg viewBox="0 0 640 160" preserveAspectRatio="none">' +
            '<line x1="40" y1="20" x2="40" y2="130" stroke="#f0f0f0"/>' +
            '<line x1="40" y1="130" x2="620" y2="130" stroke="#f0f0f0"/>' +
            '<polyline fill="none" stroke="#0d99ff" stroke-width="2" points="40,110 120,90 200,95 280,60 360,70 440,45 520,55 600,35"/>' +
            '<polyline fill="none" stroke="#f59e0b" stroke-width="2" points="40,120 120,115 200,100 280,105 360,88 440,92 520,78 600,70"/>' +
          '</svg>' +
        '</div>' +
        (note ? '<p class="chart-note">' + esc(note) + '</p>' : '') +
      '</div>'
    );
  }

  function panel(title, body) {
    return (
      '<section class="panel">' +
        '<div class="panel-head"><h2>' + esc(title) + '</h2></div>' +
        body +
      '</section>'
    );
  }

  function scaffoldNote() {
    return '<p class="ov-note">' + esc(t('骨架说明')) + '</p>';
  }

  function applyStaticLang() {
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    });
    var menu = document.getElementById('acctMenu');
    if (menu) {
      menu.querySelectorAll('.lang-seg button').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-lang') === state.lang);
      });
    }
    try {
      localStorage.setItem('aiops-lang', state.lang);
    } catch (e) {}
  }

  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'zh';
    applyStaticLang();
    render();
  }

  /* ─── Homepage widgets schematic ─── */

  function widgetShell(opts) {
    var cls = 'widget';
    if (opts.wide) cls += ' is-wide';
    if (opts.tall) cls += ' is-tall';
    if (opts.span) cls += ' is-span-' + opts.span;
    return (
      '<section class="' + cls + '" data-widget="' + esc(opts.id) + '">' +
        '<header class="widget-head">' +
          '<div class="widget-title">' +
            '<span class="widget-ico" aria-hidden="true">' + lucideIcon(opts.icon) + '</span>' +
            '<strong>' + esc(opts.title) + '</strong>' +
          '</div>' +
          '<div class="widget-actions">' +
            (opts.action
              ? '<button type="button" class="widget-link" data-page="' + esc(opts.action.page) + '">' + esc(opts.action.label) + '</button>'
              : '') +
            '<button type="button" class="widget-more" aria-label="Widget 设置" title="可配置（示意）">' +
              lucideIcon('grip-vertical') +
            '</button>' +
          '</div>' +
        '</header>' +
        '<div class="widget-body">' + opts.body + '</div>' +
      '</section>'
    );
  }

  function pageHome() {
    var monitor = widgetShell({
      id: 'core-monitor',
      icon: 'activity',
      title: t('核心监测看板'),
      action: { page: '成本分析', label: t('打开成本分析') },
      body:
        '<div class="widget-metrics">' +
          [
            [t('活跃会话'), '328', '+4.2%'],
            [t('异常率'), '2.4%', '−0.3%'],
            [t('总 Token'), '95.4M', '+5.1%'],
            [t('警告'), '47', '+8']
          ]
            .map(function (m) {
              return (
                '<div class="widget-metric">' +
                  '<span>' + esc(m[0]) + '</span><strong>' + m[1] + '</strong><em>' + m[2] + '</em>' +
                '</div>'
              );
            })
            .join('') +
        '</div>' +
        '<div class="widget-spark" aria-hidden="true">' +
          '<svg viewBox="0 0 480 72" preserveAspectRatio="none">' +
            '<polyline fill="none" stroke="#1F82EB" stroke-width="2" points="0,50 40,46 80,42 120,48 160,30 200,34 240,22 280,28 320,18 360,24 400,16 440,20 480,12"/>' +
          '</svg>' +
        '</div>'
    });

    var schedules = widgetShell({
      id: 'schedules',
      icon: 'clock',
      title: t('定时任务执行情况'),
      action: { page: '定时任务', label: t('全部任务') },
      body:
        '<ul class="widget-list">' +
          [
            [t('成本与业务指标日报'), t('今日时') + ' 08:00', t('成功'), 'ok'],
            [t('核验项与规则变更抽取'), t('今日时') + ' 08:15', t('成功'), 'ok'],
            [t('慢响应周报'), t('昨日') + ' 09:00', t('失败'), 'err']
          ]
            .map(function (r) {
              return (
                '<li><div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>' +
                  '<span class="widget-status is-' + r[3] + '">' + esc(r[2]) + '</span></li>'
              );
            })
            .join('') +
        '</ul>'
    });

    var artifacts = widgetShell({
      id: 'artifacts',
      icon: 'file-text',
      title: t('新产出物'),
      action: { page: '产出物', label: t('查看全部') },
      body:
        '<ul class="widget-list">' +
          [
            [t('成本与性能日报'), t('表 · 系统'), '08:02'],
            [t('核验项明细'), t('表 · 系统'), '08:16'],
            [t('制造业规则被否决原因'), t('文档 · Feng Zhu'), t('昨天')]
          ]
            .map(function (r) {
              return (
                '<li><div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>' +
                  '<time>' + esc(r[2]) + '</time></li>'
              );
            })
            .join('') +
        '</ul>'
    });

    var notify = widgetShell({
      id: 'notify',
      icon: 'bell',
      title: t('通知'),
      action: { page: '消息通知', label: t('消息中心') },
      body:
        '<ul class="widget-list">' +
          [
            [t('规则变更待审批'), t('审批'), '18:20'],
            [t('采购 Agent 连续失败'), t('严重'), '18:21'],
            [t('慢响应轮次率升高'), t('告警'), '17:58']
          ]
            .map(function (r) {
              return (
                '<li class="is-unread"><div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>' +
                  '<time>' + esc(r[2]) + '</time></li>'
              );
            })
            .join('') +
        '</ul>'
    });

    var health = widgetShell({
      id: 'health',
      icon: 'heart-pulse',
      title: t('健康度快览'),
      action: { page: '健康度分析', label: t('详情') },
      body:
        '<div class="widget-metrics is-2">' +
          '<div class="widget-metric"><span>' + esc(t('异常会话率')) + '</span><strong>2.4%</strong><em class="is-good">−0.3%</em></div>' +
          '<div class="widget-metric"><span>' + esc(t('慢响应轮次率')) + '</span><strong>4.2%</strong><em class="is-good">−0.4%</em></div>' +
        '</div>'
    });

    var add = (
      '<button type="button" class="widget widget-add" aria-label="' + esc(t('添加 Widget')) + '">' +
        lucideIcon('plus') +
        '<span>' + esc(t('添加 Widget')) + '</span>' +
        '<small>' + esc(t('首页示意')) + '</small>' +
      '</button>'
    );

    var rangeSegs = [1, 7, 14]
      .map(function (x) {
        var label = x === 1 ? t('今日') : daysLabel(x);
        return (
          '<button type="button" data-range="' + x + '" class="' + (state.range === x ? 'is-active' : '') + '">' +
            label +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="home-content">' +
        '<div class="home-top">' +
          '<div class="page-heading">' +
            '<h1>' + esc(t('工作台')) + '</h1>' +
          '</div>' +
          '<div class="home-top-actions">' +
            '<div class="ov-segment" role="group" aria-label="' + esc(t('统计时间')) + '">' + rangeSegs + '</div>' +
            '<button class="ov-scope" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(t('筛选范围')) + '">' +
              t('全部') + ' ' + lucideIcon('chevron-down') +
            '</button>' +
            '<button type="button" class="btn-soft" id="btnEditHome">' +
              tablerIcon('layout-grid-add') +
              ' ' + esc(t('编辑组件')) +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="widget-grid">' +
          monitor + schedules + artifacts + notify + health + add +
        '</div>' +
      '</div>'
    );
  }

  function pageNewTask() {
    return (
      heading(t('分析任务'), t('分析任务副')) +
      '<div class="composer-card">' +
        '<div class="composer-fake">' + esc(t('分析占位')) + '</div>' +
        '<div class="composer-foot">' +
          '<button type="button" class="btn-soft">' + esc(t('附件')) + '</button>' +
          '<button type="button" class="btn-ink">' + esc(t('发送')) + '</button>' +
        '</div>' +
      '</div>' +
      scaffoldNote()
    );
  }

  function pageSchedules() {
    var tasks = [
      {
        name: t('成本与业务指标日报'),
        time: t('每天') + ' 08:00',
        status: t('运行中'),
        desc: t('任务描述1')
      },
      {
        name: t('核验项与规则变更抽取'),
        time: t('每天') + ' 08:15',
        status: t('运行中'),
        desc: t('任务描述2')
      }
    ];
    return (
      heading(t('定时任务'), t('定时任务副')) +
      '<div class="tool-row">' +
        '<label class="search-field">' + lucideIcon('search') +
          '<input type="search" placeholder="' + esc(t('搜索任务')) + '" /></label>' +
        '<button type="button" class="btn-ink">' + lucideIcon('plus') + ' ' + esc(t('创建')) + '</button>' +
      '</div>' +
      '<div class="card-list">' +
        tasks
          .map(function (task) {
            return (
              '<article class="list-card">' +
                '<div><h3>' + esc(task.name) + '</h3><p>' + esc(task.time) + ' · ' + esc(task.status) +
                '</p><p class="muted">' + esc(task.desc) + '</p></div>' +
                '<button type="button" class="btn-soft">' + esc(t('查看')) + '</button>' +
              '</article>'
            );
          })
          .join('') +
      '</div>' +
      scaffoldNote()
    );
  }

  function pageSessions() {
    var rows = [
      ['CR-1024', t('销售分货 Agent'), 'ke.wang', t('异常'), '18:42', '42', '128k'],
      ['CR-1018', t('采购计划 Agent'), 'feng.zhu', t('正常'), '17:55', '18', '64k'],
      ['CR-1007', t('销售订单 Agent'), 'annie.li', t('警告态'), '16:20', '31', '96k'],
      ['CR-0991', t('供应商评估 Agent'), 'ke.wang', t('正常'), '15:08', '12', '41k']
    ];
    return (
      headingWithRange(t('线上会话')) +
      '<div class="tool-row">' +
        '<label class="search-field">' + lucideIcon('search') +
          '<input type="search" placeholder="' + esc(t('搜索会话')) + '" /></label>' +
        '<span class="result-count">' + esc(t('会话数')) + '</span>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr><th>' + esc(t('会话')) + '</th><th>Agent</th><th>' + esc(t('用户')) +
          '</th><th>' + esc(t('状态')) + '</th><th>' + esc(t('最新时间')) + '</th><th>' +
          esc(t('消息数')) + '</th><th>Token</th></tr></thead>' +
          '<tbody>' +
            rows.map(function (r) {
              return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +
      scaffoldNote()
    );
  }

  function pageArtifacts() {
    var items = [
      { name: t('成本与性能日报'), type: t('表'), who: t('系统'), when: '2026-10-13 08:02', ws: t('关账审核智能体') },
      { name: t('核验项明细'), type: t('表'), who: t('系统'), when: '2026-10-13 08:16', ws: t('关账审核智能体') },
      { name: t('制造业规则被否决原因'), type: t('文档'), who: 'Feng Zhu', when: '2026-10-12 16:40', ws: t('关账审核智能体') }
    ];
    var tabs = ['工作区', '定时任务']
      .map(function (tab) {
        return (
          '<button type="button" class="seg-tab' + (state.artifactTab === tab ? ' is-active' : '') +
            '" data-artifact-tab="' + tab + '">' +
            esc(t(tab)) +
          '</button>'
        );
      })
      .join('');
    return (
      heading(t('产出物'), '') +
      '<div class="seg-tabs">' + tabs + '</div>' +
      '<div class="tool-row">' +
        '<label class="search-field">' + lucideIcon('search') +
          '<input type="search" placeholder="' + esc(t('搜索产出物')) + '" /></label>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr><th>' + esc(t('名称')) + '</th><th>' + esc(t('类型')) + '</th><th>' +
          esc(t('工作区')) + '</th><th>' + esc(t('更新人')) + '</th><th>' + esc(t('更新时间')) +
          '</th></tr></thead>' +
          '<tbody>' +
            items.map(function (a) {
              return '<tr><td>' + esc(a.name) + '</td><td>' + esc(a.type) + '</td><td>' + esc(a.ws) +
                '</td><td>' + esc(a.who) + '</td><td>' + esc(a.when) + '</td></tr>';
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +
      scaffoldNote()
    );
  }

  function pageCost() {
    return (
      headingWithRange(t('成本分析')) +
      (window.AIOpsBoards ? window.AIOpsBoards.costPage() : scaffoldNote())
    );
  }

  function pageHealth() {
    return (
      headingWithRange(t('健康度分析')) +
      (window.AIOpsBoards ? window.AIOpsBoards.healthPage() : scaffoldNote())
    );
  }

  function pageBehavior() {
    return (
      headingWithRange(t('用户行为分析')) +
      (window.AIOpsBoards ? window.AIOpsBoards.behaviorPage() : scaffoldNote())
    );
  }

  function pageCustomDash() {
    return (
      heading(t('自定义看板'), t('自定义看板副')) +
      '<div class="tool-row end"><button type="button" class="btn-ink">' + lucideIcon('plus') +
        ' ' + esc(t('新建看板')) + '</button></div>' +
      '<div class="dash-grid">' +
        '<button type="button" class="dash-card"><span class="dash-tag">' + esc(t('自定义')) +
        '</span><strong>' + esc(t('关账业务效果')) + '</strong><span class="muted">' +
        esc(t('关账描述')) + '</span><span class="dash-meta">' + esc(t('指标数6')) +
        '</span></button>' +
        '<button type="button" class="dash-card"><span class="dash-tag">' + esc(t('自定义')) +
        '</span><strong>' + esc(t('销售分货健康度')) + '</strong><span class="muted">' +
        esc(t('销售描述')) + '</span><span class="dash-meta">' + esc(t('指标数4')) +
        '</span></button>' +
      '</div>' +
      scaffoldNote()
    );
  }

  function pageNotify() {
    var items = [
      { type: t('审批'), title: t('规则变更待审批'), time: t('今天') + ' 18:20', unread: true },
      { type: t('严重问题'), title: t('采购 Agent 连续失败'), time: t('今天') + ' 18:21', unread: true },
      { type: t('告警'), title: t('慢响应轮次率升高'), time: t('今天') + ' 17:58', unread: true }
    ];
    return (
      '<div class="notify-head">' +
        heading(t('消息通知'), '') +
        '<button type="button" class="btn-soft">' + esc(t('全部标为已读')) + '</button>' +
      '</div>' +
      '<div class="card-list">' +
        items.map(function (n) {
          return (
            '<article class="list-card' + (n.unread ? ' is-unread' : '') + '">' +
              '<div><span class="pill">' + esc(n.type) + '</span><h3>' + esc(n.title) +
              '</h3><p class="muted">' + esc(n.time) + '</p></div>' +
              '<button type="button" class="btn-soft">' + esc(t('查看')) + '</button>' +
            '</article>'
          );
        }).join('') +
      '</div>' +
      scaffoldNote()
    );
  }

  function pageWorkspaceStub(name) {
    return heading(t(name), t('工作区骨架')) + scaffoldNote();
  }

  var PAGES = {
    '工作台': pageHome,
    '分析任务': pageNewTask,
    '定时任务': pageSchedules,
    '线上会话': pageSessions,
    '产出物': pageArtifacts,
    '成本分析': pageCost,
    '健康度分析': pageHealth,
    '用户行为分析': pageBehavior,
    '自定义看板': pageCustomDash,
    '消息通知': pageNotify,
    '监测看板': pageCustomDash
  };

  function render() {
    renderNav();
    var root = document.getElementById('pageRoot');
    if (!root) return;
    var fn = PAGES[state.page] || function () { return pageWorkspaceStub(state.page); };
    root.innerHTML =
      '<div class="page' +
      (state.page === '工作台' ? ' is-home' : '') +
      (isAnalysisPage(state.page) ? ' is-analysis' : '') +
      '">' +
      fn() +
      '</div>';
    root.scrollTop = 0;
    paintIcons();
    if (isAnalysisPage(state.page) && window.AIOpsBoards) {
      window.AIOpsBoards.syncCharts();
    }
  }

  function go(page) {
    state.page = page;
    state.newOpen = false;
    render();
  }

  function closeNewMenu() {
    if (!state.newOpen) return;
    state.newOpen = false;
    var newMenu = document.getElementById('newMenu');
    var btnNew = document.getElementById('btnNew');
    if (newMenu) newMenu.hidden = true;
    if (btnNew) {
      btnNew.setAttribute('aria-expanded', 'false');
      btnNew.classList.remove('is-open');
    }
  }

  document.addEventListener('click', function (e) {
    var btnNew = e.target.closest('#btnNew');
    if (btnNew) {
      e.stopPropagation();
      state.newOpen = !state.newOpen;
      renderNav();
      paintIcons();
      return;
    }

    var newItem = e.target.closest('[data-new]');
    if (newItem) {
      e.stopPropagation();
      var kind = newItem.getAttribute('data-new');
      if (kind === '分析任务') go('分析任务');
      else if (kind === '定时任务') go('定时任务');
      else if (kind === '自定义看板') go('自定义看板');
      return;
    }

    var wsToggle = e.target.closest('[data-ws-toggle]');
    if (wsToggle) {
      state.wsOpen = !state.wsOpen;
      renderNav();
      paintIcons();
      return;
    }

    var pageBtn = e.target.closest('[data-page]');
    if (pageBtn) {
      go(pageBtn.getAttribute('data-page'));
      return;
    }

    var rangeBtn = e.target.closest('[data-range]');
    if (rangeBtn) {
      state.range = Number(rangeBtn.getAttribute('data-range'));
      render();
      return;
    }

    var artTab = e.target.closest('[data-artifact-tab]');
    if (artTab) {
      state.artifactTab = artTab.getAttribute('data-artifact-tab');
      render();
      return;
    }

    if (!e.target.closest('#newMenu') && !e.target.closest('#btnNew')) closeNewMenu();
  });

  /* Team + account popovers — same placement rules as Workbench */
  var teamBtn = document.getElementById('teamBtn');
  var teamMenu = document.getElementById('teamMenu');
  var userBtn = document.getElementById('userBtn');
  var acctMenu = document.getElementById('acctMenu');

  function placeSidebarPopover(el, anchor, side) {
    var sb = document.querySelector('.aiops-side').getBoundingClientRect();
    var rc = anchor.getBoundingClientRect();
    var gap = 8;
    el.style.width = Math.max(0, sb.width - gap * 2) + 'px';
    el.style.left = sb.left + gap + 'px';
    if (side === 'below') {
      el.style.top = rc.bottom + 4 + 'px';
      el.style.bottom = 'auto';
    } else {
      el.style.top = 'auto';
      el.style.bottom = window.innerHeight - rc.top + 4 + 'px';
    }
  }

  function closeTeam() {
    if (!teamMenu || !teamBtn) return;
    teamMenu.hidden = true;
    teamBtn.classList.remove('is-open');
    teamBtn.setAttribute('aria-expanded', 'false');
  }

  function closeAcct() {
    if (!acctMenu || !userBtn) return;
    acctMenu.hidden = true;
    userBtn.classList.remove('is-open');
    userBtn.setAttribute('aria-expanded', 'false');
  }

  function openAcct() {
    closeTeam();
    closeNewMenu();
    placeSidebarPopover(acctMenu, userBtn, 'above');
    acctMenu.hidden = false;
    userBtn.classList.add('is-open');
    userBtn.setAttribute('aria-expanded', 'true');
  }

  if (userBtn && acctMenu) {
    userBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (acctMenu.hidden) openAcct();
      else closeAcct();
    });

    acctMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      var langBtn = e.target.closest('.lang-seg button');
      if (langBtn) {
        setLang(langBtn.getAttribute('data-lang'));
        return;
      }
      if (e.target.closest('.acct-item')) closeAcct();
    });
  }

  if (teamBtn && teamMenu) {
    teamBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeNewMenu();
      closeAcct();
      if (!teamMenu.hidden) {
        closeTeam();
        return;
      }
      placeSidebarPopover(teamMenu, teamBtn, 'below');
      teamMenu.hidden = false;
      teamBtn.classList.add('is-open');
      teamBtn.setAttribute('aria-expanded', 'true');
    });

    teamMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      var it = e.target.closest('.acct-item[data-team]');
      if (!it) return;
      teamMenu.querySelectorAll('.acct-item[data-team]').forEach(function (i) {
        i.classList.toggle('is-current', i === it);
      });
      document.getElementById('teamName').textContent = it.dataset.team;
      var av = document.getElementById('teamAvatar');
      av.textContent = it.dataset.letter;
      av.style.background = it.dataset.color;
      closeTeam();
    });
  }

  document.addEventListener('click', function () {
    closeTeam();
    closeAcct();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeTeam();
      closeAcct();
      closeNewMenu();
    }
  });
  window.addEventListener('resize', function () {
    closeTeam();
    closeAcct();
  });

  if (window.AIOpsBoards) {
    window.AIOpsBoards.configure({
      getRange: function () {
        return state.range;
      },
      setRange: function (v) {
        state.range = Number(v) || 1;
      },
      getPage: function () {
        return state.page;
      },
      getPageRoot: function () {
        return document.getElementById('pageRoot');
      },
      rerender: function () {
        render();
      }
    });
  }

  try {
    var savedLang = localStorage.getItem('aiops-lang');
    if (savedLang === 'en' || savedLang === 'zh') state.lang = savedLang;
  } catch (e) {}
  applyStaticLang();
  render();
})();
