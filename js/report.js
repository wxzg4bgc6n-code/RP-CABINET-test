(function(){
  const config=window.RP_PROOF_SERVICE||{};
  const state=document.getElementById('reportState');
  const content=document.getElementById('reportContent');
  let loadSequence=0;

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function finishLoading(){
    if(typeof window.__rpReportStopWatchdog==='function') window.__rpReportStopWatchdog();
  }

  function setReportView(showState){
    state.hidden=!showState;
    state.style.display=showState?'':'none';
    content.hidden=showState;
    content.style.display=showState?'none':'';
  }

  function showLoading(attempt){
    setReportView(true);
    state.classList.remove('is-error');
    state.innerHTML=`<div class="report-loader"></div><h2>${attempt>1?'Повторно загружаю отчёт':'Загружаю отчёт'}</h2><p>${attempt>1?'Сервис не ответил сразу — выполняю ещё одну попытку.':'Проверяю данные и оригиналы скриншотов.'}</p>`;
  }

  function showError(title,message){
    finishLoading();
    setReportView(true);
    state.innerHTML=`<div class="report-error-mark">!</div><h2>${esc(title)}</h2><p>${esc(message)}</p><button class="report-retry" type="button">Попробовать снова</button>`;
    state.classList.add('is-error');
    state.querySelector('.report-retry')?.addEventListener('click',load);
  }

  function delay(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
  }

  async function fetchWithTimeout(url,timeoutMs=10000){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      return await fetch(url,{cache:'no-store',signal:controller.signal});
    }finally{
      clearTimeout(timeout);
    }
  }

  function fileCard(file){
    const size=file.width&&file.height?`${file.width}×${file.height}`:'исходный размер';
    return `<figure class="report-proof">
      <a href="${esc(file.url)}" target="_blank" rel="noopener" title="Открыть оригинал">
        <img src="${esc(file.url)}" alt="${esc(file.name||'Скриншот подтверждения')}" loading="lazy">
      </a>
      <figcaption><b>${esc(file.name||'Скриншот')}</b><span>${esc(size)} · открыть оригинал</span></figcaption>
    </figure>`;
  }

  function taskCard(task,index){
    const files=Array.isArray(task.files)?task.files:[];
    return `<article class="report-task ${files.length?'has-files':'plain-done'}">
      <div class="report-task-title">
        <span>${index+1}</span>
        <div><h3>${esc(task.title)}</h3><p>${task.required?'Подтверждено скриншотом':'Выполнено · скриншот не требуется'}</p></div>
        <i>✓</i>
      </div>
      ${files.length?`<div class="report-proofs">${files.map(fileCard).join('')}</div>`:''}
    </article>`;
  }

  function profileInitials(name){
    return (String(name||'RP').trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2)||'RP').toUpperCase();
  }

  function renderProfileAvatar(profile){
    const avatar=document.getElementById('reportProfileAvatar');
    if(!avatar) return;
    const fallback=document.createElement('span');
    fallback.textContent=profileInitials(profile?.name);
    avatar.replaceChildren(fallback);
    const rawUrl=String(profile?.avatarUrl||'').trim();
    if(!/^https:\/\//i.test(rawUrl)) return;
    const image=document.createElement('img');
    image.alt=`Аватар ${profile?.name||'профиля'}`;
    image.referrerPolicy='no-referrer';
    image.addEventListener('error',()=>avatar.replaceChildren(fallback),{once:true});
    image.src=rawUrl;
    avatar.replaceChildren(image);
  }

  function render(report){
    const profile=report.profile||{};
    finishLoading();
    setReportView(false);
    state.classList.remove('is-error');
    renderProfileAvatar(profile);
    document.title=`${profile.name||'Игрок'} · отчёт RP Cabinet`;
    content.innerHTML=`<section class="report-hero">
      <div>
        <span>Отчёт подтверждён</span>
        <h2>${esc(profile.name||'Игрок')}</h2>
        <p>${esc([profile.project,profile.org,profile.section].filter(Boolean).join(' · '))}</p>
      </div>
      <div class="report-level"><span>Ступень</span><b>${esc(profile.level||'—')}</b></div>
    </section>
    <section class="report-meta">
      <div><span>Создан</span><b>${new Date(report.createdAt).toLocaleString('ru-RU')}</b></div>
      <div><span>Доступен до</span><b>${new Date(report.expiresAt).toLocaleString('ru-RU')}</b></div>
      <div><span>Выполнено</span><b>${report.tasks?.length||0} пунктов</b></div>
    </section>
    <section class="report-task-list">${(report.tasks||[]).map((task,index)=>`${index?`<div class="report-task-separator" aria-hidden="true"><span>Пункт ${index+1}</span></div>`:''}${taskCard(task,index)}`).join('')}</section>`;
  }

  async function load(){
    const sequence=++loadSequence;
    const id=new URLSearchParams(location.search).get('id')||'';
    if(!/^[a-f0-9]{36}$/i.test(id)) return showError('Неверная ссылка','В адресе нет корректного номера отчёта.');
    if(!/^https:\/\//i.test(config.apiBase||'') || String(config.apiBase).includes('YOUR-RP-CABINET')){
      return showError('Хранилище ещё не подключено','Адрес сервиса Vercel будет добавлен после первого развёртывания.');
    }
    let lastError=null;
    for(let attempt=1;attempt<=2;attempt++){
      if(sequence!==loadSequence) return;
      showLoading(attempt);
      try{
        const response=await fetchWithTimeout(`${config.apiBase}/api/reports?id=${encodeURIComponent(id)}`);
        const data=await response.json().catch(()=>null);
        if(sequence!==loadSequence) return;
        if(response.status===410) return showError('Срок отчёта закончился','Прошло 8 дней, поэтому ссылка и скриншоты удалены.');
        if(response.ok) return render(data);
        lastError=new Error(data?.error||'Отчёт пока не найден.');
        if(attempt===1&&(response.status===404||response.status>=500)){
          await delay(1200);
          continue;
        }
        return showError('Отчёт не найден',lastError.message);
      }catch(error){
        lastError=error;
        if(attempt===1){
          await delay(1200);
          continue;
        }
      }
    }
    const timedOut=lastError?.name==='AbortError';
    showError(
      timedOut?'Сервис не ответил вовремя':'Не удалось открыть отчёт',
      timedOut?'Сервис дважды не ответил за отведённое время. Попробуй ещё раз.':'Проверь интернет и доступность сервиса без VPN.'
    );
  }

  document.getElementById('copyReportUrl').addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      const button=document.getElementById('copyReportUrl');
      button.textContent='Ссылка скопирована';
      setTimeout(()=>button.textContent='Копировать ссылку',1800);
    }catch(error){
      prompt('Скопируй ссылку:',location.href);
    }
  });
  load();
})();
