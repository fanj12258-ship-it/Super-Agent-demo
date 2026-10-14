/**
 * Fast POC page ONLY — horizontal architecture maps (not loaded by superagent.html).
 *   FastFlowMap.full({ mode: 'fast'|'steps', kit })  → HTML (SVG + legend) for the big view in the centre.
 *                                                       Live: plate states come from the blueprint rows.
 *   FastFlowMap.mini(mode)                           → small static schematic for the Fast / Steps choice card.
 * Layout (left → right): Inputs · Step 1 Requirements · 2 Knowledge · 3–5 Design plans · 6 Ontology ·
 *   7 Skills·MCP·more · 8 Agent · Try & refine; under each plate the artifacts it produces; below that
 *   Steps = phase brackets, Fast = FAST LANE (draft Agent right after alignment) + REFINE loop (try → backfill mocks).
 * Plates / patterns are drawn by FastBlueprintIso (kit.plate).
 */
(function () {
  'use strict';
  var A = 0.9, K = 0.36;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tri(x, y, c, dir) {
    return dir === 'up'
      ? '<polygon points="' + (x - 3.5) + ',' + (y + 7) + ' ' + x + ',' + y + ' ' + (x + 3.5) + ',' + (y + 7) + '" fill="' + c + '"/>'
      : '<polygon points="' + (x - 7) + ',' + (y - 3.5) + ' ' + x + ',' + y + ' ' + (x - 7) + ',' + (y + 3.5) + '" fill="' + c + '"/>';
  }

  var COLS = [
    { id: 'req',   data: 'req',   items: ['req'],                  steps: 'STEP 1',    title: 'Requirements',       sub: ['Goals · triggers', 'criteria'],         out: ['Requirements brief', 'Success criteria'] },
    { id: 'know',  data: 'know',  items: ['know'],                 steps: 'STEP 2',    title: 'Business knowledge', sub: ['Rules · contracts', 'data'],            out: ['Contracts · rules', 'Process notes', 'ERP export'] },
    { id: 'doc',   data: 'doc',   items: ['doc', 'onto', 'agent'], steps: 'STEPS 3–5', title: 'Design plans',       sub: ['Product · Ontology', '· Agent plans'],  out: ['Product plan', 'Ontology plan', 'Agent plan'] },
    { id: 'onto',  data: 'onto',  items: ['onto'],                 steps: 'STEP 6',    title: 'Build ontology',     sub: ['Objects · links', 'actions'],           out: ['Supplier · Part · Quote', 'Contract · Incident'], mockSub: ['Stubbed from the ERP', 'field dictionary'] },
    { id: 'tools', data: 'skill', items: ['skillp', 'mcp', 'res'], steps: 'STEP 7',    title: 'Skills · MCP · more', sub: ['Tools & resources', 'the Agent can use'], out: ['Screen · Score', 'ERP connector', 'Rules & templates'], mockSub: ['Stubbed skills', '+ sample-data MCP'] },
    { id: 'agent', data: 'agent', items: ['agent'],                steps: 'STEP 8',    title: 'Generate Agent',     sub: ['Assemble & test'],                       out: ['Agent spec', 'Mock register'] },
  ];
  var SOURCES = ['Conversation', 'Uploaded documents', 'ERP & data sources', 'Existing knowledge'];

  /* ───────── the two horizontal mode diagrams — ported 1:1 from design-lab/blueprint-iso.html (modeDiagram, static) ───────── */
  var MDW = 860, MDH = 316, MDH_STEPS = 720;
  /* Document layer: flat editorial shelves (not 2.5D) — reads clearly as design docs under modules */
  /* each entry: [label, kind]  kind = spec | source | plan */
  var DOCS = [
    [['Req. brief', 'spec'], ['Success criteria', 'spec']],
    [['Contracts', 'source'], ['Process notes', 'source'], ['ERP export', 'source']],
    [['Product plan', 'plan'], ['Ontology plan', 'plan'], ['Agent plan', 'plan']],
    [['Data source', 'source'], ['Semantic graph', 'spec']],
    [['Skill specs', 'spec'], ['MCP specs', 'spec'], ['Resources', 'source']],
    [['Agent spec', 'spec'], ['Mock register', 'spec']]
  ];
  function fileIco(x, y) {
    return '<path class="dshelf-ico" d="M' + x + ' ' + y + 'h6.5l2.5 2.5v8.5h-9zM' + (x + 6.5) + ' ' + y + 'v2.5h2.5"/>';
  }
  function docLayer(_plate, cols, yBottoms) {
    var pw = 120, rowH = 24, gap = 5, pad = 10;
    var x0 = cols[0].cx - 64, x1 = cols[5].cx + 64, rw = x1 - x0;
    /* taller rings + larger gap between module / document for breathing room */
    var modY = 108, modH = 228, docY = 380, docH = 220;
    var out = '';
    out += '<rect class="layer-ring mod" x="' + x0 + '" y="' + modY + '" width="' + rw + '" height="' + modH + '" rx="16"/>' +
      '<text class="layer-lab" x="' + (x0 + 14) + '" y="' + (modY + 22) + '">MODULE LAYER</text>' +
      '<text class="layer-lab quiet" x="' + (x1 - 14) + '" y="' + (modY + 22) + '" text-anchor="end">how the Agent is built</text>';
    out += '<rect class="layer-ring doc" x="' + x0 + '" y="' + docY + '" width="' + rw + '" height="' + docH + '" rx="16"/>' +
      '<text class="layer-lab" x="' + (x0 + 14) + '" y="' + (docY + 22) + '">DOCUMENT LAYER</text>' +
      '<text class="layer-lab quiet" x="' + (x1 - 14) + '" y="' + (docY + 22) + '" text-anchor="end">specs · sources · plans</text>';
    cols.forEach(function (c, i) {
      var docs = DOCS[i], n = docs.length;
      var ph = 24 + n * (rowH + gap) + pad;
      var px = c.cx - pw / 2, py = docY + 52;
      var y1 = yBottoms[i] + 2, join = py - 2;
      out += '<path class="dfeed" d="M' + c.cx + ' ' + join + ' V' + y1 + '"/>' +
        '<circle class="dfeed-n" cx="' + c.cx + '" cy="' + join + '" r="2.5"/>';
      out += '<g class="dshelf">' +
        '<rect class="dshelf-bg" x="' + px + '" y="' + py + '" width="' + pw + '" height="' + ph + '" rx="9"/>' +
        '<text class="dshelf-cap" x="' + (px + 10) + '" y="' + (py + 16) + '">' + n + ' docs</text>';
      docs.forEach(function (d, k) {
        var ry = py + 24 + k * (rowH + gap);
        out += '<rect class="dshelf-row kind-' + d[1] + '" x="' + (px + 6) + '" y="' + ry + '" width="' + (pw - 12) + '" height="' + rowH + '" rx="6"/>' +
          fileIco(px + 12, ry + 5.5) +
          '<text class="dshelf-name" x="' + (px + 28) + '" y="' + (ry + 15.5) + '">' + d[0] + '</text>' +
          '<text class="dshelf-kind" x="' + (px + pw - 12) + '" y="' + (ry + 15.5) + '" text-anchor="end">' + d[1] + '</text>';
      });
      out += '</g>';
    });
    return out;
  }
  function modeDiagram(o) {
    var plate = o.kit.plate;
    var mode = o.mode, dyn = !!o.dyn, fast = mode === 'fast';
    var s = 51, w = A * s, h = K * s, t = 6, P = 56, cy0 = 222, X0 = 90, PITCH = 136;
    var cols = [
      { items: ['req'], steps: 'STEP 1', title: 'Requirements', sub: ['Goals · triggers · criteria'] },
      { items: ['know'], steps: 'STEP 2', title: 'Business knowledge', sub: ['Rules · contracts · data'] },
      { items: ['doc', 'onto', 'agent'], steps: 'STEPS 3–5', title: 'Design plans', sub: ['Product · Ontology', '· Agent plans'] },
      { items: ['onto'], steps: 'STEP 6', title: 'Build ontology', sub: ['Objects · links · actions'] },
      { items: ['skillp', 'mcp', 'res'], steps: 'STEP 7', title: 'Skills · MCP · more', sub: ['Tools & resources', 'the Agent can use'] },
      { items: ['agent'], steps: 'STEP 8', title: 'Generate Agent', sub: ['Assemble & test'] }
    ];
    var fastLab = [
      ['LIGHT', 'Requirements', ['Quick alignment']],
      ['MOCK', 'Business knowledge', ['Placeholder data']],
      ['MOCK', 'Design plans', ['Product · Ontology', '· Agent plans']],
      ['MOCK', 'Ontology', ['Stubbed objects']],
      ['MOCK', 'Skills · MCP · more', ['Stubbed tools']],
      ['DRAFT', 'Agent', ['Generated right away']]
    ];
    // per-column state
    var S = function (id) { return o.kit.st(id).s; }, mk = function (x) { return x === 'todo' ? 'mock' : x; };
    var states;
    // live: real state wherever something has started; in Fast every untouched middle step shows as Mock
    var Sx = function (id) { var v = S(id); return v === 'optional' ? 'todo' : v; };
    if (dyn) states = fast ? [Sx('req'), mk(Sx('know')), mk(Sx('doc')), mk(Sx('onto')), mk(Sx('skill')), Sx('agent')] : [Sx('req'), Sx('know'), Sx('doc'), Sx('onto'), Sx('skill'), Sx('agent')];
    else states = fast ? ['done', 'mock', 'mock', 'mock', 'mock', 'doing'] : ['done', 'done', 'done', 'done', 'done', 'doing'];
    var WORD = { done: 'DONE', doing: 'IN PROGRESS', todo: 'NOT STARTED', mock: 'MOCK', optional: 'OPTIONAL', imported: 'IMPORTED' };

    cols.forEach(function (c, i) {
      c.cx = X0 + i * PITCH;
      var n = c.items.length;
      c.cys = c.items.map(function (_, k) { return cy0 + (k - (n - 1) / 2) * P; });
      c.state = states[i];
    });

    var svg = '<svg class="mdg" viewBox="0 0 ' + MDW + ' ' + (fast ? MDH : MDH_STEPS) + '" xmlns="http://www.w3.org/2000/svg">' +
      '';

    function surf(cy, d) { return cy + h * (1 - Math.abs(d) / w) + t; }
    var laneAOn = !dyn || S('agent') !== 'todo', laneBOn = !dyn || S('agent') === 'done';
    var yA = 294, yB = 262;

    // --- Fast lanes (behind plates) ---
    if (fast) {
      var c0 = cols[0], c5 = cols[5];
      var xa0 = c0.cx - 16, xa5 = c5.cx - 16, ya0 = surf(c0.cys[0], -16), ya5 = surf(c5.cys[0], -16);
      var dA = 'M' + xa0 + ' ' + ya0 + ' V' + yA + ' H' + xa5 + ' V' + ya5;
      svg += '<path d="' + dA + '" fill="none" stroke="' + (laneAOn ? '#1f82eb' : '#d2d2d7') + '" stroke-width="1.6" stroke-linejoin="round"' + (laneAOn ? '' : ' stroke-dasharray="3 3"') + '/>';
      svg += '<polygon points="' + (xa5 - 3.5) + ',' + (ya5 + 7) + ' ' + xa5 + ',' + ya5 + ' ' + (xa5 + 3.5) + ',' + (ya5 + 7) + '" fill="' + (laneAOn ? '#1f82eb' : '#d2d2d7') + '"/>';
      if (laneAOn) svg += '<circle r="2.4" fill="#1f82eb"><animateMotion dur="3s" repeatCount="indefinite" path="' + dA + '"/></circle>';
      var xb = c5.cx + 16, yb0 = surf(c5.cys[0], 16);
      var dB = 'M' + xb + ' ' + yb0 + ' V' + yB + ' H' + cols[1].cx;
      var bc = laneBOn ? '#8f8f97' : '#d2d2d7';
      svg += '<path d="' + dB + '" fill="none" stroke="#fff" stroke-width="5"/>';
      svg += '<path d="' + dB + '" fill="none" stroke="' + bc + '" stroke-width="1.3" stroke-dasharray="4 3" stroke-linejoin="round"/>';
      for (var r = 1; r <= 4; r++) {
        var cr = cols[r], last = cr.cys[cr.cys.length - 1], yTop = last + h + t;
        svg += '<path d="M' + cr.cx + ' ' + yB + ' V' + (yTop + 1) + '" fill="none" stroke="' + bc + '" stroke-width="1.3" stroke-dasharray="4 3"/>';
        svg += '<polygon points="' + (cr.cx - 3.5) + ',' + (yTop + 8) + ' ' + cr.cx + ',' + (yTop + 1) + ' ' + (cr.cx + 3.5) + ',' + (yTop + 8) + '" fill="' + bc + '"/>';
      }
      if (laneBOn) svg += '<circle r="2.2" fill="#22a05a"><animateMotion dur="3.4s" repeatCount="indefinite" path="' + dB + '"/></circle>';
    }

    // --- horizontal links between columns ---
    for (var i = 0; i < 5; i++) {
      var a = cols[i], b = cols[i + 1], xr = a.cx + w, xl = b.cx - w;
      var mockLink = a.state === 'mock' || b.state === 'mock';
      var lit = dyn ? a.state === 'done' : !fast;
      var col = lit ? '#8f8f97' : '#c9c9ce';
      a.cys.forEach(function (ya, ia) {
        b.cys.forEach(function (yb, ib) {
          var d = ya === yb ? 'M' + xr + ' ' + ya + ' H' + xl : 'M' + xr + ' ' + ya + ' H' + (xr + 16) + ' L' + xl + ' ' + yb;
          svg += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width=".75"' + (mockLink ? ' stroke-dasharray="3 3"' : '') + '/>';
          svg += '<polygon points="' + (xl - 6) + ',' + (yb - 3) + ' ' + xl + ',' + yb + ' ' + (xl - 6) + ',' + (yb + 3) + '" fill="' + col + '"/>';
          if (lit && !mockLink) svg += '<circle r="2" fill="#22a05a"><animateMotion dur="2.4s" begin="-' + (i * 0.4 + (ia + ib) * 0.2 + 0.1).toFixed(1) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
        });
      });
    }

    // --- plates (stacked: bottom first) ---
    cols.forEach(function (c) {
      for (var k = c.items.length - 1; k >= 0; k--) svg += plate({ id: 'md', cx: c.cx, cy: c.cys[k], s: s, t: t, state: c.state, pat: c.items[k] });
    });

    // --- column labels (top, small caps like the reference) ---
    cols.forEach(function (c, i) {
      var cap = dyn ? WORD[c.state] : (fast ? fastLab[i][0] : c.steps);
      var capCls = dyn ? c.state : (fast ? (i === 0 ? 'light' : fastLab[i][0].toLowerCase()) : '');
      var title = fast && !dyn ? fastLab[i][1] : c.title, sub = fast && !dyn ? fastLab[i][2] : c.sub;
      svg += '<text class="cap ' + capCls + '" x="' + c.cx + '" y="24" text-anchor="middle">' + cap + '</text>' +
        '<text class="ttl" x="' + c.cx + '" y="46" text-anchor="middle">' + title + '</text>';
      sub.forEach(function (line, j) { svg += '<text class="sub" x="' + c.cx + '" y="' + (66 + j * 15) + '" text-anchor="middle">' + line + '</text>'; });
    });

    // --- Steps: phase brackets / Fast: lane pills ---
    if (!fast) {
      svg += docLayer(plate, cols, cols.map(function (c) { return c.cys[c.cys.length - 1] + h + t; }));
      [[0, 1, 'UNDERSTAND'], [2, 2, 'DESIGN'], [3, 4, 'BUILD'], [5, 5, 'SHIP']].forEach(function (p) {
        var x0 = cols[p[0]].cx - w, x1 = cols[p[1]].cx + w;
        svg += '<path class="brk" d="M' + x0 + ' 648 V654 H' + x1 + ' V648"/><text class="ph" x="' + ((x0 + x1) / 2) + '" y="682" text-anchor="middle">' + p[2] + '</text>';
      });
    } else {
      var pill = function (x, y, label, cls) {
        var wd = label.length * 6.7 + 22;
        return '<g class="pillb ' + (cls || '') + '"><rect x="' + (x - wd / 2) + '" y="' + (y - 10) + '" width="' + wd + '" height="20" rx="10"/><text x="' + x + '" y="' + (y + 3.5) + '" text-anchor="middle">' + label + '</text></g>';
      };
      svg += pill((cols[0].cx + cols[5].cx) / 2, yA, 'QUICK LANE · A FIRST AGENT RIGHT AFTER ALIGNMENT', 'blue');
      svg += pill((cols[1].cx + cols[5].cx + 16) / 2 - 20, yB, 'TRY IT → REFINE THE MOCKS');
    }
    return svg + '</svg>';
  }

  /* the overview in the centre: just the Steps structure map (modules + document layer).
     Purely explanatory — no live progress here (progress lives in the sidebar). */
  function full(o) {
    /* bare on the grey floor — no white card; reads like an assembly / parts drawing */
    return '<div class="ov-stage">' +
      '<div class="ov-kicker">Agent assembly</div>' +
      '<p class="ov-lead">上面是模块，下面是设计文档。文档支撑模块，模块装配成 Agent。</p>' +
      modeDiagram({ mode: 'steps', kit: o.kit, dyn: false }) +
      '</div>';
  }

  /* ───────── mini schematic for the choice card ───────── */
  function mini(mode) {
    var kit = window.FastBlueprintIso && window.FastBlueprintIso.kit;
    if (!kit) return '';
    var fast = mode === 'fast';
    /* finer geometry: thinner extrusion + quieter states so the card diagram reads as a sketch, not a progress meter */
    var VW = 240, VH = 72, s = 11, w = A * s, t = 1.6, cy = 18, x0 = 24, pitch = 38.5;
    var items = ['req', 'know', 'doc', 'onto', 'skillp', 'agent'];
    var states = fast ? ['doing', 'todo', 'todo', 'todo', 'todo', 'doing'] : ['todo', 'todo', 'todo', 'todo', 'todo', 'todo'];
    var svg = '<svg class="mdg mdg-mini' + (fast ? ' is-fast' : ' is-steps') + '" viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true">';
    for (var i = 0; i < 5; i++) {
      var xa = x0 + i * pitch + w, xb = x0 + (i + 1) * pitch - w;
      svg += '<path class="mini-link" d="M' + xa + ' ' + cy + ' H' + xb + '"' + (fast ? ' stroke-dasharray="2.5 2"' : '') + '/>';
    }
    items.forEach(function (it, i) {
      svg += kit.plate({ id: 'mini', cx: x0 + i * pitch, cy: cy, s: s, t: t, state: states[i], pat: it });
    });
    if (fast) {
      var xs = x0, xe = x0 + 5 * pitch, y = 48;
      svg += '<path class="mini-lane" d="M' + xs + ' ' + (cy + 10) + ' V' + y + ' H' + xe + ' V' + (cy + 12) + '"/>' +
        '<polygon class="mini-arrow" points="' + (xe - 2.8) + ',' + (cy + 16.5) + ' ' + xe + ',' + (cy + 12) + ' ' + (xe + 2.8) + ',' + (cy + 16.5) + '"/>';
      svg += '<text class="mini-t blue" x="' + ((xs + xe) / 2) + '" y="' + (y + 14) + '" text-anchor="middle">TRY A VERSION FIRST · REFINE LATER</text>';
    } else {
      [[0, 1, 'UNDERSTAND'], [2, 2, 'DESIGN'], [3, 4, 'BUILD'], [5, 5, 'SHIP']].forEach(function (p) {
        var xa = x0 + p[0] * pitch - 12, xb = x0 + p[1] * pitch + 12, y = 42;
        svg += '<path class="mini-brk" d="M' + xa + ' ' + y + ' V' + (y + 3.5) + ' H' + xb + ' V' + y + '"/>' +
          '<text class="mini-t" x="' + ((xa + xb) / 2) + '" y="' + (y + 14) + '" text-anchor="middle">' + p[2] + '</text>';
      });
    }
    return svg + '</svg>';
  }

  /* ───────── detail(mode): the enlarged, animated horizontal diagram (modules only, no document layer).
     Same drawing as the two diagrams at the bottom of design-lab/blueprint-iso.html. Used by the mode-info popover. ───────── */
  function detail(mode) {
    var kit = window.FastBlueprintIso && window.FastBlueprintIso.kit;
    if (!kit) return '';
    var fast = mode === 'fast', plate = kit.plate;
    var W = 800, H = 316, s = 51, w = A * s, h = K * s, t = 6, P = 48, cy0 = 150, X0 = 70, PITCH = 132;
    var cols = [
      { items: ['req'], steps: 'STEP 1', title: 'Requirements', sub: ['Goals · triggers · criteria'] },
      { items: ['know'], steps: 'STEP 2', title: 'Business knowledge', sub: ['Rules · contracts · data'] },
      { items: ['doc', 'onto', 'agent'], steps: 'STEPS 3–5', title: 'Design plans', sub: ['Product · Ontology', '· Agent plans'] },
      { items: ['onto'], steps: 'STEP 6', title: 'Build ontology', sub: ['Objects · links · actions'] },
      { items: ['skillp', 'mcp', 'res'], steps: 'STEP 7', title: 'Skills · MCP · more', sub: ['Tools & resources', 'the Agent can use'] },
      { items: ['agent'], steps: 'STEP 8', title: 'Generate Agent', sub: ['Assemble & test'] }
    ];
    var fastLab = [
      ['LIGHT', 'Requirements', ['Quick alignment']],
      ['MOCK', 'Business knowledge', ['Placeholder data']],
      ['MOCK', 'Design plans', ['Product · Ontology', '· Agent plans']],
      ['MOCK', 'Ontology', ['Stubbed objects']],
      ['MOCK', 'Skills · MCP · more', ['Stubbed tools']],
      ['DRAFT', 'Agent', ['Generated right away']]
    ];
    var states = fast ? ['done', 'mock', 'mock', 'mock', 'mock', 'doing'] : ['done', 'done', 'done', 'done', 'done', 'doing'];
    cols.forEach(function (c, i) {
      c.cx = X0 + i * PITCH;
      var n = c.items.length;
      c.cys = c.items.map(function (_, k) { return cy0 + (k - (n - 1) / 2) * P; });
      c.state = states[i];
    });
    function surf(cy, d) { return cy + h * (1 - Math.abs(d) / w) + t; }
    var yA = 294, yB = 262, svg = '<svg class="mdg mdg-detail" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';

    if (fast) {
      var c0 = cols[0], c5 = cols[5];
      var xa0 = c0.cx - 16, xa5 = c5.cx - 16, ya0 = surf(c0.cys[0], -16), ya5 = surf(c5.cys[0], -16);
      var dA = 'M' + xa0 + ' ' + ya0 + ' V' + yA + ' H' + xa5 + ' V' + ya5;
      svg += '<path d="' + dA + '" fill="none" stroke="#1f82eb" stroke-width="1.6" stroke-linejoin="round"/>' + tri(xa5, ya5, '#1f82eb', 'up') +
        '<circle r="2.4" fill="#1f82eb"><animateMotion dur="3s" repeatCount="indefinite" path="' + dA + '"/></circle>';
      var xb = c5.cx + 16, yb0 = surf(c5.cys[0], 16);
      var dB = 'M' + xb + ' ' + yb0 + ' V' + yB + ' H' + cols[1].cx, bc = '#8f8f97';
      svg += '<path d="' + dB + '" fill="none" stroke="#fff" stroke-width="5"/>' +
        '<path d="' + dB + '" fill="none" stroke="' + bc + '" stroke-width="1.3" stroke-dasharray="4 3" stroke-linejoin="round"/>';
      for (var r = 1; r <= 4; r++) {
        var cr = cols[r], yTop = cr.cys[cr.cys.length - 1] + h + t;
        svg += '<path d="M' + cr.cx + ' ' + yB + ' V' + (yTop + 1) + '" fill="none" stroke="' + bc + '" stroke-width="1.3" stroke-dasharray="4 3"/>' + tri(cr.cx, yTop + 1, bc, 'up');
      }
      svg += '<circle r="2.2" fill="#22a05a"><animateMotion dur="3.4s" repeatCount="indefinite" path="' + dB + '"/></circle>';
    }

    for (var i = 0; i < 5; i++) {
      var a = cols[i], b = cols[i + 1], xr = a.cx + w, xl = b.cx - w;
      var mockLink = a.state === 'mock' || b.state === 'mock', lit = !fast, col = lit ? '#8f8f97' : '#c9c9ce';
      a.cys.forEach(function (ya, ia) {
        b.cys.forEach(function (yb, ib) {
          var d = ya === yb ? 'M' + xr + ' ' + ya + ' H' + xl : 'M' + xr + ' ' + ya + ' H' + (xr + 16) + ' L' + xl + ' ' + yb;
          svg += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="1"' + (mockLink ? ' stroke-dasharray="3 3"' : '') + '/>' +
            '<polygon points="' + (xl - 6) + ',' + (yb - 3) + ' ' + xl + ',' + yb + ' ' + (xl - 6) + ',' + (yb + 3) + '" fill="' + col + '"/>';
          if (lit) svg += '<circle r="2" fill="#22a05a"><animateMotion dur="2.4s" begin="-' + (i * 0.4 + (ia + ib) * 0.2 + 0.1).toFixed(1) + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
        });
      });
    }

    cols.forEach(function (c) {
      for (var k = c.items.length - 1; k >= 0; k--) svg += plate({ id: 'md', cx: c.cx, cy: c.cys[k], s: s, t: t, state: c.state, pat: c.items[k] });
    });

    cols.forEach(function (c, i) {
      var cap = fast ? fastLab[i][0] : c.steps;
      var capCls = fast ? (i === 0 ? 'light' : fastLab[i][0].toLowerCase()) : '';
      var title = fast ? fastLab[i][1] : c.title, sub = fast ? fastLab[i][2] : c.sub;
      svg += '<text class="cap ' + capCls + '" x="' + c.cx + '" y="16" text-anchor="middle">' + cap + '</text>' +
        '<text class="ttl" x="' + c.cx + '" y="34" text-anchor="middle">' + title + '</text>';
      sub.forEach(function (line, j) { svg += '<text class="sub" x="' + c.cx + '" y="' + (50 + j * 13) + '" text-anchor="middle">' + line + '</text>'; });
    });

    if (!fast) {
      var by = 276;
      [[0, 1, 'UNDERSTAND'], [2, 2, 'DESIGN'], [3, 4, 'BUILD'], [5, 5, 'SHIP']].forEach(function (p) {
        var x0 = cols[p[0]].cx - w, x1 = cols[p[1]].cx + w;
        svg += '<path class="brk" d="M' + x0 + ' ' + by + ' V' + (by + 6) + ' H' + x1 + ' V' + by + '"/><text class="ph" x="' + ((x0 + x1) / 2) + '" y="' + (by + 26) + '" text-anchor="middle">' + p[2] + '</text>';
      });
    } else {
      var pill = function (x, y, label, cls) {
        var wd = label.length * 6.7 + 22;
        return '<g class="pillb ' + (cls || '') + '"><rect x="' + (x - wd / 2) + '" y="' + (y - 10) + '" width="' + wd + '" height="20" rx="10"/><text x="' + x + '" y="' + (y + 3.5) + '" text-anchor="middle">' + label + '</text></g>';
      };
      svg += pill((cols[0].cx + cols[5].cx) / 2, yA, 'FAST LANE · DRAFT AGENT RIGHT AFTER ALIGNMENT', 'blue');
      svg += pill((cols[1].cx + cols[5].cx + 16) / 2 - 20, yB, 'TRY IT → REFINE THE MOCKS');
    }
    return svg + '</svg>';
  }

  window.FastFlowMap = { full: full, mini: mini, detail: detail };
})();
