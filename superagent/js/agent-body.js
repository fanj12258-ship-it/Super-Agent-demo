/**
 * Agent turn BODY mock — quiet DS draft
 * Structure-first · sparse color (~30% of prior accents) · real typography ladder
 * Exposes: window.AgentBody.run({ host, sleep, speed, scroll })
 */
(function () {
  'use strict';

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var FTI = window.FileTypeIcons;
  function fileIcon(name, size) {
    if (FTI) return FTI.markup(name, size || 16);
    return '';
  }

  /* ── markdown: h1–h4 · p · ul/ol · table · code · cite ── */

  function inline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/==(.+?)==/g, '<mark class="rt-chg">$1</mark>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
        var icon = fileIcon(href, 14);
        if (!icon) {
          icon =
            '<svg class="chat-cite-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.4h5.1L12 5.3v8.3H4V2.4Z" stroke="currentColor" stroke-width="1.2"/><path d="M9.1 2.4V5.4H12" stroke="currentColor" stroke-width="1.2"/></svg>';
        }
        return (
          '<a class="chat-cite" href="' + esc(href) + '">' + icon +
          '<span>' + esc(label) + '</span></a>'
        );
      });
  }

  function md(src) {
    var lines = src.replace(/\r\n/g, '\n').split('\n');
    var out = [];
    var i = 0;
    while (i < lines.length) {
      var t = lines[i].trim();
      if (!t) { i++; continue; }
      if (t.indexOf('#### ') === 0) { out.push('<h4>' + inline(t.slice(5)) + '</h4>'); i++; continue; }
      if (t.indexOf('### ') === 0) { out.push('<h3>' + inline(t.slice(4)) + '</h3>'); i++; continue; }
      if (t.indexOf('## ') === 0) { out.push('<h2>' + inline(t.slice(3)) + '</h2>'); i++; continue; }
      if (t.indexOf('# ') === 0) { out.push('<h1>' + inline(t.slice(2)) + '</h1>'); i++; continue; }
      if (t.indexOf('```') === 0) {
        i++;
        var code = [];
        while (i < lines.length && lines[i].trim().indexOf('```') !== 0) { code.push(lines[i]); i++; }
        if (i < lines.length) i++;
        out.push('<pre class="chat-md-pre"><code>' + esc(code.join('\n')) + '</code></pre>');
        continue;
      }
      if (t.charAt(0) === '|' && t.charAt(t.length - 1) === '|') {
        var rows = [];
        while (i < lines.length && lines[i].trim().charAt(0) === '|') { rows.push(lines[i].trim()); i++; }
        if (rows.length >= 2) {
          var cells = function (r) {
            return r.replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
          };
          var head = cells(rows[0]);
          out.push('<div class="chat-md-table-wrap"><table class="chat-md-table"><thead><tr>');
          head.forEach(function (c) { out.push('<th>' + inline(c) + '</th>'); });
          out.push('</tr></thead><tbody>');
          rows.slice(2).forEach(function (r) {
            out.push('<tr>');
            cells(r).forEach(function (c) { out.push('<td>' + inline(c) + '</td>'); });
            out.push('</tr>');
          });
          out.push('</tbody></table></div>');
        }
        continue;
      }
      if (/^\d+\.\s/.test(t)) {
        out.push('<ol class="chat-md-ol">');
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          var item = lines[i].trim().replace(/^\d+\.\s*/, '');
          i++;
          var nested = [];
          while (i < lines.length && lines[i].trim().indexOf('- ') === 0) {
            nested.push(lines[i].trim().slice(2));
            i++;
          }
          var html = inline(item);
          if (nested.length) {
            html += '<ul class="chat-md-ul">' + nested.map(function (n) { return '<li>' + inline(n) + '</li>'; }).join('') + '</ul>';
          }
          out.push('<li>' + html + '</li>');
        }
        out.push('</ol>');
        continue;
      }
      if (t.indexOf('- ') === 0) {
        var lis = [];
        while (i < lines.length && lines[i].trim().indexOf('- ') === 0) {
          lis.push(lines[i].trim().slice(2));
          i++;
        }
        var refs = lis.every(function (x) { return /^\[[^\]]+\]\([^)]+\)$/.test(x); });
        out.push('<ul class="chat-md-ul' + (refs ? ' is-refs' : '') + '">' +
          lis.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ul>');
        continue;
      }
      var para = [t];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        lines[i].trim().charAt(0) !== '#' &&
        lines[i].trim().charAt(0) !== '|' &&
        lines[i].trim().indexOf('```') !== 0 &&
        !/^\d+\.\s/.test(lines[i].trim()) &&
        lines[i].trim().indexOf('- ') !== 0
      ) {
        para.push(lines[i].trim());
        i++;
      }
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }
    return '<div class="chat-md">' + out.join('\n') + '</div>';
  }

  /* ── content (practical for building a sales-allocation Agent) ── */

  var INTRO =
    '可以。我们把它做成一个**销售分货 Agent**：读库存 / 门店销量 / 规则，自动给出分货方案，并解释为什么这么分。\n\n' +
    '建议先做 MVP —— 跑通「读数 → 打分 → 分货 → 解释」，再加策略切换和系统对接。';

  var GOALS =
    '## 交付目标\n\n' +
    '| 目标 | 结果 | Agent 交付 |\n' +
    '|---|---|---|\n' +
    '| 公平 / 保底 | 核心门店不断货 | 保底量清单 + 封顶校验 |\n' +
    '| 冲销量 | 爆品向高潜门店倾斜 | 门店权重 + 倾斜说明 |\n' +
    '| 清库存 | 滞销 SKU 尽快消化 | 清仓优先级 + 未满足原因 |';

  var MVP =
    '## MVP 能力\n\n' +
    '1. **读取数据**\n' +
    '   - 库存、箱规、可分配量\n' +
    '   - 门店等级、近 30 天销量、在途库存\n' +
    '   - 规则：保底 / 封顶 / 禁配\n' +
    '2. **生成分货方案**\n' +
    '   - 按潜力、紧急度、库存压力打分\n' +
    '   - 支持公平、优先、保底、爆品倾斜\n' +
    '3. **输出解释**\n' +
    '   - 每个 SKU 分给谁、分多少、为什么\n' +
    '   - 未满足需求及原因\n' +
    '4. **人工可调**\n' +
    '   - 切换策略、锁定门店或 SKU、重算';

  var FLOW =
    '## Agent 流程\n\n' +
    '```text\n' +
    '上传库存 / 销售 / 门店 / 规则表\n' +
    '        ↓\n' +
    '清洗字段 · 识别缺口\n' +
    '        ↓\n' +
    '缺口 = 目标库存 − 当前库存 − 在途\n' +
    '        ↓\n' +
    '门店打分 → 按策略分货 → 箱规取整\n' +
    '        ↓\n' +
    '输出《分货建议表》+ 异常提醒\n' +
    '```';

  var FORMULA =
    '## 核心权重\n\n' +
    '```text\n' +
    '门店权重 = 近30天销量×0.4 + 门店等级×0.25 + 售罄率×0.2 + 活动×0.15\n' +
    '\n' +
    '建议分货量 = 可分配库存 × 门店权重 ÷ Σ有缺口门店权重\n' +
    '           → 按箱规取整 → 不超封顶 · 不低于保底\n' +
    '```';

  var NEXT =
    '### 需要确认\n\n' +
    '分货对象是 **总部 → 门店**，还是 **仓库 → 经销商**？确认后我可以把系统指令、字段模板和 Skill 拆到可直接开工。\n\n' +
    '样例材料：\n\n' +
    '- [销售分货 Agent MVP](sales-allocation-agent/README.md)\n' +
    '- [分货建议表](sales-allocation-agent/results/allocation_result.csv)';

  var FILES = [
    { path: 'outputs/sales_allocation_agent/README.md', added: 78 },
    { path: 'outputs/sales_allocation_agent/src/allocate.py', added: 266 },
    { path: 'outputs/sales_allocation_agent/examples/inventory.csv', added: 4 },
    { path: 'outputs/sales_allocation_agent/examples/rules.csv', added: 19 },
    { path: 'outputs/sales_allocation_agent/examples/sales.csv', added: 19 },
    { path: 'outputs/sales_allocation_agent/templates/inventory.csv', added: 2 },
    { path: 'outputs/sales_allocation_agent/run_agent.sh', added: 24 },
  ];

  var STEPS = [
    { t: '锁定分货对象', d: '总部给门店，还是仓库给经销商——数据表和责任人都不同。', a: '写下「分完之后看起来像什么」' },
    { t: '对齐数据入口', d: '先 Excel 上传，还是接 ERP / WMS——决定第一版能不能自动跑。', a: '列出必须接入的 1–2 个系统' },
    { t: '定义策略与约束', d: '选定默认策略，并写清保底 / 封顶 / 禁配。', a: '选定唯一默认策略' },
    { t: '推进闭环', d: '收成角色 → 任务 → 能力 → Skill，挂到 AgentOS 场景。', a: '在场景洞察里继续拆解' },
  ];

  function fileChanges(FILES) {
    var total = FILES.reduce(function (s, f) { return s + f.added; }, 0);
    var box = el('div', 'ao-fc');
    box.innerHTML =
      '<button type="button" class="ao-fc-head" aria-expanded="false">' +
      '<span class="ao-fc-title">已编辑 ' + FILES.length + ' 个文件</span>' +
      '<span class="ao-fc-sum"><b>+' + total + '</b><em>−0</em></span>' +
      '<span class="ao-fc-toggle">查看<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>' +
      '</button>' +
      '<div class="ao-fc-list" hidden>' +
      FILES.map(function (f) {
        var name = f.path.split('/').pop();
        var dir = f.path.slice(0, f.path.length - name.length);
        return (
          '<div class="ao-fc-row">' +
          fileIcon(name, 16) +
          '<span class="ao-fc-path"><span class="d">' + esc(dir) + '</span>' + esc(name) + '</span>' +
          '<span class="ao-fc-stat"><b>+' + f.added + '</b></span></div>'
        );
      }).join('') +
      '</div>';
    var head = box.querySelector('.ao-fc-head');
    var list = box.querySelector('.ao-fc-list');
    var toggle = box.querySelector('.ao-fc-toggle');
    head.addEventListener('click', function () {
      var open = list.hasAttribute('hidden');
      if (open) list.removeAttribute('hidden');
      else list.setAttribute('hidden', '');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.childNodes[0].textContent = open ? '收起' : '查看';
      head.classList.toggle('is-open', open);
    });
    return box;
  }

  function fourSteps(STEPS) {
    var box = el('div', 'ao-steps');
    box.innerHTML =
      '<div class="ao-steps-head"><h3>下一步 · 四步法</h3><p>把口头任务收成可执行链路</p></div>' +
      '<ol class="ao-steps-list"></ol>';
    var list = box.querySelector('.ao-steps-list');
    STEPS.forEach(function (s, i) {
      var li = el('li', 'ao-step');
      li.innerHTML =
        '<span class="ao-step-num">' + (i + 1) + '</span>' +
        '<div class="ao-step-main">' +
        '<div class="ao-step-t">' + esc(s.t) + '</div>' +
        '<p class="ao-step-d">' + esc(s.d) + '</p>' +
        '<p class="ao-step-a">' + esc(s.a) + '</p></div>';
      list.appendChild(li);
    });
    return box;
  }

  async function run(ctx) {
    var host = ctx.host;
    host.classList.add('ao-body');
    host.innerHTML = '';
    var sp = ctx.speed || 1;

    function add(node, gap) {
      var seg = el('div', 'ao-seg stream-enter');
      seg.appendChild(node);
      host.appendChild(seg);
      if (ctx.scroll) ctx.scroll();
      return ctx.sleep((gap || 280) * sp);
    }
    function mdNode(s) {
      var d = el('div');
      d.innerHTML = md(s);
      return d.firstChild;
    }

    host.hidden = false;
    var segs = ctx.segments || DEFAULT_SEGMENTS;
    for (var k = 0; k < segs.length; k++) {
      var s = segs[k];
      if (s.md) await add(mdNode(s.md), s.gap || 360);
      else if (s.files) await add(fileChanges(s.files), s.gap || 300);
      else if (s.steps) await add(fourSteps(s.steps), s.gap || 280);
    }
  }

  var DEFAULT_SEGMENTS = [
    { md: INTRO, gap: 320 },
    { md: GOALS, gap: 380 },
    { md: MVP, gap: 380 },
    { md: FLOW },
    { md: FORMULA },
    { md: NEXT, gap: 340 },
    { files: FILES },
    { steps: STEPS },
  ];

  /* Shared DS kit: journeys pass their own `segments`:
   [{md:'…'}, {files:[{path,added}]}, {steps:[{t,d,a}]}] */
  window.AgentBody = { run: run, md: md, defaultSegments: DEFAULT_SEGMENTS };
})();
