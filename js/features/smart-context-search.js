/* Умный контекстный поиск. Индекс строится из существующих data-шаблонов. */
(function(){
  const SEARCHABLE_SECTIONS=new Set(['Academy','USAF']);
  const SECTION_LABELS={Academy:'Academy',USAF:'USAF'};
  const state={
    index:[],
    indexReady:false,
    opened:false,
    customScope:false,
    currentContextKey:'',
    selectedScopes:new Set(),
    query:''
  };

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[char]);

  function normalize(value){
    return String(value||'')
      .toLocaleLowerCase('ru-RU')
      .replace(/ё/g,'е')
      .replace(/[–—−]/g,'-')
      .replace(/(\d)\s*[-/]\s*(\d)/g,'$1.$2')
      .replace(/[^\p{L}\p{N}.+]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function queryAliases(value){
    return normalize(value)
      .replace(/\bусав\b/g,'usaf')
      .replace(/\bусаф\b/g,'usaf')
      .replace(/\bввс\b/g,'usaf')
      .replace(/\bвоенно воздушн\w*\b/g,'usaf');
  }

  function profileState(){
    try{
      if(typeof S!=='undefined' && S) return S;
    }catch(error){}
    return {
      path:(document.getElementById('infoPath')?.textContent||'').trim(),
      org:(document.getElementById('infoOrg')?.textContent||'').trim(),
      section:(document.getElementById('infoSection')?.textContent||'').trim(),
      configured:true
    };
  }

  function deriveCurrentScope(source){
    const data=source||{};
    const section=String(data.section||'').trim();
    if(!data.configured || !SEARCHABLE_SECTIONS.has(section)) return '';
    return ['Государственная служба',String(data.org||'ARMY').trim()||'ARMY',section].join('::');
  }

  function scopeKey(section){
    return ['Государственная служба','ARMY',section].join('::');
  }

  function scopeSection(key){
    return String(key||'').split('::')[2]||'';
  }

  function currentScopeLabel(){
    const source=profileState();
    if(!state.currentContextKey) return source.section?'Материалов для этого отдела пока нет':'Сначала выбери отдел';
    return `${source.org||'ARMY'} → ${source.section}`;
  }

  function syncDefaultScope(force){
    const next=deriveCurrentScope(profileState());
    const contextChanged=next!==state.currentContextKey;
    state.currentContextKey=next;
    if(force || !state.customScope){
      state.selectedScopes.clear();
      if(next) state.selectedScopes.add(next);
    }
    if(state.opened && (contextChanged || force || !state.customScope)){
      renderScope();
      renderFilters();
      renderResults();
    }
    return next;
  }

  function templateEntry(id){
    return (window.RPCabinetTemplates||[]).find(entry=>entry?.id===id)||null;
  }

  function textOf(node){
    return String(node?.textContent||'').replace(/\s+/g,' ').trim();
  }

  function nearestAnchor(node){
    const target=node.closest?.('[id]');
    return target?.id||'';
  }

  function candidateTitle(node){
    if(node.matches('tr')){
      const cells=Array.from(node.cells||[]).map(textOf).filter(Boolean);
      if(cells.length) return cells.slice(0,2).join(' — ');
    }
    const direct=node.querySelector?.(':scope > .question-text,:scope > b,:scope > strong,:scope > h2,:scope > h3,:scope > h4,:scope > summary');
    const nested=direct||node.querySelector?.('.question-text,h2,h3,h4,summary,b,strong');
    const title=textOf(nested);
    if(title) return title.slice(0,220);
    return textOf(node).slice(0,160)||'Материал';
  }

  function addEntry(target,seen,{section,kind,node,templateId}){
    const content=textOf(node);
    if(content.length<2) return;
    const title=candidateTitle(node);
    const anchorId=nearestAnchor(node);
    const fingerprint=[section,kind,anchorId,normalize(title),normalize(content).slice(0,220)].join('|');
    if(seen.has(fingerprint)) return;
    seen.add(fingerprint);
    target.push({
      id:`search-${target.length+1}`,
      path:'Государственная служба',
      org:'ARMY',
      section,
      scope:scopeKey(section),
      kind,
      templateId,
      anchorId,
      title,
      content,
      normalizedTitle:queryAliases(title),
      normalizedContent:queryAliases(content)
    });
  }

  function indexTemplate(target,seen,section,kind,templateId){
    const entry=templateEntry(templateId);
    if(!entry?.markup) return;
    const holder=document.createElement('div');
    holder.innerHTML=entry.markup;
    const template=holder.querySelector('template');
    if(!template) return;
    const root=template.content.cloneNode(true);
    const selectors=[
      'details[id]',
      'section[id]',
      '.qa-card',
      '.qa',
      '.academy-term-row',
      'tr',
      '.report-command',
      '.phrase',
      '.usaf-test-disabled'
    ].join(',');
    Array.from(root.querySelectorAll(selectors)).forEach(node=>addEntry(target,seen,{section,kind,node,templateId}));
  }

  function buildIndex(){
    if(state.indexReady) return state.index;
    const target=[];
    const seen=new Set();
    const registry=window.RPCabinetSectionRegistry||{};
    ['Academy','USAF'].forEach(section=>{
      const config=registry[section]||{};
      if(config.infoTemplate && config.infoTemplate!=='genericDepartmentInfoTemplate'){
        indexTemplate(target,seen,section,'info',config.infoTemplate);
      }
      Array.from(config.tests||[]).forEach(templateId=>indexTemplate(target,seen,section,'tests',templateId));
    });
    state.index=target;
    state.indexReady=true;
    return target;
  }

  function scoreEntry(entry,rawQuery){
    const query=queryAliases(rawQuery);
    if(!query) return 0;
    const tokens=query.split(' ').filter(Boolean);
    let score=0;
    if(entry.normalizedTitle===query) score+=180;
    if(entry.normalizedTitle.startsWith(query)) score+=115;
    else if(entry.normalizedTitle.includes(query)) score+=85;
    if(entry.normalizedContent.includes(query)) score+=42;
    tokens.forEach(token=>{
      if(entry.normalizedTitle.startsWith(token)) score+=34;
      else if(entry.normalizedTitle.includes(token)) score+=22;
      if(entry.normalizedContent.includes(token)) score+=9;
      if(/^\d+(?:\.\d*)?$/.test(token)){
        const codePattern=new RegExp(`(^|\\s)${token.replace('.','\\.')}`);
        if(codePattern.test(entry.normalizedTitle)) score+=75;
        else if(codePattern.test(entry.normalizedContent)) score+=38;
      }
    });
    return score;
  }

  function search(rawQuery){
    const allowed=state.selectedScopes;
    return buildIndex()
      .filter(entry=>allowed.has(entry.scope))
      .map(entry=>({entry,score:scoreEntry(entry,rawQuery)}))
      .filter(result=>result.score>0)
      .sort((a,b)=>b.score-a.score || a.entry.title.localeCompare(b.entry.title,'ru'))
      .slice(0,32)
      .map(result=>result.entry);
  }

  function snippet(entry,rawQuery){
    const content=entry.content;
    const query=normalize(rawQuery).split(' ').find(Boolean)||'';
    const source=normalize(content);
    const at=query?source.indexOf(query):-1;
    if(at<0) return content.slice(0,260)+(content.length>260?'…':'');
    const start=Math.max(0,at-80);
    const end=Math.min(content.length,at+210);
    return `${start?'…':''}${content.slice(start,end)}${end<content.length?'…':''}`;
  }

  function modalMarkup(){
    return `<div class="smart-search-modal" id="smartSearchModal" aria-hidden="true">
      <section class="smart-search-dialog" role="dialog" aria-modal="true" aria-labelledby="smartSearchTitle">
        <header class="smart-search-head">
          <div><span>RP Cabinet</span><h2 id="smartSearchTitle">Умный поиск</h2></div>
          <button class="smart-search-close" id="smartSearchClose" type="button" aria-label="Закрыть">×</button>
        </header>
        <div class="smart-search-input-wrap">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
          <input id="smartSearchInput" type="search" autocomplete="off" enterkeyhint="search" placeholder="Код, вопрос, команда или правило…">
          <kbd>Ctrl K</kbd>
        </div>
        <div class="smart-search-scope" id="smartSearchScope"></div>
        <details class="smart-search-settings" id="smartSearchSettings">
          <summary><span>Где искать</span><small id="smartSearchScopeCount"></small></summary>
          <div class="smart-search-filter-body">
            <button class="smart-search-current" id="smartSearchUseCurrent" type="button">Использовать текущий отдел</button>
            <div class="smart-search-tree" id="smartSearchTree"></div>
          </div>
        </details>
        <div class="smart-search-results" id="smartSearchResults" aria-live="polite"></div>
      </section>
    </div>`;
  }

  function searchIcon(){
    return `<span class="dash-tab-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg></span><span class="dash-tab-label">Поиск</span>`;
  }

  function installUi(){
    if(document.getElementById('smartSearchModal')) return;
    document.body.insertAdjacentHTML('beforeend',modalMarkup());
    const tabs=document.querySelector('.profile-card > .dashboard-tabs');
    if(tabs && !tabs.querySelector('.smart-search-nav-button')){
      const navButton=document.createElement('button');
      navButton.type='button';
      navButton.className='dash-tab smart-search-nav-button';
      navButton.setAttribute('aria-label','Открыть поиск');
      navButton.innerHTML=searchIcon();
      tabs.appendChild(navButton);
      navButton.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        open();
      });
    }
    const settings=document.getElementById('openSettings');
    if(settings && !document.getElementById('smartSearchProfileButton')){
      const button=document.createElement('button');
      button.id='smartSearchProfileButton';
      button.type='button';
      button.className='btn soft smart-search-profile-button';
      button.innerHTML='<span aria-hidden="true">⌕</span> Найти в материалах';
      settings.insertAdjacentElement('beforebegin',button);
      button.addEventListener('click',open);
    }
    document.getElementById('smartSearchClose')?.addEventListener('click',close);
    document.getElementById('smartSearchModal')?.addEventListener('click',event=>{
      if(event.target.id==='smartSearchModal') close();
    });
    document.getElementById('smartSearchInput')?.addEventListener('input',event=>{
      state.query=event.target.value;
      renderResults();
    });
    document.getElementById('smartSearchUseCurrent')?.addEventListener('click',()=>{
      state.customScope=false;
      syncDefaultScope(true);
      document.getElementById('smartSearchSettings').open=false;
      document.getElementById('smartSearchInput')?.focus();
    });
    document.getElementById('smartSearchTree')?.addEventListener('change',event=>{
      const input=event.target.closest?.('input[data-search-scope]');
      if(!input) return;
      state.customScope=true;
      if(input.checked) state.selectedScopes.add(input.dataset.searchScope);
      else state.selectedScopes.delete(input.dataset.searchScope);
      renderScope();
      renderFilters();
      renderResults();
    });
  }

  function renderScope(){
    const box=document.getElementById('smartSearchScope');
    if(!box) return;
    if(!state.customScope){
      box.innerHTML=`<span>По умолчанию</span><b>${esc(currentScopeLabel())}</b>`;
    }else{
      const labels=Array.from(state.selectedScopes).map(scopeSection).map(value=>SECTION_LABELS[value]||value);
      box.innerHTML=`<span>Выбрано вручную</span><b>${esc(labels.join(', ')||'Ничего')}</b>`;
    }
    const count=document.getElementById('smartSearchScopeCount');
    if(count) count.textContent=state.customScope?`${state.selectedScopes.size} выбрано`:`${scopeSection(state.currentContextKey)||'нет отдела'}`;
  }

  function renderFilters(){
    const tree=document.getElementById('smartSearchTree');
    if(!tree) return;
    const option=section=>{
      const key=scopeKey(section);
      return `<label><input type="checkbox" data-search-scope="${esc(key)}" ${state.selectedScopes.has(key)?'checked':''}><span>${esc(SECTION_LABELS[section]||section)}</span><small>Материалы и тесты</small></label>`;
    };
    tree.innerHTML=`<section><header><b>ГОСКА</b><span>Государственные организации</span></header>
      <details open><summary>ARMY</summary><div>${option('Academy')}${option('USAF')}</div></details>
      <div class="smart-search-empty-org"><b>LSPD · FIB · EMS · GOV · Новости</b><span>Материалы пока не добавлены</span></div>
    </section>
    <section class="smart-search-empty-path"><header><b>Крайм</b><span>Материалы пока не добавлены</span></header></section>`;
  }

  function renderResults(){
    const box=document.getElementById('smartSearchResults');
    if(!box) return;
    const query=state.query.trim();
    if(!state.selectedScopes.size){
      box.innerHTML='<div class="smart-search-empty"><b>Область поиска не выбрана</b><span>Выбери отдел в «Где искать».</span></div>';
      return;
    }
    if(!query){
      box.innerHTML=`<div class="smart-search-empty"><b>Поиск готов: ${esc(currentScopeLabel())}</b><span>Начни вводить код, вопрос, команду или правило.</span><div class="smart-search-hints"><button data-search-hint="3">3</button><button data-search-hint="наручники">Наручники</button><button data-search-hint="10-">Тен-коды</button><button data-search-hint="уак">УАК</button></div></div>`;
      box.querySelectorAll('[data-search-hint]').forEach(button=>button.addEventListener('click',()=>{
        const input=document.getElementById('smartSearchInput');
        input.value=button.dataset.searchHint;
        state.query=input.value;
        renderResults();
        input.focus();
      }));
      return;
    }
    const results=search(query);
    if(!results.length){
      box.innerHTML=`<div class="smart-search-empty"><b>Ничего не найдено</b><span>Проверь запрос или расширь область в «Где искать».</span></div>`;
      return;
    }
    box.innerHTML=`<div class="smart-search-result-count">Найдено: ${results.length}</div>${results.map(entry=>{
      const isCurrent=entry.scope===state.currentContextKey;
      return `<article class="smart-search-result" data-search-result="${esc(entry.id)}">
        <div class="smart-search-result-meta"><span>ARMY → ${esc(entry.section)}</span><small>${entry.kind==='tests'?'Тесты':'Информация'}</small></div>
        <h3>${esc(entry.title)}</h3>
        <p>${esc(snippet(entry,query))}</p>
        <button type="button" ${isCurrent?'':'disabled'}>${isCurrent?'Открыть в панели':'Другой отдел · без смены профиля'}</button>
      </article>`;
    }).join('')}`;
    box.querySelectorAll('[data-search-result] button:not([disabled])').forEach(button=>button.addEventListener('click',()=>{
      const card=button.closest('[data-search-result]');
      const entry=results.find(item=>item.id===card?.dataset.searchResult);
      if(entry) openResult(entry);
    }));
  }

  function openResult(entry){
    if(entry.scope!==deriveCurrentScope(profileState())) return;
    close();
    if(typeof setActiveDashTab==='function') setActiveDashTab(entry.kind==='tests'?'tests':'department');
    setTimeout(()=>{
      const host=document.getElementById(entry.kind==='tests'?'departmentTestsContent':'departmentInfoContent');
      if(!host) return;
      const target=entry.anchorId?host.querySelector(`#${CSS.escape(entry.anchorId)}`):null;
      if(!target) return;
      if(target.matches('details')) target.open=true;
      target.querySelectorAll?.('details').forEach(details=>details.open=true);
      let parent=target.parentElement;
      while(parent&&parent!==host){
        if(parent.matches?.('details')) parent.open=true;
        parent=parent.parentElement;
      }
      target.classList.add('smart-search-target');
      target.scrollIntoView({behavior:'smooth',block:'start'});
      setTimeout(()=>target.classList.remove('smart-search-target'),2600);
    },120);
  }

  function open(){
    installUi();
    buildIndex();
    syncDefaultScope(false);
    state.opened=true;
    const modal=document.getElementById('smartSearchModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('smart-search-open');
    renderScope();
    renderFilters();
    renderResults();
    requestAnimationFrame(()=>document.getElementById('smartSearchInput')?.focus());
  }

  function close(){
    state.opened=false;
    const modal=document.getElementById('smartSearchModal');
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden','true');
    document.body.classList.remove('smart-search-open');
  }

  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLocaleLowerCase()==='k'){
      event.preventDefault();
      state.opened?close():open();
    }else if(event.key==='Escape'&&state.opened){
      close();
    }
  });

  document.addEventListener('DOMContentLoaded',()=>{
    installUi();
    syncDefaultScope(true);
    const infoSection=document.getElementById('infoSection');
    if(infoSection){
      new MutationObserver(()=>syncDefaultScope(false)).observe(infoSection,{childList:true,characterData:true,subtree:true});
    }
  });

  window.KiriSmartSearch={
    open,
    close,
    search:query=>{syncDefaultScope(false);return search(query);},
    syncDefaultScope,
    deriveCurrentScope,
    getState:()=>({
      customScope:state.customScope,
      currentContextKey:state.currentContextKey,
      selectedScopes:Array.from(state.selectedScopes),
      indexSize:buildIndex().length
    })
  };
})();
