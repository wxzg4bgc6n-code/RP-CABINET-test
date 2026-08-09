import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const law=read('data/usaf/law-guide.js');
const css=read('css/features/usaf-law.css');
const version=read('js/core/version.js');
const tests=read('data/usaf/tests.js');
const index=read('index.html');
const app=read('js/app.js');
const proofs=read('js/features/progress-proofs.js');
const realtime=read('js/core/realtime-state.js');
const checks=[
  ['version 109',version.includes('TEST_VERSION="109"')&&version.includes('USAF law cleanup')],
  ['exam summary removed',!law.includes('Коротко по вопросам экзамена')&&!law.includes('usaf-law-exam-summary-v98')],
  ['main warning removed',!law.includes('Главное правило')&&!law.includes('Не придумывай статью и не проводи полный арест только потому')],
  ['Ammunation note removed from law guide',!law.includes('<b>Ammunation:</b>')&&!law.includes('<b>Поезд:</b>')],
  ['45-second removal explainer removed',!law.includes('Без 45 сек.')&&!law.includes('Старый лимит удалён')],
  ['study note removed',!law.includes('Номера в памятку намеренно не зашиты')],
  ['pre-exam footer removed',!law.includes('Перед самой сдачей')&&!law.includes('Экзаменационный блок повторяет все присланные вопросы')],
  ['USAF scope before general scope',law.indexOf('Что нужно бойцу на службе')>0&&law.indexOf('Что нужно бойцу на службе')<law.indexOf('Госправила и процессуальная часть')],
  ['USAF algorithm refreshed',law.includes('usaf-law-flow-v109')&&css.includes('.usaf-law-flow-v109::before')&&law.includes('usaf-law-step-v109')],
  ['important questions always visible',law.includes('usaf-law-qa-grid-v109')&&!law.includes('<details><summary>С какого звания можно использовать наручники?')],
  ['evidence notes refreshed',law.includes('usaf-law-evidence-notes-v109')&&law.includes('<h4>Монтаж записи</h4>')&&law.includes('<h4>Перед рейдом</h4>')],
  ['evidence keeps full-situation rule',law.includes('от начала до фактического завершения')],
  ['interrogation counts preserved',law.includes('от 8 до 10 вопросов')&&law.includes('Ровно 10 вопросов')],
  ['Ammunation exam rule remains correct',tests.includes('Может ли ARMY / USAF участвовать в отбитии Ammunation?')&&tests.includes('только FIB, LSPD и LSSD')],
  ['premium values preserved',index.includes('data-premium-add="1.5" role="button" tabindex="0"><span class="premium-activity-name">Дежурство на КПП')&&index.includes('Отчёт в спец. связи')],
  ['Sunday-Saturday week preserved',app.includes('start.setDate(current.getDate()-current.getDay())')&&app.includes('end.setDate(start.getDate()+6)')],
  ['background report delete preserved',proofs.includes('queueReportCleanup')&&proofs.includes("showToast('Отчёт удалён из панели','Google Drive очищается в фоне')")&&realtime.includes('reportTombstones')]
];
let failed=false;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed=true;}
if(failed)process.exit(1);
console.log('v109 USAF law layout checks passed');
