/* data-catalog.js — view metadata, empty-hero copy, nav items, seed CATALOG data */

var currentTeam = 'DJI Innovations';
var VIEWS = {
  market:    { title: 'Market',    desc: 'Discover published agents, skills, and MCP packs.' },
  agent:     { title: 'Agent',     desc: 'Runnable agents for this project — chat, research, and ops.' },
  scenario:  { title: 'Scenario',  desc: 'Application scenarios own business scenarios, linked assets, and craft stage.' },
  knowledge: { title: 'Knowledge Base', desc: 'Curated sources agents can cite and retrieve from.' },
  skill:     { title: 'Skill',     desc: 'Reusable workflows agents load when a task matches.' },
  ontology:  { title: 'Ontology',  desc: 'Shared entities, relations, and domain vocabulary.' },
  mcp:       { title: 'MCP',       desc: 'Model Context Protocol servers that extend tool access.' },
  files:     { title: 'Files',     desc: 'Materials and deliverables — browse with a dense drill-down list.' },
  'enterprise-assets': { title: 'Enterprise Assets', desc: 'Shared enterprise context for documents and the business landscape.' },
  aiops:     { title: 'AI Ops',    desc: 'Runtime health, traces, and agent operations.' }
};
var EMPTY_HERO = {
  market: {
    cls: '',
    title: 'Discover agents built for your team',
    desc: 'Browse published agents, skills, and MCP packs — then pull the right ones into this project space.',
    cta: 'Browse Market',
    note: 'Marketplace is coming soon in this demo'
  },
  mcp: {
    cls: '',
    title: 'Connect MCP servers for your team',
    desc: 'Browse Model Context Protocol servers and connectors — then pull the right ones into this project space.',
    cta: 'Browse MCP',
    note: 'MCP catalog is coming soon in this demo'
  },
  aiops: {
    cls: ' is-ops',
    title: 'Keep every agent run in view',
    desc: 'Watch health, traces, and failures across the space — so craft work stays reliable after it goes live.',
    cta: 'Open AI Ops',
    note: 'Operations console is coming soon in this demo'
  }
};

var items = document.querySelectorAll('.nav-item');
var content = document.getElementById('mainContent');

var SCOPED = { agent: 1, scenario: 1, knowledge: 1, skill: 1, ontology: 1, mcp: 1, files: 1, 'enterprise-assets': 1 };

