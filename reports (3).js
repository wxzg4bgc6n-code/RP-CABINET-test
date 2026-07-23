/* Состояния поверхностей раскрытых блоков. */
(()=>{
  const scopeSelector="#departmentInfoContent,#departmentTestsContent,#profileRankMaterials";
  let scheduled=false;

  function toggleClass(node,name,enabled){
    if(node.classList.contains(name)!==enabled) node.classList.toggle(name,enabled);
  }
  function sync(){
    scheduled=false;
    document.querySelectorAll(scopeSelector+" .test-highlight-block").forEach(block=>{
      toggleClass(block,"kiri-has-open-test",Boolean(block.querySelector("details[open]")));
    });
  }
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(sync);
  }
  function boot(){
    sync();
    document.addEventListener("toggle",schedule,true);
    document.addEventListener("click",event=>{
      if(event.target&&event.target.closest&&event.target.closest("summary")) setTimeout(schedule,0);
    },true);
    new MutationObserver(schedule).observe(document.documentElement,{
      subtree:true,childList:true,attributes:true,attributeFilter:["open"]
    });
    document.addEventListener("kiri:source-blocks-updated",schedule);
    document.addEventListener("kiri:profile-pins-changed",schedule);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
