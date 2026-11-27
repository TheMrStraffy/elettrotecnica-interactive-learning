/* 1ª — Lavoro, energia e potenza: dalla meccanica alla bolletta */
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
  const g = BS.G;
  const mc = (bank) => ({
    gen: () => ({ k: rand(0, bank.length - 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const [q, opts, why] = bank[p.k]; return { q, opts: p.o.map((i) => opts[i]), ans: p.o.indexOf(0), why }; },
    text: (p, r) => r.q,
    asks: (p, r) => [h.choice('Risposta', r.opts, r.ans)],
    steps: (p, r) => step(res(r.opts[r.ans]), r.why),
  });
  const clean = (x) => (Math.abs(x) < 1e-9 ? 0 : x);
  const qJ = (label, J) => (Math.abs(J) >= 1e4 ? { label, unit: 'kJ', value: J / 1000 } : { label, unit: 'J', value: clean(J) });
  const qW = (label, W) => (Math.abs(W) >= 1e4 ? { label, unit: 'kW', value: W / 1000 } : { label, unit: 'W', value: W });
  const eur = (x) => N(x, 3) + ' €';
  const W_ = '<var>W</var>';
  const F_ = '<var>F</var>';
  const s_ = '<var>s</var>';
  const Ec = '<var>E</var><sub>c</sub>';
  const Ep = '<var>E</var><sub>p</sub>';
  const eta = 'η';

  /** Freccia per i disegni di fisica. */
  function arr(x1, y1, x2, y2, cls, w = 3) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const L0 = Math.hypot(x2 - x1, y2 - y1);
    if (L0 < 2) return '';
    const hl = Math.min(12, L0 * 0.45);
    const bx = x2 - hl * Math.cos(a);
    const by = y2 - hl * Math.sin(a);
    const px = 5.5 * Math.sin(a);
    const py = -5.5 * Math.cos(a);
    return `<g class="arr ${cls || ''}"><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" style="stroke-width:${w}"/><polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${(bx + px).toFixed(1)},${(by + py).toFixed(1)} ${(bx - px).toFixed(1)},${(by - py).toFixed(1)}"/></g>`;
  }

  // =====================================================================
  // 1 — Il lavoro
  // =====================================================================
  const w1 = [];
  const ANG = [0, 30, 45, 60, 120, 180];
  w1.push({
    id: 'lav-calc', title: 'Il lavoro di una forza', level: 1,
    defaults: { F: 50, s: 8, a: 30 },
    gen: () => ({ F: pick([10, 20, 25, 40, 50, 80, 100, 150]), s: pick([2, 3, 4, 5, 8, 10, 12, 20]), a: pick(ANG) }),
    solve: (p) => ({ W: clean(BS.work(p.F, p.s, p.a)), c: Math.cos((p.a * Math.PI) / 180) }),
    text: (p) => `Una forza di ${U(p.F, 'N')} tira una cassa che si sposta di ${U(p.s, 'm')}. L'angolo tra la forza e lo spostamento è di ${p.a}°. Quanto lavoro compie la forza?`,
    fig: (p) => ({ svg: workSVG(p.F, p.a, p.s, 0) }),
    asks: (p, r) => [Object.assign(qJ(W_, r.W), { signNote: 'Controlla il segno: se la forza ha una componente contraria allo spostamento il lavoro è negativo.' })],
    steps: (p, r) => step(`${W_} = ${F_} · ${s_} · cos α = ${N(p.F)} · ${N(p.s)} · cos ${p.a}° = ${N(p.F)} · ${N(p.s)} · ${N(r.c, 3)}`, p.a === 0 ? 'Forza e spostamento hanno la stessa direzione e lo stesso verso: cos 0° = 1.' : p.a === 180 ? 'La forza è opposta allo spostamento: cos 180° = −1, il lavoro è negativo (la forza frena).' : 'Conta solo la componente della forza parallela allo spostamento, F · cos α.') +
      step(`${W_} = ${res(U(r.W, 'J'))}`, '1 joule è il lavoro di 1 newton su 1 metro.'),
  });
  w1.push({
    id: 'lav-peso', title: 'Sollevare un peso', level: 1,
    gen: () => ({ m: pick([2, 5, 10, 20, 25, 50, 75, 100]), hh: pick([0.5, 1, 1.5, 2, 3, 5, 10]) }),
    solve: (p) => ({ F: p.m * g, W: BS.potential(p.m, p.hh) }),
    text: (p) => `Sollevi a velocità costante una massa di ${U(p.m, 'kg')} di ${U(p.hh, 'm')}. Con che forza devi tirare e quanto lavoro fai? (<var>g</var> = 9,81 m/s²)`,
    asks: (p, r) => [{ label: F_, unit: 'N', value: r.F }, qJ(W_, r.W)],
    steps: (p, r) => step(`${F_} = <var>m</var> · <var>g</var> = ${N(p.m)} · 9,81 = ${res(U(r.F, 'N'))}`, 'A velocità costante la tua forza bilancia il peso.') +
      step(`${W_} = ${F_} · <var>h</var> = ${N(r.F, 4)} · ${N(p.hh)} = ${res(U(r.W, 'J'))}`, 'Forza e spostamento sono entrambi verso l\'alto: α = 0°. Il lavoro fatto diventa energia potenziale della massa.'),
  });
  w1.push({
    id: 'lav-inv', title: 'Quanta strada? Quanta forza?', level: 2,
    gen: () => { const mode = pick(['s', 'F']); const F = pick([20, 40, 50, 80, 100, 200]); const s = pick([2, 3, 5, 6, 10, 15]); const a = pick([0, 0, 30, 60]); return { mode, F, s, a, W: Number(BS.work(F, s, a).toPrecision(4)) }; },
    solve: (p) => { const c = Math.cos((p.a * Math.PI) / 180); return p.mode === 's' ? { x: p.W / (p.F * c), c } : { x: p.W / (p.s * c), c }; },
    text: (p) => (p.mode === 's'
      ? `Una forza di ${U(p.F, 'N')}, inclinata di ${p.a}° rispetto allo spostamento, compie un lavoro di ${U(p.W, 'J')}. Di quanto si è spostato l'oggetto?`
      : `Un oggetto si sposta di ${U(p.s, 'm')} e la forza che lo tira, inclinata di ${p.a}°, compie un lavoro di ${U(p.W, 'J')}. Quanto vale la forza?`),
    asks: (p, r) => [p.mode === 's' ? { label: s_, unit: 'm', value: r.x } : { label: F_, unit: 'N', value: r.x }],
    hint: (p) => (p.mode === 's' ? 'Dalla formula W = F · s · cos α ricava s.' : 'Dalla formula W = F · s · cos α ricava F.'),
    steps: (p, r) => step(p.mode === 's' ? `${s_} = ${frac(W_, F_ + ' · cos α')} = ${frac(N(p.W), N(p.F) + ' · ' + N(r.c, 3))} = ${res(U(r.x, 'm'))}` : `${F_} = ${frac(W_, s_ + ' · cos α')} = ${frac(N(p.W), N(p.s) + ' · ' + N(r.c, 3))} = ${res(U(r.x, 'N'))}`, 'Formula inversa: dividi entrambi i membri per i fattori che non ti servono.'),
  });
  w1.push({
    id: 'lav-attr', title: 'Con l\'attrito', level: 3,
    gen: () => ({ F: pick([60, 80, 100, 120, 150]), a: pick([0, 20, 30, 45]), s: pick([4, 5, 8, 10]), Fa: pick([20, 30, 40, 50]) }),
    solve: (p) => { const WF = BS.work(p.F, p.s, p.a); const Wa = -p.Fa * p.s; return { WF, Wa, Wt: WF + Wa }; },
    text: (p) => `Tiri una slitta con una fune inclinata di ${p.a}° con una forza di ${U(p.F, 'N')} per ${U(p.s, 'm')}. L'attrito con la neve vale ${U(p.Fa, 'N')}. Quanto lavoro fa l'attrito? Quanto vale il lavoro totale sulla slitta?`,
    fig: (p) => ({ svg: workSVG(p.F, p.a, p.s, p.Fa) }),
    asks: (p, r) => [Object.assign(qJ('Lavoro dell\'attrito', r.Wa), { signNote: 'L\'attrito è sempre contrario allo spostamento: il suo lavoro è negativo.' }), qJ('Lavoro totale', r.Wt)],
    steps: (p, r) => step(`${W_}<sub>F</sub> = ${N(p.F)} · ${N(p.s)} · cos ${p.a}° = ${U(r.WF, 'J')}`) +
      step(`${W_}<sub>attrito</sub> = ${N(p.Fa)} · ${N(p.s)} · cos 180° = ${res(U(r.Wa, 'J'))}`, 'L\'attrito si oppone sempre al moto: α = 180°, lavoro negativo. Quell\'energia diventa calore.') +
      step(`${W_}<sub>tot</sub> = ${U(r.WF, 'J')} ${r.Wa < 0 ? '−' : '+'} ${U(Math.abs(r.Wa), 'J')} = ${res(U(r.Wt, 'J'))}`, 'Il lavoro totale è quello che resta per accelerare la slitta (teorema dell\'energia cinetica).'),
  });
  w1.push({
    id: 'lav-mc', title: 'Positivo, negativo o nullo?', level: 1,
    ...mc([
      ['Porti una valigia camminando in piano a velocità costante. Il lavoro della forza con cui la tieni su è…', ['nullo', 'positivo', 'negativo', 'uguale al peso'], 'La forza è verticale, lo spostamento orizzontale: α = 90°, cos 90° = 0.'],
      ['Un\'auto frena. Il lavoro della forza d\'attrito dei freni è…', ['negativo', 'positivo', 'nullo', 'infinito'], 'L\'attrito è opposto al moto: toglie energia all\'auto e la trasforma in calore.'],
      ['Un sasso cade. Il lavoro della forza peso durante la caduta è…', ['positivo', 'negativo', 'nullo', 'dipende dalla massa'], 'Peso e spostamento sono entrambi verso il basso.'],
      ['Lanci una palla verso l\'alto. Mentre sale, il lavoro del peso è…', ['negativo', 'positivo', 'nullo', 'uguale all\'energia cinetica'], 'Il peso punta in basso, la palla va in alto: la palla rallenta.'],
      ['Spingi con tutte le forze un muro che non si muove. Il lavoro è…', ['nullo', 'positivo', 'negativo', 'enorme'], 'Senza spostamento non c\'è lavoro, anche se ti stanchi.'],
      ['Un joule è…', ['il lavoro di 1 N su 1 m', 'la forza di 1 kg', 'la potenza di 1 W per 1 ora', '1 N al secondo'], '1 J = 1 N · m.'],
    ]),
  });

  /** Cassa tirata da una forza inclinata, con le componenti e lo spostamento. */
  function workSVG(F, a, s, Fa) {
    const rad = (a * Math.PI) / 180;
    const sc = 120 / 150;
    const L0 = Math.max(30, F * sc);
    const bx = 150;
    const by = 120;
    const cx = a > 90 ? bx : bx + 80; // la fune è attaccata dal lato verso cui tira
    const cy = by - 25;
    const fx = cx + L0 * Math.cos(rad);
    const fy = cy - L0 * Math.sin(rad);
    let sv = '<line class="ground" x1="20" y1="120" x2="480" y2="120"/>';
    for (let x = 24; x < 480; x += 14) sv += `<line class="hatch" x1="${x}" y1="120" x2="${x - 8}" y2="130"/>`;
    sv += `<rect class="body" x="${bx}" y="${by - 50}" width="80" height="50" rx="3"/>`;
    sv += arr(cx, cy, fx, fy, '', 3.2) + `<text class="lbl c" x="${fx + 6}" y="${fy - 4}">F</text>`;
    if (a % 180 !== 0) {
      sv += arr(cx, cy, cx + L0 * Math.cos(rad), cy, 'comp', 2) + `<line class="guide" x1="${fx}" y1="${fy}" x2="${fx}" y2="${cy}"/>`;
      sv += `<path class="angle" d="M${cx + 26} ${cy} A26 26 0 0 ${a > 0 ? 0 : 1} ${cx + 26 * Math.cos(rad)} ${cy - 26 * Math.sin(rad)}"/><text class="lbl sm" x="${cx + 30}" y="${cy - 8}">α</text>`;
    }
    if (Fa) sv += arr(bx, by - 12, bx - Math.max(24, Fa * sc), by - 12, 'w', 2.6) + `<text class="lbl w" x="${bx - Math.max(24, Fa * sc) - 6}" y="${by - 18}" text-anchor="end">F<tspan class="sb" dy="3">a</tspan></text>`;
    sv += arr(bx, 150, bx + Math.min(260, 40 + s * 10), 150, 's', 2.4) + `<text class="lbl s" x="${bx + Math.min(260, 40 + s * 10) / 2}" y="168" text-anchor="middle">s = ${N(s)} m</text>`;
    return `<svg class="phy" viewBox="0 0 500 180" role="img" style="max-width:500px"><title>Forza di ${N(F)} N inclinata di ${a}° su una cassa che si sposta di ${N(s)} m</title>${sv}</svg>`;
  }

  function widgetWork(host) {
    const c = K.widgetCard('Lavoro e angolo', 'Conta solo la parte della forza che va nella direzione dello spostamento');
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const draw = (v) => {
      const W = clean(BS.work(v.F, v.s, v.a));
      const par = clean(v.F * Math.cos((v.a * Math.PI) / 180));
      fig.innerHTML = workSVG(v.F, v.a, v.s, 0);
      const kind = Math.abs(W) < 1e-9 ? ['nullo', 'La forza è perpendicolare allo spostamento: non aiuta e non frena.'] : W > 0 ? ['motore (positivo)', 'La forza aiuta il moto: dà energia all\'oggetto.'] : ['resistente (negativo)', 'La forza si oppone al moto: toglie energia all\'oggetto.'];
      out.innerHTML = `<div class="form-row"><span class="label">Componente utile</span><div class="f">${F_} · cos α = ${N(v.F)} · ${N(Math.cos((v.a * Math.PI) / 180), 3)} = ${U(par, 'N')}</div></div>
        <div class="form-row"><span class="label">Lavoro</span><div class="f">${W_} = ${res(U(W, 'J'))}</div><span class="meta">Lavoro ${kind[0]}. ${kind[1]}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'F', label: 'Forza <var>F</var> (N)', min: 10, max: 150, step: 5, value: 80 },
      { id: 'a', label: 'Angolo α (°)', min: 0, max: 180, step: 5, value: 30 },
      { id: 's', label: 'Spostamento <var>s</var> (m)', min: 1, max: 20, step: 1, value: 10 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'lavoro', num: 1, short: 'Lavoro', title: 'Il lavoro di una forza',
    intro: 'In fisica "lavoro" ha un significato preciso: una forza compie lavoro quando sposta il suo punto di applicazione. Conta solo la parte della forza che va nella direzione del movimento.',
    goals: ['W = F · s · cos α', 'Lavoro positivo, negativo e nullo', 'Il joule', 'Lavoro della forza peso'],
    widgets: [widgetWork],
    example: w1[0], exampleTitle: 'Esempio: forza inclinata',
    families: w1,
    theory: `
      <article class="note"><h4>Definizione</h4>
        <div class="eq"><span>${W_} = ${F_} · ${s_} · cos α</span><span class="u">joule [J] = N · m</span></div>
        <p>α è l'angolo tra la forza e lo spostamento. Con α = 0° il lavoro è massimo, con α = 90° è nullo, con α tra 90° e 180° è negativo.</p></article>
      <article class="note"><h4>Lavoro della forza peso</h4>
        <p>Per sollevare una massa <var>m</var> di un'altezza <var>h</var> a velocità costante serve un lavoro <var>W</var> = <var>m</var> · <var>g</var> · <var>h</var>, con <var>g</var> = 9,81 m/s². Non dipende dalla strada fatta, solo dal dislivello.</p></article>
      <article class="note"><h4>Perché serve all'elettrotecnica</h4>
        <p>La tensione è proprio un lavoro per unità di carica (1 V = 1 J/C) e la potenza elettrica è lavoro al secondo. Le stesse idee tornano in 2ª e in 3ª.</p></article>`,
  });

  // =====================================================================
  // 2 — Energia cinetica e potenziale
  // =====================================================================
  const e2 = [];
  e2.push({
    id: 'en-cin', title: 'Energia cinetica', level: 1,
    defaults: { m: 1200, kmh: 50, kmhMode: true },
    gen: () => (Math.random() < 0.5
      ? { m: pick([0.5, 2, 5, 10, 60, 80]), v: pick([2, 3, 4, 5, 8, 10, 12]), kmhMode: false }
      : { m: pick([800, 1000, 1200, 1500]), kmh: pick([30, 36, 50, 72, 90, 108, 130]), kmhMode: true }),
    solve: (p) => { const v = p.kmhMode ? p.kmh / 3.6 : p.v; return { v, E: BS.kinetic(p.m, v) }; },
    text: (p) => (p.kmhMode ? `Un'auto di ${U(p.m, 'kg')} viaggia a ${p.kmh} km/h. Quanta energia cinetica ha?` : `Un corpo di ${U(p.m, 'kg')} si muove a ${N(p.v)} m/s. Quanta energia cinetica ha?`),
    asks: (p, r) => [qJ(Ec, r.E)],
    hint: (p) => (p.kmhMode ? 'Prima trasforma la velocità in m/s: dividi per 3,6.' : 'Ec = ½ · m · v².'),
    steps: (p, r) => (p.kmhMode ? step(`<var>v</var> = ${frac(p.kmh + ' km/h', '3,6')} = ${N(r.v, 4)} m/s`, '1 m/s = 3,6 km/h. Nelle formule la velocità va sempre in m/s.') : '') +
      step(`${Ec} = ½ · <var>m</var> · <var>v</var>² = ½ · ${N(p.m)} · ${N(r.v, 4)}² = ${res(U(r.E, 'J'))}`, 'La velocità è al quadrato: andare al doppio della velocità vuol dire quattro volte l\'energia (e quattro volte lo spazio di frenata).'),
  });
  e2.push({
    id: 'en-cons', title: 'Dall\'altezza alla velocità', level: 2,
    gen: () => ({ m: pick([0.2, 1, 2, 5, 50]), hh: pick([1.25, 2, 5, 10, 20, 45]), h2: Math.random() < 0.5 ? 0 : pick([0.5, 1]) }),
    solve: (p) => { const dh = p.h2 ? p.hh * (1 - p.h2 / 2) : p.hh; return { Ep: BS.potential(p.m, p.hh), dh, v: BS.speedFromHeight(dh), hEnd: p.hh - dh }; },
    text: (p, r) => `Un oggetto di ${U(p.m, 'kg')} parte da fermo da ${U(p.hh, 'm')} di altezza e scende senza attrito. Quanta energia potenziale ha all'inizio? Che velocità ha ${r.hEnd ? 'quando è a ' + U(r.hEnd, 'm') + ' da terra' : 'quando arriva a terra'}?`,
    asks: (p, r) => [qJ(Ep + ' iniziale', r.Ep), { label: '<var>v</var>', unit: 'm/s', value: r.v }],
    steps: (p, r) => step(`${Ep} = <var>m</var> · <var>g</var> · <var>h</var> = ${N(p.m)} · 9,81 · ${N(p.hh)} = ${res(U(r.Ep, 'J'))}`) +
      step(`Senza attrito l'energia si conserva: ½ <var>m</var> <var>v</var>² = <var>m</var> <var>g</var> Δ<var>h</var>, con Δ<var>h</var> = ${N(r.dh, 4)} m`, 'La massa si semplifica: una piuma e un sasso, senza aria, arriverebbero con la stessa velocità.') +
      step(`<var>v</var> = √(2 <var>g</var> Δ<var>h</var>) = √(2 · 9,81 · ${N(r.dh, 4)}) = ${res(N(r.v, 4) + ' m/s')}`, `Sono ${N(r.v * 3.6, 3)} km/h.`),
  });
  e2.push({
    id: 'en-alt', title: 'Fin dove sale?', level: 2,
    gen: () => ({ v: pick([2, 4, 5, 7, 9.9, 14, 20]) }),
    solve: (p) => ({ hh: BS.heightFromSpeed(p.v) }),
    text: (p) => `Lanci una palla verso l'alto a ${N(p.v)} m/s. Trascurando l'aria, fino a che altezza sale sopra il punto di lancio?`,
    asks: (p, r) => [{ label: '<var>h</var><sub>max</sub>', unit: 'm', value: r.hh }],
    hint: () => 'In cima la velocità è zero: tutta l\'energia cinetica è diventata potenziale.',
    steps: (p, r) => step(`½ <var>m</var> <var>v</var>² = <var>m</var> <var>g</var> <var>h</var> → <var>h</var> = ${frac('<var>v</var>²', '2<var>g</var>')} = ${frac(N(p.v) + '²', '2 · 9,81')} = ${res(U(r.hh, 'm'))}`, 'Problema rovesciato: dalla velocità ricavi l\'altezza. Raddoppiando la velocità l\'altezza diventa quattro volte tanto.'),
  });
  e2.push({
    id: 'en-attr', title: 'Dov\'è finita l\'energia?', level: 3,
    gen: () => L.nice(() => { const m = pick([20, 30, 40, 60]); const hh = pick([3, 5, 8, 10]); const k = pick([0.6, 0.7, 0.8, 0.9]); return { m, hh, v: Number((BS.speedFromHeight(hh) * Math.sqrt(k)).toFixed(1)) }; }, (p) => p.v < BS.speedFromHeight(p.hh), { m: 30, hh: 5, v: 8.6 }),
    solve: (p) => { const E0 = BS.potential(p.m, p.hh); const E1 = BS.kinetic(p.m, p.v); return { E0, E1, lost: E0 - E1, pct: ((E0 - E1) / E0) * 100 }; },
    text: (p) => `Un bambino di ${p.m} kg parte da fermo dalla cima di uno scivolo alto ${N(p.hh)} m e arriva in fondo a ${N(p.v)} m/s. Quanta energia si è trasformata in calore per l'attrito? Che percentuale dell'energia iniziale è?`,
    asks: (p, r) => [qJ('Energia dissipata', r.lost), { label: 'Percentuale persa', unit: '%', value: r.pct }],
    steps: (p, r) => step(`All'inizio: ${Ep} = ${N(p.m)} · 9,81 · ${N(p.hh)} = ${U(r.E0, 'J')}`) +
      step(`In fondo: ${Ec} = ½ · ${N(p.m)} · ${N(p.v)}² = ${U(r.E1, 'J')}`) +
      step(`Dissipata: ${U(r.E0, 'J')} − ${U(r.E1, 'J')} = ${res(U(r.lost, 'J'))} = ${res(N(r.pct, 3) + ' %')}`, 'L\'energia non sparisce: diventa calore (scivolo e pantaloni si scaldano). L\'energia totale si conserva sempre; si conserva solo quella meccanica quando non c\'è attrito.'),
  });
  e2.push({
    id: 'en-mc', title: 'Concetti sull\'energia', level: 1,
    ...mc([
      ['Se raddoppi la velocità di un\'auto, la sua energia cinetica…', ['diventa quattro volte', 'raddoppia', 'resta uguale', 'si dimezza'], 'Ec dipende dal quadrato della velocità.'],
      ['Senza attrito, una pallina che rotola giù da una collina…', ['trasforma energia potenziale in cinetica, e la somma resta costante', 'perde energia', 'guadagna energia dal nulla', 'ha sempre la stessa velocità'], 'Conservazione dell\'energia meccanica.'],
      ['Con l\'attrito l\'energia meccanica…', ['diminuisce, e la parte persa diventa calore', 'aumenta', 'resta uguale', 'diventa massa'], 'L\'energia totale si conserva; quella meccanica no.'],
      ['L\'energia potenziale gravitazionale dipende da…', ['massa e altezza', 'solo dalla velocità', 'solo dal tempo', 'dalla forma dell\'oggetto'], 'Ep = m g h.'],
      ['In una pila l\'energia è immagazzinata in forma…', ['chimica', 'cinetica', 'nucleare', 'gravitazionale'], 'Il generatore trasforma energia chimica in energia elettrica.'],
      ['Una centrale idroelettrica trasforma…', ['energia potenziale dell\'acqua in energia elettrica', 'calore in acqua', 'energia elettrica in acqua', 'energia nucleare in calore'], 'L\'acqua scende, fa girare la turbina, l\'alternatore produce corrente.'],
    ]),
  });

  /** Percorso delle montagne russe: altezza in funzione della posizione 0…1. */
  function track(H0, H2) {
    const pts = [[0, H0], [0.3, 0], [0.62, H2], [0.85, 0.15 * H0], [1, 0.3 * H0]];
    return (x) => {
      for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i][0]) {
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          const t = (x - x0) / (x1 - x0);
          return y0 + (y1 - y0) * (1 - Math.cos(Math.PI * t)) / 2;
        }
      }
      return pts[pts.length - 1][1];
    };
  }

  function widgetEnergy(host) {
    const c = K.widgetCard('Montagne russe', 'Il carrello parte da fermo: guarda come si scambiano energia potenziale e cinetica');
    const m = 500;
    let fric = false;
    let pos = 0;
    let timer = null;
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const ctl = el('div', 'row');
    ctl.innerHTML = '<button type="button" class="btn small">Lascia andare</button>';
    const go = ctl.firstChild;
    const sw = el('label', 'switch');
    sw.innerHTML = '<input type="checkbox"><span class="track"></span><span>Con attrito</span>';
    ctl.appendChild(sw);
    let last;
    const state = (v) => {
      const y = track(v.H0, v.H2);
      const E0 = m * g * v.H0;
      const k = fric ? 0.18 * E0 : 0; // energia persa su tutto il percorso
      // il carrello si ferma dove l'energia non basta più
      let xmax = 1;
      for (let i = 1; i <= 400; i++) { const x = i / 400; if (m * g * y(x) + k * x > E0 + 1e-6) { xmax = (i - 1) / 400; break; } }
      return { y, E0, k, xmax };
    };
    const draw = (v) => {
      last = v;
      const S = state(v);
      const x = Math.min(pos, S.xmax);
      const Hy = (hh) => 150 - (hh / 20) * 120;
      let d = '';
      for (let i = 0; i <= 200; i++) d += (i ? 'L' : 'M') + (30 + 440 * (i / 200)).toFixed(1) + ' ' + Hy(S.y(i / 200)).toFixed(1);
      const bx = 30 + 440 * x;
      const by = Hy(S.y(x)) - 9;
      const Epv = m * g * S.y(x);
      const Ed = S.k * x;
      const Ecv = Math.max(0, S.E0 - Epv - Ed);
      const vel = Math.sqrt((2 * Ecv) / m);
      const bar = (val, cls) => (val / S.E0) * 440;
      const w1b = bar(Epv);
      const w2b = bar(Ecv);
      const w3b = bar(Ed);
      fig.innerHTML = `<svg class="phy" viewBox="0 0 500 230" role="img" style="max-width:500px"><title>Carrello sulle montagne russe</title>
        <line class="ground" x1="20" y1="150" x2="480" y2="150"/><path class="rail" d="${d}"/>
        <line class="guide" x1="30" y1="${Hy(v.H0)}" x2="470" y2="${Hy(v.H0)}"/><text class="note" x="472" y="${Hy(v.H0) - 4}" text-anchor="end">quota di partenza</text>
        <circle class="cart" cx="${bx}" cy="${by}" r="9"/>
        <rect class="eb p" x="30" y="178" width="${w1b.toFixed(1)}" height="18"/><rect class="eb c" x="${(30 + w1b).toFixed(1)}" y="178" width="${w2b.toFixed(1)}" height="18"/><rect class="eb d" x="${(30 + w1b + w2b).toFixed(1)}" y="178" width="${w3b.toFixed(1)}" height="18"/>
        <rect class="ebox" x="30" y="178" width="440" height="18"/>
        <text class="note" x="30" y="214"><tspan class="lp">■</tspan> potenziale ${App.si(Epv, 'J', 3)}</text><text class="note" x="190" y="214"><tspan class="lc">■</tspan> cinetica ${App.si(Ecv, 'J', 3)}</text><text class="note" x="350" y="214"><tspan class="ld">■</tspan> calore ${App.si(Ed, 'J', 3)}</text></svg>`;
      const stuck = pos > S.xmax + 1e-9;
      out.innerHTML = `<div class="form-row"><span class="label">Velocità</span><div class="f"><var>v</var> = √(2${Ec}/<var>m</var>) = ${res(N(vel, 3) + ' m/s')} (${N(vel * 3.6, 3)} km/h)</div><span class="meta">${stuck || S.xmax < 1 ? 'Il carrello non ha abbastanza energia per superare la seconda collina: si ferma e torna indietro.' : fric ? 'Con l\'attrito una parte dell\'energia diventa calore: la somma di potenziale e cinetica cala.' : 'Senza attrito potenziale + cinetica resta sempre uguale all\'energia di partenza.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'H0', label: 'Altezza di partenza (m)', min: 4, max: 20, step: 0.5, value: 16 },
      { id: 'H2', label: 'Altezza della seconda collina (m)', min: 2, max: 19, step: 0.5, value: 12 },
      { id: 'x', label: 'Posizione del carrello (%)', min: 0, max: 100, step: 1, value: 0, sig: 3 },
    ], (v) => { pos = v.x / 100; draw(v); });
    sw.querySelector('input').addEventListener('change', (e) => { fric = e.target.checked; draw(last); });
    go.addEventListener('click', () => {
      if (timer) { clearInterval(timer); timer = null; go.textContent = 'Lascia andare'; return; }
      pos = 0;
      go.textContent = 'Ferma';
      timer = setInterval(() => {
        const S = state(last);
        if (!App.isVisible(c) || pos >= S.xmax) { clearInterval(timer); timer = null; go.textContent = 'Lascia andare'; return; }
        pos = Math.min(S.xmax, pos + 0.008);
        sl.fields.x.set(pos * 100);
        draw(last);
      }, App.reducedMotion ? 120 : 30);
    });
    c.append(ctl, fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'energia', num: 2, short: 'Energia', title: 'Energia cinetica, potenziale e conservazione',
    intro: 'L\'energia è la capacità di compiere lavoro. Un corpo in moto ha energia cinetica, un corpo in alto ha energia potenziale. Senza attrito la loro somma resta costante; con l\'attrito una parte diventa calore.',
    goals: ['Ec = ½ m v²', 'Ep = m g h', 'Conservazione dell\'energia meccanica', 'Energia dissipata'],
    widgets: [widgetEnergy],
    example: e2[1], exampleTitle: 'Esempio: dall\'altezza alla velocità',
    families: e2,
    theory: `
      <article class="note"><h4>Le due energie meccaniche</h4>
        <div class="eq"><span>${Ec} = ½ <var>m</var> <var>v</var>²</span><span>${Ep} = <var>m</var> <var>g</var> <var>h</var></span></div>
        <p>Si misurano in joule, come il lavoro. La velocità va in m/s (km/h ÷ 3,6).</p></article>
      <article class="note"><h4>Conservazione</h4>
        <p>Senza attriti ${Ec} + ${Ep} = costante. Con gli attriti l'energia meccanica diminuisce: la differenza è diventata calore. L'energia totale non si crea e non si distrugge, si trasforma.</p></article>
      <article class="note"><h4>Le forme dell'energia</h4>
        <p>Meccanica, termica, chimica (pile, carburanti), elettrica, luminosa, nucleare. Ogni macchina è un trasformatore di energia: un motore elettrico trasforma energia elettrica in meccanica, una dinamo il contrario.</p></article>`,
  });

  // =====================================================================
  // 3 — Potenza e rendimento
  // =====================================================================
  const p3 = [];
  p3.push({
    id: 'pot-calc', title: 'Quanto è potente?', level: 1,
    defaults: { m: 300, hh: 12, t: 30 },
    gen: () => ({ m: pick([50, 100, 200, 300, 500, 800]), hh: pick([3, 5, 6, 10, 12, 20]), t: pick([5, 10, 15, 20, 30, 60]) }),
    solve: (p) => { const W = BS.potential(p.m, p.hh); return { W, P: BS.power(W, p.t) }; },
    text: (p) => `Un montacarichi solleva ${U(p.m, 'kg')} di ${U(p.hh, 'm')} in ${p.t} s. Quanto lavoro utile fa e con che potenza?`,
    asks: (p, r) => [qJ(W_, r.W), qW('<var>P</var>', r.P)],
    steps: (p, r) => step(`${W_} = <var>m g h</var> = ${N(p.m)} · 9,81 · ${N(p.hh)} = ${res(U(r.W, 'J'))}`) +
      step(`<var>P</var> = ${frac(W_, '<var>t</var>')} = ${frac(U(r.W, 'J'), p.t + ' s')} = ${res(U(r.P, 'W'))}`, '1 watt è 1 joule al secondo. Lo stesso lavoro fatto in metà tempo richiede il doppio della potenza.'),
  });
  p3.push({
    id: 'pot-rend', title: 'Il rendimento', level: 1,
    gen: () => { const Pa = pick([500, 1000, 1500, 2000, 3000, 5500]); const e = pick([0.6, 0.75, 0.8, 0.85, 0.9, 0.92]); return { Pa, Pu: Pa * e }; },
    solve: (p) => ({ eta: (p.Pu / p.Pa) * 100, Pp: p.Pa - p.Pu }),
    text: (p) => `Un motore elettrico assorbe dalla rete ${U(p.Pa, 'W')} e fornisce all'albero ${U(p.Pu, 'W')} di potenza meccanica. Quanto vale il rendimento? Quanta potenza si perde in calore?`,
    asks: (p, r) => [{ label: eta, unit: '%', value: r.eta }, qW('Potenza persa', r.Pp)],
    steps: (p, r) => step(`${eta} = ${frac('<var>P</var><sub>u</sub>', '<var>P</var><sub>a</sub>')} = ${frac(N(p.Pu), N(p.Pa))} = ${res(N(r.eta, 3) + ' %')}`, 'Il rendimento è sempre minore di 1 (100 %): nessuna macchina restituisce tutta l\'energia che riceve.') +
      step(`<var>P</var><sub>p</sub> = <var>P</var><sub>a</sub> − <var>P</var><sub>u</sub> = ${res(U(r.Pp, 'W'))}`, 'Nei motori le perdite sono nel rame degli avvolgimenti (effetto Joule), nel ferro e negli attriti dei cuscinetti.'),
  });
  p3.push({
    id: 'pot-ass', title: 'Quanto assorbe dalla rete?', level: 2,
    gen: () => ({ Pu: pick([370, 750, 1100, 1500, 2200, 4000]), e: pick([70, 75, 80, 85, 90]) }),
    solve: (p) => { const Pa = p.Pu / (p.e / 100); return { Pa, I: Pa / 230 }; },
    text: (p) => `Ti serve un motore che dia ${U(p.Pu, 'W')} meccanici con un rendimento dell'${p.e} %. Quanta potenza assorbe dalla rete? Che corrente circola se la rete è a 230 V (considera il motore come un carico resistivo)?`,
    asks: (p, r) => [qW('<var>P</var><sub>a</sub>', r.Pa), { label: '<var>I</var>', unit: 'A', value: r.I }],
    steps: (p, r) => step(`<var>P</var><sub>a</sub> = ${frac('<var>P</var><sub>u</sub>', eta)} = ${frac(N(p.Pu), N(p.e / 100))} = ${res(U(r.Pa, 'W'))}`, 'Problema rovesciato: dividi per il rendimento. La potenza assorbita è sempre più grande di quella utile.') +
      step(`<var>I</var> = ${frac('<var>P</var><sub>a</sub>', '<var>V</var>')} = ${frac(N(r.Pa, 4), '230')} = ${res(U(r.I, 'A'))}`, 'P = V · I: la vedrai bene in 2ª. In alternata per un motore vero c\'è anche il fattore di potenza (4ª).'),
  });
  p3.push({
    id: 'pot-catena', title: 'Rendimenti in cascata', level: 2,
    gen: () => ({ e: [pick([0.85, 0.9, 0.95]), pick([0.8, 0.9, 0.95]), pick([0.6, 0.7, 0.75, 0.8])], Pa: pick([1000, 2000, 5000]) }),
    solve: (p) => { const et = BS.chainEff(p.e); return { et: et * 100, Pu: p.Pa * et }; },
    text: (p) => `Una pompa è mossa da un motore elettrico attraverso un riduttore. Rendimenti: motore ${N(p.e[0] * 100)} %, riduttore ${N(p.e[1] * 100)} %, pompa ${N(p.e[2] * 100)} %. Il motore assorbe ${U(p.Pa, 'W')}. Qual è il rendimento complessivo? Quanta potenza arriva all'acqua?`,
    asks: (p, r) => [{ label: eta + '<sub>tot</sub>', unit: '%', value: r.et }, qW('<var>P</var><sub>u</sub>', r.Pu)],
    steps: (p, r) => step(`${eta}<sub>tot</sub> = ${p.e.map((x) => N(x)).join(' · ')} = ${res(N(r.et, 3) + ' %')}`, 'In una catena di macchine i rendimenti si moltiplicano: il totale è più basso del peggiore dei singoli.') +
      step(`<var>P</var><sub>u</sub> = ${N(p.Pa)} · ${N(r.et / 100, 4)} = ${res(U(r.Pu, 'W'))}`),
  });
  p3.push({
    id: 'pot-tempo', title: 'Quanto ci mette?', level: 3,
    gen: () => ({ m: pick([200, 400, 600, 1000]), hh: pick([10, 15, 20, 30]), Pa: pick([1500, 2200, 3000, 4000]), e: pick([60, 70, 75, 80]) }),
    solve: (p) => { const W = BS.potential(p.m, p.hh); const Pu = (p.Pa * p.e) / 100; return { W, Pu, t: W / Pu }; },
    text: (p) => `Una gru con un motore da ${U(p.Pa, 'W')} assorbiti e rendimento ${p.e} % deve sollevare ${U(p.m, 'kg')} di materiale a ${p.hh} m. Quanto tempo ci mette, come minimo?`,
    asks: (p, r) => [{ label: '<var>t</var>', unit: 's', value: r.t }],
    hint: () => 'Prima la potenza utile (quella che solleva davvero), poi t = W / P.',
    steps: (p, r) => step(`${W_} = ${N(p.m)} · 9,81 · ${p.hh} = ${U(r.W, 'J')}`) + step(`<var>P</var><sub>u</sub> = ${N(p.Pa)} · ${N(p.e / 100)} = ${U(r.Pu, 'W')}`, 'Il trabocchetto: a sollevare il carico va solo la potenza utile, non quella assorbita.') +
      step(`<var>t</var> = ${frac(W_, '<var>P</var><sub>u</sub>')} = ${res(U(r.t, 's'))}`),
  });
  p3.push({
    id: 'pot-mc', title: 'Concetti su potenza e rendimento', level: 1,
    ...mc([
      ['Il watt è…', ['un joule al secondo', 'un joule per metro', 'un newton per secondo', 'un volt per metro'], 'La potenza dice quanto in fretta si fa un lavoro o si trasferisce energia.'],
      ['Due persone salgono le stesse scale, una in 10 s e una in 20 s. Hanno lo stesso peso. La prima ha…', ['fatto lo stesso lavoro con potenza doppia', 'fatto il doppio del lavoro', 'fatto metà lavoro', 'la stessa potenza'], 'Il lavoro dipende solo da peso e dislivello; la potenza anche dal tempo.'],
      ['Un rendimento del 100 %…', ['non esiste in una macchina reale', 'è normale per i motori elettrici', 'si ha nei motori a scoppio', 'si ha con l\'attrito'], 'Qualche perdita c\'è sempre.'],
      ['Il cavallo vapore (CV) vale circa…', ['735 W', '1000 W', '100 W', '1 kWh'], 'Si usa ancora per le auto: 100 CV ≈ 73,5 kW.'],
      ['Il rendimento di un motore elettrico è di solito…', ['80–95 %', '20–30 %', '100 %', '5 %'], 'Molto più alto di un motore a benzina, che sta intorno al 25–35 %.'],
    ]),
  });

  function widgetPower(host) {
    const c = K.widgetCard('Il bilancio delle potenze', 'Un motore elettrico solleva un carico: dove va la potenza che assorbe?');
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const draw = (v) => {
      const W = BS.potential(v.m, v.h);
      const Pu = W / v.t;
      const Pa = Pu / (v.e / 100);
      const Pp = Pa - Pu;
      const sc = 120 / Math.max(Pa, 1);
      const hA = Math.max(4, Pa * sc);
      const hU = Math.max(3, Pu * sc);
      const hP = Math.max(1, Pp * sc);
      // diagramma a nastro: l'ingresso si divide in utile e perdite
      const y0 = 30;
      const s = `<path class="band a" d="M20 ${y0} H200 V${y0 + hA} H20 Z"/>
        <path class="band u" d="M200 ${y0} C260 ${y0} 260 ${y0} 330 ${y0} H470 V${y0 + hU} H330 C270 ${y0 + hU} 260 ${y0 + hU} 200 ${y0 + hU} Z"/>
        <path class="band p" d="M200 ${y0 + hU} C250 ${y0 + hU} 270 ${y0 + hU} 300 ${y0 + hU + 30} V${y0 + hU + 30 + hP} C260 ${y0 + hU + hP} 250 ${y0 + hA} 200 ${y0 + hA} Z"/>
        <text class="note" x="24" y="${y0 + hA / 2 + 4}">assorbita ${App.si(Pa, 'W', 3)}</text>
        <text class="note" x="340" y="${y0 + hU / 2 + 4}">utile ${App.si(Pu, 'W', 3)}</text>
        <text class="note d" x="308" y="${y0 + hU + 30 + hP / 2 + 4}">perdite (calore) ${App.si(Pp, 'W', 3)}</text>`;
      fig.innerHTML = `<svg class="phy" viewBox="0 0 500 ${Math.max(200, y0 + hU + 50 + hP)}" role="img" style="max-width:500px"><title>Diagramma delle potenze del motore</title>${s}</svg>`;
      out.innerHTML = `<div class="form-row"><span class="label">Utile</span><div class="f"><var>P</var><sub>u</sub> = ${frac('<var>m g h</var>', '<var>t</var>')} = ${frac(App.si(W, 'J', 3), N(v.t) + ' s')} = ${res(App.si(Pu, 'W', 3))}</div></div>
        <div class="form-row"><span class="label">Assorbita</span><div class="f"><var>P</var><sub>a</sub> = ${frac('<var>P</var><sub>u</sub>', eta)} = ${res(App.si(Pa, 'W', 3))}</div><span class="meta">A 230 V sono circa ${App.si(Pa / 230, 'A', 3)}. Fare più in fretta (t più piccolo) richiede più potenza, non più energia.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'm', label: 'Massa (kg)', min: 10, max: 1000, log: true, value: 200 },
      { id: 'h', label: 'Altezza (m)', min: 1, max: 30, step: 0.5, value: 10 },
      { id: 't', label: 'Tempo (s)', min: 2, max: 120, log: true, value: 20 },
      { id: 'e', label: 'Rendimento η (%)', min: 30, max: 98, step: 1, value: 80 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'potenza', num: 3, short: 'Potenza', title: 'Potenza e rendimento',
    intro: 'Non conta solo quanto lavoro fai, ma anche quanto in fretta lo fai: è la potenza. E nessuna macchina restituisce tutta l\'energia che riceve: il rapporto tra quello che dà e quello che prende è il rendimento.',
    goals: ['P = W / t', 'Il watt e il cavallo vapore', 'η = Pu / Pa', 'Rendimenti in cascata'],
    widgets: [widgetPower],
    example: p3[1], exampleTitle: 'Esempio: il rendimento di un motore',
    families: p3,
    theory: `
      <article class="note"><h4>Potenza</h4>
        <div class="eq"><span><var>P</var> = ${frac(W_, '<var>t</var>')}</span><span class="u">watt [W] = J/s</span></div>
        <p>Multipli: kW, MW. Il cavallo vapore: 1 CV ≈ 735,5 W.</p></article>
      <article class="note"><h4>Rendimento</h4>
        <div class="eq"><span>${eta} = ${frac('<var>P</var><sub>u</sub>', '<var>P</var><sub>a</sub>')} = ${frac('<var>P</var><sub>u</sub>', '<var>P</var><sub>u</sub> + <var>P</var><sub>p</sub>')}</span></div>
        <p>Sempre minore di 1. In una catena di macchine i rendimenti si moltiplicano: ${eta}<sub>tot</sub> = ${eta}<sub>1</sub> · ${eta}<sub>2</sub> · …</p></article>`,
  });

  // =====================================================================
  // 4 — Energia elettrica: kWh e bolletta
  // =====================================================================
  const b4 = [];
  const APPL = [
    ['Frigorifero', 150, 24, 'media, il compressore si accende e si spegne'],
    ['Lavatrice', 2000, 1, 'un lavaggio al giorno'],
    ['Forno elettrico', 2200, 0.5, ''],
    ['Asciugacapelli', 1600, 0.2, ''],
    ['Televisore', 90, 4, ''],
    ['PC da gioco', 400, 3, ''],
    ['Condizionatore', 900, 6, 'd\'estate'],
    ['5 lampadine LED', 45, 5, '9 W ciascuna'],
    ['5 lampadine a incandescenza', 300, 5, '60 W ciascuna, la stessa luce dei LED'],
    ['Router Wi-Fi', 10, 24, ''],
    ['Apparecchi in stand-by', 15, 24, 'lucine e alimentatori sempre accesi'],
    ['Caricatore del telefono', 10, 2, ''],
  ];
  b4.push({
    id: 'kwh-calc', title: 'Quanto consuma?', level: 1,
    defaults: { k: 1, days: 30, price: 0.25 },
    gen: () => ({ k: rand(0, APPL.length - 1), days: pick([7, 30, 365]), price: pick([0.2, 0.25, 0.3]) }),
    solve: (p) => { const [, P, hh] = APPL[p.k]; const E = BS.kWh(P, hh * p.days); return { P, hh, E, cost: E * p.price }; },
    text: (p, r) => `${APPL[p.k][0]}: ${U(r.P, 'W')}, acceso ${N(r.hh)} ${r.hh === 1 ? 'ora' : 'ore'} al giorno. Quanta energia consuma in ${p.days === 365 ? 'un anno' : p.days === 30 ? 'un mese (30 giorni)' : 'una settimana'}? Quanto costa a ${N(p.price)} €/kWh?`,
    asks: (p, r) => [{ label: '<var>E</var>', unit: 'kWh', value: r.E }, { label: 'Costo', unit: '€', value: r.cost }],
    steps: (p, r) => step(`<var>E</var> = <var>P</var> · <var>t</var> = ${N(r.P / 1000, 4)} kW · (${N(r.hh)} h · ${p.days}) = ${res(N(r.E, 4) + ' kWh')}`, 'Potenza in kW per tempo in ore dà kWh, l\'unità della bolletta.') +
      step(`Costo = ${N(r.E, 4)} · ${N(p.price)} = ${res(eur(r.cost))}`),
  });
  b4.push({
    id: 'kwh-j', title: 'Joule e kWh', level: 1,
    gen: () => (Math.random() < 0.5 ? { dir: 'toJ', x: pick([0.5, 1, 2.5, 3, 10, 150]) } : { dir: 'toK', x: pick([3.6e6, 7.2e6, 1.8e6, 9e5, 3.6e8, 3.6e5]) }),
    solve: (p) => ({ y: p.dir === 'toJ' ? BS.toJ(p.x) : BS.toKWh(p.x) }),
    text: (p) => (p.dir === 'toJ' ? `Quanti joule sono ${N(p.x)} kWh?` : `Quanti kWh sono ${App.si(p.x, 'J', 4)}?`),
    asks: (p, r) => [p.dir === 'toJ' ? { label: 'Energia', unit: 'MJ', value: r.y / 1e6 } : { label: 'Energia', unit: 'kWh', value: r.y }],
    steps: (p, r) => step('1 kWh = 1000 W · 3600 s = 3 600 000 J = 3,6 MJ', 'Il kilowattora è l\'energia di un apparecchio da 1 kW acceso per un\'ora.') +
      step(p.dir === 'toJ' ? `${N(p.x)} · 3,6 MJ = ${res(N(r.y / 1e6, 4) + ' MJ')}` : `${frac(App.si(p.x, 'J', 4), '3,6 MJ')} = ${res(N(r.y, 4) + ' kWh')}`),
  });
  b4.push({
    id: 'kwh-standby', title: 'Lo stand-by', level: 2,
    gen: () => ({ P: pick([2, 5, 8, 15, 25]), n: pick([3, 5, 8, 10]), price: pick([0.22, 0.25, 0.3]) }),
    solve: (p) => { const E = BS.kWh(p.P * p.n, 24 * 365); return { E, cost: E * p.price }; },
    text: (p) => `In casa ci sono ${p.n} apparecchi lasciati in stand-by, ognuno assorbe ${p.P} W giorno e notte. Quanta energia sprecano in un anno? Quanto costa a ${N(p.price)} €/kWh?`,
    asks: (p, r) => [{ label: '<var>E</var>', unit: 'kWh', value: r.E }, { label: 'Costo', unit: '€', value: r.cost }],
    steps: (p, r) => step(`<var>P</var> = ${p.n} · ${p.P} W = ${p.n * p.P} W; <var>t</var> = 24 · 365 = 8760 h`) +
      step(`<var>E</var> = ${N((p.n * p.P) / 1000, 4)} kW · 8760 h = ${res(N(r.E, 4) + ' kWh')}; costo ${res(eur(r.cost))}`, 'Pochi watt sempre accesi pesano quanto un apparecchio potente usato poco: conta la potenza per il tempo.'),
  });
  b4.push({
    id: 'kwh-led', title: 'LED o incandescenza?', level: 2,
    gen: () => ({ n: pick([4, 6, 8, 10]), hh: pick([3, 4, 5, 6]), price: pick([0.22, 0.25, 0.3]) }),
    solve: (p) => { const d = BS.kWh((60 - 9) * p.n, p.hh * 365); return { d, eur: d * p.price }; },
    text: (p) => `Sostituisci ${p.n} lampadine a incandescenza da 60 W con lampadine LED da 9 W che fanno la stessa luce. Sono accese ${p.hh} ore al giorno. Quanta energia risparmi in un anno, e quanti euro a ${N(p.price)} €/kWh?`,
    asks: (p, r) => [{ label: 'Risparmio', unit: 'kWh', value: r.d }, { label: 'Risparmio', unit: '€', value: r.eur }],
    steps: (p, r) => step(`Differenza di potenza: ${p.n} · (60 − 9) = ${p.n * 51} W`) +
      step(`<var>E</var> = ${N((p.n * 51) / 1000, 4)} kW · ${p.hh} h · 365 = ${res(N(r.d, 4) + ' kWh')} → ${res(eur(r.eur))}`, 'La lampadina a incandescenza trasforma in luce solo il 5 % circa dell\'energia: il resto è calore. Il LED ha un rendimento molto più alto.'),
  });
  b4.push({
    id: 'kwh-ore', title: 'Quante ore?', level: 2,
    gen: () => ({ P: pick([500, 1000, 1500, 2000, 2500]), E: pick([1, 2, 3, 5, 10]) }),
    solve: (p) => ({ t: p.E / (p.P / 1000) }),
    text: (p) => `Un pannello fotovoltaico con la sua batteria ti mette a disposizione ${p.E} kWh. Per quante ore puoi far funzionare una stufetta da ${U(p.P, 'W')}?`,
    asks: (p, r) => [{ label: '<var>t</var>', unit: 'h', value: r.t }],
    steps: (p, r) => step(`<var>t</var> = ${frac('<var>E</var>', '<var>P</var>')} = ${frac(p.E + ' kWh', N(p.P / 1000) + ' kW')} = ${res(N(r.t, 4) + ' h')}`, 'Formula inversa di E = P · t, con le unità coerenti (kWh e kW).'),
  });
  b4.push({
    id: 'kwh-mc', title: 'Concetti sulla bolletta', level: 1,
    ...mc([
      ['In bolletta si paga…', ['l\'energia, in kWh', 'la potenza, in kW', 'la corrente, in A', 'la tensione, in V'], 'Il contatore conta i kWh. La potenza impegnata (es. 3 kW) è solo il massimo che puoi usare insieme.'],
      ['Il kWh è un\'unità di…', ['energia', 'potenza', 'tempo', 'corrente'], 'kW × h: una potenza per un tempo.'],
      ['Consuma più energia in un mese…', ['un frigorifero da 150 W sempre acceso', 'un asciugacapelli da 1600 W usato 10 minuti al giorno', 'sono uguali', 'dipende dalla tensione'], 'Frigo: 0,15 · 24 · 30 = 108 kWh. Phon: 1,6 · 1/6 · 30 = 8 kWh.'],
      ['Con un contratto da 3 kW, accendendo insieme forno (2,2 kW) e lavatrice (2 kW)…', ['il contatore può staccare la corrente', 'paghi di meno', 'non succede niente', 'si brucia la lavatrice'], 'Si supera la potenza disponibile; il limitatore del contatore interviene dopo un po\'.'],
    ]),
  });

  function widgetBill(host) {
    const c = K.widgetCard('La bolletta di casa', 'Accendi e spegni gli apparecchi: la potenza conta, ma conta anche per quanto tempo restano accesi');
    const on = APPL.map((a, i) => (i === 0 || i === 1 || i === 4 || i === 7 || i === 9 || i === 10 ? 1 : 0));
    const tbl = el('div', 'table-wrap');
    const out = el('div', 'forms');
    let price = 0.25;
    const draw = () => {
      let tot = 0;
      let Pmax = 0;
      const rows = APPL.map(([name, P, hh, note], i) => {
        const E = BS.kWh(P, hh * 30);
        if (on[i]) { tot += E; Pmax += P; }
        return `<tr class="${on[i] ? 'hl' : 'off'}"><td><button type="button" class="tog-row" data-i="${i}" aria-pressed="${!!on[i]}">${on[i] ? '●' : '○'}</button></td><td class="nm">${name}${note ? `<span class="hint"> · ${note}</span>` : ''}</td><td>${N(P)} W</td><td>${N(hh)} h</td><td>${N(E, 3)} kWh</td></tr>`;
      }).join('');
      tbl.innerHTML = `<table class="tt bill"><thead><tr><th></th><th>Apparecchio</th><th>Potenza</th><th>Ore al giorno</th><th>kWh al mese</th></tr></thead><tbody>${rows}</tbody></table>`;
      out.innerHTML = `<div class="form-row"><span class="label">Al mese</span><div class="f">${res(N(tot, 4) + ' kWh')} → ${res(eur(tot * price))}</div><span class="meta">Se fossero accesi tutti insieme assorbirebbero ${App.si(Pmax, 'W', 3)}${Pmax > 3000 ? ': oltre i 3 kW di un contratto normale, il contatore staccherebbe' : ''}.</span></div>`;
    };
    tbl.addEventListener('click', (e) => { const b = e.target.closest('.tog-row'); if (b) { const i = Number(b.dataset.i); on[i] = 1 - on[i]; draw(); } });
    K.sliders(c, [{ id: 'pr', label: 'Prezzo dell\'energia (€/kWh)', min: 0.1, max: 0.5, step: 0.01, value: 0.25 }], (v) => { price = v.pr; draw(); });
    c.append(tbl, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'bolletta', num: 4, short: 'kWh', title: 'L\'energia elettrica: kWh e bolletta',
    intro: 'L\'energia elettrica si compra a kilowattora. Basta una moltiplicazione, potenza per tempo, per capire quali apparecchi pesano davvero sulla bolletta e quanto si risparmia cambiandoli.',
    goals: ['E = P · t', '1 kWh = 3,6 MJ', 'Costo dell\'energia', 'Stand-by e risparmio'],
    widgets: [widgetBill],
    example: b4[0], exampleTitle: 'Esempio: quanto costa un apparecchio',
    families: b4,
    theory: `
      <article class="note"><h4>Energia e potenza</h4>
        <div class="eq"><span><var>E</var> = <var>P</var> · <var>t</var></span><span class="u">kW · h = kWh</span></div>
        <p>1 kWh = 1000 W · 3600 s = 3,6 MJ. Un apparecchio da 2 kW in mezz'ora consuma 1 kWh, uno da 10 W ci mette 100 ore.</p></article>
      <article class="note"><h4>Potenza e contatore</h4>
        <p>Il contratto di casa di solito è da 3 kW: è la potenza massima che puoi usare nello stesso momento. In bolletta invece paghi l'energia, cioè i kWh contati dal contatore.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'ene', year: '1', yearLabel: '1ª', title: 'Lavoro, energia e potenza', route: 'ene-lavoro', lessonWord: 'Lezione',
    desc: 'Lavoro di una forza, energia cinetica e potenziale, conservazione, potenza e rendimento, kWh e bolletta di casa.',
    lessons,
  });
})();
