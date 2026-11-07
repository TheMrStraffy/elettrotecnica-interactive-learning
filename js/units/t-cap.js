/* 3ª — Condensatori e transitori RC */
(function () {
  'use strict';
  const App = window.App;
  const P = window.Phys;
  const L = App.Lessons;
  const S = App.Schem.T;
  const { N, U, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const B = App.B;
  const clean = window.DC.clean;
  const lessons = [];
  const C_ = (k) => `<var>C</var>${k ? '<sub>' + k + '</sub>' : ''}`;
  const mc = (bank) => ({
    gen: () => ({ k: rand(0, bank.length - 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const [q, opts, why] = bank[p.k]; return { q, opts: p.o.map((i) => opts[i]), ans: p.o.indexOf(0), why }; },
    text: (p, r) => r.q,
    asks: (p, r) => [h.choice('Risposta', r.opts, r.ans)],
    steps: (p, r) => step(res(r.opts[r.ans]), r.why),
  });
  B.mc = mc;
  const qC = (label, C) => (C >= 1e-6 ? { label, unit: 'µF', value: C * 1e6 } : C >= 1e-9 ? { label, unit: 'nF', value: C * 1e9 } : { label, unit: 'pF', value: C * 1e12 });
  const qT = (label, t) => (t >= 1 ? { label, unit: 's', value: t } : { label, unit: 'ms', value: t * 1000 });
  const UF = [1, 2.2, 4.7, 10, 22, 47, 100];
  const vcl = (x) => `v<tspan class="sb" dy="3">C</tspan><tspan dy="-3"> = ${x}</tspan>`;
  const KOHM = [1, 2.2, 4.7, 10, 22, 47, 100];

  // =====================================================================
  // 1 — Capacità e condensatore piano
  // =====================================================================
  const c1 = [];
  c1.push({
    id: 'cap-qv', title: 'Carica, tensione, capacità', level: 1,
    defaults: { C: 10e-6, V: 12, m: 0 },
    gen: () => ({ C: pick(UF) * 1e-6, V: pick([5, 9, 12, 16, 25, 50]), m: rand(0, 1) }),
    solve: (p) => ({ Q: p.C * p.V }),
    text: (p, r) => (p.m === 0
      ? `Un condensatore da ${U(p.C, 'F')} è caricato a ${p.V} V. Quanta carica c'è su ciascuna armatura?`
      : `Un condensatore caricato a ${p.V} V porta una carica di ${U(r.Q, 'C')} su ogni armatura. Quanto vale la sua capacità?`),
    asks: (p, r) => [p.m === 0 ? { label: '<var>Q</var>', unit: 'µC', value: r.Q * 1e6 } : qC(C_(), p.C)],
    hint: () => 'C = Q/V: la capacità dice quanta carica serve per ogni volt.',
    steps: (p, r) => (p.m === 0
      ? step(`<var>Q</var> = <var>C</var>·<var>V</var> = ${U(p.C, 'F')} · ${p.V} V = ${res(U(r.Q, 'C'))}`, 'Su un\'armatura +Q, sull\'altra −Q: in totale il condensatore resta neutro.')
      : step(`<var>C</var> = ${frac('<var>Q</var>', '<var>V</var>')} = ${frac(U(r.Q, 'C'), p.V + ' V')} = ${res(U(p.C, 'F'))}`)),
  });
  const DIEL = [['aria', 1], ['polipropilene', 2.2], ['carta', 3.5], ['vetro', 6]];
  c1.push({
    id: 'cap-piano', title: 'Condensatore piano', level: 2,
    gen: () => ({ S: pick([1, 4, 10, 25, 50, 100]), d: pick([0.1, 0.2, 0.5, 1, 2]), m: rand(0, DIEL.length - 1) }),
    solve: (p) => ({ C: P.capPlane(p.S * 1e-4, p.d * 1e-3, DIEL[p.m][1]) }),
    text: (p) => `Due armature da ${p.S} cm² distano ${N(p.d)} mm, separate da ${DIEL[p.m][0]} (ε<sub>r</sub> = ${N(DIEL[p.m][1])}). Quanto vale la capacità?`,
    asks: (p, r) => [qC(C_(), r.C)],
    hint: () => 'C = ε₀·εᵣ·S/d, con S in m² e d in m. ε₀ = 8,854·10⁻¹² F/m.',
    steps: (p, r) => step(`<var>S</var> = ${p.S} cm² = ${B.sciOf(p.S * 1e-4)} m²; <var>d</var> = ${B.sciOf(p.d * 1e-3)} m`, '1 cm² = 10⁻⁴ m².') +
      step(`<var>C</var> = ε<sub>0</sub>ε<sub>r</sub>${frac('<var>S</var>', '<var>d</var>')} = 8,854·10<sup>−12</sup> · ${N(DIEL[p.m][1])} · ${frac(B.sciOf(p.S * 1e-4), B.sciOf(p.d * 1e-3))} = ${res(U(r.C, 'F'))}`, 'Con le dimensioni di tutti i giorni si ottengono picofarad: per i microfarad servono armature enormi arrotolate e dielettrici sottilissimi.'),
  });
  c1.push({
    id: 'cap-en', title: 'Energia immagazzinata', level: 1,
    gen: () => ({ C: pick([10, 47, 100, 220, 470, 1000, 2200]) * 1e-6, V: pick([5, 9, 12, 25, 50, 100]) }),
    solve: (p) => ({ W: 0.5 * p.C * p.V * p.V }),
    text: (p) => `Un condensatore da ${U(p.C, 'F')} è carico a ${p.V} V. Quanta energia contiene?`,
    asks: (p, r) => [{ label: '<var>W</var>', unit: 'mJ', value: r.W * 1000 }],
    steps: (p, r) => step(`<var>W</var> = ½ <var>C</var> <var>V</var>² = 0,5 · ${U(p.C, 'F')} · ${p.V}² = ${res(U(r.W, 'J'))}`, 'L\'energia sta nel campo elettrico tra le armature. Il flash di una macchina fotografica la accumula così e la libera in un istante.'),
  });
  c1.push({
    id: 'cap-cod', title: 'Leggi il codice', level: 1,
    gen: () => ({ c: pick(['101', '221', '471', '102', '222', '472', '103', '223', '473', '104', '224', '474', '105']) }),
    solve: (p) => ({ pF: Number(p.c.slice(0, 2)) * Math.pow(10, Number(p.c[2])) }),
    text: (p) => `Su un condensatore ceramico c'è stampato <strong>${p.c}</strong>. Quanto vale la capacità in nanofarad?`,
    asks: (p, r) => [{ label: '<var>C</var>', unit: 'nF', value: r.pF / 1000, tol: 0.005 }],
    hint: () => 'Le prime due cifre sono il valore, la terza è il numero di zeri; il risultato è in picofarad.',
    steps: (p, r) => step(`${p.c.slice(0, 2)} seguito da ${p.c[2]} zeri = ${N(r.pF, 6)} pF`, 'Come il codice colori dei resistori, ma in cifre e in picofarad.') + step(`${N(r.pF, 6)} pF = ${res(N(r.pF / 1000, 6) + ' nF')}${r.pF >= 1e6 ? ' = ' + N(r.pF / 1e6) + ' µF' : ''}`, 'Il classico "104" è 100 nF, il condensatore di disaccoppiamento che trovi vicino a ogni integrato.'),
  });
  c1.push({
    id: 'cap-mc', title: 'Concetti sul condensatore', level: 1,
    ...mc([
      ['In corrente continua, a regime, un condensatore si comporta come…', ['un circuito aperto', 'un cortocircuito', 'un resistore da 1 Ω', 'un generatore'], 'Quando è carico non passa più corrente: le armature sono separate da un isolante.'],
      ['Avvicinando le armature di un condensatore piano, la capacità…', ['aumenta', 'diminuisce', 'resta uguale', 'si annulla'], 'C = ε₀εᵣS/d: d sta al denominatore.'],
      ['Mettendo un dielettrico tra le armature al posto dell\'aria, la capacità…', ['aumenta di εᵣ volte', 'diminuisce di εᵣ volte', 'resta uguale', 'diventa zero'], 'Il dielettrico si polarizza e permette di accumulare più carica a parità di tensione.'],
      ['Un condensatore elettrolitico…', ['ha una polarità da rispettare', 'si può montare in qualsiasi verso', 'ha capacità di pochi picofarad', 'non ha un dielettrico'], 'Montato al contrario si danneggia e può gonfiarsi o esplodere: il terminale − è segnato da una banda.'],
      ['1 farad equivale a…', ['1 coulomb al volt', '1 volt al coulomb', '1 ampere al secondo', '1 joule al volt'], 'C = Q/V: 1 F = 1 C/V. È una capacità enorme: in pratica si usano µF, nF e pF.'],
    ]),
  });

  function widgetPlate(host) {
    const c = K.widgetCard('Il condensatore piano', 'Cambia area, distanza, dielettrico e tensione');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = DIEL.map(([n], i) => `<button type="button" data-i="${i}">${n}</button>`).join('');
    const fig = document.createElement('div');
    const out = document.createElement('div');
    out.className = 'forms';
    let mi = 0;
    let last;
    const draw = (v) => {
      last = v;
      const er = DIEL[mi][1];
      const C = P.capPlane(v.S * 1e-4, v.d * 1e-3, er);
      const Q = C * v.V;
      const E = v.V / (v.d * 1e-3);
      const W = 520, H = 200;
      const len = 60 + Math.sqrt(v.S) * 14;
      const gap = 16 + v.d * 14;
      const x0 = (W - len) / 2;
      const yTop = H / 2 - gap / 2, yBot = H / 2 + gap / 2;
      const nq = Math.round(App.clamp(2 + Math.log10(Q / 1e-12 + 1) * 2, 2, 16));
      let s = `<rect x="${x0}" y="${yTop}" width="${len}" height="${gap}" fill="${['transparent', 'var(--g5)', 'var(--g6)', 'var(--g3)'][mi]}" opacity=".18"/>`;
      s += `<rect x="${x0}" y="${yTop - 6}" width="${len}" height="6" fill="var(--bad)"/><rect x="${x0}" y="${yBot}" width="${len}" height="6" fill="var(--pen)"/>`;
      for (let k = 0; k < nq; k++) {
        const x = x0 + ((k + 0.5) * len) / nq;
        s += `<text x="${x}" y="${yTop - 10}" text-anchor="middle" class="qsign pos">+</text><text x="${x}" y="${yBot + 20}" text-anchor="middle" class="qsign neg">−</text>`;
        if (k % 2 === 0 && v.V > 0) s += `<line class="farr" x1="${x}" y1="${yTop + 3}" x2="${x}" y2="${yBot - 6}"/><polygon class="fhead" points="${x - 3},${yBot - 8} ${x},${yBot - 2} ${x + 3},${yBot - 8}"/>`;
      }
      s += `<path class="wire" d="M${x0 + len / 2} ${yTop - 6} V18 M${x0 + len / 2} ${yBot + 6} V${H - 12}"/>`;
      s += `<text x="${x0 + len + 10}" y="${H / 2 + 4}" class="small">d = ${N(v.d)} mm</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Condensatore piano visto di lato</title>${s}</svg>`;
      const spark = mi === 0 && E > 3e6;
      out.innerHTML = `<div class="form-row"><span class="label">Capacità</span><div class="f"><var>C</var> = ε<sub>0</sub>ε<sub>r</sub><var>S</var>/<var>d</var> = ${res(U(C, 'F'))}</div></div>
        <div class="form-row"><span class="label">Carica e campo</span><div class="f"><var>Q</var> = <var>C</var><var>V</var> = ${U(Q, 'C')}; <var>E</var> = <var>V</var>/<var>d</var> = ${U(E, 'V/m')}</div></div>
        <div class="form-row"><span class="label">Energia</span><div class="f"><var>W</var> = ½<var>C</var><var>V</var>² = ${U(0.5 * C * v.V * v.V, 'J')}</div>${spark ? '<span class="meta" style="color:var(--bad)">Il campo supera i 3 kV/mm: in aria scoccherebbe una scintilla.</span>' : '<span class="meta">Più area, meno distanza o un dielettrico migliore: più capacità.</span>'}</div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === mi)));
    };
    const sl = K.sliders(c, [
      { id: 'S', label: 'Area <var>S</var> (cm²)', min: 1, max: 400, log: true, value: 100 },
      { id: 'd', label: 'Distanza <var>d</var> (mm)', min: 0.1, max: 5, step: 0.1, value: 1, sig: 2 },
      { id: 'V', label: 'Tensione <var>V</var> (V)', min: 0, max: 100, step: 1, value: 12, sig: 3 },
    ], draw);
    seg.addEventListener('click', (e) => { if (e.target.dataset.i) { mi = Number(e.target.dataset.i); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'capacita', num: 1, short: 'Capacità', title: 'Il condensatore e la capacità',
    intro: 'Un condensatore sono due armature conduttrici separate da un isolante. Collegato a un generatore accumula carica: +Q su un\'armatura, −Q sull\'altra. Il rapporto tra carica e tensione è la capacità.',
    goals: ['C = Q/V', 'Condensatore piano', 'Energia', 'Codici e tipi'],
    widgets: [widgetPlate],
    example: c1[0], exampleTitle: 'Esempio: carica di un condensatore',
    families: c1,
    theory: `
      <article class="note"><h4>Capacità</h4>
        <div class="eq"><span><var>C</var> = ${frac('<var>Q</var>', '<var>V</var>')}</span><span class="u">farad [F] = C/V</span></div>
        <p>Il farad è enorme: in elettronica si usano µF (10⁻⁶), nF (10⁻⁹) e pF (10⁻¹²).</p></article>
      <article class="note"><h4>Condensatore piano</h4>
        <div class="eq"><span><var>C</var> = ε<sub>0</sub> ε<sub>r</sub> ${frac('<var>S</var>', '<var>d</var>')}</span><span class="u">ε₀ = 8,854 · 10⁻¹² F/m</span></div>
        <p>La capacità cresce con l'area <var>S</var> delle armature e con la costante dielettrica ε<sub>r</sub> dell'isolante, diminuisce con la distanza <var>d</var>. Tra le armature il campo è uniforme: <var>E</var> = <var>V</var>/<var>d</var> (ripassa il biennio, <a href="#elt-campo" data-route="elt-campo">campo elettrico</a>).</p></article>
      <article class="note"><h4>Energia</h4>
        <div class="eq"><span><var>W</var> = ½ <var>C</var> <var>V</var>² = ½ <var>Q</var> <var>V</var></span></div></article>
      <article class="note"><h4>Tipi e sigle</h4>
        <ul><li><strong>Ceramici</strong>: piccoli valori (pF–µF), senza polarità. Codice a tre cifre in pF: 104 = 10 · 10⁴ pF = 100 nF.</li>
          <li><strong>Elettrolitici</strong>: grandi valori (µF–mF), <strong>polarizzati</strong>: il − è segnato da una banda. Hanno una tensione massima da non superare.</li>
          <li><strong>A film</strong> (poliestere, polipropilene): precisi e stabili, per filtri e temporizzatori.</li></ul></article>`,
  });

  // =====================================================================
  // 2 — Serie e parallelo di condensatori
  // =====================================================================
  const c2 = [];
  const CV = [1, 2, 3, 4, 6, 10, 12, 15, 20];
  c2.push({
    id: 'cap-par', title: 'Condensatori in parallelo', level: 1,
    gen: () => { const n = pick([2, 3]); return { E: pick([5, 9, 12, 24]), C: Array.from({ length: n }, () => pick(UF) * 1e-6), kind: 'par' }; },
    solve: (p) => { const Ceq = P.capParallel(...p.C); return { Ceq, Qs: p.C.map((c) => c * p.E), Q: Ceq * p.E }; },
    text: (p) => `${p.C.length === 2 ? 'Due' : 'Tre'} condensatori in parallelo (${p.C.map((c, k) => `${C_(k + 1)} = ${U(c, 'F')}`).join(', ')}) sono collegati a ${p.E} V. Trova la capacità equivalente e la carica totale.`,
    fig: (p, r, sol) => S.capNet(p, { extra: sol ? r.Qs.map((q, k) => `Q${k + 1} = ${App.si(q, 'C')}`) : null }),
    asks: (p, r) => [qC('<var>C</var><sub>eq</sub>', r.Ceq), { label: '<var>Q</var> totale', unit: 'µC', value: r.Q * 1e6 }],
    steps: (p, r) => step(`<var>C</var><sub>eq</sub> = ${p.C.map((c) => U(c, 'F')).join(' + ')} = ${res(U(r.Ceq, 'F'))}`, 'In parallelo le capacità si sommano: è come allargare le armature.') +
      step(`Ogni condensatore ha ${p.E} V: ${r.Qs.map((q, k) => `<var>Q</var><sub>${k + 1}</sub> = ${U(q, 'C')}`).join(', ')}`) +
      step(`<var>Q</var> = <var>C</var><sub>eq</sub>·<var>E</var> = ${res(U(r.Q, 'C'))}`, 'La carica totale è la somma delle cariche.'),
  });
  c2.push({
    id: 'cap-ser', title: 'Condensatori in serie', level: 2,
    defaults: { E: 12, C: [3e-6, 6e-6], kind: 'ser' },
    gen: () => L.nice(() => ({ E: pick([6, 9, 12, 15, 18, 24]), C: [pick(CV) * 1e-6, pick(CV) * 1e-6], kind: 'ser' }), (p) => { const Ce = P.capSeries(...p.C); return clean(Ce * 1e6) && clean(Ce * p.E / p.C[0]); }, { E: 12, C: [3e-6, 6e-6], kind: 'ser' }),
    solve: (p) => { const Ceq = P.capSeries(...p.C); const Q = Ceq * p.E; return { Ceq, Q, Vs: p.C.map((c) => Q / c) }; },
    text: (p) => `${C_(1)} = ${U(p.C[0], 'F')} e ${C_(2)} = ${U(p.C[1], 'F')} sono in serie su <var>E</var> = ${p.E} V. Trova la capacità equivalente, la carica e la tensione su ciascuno.`,
    fig: (p, r, sol) => S.capNet(p, { extra: sol ? r.Vs.map((v, k) => `V${k + 1} = ${App.si(v, 'V')}`) : null }),
    asks: (p, r) => [qC('<var>C</var><sub>eq</sub>', r.Ceq), { label: '<var>Q</var>', unit: 'µC', value: r.Q * 1e6 }, { label: '<var>V</var><sub>1</sub>', unit: 'V', value: r.Vs[0] }, { label: '<var>V</var><sub>2</sub>', unit: 'V', value: r.Vs[1] }],
    hint: () => 'In serie si sommano gli inversi (come i resistori in parallelo) e tutti hanno la stessa carica.',
    steps: (p, r) => step(`<var>C</var><sub>eq</sub> = ${frac(C_(1) + '·' + C_(2), C_(1) + ' + ' + C_(2))} = ${frac(N(p.C[0] * 1e6) + '·' + N(p.C[1] * 1e6), N(p.C[0] * 1e6 + p.C[1] * 1e6))} µF = ${res(U(r.Ceq, 'F'))}`, 'Due in serie: prodotto diviso somma. Ceq è minore del più piccolo.') +
      step(`<var>Q</var> = <var>C</var><sub>eq</sub>·<var>E</var> = ${res(U(r.Q, 'C'))}`, 'In serie la carica è la stessa su tutti: gli elettroni che lasciano un\'armatura arrivano sulla successiva.') +
      step(`<var>V</var><sub>1</sub> = ${frac('<var>Q</var>', C_(1))} = ${res(U(r.Vs[0], 'V'))}; <var>V</var><sub>2</sub> = ${frac('<var>Q</var>', C_(2))} = ${res(U(r.Vs[1], 'V'))}`, `Il condensatore più piccolo prende la tensione più grande. ${N(r.Vs[0])} + ${N(r.Vs[1])} = ${p.E} V${ok}`),
  });
  c2.push({
    id: 'cap-mix', title: 'Serie e parallelo insieme', level: 3,
    gen: () => L.nice(() => ({ E: pick([6, 10, 12, 15, 20, 24]), C: [pick(CV) * 1e-6, pick(CV) * 1e-6, pick(CV) * 1e-6], kind: 'mix' }), (p) => { const C23 = p.C[1] + p.C[2]; const Ce = P.capSeries(p.C[0], C23); return clean(Ce * 1e6) && clean(Ce * p.E / C23); }, { E: 12, C: [6e-6, 2e-6, 1e-6], kind: 'mix' }),
    solve: (p) => { const C23 = p.C[1] + p.C[2]; const Ceq = P.capSeries(p.C[0], C23); const Q = Ceq * p.E; return { C23, Ceq, Q, V1: Q / p.C[0], VA: Q / C23 }; },
    text: (p) => `${C_(1)} = ${U(p.C[0], 'F')} è in serie al parallelo di ${C_(2)} = ${U(p.C[1], 'F')} e ${C_(3)} = ${U(p.C[2], 'F')}; <var>E</var> = ${p.E} V. Trova <var>C</var><sub>eq</sub>, la carica totale, la tensione su ${C_(1)} e quella sul parallelo.`,
    fig: (p) => S.capNet(p),
    asks: (p, r) => [qC('<var>C</var><sub>eq</sub>', r.Ceq), { label: '<var>Q</var>', unit: 'µC', value: r.Q * 1e6 }, { label: '<var>V</var><sub>1</sub>', unit: 'V', value: r.V1 }, { label: '<var>V</var><sub>A</sub>', unit: 'V', value: r.VA }],
    steps: (p, r) => step(`<var>C</var><sub>23</sub> = ${U(p.C[1], 'F')} + ${U(p.C[2], 'F')} = ${U(r.C23, 'F')}`, 'Prima il parallelo: le capacità si sommano.') +
      step(`<var>C</var><sub>eq</sub> = ${frac(C_(1) + '·<var>C</var><sub>23</sub>', C_(1) + ' + <var>C</var><sub>23</sub>')} = ${res(U(r.Ceq, 'F'))}`, 'Poi la serie con C₁.') +
      step(`<var>Q</var> = ${res(U(r.Q, 'C'))}; <var>V</var><sub>1</sub> = <var>Q</var>/${C_(1)} = ${res(U(r.V1, 'V'))}; <var>V</var><sub>A</sub> = <var>Q</var>/<var>C</var><sub>23</sub> = ${res(U(r.VA, 'V'))}`, `${N(r.V1)} + ${N(r.VA)} = ${p.E} V${ok}`),
  });
  c2.push({
    id: 'cap-conf', title: 'Al contrario dei resistori', level: 1,
    ...mc([
      ['In un collegamento in serie di condensatori, che cosa è uguale per tutti?', ['la carica', 'la tensione', 'la capacità', 'l\'energia'], 'La carica che lascia un\'armatura arriva su quella successiva.'],
      ['In parallelo, la capacità equivalente è…', ['la somma delle capacità', 'minore della più piccola', 'il prodotto diviso la somma', 'la media'], 'Come allargare le armature: le capacità si sommano. È il contrario dei resistori.'],
      ['Due condensatori uguali da C in serie equivalgono a…', ['C/2', '2C', 'C', 'C²'], 'La distanza tra le armature "raddoppia": la capacità si dimezza.'],
      ['In serie, su quale condensatore c\'è più tensione?', ['su quello con capacità più piccola', 'su quello con capacità più grande', 'è uguale su tutti', 'dipende dalla corrente'], 'V = Q/C con Q uguale per tutti: C piccola, V grande.'],
    ]),
  });

  function widgetCapNet(host) {
    const c = K.widgetCard('Serie o parallelo?', 'Le barre mostrano carica e tensione su ogni condensatore');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<button type="button" data-k="par">Parallelo</button><button type="button" data-k="ser">Serie</button>';
    const fig = document.createElement('div');
    const bars = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    let kind = 'ser', last;
    const draw = (v) => {
      last = v;
      const Cs = [v.C1 * 1e-6, v.C2 * 1e-6, v.C3 * 1e-6];
      const Ceq = kind === 'par' ? P.capParallel(...Cs) : P.capSeries(...Cs);
      const Qs = kind === 'par' ? Cs.map((x) => x * v.E) : Cs.map(() => Ceq * v.E);
      const Vs = kind === 'par' ? Cs.map(() => v.E) : Qs.map((q, k) => q / Cs[k]);
      fig.innerHTML = S.capNet({ E: v.E, C: Cs, kind }).svg;
      const qmax = Math.max(...Qs), W = 480;
      const bar = (y, val, max, col, lbl, txt) => `<text class="small" x="0" y="${y + 12}">${lbl}</text><rect x="60" y="${y}" width="${Math.max(1, ((W - 170) * val) / max)}" height="15" fill="${col}" opacity=".85"/><text class="small" x="${66 + ((W - 170) * val) / max}" y="${y + 12}">${txt}</text>`;
      let s = '<text class="small" x="0" y="10">Carica</text>';
      Qs.forEach((q, k) => { s += bar(16 + k * 19, q, qmax, 'var(--g1)', 'C' + (k + 1), App.si(q, 'C')); });
      s += '<text class="small" x="0" y="88">Tensione</text>';
      Vs.forEach((x, k) => { s += bar(94 + k * 19, x, v.E, 'var(--g2)', 'C' + (k + 1), App.si(x, 'V')); });
      bars.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 156" role="img" style="width:100%;height:auto"><title>Carica e tensione dei condensatori</title>${s}</svg>`;
      out.innerHTML = `<var>C</var><sub>eq</sub> = ${res(U(Ceq, 'F'))}. ${kind === 'par' ? 'In parallelo: stessa tensione, le cariche (e le capacità) si sommano.' : 'In serie: stessa carica, le tensioni si dividono al contrario delle capacità, e C<sub>eq</sub> è minore della più piccola.'}`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === kind)));
    };
    const sl = K.sliders(c, [
      { id: 'E', label: '<var>E</var> (V)', min: 1, max: 30, step: 0.5, value: 12 },
      { id: 'C1', label: '<var>C</var><sub>1</sub> (µF)', min: 0.1, max: 100, log: true, value: 1 },
      { id: 'C2', label: '<var>C</var><sub>2</sub> (µF)', min: 0.1, max: 100, log: true, value: 2.2 },
      { id: 'C3', label: '<var>C</var><sub>3</sub> (µF)', min: 0.1, max: 100, log: true, value: 4.7 },
    ], draw);
    seg.addEventListener('click', (e) => { if (e.target.dataset.k) { kind = e.target.dataset.k; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(fig, bars, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'collegamenti', num: 2, short: 'Serie e parallelo', title: 'Condensatori in serie e in parallelo',
    intro: 'Con i condensatori le regole di serie e parallelo sono scambiate rispetto ai resistori: in parallelo le capacità si sommano, in serie si sommano gli inversi.',
    goals: ['Parallelo: C si sommano', 'Serie: stessa carica', 'Partitore capacitivo', 'Reti miste'],
    widgets: [widgetCapNet],
    example: c2[1], exampleTitle: 'Esempio: due condensatori in serie',
    families: c2,
    theory: `
      <article class="note"><h4>Parallelo</h4>
        <div class="eq"><span><var>C</var><sub>eq</sub> = <var>C</var><sub>1</sub> + <var>C</var><sub>2</sub> + …</span><span><var>Q</var> = <var>Q</var><sub>1</sub> + <var>Q</var><sub>2</sub> + …</span></div>
        <p>Stessa tensione su tutti; le cariche si sommano.</p></article>
      <article class="note"><h4>Serie</h4>
        <div class="eq"><span>${frac('1', '<var>C</var><sub>eq</sub>')} = ${frac('1', '<var>C</var><sub>1</sub>')} + ${frac('1', '<var>C</var><sub>2</sub>')} + …</span><span><var>V</var><sub><var>k</var></sub> = ${frac('<var>Q</var>', '<var>C</var><sub><var>k</var></sub>')}</span></div>
        <p>Stessa carica su tutti; le tensioni si sommano. Con due condensatori: prodotto diviso somma. <strong>Partitore capacitivo</strong>: <span class="f"><var>V</var><sub>1</sub> = <var>E</var>·<var>C</var><sub>2</sub>/(<var>C</var><sub>1</sub> + <var>C</var><sub>2</sub>)</span> (al numeratore c'è l'<em>altro</em> condensatore).</p></article>
      <article class="note"><h4>Il confronto con i resistori</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th></th><th>Resistori</th><th>Condensatori</th></tr></thead><tbody>
          <tr><td>Serie</td><td>si sommano</td><td>si sommano gli inversi</td></tr>
          <tr><td>Parallelo</td><td>si sommano gli inversi</td><td>si sommano</td></tr></tbody></table></div></article>`,
  });

  // =====================================================================
  // 3 — Carica del condensatore
  // =====================================================================
  const c3 = [];
  const rcGen = () => ({ E: pick([5, 9, 10, 12, 24]), R: pick(KOHM) * 1000, C: pick(UF) * 1e-6 });
  c3.push({
    id: 'rc-tau', title: 'Costante di tempo', level: 1,
    defaults: { E: 12, R: 10000, C: 100e-6 },
    gen: rcGen,
    solve: (p) => ({ tau: p.R * p.C }),
    text: (p) => `Un condensatore da ${U(p.C, 'F')} si carica attraverso un resistore da ${U(p.R, 'Ω')}. Trova la costante di tempo e il tempo dopo cui si considera carico.`,
    fig: (p) => S.rc(p, { pos: 1 }),
    asks: (p, r) => [qT('τ', r.tau), qT('5τ', 5 * r.tau)],
    hint: () => 'τ = R·C; con R in kΩ e C in µF il risultato è in millisecondi.',
    steps: (p, r) => step(`τ = <var>R</var>·<var>C</var> = ${U(p.R, 'Ω')} · ${U(p.C, 'F')} = ${res(U(r.tau, 's'))}`, 'kΩ · µF = ms: un trucco comodo.') + step(`5τ = ${res(U(5 * r.tau, 's'))}`, 'Dopo 5τ il condensatore è carico al 99,3%: in pratica il transitorio è finito.'),
  });
  c3.push({
    id: 'rc-vt', title: 'Tensione dopo un tempo', level: 2,
    gen: () => { const p = rcGen(); p.k = pick([0.5, 1, 1.5, 2, 3]); return p; },
    solve: (p) => { const tau = p.R * p.C; const t = p.k * tau; const v = P.charge(p.E, tau, t); return { tau, t, v, i: (p.E - v) / p.R }; },
    text: (p, r) => `<var>E</var> = ${p.E} V, <var>R</var> = ${U(p.R, 'Ω')}, <var>C</var> = ${U(p.C, 'F')}, condensatore inizialmente scarico. Chiudi il deviatore in posizione 1: quanto valgono la tensione sul condensatore e la corrente dopo ${U(r.t, 's')}?`,
    fig: (p, r, sol) => S.rc(p, { pos: 1, v: sol ? vcl(App.si(r.v, 'V')) : '', i: sol ? r.i : null }),
    asks: (p, r) => [{ label: '<var>v</var><sub>C</sub>', unit: 'V', value: r.v }, { label: '<var>i</var>', unit: 'mA', value: r.i * 1000 }],
    hint: () => 'v_C = E·(1 − e^(−t/τ)), i = (E − v_C)/R.',
    steps: (p, r) => step(`τ = <var>R</var><var>C</var> = ${U(r.tau, 's')}; <var>t</var>/τ = ${N(p.k)}`) +
      step(`<var>v</var><sub>C</sub> = <var>E</var>(1 − e<sup>−<var>t</var>/τ</sup>) = ${p.E} · (1 − e<sup>−${N(p.k)}</sup>) = ${p.E} · ${N(1 - Math.exp(-p.k), 4)} = ${res(U(r.v, 'V'))}`) +
      step(`<var>i</var> = ${frac('<var>E</var> − <var>v</var><sub>C</sub>', '<var>R</var>')} = ${frac(N(p.E - r.v, 4), U(p.R, 'Ω'))} = ${res(U(r.i, 'A'))}`, 'La corrente parte da E/R e cala con la stessa costante di tempo.'),
  });
  c3.push({
    id: 'rc-quando', title: 'Quando arriva a…?', level: 3,
    gen: () => { const p = rcGen(); p.f = pick([0.5, 0.6, 0.75, 0.8, 0.9, 0.95]); return p; },
    solve: (p) => { const tau = p.R * p.C; const V1 = p.f * p.E; return { tau, V1, t: P.timeToCharge(p.E, tau, V1) }; },
    text: (p, r) => `Con <var>E</var> = ${p.E} V, <var>R</var> = ${U(p.R, 'Ω')} e <var>C</var> = ${U(p.C, 'F')}, dopo quanto tempo la tensione sul condensatore raggiunge ${N(r.V1)} V?`,
    asks: (p, r) => [qT('<var>t</var>', r.t)],
    hint: () => 'Rovescia la formula: t = −τ · ln(1 − v/E).',
    steps: (p, r) => step(`1 − e<sup>−<var>t</var>/τ</sup> = ${frac(N(r.V1), p.E)} = ${N(p.f)} → e<sup>−<var>t</var>/τ</sup> = ${N(1 - p.f)}`, 'Dividi per E e isola l\'esponenziale.') +
      step(`<var>t</var> = −τ · ln(${N(1 - p.f)}) = ${U(r.tau, 's')} · ${N(-Math.log(1 - p.f), 4)} = ${res(U(r.t, 's'))}`, 'Il logaritmo naturale è l\'operazione inversa dell\'esponenziale. È il calcolo dei temporizzatori.'),
  });
  c3.push({
    id: 'rc-pct', title: 'A che percentuale?', level: 1,
    gen: () => ({ k: pick([1, 2, 3, 4, 5]) }),
    solve: (p) => ({ pct: (1 - Math.exp(-p.k)) * 100 }),
    text: (p) => `Un condensatore parte scarico. Dopo ${p.k === 1 ? 'una costante di tempo' : p.k + ' costanti di tempo'} (${p.k}τ), a che percentuale della tensione finale è arrivato?`,
    asks: (p, r) => [{ label: 'Carica', unit: '%', value: r.pct, tol: 0.01 }],
    steps: (p, r) => step(`1 − e<sup>−${p.k}</sup> = ${N(1 - Math.exp(-p.k), 4)} → ${res(N(r.pct, 3) + ' %')}`, 'Da ricordare: 63% dopo τ, 86% dopo 2τ, 95% dopo 3τ, 98% dopo 4τ, 99,3% dopo 5τ. Non dipende da R, C o E.'),
  });
  c3.push({
    id: 'rc-mc', title: 'Concetti sulla carica', level: 1,
    ...mc([
      ['Appena chiudi l\'interruttore, un condensatore scarico si comporta come…', ['un cortocircuito', 'un circuito aperto', 'un generatore da E', 'un resistore da R'], 'Ha 0 V ai capi: la corrente iniziale è E/R, come se al suo posto ci fosse un filo.'],
      ['Se raddoppi C lasciando uguale R, il tempo di carica…', ['raddoppia', 'si dimezza', 'resta uguale', 'quadruplica'], 'τ = R·C è proporzionale a C.'],
      ['Durante la carica, che cosa non può cambiare di colpo?', ['la tensione sul condensatore', 'la corrente nel circuito', 'la tensione sul resistore', 'niente'], 'Cambiare di colpo la tensione richiederebbe una corrente infinita. La corrente invece può saltare, da 0 a E/R.'],
      ['A carica finita, la corrente nel circuito RC vale…', ['zero', 'E/R', 'E/(R·C)', 'il massimo'], 'Il condensatore carico è come un circuito aperto: tutta la tensione E è su di lui.'],
    ]),
  });

  function rcChart(v, mode, tk) {
    const tau = v.R * 1000 * v.C * 1e-6;
    const ch = K.chart({ W: 460, H: 230, xmax: 5, ymax: 1, xu: '', yu: '', xlabel: 't / τ', ylabel: '', ticks: 5 });
    let dV = '', dI = '';
    for (let k = 0; k <= 150; k++) {
      const x = (5 * k) / 150;
      const vv = mode === 'c' ? 1 - Math.exp(-x) : Math.exp(-x);
      const ii = Math.exp(-x);
      dV += (k ? 'L' : 'M') + ch.X(x).toFixed(1) + ' ' + ch.Y(vv).toFixed(1);
      dI += (k ? 'L' : 'M') + ch.X(x).toFixed(1) + ' ' + ch.Y(ii).toFixed(1);
    }
    let s = ch.s;
    for (let k = 1; k <= 5; k++) s += `<text x="${ch.X(k)}" y="${ch.Y(1) - 2}" text-anchor="middle" class="small">${k}τ</text>`;
    s += `<path class="gen" d="${dV}"/><path class="load" d="${dI}" stroke-dasharray="5 4"/>`;
    const vk = mode === 'c' ? 1 - Math.exp(-tk) : Math.exp(-tk);
    s += `<line class="guide" x1="${ch.X(tk)}" y1="${ch.Y(0)}" x2="${ch.X(tk)}" y2="${ch.Y(1)}"/><circle class="op" cx="${ch.X(tk)}" cy="${ch.Y(vk)}" r="5.5"/><circle cx="${ch.X(tk)}" cy="${ch.Y(Math.exp(-tk))}" r="4" fill="var(--energy)"/>`;
    return { tau, svg: `<svg class="chart" viewBox="0 0 460 230" role="img" style="width:100%;height:auto"><title>Transitorio RC</title>${s}</svg><div class="legend"><span><i style="background:var(--pen)"></i>v<sub>C</sub> / E</span><span><i style="background:var(--energy)"></i>i / (E/R)</span></div>`, vk };
  }

  function widgetCharge(host, mode0 = 'c') {
    const c = K.widgetCard(mode0 === 'c' ? 'La carica, istante per istante' : 'La scarica e la tangente', mode0 === 'c' ? 'Muovi il tempo o premi "Avvia"' : 'La tangente nell\'origine incontra l\'asse proprio a t = τ');
    const fig = document.createElement('div');
    const chart = document.createElement('div');
    const out = document.createElement('div');
    out.className = 'forms';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'btn small';
    play.textContent = 'Avvia';
    let tk = 1, timer = null, last;
    const draw = (v) => {
      last = v;
      tk = v.t;
      const r = rcChart(v, mode0, tk);
      let svg = r.svg;
      if (mode0 === 'd') svg = svg.replace('</svg>', `<line x1="50" y1="${14}" x2="${50 + (460 - 14 - 50) / 5}" y2="${230 - 34}" stroke="var(--g4)" stroke-width="1.6" stroke-dasharray="6 4"/></svg>`);
      chart.innerHTML = svg;
      const vC = v.E * r.vk;
      const i = (v.E / (v.R * 1000)) * Math.exp(-tk);
      fig.innerHTML = S.rc({ E: v.E, R: v.R * 1000, C: v.C * 1e-6 }, { pos: mode0 === 'c' ? 1 : 2, v: vcl(App.si(vC, 'V')), i: mode0 === 'c' ? i : -i }).svg;
      out.innerHTML = `<div class="form-row"><span class="label">Istante</span><div class="f"><var>t</var> = ${N(tk, 3)} τ = ${U(tk * r.tau, 's')} (τ = <var>R</var><var>C</var> = ${U(r.tau, 's')})</div></div>
        <div class="form-row"><span class="label">Valori</span><div class="f"><var>v</var><sub>C</sub> = ${res(U(vC, 'V'))} (${N(r.vk * 100, 3)} %), <var>i</var> = ${res(U(i, 'A'))}</div>
        <span class="meta">${mode0 === 'c' ? 'All\'inizio il condensatore scarico fa passare tutta la corrente E/R; man mano che si carica la corrente cala, e la tensione sale sempre più piano.' : 'In scarica il condensatore fa da generatore: la corrente gira al contrario (freccia verso sinistra) e si spegne insieme alla tensione.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'E', label: '<var>E</var> (V)', min: 1, max: 24, step: 0.5, value: 12 },
      { id: 'R', label: '<var>R</var> (kΩ)', min: 1, max: 100, log: true, value: 10 },
      { id: 'C', label: '<var>C</var> (µF)', min: 1, max: 1000, log: true, value: 100 },
      { id: 't', label: 'Tempo (multipli di τ)', min: 0, max: 5, step: 0.05, value: 1, sig: 3 },
    ], draw);
    play.addEventListener('click', () => {
      if (timer) { clearInterval(timer); timer = null; play.textContent = 'Avvia'; return; }
      let t = 0;
      play.textContent = 'Ferma';
      timer = setInterval(() => {
        t += 0.05;
        if (t > 5 || !App.isVisible(c)) { clearInterval(timer); timer = null; play.textContent = 'Avvia'; return; }
        sl.fields.t.set(t);
        sl.values.t = t;
        draw({ ...last, t });
      }, App.reducedMotion ? 200 : 40);
    });
    c.append(play, fig, chart, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'carica', num: 3, short: 'Carica RC', title: 'La carica del condensatore',
    intro: 'Un condensatore non si carica di colpo: attraverso un resistore la tensione sale seguendo una curva esponenziale. Il tempo caratteristico è τ = R·C.',
    goals: ['τ = RC', 'vC(t) e i(t)', 'Tempo per raggiungere una tensione', '63% dopo τ, 99% dopo 5τ'],
    widgets: [(h0) => widgetCharge(h0, 'c')],
    example: c3[1], exampleTitle: 'Esempio: tensione dopo un tempo',
    families: c3,
    theory: `
      <article class="note"><h4>Le equazioni della carica</h4>
        <div class="eq"><span><var>v</var><sub>C</sub>(<var>t</var>) = <var>E</var> (1 − e<sup>−<var>t</var>/τ</sup>)</span><span><var>i</var>(<var>t</var>) = ${frac('<var>E</var>', '<var>R</var>')} e<sup>−<var>t</var>/τ</sup></span><span>τ = <var>R</var> · <var>C</var></span></div>
        <p>e ≈ 2,718 è il numero di Nepero. Con <var>R</var> in kΩ e <var>C</var> in µF, τ esce in millisecondi.</p></article>
      <article class="note"><h4>Valori da ricordare</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th><var>t</var></th><th>τ</th><th>2τ</th><th>3τ</th><th>4τ</th><th>5τ</th></tr></thead><tbody>
          <tr><td>carica</td><td>63%</td><td>86%</td><td>95%</td><td>98%</td><td>99,3%</td></tr></tbody></table></div>
        <p>Dopo 5τ il transitorio si considera finito e il condensatore si comporta come un circuito aperto.</p></article>
      <article class="note"><h4>Perché la curva rallenta</h4>
        <p>All'inizio il condensatore è scarico: ha 0 V ai capi e tutta la tensione <var>E</var> è sul resistore, quindi la corrente è massima, <var>E</var>/<var>R</var>. Più si carica, meno tensione resta sul resistore, meno corrente arriva, più lenta è la carica.</p></article>
      <article class="note"><h4>Tempo per arrivare a una tensione</h4>
        <div class="eq"><span><var>t</var> = −τ · ln(1 − ${frac('<var>v</var>', '<var>E</var>')})</span></div></article>`,
  });

  // =====================================================================
  // 4 — Scarica del condensatore
  // =====================================================================
  const c4 = [];
  c4.push({
    id: 'rcs-v', title: 'Tensione durante la scarica', level: 2,
    defaults: { E: 12, R: 10000, C: 100e-6, k: 1 },
    gen: () => { const p = rcGen(); p.k = pick([0.5, 1, 2, 3]); return p; },
    solve: (p) => { const tau = p.R * p.C; const t = p.k * tau; const v = P.discharge(p.E, tau, t); return { tau, t, v, i: v / p.R }; },
    text: (p, r) => `Il condensatore da ${U(p.C, 'F')}, carico a ${p.E} V, si scarica su <var>R</var> = ${U(p.R, 'Ω')} (deviatore in posizione 2). Quanto valgono tensione e corrente dopo ${U(r.t, 's')}?`,
    fig: (p, r, sol) => S.rc(p, { pos: 2, v: sol ? vcl(App.si(r.v, 'V')) : '', i: sol ? -r.i : null }),
    asks: (p, r) => [{ label: '<var>v</var><sub>C</sub>', unit: 'V', value: r.v }, { label: '|<var>i</var>|', unit: 'mA', value: r.i * 1000 }],
    steps: (p, r) => step(`τ = ${U(r.tau, 's')}; <var>t</var>/τ = ${N(p.k)}`) + step(`<var>v</var><sub>C</sub> = <var>V</var><sub>0</sub>e<sup>−<var>t</var>/τ</sup> = ${p.E} · ${N(Math.exp(-p.k), 4)} = ${res(U(r.v, 'V'))}`) +
      step(`|<var>i</var>| = <var>v</var><sub>C</sub>/<var>R</var> = ${res(U(r.i, 'A'))}`, 'In scarica la corrente gira al contrario rispetto alla carica.'),
  });
  c4.push({
    id: 'rcs-t', title: 'Dopo quanto scende a…?', level: 3,
    gen: () => { const p = rcGen(); p.f = pick([0.5, 0.25, 0.1, 0.05, 0.2]); return p; },
    solve: (p) => { const tau = p.R * p.C; const V1 = p.E * p.f; return { tau, V1, t: P.timeToDischarge(p.E, tau, V1) }; },
    text: (p, r) => `Un condensatore da ${U(p.C, 'F')}, carico a ${p.E} V, si scarica su ${U(p.R, 'Ω')}. Dopo quanto tempo la tensione scende a ${N(r.V1)} V?`,
    asks: (p, r) => [qT('<var>t</var>', r.t)],
    steps: (p, r) => step(`e<sup>−<var>t</var>/τ</sup> = ${frac(N(r.V1), p.E)} = ${N(p.f)}`) + step(`<var>t</var> = −τ · ln(${N(p.f)}) = ${U(r.tau, 's')} · ${N(-Math.log(p.f), 4)} = ${res(U(r.t, 's'))}`, 'Dimezzare la tensione richiede sempre lo stesso tempo, 0,69τ, qualunque sia il punto di partenza.'),
  });
  c4.push({
    id: 'rcs-en', title: 'Energia dissipata', level: 1,
    gen: () => ({ C: pick([100, 220, 470, 1000, 2200]) * 1e-6, V: pick([9, 12, 25, 50]), R: pick([10, 100, 1000]) }),
    solve: (p) => ({ W: 0.5 * p.C * p.V * p.V }),
    text: (p) => `Un condensatore da ${U(p.C, 'F')} carico a ${p.V} V viene scaricato completamente su un resistore da ${U(p.R, 'Ω')}. Quanta energia si trasforma in calore nel resistore?`,
    asks: (p, r) => [{ label: '<var>W</var>', unit: 'mJ', value: r.W * 1000 }],
    steps: (p, r) => step(`<var>W</var> = ½<var>C</var><var>V</var>² = ${res(U(r.W, 'J'))}`, 'Tutta l\'energia del condensatore finisce nel resistore: il valore di R decide solo quanto in fretta (τ = RC), non quanta.'),
  });
  c4.push({
    id: 'rcs-tau', title: 'Ricava la capacità dal grafico', level: 2,
    gen: () => ({ R: pick(KOHM) * 1000, C: pick(UF) * 1e-6, E: pick([5, 10, 12]) }),
    solve: (p) => ({ tau: p.R * p.C, v: p.E * Math.exp(-1) }),
    text: (p, r) => `All'oscilloscopio la tensione di scarica parte da ${p.E} V e scende a ${N(r.v, 3)} V (il 36,8%) dopo ${U(r.tau, 's')}. Il resistore di scarica è ${U(p.R, 'Ω')}. Quanto vale la capacità?`,
    asks: (p) => [qC('<var>C</var>', p.C)],
    hint: () => 'Il 36,8% del valore iniziale si raggiunge proprio dopo un tempo τ.',
    steps: (p, r) => step(`e<sup>−1</sup> = 0,368 → <var>t</var> = τ = ${U(r.tau, 's')}`, 'Problema rovesciato: dal grafico si legge τ.') + step(`<var>C</var> = ${frac('τ', '<var>R</var>')} = ${frac(U(r.tau, 's'), U(p.R, 'Ω'))} = ${res(U(p.C, 'F'))}`, 'È un modo pratico per misurare una capacità.'),
  });

  lessons.push({
    id: 'scarica', num: 4, short: 'Scarica RC', title: 'La scarica e la costante di tempo',
    intro: 'Un condensatore carico, collegato a un resistore, si comporta come un generatore che si esaurisce: tensione e corrente calano insieme con la stessa costante di tempo.',
    goals: ['vC(t) in scarica', 'Significato di τ', 'Energia dissipata', 'Ricavare C da un grafico'],
    widgets: [(h0) => widgetCharge(h0, 'd')],
    example: c4[0], exampleTitle: 'Esempio: tensione durante la scarica',
    families: c4,
    theory: `
      <article class="note"><h4>Le equazioni della scarica</h4>
        <div class="eq"><span><var>v</var><sub>C</sub>(<var>t</var>) = <var>V</var><sub>0</sub> e<sup>−<var>t</var>/τ</sup></span><span><var>i</var>(<var>t</var>) = −${frac('<var>V</var><sub>0</sub>', '<var>R</var>')} e<sup>−<var>t</var>/τ</sup></span></div>
        <p>Il segno meno dice che la corrente gira al contrario rispetto alla carica.</p></article>
      <article class="note"><h4>Che cosa significa τ</h4>
        <ul><li>Dopo un tempo τ la tensione è scesa al 36,8% (o, in carica, salita al 63,2%).</li>
          <li>La tangente alla curva nell'istante iniziale incontra l'asse dei tempi proprio a <var>t</var> = τ: se la scarica continuasse alla velocità iniziale, finirebbe in τ.</li>
          <li>Il tempo di dimezzamento è 0,69τ.</li></ul></article>
      <article class="note"><h4>Dove si usa</h4>
        <p>Temporizzatori (luci delle scale, il 555), filtri che separano segnali lenti e veloci, alimentatori (il condensatore "riempie i buchi" della tensione raddrizzata, lo vedrai in 4ª), il flash delle fotocamere.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'cap', year: '3', yearLabel: '3ª', title: 'Condensatori e transitori RC', route: 'cap-capacita', lessonWord: 'Lezione',
    desc: 'Capacità e condensatore piano, serie e parallelo, carica e scarica attraverso un resistore, costante di tempo.',
    lessons,
  });
})();
