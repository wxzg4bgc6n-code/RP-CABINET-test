import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const helper=fs.readFileSync(path.join(root,'js/core/realtime-state.js'),'utf8');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context={console,Date,JSON,encodeURIComponent,decodeURIComponent,Map,Set,Object,Array,String,Number,Math,TextEncoder,TextDecoder,Uint8Array,btoa,atob};
vm.createContext(context);
vm.runInContext(`${helper}\nthis.api={realtimeEncodeKey,realtimeDecodeKey,buildRealtimeCloudDocument,realtimeCloudDocumentToState,buildRealtimeStateDiff,applyRealtimeOperationsToDocument};`,context);
const api=context.api;

function state(overrides={}){
  return {
    ready:true,name:'KIRI',project:'GTA5RP',path:'Государственная служба',style:'style-violet',
    org:'ARMY',section:'USAF',level:'3 → 4',configured:true,tasks:{},progressByContext:{},
    selectedLevelBySection:{},proofsByContext:{},reportsByContext:{},
    pinnedDepartmentBlocks:[],pinnedAcademyBlocks:[],premiumSelectedActivities:[],account:{createdAt:1700000000000,initialName:'KIRI'},
    ...overrides
  };
}
const contextKey='GTA5RP::Государственная%20служба::ARMY::USAF::3%20%E2%87%92%204';
const taskA='Сдать экзамен 1.1';
const taskB='Выполнить патруль / доклад';

assert.equal(api.realtimeDecodeKey(api.realtimeEncodeKey('Точка. A/B % 1')),'Точка. A/B % 1');

let phone=state();
let cloud=api.buildRealtimeCloudDocument(phone,{profileId:'default_realtime',ownerUid:'u',revision:1});
let pc=api.realtimeCloudDocumentToState(cloud,{});

// Телефон ставит первую галку — в облако уходит только её путь.
const phoneBefore=structuredClone(phone);
phone.progressByContext[contextKey]={[taskA]:true};
phone.tasks={[taskA]:true};
let ops=api.buildRealtimeStateDiff(phoneBefore,phone);
assert.equal(ops.filter(op=>op.path.includes('.tasks.')).length,1);
assert.ok(ops.some(op=>op.type==='set'&&op.path.includes(api.realtimeEncodeKey(taskA))));
cloud=api.applyRealtimeOperationsToDocument(cloud,ops);
pc=api.realtimeCloudDocumentToState(cloud,{});
assert.equal(pc.progressByContext[contextKey][taskA],true);

// ПК ставит вторую галку — первая остаётся.
const pcBefore=structuredClone(pc);
pc.progressByContext[contextKey][taskB]=true;
pc.tasks={[taskA]:true,[taskB]:true};
ops=api.buildRealtimeStateDiff(pcBefore,pc);
assert.equal(ops.filter(op=>op.path.includes('.tasks.')).length,1);
cloud=api.applyRealtimeOperationsToDocument(cloud,ops);
phone=api.realtimeCloudDocumentToState(cloud,{});
assert.deepEqual(Object.keys(phone.progressByContext[contextKey]).sort(),[taskA,taskB].sort());

// Телефон снимает первую галку — вторая не удаляется.
const uncheckBefore=structuredClone(phone);
delete phone.progressByContext[contextKey][taskA];
phone.tasks={[taskB]:true};
ops=api.buildRealtimeStateDiff(uncheckBefore,phone);
assert.equal(ops.filter(op=>op.type==='delete'&&op.path.includes('.tasks.')).length,1);
cloud=api.applyRealtimeOperationsToDocument(cloud,ops);
pc=api.realtimeCloudDocumentToState(cloud,{});
assert.equal(pc.progressByContext[contextKey][taskA],undefined);
assert.equal(pc.progressByContext[contextKey][taskB],true);

