(function (global) {
  var DEMO_AGENT_REPLY = "This isn’t an executable requirement yet—it’s an **unscoped analysis task**. The sponsor asked to “analyze an executive’s agent,” without saying whom, what, or what to deliver. Split that layer first so you can ask precise follow-ups.\n\n## Three layers of ambiguity are stacked here\n\n| Unclear point | What it might mean | If you get it wrong |\n|---|---|---|\n| **Analysis subject** | An agent an executive already uses; an agent to build for them; or market benchmarks for executive agents | Wrong system, wrong report |\n| **Analysis purpose** | Reuse, benchmarking, go/no-go, capability breakdown, or a sponsor readout | Deliverable misses expectation |\n| **Deliverable** | One-page conclusion, capability list, requirements, Skill, or Agent plan | Too deep wastes time; too shallow gets rejected |\n\nIn company context, “an executive’s agent” usually means one of these three, highest priority first:\n\n1. **Break down an agent an executive already uses**  \n   What it solves, which systems it connects, which capabilities can land in AgentOS.\n2. **Design a dedicated agent for a class of executives**  \n   e.g. CEO / COO / BU lead workflows, decision cadence, information intake.\n3. **Benchmark market executive assistants**  \n   Capability boundaries—decide whether we build, and how deep.\n\nUntil confirmed, don’t jump to #2 or #3.\n\n## What this ask should actually produce\n\nWhen sponsors say “analyze,” they usually want three decision-ready outcomes—not a long essay:\n\n1. **What this agent actually does for the executive** (3–5 core tasks, not a feature dump)\n2. **Which capabilities deserve a Skill / Agent vs. chat wrappers**\n3. **Build / don’t build / what to build first** (recommendation + rationale)\n\nIf you only hand over UI screenshots or prompt excerpts, it will feel unfinished.\n\n## Six questions to ask the sponsor first\n\n1. **Which executive and which agent**? Accounts, chat logs, configs—or only a verbal description?\n2. Purpose: **reuse into our product**, **evaluate worth**, or **build a version for this executive**?\n3. Deliverable: **one-page conclusion**, **capability breakdown**, or **shippable Skill / Agent plan**?\n4. What is their core work: operating decisions, org management, customers, or business execution?\n5. Must-have systems: calendar, email, OA, CRM, financials, meeting notes?\n6. When is it due, and who reads it: internal review, or the executive directly?\n\nOf these, **1, 2, and 3** unblock everything else.\n\n## If the sponsor says “just draft a version”\n\nShip this frame—not a full proposal yet:\n\n**1. Role portrait**  \nWho, what they own, daily decisions, biggest friction, what must not go wrong.\n\n**2. Task map**  \nCollapse “an executive’s day” into 5–8 tasks, e.g. pre-meeting briefs, operating anomalies, cross-team follow-ups, external messaging, decision memos.  \nTag each: high frequency / high value / high risk.\n\n**3. Agent capability breakdown**  \nFor the existing agent (or the one you might build), split four layers:\n\n- Sense: what it reads (calendar, email, reports, meetings)\n- Reason: what it judges (priority, risk, escalate or not)\n- Act: what it does (draft, chase, schedule, summarize)\n- Boundaries: what needs a human (external commitments, people, finance, compliance)\n\n**4. Mapping to AgentOS**  \nYour UI already has two lines that map cleanly:\n\n- **Scenario insight**: requirements analysis, scenario research, enterprise insight — clarify what this executive needs\n- **Scenario craft**: requirements insight / landscape planning / knowledge mining — later turn it into a reusable executive Agent\n\n**5. Conclusion page (for the sponsor)**  \nKeep four lines only:\n\n- Core value of this agent\n- Biggest gap\n- Recommend build / don’t / what first\n- Inputs needed next week to continue\n\n## My read on this ask\n\nWith current info, only one conclusion holds: **confirm subject and purpose first—don’t design an executive Agent yet.**\n\nSafest next step: send the six questions to the sponsor.  \nIf they reply “it’s the one Exec X already uses,” send me the agent name, screenshots, configs, and a few real chats—I can produce a handoff-ready analysis via role → tasks → capabilities → reusable Skills.";
  function inlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      var icon = '<svg class="chat-cite-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 2.4h5.1L12 5.3v8.3H4V2.4Z" stroke="currentColor" stroke-width="1.2"/><path d="M9.1 2.4V5.4H12" stroke="currentColor" stroke-width="1.2"/></svg>'
      return '<a class="chat-cite" href="' + String(href).replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '">' + icon + '<span>' + label.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span></a>'
    })
    .replace(/「([^」]+)」/g, '「$1」')
}

  var DEMO_ALLOCATION_THINKING = "Parse the user intent\nThe user wants a “sales allocation Agent.” The goal is already fairly concrete: given inventory, store/channel demand, and constraints, auto-produce an allocation plan with explanations—not an abstract executive analysis.\n\nConverge the scenario first\n· Allocation target: HQ to stores, or warehouse to sales / customers / distributors? That drives tables, constraints, and owners.\n· Decision goal: fairness, priority stores, stockout floors, or clear inventory / push sell-through?\n· Delivery shape: Excel plan + rationale, or a small upload-and-recompute tool.\n\nMVP boundary\n1. Start with read data → score → generate plan → explain unmet demand.\n2. Keep strategy and locks human-tunable—avoid a full black box in v1.\n3. Reply with capabilities, flow, and key clarifying questions so design can land.";
  var DEMO_ALLOCATION_REPLY = "Yes. We can build a “sales allocation Agent”: take inventory, store/channel demand, history, priorities, and constraints, then auto-produce an allocation plan and explain why.\n\nI recommend an MVP with these core capabilities:\n\n1. **Read data**\n   - SKU inventory\n   - Demand by store / channel\n   - History: sales, sell-through, turns\n   - Store tier, region, promo plans\n   - Constraints: min/max allocation, case pack, replenishment cycle\n\n2. **Generate allocation**\n   - Score by store potential, urgency, history, inventory pressure\n   - Support fair, priority, floor, and hero-SKU tilt modes\n   - Avoid over-allocation, flooding weak stores, or stocking out key stores\n\n3. **Explain outputs**\n   - Who gets each SKU and how much\n   - Which stores were prioritized\n   - Unmet demand and why\n   - Export Excel/CSV\n\n4. **Human overrides**\n   - Strategies: conservative, balanced, growth, clear-inventory\n   - Lock stores or SKUs\n   - Recalculate after edits\n\nA simple Agent flow:\n\n```text\nUser uploads sales/inventory sheets\n        ↓\nAgent cleans and detects fields\n        ↓\nScore store demand, sales potential, inventory risk\n        ↓\nGenerate plan from strategy + constraints\n        ↓\nOutput table + rationale + alerts\n```\n\nIf you want, next I can design a shippable version—including:\n\n- Data table templates\n- Allocation logic\n- Agent system prompt / instructions\n- Python prototype\n- Or a small Excel-upload tool\n\nOne key question first: is this allocation mainly **HQ → stores**, or **warehouse → sales / customers / distributors**?";
  var DEMO_EXECUTIVE_THINKING = "Parse the user intent\nThe user gave a verbal task: “analyze an executive’s agent.” This is a typical open-ended analysis ask—not the same as “design an executive Agent” or “write a PRD.”\n\nAmbiguity scan (subject / purpose / deliverable)\n· Subject: an agent an executive already uses, a dedicated agent to build, or external market benchmarks?\n· Purpose: reuse capabilities into AgentOS, evaluate whether it is worth building, or deliver a version for that executive?\n· Deliverable: a one-page conclusion, a capability breakdown, or a shippable Skill / Agent plan?\n\nWithout aligning on those three, deep analysis easily lands on the wrong entity and the whole report gets sent back.\n\nReasoning & strategy\n1. Refuse default assumptions—do not presume a “CEO assistant” or a generic chat wrapper is the goal.\n2. First output a decision-ready structure: ambiguity table → three scenario priorities → six questions the sponsor should answer.\n3. If pressed to “just draft something”: use role → tasks → capabilities (sense / reason / act / boundaries), and map to AgentOS “Scenario insight / Scenario craft.”\n4. Final answer uses structured Markdown (including a table); then attach Four steps to turn open questions into executable next moves.";
  var DEMO_STORE_THINKING = "Confirm allocation target\nThe user clarified “to sales stores,” converging the open question into a clear scenario: HQ/warehouse allocates goods to sales stores—not distributors or end customers.\n\nLanding model\n· Inputs: inventory, stores, sales, demand, rules—five tables.\n· Decision: compute true gap, score stores, then allocate by growth / balanced / clear-inventory / floor strategies.\n· Outputs: recommended qty, unmet qty, reasons, and alerts.\n\nReply strategy\nGive executable table shapes, core formulas, and constraints; close on a minimum usable version: upload Excel → generate an Allocation recommendation sheet. Ask whether to continue with full plan docs, field templates, and a Python prototype.";
  var DEMO_STORE_REPLY = "Got it—this is an HQ/warehouse → sales-store allocation Agent.\n\nSuggested business model:\n\n**Input tables**\n- `inventory`: SKU, style, color, size, allocatable stock, case pack\n- `stores`: store, region, tier, channel type\n- `sales`: store, SKU, last 7/14/30-day sales, on-hand, inbound\n- `targets`: store, SKU, suggested demand or target fill\n- `rules`: key stores, floors, caps, blocked stores, promo stores\n\n**Agent decision logic**\n1. Compute true gap per store × SKU  \n   `gap = target inventory - on-hand - inbound`\n\n2. Score stores  \n   Useful dimensions:\n   - Last 30-day sales\n   - Sell-through speed\n   - Store tier\n   - Region priority\n   - Promo store flag\n   - New-product launch store flag\n\n3. Allocate by strategy  \n   - `growth`: prefer high-sales / high-tier stores\n   - `balanced`: get more stores basic coverage\n   - `clear-inventory`: burn slow SKUs or named warehouse stock\n   - `floor-first`: satisfy core-store minimum display first\n\n4. Outputs  \n   - Store, SKU, recommended qty\n   - Unmet demand\n   - Allocation rationale\n   - Alerts: short stock, over-allocation, high demand from weak stores, etc.\n\n**Minimum usable version**\nBuild an Excel/Python Agent: upload a few sheets, auto-generate an Allocation recommendation sheet.\n\nCore formulas roughly:\n\n```text\ndemand_gap = max(target - on_hand - inbound, 0)\n\nstore_weight =\n  last_30d_sales_norm * 0.4\n+ store_tier_score * 0.25\n+ sell_through_score * 0.2\n+ promo_score * 0.15\n\nrecommended_qty =\n  allocatable_stock × store_weight / sum(weights of stores with demand)\n```\n\nThen apply constraints:\n- Cap at demand gap\n- Meet key-store floors\n- Respect store caps\n- Round to case pack / pack size\n\nIf you want, next I can deliver a **full sales-store allocation Agent plan + Excel field templates + Python compute prototype**.";
  var DEMO_MVP_THINKING = "User confirmed continue\nPrior turn already covered the store allocation model, formulas, and minimum usable version. User replied “ok,” so deliver a runnable MVP instead of another scoping round.\n\nDelivery\n· Field templates: inventory / stores / sales / targets / rules\n· Sample data and Python allocation script\n· Ran recommendation + alerts tables\n· Checks: SKU001/002/003 allocated qty equals allocatable stock 96/54/38; blocked stores intercepted\n\nReply shape\nLink README and the two result tables via file cites, plus an edited-files list for quick verification.";
  var DEMO_MVP_REPLY = "I’ve put together a runnable “Sales store allocation Agent MVP” here:\n\n[Sales store allocation Agent MVP](/Users/ke.wang/Documents/Codex/2026-10-07/wo-xi/outputs/sales_allocation_agent/README.md)\n\nIt includes:\n- Field templates: `inventory / stores / sales / targets / rules`\n- Sample data\n- Python allocation script\n- Sample results and alerts\n\nI already ran the sample; outputs are here:\n\n[Allocation recommendations](/Users/ke.wang/Documents/Codex/2026-10-07/wo-xi/outputs/sales_allocation_agent/results/allocation_result.csv)\n\n[Allocation alerts](/Users/ke.wang/Documents/Codex/2026-10-07/wo-xi/outputs/sales_allocation_agent/results/allocation_alerts.csv)\n\nChecks: sample `SKU001 / SKU002 / SKU003` allocated qty equals allocatable stock `96 / 54 / 38` with no over-allocation; blocked stores were intercepted. Next step can wrap this as a conversational Agent—upload Excel, detect fields, ask for missing info, and generate plans under growth / coverage / floor strategies.";
  var DEMO_MVP_FILE_CHANGES = {
    added: 422,
    removed: 0,
    files: [
      { path: 'outputs/sales_allocation_agent/README.md', added: 78, removed: 0 },
      { path: 'outputs/sales_allocation_agent/examples/inventory.csv', added: 4, removed: 0 },
      { path: 'outputs/sales_allocation_agent/examples/rules.csv', added: 19, removed: 0 },
      { path: 'outputs/sales_allocation_agent/examples/sales.csv', added: 19, removed: 0 },
      { path: 'outputs/sales_allocation_agent/examples/stores.csv', added: 7, removed: 0 },
      { path: 'outputs/sales_allocation_agent/examples/targets.csv', added: 19, removed: 0 },
      { path: 'outputs/sales_allocation_agent/src/allocate.py', added: 266, removed: 0 },
      { path: 'outputs/sales_allocation_agent/templates/inventory.csv', added: 2, removed: 0 },
      { path: 'outputs/sales_allocation_agent/templates/rules.csv', added: 2, removed: 0 },
      { path: 'outputs/sales_allocation_agent/templates/sales.csv', added: 2, removed: 0 },
      { path: 'outputs/sales_allocation_agent/templates/stores.csv', added: 2, removed: 0 },
      { path: 'outputs/sales_allocation_agent/templates/targets.csv', added: 2, removed: 0 }
    ]
  };
  var DEMO_TURNS = [
    { id: 'executive', keywords: ['executive'], thinking: DEMO_EXECUTIVE_THINKING, answer: DEMO_AGENT_REPLY, fourSteps: 'default' },
    { id: 'allocation', keywords: ['allocation', 'sales allocation'], thinking: DEMO_ALLOCATION_THINKING, answer: DEMO_ALLOCATION_REPLY, fourSteps: [] },
    { id: 'store-allocation', keywords: ['sales stores', 'to sales stores'], thinking: DEMO_STORE_THINKING, answer: DEMO_STORE_REPLY, fourSteps: [] },
    {
      id: 'mvp',
      keywords: [],
      exact: ['ok', 'ok.', 'okay', 'okay.', 'sure', 'yes'],
      thinking: DEMO_MVP_THINKING,
      answer: DEMO_MVP_REPLY,
      fourSteps: [],
      thinkDoneLabel: 'Took 2m 4s',
      thinkVariant: 'plain',
      fileChanges: DEMO_MVP_FILE_CHANGES
    }
  ];

  function matchTurn(turn, text) {
    var trimmed = String(text || '').trim();
    if (turn.exact && turn.exact.some(function (word) { return trimmed === word; })) return true;
    return (turn.keywords || []).some(function (word) { return word && trimmed.indexOf(word) !== -1; });
  }

  function pickDemoTurn(text, usedIds) {
    usedIds = usedIds || [];
    var unused = DEMO_TURNS.filter(function (item) { return usedIds.indexOf(item.id) === -1; });
    var i;
    for (i = 0; i < unused.length; i++) {
      if (matchTurn(unused[i], text)) return unused[i];
    }
    for (i = 0; i < DEMO_TURNS.length; i++) {
      if (matchTurn(DEMO_TURNS[i], text)) return DEMO_TURNS[i];
    }
    return unused[0] || null;
  }

  function getDemoTurn(id) {
    for (var i = 0; i < DEMO_TURNS.length; i++) {
      if (DEMO_TURNS[i].id === id) return DEMO_TURNS[i];
    }
    return DEMO_TURNS[0] || null;
  }

