/**
 * Fast POC page ONLY — "转入按流程打造" confirmation dialog (not loaded by superagent.html).
 *   FastSwitchDialog.confirm() → Promise<boolean>   true = start 按流程打造, false = stay in 轻量模式
 *   FastSwitchDialog.picked    → [doc names] the user left ticked (demo only: the rest of the flow does not change)
 * Shows how what the quick version made maps onto the 8-step flow: 沿用 / 需校对 / Mock 需改 / 需再创作.
 * FastHandoff.start() asks this first; every "转入按流程打造" button ends up there.
 */
(function () {
  'use strict';

  var ST = {
    keep: { t: '沿用', dot: 'keep' },
    chk: { t: '需校对', dot: 'chk' },
    mock: { t: 'Mock 需改', dot: 'mock' },
    'new': { t: '需再创作', dot: 'new' }
  };
  var DATA = [
    ['1', 'Requirements', [
      ['Requirements brief', '对话整理的需求与 5 个决策', '直接作为基线', 'keep'],
      ['Success criteria', '', '补写可以验收的标准', 'new']
    ]],
    ['2', 'Business knowledge', [
      ['Contracts · rules', '已上传的合同与准入标准', '内容是真实的', 'keep'],
      ['Process notes', '流程说明、访谈纪要、异常记录', '内容是真实的', 'keep'],
      ['ERP export', '14 条样例报价', '换成完整导出再确认', 'chk']
    ]],
    ['3–5', 'Design plans', [
      ['Product plan', '轻量模式起草的方案', '含临时假设，逐条校对', 'chk'],
      ['Ontology plan', '轻量模式起草的方案', '含临时假设，逐条校对', 'chk'],
      ['Agent plan', '轻量模式起草的方案', '含临时假设，逐条校对', 'chk']
    ]],
    ['6', 'Build ontology', [
      ['Data source spec', '由字段字典生成的数据源说明', '接入真实 ERP 后重写', 'mock'],
      ['Semantic graph', '5 个对象 · 5 条关系（AI 模拟）', '按真实数据校对后重建', 'mock']
    ]],
    ['7', 'Skills · MCP · more', [
      ['Skill specs', '固定阈值与权重', '规则可配置、带版本', 'mock'],
      ['MCP specs', '样例 ERP 接口', '换成真实接口', 'mock'],
      ['Resource list', '', '补充需要的外部资源', 'new']
    ]],
    ['8', 'Generate Agent', [
      ['Agent spec', '基于 Mock 的本体和 Skill 生成', '上游替换后重新生成', 'mock']
    ]]
  ];
  var CHECK = '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.3L5 8.8l4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var api = { picked: null, confirm: confirm, data: DATA, status: ST };
  window.FastSwitchDialog = api;

  function total() { return DATA.reduce(function (n, g) { return n + g[2].length; }, 0); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function build() {
    var count = { keep: 0, chk: 0, mock: 0, 'new': 0 };
    DATA.forEach(function (g) { g[2].forEach(function (r) { count[r[3]]++; }); });

    var list = '';
    DATA.forEach(function (g) {
      list += '<section class="fsw-grp" data-g="' + g[0] + '"><h3><span>STEP ' + g[0] + '</span>' + g[1] + '</h3>';
      g[2].forEach(function (r) {
        var s = ST[r[3]], empty = !r[1];
        list += '<div class="fsw-row" role="presentation" data-s="' + r[3] + '" data-name="' + esc(r[0]) + '">' +
          '<button type="button" class="fsw-ck is-on" role="checkbox" aria-checked="true" aria-label="带过去 ' + esc(r[0]) + '">' + CHECK + '</button>' +
          '<div class="fsw-main"><b>' + esc(r[0]) + '</b><span>' + (empty ? '轻量模式里还没有' : esc(r[1])) + '<i aria-hidden="true">→</i>' + esc(r[2]) + '</span></div>' +
          '<span class="fsw-st t-' + r[3] + '"><i></i>' + s.t + '</span>' +
          '</div>';
      });
      list += '</section>';
    });

    var segs = '<button type="button" class="on" data-k="all">全部<em>' + total() + '</em></button>' +
      Object.keys(ST).map(function (k) { return '<button type="button" data-k="' + k + '">' + ST[k].t + '<em>' + count[k] + '</em></button>'; }).join('');

    var box = document.createElement('div');
    box.className = 'fsw';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', '转入按流程打造');
    box.innerHTML =
      '<div class="fsw-backdrop" data-fsw="no"></div>' +
      '<div class="fsw-dialog">' +
        '<div class="fsw-head"><div>' +
          '<h2 class="fsw-title">转入按流程打造</h2>' +
          '<p class="fsw-intro">轻量模式里做出来的内容，会放进流程的 8 个步骤里。勾选要带过去的，其余进去之后再补。</p></div>' +
          '<button type="button" class="fsw-close" data-fsw="no" aria-label="关闭"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
        '<div class="fsw-bar"><div class="fsw-seg" role="tablist">' + segs + '</div>' +
          '<button type="button" class="fsw-all" role="checkbox" aria-checked="true"><span class="fsw-ck is-on">' + CHECK + '</span>全选</button></div>' +
        '<div class="fsw-body">' + list + '</div>' +
        '<div class="fsw-foot"><span class="fsw-hint"></span><div class="fsw-actions">' +
          '<button type="button" class="fsw-btn ghost" data-fsw="no">先不转，继续试用</button>' +
          '<button type="button" class="fsw-btn primary" data-fsw="yes">开始按流程打造</button></div></div>' +
      '</div>';
    return box;
  }

  function confirm() {
    return new Promise(function (resolve) {
      var box = build(), done = false;
      var body = box.querySelector('.fsw-body'), hint = box.querySelector('.fsw-hint'), go = box.querySelector('[data-fsw="yes"]');
      var allBtn = box.querySelector('.fsw-all'), allCk = allBtn.querySelector('.fsw-ck');
      var prevFocus = document.activeElement;

      function cks() { return [].slice.call(body.querySelectorAll('.fsw-ck')); }
      function ticked() { return cks().filter(function (b) { return b.classList.contains('is-on'); }).map(function (b) { return b.closest('.fsw-row').getAttribute('data-name'); }); }
      function paint() {
        var n = ticked().length, all = total();
        hint.textContent = '已选 ' + n + ' / ' + all + ' 份带过去';
        go.disabled = n === 0;
        allCk.classList.toggle('is-on', n === all); allCk.classList.toggle('is-part', n > 0 && n < all);
        allBtn.setAttribute('aria-checked', n === all ? 'true' : n ? 'mixed' : 'false');
      }
      function finish(v) {
        if (done) return; done = true;
        if (v) api.picked = ticked();
        document.removeEventListener('keydown', onKey, true);
        box.classList.add('is-out');
        setTimeout(function () { box.remove(); }, 160);
        if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) { /* ignore */ }
        resolve(v);
      }
      function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); finish(false); } }
      function setCk(b, on) { b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }
      function filter(k) {
        body.querySelectorAll('.fsw-row').forEach(function (r) { r.hidden = k !== 'all' && r.getAttribute('data-s') !== k; });
        body.querySelectorAll('.fsw-grp').forEach(function (g) { g.hidden = !g.querySelector('.fsw-row:not([hidden])'); });
        body.scrollTop = 0;
      }

      box.addEventListener('click', function (e) {
        var a = e.target.closest('[data-fsw]');
        if (a) { if (a.getAttribute('data-fsw') === 'yes' && a.disabled) return; finish(a.getAttribute('data-fsw') === 'yes'); return; }
        var seg = e.target.closest('.fsw-seg button');
        if (seg) {
          box.querySelectorAll('.fsw-seg button').forEach(function (b) { b.classList.toggle('on', b === seg); });
          filter(seg.getAttribute('data-k')); return;
        }
        if (e.target.closest('.fsw-all')) {
          var on = ticked().length !== total();
          cks().forEach(function (b) { setCk(b, on); }); paint(); return;
        }
        var row = e.target.closest('.fsw-row');
        if (row) { var ck = row.querySelector('.fsw-ck'); setCk(ck, !ck.classList.contains('is-on')); paint(); }
      });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(box);
      paint();
      requestAnimationFrame(function () { box.classList.add('is-in'); go.focus(); });
    });
  }
})();
