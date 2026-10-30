/* Data policy catalog and editor, local demo state. */
var policyState = { editing: null, creating: false, page: 1, size: 10 };
var policyDescriptions = ['Read-only access to customer records for sales assistants.','Search product manuals and service policies for support answers.','Access contract attachments and supplemental agreements.','View revenue and payment metrics for financial analysis.','Handle support tickets and processing records.','Access design files and API documentation for engineering.','Review outbound call recordings and quality annotations.','Read supplier profiles and procurement quotations.','Read employee policies and compliance guidelines.','Upload and review project delivery packages.','Read and update sales leads and follow-up records.','Search industry reports and competitive analysis.','Review purchase and sales invoice images.','Read organization structure and position records.','Write meeting notes and action items.'];
var policyCounts=[12,8,6,5,24,15,4,9,120,18,11,7,3,6,10];
var policyCatalog=spacePolicies.map(function(name,i){return {name:name,description:policyDescriptions[i],users:policyCounts[i],objects:spaceObjects[i].slice(),enabled:true,updated:'2026-08-'+String(12-i%12).padStart(2,'0')+' 14:20',source:'Customer Operations',selected:['Customers','Contacts'],filter:'All records',properties:'All properties'};});
function policyTabs(){return '<div class="si-tabs"><button type="button" data-si-tab="Data Policies" class="is-current">Data Policies</button><button type="button" data-si-tab="Permissions View">Permissions View</button></div>';}
function renderPolicyCatalog(){
  var q=spaceAdmin.query.toLowerCase(),filtered=policyCatalog.map(function(p,i){return {p:p,i:i};}).filter(function(x){return (x.p.name+' '+x.p.description+' '+x.p.objects.join(' ')).toLowerCase().includes(q);});
  var pages=Math.max(1,Math.ceil(filtered.length/policyState.size));policyState.page=Math.min(policyState.page,pages);
  var rows=filtered.slice((policyState.page-1)*policyState.size,policyState.page*policyState.size).map(function(x){var p=x.p,i=x.i;return '<tr><td><button class="si-button si-link" data-policy-edit="'+i+'">'+escapeHtmlModal(p.name)+'</button></td><td title="'+escapeHtmlModal(p.description)+'">'+escapeHtmlModal(p.description)+'</td><td>'+p.users+'</td><td>'+p.objects.map(function(o){return '<span class="si-tag">'+escapeHtmlModal(o)+'</span>';}).join(' ')+'</td><td class="dp-muted">'+p.objects.map(function(o){return '<span class="si-tag">'+escapeHtmlModal(o)+'</span>';}).join(' ')+'</td><td>'+p.updated+'</td><td><button type="button" role="switch" aria-checked="'+p.enabled+'" aria-label="Enable '+escapeHtmlModal(p.name)+'" class="dp-switch" data-policy-toggle="'+i+'"><span></span></button></td><td><button class="si-button si-link" data-policy-grant="'+i+'">Assign Data Policies</button><details class="dp-more"><summary>More</summary><div><button data-policy-edit="'+i+'">Edit</button><button class="si-danger" data-policy-delete="'+i+'">Delete</button></div></details></td></tr>';}).join('');
  return policyTabs()+'<section class="si-data-panel dp-catalog"><header class="si-toolbar"><label class="si-search"><input id="spaceSearch" type="search" aria-label="Search policies" placeholder="Search policy name or object type" value="'+escapeHtmlModal(spaceAdmin.query)+'">'+spaceIcon('search')+'</label><button class="si-button si-solid" data-policy-new>+ Create Data Policy</button></header><div class="si-table-wrap"><table><colgroup><col style="width:15%"><col style="width:17%"><col style="width:8%"><col style="width:19%"><col style="width:19%"><col style="width:12%"><col style="width:5%"><col style="width:160px"></colgroup><thead><tr>'+['Data Policy Name','Policy Description','Authorized Users','Data Objects in Ontology','Data Objects in Knowledge Base','Updated At','Enabled','Actions'].map(function(t){return '<th>'+t+'</th>';}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div><footer class="si-pagination"><span>0 items selected</span><span>'+filtered.length+' items in total</span><button data-policy-page="'+Math.max(1,policyState.page-1)+'" '+(policyState.page===1?'disabled':'')+'>‹</button>'+Array.from({length:pages},function(_,i){return '<button data-policy-page="'+(i+1)+'" class="'+(policyState.page===i+1?'is-current':'')+'">'+(i+1)+'</button>';}).join('')+'<button data-policy-page="'+Math.min(pages,policyState.page+1)+'" '+(policyState.page===pages?'disabled':'')+'>›</button><select data-policy-size aria-label="Policies per page">'+[10,20,50].map(function(n){return '<option '+(policyState.size===n?'selected':'')+'>'+n+' items per page</option>';}).join('')+'</select></footer></section>';
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-policy-toggle]');if(b){var p=policyCatalog[Number(b.dataset.policyToggle)];p.enabled=!p.enabled;renderSpaceAdmin();}
  b=e.target.closest('[data-policy-page]');if(b){policyState.page=Number(b.dataset.policyPage);renderSpaceAdmin();}
  b=e.target.closest('[data-policy-new], [data-policy-edit]');if(b){beginPolicy(b.hasAttribute('data-policy-edit')?Number(b.dataset.policyEdit):null);}
  b=e.target.closest('[data-policy-delete]');if(b&&confirm('Delete this data policy?')){var i=Number(b.dataset.policyDelete);policyCatalog.splice(i,1);spacePolicies.splice(i,1);spaceObjects.splice(i,1);renderSpaceAdmin();}
  b=e.target.closest('[data-policy-grant]');if(b)spaceDialog('grant-access',Number(b.dataset.policyGrant));
});
content.addEventListener('change',function(e){if(e.target.hasAttribute('data-policy-size')){policyState.size=parseInt(e.target.value,10);policyState.page=1;renderSpaceAdmin();}});
var policyDraft = null;
var policyPropertyNames = ['Name','Region','Tenant ID','Status','Created At','Warehouse ID','Address','City','Country','Capacity','Manager','Latitude','Longitude','Updated At','Type','Organization'];
var policyMenus = {};
function policyRule(scope, values) {
  return {kind:'rule',scope:scope||'Selected Authorized Ontology Object',relation:'',object:'',property:'',operator:'',values:values||[],value:''};
}
function policyGroup() { return {kind:'group',operator:'AND',children:[policyRule()]}; }
function policyExample() {
  return {name:'Supplier Data Access Isolation by Region',description:'',actions:['Read'],permissions:[{
    object:'Warehouse Location',properties:policyPropertyNames.slice(),filters:{kind:'group',operator:'AND',children:[
      policyRule(),policyRule(),
      {kind:'group',operator:'OR',children:[policyRule(null,['Tenant-01','Tenant-01']),policyRule('Related Objects (1 Hop)'),policyRule()]},
      policyRule(),policyRule('Related Objects (1 Hop)'),policyRule(),
      {kind:'group',operator:'OR',children:[policyRule(null,['Tenant-01','Tenant-01']),policyRule('Related Objects (1 Hop)'),policyRule('Related Objects (2 Hops)')]}
    ]}
  }]};
}
function beginPolicy(index) {
  if(typeof grantPolicyState!=='undefined')grantPolicyState.active=false;
  policyState.editing=index;policyState.creating=true;spaceAdmin.page='data';
  var p=index===null?null:policyCatalog[index];
  policyDraft=p?JSON.parse(JSON.stringify(p)):policyExample();
  if(!policyDraft.actions)policyDraft.actions=['Read'];
  if(!policyDraft.permissions)policyDraft.permissions=policyExample().permissions;
  policyMenus=index===null?{'0:4:scope':true,'0:6:add':true}:{};
  renderSpaceAdmin();
  if(index===null&&location.hash!=='#admin/data/new')history.pushState(null,'','#admin/data/new');
}
function policyOptions(values,current) { return values.map(function(x){return '<option '+(x===current?'selected':'')+'>'+escapeHtmlModal(x)+'</option>';}).join(''); }
function ruleAt(permission,path) { var item=policyDraft.permissions[permission].filters;if(path)path.split('.').forEach(function(i){item=item.children[Number(i)];});return item; }
function policyAttrs(permission,path) {return ' data-permission="'+permission+'" data-path="'+path+'"';}
function policyMenuKey(permission,path,field) {return permission+':'+path+':'+field;}
function policyDisplayLabel(value) {return value;}
function policySelect(field,label,choices,current,permission,path,extra) {
  var key=policyMenuKey(permission,path,field),attrs=policyAttrs(permission,path);
  return '<div class="dp-select '+(current?'':'is-placeholder')+' '+(extra||'')+'"><button type="button" class="dp-select-trigger" data-policy-menu="'+key+'" aria-label="'+label+'" aria-haspopup="listbox" aria-expanded="'+!!policyMenus[key]+'"><span>'+escapeHtmlModal(policyDisplayLabel(current||label))+'</span>'+spaceIcon('policy-chevron')+'</button>'+(policyMenus[key]?'<div class="dp-choice-menu" role="listbox" aria-label="'+label+'">'+choices.map(function(choice){return '<button type="button" role="option" aria-selected="'+(choice===current)+'" data-policy-choice="'+field+'" data-value="'+escapeHtmlModal(choice)+'"'+attrs+'>'+escapeHtmlModal(policyDisplayLabel(choice))+'</button>';}).join('')+'</div>':'')+'</div>';
}
function renderPolicyFilter(node,permission,path) {
  var attrs=policyAttrs(permission,path);
  if(node.kind==='group') {
    var key=policyMenuKey(permission,path,'add');
    return '<div class="dp-condition-group '+(path?'is-nested':'is-root')+'"><div class="dp-condition-logic">'+policySelect('operator','Condition logic',['AND','OR'],node.operator,permission,path)+'</div><div class="dp-condition-children">'+node.children.map(function(child,i){return renderPolicyFilter(child,permission,path?path+'.'+i:String(i));}).join('')+'<div class="dp-add-control"><button type="button" class="dp-add-trigger '+(policyMenus[key]?'is-expanded':'')+'" data-policy-menu="'+key+'" aria-haspopup="menu" aria-expanded="'+!!policyMenus[key]+'">Add Filter'+spaceIcon('policy-add-chevron')+'</button>'+(policyMenus[key]?'<div class="dp-choice-menu dp-add-menu" role="menu"><button type="button" role="menuitem" data-filter-add="rule"'+attrs+'>Add Filter</button><button type="button" role="menuitem" data-filter-add="group"'+attrs+'>Add Subcondition</button></div>':'')+'</div></div>'+(path?'<button type="button" class="dp-condition-delete" aria-label="Remove subcondition" data-filter-remove'+attrs+'>'+spaceIcon('policy-close')+'</button>':'')+'</div>';
  }
  var related=node.scope!=='Selected Authorized Ontology Object',twoHops=node.scope==='Related Objects (2 Hops)';
  var values=node.values||((node.value||'').split(';').filter(Boolean));
  var objectFields=related?policySelect('object','Selected Authorized Object',['Warehouse Location','Customers','Contacts','Suppliers','Orders'],node.object,permission,path,'dp-related-object')+(twoHops?policySelect('relation','Select relationship',['Located In','Owned By','Assigned To'],node.relation,permission,path,'dp-related-relation'):''):'';
  return '<div class="dp-rule-row '+(related?'is-related':'')+' '+(twoHops?'is-two-hops':'')+'">'+policySelect('scope','Object scope',['Selected Authorized Ontology Object','Related Objects (1 Hop)','Related Objects (2 Hops)'],node.scope,permission,path,'dp-rule-scope')+objectFields+policySelect('property','Select a property',policyPropertyNames,node.property,permission,path,'dp-rule-property')+policySelect('operator','Select an operator',['Equals','Not equal to','Contains','In','Is not empty'],node.operator,permission,path,'dp-rule-operator')+'<div class="dp-tag-input '+(values.length?'is-populated':'')+'" data-tag-container'+attrs+'>'+values.map(function(value,i){return '<span class="dp-value-tag">'+escapeHtmlModal(value)+'<button type="button" aria-label="Remove '+escapeHtmlModal(value)+'" data-value-remove="'+i+'"'+attrs+'>'+spaceIcon('policy-chip-close')+'</button></span>';}).join('')+'<input aria-label="Filter values" value="'+escapeHtmlModal(node.pendingValue||'')+'" placeholder="'+(values.length?'':'Enter values and press Enter or “;” to separate')+'" data-policy-tag'+attrs+'></div><button type="button" class="dp-rule-delete" aria-label="Remove filter" data-filter-remove'+attrs+'>'+spaceIcon('policy-close')+'</button></div>';
}
function renderPolicyEditor() {
  if(!policyDraft)policyDraft=policyExample();
  document.getElementById('mainTopLabel').innerHTML='<span class="si-breadcrumb">Organization Management'+spaceIcon('slash')+'<button type="button" data-policy-cancel>Data Management</button>'+spaceIcon('slash')+'<strong>'+(policyState.editing===null?'Create':'Edit')+' Data Permission</strong></span>';
  return '<form id="policyEditor" class="dp-editor dp-figma-editor"><header class="dp-editor-header"><h1>'+(policyState.editing===null?'Create':'Edit')+' Data Policy</h1><div><button type="button" class="si-button dp-outline" data-policy-cancel>Cancel</button><button type="submit" class="si-button si-solid">Save</button></div></header><div class="dp-editor-body"><h2>Policy Details</h2><div class="dp-details"><label><span><em>*</em> Data Policy Name</span><input name="policyName" required maxlength="100" value="'+escapeHtmlModal(policyDraft.name)+'"></label><fieldset><legend><em>*</em> Actions</legend>'+['Read','Write','Delete'].map(function(a){return '<label class="dp-check"><input type="checkbox" name="policyAction" value="'+a+'" '+(policyDraft.actions.includes(a)?'checked':'')+' '+(a==='Read'?'disabled':'')+'><span>'+a+'</span></label>';}).join('')+'</fieldset><label class="dp-description"><span>Description</span><textarea name="policyDescription" maxlength="150" placeholder="Briefly describe this policy">'+escapeHtmlModal(policyDraft.description)+'</textarea><span id="policyDescriptionCount">'+policyDraft.description.length+'/150</span></label></div><div class="dp-section-title"><h2>Data Permissions</h2><button type="button" class="si-button si-link" data-permission-add>'+spaceIcon('policy-plus')+'Add Data Permission</button></div>'+policyDraft.permissions.map(function(p,i){return '<section class="dp-permission"><header><h2>Data Permission '+(i+1)+'</h2><button type="button" class="si-button si-danger" data-permission-delete="'+i+'">Delete</button></header><div class="dp-scope-section"><h2>Data Scope</h2><div class="dp-scope"><label><span><em>*</em> Data Type</span><select disabled><option>Ontology</option></select></label><div class="dp-object-field"><span><em>*</em> Authorized Ontology Object</span><div class="dp-object-control"><select aria-label="Authorized Ontology Object" data-permission-object="'+i+'">'+policyOptions(['Warehouse Location','Customers','Contacts','Suppliers','Orders','Products'],p.object)+'</select><details class="dp-properties"><summary><span>'+p.properties.length+' properties</span>'+spaceIcon('policy-chevron')+'</summary><div class="dp-property-menu">'+policyPropertyNames.map(function(x){return '<label class="dp-check"><input type="checkbox" data-permission-property="'+i+'" value="'+x+'" '+(p.properties.includes(x)||p.properties.includes('All properties')?'checked':'')+'>'+x+'</label>';}).join('')+'</div></details></div></div></div></div><h2 class="dp-filters-title">Data Filters</h2><div class="dp-filter-box">'+renderPolicyFilter(p.filters,i,'')+'</div></section>';}).join('')+'<p id="policyFormError" class="si-danger" role="alert"></p></div></form>';
}
function policyRerender() {var body=document.querySelector('.main-body'),top=body.scrollTop;renderSpaceAdmin();body.scrollTop=top;}
function closePolicyEditor() {policyState.creating=false;policyDraft=null;policyMenus={};spaceAdmin.dataTab='Data Policies';history.replaceState(null,'','#admin/data');renderSpaceAdmin();}
document.addEventListener('click',function(e) {
  if(!policyState.creating)return;
  if(e.target.closest('[data-policy-new], [data-policy-edit]'))return;
  if(e.target.closest('[data-policy-cancel]')){closePolicyEditor();return;}
  if(e.target.closest('[data-permission-add]')){policyDraft.permissions.push({object:'Warehouse Location',properties:policyPropertyNames.slice(),filters:policyGroup()});policyRerender();return;}
  var b=e.target.closest('[data-policy-menu]');
  if(b){var key=b.dataset.policyMenu;policyMenus[key]=!policyMenus[key];policyRerender();return;}
  b=e.target.closest('[data-policy-choice]');
  if(b){ruleAt(Number(b.dataset.permission),b.dataset.path)[b.dataset.policyChoice]=b.dataset.value;delete policyMenus[policyMenuKey(b.dataset.permission,b.dataset.path,b.dataset.policyChoice)];policyRerender();return;}
  b=e.target.closest('[data-permission-delete]');if(b){policyDraft.permissions.splice(Number(b.dataset.permissionDelete),1);policyMenus={};policyRerender();return;}
  b=e.target.closest('[data-filter-add]');if(b){ruleAt(Number(b.dataset.permission),b.dataset.path).children.push(b.dataset.filterAdd==='group'?policyGroup():policyRule());policyMenus={};policyRerender();return;}
  b=e.target.closest('[data-filter-remove]');if(b){var path=b.dataset.path.split('.'),index=Number(path.pop());ruleAt(Number(b.dataset.permission),path.join('.')).children.splice(index,1);policyMenus={};policyRerender();return;}
  b=e.target.closest('[data-value-remove]');if(b){var node=ruleAt(Number(b.dataset.permission),b.dataset.path);node.values.splice(Number(b.dataset.valueRemove),1);node.value=node.values.join(';');policyRerender();return;}
  if(!e.target.closest('.dp-choice-menu')){if(Object.keys(policyMenus).some(function(k){return policyMenus[k];})){policyMenus={};document.querySelectorAll('.dp-choice-menu').forEach(function(menu){menu.remove();});document.querySelectorAll('[data-policy-menu]').forEach(function(trigger){trigger.setAttribute('aria-expanded','false');trigger.classList.remove('is-expanded');});}}
});
function commitPolicyTags(input) {
  var parts=input.value.split(/[;；\n]/).map(function(v){return v.trim();}).filter(Boolean);if(!parts.length)return;
  var node=ruleAt(Number(input.dataset.permission),input.dataset.path);node.values=(node.values||[]).concat(parts);node.value=node.values.join(';');node.pendingValue='';
  var permission=input.dataset.permission,path=input.dataset.path;policyRerender();
  var next=content.querySelector('[data-policy-tag][data-permission="'+permission+'"][data-path="'+path+'"]');if(next)next.focus();
}
content.addEventListener('keydown',function(e) {
  if(e.target.hasAttribute('data-policy-tag')&&(e.key==='Enter'||e.key===';'||e.key==='；')){e.preventDefault();commitPolicyTags(e.target);}
  if(e.key==='Escape'){policyMenus={};if(policyState.creating)policyRerender();}
});
content.addEventListener('input',function(e) {
  if(!policyDraft)return;
  if(e.target.hasAttribute('data-policy-tag'))ruleAt(Number(e.target.dataset.permission),e.target.dataset.path).pendingValue=e.target.value;
  if(e.target.name==='policyName')policyDraft.name=e.target.value;
  if(e.target.name==='policyDescription'){policyDraft.description=e.target.value;document.getElementById('policyDescriptionCount').textContent=e.target.value.length+'/150';}
});
content.addEventListener('change',function(e) {
  if(!policyDraft)return;
  if(e.target.name==='policyAction')policyDraft.actions=['Read'].concat(Array.from(content.querySelectorAll('[name="policyAction"]:checked')).map(function(x){return x.value;}).filter(function(x){return x!=='Read';}));
  if(e.target.hasAttribute('data-permission-object'))policyDraft.permissions[Number(e.target.dataset.permissionObject)].object=e.target.value;
  if(e.target.hasAttribute('data-permission-property')){var permission=e.target.dataset.permissionProperty,p=policyDraft.permissions[Number(permission)];p.properties=Array.from(content.querySelectorAll('[data-permission-property="'+permission+'"]:checked')).map(function(x){return x.value;});var count=e.target.closest('details').querySelector('summary span');count.textContent=p.properties.length+' properties';}
});
content.addEventListener('submit',function(e) {
  if(e.target.id!=='policyEditor')return;e.preventDefault();
  content.querySelectorAll('[data-policy-tag]').forEach(function(input){var node=ruleAt(Number(input.dataset.permission),input.dataset.path);var parts=input.value.split(/[;；\n]/).map(function(v){return v.trim();}).filter(Boolean);node.values=(node.values||[]).concat(parts);node.value=node.values.join(';');delete node.pendingValue;});
  if(!policyDraft.name.trim()||!policyDraft.permissions.length||policyDraft.permissions.some(function(p){return !p.properties.length;})){document.getElementById('policyFormError').textContent='Enter a policy name and add at least one data permission with selected properties.';return;}
  var p=JSON.parse(JSON.stringify(policyDraft));p.name=p.name.trim();p.objects=p.permissions.map(function(x){return x.object;});p.enabled=true;p.users=p.users||0;p.updated=new Date().toISOString().slice(0,16).replace('T',' ');
  if(policyState.editing===null){policyCatalog.unshift(p);spacePolicies.unshift(p.name);spaceObjects.unshift(p.objects);}else{var i=policyState.editing;policyCatalog[i]=p;spacePolicies[i]=p.name;spaceObjects[i]=p.objects;}
  spaceAdmin.query='';policyState.page=1;closePolicyEditor();
});
