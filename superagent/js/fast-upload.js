/**
 * Fast POC page ONLY — "upload documents" in the composer (not loaded by superagent.html).
 *   Click the paperclip → a macOS-style file picker opens, shows what can be uploaded (supported types,
 *   unsupported files greyed out), then auto-selects the documents and confirms. The chosen files land in the
 *   composer as chips (same .composer-ref pills as the original UI). Sending hands them to the chat.
 *
 *   FastUpload.has()          → true when files are attached
 *   FastUpload.take()         → [names] and clears the composer chips (used when sending)
 *   FastUpload.attachAll()    → attach every mock doc instantly (fallback when sending without clicking upload)
 *   FastUpload.chips(names)   → node: read-only chip row for the user bubble
 */
(function () {
  'use strict';
  var btn = document.getElementById('fd-upload');
  var row = document.getElementById('fd-att');
  var input = document.getElementById('composer-input');
  if (!btn || !row) return;

  var FTI = window.FileTypeIcons;
  var attached = [];
  var contexts = {};
  var running = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function docs() { return (window.FastDocs && window.FastDocs.all()) || []; }
  function icon(name, size) { return FTI ? FTI.markup(name, size || 14) : ''; }

  function diagnosisIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M14.7 6.3a4 4 0 0 0-5 5L4.6 16.4a2 2 0 1 0 2.8 2.8l5.1-5.1a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.6-.6-.6-2.6 2.6-1.8Z"/>' +
      '<path d="M18.5 2.5v3M17 4h3"/></svg>';
  }
  function isDiagnosis(name) { return String(name).indexOf('诊断 · 会话日志 ·') === 0; }
  function chipHtml(name, removable) {
    return '<span class="composer-ref-icon">' + (isDiagnosis(name) ? diagnosisIcon() : icon(name, 14)) + '</span>' +
      '<span class="composer-ref-label">' + esc(name) + '</span>' +
      (removable
        ? '<button type="button" class="composer-ref-remove fd-chip-x" aria-label="Remove ' + esc(name) + '">' +
          '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></button>'
        : '');
  }
  function chipNode(name, removable) {
    var c = document.createElement('span');
    c.className = 'composer-ref fd-chip' + (isDiagnosis(name) ? ' fd-chip-diagnosis' : '');
    c.setAttribute('data-doc', name);
    c.setAttribute('role', 'button');
    c.tabIndex = 0;
    c.title = name;
    c.innerHTML = chipHtml(name, removable);
    return c;
  }

  var collapsed = true;
  function syncMore() {
    var more = row.querySelector('.fd-more');
    if (attached.length <= 4) { if (more) more.remove(); row.classList.remove('is-collapsed'); return; }
    if (!more) {
      more = document.createElement('button');
      more.type = 'button';
      more.className = 'fd-more';
      more.addEventListener('click', function () { collapsed = !collapsed; syncMore(); });
      row.appendChild(more);
    }
    row.classList.toggle('is-collapsed', collapsed);
    more.textContent = collapsed ? '+' + (attached.length - 3) + ' more' : 'Show less';
  }
  function changed() {
    syncMore();
    row.hidden = attached.length === 0;
    btn.classList.toggle('has-files', attached.length > 0);
    if (input) input.dispatchEvent(new Event('input', { bubbles: true })); // refresh send state
  }
  function attach(name, animate) {
    if (attached.indexOf(name) >= 0) return;
    attached.push(name);
    var c = chipNode(name, true);
    if (animate) c.classList.add('is-in');
    var more = row.querySelector('.fd-more');
    row.insertBefore(c, more);
    changed();
  }

  row.addEventListener('click', function (e) {
    var x = e.target.closest('.fd-chip-x');
    if (!x) return;
    var chip = x.closest('.fd-chip');
    var name = chip.getAttribute('data-doc');
    attached = attached.filter(function (n) { return n !== name; });
    delete contexts[name];
    chip.remove();
    changed();
  });

  /* ───────── macOS-style picker ───────── */
  var KIND = { docx: 'Microsoft Word', xlsx: 'Microsoft Excel', md: 'Markdown', csv: 'CSV', txt: 'Plain Text', pdf: 'PDF Document' };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(iso) {
    var p = iso.split('-');
    return MON[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }
  var NO = [
    { name: 'Brand assets final.psd', date: 'Aug 4, 2026', size: '412 MB', kind: 'Photoshop Document' },
    { name: 'Offsite recap.mp4', date: 'Sep 27, 2026', size: '1.2 GB', kind: 'MPEG-4 movie' },
    { name: 'Installer-v2.dmg', date: 'Jun 11, 2026', size: '86 MB', kind: 'Disk Image' },
    { name: 'Archive 2024.zip', date: 'Jan 9, 2026', size: '231 MB', kind: 'ZIP archive' },
  ];
  var SUPPORTED = 'PDF · Word · Excel · PPT · Markdown · TXT · CSV · images';

  var FOLDER_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';
  var CHEV_L = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';
  var CHEV_R = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  var SIDE = [
    ['Favorites', [['Recents', 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'], ['Desktop', 'M3 5h18v11H3zM8 20h8M12 16v4'], ['Documents', 'M7 3h7l5 5v13H7zM14 3v5h5', true], ['Downloads', 'M12 4v11M7 11l5 5 5-5M5 20h14']]],
    ['Locations', [['Macintosh HD', 'M4 8h16v8H4zM7 12h.01'], ['Shared drive', 'M3 6h18v12H3zM3 10h18']]],
  ];

  function pickerRows() {
    var ok = docs().slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var rows = ok.map(function (d) {
      var ext = d.name.split('.').pop().toLowerCase();
      return { name: d.name, date: fmtDate(d.updated), size: d.size, kind: KIND[ext] || 'Document', ok: true };
    });
    NO.forEach(function (n, i) {
      var r = { name: n.name, date: n.date, size: n.size, kind: n.kind, ok: false };
      rows.splice(Math.min(rows.length, 2 + i * 3), 0, r);
    });
    return rows;
  }

  function buildPicker(rows) {
    var root = document.createElement('div');
    root.className = 'fd-finder';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Choose files to upload');
    root.innerHTML =
      '<div class="fd-f-win">' +
        '<div class="fd-f-bar">' +
          '<div class="fd-f-dots" aria-hidden="true"><i></i><i></i><i></i></div>' +
          '<div class="fd-f-nav" aria-hidden="true"><span>' + CHEV_L + '</span><span class="is-off">' + CHEV_R + '</span></div>' +
          '<div class="fd-f-loc">' + FOLDER_SVG + '<b>T1 Sourcing materials</b></div>' +
          '<div class="fd-f-search" aria-hidden="true">Search</div>' +
        '</div>' +
        '<div class="fd-f-main">' +
          '<aside class="fd-f-side">' +
            SIDE.map(function (s) {
              return '<div class="fd-f-sec">' + s[0] + '</div>' + s[1].map(function (it) {
                return '<div class="fd-f-item' + (it[2] ? ' is-on' : '') + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + it[1] + '"/></svg>' + it[0] + '</div>';
              }).join('');
            }).join('') +
          '</aside>' +
          '<div class="fd-f-list" role="listbox" aria-multiselectable="true">' +
            '<div class="fd-f-row fd-f-head"><span>Name</span><span>Date Modified</span><span>Size</span><span>Kind</span></div>' +
            rows.map(function (r, i) {
              return '<div class="fd-f-row' + (r.ok ? '' : ' is-off') + '" role="option" aria-selected="false" data-i="' + i + '"' + (r.ok ? '' : ' title="Not supported"') + '>' +
                '<span class="fd-f-name">' + (FTI ? FTI.markup(r.name, 16) : '') + '<span>' + esc(r.name) + '</span></span>' +
                '<span>' + esc(r.date) + '</span><span>' + esc(r.size) + '</span><span>' + esc(r.kind) + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="fd-f-foot">' +
          '<div class="fd-f-hint"><b>Supported</b> ' + SUPPORTED + ' (≤ 50 MB each)</div>' +
          '<div class="fd-f-btns">' +
            '<button type="button" class="fd-f-btn" data-act="cancel">Cancel</button>' +
            '<button type="button" class="fd-f-btn is-primary" data-act="open" disabled>Open</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    return root;
  }

  async function run() {
    if (running || attached.length) return;
    running = true;
    btn.classList.add('is-busy');
    var rows = pickerRows();
    var root = buildPicker(rows);
    document.body.appendChild(root);
    var aborted = false;
    var openBtn = root.querySelector('[data-act="open"]');
    function end() { root.classList.remove('is-in'); setTimeout(function () { root.remove(); }, 180); }
    function abort() { aborted = true; end(); document.removeEventListener('keydown', onKey, true); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); abort(); } }
    document.addEventListener('keydown', onKey, true);
    root.querySelector('[data-act="cancel"]').addEventListener('click', abort);
    requestAnimationFrame(function () { root.classList.add('is-in'); });

    await sleep(900); // let the user read what can be uploaded
    var picked = [];
    var els = root.querySelectorAll('.fd-f-row[data-i]');
    for (var i = 0; i < rows.length && !aborted; i++) {
      if (!rows[i].ok) continue;
      els[i].classList.add('is-sel');
      els[i].setAttribute('aria-selected', 'true');
      els[i].scrollIntoView({ block: 'nearest' });
      picked.push(rows[i].name);
      openBtn.disabled = false;
      openBtn.textContent = 'Open (' + picked.length + ')';
      await sleep(170);
    }
    if (!aborted) {
      await sleep(650);
      openBtn.classList.add('is-pressed');
      await sleep(240);
    }
    if (aborted) { running = false; btn.classList.remove('is-busy'); return; }
    document.removeEventListener('keydown', onKey, true);
    end();
    await sleep(220);
    for (var k = 0; k < picked.length; k++) {
      attach(picked[k], true);
      await sleep(80);
    }
    running = false;
    btn.classList.remove('is-busy');
    if (input) input.focus();
  }

  btn.addEventListener('click', function () { run(); });

  window.FastUpload = {
    has: function () { return attached.length > 0; },
    busy: function () { return running; },
    take: function () {
      var out = attached.slice();
      attached = [];
      out.forEach(function (name) { delete contexts[name]; });
      collapsed = true;
      row.innerHTML = '';
      changed();
      return out;
    },
    add: function (name) { attach(name, true); },
    addContext: function (name, payload) {
      contexts[name] = payload;
      attach(name, true);
    },
    contextText: function () {
      return attached.map(function (name) { return contexts[name] || ''; }).filter(Boolean).join('\n\n');
    },
    attachAll: function () { docs().forEach(function (d) { attach(d.name, false); }); },
    chips: function (names) {
      var w = document.createElement('div');
      w.className = 'fd-att-msg';
      names.forEach(function (n) { w.appendChild(chipNode(n, false)); });
      return w;
    },
  };
})();
