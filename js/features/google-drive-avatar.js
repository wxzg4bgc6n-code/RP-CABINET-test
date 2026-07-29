(function(){
  'use strict';

  let busy=false;

  function esc(value){
    return String(value??'').replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  function currentAvatar(){
    return S?.account?.driveAvatar&&typeof S.account.driveAvatar==='object'
      ? S.account.driveAvatar
      : null;
  }

  function initials(){
    return (String(S?.name||'RP').trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2)||'RP').toUpperCase();
  }

  function ensureCard(){
    const syncCard=document.getElementById('cloudSyncCard');
    if(!syncCard?.parentNode) return null;
    let card=document.getElementById('driveAvatarCard');
    if(card) return card;
    card=document.createElement('section');
    card.id='driveAvatarCard';
    card.className='drive-avatar-card';
    syncCard.parentNode.insertBefore(card,syncCard);
    return card;
  }

  function render(){
    const card=ensureCard();
    if(!card) return;
    const avatar=currentAvatar();
    const authenticated=!!window.CloudSync?.user;
    const driveReady=!!window.GoogleDriveStorage?.hasAccessToken();
    card.innerHTML=`<div class="drive-avatar-head">
      <div class="drive-avatar-preview">${avatar?.url
        ? `<img src="${esc(avatar.url)}" alt="Пользовательская аватарка" referrerpolicy="no-referrer">`
        : `<span>${esc(initials())}</span>`}</div>
      <div>
        <h3>Аватар профиля</h3>
        <p>${avatar?'Используется пользовательская фотография с Google Диска.':'Загрузи одну фотографию. При замене предыдущая удалится.'}</p>
      </div>
    </div>
    <div class="drive-avatar-actions">
      ${!authenticated
        ? '<button class="btn soft" type="button" disabled>Сначала войди через Google</button>'
        : !driveReady
          ? '<button class="btn" type="button" id="connectAvatarDrive">Подключить Google Диск</button>'
          : `<label class="btn drive-avatar-upload ${busy?'is-disabled':''}">
              <input type="file" id="driveAvatarInput" accept="image/png,image/jpeg,image/webp" ${busy?'disabled':''}>
              <span>${busy?'Сохраняю…':avatar?'Заменить фотографию':'Загрузить фотографию'}</span>
            </label>`}
      ${avatar?`<button class="btn soft" type="button" id="deleteDriveAvatar" ${busy||!driveReady?'disabled':''}>Удалить аватар</button>`:''}
    </div>
    <small>Изображение автоматически обрезается квадратом и сохраняется в WebP 512×512.</small>`;

    card.querySelector('#connectAvatarDrive')?.addEventListener('click',connect);
    card.querySelector('#driveAvatarInput')?.addEventListener('change',event=>upload(event.target.files?.[0]));
    card.querySelector('#deleteDriveAvatar')?.addEventListener('click',remove);
  }

  async function connect(){
    try{
      await window.GoogleDriveStorage.ensureAccessToken();
      render();
      showToast('Google Диск подключён','Можно загружать аватар и скриншоты');
    }catch(error){
      showToast('Диск не подключён',String(error.message||error).slice(0,140));
    }
  }

  function loadImage(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const image=new Image();
      image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
      image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Не удалось прочитать фотографию.'));};
      image.src=url;
    });
  }

  async function prepareAvatar(file){
    if(!/^image\/(png|jpeg|webp)$/i.test(file?.type||'')) throw new Error('Разрешены PNG, JPG и WEBP.');
    if(file.size>Number(window.RP_GOOGLE_DRIVE?.avatarMaxBytes||2097152)*6) throw new Error('Исходная фотография слишком большая.');
    const image=await loadImage(file);
    const size=Number(window.RP_GOOGLE_DRIVE?.avatarSize||512);
    const source=Math.min(image.naturalWidth||image.width,image.naturalHeight||image.height);
    const sx=((image.naturalWidth||image.width)-source)/2;
    const sy=((image.naturalHeight||image.height)-source)/2;
    const canvas=document.createElement('canvas');
    canvas.width=size;
    canvas.height=size;
    const context=canvas.getContext('2d',{alpha:false});
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality='high';
    context.drawImage(image,sx,sy,source,source,0,0,size,size);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));
    if(!blob) throw new Error('Браузер не смог подготовить WebP.');
    return blob;
  }

  async function upload(file){
    if(!file||busy) return;
    busy=true;
    render();
    const previous=currentAvatar();
    try{
      await window.GoogleDriveStorage.ensureAccessToken();
      const blob=await prepareAvatar(file);
      const avatar=await window.GoogleDriveStorage.uploadAvatar(blob,{width:512,height:512});
      if(!S.account||typeof S.account!=='object') S.account={};
      S.account.driveAvatar=avatar;
      save();
      renderProfileIcon();
      render();
      if(previous?.fileId&&previous.fileId!==avatar.fileId){
        await window.GoogleDriveStorage.deleteFile(previous.fileId).catch(error=>console.warn('Old avatar delete failed',error));
      }
      showToast('Аватар обновлён','Новая фотография синхронизируется между устройствами');
    }catch(error){
      showToast('Аватар не сохранён',String(error.message||error).slice(0,140));
    }finally{
      busy=false;
      render();
    }
  }

  async function remove(){
    const avatar=currentAvatar();
    if(!avatar||busy||!confirm('Удалить пользовательский аватар? Будет показано фото Google.')) return;
    busy=true;
    render();
    try{
      await window.GoogleDriveStorage.ensureAccessToken();
      if(avatar.fileId) await window.GoogleDriveStorage.deleteFile(avatar.fileId);
      delete S.account.driveAvatar;
      save();
      renderProfileIcon();
      render();
      showToast('Аватар удалён','Возвращено фото Google или инициалы');
    }catch(error){
      showToast('Не удалось удалить',String(error.message||error).slice(0,140));
    }finally{
      busy=false;
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
