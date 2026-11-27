/* 4ª — Filtri passivi e diagrammi di Bode */
(function () {
  'use strict';
  const App = window.App;
  const A = window.AC;
  const L = App.Lessons;
  const K = App.CC;
  const h = K.h;
  const Q = App.Q;
  const S = App.Schem.T;
  const { N, U, frac, step, res } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const mc = App.B.mc;
  const lessons = [];
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const qdB = (label, x) => ({ label, unit: 'dB', value: x, signNote: 'Controlla il segno: un\'attenuazione (guadagno minore di 1) è in dB negativi.' });
  const KIND = { lp: 'passa-basso', hp: 'passa-alto' };
  const fc_ = '<var>f</var><sub>t</sub>';

  /** Bode di modulo (e fase) di un filtro, con asintoti e un cursore. */
  function bodeSVG(o) {
    const fmin = o.fmin;
    const fmax = o.fmax;
    const H = (f) => (o.fn ? o.fn(f) : A.H(o.kind, f, o.fc));
    const mag = Q.logChart({ W: 520, H: 200, fmin, fmax, ymin: o.ymin || -60, ymax: 10, ystep: 10, yu: 'dB' });
    let b = '';
    if (o.asym) b += `<path class="asym" d="${mag.path(o.asym)}"/>`;
    b += `<path class="gen" d="${mag.path((f) => A.dB(A.abs(H(f))))}"/>`;
    (o.marks || []).forEach((m) => { b += `<line class="guide" x1="${mag.X(m.f)}" y1="${mag.Y(10)}" x2="${mag.X(m.f)}" y2="${mag.Y(o.ymin || -60)}"/>` + (m.label ? `<text class="wlbl" x="${mag.X(m.f) + 4}" y="${mag.Y(8)}">${m.label.replace(/<sub>(.*?)<\/sub>/g, '<tspan class="sb" dy="3">$1</tspan>')}</text>` : ''); });
    if (o.cur) { const y = A.dB(A.abs(H(o.cur))); b += `<circle class="op" cx="${mag.X(o.cur)}" cy="${mag.Y(Math.max(y, (o.ymin || -60) - 2))}" r="5"/>`; }
    let s = mag.wrap(b, 'Diagramma di Bode del modulo');
    if (o.phase !== false) {
      const ph = Q.logChart({ W: 520, H: 160, fmin, fmax, ymin: -90, ymax: 90, ystep: 45, yu: '°' });
      let pb = '';
      if (o.asymPh) pb += `<path class="asym" d="${ph.path(o.asymPh)}"/>`;
      pb += `<path class="load" d="${ph.path((f) => A.argDeg(H(f)))}"/>`;
      if (o.cur) pb += `<circle class="op" cx="${ph.X(o.cur)}" cy="${ph.Y(A.argDeg(H(o.cur)))}" r="5"/>`;
      s += ph.wrap(pb, 'Diagramma di Bode della fase');
    }
    return s;
  }

  // =====================================================================
  // 1 — Decibel
  // =====================================================================
  const d1 = [];
  d1.push({
    id: 'db-v', title: 'Guadagno in decibel', level: 1,
    defaults: { vin: 0.1, vout: 2, m: 0 },
    gen: () => {
      const m = rand(0, 2);
      if (m === 2) return { m, db: pick([-40, -20, -12, -6, -3, 3, 6, 10, 20, 26, 40]) };
      const vin = pick([0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]);
      return { m, vin, vout: vin * pick([0.01, 0.1, 0.25, 0.5, 2, 4, 5, 10, 20, 50, 100]) };
    },
    solve: (p) => (p.m === 2 ? { Av: A.fromdB(p.db) } : { Av: p.vout / p.vin, db: A.dB(p.vout / p.vin) }),
    text: (p, r) => (p.m === 2
      ? `Uno stadio ha un guadagno di tensione di ${p.db} dB. Quante volte ${p.db >= 0 ? 'amplifica' : 'riduce'} la tensione? (Dai il rapporto <var>V</var><sub>out</sub>/<var>V</var><sub>in</sub>.)`
      : `Un circuito riceve ${App.si(p.vin, 'V')} in ingresso e dà ${App.si(p.vout, 'V')} in uscita. Quanto vale il guadagno di tensione, come rapporto e in decibel?`),
    asks: (p, r) => (p.m === 2 ? [{ label: '<var>A</var><sub>v</sub>', unit: '', value: r.Av }] : [{ label: '<var>A</var><sub>v</sub>', unit: '', value: r.Av }, qdB('<var>A</var><sub>v</sub> in dB', r.db)]),
    steps: (p, r) => (p.m === 2
      ? step(`<var>A</var><sub>v</sub> = 10<sup>dB/20</sup> = 10<sup>${N(p.db / 20, 3)}</sup> = ${res(N(r.Av, 4))}`, 'Si divide per 20 perché il guadagno in dB delle tensioni è 20 log.')
      : step(`<var>A</var><sub>v</sub> = ${frac('<var>V</var><sub>out</sub>', '<var>V</var><sub>in</sub>')} = ${res(N(r.Av, 4))}`) + step(`<var>A</var><sub>v</sub>(dB) = 20 log<sub>10</sub>(${N(r.Av, 4)}) = ${res(N(r.db, 4) + ' dB')}`, r.Av < 1 ? 'Rapporto minore di 1: dB negativi (attenuazione).' : 'Ogni fattore 10 vale +20 dB; ogni raddoppio circa +6 dB.')),
  });
  d1.push({
    id: 'db-p', title: 'Decibel di potenza', level: 1,
    gen: () => ({ pin: pick([0.001, 0.01, 0.1, 1]), r: pick([2, 4, 10, 100, 1000, 0.5, 0.1]) }),
    solve: (p) => ({ pout: p.pin * p.r, db: A.dBp(p.r) }),
    text: (p, r) => `Un amplificatore riceve ${App.si(p.pin, 'W')} e ne fornisce ${App.si(r.pout, 'W')}. Quanto vale il guadagno di potenza in decibel?`,
    asks: (p, r) => [qdB('<var>G</var><sub>p</sub>', r.db)],
    steps: (p, r) => step(`<var>G</var><sub>p</sub> = 10 log<sub>10</sub>(${frac('<var>P</var><sub>out</sub>', '<var>P</var><sub>in</sub>')}) = 10 log<sub>10</sub>(${N(p.r)}) = ${res(N(r.db, 4) + ' dB')}`, 'Per le potenze si usa 10 log, per tensioni e correnti 20 log (perché P è proporzionale a V²): così lo stesso circuito dà lo stesso numero di dB.'),
  });
  d1.push({
    id: 'db-chain', title: 'Stadi in cascata', level: 2,
    gen: () => ({ vin: pick([1, 5, 10, 50, 100]) * 1e-3, g: [pick([20, 26, 30, 40]), pick([-6, -10, -20, -3]), pick([6, 10, 20])].slice(0, pick([2, 3])) }),
    solve: (p) => { const tot = p.g.reduce((a, b) => a + b, 0); return { tot, vout: p.vin * A.fromdB(tot) }; },
    text: (p) => `Un segnale di ${App.si(p.vin, 'V')} attraversa in cascata ${p.g.length} stadi con guadagni di ${p.g.map((x) => (x > 0 ? '+' : '') + x + ' dB').join(', ')}. Quanto vale il guadagno totale? E la tensione d'uscita?`,
    asks: (p, r) => [qdB('<var>A</var><sub>tot</sub>', r.tot), h.qV('<var>V</var><sub>out</sub>', r.vout)],
    steps: (p, r) => step(`<var>A</var><sub>tot</sub> = ${p.g.map((x) => '(' + (x > 0 ? '+' : '') + x + ')').join(' + ')} = ${res(r.tot + ' dB')}`, 'Il bello dei decibel: in cascata i guadagni si moltiplicano, i dB si sommano.') +
      step(`<var>V</var><sub>out</sub> = <var>V</var><sub>in</sub> · 10<sup>${r.tot}/20</sup> = ${App.si(p.vin, 'V')} · ${N(A.fromdB(r.tot), 4)} = ${res(U(r.vout, 'V'))}`),
  });
  d1.push({
    id: 'db-mc', title: 'Concetti sui decibel', level: 1,
    ...mc([
      ['Un guadagno di tensione di 20 dB corrisponde a…', ['10 volte', '20 volte', '100 volte', '2 volte'], '20 log 10 = 20.'],
      ['−3 dB in tensione corrispondono a circa…', ['0,707 volte (1/√2)', '0,5 volte', '0,3 volte', '3 volte'], 'È il punto che definisce la frequenza di taglio: la potenza è la metà.'],
      ['Raddoppiare la tensione vuol dire circa…', ['+6 dB', '+3 dB', '+2 dB', '+20 dB'], '20 log 2 ≈ 6,02.'],
      ['Perché si usano i dB?', ['comprimono numeri molto diversi e in cascata si sommano', 'sono più precisi', 'sono un\'unità del Sistema Internazionale', 'servono solo per l\'audio'], 'Dalle frazioni di microvolt ai kilovolt: con i dB bastano numeri piccoli.'],
    ]),
  });

  function widgetDB(host) {
    const c = K.widgetCard('Rapporti e decibel', 'Muovi il rapporto: guarda come cresce il valore in dB');
    const out = el('div', 'forms');
    const ruler = el('div');
    const draw = (v) => {
      const r = v.r;
      const dv = A.dB(r);
      const dp = A.dBp(r);
      const ch = Q.logChart({ W: 520, H: 140, fmin: 0.01, fmax: 1000, ymin: -40, ymax: 60, ystep: 20, yu: '', xfmt: (x) => N(x) });
      const body = `<path class="gen" d="${ch.path((x) => A.dB(x))}"/><circle class="op" cx="${ch.X(r)}" cy="${ch.Y(dv)}" r="5"/>`;
      ruler.innerHTML = ch.wrap(body, 'Rapporto (asse logaritmico) e decibel');
      out.innerHTML = `<div class="form-row"><span class="label">Tensioni o correnti</span><div class="f">20 log<sub>10</sub>(${N(r, 3)}) = ${res(N(dv, 3) + ' dB')}</div></div>
        <div class="form-row"><span class="label">Potenze</span><div class="f">10 log<sub>10</sub>(${N(r, 3)}) = ${N(dp, 3)} dB</div><span class="meta">Ogni decade (×10) aggiunge 20 dB alla tensione: sull'asse logaritmico la curva è una retta.</span></div>`;
    };
    const sl = K.sliders(c, [{ id: 'r', label: 'Rapporto <var>V</var><sub>out</sub>/<var>V</var><sub>in</sub>', min: 0.01, max: 1000, log: true, value: 2 }], draw);
    c.append(ruler, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'db', num: 1, short: 'Decibel', title: 'Decibel e scale logaritmiche',
    intro: 'Guadagni e attenuazioni coprono moltissimi ordini di grandezza. I decibel li comprimono in numeri comodi e trasformano i prodotti in somme: sono il linguaggio dei filtri e degli amplificatori.',
    goals: ['dB di tensione e di potenza', 'Valori notevoli: 3, 6, 20 dB', 'Stadi in cascata'],
    widgets: [widgetDB],
    example: d1[0], exampleTitle: 'Esempio: un amplificatore',
    families: d1,
    theory: `
      <article class="note"><h4>Definizioni</h4>
        <div class="eq"><span><var>A</var><sub>dB</sub> = 20 log<sub>10</sub>(<var>V</var><sub>out</sub>/<var>V</var><sub>in</sub>)</span><span><var>G</var><sub>dB</sub> = 10 log<sub>10</sub>(<var>P</var><sub>out</sub>/<var>P</var><sub>in</sub>)</span></div>
        <p>Al contrario: <var>A</var> = 10<sup>dB/20</sup>, <var>G</var> = 10<sup>dB/10</sup>.</p></article>
      <article class="note"><h4>Da ricordare</h4>
        <table class="tbl"><tbody><tr><td>×10</td><td>+20 dB</td></tr><tr><td>×2</td><td>+6 dB</td></tr><tr><td>×√2 (1,414)</td><td>+3 dB</td></tr><tr><td>×1</td><td>0 dB</td></tr><tr><td>×0,707</td><td>−3 dB</td></tr><tr><td>×0,1</td><td>−20 dB</td></tr></tbody></table></article>`,
  });

  // =====================================================================
  // 2 — Passa-basso RC
  // =====================================================================
  const l2 = [];
  const Rs = [470, 1000, 2200, 4700, 10000, 22000];
  const Cs = [1, 2.2, 4.7, 10, 22, 47, 100];
  l2.push({
    id: 'lp-fc', title: 'Frequenza di taglio', level: 1,
    defaults: { R: 1000, C: 100e-9, m: 0 },
    gen: () => ({ R: pick(Rs), C: pick(Cs) * 1e-9 * pick([1, 10, 100]), m: rand(0, 1) }),
    solve: (p) => ({ fc: A.fcRC(p.R, p.C) }),
    text: (p, r) => (p.m === 0
      ? `Un filtro passa-basso RC ha <var>R</var> = ${App.si(p.R, 'Ω')} e <var>C</var> = ${App.si(p.C, 'F')}. Quanto vale la frequenza di taglio?`
      : `Vuoi un passa-basso RC con frequenza di taglio ${App.si(r.fc, 'Hz', 4)} usando <var>R</var> = ${App.si(p.R, 'Ω')}. Che condensatore serve?`),
    fig: (p) => S.filter({ ser: { k: 'R', name: 'R', val: p.R }, sh: { k: 'C', name: 'C', val: p.m === 0 ? p.C : '?' } }),
    asks: (p, r) => [p.m === 0 ? Q.qHz(fc_, r.fc) : Q.qC('<var>C</var>', p.C)],
    steps: (p, r) => (p.m === 0
      ? step(`${fc_} = ${frac('1', '2π<var>R</var><var>C</var>')} = ${frac('1', '6,283 · ' + App.si(p.R, 'Ω') + ' · ' + App.si(p.C, 'F'))} = ${res(App.si(r.fc, 'Hz', 4))}`, 'È la frequenza in cui X_C = R: l\'uscita scende a 1/√2 dell\'ingresso (−3 dB).')
      : step(`<var>C</var> = ${frac('1', '2π<var>R</var>' + fc_)} = ${res(App.si(p.C, 'F', 4))}`, 'Formula rigirata. Poi si sceglie il valore commerciale più vicino.')),
  });
  l2.push({
    id: 'lp-gain', title: 'Quanto passa a una frequenza', level: 2,
    gen: () => ({ fc: pick([100, 159, 500, 1000, 1590, 2000, 10000]), k: pick([0.1, 0.5, 1, 2, 3, 5, 10, 100]) }),
    solve: (p) => { const f = p.fc * p.k; const g = A.gain('lp', f, p.fc); return { f, g, db: A.dB(g), ph: A.phaseDeg('lp', f, p.fc) }; },
    text: (p, r) => `Un passa-basso RC ha la frequenza di taglio a ${App.si(p.fc, 'Hz')}. A ${App.si(r.f, 'Hz')} quanto vale il rapporto <var>V</var><sub>out</sub>/<var>V</var><sub>in</sub>, in dB, e lo sfasamento dell'uscita?`,
    asks: (p, r) => [{ label: '|<var>H</var>|', unit: '', value: r.g }, qdB('|<var>H</var>| in dB', r.db), Q.qDeg('φ', r.ph)],
    hint: () => '|H| = 1/√(1 + (f/f<sub>t</sub>)²) e φ = −arctan(f/f<sub>t</sub>).',
    steps: (p, r) => step(`<var>f</var>/${fc_} = ${N(p.k)}`) +
      step(`|<var>H</var>| = ${frac('1', '√(1 + (' + N(p.k) + ')²)')} = ${res(N(r.g, 4))} → ${res(N(r.db, 4) + ' dB')}`, p.k >= 10 ? 'Molto sopra il taglio |H| ≈ f<sub>t</sub>/f: ogni decade −20 dB.' : p.k <= 0.1 ? 'Molto sotto il taglio il segnale passa quasi tutto.' : 'Vicino al taglio conviene il calcolo esatto.') +
      step(`φ = −arctan(${N(p.k)}) = ${res(N(r.ph, 4) + '°')}`, 'L\'uscita del passa-basso è in ritardo: da 0° a −90°, −45° esattamente al taglio.'),
  });
  l2.push({
    id: 'lp-out', title: 'Il segnale d\'uscita', level: 2,
    gen: () => ({ R: pick(Rs), C: pick(Cs) * 1e-9, vin: pick([1, 2, 5, 10]), k: pick([0.5, 1, 2, 4, 10]) }),
    solve: (p) => { const fc = A.fcRC(p.R, p.C); const f = Number((fc * p.k).toPrecision(2)); const g = A.gain('lp', f, fc); return { fc, f, g, vout: p.vin * g, ph: A.phaseDeg('lp', f, fc) }; },
    text: (p, r) => `In un passa-basso RC (<var>R</var> = ${App.si(p.R, 'Ω')}, <var>C</var> = ${App.si(p.C, 'F')}) entra una sinusoide di ${p.vin} V efficaci a ${App.si(r.f, 'Hz')}. Quanto vale la tensione d'uscita e di quanto è sfasata?`,
    fig: (p) => S.filter({ ser: { k: 'R', name: 'R', val: p.R }, sh: { k: 'C', name: 'C', val: p.C } }, { vin: p.vin + ' V' }),
    asks: (p, r) => [Q.qHz(fc_, r.fc), h.qV('<var>V</var><sub>out</sub>', r.vout), Q.qDeg('φ', r.ph)],
    steps: (p, r) => step(`${fc_} = 1/(2π<var>R</var><var>C</var>) = ${res(App.si(r.fc, 'Hz', 4))}`) +
      step(`|<var>H</var>| = 1/√(1 + (<var>f</var>/${fc_})²) = 1/√(1 + ${N((r.f / r.fc) ** 2, 4)}) = ${N(r.g, 4)}`) +
      step(`<var>V</var><sub>out</sub> = ${p.vin} V · ${N(r.g, 4)} = ${res(U(r.vout, 'V'))}; φ = −arctan(<var>f</var>/${fc_}) = ${res(N(r.ph, 4) + '°')}`, 'È un partitore di tensione tra R e X_C: con i complessi viene lo stesso risultato.'),
  });
  l2.push({
    id: 'lp-mc', title: 'Concetti sul passa-basso', level: 1,
    ...mc([
      ['In un passa-basso RC, alle basse frequenze il condensatore…', ['è quasi un circuito aperto: l\'uscita ≈ ingresso', 'è un corto: l\'uscita è zero', 'amplifica il segnale', 'sfasa di 180°'], 'X_C è grande: quasi tutta la tensione resta sul condensatore, cioè in uscita.'],
      ['Alla frequenza di taglio il guadagno vale…', ['−3 dB (0,707)', '0 dB', '−20 dB', '−6 dB'], 'Lì X_C = R.'],
      ['Sopra il taglio, un passa-basso del primo ordine attenua…', ['20 dB per decade (6 dB per ottava)', '40 dB per decade', '3 dB per decade', 'niente'], 'Pendenza tipica di un polo.'],
      ['A cosa serve un passa-basso?', ['a eliminare disturbi e rumore ad alta frequenza', 'ad amplificare i bassi', 'a raddrizzare la tensione', 'a bloccare la continua'], 'Per esempio prima di un convertitore A/D (anti-aliasing).'],
    ]),
  });

  function widgetLP(host) {
    const c = K.widgetCard('Il passa-basso RC', 'Scegli R e C, poi muovi la frequenza del segnale');
    const fig = el('div');
    const wave = el('div');
    const out = el('div', 'forms');
    const draw = (v) => {
      const fc = A.fcRC(v.R * 1000, v.C * 1e-9);
      const f = v.f;
      const g = A.gain('lp', f, fc);
      const ph = A.phaseDeg('lp', f, fc);
      fig.innerHTML = bodeSVG({ kind: 'lp', fc, fmin: 10, fmax: 1e6, cur: f, marks: [{ f: fc, label: 'f<sub>t</sub>' }], asym: (x) => A.asymGain('lp', x, fc), asymPh: (x) => A.asymPhase('lp', x, fc) });
      wave.innerHTML = Q.waveSVG({ W: 520, H: 170, tmax: 2 / f, ymax: 1.2, yu: '', traces: [{ amp: 1, f, deg: 0, cls: 'p1' }, { amp: g, f, deg: ph, cls: 'p2' }], title: 'Ingresso (blu) e uscita (arancio), due periodi' });
      out.innerHTML = `<div class="form-row"><span class="label">Taglio</span><div class="f">${fc_} = 1/(2π<var>R</var><var>C</var>) = ${res(App.si(fc, 'Hz', 3))}</div></div>
        <div class="form-row"><span class="label">A ${App.si(f, 'Hz', 3)}</span><div class="f">|<var>H</var>| = ${N(g, 3)} = ${N(A.dB(g), 3)} dB; φ = ${N(ph, 3)}°</div><span class="meta">${f < fc / 3 ? 'Banda passante: il segnale esce quasi intatto.' : f > fc * 3 ? 'Banda attenuata: l\'uscita è piccola e in ritardo di quasi 90°.' : 'Vicino al taglio.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'R', label: '<var>R</var> (kΩ)', min: 0.1, max: 100, log: true, value: 1 },
      { id: 'C', label: '<var>C</var> (nF)', min: 1, max: 1000, log: true, value: 100 },
      { id: 'f', label: 'Frequenza del segnale (Hz)', min: 10, max: 1e6, log: true, value: 1000 },
    ], draw);
    c.append(fig, wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'passabasso', num: 2, short: 'Passa-basso', title: 'Il filtro passa-basso RC',
    intro: 'Un resistore e un condensatore bastano per separare i segnali lenti da quelli veloci: alle basse frequenze il condensatore lascia l\'uscita quasi uguale all\'ingresso, alle alte la cortocircuita verso massa.',
    goals: ['Frequenza di taglio', 'Modulo e fase di H', 'Tensione d\'uscita'],
    widgets: [widgetLP],
    example: l2[0], exampleTitle: 'Esempio: frequenza di taglio',
    families: l2,
    theory: `
      <article class="note"><h4>Funzione di trasferimento</h4>
        <div class="eq"><span><b><var>H</var></b> = ${frac('<b><var>V</var></b><sub>out</sub>', '<b><var>V</var></b><sub>in</sub>')} = ${frac('1', '1 + j<var>f</var>/' + fc_)}</span><span>${fc_} = ${frac('1', '2π<var>R</var><var>C</var>')}</span></div>
        <p>|<var>H</var>| = 1/√(1 + (<var>f</var>/${fc_})²), φ = −arctan(<var>f</var>/${fc_}). È un partitore tra <var>R</var> e −j<var>X</var><sub>C</sub>.</p></article>
      <article class="note"><h4>Come si comporta</h4>
        <ul><li><var>f</var> ≪ ${fc_}: |<var>H</var>| ≈ 1 (0 dB), φ ≈ 0.</li><li><var>f</var> = ${fc_}: |<var>H</var>| = 0,707 (−3 dB), φ = −45°.</li><li><var>f</var> ≫ ${fc_}: −20 dB per decade, φ → −90°.</li></ul></article>`,
  });

  // =====================================================================
  // 3 — Passa-alto e filtri RL
  // =====================================================================
  const h3 = [];
  h3.push({
    id: 'hp-fc', title: 'Taglio di RC e RL', level: 1,
    gen: () => { const t = pick(['RC', 'RL']); return { t, kind: pick(['lp', 'hp']), R: pick([10, 47, 100, 220, 470, 1000]), C: pick(Cs) * 1e-9, L: pick([1, 2.2, 4.7, 10, 22, 47, 100]) * 1e-3 }; },
    solve: (p) => ({ fc: p.t === 'RC' ? A.fcRC(p.R, p.C) : A.fcRL(p.R, p.L) }),
    text: (p) => `Un filtro ${KIND[p.kind]} ${p.t} ha <var>R</var> = ${App.si(p.R, 'Ω')} e ${p.t === 'RC' ? '<var>C</var> = ' + App.si(p.C, 'F') : '<var>L</var> = ' + App.si(p.L, 'H')}. Quanto vale la frequenza di taglio?`,
    fig: (p) => S.filter(filterParts(p.t, p.kind, p.R, p.t === 'RC' ? p.C : p.L)),
    asks: (p, r) => [Q.qHz(fc_, r.fc)],
    steps: (p, r) => step(p.t === 'RC' ? `${fc_} = ${frac('1', '2π<var>R</var><var>C</var>')} = ${res(App.si(r.fc, 'Hz', 4))}` : `${fc_} = ${frac('<var>R</var>', '2π<var>L</var>')} = ${frac(App.si(p.R, 'Ω'), '6,283 · ' + App.si(p.L, 'H'))} = ${res(App.si(r.fc, 'Hz', 4))}`, p.t === 'RC' ? 'Dove X_C = R.' : 'Dove X_L = R: 2πfL = R.') +
      step(`Il taglio è lo stesso per il passa-basso e per il passa-alto con gli stessi componenti`, 'Cambia solo da quale componente si preleva l\'uscita.'),
  });
  h3.push({
    id: 'hp-gain', title: 'Il passa-alto a una frequenza', level: 2,
    gen: () => ({ fc: pick([50, 100, 300, 1000, 2000]), k: pick([0.01, 0.1, 0.25, 0.5, 1, 2, 10]) }),
    solve: (p) => { const f = p.fc * p.k; const g = A.gain('hp', f, p.fc); return { f, g, db: A.dB(g), ph: A.phaseDeg('hp', f, p.fc) }; },
    text: (p, r) => `Un passa-alto con taglio a ${App.si(p.fc, 'Hz')} riceve un segnale a ${App.si(r.f, 'Hz')}. Quanto vale il guadagno in dB e lo sfasamento?`,
    asks: (p, r) => [qdB('|<var>H</var>| in dB', r.db), Q.qDeg('φ', r.ph)],
    hint: () => '|H| = (f/f<sub>t</sub>)/√(1 + (f/f<sub>t</sub>)²) e φ = 90° − arctan(f/f<sub>t</sub>).',
    steps: (p, r) => step(`|<var>H</var>| = ${frac(N(p.k), '√(1 + ' + N(p.k) + '²)')} = ${N(r.g, 4)} → ${res(N(r.db, 4) + ' dB')}`, p.k <= 0.1 ? 'Molto sotto il taglio: +20 dB per decade salendo, cioè forte attenuazione.' : 'Sopra il taglio il passa-alto lascia passare.') +
      step(`φ = 90° − arctan(${N(p.k)}) = ${res(N(r.ph, 4) + '°')}`, 'Nel passa-alto l\'uscita è in anticipo: da +90° a 0°.'),
  });
  h3.push({
    id: 'which-f', title: 'Che filtro è?', level: 1,
    gen: () => { const t = pick(['RC', 'RL']); const kind = pick(['lp', 'hp']); return { t, kind, o: App.shuffle([0, 1]) }; },
    solve: (p) => ({ ans: p.kind === 'lp' ? 0 : 1 }),
    text: (p) => { const fp = filterParts(p.t, p.kind, 1000, 1e-6); return `Nel filtro in figura ${fp.ser.k === 'C' ? 'il condensatore' : fp.ser.k === 'L' ? 'l\'induttore' : 'il resistore'} è in serie sul segnale e ${fp.sh.k === 'C' ? 'il condensatore' : fp.sh.k === 'L' ? 'l\'induttore' : 'il resistore'} va verso massa; l'uscita è sul componente verso massa. È un passa-basso o un passa-alto?`; },
    fig: (p) => S.filter(filterParts(p.t, p.kind, null, null)),
    asks: (p, r) => [h.choice('Tipo di filtro', ['passa-basso', 'passa-alto'], r.ans)],
    steps: (p) => { const fp = filterParts(p.t, p.kind, 1, 1); const lowShort = fp.sh.k === 'C'; const lowOpen = fp.sh.k === 'L'; return step(lowShort ? 'Alle alte frequenze il condensatore verso massa diventa un corto: l\'uscita va a zero.' : lowOpen ? 'Alle basse frequenze l\'induttore verso massa è un corto: l\'uscita va a zero.' : fp.ser.k === 'C' ? 'Alle basse frequenze il condensatore in serie è aperto: non passa niente.' : 'Alle alte frequenze l\'induttore in serie si oppone: non passa niente.', 'Pensa ai due estremi: f → 0 (C aperto, L corto) e f → ∞ (C corto, L aperto).') + step(`È un ${res(KIND[p.kind])}`); },
  });
  h3.push({
    id: 'hp-mc', title: 'Concetti su passa-alto e RL', level: 1,
    ...mc([
      ['Un condensatore in serie su un segnale…', ['blocca la continua e lascia passare l\'alternata ad alta frequenza', 'blocca le alte frequenze', 'raddoppia la tensione', 'elimina il rumore a bassa frequenza solo con un induttore'], 'È il condensatore di accoppiamento tra gli stadi di un amplificatore.'],
      ['In un filtro RL passa-basso…', ['l\'induttore è in serie e l\'uscita è sul resistore', 'l\'induttore va verso massa', 'serve un condensatore', 'la frequenza di taglio è 1/(2πRL)'], 'f<sub>t</sub> = R/(2πL).'],
      ['Alla frequenza di taglio il passa-alto sfasa l\'uscita di…', ['+45°', '−45°', '0°', '+90°'], 'In anticipo: il passa-alto anticipa, il passa-basso ritarda.'],
    ]),
  });

  /** Componenti del filtro: serie e verso massa, secondo tipo (RC/RL) e passa-basso/alto. */
  function filterParts(t, kind, R, X) {
    const r = { k: 'R', name: 'R', val: R };
    const x = t === 'RC' ? { k: 'C', name: 'C', val: X } : { k: 'L', name: 'L', val: X };
    if (t === 'RC') return kind === 'lp' ? { ser: r, sh: x } : { ser: x, sh: r };
    return kind === 'lp' ? { ser: x, sh: r } : { ser: r, sh: x };
  }

  function widgetFilt(host) {
    const c = K.widgetCard('Quattro filtri del primo ordine', 'RC o RL, passa-basso o passa-alto');
    let t = 'RC';
    let kind = 'hp';
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-t="RC" data-k="lp">RC passa-basso</button><button type="button" data-t="RC" data-k="hp">RC passa-alto</button><button type="button" data-t="RL" data-k="lp">RL passa-basso</button><button type="button" data-t="RL" data-k="hp">RL passa-alto</button>';
    const sch = el('div', 'ex-fig');
    const fig = el('div');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const R = v.R * 1000;
      const fc = t === 'RC' ? A.fcRC(R, v.C * 1e-9) : A.fcRL(R, v.L * 1e-3);
      sch.innerHTML = S.filter(filterParts(t, kind, R, t === 'RC' ? v.C * 1e-9 : v.L * 1e-3)).svg;
      fig.innerHTML = bodeSVG({ kind, fc, fmin: 10, fmax: 1e7, marks: [{ f: fc, label: 'f<sub>t</sub>' }], asym: (x) => A.asymGain(kind, x, fc), asymPh: (x) => A.asymPhase(kind, x, fc) });
      out.innerHTML = `<div class="form-row"><span class="label">Taglio</span><div class="f">${fc_} = ${t === 'RC' ? '1/(2π<var>R</var><var>C</var>)' : '<var>R</var>/(2π<var>L</var>)'} = ${res(App.si(fc, 'Hz', 3))}</div><span class="meta">Le linee tratteggiate sono gli asintoti: il diagramma di Bode "a mano".</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === t && b.dataset.k === kind)));
      c.querySelectorAll('.fields .field').forEach((f, i) => { f.hidden = (i === 1 && t !== 'RC') || (i === 2 && t !== 'RL'); });
    };
    const sl = K.sliders(c, [
      { id: 'R', label: '<var>R</var> (kΩ)', min: 0.01, max: 100, log: true, value: 1 },
      { id: 'C', label: '<var>C</var> (nF)', min: 1, max: 1000, log: true, value: 100 },
      { id: 'L', label: '<var>L</var> (mH)', min: 0.1, max: 1000, log: true, value: 10 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { t = b.dataset.t; kind = b.dataset.k; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(sch, fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'passaalto', num: 3, short: 'Passa-alto e RL', title: 'Passa-alto e filtri RL',
    intro: 'Scambiando di posto i componenti il filtro si capovolge: un condensatore in serie blocca la continua e i segnali lenti. Lo stesso si ottiene con un induttore, usando la sua reattanza che cresce con la frequenza.',
    goals: ['Passa-alto RC', 'Filtri RL', 'Riconoscere il tipo di filtro'],
    widgets: [widgetFilt],
    example: h3[0], exampleTitle: 'Esempio: frequenza di taglio',
    families: h3,
    theory: `
      <article class="note"><h4>Passa-alto</h4>
        <div class="eq"><span><b><var>H</var></b> = ${frac('j<var>f</var>/' + fc_, '1 + j<var>f</var>/' + fc_)}</span></div>
        <p>Sotto il taglio sale di 20 dB per decade, sopra vale circa 0 dB. La fase va da +90° a 0° (+45° al taglio).</p></article>
      <article class="note"><h4>Filtri RL</h4>
        <p>${fc_} = <var>R</var>/(2π<var>L</var>). Induttore in serie e uscita su <var>R</var>: passa-basso. Resistore in serie e uscita sull'induttore: passa-alto.</p></article>
      <article class="note"><h4>Il trucco dei due estremi</h4>
        <p>Per capire un filtro senza calcoli: a <var>f</var> → 0 il condensatore è aperto e l'induttore è un corto; a <var>f</var> → ∞ il contrario. Guarda che cosa resta tra ingresso e uscita.</p></article>`,
  });

  // =====================================================================
  // 4 — Bode asintotico
  // =====================================================================
  const b4 = [];
  b4.push({
    id: 'bode-read', title: 'Leggi gli asintoti', level: 1,
    defaults: { kind: 'lp', fc: 1000, k: 100 },
    gen: () => ({ kind: pick(['lp', 'hp']), fc: pick([100, 200, 500, 1000, 2000, 10000]), k: pick([0.01, 0.1, 0.5, 2, 10, 100, 1000]) }),
    solve: (p) => { const f = p.fc * p.k; return { f, a: A.asymGain(p.kind, f, p.fc) }; },
    text: (p, r) => `Un ${KIND[p.kind]} del primo ordine ha il taglio a ${App.si(p.fc, 'Hz')}. Secondo il diagramma di Bode asintotico, quanto vale il guadagno a ${App.si(r.f, 'Hz')}?`,
    fig: (p, r, sol) => ({ svg: bodeSVG({ kind: p.kind, fc: p.fc, fmin: p.fc / 1000, fmax: p.fc * 1000, ymin: -60, asym: (x) => A.asymGain(p.kind, x, p.fc), marks: [{ f: p.fc, label: 'f<sub>t</sub>' }].concat(sol ? [{ f: r.f }] : []), phase: false }) }),
    asks: (p, r) => [qdB('Guadagno', r.a)],
    steps: (p, r) => {
      const inBand = (p.kind === 'lp' && p.k <= 1) || (p.kind === 'hp' && p.k >= 1);
      return inBand ? step(`La frequenza è nella banda passante → asintoto a ${res('0 dB')}`, 'Prima del taglio (passa-basso) o dopo il taglio (passa-alto) l\'asintoto è orizzontale.')
        : step(`Decadi dal taglio: log<sub>10</sub>(${N(p.k >= 1 ? p.k : 1 / p.k)}) = ${N(Math.abs(Math.log10(p.k)), 3)}`) + step(`Guadagno = −20 dB/decade · ${N(Math.abs(Math.log10(p.k)), 3)} = ${res(N(r.a, 3) + ' dB')}`, 'La pendenza di un filtro del primo ordine è 20 dB per decade.');
    },
  });
  b4.push({
    id: 'bode-err', title: 'Esatto contro asintotico', level: 2,
    gen: () => ({ kind: pick(['lp', 'hp']), k: pick([0.5, 1, 2]), fc: pick([100, 1000, 5000]) }),
    solve: (p) => { const f = p.fc * p.k; const ex = A.dB(A.gain(p.kind, f, p.fc)); const as = A.asymGain(p.kind, f, p.fc); return { f, ex, as, err: ex - as }; },
    text: (p, r) => `Per un ${KIND[p.kind]} con taglio a ${App.si(p.fc, 'Hz')}, calcola il guadagno esatto a ${App.si(r.f, 'Hz')} e confrontalo con quello asintotico.`,
    asks: (p, r) => [qdB('Esatto', r.ex), qdB('Asintotico', r.as)],
    steps: (p, r) => step(`Esatto: ${p.kind === 'lp' ? '−10 log(1 + (f/f<sub>t</sub>)²)' : '20 log(f/f<sub>t</sub>) − 10 log(1 + (f/f<sub>t</sub>)²)'} = ${res(N(r.ex, 3) + ' dB')}`) +
      step(`Asintotico: ${res(N(r.as, 3) + ' dB')}; errore ${N(r.err, 3)} dB`, 'L\'errore massimo è al taglio (−3 dB) e a un\'ottava di distanza vale circa 1 dB: per questo gli asintoti bastano per un disegno a mano.'),
  });
  b4.push({
    id: 'bode-phase', title: 'Fase asintotica', level: 2,
    gen: () => ({ kind: pick(['lp', 'hp']), fc: pick([100, 1000, 10000]), k: pick([0.01, 0.1, 0.3, 1, 3, 10, 100]) }),
    solve: (p) => { const f = p.fc * p.k; return { f, a: A.asymPhase(p.kind, f, p.fc), ex: A.phaseDeg(p.kind, f, p.fc) }; },
    text: (p, r) => `Diagramma della fase di un ${KIND[p.kind]} con taglio a ${App.si(p.fc, 'Hz')}: quanto vale la fase asintotica a ${App.si(r.f, 'Hz')}? E quella esatta?`,
    asks: (p, r) => [Q.qDeg('φ asintotica', r.a), Q.qDeg('φ esatta', r.ex)],
    steps: (p, r) => step(`Asintoti: ${p.kind === 'lp' ? '0°' : '+90°'} fino a f<sub>t</sub>/10, ${p.kind === 'lp' ? '−90°' : '0°'} da 10·f<sub>t</sub>, e in mezzo una retta che passa per ${p.kind === 'lp' ? '−45°' : '+45°'} al taglio`, 'La retta cambia di 45° per decade.') +
      step(`A ${App.si(r.f, 'Hz')}: asintotica ${res(N(r.a, 3) + '°')}; esatta ${p.kind === 'lp' ? '−' : '90° −'}arctan(${N(p.k)}) = ${res(N(r.ex, 3) + '°')}`),
  });
  b4.push({
    id: 'bode-band', title: 'Il passa-banda', level: 2,
    gen: () => ({ fL: pick([20, 50, 100, 300]), fH: pick([3000, 10000, 20000, 100000]) }),
    solve: (p) => ({ B: p.fH - p.fL, f0: Math.sqrt(p.fL * p.fH) }),
    text: (p) => `Un passa-alto con taglio a ${App.si(p.fL, 'Hz')} è in cascata con un passa-basso con taglio a ${App.si(p.fH, 'Hz')} (i due stadi non si caricano). Quanto vale la banda passante? Qual è la frequenza centrale (media geometrica)?`,
    fig: (p) => ({ svg: bodeSVG({ fn: (f) => A.mul(A.H('hp', f, p.fL), A.H('lp', f, p.fH)), fmin: 1, fmax: 1e6, asym: (f) => A.asymGain('hp', f, p.fL) + A.asymGain('lp', f, p.fH), marks: [{ f: p.fL, label: 'f<sub>L</sub>' }, { f: p.fH, label: 'f<sub>H</sub>' }], phase: false }) }),
    asks: (p, r) => [Q.qHz('<var>B</var>', r.B), Q.qHz('<var>f</var><sub>0</sub>', r.f0)],
    steps: (p, r) => step(`<var>B</var> = <var>f</var><sub>H</sub> − <var>f</var><sub>L</sub> = ${res(App.si(r.B, 'Hz', 4))}`, 'Tra i due punti a −3 dB.') +
      step(`<var>f</var><sub>0</sub> = √(<var>f</var><sub>L</sub> · <var>f</var><sub>H</sub>) = ${res(App.si(r.f0, 'Hz', 4))}`, 'Sulla scala logaritmica il centro della banda è la media geometrica, non quella aritmetica.'),
  });
  b4.push({
    id: 'bode-mc', title: 'Concetti su Bode', level: 1,
    ...mc([
      ['Nel diagramma di Bode l\'asse delle frequenze è…', ['logaritmico', 'lineare', 'in dB', 'in gradi'], 'Ogni decade occupa lo stesso spazio.'],
      ['Un filtro del secondo ordine (due celle RC) sopra il taglio attenua circa…', ['40 dB per decade', '20 dB per decade', '3 dB per decade', '6 dB per decade'], 'Ogni polo aggiunge −20 dB/decade.'],
      ['L\'errore massimo tra diagramma esatto e asintotico di un polo è…', ['3 dB, alla frequenza di taglio', '20 dB', '1 dB a f<sub>t</sub>/100', 'zero'], 'Agli estremi le curve coincidono.'],
    ]),
  });

  function widgetBode(host) {
    const c = K.widgetCard('Bode esatto e asintotico', 'Passa-banda: un passa-alto seguito da un passa-basso');
    const fig = el('div');
    const out = el('div', 'forms');
    const draw = (v) => {
      const fL = Math.min(v.fL, v.fH / 2);
      const fH = v.fH;
      const fn = (f) => A.mul(A.H('hp', f, fL), A.H('lp', f, fH));
      const asym = (f) => A.asymGain('hp', f, fL) + A.asymGain('lp', f, fH);
      const asymPh = (f) => A.asymPhase('hp', f, fL) + A.asymPhase('lp', f, fH);
      fig.innerHTML = bodeSVG({ fn, fmin: 1, fmax: 1e6, cur: v.f, asym, asymPh, marks: [{ f: fL, label: 'f<sub>L</sub>' }, { f: fH, label: 'f<sub>H</sub>' }] });
      const Hf = fn(v.f);
      out.innerHTML = `<div class="form-row"><span class="label">A ${App.si(v.f, 'Hz', 3)}</span><div class="f">esatto ${N(A.dB(A.abs(Hf)), 3)} dB, asintotico ${N(asym(v.f), 3)} dB; φ = ${N(A.argDeg(Hf), 3)}°</div></div>
        <div class="form-row"><span class="label">Banda</span><div class="f"><var>B</var> = ${App.si(fH - fL, 'Hz', 3)}</div><span class="meta">Nota i −3 dB esatti ai due tagli, dove gli asintoti fanno l'angolo.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'fL', label: '<var>f</var><sub>L</sub> passa-alto (Hz)', min: 2, max: 10000, log: true, value: 50 },
      { id: 'fH', label: '<var>f</var><sub>H</sub> passa-basso (Hz)', min: 100, max: 500000, log: true, value: 20000 },
      { id: 'f', label: 'Cursore: frequenza (Hz)', min: 1, max: 1e6, log: true, value: 1000 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'bode', num: 4, short: 'Bode', title: 'Diagrammi di Bode asintotici',
    intro: 'Il diagramma di Bode mostra guadagno (in dB) e fase in funzione della frequenza, su scala logaritmica. Con poche rette, gli asintoti, si disegna a mano la risposta di qualunque filtro.',
    goals: ['Asintoti del modulo', 'Asintoti della fase', 'Errore al taglio', 'Passa-banda in cascata'],
    widgets: [widgetBode],
    example: b4[0], exampleTitle: 'Esempio: leggere un asintoto',
    families: b4,
    theory: `
      <article class="note"><h4>Modulo</h4>
        <ul><li>Passa-basso: 0 dB fino a ${fc_}, poi retta a −20 dB/decade.</li><li>Passa-alto: retta a +20 dB/decade fino a ${fc_}, poi 0 dB.</li><li>Al taglio il valore vero è −3 dB: l'errore massimo degli asintoti.</li></ul></article>
      <article class="note"><h4>Fase</h4>
        <p>Costante fino a ${fc_}/10, costante da 10 · ${fc_}, e in mezzo una retta di 45° per decade che passa per ±45° al taglio.</p></article>
      <article class="note"><h4>Cascata</h4>
        <p>Se gli stadi non si caricano, i guadagni in dB e le fasi si sommano: un passa-alto e un passa-basso fanno un passa-banda con <var>B</var> = <var>f</var><sub>H</sub> − <var>f</var><sub>L</sub>.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'bode', year: '4', yearLabel: '4ª', title: 'Filtri passivi e diagrammi di Bode', route: 'bode-db', lessonWord: 'Lezione',
    desc: 'Decibel, filtri passa-basso e passa-alto RC e RL, frequenza di taglio, diagrammi di Bode esatti e asintotici, passa-banda.',
    lessons,
  });
})();
