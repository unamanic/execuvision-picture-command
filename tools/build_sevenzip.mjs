import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const readText = async path => (await readFile(path, 'utf8')).replace(/\r\n?/g, '\n');

export async function buildSevenZip() {
  const vendor = resolve(root, 'web/vendor/7z');
  const wasm = (await readFile(resolve(vendor, '7zz.wasm'))).toString('base64');
  const worker = await readText(resolve(vendor, '7zz.umd.js')) + '\n' +
    await readText(resolve(root, 'web/sevenzip-core.js')) +
    `\nonmessage=async e=>{try{const entries=await extractSevenZip(e.data,SevenZip,Uint8Array.from(atob(${JSON.stringify(wasm)}),c=>c.charCodeAt(0)));postMessage({entries},entries.map(x=>x.bytes.buffer))}catch(error){postMessage({error:error.message||'7z extraction failed'})}};`;
  await writeFile(resolve(root, 'web/sevenzip-assets.js'),
    '/* Generated offline 7z-wasm 1.2.0 assets; see vendor/7z/License.txt. */\n' +
    `const EVSevenZipWorker=${JSON.stringify(worker)};\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSevenZip();
}
