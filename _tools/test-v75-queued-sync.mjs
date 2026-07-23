import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

const root=path.resolve(import.meta.dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');

function functionSource(source,name){
  const marker=`function ${name}(`;
  const start=source.indexOf(marker);
  assert.notEqual(start,-1,`Не найдена функция ${name}`);
  const brace=source.indexOf('{',start);
  let depth=0;
  for(let index=brace;index<source.length;index+=1){
    if(source[index]==='{') depth+=1;
    if(source[index]==='}'){
      depth-=1;
      if(depth===0) return source.slice(start,index+1);
    }
  }
  throw new Error(`Не найден конец функции ${name}`);
}

const appSource=read('js/app.js');
const storage=new Map();
const sandbox={
  console,
  localStorage:{
    getItem:key=>storage.has(key)?storage.get(key):null,
    setItem:(key,value)=>storage.set(key,String(value))
  }
};
vm.createContext(sandbox);
vm.runInContext([
  "const PROFILE_CONTEXT_CHECKPOINT_KEY='kiri:rp-cabinet:v73:context-checkpoint';",
  functionSource(appSource,'profileContextValues'),
  functionSource(appSource,'hasCompleteProfileContext'),
  functionSource(appSource,'readProfileContextCheckpoint'),
  functionSource(appSource,'rememberProfileContextCheckpoint'),
  functionSource(appSource,'recoverProfileContextState')
].join('\n'),sandbox);

const complete={
  ready:true,
  name:'KIRI',
  project:'GTA5RP',
  path:'Государственная служба',
  org:'ARMY',
  section:'USAF',
  level:'2 → 3 — Рядовой первого класса',
  configured:true
};
sandbox.rememberProfileContextCheckpoint(complete);

const blankCloud={
  ready:true,
  name:'KIRI',
  project:'GTA5RP',
  path:'Государственная служба',
  org:'',
  section:'',
  level:'',
  configured:false
};
const restored=sandbox.recoverProfileContextState(blankCloud,null);
assert.equal(restored.recovered,true);
assert.equal(restored.state.org,'ARMY');
assert.equal(restored.state.section,'USAF');
assert.equal(restored.state.level,complete.level);
assert.equal(restored.state.configured,true);

const differentUser=sandbox.recoverProfileContextState({...blankCloud,name:'Другой игрок'},null);
assert.equal(differentUser.recovered,false,'Контекст другого профиля нельзя подставлять');

const partialCloud=sandbox.recoverProfileContextState({
  ...blankCloud,
  org:'ARMY'
},null);
assert.equal(partialCloud.recovered,true,'Неполный облачный контекст должен восстанавливаться до последнего подтверждённого');
assert.equal(partialCloud.state.section,'USAF');

const contradictoryCloud=sandbox.recoverProfileContextState({
  ...blankCloud,
  configured:true
},null);
assert.equal(contradictoryCloud.recovered,true,'Противоречивый configured не должен блокировать восстановление');

const checkpointBefore=storage.get('kiri:rp-cabinet:v73:context-checkpoint');
assert.equal(sandbox.rememberProfileContextCheckpoint(blankCloud),false,'Неполное состояние нельзя записывать в контрольную точку');
assert.equal(storage.get('kiri:rp-cabinet:v73:context-checkpoint'),checkpointBefore,'Рабочая контрольная точка должна сохраниться');

storage.clear();
const fallbackRestored=sandbox.recoverProfileContextState(blankCloud,complete);
assert.equal(fallbackRestored.recovered,true);
assert.equal(fallbackRestored.state.section,'USAF');

assert.match(appSource,/if\(!passiveLoad\) rememberProfileContextCheckpoint\(S\)/);
assert.match(appSource,/queueProfileGroupSyncMutation\('context',profileContextValues\(S\)\)/);
assert.match(appSource,/clientVersion:75/);
assert.match(appSource,/progressAnimationTarget===to/);
assert.match(appSource,/displayedProgress=current/);
assert.match(appSource,/hasCompleteProfileContext\(S\)\) finishProfileBoot\(\)/);
assert.match(appSource,/contextRank>bestContextRank/);
assert.match(appSource,/if\(window\.__cloudSaving\)\{\s*this\.saveAgainRequested=true;\s*return;/);
assert.match(appSource,/document\.querySelectorAll\('#tasks input\[data-task\]'\)\.forEach/);

const syncStorage=new Map();
const syncSandbox={
  console,
  window:{},
  localStorage:{
    getItem:key=>syncStorage.has(key)?syncStorage.get(key):null,
    setItem:(key,value)=>syncStorage.set(key,String(value)),
    removeItem:key=>syncStorage.delete(key)
  }
};
vm.createContext(syncSandbox);
const syncSource=read('js/core/sync-merge.js');
vm.runInContext([
  "const PROFILE_PENDING_PATCH_KEY='kiri:rp-cabinet:v69:pending-sync-patch';",
  'const PROFILE_TASK_UI_LOCK_TTL=30000;',
  "function progressContextKeyFor(){return 'ctx';}",
  functionSource(syncSource,'cloneProfileSyncValue'),
  functionSource(syncSource,'emptyProfileSyncPatch'),
  functionSource(syncSource,'readPendingProfileSyncPatch'),
  functionSource(syncSource,'writePendingProfileSyncPatch'),
  functionSource(syncSource,'mergePendingProfileSyncPatches'),
  functionSource(syncSource,'profileTaskUiLockStore'),
  functionSource(syncSource,'rememberProfileTaskUiLock'),
  functionSource(syncSource,'queueProfileTaskSyncMutation')
].join('\n'),syncSandbox);
syncSandbox.queueProfileTaskSyncMutation({},'Первая задача',true);
syncSandbox.queueProfileTaskSyncMutation({},'Вторая задача',true);
const twoChecks=syncSandbox.readPendingProfileSyncPatch();
assert.equal(twoChecks.progress.contexts.ctx['Первая задача'],true);
assert.equal(twoChecks.progress.contexts.ctx['Вторая задача'],true);

const animationSamples=[];
let animationNow=0;
let nextAnimationId=1;
const animationCallbacks=new Map();
const ring={
  style:{setProperty(name,value){if(name==='--p') animationSamples.push(Number(value));}},
  classList:{add(){},remove(){}}
};
const percentEl={textContent:'0%'};
const animationSandbox={
  performance:{now:()=>animationNow},
  setTimeout:callback=>callback(),
  requestAnimationFrame(callback){
    const id=nextAnimationId++;
    animationCallbacks.set(id,callback);
    return id;
  },
  cancelAnimationFrame(id){animationCallbacks.delete(id);}
};
vm.createContext(animationSandbox);
vm.runInContext([
  'let displayedProgress=0;',
  'let progressAnimationFrame=null;',
  'let progressAnimationTarget=null;',
  'const ring=globalThis.__ring;',
  'const percentEl=globalThis.__percentEl;',
  "const $=selector=>selector==='#ring'?ring:selector==='#percent'?percentEl:null;",
  functionSource(appSource,'animateProgressTo')
].join('\n'),Object.assign(animationSandbox,{__ring:ring,__percentEl:percentEl}));
function stepAnimation(ms){
  animationNow=ms;
  const callbacks=[...animationCallbacks.values()];
  animationCallbacks.clear();
  callbacks.forEach(callback=>callback(ms));
}
animationSandbox.animateProgressTo(50);
stepAnimation(0);
stepAnimation(180);
const beforeRepeat=Number.parseInt(percentEl.textContent,10);
animationSandbox.animateProgressTo(50);
assert.equal(Number.parseInt(percentEl.textContent,10),beforeRepeat,'Повторная отрисовка не должна сбрасывать видимый процент');
stepAnimation(360);
stepAnimation(540);
stepAnimation(720);
assert.equal(percentEl.textContent,'50%');
for(let index=1;index<animationSamples.length;index+=1){
  assert.ok(animationSamples[index]>=animationSamples[index-1],`Анимация отскочила назад: ${animationSamples[index-1]} → ${animationSamples[index]}`);
}

const configSource=read('js/config/proof-service.js');
const proofsSource=read('js/features/progress-proofs.js');
const proofsCss=read('css/features/progress-proofs.css');
assert.match(configSource,/maxFilesPerTask:10/);
assert.doesNotMatch(proofsSource,/maxFilesPerTask\|\|6/);
assert.match(proofsSource,/maxFilesPerTask\|\|10/);
assert.match(proofsSource,/class="proof-guidance/);
assert.match(proofsCss,/\.proof-guidance\{[\s\S]*border:1px solid var\(--line\)/);

const authSource=read('proof-service/lib/auth.js');
const packageJson=JSON.parse(read('proof-service/package.json'));
assert.doesNotMatch(authSource,/firebase-admin/);
assert.equal(packageJson.dependencies?.['firebase-admin'],undefined);
assert.match(authSource,/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup/);

const authModule=await import(`${pathToFileURL(path.join(root,'proof-service/lib/auth.js')).href}?test=${Date.now()}`);
const originalFetch=globalThis.fetch;
let calledUrl='';
let calledBody=null;
globalThis.fetch=async (url,options)=>{
  calledUrl=String(url);
  calledBody=JSON.parse(options.body);
  return {ok:true,json:async()=>({users:[{localId:'uid-73',email:'test@example.com',emailVerified:true}]})};
};
const verified=await authModule.verifyFirebaseToken('token-73');
assert.equal(verified.uid,'uid-73');
assert.equal(calledBody.idToken,'token-73');
assert.match(calledUrl,/accounts:lookup\?key=/);
globalThis.fetch=originalFetch;

assert.match(read('js/core/version.js'),/TEST_VERSION="75"/);
assert.match(read('css/core.css'),/TEST v75 · Queued sync \+ stable checks/);
assert.match(read('index.html'),/modular-v75-queued-sync-stable-checks/);
assert.match(read('index.html'),/TEST v75 · Queued sync \+ stable checks/);
assert.match(read('index.html'),/js\/app\.js\?v=75/);
assert.match(read('index.html'),/css\/main\.css\?v=75/);
assert.match(read('css/main.css'),/core\.css\?v=75/);

console.log('v75 queued sync, stable checks, cache bust, profile persistence and smooth progress: OK');