// Несвязанные одновременные изменения сливаются по отдельным путям.
const base=api.realtimeCloudDocumentToState(cloud,{});
const phoneEdit=structuredClone(base); phoneEdit.style='style-emerald';
const pcEdit=structuredClone(base); pcEdit.name='KIRI PC';
cloud=api.applyRealtimeOperationsToDocument(cloud,api.buildRealtimeStateDiff(base,phoneEdit));
cloud=api.applyRealtimeOperationsToDocument(cloud,api.buildRealtimeStateDiff(base,pcEdit));
const merged=api.realtimeCloudDocumentToState(cloud,{});
assert.equal(merged.style,'style-emerald');
assert.equal(merged.name,'KIRI PC');

// Открытие/обновление без пользовательского изменения не создаёт запись.
assert.equal(api.buildRealtimeStateDiff(merged,structuredClone(merged)).length,0);

// Закрытый старый телефон не имеет права отправить свой кэш при открытии.
const stalePhone=state({name:'СТАРЫЙ КЭШ',progressByContext:{[contextKey]:{[taskB]:true}}});
const serverOnOpen=api.realtimeCloudDocumentToState(cloud,stalePhone);
assert.equal(serverOnOpen.name,'KIRI PC');
assert.equal(api.buildRealtimeStateDiff(serverOnOpen,structuredClone(serverOnOpen)).length,0);

// Закрепления приходят из облачного S, а не из отдельного localStorage-ключа.
const pinBase=structuredClone(serverOnOpen);
const pinPhone=structuredClone(pinBase); pinPhone.pinnedDepartmentBlocks=['usaf-ten-codes']; pinPhone.pinnedAcademyBlocks=['usaf-ten-codes'];
cloud=api.applyRealtimeOperationsToDocument(cloud,api.buildRealtimeStateDiff(pinBase,pinPhone));
const pinPc=api.realtimeCloudDocumentToState(cloud,{});
assert.equal(JSON.stringify(pinPc.pinnedDepartmentBlocks),JSON.stringify(['usaf-ten-codes']));

// Премиальные активности разных устройств синхронизируются по отдельным элементам.
const premiumBase=structuredClone(pinPc);
const premiumPhone=structuredClone(premiumBase);
premiumPhone.premiumSelectedActivities=[{key:'КПП||1 час||3',name:'КПП',note:'1 час',points:3,count:1,order:0}];
const premiumPc=structuredClone(premiumBase);
premiumPc.premiumSelectedActivities=[{key:'Патруль||1 час||3',name:'Патруль',note:'1 час',points:3,count:1,order:0}];
cloud=api.applyRealtimeOperationsToDocument(cloud,api.buildRealtimeStateDiff(premiumBase,premiumPhone));
cloud=api.applyRealtimeOperationsToDocument(cloud,api.buildRealtimeStateDiff(premiumBase,premiumPc));
const premiumMerged=api.realtimeCloudDocumentToState(cloud,{});
assert.equal(JSON.stringify([...premiumMerged.premiumSelectedActivities.map(item=>item.key)].sort()),JSON.stringify(['КПП||1 час||3','Патруль||1 час||3'].sort()));

// Скриншоты и отчёты синхронизируются отдельными целями.
const proofBefore=structuredClone(merged);
const proofAfter=structuredClone(merged);
proofAfter.proofsByContext[contextKey]={[taskB]:{files:[{id:'f1',url:'https://example/f1.png'}],updatedAt:1}};
proofAfter.reportsByContext[contextKey]={id:'r1',url:'https://example/report',createdAt:1,expiresAt:2};
ops=api.buildRealtimeStateDiff(proofBefore,proofAfter);
assert.ok(ops.some(op=>op.path.startsWith('proofs.')));
assert.ok(ops.some(op=>op.path.startsWith('reports.')));

