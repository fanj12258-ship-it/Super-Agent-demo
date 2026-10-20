/* Enterprise asset navigation stays inside the Workbench. */
var enterpriseAssetDetail = null;
var enterpriseCanvasItems = [
  {id:'qualification',cardTitle:'Scenario Definition Canvas',title:'Supplier Qualification Canvas',scenario:'T3 Supplier qualification',desc:'Check supplier credentials and eligibility.',steps:['Receive application','Verify credentials','Check eligibility','Approve qualification','Publish supplier status','Request remediation','Review exceptions','Notify stakeholders']},
  {id:'discovery',cardTitle:'Scenario Definition Canvas',title:'Supplier Discovery Canvas',scenario:'T2 Supplier discovery',desc:'Find suppliers that match sourcing needs.',steps:['Capture sourcing needs','Search supplier pool','Match capabilities','Build shortlist','Share recommendations','Compare candidates','Review compliance','Confirm sourcing criteria']},
  {id:'onboarding',cardTitle:'Scenario Definition Canvas',title:'Supplier Onboarding Canvas',scenario:'T4 Supplier admission',desc:'Approve suppliers and complete onboarding.',steps:['Collect supplier profile','Review legal documents','Approve admission','Create vendor record','Activate supplier','Confirm access','Configure payment terms','Sign agreement']},
  {id:'performance',title:'Supplier Performance Canvas',scenario:'T5 Supplier performance',desc:'Review delivery, quality, and service levels.',steps:['Collect performance data','Calculate KPI scores','Review service levels','Publish scorecard','Track improvements','Assign action owners','Agree remediation','Investigate variances']},
  {id:'risk',title:'Supplier Risk Canvas',scenario:'T6 Supplier risk monitoring',desc:'Identify supplier risks and plan follow-up.',steps:['Monitor risk signals','Assess business impact','Prioritize risk cases','Notify risk owners','Track mitigation','Verify recovery','Plan alternative sources','Review exposure']}
];
function enterpriseCanvasById(id) { return enterpriseCanvasItems.find(function(x){return x.id===id;}); }
function renderEnterpriseHome(list) {
  var primary = renderEnterpriseAssets(list.filter(function(it){return it.kind!=='canvas';}));
  var cards = enterpriseCanvasItems.map(function(it){return '<button type="button" class="card ea-card ea-canvas" data-enterprise-asset="'+it.id+'"><div class="ea-preview">'+enterpriseAssetPreview('canvas')+'</div><div class="ea-body"><div class="ea-title-row"><span class="ea-icon"><svg width="16" height="16" aria-hidden="true"><use href="#ws-canvas"/></svg></span><span class="ea-name">'+(it.cardTitle||it.title)+'</span><span class="ea-arrow" aria-hidden="true">→</span></div><div class="ea-scenario-name">'+it.scenario+'</div><p class="ea-desc">'+it.desc+'</p><div class="ea-home-tags"><span>Business</span><span>Crafting</span></div><div class="ea-foot"><span>6 business domains</span><span>42 processes · Updated 2h ago</span></div></div></button>';}).join('');
  return '<section class="ea-home-primary">'+primary+'</section><section class="ea-home-canvases"><h2>Scenario Definition Canvas</h2><div class="ea-grid">'+cards+'</div></section>';
}
function openEnterpriseAsset(id) {
  if(!['documents','landscape'].includes(id)&&!enterpriseCanvasById(id))return;
  enterpriseAssetDetail=id;
  render('enterprise-assets');
  document.querySelector('.main-body').scrollTop=0;
}
function backFromEnterpriseAsset(){
  if(!enterpriseAssetDetail)return false;
  var previous=enterpriseAssetDetail;enterpriseAssetDetail=null;render('enterprise-assets');
  var card=content.querySelector('[data-enterprise-asset="'+previous+'"]');if(card)card.focus();
  return true;
}
document.getElementById('mainTop').addEventListener('click',function(e){if(e.target.closest('[data-enterprise-back]'))backFromEnterpriseAsset();});
