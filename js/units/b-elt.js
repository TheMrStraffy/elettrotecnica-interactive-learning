/* Biennio — Carica elettrica, legge di Coulomb, campo elettrico, potenziale */
(function () {
  'use strict';
  const App = window.App;
  const P = window.Phys;
  const L = App.Lessons;
  const { N, U, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const B = App.B;
  const ME = 9.109e-31; // massa dell'elettrone, kg
  const lessons = [];
  const qStr = (q, u = 'µC', f = 1e-6) => `${q < 0 ? '−' : '+'}${N(Math.abs(q) / f)} ${u}`;
  const mc = (bank) => ({
    gen: () => ({ k: rand(0, bank.length - 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const [q, opts, why] = bank[p.k]; return { q, opts: p.o.map((i) => opts[i]), ans: p.o.indexOf(0), why }; },
    text: (p, r) => r.q,
    asks: (p, r) => [h.choice('Risposta', r.opts, r.ans)],
    steps: (p, r) => step(res(r.opts[r.ans]), r.why),
  });

  // =====================================================================
  // 1 — La carica elettrica
  // =====================================================================
  const e1 = [];
  e1.push({
    id: 'car-q', title: 'Carica trasportata', level: 1,
    defaults: { I: 0.02, t: 60 },
    gen: () => ({ I: pick([0.001, 0.005, 0.01, 0.02, 0.1, 0.5, 2]), t: pick([1, 10, 30, 60, 120, 600, 3600]) }),
    solve: (p) => ({ Q: p.I * p.t }),
    text: (p) => `Una corrente di ${U(p.I, 'A')} scorre per ${p.t >= 60 ? N(p.t / 60) + ' minut' + (p.t === 60 ? 'o' : 'i') : p.t + ' s'}. Quanta carica attraversa una sezione del filo?`,
    asks: (p, r) => [{ label: '<var>Q</var>', unit: 'C', value: r.Q }],
    hint: () => 'Q = I · t, con I in ampere e t in secondi.',
    steps: (p, r) => step(`<var>t</var> = ${p.t} s; <var>I</var> = ${N(p.I)} A`, 'Converti in unità SI.') + step(`<var>Q</var> = <var>I</var> · <var>t</var> = ${N(p.I)} · ${p.t} = ${res(N(r.Q) + ' C')}`),
  });
  e1.push({
    id: 'car-n', title: 'Quanti elettroni?', level: 2,
    gen: () => ({ Q: pick([1, 0.5, 0.1, 0.02, 1e-3, 3.2e-6, 1.6e-12]) }),
    solve: (p) => ({ n: p.Q / P.QE }),
    text: (p) => `Quanti elettroni formano una carica di ${B.sciOf(p.Q)} C (in valore assoluto)? La carica elementare vale <var>e</var> = 1,602 · 10<sup>−19</sup> C.`,
    asks: (p, r) => B.qSci('<var>n</var>', r.n),
    hint: () => 'n = Q / e: dividi le mantisse e sottrai gli esponenti.',
    steps: (p, r) => step(`<var>n</var> = ${frac('<var>Q</var>', '<var>e</var>')} = ${frac(B.sciOf(p.Q), '1,602 · 10<sup>−19</sup>')} = ${res(B.sciOf(r.n))}`, 'La carica è quantizzata: è sempre un multiplo intero di e. Per 1 C servono circa 6,24 · 10¹⁸ elettroni.'),
  });
  e1.push({
    id: 'car-mc', title: 'Concetti sulla carica', level: 1,
    ...mc([
      ['Due corpi con carica dello stesso segno…', ['si respingono', 'si attraggono', 'non interagiscono', 'si scaricano subito'], 'Cariche dello stesso segno si respingono, di segno opposto si attraggono.'],
      ['Strofinando una bacchetta di plastica con un panno di lana, la bacchetta si carica negativamente. Che cosa è successo?', ['ha ricevuto elettroni dal panno', 'ha ricevuto protoni dal panno', 'ha perso elettroni', 'ha creato nuove cariche'], 'Con lo strofinio passano elettroni da un corpo all\'altro; i protoni restano nei nuclei. La carica non si crea: si sposta.'],
      ['In un filo di rame, che cosa si muove quando passa corrente?', ['gli elettroni liberi', 'i protoni', 'gli atomi di rame', 'gli ioni positivi'], 'Nei metalli gli elettroni più esterni sono liberi di muoversi nel reticolo: sono loro i portatori di carica.'],
      ['Un corpo elettricamente neutro…', ['ha tante cariche positive quante negative', 'non ha cariche', 'ha solo neutroni', 'ha solo elettroni'], 'Neutro non vuol dire senza cariche: le positive e le negative si compensano.'],
      ['In un sistema isolato la carica totale…', ['si conserva', 'aumenta con lo strofinio', 'diminuisce col tempo', 'dipende dalla temperatura'], 'Principio di conservazione della carica: le cariche si spostano ma la somma resta la stessa.'],
      ['Avvicini una bacchetta carica a una sfera metallica neutra, senza toccarla. Che cosa succede?', ['le cariche della sfera si separano e la sfera è attratta', 'la sfera resta neutra e ferma', 'la sfera si carica dello stesso segno e si allontana', 'la sfera perde tutti gli elettroni'], 'È l\'induzione elettrostatica: gli elettroni liberi della sfera si spostano, il lato vicino ha carica opposta a quella della bacchetta e l\'attrazione vince.'],
      ['Che cosa distingue un isolante da un conduttore?', ['negli isolanti gli elettroni sono legati agli atomi', 'gli isolanti non hanno elettroni', 'gli isolanti sono sempre carichi', 'i conduttori non hanno protoni'], 'Negli isolanti (plastica, vetro, aria secca) gli elettroni non possono muoversi liberamente.'],
      ['Quanto vale la carica di un elettrone?', ['−1,602 · 10⁻¹⁹ C', '+1,602 · 10⁻¹⁹ C', '−1 C', '−9,11 · 10⁻³¹ C'], '9,11 · 10⁻³¹ è la massa dell\'elettrone in kg, non la sua carica.'],
    ]),
  });

  function widgetElectrons(host) {
    const c = K.widgetCard('Quanti elettroni passano?', 'Scegli corrente e tempo');
    const out = document.createElement('div');
    out.className = 'forms';
    const draw = (vv) => {
      const Q = vv.I * vv.t;
      const n = Q / P.QE;
      out.innerHTML = `<div class="form-row"><span class="label">Carica</span><div class="f"><var>Q</var> = <var>I</var>·<var>t</var> = ${U(vv.I, 'A')} · ${U(vv.t, 's')} = ${res(U(Q, 'C'))}</div></div>
        <div class="form-row"><span class="label">Elettroni</span><div class="f big-sci"><var>n</var> = <var>Q</var>/<var>e</var> = ${res(B.sciOf(n))}</div><span class="meta">Ogni elettrone porta solo 1,602 · 10⁻¹⁹ C: anche una corrente piccolissima è un fiume di elettroni. Gli elettroni però avanzano lentamente, frazioni di millimetro al secondo: a viaggiare veloce è il segnale elettrico.</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'I', label: 'Corrente <var>I</var> (A)', min: 1e-6, max: 10, log: true, value: 0.02 },
      { id: 't', label: 'Tempo <var>t</var> (s)', min: 0.001, max: 3600, log: true, value: 1 },
    ], draw);
    c.append(out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'carica', num: 1, short: 'Carica', title: 'La carica elettrica',
    intro: 'Tutta l\'elettricità nasce dalle cariche: elettroni negativi e protoni positivi. La corrente è carica in movimento, e la carica si misura in coulomb.',
    goals: ['Carica elementare', 'Conduttori e isolanti', 'Elettrizzazione', 'Q = I·t'],
    widgets: [widgetElectrons],
    example: e1[0], exampleTitle: 'Esempio: carica trasportata',
    families: e1,
    theory: `
      <article class="note"><h4>Cariche positive e negative</h4>
        <p>La materia è fatta di atomi: un nucleo con protoni (carica +) e neutroni, e attorno gli elettroni (carica −). Cariche dello stesso segno si respingono, di segno opposto si attraggono.</p>
        <div class="eq"><span><var>e</var> = 1,602 · 10<sup>−19</sup> C</span><span class="u">carica elementare</span></div>
        <p>Ogni carica è un multiplo intero di <var>e</var>: <span class="f"><var>Q</var> = <var>n</var>·<var>e</var></span>. Un coulomb è tantissimo: 6,24 · 10¹⁸ elettroni.</p></article>
      <article class="note"><h4>Conduttori e isolanti</h4>
        <p>Nei <strong>conduttori</strong> (metalli) alcuni elettroni sono liberi di muoversi; negli <strong>isolanti</strong> (plastica, vetro, ceramica, aria secca) sono legati agli atomi. I semiconduttori, come il silicio, stanno in mezzo: sono la base dell'elettronica.</p></article>
      <article class="note"><h4>Come si elettrizza un corpo</h4>
        <ul><li><strong>Strofinio</strong>: elettroni passano da un corpo all'altro.</li>
          <li><strong>Contatto</strong>: un corpo carico ne tocca uno neutro e gli cede parte della carica.</li>
          <li><strong>Induzione</strong>: un corpo carico avvicinato a un conduttore separa le sue cariche senza toccarlo.</li></ul>
        <p>In ogni caso la carica totale si <strong>conserva</strong>.</p></article>
      <article class="note"><h4>Carica e corrente</h4>
        <div class="eq"><span><var>I</var> = ${frac('<var>Q</var>', '<var>t</var>')}</span><span><var>Q</var> = <var>I</var> · <var>t</var></span><span class="u">1 C = 1 A · 1 s</span></div>
        <p>Le batterie si misurano spesso in mAh: 2000 mAh = 2 A · 3600 s = 7200 C.</p></article>`,
  });

  // =====================================================================
  // 2 — La legge di Coulomb
  // =====================================================================
  const e2 = [];
  const Q_UC = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
  e2.push({
    id: 'cou-f', title: 'Forza tra due cariche', level: 2,
    defaults: { q1: 2, q2: -3, r: 10 },
    gen: () => ({ q1: pick(Q_UC), q2: pick(Q_UC), r: pick([2, 3, 5, 10, 20, 30, 50]) }),
    solve: (p) => ({ F: P.coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100), att: p.q1 * p.q2 < 0 }),
    text: (p) => `Due cariche puntiformi, <var>Q</var><sub>1</sub> = ${qStr(p.q1 * 1e-6)} e <var>Q</var><sub>2</sub> = ${qStr(p.q2 * 1e-6)}, sono nel vuoto a <var>r</var> = ${p.r} cm. Trova l'intensità della forza. È attrattiva o repulsiva?`,
    asks: (p, r) => [{ label: '<var>F</var>', unit: 'N', value: r.F }, h.choice('La forza è', ['attrattiva', 'repulsiva'], r.att ? 0 : 1)],
    hint: () => 'F = k·|Q₁·Q₂|/r², con k = 8,99·10⁹ N·m²/C². Porta µC in C e cm in m.',
    steps: (p, r) => step(`<var>Q</var><sub>1</sub> = ${B.sciH(p.q1, -6)} C, <var>Q</var><sub>2</sub> = ${B.sciH(p.q2, -6)} C, <var>r</var> = ${N(p.r / 100)} m`, 'Unità SI.') +
      step(`<var>F</var> = <var>k</var>${frac('|<var>Q</var><sub>1</sub>·<var>Q</var><sub>2</sub>|', '<var>r</var>²')} = 8,99 · 10⁹ · ${frac(N(Math.abs(p.q1 * p.q2)) + ' · 10<sup>−12</sup>', N((p.r / 100) ** 2))} = ${res(N(r.F) + ' N')}`) +
      step(res(r.att ? 'Attrattiva' : 'Repulsiva'), r.att ? 'Cariche di segno opposto.' : 'Cariche dello stesso segno.'),
  });
  e2.push({
    id: 'cou-fatt', title: 'Di quanto cambia la forza?', level: 1,
    gen: () => ({ a: pick([1, 2, 3]), b: pick([1, 2, 4]), c: pick([2, 3, 0.5]) }),
    solve: (p) => ({ f: (p.a * p.b) / (p.c * p.c) }),
    text: (p) => `Due cariche si attraggono con forza <var>F</var>. Moltiplichi <var>Q</var><sub>1</sub> per ${p.a}, <var>Q</var><sub>2</sub> per ${p.b} e la distanza per ${N(p.c)}. Per quanto viene moltiplicata la forza?`,
    asks: (p, r) => [{ label: 'Fattore', unit: '×', value: r.f }],
    steps: (p, r) => step(`<var>F</var>′ = <var>F</var> · ${frac(p.a + ' · ' + p.b, N(p.c) + '²')} = ${res(N(r.f) + ' · F')}`, 'F è direttamente proporzionale a ciascuna carica e inversamente proporzionale al quadrato della distanza.'),
  });
  e2.push({
    id: 'cou-r', title: 'A che distanza?', level: 3,
    gen: () => L.nice(() => ({ q1: pick([1, 2, 3, 4, 5]), q2: pick([1, 2, 3, 4, 5]), r: pick([3, 5, 6, 10, 15, 20, 30]) }), () => true, { q1: 2, q2: 2, r: 10 }),
    solve: (p) => ({ F: P.coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100) }),
    text: (p, r) => `Due cariche da ${p.q1} µC e ${p.q2} µC si respingono con una forza di ${N(r.F)} N. A che distanza si trovano?`,
    asks: (p) => [{ label: '<var>r</var>', unit: 'cm', value: p.r }],
    hint: () => 'Formula inversa: r = √(k·Q₁·Q₂ / F).',
    steps: (p, r) => step(`<var>r</var> = √${frac('<var>k</var>·<var>Q</var><sub>1</sub>·<var>Q</var><sub>2</sub>', '<var>F</var>')} = √${frac('8,99·10⁹ · ' + p.q1 * p.q2 + '·10<sup>−12</sup>', N(r.F))}`, 'Moltiplica per r², dividi per F, poi radice quadrata.') + step(`<var>r</var> = ${N(p.r / 100)} m = ${res(p.r + ' cm')}`),
  });
  const MEDIA = [['acqua distillata', 80], ['vetro', 6], ['olio per trasformatori', 2.2], ['carta', 3.5]];
  e2.push({
    id: 'cou-mezzo', title: 'Coulomb in un isolante', level: 2,
    gen: () => ({ q1: pick([1, 2, 3, 5]), q2: pick([1, 2, 4]), r: pick([5, 10, 20]), m: rand(0, MEDIA.length - 1) }),
    solve: (p) => { const F0 = P.coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100); return { F0, F: F0 / MEDIA[p.m][1] }; },
    text: (p) => `Due cariche da ${p.q1} µC e ${p.q2} µC distano ${p.r} cm e sono immerse in ${MEDIA[p.m][0]} (costante dielettrica relativa ε<sub>r</sub> ≈ ${N(MEDIA[p.m][1])}). Quanto vale la forza?`,
    asks: (p, r) => [{ label: '<var>F</var>', unit: 'N', value: r.F }],
    steps: (p, r) => step(`Nel vuoto: <var>F</var><sub>0</sub> = ${N(r.F0)} N`) + step(`<var>F</var> = ${frac('<var>F</var><sub>0</sub>', 'ε<sub>r</sub>')} = ${frac(N(r.F0), N(MEDIA[p.m][1]))} = ${res(N(r.F) + ' N')}`, 'Un isolante "scherma" in parte le cariche: la forza diminuisce di ε_r volte. È quello che fanno i dielettrici nei condensatori.'),
  });

  function widgetCoulomb(host) {
    const c = K.widgetCard('Due cariche, due forze', 'Cambia cariche e distanza: le frecce sono le forze');
    const fig = document.createElement('div');
    const chart = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    const draw = (vv) => {
      const q1 = vv.q1, q2 = vv.q2, r = vv.r / 100;
      const F = q1 && q2 ? P.coulomb(q1 * 1e-6, q2 * 1e-6, r) : 0;
      const att = q1 * q2 < 0;
      const W = 540, cx = W / 2;
      const px = 60 + (vv.r / 50) * 180;
      const x1 = cx - px / 2, x2 = cx + px / 2;
      const len = F ? App.clamp(14 + 18 * Math.log10(F / 1e-3), 8, 90) : 0;
      const dir = att ? 1 : -1;
      const col = (q) => (q > 0 ? 'var(--bad)' : q < 0 ? 'var(--pen)' : 'var(--ink-3)');
      let s = `<line class="gridl" x1="20" y1="60" x2="${W - 20}" y2="60"/>`;
      if (F) {
        s += `<line class="farrow" x1="${x1}" y1="60" x2="${x1 + dir * len}" y2="60"/><polygon class="fhead" points="${x1 + dir * len},54 ${x1 + dir * (len + 9)},60 ${x1 + dir * len},66"/>`;
        s += `<line class="farrow" x1="${x2}" y1="60" x2="${x2 - dir * len}" y2="60"/><polygon class="fhead" points="${x2 - dir * len},54 ${x2 - dir * (len + 9)},60 ${x2 - dir * len},66"/>`;
      }
      [[x1, q1, 'Q₁'], [x2, q2, 'Q₂']].forEach(([x, q, n]) => {
        const rad = 10 + Math.sqrt(Math.abs(q)) * 4;
        s += `<circle cx="${x}" cy="60" r="${rad}" fill="${col(q)}" opacity=".85"/><text x="${x}" y="65" text-anchor="middle" class="barlbl">${q > 0 ? '+' : q < 0 ? '−' : '0'}</text><text x="${x}" y="${66 + rad + 14}" text-anchor="middle" class="small">${n} = ${N(q)} µC</text>`;
      });
      s += `<path class="guide" d="M${x1} 20 V30 H${x2} V20"/><text x="${cx}" y="16" text-anchor="middle" class="small">r = ${N(vv.r)} cm</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 120" role="img" style="width:100%;height:auto"><title>Due cariche e le forze di Coulomb</title>${s}</svg>`;
      const ch = K.chart({ W: 420, H: 180, xmax: 50, ymax: K.niceMax(F ? P.coulomb(q1 * 1e-6, q2 * 1e-6, 0.05) : 1), xu: '', yu: 'N', xlabel: 'r (cm)', ylabel: 'F' });
      let d = '';
      if (F) for (let k = 0; k <= 100; k++) { const rr = 5 + (45 * k) / 100; d += (k ? 'L' : 'M') + ch.X(rr).toFixed(1) + ' ' + ch.Y(P.coulomb(q1 * 1e-6, q2 * 1e-6, rr / 100)).toFixed(1); }
      chart.innerHTML = `<svg class="chart" viewBox="0 0 420 180" role="img" style="width:100%;height:auto"><title>Forza in funzione della distanza</title>${ch.s}${d ? `<path class="gen" d="${d}"/>` : ''}${F && vv.r >= 5 ? `<circle class="op" cx="${ch.X(vv.r)}" cy="${ch.Y(F)}" r="5"/>` : ''}</svg>`;
      out.innerHTML = F ? `<var>F</var> = ${res(U(F, 'N'))}, ${att ? 'attrattiva' : 'repulsiva'}. Le due forze sono uguali e opposte (azione e reazione). Raddoppiando la distanza la forza diventa un quarto.` : 'Con una carica nulla non c\'è forza.';
    };
    const sl = K.sliders(c, [
      { id: 'q1', label: '<var>Q</var><sub>1</sub> (µC)', min: -6, max: 6, step: 0.5, value: 2, sig: 2 },
      { id: 'q2', label: '<var>Q</var><sub>2</sub> (µC)', min: -6, max: 6, step: 0.5, value: -3, sig: 2 },
      { id: 'r', label: 'Distanza <var>r</var> (cm)', min: 1, max: 50, step: 0.5, value: 10, sig: 3 },
    ], draw);
    c.append(fig, out, chart);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'coulomb', num: 2, short: 'Coulomb', title: 'La legge di Coulomb',
    intro: 'Due cariche si attraggono o si respingono con una forza proporzionale al prodotto delle cariche e inversamente proporzionale al quadrato della distanza: è la legge di Coulomb.',
    goals: ['Forza tra due cariche', 'Attrazione e repulsione', 'Dipendenza da 1/r²', 'Costante dielettrica'],
    widgets: [widgetCoulomb],
    example: e2[0], exampleTitle: 'Esempio: forza tra due cariche',
    families: e2,
    theory: `
      <article class="note"><h4>La legge</h4>
        <div class="eq"><span><var>F</var> = <var>k</var> · ${frac('|<var>Q</var><sub>1</sub> · <var>Q</var><sub>2</sub>|', '<var>r</var>²')}</span><span><var>k</var> = 8,99 · 10⁹ N·m²/C²</span></div>
        <p>La forza agisce lungo la retta che unisce le cariche: attrattiva se hanno segno opposto, repulsiva se hanno lo stesso segno. Le forze sulle due cariche sono uguali e opposte.</p>
        <p>Si scrive anche <span class="f"><var>k</var> = 1/(4πε<sub>0</sub>)</span>, con ε<sub>0</sub> = 8,85 · 10⁻¹² F/m, la costante dielettrica del vuoto.</p></article>
      <article class="note"><h4>In un isolante</h4>
        <p>In un mezzo isolante la forza si riduce di ε<sub>r</sub> volte (costante dielettrica relativa): acqua distillata circa 80, vetro tra 5 e 10, carta circa 3,5.</p>
        <div class="eq"><span><var>F</var> = ${frac('<var>F</var><sub>0</sub>', 'ε<sub>r</sub>')}</span></div></article>
      <article class="note"><h4>Ordini di grandezza</h4>
        <p>Il coulomb è enorme: due cariche da 1 C a 1 m si respingerebbero con 9 · 10⁹ N, il peso di quasi un milione di tonnellate. Nei problemi si usano µC e nC.</p></article>`,
  });

  // =====================================================================
  // 3 — Il campo elettrico
  // =====================================================================
  const e3 = [];
  e3.push({
    id: 'cam-pt', title: 'Campo di una carica', level: 2,
    defaults: { Q: 5, r: 10 },
    gen: () => ({ Q: pick([1, 2, 5, 10, 20]), r: pick([2, 5, 10, 20, 30]) }),
    solve: (p) => ({ E: P.fieldPoint(p.Q * 1e-9, p.r / 100) }),
    text: (p) => `Una carica puntiforme <var>Q</var> = ${p.Q} nC è nel vuoto. Quanto vale il campo elettrico a ${p.r} cm di distanza?`,
    asks: (p, r) => [{ label: '<var>E</var>', unit: 'N/C', value: r.E }],
    steps: (p, r) => step(`<var>E</var> = <var>k</var>${frac('<var>Q</var>', '<var>r</var>²')} = 8,99 · 10⁹ · ${frac(p.Q + ' · 10<sup>−9</sup>', N((p.r / 100) ** 2))} = ${res(N(r.E) + ' N/C')}`, 'Il campo non dipende dalla carica di prova: è una proprietà dello spazio attorno a Q.'),
  });
  e3.push({
    id: 'cam-forza', title: 'Forza su una carica nel campo', level: 1,
    gen: () => ({ q: pick([-5, -2, -1, 1, 2, 3, 5]), E: pick([1000, 2000, 5000, 10000, 50000]) }),
    solve: (p) => ({ F: Math.abs(p.q * 1e-6 * p.E) }),
    text: (p) => `Una carica <var>q</var> = ${qStr(p.q * 1e-6)} è in un campo elettrico uniforme di ${N(p.E)} N/C diretto verso destra. Trova l'intensità della forza e il suo verso.`,
    asks: (p, r) => [{ label: '<var>F</var>', unit: 'N', value: r.F }, h.choice('Verso della forza', ['verso destra, come il campo', 'verso sinistra, opposto al campo'], p.q > 0 ? 0 : 1)],
    steps: (p, r) => step(`<var>F</var> = |<var>q</var>| · <var>E</var> = ${B.sciH(Math.abs(p.q), -6)} · ${N(p.E)} = ${res(N(r.F) + ' N')}`) + step(res(p.q > 0 ? 'Verso destra' : 'Verso sinistra'), 'Su una carica positiva la forza ha il verso del campo; su una negativa (come un elettrone) il verso opposto.'),
  });
  e3.push({
    id: 'cam-unif', title: 'Campo tra due armature', level: 1,
    gen: () => ({ V: pick([10, 12, 50, 100, 230, 1000]), d: pick([0.5, 1, 2, 5, 10]) }),
    solve: (p) => ({ E: p.V / (p.d / 1000) }),
    text: (p) => `Due armature piane parallele distano ${N(p.d)} mm e tra loro c'è una tensione di ${p.V} V. Quanto vale il campo elettrico (uniforme) tra le armature?`,
    asks: (p, r) => [{ label: '<var>E</var>', unit: 'kV/m', value: r.E / 1000 }],
    hint: () => 'E = V/d con d in metri: 1 mm = 0,001 m.',
    steps: (p, r) => step(`<var>E</var> = ${frac('<var>V</var>', '<var>d</var>')} = ${frac(p.V + ' V', N(p.d / 1000) + ' m')} = ${N(r.E)} V/m = ${res(N(r.E / 1000) + ' kV/m')}`, 'V/m e N/C sono la stessa unità. L\'aria secca diventa conduttrice (scintilla) intorno a 3000 kV/m.'),
  });
  e3.push({
    id: 'cam-el', title: 'Un elettrone nel campo', level: 3,
    gen: () => ({ E: pick([100, 500, 1000, 5000, 20000]) }),
    solve: (p) => { const F = P.QE * p.E; return { F, a: F / ME }; },
    text: (p) => `Un elettrone (carica 1,602 · 10⁻¹⁹ C, massa 9,11 · 10⁻³¹ kg) si trova in un campo di ${N(p.E)} N/C. Trova la forza e l'accelerazione, in notazione scientifica.`,
    asks: (p, r) => B.qSci('<var>F</var> (N)', r.F).concat(B.qSci('<var>a</var> (m/s²)', r.a)),
    steps: (p, r) => step(`<var>F</var> = <var>e</var>·<var>E</var> = 1,602 · 10<sup>−19</sup> · ${N(p.E)} = ${res(B.sciOf(r.F) + ' N')}`) +
      step(`<var>a</var> = ${frac('<var>F</var>', '<var>m</var>')} = ${frac(B.sciOf(r.F), '9,11 · 10<sup>−31</sup>')} = ${res(B.sciOf(r.a) + ' m/s²')}`, 'Un\'accelerazione enorme: per questo nei tubi catodici e negli acceleratori bastano pochi centimetri per portare gli elettroni ad alta velocità.'),
  });

  const CONFIGS = {
    pos: { n: 'Carica positiva', ch: [{ q: 1e-9, x: 0.1, y: 0.06 }] },
    neg: { n: 'Carica negativa', ch: [{ q: -1e-9, x: 0.1, y: 0.06 }] },
    dip: { n: 'Dipolo + −', ch: [{ q: 1e-9, x: 0.065, y: 0.06 }, { q: -1e-9, x: 0.135, y: 0.06 }] },
    two: { n: 'Due cariche +', ch: [{ q: 1e-9, x: 0.065, y: 0.06 }, { q: 1e-9, x: 0.135, y: 0.06 }] },
    cap: { n: 'Due armature', plates: true },
  };
  function widgetField(host) {
    const c = K.widgetCard('Il campo elettrico, punto per punto', 'Tocca la mappa: la freccia rossa è la forza su una carica di prova positiva');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = Object.entries(CONFIGS).map(([k, x]) => `<button type="button" data-k="${k}">${x.n}</button>`).join('');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    let key = 'dip';
    let probe = { x: 0.1, y: 0.09 };
    const W = 520, H = 312, SX = W / 0.2, SY = H / 0.12;
    const fieldAt = (x, y) => {
      const cf = CONFIGS[key];
      if (cf.plates) return y > 0.03 && y < 0.09 && x > 0.03 && x < 0.17 ? { ex: 0, ey: -50000 } : { ex: 0, ey: 0 };
      return P.fieldAt(cf.ch, x, y);
    };
    const draw = () => {
      const cf = CONFIGS[key];
      let s = '';
      for (let i = 0; i < 20; i++) for (let j = 0; j < 12; j++) {
        const x = (i + 0.5) * 0.01, y = (j + 0.5) * 0.01;
        if (cf.ch && cf.ch.some((q) => Math.hypot(q.x - x, q.y - y) < 0.008)) continue;
        const f = fieldAt(x, y);
        const E = Math.hypot(f.ex, f.ey);
        if (!E) continue;
        const len = App.clamp(4 + 4 * Math.log10(E / 100), 3, 12);
        const ux = f.ex / E, uy = -f.ey / E;
        const X0 = x * SX, Y0 = H - y * SY;
        s += `<line class="farr" x1="${X0 - ux * len}" y1="${Y0 - uy * len}" x2="${X0 + ux * len}" y2="${Y0 + uy * len}" style="opacity:${App.clamp(0.25 + 0.15 * Math.log10(E / 100), 0.25, 1).toFixed(2)}"/><circle cx="${X0 + ux * len}" cy="${Y0 + uy * len}" r="1.6" class="fhead"/>`;
      }
      if (cf.plates) s += `<rect x="${0.03 * SX}" y="${H - 0.095 * SY}" width="${0.14 * SX}" height="6" fill="var(--bad)"/><rect x="${0.03 * SX}" y="${H - 0.025 * SY}" width="${0.14 * SX}" height="6" fill="var(--pen)"/><text x="${0.175 * SX}" y="${H - 0.09 * SY}" class="small">+</text><text x="${0.175 * SX}" y="${H - 0.02 * SY}" class="small">−</text>`;
      (cf.ch || []).forEach((q) => { s += `<circle cx="${q.x * SX}" cy="${H - q.y * SY}" r="11" fill="${q.q > 0 ? 'var(--bad)' : 'var(--pen)'}"/><text x="${q.x * SX}" y="${H - q.y * SY + 5}" text-anchor="middle" class="barlbl">${q.q > 0 ? '+' : '−'}</text>`; });
      const f = fieldAt(probe.x, probe.y);
      const E = Math.hypot(f.ex, f.ey);
      const PX = probe.x * SX, PY = H - probe.y * SY;
      if (E) {
        const ux = f.ex / E, uy = -f.ey / E;
        s += `<line class="probe-arrow" x1="${PX}" y1="${PY}" x2="${PX + ux * 34}" y2="${PY + uy * 34}"/><circle cx="${PX + ux * 34}" cy="${PY + uy * 34}" r="3.5" fill="var(--bad)"/>`;
      }
      s += `<circle cx="${PX}" cy="${PY}" r="6" class="op"/>`;
      fig.innerHTML = `<svg class="chart field-map" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto;cursor:crosshair"><title>Mappa del campo elettrico: ${cf.n}</title><rect width="${W}" height="${H}" fill="transparent"/>${s}</svg>`;
      fig.querySelector('svg').addEventListener('click', (e) => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        probe = { x: App.clamp(loc.x / SX, 0, 0.2), y: App.clamp((H - loc.y) / SY, 0, 0.12) };
        draw();
      });
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
      out.innerHTML = E ? `Nel punto scelto <var>E</var> = ${res(U(E, 'V/m'))} (cioè N/C). Una carica di prova da +1 nC sentirebbe una forza di ${U(E * 1e-9, 'N')} nel verso della freccia rossa; un elettrone, nel verso opposto. ${cf.plates ? 'Tra le armature il campo è uniforme: stesse frecce ovunque, E = V/d.' : 'Le frecce escono dalle cariche positive ed entrano in quelle negative; più sono scure, più il campo è intenso.'}` : 'In questo punto il campo è nullo (o quasi): fuori dalle armature, o dove i contributi si annullano.';
    };
    seg.addEventListener('click', (e) => { if (e.target.dataset.k) { key = e.target.dataset.k; draw(); } });
    c.append(seg, fig, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'campo', num: 3, short: 'Campo', title: 'Il campo elettrico',
    intro: 'Una carica modifica lo spazio intorno a sé: ogni altra carica che arriva lì sente una forza. Questa proprietà dello spazio è il campo elettrico, e si misura in newton al coulomb, cioè volt al metro.',
    goals: ['E = F/q', 'Campo di una carica', 'Linee di forza', 'Campo uniforme E = V/d'],
    widgets: [widgetField],
    example: e3[0], exampleTitle: 'Esempio: campo di una carica',
    families: e3,
    theory: `
      <article class="note"><h4>Definizione</h4>
        <div class="eq"><span>${frac('<var>F</var>', '<var>q</var>')} = <var>E</var></span><span><var>F</var> = <var>q</var> · <var>E</var></span><span class="u">N/C = V/m</span></div>
        <p>Il campo si misura con una piccola carica di prova positiva <var>q</var>: è la forza per unità di carica. È un vettore: ha intensità, direzione e verso.</p></article>
      <article class="note"><h4>Campo di una carica puntiforme</h4>
        <div class="eq"><span><var>E</var> = <var>k</var> · ${frac('<var>Q</var>', '<var>r</var>²')}</span></div>
        <p>Le <strong>linee di forza</strong> escono dalle cariche positive ed entrano in quelle negative; dove sono fitte il campo è intenso. Due linee non si incrociano mai.</p></article>
      <article class="note"><h4>Campo uniforme</h4>
        <p>Tra due armature piane parallele con tensione <var>V</var> e distanza <var>d</var> il campo è uguale in ogni punto (lontano dai bordi):</p>
        <div class="eq"><span><var>E</var> = ${frac('<var>V</var>', '<var>d</var>')}</span></div>
        <p>È il campo dentro un condensatore piano, che studierai in 3ª. Se supera la <strong>rigidità dielettrica</strong> dell'isolante (circa 3 kV/mm per l'aria secca) scocca una scarica.</p></article>`,
  });

  // =====================================================================
  // 4 — Potenziale, lavoro, differenza di potenziale
  // =====================================================================
  const e4 = [];
  e4.push({
    id: 'pot-lav', title: 'Lavoro del campo', level: 1,
    gen: () => ({ q: pick([1, 2, 5, 10, 20]), V: pick([5, 12, 50, 100, 230]) }),
    solve: (p) => ({ L: p.q * 1e-6 * p.V }),
    text: (p) => `Una carica di ${p.q} µC si sposta da un punto A a un punto B, con <var>V</var><sub>AB</sub> = <var>V</var><sub>A</sub> − <var>V</var><sub>B</sub> = ${p.V} V. Quanto lavoro compie il campo elettrico?`,
    asks: (p, r) => [{ label: '<var>L</var>', unit: 'mJ', value: r.L * 1000 }],
    steps: (p, r) => step(`<var>L</var> = <var>q</var> · <var>V</var><sub>AB</sub> = ${B.sciH(p.q, -6)} · ${p.V} = ${B.sciOf(r.L)} J = ${res(N(r.L * 1000) + ' mJ')}`, 'Una carica positiva che va verso potenziali più bassi riceve lavoro positivo dal campo, come un sasso che scende da una collina.'),
  });
  e4.push({
    id: 'pot-ev', title: 'Elettronvolt', level: 2,
    gen: () => ({ V: pick([1, 1.5, 9, 100, 1000, 25000]) }),
    solve: (p) => ({ J: p.V * P.QE }),
    text: (p) => `Un elettrone viene accelerato da una differenza di potenziale di ${N(p.V)} V. Quanta energia acquista, in elettronvolt e in joule?`,
    asks: (p, r) => [{ label: 'Energia', unit: 'eV', value: p.V }].concat(B.qSci('Energia in J', r.J)),
    steps: (p, r) => step(`<var>W</var> = <var>e</var> · <var>V</var> = ${res(N(p.V) + ' eV')}`, 'Per definizione 1 eV è l\'energia che una carica elementare acquista attraversando 1 V.') + step(`= ${N(p.V)} · 1,602 · 10<sup>−19</sup> J = ${res(B.sciOf(r.J) + ' J')}`, 'L\'elettronvolt è comodo per particelle e semiconduttori: il "gap" del silicio vale circa 1,1 eV.'),
  });
  e4.push({
    id: 'pot-pila', title: 'L\'energia di una pila', level: 2,
    gen: () => ({ V: pick([1.5, 3.7, 9, 12]), I: pick([0.1, 0.2, 0.5, 1, 2]), t: pick([5, 10, 30, 60]) }),
    solve: (p) => { const Q = p.I * p.t * 60; return { Q, W: Q * p.V }; },
    text: (p) => `Una pila da ${N(p.V)} V eroga ${U(p.I, 'A')} per ${p.t} minuti. Quanta carica sposta e quanta energia fornisce?`,
    asks: (p, r) => [{ label: '<var>Q</var>', unit: 'C', value: r.Q }, { label: 'Energia', unit: 'J', value: r.W }],
    steps: (p, r) => step(`<var>Q</var> = <var>I</var>·<var>t</var> = ${N(p.I)} · ${p.t * 60} s = ${res(N(r.Q) + ' C')}`) + step(`<var>W</var> = <var>V</var>·<var>Q</var> = ${N(p.V)} · ${N(r.Q)} = ${res(N(r.W) + ' J')}`, 'Una pila da 1,5 V fa un lavoro di 1,5 J su ogni coulomb che la attraversa: è il significato della sua f.e.m. Equivale a P·t = V·I·t.'),
  });
  e4.push({
    id: 'pot-unif', title: 'Differenza di potenziale nel campo uniforme', level: 1,
    gen: () => ({ E: pick([1000, 2000, 5000, 10000, 50000]), d: pick([0.5, 1, 2, 3, 5]) }),
    solve: (p) => ({ V: p.E * (p.d / 100) }),
    text: (p) => `In un campo uniforme di ${N(p.E)} V/m, due punti distano ${N(p.d)} cm lungo le linee di forza. Qual è la differenza di potenziale tra loro?`,
    asks: (p, r) => [{ label: '<var>V</var>', unit: 'V', value: r.V }],
    steps: (p, r) => step(`<var>V</var> = <var>E</var> · <var>d</var> = ${N(p.E)} · ${N(p.d / 100)} = ${res(N(r.V) + ' V')}`, 'Muovendosi nel verso del campo il potenziale diminuisce. Perpendicolarmente alle linee di forza non cambia (superfici equipotenziali).'),
  });
  e4.push({
    id: 'pot-mc', title: 'Concetti sul potenziale', level: 1,
    ...mc([
      ['Il volt equivale a…', ['joule al coulomb', 'coulomb al secondo', 'newton al metro', 'watt al secondo'], 'La tensione è lavoro per unità di carica: 1 V = 1 J/C.'],
      ['Una carica positiva lasciata libera in un campo elettrico si muove verso…', ['potenziali più bassi', 'potenziali più alti', 'dove il potenziale è zero', 'nessuna parte'], 'Come un sasso che rotola in discesa. Un elettrone, negativo, va invece verso potenziali più alti.'],
      ['Una pila "da 9 V" significa che…', ['compie 9 J di lavoro per ogni coulomb che la attraversa', 'eroga sempre 9 A', 'contiene 9 C di carica', 'ha una potenza di 9 W'], 'È la sua forza elettromotrice: lavoro per unità di carica.'],
      ['Tra due punti dello stesso filo ideale (senza resistenza) la differenza di potenziale è…', ['zero', 'uguale alla f.e.m.', 'infinita', 'uguale alla corrente'], 'Per questo negli schemi tutti i punti collegati da un filo sono lo stesso nodo e hanno lo stesso potenziale.'],
    ]),
  });

  function widgetHill(host) {
    const c = K.widgetCard('La collina del potenziale', 'Due armature: A a potenziale V, B a 0 V. Sposta la carica');
    const fig = document.createElement('div');
    const out = document.createElement('div');
    out.className = 'forms';
    let sign = 1;
    const tog = document.createElement('div');
    tog.className = 'seg';
    tog.innerHTML = '<button type="button" data-s="1" aria-pressed="true">Carica positiva</button><button type="button" data-s="-1" aria-pressed="false">Elettrone</button>';
    const draw = (vv) => {
      const V = vv.V, d = 0.05, x = vv.x / 100;
      const Vx = V * (1 - x / d);
      const q = sign > 0 ? 1e-6 : -P.QE;
      const W = 520, H = 220, x0 = 60, x1 = 460, yTop = 30, yBot = 180;
      const X = (xx) => x0 + ((x1 - x0) * xx) / d;
      const Y = (vvv) => yBot - ((yBot - yTop) * vvv) / V;
      let s = `<rect x="${x0 - 10}" y="20" width="8" height="170" fill="var(--bad)"/><rect x="${x1 + 2}" y="20" width="8" height="170" fill="var(--pen)"/>`;
      s += `<text x="${x0 - 6}" y="14" text-anchor="middle" class="small">A · ${N(V)} V</text><text x="${x1 + 6}" y="14" text-anchor="middle" class="small">B · 0 V</text>`;
      s += `<line class="gen" x1="${X(0)}" y1="${Y(V)}" x2="${X(d)}" y2="${Y(0)}"/>`;
      s += `<circle cx="${X(x)}" cy="${Y(Vx) - 9}" r="9" fill="${sign > 0 ? 'var(--bad)' : 'var(--pen)'}"/><text x="${X(x)}" y="${Y(Vx) - 5}" text-anchor="middle" class="barlbl">${sign > 0 ? '+' : '−'}</text>`;
      const fx = sign > 0 ? 1 : -1;
      s += `<line class="probe-arrow" x1="${X(x)}" y1="${Y(Vx) + 18}" x2="${X(x) + fx * 40}" y2="${Y(Vx) + 18}"/><polygon points="${X(x) + fx * 40},${Y(Vx) + 13} ${X(x) + fx * 49},${Y(Vx) + 18} ${X(x) + fx * 40},${Y(Vx) + 23}" fill="var(--bad)"/>`;
      s += `<text x="${(x0 + x1) / 2}" y="210" text-anchor="middle" class="small">campo E = ${App.si(V / d, 'V/m')} da A verso B · la linea è il potenziale</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Potenziale tra due armature e forza sulla carica</title>${s}</svg>`;
      const Lw = q * (V - Vx);
      out.innerHTML = `<div class="form-row"><span class="label">Potenziale nel punto</span><div class="f"><var>V</var>(<var>x</var>) = ${res(U(Vx, 'V'))}</div></div>
        <div class="form-row"><span class="label">Lavoro del campo da A fin qui</span><div class="f"><var>L</var> = <var>q</var>·(<var>V</var><sub>A</sub> − <var>V</var>) = ${sign > 0 ? U(Lw, 'J') : N(-(V - Vx)) + ' eV'}</div>
        <span class="meta">${sign > 0 ? 'La carica positiva "scende" verso B: il campo la spinge (freccia rossa) e compie lavoro positivo.' : 'L\'elettrone è spinto verso A, il potenziale più alto: per portarlo verso B serve lavoro dall\'esterno, per questo il lavoro del campo è negativo.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'V', label: 'Tensione tra le armature (V)', min: 1, max: 100, step: 1, value: 12, sig: 3 },
      { id: 'x', label: 'Posizione della carica (cm da A)', min: 0, max: 5, step: 0.1, value: 2, sig: 2 },
    ], draw);
    tog.addEventListener('click', (e) => {
      if (!e.target.dataset.s) return;
      sign = Number(e.target.dataset.s);
      tog.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.target)));
      draw(sl.values);
    });
    c.querySelector('.card-head').after(tog);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'potenziale', num: 4, short: 'Potenziale', title: 'Potenziale e differenza di potenziale',
    intro: 'Spostando una carica in un campo elettrico si compie lavoro. Il lavoro per unità di carica tra due punti è la differenza di potenziale: la stessa tensione che leggi con il voltmetro in un circuito.',
    goals: ['Lavoro ed energia potenziale', 'V = L/q', 'V = E·d', 'Elettronvolt'],
    widgets: [widgetHill],
    example: e4[0], exampleTitle: 'Esempio: lavoro del campo',
    families: e4,
    theory: `
      <article class="note"><h4>Energia potenziale e potenziale</h4>
        <p>Come un corpo in alto ha energia potenziale gravitazionale, una carica in un campo elettrico ha <strong>energia potenziale elettrica</strong> <var>U</var>. Il potenziale è l'energia per unità di carica:</p>
        <div class="eq"><span><var>V</var> = ${frac('<var>U</var>', '<var>q</var>')}</span><span class="u">1 V = 1 J/C</span></div></article>
      <article class="note"><h4>Differenza di potenziale e lavoro</h4>
        <div class="eq"><span><var>L</var><sub>AB</sub> = <var>q</var> · (<var>V</var><sub>A</sub> − <var>V</var><sub>B</sub>) = <var>q</var> · <var>V</var><sub>AB</sub></span></div>
        <p>Solo le <strong>differenze</strong> di potenziale hanno significato fisico: lo zero si sceglie (in un circuito è la massa). È la tensione dei circuiti: un generatore da 9 V compie 9 J su ogni coulomb.</p></article>
      <article class="note"><h4>Nel campo uniforme</h4>
        <div class="eq"><span><var>V</var> = <var>E</var> · <var>d</var></span><span><var>E</var> = ${frac('<var>V</var>', '<var>d</var>')}</span></div>
        <p>Il potenziale diminuisce nel verso del campo. Le cariche positive si muovono spontaneamente verso potenziali più bassi, quelle negative verso potenziali più alti.</p></article>
      <article class="note"><h4>Elettronvolt</h4>
        <p>1 eV = 1,602 · 10⁻¹⁹ J: l'energia che un elettrone acquista attraversando 1 V. È l'unità naturale per atomi, LED e semiconduttori.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'elt', year: '1–2', yearLabel: '1ª–2ª', title: 'Carica, campo e potenziale', route: 'elt-carica', lessonWord: 'Lezione',
    desc: 'Carica elementare, legge di Coulomb, campo elettrico e potenziale: da dove vengono tensione e corrente.',
    lessons,
  });
})();
