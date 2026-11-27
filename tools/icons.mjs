// Disegna le icone dell'app (SVG) e le esporta in PNG con il browser di Playwright.
//   node tools/icons.mjs
// Serve Playwright installato (anche globalmente). Le PNG generate sono nel repository:
// questo script si usa solo per cambiare il disegno.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (f) => join(root, 'icons', f);

const PEN = '#1f4fd1';
const ENERGY = '#f2a516';

/** Disegno su 512 × 512. rounded: angoli arrotondati; scale: riduce il contenuto (icone "maskable"). */
function svg({ rounded = true, scale = 1 } = {}) {
  const rx = rounded ? 112 : 0;
  const t = `translate(256 256) scale(${scale}) translate(-256 -256)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <pattern id="q" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="2"/></pattern>
    <clipPath id="c"><rect width="512" height="512" rx="${rx}"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="512" height="512" fill="${PEN}"/>
    <rect width="512" height="512" fill="url(#q)"/>
  </g>
  <g transform="${t}">
    <path d="M118 352 H203 L196.5 319.6 A115 115 0 1 1 315.5 319.6 L309 352 H394" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M150 418 q26.5 -34 53 0 t53 0 t53 0 t53 0" fill="none" stroke="${ENERGY}" stroke-width="18" stroke-linecap="round"/>
  </g>
</svg>
`;
}

writeFileSync(out('icon.svg'), svg());
writeFileSync(out('maskable.svg'), svg({ rounded: false, scale: 0.78 }));

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }
const browser = await pw.chromium.launch();
const shots = [
  ['icon-192.png', 192, svg()],
  ['icon-512.png', 512, svg()],
  ['maskable-512.png', 512, svg({ rounded: false, scale: 0.78 })],
  ['apple-touch-icon.png', 180, svg({ rounded: false, scale: 0.86 })],
  ['favicon-32.png', 32, svg()],
];
for (const [name, size, s] of shots) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${s.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
  await page.screenshot({ path: out(name), omitBackground: true });
  await page.close();
}
await browser.close();
console.log('Icone scritte in icons/');
