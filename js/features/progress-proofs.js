(function(){
  const config=window.RP_PROOF_SERVICE||{};
  const rules=window.RP_PROOF_RULES||{isRequired:()=>true};
  const uploadProgress=new Map();

  function configuredFileLimit(){
    const value=Number(config.maxFilesPerTask);
    return Number.isFinite(value)&&value>0?Math.floor(value):null;
  }

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function isServiceConfigured(){
    return typeof config.apiBase==='string'
      && /^https:\/\//i.test(config.apiBase)
      && !config.apiBase.includes('YOUR-RP-CABINET');
  }

  function currentContextKey(){
    return typeof progressContextKeyFor==='function' ? progressContextKeyFor(S) : '';
  }

  function ensureProofStore(){
    if(!S.proofsByContext || typeof S.proofsByContext!=='object' || Array.isArray(S.proofsByContext)) S.proofsByContext={};
    const key=currentContextKey();
    if(key && (!S.proofsByContext[key] || typeof S.proofsByContext[key]!=='object')) S.proofsByContext[key]={};
    return key ? S.proofsByContext[key] : {};
  }

  function reportStore(){
    if(!S.reportsByContext || typeof S.reportsByContext!=='object' || Array.isArray(S.reportsByContext)) S.reportsByContext={};
    return S.reportsByContext;
  }

  function proofFor(task){
    return ensureProofStore()[task]||{files:[]};
  }

  function ensureRoot(){
    const step=document.getElementById('progressStep');
    if(!step) return null;
    let root=document.getElementById('progressProofs');
    if(!root){
      root=document.createElement('section');
      root.id='progressProofs';
      root.className='progress-proofs';
      step.appendChild(root);
    }
    return root;
  }

  function authUser(){
    return window.CloudSync?.user||window.firebase?.auth?.().currentUser||null;
  }

  async function authToken(){
    const user=authUser();
    if(!user || typeof user.getIdToken!=='function') throw new Error('Сначала подключи Google в настройках профиля.');
    return user.getIdToken();
  }

  function imageSize(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const image=new Image();
      image.onload=()=>{
        const result={width:image.naturalWidth||0,height:image.naturalHeight||0};
        URL.revokeObjectURL(url);
        resolve(result);
      };
      image.onerror=()=>{
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось прочитать изображение.'));
      };
      image.src=url;
    });
  }

  function safeFilename(name){
    const cleaned=String(name||'screenshot')
      .normalize('NFKD')
      .replace(/[^\w.\-]+/g,'-')
      .replace(/-+/g,'-')
      .replace(/^-|-$/g,'')
      .slice(-100);
    return cleaned||'screenshot.png';
  }

  function currentShareUrl(id){
    const url=new URL('report.html',window.location.href);
    url.search='';
    url.hash='';
    url.searchParams.set('id',id);
    return url.href;
  }

  function fileMarkup(task,file,index){
    const dimensions=file.width&&file.height?`${file.width}×${file.height}`:'оригинальный размер';
    const activeReport=reportStore()[currentContextKey()];
    return `<article class="proof-file">
      <a href="${esc(file.url)}" target="_blank" rel="noopener">
        <img src="${esc(file.url)}" alt="${esc(file.name||'Скриншот')}" loading="lazy">
      </a>
      <div>
        <b>${esc(file.name||'Скриншот')}</b>
        <span>${esc(dimensions)} · без обрезки</span>
      </div>
      ${activeReport?'':`<button class="proof-icon-btn" type="button" data-proof-delete="${esc(task)}" data-file-index="${index}" aria-label="Удалить скриншот">×</button>`}
    </article>`;
  }

  function taskMarkup(task){
    const required=!!rules.isRequired(task,S);
    const proof=proofFor(task);
    const files=Array.isArray(proof.files)?proof.files:[];
    const progress=uploadProgress.get(task);
    const fileLimit=configuredFileLimit();
    const canUpload=isServiceConfigured()&&!!authUser()&&(fileLimit===null||files.length<fileLimit);
    const status=required
      ? (files.length?`Загружено: ${files.length}`:'Ожидает скриншот')
      :'Подтверждение не требуется';
    return `<article class="proof-task ${required?'needs-proof':'no-proof'} ${files.length?'has-proof':''}">
      <div class="proof-task-head">
        <div>
          <span class="proof-status">${esc(status)}</span>
          <h4>${esc(task)}</h4>
        </div>
        ${required?`<label class="proof-upload ${canUpload?'':'is-disabled'}">
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple data-proof-upload="${esc(task)}" ${canUpload?'':'disabled'}>
          <span>${progress!==undefined?`Загрузка ${Math.round(progress)}%`:(files.length?'Добавить ещё':'Загрузить скриншот')}</span>
        </label>`:'<span class="proof-done-mark">Выполнено</span>'}
      </div>
      ${files.length?`<div class="proof-files">${files.map((file,index)=>fileMarkup(task,file,index)).join('')}</div>`:''}
    </article>`;
  }

  function render(){
    const root=ensureRoot();
    if(!root) return;
    const allTasks=typeof tasks==='function'?tasks():[];
    const completed=allTasks.filter(task=>S.tasks?.[task]===true);
    const contextKey=currentContextKey();
    let report=contextKey?reportStore()[contextKey]:null;
    if(report && Number(report.expiresAt||0)<=Date.now()){
      delete reportStore()[contextKey];
      if(S.proofsByContext?.[contextKey]) delete S.proofsByContext[contextKey];
      report=null;
      queueMicrotask(()=>save());
    }
    const requiredCompleted=completed.filter(task=>rules.isRequired(task,S));
    const missing=requiredCompleted.filter(task=>!(proofFor(task).files||[]).length);
    const fullProgress=allTasks.length>0&&allTasks.every(task=>S.tasks?.[task]===true);
    const canGenerate=isServiceConfigured()&&!!authUser()&&fullProgress&&!missing.length&&!report;
    const serviceNote=!isServiceConfigured()
      ? 'Хранилище ещё не подключено. Интерфейс готов; после адреса Vercel загрузка включится без переделки панели.'
      : (!authUser()?'Для загрузки и удаления файлов подключи Google в настройках профиля.':'Оригиналы загружаются без сжатия и автоматически удаляются через 8 дней.');

    root.innerHTML=`<div class="proof-heading">
      <div>
        <span class="proof-eyebrow">Подтверждения прогресса</span>
        <h3>Скриншоты выполненных пунктов</h3>
      </div>
      <span class="proof-counter">${completed.length} из ${allTasks.length}</span>
    </div>
    <div class="proof-guidance ${isServiceConfigured()?'is-ready':'is-wait'}">
      <p class="proof-service-note">${esc(serviceNote)}</p>
      ${completed.length?'':'<p class="proof-empty">Сначала отметь выполненный пункт в прогрессе — он появится здесь.</p>'}
    </div>
    ${completed.length?`<div class="proof-task-list">${completed.map(taskMarkup).join('')}</div>`:''}
    <div class="proof-report-actions">
      <div>
        <h4>Единая ссылка для Discord</h4>
        <p>${report?'Сначала удали текущий отчёт, если нужно сформировать новый.':!fullProgress?'Ссылка станет доступна после выполнения всех пунктов.':missing.length?`Не хватает скриншотов: ${missing.length}.`:'Отчёт готов к формированию.'}</p>
      </div>
      <button class="btn" type="button" id="generateProofReport" ${canGenerate?'':'disabled'}>Сформировать отчёт</button>
    </div>
    ${report?`<div class="proof-report-ready">
      <div><span>Последний отчёт</span><a href="${esc(report.url||currentShareUrl(report.id))}" target="_blank" rel="noopener">${esc(report.url||currentShareUrl(report.id))}</a><small>Доступен до ${new Date(report.expiresAt).toLocaleString('ru-RU')}</small></div>
      <button class="btn soft" type="button" id="copyProofReport">Копировать</button>
      <button class="proof-delete-report" type="button" id="deleteProofReport">Удалить отчёт</button>
    </div>`:''}`;

    root.querySelectorAll('[data-proof-upload]').forEach(input=>{
      input.addEventListener('change',()=>uploadFiles(input.dataset.proofUpload,[...input.files]));
    });
    root.querySelectorAll('[data-proof-delete]').forEach(button=>{
      button.addEventListener('click',()=>deleteFile(button.dataset.proofDelete,Number(button.dataset.fileIndex)));
    });
    root.querySelector('#generateProofReport')?.addEventListener('click',generateReport);
    root.querySelector('#copyProofReport')?.addEventListener('click',()=>copyReportLink(report));
    root.querySelector('#deleteProofReport')?.addEventListener('click',()=>deleteReport(report));
  }

  async function uploadFiles(task,files){
    if(!files.length || uploadProgress.has(task)) return;
    if(!isServiceConfigured()) return showToast('Хранилище не подключено','Сначала укажи адрес Vercel в настройках proof-service');
    if(!window.RPProofUploader?.upload) return showToast('Модуль загрузки не готов','Проверь сборку Vercel Blob Client');
    const current=proofFor(task);
    const existing=Array.isArray(current.files)?current.files:[];
    const fileLimit=configuredFileLimit();
    const selected=fileLimit===null?files:files.slice(0,Math.max(0,fileLimit-existing.length));
    if(!selected.length) return showToast('Лимит достигнут',`Для одного пункта можно загрузить до ${fileLimit} файлов`);
    try{
      const token=await authToken();
      const user=authUser();
      const additions=[];
      for(let index=0;index<selected.length;index++){
        const file=selected[index];
        if(!/^image\/(png|jpeg|webp)$/i.test(file.type)) throw new Error('Разрешены PNG, JPG и WEBP.');
        if(file.size>Number(config.maxFileBytes||15728640)) throw new Error(`Файл ${file.name} больше 15 МБ.`);
        const dimensions=await imageSize(file);
        const pathname=`proofs/${user.uid}/drafts/${Date.now()}-${safeFilename(file.name)}`;
        const result=await window.RPProofUploader.upload(pathname,file,{
          access:'public',
          handleUploadUrl:`${config.apiBase}/api/upload`,
          clientPayload:JSON.stringify({firebaseToken:token,contextKey:currentContextKey(),task}),
          onUploadProgress:info=>{
            const overall=((index+(Number(info.percentage)||0)/100)/selected.length)*100;
            uploadProgress.set(task,overall);
            render();
          }
        });
        additions.push({
          id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url:result.url,
          downloadUrl:result.downloadUrl||result.url,
          pathname:result.pathname||pathname,
          name:file.name,
          type:file.type,
          size:file.size,
          width:dimensions.width,
          height:dimensions.height,
          uploadedAt:Date.now()
        });
      }
      const store=ensureProofStore();
      store[task]={files:[...existing,...additions],updatedAt:Date.now()};
      save();
      showToast(additions.length===1?'Скриншот загружен':'Скриншоты загружены',additions.length===1?'Сохранён оригинал без обрезки':`Сохранено файлов: ${additions.length}`);
    }catch(error){
      console.warn('Proof upload failed',error);
      showToast('Не удалось загрузить',String(error.message||error).slice(0,140));
    }finally{
      uploadProgress.delete(task);
      render();
    }
  }

  async function deleteFile(task,index){
    const proof=proofFor(task);
    const file=proof.files?.[index];
    if(!file) return;
    if(!confirm('Удалить этот скриншот без возможности восстановления?')) return;
    try{
      const token=await authToken();
      const response=await fetch(`${config.apiBase}/api/proofs/delete`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({url:file.url})
      });
      if(!response.ok) throw new Error((await response.json().catch(()=>null))?.error||'Сервис не удалил файл.');
      proof.files.splice(index,1);
      proof.updatedAt=Date.now();
      if(!proof.files.length) delete ensureProofStore()[task];
      save();
      showToast('Скриншот удалён','Файл удалён из хранилища');
    }catch(error){
      showToast('Не удалось удалить',String(error.message||error).slice(0,140));
    }
  }

  async function generateReport(){
    const contextKey=currentContextKey();
    const allTasks=tasks();
    try{
      const token=await authToken();
      const payload={
        contextKey,
        profile:{name:S.name,project:S.project,path:S.path,org:S.org,section:S.section,level:S.level},
        tasks:allTasks.map(title=>{
          const completed=S.tasks?.[title]===true;
          const required=!!rules.isRequired(title,S);
          return {title,completed,required,files:completed?(proofFor(title).files||[]):[]};
        })
      };
      const response=await fetch(`${config.apiBase}/api/reports`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify(payload)
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok) throw new Error(data?.error||'Не удалось сформировать отчёт.');
      const url=currentShareUrl(data.id);
      reportStore()[contextKey]={id:data.id,url,createdAt:data.createdAt,expiresAt:data.expiresAt};
      save();
      render();
      await navigator.clipboard?.writeText(url).catch(()=>{});
      showToast('Отчёт готов','Ссылка скопирована. Её можно отправить в Discord');
    }catch(error){
      showToast('Отчёт не создан',String(error.message||error).slice(0,140));
    }
  }

  async function copyReportLink(report){
    const url=report?.url||currentShareUrl(report?.id||'');
    try{
      await navigator.clipboard.writeText(url);
      showToast('Ссылка скопирована','Отправь её в Discord');
    }catch(error){
      prompt('Скопируй ссылку:',url);
    }
  }

  async function deleteReport(report){
    if(!report?.id || !confirm('Удалить весь отчёт и все его скриншоты?')) return;
    try{
      const token=await authToken();
      const response=await fetch(`${config.apiBase}/api/reports?id=${encodeURIComponent(report.id)}`,{
        method:'DELETE',
        headers:{'Authorization':`Bearer ${token}`}
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok) throw new Error(data?.error||'Сервис не удалил отчёт.');
      delete reportStore()[currentContextKey()];
      const store=ensureProofStore();
      Object.keys(store).forEach(task=>delete store[task]);
      save();
      render();
      showToast('Отчёт удалён','Ссылка и скриншоты больше недоступны');
    }catch(error){
      showToast('Не удалось удалить',String(error.message||error).slice(0,140));
    }
  }

  const previousRender=render;
  const appRender=window.render||globalThis.render;
  if(typeof appRender==='function'){
    const wrapped=function(){
      appRender();
      render();
    };
    try{globalThis.render=wrapped;}catch(error){}
  }
  document.addEventListener('DOMContentLoaded',render);
  render();
})();
