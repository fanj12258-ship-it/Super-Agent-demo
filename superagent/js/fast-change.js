/**
 * Shared demo: customer feedback → related docs / ontology / skill / agent follow.
 * Used by:
 *   · superagent.html (returning) — mode "building": ontology mid-build, Skill/Agent still to-do
 *   · superagent-fast.html — mode "ready": after Agent v0.1 is generated; Space fills the user side
 *
 *   FastChange.setMode('building'|'ready')
 *   FastChange.available()  → Space should offer this story
 *   FastChange.prompt()     → fill composer + attach notes chip
 *   FastChange.match(text)  → whether send should run this plan
 *   FastChange.plan()       → { process, segments, after }
 *   FastChange.install(CV)  → wrap FastConversations.prompt / .reply (returning page)
 */
(function () {
  'use strict';

  var NOTES = 'Customer feedback notes-1012.md';
  var MSG = '我跟客户聊了一下，有一些修改，上传了沟通纪要，你看看哪些内容要跟着改。';
  var NOTES_MD =
    '# 客户沟通纪要（10/12）\n\n' +
    '| 项目 | 内容 |\n|---|---|\n| 时间 | 10 月 12 日 |\n| 参与 | 采购总监、品质经理、IT 对接人 |\n| 议题 | 对寻源策略 Agent 方案的反馈 |\n\n' +
    '## 反馈要点\n\n' +
    '1. **物料范围**：除电子元器件、结构件外，增加 **包装材料**（纸箱、缓冲件），先覆盖寻源和比价。\n' +
    '2. **评分权重**：交期更关键，希望调整为 **质量 40 · 交期 35 · 价格 15 · 稳定性 10**。\n' +
    '3. **报价口径**：比价要按 **含运费的到手价**，在含税、折算 CNY 的基础上再加运费。\n' +
    '4. **例外供应商**：Ruifeng 缺 ISO 9001，**补齐证书前不进入候选池**；Kaisheng、Mingda 照旧按例外标记。\n' +
    '5. **评审摘要**：需要附上 **证书有效期**，方便品质部复核。\n\n' +
    '## 待客户补充\n\n- ERP 报价导出里的运费字段，由 IT 对接人确认口径。\n';

  var mode = 'ready';          // 'building' | 'ready'
  var changeState = 'idle';     // idle → running → done
  var originals = {};
  var uploaded = false;

  var EDITS = {
    'Product plan v0.1.md': [
      ['| 主要用户 | 电子物料采购经理、结构件采购工程师 |', '| 主要用户 | 电子物料采购经理、结构件采购工程师、==包装材料采购== |'],
      ['| 质量 | 45 |', '| 质量 | ==40== |'],
      ['| 交期 | 30 |', '| 交期 | ==35== |'],
      ['| 价格 | 15 | ERP 最近有效报价（合同价作参考） |', '| 价格 | 15 | ERP 最近有效报价（合同价作参考），==到手价含运费== |'],
      ['- 例外供应商（Kaisheng、Mingda）保留在清单中，推荐时显式标记。', '- 例外供应商（Kaisheng、Mingda）保留在清单中，推荐时显式标记。\n- ==Ruifeng 缺 ISO 9001，补齐证书前不进入候选池。=='],
      ['质量 45 · 交期 30 · 价格 15 · 稳定性 10', '质量 ==40== · 交期 ==35== · 价格 15 · 稳定性 10'],
    ],
    'Ontology plan v0.1.md': [
      ['| Part 料号 | 物料及所属品类 |', '| Part 料号 | 物料及所属品类（电子、结构件、==包装材料==） |'],
      ['category（electronic / structural）', 'category（electronic / structural / ==packaging==）'],
      ['tax_rate · valid_until · moq |', 'tax_rate · valid_until · moq · ==freight== |'],
      ['lead_time_weeks |', 'lead_time_weeks · ==cert_valid_until== |'],
      ['- Contract 的年降条款是文本，需要结构化后才能参与比价。', '- Contract 的年降条款是文本，需要结构化后才能参与比价。\n- ==Ruifeng 缺 ISO 9001：状态记为 exception，证书补齐前不进入候选池。=='],
    ],
    'Agent plan v0.1.md': [
      ['| screen-suppliers | 按硬性条件筛选候选供应商 |', '| screen-suppliers | 按硬性条件筛选候选供应商（==新增包装材料品类；缺证书者不入池==） |'],
      ['| compare-quotes | 整理报价并换算后比价 |', '| compare-quotes | 整理报价并换算后比价，==到手价含运费== |'],
      ['| score-suppliers | 按权重打分排序，附分项依据 |', '| score-suppliers | 按权重（==质量 40 · 交期 35 · 价格 15 · 稳定性 10==）打分排序，附分项依据 |'],
      ['- 比价表：供应商 · 单价 · 交期 · 得分 · 风险标记', '- 比价表：供应商 · 单价 · ==运费== · 交期 · 得分 · 风险标记'],
      ['5. 用户要求时，生成评审摘要草稿', '5. 用户要求时，生成评审摘要草稿，==附证书有效期=='],
    ],
  };
  var PLAN_DOCS = Object.keys(EDITS);
  var ST = { chg: '已修改', same: '无需改动', todo: '待办' };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function ledgerGroups() {
    var base = [
      { layer: '需求', items: [
        { st: 'chg', name: '需求要点', note: '新增 3 条：物料范围含包装材料、比价含运费、证书有效期' } ] },
      { layer: '资料', items: [
        { st: 'chg', name: '客户沟通纪要（新）', note: '已读取并索引', doc: NOTES, view: '打开' },
        { st: 'same', name: '历史合同 × 3', note: '不涉及本次变化' },
        { st: 'same', name: '准入标准 × 2', note: '现行标准不变；证书要求已写进 Agent 方案' },
        { st: 'same', name: '流程与访谈记录 × 3', note: '不涉及本次变化' },
        { st: 'todo', name: 'ERP 报价导出', note: '没有运费字段，需业务补充，已记入待办' } ] },
      { layer: '方案文档', items: [
        { st: 'chg', name: 'Product plan v0.1', note: '评分权重、到手价含运费、包装材料用户、Ruifeng 不入池', doc: 'Product plan v0.1.md', view: '查看差异', undo: 1 },
        { st: 'chg', name: 'Ontology plan v0.1', note: 'Part 增加包装品类；Quote 增加运费；Supplier 增加证书有效期', doc: 'Ontology plan v0.1.md', view: '查看差异', undo: 1 },
        { st: 'chg', name: 'Agent plan v0.1', note: '筛选、比价、打分口径同步；输出增加运费与证书有效期', doc: 'Agent plan v0.1.md', view: '查看差异', undo: 1 } ] },
    ];
    if (mode === 'ready') {
      base.push(
        { layer: '本体', items: [
          { st: 'chg', name: '本体（已生成）', note: '包装品类、运费、证书有效期已写入本体桩' } ] },
        { layer: 'Skill · MCP', items: [
          { st: 'chg', name: 'Skill × 3', note: '筛选、比价、打分规则已按新需求更新' },
          { st: 'chg', name: 'MCP · ERP', note: '连接口径已要求带运费字段；样例数据仍缺运费，记入待办' } ] },
        { layer: 'Agent', items: [
          { st: 'chg', name: 'Sourcing Strategy Agent v0.1', note: '筛选、比价、打分与评审摘要已同步；右侧可再试用' } ] }
      );
    } else {
      base.push(
        { layer: '本体', items: [
          { st: 'chg', name: '本体（构建中）', note: '新增的品类和属性已带入正在构建的对象' } ] },
        { layer: 'Skill · MCP', items: [
          { st: 'todo', name: 'Skill', note: '尚未生成，已记入待办：新权重、包装品类、证书校验' },
          { st: 'todo', name: 'MCP', note: '尚未生成，已记入待办：ERP 连接要带运费字段' } ] },
        { layer: 'Agent', items: [
          { st: 'todo', name: 'Agent', note: '尚未生成，生成时直接按新需求做' } ] }
      );
    }
    return base;
  }

  function registerNotes() {
    if (!window.FastDocs || window.FastDocs.find(NOTES)) return;
    window.FastDocs.register({
      kind: 'md', folder: 'Process & notes', name: NOTES, size: '2 KB', pages: '1 页', updated: '今天', author: '客户沟通',
      note: '客户对方案的 5 条反馈', md: NOTES_MD,
    });
  }

  function markRows(name, on) {
    [].forEach.call(document.querySelectorAll('#fast-deliverables .file[data-doc]'), function (r) {
      if (r.getAttribute('data-doc') === name) r.classList.toggle('rt-upd', on);
    });
  }

  function updateDoc(name) {
    var FD = window.FastDocs, d = FD && FD.find(name); if (!d) return;
    if (!(name in originals)) originals[name] = d.md;
    var m = d.md, hit = 0;
    EDITS[name].forEach(function (e) {
      if (m.indexOf(e[0]) >= 0) { m = m.split(e[0]).join(e[1]); hit++; }
    });
    var i = m.indexOf('\n\n');
    m = m.slice(0, i) + '\n\n**本次更新（10/12）**：已根据 [客户沟通纪要](' + NOTES + ') 更新 ' + hit + ' 处，修改处已高亮。' + m.slice(i);
    FD.setMd(name, m);
    markRows(name, true);
  }

  function undoChange() {
    PLAN_DOCS.forEach(function (n) {
      if (originals[n] != null) window.FastDocs.setMd(n, originals[n]);
      markRows(n, false);
    });
    originals = {};
    var BP = window.FastBlueprint;
    if (!BP) return;
    if (mode === 'ready') {
      BP.set('req', 'done', 'Defined');
      BP.set('know', 'done', 'Indexed');
      BP.set('doc', 'done', 'Confirmed');
      BP.set('onto', 'done', 'Generated');
      BP.set('skill', 'done', 'Generated');
      BP.set('agent', 'done', 'Ready');
    } else {
      BP.set('req', 'done', 'Defined');
      BP.set('know', 'done', 'Indexed');
      BP.set('doc', 'done', 'Confirmed');
      BP.set('onto', 'doing', 'Building');
    }
  }

  function ledgerCard() {
    var LEDGER = ledgerGroups();
    var all = []; LEDGER.forEach(function (g) { g.items.forEach(function (i) { all.push(i); }); });
    var n = { chg: 0, same: 0, todo: 0 }; all.forEach(function (i) { n[i.st]++; });
    var box = document.createElement('div');
    box.className = 'rt-ledger';
    box.innerHTML =
      '<div class="rt-lt">核对清单 · 共 ' + all.length + ' 项，已全部核对：已修改 ' + n.chg + '，无需改动 ' + n.same + '，待办 ' + n.todo + '</div>' +
      '<table class="rt-tbl"><thead><tr><th>内容</th><th>结果</th><th>说明</th></tr></thead><tbody>' +
      all.map(function (i) {
        return '<tr class="s-' + i.st + (i.undo ? ' is-undoable' : '') + '"><td>' + esc(i.name) + '</td><td class="rt-st">' + ST[i.st] + '</td><td>' + esc(i.note) +
          (i.doc ? ' <a href="#" data-rt-doc="' + esc(i.doc) + '">' + esc(i.view) + '</a>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<div class="rt-foot"><a href="#" data-rt-undo>撤销方案文档的修改</a><span class="rt-foot-h">撤销后 3 份方案恢复到修改之前，其他项不受影响</span></div>';
    box.addEventListener('click', function (e) {
      var v = e.target.closest('[data-rt-doc]');
      if (v) e.preventDefault();
      if (v && window.FastDocs) {
        window.FastDocs.open(v.getAttribute('data-rt-doc'));
        setTimeout(function () {
          var m = document.querySelector('.fd-pane:not([hidden]) mark.rt-chg');
          if (m && m.scrollIntoView) m.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 150);
        return;
      }
      var u = e.target.closest('[data-rt-undo]');
      if (u) e.preventDefault();
      if (u && !box.classList.contains('is-undone')) {
        undoChange();
        box.classList.add('is-undone');
        box.querySelectorAll('.is-undoable .rt-st').forEach(function (c) {
          c.textContent = '已撤销';
          var a = c.parentNode.querySelector('[data-rt-doc]');
          if (a) a.remove();
        });
        u.remove();
        box.querySelector('.rt-foot-h').textContent = '3 份方案已恢复到修改之前；沟通纪要保留在资料里';
      }
    });
    return box;
  }

  function closingMd(nTodo) {
    if (mode === 'ready') {
      return 'Agent 相关的改动已经同步进去了。还差的 **' + nTodo + ' 项**（主要是 ERP 运费字段）我会记着，不需要你再提醒。修改过的地方在文档里已经高亮，点「查看差异」就能看到；不想要这些改动，也可以在清单下方撤销。';
    }
    return '待办的 ' + nTodo + ' 项我会在后面的步骤里按新需求做，不需要你再提醒。修改过的地方在文档里已经高亮，点「查看差异」就能看到；如果不想要这些改动，也可以在清单下方撤销。';
  }

  function changePlan() {
    changeState = 'running';
    var FF = window.FastFiles, BP = window.FastBlueprint;
    var groups = ledgerGroups();
    var nTodo = 0;
    groups.forEach(function (g) { g.items.forEach(function (i) { if (i.st === 'todo') nTodo++; }); });

    return {
      process: async function (api) {
        await api.sleep(400);
        await api.W('先读取你上传的沟通纪要，把要点提出来。');
        if (FF) FF.addMaterial('Process & notes/' + NOTES);
        await api.sleep(300);
        await api.V({ id: 'ch1', icon: 'knowledge', label: '已读取并索引 · ' + NOTES, details: ['提取出 5 条反馈', '物料范围 · 评分权重 · 报价口径 · 例外供应商 · 评审摘要'] });
        if (BP) { BP.set('req', 'done', 'Updated'); BP.set('know', 'done', 'Updated'); }
        await api.sleep(350);
        await api.W('这 5 条会牵动不少地方。我把需求、资料、方案文档、本体、Skill、MCP、Agent 逐项核对一遍，免得漏掉。');
        await api.sleep(350);
        var scanDetails = mode === 'ready'
          ? ['方案文档、本体、Skill、MCP、Agent 需要同步', '3 项资料不受影响', '1 项待办：ERP 运费字段缺数据']
          : ['6 项需要修改', '3 项不受影响，已逐项记下原因', '4 项待办：对应内容尚未生成，或缺数据'];
        await api.V({ id: 'ch2', icon: 'search', label: '已逐项核对 13 项相关内容', details: scanDetails });
        await api.sleep(300);
        await api.W('开始从上游往下游改。');
        await api.sleep(250);
        updateDoc('Product plan v0.1.md');
        if (BP) BP.set('doc', 'done', 'Updated');
        await api.V({ id: 'ch3', icon: 'edit', label: '已更新 · Product plan v0.1', details: ['评分权重改为 40 / 35 / 15 / 10', '到手价含运费；包装材料采购加入使用者', 'Ruifeng 补齐证书前不入候选池'] });
        await api.sleep(250);
        if (BP) BP.set('onto', mode === 'ready' ? 'done' : 'doing', mode === 'ready' ? 'Updated' : 'Syncing');
        updateDoc('Ontology plan v0.1.md');
        await api.V({ id: 'ch4', icon: 'edit', label: '已更新 · Ontology plan v0.1', details: ['Part 增加品类 packaging', 'Quote 增加 freight；Supplier 增加 cert_valid_until', 'Ruifeng 状态记为 exception'] });
        await api.sleep(250);
        updateDoc('Agent plan v0.1.md');
        await api.V({ id: 'ch5', icon: 'edit', label: '已更新 · Agent plan v0.1', details: ['3 个 Skill 的口径同步', '比价表增加运费，评审摘要附证书有效期'] });
        await api.sleep(250);
        if (mode === 'ready') {
          if (BP) { BP.set('skill', 'done', 'Updated'); BP.set('agent', 'done', 'Updated'); }
          await api.V({ id: 'ch6', icon: 'ontology', label: '已同步 · 本体 · Skill · Agent', details: ['本体桩带入新品类与属性', 'Skill 规则按新权重与证书校验更新', 'Agent v0.1 已按新口径可试用'] });
        } else {
          if (BP) BP.set('onto', 'doing', 'Building');
          await api.V({ id: 'ch6', icon: 'ontology', label: '已同步 · 正在构建的本体', details: ['新增品类与属性已带入对象'] });
        }
        await api.sleep(400);
        changeState = 'done';
      },
      segments: [{ md:
        '已根据 [客户沟通纪要](' + NOTES + ') 把相关内容全部核对并同步了一遍。这次有 **5 条变化**：\n\n' +
        '| # | 变化 | 影响到 |\n|---|---|---|\n' +
        '| 1 | 物料范围新增 **包装材料** | 需求、产品方案、本体、Skill |\n' +
        '| 2 | 评分权重改为 质量 40 · 交期 35 · 价格 15 · 稳定性 10 | 产品方案、Agent 方案、Skill |\n' +
        '| 3 | 比价按 **含运费的到手价** | 本体、Agent 方案、ERP 连接 |\n' +
        '| 4 | Ruifeng 缺 ISO 9001，补齐前不入候选池 | 产品方案、本体、Skill |\n' +
        '| 5 | 评审摘要附证书有效期 | Agent 方案 |\n\n' +
        '下面是完整的核对清单，每一项都列了，包括没有改动的：', gap: 340 }],
      after: async function (c) {
        var seg = document.createElement('div');
        seg.className = 'ao-seg stream-enter';
        seg.appendChild(ledgerCard());
        c.host.appendChild(seg);
        c.scroll();
        await c.sleep(420);
        var part = document.createElement('div');
        c.host.appendChild(part);
        await c.run(part, [{ md: closingMd(nTodo), gap: 360 }]);
        return null;
      },
    };
  }

  function available() {
    if (changeState !== 'idle') return false;
    if (mode === 'building') return true;
    var SB = window.FastSandbox;
    if (!(SB && SB.state && SB.state.generated)) return false;
    if (window.FastJourney && window.FastJourney.active()) return false;
    return true;
  }

  function prompt() {
    registerNotes();
    if (!uploaded && window.FastUpload) {
      uploaded = true;
      window.FastUpload.add(NOTES);
    }
    return MSG;
  }

  function match(text) {
    return changeState === 'idle' && /客户/.test(text) && /修改|改/.test(text);
  }

  function install(CV) {
    if (!CV) return;
    var origPrompt = CV.prompt;
    var origReply = CV.reply;
    CV.prompt = function () {
      if (!available()) return origPrompt ? origPrompt() : null;
      return prompt();
    };
    CV.reply = function (text) {
      if (match(text)) return changePlan();
      return origReply ? origReply(text) : null;
    };
  }

  window.FastChange = {
    setMode: function (m) { mode = m === 'building' ? 'building' : 'ready'; },
    available: available,
    prompt: prompt,
    match: match,
    plan: changePlan,
    install: install,
  };
})();
