/* L'app installabile: uso offline, aggiornamenti, installazione, backup dei progressi */
(function () {
  'use strict';
  const App = window.App;
  const SITE = 'https://themrstraffy.github.io/elettrotecnica-interactive-learning/';
  const APP_ID = 'da-ohm-a-karnaugh';
  // il service worker c'è solo nel sito vero (con il manifest), non nel file unico o nelle anteprime
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  const canSW = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && hasManifest;
  // anteprima su un altro sito (senza manifest): lì i download sono bloccati, il backup si fa dall'app
  const preview = /^https?:$/.test(location.protocol) && !hasManifest;
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const st = { reg: null, waiting: null, deferred: null, version: null, persisted: null, note: '' };
  let wantReload = false;
  const $ = (id) => document.getElementById(id);

  // ---------- Service worker e aggiornamenti ----------
  if (canSW) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        st.reg = reg;
        if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          if (!w) return;
          render();
          w.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
            render();
          });
        });
        askVersion();
        render();
      }).catch(() => { st.note = 'Il salvataggio per l\'uso offline non è riuscito.'; render(); });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (wantReload) location.reload();
        else { askVersion(); render(); }
      });
      navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'version') { st.version = e.data.version; render(); }
      });
      // quando si torna sull'app, controlla se è uscita una versione nuova
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && st.reg) st.reg.update().catch(() => {});
      });
    });
  }
  function askVersion() {
    const c = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (c) c.postMessage('version');
  }
  function offer(worker) {
    st.waiting = worker;
    showBar();
    render();
  }
  function applyUpdate() {
    if (!st.waiting) return;
    wantReload = true;
    st.waiting.postMessage('skip-waiting');
  }
  function showBar() {
    if (document.querySelector('.update-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'update-bar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>È pronta una nuova versione dell\'app.</span><button type="button" class="btn small" data-act="update">Aggiorna</button><button type="button" class="btn ghost small" data-act="later">Più tardi</button>';
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'update') applyUpdate();
      bar.remove();
    });
    document.body.appendChild(bar);
  }

  // ---------- Installazione ----------
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    st.deferred = e;
    paintTab();
    render();
  });
  window.addEventListener('appinstalled', () => {
    st.deferred = null;
    paintTab();
    render();
    App.toast('App installata', 'La trovi tra le app del dispositivo.');
    persist();
  });
  async function install() {
    if (!st.deferred) return;
    const ev = st.deferred;
    st.deferred = null;
    ev.prompt();
    try { await ev.userChoice; } catch (e) { /* annullata */ }
    paintTab();
    render();
  }
  function paintTab() {
    const t = $('tab-app');
    if (!t) return;
    const offerInstall = st.deferred && !standalone();
    t.innerHTML = offerInstall ? '<small>⤓</small>Installa' : '<small>⚙</small>App';
    t.classList.toggle('install-ready', !!offerInstall);
  }

  // ---------- Memoria persistente ----------
  function persist() {
    if (!navigator.storage || !navigator.storage.persist) return;
    navigator.storage.persist().then((ok) => { st.persisted = ok; render(); }).catch(() => {});
  }
  if (navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then((ok) => { st.persisted = ok; render(); }).catch(() => {});

  // ---------- Backup dei progressi ----------
  function collect() {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('dok:')) data[k] = localStorage.getItem(k);
      }
    } catch (e) { return null; }
    return data;
  }
  function summary(data) {
    const num = (k, d) => { try { return JSON.parse(data[k]); } catch (e) { return d; } };
    const xp = Number(num('dok:xp', 0)) || 0;
    const prog = num('dok:progress', {}) || {};
    const types = Object.values(prog).reduce((s, u) => s + Object.keys(u || {}).length, 0);
    return { xp, types };
  }
  function backupFile() {
    const data = collect();
    if (!data) return null;
    const payload = { app: APP_ID, format: 1, saved: new Date().toISOString(), data };
    const name = `progressi-ohm-karnaugh-${new Date().toISOString().slice(0, 10)}.json`;
    return { blob: new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' }), name };
  }
  function download() {
    const f = backupFile();
    if (!f) { App.toast('Impossibile', 'Il browser non permette di leggere i dati salvati.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(f.blob);
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    App.toast('Backup salvato', f.name);
    persist();
  }
  function shareFile() {
    const f = backupFile();
    if (!f || !window.File) return null;
    const file = new File([f.blob], f.name, { type: 'application/json' });
    return navigator.canShare && navigator.canShare({ files: [file] }) ? file : null;
  }
  async function share() {
    const file = shareFile();
    if (!file) return;
    try { await navigator.share({ files: [file], title: 'Progressi · Da Ohm a Karnaugh' }); } catch (e) { /* annullata */ }
  }
  async function restore(file) {
    let payload;
    try { payload = JSON.parse(await file.text()); } catch (e) { payload = null; }
    const ok = payload && payload.app === APP_ID && payload.data && typeof payload.data === 'object' &&
      Object.entries(payload.data).every(([k, v]) => k.startsWith('dok:') && typeof v === 'string');
    if (!ok) { App.toast('File non valido', 'Scegli un backup salvato da questa app (.json).'); return; }
    const now = summary(collect() || {});
    const next = summary(payload.data);
    const when = payload.saved ? new Date(payload.saved).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'data sconosciuta';
    if (!window.confirm(`Sostituire i progressi di questo dispositivo (${now.xp} XP, ${now.types} tipi di esercizio risolti) con quelli del backup del ${when} (${next.xp} XP, ${next.types} tipi)?`)) return;
    try {
      Object.keys(collect() || {}).forEach((k) => localStorage.removeItem(k));
      Object.entries(payload.data).forEach(([k, v]) => localStorage.setItem(k, v));
    } catch (e) { App.toast('Impossibile', 'Il browser non ha permesso di salvare i dati.'); return; }
    location.reload();
  }

  // ---------- Pannello "App" ----------
  function installCard() {
    if (standalone()) return '<p class="app-ok">✓ Stai usando l\'app installata.</p><p>Si apre dalla schermata Home o dal menu delle app, a schermo intero.</p>';
    if (!canSW) {
      return `<p>Questa copia (un file o un'anteprima) non si può installare.</p><p>Apri il sito dell'app con Chrome, sul telefono o sul PC, e installala da lì:</p><p><a class="btn" href="${SITE}" target="_blank" rel="noopener">Apri ${SITE.replace('https://', '')}</a></p>`;
    }
    const btn = st.deferred ? '<p><button type="button" class="btn" data-act="install">⤓ Installa l\'app</button></p>' : '';
    return `${btn}<p>${st.deferred ? 'Oppure, a mano:' : 'Se non vedi il pulsante, installala dal menu del browser:'}</p>
      <ul class="app-how">
        <li><strong>Android</strong> (Chrome): menu <span class="mono">⋮</span> → <em>Installa app</em> (o <em>Aggiungi a schermata Home</em>).</li>
        <li><strong>PC</strong> (Chrome o Edge): l'icona di installazione a destra nella barra degli indirizzi, oppure menu <span class="mono">⋮</span> → <em>Installa Da Ohm a Karnaugh</em>.</li>
        <li><strong>iPhone</strong> (Safari): <em>Condividi</em> → <em>Aggiungi alla schermata Home</em>.</li>
      </ul>`;
  }
  function offlineCard() {
    if (!canSW) return '<p>Il file unico funziona già senza internet, ma non si aggiorna da solo: per le versioni nuove usa il sito.</p>';
    const ctrl = navigator.serviceWorker.controller;
    let s = ctrl ? `<p class="app-ok">✓ Pronta per l'uso offline${st.version ? ` <span class="mono">(versione ${st.version.slice(0, 7)})</span>` : ''}.</p>` : '<p>Sto salvando l\'app sul dispositivo per l\'uso offline…</p>';
    if (st.waiting) s += '<p><strong>È pronta una nuova versione.</strong></p><p><button type="button" class="btn" data-act="update">Aggiorna ora</button></p>';
    else if (st.reg && st.reg.installing) s += '<p>Sto scaricando una nuova versione…</p>';
    else s += '<p>Quando esce una versione nuova la scarica da sola e ti chiede se aggiornare.</p><p><button type="button" class="btn ghost" data-act="check">Controlla aggiornamenti</button></p>';
    if (st.note) s += `<p class="hint">${st.note}</p>`;
    return s;
  }
  function progressCard() {
    const data = collect();
    if (!data) return '<p>Questo browser non permette di salvare i progressi (forse sei in navigazione privata).</p>';
    const sm = summary(data);
    if (preview) return `<p>Hai <strong>${sm.xp} XP</strong> e hai risolto <strong>${sm.types}</strong> tipi di esercizio.</p><p class="hint">Questa è un'anteprima: i progressi restano qui. Per salvarli in un file e portarli da un dispositivo all'altro usa l'app installata.</p>`;
    return `<p>Hai <strong>${sm.xp} XP</strong> e hai risolto <strong>${sm.types}</strong> tipi di esercizio.</p>
      <p class="hint">I progressi sono salvati su questo dispositivo, nel browser. Se cancelli i dati del sito o cambi telefono li perdi: ogni tanto salva un backup. Con lo stesso file li porti dal telefono al PC.</p>
      <div class="row"><button type="button" class="btn" data-act="export">Salva un backup</button>${shareFile() ? '<button type="button" class="btn ghost" data-act="share">Condividi il backup</button>' : ''}<button type="button" class="btn ghost" data-act="import">Ripristina da un file</button></div>
      <input type="file" accept="application/json,.json" data-act="file" hidden>
      ${st.persisted === true ? '<p class="hint">✓ Memoria protetta: il browser non cancellerà questi dati da solo.</p>' : ''}`;
  }
  function render() {
    const host = $('app');
    if (!host) return;
    host.innerHTML = `
      <header class="panel-head">
        <h2>L'app</h2>
        <p>Installa "Da Ohm a Karnaugh" sul telefono o sul PC: si apre come un'app, funziona senza internet e si aggiorna da sola quando escono lezioni nuove.</p>
      </header>
      <div class="app-grid">
        <article class="card"><div class="card-head"><h3>Installazione</h3></div>${installCard()}</article>
        <article class="card"><div class="card-head"><h3>Offline e aggiornamenti</h3></div>${offlineCard()}</article>
        <article class="card"><div class="card-head"><h3>I tuoi progressi</h3></div>${progressCard()}</article>
      </div>`;
  }
  function wire() {
    const host = $('app');
    if (!host || host.dataset.wired) return;
    host.dataset.wired = '1';
    host.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'install') install();
      else if (act === 'update') applyUpdate();
      else if (act === 'export') download();
      else if (act === 'share') share();
      else if (act === 'import') host.querySelector('input[data-act="file"]').click();
      else if (act === 'check' && st.reg) {
        b.disabled = true;
        b.textContent = 'Controllo…';
        try { await st.reg.update(); } catch (err) { /* offline */ }
        setTimeout(() => {
          if (!st.waiting && !(st.reg && st.reg.installing)) App.toast('Nessun aggiornamento', navigator.onLine ? 'Hai già l\'ultima versione.' : 'Sei offline: riprova con la connessione.');
          render();
        }, 800);
      }
    });
    host.addEventListener('change', (e) => {
      if (e.target.matches('input[data-act="file"]') && e.target.files[0]) restore(e.target.files[0]);
    });
  }

  App.pwa = { render, install, canSW, standalone };
  wire();
  render();
  paintTab();
  document.addEventListener('dok:tab', (e) => { if (e.detail === 'app') render(); });
  document.addEventListener('dok:progress', () => { if (!$('app').hidden) render(); });
})();
