/**
 * Fast POC page ONLY — the draft Agent, usable in the right panel (not loaded by superagent.html).
 *   FastAgentPanel.open('try' | 'spec' | 'mocks')   → opens the right panel on the Agent tab (registered on first use)
 *   FastAgentPanel.prompts                            → sample questions (also used by the "Ready to try" card in chat)
 * Panes: Try (scripted, streamed answers · MOCK marked) · Spec (Agent spec v0.1) · Mocks (each can be sent back to the builder chat).
 * The panel is a synthetic doc of kind 'agent' in FastDocs, so it lives in the same tab strip as documents.
 */
(function () {
  'use strict';
  var NAME = 'Sourcing Agent v0.1';
  var registered = false, wrap, tabs = {}, panes = {}, thread, input, sendBtn, busy = false, mocksEl;
  var repairNotes = {};

  var PROMPTS = [
    { q: '新品要导入 PCB 板，帮我筛出候选供应商并比价', k: 'pcb' },
    { q: 'Haoyu 的压铸件出了气孔问题，要不要找替代？', k: 'haoyu' },
    { q: '对比 Jinli 和 Haoyu 的交期、评分和风险', k: 'cmp' },
  ];

  var ANSWERS = {
    pcb: {
      tools: ['screen-suppliers · 5 家电子类候选 → 2 家可报 PCB-6L-HDI-A', 'compare-quotes · 读取 2 条 ERP 报价', 'score-suppliers · 按 45/30/15/10 打分'],
      md:
'结论：**优先 Rongxin Circuit，Xinyue Circuit 作为候补**。\n\n' +
'| 供应商 | 单价 | 交期 | 硬性条件 | 得分 | 风险 |\n|---|---|---|---|---|---|\n' +
'| Rongxin Circuit | ¥6.95 | 21 天 | 全部通过 | 78 | 7 月工厂火灾，已有双源安排 |\n' +
'| Xinyue Circuit | ¥6.55 | 28 天 | **未入合格清单** | — | 新供应商，需先走准入审核 |\n\n' +
'依据：[Qualified supplier list](Qualified supplier list 2026.xlsx) · [ERP quotation export](ERP quotation export 2026-Q3.xlsx)\n\n' +
'**需要你确认**：Xinyue 便宜 ¥0.40，但没有 ISO 与产能证明，是否先发起准入审核？\n\n' +
'**MOCK** · 报价与交期来自 ERP 导出样例，评分用固定权重。',
    },
    haoyu: {
      tools: ['find-alternatives · 同品类（镁合金压铸）共 2 家', 'compare-quotes · HY-ARM-AZ91 两家报价', 'screen-suppliers · 硬性条件核查'],
      md:
'结论：**暂不整体切换，建议对 Shengda 做小批量双源验证**。\n\n' +
'| 供应商 | 单价 | 交期 | 状态 | 说明 |\n|---|---|---|---|---|\n' +
'| Haoyu Die-casting | ¥23.10 | 28 天 | 合格 · 评分 77 | 9 月出现气孔问题 |\n' +
'| Shengda Die-casting | ¥21.90 | 35 天 | 未入清单 | 交期 5 周，超过 4 周硬性条件 |\n\n' +
'- Haoyu 只出现 1 起质量异常，且尚未触发替换（异常记录 2026）。\n' +
'- Shengda 价格低 5%，但交期不满足硬性条件，只能按「例外」处理。\n\n' +
'**建议动作**：要求 Haoyu 提交 8D 整改报告；同时让 Shengda 打样 500 件，两周后再评估。\n\n' +
'**MOCK** · 异常与报价来自样例数据。',
    },
    cmp: {
      tools: ['compare-quotes · 读取两家有效报价', 'score-suppliers · 取分项得分'],
      md:
'结论：**Jinli 综合更稳，Haoyu 价格更低但质量有波动**。\n\n' +
'| 维度 | Jinli Precision | Haoyu Die-casting |\n|---|---|---|\n' +
'| 品类 | CNC 铝合金结构件 | 镁合金压铸件 |\n' +
'| 评分 / 等级 | 89 · A | 77 · B |\n' +
'| 标准交期 | 4 周 | 4 周 |\n' +
'| 月产能 | 18 万件 | 22 万件 |\n' +
'| 近期异常 | 无；框架协议续约谈判中 | 9 月气孔问题 |\n\n' +
'两家的料号不同，价格不能直接对比，这里只比供应商层面的指标。\n\n' +
'**MOCK** · 评分来自合格供应商清单，未做真实加权。',
    },
    other: {
      tools: ['screen-suppliers · 未匹配到明确品类'],
      md: '这个问题第一版还回答不了：目前只覆盖 **筛选候选 · 比价 · 评分 · 找替代** 四类，数据是样例。\n\n可以试试上面的示例问题。这次没答上来的地方，我会记进 **Mocks** 里，作为下一版要补的内容。',
    },
  };

  var MOCKS = [
    { id: 'onto', hid: 'onto', n: 'Ontology 本体', now: '由 ERP 字段字典生成的对象与关系', next: '按真实数据校对，补「例外」属性与合同条款', node: 'onto', msg: '好，开始回填 **本体**：先校对 Supplier 的「例外」状态，再把合同年降条款结构化。我会先列出需要你确认的字段。' },
    { id: 'skill', hid: 'skill', n: 'Skill 规则', now: '固定权重和阈值的规则版', next: '可配置规则、带版本，用 10 个历史案例回测', node: 'skill', msg: '好，开始回填 **Skill 规则**：把权重和阈值抽成配置，并挑 10 个历史案例做回测。' },
    { id: 'erp', hid: 'erp', n: 'ERP MCP', now: '14 条样例报价的静态数据', next: '只读连接 ERP 实时接口', node: 'skill', msg: '好，开始回填 **ERP 连接**：我需要接口地址和只读账号，先确认字段映射是否与字典一致。' },
  ];

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ICO = '<svg class="fd-tab-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>';

  function stream(host, md) {
    return window.AgentBody.run({ host: host, segments: [{ md: md, gap: 200 }], speed: 0.5, sleep: sleep, scroll: toBottom });
  }
  function toBottom() { if (thread) thread.scrollTop = thread.scrollHeight; }

  function addUser(text) {
    var m = el('div', 'fa-msg fa-user'); m.textContent = text; thread.appendChild(m); toBottom();
  }
  function diagnose(message) {
    var composer = document.getElementById('composer-input');
    if (!composer) return;
    var context = [], rounds = 0;
    for (var i = 0; i < thread.children.length; i++) {
      var turn = thread.children[i];
      if (turn.classList.contains('fa-user')) {
        context.push('用户：' + turn.textContent);
        rounds += 1;
      }
      else if (turn.diagnosisContext) context.push(turn.diagnosisContext);
      if (turn === message) break;
    }
    var draft = '请诊断以下 Sourcing Strategy Agent v0.1 会话，分析回答、工具调用和 Mock 的问题，并给出改进建议。\n\n' + context.join('\n\n');
    var label = '诊断 · 会话日志 · ' + rounds + ' 轮对话';
    if (window.FastUpload && window.FastUpload.addContext) window.FastUpload.addContext(label, draft);
    else composer.value = (composer.value.trim() ? composer.value + '\n\n' : '') + draft;
    composer.dispatchEvent(new Event('input', { bubbles: true }));
    composer.focus();
    composer.setSelectionRange(composer.value.length, composer.value.length);
  }
  async function ask(text, key) {
    if (busy) return;
    busy = true; sendBtn.disabled = true;
    var empty = thread.querySelector('.fa-empty'); if (empty) empty.remove();
    addUser(text);
    if (window.FastSandbox) window.FastSandbox.state.trial.push({ q: text, ok: key !== 'other' });
    var original = ANSWERS[key] || ANSWERS.other;
    var a = { tools: original.tools, md: original.md + (repairNotes[key] || '') };
    if (repairNotes[key] && key === 'pcb') {
      a.md = a.md.replace('优先 Rongxin Circuit，Xinyue Circuit 作为候补', 'Rongxin Circuit 可进入证据核验；Xinyue Circuit 仅进入准入待审核清单')
        .replace('全部通过 | 78', '清单已准入，风险证据待核验 | 78（样例）');
    }
    if (repairNotes[key] && key === 'haoyu') a.md = a.md.replace('要求 Haoyu 提交 8D 整改报告；同时让 Shengda 打样 500 件，两周后再评估。', '要求 Haoyu 提交 8D 整改报告；Shengda 先完成准入与交期例外审批，通过后再制定打样计划。');
    var m = el('div', 'fa-msg fa-agent');
    var tl = el('div', 'fa-tools');
    var body = el('div', 'ao-answer answer-body chat-prose fa-body');
    m.appendChild(tl); m.appendChild(body); thread.appendChild(m); toBottom();
    await sleep(350);
    for (var i = 0; i < a.tools.length; i++) {
      var r = el('div', 'fa-tool is-run', '<span class="fa-dot"></span><span class="fa-tl">' + esc(a.tools[i].split(' · ')[0]) + '</span><span class="fa-ts">' + esc(a.tools[i].split(' · ').slice(1).join(' · ')) + '</span><span class="fa-mk">MOCK</span>');
      tl.appendChild(r); toBottom();
      await sleep(520);
      r.classList.remove('is-run');
    }
    await sleep(200);
    await stream(body, a.md);
    m.diagnosisContext = '工具执行：\n' + a.tools.map(function (tool) { return '- ' + tool + ' [MOCK]'; }).join('\n') + '\n\nAgent：\n' + a.md;
    var actions = el('div', 'fa-actions');
    var diagnosis = el('button', 'fa-diagnose');
    diagnosis.type = 'button';
    diagnosis.title = '诊断';
    diagnosis.setAttribute('aria-label', '诊断此会话');
    diagnosis.innerHTML = '<img src="assets/diagnosis.svg" width="16" height="16" alt="">';
    diagnosis.addEventListener('click', function () { diagnose(m); });
    actions.appendChild(diagnosis); m.appendChild(actions); toBottom();
    busy = false; sendBtn.disabled = !input.value.trim();
  }

  function mkChat() {
    var box = el('div', 'fa-chat');
    thread = el('div', 'fa-thread');
    thread.appendChild(el('div', 'fa-empty',
      '<div class="fa-empty-mark" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="5" y="8.5" width="18" height="14" rx="5" stroke="currentColor" stroke-width="1.5"/><path d="M14 8.5V5.5M11 14v2M17 14v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="14" cy="4.5" r="1.2" fill="currentColor"/></svg></div>' +
      '<div class="fa-empty-t">试试问它一个真实问题</div><div class="fa-empty-s">这一版用样例数据和规则桩回答，标注 <span class="fa-mk">MOCK</span> 的部分之后会逐项替换。</div>' +
      '<div class="fa-prompts">' + PROMPTS.map(function (p) { return '<button type="button" class="fa-prompt" data-k="' + p.k + '">' + esc(p.q) + '</button>'; }).join('') + '</div>'));
    var bar = el('div', 'fa-input');
    input = el('input'); input.type = 'text'; input.placeholder = '向 Sourcing Agent 提问…';
    sendBtn = el('button', 'fa-send'); sendBtn.type = 'button'; sendBtn.disabled = true; sendBtn.setAttribute('aria-label', 'Send');
    sendBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    bar.appendChild(input); bar.appendChild(sendBtn);
    box.appendChild(thread); box.appendChild(bar);
    thread.addEventListener('click', function (e) {
      var b = e.target.closest('.fa-prompt'); if (!b) return;
      ask(b.textContent, b.getAttribute('data-k'));
    });
    input.addEventListener('input', function () { sendBtn.disabled = busy || !input.value.trim(); });
    function send() {
      var v = input.value.trim(); if (!v || busy) return;
      input.value = '';
      var hit = PROMPTS.filter(function (p) { return /pcb/i.test(v) ? p.k === 'pcb' : /haoyu|气孔|压铸/i.test(v) ? p.k === 'haoyu' : /jinli|对比/i.test(v) ? p.k === 'cmp' : false; })[0];
      ask(v, hit ? hit.k : 'other');
    }
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); send(); } });
    return box;
  }

  function mkSpec() {
    var host = el('div', 'fa-spec fd-doc');
    var d = window.FastDocs && window.FastDocs.find('Agent spec v0.1.md');
    if (d && window.AgentBody) window.AgentBody.run({ host: host, segments: [{ md: d.md, gap: 0 }], speed: 0, sleep: function () { return Promise.resolve(); } });
    return host;
  }

  function mkMocks() {
    mocksEl = el('div', 'fa-mocks');
    mocksEl.addEventListener('click', function (e) {
      var b = e.target.closest('.fa-mock-b'); if (!b || b.disabled) return;
      var m = MOCKS.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
      if (window.FastHandoff) window.FastHandoff.harden(m.hid);
    });
    paintMocks();
    return mocksEl;
  }
  function paintMocks() {
    if (!mocksEl) return;
    var SB = window.FastSandbox, st = SB && SB.state, prod = st && st.phase === 'production';
    var left = SB ? SB.mocksLeft() : 3;
    mocksEl.innerHTML = '<div class="fa-mocks-h">' + (prod ? '已发布 v1.0，所有 Mock 都已替换。' : left ? '这一版有 ' + left + ' 处是 Mock。试用后觉得哪里不够，就从那一项开始补。' : 'Mock 已全部替换。') + '</div>' +
      MOCKS.map(function (m) {
        var ok = st && st.mocks[m.hid] === 'verified';
        return '<div class="fa-mock' + (ok ? ' is-ok' : '') + '" data-id="' + m.id + '"><div class="fa-mock-top"><span class="fa-mock-n">' + m.n + '</span><span class="fa-mock-tag' + (ok ? ' ok' : '') + '">' + (prod ? 'PRODUCTION' : ok ? 'VERIFIED' : 'MOCK') + '</span></div>' +
          '<div class="fa-mock-r"><span>现在</span>' + (ok ? '已换成真实实现' : m.now) + '</div>' + (ok ? '' : '<div class="fa-mock-r"><span>替换为</span>' + m.next + '</div>') +
          (ok ? '' : '<button type="button" class="fa-mock-b" data-id="' + m.id + '">替换成真实</button>') + '</div>';
      }).join('');
  }
  function paintHead() {
    if (!wrap) return;
    var SB = window.FastSandbox, st = SB && SB.state; if (!st) return;
    var chip = wrap.querySelector('.fa-envchip'), btn = wrap.querySelector('.fa-promote');
    chip.querySelector('em').textContent = SB.envLabel();
    chip.className = 'fa-ready fa-envchip ' + st.phase;
    if (st.phase === 'sandbox') btn.hidden = true;
    else if (st.phase === 'hardening') { btn.hidden = false; btn.textContent = '查看 Sandbox'; btn.onclick = function () { window.FastModules && window.FastModules.open('sandbox'); }; }
    else btn.hidden = true;
    var tabMocks = tabs.mocks; if (tabMocks) tabMocks.textContent = 'Mocks · ' + SB.mocksLeft();
  }
  var bound = false;
  function bind() { if (bound || !window.FastSandbox) return; bound = true; window.FastSandbox.on(function () { paintMocks(); paintHead(); }); }

  function build() {
    wrap = el('div', 'fa-wrap');
    var head = el('div', 'fa-head',
      '<div class="fa-head-l"><span class="fa-name">Sourcing Strategy Agent</span><span class="fa-ver">v0.1</span></div>' +
      '<span class="fa-head-r"><span class="fa-ready fa-envchip"><i></i><em></em></span><button type="button" class="fa-promote"></button></span>');
    var bar = el('div', 'fa-tabs');
    [['try', 'Try'], ['spec', 'Spec'], ['mocks', 'Mocks · 3']].forEach(function (t) {
      var b = el('button', 'fa-tab'); b.type = 'button'; b.textContent = t[1]; b.setAttribute('data-t', t[0]);
      b.addEventListener('click', function () { sub(t[0]); });
      bar.appendChild(b); tabs[t[0]] = b;
    });
    var body = el('div', 'fa-body-wrap');
    panes.try = mkChat(); panes.spec = el('div', 'fa-pane-scroll'); panes.spec.appendChild(mkSpec()); panes.mocks = el('div', 'fa-pane-scroll'); panes.mocks.appendChild(mkMocks());
    Object.keys(panes).forEach(function (k) { body.appendChild(panes[k]); });
    wrap.appendChild(head); wrap.appendChild(bar); wrap.appendChild(body);
    sub('try');
    bind();
    paintHead();
    return wrap;
  }
  function sub(k) {
    Object.keys(panes).forEach(function (n) { panes[n].hidden = n !== k; tabs[n].classList.toggle('is-active', n === k); });
  }

  function open(k) {
    if (!registered && window.FastDocs) {
      window.FastDocs.register({ name: NAME, kind: 'agent', build: build, iconHtml: ICO });
      registered = true;
    }
    window.FastDocs.open(NAME);
    if (k && tabs[k]) sub(k);
  }

  window.FastAgentPanel = {
    open: open, prompts: PROMPTS,
    repair: function (key, note) { repairNotes[key] = '\n\n**诊断修复**\n\n' + note; },
    preview: function (text, key) {
      open('try');
      if (busy) return;
      thread.innerHTML = '';
      return ask(text, key);
    }
  };
})();
