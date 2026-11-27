/* 2ª — Il circuito elementare: corrente, generatore reale, legge di Ohm, potenza ed effetto Joule */
(function () {
  'use strict';
  const App = window.App;
  const BS = window.Basi;
  const P = window.Phys;
  const L = App.Lessons;
  const { N, U, frac, step, res } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const S = App.Schem.T;
  const lessons = [];
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const mc = (bank) => ({
    gen: () => ({ k: rand(0, bank.length - 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const [q, opts, why] = bank[p.k]; return { q, opts: p.o.map((i) => opts[i]), ans: p.o.indexOf(0), why }; },
    text: (p, r) => r.q,
    asks: (p, r) => [h.choice('Risposta', r.opts, r.ans)],
    steps: (p, r) => step(res(r.opts[r.ans]), r.why),
  });
  const V_ = '<var>V</var>';
  const I_ = '<var>I</var>';
  const R_ = '<var>R</var>';
  const E_ = '<var>E</var>';
  const r_ = '<var>r</var>';
  /** Fondo scala con 4 tacche dal passo tondo. */
  const nice4 = (x) => { const p = Math.pow(10, Math.floor(Math.log10(x / 4))); return 4 * p * [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => 4 * m * p >= x * 0.999); };
  const lab = (txt) => `<p class="hint">${txt} <a href="#circuito" data-route="circuito">Apri il laboratorio del circuito elementare</a>: generatore reale, interruttore, strumenti, missioni.</p>`;
  const linkCard = (host, txt) => { const d = el('div'); d.innerHTML = lab(txt); host.appendChild(d); };

  // =====================================================================
  // 1 — La corrente elettrica
  // =====================================================================
  const c1 = [];
  c1.push({
    id: 'cor-I', title: 'Quanta corrente?', level: 1,
    defaults: { Q: 0.6, t: 120 },
    gen: () => ({ Q: pick([0.05, 0.12, 0.6, 1.5, 3, 18, 90]), t: pick([2, 5, 10, 30, 60, 120, 600]) }),
    solve: (p) => ({ I: p.Q / p.t }),
    text: (p) => `In ${p.t >= 60 ? N(p.t / 60) + (p.t === 60 ? ' minuto' : ' minuti') : p.t + ' s'} attraversano una sezione del filo ${U(p.Q, 'C')}. Quanto vale l'intensità di corrente?`,
    asks: (p, r) => [h.qI(I_, r.I)],
    hint: () => 'I = Q / t, con il tempo in secondi.',
    steps: (p, r) => step(`${I_} = ${frac('<var>Q</var>', '<var>t</var>')} = ${frac(N(p.Q) + ' C', p.t + ' s')} = ${res(U(r.I, 'A'))}`, '1 ampere vuol dire 1 coulomb al secondo. Il milliampere (mA) è un millesimo di ampere.'),
  });
  c1.push({
    id: 'cor-mah', title: 'La capacità di una batteria', level: 2,
    gen: () => ({ mAh: pick([1000, 2000, 2500, 3000, 4000, 5000]), mA: pick([50, 100, 150, 200, 250, 400, 500]) }),
    solve: (p) => ({ hh: BS.batteryHours(p.mAh, p.mA), Q: (p.mAh / 1000) * 3600 }),
    text: (p) => `Un power bank ha una capacità di ${N(p.mAh)} mAh. Quante ore può erogare ${p.mA} mA? Quanta carica contiene, in coulomb?`,
    asks: (p, r) => [{ label: '<var>t</var>', unit: 'h', value: r.hh }, { label: '<var>Q</var>', unit: 'C', value: r.Q }],
    hint: () => 'mAh vuol dire "milliampere per ore": dividi per la corrente. Per i coulomb trasforma in A e in secondi.',
    steps: (p, r) => step(`<var>t</var> = ${frac(N(p.mAh) + ' mAh', p.mA + ' mA')} = ${res(N(r.hh, 4) + ' h')}`, 'La capacità è una carica: corrente per tempo.') +
      step(`<var>Q</var> = ${N(p.mAh / 1000)} A · 3600 s = ${res(U(r.Q, 'C'))}`, 'In pratica dura un po\' meno: la tensione cala verso la fine e c\'è il rendimento del circuito.'),
  });
  c1.push({
    id: 'cor-e', title: 'Elettroni al secondo', level: 2,
    gen: () => ({ I: pick([0.001, 0.02, 0.1, 0.5, 1, 2, 10]) }),
    solve: (p) => ({ n: p.I / P.QE }),
    text: (p) => `In un filo scorre una corrente di ${U(p.I, 'A')}. Quanti elettroni attraversano una sezione in un secondo? (<var>e</var> = 1,602 · 10<sup>−19</sup> C)`,
    asks: (p, r) => App.B.qSci('<var>n</var>', r.n),
    steps: (p, r) => step(`In 1 s passa <var>Q</var> = ${U(p.I, 'C')} → <var>n</var> = ${frac('<var>Q</var>', '<var>e</var>')} = ${res(App.B.sciOf(r.n))}`, 'Numeri enormi: per questo si usa il coulomb e non si contano gli elettroni uno per uno.'),
  });
  c1.push({
    id: 'cor-mc', title: 'Concetti sulla corrente', level: 1,
    ...mc([
      ['Il verso convenzionale della corrente…', ['esce dal polo + del generatore e rientra dal polo −', 'è quello in cui si muovono gli elettroni', 'va sempre da sinistra a destra', 'cambia ogni secondo'], 'È il verso in cui si muoverebbero cariche positive. Gli elettroni vanno al contrario.'],
      ['In un circuito con un solo anello (in serie), la corrente…', ['è la stessa in ogni punto', 'si consuma passando nel carico', 'è più forte vicino al polo +', 'è nulla dopo il carico'], 'Le cariche non si accumulano e non spariscono: quante ne entrano tante ne escono.'],
      ['L\'amperometro si collega…', ['in serie, interrompendo il circuito', 'in parallelo al carico', 'tra i due poli del generatore', 'senza fili'], 'Deve essere attraversato dalla stessa corrente che vuoi misurare.'],
      ['1 A corrisponde a…', ['1 C al secondo', '1 V per ohm al secondo', '1 J al secondo', '1 W per volt al minuto'], 'Anche 1 A = 1 V / 1 Ω, ma come definizione è carica al secondo.'],
      ['Gli elettroni in un filo di rame si muovono…', ['lentamente, frazioni di millimetro al secondo', 'alla velocità della luce', 'a 300 km/h', 'solo quando il filo si scalda'], 'Veloce è il segnale (il campo elettrico), non gli elettroni.'],
      ['Perché in un circuito ci sia corrente serve…', ['un percorso chiuso e un generatore', 'solo un generatore', 'solo un filo di rame', 'un amperometro'], 'Circuito aperto, niente corrente.'],
    ]),
  });

  function widgetCurrent(host) {
    const c = K.widgetCard('Un fiume di cariche', 'La corrente è la carica che attraversa la sezione del filo in un secondo');
    let elec = false;
    let raf = null;
    let ph = 0;
    let last = null;
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const sw = el('label', 'switch');
    sw.innerHTML = '<input type="checkbox"><span class="track"></span><span>Mostra gli elettroni (verso reale)</span>';
    const dots = 26;
    const paint = () => {
      const v = last;
      const speed = 0.4 + Math.log10(v.I * 1000 + 1) * 0.9;
      let s = '<rect class="wire-tube" x="30" y="40" width="440" height="50" rx="25"/><line class="section" x1="250" y1="34" x2="250" y2="96"/><text class="note" x="250" y="26" text-anchor="middle">sezione del filo</text>';
      for (let k = 0; k < dots; k++) {
        const base = ((k * 440) / dots + ph * speed * (elec ? -1 : 1)) % 440;
        const x = 30 + ((base + 440) % 440);
        const y = 52 + ((k * 7) % 27);
        s += `<circle class="${elec ? 'el' : 'pos'}" cx="${x.toFixed(1)}" cy="${y}" r="5"/>`;
      }
      s += `<g class="arr ${elec ? 'w' : ''}"><line x1="${elec ? 330 : 170}" y1="112" x2="${elec ? 186 : 314}" y2="112" style="stroke-width:3"/><polygon points="${elec ? '170,112 186,106 186,118' : '330,112 314,106 314,118'}"/></g>`;
      s += `<text class="note" x="250" y="132" text-anchor="middle">${elec ? 'gli elettroni (−) vanno da − verso +' : 'verso convenzionale: dal + verso il −'}</text>`;
      fig.innerHTML = `<svg class="phy" viewBox="0 0 500 140" role="img" style="max-width:500px"><title>Cariche che scorrono in un filo</title>${s}</svg>`;
    };
    const draw = (v) => {
      last = v;
      paint();
      const n = v.I / P.QE;
      out.innerHTML = `<div class="form-row"><span class="label">In un secondo</span><div class="f"><var>Q</var> = ${I_} · 1 s = ${U(v.I, 'C')}, cioè ${App.B.sciOf(n)} elettroni</div></div>
        <div class="form-row"><span class="label">Batteria</span><div class="f"><var>t</var> = ${frac(N(v.C) + ' mAh', App.si(v.I * 1000, '', 3) + ' mA')} = ${res(N(v.C / (v.I * 1000), 3) + ' h')}</div><span class="meta">Più corrente chiedi, prima si scarica. La velocità dei puntini nel disegno è solo indicativa.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'I', label: 'Corrente <var>I</var> (A)', min: 0.001, max: 10, log: true, value: 0.2 },
      { id: 'C', label: 'Capacità della batteria (mAh)', min: 500, max: 10000, step: 100, value: 3000 },
    ], draw);
    sw.querySelector('input').addEventListener('change', (e) => { elec = e.target.checked; paint(); });
    c.append(sw, fig, out);
    host.appendChild(c);
    draw(sl.values);
    if (!App.reducedMotion) {
      const tick = () => {
        if (!c.isConnected) { raf = null; return; }
        if (App.isVisible(c)) { ph += 1; paint(); }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    linkCard(host, 'Vuoi vedere le cariche nel circuito completo?');
  }

  lessons.push({
    id: 'corrente', num: 1, short: 'Corrente', title: 'La corrente elettrica',
    intro: 'Una corrente elettrica è un movimento ordinato di cariche. La sua intensità dice quanta carica passa in un secondo attraverso una sezione del conduttore.',
    goals: ['I = Q / t', 'L\'ampere e i suoi sottomultipli', 'Verso convenzionale e verso degli elettroni', 'Capacità in mAh'],
    widgets: [widgetCurrent],
    example: c1[0], exampleTitle: 'Esempio: dalla carica alla corrente',
    families: c1,
    theory: `
      <article class="note"><h4>Intensità di corrente</h4>
        <div class="eq"><span>${I_} = ${frac('<var>Q</var>', '<var>t</var>')}</span><span class="u">ampere [A] = C/s</span></div>
        <p>Si misura con l'amperometro, collegato in serie. In un anello senza diramazioni la corrente è la stessa in ogni punto.</p></article>
      <article class="note"><h4>Verso</h4>
        <p>Per convenzione la corrente esce dal polo + del generatore, attraversa il carico e rientra dal polo −. Nei metalli si muovono gli elettroni, in verso opposto.</p></article>
      <article class="note"><h4>Corrente continua e alternata</h4>
        <p>Pile e batterie danno corrente continua (sempre nello stesso verso). La presa di casa dà corrente alternata, che cambia verso 100 volte al secondo: la studierai in 4ª.</p></article>`,
  });

  // =====================================================================
  // 2 — Tensione, f.e.m. e generatore reale
  // =====================================================================
  const g2 = [];
  g2.push({
    id: 'gen-V', title: 'Il generatore sotto carico', level: 1,
    defaults: { E: 12, r: 0.5, R: 5.5 },
    gen: () => L.nice(() => ({ E: pick([1.5, 4.5, 9, 12, 24]), r: pick([0.1, 0.2, 0.5, 1, 2]), R: pick([1, 2.2, 4.7, 5.5, 10, 22, 47]) }), (p) => p.R > p.r, { E: 12, r: 0.5, R: 5.5 }),
    solve: (p) => BS.realGen(p.E, p.r, p.R),
    text: (p) => `Un generatore con ${E_} = ${U(p.E, 'V')} e resistenza interna ${r_} = ${U(p.r, 'Ω')} alimenta un carico ${R_} = ${U(p.R, 'Ω')}. Quanto valgono la corrente e la tensione ai morsetti?`,
    fig: (p, r, sol) => S.realGen(p, sol ? { A: App.si(r.I, 'A'), V: App.si(r.V, 'V') } : { A: '?', V: '?' }),
    asks: (p, r) => [h.qI(I_, r.I), h.qV(V_ + '<sub>AB</sub>', r.V)],
    steps: (p, r) => step(`${I_} = ${frac(E_, R_ + ' + ' + r_)} = ${frac(N(p.E), N(p.R) + ' + ' + N(p.r))} = ${res(U(r.I, 'A'))}`, 'La f.e.m. spinge la corrente attraverso tutta la resistenza dell\'anello: quella del carico e quella interna.') +
      step(`${V_}<sub>AB</sub> = ${E_} − ${r_} · ${I_} = ${N(p.E)} − ${N(p.r)} · ${N(r.I, 4)} = ${res(U(r.V, 'V'))}`, `Dentro il generatore si perdono ${U(r.Vr, 'V')}. Controllo: ${R_} · ${I_} = ${U(p.R * r.I, 'V')}.`),
  });
  g2.push({
    id: 'gen-r', title: 'Misura la resistenza interna', level: 2,
    gen: () => { const E = pick([4.5, 9, 12]); const r = pick([0.2, 0.5, 1, 1.5]); const R = pick([4.7, 10, 22]); const g0 = BS.realGen(E, r, R); return { E, R, V: Number(g0.V.toFixed(3)) }; },
    solve: (p) => { const I = p.V / p.R; return { I, r: BS.internalR(p.E, p.V, I) }; },
    text: (p) => `Con l'interruttore aperto il voltmetro ai morsetti di una batteria segna ${U(p.E, 'V')}. Collegando un resistore da ${U(p.R, 'Ω')} segna ${N(p.V)} V. Quanto vale la resistenza interna?`,
    asks: (p, r) => [h.qI(I_, r.I), h.qR(r_, r.r)],
    hint: () => 'A vuoto il voltmetro legge proprio la f.e.m. Con il carico trova prima la corrente.',
    steps: (p, r) => step(`A vuoto ${I_} = 0 → ${V_} = ${E_} = ${U(p.E, 'V')}`, 'Senza corrente non c\'è caduta sulla resistenza interna.') +
      step(`${I_} = ${frac(V_, R_)} = ${frac(N(p.V), N(p.R))} = ${res(U(r.I, 'A'))}`) +
      step(`${r_} = ${frac(E_ + ' − ' + V_, I_)} = ${frac(N(p.E) + ' − ' + N(p.V), N(r.I, 4))} = ${res(U(r.r, 'Ω'))}`, 'Problema rovesciato: dalle due letture ricavi una grandezza che non puoi misurare direttamente. Una batteria scarica ha una r più grande.'),
  });
  g2.push({
    id: 'gen-cc', title: 'Il cortocircuito', level: 2,
    gen: () => ({ E: pick([1.5, 9, 12, 12]), r: pick([0.01, 0.02, 0.05, 0.3, 1]) }),
    solve: (p) => ({ Icc: p.E / p.r, Pr: (p.E * p.E) / p.r }),
    text: (p) => `I morsetti di una batteria con ${E_} = ${U(p.E, 'V')} e ${r_} = ${U(p.r, 'Ω')} vengono uniti per sbaglio con una chiave inglese. Che corrente circola? Che potenza si dissipa dentro la batteria?`,
    asks: (p, r) => [h.qI('<var>I</var><sub>cc</sub>', r.Icc), { label: '<var>P</var>', unit: 'W', value: r.Pr }],
    steps: (p, r) => step(`${R_} = 0 → <var>I</var><sub>cc</sub> = ${frac(E_, r_)} = ${res(U(r.Icc, 'A'))}`, 'L\'unica resistenza nell\'anello è quella interna.') +
      step(`<var>P</var> = ${r_} · <var>I</var><sub>cc</sub>² = ${res(U(r.Pr, 'W'))}`, 'Tutta la potenza diventa calore dentro la batteria: può scaldarsi, gonfiarsi, prendere fuoco. Per questo si usano fusibili e protezioni.'),
  });
  g2.push({
    id: 'gen-eta', title: 'Potenze e rendimento del generatore', level: 2,
    gen: () => ({ E: pick([12, 24, 48]), r: pick([0.5, 1, 2]), R: pick([2, 4, 6, 10, 20]) }),
    solve: (p) => BS.realGen(p.E, p.r, p.R),
    text: (p) => `Generatore con ${E_} = ${U(p.E, 'V')}, ${r_} = ${U(p.r, 'Ω')}, carico ${R_} = ${U(p.R, 'Ω')}. Quanta potenza arriva al carico? Quanta ne produce il generatore? Qual è il rendimento?`,
    asks: (p, r) => [{ label: '<var>P</var><sub>u</sub>', unit: 'W', value: r.Pu }, { label: '<var>P</var><sub>g</sub>', unit: 'W', value: r.Pg }, { label: 'η', unit: '%', value: r.eta * 100 }],
    steps: (p, r) => step(`${I_} = ${frac(N(p.E), N(p.R) + ' + ' + N(p.r))} = ${U(r.I, 'A')}; ${V_} = ${U(r.V, 'V')}`) +
      step(`<var>P</var><sub>u</sub> = ${V_} · ${I_} = ${res(U(r.Pu, 'W'))}; <var>P</var><sub>g</sub> = ${E_} · ${I_} = ${res(U(r.Pg, 'W'))}`, `La differenza, ${U(r.Pr, 'W')}, scalda il generatore (${r_} · ${I_}²).`) +
      step(`η = ${frac('<var>P</var><sub>u</sub>', '<var>P</var><sub>g</sub>')} = ${frac(V_, E_)} = ${res(N(r.eta * 100, 3) + ' %')}`, p.R === p.r ? 'Con R = r il carico riceve la massima potenza possibile, ma il rendimento è solo il 50 %.' : 'Più il carico è grande rispetto a r, più il rendimento si avvicina al 100 %.'),
  });
  g2.push({
    id: 'gen-mc', title: 'Concetti su tensione e f.e.m.', level: 1,
    ...mc([
      ['La forza elettromotrice di un generatore si misura…', ['con il voltmetro a circuito aperto', 'con l\'amperometro in cortocircuito', 'in newton', 'solo con il carico collegato'], 'A vuoto non c\'è caduta interna: V = E.'],
      ['Collegando un carico sempre più piccolo, la tensione ai morsetti di un generatore reale…', ['diminuisce', 'aumenta', 'resta uguale', 'diventa negativa'], 'Più corrente vuol dire più caduta su r: V = E − r I.'],
      ['Un generatore ideale…', ['ha resistenza interna nulla e tensione costante', 'non ha f.e.m.', 'ha resistenza interna infinita', 'dà corrente costante a qualsiasi tensione'], 'Nella realtà r è piccola ma c\'è sempre.'],
      ['Il voltmetro si collega…', ['in parallelo ai due punti di cui vuoi la tensione', 'in serie al carico', 'al posto del generatore', 'solo a circuito aperto'], 'La tensione è una differenza tra due punti.'],
      ['1 volt è…', ['1 joule per coulomb', '1 coulomb al secondo', '1 watt per secondo', '1 ohm per ampere al quadrato'], 'La tensione è energia per unità di carica.'],
    ]),
  });

  function widgetGen(host) {
    const c = K.widgetCard('Il generatore reale', 'Una pila ha una resistenza interna: più corrente eroga, più cala la tensione ai morsetti');
    let open = false;
    const sch = el('div', 'ex-fig');
    const fig = el('div');
    const out = el('div', 'forms');
    const sw = el('label', 'switch');
    sw.innerHTML = '<input type="checkbox"><span class="track"></span><span>Apri l\'interruttore</span>';
    let last;
    const draw = (v) => {
      last = v;
      const g0 = BS.realGen(v.E, v.r, open ? Infinity : v.R);
      sch.innerHTML = S.realGen({ E: v.E, r: v.r, R: v.R }, { open, A: App.si(g0.I, 'A', 3), V: App.si(g0.V, 'V', 3) }).svg;
      const Icc = v.E / v.r;
      const ch = K.chart({ W: 460, H: 230, xmax: nice4(Icc), ymax: nice4(v.E * 1.1), xu: 'A', yu: 'V', xlabel: 'I', ylabel: 'V' });
      let s = ch.s + `<line class="gen" x1="${ch.X(0)}" y1="${ch.Y(v.E)}" x2="${ch.X(Icc)}" y2="${ch.Y(0)}"/>`;
      const Il = Math.min(nice4(Icc), nice4(v.E * 1.1) / v.R);
      if (!open) s += `<line class="p2" x1="${ch.X(0)}" y1="${ch.Y(0)}" x2="${ch.X(Il)}" y2="${ch.Y(v.R * Il)}"/>`;
      s += `<circle class="op" cx="${ch.X(g0.I)}" cy="${ch.Y(g0.V)}" r="6"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 460 230" role="img" style="width:100%;height:auto;max-width:460px"><title>Caratteristica del generatore e retta del carico</title>${s}</svg>`;
      out.innerHTML = open
        ? `<div class="form-row"><span class="label">A vuoto</span><div class="f">${I_} = 0 → ${V_} = ${E_} = ${res(U(v.E, 'V'))}</div><span class="meta">Il voltmetro legge proprio la forza elettromotrice.</span></div>`
        : `<div class="form-row"><span class="label">Corrente</span><div class="f">${I_} = ${frac(E_, R_ + ' + ' + r_)} = ${res(App.si(g0.I, 'A', 3))}</div></div>
           <div class="form-row"><span class="label">Morsetti</span><div class="f">${V_} = ${E_} − ${r_}${I_} = ${res(App.si(g0.V, 'V', 3))}</div><span class="meta">Persi dentro il generatore: ${App.si(g0.Vr, 'V', 3)}. Rendimento ${N(g0.eta * 100, 3)} %. In blu la caratteristica del generatore, in arancio quella del carico: il punto di lavoro è dove si incontrano.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'E', label: 'F.e.m. <var>E</var> (V)', min: 1, max: 24, step: 0.5, value: 12 },
      { id: 'r', label: 'Resistenza interna <var>r</var> (Ω)', min: 0.05, max: 5, log: true, value: 1 },
      { id: 'R', label: 'Carico <var>R</var> (Ω)', min: 0.1, max: 1000, log: true, value: 10 },
    ], draw);
    sw.querySelector('input').addEventListener('change', (e) => { open = e.target.checked; draw(last); });
    c.append(sw, sch, fig, out);
    host.appendChild(c);
    draw(sl.values);
    linkCard(host, 'Nel laboratorio trovi anche il cortocircuito e le missioni.');
  }

  lessons.push({
    id: 'generatore', num: 2, short: 'Generatore', title: 'Tensione, f.e.m. e generatore reale',
    intro: 'Il generatore spinge le cariche lungo il circuito a spese di un\'altra energia. La forza elettromotrice è il lavoro che fa per ogni coulomb; ai morsetti però arriva un po\' meno, perché una parte si perde nella resistenza interna.',
    goals: ['Tensione = lavoro per unità di carica', 'F.e.m. e misura a vuoto', 'V = E − r I', 'Cortocircuito e rendimento'],
    widgets: [widgetGen],
    example: g2[0], exampleTitle: 'Esempio: un generatore sotto carico',
    families: g2,
    theory: `
      <article class="note"><h4>Tensione</h4>
        <div class="eq"><span>${V_}<sub>AB</sub> = ${frac('<var>L</var>', '<var>Q</var>')}</span><span class="u">volt [V] = J/C</span></div>
        <p>Si misura con il voltmetro in parallelo tra i due punti.</p></article>
      <article class="note"><h4>Generatore reale</h4>
        <div class="eq"><span>${V_} = ${E_} − ${r_} · ${I_}</span><span>${I_} = ${frac(E_, R_ + ' + ' + r_)}</span></div>
        <p>A vuoto (${I_} = 0) ${V_} = ${E_}. In cortocircuito (${R_} = 0) ${I_}<sub>cc</sub> = ${E_}/${r_} e ${V_} = 0.</p></article>
      <article class="note"><h4>Potenze</h4>
        <p>Prodotta: ${E_}${I_}. Persa dentro: ${r_}${I_}². Al carico: ${V_}${I_}. Rendimento η = ${V_}/${E_}. Il carico riceve il massimo con ${R_} = ${r_} (rendimento 50 %).</p></article>`,
  });

  // =====================================================================
  // 3 — Legge di Ohm e caratteristica
  // =====================================================================
  const o3 = [];
  const tableH = (pts, unitI = 'mA') => `<div class="table-wrap"><table class="tt"><thead><tr><th>${V_} (V)</th>${pts.map((x) => `<td>${N(x[0])}</td>`).join('')}</tr><tr><th>${I_} (${unitI})</th>${pts.map((x) => `<td>${N(unitI === 'mA' ? x[1] * 1000 : x[1], 4)}</td>`).join('')}</tr></thead></table></div>`;
  o3.push({
    id: 'ohm-R', title: 'Dalla tabella alla resistenza', level: 1,
    defaults: { R: 220, vs: [1, 2, 4, 6, 8] },
    gen: () => ({ R: pick([47, 100, 150, 220, 330, 470, 1000]), vs: pick([[1, 2, 4, 6, 8], [2, 4, 6, 8, 10], [0.5, 1, 1.5, 2, 3], [3, 6, 9, 12]]) }),
    solve: (p) => ({ pts: p.vs.map((v) => [v, v / p.R]) }),
    text: (p, r) => `In laboratorio misuri tensione e corrente su un resistore:${tableH(r.pts)}Quanto vale la sua resistenza?`,
    asks: (p) => [h.qR(R_, p.R)],
    steps: (p, r) => step(`${R_} = ${frac(V_, I_)} = ${frac(N(r.pts[0][0]) + ' V', U(r.pts[0][1], 'A'))} = ${res(U(p.R, 'Ω'))}`, 'Qualsiasi colonna dà lo stesso risultato: tensione e corrente sono direttamente proporzionali. Il grafico I–V è una retta che passa per l\'origine.'),
  });
  o3.push({
    id: 'ohm-pred', title: 'Prevedi la corrente', level: 1,
    gen: () => ({ V1: pick([2, 3, 5, 6, 9]), I1: pick([0.01, 0.02, 0.05, 0.1, 0.25]), V2: pick([1, 4, 10, 12, 15, 18]) }),
    solve: (p) => ({ R: p.V1 / p.I1, I2: (p.I1 * p.V2) / p.V1 }),
    text: (p) => `Un resistore con ${U(p.V1, 'V')} ai capi assorbe ${U(p.I1, 'A')}. Quanta corrente assorbe con ${U(p.V2, 'V')}? (a temperatura costante)`,
    asks: (p, r) => [h.qI(I_ + '<sub>2</sub>', r.I2)],
    steps: (p, r) => step(`${R_} = ${frac(N(p.V1), N(p.I1))} = ${U(r.R, 'Ω')}`) + step(`${I_}<sub>2</sub> = ${frac(N(p.V2), N(r.R, 4))} = ${res(U(r.I2, 'A'))}`, `Oppure con la proporzione: la tensione è cambiata di un fattore ${N(p.V2 / p.V1, 3)}, la corrente cambia dello stesso fattore.`),
  });
  const COMPS = {
    res: { name: 'resistore da 220 Ω', I: (v) => v / 220, vmax: 12 },
    lamp: { name: 'lampadina a filamento 12 V – 5 W', I: (v) => (v <= 0 ? 0 : (5 / 12) * Math.pow(v / 12, 0.55)), vmax: 12 },
    led: { name: 'LED rosso', I: (v) => Math.min(0.06, 2.35e-18 * Math.expm1(v / 0.0518)), vmax: 2.1 },
  };
  o3.push({
    id: 'ohm-check', title: 'È ohmico?', level: 2,
    gen: () => ({ k: pick(['res', 'lamp', 'led']), sc: pick([0.6, 0.8, 1]) }),
    solve: (p) => {
      const C = COMPS[p.k];
      const vs = p.k === 'led' ? [1.6, 1.75, 1.85, 1.95] : [0.25, 0.5, 0.75, 1].map((f) => Number((C.vmax * f * p.sc).toFixed(2)));
      const pts = vs.map((v) => [v, Number(C.I(v).toPrecision(3))]);
      const Rs = pts.map((x) => x[0] / x[1]);
      return { pts, Rs, ohmic: p.k === 'res' };
    },
    text: (p, r) => `Misure su un componente misterioso:${tableH(r.pts)}Il componente segue la legge di Ohm (resistenza costante)?`,
    asks: (p, r) => [h.choice('Risposta', ['sì, R è costante', 'no, R cambia con la tensione'], r.ohmic ? 0 : 1)],
    hint: () => 'Calcola V / I per ogni colonna.',
    steps: (p, r) => step(`<var>V</var>/<var>I</var>: ${r.Rs.map((x) => App.si(x, 'Ω', 3)).join('; ')}`) +
      step(res(r.ohmic ? 'Ohmico: il rapporto è sempre lo stesso.' : 'Non ohmico: il rapporto cambia.'), p.k === 'lamp' ? 'È una lampadina a filamento: scaldandosi la sua resistenza aumenta, quindi la corrente cresce meno della tensione.' : p.k === 'led' ? 'È un diodo LED: sotto una certa tensione quasi non conduce, poi la corrente sale moltissimo. La resistenza crolla.' : 'È un resistore: la caratteristica è una retta.'),
  });
  o3.push({
    id: 'ohm-lamp', title: 'Lampadina a caldo e a freddo', level: 3,
    gen: () => ({ Vn: pick([6, 12, 24, 230]), Pn: pick([3, 5, 10, 21, 60]), k: pick([8, 10, 12]) }),
    solve: (p) => { const In = p.Pn / p.Vn; const Rh = p.Vn / In; const Rc = Number((Rh / p.k).toPrecision(2)); return { In, Rh, Rc, ratio: Rh / Rc }; },
    text: (p, r) => `Una lampadina da ${p.Vn} V – ${p.Pn} W, misurata a freddo con l'ohmmetro, ha ${U(r.Rc, 'Ω')}. Quanto vale la sua resistenza accesa (alla tensione nominale)? Quante volte più grande di quella a freddo?`,
    asks: (p, r) => [h.qR(R_ + '<sub>caldo</sub>', r.Rh), { label: 'Rapporto', unit: '', value: r.ratio }],
    steps: (p, r) => step(`${I_} = ${frac('<var>P</var>', V_)} = ${frac(p.Pn, p.Vn)} = ${U(r.In, 'A')}`) + step(`${R_}<sub>caldo</sub> = ${frac(V_, I_)} = ${res(U(r.Rh, 'Ω'))}`) +
      step(`${frac(N(r.Rh, 4), N(r.Rc))} = ${res(N(r.ratio, 3))}`, 'Il filamento di tungsteno arriva a circa 2500 °C e la sua resistività cresce di molto. All\'accensione, a freddo, la lampadina assorbe un picco di corrente: per questo si bruciano quasi sempre quando le accendi.'),
  });
  o3.push({
    id: 'ohm-mc', title: 'Concetti sulla legge di Ohm', level: 1,
    ...mc([
      ['La legge di Ohm dice che, in un resistore a temperatura costante…', ['la corrente è direttamente proporzionale alla tensione', 'la corrente è inversamente proporzionale alla tensione', 'la tensione non dipende dalla corrente', 'la resistenza cresce con la tensione'], 'V = R I, con R costante: il grafico è una retta per l\'origine.'],
      ['Se raddoppi la resistenza a tensione costante, la corrente…', ['si dimezza', 'raddoppia', 'resta uguale', 'diventa quattro volte'], 'I = V / R: proporzionalità inversa.'],
      ['1 ohm è la resistenza in cui…', ['1 V fa passare 1 A', '1 A dissipa 1 W per secondo', '1 C passa in 1 s', 'il filo è lungo 1 m'], 'Ω = V/A.'],
      ['Nella caratteristica I–V di un resistore, una retta più ripida vuol dire…', ['resistenza più piccola', 'resistenza più grande', 'tensione più alta', 'più potenza a parità di corrente'], 'Più ripida: più corrente per la stessa tensione.'],
      ['Quale di questi non è un componente ohmico?', ['il diodo LED', 'un resistore a strato metallico', 'un filo di costantana', 'un resistore di precisione'], 'Il LED ha una caratteristica fortemente non lineare.'],
    ]),
  });

  function widgetOhm(host) {
    const c = K.widgetCard('Misure in laboratorio', 'Scegli il componente, regola la tensione e annota le misure: la caratteristica è una retta?');
    let k = 'res';
    let pts = [];
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-k="res">Resistore</button><button type="button" data-k="lamp">Lampadina</button><button type="button" data-k="led">LED</button>';
    const fig = el('div');
    const tbl = el('div', 'table-wrap');
    const out = el('div', 'forms');
    const btns = el('div', 'row');
    btns.innerHTML = '<button type="button" class="btn small">Annota la misura</button><button type="button" class="btn ghost small">Cancella le misure</button>';
    const [bAdd, bClr] = btns.children;
    let vNow = 0;
    const draw = () => {
      const C = COMPS[k];
      const V = Math.min(vNow, C.vmax);
      const I = C.I(V);
      const imax = K.niceMax(C.I(C.vmax) * 1.05);
      const ch = K.chart({ W: 420, H: 230, xmax: C.vmax, ymax: imax, xu: 'V', yu: 'A', xlabel: 'V', ylabel: 'I' });
      let d = '';
      for (let i = 0; i <= 120; i++) { const v = (C.vmax * i) / 120; d += (i ? 'L' : 'M') + ch.X(v).toFixed(1) + ' ' + ch.Y(Math.min(imax, C.I(v))).toFixed(1); }
      let s = ch.s + `<path class="gen" d="${d}" stroke-dasharray="4 4" opacity="0.45"/>`;
      pts.forEach((x) => { s += `<circle class="pt" cx="${ch.X(x[0])}" cy="${ch.Y(x[1])}" r="5"/>`; });
      s += `<circle class="op" cx="${ch.X(V)}" cy="${ch.Y(I)}" r="6"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 420 230" role="img" style="width:100%;height:auto"><title>Caratteristica corrente–tensione: ${C.name}</title>${s}</svg>`;
      tbl.innerHTML = pts.length ? `<table class="tt"><thead><tr><th>${V_}</th><th>${I_}</th><th>${V_}/${I_}</th></tr></thead><tbody>${pts.map((x) => `<tr><td>${App.si(x[0], 'V', 3)}</td><td>${App.si(x[1], 'A', 3)}</td><td>${x[1] > 1e-7 ? App.si(x[0] / x[1], 'Ω', 3) : '—'}</td></tr>`).join('')}</tbody></table>` : '<p class="hint">Annota almeno tre misure a tensioni diverse e confronta l\'ultima colonna.</p>';
      out.innerHTML = `<div class="form-row"><span class="label">Adesso</span><div class="f">${V_} = ${App.si(V, 'V', 3)}, ${I_} = ${App.si(I, 'A', 3)}${I > 1e-7 ? `, ${V_}/${I_} = ${res(App.si(V / I, 'Ω', 3))}` : ''}</div><span class="meta">${k === 'res' ? 'Il rapporto non cambia: il resistore è ohmico.' : k === 'lamp' ? 'Il filamento si scalda e il rapporto cresce con la tensione.' : 'Sotto 1,6 V circa il LED quasi non conduce; poi la corrente esplode. Attenzione: senza un resistore in serie si brucia.'}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    };
    const sl = K.sliders(c, [{ id: 'V', label: 'Tensione applicata (% del massimo)', min: 0, max: 100, step: 1, value: 50, sig: 3 }], (v) => { vNow = (v.V / 100) * COMPS[k].vmax; draw(); });
    vNow = 0.5 * COMPS[k].vmax;
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; k = b.dataset.k; pts = []; vNow = (sl.values.V / 100) * COMPS[k].vmax; draw(); });
    bAdd.addEventListener('click', () => { const C = COMPS[k]; const V = Math.min(vNow, C.vmax); pts.push([V, C.I(V)]); if (pts.length > 8) pts.shift(); draw(); });
    bClr.addEventListener('click', () => { pts = []; draw(); });
    c.querySelector('.card-head').after(seg);
    const grid = el('div', 'q-two');
    grid.append(fig, tbl);
    c.append(btns, grid, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'ohm', num: 3, short: 'Legge di Ohm', title: 'La legge di Ohm e la caratteristica I–V',
    intro: 'Misura tensione e corrente su un resistore e mettile in un grafico: viene una retta. La pendenza dipende dalla resistenza. Non tutti i componenti però si comportano così.',
    goals: ['V = R · I', 'Caratteristica corrente–tensione', 'Componenti ohmici e non ohmici', 'Resistenza a caldo e a freddo'],
    widgets: [widgetOhm],
    example: o3[0], exampleTitle: 'Esempio: una tabella di misure',
    families: o3,
    theory: `
      <article class="note"><h4>Prima legge di Ohm</h4>
        <div class="eq"><span>${V_} = ${R_} · ${I_}</span><span>${I_} = ${frac(V_, R_)}</span><span>${R_} = ${frac(V_, I_)}</span></div>
        <p>1 Ω è la resistenza in cui 1 V fa passare 1 A. Multipli: kΩ, MΩ. L'inverso è la conduttanza <var>G</var> = 1/${R_}, in siemens.</p></article>
      <article class="note"><h4>Componenti ohmici e no</h4>
        <p>Resistori e fili a temperatura costante sono ohmici: la caratteristica è una retta. Lampadine a filamento, diodi, LED, termistori no: il rapporto ${V_}/${I_} cambia con il punto di lavoro.</p></article>
      <article class="note"><h4>Più avanti</h4><p>In 3ª la legge di Ohm diventa lo strumento per risolvere reti intere: serie, parallelo, partitori, Kirchhoff.</p></article>`,
  });

  // =====================================================================
  // 4 — Potenza ed effetto Joule
  // =====================================================================
  const j4 = [];
  const RATINGS = [0.25, 0.5, 1, 2, 5];
  const wName = (w) => ({ 0.25: '¼ W', 0.5: '½ W', 1: '1 W', 2: '2 W', 5: '5 W' }[w]);
  j4.push({
    id: 'jou-P', title: 'Quanta potenza?', level: 1,
    defaults: { mode: 'VR', V: 12, R: 100 },
    gen: () => pick([
      () => ({ mode: 'VR', V: pick([5, 9, 12, 24]), R: pick([10, 47, 100, 220, 470]) }),
      () => ({ mode: 'RI', R: pick([2, 10, 22, 50, 100]), I: pick([0.05, 0.1, 0.2, 0.5, 1, 2]) }),
      () => ({ mode: 'VI', V: pick([3.3, 5, 12, 230]), I: pick([0.02, 0.1, 0.5, 2, 4]) }),
    ])(),
    solve: (p) => (p.mode === 'VR' ? { P: (p.V * p.V) / p.R } : p.mode === 'RI' ? { P: p.R * p.I * p.I } : { P: p.V * p.I }),
    text: (p) => (p.mode === 'VR' ? `Un resistore da ${U(p.R, 'Ω')} ha ai capi ${U(p.V, 'V')}. Che potenza dissipa?` : p.mode === 'RI' ? `In un resistore da ${U(p.R, 'Ω')} scorrono ${U(p.I, 'A')}. Che potenza dissipa?` : `Un apparecchio alimentato a ${U(p.V, 'V')} assorbe ${U(p.I, 'A')}. Che potenza assorbe?`),
    asks: (p, r) => [h.qP('<var>P</var>', r.P)],
    steps: (p, r) => step(p.mode === 'VR' ? `<var>P</var> = ${frac(V_ + '²', R_)} = ${frac(N(p.V) + '²', N(p.R))} = ${res(U(r.P, 'W'))}` : p.mode === 'RI' ? `<var>P</var> = ${R_} · ${I_}² = ${N(p.R)} · ${N(p.I)}² = ${res(U(r.P, 'W'))}` : `<var>P</var> = ${V_} · ${I_} = ${N(p.V)} · ${N(p.I)} = ${res(U(r.P, 'W'))}`, 'Scegli la forma che usa i dati che hai: P = V·I = R·I² = V²/R sono la stessa formula, con la legge di Ohm dentro.'),
  });
  j4.push({
    id: 'jou-max', title: 'Fin dove posso arrivare?', level: 2,
    gen: () => ({ R: pick([10, 47, 100, 220, 1000, 4700]), W: pick([0.25, 0.5, 1]) }),
    solve: (p) => ({ Vm: BS.maxVoltage(p.R, p.W), Im: BS.maxCurrent(p.R, p.W) }),
    text: (p) => `Un resistore da ${U(p.R, 'Ω')} è da ${wName(p.W)}. Qual è la tensione massima che puoi applicargli? E la corrente massima?`,
    asks: (p, r) => [h.qV(V_ + '<sub>max</sub>', r.Vm), h.qI(I_ + '<sub>max</sub>', r.Im)],
    steps: (p, r) => step(`<var>P</var> = ${frac(V_ + '²', R_)} → ${V_}<sub>max</sub> = √(<var>P</var> · ${R_}) = √(${N(p.W)} · ${N(p.R)}) = ${res(U(r.Vm, 'V'))}`, 'Formula inversa con la radice.') +
      step(`${I_}<sub>max</sub> = √(<var>P</var>/${R_}) = ${res(U(r.Im, 'A'))}`, 'Oltre, il resistore si scalda troppo: cambia valore, annerisce, si brucia.'),
  });
  j4.push({
    id: 'jou-scelta', title: 'Scegli il resistore', level: 2,
    gen: () => ({ R: pick([10, 22, 47, 100, 220, 470]), V: pick([3, 5, 9, 12, 15, 24]) }),
    solve: (p) => { const Pw = (p.V * p.V) / p.R; const need = 2 * Pw; const w = RATINGS.find((x) => x >= need); return { Pw, need, w: w || null, opts: RATINGS.map(wName).concat(['nessuno: serve più di 5 W']) }; },
    text: (p) => `Devi mettere un resistore da ${U(p.R, 'Ω')} con ${U(p.V, 'V')} ai capi. Hai resistori da ¼, ½, 1, 2 e 5 W. Per sicurezza scegli quello che regge almeno il doppio della potenza dissipata. Quale prendi?`,
    asks: (p, r) => [{ label: '<var>P</var> dissipata', unit: 'W', value: r.Pw }, h.choice('Resistore', r.opts, r.w ? RATINGS.indexOf(r.w) : 5)],
    steps: (p, r) => step(`<var>P</var> = ${frac(N(p.V) + '²', N(p.R))} = ${U(r.Pw, 'W')} → con il margine serve ${U(r.need, 'W')}`) +
      step(res(r.w ? 'Il resistore da ' + wName(r.w) : 'Nessuno: serve un resistore di potenza più grande'), 'I resistori più potenti sono anche più grossi: devono smaltire il calore all\'aria.'),
  });
  j4.push({
    id: 'jou-acqua', title: 'Lo scaldabagno', level: 3,
    gen: () => ({ Pw: pick([1000, 1200, 1500, 2000]), lt: pick([10, 30, 50, 80]), dT: pick([20, 30, 40, 45]) }),
    solve: (p) => { const Q = 4186 * p.lt * p.dT; return { Q, t: Q / p.Pw, kwh: BS.toKWh(Q) }; },
    text: (p) => `Uno scaldabagno elettrico da ${U(p.Pw, 'W')} deve scaldare ${p.lt} litri d'acqua di ${p.dT} °C. Servono 4186 J per scaldare di 1 °C un litro d'acqua. Quanta energia serve? Quanto tempo ci mette, se tutto il calore va all'acqua?`,
    asks: (p, r) => [{ label: 'Energia', unit: 'kWh', value: r.kwh }, { label: '<var>t</var>', unit: 'h', value: r.t / 3600 }],
    steps: (p, r) => step(`<var>Q</var> = 4186 · ${p.lt} · ${p.dT} = ${U(r.Q, 'J')} = ${res(N(r.kwh, 4) + ' kWh')}`, 'Il resistore dello scaldabagno trasforma tutta l\'energia elettrica in calore: è l\'effetto Joule usato apposta.') +
      step(`<var>t</var> = ${frac('<var>Q</var>', '<var>P</var>')} = ${U(r.Q / p.Pw, 's')} = ${res(N(r.t / 3600, 3) + ' h')}`, 'In realtà un po\' di calore si disperde: il tempo è un po\' più lungo.'),
  });
  j4.push({
    id: 'jou-mc', title: 'Concetti sull\'effetto Joule', level: 1,
    ...mc([
      ['L\'effetto Joule è…', ['la trasformazione di energia elettrica in calore in un conduttore', 'la produzione di luce nei LED', 'la carica di un condensatore', 'l\'attrazione tra due fili'], 'Gli elettroni urtano il reticolo del conduttore e lo scaldano.'],
      ['Un fusibile protegge il circuito perché…', ['il suo filo fonde per effetto Joule quando la corrente è troppa', 'aumenta la tensione', 'accumula la carica in eccesso', 'cambia il verso della corrente'], 'Si sacrifica al posto dei fili e degli apparecchi.'],
      ['A parità di resistenza, se la corrente raddoppia la potenza dissipata…', ['diventa quattro volte', 'raddoppia', 'resta uguale', 'si dimezza'], 'P = R I²: dipende dal quadrato.'],
      ['Gli elettrodotti trasportano l\'energia ad alta tensione perché…', ['a parità di potenza la corrente è più bassa e si perde meno in calore', 'l\'alta tensione non disperde mai', 'i fili sono più corti', 'così la corrente è più alta'], 'P = V I: alzando V cala I, e le perdite R I² crollano.'],
      ['Un phon da 2000 W a 230 V assorbe circa…', ['8,7 A', '0,11 A', '460 A', '2000 A'], 'I = P / V.'],
    ]),
  });

  function widgetJoule(host) {
    const c = K.widgetCard('Il resistore si scalda', 'Ogni resistore regge una potenza massima: superata quella, si brucia');
    let W = 0.25;
    const seg = el('div', 'seg');
    seg.innerHTML = RATINGS.map((w) => `<button type="button" data-w="${w}">${wName(w)}</button>`).join('');
    const fig = el('div', 'ex-fig');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const Pw = (v.V * v.V) / v.R;
      const f = Pw / W;
      const heat = Math.min(1, f);
      const burnt = f > 1.6;
      const body = burnt ? '#2a2420' : `rgb(${Math.round(210 + 45 * heat)},${Math.round(190 - 150 * heat)},${Math.round(150 - 130 * heat)})`;
      const len = 60 + Math.log2(W / 0.25 + 1) * 40;
      const glow = heat > 0.6 && !burnt ? `<ellipse cx="250" cy="50" rx="${len / 2 + 22}" ry="32" fill="var(--bad)" opacity="${((heat - 0.6) * 0.5).toFixed(2)}"/>` : '';
      const smoke = burnt ? '<path class="smoke" d="M235 22 C225 7 245 2 235 -13 M262 22 C252 4 272 0 262 -16"/>' : '';
      const barCol = f > 1 ? 'var(--bad)' : f > 0.5 ? 'var(--warn)' : 'var(--ok)';
      fig.innerHTML = `<svg class="phy" viewBox="0 -20 500 150" role="img" style="max-width:500px"><title>Resistore da ${wName(W)} che dissipa ${App.si(Pw, 'W', 3)}</title>${glow}${smoke}
        <line class="ground" x1="40" y1="50" x2="${250 - len / 2}" y2="50"/><line class="ground" x1="${250 + len / 2}" y1="50" x2="460" y2="50"/>
        <rect x="${250 - len / 2}" y="${50 - 8 - len / 14}" width="${len}" height="${16 + len / 7}" rx="${8 + len / 28}" fill="${body}" stroke="var(--ink-2)" stroke-width="1.5"/>
        <text class="note" x="0" y="104">0</text><text class="note" x="250" y="104" text-anchor="middle">potenza massima (${wName(W)})</text><text class="note" x="500" y="104" text-anchor="end">doppio</text>
        <rect x="0" y="110" width="${(App.clamp(f, 0, 2) * 250).toFixed(1)}" height="12" fill="${barCol}"/><rect x="0" y="110" width="500" height="12" fill="none" stroke="var(--line-strong)"/><line x1="250" y1="107" x2="250" y2="125" stroke="var(--ink)" stroke-width="2"/></svg>`;
      out.innerHTML = `<div class="form-row"><span class="label">Potenza</span><div class="f"><var>P</var> = ${frac(V_ + '²', R_)} = ${res(App.si(Pw, 'W', 3))} (${N(f * 100, 3)} % di ${wName(W)})</div><span class="meta" style="color:var(--${f > 1 ? 'bad' : f > 0.5 ? 'warn' : 'ok'})">${burnt ? 'Bruciato: il corpo si annerisce e il valore non è più quello scritto.' : f > 1.001 ? 'Oltre la potenza nominale: scotta e si sta rovinando.' : f > 0.95 ? 'Al limite della sua potenza: scotta. Meglio un resistore più grande.' : f > 0.5 ? 'Va bene, ma è oltre metà della sua potenza: si scalda parecchio.' : 'Lavora tranquillo.'}</span></div>
        <div class="form-row"><span class="label">Corrente</span><div class="f">${I_} = ${App.si(v.V / v.R, 'A', 3)}</div></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.w) === W)));
    };
    const sl = K.sliders(c, [
      { id: 'V', label: 'Tensione <var>V</var> (V)', min: 0, max: 30, step: 0.5, value: 5 },
      { id: 'R', label: 'Resistenza <var>R</var> (Ω)', min: 10, max: 10000, log: true, value: 100 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { W = Number(b.dataset.w); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'joule', num: 4, short: 'Potenza', title: 'Potenza elettrica ed effetto Joule',
    intro: 'La potenza elettrica è tensione per corrente. In un resistore tutta diventa calore: è l\'effetto Joule, utile in una stufa, pericoloso in un filo troppo sottile.',
    goals: ['P = V I = R I² = V²/R', 'Potenza nominale dei resistori', 'Fusibili', 'Calore ed energia'],
    widgets: [widgetJoule],
    example: j4[0], exampleTitle: 'Esempio: la potenza di un resistore',
    families: j4,
    theory: `
      <article class="note"><h4>Potenza elettrica</h4>
        <div class="eq"><span><var>P</var> = ${V_} · ${I_} = ${R_} · ${I_}² = ${frac(V_ + '²', R_)}</span><span class="u">watt [W]</span></div>
        <p>Energia: <var>E</var> = <var>P</var> · <var>t</var> (J o kWh).</p></article>
      <article class="note"><h4>Effetto Joule</h4>
        <p>Nei conduttori l'energia elettrica diventa calore. Si sfrutta in stufe, ferri da stiro, scaldabagni, fusibili; si combatte nei fili e nei componenti, che hanno una potenza massima (resistori da ¼ W, ½ W, 1 W…).</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'cir', year: '2', yearLabel: '2ª', title: 'Il circuito elementare', route: 'cir-corrente', lessonWord: 'Lezione',
    desc: 'Corrente e verso, tensione e f.e.m., generatore reale, legge di Ohm e caratteristica I–V, potenza ed effetto Joule.',
    lessons,
  });
})();