function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0

  function flushParagraph(buf) {
    const text = buf.join(' ').trim()
    if (text) out.push(`<p>${inlineMarkdown(text)}</p>`)
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    if (trimmed.startsWith('## ')) {
      out.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('### ')) {
      out.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`)
      i += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      i += 1
      const code = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      if (i < lines.length) i += 1
      out.push('<pre class="chat-md-pre"><code>' + code.join('\n').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</code></pre>')
      continue
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i += 1
      }
      if (tableLines.length >= 2) {
        const header = tableLines[0].split('|').filter(Boolean).map((c) => c.trim())
        const bodyRows = tableLines.slice(2)
        out.push('<div class="chat-md-table-wrap"><table class="chat-md-table"><thead><tr>')
        header.forEach((cell) => {
          out.push(`<th>${inlineMarkdown(cell)}</th>`)
        })
        out.push('</tr></thead><tbody>')
        bodyRows.forEach((row) => {
          const cells = row.split('|').filter(Boolean).map((c) => c.trim())
          out.push('<tr>')
          cells.forEach((cell) => {
            out.push(`<td>${inlineMarkdown(cell)}</td>`)
          })
          out.push('</tr>')
        })
        out.push('</tbody></table></div>')
      }
      continue
    }

    if (/^\d+\.\s/.test(trimmed)) {
      out.push('<ol class="chat-md-ol">')
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        let item = lines[i].trim().replace(/^\d+\.\s*/, '')
        i += 1
        const nested = []
        const cont = []
        while (i < lines.length) {
          const next = lines[i].trim()
          if (!next) {
            const peek = lines[i + 1] ? lines[i + 1].trim() : ''
            if (!peek || /^\d+\.\s/.test(peek) || peek.startsWith('##') || peek.startsWith('```')) break
            i += 1
            continue
          }
          if (/^\d+\.\s/.test(next) || next.startsWith('##') || next.startsWith('```') || (next.startsWith('|') && next.endsWith('|'))) break
          if (next.startsWith('- ')) {
            nested.push(next.slice(2))
            i += 1
            continue
          }
          cont.push(next)
          i += 1
        }
        let html = inlineMarkdown(item)
        if (cont.length) html += '<br>' + cont.map(function (line) { return inlineMarkdown(line) }).join('<br>')
        if (nested.length) {
          html += '<ul class="chat-md-ul">' + nested.map(function (n) { return '<li>' + inlineMarkdown(n) + '</li>' }).join('') + '</ul>'
        }
        out.push(`<li>${html}</li>`)
      }
      out.push('</ol>')
      continue
    }

    if (trimmed.startsWith('- ')) {
      out.push('<ul class="chat-md-ul">')
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        out.push(`<li>${inlineMarkdown(lines[i].trim().slice(2))}</li>`)
        i += 1
      }
      out.push('</ul>')
      continue
    }

    const para = [trimmed]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('##') &&
      !lines[i].trim().startsWith('###') &&
      !lines[i].trim().startsWith('|') &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i].trim())
      i += 1
    }
    flushParagraph(para)
  }

  return out.join('\n')
}

  global.WORKBUDDY_CHAT = {
    DEMO_AGENT_REPLY: DEMO_AGENT_REPLY,
    DEMO_TURNS: DEMO_TURNS,
    markdownToHtml: markdownToHtml,
    pickDemoTurn: pickDemoTurn,
    getDemoTurn: getDemoTurn
  };
})(typeof window !== 'undefined' ? window : globalThis);
