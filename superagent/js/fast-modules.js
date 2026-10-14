/**
 * Fast POC page ONLY — right-panel modules (Ontology · Agent · Skill · MCP · Data source · Knowledge base · Scenario · Test · Sandbox)
 * (not loaded by superagent.html).
 *
 *   FastSandbox          shared state of the draft Agent: { generated, phase: sandbox|hardening|production, mocks, backtest, access, signoff, trial }
 *                        .on(fn) / .emit() / .gates() / .maturity(key) / .envLabel()
 *   FastModules.open(key)  open a module page as a tab in the right panel (launcher items call this)
 *
 * What the Fast flow generates (ontology stub, skill stubs, sample-data MCP …) is shown here, drill-down:
 * list → item detail. Everything carries its maturity: Sandbox draft · Mock → Verified → Production.
 */
(function () {
  'use strict';
  var FD = function () { return window.FastDocs; };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ───────── shared sandbox state ───────── */
  var S = {
    generated: false,
    phase: 'sandbox',                                 // sandbox → hardening → production
    mocks: { onto: 'mock', skill: 'mock', erp: 'mock' },
    backtest: null,                                   // { pass, total }
    access: false, signoff: false,
    trial: [],                                        // [{ q, ok }]
  };
  var subs = [];
  var Sandbox = {
    state: S,
    on: function (fn) { subs.push(fn); },
    emit: function () { subs.forEach(function (f) { try { f(S); } catch (e) { console.error(e); } }); document.dispatchEvent(new CustomEvent('fastsandbox')); },
    envLabel: function () { return S.phase === 'production' ? '正式 · v1.0' : S.phase === 'hardening' ? '加固中 · RC' : '进行中'; },
    mocksLeft: function () { return Object.keys(S.mocks).filter(function (k) { return S.mocks[k] !== 'verified'; }).length; },
    gates: function () {
      var left = Sandbox.mocksLeft();
      return [
        { id: 'mock', t: 'Mock 清零', d: '本体、Skill 规则、ERP 连接全部换成真实实现', ok: left === 0, v: (3 - left) + ' / 3' },
        { id: 'access', t: '权限就绪', d: 'ERP 只读账号与数据权限已配置', ok: S.access, v: S.access ? '已配置' : '待配置' },
        { id: 'sign', t: '负责人签字', d: '业务负责人确认可以上线', ok: S.signoff, v: S.signoff ? '已签字' : '待签字' },
      ];
    },
    allGates: function () { return Sandbox.gates().every(function (g) { return g.ok; }); },
  };
  window.FastSandbox = Sandbox;

  /* ───────── small html helpers ───────── */
  function tag(kind, text) { return '<span class="fx-tag ' + kind + '">' + text + '</span>'; }
  function mat(key) {
    if (S.phase === 'production') return tag('prod', 'Production');
    return S.mocks[key] === 'verified' ? tag('ok', 'Verified') : tag('mock', 'Mock');
  }
  function env() {
    var cls = S.phase, txt = Sandbox.envLabel();
    return '<span class="fx-env ' + cls + '"><i></i>' + txt + '</span>';
  }
  function banner(real) {
    if (real) return '<div class="fx-banner real">来自你上传的资料，已读取并索引，内容是真实的。</div>';
    if (S.phase === 'production') return '<div class="fx-banner prod">已发布到正式环境 v1.0。这里的内容都是真实实现，不再有 Mock。</div>';
    if (S.phase === 'hardening') return '<div class="fx-banner hard">加固中：正在把 Mock 逐项换成真实实现，全部通过发布门槛后可发布 v1.0。</div>';
    return '<div class="fx-banner sand">部分内容目前由 AI 先行模拟（Mock），和你最终想要的会有差距，做的过程中会逐项换成真实实现。</div>';
  }
  /* environment of one asset: sandbox → hardening → prod; uploaded materials are 'real' (already formal) */
  function envOf(real) { return real ? 'real' : S.phase === 'production' ? 'prod' : S.phase === 'hardening' ? 'hardening' : 'sandbox'; }
  function grpOf(e) { return e === 'prod' || e === 'real' ? 'formal' : 'sandbox'; }
  function pill(e) { return e === 'sandbox' ? '' : '<span class="fx-pill ' + e + '">' + ({ hardening: '加固中', prod: '正式', real: '真实' })[e] + '</span>'; }
  var CHEV = '<svg class="fx-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  function row(id, name, sub, tags, attrs) {
    return '<button type="button" class="fx-row" data-open="' + esc(id) + '"' + (attrs || '') + '><span class="fx-rm"><b>' + esc(name) + '</b><i>' + esc(sub) + '</i></span><span class="fx-rt">' + (tags || '') + '</span>' + CHEV + '</button>';
  }
  function table(head, rows) {
    return '<table class="fx-t"><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td>' + (i === 0 ? '<b>' + c + '</b>' : c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  function kv(rows) {
    return '<dl class="fx-kv">' + rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  }
  function sec(t, body) { return '<h4 class="fx-h">' + esc(t) + '</h4>' + body; }
  function ul(items) { return '<ul class="fx-ul">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'; }
  function empty(msg, t) { return '<div class="fx-empty"><div class="fx-empty-t">' + (t || '暂无') + '</div><div class="fx-empty-s">' + msg + '</div></div>'; }
  function decText(id) {
    var P = window.FastPlanData, d = P && P.decisions.filter(function (x) { return x.id === id; })[0];
    var i = (P && P.picks && P.picks[id]) || 0;
    return d ? d.opts[i].t : '';
  }

  /* ───────── content: what the Fast flow generated ───────── */
  var ONTO = {
    Supplier: { key: 'supplier_id', src: 'ERP 供应商主数据 · 合格供应商清单', props: [['name', 'string', 'Hexin Microelectronics'], ['status', 'enum', 'qualified / exception / under_review'], ['iso_9001', 'date', '2027-03'], ['monthly_capacity', 'int', '1,200 (k pcs)'], ['lead_time_weeks', 'int', '3']], links: ['Supplier ─supplies→ Part', 'Supplier ─quotes→ Quote', 'Supplier ─bound_by→ Contract', 'Supplier ─has→ Incident'], gap: '「例外」状态目前只存在于清单备注里，需要单独建属性。', fix: '已新增 exception 属性与例外编号（如 EX-2026-02）。' },
    Part: { key: 'part_no', src: 'ERP 物料主数据', props: [['category', 'enum', 'electronic / structural'], ['spec', 'string', 'MCU LQFP100'], ['moq', 'int', '10k']], links: ['Supplier ─supplies→ Part', 'Quote ─for→ Part'], gap: '品类来自物料描述推断，部分料号归类不准。', fix: '已按物料分类表校对品类。' },
    Quote: { key: 'quote_id', src: 'ERP 报价导出（14 条）', props: [['unit_price', 'decimal', '12.60'], ['currency', 'enum', 'CNY / USD'], ['tax_rate', 'decimal', '13%'], ['valid_until', 'date', '2026-09-30'], ['moq', 'int', '10k']], links: ['Supplier ─quotes→ Quote', 'Quote ─for→ Part'], gap: '含税价与币种需要换算，样例里没有汇率。', fix: '已接入汇率表，含税价统一换算。' },
    Contract: { key: 'contract_id', src: '历史合同 · 价格汇总表', props: [['start', 'date', '2025-03-15'], ['end', 'date', '2027-03-14'], ['annual_reduction', 'decimal', '3%'], ['delay_penalty', 'decimal', '0.5% / 天']], links: ['Supplier ─bound_by→ Contract'], gap: '年降和罚则条款是文本，不能直接参与比价。', fix: '年降、罚则已结构化，可参与比价。' },
    Incident: { key: 'incident_id', src: '异常记录 2026（8 起）', props: [['type', 'enum', '质量 / 交期 / 产能'], ['severity', 'enum', 'minor / major'], ['replaced', 'bool', 'true'], ['date', 'date', '2026-09-08']], links: ['Supplier ─has→ Incident'], gap: '严重程度由备注推断，没有统一口径。', fix: '已与品质部对齐严重程度口径。' },
  };
  var SKILLS = {
    'screen-suppliers': { d: '按硬性条件筛选候选供应商，逐项给出通过与否和依据。', io: ['品类、数量', '通过筛选的候选清单（含未通过原因）'], rules: [['ISO 9001', '无有效证书则一票否决'], ['月产能', '< 10 万件：扣分并提示'], ['标准交期', '> 4 周：扣分并提示']], mock: '阈值写死在规则里，不读取准入标准的版本。', real: '规则可配置，随准入标准版本更新。' },
    'compare-quotes': { d: '整理报价并换算币种、税率和起订量后出比价表。', io: ['料号、供应商清单', '换算后的比价表'], rules: [['价格口径', null], ['币种', '统一换算为 CNY'], ['起订量', '按阶梯价取对应档位']], mock: '只读 14 条样例报价，没有汇率与阶梯价。', real: '读取 ERP 实时报价，接入汇率表。' },
    'score-suppliers': { d: '按权重打分排序，给出分项依据。', io: ['候选清单、权重', '分项得分与排序'], rules: [['评分权重', null], ['例外供应商', null], ['输出', '得分 + 分项依据 + 风险标记']], mock: '权重固定，不支持按场景调整，没有回测。', real: '权重可配置、带版本，并用历史案例回测。' },
  };

  /* ───────── module definitions ─────────
     items()  → [{ id, env, html }]   cards shown in the module (empty → "暂无")
     detail(id) → html | null         drill-down page(s); 'main' is the item's own page, deeper ids hang under it
     custom()  → html                 modules that are not a card grid (Sandbox) */
  var MODS = {};
  function def(key, title, o) { MODS[key] = Object.assign({ key: key, title: title, stack: [], filter: 'all' }, o); }

  var ERP_DOC = 'ERP quotation export 2026-Q3.xlsx';
  function erpSheet(name) { var d = FD() && FD().find(ERP_DOC); return d && d.sheets.filter(function (s) { return s.name === name; })[0]; }

  function card(cls, e, id, inner) { return '<button type="button" class="fx-card ' + cls + ' is-' + e + '" data-open="' + esc(id) + '">' + inner + '</button>'; }
  function graphAva() {
    var s = '#8b5cf6', f = '#ede9fe';
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 7.5L12 12L6 16.5M12 12L18 7.5M12 12L18 16.5" stroke="' + s + '" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/><circle cx="6" cy="7.5" r="2.4" fill="' + f + '" stroke="' + s + '" stroke-width="1.2"/><circle cx="6" cy="16.5" r="2.2" fill="#fff" stroke="' + s + '" stroke-width="1.2"/><circle cx="12" cy="12" r="2.8" fill="' + s + '"/><circle cx="18" cy="7.5" r="2.2" fill="#fff" stroke="' + s + '" stroke-width="1.2"/><circle cx="18" cy="16.5" r="2.3" fill="' + f + '" stroke="' + s + '" stroke-width="1.2"/></svg>';
  }
  function logoCard(id, e, letter, color, name, desc, pills) {
    return card('fx-mcp', e, id, '<span class="fx-logo" style="background:' + color + '">' + letter + '</span><span class="fx-mcp-b"><span class="fx-mcp-n">' + esc(name) + '</span><span class="fx-mcp-d">' + esc(desc) + '</span><span class="fx-mcp-u">Updated: just now</span><span class="fx-mcp-r">' + pills + '</span></span>');
  }

  /* — Ontology — */
  def('ontology', 'Ontology', {
    ready: function () { return S.generated; },
    why: '快速出一版后，生成的本体草稿会出现在这里。',
    items: function () {
      var e = envOf(false), ok = S.mocks.onto === 'verified';
      return [{ id: 'main', env: e, html: card('fx-on', e, 'main',
        '<span class="fx-on-h"><span class="fx-on-ava">' + graphAva() + '</span><span class="fx-on-n">Sourcing ontology</span></span>' +
        '<span class="fx-on-d">供应商、物料、报价、合同、异常 5 个对象，以及它们之间的 5 条关系。</span>' +
        '<span class="fx-on-m">Generated · ' + (S.phase === 'production' ? 'v1.0' : 'v0.1') + '</span>' +
        '<span class="fx-on-t">' + pill(e) + (S.phase === 'production' ? '' : mat('onto')) + '<span class="fx-chip">5 objects</span></span>') }];
    },
    crumb: function (id) { return id === 'main' ? 'Sourcing ontology' : id; },
    detail: function (id) {
      if (id === 'main') {
        var ok = S.mocks.onto === 'verified';
        return '<div class="fx-title">Sourcing ontology ' + pill(envOf(false)) + ' ' + mat('onto') + '</div>' + banner() +
          (window.FastOntoGraph ? window.FastOntoGraph.view({ objects: ONTO, mock: !ok, tag: mat('onto') }) : '') +
          '<p class="fx-hint">' + (ok ? '已按真实数据校对。' : '由 ERP 字段字典直接生成（Mock），未经真实数据校对。') + '对应文件：<a href="#" data-doc="Ontology stub.json">Ontology stub.json</a> · <a href="#" data-doc="Ontology plan v0.1.md">Ontology plan v0.1</a></p>';
      }
      var o = ONTO[id]; if (!o) return null;
      return '<div class="fx-title">' + esc(id) + ' ' + mat('onto') + '</div>' +
        kv([['主键', '<code>' + o.key + '</code>'], ['来源', esc(o.src)]]) +
        sec('属性', table(['属性', '类型', '示例'], o.props.map(function (p) { return [p[0], p[1], esc(p[2])]; }))) +
        sec('关系', ul(o.links.map(esc))) +
        sec(S.mocks.onto === 'verified' ? '校对结果' : '已知缺口', '<p class="fx-p">' + esc(S.mocks.onto === 'verified' ? o.fix : o.gap) + '</p>');
    },
  });

  /* — Skill — */
  def('skill', 'Skill', {
    ready: function () { return S.generated; },
    why: '快速出一版后，生成的 Skill 草稿会出现在这里。',
    items: function () {
      var e = envOf(false), ok = S.mocks.skill === 'verified', ver = S.phase === 'production' ? 'v1.0' : 'v0.1';
      return Object.keys(SKILLS).map(function (n) {
        var k = SKILLS[n];
        return { id: n, env: e, html: card('fx-sk', e, n,
          '<span class="fx-sk-code"><span><i class="c">---</i></span><span><i class="k">name</i>: <i class="s">' + esc(n) + '</i></span><span><i class="k">version</i>: <i class="s">' + ver + '</i></span><span><i class="k">description</i>: <i class="s">|</i></span><span>  ' + esc(k.d.slice(0, 22)) + '…</span><span><i class="k">tags</i>: <i class="s">[sourcing, ' + (ok || S.phase === 'production' ? 'verified' : 'mock') + ']</i></span><span><i class="c">---</i></span></span>' +
          '<span class="fx-sk-b"><span class="fx-sk-tr"><span class="fx-sk-n">' + esc(n) + '</span><span class="fx-sk-v">' + ver + '</span></span><span class="fx-sk-d">' + esc(k.d) + '</span><span class="fx-sk-t">' + pill(e) + (S.phase === 'production' ? '' : mat('skill')) + '</span></span>') };
      });
    },
    detail: function (id) {
      var k = SKILLS[id]; if (!k) return null;
      var rules = k.rules.map(function (r) {
        var v = r[1];
        if (v == null) v = r[0] === '价格口径' ? esc(decText('D5')) : r[0] === '评分权重' ? esc(decText('D1')) : esc(decText('D2'));
        return [r[0], v];
      });
      var ok = S.mocks.skill === 'verified';
      return '<div class="fx-title">' + esc(id) + ' ' + pill(envOf(false)) + ' ' + mat('skill') + '</div>' + banner() +
        '<p class="fx-p">' + esc(k.d) + '</p>' + kv([['输入', esc(k.io[0])], ['输出', esc(k.io[1])]]) +
        sec('规则配置', table(['规则', '内容'], rules)) +
        sec(ok ? '现在是什么' : '现在是什么（Mock）', '<p class="fx-p">' + esc(ok ? k.real : k.mock) + '</p>') +
        (ok ? '' : sec('正式版本', '<p class="fx-p">' + esc(k.real) + '</p>'));
    },
  });

  /* — MCP — */
  def('mcp', 'MCP', {
    ready: function () { return S.generated; },
    why: '快速出一版后，生成的 ERP 连接草稿会出现在这里。',
    items: function () {
      var e = envOf(false), ok = S.mocks.erp === 'verified';
      return [
        { id: 'erp', env: e, html: logoCard('erp', e, 'E', '#4f46e5', 'ERP connector', ok ? '只读 ERP 接口：供应商、料号、报价。' : '用 14 条 ERP 导出样例回答，不连接真实 ERP。', pill(e) + (S.phase === 'production' ? '' : mat('erp')) + '<span class="fx-chip mono">read-only</span>') },
        { id: 'rules', env: 'real', html: logoCard('rules', 'real', 'R', '#0f766e', 'Rules & templates', '准入标准、评审摘要模板，来自你上传的资料。', pill('real') + tag('real', 'Real')) },
      ];
    },
    detail: function (id) {
      if (id === 'rules') {
        return '<div class="fx-title">Rules &amp; templates ' + pill('real') + '</div>' + banner(true) +
          kv([['来源', '你上传的资料'], ['内容', '准入标准 v3.2 · 评审摘要模板']]) +
          sec('文件', ul(['<a href="#" data-doc="Supplier admission standard v3.2.md">Supplier admission standard v3.2</a>', '<a href="#" data-doc="Qualified supplier list 2026.xlsx">Qualified supplier list 2026</a>']));
      }
      if (id !== 'erp') return null;
      var q = erpSheet('Quotations'), ok = S.mocks.erp === 'verified';
      var idx = [0, 3, 4, 7, 8, 10];
      return '<div class="fx-title">ERP connector ' + pill(envOf(false)) + ' ' + mat('erp') + '</div>' + banner() +
        kv([['模式', ok ? '只读 ERP 接口（正式）' : '样例数据（Mock）'], ['数据', ok ? '实时' : '14 条 ERP 导出样例'], ['权限', ok ? '只读账号' : '无，不连接 ERP']]) +
        sec('接口', table(['接口', '用途'], [['GET /suppliers', '供应商主数据'], ['GET /parts', '物料与品类'], ['GET /quotes?part_no=', '某料号的有效报价']])) +
        (q ? sec(ok ? '实时数据（抽样）' : '样例数据（前 6 条）', table(idx.map(function (i) { return q.cols[i]; }), q.rows.slice(0, 6).map(function (r) { return idx.map(function (i) { return esc(r[i]); }); }))) : '') +
        sec(ok ? '已完成' : '替换成正式', '<p class="fx-p">' + (ok ? '已用只读账号接入 ERP，字段与字典一致，抽样核对 20 条通过。' : '需要 ERP 只读账号和接口地址，字段按字典映射。在 Agent 面板的 Mocks 页签里处理。') + '</p>');
    },
  });

  /* — Data source — */
  def('data', 'Data source', {
    ready: function () { return S.generated; },
    why: '快速出一版后，用到的数据源会出现在这里。',
    items: function () {
      var e = envOf(false), okE = S.mocks.erp === 'verified';
      return [
        { id: 'quotes', env: e, html: logoCard('quotes', e, 'Q', '#0d99ff', 'ERP quotation export 2026-Q3', okE ? 'ERP 实时报价（只读）。' : '样例数据：14 条报价，13 个字段。', pill(e) + (S.phase === 'production' ? '' : mat('erp'))) },
        { id: 'suppliers', env: 'real', html: logoCard('suppliers', 'real', 'S', '#0f766e', 'Supplier master', '来自 Qualified supplier list 2026，12 家供应商。', pill('real') + tag('real', 'Real')) },
      ];
    },
    detail: function (id) {
      if (id === 'suppliers') {
        return '<div class="fx-title">Supplier master ' + pill('real') + '</div>' + banner(true) +
          kv([['来源', '<a href="#" data-doc="Qualified supplier list 2026.xlsx">Qualified supplier list 2026.xlsx</a>'], ['内容', '12 家：9 合格 · 2 例外 · 1 复核中']]);
      }
      if (id !== 'quotes') return null;
      var f = erpSheet('Field dictionary');
      return '<div class="fx-title">ERP quotation export ' + pill(envOf(false)) + ' ' + mat('erp') + '</div>' + banner() +
        kv([['来源', '<a href="#" data-doc="' + ERP_DOC + '">' + ERP_DOC + '</a>'], ['内容', S.mocks.erp === 'verified' ? '实时报价（只读）' : '14 条样例报价（Mock）']]) +
        (f ? sec('字段字典', table(f.cols, f.rows.map(function (r) { return r.map(esc); }))) : '');
    },
  });

  /* — Knowledge base (uploaded materials: already real) — */
  def('knowledge', 'Knowledge base', {
    ready: function () { return !!document.querySelector('#fast-materials .file'); },
    why: '上传资料后，已索引的知识库会出现在这里。',
    items: function () {
      var groups = FD() ? FD().groups() : [];
      return groups.map(function (g) {
        return { id: g.folder, env: 'real', html: card('fx-kb', 'real', g.folder,
          '<span class="fx-kb-p"><span class="fx-kb-src">Upload</span><span class="fx-kb-doc back"><i class="t"></i><i class="w90"></i><i class="w60"></i></span><span class="fx-kb-doc front"><i class="t"></i><i class="w80"></i><i class="w90"></i><i class="w45"></i><i class="w60"></i></span></span>' +
          '<span class="fx-kb-b"><span class="fx-kb-n">' + esc(g.folder) + '</span><span class="fx-kb-m"><i class="dot"></i>' + g.files.length + ' 份文件<em>·</em>已索引</span><span class="fx-kb-t">' + pill('real') + '</span></span>') };
      });
    },
    detail: function (id) {
      var g = (FD() ? FD().groups() : []).filter(function (x) { return x.folder === id; })[0]; if (!g) return null;
      return '<div class="fx-title">' + esc(id) + ' ' + tag('ok', 'Indexed') + '</div><div class="fx-list">' + g.files.map(function (d) {
        return '<button type="button" class="fx-row" data-doc="' + esc(d.name) + '"><span class="fx-rm"><b>' + esc(d.name) + '</b><i>' + esc(d.note) + '</i></span>' + CHEV + '</button>';
      }).join('') + '</div>';
    },
  });

  /* — Agent — */
  def('agent', 'Agent', {
    ready: function () { return S.generated; },
    why: '快速出一版后，生成的 Agent 会出现在这里，可以直接试用。',
    items: function () {
      var e = envOf(false), left = Sandbox.mocksLeft();
      var status = S.phase === 'production' ? 'Live · v1.0' : S.phase === 'hardening' ? '加固中 · RC' : '进行中';
      return [{ id: 'agent', env: e, html: '<div class="fx-card fx-ag is-' + e + '" role="button" tabindex="0" data-try="1">' +
        '<span class="fx-ag-m"><span class="fx-ag-top"><span class="fx-ag-ava">S</span><span class="fx-ag-c"><span class="fx-ag-n">Sourcing Strategy Agent</span><span class="fx-ag-r">筛选候选供应商、比价、评分，并给出风险提示。</span></span></span>' +
        '<span class="fx-ag-tags"><span class="fx-ag-model">Auto</span><span class="fx-ag-tag">Skill × 3</span><span class="fx-ag-tag">Ontology</span><span class="fx-ag-tag">MCP</span>' + (S.phase === 'production' ? '' : (left ? tag('mock', left + ' 处 Mock') : tag('ok', 'Mock 已清零'))) + '</span></span>' +
        '<span class="fx-ag-f"><span class="fx-ag-s"><i class="dot ' + e + '"></i>' + status + '</span><span class="fx-ag-cta" data-try="1">试用</span></span></div>' }];
    },
    detail: function () { return null; },
  });

  /* — Scenario — */
  def('scenario', 'Scenario', {
    ready: function () { return true; },
    why: '',
    items: function () {
      var e = S.generated ? envOf(false) : 'building';
      var assets = [['Ontology', 'ontology'], ['Skill', 'skill'], ['MCP', 'mcp'], ['Agent', 'agent']];
      var chips = assets.map(function (a) { return '<span class="fx-sc-a"><i class="dot ' + (S.generated ? 'done' : '') + '"></i><b>' + a[0] + '</b></span>'; }).join('');
      var stage = !S.generated ? '<span class="fx-sc-stage building"><i></i>Crafting</span>' : '<span class="fx-sc-stage ' + e + '"><i></i>' + ({ sandbox: 'Sandbox', hardening: 'Hardening', prod: 'Live' })[e] + '</span>';
      return [{ id: 't1', env: e === 'building' ? 'real' : e, html: card('fx-sc', e, 't1',
        '<span class="fx-sc-top"><span class="fx-sc-k">Business scenario</span>' + stage + '</span>' +
        '<span class="fx-sc-n">T1 Sourcing strategy</span>' +
        '<span class="fx-sc-d">v2.1 new step · 供应商筛选、比价与风险提示。</span>' +
        '<span class="fx-sc-as">' + chips + '</span>' +
        '<span class="fx-sc-f"><span>' + (S.generated ? Sandbox.envLabel() : '构建中') + '</span><span>试用后逐项补实</span></span>') }];
    },
    detail: function (id) {
      if (id !== 't1') return null;
      var P = window.FastPlanData, picks = P && P.picks;
      return '<div class="fx-title">T1 Sourcing strategy</div>' + (S.generated ? banner() : '') +
        kv([['做法', window.FastMode && window.FastMode.get() === 'steps' ? '一步步做扎实' : '先快速出一版'], ['阶段', S.generated ? Sandbox.envLabel() : '构建中'], ['Agent', S.generated ? '<a href="#" data-launch-agent="1">Sourcing Strategy Agent</a>' : '尚未生成']]) +
        (picks ? sec('已确认的决策', table(['决策', '结论'], P.decisions.map(function (d) { return [d.id + ' ' + d.title, esc(d.opts[picks[d.id] || 0].t)]; }))) : '') +
        sec('相关文档', ul(['<a href="#" data-doc="Product plan v0.1.md">Product plan v0.1</a>', '<a href="#" data-doc="Ontology plan v0.1.md">Ontology plan v0.1</a>', '<a href="#" data-doc="Agent plan v0.1.md">Agent plan v0.1</a>']));
    },
  });

  /* — Test — */
  var BT = ['新品导入 · 主控 MCU', '新品导入 · 电源 IC', '新品导入 · 6 层 PCB', '新品导入 · MLCC', '新品导入 · CNC 结构件', '异常替换 · Rongxin 火灾', '异常替换 · Haoyu 气孔', '异常替换 · Kaisheng 交期', '异常替换 · Ruifeng 证书缺失', '异常替换 · Tianyi ISO 到期'];
  var BT_FAIL = [4, 8];
  var SELF = ['PCB 候选与比价', '供应商异常找替代', '两家供应商对比'];
  def('test', 'Test', {
    ready: function () { return S.generated; },
    why: '快速出一版后，自测和回测用例会出现在这里。',
    items: function () {
      var e = envOf(false), bt = S.backtest;
      return [
        { id: 'self', env: e, html: logoCard('self', e, 'T', '#f59e0b', '自测', '3 个常见任务，用 Mock 数据跑通。', pill(e) + tag('ok', 'Passed') + '<span class="fx-chip">3 cases</span>') },
        { id: 'back', env: e, html: logoCard('back', e, 'B', '#6a54f0', '历史案例回测', '10 个历史案例，推荐结论与人工结论比对。', pill(e) + (bt ? tag(bt.pass / bt.total >= 0.8 ? 'ok' : 'bad', bt.pass + ' / ' + bt.total) : tag('mock', '未运行')) + '<span class="fx-chip">10 cases</span>') },
      ];
    },
    detail: function (id) {
      var bt = S.backtest;
      if (id === 'self') {
        return '<div class="fx-title">自测 ' + pill(envOf(false)) + '</div><p class="fx-p">用 Mock 数据运行，只证明流程跑得通。</p><div class="fx-list fx-plain">' + SELF.map(function (n) {
          return '<div class="fx-row is-static"><span class="fx-rm"><b>' + n + '</b><i>用 Mock 数据运行</i></span><span class="fx-rt">' + tag('ok', 'Passed') + '</span></div>';
        }).join('') + '</div>';
      }
      if (id === 'back') {
        return '<div class="fx-title">历史案例回测 ' + pill(envOf(false)) + (bt ? ' ' + tag(bt.pass / bt.total >= 0.8 ? 'ok' : 'bad', bt.pass + ' / ' + bt.total) : '') + '</div>' +
          '<div class="fx-list fx-plain">' + BT.map(function (n, i) {
            var st = !bt ? tag('mock', '未运行') : BT_FAIL.indexOf(i) >= 0 ? tag('bad', '不一致') : tag('ok', '一致');
            return '<div class="fx-row is-static"><span class="fx-rm"><b>' + n + '</b></span><span class="fx-rt">' + st + '</span></div>';
          }).join('') + '</div>' +
          (bt ? '<p class="fx-p">重合度 ' + Math.round(bt.pass / bt.total * 100) + '%。不一致的 2 个案例已记入待办。</p>' : '<p class="fx-p">回测在固化 Skill 规则时运行，用来参考，不作为发布门槛。</p>');
      }
      return null;
    },
  });

  /* — Sandbox: landing = package card; drill-in = assets · gates · promote/release — */
  var SB_ICON = { agent: 'ws-agent', ontology: 'ws-ontology', skill: 'ws-skill', mcp: 'ws-mcp', data: 'ws-data', test: 'ws-test', knowledge: 'ws-knowledge' };
  function pkgRows() {
    var prod = S.phase === 'production', left = Sandbox.mocksLeft(), groups = FD() ? FD().groups() : [];
    var m = function (k) { return prod ? tag('prod', 'Production') : mat(k); };
    return [
      ['agent', 'Agent', 'Sourcing Strategy Agent', prod ? tag('prod', 'Production') : left ? tag('mock', left + ' 处 Mock') : tag('ok', 'Verified')],
      ['ontology', 'Ontology', '5 个对象 · 5 条关系', m('onto')],
      ['skill', 'Skill', '3 个', m('skill')],
      ['mcp', 'MCP', 'ERP connector · Rules & templates', m('erp')],
      ['data', 'Data source', 'ERP quotation export · Supplier master', m('erp')],
      ['test', 'Test', '3 自测 · 10 回测', prod ? tag('prod', 'Production') : S.backtest ? tag('ok', S.backtest.pass + ' / ' + S.backtest.total) : tag('mock', '回测未运行')],
      ['knowledge', 'Knowledge base', groups.length + ' 个文件夹 · 随包引用', tag('real', 'Real')],
    ];
  }
  function pkgFlow() {
    var order = ['sandbox', 'hardening', 'production'], cur = order.indexOf(S.phase);
    return '<div class="fx-flow">' + [['初版', 'v0.1'], ['加固中', 'RC'], ['正式', 'v1.0']].map(function (x, i) {
      return (i ? '<span class="fx-arr"></span>' : '') + '<div class="fx-step ' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"><b>' + x[0] + '</b><i>' + x[1] + '</i></div>';
    }).join('') + '</div>';
  }
  function pkgLanding() {
    var hard = S.phase === 'hardening', prod = S.phase === 'production', left = Sandbox.mocksLeft();
    var ver = prod ? '正式版 v1.0' : '初版 ' + (hard ? 'RC' : 'v0.1');
    var meta = '7 类资产' + (prod ? '' : left ? ' · ' + left + ' 处 Mock' : ' · Mock 已清零');
    var gateN = Sandbox.gates().filter(function (g) { return g.ok; }).length;
    if (hard || prod) meta += ' · 门槛 ' + gateN + ' / 3';
    return '<button type="button" class="fx-pkg fx-pkg-card" data-open="pkg">' +
      '<div class="fx-pkg-h"><span class="fx-pkg-ava"><svg width="22" height="22" aria-hidden="true"><use href="#fx-box"/></svg></span>' +
      '<span class="fx-pkg-t"><b>Sourcing Strategy Agent</b><i>T1 Sourcing strategy · ' + ver + '</i></span>' + env() + CHEV + '</div>' +
      pkgFlow() +
      '<div class="fx-pkg-foot"><span>' + meta + '</span><span class="fx-pkg-go">查看包内容</span></div>' +
      '</button>' +
      '<p class="fx-hint">点进打包卡片，查看资产清单、发布门槛，并打包转生产。</p>';
  }
  function pkgInterior() {
    var gs = Sandbox.gates(), hard = S.phase === 'hardening', prod = S.phase === 'production';
    var gotoF = prod ? 'formal' : 'sandbox';
    var html = '<div class="fx-pkg fx-pkg-sum"><div class="fx-pkg-h"><span class="fx-pkg-ava"><svg width="22" height="22" aria-hidden="true"><use href="#fx-box"/></svg></span>' +
      '<span class="fx-pkg-t"><b>Sourcing Strategy Agent</b><i>T1 Sourcing strategy · ' + (prod ? '正式版 v1.0' : '初版 ' + (hard ? 'RC' : 'v0.1')) + '</i></span>' + env() + '</div>' +
      pkgFlow() + '</div>';
    html += sec('包内容 · 7 类', '<div class="fx-list">' + pkgRows().map(function (r) {
      return '<button type="button" class="fx-row" data-goto="' + r[0] + ':' + (r[0] === 'knowledge' ? 'all' : gotoF) + '"><svg class="ws-ico fx-ri" width="16" height="16" aria-hidden="true"><use href="#' + SB_ICON[r[0]] + '"/></svg><span class="fx-rm"><b>' + r[1] + '</b><i>' + esc(r[2]) + '</i></span><span class="fx-rt">' + r[3] + '</span>' + CHEV + '</button>';
    }).join('') + '</div>');
    html += sec('发布门槛 · ' + gs.filter(function (g) { return g.ok; }).length + ' / 3', '<div class="fx-gates">' + gs.map(function (g, i) {
      var act = '';
      if (g.id === 'access' && !g.ok) act = '<button type="button" class="fx-btn" data-act="access"' + (hard ? '' : ' disabled') + '>确认已配置</button>';
      if (g.id === 'sign' && !g.ok) act = '<button type="button" class="fx-btn" data-act="sign"' + (hard ? '' : ' disabled') + '>负责人签字</button>';
      return '<div class="fx-gate' + (g.ok ? ' ok' : '') + '"><span class="fx-gi">' + (g.ok ? '✓' : (i + 1)) + '</span><span class="fx-rm"><b>' + g.t + '</b><i>' + g.d + '</i></span><span class="fx-gv">' + esc(g.v) + '</span>' + act + '</div>';
    }).join('') + '</div>');
    if (prod) {
      html += '<p class="fx-p" style="margin-top:12px">v1.0 已发布。发布说明：<a href="#" data-doc="Release notes v1.0.md">Release notes v1.0</a></p>' +
        sec('版本记录', '<div class="fx-list fx-plain"><div class="fx-row is-static"><span class="fx-rm"><b>v1.0</b><i>正式环境 · 对业务用户开放</i></span><span class="fx-rt">' + tag('prod', 'Production') + '</span></div><div class="fx-row is-static"><span class="fx-rm"><b>v0.1</b><i>初版 · 已归档，保留作对照</i></span><span class="fx-rt">' + tag('real', 'Archived') + '</span></div></div>') +
        '<p class="fx-hint">之后的迭代直接在正式环境里进行。</p>';
    } else {
      html += '<div class="fx-actions">' + (S.phase === 'sandbox'
        ? ''
        : '<button type="button" class="fx-btn is-primary" data-act="release"' + (Sandbox.allGates() ? '' : ' disabled') + '>发布 v1.0 到正式环境</button>') + '</div>' +
        '<p class="fx-hint">' + (S.phase === 'sandbox' ? '试用后哪里不够，就从那一项 Mock 开始补实；补完后再做发布检查。' : Sandbox.allGates() ? '三道门槛都通过了，可以发布。' : '三道门槛全部通过后才能发布。') + '</p>';
    }
    html += sec('映射与发布文档', ul(['<a href="#" data-doc="Mapping list v0.1.md">Mapping list v0.1</a>', '<a href="#" data-doc="Release checklist v0.1.md">Release checklist v0.1</a>', '<a href="#" data-doc="Mock register v0.1.md">Mock register v0.1</a>']));
    return html;
  }
  def('sandbox', 'Sandbox', {
    ready: function () { return true; },
    crumb: function () { return 'Sourcing Strategy Agent'; },
    custom: function () {
      if (!S.generated) return empty('快速出一版并生成 Agent 后，所有内容会集中在这里。');
      return pkgLanding();
    },
    detail: function (id) {
      if (id !== 'pkg' || !S.generated) return null;
      return pkgInterior();
    },
  });

  /* ───────── page builder (one tab per module; drill-down inside) ───────── */
  var ICON = { ontology: 'ws-ontology', agent: 'ws-agent', skill: 'ws-skill', mcp: 'ws-mcp', data: 'ws-data', knowledge: 'ws-knowledge', scenario: 'ws-scenario', test: 'ws-test', sandbox: 'fx-box' };
  var NAMES = { ontology: 'Ontology', agent: 'Agent', skill: 'Skill', mcp: 'MCP', data: 'Data source', knowledge: 'Knowledge base', scenario: 'Scenario', test: 'Test', sandbox: 'Sandbox' };
  var hosts = {};

  function draftCount(m) { return m.ready() && m.items ? m.items().filter(function (i) { return grpOf(i.env) === 'sandbox'; }).length : 0; }
  function listView(m) {
    if (m.custom) return m.custom();
    var items = m.ready() ? m.items() : [];
    if (!items.length) return empty(m.why || '');
    var n = { all: items.length, formal: 0, sandbox: 0 };
    items.forEach(function (i) { n[grpOf(i.env)]++; });
    var shown = items.filter(function (i) { return m.filter === 'all' || grpOf(i.env) === m.filter; });
    var bar = !(n.formal && n.sandbox) ? '' : '<div class="fx-bar"><div class="fx-seg">' + [['all', '全部'], ['formal', '真实'], ['sandbox', 'Mock']].map(function (f) {
      return '<button type="button" class="' + (m.filter === f[0] ? 'is-on' : '') + '" data-filter="' + f[0] + '">' + f[1] + ' <em>' + n[f[0]] + '</em></button>';
    }).join('') + '</div></div>';
    var strip = '';
    return bar + strip + (shown.length ? '<div class="fx-grid">' + shown.map(function (i) { return i.html; }).join('') + '</div>' : empty('这个分类下还没有内容。', '暂无'));
  }
  function render(key) {
    var m = MODS[key], host = hosts[key]; if (!host) return;
    var body, back = '', top = m.stack[m.stack.length - 1];
    if (top && m.ready()) {
      body = m.detail(top);
      if (body == null) { m.stack = []; body = listView(m); }
      else {
        var prev = m.stack.length > 1 ? (m.crumb ? m.crumb(m.stack[m.stack.length - 2]) : m.stack[m.stack.length - 2]) : m.title;
        back = '<button type="button" class="fx-back" data-back="1">‹ ' + esc(prev) + '</button>';
      }
    } else body = listView(m);
    host.innerHTML = '<div class="fx-head"><div class="fx-head-l">' + (back || '<span class="fx-name">' + esc(m.title) + '</span>') + '</div>' + (key === 'sandbox' && S.generated ? env() : '') + '</div><div class="fx-body">' + body + '</div>';
    var b = host.querySelector('.fx-body'); if (b) b.scrollTop = host.__st || 0;
  }
  function build(key) {
    var host = document.createElement('div');
    host.className = 'fx';
    hosts[key] = host;
    host.addEventListener('click', function (e) {
      var m = MODS[key];
      var a = e.target.closest('[data-act]');
      if (a && !a.disabled) { if (window.FastHandoff) window.FastHandoff.act(a.getAttribute('data-act')); return; }
      if (e.target.closest('[data-try]')) { if (window.FastAgentPanel) window.FastAgentPanel.open('try'); return; }
      var f = e.target.closest('[data-filter]');
      if (f) { m.filter = f.getAttribute('data-filter'); render(key); return; }
      var g = e.target.closest('[data-goto]');
      if (g) { var p = g.getAttribute('data-goto').split(':'); open(p[0], p[1] ? { filter: p[1] } : null); return; }
      if (e.target.closest('[data-back]')) { m.stack.pop(); render(key); var b0 = host.querySelector('.fx-body'); if (b0) b0.scrollTop = 0; return; }
      if (e.target.closest('[data-launch-agent]')) { e.preventDefault(); open('agent'); return; }
      var o = e.target.closest('[data-open]');
      if (o) { m.stack.push(o.getAttribute('data-open')); render(key); var b = host.querySelector('.fx-body'); if (b) b.scrollTop = 0; }
    });
    render(key);
    return host;
  }
  var registered = {};
  function open(key, o) {
    if (key === 'release') key = 'sandbox';                 // legacy alias
    if (!MODS[key] || !FD()) return;
    if (!registered[key]) {
      var ico = '<svg class="ws-ico" width="14" height="14" aria-hidden="true"><use href="#' + ICON[key] + '"/></svg>';
      FD().register({ name: NAMES[key], kind: 'agent', build: function () { return build(key); }, iconHtml: ico });
      registered[key] = true;
    }
    MODS[key].stack = [];
    if (key === 'ontology' && window.FastOntoGraph) window.FastOntoGraph.reset();
    MODS[key].filter = (o && o.filter) || 'all';
    FD().open(NAMES[key]);
    render(key);
  }

  function refreshAll() { Object.keys(hosts).forEach(render); updateLauncher(); }
  Sandbox.on(refreshAll);
  document.addEventListener('fastmodechange', refreshAll);
  document.addEventListener('fastmaterials', refreshAll);

  /* ───────── launcher: card modules show how many drafts they hold; a Sandbox entry sits at the end ───────── */
  var launch = document.querySelector('.rp-launch');
  function setTag(b, txt, cls) {
    var t = b.querySelector('.rp-tag');
    if (!txt) { if (t) t.remove(); return; }
    if (!t) { t = document.createElement('em'); b.appendChild(t); }
    t.textContent = txt; t.className = 'rp-tag ' + (cls || '');
  }
  function updateLauncher() {
    if (!launch) return;
    launch.querySelectorAll('.rp-launch-item').forEach(function (b) {
      var k = b.getAttribute('data-launch'), m = MODS[k];
      if (k === 'sandbox') {
        setTag(b, !S.generated ? '' : S.phase === 'production' ? 'v1.0' : S.phase === 'hardening' ? '加固 · ' + Sandbox.gates().filter(function (g) { return g.ok; }).length + '/3' : '轻量 v0.1', S.phase);
        return;
      }
      var n = m ? draftCount(m) : 0;
      setTag(b, '', S.phase);   // no draft / 初版 counters — the work is simply in progress
    });
  }
  var sp = document.createElement('div');
  sp.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  sp.setAttribute('aria-hidden', 'true');
  sp.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><symbol id="fx-box" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 19.8 7.6v8.8L12 20.8 4.2 16.4V7.6Z"/><path d="m4.4 7.7 7.6 4.3 7.6-4.3"/><path d="M12 12v8.6"/></symbol></svg>';
  document.body.appendChild(sp);
  if (launch) {
    /* no Sandbox entry any more — the first version is simply tried in the Agent panel */
    launch.addEventListener('click', function (e) {
      var b = e.target.closest('.rp-launch-item'); if (!b) return;
      open(b.getAttribute('data-launch'));
    });
    updateLauncher();
  }

  window.FastModules = { open: open, render: refreshAll };
})();
