(function(){
  'use strict';

  let busy=false;
  let crop=null;

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

  function cropMarkup(){
    return `<div class="avatar-crop-modal" id="avatarCropModal" role="dialog"
      aria-modal="true" aria-labelledby="avatarCropTitle">
      <div class="avatar-crop-dialog">
        <div class="avatar-crop-head">
          <div>
            <span>Аватар профиля</span>
            <h2 id="avatarCropTitle">Настрой фотографию</h2>
          </div>
          <button class="avatar-crop-close" id="avatarCropClose" type="button" aria-label="Закрыть">×</button>
        </div>
        <div class="avatar-crop-workspace">
          <div class="avatar-crop-frame" id="avatarCropFrame">
            <img id="avatarCropImage" alt="Предпросмотр аватара">
            <div class="avatar-crop-guide" aria-hidden="true"></div>
          </div>
          <p>Перетаскивай фотографию, чтобы выбрать положение. Ползунок меняет масштаб.</p>
          <label class="avatar-zoom-control">
            <span aria-hidden="true">−</span>
            <input id="avatarZoomRange" type="range" min="1" max="3" step="0.01" value="1"
              aria-label="Масштаб аватара">
            <span aria-hidden="true">+</span>
          </label>
        </div>
        <div class="avatar-crop-actions">
          <button class="btn soft" id="avatarCropCancel" type="button">Отмена</button>
          <button class="btn" id="avatarCropSave" type="button">Сохранить аватар</button>
        </div>
      </div>
    </div>`;
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
        openCrop(file);
      });
    }
    if(!document.getElementById('avatarCropModal')){
      document.body.insertAdjacentHTML('beforeend',cropMarkup());
      installCropEvents();
    }
    return wrap;
  }

  function renderEditor(){
    const wrap=ensureEditor();
    if(!wrap) return;
    const button=document.getElementById('editDriveAvatar');
    const input=document.getElementById('driveAvatarInput');
    const saveButton=document.getElementById('avatarCropSave');
    const replacing=!!currentAvatar();
    if(button){
      const label=replacing?'Заменить свой аватар':'Загрузить свой аватар';
      button.title=label;
      button.setAttribute('aria-label',label);
      button.disabled=busy;
      button.classList.toggle('is-busy',busy);
    }
    if(input) input.disabled=busy;
    if(saveButton){
      saveButton.disabled=busy;
      saveButton.textContent=busy?'Сохраняю…':'Сохранить аватар';
    }
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
      image.onload=()=>resolve({image,url});
      image.onerror=()=>{
        URL.revokeObjectURL(url);
        reject(new Error('Не удалось прочитать фотографию.'));
      };
      image.src=url;
    });
  }

  async function openCrop(file){
    if(!file||busy) return;
    try{
      if(!/^image\/(png|jpeg|webp)$/i.test(file.type||'')) throw new Error('Разрешены PNG, JPG и WEBP.');
      if(file.size>Number(window.RP_GOOGLE_DRIVE?.avatarMaxBytes||2097152)*6) throw new Error('Исходная фотография слишком большая.');
      closeCrop();
      const loaded=await loadImage(file);
      crop={
        file,
        image:loaded.image,
        objectUrl:loaded.url,
        zoom:1,
        panX:0,
        panY:0,
        dragging:false,
        pointerId:null
      };
      const modal=document.getElementById('avatarCropModal');
      const preview=document.getElementById('avatarCropImage');
      if(preview) preview.src=crop.objectUrl;
      modal?.classList.add('open');
      document.body.classList.add('avatar-crop-open');
      requestAnimationFrame(updateCropPreview);
    }catch(error){
      showToast('Фотография не открыта',String(error.message||error).slice(0,140));
    }
  }

  function closeCrop(){
    document.getElementById('avatarCropModal')?.classList.remove('open');
    document.body.classList.remove('avatar-crop-open');
    if(crop?.objectUrl) URL.revokeObjectURL(crop.objectUrl);
    crop=null;
  }

  function cropGeometry(){
    const frame=document.getElementById('avatarCropFrame');
    if(!crop||!frame) return null;
    const frameSize=Math.max(1,frame.clientWidth);
    const width=crop.image.naturalWidth||crop.image.width||1;
    const height=crop.image.naturalHeight||crop.image.height||1;
    const base=Math.max(frameSize/width,frameSize/height);
    const scaledWidth=width*base*crop.zoom;
    const scaledHeight=height*base*crop.zoom;
    const maxX=Math.max(0,(scaledWidth-frameSize)/2);
    const maxY=Math.max(0,(scaledHeight-frameSize)/2);
    crop.panX=Math.max(-maxX,Math.min(maxX,crop.panX));
    crop.panY=Math.max(-maxY,Math.min(maxY,crop.panY));
    return {frameSize,width,height,scaledWidth,scaledHeight};
  }

  function updateCropPreview(){
    const geometry=cropGeometry();
    const image=document.getElementById('avatarCropImage');
    if(!geometry||!image) return;
    image.style.width=`${geometry.scaledWidth}px`;
    image.style.height=`${geometry.scaledHeight}px`;
    image.style.transform=`translate(calc(-50% + ${crop.panX}px),calc(-50% + ${crop.panY}px))`;
    const range=document.getElementById('avatarZoomRange');
    if(range&&Number(range.value)!==crop.zoom) range.value=String(crop.zoom);
  }

  function installCropEvents(){
    const modal=document.getElementById('avatarCropModal');
    const frame=document.getElementById('avatarCropFrame');
    const range=document.getElementById('avatarZoomRange');
    document.getElementById('avatarCropClose')?.addEventListener('click',closeCrop);
    document.getElementById('avatarCropCancel')?.addEventListener('click',closeCrop);
    document.getElementById('avatarCropSave')?.addEventListener('click',saveCrop);
    modal?.addEventListener('click',event=>{if(event.target===modal&&!busy) closeCrop();});
    range?.addEventListener('input',()=>{
      if(!crop) return;
      crop.zoom=Math.max(1,Math.min(3,Number(range.value)||1));
      updateCropPreview();
    });
    frame?.addEventListener('pointerdown',event=>{
      if(!crop||busy) return;
      crop.dragging=true;
      crop.pointerId=event.pointerId;
      crop.dragStartX=event.clientX;
      crop.dragStartY=event.clientY;
      crop.startPanX=crop.panX;
      crop.startPanY=crop.panY;
      frame.setPointerCapture?.(event.pointerId);
      frame.classList.add('is-dragging');
    });
    frame?.addEventListener('pointermove',event=>{
      if(!crop?.dragging||crop.pointerId!==event.pointerId) return;
      crop.panX=crop.startPanX+(event.clientX-crop.dragStartX);
      crop.panY=crop.startPanY+(event.clientY-crop.dragStartY);
      updateCropPreview();
    });
    const stopDrag=event=>{
      if(!crop?.dragging||crop.pointerId!==event.pointerId) return;
      crop.dragging=false;
      frame?.classList.remove('is-dragging');
      frame?.releasePointerCapture?.(event.pointerId);
    };
    frame?.addEventListener('pointerup',stopDrag);
    frame?.addEventListener('pointercancel',stopDrag);
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&crop&&!busy) closeCrop();
    });
    window.addEventListener('resize',()=>{if(crop) updateCropPreview();});
  }

  async function croppedBlob(){
    const geometry=cropGeometry();
    if(!crop||!geometry) throw new Error('Кадрирование ещё не готово.');
    const size=Number(window.RP_GOOGLE_DRIVE?.avatarSize||512);
    const scale=(geometry.scaledWidth/geometry.width)*(size/geometry.frameSize);
    const outputWidth=geometry.width*scale;
    const outputHeight=geometry.height*scale;
    const panScale=size/geometry.frameSize;
    const dx=(size-outputWidth)/2+crop.panX*panScale;
    const dy=(size-outputHeight)/2+crop.panY*panScale;
    const canvas=document.createElement('canvas');
    canvas.width=size;
    canvas.height=size;
    const context=canvas.getContext('2d',{alpha:false});
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality='high';
    context.drawImage(crop.image,dx,dy,outputWidth,outputHeight);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));
    if(!blob) throw new Error('Браузер не смог подготовить WebP.');
    return blob;
  }

  async function saveCrop(){
    if(!crop||busy) return;
    busy=true;
    renderEditor();
    const previous=currentAvatar();
    try{
      await window.GoogleDriveStorage.ensureAccessToken();
      const blob=await croppedBlob();
      const avatar=await window.GoogleDriveStorage.uploadAvatar(blob,{width:512,height:512});
      if(!S.account||typeof S.account!=='object') S.account={};
      S.account.driveAvatar=avatar;
      save();
      renderProfileIcon();
      if(previous?.fileId&&previous.fileId!==avatar.fileId){
        await window.GoogleDriveStorage.deleteFile(previous.fileId)
          .catch(error=>console.warn('Old avatar delete failed',error));
      }
      closeCrop();
      showToast('Аватар обновлён','Кадр сохранён, предыдущая фотография удалена');
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
