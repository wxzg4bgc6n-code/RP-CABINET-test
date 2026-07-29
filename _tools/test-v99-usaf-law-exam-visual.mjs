import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const index=read('index.html');
const reportHtml=read('report.html');
const app=read('js/app.js');
const driveConfig=read('js/config/google-drive.js');
const driveService=read('js/services/google-drive-storage.js');
const proofs=read('js/features/progress-proofs.js');
const avatar=read('js/features/google-drive-avatar.js');
const avatarCss=read('css/features/google-drive-avatar.css');
const proofCss=read('css/features/progress-proofs.css');
const smartSearch=read('js/features/smart-context-search.js');
const report=read('js/report.js');
const readme=read('README.md');
const mainCss=read('css/main.css');
const reportCss=read('css/report.css');
const lawDataSource=read('data/usaf/law-data.js');
const lawExamSource=read('data/usaf/law-exam.js');
const usafTestsSource=read('data/usaf/tests.js');
const pinnedMaterials=read('js/features/pinned-materials.js');
const lawCss=read('css/features/usaf-law.css');

assert.match(index,/TEST v99 · USAF UAK\/PK unified test visual/);
assert.match(index,/modular-v99-usaf-law-exam/);
assert.ok(index.indexOf('js/config/google-drive.js?v=99')<index.indexOf('js/services/google-drive-storage.js?v=99'));
assert.ok(index.indexOf('js/services/google-drive-storage.js?v=99')<index.indexOf('js/app.js?v=99'));
assert.ok(index.indexOf('js/app.js?v=99')<index.indexOf('js/features/google-drive-avatar.js?v=99'));
assert.match(mainCss,/features\/google-drive-avatar\.css\?v=99/);
assert.ok(index.indexOf('data/usaf/law-data.js?v=99')<index.indexOf('data/usaf/law-guide.js?v=99'));
assert.ok(index.indexOf('data/usaf/tests.js?v=99')<index.indexOf('data/usaf/law-exam.js?v=99'));

for(const removed of [
  'proof-service',
  'js/config/proof-service.js',
  'js/vendor/vercel-blob-client.js'
]){
  assert.equal(fs.existsSync(path.join(root,removed)),false,`${removed} must be removed`);
}
for(const forbidden of ['RP_PROOF_SERVICE','RPProofUploader','@vercel/blob','BLOB_READ_WRITE_TOKEN']){
  assert.doesNotMatch([index,app,driveService,proofs,report].join('\n'),new RegExp(forbidden));
}

