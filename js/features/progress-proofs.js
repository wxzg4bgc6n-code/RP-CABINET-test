(function(){
  'use strict';

  const config=window.RP_GOOGLE_DRIVE||{};
  const rules=window.RP_PROOF_RULES||{isRequired:()=>true};
  const uploadProgress=new Map();
  let reportGenerating=false;
  let driveConnecting=false;
  const COLLAPSED_GALLERIES_KEY='kiri:rp-cabinet:v82:collapsed-proof-galleries';
  const collapsedGalleries=new Set((()=>{
    try{
      const saved=JSON.parse(sessionStorage.getItem(COLLAPSED_GALLERIES_KEY)||'[]');
      return Array.isArray(saved)?saved.filter(value=>typeof value==='string'):[];
    }catch(error){
      return [];
    }
  })());

  function drive(){
    return window.GoogleDriveStorage||null;
  }

  function configuredFileLimit(){
    const value=Number(config.maxFilesPerTask);
    return Number.isFinite(value)&&value>0?Math.floor(value):null;
  }

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function currentContextKey(){
    return typeof progressContextKeyFor==='function'?progressContextKeyFor(S):'';
  }

  function ensureProofStore(){
    if(!S.proofsByContext||typeof S.proofsByContext!=='object'||Array.isArray(S.proofsByContext)) S.proofsByContext={};
    const key=currentContextKey();
    if(key&&(!S.proofsByContext[key]||typeof S.proofsByContext[key]!=='object')) S.proofsByContext[key]={};
    return key?S.proofsByContext[key]:{};
  }

  function reportStore(){
    if(!S.reportsByContext||typeof S.reportsByContext!=='object'||Array.isArray(S.reportsByContext)) S.reportsByContext={};
    return S.reportsByContext;
  }

  function proofFor(task){
    return ensureProofStore()[task]||{files:[]};
  }

  function galleryStateKey(task){
    return `${currentContextKey()}\u0000${String(task||'')}`;
  }

  function galleryId(task){
    const source=galleryStateKey(task);
    let hash=2166136261;
    for(let index=0;index<source.length;index++){
      hash^=source.charCodeAt(index);
      hash=Math.imul(hash,16777619);
    }
    return `proof-gallery-${(hash>>>0).toString(36)}`;
  }

  function isGalleryCollapsed(task){
    return collapsedGalleries.has(galleryStateKey(task));
  }

  function toggleGallery(task){
    const key=galleryStateKey(task);
    if(collapsedGalleries.has(key)) collapsedGalleries.delete(key);
    else collapsedGalleries.add(key);
    try{sessionStorage.setItem(COLLAPSED_GALLERIES_KEY,JSON.stringify([...collapsedGalleries]));}catch(error){}
    render();
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

  function currentShareUrl(id,resourceKey){
    const url=new URL('report.html',window.location.href);
    url.search='';
    url.hash='';
    url.searchParams.set('id',id);
    if(resourceKey) url.searchParams.set('rk',resourceKey);
    return url.href;
  }

  function fileUrl(file){
    if(file?.fileId&&drive()?.publicMediaUrl){
      try{return drive().publicMediaUrl(file);}catch(error){}
    }
    return String(file?.url||'');
  }

  function fileMarkup(task,file,index){
    const dimensions=file.width&&file.height?`${file.width}×${file.height}`:'оригинальный размер';
    const activeReport=reportStore()[currentContextKey()];
    const url=fileUrl(file);
    return `<article class="proof-file">
      <a href="${esc(url)}" target="_blank" rel="noopener">
        <img src="${esc(url)}" alt="${esc(file.name||'Скриншот')}" loading="lazy">
      </a>
      <div>
        <b>${esc(file.name||'Скриншот')}</b>
        <span>${esc(dimensions)} · Google Диск</span>
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
    const canUpload=!!authUser()&&!!drive()?.hasAccessToken()&&(fileLimit===null||files.length<fileLimit);
    const collapsed=files.length>0&&isGalleryCollapsed(task);
    const gallery=galleryId(task);
    const status=required
      ? (files.length?`Загружено: ${files.length}`:'Ожидает скриншот')
      :'Подтверждение не требуется';
    return `<article class="proof-task ${required?'needs-proof':'no-proof'} ${files.length?'has-proof':''}">
      <div class="proof-task-head">
        <div>
          <span class="proof-status">${esc(status)}</span>
          <h4>${esc(task)}</h4>
        </div>
        <div class="proof-task-actions">
          ${files.length?`<button class="proof-files-toggle" type="button" data-proof-toggle="${esc(task)}" aria-expanded="${collapsed?'false':'true'}" aria-controls="${gallery}">
            <span>${collapsed?'Показать скриншоты':'Скрыть скриншоты'}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5"></path></svg>
          </button>`:''}
          ${required?`<label class="proof-upload ${canUpload?'':'is-disabled'}">
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple data-proof-upload="${esc(task)}" ${canUpload?'':'disabled'}>
            <span>${progress!==undefined?`Загрузка ${Math.round(progress)}%`:(files.length?'Добавить ещё':'Загрузить скриншот')}</span>
          </label>`:'<span class="proof-done-mark">Выполнено</span>'}
        </div>
      </div>
      ${files.length?`<div class="proof-files${collapsed?' is-collapsed':''}" id="${gallery}" ${collapsed?'hidden':''}>${files.map((file,index)=>fileMarkup(task,file,index)).join('')}</div>`:''}
    </article>`;
  }

  function render(){
    const root=ensureRoot();
    if(!root) return;
    const allTasks=typeof tasks==='function'?tasks():[];
    const completed=allTasks.filter(task=>S.tasks?.[task]===true);
    const contextKey=currentContextKey();
    let report=contextKey?reportStore()[contextKey]:null;
    if(report&&report.provider!=='google-drive'){
      delete reportStore()[contextKey];
      report=null;
      queueMicrotask(()=>save());
    }
    if(report&&Number(report.expiresAt||0)<=Date.now()){
      delete reportStore()[contextKey];
      if(S.proofsByContext?.[contextKey]) delete S.proofsByContext[contextKey];
      report=null;
      queueMicrotask(()=>save());
    }
    const authenticated=!!authUser();
    const driveReady=!!drive()?.hasAccessToken();
    const requiredCompleted=completed.filter(task=>rules.isRequired(task,S));
    const missing=requiredCompleted.filter(task=>!(proofFor(task).files||[]).length);
    const fullProgress=allTasks.length>0&&allTasks.every(task=>S.tasks?.[task]===true);
    const canGenerate=authenticated&&driveReady&&fullProgress&&!missing.length&&!report&&!reportGenerating;
    const serviceNote=!authenticated
      ? 'Войди через Google: без аккаунта загрузка скриншотов отключена.'
      : !driveReady
        ? 'Разреши панели сохранять созданные ею файлы на твоём Google Диске.'
        : 'Файлы сохраняются на твоём Google Диске и удаляются панелью через 8 дней.';

    root.innerHTML=`<div class="proof-heading">
      <div>
        <span class="proof-eyebrow">Подтверждения прогресса</span>
        <h3>Скриншоты выполненных пунктов</h3>
      </div>
      <span class="proof-counter">${completed.length} из ${allTasks.length}</span>
    </div>
    <div class="proof-guidance ${driveReady?'is-ready':'is-wait'}">
      <p class="proof-drive-note">${esc(serviceNote)}</p>
      ${authenticated&&!driveReady?`<button class="btn proof-drive-connect" id="connectProofDrive" type="button" ${driveConnecting?'disabled':''}>${driveConnecting?'Подключаю…':'Подключить Google Диск'}</button>`:''}
      ${completed.length?'':'<p class="proof-empty">Сначала отметь выполненный пункт в прогрессе — он появится здесь.</p>'}
    </div>
    ${completed.length?`<div class="proof-task-list">${completed.map(taskMarkup).join('')}</div>`:''}
    <div class="proof-report-actions">
      <div>
        <h4>Единая ссылка для Discord</h4>
        <p>${report?'Сначала удали текущий отчёт, если нужно сформировать новый.':!fullProgress?'Ссылка станет доступна после выполнения всех пунктов.':missing.length?`Не хватает скриншотов: ${missing.length}.`:'Отчёт готов к формированию.'}</p>
      </div>
      <button class="btn" type="button" id="generateProofReport" ${canGenerate?'':'disabled'}>${reportGenerating?'Формирую отчёт…':'Сформировать отчёт'}</button>
    </div>
    ${report?`<div class="proof-report-ready">
      <div><span>Последний отчёт</span><a href="${esc(report.url||currentShareUrl(report.id,report.resourceKey))}" target="_blank" rel="noopener">${esc(report.url||currentShareUrl(report.id,report.resourceKey))}</a><small>Доступен до ${new Date(report.expiresAt).toLocaleString('ru-RU')}</small></div>
      <button class="btn soft" type="button" id="copyProofReport">Копировать</button>
      <button class="proof-delete-report" type="button" id="deleteProofReport">Удалить отчёт</button>
    </div>`:''}`;

    root.querySelector('#connectProofDrive')?.addEventListener('click',connectDrive);
    root.querySelectorAll('[data-proof-upload]').forEach(input=>{
      input.addEventListener('change',()=>uploadFiles(input.dataset.proofUpload,[...input.files]));
    });
    root.querySelectorAll('[data-proof-delete]').forEach(button=>{
      button.addEventListener('click',()=>deleteFile(button.dataset.proofDelete,Number(button.dataset.fileIndex)));
    });
    root.querySelectorAll('[data-proof-toggle]').forEach(button=>{
      button.addEventListener('click',()=>toggleGallery(button.dataset.proofToggle));
    });
    root.querySelector('#generateProofReport')?.addEventListener('click',generateReport);
    root.querySelector('#copyProofReport')?.addEventListener('click',()=>copyReportLink(report));
    root.querySelector('#deleteProofReport')?.addEventListener('click',()=>deleteReport(report));
  }

  async function connectDrive(){
    if(driveConnecting) return;
    driveConnecting=true;
    render();
    try{
      await drive().ensureAccessToken();
      await drive().ensureFolders();
      const cleanup=await drive().cleanupExpired().catch(()=>({deleted:0}));
      showToast('Google Диск подключён',cleanup.deleted?`Удалено старых файлов: ${cleanup.deleted}`:'Можно загружать скриншоты');
    }catch(error){
      showToast('Диск не подключён',String(error.message||error).slice(0,140));
    }finally{
      driveConnecting=false;
      render();
    }
  }

  async function uploadFiles(task,files){
    if(!files.length||uploadProgress.has(task)) return;
    const current=proofFor(task);
    const existing=Array.isArray(current.files)?current.files:[];
    const fileLimit=configuredFileLimit();
    const selected=fileLimit===null?files:files.slice(0,Math.max(0,fileLimit-existing.length));
    if(!selected.length) return showToast('Лимит достигнут',`Для одного пункта можно загрузить до ${fileLimit} файлов`);
    try{
      await drive().ensureAccessToken();
      const additions=[];
      for(let index=0;index<selected.length;index++){
        const file=selected[index];
        if(!/^image\/(png|jpeg|webp)$/i.test(file.type)) throw new Error('Разрешены PNG, JPG и WEBP.');
        if(file.size>Number(config.maxFileBytes||15728640)) throw new Error(`Файл ${file.name} больше 15 МБ.`);
        const dimensions=await imageSize(file);
        const addition=await drive().uploadProof(file,{
          name:`${Date.now()}-${safeFilename(file.name)}`,
          originalName:file.name,
          contextKey:currentContextKey(),
          task,
          width:dimensions.width,
          height:dimensions.height
        },percentage=>{
          const overall=((index+percentage/100)/selected.length)*100;
          uploadProgress.set(task,overall);
          render();
        });
        additions.push(addition);
      }
      const store=ensureProofStore();
      store[task]={files:[...existing,...additions],updatedAt:Date.now()};
      save();
      showToast(additions.length===1?'Скриншот загружен':'Скриншоты загружены',additions.length===1?'Сохранён на твоём Google Диске':`Сохранено файлов: ${additions.length}`);
    }catch(error){
      console.warn('Google Drive proof upload failed',error);
      showToast('Не удалось загрузить',String(error.message||error).slice(0,140));
    }finally{
      uploadProgress.delete(task);
      render();
    }
  }

  async function deleteFile(task,index){
    const proof=proofFor(task);
    const file=proof.files?.[index];
    if(!file||!confirm('Удалить этот скриншот без возможности восстановления?')) return;
    try{
      await drive().ensureAccessToken();
      if(file.fileId) await drive().deleteFile(file.fileId);
      proof.files.splice(index,1);
      proof.updatedAt=Date.now();
      if(!proof.files.length) delete ensureProofStore()[task];
      save();
      showToast('Скриншот удалён',file.fileId?'Файл окончательно удалён с Google Диска':'Старая запись удалена из панели');
    }catch(error){
      showToast('Не удалось удалить',String(error.message||error).slice(0,140));
    }
  }

  function reportFile(file){
    if(file?.fileId){
      return {
        provider:'google-drive',
        fileId:file.fileId,
        resourceKey:file.resourceKey||'',
        name:file.name||'Скриншот',
        type:file.type||'image/jpeg',
        size:Number(file.size||0),
        width:Number(file.width||0),
        height:Number(file.height||0)
      };
    }
    return {
      provider:'legacy',
      url:String(file?.url||''),
      name:file?.name||'Скриншот',
      width:Number(file?.width||0),
      height:Number(file?.height||0)
    };
  }

  async function generateReport(){
    if(reportGenerating) return;
    const contextKey=currentContextKey();
    const allTasks=tasks();
    reportGenerating=true;
    render();
    try{
      await drive().ensureAccessToken();
      const createdAt=Date.now();
      const expiresAt=createdAt+Number(config.reportLifetimeDays||8)*86400000;
      const avatar=S.account?.driveAvatar||null;
      const payload={
        createdAt,
        expiresAt,
        profile:{
          name:S.name,
          project:S.project,
          path:S.path,
          org:S.org,
          section:S.section,
          level:S.level,
          avatar:avatar?.fileId?{
            provider:'google-drive',
            fileId:avatar.fileId,
            resourceKey:avatar.resourceKey||''
          }:null,
          avatarUrl:avatar?.url||(typeof getGoogleProfilePhoto==='function'?getGoogleProfilePhoto():'')
        },
        tasks:allTasks.map(title=>{
          const completed=S.tasks?.[title]===true;
          const required=!!rules.isRequired(title,S);
          return {
            title,
            completed,
            required,
            files:completed?(proofFor(title).files||[]).map(reportFile):[]
          };
        })
      };
      const created=await drive().createReportManifest(payload);
      const url=currentShareUrl(created.id,created.resourceKey);
      reportStore()[contextKey]={...created,url};
      save();
      await navigator.clipboard?.writeText(url).catch(()=>{});
      showToast('Отчёт готов','Ссылка скопирована. Её можно отправить в Discord');
    }catch(error){
      console.warn('Drive report creation failed',error);
      showToast('Отчёт не создан',String(error.message||error).slice(0,140));
    }finally{
      reportGenerating=false;
      render();
    }
  }

  async function copyReportLink(report){
    const url=report?.url||currentShareUrl(report?.id||'',report?.resourceKey||'');
    try{
      await navigator.clipboard.writeText(url);
      showToast('Ссылка скопирована','Отправь её в Discord');
    }catch(error){
      prompt('Скопируй ссылку:',url);
    }
  }

  async function deleteReport(report){
    if(!report?.id||!confirm('Удалить весь отчёт и все его скриншоты?')) return;
    try{
      await drive().ensureAccessToken();
      if(report.provider==='google-drive') await drive().deleteFile(report.id).catch(error=>console.warn('Manifest delete failed',error));
      const store=ensureProofStore();
      const fileIds=new Set();
      Object.values(store).forEach(proof=>{
        (proof?.files||[]).forEach(file=>{if(file.fileId) fileIds.add(file.fileId);});
      });
      for(const fileId of fileIds) await drive().deleteFile(fileId).catch(error=>console.warn('Report proof delete failed',fileId,error));
      delete reportStore()[currentContextKey()];
      Object.keys(store).forEach(task=>delete store[task]);
      save();
      showToast('Отчёт удалён','Ссылка и скриншоты больше недоступны');
    }catch(error){
      showToast('Не удалось удалить',String(error.message||error).slice(0,140));
    }finally{
      render();
    }
  }

  const appRender=window.render||globalThis.render;
  if(typeof appRender==='function'){
    const wrapped=function(){
      appRender();
      render();
    };
    try{globalThis.render=wrapped;}catch(error){}
  }
  document.addEventListener('rp:drive-status',render);
  document.addEventListener('DOMContentLoaded',render);
  render();
})();
