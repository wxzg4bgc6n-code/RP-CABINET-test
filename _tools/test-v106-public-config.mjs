import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const report=read('report.html');
const helper=read('js/config/google-drive-public-key.js');
const proofs=read('js/features/progress-proofs.js');
for(const html of [index,report]){
  if(!html.includes('js/config/public-config.js?v=1')) throw new Error('public-config.js is not connected');
  if(html.indexOf('public-config.js')>html.indexOf('google-drive-public-key.js')) throw new Error('public config loads too late');
}
if(/window\.prompt\s*\(/.test(helper)) throw new Error('API key prompt still exists');
if(/localStorage/.test(helper)) throw new Error('Public API key still uses localStorage');
if(helper.includes('queryKey')||helper.includes('QUERY_KEY')) throw new Error('Legacy query-key helper remains');
if(proofs.includes("searchParams.set('pk'")||proofs.includes('queryKey')) throw new Error('pk is still added to report links');
if(!helper.includes('RP_PUBLIC_CONFIG')) throw new Error('Deployment config is not used');
if(!proofs.includes('ensurePublicReportKey()')) throw new Error('Static public key guard is missing');
console.log('v106 public config checks passed');
