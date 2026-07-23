(function(){
  const config=window.RP_PROOF_SERVICE||{};
  const state=document.getElementById('reportState');
  const content=document.getElementById('reportContent');

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function showError(title,message){
    state.innerHTML=`<div class="report-error-mark">!</div><h2>${esc(title)}</h2><p>${esc(message)}</p>`;
    state.classList.add('is-error');
    content.hidden=true;
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

  function render(report){
    const profile=report.profile||{};
    state.hidden=true;
    content.hidden=false;
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
    <section class="report-task-list">${(report.tasks||[]).map(taskCard).join('')}</section>`;
  }

  async function load(){
    const id=new URLSearchParams(location.search).get('id')||'';
    if(!/^[a-f0-9]{36}$/i.test(id)) return showError('Неверная ссылка','В адресе нет корректного номера отчёта.');
    if(!/^https:\/\//i.test(config.apiBase||'') || String(config.apiBase).includes('YOUR-RP-CABINET')){
      return showError('Хранилище ещё не подключено','Адрес сервиса Vercel будет добавлен после первого развёртывания.');
    }
    try{
      const response=await fetch(`${config.apiBase}/api/reports?id=${encodeURIComponent(id)}`,{cache:'no-store'});
      const data=await response.json().catch(()=>null);
      if(response.status===410) return showError('Срок отчёта закончился','Прошло 8 дней, поэтому ссылка и скриншоты удалены.');
      if(!response.ok) return showError('Отчёт не найден',data?.error||'Возможно, владелец удалил его вручную.');
      render(data);
    }catch(error){
      showError('Не удалось открыть отчёт','Проверь интернет и доступность сервиса без VPN.');
    }
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
