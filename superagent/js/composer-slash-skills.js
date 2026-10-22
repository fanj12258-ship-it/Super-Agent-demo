/**
 * Shared composer asset — type "/" to browse and insert a demo Skill command.
 * The palette is intentionally local/demo-only; selecting a row inserts the
 * command into the composer so the normal send flow remains unchanged.
 */
(function () {
  'use strict';

  var input = document.getElementById('composer-input');
  var dock = document.querySelector('.composer-dock');
  if (!input || !dock) return;

  var SKILLS = [
    { id: 'deep-research', name: '深度研究', desc: '检索并综合多个来源，输出带依据的研究结论', official: true },
    { id: 'document-review', name: '文档审阅', desc: '检查文档中的缺口、冲突和风险项', official: true },
    { id: 'data-analysis', name: '数据分析', desc: '分析表格数据并生成关键指标与洞察' },
    { id: 'workflow-planner', name: '任务规划', desc: '把目标拆成可执行任务、依赖和审核点' },
    { id: 'ontology-design', name: '本体设计', desc: '梳理业务对象、关系、属性与动作' },
    { id: 'prototype-review', name: '原型评审', desc: '检查核心流程、异常状态与交互完整性' },
    { id: 'meeting-summary', name: '会议纪要', desc: '提炼结论、待办、负责人和截止时间' },
    { id: 'web-search', name: '联网搜索', desc: '搜索最新公开资料并整理来源链接', official: true },
  ];

  var menu = document.createElement('div');
  menu.className = 'slash-menu';
  menu.id = 'composer-skill-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', '可调用的 Skills');
  dock.insertBefore(menu, dock.firstChild);

  var shown = [];
  var active = 0;
  var open = false;
  var range = null;

  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char];
    });
  }

  function icon() {
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
      '<path d="m8 1.8 1.15 3.05L12.2 6 9.15 7.15 8 10.2 6.85 7.15 3.8 6l3.05-1.15L8 1.8Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>' +
      '<path d="m12.3 9.5.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55.55-1.45Z" fill="currentColor"/></svg>';
  }

  function render() {
    var html = '<div class="slash-group">Skills <span>输入名称可筛选</span></div>';
    if (!shown.length) {
      html += '<div class="slash-empty">没有匹配的 Skill</div>';
    } else {
      shown.forEach(function (skill, index) {
        html += '<button type="button" class="slash-row' + (index === active ? ' is-active' : '') + '"' +
          ' role="option" aria-selected="' + (index === active) + '" data-skill-index="' + index + '" id="composer-skill-' + index + '">' +
          '<span class="slash-row-icon">' + icon() + '</span>' +
          '<span class="slash-row-name">/' + esc(skill.id) + '</span>' +
          '<span class="slash-tag' + (skill.official ? ' slash-tag-official' : '') + '">' + (skill.official ? '官方' : 'Skill') + '</span>' +
          '<span class="slash-row-desc">' + esc(skill.name) + ' · ' + esc(skill.desc) + '</span></button>';
      });
      html += '<div class="slash-hint"><span>↑↓ 选择</span><span>Enter 插入</span><span>Esc 关闭</span></div>';
    }
    menu.innerHTML = html;
    input.setAttribute('aria-activedescendant', shown.length ? 'composer-skill-' + active : '');
    var current = menu.querySelector('.slash-row.is-active');
    if (current) current.scrollIntoView({ block: 'nearest' });
  }

  function show(query) {
    var normalized = String(query || '').toLowerCase();
    shown = SKILLS.filter(function (skill) {
      return !normalized ||
        skill.id.indexOf(normalized) >= 0 ||
        skill.name.toLowerCase().indexOf(normalized) >= 0 ||
        skill.desc.toLowerCase().indexOf(normalized) >= 0;
    });
    active = 0;
    open = true;
    menu.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    render();
  }

  function hide() {
    if (!open) return;
    open = false;
    range = null;
    menu.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function detect() {
    var value = input.value;
    var caret = input.selectionStart == null ? value.length : input.selectionStart;
    var match = /(^|\s)\/([^\s/]{0,40})$/.exec(value.slice(0, caret));
    if (!match) {
      hide();
      return;
    }
    range = { from: caret - match[2].length - 1, to: caret };
    show(match[2]);
  }

  function pick(index) {
    var skill = shown[index];
    if (!skill || !range) return;
    var value = input.value;
    var command = '/' + skill.id + ' ';
    input.value = value.slice(0, range.from) + command + value.slice(range.to);
    var caret = range.from + command.length;
    hide();
    input.focus();
    try { input.setSelectionRange(caret, caret); } catch (error) { /* no-op */ }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  input.setAttribute('aria-haspopup', 'listbox');
  input.setAttribute('aria-controls', menu.id);
  input.setAttribute('aria-expanded', 'false');
  input.addEventListener('input', detect);
  input.addEventListener('click', detect);
  input.addEventListener('blur', function () { setTimeout(hide, 120); });
  input.addEventListener('keydown', function (event) {
    if (!open) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (shown.length) {
        active = (active + (event.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length;
        render();
      }
    } else if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey && !event.isComposing) {
      if (shown.length) {
        event.preventDefault();
        event.stopImmediatePropagation();
        pick(active);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      hide();
    }
  }, true);

  menu.addEventListener('mousedown', function (event) { event.preventDefault(); });
  menu.addEventListener('mousemove', function (event) {
    var row = event.target.closest('[data-skill-index]');
    if (!row) return;
    var index = +row.getAttribute('data-skill-index');
    if (index !== active) {
      active = index;
      menu.querySelectorAll('[data-skill-index]').forEach(function (item) {
        item.classList.toggle('is-active', +item.getAttribute('data-skill-index') === active);
        item.setAttribute('aria-selected', +item.getAttribute('data-skill-index') === active ? 'true' : 'false');
      });
    }
  });
  menu.addEventListener('click', function (event) {
    var row = event.target.closest('[data-skill-index]');
    if (row) pick(+row.getAttribute('data-skill-index'));
  });
})();
