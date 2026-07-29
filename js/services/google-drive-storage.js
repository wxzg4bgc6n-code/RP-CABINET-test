(function(){
  'use strict';

  const config=window.RP_GOOGLE_DRIVE||{};
  const API='https://www.googleapis.com/drive/v3';
  const UPLOAD='https://www.googleapis.com/upload/drive/v3';
  const TOKEN_KEY='kiri:rp-cabinet:v93:drive-token';
  const FOLDER_KEY='kiri:rp-cabinet:v93:drive-folders';
  let accessToken='';
  let accessTokenUid='';
  let accessTokenExpiresAt=0;
  let folders=null;
  let authorizing=null;
  let cleanupRunning=null;
  const previewObjects=new Map();
  const PREVIEW_CACHE_LIMIT=30;

  function authUser(){
    return window.CloudSync?.user||window.firebase?.auth?.().currentUser||null;
  }

  function emitStatus(){
    try{document.dispatchEvent(new CustomEvent('rp:drive-status'));}catch(error){}
  }

  function readSession(){
    try{
      const saved=JSON.parse(sessionStorage.getItem(TOKEN_KEY)||'null');
      if(saved&&typeof saved.token==='string'&&Number(saved.expiresAt)>Date.now()+30000){
        accessToken=saved.token;
        accessTokenUid=String(saved.uid||'');
        accessTokenExpiresAt=Number(saved.expiresAt);
      }
      const cached=JSON.parse(sessionStorage.getItem(FOLDER_KEY)||'null');
      if(cached&&typeof cached==='object') folders=cached;
    }catch(error){}
  }

  function writeToken(){
    try{
      sessionStorage.setItem(TOKEN_KEY,JSON.stringify({
        token:accessToken,
        uid:accessTokenUid,
        expiresAt:accessTokenExpiresAt
      }));
    }catch(error){}
  }

  function clearToken(){
    accessToken='';
    accessTokenUid='';
    accessTokenExpiresAt=0;
    try{sessionStorage.removeItem(TOKEN_KEY);}catch(error){}
    emitStatus();
  }

  function setAccessToken(token,uid,expiresInSeconds=3600){
    accessToken=String(token||'');
    accessTokenUid=String(uid||authUser()?.uid||'');
    accessTokenExpiresAt=Date.now()+Math.max(60,Number(expiresInSeconds)||3600)*1000-30000;
    writeToken();
    emitStatus();
    if(accessToken) queueMicrotask(()=>cleanupExpired().catch(()=>{}));
    return accessToken;
  }

  function hasAccessToken(){
    const user=authUser();
    if(!user||!accessToken||accessTokenExpiresAt<=Date.now()+5000) return false;
    return !accessTokenUid||accessTokenUid===user.uid;
  }

  async function ensureAccessToken(){
    if(hasAccessToken()) return accessToken;
    if(authorizing) return authorizing;
    if(!authUser()) throw new Error('Сначала войди через Google в настройках профиля.');
    if(!window.CloudSync?.authorizeDrive) throw new Error('Модуль Google Диска ещё не готов.');
    authorizing=Promise.resolve(window.CloudSync.authorizeDrive())
      .then(token=>{
        if(!token) throw new Error('Google Диск не предоставил разрешение.');
        return token;
      })
      .finally(()=>{authorizing=null;});
    return authorizing;
  }

  function apiKey(){
    const value=String(config.apiKey||'').trim();
    if(!value) throw new Error('В конфигурации не указан Google API key.');
    return value;
  }

  function resourceKeyQuery(resourceKey){
    const value=String(resourceKey||'').trim();
    return value?`&resourceKey=${encodeURIComponent(value)}`:'';
  }

  function publicMediaUrl(fileOrId,resourceKey){
    const file=typeof fileOrId==='object'&&fileOrId?fileOrId:{fileId:fileOrId,resourceKey};
    const id=String(file.fileId||file.id||'').trim();
    if(!id) return '';
    return `${API}/files/${encodeURIComponent(id)}?alt=media&key=${encodeURIComponent(apiKey())}${resourceKeyQuery(file.resourceKey)}`;
  }

  function publicThumbnailUrl(fileOrId,size=1200){
    const file=typeof fileOrId==='object'&&fileOrId?fileOrId:{fileId:fileOrId};
    const id=String(file.fileId||file.id||'').trim();
    if(!id) return '';
    const width=Math.max(128,Math.min(2400,Math.round(Number(size)||1200)));
    const url=new URL('https://drive.google.com/thumbnail');
    url.searchParams.set('id',id);
    url.searchParams.set('sz',`w${width}`);
    if(file.resourceKey) url.searchParams.set('resourcekey',String(file.resourceKey));
    return url.href;
  }

  function rememberPreview(fileId,blob){
    const id=String(fileId||'').trim();
    if(!id||!(blob instanceof Blob)) return '';
    forgetPreview(id);
    const url=URL.createObjectURL(blob);
    previewObjects.set(id,url);
    while(previewObjects.size>PREVIEW_CACHE_LIMIT){
      const oldest=previewObjects.keys().next().value;
      forgetPreview(oldest);
    }
    return url;
  }

  function forgetPreview(fileId){
    const id=String(fileId||'').trim();
    const url=previewObjects.get(id);
    if(url){
      URL.revokeObjectURL(url);
      previewObjects.delete(id);
    }
  }

  function previewUrl(fileOrId,size=1200){
    const file=typeof fileOrId==='object'&&fileOrId?fileOrId:{fileId:fileOrId};
    const id=String(file.fileId||file.id||'').trim();
    return previewObjects.get(id)||publicThumbnailUrl(file,size)||String(file.url||'');
  }

  function reportManifestUrl(id,resourceKey){
    return publicMediaUrl({fileId:id,resourceKey});
  }

  async function request(url,options={}){
    const token=await ensureAccessToken();
    const headers=new Headers(options.headers||{});
    headers.set('Authorization',`Bearer ${token}`);
    const response=await fetch(url,{...options,headers});
    if(response.status===401){
      clearToken();
      throw new Error('Разрешение Google Диска истекло. Подключи Диск ещё раз.');
    }
    if(!response.ok){
      const payload=await response.json().catch(()=>null);
      const message=payload?.error?.message||payload?.error||`Google Drive ответил ${response.status}.`;
      const error=new Error(String(message));
      error.status=response.status;
      throw error;
    }
    if(response.status===204) return null;
    return response.json();
  }

  function escapeDriveQuery(value){
    return String(value??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  }

  async function findFolder(parentId,name,marker){
    const q=[
      `'${escapeDriveQuery(parentId)}' in parents`,
      `name='${escapeDriveQuery(name)}'`,
      `mimeType='application/vnd.google-apps.folder'`,
      'trashed=false'
    ].join(' and ');
    const url=new URL(`${API}/files`);
    url.searchParams.set('q',q);
    url.searchParams.set('spaces','drive');
    url.searchParams.set('pageSize','20');
    url.searchParams.set('fields','files(id,name,appProperties)');
    const result=await request(url.href);
    const files=Array.isArray(result?.files)?result.files:[];
    return files.find(file=>file.appProperties?.rpCabinetFolder===marker)||files[0]||null;
  }

  async function createFolder(parentId,name,marker){
    return request(`${API}/files?fields=id,name,appProperties`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name,
        mimeType:'application/vnd.google-apps.folder',
        parents:[parentId],
        appProperties:{rpCabinetFolder:marker}
      })
    });
  }

  async function ensureFolder(parentId,name,marker){
    return (await findFolder(parentId,name,marker))||(await createFolder(parentId,name,marker));
  }

  async function ensureFolders(){
    if(folders?.uid===authUser()?.uid&&folders.root&&folders.screenshots&&folders.reports&&folders.avatars) return folders;
    const root=await ensureFolder('root',String(config.rootFolderName||'RP CABINET'),'root');
    const screenshots=await ensureFolder(root.id,String(config.screenshotsFolderName||'Скриншоты'),'screenshots');
    const reports=await ensureFolder(root.id,String(config.reportsFolderName||'Отчёты'),'reports');
    const avatars=await ensureFolder(root.id,String(config.avatarsFolderName||'Аватар'),'avatars');
    folders={
      uid:authUser()?.uid||'',
      root:root.id,
      screenshots:screenshots.id,
      reports:reports.id,
      avatars:avatars.id
    };
    try{sessionStorage.setItem(FOLDER_KEY,JSON.stringify(folders));}catch(error){}
    return folders;
  }

  function parseXhrError(xhr){
    let payload=xhr?.response||null;
    if(typeof payload==='string'){
      try{payload=JSON.parse(payload);}catch(error){}
    }
    if(!payload){
      try{payload=JSON.parse(xhr.responseText||'{}');}catch(error){}
    }
    return payload?.error?.message
      ||payload?.error?.errors?.[0]?.message
      ||(typeof payload?.error==='string'?payload.error:'')
      ||`Google Drive ответил ${xhr?.status||'без номера'}.`;
  }

  function propertyFingerprint(value){
    const source=String(value??'');
    let hash=2166136261;
    for(let index=0;index<source.length;index++){
      hash^=source.charCodeAt(index);
      hash=Math.imul(hash,16777619);
    }
    return `hash_${(hash>>>0).toString(36)}`;
  }

  function normalizedAppProperties(properties){
    const encoder=new TextEncoder();
    return Object.fromEntries(Object.entries(properties||{}).map(([rawKey,rawValue])=>{
      const key=String(rawKey).slice(0,80);
      const value=String(rawValue??'');
      const fitted=encoder.encode(key+value).length<=124?value:propertyFingerprint(value);
      return [key,fitted];
    }));
  }

  async function uploadBlob({blob,name,folderId,appProperties={},onProgress}){
    const token=await ensureAccessToken();
    const boundary=`rp_cabinet_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const metadata={
      name:String(name||'file.bin').slice(0,180),
      parents:[folderId],
      appProperties:normalizedAppProperties(appProperties)
    };
    const body=new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: ${blob.type||'application/octet-stream'}\r\n\r\n`,
      blob,
      `\r\n--${boundary}--`
    ],{type:`multipart/related; boundary=${boundary}`});
    const fields='id,name,mimeType,size,createdTime,resourceKey,webViewLink,webContentLink,appProperties';
    return new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      xhr.open('POST',`${UPLOAD}/files?uploadType=multipart&fields=${encodeURIComponent(fields)}`);
      xhr.setRequestHeader('Authorization',`Bearer ${token}`);
      xhr.setRequestHeader('Content-Type',`multipart/related; boundary=${boundary}`);
      xhr.responseType='json';
      xhr.upload.addEventListener('progress',event=>{
        if(event.lengthComputable&&typeof onProgress==='function') onProgress(Math.min(100,event.loaded/event.total*100));
      });
      xhr.addEventListener('load',()=>{
        if(xhr.status>=200&&xhr.status<300){
          if(typeof onProgress==='function') onProgress(100);
          resolve(xhr.response||JSON.parse(xhr.responseText||'{}'));
          return;
        }
        if(xhr.status===401) clearToken();
        reject(new Error(parseXhrError(xhr)));
      });
      xhr.addEventListener('error',()=>reject(new Error('Не удалось связаться с Google Диском.')));
      xhr.addEventListener('abort',()=>reject(new Error('Загрузка отменена.')));
      xhr.send(body);
    });
  }

  async function sharePublic(fileId){
    const permission=await request(`${API}/files/${encodeURIComponent(fileId)}/permissions?fields=id`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'anyone',role:'reader',allowFileDiscovery:false})
    });
    const url=new URL(`${API}/files/${encodeURIComponent(fileId)}`);
    url.searchParams.set('fields','id,name,mimeType,size,createdTime,resourceKey,webViewLink,webContentLink,appProperties');
    const file=await request(url.href);
    return {...file,permissionId:permission?.id||''};
  }

  async function uploadPublic({blob,name,folderId,appProperties,onProgress}){
    let created=null;
    try{
      created=await uploadBlob({blob,name,folderId,appProperties,onProgress});
      return await sharePublic(created.id);
    }catch(error){
      if(created?.id) await deleteFile(created.id).catch(()=>{});
      throw error;
    }
  }

  async function uploadProof(file,metadata={},onProgress){
    const tree=await ensureFolders();
    const expiresAt=Number(metadata.expiresAt)||Date.now()+Number(config.reportLifetimeDays||8)*86400000;
    const uploaded=await uploadPublic({
      blob:file,
      name:metadata.name||file.name||`Скриншот-${Date.now()}.png`,
      folderId:tree.screenshots,
      appProperties:{
        rpCabinetKind:'proof',
        ownerUid:authUser()?.uid||'',
        contextKey:metadata.contextKey||'',
        expiresAt
      },
      onProgress
    });
    rememberPreview(uploaded.id,file);
    return {
      provider:'google-drive',
      fileId:uploaded.id,
      resourceKey:uploaded.resourceKey||'',
      permissionId:uploaded.permissionId||'',
      url:publicMediaUrl(uploaded),
      webViewLink:uploaded.webViewLink||'',
      name:metadata.originalName||file.name||uploaded.name,
      type:file.type||uploaded.mimeType||'image/jpeg',
      size:Number(file.size||uploaded.size||0),
      width:Number(metadata.width||0),
      height:Number(metadata.height||0),
      uploadedAt:Date.now(),
      expiresAt
    };
  }

  async function uploadAvatar(blob,metadata={}){
    const tree=await ensureFolders();
    const uploaded=await uploadPublic({
      blob,
      name:`avatar-${Date.now()}.webp`,
      folderId:tree.avatars,
      appProperties:{
        rpCabinetKind:'avatar',
        ownerUid:authUser()?.uid||''
      },
      onProgress:metadata.onProgress
    });
    rememberPreview(uploaded.id,blob);
    return {
      provider:'google-drive',
      fileId:uploaded.id,
      resourceKey:uploaded.resourceKey||'',
      permissionId:uploaded.permissionId||'',
      url:publicMediaUrl(uploaded),
      webViewLink:uploaded.webViewLink||'',
      type:'image/webp',
      size:Number(blob.size||uploaded.size||0),
      width:Number(metadata.width||config.avatarSize||512),
      height:Number(metadata.height||config.avatarSize||512),
      updatedAt:Date.now()
    };
  }

  async function createReportManifest(report){
    const tree=await ensureFolders();
    const id=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const blob=new Blob([JSON.stringify({...report,version:3,storage:'google-drive'},null,2)],{type:'application/json'});
    const uploaded=await uploadPublic({
      blob,
      name:`report-${id}.json`,
      folderId:tree.reports,
      appProperties:{
        rpCabinetKind:'report',
        ownerUid:authUser()?.uid||'',
        expiresAt:Number(report.expiresAt||0)
      }
    });
    return {
      provider:'google-drive',
      id:uploaded.id,
      resourceKey:uploaded.resourceKey||'',
      permissionId:uploaded.permissionId||'',
      createdAt:Number(report.createdAt||Date.now()),
      expiresAt:Number(report.expiresAt||0)
    };
  }

  async function deleteFile(fileId){
    const id=String(fileId||'').trim();
    if(!id) return;
    try{
      await request(`${API}/files/${encodeURIComponent(id)}`,{method:'DELETE'});
    }catch(error){
      if(Number(error?.status)!==404) throw error;
    }
    forgetPreview(id);
  }

  async function listFolderFiles(folderId){
    const result=[];
    let pageToken='';
    do{
      const url=new URL(`${API}/files`);
      url.searchParams.set('q',`'${escapeDriveQuery(folderId)}' in parents and trashed=false`);
      url.searchParams.set('spaces','drive');
      url.searchParams.set('pageSize','1000');
      url.searchParams.set('fields','nextPageToken,files(id,name,createdTime,appProperties)');
      if(pageToken) url.searchParams.set('pageToken',pageToken);
      const page=await request(url.href);
      result.push(...(Array.isArray(page?.files)?page.files:[]));
      pageToken=String(page?.nextPageToken||'');
    }while(pageToken);
    return result;
  }

  async function cleanupExpired(){
    if(cleanupRunning) return cleanupRunning;
    if(!hasAccessToken()) return {deleted:0};
    cleanupRunning=(async()=>{
      const tree=await ensureFolders();
      const now=Date.now();
      const files=[
        ...(await listFolderFiles(tree.screenshots)),
        ...(await listFolderFiles(tree.reports))
      ];
      const expired=files.filter(file=>{
        const explicit=Number(file.appProperties?.expiresAt||0);
        const created=Date.parse(file.createdTime||'');
        const fallback=Number.isFinite(created)?created+Number(config.reportLifetimeDays||8)*86400000:0;
        return (explicit||fallback)>0&&(explicit||fallback)<=now;
      });
      let deleted=0;
      for(const file of expired){
        try{await deleteFile(file.id);deleted++;}catch(error){console.warn('Drive cleanup failed',file.id,error);}
      }
      return {deleted};
    })().finally(()=>{cleanupRunning=null;});
    return cleanupRunning;
  }

  function disconnect(){
    clearToken();
    folders=null;
    try{sessionStorage.removeItem(FOLDER_KEY);}catch(error){}
  }

  readSession();

  window.GoogleDriveStorage=Object.freeze({
    config,
    scope:String(config.scope||'https://www.googleapis.com/auth/drive.file'),
    setAccessToken,
    clearAccessToken:clearToken,
    disconnect,
    hasAccessToken,
    ensureAccessToken,
    ensureFolders,
    publicMediaUrl,
    publicThumbnailUrl,
    previewUrl,
    rememberPreview,
    forgetPreview,
    reportManifestUrl,
    uploadProof,
    uploadAvatar,
    createReportManifest,
    deleteFile,
    cleanupExpired
  });
})();
