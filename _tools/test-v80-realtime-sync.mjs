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
const contextKey='GTA5RP::Государственная%20служба::ARMY::USAF::3%20%E2%86%92%204';
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
assert.match(index,/realtime-state\.js\?v=80/);
assert.match(index,/TEST v80 · True realtime Firebase sync/);

console.log('RP CABINET v80 true realtime synchronization tests: OK');
