/**
 * Fast POC page ONLY — "New scenario" demo flow (sidebar path).
 *   1. Click "New scenario+"  → shared modal opens (js/create-scene-modal.js)
 *   2. Press Space in any field → fills with the first scene's info (A1 Supplier…)
 *   3. Click Create → A1 card appears in the sidebar + dropdown, and the Agent
 *      posts a detailed confirmation in the center chat.
 * Shared modal code is untouched: we intercept Space in the capture phase and
 * use the modal's public onCreate hook.
 */
(function () {
  'use strict';
  var form = document.getElementById('create-scene-form');
  var confirmBtn = document.getElementById('create-scene-confirm');
  if (!form) return;

  var A1 = {
    name: 'A1 Supplier intelligent sourcing & admission',
    desc: 'Application scenario for supplier sourcing strategy, discovery, and admission.',
    biz: [
      { name: 'T1 Sourcing strategy (v2.1 new step)', desc: 'Business scenario for drafting and confirming the sourcing strategy.', priority: 'Important' },
    ],
  };

  function setVal(node, v) {
    if (!node) return;
    node.value = v;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Stream text into a field a few characters at a time (typewriter) */
  async function typeInto(node, text, step, ms) {
    if (!node) return;
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: 'nearest' });
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i += step) {
      setVal(node, chars.slice(0, i + step).join(''));
      confirmBtn.disabled = true; // keep Create locked until the whole fill is done
      await sleep(ms);
    }
  }

  var typing = false;
  async function fillDemo() {
    typing = true;
    confirmBtn.disabled = true;
    /* make sure both business cards exist first (adding re-renders the form) */
    var addBtn = form.querySelector('[data-add-biz]');
    while (addBtn && form.querySelectorAll('[data-biz-field="name"]').length < A1.biz.length) addBtn.click();
    form.scrollTop = 0;

    await typeInto(form.querySelector('#create-scene-name'), A1.name, 1, 14);
    await sleep(120);
    await typeInto(form.querySelector('[data-app-field="appDesc"]'), A1.desc, 3, 14);

    var names = form.querySelectorAll('[data-biz-field="name"]');
    var descs = form.querySelectorAll('[data-biz-field="desc"]');
    for (var i = 0; i < A1.biz.length; i++) {
      var b = A1.biz[i];
      await sleep(160);
      await typeInto(names[i], b.name, 1, 14);
      var id = names[i].getAttribute('data-biz-id');
      var seg = form.querySelector('[data-priority="' + b.priority + '"][data-biz-id="' + id + '"]');
      if (seg) seg.click();
      await typeInto(descs[i], b.desc, 3, 14);
    }
    setVal(form.querySelector('#create-scene-name'), A1.name); // re-sync Create enabled state
    confirmBtn.focus({ preventScroll: true });
    typing = false;
  }

  form.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.code !== 'Space') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation(); // keep the shared "Customer service hub" demo fill from running
    if (!typing) fillDemo();
  }, true);

  window.WorkshopCreateScene = window.WorkshopCreateScene || {};

  /* sidebar Continue crafting ↔ chat card「进入打造」— same enter path */
  var lastCtx = null;       // { biz, title } from the latest create
  var pendingCard = null;   // FastSceneCard waiting for enter/later
  var entered = false;

  function a1BuildBtn() {
    return document.querySelector('[data-fast-scene="a1"] .scene-unit-app .scene-build');
  }
  function setLinkCue(on) {
    var b = a1BuildBtn();
    if (b) {
      b.classList.toggle('is-linked', !!on);
      b.title = on ? '与对话区「进入打造」同一入口' : '';
    }
  }

  function selectSceneChrome(t1) {
    var item = document.querySelector('.ov-menu-item[data-scene="biz-t1"]');
    if (item) item.click(); // shared menu handler updates label + checkmark + closes
    var h = document.getElementById('center-head-title');
    if (h) h.textContent = t1;
  }

  /* Enter the T1 room: dropdown label + page title switch, fresh chat, welcome turn */
  function enterRoom(biz, title) {
    entered = true;
    setLinkCue(false);
    pendingCard = null;
    var t1 = biz[0] ? biz[0].name : 'T1 Sourcing strategy (v2.1 new step)';
    selectSceneChrome(t1);
    if (window.FastFiles) window.FastFiles.reset();
    if (window.FastDocs && window.FastDocs.resetView) window.FastDocs.resetView();
    if (window.WorkshopPanels) window.WorkshopPanels.setRightOpen(true);
    window.FastChat.clearThread();
    if (window.FastJourney) window.FastJourney.begin();

    var md =
      '欢迎来到 **' + t1 + '**。这个场景属于 **' + title + '**，我会在这里陪你把寻源的条件和策略一步步理清楚。\n\n' +
      '我刚检索了一下：目前这里还没有素材和交付物，所以先跟你确认几件事：\n\n' +
      '1. 这次主要给哪类物料或品类寻源？比如原材料、零部件，还是服务？\n' +
      '2. 通常在什么情况下会发起寻源？比如新品导入、成本优化，还是供应商出问题需要替换？\n' +
      '3. 筛选候选供应商时，有哪些必须满足的硬性条件？比如资质、产能、交期、价格区间。';

    window.FastChat.run({
      process: async function (api) {
        await api.sleep(450);
        await api.W('已进入「' + t1 + '」，先看看这个场景里已经有哪些信息。');
        await api.sleep(350);
        await api.V({ id: 'rm-scene', icon: 'search', label: '已检索场景信息 · ' + t1, details: ['读取场景描述与所属应用场景', '所属：' + title, '场景状态：Crafting'] });
        await api.sleep(260);
        await api.V({ id: 'rm-files', icon: 'knowledge', label: '已检索已有素材与交付物', details: ['素材：暂无', '交付物：暂无', '知识库中没有与该场景关联的文档'] });
        window.FastBlueprint && window.FastBlueprint.set('req', 'doing', 'To confirm');
        await api.sleep(450);
        await api.W('已有信息还很少，我先跟你确认几件事，把寻源的条件定清楚。');
        await api.sleep(400);
      },
      segments: [{ md: md, gap: 340 }],
    });
  }

  /* one entry: chat「进入打造」or sidebar Continue crafting */
  function requestEnter() {
    if (entered || (window.FastJourney && window.FastJourney.active && window.FastJourney.active())) return;
    if (window.FastChat && window.FastChat.isBusy() && !pendingCard) return;
    if (pendingCard && pendingCard.pick) {
      pendingCard.pick('enter');
      return;
    }
    var ctx = lastCtx || { biz: A1.biz, title: A1.name };
    enterRoom(ctx.biz, ctx.title);
  }

  var cardsHost = document.getElementById('scene-cards');
  if (cardsHost) {
    cardsHost.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fast-scene="a1"] .scene-unit-app .scene-build');
      if (!b) return;
      e.preventDefault();
      requestEnter();
    });
  }

  /* chat-first path (js/fast-intake.js): the user said yes in conversation instead of filling the form */
  window.WorkshopCreateScene.demo = A1;
  window.WorkshopCreateScene.fromChat = function () {
    window.WorkshopCreateScene.onCreate({ title: A1.name, desc: A1.desc, businesses: A1.biz, fromChat: true });
  };

  /* the scene card + 进入打造 / 暂不进入 choice that closes both the Main and the Side route */
  function makeAfter(biz, title, desc) {
    return async function (c) {
        // scene card (same look as the sidebar card); its footer carries the choice
        var card = window.FastSceneCard.create({
          title: title, desc: desc, stage: 'crafting', biz: biz,
          actions: [{ id: 'enter', label: '进入打造' }, { id: 'later', label: '暂不进入' }],
          results: { enter: '已选择：进入打造', later: '已选择：暂不进入' },
        });
        var seg = document.createElement('div');
        seg.className = 'ao-seg stream-enter';
        seg.appendChild(card.node);
        c.host.appendChild(seg);
        c.scroll();
        pendingCard = card;
        setLinkCue(true); // sidebar Continue crafting = same door while this choice is open
        var picked = await card.picked;
        pendingCard = null;
        await c.sleep(420);
        if (picked === 'enter') {
          entered = true; // lock before the delayed enterRoom so sidebar can't double-fire
          setLinkCue(false);
          setTimeout(function () { enterRoom(biz, title); }, 700); // after this turn releases the chat
          return { skipFooter: true };
        }
        setLinkCue(true); // later → keep cue on the sidebar button
        var part = document.createElement('div');
        c.host.appendChild(part);
        await c.run(part, [{ md:
          '好的，暂不进入打造。场景已经保存好了，随时可以在左侧点 **Continue crafting** 进入——和刚才卡片上的「进入打造」是同一条路。\n\n' +
          '在这之前，你还有什么需要补充的吗？比如这个场景要解决的具体问题、已有的素材，或者想关联的业务系统，直接告诉我就行。', gap: 360 }]);
        return null;
      };
  }

  window.WorkshopCreateScene.onCreate = function (payload) {
    if (window.FastIntake) window.FastIntake.stop();   // a scene exists now — the chat-first path is over
    var fromChat = !!payload.fromChat;
    var biz = payload.businesses || [];
    var title = payload.title || A1.name;
    var desc = payload.desc || A1.desc;
    var t1 = biz[0] ? biz[0].name : title;
    lastCtx = { biz: biz, title: title };
    entered = false;
    var md =
      '场景已创建，并同步到了左侧的 **Scenarios**。识别到你接下来想打造 **' + t1 + '**，要现在就进入打造吗？';

    window.FastChat.run({
      process: async function (api) {
        await api.sleep(500);
        await api.W((fromChat ? '先把我们聊到的内容整理成场景：1 个应用场景' : '先核对你填写的信息：1 个应用场景') + (biz.length ? '，下挂 ' + biz.length + ' 个业务场景' : '') + '。');
        await api.sleep(450);
        await api.V({ id: 'sc-app', icon: 'tool', label: '已创建应用场景 · ' + title, details: ['类型 Application · AgentTeam', '写入场景名称与描述', '初始状态 Crafting'] });
        for (var i = 0; i < biz.length; i++) {
          await api.sleep(260);
          await api.V({ id: 'sc-biz-' + i, icon: 'tool', label: '已创建业务场景 · ' + biz[i].name, details: ['类型 Business · Single agent', '优先级 ' + biz[i].priority, '挂到应用场景 ' + title] });
        }
        await api.sleep(450);
        await api.W('场景已写入，现在同步左侧列表和 Overview 下拉。');
        await api.sleep(300);
        window.FastScenes.show('a1', { kids: true });
        await api.V({ id: 'sc-sync', icon: 'context', label: '已同步工作台', details: ['左侧 Scenarios 新增场景卡', 'Overview 下拉新增场景入口', 'Files 暂无文档，保持空状态'] });
        await api.sleep(500);
      },
      segments: [{ md: md, gap: 340 }],
      after: makeAfter(biz, title, desc),
    });
  };
  /* ───────── Side route (js/fast-company.js): several scene cards at once ───────── */
  var EXTRA = {
    a2: { title: 'A2 R&D project risk early warning', desc: 'Application scenario for spotting R&D milestone slippage and risk early.',
      biz: [{ name: 'Milestone slippage detection', desc: 'Business scenario for detecting milestone delays from plans and weekly reports.' }] },
    a3: { title: 'A3 After-sales ticket intelligent dispatch', desc: 'Application scenario for triaging, routing and answering after-sales tickets.',
      biz: [{ name: 'Ticket triage & routing', desc: 'Business scenario for classifying tickets and routing them to the right team.' }] },
  };
  function escH(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var MORE_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="4" cy="8" r="1.15" fill="currentColor"/><circle cx="8" cy="8" r="1.15" fill="currentColor"/><circle cx="12" cy="8" r="1.15" fill="currentColor"/></svg>';
  var MENU = '<div class="scene-menu" hidden role="menu"><button type="button" role="menuitem">Edit</button><button type="button" class="scene-menu-danger" role="menuitem">Delete</button></div>';
  function packHtml(o) {
    return '<div class="scene-unit scene-unit-app"><div class="scene-unit-head"><h4 class="scene-unit-title">' + escH(o.title) + '</h4>' +
      '<button type="button" class="scene-unit-more" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' + MORE_SVG + '</button>' + MENU + '</div>' +
      '<div class="scene-unit-tags"><span class="scene-kicker">Application</span><span class="scene-stage is-crafting"><span class="dot" aria-hidden="true"></span>Crafting</span></div>' +
      '<p class="scene-unit-desc">' + escH(o.desc) + '</p>' +
      '<div class="scene-unit-actions"><button type="button" class="scene-build" title="演示中暂未接入这个场景的打造流程">Continue crafting</button></div></div>' +
      '<div class="scene-children"><div class="scene-biz-list">' + o.biz.map(function (b) {
        return '<div class="scene-biz"><div class="scene-unit-head"><h4 class="scene-unit-title">' + escH(b.name) + '</h4>' +
          '<button type="button" class="scene-unit-more" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">' + MORE_SVG + '</button>' + MENU + '</div>' +
          '<div class="scene-unit-tags"><span class="scene-kicker scene-kicker-biz">Business</span><span class="scene-stage is-crafting"><span class="dot" aria-hidden="true"></span>Crafting</span></div>' +
          '<p class="scene-unit-desc">' + escH(b.desc) + '</p>' +
          '<div class="scene-unit-actions"><button type="button" class="scene-biz-build">Continue crafting</button></div></div>';
      }).join('') + '</div></div>';
  }
  function addExtraPack(id) {
    var o = EXTRA[id];
    if (!o || !cardsHost || cardsHost.querySelector('[data-fast-scene="' + id + '"]')) return;
    var art = document.createElement('article');
    art.className = 'scene-pack';
    art.setAttribute('role', 'listitem');
    art.setAttribute('data-fast-scene', id);
    art.innerHTML = packHtml(o);
    cardsHost.appendChild(art);
    window.FastScenes.show(id, { kids: true });
  }

  window.WorkshopCreateScene.fromChatMulti = function (ids) {
    ids = ids && ids.length ? ids : ['a1'];
    var hasA1 = ids.indexOf('a1') >= 0;
    var names = { a1: A1.name, a2: EXTRA.a2.title, a3: EXTRA.a3.title };
    if (window.FastIntake) window.FastIntake.stop();
    if (window.FastCompany) window.FastCompany.stop();
    if (hasA1) { lastCtx = { biz: A1.biz, title: A1.name }; entered = false; }
    var t1 = A1.biz[0].name;
    var md = hasA1
      ? '场景已创建，并同步到了左侧 **Scenarios**。三个方向里，**' + t1 + '** 最贴近我们刚才梳理出的采购痛点，要现在就进入打造吗？'
      : '场景已创建，并同步到了左侧 **Scenarios**。想先从哪个开始，直接点对应卡片上的 **Continue crafting**。';
    if (hasA1 && ids.length === 1) md = '场景已创建，并同步到了左侧 **Scenarios**。识别到你接下来想打造 **' + t1 + '**，要现在就进入打造吗？';

    window.FastChat.run({
      process: async function (api) {
        await api.sleep(500);
        await api.W('先把你选的 ' + ids.length + ' 个方向整理成场景，每个应用场景下挂 1 个业务场景。');
        for (var i = 0; i < ids.length; i++) {
          await api.sleep(300);
          await api.V({ id: 'ms-' + ids[i], icon: 'tool', label: '已创建应用场景 · ' + names[ids[i]], details: ['类型 Application · AgentTeam', '下挂业务场景 1 个', '初始状态 Crafting'] });
        }
        await api.sleep(420);
        await api.W('场景已写入，现在同步左侧列表。');
        await api.sleep(300);
        if (hasA1) window.FastScenes.show('a1', { kids: true });
        ids.forEach(addExtraPack);
        await api.V({ id: 'ms-sync', icon: 'context', label: '已同步工作台', details: ['左侧 Scenarios 新增 ' + ids.length + ' 张场景卡', '基于「数字化现状与机会点」生成描述'] });
        await api.sleep(500);
      },
      segments: [{ md: md, gap: 340 }],
      after: hasA1 ? makeAfter(A1.biz, A1.name, A1.desc) : undefined,
    });
  };
})();
