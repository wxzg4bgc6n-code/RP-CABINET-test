/* v112: hard guard for Academy card visibility in career path. */
(function careerPathAcademyGuard(){
  function text(el){ return String(el?.textContent||'').trim(); }
  function section(){
    try{
      if(typeof S!=='undefined' && S && typeof S.section==='string' && S.section.trim()) return S.section.trim();
    }catch(e){}
    const info=text(document.querySelector('#infoSection'));
    if(info && info!=='—') return info;
    return '';
  }
  function enforce(){
    const wrap=document.querySelector('#careerPathCards');
    if(!wrap) return;
    const current=section();
    if(!current) return;
    wrap.dataset.currentSection=current;
    const showAcademy=current==='Academy';
    wrap.querySelectorAll('.path-card').forEach(card=>{
      const title=text(card.querySelector('b'));
      if(title!=='Academy') return;
      card.hidden=!showAcademy;
      card.style.display=showAcademy?'':'none';
      card.setAttribute('aria-hidden',showAcademy?'false':'true');
    });
  }
  function boot(){
    const wrap=document.querySelector('#careerPathCards');
    if(!wrap) return;
    enforce();
    new MutationObserver(enforce).observe(wrap,{childList:true,subtree:true,characterData:true});
    const info=document.querySelector('#infoSection');
    if(info) new MutationObserver(enforce).observe(info,{childList:true,subtree:true,characterData:true});
    document.addEventListener('click',()=>queueMicrotask(enforce),true);
    window.addEventListener('storage',()=>setTimeout(enforce,0));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
