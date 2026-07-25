import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const index=read('index.html');
const searchJs=read('js/features/smart-search.js');
const searchCss=read('css/features/smart-search.css');
const registry=read('data/registry.js');
const mainCss=read('css/main.css');

assert.match(index,/id="smartSearchModal"/);
assert.match(index,/id="smartSearchInput"/);
assert.match(index,/id="smartSearchScopeToggle"/);
assert.match(index,/id="smartSearchMobileTrigger"/);
assert.match(index,/js\/features\/smart-search\.js\?v=89/);
assert.ok(index.indexOf('js/features/smart-search.js?v=89')>index.indexOf('js/app.js?v=89'));
assert.match(mainCss,/features\/smart-search\.css\?v=89/);
assert.match(searchCss,/@media\(max-width:768px\)/);
assert.match(searchCss,/position:fixed/);
assert.match(searchCss,/var\(--accent\)/);
assert.doesNotMatch(searchCss,/#ffd166|#78aaff|#76f3c5/i);

assert.match(registry,/Academy:\{path:'Государственная служба',organization:'ARMY'/);
assert.match(registry,/USAF:\{path:'Государственная служба',organization:'ARMY'/);
assert.match(searchJs,/window\.RPCabinetSectionRegistry/);
assert.match(searchJs,/template\.content\.cloneNode\(true\)/);
assert.match(searchJs,/state\.mode==="current"/);
assert.match(searchJs,/record\.kind==="tests"\?"tests":"department"/);
assert.match(searchJs,/inputTimer=setTimeout\(renderResults,35\)/);
assert.match(searchJs,/Крайм/);
assert.match(searchJs,/Государственная служба/);
assert.doesNotMatch(searchJs,/firstProject|modalProjectSelect|GTA5RP|Majestic RP/);

const sandbox={window:{},document:undefined,console};
vm.runInNewContext(searchJs,sandbox,{filename:'smart-search.js'});
const engine=sandbox.window.RPCabinetSmartSearchTest;
assert.ok(engine);
assert.equal(engine.normalize('Ёлка, 3.11 / 10-3'),'елка 3.11 / 10-3');
assert.deepEqual(Array.from(engine.queryGroups('три')[0]),['три','3']);
assert.ok(Array.from(engine.queryGroups('усав')[0]).includes('usaf'));

const key=engine.sourceKey('Государственная служба','ARMY','USAF');
const record=(title,text,codes=[])=>({
  normTitle:engine.normalize(title),normText:engine.normalize(text),codes,text,isBlock:false,
  path:'Государственная служба',org:'ARMY',department:'USAF'
});
assert.ok(engine.scoreRecord(record('Код 3.11','Доклад 3.11',['3.11']),'3',key)>0);
assert.ok(engine.scoreRecord(record('Код 3.11','Доклад 3.11',['3.11']),'три',key)>0);
assert.ok(engine.scoreRecord(record('USAF патруль','Военно-воздушные силы USAF'),'усав',key)>0);
assert.ok(engine.scoreRecord(record('Наручники','Использование наручников с бодикамерой'),'нару',key)>0);
assert.equal(engine.scoreRecord(record('Тен-коды','Доклады и рация'),'наручники',key),0);

const searchableData=[
  read('data/academy/content.js'),read('data/academy/tests.js'),
  read('data/usaf/content.js'),read('data/usaf/law-guide.js'),read('data/usaf/tests.js')
].join('\n');
assert.match(searchableData,/3\.1|3-1|10-3/);
assert.match(searchableData,/Наручники|наручники/);
assert.match(searchableData,/question-text/);
assert.match(searchableData,/answer-options/);

console.log('RP CABINET v89 smart context search tests: OK');
