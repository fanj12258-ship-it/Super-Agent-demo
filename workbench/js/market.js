/* Market catalog and skill drilldown, following the supplied Figma frames. */
var marketState = { tab: 'skill', detail: false };
var marketOverview = "Discover and execute published ontology actions in the current object set.\n\n[REQUIRED] Before directly invoking ontology actions, the agent must plan the action sequence, assess its business impact, and obtain user confirmation before executing the sequence. Never call execute without completing planning, impact analysis, and user confirmation.\n\nCall order:\n\nontology_action_list → ontology_action_describe → planning and impact analysis, followed by user confirmation → ontology_action_execute.\n\nWhen planning, read invoke_mode / invoke_hint for every action:\n\n- direct: Invoke directly with literal params. For type=invoke_api/invoke_llm/invoke_function, always describe before execute.\n\n- signal_cascade: Write *_trigger. Direct invocation automatically emits cascade events and runs rule THEN actions. Prefer this fully automated path whenever signal_cascade can complete the workflow.\n\n- rule_chain_only: Depends on $action/[$index]. create_relation supports literal from_instance_id/to_instance_id, with optional from_object_type/to_object_type, to immediately stitch relationship edges. Never invoke with empty params. Never describe skipping relationship creation or graph persistence as “not affecting the core workflow.” Other rule_chain_only actions should normally be triggered through rule THEN actions by an upstream signal_cascade.\n\n[CHOOSE ONE PATH — DO NOT COMBINE]\n\nUse only one path for the same business outcome. Combining paths can create duplicate graph records:\n\nA) Fully automated: Invoke only signal_cascade / write *_trigger, or use emit_cascade_events=true when necessary. Let rule THEN actions create result/metrics/alert and other records. Do not manually call create_* for the same instances afterward.\n\nB) Manual: Use create_instance + create_relation with literal params to stitch edges. Do not subsequently invoke workflow-advancing actions that emit cascade events, use emit_cascade_events=true, or rely on rule THEN actions to persist the same graph records again.\n\n[STITCHING DISCIPLINE]\n\nWhen using path B, immediately stitch the corresponding link_* relationships after consecutive create_instance calls. Do not omit relationships.\n\n[RELATIONSHIP COMPLETENESS REVIEW]\n\nAfter autonomously planning and completing the main task, use graph retrieval to verify that all expected relationship edges in the current business workflow exist. If any edges are missing, immediately add them using create_relation / link_* with literal params, or batch_upsert_edges. Never skip missing-edge repairs on the grounds that “the task is already complete.”\n\n[NO PARALLEL CHAINS]\n\nIf the graph already contains a simulation→run relationship or an equivalent upstream chain, do not create a parallel allocation run with create_allocation_run. Fetch the existing relationships before planning.\n\nThe restriction is not that “link-type actions cannot be invoked directly.” Direct invocation is disallowed when invoke_mode=rule_chain_only and sufficient literal parameters are unavailable.\n\nexecute params must contain literal values only.\n\nDirect invocation does not emit cascade events by default, except:\n\n1. signal_cascade / an explicitly declared write to *_trigger.\n\n2. emit_cascade_events=true, used only when required by path A.\n\nTo modify instances or edges and trigger rules, you may also use batch_upsert_nodes / batch_upsert_edges on the graph retrieval endpoint.\n\nFor execution logs and results, use the production Ontology Execution Logs endpoint: get_exec_log_details / list_ont_exec_logs. This endpoint does not provide log tools.";
var marketPreview = '---\nname: code-review-assistant\nversion: V5.0\ndescription: |\nStructured code review on Git diffs …\ntags: [code-review, git, pr, quality]\n---';

function renderMarket() {
  if (marketState.detail) {
    var text = escapeHtmlModal(marketOverview);
    return '<section class="market-detail"><h2>Overview</h2><div class="market-document market-overview" tabindex="0">' + text + '</div><h2>Tools <span class="market-tag">2</span></h2><div class="market-document" tabindex="0">' + text + '</div><div class="market-document" tabindex="0">' + text + '</div></section>';
  }
  var tabs = '<div class="market-tabs" role="tablist" aria-label="Market catalogs">' + ['skill', 'mcp'].map(function (tab) {
    return '<button type="button" role="tab" aria-selected="' + (marketState.tab === tab) + '" aria-controls="marketPanel" id="marketTab-' + tab + '" data-market-tab="' + tab + '">' + (tab === 'skill' ? 'Skill Market' : 'MCP Market') + '</button>';
  }).join('') + '</div>';
  var cards = Array.from({ length: 6 }, function () {
    if (marketState.tab === 'mcp') return '<article class="market-card market-mcp"><span class="market-avatar">O</span><div class="market-card-copy"><h2>Builtin-OSS</h2><p>Built-in Alibaba Cloud OSS pre-signed URL tools (reuses mcp.proxy.minio config; AK/SK are server-side only). Supports oss_presign_get and upload pre-sign.</p><p>Updated: 2026-08-28 15:08</p><span class="market-tag">Ontology</span></div></article>';
    return '<button type="button" class="market-card market-skill" data-market-skill aria-label="Open Code Review Assistant skill detail"><pre>' + escapeHtmlModal(marketPreview) + '</pre><div class="market-card-copy"><div class="market-card-title"><h2>Code Review Assistant</h2><span class="market-tag">V5.0</span></div><p>Structured code review on Git diffs or PRs — spot logic bugs, security risks, and style issues, then suggest actionable fixes. Supports team-specific check rules.</p><p>Updated: 2026-07-06 22:59</p><div class="market-tags"><span class="market-tag">code-review</span><span class="market-tag">git</span><span class="market-tag">pr</span></div></div></button>';
  }).join('');
  return tabs + '<div class="market-grid" id="marketPanel" role="tabpanel" aria-labelledby="marketTab-' + marketState.tab + '">' + cards + '</div>';
}

function backFromMarketDetail() {
  if (!marketState.detail) return false;
  marketState.detail = false;
  render('market');
  var card = content.querySelector('[data-market-skill]');
  if (card) card.focus();
  return true;
}

content.addEventListener('click', function (event) {
  var tab = event.target.closest('[data-market-tab]');
  if (tab) {
    marketState.tab = tab.dataset.marketTab;
    render('market');
    content.querySelector('[data-market-tab="' + marketState.tab + '"]').focus();
  }
  if (event.target.closest('[data-market-skill]')) {
    marketState.detail = true;
    render('market');
    document.querySelector('.main-body').scrollTop = 0;
    content.querySelector('.market-overview').focus();
  }
});
content.addEventListener('keydown', function (event) {
  if (!event.target.matches('[data-market-tab]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  var tab = event.key === 'Home' ? 'skill' : event.key === 'End' ? 'mcp' : marketState.tab === 'skill' ? 'mcp' : 'skill';
  content.querySelector('[data-market-tab="' + tab + '"]').click();
});
document.getElementById('mainTop').addEventListener('click', function (event) {
  if (event.target.closest('[data-market-back]')) backFromMarketDetail();
});
