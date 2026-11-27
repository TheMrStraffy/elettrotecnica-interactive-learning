/* 2ª — Resistori: codice colori, valori normalizzati, seconda legge di Ohm, resistenza e temperatura */
(function () {
  'use strict';
  const App = window.App;
  const BS = window.Basi;
  const L = App.Lessons;
  const { N, U, frac, step, res } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const lessons = [];
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const mc = (bank) => ({
    gen: () => ({ k: rand(0, bank.length - 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const [q, opts, why] = bank[p.k]; return { q, opts: p.o.map((i) => opts[i]), ans: p.o.indexOf(0), why }; },
    text: (p, r) => r.q,
    asks: (p, r) => [h.choice('Risposta', r.opts, r.ans)],
    steps: (p, r) => step(res(r.opts[r.ans]), r.why),
  });
  const R_ = '<var>R</var>';
  const rho = 'ρ';
  const Om = (x) => App.si(x, 'Ω', 4);
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const lab = '<p class="hint">Nel <a href="#resistori" data-route="resistori">laboratorio dei resistori</a> trovi anche il gioco "leggi il resistore" con la serie di risposte giuste.</p>';
  let uid = 0;

  /** Disegno del resistore dai colori (usa il disegno del laboratorio). */
  function resSVG(bands) {
    const n = bands.length;
    const nd = n === 5 ? 3 : 2;
    const st = { bands: n, digits: bands.slice(0, nd).concat(['nero', 'nero']).slice(0, 3), mult: bands[nd], tol: bands[nd + 1] };
    return `<svg class="res-svg" viewBox="0 0 400 110" role="img" style="max-width:420px">${App.Resistors.resistorSVG(st, 'rs' + ++uid)}</svg>`;
  }
  const bandsTxt = (b) => b.join(' – ');
  const randE = (series, dmin = 1, dmax = 4) => Number((pick(series) * Math.pow(10, rand(dmin, dmax) - 1)).toPrecision(3));

  // =====================================================================
  // 1 — Codice colori
  // =====================================================================
  const c1 = [];
  c1.push({
    id: 'col-read', title: 'Leggi il resistore', level: 1,
    defaults: { R: 4700 },
    gen: () => ({ R: randE(BS.E12, 1, 5) }),
    solve: (p) => { const b = BS.toBands(p.R, 4); return { b, d: [BS.COLORS.indexOf(b[0]), BS.COLORS.indexOf(b[1])], e: BS.MULT[b[2]] }; },
    text: () => 'Quanto vale questo resistore a 4 fasce? (la fascia oro, la tolleranza, è a destra)',
    fig: (p, r) => ({ svg: resSVG(r.b) }),
    asks: (p) => [h.qR(R_, p.R)],
    steps: (p, r) => step(`${cap(r.b[0])} = ${r.d[0]}, ${r.b[1]} = ${r.d[1]}, ${r.b[2]} = × ${N(Math.pow(10, r.e))}`, 'Prima cifra, seconda cifra, moltiplicatore. Il moltiplicatore dice quanti zeri aggiungere.') +
      step(`${r.d[0]}${r.d[1]} · ${N(Math.pow(10, r.e))} = ${res(Om(p.R))}, tolleranza ± 5 %`),
  });
  c1.push({
    id: 'col-write', title: 'Quali colori?', level: 1,
    gen: () => ({ R: randE(BS.E12, 1, 5), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => {
      const b = BS.toBands(p.R, 4);
      const e = BS.MULT[b[2]];
      const wrong = [
        [b[1], b[0], b[2], 'oro'],
        [b[0], b[1], Object.keys(BS.MULT).find((k) => BS.MULT[k] === e + 1), 'oro'],
        [b[0], b[1], Object.keys(BS.MULT).find((k) => BS.MULT[k] === e - 1), 'oro'],
        [b[0], BS.COLORS[(BS.COLORS.indexOf(b[1]) + 1) % 10], b[2], 'oro'],
      ].filter((x) => x.every(Boolean) && bandsTxt(x) !== bandsTxt(b));
      const list = [b, ...wrong.slice(0, 3)];
      while (list.length < 4) list.push([b[0], b[1], b[2], 'argento']);
      const opts = p.o.map((i) => bandsTxt(list[i]));
      return { b, opts, ans: p.o.indexOf(0) };
    },
    text: (p) => `Ti serve un resistore da ${Om(p.R)} con tolleranza 5 %. Quali colori cerchi nella scatola?`,
    asks: (p, r) => [h.choice('Fasce', r.opts, r.ans)],
    steps: (p, r) => step(`${Om(p.R)} = ${String(BS.COLORS.indexOf(r.b[0])) + BS.COLORS.indexOf(r.b[1])} · 10<sup>${BS.MULT[r.b[2]]}</sup> Ω`, 'Scrivi il valore in ohm, prendi le prime due cifre e conta gli zeri che restano.') +
      step(res(bandsTxt(r.b)), 'Oro come quarta fascia vuol dire ± 5 %.'),
  });
  c1.push({
    id: 'col-read5', title: 'Cinque fasce', level: 2,
    gen: () => { const d = rand(100, 999); const e = rand(-1, 3); const t = pick(['marrone', 'rosso', 'verde']); return { R: Number((d * Math.pow(10, e)).toPrecision(3)), t }; },
    solve: (p) => { const b = BS.toBands(p.R, 5, p.t); return { b, tol: BS.TOL[p.t] }; },
    text: () => 'Resistore di precisione a 5 fasce (corpo azzurro). Quanto vale e con che tolleranza?',
    fig: (p, r) => ({ svg: resSVG(r.b) }),
    asks: (p, r) => [h.qR(R_, p.R), { label: 'Tolleranza ±', unit: '%', value: r.tol }],
    steps: (p, r) => step(`Tre cifre: ${r.b.slice(0, 3).map((x) => BS.COLORS.indexOf(x)).join('')}; moltiplicatore ${r.b[3]} = × ${N(Math.pow(10, BS.MULT[r.b[3]]))}`, 'Con 5 fasce le cifre sono tre: servono per i valori della serie E96, più fitti.') +
      step(`${R_} = ${res(Om(p.R))}, tolleranza ${r.b[4]} = ${res('± ' + N(r.tol) + ' %')}`),
  });
  c1.push({
    id: 'col-tol', title: 'Tra quali valori?', level: 2,
    gen: () => ({ R: randE(BS.E12, 2, 5), t: pick(['oro', 'argento']) }),
    solve: (p) => { const b = BS.toBands(p.R, 4, p.t); const tol = BS.TOL[p.t]; const [lo, hi] = BS.tolRange(p.R, tol); return { b, tol, lo, hi }; },
    text: () => 'Entro quali valori può stare davvero la resistenza di questo resistore?',
    fig: (p, r) => ({ svg: resSVG(r.b) }),
    asks: (p, r) => [h.qR(R_ + '<sub>min</sub>', r.lo), h.qR(R_ + '<sub>max</sub>', r.hi)],
    steps: (p, r) => step(`Valore nominale ${Om(p.R)}, ${r.b[3]} = ± ${r.tol} %`) +
      step(`${R_}<sub>min</sub> = ${N(p.R)} · (1 − ${N(r.tol / 100)}) = ${res(Om(r.lo))}; ${R_}<sub>max</sub> = ${N(p.R)} · (1 + ${N(r.tol / 100)}) = ${res(Om(r.hi))}`, 'Il costruttore garantisce solo che il valore vero stia in questo intervallo.'),
  });
  c1.push({
    id: 'col-small', title: 'Meno di 10 ohm', level: 3,
    gen: () => ({ R: Number((pick(BS.E12) * pick([0.01, 0.1])).toPrecision(2)) }),
    solve: (p) => { const b = BS.toBands(p.R, 4); return { b, m: Math.pow(10, BS.MULT[b[2]]) }; },
    text: () => 'Un resistore piccolino: quanto vale?',
    fig: (p, r) => ({ svg: resSVG(r.b) }),
    hint: () => 'Il terzo colore qui è oro o argento: come moltiplicatore valgono 0,1 e 0,01.',
    asks: (p) => [{ label: R_, unit: 'Ω', value: p.R }],
    steps: (p, r) => step(`${BS.COLORS.indexOf(r.b[0])}${BS.COLORS.indexOf(r.b[1])} · ${N(r.m)} = ${res(Om(p.R))}`, 'Oro e argento come terza fascia sono moltiplicatori (× 0,1 e × 0,01); come quarta sono la tolleranza. Sugli schemi si scrive R' + String(p.R).replace('0.', '') + ' o ' + BS.schemaCode(p.R) + '.'),
  });
  c1.push({
    id: 'col-mc', title: 'Concetti sul codice colori', level: 1,
    ...mc([
      ['Da che lato si comincia a leggere un resistore a 4 fasce?', ['dal lato opposto alla fascia oro o argento', 'sempre da sinistra', 'dal lato più vicino al centro', 'è indifferente'], 'La tolleranza di solito è oro o argento e un po\' staccata dalle altre.'],
      ['Rosso – rosso – arancio – oro vale…', ['22 kΩ ± 5 %', '223 Ω', '2,2 kΩ ± 5 %', '220 kΩ ± 10 %'], '2, 2 e tre zeri.'],
      ['Nel codice colori, il nero come cifra vale…', ['0', '1', '9', 'non è una cifra'], 'Nero 0, marrone 1, rosso 2, arancio 3, giallo 4, verde 5, blu 6, viola 7, grigio 8, bianco 9.'],
      ['I resistori a 5 fasce si usano…', ['per i valori di precisione, con tre cifre significative', 'solo per le potenze alte', 'solo sotto 10 Ω', 'per indicare la temperatura'], 'Tolleranze dell\'1 % o meno.'],
    ]),
  });

  function widgetColors(host) {
    const c = K.widgetCard('Il codice colori', 'Cambia i colori o scrivi un valore e guarda le fasce');
    let n = 4;
    let bands = ['giallo', 'viola', 'rosso', 'oro'];
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-n="4">4 fasce</button><button type="button" data-n="5">5 fasce</button>';
    const fig = el('div', 'ex-fig');
    const pick4 = el('div', 'band-sel');
    const out = el('div', 'forms');
    const inp = el('div', 'field');
    inp.style.gridTemplateColumns = 'minmax(0,1fr)';
    inp.innerHTML = '<label><span>Oppure scrivi un valore</span> <span class="hint">es. 4k7, 220, 1M, 0,47</span></label><input class="input" autocomplete="off" style="max-width:240px" aria-label="Valore del resistore"><p class="hint" aria-live="polite"></p>';
    const [, field, fb] = inp.children;
    const DIG = BS.COLORS;
    const MUL = Object.keys(BS.MULT);
    const TOLS = Object.keys(BS.TOL);
    const sel = (list, cur, i) => `<select class="input" data-i="${i}" aria-label="Fascia ${i + 1}">${list.map((x) => `<option value="${x}"${x === cur ? ' selected' : ''}>${x}</option>`).join('')}</select>`;
    const draw = () => {
      const nd = n === 5 ? 3 : 2;
      fig.innerHTML = resSVG(bands);
      pick4.innerHTML = bands.map((b, i) => sel(i < nd ? DIG : i === nd ? MUL : TOLS, b, i)).join('');
      const v = BS.fromBands(bands);
      const [lo, hi] = BS.tolRange(v.value, v.tol);
      out.innerHTML = `<div class="form-row"><span class="label">Valore</span><div class="f">${res(Om(v.value))} ± ${N(v.tol)} %</div><span class="meta">Tra ${Om(lo)} e ${Om(hi)}. Sugli schemi: <span class="mono">${BS.schemaCode(v.value)}</span>.</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.n) === n)));
    };
    pick4.addEventListener('change', (e) => { const s = e.target.closest('select'); if (s) { bands[Number(s.dataset.i)] = s.value; fb.textContent = ''; draw(); } });
    seg.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || Number(b.dataset.n) === n) return;
      const v = BS.fromBands(bands).value;
      n = Number(b.dataset.n);
      bands = BS.toBands(v, n) || (n === 5 ? ['giallo', 'viola', 'nero', 'marrone', 'marrone'] : ['giallo', 'viola', 'rosso', 'oro']);
      draw();
    });
    field.addEventListener('input', () => {
      const v = App.parseNum(field.value);
      if (!field.value.trim()) { fb.textContent = ''; return; }
      const b = isFinite(v) && v > 0 ? BS.toBands(v, n) : null;
      if (!b) { fb.textContent = n === 4 ? 'Con 4 fasce servono valori a due cifre (per esempio 4,7 k o 220).' : 'Con 5 fasce servono al massimo tre cifre.'; return; }
      fb.textContent = '';
      bands = b;
      draw();
    });
    c.querySelector('.card-head').after(seg);
    c.append(fig, pick4, out, inp);
    const note = el('div');
    note.innerHTML = lab;
    c.appendChild(note);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'colori', num: 1, short: 'Colori', title: 'Il codice colori',
    intro: 'Sui resistori il valore è scritto con fasce colorate: ogni colore è una cifra. Due o tre cifre, un moltiplicatore e la tolleranza.',
    goals: ['Leggere 4 e 5 fasce', 'Dal valore ai colori', 'Tolleranza', 'Oro e argento come moltiplicatori'],
    widgets: [widgetColors],
    example: c1[0], exampleTitle: 'Esempio: leggi il resistore',
    families: c1,
    theory: `
      <article class="note"><h4>Le cifre</h4>
        <p>Nero 0 · marrone 1 · rosso 2 · arancio 3 · giallo 4 · verde 5 · blu 6 · viola 7 · grigio 8 · bianco 9. Una filastrocca aiuta, ma con un po' di esercizio si impara in fretta.</p></article>
      <article class="note"><h4>4 e 5 fasce</h4>
        <p>4 fasce: cifra, cifra, moltiplicatore (numero di zeri), tolleranza. 5 fasce: tre cifre, moltiplicatore, tolleranza. Come moltiplicatori oro = × 0,1 e argento = × 0,01; come tolleranze oro ± 5 %, argento ± 10 %, marrone ± 1 %.</p></article>`,
  });

  // =====================================================================
  // 2 — Valori normalizzati e tolleranza
  // =====================================================================
  const e2 = [];
  e2.push({
    id: 'e-near', title: 'Il valore commerciale', level: 1,
    defaults: { R: 5000 },
    gen: () => L.nice(() => ({ R: Number((rand(105, 980) * Math.pow(10, rand(0, 3))).toPrecision(3)), o: App.shuffle([0, 1, 2, 3]) }), (p) => { const nE = BS.nearestE(p.R); return Math.abs(Math.log(nE / p.R)) > 0.01; }, { R: 5000, o: [0, 1, 2, 3] }),
    solve: (p) => {
      const nE = BS.nearestE(p.R);
      const i = BS.E12.indexOf(Number((nE / Math.pow(10, Math.floor(Math.log10(nE)) - 1)).toPrecision(2)));
      const d = Math.pow(10, Math.floor(Math.log10(nE)) - 1);
      const nb = [BS.E12[(i + 1) % 12] * (i === 11 ? d * 10 : d), BS.E12[(i + 11) % 12] * (i === 0 ? d / 10 : d), nE * 10];
      const list = [nE, ...nb].map((x) => Number(x.toPrecision(3)));
      return { nE, opts: (p.o || [0, 1, 2, 3]).map((k) => Om(list[k])), ans: (p.o || [0, 1, 2, 3]).indexOf(0), err: ((nE - p.R) / p.R) * 100 };
    },
    text: (p) => `Dai calcoli ti serve un resistore da ${Om(p.R)}. Quale valore della serie E12 (10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82) è il più vicino?`,
    asks: (p, r) => [h.choice('Valore E12', r.opts, r.ans), { label: 'Scarto', unit: '%', value: r.err, signNote: 'Lo scarto è negativo se il valore commerciale è più piccolo di quello calcolato.' }],
    steps: (p, r) => step(`${Om(p.R)} sta tra due valori della serie: il più vicino in proporzione è ${res(Om(r.nE))}`, 'Conta la differenza in percentuale, non in ohm.') +
      step(`Scarto = ${frac(N(r.nE) + ' − ' + N(p.R), N(p.R))} = ${res(N(r.err, 3) + ' %')}`, 'Con i resistori al 10 % uno scarto di qualche percento non conta: è dentro la tolleranza.'),
  });
  e2.push({
    id: 'e-ok', title: 'Dentro la tolleranza?', level: 2,
    gen: () => { const R = randE(BS.E12, 2, 5); const t = pick([5, 10, 1]); const dev = pick([-1.4, -0.8, -0.3, 0.4, 0.9, 1.3]) * t; return { R, t, Rm: Number((R * (1 + dev / 100)).toPrecision(4)) }; },
    solve: (p) => { const sc = ((p.Rm - p.R) / p.R) * 100; return { sc, ok: Math.abs(sc) <= p.t }; },
    text: (p) => `Un resistore marcato ${Om(p.R)} ± ${p.t} % misurato con l'ohmmetro dà ${Om(p.Rm)}. Di quanto si scosta dal nominale? È dentro la tolleranza?`,
    asks: (p, r) => [{ label: 'Scostamento', unit: '%', value: r.sc, signNote: 'Il segno dice se è più grande (+) o più piccolo (−) del nominale.' }, h.choice('Dentro la tolleranza?', ['sì', 'no'], r.ok ? 0 : 1)],
    steps: (p, r) => step(`${frac(N(p.Rm) + ' − ' + N(p.R), N(p.R))} · 100 = ${res(N(r.sc, 3) + ' %')}`) + step(res(r.ok ? 'Sì: |' + N(r.sc, 3) + ' %| ≤ ' + p.t + ' %' : 'No: |' + N(r.sc, 3) + ' %| > ' + p.t + ' %'), r.ok ? 'Il resistore è buono.' : 'Il resistore è fuori tolleranza: forse è stato surriscaldato, oppure lo strumento va controllato.'),
  });
  const CODES = [4700, 470, 47000, 0.47, 1500000, 2200, 220, 10000, 3300, 1000, 680, 8200, 2.2];
  e2.push({
    id: 'e-code', title: 'La sigla sugli schemi', level: 1,
    gen: () => ({ R: pick(CODES), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const list = [p.R, p.R * 10, p.R / 10, p.R * 1000].map((x) => Number(x.toPrecision(3))); return { code: BS.schemaCode(p.R), opts: p.o.map((k) => Om(list[k])), ans: p.o.indexOf(0) }; },
    text: (p, r) => `Sullo schema c'è scritto <span class="mono">${r.code}</span> vicino a un resistore. Quanto vale?`,
    asks: (p, r) => [h.choice('Valore', r.opts, r.ans)],
    steps: (p, r) => step(`<span class="mono">${r.code}</span> = ${res(Om(p.R))}`, 'La lettera (R, k, M) prende il posto della virgola e dice il multiplo: una virgola sbiadita su una fotocopia non può più trasformare 4,7 k in 47 k.'),
  });
  e2.push({
    id: 'e-serie', title: 'Perché proprio quei numeri?', level: 3,
    gen: () => ({ n: pick([12, 24, 6]) }),
    solve: (p) => ({ k: Math.pow(10, 1 / p.n), tol: { 6: 20, 12: 10, 24: 5 }[p.n] }),
    text: (p, r) => `Nella serie E${p.n} ci sono ${p.n} valori per decade (tolleranza ${r.tol} %), ognuno più grande del precedente dello stesso fattore. Quanto vale questo fattore? Di che percentuale cresce ogni valore?`,
    asks: (p, r) => [{ label: 'Fattore', unit: '', value: r.k }, { label: 'Aumento', unit: '%', value: (r.k - 1) * 100 }],
    hint: (p) => `Moltiplicando ${p.n} volte per lo stesso fattore si deve passare da 10 a 100.`,
    steps: (p, r) => step(`<var>k</var><sup>${p.n}</sup> = 10 → <var>k</var> = 10<sup>1/${p.n}</sup> = ${res(N(r.k, 4))}`, 'È una progressione geometrica: i valori sono equidistanti sulla scala logaritmica.') +
      step(`Ogni valore è il ${res(N((r.k - 1) * 100, 3) + ' %')} più grande del precedente`, `Circa il doppio della tolleranza (± ${r.tol} %): gli intervalli di tolleranza di due valori vicini si toccano e coprono tutti i valori possibili.`),
  });
  e2.push({
    id: 'e-mc', title: 'Concetti sui valori normalizzati', level: 1,
    ...mc([
      ['Perché non esistono resistori da 50 Ω nella serie E12?', ['perché i valori sono scelti in modo che le tolleranze coprano tutto: 47 Ω ± 10 % arriva già a 51,7 Ω', 'perché 50 Ω è vietato', 'perché è troppo piccolo', 'perché si brucerebbe'], 'Servirebbe a poco: un 47 Ω al 10 % può già valere 50 Ω.'],
      ['La sigla 1M5 vuol dire…', ['1,5 MΩ', '15 MΩ', '1,5 mΩ', '150 kΩ'], 'La lettera prende il posto della virgola.'],
      ['Con resistori al 10 % si usa la serie…', ['E12', 'E96', 'E192', 'E3'], 'E12 → 10 %, E24 → 5 %, E96 → 1 %.'],
      ['La tolleranza di un resistore indica…', ['di quanto può scostarsi il valore vero da quello scritto', 'la potenza massima', 'la temperatura massima', 'la tensione massima'], 'È garantita dal costruttore a 20–25 °C.'],
    ]),
  });

  function widgetSeries(host) {
    const c = K.widgetCard('Le serie normalizzate', 'Ogni valore con la sua tolleranza: gli intervalli si toccano e coprono tutta la decade');
    let ser = 12;
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-n="12">E12 (± 10 %)</button><button type="button" data-n="24">E24 (± 5 %)</button>';
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const list = ser === 12 ? BS.E12 : BS.E24;
      const tol = ser === 12 ? 0.1 : 0.05;
      const X = (x) => 30 + 440 * (Math.log10(x) - Math.log10(8)) / (Math.log10(125) - Math.log10(8));
      const want = v.R;
      const d = Math.pow(10, Math.floor(Math.log10(want)) - 1);
      const near = BS.nearestE(want, list);
      const nd = near / d;
      let s = `<line class="ground" x1="30" y1="130" x2="470" y2="130"/>`;
      list.concat([100]).forEach((x, i) => {
        const y = 40 + (i % 2) * 26;
        const on = Math.abs(x - nd) < 1e-9 || Math.abs(x - nd / 10) < 1e-9;
        s += `<rect class="tolbar${on ? ' on' : ''}" x="${X(x * (1 - tol)).toFixed(1)}" y="${y}" width="${(X(x * (1 + tol)) - X(x * (1 - tol))).toFixed(1)}" height="18" rx="3"/>`;
        s += `<line class="tick" x1="${X(x).toFixed(1)}" y1="${y + 18}" x2="${X(x).toFixed(1)}" y2="130"/><text class="note" x="${X(x).toFixed(1)}" y="148" text-anchor="middle">${x}</text>`;
      });
      const wd = want / d;
      if (wd >= 8 && wd <= 125) s += `<line class="want" x1="${X(wd)}" y1="20" x2="${X(wd)}" y2="135"/><text class="note d" x="${X(wd)}" y="14" text-anchor="middle">${N(wd, 3)}</text>`;
      fig.innerHTML = `<svg class="phy" viewBox="0 0 500 160" role="img" style="max-width:500px"><title>Valori della serie E${ser} con le loro tolleranze</title>${s}</svg>`;
      out.innerHTML = `<div class="form-row"><span class="label">Serve</span><div class="f">${Om(want)} → in E${ser}: ${res(Om(near))}</div><span class="meta">Scarto ${N(((near - want) / want) * 100, 2)} %. In rosso il valore che ti serve, in evidenza la fascia del valore commerciale più vicino (cifre della decade × ${N(d)}).</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.n) === ser)));
    };
    const sl = K.sliders(c, [{ id: 'R', label: 'Valore che ti serve (Ω)', min: 10, max: 1e6, log: true, value: 5000 }], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { ser = Number(b.dataset.n); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'serie', num: 2, short: 'Serie E', title: 'Valori normalizzati e tolleranza',
    intro: 'I resistori non esistono in tutti i valori: si producono solo quelli delle serie normalizzate, scelti in modo furbo perché le tolleranze coprano tutta la scala.',
    goals: ['Serie E12 ed E24', 'Valore commerciale più vicino', 'Controllo della tolleranza', 'Sigle sugli schemi (4k7, R47)'],
    widgets: [widgetSeries],
    example: e2[0], exampleTitle: 'Esempio: dal calcolo al resistore vero',
    families: e2,
    theory: `
      <article class="note"><h4>Le serie</h4>
        <p><strong>E12</strong> (± 10 %): 10 · 12 · 15 · 18 · 22 · 27 · 33 · 39 · 47 · 56 · 68 · 82, poi si ripete ×10. <strong>E24</strong> (± 5 %) ha 24 valori per decade, E96 (± 1 %) 96. Ogni valore è 10<sup>1/<var>n</var></sup> volte il precedente.</p></article>
      <article class="note"><h4>Sigle</h4>
        <p>La lettera sostituisce la virgola: <span class="mono">R47</span> = 0,47 Ω, <span class="mono">4k7</span> = 4,7 kΩ, <span class="mono">1M5</span> = 1,5 MΩ.</p></article>`,
  });

  // =====================================================================
  // 3 — Seconda legge di Ohm
  // =====================================================================
  const s3 = [];
  const MAT = [
    ['rame', 0.0175, 0.0039], ['alluminio', 0.028, 0.004], ['argento', 0.016, 0.0038], ['ferro', 0.1, 0.005],
    ['tungsteno', 0.055, 0.0045], ['costantana', 0.49, 0.00001], ['nichel-cromo', 1.1, 0.0004],
  ];
  const SEZ = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10];
  s3.push({
    id: 'sec-R', title: 'La resistenza di un filo', level: 1,
    defaults: { m: 0, L: 50, S: 1.5 },
    gen: () => ({ m: rand(0, 4), L: pick([2, 10, 25, 50, 100, 200]), S: pick(SEZ) }),
    solve: (p) => ({ rho: MAT[p.m][1], R: BS.wireR(MAT[p.m][1], p.L, p.S) }),
    text: (p, r) => `Un filo di ${MAT[p.m][0]} (${rho} = ${N(r.rho)} Ω·mm²/m) è lungo ${p.L} m e ha sezione ${N(p.S)} mm². Quanto vale la sua resistenza a 20 °C?`,
    asks: (p, r) => [h.qR(R_, r.R)],
    steps: (p, r) => step(`${R_} = ${rho} · ${frac('<var>L</var>', '<var>S</var>')} = ${N(r.rho)} · ${frac(p.L + ' m', N(p.S) + ' mm²')} = ${res(Om(r.R))}`, 'Con ρ in Ω·mm²/m la lunghezza va in metri e la sezione in mm²: niente conversioni.'),
  });
  s3.push({
    id: 'sec-L', title: 'Quanto filo serve?', level: 2,
    gen: () => ({ R: pick([10, 22, 47, 100]), S: pick([0.05, 0.1, 0.2, 0.25]) }),
    solve: (p) => ({ L: BS.wireL(p.R, 1.1, p.S) }),
    text: (p) => `Vuoi costruire una resistenza da ${Om(p.R)} per una stufetta, con filo di nichel-cromo (${rho} = 1,1 Ω·mm²/m) di sezione ${N(p.S)} mm². Quanto deve essere lungo?`,
    asks: (p, r) => [{ label: '<var>L</var>', unit: 'm', value: r.L }],
    steps: (p, r) => step(`<var>L</var> = ${frac(R_ + ' · <var>S</var>', rho)} = ${frac(N(p.R) + ' · ' + N(p.S), '1,1')} = ${res(U(r.L, 'm'))}`, 'Problema rovesciato: la formula inversa ricava la lunghezza. Il nichel-cromo ha una resistività alta e resiste all\'ossidazione a caldo: per questo si usa nelle resistenze dei forni.'),
  });
  s3.push({
    id: 'sec-d', title: 'Dal diametro alla resistenza', level: 2,
    gen: () => ({ m: pick([0, 0, 1]), d: pick([0.2, 0.5, 0.8, 1, 1.38, 2]), L: pick([5, 10, 20, 50]) }),
    solve: (p) => { const S = BS.section(p.d); return { S, R: BS.wireR(MAT[p.m][1], p.L, S) }; },
    text: (p) => `Un filo di ${MAT[p.m][0]} (${rho} = ${N(MAT[p.m][1])} Ω·mm²/m) ha diametro ${N(p.d)} mm ed è lungo ${p.L} m. Quanto vale la sezione? E la resistenza?`,
    asks: (p, r) => [{ label: '<var>S</var>', unit: 'mm²', value: r.S }, h.qR(R_, r.R)],
    hint: () => 'La sezione è un cerchio: S = π d² / 4.',
    steps: (p, r) => step(`<var>S</var> = ${frac('π <var>d</var>²', '4')} = ${frac('π · ' + N(p.d) + '²', '4')} = ${res(N(r.S, 4) + ' mm²')}`, 'Il calibro misura il diametro, non la sezione.') +
      step(`${R_} = ${N(MAT[p.m][1])} · ${frac(p.L, N(r.S, 4))} = ${res(Om(r.R))}`),
  });
  s3.push({
    id: 'sec-cavo', title: 'La prolunga', level: 3,
    gen: () => ({ L: pick([10, 25, 50]), S: pick([0.75, 1, 1.5, 2.5]), I: pick([5, 8, 10, 16]) }),
    solve: (p) => { const R = BS.wireR(0.0175, 2 * p.L, p.S); return { R, dV: R * p.I, Pp: R * p.I * p.I }; },
    text: (p) => `Una prolunga di rame lunga ${p.L} m ha due conduttori da ${N(p.S)} mm² (${rho} = 0,0175 Ω·mm²/m). Alimenta una stufa che assorbe ${p.I} A. Qual è la resistenza dei fili? Quanta tensione si perde lungo la prolunga e quanta potenza la scalda?`,
    asks: (p, r) => [{ label: R_, unit: 'Ω', value: r.R }, h.qV('Δ<var>V</var>', r.dV), { label: '<var>P</var> persa', unit: 'W', value: r.Pp }],
    hint: () => 'La corrente va e torna: i metri di filo attraversati sono il doppio della lunghezza della prolunga.',
    steps: (p, r) => step(`${R_} = 0,0175 · ${frac('2 · ' + p.L, N(p.S))} = ${res(Om(r.R))}`, 'Il trabocchetto: andata e ritorno, quindi 2L.') +
      step(`Δ<var>V</var> = ${R_} · <var>I</var> = ${N(r.R, 4)} · ${p.I} = ${res(U(r.dV, 'V'))}; <var>P</var> = ${R_}<var>I</var>² = ${res(U(r.Pp, 'W'))}`, 'Per questo una prolunga avvolta sul rocchetto con una stufa accesa scalda pericolosamente: va sempre srotolata, e con le correnti forti serve una sezione più grande.'),
  });
  s3.push({
    id: 'sec-mc', title: 'Concetti sulla resistività', level: 1,
    ...mc([
      ['Se raddoppi la lunghezza di un filo, la resistenza…', ['raddoppia', 'si dimezza', 'quadruplica', 'resta uguale'], 'R è proporzionale a L.'],
      ['Se raddoppi il diametro di un filo, la resistenza…', ['diventa un quarto', 'si dimezza', 'raddoppia', 'resta uguale'], 'La sezione dipende dal quadrato del diametro: quattro volte la sezione, un quarto della resistenza.'],
      ['Il miglior conduttore tra questi è…', ['l\'argento', 'il ferro', 'il nichel-cromo', 'la costantana'], 'Resistività più bassa. Si usa il rame perché costa molto meno.'],
      ['La conduttanza è…', ['l\'inverso della resistenza, in siemens', 'la resistenza al quadrato', 'la resistività per la lunghezza', 'un\'altra parola per tensione'], 'G = 1/R.'],
    ]),
  });

  function widgetWire(host) {
    const c = K.widgetCard('La resistenza di un filo', 'Cambia materiale, lunghezza e sezione');
    let m = 0;
    let Si = 3;
    const ctl = el('div', 'msi-ctl');
    ctl.innerHTML = `<label class="msi-grp"><span class="msi-cap">Materiale</span><select class="input" aria-label="Materiale">${MAT.map((x, i) => `<option value="${i}">${x[0]} (ρ = ${N(x[1])})</option>`).join('')}</select></label>
      <label class="msi-grp"><span class="msi-cap">Sezione</span><select class="input" aria-label="Sezione">${SEZ.map((x, i) => `<option value="${i}"${i === 3 ? ' selected' : ''}>${N(x)} mm²</option>`).join('')}</select></label>`;
    const [sm, ss] = ctl.querySelectorAll('select');
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const [name, r0] = MAT[m];
      const S0 = SEZ[Si];
      const R = BS.wireR(r0, v.L, S0);
      const d = Math.sqrt((4 * S0) / Math.PI);
      const th = App.clamp(3 + d * 5, 3, 22);
      const len = App.clamp(60 + 80 * Math.log10(v.L * 2), 40, 400);
      fig.innerHTML = `<svg class="phy" viewBox="0 0 500 60" role="img" style="max-width:500px"><title>Filo di ${name}: ${N(v.L)} m, ${N(S0)} mm²</title><line x1="30" y1="30" x2="${30 + len}" y2="30" stroke="${['#c07a3a', '#a9b1b9', '#cfd4d8', '#6d7176', '#8b9099', '#a67c52', '#7b746a'][m]}" stroke-width="${th}" stroke-linecap="round"/><text class="note" x="${Math.min(40 + len, 440)}" y="34">⌀ ${N(d, 2)} mm</text></svg>`;
      out.innerHTML = `<div class="form-row"><span class="label">Resistenza</span><div class="f">${R_} = ${N(r0)} · ${frac(N(v.L, 3) + ' m', N(S0) + ' mm²')} = ${res(Om(R))}</div><span class="meta">Conduttanza ${App.si(1 / R, 'S', 3)}. Prova a raddoppiare la lunghezza, poi la sezione.</span></div>`;
    };
    const sl = K.sliders(c, [{ id: 'L', label: 'Lunghezza <var>L</var> (m)', min: 0.5, max: 1000, log: true, value: 50 }], draw);
    sm.addEventListener('change', () => { m = Number(sm.value); draw(last); });
    ss.addEventListener('change', () => { Si = Number(ss.value); draw(last); });
    c.querySelector('.card-head').after(ctl);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'resistivita', num: 3, short: 'Resistività', title: 'La seconda legge di Ohm',
    intro: 'La resistenza di un filo dipende da tre cose: il materiale, quanto è lungo e quanto è grosso. Lo sa bene chi sceglie la sezione dei cavi di un impianto.',
    goals: ['R = ρ L / S', 'Resistività dei materiali', 'Sezione dal diametro', 'Cadute di tensione nei cavi'],
    widgets: [widgetWire],
    example: s3[0], exampleTitle: 'Esempio: la resistenza di un filo',
    families: s3,
    theory: `
      <article class="note"><h4>Seconda legge di Ohm</h4>
        <div class="eq"><span>${R_} = ${rho} · ${frac('<var>L</var>', '<var>S</var>')}</span><span class="u">${rho} in Ω·mm²/m, <var>L</var> in m, <var>S</var> in mm²</span></div>
        <p>Rame 0,0175 · alluminio 0,028 · ferro 0,1 · costantana 0,49 · nichel-cromo 1,1 Ω·mm²/m. In unità SI: 1 Ω·mm²/m = 10<sup>−6</sup> Ω·m.</p></article>
      <article class="note"><h4>Nei cavi</h4><p>La corrente va e torna: per una linea lunga <var>L</var> i metri di conduttore sono 2<var>L</var>. La caduta di tensione e il calore nei fili crescono con la corrente: per questo le sezioni degli impianti sono scelte con cura (1,5 mm² per le luci, 2,5 mm² per le prese).</p></article>`,
  });

  // =====================================================================
  // 4 — Resistenza e temperatura
  // =====================================================================
  const t4 = [];
  t4.push({
    id: 'tmp-R', title: 'Quando il filo si scalda', level: 1,
    defaults: { m: 0, R20: 10, t: 80 },
    gen: () => ({ m: pick([0, 1, 3]), R20: pick([2, 5, 10, 50, 100]), t: pick([-10, 0, 40, 60, 80, 100, 150]) }),
    solve: (p) => ({ a: MAT[p.m][2], Rt: BS.atTemp(p.R20, MAT[p.m][2], p.t) }),
    text: (p, r) => `Un avvolgimento di ${MAT[p.m][0]} (α = ${N(r.a)} °C⁻¹) a 20 °C ha resistenza ${Om(p.R20)}. Quanto vale a ${p.t} °C?`,
    asks: (p, r) => [{ label: R_ + '<sub><var>t</var></sub>', unit: 'Ω', value: r.Rt }],
    steps: (p, r) => step(`${R_}<sub><var>t</var></sub> = ${R_}<sub>20</sub> · (1 + α · (<var>t</var> − 20)) = ${N(p.R20)} · (1 + ${N(r.a)} · ${p.t - 20}) = ${res(Om(r.Rt))}`, p.t > 20 ? 'Nei metalli la resistenza cresce con la temperatura.' : 'Sotto i 20 °C la resistenza è un po\' più bassa.'),
  });
  t4.push({
    id: 'tmp-t', title: 'Il termometro di rame', level: 2,
    gen: () => { const R20 = pick([2, 4.5, 8, 12]); const t = pick([45, 60, 75, 90, 105]); return { R20, Rt: Number(BS.atTemp(R20, 0.0039, t).toPrecision(3)) }; },
    solve: (p) => ({ t: BS.tempFrom(p.Rt, p.R20, 0.0039) }),
    text: (p) => `L'avvolgimento di rame di un motore misura ${Om(p.R20)} a 20 °C. Dopo un'ora di lavoro misura ${Om(p.Rt)}. A che temperatura media è arrivato? (α = 0,0039 °C⁻¹)`,
    asks: (p, r) => [{ label: '<var>t</var>', unit: '°C', value: r.t }],
    hint: () => 'Dalla formula R_t = R_20 (1 + α (t − 20)) ricava t.',
    steps: (p, r) => step(`<var>t</var> = 20 + ${frac(R_ + '<sub>t</sub>/' + R_ + '<sub>20</sub> − 1', 'α')} = 20 + ${frac(N(p.Rt / p.R20, 4) + ' − 1', '0,0039')} = ${res(N(r.t, 3) + ' °C')}`, 'È il "metodo della variazione di resistenza": si usa davvero per misurare la temperatura degli avvolgimenti, dove un termometro non arriva.'),
  });
  t4.push({
    id: 'tmp-fil', title: 'Quanto è caldo il filamento?', level: 3,
    gen: () => ({ Vn: pick([12, 24, 230]), Pn: pick([5, 21, 40, 60, 100]), k: pick([10, 11, 12, 13]) }),
    solve: (p) => { const Rh = (p.Vn * p.Vn) / p.Pn; const Rc = Number((Rh / p.k).toPrecision(2)); return { Rh, Rc, t: BS.tempFrom(Rh, Rc, 0.0045) }; },
    text: (p, r) => `Una lampadina ${p.Vn} V – ${p.Pn} W a freddo (20 °C) misura ${Om(r.Rc)}. Con il coefficiente del tungsteno α = 0,0045 °C⁻¹, a che temperatura arriva il filamento quando è accesa?`,
    asks: (p, r) => [h.qR(R_ + '<sub>caldo</sub>', r.Rh), { label: '<var>t</var>', unit: '°C', value: r.t }],
    hint: () => 'La resistenza a caldo si ricava da potenza e tensione nominali: R = V² / P.',
    steps: (p, r) => step(`${R_}<sub>caldo</sub> = ${frac('<var>V</var>²', '<var>P</var>')} = ${frac(p.Vn + '²', p.Pn)} = ${res(Om(r.Rh))}`) +
      step(`<var>t</var> = 20 + ${frac(N(r.Rh / r.Rc, 3) + ' − 1', '0,0045')} = ${res(N(r.t, 3) + ' °C')}`, 'Circa la temperatura vera di un filamento (2300–2800 °C). La formula lineare a temperature così alte è solo un\'approssimazione, ma rende l\'idea.'),
  });
  t4.push({
    id: 'tmp-mc', title: 'Materiali e temperatura', level: 1,
    ...mc([
      ['Per un resistore di precisione si usa la costantana perché…', ['la sua resistività quasi non cambia con la temperatura', 'conduce meglio del rame', 'costa poco', 'si scalda di più'], 'α ≈ 0,00001 °C⁻¹: quasi zero.'],
      ['Un termistore NTC…', ['diminuisce la sua resistenza quando si scalda', 'aumenta la resistenza quando si scalda', 'non dipende dalla temperatura', 'funziona solo sotto zero'], 'Negative Temperature Coefficient: coefficiente negativo. Si usa come sensore.'],
      ['Nei metalli, scaldandosi, la resistenza…', ['aumenta', 'diminuisce', 'resta uguale', 'si annulla'], 'Gli atomi vibrano di più e ostacolano gli elettroni.'],
      ['Un PTC messo in serie a un circuito può fare da protezione perché…', ['se la corrente lo scalda la sua resistenza sale molto e limita la corrente', 'si scioglie come un fusibile', 'diventa un cortocircuito', 'cambia il verso della corrente'], 'È un fusibile "ripristinabile": raffreddandosi torna a condurre.'],
    ]),
  });

  function widgetTemp(host) {
    const c = K.widgetCard('Resistenza e temperatura', 'Quattro componenti da 100 Ω a 20 °C (l\'NTC da 100 Ω a 25 °C)');
    const fig = el('div');
    const out = el('div', 'forms');
    const curves = [
      ['rame', (t) => BS.atTemp(100, 0.0039, t), 'p1'],
      ['tungsteno', (t) => BS.atTemp(100, 0.0045, t), 'p2'],
      ['costantana', (t) => BS.atTemp(100, 0.00001, t), 'p3'],
      ['NTC', (t) => BS.ntc(100, 3950, t), 'p4'],
    ];
    const draw = (v) => {
      const ch = K.chart({ W: 460, H: 240, xmin: 0, xmax: 200, ymin: 0, ymax: 400, xu: '°C', yu: 'Ω', xlabel: 't', ylabel: 'R', ticks: 4 });
      let s = ch.s;
      curves.forEach(([, f, cls]) => {
        let d = '';
        for (let i = 0; i <= 100; i++) { const t = 2 * i; d += (i ? 'L' : 'M') + ch.X(t).toFixed(1) + ' ' + ch.Y(Math.min(400, f(t))).toFixed(1); }
        s += `<path class="${cls}" d="${d}"/>`;
      });
      s += `<line class="guide" x1="${ch.X(v.t)}" y1="${ch.Y(400)}" x2="${ch.X(v.t)}" y2="${ch.Y(0)}"/>`;
      curves.forEach(([, f, cls]) => { const y = f(v.t); if (y <= 400) s += `<circle class="op ${cls}" cx="${ch.X(v.t)}" cy="${ch.Y(y)}" r="5"/>`; });
      fig.innerHTML = `<svg class="chart" viewBox="0 0 460 240" role="img" style="width:100%;height:auto"><title>Resistenza in funzione della temperatura</title>${s}</svg>`;
      out.innerHTML = `<div class="table-wrap"><table class="tt"><thead><tr><th>a ${N(v.t)} °C</th>${curves.map((x) => `<th>${x[0]}</th>`).join('')}</tr></thead><tbody><tr><td>${R_}</td>${curves.map((x) => `<td>${App.si(x[1](v.t), 'Ω', 3)}</td>`).join('')}</tr></tbody></table></div>
        <p class="hint">Rame (blu) e tungsteno (arancio) salgono, la costantana (verde) resta piatta, l'NTC (viola) scende in fretta: per questo si usa come sensore di temperatura.</p>`;
    };
    const sl = K.sliders(c, [{ id: 't', label: 'Temperatura (°C)', min: 0, max: 200, step: 1, value: 60 }], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'temperatura', num: 4, short: 'Temperatura', title: 'Resistenza e temperatura',
    intro: 'La resistività cambia con la temperatura: nei metalli cresce, in alcune leghe quasi non cambia, nei semiconduttori diminuisce. Un problema per chi progetta, un\'occasione per chi deve misurare la temperatura.',
    goals: ['R_t = R_20 (1 + α Δt)', 'Temperatura dalla resistenza', 'Costantana e leghe stabili', 'Termistori NTC e PTC'],
    widgets: [widgetTemp],
    example: t4[0], exampleTitle: 'Esempio: un avvolgimento che si scalda',
    families: t4,
    theory: `
      <article class="note"><h4>Coefficiente di temperatura</h4>
        <div class="eq"><span>${R_}<sub><var>t</var></sub> = ${R_}<sub>20</sub> · (1 + α · (<var>t</var> − 20))</span></div>
        <p>Rame 0,0039 · alluminio 0,004 · tungsteno 0,0045 · costantana ≈ 0,00001 °C⁻¹. Una lampadina a filamento accesa ha una resistenza oltre 10 volte quella a freddo.</p></article>
      <article class="note"><h4>Termistori</h4><p>NTC: la resistenza scende scaldandosi (sensori, limitatori della corrente di accensione). PTC: sale di colpo oltre una certa temperatura (protezioni ripristinabili).</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'res', year: '2', yearLabel: '2ª', title: 'Resistori e resistività', route: 'res-colori', lessonWord: 'Lezione',
    desc: 'Codice colori a 4 e 5 fasce, serie E12 ed E24 e tolleranza, seconda legge di Ohm, cavi e prolunghe, resistenza e temperatura, NTC.',
    lessons,
  });
})();
