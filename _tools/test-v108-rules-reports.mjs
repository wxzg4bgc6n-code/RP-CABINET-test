import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const app=read('js/app.js');
const tests=read('data/usaf/tests.js');
const law=read('data/usaf/law-guide.js');
const proofs=read('js/features/progress-proofs.js');
const realtime=read('js/core/realtime-state.js');
const version=read('js/core/version.js');
const checks=[
  ['current version 109',version.includes('TEST_VERSION="109"')],
  ['Ammunation excludes ARMY',tests.includes('Может ли ARMY / USAF участвовать в отбитии Ammunation?')&&tests.includes('только FIB, LSPD и LSSD')],
  ['KPP is 1.5',index.includes('data-premium-add="1.5" role="button" tabindex="0"><span class="premium-activity-name">Дежурство на КПП')],
  ['Patrol is 1.5',index.includes('data-premium-add="1.5" role="button" tabindex="0"><span class="premium-activity-name">Патруль штата')],
  ['Arrest added',index.includes('Арест (КПЗ/ФТ)')&&index.includes('1 арест')],
  ['Drop is 2',index.includes('data-premium-add="2" role="button" tabindex="0"><span class="premium-activity-name">Дроп')],
  ['Supply is 2.5',index.includes('data-premium-add="2.5" role="button" tabindex="0"><span class="premium-activity-name">Поставка материалов/аптечек')],
  ['Shpak is 3',index.includes('data-premium-add="3" role="button" tabindex="0"><span class="premium-activity-name">Шпак')],
  ['Events updated',index.includes('ВФМП или МФМА')&&index.includes('ГМП / ВЗЧ / ОВЖ')],
  ['Special comm added',index.includes('Отчёт в спец. связи')&&index.includes('без дубликатов')],
  ['Premium uses logs',index.includes('Спецоперации для премии засчитываются только через логи в меню фракции')],
  ['Week calculator Sunday-Saturday',app.includes('start.setDate(current.getDate()-current.getDay())')&&app.includes('end.setDate(start.getDate()+6)')],
  ['Old premium values migrated',app.includes('PREMIUM_ACTIVITY_CATALOG_V108')&&app.includes("'Шпак':{name:'Шпак',points:3}")],
  ['Evidence full-situation rule preserved',law.includes('от начала до фактического завершения')&&!law.includes('Старый лимит удалён')],
  ['Interrogation counts',law.includes('от 8 до 10 вопросов')&&law.includes('Ровно 10 вопросов')],
  ['Immediate report removal',proofs.includes("showToast('Отчёт удалён из панели','Google Drive очищается в фоне')")],
  ['Drive cleanup queue',proofs.includes('queueReportCleanup')&&proofs.includes('processCleanupQueue')],
  ['Report tombstone realtime',realtime.includes('reportTombstones')&&realtime.includes('driveCleanup')]
];
let failed=false;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed=true;}
if(failed)process.exit(1);
console.log('v108 rules/reports regressions preserved in v109');
