(function(){
  'use strict';

  const config=window.RP_GOOGLE_DRIVE||{};
  const rules=window.RP_PROOF_RULES||{isRequired:()=>true};
  const uploadProgress=new Map();
  let reportGenerating=false;
  let driveConnecting=false;
  let bulkDeleting=false;
  let cleanupProcessing=false;
  let viewerInstalled=false;
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

  function reportTombstones(){
    if(!S.reportDeleteTombstones||typeof S.reportDeleteTombstones!=='object'||Array.isArray(S.reportDeleteTombstones)) S.reportDeleteTombstones={};
    return S.reportDeleteTombstones;
  }

  function cleanupQueue(){
    if(!S.driveCleanupQueue||typeof S.driveCleanupQueue!=='object'||Array.isArray(S.driveCleanupQueue)) S.driveCleanupQueue={};
    return S.driveCleanupQueue;
  }

  function queueReportCleanup(report,contextKey,fileIds){
    const reportId=String(report?.id||'').trim();
    if(!reportId) return null;
    const now=Date.now();
    reportTombstones()[reportId]={reportId,contextKey:String(contextKey||''),deletedAt:now};
    const id=`report:${reportId}`;
    cleanupQueue()[id]={
      id,
      contextKey:String(contextKey||''),
      reportId,
      fileIds:Array.from(new Set((fileIds||[]).map(value=>String(value||'').trim()).filter(Boolean))),
      createdAt:now,
      attempts:0,
      lastError:''
    };
    return id;
  }

  async function processCleanupQueue(){
    if(cleanupProcessing||!drive()?.hasAccessToken?.()) return;
    const queue=cleanupQueue();
    const entries=Object.entries(queue);
    if(!entries.length) return;
    cleanupProcessing=true;
    try{
      for(const [operationId,operation] of entries){
        const ids=Array.from(new Set([operation?.reportId,...(Array.isArray(operation?.fileIds)?operation.fileIds:[])]
          .map(value=>String(value||'').trim()).filter(Boolean)));
        let failed='';
        for(const fileId of ids){
          try{await drive().deleteFile(fileId);}
          catch(error){
            failed=String(error?.message||error||'Ошибка Google Drive').slice(0,180);
            console.warn('Background report cleanup failed',fileId,error);
            break;
          }
        }
        if(failed){
          const active=cleanupQueue()[operationId];
          if(active){
            active.attempts=Math.max(0,Number(active.attempts||0))+1;
            active.lastError=failed;
            save();
          }
          continue;
        }
        if(cleanupQueue()[operationId]){
          delete cleanupQueue()[operationId];
          save();
        }
      }
    }finally{
      cleanupProcessing=false;
    }
  }

  function proofFor(task){
    return ensureProofStore()[task]||{files:[]};
  }

  function allProofEntries(){
    return Object.entries(ensureProofStore()).flatMap(([task,proof])=>
      (Array.isArray(proof?.files)?proof.files:[]).map((file,index)=>({task,index,file}))
    );
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

  function loadProofImage(file){
    if(typeof createImageBitmap==='function'){
      return createImageBitmap(file).then(image=>({
        image,
        width:image.width||0,
        height:image.height||0,
        close:()=>image.close?.()
      })).catch(()=>loadProofImageElement(file));
    }
    return loadProofImageElement(file);
  }

  function loadProofImageElement(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const image=new Image();
      image.onload=()=>{
        resolve({
          image,
          width:image.naturalWidth||image.width||0,
          height:image.naturalHeight||image.height||0,
          close:()=>URL.revokeObjectURL(url)
        });
      };
      image.onerror=()=>{
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось прочитать изображение.'));
      };
      image.src=url;
    });
  }

  async function prepareProofImage(file){
    if(!/^image\/(png|jpeg|webp)$/i.test(file?.type||'')) throw new Error('Разрешены PNG, JPG и WEBP.');
    if(file.size>Number(config.maxFileBytes||15728640)) throw new Error(`Файл ${file.name} больше 15 МБ.`);
    const loaded=await loadProofImage(file);
    try{
      const sourceWidth=Math.max(1,loaded.width);
      const sourceHeight=Math.max(1,loaded.height);
      const maxDimension=Math.max(1280,Number(config.previewMaxDimension||2560));
      const ratio=Math.min(1,maxDimension/Math.max(sourceWidth,sourceHeight));
      const width=Math.max(1,Math.round(sourceWidth*ratio));
      const height=Math.max(1,Math.round(sourceHeight*ratio));
      const shouldOptimize=ratio<1||file.size>900*1024||file.type!=='image/webp';
      if(!shouldOptimize) return {blob:file,width,height,optimized:false};
      const canvas=document.createElement('canvas');
      canvas.width=width;
      canvas.height=height;
      const context=canvas.getContext('2d',{alpha:false});
      context.imageSmoothingEnabled=true;
      context.imageSmoothingQuality='high';
      context.drawImage(loaded.image,0,0,width,height);
      const optimized=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));
      const useOptimized=!!optimized&&(ratio<1||optimized.size<file.size*.96);
      return {
        blob:useOptimized?optimized:file,
        width:useOptimized?width:sourceWidth,
        height:useOptimized?height:sourceHeight,
        optimized:useOptimized
      };
    }finally{
      loaded.close?.();
    }
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

  function publicManifestUrl(id,resourceKey,publicKey){
    const key=window.RPDrivePublicKey?.normalize?.(publicKey)||'';
    if(!key) return '';
    const resourceKeyQuery=resourceKey?`&resourceKey=${encodeURIComponent(resourceKey)}`:'';
    return `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&key=${encodeURIComponent(key)}${resourceKeyQuery}`;
  }

  async function verifyPublicManifest(id,resourceKey,publicKey){
    const url=publicManifestUrl(id,resourceKey,publicKey);
    if(!url) return {ok:false,status:0};
    const waits=[0,500,1400,2600];
    let status=0;
    for(const wait of waits){
      if(wait) await new Promise(resolve=>setTimeout(resolve,wait));
      try{
        const response=await fetch(url,{cache:'no-store'});
        status=response.status;
        if(response.ok){
          const data=await response.json().catch(()=>null);
          if(data?.profile&&Array.isArray(data?.tasks)) return {ok:true,status};
          return {ok:false,status:422};
        }
        if(![403,404,429].includes(status)) break;
      }catch(error){
        status=0;
      }
    }
    return {ok:false,status};
  }

  function ensurePublicReportKey(){
    const helper=window.RPDrivePublicKey;
    if(!helper) throw new Error('Модуль публичной конфигурации отчётов не загрузился.');
    return typeof helper.require==='function'?helper.require():helper.get();
  }

  function fileUrl(file,size=1200){
    if(file?.fileId&&drive()?.previewUrl){
      try{return drive().previewUrl(file,size);}catch(error){}
    }
    if(file?.fileId&&drive()?.publicMediaUrl){
      try{return drive().publicMediaUrl(file);}catch(error){}
    }
    return String(file?.url||'');
  }

  function fileMarkup(task,file,index){
    const dimensions=file.width&&file.height?`${file.width}×${file.height}`:'оригинальный размер';
    const url=fileUrl(file,720);
    return `<article class="proof-file">
      <button class="proof-preview" type="button" data-proof-view="${esc(task)}"
        data-file-index="${index}" aria-label="Открыть скриншот на весь экран">
        <img src="${esc(url)}" alt="${esc(file.name||'Скриншот')}" loading="lazy">
      </button>
      <div>
        <b>${esc(file.name||'Скриншот')}</b>
        <span>${esc(dimensions)} · Google Диск</span>
      </div>
      <button class="proof-icon-btn" type="button" data-proof-delete="${esc(task)}"
        data-file-index="${index}" aria-label="Удалить скриншот" ${bulkDeleting?'disabled':''}>×</button>
    </article>`;
  }

  function ensureViewer(){
    if(viewerInstalled&&document.getElementById('proofViewer')) return;
    viewerInstalled=true;
    document.body.insertAdjacentHTML('beforeend',`<div class="proof-viewer" id="proofViewer" role="dialog"
      aria-modal="true" aria-label="Полноэкранный просмотр скриншота">
      <button class="proof-viewer-close" id="proofViewerClose" type="button" aria-label="Закрыть">×</button>
      <div class="proof-viewer-stage">
        <img id="proofViewerImage" alt="Скриншот">
        <span id="proofViewerName"></span>
      </div>
    </div>`);
    const viewer=document.getElementById('proofViewer');
    document.getElementById('proofViewerClose')?.addEventListener('click',closeViewer);
    viewer?.addEventListener('click',event=>{if(event.target===viewer) closeViewer();});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&viewer?.classList.contains('open')) closeViewer();
    });
  }

  function openViewer(task,index){
    const file=proofFor(task).files?.[index];
    if(!file) return;
    ensureViewer();
    const viewer=document.getElementById('proofViewer');
    const image=document.getElementById('proofViewerImage');
    const name=document.getElementById('proofViewerName');
    const source=fileUrl(file,2400);
    if(image){
      image.alt=file.name||'Скриншот';
      image.onerror=()=>{
        let fallback=String(file?.url||'');
        if(file.fileId&&drive()?.publicMediaUrl){
          try{fallback=drive().publicMediaUrl(file)||fallback;}catch(error){}
        }
        if(fallback&&image.src!==fallback) image.src=fallback;
      };
      image.src=source;
    }
    if(name) name.textContent=file.name||'Скриншот';
    viewer?.classList.add('open');
    document.body.classList.add('proof-viewer-open');
  }

  function closeViewer(){
    document.getElementById('proofViewer')?.classList.remove('open');
    document.body.classList.remove('proof-viewer-open');
  }

  function updateUploadProgressLabel(task,percentage,text){
    const input=[...document.querySelectorAll('[data-proof-upload]')]
      .find(node=>node.dataset.proofUpload===task);
    const label=input?.closest('.proof-upload')?.querySelector('span');
    if(label) label.textContent=text||`Загрузка ${Math.round(percentage)}%`;
  }

  function taskMarkup(task){
    const required=!!rules.isRequired(task,S);
    const proof=proofFor(task);
    const files=Array.isArray(proof.files)?proof.files:[];
    const progress=uploadProgress.get(task);
    const fileLimit=configuredFileLimit();
    const driveAvailable=!!drive()?.hasAccessToken()||!!drive()?.hasRememberedGrant?.();
    const canUpload=!bulkDeleting&&!!authUser()&&driveAvailable&&(fileLimit===null||files.length<fileLimit);
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
    if(report&&reportTombstones()[String(report.id||'')]){
      delete reportStore()[contextKey];
      report=null;
      queueMicrotask(()=>save());
    }
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
    const driveRemembered=!!drive()?.hasRememberedGrant?.();
    const driveAvailable=driveReady||driveRemembered;
    const proofEntries=allProofEntries();
    const requiredCompleted=completed.filter(task=>rules.isRequired(task,S));
    const missing=requiredCompleted.filter(task=>!(proofFor(task).files||[]).length);
    const fullProgress=allTasks.length>0&&allTasks.every(task=>S.tasks?.[task]===true);
    const canGenerate=authenticated&&driveAvailable&&fullProgress&&!missing.length&&!report&&!reportGenerating;
    const serviceNote=!authenticated
      ? 'Войди через Google: без аккаунта загрузка скриншотов отключена.'
      : !driveAvailable
        ? 'Разреши панели сохранять созданные ею файлы на твоём Google Диске.'
        : !driveReady
          ? 'Google Диск подключён. Короткий доступ обновится при следующей операции с файлами.'
        : 'Файлы сохраняются на твоём Google Диске и удаляются панелью через 8 дней.';

    root.innerHTML=`<div class="proof-heading">
      <div>
        <span class="proof-eyebrow">Подтверждения прогресса</span>
        <h3>Скриншоты выполненных пунктов</h3>
      </div>
      <div class="proof-heading-actions">
        <span class="proof-counter">${completed.length} из ${allTasks.length}</span>
        ${proofEntries.length?`<button class="proof-delete-all" id="deleteAllProofs" type="button" ${bulkDeleting?'disabled':''}>
          ${bulkDeleting?'Удаляю…':`Удалить все скриншоты · ${proofEntries.length}`}
        </button>`:''}
      </div>
    </div>
    <div class="proof-guidance ${driveAvailable?'is-ready':'is-wait'}">
      <p class="proof-drive-note">${esc(serviceNote)}</p>
      ${authenticated&&!driveAvailable?`<button class="btn proof-drive-connect" id="connectProofDrive" type="button" ${driveConnecting?'disabled':''}>${driveConnecting?'Подключаю…':'Подключить Google Диск'}</button>`:''}
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
      <div><span>Последний отчёт</span><a href="${esc(currentShareUrl(report.id,report.resourceKey))}" target="_blank" rel="noopener">${esc(currentShareUrl(report.id,report.resourceKey))}</a><small>Доступен до ${new Date(report.expiresAt).toLocaleString('ru-RU')}</small></div>
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
    root.querySelectorAll('[data-proof-view]').forEach(button=>{
      button.addEventListener('click',()=>openViewer(button.dataset.proofView,Number(button.dataset.fileIndex)));
    });
    root.querySelectorAll('[data-proof-toggle]').forEach(button=>{
      button.addEventListener('click',()=>toggleGallery(button.dataset.proofToggle));
    });
    root.querySelector('#generateProofReport')?.addEventListener('click',generateReport);
    root.querySelector('#copyProofReport')?.addEventListener('click',()=>copyReportLink(report));
    root.querySelector('#deleteProofReport')?.addEventListener('click',()=>deleteReport(report));
    root.querySelector('#deleteAllProofs')?.addEventListener('click',deleteAllProofs);
  }

  async function connectDrive(){
    if(driveConnecting) return;
    driveConnecting=true;
    render();
    try{
      await drive().ensureAccessToken();
      await drive().ensureFolders();
      const cleanup=await drive().cleanupExpired().catch(()=>({deleted:0}));
      await processCleanupQueue();
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
    uploadProgress.set(task,0);
    render();
    try{
      await drive().ensureAccessToken();
      const additions=[];
      const savedFiles=[...existing];
      for(let index=0;index<selected.length;index++){
        const file=selected[index];
        updateUploadProgressLabel(task,0,`Подготовка ${index+1} из ${selected.length}`);
        const prepared=await prepareProofImage(file);
        const uploadName=prepared.optimized
          ? `${Date.now()}-${safeFilename(file.name).replace(/\.[^.]+$/, '')}.webp`
          : `${Date.now()}-${safeFilename(file.name)}`;
        const addition=await drive().uploadProof(prepared.blob,{
          name:uploadName,
          originalName:file.name,
          contextKey:currentContextKey(),
          task,
          width:prepared.width,
          height:prepared.height
        },percentage=>{
          const overall=((index+percentage/100)/selected.length)*100;
          uploadProgress.set(task,overall);
          updateUploadProgressLabel(task,overall);
        });
        additions.push(addition);
        savedFiles.push(addition);
        ensureProofStore()[task]={files:[...savedFiles],updatedAt:Date.now()};
        save();
        render();
      }
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
    const contextKey=currentContextKey();
    const report=contextKey?reportStore()[contextKey]:null;
    const warning=report
      ? 'Удалить этот скриншот и активный отчёт? Публичная ссылка перестанет работать.'
      : 'Удалить этот скриншот без возможности восстановления?';
    if(!file||!confirm(warning)) return;
    try{
      await drive().ensureAccessToken();
      if(report?.provider==='google-drive'&&report.id){
        await drive().deleteFile(report.id);
        delete reportStore()[contextKey];
        save();
      }
      if(file.fileId) await drive().deleteFile(file.fileId);
      if(report) delete reportStore()[contextKey];
      proof.files.splice(index,1);
      proof.updatedAt=Date.now();
      if(!proof.files.length) delete ensureProofStore()[task];
      save();
      showToast('Скриншот удалён',report?'Файл удалён, публичный отчёт отключён':file.fileId?'Файл окончательно удалён с Google Диска':'Старая запись удалена из панели');
    }catch(error){
      const removeLocal=confirm(
        'Google Диск не подтвердил удаление. Убрать эту запись только из панели?\n\n'+
        'Если файл ещё есть на Диске, он останется там.'
      );
      if(removeLocal){
        proof.files.splice(index,1);
        proof.updatedAt=Date.now();
        if(!proof.files.length) delete ensureProofStore()[task];
        save();
        showToast('Запись убрана из панели','Удаление файла на Google Диске не подтверждено');
      }else{
        showToast('Не удалось удалить',String(error.message||error).slice(0,140));
      }
    }finally{
      render();
    }
  }

  async function deleteAllProofs(){
    if(bulkDeleting) return;
    const contextKey=currentContextKey();
    const entries=allProofEntries();
    const report=contextKey?reportStore()[contextKey]:null;
    if(!entries.length) return showToast('Скриншотов нет','Удалять нечего');
    const warning=report
      ? `Удалить все скриншоты (${entries.length}) и активный отчёт? Публичная ссылка перестанет работать.`
      : `Удалить все скриншоты (${entries.length}) без возможности восстановления?`;
    if(!confirm(warning)) return;
    bulkDeleting=true;
    render();
    try{
      await drive().ensureAccessToken();
      if(report?.provider==='google-drive'&&report.id){
        await drive().deleteFile(report.id);
        delete reportStore()[contextKey];
        save();
      }
      const results=new Map();
      let cursor=0;
      const workers=Array.from({length:Math.min(4,entries.length)},async()=>{
        while(cursor<entries.length){
          const entry=entries[cursor++];
          if(!entry.file?.fileId){
            results.set(entry,true);
            continue;
          }
          try{
            await drive().deleteFile(entry.file.fileId);
            results.set(entry,true);
          }catch(error){
            console.warn('Bulk proof delete failed',entry.file.fileId,error);
            results.set(entry,false);
          }
        }
      });
      await Promise.all(workers);
      const store=ensureProofStore();
      Object.entries(store).forEach(([task,proof])=>{
        const taskEntries=entries.filter(entry=>entry.task===task);
        const failedIds=new Set(taskEntries
          .filter(entry=>results.get(entry)===false)
          .map(entry=>String(entry.file?.fileId||entry.index)));
        const remaining=(proof?.files||[]).filter((file,index)=>
          failedIds.has(String(file?.fileId||index))
        );
        if(remaining.length) store[task]={files:remaining,updatedAt:Date.now()};
        else delete store[task];
      });
      save();
      const deleted=[...results.values()].filter(Boolean).length;
      const failed=entries.length-deleted;
      showToast(
        failed?'Удалено не всё':'Все скриншоты удалены',
        failed?`Удалено: ${deleted}. Не удалось удалить: ${failed}.`:`Удалено файлов с Google Диска: ${deleted}`
      );
    }catch(error){
      const removeLocal=confirm(
        'Google Диск не подтвердил удаление. Убрать все записи только из панели?\n\n'+
        'Файлы и публичный отчёт, если они ещё есть на Диске, могут продолжить работать.'
      );
      if(removeLocal){
        const store=ensureProofStore();
        Object.keys(store).forEach(task=>delete store[task]);
        if(report) delete reportStore()[contextKey];
        save();
        showToast('Записи очищены','Удаление файлов на Google Диске не подтверждено');
      }else{
        showToast('Удаление не выполнено',String(error.message||error).slice(0,140));
      }
    }finally{
      bulkDeleting=false;
      render();
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
          avatarUrl:avatar?.url||(typeof getGoogleProfilePhoto==='function'?getGoogleProfilePhoto():''),
          fallbackAvatarUrl:typeof getFallbackGooglePhoto==='function'?getFallbackGooglePhoto():''
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
      const publicKey=ensurePublicReportKey();
      const created=await drive().createReportManifest(payload);
      const check=await verifyPublicManifest(created.id,created.resourceKey,publicKey);
      if(!check.ok){
        await drive().deleteFile(created.id).catch(()=>{});
        if(check.status===403) throw new Error('Google отклонил публичный API key. Проверь ограничения ключа и домен GitHub Pages.');
        if(check.status===404) throw new Error('Google ещё не опубликовал файл отчёта. Повтори формирование через несколько секунд.');
        throw new Error('Публичная ссылка не прошла проверку. Отчёт не сохранён.');
      }
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
    if(!report?.id) return;
    try{
      const publicKey=ensurePublicReportKey();
      const check=await verifyPublicManifest(report.id,report.resourceKey||'',publicKey);
      if(!check.ok) throw new Error('Публичная ссылка не прошла проверку. Сформируй отчёт заново.');
      const url=currentShareUrl(report.id,report.resourceKey||'');
      report.url=url;
      save();
      try{
        await navigator.clipboard.writeText(url);
        showToast('Ссылка скопирована','Отправь её в Discord');
      }catch(error){
        prompt('Скопируй ссылку:',url);
      }
    }catch(error){
      showToast('Ссылка не скопирована',String(error.message||error).slice(0,140));
    }
  }

  function deleteReport(report){
    if(!report?.id||!confirm('Удалить весь отчёт и все его скриншоты?')) return;
    const contextKey=currentContextKey();
    const store=ensureProofStore();
    const fileIds=new Set();
    Object.values(store).forEach(proof=>{
      (proof?.files||[]).forEach(file=>{if(file?.fileId) fileIds.add(file.fileId);});
    });

    /* v108: сначала сразу убираем отчёт и скриншоты из канонического состояния.
     * Удаление Google Drive выполняется отдельно, чтобы интерфейс и Firebase
     * не ждали сеть. Tombstone не позволяет старой вкладке вернуть удалённый отчёт. */
    queueReportCleanup(report,contextKey,[...fileIds]);
    delete reportStore()[contextKey];
    if(S.proofsByContext?.[contextKey]) delete S.proofsByContext[contextKey];
    save();
    render();
    showToast('Отчёт удалён из панели','Google Drive очищается в фоне');
    queueMicrotask(()=>processCleanupQueue());
  }

  const appRender=window.render||globalThis.render;
  if(typeof appRender==='function'){
    const wrapped=function(){
      appRender();
      render();
    };
    try{globalThis.render=wrapped;}catch(error){}
  }
  document.addEventListener('rp:drive-status',()=>{render();queueMicrotask(()=>processCleanupQueue());});
  document.addEventListener('DOMContentLoaded',()=>{render();queueMicrotask(()=>processCleanupQueue());});
  render();
  queueMicrotask(()=>processCleanupQueue());
})();
