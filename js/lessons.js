/* Motore delle lezioni: esercizi con correzione, esempi svolti, tabelle R-I-V-P, progressi */
(function () {
  'use strict';
  const App = window.App;

  // ---------- Progressi: famiglie di esercizi risolte per unità ----------
  App.progress = {
    data: App.store.get('progress', {}),
    mark(unit, fam) {
      const u = (this.data[unit] = this.data[unit] || {});
      u[fam] = (u[fam] || 0) + 1;
      App.store.set('progress', this.data);
      document.dispatchEvent(new CustomEvent('dok:progress', { detail: { unit, fam } }));
    },
    has(unit, fam) { return !!(this.data[unit] && this.data[unit][fam]); },
    count(unit) { return Object.keys(this.data[unit] || {}).length; },
  };

  // ---------- Controllo delle risposte ----------
  const FACT = { A: 1, mA: 1e-3, 'µA': 1e-6, V: 1, mV: 1e-3, kV: 1e3, 'Ω': 1, 'kΩ': 1e3, 'MΩ': 1e6, W: 1, mW: 1e-3, kW: 1e3, S: 1, mS: 1e-3 };

  function checkNum(ask, raw) {
    const s = String(raw).trim();
    if (!s) return { state: 'empty' };
    let got;
    const bare = s.replace(/\s+/g, '').replace(',', '.').replace('−', '-');
    if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(bare)) got = Number(bare);
    else {
      const v = App.parseNum(s);
      const f = FACT[ask.unit];
      if (!isFinite(v) || !f) return { state: 'format' };
      got = v / f;
    }
    const want = ask.value;
    const tol = ask.tol != null ? ask.tol : 0.015;
    const close = (x) => (Math.abs(want) < 1e-9 ? Math.abs(x) < 0.005 : Math.abs(x - want) <= tol * Math.abs(want));
    if (close(got)) return { state: 'ok' };
    if (Math.abs(want) > 1e-9 && close(-got)) return { state: 'sign' };
    if (Math.abs(want) > 1e-9 && (close(got / 1000) || close(got * 1000))) return { state: 'unit' };
    return { state: 'bad' };
  }

  const fmtAns = (ask) => (ask.type === 'choice' ? ask.options[ask.answer] : App.num(ask.value, 4) + (ask.unit ? ' ' + ask.unit : ''));

  // ---------- Tabella R, I, V, P ----------
  /** rows: [{ name, R, I, V, P, note }] — valori numerici; I e V in valore assoluto. */
  function rivp(rows) {
    const c = (x, u) => (x == null ? '—' : typeof x === 'string' ? x : App.si(x, u, 4));
    return `<div class="table-wrap"><table class="tbl rivp"><thead><tr><th>Componente</th><th>R</th><th>I</th><th>V</th><th>P</th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td>${r.name}</td><td>${c(r.R, 'Ω')}</td><td>${c(r.I, 'A')}</td><td>${c(r.V, 'V')}</td><td>${c(r.P, 'W')}${r.note ? ' <span class="hint">' + r.note + '</span>' : ''}</td></tr>`).join('') +
      `</tbody></table></div>`;
  }

  /** Tabella completa da una rete risolta con DC.solve. */
  function rivpFromNet(net, sol) {
    const rows = [];
    net.forEach((e) => {
      const I = sol.i[e.name];
      if (e.type === 'R') {
        rows.push({ name: name(e.name), R: e.value, I: Math.abs(I), V: Math.abs(I * e.value), P: e.value * I * I });
      } else if (e.type === 'V' && e.value) {
        const P = sol.p[e.name];
        rows.push({ name: 'Generatore ' + name(e.name), R: null, I: Math.abs(I), V: e.value, P: Math.abs(P), note: Math.abs(P) < 1e-9 ? '' : P > 0 ? 'erogata' : 'assorbita' });
      }
    });
    return rivp(rows);
  }

  /** 'R1' → R₁ in HTML */
  function name(n) {
    const m = String(n).match(/^([A-Za-z])(.*)$/);
    if (!m) return n;
    return '<var>' + m[1] + '</var>' + (m[2] ? '<sub>' + m[2] + '</sub>' : '');
  }

  const LEVEL = { 1: 'base', 2: 'medio', 3: 'avanzato' };

  // ---------- Scheda esercizio ----------
  function exerciseCard(unitId, fam) {
    const el = document.createElement('article');
    el.className = 'card ex';
    el.id = 'ex-' + fam.id;
    let p, r, asks, revealed, solved;

    function fresh(params) {
      p = params || fam.gen();
      r = fam.solve(p);
      asks = fam.asks(p, r);
      revealed = false;
      solved = false;
      draw();
    }

    function draw() {
      const done = App.progress.has(unitId, fam.id);
      el.innerHTML = `
        <header class="ex-head">
          <span class="lvl lvl-${fam.level}" title="Difficoltà: ${LEVEL[fam.level]}">${'●'.repeat(fam.level)}${'○'.repeat(3 - fam.level)}</span>
          <h4>${fam.title}</h4>
          ${done ? '<span class="done" title="Hai già risolto un esercizio di questo tipo">✓</span>' : ''}
          <button type="button" class="btn ghost small ex-new">Altro esercizio</button>
        </header>
        <div class="ex-text">${fam.text(p, r)}</div>
        ${fam.fig ? `<div class="ex-fig">${fam.fig(p, r, false).svg}</div>` : ''}
        <div class="ex-asks">${asks.map((a, i) => askRow(a, i)).join('')}</div>
        <div class="row">
          <button type="button" class="btn ex-check">Verifica</button>
          ${fam.hint ? '<button type="button" class="btn ghost ex-hint">Suggerimento</button>' : ''}
          <button type="button" class="btn ghost ex-sol">Svolgimento</button>
        </div>
        <div class="feedback" aria-live="polite"></div>
        <div class="ex-solution" hidden></div>`;
      el.querySelector('.ex-new').addEventListener('click', () => fresh());
      el.querySelector('.ex-check').addEventListener('click', verify);
      el.querySelector('.ex-sol').addEventListener('click', () => reveal(true));
      const h = el.querySelector('.ex-hint');
      if (h) h.addEventListener('click', () => App.feedback(el.querySelector('.feedback'), 'warn', 'Suggerimento', fam.hint(p, r)));
      el.querySelectorAll('input.ans').forEach((inp) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') verify(); }));
    }

    function askRow(a, i) {
      const field = a.type === 'choice'
        ? `<select class="input ans" data-i="${i}" id="${fam.id}-a${i}"><option value="">scegli…</option>${a.options.map((o, k) => `<option value="${k}">${o}</option>`).join('')}</select>`
        : `<input class="input ans" data-i="${i}" id="${fam.id}-a${i}" inputmode="decimal" autocomplete="off" spellcheck="false">`;
      return `<div class="ask"><label for="${fam.id}-a${i}">${a.label}</label><div class="ask-in">${field}<span class="unit">${a.type === 'choice' ? '' : a.unit || ''}</span><span class="mark" aria-live="polite"></span></div></div>`;
    }

    function verify() {
      const fb = el.querySelector('.feedback');
      let ok = 0, empty = 0;
      const notes = new Set();
      asks.forEach((a, i) => {
        const inp = el.querySelector(`.ans[data-i="${i}"]`);
        const mark = inp.parentElement.querySelector('.mark');
        let res;
        if (a.type === 'choice') res = inp.value === '' ? { state: 'empty' } : { state: Number(inp.value) === a.answer ? 'ok' : 'bad' };
        else res = checkNum(a, inp.value);
        inp.classList.remove('good', 'invalid');
        mark.textContent = '';
        if (res.state === 'ok') { ok++; inp.classList.add('good'); mark.textContent = '✓'; }
        else if (res.state === 'empty') empty++;
        else {
          inp.classList.add('invalid');
          mark.textContent = '✗';
          if (res.state === 'sign') notes.add('Controlla il segno: una corrente negativa scorre al contrario della freccia, ma va scritta con il meno.');
          if (res.state === 'unit') notes.add('Un valore ha il numero giusto ma è nell\'unità sbagliata: guarda l\'unità accanto alla casella.');
          if (res.state === 'format') notes.add('Scrivi solo il numero, nell\'unità indicata accanto alla casella.');
        }
      });
      if (ok === asks.length) {
        const first = !solved && !revealed;
        solved = true;
        App.feedback(fb, 'ok', 'Tutto giusto!', first ? 'Ecco lo svolgimento per confrontarlo con il tuo.' : 'Giusto. (Niente punti: avevi già visto lo svolgimento.)');
        if (first) {
          App.xp.add(fam.level === 1 ? 10 : fam.level === 2 ? 15 : 20, fam.title);
          App.progress.mark(unitId, fam.id);
        }
        reveal(false);
      } else if (empty === asks.length) {
        App.feedback(fb, 'warn', 'Prova!', 'Scrivi i risultati nelle caselle (va bene la virgola), poi premi Verifica.');
      } else {
        App.feedback(fb, 'bad', ok ? `${ok} su ${asks.length}` : 'Non ancora', (notes.size ? [...notes].join(' ') : 'Le caselle segnate in rosso sono da rivedere.') + ' Puoi correggere e verificare di nuovo.');
      }
    }

    function reveal(byButton) {
      if (byButton && !solved) revealed = true;
      const box = el.querySelector('.ex-solution');
      box.hidden = false;
      box.innerHTML = `<h5>Svolgimento</h5>${fam.fig ? `<div class="ex-fig">${fam.fig(p, r, true).svg}</div>` : ''}<ol class="steps">${fam.steps(p, r)}</ol>${fam.table ? fam.table(p, r) : ''}`;
      if (byButton) {
        asks.forEach((a, i) => {
          const inp = el.querySelector(`.ans[data-i="${i}"]`);
          const mark = inp.parentElement.querySelector('.mark');
          if (!inp.classList.contains('good')) mark.innerHTML = '<span class="sol-val">' + fmtAns(a) + '</span>';
        });
        el.querySelector('.ex-sol').textContent = 'Svolgimento ↓';
      }
    }

    fresh();
    return el;
  }

  // ---------- Esempio svolto ----------
  function exampleCard(fam, title) {
    const el = document.createElement('article');
    el.className = 'card example';
    let p = fam.defaults ? JSON.parse(JSON.stringify(fam.defaults)) : fam.gen();
    function draw() {
      const r = fam.solve(p);
      el.innerHTML = `
        <div class="card-head"><h3>${title || 'Esempio svolto'}</h3>
          <div class="row">
            <button type="button" class="btn ghost small eg-new">Altri numeri</button>
            ${fam.defaults ? '<button type="button" class="btn ghost small eg-doc">Numeri del documento</button>' : ''}
          </div>
        </div>
        <div class="ex-text">${fam.text(p, r)}</div>
        ${fam.fig ? `<div class="ex-fig">${fam.fig(p, r, true).svg}</div>` : ''}
        <ol class="steps">${fam.steps(p, r)}</ol>
        ${fam.table ? fam.table(p, r) : ''}`;
      el.querySelector('.eg-new').addEventListener('click', () => { p = fam.gen(); draw(); });
      const d = el.querySelector('.eg-doc');
      if (d) d.addEventListener('click', () => { p = JSON.parse(JSON.stringify(fam.defaults)); draw(); });
    }
    draw();
    return el;
  }

  // ---------- Generatori di numeri "puliti" ----------
  /** Ripete gen finché accept(params) è vero (al massimo n volte), altrimenti usa fallback. */
  function nice(gen, accept, fallback, n = 4000) {
    for (let k = 0; k < n; k++) {
      const p = gen();
      try { if (accept(p)) return p; } catch (e) { /* riprova */ }
    }
    return JSON.parse(JSON.stringify(fallback));
  }

  // ---------- Formattazione per gli svolgimenti ----------
  const N = (x, s = 4) => App.num(x, s);
  const U = (x, u, s = 4) => App.si(x, u, s);
  const V = (n) => name(n);
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const step = (calc, why) => `<li><span class="calc">${calc}${why ? `<span class="why">${why}</span>` : ''}</span></li>`;
  const res = (x) => `<span class="res">${x}</span>`;
  const ok = ' <span class="check">✓</span>';

  App.Lessons = { exerciseCard, exampleCard, rivp, rivpFromNet, nice, checkNum, fmt: { N, U, V, frac, step, res, ok, name } };
})();
