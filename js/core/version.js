const TEST_VERSION="68";
const TEST_VERSION_LABEL="Mobile layout and safe sync";
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".kiri-test-version-badge").forEach(el=>{
    el.textContent=`TEST v${TEST_VERSION} · ${TEST_VERSION_LABEL}`;
  });
});
