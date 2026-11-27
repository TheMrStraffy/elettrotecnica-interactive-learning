/*
 * Service worker: l'app funziona offline e si aggiorna quando esce una versione nuova.
 * - Tutti i file dell'app sono salvati alla prima visita (precache) e serviti dalla cache.
 * - Una versione nuova si scarica in sottofondo e si attiva solo quando l'utente sceglie "Aggiorna".
 * - I caratteri di Google Fonts si salvano la prima volta che arrivano dalla rete.
 */
// <precache> generato da tools/build-sw.js (npm run build): non modificare a mano
const VERSION = '1a6e8f504b4f';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/core.js',
  'js/logic.js',
  'js/circuit.js',
  'js/resistors.js',
  'js/networks.js',
  'js/binary.js',
  'js/gates.js',
  'js/karnaugh.js',
  'js/quiz.js',
  'js/dc.js',
  'js/schematics.js',
  'js/lessons.js',
  'js/units/cc-base.js',
  'js/units/cc-methods.js',
  'js/units/cc-advanced.js',
  'js/gen.js',
  'js/units/cc-gen.js',
  'js/phys.js',
  'js/units/b-mis.js',
  'js/units/b-alg.js',
  'js/units/b-elt.js',
  'js/basi.js',
  'js/units/b-ene.js',
  'js/units/b-cir.js',
  'js/units/b-res.js',
  'js/units/b-msr.js',
  'js/units/t-cap.js',
  'js/units/t-mag.js',
  'js/units/t-msi.js',
  'js/ac.js',
  'js/units/q-base.js',
  'js/units/q-ac.js',
  'js/units/q-rlc.js',
  'js/units/q-pot.js',
  'js/units/q-bode.js',
  'js/semi.js',
  'js/seq.js',
  'js/units/q-dio.js',
  'js/units/q-bjt.js',
  'js/units/q-opa.js',
  'js/units/q-seq.js',
  'js/path.js',
  'js/pwa.js',
  'icons/icon.svg',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
];
// </precache>

const CACHE = 'dok-app-' + VERSION;
const FONTS = 'dok-fonts';

self.addEventListener('install', (event) => {
  // cache: 'reload' scavalca la cache HTTP: si scaricano davvero i file della nuova versione
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dok-app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
  if (event.data === 'version' && event.source) event.source.postMessage({ type: 'version', version: VERSION });
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // la pagina: sempre index.html dalla cache (le "pagine" dell'app sono indirizzi con #)
    const key = req.mode === 'navigate' ? 'index.html' : req;
    event.respondWith(
      caches.open(CACHE)
        .then((c) => c.match(key, { ignoreSearch: true }))
        .then((hit) => hit || fetch(req))
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS).then(async (c) => {
        const hit = await c.match(req);
        const net = fetch(req)
          .then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    );
  }
});
