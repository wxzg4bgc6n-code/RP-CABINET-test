(function(){
  'use strict';

  const config=window.RP_GOOGLE_DRIVE||{};
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
    state.innerHTML=`<div class="report-loader"></div><h2>${attempt>1?'Повторно загружаю отчёт':'Загружаю отчёт'}</h2><p>${attempt>1?'Google Диск не ответил сразу — выполняю ещё одну попытку.':'Проверяю данные и открываю скриншоты.'}</p>`;
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

  async function fetchWithTimeout(url,timeoutMs=12000){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      return await fetch(url,{cache:'no-store',signal:controller.signal});
    }finally{
      clearTimeout(timeout);
    }
  }

  function publicApiKey(){
    return String(window.RPDrivePublicKey?.get?.()||config.apiKey||'').trim();
  }

  function driveMediaUrl(file){
    if(file?.provider!=='google-drive'||!file.fileId) return String(file?.url||'');
    const key=publicApiKey();
    if(!key) return '';
    const resourceKey=file.resourceKey?`&resourceKey=${encodeURIComponent(file.resourceKey)}`:'';
    return `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.fileId)}?alt=media&key=${encodeURIComponent(key)}${resourceKey}`;
  }

  function driveThumbnailUrl(file,size=1200){
    if(file?.provider!=='google-drive'||!file.fileId) return String(file?.url||'');
    const width=Math.max(128,Math.min(2400,Math.round(Number(size)||1200)));
    const url=new URL('https://drive.google.com/thumbnail');
    url.searchParams.set('id',String(file.fileId));
    url.searchParams.set('sz',`w${width}`);
    if(file.resourceKey) url.searchParams.set('resourcekey',String(file.resourceKey));
    return url.href;
  }

  function manifestUrl(id,resourceKey){
    return driveMediaUrl({provider:'google-drive',fileId:id,resourceKey});
  }

  function fileCard(file){
    const size=file.width&&file.height?`${file.width}×${file.height}`:'исходный размер';
    const thumbnail=driveThumbnailUrl(file,1100);
    const fullscreen=driveThumbnailUrl(file,2400);
    const fallback=driveMediaUrl(file);
    return `<figure class="report-proof">
      <button class="report-image-open" type="button" data-report-image="${esc(fullscreen)}"
        data-report-image-fallback="${esc(fallback)}"
        data-report-image-name="${esc(file.name||'Скриншот подтверждения')}" title="Открыть изображение">
        <span class="report-image-loader" aria-hidden="true"></span>
        <img src="${esc(thumbnail)}" data-report-fallback="${esc(fallback)}"
          alt="${esc(file.name||'Скриншот подтверждения')}" loading="lazy" decoding="async">
      </button>
      <figcaption><b>${esc(file.name||'Скриншот')}</b><span>${esc(size)} · нажми для увеличения</span></figcaption>
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
    const candidates=[
      profile?.avatar?.fileId?driveThumbnailUrl(profile.avatar,512):'',
      profile?.avatar?.fileId?driveMediaUrl(profile.avatar):'',
      String(profile?.fallbackAvatarUrl||'').trim(),
      String(profile?.avatarUrl||'').trim()
    ].filter((url,index,list)=>/^https:\/\//i.test(url)&&list.indexOf(url)===index);
    if(!candidates.length) return;
    const image=document.createElement('img');
    image.alt=`Аватар ${profile?.name||'профиля'}`;
    image.referrerPolicy='no-referrer';
    image.decoding='async';
    let candidateIndex=0;
    image.addEventListener('error',()=>{
      candidateIndex+=1;
      if(candidates[candidateIndex]){
        image.src=candidates[candidateIndex];
        return;
      }
      avatar.replaceChildren(fallback);
    });
    image.src=candidates[0];
    avatar.replaceChildren(image);
  }

  function ensureLightbox(){
    let box=document.getElementById('reportLightbox');
    if(box) return box;
    box=document.createElement('div');
    box.id='reportLightbox';
    box.className='report-lightbox';
    box.hidden=true;
    box.innerHTML='<button class="report-lightbox-close" type="button" aria-label="Закрыть">×</button><img alt=""><span></span>';
    box.addEventListener('click',event=>{
      if(event.target===box||event.target.closest('.report-lightbox-close')) closeLightbox();
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape') closeLightbox();});
    document.body.appendChild(box);
    return box;
  }

  function openLightbox(url,name,fallbackUrl){
    const box=ensureLightbox();
    const image=box.querySelector('img');
    image.onerror=()=>{
      if(fallbackUrl&&image.src!==fallbackUrl) image.src=fallbackUrl;
    };
    image.src=url;
    image.alt=name||'Скриншот';
    box.querySelector('span').textContent=name||'Скриншот';
    box.hidden=false;
    document.body.classList.add('report-lightbox-open');
  }

  function closeLightbox(){
    const box=document.getElementById('reportLightbox');
    if(!box||box.hidden) return;
    box.hidden=true;
    box.querySelector('img').removeAttribute('src');
    document.body.classList.remove('report-lightbox-open');
  }

  function render(report){
    const profile=report.profile||{};
    finishLoading();
    setReportView(false);
    state.classList.remove('is-error');
    renderProfileAvatar(profile);
    document.title=`${profile.name||'Игрок'} · отчёт о прогрессе`;
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
    content.querySelectorAll('.report-proof img').forEach(image=>{
      image.addEventListener('load',()=>image.closest('.report-image-open')?.classList.add('is-loaded'),{once:true});
      image.addEventListener('error',()=>{
        const fallback=image.dataset.reportFallback;
        if(fallback&&image.src!==fallback){
          image.src=fallback;
          return;
        }
        image.closest('.report-image-open')?.classList.add('is-error');
      });
      if(image.complete&&image.naturalWidth) image.closest('.report-image-open')?.classList.add('is-loaded');
    });
    content.querySelectorAll('[data-report-image]').forEach(button=>{
      button.addEventListener('click',()=>openLightbox(
        button.dataset.reportImage,
        button.dataset.reportImageName,
        button.dataset.reportImageFallback
      ));
    });
  }

  async function load(){
    const sequence=++loadSequence;
    const params=new URLSearchParams(location.search);
    const id=params.get('id')||'';
    const resourceKey=params.get('rk')||'';
    if(!/^[a-zA-Z0-9_-]{10,200}$/.test(id)) return showError('Неверная ссылка','В адресе нет корректного номера отчёта.');
    if(!publicApiKey()) return showError('Ключ отчёта отсутствует','Ссылка создана старой версией без параметра публичного ключа. Сформируй отчёт заново в панели.');
    let lastError=null;
    for(let attempt=1;attempt<=2;attempt++){
      if(sequence!==loadSequence) return;
      showLoading(attempt);
      try{
        const response=await fetchWithTimeout(manifestUrl(id,resourceKey));
        if(sequence!==loadSequence) return;
        if(response.status===404) return showError('Отчёт не найден','Файл удалён владельцем или ссылка уже недоступна.');
        if(response.status===403) return showError('Нет доступа к отчёту','Google отклонил публичный ключ этой ссылки либо владелец удалил доступ к файлу. Сформируй ссылку заново в актуальной версии панели.');
        if(!response.ok) throw new Error(`Google Drive ответил ${response.status}.`);
        const data=await response.json();
        if(Number(data?.expiresAt||0)<=Date.now()) return showError('Срок отчёта закончился','Прошло 8 дней, поэтому ссылка и скриншоты больше не доступны.');
        if(!Array.isArray(data?.tasks)||!data?.profile) throw new Error('Файл отчёта повреждён.');
        return render(data);
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
      timedOut?'Google Диск не ответил вовремя':'Не удалось открыть отчёт',
      timedOut?'Google Диск дважды не ответил за отведённое время. Попробуй ещё раз.':'Проверь интернет и повтори открытие ссылки.'
    );
  }

  document.getElementById('copyReportUrl')?.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      const button=document.getElementById('copyReportUrl');
      button.textContent='Ссылка скопирована';
      setTimeout(()=>button.textContent='Копировать ссылку',1400);
    }catch(error){}
  });

  window.loadRPReport=load;
  load();
})();
