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
  throw new Error(`Не найдён конец функции ${name}`);
}

const appSource=read('js/app.js');
const profileSandbox={};
vm.createContext(profileSandbox);
vm.runInContext([
  functionSource(appSource,'hasUsableProfileName'),
  functionSource(appSource,'isRecoverableProfileState')
].join('\n'),profileSandbox);

assert.equal(profileSandbox.hasUsableProfileName({name:'Игрок'}),true);
assert.equal(profileSandbox.isRecoverableProfileState({
  ready:false,
  name:'Игрок',
  progressByContext:{}
}),true,'Существующий профиль с ником «Игрок» должен восстанавливаться');
assert.equal(profileSandbox.isRecoverableProfileState({
  ready:false,
  name:'',
  account:{initialName:'Старый игрок'}
}),true,'Старое исходное имя должно восстанавливать профиль');
assert.equal(profileSandbox.isRecoverableProfileState({
  ready:false,
  name:'',
  cloud:{googleName:'Google User'},
  progressByContext:{}
}),false,'Одного Google-имени недостаточно для автоматического создания RP-профиля');
assert.match(appSource,/const wasRecoverableProfile=isRecoverableProfileState\(d\)/);
assert.match(appSource,/wasRecoverableProfile\s*\|\|\s*merged\.ready===true/);

const syncSource=read('js/core/sync-merge.js');
const syncSandbox={
  window:{},
  Date,
  JSON,
  Object,
  Array,
  Number,
  progressContextKeyFor:()=> 'GTA5RP|Государственная служба|NG|USAF|2'
};
vm.createContext(syncSandbox);
vm.runInContext([
  'const PROFILE_TASK_UI_LOCK_TTL=30000;',
  functionSource(syncSource,'cloneProfileSyncValue'),
  functionSource(syncSource,'profileTaskUiLockStore'),
  functionSource(syncSource,'rememberProfileTaskUiLock'),
  functionSource(syncSource,'applyProfileTaskUiLocks'),
  functionSource(syncSource,'acknowledgeProfileTaskUiLocks')
].join('\n'),syncSandbox);

const contextKey='GTA5RP|Государственная служба|NG|USAF|2';
syncSandbox.rememberProfileTaskUiLock(contextKey,'Участие в СО',false);
let visible=syncSandbox.applyProfileTaskUiLocks({
  progressByContext:{[contextKey]:{'Участие в СО':true}}
});
assert.equal(visible.progressByContext[contextKey]['Участие в СО'],undefined,
  'Старый снимок облака не должен на миг возвращать снятую галку');
syncSandbox.acknowledgeProfileTaskUiLocks({
  progressByContext:{[contextKey]:{}}
});
assert.equal(Object.keys(syncSandbox.window.__profileTaskUiLocks).length,0,
  'Блокировка интерфейса должна сниматься после подтверждения облаком');

const proofsSource=read('js/features/progress-proofs.js');
const proofsCss=read('css/features/progress-proofs.css');
assert.match(proofsSource,/class="proof-guidance/);
assert.match(proofsSource,/proof-service-note[\s\S]*proof-empty/);
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
  return {ok:true,json:async()=>({users:[{localId:'uid-72',email:'test@example.com',emailVerified:true}]})};
};
const verified=await authModule.verifyFirebaseToken('token-72');
assert.equal(verified.uid,'uid-72');
assert.equal(calledBody.idToken,'token-72');
assert.match(calledUrl,/accounts:lookup\?key=/);
globalThis.fetch=originalFetch;

assert.match(read('js/core/version.js'),/TEST_VERSION="72"/);
assert.match(read('index.html'),/modular-v72-profile-upload-stable/);

console.log('v72 profile recovery, clean checkbox UI, proof guidance and upload auth: OK');
