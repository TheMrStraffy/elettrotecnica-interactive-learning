// L'app installabile: manifest, icone e service worker coerenti con i file del sito.
const test = require('node:test');
const assert = require('node:assert');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const SW = require('../tools/build-sw.js');

const root = join(__dirname, '..');

test('sw.js è aggiornato con i file e la versione attuali', () => {
  const want = SW.precache(root);
  const have = SW.current(root);
  assert.deepStrictEqual(have.files, want.files, 'elenco dei file di sw.js superato: esegui npm run build');
  assert.strictEqual(have.version, want.version, 'versione di sw.js superata: esegui npm run build');
});

test('manifest e icone', () => {
  const m = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
  assert.strictEqual(m.display, 'standalone');
  assert.strictEqual(m.start_url, './');
  assert.strictEqual(m.scope, './');
  // Chrome per installare vuole almeno un'icona da 192 e una da 512
  const sizes = m.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'));
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'), 'icona maskable per Android');
  m.icons.forEach((i) => assert.ok(existsSync(join(root, i.src)), 'icona mancante: ' + i.src));
  // le PNG hanno davvero la dimensione dichiarata (larghezza e altezza nell'intestazione IHDR)
  m.icons.filter((i) => i.type === 'image/png').forEach((i) => {
    const b = readFileSync(join(root, i.src));
    const [w, h] = i.sizes.split('x').map(Number);
    assert.strictEqual(b.readUInt32BE(16), w, i.src + ' larghezza');
    assert.strictEqual(b.readUInt32BE(20), h, i.src + ' altezza');
  });
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('<link rel="manifest" href="manifest.webmanifest">'));
  assert.ok(existsSync(join(root, '.nojekyll')), '.nojekyll per GitHub Pages');
});
