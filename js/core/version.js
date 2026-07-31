const TEST_VERSION="105";
const TEST_VERSION_LABEL="Screenshot upload fix";
function renderTestVersion(){
  const label=`TEST v${TEST_VERSION} · ${TEST_VERSION_LABEL}`;
  document.querySelectorAll(".kiri-test-version-badge").forEach(el=>{
    if(el.textContent!==label) el.textContent=label;
  });
}
renderTestVersion();
document.addEventListener("DOMContentLoaded",renderTestVersion);
new MutationObserver(renderTestVersion).observe(document.documentElement,{childList:true,subtree:true});