assert.match(driveConfig,/https:\/\/www\.googleapis\.com\/auth\/drive\.file/);
assert.match(driveConfig,/reportLifetimeDays:8/);
assert.match(driveConfig,/maxFilesPerTask:null/);
assert.match(driveService,/sessionStorage\.setItem\(TOKEN_KEY/);
assert.doesNotMatch(driveService,/localStorage\.setItem\([^)]*token/i);
assert.match(driveService,/ensureFolder\(root\.id,[^\n]+,'screenshots'\)/);
assert.match(driveService,/ensureFolder\(root\.id,[^\n]+,'reports'\)/);
assert.match(driveService,/ensureFolder\(root\.id,[^\n]+,'avatars'\)/);
assert.match(driveService,/type:'anyone',role:'reader',allowFileDiscovery:false/);
assert.match(driveService,/method:'DELETE'/);
assert.match(driveService,/createReportManifest/);
assert.match(driveService,/cleanupExpired/);
assert.match(driveService,/const previewObjects=new Map\(\)/);
assert.match(driveService,/function publicThumbnailUrl/);
assert.match(driveService,/rememberPreview\(uploaded\.id,file\)/);
assert.match(driveService,/rememberPreview\(uploaded\.id,blob\)/);

assert.match(app,/provider\.addScope\(window\.GoogleDriveStorage\.scope\)/);
assert.match(app,/async authorizeDrive\(\)/);
assert.match(app,/reauthenticateWithPopup/);
assert.match(app,/S\.account&&S\.account\.driveAvatar&&S\.account\.driveAvatar\.url/);
assert.match(app,/resourceKey:typeof report\.resourceKey/);
assert.match(app,/existing\?\.dataset\.avatarKey===descriptor\.key/);
assert.doesNotMatch(app,/box\.querySelectorAll\('\.google-profile-avatar'\)\.forEach\(el=>el\.remove\(\)\);\s*const photo/);

assert.match(proofs,/window\.GoogleDriveStorage/);
assert.match(proofs,/uploadProof/);
assert.match(proofs,/createReportManifest/);
assert.match(proofs,/Скрыть скриншоты/);
assert.match(proofs,/Показать скриншоты/);
assert.match(proofs,/maxFilesPerTask/);
assert.doesNotMatch(proofs,/\/api\/reports|\/api\/upload|\/api\/proofs/);
assert.match(proofs,/canvas\.toBlob\(resolve,'image\/webp',\.84\)/);
assert.match(proofs,/maxDimension\/Math\.max\(sourceWidth,sourceHeight\)/);
assert.match(proofs,/class="proof-viewer"/);
assert.match(proofs,/data-proof-view=/);
assert.doesNotMatch(proofs,/<a href="\$\{esc\(url\)\}" target="_blank"/);
assert.match(proofCss,/\.proof-viewer\.open\{display:flex\}/);
assert.match(proofs,/id="deleteAllProofs"/);
assert.match(proofs,/async function deleteAllProofs/);
assert.match(proofs,/Math\.min\(4,entries\.length\)/);
assert.match(proofs,/await drive\(\)\.deleteFile\(report\.id\)/);
assert.match(proofs,/results\.set\(entry,false\)/);
assert.match(proofs,/data-proof-delete=/);
assert.doesNotMatch(proofs,/activeReport\?'':/);
assert.match(proofCss,/\.proof-delete-all/);
assert.match(driveService,/Number\(error\?\.status\)!==404/);

assert.match(driveService,/avatar-\$\{Date\.now\(\)\}\.webp/);
assert.match(avatar,/canvas\.toBlob\(resolve,'image\/webp',\.88\)/);
assert.ok(avatar.indexOf('S.account.driveAvatar=avatar')<avatar.indexOf('deleteFile(previous.fileId)'));
assert.match(avatar,/id="editDriveAvatar"/);
assert.match(avatar,/id="avatarZoomRange"/);
assert.match(avatar,/pointerdown/);
assert.match(avatar,/crop\.zoom=Math\.max\(1,Math\.min\(3/);
assert.match(avatar,/document\.getElementById\('driveAvatarInput'\)\?\.click\(\)/);
assert.doesNotMatch(avatar,/driveAvatarCard|deleteDriveAvatar|connectAvatarDrive|ensureCard/);
assert.match(avatarCss,/\.avatar-wrap:hover \.profile-avatar-edit/);
assert.match(avatarCss,/@media\(hover:none\),\(max-width:900px\)/);
assert.doesNotMatch(smartSearch,/smartSearchProfileButton|Найти в материалах|smart-search-profile-button/);
assert.match(proofs,/if\(file\.fileId\) await drive\(\)\.deleteFile\(file\.fileId\)/);

assert.match(reportHtml,/js\/config\/google-drive\.js\?v=99/);
assert.doesNotMatch(reportHtml,/index\.html|href=["'][^"']*RP CABINET/i);
assert.match(report,/www\.googleapis\.com\/drive\/v3\/files/);
assert.match(report,/report-lightbox/);
assert.match(report,/function driveThumbnailUrl/);
assert.match(report,/driveThumbnailUrl\(file,1100\)/);
assert.match(report,/driveThumbnailUrl\(file,2400\)/);
assert.match(report,/fallbackAvatarUrl/);
assert.match(report,/profile\?\.avatar\?\.fileId\?driveThumbnailUrl\(profile\.avatar,512\)/);
assert.match(reportCss,/\.report-lightbox/);
assert.match(reportCss,/\.report-image-loader/);
assert.match(reportHtml,/rel="preconnect" href="https:\/\/drive\.google\.com"/);
assert.doesNotMatch(report,/config\.apiBase|\/api\/reports/);
assert.match(proofs,/fallbackAvatarUrl:typeof getFallbackGooglePhoto/);

const versionHeadings=[...readme.matchAll(/^## (?:Что изменилось в|Сохранено из) v(\d+)/gm)].map(match=>match[1]);
assert.deepEqual(versionHeadings,['99','98','97']);
assert.match(readme,/Папки `proof-service` в v99 нет/);
assert.match(readme,/Удалить все скриншоты/);
assert.match(readme,/users\/\{uid\}\/profiles\/default_realtime/);

const lawRuntime={window:{RPCabinetTemplates:[]}};
lawRuntime.window.window=lawRuntime.window;
vm.createContext(lawRuntime);
vm.runInContext(lawDataSource,lawRuntime);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions.length,17);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[0].options[3],'1 час');
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[6].type,'matching');
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[6].rows.length,4);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[8].correct[0],0);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[9].correct[0],0);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[14].options.length,10);
assert.deepEqual(Array.from(lawRuntime.window.RP_USAF_LAW_EXAM.questions[14].correct),[0,1,2,8,9]);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[15].correct[0],0);
assert.equal(lawRuntime.window.RP_USAF_LAW_EXAM.questions[16].correct[0],1);
vm.runInContext(usafTestsSource,lawRuntime);
vm.runInContext(lawExamSource,lawRuntime);
const patchedTests=lawRuntime.window.RPCabinetTemplates.find(entry=>entry.id==='usafTestsTemplateV20').markup;
assert.match(patchedTests,/id="usaf-test-mp-uak-pk" data-test-owner="USAF"/);
assert.doesNotMatch(patchedTests,/id="usaf-test-mp-uak-pk" class="usaf-test-disabled"/);
const lawExamMarkup=patchedTests.match(/<details class="section-toggle" id="usaf-test-mp-uak-pk"[\s\S]*?<\/details>/)?.[0]||'';
assert.equal((lawExamMarkup.match(/class="qa-card"/g)||[]).length,17);
assert.equal((lawExamMarkup.match(/class="usaf-law-match-list"/g)||[]).length,1);
assert.doesNotMatch(lawExamMarkup,/20 вопросов|Правильные ответы выделены/);
assert.match(pinnedMaterials,/\["usaf-law", "usaf-test-mp-uak-pk"\]/);
assert.match(lawCss,/\.usaf-law-qa-v92\{[^}]*align-items:start/);

