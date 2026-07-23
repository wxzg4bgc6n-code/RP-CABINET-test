/* Мобильное поведение без отдельной копии HTML и данных. */
(function(){
  const phoneQuery=window.matchMedia('(max-width: 820px)');
  const compactQuery=window.matchMedia('(max-width: 420px)');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateMobileState(){
    document.body.classList.toggle('mobile-layout',phoneQuery.matches);
    document.body.classList.toggle('mobile-layout-compact',compactQuery.matches);
    document.documentElement.style.setProperty('--mobile-vh',`${window.innerHeight*0.01}px`);
    const nav=document.querySelector('.profile-card > .dashboard-tabs');
    if(nav) nav.setAttribute('aria-label','Основная навигация панели');
  }

  function moveContentToStart(){
    if(!phoneQuery.matches) return;
    const flow=document.querySelector('.flow');
    if(!flow) return;
    requestAnimationFrame(()=>flow.scrollIntoView({
      block:'start',
      behavior:reducedMotion.matches?'auto':'smooth'
    }));
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('.profile-card > .dashboard-tabs .dash-tab')) moveContentToStart();
  });
  document.addEventListener('focusin',event=>{
    if(phoneQuery.matches && event.target.matches('input,select,textarea')) document.body.classList.add('mobile-keyboard-focus');
  });
  document.addEventListener('focusout',()=>setTimeout(()=>document.body.classList.remove('mobile-keyboard-focus'),120));
  window.addEventListener('resize',updateMobileState,{passive:true});
  window.addEventListener('orientationchange',updateMobileState,{passive:true});
  window.addEventListener('pageshow',updateMobileState);
  phoneQuery.addEventListener?.('change',updateMobileState);
  compactQuery.addEventListener?.('change',updateMobileState);
  updateMobileState();
})();