// Статические гарантии новой архитектуры.
assert.match(app,/CLOUD_PROFILE_ID='default_realtime'/);
assert.match(app,/enablePersistence\(\{synchronizeTabs:true\}\)/);
assert.match(app,/get\(\{source:'server'\}\)/);
assert.match(app,/profileRef\(\)\.update\(payload\)/);
assert.match(app,/window\.CloudSync\.commitDiff\(baseline,S\)/);
assert.doesNotMatch(app,/applyProfileSyncPatch|queuePendingProfileSyncDelta|readPendingProfileSyncPatch|syncRevision|targetRevisions/);
assert.doesNotMatch(index,/sync-merge\.js/);
assert.doesNotMatch(fs.readFileSync(path.join(root,'js/features/pinned-materials.js'),'utf8'),/localStorage\.setItem\(PIN_KEY/);
assert.doesNotMatch(app,/const savePremium=|localStorage\.setItem\(KEY,JSON\.stringify\(\{selected/);
assert.match(app,/premiumSelectedActivities/);
assert.match(index,/realtime-state\.js\?v=92/);
assert.match(index,/TEST v92 · mobile full-height search filters/);
assert.match(index,/class="profile-boot-screen"/);
assert.match(app,/classList\.add\('profile-boot-leaving'\)/);
const proofUi=fs.readFileSync(path.join(root,'js/features/progress-proofs.js'),'utf8');
assert.match(proofUi,/data-proof-toggle/);
assert.match(proofUi,/Скрыть скриншоты/);
assert.match(proofUi,/Показать скриншоты/);
assert.match(proofUi,/sessionStorage\.setItem\(COLLAPSED_GALLERIES_KEY/);
assert.match(proofUi,/reportGenerating/);
assert.match(proofUi,/Формирую отчёт…/);
assert.match(proofUi,/fetchWithTimeout\(`\$\{config\.apiBase\}\/api\/reports`/);
assert.match(proofUi,/Сервис не ответил за 20 секунд/);
const reportHtml=fs.readFileSync(path.join(root,'report.html'),'utf8');
const reportJs=fs.readFileSync(path.join(root,'js/report.js'),'utf8');
const reportCss=fs.readFileSync(path.join(root,'css/report.css'),'utf8');
assert.match(reportHtml,/__rpReportWatchdog/);
assert.match(reportHtml,/26000/);
assert.match(reportHtml,/report\.js\?v=92/);
assert.match(reportJs,/fetchWithTimeout/);
assert.match(reportJs,/AbortController/);
assert.match(reportJs,/attempt<=2/);
assert.match(reportJs,/report-task-separator/);
assert.match(reportCss,/\.report-task-separator/);
assert.match(reportCss,/\[hidden\]\{display:none!important\}/);
assert.match(reportJs,/function setReportView\(showState\)/);
assert.match(reportJs,/state\.style\.display=showState\?'':'none'/);
assert.match(reportHtml,/id="reportProfileAvatar"/);
assert.match(reportJs,/function renderProfileAvatar\(profile\)/);
assert.match(reportJs,/profile\?\.avatarUrl/);
assert.match(proofUi,/avatarUrl:typeof getGoogleProfilePhoto/);
const reportApi=fs.readFileSync(path.join(root,'proof-service/api/reports.js'),'utf8');
assert.match(reportApi,/function cleanAvatarUrl\(value\)/);
assert.match(reportApi,/avatarUrl:cleanAvatarUrl\(profile\.avatarUrl\)/);
assert.match(reportApi,/version:2/);

// Успешный ответ обязан убрать загрузчик из раскладки и показать аватар.
function mockElement(tagName='div'){
  return {
    tagName:tagName.toUpperCase(),
    hidden:false,
    style:{},
    classList:{add(){},remove(){},toggle(){}},
    children:[],
    textContent:'',
    innerHTML:'',
    addEventListener(){},
    querySelector(){return null;},
    replaceChildren(...children){this.children=children;}
  };
}
const reportElements={
  reportState:mockElement('section'),
  reportContent:mockElement('section'),
  reportProfileAvatar:mockElement('div'),
  copyReportUrl:mockElement('button')
};
reportElements.reportContent.hidden=true;
const reportRuntime={
  console,
  Date,
  URLSearchParams,
  AbortController,
  encodeURIComponent,
  setTimeout,
  clearTimeout,
  location:{search:`?id=${'a'.repeat(36)}`,href:'https://example.test/report.html'},
  navigator:{clipboard:{writeText:async()=>{}}},
  prompt(){},
  fetch:async()=>({
    ok:true,
    status:200,
    json:async()=>({
      profile:{name:'KIRI',project:'GTA5RP',org:'ARMY',section:'USAF',level:'5 → 6',avatarUrl:'https://example.test/avatar.png'},
      tasks:[],
      createdAt:Date.now(),
      expiresAt:Date.now()+1000
    })
  }),
  document:{
    title:'',
    getElementById(id){return reportElements[id]||null;},
    createElement(tagName){return mockElement(tagName);}
  }
};
reportRuntime.window=reportRuntime;
reportRuntime.window.RP_PROOF_SERVICE={apiBase:'https://example.test'};
reportRuntime.window.__rpReportStopWatchdog=()=>{};
vm.createContext(reportRuntime);
vm.runInContext(reportJs,reportRuntime);
await new Promise(resolve=>setImmediate(resolve));
await new Promise(resolve=>setImmediate(resolve));
assert.equal(reportElements.reportState.hidden,true);
assert.equal(reportElements.reportState.style.display,'none');
assert.equal(reportElements.reportContent.hidden,false);
assert.equal(reportElements.reportContent.style.display,'');
assert.equal(reportElements.reportProfileAvatar.children[0]?.tagName,'IMG');

const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const readmeVersions=Array.from(readme.matchAll(/^## (?:Что изменилось в|Сохранено из) v(\d+)$/gm),match=>Number(match[1]));
assert.deepEqual(readmeVersions,[92,91,90]);
assert.match(readme,/users\/\{uid\}\/profiles\/default_realtime/);
assert.match(readme,/Обновление страницы, авторизация и входящий снимок не вызывают обратную запись/);
assert.match(readme,/proof-service\/` без `node_modules/);
const smartSearch=fs.readFileSync(path.join(root,'js/features/smart-context-search.js'),'utf8');
const smartSearchCss=fs.readFileSync(path.join(root,'css/features/smart-context-search.css'),'utf8');
const mobileCss=fs.readFileSync(path.join(root,'css/responsive/mobile.css'),'utf8');
const mainCss=fs.readFileSync(path.join(root,'css/main.css'),'utf8');
assert.match(index,/js\/features\/smart-context-search\.js\?v=92/);
assert.match(mainCss,/features\/smart-context-search\.css\?v=92/);
assert.match(smartSearch,/function deriveCurrentScope\(source\)/);
assert.match(smartSearch,/if\(!data\.configured \|\| !SEARCHABLE_SECTIONS\.has\(section\)\) return ''/);
assert.match(smartSearch,/function syncDefaultScope\(force\)/);
assert.match(smartSearch,/if\(force \|\| !state\.customScope\)/);
assert.match(smartSearch,/state\.selectedScopes\.add\(next\)/);
assert.match(smartSearch,/function open\(\)\{[\s\S]*syncDefaultScope\(false\);[\s\S]*state\.opened=true/);
assert.match(smartSearch,/new MutationObserver\(\(\)=>syncDefaultScope\(false\)\)/);
assert.match(smartSearch,/tabs\.appendChild\(navButton\)/);
assert.match(smartSearch,/className='dash-tab smart-search-nav-button'/);
assert.match(smartSearch,/searchSettings\?\.addEventListener\('toggle'/);
assert.match(smartSearch,/classList\.toggle\('filter-open',searchSettings\.open\)/);
assert.match(smartSearch,/window\.matchMedia\('\(max-width: 820px\)'\)\.matches/);
assert.match(smartSearch,/getElementById\('smartSearchInput'\)\?\.blur\(\)/);
assert.match(smartSearch,/classList\.remove\('filter-open'\)/);
assert.doesNotMatch(smartSearchCss,/position:fixed[^}]*smart-search-nav-button/);
assert.doesNotMatch(smartSearchCss,/@media\s*\(\s*max-width/);
assert.match(smartSearchCss,/\.smart-search-settings\{[^}]*z-index:4[^}]*flex:0 0 auto/);
assert.match(smartSearchCss,/\.smart-search-settings>summary::after\{content:"Развернуть"/);
assert.match(smartSearchCss,/\.smart-search-settings\[open\]>summary::after\{content:"Свернуть"/);
assert.match(smartSearchCss,/\.smart-search-filter-body\{[^}]*max-height:min\(42vh,390px\)[^}]*overflow:auto/);
assert.match(smartSearchCss,/\.smart-search-results\{[^}]*flex:1 1 auto[^}]*min-height:0[^}]*overflow:auto/);
assert.match(mobileCss,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)!important/);
assert.match(mobileCss,/\.profile-card > \.dashboard-tabs \.smart-search-nav-button\{display:flex!important;/);
assert.match(mobileCss,/\.smart-search-filter-body\{max-height:min\(43vh,360px\);/);
assert.match(mobileCss,/height:100dvh/);
assert.match(mobileCss,/\.smart-search-dialog\.filter-open \.smart-search-settings\{[^}]*flex:1 1 auto[^}]*min-height:0/);
assert.match(mobileCss,/\.smart-search-dialog\.filter-open \.smart-search-filter-body\{[^}]*flex:1 1 auto[^}]*max-height:none[^}]*overflow-y:auto/);
assert.match(mobileCss,/\.smart-search-dialog\.filter-open \.smart-search-results\{display:none;\}/);
assert.ok(mainCss.indexOf('features/smart-context-search.css?v=92')<mainCss.indexOf('responsive/mobile.css?v=92'));

const deriveSource=smartSearch.match(/function deriveCurrentScope\(source\)\{[\s\S]*?\n  \}/)?.[0];
assert.ok(deriveSource);
const deriveContext={SEARCHABLE_SECTIONS:new Set(['Academy','USAF']),result:null};
vm.createContext(deriveContext);
vm.runInContext(`${deriveSource}
result=[
  deriveCurrentScope({configured:true,org:'ARMY',section:'USAF'}),
  deriveCurrentScope({configured:true,org:'ARMY',section:'Academy'}),
  deriveCurrentScope({configured:false,org:'ARMY',section:'USAF'}),
  deriveCurrentScope({configured:true,org:'ARMY',section:'MP'})
];`,deriveContext);
assert.deepEqual(Array.from(deriveContext.result),[
  'Государственная служба::ARMY::USAF',
  'Государственная служба::ARMY::Academy',
  '',
  ''
]);

// Памятка УАК/ПК добавляется после быстрых докладов и перед тен-кодами USAF.
const templateContext={window:{}};
vm.createContext(templateContext);
vm.runInContext(fs.readFileSync(path.join(root,'data/usaf/content.js'),'utf8'),templateContext);
vm.runInContext(fs.readFileSync(path.join(root,'data/usaf/law-guide.js'),'utf8'),templateContext);
const usafMarkup=templateContext.window.RPCabinetTemplates.find(item=>item.id==='usafInfoTemplateV20').markup;
assert.equal((usafMarkup.match(/id="usaf-law"/g)||[]).length,1);
assert.ok(usafMarkup.indexOf('id="usaf-law"')>usafMarkup.indexOf('id="usaf-quick"'));
assert.ok(usafMarkup.indexOf('id="usaf-law"')<usafMarkup.indexOf('id="usaf-ten"'));
assert.match(usafMarkup,/УАК и ПК для USAF: задержание и передача/);
assert.match(usafMarkup,/911-1/);
assert.match(usafMarkup,/Наручники/);
assert.doesNotMatch(usafMarkup,/usaf-law-group-head-v92"><span>0[1-8]/);
assert.doesNotMatch(usafMarkup,/Четыре правила из материалов National Guard/);
assert.ok(index.indexOf('data/usaf/law-guide.js?v=92')>index.indexOf('data/usaf/content.js?v=92'));
assert.ok(index.indexOf('data/usaf/law-guide.js?v=92')<index.indexOf('data/usaf/tests.js?v=92'));
const pinnedMaterials=fs.readFileSync(path.join(root,'js/features/pinned-materials.js'),'utf8');
assert.match(pinnedMaterials,/currentPromotionTaskTitles/);
assert.match(pinnedMaterials,/return orderedUsafMaterials\(\)/);
assert.match(pinnedMaterials,/name\.indexOf\("уак"\).*return "usaf-law"/);
assert.match(pinnedMaterials,/name\.indexOf\("протокол"\).*return "usaf-test-protocols"/);
assert.doesNotMatch(pinnedMaterials,/name\.indexOf\("frogger"\).*return "usaf-test-aircraft"/);
assert.doesNotMatch(pinnedMaterials,/name\.indexOf\("swift"\).*return "usaf-test-aircraft"/);
assert.doesNotMatch(pinnedMaterials,/name\.indexOf\("miljet"\).*return "usaf-test-aircraft"/);
assert.doesNotMatch(pinnedMaterials,/name\.indexOf\("пилотирован"\).*return "usaf-test-aircraft"/);
assert.match(pinnedMaterials,/name\.indexOf\("воздушн"\).*return "usaf-patrols"/);
assert.match(pinnedMaterials,/tasks\.indexOf\("уак"\)/);
assert.match(pinnedMaterials,/seen\.has\(id\)/);
assert.doesNotMatch(pinnedMaterials,/return \["usaf-law", "usaf-posts"/);
const mapperSource=pinnedMaterials.match(/function usafMaterialForTask\(task\)\{[\s\S]*?\n  \}/)?.[0];
assert.ok(mapperSource);
const mapperContext={};
vm.createContext(mapperContext);
vm.runInContext(`
  function low(value){ return String(value || "").toLowerCase(); }
  ${mapperSource}
  result=[
    "Сдать УАК и ПК у MP",
    "Сдать SWIFT",
    "Сдать вождение у SD",
    "Сдать парашютирование — «Легенда о призраках»",
    "Участие в 3 ГМП/МФМП/ВФМП или тренировке",
    "Участие в CO — 5"
  ].map(usafMaterialForTask);
`,mapperContext);
assert.deepEqual(Array.from(mapperContext.result),[
  "usaf-law",
  "",
  "",
  "",
  "",
  ""
]);
const surfaceState=fs.readFileSync(path.join(root,'js/features/surface-state.js'),'utf8');
assert.match(surfaceState,/rpCabinetOpenDetails_v92/);
assert.match(surfaceState,/sessionStorage\.setItem/);
assert.match(surfaceState,/visibilitychange/);
assert.match(surfaceState,/details\.open=Boolean\(openState\[key\]\)/);
assert.doesNotMatch(surfaceState,/attributes:true/);
const lawCss=fs.readFileSync(path.join(root,'css/features/usaf-law.css'),'utf8');
assert.doesNotMatch(lawCss,/#f59e0b|#fbbf24|245,158,11/);
assert.doesNotMatch(lawCss,/counter-reset:law-step|content:counter\(law-step\)/);
assert.match(lawCss,/\.usaf-law-group-head-v92\{[^}]*border:0/);
assert.match(lawCss,/\.usaf-law-flow-v92 li\{[^}]*flex-direction:column/);
assert.doesNotMatch(lawCss,/grid-template-columns:minmax\(160px/);

console.log('RP CABINET v92 mobile full-height search filters, law layout and realtime tests: OK');
