/**
 * Fast POC page ONLY — what happens after the user picks "Fast" (not loaded by superagent.html).
 *   FastFlow.start()   → chains the turns below once the current Agent turn has finished
 *
 *   ① Draft plans      Agent drafts Product / Ontology / Agent plans into Files → Deliverables
 *   ② Confirm          decision card: 5 decisions with a recommendation each (gate 1 — the user confirms the docs)
 *   ③ Intent check     "generate the Agent now?" — go / keep refining (→ Steps) / later (gate 2)
 *   ④ Generate         ontology stub · skill stubs · sample-data MCP · assemble → blueprint plates turn "Mock", Agent "Ready to try"
 *   ⑤ Ready to try     card in chat + the Agent opens in the right panel (Try · Spec · Mocks)
 *
 * Plans use the same shape as js/fast-journey.js: { process(api), segments, after(ctx) }.
 */
(function () {
  'use strict';
  var BP = function () { return window.FastBlueprint; };
  var FF = function () { return window.FastFiles; };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function files(list, gap) {
    return async function () {
      for (var i = 0; i < list.length; i++) {
        await new Promise(function (r) { setTimeout(r, gap || 520); });
        if (FF()) FF().addDeliverable(list[i]);
      }
      await new Promise(function (r) { setTimeout(r, 240); });
    };
  }
  function seg(c, node) {
    var s = el('div', 'ao-seg stream-enter');
    s.appendChild(node);
    c.host.appendChild(s);
    c.scroll();
  }
  async function say(c, md) {
    var part = el('div');
    c.host.appendChild(part);
    await c.run(part, [{ md: md, gap: 340 }]);
  }

  /* ───────── decision card ───────── */
  function decisionCard() {
    var DEC = window.FastPlanData.decisions;
    var pick = {};
    DEC.forEach(function (d) { pick[d.id] = 0; });
    var box = el('div', 'ff-card');
    box.innerHTML =
      '<div class="ff-head"><span class="ff-t">需要你确认的 5 个决策</span><span class="ff-h">已按推荐预选，可直接确认</span></div>' +
      '<div class="ff-list">' + DEC.map(function (d) {
        return '<div class="ff-d" data-d="' + d.id + '">' +
          '<div class="ff-d-top"><span class="ff-d-id">' + d.id + '</span><span class="ff-d-t">' + esc(d.title) + '</span></div>' +
          '<div class="ff-d-why">' + esc(d.why) + '</div>' +
          '<div class="ff-opts">' + d.opts.map(function (o, i) {
            return '<button type="button" class="ff-opt' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '"><span class="ff-radio"></span>' +
              '<span class="ff-opt-t">' + esc(o.t) + '</span>' + (o.rec ? '<span class="ff-rec">推荐</span>' : '') + '</button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>' +
      '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="confirm">确认并继续</button>' +
      '<button type="button" class="fm-btn" data-act="view">查看产品方案</button>' +
      '<span class="ff-sum"></span></div>';
    var sum = box.querySelector('.ff-sum');
    function sync() {
      var n = DEC.filter(function (d) { return pick[d.id] !== 0; }).length;
      sum.textContent = n ? '其中 ' + n + ' 项与推荐不同' : '全部采用推荐';
    }
    sync();
    var done = new Promise(function (resolve) {
      box.addEventListener('click', function (e) {
        if (box.classList.contains('is-done')) return;
        var o = e.target.closest('.ff-opt');
        if (o) {
          var row = o.closest('.ff-d');
          row.querySelectorAll('.ff-opt').forEach(function (x) { x.classList.toggle('is-on', x === o); });
          pick[row.getAttribute('data-d')] = +o.getAttribute('data-i');
          sync();
          return;
        }
        var b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.getAttribute('data-act') === 'view') { window.FastDocs.open('Product plan v0.1.md'); return; }
        box.classList.add('is-done');
        b.classList.add('is-picked');
        resolve(JSON.parse(JSON.stringify(pick)));
      });
    });
    return { node: box, done: done };
  }

  /* ───────── ① + ② draft & confirm ───────── */
  function planDraft() {
    var DEC = window.FastPlanData.decisions;
    return {
      process: async function (api) {
        await api.sleep(400);
        await api.W('资料和需求都齐了，先起草三份方案文档：产品、本体、Agent。');
        if (FF()) FF().showTab(true);
        BP() && BP().set('doc', 'doing', 'Drafting');
        BP() && BP().set('onto', 'mock', 'Will mock');
        BP() && BP().set('skill', 'mock', 'Will mock');
        await api.sleep(300);
        await api.V({ id: 'p1', icon: 'edit', label: '已起草 · 产品方案', details: ['目标用户、使用场景、功能范围', '评分口径与成功标准', '整理出 5 个待决策项'], during: files(['Design plans/Product plan v0.1.md']) });
        await api.V({ id: 'p2', icon: 'edit', label: '已起草 · 本体方案', details: ['对象：供应商、料号、报价、合同、异常', '关系与动作，ERP 字段映射'], during: files(['Design plans/Ontology plan v0.1.md']) });
        await api.V({ id: 'p3', icon: 'edit', label: '已起草 · Agent 方案', details: ['角色与边界，4 个 Skill，2 个数据连接', '对话流程与输出格式'], during: files(['Design plans/Agent plan v0.1.md']) });
        await api.W('三份草稿有了。其中有 5 处会直接影响结果，需要你来定。');
        BP() && BP().set('doc', 'doing', 'Review');
        await api.sleep(300);
        if (FF()) FF().showTab(false);
      },
      segments: [{ md:
        '三份方案文档起草好了，放在左侧 **Files → Deliverables**：\n\n' +
        '- [Product plan v0.1](Product plan v0.1.md)：目标、场景、功能范围、评分口径、成功标准\n' +
        '- [Ontology plan v0.1](Ontology plan v0.1.md)：对象、关系、动作，以及和 ERP 的映射\n' +
        '- [Agent plan v0.1](Agent plan v0.1.md)：角色、Skill、数据连接、对话流程\n\n' +
        '快速出一版时，不需要你逐页审阅。文档里只有下面 **5 个决策** 会影响后面的结果，每项我都给了推荐，其余部分先按默认处理：', gap: 340 }],
      after: async function (c) {
        var card = decisionCard();
        seg(c, card.node);
        var pick = await card.done;
        await c.sleep(420);
        window.FastPlanData.picks = pick;
        var diff = DEC.filter(function (d) { return pick[d.id] !== 0; });
        var rows = DEC.map(function (d) { return '| ' + d.id + ' ' + d.title + ' | ' + d.opts[pick[d.id]].t + ' |'; }).join('\n');
        window.FastDocs.append('Product plan v0.1.md',
          '\n## 8. 已确认决策\n\n| 决策 | 结论 |\n|---|---|\n' + rows + '\n\n由你在对话中确认，三份方案据此定稿。\n');
        BP() && BP().set('doc', 'done', 'Confirmed');
        BP() && BP().set('know', 'done', 'Indexed');
        await say(c,
          '已确认。' + (diff.length ? '和推荐不同的有 **' + diff.length + ' 项**（' + diff.map(function (d) { return d.id + ' ' + d.title; }).join('、') + '），' : '全部采用了推荐，') +
          '我已把结论写进 [Product plan v0.1](Product plan v0.1.md) 的「已确认决策」，三份方案定稿。');
      },
    };
  }

  /* ───────── ③ intent: generate now? ───────── */
  function planIntent() {
    return {
      process: async function (api) {
        await api.sleep(400);
        await api.W('决策定了，我评估一下现在是否可以直接生成 Agent。');
        await api.sleep(300);
        await api.V({ id: 'i1', icon: 'search', label: '已评估生成条件', details: [
          '需求：品类、触发场景、硬性条件、评估优先级，已明确',
          '资料：9 份已读取，含合同、准入标准、ERP 导出',
          '设计：三份方案已确认，5 个决策已落定',
          '缺口：本体未校对、Skill 规则未固化、ERP 未连接，可先用 Mock 顶上',
        ] });
        await api.sleep(300);
      },
      segments: [{ md:
        '评估结果：**可以直接生成一版可试用的 Agent**。需求、资料和设计决策都已齐备；缺的三块（本体、Skill 规则、ERP 连接）不影响先跑起来，我用 Mock 顶上，试用中再逐项替换。\n\n你想怎么推进？', gap: 340 }],
      after: async function (c) {
        var card = window.FastMode.choiceCard({
          title: '是否直接生成 Agent',
          hint: '选「先继续完善」，我们就一步步做扎实',
          list: true, noModeSet: true,
          mapLink: '查看完整蓝图', mapMode: 'fast',
          summary: [
            ['将生成', 'Sourcing Strategy Agent v0.1'],
            ['真实部分', '评分口径与决策、准入标准与合同、评审模板'],
            ['Mock 部分', '本体（由 ERP 字段字典生成）· Skill 规则 · ERP 样例数据'],
          ],
          options: [
            { id: 'go', name: '直接生成 Agent', tag: '推荐', desc: '约 1 分钟生成可试用版本，在右侧面板里直接提问；Mock 部分会明确标注，之后逐项替换。' },
            { id: 'refine', name: '先继续完善', desc: '先把本体和 Skill 做扎实再生成，一步步推进。' },
            { id: 'later', name: '先到这里，稍后继续', desc: '保留现有文档和决策，随时可以回来继续。' },
          ],
        });
        seg(c, card.node);
        var picked = await card.picked;
        await c.sleep(420);
        if (picked === 'refine') {
          window.FastMode.set('steps');
          BP() && BP().set('onto', 'doing', 'Scoping');
          await say(c, '好，我们一步步做扎实。接下来先把 **本体** 做扎实：我会基于 ERP 字段字典整理对象和关系，列出需要你校对的字段。');
        } else if (picked === 'later') {
          await say(c, '好，文档和决策都保留着。想继续时直接告诉我，从「生成 Agent」接着走。');
        }
        return { picked: picked };
      },
    };
  }

  /* ───────── ④ generate (+ ⑤ ready to try card) ───────── */
  function planGenerate() {
    return {
      process: async function (api) {
        await api.sleep(400);
        await api.W('开始生成。本体、Skill、ERP 连接先用 Mock，把 Agent 主干组装起来。');
        if (FF()) FF().showTab(true);
        await api.sleep(250);
        await api.V({ id: 'g1', icon: 'ontology', label: '已生成本体桩 · 5 个对象', details: ['Supplier · Part · Quote · Contract · Incident', '5 条关系，来自 ERP 字段字典'], during: files(['Agent v0.1/Ontology stub.json'], 600) });
        BP() && BP().set('onto', 'mock', 'Mock');
        await api.V({ id: 'g2', icon: 'skill', label: '已生成 3 个 Skill 桩', details: ['screen-suppliers · 硬性条件筛选', 'compare-quotes · 报价换算比价', 'score-suppliers · 按 45/30/15/10 打分'] });
        await api.V({ id: 'g3', icon: 'mcp', label: '已生成 ERP 样例数据连接', details: ['读取 ERP 导出的 14 条报价', '字段按字典映射，标注 MOCK'] });
        BP() && BP().set('skill', 'mock', 'Mock');
        await api.W('主干就绪，组装 Agent 并自测一遍。');
        BP() && BP().set('agent', 'doing', 'Generating');
        await api.V({ id: 'g4', icon: 'edit', label: '已生成 Agent · Sourcing Strategy v0.1', details: ['写入系统提示、能力与边界', '登记 Mock 清单（3 项）'], during: files(['Agent v0.1/Agent spec v0.1.md', 'Agent v0.1/Mock register v0.1.md'], 600) });
        await api.V({ id: 'g5', icon: 'command', label: '已自测 3 个示例问题', details: ['PCB 候选与比价 · 通过', '供应商异常找替代 · 通过', '两家供应商对比 · 通过'] });
        BP() && BP().set('agent', 'done', 'Ready to try');
        window.FastSandbox.state.generated = true;
        window.FastSandbox.emit();
        await api.sleep(300);
        if (FF()) FF().showTab(false);
      },
      segments: [{ md:
        '**Sourcing Strategy Agent v0.1** 已生成，可以试用了。\n\n' +
        '这一版有 **3 处 Mock**，我在每个回答里都会标注，之后逐项替换：\n\n' +
        '| Mock 项 | 现在是什么 | 之后替换成 |\n|---|---|---|\n' +
        '| 本体 | 由 ERP 字段字典生成 | 按真实数据校对，补「例外」属性 |\n' +
        '| Skill 规则 | 固定权重和阈值 | 可配置、可回测的规则 |\n' +
        '| ERP 连接 | 14 条样例报价 | 只读连接 ERP 实时接口 |\n\n' +
        '文件在 **Files → Deliverables → Agent v0.1**：[Agent spec](Agent spec v0.1.md) · [Mock register](Mock register v0.1.md) · [Ontology stub](Ontology stub.json)。', gap: 340 }],
      after: async function (c) {
        var card = el('div', 'ff-card ff-ready');
        card.innerHTML =
          '<div class="ff-head"><span class="ff-t">Sourcing Strategy Agent</span><span class="ff-chip"><i></i>READY TO TRY</span></div>' +
          '<div class="ff-ready-s">Agent v0.1 · 3 处 Mock · 已在右侧面板打开，试试这些问题：</div>' +
          '<div class="ff-prompts">' + window.FastAgentPanel.prompts.map(function (p) { return '<button type="button" class="ff-prompt" data-k="' + p.k + '">' + esc(p.q) + '</button>'; }).join('') + '</div>' +
          '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="open">打开 Agent 试用</button>' +
          '<button type="button" class="fm-btn" data-act="mocks">查看 Mock 清单</button></div>';
        card.addEventListener('click', function (e) {
          var b = e.target.closest('[data-act], .ff-prompt');
          if (!b) return;
          if (b.classList.contains('ff-prompt')) {
            window.FastAgentPanel.open('try');
            var btn = document.querySelector('.fa-prompt[data-k="' + b.getAttribute('data-k') + '"]');
            if (btn) btn.click();
          } else if (b.getAttribute('data-act') === 'promote') window.FastHandoff.start();
          else window.FastAgentPanel.open(b.getAttribute('data-act') === 'mocks' ? 'mocks' : 'try');
        });
        seg(c, card);
        window.FastAgentPanel.open('try');
        await c.sleep(300);
      },
    };
  }

  /* ───────── chain ───────── */
  async function start() {
    var chat = window.FastChat;
    while (chat.isBusy()) await new Promise(function (r) { setTimeout(r, 150); });
    await new Promise(function (r) { setTimeout(r, 500); });
    await chat.run(planDraft());
    await new Promise(function (r) { setTimeout(r, 500); });
    var res = null;
    var intent = planIntent(), after = intent.after;
    intent.after = async function (c) { res = await after(c); return res; };
    await chat.run(intent);
    if (!res || res.picked !== 'go') return;
    await new Promise(function (r) { setTimeout(r, 500); });
    await chat.run(planGenerate());
  }

  window.FastFlow = { start: start };
})();
