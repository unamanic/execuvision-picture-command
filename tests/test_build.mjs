import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { Script, runInNewContext } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(resolve(root, name), 'utf8');
const html = await read('dist/index.html');
assert.equal(html, await read('dist/ExecuVision-Picture-Desk.html'));
for (const tag of ['script', 'style']) {
  const content = html.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))[1];
  const hash = createHash('sha256').update(content).digest('base64');
  assert.ok(html.includes(`'sha256-${hash}'`), `${tag} CSP matches the embedded content`);
  if (tag === 'script') new Script(content);
}
assert.ok(html.includes("connect-src 'none'"));
assert.ok(!/<script[^>]+src=|<link[^>]+stylesheet/.test(html));
assert.ok(html.includes(await read('LICENSE')));
const assets = await read('web/sevenzip-assets.js');
const worker = runInNewContext(assets + '\nEVSevenZipWorker');
new Script(worker);
const encoded = worker.match(/Uint8Array\.from\(atob\("([A-Za-z0-9+/=]+)"\)/)[1];
assert.deepEqual(Buffer.from(encoded, 'base64'), await readFile(resolve(root, 'web/vendor/7z/7zz.wasm')));
for (const [source, target] of [
  ['LICENSE', 'LICENSE'], ['licenses/pcmill-MIT.txt', 'pcmill-MIT.txt'],
  ['licenses/LGPL-2.1.txt', 'LGPL-2.1.txt'],
  ['web/vendor/7z/License.txt', '7z-License.txt'],
  ['web/vendor/7z/unRarLicense.txt', 'unRarLicense.txt'],
  ['third_party/sources/7zip-24.09.tar.xz', 'third_party/sources/7zip-24.09.tar.xz'],
  ['third_party/sources/7z-wasm-1.2.0.tar.gz', 'third_party/sources/7z-wasm-1.2.0.tar.gz']
]) assert.deepEqual(await readFile(resolve(root, source)), await readFile(resolve(root, 'dist', target)));
assert.equal(await read('dist/.nojekyll'), '');
console.log('Build checks passed: standalone HTML, CSP hashes, worker syntax/WASM, licenses and source archives.');
