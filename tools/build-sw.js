// Aggiorna il blocco <precache> di sw.js: l'elenco dei file dell'app e l'impronta (hash) del loro contenuto.
// Ogni modifica a un file cambia l'impronta, quindi cambia sw.js: il browser scarica la nuova versione.
//   node tools/build-sw.js
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');

const ROOT = join(__dirname, '..');

/** File da salvare per l'uso offline, ricavati da index.html e dal manifest. */
function precache(root = ROOT) {
  const read = (p) => readFileSync(join(root, p), 'utf8');
  const html = read('index.html');
  const files = ['./', 'index.html', 'manifest.webmanifest'];
  const local = (u) => !/^(https?:|data:)/.test(u);
  for (const m of html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)) if (local(m[1])) files.push(m[1]);
  for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) if (local(m[1])) files.push(m[1]);
  for (const m of html.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)) if (local(m[1])) files.push(m[1]);
  JSON.parse(read('manifest.webmanifest')).icons.forEach((i) => files.push(i.src));
  const list = [...new Set(files)];
  const hash = createHash('sha256');
  list.filter((f) => f !== './').forEach((f) => {
    if (!existsSync(join(root, f))) throw new Error('File mancante per la cache: ' + f);
    hash.update(f + '\0').update(readFileSync(join(root, f)));
  });
  return { files: list, version: hash.digest('hex').slice(0, 12) };
}

/** Il blocco da mettere in sw.js. */
function block(p) {
  return `// <precache> generato da tools/build-sw.js (npm run build): non modificare a mano
const VERSION = '${p.version}';
const FILES = [
${p.files.map((f) => `  '${f}',`).join('\n')}
];
// </precache>`;
}

/** Legge versione ed elenco dal sw.js attuale. */
function current(root = ROOT) {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const v = sw.match(/const VERSION = '([^']*)';/);
  const f = sw.match(/const FILES = \[([\s\S]*?)\];/);
  return { version: v ? v[1] : null, files: f ? [...f[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [] };
}

function write(root = ROOT) {
  const p = precache(root);
  const path = join(root, 'sw.js');
  const sw = readFileSync(path, 'utf8');
  const next = sw.replace(/\/\/ <precache>[\s\S]*?\/\/ <\/precache>/, block(p));
  if (next === sw && current(root).version !== p.version) throw new Error('Blocco <precache> non trovato in sw.js');
  writeFileSync(path, next);
  return p;
}

module.exports = { precache, current, write };

if (require.main === module) {
  const p = write();
  console.log(`sw.js: versione ${p.version}, ${p.files.length} file da salvare per l'uso offline`);
}