const realtimeSource=read('js/core/realtime-state.js');
const runtime={
  console,
  TextEncoder,
  TextDecoder,
  btoa:value=>Buffer.from(value,'binary').toString('base64'),
  atob:value=>Buffer.from(value,'base64').toString('binary')
};
vm.createContext(runtime);
vm.runInContext(realtimeSource,runtime);
const before={
  ready:true,name:'KIRI',project:'GTA5RP',path:'Государственная служба',style:'style-violet',
  org:'ARMY',section:'USAF',level:'5 → 6',configured:true,
  progressByContext:{},selectedLevelBySection:{},proofsByContext:{},reportsByContext:{},
  pinnedDepartmentBlocks:[],pinnedAcademyBlocks:[],premiumSelectedActivities:[],account:{createdAt:1}
};
const after=structuredClone(before);
after.account.driveAvatar={provider:'google-drive',fileId:'avatar-id',resourceKey:'avatar-key',url:'https://example/avatar'};
after.proofsByContext.ctx={
  Task:{files:[{provider:'google-drive',fileId:'proof-id',resourceKey:'proof-key',url:'https://example/proof'}],updatedAt:2}
};
after.reportsByContext.ctx={provider:'google-drive',id:'report-id',resourceKey:'report-key',url:'https://example/report',createdAt:2,expiresAt:3};
const operations=runtime.buildRealtimeStateDiff(before,after);
assert.ok(operations.some(operation=>operation.path==='account'&&operation.value.driveAvatar.fileId==='avatar-id'));
assert.ok(operations.some(operation=>operation.path.startsWith('proofs.')&&operation.value.files[0].resourceKey==='proof-key'));
assert.ok(operations.some(operation=>operation.path.startsWith('reports.')&&operation.value.value.resourceKey==='report-key'));

const driveRuntime={
  console,
  URL,
  Headers,
  Blob,
  XMLHttpRequest:function(){},
  fetch:async()=>{throw new Error('network not expected');},
  sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  document:{dispatchEvent(){}},
  CustomEvent:function(type){this.type=type;},
  queueMicrotask,
  crypto:{randomUUID:()=> 'uuid'},
  window:{
    RP_GOOGLE_DRIVE:{
      apiKey:'public-key',
      scope:'https://www.googleapis.com/auth/drive.file',
      reportLifetimeDays:8
    },
    CloudSync:{user:{uid:'user-1'}}
  }
};
driveRuntime.window.window=driveRuntime.window;
driveRuntime.window.document=driveRuntime.document;
driveRuntime.window.sessionStorage=driveRuntime.sessionStorage;
driveRuntime.window.CustomEvent=driveRuntime.CustomEvent;
vm.createContext(driveRuntime);
vm.runInContext(driveService,driveRuntime);
const media=driveRuntime.window.GoogleDriveStorage.publicMediaUrl({fileId:'file_123',resourceKey:'rk_456'});
assert.match(media,/files\/file_123\?alt=media&key=public-key&resourceKey=rk_456/);
driveRuntime.window.GoogleDriveStorage.setAccessToken('token','user-1',3600);
driveRuntime.fetch=async()=>({
  status:404,
  ok:false,
  json:async()=>({error:{message:'File not found'}})
});
await driveRuntime.window.GoogleDriveStorage.deleteFile('already-removed');

console.log('RP CABINET v99 USAF UAK/PK exam, Drive and realtime tests: OK');
