/* Промо-карусель боковой панели. */
(()=>{
  function initSidebarPromo(){
    const sidebar=document.querySelector(".profile-card");
    const tabs=sidebar&&sidebar.querySelector(".dashboard-tabs");
    const settings=sidebar&&sidebar.querySelector("#openSettings");
    if(!sidebar||!tabs||!settings||document.getElementById("profilePromoCarousel")) return;

    const root=document.createElement("section");
    root.className="profile-promo-carousel";
    root.id="profilePromoCarousel";
    root.setAttribute("role","region");
    root.setAttribute("aria-roledescription","карусель");
    root.setAttribute("aria-label","Ссылки и проекты");
    root.innerHTML=`
      <a class="profile-stream-banner is-checking" id="profileStreamBanner" href="https://www.twitch.tv/k1ri_ttv" target="_blank" rel="noopener noreferrer" aria-label="Проверяем статус стрима. Открыть Twitch-канал K1RI_TTV">
        <span class="profile-stream-dot" aria-hidden="true"></span>
        <span class="profile-stream-text" id="profileStreamText">ПРОВЕРЯЕМ СТАТУС СТРИМА</span>
        <span class="profile-stream-open" aria-hidden="true">↗</span>
      </a>
      <div class="profile-promo-track" aria-live="off">
        <article class="profile-promo-slide is-active" data-promo-slide role="group" aria-roledescription="слайд" aria-label="1 из 2" aria-hidden="false">
          <a class="profile-promo-content" href="https://www.twitch.tv/k1ri_ttv" target="_blank" rel="noopener noreferrer">
            <span class="profile-promo-kicker"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 3h16v11l-4 4h-4l-3 3v-3H5V3Z"></path><path d="M10 8v5M15 8v5"></path></svg>Канал автора</span>
            <strong>K1RI_TTV на Twitch</strong>
            <span class="profile-promo-copy">Стримы, игры и разный контент.</span>
            <span class="profile-promo-action">Открыть канал <span aria-hidden="true">↗</span></span>
          </a>
        </article>
        <article class="profile-promo-slide profile-promo-slide-bot" data-promo-slide role="group" aria-roledescription="слайд" aria-label="2 из 2" aria-hidden="true">
          <a class="profile-promo-content" href="https://github.com/wxzg4bgc6n-code/RP-CABINET-test/releases/download/program-v1.0.0/RP-Helper.zip" download="RP-Helper.zip" rel="noopener noreferrer" aria-label="Скачать программу RP-Helper версии 1.0.0">
            <span class="profile-promo-kicker"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="12" rx="3"></rect><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"></path></svg>Инструмент для работы</span>
            <strong>RP-Helper</strong>
            <span class="profile-promo-copy">Рабочая программа для Majestic RP, GTA5RP и других RP-проектов.</span>
            <span class="profile-promo-action">Скачать программу <span aria-hidden="true">↓</span></span>
          </a>
        </article>
      </div>
      <div class="profile-promo-controls">
        <div class="profile-promo-dots" role="group" aria-label="Выбор проекта">
          <button class="is-active" type="button" data-promo-dot="0" aria-label="Показать Twitch-канал" aria-pressed="true"></button>
          <button type="button" data-promo-dot="1" aria-label="Показать рабочую программу" aria-pressed="false"></button>
        </div>
      </div>
      <span class="profile-promo-sr-only" id="profilePromoAnnouncement" aria-live="polite"></span>
      <div class="profile-twitch-probe" id="profileTwitchProbe" aria-hidden="true"></div>`;
    settings.before(root);

    const slides=Array.from(root.querySelectorAll("[data-promo-slide]"));
    const dots=Array.from(root.querySelectorAll("[data-promo-dot]"));
    const announcement=root.querySelector("#profilePromoAnnouncement");
    const streamBanner=root.querySelector("#profileStreamBanner");
    const streamText=root.querySelector("#profileStreamText");
    const twitchProbe=root.querySelector("#profileTwitchProbe");
    const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
    const interval=6500;
    let current=0;
    let timer=0;
    let hoverPaused=false;
    let focusPaused=false;

    const stop=()=>{
      if(timer){
        window.clearTimeout(timer);
        timer=0;
      }
    };
    const canRotate=()=>slides.length>1&&!reduceMotion.matches&&!hoverPaused&&!focusPaused&&!document.hidden;
    const schedule=()=>{
      stop();
      if(canRotate()) timer=window.setTimeout(()=>show(current+1,false),interval);
    };
    function show(next,announce){
      current=(next+slides.length)%slides.length;
      slides.forEach((slide,index)=>{
        const active=index===current;
        slide.classList.toggle("is-active",active);
        slide.setAttribute("aria-hidden",String(!active));
        slide.querySelectorAll("a,button,[tabindex]").forEach(element=>{
          if(active) element.removeAttribute("tabindex");
          else element.tabIndex=-1;
        });
      });
      dots.forEach((dot,index)=>{
        const active=index===current;
        dot.classList.toggle("is-active",active);
        dot.setAttribute("aria-pressed",String(active));
      });
      if(announce&&announcement){
        const title=slides[current].querySelector("strong");
        announcement.textContent=`Показано: ${title?title.textContent.trim():`Слайд ${current+1}`}`;
      }
      schedule();
    }

    dots.forEach((dot,index)=>dot.addEventListener("click",()=>show(index,true)));
    root.addEventListener("pointerenter",()=>{
      hoverPaused=true;
      stop();
    });
    root.addEventListener("pointerleave",()=>{
      hoverPaused=false;
      schedule();
    });
    root.addEventListener("focusin",()=>{
      focusPaused=true;
      stop();
    });
    root.addEventListener("focusout",()=>window.requestAnimationFrame(()=>{
      focusPaused=root.contains(document.activeElement);
      schedule();
    }));
    document.addEventListener("visibilitychange",schedule);
    const onMotionChange=()=>{
      schedule();
    };
    if(reduceMotion.addEventListener) reduceMotion.addEventListener("change",onMotionChange);
    else reduceMotion.addListener(onMotionChange);

    const TWITCH_CHANNEL="k1ri_ttv";
    const TWITCH_WEB_PROTOCOL=/^https?:$/.test(window.location.protocol);
    const TWITCH_PARENT=window.location.hostname||"";
    const TWITCH_RETRY_MS=120000;
    let twitchPlayer=null;
    let twitchState="checking";
    let twitchStateTimeout=0;
    let twitchRetryTimer=0;
    let twitchLastResolvedState="";

    function setTwitchStatus(state){
      if(!streamBanner||!streamText) return;
      const labels={
        checking:"ПРОВЕРЯЕМ СТАТУС СТРИМА",
        live:"KIRI СЕЙЧАС СТРИМИТ",
        offline:"СТРИМ СЕЙЧАС НЕ ИДЁТ",
        local:"ПРОВЕРКА СТРИМА НА САЙТЕ",
        error:"НЕ УДАЛОСЬ ПРОВЕРИТЬ TWITCH"
      };
      const nextState=labels[state]?state:"error";

      // Кратковременная ошибка Twitch не должна затирать уже подтверждённый статус.
      if(nextState==="error"&&twitchLastResolvedState){
        streamBanner.title="Twitch временно не ответил. Показан последний подтверждённый статус стрима.";
        scheduleTwitchRetry();
        return;
      }

      twitchState=nextState;
      window.clearTimeout(twitchStateTimeout);
      if(twitchState==="live"||twitchState==="offline"){
        twitchLastResolvedState=twitchState;
        window.clearTimeout(twitchRetryTimer);
      }
      streamBanner.classList.remove("is-checking","is-live","is-offline","is-error","is-local");
      streamBanner.classList.add(`is-${twitchState}`);
      root.classList.toggle("is-stream-live",twitchState==="live");
      streamText.textContent=labels[twitchState];
      streamBanner.setAttribute("aria-label",`${labels[twitchState]}. Открыть Twitch-канал K1RI_TTV`);
      if(twitchState==="local"){
        streamBanner.title="Автоматическая проверка Twitch работает после запуска панели через http://localhost или после публикации на сайте.";
      }else if(twitchState!=="error"){
        streamBanner.removeAttribute("title");
      }
      if(twitchState==="live"){
        show(0,false);
        if(announcement) announcement.textContent="KIRI сейчас стримит на Twitch";
      }
      if(twitchState==="error") scheduleTwitchRetry();
    }

    function canCheckTwitch(){
      return TWITCH_WEB_PROTOCOL&&Boolean(TWITCH_PARENT);
    }

    function armTwitchTimeout(){
      window.clearTimeout(twitchStateTimeout);
      twitchStateTimeout=window.setTimeout(()=>{
        if(twitchState!=="checking") return;
        if(twitchLastResolvedState) setTwitchStatus(twitchLastResolvedState);
        else setTwitchStatus("error");
      },25000);
    }

    function resetTwitchPlayer(){
      twitchPlayer=null;
      if(twitchProbe) twitchProbe.replaceChildren();
    }

    function retryTwitchPlayer(){
      window.clearTimeout(twitchRetryTimer);
      if(document.hidden||!canCheckTwitch()) return;
      resetTwitchPlayer();
      initTwitchPlayer();
    }

    function scheduleTwitchRetry(){
      if(twitchRetryTimer||!canCheckTwitch()) return;
      twitchRetryTimer=window.setTimeout(()=>{
        twitchRetryTimer=0;
        retryTwitchPlayer();
      },TWITCH_RETRY_MS);
    }

    function initTwitchPlayer(){
      if(twitchPlayer||!twitchProbe) return;
      if(!canCheckTwitch()){
        setTwitchStatus("local");
        return;
      }
      if(!window.Twitch||!window.Twitch.Player){
        setTwitchStatus("error");
        return;
      }
      if(!twitchLastResolvedState) setTwitchStatus("checking");
      armTwitchTimeout();
      try{
        const options={
          width:400,
          height:300,
          channel:TWITCH_CHANNEL,
          parent:[TWITCH_PARENT],
          autoplay:false,
          muted:true
        };
        twitchPlayer=new window.Twitch.Player("profileTwitchProbe",options);
        twitchPlayer.addEventListener(window.Twitch.Player.ONLINE,()=>setTwitchStatus("live"));
        twitchPlayer.addEventListener(window.Twitch.Player.OFFLINE,()=>setTwitchStatus("offline"));
        twitchPlayer.addEventListener(window.Twitch.Player.ENDED,()=>setTwitchStatus("offline"));
        twitchPlayer.addEventListener(window.Twitch.Player.READY,()=>{
          try{
            twitchPlayer.setMuted(true);
            twitchPlayer.pause();
          }catch(_error){}
        });
      }catch(_error){
        resetTwitchPlayer();
        setTwitchStatus("error");
      }
    }

    function loadTwitchSdk(){
      if(!canCheckTwitch()){
        setTwitchStatus("local");
        return;
      }
      if(window.Twitch&&window.Twitch.Player){
        initTwitchPlayer();
        return;
      }
      let sdk=document.querySelector('script[data-kiri-twitch-sdk="true"]');
      if(!sdk){
        sdk=document.createElement("script");
        sdk.src="https://player.twitch.tv/js/embed/v1.js";
        sdk.async=true;
        sdk.dataset.kiriTwitchSdk="true";
        document.head.appendChild(sdk);
      }
      sdk.addEventListener("load",initTwitchPlayer,{once:true});
      sdk.addEventListener("error",()=>setTwitchStatus("error"),{once:true});
    }

    document.addEventListener("visibilitychange",()=>{
      if(!document.hidden&&twitchState==="error") retryTwitchPlayer();
    });
    setTwitchStatus(canCheckTwitch()?"checking":"local");
    loadTwitchSdk();
    show(0,false);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initSidebarPromo,{once:true});
  else initSidebarPromo();
})();
