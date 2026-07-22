const TEST_VERSION="69";
const TEST_VERSION_LABEL="Mobile UI and transactional sync";
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".kiri-test-version-badge").forEach(el=>{
    el.textContent=`TEST v${TEST_VERSION} · ${TEST_VERSION_LABEL}`;
  });
});
