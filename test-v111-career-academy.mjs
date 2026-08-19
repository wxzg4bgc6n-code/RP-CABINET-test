import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'css/core.css'),'utf8');
const failures=[];
if(!app.includes("const academyActive=S.section==='Academy'")) failures.push('academy current-state check missing');
if(!app.includes('if(academyActive){')) failures.push('Academy is not gated by current department');
if(app.includes('academyCompletedButNotCurrent')) failures.push('legacy completed Academy card logic remains');
if(app.includes("status:academyActive?`${S.level||'В процессе'} · ${p}%`: (academyCompletedButNotCurrent?'Завершено':'Нужно выбрать')")) failures.push('legacy Academy completed status remains');
if(!app.includes("}else if(S.configured && S.section){")) failures.push('current department branch missing');
if(!css.includes('repeat(auto-fit,minmax(220px,1fr))')) failures.push('career cards do not auto-fit');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('v111 career Academy visibility test passed');
