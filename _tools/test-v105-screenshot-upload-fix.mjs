import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const storage=fs.readFileSync(path.join(root,'js/services/google-drive-storage.js'),'utf8');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const proofs=fs.readFileSync(path.join(root,'js/features/progress-proofs.js'),'utf8');
const version=fs.readFileSync(path.join(root,'js/core/version.js'),'utf8');
const checks=[
  ['proof thumbnail does not call publicMediaUrl',/url:publicThumbnailUrl\(uploaded,1600\)/.test(storage)],
  ['avatar thumbnail does not call publicMediaUrl',/url:publicThumbnailUrl\(uploaded,1200\)/.test(storage)],
  ['normalizer accepts fileId',/typeof file\.fileId==='string'&&file\.fileId/.test(app)],
  ['viewer fallback catches missing public key',/try\{fallback=drive\(\)\.publicMediaUrl\(file\)\|\|fallback;\}catch\(error\)\{\}/.test(proofs)],
  ['version is 105',/TEST_VERSION="105"/.test(version)]
];
let failed=false;
for(const [name,ok] of checks){ console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) failed=true; }
if(failed) process.exit(1);
