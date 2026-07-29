(function(){
  'use strict';

  let busy=false;

  function currentAvatar(){
    return S?.account?.driveAvatar&&typeof S.account.driveAvatar==='object'
      ? S.account.driveAvatar
      : null;
  }

  function editorMarkup(){
    return `<input class="profile-avatar-input" id="driveAvatarInput" type="file"
      accept="image/png,image/jpeg,image/webp" aria-hidden="true">
      <button class="profile-avatar-edit" id="editDriveAvatar" type="button"
        aria-label="Загрузить свой аватар" title="Загрузить свой аватар">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z"></path>
          <path d="m14.8 6.4 2.8 2.8"></path>
        </svg>
      </button>`;
  }

  function ensureEditor(){
    const wrap=document.querySelector('.avatar-wrap');
    if(!wrap) return null;
    if(!document.getElementById('editDriveAvatar')){
      wrap.insertAdjacentHTML('beforeend',editorMarkup());
      document.getElementById('editDriveAvatar')?.addEventListener('click',chooseAvatar);
      document.getElementById('driveAvatarInput')?.addEventListener('change',event=>{
        const input=event.currentTarget;
        const file=input.files?.[0];
        input.value='';
        upload(file);
      });
    }
    return wrap;
  }

  function renderEditor(){
    const wrap=ensureEditor();
    if(!wrap) return;
    const button=document.getElementById('editDriveAvatar');
    const input=document.getElementById('driveAvatarInput');
    const replacing=!!currentAvatar();
    if(button){
      const label=replacing?'Заменить свой аватар':'Загрузить свой аватар';
      button.title=label;
      button.setAttribute('aria-label',label);
      button.disabled=busy;
      button.classList.toggle('is-busy',busy);
    }
    if(input) input.disabled=busy;
  }

  function chooseAvatar(){
    if(busy) return;
    if(!window.CloudSync?.user){
      showToast('Сначала войди через Google','Это нужно для сохранения аватара на твоём Google Диске');
      return;
    }
    document.getElementById('driveAvatarInput')?.click();
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
    renderEditor();
    const previous=currentAvatar();
    try{
      await window.GoogleDriveStorage.ensureAccessToken();
      const blob=await prepareAvatar(file);
      const avatar=await window.GoogleDriveStorage.uploadAvatar(blob,{width:512,height:512});
      if(!S.account||typeof S.account!=='object') S.account={};
      S.account.driveAvatar=avatar;
      save();
      renderProfileIcon();
      renderEditor();
      if(previous?.fileId&&previous.fileId!==avatar.fileId){
        await window.GoogleDriveStorage.deleteFile(previous.fileId)
          .catch(error=>console.warn('Old avatar delete failed',error));
      }
      showToast('Аватар обновлён','Предыдущая фотография удалена с Google Диска');
    }catch(error){
      showToast('Аватар не сохранён',String(error.message||error).slice(0,140));
    }finally{
      busy=false;
      renderEditor();
    }
  }

  const appRender=window.render||globalThis.render;
  if(typeof appRender==='function'){
    const wrapped=function(){
      appRender();
      renderEditor();
    };
    try{globalThis.render=wrapped;}catch(error){}
  }
  document.addEventListener('rp:drive-status',renderEditor);
  document.addEventListener('DOMContentLoaded',renderEditor);
  renderEditor();
})();
