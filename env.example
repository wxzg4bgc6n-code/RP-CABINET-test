/* Синхронизация живых шаблонов USAF. */
(function(){
  function syncUsafTemplates(){
    if(typeof renderDynamicDepartmentDashboard === "function") renderDynamicDepartmentDashboard();
    document.dispatchEvent(new CustomEvent("kiri:source-blocks-updated"));
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncUsafTemplates, {once:true});
  else syncUsafTemplates();
})();
