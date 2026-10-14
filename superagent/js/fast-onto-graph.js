/* Fast POC page ONLY — Ontology as a graph (nodes · labelled edges · inspector).
   Used by fast-modules.js → FastOntoGraph.view({ objects, mock, tag }).
   Pure inline SVG (no foreignObject), all interaction is delegated on document. */
(function () {
  'use strict';

  var NW = 176, NH = 130;
  var ICO = {
    Supplier: '<path d="M3 20h18"/><path d="M5 20V10l5 3v-3l5 3V5h4v15"/>',
    Part: '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    Quote: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
    Contract: '<path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    Incident: '<path d="M12 4 3 20h18L12 4Z"/><path d="M12 10v5M12 17.5v.5"/>'
  };
  var EDGES = [
    { id: 'supplies', from: 'Supplier', to: 'Part', cn: '供应' },
    { id: 'quotes', from: 'Supplier', to: 'Quote', cn: '提供报价' },
    { id: 'bound_by', from: 'Supplier', to: 'Contract', cn: '受合同约束' },
    { id: 'has', from: 'Supplier', to: 'Incident', cn: '发生过异常' },
    { id: 'for', from: 'Quote', to: 'Part', cn: '针对料号' }
  ];
  /* [fromSide, toSide, fromOffset, toOffset] — offset slides the anchor along that side */
  var SIDE = {
    h: { bound_by: ['l', 'r', -14, 0], has: ['l', 'r', 14, 0], supplies: ['r', 'l', -14, 0], quotes: ['r', 'l', 14, 0], 'for': ['t', 'b', 0, 0] },
    v: { bound_by: ['t', 'b', -26, 0], has: ['t', 'b', 26, 0], supplies: ['b', 't', -26, 0], quotes: ['b', 't', 26, 0], 'for': ['l', 'r', 0, 0] }
  };
  /* 1 unit = 1 px: the canvas is laid out for the real width, so type never scales with the panel */
  function layout(dir, W) {
    var M = 24, pos = {}, Hh;
    if (dir === 'h') {
      var Wc = Math.min(W, 880), ox = (W - Wc) / 2, L = ox + M + NW / 2, R = ox + Wc - M - NW / 2, top = M + NH / 2;
      Hh = 440; var bot = Hh - M - NH / 2;
      pos = { Contract: [L, top], Incident: [L, bot], Supplier: [ox + Wc / 2, Hh / 2], Part: [R, top], Quote: [R, bot] };
    } else {
      var Wv = Math.min(W, 600), ox2 = (W - Wv) / 2, L2 = ox2 + M + NW / 2, R2 = ox2 + Wv - M - NW / 2, g = 78;
      var r0 = M + NH / 2, r1 = r0 + NH + g, r2 = r1 + NH + g; Hh = r2 + NH / 2 + M;
      pos = { Contract: [L2, r0], Incident: [R2, r0], Supplier: [W / 2, r1], Part: [L2, r2], Quote: [R2, r2] };
    }
    return { vb: [W, Hh], pos: pos, side: SIDE[dir] };
  }
  function eff() { return st.dir || (st.W < 720 ? 'v' : 'h'); }
  var ACTIONS = [
    { id: 'screen-suppliers', n: '筛选', cn: '筛选候选供应商', on: ['Supplier'] },
    { id: 'compare-quotes', n: '比价', cn: '多供应商比价', on: ['Quote', 'Part', 'Contract'] },
    { id: 'score-suppliers', n: '评分', cn: '供应商评分排序', on: ['Supplier', 'Incident'] }
  ];
  var DIR = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] };

  var st = null, cur = { objects: {}, mock: true, tag: '' };
  function reset() { st = { W: st ? st.W : 540, tab: 'graph', dir: null, layer: 'sem', sel: 'Supplier', z: 1, tx: 0, ty: 0 }; }
  reset();

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function tw(s, fs) { var w = 0; for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 255 ? fs : fs * .56; return w; }
  function names() { return Object.keys(cur.objects); }
  function touching(id) { return EDGES.filter(function (e) { return e.from === id || e.to === id; }); }
  function actionsOf(id) { return ACTIONS.filter(function (a) { return a.on.indexOf(id) > -1; }); }
  function icon(id, px) { return '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[id] || '') + '</svg>'; }

  /* ───────── geometry ───────── */
  function anchor(pos, id, side, off) {
    var p = pos[id], cx = p[0], cy = p[1];
    if (side === 'l') return [cx - NW / 2, cy + off];
    if (side === 'r') return [cx + NW / 2, cy + off];
    if (side === 't') return [cx + off, cy - NH / 2];
    return [cx + off, cy + NH / 2];
  }
  function curve(L, e) {
    var s = L.side[e.id], a = anchor(L.pos, e.from, s[0], s[2]), b = anchor(L.pos, e.to, s[1], s[3]);
    var d = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)), k = Math.max(36, d * .42);
    var da = DIR[s[0]], db = DIR[s[1]];
    var c1 = [a[0] + da[0] * k, a[1] + da[1] * k], c2 = [b[0] + db[0] * k, b[1] + db[1] * k];
    var mid = [(a[0] + 3 * c1[0] + 3 * c2[0] + b[0]) / 8, (a[1] + 3 * c1[1] + 3 * c2[1] + b[1]) / 8];
    var f = function (n) { return Math.round(n * 10) / 10; };
    return { a: a, b: b, mid: mid, d: 'M' + f(a[0]) + ' ' + f(a[1]) + ' C' + f(c1[0]) + ' ' + f(c1[1]) + ' ' + f(c2[0]) + ' ' + f(c2[1]) + ' ' + f(b[0]) + ' ' + f(b[1]) };
  }

  /* ───────── SVG pieces ───────── */
  function defs() {
    return '<defs>' +
      '<filter id="og-sh" x="-12%" y="-12%" width="124%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity=".07"/></filter>' +
      '<pattern id="og-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#ededf0" stroke-width="1.1"/></pattern>' +
      '<marker id="og-arr" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M2 2 L8 5 L2 8" fill="none" stroke="#b9b9bf" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></marker>' +
      '<marker id="og-arr-hl" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M2 2 L8 5 L2 8" fill="none" stroke="#1f82eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></marker>' +
      '</defs>';
  }
  function edgeSvg(L, e, i) {
    var c = curve(L, e), lw = Math.ceil(tw(e.id, 11)) + 16, act = st.layer === 'act';
    return '<g class="og-edge" data-from="' + e.from + '" data-to="' + e.to + '" data-edge="' + e.id + '" style="--i:' + i + '">' +
      '<path class="og-hit" d="' + c.d + '"/>' +
      '<path class="og-ep" d="' + c.d + '"/>' +
      '<circle class="og-src" cx="' + c.a[0] + '" cy="' + c.a[1] + '" r="2.6"/>' +
      (act ? '' : '<circle class="og-dot" r="2"><animateMotion dur="' + (3.4 + i * .35).toFixed(2) + 's" begin="-' + (i * .9).toFixed(1) + 's" repeatCount="indefinite" path="' + c.d + '"/></circle>') +
      '<g class="og-elab" transform="translate(' + c.mid[0].toFixed(1) + ' ' + c.mid[1].toFixed(1) + ')"><rect x="' + (-lw / 2) + '" y="-9.5" width="' + lw + '" height="19" rx="9.5"/><text y="3.9" text-anchor="middle">' + e.id + '</text></g>' +
      '</g>';
  }
  function nodeSvg(L, id, i) {
    var o = cur.objects[id], p = L.pos[id], x = Math.round(p[0] - NW / 2), y = Math.round(p[1] - NH / 2), act = st.layer === 'act';
    var chips = [o.props.length + ' 属性', touching(id).length + ' 关系'], cx = 12, cy = NH - 32;
    var cs = chips.map(function (c) {
      var w = Math.ceil(tw(c, 11)) + 16, s = '<rect class="og-chip" x="' + cx + '" y="' + cy + '" width="' + w + '" height="21" rx="6"/><text class="og-chip-t" x="' + (cx + w / 2) + '" y="' + (cy + 14.5) + '" text-anchor="middle">' + c + '</text>';
      cx += w + 6; return s;
    }).join('');
    var rows = (act
      ? actionsOf(id).slice(0, 2).map(function (a) { return [a.cn.length > 7 ? a.n : a.cn, a.id]; })
      : o.props.slice(0, 2).map(function (q) { return [q[0], q[1]]; })).map(function (r, k) {
      return '<text class="og-pn" x="12" y="' + (71 + k * 17) + '">' + esc(r[0]) + '</text><text class="og-pt" x="' + (NW - 12) + '" y="' + (71 + k * 17) + '" text-anchor="end">' + esc(r[1]) + '</text>';
    }).join('');
    var badge = '<circle class="' + (cur.mock ? 'og-mk' : 'og-ok') + '" cx="' + (NW - 17) + '" cy="20" r="3.6"/>';
    return '<g class="og-node' + (id === 'Supplier' ? ' is-hub' : '') + (st.sel === id ? ' is-sel' : '') + (cur.mock ? ' is-mock' : '') + '" data-id="' + id + '" transform="translate(' + x + ' ' + y + ')">' +
      '<g class="og-nd" style="--i:' + i + '">' +
      '<rect class="og-ring" x="-3" y="-3" width="' + (NW + 6) + '" height="' + (NH + 6) + '" rx="15"/>' +
      '<rect class="og-card" width="' + NW + '" height="' + NH + '" rx="12" filter="url(#og-sh)"/>' +
      (cur.mock ? '<rect class="og-hatch" width="' + NW + '" height="' + NH + '" rx="12" fill="url(#og-hatch)"/>' : '') +
      '<rect class="og-tile" x="12" y="12" width="28" height="28" rx="8"/>' +
      '<g class="og-ico" transform="translate(17 17) scale(.75)" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICO[id] + '</g>' +
      '<text class="og-name" x="50" y="25">' + id + '</text><text class="og-key" x="50" y="39">' + esc(o.key) + '</text>' +
      badge + '<line class="og-div" x1="12" x2="' + (NW - 12) + '" y1="52" y2="52"/>' +
      '<g class="og-rows' + (act ? ' is-act' : '') + '">' + rows + '</g>' + cs + '</g></g>';
  }
  function canvasSvg() {
    var L = layout(eff(), st.W), ids = names().filter(function (n) { return L.pos[n]; });
    var cx = L.vb[0] / 2, cy = L.vb[1] / 2;
    return '<svg class="og-svg' + (st.layer === 'act' ? ' is-act' : '') + (cur.mock ? ' is-mock' : '') + '" width="' + L.vb[0] + '" height="' + L.vb[1] + '" viewBox="0 0 ' + L.vb[0] + ' ' + L.vb[1] + '" role="img" aria-label="Ontology graph">' + defs() +
      '<g class="og-vp" data-cx="' + cx + '" data-cy="' + cy + '" transform="' + vpT() + '">' +
      EDGES.map(function (e, i) { return edgeSvg(L, e, i); }).join('') +
      ids.map(function (n, i) { return nodeSvg(L, n, i); }).join('') + '</g></svg>';
  }
  function vpT() {
    var L = layout(eff(), st.W), cx = L.vb[0] / 2, cy = L.vb[1] / 2;
    return 'translate(' + st.tx.toFixed(1) + ' ' + st.ty.toFixed(1) + ') translate(' + cx + ' ' + cy + ') scale(' + st.z.toFixed(3) + ') translate(' + (-cx) + ' ' + (-cy) + ')';
  }

  /* ───────── HTML pieces ───────── */
  function seg(grp, items, on) {
    return '<div class="og-seg">' + items.map(function (it) { return '<button type="button" class="' + (on === it[0] ? 'is-on' : '') + '" data-og-' + grp + '="' + it[0] + '">' + it[1] + '</button>'; }).join('') + '</div>';
  }
  function tabsHtml() {
    var n = names().length, tabs = [['graph', '本体图谱', null], ['obj', '对象', n], ['rel', '关系', EDGES.length], ['act', '动作', ACTIONS.length]];
    return '<div class="og-tabs" role="tablist">' + tabs.map(function (t) {
      return '<button type="button" role="tab" class="' + (st.tab === t[0] ? 'is-on' : '') + '" data-og-tab="' + t[0] + '">' + t[1] + (t[2] != null ? '<i>' + t[2] + '</i>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function inspHtml() {
    var id = st.sel, o = cur.objects[id];
    if (!o) return '<div class="og-insp-empty">点选图上的节点，查看属性、关系和已知缺口。</div>';
    var rel = touching(id).map(function (e) {
      var out = e.from === id, other = out ? e.to : e.from;
      return '<div class="og-r"><em>' + e.id + '</em><span class="og-ar">' + (out ? '→' : '←') + '</span><button type="button" class="og-lk" data-og-pick="' + other + '">' + icon(other, 12) + other + '</button></div>';
    }).join('');
    var acts = actionsOf(id).map(function (a) { return '<span class="og-act" title="' + esc(a.cn) + '"><b>' + a.n + '</b><code>' + a.id + '</code></span>'; }).join('');
    return '<div class="og-insp-h"><span class="og-ti' + (id === 'Supplier' ? ' is-hub' : '') + '">' + icon(id, 16) + '</span><div class="og-insp-n"><b>' + id + '</b><code>' + esc(o.key) + '</code></div>' + (cur.mock ? cur.tag : '') + '</div>' +
      '<div class="og-src-l">来源 · ' + esc(o.src) + '</div>' +
      '<div class="og-cols"><div class="og-col"><h6>属性<i>' + o.props.length + '</i></h6>' + o.props.map(function (p) {
        return '<div class="og-p" title="' + esc(p[2]) + '"><b>' + esc(p[0]) + '</b><code>' + esc(p[1]) + '</code><span>' + esc(p[2]) + '</span></div>';
      }).join('') + '</div><div class="og-col"><h6>关系<i>' + touching(id).length + '</i></h6>' + rel + '<h6 class="og-h2">动作<i>' + actionsOf(id).length + '</i></h6><div class="og-acts">' + acts + '</div></div></div>' +
      '<div class="og-note ' + (cur.mock ? 'is-gap' : 'is-ok') + '"><b>' + (cur.mock ? '已知缺口' : '校对结果') + '</b>' + esc(cur.mock ? o.gap : o.fix) + '</div>';
  }
  function graphHtml() {
    return '<div class="og-bar">' + seg('dir', [['h', '横向'], ['v', '纵向']], eff()) + seg('layer', [['sem', '语义层'], ['act', '动作层']], st.layer) +
      '<span class="og-meta">' + names().length + ' 对象 · ' + EDGES.length + ' 关系</span></div>' +
      '<div class="og-canvas" data-og-canvas>' + canvasSvg() +
      '<div class="og-zoom"><button type="button" data-og-zoom="in" aria-label="放大"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg></button>' +
      '<button type="button" data-og-zoom="out" aria-label="缩小"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 8h9"/></svg></button>' +
      '<button type="button" data-og-zoom="fit" aria-label="适应画布"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6V3.5H5M11 3.5h2.5V6M13.5 10v2.5H11M5 12.5H2.5V10"/></svg></button></div>' +
      '<div class="og-legend"><i class="' + (cur.mock ? 'is-mock' : '') + '"></i>' + (cur.mock ? '虚线 · Mock，未经真实数据校对' : '实线 · 已按真实数据校对') + '</div></div>' +
      '<div class="og-insp">' + inspHtml() + '</div>';
  }
  function listHtml() {
    if (st.tab === 'obj') {
      return '<div class="og-list">' + names().map(function (n) {
        var o = cur.objects[n];
        return '<button type="button" class="og-li" data-og-pick="' + n + '" data-og-go="1"><span class="og-ti' + (n === 'Supplier' ? ' is-hub' : '') + '">' + icon(n, 16) + '</span><span class="og-lm"><b>' + n + '</b><i>' + o.props.length + ' 属性 · ' + touching(n).length + ' 关系 · 主键 <code>' + esc(o.key) + '</code></i></span>' + (cur.mock ? cur.tag : '') + '<svg class="og-chev" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3.5 4.5 4.5L6 12.5"/></svg></button>';
      }).join('') + '</div>';
    }
    if (st.tab === 'rel') {
      return '<div class="og-list">' + EDGES.map(function (e) {
        return '<button type="button" class="og-li og-rel" data-og-pick="' + e.from + '" data-og-go="1"><span class="og-nodechip">' + icon(e.from, 13) + e.from + '</span><span class="og-rl"><em>' + e.id + '</em></span><span class="og-nodechip">' + icon(e.to, 13) + e.to + '</span><span class="og-cn">' + e.cn + '</span></button>';
      }).join('') + '</div>';
    }
    return '<div class="og-list">' + ACTIONS.map(function (a) {
      return '<div class="og-li is-static og-actrow"><span class="og-lm"><b>' + a.cn + '</b><i><code>' + a.id + '</code></i></span><span class="og-on">' + a.on.map(function (n) { return '<span class="og-nodechip">' + icon(n, 13) + n + '</span>'; }).join('') + '</span></div>';
    }).join('') + '</div>';
  }
  function panelHtml() { return st.tab === 'graph' ? graphHtml() : listHtml(); }

  /* measure the real canvas width and re-lay-out when the panel is resized / expanded */
  var ro = null;
  function watch() {
    var c = document.querySelector('.og [data-og-canvas]');
    if (!c) return false;
    if (c.__ogw) return true;
    c.__ogw = 1;
    if (!window.ResizeObserver) return true;
    if (!ro) ro = new ResizeObserver(function (es) {
      es.forEach(function (en) {
        var w = Math.round(en.contentRect.width), root = en.target.closest('.og');
        if (!root || w < 200 || Math.abs(w - st.W) < 6) return;
        st.W = w; renderCanvas(root); syncSegs(root);
      });
    });
    ro.observe(c); return true;
  }
  function arm() { var n = 0, h = setInterval(function () { if (watch() || ++n > 40) clearInterval(h); }, 50); }

  function view(opts) {
    cur = { objects: opts.objects || {}, mock: opts.mock !== false, tag: opts.tag || '' };
    if (!cur.objects[st.sel]) st.sel = names()[0] || null;
    arm();
    return '<div class="og">' + tabsHtml() + '<div class="og-panel og-in">' + panelHtml() + '</div></div>';
  }

  /* ───────── interaction ───────── */
  function $(root, s) { return root.querySelector(s); }
  function renderTabs(root) { var t = $(root, '.og-tabs'); if (t) t.outerHTML = tabsHtml(); }
  function renderPanel(root) {
    var p = $(root, '.og-panel'); p.classList.remove('og-in'); void p.offsetWidth;
    p.innerHTML = panelHtml(); p.classList.add('og-in'); renderTabs(root); arm();
  }
  function renderCanvas(root) {
    var c = $(root, '[data-og-canvas]'), old = $(c, '.og-svg'), tmp = document.createElement('div');
    tmp.innerHTML = canvasSvg(); var n = tmp.firstChild; n.classList.add('og-swap'); old.replaceWith(n);
  }
  function syncSegs(root) {
    root.querySelectorAll('[data-og-dir]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-og-dir') === eff()); });
    root.querySelectorAll('[data-og-layer]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-og-layer') === st.layer); });
  }
  function setSel(root, id) {
    st.sel = id;
    root.querySelectorAll('.og-node').forEach(function (n) { n.classList.toggle('is-sel', n.getAttribute('data-id') === id); });
    var i = $(root, '.og-insp'); if (i) { i.innerHTML = inspHtml(); i.classList.remove('og-in'); void i.offsetWidth; i.classList.add('og-in'); }
  }
  function applyView(root) { var g = $(root, '.og-vp'); if (g) g.setAttribute('transform', vpT()); }
  function zoomBy(root, f) { st.z = Math.max(.6, Math.min(1.8, f === 1 ? 1 : st.z * f)); if (f === 1) { st.tx = 0; st.ty = 0; } applyView(root); }

  function focus(root, el) {
    var svg = $(root, '.og-svg'); if (!svg) return;
    svg.querySelectorAll('.is-hl').forEach(function (n) { n.classList.remove('is-hl'); });
    if (!el) { svg.classList.remove('is-focus'); return; }
    var hl = {}, edges = [];
    if (el.classList.contains('og-node')) {
      var id = el.getAttribute('data-id'); hl[id] = 1;
      svg.querySelectorAll('.og-edge').forEach(function (e) {
        if (e.getAttribute('data-from') === id || e.getAttribute('data-to') === id) { edges.push(e); hl[e.getAttribute('data-from')] = 1; hl[e.getAttribute('data-to')] = 1; }
      });
    } else { edges.push(el); hl[el.getAttribute('data-from')] = 1; hl[el.getAttribute('data-to')] = 1; }
    svg.classList.add('is-focus');
    edges.forEach(function (e) { e.classList.add('is-hl'); });
    svg.querySelectorAll('.og-node').forEach(function (n) { if (hl[n.getAttribute('data-id')]) n.classList.add('is-hl'); });
  }

  var moved = false, pan = null;
  document.addEventListener('click', function (e) {
    var root = e.target.closest && e.target.closest('.og'); if (!root) return;
    if (moved) { moved = false; return; }
    var t;
    if ((t = e.target.closest('[data-og-tab]'))) { st.tab = t.getAttribute('data-og-tab'); renderPanel(root); return; }
    if ((t = e.target.closest('[data-og-dir]'))) { st.dir = t.getAttribute('data-og-dir'); st.tx = 0; st.ty = 0; syncSegs(root); renderCanvas(root); return; }
    if ((t = e.target.closest('[data-og-layer]'))) { st.layer = t.getAttribute('data-og-layer'); syncSegs(root); renderCanvas(root); return; }
    if ((t = e.target.closest('[data-og-zoom]'))) { var z = t.getAttribute('data-og-zoom'); zoomBy(root, z === 'in' ? 1.2 : z === 'out' ? 1 / 1.2 : 1); return; }
    if ((t = e.target.closest('[data-og-pick]'))) {
      var id = t.getAttribute('data-og-pick');
      if (t.hasAttribute('data-og-go')) { st.sel = id; st.tab = 'graph'; renderPanel(root); } else setSel(root, id);
      return;
    }
    if ((t = e.target.closest('.og-node'))) setSel(root, t.getAttribute('data-id'));
  });
  document.addEventListener('mouseover', function (e) {
    var root = e.target.closest && e.target.closest('.og'); if (!root || pan) return;
    focus(root, e.target.closest('.og-node, .og-edge'));
  });
  document.addEventListener('mouseout', function (e) {
    var root = e.target.closest && e.target.closest('.og'); if (!root) return;
    if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.og-svg')) focus(root, null);
  });
  document.addEventListener('pointerdown', function (e) {
    moved = false;
    var c = e.target.closest && e.target.closest('[data-og-canvas]');
    if (!c || e.button || e.target.closest('.og-node, .og-zoom')) return;
    var svg = $(c, '.og-svg'), vb = svg.viewBox.baseVal;
    pan = { x: e.clientX, y: e.clientY, tx: st.tx, ty: st.ty, k: vb.width / svg.clientWidth, c: c, root: c.closest('.og') };
    moved = false;
  });
  document.addEventListener('pointermove', function (e) {
    if (!pan) return;
    var dx = e.clientX - pan.x, dy = e.clientY - pan.y;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    moved = true; pan.c.classList.add('is-pan');
    st.tx = pan.tx + dx * pan.k; st.ty = pan.ty + dy * pan.k; applyView(pan.root);
  });
  function endPan() { if (pan) { pan.c.classList.remove('is-pan'); pan = null; } }
  document.addEventListener('pointerup', endPan);
  document.addEventListener('pointercancel', endPan);
  document.addEventListener('wheel', function (e) {
    var c = e.target.closest && e.target.closest('[data-og-canvas]');
    if (!c || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault(); zoomBy(c.closest('.og'), e.deltaY < 0 ? 1.08 : 1 / 1.08);
  }, { passive: false });

  window.FastOntoGraph = { view: view, reset: reset };
})();
