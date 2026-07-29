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
if(!index.includes('TEST v93 · Google Drive proofs and avatars')) failures.push('index badge is not v93');
if(!version.includes('const TEST_VERSION="93"')) failures.push('TEST_VERSION is not 93');
if(!version.includes('Google Drive proofs and avatars')) failures.push('TEST_VERSION_LABEL mismatch');
if(!coreCss.includes('TEST v93 · Google Drive proofs and avatars')) failures.push('CSS badge mismatch');
if(!index.includes('modular-v93-google-drive-storage')) failures.push('Architecture meta marker mismatch');
if(index.includes('sync-merge.js')) failures.push('Old sync-merge.js is still connected');
if(!index.includes('realtime-state.js?v=93')) failures.push('realtime-state.js is not connected with v93 cache-busting');
if(!index.includes('class="profile-boot-screen"')) failures.push('Profile sync loader markup is missing');
if(!coreCss.includes('@keyframes profileBootSpin')) failures.push('Profile sync loader animation is missing');
if(!fs.readFileSync(path.join(root,'js/app.js'),'utf8').includes("classList.add('profile-boot-leaving')")) failures.push('Profile sync loader fade-out is missing');
if(!index.includes('data/usaf/law-guide.js?v=93')) failures.push('USAF law guide is not connected');
if(!mainCss.includes('features/usaf-law.css?v=93')) failures.push('USAF law guide styles are not connected');
if(!index.includes('features/smart-context-search.js?v=93')) failures.push('Smart search script is not connected');
if(!mainCss.includes('features/smart-context-search.css?v=93')) failures.push('Smart search styles are not connected');
if(!mainCss.includes('responsive/mobile.css?v=93')) failures.push('Mobile styles are not connected');
if(mainCss.indexOf('features/smart-context-search.css?v=93')>mainCss.indexOf('responsive/mobile.css?v=93')) failures.push('Mobile styles must load after common smart-search styles');
const smartSearchCss=fs.readFileSync(path.join(root,'css/features/smart-context-search.css'),'utf8');
const mobileCss=fs.readFileSync(path.join(root,'css/responsive/mobile.css'),'utf8');
if(/@media\s*\(\s*max-width/.test(smartSearchCss)) failures.push('Mobile search CSS remains in the common feature stylesheet');
if(!mobileCss.includes('.smart-search-nav-button{display:flex!important;')) failures.push('Mobile search navigation rule is missing from mobile.css');
if(!mobileCss.includes('.smart-search-dialog.filter-open .smart-search-results{display:none;}')) failures.push('Mobile full-height filter mode is missing');
if(!fs.readFileSync(path.join(root,'js/features/smart-context-search.js'),'utf8').includes("classList.toggle('filter-open',searchSettings.open)")) failures.push('Search filter toggle state is missing');
if(fs.existsSync(path.join(root,'js/core/sync-merge.js'))) failures.push('Old sync-merge.js still exists');
if(fs.existsSync(path.join(root,'proof-service'))) failures.push('Old proof-service directory still exists');
if(fs.existsSync(path.join(root,'js/config/proof-service.js'))) failures.push('Old proof-service config still exists');
if(fs.existsSync(path.join(root,'js/vendor/vercel-blob-client.js'))) failures.push('Old Vercel Blob client still exists');
if(!index.includes('js/config/google-drive.js?v=93')) failures.push('Google Drive config is not connected');
if(!index.includes('js/services/google-drive-storage.js?v=93')) failures.push('Google Drive storage service is not connected');
if(!index.includes('js/features/google-drive-avatar.js?v=93')) failures.push('Google Drive avatar feature is not connected');
if(!mainCss.includes('features/google-drive-avatar.css?v=93')) failures.push('Google Drive avatar styles are not connected');
if(index.indexOf('js/config/google-drive.js?v=93')>index.indexOf('js/services/google-drive-storage.js?v=93')) failures.push('Drive config must load before Drive service');
if(index.indexOf('js/services/google-drive-storage.js?v=93')>index.indexOf('js/app.js?v=93')) failures.push('Drive service must load before app.js');
const projectText=files
  .filter(file=>/\.(?:js|html)$/.test(file)&&!file.includes(`${path.sep}_tools${path.sep}`))
  .map(file=>fs.readFileSync(file,'utf8'))
  .join('\n');
for(const forbidden of ['RP_PROOF_SERVICE','RPProofUploader','@vercel/blob','BLOB_READ_WRITE_TOKEN']){
  if(projectText.includes(forbidden)) failures.push(`Old proof storage symbol remains: ${forbidden}`);
}
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
console.log(`RP CABINET v93 build audit: OK\n${notes.join('\n')}`);
