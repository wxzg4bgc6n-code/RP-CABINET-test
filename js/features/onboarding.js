/* TEST v107 — управляет только первым созданием профиля. */
(function(){
  const screen=document.getElementById('firstScreen');
  const shell=document.getElementById('onboardingShell');
  if(!screen||!shell) return;

  const stages=Array.from(screen.querySelectorAll('[data-onboarding-stage]'));
  const stageNames=stages.map(stage=>stage.dataset.onboardingStage);
  const dots=Array.from(screen.querySelectorAll('[data-onboarding-dot]'));
  const firstName=document.getElementById('firstName');
  const firstOrg=document.getElementById('firstOrg');
  const orgGrid=document.getElementById('onboardingOrgGrid');
  const skip=document.getElementById('onboardingSkip');
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
  let active='welcome';
  let autoTimer=0;
  let started=false;

  function clearAuto(){
    if(autoTimer){clearTimeout(autoTimer);autoTimer=0;}
  }

  function stageIndex(name){return Math.max(0,stageNames.indexOf(name));}

  function updateDots(name){
    const formOrder=['name','direction','organization'];
    const current=formOrder.indexOf(name);
    dots.forEach(dot=>{
      const index=formOrder.indexOf(dot.dataset.onboardingDot);
      dot.classList.toggle('is-active',index===current);
      dot.classList.toggle('is-complete',current>index);
    });
  }

  function setStage(name,options={}){
    if(!stageNames.includes(name)) return;
    clearAuto();
    const nextIndex=stageIndex(name);
    stages.forEach(stage=>{
      const index=stageIndex(stage.dataset.onboardingStage);
      stage.classList.toggle('is-active',stage.dataset.onboardingStage===name);
      stage.classList.toggle('is-before',index<nextIndex);
      stage.setAttribute('aria-hidden',stage.dataset.onboardingStage===name?'false':'true');
    });
    active=name;
    shell.classList.toggle('is-form-active',['name','direction','organization'].includes(name));
    updateDots(name);
    if(name==='name') setTimeout(()=>firstName?.focus({preventScroll:true}),reducedMotion?0:430);
    if(name==='organization') renderOrganizations();
    if(options.auto){
      autoTimer=setTimeout(()=>setStage(options.auto.next),options.auto.delay);
    }
  }

  function selectedPath(){
    return screen.querySelector('input[name="path"]:checked')?.value||'Государственная служба';
  }

  function organizationsForPath(){
    const path=selectedPath();
    if(window.ORGS&&Array.isArray(window.ORGS[path])) return window.ORGS[path];
    if(typeof ORGS!=='undefined'&&Array.isArray(ORGS[path])) return ORGS[path];
    return path==='Крайм'
      ? ['Семья','Банда','Мафия','Картель','Нелегал']
      : ['ARMY','LSPD','LSSD','FIB','EMS','GOV','USSS','PRISON','Weazel News'];
  }

  function renderOrganizations(){
    if(!orgGrid||!firstOrg) return;
    const items=organizationsForPath();
    if(!items.includes(firstOrg.value)) firstOrg.value=items[0]||'';
    orgGrid.innerHTML=items.map(org=>`<button class="onboarding-org-option ${firstOrg.value===org?'is-active':''}" type="button" data-onboarding-org="${String(org).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"><span>${String(org).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span></button>`).join('');
  }

  function validateName(){
    const error=document.getElementById('firstError');
    const valid=!!firstName?.value.trim();
    error?.classList.toggle('show',!valid);
    if(!valid) firstName?.focus();
    return valid;
  }

  screen.addEventListener('click',event=>{
    const next=event.target.closest('[data-onboarding-next]');
    if(next){
      const target=next.dataset.onboardingNext;
      if(active==='name'&&!validateName()) return;
      setStage(target);
      return;
    }
    const back=event.target.closest('[data-onboarding-back]');
    if(back){setStage(back.dataset.onboardingBack);return;}
    const orgButton=event.target.closest('[data-onboarding-org]');
    if(orgButton&&firstOrg){
      firstOrg.value=orgButton.dataset.onboardingOrg||'';
      renderOrganizations();
    }
  });

  firstName?.addEventListener('input',()=>document.getElementById('firstError')?.classList.remove('show'));
  firstName?.addEventListener('keydown',event=>{
    if(event.key==='Enter'){
      event.preventDefault();
      if(validateName()) setStage('direction');
    }
  });
  screen.querySelectorAll('input[name="path"]').forEach(input=>input.addEventListener('change',()=>{
    if(firstOrg) firstOrg.value='';
    if(active==='organization') renderOrganizations();
  }));
  skip?.addEventListener('click',()=>setStage('name'));

  function start(){
    if(started||document.body.classList.contains('ready')) return;
    started=true;
    if(reducedMotion){setStage('name');return;}
    setStage('welcome',{auto:{next:'about',delay:1750}});
    autoTimer=setTimeout(()=>{
      setStage('about',{auto:{next:'name',delay:2450}});
    },1750);
  }

  function waitForBoot(){
    if(window.__profileBootComplete){start();return;}
    const timer=setInterval(()=>{
      if(window.__profileBootComplete){clearInterval(timer);start();}
    },80);
    setTimeout(()=>{clearInterval(timer);start();},9000);
  }

  window.KiriOnboarding={
    setStage,
    getOrganization(){return firstOrg?.value||'';},
    complete(callback){
      clearAuto();
      screen.classList.add('is-leaving');
      document.body.classList.add('onboarding-opening');
      setTimeout(()=>{
        if(typeof callback==='function') callback();
        setTimeout(()=>document.body.classList.remove('onboarding-opening'),900);
      },reducedMotion?0:430);
    }
  };

  waitForBoot();
})();
