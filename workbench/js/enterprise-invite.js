/* Enterprise administrator invitation — local demo state. */
var enterpriseInviteState={query:'',selected:[],searchOpen:false};
var enterpriseInviteCandidates=[
  {name:'Jamie Walker',phone:'180989098909',email:'Jamie Walker@inspiregroup.com',letter:'A',color:'#505050'},
  {name:'Liu Lili',phone:'180989098909',email:'liulili@inspiregroup.com',letter:'L',color:'#1fbeeb'},
  {name:'Zhang Nana',phone:'180989098909',email:'zhangnana@inspiregroup.com',letter:'Z',color:'#eba71f'},
  {name:'Jamie Chen',phone:'180989098909',email:'jamie.chen@inspiregroup.com',letter:'J',color:'#741feb'},
  {name:'Lily Zhang',phone:'180989098909',email:'lily.zhang@inspiregroup.com',letter:'L',color:'#505050'}
];
function enterpriseInviteMatches(){var q=enterpriseInviteState.query.trim().toLowerCase();return enterpriseInviteCandidates.map(function(person,index){return {person:person,index:index};}).filter(function(item){return !enterpriseInviteState.selected.includes(item.index)&&(!q||(item.person.name+' '+item.person.phone+' '+item.person.email).toLowerCase().includes(q));});}
function enterpriseInvitePerson(person){return '<span class="ei-avatar" style="background:'+person.color+'">'+person.letter+'</span><span class="ei-person"><strong>'+escapeHtmlModal(person.name)+'</strong><span>'+person.phone+'</span></span>';}
function renderEnterpriseInviteResults(){
  var target=document.getElementById('enterpriseInviteResults');if(!target)return;
  target.hidden=!enterpriseInviteState.searchOpen;
  target.innerHTML=enterpriseInviteMatches().map(function(item){return '<button type="button" class="ei-result" data-ei-add="'+item.index+'">'+enterpriseInvitePerson(item.person)+'</button>';}).join('')||'<p class="ei-empty">No matching members</p>';
}
function renderEnterpriseInvite(){
  var s=enterpriseInviteState,dialog=document.getElementById('enterpriseInviteDialog');
  dialog.innerHTML='<form id="enterpriseInviteForm"><header class="ei-header"><h2>Invite Enterprise Admins</h2><button type="button" aria-label="Close" data-ei-close>'+spaceIcon('invite-close')+'</button></header><div class="ei-body '+(s.selected.length?'has-selection':'')+'"><div class="ei-search-wrap"><label class="ei-search"><input id="enterpriseInviteSearch" type="search" autocomplete="off" aria-label="Search members" placeholder="Enter name, phone, or email" value="'+escapeHtmlModal(s.query)+'"><button type="button" aria-label="Search " data-ei-search>'+spaceIcon('invite-search')+'</button></label><div id="enterpriseInviteResults" class="ei-results" role="group" aria-label="Search results" hidden></div></div>'+(s.selected.length?'<div class="ei-selected" aria-label="Selected administrators">'+s.selected.map(function(index){var p=enterpriseInviteCandidates[index];return '<div class="ei-selected-row">'+enterpriseInvitePerson(p)+'<span class="ei-role">Enterprise Admin</span><button type="button" aria-label="Remove '+escapeHtmlModal(p.name)+'" data-ei-remove="'+index+'">'+spaceIcon('invite-close')+'</button></div>';}).join('')+'</div>':'')+'</div><footer class="ei-footer">'+(!s.selected.length?'<button type="button" class="si-button ei-outline" data-ei-close>Cancel</button>':'')+'<button type="submit" class="si-button ei-confirm">'+(s.selected.length?'Confirm ('+s.selected.length+')':'Confirm')+'</button></footer></form>';
  renderEnterpriseInviteResults();
}
function addEnterpriseInviteCandidate(index){if(!enterpriseInviteCandidates[index]||enterpriseInviteState.selected.includes(index))return;enterpriseInviteState.selected.push(index);enterpriseInviteState.query='';enterpriseInviteState.searchOpen=false;renderEnterpriseInvite();document.getElementById('enterpriseInviteSearch').focus();}
function confirmEnterpriseInvite(){
  if(!enterpriseInviteState.selected.length){enterpriseInviteState.searchOpen=true;renderEnterpriseInviteResults();document.getElementById('enterpriseInviteSearch').focus();return;}
  enterpriseInviteState.selected.forEach(function(index){var p=enterpriseInviteCandidates[index],existing=spaceMembers.find(function(m){return m[1].toLowerCase()===p.email.toLowerCase();});if(existing)existing[2]='Enterprise Admin';else spaceMembers.push([p.name,p.email,'Enterprise Admin',p.color]);});
  document.getElementById('enterpriseInviteDialog').close();
  if(document.body.classList.contains('space-admin'))renderSpaceAdmin();
}
function openEnterpriseInvite(){
  closeAcct();enterpriseInviteState={query:'',selected:[],searchOpen:false};
  var dialog=document.getElementById('enterpriseInviteDialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='enterpriseInviteDialog';dialog.setAttribute('aria-label','Invite Enterprise Admins');document.body.appendChild(dialog);
    dialog.addEventListener('click',function(e){
      if(e.target.closest('[data-ei-close]')){dialog.close();return;}
      if(e.target.closest('[data-ei-search]')){enterpriseInviteState.searchOpen=!enterpriseInviteState.searchOpen;renderEnterpriseInviteResults();return;}
      var b=e.target.closest('[data-ei-add]');if(b){addEnterpriseInviteCandidate(Number(b.dataset.eiAdd));return;}
      b=e.target.closest('[data-ei-remove]');if(b){enterpriseInviteState.selected=enterpriseInviteState.selected.filter(function(index){return index!==Number(b.dataset.eiRemove);});renderEnterpriseInvite();return;}
      if(!e.target.closest('.ei-search-wrap')){enterpriseInviteState.searchOpen=false;renderEnterpriseInviteResults();}
    });
    dialog.addEventListener('input',function(e){if(e.target.id!=='enterpriseInviteSearch')return;enterpriseInviteState.query=e.target.value;enterpriseInviteState.searchOpen=!!e.target.value.trim();renderEnterpriseInviteResults();});
    dialog.addEventListener('keydown',function(e){if(e.target.id==='enterpriseInviteSearch'&&e.key==='Enter'){e.preventDefault();var first=enterpriseInviteMatches()[0];if(first)addEnterpriseInviteCandidate(first.index);}});
    dialog.addEventListener('submit',function(e){if(e.target.id!=='enterpriseInviteForm')return;e.preventDefault();confirmEnterpriseInvite();});
  }
  renderEnterpriseInvite();dialog.showModal();
}
