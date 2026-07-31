import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
const index=read('index.html');
const report=read('report.html');
const version=read('js/core/version.js');
const coreCss=read('css/core.css');
const mainCss=read('css/main.css');
if(!version.includes('TEST_VERSION="106"')) failures.push('TEST_VERSION is not 106');
if(!version.includes('Public report config')) failures.push('TEST_VERSION_LABEL mismatch');
if(!index.includes('TEST v106 · Public report config')) failures.push('visible badge mismatch');
if(!coreCss.includes('TEST v106 · Public report config')) failures.push('CSS badge mismatch');
if(!index.includes('modular-v106-public-config')) failures.push('architecture marker mismatch');
for(const html of [index,report]){
  if(!html.includes('js/config/public-config.js?v=1')) failures.push('public-config.js missing');
  if(!html.includes('js/config/google-drive-public-key.js?v=106')) failures.push('public key helper missing');
  if(html.indexOf('public-config.js')>html.indexOf('google-drive-public-key.js')) failures.push('public config loads too late');
  if(!html.includes('assets/icons/favicon.svg?v=106')) failures.push('SVG favicon missing');
  if(!html.includes('site.webmanifest?v=106')) failures.push('manifest missing');
}
if(!mainCss.includes('features/progress-proofs.css?v=106')) failures.push('progress proof CSS missing');
if(!index.includes('js/features/progress-proofs.js?v=106')) failures.push('progress proof JS missing');
const helper=read('js/config/google-drive-public-key.js');
const proofs=read('js/features/progress-proofs.js');
if(/window\.prompt\s*\(/.test(helper)) failures.push('API key prompt remains');
if(/localStorage/.test(helper)) failures.push('public API key still uses localStorage');
if(/queryKey|QUERY_KEY/.test(helper+proofs)) failures.push('pk query implementation remains');
if(!helper.includes('RP_PUBLIC_CONFIG')) failures.push('public config is not used');
const required=['index.html','report.html','favicon.ico','site.webmanifest','assets','css','data','js','documentation','_tools','README.md','build-summary.json'];
for(const item of required){if(!fs.existsSync(path.join(root,item))) failures.push(`missing ${item}`);}
if(fs.existsSync(path.join(root,'proof-service'))) failures.push('proof-service must not exist');
if(fs.existsSync(path.join(root,'node_modules'))) failures.push('node_modules must not exist');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('v106 build audit passed');
