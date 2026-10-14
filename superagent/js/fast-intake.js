/**
 * Fast POC page ONLY — the "no scene yet" entry path.
 *
 * A user who does not use the sidebar "New scenario+" just types a request in the very first conversation:
 *   Space → streams the request → send → round 1: Agent narrows the scope
 *   Space → streams the answer  → send → round 2: Agent summarises and asks "make this a scenario?" (plain text + two buttons)
 *   「创建场景」 → joins the same chain as the sidebar path (WorkshopCreateScene.fromChat → scene card → 进入打造 → …)
 *   「再聊聊」   → Agent listens, then asks again on the next message
 *
 *   FastIntake.active()  → true while this scripted path applies (first conversation, no scene created yet)
 *   FastIntake.prompt()  → text the composer fills on Space
 *   FastIntake.take()    → plan { process, segments, after } for the next Agent turn
 *   FastIntake.stop()    → scene was created some other way (sidebar) — path is over
 */
(function () {
  'use strict';
  var idx = 0, off = false;

  function div(cls) { var n = document.createElement('div'); if (cls) n.className = cls; return n; }

  /* plain-text yes/no (no scene card — the card shows up right after creating, so it would repeat) */
  async function ask(c) {
    var card = window.FastMode.choiceButtons([{ id: 'create', label: '创建场景' }, { id: 'more', label: '再聊聊' }]);
    var seg = div('ao-seg stream-enter');
    seg.appendChild(card.node);
    c.host.appendChild(seg);
    c.scroll();
    var picked = await card.picked;
    await c.sleep(420);
    var part = div();
    c.host.appendChild(part);
    if (picked === 'create') {
      await c.run(part, [{ md: '好，我这就把它整理成场景，并同步到左侧。', gap: 360 }]);
      // after this turn releases the chat — same hand-off as the sidebar path
      setTimeout(function () { window.WorkshopCreateScene.fromChat(); }, 700);
      return { skipFooter: true };
    }
    await c.run(part, [{ md: '好的，先不建。你接着说，比如想解决的具体问题、已有的素材，或者想关联的系统；我听完再跟你确认一次。', gap: 360 }]);
    return null;
  }

  var STEPS = [
    {
      prompt: '我想做一个供应商寻源的 Agent，新品导入时帮采购筛选候选供应商，并对比报价。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('先看看工作区里有没有和寻源相关的场景或素材。');
          await api.sleep(300);
          await api.V({ id: 'in1', icon: 'search', label: '已检索工作区', details: ['Scenarios：暂无', 'Files：暂无素材', '知识库中没有相关文档'] });
          await api.sleep(400);
        },
        segments: [{ md:
          '明白了，你想做一个 **供应商寻源 Agent**：新品导入时帮采购筛选候选供应商，并对比报价。\n\n' +
          '工作区里还没有对应的场景，我先问两件事，把范围定下来：\n\n' +
          '1. 这个 Agent 主要给谁用？采购、品质，还是两边都用？\n' +
          '2. 覆盖哪些物料？只做寻源和比价，还是连供应商准入评审也一起管？', gap: 340 }],
      },
    },
    {
      prompt: '主要给采购和品质部用，覆盖电子元器件和结构件，寻源、比价和准入评审都要管。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('范围清楚了，我把聊到的内容整理成一个场景草稿。');
          await api.sleep(300);
          await api.V({ id: 'in2', icon: 'context', label: '已整理需求要点', details: ['目标：供应商寻源、比价、准入评审', '使用者：采购、品质部', '物料范围：电子元器件、结构件'] });
          await api.sleep(400);
        },
        segments: [{ md:
          '收到，我把到现在聊到的内容整理一下：\n\n' +
          '| 维度 | 当前理解 |\n|---|---|\n' +
          '| 目标 | 供应商寻源：新品导入时筛选候选供应商、对比报价 |\n' +
          '| 使用者 | 采购、品质部 |\n' +
          '| 物料范围 | 电子元器件、结构件 |\n' +
          '| 覆盖环节 | 寻源 → 比价 → 准入评审 |\n\n' +
          '这些信息已经足够立一个场景了。我建议建成应用场景 **A1 Supplier intelligent sourcing & admission**，下挂业务场景 **T1 Sourcing strategy (v2.1 new step)**，要现在创建吗？', gap: 340 }],
        after: ask,
      },
    },
    {
      /* "再聊聊" loop — absorbs one more remark, then asks again (stays on this step) */
      prompt: '另外，每次准入评审的依据也要能追溯。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('把这条补充也记进场景草稿里。');
          await api.sleep(300);
          await api.V({ id: 'in3', icon: 'context', label: '已更新场景草稿', details: ['新增要求：准入评审依据可追溯', '其余内容不变'] });
          await api.sleep(400);
        },
        segments: [{ md: '好，**准入评审依据可追溯** 也记下了，会作为这个场景的一条要求。\n\n其余信息已经足够，要现在把它建成场景吗？', gap: 340 }],
        after: ask,
      },
    },
  ];

  window.FastIntake = {
    active: function () {
      var CV = window.FastConversations;
      return !off && !!(CV && CV.isPre && CV.isPre());
    },
    prompt: function () { return STEPS[idx].prompt; },
    take: function () { var p = STEPS[idx].plan; if (idx < STEPS.length - 1) idx++; return p; },
    stop: function () { off = true; },
  };
})();
