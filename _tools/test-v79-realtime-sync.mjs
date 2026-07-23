import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const syncCode=fs.readFileSync(path.join(root,'js/core/sync-merge.js'),'utf8');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const storage=fs.readFileSync(path.join(root,'js/core/storage-config.js'),'utf8');
const version=fs.readFileSync(path.join(root,'js/core/version.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

const memory=new Map();
const sandbox={
  console,Date,Math,JSON,Set,Object,
  window:{__cloudSessionId:'session-test'},
  localStorage:{
    getItem:key=>memory.has(key)?memory.get(key):null,
    setItem:(key,value)=>memory.set(key,String(value)),
    removeItem:key=>memory.delete(key)
  },
  getCloudDeviceId:()=> 'device-test',
  progressContextKeyFor:state=>state?.contextKey||''
};
vm.createContext(sandbox);
vm.runInContext(syncCode,sandbox);

const cloud={
  ready:true,name:'KIRI',configured:true,contextKey:'ctx',
  project:'GTA5RP',path:'Государственная служба',org:'ARMY',section:'USAF',level:'3 → 4',
  progressByContext:{ctx:{A:true}},selectedLevelBySection:{},proofsByContext:{},reportsByContext:{}
};

// Телефон ставит вторую галочку: первая обязана сохраниться.
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'B',true);
let phoneBatch=sandbox.readPendingProfileSyncPatch();
let serverAfterPhone=sandbox.applyProfileSyncPatch(cloud,phoneBatch);
assert.equal(serverAfterPhone.progressByContext.ctx.A,true);
assert.equal(serverAfterPhone.progressByContext.ctx.B,true);
sandbox.acknowledgePendingProfileSyncPatch(phoneBatch);

// ПК меняет другую галочку поверх уже свежего серверного состояния.
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'C',true);
const pcBatch=sandbox.readPendingProfileSyncPatch();
const serverAfterPc=sandbox.applyProfileSyncPatch(serverAfterPhone,pcBatch);
assert.deepEqual(Object.keys(serverAfterPc.progressByContext.ctx).sort(),['A','B','C']);
sandbox.acknowledgePendingProfileSyncPatch(pcBatch);

// Старый локальный снимок при открытии не содержит операций и не влияет на Firebase.
const emptyQueue=sandbox.readPendingProfileSyncPatch();
assert.equal(sandbox.profileSyncPatchHasChanges(emptyQueue),false);
assert.deepEqual(Object.keys(sandbox.applyProfileSyncPatch(serverAfterPc,emptyQueue).progressByContext.ctx).sort(),['A','B','C']);

// Снятие галочки — отдельная операция false, остальные не затрагиваются.
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'B',false);
const uncheckBatch=sandbox.readPendingProfileSyncPatch();
const serverAfterUncheck=sandbox.applyProfileSyncPatch(serverAfterPc,uncheckBatch);
assert.equal(serverAfterUncheck.progressByContext.ctx.B,undefined);
assert.equal(serverAfterUncheck.progressByContext.ctx.A,true);
assert.equal(serverAfterUncheck.progressByContext.ctx.C,true);

// Новая операция по той же цели во время отправки не удаляется подтверждением старой.
memory.clear();
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'A',true);
const inFlight=sandbox.readPendingProfileSyncPatch();
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'A',false);
sandbox.acknowledgePendingProfileSyncPatch(inFlight);
const remaining=sandbox.readPendingProfileSyncPatch();
assert.equal(remaining.operations.length,1);
assert.equal(remaining.operations[0].value,false);
assert.ok(remaining.operations[0].supersedesIds.includes(inFlight.operations[0].id));
const causallyNewer=sandbox.applyProfileSyncPatchWithGuards(
  {...serverAfterPc,progressByContext:{ctx:{...serverAfterPc.progressByContext.ctx,A:true}}},
  remaining,
  {
    targetRevisions:{'task:ctx:A':11},
    targetMutationIds:{'task:ctx:A':inFlight.operations[0].id},
    processedMutationIds:[inFlight.operations[0].id]
  },
  12
);
assert.equal(causallyNewer.state.progressByContext.ctx.A,undefined);
assert.equal(causallyNewer.acceptedIds.length,1);

