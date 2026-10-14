/**
 * Fast POC page ONLY — sandbox draft → Steps hardening → production (not loaded by superagent.html).
 *   FastHandoff.start()      pack the sandbox draft into a Handoff package and switch to Steps (blueprint steps 1–5 "Imported",
 *                            ontology / skills "Rebuild"); shows the hardening plan in chat
 *   FastHandoff.harden(id)   replace one Mock with the real thing: 'erp' | 'onto' | 'skill'  (also callable straight from the Mocks tab)
 *   FastHandoff.release()    all four gates passed → production v1.0
 *   FastHandoff.act(name)    button actions of the Release page: access | sign | release | promote
 * Phases (FastSandbox.state.phase): sandbox → hardening → production. Maturity of each part: Mock → Verified → Production.
 */
(function () {
  'use strict';
  var SB = function () { return window.FastSandbox; };
  var S = function () { return window.FastSandbox.state; };
  var BP = function () { return window.FastBlueprint; };
  var FF = function () { return window.FastFiles; };
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function files(list, gap) {
    return async function () {
      for (var i = 0; i < list.length; i++) { await sleep(gap || 520); if (FF()) FF().addDeliverable(list[i]); }
      await sleep(240);
    };
  }
  async function runPlan(plan) {
    while (window.FastChat.isBusy()) await sleep(150);
    return window.FastChat.run(plan);
  }
  function seg(c, node) { var s = el('div', 'ao-seg stream-enter'); s.appendChild(node); c.host.appendChild(s); c.scroll(); }

  /* blueprint follows the phase + what has been verified */
  function syncBP() {
    var B = BP(), st = S(), m = st.mocks; if (!B) return;
    if (st.phase === 'production') {
      B.set('req', 'done', 'Confirmed'); B.set('know', 'done', 'Confirmed'); B.set('doc', 'done', 'Confirmed');
      B.set('onto', 'done', 'Production'); B.set('skill', 'done', 'Production'); B.set('agent', 'done', 'Production v1.0');
      return;
    }
    var unv = st.phase === 'sandbox' ? 'Mock' : 'Rebuild';
    if (m.onto === 'verified') B.set('onto', 'done', 'Verified'); else B.set('onto', 'mock', unv);
    if (m.erp === 'verified' && m.skill === 'verified') B.set('skill', 'done', 'Verified');
    else if (m.erp === 'verified' || m.skill === 'verified') B.set('skill', 'doing', 'Rebuilding');
    else B.set('skill', 'mock', unv);
    if (st.phase === 'hardening') B.set('agent', 'doing', SB().mocksLeft() === 0 ? 'Release candidate' : 'Sandbox v0.1');
  }

  /* ───────── hardening plan card (in chat) ───────── */
  var TASKS = [
    { id: 'erp', n: '接入 ERP 只读接口', d: 'Mock 3 · 回答才有真实价格和交期' },
    { id: 'onto', n: '校对本体', d: 'Mock 1 · 补「例外」属性，结构化合同条款' },
    { id: 'skill', n: '固化 Skill 规则', d: 'Mock 2 · 规则可配置、带版本' },
  ];
  function planCard() {
    var box = el('div', 'ff-card fx-plan');
    function paint() {
      var m = S().mocks, gs = SB().gates(), prod = S().phase === 'production';
      box.innerHTML =
        '<div class="ff-head"><span class="ff-t">加固计划</span><span class="ff-h">' + (prod ? '已发布 v1.0' : '已完成 ' + (3 - SB().mocksLeft()) + ' / 3 项 Mock 替换') + '</span></div>' +
        '<div class="fx-tasks">' + TASKS.map(function (t, i) {
          var ok = m[t.id] === 'verified';
          return '<div class="fx-task' + (ok ? ' ok' : '') + '"><span class="fx-gi">' + (ok ? '✓' : (i + 1)) + '</span><span class="fx-rm"><b>' + t.n + '</b><i>' + t.d + '</i></span>' +
            (ok ? '<span class="fx-tag ok">Verified</span>' : '<button type="button" class="fm-btn" data-task="' + t.id + '">开始</button>') + '</div>';
        }).join('') +
        '<div class="fx-task' + (prod ? ' ok' : '') + '"><span class="fx-gi">' + (prod ? '✓' : 4) + '</span><span class="fx-rm"><b>发布检查</b><i>权限就绪 · 负责人签字 · 发布 v1.0（' + gs.filter(function (g) { return g.ok; }).length + ' / 3 门槛）</i></span>' +
        (prod ? '<span class="fx-tag prod">Production</span>' : '<button type="button" class="fm-btn is-primary" data-task="release">打开 Sandbox</button>') + '</div></div>';
    }
    paint();
    SB().on(paint);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-task]'); if (!b) return;
      var id = b.getAttribute('data-task');
      if (id === 'release') window.FastModules.open('sandbox'); else api.harden(id);
    });
    return box;
  }

  /* ───────── ① start: pack & switch to Steps ───────── */
  /* every 「转入按流程打造」 button lands here: ask first (dialog), then pack. QA scripts (window.__qa) skip the dialog. */
  function start() {
    if (S().phase !== 'sandbox' || !S().generated) return Promise.resolve();
    var D = window.FastSwitchDialog;
    if (!D || window.__qa) return doStart();
    return D.confirm().then(function (ok) { return ok ? doStart() : undefined; });
  }
  function doStart() {
    if (S().phase !== 'sandbox' || !S().generated) return Promise.resolve();
    var P = window.FastPlanData;
    // fill the manifest and the trial log with what actually happened
    if (P && P.picks) window.FastDocs.append('Mapping list v0.1.md', '| 决策 | 结论 |\n|---|---|\n' + P.decisions.map(function (d) { return '| ' + d.id + ' ' + d.title + ' | ' + d.opts[P.picks[d.id] || 0].t + ' |'; }).join('\n') + '\n');
    var tr = S().trial;
    window.FastDocs.append('Trial log v0.1.md', tr.length ? tr.map(function (t, i) { return '| ' + (i + 1) + ' | ' + t.q + ' | ' + (t.ok ? '已回答（Mock 数据）' : '缺口') + ' | ' + (t.ok ? '换成真实数据后复测' : '补充对应能力') + ' |'; }).join('\n') + '\n' : '| – | 轻量版阶段尚未试用 | – | – |\n');
    return runPlan({
      process: async function (a) {
        await a.sleep(400);
        await a.W('把轻量版里的东西整理成交接包：哪些保留，哪些要重建，哪些需要复核。');
        if (FF()) FF().showTab(true);
        await a.sleep(250);
        await a.V({ id: 'h1', icon: 'edit', label: '已生成交接包 · Handoff v0.1', details: ['映射清单：沿用 / 校对 / 改 Mock / 再创作', '试用日志：' + (S().trial.length || 0) + ' 条', '发布检查清单：三道门槛'], during: files(['Handoff v0.1/Mapping list v0.1.md', 'Handoff v0.1/Trial log v0.1.md', 'Handoff v0.1/Release checklist v0.1.md'], 560) });
        await a.W('交接包好了，现在切到按流程打造：前 5 步按已导入处理，本体和 Skill 要重建。');
        S().phase = 'hardening';
        if (window.FastMode) window.FastMode.set('steps');
        var B = BP();
        B && B.set('req', 'imported', 'Imported'); B && B.set('know', 'imported', 'Imported'); B && B.set('doc', 'imported', 'Imported');
        syncBP();
        SB().emit();
        await a.sleep(300);
        if (FF()) FF().showTab(false);
      },
      segments: [{ md:
        '已转入 **按流程打造**。轻量版 v0.1 整体整理成了 **交接包**，在 **Files → Deliverables → 正式目录 → Appendix**，同时左边多出了完整的 **正式目录**，原来的文档留在「轻量底稿」里：[Mapping list](Mapping list v0.1.md) · [Trial log](Trial log v0.1.md) · [Release checklist](Release checklist v0.1.md)。\n\n' +
        '| 内容 | 状态 | 说明 |\n|---|---|---|\n' +
        '| 需求与 5 个决策 · 9 份业务资料 | **沿用** | 直接作为基线 |\n' +
        '| 三份设计方案 · ERP 导出 | **需校对** | 含 POC 阶段的临时数据，在第 3–5 步确认 |\n' +
        '| 本体 · Skill 规则 · ERP 连接 · Agent | **Mock · 需要改** | 3 处 Mock，逐项换成真实实现 |\n' +
        '| 成功标准 · 资源清单 | **需再创作** | POC 里还没有，在按流程打造里补 |\n\n' +
        '左侧蓝图里，第 1–5 步现在标为 **Imported**（已导入，待确认），本体和 Skill 标为 **Rebuild**。按这个顺序加固，每完成一项我会更新状态，三道发布门槛都过了再发布 v1.0：', gap: 340 }],
      after: async function (c) { seg(c, planCard()); await c.sleep(300); },
    });
  }

  /* ───────── ② harden one Mock ───────── */
  var HARDEN = {
    erp: {
      w: '先接 ERP：有了真实报价和交期，回答才算数。',
      v: { id: 'e1', icon: 'mcp', label: '已连接 ERP 只读接口', details: ['使用只读账号，读取供应商、料号、报价', '字段与字典一致，抽样核对 20 条', '样例数据已停用'] },
      reg: 'ERP 连接', md: '**ERP 连接**已换成只读接口，Mock 3 清零。报价和交期现在是 ERP 实时值，回答里这部分不再标 MOCK。',
    },
    onto: {
      w: '校对本体：补上例外属性，把合同条款结构化。',
      v: { id: 'o1', icon: 'ontology', label: '已校对本体 · 5 个对象', details: ['Supplier 新增 exception 属性与例外编号', '合同年降、罚则结构化，可参与比价', '与真实数据抽样比对一致'] },
      reg: '本体', md: '**本体**已按真实数据校对，Mock 1 清零。「例外」供应商和合同年降现在都能被 Skill 正确使用。',
    },
    skill: {
      w: '固化 Skill 规则，并用 10 个历史案例回测做个参考。',
      v: { id: 's1', icon: 'skill', label: '已固化 3 个 Skill 规则', details: ['阈值与权重改为可配置，带版本', '例外供应商处理按你确认的决策 D2'] },
      reg: 'Skill 规则', md: '**Skill 规则**已固化，并用 10 个历史案例回测做了参考：**8 个与人工结论一致（80%）**。2 个不一致的案例（CNC 结构件新品导入、Ruifeng 证书缺失）已记入待办。',
    },
  };
  var harding = {};
  function harden(id) {
    var h = HARDEN[id]; if (!h || S().mocks[id] === 'verified' || harding[id]) return Promise.resolve();
    harding[id] = true;
    return runPlan({
      process: async function (a) {
        await a.sleep(400);
        await a.W(h.w);
        await a.sleep(250);
        await a.V(h.v);
        if (id === 'skill') {
          await a.V({ id: 's2', icon: 'command', label: '已完成回测 · 8 / 10 一致', details: ['10 个历史案例：5 个新品导入 · 5 个异常替换', '8 个与人工结论一致，重合度 80%', '2 个不一致，已记入待办'] });
          S().backtest = { pass: 8, total: 10 };
        }
        S().mocks[id] = 'verified';
        window.FastDocs.append('Mock register v0.1.md', '\n✅ **' + h.reg + '**：已在按流程打造中换成真实实现。\n');
        syncBP();
        SB().emit();
        await a.sleep(300);
      },
      segments: [{ md: h.md, gap: 340 }],
      after: async function (c) {
        var left = SB().gates().filter(function (g) { return !g.ok; });
        var tail = SB().mocksLeft() ? '还剩 **' + SB().mocksLeft() + ' 项** Mock。' : 'Mock 已全部清零。';
        var gate = left.length ? '发布门槛还差：' + left.map(function (g) { return g.t; }).join('、') + '。' : '三道门槛都通过了，可以发布 v1.0。';
        var part = el('div'); c.host.appendChild(part);
        await c.run(part, [{ md: tail + gate, gap: 300 }]);
        harding[id] = false;
      },
    }).then(function () { harding[id] = false; checkAll(); });
  }

  /* ───────── ③ release ───────── */
  async function release() {
    if (S().phase !== 'hardening' || !SB().allGates()) return;
    return runPlan({
      process: async function (a) {
        await a.sleep(400);
        await a.W('三道门槛都过了，发布 v1.0。');
        if (FF()) FF().showTab(true);
        await a.V({ id: 'r1', icon: 'edit', label: '已生成发布说明 · v1.0', details: ['对比 v0.1 的变更', '门槛通过记录'], during: files(['Release v1.0/Release notes v1.0.md'], 520) });
        await a.V({ id: 'r2', icon: 'command', label: '已切换到正式环境', details: ['Agent 由轻量版 v0.1 升级为 v1.0', '回答中不再出现 MOCK 标记'] });
        S().phase = 'production';
        syncBP();
        SB().emit();
        await a.sleep(300);
        if (FF()) FF().showTab(false);
      },
      segments: [{ md:
        '**Sourcing Strategy Agent v1.0** 已发布到正式环境。\n\n' +
        '| 阶段 | 版本 | 状态 |\n|---|---|---|\n' +
        '| 轻量版 | v0.1 | 已归档，保留作对照 |\n' +
        '| 加固 | RC | 3 项 Mock 全部替换 |\n' +
        '| 正式 | **v1.0** | 对业务用户开放 |\n\n' +
        '发布说明：[Release notes v1.0](Release notes v1.0.md)。之后的迭代直接在正式环境里进行。', gap: 340 }],
    });
  }

  /* ───────── Release page buttons ───────── */
  var notified = false;
  function checkAll() {
    if (!notified && S().phase === 'hardening' && SB().allGates()) {
      notified = true;
      window.FastChat.postAgent([{ md: '三道发布门槛都通过了。去右侧 **Sandbox** 点「发布 v1.0 到正式环境」就可以上线。', gap: 300 }]);
    }
  }
  function act(name) {
    if (name === 'promote') return start();
    if (name === 'access') { S().access = true; SB().emit(); checkAll(); return; }
    if (name === 'sign') { S().signoff = true; SB().emit(); checkAll(); return; }
    if (name === 'release') return release();
  }

  var api = { start: start, harden: harden, release: release, act: act };
  window.FastHandoff = api;
})();
