/*
 * Публичный Google Drive API key для чтения отчётов.
 * Источник — только js/config/public-config.js на домене панели.
 * Пользователи панели и получатели ссылок ничего не вводят вручную.
 */
(function(){
  'use strict';

  function normalize(value){
    const key=String(value||'').trim();
    return /^AIza[0-9A-Za-z_-]{30,80}$/.test(key)?key:'';
  }

  function configuredValue(){
    return normalize(
      window.RP_PUBLIC_CONFIG?.googleDriveApiKey||
      window.RP_GOOGLE_DRIVE_BUNDLED_KEY||
      ''
    );
  }

  function get(){
    return configuredValue();
  }

  function requireKey(){
    const key=get();
    if(!key){
      throw new Error('Администратор панели не настроил js/config/public-config.js.');
    }
    return key;
  }

  window.RPDrivePublicKey=Object.freeze({
    normalize,
    get,
    require:requireKey,
    configured:()=>Boolean(get())
  });
})();
