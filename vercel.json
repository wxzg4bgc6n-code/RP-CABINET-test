/* Выделение и копирование примеров. */
(function(){
  var selectableTypes=[
    {selector:'#departmentInfoContent .phrase',activeClass:'kiri-selected',title:'',clearAfter:1800,stopClick:false},
    {selector:'#departmentTestsContent .academy-test-text-answer',activeClass:'kiri-selected',title:'',clearAfter:1800,stopClick:false},
    {selector:'#profileRankMaterials .phrase',activeClass:'kiri-selected',title:'',clearAfter:1800,stopClick:false},
    {selector:'#departmentInfoContent :is(.report-command,.usaf-post-copy-command-v151)',activeClass:'kiri-selected',title:'',clearAfter:1800,stopClick:false},
    {selector:'#profileRankMaterials :is(.report-command,.usaf-post-copy-command-v151)',activeClass:'kiri-selected',title:'',clearAfter:1800,stopClick:false},
    {selector:'#profile-academy-rp-situation .kiri-rp-line',activeClass:'kiri-rp-line-selected',title:'Нажмите, чтобы выделить строку',clearAfter:0,stopClick:true}
  ];

  function matchSelectable(target){
    if(!target||!target.closest) return null;
    for(var i=0;i<selectableTypes.length;i++){
      var node=target.closest(selectableTypes[i].selector);
      if(node) return {node:node,type:selectableTypes[i]};
    }
    return null;
  }
  function selectText(item){
    if(!item||!item.node) return;
    document.querySelectorAll(item.type.selector+'.'+item.type.activeClass).forEach(function(node){
      if(node!==item.node) node.classList.remove(item.type.activeClass);
    });
    if(document.createRange&&window.getSelection){
      var selection=window.getSelection();
      if(selection){
        var range=document.createRange();
        range.selectNodeContents(item.node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    item.node.classList.add(item.type.activeClass);
    window.clearTimeout(item.node.__kiriSelectTimer);
    if(item.type.clearAfter){
      item.node.__kiriSelectTimer=window.setTimeout(function(){item.node.classList.remove(item.type.activeClass);},item.type.clearAfter);
    }
  }
  function prepare(root){
    var scope=root&&root.querySelectorAll?root:document;
    selectableTypes.forEach(function(type){
      var nodes=[];
      if(scope.matches&&scope.matches(type.selector)) nodes.push(scope);
      scope.querySelectorAll(type.selector).forEach(function(node){nodes.push(node);});
      nodes.forEach(function(node){
        if(!node.hasAttribute('tabindex')) node.setAttribute('tabindex','0');
        if(!node.hasAttribute('role')) node.setAttribute('role','button');
        if(type.title){
          if(!node.hasAttribute('title')) node.setAttribute('title',type.title);
        }else{
          node.removeAttribute('title');
        }
      });
    });
  }
  function isMobile(){
    try{return window.matchMedia&&window.matchMedia('(max-width: 768px)').matches;}catch(e){return window.innerWidth<=768;}
  }
  function mobileSummary(target){
    if(!isMobile()||!target||!target.closest||target.closest('.kiri-pin-profile-btn')) return null;
    return target.closest('#departmentInfoContent details.section-toggle.academy-expand-card > summary.academy-section-head-card,#departmentTestsContent details.section-toggle.academy-expand-card > summary.academy-section-head-card');
  }

  document.addEventListener('click',function(event){
    var item=matchSelectable(event.target);
    if(item){
      if(item.type.stopClick){event.preventDefault();event.stopPropagation();}
      selectText(item);
      return;
    }
    var summary=mobileSummary(event.target);
    if(!summary) return;
    var details=summary.closest('details');
    if(!details) return;
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation) event.stopImmediatePropagation();
    details.open=!details.open;
  },true);

  document.addEventListener('keydown',function(event){
    if(event.key!=='Enter'&&event.key!==' ') return;
    var item=matchSelectable(event.target||document.activeElement);
    if(!item) return;
    event.preventDefault();
    selectText(item);
  },true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){prepare(document);},{once:true});
  else prepare(document);
  new MutationObserver(function(records){
    records.forEach(function(record){record.addedNodes.forEach(function(node){if(node.nodeType===1) prepare(node);});});
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
