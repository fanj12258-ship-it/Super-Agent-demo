/* Space invite management views. All mutations are local demo state. */
var spaceAdmin = { page: 'members', query: '', dataTab: 'Data Policies', subTab: 'Users View' };
var spaceMembers = [
  ['Jamie Walker','Jamie Walker@inspiregroup.com','Enterprise Admin','#1f82eb'],
  ['Jordan Carter','jordan.carter@inspiregroup.com','Business Analyst','#1febeb'],
  ['William Parker','william.parker@inspiregroup.com','Designer','#eba71f'],
  ['Amy Liu','Amy Liu@inspiregroup.com','Engineer','#741feb'],
  ['Sam Wilson','Sam Wilson@inspiregroup.com','Engineer','#1f82eb']
];
var spaceRoles = ['Enterprise Admin','Customer Support Lead','Role 3','Role 4','Role 5'];
var spacePolicies = ['Customer Ontology: Read Only','Knowledge Base Q&A','Contract Attachment Access','Financial Metrics Dashboard','Ticket Handling','R&D Documents','Outbound Call Recordings','Supplier Master Data','Internal Policy Library','Project Deliverables','Lead Pool: Read & Write','Industry Report Library','Invoice Images','Organization Structure','Meeting Notes Library'];
var spaceObjects = [['Customers','Contacts','+3'],['Product Manuals','Service Policies','+2'],['Contract PDFs','Supplemental Agreements','+1'],['Revenue','Payments Received','+4'],['Tickets','Processing Records','+2'],['Design Files','API Documentation','+5'],['Outbound Call Recordings','Quality Annotations','+10'],['Suppliers','Quotations','+2'],['HR Policies','Compliance Guidelines','+3'],['Delivery Packages','Acceptance Forms','+6'],['Leads','Follow-up Records','+1'],['Industry Reports','Competitive Analysis','+2'],['Purchase Invoices','Sales Invoices','+10'],['Organizations','Positions','+2'],['Meeting Notes','Action Items','+4']];
var spaceUsers = ['James Miller','Olivia Taylor','Noah Anderson','Emma Wilson','Lucas Brown','Sophia Davis','Charlotte Moore','Ethan Clark','Amelia Thomas'];
var spaceUserRoles = ['Sales Manager','Customer Support Lead','Legal Specialist','Financial Analyst','Frontline Support','R&D Engineer','Quality Inspector','Procurement Manager','HRBP'];
var spaceDepartments = ['East China Sales','Customer Success','Legal & Compliance','Finance Shared Services','Technical Support','Platform Engineering','Quality Operations','Supply Chain','Human Resources'];
var spaceRevoked = {};
function spaceIcon(name) { return '<img class="si-icon" src="assets/space-invite/' + name + '.svg" alt="">'; }
function spaceButton(label, action, cls) { return '<button type="button" class="si-button '+(cls||'')+'" data-si-action="'+action+'">'+label+'</button>'; }
function spaceNav() {
  var groups = [['FED Member Management','members',[['members','FDE Members']]],['Enterprise Organization Management','organization',[['enterprise','Enterprise Admin']]],['Organization Management','organization',[['member-management','Member Management'],['roles','Role Management'],['permissions','Permission Management'],['data','Data Management'],['security','Security Management'],['isolation','Isolation Fields']]]];
  return '<nav class="si-nav" aria-label="Space management">'+groups.map(function(g){return '<details open><summary>'+spaceIcon(g[1])+'<span>'+g[0]+'</span><span>⌃</span></summary>'+g[2].map(function(p){var enabled=['members','roles','data'].includes(p[0]);return '<button type="button" '+(enabled?'data-si-page="'+p[0]+'"':'disabled title="Not included in this demo"')+' class="'+(spaceAdmin.page===p[0]?'is-current':'')+'">'+p[1]+'</button>';}).join('')+'</details>';}).join('')+'<button class="si-return" type="button" data-si-exit>← Back to Workbench</button></nav>';
}
function openSpaceAdmin() {
  closeAcct();
  document.body.classList.add('space-admin');
  var nav=document.getElementById('spaceAdminNav');
  if(!nav){nav=document.createElement('div');nav.id='spaceAdminNav';document.querySelector('.sidebar').insertBefore(nav,document.querySelector('.sb-head'));}
  renderSpaceAdmin();
}
function renderSpaceAdmin() {
  document.getElementById('spaceAdminNav').innerHTML=spaceNav();
  var main=document.querySelector('main.main');main.classList.remove('has-hero','is-market','is-ontology-detail','is-ops');
  document.getElementById('mainTitle').hidden=true;document.getElementById('mainDesc').hidden=true;
  var title=spaceAdmin.page==='members'?'FDE Members':spaceAdmin.page==='roles'?'Role Management':'Data Management';
  document.getElementById('mainTopLabel').innerHTML='<span class="si-breadcrumb">'+(spaceAdmin.page==='members'?'FDE Member Management':'Organization Management')+' / <strong>'+title+'</strong></span>';
  var search='<label class="si-search"><input id="spaceSearch" type="search" aria-label="Search '+title+'" placeholder="'+(spaceAdmin.page==='members'?'Search by name, phone or email':spaceAdmin.page==='roles'?'Search by role name':'Search users, roles, or departments')+'" value="'+escapeHtmlModal(spaceAdmin.query)+'">'+spaceIcon('search')+'</label>';
  if(spaceAdmin.page==='data'){content.innerHTML=renderSpaceData(search);return;}
  var isMembers=spaceAdmin.page==='members';
  var rows=isMembers?spaceMembers.map(function(m,i){if(!m.join(' ').toLowerCase().includes(spaceAdmin.query.toLowerCase()))return '';return '<div class="si-row"><span class="si-avatar" style="background:'+m[3]+'">'+escapeHtmlModal(m[0][0])+'</span><div class="si-person"><strong>'+escapeHtmlModal(m[0])+'</strong><span>'+escapeHtmlModal(m[1])+'</span></div><select aria-label="Role for '+escapeHtmlModal(m[0])+'" data-si-member="'+i+'">'+Array.from(new Set([m[2]].concat(spaceRoles,['Business Analyst','Designer','Engineer']))).map(function(r){return '<option '+(r===m[2]?'selected':'')+'>'+escapeHtmlModal(r)+'</option>';}).join('')+'</select></div>';}).join(''):spaceRoles.map(function(r,i){if(!r.toLowerCase().includes(spaceAdmin.query.toLowerCase()))return '';return '<div class="si-row si-role-row">'+spaceIcon('user')+'<strong>'+escapeHtmlModal(r)+'</strong><div class="si-row-actions">'+spaceButton('Edit','edit-role:'+i,'si-link')+spaceButton('Delete','delete-role:'+i,'si-danger')+'</div></div>';}).join('');
  content.innerHTML='<section class="si-panel"><header class="si-toolbar"><div>'+(isMembers?'Member List':'Role List')+' <span class="si-count">'+(isMembers?spaceMembers.length:spaceRoles.length)+' members</span></div><div class="si-tools">'+search+spaceButton(isMembers?'+ Invite Member':'+ Create Role',isMembers?'invite':'create-role','si-solid')+'</div></header><div class="si-list">'+(rows||'<p class="si-empty">No matching results</p>')+'</div></section>';
}
function renderSpaceData(search){
  if(policyState.creating)return renderPolicyEditor();
  if(spaceAdmin.dataTab==='Data Policies')return renderPolicyCatalog();
  var rows=spacePolicies.map(function(p,i){var u=Math.min(i,8);if(!(p+' '+spaceUsers[u]+' '+spaceUserRoles[u]+' '+spaceDepartments[u]).toLowerCase().includes(spaceAdmin.query.toLowerCase()))return '';return '<tr><td><a>'+spaceUsers[u]+'</a></td><td><a>'+spaceUserRoles[u]+'</a></td><td>'+spaceDepartments[u]+'</td><td><a>'+p+'</a></td><td>'+(i===0?'Role':i===1?'Department':'User')+'</td><td class="si-object-cell">'+spaceObjects[i].map(function(x){return '<span class="si-tag">'+x+'</span>';}).join(' ')+'</td><td><a>'+spaceUsers[u]+'</a></td><td>2026-08-'+String(12-i%12).padStart(2,'0')+' 14:20</td><td>'+spaceButton(spaceRevoked[i]?'Grant Again':'Revoke Access',(spaceRevoked[i]?'grant:':'revoke:')+i,spaceRevoked[i]?'si-link':'si-danger')+'</td></tr>';}).join('');
  return '<div class="si-tabs">'+['Data Policies','Permissions View'].map(function(t){return '<button type="button" data-si-tab="'+t+'" class="'+(spaceAdmin.dataTab===t?'is-current':'')+'">'+t+'</button>';}).join('')+'</div><section class="si-data-panel"><header class="si-toolbar"><div class="si-tools"><div class="si-segment">'+['Users View','Authorization History'].map(function(t){return '<button type="button" data-si-subtab="'+t+'" class="'+(spaceAdmin.subTab===t?'is-current':'')+'">'+t+'</button>';}).join('')+'</div>'+search+'</div>'+spaceButton('Grant Access','grant-access','si-solid')+'</header><div class="si-table-wrap"><table><thead><tr>'+['User','Role','Department','Granted Data Policies','Grant Method','Data Objects in Ontology','Granted By','Granted At','Actions'].map(function(t){return '<th>'+t+'</th>';}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div><footer class="si-pagination"><span>0 items selected</span><span>'+spacePolicies.length+' in total</span><button disabled>‹</button><button class="is-current">1</button><button disabled>›</button><select aria-label="Items per page"><option>20 items</option></select></footer><p class="si-status" role="status">'+(spaceAdmin.dataTab==='Data Policies'?'Select a policy to inspect its access grants.':spaceAdmin.subTab==='Authorization History'?'Local demo: current authorization records.':'')+'</p></section>';
}
function spaceDialog(action,index){
  var isInvite=action==='invite',isGrant=action==='grant-access',isEdit=action==='edit-role';
  var title=isInvite?'Invite Member':isGrant?'Grant Access':isEdit?'Edit Role':'Create Role';
  var dialog=document.getElementById('spaceDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='spaceDialog';document.body.appendChild(dialog);}
  dialog.innerHTML='<form method="dialog" class="si-form"><header><h2>'+title+'</h2><button type="button" data-si-close aria-label="Close">×</button></header><p>Changes apply to this local demo.</p><label>'+(isInvite?'Email':isGrant?'User':'Role name')+'<input name="value" '+(isInvite?'type="email"':'type="text"')+' required value="'+(isEdit?escapeHtmlModal(spaceRoles[index]):'')+'"></label>'+((isInvite||isGrant)?'<label>Role<select name="role">'+spaceRoles.map(function(r){return '<option>'+escapeHtmlModal(r)+'</option>';}).join('')+'</select></label>':'')+(isGrant?'<label>Data policy<select name="policy">'+spacePolicies.map(function(r){return '<option>'+r+'</option>';}).join('')+'</select></label>':'')+'<footer><button type="button" class="si-button" data-si-close>Cancel</button><button class="si-button si-solid" type="submit">'+(isInvite?'Add to demo':isGrant?'Grant Access':'Save')+'</button></footer></form>';
  dialog.querySelector('form').addEventListener('submit',function(e){e.preventDefault();var f=new FormData(e.target),v=f.get('value').trim();if(!v)return;if(isInvite)spaceMembers.push([v.split('@')[0],v,f.get('role'),'#1f82eb']);else if(isEdit)spaceRoles[index]=v;else if(!isGrant)spaceRoles.push(v);else spaceRevoked[spacePolicies.indexOf(f.get('policy'))]=false;dialog.close();renderSpaceAdmin();});
  dialog.querySelectorAll('[data-si-close]').forEach(function(b){b.onclick=function(){dialog.close();};});dialog.showModal();
}
document.getElementById('spaceInviteEntry').addEventListener('click',openSpaceAdmin);
document.addEventListener('click',function(e){
  var page=e.target.closest('[data-si-page]');if(page){spaceAdmin.page=page.dataset.siPage;spaceAdmin.query='';policyState.creating=false;renderSpaceAdmin();}
  if(e.target.closest('[data-si-exit]')){document.body.classList.remove('space-admin');var active=document.querySelector('.nav-item.is-active');render(active?active.dataset.view:'scenario');document.getElementById('userBtn').focus();}
  var tab=e.target.closest('[data-si-tab]'),sub=e.target.closest('[data-si-subtab]');if(tab||sub){if(tab){spaceAdmin.dataTab=tab.dataset.siTab;spaceAdmin.query='';policyState.creating=false;}if(sub)spaceAdmin.subTab=sub.dataset.siSubtab;renderSpaceAdmin();}
  var b=e.target.closest('[data-si-action]');if(!b)return;var a=b.dataset.siAction.split(':'),i=Number(a[1]);if(a[0]==='delete-role'){if(window.confirm('Delete role “'+spaceRoles[i]+'” from this demo?')){spaceRoles.splice(i,1);renderSpaceAdmin();}}else if(a[0]==='revoke'||a[0]==='grant'){spaceRevoked[i]=a[0]==='revoke';renderSpaceAdmin();}else if(a[0]==='view-policy'){spaceAdmin.dataTab='Permissions View';spaceAdmin.query=spacePolicies[i];renderSpaceAdmin();}else spaceDialog(a[0],i);
});
content.addEventListener('input',function(e){if(e.target.id!=='spaceSearch')return;var pos=e.target.selectionStart;spaceAdmin.query=e.target.value;renderSpaceAdmin();var input=document.getElementById('spaceSearch');input.focus();try{input.setSelectionRange(pos,pos);}catch(_){} });
content.addEventListener('change',function(e){if(e.target.hasAttribute('data-si-member'))spaceMembers[Number(e.target.dataset.siMember)][2]=e.target.value;});
