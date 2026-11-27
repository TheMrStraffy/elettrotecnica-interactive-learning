/* 4ª — Impedenza, circuiti RLC e risonanza */
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
  const LV = [10, 22, 47, 100, 220, 470];
  const CV = [1, 2.2, 4.7, 10, 22, 47, 100];
  const RV = [10, 22, 33, 47, 68, 100, 150, 220, 330];
  const Zh = '<var>Z</var>';
  const deg = (x) => N(x, 4) + '°';

  // =====================================================================
  // 1 — Impedenza: RL e RC serie
  // =====================================================================
  const z1 = [];
  function zSerie(p) {
    const X = p.k === 'L' ? A.XL(p.f, p.val) : -A.XC(p.f, p.val);
    const Z = A.cx(p.R, X);
    const Zm = A.abs(Z);
    const I = p.V / Zm;
    return { X, Xa: Math.abs(X), Z, Zm, I, phi: A.argDeg(Z), VR: p.R * I, VX: Math.abs(X) * I };
  }
  const genZ = (k) => () => ({ k: k || pick(['L', 'C']), R: pick(RV), f: pick([50, 50, 100, 1000]), val: (k || 'L') === 'L' ? pick(LV) * 1e-3 : pick(CV) * 1e-6, V: pick([12, 24, 50, 110, 230]) });
  z1.push({
    id: 'z-rl', title: 'Circuito RL serie', level: 2,
    defaults: { k: 'L', R: 30, f: 50, val: 0.1273, V: 230 },
    gen: () => { const p = genZ('L')(); p.val = pick(LV) * 1e-3; return p; },
    solve: zSerie,
    text: (p) => `Un resistore da ${U(p.R, 'Ω')} e un induttore da ${App.si(p.val, 'H')} sono in serie su ${p.V} V, ${App.si(p.f, 'Hz')}. Trova l'impedenza, la corrente e lo sfasamento.`,
    fig: (p) => S.acSeries({ V: p.V + ' V', parts: [{ k: 'R', name: 'R', val: p.R }, { k: 'L', name: 'L', val: p.val }] }),
    asks: (p, r) => [Q.qX('|' + Zh + '|', r.Zm), h.qI('<var>I</var>', r.I), Q.qDeg('φ', r.phi)],
    steps: (p, r) => step(`<var>X</var><sub>L</sub> = 2π<var>f</var><var>L</var> = ${U(r.Xa, 'Ω')}`) +
      step(`<b>${Zh}</b> = <var>R</var> + j<var>X</var><sub>L</sub> = ${Q.cRect(r.Z, 'Ω')}`, 'In serie le impedenze si sommano come numeri complessi.') +
      step(`|${Zh}| = √(<var>R</var>² + <var>X</var><sub>L</sub>²) = √(${N(p.R)}² + ${N(r.Xa, 4)}²) = ${res(U(r.Zm, 'Ω'))}`, 'Triangolo delle impedenze: R e X sono i cateti, Z l\'ipotenusa.') +
      step(`<var>I</var> = ${frac('<var>V</var>', '|' + Zh + '|')} = ${frac(p.V + ' V', U(r.Zm, 'Ω'))} = ${res(U(r.I, 'A'))}`) +
      step(`φ = arctan(${frac('<var>X</var><sub>L</sub>', '<var>R</var>')}) = ${res(deg(r.phi))}`, 'Positivo: circuito induttivo, la corrente è in ritardo sulla tensione.'),
  });
  z1.push({
    id: 'z-rc', title: 'Circuito RC serie', level: 2,
    gen: () => ({ k: 'C', R: pick(RV), f: pick([50, 100, 1000]), val: pick(CV) * 1e-6, V: pick([12, 24, 50, 110, 230]) }),
    solve: zSerie,
    text: (p) => `Un resistore da ${U(p.R, 'Ω')} e un condensatore da ${App.si(p.val, 'F')} sono in serie su ${p.V} V, ${App.si(p.f, 'Hz')}. Trova l'impedenza, la corrente, lo sfasamento e la tensione sul condensatore.`,
    fig: (p) => S.acSeries({ V: p.V + ' V', parts: [{ k: 'R', name: 'R', val: p.R }, { k: 'C', name: 'C', val: p.val }] }),
    asks: (p, r) => [Q.qX('|' + Zh + '|', r.Zm), h.qI('<var>I</var>', r.I), Q.qDeg('φ', r.phi), h.qV('<var>V</var><sub>C</sub>', r.VX)],
    steps: (p, r) => step(`<var>X</var><sub>C</sub> = ${frac('1', '2π<var>f</var><var>C</var>')} = ${U(r.Xa, 'Ω')}`) +
      step(`<b>${Zh}</b> = <var>R</var> − j<var>X</var><sub>C</sub> = ${Q.cRect(r.Z, 'Ω')} → |${Zh}| = ${res(U(r.Zm, 'Ω'))}`) +
      step(`<var>I</var> = <var>V</var>/|${Zh}| = ${res(U(r.I, 'A'))}`) +
      step(`φ = −arctan(${frac('<var>X</var><sub>C</sub>', '<var>R</var>')}) = ${res(deg(r.phi))}`, 'Negativo: circuito capacitivo, la corrente è in anticipo.') +
      step(`<var>V</var><sub>C</sub> = <var>X</var><sub>C</sub> · <var>I</var> = ${res(U(r.VX, 'V'))}`),
  });
  z1.push({
    id: 'z-volt', title: 'Le letture dei voltmetri', level: 1,
    gen: () => { const [a, b] = pick([[30, 40], [60, 80], [120, 160], [5, 12], [9, 12], [24, 7], [80, 60], [12, 16]]); return { k: pick(['L', 'C']), VR: a, VX: b, m: rand(0, 1) }; },
    solve: (p) => { const V = Math.hypot(p.VR, p.VX); return { V, phi: Math.atan2(p.VX, p.VR) * A.R2D * (p.k === 'L' ? 1 : -1) }; },
    text: (p, r) => (p.m === 0
      ? `In un circuito R${p.k} serie un voltmetro legge ${p.VR} V sul resistore e un altro ${p.VX} V sull'${p.k === 'L' ? 'induttore' : 'condensatore'}. Quanto vale la tensione del generatore? E lo sfasamento?`
      : `Un circuito R${p.k} serie è alimentato a ${N(r.V, 4)} V. Sul resistore il voltmetro legge ${p.VR} V. Quanto legge sull'${p.k === 'L' ? 'induttore' : 'condensatore'}?`),
    asks: (p, r) => (p.m === 0 ? [h.qV('<var>V</var>', r.V), Q.qDeg('φ', r.phi)] : [h.qV('<var>V</var><sub>' + p.k + '</sub>', p.VX)]),
    hint: () => 'Le due tensioni sono sfasate di 90°: si sommano come i cateti di un triangolo rettangolo, non come numeri.',
    steps: (p, r) => (p.m === 0
      ? step(`<var>V</var> = √(<var>V</var><sub>R</sub>² + <var>V</var><sub>${p.k}</sub>²) = √(${p.VR}² + ${p.VX}²) = ${res(U(r.V, 'V'))}`, `Non ${p.VR + p.VX} V: in alternata le letture degli strumenti non si sommano come numeri.`) + step(`φ = ${p.k === 'L' ? '' : '−'}arctan(${frac(p.VX, p.VR)}) = ${res(deg(r.phi))}`)
      : step(`<var>V</var><sub>${p.k}</sub> = √(<var>V</var>² − <var>V</var><sub>R</sub>²) = √(${N(r.V, 4)}² − ${p.VR}²) = ${res(U(p.VX, 'V'))}`, 'Pitagora al contrario.')),
  });
  z1.push({
    id: 'z-inv', title: 'Dalle misure all\'induttanza', level: 2,
    gen: () => L.nice(() => { const R = pick(RV); const X = pick([20, 30, 40, 50, 60, 80, 100, 150, 200]); return { R, X, V: pick([12, 24, 50, 100, 230]), f: pick([50, 100, 1000]), k: pick(['L', 'C']) }; }, (p) => p.X >= 0.5 * p.R && p.X <= 5 * p.R, { R: 30, X: 40, V: 100, f: 50, k: 'L' }),
    solve: (p) => { const Zm = Math.hypot(p.R, p.X); const I = p.V / Zm; return { Zm, I, val: p.k === 'L' ? p.X / (A.TAU * p.f) : 1 / (A.TAU * p.f * p.X) }; },
    text: (p, r) => `Un carico R${p.k} serie, alimentato a ${p.V} V e ${App.si(p.f, 'Hz')}, assorbe ${App.si(r.I, 'A', 4)}. La parte resistiva vale ${U(p.R, 'Ω')}. Quanto valgono la reattanza e ${p.k === 'L' ? 'l\'induttanza' : 'la capacità'}?`,
    asks: (p, r) => [Q.qX('<var>X</var>', p.X), p.k === 'L' ? Q.qL('<var>L</var>', r.val) : Q.qC('<var>C</var>', r.val)],
    steps: (p, r) => step(`|${Zh}| = <var>V</var>/<var>I</var> = ${U(r.Zm, 'Ω')}`, 'Ohm con i moduli: dà l\'impedenza.') +
      step(`<var>X</var> = √(|${Zh}|² − <var>R</var>²) = √(${N(r.Zm, 4)}² − ${p.R}²) = ${res(U(p.X, 'Ω'))}`, 'Dal triangolo delle impedenze.') +
      step(p.k === 'L' ? `<var>L</var> = ${frac('<var>X</var>', '2π<var>f</var>')} = ${res(App.si(r.val, 'H', 4))}` : `<var>C</var> = ${frac('1', '2π<var>f</var><var>X</var>')} = ${res(App.si(r.val, 'F', 4))}`),
  });
  z1.push({
    id: 'z-mc', title: 'Concetti sull\'impedenza', level: 1,
    ...mc([
      ['L\'impedenza di un RL serie è…', ['R + jX_L, con modulo √(R² + X_L²)', 'R + X_L', 'R · X_L', 'R − X_L'], 'Resistenza e reattanza sono "perpendicolari": si sommano come vettori.'],
      ['In un RC serie la corrente, rispetto alla tensione del generatore, è…', ['in anticipo di un angolo tra 0° e 90°', 'in ritardo di 90°', 'in fase', 'in anticipo di 180°'], 'Il condensatore porta la corrente in anticipo; il resistore la tira verso la fase.'],
      ['Nel triangolo delle impedenze l\'angolo φ è…', ['lo sfasamento tra tensione e corrente', 'la fase della tensione', 'sempre 45°', 'l\'angolo tra R e X'], 'cos φ = R/|Z|: compare anche nelle potenze.'],
      ['Se in un RL serie aumenta la frequenza, lo sfasamento…', ['aumenta, verso 90°', 'diminuisce, verso 0°', 'resta uguale', 'diventa negativo'], 'XL cresce con f, R no: il circuito diventa "più induttivo".'],
    ]),
  });

  function widgetZ(host) {
    const c = K.widgetCard('Triangolo delle impedenze', 'RL o RC serie a 10 V: cambia R, la reattanza e la frequenza');
    let k = 'L';
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-k="L">RL serie</button><button type="button" data-k="C">RC serie</button>';
    const grid = el('div', 'q-two');
    const fig = el('div');
    const fig2 = el('div');
    grid.append(fig, fig2);
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const r = zSerie({ k, R: v.R, f: v.f, val: k === 'L' ? v.L * 1e-3 : v.C * 1e-6, V: 10 });
      fig.innerHTML = Q.phasorSVG({ W: 280, H: 260, vecs: [{ z: A.cx(v.R, 0), label: 'R', cls: 'p1' }, { from: A.cx(v.R, 0), z: A.cx(0, r.X), label: 'X', cls: 'p2' }, { z: r.Z, label: 'Z', cls: 'ps' }], arcs: [{ to: r.phi, label: 'φ' }], title: 'Triangolo delle impedenze' });
      const I = A.cx(r.I, 0);
      fig2.innerHTML = Q.phasorSVG({ W: 280, H: 260, vecs: [{ z: A.cx(r.VR, 0), label: 'V_R', cls: 'p1' }, { from: A.cx(r.VR, 0), z: A.cx(0, r.X * r.I), label: 'V_' + k, cls: 'p2' }, { z: A.scale(r.Z, r.I), label: 'V', cls: 'ps' }, { z: A.scale(I, 3 / Math.max(r.I, 1e-9)), label: 'I', cls: 'p3' }], title: 'Fasori delle tensioni (la corrente è il riferimento)' }).replace(/V_R/g, 'V<tspan class="sb" dy="3">R</tspan>').replace(/V_([LC])/g, 'V<tspan class="sb" dy="3">$1</tspan>');
      out.innerHTML = `<div class="form-row"><span class="label">Impedenza</span><div class="f"><b>${Zh}</b> = ${Q.cRect(r.Z, 'Ω')} = ${res(Q.cPol(r.Z, 'Ω'))}</div><span class="meta">${k === 'L' ? '<var>X</var><sub>L</sub> = 2π<var>f</var><var>L</var>' : '<var>X</var><sub>C</sub> = 1/(2π<var>f</var><var>C</var>)'} = ${U(r.Xa, 'Ω')}</span></div>
        <div class="form-row"><span class="label">Corrente e tensioni</span><div class="f"><var>I</var> = ${U(r.I, 'A')}; <var>V</var><sub>R</sub> = ${U(r.VR, 'V')}; <var>V</var><sub>${k}</sub> = ${U(r.VX, 'V')}</div><span class="meta">${N(r.VR, 3)} + ${N(r.VX, 3)} = ${N(r.VR + r.VX, 3)} V, ma il generatore dà 10 V: le tensioni si sommano come vettori.</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      c.querySelectorAll('.fields .field').forEach((f, i) => { f.hidden = (i === 1 && k !== 'L') || (i === 2 && k !== 'C'); });
    };
    const sl = K.sliders(c, [
      { id: 'R', label: '<var>R</var> (Ω)', min: 1, max: 500, log: true, value: 100 },
      { id: 'L', label: '<var>L</var> (mH)', min: 1, max: 2000, log: true, value: 300 },
      { id: 'C', label: '<var>C</var> (µF)', min: 0.5, max: 200, log: true, value: 30 },
      { id: 'f', label: '<var>f</var> (Hz)', min: 10, max: 2000, log: true, value: 50 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { k = b.dataset.k; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(grid, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'serie', num: 1, short: 'RL e RC', title: 'Impedenza: circuiti RL e RC serie',
    intro: 'Con resistori, induttori e condensatori insieme, l\'opposizione alla corrente diventa un numero complesso: l\'impedenza. Il suo modulo dice quanta corrente passa, il suo angolo di quanto è sfasata.',
    goals: ['Impedenza complessa', 'Triangolo delle impedenze', 'Somma vettoriale delle tensioni', 'Dalle misure ai componenti'],
    widgets: [widgetZ],
    example: z1[0], exampleTitle: 'Esempio: un carico RL sulla rete',
    families: z1,
    theory: `
      <article class="note"><h4>Impedenza</h4>
        <div class="eq"><span><b>${Zh}</b> = <var>R</var> + j<var>X</var></span><span>|${Zh}| = √(<var>R</var>² + <var>X</var>²)</span><span>φ = arctan(<var>X</var>/<var>R</var>)</span></div>
        <p><var>X</var> = <var>X</var><sub>L</sub> per un induttore (φ > 0, circuito induttivo), <var>X</var> = −<var>X</var><sub>C</sub> per un condensatore (φ < 0, capacitivo). Legge di Ohm: <var>I</var> = <var>V</var>/|${Zh}|.</p></article>
      <article class="note"><h4>Le tensioni</h4>
        <p><var>V</var><sub>R</sub> è in fase con la corrente, <var>V</var><sub>L</sub> in anticipo di 90°, <var>V</var><sub>C</sub> in ritardo di 90°. Per questo <var>V</var> = √(<var>V</var><sub>R</sub>² + <var>V</var><sub>X</sub>²) e non la somma delle letture.</p></article>`,
  });

  // =====================================================================
  // 2 — RLC serie
  // =====================================================================
  const r2 = [];
  function rlc(p) {
    const XLv = A.XL(p.f, p.L);
    const XCv = A.XC(p.f, p.C);
    const Z = A.cx(p.R, XLv - XCv);
    const Zm = A.abs(Z);
    const I = p.V / Zm;
    return { XL: XLv, XC: XCv, X: XLv - XCv, Z, Zm, I, phi: A.argDeg(Z), VR: p.R * I, VL: XLv * I, VC: XCv * I, fr: A.f0(p.L, p.C) };
  }
  const genRLC = () => L.nice(() => ({ R: pick([10, 20, 30, 40, 50, 100]), L: pick([50, 100, 200, 300, 500]) * 1e-3, C: pick([10, 22, 47, 100, 220]) * 1e-6, f: 50, V: pick([24, 50, 100, 230]) }), (p) => { const r = rlc(p); return Math.abs(r.X) > 2 && Math.abs(r.X) < 20 * p.R; }, { R: 30, L: 0.3, C: 47e-6, f: 50, V: 230 });
  r2.push({
    id: 'rlc-z', title: 'Impedenza dell\'RLC serie', level: 2,
    defaults: { R: 30, L: 0.3, C: 47e-6, f: 50, V: 230 },
    gen: genRLC,
    solve: rlc,
    text: (p) => `Un circuito RLC serie (<var>R</var> = ${U(p.R, 'Ω')}, <var>L</var> = ${App.si(p.L, 'H')}, <var>C</var> = ${App.si(p.C, 'F')}) è alimentato a ${p.V} V, ${p.f} Hz. Trova l'impedenza, la corrente e lo sfasamento.`,
    fig: (p) => S.acSeries({ V: p.V + ' V', parts: [{ k: 'R', name: 'R', val: p.R }, { k: 'L', name: 'L', val: p.L }, { k: 'C', name: 'C', val: p.C }] }),
    asks: (p, r) => [Q.qX('|' + Zh + '|', r.Zm), h.qI('<var>I</var>', r.I), Q.qDeg('φ', r.phi)],
    steps: (p, r) => step(`<var>X</var><sub>L</sub> = ${U(r.XL, 'Ω')}; <var>X</var><sub>C</sub> = ${U(r.XC, 'Ω')}`) +
      step(`<var>X</var> = <var>X</var><sub>L</sub> − <var>X</var><sub>C</sub> = ${U(r.X, 'Ω')}`, 'Le due reattanze hanno segno opposto e in parte si annullano.') +
      step(`|${Zh}| = √(<var>R</var>² + <var>X</var>²) = ${res(U(r.Zm, 'Ω'))}`) +
      step(`<var>I</var> = <var>V</var>/|${Zh}| = ${res(U(r.I, 'A'))}`) +
      step(`φ = arctan(<var>X</var>/<var>R</var>) = ${res(deg(r.phi))}`, r.phi > 0 ? 'Prevale l\'induttore: circuito ohmico-induttivo.' : 'Prevale il condensatore: circuito ohmico-capacitivo.'),
  });
  r2.push({
    id: 'rlc-v', title: 'Le tensioni su R, L e C', level: 2,
    gen: genRLC,
    solve: rlc,
    text: (p) => `Nello stesso tipo di circuito (<var>R</var> = ${U(p.R, 'Ω')}, <var>L</var> = ${App.si(p.L, 'H')}, <var>C</var> = ${App.si(p.C, 'F')}, ${p.V} V, ${p.f} Hz) quanto leggono tre voltmetri messi su R, su L e su C?`,
    asks: (p, r) => [h.qV('<var>V</var><sub>R</sub>', r.VR), h.qV('<var>V</var><sub>L</sub>', r.VL), h.qV('<var>V</var><sub>C</sub>', r.VC)],
    steps: (p, r) => step(`|${Zh}| = ${U(r.Zm, 'Ω')} → <var>I</var> = ${U(r.I, 'A')}`) +
      step(`<var>V</var><sub>R</sub> = <var>R</var><var>I</var> = ${res(U(r.VR, 'V'))}; <var>V</var><sub>L</sub> = <var>X</var><sub>L</sub><var>I</var> = ${res(U(r.VL, 'V'))}; <var>V</var><sub>C</sub> = <var>X</var><sub>C</sub><var>I</var> = ${res(U(r.VC, 'V'))}`) +
      step(`Controllo: √(<var>V</var><sub>R</sub>² + (<var>V</var><sub>L</sub> − <var>V</var><sub>C</sub>)²) = ${U(Math.hypot(r.VR, r.VL - r.VC), 'V')} = <var>V</var>`, Math.max(r.VL, r.VC) > p.V ? 'Sorpresa: una tensione parziale supera quella del generatore. Si può, perché VL e VC sono opposte e in parte si cancellano.' : 'VL e VC sono in opposizione di fase: nel diagramma si sottraggono.'),
  });
  r2.push({
    id: 'rlc-char', title: 'Induttivo o capacitivo?', level: 1,
    gen: () => ({ R: pick([10, 20, 30, 40, 60]), XL: pick([20, 40, 50, 80, 100, 120]), XC: pick([20, 40, 50, 80, 100, 120]) }),
    solve: (p) => ({ X: p.XL - p.XC, Zm: Math.hypot(p.R, p.XL - p.XC), kind: p.XL > p.XC ? 0 : p.XL < p.XC ? 1 : 2 }),
    text: (p) => `In un RLC serie <var>R</var> = ${p.R} Ω, <var>X</var><sub>L</sub> = ${p.XL} Ω e <var>X</var><sub>C</sub> = ${p.XC} Ω. Il circuito è induttivo, capacitivo o in risonanza? Quanto vale |${Zh}|?`,
    asks: (p, r) => [h.choice('Comportamento', ['ohmico-induttivo', 'ohmico-capacitivo', 'in risonanza (puramente ohmico)'], r.kind), Q.qX('|' + Zh + '|', r.Zm)],
    steps: (p, r) => step(`<var>X</var> = <var>X</var><sub>L</sub> − <var>X</var><sub>C</sub> = ${p.XL} − ${p.XC} = ${N(r.X)} Ω → ${res(['ohmico-induttivo', 'ohmico-capacitivo', 'in risonanza'][r.kind])}`, r.kind === 2 ? 'Le reattanze si annullano: resta solo R e la corrente è in fase con la tensione.' : 'Conta quale reattanza è più grande.') +
      step(`|${Zh}| = √(${p.R}² + ${N(r.X)}²) = ${res(U(r.Zm, 'Ω'))}`),
  });
  r2.push({
    id: 'rlc-mc', title: 'Concetti sull\'RLC serie', level: 1,
    ...mc([
      ['In un RLC serie le tensioni su L e su C sono…', ['in opposizione di fase (sfasate di 180°)', 'in fase', 'sfasate di 90°', 'sempre uguali'], 'VL è a +90° dalla corrente, VC a −90°.'],
      ['Se XL > XC il circuito è…', ['ohmico-induttivo', 'ohmico-capacitivo', 'in risonanza', 'puramente reattivo'], 'Prevale la reattanza induttiva: φ > 0.'],
      ['La tensione su L può essere maggiore di quella del generatore?', ['sì, perché VL e VC si compensano in parte', 'no, mai', 'solo in continua', 'solo se R = 0'], 'Vicino alla risonanza VL e VC possono essere molte volte V.'],
      ['Abbassando la frequenza, in un RLC serie…', ['XL diminuisce e XC aumenta', 'aumentano tutte e due', 'diminuiscono tutte e due', 'non cambia niente'], 'XL è proporzionale a f, XC inversamente proporzionale.'],
    ]),
  });

  function widgetRLCs(host) {
    const c = K.widgetCard('Il circuito RLC serie', '230 V: muovi la frequenza e guarda le tensioni');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const out = el('div', 'forms');
    grid.append(fig, out);
    const draw = (v) => {
      const p = { R: v.R, L: v.L * 1e-3, C: v.C * 1e-6, f: v.f, V: 230 };
      const r = rlc(p);
      const a = A.cx(r.VR, 0);
      const b = A.add(a, A.cx(0, r.VL));
      fig.innerHTML = Q.phasorSVG({ W: 300, H: 300, vecs: [{ z: a, label: 'VR', cls: 'p1' }, { from: a, z: A.cx(0, r.VL), label: 'VL', cls: 'p2', side: 'l' }, { from: b, z: A.cx(0, -r.VC), label: 'VC', cls: 'p3', side: 'r' }, { z: A.scale(r.Z, r.I), label: 'V', cls: 'ps' }], title: 'Fasori delle tensioni, corrente come riferimento' }).replace(/>V([RLC])</g, '>V<tspan class="sb" dy="3">$1</tspan><');
      const state = Math.abs(r.X) < 0.02 * r.Zm ? 'in risonanza: le reattanze si annullano' : r.X > 0 ? 'ohmico-induttivo (corrente in ritardo)' : 'ohmico-capacitivo (corrente in anticipo)';
      out.innerHTML = `<div class="form-row"><span class="label">Reattanze</span><div class="f"><var>X</var><sub>L</sub> = ${U(r.XL, 'Ω')}; <var>X</var><sub>C</sub> = ${U(r.XC, 'Ω')}</div><span class="meta">Frequenza di risonanza: ${App.si(r.fr, 'Hz', 4)}.</span></div>
        <div class="form-row"><span class="label">Impedenza</span><div class="f">${Q.cPol(r.Z, 'Ω')}</div><span class="meta">Circuito ${state}.</span></div>
        <div class="form-row"><span class="label">Tensioni</span><div class="f"><var>I</var> = ${U(r.I, 'A')}; <var>V</var><sub>R</sub> = ${U(r.VR, 'V')}; <var>V</var><sub>L</sub> = ${U(r.VL, 'V')}; <var>V</var><sub>C</sub> = ${U(r.VC, 'V')}</div>${Math.max(r.VL, r.VC) > 230 ? '<span class="meta" style="color:var(--bad)">Una tensione parziale supera i 230 V del generatore!</span>' : ''}</div>`;
    };
    const sl = K.sliders(c, [
      { id: 'R', label: '<var>R</var> (Ω)', min: 5, max: 500, log: true, value: 50 },
      { id: 'L', label: '<var>L</var> (mH)', min: 10, max: 1000, log: true, value: 300 },
      { id: 'C', label: '<var>C</var> (µF)', min: 1, max: 200, log: true, value: 33.8 },
      { id: 'f', label: '<var>f</var> (Hz)', min: 10, max: 500, log: true, value: 50 },
    ], draw);
    c.append(grid);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'rlcserie', num: 2, short: 'RLC serie', title: 'Il circuito RLC serie',
    intro: 'Mettendo in serie resistore, induttore e condensatore le due reattanze si fanno la guerra: una spinge la corrente in ritardo, l\'altra in anticipo. Il risultato dipende da quale delle due vince alla frequenza di lavoro.',
    goals: ['X = XL − XC', 'Circuito induttivo o capacitivo', 'Tensioni parziali e diagramma dei fasori'],
    widgets: [widgetRLCs],
    example: r2[0], exampleTitle: 'Esempio: RLC serie sulla rete',
    families: r2,
    theory: `
      <article class="note"><h4>Impedenza</h4>
        <div class="eq"><span><b>${Zh}</b> = <var>R</var> + j(<var>X</var><sub>L</sub> − <var>X</var><sub>C</sub>)</span><span>|${Zh}| = √(<var>R</var>² + (<var>X</var><sub>L</sub> − <var>X</var><sub>C</sub>)²)</span></div>
        <ul><li><var>X</var><sub>L</sub> > <var>X</var><sub>C</sub>: circuito ohmico-induttivo, φ > 0.</li><li><var>X</var><sub>L</sub> < <var>X</var><sub>C</sub>: ohmico-capacitivo, φ < 0.</li><li><var>X</var><sub>L</sub> = <var>X</var><sub>C</sub>: risonanza, φ = 0.</li></ul></article>
      <article class="note"><h4>Diagramma dei fasori</h4>
        <p>Si parte dalla corrente (comune a tutti in serie): <var>V</var><sub>R</sub> in fase, <var>V</var><sub>L</sub> verso l'alto, <var>V</var><sub>C</sub> verso il basso. La tensione del generatore chiude il poligono.</p></article>`,
  });

  // =====================================================================
  // 3 — Risonanza
  // =====================================================================
  const q3 = [];
  q3.push({
    id: 'res-f0', title: 'Frequenza di risonanza', level: 1,
    gen: () => ({ L: pick([1, 2.2, 4.7, 10, 22, 47, 100]) * 1e-3, C: pick([1, 2.2, 4.7, 10, 22, 47, 100]) * 1e-9 }),
    solve: (p) => ({ fr: A.f0(p.L, p.C) }),
    text: (p) => `Un induttore da ${App.si(p.L, 'H')} e un condensatore da ${App.si(p.C, 'F')} sono in serie. A quale frequenza va in risonanza il circuito?`,
    asks: (p, r) => [Q.qHz('<var>f</var><sub>0</sub>', r.fr)],
    steps: (p, r) => step(`<var>f</var><sub>0</sub> = ${frac('1', '2π√(<var>L</var><var>C</var>)')} = ${frac('1', '6,283 · √(' + App.si(p.L, 'H') + ' · ' + App.si(p.C, 'F') + ')')} = ${res(App.si(r.fr, 'Hz', 4))}`, 'Viene dalla condizione XL = XC: 2πfL = 1/(2πfC).'),
  });
  q3.push({
    id: 'res-tune', title: 'Accordare un circuito', level: 1,
    gen: () => ({ f: pick([455e3, 1e6, 1.5e6, 10.7e6, 100e3, 1e3, 50]), m: rand(0, 1) }),
    solve: (p) => { const Lv = p.f >= 1e6 ? 10e-6 : p.f >= 1e5 ? 100e-6 : p.f >= 1000 ? 10e-3 : 1; const Cv = A.Ctune(p.f, Lv); return { Lv, Cv }; },
    text: (p, r) => (p.m === 0
      ? `Per sintonizzare un circuito LC serie su ${App.si(p.f, 'Hz')} si usa un induttore da ${App.si(r.Lv, 'H')}. Che capacità serve?`
      : `Un circuito risonante deve lavorare a ${App.si(p.f, 'Hz')} con un condensatore da ${App.si(r.Cv, 'F', 4)}. Che induttanza serve?`),
    asks: (p, r) => [p.m === 0 ? Q.qC('<var>C</var>', r.Cv) : Q.qL('<var>L</var>', r.Lv)],
    steps: (p, r) => step(p.m === 0 ? `<var>C</var> = ${frac('1', '(2π<var>f</var><sub>0</sub>)² <var>L</var>')} = ${res(App.si(r.Cv, 'F', 4))}` : `<var>L</var> = ${frac('1', '(2π<var>f</var><sub>0</sub>)² <var>C</var>')} = ${res(App.si(r.Lv, 'H', 4))}`, 'È la formula di Thomson rigirata. Nelle radio il condensatore variabile della sintonia fa proprio questo.'),
  });
  q3.push({
    id: 'res-q', title: 'Fattore di merito e banda', level: 2,
    gen: () => ({ R: pick([5, 10, 20, 50, 100]), L: pick([10, 22, 47, 100]) * 1e-3, C: pick([10, 22, 47, 100, 220]) * 1e-9, V: pick([1, 2, 5, 10]) }),
    solve: (p) => { const fr = A.f0(p.L, p.C); const Qv = A.Qseries(p.R, p.L, p.C); return { fr, Qv, B: fr / Qv, I0: p.V / p.R, VL: Qv * p.V }; },
    text: (p) => `RLC serie con <var>R</var> = ${p.R} Ω, <var>L</var> = ${App.si(p.L, 'H')}, <var>C</var> = ${App.si(p.C, 'F')}, alimentato a ${p.V} V. Alla risonanza: quanto vale il fattore di merito <var>Q</var>, la banda passante e la tensione sull'induttore?`,
    asks: (p, r) => [{ label: '<var>Q</var>', unit: '', value: r.Qv }, Q.qHz('<var>B</var>', r.B), h.qV('<var>V</var><sub>L</sub>', r.VL)],
    steps: (p, r) => step(`<var>f</var><sub>0</sub> = ${App.si(r.fr, 'Hz', 4)}; <var>X</var><sub>0</sub> = 2π<var>f</var><sub>0</sub><var>L</var> = ${U(r.Qv * p.R, 'Ω')}`) +
      step(`<var>Q</var> = ${frac('<var>X</var><sub>0</sub>', '<var>R</var>')} = ${res(N(r.Qv, 4))}`, 'Più R è piccola, più la risonanza è "stretta".') +
      step(`<var>B</var> = ${frac('<var>f</var><sub>0</sub>', '<var>Q</var>')} = ${res(App.si(r.B, 'Hz', 4))}`, 'Banda passante: tra le frequenze in cui la corrente scende a 1/√2 del massimo (−3 dB).') +
      step(`<var>I</var><sub>0</sub> = <var>V</var>/<var>R</var> = ${U(r.I0, 'A')}; <var>V</var><sub>L</sub> = <var>X</var><sub>0</sub> <var>I</var><sub>0</sub> = <var>Q</var> · <var>V</var> = ${res(U(r.VL, 'V'))}`, 'Sovratensione di risonanza: L e C hanno ai capi Q volte la tensione del generatore.'),
  });
  q3.push({
    id: 'res-mc', title: 'Concetti sulla risonanza', level: 1,
    ...mc([
      ['Alla risonanza di un RLC serie la corrente è…', ['massima e in fase con la tensione', 'minima', 'nulla', 'in ritardo di 90°'], 'Z = R, il valore più piccolo possibile.'],
      ['Raddoppiando la capacità, la frequenza di risonanza…', ['diminuisce di √2 volte', 'raddoppia', 'si dimezza', 'non cambia'], 'f0 = 1/(2π√LC): C sta sotto radice.'],
      ['Un fattore di merito Q alto vuol dire…', ['risonanza stretta e selettiva', 'banda larga', 'resistenza grande', 'nessuna risonanza'], 'B = f0/Q: Q alto, banda stretta. Serve per scegliere una sola stazione radio.'],
      ['Alla risonanza un LC parallelo ideale…', ['ha impedenza infinita (corrente di linea nulla)', 'è un cortocircuito', 'ha impedenza R', 'assorbe la corrente massima'], 'È il contrario del serie: si parla di antirisonanza.'],
    ]),
  });

  function widgetRes(host) {
    const c = K.widgetCard('La curva di risonanza', 'Corrente in funzione della frequenza, a 1 V: cambia R e guarda la banda');
    const fig = el('div');
    const out = el('div', 'forms');
    const draw = (v) => {
      const p = { R: v.R, L: v.L * 1e-3, C: v.C * 1e-9 };
      const fr = A.f0(p.L, p.C);
      const Qv = A.Qseries(p.R, p.L, p.C);
      const B = fr / Qv;
      const I0 = 1 / p.R;
      const ch = Q.logChart({ W: 520, H: 230, fmin: fr / 10, fmax: fr * 10, ymin: 0, ymax: 100, ystep: 25, yu: '%' });
      const Ipct = (f) => (100 * (1 / A.abs(A.cx(p.R, A.XL(f, p.L) - A.XC(f, p.C))))) / I0;
      const f1 = fr * (Math.sqrt(1 + 1 / (4 * Qv * Qv)) - 1 / (2 * Qv));
      const f2 = f1 + B;
      let body = `<rect class="band" x="${ch.X(Math.max(f1, fr / 10))}" y="${ch.Y(100)}" width="${Math.max(0, ch.X(Math.min(f2, fr * 10)) - ch.X(Math.max(f1, fr / 10)))}" height="${ch.Y(0) - ch.Y(100)}"/>`;
      body += `<line class="guide" x1="${ch.X(fr / 10)}" y1="${ch.Y(70.7)}" x2="${ch.X(fr * 10)}" y2="${ch.Y(70.7)}"/><text class="wlbl" x="${ch.X(fr * 10) - 4}" y="${ch.Y(70.7) - 4}" text-anchor="end">70,7%</text>`;
      body += `<path class="gen" d="${ch.path(Ipct)}"/><line class="guide" x1="${ch.X(fr)}" y1="${ch.Y(0)}" x2="${ch.X(fr)}" y2="${ch.Y(100)}"/><text class="wlbl" x="${ch.X(fr) + 4}" y="${ch.Y(100) + 12}">f₀</text>`;
      fig.innerHTML = ch.wrap(body, 'Curva di risonanza');
      out.innerHTML = `<div class="form-row"><span class="label">Risonanza</span><div class="f"><var>f</var><sub>0</sub> = ${res(App.si(fr, 'Hz', 4))}; <var>I</var><sub>0</sub> = 1 V / <var>R</var> = ${U(I0, 'A')}</div></div>
        <div class="form-row"><span class="label">Selettività</span><div class="f"><var>Q</var> = ${N(Qv, 3)}; <var>B</var> = <var>f</var><sub>0</sub>/<var>Q</var> = ${App.si(B, 'Hz', 3)}</div><span class="meta">La fascia colorata è la banda passante. Abbassa R: la curva si stringe e la corrente massima cresce.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'R', label: '<var>R</var> (Ω)', min: 1, max: 200, log: true, value: 20 },
      { id: 'L', label: '<var>L</var> (mH)', min: 1, max: 100, log: true, value: 10 },
      { id: 'C', label: '<var>C</var> (nF)', min: 1, max: 1000, log: true, value: 100 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'risonanza', num: 3, short: 'Risonanza', title: 'La risonanza',
    intro: 'A una frequenza precisa le reattanze di L e C si annullano: il circuito diventa puramente resistivo e, in serie, la corrente schizza al massimo. È il principio con cui una radio sceglie una stazione.',
    goals: ['Formula di Thomson', 'Fattore di merito e banda', 'Sovratensioni', 'Risonanza parallelo'],
    widgets: [widgetRes],
    example: q3[0], exampleTitle: 'Esempio: frequenza di risonanza',
    families: q3,
    theory: `
      <article class="note"><h4>Condizione di risonanza</h4>
        <div class="eq"><span><var>X</var><sub>L</sub> = <var>X</var><sub>C</sub> → <var>f</var><sub>0</sub> = ${frac('1', '2π√(<var>L</var><var>C</var>)')}</span></div>
        <p>Nel circuito serie <var>Z</var> = <var>R</var> (minima), la corrente è massima e in fase con la tensione.</p></article>
      <article class="note"><h4>Fattore di merito e banda</h4>
        <div class="eq"><span><var>Q</var> = ${frac('<var>X</var><sub>0</sub>', '<var>R</var>')} = ${frac('1', '<var>R</var>')}√(<var>L</var>/<var>C</var>)</span><span><var>B</var> = <var>f</var><sub>0</sub>/<var>Q</var></span></div>
        <p>Alla risonanza <var>V</var><sub>L</sub> = <var>V</var><sub>C</sub> = <var>Q</var> · <var>V</var>: con Q = 50 e 10 V, sul condensatore ci sono 500 V!</p></article>
      <article class="note"><h4>Parallelo</h4>
        <p>L e C in parallelo alla stessa <var>f</var><sub>0</sub> fanno l'opposto: le correnti in L e in C sono uguali e opposte, la corrente di linea è minima e l'impedenza massima (antirisonanza). Si usa nei circuiti "tank" degli oscillatori.</p></article>`,
  });

  // =====================================================================
  // 4 — Parallelo e reti in alternata
  // =====================================================================
  const p4 = [];
  p4.push({
    id: 'par-rl', title: 'R e reattanza in parallelo', level: 2,
    gen: () => { const [a, b] = pick([[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [1, 1]]); const IR = a * pick([0.5, 1, 2]); const ratio = b / a; return { k: pick(['L', 'C']), V: pick([12, 24, 48, 120, 230]), IR, IX: IR * ratio }; },
    solve: (p) => { const I = Math.hypot(p.IR, p.IX); return { R: p.V / p.IR, X: p.V / p.IX, I, phi: Math.atan2(p.IX, p.IR) * A.R2D * (p.k === 'L' ? -1 : 1), Zm: p.V / I }; },
    text: (p, r) => `Un resistore da ${U(r.R, 'Ω')} e ${p.k === 'L' ? 'un induttore' : 'un condensatore'} con reattanza ${U(r.X, 'Ω')} sono in parallelo su ${p.V} V. Trova la corrente totale, lo sfasamento e l'impedenza equivalente.`,
    fig: (p, r) => S.acParallel({ V: p.V + ' V', parts: [{ k: 'R', name: 'R', val: r.R }, { k: p.k, name: p.k, val: p.k + ' (' + App.si(r.X, 'Ω') + ')' }] }),
    asks: (p, r) => [h.qI('<var>I</var>', r.I), Q.qDeg('φ (corrente)', r.phi), Q.qX('|' + Zh + '|', r.Zm)],
    steps: (p, r) => step(`<var>I</var><sub>R</sub> = <var>V</var>/<var>R</var> = ${U(p.IR, 'A')} (in fase); <var>I</var><sub>${p.k}</sub> = <var>V</var>/<var>X</var> = ${U(p.IX, 'A')} (${p.k === 'L' ? 'in ritardo' : 'in anticipo'} di 90°)`, 'In parallelo la tensione è la stessa: conviene ragionare sulle correnti.') +
      step(`<var>I</var> = √(<var>I</var><sub>R</sub>² + <var>I</var><sub>${p.k}</sub>²) = ${res(U(r.I, 'A'))}`, 'Kirchhoff ai nodi, con i fasori: le correnti sono a 90° e si sommano con Pitagora.') +
      step(`φ = ${p.k === 'L' ? '−' : ''}arctan(${frac('<var>I</var><sub>' + p.k + '</sub>', '<var>I</var><sub>R</sub>')}) = ${res(deg(r.phi))}`, 'Fase della corrente rispetto alla tensione.') +
      step(`|${Zh}| = <var>V</var>/<var>I</var> = ${res(U(r.Zm, 'Ω'))}`, 'Più piccola sia di R sia di X, come per i resistori in parallelo.'),
  });
  p4.push({
    id: 'par-z', title: 'Impedenza di un parallelo con i complessi', level: 2,
    gen: () => ({ R: pick([10, 20, 30, 40, 50, 100]), X: pick([10, 20, 30, 40, 50, 100]) * pick([1, -1]) }),
    solve: (p) => { const Z = A.parallel(A.cx(p.R, 0), A.cx(0, p.X)); return { Z, Zm: A.abs(Z), phi: A.argDeg(Z) }; },
    text: (p) => `Calcola l'impedenza equivalente del parallelo tra <var>R</var> = ${p.R} Ω e una reattanza ${p.X > 0 ? 'induttiva' : 'capacitiva'} <b><var>Z</var></b><sub>X</sub> = ${Q.cRect(A.cx(0, p.X), 'Ω')}. Scrivila in forma polare.`,
    asks: (p, r) => [Q.qX('|' + Zh + '|', r.Zm), Q.qDeg('φ', r.phi)],
    hint: () => 'Come per due resistori: prodotto diviso somma, ma con i numeri complessi.',
    steps: (p, r) => step(`<b>${Zh}</b> = ${frac('<var>R</var> · <b><var>Z</var></b><sub>X</sub>', '<var>R</var> + <b><var>Z</var></b><sub>X</sub>')} = ${frac(N(p.R) + ' · ' + Q.pol(Math.abs(p.X), p.X > 0 ? 90 : -90), Q.cRect(A.cx(p.R, p.X)))}`, 'Prodotto in forma polare, somma in forma rettangolare.') +
      step(`= ${frac(Q.pol(p.R * Math.abs(p.X), p.X > 0 ? 90 : -90), Q.cPol(A.cx(p.R, p.X)))} = ${res(Q.cPol(r.Z, 'Ω'))}`, 'Nel quoziente i moduli si dividono e gli angoli si sottraggono.'),
  });
  p4.push({
    id: 'mix-ac', title: 'Rete mista in alternata', level: 3,
    gen: () => ({ R1: pick([10, 20, 30, 50]), R2: pick([20, 40, 50, 100]), X: pick([20, 40, 50, 100]) * pick([1, -1]), V: pick([50, 100, 230]) }),
    solve: (p) => { const Zp = A.parallel(A.cx(p.R2, 0), A.cx(0, p.X)); const Z = A.add(A.cx(p.R1, 0), Zp); const I = p.V / A.abs(Z); return { Zp, Z, Zm: A.abs(Z), I, phi: A.argDeg(Z), Vp: I * A.abs(Zp) }; },
    text: (p) => `Un resistore ${'<var>R</var><sub>1</sub>'} = ${p.R1} Ω è in serie al parallelo tra ${'<var>R</var><sub>2</sub>'} = ${p.R2} Ω e una reattanza ${p.X > 0 ? 'induttiva' : 'capacitiva'} di ${Math.abs(p.X)} Ω. Il tutto è alimentato a ${p.V} V. Trova |<var>Z</var>|, la corrente e la tensione sul parallelo.`,
    asks: (p, r) => [Q.qX('|' + Zh + '|', r.Zm), h.qI('<var>I</var>', r.I), h.qV('<var>V</var><sub>p</sub>', r.Vp)],
    steps: (p, r) => step(`<b><var>Z</var></b><sub>p</sub> = ${frac(N(p.R2) + ' · ' + Q.cRect(A.cx(0, p.X)), Q.cRect(A.cx(p.R2, p.X)))} = ${Q.cRect(r.Zp, 'Ω')}`, 'Prima il parallelo, come nelle reti in continua.') +
      step(`<b>${Zh}</b> = <var>R</var><sub>1</sub> + <b><var>Z</var></b><sub>p</sub> = ${Q.cRect(r.Z, 'Ω')} = ${res(Q.cPol(r.Z, 'Ω'))}`, 'Poi la serie: si sommano le parti reali e quelle immaginarie.') +
      step(`<var>I</var> = <var>V</var>/|${Zh}| = ${res(U(r.I, 'A'))}`) +
      step(`<var>V</var><sub>p</sub> = |<b><var>Z</var></b><sub>p</sub>| · <var>I</var> = ${N(A.abs(r.Zp), 4)} Ω · ${U(r.I, 'A')} = ${res(U(r.Vp, 'V'))}`, 'Gli stessi metodi della continua (serie, parallelo, partitori) valgono con i numeri complessi.'),
  });
  p4.push({
    id: 'par-mc', title: 'Concetti sui paralleli', level: 1,
    ...mc([
      ['In un parallelo R-L la corrente totale si trova…', ['sommando I_R e I_L come vettori a 90°', 'sommando i valori efficaci', 'sottraendo I_L da I_R', 'con I = V/(R + X_L)'], 'Le correnti nei rami sono sfasate di 90°: Pitagora.'],
      ['Due impedenze in parallelo si combinano come…', ['Z1·Z2/(Z1 + Z2), con i complessi', 'Z1 + Z2', 'il modulo della differenza', 'la media dei moduli'], 'Le regole della continua valgono pari pari con i numeri complessi.'],
      ['L\'ammettenza Y è…', ['l\'inverso dell\'impedenza, 1/Z', 'la parte reale di Z', 'il modulo di Z', 'la reattanza'], 'In parallelo le ammettenze si sommano, come le conduttanze in continua.'],
    ]),
  });

  function widgetPar(host) {
    const c = K.widgetCard('Correnti in un parallelo R, L, C', '10 V: guarda come si compensano le correnti in L e in C');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const out = el('div', 'forms');
    grid.append(fig, out);
    const draw = (v) => {
      const Lh = v.L * 1e-3;
      const Cf = v.C * 1e-6;
      const IR = 10 / v.R;
      const IL = 10 / A.XL(v.f, Lh);
      const IC = 10 / A.XC(v.f, Cf);
      const I = A.cx(IR, IC - IL);
      const a = A.cx(IR, 0);
      fig.innerHTML = Q.phasorSVG({ W: 300, H: 300, vecs: [{ z: a, label: 'IR', cls: 'p1' }, { from: a, z: A.cx(0, IC), label: 'IC', cls: 'p2', side: 'l' }, { from: A.cx(IR, IC), z: A.cx(0, -IL), label: 'IL', cls: 'p3', side: 'r' }, { z: I, label: 'I', cls: 'ps' }], title: 'Fasori delle correnti, tensione come riferimento' }).replace(/>I([RLC])</g, '>I<tspan class="sb" dy="3">$1</tspan><');
      const fr = A.f0(Lh, Cf);
      out.innerHTML = `<div class="form-row"><span class="label">Correnti</span><div class="f"><var>I</var><sub>R</sub> = ${U(IR, 'A')}; <var>I</var><sub>L</sub> = ${U(IL, 'A')}; <var>I</var><sub>C</sub> = ${U(IC, 'A')}</div></div>
        <div class="form-row"><span class="label">Totale</span><div class="f"><var>I</var> = ${res(Q.cPol(I, 'A'))}</div><span class="meta">${Math.abs(IL - IC) < 0.02 * IR ? 'Antirisonanza: IL e IC si annullano, resta solo IR.' : IL > IC ? 'Prevale l\'induttore: corrente in ritardo.' : 'Prevale il condensatore: corrente in anticipo.'} Antirisonanza a ${App.si(fr, 'Hz', 4)}.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'R', label: '<var>R</var> (Ω)', min: 5, max: 200, log: true, value: 50 },
      { id: 'L', label: '<var>L</var> (mH)', min: 10, max: 1000, log: true, value: 100 },
      { id: 'C', label: '<var>C</var> (µF)', min: 1, max: 500, log: true, value: 100 },
      { id: 'f', label: '<var>f</var> (Hz)', min: 10, max: 500, log: true, value: 50 },
    ], draw);
    c.append(grid);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'parallelo', num: 4, short: 'Parallelo', title: 'Paralleli e reti in alternata',
    intro: 'Con i numeri complessi tutte le regole delle reti in continua restano valide: serie, parallelo, partitori, Kirchhoff. Basta sostituire le resistenze con le impedenze.',
    goals: ['Correnti nei rami', 'Parallelo con i complessi', 'Reti miste', 'Antirisonanza'],
    widgets: [widgetPar],
    example: p4[0], exampleTitle: 'Esempio: resistore e reattanza in parallelo',
    families: p4,
    theory: `
      <article class="note"><h4>Parallelo</h4>
        <div class="eq"><span>${frac('1', '<b><var>Z</var></b>')} = ${frac('1', '<b><var>Z</var></b><sub>1</sub>')} + ${frac('1', '<b><var>Z</var></b><sub>2</sub>')}</span><span><b><var>Z</var></b> = ${frac('<b><var>Z</var></b><sub>1</sub><b><var>Z</var></b><sub>2</sub>', '<b><var>Z</var></b><sub>1</sub> + <b><var>Z</var></b><sub>2</sub>')}</span></div>
        <p>Spesso conviene lavorare con le correnti: ogni ramo ha la stessa tensione, le correnti si sommano come fasori.</p></article>
      <article class="note"><h4>Il metodo per le reti</h4>
        <ol><li>Calcola le reattanze alla frequenza di lavoro.</li><li>Scrivi le impedenze in forma complessa.</li><li>Riduci serie e paralleli come in continua (somme in rettangolare, prodotti e quozienti in polare).</li><li>Torna indietro con Ohm e i partitori.</li></ol>
        <p>Valgono anche Kirchhoff, Millman, sovrapposizione e Thevenin.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'rlc', year: '4', yearLabel: '4ª', title: 'Impedenza, circuiti RLC e risonanza', route: 'rlc-serie', lessonWord: 'Lezione',
    desc: 'Impedenza complessa, RL e RC serie, RLC serie, risonanza con fattore di merito e banda, paralleli e reti miste in alternata.',
    lessons,
  });
})();
