import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const failures=[];
const notes=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const full=path.join(dir,entry.name);
  return entry.isDirectory()?walk(full):[full];
});
const files=walk(root);
let nestedSyntaxCheckUnavailable=false;
for(const file of files.filter(f=>/\.(?:js|mjs)$/.test(f)&&!f.includes(`${path.sep}vendor${path.sep}`))){
  try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch(error){
    if(error.code==='EPERM'){nestedSyntaxCheckUnavailable=true;continue;}
    failures.push(`JS syntax: ${path.relative(root,file)}\n${error.stderr}`);
  }
}
for(const file of files.filter(f=>/\.json$/.test(f))){
  try{JSON.parse(fs.readFileSync(file,'utf8'));}catch(error){failures.push(`JSON parse: ${path.relative(root,file)}: ${error.message}`);}
}
const htmlFiles=['index.html','report.html'];
const localRefs=new Set();
for(const htmlName of htmlFiles){
  const html=fs.readFileSync(path.join(root,htmlName),'utf8');
  for(const match of html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)){
    const raw=match[1];
    if(/^(?:https?:|data:|mailto:|javascript:)/.test(raw)) continue;
    localRefs.add(raw.split('?')[0]);
  }
}
const mainCss=fs.readFileSync(path.join(root,'css/main.css'),'utf8');
for(const match of mainCss.matchAll(/@import\s+url\(["']?([^"')]+)["']?\)/g)){
  localRefs.add(path.posix.normalize(path.posix.join('css',match[1].split('?')[0])));
}
for(const ref of localRefs){
  if(!fs.existsSync(path.join(root,ref))) failures.push(`Missing local reference: ${ref}`);
}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const version=fs.readFileSync(path.join(root,'js/core/version.js'),'utf8');
const coreCss=fs.readFileSync(path.join(root,'css/core.css'),'utf8');
if(!index.includes('TEST v87 · report loading dividers')) failures.push('index badge is not v87');
if(!version.includes('const TEST_VERSION="87"')) failures.push('TEST_VERSION is not 87');
if(!version.includes('report loading dividers')) failures.push('TEST_VERSION_LABEL mismatch');
if(!coreCss.includes('TEST v87 · report loading dividers')) failures.push('CSS badge mismatch');
if(index.includes('sync-merge.js')) failures.push('Old sync-merge.js is still connected');
if(!index.includes('realtime-state.js?v=87')) failures.push('realtime-state.js is not connected with v87 cache-busting');
if(!index.includes('class="profile-boot-screen"')) failures.push('Profile sync loader markup is missing');
if(!coreCss.includes('@keyframes profileBootSpin')) failures.push('Profile sync loader animation is missing');
if(!fs.readFileSync(path.join(root,'js/app.js'),'utf8').includes("classList.add('profile-boot-leaving')")) failures.push('Profile sync loader fade-out is missing');
if(!index.includes('data/usaf/law-guide.js?v=87')) failures.push('USAF law guide is not connected');
if(!mainCss.includes('features/usaf-law.css?v=87')) failures.push('USAF law guide styles are not connected');
if(fs.existsSync(path.join(root,'js/core/sync-merge.js'))) failures.push('Old sync-merge.js still exists');
for(const forbidden of ['queuePendingProfileSyncDelta','readPendingProfileSyncPatch','applyProfileSyncPatchWithGuards','targetMutationIds','syncRevision']){
  if(fs.readFileSync(path.join(root,'js/app.js'),'utf8').includes(forbidden)) failures.push(`Old sync symbol remains active: ${forbidden}`);
}
for(const expected of ["enablePersistence({synchronizeTabs:true})","get({source:'server'})","profileRef().update(payload)","CLOUD_PROFILE_ID='default_realtime'"]){
  if(!fs.readFileSync(path.join(root,'js/app.js'),'utf8').includes(expected)) failures.push(`Missing realtime guarantee: ${expected}`);
}
if(files.some(file=>file.includes(`${path.sep}node_modules${path.sep}`))) failures.push('node_modules is present');
notes.push(`Files: ${files.length}`);
notes.push(`Local references checked: ${localRefs.size}`);
if(nestedSyntaxCheckUnavailable) notes.push('Nested node --check unavailable in this sandbox; run the standalone syntax command from QUICK_GUIDE');
if(failures.length){
  console.error(failures.join('\n\n'));
  process.exit(1);
}
console.log(`RP CABINET v87 build audit: OK\n${notes.join('\n')}`);
