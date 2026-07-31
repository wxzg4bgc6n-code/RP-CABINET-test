import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const key = 'AIzaSyExample_Public_Browser_Key_1234567890';
const store = new Map();
const context = {
  window: {},
  location: { search: '' },
  URLSearchParams,
  localStorage: {
    getItem(name){ return store.has(name) ? store.get(name) : null; },
    setItem(name,value){ store.set(name,String(value)); },
    removeItem(name){ store.delete(name); }
  }
};
context.window = context;
context.window.prompt = () => key;
vm.createContext(context);
vm.runInContext(read('js/config/google-drive-public-key.js'), context);
assert.equal(context.RPDrivePublicKey.get(), '');
assert.equal(context.RPDrivePublicKey.request(), key);
assert.equal(context.RPDrivePublicKey.get(), key);
context.location.search = `?id=test&pk=${encodeURIComponent(key)}`;
assert.equal(context.RPDrivePublicKey.get(), key);

const index = read('index.html');
const report = read('report.html');
const proofs = read('js/features/progress-proofs.js');
const reportJs = read('js/report.js');
const driveConfig = read('js/config/google-drive.js');
const version = read('js/core/version.js');
const readme = read('README.md');

for (const html of [index, report]) {
  assert.match(html, /google-drive-public-key\.js\?v=104[\s\S]*google-drive\.js\?v=104/);
}
assert.match(proofs, /searchParams\.set\(window\.RPDrivePublicKey\?\.queryKey\|\|'pk',key\)/);
assert.match(proofs, /verifyPublicManifest/);
assert.match(proofs, /report\.url=url/);
assert.match(reportJs, /window\.RPDrivePublicKey\?\.get/);
assert.match(reportJs, /Ключ отчёта отсутствует/);
assert.doesNotMatch(driveConfig, /AIza[0-9A-Za-z_-]{30,80}/);
assert.match(version, /TEST_VERSION="104"/);
assert.match(version, /Public report key/);
assert.match(readme, /^# RP CABINET — TEST v104/m);
assert.match(readme, /## Сохранено из v103/);
assert.match(readme, /## Сохранено из v102/);
assert.doesNotMatch(readme, /## Сохранено из v101/);

console.log('v104 public report key checks passed');
