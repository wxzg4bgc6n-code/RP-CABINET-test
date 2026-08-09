import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const script=read('js/features/onboarding.js');
const style=read('css/features/onboarding.css');
const app=read('js/app.js');
const checks=[
  ['five onboarding stages', (index.match(/data-onboarding-stage=/g)||[]).length===5],
  ['nickname input preserved', index.includes('id="firstName"')],
  ['project select preserved', index.includes('id="firstProject"')],
  ['path radios preserved', (index.match(/name="path"/g)||[]).length===2],
  ['organization input added', index.includes('id="firstOrg"')],
  ['organization grid rendered', script.includes('renderOrganizations')],
  ['intro can be skipped', script.includes("skip?.addEventListener('click'")],
  ['reduced motion supported', script.includes('prefers-reduced-motion')&&style.includes('prefers-reduced-motion')],
  ['profile saves selected organization', app.includes("org:selectedOrg")],
  ['dashboard opens progress tab', app.includes("setActiveDashTab('progress')")],
  ['public config is not touched by onboarding', !script.includes('RP_PUBLIC_CONFIG')]
];
let failed=false;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed=true;}
if(failed)process.exit(1);
console.log('v108 onboarding checks passed');
