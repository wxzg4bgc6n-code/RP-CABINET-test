import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const store=new Map();
const sandbox={
  console,
  Date,
  JSON,
  Object,
  Array,
  Number,
  String,
  Set,
  Math,
  encodeURIComponent,
  localStorage:{
    getItem:key=>store.has(key)?store.get(key):null,
    setItem:(key,val)=>store.set(key,String(val)),
    removeItem:key=>store.delete(key)
  },
  window:{},
  progressContextKeyFor:()=> 'ctx'
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/core/sync-merge.js'),'utf8'),sandbox);

sandbox.queueProfileTaskSyncMutation({configured:true},'Первая задача',true);
sandbox.queueProfileTaskSyncMutation({configured:true},'Вторая задача',true);
const pending=sandbox.readPendingProfileSyncPatch();
assert.equal(pending.progress.contexts.ctx['Первая задача'],true);
assert.equal(pending.progress.contexts.ctx['Вторая задача'],true);
const merged=sandbox.applyProfileSyncPatch({progressByContext:{ctx:{}}},pending);
assert.equal(merged.progressByContext.ctx['Первая задача'],true);
assert.equal(merged.progressByContext.ctx['Вторая задача'],true);

const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const storage=fs.readFileSync(path.join(root,'js/core/storage-config.js'),'utf8');
const version=fs.readFileSync(path.join(root,'js/core/version.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(app,/CLOUD_PROFILE_ID='default_v76'/);
assert.match(app,/PROFILE_CONTEXT_CHECKPOINT_KEY='kiri:rp-cabinet:v76:context-checkpoint'/);
assert.match(storage,/rp_panel_account_profile_V76_STABLE/);
assert.match(version,/TEST_VERSION="76"/);
assert.match(html,/TEST v76 · Isolated state sync/);
assert.ok(!html.includes('?v=75'));
console.log('v76 state-sync checks passed');
