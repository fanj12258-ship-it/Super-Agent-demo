/* Enterprise assets reuse the scenario room, Files tree, and FastDocs tabs. */
(function () {
  'use strict';
  var FD=window.FastDocs;
  var inWorkbench=!!document.getElementById('mainContent');
  var assetPrefix=inWorkbench?'../superagent/':'';
  var names={planning:'Scenario Planning',landscape:'Business Landscape',canvas:'Scenario Definition Canvas',documents:'Enterprise Documents'};
  var displayNames=names;
  var contentVisible={documents:inWorkbench,landscape:inWorkbench,planning:inWorkbench,canvas:true};
  var planningAppLimit=null; /* null = all apps; number = first N application packs */
  var planningBizLimit=null; /* null = all business cards; number = first N per application */
  var planningOverride=null; /* optional { title, scenario, rationale, biz:{ title, scenario, rationale } } for first pack */
  var state={canvasTab:'To-Be Design',docsTab:'Enterprise Profile',source:null,history:false,changes:false,wrap:false};
  var roots={};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function button(label,attrs,cls){return '<button type="button" class="ea-room-button '+(cls||'')+'" '+attrs+'>'+label+'</button>';}
  function pill(text,cls){return '<span class="ea-room-pill '+(cls||'')+'">'+text+'</span>';}
  function table(headers,rows){return '<div class="ea-room-table"><table><thead><tr>'+headers.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(x){return '<td>'+x+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
  var flows = {
    value: { label: 'Enterprise value stream', nodes: [
      ['Discover demand','Customer signals',30,80],['Design solution','Product & service teams',270,80],['Deliver products','Supply chain operations',510,80],['Support customers','After-sales service',750,80],
      ['Improve experience','Feedback & quality loop',750,290],['Measure outcomes','FTF · CSAT · Resolution time',510,290],['Resolve issues','Diagnosis · Repair · Parts',270,290],['Capture service request','App · Store · Contact center',30,290]
    ], edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]] },
    diagnosis: { label: 'Fault diagnosis workflow', nodes: [
      ['Receive symptoms','Customer submits a request',30,75],['Collect device context','Serial number & service history',270,75],['Run AI diagnosis','Match symptoms to known issues',510,75],['Confidence ≥ 85%?','Choose remote or assisted path',750,75],
      ['Close service case','Write results back to GSX',30,300],['Verify resolution','Customer confirms the outcome',270,300],['Send remote guidance','Automated troubleshooting steps',510,300],['Specialist review','Validate fault & book a store visit',750,300]
    ], edges:[[0,1],[1,2],[2,3],[3,6,'Yes'],[3,7,'No'],[7,6],[6,5],[5,4]] },
    parts: { label: 'Spare parts replenishment workflow', nodes: [
      ['Detect parts demand','Repair order requests a part',30,75],['Check store inventory','Validate stock & compatibility',270,75],['Stock available?','Confirm the fulfillment path',510,75],['Reserve & dispatch','Allocate stock to the repair',750,75],
      ['Complete repair','Confirm installation & consumption',750,300],['Update inventory','Sync usage and service records',510,300],['Replenish from hub','Transfer stock from a regional hub',270,300],['Create purchase request','Source unavailable components',30,300]
    ], edges:[[0,1],[1,2],[2,3,'Yes'],[3,4],[4,5],[2,6,'No'],[6,3],[6,7,'No hub stock']] },
    tobe: { label: 'Remote diagnosis To-Be workflow', nodes: [
      ['Describe the issue','Customer · Support app',30,75],['Identify likely cause','AI · Symptoms + device history',270,75],['Confidence ≥ 85%?','AI · Route by confidence',510,75],['Resolve remotely','Customer · Guided health check',750,75],
      ['Confirm case closure','AI · Update GSX & notify customer',750,300],['Approve repair quote','Customer · Warranty & pricing',510,300],['Inspect the device','Engineer · In-store diagnostics',270,300],['Review & schedule','Support · Validate AI evidence',30,300]
    ], edges:[[0,1],[1,2],[2,3,'Yes'],[3,4],[2,7,'No'],[7,6],[6,5],[5,4]] }
  };
  function flowDiagram(key){
    var f=flows[key], marker='ea-arrow-'+key;
    if(!f.edgePorts)f.edgePorts=f.edges.map(function(e){var n=f.nodes[e[0]],m=f.nodes[e[1]];return n[3]===m[3]?(m[2]>n[2]?['right','left']:['left','right']):(m[3]<n[3]?['top','bottom']:['bottom','top']);});
    function port(node,side){return side==='left'?[node[2],node[3]+38]:side==='right'?[node[2]+200,node[3]+38]:side==='top'?[node[2]+100,node[3]]:[node[2]+100,node[3]+76];}
    function handle(point,side,distance){return [point[0]+(side==='right'?distance:side==='left'?-distance:0),point[1]+(side==='bottom'?distance:side==='top'?-distance:0)];}
    var edges=f.edges.map(function(e,index){var sides=f.edgePorts[index],a=port(f.nodes[e[0]],sides[0]),b=port(f.nodes[e[1]],sides[1]),horizontal=sides[0]==='left'||sides[0]==='right',straight=horizontal&&Math.abs(a[1]-b[1])<.5,distance=Math.max(24,Math.min(180,Math.hypot(b[0]-a[0],b[1]-a[1])*.5)),c=handle(a,sides[0],distance),d=handle(b,sides[1],distance),path='M'+a[0]+' '+a[1]+(straight?'L'+b[0]+' '+b[1]:'C'+c[0]+' '+c[1]+' '+d[0]+' '+d[1]+' '+b[0]+' '+b[1]);
      return '<path d="'+path+'" class="ea-flow-edge" marker-end="url(#'+marker+')"/>'+(e[2]?'<text x="'+((a[0]+b[0])/2+8)+'" y="'+((a[1]+b[1])/2-8)+'" class="ea-flow-label">'+e[2]+'</text>':'');
    }).join('');
    return '<svg class="ea-flow-svg" data-flow-key="'+key+'" viewBox="0 0 1000 430" role="img" aria-label="'+f.label+'"><defs><marker id="'+marker+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#9ba7b7"/></marker></defs><text x="30" y="30" class="ea-flow-caption">'+f.label+' · Sample workflow</text>'+edges+f.nodes.map(function(n,i){return '<g class="ea-flow-node '+(n[0].includes('?')?'is-decision':'')+'" tabindex="0" role="button" aria-label="'+esc(n[0])+': '+esc(n[1])+'" data-ea-flow="'+key+'" data-ea-node="'+i+'"><foreignObject x="'+n[2]+'" y="'+n[3]+'" width="200" height="76"><div xmlns="http://www.w3.org/1999/xhtml" class="ea-flow-card"><div class="ea-flow-card-main"><span class="ea-flow-icon">'+(n[0].includes('?')?'◇':'▧')+'</span><div class="ea-flow-copy"><strong>'+esc(n[0])+'</strong><span>'+esc(n[1])+'</span></div></div><div class="ea-flow-card-footer"><span>Step '+(i+1)+'</span><span class="ea-flow-tag">'+(n[0].includes('?')?'Condition':'Process')+'</span></div></div></foreignObject></g>';}).join('')+'</svg>';
  }
  function grid(title,kind){var key=kind==='canvas'?'tobe':title.includes('Fault Diagnosis')?'diagnosis':title.includes('Spare Parts')?'parts':'value';return '<section class="ea-grid-card"><div class="ea-canvas-toolbar"><h3>'+title+'</h3><div class="ea-canvas-zoom" role="group" aria-label="Canvas zoom">'+button('−','data-ea-zoom="out" aria-label="Zoom out"')+'<output aria-live="polite">100%</output>'+button('+','data-ea-zoom="in" aria-label="Zoom in"')+button('Reset','data-ea-zoom="reset" aria-label="Reset zoom"')+'</div></div><div class="ea-grid-image">'+flowDiagram(key)+'</div><div class="ea-flow-detail" role="status">Select a step to inspect its role and outcome.</div></section>';}

  var glossary=[['GSX','Global Service Exchange, the authorized service provider portal','Submit service orders and check warranty status'],['AASP','Apple Authorized Service Provider','Third-party authorized service locations'],['First-time Fix (FTF)','Share of service orders resolved on the first repair','Current: 86%; target: 92%'],['AST 2','Apple Service Toolkit diagnostics','Run diagnostics during an in-store inspection'],['DRI','Directly Responsible Individual','One owner for each quality issue']];
  function landscape(){return '<nav class="ea-section-nav" aria-label="Business landscape sections">'+['Value Stream','Fault Diagnosis','Spare Parts Replenishment','Enterprise Glossary'].map(function(title,i){return button(title,'data-ea-section="land'+i+'" aria-pressed="'+(i===0)+'"',i===0?'is-active':'');}).join('')+'</nav><div class="ea-room-content ea-visual-content">'+grid('Value Stream','landscape')+grid('Drill-down · After-sales Service (Issue to Resolution) › Fault Diagnosis','landscape')+grid('Drill-down · After-sales Service (Issue to Resolution) › Spare Parts Replenishment','landscape')+'<h3>Enterprise Glossary</h3><p class="ea-room-muted">Shared terms used across the canvas and business discussions.</p>'+table(['Term','Definition','Example'],glossary)+'</div>';}
  var stories=[
    {title:'Story 1: Resolve common issues remotely',steps:['The customer describes slow charging and overheating in the support app. AI extracts symptoms and links the device serial number.','AI matches the known issue library and suggests battery degradation with 91% confidence, together with a resolution plan.','When confidence exceeds 85%, the remote resolution is sent directly to the customer. Frontline support sees a summary without needing to intervene.','The customer completes the battery health check. The case closes and the result is written back to GSX.']},
    {title:'Story 2: Escalate low-confidence cases for human review',steps:['The customer reports that the device will not turn on after liquid exposure. AI produces a diagnosis with 62% confidence.','The case moves to frontline support. The workspace shows candidate faults, evidence, and similar cases. Support confirms liquid damage to the main board.','AI identifies the need for an in-store visit, books the nearest location, and sends preparation instructions to the customer.','After inspection, AI writes the findings back to GSX and the store work-order system without duplicate entry.']},
    {title:'Story 3: Determine warranty coverage and prepare a quote',steps:['AI reviews the inspection and warranty records, recommends that accidental damage is outside coverage, and highlights the supporting policy.','The service advisor reviews the recommendation and evidence, then confirms and generates a quote.','The customer receives and accepts the quote. The repair order proceeds to execution.']}
  ];
  function codeView(){var code='function greet(name) {\n  // owner briefing helper\n  return `Hello, ${name}`\n}';return '<div class="ea-room-content ea-agent-view"><p class="ea-room-muted">Agent View shows the candidate-version summary, excluding current and candidate full content.</p><div class="ea-code"><header><span>json</span><div>'+button('Wrap','data-ea-wrap aria-pressed="'+state.wrap+'"')+button('Copy','data-ea-copy')+'</div></header><pre class="'+(state.wrap?'is-wrapped':'')+'"><code>'+code.split('\n').map(function(x,i){return '<span class="ea-code-line"><i>'+(i+1)+'</i>'+esc(x)+'</span>';}).join('')+'</code></pre></div><span class="ea-room-muted" data-ea-copy-status role="status"></span></div>';}
  var assetLocks={};
  function assetControls(title){return (state.changes?'<div class="ea-room-changes"><strong>Candidate version · v1.0.0</strong><p>Review the current '+esc(title)+' content against the previously confirmed version.</p></div>':'');}
  function status(title){return assetControls(title);}
  function initHeaderMarquee(root){
    if(root.headerMarqueeObserver)root.headerMarqueeObserver.disconnect();
    function update(){var box=root.querySelector('.ea-header-marquee');if(!box)return;var text=box.firstElementChild,overflow=Math.max(0,text.scrollWidth-box.clientWidth);box.classList.toggle('is-overflowing',overflow>1);box.style.setProperty('--marquee-distance',(-overflow)+'px');box.style.setProperty('--marquee-duration',Math.max(8,overflow/25)+'s');}
    requestAnimationFrame(update);if(typeof ResizeObserver!=='undefined'){root.headerMarqueeObserver=new ResizeObserver(update);var box=root.querySelector('.ea-header-marquee');if(box)root.headerMarqueeObserver.observe(box);}
  }
  function assetHeader(kind,ready){
    var title=displayNames[kind];
    var lock='<div class="ea-control-label"><span>Content locked</span><span class="ea-info-tip" tabindex="0"><img src="'+assetPrefix+'assets/enterprise/info.svg" width="12" height="12" alt="About content locking"><span role="tooltip">When locked, this content is protected from AI changes during building.</span></span>'+button('','data-ea-content-lock="'+kind+'" role="switch" aria-label="Lock content" aria-checked="'+!!assetLocks[kind]+'"','ea-mini-switch')+'</div>';
    return '<header class="ea-room-header"><div class="ea-header-summary"><span class="ea-header-name">'+esc(title)+'</span>'+pill('v1.0.0')+'<span class="ea-room-muted ea-header-marquee"><span>2026-10-13 15:10 · AI updated · Enterprise Planning · Public Space</span></span></div>'+(ready?'<div class="ea-room-header-actions"><div class="ea-control-label"><span>Show version changes</span>'+button('','data-ea-changes role="switch" aria-label="Show version changes" aria-checked="'+state.changes+'"','ea-mini-switch')+'</div>'+lock+button('<img src="'+assetPrefix+'assets/enterprise/history.svg" width="12" height="12" alt="">','data-ea-history aria-label="Version history" title="Version history"','ea-header-icon-button')+(kind==='planning'?button('<img src="'+assetPrefix+'assets/enterprise/sync.svg" width="12" height="12" alt="">Sync to scenarios','data-ea-plan-sync','ea-sync-button'):'')+'</div>':'')+'</header>';
  }
  function canvas(){var tabs=['To-Be Design','User Stories','Agent View'];return '<div class="ea-room-tabs" role="tablist" aria-label="Scenario canvas views">'+tabs.map(function(t){return button(t,'role="tab" aria-selected="'+(state.canvasTab===t)+'" data-ea-canvas-tab="'+t+'"',state.canvasTab===t?'is-active':'');}).join('')+'</div><div role="tabpanel">'+(state.canvasTab==='Agent View'?codeView():status(state.canvasTab)+'<div class="ea-room-content ea-visual-content">'+(state.canvasTab==='To-Be Design'?grid('To-Be Design','canvas'):stories.map(function(s){return '<section class="ea-story"><header><strong>'+s.title+'</strong></header><p class="ea-room-muted">Participants: Customer · Frontline Support</p><ol>'+s.steps.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol></section>';}).join(''))+'</div>')+'</div>';}
  var sectionNames=['Company Information','Organization Size','Business Portfolio & Revenue','Digital Maturity','Strategic Challenges','Decision-making Roles','Industry Environment'];
  var fieldData=[
    [['Founded','1976-04-01'],['Ownership','NASDAQ-listed company with distributed ownership. Institutional shareholders include Vanguard, BlackRock, and Berkshire Hathaway.'],['Headquarters','Cupertino, California, USA'],['Industry','Consumer electronics / Software and services'],['Address','Yingdu Building, Zhichun Road, Beijing']],
    [['Employees','164,000 employees (updated)'],['Organization','Functional organization structured by expertise, with accountability assigned through the DRI model.']],
    [['Annual Revenue','<strong>391 B USD (FY2024)</strong>'],['Revenue Breakdown',table(['Product Line','Revenue ($B)','Share'],[['iPhone','201.2','51%'],['Services','96.2','25%'],['Wearables/Home','37.0','9%'],['Mac','30.0','8%'],['iPad','26.7','7%']])],['Regional Revenue Distribution','<div class="ea-revenue-chart"><div class="ea-revenue-chart-heading"><strong>Regional revenue mix</strong><span>Share of total revenue</span></div><div class="ea-revenue-row" style="--fill:#b8d5f2;--share:42"><span class="ea-revenue-name"><i></i>Americas</span><span class="ea-revenue-track"><i></i></span><strong>42%</strong></div><div class="ea-revenue-row" style="--fill:#c7c8ed;--share:26"><span class="ea-revenue-name"><i></i>Europe</span><span class="ea-revenue-track"><i></i></span><strong>26%</strong></div><div class="ea-revenue-row" style="--fill:#b8dcd4;--share:17"><span class="ea-revenue-name"><i></i>Greater China</span><span class="ea-revenue-track"><i></i></span><strong>17%</strong></div><div class="ea-revenue-row" style="--fill:#e2d5bf;--share:15"><span class="ea-revenue-name"><i></i>Other regions</span><span class="ea-revenue-track"><i></i></span><strong>15%</strong></div></div>'],['Business Portfolio',portfolio()]],
    [['Maturity Assessment',table(['Dimension','Score','Notes'],[['Data Foundation','4/5','External estimate'],['Process Automation','4/5','External estimate'],['AI Adoption Depth','3/5','Validate through interviews']])]],
    [['Business Portfolio',portfolio()]],
    [['Decision Chain',table(['Role','Position'],[['Sponsor','CFO'],['Decision Maker','COO'],['Users','Global Supply Chain Planning Team']])]],
    [['Competitors',portfolio()],['Founded','1976-04-01']]
  ];
  function portfolio(){return '<div class="ea-portfolio">'+Array.from({length:3},function(){return '<div><strong>Hardware</strong><p>iPhone / Mac / iPad / Wearables</p></div>';}).join('')+'</div>';}
  function sourceButton(section,index,value){var content=section===0&&index===0?'1976-04-01':value.replace(/<[^>]*>/g,' ').slice(0,200);return button('1 source','data-ea-source="'+esc(content)+'" data-ea-source-field="'+esc(fieldData[section][index][0])+'"','ea-source-link');}
  function documents(){return '<div class="ea-company-title"><strong>Apple Inc.</strong>'+pill('ENT-2026-000137')+'</div><div class="ea-room-tabs" role="tablist" aria-label="Enterprise document views">'+['Enterprise Profile','Agent View'].map(function(t){return button(t,'role="tab" aria-selected="'+(state.docsTab===t)+'" data-ea-docs-tab="'+t+'"',state.docsTab===t?'is-active':'');}).join('')+'</div>'+(state.docsTab==='Agent View'?codeView():'<div class="ea-document-body"><nav class="ea-section-nav" aria-label="Enterprise profile sections">'+button('Company Name','data-ea-section="name" aria-pressed="true"','is-active')+sectionNames.map(function(t,i){return button(t,'data-ea-section="'+i+'" aria-pressed="false"','');}).join('')+'</nav>'+sectionNames.map(function(title,si){return '<section id="ea-profile-'+si+'" class="ea-profile-section"><h3>'+title+'</h3><div class="ea-fields">'+fieldData[si].map(function(row,ri){return '<div class="ea-field'+(row[1].length>100&&row[1].indexOf('<')===-1?' ea-field-wide':'')+'"><strong>'+row[0]+'</strong><div>'+row[1]+sourceButton(si,ri,row[1])+'</div></div>';}).join('')+'</div></section>';}).join('')+'</div>');}
  var planningSelection={};
  function applyPlanningOverride(apps){
    if(!planningOverride||!apps.length)return apps;
    var o=planningOverride;
    return apps.map(function(app,i){
      if(i!==0)return app;
      var next={
        title:o.title!=null?o.title:app.title,
        scenario:o.scenario!=null?o.scenario:app.scenario,
        rationale:o.rationale!=null?o.rationale:app.rationale,
        badge:o.badge!=null?o.badge:app.badge,
        scenarios:(app.scenarios||[]).map(function(item,j){
          if(j!==0||!o.biz)return item;
          return{
            id:item.id,
            title:o.biz.title!=null?o.biz.title:item.title,
            priority:o.biz.priority!=null?o.biz.priority:item.priority,
            scenario:o.biz.scenario!=null?o.biz.scenario:item.scenario,
            rationale:o.biz.rationale!=null?o.biz.rationale:item.rationale,
            badge:o.biz.badge!=null?o.biz.badge:item.badge
          };
        })
      };
      return next;
    });
  }
  function planningApps(){
    var all=window.scenarioPlanningData||[];
    var sliced=(planningAppLimit==null||planningAppLimit>=all.length)?all:all.slice(0,Math.max(0,planningAppLimit|0));
    return applyPlanningOverride(sliced);
  }
  function planningBiz(app){
    var all=app.scenarios||[];
    if(planningBizLimit==null||planningBizLimit>=all.length)return all;
    return all.slice(0,Math.max(0,planningBizLimit|0));
  }
  function planning(){
    function selected(id){return planningSelection[id]===true;}
    function check(id,title,app,badge){return '<label class="ea-plan-choice"><input type="checkbox" '+(app?'data-ea-plan-app="'+id+'"':'data-ea-plan-scenario="'+id+'"')+' '+(selected(id)?'checked':'')+'><span class="ea-plan-choice-text">'+esc(title)+(badge?' <span class="ea-plan-new">'+esc(badge)+'</span>':'')+'</span></label>';}
    function tags(type,priority){return '<div class="ea-plan-tags"><span>'+type+'</span><span class="'+(priority==='Quick Win'?'quick':priority==='Strategic'?'strategic':'expansion')+'">'+priority+'</span></div>';}
    function copy(item){return '<div class="ea-plan-copy"><p>Scenario:</p><p>'+esc(item.scenario)+'</p><p>Rationale:</p><p>'+esc(item.rationale)+'</p></div>';}
    return status('Scenario Planning')+'<div class="ea-plan-content">'+planningApps().map(function(app,ai){var biz=planningBiz(app);return '<section class="ea-plan-application"><header>'+check(ai,app.title,true,app.badge)+tags('Application','Quick Win')+'</header>'+copy(app)+'<div class="ea-plan-scenarios">'+biz.map(function(item,i){return '<article class="ea-plan-scenario '+(biz.length===4&&i===3?'is-wide':'')+'"><header>'+check(item.id,item.title,false,item.badge)+tags('Business',item.priority)+'</header>'+copy(item)+'</article>';}).join('')+'</div></section>';}).join('')+'<p class="ea-plan-result" role="status"></p></div>';
  }
  function render(kind){
    var root=roots[kind];
    var previousScroll=root.querySelector('.ea-article-scroll');
    var scrollTop=previousScroll?previousScroll.scrollTop:0;
    var chrome='<div class="ea-room-breadcrumb">Deliverable / <strong>'+displayNames[kind]+'</strong></div><article class="ea-room-article">'+assetHeader(kind,contentVisible[kind]);
    if(!contentVisible[kind]){
      root.innerHTML=chrome+'<div class="ea-room-empty"><span class="ea-room-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5a1.5 1.5 0 0 1 1-1.5Z" stroke="currentColor" stroke-width="1.4"/><path d="M14 3.5V8h4M9 12h6M9 15.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span><strong>Content not generated yet</strong><p>完成 Journey 1 的对应步骤后，内容会自动显示在这里。</p></div></article>';
      initHeaderMarquee(root);return;
    }
    root.innerHTML=chrome+'<div class="ea-article-scroll" tabindex="0" aria-label="Asset content">'+(state.history?'<div class="ea-room-changes"><strong>Version history</strong><p>v5 · Candidate · Oct 13, 2026, 15:10</p><p>v4 · Confirmed · Oct 12, 2026, 10:30</p></div>':'')+(kind==='planning'?planning():kind==='landscape'?status('Business Landscape')+landscape():kind==='canvas'?canvas():documents())+'</div></article>';
    initHeaderMarquee(root);
    var scroller=root.querySelector('.ea-article-scroll');
    var fixed=document.createElement('div');fixed.className='ea-fixed-chrome';
    scroller.querySelectorAll('.ea-room-tabs,.ea-room-status').forEach(function(row){fixed.appendChild(row);});
    var companyTitle=scroller.querySelector('.ea-company-title'),documentBody=scroller.querySelector('.ea-document-body');if(companyTitle&&documentBody){companyTitle.id='ea-profile-name';documentBody.insertBefore(companyTitle,documentBody.querySelector('.ea-profile-section'));}else if(companyTitle){companyTitle.remove();}
    if(kind==='landscape'){scroller.querySelectorAll('.ea-grid-card').forEach(function(card,i){card.id='ea-profile-land'+i;});var glossaryTitle=scroller.querySelector('.ea-visual-content>h3');if(glossaryTitle)glossaryTitle.id='ea-profile-land3';}
    var sectionNav=scroller.querySelector('.ea-section-nav');if(sectionNav){var navRow=document.createElement('div');navRow.className='ea-section-navigation';navRow.appendChild(sectionNav);fixed.appendChild(navRow);}
    scroller.parentNode.insertBefore(fixed,scroller);
    function sizeDocumentTail(){var body=scroller.querySelector('.ea-document-body,.ea-visual-content'),last=kind==='landscape'?scroller.querySelector('#ea-profile-land3'):scroller.querySelector('.ea-profile-section:last-child');if(body&&last)body.style.paddingBottom=Math.max(16,scroller.clientHeight-last.offsetHeight-16)+'px';}
    requestAnimationFrame(function(){sizeDocumentTail();positionSectionIndicator(root.querySelector('.ea-section-nav'));});
    if(typeof ResizeObserver!=='undefined'){if(root.documentTailObserver)root.documentTailObserver.disconnect();root.documentTailObserver=new ResizeObserver(function(){sizeDocumentTail();positionSectionIndicator(root.querySelector('.ea-section-nav'));});root.documentTailObserver.observe(scroller);}
    scroller.scrollTop=scrollTop;
  }
  function showSource(root,value,field){var overlay=document.createElement('div');overlay.className='ea-source-overlay';overlay.innerHTML='<button class="ea-source-mask" type="button" aria-label="Close sources"></button><section class="ea-source-drawer" role="dialog" aria-modal="true" aria-label="View Sources" tabindex="-1"><header><strong>View Sources</strong>'+button('×','data-ea-source-close aria-label="Close sources"')+'</header><div class="ea-source-body"><div class="ea-source-summary"><div><span>Content</span><p>'+esc(value)+'</p></div><div><span>Object</span><p>Enterprise Profile · v5</p></div></div><p class="ea-room-muted">Sources (6)</p>'+Array.from({length:6},function(){return '<article class="ea-source-card"><header><strong>Public Information Search</strong>'+pill('Public Information')+'</header><p class="ea-room-muted">Location: '+esc(field)+'</p><blockquote>'+(field==='Founded'?'Apple Computer Company was founded on April 1, 1976.':esc(value))+'</blockquote></article>';}).join('')+'</div></section>';
    root.appendChild(overlay);var frame=(root.closest('.fd-view')||root.closest('.main-body')).getBoundingClientRect();overlay.style.position='fixed';overlay.style.top=frame.top+'px';overlay.style.left=frame.left+'px';overlay.style.width=frame.width+'px';overlay.style.height=frame.height+'px';overlay.style.bottom='auto';overlay.style.right='auto';var previous=document.activeElement;var drawer=overlay.querySelector('[role="dialog"]');drawer.focus();function close(){overlay.remove();if(previous)previous.focus();}overlay.querySelector('.ea-source-mask').onclick=close;overlay.querySelector('[data-ea-source-close]').onclick=close;overlay.addEventListener('keydown',function(e){if(e.key==='Escape')close();if(e.key==='Tab'){var focusable=drawer.querySelectorAll('button');if(focusable.length){e.preventDefault();focusable[0].focus();}}});
  }
  function positionSectionIndicator(nav){
    if(!nav)return;var active=nav.querySelector('.is-active');if(!active)return;var indicator=nav.querySelector('.ea-section-indicator');if(!indicator){indicator=document.createElement('span');indicator.className='ea-section-indicator';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);}
    var left=active.offsetLeft,right=left+active.offsetWidth;if(left<nav.scrollLeft||right>nav.scrollLeft+nav.clientWidth){nav.scrollTo({left:Math.max(0,left-(nav.clientWidth-active.offsetWidth)/2),behavior:'smooth'});}
    indicator.style.width=active.offsetWidth+'px';indicator.style.height=active.offsetHeight+'px';indicator.style.transform='translate('+active.offsetLeft+'px,'+active.offsetTop+'px)';
  }
  function zoomCanvas(card,next,clientX,clientY){
    var viewport=card.querySelector('.ea-grid-image'),svg=viewport.querySelector('svg'),previous=Number(card.dataset.zoom||1),zoom=Math.max(.5,Math.min(3,next)),bounds=viewport.getBoundingClientRect(),x=clientX==null?viewport.clientWidth/2:clientX-bounds.left,y=clientY==null?viewport.clientHeight/2:clientY-bounds.top;
    var targetX=(viewport.scrollLeft+x)/previous*zoom-x,targetY=(viewport.scrollTop+y)/previous*zoom-y;
    card.dataset.zoom=zoom;svg.style.width=(viewport.clientWidth*zoom)+'px';svg.style.height=(viewport.clientHeight*zoom)+'px';svg.style.maxWidth='none';viewport.scrollLeft=targetX;viewport.scrollTop=targetY;
    card.querySelector('output').textContent=Math.round(zoom*100)+'%';card.querySelector('[data-ea-zoom="out"]').disabled=zoom<=.5;card.querySelector('[data-ea-zoom="in"]').disabled=zoom>=3;
  }
  function build(kind){var root=document.createElement('div');root.className='ea-room';roots[kind]=root;render(kind);
    var sectionScrollFrame=0;
    root.addEventListener('scroll',function(e){var viewport=e.target;if(!viewport.classList||!viewport.classList.contains('ea-article-scroll')||sectionScrollFrame)return;sectionScrollFrame=requestAnimationFrame(function(){sectionScrollFrame=0;var nav=root.querySelector('.ea-section-nav');if(!nav)return;var buttons=Array.from(nav.querySelectorAll('[data-ea-section]')),top=viewport.getBoundingClientRect().top+24,active=buttons[0];buttons.forEach(function(b){var section=root.querySelector('#ea-profile-'+b.dataset.eaSection);if(section&&section.getBoundingClientRect().top<=top)active=b;});buttons.forEach(function(b){b.classList.toggle('is-active',b===active);b.setAttribute('aria-pressed',String(b===active));});positionSectionIndicator(nav);});},true);
    var drag=null,ignoreNodeClick=false;
    root.addEventListener('pointerdown',function(e){var node=e.target.closest('[data-ea-flow]');if(!node||e.button!==0)return;var card=node.closest('.ea-grid-card'),key=node.dataset.eaFlow,index=Number(node.dataset.eaNode),svg=card.querySelector('svg'),rect=svg.getBoundingClientRect(),scale=Math.min(rect.width/1000,rect.height/430);if(!card.initialNodes)card.initialNodes=flows[key].nodes.map(function(n){return n.slice();});drag={card:card,key:key,index:index,x:e.clientX,y:e.clientY,startX:flows[key].nodes[index][2],startY:flows[key].nodes[index][3],scale:scale,moved:false};root.setPointerCapture(e.pointerId);e.preventDefault();});
    root.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<3)return;drag.moved=true;var node=flows[drag.key].nodes[drag.index];node[2]=Math.max(0,Math.min(800,drag.startX+dx/drag.scale));node[3]=Math.max(40,Math.min(354,drag.startY+dy/drag.scale));var svg=drag.card.querySelector('.ea-flow-svg'),style=svg.getAttribute('style');drag.card.querySelector('.ea-grid-image').innerHTML=flowDiagram(drag.key);if(style)drag.card.querySelector('svg').setAttribute('style',style);});
    function finishDrag(e){if(!drag)return;ignoreNodeClick=drag.moved;if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);drag=null;}
    root.addEventListener('pointerup',finishDrag);root.addEventListener('pointercancel',finishDrag);
root.addEventListener('wheel',function(e){var viewport=e.target.closest('.ea-grid-image');if(!viewport||!e.ctrlKey)return;e.preventDefault();e.stopPropagation();var card=viewport.closest('.ea-grid-card');zoomCanvas(card,Number(card.dataset.zoom||1)*Math.exp(-e.deltaY*.01),e.clientX,e.clientY);},{passive:false});root.addEventListener('change',function(e){
    var input=e.target;
    if(input.hasAttribute('data-ea-plan-app')){var section=input.closest('.ea-plan-application');section.querySelectorAll('[data-ea-plan-scenario]').forEach(function(c){c.checked=input.checked;planningSelection[c.dataset.eaPlanScenario]=c.checked;});}
    if(input.hasAttribute('data-ea-plan-scenario'))planningSelection[input.dataset.eaPlanScenario]=input.checked;
    if(input.matches('[data-ea-plan-app],[data-ea-plan-scenario]'))root.querySelectorAll('.ea-plan-application').forEach(function(section){var children=Array.from(section.querySelectorAll('[data-ea-plan-scenario]')),parent=section.querySelector('[data-ea-plan-app]'),count=children.filter(function(c){return c.checked;}).length;parent.checked=count===children.length;parent.indeterminate=count>0&&count<children.length;planningSelection[parent.dataset.eaPlanApp]=parent.checked;});
  });root.addEventListener('keydown',function(e){var step=e.target.closest('[data-ea-flow]');if(step&&(e.key==='Enter'||e.key===' ')){e.preventDefault();step.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}var tab=e.target.closest('[role="tab"]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();var all=Array.from(root.querySelectorAll('[role="tab"]')),i=all.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowLeft'?-1:1)+all.length)%all.length;all[next].click();root.querySelectorAll('[role="tab"]')[next].focus();});root.addEventListener('click',function(e){var step=e.target.closest('[data-ea-flow]');if(ignoreNodeClick){ignoreNodeClick=false;if(step)return;}if(step){var node=flows[step.dataset.eaFlow].nodes[Number(step.dataset.eaNode)];var card=step.closest('.ea-grid-card');card.querySelectorAll('.ea-flow-node').forEach(function(n){n.classList.toggle('is-selected',n===step);});card.querySelector('.ea-flow-detail').textContent=node[0]+' — '+node[1];return;}var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-ea-zoom')){var card=b.closest('.ea-grid-card'),zoom=Number(card.dataset.zoom||1),action=b.dataset.eaZoom;if(action==='reset'&&card.initialNodes){var key=card.querySelector('svg').dataset.flowKey;flows[key].nodes=card.initialNodes.map(function(n){return n.slice();});card.querySelector('.ea-grid-image').innerHTML=flowDiagram(key);}if(action==='reset'){var viewport=card.querySelector('.ea-grid-image');card.dataset.zoom=1;viewport.querySelector('svg').removeAttribute('style');viewport.scrollLeft=0;viewport.scrollTop=0;card.querySelector('output').textContent='100%';card.querySelectorAll('[data-ea-zoom]').forEach(function(control){control.disabled=false;});}else{zoomCanvas(card,Math.round((zoom+(action==='in'?.25:-.25))*100)/100);}return;}
    if(b.hasAttribute('data-ea-canvas-tab')){state.canvasTab=b.dataset.eaCanvasTab;render(kind);}
    if(b.hasAttribute('data-ea-docs-tab')){state.docsTab=b.dataset.eaDocsTab;render(kind);}
    if(b.hasAttribute('data-ea-section')){var section=root.querySelector('#ea-profile-'+b.dataset.eaSection),scroller=root.querySelector('.ea-article-scroll');if(section&&scroller){scroller.scrollTo({top:scroller.scrollTop+section.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16,behavior:'smooth'});}root.querySelectorAll('[data-ea-section]').forEach(function(x){x.classList.toggle('is-active',x===b);x.setAttribute('aria-pressed',String(x===b));});positionSectionIndicator(b.closest('.ea-section-nav'));}
    if(b.hasAttribute('data-ea-source'))showSource(root,b.dataset.eaSource,b.dataset.eaSourceField);
    if(b.hasAttribute('data-ea-content-lock')){var key=b.dataset.eaContentLock;assetLocks[key]=!assetLocks[key];b.setAttribute('aria-checked',String(assetLocks[key]));}
    if(b.hasAttribute('data-ea-plan-sync')){var chosen=planningApps().flatMap(function(app){return planningBiz(app).filter(function(item){return planningSelection[item.id]===true;});});var result=root.querySelector('.ea-plan-result');if(!chosen.length){result.textContent='Select at least one scenario to sync.';return;}try{localStorage.setItem('agentos-requirement-scenarios',JSON.stringify(chosen));result.textContent=chosen.length+' requirement scenarios saved locally.';}catch(error){result.textContent='Unable to save scenarios locally. Please try again.';}}
    if(b.hasAttribute('data-ea-history')){state.history=!state.history;render(kind);}
    if(b.hasAttribute('data-ea-changes')){state.changes=!state.changes;render(kind);}
    if(b.hasAttribute('data-ea-reviewed')){state.changes=false;render(kind);}
    if(b.hasAttribute('data-ea-wrap')){state.wrap=!state.wrap;render(kind);}
    if(b.hasAttribute('data-ea-copy')){var code=root.querySelector('code');var plain=Array.from(code.querySelectorAll('.ea-code-line')).map(function(x){return x.textContent.replace(/^\d+/,'');}).join('\n');navigator.clipboard.writeText(plain).then(function(){root.querySelector('[data-ea-copy-status]').textContent='Copied';}).catch(function(){root.querySelector('[data-ea-copy-status]').textContent='Select the code to copy it.';});}
    if(b.hasAttribute('data-ea-download')){var blob=new Blob([displayNames[kind]+'\n\n'+(kind==='canvas'?JSON.stringify(stories,null,2):root.innerText)],{type:'text/plain'});var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=displayNames[kind]+'.txt';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
  });return root;}
  if(FD) Object.keys(names).forEach(function(kind){FD.register({name:displayNames[kind],iconHtml:window.FileTypeIcons?window.FileTypeIcons.forName(displayNames[kind]):'',kind:'enterprise',folder:'Enterprise Assets',deliverable:true,updated:'2026-10-13',author:'Enterprise Planning',build:function(){return build(kind);}});});
  function open(kind){if(!names[kind])return;if(window.FastFiles)window.FastFiles.clearUpdated(displayNames[kind]);FD.open(displayNames[kind]);}
  function normalizeLimit(limit){return(limit==null||limit===''||limit<0)?null:Math.max(0,limit|0);}
  function refreshPlanningIfOpen(){if(roots.planning&&contentVisible.planning)render('planning');}
  window.EnterpriseAssets={open:open,setContentVisible:function(kind,visible){if(!names[kind])return;contentVisible[kind]=!!visible;if(visible&&window.FastFiles)window.FastFiles.markUpdated(displayNames[kind]);if(roots[kind])render(kind);},setPlanningAppLimit:function(limit,bizLimit){planningAppLimit=normalizeLimit(limit);if(arguments.length>1)planningBizLimit=normalizeLimit(bizLimit);else if(limit==null)planningBizLimit=null;if(limit==null)planningOverride=null;refreshPlanningIfOpen();},setPlanningBizLimit:function(limit){planningBizLimit=normalizeLimit(limit);refreshPlanningIfOpen();},setPlanningOverride:function(data){planningOverride=data||null;refreshPlanningIfOpen();},build:function(kind,context){
    state.canvasTab='To-Be Design';state.docsTab='Enterprise Profile';state.history=false;state.changes=false;
    names.canvas=context?context.title:'Scenario Definition Canvas';
    if(context){
      flows.tobe.label=context.title+' To-Be workflow';
      flows.tobe.nodes=context.steps.map(function(title,i){var col=i<4?i:7-i;return [title,i<4?'Supplier operations · '+context.scenario:'Review & follow-up · Sample step',30+240*col,i<4?75:300];});
      flows.tobe.edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]];
      stories=[{title:context.scenario+' — Primary workflow',steps:context.steps.map(function(step){return step+'. Record the outcome and pass the case to the next responsible owner.';})},{title:'Exception handling and review',steps:['Identify incomplete or inconsistent supplier information.','Route the case to the responsible reviewer with the supporting evidence.','Capture the decision and resume the approved workflow.']},{title:'Completion and follow-up',steps:['Publish the approved outcome to the supplier record.','Notify relevant sourcing and operations teams.','Track follow-up actions and maintain the audit trail.']}];
    }
    return build(kind);
  }};
  var entry=new URLSearchParams(location.search).get('asset');
  if(FD&&names[entry]){
    document.body.classList.add('enterprise-entry');
    if(window.FastFiles){Object.keys(names).forEach(function(k){window.FastFiles.addDeliverable('Enterprise Assets/'+names[k]);});window.FastFiles.showTab(true);}
    if(window.FastConversations)window.FastConversations.open('s3');
    open(entry);
  }
})();
