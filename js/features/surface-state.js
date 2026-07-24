/* Состояния раскрытых блоков, включая восстановление после возврата во вкладку. */
(()=>{
  const scopeSelector="#departmentInfoContent,#departmentTestsContent,#profileRankMaterials";
  const detailsSelector="#departmentInfoContent details,#departmentTestsContent details,#profileRankMaterials details";
  const testBlockSelector="#departmentInfoContent .test-highlight-block,#departmentTestsContent .test-highlight-block,#profileRankMaterials .test-highlight-block";
  const storageKey="rpCabinetOpenDetails_v88";
  let scheduled=false;
  let applying=false;
  let openState=readState();

  function readState(){
    try{
      const value=JSON.parse(sessionStorage.getItem(storageKey)||"{}");
      return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
    }catch(_){return {};}
  }
  function writeState(){
    try{sessionStorage.setItem(storageKey,JSON.stringify(openState));}catch(_){}
  }
  function toggleClass(node,name,enabled){
    if(node.classList.contains(name)!==enabled) node.classList.toggle(name,enabled);
  }
  function detailsKey(details){
    const scope=details.closest(scopeSelector);
    if(!scope) return "";
    const anchor=details.closest("[data-profile-academy-ref],[data-profile-static-ref],section[id],.test-highlight-block[id]")||scope;
    const anchorId=anchor.dataset.profileAcademyRef||anchor.dataset.profileStaticRef||anchor.id||"root";
    const list=Array.from(anchor.querySelectorAll("details"));
    const ownId=details.id||("details-"+Math.max(0,list.indexOf(details)));
    return [scope.id||"scope",anchorId,ownId].join("::");
  }
  function remember(details){
    if(applying||!details.matches(detailsSelector)) return;
    const key=detailsKey(details);
    if(!key) return;
    openState[key]=Boolean(details.open);
    writeState();
  }
  function restore(root=document){
    applying=true;
    const detailsList=[];
    if(root.nodeType===1&&root.matches&&root.matches(detailsSelector)) detailsList.push(root);
    if(root.querySelectorAll) detailsList.push(...root.querySelectorAll(detailsSelector));
    detailsList.forEach(details=>{
      const key=detailsKey(details);
      if(key&&Object.prototype.hasOwnProperty.call(openState,key)) details.open=Boolean(openState[key]);
    });
    applying=false;
  }
  function sync(){
    scheduled=false;
    document.querySelectorAll(testBlockSelector).forEach(block=>{
      toggleClass(block,"kiri-has-open-test",Boolean(block.querySelector("details[open]")));
    });
  }
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{restore();sync();});
  }
  function boot(){
    restore();
    sync();
    document.addEventListener("toggle",event=>{
      if(event.target instanceof HTMLDetailsElement) remember(event.target);
      schedule();
    },true);
    document.addEventListener("click",event=>{
      if(event.target&&event.target.closest&&event.target.closest("summary")) setTimeout(schedule,0);
    },true);
    new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(node=>{
        if(node.nodeType===1) restore(node);
      }));
      schedule();
    }).observe(document.documentElement,{subtree:true,childList:true});
    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden){
        restore();
        [60,180,420].forEach(delay=>setTimeout(schedule,delay));
      }
    });
    document.addEventListener("kiri:source-blocks-updated",schedule);
    document.addEventListener("kiri:profile-pins-changed",schedule);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
