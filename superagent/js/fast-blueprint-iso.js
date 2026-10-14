/**
 * Fast POC page ONLY — isometric layer diagram for the in-scene blueprint.
 *   - compact stack (patterns, no leaders) inside the left sidebar  (#bp-iso)
 *   - expanded big view (labels + flowing dots) inside the centre chat area
 *   - hover / click linkage between plates, short labels and the rows (.bp-node)
 * Reads state from the rows' data-state / .bp-st text, so FastBlueprint.set() keeps working unchanged.
 *   FastBlueprintIso.render()  FastBlueprintIso.open()  FastBlueprintIso.close()
 */
(function () {
  'use strict';
  var host = document.getElementById('bp-iso');
  var bp = document.getElementById('fast-bp');
  var chatMain = document.getElementById('chat-main');
  if (!host || !bp) return;

  var K = 0.36, A = 0.9;
  // one shared <pattern> for "mock" plates (hatched fill) — referenced from CSS as url(#bpi-hatch)
  if (!document.getElementById('bpi-defs')) {
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    defs.id = 'bpi-defs'; defs.setAttribute('width', '0'); defs.setAttribute('height', '0'); defs.setAttribute('aria-hidden', 'true');
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    defs.innerHTML = '<defs>' +
      '<pattern id="bpi-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#e4e4e8" stroke-width="1"/></pattern>' +
      '<pattern id="bpi-hatch-mock" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#c5ddd0" stroke-width="1.1"/></pattern>' +
      '</defs>';
    document.body.appendChild(defs);
  }
  var last = {};      // id -> last rendered state (so state changes animate)
  var pinned = null;
  var isOpen = false;

  /* ---------- state from rows ---------- */
  function row(id) { return bp.querySelector('.bp-diagram [data-node="' + id + '"]'); }
  function rowState(id) { var n = row(id); return n ? n.getAttribute('data-state') : 'todo'; }
  function rowText(id) { var n = row(id), s = n && n.querySelector('.bp-st'); return s ? s.textContent : ''; }
  function stOf(id) { return { s: rowState(id), t: rowText(id) }; }
  function plateOf(rowId) { return rowId === 'skill' ? 'tools' : rowId; }

  /* ---------- svg helpers ---------- */
  function topPts(cx, cy, s) {
    var w = A * s, h = K * s;
    return cx + ',' + (cy - h) + ' ' + (cx + w) + ',' + cy + ' ' + cx + ',' + (cy + h) + ' ' + (cx - w) + ',' + cy;
  }
  function pattern(kind) {
    var g = '';
    if (kind === 'req') {
      g += '<circle class="bpi-s" r="38"/><circle class="bpi-s" r="26"/><circle class="bpi-f" r="14"/><circle class="bpi-acc bpi-d" r="4"/>';
      g += '<path class="bpi-s" d="M-48 0H-40M40 0H48M0 -48V-40M0 40V48"/>';
    } else if (kind === 'know') {
      var xs = [-33, -9, 15];
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) g += '<rect class="bpi-f" x="' + xs[j] + '" y="' + xs[i] + '" width="18" height="18" rx="3"/>';
      g += '<circle class="bpi-acc bpi-d" cx="24" cy="-24" r="3.5"/>';
    } else if (kind === 'doc') {
      g += '<rect class="bpi-f" x="-32" y="-36" width="38" height="8" rx="2"/>';
      [[-20, 64], [-8, 54], [4, 64], [16, 46], [28, 30]].forEach(function (l) {
        g += '<rect class="bpi-s" x="-32" y="' + l[0] + '" width="' + l[1] + '" height="5" rx="2"/>';
      });
      g += '<circle class="bpi-acc bpi-d" cx="30" cy="-32" r="3.5"/>';
    } else if (kind === 'ext') {
      g += '<g class="bpi-half ' + rowState('onto') + '"><rect class="bpi-s" x="-46" y="-30" width="42" height="60" rx="6"/>' +
        '<path class="bpi-s" d="M-34 -14L-22 6M-22 6L-34 18M-22 6L-10 -10"/>' +
        '<circle class="bpi-f" cx="-34" cy="-14" r="5"/><circle class="bpi-f" cx="-22" cy="6" r="5"/><circle class="bpi-f" cx="-34" cy="18" r="5"/><circle class="bpi-f" cx="-10" cy="-10" r="5"/></g>';
      g += '<g class="bpi-half ' + rowState('skill') + '"><rect class="bpi-s" x="4" y="-30" width="42" height="60" rx="6"/>' +
        '<rect class="bpi-f" x="12" y="-20" width="26" height="9" rx="2.5"/><rect class="bpi-f" x="12" y="-5" width="26" height="9" rx="2.5"/><rect class="bpi-f" x="12" y="10" width="26" height="9" rx="2.5"/></g>';
    } else if (kind === 'onto') {
      var N2 = [[-34, -22], [0, -34], [32, -14], [-18, 8], [16, 20], [-38, 30], [40, 34]];
      [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [3, 5], [4, 6], [1, 3]].forEach(function (l) { g += '<path class="bpi-s" d="M' + N2[l[0]][0] + ' ' + N2[l[0]][1] + 'L' + N2[l[1]][0] + ' ' + N2[l[1]][1] + '"/>'; });
      N2.forEach(function (p) { g += '<circle class="bpi-f" cx="' + p[0] + '" cy="' + p[1] + '" r="6.5"/>'; });
      g += '<circle class="bpi-acc bpi-d" cx="32" cy="-14" r="3.2"/>';
    } else if (kind === 'skillp') {
      [-24, -8, 8].forEach(function (y) { g += '<rect class="bpi-f" x="-31" y="' + y + '" width="62" height="11" rx="3"/>'; });
      g += '<path class="bpi-s" d="M-10 28L2 12L8 20L20 4"/><circle class="bpi-acc bpi-d" cx="26" cy="-30" r="3.5"/>';
    } else if (kind === 'mcp') {
      g += '<rect class="bpi-f" x="-40" y="-14" width="26" height="28" rx="5"/><rect class="bpi-f" x="14" y="-14" width="26" height="28" rx="5"/>';
      g += '<path class="bpi-s" d="M-14 0H14"/><circle class="bpi-f" r="5"/><path class="bpi-s" d="M-30 -22V-14M-22 -22V-14M22 -22V-14M30 -22V-14M-30 14V22M-22 14V22M22 14V22M30 14V22"/><circle class="bpi-acc bpi-d" r="2.2"/>';
    } else if (kind === 'res') {
      g += '<rect class="bpi-s" x="-26" y="-34" width="48" height="36" rx="5"/><rect class="bpi-s" x="-34" y="-22" width="48" height="36" rx="5"/><rect class="bpi-f" x="-42" y="-8" width="48" height="36" rx="5"/>';
      g += '<path class="bpi-s" d="M-34 4H-6M-34 14H-18"/><circle class="bpi-acc bpi-d" cx="30" cy="26" r="3.5"/>';
    } else if (kind === 'agent') {
      g += '<path class="bpi-s" d="M-36 -32L0 0L36 -32M-36 32L0 0L36 32"/>';
      g += '<circle class="bpi-s" r="26"/><circle class="bpi-f" r="12"/><circle class="bpi-acc bpi-d" r="3.6"/>';
      [[-36, -32], [36, -32], [-36, 32], [36, 32]].forEach(function (p) { g += '<circle class="bpi-f" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/>'; });
    }
    return g;
  }
  function plate(o) {
    var w = A * o.s, h = K * o.s, u = o.s / 100, cx = o.cx, cy = o.cy, t = o.t;
    var top = topPts(cx, cy, o.s);
    var left = (cx - w) + ',' + cy + ' ' + cx + ',' + (cy + h) + ' ' + cx + ',' + (cy + h + t) + ' ' + (cx - w) + ',' + (cy + t);
    var right = (cx + w) + ',' + cy + ' ' + cx + ',' + (cy + h) + ' ' + cx + ',' + (cy + h + t) + ' ' + (cx + w) + ',' + (cy + t);
    var m = 'matrix(' + A * u + ',' + K * u + ',' + -A * u + ',' + K * u + ',' + cx + ',' + cy + ')';
    return '<g class="bpi-plate st-' + o.state + (o.big ? ' is-big' : '') + '" data-pid="' + o.id + '">' +
      '<polygon class="bpi-ground" points="' + top + '"/><g class="bpi-lift">' +
      '<polygon class="bpi-sl" points="' + left + '"/><polygon class="bpi-sr" points="' + right + '"/>' +
      '<polygon class="bpi-top-f" points="' + top + '"/>' +
      '<g class="bpi-pat" transform="' + m + '">' + pattern(o.pat) + '</g></g></g>';
  }
  /* ---------- vertical process map (sidebar): order + structure of the eight steps ---------- */
  var VST = [
    { id: 'req',   data: 'req',   items: ['req'],                  steps: 'STEP 1',    title: 'Requirements' },
    { id: 'know',  data: 'know',  items: ['know'],                 steps: 'STEP 2',    title: 'Business knowledge' },
    { id: 'doc',   data: 'doc',   items: ['doc', 'onto', 'agent'], steps: 'STEPS 3–5', title: 'Design plans', subs: ['Product plan', 'Ontology plan', 'Agent plan'] },
    { id: 'onto',  data: 'onto',  items: ['onto'],                 steps: 'STEP 6',    title: 'Build ontology' },
    { id: 'tools', data: 'skill', items: ['skillp', 'mcp', 'res'], steps: 'STEP 7',    title: 'Skills · MCP · more', subs: ['Skills', 'MCP', 'Resources'] },
    { id: 'agent', data: 'agent', items: ['agent'],                steps: 'STEP 8',    title: 'Generate Agent' }
  ];
  /* sidebar (live) map: the document behind each stage, shown next to its plate */
  var VDOCS = {
    req: ['Requirements brief', 'Success criteria'],
    know: ['Contracts · rules', 'Process notes', 'ERP export'],
    onto: ['Data source spec', 'Semantic graph'],
    agent: ['Agent spec', 'Mock register']
  };
  var VSUBDOC = { doc: ['Product plan', 'Ontology plan', 'Agent plan'], tools: ['Skill specs', 'MCP specs', 'Resource list'] };
  /* after "转入按流程打造": each document gets a small mark = how the quick version maps onto the real step */
  var MAPST = {
    'Requirements brief': 'keep', 'Success criteria': 'new', 'Contracts · rules': 'keep', 'Process notes': 'keep', 'ERP export': 'check',
    'Product plan': 'check', 'Ontology plan': 'check', 'Agent plan': 'check', 'Data source spec': 'mock', 'Semantic graph': 'mock',
    'Skill specs': 'mock', 'MCP specs': 'mock', 'Resource list': 'new', 'Agent spec': 'mock'
  };
  var MAPLB = { keep: '沿用', check: '需校对', mock: 'Mock 需改', 'new': '需再创作' };
  function showMap() { var SB = window.FastSandbox; return !!(SB && SB.state.generated && SB.state.phase === 'hardening'); }
  function mapDot(name, W, y) {
    var k = MAPST[name]; if (!k || !showMap()) return '';
    return '<g class="bpi-map bpi-map-' + k + '"><title>' + name + ' · ' + MAPLB[k] + '</title><circle cx="' + (W - 8) + '" cy="' + (y - 3.5) + '" r="3"/></g>';
  }
  function docIco(x, y, tone) {
    return '<path class="bpi-v-dico' + (tone ? ' ' + tone : '') + '" d="M' + x + ' ' + (y - 8) + ' h4.5 l2.5 2.5 v6.5 h-7 z M' + (x + 4.5) + ' ' + (y - 8) + ' v2.5 h2.5"/>';
  }
  function vState(sg) { var s = rowState(sg.data); return s === 'optional' ? 'todo' : s; } // todo | doing | done | mock
  function vWord(sg, state) {
    var FALL = { todo: 'Todo', doing: 'Doing', done: 'Done', mock: 'Mock', imported: 'Imported' };
    var t = rowText(sg.data);
    if (t && t.length <= 10) return t;          // keep short custom labels (Defined / Indexed …)
    return FALL[state] || t || state;
  }
  function tri(x, y0, c) { return '<polygon points="' + (x - 3.5) + ',' + (y0 - 6) + ' ' + x + ',' + y0 + ' ' + (x + 3.5) + ',' + (y0 - 6) + '" fill="' + c + '"/>'; }
  function renderVert(target, fixedW, opt) {
    target = target || host;
    opt = opt || {};
    var stat = !!opt.stat;
    var big = target !== host;
    var W = fixedW || target.clientWidth; if (!W) return;
    var s = 38, w = A * s, h = K * s, t = 4, P = 28, cx = 6 + w, lx = cx + w + 14;
    function layout(gap) {
      var y = 10, lay = [];
      VST.forEach(function (sg) {
        var single = sg.items.length === 1, top = y, nd = (!stat && single && VDOCS[sg.id]) ? VDOCS[sg.id].length : 0, hgt = single ? 40 + (nd ? nd * 13 + 2 : 0) : 110;
        lay.push({
          sg: sg, top: top, hgt: hgt, state: stat ? 'done' : vState(sg),
          cys: sg.items.map(function (_, k) { return single ? top + 20 : top + 34 + k * P; })
        });
        y += hgt + (single ? 4 : 6) + gap;
      });
      return { lay: lay, H: Math.round(y + 4 - gap) };
    }
    var L0 = layout(0);
    if (opt.fillH && opt.fillH > L0.H) L0 = layout(Math.min(40, (opt.fillH - L0.H) / (VST.length - 1))); // spread the stages over the card height
    var lay = L0.lay, H = L0.H, VH = opt.fillH ? Math.max(opt.fillH, H) : H, off = Math.round((VH - H) / 2);
    var svg = '<svg class="bpi-v' + (big ? ' is-big' : '') + '" viewBox="0 0 ' + W + ' ' + VH + '"' + (big ? '' : ' width="' + W + '" height="' + H + '"') + '><g transform="translate(0 ' + off + ')">';
    // links between stages (behind plates)
    for (var i = 0; i < lay.length - 1; i++) {
      var a = lay[i], b = lay[i + 1], lit = a.state === 'done', col = lit ? '#8f8f97' : '#c9c9ce';
      var y0 = a.cys[a.cys.length - 1] + h + t - 1, y1 = b.cys[0] - h, d = 'M' + cx + ' ' + y0 + ' V' + y1;
      svg += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width=".75"/>' + tri(cx, y1, col);
      if (lit) svg += '<circle r="2" fill="#22a05a"><animateMotion dur="1.8s" begin="-' + (i * 0.3 + 0.1).toFixed(1) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    }
    // plates — start in the previous state so a change animates (flipped next frame)
    lay.forEach(function (L) {
      for (var k = L.sg.items.length - 1; k >= 0; k--) {
        svg += plate({ id: L.sg.id, cx: cx, cy: L.cys[k], s: s, t: t, state: big ? L.state : (last[L.sg.id] || L.state), pat: L.sg.items[k] });
      }
    });
    // labels: title first, status as a trailing tag (no STEP N); done = blue, doing = pulsing
    lay.forEach(function (L) {
      var sg = L.sg, dim = L.state === 'todo', mock = L.state === 'mock', tone = dim ? 'dim' : (mock ? 'mock' : ''), ty = L.top + 15, avail = W - lx - 4;
      var word = stat ? '' : vWord(sg, L.state), tw = word ? word.length * 5.6 + 10 : 0;
      var maxT = Math.max(36, avail - (tw ? tw + 6 : 0)), title = sg.title.length * 6.7 > maxT ? sg.title.slice(0, Math.max(4, Math.floor(maxT / 6.7) - 1)) + '…' : sg.title;
      var tW = title.length * 6.7;
      svg += '<text class="bpi-v-ttl' + (dim ? ' dim' : '') + '" x="' + lx + '" y="' + ty + '">' + title + '</text>';
      if (word) {
        var tx = Math.min(lx + tW + 6, Math.max(lx, W - tw - 2));
        svg += '<rect class="bpi-v-tag bpi-s-' + L.state + '" x="' + tx + '" y="' + (ty - 11) + '" width="' + tw + '" height="15" rx="4"/>' +
          '<text class="bpi-v-tag-t bpi-s-' + L.state + '" x="' + (tx + tw / 2) + '" y="' + (ty - 0.5) + '" text-anchor="middle">' + word + '</text>';
      }
      if (!stat && VSUBDOC[sg.id]) VSUBDOC[sg.id].forEach(function (sub, k) { svg += docIco(lx, L.cys[k] + 4, tone) + '<text class="bpi-v-doc' + (tone ? ' ' + tone : '') + '" x="' + (lx + 11) + '" y="' + (L.cys[k] + 4) + '">' + sub + '</text>' + mapDot(sub, W, L.cys[k] + 4); });
      else if (sg.subs) sg.subs.forEach(function (sub, k) { svg += '<text class="bpi-v-sub" x="' + lx + '" y="' + (L.cys[k] + 4) + '">' + sub + '</text>'; });
      if (!stat && VDOCS[sg.id]) VDOCS[sg.id].forEach(function (d, k) { var yy = L.top + 30 + k * 13; svg += docIco(lx, yy, tone) + '<text class="bpi-v-doc' + (tone ? ' ' + tone : '') + '" x="' + (lx + 11) + '" y="' + yy + '">' + d + '</text>' + mapDot(d, W, yy); });
    });
    // hit areas last, so hover / click work anywhere in a stage
    if (!stat) lay.forEach(function (L) {
      svg += '<rect class="bpi-vhit" data-pid="' + L.sg.id + '" x="0" y="' + (L.top - 2) + '" width="' + W + '" height="' + (L.hgt + 4) + '" rx="8"/>';
    });
    if (!big) lay.forEach(function (L) { if (last[L.sg.id] === undefined) last[L.sg.id] = L.state; });
    target.innerHTML = svg + '</g></svg>';
    if (!big) renderFoot(lay);
    return stat ? target.innerHTML : lay;
  }

  /* ---------- footer inside the Blueprint card: progress · current focus · legend ---------- */
  var footEl = document.getElementById('bp-foot');
  /* next-step guidance under the map — clear "what to do now", no secondary action button */
  var NEXT = {
    req: '当前阶段：分析讨论你的需求',
    know: '当前阶段：挖掘业务场景的知识',
    doc: '当前阶段：产出初步的设计方案',
    onto: '当前阶段：打造本体建设',
    tools: '当前阶段：装配 Skill、MCP 等零部件',
    agent: '当前阶段：开始生成 Agent',
  };
  /* alternates shown when the user hits Skip — first entry is always the real current stage */
  var ALT = {
    req: ['建议：先补充一个具体的业务场景和目标', '建议：说说现有流程里最耗时的环节'],
    know: ['建议：上传历史报价单或合同样例', '建议：补充准入标准、评分口径等规则'],
    doc: ['建议：先确认关键决策，再看设计方案', '建议：核对方案里的数据来源是否齐全'],
    onto: ['建议：检查对象与关系是否覆盖核心业务', '建议：为关键属性补充真实样例'],
    tools: ['建议：优先接入 ERP 数据源', '建议：先从比价 Skill 开始装配'],
    agent: ['建议：先试用这版 Agent，哪里不够再补', '建议：用历史案例回测一遍'],
    sand: ['建议：先替换最关键的 Mock', '建议：在右侧试用 Agent，确认效果'],
    hard: ['建议：优先替换影响结论的 Mock', '建议：补齐上线门槛里缺的验证项']
  };
  var skipKey = '', skipN = 0, lastLay = null;
  function pick(key, base) {
    if (key !== skipKey) { skipKey = key; skipN = 0; }
    var pool = [base].concat(ALT[key] || []);
    return { text: pool[skipN % pool.length], alt: skipN % pool.length > 0, can: pool.length > 1 };
  }
  function skipBtn(on) { return on ? '<button type="button" class="bp-skip" data-bp-skip>Skip<svg viewBox="0 0 12 12" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 2.5 7.5 6 4 9.5"/></svg></button>' : ''; }
  function docsOf(id) { return VDOCS[id] || VSUBDOC[id] || []; }
  function renderFoot(lay) {
    if (!footEl || !lay) return;
    lastLay = lay;
    var total = lay.length;
    var n = lay.filter(function (L) { return L.state === 'done' || L.state === 'imported'; }).length;
    var m = lay.filter(function (L) { return L.state === 'mock'; }).length;
    var SB = window.FastSandbox, st = SB && SB.state;
    var focusHtml = '', cls = '';
    if (st && st.generated) {
      var left = SB.mocksLeft(), tip, hint;
      if (st.phase === 'production') { tip = '已发布 v1.0 · 正式环境'; hint = '可在右侧试用正式 Agent，或打开 Sandbox 查看清单'; cls = 'prod'; }
      else if (st.phase === 'hardening') { tip = '当前阶段：清零 Mock，完成上线门槛'; hint = '加固中 · 还剩 ' + left + ' 处 Mock'; cls = 'hard'; }
      else { tip = 'Agent 已可试用：试用后告诉我哪里要改'; hint = left + ' 处 Mock 待替换'; cls = 'sand'; }
      var pk = st.phase === 'production' ? null : pick(st.phase === 'hardening' ? 'hard' : 'sand', tip);
      focusHtml =
        '<div class="bp-focus ' + cls + (pk && pk.alt ? ' is-alt' : '') + '"><div class="bp-focus-h"><b>' + (pk ? pk.text : tip) + '</b></div>' +
        '<div class="bp-focus-sub">' + hint + '</div>' + skipBtn(pk && pk.can) + '</div>';
    } else {
      var nx = lay.filter(function (L) { return L.state === 'todo' || L.state === 'doing'; })[0];
      if (nx) {
        var id = nx.sg.id, docs = docsOf(id);
        var docBits = docs.length
          ? '<div class="bp-focus-docs">' + docs.map(function (d) { return '<span class="bp-focus-doc">' + d + '</span>'; }).join('') + '</div>'
          : '';
        var pk2 = pick(id, NEXT[id]);
        focusHtml =
          '<div class="bp-focus' + (pk2.alt ? ' is-alt' : '') + '"><div class="bp-focus-h"><b>' + pk2.text + '</b></div>' +
          '<div class="bp-focus-sub">' + nx.sg.title + (docs.length ? ' · 本步相关 ' + docs.length + ' 份文档' : '') + '</div>' +
          docBits + skipBtn(pk2.can) + '</div>';
      } else {
        focusHtml = '<div class="bp-focus prod"><div class="bp-focus-h"><b>全部步骤已完成</b></div></div>';
      }
    }
    footEl.innerHTML =
      '<div class="bp-prog"><span>Progress</span><b>' + n + ' / ' + total + (m ? ' <em>· ' + m + ' Mock</em>' : '') + '</b></div>' +
      '<div class="bp-bar"><i class="d" style="width:' + (n / total * 100).toFixed(1) + '%"></i><i class="m" style="width:' + (m / total * 100).toFixed(1) + '%"></i></div>' +
      focusHtml +
      (showMap() ? '<div class="bp-legend bp-maplg"><span><i class="mk keep"></i>沿用</span><span><i class="mk check"></i>需校对</span><span><i class="mk mock"></i>Mock 需改</span><span><i class="mk new"></i>需再创作</span></div>' : '') +
      '<div class="bp-legend"><span><i class="lg done"></i>Done</span><span><i class="lg mock"></i>Mock</span><span><i class="lg imp"></i>Imported</span><span><i class="lg todo"></i>To do</span></div>';
  }
  if (footEl) footEl.addEventListener('click', function (e) {
    if (!e.target.closest('[data-bp-skip]')) return;
    skipN++; renderFoot(lastLay);
  });
  document.addEventListener('fastsandbox', function () { renderSide(); applyMarks(); });

  /* ---------- big view (centre): the two horizontal mode diagrams (Fast / Steps) from js/fast-flowmap.js ---------- */
  var ov = null, bigBody = null;
  function ensureOverlay() {
    if (ov || !chatMain) return;
    ov = document.createElement('div');
    ov.className = 'bpi-overlay';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML =
      '<div class="bpi-ov-head"><span class="bpi-ov-title" id="bpi-ov-title"></span>' +
      '<span class="bpi-ov-hint">Esc to close</span>' +
      '<button type="button" class="bpi-btn" id="bpi-ov-close" aria-label="Close">✕</button></div>' +
      '<div class="bpi-body" id="bpi-body"></div>';
    chatMain.appendChild(ov);
    bigBody = ov.querySelector('#bpi-body');
    ov.querySelector('#bpi-ov-close').addEventListener('click', close);
  }
  function renderBig() {
    if (!isOpen || !bigBody || !window.FastFlowMap) return;
    var keep = bigBody.scrollTop;
    bigBody.innerHTML = window.FastFlowMap.full({ kit: kit });
    bigBody.scrollTop = keep;
  }
  function open(o) {
    ensureOverlay(); if (!ov) return;
    var tt = document.getElementById('bp-title');
    ov.querySelector('#bpi-ov-title').textContent = 'Blueprint · ' + (tt ? tt.textContent : '');
    isOpen = true;
    ov.classList.add('is-open'); ov.setAttribute('aria-hidden', 'false');
    renderBig();
    var card = o && o.mode && bigBody && bigBody.querySelector('.mode-card[data-mode="' + o.mode + '"]');
    if (bigBody) bigBody.scrollTop = 0;
    if (card && o.mode === 'steps' && card.scrollIntoView) card.scrollIntoView({ block: 'start' });
  }
  function close() {
    isOpen = false;
    if (ov) { ov.classList.remove('is-open'); ov.setAttribute('aria-hidden', 'true'); }
  }

  /* ---------- render (with state-change animation) ---------- */
  /* sidebar redraw: plates are drawn in their previous state, then flipped next frame so a change animates.
     Every redraw path must go through here — a bare renderVert() would leave the plates stuck on the old state. */
  function renderSide() {
    var lay = renderVert() || [];
    var changed = [];
    lay.forEach(function (L) {
      if (last[L.sg.id] !== undefined && last[L.sg.id] !== L.state) changed.push([L.sg.id, L.state]);
      last[L.sg.id] = L.state;
    });
    if (changed.length) {
      requestAnimationFrame(function () {
        changed.forEach(function (c) {
          host.querySelectorAll('.bpi-plate[data-pid="' + c[0] + '"]').forEach(function (p) {
            p.setAttribute('class', p.getAttribute('class').replace(/st-\w+/, 'st-' + c[1]));
          });
        });
      });
    }
  }
  function render() {
    renderSide();
    renderBig();
    applyMarks();
  }

  /* ---------- linkage ---------- */
  function applyMarks() {
    var hl = host.__hl || null;
    function same(pid, id) { return !!id && pid === id; }
    function mark(cls, id) {
      document.querySelectorAll('#fast-bp .bpi-plate, #fast-bp .bpi-vhit, .bpi-overlay .bpi-plate, .bpi-overlay [data-pid]:not(.bpi-plate)').forEach(function (n) {
        n.classList.toggle(cls, same(n.getAttribute('data-pid'), id));
      });
    }
    mark('is-hl', hl); mark('is-pin', pinned);
  }
  function idFromEvent(e) {
    var el = e.target.closest && e.target.closest('[data-pid], .bp-diagram [data-node]');
    if (!el || !(bp.contains(el) || (ov && ov.contains(el)))) return null;
    return el.hasAttribute('data-pid') ? el.getAttribute('data-pid') : plateOf(el.getAttribute('data-node'));
  }
  document.addEventListener('mouseover', function (e) { var id = idFromEvent(e); if (id) { host.__hl = id; applyMarks(); } });
  document.addEventListener('mouseout', function () { host.__hl = null; applyMarks(); });
  document.addEventListener('click', function (e) {
    var id = idFromEvent(e);
    if (!id) return;
    pinned = pinned === id ? null : id;
    applyMarks();
  });
  // keyboard on rows
  bp.querySelectorAll('.bp-diagram [data-node]').forEach(function (n) { n.setAttribute('tabindex', '0'); });
  bp.addEventListener('keydown', function (e) {
    var n = e.target.closest && e.target.closest('.bp-diagram [data-node]');
    if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); n.click(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });

  var expandBtn = document.getElementById('bp-expand');
  if (expandBtn) expandBtn.addEventListener('click', function () { isOpen ? close() : open(); });

  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { renderSide(); applyMarks(); });
    ro.observe(host);
    ensureOverlay();
    
  }

  document.addEventListener('fastmodechange', function () { render(); });
  // the sidebar map can only be drawn while its tab is visible: redraw as soon as the user (or a flow) switches back to it
  var sceneTabEl = document.querySelector('.sidebar-tab[data-tab="scene"]');
  if (sceneTabEl) sceneTabEl.addEventListener('click', function () { setTimeout(function () { renderSide(); applyMarks(); }, 0); });

  var kit = { plate: plate, st: stOf, vert: function (W) { return renderVert(document.createElement('div'), W, { stat: true }); } };
  window.FastBlueprintIso = { render: render, open: open, close: close, kit: kit };
  render();
})();
