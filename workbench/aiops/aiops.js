/* AI Ops — left nav from Figma AgentOS-2.0 319:48545; homepage = configurable widgets schematic */

(function () {
  var state = {
    page: '工作台',
    range: 7,
    artifactTab: '工作区',
    notifyType: 'all',
    wsOpen: true,
    wsPinnedId: null,
    newOpen: false,
    lang: 'zh',
    homeWidgets: null,
    galleryOpen: false,
    galleryType: 'cost',
    galleryHidden: false,
    configId: null,
    configPos: null,
    drag: null,
    /* Demo-only: Figma widget visual skins — border | raised | inset */
    widgetSkin: 'border'
  };

  var WIDGET_SKINS = [
    { id: 'border', label: '白底描边' },
    { id: 'raised', label: '灰底白卡' },
    { id: 'inset', label: '白底灰卡' }
  ];

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
    '添加组件': { zh: '添加组件', en: 'Add widget' },
    '更新后缀': { zh: '更新', en: 'updated' },
    '总 Token': { zh: '总 Token', en: 'Total tokens' },
    '输入 Token': { zh: '输入 Token', en: 'Input tokens' },
    '输出 Token': { zh: '输出 Token', en: 'Output tokens' },
    '模型调用次数': { zh: '模型调用次数', en: 'Model calls' },
    '平均每轮 Token 消耗': { zh: '平均每轮 Token 消耗', en: 'Avg tokens / turn' },
    '平均每会话 Token 消耗': { zh: '平均每会话 Token 消耗', en: 'Avg tokens / session' },
    'Token 用量趋势': { zh: 'Token 用量趋势', en: 'Token usage trend' },
    '平均 Token 消耗趋势': { zh: '平均 Token 消耗趋势', en: 'Avg token trend' },
    '定时任务执行情况': { zh: '定时任务执行情况', en: 'Schedule status' },
    '全部任务': { zh: '全部任务', en: 'All tasks' },
    '成功': { zh: '成功', en: 'Success' },
    '失败': { zh: '失败', en: 'Failed' },
    '今日时': { zh: '今日', en: 'Today' },
    '昨日': { zh: '昨日', en: 'Yesterday' },
    '慢响应周报': { zh: '慢响应周报', en: 'Slow-response weekly' },
    '最近更新': { zh: '最近更新', en: 'Recently updated' },
    '查看全部': { zh: '查看全部', en: 'View all' },
    '成本与性能日报': { zh: '成本与性能日报', en: 'Cost & performance daily' },
    '核验项明细': { zh: '核验项明细', en: 'Check-item details' },
    '表 · 系统': { zh: '表 · 系统', en: 'Table · System' },
    '文档 · Feng Zhu': { zh: '文档 · Feng Zhu', en: 'Doc · Feng Zhu' },
    '昨天': { zh: '昨天', en: 'Yesterday' },
    '异常会话率': { zh: '异常会话率', en: 'Abnormal session rate' },
    '慢响应轮次率': { zh: '慢响应轮次率', en: 'Slow-turn rate' },
    '工具调用失败率': { zh: '工具调用失败率', en: 'Tool failure rate' },
    '轮次错误率': { zh: '轮次错误率', en: 'Turn error rate' },
    '警告事件数': { zh: '警告事件数', en: 'Warning events' },
    '警告影响用户数': { zh: '警告影响用户数', en: 'Users affected' },
    '警告分布': { zh: '警告分布', en: 'Warning mix' },
    '实时警告': { zh: '实时警告', en: 'Live alerts' },
    '会话平均耗时': { zh: '会话平均耗时', en: 'Avg session duration' },
    '工具平均耗时': { zh: '工具平均耗时', en: 'Avg tool duration' },
    '首 token 延迟（TTFT）': { zh: '首 token 延迟（TTFT）', en: 'TTFT' },
    '慢响应轮次趋势': { zh: '慢响应轮次趋势', en: 'Slow-turn trend' },
    '耗时分布': { zh: '耗时分布', en: 'Duration mix' },
    '报错分析': { zh: '报错分析', en: 'Error analysis' },
    '性能分析': { zh: '性能分析', en: 'Performance' },
    '活跃会话数': { zh: '活跃会话数', en: 'Active sessions' },
    '活跃用户数': { zh: '活跃用户数', en: 'Active users' },
    '人均会话数': { zh: '人均会话数', en: 'Sessions / user' },
    '平均会话轮次': { zh: '平均会话轮次', en: 'Avg turns / session' },
    '点赞': { zh: '点赞', en: 'Like' },
    '点踩': { zh: '点踩', en: 'Dislike' },
    '点赞点踩次数': { zh: '点赞点踩次数', en: 'Likes & dislikes' },
    '活跃会话趋势': { zh: '活跃会话趋势', en: 'Session trend' },
    '活跃用户趋势': { zh: '活跃用户趋势', en: 'User trend' },
    '点赞点踩趋势': { zh: '点赞点踩趋势', en: 'Feedback trend' },
    '任务执行情况': { zh: '任务执行情况', en: 'Task runs' },
    'Dashboards': { zh: '监测看板', en: 'Dashboards' },
    '搜索组件': { zh: '搜索组件', en: 'Search widgets' },
    '完成': { zh: '完成', en: 'Done' },
    '添加': { zh: '添加', en: 'Add' },
    '配置': { zh: '配置', en: 'Configure' },
    '删除': { zh: '删除', en: 'Delete' },
    '确认删除组件': { zh: '确定删除该组件？', en: 'Remove this widget?' },
    '拖拽': { zh: '拖拽', en: 'Drag' },
    '拖到工作台': { zh: '拖到工作台，或点击添加', en: 'Drag to workbench, or click Add' },
    '显示指标': { zh: '显示指标', en: 'Metrics' },
    '保存配置': { zh: '保存', en: 'Save' },
    '取消': { zh: '取消', en: 'Cancel' },
    '关闭': { zh: '关闭', en: 'Close' },
    '本期不包含短': { zh: '本期不包含', en: 'Not in this release' },
    '业务自定义看板': { zh: '业务自定义看板', en: 'Custom boards' },
    '组件库': { zh: '组件库', en: 'Widget gallery' },
    '调整宽度': { zh: '拖拽调整大小', en: 'Drag to resize' },
    '皮肤切换': { zh: '卡片皮肤', en: 'Card skin' },
    '白底描边': { zh: '白底描边', en: 'White + border' },
    '灰底白卡': { zh: '灰底白卡', en: 'Gray canvas' },
    '白底灰卡': { zh: '白底灰卡', en: 'Inset gray' },
    '日环比': { zh: '日环比', en: 'DoD' },
    '待执行': { zh: '待执行', en: 'Pending' },
    '补跑成功': { zh: '补跑成功', en: 'Rerun OK' },
    '数据表': { zh: '数据表', en: 'Table' },
    '空指标提示': { zh: '点击配置选择要展示的指标', en: 'Configure metrics to show' },
    '此组件无可配置指标': { zh: '此组件无可配置指标', en: 'No configurable metrics' },
    '详情': { zh: '详情', en: 'Details' },
    '采购 Agent 连续失败': { zh: '采购 Agent 连续失败', en: 'Procurement agent failing' },
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

  function isWsChild(id) {
    return WS_CHILDREN.some(function (c) {
      return c.id === id;
    });
  }

  function visibleWsChildren() {
    if (state.wsOpen) return WS_CHILDREN.slice();
    var ids = {};
    var out = [];
    function pushById(id) {
      if (!id || ids[id]) return;
      for (var i = 0; i < WS_CHILDREN.length; i++) {
        if (WS_CHILDREN[i].id === id) {
          ids[id] = true;
          out.push(WS_CHILDREN[i]);
          return;
        }
      }
    }
    // Collapsed: keep current session (or last pinned) outside the folder
    if (isWsChild(state.page)) pushById(state.page);
    else pushById(state.wsPinnedId);
    return out;
  }

  function renderWsChild(c) {
    var active = state.page === c.id;
    return (
      '<button class="aiops-nav-item is-child' + (active ? ' is-active' : '') + '" type="button" data-page="' + esc(c.id) + '"' +
        (active ? ' aria-current="page"' : '') + '>' +
        (c.icon ? '<span class="ico" aria-hidden="true">' + lucideIcon(c.icon) + '</span>' : '') +
        '<span class="aiops-nav-label">' + esc(t(c.id)) + '</span>' +
      '</button>'
    );
  }

  function renderNav() {
    var nav = document.getElementById('aiopsNav');
    if (!nav) return;

    var children = visibleWsChildren().map(renderWsChild).join('');

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
        '<button class="aiops-nav-item is-folder' +
          (state.wsOpen ? ' is-open' : '') +
          '" type="button" data-ws-toggle="1">' +
          '<span class="ico" aria-hidden="true">' + lucideIcon(state.wsOpen ? 'folder-open' : 'folder-closed') + '</span>' +
          '<span class="aiops-nav-label">' + esc(t('关联审核智能体')) + '</span>' +
        '</button>' +
        children +
        '<button class="aiops-nav-item' + (state.page === '默认工作区' ? ' is-active' : '') + '" type="button" data-page="默认工作区"' +
          (state.page === '默认工作区' ? ' aria-current="page"' : '') + '>' +
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

  /* ─── Homepage widgets (gallery + multi-instance) ─── */

  var METRIC_MOCK = {
    total: ['95.4M', '+5.1%'],
    input: ['64.2M', '+4.8%'],
    output: ['31.2M', '+5.6%'],
    calls: ['128.4k', '+3.2%'],
    perTurn: ['2.4k', '−1.1%'],
    perSession: ['18.6k', '+2.0%'],
    anomalousRate: ['2.4%', '−0.3%', 'good'],
    toolFailureRate: ['1.1%', '+0.2%'],
    turnErrorRate: ['0.8%', '0%'],
    warningEvents: ['47', '+8'],
    affectedUsers: ['19', '+3'],
    sessionAvgMs: ['12.4s', '−0.6s', 'good'],
    slowRate: ['4.2%', '−0.4%', 'good'],
    toolAvgMs: ['1.8s', '+0.1s'],
    ttft: ['620ms', '−40ms', 'good'],
    sessions: ['328', '+4.2%'],
    users: ['186', '+2.8%'],
    sessionsPerUser: ['1.76', '+0.04'],
    avgTurns: ['6.2', '−0.1', 'good'],
    feedback: ['👍 86 / 👎 12', '']
  };

  var WIDGET_TYPES = [
    {
      id: 'cost',
      group: 'dashboard',
      title: '成本分析',
      icon: 'report-money',
      iconSet: 'tabler',
      page: '成本分析',
      span: 4,
      rows: 4,
      configurable: true,
      defaults: ['total', 'input', 'output', 'calls', 'trendUsage'],
      metrics: [
        { id: 'total', label: '总 Token', kind: 'stat' },
        { id: 'input', label: '输入 Token', kind: 'stat' },
        { id: 'output', label: '输出 Token', kind: 'stat' },
        { id: 'calls', label: '模型调用次数', kind: 'stat' },
        { id: 'perTurn', label: '平均每轮 Token 消耗', kind: 'stat' },
        { id: 'perSession', label: '平均每会话 Token 消耗', kind: 'stat' },
        { id: 'trendUsage', label: 'Token 用量趋势', kind: 'chart' },
        { id: 'trendAvg', label: '平均 Token 消耗趋势', kind: 'chart' }
      ]
    },
    {
      id: 'health',
      group: 'dashboard',
      title: '健康度分析',
      icon: 'heartbeat',
      iconSet: 'tabler',
      page: '健康度分析',
      span: 4,
      rows: 4,
      configurable: true,
      defaults: ['anomalousRate', 'slowRate', 'warningEvents', 'slowTrend'],
      metrics: [
        { id: 'anomalousRate', label: '异常会话率', kind: 'stat', section: '报错分析' },
        { id: 'toolFailureRate', label: '工具调用失败率', kind: 'stat', section: '报错分析' },
        { id: 'turnErrorRate', label: '轮次错误率', kind: 'stat', section: '报错分析' },
        { id: 'warningEvents', label: '警告事件数', kind: 'stat', section: '报错分析' },
        { id: 'affectedUsers', label: '警告影响用户数', kind: 'stat', section: '报错分析' },
        { id: 'warningDist', label: '警告分布', kind: 'chart', section: '报错分析' },
        { id: 'liveAlerts', label: '实时警告', kind: 'list', section: '报错分析' },
        { id: 'sessionAvgMs', label: '会话平均耗时', kind: 'stat', section: '性能分析' },
        { id: 'slowRate', label: '慢响应轮次率', kind: 'stat', section: '性能分析' },
        { id: 'toolAvgMs', label: '工具平均耗时', kind: 'stat', section: '性能分析' },
        { id: 'ttft', label: '首 token 延迟（TTFT）', kind: 'stat', section: '性能分析' },
        { id: 'slowTrend', label: '慢响应轮次趋势', kind: 'chart', section: '性能分析' },
        { id: 'durationDist', label: '耗时分布', kind: 'chart', section: '性能分析' }
      ]
    },
    {
      id: 'behavior',
      group: 'dashboard',
      title: '用户行为分析',
      icon: 'users-round',
      page: '用户行为分析',
      span: 4,
      rows: 4,
      configurable: true,
      defaults: ['sessions', 'users', 'sessionsPerUser', 'trendSessions'],
      metrics: [
        { id: 'sessions', label: '活跃会话数', kind: 'stat' },
        { id: 'users', label: '活跃用户数', kind: 'stat' },
        { id: 'sessionsPerUser', label: '人均会话数', kind: 'stat' },
        { id: 'avgTurns', label: '平均会话轮次', kind: 'stat' },
        { id: 'feedback', label: '点赞点踩次数', kind: 'stat' },
        { id: 'trendSessions', label: '活跃会话趋势', kind: 'chart' },
        { id: 'trendUsers', label: '活跃用户趋势', kind: 'chart' },
        { id: 'trendFeedback', label: '点赞点踩趋势', kind: 'chart' }
      ]
    },
    {
      id: 'custom',
      group: 'dashboard',
      title: '业务自定义看板',
      icon: 'layout-grid',
      span: 2,
      rows: 4,
      disabled: true,
      configurable: false,
      defaults: [],
      metrics: []
    },
    {
      id: 'schedules',
      group: 'schedule',
      title: '定时任务',
      icon: 'clock',
      page: '定时任务',
      span: 2,
      rows: 4,
      configurable: false,
      defaults: [],
      metrics: []
    },
    {
      id: 'artifacts',
      group: 'artifact',
      title: '产出物',
      icon: 'file-text',
      page: '产出物',
      span: 2,
      rows: 4,
      configurable: false,
      defaults: [],
      metrics: []
    }
  ];

  var widgetSeq = 0;

  function widgetType(id) {
    for (var i = 0; i < WIDGET_TYPES.length; i++) {
      if (WIDGET_TYPES[i].id === id) return WIDGET_TYPES[i];
    }
    return null;
  }

  function defaultHomeWidgets() {
    return [
      makeWidget('cost', ['total', 'calls', 'perTurn', 'trendUsage']),
      makeWidget('health', ['anomalousRate', 'slowRate', 'warningEvents']),
      makeWidget('schedules'),
      makeWidget('artifacts')
    ];
  }

  function ensureHomeWidgets() {
    if (!state.homeWidgets) state.homeWidgets = defaultHomeWidgets();
    ensureWidgetCoords(state.homeWidgets, WIDGET_GRID_COLS);
    return state.homeWidgets;
  }

  function makeWidget(typeId, metrics, span, rows, col, row) {
    var type = widgetType(typeId);
    widgetSeq += 1;
    return {
      id: 'w' + widgetSeq + '-' + Date.now().toString(36),
      type: typeId,
      span: span || (type && type.span) || 1,
      rows: rows || (type && type.rows) || 4,
      col: col > 0 ? col : 0,
      row: row > 0 ? row : 0,
      metrics: metrics
        ? metrics.slice()
        : type && type.defaults
          ? type.defaults.slice()
          : []
    };
  }

  var WIDGET_GRID_COLS = 6;
  var WIDGET_GRID_ROWS = 6;

  function widgetSpan(inst, type) {
    var s = inst && inst.span != null ? Number(inst.span) : type && type.span;
    s = Math.round(s || 1);
    if (s < 1) s = 1;
    if (s > WIDGET_GRID_COLS) s = WIDGET_GRID_COLS;
    return s;
  }

  function widgetRows(inst, type) {
    var r = inst && inst.rows != null ? Number(inst.rows) : type && type.rows;
    r = Math.round(r || 4);
    if (r < 1) r = 1;
    if (r > WIDGET_GRID_ROWS) r = WIDGET_GRID_ROWS;
    return r;
  }

  function rectsOverlap(a, b) {
    return (
      a.col < b.col + b.span &&
      a.col + a.span > b.col &&
      a.row < b.row + b.rows &&
      a.row + a.rows > b.row
    );
  }

  function normalizeWidgetLayout(w, type, cols) {
    type = type || widgetType(w.type);
    cols = cols || WIDGET_GRID_COLS;
    w.span = widgetSpan(w, type);
    w.rows = widgetRows(w, type);
    if (w.span > cols) w.span = cols;
    w.col = Math.round(Number(w.col) || 0);
    w.row = Math.round(Number(w.row) || 0);
    if (w.col < 1) w.col = 1;
    if (w.row < 1) w.row = 1;
    if (w.col + w.span - 1 > cols) w.col = Math.max(1, cols - w.span + 1);
    return w;
  }

  function cloneLayoutItem(w) {
    return {
      id: w.id,
      type: w.type,
      col: w.col,
      row: w.row,
      span: w.span,
      rows: w.rows
    };
  }

  function cloneLayout(list) {
    return (list || []).map(cloneLayoutItem);
  }

  function findOpenSpot(occupied, span, rows, cols) {
    cols = cols || WIDGET_GRID_COLS;
    span = Math.min(span || 1, cols);
    rows = rows || 4;
    for (var row = 1; row < 400; row++) {
      for (var col = 1; col <= cols - span + 1; col++) {
        var cand = { col: col, row: row, span: span, rows: rows };
        var hit = false;
        for (var i = 0; i < occupied.length; i++) {
          if (rectsOverlap(cand, occupied[i])) {
            hit = true;
            break;
          }
        }
        if (!hit) return { col: col, row: row };
      }
    }
    return { col: 1, row: 1 };
  }

  /**
   * Expand: try push right; if it won't fit, insert a band just below the primary
   * (preserving overflow items' relative layout) and shift everything that was
   * at/below that line further down. Shrink never pulls anyone back.
   */
  function resolveCollisions(list, primaryId, cols) {
    cols = cols || WIDGET_GRID_COLS;
    var primary = null;
    list.forEach(function (w) {
      if (w.id === primaryId) primary = w;
    });
    if (!primary) return;
    normalizeWidgetLayout(primary, widgetType(primary.type), cols);

    var displaced = [];
    list.forEach(function (w) {
      if (w.id === primaryId) return;
      if (rectsOverlap(primary, w)) displaced.push(w);
    });

    var stuck = [];
    displaced.forEach(function (w) {
      var rightCol = primary.col + primary.span;
      var verticalOverlap =
        primary.row < w.row + w.rows && primary.row + primary.rows > w.row;
      if (verticalOverlap && rightCol + w.span - 1 <= cols) {
        var prevCol = w.col;
        w.col = rightCol;
        if (!rectsOverlap(primary, w)) return;
        w.col = prevCol;
      }
      stuck.push(w);
    });

    if (stuck.length) {
      var insertRow = primary.row + primary.rows;
      var minRow = stuck[0].row;
      stuck.forEach(function (w) {
        if (w.row < minRow) minRow = w.row;
      });
      var bandBottom = insertRow;
      var stuckIds = {};
      stuck.forEach(function (w) {
        stuckIds[w.id] = true;
        w.row = insertRow + (w.row - minRow);
        if (w.col + w.span - 1 > cols) {
          w.col = Math.max(1, cols - w.span + 1);
        }
        var bottom = w.row + w.rows;
        if (bottom > bandBottom) bandBottom = bottom;
      });
      var bandHeight = bandBottom - insertRow;
      list.forEach(function (w) {
        if (w.id === primaryId || stuckIds[w.id]) return;
        if (w.row >= insertRow) {
          w.row += bandHeight;
        } else if (w.row + w.rows > insertRow) {
          w.row = bandBottom;
        }
      });
    }

    // Remaining overlaps: keep earlier (higher) items, push later ones down only.
    var guard = 0;
    while (guard++ < 40) {
      var moved = false;
      var sorted = list.slice().sort(function (a, b) {
        if (a.id === primaryId) return -1;
        if (b.id === primaryId) return 1;
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });
      for (var i = 0; i < sorted.length; i++) {
        for (var j = i + 1; j < sorted.length; j++) {
          var a = sorted[i];
          var b = sorted[j];
          if (b.id === primaryId || !rectsOverlap(a, b)) continue;
          b.row = a.row + a.rows;
          if (b.col + b.span - 1 > cols) {
            b.col = Math.max(1, cols - b.span + 1);
          }
          moved = true;
        }
      }
      if (!moved) break;
    }

    list.forEach(function (w) {
      normalizeWidgetLayout(w, widgetType(w.type), cols);
    });
  }

  function ensureWidgetCoords(list, cols) {
    cols = cols || WIDGET_GRID_COLS;
    var occupied = [];
    list.forEach(function (w) {
      var type = widgetType(w.type);
      w.span = widgetSpan(w, type);
      w.rows = widgetRows(w, type);
      if (w.span > cols) w.span = cols;
      if (Number(w.col) > 0 && Number(w.row) > 0) {
        normalizeWidgetLayout(w, type, cols);
        occupied.push(w);
        return;
      }
      var spot = findOpenSpot(occupied, w.span, w.rows, cols);
      w.col = spot.col;
      w.row = spot.row;
      occupied.push(w);
    });
    return list;
  }

  function applyPlacement(el, col, row, span, rows) {
    if (!el) return;
    el.style.gridColumn = col + ' / span ' + span;
    el.style.gridRow = row + ' / span ' + rows;
    el.setAttribute('data-col', String(col));
    el.setAttribute('data-row', String(row));
    el.setAttribute('data-span', String(span));
    el.setAttribute('data-rows', String(rows));
    el.classList.remove(
      'is-span-1',
      'is-span-2',
      'is-span-3',
      'is-span-4',
      'is-span-5',
      'is-span-6',
      'is-row-1',
      'is-row-2',
      'is-row-3',
      'is-row-4',
      'is-row-5',
      'is-row-6'
    );
    el.classList.add('is-span-' + span, 'is-row-' + rows);
  }

  function paintLayout(list, placeholderId, placeholderEl) {
    (list || []).forEach(function (w) {
      if (placeholderId && w.id === placeholderId && placeholderEl) {
        applyPlacement(placeholderEl, w.col, w.row, w.span, w.rows);
        return;
      }
      var el = document.querySelector(
        '#homeWidgetGrid .widget[data-widget-id="' + w.id + '"]'
      );
      if (el) applyPlacement(el, w.col, w.row, w.span, w.rows);
    });
  }

  function commitLayout(list) {
    var map = {};
    list.forEach(function (s) {
      map[s.id] = s;
    });
    ensureHomeWidgets().forEach(function (w) {
      var s = map[w.id];
      if (!s) return;
      w.col = s.col;
      w.row = s.row;
      w.span = s.span;
      w.rows = s.rows;
    });
  }

  function pointToGridCell(clientX, clientY, span, rows) {
    var metrics = gridColMetrics();
    var grid = metrics.grid;
    var cols = metrics.cols || WIDGET_GRID_COLS;
    span = Math.min(span || 1, cols);
    rows = rows || 4;
    if (!grid) return { col: 1, row: 1, cols: cols };
    var rect = grid.getBoundingClientRect();
    var unitX = metrics.col + metrics.gap;
    var unitY = metrics.row + metrics.gap;
    var col = Math.floor((clientX - rect.left) / unitX) + 1;
    var row = Math.floor((clientY - rect.top) / unitY) + 1;
    if (col < 1) col = 1;
    if (row < 1) row = 1;
    if (col + span - 1 > cols) col = Math.max(1, cols - span + 1);
    return { col: col, row: row, cols: cols };
  }

  function scheduleChartSync() {
    if (state._chartSyncTimer) clearTimeout(state._chartSyncTimer);
    state._chartSyncTimer = setTimeout(function () {
      state._chartSyncTimer = null;
      if (window.AIOpsBoards) window.AIOpsBoards.syncCharts();
    }, 48);
  }

  function persistHomeWidgets() {
    try {
      localStorage.setItem('aiops-home-widgets', JSON.stringify(state.homeWidgets || []));
      localStorage.setItem('aiops-widget-grid-cols', String(WIDGET_GRID_COLS));
      localStorage.setItem('aiops-widget-grid-layout', 'coords-v1');
    } catch (e) {}
  }

  function loadHomeWidgets() {
    try {
      var raw = localStorage.getItem('aiops-home-widgets');
      if (!raw) return null;
      var list = JSON.parse(raw);
      if (!Array.isArray(list) || !list.length) return null;
      // Legacy 3-col spans (1–3) → 6-col (×2) so widths stay the same.
      var gridVer = localStorage.getItem('aiops-widget-grid-cols');
      var migrateFrom3 = gridVer !== String(WIDGET_GRID_COLS);
      var mapped = list
        .filter(function (w) {
          return w && w.type && widgetType(w.type) && !widgetType(w.type).disabled;
        })
        .map(function (w) {
          widgetSeq += 1;
          var type = widgetType(w.type);
          var rawSpan = w.span != null ? Number(w.span) : type && type.span;
          if (migrateFrom3 && rawSpan >= 1 && rawSpan <= 3) rawSpan = rawSpan * 2;
          return {
            id: w.id || 'w' + widgetSeq,
            type: w.type,
            span: widgetSpan({ span: rawSpan }, type),
            rows: widgetRows(w, type),
            col: Number(w.col) > 0 ? Math.round(Number(w.col)) : 0,
            row: Number(w.row) > 0 ? Math.round(Number(w.row)) : 0,
            metrics: Array.isArray(w.metrics) ? w.metrics.slice() : []
          };
        });
      ensureWidgetCoords(mapped, WIDGET_GRID_COLS);
      if (migrateFrom3 && mapped.length) {
        try {
          localStorage.setItem('aiops-widget-grid-cols', String(WIDGET_GRID_COLS));
          localStorage.setItem('aiops-home-widgets', JSON.stringify(mapped));
          localStorage.setItem('aiops-widget-grid-layout', 'coords-v1');
        } catch (err) {}
      }
      return mapped;
    } catch (e) {
      return null;
    }
  }

  // Map home widget chart metrics → same analysis-boards hosts as 监测 dashboards.
  var WIDGET_CHART_KIND = {
    trendUsage: 'cost-total',
    trendAvg: 'cost-average',
    slowTrend: 'health-slow',
    trendSessions: 'behavior-sessions',
    trendUsers: 'behavior-users',
    trendFeedback: 'behavior-feedback'
  };

  function widgetTrendLegend(chartKind) {
    var items = null;
    if (chartKind === 'cost-total') {
      items = [
        { name: t('总 Token'), color: '#4d8eff' },
        { name: t('输入 Token'), color: '#18b99b' },
        { name: t('输出 Token'), color: '#f0a142' }
      ];
    } else if (chartKind === 'cost-average') {
      items = [
        { name: t('平均每轮 Token 消耗'), color: '#e5799d' },
        { name: t('平均每会话 Token 消耗'), color: '#f29b38' }
      ];
    } else if (chartKind === 'behavior-feedback') {
      items = [
        { name: t('点赞'), color: '#4d8eff' },
        { name: t('点踩'), color: '#f0a142' }
      ];
    } else if (chartKind === 'health-slow') {
      items = [{ name: t('慢响应轮次率'), color: '#f0a142' }];
    }
    if (!items) return '';
    return (
      '<div class="widget-trend-legend">' +
        items
          .map(function (item) {
            return (
              '<span><i style="background:' +
              item.color +
              '"></i>' +
              esc(item.name) +
              '</span>'
            );
          })
          .join('') +
      '</div>'
    );
  }

  function trendPanelHtml(title, chartKind) {
    return (
      '<div class="widget-trend analysis-line-panel" data-line-chart="' +
      esc(chartKind) +
      '">' +
        '<div class="widget-trend-head">' +
          '<div class="widget-trend-label">' +
          esc(title) +
          '</div>' +
          widgetTrendLegend(chartKind) +
        '</div>' +
        '<div class="widget-spark analysis-chart-host" data-analysis-chart="' +
        esc(chartKind) +
        '"></div>' +
        '<div class="analysis-line-tooltip widget-trend-tooltip" hidden></div>' +
      '</div>'
    );
  }

  function barDist() {
    return (
      '<div class="widget-bars" aria-hidden="true">' +
        '<div class="widget-bar"><span>' + esc(t('报错分析')) + '</span><i style="width:62%"></i></div>' +
        '<div class="widget-bar"><span>' + esc(t('性能分析')) + '</span><i style="width:38%;background:#f59e0b"></i></div>' +
      '</div>'
    );
  }

  function metricStatHtml(metricId) {
    var mock = METRIC_MOCK[metricId] || ['—', ''];
    var label = metricId;
    for (var i = 0; i < WIDGET_TYPES.length; i++) {
      for (var j = 0; j < WIDGET_TYPES[i].metrics.length; j++) {
        if (WIDGET_TYPES[i].metrics[j].id === metricId) {
          label = t(WIDGET_TYPES[i].metrics[j].label);
        }
      }
    }
    var deltaRow = mock[1]
      ? '<div class="widget-metric-delta' +
        (mock[2] === 'good' ? ' is-good' : '') +
        '"><em>' +
        esc(mock[1]) +
        '</em><span>' +
        esc(t('日环比')) +
        '</span></div>'
      : '';
    return (
      '<div class="widget-metric">' +
        '<span class="widget-metric-label">' +
        esc(label) +
        '</span><strong>' +
        esc(mock[0]) +
        '</strong>' +
        deltaRow +
      '</div>'
    );
  }

  function joinWidgetListItems(items) {
    var sep = '<li class="widget-list-sep" aria-hidden="true"></li>';
    return items.filter(Boolean).join(sep);
  }

  function widgetBodyHtml(inst, type) {
    if (type.id === 'schedules') {
      return (
        '<div class="widget-panel">' +
          '<ul class="widget-list is-mission">' +
            joinWidgetListItems(
              [
                [t('核验项与规则变更抽取'), t('今日时') + ' 18:00', t('待执行'), 'pending'],
                [t('成本与业务指标日报'), t('今日时') + ' 08:00', t('成功'), 'ok'],
                [t('核验项与规则变更抽取'), t('今日时') + ' 08:00', t('成功'), 'ok'],
                [t('成本与业务指标日报'), t('昨天') + ' 08:05', t('补跑成功'), 'ok'],
                [t('成本与业务指标日报'), t('昨天') + ' 08:00', t('失败'), 'err']
              ].map(function (r) {
                return (
                  '<li>' +
                    '<div class="widget-mission-main">' +
                      '<b>' +
                      esc(r[0]) +
                      '</b>' +
                      '<span class="widget-mission-meta">' +
                      esc(r[1]) +
                      '</span>' +
                    '</div>' +
                    '<span class="widget-pill is-' +
                    r[3] +
                    '"><span class="dot" aria-hidden="true"></span>' +
                    esc(r[2]) +
                    '</span>' +
                  '</li>'
                );
              })
            ) +
          '</ul>' +
        '</div>'
      );
    }
    if (type.id === 'artifacts') {
      return (
        '<div class="widget-panel">' +
          '<ul class="widget-list is-output">' +
            joinWidgetListItems(
              [
                ['table', t('成本与性能日报'), t('今日时') + ' 18:00 ' + t('更新后缀'), t('数据表')],
                ['md', '会话质量复盘.md', t('今日时') + ' 18:00 ' + t('更新后缀'), 'Markdown'],
                ['json', '分析摘要.json', t('昨天') + ' 18:00 ' + t('更新后缀'), 'JSON'],
                ['table', t('核验项明细'), '10-20 18:00 ' + t('更新后缀'), t('数据表')],
                ['table', '规则变更记录', '10-20 18:00 ' + t('更新后缀'), t('数据表')]
              ].map(function (r) {
                var chip =
                  r[0] === 'md'
                    ? '<span class="widget-file-chip is-md">MD</span>'
                    : r[0] === 'json'
                      ? '<span class="widget-file-chip is-json">' + lucideIcon('code-2') + '</span>'
                      : '<span class="widget-file-chip is-table">' + lucideIcon('table-2') + '</span>';
                return (
                  '<li>' +
                    '<div class="widget-output-main">' +
                      '<div class="widget-output-title">' +
                      chip +
                      '<b>' +
                      esc(r[1]) +
                      '</b></div>' +
                      '<span class="widget-output-meta">' +
                      esc(r[2]) +
                      ' · ' +
                      esc(r[3]) +
                      '</span>' +
                    '</div>' +
                  '</li>'
                );
              })
            ) +
          '</ul>' +
        '</div>'
      );
    }

    var selected = {};
    (inst.metrics || []).forEach(function (id) {
      selected[id] = true;
    });
    var stats = [];
    var charts = [];
    var lists = [];
    type.metrics.forEach(function (m) {
      if (!selected[m.id]) return;
      if (m.kind === 'stat') stats.push(m.id);
      else if (m.kind === 'list') lists.push(m.id);
      else charts.push(m.id);
    });

    if (!stats.length && !charts.length && !lists.length) {
      return '<div class="widget-empty">' + esc(t('空指标提示')) + '</div>';
    }

    var html = '';
    if (stats.length) {
      var cols = Math.min(4, Math.max(2, stats.length));
      html +=
        '<div class="widget-metrics" style="grid-template-columns:repeat(' +
        cols +
        ',minmax(0,1fr))">' +
        stats.map(metricStatHtml).join('') +
        '</div>';
    }
    charts.forEach(function (id) {
      var chartTitle = id;
      for (var i = 0; i < type.metrics.length; i++) {
        if (type.metrics[i].id === id) chartTitle = t(type.metrics[i].label);
      }
      if (id === 'warningDist' || id === 'durationDist') html += barDist();
      else if (WIDGET_CHART_KIND[id]) html += trendPanelHtml(chartTitle, WIDGET_CHART_KIND[id]);
    });
    if (lists.indexOf('liveAlerts') >= 0) {
      html +=
        '<ul class="widget-list is-compact">' +
          [
            [t('采购 Agent 连续失败'), '18:21'],
            [t('慢响应轮次率'), '17:58']
          ]
            .map(function (r) {
              return (
                '<li class="is-unread"><div><b>' +
                esc(r[0]) +
                '</b></div><time>' +
                esc(r[1]) +
                '</time></li>'
              );
            })
            .join('') +
        '</ul>';
    }
    return html;
  }

  function widgetChrome(inst, type, mode) {
    var hoverBtns = '';
    if (mode === 'gallery') {
      hoverBtns =
        '<button type="button" class="widget-tool" data-gallery-add="' +
        esc(type.id) +
        '" title="' +
        esc(t('添加')) +
        '" aria-label="' +
        esc(t('添加')) +
        '">' +
        lucideIcon('plus') +
        '</button>';
    } else {
      hoverBtns =
        '<button type="button" class="widget-tool" data-widget-drag="' +
        esc(inst.id) +
        '" title="' +
        esc(t('拖拽')) +
        '" aria-label="' +
        esc(t('拖拽')) +
        '">' +
        lucideIcon('grip-vertical') +
        '</button>' +
        (type.configurable
          ? '<button type="button" class="widget-tool" data-widget-config="' +
            esc(inst.id) +
            '" title="' +
            esc(t('配置')) +
            '" aria-label="' +
            esc(t('配置')) +
            '">' +
            lucideIcon('settings') +
            '</button>'
          : '<button type="button" class="widget-tool" data-widget-delete="' +
            esc(inst.id) +
            '" title="' +
            esc(t('删除')) +
            '" aria-label="' +
            esc(t('删除')) +
            '">' +
            lucideIcon('trash-2') +
            '</button>') +
        (type.page
          ? '<button type="button" class="widget-tool" data-page="' +
            esc(type.page) +
            '" title="' +
            esc(t('详情')) +
            '" aria-label="' +
            esc(t('详情')) +
            '">' +
            lucideIcon('arrow-right') +
            '</button>'
          : '');
    }

    var ico = type.iconSet === 'tabler' ? tablerIcon(type.icon) : lucideIcon(type.icon || 'layout-grid');
    var span = widgetSpan(inst, type);
    var rows = widgetRows(inst, type);
    var col = Number(inst.col) > 0 ? Number(inst.col) : 1;
    var row = Number(inst.row) > 0 ? Number(inst.row) : 1;
    var cls =
      'widget is-span-' +
      span +
      ' is-row-' +
      rows +
      (mode === 'gallery' ? ' is-gallery-preview' : '') +
      (state.configId === inst.id ? ' is-configuring' : '');

    var resizeHandle =
      mode === 'canvas'
        ? '<button type="button" class="widget-resize" data-widget-resize="' +
          esc(inst.id) +
          '" aria-label="' +
          esc(t('调整宽度')) +
          '">' +
          '<svg class="widget-resize-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">' +
          '<path d="M2 14h7.5A4.5 4.5 0 0 0 14 9.5V2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
          '</button>'
        : '';

    var placeAttr =
      mode === 'canvas'
        ? ' data-col="' +
          col +
          '" data-row="' +
          row +
          '" style="grid-column:' +
          col +
          ' / span ' +
          span +
          ';grid-row:' +
          row +
          ' / span ' +
          rows +
          '"'
        : '';

    return (
      '<section class="' +
      cls +
      '" data-widget-id="' +
      esc(inst.id) +
      '" data-widget-type="' +
      esc(type.id) +
      '" data-span="' +
      span +
      '" data-rows="' +
      rows +
      '"' +
      placeAttr +
      (mode === 'gallery' ? ' data-gallery-preview="1"' : '') +
      '>' +
      '<header class="widget-head">' +
      '<div class="widget-title">' +
      '<span class="widget-ico" aria-hidden="true">' +
      ico +
      '</span>' +
      '<strong>' +
      esc(t(type.title)) +
      '</strong>' +
      '</div>' +
      '<div class="widget-actions"><div class="widget-tools">' +
      hoverBtns +
      '</div></div>' +
      '</header>' +
      '<div class="widget-body">' +
      widgetBodyHtml(inst, type) +
      '</div>' +
      resizeHandle +
      '</section>'
    );
  }

  function currentSkin() {
    var id = state.widgetSkin || 'border';
    for (var i = 0; i < WIDGET_SKINS.length; i++) {
      if (WIDGET_SKINS[i].id === id) return WIDGET_SKINS[i];
    }
    return WIDGET_SKINS[0];
  }

  function cycleWidgetSkin() {
    var idx = 0;
    for (var i = 0; i < WIDGET_SKINS.length; i++) {
      if (WIDGET_SKINS[i].id === state.widgetSkin) {
        idx = i;
        break;
      }
    }
    state.widgetSkin = WIDGET_SKINS[(idx + 1) % WIDGET_SKINS.length].id;
    try {
      localStorage.setItem('aiops-widget-skin', state.widgetSkin);
    } catch (e) {}
    render();
  }

  function configCloseSvg() {
    return (
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  function bindConfigPopoverDrag(panel) {
    var head = panel.querySelector('.wg-config-head');
    if (!head || head.dataset.dragBound === '1') return;
    head.dataset.dragBound = '1';
    var dragging = false;
    var ox = 0;
    var oy = 0;

    function clampPos(left, top) {
      var maxL = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      var maxT = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
      return {
        left: Math.max(8, Math.min(maxL, left)),
        top: Math.max(8, Math.min(maxT, top))
      };
    }

    head.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (e.target.closest('button, a, input, label')) return;
      dragging = true;
      head.classList.add('is-dragging');
      var rect = panel.getBoundingClientRect();
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      try {
        head.setPointerCapture(e.pointerId);
      } catch (err) {}
      e.preventDefault();
    });

    head.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var pos = clampPos(e.clientX - ox, e.clientY - oy);
      panel.style.left = pos.left + 'px';
      panel.style.top = pos.top + 'px';
      state.configPos = pos;
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      head.classList.remove('is-dragging');
      try {
        head.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    head.addEventListener('pointerup', endDrag);
    head.addEventListener('pointercancel', endDrag);
  }

  function applyWidgetConfigLive(id) {
    var host = document.getElementById('widgetConfigHost');
    if (!host) return;
    var checked = [];
    host.querySelectorAll('[data-config-metric]').forEach(function (input) {
      if (input.checked) checked.push(input.getAttribute('data-config-metric'));
    });
    var inst = null;
    ensureHomeWidgets().forEach(function (w) {
      if (w.id === id) {
        w.metrics = checked;
        inst = w;
      }
    });
    persistHomeWidgets();
    if (!inst) return;
    var type = widgetType(inst.type);
    var card = document.querySelector('.widget[data-widget-id="' + id + '"]');
    if (card && type) {
      var body = card.querySelector('.widget-body');
      if (body) {
        body.innerHTML = widgetBodyHtml(inst, type);
        paintIcons();
        if (window.AIOpsBoards) window.AIOpsBoards.syncCharts();
      }
    }
  }

  function renderConfigPopover() {
    var host = document.getElementById('widgetConfigHost');
    if (!host) return;
    if (!state.configId) {
      host.innerHTML = '';
      host.hidden = true;
      state.configPos = null;
      return;
    }
    var inst = null;
    ensureHomeWidgets().forEach(function (w) {
      if (w.id === state.configId) inst = w;
    });
    var type = inst && widgetType(inst.type);
    if (!inst || !type) {
      state.configId = null;
      state.configPos = null;
      host.innerHTML = '';
      host.hidden = true;
      return;
    }

    var bodyHtml = '';
    if (type.configurable && type.metrics && type.metrics.length) {
      var selected = {};
      (inst.metrics || []).forEach(function (id) { selected[id] = true; });

      var sections = {};
      var order = [];
      type.metrics.forEach(function (m) {
        var sec = m.section || '';
        if (order.indexOf(sec) < 0) order.push(sec);
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(m);
      });

      bodyHtml =
        '<p class="wg-config-hint">' +
        esc(t('显示指标')) +
        '</p>' +
        order
          .map(function (sec) {
            var items = sections[sec]
              .map(function (m) {
                return (
                  '<label class="wg-check">' +
                    '<input type="checkbox" data-config-metric="' + esc(m.id) + '" data-config-live="' + esc(inst.id) + '"' + (selected[m.id] ? ' checked' : '') + ' />' +
                    '<span>' + esc(t(m.label)) + '</span>' +
                  '</label>'
                );
              })
              .join('');
            return (
              (sec ? '<div class="wg-config-sec">' + esc(t(sec)) + '</div>' : '') +
              '<div class="wg-check-grid">' + items + '</div>'
            );
          })
          .join('');
    } else {
      bodyHtml = '<p class="wg-config-hint">' + esc(t('此组件无可配置指标')) + '</p>';
    }

    host.hidden = false;
    host.innerHTML =
      '<div class="wg-config-card" role="dialog" aria-label="' + esc(t('配置')) + '">' +
        '<div class="wg-config-head" title="' + esc(t('拖拽')) + '">' +
          '<strong>' + esc(t(type.title)) + ' · ' + esc(t('配置')) + '</strong>' +
          '<button type="button" class="wg-config-close" data-config-close="1" aria-label="' + esc(t('关闭')) + '">' +
            configCloseSvg() +
          '</button>' +
        '</div>' +
        '<div class="wg-config-body">' + bodyHtml + '</div>' +
        '<div class="wg-config-foot">' +
          '<button type="button" class="btn-soft is-danger" data-widget-delete="' +
          esc(inst.id) +
          '">' +
          esc(t('删除')) +
          '</button>' +
        '</div>' +
      '</div>';

    var panel = host.querySelector('.wg-config-card');
    if (panel) {
      if (state.configPos) {
        panel.style.left = state.configPos.left + 'px';
        panel.style.top = state.configPos.top + 'px';
      } else {
        var card = document.querySelector('.widget[data-widget-id="' + inst.id + '"]');
        if (card) {
          var rect = card.getBoundingClientRect();
          var top = Math.min(rect.bottom + 8, window.innerHeight - (panel.offsetHeight + 16));
          var left = Math.min(Math.max(16, rect.left), window.innerWidth - 360);
          panel.style.top = Math.max(16, top) + 'px';
          panel.style.left = left + 'px';
        }
      }
      bindConfigPopoverDrag(panel);
    }
  }

  function galleryTypeList(filter) {
    var q = (filter || '').trim().toLowerCase();
    return WIDGET_TYPES.filter(function (type) {
      if (!q) return true;
      return t(type.title).toLowerCase().indexOf(q) >= 0 || type.id.indexOf(q) >= 0;
    });
  }

  function renderGallery() {
    var root = document.getElementById('widgetGallery');
    if (!root) return;
    if (!state.galleryOpen) {
      root.hidden = true;
      root.classList.remove('is-stash');
      document.body.classList.remove('is-gallery-open');
      return;
    }
    document.body.classList.add('is-gallery-open');
    root.hidden = false;
    root.classList.toggle('is-stash', !!state.galleryHidden);

    var type = widgetType(state.galleryType) || WIDGET_TYPES[0];
    if (type.disabled) {
      state.galleryType = 'cost';
      type = widgetType('cost');
    }

    var groups = [
      { key: 'dashboard', label: 'Dashboards' },
      { key: 'schedule', label: '定时任务' },
      { key: 'artifact', label: '产出物' }
    ];

    var nav = groups
      .map(function (g) {
        var items = galleryTypeList(state.galleryQuery)
          .filter(function (x) { return x.group === g.key; })
          .map(function (x) {
            var ico = x.iconSet === 'tabler' ? tablerIcon(x.icon) : lucideIcon(x.icon || 'layout-grid');
            return (
              '<button type="button" class="wg-nav-item' +
                (state.galleryType === x.id ? ' is-active' : '') +
                (x.disabled ? ' is-disabled' : '') +
                '" data-gallery-type="' + esc(x.id) + '"' +
                (x.disabled ? ' disabled' : '') + '>' +
                '<span class="ico" aria-hidden="true">' + ico + '</span>' +
                '<span>' + esc(t(x.title)) + '</span>' +
                (x.disabled ? '<em>' + esc(t('本期不包含短')) + '</em>' : '') +
              '</button>'
            );
          })
          .join('');
        if (!items) return '';
        return (
          '<div class="wg-nav-group"><div class="wg-nav-label">' + esc(t(g.label)) + '</div>' + items + '</div>'
        );
      })
      .join('');

    var previewInst = {
      id: 'gallery-preview',
      type: type.id,
      metrics: (type.defaults || []).slice()
    };

    root.innerHTML =
      '<div class="wg-backdrop" data-gallery-close="1"></div>' +
      '<div class="wg-sheet" role="dialog" aria-modal="true" aria-label="' + esc(t('组件库')) + '">' +
        '<div class="wg-sheet-side">' +
          '<label class="wg-search">' +
            lucideIcon('search') +
            '<input type="search" id="gallerySearch" placeholder="' + esc(t('搜索组件')) + '" value="' + esc(state.galleryQuery || '') + '" />' +
          '</label>' +
          '<div class="wg-nav">' + nav + '</div>' +
        '</div>' +
        '<div class="wg-sheet-main">' +
          '<div class="wg-sheet-head">' +
            '<div><h2>' + esc(t(type.title)) + '</h2><p>' + esc(t('拖到工作台')) + '</p></div>' +
            '<button type="button" class="wg-config-close" data-gallery-close="1" aria-label="' +
            esc(t('关闭')) +
            '">' +
            configCloseSvg() +
            '</button>' +
          '</div>' +
          '<div class="wg-preview-wrap">' +
            widgetChrome(previewInst, type, 'gallery') +
          '</div>' +
        '</div>' +
      '</div>';
    paintIcons();
    if (window.AIOpsBoards) window.AIOpsBoards.syncCharts();
  }

  function openGallery() {
    state.galleryOpen = true;
    state.galleryHidden = false;
    state.configId = null;
    if (!widgetType(state.galleryType) || widgetType(state.galleryType).disabled) {
      state.galleryType = 'cost';
    }
    renderGallery();
    renderConfigPopover();
  }

  function closeGallery() {
    state.galleryOpen = false;
    state.galleryHidden = false;
    renderGallery();
  }

  function addWidgetInstance(typeId, place) {
    var type = widgetType(typeId);
    if (!type || type.disabled) return;
    var list = ensureHomeWidgets();
    var cols = WIDGET_GRID_COLS;
    var inst = makeWidget(typeId);
    normalizeWidgetLayout(inst, type, cols);
    if (place && Number(place.col) > 0 && Number(place.row) > 0) {
      inst.col = Math.round(Number(place.col));
      inst.row = Math.round(Number(place.row));
      normalizeWidgetLayout(inst, type, cols);
    } else {
      var spot = findOpenSpot(list, inst.span, inst.rows, cols);
      inst.col = spot.col;
      inst.row = spot.row;
    }
    list.push(inst);
    resolveCollisions(list, inst.id, cols);
    persistHomeWidgets();
    state.page = '工作台';
    render();
  }

  function deleteWidgetInstance(id) {
    state.homeWidgets = ensureHomeWidgets().filter(function (w) { return w.id !== id; });
    if (state.configId === id) {
      state.configId = null;
      state.configPos = null;
    }
    persistHomeWidgets();
    render();
  }

  function setWidgetSpan(id, span, rows) {
    var cols = WIDGET_GRID_COLS;
    span = Math.max(1, Math.min(cols, Math.round(span)));
    if (rows != null) rows = Math.max(1, Math.min(WIDGET_GRID_ROWS, Math.round(rows)));
    var list = ensureHomeWidgets();
    var target = null;
    list.forEach(function (w) {
      if (w.id === id) target = w;
    });
    if (!target) return;
    // Keep top-left anchor; only grow/shrink. Neighbors push on expand, never pull on shrink.
    target.span = span;
    if (rows != null) target.rows = rows;
    normalizeWidgetLayout(target, widgetType(target.type), cols);
    resolveCollisions(list, id, cols);
    persistHomeWidgets();
    render();
  }

  function setWidgetPosition(id, col, row) {
    var cols = WIDGET_GRID_COLS;
    var list = ensureHomeWidgets();
    var target = null;
    list.forEach(function (w) {
      if (w.id === id) target = w;
    });
    if (!target) return;
    target.col = col;
    target.row = row;
    normalizeWidgetLayout(target, widgetType(target.type), cols);
    resolveCollisions(list, id, cols);
    persistHomeWidgets();
    render();
  }

  function gridColMetrics() {
    var grid = document.getElementById('homeWidgetGrid');
    if (!grid) return { col: 280, row: 88, gap: 16, cols: WIDGET_GRID_COLS, rows: WIDGET_GRID_ROWS };
    var styles = window.getComputedStyle(grid);
    var gap = parseFloat(styles.rowGap || styles.columnGap || styles.gap) || 16;
    // Coordinate space stays 6-col; only stack at phone width.
    var cols = WIDGET_GRID_COLS;
    if (window.matchMedia('(max-width: 760px)').matches) cols = 1;
    var width = grid.clientWidth;
    var col = cols > 1 ? (width - gap * (cols - 1)) / cols : width;
    var row = parseFloat(styles.gridAutoRows) || parseFloat(styles.getPropertyValue('--widget-row')) || 88;
    return { col: col, row: row, gap: gap, cols: cols, rows: WIDGET_GRID_ROWS, grid: grid };
  }

  function makePlaceholder(span, rows, col, row) {
    var el = document.createElement('div');
    el.className =
      'widget-placeholder is-span-' +
      (span || 1) +
      ' is-row-' +
      (rows || 4);
    el.setAttribute('aria-hidden', 'true');
    applyPlacement(el, col || 1, row || 1, span || 1, rows || 4);
    return el;
  }

  function previewMoveLayout(startLayout, widgetId, col, row, span, rows, cols) {
    var live = cloneLayout(startLayout);
    var item = null;
    live.forEach(function (w) {
      if (w.id === widgetId) item = w;
    });
    if (!item) return live;
    if (col != null) item.col = col;
    if (row != null) item.row = row;
    if (span != null) item.span = span;
    if (rows != null) item.rows = rows;
    normalizeWidgetLayout(item, widgetType(item.type), cols);
    resolveCollisions(live, widgetId, cols);
    return live;
  }

  function pageHome() {
    ensureHomeWidgets();
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

    var cards = state.homeWidgets
      .map(function (inst) {
        var type = widgetType(inst.type);
        if (!type) return '';
        return widgetChrome(inst, type, 'canvas');
      })
      .join('');

    var skin = currentSkin();
    return (
      '<div class="home-content" data-widget-skin="' +
      esc(skin.id) +
      '">' +
        '<div class="home-top">' +
          '<div class="page-heading"><h1>' +
          esc(t('工作台')) +
          '</h1></div>' +
          '<div class="home-top-actions">' +
            '<div class="ov-segment" role="group" aria-label="' +
            esc(t('统计时间')) +
            '">' +
            rangeSegs +
            '</div>' +
            '<button class="ov-scope" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="' +
            esc(t('筛选范围')) +
            '">' +
            t('全部') +
            ' ' +
            lucideIcon('chevron-down') +
            '</button>' +
            '<button type="button" class="btn-soft" id="btnWidgetSkin" title="' +
            esc(t('皮肤切换') + ' · Demo') +
            '">' +
            lucideIcon('palette') +
            ' ' +
            esc(t(skin.label)) +
            '</button>' +
            '<button type="button" class="btn-soft" id="btnAddWidget">' +
            tablerIcon('layout-grid-add') +
            ' ' +
            esc(t('添加组件')) +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="widget-grid" id="homeWidgetGrid">' +
        cards +
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
      '<div class="analysis-sticky-chrome">' +
        headingWithRange(t('健康度分析')) +
        (window.AIOpsBoards && window.AIOpsBoards.healthSectionTabs
          ? window.AIOpsBoards.healthSectionTabs()
          : '') +
      '</div>' +
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

  function render(opts) {
    opts = opts || {};
    renderNav();
    var root = document.getElementById('pageRoot');
    if (!root) return;
    var keepScroll = !opts.resetScroll;
    var scrollTop = keepScroll ? root.scrollTop : 0;
    var fn = PAGES[state.page] || function () { return pageWorkspaceStub(state.page); };
    root.innerHTML =
      '<div class="page' +
      (state.page === '工作台' ? ' is-home' : '') +
      (isAnalysisPage(state.page) ? ' is-analysis' : '') +
      '">' +
      fn() +
      '</div>';
    root.scrollTop = scrollTop;
    paintIcons();
    if (window.AIOpsBoards && (isAnalysisPage(state.page) || state.page === '工作台')) {
      window.AIOpsBoards.syncCharts();
    }
    renderGallery();
    renderConfigPopover();
  }

  function go(page) {
    state.page = page;
    state.newOpen = false;
    if (page !== '工作台') {
      state.galleryOpen = false;
      state.galleryHidden = false;
      state.configId = null;
    }
    if (isWsChild(page)) state.wsPinnedId = page;
    render({ resetScroll: true });
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
      if (state.wsOpen) {
        // Collapse: pin current child outside; if already on another tab, fold pin away
        state.wsPinnedId = isWsChild(state.page) ? state.page : null;
        state.wsOpen = false;
      } else {
        state.wsOpen = true;
      }
      renderNav();
      paintIcons();
      return;
    }

    if (e.target.closest('#btnAddWidget')) {
      e.stopPropagation();
      openGallery();
      return;
    }

    if (e.target.closest('#btnWidgetSkin')) {
      e.stopPropagation();
      cycleWidgetSkin();
      return;
    }

    var galleryClose = e.target.closest('[data-gallery-close]');
    if (galleryClose) {
      e.stopPropagation();
      closeGallery();
      return;
    }

    var galleryTypeBtn = e.target.closest('[data-gallery-type]');
    if (galleryTypeBtn && !galleryTypeBtn.disabled) {
      e.stopPropagation();
      state.galleryType = galleryTypeBtn.getAttribute('data-gallery-type');
      renderGallery();
      return;
    }

    var galleryAdd = e.target.closest('[data-gallery-add]');
    if (galleryAdd) {
      e.stopPropagation();
      addWidgetInstance(galleryAdd.getAttribute('data-gallery-add'));
      return;
    }

    var configClose = e.target.closest('[data-config-close]');
    if (configClose) {
      e.stopPropagation();
      state.configId = null;
      state.configPos = null;
      renderConfigPopover();
      return;
    }

    var widgetConfig = e.target.closest('[data-widget-config]');
    if (widgetConfig) {
      e.stopPropagation();
      state.configId = widgetConfig.getAttribute('data-widget-config');
      state.configPos = null;
      state.galleryOpen = false;
      renderGallery();
      renderConfigPopover();
      return;
    }

    var widgetDelete = e.target.closest('[data-widget-delete]');
    if (widgetDelete) {
      e.stopPropagation();
      if (!window.confirm(t('确认删除组件'))) return;
      deleteWidgetInstance(widgetDelete.getAttribute('data-widget-delete'));
      return;
    }

    if (
      state.configId &&
      !e.target.closest('#widgetConfigHost') &&
      !e.target.closest('[data-widget-config]')
    ) {
      state.configId = null;
      state.configPos = null;
      renderConfigPopover();
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

  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'gallerySearch') {
      state.galleryQuery = e.target.value || '';
      renderGallery();
      var input = document.getElementById('gallerySearch');
      if (input) {
        input.focus();
        try {
          input.setSelectionRange(input.value.length, input.value.length);
        } catch (err) {}
      }
    }
  });

  document.addEventListener('change', function (e) {
    var metric = e.target && e.target.closest('[data-config-live]');
    if (!metric) return;
    applyWidgetConfigLive(metric.getAttribute('data-config-live'));
  });

  /* Drag: gallery → canvas · canvas reorder (live placeholder) · corner resize */
  var dragGhost = null;

  function clearDragDecor() {
    if (dragGhost && dragGhost.parentNode) dragGhost.parentNode.removeChild(dragGhost);
    dragGhost = null;
    document.querySelectorAll('.widget-placeholder').forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    document.querySelectorAll('.widget.is-dragging, .widget.is-resizing').forEach(function (el) {
      el.classList.remove('is-dragging', 'is-resizing');
      el.style.pointerEvents = '';
      el.style.display = '';
    });
    var grid = document.getElementById('homeWidgetGrid');
    if (grid) grid.classList.remove('is-dropping');
  }

  function makeGhostFrom(el, x, y) {
    if (dragGhost && dragGhost.parentNode) dragGhost.parentNode.removeChild(dragGhost);
    dragGhost = el.cloneNode(true);
    dragGhost.classList.add('widget-drag-ghost');
    dragGhost.querySelectorAll('[data-widget-resize], .widget-tools, .widget-link').forEach(function (n) {
      n.remove();
    });
    var rect = el.getBoundingClientRect();
    var w = Math.min(rect.width, 440);
    dragGhost.style.width = w + 'px';
    dragGhost.style.left = x - Math.min(24, w * 0.08) + 'px';
    dragGhost.style.top = y - 18 + 'px';
    document.body.appendChild(dragGhost);
  }

  function endDragSession() {
    if (state.drag && state.drag.captureEl) {
      try {
        state.drag.captureEl.releasePointerCapture(state.drag.pointerId);
      } catch (err) {}
    }
    state.drag = null;
    clearDragDecor();
  }

  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;

    var resizeBtn = e.target.closest('[data-widget-resize]');
    if (resizeBtn) {
      var rid = resizeBtn.getAttribute('data-widget-resize');
      var rcard = document.querySelector('.widget[data-widget-id="' + rid + '"]');
      if (!rcard) return;
      var metrics = gridColMetrics();
      var rrect = rcard.getBoundingClientRect();
      var startLayout = cloneLayout(ensureHomeWidgets());
      state.drag = {
        kind: 'resize',
        widgetId: rid,
        startX: e.clientX,
        startY: e.clientY,
        startSpan: Number(rcard.getAttribute('data-span') || 1),
        startRows: Number(rcard.getAttribute('data-rows') || 4),
        startCol: Number(rcard.getAttribute('data-col') || 1),
        startRow: Number(rcard.getAttribute('data-row') || 1),
        startLayout: startLayout,
        left: rrect.left,
        top: rrect.top,
        col: metrics.col,
        row: metrics.row,
        gap: metrics.gap,
        maxCols: metrics.cols || WIDGET_GRID_COLS,
        maxRows: metrics.rows || WIDGET_GRID_ROWS,
        active: true,
        pointerId: e.pointerId,
        captureEl: resizeBtn
      };
      rcard.classList.add('is-resizing');
      try {
        resizeBtn.setPointerCapture(e.pointerId);
      } catch (err) {}
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    var galleryPreview = e.target.closest('[data-gallery-preview]');
    var canvasDrag = e.target.closest('[data-widget-drag]');

    if (galleryPreview && !e.target.closest('[data-gallery-add]')) {
      state.drag = {
        kind: 'gallery',
        typeId: galleryPreview.getAttribute('data-widget-type'),
        startX: e.clientX,
        startY: e.clientY,
        active: false,
        pointerId: e.pointerId,
        captureEl: galleryPreview
      };
      try {
        galleryPreview.setPointerCapture(e.pointerId);
      } catch (err) {}
      return;
    }

    if (canvasDrag) {
      var id = canvasDrag.getAttribute('data-widget-drag');
      state.drag = {
        kind: 'reorder',
        widgetId: id,
        startX: e.clientX,
        startY: e.clientY,
        active: false,
        pointerId: e.pointerId,
        captureEl: canvasDrag
      };
      try {
        canvasDrag.setPointerCapture(e.pointerId);
      } catch (err) {}
      e.preventDefault();
    }
  });

  document.addEventListener('pointermove', function (e) {
    if (!state.drag || state.drag.pointerId !== e.pointerId) return;

    if (state.drag.kind === 'resize') {
      var width = e.clientX - state.drag.left;
      var height = e.clientY - state.drag.top;
      var colUnit = state.drag.col + state.drag.gap;
      var rowUnit = state.drag.row + state.drag.gap;
      var span = Math.round((width + state.drag.gap) / colUnit);
      var rows = Math.round((height + state.drag.gap) / rowUnit);
      var maxSpan = Math.min(
        state.drag.maxCols,
        state.drag.maxCols - state.drag.startCol + 1
      );
      span = Math.max(1, Math.min(maxSpan, span));
      rows = Math.max(1, Math.min(state.drag.maxRows, rows));
      state.drag.liveSpan = span;
      state.drag.liveRows = rows;
      var live = previewMoveLayout(
        state.drag.startLayout,
        state.drag.widgetId,
        state.drag.startCol,
        state.drag.startRow,
        span,
        rows,
        state.drag.maxCols
      );
      state.drag.liveLayout = live;
      paintLayout(live);
      scheduleChartSync();
      return;
    }

    var dx = e.clientX - state.drag.startX;
    var dy = e.clientY - state.drag.startY;
    if (!state.drag.active && dx * dx + dy * dy < 36) return;

    if (!state.drag.active) {
      state.drag.active = true;
      var grid = document.getElementById('homeWidgetGrid');

      if (state.drag.kind === 'gallery') {
        state.galleryHidden = true;
        renderGallery();
        grid = document.getElementById('homeWidgetGrid');
        var type = widgetType(state.drag.typeId);
        var gSpan = (type && type.span) || 1;
        var gRows = (type && type.rows) || 4;
        var fake = document.createElement('div');
        fake.className = 'widget is-span-' + gSpan + ' is-row-' + gRows;
        fake.innerHTML =
          '<header class="widget-head"><div class="widget-title"><strong>' +
          esc(t(type.title)) +
          '</strong></div></header><div class="widget-body"><div class="widget-empty">' +
          esc(t('添加')) +
          '</div></div>';
        document.body.appendChild(fake);
        fake.style.position = 'fixed';
        fake.style.left = '-9999px';
        makeGhostFrom(fake, e.clientX, e.clientY);
        fake.parentNode.removeChild(fake);

        state.drag.span = gSpan;
        state.drag.rows = gRows;
        state.drag.startLayout = cloneLayout(ensureHomeWidgets());
        state.drag.placeholderId = '__new__';
        if (grid) {
          var cell0 = pointToGridCell(e.clientX, e.clientY, gSpan, gRows);
          var ph = makePlaceholder(gSpan, gRows, cell0.col, cell0.row);
          state.drag.placeholder = ph;
          grid.appendChild(ph);
          grid.classList.add('is-dropping');
          state.drag.dropCol = cell0.col;
          state.drag.dropRow = cell0.row;
        }
      } else if (state.drag.kind === 'reorder') {
        var card = document.querySelector('.widget[data-widget-id="' + state.drag.widgetId + '"]');
        if (card && grid) {
          var span2 = Number(card.getAttribute('data-span') || 1);
          var rows2 = Number(card.getAttribute('data-rows') || 4);
          var col2 = Number(card.getAttribute('data-col') || 1);
          var row2 = Number(card.getAttribute('data-row') || 1);
          makeGhostFrom(card, e.clientX, e.clientY);
          state.drag.span = span2;
          state.drag.rows = rows2;
          state.drag.startLayout = cloneLayout(ensureHomeWidgets());
          state.drag.placeholderId = state.drag.widgetId;
          var ph2 = makePlaceholder(span2, rows2, col2, row2);
          state.drag.placeholder = ph2;
          grid.appendChild(ph2);
          card.classList.add('is-dragging');
          card.style.display = 'none';
          grid.classList.add('is-dropping');
          state.drag.dropCol = col2;
          state.drag.dropRow = row2;
          var live0 = previewMoveLayout(
            state.drag.startLayout,
            state.drag.widgetId,
            col2,
            row2,
            span2,
            rows2,
            WIDGET_GRID_COLS
          );
          state.drag.liveLayout = live0;
          paintLayout(live0, state.drag.widgetId, ph2);
        }
      }
    }

    if (dragGhost) {
      dragGhost.style.left = e.clientX - 24 + 'px';
      dragGhost.style.top = e.clientY - 18 + 'px';
    }

    if (
      (state.drag.kind === 'reorder' || state.drag.kind === 'gallery') &&
      state.drag.placeholder
    ) {
      var cell = pointToGridCell(
        e.clientX,
        e.clientY,
        state.drag.span,
        state.drag.rows
      );
      state.drag.dropCol = cell.col;
      state.drag.dropRow = cell.row;
      if (state.drag.kind === 'reorder') {
        var liveR = previewMoveLayout(
          state.drag.startLayout,
          state.drag.widgetId,
          cell.col,
          cell.row,
          state.drag.span,
          state.drag.rows,
          cell.cols
        );
        state.drag.liveLayout = liveR;
        paintLayout(liveR, state.drag.widgetId, state.drag.placeholder);
      } else {
        applyPlacement(
          state.drag.placeholder,
          cell.col,
          cell.row,
          state.drag.span,
          state.drag.rows
        );
      }
    }
  });

  document.addEventListener('pointerup', function (e) {
    if (!state.drag || state.drag.pointerId !== e.pointerId) return;
    var drag = state.drag;

    if (drag.kind === 'resize') {
      var span = drag.liveSpan != null ? drag.liveSpan : drag.startSpan;
      var rows = drag.liveRows != null ? drag.liveRows : drag.startRows;
      var liveLayout = drag.liveLayout;
      endDragSession();
      if (liveLayout) {
        commitLayout(liveLayout);
        persistHomeWidgets();
        render();
      } else {
        setWidgetSpan(drag.widgetId, span, rows);
      }
      return;
    }

    if (!drag.active) {
      endDragSession();
      if (drag.kind === 'gallery') {
        state.galleryHidden = false;
        renderGallery();
      }
      return;
    }

    if (drag.kind === 'gallery') {
      var grid = document.getElementById('homeWidgetGrid');
      var hit = document.elementFromPoint(e.clientX, e.clientY);
      var overGrid = !!(
        grid &&
        hit &&
        (grid === hit ||
          grid.contains(hit) ||
          (drag.placeholder && drag.placeholder.parentNode === grid))
      );
      var dropCol = drag.dropCol;
      var dropRow = drag.dropRow;
      endDragSession();
      if (overGrid) {
        state.galleryHidden = false;
        state.galleryOpen = false;
        addWidgetInstance(drag.typeId, { col: dropCol, row: dropRow });
      } else {
        state.galleryHidden = false;
        renderGallery();
      }
      return;
    }

    if (drag.kind === 'reorder') {
      var liveReorder = drag.liveLayout;
      var dropC = drag.dropCol;
      var dropR = drag.dropRow;
      endDragSession();
      if (liveReorder) {
        commitLayout(liveReorder);
        persistHomeWidgets();
        render();
      } else if (dropC && dropR) {
        setWidgetPosition(drag.widgetId, dropC, dropR);
      } else {
        render();
      }
      return;
    }

    endDragSession();
  });

  document.addEventListener('pointercancel', function (e) {
    if (!state.drag || (e.pointerId != null && state.drag.pointerId !== e.pointerId)) return;
    var wasGallery = state.drag.kind === 'gallery';
    endDragSession();
    if (wasGallery) {
      state.galleryHidden = false;
      renderGallery();
    } else {
      render();
    }
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
      if (state.configId) {
        state.configId = null;
        state.configPos = null;
        renderConfigPopover();
      } else if (state.galleryOpen) {
        closeGallery();
      }
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
      getLang: function () {
        return state.lang;
      },
      t: t,
      rerender: function () {
        render();
      }
    });
  }

  try {
    var savedLang = localStorage.getItem('aiops-lang');
    if (savedLang === 'en' || savedLang === 'zh') state.lang = savedLang;
    var savedSkin = localStorage.getItem('aiops-widget-skin');
    if (savedSkin === 'border' || savedSkin === 'raised' || savedSkin === 'inset') {
      state.widgetSkin = savedSkin;
    }
  } catch (e) {}
  state.homeWidgets = loadHomeWidgets() || defaultHomeWidgets();
  ensureWidgetCoords(state.homeWidgets, WIDGET_GRID_COLS);
  persistHomeWidgets();
  applyStaticLang();
  render();
})();
