/** Local demo workflow: diagnose → approve → revise documents and answer rules → preview. */
(function () {
  'use strict';
  var sequence = 0;
  function card(c, title, description, buttons) {
    var box = document.createElement('div'); box.className = 'ff-card ff-ready';
    var head = document.createElement('div'); head.className = 'ff-head';
    var label = document.createElement('span'); label.className = 'ff-t'; label.textContent = title;
    head.appendChild(label); box.appendChild(head);
    var detail = document.createElement('div'); detail.className = 'ff-ready-s'; detail.textContent = description; box.appendChild(detail);
    var foot = document.createElement('div'); foot.className = 'ff-foot';
    buttons.forEach(function (action, i) {
      var button = document.createElement('button'); button.type = 'button';
      button.className = 'fm-btn' + (i === 0 ? ' is-primary' : ''); button.textContent = action.label;
      button.addEventListener('click', function () { action.run(box, button); }); foot.appendChild(button);
    });
    box.appendChild(foot); c.host.appendChild(box); c.scroll(); return box;
  }
  function disable(box) { box.querySelectorAll('button').forEach(function (b) { b.disabled = true; }); }
  function plan(text) {
    if (text.indexOf('请诊断以下 Sourcing Strategy Agent v0.1 会话') === -1) return null;
    var questions = text.match(/用户：([^\n]+)/g) || [];
    var question = questions.length ? questions[questions.length - 1].slice(3) : '诊断当前会话';
    var key = /pcb/i.test(question) ? 'pcb' : /jinli|对比/i.test(question) ? 'cmp' : /haoyu|气孔|压铸/i.test(question) ? 'haoyu' : 'other';
    var note = key === 'pcb'
      ? '先执行准入筛选，再评分与比价。Xinyue 未通过准入，不能作为可采购候补；仅进入待审核清单。Rongxin 的火灾风险需确认恢复与双源证据。报价来源为样例，ISO、产能与恢复证明未核验，采购前须人工确认。'
      : key === 'haoyu'
      ? '质量异常不能仅按发生次数判断。要求 8D 与质量证据；Shengda 未准入且交期超限，仅可申请例外审核，审批前不得执行替换或采购。'
      : key === 'cmp'
      ? '不同品类与料号不得直接比价。分开披露评分、交期与质量依据，列出缺失证据；样例评分不能替代真实评估，也不能作为采购批准。'
      : '超出能力范围时说明缺少的品类、料号和数据，不推断候选供应商；将问题登记为待补能力，保留 Mock 和人工确认边界。';
    var changes = [
      ['SDP', 'Product plan v0.1.md', '补充准入优先、证据披露和人工确认的验收标准'],
      ['SDP', 'Ontology plan v0.1.md', '明确准入状态、缺失证据、例外审批与风险关系'],
      ['SDP', 'Agent plan v0.1.md', '调整筛选、评分与推荐顺序，添加异常分支及回归用例'],
      ['Agent', 'Agent spec v0.1.md', '同步回答规则、工具约束和 Mock 边界']
    ];
    var id = ++sequence, state = 'pending', repaired = false;
    return {
      process: async function (api) {
        await api.W('先核对试用会话中的问题、工具记录和回答，不修改 Agent。');
        await api.V({ id: 'diagnosis-' + id, icon: 'command', label: '已分析会话与修改范围', details: [question, '披露 SDP 与 Agent 文件改动，等待确认'] });
      },
      segments: [{ md: '**诊断分析**\n\n针对「' + question + '」：\n\n' + note + '\n\n**拟修改文件**\n\n| 范围 | 文件 | 计划改动 |\n|---|---|---|\n' + changes.map(function (x) { return '| ' + x.join(' | ') + ' |'; }).join('\n') + '\n\n另新增诊断报告与回归记录。ERP 数据仍为 Mock；本次不接入真实 ERP，也不将缺失证据标为已验证。', gap: 200 }],
      after: async function (c) {
        card(c, '是否按这个计划执行修复？', '确认后更新上述 SDP 和 Agent 文件；现在尚未执行改动。', [
          { label: '允许，执行修复', run: async function (box, button) {
            if (state !== 'pending') return;
            state = 'running'; disable(box); button.textContent = '正在修复…';
            while (window.FastChat.isBusy()) await new Promise(function (resolve) { setTimeout(resolve, 100); });
            try {
              await window.FastChat.run(repairPlan()); state = repaired ? 'done' : 'failed'; button.textContent = repaired ? '修复已完成' : '修复失败，请重新诊断';
            } catch (error) { state = 'failed'; button.textContent = '修复失败'; }
          } },
          { label: '暂不执行', run: function (box, button) { if (state !== 'pending') return; state = 'cancelled'; disable(box); button.textContent = '已取消，未修改'; } }
        ]);
      }
    };
    function repairPlan() {
      var report = 'Diagnosis report ' + id + '.md', regression = 'Regression checks ' + id + '.md';
      return {
        process: async function (api) {
          await api.W('你已允许执行，开始更新 SDP 与 Agent 回答规则。');
          changes.forEach(function (change) { if (!window.FastDocs.find(change[1])) throw new Error('Missing document: ' + change[1]); });
          for (var i = 0; i < changes.length; i++) {
            var change = changes[i], doc = window.FastDocs.find(change[1]);
            if (!doc) throw new Error('Missing document: ' + change[1]);
            window.FastDocs.append(change[1], '\n\n## 诊断修订 ' + id + '\n\n' + change[2] + '。\n\n' + note);
            await api.V({ id: 'repair-' + id + '-' + i, icon: 'edit', label: '已更新 ' + change[0] + ' · ' + change[1], details: [change[2]] });
          }
          window.FastAgentPanel.repair(key, note);
          [[report, '# 诊断报告\n\n问题：' + question + '\n\n' + note + '\n\n' + changes.map(function (x) { return '- ' + x[0] + '/' + x[1] + '：' + x[2]; }).join('\n')],
            [regression, '# 回归记录\n\n- SDP 与 Agent spec 已同步修订。\n- 对应问题的回答规则已更新。\n- ERP 样例与未验证证据继续披露。\n- 原问题待 Preview 复测；尚未验证真实 ERP 或模型执行。']].forEach(function (entry) {
            window.FastDocs.register({ name: entry[0], folder: 'Diagnosis', kind: 'md', deliverable: true, md: entry[1] });
            window.FastFiles.addDeliverable('Diagnosis/' + entry[0]);
          });
          await api.V({ id: 'repair-check-' + id, icon: 'command', label: '已同步修复文档与回答规则', details: ['保留全部 Mock 标注', '待 Preview 回放原问题'] });
          repaired = true;
        },
        segments: [{ md: '**修复完成**\n\n' + changes.map(function (x) { return '- **' + x[0] + '**：[' + x[1] + '](' + encodeURIComponent(x[1]) + ') — ' + x[2]; }).join('\n') + '\n\n本次修复：' + note + '\n\n产物：[诊断报告](' + encodeURIComponent(report) + ') · [回归记录](' + encodeURIComponent(regression) + ')。\n\n修复已应用于当前演示会话的文档与 Agent 回答；原问题等待 Preview 复测。', gap: 200 }],
        after: async function (c) {
          card(c, '要一键 Preview 这个 Agent 吗？', '在右侧重新运行原问题，查看修复后的回答。', [
            { label: '一键 Preview Agent', run: function (box, button) { disable(box); button.textContent = '已打开 Preview'; window.FastAgentPanel.preview(question, key); } },
            { label: '稍后再试', run: function (box, button) { disable(box); button.textContent = '稍后再试'; } }
          ]);
        }
      };
    }
  }
  window.FastDiagnosis = { plan: plan };
})();
