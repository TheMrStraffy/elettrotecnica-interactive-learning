/* Percorso dalla 1ª alla 5ª, navigazione e vista delle unità */
(function () {
  'use strict';
  const App = window.App;
  const $ = (id) => document.getElementById(id);

  // Unità del percorso. route: dove porta; soon: in arrivo (con la fase prevista).
  const YEARS = [
    {
      n: '1ª–2ª', title: 'Biennio', sub: 'Le basi: grandezze elettriche, circuito elementare, resistori',
      units: [
        { title: 'Il circuito elementare', desc: 'Carica, corrente, tensione e f.e.m.; generatore reale, legge di Ohm, potenza ed effetto Joule.', route: 'circuito', kind: 'Laboratorio' },
        { title: 'Resistori e resistività', desc: 'Codice colori a 4 e 5 fasce, seconda legge di Ohm, materiali e temperatura.', route: 'resistori', kind: 'Laboratorio' },
        { unit: 'mis' },
        { unit: 'alg' },
        { unit: 'elt' },
      ],
    },
    {
      n: '3ª', title: 'Terzo anno', sub: 'Reti in corrente continua, elettronica digitale',
      units: [
        { unit: 'cc' },
        { title: 'Sistemi di numerazione', desc: 'Binario, ottale, esadecimale, BCD, complemento a 2, somma e sottrazione con i riporti.', route: 'binario', kind: 'Laboratorio' },
        { title: 'Porte logiche e circuiti combinatori', desc: 'Le 7 porte con simboli ANSI e IEC, semisommatore, sommatore completo, multiplexer.', route: 'porte', kind: 'Laboratorio' },
        { title: 'Algebra di Boole e mappe di Karnaugh', desc: 'Tabella di verità, forme canoniche, forma minima, circuito AND-OR, allenamento.', route: 'karnaugh', kind: 'Laboratorio' },
        { title: 'Condensatori e transitori RC', desc: 'Capacità, serie e parallelo di condensatori, carica e scarica, costante di tempo.', soon: 3 },
        { title: 'Magnetismo e induttori', desc: 'Campo magnetico, induzione, induttanza, transitori RL.', soon: 3 },
        { title: 'Circuiti combinatori integrati', desc: 'Decoder, encoder, multiplexer, comparatori, sommatori a più bit.', soon: 3 },
      ],
    },
    {
      n: '4ª', title: 'Quarto anno', sub: 'Corrente alternata, componenti attivi, logica sequenziale',
      units: [
        { title: 'Corrente alternata e fasori', desc: 'Sinusoidi, valore efficace, fasori e numeri complessi.', soon: 4 },
        { title: 'Impedenza, circuiti RLC e risonanza', desc: 'Reattanze, triangolo delle impedenze, risonanza serie e parallelo.', soon: 4 },
        { title: 'Potenze in alternata e rifasamento', desc: 'Potenza attiva, reattiva, apparente; fattore di potenza.', soon: 4 },
        { title: 'Diodi e raddrizzatori', desc: 'Caratteristica, retta di carico, raddrizzatori a una e due semionde, Zener.', soon: 4 },
        { title: 'Transistor BJT e MOSFET', desc: 'Polarizzazione, transistor come interruttore e come amplificatore.', soon: 4 },
        { title: 'Amplificatori operazionali', desc: 'Invertente, non invertente, sommatore, differenziale, comparatore.', soon: 4 },
        { title: 'Logica sequenziale', desc: 'Latch, flip-flop, contatori, registri a scorrimento.', soon: 4 },
        { title: 'Filtri passivi e diagrammi di Bode', desc: 'Passa-basso e passa-alto RC, frequenza di taglio, decibel.', soon: 4 },
      ],
    },
    {
      n: '5ª', title: 'Quinto anno', sub: 'Articolazione Elettronica: elettronica applicata e sistemi',
      units: [
        { title: 'Operazionali: applicazioni', desc: 'Integratore, derivatore, trigger di Schmitt, amplificatore per strumentazione.', soon: 5 },
        { title: 'Filtri attivi', desc: 'Sallen-Key, passa-banda, risposta in frequenza.', soon: 5 },
        { title: 'Oscillatori e forme d\'onda', desc: 'Oscillatori sinusoidali, astabile e monostabile con il 555.', soon: 5 },
        { title: 'Conversione A/D e D/A', desc: 'Campionamento, quantizzazione, convertitori a scala R-2R e ad approssimazioni successive.', soon: 5 },
        { title: 'Trasduttori e condizionamento', desc: 'Sensori di temperatura, luce, posizione; adattamento del segnale.', soon: 5 },
        { title: 'Alimentatori e regolatori', desc: 'Alimentatore stabilizzato, regolatori lineari e switching.', soon: 5 },
        { title: 'Microcontrollori e acquisizione dati', desc: 'Ingressi e uscite digitali e analogiche, PWM, sistemi di acquisizione.', soon: 5 },
        { title: 'Sistemi di controllo', desc: 'Schemi a blocchi, funzione di trasferimento, stabilità, regolatori PID.', soon: 5 },
      ],
    },
  ];

  const units = () => Object.fromEntries((App.unitsData || []).map((u) => [u.id, u]));
  const SECTION_ROUTES = ['circuito', 'resistori', 'binario', 'porte', 'karnaugh', 'sfide', 'formulario'];
  const SECTION_INFO = {
    circuito: ['1ª–2ª', 'Il circuito elementare'], resistori: ['1ª–2ª', 'Resistori e resistività'],
    binario: ['3ª', 'Sistemi di numerazione'], porte: ['3ª', 'Porte logiche e circuiti'], karnaugh: ['3ª', 'Algebra di Boole e Karnaugh'],
  };

  // ---------- Percorso ----------
  function unitLessonsWithFamilies(u) {
    return u.lessons.flatMap((l) => (l.families || []).map((f) => f.id));
  }

  function renderPercorso() {
    const U = units();
    const last = App.store.get('route', null);
    const host = $('percorso');
    host.innerHTML = `
      <header class="panel-head">
        <h2>Il percorso, dalla 1ª alla 5ª</h2>
        <p>Le unità sono in ordine di programma. Quelle pronte si aprono; le altre sono in preparazione, una fase alla volta.</p>
        ${last && last !== 'percorso' ? `<div class="row"><button class="btn" type="button" data-route="${last}">Riprendi da dove eri</button></div>` : ''}
      </header>
      ${YEARS.map((y) => `
        <section class="year" aria-label="${y.title}">
          <div class="year-head"><span class="year-n">${y.n}</span><div><h3>${y.title}</h3><p>${y.sub}</p></div></div>
          <div class="unit-grid">${y.units.map((x) => card(x, U)).join('')}</div>
        </section>`).join('')}`;
  }

  function card(x, U) {
    if (x.unit) {
      const u = U[x.unit];
      if (!u) return '';
      const fams = unitLessonsWithFamilies(u);
      const done = fams.filter((f) => App.progress.has(u.id, f)).length;
      const nl = u.lessons.length;
      return `<a class="unit-card${u.badge ? ' featured' : ' ready'}" href="#${u.route}" data-route="${u.route}">
        <span class="row tags">${u.badge ? `<span class="tag accent">${u.badge}</span>` : '<span class="tag accent">Nuovo</span>'}<span class="tag">${nl} lezioni · ${fams.length} tipi di esercizio</span></span>
        <h4>${u.title}</h4><p>${u.desc}</p>
        <span class="uprog"><span class="bar"><i style="width:${(100 * done) / Math.max(1, fams.length)}%"></i></span><span class="hint">${done}/${fams.length} tipi di esercizio risolti</span></span></a>`;
    }
    if (x.soon) {
      return `<div class="unit-card soon" aria-disabled="true"><span class="tag">In arrivo · fase ${x.soon}</span><h4>${x.title}</h4><p>${x.desc}</p></div>`;
    }
    return `<a class="unit-card" href="#${x.route}" data-route="${x.route}"><span class="tag">${x.kind}</span><h4>${x.title}</h4><p>${x.desc}</p></a>`;
  }

  // ---------- Vista di un'unità ----------
  const cache = {};

  function lessonDone(u, l) {
    return (l.families || []).some((f) => App.progress.has(u.id, f.id));
  }

  function renderStrip(u, current) {
    const strip = document.querySelector('#unit-view .lesson-strip');
    strip.innerHTML = u.lessons.map((l) => `<button type="button" class="pill${l.id === current ? ' current' : ''}${lessonDone(u, l) ? ' done' : ''}" data-route="${u.id}-${l.id}"${l.id === current ? ' aria-current="page"' : ''}><b>${l.num || ''}</b>${l.short}</button>`).join('');
    const cur = strip.querySelector('.current');
    if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function buildLesson(u, l) {
    const el = document.createElement('div');
    el.className = 'lesson';
    const isMod = typeof l.num === 'number';
    el.innerHTML = `
      <header class="panel-head">
        <p class="eyebrow">${isMod ? (u.lessonWord || 'Modulo') + ' ' + l.num + ' · ' : ''}${u.title}</p>
        <h2>${l.title}</h2>
        <p>${l.intro}</p>
        ${l.goals ? `<ul class="goals">${l.goals.map((g) => `<li>${g}</li>`).join('')}</ul>` : ''}
      </header>
      <div class="panel-grid">
        <div class="lab"></div>
        <aside class="notes" aria-label="Appunti"><header><h3>Appunti</h3><span class="hand">${u.notesTag || 'quello che serve sapere'}</span></header>${l.theory || ''}</aside>
      </div>`;
    const lab = el.querySelector('.lab');
    (l.widgets || []).forEach((w) => { try { w(lab); } catch (e) { console.error(e); } });
    if (l.example) lab.appendChild(App.Lessons.exampleCard(l.example, l.exampleTitle));
    if ((l.families || []).length) {
      const head = document.createElement('div');
      head.className = 'sec-head';
      head.innerHTML = `<h3>Esercizi</h3><p>${l.families.length} tipi, numeri sempre nuovi. ● base · ●● medio · ●●● avanzato</p>`;
      lab.appendChild(head);
      l.families.forEach((f) => lab.appendChild(App.Lessons.exerciseCard(u.id, f)));
    }
    return el;
  }

  function showUnit(uid, lid) {
    const u = units()[uid];
    if (!u) return false;
    const l = u.lessons.find((x) => x.id === lid) || u.lessons[0];
    const view = $('unit-view');
    view.hidden = false;
    view.querySelector('.unit-title').textContent = u.title;
    const body = view.querySelector('.lesson-body');
    // rimetti a posto le sezioni prese in prestito
    body.querySelectorAll(':scope > section.panel').forEach((s) => { s.hidden = true; $('parking').appendChild(s); });
    [...body.children].forEach((c) => c.remove());
    if (l.section) {
      const s = $(l.section);
      s.hidden = false;
      body.appendChild(s);
    } else {
      const key = u.id + '-' + l.id;
      if (!cache[key]) cache[key] = buildLesson(u, l);
      body.appendChild(cache[key]);
    }
    renderStrip(u, l.id);
    const i = u.lessons.indexOf(l);
    const prev = u.lessons[i - 1];
    const next = u.lessons[i + 1];
    view.querySelector('.lesson-pager').innerHTML =
      (prev ? `<button type="button" class="btn ghost" data-route="${u.id}-${prev.id}">← ${prev.short}</button>` : '<span></span>') +
      (next ? `<button type="button" class="btn" data-route="${u.id}-${next.id}">${next.short} →</button>` : `<button type="button" class="btn ghost" data-route="percorso">Torna al percorso</button>`);
    setCurrentTab((u.yearLabel || u.year + 'ª') + ' · ' + u.title, u.id + '-' + l.id);
    return true;
  }

  // ---------- Barra di navigazione ----------
  function setCurrentTab(label, route) {
    const t = $('tab-current');
    if (!label) { t.hidden = true; return; }
    t.hidden = false;
    t.dataset.route = route;
    t.innerHTML = `<small>▸</small>${label}`;
  }

  function markTabs(route) {
    document.querySelectorAll('.tabs .tab').forEach((t) => {
      const on = t.id === 'tab-current' ? !t.hidden && !['percorso', 'sfide', 'formulario'].includes(route) : t.dataset.route === route;
      if (on) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
  }

  // ---------- Router ----------
  function go(route, opts = {}) {
    if (!route) route = 'percorso';
    if (route === 'reti') route = 'cc-lab';
    if (route === 'cc') route = 'cc-m1';
    document.querySelectorAll('main > section.panel, #parking > section.panel').forEach((s) => { s.hidden = true; });
    $('unit-view').hidden = true;
    let shown = false;
    const m = route.match(/^([a-z]+)-([a-z0-9]+)$/);
    if (route === 'percorso') {
      renderPercorso();
      $('percorso').hidden = false;
      setCurrentTab(null);
      shown = true;
    } else if (m && units()[m[1]]) {
      shown = showUnit(m[1], m[2]);
    } else if (SECTION_ROUTES.includes(route) && $(route)) {
      const s = $(route);
      if (s.parentElement.id === 'parking') document.querySelector('main').appendChild(s);
      s.hidden = false;
      const info = SECTION_INFO[route];
      setCurrentTab(info ? info[0] + ' · ' + info[1] : null, route);
      shown = true;
    }
    if (!shown) return go('percorso', opts);
    markTabs(route);
    App.store.set('route', route);
    try { history.replaceState(null, '', '#' + route); } catch (e) { /* anteprima senza history */ }
    document.dispatchEvent(new CustomEvent('dok:tab', { detail: route }));
    if (!opts.keepScroll) {
      const nav = document.querySelector('.tabs');
      const top = nav.getBoundingClientRect().top + window.scrollY - 1;
      if (window.scrollY > top) window.scrollTo({ top });
    }
  }
  App.go = go;

  App.onReady(function initPath() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-route]');
      if (!a) return;
      e.preventDefault();
      go(a.dataset.route);
    });
    window.addEventListener('hashchange', () => {
      const r = location.hash.slice(1);
      if (r && r !== App.store.get('route', '')) go(r);
    });
    document.addEventListener('dok:progress', () => {
      const r = App.store.get('route', '');
      const m = r.match(/^([a-z]+)-([a-z0-9]+)$/);
      if (m && units()[m[1]]) renderStrip(units()[m[1]], m[2]);
    });
    const hash = location.hash.slice(1);
    go(hash || App.store.get('route', 'percorso'), { keepScroll: true });
  });
})();