// Повтор уже подтверждённой операции после закрытия вкладки не применяется снова.
memory.clear();
sandbox.window.CloudSync={lastAppliedRevision:10};
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'A',false);
const onceBatch=sandbox.readPendingProfileSyncPatch();
const onceResult=sandbox.applyProfileSyncPatchWithGuards(
  serverAfterPc,
  onceBatch,
  {targetRevisions:{},processedMutationIds:[]},
  11
);
assert.equal(onceResult.state.progressByContext.ctx.A,undefined);
const replayResult=sandbox.applyProfileSyncPatchWithGuards(
  serverAfterPc,
  onceBatch,
  {targetRevisions:onceResult.targetRevisions,processedMutationIds:onceResult.processedMutationIds},
  12
);
assert.equal(replayResult.state.progressByContext.ctx.A,true);
assert.equal(replayResult.acceptedIds.length,0);
assert.equal(replayResult.skippedIds.length,1);

// Старая операция по уже изменённой цели не откатывает новую облачную версию.
memory.clear();
sandbox.window.CloudSync={lastAppliedRevision:5};
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'A',false);
const staleBatch=sandbox.readPendingProfileSyncPatch();
const staleGuarded=sandbox.applyProfileSyncPatchWithGuards(
  serverAfterPc,
  staleBatch,
  {targetRevisions:{'task:ctx:A':8},processedMutationIds:[]},
  9
);
assert.equal(staleGuarded.state.progressByContext.ctx.A,true);
assert.equal(staleGuarded.acceptedIds.length,0);
assert.equal(staleGuarded.skippedIds.length,1);

// Старая операция по другой цели всё равно применяется и не теряется.
memory.clear();
sandbox.window.CloudSync={lastAppliedRevision:5};
sandbox.queueProfileTaskSyncMutation({contextKey:'ctx'},'D',true);
const unrelatedBatch=sandbox.readPendingProfileSyncPatch();
const unrelatedGuarded=sandbox.applyProfileSyncPatchWithGuards(
  serverAfterPc,
  unrelatedBatch,
  {targetRevisions:{'task:ctx:A':8},processedMutationIds:[]},
  9
);
assert.equal(unrelatedGuarded.state.progressByContext.ctx.A,true);
assert.equal(unrelatedGuarded.state.progressByContext.ctx.D,true);
assert.equal(unrelatedGuarded.acceptedIds.length,1);

assert.match(app,/CLOUD_PROFILE_ID='default_v79_realtime'/);
assert.match(app,/onSnapshot\(\{includeMetadataChanges:true\}/);
assert.match(app,/applyProfileSyncPatchWithGuards\(/);
assert.match(app,/targetRevisions:data\.targetRevisions/);
assert.match(app,/targetMutationIds:data\.targetMutationIds/);
assert.doesNotMatch(app,/data\.sourceDevice===getCloudDeviceId\(\)/);
assert.doesNotMatch(app,/localUpdated>=cloudUpdated/);
assert.doesNotMatch(app,/if\(isUsableProfileState\(S\).*finishProfileBoot/);
assert.match(syncCode,/kiri:rp-cabinet:v79:mutation-queue/);
assert.doesNotMatch(syncCode,/pending-sync-patch/);
assert.match(storage,/V79_REALTIME/);
assert.match(version,/TEST_VERSION="79"/);
assert.match(version,/Realtime cloud sync/);
assert.match(index,/TEST v79 · Realtime cloud sync/);
assert.doesNotMatch(index,/\?v=78/);

console.log('RP CABINET v79 realtime synchronization tests: OK');
