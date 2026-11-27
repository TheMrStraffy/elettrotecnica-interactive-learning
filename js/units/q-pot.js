/* 4ª — Potenze in alternata e rifasamento */
(function () {
  'use strict';
  const App = window.App;
  const A = window.AC;
  const L = App.Lessons;
  const K = App.CC;
  const h = K.h;
  const Q = App.Q;
  const { N, U, frac, step, res } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const mc = App.B.mc;
  const lessons = [];
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const fP = (x) => Q.fmtPow(x, 'W');
  const fQ = (x) => Q.fmtPow(x, 'var');
  const fS = (x) => Q.fmtPow(x, 'VA');
  const COS = [0.6, 0.7, 0.75, 0.8, 0.85, 0.9];
  const tanOf = (c) => Math.tan(Math.acos(c));
  const cosH = 'cos φ';

  /** Disegno del triangolo delle potenze (uno o più carichi in catena). */
  function triSVG(loads, opts = {}) {
    const vecs = [];
    let at = A.cx(0, 0);
    loads.forEach((l, i) => {
      const z = A.cx(l.P, l.Q);
      vecs.push({ from: at, z, label: loads.length > 1 ? 'S' + (i + 1) : '', cls: l.cls || 'p1' });
      at = A.add(at, z);
    });
    const tot = at;
    if (opts.parts !== false) {
      vecs.unshift({ z: A.cx(tot.re, 0), label: 'P', cls: 'p3', dash: true });
      vecs.unshift({ from: A.cx(tot.re, 0), z: A.cx(0, tot.im), label: 'Q', cls: 'p3', dash: true });
    }
    vecs.push({ z: tot, label: 'S', cls: 'ps' });
    return Q.phasorSVG({ W: opts.W || 300, H: opts.H || 260, vecs, arcs: opts.arc ? [{ to: A.argDeg(tot), label: 'φ', r: 40 }] : [], title: 'Triangolo delle potenze' }).replace(/>S(\d)</g, '>S<tspan class="sb" dy="3">$1</tspan><');
  }

  // =====================================================================
  // 1 — Potenza istantanea e attiva
  // =====================================================================
  const a1 = [];
  a1.push({
    id: 'p-att', title: 'Potenza attiva', level: 1,
    defaults: { V: 230, I: 10, c: 0.8, m: 0 },
    gen: () => ({ V: pick([230, 230, 400, 120, 24]), I: pick([0.5, 1, 2, 2.5, 4, 5, 8, 10, 16]), c: pick(COS.concat([1, 0.5])), m: rand(0, 2) }),
    solve: (p) => ({ P: p.V * p.I * p.c }),
    text: (p, r) => [
      `Un carico assorbe ${U(p.I, 'A')} a ${p.V} V con ${cosH} = ${N(p.c)}. Quanta potenza attiva assorbe?`,
      `Un carico a ${p.V} V assorbe ${U(p.I, 'A')} e il wattmetro segna ${fP(r.P)}. Quanto vale il fattore di potenza?`,
      `Un carico da ${fP(r.P)} con ${cosH} = ${N(p.c)} è collegato a ${p.V} V. Quanta corrente assorbe?`,
    ][p.m],
    asks: (p, r) => [[Q.qPow('<var>P</var>', r.P, 'W'), { label: cosH, unit: '', value: p.c }, h.qI('<var>I</var>', p.I)][p.m]],
    steps: (p, r) => [
      step(`<var>P</var> = <var>V</var> <var>I</var> ${cosH} = ${p.V} V · ${U(p.I, 'A')} · ${N(p.c)} = ${res(fP(r.P))}`, 'Solo la parte di corrente in fase con la tensione porta energia al carico.'),
      step(`${cosH} = ${frac('<var>P</var>', '<var>V</var> <var>I</var>')} = ${frac(fP(r.P), p.V + ' V · ' + U(p.I, 'A'))} = ${res(N(p.c, 3))}`, 'Il fattore di potenza dice quanta della "potenza apparente" V·I diventa davvero lavoro o calore.'),
      step(`<var>I</var> = ${frac('<var>P</var>', '<var>V</var> ' + cosH)} = ${frac(fP(r.P), p.V + ' V · ' + N(p.c))} = ${res(U(p.I, 'A'))}`, 'A parità di potenza, un cosφ basso vuol dire più corrente nei cavi.'),
    ][p.m],
  });
  a1.push({
    id: 'p-rx', title: 'Chi consuma davvero', level: 1,
    gen: () => ({ R: pick([10, 20, 30, 40, 60]), X: pick([10, 20, 30, 40, 80]), I: pick([1, 2, 2.5, 4, 5]), k: pick(['L', 'C']) }),
    solve: (p) => ({ P: p.R * p.I * p.I, Qv: p.X * p.I * p.I * (p.k === 'L' ? 1 : -1), S: Math.hypot(p.R, p.X) * p.I * p.I }),
    text: (p) => `In un carico R${p.k} serie (<var>R</var> = ${p.R} Ω, <var>X</var><sub>${p.k}</sub> = ${p.X} Ω) scorre una corrente di ${U(p.I, 'A')}. Quanto valgono la potenza attiva, quella reattiva e quella apparente?`,
    asks: (p, r) => [Q.qPow('<var>P</var>', r.P, 'W'), Object.assign(Q.qPow('<var>Q</var>', r.Qv, 'var'), { signNote: 'Controlla il segno: la potenza reattiva di un condensatore è negativa.' }), Q.qPow('<var>S</var>', r.S, 'VA')],
    steps: (p, r) => step(`<var>P</var> = <var>R</var> <var>I</var>² = ${p.R} · ${N(p.I)}² = ${res(fP(r.P))}`, 'Solo il resistore dissipa energia (diventa calore).') +
      step(`<var>Q</var> = ${p.k === 'C' ? '−' : ''}<var>X</var> <var>I</var>² = ${res(fQ(r.Qv))}`, p.k === 'L' ? 'L\'induttore scambia energia con la rete: la prende e la restituisce due volte per periodo.' : 'Il condensatore scambia energia in modo opposto all\'induttore: per convenzione la sua Q è negativa.') +
      step(`<var>S</var> = |<var>Z</var>| <var>I</var>² = √(<var>P</var>² + <var>Q</var>²) = ${res(fS(r.S))}`),
  });
  a1.push({
    id: 'p-kwh', title: 'Energia e bolletta', level: 1,
    gen: () => ({ P: pick([60, 100, 500, 1000, 1500, 2000, 2200, 3000]), h: pick([0.5, 1, 2, 3, 4, 6, 8]), d: pick([1, 7, 30]), c: pick([0.2, 0.25, 0.3, 0.35]) }),
    solve: (p) => { const E = (p.P / 1000) * p.h * p.d; return { E, cost: E * p.c }; },
    text: (p) => `Un apparecchio da ${fP(p.P)} resta acceso ${N(p.h)} ore al giorno per ${p.d} giorn${p.d === 1 ? 'o' : 'i'}. Quanta energia consuma, e quanto costa se il kWh costa ${N(p.c)} €?`,
    asks: (p, r) => [{ label: '<var>E</var>', unit: 'kWh', value: r.E }, { label: 'Costo', unit: '€', value: r.cost }],
    steps: (p, r) => step(`<var>E</var> = <var>P</var> · <var>t</var> = ${N(p.P / 1000)} kW · ${N(p.h * p.d)} h = ${res(N(r.E, 4) + ' kWh')}`, 'Il contatore misura energia attiva in kilowattora: 1 kWh = 3,6 MJ.') +
      step(`Costo = ${N(r.E, 4)} kWh · ${N(p.c)} €/kWh = ${res(N(r.cost, 4) + ' €')}`),
  });
  a1.push({
    id: 'p-mc', title: 'Concetti sulla potenza', level: 1,
    ...mc([
      ['In un induttore ideale la potenza attiva media è…', ['zero', 'V · I', 'massima', 'negativa'], 'L\'energia presa in un quarto di periodo viene restituita in quello dopo.'],
      ['La potenza istantanea p(t) = v(t) · i(t) oscilla a…', ['frequenza doppia di quella della tensione', 'la stessa frequenza', 'metà frequenza', 'frequenza zero'], 'Il prodotto di due sinusoidi contiene un termine a 2f.'],
      ['Quando la potenza istantanea è negativa…', ['il carico restituisce energia alla rete', 'il carico si guasta', 'il contatore gira al contrario per sempre', 'il resistore si raffredda'], 'Succede solo con carichi reattivi, per brevi tratti di ogni periodo.'],
      ['Il wattmetro misura…', ['la potenza attiva P = V I cos φ', 'la potenza apparente', 'la potenza reattiva', 'il prodotto dei valori di picco'], 'Moltiplica istante per istante e fa la media.'],
    ]),
  });

  function widgetPinst(host) {
    const c = K.widgetCard('Potenza istantanea', 'Tensione, corrente e potenza nel tempo: cambia lo sfasamento');
    const fig = el('div');
    const out = el('div', 'forms');
    const draw = (v) => {
      const ph = -v.ph; // la corrente è in ritardo di φ (carico induttivo se φ > 0)
      const cp = Math.cos(v.ph * A.D2R);
      const traces = [
        { amp: 1, f: 1, deg: 0, cls: 'p1' },
        { amp: 0.8, f: 1, deg: ph, cls: 'p2' },
        { fn: (t) => 2 * Math.sin(A.TAU * t) * Math.sin(A.TAU * t + ph * A.D2R), cls: 'ps' },
      ];
      fig.innerHTML = Q.waveSVG({ W: 520, H: 240, tmax: 1, ymax: 2, yu: '', xu: null, xlabel: 't / T', traces, hl: [{ y: cp, cls: 'ref', label: 'P (media)' }], title: 'v (blu), i (arancio), p = v · i (rosso)' });
      out.innerHTML = `<div class="form-row"><span class="label">Potenza attiva</span><div class="f"><var>P</var> = <var>V</var> <var>I</var> cos φ = <var>V</var> <var>I</var> · ${N(cp, 3)}</div><span class="meta">${Math.abs(v.ph) < 1 ? 'Carico resistivo: p(t) non è mai negativa.' : Math.abs(v.ph) > 89 ? 'Carico puramente reattivo: p(t) è positiva e negativa per tempi uguali, la media è zero.' : 'Nei tratti in cui p(t) è negativa il carico restituisce energia alla rete.'}</span></div>
        <div class="form-row"><span class="label">Frequenza</span><div class="f">p(t) oscilla a 2<var>f</var></div><span class="meta">In un periodo della tensione ci sono due "gobbe" di potenza.</span></div>`;
    };
    const sl = K.sliders(c, [{ id: 'ph', label: 'Sfasamento φ della corrente (°, positivo = in ritardo)', min: -90, max: 90, step: 5, value: 37 }], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'attiva', num: 1, short: 'Potenza attiva', title: 'Potenza istantanea e potenza attiva',
    intro: 'In alternata la potenza cambia istante per istante e, con carichi reattivi, a tratti torna indietro verso la rete. Quella che conta per la bolletta è la sua media: la potenza attiva.',
    goals: ['p(t) = v · i', 'P = V I cos φ', 'Chi dissipa e chi scambia', 'Energia in kWh'],
    widgets: [widgetPinst],
    example: a1[0], exampleTitle: 'Esempio: potenza di un carico',
    families: a1,
    theory: `
      <article class="note"><h4>Potenza attiva</h4>
        <div class="eq"><span><var>P</var> = <var>V</var> <var>I</var> cos φ = <var>R</var> <var>I</var>²</span><span class="u">watt [W]</span></div>
        <p><var>V</var> e <var>I</var> sono valori efficaci; φ è lo sfasamento tra tensione e corrente; cos φ si chiama fattore di potenza. Solo i resistori (e i carichi che fanno lavoro, come i motori) assorbono potenza attiva.</p></article>
      <article class="note"><h4>Potenza istantanea</h4>
        <p><var>p</var>(<var>t</var>) = <var>v</var>(<var>t</var>) · <var>i</var>(<var>t</var>) oscilla a frequenza doppia attorno al valore medio <var>P</var>. Con un carico reattivo puro la media è zero: l'energia va avanti e indietro senza essere consumata.</p></article>`,
  });

  // =====================================================================
  // 2 — Triangolo delle potenze
  // =====================================================================
  const t2 = [];
  t2.push({
    id: 'tri-s', title: 'Dal fattore di potenza al triangolo', level: 1,
    defaults: { P: 3000, c: 0.8, cap: false },
    gen: () => ({ P: pick([500, 800, 1000, 1500, 2000, 3000, 4000, 6000]), c: pick(COS), cap: Math.random() < 0.2 }),
    solve: (p) => A.triangle(p.P, p.c, p.cap),
    text: (p) => `Un carico ${p.cap ? 'capacitivo' : 'induttivo'} assorbe ${fP(p.P)} con ${cosH} = ${N(p.c)}. Quanto valgono la potenza apparente e la potenza reattiva?`,
    fig: (p, r, sol) => ({ svg: sol ? triSVG([{ P: p.P, Q: r.Q }], { arc: true }) : '' }),
    asks: (p, r) => [Q.qPow('<var>S</var>', r.S, 'VA'), Object.assign(Q.qPow('<var>Q</var>', r.Q, 'var'), { signNote: 'Controlla il segno: un carico capacitivo ha Q negativa.' })],
    steps: (p, r) => step(`<var>S</var> = ${frac('<var>P</var>', cosH)} = ${frac(fP(p.P), N(p.c))} = ${res(fS(r.S))}`, 'P è il cateto, S l\'ipotenusa: P = S cos φ.') +
      step(`φ = arccos(${N(p.c)}) = ${N(Math.abs(r.deg), 4)}°; <var>Q</var> = <var>P</var> tan φ = ${res(fQ(r.Q))}`, 'Oppure Q = √(S² − P²). Per convenzione Q > 0 per i carichi induttivi e Q < 0 per quelli capacitivi.'),
  });
  t2.push({
    id: 'tri-i', title: 'La corrente di linea', level: 1,
    gen: () => ({ P: pick([1000, 1500, 2000, 2300, 3000, 4600]), c: pick(COS.concat([1])), V: pick([230, 230, 120]) }),
    solve: (p) => { const S = p.P / p.c; return { S, I: S / p.V }; },
    text: (p) => `Un carico da ${fP(p.P)} con ${cosH} = ${N(p.c)} è alimentato a ${p.V} V. Quanto vale la potenza apparente? Che corrente passa nei cavi?`,
    asks: (p, r) => [Q.qPow('<var>S</var>', r.S, 'VA'), h.qI('<var>I</var>', r.I)],
    steps: (p, r) => step(`<var>S</var> = <var>P</var>/${cosH} = ${res(fS(r.S))}`) + step(`<var>I</var> = <var>S</var>/<var>V</var> = ${res(U(r.I, 'A'))}`, `Con cos φ = 1 basterebbero ${U(p.P / p.V, 'A')}: la potenza reattiva fa passare corrente in più senza dare lavoro utile.`),
  });
  t2.push({
    id: 'tri-z', title: 'Dall\'impedenza alle potenze', level: 2,
    gen: () => { const [a, b] = pick([[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5]]); const k = pick([1, 2, 5, 10]); return { R: a * k, X: b * k * pick([1, 1, -1]), V: pick([50, 100, 230]) }; },
    solve: (p) => { const Z = A.cx(p.R, p.X); const I = A.div(A.cx(p.V, 0), Z); const pw = A.power(A.cx(p.V, 0), I); return { Zm: A.abs(Z), Im: A.abs(I), ...pw }; },
    text: (p) => `Un carico con impedenza <b><var>Z</var></b> = ${Q.cRect(A.cx(p.R, p.X), 'Ω')} è collegato a ${p.V} V. Trova corrente, potenza attiva, reattiva e il fattore di potenza.`,
    asks: (p, r) => [h.qI('<var>I</var>', r.Im), Q.qPow('<var>P</var>', r.P, 'W'), Object.assign(Q.qPow('<var>Q</var>', r.Q, 'var'), { signNote: 'Controlla il segno: Q è negativa per un carico capacitivo.' }), { label: cosH, unit: '', value: r.cos }],
    steps: (p, r) => step(`|<var>Z</var>| = √(${p.R}² + ${p.X}²) = ${U(r.Zm, 'Ω')}; <var>I</var> = <var>V</var>/|<var>Z</var>| = ${res(U(r.Im, 'A'))}`) +
      step(`<var>P</var> = <var>R</var> <var>I</var>² = ${res(fP(r.P))}; <var>Q</var> = <var>X</var> <var>I</var>² = ${res(fQ(r.Q))}`, 'Ogni parte dell\'impedenza "produce" la sua potenza.') +
      step(`${cosH} = <var>R</var>/|<var>Z</var>| = ${res(N(r.cos, 3))}`, 'Il triangolo delle potenze è il triangolo delle impedenze moltiplicato per I².'),
  });
  t2.push({
    id: 'tri-mc', title: 'Concetti sul triangolo', level: 1,
    ...mc([
      ['La potenza apparente S si misura in…', ['voltampere (VA)', 'watt (W)', 'var', 'joule'], 'Unità diverse per non confondere le tre potenze: W per P, var per Q, VA per S.'],
      ['Nel triangolo delle potenze, S è…', ['l\'ipotenusa: √(P² + Q²)', 'la somma P + Q', 'un cateto', 'la differenza P − Q'], 'P e Q sono i cateti.'],
      ['I trasformatori e i generatori si dimensionano in kVA perché…', ['scaldano in base alla corrente, cioè a S', 'la potenza attiva non conta', 'è un\'abitudine', 'i kVA sono più piccoli dei kW'], 'I cavi e gli avvolgimenti devono portare tutta la corrente, anche quella "reattiva".'],
      ['Un carico con cos φ = 1 è…', ['puramente resistivo', 'puramente induttivo', 'puramente capacitivo', 'spento'], 'φ = 0: corrente in fase, Q = 0, S = P.'],
    ]),
  });

  function widgetTri(host) {
    const c = K.widgetCard('Il triangolo delle potenze', 'Carico a 230 V: potenza attiva e fattore di potenza');
    let cap = false;
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-c="0">Induttivo</button><button type="button" data-c="1">Capacitivo</button>';
    const grid = el('div', 'q-two');
    const fig = el('div');
    const out = el('div', 'forms');
    grid.append(fig, out);
    let last;
    const draw = (v) => {
      last = v;
      const t = A.triangle(v.P * 1000, v.c, cap);
      fig.innerHTML = triSVG([{ P: t.P, Q: t.Q }], { arc: true });
      out.innerHTML = `<div class="form-row"><span class="label">Potenze</span><div class="f"><var>P</var> = ${fP(t.P)}; <var>Q</var> = ${fQ(t.Q)}; <var>S</var> = ${res(fS(t.S))}</div><span class="meta">φ = ${N(t.deg, 3)}°</span></div>
        <div class="form-row"><span class="label">Corrente a 230 V</span><div class="f"><var>I</var> = <var>S</var>/<var>V</var> = ${res(U(t.S / 230, 'A'))}</div><span class="meta">Con cos φ = 1 basterebbero ${U(t.P / 230, 'A')}.</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.c === '1') === cap)));
    };
    const sl = K.sliders(c, [
      { id: 'P', label: '<var>P</var> (kW)', min: 0.5, max: 10, step: 0.1, value: 3 },
      { id: 'c', label: 'cos φ', min: 0.3, max: 1, step: 0.01, value: 0.8, sig: 2 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { cap = b.dataset.c === '1'; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(grid);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'triangolo', num: 2, short: 'Triangolo', title: 'Il triangolo delle potenze',
    intro: 'Accanto alla potenza attiva ci sono la potenza reattiva, che va avanti e indietro tra rete e carico, e la potenza apparente, quella che i cavi devono comunque trasportare. Stanno sui lati di un triangolo rettangolo.',
    goals: ['P, Q, S e le loro unità', 'cos φ', 'Corrente di linea', 'Dall\'impedenza alle potenze'],
    widgets: [widgetTri],
    example: t2[0], exampleTitle: 'Esempio: un motore da 3 kW',
    families: t2,
    theory: `
      <article class="note"><h4>Le tre potenze</h4>
        <div class="eq"><span><var>P</var> = <var>V</var><var>I</var> cos φ [W]</span><span><var>Q</var> = <var>V</var><var>I</var> sin φ [var]</span><span><var>S</var> = <var>V</var><var>I</var> = √(<var>P</var>² + <var>Q</var>²) [VA]</span></div>
        <p>In forma complessa: <b><var>S</var></b> = <b><var>V</var></b> · <b><var>I</var></b>* = <var>P</var> + j<var>Q</var>. Q è positiva per i carichi induttivi, negativa per quelli capacitivi.</p></article>
      <article class="note"><h4>Con l'impedenza</h4>
        <p><var>P</var> = <var>R</var><var>I</var>², <var>Q</var> = <var>X</var><var>I</var>², <var>S</var> = |<var>Z</var>|<var>I</var>²: il triangolo delle potenze è quello delle impedenze moltiplicato per <var>I</var>².</p></article>`,
  });

  // =====================================================================
  // 3 — Boucherot
  // =====================================================================
  const b3 = [];
  b3.push({
    id: 'bou-sum', title: 'Più carichi sulla stessa linea', level: 2,
    defaults: { loads: [{ P: 2000, c: 1, cap: false }, { P: 3000, c: 0.7, cap: false }], V: 230 },
    gen: () => {
      const n = pick([2, 2, 3]);
      return { V: 230, loads: Array.from({ length: n }, () => ({ P: pick([500, 1000, 1500, 2000, 3000]), c: pick([1, 0.6, 0.7, 0.8, 0.9]), cap: Math.random() < 0.15 })) };
    },
    solve: (p) => { const ls = p.loads.map((l) => A.triangle(l.P, l.c, l.cap)); const t = A.boucherot(ls); return { ls, ...t, I: t.S / p.V }; },
    text: (p) => `Sulla stessa linea a ${p.V} V sono collegati: ${p.loads.map((l, i) => `carico ${i + 1} da ${fP(l.P)} con cos φ = ${N(l.c)}${l.c < 1 ? (l.cap ? ' (capacitivo)' : ' (induttivo)') : ''}`).join('; ')}. Trova la potenza attiva e reattiva totali, il fattore di potenza complessivo e la corrente di linea.`,
    fig: (p, r, sol) => ({ svg: sol ? triSVG(r.ls.map((l, i) => ({ P: l.P, Q: l.Q, cls: ['p1', 'p2', 'p3'][i] }))) : '' }),
    asks: (p, r) => [Q.qPow('<var>P</var><sub>tot</sub>', r.P, 'W'), Object.assign(Q.qPow('<var>Q</var><sub>tot</sub>', r.Q, 'var'), { signNote: 'Controlla il segno delle potenze reattive capacitive.' }), { label: cosH + ' totale', unit: '', value: r.cos }, h.qI('<var>I</var>', r.I)],
    hint: () => 'Teorema di Boucherot: si sommano separatamente le potenze attive e quelle reattive (con il loro segno). Le apparenti no.',
    steps: (p, r) => r.ls.map((l, i) => step(`Carico ${i + 1}: <var>Q</var><sub>${i + 1}</sub> = <var>P</var> tan φ = ${N(l.P)} · ${N(Math.tan(Math.abs(l.deg) * A.D2R), 3)} = ${fQ(l.Q)}`)).join('') +
      step(`<var>P</var><sub>tot</sub> = ${r.ls.map((l) => N(l.P)).join(' + ')} = ${res(fP(r.P))}; <var>Q</var><sub>tot</sub> = ${res(fQ(r.Q))}`, 'Boucherot: attive con attive, reattive con reattive.') +
      step(`<var>S</var><sub>tot</sub> = √(<var>P</var>² + <var>Q</var>²) = ${fS(r.S)}; ${cosH} = <var>P</var>/<var>S</var> = ${res(N(r.cos, 3))}`, (new Set(r.ls.map((l) => Math.round(l.deg * 1000))).size === 1
        ? `Qui tutti i carichi hanno lo stesso cos φ: solo in questo caso anche le apparenti si sommano (${r.ls.map((l) => N(l.S, 3)).join(' + ')} = ${N(r.S, 4)} VA). In generale no.`
        : `Le potenze apparenti NON si sommano: ${r.ls.map((l) => N(l.S, 3)).join(' + ')} = ${N(r.ls.reduce((s, l) => s + l.S, 0), 4)} VA, non ${N(r.S, 4)}.`)) +
      step(`<var>I</var> = <var>S</var>/<var>V</var> = ${res(U(r.I, 'A'))}`),
  });
  b3.push({
    id: 'bou-motor', title: 'Il motore: rendimento e cos φ', level: 2,
    gen: () => ({ Pm: pick([0.75, 1.1, 1.5, 2.2, 3, 4]) * 1000, eta: pick([0.75, 0.8, 0.85, 0.9]), c: pick([0.7, 0.75, 0.8, 0.85]), V: 230 }),
    solve: (p) => { const P = p.Pm / p.eta; const t = A.triangle(P, p.c); return { P, ...t, I: t.S / p.V }; },
    text: (p) => `Un motore monofase rende ${fP(p.Pm)} all'albero, con rendimento η = ${N(p.eta)} e ${cosH} = ${N(p.c)}, alimentato a ${p.V} V. Quanta potenza attiva assorbe dalla rete? Quanto vale la potenza reattiva e la corrente?`,
    asks: (p, r) => [Q.qPow('<var>P</var><sub>ass</sub>', r.P, 'W'), Q.qPow('<var>Q</var>', r.Q, 'var'), h.qI('<var>I</var>', r.I)],
    steps: (p, r) => step(`<var>P</var><sub>ass</sub> = ${frac('<var>P</var><sub>resa</sub>', 'η')} = ${frac(fP(p.Pm), N(p.eta))} = ${res(fP(r.P))}`, 'La potenza di targa di un motore è quella meccanica resa; le perdite si pagano lo stesso.') +
      step(`<var>Q</var> = <var>P</var><sub>ass</sub> tan φ = ${res(fQ(r.Q))}`) + step(`<var>I</var> = ${frac('<var>P</var><sub>ass</sub>', '<var>V</var> ' + cosH)} = ${res(U(r.I, 'A'))}`),
  });
  b3.push({
    id: 'bou-mc', title: 'Concetti su Boucherot', level: 1,
    ...mc([
      ['Per più carichi in parallelo, il teorema di Boucherot dice che…', ['le potenze attive si sommano tra loro e le reattive tra loro', 'si sommano le potenze apparenti', 'si sommano i fattori di potenza', 'conta solo il carico più grande'], 'Vale qualunque sia il collegamento, purché si sommino P con P e Q con Q.'],
      ['Aggiungendo un carico capacitivo a uno induttivo, la potenza reattiva totale…', ['diminuisce', 'aumenta', 'resta uguale', 'diventa sempre zero'], 'Le Q hanno segni opposti: si compensano. È l\'idea del rifasamento.'],
      ['Si possono sommare le potenze apparenti di due carichi?', ['solo se hanno lo stesso cos φ', 'sempre', 'mai, nemmeno con lo stesso cos φ', 'solo se sono resistivi'], 'Con lo stesso φ i triangoli sono simili e le ipotenuse si allineano.'],
    ]),
  });

  const DEV = [
    { n: 'Lampade', P: 600, c: 1 },
    { n: 'Forno', P: 2000, c: 1 },
    { n: 'Lavatrice', P: 1200, c: 0.7 },
    { n: 'Condizionatore', P: 1500, c: 0.8 },
    { n: 'Pompa', P: 750, c: 0.65 },
    { n: 'Condensatore di rifasamento', P: 0, Qc: -1200 },
  ];
  function widgetBou(host) {
    const c = K.widgetCard('Boucherot in casa', 'Accendi e spegni gli apparecchi: i triangoli si sommano');
    const on = [true, false, true, false, true, false];
    const seg = el('div', 'seg');
    seg.innerHTML = DEV.map((d, i) => `<button type="button" data-i="${i}">${d.n}</button>`).join('');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const out = el('div', 'forms');
    grid.append(fig, out);
    const draw = () => {
      const loads = DEV.map((d, i) => ({ d, i })).filter((x) => on[x.i]).map(({ d, i }) => (d.Qc ? { P: 0, Q: d.Qc, cls: 'p3', n: d.n } : { ...A.triangle(d.P, d.c), cls: ['p1', 'p2', 'p1', 'p2', 'p1'][i], n: d.n }));
      const t = loads.length ? A.boucherot(loads) : { P: 0, Q: 0, S: 0, cos: 1 };
      fig.innerHTML = loads.length ? triSVG(loads, { parts: false }) : '<p class="hint">Nessun apparecchio acceso.</p>';
      out.innerHTML = `<div class="form-row"><span class="label">Totale</span><div class="f"><var>P</var> = ${fP(t.P)}; <var>Q</var> = ${fQ(t.Q)}; <var>S</var> = ${fS(t.S)}</div><span class="meta">cos φ = ${t.S ? N(t.cos, 3) : '—'}${t.Q < 0 ? ' (capacitivo)' : ''}</span></div>
        <div class="form-row"><span class="label">Corrente a 230 V</span><div class="f"><var>I</var> = ${res(U(t.S / 230, 'A'))}</div><span class="meta">Somma delle apparenti: ${fS(loads.reduce((s, l) => s + Math.hypot(l.P, l.Q), 0))}, più del totale vero.</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(on[Number(b.dataset.i)])));
    };
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { const i = Number(b.dataset.i); on[i] = !on[i]; draw(); } });
    c.append(seg, grid);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'boucherot', num: 3, short: 'Boucherot', title: 'Più carichi: il teorema di Boucherot',
    intro: 'Un impianto ha tanti carichi diversi: lampade, motori, elettronica. Per sapere quanta corrente passa nella linea non si sommano le correnti né le potenze apparenti, ma separatamente le potenze attive e quelle reattive.',
    goals: ['Somma di P e di Q', 'cos φ dell\'impianto', 'Motori: rendimento e cos φ'],
    widgets: [widgetBou],
    example: b3[0], exampleTitle: 'Esempio: forno e motore sulla stessa linea',
    families: b3,
    theory: `
      <article class="note"><h4>Teorema di Boucherot</h4>
        <div class="eq"><span><var>P</var><sub>tot</sub> = Σ <var>P</var><sub>k</sub></span><span><var>Q</var><sub>tot</sub> = Σ <var>Q</var><sub>k</sub></span><span><var>S</var><sub>tot</sub> = √(<var>P</var><sub>tot</sub>² + <var>Q</var><sub>tot</sub>²)</span></div>
        <p>Le Q vanno sommate con il segno: positive le induttive, negative le capacitive. Poi cos φ = <var>P</var><sub>tot</sub>/<var>S</var><sub>tot</sub> e <var>I</var> = <var>S</var><sub>tot</sub>/<var>V</var>.</p></article>
      <article class="note"><h4>Il motore</h4>
        <p>La potenza di targa è quella meccanica resa. Dalla rete assorbe <var>P</var> = <var>P</var><sub>resa</sub>/η, con un cos φ tipico tra 0,7 e 0,85.</p></article>`,
  });

  // =====================================================================
  // 4 — Rifasamento
  // =====================================================================
  const f4 = [];
  f4.push({
    id: 'rif-c', title: 'Il condensatore di rifasamento', level: 2,
    defaults: { P: 3000, c1: 0.7, c2: 0.95, V: 230, f: 50 },
    gen: () => ({ P: pick([1000, 1500, 2000, 3000, 4000, 5000]), c1: pick([0.6, 0.65, 0.7, 0.75, 0.8]), c2: pick([0.9, 0.95, 1]), V: 230, f: 50 }),
    solve: (p) => A.powerFactor(p.P, p.c1, p.c2, p.V, p.f),
    text: (p) => `Un carico da ${fP(p.P)} con ${cosH} = ${N(p.c1)} è alimentato a ${p.V} V, ${p.f} Hz. Si vuole portare il fattore di potenza a ${N(p.c2)}. Quanta potenza reattiva deve fornire il condensatore, e quanto vale la sua capacità?`,
    fig: (p, r, sol) => ({ svg: sol ? triSVG([{ P: p.P, Q: p.P * tanOf(p.c1), cls: 'p1' }, { P: 0, Q: -r.Qc, cls: 'p3' }], { parts: false }) : '' }),
    asks: (p, r) => [Q.qPow('<var>Q</var><sub>C</sub>', r.Qc, 'var'), Q.qC('<var>C</var>', r.C)],
    hint: () => 'La potenza attiva non cambia: il condensatore toglie solo potenza reattiva. Q_C = P (tan φ₁ − tan φ₂).',
    steps: (p, r) => step(`tan φ<sub>1</sub> = tan(arccos ${N(p.c1)}) = ${N(tanOf(p.c1), 4)}; tan φ<sub>2</sub> = ${N(tanOf(p.c2), 4)}`) +
      step(`<var>Q</var><sub>C</sub> = <var>P</var>(tan φ<sub>1</sub> − tan φ<sub>2</sub>) = ${N(p.P)} · (${N(tanOf(p.c1), 4)} − ${N(tanOf(p.c2), 4)}) = ${res(fQ(r.Qc))}`, 'Prima Q era P tan φ₁, dopo deve essere P tan φ₂: la differenza la fornisce il condensatore.') +
      step(`<var>C</var> = ${frac('<var>Q</var><sub>C</sub>', 'ω <var>V</var>²')} = ${frac(fQ(r.Qc), '314,2 · ' + p.V + '²')} = ${res(App.si(r.C, 'F', 4))}`, 'Viene da Q_C = V²/X_C = ωCV².'),
  });
  f4.push({
    id: 'rif-i', title: 'Quanta corrente si risparmia', level: 1,
    gen: () => ({ P: pick([1000, 2000, 3000, 4600]), c1: pick([0.6, 0.7, 0.75, 0.8]), c2: pick([0.9, 0.95, 1]), V: 230 }),
    solve: (p) => { const I1 = p.P / (p.V * p.c1); const I2 = p.P / (p.V * p.c2); return { I1, I2, red: (100 * (I1 - I2)) / I1 }; },
    text: (p) => `Un carico da ${fP(p.P)} a ${p.V} V ha ${cosH} = ${N(p.c1)}. Dopo il rifasamento il fattore di potenza è ${N(p.c2)}. Quanto vale la corrente di linea prima e dopo? Di che percentuale si riduce?`,
    asks: (p, r) => [h.qI('<var>I</var><sub>1</sub>', r.I1), h.qI('<var>I</var><sub>2</sub>', r.I2), { label: 'Riduzione', unit: '%', value: r.red }],
    steps: (p, r) => step(`<var>I</var><sub>1</sub> = ${frac('<var>P</var>', '<var>V</var> cos φ<sub>1</sub>')} = ${res(U(r.I1, 'A'))}; <var>I</var><sub>2</sub> = ${res(U(r.I2, 'A'))}`) +
      step(`Riduzione = ${frac('<var>I</var><sub>1</sub> − <var>I</var><sub>2</sub>', '<var>I</var><sub>1</sub>')} = ${res(N(r.red, 3) + ' %')}`, `Le perdite nei cavi (R I²) scendono ancora di più: del ${N(100 * (1 - (r.I2 / r.I1) ** 2), 3)} %.`),
  });
  f4.push({
    id: 'rif-new', title: 'Con questo condensatore, che cos φ?', level: 3,
    gen: () => ({ P: pick([1000, 2000, 3000]), c1: pick([0.6, 0.7, 0.75]), C: pick([22, 33, 47, 68, 100]) * 1e-6, V: 230, f: 50 }),
    solve: (p) => { const Q1 = p.P * tanOf(p.c1); const Qc = A.TAU * p.f * p.C * p.V * p.V; const Q2 = Q1 - Qc; return { Q1, Qc, Q2, c2: p.P / Math.hypot(p.P, Q2) }; },
    text: (p) => `A un carico da ${fP(p.P)} con ${cosH} = ${N(p.c1)} (${p.V} V, ${p.f} Hz) si collega in parallelo un condensatore da ${App.si(p.C, 'F')}. Quanto diventa il fattore di potenza?`,
    asks: (p, r) => [Q.qPow('<var>Q</var><sub>C</sub>', r.Qc, 'var'), { label: cosH + ' nuovo', unit: '', value: r.c2 }],
    steps: (p, r) => step(`<var>Q</var><sub>C</sub> = ω<var>C</var><var>V</var>² = 314,2 · ${App.si(p.C, 'F')} · ${p.V}² = ${res(fQ(r.Qc))}`) +
      step(`<var>Q</var> = <var>P</var> tan φ<sub>1</sub> − <var>Q</var><sub>C</sub> = ${fQ(r.Q1)} − ${fQ(r.Qc)} = ${fQ(r.Q2)}`, r.Q2 < 0 ? 'Troppa capacità: il carico diventa capacitivo (sovrarifasamento).' : 'Boucherot: le reattive si sommano con il segno.') +
      step(`${cosH} = ${frac('<var>P</var>', '√(<var>P</var>² + <var>Q</var>²)')} = ${res(N(r.c2, 3))}`),
  });
  f4.push({
    id: 'rif-mc', title: 'Perché rifasare', level: 1,
    ...mc([
      ['Il rifasamento serve a…', ['ridurre la corrente di linea a parità di potenza attiva', 'aumentare la potenza attiva del carico', 'aumentare la tensione', 'far consumare meno al motore'], 'Il motore consuma la stessa potenza attiva; diminuisce solo la potenza reattiva che viaggia sui cavi.'],
      ['Per rifasare un carico induttivo si collega…', ['un condensatore in parallelo', 'un induttore in serie', 'un resistore in parallelo', 'un condensatore in serie'], 'In parallelo non cambia la tensione sul carico.'],
      ['Perché un\'azienda con molti motori installa un rifasatore?', ['per ridurre le perdite e non pagare l\'energia reattiva in eccesso', 'per far girare i motori più veloci', 'per aumentare la tensione di rete', 'per consumare più potenza attiva'], 'Sotto un certo cos φ medio il distributore fa pagare l\'energia reattiva; i valori di soglia li fissa l\'autorità per l\'energia.'],
      ['Se si mette troppa capacità…', ['il carico diventa capacitivo e la corrente torna a salire', 'il cos φ supera 1', 'non succede nulla', 'la potenza attiva aumenta'], 'cos φ non può superare 1: oltre si passa dall\'altra parte del triangolo.'],
    ]),
  });

  function widgetRif(host) {
    const c = K.widgetCard('Rifasamento', 'Carico a 230 V, 50 Hz: scegli il cos φ di partenza e quello da raggiungere');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const out = el('div', 'forms');
    grid.append(fig, out);
    const draw = (v) => {
      const P = v.P * 1000;
      const c2 = Math.max(v.c2, v.c1);
      const r = A.powerFactor(P, v.c1, c2, 230, 50);
      const Q1 = P * tanOf(v.c1);
      fig.innerHTML = Q.phasorSVG({ W: 300, H: 260, vecs: [{ z: A.cx(P, Q1), label: 'S₁', cls: 'p1' }, { from: A.cx(P, Q1), z: A.cx(0, -r.Qc), label: 'Q_C', cls: 'p3' }, { z: A.cx(P, Q1 - r.Qc), label: 'S₂', cls: 'ps' }, { z: A.cx(P, 0), label: 'P', cls: 'p2', dash: true }], title: 'Triangolo prima e dopo il rifasamento' }).replace(/Q_C/g, 'Q<tspan class="sb" dy="3">C</tspan>');
      out.innerHTML = `<div class="form-row"><span class="label">Condensatore</span><div class="f"><var>Q</var><sub>C</sub> = ${fQ(r.Qc)} → <var>C</var> = ${res(App.si(r.C, 'F', 3))}</div></div>
        <div class="form-row"><span class="label">Corrente di linea</span><div class="f">${U(r.I1, 'A')} → ${res(U(r.I2, 'A'))}</div><span class="meta">−${N((100 * (r.I1 - r.I2)) / r.I1, 3)} % di corrente, −${N(100 * (1 - (r.I2 / r.I1) ** 2), 3)} % di perdite nei cavi. La potenza attiva resta ${fP(P)}.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'P', label: '<var>P</var> (kW)', min: 0.5, max: 10, step: 0.1, value: 3 },
      { id: 'c1', label: 'cos φ prima', min: 0.4, max: 0.95, step: 0.01, value: 0.7, sig: 2 },
      { id: 'c2', label: 'cos φ dopo', min: 0.8, max: 1, step: 0.01, value: 0.95, sig: 2 },
    ], draw);
    c.append(grid);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'rifasamento', num: 4, short: 'Rifasamento', title: 'Il rifasamento',
    intro: 'I motori e i trasformatori assorbono potenza reattiva induttiva, che fa passare corrente inutile nei cavi. Un condensatore in parallelo la fornisce sul posto: la linea porta meno corrente e il fattore di potenza sale.',
    goals: ['Q_C = P (tan φ₁ − tan φ₂)', 'Capacità di rifasamento', 'Risparmio di corrente e perdite'],
    widgets: [widgetRif],
    example: f4[0], exampleTitle: 'Esempio: rifasare un motore',
    families: f4,
    theory: `
      <article class="note"><h4>Il calcolo</h4>
        <div class="eq"><span><var>Q</var><sub>C</sub> = <var>P</var>(tan φ<sub>1</sub> − tan φ<sub>2</sub>)</span><span><var>C</var> = ${frac('<var>Q</var><sub>C</sub>', 'ω<var>V</var>²')}</span></div>
        <p>La potenza attiva non cambia. In trifase con i condensatori a triangolo la capacità di ognuno è un terzo di quella calcolata con la tensione concatenata (lo vedrai con i sistemi trifase).</p></article>
      <article class="note"><h4>Perché conviene</h4>
        <ul><li>Meno corrente a parità di potenza: cavi e trasformatori più piccoli.</li><li>Perdite R<var>I</var>² e cadute di tensione ridotte.</li><li>Niente penali per l'energia reattiva in bolletta.</li></ul></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'pot', year: '4', yearLabel: '4ª', title: 'Potenze in alternata e rifasamento', route: 'pot-attiva', lessonWord: 'Lezione',
    desc: 'Potenza istantanea e attiva, triangolo delle potenze, teorema di Boucherot, rifasamento con i condensatori.',
    lessons,
  });
})();
