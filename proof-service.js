/* Восстанавливает DOM-шаблоны из файлов data до запуска приложения. */
(function(){
  const entries=window.RPCabinetTemplates||[];
  const host=document.createElement('div');
  host.id='rpCabinetTemplateRegistry';
  host.hidden=true;
  entries.forEach(entry=>{
    if(!entry||!entry.id||document.getElementById(entry.id)) return;
    host.insertAdjacentHTML('beforeend',entry.markup);
  });
  document.body.appendChild(host);
})();
