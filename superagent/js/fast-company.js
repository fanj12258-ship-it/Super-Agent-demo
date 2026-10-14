/**
 * Fast POC page ONLY — the "Side" route: explore the enterprise first (content is simulated, not live web data).
 *
 *   Space → "我想先了解一下我的企业"      → Agent asks which company
 *   Space → "大疆创新（DJI）…"            → Agent researches public info, writes the folder
 *                                            Files · Deliverables · 大疆创新 全景画像分析/ (4 docs) + short summary
 *   Space → "哪些环节最适合用 Agent？"    → Agent proposes 3 scenarios as checkboxes
 *   「创建所选场景」                       → 2–3 scene cards in Scenarios (WorkshopCreateScene.fromChatMulti)
 *                                            → user enters the same T1 as the Main route and continues there.
 *
 *   FastCompany.active() / prompt() / take() / stop()  — same contract as FastIntake (js/fast-intake.js)
 */
(function () {
  'use strict';
  var idx = 0, off = false, started = false;
  var FOLDER = '大疆创新 全景画像分析';

  function div(cls) { var n = document.createElement('div'); if (cls) n.className = cls; return n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ───────── the four documents (simulated, public-information style) ───────── */
  var NOTE = '> 说明：以下为演示用的模拟整理，口径参考公开信息；内部系统、数据与流程无法从公开渠道获知，相关判断已标注「推断」，需要你确认。\n\n';
  var DOCS = [
    { name: '企业全景画像.md', note: '一页看懂这家企业：定位、产品线、规模与发展阶段', md:
'# 大疆创新 · 企业全景画像\n\n' + NOTE +
'| 项目 | 内容 |\n|---|---|\n' +
'| 企业 | 深圳市大疆创新科技有限公司（DJI Innovations） |\n' +
'| 成立 | 2006 年，总部深圳 |\n' +
'| 定位 | 全球消费级无人机与影像设备领先者，同时覆盖行业应用与农业 |\n' +
'| 发展阶段 | 成熟期：多产品线并行，全球化销售与服务 |\n\n' +
'## 产品线\n\n' +
'| 板块 | 代表产品 | 主要客户 |\n|---|---|---|\n' +
'| 消费级航拍 | Mini · Air · Mavic 系列 | 个人创作者、旅行与运动爱好者 |\n' +
'| 手持影像 | Osmo 系列、Pocket 系列 | 内容创作者、Vlog 用户 |\n' +
'| 专业影像 | Ronin 云台、Inspire 系列、Zenmuse 相机 | 影视制作团队 |\n' +
'| 行业应用 | Matrice 系列、Dock 无人机场 | 电力、安防、测绘、应急 |\n' +
'| 农业 | Agras 农业无人机 | 植保服务商、农场 |\n' +
'| 其他 | 机器人教育（RoboMaster）、便携储能 | 教育机构、户外用户 |\n\n' +
'## 一句话概括\n\n' +
'以 **硬件创新 + 软件体验** 为核心，把产品从消费级一路做到行业级；产品线多、迭代快、供应链长，是它管理上最大的特点。\n' },
    { name: '业务模式分析.md', note: '怎么赚钱：产品、渠道、服务与客户结构', md:
'# 大疆创新 · 业务模式分析\n\n' + NOTE +
'## 收入来源\n\n' +
'| 来源 | 说明 | 特点 |\n|---|---|---|\n' +
'| 硬件销售 | 无人机、手持影像、云台等整机 | 主要收入，新品周期驱动 |\n' +
'| 配件与耗材 | 电池、桨叶、滤镜、存储等 | 与整机保有量挂钩，毛利较好 |\n' +
'| 服务与保障 | 随心换（Care Refresh）、维修、延保 | 提升复购与客户黏性 |\n' +
'| 行业解决方案 | 无人机 + 软件平台 + 部署服务 | 客单价高，周期长（推断） |\n\n' +
'## 渠道结构\n\n' +
'- **官方线上商城**：新品首发和主要自营渠道。\n' +
'- **线下体验店与授权零售**：重点城市体验与服务。\n' +
'- **经销商与行业集成商**：覆盖行业与农业客户。\n' +
'- **第三方电商平台**：补充覆盖。\n\n' +
'## 竞争壁垒\n\n' +
'1. 垂直整合：飞控、云台、图传、相机自研，体验一致。\n' +
'2. 研发投入大、迭代快，新品节奏稳定。\n' +
'3. 品牌与生态：配件、App、社区形成使用惯性。\n\n' +
'## 关键挑战\n\n' +
'- 产品型号多，计划、采购、库存的复杂度高（推断）。\n' +
'- 不同国家和地区的合规与供应链要求不同。\n' +
'- 新品爬坡期的品质与交付稳定性。\n' },
    { name: '组织与产业链.md', note: '组织怎么分工，上游供应链和下游服务怎么连', md:
'# 大疆创新 · 组织与产业链\n\n' + NOTE +
'## 组织结构（根据公开信息整理）\n\n' +
'| 板块 | 主要职责 |\n|---|---|\n' +
'| 研发 | 飞控、算法、结构、影像、软件，按产品线分组 |\n' +
'| 产品与市场 | 产品定义、品牌、全球市场与内容运营 |\n' +
'| 供应链与制造 | 采购、品质、生产计划、制造与物流 |\n' +
'| 销售与服务 | 渠道管理、客户服务、售后维修 |\n' +
'| 职能 | 财务、法务合规、人力、IT |\n\n' +
'## 产业链\n\n' +
'| 环节 | 内容 | 关注点 |\n|---|---|---|\n' +
'| 上游 | 芯片、传感器、电池电芯、电机、镜头、结构件 | 供应稳定、品质一致、成本 |\n' +
'| 中游 | 自研设计 + 自有与合作工厂制造 | 产能爬坡、良率、交期 |\n' +
'| 下游 | 线上线下渠道、售后与维修网络 | 库存、服务响应、客户体验 |\n\n' +
'## 观察\n\n' +
'- 电子元器件与结构件种类多、供应商数量大，**采购与准入的管理工作量集中**（推断）。\n' +
'- 研发项目并行多，里程碑与风险需要持续盯。\n' +
'- 售后网络覆盖全球，工单量大、类型杂。\n' },
    { name: '数字化现状与机会点.md', note: '数字化基础判断，以及适合引入 Agent 的环节', md:
'# 大疆创新 · 数字化现状与机会点\n\n' + NOTE +
'## 数字化现状（推断）\n\n' +
'| 领域 | 判断 | 依据 |\n|---|---|---|\n' +
'| 研发 | 工具链成熟，协同依赖项目管理系统 | 研发岗位与技术栈公开描述 |\n' +
'| 供应链 | 以 ERP 为核心，供应商、报价、准入资料分散在多处 | 采购与品质岗位职责 |\n' +
'| 售后 | 有工单与知识库，分派与答复仍需人工把关 | 服务网络规模 |\n\n' +
'## 适合 Agent 的环节\n\n' +
'| 环节 | 现状痛点 | 数据基础 | 落地难度 | 优先级 |\n|---|---|---|---|---|\n' +
'| 供应商寻源与准入 | 新品导入时筛选与比价耗时，依据分散 | 好：ERP 报价、准入标准、合同 | 低 | **高** |\n' +
'| 研发项目风险预警 | 里程碑延期往往发现得晚 | 中：项目计划与周报 | 中 | 中 |\n' +
'| 售后工单智能分派 | 工单类型杂，分派靠经验 | 中：历史工单、知识库 | 中 | 中 |\n\n' +
'## 建议\n\n' +
'先从 **供应商寻源与准入** 开始：数据最完整、使用者明确、效果容易验证；跑通后，同一套方法可以复制到另外两个环节。\n' },
  ];

  function registerDocs() {
    if (!window.FastDocs) return;
    DOCS.forEach(function (d) {
      window.FastDocs.register({ kind: 'md', deliverable: true, folder: FOLDER, name: d.name, note: d.note,
        size: '3 KB', pages: '2 页', updated: '今天', author: 'AgentOS · 公开信息整理', md: d.md });
    });
  }

  /* ───────── scenario proposals (checkbox card) ───────── */
  var SCENES = [
    { id: 'a1', title: 'A1 Supplier intelligent sourcing & admission', why: '数据最完整（ERP 报价、准入标准），使用者明确，最容易先跑通', rec: true },
    { id: 'a2', title: 'A2 R&D project risk early warning', why: '研发项目并行多，里程碑延期需要更早发现' },
    { id: 'a3', title: 'A3 After-sales ticket intelligent dispatch', why: '售后工单量大、类型杂，分派和答复可以更快' },
  ];

  function sceneCard() {
    var on = {};
    SCENES.forEach(function (s) { on[s.id] = true; });
    var box = div('ff-card fc-card');
    box.innerHTML =
      '<div class="ff-head"><span class="ff-t">选择要创建的场景</span><span class="ff-h">已全部预选，可取消</span></div>' +
      '<div class="fc-list">' + SCENES.map(function (s) {
        return '<button type="button" class="fc-row is-on" data-id="' + s.id + '">' +
          '<span class="fc-check" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.3L5 8.8l4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
          '<span class="fc-main"><span class="fc-t">' + esc(s.title) + (s.rec ? '<span class="fm-opt-tag">推荐</span>' : '') + '</span>' +
          '<span class="fc-d">' + esc(s.why) + '</span></span></button>';
      }).join('') + '</div>' +
      '<div class="ff-foot"><button type="button" class="fm-btn is-primary" data-act="create"></button>' +
      '<button type="button" class="fm-btn" data-act="skip">先不建</button></div>';
    var go = box.querySelector('[data-act="create"]');
    function sync() {
      var n = SCENES.filter(function (s) { return on[s.id]; }).length;
      go.textContent = '创建所选场景（' + n + '）';
      go.disabled = !n;
    }
    sync();
    var done;
    var picked = new Promise(function (r) { done = r; });
    box.addEventListener('click', function (e) {
      var row = e.target.closest('.fc-row');
      if (row) {
        var id = row.getAttribute('data-id');
        on[id] = !on[id];
        row.classList.toggle('is-on', on[id]);
        sync();
        return;
      }
      var act = e.target.closest('[data-act]');
      if (!act || box.classList.contains('is-done')) return;
      box.classList.add('is-done');
      act.classList.add('is-picked');
      done({ act: act.getAttribute('data-act'), ids: SCENES.filter(function (s) { return on[s.id]; }).map(function (s) { return s.id; }) });
    });
    return { node: box, picked: picked };
  }

  async function askScenes(c) {
    var card = sceneCard();
    var seg = div('ao-seg stream-enter');
    seg.appendChild(card.node);
    c.host.appendChild(seg);
    c.scroll();
    var r = await card.picked;
    await c.sleep(420);
    var part = div();
    c.host.appendChild(part);
    if (r.act === 'create' && r.ids.length) {
      await c.run(part, [{ md: '好，我把这 ' + r.ids.length + ' 个场景建出来，并同步到左侧。', gap: 360 }]);
      setTimeout(function () { window.WorkshopCreateScene.fromChatMulti(r.ids); }, 700);
      return { skipFooter: true };
    }
    await c.run(part, [{ md: '好的，先不建。三个方向都记在「数字化现状与机会点」里了，你想好了随时告诉我，或者接着聊你最关心的环节。', gap: 360 }]);
    return null;
  }

  /* ───────── script ───────── */
  var STEPS = [
    {
      prompt: '我想先了解一下我自己的企业。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('用户想先了解企业，我需要先确认具体是哪一家。');
          await api.sleep(300);
          await api.V({ id: 'co1', icon: 'search', label: '已检索工作区', details: ['当前工作区：DJI Innovations', 'Files：暂无企业资料', 'Scenarios：暂无'] });
          await api.sleep(400);
        },
        segments: [{ md:
          '好的，我可以从公开信息里把你的企业梳理一遍，形成一份全景画像。\n\n' +
          '先确认一下：**你想了解哪家企业？** 给我企业全称或官网都可以。当前工作区是 **DJI Innovations**，如果就是它，直接告诉我即可。', gap: 340 }],
      },
    },
    {
      prompt: '就是我们公司，大疆创新（DJI）。',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('确认对象：大疆创新。先从公开渠道收集信息，再按四个维度整理。');
          await api.sleep(350);
          await api.V({ id: 'co2', icon: 'search', label: '已检索公开信息 · 官网与产品线', details: ['企业简介与发展历程', '消费级 / 专业影像 / 行业 / 农业 五大板块', '主要产品系列与目标客户'] });
          await api.sleep(320);
          await api.V({ id: 'co3', icon: 'search', label: '已检索公开信息 · 新闻与行业分析', details: ['近年新品发布节奏', '渠道与服务网络', '行业报告中的竞争格局'] });
          await api.sleep(320);
          await api.V({ id: 'co4', icon: 'search', label: '已检索公开信息 · 招聘与技术栈', details: ['研发、供应链、售后岗位职责', '推断：内部系统以 ERP 与项目管理为主'] });
          await api.sleep(420);
          await api.W('信息够了，整理成四份文档，放进交付物。');
          registerDocs();
          for (var i = 0; i < DOCS.length; i++) {
            await api.sleep(520);
            if (window.FastFiles) window.FastFiles.addDeliverable(FOLDER + '/' + DOCS[i].name);
          }
          await api.sleep(260);
          await api.V({ id: 'co5', icon: 'context', label: '已生成文件夹 · ' + FOLDER, details: DOCS.map(function (d) { return d.name; }) });
          await api.sleep(400);
        },
        segments: [{ md:
          '我把大疆创新梳理好了，放在 Files 的 **Deliverables / ' + FOLDER + '** 里，一共四份：\n\n' +
          DOCS.map(function (d) { return '- [' + d.name.replace(/\.md$/, '') + '](' + d.name + ')：' + d.note + '\n'; }).join('') + '\n' +
          '**一句话总结**：大疆是「硬件创新 + 软件体验」驱动的多产品线企业，产品型号多、供应链长、售后网络大，管理复杂度主要集中在 **采购与准入、研发项目、售后工单** 三处。\n\n' +
          '提醒：这版来自公开信息的模拟整理，内部流程我看不到，标了「推断」的部分请你确认。', gap: 340 }],
      },
    },
    {
      prompt: '这些里面，哪些环节最适合用 Agent 来做？',
      plan: {
        process: async function (api) {
          await api.sleep(400);
          await api.W('回看刚才的机会点，按「价值高、数据基础好、能快速验证」来筛。');
          await api.sleep(300);
          await api.V({ id: 'co6', icon: 'context', label: '已回看 4 份文档', details: ['数字化现状与机会点', '组织与产业链', '业务模式分析'] });
          await api.sleep(320);
          await api.V({ id: 'co7', icon: 'search', label: '已评估候选场景', details: ['供应商寻源与准入：数据好、难度低', '研发项目风险预警：数据中等', '售后工单智能分派：数据中等'] });
          await api.sleep(400);
        },
        segments: [{ md:
          '按 **价值高 + 数据基础好 + 一个月内能跑通** 筛了一遍，我建议从下面三个场景里选。第一个最推荐：采购这块的数据最全，使用者也最明确，跑通后另外两个可以照着复制。\n\n' +
          '勾选你想建成场景卡的，我来创建：', gap: 340 }],
        after: askScenes,
      },
    },
  ];

  window.FastCompany = {
    active: function () {
      var CV = window.FastConversations;
      if (off || !(CV && CV.isPre && CV.isPre())) return false;
      return started || (window.FastRoute && window.FastRoute.get() === 'side');
    },
    prompt: function () { return STEPS[Math.min(idx, STEPS.length - 1)].prompt; },
    take: function () { started = true; var p = STEPS[Math.min(idx, STEPS.length - 1)].plan; if (idx < STEPS.length) idx++; return p; },
    stop: function () { off = true; },
    scenes: SCENES,
  };
})();
