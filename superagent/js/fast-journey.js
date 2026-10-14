/**
 * Fast POC page ONLY — the scripted conversation that follows "scenario created".
 *   FastJourney.begin()    → arm the script (called after the scenario is created)
 *   FastJourney.active()   → true while there are scripted turns left
 *   FastJourney.prompt()   → text the composer fills on Space
 *   FastJourney.take()     → { plan } for the next Agent turn (consumes it)
 * A plan = { process(api), segments, after(ctx)? } — see runAssistantTurn in
 * js/agent-chat-mock-fast.js.
 *
 * Story: Agent asks sourcing (寻源) questions → user answers (round 1) → Agent
 * confirms + asks about evaluation → user answers (round 2) → intent-recognition
 * card: Fast, or understand the need step by step (Steps).
 */
(function () {
  'use strict';
  var idx = -1;

  var STEPS = [
    {
      prompt: '主要是电子元器件和结构件，一般在新品导入，或者现有供应商出问题要替换的时候触发。硬性条件：要有 ISO 9001 资质、月产能不低于 10 万件、交期 4 周以内。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('先把你补充的信息整理成寻源策略的输入条件。');
          await api.sleep(300);
          await api.V({ id: 'j1', icon: 'context', label: '已更新场景上下文 · T1 Sourcing strategy', details: ['记录寻源品类：电子元器件、结构件', '记录触发场景：新品导入、供应商异常替换', '记录硬性条件：资质、产能、交期'] });
          window.FastBlueprint && window.FastBlueprint.set('req', 'doing', '3/5');
          await api.sleep(400);
        },
        segments: [{ md:
          '收到。我先把这些条件记下来，作为 **T1 寻源策略** 的输入：\n\n' +
          '| 维度 | 当前理解 |\n|---|---|\n' +
          '| 寻源品类 | 电子元器件、结构件 |\n' +
          '| 触发场景 | 新品导入；现有供应商异常时替换 |\n' +
          '| 硬性条件 | ISO 9001 资质 · 月产能 ≥ 10 万件 · 交期 ≤ 4 周 |\n\n' +
          '还有两点需要你确认，才能定下候选供应商怎么评估：\n\n' +
          '1. 打分时更看重哪几项？比如质量、价格、交期、稳定性，哪个排前面？\n' +
          '2. 价格和报价信息从哪里来？是 ERP、历史合同，还是供应商的报价单？', gap: 340 }],
      },
    },
    {
      /* round 2 — conditions are clear; ask for the history contracts instead of jumping to a mode choice */
      prompt: '质量优先，其次是交期，最后看价格。报价数据在 ERP 里，历史合同我也可以上传。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('评估优先级和数据来源都清楚了。历史合同能帮我判断现有评分口径和价格条款，先等你上传。');
          await api.sleep(300);
          await api.V({ id: 'j2', icon: 'context', label: '已更新场景上下文 · T1 Sourcing strategy', details: ['记录评估优先级：质量 > 交期 > 价格', '记录数据来源：ERP 报价、历史合同（待上传）', '待补充：合同、准入标准、流程资料'] });
          window.FastBlueprint && window.FastBlueprint.set('req', 'doing', '4/5');
          await api.sleep(300);
          window.FastBlueprint && window.FastBlueprint.set('know', 'doing', 'Need contracts');
          await api.sleep(400);
        },
        segments: [{ md:
          '收到，评估优先级和数据来源我先记下来：\n\n' +
          '| 维度 | 当前理解 |\n|---|---|\n' +
          '| 寻源品类 | 电子元器件、结构件 |\n' +
          '| 触发场景 | 新品导入；现有供应商异常时替换 |\n' +
          '| 硬性条件 | ISO 9001 资质 · 月产能 ≥ 10 万件 · 交期 ≤ 4 周 |\n' +
          '| 评估优先级 | 质量 > 交期 > 价格 |\n' +
          '| 数据来源 | ERP 报价；历史合同（待上传） |\n\n' +
          '等你上传资料后，我会重新评估两件事：\n\n' +
          '1. **场景需求**：条件有没有缺口，哪些规则已经有现成的标准，哪些需要重新定义。\n' +
          '2. **对 Agent 的依赖**：寻源的哪些环节必须由 Agent 自动完成，哪些由 Agent 给建议、人来确认，哪些暂时不用介入。\n\n' +
          '建议上传以下资料，有就传，没有的先跳过：\n\n' +
          '- 近两年的**历史合同**和价格清单\n' +
          '- **供应商准入标准**、合格供应商清单\n' +
          '- 现有**寻源流程说明**、访谈或会议纪要\n' +
          '- 供应商**异常记录**，以及 ERP 报价导出样例\n\n' +
          '点输入框左下角的「上传」按钮选择文件，再发送给我就可以。', gap: 340 }],
      },
    },
    {
      /* round 3 — user uploads documents; Agent reads them one by one, Files fills up, then intent recognition */
      upload: true,
      prompt: '资料我都传上来了：历史合同、准入标准、流程说明和 ERP 报价导出都在里面，你先看一下，帮我判断现在条件够不够。',
      plan: {
        process: async function (api) {
          var FD = window.FastDocs, FF = window.FastFiles, BP = window.FastBlueprint;
          var docs = FD.all();
          await api.sleep(400);
          await api.W('收到 ' + docs.length + ' 份资料。我逐份读，并按类型归到左侧 Files 的素材里。');
          await api.sleep(300);
          if (FF) FF.showTab(true);

          var intro = {
            'Historical contracts': '先读历史合同：价格条款、交期承诺和违约条款是评分里最硬的依据。',
            'Supplier standards': '再读准入标准和合格供应商清单，看看现有的筛选规则是怎么定的。',
            'Process & notes': '接着读流程说明、访谈纪要和异常记录，确认触发寻源的真实场景。',
            'ERP exports': '最后看 ERP 报价导出，确认字段和可用的数据口径。',
          };
          var groups = FD.groups();
          for (var g = 0; g < groups.length; g++) {
            var grp = groups[g];
            await api.W(intro[grp.folder] || ('接着读 ' + grp.folder + '。'));
            await api.sleep(260);
            await api.V({
              id: 'rd-' + g, icon: 'read',
              label: '已阅读 · ' + grp.folder + '（' + grp.files.length + ' 份）',
              details: grp.files.map(function (f) { return f.name + ' · ' + f.note; }),
              during: async function () {
                for (var k = 0; k < this.files.length; k++) {
                  await api.sleep(520);
                  if (FF) FF.addMaterial(this.files[k].folder + '/' + this.files[k].name);
                }
                await api.sleep(260);
              }.bind(grp),
            });
          }

          await api.W('资料读完了，我把关键信息和你前面说的条件对一遍。');
          await api.sleep(300);
          await api.V({ id: 'j3a', icon: 'search', label: '已提取关键信息', details: [
            '硬性条件：ISO 9001 · 月产能 ≥ 10 万件 · 交期 ≤ 4 周（准入标准 v3.2）',
            '评分权重：质量 35 · 交期 25 · 价格 25 · 稳定性 15',
            '合同：9 份框架协议、12 条价格条款，价格变动 −4.5% 至 +2.8%',
            '异常：2026 年 8 起（质量 4 · 交期 3 · 产能 1），3 起触发替换',
            'ERP 报价：14 条记录，字段规范，可映射到供应商、料号、报价',
          ] });
          await api.sleep(250);
          await api.V({ id: 'j3b', icon: 'search', label: '已完成意图识别', details: ['识别为：打造一个寻源 Agent', '关联场景：T1 Sourcing strategy', '输入已具备：品类、触发场景、硬性条件、评估优先级、数据来源与历史资料'] });
          if (FF) FF.showTab(false);
          BP && BP.set('req', 'done', 'Defined');
          await api.sleep(300);
          BP && BP.set('know', 'doing', 'Indexed');
          await api.sleep(400);
        },
        segments: [{ md:
          '明白了，现在前置条件比较完整。你上传的资料我已经逐份读完，并归到了左侧 **Files** 的素材里，点开任意一份都可以在右侧查看：', gap: 340 }],
        after: async function (c) {
          function seg(node) {
            var s = document.createElement('div');
            s.className = 'ao-seg stream-enter';
            s.appendChild(node);
            c.host.appendChild(s);
            c.scroll();
          }
          seg(window.FastDocs.readCard());
          await c.sleep(380);

          var part1 = document.createElement('div');
          c.host.appendChild(part1);
          await c.run(part1, [{ md:
            '结合这些资料和你前面的回答，目前的理解是：\n\n' +
            '| 维度 | 当前理解 | 依据 |\n|---|---|---|\n' +
            '| 寻源品类 | 电子元器件、结构件 | 对话 · [Qualified supplier list](Qualified supplier list 2026.xlsx) |\n' +
            '| 触发场景 | 新品导入；供应商异常替换（2026 年 8 起异常，3 起替换） | [Supplier incident log](Supplier incident log 2026.xlsx) |\n' +
            '| 硬性条件 | ISO 9001 · 月产能 ≥ 10 万件 · 交期 ≤ 4 周 | [Admission standard v3.2](Supplier admission standard v3.2.md) |\n' +
            '| 评估优先级 | 质量 > 交期 > 价格 | 对话 · [Kickoff interview notes](Kickoff interview notes-0918.md) |\n' +
            '| 数据来源 | ERP 报价；9 份合同的价格条款 | [ERP quotation export](ERP quotation export 2026-Q3.xlsx) · [Contract price summary](Contract price summary 2024-2026.xlsx) |\n\n' +
            '### 需要注意的两处差异\n\n' +
            '1. **价格权重偏高**：现行准入标准里价格占 25 分，和交期持平，质量（35）也只多 10 分，与你给的「质量 > 交期 > 价格」不一致，评分模型需要重新定权重。\n' +
            '2. **有 3 家供应商会被硬性条件筛掉**：Kaisheng（交期 6 周）、Mingda（产能 8 万、交期 5 周）、Ruifeng（缺 ISO 9001），其中 Kaisheng 长期走例外，建议用「例外标记」表达，而不是直接剔除。\n\n' +
            '### 对 Agent 的依赖评估\n\n' +
            '| 环节 | 现状 | Agent 介入程度 |\n|---|---|---|\n' +
            '| 候选长名单与硬性条件核查 | 人工比对 Excel，约 2 天 | **高**：全自动完成 |\n' +
            '| 报价整理与比价 | ERP 导出加手工换算，3–5 天 | **高**：自动换算并出比价表 |\n' +
            '| 评分与排序 | 口径不一致 | **中**：Agent 给分和依据，人确认 |\n' +
            '| 异常时找替代方案 | 被动，约 3 周 | **中**：预先维护备选清单，异常时自动推荐 |\n' +
            '| 评审审批与合同 | 线下 | **低**：暂不介入，只生成评审材料 |\n\n' +
            '资料已经足够起步，接下来有两种开始方式，你选一个：', gap: 340 }]);

          var card = window.FastMode.choiceCard({
            title: '意图识别',
            hint: '之后也可以随时告诉我换一种做法',
            mapLink: '查看完整蓝图', mapMode: 'fast',
            summary: [
              ['识别意图', '打造一个寻源 Agent'],
              ['关联场景', 'T1 Sourcing strategy'],
              ['信息完整度', '条件已明确；9 份资料已读取，含合同与准入标准'],
            ],
          });
          seg(card.node);
          var picked = await card.picked;
          if (window.FastConversations) window.FastConversations.rename('打造寻源 Agent');
          await c.sleep(420);
          var part = document.createElement('div');
          c.host.appendChild(part);
          var lead = picked === 'fast'
            ? '好，先快速出一版：我先根据资料起草三份方案文档，只请你确认几个关键决策；确认后直接生成一版可试用的 Agent，试用中发现不足再回头补。'
            : '好，一步步做扎实：我们先把需求、业务知识和设计文档逐步做扎实，再建本体、生成 Agent。';
          if (picked !== 'fast') window.FastBlueprint && window.FastBlueprint.set('doc', 'doing', 'Scoping');
          await c.run(part, [{ md: lead, gap: 360 }]);
          if (picked === 'fast' && window.FastFlow) setTimeout(function () { window.FastFlow.start(); }, 300);
        },
      },
    },
  ];

  window.FastJourney = {
    begin: function () { idx = 0; },
    active: function () { return idx >= 0 && idx < STEPS.length; },
    prompt: function () { return window.FastJourney.active() ? STEPS[idx].prompt : null; },
    take: function () { return window.FastJourney.active() ? STEPS[idx++].plan : null; },
    needsUpload: function () { return window.FastJourney.active() && !!STEPS[idx].upload; },
  };
})();
