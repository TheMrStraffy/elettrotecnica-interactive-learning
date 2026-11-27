/* 4ª — Corrente alternata e fasori */
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
  const V_ = (s) => `<var>V</var><sub>${s}</sub>`;
  const sgnDeg = (d) => (d === 0 ? '' : d > 0 ? ` + ${N(d)}°` : ` − ${N(-d)}°`);
  const norm180 = (d) => { let x = ((d % 360) + 360) % 360; if (x > 180) x -= 360; return x; };

  // =====================================================================
  // 1 — La sinusoide
  // =====================================================================
  const s1 = [];
  s1.push({
    id: 'ac-par', title: 'Leggi l\'espressione della sinusoide', level: 1,
    defaults: { Vm: 325, f: 50, ph: 0, m: 0 },
    gen: () => ({ Vm: pick([10, 12, 15, 20, 24, 50, 100, 311, 325]), f: pick([50, 60, 100, 200, 400, 500, 1000]), ph: pick([0, 0, 30, 45, 60, 90, -30, -45, -60]), m: rand(0, 1) }),
    solve: (p) => ({ w: A.omega(p.f), Veff: A.eff(p.Vm), T: A.period(p.f) }),
    text: (p, r) => (p.m === 0
      ? `Una tensione vale <var>v</var>(<var>t</var>) = ${p.Vm} sin(${N(r.w, 4)}<var>t</var>${sgnDeg(p.ph)}) V, con ω in rad/s. Quanto valgono il valore efficace, la frequenza e il periodo?`
      : `Un generatore dà una tensione sinusoidale di ampiezza ${p.Vm} V e frequenza ${App.si(p.f, 'Hz')}. Quanto valgono la pulsazione ω, il periodo e il valore efficace?`),
    asks: (p, r) => (p.m === 0
      ? [h.qV('<var>V</var><sub>eff</sub>', r.Veff), Q.qHz('<var>f</var>', p.f), Q.qT('<var>T</var>', r.T)]
      : [{ label: 'ω', unit: 'rad/s', value: r.w }, Q.qT('<var>T</var>', r.T), h.qV('<var>V</var><sub>eff</sub>', r.Veff)]),
    steps: (p, r) => step(`<var>V</var><sub>eff</sub> = ${frac('<var>V</var><sub>max</sub>', '√2')} = ${frac(p.Vm + ' V', '1,414')} = ${res(U(r.Veff, 'V'))}`, 'Il valore efficace è quello che scalda un resistore come una tensione continua dello stesso valore. È quello che leggi sul multimetro.') +
      (p.m === 0
        ? step(`<var>f</var> = ${frac('ω', '2π')} = ${frac(N(r.w, 4), '6,283')} = ${res(App.si(p.f, 'Hz'))}`, 'Il numero davanti a t è la pulsazione ω = 2πf.')
        : step(`ω = 2π<var>f</var> = 6,283 · ${App.si(p.f, 'Hz')} = ${res(N(r.w, 4) + ' rad/s')}`)) +
      step(`<var>T</var> = ${frac('1', '<var>f</var>')} = ${frac('1', App.si(p.f, 'Hz'))} = ${res(U(r.T, 's'))}`, 'Il periodo è il tempo di un ciclo completo.') +
      (p.ph ? step(`φ = ${N(p.ph)}°: la sinusoide è ${p.ph > 0 ? 'in anticipo' : 'in ritardo'} rispetto a una con fase zero`) : ''),
  });
  s1.push({
    id: 'ac-rete', title: 'La tensione di rete', level: 1,
    gen: () => ({ Veff: pick([230, 230, 400, 120, 24, 12]), f: pick([50, 50, 60]) }),
    solve: (p) => ({ Vm: A.peak(p.Veff), T: A.period(p.f) }),
    text: (p) => `Una presa fornisce ${p.Veff} V (valore efficace) a ${p.f} Hz. Quanto vale la tensione di picco? E quella picco-picco, che vedresti all'oscilloscopio? Quanto dura un periodo?`,
    asks: (p, r) => [h.qV('<var>V</var><sub>max</sub>', r.Vm), h.qV('<var>V</var><sub>pp</sub>', 2 * r.Vm), Q.qT('<var>T</var>', r.T)],
    steps: (p, r) => step(`<var>V</var><sub>max</sub> = √2 · <var>V</var><sub>eff</sub> = 1,414 · ${p.Veff} V = ${res(U(r.Vm, 'V'))}`, `Nella rete di casa la tensione arriva a ±${N(r.Vm, 3)} V, non solo a ${p.Veff}: è per questo che i componenti collegati alla rete devono sopportare tensioni più alte del valore nominale.`) +
      step(`<var>V</var><sub>pp</sub> = 2 · <var>V</var><sub>max</sub> = ${res(U(2 * r.Vm, 'V'))}`, 'Da picco positivo a picco negativo.') +
      step(`<var>T</var> = 1/<var>f</var> = ${res(U(r.T, 's'))}`),
  });
  s1.push({
    id: 'ac-osc', title: 'Leggi l\'oscilloscopio', level: 2,
    gen: () => ({ vdiv: pick([0.5, 1, 2, 5, 10]), tdiv: pick([0.1e-3, 0.2e-3, 0.5e-3, 1e-3, 2e-3, 5e-3]), dv: pick([2, 3, 4, 5, 6]), dt: pick([2, 2.5, 4, 5, 8]) }),
    solve: (p) => { const Vpp = p.dv * p.vdiv; const T = p.dt * p.tdiv; return { Vpp, Vm: Vpp / 2, Veff: A.eff(Vpp / 2), T, f: 1 / T }; },
    text: (p) => `All'oscilloscopio (${N(p.vdiv)} V/div, ${App.si(p.tdiv, 's')}/div) la traccia è alta ${N(p.dv)} divisioni da picco a picco e un periodo occupa ${N(p.dt)} divisioni orizzontali. Quanto valgono ampiezza, valore efficace e frequenza?`,
    fig: (p, r) => ({ svg: Q.scopeSVG({ vdiv: p.vdiv, tdiv: p.tdiv, amp: r.Vm, f: r.f }) }),
    asks: (p, r) => [h.qV('<var>V</var><sub>max</sub>', r.Vm), h.qV('<var>V</var><sub>eff</sub>', r.Veff), Q.qHz('<var>f</var>', r.f)],
    hint: () => 'Ampiezza: metà delle divisioni picco-picco per i V/div. Periodo: divisioni per il tempo/div.',
    steps: (p, r) => step(`<var>V</var><sub>pp</sub> = ${N(p.dv)} div · ${N(p.vdiv)} V/div = ${U(r.Vpp, 'V')} → <var>V</var><sub>max</sub> = ${res(U(r.Vm, 'V'))}`, 'L\'ampiezza è metà del picco-picco.') +
      step(`<var>V</var><sub>eff</sub> = ${frac('<var>V</var><sub>max</sub>', '√2')} = ${res(U(r.Veff, 'V'))}`) +
      step(`<var>T</var> = ${N(p.dt)} div · ${App.si(p.tdiv, 's')}/div = ${U(r.T, 's')} → <var>f</var> = 1/<var>T</var> = ${res(App.si(r.f, 'Hz', 4))}`),
  });
  s1.push({
    id: 'ac-inst', title: 'Il valore in un istante', level: 2,
    gen: () => {
      const f = pick([50, 100, 200, 500, 1000]);
      return { Vm: pick([10, 12, 20, 50, 100, 325]), f, ph: pick([0, 0, 30, 45, 60, -30, -45, 90]), t: pick([1, 2, 2.5, 4, 5, 7.5, 10, 12.5, 15]) * 1e-3 * (50 / f), m: Math.random() < 0.65 ? 0 : 1 };
    },
    solve: (p) => {
      const deg = 360 * p.f * p.t + p.ph;
      const v = p.Vm * Math.sin(deg * A.D2R);
      const tmax = (((90 - p.ph) % 360) + 360) % 360 / (360 * p.f);
      return { deg, v: Math.abs(v) < 1e-9 ? 0 : v, tmax };
    },
    text: (p) => (p.m === 0
      ? `La tensione <var>v</var>(<var>t</var>) = ${p.Vm} sin(2π · ${App.si(p.f, 'Hz')} · <var>t</var>${sgnDeg(p.ph)}) V. Quanto vale all'istante <var>t</var> = ${App.si(p.t, 's')}?`
      : `La tensione <var>v</var>(<var>t</var>) = ${p.Vm} sin(2π · ${App.si(p.f, 'Hz')} · <var>t</var>${sgnDeg(p.ph)}) V. Dopo quanto tempo da <var>t</var> = 0 raggiunge il primo massimo?`),
    asks: (p, r) => (p.m === 0 ? [Object.assign(h.qV('<var>v</var>(<var>t</var>)', r.v), { signNote: 'Controlla il segno: in quell\'istante la tensione può essere negativa.' })] : [Q.qT('<var>t</var><sub>max</sub>', r.tmax)]),
    hint: () => 'Lavora tutto in gradi: in un periodo l\'angolo fa 360°, quindi l\'angolo all\'istante t è 360° · f · t più la fase.',
    steps: (p, r) => (p.m === 0
      ? step(`Angolo: 360° · ${App.si(p.f, 'Hz')} · ${App.si(p.t, 's')}${sgnDeg(p.ph)} = ${N(r.deg)}°`, 'Attento alla calcolatrice: se metti l\'angolo in gradi deve essere in modalità DEG. In radianti l\'angolo sarebbe 2πft + φ(rad).') +
        step(`<var>v</var> = ${p.Vm} · sin(${N(r.deg)}°) = ${res(U(r.v, 'V'))}`)
      : step(`Il seno è massimo a 90°: 360° · <var>f</var> · <var>t</var>${sgnDeg(p.ph)} = 90° (o 90° + 360°…)`, 'Se la fase iniziale supera già 90°, il primo massimo è quello del giro successivo.') +
        step(`<var>t</var> = ${frac(N((((90 - p.ph) % 360) + 360) % 360) + '°', '360° · ' + App.si(p.f, 'Hz'))} = ${res(App.si(r.tmax, 's', 4))}`)),
  });
  s1.push({
    id: 'ac-mc', title: 'Concetti sulla sinusoide', level: 1,
    ...mc([
      ['Il multimetro, in alternata, misura di solito…', ['il valore efficace', 'il valore di picco', 'il valore picco-picco', 'il valore medio su un periodo'], 'Il valore medio di una sinusoide su un periodo è zero: lo strumento indica il valore efficace, Vmax/√2.'],
      ['Il valore efficace di una tensione alternata è…', ['la tensione continua che scalderebbe un resistore allo stesso modo', 'la tensione più alta raggiunta', 'la media dei valori positivi', 'la tensione all\'istante zero'], 'È definito dagli effetti termici: stessa potenza media su un resistore.'],
      ['Raddoppiando la frequenza, il periodo…', ['si dimezza', 'raddoppia', 'resta uguale', 'diventa quattro volte più lungo'], 'T = 1/f.'],
      ['La frequenza della rete elettrica in Italia è…', ['50 Hz', '60 Hz', '230 Hz', '400 Hz'], 'In Europa 50 Hz; in Nord America 60 Hz.'],
      ['Due sinusoidi della stessa frequenza sono "in fase" se…', ['passano per lo zero e per i massimi negli stessi istanti', 'hanno la stessa ampiezza', 'hanno lo stesso valore efficace', 'si sommano dando zero'], 'Lo sfasamento misura di quanto una precede l\'altra.'],
    ]),
  });

  function widgetSine(host) {
    const c = K.widgetCard('La sinusoide', 'Cambia ampiezza, frequenza e fase; lo schermo mostra 20 ms');
    const fig = el('div');
    const out = el('div', 'forms');
    const draw = (v) => {
      const tmax = 0.02;
      const T = 1 / v.f;
      const traces = [];
      if (v.ph) traces.push({ amp: v.Vm, f: v.f, deg: 0, cls: 'ref', dash: true });
      traces.push({ amp: v.Vm, f: v.f, deg: v.ph, cls: 'gen' });
      const Ve = A.eff(v.Vm);
      fig.innerHTML = Q.waveSVG({ tmax, ymax: 20, traces, hl: [{ y: Ve, label: 'V<tspan class="sb" dy="3">eff</tspan>' }, { y: -Ve }], marks: T <= tmax ? [{ t: T, label: 'T' }] : [], ylabel: 'v', title: 'Tensione sinusoidale' });
      const dt = A.delay(Math.abs(v.ph), v.f);
      out.innerHTML = `<div class="form-row"><span class="label">Valore efficace</span><div class="f"><var>V</var><sub>eff</sub> = <var>V</var><sub>max</sub>/√2 = ${res(U(Ve, 'V'))}</div></div>
        <div class="form-row"><span class="label">Tempo</span><div class="f"><var>T</var> = 1/<var>f</var> = ${U(T, 's')}; ω = 2π<var>f</var> = ${N(A.omega(v.f), 4)} rad/s</div><span class="meta">In 20 ms ci stanno ${N(0.02 * v.f, 3)} periodi.</span></div>
        <div class="form-row"><span class="label">Fase</span><div class="f">φ = ${N(v.ph)}°${v.ph ? ` → ${v.ph > 0 ? 'in anticipo' : 'in ritardo'} di Δ<var>t</var> = ${U(dt, 's')}` : ''}</div><span class="meta">${v.ph ? 'La curva tratteggiata ha fase zero: confrontale.' : 'Prova a dare una fase: comparirà la sinusoide di riferimento.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'Vm', label: 'Ampiezza <var>V</var><sub>max</sub> (V)', min: 1, max: 20, step: 0.5, value: 10 },
      { id: 'f', label: 'Frequenza <var>f</var> (Hz)', min: 25, max: 500, log: true, value: 50 },
      { id: 'ph', label: 'Fase φ (°)', min: -180, max: 180, step: 15, value: 0 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'sinusoide', num: 1, short: 'Sinusoide', title: 'La tensione sinusoidale',
    intro: 'La corrente alternata cambia verso continuamente seguendo una sinusoide. È la forma della tensione di rete, prodotta dagli alternatori, ed è la base di tutta l\'analisi dei circuiti in alternata.',
    goals: ['Ampiezza, periodo, frequenza, fase', 'Valore efficace', 'Oscilloscopio', 'Valore istantaneo'],
    widgets: [widgetSine],
    example: s1[0], exampleTitle: 'Esempio: la tensione di rete',
    families: s1,
    theory: `
      <article class="note"><h4>L'espressione</h4>
        <div class="eq"><span><var>v</var>(<var>t</var>) = <var>V</var><sub>max</sub> sin(ω<var>t</var> + φ)</span></div>
        <ul><li><var>V</var><sub>max</sub>: ampiezza (valore di picco); <var>V</var><sub>pp</sub> = 2<var>V</var><sub>max</sub>.</li>
          <li><var>f</var>: frequenza in hertz; <var>T</var> = 1/<var>f</var>: periodo; ω = 2π<var>f</var>: pulsazione in rad/s.</li>
          <li>φ: fase iniziale. Positiva = in anticipo, negativa = in ritardo.</li></ul></article>
      <article class="note"><h4>Valore efficace</h4>
        <div class="eq"><span><var>V</var><sub>eff</sub> = ${frac('<var>V</var><sub>max</sub>', '√2')} ≈ 0,707 <var>V</var><sub>max</sub></span></div>
        <p>È la tensione continua che darebbe la stessa potenza su un resistore. I 230 V della rete sono un valore efficace: il picco è 325 V. In alternata le formule delle potenze si usano con i valori efficaci.</p></article>
      <article class="note"><h4>All'oscilloscopio</h4>
        <p>Lo schermo è diviso in quadretti (divisioni). Ampiezza = divisioni × V/div; periodo = divisioni × tempo/div. Lo sfasamento tra due tracce si misura in tempo e si converte: φ = 360° · Δ<var>t</var>/<var>T</var>.</p></article>`,
  });

  // =====================================================================
  // 2 — I numeri complessi
  // =====================================================================
  const c2 = [];
  const TRIP = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [8, 15], [1, 1], [2, 2], [5, 5], [10, 10], [0, 5], [5, 0], [20, 15]];
  c2.push({
    id: 'cx-r2p', title: 'Da rettangolare a polare', level: 1,
    defaults: { a: 3, b: 4 },
    gen: () => { const [x, y] = pick(TRIP); return { a: x * pick([1, -1]), b: y * pick([1, -1]) }; },
    solve: (p) => { const z = A.cx(p.a, p.b); return { m: A.abs(z), d: A.argDeg(z) }; },
    text: (p) => `Scrivi in forma polare il numero complesso <var>z</var> = ${Q.cRect(A.cx(p.a, p.b))}.`,
    fig: (p) => ({ svg: Q.phasorSVG({ W: 240, H: 240, vecs: [{ z: A.cx(p.a, p.b), label: 'z', cls: 'p1' }], title: 'Il numero nel piano complesso' }) }),
    asks: (p, r) => [{ label: '|<var>z</var>|', unit: '', value: r.m }, Q.qDeg('φ', r.d)],
    hint: () => 'Il modulo con Pitagora; l\'angolo con l\'arcotangente, guardando bene in che quadrante sta il punto.',
    steps: (p, r) => step(`|<var>z</var>| = √(<var>a</var>² + <var>b</var>²) = √(${N(p.a)}² + ${N(p.b)}²) = ${res(N(r.m, 4))}`, 'È la lunghezza del vettore: teorema di Pitagora.') +
      step(p.a === 0 ? `<var>a</var> = 0: il numero sta sull'asse immaginario → φ = ${res(N(r.d) + '°')}` : `arctan(${N(p.b)}/${N(p.a)}) = ${N(Math.atan(p.b / p.a) * A.R2D, 4)}°${p.a < 0 ? ` → con <var>a</var> < 0 si aggiungono 180°: φ = ${res(N(r.d, 4) + '°')}` : ` → φ = ${res(N(r.d, 4) + '°')}`}`, p.a < 0 ? 'La calcolatrice dà l\'arcotangente solo tra −90° e +90°: con la parte reale negativa il punto è a sinistra, nel 2° o 3° quadrante.' : 'Parte reale positiva: l\'arcotangente è già l\'angolo giusto.') +
      step(`<var>z</var> = ${res(Q.cPol(A.cx(p.a, p.b)))}`),
  });
  c2.push({
    id: 'cx-p2r', title: 'Da polare a rettangolare', level: 1,
    gen: () => ({ m: pick([2, 4, 5, 6, 8, 10, 12, 20]), d: pick([0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90, -120, -135, -150]) }),
    solve: (p) => { const z = A.polar(p.m, p.d); return { a: Math.abs(z.re) < 1e-9 ? 0 : z.re, b: Math.abs(z.im) < 1e-9 ? 0 : z.im }; },
    text: (p) => `Scrivi in forma rettangolare <var>z</var> = ${Q.pol(p.m, p.d)}.`,
    asks: (p, r) => [{ label: 'parte reale <var>a</var>', unit: '', value: r.a, signNote: 'Controlla il segno: dipende dal quadrante.' }, { label: 'parte immaginaria <var>b</var>', unit: '', value: r.b, signNote: 'Controlla il segno: dipende dal quadrante.' }],
    steps: (p, r) => step(`<var>a</var> = |<var>z</var>| cos φ = ${p.m} · cos(${N(p.d)}°) = ${res(N(r.a, 4))}`) + step(`<var>b</var> = |<var>z</var>| sin φ = ${p.m} · sin(${N(p.d)}°) = ${res(N(r.b, 4))}`) +
      step(`<var>z</var> = ${res(Q.cRect(A.cx(r.a, r.b)))}`, 'La forma rettangolare serve per sommare e sottrarre.'),
  });
  c2.push({
    id: 'cx-sum', title: 'Somma e differenza', level: 2,
    gen: () => { const r = () => rand(-9, 9) || 4; return { a1: r(), b1: r(), a2: r(), b2: r(), op: pick(['+', '−']) }; },
    solve: (p) => { const z1 = A.cx(p.a1, p.b1); const z2 = A.cx(p.a2, p.b2); const z = p.op === '+' ? A.add(z1, z2) : A.sub(z1, z2); return { z, m: A.abs(z) }; },
    text: (p) => `Calcola <var>z</var><sub>1</sub> ${p.op} <var>z</var><sub>2</sub> con <var>z</var><sub>1</sub> = ${Q.cRect(A.cx(p.a1, p.b1))} e <var>z</var><sub>2</sub> = ${Q.cRect(A.cx(p.a2, p.b2))}. Scrivi il risultato in forma rettangolare e calcola il modulo.`,
    asks: (p, r) => [{ label: 'parte reale', unit: '', value: r.z.re, signNote: 'Controlla i segni.' }, { label: 'parte immaginaria', unit: '', value: r.z.im, signNote: 'Controlla i segni.' }, { label: 'modulo', unit: '', value: r.m }],
    steps: (p, r) => step(`Parti reali: ${N(p.a1)} ${p.op} (${N(p.a2)}) = ${N(r.z.re)}; parti immaginarie: ${N(p.b1)} ${p.op} (${N(p.b2)}) = ${N(r.z.im)}`, 'Somme e differenze si fanno in forma rettangolare, parte per parte, come per i vettori.') +
      step(`<var>z</var> = ${res(Q.cRect(r.z))}`) + step(`|<var>z</var>| = √(${N(r.z.re)}² + ${N(r.z.im)}²) = ${res(N(r.m, 4))}`, 'Il modulo della somma non è la somma dei moduli.'),
  });
  c2.push({
    id: 'cx-mul', title: 'Prodotto e quoziente', level: 2,
    gen: () => ({ m1: pick([2, 3, 4, 5, 6, 10, 12, 20]), d1: pick([0, 30, 45, 60, 90, -30, -45, -60, -90]), m2: pick([2, 4, 5, 8, 10]), d2: pick([0, 30, 45, 60, 90, -30, -45, -60, -90]), op: pick(['·', '/']) }),
    solve: (p) => ({ m: p.op === '·' ? p.m1 * p.m2 : p.m1 / p.m2, d: norm180(p.op === '·' ? p.d1 + p.d2 : p.d1 - p.d2) }),
    text: (p) => `Calcola <var>z</var><sub>1</sub> ${p.op === '·' ? '·' : '/'} <var>z</var><sub>2</sub> con <var>z</var><sub>1</sub> = ${Q.pol(p.m1, p.d1)} e <var>z</var><sub>2</sub> = ${Q.pol(p.m2, p.d2)}.`,
    asks: (p, r) => [{ label: 'modulo', unit: '', value: r.m }, Q.qDeg('angolo', r.d)],
    steps: (p, r) => (p.op === '·'
      ? step(`Moduli: ${p.m1} · ${p.m2} = ${res(N(r.m))}; angoli: ${N(p.d1)}° + (${N(p.d2)}°) = ${res(N(r.d) + '°')}`, 'In forma polare il prodotto è facile: i moduli si moltiplicano, gli angoli si sommano.')
      : step(`Moduli: ${p.m1} / ${p.m2} = ${res(N(r.m, 4))}; angoli: ${N(p.d1)}° − (${N(p.d2)}°) = ${res(N(r.d) + '°')}`, 'Nel quoziente i moduli si dividono e gli angoli si sottraggono.')) +
      step(`Risultato: ${Q.pol(r.m, r.d)}`, 'È quello che succede con la legge di Ohm in alternata: I = V/Z divide i moduli e sottrae gli angoli.'),
  });
  c2.push({
    id: 'cx-mc', title: 'Concetti sui complessi', level: 1,
    ...mc([
      ['In elettrotecnica l\'unità immaginaria si indica con j perché…', ['la lettera i è già usata per la corrente', 'è più facile da scrivere', 'vale −1', 'indica la frequenza'], 'j² = −1, come la i della matematica.'],
      ['Moltiplicare un numero complesso per j…', ['lo ruota di 90° in senso antiorario', 'ne raddoppia il modulo', 'lo ruota di 180°', 'lo rende reale'], 'j = 1∠90°: il modulo resta uguale, l\'angolo aumenta di 90°.'],
      ['Per sommare due numeri complessi conviene la forma…', ['rettangolare', 'polare', 'esponenziale', 'qualsiasi: è uguale'], 'In rettangolare si sommano parti reali e immaginarie.'],
      ['Per moltiplicare e dividere conviene la forma…', ['polare', 'rettangolare', 'con il coniugato', 'non si può fare'], 'Moduli moltiplicati (o divisi), angoli sommati (o sottratti).'],
      ['Il coniugato di 3 + j4 è…', ['3 − j4', '−3 + j4', '−3 − j4', '4 + j3'], 'Si cambia il segno della parte immaginaria: il punto si specchia rispetto all\'asse reale.'],
    ]),
  });

  function widgetComplex(host) {
    const c = K.widgetCard('Il piano complesso', 'z₁ in forma rettangolare, z₂ in forma polare: scegli l\'operazione');
    const OPS = ['+', '−', '·', '/'];
    let op = 0;
    const seg = el('div', 'seg');
    seg.innerHTML = OPS.map((o, i) => `<button type="button" data-i="${i}">z₁ ${o} z₂</button>`).join('');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const out = el('div', 'forms');
    grid.append(fig, out);
    let last;
    const draw = (v) => {
      last = v;
      const z1 = A.cx(v.a, v.b);
      const z2 = A.polar(v.m, v.d);
      const zero = A.abs(z2) < 1e-12;
      const r = op === 0 ? A.add(z1, z2) : op === 1 ? A.sub(z1, z2) : op === 2 ? A.mul(z1, z2) : zero ? null : A.div(z1, z2);
      const vecs = [{ z: z1, label: 'z₁', cls: 'p1' }, { z: z2, label: 'z₂', cls: 'p2' }];
      if (r) {
        if (op === 0) vecs.push({ from: z1, z: z2, cls: 'p2', dash: true });
        if (op === 1) vecs.push({ from: z1, z: A.scale(z2, -1), cls: 'p2', dash: true });
        vecs.push({ z: r, label: 'z', cls: 'ps' });
      }
      fig.innerHTML = Q.phasorSVG({ W: 300, H: 300, vecs, title: 'Numeri complessi come vettori' });
      const how = ['si sommano le parti reali e le parti immaginarie', 'si sottraggono parte reale e parte immaginaria', 'si moltiplicano i moduli e si sommano gli angoli', 'si dividono i moduli e si sottraggono gli angoli'][op];
      out.innerHTML = `<div class="form-row"><span class="label">z₁</span><div class="f">${Q.cRect(z1)} = ${Q.cPol(z1)}</div></div>
        <div class="form-row"><span class="label">z₂</span><div class="f">${Q.cPol(z2)} = ${Q.cRect(z2)}</div></div>
        <div class="form-row"><span class="label">z = z₁ ${OPS[op]} z₂</span><div class="f">${r ? res(Q.cRect(r)) + ' = ' + Q.cPol(r) : 'non si divide per zero'}</div><span class="meta">${how}.</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === op)));
    };
    const sl = K.sliders(c, [
      { id: 'a', label: 'z₁: parte reale', min: -10, max: 10, step: 0.5, value: 3 },
      { id: 'b', label: 'z₁: parte immaginaria', min: -10, max: 10, step: 0.5, value: 4 },
      { id: 'm', label: 'z₂: modulo', min: 0, max: 10, step: 0.5, value: 2 },
      { id: 'd', label: 'z₂: angolo (°)', min: -180, max: 180, step: 5, value: 90 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { op = Number(b.dataset.i); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(grid);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'complessi', num: 2, short: 'Complessi', title: 'I numeri complessi',
    intro: 'In alternata tensioni e correnti hanno un\'ampiezza e una fase: due informazioni insieme. I numeri complessi le portano entrambe e trasformano i calcoli con le sinusoidi in semplici operazioni algebriche.',
    goals: ['Forma rettangolare e polare', 'Conversioni e quadranti', 'Somma e differenza', 'Prodotto e quoziente'],
    widgets: [widgetComplex],
    example: c2[0], exampleTitle: 'Esempio: da rettangolare a polare',
    families: c2,
    theory: `
      <article class="note"><h4>Due forme</h4>
        <div class="eq"><span><var>z</var> = <var>a</var> + j<var>b</var> = |<var>z</var>| ∠ φ</span></div>
        <ul><li>j² = −1 (in elettrotecnica si usa j perché i è la corrente).</li>
          <li>|<var>z</var>| = √(<var>a</var>² + <var>b</var>²); φ = arctan(<var>b</var>/<var>a</var>), aggiungendo 180° se <var>a</var> < 0.</li>
          <li><var>a</var> = |<var>z</var>| cos φ; <var>b</var> = |<var>z</var>| sin φ.</li></ul></article>
      <article class="note"><h4>Operazioni</h4>
        <ul><li>Somma e differenza: in forma rettangolare, parte per parte.</li>
          <li>Prodotto: moduli moltiplicati, angoli sommati. Quoziente: moduli divisi, angoli sottratti.</li>
          <li>Coniugato: <var>a</var> − j<var>b</var>; <var>z</var> · <var>z</var>* = |<var>z</var>|².</li></ul></article>
      <article class="note"><h4>A che cosa servono</h4>
        <p>Ogni sinusoide di frequenza nota si rappresenta con un numero complesso (il fasore): il modulo è il valore efficace, l'angolo la fase. Resistori, induttori e condensatori diventano impedenze complesse e la legge di Ohm torna valida: <var>V</var> = <var>Z</var> · <var>I</var>.</p></article>`,
  });

  // =====================================================================
  // 3 — Fasori
  // =====================================================================
  const f3 = [];
  f3.push({
    id: 'fas-sum', title: 'Somma di due sinusoidi', level: 2,
    defaults: { A1: 3, p1: 0, A2: 4, p2: 90 },
    gen: () => {
      if (Math.random() < 0.5) { const [x, y] = pick([[3, 4], [6, 8], [5, 12], [8, 6], [12, 5]]); const p1 = pick([0, 30, -30, 45]); return { A1: x, p1, A2: y, p2: p1 + pick([90, -90]) }; }
      return { A1: pick([2, 4, 5, 6, 10]), p1: pick([0, 30, 45, 60]), A2: pick([2, 3, 4, 5, 8]), p2: pick([-60, -30, 90, 120, -90, 150]) };
    },
    solve: (p) => { const z = A.add(A.polar(p.A1, p.p1), A.polar(p.A2, p.p2)); return { z, m: A.abs(z), d: A.argDeg(z) }; },
    text: (p) => `Due tensioni della stessa frequenza: <var>v</var><sub>1</sub> = ${p.A1} sin(ω<var>t</var>${sgnDeg(p.p1)}) V e <var>v</var><sub>2</sub> = ${p.A2} sin(ω<var>t</var>${sgnDeg(p.p2)}) V sono in serie. Scrivi la tensione totale come <var>V</var><sub>max</sub> sin(ω<var>t</var> + φ).`,
    fig: (p, r, sol) => ({ svg: Q.phasorSVG({ W: 260, H: 260, vecs: [{ z: A.polar(p.A1, p.p1), label: 'V₁', cls: 'p1' }, { z: A.polar(p.A2, p.p2), label: 'V₂', cls: 'p2', from: sol ? A.polar(p.A1, p.p1) : undefined }].concat(sol ? [{ z: r.z, label: 'V', cls: 'ps' }] : []), title: 'Fasori delle due tensioni' }) }),
    asks: (p, r) => [h.qV('<var>V</var><sub>max</sub>', r.m), Q.qDeg('φ', r.d)],
    hint: () => 'Trasforma le due sinusoidi in fasori (numeri complessi), sommali in forma rettangolare e torna in forma polare.',
    steps: (p, r) => {
      const z1 = A.polar(p.A1, p.p1);
      const z2 = A.polar(p.A2, p.p2);
      return step(`<var>V</var><sub>1</sub> = ${Q.pol(p.A1, p.p1)} = ${Q.cRect(z1)}; <var>V</var><sub>2</sub> = ${Q.pol(p.A2, p.p2)} = ${Q.cRect(z2)}`, 'Ogni sinusoide diventa un fasore (qui usiamo le ampiezze; con i valori efficaci il procedimento è identico).') +
        step(`<var>V</var> = <var>V</var><sub>1</sub> + <var>V</var><sub>2</sub> = ${Q.cRect(r.z)} = ${res(Q.cPol(r.z))}`, `Le ampiezze non si sommano: ${p.A1} + ${p.A2} = ${p.A1 + p.A2}, ma la somma vale ${N(r.m, 4)}, perché i massimi non arrivano negli stessi istanti.`) +
        step(`<var>v</var>(<var>t</var>) = ${N(r.m, 4)} sin(ω<var>t</var>${sgnDeg(Math.round(r.d * 100) / 100)}) V`);
    },
  });
  f3.push({
    id: 'fas-write', title: 'Dalla sinusoide al fasore', level: 1,
    gen: () => ({ Vm: pick([10, 14.14, 20, 28.28, 100, 141.4, 325, 311]), ph: pick([0, 30, 45, 60, 90, -30, -45, -60, -90]), m: rand(0, 1) }),
    solve: (p) => ({ Ve: A.eff(p.Vm) }),
    text: (p, r) => (p.m === 0
      ? `Scrivi il fasore (valore efficace e fase) della tensione <var>v</var>(<var>t</var>) = ${N(p.Vm)} sin(ω<var>t</var>${sgnDeg(p.ph)}) V.`
      : `Il fasore di una tensione è <b><var>V</var></b> = ${Q.pol(r.Ve, p.ph, 'V')} (valore efficace). Quanto vale la sua ampiezza? E la fase?`),
    asks: (p, r) => (p.m === 0 ? [h.qV('|<var>V</var>| (efficace)', r.Ve), Q.qDeg('φ', p.ph)] : [h.qV('<var>V</var><sub>max</sub>', p.Vm), Q.qDeg('φ', p.ph)]),
    steps: (p, r) => (p.m === 0
      ? step(`|<var>V</var>| = ${frac(N(p.Vm) + ' V', '√2')} = ${res(U(r.Ve, 'V'))}`, 'In elettrotecnica il modulo del fasore è di solito il valore efficace.') + step(`φ = ${res(N(p.ph) + '°')} → <b><var>V</var></b> = ${Q.pol(r.Ve, p.ph, 'V')}`)
      : step(`<var>V</var><sub>max</sub> = √2 · ${U(r.Ve, 'V')} = ${res(U(p.Vm, 'V'))}`) + step(`La fase resta ${res(N(p.ph) + '°')}`, 'La frequenza non compare nel fasore: è la stessa per tutte le grandezze del circuito.')),
  });
  f3.push({
    id: 'fas-delay', title: 'Sfasamento e ritardo', level: 1,
    gen: () => ({ f: pick([50, 100, 200, 500, 1000, 2000]), d: pick([30, 45, 60, 90, 120, 180]), m: rand(0, 1) }),
    solve: (p) => ({ dt: A.delay(p.d, p.f), T: 1 / p.f }),
    text: (p, r) => (p.m === 0
      ? `Due sinusoidi a ${App.si(p.f, 'Hz')} sono sfasate di ${p.d}°. Di quanto tempo è in ritardo la seconda?`
      : `All'oscilloscopio due tracce a ${App.si(p.f, 'Hz')} passano per lo zero (salendo) a ${App.si(r.dt, 's')} di distanza. Quanto vale lo sfasamento in gradi?`),
    asks: (p, r) => (p.m === 0 ? [Q.qT('Δ<var>t</var>', r.dt)] : [Q.qDeg('φ', p.d)]),
    steps: (p, r) => step(`<var>T</var> = 1/<var>f</var> = ${U(r.T, 's')}`) +
      (p.m === 0 ? step(`Δ<var>t</var> = ${frac('φ', '360°')} · <var>T</var> = ${frac(p.d + '°', '360°')} · ${U(r.T, 's')} = ${res(U(r.dt, 's'))}`, 'Un periodo intero corrisponde a 360°.')
        : step(`φ = 360° · ${frac('Δ<var>t</var>', '<var>T</var>')} = 360° · ${frac(U(r.dt, 's'), U(r.T, 's'))} = ${res(p.d + '°')}`, 'È in anticipo la traccia che passa per prima per lo zero salendo.')),
  });
  f3.push({
    id: 'fas-mc', title: 'Concetti sui fasori', level: 1,
    ...mc([
      ['Un fasore rappresenta…', ['una sinusoide di frequenza nota, con valore efficace e fase', 'una tensione continua', 'un vettore della forza', 'la frequenza di un segnale'], 'Il fasore ruota con velocità ω; la sua proiezione disegna la sinusoide.'],
      ['Si possono sommare con i fasori…', ['solo sinusoidi della stessa frequenza', 'sinusoidi di qualunque frequenza', 'solo tensioni in fase', 'solo correnti'], 'Fasori di frequenze diverse ruoterebbero a velocità diverse.'],
      ['Due tensioni di 3 V e 4 V sfasate di 90° danno in serie…', ['5 V', '7 V', '1 V', '12 V'], 'Pitagora: √(3² + 4²) = 5.'],
      ['Se un fasore è "in ritardo" sta…', ['dopo l\'altro nel verso di rotazione (angolo più piccolo)', 'prima, con angolo più grande', 'sempre sull\'asse reale', 'sull\'asse immaginario'], 'I fasori ruotano in senso antiorario: chi ha l\'angolo maggiore passa prima.'],
    ]),
  });

  function widgetPhasor(host) {
    const c = K.widgetCard('Fasori che ruotano', 'Due tensioni della stessa frequenza e la loro somma');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const wave = el('div');
    grid.append(fig, wave);
    const out = el('p', 'f widget-out');
    const play = el('button', 'btn ghost small');
    play.type = 'button';
    play.textContent = '▶ Fai ruotare';
    let th = 0;
    let raf = null;
    let last;
    const draw = (v) => {
      last = v;
      const z1 = A.polar(v.A1, v.p1 + th);
      const z2 = A.polar(v.A2, v.p2 + th);
      const zs = A.add(z1, z2);
      fig.innerHTML = Q.phasorSVG({ W: 280, H: 280, max: v.A1 + v.A2, vecs: [{ z: z1, label: 'V₁', cls: 'p1' }, { from: z1, z: z2, cls: 'p2', dash: true }, { z: z2, label: 'V₂', cls: 'p2' }, { z: zs, label: 'V', cls: 'ps' }], title: 'Fasori: la somma è il vettore risultante' });
      const ymax = K.niceMax(v.A1 + v.A2);
      const f = 1;
      const tcur = (th / 360) % 1;
      wave.innerHTML = Q.waveSVG({ W: 360, H: 260, tmax: 1, ymax, yu: '', traces: [{ amp: v.A1, f, deg: v.p1, cls: 'p1' }, { amp: v.A2, f, deg: v.p2, cls: 'p2' }, { amp: A.abs(A.add(A.polar(v.A1, v.p1), A.polar(v.A2, v.p2))), f, deg: A.argDeg(A.add(A.polar(v.A1, v.p1), A.polar(v.A2, v.p2))), cls: 'ps' }], marks: [{ t: tcur }], xu: null, xlabel: 't / T', title: 'Le stesse tensioni nel tempo (un periodo)' });
      const z0 = A.add(A.polar(v.A1, v.p1), A.polar(v.A2, v.p2));
      out.innerHTML = `<b><var>V</var></b> = ${Q.pol(v.A1, v.p1)} + ${Q.pol(v.A2, v.p2)} = ${res(Q.cPol(z0))}. La proiezione verticale di ogni fasore è il valore istantaneo: quando il fasore ruota, disegna la sinusoide.`;
    };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; play.textContent = '▶ Fai ruotare'; };
    play.addEventListener('click', () => {
      if (raf) { stop(); return; }
      play.textContent = '■ Ferma';
      let t0 = null;
      const tick = (ts) => {
        if (!c.isConnected) { stop(); return; }
        if (t0 == null) t0 = ts;
        th = ((ts - t0) / 4000) * 360;
        draw(last);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    const sl = K.sliders(c, [
      { id: 'A1', label: '<var>V</var><sub>1</sub> ampiezza', min: 0.5, max: 10, step: 0.5, value: 3 },
      { id: 'p1', label: 'φ<sub>1</sub> (°)', min: -180, max: 180, step: 5, value: 0 },
      { id: 'A2', label: '<var>V</var><sub>2</sub> ampiezza', min: 0.5, max: 10, step: 0.5, value: 4 },
      { id: 'p2', label: 'φ<sub>2</sub> (°)', min: -180, max: 180, step: 5, value: 90 },
    ], (v) => { th = raf ? th : 0; draw(v); });
    c.append(play, grid, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'fasori', num: 3, short: 'Fasori', title: 'Fasori e somma di sinusoidi',
    intro: 'Un fasore è un vettore che ruota: la sua proiezione disegna la sinusoide. Sommare due sinusoidi della stessa frequenza diventa una somma di vettori, cioè di numeri complessi.',
    goals: ['Sinusoide ↔ fasore', 'Somma con i fasori', 'Sfasamento in gradi e in tempo'],
    widgets: [widgetPhasor],
    example: f3[0], exampleTitle: 'Esempio: 3 V + 4 V non fa 7 V',
    families: f3,
    theory: `
      <article class="note"><h4>Il fasore</h4>
        <p>La sinusoide <var>v</var>(<var>t</var>) = <var>V</var><sub>max</sub> sin(ω<var>t</var> + φ) si rappresenta con il numero complesso <b><var>V</var></b> = <var>V</var> ∠ φ, dove <var>V</var> è il valore efficace. La frequenza non compare perché è la stessa per tutto il circuito.</p></article>
      <article class="note"><h4>Somme</h4>
        <p>Tensioni in serie e correnti in un nodo si sommano come fasori: si passa alla forma rettangolare, si sommano le parti e si torna in polare. Kirchhoff vale con i fasori, non con i valori efficaci letti sugli strumenti.</p></article>
      <article class="note"><h4>Anticipo e ritardo</h4>
        <p>I fasori ruotano in senso antiorario: quello con l'angolo maggiore è in anticipo. Uno sfasamento φ corrisponde a un ritardo Δ<var>t</var> = <var>T</var> · φ/360°.</p></article>`,
  });

  // =====================================================================
  // 4 — R, L e C in alternata
  // =====================================================================
  const r4 = [];
  const LV = [1, 2.2, 4.7, 10, 22, 47, 100, 220, 470];
  const CV = [0.1, 0.22, 0.47, 1, 2.2, 4.7, 10, 22, 47, 100];
  r4.push({
    id: 'x-l', title: 'Reattanza induttiva', level: 1,
    gen: () => ({ f: pick([50, 100, 500, 1000, 2000, 5000, 10000]), L: pick(LV) * 1e-3, m: rand(0, 2) }),
    solve: (p) => ({ X: A.XL(p.f, p.L) }),
    text: (p, r) => [
      `Quanto vale la reattanza di un induttore da ${App.si(p.L, 'H')} a ${App.si(p.f, 'Hz')}?`,
      `Un induttore a ${App.si(p.f, 'Hz')} ha una reattanza di ${U(r.X, 'Ω')}. Quanto vale la sua induttanza?`,
      `A quale frequenza un induttore da ${App.si(p.L, 'H')} ha una reattanza di ${U(r.X, 'Ω')}?`,
    ][p.m],
    asks: (p, r) => [[Q.qX('<var>X</var><sub>L</sub>', r.X), Q.qL('<var>L</var>', p.L), Q.qHz('<var>f</var>', p.f)][p.m]],
    steps: (p, r) => [
      step(`<var>X</var><sub>L</sub> = 2π<var>f</var><var>L</var> = 6,283 · ${App.si(p.f, 'Hz')} · ${App.si(p.L, 'H')} = ${res(U(r.X, 'Ω'))}`, 'La reattanza cresce con la frequenza: in continua (f = 0) l\'induttore è un corto.'),
      step(`<var>L</var> = ${frac('<var>X</var><sub>L</sub>', '2π<var>f</var>')} = ${frac(U(r.X, 'Ω'), '6,283 · ' + App.si(p.f, 'Hz'))} = ${res(App.si(p.L, 'H', 4))}`),
      step(`<var>f</var> = ${frac('<var>X</var><sub>L</sub>', '2π<var>L</var>')} = ${frac(U(r.X, 'Ω'), '6,283 · ' + App.si(p.L, 'H'))} = ${res(App.si(p.f, 'Hz', 4))}`),
    ][p.m],
  });
  r4.push({
    id: 'x-c', title: 'Reattanza capacitiva', level: 1,
    gen: () => ({ f: pick([50, 100, 500, 1000, 2000, 5000, 10000]), C: pick(CV) * 1e-6, m: rand(0, 2) }),
    solve: (p) => ({ X: A.XC(p.f, p.C) }),
    text: (p, r) => [
      `Quanto vale la reattanza di un condensatore da ${App.si(p.C, 'F')} a ${App.si(p.f, 'Hz')}?`,
      `Un condensatore a ${App.si(p.f, 'Hz')} ha una reattanza di ${U(r.X, 'Ω')}. Quanto vale la capacità?`,
      `A quale frequenza un condensatore da ${App.si(p.C, 'F')} ha una reattanza di ${U(r.X, 'Ω')}?`,
    ][p.m],
    asks: (p, r) => [[Q.qX('<var>X</var><sub>C</sub>', r.X), Q.qC('<var>C</var>', p.C), Q.qHz('<var>f</var>', p.f)][p.m]],
    steps: (p, r) => [
      step(`<var>X</var><sub>C</sub> = ${frac('1', '2π<var>f</var><var>C</var>')} = ${frac('1', '6,283 · ' + App.si(p.f, 'Hz') + ' · ' + App.si(p.C, 'F'))} = ${res(U(r.X, 'Ω'))}`, 'La reattanza capacitiva diminuisce con la frequenza: in continua il condensatore è un circuito aperto.'),
      step(`<var>C</var> = ${frac('1', '2π<var>f</var><var>X</var><sub>C</sub>')} = ${res(App.si(p.C, 'F', 4))}`),
      step(`<var>f</var> = ${frac('1', '2π<var>C</var><var>X</var><sub>C</sub>')} = ${res(App.si(p.f, 'Hz', 4))}`),
    ][p.m],
  });
  r4.push({
    id: 'x-ohm', title: 'Ohm con una reattanza', level: 1,
    gen: () => { const k = pick(['L', 'C']); return { k, V: pick([12, 24, 50, 110, 230]), f: pick([50, 100, 1000]), val: k === 'L' ? pick(LV) * 1e-3 : pick(CV) * 1e-6 }; },
    solve: (p) => { const X = p.k === 'L' ? A.XL(p.f, p.val) : A.XC(p.f, p.val); return { X, I: p.V / X }; },
    text: (p) => `Un ${p.k === 'L' ? 'induttore ideale da ' + App.si(p.val, 'H') : 'condensatore da ' + App.si(p.val, 'F')} è collegato a ${p.V} V (efficaci), ${App.si(p.f, 'Hz')}. Quanta corrente assorbe? Com'è la corrente rispetto alla tensione?`,
    fig: (p) => T_.acSeries({ V: p.V + ' V', parts: [{ k: p.k, name: p.k, val: p.val }] }),
    asks: (p, r) => [h.qI('<var>I</var>', r.I), h.choice('Fase della corrente', ['in ritardo di 90°', 'in anticipo di 90°', 'in fase', 'in ritardo di 45°'], p.k === 'L' ? 0 : 1)],
    steps: (p, r) => step(`<var>X</var><sub>${p.k}</sub> = ${p.k === 'L' ? '2π<var>f</var><var>L</var>' : '1/(2π<var>f</var><var>C</var>)'} = ${U(r.X, 'Ω')}`) +
      step(`<var>I</var> = ${frac('<var>V</var>', '<var>X</var>')} = ${frac(p.V + ' V', U(r.X, 'Ω'))} = ${res(U(r.I, 'A'))}`, 'La legge di Ohm vale con la reattanza al posto della resistenza (valori efficaci).') +
      step(p.k === 'L' ? `Nell'induttore la corrente è ${res('in ritardo di 90°')} sulla tensione` : `Nel condensatore la corrente è ${res('in anticipo di 90°')} sulla tensione`, p.k === 'L' ? 'L\'induttore si oppone alle variazioni di corrente: la corrente arriva "dopo".' : 'Il condensatore deve prima caricarsi: la corrente arriva "prima" della tensione.'),
  });
  r4.push({
    id: 'x-ratio', title: 'Se cambia la frequenza', level: 2,
    gen: () => ({ k: pick(['L', 'C']), X1: pick([10, 20, 50, 100, 200, 500]), f1: pick([50, 100, 1000]), r: pick([2, 3, 4, 5, 10, 0.5, 0.25, 0.1]) }),
    solve: (p) => ({ f2: p.f1 * p.r, X2: p.k === 'L' ? p.X1 * p.r : p.X1 / p.r }),
    text: (p, r) => `Un ${p.k === 'L' ? 'induttore' : 'condensatore'} ha una reattanza di ${p.X1} Ω a ${App.si(p.f1, 'Hz')}. Quanto vale la reattanza a ${App.si(r.f2, 'Hz')}?`,
    asks: (p, r) => [Q.qX('<var>X</var>', r.X2)],
    hint: () => 'Non serve calcolare L o C: guarda come varia la reattanza con la frequenza.',
    steps: (p, r) => step(`La frequenza è moltiplicata per ${N(p.r)}`) +
      step(p.k === 'L' ? `<var>X</var><sub>L</sub> è proporzionale a <var>f</var>: ${p.X1} Ω · ${N(p.r)} = ${res(U(r.X2, 'Ω'))}` : `<var>X</var><sub>C</sub> è inversamente proporzionale a <var>f</var>: ${p.X1} Ω / ${N(p.r)} = ${res(U(r.X2, 'Ω'))}`, 'Proporzionalità diretta e inversa: ripassa il biennio.'),
  });
  r4.push({
    id: 'x-mc', title: 'Concetti su R, L, C', level: 1,
    ...mc([
      ['In un induttore ideale in alternata la corrente…', ['è in ritardo di 90° sulla tensione', 'è in anticipo di 90°', 'è in fase con la tensione', 'è nulla'], 'Si ricorda con "ELI the ICE man": in L la tensione (E) viene prima della corrente (I).'],
      ['In un condensatore in alternata la corrente…', ['è in anticipo di 90° sulla tensione', 'è in ritardo di 90°', 'è in fase', 'non passa mai'], 'In C la corrente (I) viene prima della tensione (E): ICE.'],
      ['Alle alte frequenze un condensatore si comporta quasi come…', ['un cortocircuito', 'un circuito aperto', 'un induttore', 'un generatore'], 'XC = 1/(2πfC) diventa piccolissima.'],
      ['In continua un induttore ideale è…', ['un cortocircuito', 'un circuito aperto', 'una resistenza infinita', 'un condensatore'], 'A f = 0 la reattanza induttiva è zero.'],
      ['Un resistore in alternata…', ['ha tensione e corrente in fase', 'sfasa la corrente di 90°', 'ha una resistenza che dipende dalla frequenza', 'non dissipa potenza'], 'Nel resistore ideale V e I sono sempre proporzionali, istante per istante.'],
    ]),
  });
  const T_ = App.Schem.T;

  function widgetRLC(host) {
    const c = K.widgetCard('R, L e C in alternata', 'Tensione e corrente nel tempo, a 10 V efficaci');
    let k = 'L';
    const seg = el('div', 'seg');
    seg.innerHTML = ['R', 'L', 'C'].map((x) => `<button type="button" data-k="${x}">${x === 'R' ? 'Resistore' : x === 'L' ? 'Induttore' : 'Condensatore'}</button>`).join('');
    const grid = el('div', 'q-two');
    const fig = el('div');
    const wave = el('div');
    grid.append(fig, wave);
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const Vv = 10;
      const X = k === 'R' ? v.R : k === 'L' ? A.XL(v.f, v.L * 1e-3) : A.XC(v.f, v.C * 1e-6);
      const I = Vv / X;
      const ph = k === 'R' ? 0 : k === 'L' ? -90 : 90;
      fig.innerHTML = Q.phasorSVG({ W: 220, H: 220, max: 1, vecs: [{ z: A.cx(1, 0), label: 'V', cls: 'p1' }, { z: A.polar(0.7, ph), label: 'I', cls: 'p2' }], title: 'Fasori di tensione e corrente' });
      const Imax = I * Math.SQRT2;
      const iScale = (14 * 0.8) / Imax; // la corrente viene scalata per stare nel grafico
      wave.innerHTML = Q.waveSVG({ W: 380, H: 220, tmax: 2 / v.f, ymax: 16, yu: '', traces: [{ amp: 14.14, f: v.f, deg: 0, cls: 'p1' }, { amp: Imax * iScale, f: v.f, deg: ph, cls: 'p2' }], title: 'Tensione (blu) e corrente (arancio) in due periodi' });
      const xs = k === 'R' ? `<var>R</var> = ${U(v.R, 'Ω')} (non dipende da <var>f</var>)` : k === 'L' ? `<var>X</var><sub>L</sub> = 2π<var>f</var><var>L</var> = ${U(X, 'Ω')}` : `<var>X</var><sub>C</sub> = 1/(2π<var>f</var><var>C</var>) = ${U(X, 'Ω')}`;
      const tab = k === 'R' ? '' : `A ${App.si(v.f / 2, 'Hz')}: ${U(k === 'L' ? X / 2 : X * 2, 'Ω')}; a ${App.si(v.f * 2, 'Hz')}: ${U(k === 'L' ? X * 2 : X / 2, 'Ω')}.`;
      out.innerHTML = `<div class="form-row"><span class="label">${k === 'R' ? 'Resistenza' : 'Reattanza'}</span><div class="f">${xs}</div>${tab ? `<span class="meta">${tab}</span>` : ''}</div>
        <div class="form-row"><span class="label">Corrente</span><div class="f"><var>I</var> = <var>V</var>/${k === 'R' ? '<var>R</var>' : '<var>X</var>'} = ${res(U(I, 'A'))}</div><span class="meta">${k === 'R' ? 'In fase con la tensione.' : k === 'L' ? 'In ritardo di 90° (un quarto di periodo): il picco della corrente arriva dopo quello della tensione.' : 'In anticipo di 90°: il picco della corrente arriva prima di quello della tensione.'}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      // solo il cursore del componente scelto
      c.querySelectorAll('.fields .field').forEach((f, i) => { f.hidden = i > 0 && ['R', 'L', 'C'][i - 1] !== k; });
    };
    const sl = K.sliders(c, [
      { id: 'f', label: 'Frequenza <var>f</var> (Hz)', min: 10, max: 10000, log: true, value: 50 },
      { id: 'R', label: '<var>R</var> (Ω)', min: 1, max: 1000, log: true, value: 100 },
      { id: 'L', label: '<var>L</var> (mH)', min: 1, max: 1000, log: true, value: 100 },
      { id: 'C', label: '<var>C</var> (µF)', min: 0.1, max: 100, log: true, value: 10 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { k = b.dataset.k; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(grid, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'componenti', num: 4, short: 'R, L, C', title: 'Resistore, induttore e condensatore in alternata',
    intro: 'In alternata l\'induttore e il condensatore non si limitano a "resistere": sfasano la corrente di un quarto di periodo e la loro opposizione, la reattanza, cambia con la frequenza.',
    goals: ['Reattanza induttiva e capacitiva', 'Sfasamenti di ±90°', 'Dipendenza dalla frequenza'],
    widgets: [widgetRLC],
    example: r4[2], exampleTitle: 'Esempio: induttore o condensatore sulla rete',
    families: r4,
    theory: `
      <article class="note"><h4>Le tre leggi di Ohm</h4>
        <div class="eq"><span><b><var>Z</var></b><sub>R</sub> = <var>R</var></span><span><b><var>Z</var></b><sub>L</sub> = j<var>X</var><sub>L</sub> = j2π<var>f</var><var>L</var></span><span><b><var>Z</var></b><sub>C</sub> = −j<var>X</var><sub>C</sub> = ${frac('−j', '2π<var>f</var><var>C</var>')}</span></div>
        <p>Con i valori efficaci: <var>I</var> = <var>V</var>/<var>R</var>, <var>I</var> = <var>V</var>/<var>X</var><sub>L</sub>, <var>I</var> = <var>V</var>/<var>X</var><sub>C</sub>.</p></article>
      <article class="note"><h4>Fase</h4>
        <ul><li>Resistore: corrente in fase con la tensione.</li>
          <li>Induttore: corrente in <strong>ritardo</strong> di 90°.</li>
          <li>Condensatore: corrente in <strong>anticipo</strong> di 90°. (ELI the ICE man.)</li></ul></article>
      <article class="note"><h4>Frequenza</h4>
        <p><var>X</var><sub>L</sub> cresce con <var>f</var> (in continua l'induttore è un corto); <var>X</var><sub>C</sub> diminuisce con <var>f</var> (in continua il condensatore è aperto). Su questo si basano i filtri.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'ac', year: '4', yearLabel: '4ª', title: 'Corrente alternata e fasori', route: 'ac-sinusoide', lessonWord: 'Lezione',
    desc: 'Sinusoidi, valore efficace, oscilloscopio, numeri complessi, fasori; resistore, induttore e condensatore in alternata.',
    lessons,
  });
})();
