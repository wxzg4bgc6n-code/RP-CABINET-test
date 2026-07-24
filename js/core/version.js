const TEST_VERSION="80";
const TEST_VERSION_LABEL="True realtime Firebase sync";
function renderTestVersion(){
  const label=`TEST v${TEST_VERSION} · ${TEST_VERSION_LABEL}`;
  document.querySelectorAll(".kiri-test-version-badge").forEach(el=>{
    if(el.textContent!==label) el.textContent=label;
  });
}
renderTestVersion();
document.addEventListener("DOMContentLoaded",renderTestVersion);
new MutationObserver(renderTestVersion).observe(document.documentElement,{childList:true,subtree:true});
