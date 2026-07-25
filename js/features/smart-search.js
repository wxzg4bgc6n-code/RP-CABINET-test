/* Умный контекстный поиск: индекс строится из существующих DOM-шаблонов. */
(function smartContextSearch(){
  "use strict";

  var ITEM_SELECTOR = [
    ".qa-card",
    ".qa",
    ".academy-term-row",
    ".report-card",
    ".ten-code-card",
    ".ten-mini-card",
    ".ten-emergency-card",
    ".usaf-post-card-v50",
    ".usaf-post-check-card-v50",
    ".usaf-patrol-card-v51",
    ".usaf-protocol-card-v53",
    ".usaf-protocol-proof-card-v53",
    ".usaf-speech-tip-card-v54",
    ".usaf-law-fact-v88",
    ".usaf-law-flow-v88 > li",
    ".usaf-law-script-v88",
    ".usaf-law-call-grid-v88 > article",
    ".usaf-law-call-notes-v88 > p",
    ".usaf-law-split-v88 > article",
    ".usaf-law-compare-v88 > article",
    ".usaf-law-case-grid-v88 > article",
    ".usaf-law-qa-v88 > details",
    ".report-command"
  ].join(",");

  var NUMBER_WORDS = Object.freeze({
    "ноль":"0","один":"1","одна":"1","два":"2","две":"2","три":"3",
    "четыре":"4","пять":"5","шесть":"6","семь":"7","восемь":"8","девять":"9","десять":"10"
  });
  var QUERY_ALIASES = Object.freeze({
    "усав":["usaf","усаф","ввс"],
    "усаф":["usaf","усав","ввс"],
    "ввс":["usaf","усаф","усав"],
    "академия":["academy","ma","военная академия"],
    "армия":["army","ng","national guard"],
    "фиб":["fib"],
    "фип":["fib"],
    "лспд":["lspd"],
    "лссд":["lssd"],
    "эмс":["ems"],
    "гов":["gov"],
    "кпп":["контрольно пропускной пункт","checkpoint"],
    "уак":["уголовно административный кодекс"],
    "пк":["процессуальный кодекс"]
  });
  var ORG_LABELS = Object.freeze({
    "ARMY":"Армия","LSPD":"LSPD","LSSD":"LSSD","FIB":"FIB","EMS":"EMS","GOV":"GOV",
    "USSS":"USSS","PRISON":"Федеральная тюрьма","Weazel News":"Новости",
    "Семья":"Семьи","Банда":"Банды","Мафия":"Мафии","Картель":"Картели","Нелегал":"Нелегальные организации"
  });
  var RUS_ENDINGS = [
    "иями","ями","ами","его","ого","ему","ому","ими","ыми","ий","ый","ой","ая","яя","ое","ее","ые","ие",
    "ов","ев","ам","ям","ах","ях","ом","ем","ую","юю","а","я","ы","и","е","у","ю"
  ];

  function normalize(value){
    return String(value || "")
      .toLocaleLowerCase("ru-RU")
      .replace(/ё/g,"е")
      .replace(/[«»„“”'`]/g,"")
      .replace(/[^a-zа-я0-9.\-/]+/gi," ")
      .replace(/\s+/g," ")
      .trim();
  }
  function words(value){
    return normalize(value).split(" ").filter(Boolean);
  }
  function stem(word){
    var value=normalize(word);
    if(value.length<5 || /\d/.test(value)) return value;
    for(var i=0;i<RUS_ENDINGS.length;i+=1){
      var ending=RUS_ENDINGS[i];
      if(value.length-ending.length>=4 && value.endsWith(ending)) return value.slice(0,-ending.length);
    }
    return value;
  }
  function unique(values){ return Array.from(new Set((values||[]).filter(Boolean))); }
  function queryGroups(query){
    var base=words(query);
    var hasNumeric=base.some(function(token){return /\d/.test(token)||!!NUMBER_WORDS[token];});
    if(hasNumeric && base.length>1){
      base=base.filter(function(token){return ["код","пункт","статья","номер"].indexOf(token)<0;});
    }
    return base.map(function(token){
      var alternatives=[token];
      if(NUMBER_WORDS[token]) alternatives.push(NUMBER_WORDS[token]);
      (QUERY_ALIASES[token]||[]).forEach(function(alias){ words(alias).forEach(function(part){alternatives.push(part);}); });
      return unique(alternatives);
    });
  }
  function queryTokens(query){
    return unique(queryGroups(query).reduce(function(all,group){return all.concat(group);},[]));
  }
  function escapeHtml(value){
    return String(value||"").replace(/[&<>"']/g,function(char){return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char];});
  }
  function escapeRegExp(value){ return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  function cleanText(node){
    if(!node) return "";
    var clone=node.cloneNode(true);
    clone.querySelectorAll("script,style,button,.kiri-pin-profile-btn,.kiri-profile-unpin-btn").forEach(function(el){el.remove();});
    return String(clone.textContent||"").replace(/\s+/g," ").trim();
  }
  function textTitle(node,fallback){
    if(!node) return fallback||"Материал";
    var candidate=node.querySelector(".question-text,h4,h3,.report-card-top strong,.report-card-top b,.academy-term-code,summary,strong,b");
    var text=candidate ? cleanText(candidate) : "";
    if(!text) text=cleanText(node).split(/[.!?]/)[0];
    text=text.replace(/^\d+[.)]\s*/,"").trim();
    return text.slice(0,150) || fallback || "Материал";
  }
  function blockTitle(block){
    if(!block) return "Материал";
    var summary=block.querySelector(":scope > details > summary, :scope > summary, h2, h3");
    return textTitle(summary||block,"Материал");
  }
  function nearestTitle(node,block){
    var section=node.closest("section[id],details[id],.test-highlight-block[id]");
    if(section && section!==block) return blockTitle(section);
    return blockTitle(block);
  }
  function topLevelCandidates(root){
    return Array.from(root.querySelectorAll(ITEM_SELECTOR)).filter(function(node){
      var parent=node.parentElement && node.parentElement.closest(ITEM_SELECTOR);
      return !parent || !root.contains(parent);
    });
  }
  function codeTokens(text){
    return unique((normalize(text).match(/(?:^|\s)(?:\d+(?:[.\-]\d+)+|\d+)(?=\s|$)/g)||[]).map(function(value){return value.trim();}));
  }
  function templateBlockNodes(template){
    var holder=document.createElement("div");
    holder.appendChild(template.content.cloneNode(true));
    var blocks=Array.from(holder.children).filter(function(node){return node.nodeType===1;});
    if(blocks.length===1 && blocks[0].tagName==="DIV" && !blocks[0].id){
      var nested=Array.from(blocks[0].children).filter(function(node){return node.nodeType===1;});
      if(nested.length) blocks=nested;
    }
    return blocks;
  }
  function pathLabel(value){ return value==="Государственная служба"?"ГОСКА":(value==="Крайм"?"Крайм":value); }
  function orgLabel(value){ return ORG_LABELS[value]||value; }
  function sourceKey(path,org,department){ return [path,org,department].join("::"); }
  function currentContext(){
    var state=(typeof S!=="undefined" && S) ? S : (window.S||{});
    return {
      path:String(state.path||"Государственная служба"),
      org:String(state.org||""),
      department:String(state.section||"")
    };
  }
  function currentKey(){
    var context=currentContext();
    return sourceKey(context.path,context.org,context.department);
  }
  function registrySources(){
    var registry=window.RPCabinetSectionRegistry||{};
    var list=[];
    Object.keys(registry).forEach(function(department){
      var entry=registry[department]||{};
      var path=entry.path||"Государственная служба";
      var org=entry.organization||"ARMY";
      var info=entry.infoTemplate;
      if(info && info!=="genericDepartmentInfoTemplate" && document.getElementById(info)){
        list.push({path:path,org:org,department:department,kind:"info",templateId:info});
      }
      var tests=(entry.tests||[]).find(function(id){return !!document.getElementById(id);});
      if(tests) list.push({path:path,org:org,department:department,kind:"tests",templateId:tests});
    });
    return list;
  }
  function buildIndex(){
    var records=[];
    var seen=new Set();
    registrySources().forEach(function(source){
      var template=document.getElementById(source.templateId);
      if(!(template instanceof HTMLTemplateElement)) return;
      templateBlockNodes(template).forEach(function(block,blockIndex){
        var text=cleanText(block);
        if(text.length<8) return;
        var blockId=block.id||[source.department,source.kind,"block",blockIndex].join("-").toLocaleLowerCase("ru-RU");
        var title=blockTitle(block);
        var blockRecord={
          id:[sourceKey(source.path,source.org,source.department),source.kind,blockId,"block"].join("::"),
          path:source.path,org:source.org,department:source.department,kind:source.kind,
          blockId:blockId,anchorId:block.id||"",itemIndex:-1,
          title:title,blockTitle:title,text:text,
          normTitle:normalize(title),normText:normalize(text),codes:codeTokens(text),isBlock:true
        };
        var blockDedupe=[blockRecord.department,blockRecord.kind,blockRecord.title,blockRecord.text.slice(0,180)].join("|");
        if(!seen.has(blockDedupe)){seen.add(blockDedupe);records.push(blockRecord);}

        var candidates=topLevelCandidates(block);
        candidates.forEach(function(item,itemIndex){
          var itemText=cleanText(item);
          if(itemText.length<5 || itemText===text) return;
          var titleText=textTitle(item,nearestTitle(item,block));
          var anchor=item.closest("[id]");
          var anchorId=anchor&&block.contains(anchor)?anchor.id:(block.id||"");
          var anchorRoot=anchor&&block.contains(anchor)?anchor:block;
          var siblings=topLevelCandidates(anchorRoot);
          var anchorItemIndex=Math.max(0,siblings.indexOf(item));
          var record={
            id:[sourceKey(source.path,source.org,source.department),source.kind,blockId,anchorId||"root",anchorItemIndex,titleText].join("::"),
            path:source.path,org:source.org,department:source.department,kind:source.kind,
            blockId:blockId,anchorId:anchorId,itemIndex:anchorItemIndex,
            title:titleText,blockTitle:title,text:itemText,
            normTitle:normalize(titleText),normText:normalize(itemText),codes:codeTokens(itemText),isBlock:false
          };
          var dedupe=[record.department,record.kind,record.title,record.text].join("|");
          if(!seen.has(dedupe)){seen.add(dedupe);records.push(record);}
        });
      });
    });
    return records;
  }
  function distance(a,b){
    if(a===b) return 0;
    if(!a.length) return b.length;
    if(!b.length) return a.length;
    var prev=Array.from({length:b.length+1},function(_,i){return i;});
    for(var i=1;i<=a.length;i+=1){
      var cur=[i];
      for(var j=1;j<=b.length;j+=1){
        cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      }
      prev=cur;
    }
    return prev[b.length];
  }
  function tokenScore(record,token){
    var title=record.normTitle;
    var body=record.normText;
    var titleWords=words(title);
    var bodyWords=words(body);
    var tokenStem=stem(token);
    if(title===token) return 150;
    if(title.startsWith(token)) return 110;
    if(record.codes.some(function(code){return code===token;})) return 135;
    if(record.codes.some(function(code){return code.startsWith(token);})) return 118;
    if(titleWords.some(function(word){return word===token;})) return 95;
    if(titleWords.some(function(word){return word.startsWith(token);})) return 82;
    if(title.includes(token)) return 72;
    if(bodyWords.some(function(word){return word===token;})) return 58;
    if(bodyWords.some(function(word){return word.startsWith(token);})) return 50;
    if(body.includes(token)) return 38;
    if(tokenStem.length>=4){
      var root=tokenStem.slice(0,Math.min(7,tokenStem.length));
      if(titleWords.some(function(word){return stem(word).startsWith(root)||root.startsWith(stem(word));})) return 46;
      if(bodyWords.some(function(word){return stem(word).startsWith(root)||root.startsWith(stem(word));})) return 28;
    }
    if(token.length>=4){
      var limit=token.length>=8?2:1;
      var titleFuzzy=titleWords.some(function(word){return Math.abs(word.length-token.length)<=limit && distance(word,token)<=limit;});
      if(titleFuzzy) return 35;
      var bodyFuzzy=bodyWords.slice(0,220).some(function(word){return Math.abs(word.length-token.length)<=limit && distance(word,token)<=limit;});
      if(bodyFuzzy) return 16;
    }
    return 0;
  }
  function scoreRecord(record,query,activeKey){
    var groups=queryGroups(query);
    if(!groups.length) return record.isBlock?10:1;
    var total=0;
    for(var i=0;i<groups.length;i+=1){
      var score=Math.max.apply(null,groups[i].map(function(token){return tokenScore(record,token);}));
      if(!score) return 0;
      total+=score;
    }
    if(sourceKey(record.path,record.org,record.department)===activeKey) total+=12;
    if(record.isBlock) total-=6;
    total+=Math.max(0,18-Math.min(18,Math.floor(record.text.length/220)));
    return total;
  }
  function snippet(record,query,maxLength){
    var text=String(record.text||"").replace(/\s+/g," ").trim();
    var tokens=queryTokens(query);
    var lower=normalize(text);
    var index=-1;
    tokens.some(function(token){var found=lower.indexOf(token);if(found>=0){index=found;return true;}return false;});
    var max=maxLength||210;
    if(text.length<=max) return text;
    var start=index>70?Math.max(0,index-65):0;
    var piece=text.slice(start,start+max);
    return (start?"…":"")+piece+(start+max<text.length?"…":"");
  }
  function highlight(value,query){
    var safe=escapeHtml(value);
    var tokens=queryTokens(query).filter(function(token){return token.length>1||/\d/.test(token);}).sort(function(a,b){return b.length-a.length;});
    if(!tokens.length) return safe;
    var pattern=tokens.map(escapeRegExp).join("|");
    try{return safe.replace(new RegExp("("+pattern+")","giu"),"<mark>$1</mark>");}catch(_){return safe;}
  }

  window.RPCabinetSmartSearchTest={normalize:normalize,stem:stem,queryGroups:queryGroups,queryTokens:queryTokens,scoreRecord:scoreRecord,sourceKey:sourceKey};

  if(typeof document==="undefined") return;

  var ui={};
  var index=[];
  var indexVersion=0;
  var state={
    mode:"current",
    filterPath:"",
    filterOrg:"",
    selected:new Set(),
    query:"",
    filtersOpen:false,
    results:[]
  };

  function el(id){return document.getElementById(id);}
  function availableSources(){
    var map=new Map();
    index.forEach(function(record){
      var key=sourceKey(record.path,record.org,record.department);
      if(!map.has(key)) map.set(key,{key:key,path:record.path,org:record.org,department:record.department,count:0});
      map.get(key).count+=1;
    });
    return Array.from(map.values()).sort(function(a,b){return [a.path,a.org,a.department].join("|").localeCompare([b.path,b.org,b.department].join("|"),"ru");});
  }
  function rebuildIndex(){
    index=buildIndex();
    indexVersion+=1;
    ensureFilterDefaults();
    if(ui.modal&&ui.modal.classList.contains("open")) renderAll();
    return index;
  }
  function ensureFilterDefaults(){
    var context=currentContext();
    var paths=(typeof ORGS!=="undefined"?Object.keys(ORGS):["Государственная служба","Крайм"]);
    if(!state.filterPath||paths.indexOf(state.filterPath)<0) state.filterPath=context.path&&paths.includes(context.path)?context.path:(paths[0]||"Государственная служба");
    var orgs=(typeof ORGS!=="undefined"&&ORGS[state.filterPath])?ORGS[state.filterPath]:[];
    if(!state.filterOrg||orgs.indexOf(state.filterOrg)<0) state.filterOrg=context.path===state.filterPath&&orgs.includes(context.org)?context.org:(orgs[0]||"");
    if(!state.selected.size){
      var key=currentKey();
      if(availableSources().some(function(item){return item.key===key;})) state.selected.add(key);
    }
  }
  function scopeRecords(){
    var active=currentKey();
    if(state.mode==="current") return index.filter(function(record){return sourceKey(record.path,record.org,record.department)===active;});
    if(!state.selected.size) return [];
    return index.filter(function(record){return state.selected.has(sourceKey(record.path,record.org,record.department));});
  }
  function scopeLabel(){
    var context=currentContext();
    if(state.mode==="current"){
      return context.org&&context.department ? [orgLabel(context.org),context.department].join(" → ") : "Текущий раздел не выбран";
    }
    var sources=availableSources().filter(function(item){return state.selected.has(item.key);});
    if(!sources.length) return "Область не выбрана";
    if(sources.length===1) return [orgLabel(sources[0].org),sources[0].department].join(" → ");
    return "Выбрано областей: "+sources.length;
  }
  function search(query){
    var active=currentKey();
    var records=scopeRecords();
    if(!normalize(query)){
      return records.filter(function(record){return record.isBlock;}).slice(0,10).map(function(record){return {record:record,score:10};});
    }
    return records.map(function(record){return {record:record,score:scoreRecord(record,query,active)};})
      .filter(function(item){return item.score>0;})
      .sort(function(a,b){return (b.score-a.score)||(a.record.title.localeCompare(b.record.title,"ru"));})
      .slice(0,40);
  }
  function isCurrentRecord(record){
    return sourceKey(record.path,record.org,record.department)===currentKey();
  }
  function resultHtml(item){
    var record=item.record;
    var query=state.query;
    var kind=record.kind==="tests"?"Тесты":"Информация";
    var preview=snippet(record,query,220);
    var canOpen=isCurrentRecord(record);
    return '<article class="smart-search-result" data-search-result="'+escapeHtml(record.id)+'">'+
      '<button class="smart-search-result-main" type="button" data-search-action="preview">'+
        '<div class="smart-search-breadcrumbs"><span>'+escapeHtml(pathLabel(record.path))+'</span><i></i><span>'+escapeHtml(orgLabel(record.org))+'</span><i></i><span>'+escapeHtml(record.department)+'</span><i></i><span>'+kind+'</span></div>'+
        '<h3>'+highlight(record.title,query)+'</h3>'+
        '<p>'+highlight(preview,query)+'</p>'+
      '</button>'+
      '<div class="smart-search-result-actions">'+
        '<button type="button" data-search-action="preview">Показать подробнее</button>'+
        (canOpen?'<button class="is-primary" type="button" data-search-action="open">Открыть в панели</button>':'')+
      '</div>'+
      '<div class="smart-search-result-preview" data-search-preview hidden>'+highlight(snippet(record,query,1250),query)+'</div>'+
    '</article>';
  }
  function renderResults(){
    state.results=search(state.query);
    var total=state.results.length;
    var scoped=scopeRecords().length;
    if(ui.count) ui.count.textContent=normalize(state.query)?("Найдено: "+total):("Материалов в области: "+scoped);
    if(ui.scope) ui.scope.textContent=scopeLabel();
    if(ui.clear) ui.clear.hidden=!state.query;
    if(!state.results.length){
      ui.results.innerHTML='';
      ui.empty.hidden=false;
      var title=normalize(state.query)?"Ничего не найдено":"В выбранной области пока нет материалов";
      var text=normalize(state.query)?"Попробуй другое слово, номер кода или измени область поиска.":"Открой «Где искать» и выбери доступный отдел.";
      ui.empty.innerHTML='<div><strong>'+title+'</strong><span>'+text+'</span></div>';
      return;
    }
    ui.empty.hidden=true;
    ui.results.innerHTML=state.results.map(resultHtml).join("");
  }
  function pathOptions(){ return (typeof ORGS!=="undefined"?Object.keys(ORGS):["Государственная служба","Крайм"]); }
  function orgOptions(path){ return (typeof ORGS!=="undefined"&&ORGS[path])?ORGS[path]:[]; }
  function renderFilters(){
    var context=currentContext();
    var sources=availableSources();
    ui.mode.innerHTML='<button type="button" data-search-mode="current" class="'+(state.mode==="current"?"is-active":"")+'">Текущий отдел</button><button type="button" data-search-mode="custom" class="'+(state.mode==="custom"?"is-active":"")+'">Выбранные области</button>';
    ui.pathList.innerHTML=pathOptions().map(function(path){
      var label=pathLabel(path);
      return '<button type="button" class="smart-search-chip '+(state.filterPath===path?"is-active":"")+'" data-search-path="'+escapeHtml(path)+'">'+label+'</button>';
    }).join("");
    var orgs=orgOptions(state.filterPath);
    ui.orgList.innerHTML=orgs.map(function(org){
      var has=sources.some(function(item){return item.path===state.filterPath&&item.org===org;});
      return '<button type="button" class="smart-search-chip '+(state.filterOrg===org?"is-active":"")+'" data-search-org="'+escapeHtml(org)+'" aria-label="'+escapeHtml(org+(has?"":" — материалов пока нет"))+'">'+escapeHtml(orgLabel(org))+'</button>';
    }).join("");
    var departments=sources.filter(function(item){return item.path===state.filterPath&&item.org===state.filterOrg;});
    ui.departmentList.innerHTML=departments.map(function(item){
      return '<button type="button" class="smart-search-chip smart-search-department-chip '+(state.selected.has(item.key)?"is-active":"")+'" data-search-department="'+escapeHtml(item.key)+'">'+escapeHtml(item.department)+'</button>';
    }).join("");
    ui.departmentEmpty.hidden=departments.length>0;
    ui.departmentEmpty.textContent=state.filterOrg?"Для этой организации материалов в панели пока нет.":"Выбери организацию.";
    if(ui.filters){ui.filters.hidden=!state.filtersOpen;}
    if(ui.filterToggle) ui.filterToggle.setAttribute("aria-expanded",String(state.filtersOpen));
    if(ui.currentHint){
      ui.currentHint.textContent=context.org&&context.department?([orgLabel(context.org),context.department].join(" → ")):"Организация и отдел не выбраны";
    }
  }
  function renderAll(){renderFilters();renderResults();}
  function openModal(){
    if(!index.length) rebuildIndex();
    ensureFilterDefaults();
    ui.modal.classList.add("open");
    ui.modal.setAttribute("aria-hidden","false");
    document.body.classList.add("smart-search-open");
    state.query=ui.input.value||"";
    renderAll();
    setTimeout(function(){ui.input.focus();ui.input.select();},50);
  }
  function closeModal(){
    ui.modal.classList.remove("open");
    ui.modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("smart-search-open");
  }
  function findRecord(id){
    var result=state.results.find(function(item){return item.record.id===id;});
    return result&&result.record;
  }
  function togglePreview(card){
    var preview=card&&card.querySelector("[data-search-preview]");
    if(!preview) return;
    preview.hidden=!preview.hidden;
    var button=card.querySelector('[data-search-action="preview"]:not(.smart-search-result-main)');
    if(button) button.textContent=preview.hidden?"Показать подробнее":"Скрыть подробности";
  }
  function liveCandidates(root){
    return topLevelCandidates(root);
  }
  function openRecord(record){
    if(!record||!isCurrentRecord(record)) return;
    try{if(typeof setActiveDashTab==="function") setActiveDashTab(record.kind==="tests"?"tests":"department");}catch(_){return;}
    closeModal();
    function locate(){
      var root=el(record.kind==="tests"?"departmentTestsContent":"departmentInfoContent");
      if(!root) return;
      var anchor=(record.anchorId&&root.querySelector("#"+(window.CSS&&CSS.escape?CSS.escape(record.anchorId):record.anchorId)))||
                 (record.blockId&&root.querySelector("#"+(window.CSS&&CSS.escape?CSS.escape(record.blockId):record.blockId)))||root;
      var target=anchor;
      if(record.itemIndex>=0){
        var candidates=liveCandidates(anchor);
        target=candidates[record.itemIndex]||anchor;
      }
      var cursor=target;
      while(cursor&&cursor!==root){if(cursor instanceof HTMLDetailsElement) cursor.open=true;cursor=cursor.parentElement;}
      if(anchor instanceof HTMLDetailsElement) anchor.open=true;
      var parentDetails=anchor.closest&&anchor.closest("details");
      while(parentDetails){parentDetails.open=true;parentDetails=parentDetails.parentElement&&parentDetails.parentElement.closest("details");}
      target.classList.add("smart-search-target-flash");
      target.scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(function(){target.classList.remove("smart-search-target-flash");},1500);
    }
    setTimeout(locate,80);
    setTimeout(locate,260);
  }
  function selectAllVisibleDepartments(){
    availableSources().filter(function(item){return item.path===state.filterPath&&item.org===state.filterOrg;}).forEach(function(item){state.selected.add(item.key);});
  }
  function bind(){
    ui.modal=el("smartSearchModal");
    ui.input=el("smartSearchInput");
    ui.clear=el("smartSearchClear");
    ui.close=el("closeSmartSearch");
    ui.filterToggle=el("smartSearchScopeToggle");
    ui.filters=el("smartSearchFilters");
    ui.mode=el("smartSearchMode");
    ui.pathList=el("smartSearchPathList");
    ui.orgList=el("smartSearchOrgList");
    ui.departmentList=el("smartSearchDepartmentList");
    ui.departmentEmpty=el("smartSearchDepartmentEmpty");
    ui.results=el("smartSearchResults");
    ui.empty=el("smartSearchEmpty");
    ui.count=el("smartSearchCount");
    ui.scope=el("smartSearchScopeLabel");
    ui.currentHint=el("smartSearchCurrentHint");
    if(!ui.modal||!ui.input||!ui.results) return;

    [el("openSmartSearch"),el("smartSearchMobileTrigger")].filter(Boolean).forEach(function(button){button.addEventListener("click",openModal);});
    ui.close.addEventListener("click",closeModal);
    ui.modal.addEventListener("click",function(event){if(event.target===ui.modal) closeModal();});
    document.addEventListener("keydown",function(event){
      if(event.key==="Escape"&&ui.modal.classList.contains("open")){event.preventDefault();closeModal();}
      if((event.ctrlKey||event.metaKey)&&event.key.toLocaleLowerCase()==="k"){event.preventDefault();openModal();}
    });
    var inputTimer=0;
    ui.input.addEventListener("input",function(){
      state.query=ui.input.value;
      clearTimeout(inputTimer);
      inputTimer=setTimeout(renderResults,35);
    });
    ui.clear.addEventListener("click",function(){ui.input.value="";state.query="";renderResults();ui.input.focus();});
    ui.filterToggle.addEventListener("click",function(){state.filtersOpen=!state.filtersOpen;renderFilters();});
    ui.filters.addEventListener("click",function(event){
      var mode=event.target.closest("[data-search-mode]");
      if(mode){state.mode=mode.dataset.searchMode;renderAll();return;}
      var path=event.target.closest("[data-search-path]");
      if(path){state.filterPath=path.dataset.searchPath;var orgs=orgOptions(state.filterPath);state.filterOrg=orgs[0]||"";renderFilters();return;}
      var org=event.target.closest("[data-search-org]");
      if(org){state.filterOrg=org.dataset.searchOrg;renderFilters();return;}
      var department=event.target.closest("[data-search-department]");
      if(department){var key=department.dataset.searchDepartment;if(state.selected.has(key))state.selected.delete(key);else state.selected.add(key);state.mode="custom";renderAll();return;}
      if(event.target.closest("[data-search-select-all]")){selectAllVisibleDepartments();state.mode="custom";renderAll();return;}
      if(event.target.closest("[data-search-reset]")){state.selected.clear();var key=currentKey();if(availableSources().some(function(item){return item.key===key;}))state.selected.add(key);state.mode="current";renderAll();}
    });
    ui.results.addEventListener("click",function(event){
      var card=event.target.closest("[data-search-result]");
      if(!card) return;
      var action=event.target.closest("[data-search-action]");
      if(!action) return;
      var record=findRecord(card.dataset.searchResult);
      if(action.dataset.searchAction==="open") openRecord(record);
      else togglePreview(card);
    });
    document.addEventListener("kiri:source-blocks-updated",function(){setTimeout(rebuildIndex,30);});
    document.addEventListener("kiri:profile-pins-changed",function(){if(ui.modal.classList.contains("open"))renderAll();});
    window.addEventListener("rp-cabinet:profile-applied",function(){if(ui.modal.classList.contains("open"))renderAll();});
    if("requestIdleCallback" in window) requestIdleCallback(rebuildIndex,{timeout:1200});
    else setTimeout(rebuildIndex,120);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();
