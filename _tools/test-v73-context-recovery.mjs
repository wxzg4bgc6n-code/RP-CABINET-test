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

const deliberatePartial=sandbox.recoverProfileContextState({
  ...blankCloud,
  org:'ARMY'
},null);
assert.equal(deliberatePartial.recovered,false,'Начатый пользователем частичный выбор нельзя заменять старым');

storage.clear();
const fallbackRestored=sandbox.recoverProfileContextState(blankCloud,complete);
assert.equal(fallbackRestored.recovered,true);
assert.equal(fallbackRestored.state.section,'USAF');

assert.match(appSource,/if\(!passiveLoad\) rememberProfileContextCheckpoint\(S\)/);
assert.match(appSource,/queueProfileGroupSyncMutation\('context',profileContextValues\(S\)\)/);
assert.match(appSource,/clientVersion:73/);

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

assert.match(read('js/core/version.js'),/TEST_VERSION="73"/);
assert.match(read('css/core.css'),/TEST v73 · Context recovery \+ 10 files/);
assert.match(read('index.html'),/modular-v73-context-recovery-10-files/);

console.log('v73 context recovery, clean guidance, upload auth and 10-file report limit: OK');
