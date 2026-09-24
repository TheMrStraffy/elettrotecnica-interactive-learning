// Crea un unico file HTML autosufficiente (CSS e JS incorporati).
//   node tools/build-single.mjs                 → dist/da-ohm-a-karnaugh.html
//   node tools/build-single.mjs --artifact out  → solo il contenuto della pagina, senza <html>/<head>/<body>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="css\/style\.css">/, () => `<style>\n${read('css/style.css')}\n</style>`);
html = html.replace(/<script src="(js\/[\w-]+\.js)"><\/script>/g, (_, src) => `<script>\n${read(src)}\n</script>`);

const args = process.argv.slice(2);
let out = join(root, 'dist', 'da-ohm-a-karnaugh.html');
if (args[0] === '--artifact') {
  out = args[1];
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
    .replace(/<meta charset[^>]*>\s*/, '')
    .replace(/<meta name="viewport"[^>]*>\s*/, '');
  const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
  html = head.trim() + '\n' + body.trim() + '\n';
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log('Scritto ' + out + ' (' + Math.round(html.length / 1024) + ' kB)');
