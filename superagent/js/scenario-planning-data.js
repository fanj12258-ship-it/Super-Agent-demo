/* Scenario Planning content from Figma 324:72716. */
window.scenarioPlanningData = [
  {
    "title": "Application ① Smart Sales & Bidding Engine",
    "scenario": "Yingpai Technology’s sales and bidding process relies heavily on senior consultants drafting proposals manually. Only a few consultants among 2,000+ employees can develop complete proposals. Solution design (40–80 person-hours per proposal) and contract review (3–5 working days per round, across multiple rounds) are key sales funnel bottlenecks, directly limiting win rates and productivity.",
    "rationale": "Sales generates revenue. Faster proposal development directly contributes to revenue growth, making this the AI entry point with the highest ROI.",
    "scenarios": [
      {
        "id": "324:73442",
        "title": "Smart Proposal Assistant",
        "priority": "Quick Win",
        "scenario": "Drafting a complete proposal takes 20–40 hours and relies on manual work by senior consultants. Technical architecture accounts for 30–40% of proposal development time, and senior architects are the scarcest resource. Bidding across finance, automotive, and manufacturing requires domain-specific expertise that one consultant rarely covers in full.",
        "rationale": "WSJF 2.57, the highest of all 10 scenarios. Directly increases sales capacity and win rates. Data readiness level B supports a quick start."
      },
      {
        "id": "324:73454",
        "title": "Bid Knowledge Base & Case Matching",
        "priority": "Expansion",
        "scenario": "Finding cases across projects and adapting them takes 6–12 hours per proposal. Case selection relies heavily on senior consultants’ experience; new hires cannot do it independently.",
        "rationale": "Depends on the A8 knowledge foundation and structured case annotation. Near-term ROI is lower than A1. Build incrementally after the knowledge foundation launches."
      },
      {
        "id": "324:73466",
        "title": "Smart Contract Review & Risk Detection",
        "priority": "Strategic",
        "scenario": "Drafting a non-standard contract takes 8–16 hours. Templates vary across finance, automotive, and manufacturing. Legal review for financial projects takes 3–5 working days per round, with 3–5 revision rounds.",
        "rationale": "WSJF 2.0. Strong technical feasibility, but lower business value than proposal drafting and coding. Expand into this area after initial quick wins."
      }
    ]
  },
  {
    "title": "Application ② AI-Enhanced Engineering Delivery",
    "scenario": "Coding (40–60% of project time), testing (25–40%), and delivery documentation (25–40% of project closeout time) create major delivery inefficiencies. Low AI Copilot adoption and inconsistent prompt engineering keep actual efficiency gains below 15%, far short of the 30–50% potential.",
    "rationale": "Engineering Excellence is the foundation of Yingpai’s business. AI for software engineering is both an internal productivity driver and a core competitive advantage in its service offerings.",
    "scenarios": [
      {
        "id": "324:73492",
        "title": "AI Coding Assistant Platform",
        "priority": "Quick Win",
        "scenario": "Manual coding takes 40–60% of project time. AI Copilot adoption is low and prompts are inconsistent. Actual efficiency gains are below 15%, versus a potential 30–50%. New hires’ code quality varies, while AI hallucinations introduce subtle defects.",
        "rationale": "WSJF 2.11. Very high business value and strong alignment with the AI/works strategy. A flagship initiative demonstrating Engineering Excellence in the AI era."
      },
      {
        "id": "324:73504",
        "title": "Smart Code Review & Quality Gates",
        "priority": "Quick Win",
        "scenario": "Code review takes 15–25% of engineers’ time, with quality varying by reviewer. Architecture compliance checks depend on scarce architects. Missing or inconsistent design documents increase maintenance costs.",
        "rationale": "WSJF 2.29. High technical feasibility. Complements the A4 coding assistant to form a complete workflow and provides the first step toward AI-powered quality assurance."
      },
      {
        "id": "324:73516",
        "title": "Smart Testing Engine",
        "priority": "Strategic",
        "scenario": "Writing test cases takes 25–35% of testing time. Manual regression testing takes 30–50% and must be repeated every iteration. Automated scripts are costly to maintain, and UI changes invalidate many of them.",
        "rationale": "WSJF 1.50. Higher technical risk. Tackle incrementally after A4/A5 launch."
      },
      {
        "id": "324:73529",
        "title": "Automated Delivery Documentation",
        "priority": "Strategic",
        "scenario": "Delivery documentation takes 25–40% of project closeout time. Operations manuals, API documentation, and architecture descriptions largely duplicate information in the implementation.",
        "rationale": "WSJF 2.17, but lower business value than A4/A5. A natural extension once the coding and review workflow is established."
      }
    ]
  },
  {
    "title": "Application ③ Enterprise Knowledge Hub",
    "scenario": "Over 20 years of project experience is scattered across the minds of 2,000+ employees. Cross-project searches take 1–3 hours each, wasting at least 10,000 person-hours annually. New hires need 3–6 months to become productive. Knowledge is fragmented across Confluence, GitHub, Slack, and email, with no unified semantic layer. Staff turnover during the brand transition increases the risk of knowledge loss.",
    "rationale": "The knowledge foundation is shared infrastructure for Application ① proposal drafting and Application ② engineering delivery. Without structured knowledge, AI can provide only generic answers.",
    "scenarios": [
      {
        "id": "324:73553",
        "title": "Enterprise Knowledge Search",
        "priority": "Quick Win",
        "scenario": "Knowledge is easy to add but hard to find. Updates depend on individual initiative, while search relies on keywords. Cross-project searches take 1–3 hours each, wasting 10,000+ person-hours annually. Knowledge is fragmented across Confluence, GitHub, Slack, and email.",
        "rationale": "WSJF 2.25. Extremely high infrastructure value. Provides the knowledge foundation for all downstream agents and must be prioritized."
      },
      {
        "id": "324:73565",
        "title": "Smart Onboarding Assistant",
        "priority": "Strategic",
        "scenario": "New hires take 3–6 months to become productive and spend much of their first two months finding information. Onboarding relies on hands-on guidance from mentors, requiring significant mentor time.",
        "rationale": "Depends on the A8 knowledge foundation. Building learning paths requires substantial engineering work. Proceed after A8 is running reliably."
      },
      {
        "id": "324:73577",
        "title": "Industry Knowledge Graph & Best Practices",
        "priority": "Expansion",
        "scenario": "Distilling methodologies and best practices relies on a few expert consultants. Industry knowledge, including financial compliance, automotive technology stacks, and manufacturing supply chains, resides entirely with individuals.",
        "rationale": "WSJF 0.92. Depends on the A8 knowledge foundation and mature A9 onboarding workflows. Build incrementally as a long-term strategic asset."
      }
    ]
  }
];
