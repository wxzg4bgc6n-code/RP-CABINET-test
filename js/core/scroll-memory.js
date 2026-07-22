/* Восстановление позиции страницы. */
(function(){
  var SCROLL_KEY='kiri:rp-cabinet:last-scroll:'+location.pathname;
  var saveTimer=0;
  var restored=false;
  try{if('scrollRestoration' in history) history.scrollRestoration='manual';}catch(e){}

  function currentScroll(){
    return Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
  }
  function saveScroll(){
    try{localStorage.setItem(SCROLL_KEY,String(currentScroll()));}catch(e){}
  }
  function restoreScroll(){
    if(restored) return;
    restored=true;
    try{
      var y=parseInt(localStorage.getItem(SCROLL_KEY)||'0',10);
      if(isFinite(y)&&y>0){
        window.scrollTo(0,y);
        setTimeout(function(){window.scrollTo(0,y);},100);
        setTimeout(function(){window.scrollTo(0,y);},500);
      }
    }catch(e){}
  }

  window.addEventListener('scroll',function(){clearTimeout(saveTimer);saveTimer=setTimeout(saveScroll,120);},{passive:true});
  window.addEventListener('pagehide',saveScroll);
  window.addEventListener('beforeunload',saveScroll);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',restoreScroll,{once:true});
  else restoreScroll();
  window.addEventListener('load',restoreScroll,{once:true});
})();
