(function () {
  'use strict';

  var PROMPT = '我们正在接触DJI大疆创新。他们是消费电子与无人机龙头，目前重点看全球渠道销售运营板块，特别是新品首发与紧俏品分货业务，面临头部渠道压货、真实动销口径不清、人工分货例外多且防黄牛难闭环等问题。帮我做一份全景规划，看看切入哪些AI场景合适，并给我一份可以拿去跟客户汇报对齐的材料。';
  var REPORT_NAME = 'Customer Communication Report.md';
  var executionStarted = false;
  var reportAdded = false;

  var TASKS = [
    {
      title: '明确目标企业主体并构建企业画像',
      desc: '核验企业主体、业务背景与关键信息，形成企业画像。',
      agent: '企业全景规划Agent',
    },
    {
      title: '拆解企业业务全景现状',
      desc: '拆解全球渠道销售运营现状，聚焦新品首发与紧俏品分货痛点。',
      agent: '企业全景规划Agent',
    },
    {
      title: '推导并生成场景规划草稿',
      desc: '基于业务现状与关键痛点推导 AI 场景，形成场景规划草稿。',
      agent: '企业全景规划Agent',
    },
    {
      title: '生成客户沟通汇报方案',
      desc: '汇总企业画像、现状分析与场景建议，形成客户沟通汇报方案。',
      agent: '企业全景规划Agent',
    },
  ];

  function matches(text) {
    if (!window.FastJourneyRoute || window.FastJourneyRoute.get() !== '1') return false;
    var normalized = String(text || '').replace(/\s+/g, '');
    return normalized === PROMPT.replace(/\s+/g, '') ||
      (normalized.indexOf('DJI大疆创新') !== -1 && normalized.indexOf('全景规划') !== -1);
  }

  function appendNode(ctx, node) {
    var segment = document.createElement('div');
    segment.className = 'ao-seg stream-enter';
    segment.appendChild(node);
    ctx.host.appendChild(segment);
    ctx.scroll();
  }

  function revealAsset(kind) {
    if (window.EnterpriseAssets) window.EnterpriseAssets.setContentVisible(kind, true);
  }

  function addCustomerReport() {
    if (reportAdded) return;
    reportAdded = true;
    if (window.FastDocs && !window.FastDocs.find(REPORT_NAME)) {
      window.FastDocs.register({
        kind: 'md',
        deliverable: true,
        folder: 'Enterprise Assets',
        name: REPORT_NAME,
        size: '8 KB',
        pages: '12 页',
        updated: '刚刚',
        author: '企业全景规划Agent',
        note: 'DJI 全球渠道销售运营全景规划客户沟通材料',
        md: '# DJI 全球渠道销售运营全景规划\n\n' +
          '## 1. 客户与业务背景\n\n聚焦新品首发与紧俏品分货业务，覆盖全球渠道销售运营关键链路。\n\n' +
          '## 2. 现状与核心问题\n\n- 头部渠道压货\n- 真实动销口径不清\n- 人工分货例外多\n- 防黄牛难以形成闭环\n\n' +
          '## 3. AI 场景规划建议\n\n以渠道真实动销识别、智能分货决策、异常例外治理和防黄牛风险识别为优先切入方向。\n\n' +
          '## 4. 建议下一步\n\n与客户确认数据口径、试点市场与首批渠道范围后，进入场景方案细化。',
      });
    }
    if (window.FastFiles) {
      window.FastFiles.addDeliverable(REPORT_NAME);
      window.FastFiles.markUpdated(REPORT_NAME);
    }
  }

  function createExecutionPlan() {
    var titles = TASKS.map(function (task) { return task.title; });
    var progress = window.FastFlow.executionTaskCard(titles);
    var thinking = window.FastFlow.executionThinkingBlock();
    async function runThoughts(ctx, messages) {
      for (var i = 0; i < messages.length; i++) {
        thinking.add(messages[i]);
        ctx.scroll();
        await ctx.sleep(330);
      }
    }
    return {
      process: async function (api) {
        await api.W('任务清单已经确认。我先建立四项任务的执行依赖，并核对每项任务对应的交付物和解锁条件。');
        await api.sleep(620);
        await api.V({
          id: 'j1-exec-scope',
          icon: 'context',
          label: '已建立任务与交付物映射',
          details: ['任务 1 → Enterprise Documents', '任务 2 → Business Landscape', '任务 3 → Scenario Planning', '任务 4 → Customer Communication Report'],
        });
        await api.sleep(620);
        await api.V({
          id: 'j1-exec-gate',
          icon: 'search',
          label: '已设置人工审核节点',
          details: ['Business Landscape 生成后暂停', '支持查看方案与确认通过', '通过后继续场景规划与汇报材料生成'],
        });
        await api.sleep(620);
        await api.W('执行顺序和人工审核点均已就绪。现在开始逐项生成，并在每项完成时同步解锁左侧对应资产。');
        await api.sleep(720);
      },
      segments: [{
        md: '任务已启动。我会按已确认的顺序推进，并实时更新下面的任务进度。',
        gap: 220,
      }],
      after: async function (ctx) {
        appendNode(ctx, progress.node);
        appendNode(ctx, thinking.node);
        await ctx.sleep(360);

        progress.start(0);
        await runThoughts(ctx, [
          '正在识别 DJI 大疆创新的企业主体',
          '正在核验集团名称与核心品牌关系',
          '正在提取企业所属行业与主营业务',
          '正在定位全球渠道销售运营板块',
          '正在筛选与当前项目相关的企业事实',
          '正在交叉比对公开资料与当前输入',
          '正在归一化企业画像字段',
          '正在标记关键信息的来源与可信度',
          '正在生成可追溯的 Enterprise Documents',
        ]);
        revealAsset('documents');
        progress.done(0);
        ctx.scroll();

        await ctx.sleep(360);
        progress.start(1);
        await runThoughts(ctx, [
          '正在展开全球渠道销售运营主链路',
          '正在定位新品首发与紧俏品分货节点',
          '正在识别总部、区域与渠道商的角色关系',
          '正在分析头部渠道压货的形成机制',
          '正在核对真实动销口径的差异来源',
          '正在聚类人工分货中的高频例外',
          '正在追踪防黄牛策略的断点',
          '正在评估各问题的业务影响范围',
          '正在绘制聚焦痛点的 Business Landscape',
        ]);
        revealAsset('landscape');
        progress.wait(1);
        thinking.waitForUser();
        ctx.scroll();

        var review = window.FastFlow.deliverableConfirmation({
          title: 'Business Landscape 已生成',
          desc: '已完成全球渠道销售运营现状拆解，并聚焦新品首发与紧俏品分货的关键问题。请查看方案并确认是否继续。',
          file: 'Business Landscape',
          result: '业务现状全景已审核通过',
        });
        appendNode(ctx, review.node);
        var reviewResult = await review.done;
        if (reviewResult !== '业务现状全景已审核通过') {
          progress.stop(2);
          progress.stop(3);
          thinking.finish();
          await ctx.run(ctx.host, [{
            md: reviewResult === '已暂停'
              ? '已暂停后续任务。Business Landscape 和当前执行进度已保留。'
              : reviewResult + '\n\n我已暂停后续任务，等待根据你的意见调整方案。',
            gap: 180,
          }]);
          return { journey: '1', paused: true };
        }

        thinking.resume();
        thinking.add('已接收人工确认 · Business Landscape 审核通过');
        progress.decision(1, '已审核通过');
        await ctx.sleep(420);
        progress.start(2);
        await runThoughts(ctx, [
          '正在把已确认痛点映射到 AI 能力',
          '正在识别可由 Agent 承接的决策节点',
          '正在生成候选场景池',
          '正在合并目标重复的候选场景',
          '正在评估场景业务价值',
          '正在评估实施可行性与数据准备度',
          '正在排列 Quick Win 与战略场景优先级',
          '正在补充每个场景的价值依据',
          '正在生成 Scenario Planning 草稿',
        ]);
        revealAsset('planning');
        progress.done(2);
        ctx.scroll();

        await ctx.sleep(360);
        progress.start(3);
        await runThoughts(ctx, [
          '正在汇总企业画像中的关键客户信息',
          '正在提炼业务现状中的核心矛盾',
          '正在选择最适合客户沟通的场景建议',
          '正在组织问题、机会与价值的叙事顺序',
          '正在生成管理层摘要',
          '正在补充场景价值与实施路径',
          '正在整理客户对齐问题清单',
          '正在检查汇报内容与三项资产的一致性',
          '正在生成 Customer Communication Report',
        ]);
        addCustomerReport();
        progress.done(3);
        progress.finish();
        thinking.finish();
        ctx.scroll();
        await ctx.sleep(520);
        var summary = window.FastFlow.deliverableSummary({
          title: '执行总结',
          body: '本轮任务先核验了 DJI 大疆创新的企业主体、业务背景与全球渠道销售运营定位，建立可追溯的企业画像；随后围绕新品首发与紧俏品分货，拆解渠道压货、真实动销口径、人工分货例外和防黄牛闭环等关键问题。在 Business Landscape 通过人工审核后，进一步把已确认的业务痛点映射为可落地的 AI 场景，完成价值、可行性与优先级判断；最后将企业认知、现状分析和场景建议整合为面向客户沟通的汇报材料，形成从企业认知到方案对齐的完整闭环。',
          lead: '本轮共形成以下四项产出，均已生成并可直接查看：',
          items: [
            {
              name: 'Enterprise Documents',
              iconName: 'Enterprise Documents.docx',
              open: function () { window.EnterpriseAssets && window.EnterpriseAssets.open('documents'); },
            },
            {
              name: 'Business Landscape',
              iconName: 'Business Landscape.xlsx',
              open: function () { window.EnterpriseAssets && window.EnterpriseAssets.open('landscape'); },
            },
            {
              name: 'Scenario Planning',
              iconName: 'Scenario Planning.pptx',
              open: function () { window.EnterpriseAssets && window.EnterpriseAssets.open('planning'); },
            },
            {
              name: 'Customer Communication Report',
              iconName: REPORT_NAME,
              open: function () {
                if (window.FastFiles) window.FastFiles.clearUpdated(REPORT_NAME);
                if (window.FastDocs) window.FastDocs.open(REPORT_NAME);
              },
            },
          ],
          conclusion: '已完成从企业主体识别、业务现状全景拆解到 AI 场景规划与客户汇报材料生成的完整链路。当前结果可用于内部机会判断，也可以直接作为下一轮客户沟通和方案对齐的基础。',
          ask: '接下来，我先等你与客户交流对齐后，再回来确认最终要推进的场景。对齐完成后直接告诉我结论，或打开 Scenario Planning 勾选场景即可。',
        });
        appendNode(ctx, summary);
        return { journey: '1', completed: true };
      },
    };
  }

  async function startExecution() {
    if (executionStarted || !window.FastChat) return;
    executionStarted = true;
    while (window.FastChat.isBusy()) {
      await new Promise(function (resolve) { setTimeout(resolve, 80); });
    }
    window.FastChat.postUser('我已确定任务清单。');
    if (window.FastJourneyRoute && window.FastJourneyRoute.ensureAssets) {
      window.FastJourneyRoute.ensureAssets();
    }
    if (window.FastFlow && window.FastFlow.createLongTaskVersion) {
      window.FastFlow.createLongTaskVersion(1, TASKS, '', '企业全景规划 v1');
    }
    if (window.FastFiles) window.FastFiles.showTab(true);
    await new Promise(function (resolve) { setTimeout(resolve, 280); });
    await window.FastChat.run(createExecutionPlan());
  }

  function createPlan() {
    var card = window.FastFlow.taskPlanCard({
      tasks: TASKS,
      progressive: true,
      brief: '企业全景规划 · 4 项交付任务',
      buttonLabel: '开始执行',
      hint: '确认后将按顺序执行；如需调整，直接告诉我。',
    });

    return {
      process: async function (api) {
        await api.W('我先把企业背景、核心业务、关键问题和最终交付目标拆开分析，确保规划既能支撑内部判断，也能直接用于客户沟通。');
        await api.sleep(560);
        await api.V({
          id: 'j1-enterprise',
          icon: 'context',
          label: '已分析企业主体与业务背景',
          details: ['目标企业：DJI 大疆创新', '重点业务：全球渠道销售运营', '当前阶段：项目启动或售前诊断初期'],
        });
        await api.sleep(560);
        await api.V({
          id: 'j1-landscape',
          icon: 'search',
          label: '已拆解业务现状与关键痛点',
          details: ['头部渠道压货', '真实动销口径不清', '人工分货例外多且防黄牛难闭环'],
        });
        await api.sleep(560);
        await api.V({
          id: 'j1-scenarios',
          icon: 'ontology',
          label: '已规划 AI 场景推导路径',
          details: ['从业务现状定位高价值切入点', '匹配企业全景规划与场景推导最佳实践', '先形成场景规划草稿，再与用户确认'],
        });
        await api.sleep(560);
        await api.V({
          id: 'j1-deliverables',
          icon: 'edit',
          label: '已设计多份交付物',
          details: ['企业画像', '业务现状全景', 'AI 场景规划草稿', '客户沟通汇报方案'],
        });
        await api.sleep(560);
        await api.W('四个维度已完成首轮判断。我会把工作收敛为一张四步任务卡，在真正执行和生成交付物前，请你先确认任务安排。');
        await api.sleep(720);
      },
      segments: [
        {
          md: '### 分析结论\n\n' +
            '这次规划的核心不是只列一组 AI 场景，而是建立一条可解释、可对齐、可直接用于客户沟通的完整链路：\n\n' +
            '1. **企业主体与画像**：先确认 DJI 大疆创新的企业背景，以及全球渠道销售运营在整体业务中的位置。\n' +
            '2. **业务现状与痛点**：围绕新品首发与紧俏品分货，拆清渠道压货、真实动销口径、人工例外和防黄牛闭环四类问题。\n' +
            '3. **AI 场景推导**：从关键问题出发匹配最佳实践，判断适合优先切入的 AI 场景及其价值链路。\n' +
            '4. **多份交付物**：连续形成企业画像、业务现状全景、场景规划草稿和客户沟通汇报方案。\n\n' +
            '**建议由企业全景规划Agent按以下四项任务连续推进；开始执行前，请先确认任务清单。**',
          gap: 260,
        },
      ],
      after: async function (ctx) {
        var cardSegment = document.createElement('div');
        cardSegment.className = 'ao-seg stream-enter';
        cardSegment.appendChild(card.node);
        ctx.host.appendChild(cardSegment);
        ctx.scroll();
        for (var i = 0; i < TASKS.length; i++) {
          await ctx.sleep(320);
          card.reveal(i);
          ctx.scroll();
        }
        await ctx.sleep(260);
        card.finish();
        ctx.scroll();
        await card.picked;
        setTimeout(startExecution, 0);
        return { journey: '1', action: 'start' };
      },
    };
  }

  window.JourneyOnePlan = {
    take: function (text) {
      return matches(text) ? createPlan() : null;
    },
  };
}());
