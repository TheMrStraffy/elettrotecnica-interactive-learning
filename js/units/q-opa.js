/* 4ª — Amplificatori operazionali */
(function () {
  'use strict';
  const App = window.App;
  const SM = window.Semi;
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
  const Vo = '<var>V</var><sub>out</sub>';
  const Vi = '<var>V</var><sub>in</sub>';
  const R_ = (k) => `<var>R</var><sub>${k}</sub>`;
  const RV = [1, 2.2, 4.7, 10, 22, 47, 100];
  const qVs = (label, v) => Object.assign(h.qV(label, v), { signNote: 'Controlla il segno: l\'amplificatore invertente cambia il segno della tensione.' });

  // =====================================================================
  // 1 — Ideale e comparatore
  // =====================================================================
  const c1 = [];
  c1.push({
    id: 'comp-out', title: 'Ad anello aperto', level: 1,
    defaults: { vp: 2.5, dmv: 0.05, Vsat: 12 },
    gen: () => { const vp = pick([1, 2, 2.5, 3, 5]); return { vp, dmv: pick([-500, -20, -0.05, 0.03, 0.08, 1, 300]) / 1000, Vsat: pick([12, 13.5]) }; },
    solve: (p) => { const lin = 1e5 * p.dmv; return { lin, out: SM.comparator(p.vp + p.dmv, p.vp, p.Vsat), sat: Math.abs(lin) >= p.Vsat }; },
    text: (p) => `Un operazionale senza retroazione (guadagno ad anello aperto <var>A</var> = 100 000, saturazione a ±${N(p.Vsat)} V) ha l'ingresso − a ${N(p.vp)} V e l'ingresso + a ${N(p.vp + p.dmv, 6)} V. Quanto vale l'uscita?`,
    asks: (p, r) => [Object.assign(h.qV(Vo, r.out), { signNote: 'Controlla il segno: se V+ è minore di V− l\'uscita è negativa.' })],
    steps: (p, r) => step(`<var>V</var><sub>d</sub> = <var>V</var><sub>+</sub> − <var>V</var><sub>−</sub> = ${U(p.dmv, 'V')}`) +
      step(`<var>A</var> · <var>V</var><sub>d</sub> = 100 000 · ${U(p.dmv, 'V')} = ${U(r.lin, 'V')}`, 'L\'operazionale moltiplica la differenza tra i due ingressi per un numero enorme.') +
      step(r.sat ? `Supera ±${N(p.Vsat)} V → ${Vo} = ${res(U(r.out, 'V'))} (saturazione)` : `Sta dentro ±${N(p.Vsat)} V → ${Vo} = ${res(U(r.out, 'V'))}`, r.sat ? 'Basta una differenza di qualche decina di microvolt per mandarlo in saturazione: per questo senza retroazione si usa solo come comparatore.' : 'Caso raro: la differenza è di pochi microvolt.'),
  });
  c1.push({
    id: 'comp-duty', title: 'Comparatore su una sinusoide', level: 2,
    gen: () => ({ Vp: pick([2, 4, 5, 8, 10]), k: pick([-0.866, -0.707, -0.5, 0, 0.5, 0.707, 0.866]), Vsat: 12 }),
    solve: (p) => { const Vref = p.Vp * p.k; return { Vref, duty: 50 - (Math.asin(p.k) / Math.PI) * 100 }; },
    text: (p, r) => `Un comparatore confronta una sinusoide di ampiezza ${p.Vp} V (sull'ingresso +) con una tensione di riferimento di ${N(r.Vref, 3)} V (sull'ingresso −). L'uscita vale +${p.Vsat} V o −${p.Vsat} V. Per quale percentuale del periodo l'uscita è alta?`,
    fig: (p, r) => ({ svg: Q.waveSVG({ W: 480, H: 200, tmax: 2e-3, ymax: 14, traces: [{ amp: p.Vp, f: 1000, deg: 0, cls: 'p1' }, { fn: (t) => (p.Vp * Math.sin(2 * Math.PI * 1000 * t) > r.Vref ? p.Vsat : -p.Vsat), cls: 'ps' }], hl: [{ y: r.Vref, cls: 'p2', label: 'V_ref' }], title: 'Ingresso e uscita del comparatore' }).replace('V_ref', 'V<tspan class="sb" dy="3">ref</tspan>') }),
    asks: (p, r) => [{ label: 'Tempo con uscita alta', unit: '%', value: r.duty }],
    hint: () => 'L\'uscita è alta finché Vp sin(θ) > Vref. Trova l\'angolo in cui la sinusoide supera il riferimento.',
    steps: (p, r) => step(`sin θ<sub>1</sub> = ${frac('<var>V</var><sub>ref</sub>', '<var>V</var><sub>p</sub>')} = ${N(p.k, 3)} → θ<sub>1</sub> = ${N((Math.asin(p.k) * 180) / Math.PI, 3)}°`, 'Da θ₁ a 180° − θ₁ la sinusoide sta sopra il riferimento.') +
      step(`Durata: (180° − 2θ<sub>1</sub>)/360° = ${res(N(r.duty, 3) + ' %')}`, 'Con il riferimento a zero esce un\'onda quadra al 50%: il comparatore trasforma una sinusoide in un segnale digitale.'),
  });
  c1.push({
    id: 'opa-mc', title: 'Le regole d\'oro', level: 1,
    ...mc([
      ['Nell\'operazionale ideale con retroazione negativa…', ['V+ = V− (cortocircuito virtuale) e negli ingressi non entra corrente', 'l\'uscita è sempre zero', 'V+ e V− sono collegati davvero', 'gli ingressi assorbono tutta la corrente'], 'Sono le due regole che bastano per tutti i circuiti lineari.'],
      ['Il guadagno ad anello aperto di un operazionale è…', ['enorme (100 000 o più)', 'uguale a 1', 'uguale a −1', 'circa 10'], 'Per questo senza retroazione l\'uscita è quasi sempre in saturazione.'],
      ['Un comparatore…', ['dice quale dei due ingressi è più grande, con l\'uscita a +Vsat o −Vsat', 'amplifica in modo lineare', 'somma i due ingressi', 'deriva il segnale'], 'È un convertitore da analogico a un bit.'],
      ['La retroazione negativa collega l\'uscita…', ['all\'ingresso invertente (−)', 'all\'ingresso non invertente (+)', 'all\'alimentazione', 'a massa'], 'Così l\'operazionale corregge da solo l\'uscita finché V− = V+.'],
    ]),
  });

  function widgetComp(host) {
    const c = K.widgetCard('Il comparatore', 'Sinusoide sull\'ingresso +, riferimento sull\'ingresso −, alimentazione ±12 V');
    const wave = el('div');
    const out = el('div', 'forms');
    const draw = (v) => {
      const fn = (t) => (v.Vp * Math.sin(2 * Math.PI * 1000 * t) > v.Vref ? 12 : -12);
      wave.innerHTML = Q.waveSVG({ W: 520, H: 220, tmax: 2e-3, ymax: 14, traces: [{ amp: v.Vp, f: 1000, deg: 0, cls: 'p1' }, { fn, cls: 'ps' }], hl: [{ y: v.Vref, cls: 'p2', label: 'riferimento' }], title: 'Ingresso (blu), riferimento (arancio), uscita (rosso)' });
      const k = v.Vref / Math.max(v.Vp, 1e-9);
      const duty = k >= 1 ? 0 : k <= -1 ? 100 : 50 - (Math.asin(k) / Math.PI) * 100;
      out.innerHTML = `<div class="form-row"><span class="label">Uscita</span><div class="f">alta per il ${res(N(duty, 3) + ' %')} del periodo</div><span class="meta">${duty === 0 ? 'Il riferimento è sopra la sinusoide: l\'uscita resta bassa.' : duty === 100 ? 'Il riferimento è sotto la sinusoide: l\'uscita resta alta.' : 'Spostando il riferimento cambia la durata degli impulsi: è il principio del PWM.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'Vp', label: 'Ampiezza della sinusoide (V)', min: 0.5, max: 10, step: 0.5, value: 5 },
      { id: 'Vref', label: 'Riferimento <var>V</var><sub>ref</sub> (V)', min: -10, max: 10, step: 0.25, value: 2 },
    ], draw);
    c.append(wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'ideale', num: 1, short: 'Ideale', title: 'L\'operazionale ideale e il comparatore',
    intro: 'L\'amplificatore operazionale amplifica enormemente la differenza tra i suoi due ingressi. Da solo serve come comparatore; con la retroazione negativa diventa un blocco preciso che fa quello che decidono i resistori esterni.',
    goals: ['Guadagno ad anello aperto', 'Le due regole d\'oro', 'Il comparatore'],
    widgets: [widgetComp],
    example: c1[0], exampleTitle: 'Esempio: basta pochissimo per saturare',
    families: c1,
    theory: `
      <article class="note"><h4>Il componente</h4>
        <p>Due ingressi (− invertente, + non invertente), un'uscita, un'alimentazione di solito duale (±12 o ±15 V). L'uscita vale <var>A</var>(<var>V</var><sub>+</sub> − <var>V</var><sub>−</sub>), con <var>A</var> da 10<sup>5</sup> a 10<sup>6</sup>, ma non può superare le tensioni di saturazione ±<var>V</var><sub>sat</sub>.</p></article>
      <article class="note"><h4>Le regole d'oro (con retroazione negativa)</h4>
        <ol><li><var>V</var><sub>+</sub> = <var>V</var><sub>−</sub>: cortocircuito virtuale.</li><li>Negli ingressi non entra corrente.</li></ol></article>
      <article class="note"><h4>Comparatore</h4>
        <p>Senza retroazione: <var>V</var><sub>+</sub> > <var>V</var><sub>−</sub> → +<var>V</var><sub>sat</sub>, altrimenti −<var>V</var><sub>sat</sub>. Con un rumore sull'ingresso l'uscita può "rimbalzare": la soluzione, il trigger di Schmitt, la vedrai in 5ª.</p></article>`,
  });

  // =====================================================================
  // 2 — Invertente e non invertente
  // =====================================================================
  const a2 = [];
  a2.push({
    id: 'opa-inv', title: 'Amplificatore invertente', level: 1,
    defaults: { R1: 10000, Rf: 100000, Vin: 0.5 },
    gen: () => L.nice(() => ({ R1: pick(RV) * 1000, Rf: pick(RV) * 1000 * pick([1, 10]), Vin: pick([-2, -1, -0.5, -0.2, 0.1, 0.2, 0.5, 1]) }), (p) => p.Rf / p.R1 >= 1 && Math.abs((p.Rf / p.R1) * p.Vin) < 13, { R1: 10000, Rf: 100000, Vin: 0.5 }),
    solve: (p) => { const Av = SM.opInv(p.Rf, p.R1); return { Av, Vout: Av * p.Vin }; },
    text: (p) => `Amplificatore invertente con ${R_(1)} = ${U(p.R1, 'Ω')} e ${R_('f')} = ${U(p.Rf, 'Ω')}, alimentato a ±15 V. In ingresso ci sono ${U(p.Vin, 'V')}. Quanto valgono il guadagno e la tensione d'uscita?`,
    fig: (p, r, sol) => S.opamp({ kind: 'inv', R1: p.R1, Rf: p.Rf, Vin: p.Vin }, { Vout: sol ? r.Vout : null }),
    asks: (p, r) => [{ label: '<var>A</var><sub>v</sub>', unit: '', value: r.Av, signNote: 'Il guadagno dell\'invertente è negativo.' }, qVs(Vo, r.Vout)],
    steps: (p, r) => step(`<var>V</var><sub>−</sub> = <var>V</var><sub>+</sub> = 0 (massa virtuale) → <var>I</var> = ${frac(Vi, R_(1))} = ${U(p.Vin / p.R1, 'A')}`, 'La corrente di R1 non entra nell\'operazionale: passa tutta in Rf.') +
      step(`${Vo} = −${R_('f')} · <var>I</var> → <var>A</var><sub>v</sub> = −${frac(R_('f'), R_(1))} = ${res(N(r.Av, 4))}`) +
      step(`${Vo} = ${N(r.Av, 4)} · ${U(p.Vin, 'V')} = ${res(U(r.Vout, 'V'))}`, 'Il segno cambia: è sfasato di 180°.'),
  });
  a2.push({
    id: 'opa-noninv', title: 'Amplificatore non invertente', level: 1,
    gen: () => L.nice(() => ({ R1: pick(RV) * 1000, Rf: pick(RV) * 1000 * pick([1, 10]), Vin: pick([-1, -0.5, 0.1, 0.2, 0.5, 1, 2]) }), (p) => Math.abs((1 + p.Rf / p.R1) * p.Vin) < 13, { R1: 10000, Rf: 47000, Vin: 1 }),
    solve: (p) => { const Av = SM.opNonInv(p.Rf, p.R1); return { Av, Vout: Av * p.Vin }; },
    text: (p) => `Amplificatore non invertente con ${R_(1)} = ${U(p.R1, 'Ω')} (verso massa) e ${R_('f')} = ${U(p.Rf, 'Ω')}, alimentato a ±15 V, con ${U(p.Vin, 'V')} in ingresso. Quanto valgono il guadagno e l'uscita?`,
    fig: (p) => S.opamp({ kind: 'noninv', R1: p.R1, Rf: p.Rf, Vin: p.Vin }),
    asks: (p, r) => [{ label: '<var>A</var><sub>v</sub>', unit: '', value: r.Av }, h.qV(Vo, r.Vout)],
    steps: (p, r) => step(`<var>V</var><sub>−</sub> = <var>V</var><sub>+</sub> = ${Vi}: ${R_(1)} e ${R_('f')} fanno da partitore dell'uscita`, 'L\'operazionale regola l\'uscita finché la frazione riportata all\'ingresso − è uguale all\'ingresso.') +
      step(`<var>A</var><sub>v</sub> = 1 + ${frac(R_('f'), R_(1))} = ${res(N(r.Av, 4))}`, 'Sempre almeno 1, e positivo: l\'uscita è in fase con l\'ingresso.') +
      step(`${Vo} = ${N(r.Av, 4)} · ${U(p.Vin, 'V')} = ${res(U(r.Vout, 'V'))}`),
  });
  a2.push({
    id: 'opa-design', title: 'Progetta il guadagno', level: 2,
    gen: () => ({ kind: pick(['inv', 'noninv']), G: pick([2, 5, 10, 11, 20, 22, 47, 100]), R1: pick([1, 2.2, 4.7, 10]) * 1000 }),
    solve: (p) => ({ Rf: p.kind === 'inv' ? p.G * p.R1 : (p.G - 1) * p.R1 }),
    text: (p) => `Vuoi un amplificatore ${p.kind === 'inv' ? 'invertente' : 'non invertente'} con guadagno ${p.kind === 'inv' ? '−' : ''}${p.G}, usando ${R_(1)} = ${U(p.R1, 'Ω')}. Quanto deve valere ${R_('f')}?`,
    asks: (p, r) => [h.qR(R_('f'), r.Rf)],
    steps: (p, r) => step(p.kind === 'inv' ? `|<var>A</var><sub>v</sub>| = ${frac(R_('f'), R_(1))} → ${R_('f')} = ${p.G} · ${U(p.R1, 'Ω')} = ${res(U(r.Rf, 'Ω'))}` : `<var>A</var><sub>v</sub> = 1 + ${frac(R_('f'), R_(1))} → ${R_('f')} = (${p.G} − 1) · ${U(p.R1, 'Ω')} = ${res(U(r.Rf, 'Ω'))}`, 'In pratica si scelgono resistori tra 1 kΩ e 1 MΩ e si usa il valore commerciale più vicino (o due in serie).'),
  });
  a2.push({
    id: 'opa-clip', title: 'Fin dove si può alzare l\'ingresso', level: 2,
    gen: () => ({ kind: pick(['inv', 'noninv']), G: pick([5, 10, 20, 47, 100]), Vs: pick([12, 15]), rr: Math.random() < 0.3 }),
    solve: (p) => { const Vsat = p.rr ? p.Vs - 0.1 : p.Vs - 1.5; return { Vsat, vin: Vsat / p.G }; },
    text: (p) => `Un amplificatore ${p.kind === 'inv' ? 'invertente' : 'non invertente'} con guadagno ${p.kind === 'inv' ? '−' : ''}${p.G} è alimentato a ±${p.Vs} V con un operazionale ${p.rr ? 'rail-to-rail (l\'uscita arriva a 0,1 V dalle alimentazioni)' : 'che satura a 1,5 V dalle alimentazioni'}. Qual è l'ampiezza massima dell'uscita e dell'ingresso senza tagli?`,
    asks: (p, r) => [h.qV('<var>V</var><sub>sat</sub>', r.Vsat), h.qV('<var>v</var><sub>in,max</sub>', r.vin)],
    steps: (p, r) => step(`<var>V</var><sub>sat</sub> = ${p.Vs} − ${p.rr ? '0,1' : '1,5'} = ${res(U(r.Vsat, 'V'))}`, 'L\'uscita non arriva mai proprio alle alimentazioni.') + step(`<var>v</var><sub>in,max</sub> = ${frac('<var>V</var><sub>sat</sub>', '|<var>A</var><sub>v</sub>|')} = ${res(U(r.vin, 'V'))}`, 'Oltre, le punte della sinusoide d\'uscita vengono tagliate.'),
  });
  a2.push({
    id: 'opa-amp-mc', title: 'Concetti sugli amplificatori', level: 1,
    ...mc([
      ['L\'inseguitore di tensione (buffer) ha guadagno…', ['1, ma impedenza d\'ingresso altissima', '0', '−1', 'infinito'], 'Copia la tensione senza assorbire corrente dalla sorgente: serve a non caricarla.'],
      ['L\'impedenza d\'ingresso dell\'invertente è…', ['circa R1', 'infinita', 'zero', 'uguale a Rf'], 'L\'ingresso vede R1 verso la massa virtuale.'],
      ['Nel non invertente il guadagno minimo è…', ['1', '0', '−1', '10'], 'Con Rf = 0 (o R1 infinita) diventa un inseguitore.'],
      ['Perché all\'ingresso − dell\'invertente si parla di "massa virtuale"?', ['è a 0 V come la massa, ma non è collegato a massa', 'è collegato a massa', 'è sempre a +Vsat', 'non ha tensione definita'], 'V− = V+ = 0 per la retroazione.'],
    ]),
  });

  function widgetAmp(host) {
    const c = K.widgetCard('Amplificatori con l\'operazionale', 'Alimentazione ±15 V (saturazione a ±13,5 V): ingresso sinusoidale');
    let kind = 'inv';
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-k="inv">Invertente</button><button type="button" data-k="noninv">Non invertente</button><button type="button" data-k="follower">Inseguitore</button>';
    const sch = el('div', 'ex-fig');
    const wave = el('div');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const R1 = v.R1 * 1000;
      const Rf = v.Rf * 1000;
      const Av = kind === 'inv' ? SM.opInv(Rf, R1) : kind === 'noninv' ? SM.opNonInv(Rf, R1) : 1;
      sch.innerHTML = S.opamp({ kind, R1, Rf, Vin: '' }).svg;
      const fn = (t) => SM.opOut(Av, v.vin * Math.sin(2 * Math.PI * 1000 * t), 13.5);
      const clip = Math.abs(Av * v.vin) > 13.5;
      wave.innerHTML = Q.waveSVG({ W: 520, H: 210, tmax: 2e-3, ymax: 15, traces: [{ amp: v.vin, f: 1000, deg: 0, cls: 'p1' }, { fn, cls: 'ps' }], hl: [{ y: 13.5, cls: 'guide' }, { y: -13.5, cls: 'guide' }], title: 'Ingresso (blu) e uscita (rosso)' });
      out.innerHTML = `<div class="form-row"><span class="label">Guadagno</span><div class="f"><var>A</var><sub>v</sub> = ${kind === 'inv' ? '−R<sub>f</sub>/R<sub>1</sub>' : kind === 'noninv' ? '1 + R<sub>f</sub>/R<sub>1</sub>' : '1'} = ${res(N(Av, 3))}</div><span class="meta">${kind === 'inv' ? 'L\'uscita è capovolta rispetto all\'ingresso.' : 'L\'uscita è in fase con l\'ingresso.'}</span></div>
        <div class="form-row"><span class="label">Uscita</span><div class="f">${U(Math.min(13.5, Math.abs(Av * v.vin)), 'V')} di picco</div><span class="meta" style="color:var(--${clip ? 'bad' : 'ok'})">${clip ? 'Saturazione: le punte sono tagliate a ±13,5 V.' : 'Nessun taglio.'}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === kind)));
      c.querySelectorAll('.fields .field').forEach((f, i) => { f.hidden = kind === 'follower' && i < 2; });
    };
    const sl = K.sliders(c, [
      { id: 'R1', label: R_(1) + ' (kΩ)', min: 1, max: 100, log: true, value: 10 },
      { id: 'Rf', label: R_('f') + ' (kΩ)', min: 1, max: 1000, log: true, value: 47 },
      { id: 'vin', label: 'Ingresso (V di picco)', min: 0.05, max: 10, log: true, value: 1 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { kind = b.dataset.k; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(sch, wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'amplificatori', num: 2, short: 'Invertente', title: 'Invertente, non invertente, inseguitore',
    intro: 'Con due resistori l\'operazionale diventa un amplificatore con un guadagno preciso, che non dipende dal componente ma solo dal rapporto tra le resistenze.',
    goals: ['Invertente: −Rf/R1', 'Non invertente: 1 + Rf/R1', 'Inseguitore', 'Saturazione'],
    widgets: [widgetAmp],
    example: a2[0], exampleTitle: 'Esempio: amplificatore invertente',
    families: a2,
    theory: `
      <article class="note"><h4>Invertente</h4>
        <div class="eq"><span><var>A</var><sub>v</sub> = −${frac(R_('f'), R_(1))}</span><span><var>Z</var><sub>in</sub> ≈ ${R_(1)}</span></div>
        <p>L'ingresso − è una massa virtuale: tutta la corrente di ${R_(1)} passa in ${R_('f')}.</p></article>
      <article class="note"><h4>Non invertente e inseguitore</h4>
        <div class="eq"><span><var>A</var><sub>v</sub> = 1 + ${frac(R_('f'), R_(1))}</span><span><var>Z</var><sub>in</sub> altissima</span></div>
        <p>Con ${R_('f')} = 0 il guadagno è 1: è l'inseguitore (buffer), che copia una tensione senza caricarla.</p></article>
      <article class="note"><h4>Limiti</h4><p>L'uscita resta tra le tensioni di saturazione, poco dentro le alimentazioni (meno di 0,1 V per gli operazionali "rail-to-rail").</p></article>`,
  });

  // =====================================================================
  // 3 — Sommatore, differenziale, DAC
  // =====================================================================
  const s3 = [];
  s3.push({
    id: 'opa-sum', title: 'Il sommatore invertente', level: 1,
    defaults: { R: [10000, 10000, 10000], Rf: 10000, V: [1, 2, 3] },
    gen: () => L.nice(() => { const Rf = pick([10, 22, 47]) * 1000; return { Rf, R: [0, 0, 0].map(() => pick([10, 22, 47, 100]) * 1000), V: [0, 0, 0].map(() => pick([-2, -1, -0.5, 0.5, 1, 2, 3])) }; }, (p) => Math.abs(SM.opSum(p.Rf, p.V, p.R)) < 13, { R: [10000, 10000, 10000], Rf: 10000, V: [1, 2, 3] }),
    solve: (p) => ({ Vout: SM.opSum(p.Rf, p.V, p.R), terms: p.V.map((v, i) => (-p.Rf / p.R[i]) * v) }),
    text: (p) => `Un sommatore invertente ha ${R_('f')} = ${U(p.Rf, 'Ω')} e tre ingressi: ${p.V.map((v, i) => `<var>V</var><sub>${i + 1}</sub> = ${U(v, 'V')} su ${R_(i + 1)} = ${U(p.R[i], 'Ω')}`).join('; ')}. Quanto vale l'uscita?`,
    fig: (p) => S.opamp({ kind: 'sum', R1: p.R[0], R2: p.R[1], R3: p.R[2], Rf: p.Rf, V1: p.V[0], V2: p.V[1], V3: p.V[2] }),
    asks: (p, r) => [qVs(Vo, r.Vout)],
    steps: (p, r) => step(`Massa virtuale: le correnti dei tre rami si sommano in ${R_('f')}`, 'È Kirchhoff al nodo dell\'ingresso −.') +
      step(`${Vo} = −${R_('f')}(${p.V.map((v, i) => frac('<var>V</var><sub>' + (i + 1) + '</sub>', R_(i + 1))).join(' + ')}) = ${r.terms.map((t) => N(t, 3)).join(' + ')} = ${res(U(r.Vout, 'V'))}`, 'Ogni ingresso pesa Rf/Rk: con resistori uguali è la somma cambiata di segno. È il principio del mixer audio.'),
  });
  s3.push({
    id: 'opa-diff', title: 'Il differenziale', level: 2,
    gen: () => ({ R1: pick([1, 10, 22]) * 1000, k: pick([1, 2, 5, 10]), V1: pick([0.5, 1, 1.5, 2, 2.5]), V2: pick([0.5, 1, 2, 3, 3.3]) }),
    solve: (p) => ({ R2: p.R1 * p.k, Vout: SM.opDiff(p.R1, p.R1 * p.k, p.V1, p.V2) }),
    text: (p, r) => `Un amplificatore differenziale ha ${R_(1)} = ${R_(3)} = ${U(p.R1, 'Ω')} e ${R_(2)} = ${R_(4)} = ${U(r.R2, 'Ω')}. Su ${'<var>V</var><sub>1</sub>'} (ingresso −) ci sono ${U(p.V1, 'V')}, su ${'<var>V</var><sub>2</sub>'} (ingresso +) ${U(p.V2, 'V')}. Quanto vale l'uscita?`,
    fig: (p, r) => S.opamp({ kind: 'diff', R1: p.R1, R2: r.R2, R3: p.R1, R4: r.R2, V1: p.V1, V2: p.V2 }),
    asks: (p, r) => [qVs(Vo, r.Vout)],
    steps: (p, r) => step(`${Vo} = ${frac(R_(2), R_(1))}(<var>V</var><sub>2</sub> − <var>V</var><sub>1</sub>) = ${p.k} · (${N(p.V2)} − ${N(p.V1)}) V = ${res(U(r.Vout, 'V'))}`, 'Amplifica solo la differenza: un disturbo uguale sui due ingressi (modo comune) si cancella. Si usa con i sensori a ponte.'),
  });
  s3.push({
    id: 'opa-dac', title: 'Il DAC a resistori pesati', level: 2,
    gen: () => ({ bits: [0, 0, 0, 0].map(() => rand(0, 1)), Vref: 5, R: pick([40, 80]) * 1000, Rf: pick([5, 10]) * 1000 }),
    solve: (p) => { const n = Number.parseInt(p.bits.join(''), 2); const lsb = (p.Rf * p.Vref) / p.R; return { n, lsb, Vout: SM.dacWeighted(p.bits, p.Vref, p.R, p.Rf) }; },
    text: (p) => `Un DAC a 4 bit è un sommatore invertente: il bit meno significativo entra su ${U(p.R, 'Ω')}, gli altri su ${U(p.R / 2, 'Ω')}, ${U(p.R / 4, 'Ω')}, ${U(p.R / 8, 'Ω')} (il più significativo). Un bit a 1 vale ${p.Vref} V, a 0 vale 0 V; ${R_('f')} = ${U(p.Rf, 'Ω')}. Con l'ingresso <span class="mono">${p.bits.join('')}</span>, quanto vale l'uscita? E il gradino (1 LSB)?`,
    asks: (p, r) => [qVs(Vo, r.Vout), h.qV('Gradino (1 LSB)', r.lsb)],
    steps: (p, r) => step(`<span class="mono">${p.bits.join('')}</span> = ${r.n}`, 'Ogni bit pesa il doppio del successivo perché la sua resistenza è la metà.') +
      step(`1 LSB = ${frac(R_('f') + ' · <var>V</var><sub>ref</sub>', '<var>R</var>')} = ${res(U(r.lsb, 'V'))}`) +
      step(`${Vo} = −${r.n} · ${U(r.lsb, 'V')} = ${res(U(r.Vout, 'V'))}`, 'L\'uscita è proporzionale al numero binario: è un convertitore digitale-analogico. Lo approfondirai in 5ª (con la rete R-2R).'),
  });
  s3.push({
    id: 'opa-sum-mc', title: 'Concetti su sommatore e differenziale', level: 1,
    ...mc([
      ['In un sommatore invertente con tutti i resistori uguali, l\'uscita è…', ['la somma degli ingressi cambiata di segno', 'la media degli ingressi', 'il prodotto degli ingressi', 'sempre zero'], 'Vout = −(V1 + V2 + V3).'],
      ['Il differenziale è utile perché…', ['amplifica la differenza e cancella i disturbi comuni ai due ingressi', 'ha guadagno infinito', 'non ha bisogno di alimentazione', 'somma due segnali'], 'Rapporto di reiezione di modo comune (CMRR).'],
      ['Nel DAC a resistori pesati, il problema con molti bit è…', ['servono resistori di valori molto diversi e molto precisi', 'l\'uscita è digitale', 'non si può usare un operazionale', 'i bit non si sommano'], 'Per questo si usa la rete R-2R, con due soli valori.'],
    ]),
  });

  function widgetSum(host) {
    const c = K.widgetCard('Un DAC a 4 bit', 'Sommatore con resistori pesati: accendi i bit');
    const bits = [1, 0, 1, 1];
    const row = el('div', 'bits msi-bits');
    row.style.setProperty('--n', 4);
    const sch = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const stairs = el('div');
    const draw = () => {
      row.innerHTML = bits.map((b, i) => `<button type="button" class="bit${b ? ' on' : ''}" data-i="${i}" aria-pressed="${!!b}"><span class="w">b<sub>${3 - i}</sub></span><span class="b">${b}</span><span class="w2">${8 >> i}</span></button>`).join('');
      const R = 80000;
      const Rf = 10000;
      const V = SM.dacWeighted(bits, 5, R, Rf);
      sch.innerHTML = S.opamp({ kind: 'sum', n: 4, R1: 10000, R2: 20000, R3: 40000, R4: 80000, Rf, V1: bits[0] ? '5 V' : '0 V', V2: bits[1] ? '5 V' : '0 V', V3: bits[2] ? '5 V' : '0 V', V4: bits[3] ? '5 V' : '0 V' }).svg;
      const n = Number.parseInt(bits.join(''), 2);
      const ch = K.chart({ W: 460, H: 180, xmin: 0, xmax: 16, ymin: -10, ymax: 0, yu: 'V', xlabel: 'codice', ticks: 4 });
      let d = '';
      for (let k = 0; k < 16; k++) { const y = -k * 0.625; d += `${k ? 'L' : 'M'}${ch.X(k)} ${ch.Y(y)} L${ch.X(k + 1)} ${ch.Y(y)}`; }
      stairs.innerHTML = `<svg class="chart" viewBox="0 0 460 180" role="img" style="width:100%;height:auto"><title>Uscita del DAC per tutti i codici</title>${ch.s}<path class="gen" d="${d}"/><circle class="op" cx="${ch.X(n + 0.5)}" cy="${ch.Y(V)}" r="5"/></svg>`;
      out.innerHTML = `<div class="form-row"><span class="label">Uscita</span><div class="f"><span class="mono">${bits.join('')}</span> = ${n} → ${Vo} = −${n} · 0,625 V = ${res(U(V, 'V'))}</div><span class="meta">Gradino (1 LSB) = R<sub>f</sub> · 5 V / 80 kΩ = 0,625 V. Ogni codice ha il suo gradino della scala.</span></div>`;
    };
    row.addEventListener('click', (e) => { const b = e.target.closest('.bit'); if (b) { const i = Number(b.dataset.i); bits[i] = 1 - bits[i]; draw(); } });
    c.append(row, sch, out, stairs);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'sommatore', num: 3, short: 'Sommatore', title: 'Sommatore, differenziale e DAC',
    intro: 'Più ingressi sullo stesso nodo a massa virtuale si sommano, ciascuno con il suo peso. Con pesi in potenze di 2 il sommatore diventa un convertitore digitale-analogico; con due ingressi bilanciati, un amplificatore della differenza.',
    goals: ['Sommatore pesato', 'Differenziale', 'DAC a resistori pesati'],
    widgets: [widgetSum],
    example: s3[0], exampleTitle: 'Esempio: tre ingressi',
    families: s3,
    theory: `
      <article class="note"><h4>Sommatore</h4>
        <div class="eq"><span>${Vo} = −${R_('f')} (${frac('<var>V</var><sub>1</sub>', R_(1))} + ${frac('<var>V</var><sub>2</sub>', R_(2))} + ${frac('<var>V</var><sub>3</sub>', R_(3))})</span></div></article>
      <article class="note"><h4>Differenziale</h4>
        <div class="eq"><span>${Vo} = ${frac(R_(2), R_(1))}(<var>V</var><sub>2</sub> − <var>V</var><sub>1</sub>)</span><span class="u">con ${R_(1)} = ${R_(3)}, ${R_(2)} = ${R_(4)}</span></div></article>
      <article class="note"><h4>DAC</h4>
        <p>Il bit <var>k</var> entra su <var>R</var>/2<sup><var>k</var></sup>: <var>V</var><sub>out</sub> = −(<var>R</var><sub>f</sub><var>V</var><sub>ref</sub>/<var>R</var>) · <var>N</var>, dove <var>N</var> è il numero binario. Risoluzione: 1 LSB = <var>R</var><sub>f</sub><var>V</var><sub>ref</sub>/<var>R</var>.</p></article>`,
  });

  // =====================================================================
  // 4 — L'operazionale reale
  // =====================================================================
  const r4 = [];
  const OPS = [['μA741', 0.5, 1e6], ['TL081', 13, 3e6], ['LM358', 0.3, 1e6], ['NE5532', 9, 10e6]];
  r4.push({
    id: 'opa-sr', title: 'Lo slew rate', level: 2,
    gen: () => ({ o: rand(0, OPS.length - 1), Vp: pick([1, 2, 5, 10, 12]), m: rand(0, 1), f: pick([5, 10, 20, 50, 100]) * 1000 }),
    solve: (p) => { const SR = OPS[p.o][1] * 1e6; return { SR, fmax: SM.slewFreq(SR, p.Vp), Vmax: SR / (2 * Math.PI * p.f) }; },
    text: (p) => (p.m === 0
      ? `Un ${OPS[p.o][0]} ha uno slew rate di ${N(OPS[p.o][1])} V/µs. Qual è la frequenza massima di una sinusoide d'uscita di ${p.Vp} V di picco senza distorsione?`
      : `Un ${OPS[p.o][0]} (slew rate ${N(OPS[p.o][1])} V/µs) deve dare in uscita una sinusoide a ${App.si(p.f, 'Hz')}. Qual è l'ampiezza massima senza distorsione?`),
    asks: (p, r) => [p.m === 0 ? Q.qHz('<var>f</var><sub>max</sub>', r.fmax) : h.qV('<var>V</var><sub>p,max</sub>', r.Vmax)],
    hint: () => 'La pendenza massima di Vp·sin(2πft) è 2πf·Vp, nel passaggio per lo zero: non può superare lo slew rate.',
    steps: (p, r) => step('Pendenza massima della sinusoide: 2π<var>f</var><var>V</var><sub>p</sub> ≤ SR', 'Lo slew rate è la velocità massima con cui l\'uscita può cambiare.') +
      step(p.m === 0 ? `<var>f</var><sub>max</sub> = ${frac('SR', '2π<var>V</var><sub>p</sub>')} = ${frac(N(OPS[p.o][1]) + ' V/µs', '6,283 · ' + p.Vp + ' V')} = ${res(App.si(r.fmax, 'Hz', 4))}` : `<var>V</var><sub>p,max</sub> = ${frac('SR', '2π<var>f</var>')} = ${res(U(r.Vmax, 'V'))}`, 'Oltre, la sinusoide diventa un triangolo.'),
  });
  r4.push({
    id: 'opa-gbw', title: 'Prodotto guadagno-banda', level: 2,
    gen: () => ({ o: rand(0, OPS.length - 1), kind: pick(['inv', 'noninv']), G: pick([1, 2, 10, 20, 100]) }),
    solve: (p) => { const ng = p.kind === 'inv' ? p.G + 1 : p.G; return { ng, B: SM.closedBW(OPS[p.o][2], ng) }; },
    text: (p) => `Un ${OPS[p.o][0]} ha un prodotto guadagno-banda di ${App.si(OPS[p.o][2], 'Hz')}. Usato come amplificatore ${p.kind === 'inv' ? 'invertente con guadagno −' + p.G : 'non invertente con guadagno ' + p.G}, fino a che frequenza amplifica (banda a −3 dB)?`,
    asks: (p, r) => [Q.qHz('<var>B</var>', r.B)],
    steps: (p, r) => step(`Guadagno di rumore: ${p.kind === 'inv' ? '1 + |<var>A</var><sub>v</sub>| = ' + r.ng : '<var>A</var><sub>v</sub> = ' + r.ng}`, 'Per la banda conta 1 + Rf/R1 in entrambe le configurazioni.') +
      step(`<var>B</var> = ${frac('GBW', '1 + R<sub>f</sub>/R<sub>1</sub>')} = ${res(App.si(r.B, 'Hz', 4))}`, 'Più guadagno chiedi, meno banda hai: per guadagni alti conviene dividere in due stadi.'),
  });
  r4.push({
    id: 'opa-real-mc', title: 'Concetti sull\'operazionale reale', level: 1,
    ...mc([
      ['Lo slew rate si misura in…', ['V/µs', 'Hz', 'dB', 'V'], 'Velocità massima di variazione dell\'uscita.'],
      ['Con un segnale troppo veloce per lo slew rate, una sinusoide in uscita diventa…', ['un triangolo', 'un\'onda quadra', 'più grande', 'una sinusoide sfasata ma identica'], 'L\'uscita sale e scende con la pendenza massima possibile.'],
      ['Un operazionale "rail-to-rail"…', ['porta l\'uscita (o gli ingressi) quasi fino alle alimentazioni', 'non ha bisogno di alimentazione', 'ha guadagno infinito', 'funziona solo come comparatore'], 'Utile con le alimentazioni basse, come i 3,3 V dei microcontrollori.'],
      ['Il prodotto guadagno-banda dice che…', ['guadagno × banda ≈ costante', 'la banda non dipende dal guadagno', 'il guadagno è sempre 1', 'serve un filtro esterno'], 'Con GBW = 1 MHz e guadagno 10 la banda è circa 100 kHz.'],
    ]),
  });

  function widgetSlew(host) {
    const c = K.widgetCard('Slew rate', 'Uscita di un inseguitore con una sinusoide sempre più veloce');
    let oi = 0;
    const seg = el('div', 'seg');
    seg.innerHTML = OPS.map((o, i) => `<button type="button" data-i="${i}">${o[0]} (${N(o[1])} V/µs)</button>`).join('');
    const wave = el('div');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const SR = OPS[oi][1] * 1e6;
      const f = v.f * 1000;
      const T = 2 / f;
      const n = 1200;
      const pts = [];
      let y = 0;
      for (let k = 0; k <= n + n; k++) {
        const t = ((k - n) * T) / n;
        const target = v.Vp * Math.sin(2 * Math.PI * f * t);
        const dmax = SR * (T / n);
        y += App.clamp(target - y, -dmax, dmax);
        if (k >= n) pts.push(y);
      }
      const fn = (t) => pts[Math.min(n, Math.round((t / T) * n))];
      wave.innerHTML = Q.waveSVG({ W: 520, H: 220, tmax: T, ymax: 12, traces: [{ amp: v.Vp, f, deg: 0, cls: 'p1', dash: true }, { fn, cls: 'ps' }], title: 'Ingresso (tratteggiato) e uscita (rosso)' });
      const fmax = SM.slewFreq(SR, v.Vp);
      out.innerHTML = `<div class="form-row"><span class="label">Limite</span><div class="f"><var>f</var><sub>max</sub> = SR/(2π<var>V</var><sub>p</sub>) = ${res(App.si(fmax, 'Hz', 3))}</div><span class="meta" style="color:var(--${f > fmax ? 'bad' : 'ok'})">${f > fmax ? 'Troppo veloce: l\'uscita non riesce a seguire e diventa un triangolo.' : 'L\'uscita segue bene la sinusoide.'}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === oi)));
    };
    const sl = K.sliders(c, [
      { id: 'f', label: 'Frequenza (kHz)', min: 1, max: 500, log: true, value: 20 },
      { id: 'Vp', label: 'Ampiezza (V di picco)', min: 0.5, max: 10, step: 0.5, value: 8 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { oi = Number(b.dataset.i); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'reali', num: 4, short: 'Reale', title: 'L\'operazionale reale',
    intro: 'Un operazionale vero non è infinitamente veloce né infinitamente potente: l\'uscita satura prima delle alimentazioni, cambia con una velocità massima (slew rate) e il guadagno cala con la frequenza.',
    goals: ['Saturazione', 'Slew rate', 'Prodotto guadagno-banda'],
    widgets: [widgetSlew],
    example: r4[0], exampleTitle: 'Esempio: slew rate del 741',
    families: r4,
    theory: `
      <article class="note"><h4>Slew rate</h4>
        <div class="eq"><span><var>f</var><sub>max</sub> = ${frac('SR', '2π<var>V</var><sub>p</sub>')}</span></div>
        <p>μA741: 0,5 V/µs; TL081: 13 V/µs. Oltre la frequenza limite la sinusoide si deforma in un triangolo.</p></article>
      <article class="note"><h4>Banda</h4>
        <div class="eq"><span><var>B</var> = ${frac('GBW', '1 + <var>R</var><sub>f</sub>/<var>R</var><sub>1</sub>')}</span></div>
        <p>Il guadagno ad anello aperto cala di 20 dB per decade (ricordi i diagrammi di Bode?): il prodotto guadagno × banda resta costante.</p></article>
      <article class="note"><h4>Altri limiti</h4><p>Tensione di offset (qualche mV), correnti di polarizzazione degli ingressi, corrente massima d'uscita (circa 20 mA). Nei datasheet sono tutti elencati.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'opa', year: '4', yearLabel: '4ª', title: 'Amplificatori operazionali', route: 'opa-ideale', lessonWord: 'Lezione',
    desc: 'Regole d\'oro e comparatore, invertente, non invertente, inseguitore, sommatore, differenziale, DAC, slew rate e prodotto guadagno-banda.',
    lessons,
  });
})();
