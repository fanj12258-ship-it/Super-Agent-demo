/* Grant data policies: local demo only, matching Figma 1084:100768. */
var grantPolicyState={active:false,tab:'User',query:'',targetQuery:'',sourcePage:1,targetPage:1,policies:[],pending:[],selected:[],policyMenu:false,error:''};
var grantPolicyRecords=[];
var grantPolicySubjects={
  'User':['Zhang Weimin','Li Jiayi','Wang Haoran','Zhao Yutong','Chen Siyuan','Liu Zixuan','Zhou Xinyi','Wu Junjie','Zheng Yaqi','Sun Mingxuan','Ma Xiaowen','Huang Zhiqiang'],
  'Role':['Sales Manager','Customer Support Lead','Legal Specialist','Financial Analyst','R&D Engineer'],
  'Department':['Legal & Compliance','East China Sales','Customer Success','Finance Shared Services','Platform Engineering']
};
function grantSubject(key){var parts=key.split(':');return {key:key,type:parts[0],name:grantPolicySubjects[parts[0]][Number(parts[1])]};}
function grantPolicyLabel(index){return index===0||index===1?'Customer Ontology Read-Only Policy':policyCatalog[index].name;}
function beginGrantPolicy(index){
  policyState.creating=false;grantPolicyState={active:true,tab:'User',query:'',targetQuery:'',sourcePage:1,targetPage:1,policies:Number.isInteger(index)&&policyCatalog[index]?[index]:[0,1].filter(function(i){return !!policyCatalog[i];}),pending:['User:0','User:2','User:3'],selected:['User:0','Role:0','Department:0'],policyMenu:false,error:''};
  spaceAdmin.page='data';openSpaceAdmin();var all=document.getElementById('grantSelectAll');if(all)all.indeterminate=true;
  if(location.hash!=='#admin/data/grant')history.pushState(null,'','#admin/data/grant');
}
function grantFooter(side,total){var page=side==='source'?grantPolicyState.sourcePage:grantPolicyState.targetPage,pages=Math.max(1,Math.ceil(total/12));return '<footer class="gp-pagination"><button type="button" aria-label="Previous page" data-grant-page="'+side+':'+(page-1)+'" '+(page<=1?'disabled':'')+'>'+spaceIcon('grant-left')+'</button><span class="gp-page-number">'+page+'</span><span>/</span><span class="gp-page-number">'+pages+'</span><button type="button" aria-label="Next page" data-grant-page="'+side+':'+(page+1)+'" '+(page>=pages?'disabled':'')+'>'+spaceIcon('grant-right')+'</button></footer>';}
function grantSearch(side){return '<label class="gp-search"><input type="search" data-grant-search="'+side+'" aria-label="'+(side==='source'?'Search available assignees':'Search selected assignees')+'" placeholder="'+(side==='source'?'Search by username, phone, or email':'Search selected assignees')+'" value="'+escapeHtmlModal(side==='source'?grantPolicyState.query:grantPolicyState.targetQuery)+'">'+spaceIcon('search')+'</label>';}
function grantSourceItems(){return grantPolicySubjects[grantPolicyState.tab].map(function(name,i){return {key:grantPolicyState.tab+':'+i,name:name};}).filter(function(item){return item.name.toLowerCase().includes(grantPolicyState.query.trim().toLowerCase());});}
function renderGrantPolicy(){
  document.getElementById('mainTopLabel').innerHTML='<span class="si-breadcrumb">Organization Management'+spaceIcon('slash')+'<button type="button" data-grant-cancel>Data Management</button>'+spaceIcon('slash')+'<strong>Assign Data Policies</strong></span>';
  var g=grantPolicyState,source=grantSourceItems(),targets=g.selected.map(grantSubject).filter(function(item){return (item.name+item.type).toLowerCase().includes(g.targetQuery.trim().toLowerCase());});
  var sourceRows=source.slice((g.sourcePage-1)*12,g.sourcePage*12).map(function(item){return '<label class="gp-source-item"><input type="checkbox" data-grant-subject="'+item.key+'" '+(g.pending.includes(item.key)?'checked':'')+'><span>'+item.name+'</span></label>';}).join('');
  var targetRows=targets.slice((g.targetPage-1)*12,g.targetPage*12).map(function(item){return '<div class="gp-target-item"><span>'+item.name+(item.type==='User'?'':'<span class="gp-subject-meta"> ('+item.type+' · 10 authorized users)</span>')+'</span><button type="button" aria-label="Remove '+item.name+'" data-grant-remove="'+item.key+'">'+spaceIcon('grant-target-close')+'</button></div>';}).join('');
  return '<form id="grantPolicyForm" class="gp-form"><header class="gp-header"><h1>Assign Data Policies</h1><div><button type="button" class="si-button dp-outline" data-grant-cancel>Cancel</button><button type="submit" class="si-button si-solid">Assign</button></div></header><div class="gp-body"><div class="gp-policy-field"><label id="grantPolicyLabel"><em>*</em> Assign Data Policies</label><div class="gp-policy-picker"><div class="gp-policy-tags">'+g.policies.map(function(index,i){return '<span class="gp-policy-tag">'+escapeHtmlModal(grantPolicyLabel(index))+'<button type="button" aria-label="Remove policy" data-grant-policy-remove="'+i+'">'+spaceIcon('grant-remove')+'</button></span>';}).join('')+'</div><button type="button" aria-labelledby="grantPolicyLabel" aria-expanded="'+g.policyMenu+'" data-grant-policy-menu>'+spaceIcon('grant-selector')+'</button>'+(g.policyMenu?'<div class="gp-policy-menu">'+policyCatalog.map(function(p,i){return '<label><input type="checkbox" data-grant-policy-option="'+i+'" '+(g.policies.includes(i)?'checked':'')+'>'+escapeHtmlModal(grantPolicyLabel(i))+'</label>';}).join('')+'</div>':'')+'</div></div><label class="gp-subject-label"><em>*</em> Assign to Users, Roles, or Departments</label><div class="gp-transfer"><section class="gp-transfer-panel" aria-label="Available Assignees"><header><label><input type="checkbox" id="grantSelectAll" data-grant-all '+(source.length&&source.every(function(i){return g.pending.includes(i.key);})?'checked':'')+'><strong>Available Assignees</strong></label><span>'+g.pending.length+'/5</span></header><div class="gp-source-tools"><div class="gp-segment" role="group" aria-label="Assignee type">'+['User','Role','Department'].map(function(tab){return '<button type="button" data-grant-tab="'+tab+'" aria-pressed="'+(g.tab===tab)+'" class="'+(g.tab===tab?'is-current':'')+'">'+({User:'Users',Role:'Roles',Department:'Departments'}[tab])+'</button>';}).join('')+'</div>'+grantSearch('source')+'</div><div class="gp-list">'+(sourceRows||'<p class="gp-empty">No matching results</p>')+'</div>'+grantFooter('source',source.length)+'</section><button type="button" class="gp-transfer-button" aria-label="Add checked assignees" data-grant-transfer '+(!g.pending.length?'disabled':'')+'>'+spaceIcon('grant-right')+'</button><section class="gp-transfer-panel" aria-label="Selected Assignees"><header><strong>Selected Assignees</strong><button type="button" aria-label="Clear selected assignees" data-grant-clear>'+spaceIcon('grant-clear')+'</button></header><div class="gp-target-tools">'+grantSearch('target')+'</div><div class="gp-list">'+(targetRows||'<p class="gp-empty">No assignees selected</p>')+'</div>'+grantFooter('target',targets.length)+'</section></div><p class="gp-error" role="alert">'+g.error+'</p></div></form>';
}
function refreshGrantPolicy(){renderSpaceAdmin();var all=document.getElementById('grantSelectAll');if(all){var source=grantSourceItems(),count=source.filter(function(i){return grantPolicyState.pending.includes(i.key);}).length;all.indeterminate=count>0&&count<source.length;}}
function closeGrantPolicy(){grantPolicyState.active=false;spaceAdmin.page='data';spaceAdmin.dataTab='Permissions View';history.replaceState(null,'','#admin/data');renderSpaceAdmin();}
document.addEventListener('click',function(e){
  if(!grantPolicyState.active)return;var g=grantPolicyState,b;
  if(e.target.closest('[data-grant-cancel]')){closeGrantPolicy();return;}
  b=e.target.closest('[data-grant-tab]');if(b){g.tab=b.dataset.grantTab;g.query='';g.sourcePage=1;refreshGrantPolicy();return;}
  b=e.target.closest('[data-grant-policy-menu]');if(b){g.policyMenu=!g.policyMenu;refreshGrantPolicy();return;}
  b=e.target.closest('[data-grant-policy-remove]');if(b){g.policies.splice(Number(b.dataset.grantPolicyRemove),1);refreshGrantPolicy();return;}
  if(e.target.closest('[data-grant-transfer]')){g.selected=Array.from(new Set(g.selected.concat(g.pending)));g.pending=[];g.error='';refreshGrantPolicy();return;}
  if(e.target.closest('[data-grant-clear]')){g.selected=[];g.targetPage=1;refreshGrantPolicy();return;}
  b=e.target.closest('[data-grant-remove]');if(b){g.selected=g.selected.filter(function(key){return key!==b.dataset.grantRemove;});g.targetPage=1;refreshGrantPolicy();return;}
  b=e.target.closest('[data-grant-page]');if(b){var parts=b.dataset.grantPage.split(':');g[parts[0]+'Page']=Math.max(1,Number(parts[1]));refreshGrantPolicy();}
});
content.addEventListener('change',function(e){
  if(!grantPolicyState.active)return;var g=grantPolicyState,t=e.target;
  if(t.hasAttribute('data-grant-subject')){g.error='';if(t.checked&&!g.pending.includes(t.dataset.grantSubject)){if(g.pending.length<5)g.pending.push(t.dataset.grantSubject);else g.error='Select up to 5 assignees at a time.';}else g.pending=g.pending.filter(function(key){return key!==t.dataset.grantSubject;});refreshGrantPolicy();}
  if(t.hasAttribute('data-grant-all')){var keys=grantSourceItems().map(function(i){return i.key;});g.pending=t.checked?Array.from(new Set(g.pending.concat(keys))).slice(0,5):g.pending.filter(function(key){return !keys.includes(key);});g.error='';refreshGrantPolicy();}
  if(t.hasAttribute('data-grant-policy-option')){var index=Number(t.dataset.grantPolicyOption);g.policies=t.checked?Array.from(new Set(g.policies.concat(index))):g.policies.filter(function(i){return i!==index;});refreshGrantPolicy();}
});
content.addEventListener('input',function(e){
  if(!grantPolicyState.active||!e.target.hasAttribute('data-grant-search'))return;var side=e.target.dataset.grantSearch,pos=e.target.selectionStart;
  grantPolicyState[side==='source'?'query':'targetQuery']=e.target.value;grantPolicyState[side+'Page']=1;refreshGrantPolicy();var next=content.querySelector('[data-grant-search="'+side+'"]');next.focus();try{next.setSelectionRange(pos,pos);}catch(_){}
});
content.addEventListener('submit',function(e){
  if(e.target.id!=='grantPolicyForm')return;e.preventDefault();var g=grantPolicyState;
  if(!g.policies.length||!g.selected.length){g.error='Select at least one data policy and one assignee.';refreshGrantPolicy();return;}
  g.policies.forEach(function(index){spaceRevoked[index]=false;});
  grantPolicyRecords.push({policies:g.policies.slice(),subjects:g.selected.map(grantSubject),createdAt:new Date().toISOString()});
  closeGrantPolicy();
});
