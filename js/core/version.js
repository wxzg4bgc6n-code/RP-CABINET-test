const TEST_VERSION="104";
const TEST_VERSION_LABEL="Public report key";
function renderTestVersion(){
  const label=`TEST v${TEST_VERSION} · ${TEST_VERSION_LABEL}`;
  document.querySelectorAll(".kiri-test-version-badge").forEach(el=>{
    if(el.textContent!==label) el.textContent=label;
  });
}
renderTestVersion();
document.addEventListener("DOMContentLoaded",renderTestVersion);
new MutationObserver(renderTestVersion).observe(document.documentElement,{childList:true,subtree:true});
