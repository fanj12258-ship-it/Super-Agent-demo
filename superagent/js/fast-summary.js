/**
 * Conversation summary — shared by superagent.html and superagent-fast.html.
 *
 * A "摘要" button sits at the right end of the conversation tab bar and always acts on the CURRENT tab:
 * what the user asked for, what the Agent changed, what was discussed, what the Agent produced.
 * The popover ends with "存入文件目录": the summary becomes a Markdown document in the left Files tree
 * (Deliverables / 会话摘要).
 *
 *   FastSummary.provide(tabTitle, { asks:[], did:[], talked:[], out:[] })   curated summary for a tab (demo seed)
 *   FastSummary.open() / close()
 *
 * Without a curated entry the summary is read from the live thread: user bubbles → asks, process rows
 * "已更新/已同步…" → did, "已生成/已起草…" + cited deliverables → out, first sentence of each answer → talked.
 */
(function () {
  'use strict';
  var bar = document.getElementById('cv-bar');
  var thread = document.getElementById('chat-thread');
  if (!bar || !thread) return;

  var provided = {};
  var saved = {};     // tab title → doc name
  var pop = null, open = false, cache = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }
  function uniq(a) { var seen = {}; return a.filter(function (x) { if (!x || seen[x]) return false; seen[x] = 1; return true; }); }
  function curTab() { var t = bar.querySelector('.cv-tab.is-cur .cv-tab-t'); return t ? t.textContent.trim() : '当前对话'; }
  function sceneName() { var h = document.getElementById('center-head-title'); return h ? h.textContent.trim() : ''; }
  function firstSentence(t) { var m = String(t || '').replace(/\s+/g, ' ').trim().match(/^[^。！？!?]+[。！？!?]?/); return m ? m[0] : ''; }

  /* ───────── read the live thread ───────── */
  function collect() {
    var title = curTab();
    var turns = thread.querySelectorAll('.chat-msg-user').length;
    if (provided[title]) {
      var p = provided[title];
      return { title: title, turns: turns || 1, asks: p.asks || [], did: p.did || [], talked: p.talked || [], out: p.out || [] };
    }
    var asks = [], did = [], out = [], talked = [];
    [].forEach.call(thread.querySelectorAll('.chat-msg-user .chat-bubble-user'), function (b) {
      var t = clip(b.textContent, 64); if (t) asks.push(t);
    });
    [].forEach.call(thread.querySelectorAll('.chat-msg-assistant'), function (a) {
      [].forEach.call(a.querySelectorAll('.ao-process .activity-row.nested'), function (r) {
        var t = r.textContent.trim();
        if (/^已(更新|修改|同步|调整|改)/.test(t)) did.push(t.replace(/^已/, ''));
        else if (/^已(生成|起草|写入|创建|导出)/.test(t)) out.push(t.replace(/^已/, ''));
      });
      [].forEach.call(a.querySelectorAll('.ao-answer a.chat-cite'), function (l) {
        var href = l.getAttribute('href'), d = window.FastDocs && window.FastDocs.find(href);
        if (d && d.deliverable) out.push(d.name.replace(/\.md$/, ''));
      });
      var ans = a.querySelector('.ao-answer p');
      if (ans) { var s = firstSentence(ans.textContent); if (s && !/^欢迎回来/.test(s)) talked.push(clip(s, 60)); }
    });
    return { title: title, turns: turns, asks: uniq(asks), did: uniq(did), talked: uniq(talked), out: uniq(out) };
  }
  function isEmpty(s) { return !(s.asks.length || s.did.length || s.talked.length || s.out.length); }

  var SECTIONS = [
    ['asks', '需求与变更', '会话开始'],
    ['talked', '关键讨论', '讨论中'],
    ['did', '执行记录', '随后'],
    ['out', '产出与结论', '当前'],
  ];

  /* ───────── popover ───────── */
  function body(s) {
    if (isEmpty(s)) return '<div class="sm-empty">这个对话还没有可以总结的内容。</div>';
    var shown = SECTIONS.filter(function (k) { return s[k[0]].length; });
    return '<div class="sm-line">' + shown.map(function (k, i) {
      var list = s[k[0]];
      return '<section class="sm-step"><span class="sm-node" aria-hidden="true">' + (i + 1) + '</span>' +
        '<div class="sm-step-main"><div class="sm-step-head"><b>' + k[1] + '</b><span>' + k[2] + '</span></div>' +
        '<ul>' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></section>';
    }).join('') + '</div>';
  }
  function foot(s) {
    var name = saved[s.title];
    if (name) return '<span class="sm-done">已存入 Files · 会话摘要</span><a href="#" class="sm-link" data-sm-open>打开</a><button type="button" class="sm-btn" data-sm-save>更新文档</button>';
    return '<span class="sm-hint">存成文档，放进左侧 Files</span><button type="button" class="sm-btn is-primary" data-sm-save' + (isEmpty(s) ? ' disabled' : '') + '>存入文件目录</button>';
  }
  function render() {
    cache = collect();
    var now = new Date(), hm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var total = SECTIONS.reduce(function (n, k) { return n + cache[k[0]].length; }, 0);
    pop.innerHTML =
      '<div class="sm-head"><div class="sm-title-row"><div class="sm-t"><b>对话摘要</b><span>' + esc(cache.title) + '</span></div>' +
      '<span class="sm-auto">自动整理</span></div>' +
      '<div class="sm-meta"><span>' + esc(sceneName() || '当前场景') + '</span><i></i><span>' + (cache.turns || 1) + ' 轮对话</span><i></i><span>' + total + ' 条记录</span><i></i><span>更新于 ' + hm + '</span></div></div>' +
      '<div class="sm-body">' + body(cache) + '</div>' +
      '<div class="sm-foot">' + foot(cache) + '</div>';
  }
  function place() {
    var col = document.querySelector('.main-column'); if (!col) return;
    var cr = col.getBoundingClientRect();
    pop.style.width = Math.min(430, cr.width - 16) + 'px';
  }
  function show() {
    if (!pop) return;
    var menu = document.getElementById('cv-menu'); if (menu && !menu.hidden) bar.querySelector('.cv-allbtn').click();
    render(); pop.hidden = false; open = true; btn.setAttribute('aria-expanded', 'true'); bar.classList.add('sm-open'); place();
  }
  function hide() { if (!pop) return; pop.hidden = true; open = false; btn.setAttribute('aria-expanded', 'false'); bar.classList.remove('sm-open'); }

  var ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h9"/></svg>';
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'cv-sum'; btn.id = 'cv-sum';
  btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.title = '本对话的摘要';
  btn.innerHTML = ICON + '<span>摘要</span>';
  bar.appendChild(btn);

  pop = document.createElement('div');
  pop.className = 'sm-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', '对话摘要');
  bar.appendChild(pop);

  btn.addEventListener('click', function (e) { e.stopPropagation(); open ? hide() : show(); });
  pop.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { if (open) hide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { hide(); btn.focus(); } });
  /* switching tabs → the summary belongs to another conversation */
  bar.querySelector('.cv-tabs').addEventListener('click', function () { if (open) hide(); });

  /* ───────── save into the Files tree ───────── */
  function mdOf(s) {
    var d = new Date(), hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var m = '# 对话摘要 · ' + s.title + '\n\n' +
      '| 项目 | 内容 |\n|---|---|\n| 场景 | ' + (sceneName() || '—') + ' |\n| 对话 | ' + s.title + '，共 ' + (s.turns || 1) + ' 轮 |\n| 生成 | 今天 ' + hh + ' |\n';
    SECTIONS.forEach(function (k) {
      var list = s[k[0]]; if (!list.length) return;
      m += '\n## ' + k[1] + '\n\n' + list.map(function (x) { return '- ' + x; }).join('\n') + '\n';
    });
    return m;
  }
  function save() {
    var s = cache || collect(); if (isEmpty(s)) return;
    var FD = window.FastDocs, FF = window.FastFiles; if (!FD || !FF) return;
    var name = '对话摘要 · ' + s.title + '.md', md = mdOf(s);
    var d = FD.find(name);
    if (d) FD.setMd(name, md);
    else {
      FD.register({ kind: 'md', deliverable: true, folder: '会话摘要', name: name, size: '1 KB', pages: '1 页', updated: '今天', author: '你 · 摘要',
        note: '「' + s.title + '」对话的摘要', md: md });
      var row = FF.addDeliverable('会话摘要/' + name);
      if (row && row.scrollIntoView) setTimeout(function () { row.scrollIntoView({ block: 'nearest' }); }, 60);
    }
    saved[s.title] = name;
    FF.showTab(true);
    render();
  }
  pop.addEventListener('click', function (e) {
    if (e.target.closest('[data-sm-save]')) { e.preventDefault(); save(); return; }
    var o = e.target.closest('[data-sm-open]');
    if (o) { e.preventDefault(); var n = saved[cache && cache.title]; if (n && window.FastDocs) { hide(); window.FastDocs.open(n); } }
  });

  window.FastSummary = {
    provide: function (title, o) { provided[title] = o; },
    open: show,
    close: hide,
  };
})();
