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
if(!index.includes('TEST v99 · USAF UAK/PK unified test visual')) failures.push('index badge is not v99');
if(!version.includes('const TEST_VERSION="99"')) failures.push('TEST_VERSION is not 99');
if(!version.includes('USAF UAK/PK unified test visual')) failures.push('TEST_VERSION_LABEL mismatch');
if(!coreCss.includes('TEST v99 · USAF UAK/PK unified test visual')) failures.push('CSS badge mismatch');
if(!index.includes('modular-v99-usaf-law-exam')) failures.push('Architecture meta marker mismatch');
if(index.includes('sync-merge.js')) failures.push('Old sync-merge.js is still connected');
if(!index.includes('realtime-state.js?v=99')) failures.push('realtime-state.js is not connected with v99 cache-busting');
if(!index.includes('class="profile-boot-screen"')) failures.push('Profile sync loader markup is missing');
if(!coreCss.includes('@keyframes profileBootSpin')) failures.push('Profile sync loader animation is missing');
if(!fs.readFileSync(path.join(root,'js/app.js'),'utf8').includes("classList.add('profile-boot-leaving')")) failures.push('Profile sync loader fade-out is missing');
if(!index.includes('data/usaf/law-guide.js?v=99')) failures.push('USAF law guide is not connected');
if(!index.includes('data/usaf/law-data.js?v=99')) failures.push('USAF law exam data is not connected');
if(!index.includes('data/usaf/law-exam.js?v=99')) failures.push('USAF law exam template patch is not connected');
if(index.indexOf('data/usaf/law-data.js?v=99')>index.indexOf('data/usaf/law-guide.js?v=99')) failures.push('USAF law data must load before the guide');
if(index.indexOf('data/usaf/tests.js?v=99')>index.indexOf('data/usaf/law-exam.js?v=99')) failures.push('USAF tests must load before the law exam patch');
if(!mainCss.includes('features/usaf-law.css?v=99')) failures.push('USAF law guide styles are not connected');
if(!index.includes('features/smart-context-search.js?v=99')) failures.push('Smart search script is not connected');
if(!mainCss.includes('features/smart-context-search.css?v=99')) failures.push('Smart search styles are not connected');
if(!mainCss.includes('responsive/mobile.css?v=99')) failures.push('Mobile styles are not connected');
if(mainCss.indexOf('features/smart-context-search.css?v=99')>mainCss.indexOf('responsive/mobile.css?v=99')) failures.push('Mobile styles must load after common smart-search styles');
const smartSearchCss=fs.readFileSync(path.join(root,'css/features/smart-context-search.css'),'utf8');
const mobileCss=fs.readFileSync(path.join(root,'css/responsive/mobile.css'),'utf8');
if(/@media\s*\(\s*max-width/.test(smartSearchCss)) failures.push('Mobile search CSS remains in the common feature stylesheet');
if(!mobileCss.includes('.smart-search-nav-button{display:flex!important;')) failures.push('Mobile search navigation rule is missing from mobile.css');
if(!mobileCss.includes('.smart-search-dialog.filter-open .smart-search-results{display:none;}')) failures.push('Mobile full-height filter mode is missing');
if(!fs.readFileSync(path.join(root,'js/features/smart-context-search.js'),'utf8').includes("classList.toggle('filter-open',searchSettings.open)")) failures.push('Search filter toggle state is missing');
if(/smartSearchProfileButton|Найти в материалах|smart-search-profile-button/.test(fs.readFileSync(path.join(root,'js/features/smart-context-search.js'),'utf8'))) failures.push('Duplicate materials search launcher is still present');
if(fs.existsSync(path.join(root,'js/core/sync-merge.js'))) failures.push('Old sync-merge.js still exists');
if(fs.existsSync(path.join(root,'proof-service'))) failures.push('Old proof-service directory still exists');
if(fs.existsSync(path.join(root,'js/config/proof-service.js'))) failures.push('Old proof-service config still exists');
if(fs.existsSync(path.join(root,'js/vendor/vercel-blob-client.js'))) failures.push('Old Vercel Blob client still exists');
if(!index.includes('js/config/google-drive.js?v=99')) failures.push('Google Drive config is not connected');
if(!index.includes('js/services/google-drive-storage.js?v=99')) failures.push('Google Drive storage service is not connected');
if(!index.includes('js/features/google-drive-avatar.js?v=99')) failures.push('Google Drive avatar feature is not connected');
if(!mainCss.includes('features/google-drive-avatar.css?v=99')) failures.push('Google Drive avatar styles are not connected');
if(index.indexOf('js/config/google-drive.js?v=99')>index.indexOf('js/services/google-drive-storage.js?v=99')) failures.push('Drive config must load before Drive service');
if(index.indexOf('js/services/google-drive-storage.js?v=99')>index.indexOf('js/app.js?v=99')) failures.push('Drive service must load before app.js');
const avatarFeature=fs.readFileSync(path.join(root,'js/features/google-drive-avatar.js'),'utf8');
const avatarCss=fs.readFileSync(path.join(root,'css/features/google-drive-avatar.css'),'utf8');
const proofFeature=fs.readFileSync(path.join(root,'js/features/progress-proofs.js'),'utf8');
const proofCss=fs.readFileSync(path.join(root,'css/features/progress-proofs.css'),'utf8');
const driveService=fs.readFileSync(path.join(root,'js/services/google-drive-storage.js'),'utf8');
const appSource=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
if(!avatarFeature.includes('id="editDriveAvatar"')) failures.push('Avatar pencil editor is missing');
if(/driveAvatarCard|ensureCard|deleteDriveAvatar|connectAvatarDrive/.test(avatarFeature)) failures.push('Old settings avatar card is still active');
if(!avatarCss.includes('.avatar-wrap:hover .profile-avatar-edit')) failures.push('Desktop avatar hover editor is missing');
if(!avatarCss.includes('@media(hover:none),(max-width:900px)')) failures.push('Always-visible mobile avatar editor is missing');
if(!avatarFeature.includes('id="avatarZoomRange"')||!avatarFeature.includes("addEventListener('pointerdown'")) failures.push('Avatar crop zoom or drag is missing');
if(!avatarCss.includes('.avatar-crop-frame')||!avatarCss.includes('overflow:hidden')) failures.push('Avatar crop frame clipping is missing');
if(!appSource.includes('existing?.dataset.avatarKey===descriptor.key')) failures.push('Stable avatar DOM guard is missing');
if(!driveService.includes('const previewObjects=new Map()')||!driveService.includes('function publicThumbnailUrl')) failures.push('Immediate Drive preview cache is missing');
if(!proofFeature.includes("canvas.toBlob(resolve,'image/webp',.84)")||!proofFeature.includes('previewMaxDimension||2560')) failures.push('Proof image optimization is missing');
if(!proofFeature.includes('class="proof-viewer"')||!proofCss.includes('.proof-viewer.open{display:flex}')) failures.push('Fullscreen proof viewer is missing');
if(/<a href="\$\{esc\(url\)\}" target="_blank"/.test(proofFeature)) failures.push('Proof click still opens a direct Drive download');
if(!proofFeature.includes('id="deleteAllProofs"')||!proofFeature.includes('async function deleteAllProofs')) failures.push('Bulk proof deletion is missing');
if(!proofFeature.includes('Math.min(4,entries.length)')) failures.push('Bulk proof deletion concurrency is missing');
if(!proofFeature.includes('data-proof-delete=')||proofFeature.includes("activeReport?'':")) failures.push('Per-file proof delete buttons are not always available');
if(!proofCss.includes('.proof-delete-all')) failures.push('Bulk proof delete styles are missing');
if(!driveService.includes('Number(error?.status)!==404')) failures.push('Missing Drive-file cleanup guard is absent');
const publicReport=fs.readFileSync(path.join(root,'js/report.js'),'utf8');
const reportHtml=fs.readFileSync(path.join(root,'report.html'),'utf8');
const reportCss=fs.readFileSync(path.join(root,'css/report.css'),'utf8');
if(!publicReport.includes('function driveThumbnailUrl')||!publicReport.includes('driveThumbnailUrl(file,1100)')||!publicReport.includes('driveThumbnailUrl(file,2400)')) failures.push('Fast public report thumbnails are missing');
if(!publicReport.includes('fallbackAvatarUrl')||!proofFeature.includes('fallbackAvatarUrl:typeof getFallbackGooglePhoto')) failures.push('Public report avatar fallback chain is missing');
if(!reportHtml.includes('rel="preconnect" href="https://drive.google.com"')) failures.push('Google Drive preconnect is missing');
if(!reportCss.includes('.report-image-loader')) failures.push('Public report image loading placeholder is missing');
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
const lawData=fs.readFileSync(path.join(root,'data/usaf/law-data.js'),'utf8');
const lawExam=fs.readFileSync(path.join(root,'data/usaf/law-exam.js'),'utf8');
const pinnedMaterials=fs.readFileSync(path.join(root,'js/features/pinned-materials.js'),'utf8');
const lawCss=fs.readFileSync(path.join(root,'css/features/usaf-law.css'),'utf8');
if(!lawData.includes('window.RP_USAF_LAW_EXAM')) failures.push('USAF law exam dataset is missing');
if(!lawExam.includes('usaf-test-mp-uak-pk')) failures.push('USAF law exam real test id is missing');
if(!pinnedMaterials.includes('["usaf-law", "usaf-test-mp-uak-pk"]')) failures.push('USAF law materials are not linked to promotion progress');
if(!lawCss.includes('.usaf-law-qa-v92{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;')) failures.push('USAF law Q&A cards can still stretch each other');
if(files.some(file=>file.includes(`${path.sep}node_modules${path.sep}`))) failures.push('node_modules is present');
notes.push(`Files: ${files.length}`);
notes.push(`Local references checked: ${localRefs.size}`);
if(nestedSyntaxCheckUnavailable) notes.push('Nested node --check unavailable in this sandbox; run the standalone syntax command from QUICK_GUIDE');
if(failures.length){
  console.error(failures.join('\n\n'));
  process.exit(1);
}
console.log(`RP CABINET v99 build audit: OK\n${notes.join('\n')}`);
