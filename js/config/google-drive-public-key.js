/*
 * Публичный Google Drive API key для чтения отчётов.
 *
 * Ключ не хранится в сборке: владелец панели вводит его один раз при
 * формировании отчёта. Значение сохраняется только в localStorage текущего
 * браузера и добавляется в публичную ссылку отчёта как параметр pk.
 * API key уже является публичным браузерным ключом и должен быть ограничен
 * доменом GitHub Pages и только Google Drive API в Google Cloud.
 */
(function(){
  'use strict';

  const STORAGE_KEY='kiri:rp-cabinet:v104:drive-public-api-key';
  const QUERY_KEY='pk';

  function normalize(value){
    const key=String(value||'').trim();
    return /^AIza[0-9A-Za-z_-]{30,80}$/.test(key)?key:'';
  }

  function queryValue(){
    try{return normalize(new URLSearchParams(location.search).get(QUERY_KEY));}
    catch(error){return '';}
  }

  function storedValue(){
    try{return normalize(localStorage.getItem(STORAGE_KEY));}
    catch(error){return '';}
  }

  function configuredValue(){
    return normalize(window.RP_GOOGLE_DRIVE?.apiKey||window.RP_GOOGLE_DRIVE_BUNDLED_KEY||'');
  }

  function get(){
    return queryValue()||storedValue()||configuredValue();
  }

  function set(value){
    const key=normalize(value);
    if(!key) throw new Error('Ключ должен начинаться с AIza и быть скопирован целиком.');
    try{localStorage.setItem(STORAGE_KEY,key);}catch(error){}
    return key;
  }

  function request(message){
    const value=window.prompt(
      message||'Вставь ключ «RP CABINET Drive Browser» из Google Cloud. Он сохранится в этом браузере и будет использоваться только для публичных отчётов.',
      storedValue()
    );
    if(value===null) throw new Error('Создание публичного отчёта отменено.');
    return set(value);
  }

  function clear(){
    try{localStorage.removeItem(STORAGE_KEY);}catch(error){}
  }

  window.RPDrivePublicKey=Object.freeze({
    storageKey:STORAGE_KEY,
    queryKey:QUERY_KEY,
    normalize,
    get,
    set,
    request,
    clear
  });
})();