// Production-shaped seed data + type-specific card renderers
var CATALOG = {
  agent: [
    {
      name: 'Supplier discovery assistant',
      role: 'From T1 sourcing strategy, generate search plans, run S0→P3 parallel search across 16+ public sources, aggregate and dedupe with L0–L3 tags for CS review.',
      model: 'qwen3.7-max', caps: ['Single agent', 'Autonomous planning'],
      status: 'Live', state: 'live', runs: '1.2k runs', color: '#0d8ae6', letter: 'S'
    },
    {
      name: 'Sourcing strategy assistant',
      role: 'Take parsed sourcing needs, blend category knowledge (materials, regions, cases, thresholds, channels), and draft structured strategy with keywords and exclusions.',
      model: 'deepseek-v4-pro', caps: ['Single agent', 'Autonomous planning'],
      status: 'Ready', state: 'ready', runs: '84 runs', color: '#6a54f0', letter: 'P'
    },
    {
      name: 'Supplier profile assistant',
      role: 'From CS-confirmed strategy and demand context, draft a 6-dimension target profile with weights (K5) and hard thresholds (K6).',
      model: 'qwen3.7-max', caps: ['Single agent', 'Workflow'],
      status: 'Draft', state: 'draft', runs: 'Not published', color: '#0f766e', letter: 'F'
    },
    {
      name: 'Supplier deep-research assistant',
      role: 'Enrich T2 candidates (~60% complete) via registry checks, multi-source collection, cross-validation, 6-dimension fusion and 4 risk labels to ≥85% completeness.',
      model: 'deepseek-v4-pro', caps: ['Multi-agent', 'Autonomous planning'],
      status: 'Live', state: 'live', runs: '320 runs', color: '#c2410c', letter: 'R'
    },
    {
      name: 'Task — long-list report',
      role: 'Final T4 screening step: format compliance → threshold → scored results into a structured long-list evaluation report for CS. Pure formatting, no ontology queries.',
      model: 'glm-5.3-flash', caps: ['Single agent', 'Workflow'],
      status: 'Ready', state: 'ready', runs: '12 runs', color: '#64748b', letter: 'T'
    },
    {
      name: 'Screening & long-list assistant',
      role: 'CS uploads a candidate list and demand ID; agent runs compliance → threshold screening, then the rule engine (R0→R2) builds the compliance pool and scoring.',
      model: 'qwen3.7-max', caps: ['Multi-agent', 'Workflow'],
      status: 'Draft', state: 'draft', runs: 'Not published', color: '#1d4ed8', letter: 'L'
    }
  ],
  scenario: [
    {
      name: 'A1 Supplier intelligent sourcing & admission',
      desc: 'Application scenario for supplier sourcing strategy, discovery, and admission.',
      stage: 'crafting',
      assets: [
        { type: 'Ontology', label: 'Supplier discovery object set', state: 'is-done' },
        { type: 'Skill', label: 'contract-risk-check', state: 'is-partial' },
        { type: 'Knowledge', label: 'Vendor FAQ', state: 'is-done' },
        { type: 'Agent', label: 'Supplier discovery assistant', state: 'is-done' }
      ],
      businesses: [
        { name: 'T2 Supplier discovery', desc: 'Business scenario for discovering and shortlisting supplier candidates.', priority: 'Business', stage: 'crafting' },
        { name: 'T1 Sourcing strategy (v2.1 new step)', desc: 'Business scenario for drafting and confirming the sourcing strategy.', priority: 'Business', stage: 'ready' }
      ]
    },
    {
      name: 'Store allocation MVP',
      desc: 'HQ-to-store allocation with explainable rules and override paths.',
      stage: 'crafting',
      assets: [
        { type: 'Ontology', label: 'Retail domain graph', state: 'is-partial' },
        { type: 'Skill', label: 'allocation-rules', state: 'is-empty' },
        { type: 'Knowledge', label: 'KPI glossary', state: 'is-partial' },
        { type: 'Agent', label: 'Supplier discovery assistant', state: 'is-empty' }
      ],
      businesses: [
        { name: 'Demand forecast intake', desc: 'Ingest store demand signals before allocation.', priority: 'Important', stage: 'crafting' },
        { name: 'Rule-based allocate', desc: 'Generate and explain SKU allocation suggestions.', priority: 'Long-term', stage: 'not_started' }
      ]
    },
    {
      name: 'Supplier research desk',
      desc: 'Discover, shortlist, and deep-research suppliers with CS confirmation checkpoints.',
      stage: 'ready',
      assets: [
        { type: 'Ontology', label: 'Supplier discovery object set', state: 'is-done' },
        { type: 'Skill', label: 'contract-risk-check', state: 'is-done' },
        { type: 'Knowledge', label: 'Vendor FAQ', state: 'is-partial' },
        { type: 'MCP', label: 'Builtin-OSS', state: 'is-done' }
      ],
      businesses: [
        { name: 'Candidate shortlist', desc: 'Search and score supplier candidates for CS review.', priority: 'Quick win', stage: 'ready' },
        { name: 'Deep profile pack', desc: 'Build 6-dimension profiles and risk labels.', priority: 'Important', stage: 'crafting' },
        { name: 'CS confirmation loop', desc: 'Collect CS decisions and close the confirmation chain.', priority: 'Important', stage: 'not_started' }
      ]
    },
    {
      name: 'Sales enablement suite',
      desc: 'Assist AEs with follow-ups, meeting notes, and account briefs across the funnel.',
      stage: 'live',
      assets: [
        { type: 'Ontology', label: 'Account schema', state: 'is-done' },
        { type: 'Skill', label: 'sales-follow-up', state: 'is-done' },
        { type: 'Knowledge', label: 'Battle cards', state: 'is-done' },
        { type: 'Agent', label: 'Sourcing strategy assistant', state: 'is-partial' }
      ],
      businesses: [
        { name: 'Post-call follow-up', desc: 'Draft emails and next steps from call notes.', priority: 'Quick win', stage: 'live' },
        { name: 'Weekly account brief', desc: 'Summarize pipeline risk and recommended plays.', priority: 'Important', stage: 'ready' }
      ]
    },
    {
      name: 'Incident command center',
      desc: 'Triage alerts, draft status updates, and coordinate remediation runbooks.',
      stage: 'not_started',
      assets: [
        { type: 'Ontology', label: 'Incident graph', state: 'is-empty' },
        { type: 'Skill', label: 'incident-triage', state: 'is-empty' },
        { type: 'Knowledge', label: 'SRE runbooks', state: 'is-partial' },
        { type: 'MCP', label: 'Ontology Action Executor', state: 'is-empty' }
      ],
      businesses: [
        { name: 'Alert intake', desc: 'Normalize pager alerts into a shared incident object.', priority: 'Important', stage: 'not_started' },
        { name: 'Stakeholder update', desc: 'Generate status posts for eng and customer teams.', priority: 'Long-term', stage: 'not_started' }
      ]
    },
    {
      name: 'Hiring screening pipeline',
      desc: 'Screen resumes, draft interview kits, and sync decisions back to ATS notes.',
      stage: 'crafting',
      assets: [
        { type: 'Ontology', label: 'Role competency map', state: 'is-partial' },
        { type: 'Skill', label: 'resume-screening', state: 'is-done' },
        { type: 'Knowledge', label: 'Interview scorecards', state: 'is-done' },
        { type: 'Agent', label: 'Screening & long-list assistant', state: 'is-partial' }
      ],
      businesses: [
        { name: 'Resume first pass', desc: 'Rank candidates against role requirements.', priority: 'Quick win', stage: 'ready' },
        { name: 'Interview kit draft', desc: 'Generate questions and evaluation rubrics.', priority: 'Important', stage: 'crafting' }
      ]
    }
  ],
  knowledge: [
    { name: 'Product handbook', source: 'PDF', chunks: '128 chunks', sync: 'Synced 1h ago', ok: true },
    { name: 'Support playbooks', source: 'Notion', chunks: '64 chunks', sync: 'Synced 4h ago', ok: true },
    { name: 'Retail KPI glossary', source: 'Web', chunks: 'Indexing…', sync: 'Last crawl today', ok: false },
    { name: 'Vendor FAQ', source: 'Confluence', chunks: '42 chunks', sync: 'Synced yesterday', ok: true },
    { name: 'Battle cards', source: 'Drive', chunks: '31 chunks', sync: 'Synced 2d ago', ok: true },
    { name: 'SRE runbooks', source: 'Git', chunks: '89 chunks', sync: 'Synced 6h ago', ok: true },
    { name: 'Interview scorecards', source: 'Notion', chunks: '18 chunks', sync: 'Synced 3d ago', ok: true },
    { name: 'Policy & compliance', source: 'PDF', chunks: 'Index queued', sync: 'Waiting on upload', ok: false }
  ],
  skill: [
    {
      slug: 'code-review-assistant', title: 'Code review assistant', version: 'V5.0',
      desc: 'Structured code review on Git diffs or PRs — spot logic bugs, security risks, and style issues, then suggest actionable fixes. Supports team-specific check rules.',
      updated: '2026-07-06 22:59', tags: ['code-review', 'git', 'pr', 'quality']
    },
    {
      slug: 'sales-follow-up', title: 'Sales follow-up assistant', version: 'V1.1',
      desc: 'Turn customer conversations into follow-up emails, next steps, and risk notes to keep deal momentum high.',
      updated: '2026-07-03 19:17', tags: ['sales', 'crm', 'follow-up', 'email']
    },
    {
      slug: 'contract-risk-check', title: 'Contract risk check', version: 'V1.1',
      desc: 'Scan contract terms for payment, delivery, breach, confidentiality, and data-compliance risks, then produce a legal review checklist.',
      updated: '2026-07-03 19:17', tags: ['legal', 'contract', 'risk', 'compliance']
    },
    {
      slug: 'meeting-notes', title: 'Meeting notes generator', version: 'V1.1',
      desc: 'Extract topics, decisions, action items, and owners from transcripts into templated notes and follow-up task drafts.',
      updated: '2026-07-03 19:17', tags: ['meeting', 'notes', 'summary', 'productivity']
    },
    {
      slug: 'customer-interview-insight', title: 'Customer interview insights', version: 'V1.1',
      desc: 'Analyze interviews, sales notes, and feedback to surface pain points, opportunities, and product roadmap insights.',
      updated: '2026-07-03 19:17', tags: ['customer-research', 'interview', 'insight', 'product']
    },
    {
      slug: 'data-analysis-brief', title: 'Data analysis brief', version: 'V1.1',
      desc: 'Turn metrics, experiment results, or ops data into readable management briefs with trends, anomalies, and recommended actions.',
      updated: '2026-07-03 19:17', tags: ['analysis', 'metrics', 'report', 'dashboard']
    },
    {
      slug: 'incident-triage', title: 'Incident emergency triage', version: 'V1.3',
      desc: 'Extract signal from alert context, grade by SLO impact, correlate recent changes and similar past events, then suggest next steps.',
      updated: '2026-07-03 19:17', tags: ['incident', 'sre', 'alert', 'triage']
    },
    {
      slug: 'resume-screening', title: 'Resume screening', version: 'V1.1',
      desc: 'Screen candidate resumes against the role, extract matches and risks, and draft interview questions for the hiring team.',
      updated: '2026-07-03 19:17', tags: ['hr', 'recruiting', 'resume', 'interview']
    },
    {
      slug: 'release-notes-writer', title: 'Release notes writer', version: 'V1.2',
      desc: 'Turn merged PRs and tickets into customer-facing release notes with highlights, fixes, and known issues.',
      updated: '2026-08-11 09:40', tags: ['release', 'changelog', 'product', 'comms']
    },
    {
      slug: 'sql-query-guard', title: 'SQL query guard', version: 'V1.0',
      desc: 'Review proposed SQL for cost, correctness, and PII exposure before it runs against production warehouses.',
      updated: '2026-08-19 16:12', tags: ['sql', 'data', 'safety', 'warehouse']
    },
    {
      slug: 'onboarding-checklist', title: 'Onboarding checklist', version: 'V1.4',
      desc: 'Generate role-specific onboarding plans with owners, due dates, and knowledge links for new hires.',
      updated: '2026-09-02 11:05', tags: ['hr', 'onboarding', 'checklist', 'ops']
    },
    {
      slug: 'competitor-watch', title: 'Competitor watch', version: 'V1.1',
      desc: 'Summarize competitor launches, pricing moves, and messaging shifts into a weekly product brief.',
      updated: '2026-09-18 20:33', tags: ['research', 'competitive', 'product', 'brief']
    }
  ],
  ontology: [
    {
      name: 'Supplier discovery object set',
      desc: 'T2 supplier discovery — search strategy and CS confirmation chain for supplier candidates.',
      scenario: 'T2 Supplier discovery',
      author: 'ke wang', updated: '2026-07-30 13:40',
      status: 'Draft', statusKey: 'draft', versions: 2, theme: 'violet'
    },
    {
      name: 'Supplier deep-research object set',
      desc: 'T3 deep research on T2 candidates — multi-source collection, cross-check, and fusion into 6-dimension profiles with 4 risk labels.',
      scenario: 'T3 Supplier deep research',
      author: 'Feng Zhu', updated: '2026-06-21 19:06',
      status: 'Draft', statusKey: 'draft', versions: 2, theme: 'blue'
    },
    {
      name: 'Support ticket object set',
      desc: 'Shared support ontology — tickets, channels, intents, escalation paths, and knowledge links for triage and resolution.',
      scenario: 'Customer support operations',
      author: 'ke wang', updated: '2026-08-12 10:22',
      status: 'Published', statusKey: 'published', versions: 4, theme: 'slate'
    },
    {
      name: 'Retail allocation object set',
      desc: 'Store allocation ontology — demand signals, inventory snapshots, allocation rules, and override decisions.',
      scenario: 'Rule-based allocation',
      author: 'Lin Chen', updated: '2026-09-18 16:45',
      status: 'Draft', statusKey: 'draft', versions: 3, theme: 'blue'
    },
    {
      name: 'Incident response object set',
      desc: 'Operational incident ontology — alerts, services, impact levels, responders, and remediation actions.',
      scenario: 'Alert intake',
      author: 'Alex Wu', updated: '2026-10-06 09:30',
      status: 'Published', statusKey: 'published', versions: 5, theme: 'violet'
    }
  ],
  mcp: [
    {
      name: 'Ontology Action Executor', letter: 'O', color: '#6366f1', tag: 'ontology',
      updated: '2026-10-09 18:56',
      desc: 'Discover and run published ontology actions for the current object set. Agents must plan the sequence, analyze business impact, and wait for user confirmation before execution.'
    },
    {
      name: 'Builtin-OSS', letter: 'O', color: '#0f766e', tag: 'ontology',
      updated: '2026-08-28 15:08',
      desc: 'Built-in Alibaba Cloud OSS pre-signed URL tools (reuses mcp.proxy.minio config; AK/SK are server-side only). Supports oss_presign_get and upload pre-sign.'
    },
    {
      name: 'Ontology Rules Actions', letter: 'R', color: '#1d4ed8', tag: 'ontology',
      updated: '2026-07-23 14:47',
      desc: 'Ontology execution engine — rules and action configuration query endpoints'
    },
    {
      name: 'Ontology Execution Logs', letter: 'L', color: '#64748b', tag: 'ontology',
      updated: '2026-07-23 14:47',
      desc: 'Ontology execution engine log query'
    },
    {
      name: 'MinIO', letter: 'M', color: '#c2410c', tag: 'minio',
      updated: '2026-05-18 02:54',
      desc: 'Built-in object storage (legacy Builtin-MinIO; switch MinIO or Azure Blob via mcp.proxy.object-storage.provider). Agents use server-side refs without exposing credentials.'
    },
    {
      name: 'Ontology Graph Operator', letter: 'G', color: '#7c3aed', tag: 'ontology',
      updated: '2026-07-29 20:00',
      desc: 'Object set retrieval, object instance retrieval, object relationship graph query, L3 debug simulate-event and sandbox cleanup'
    }
  ],
  files: [{ placeholder: true }],
  'enterprise-assets': [
    {
      kind: 'documents',
      name: 'Enterprise Documents',
      desc: 'Policies, operating standards, process guides, and institutional knowledge shared across the enterprise.',
      count: '128 documents',
      meta: '12 collections · Updated today'
    },
    {
      kind: 'landscape',
      name: 'Business Landscape',
      desc: 'A connected view of business domains, capabilities, processes, and the scenarios they support.',
      count: '6 business domains',
      meta: '42 processes · Updated 2h ago'
    }
  ]
};
