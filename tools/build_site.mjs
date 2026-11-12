#!/usr/bin/env node
// Bundle the site and decoder into a self-contained offline HTML file.
import { readFile, writeFile, mkdir, copyFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { buildSevenZip } from './build_sevenzip.mjs';
import { buildDemo } from './build_demo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const web = resolve(root, 'web');
const out = resolve(root, 'dist');
const readText = async path => (await readFile(path, 'utf8')).replace(/\r\n?/g, '\n');
const token = text => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

await mkdir(out, { recursive: true });
await buildSevenZip();
await buildDemo();
let html = await readText(resolve(web, 'index.html'));
const css = await readText(resolve(web, 'style.css'));
const js = (await Promise.all([
  'sevenzip-assets.js', 'sevenzip-reader.js', 'execuvision.js', 'zip-reader.js', 'demo.js', 'app.js'
].map(name => readText(resolve(web, name))))).join('\n');
const license = await readText(resolve(root, 'LICENSE'));
// Callbacks preserve literal dollar signs in embedded code and styles.
html = html.replace("script-src 'self'", () => 'script-src ' + token(js))
  .replace("style-src 'self'", () => 'style-src ' + token(css))
  .replace('<link rel="stylesheet" href="style.css">', () => '<style>' + css + '</style>')
  .replace(/<script defer src="[^"]+"><\/script>/g, '')
  .replace('</body>', () => '<script>' + js + '</script></body>')
  .replace('<html', () => '<!--\n' + license + '\n-->\n<html');

await Promise.all([
  writeFile(resolve(out, 'index.html'), html),
  writeFile(resolve(out, 'ExecuVision-Picture-Desk.html'), html),
  writeFile(resolve(out, '.nojekyll'), ''),
  readText(resolve(web, 'README.md')).then(text => writeFile(resolve(out, 'README.md'),
    text.replaceAll('Open `index.html`', 'Open `ExecuVision-Picture-Desk.html`'))),
  ...[
    ['LICENSE', 'LICENSE'],
    ['licenses/pcmill-MIT.txt', 'pcmill-MIT.txt'],
    ['licenses/LGPL-2.1.txt', 'LGPL-2.1.txt'],
    ['web/vendor/7z/License.txt', '7z-License.txt'],
    ['web/vendor/7z/unRarLicense.txt', 'unRarLicense.txt']
  ].map(([source, target]) => copyFile(resolve(root, source), resolve(out, target))),
  cp(resolve(root, 'assets/demo'), resolve(out, 'demo'), { recursive: true }),
  cp(resolve(root, 'third_party'), resolve(out, 'third_party'), { recursive: true })
]);
console.log(`Built ${resolve(out, 'index.html')} (${Buffer.byteLength(html)} bytes)`);
