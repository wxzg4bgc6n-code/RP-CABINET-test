import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const law=fs.readFileSync(path.join(root,'data/usaf/law-guide.js'),'utf8');
const css=fs.readFileSync(path.join(root,'css/features/usaf-law.css'),'utf8');
const failures=[];
for(const removed of ['Что нужно бойцу на службе','Какие темы УАК учить для армии','Госправила и процессуальная часть']) if(law.includes(removed)) failures.push(`removed block remains: ${removed}`);
if(!law.includes('Алгоритм обычного бойца USAF')) failures.push('USAF algorithm missing');
if(!law.includes('Важные вопросы для сдачи')) failures.push('open exam questions missing');
if(!law.includes('usaf-law-evidence-extra-v110')) failures.push('v110 evidence cards missing');
if(!css.includes('.usaf-law-split-v92 + .usaf-law-split-v92{margin-top:10px}')) failures.push('v110 card spacing missing');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('v110 USAF law layout regression passed');
