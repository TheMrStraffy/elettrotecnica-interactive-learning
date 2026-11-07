/* Reti in corrente continua — Moduli 5–9: Kirchhoff, maglie, Millman, sovrapposizione, Thevenin/Norton */
(function () {
  'use strict';
  const App = window.App;
  const DC = window.DC;
  const S = App.Schem.T;
  const L = App.Lessons;
  const { N, U, V, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const CC = App.CC;
  const h = CC.h;
  const I_ = (k) => V('I' + k);
  const R_ = (k) => V('R' + k);
  const E_ = (k) => V('E' + k);
  const VA = '<var>V</var><sub>A</sub>';
  const sg = (x) => (x < 0 ? '(' + N(x) + ')' : N(x));

  // ---------- Circuito di riferimento: generatore di valori "puliti" ----------
  const DOC = { E1: 20, R1: 2, E2: 8, R2: 4, R3: 4 };
  const twoGenGen = () => L.nice(() => ({
    E1: pick([6, 8, 10, 12, 15, 16, 18, 20, 24, 30]), R1: pick([1, 2, 3, 4, 5, 6, 8, 10, 12]),
    E2: pick([2, 4, 5, 6, 8, 9, 10, 12, 15]), R2: pick([1, 2, 3, 4, 5, 6, 8, 10, 12]), R3: pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]),
  }), (p) => {
    const m = DC.millman(p);
    return [m.I1, m.I2, m.I3, m.VA].every((x) => h.twoDec(x) && Math.abs(x) <= 20) && Math.abs(m.I3) > 0.05 && Math.abs(m.I1) > 0.05;
  }, DOC);
  CC.DOC = DOC;
  CC.twoGenGen = twoGenGen;
  const all = (p) => DC.solve(DC.nets.twoGen(p));
  const twoTable = (p) => L.rivpFromNet(DC.nets.twoGen(p), all(p));
  const twoText = (p) => `${E_(1)} = ${U(p.E1, 'V')}, ${R_(1)} = ${U(p.R1, 'Ω')}, ${E_(2)} = ${U(p.E2, 'V')}, ${R_(2)} = ${U(p.R2, 'Ω')}, ${R_(3)} = ${U(p.R3, 'Ω')}. Versi di riferimento: ${I_(1)} da ${E_(1)} verso A, ${I_(2)} da ${E_(2)} verso A, ${I_(3)} da A verso B.`;
  const twoFig = (p, sol) => { const s = DC.branch(p); return S.twoGen(p, sol ? { cur: { I1: s.I1, I2: s.I2, I3: s.I3 }, VA: s.VA } : {}); };
  const signNote = (I2) => (I2 < -1e-9
    ? `${I_(2)} è negativa: scorre al contrario della freccia, da A verso ${E_(2)}, ed entra dal suo +. ${E_(2)} non eroga, <strong>assorbe</strong> potenza (come una batteria in carica).`
    : I2 > 1e-9 ? `${I_(2)} è positiva: esce dal + di ${E_(2)}, che quindi eroga potenza.` : `${I_(2)} = 0: ${E_(2)} non eroga e non assorbe.`);

  // ---------- I cinque svolgimenti ----------
  const M = (CC.methods = {});

  M.branch = (p) => {
    const b = DC.branch(p);
    return step(`Nodo A: ${I_(1)} + ${I_(2)} = ${I_(3)}`, 'Con n = 2 nodi e r = 3 rami: 1 equazione ai nodi e 2 alle maglie.') +
      step(`Maglia α: ${E_(1)} = ${R_(1)}·${I_(1)} + ${R_(3)}·${I_(3)} → ${N(p.E1)} = ${N(p.R1)} ${I_(1)} + ${N(p.R3)} ${I_(3)} → ${I_(1)} = ${N(b.a1)} − ${N(b.b1)} ${I_(3)}`) +
      step(`Maglia β: ${E_(2)} = ${R_(2)}·${I_(2)} + ${R_(3)}·${I_(3)} → ${N(p.E2)} = ${N(p.R2)} ${I_(2)} + ${N(p.R3)} ${I_(3)} → ${I_(2)} = ${N(b.a2)} − ${N(b.b2)} ${I_(3)}`) +
      step(`(${N(b.a1)} − ${N(b.b1)} ${I_(3)}) + (${N(b.a2)} − ${N(b.b2)} ${I_(3)}) = ${I_(3)} → ${N(b.a1 + b.a2)} = ${N(1 + b.b1 + b.b2)} ${I_(3)} → ${I_(3)} = ${res(U(b.I3, 'A'))}`, 'Sostituisci nella legge del nodo.') +
      step(`${I_(1)} = ${N(b.a1)} − ${N(b.b1)} · ${N(b.I3)} = ${res(U(b.I1, 'A'))}; ${I_(2)} = ${N(b.a2)} − ${N(b.b2)} · ${N(b.I3)} = ${res(U(b.I2, 'A'))}`, signNote(b.I2)) +
      step(`${VA} = ${R_(3)}·${I_(3)} = ${res(U(b.VA, 'V'))}; verifica ${N(b.I1)} + ${sg(b.I2)} = ${N(b.I3)}${ok}`);
  };

  M.mesh = (p) => {
    const m = DC.mesh(p);
    return step(`Maglia α: (${R_(1)} + ${R_(3)}) <var>I</var><sub>a</sub> − ${R_(3)} <var>I</var><sub>b</sub> = ${E_(1)} → ${N(m.a11)} <var>I</var><sub>a</sub> − ${N(p.R3)} <var>I</var><sub>b</sub> = ${N(p.E1)}`, 'Sulla diagonale la somma delle resistenze della maglia, fuori diagonale meno la resistenza in comune.') +
      step(`Maglia β: −${R_(3)} <var>I</var><sub>a</sub> + (${R_(2)} + ${R_(3)}) <var>I</var><sub>b</sub> = −${E_(2)} → −${N(p.R3)} <var>I</var><sub>a</sub> + ${N(m.a22)} <var>I</var><sub>b</sub> = ${N(-p.E2)}`, `${E_(2)} ha segno meno: girando in senso orario si entra dal suo +.`) +
      step(`Δ = ${N(m.a11)} · ${N(m.a22)} − ${sg(m.a12)}·${sg(m.a12)} = ${N(m.D)}`, 'Regola di Cramer.') +
      step(`Δ<sub>a</sub> = ${N(m.b1)} · ${N(m.a22)} − ${sg(m.a12)}·${sg(m.b2)} = ${N(m.Da)} → <var>I</var><sub>a</sub> = ${N(m.Da)} / ${N(m.D)} = ${res(U(m.Ia, 'A'))}`) +
      step(`Δ<sub>b</sub> = ${N(m.a11)} · ${sg(m.b2)} − ${sg(m.a12)} · ${N(m.b1)} = ${N(m.Db)} → <var>I</var><sub>b</sub> = ${N(m.Db)} / ${N(m.D)} = ${res(U(m.Ib, 'A'))}`) +
      step(`${I_(1)} = <var>I</var><sub>a</sub> = ${res(U(m.I1, 'A'))}; ${I_(3)} = <var>I</var><sub>a</sub> − <var>I</var><sub>b</sub> = ${res(U(m.I3, 'A'))}; ${I_(2)} = −<var>I</var><sub>b</sub> = ${res(U(m.I2, 'A'))}`,
        `R₃ è in comune e le due maglie lo percorrono in versi opposti. R₂ è solo nella maglia β, che lo attraversa da A verso ${E_(2)}: opposto al verso di ${I_(2)}.`);
  };

  M.millman = (p) => {
    const m = DC.millman(p);
    return step(`Numeratore: ${frac(E_(1), R_(1))} + ${frac(E_(2), R_(2))} + ${frac('0', R_(3))} = ${N(p.E1 / p.R1)} + ${N(p.E2 / p.R2)} = ${N(m.num)} A`, 'Segno + perché entrambi i generatori hanno il + rivolto verso A. Il ramo senza generatore mette 0.') +
      step(`Denominatore: ${frac('1', R_(1))} + ${frac('1', R_(2))} + ${frac('1', R_(3))} = ${N(1 / p.R1)} + ${N(1 / p.R2)} + ${N(1 / p.R3)} = ${N(m.den)} S`) +
      step(`${VA} = ${frac(N(m.num), N(m.den))} = ${res(U(m.VA, 'V'))}`, 'Una sola equazione.') +
      step(`${I_(1)} = ${frac(E_(1) + ' − ' + VA, R_(1))} = ${frac(N(p.E1) + ' − ' + N(m.VA), N(p.R1))} = ${res(U(m.I1, 'A'))}`) +
      step(`${I_(2)} = ${frac(E_(2) + ' − ' + VA, R_(2))} = ${frac(N(p.E2) + ' − ' + N(m.VA), N(p.R2))} = ${res(U(m.I2, 'A'))}`, signNote(m.I2)) +
      step(`${I_(3)} = ${frac(VA, R_(3))} = ${res(U(m.I3, 'A'))}; ${N(m.I1)} + ${sg(m.I2)} = ${N(m.I3)}${ok}`);
  };

  M.superposition = (p, withFig = true) => {
    const s = DC.superposition(p);
    const a = s.a, b = s.b;
    return (withFig ? `<li class="fig-li"><div class="pair">${S.twoGen(p, { off: 'E2', cur: { I1: a.I1, I2: a.I2, I3: a.I3 } }).svg}${S.twoGen(p, { off: 'E1', cur: { I1: b.I1, I2: b.I2, I3: b.I3 } }).svg}</div></li>` : '') +
      step(`Solo ${E_(1)}: ${R_(2)} // ${R_(3)} = ${frac(N(p.R2) + '·' + N(p.R3), N(p.R2 + p.R3))} = ${N(a.R23)} Ω; <var>R</var>′<sub>eq</sub> = ${N(p.R1)} + ${N(a.R23)} = ${N(a.Req)} Ω`, `${E_(2)} spento diventa un corto: R₂ e R₃ finiscono in parallelo tra A e massa.`) +
      step(`<var>I</var>′<sub>1</sub> = ${frac(N(p.E1), N(a.Req))} = ${U(a.I1, 'A')}; <var>V</var>′<sub>A</sub> = ${N(a.R23)} · ${N(a.I1)} = ${U(a.VA, 'V')}; <var>I</var>′<sub>3</sub> = ${res(U(a.I3, 'A'))}; <var>I</var>′<sub>2</sub> = ${U(a.I2, 'A')}`, 'In R₂ la corrente va da A verso il corto, contro il verso di riferimento: segno meno.') +
      step(`Solo ${E_(2)}: ${R_(1)} // ${R_(3)} = ${N(b.R13)} Ω; <var>R</var>″<sub>eq</sub> = ${N(p.R2)} + ${N(b.R13)} = ${N(b.Req)} Ω`) +
      step(`<var>I</var>″<sub>2</sub> = ${frac(N(p.E2), N(b.Req))} = ${U(b.I2, 'A')}; <var>V</var>″<sub>A</sub> = ${U(b.VA, 'V')}; <var>I</var>″<sub>3</sub> = ${res(U(b.I3, 'A'))}; <var>I</var>″<sub>1</sub> = ${U(b.I1, 'A')}`) +
      step(`${I_(1)} = ${N(a.I1)} + ${sg(b.I1)} = ${res(U(s.I1, 'A'))}; ${I_(2)} = ${N(a.I2)} + ${sg(b.I2)} = ${res(U(s.I2, 'A'))}; ${I_(3)} = ${N(a.I3)} + ${N(b.I3)} = ${res(U(s.I3, 'A'))}; ${VA} = ${res(U(s.VA, 'V'))}`, 'Somma degli effetti, sempre con gli stessi versi di riferimento.');
  };

  M.thevenin = (p) => {
    const t = DC.thevenin(p);
    return step(`Tolto ${R_(3)}, resta un anello: <var>I</var><sub>0</sub> = ${frac(E_(1) + ' − ' + E_(2), R_(1) + ' + ' + R_(2))} = ${frac(N(p.E1 - p.E2), N(p.R1 + p.R2))} = ${U(t.I0, 'A')}`) +
      step(`<var>V</var><sub>th</sub> = ${E_(1)} − ${R_(1)}·<var>I</var><sub>0</sub> = ${N(p.E1)} − ${N(p.R1)}·${sg(t.I0)} = ${res(U(t.Vth, 'V'))}`, `Verifica: ${E_(2)} + ${R_(2)}·<var>I</var><sub>0</sub> = ${N(p.E2 + p.R2 * t.I0)} V${ok}`) +
      step(`<var>R</var><sub>th</sub> = ${R_(1)} // ${R_(2)} = ${frac(N(p.R1) + '·' + N(p.R2), N(p.R1 + p.R2))} = ${res(U(t.Rth, 'Ω'))}`, 'Generatori spenti (corti): R₁ e R₂ risultano in parallelo tra A e B.') +
      step(`${I_(3)} = ${frac('<var>V</var><sub>th</sub>', '<var>R</var><sub>th</sub> + ' + R_(3))} = ${frac(N(t.Vth), N(t.Rth) + ' + ' + N(p.R3))} = ${res(U(t.I3, 'A'))}; ${VA} = ${U(t.VA, 'V')}`, 'Ricollega il carico.') +
      step(`Norton: <var>I</var><sub>n</sub> = ${frac(E_(1), R_(1))} + ${frac(E_(2), R_(2))} = ${res(U(t.In, 'A'))} = <var>V</var><sub>th</sub>/<var>R</var><sub>th</sub>${ok}; <var>R</var><sub>n</sub> = <var>R</var><sub>th</sub>`, 'Corrente di cortocircuito tra A e B.');
  };

  // =====================================================================
  // MODULO 5 — Kirchhoff, correnti di ramo
  // =====================================================================
  const m5 = [];
  m5.push({
    id: 'm5-rami', title: 'Correnti di ramo', level: 2,
    defaults: DOC,
    gen: twoGenGen,
    solve: (p) => ({ ...DC.branch(p), P2: p.E2 * DC.branch(p).I2 }),
    text: (p) => twoText(p) + ' Trova le tre correnti (con il segno) e il potenziale di A. ' + E_(2) + ' eroga o assorbe?',
    fig: (p, r, sol) => twoFig(p, sol),
    asks: (p, r) => [h.qI(I_(1), r.I1), h.qI(I_(2), r.I2), h.qI(I_(3), r.I3), h.qV(VA, r.VA),
      h.choice(E_(2), ['eroga potenza', 'assorbe potenza', 'né l\'uno né l\'altro'], Math.abs(r.I2) < 1e-9 ? 2 : r.I2 > 0 ? 0 : 1)],
    hint: () => 'Una equazione al nodo A, una per ogni maglia. Ricava I₁ e I₂ in funzione di I₃ e sostituisci.',
    steps: (p) => M.branch(p),
    table: twoTable,
  });
  m5.push({
    id: 'm5-eq', title: 'Quante equazioni servono?', level: 1,
    gen: () => { const n = rand(2, 5); return { n, r: n - 1 + rand(1, 4) }; },
    solve: (p) => ({ lkc: p.n - 1, lkt: p.r - (p.n - 1) }),
    text: (p) => `Una rete ha <strong>${p.n} nodi</strong> e <strong>${p.r} rami</strong>. Con il metodo delle correnti di ramo, quante equazioni scrivi ai nodi e quante alle maglie?`,
    asks: (p, r) => [{ label: 'Equazioni ai nodi (LKC)', unit: '', value: r.lkc, tol: 0 }, { label: 'Equazioni alle maglie (LKT)', unit: '', value: r.lkt, tol: 0 }],
    steps: (p, r) => step(`LKC: <var>n</var> − 1 = ${p.n} − 1 = ${res(r.lkc)}`, 'L\'ultimo nodo darebbe un\'equazione già contenuta nelle altre.') +
      step(`LKT: <var>r</var> − (<var>n</var> − 1) = ${p.r} − ${r.lkc} = ${res(r.lkt)}`, 'Le maglie indipendenti (le "finestre" dello schema).') + step(`Totale ${p.r} equazioni per ${p.r} correnti incognite${ok}`),
  });

  function widgetArrow(host) {
    const c = CC.widgetCard('Il verso della freccia e il segno', 'Gira la freccia di I₂ e cambia E₂');
    const fig = document.createElement('div');
    const out = document.createElement('div');
    out.className = 'forms';
    let flip = false;
    const tog = document.createElement('label');
    tog.className = 'switch';
    tog.innerHTML = '<input type="checkbox"><span class="track"></span><span>Gira la freccia di <var>I</var><sub>2</sub></span>';
    const draw = (v) => {
      const p = { ...DOC, E2: v.E2 };
      const b = DC.branch(p);
      const I2 = flip ? -b.I2 : b.I2;
      fig.innerHTML = S.twoGen(p, { cur: { I1: b.I1, I2, I3: b.I3 }, VA: b.VA, flipI2: flip }).svg;
      const lkc = flip ? `${I_(1)} = ${I_(2)} + ${I_(3)} → ${N(b.I1)} = ${sg(I2)} + ${N(b.I3)}` : `${I_(1)} + ${I_(2)} = ${I_(3)} → ${N(b.I1)} + ${sg(I2)} = ${N(b.I3)}`;
      out.innerHTML = `<div class="form-row"><span class="label">Legge del nodo A con la freccia scelta</span><div class="f">${lkc}${ok}</div></div>
        <div class="form-row"><span class="label">Cosa fa ${E_(2)}</span><div>${b.I2 < -1e-9 ? `Assorbe ${U(-p.E2 * b.I2, 'W')}: la corrente vera entra dal suo +.` : b.I2 > 1e-9 ? `Eroga ${U(p.E2 * b.I2, 'W')}: la corrente vera esce dal suo +.` : 'Né eroga né assorbe: <var>E</var><sub>2</sub> = <var>V</var><sub>A</sub>.'}</div></div>
        <p class="hint">Girare la freccia cambia solo il segno del risultato, non la corrente vera. ${E_(2)} smette di assorbire e comincia a erogare quando supera <var>V</var><sub>A</sub>: prova a portarlo sopra 12 V.</p>`;
    };
    const sl = CC.sliders(c, [{ id: 'E2', label: '<var>E</var><sub>2</sub> (V)', min: 0, max: 30, step: 0.5, value: 8 }], draw);
    tog.querySelector('input').addEventListener('change', (e) => { flip = e.target.checked; draw(sl.values); });
    c.append(tog, fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm5', short: 'Kirchhoff', title: 'Principi di Kirchhoff e correnti di ramo', num: 5,
    intro: 'Con due o più generatori serie e parallelo non bastano: si scrivono equazioni con i due principi di Kirchhoff. Le correnti risultano I₁ = 4 A, I₂ = −1 A, I₃ = 3 A, e da qui al Modulo 9 lo ritroviamo con altri quattro metodi.',
    goals: ['LKC e LKT', 'Numero di equazioni', 'Correnti negative', 'Chi eroga e chi assorbe'],
    widgets: [widgetArrow],
    example: m5[0], exampleTitle: 'Esempio 5.1 — metodo delle correnti di ramo',
    families: m5,
    theory: `
      <article class="note"><h4>I due principi</h4>
        <ul>
          <li><strong>LKC (nodi)</strong>: a ogni nodo la somma delle correnti entranti è uguale alla somma delle uscenti.</li>
          <li><strong>LKT (maglie)</strong>: lungo un percorso chiuso la somma delle f.e.m. è uguale alla somma delle cdt (<var>R</var>·<var>I</var>), con segno + se concordi con il verso di percorrenza.</li>
        </ul></article>
      <article class="note"><h4>Quante equazioni</h4>
        <p>Con <var>n</var> nodi e <var>r</var> rami (= <var>r</var> correnti incognite):</p>
        <div class="eq"><span>(<var>n</var> − 1) LKC + [<var>r</var> − (<var>n</var> − 1)] LKT = <var>r</var></span></div></article>
      <article class="note"><h4>Procedura</h4>
        <ol>
          <li>Disegna una freccia di verso arbitrario per ogni corrente di ramo.</li>
          <li>Scrivi <var>n</var> − 1 equazioni ai nodi.</li>
          <li>Scegli le maglie (le "finestre") e un verso di percorrenza; scrivi una LKT per ognuna.</li>
          <li>Risolvi il sistema (sostituzione o Cramer).</li>
          <li>Una corrente negativa scorre al contrario della freccia: tienila con il segno nei calcoli successivi.</li>
        </ol></article>
      <article class="note"><h4>Eroga o assorbe?</h4>
        <p>Se la corrente esce dal + del generatore, il generatore <strong>eroga</strong> <var>P</var> = <var>E</var>·<var>I</var>. Se entra nel +, <strong>assorbe</strong>: è il caso di una batteria in carica o di un motore.</p></article>`,
  });

  // =====================================================================
  // MODULO 6 — Correnti di maglia
  // =====================================================================
  const m6 = [];
  m6.push({
    id: 'm6-maglie', title: 'Correnti di maglia', level: 2,
    defaults: DOC,
    gen: twoGenGen,
    solve: (p) => DC.mesh(p),
    text: (p) => twoText(p) + ' Con le correnti di maglia <var>I</var><sub>a</sub> e <var>I</var><sub>b</sub> (senso orario) trova Δ, le correnti di maglia e la corrente in ' + R_(3) + '.',
    fig: (p, r, sol) => S.twoGen(p, { mesh: true, Ia: sol ? r.Ia : null, Ib: sol ? r.Ib : null }),
    asks: (p, r) => [{ label: 'Δ', unit: '', value: r.D }, h.qI('<var>I</var><sub>a</sub>', r.Ia), h.qI('<var>I</var><sub>b</sub>', r.Ib), h.qI(I_(3), r.I3)],
    hint: () => 'Δ = (R₁ + R₃)(R₂ + R₃) − R₃². La corrente in R₃ è la differenza delle due correnti di maglia.',
    steps: (p) => M.mesh(p),
    table: twoTable,
  });
  m6.push({
    id: 'm6-scrivi', title: 'Scrivi il sistema "a vista"', level: 2,
    gen: twoGenGen,
    solve: (p) => DC.mesh(p),
    text: (p) => twoText(p) + ' Scrivi i coefficienti del sistema delle maglie (senso orario): (a₁₁) <var>I</var><sub>a</sub> + (a₁₂) <var>I</var><sub>b</sub> = b₁ e (a₁₂) <var>I</var><sub>a</sub> + (a₂₂) <var>I</var><sub>b</sub> = b₂.',
    fig: (p) => S.twoGen(p, { mesh: true }),
    asks: (p, r) => [
      { label: 'a₁₁', unit: 'Ω', value: r.a11, tol: 0.001 }, { label: 'a₁₂', unit: 'Ω', value: r.a12, tol: 0.001 },
      { label: 'a₂₂', unit: 'Ω', value: r.a22, tol: 0.001 }, { label: 'b₁', unit: 'V', value: r.b1, tol: 0.001 }, { label: 'b₂', unit: 'V', value: r.b2, tol: 0.001 },
    ],
    hint: () => 'Fuori diagonale va la resistenza in comune con il segno meno. A destra le f.e.m.: + se il verso orario esce dal loro +.',
    steps: (p, r) => step(`a₁₁ = ${R_(1)} + ${R_(3)} = ${res(N(r.a11) + ' Ω')}, a₂₂ = ${R_(2)} + ${R_(3)} = ${res(N(r.a22) + ' Ω')}`, 'Sulla diagonale: tutte le resistenze della maglia.') +
      step(`a₁₂ = −${R_(3)} = ${res(N(r.a12) + ' Ω')}`, 'Fuori diagonale: meno la resistenza in comune tra le due maglie.') +
      step(`b₁ = +${E_(1)} = ${res(N(r.b1) + ' V')}, b₂ = −${E_(2)} = ${res(N(r.b2) + ' V')}`, `Nella maglia β il verso orario entra dal + di ${E_(2)}: segno meno.`),
  });

  function widgetMesh(host) {
    const c = CC.widgetCard('Il sistema si scrive guardando lo schema', 'Cambia le resistenze: i colori collegano schema e coefficienti');
    const fig = document.createElement('div');
    const out = document.createElement('div');
    const draw = (v) => {
      const p = { ...DOC, R1: v.R1, R2: v.R2, R3: v.R3 };
      const m = DC.mesh(p);
      fig.innerHTML = S.twoGen(p, { mesh: true, Ia: m.Ia, Ib: m.Ib, hlR3: true }).svg;
      out.innerHTML = `<div class="matrix f">
        <span>(<b class="c1">${N(p.R1)}</b> + <b class="c3">${N(p.R3)}</b>) <var>I</var><sub>a</sub> − <b class="c3">${N(p.R3)}</b> <var>I</var><sub>b</sub> = ${N(p.E1)}</span>
        <span>− <b class="c3">${N(p.R3)}</b> <var>I</var><sub>a</sub> + (<b class="c2">${N(p.R2)}</b> + <b class="c3">${N(p.R3)}</b>) <var>I</var><sub>b</sub> = ${N(-p.E2)}</span></div>
        <p class="f">Δ = ${N(m.D)} → <var>I</var><sub>a</sub> = ${res(U(m.Ia, 'A'))}, <var>I</var><sub>b</sub> = ${res(U(m.Ib, 'A'))}, ${I_(3)} = <var>I</var><sub>a</sub> − <var>I</var><sub>b</sub> = ${res(U(m.I3, 'A'))}</p>
        <p class="hint">${R_(3)} (evidenziata) è l'unica resistenza in comune: compare in entrambe le equazioni, con il segno meno fuori diagonale. Se la fai molto piccola le due maglie quasi si separano.</p>`;
    };
    const sl = CC.sliders(c, [
      { id: 'R1', label: '<var>R</var><sub>1</sub> (Ω)', min: 0.5, max: 20, step: 0.5, value: 2 },
      { id: 'R2', label: '<var>R</var><sub>2</sub> (Ω)', min: 0.5, max: 20, step: 0.5, value: 4 },
      { id: 'R3', label: '<var>R</var><sub>3</sub> (Ω), in comune', min: 0.5, max: 20, step: 0.5, value: 4 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm6', short: 'Maglie', title: 'Metodo delle correnti di maglia', num: 6,
    intro: 'Si assegna una corrente fittizia a ogni maglia (Iₐ, I_b, in senso orario): le incognite scendono da 3 a 2 e la legge dei nodi è già rispettata da sola. Stesso circuito del Modulo 5, stesso risultato.',
    goals: ['Sistema "a vista"', 'Regola di Cramer', 'Dalle maglie ai rami'],
    widgets: [widgetMesh],
    example: m6[0], exampleTitle: 'Esempio 6.1 — stesso circuito, due equazioni',
    families: m6,
    theory: `
      <article class="note"><h4>Regola per scrivere ogni equazione</h4>
        <ul>
          <li>Sulla diagonale: corrente della maglia × <strong>somma</strong> delle resistenze della maglia.</li>
          <li>Fuori diagonale: − corrente della maglia vicina × resistenza <strong>in comune</strong>.</li>
          <li>A destra: somma delle f.e.m. della maglia, <strong>+</strong> se il verso orario esce dal loro +, <strong>−</strong> se entra nel +.</li>
        </ul>
        <div class="eq"><span>(<var>R</var><sub>1</sub> + <var>R</var><sub>3</sub>) <var>I</var><sub>a</sub> − <var>R</var><sub>3</sub> <var>I</var><sub>b</sub> = <var>E</var><sub>1</sub></span><span>−<var>R</var><sub>3</sub> <var>I</var><sub>a</sub> + (<var>R</var><sub>2</sub> + <var>R</var><sub>3</sub>) <var>I</var><sub>b</sub> = −<var>E</var><sub>2</sub></span></div></article>
      <article class="note"><h4>Cramer per un sistema 2×2</h4>
        <div class="eq"><span>Δ = <var>a</var><sub>11</sub><var>a</var><sub>22</sub> − <var>a</var><sub>12</sub><var>a</var><sub>21</sub></span><span><var>I</var><sub>a</sub> = Δ<sub>a</sub>/Δ</span><span><var>I</var><sub>b</sub> = Δ<sub>b</sub>/Δ</span></div>
        <p>Δ<sub>a</sub> si ottiene sostituendo la prima colonna con i termini noti, Δ<sub>b</sub> la seconda.</p></article>
      <article class="note"><h4>Dalle correnti di maglia a quelle di ramo</h4>
        <p>Un ramo che appartiene a una sola maglia porta la sua corrente di maglia (con il segno, se il verso è opposto alla freccia del ramo). Un ramo in comune porta la <strong>differenza</strong> delle due correnti di maglia: <var>I</var><sub>3</sub> = <var>I</var><sub>a</sub> − <var>I</var><sub>b</sub>.</p></article>`,
  });

  // =====================================================================
  // MODULO 7 — Potenziali di nodo e Millman
  // =====================================================================
  const m7 = [];
  m7.push({
    id: 'm7-millman', title: 'Teorema di Millman', level: 2,
    defaults: DOC,
    gen: twoGenGen,
    solve: (p) => DC.millman(p),
    text: (p) => twoText(p) + ' Con il teorema di Millman (massa in B) trova ' + VA + ' e poi le tre correnti.',
    fig: (p, r, sol) => twoFig(p, sol),
    asks: (p, r) => [h.qV(VA, r.VA), h.qI(I_(1), r.I1), h.qI(I_(2), r.I2), h.qI(I_(3), r.I3)],
    hint: () => 'V_A = (E₁/R₁ + E₂/R₂ + 0/R₃) / (1/R₁ + 1/R₂ + 1/R₃). Poi ogni corrente è (E del ramo − V_A)/R del ramo.',
    steps: (p) => M.millman(p),
    table: twoTable,
  });

  const millGen = () => L.nice(() => {
    const br = [0, 1, 2].map(() => ({ E: pick([0, 4, 6, 8, 10, 12, 15, 18, 20, 24]), up: Math.random() < 0.75, R: pick([1, 2, 3, 4, 5, 6, 8, 10, 12]) }));
    return { br };
  }, (p) => {
    if (p.br.filter((b) => b.E).length < 2) return false;
    const m = DC.millmanN(p.br);
    return h.twoDec(m.VA) && m.I.every((x) => h.twoDec(x) && Math.abs(x) <= 25) && Math.abs(m.VA) > 0.05;
  }, { br: [{ E: 12, up: true, R: 6 }, { E: 6, up: true, R: 3 }, { E: 0, up: true, R: 6 }] });
  const brSign = (b) => (b.E ? (b.up ? '+' : '−') : '');

  m7.push({
    id: 'm7-tre', title: 'Tre rami tra due nodi', level: 3,
    gen: millGen,
    solve: (p) => DC.millmanN(p.br),
    text: (p) => `Tre rami collegati tra A e B (massa). ${p.br.map((b, k) => `Ramo ${k + 1}: ${R_(k + 1)} = ${N(b.R)} Ω${b.E ? `, ${E_(k + 1)} = ${N(b.E)} V con il + verso ${b.up ? 'A' : 'B'}` : ', senza generatore'}`).join('; ')}. Trova ${VA} e le correnti di ramo (positive se salgono verso A).`,
    fig: (p, r, sol) => S.millman3(p, sol ? { cur: { I1: r.I[0], I2: r.I[1], I3: r.I[2] }, VA: r.VA } : {}),
    asks: (p, r) => [h.qV(VA, r.VA)].concat(r.I.map((x, k) => h.qI(I_(k + 1), x))),
    hint: () => 'Una f.e.m. con il + rivolto verso B va al numeratore con il segno meno.',
    steps: (p, r) =>
      step(`Numeratore: ${p.br.map((b, k) => (b.E ? `${brSign(b)}${frac(N(b.E), N(b.R))}` : frac('0', N(b.R)))).join(' ')} = ${N(r.num)} A`, 'Segno + per il + rivolto verso A, − se rivolto verso B, 0 se il ramo non ha generatore.') +
      step(`Denominatore: ${p.br.map((b) => frac('1', N(b.R))).join(' + ')} = ${N(r.den)} S`) +
      step(`${VA} = ${frac(N(r.num), N(r.den))} = ${res(U(r.VA, 'V'))}`) +
      r.I.map((x, k) => step(`${I_(k + 1)} = ${frac((p.br[k].E ? brSign(p.br[k]) + N(p.br[k].E) : '0') + ' − ' + N(r.VA), N(p.br[k].R))} = ${res(U(x, 'A'))}`)).join('') +
      step(`Somma delle correnti verso A: ${r.I.map(sg).join(' + ')} = 0${ok}`, 'Legge dei nodi.'),
    table: (p) => L.rivpFromNet(DC.nets.millman3(p), DC.solve(DC.nets.millman3(p))),
  });

  m7.push({
    id: 'm7-err', title: 'Trova l\'errore nel numeratore', level: 2,
    gen: () => L.nice(millGen, (p) => p.br.some((b) => b.E && !b.up), { br: [{ E: 12, up: true, R: 6 }, { E: 6, up: false, R: 3 }, { E: 0, up: true, R: 6 }] }),
    solve: (p) => {
      const r = DC.millmanN(p.br);
      const wrongBr = p.br.map((b) => ({ ...b, up: true }));
      const w = DC.millmanN(wrongBr);
      return { ...r, wnum: w.num, wVA: w.VA };
    },
    text: (p, r) => `Rami tra A e B: ${p.br.map((b, k) => `${R_(k + 1)} = ${N(b.R)} Ω${b.E ? ` con ${E_(k + 1)} = ${N(b.E)} V (+ verso ${b.up ? 'A' : 'B'})` : ''}`).join('; ')}. Un compagno scrive:<ol class="wrong"><li class="f">numeratore = ${p.br.map((b) => (b.E ? '+' + frac(N(b.E), N(b.R)) : frac('0', N(b.R)))).join(' ')} = ${N(r.wnum)}</li><li class="f">denominatore = ${p.br.map((b) => frac('1', N(b.R))).join(' + ')} = ${N(r.den)}</li><li class="f">${VA} = ${N(r.wVA)} V</li></ol>Dov'è l'errore? Qual è il valore giusto?`,
    fig: (p) => S.millman3(p, { arrows: false }),
    asks: (p, r) => [h.choice('L\'errore è nel', ['numeratore', 'denominatore', 'non c\'è errore'], 0), h.qV(VA + ' corretto', r.VA)],
    steps: (p, r) => step(`Numeratore corretto: ${p.br.map((b) => (b.E ? brSign(b) + frac(N(b.E), N(b.R)) : frac('0', N(b.R)))).join(' ')} = ${N(r.num)}`, 'Il generatore con il + rivolto verso B va con il segno meno. Il denominatore non dipende dai generatori ed era giusto.') + step(`${VA} = ${frac(N(r.num), N(r.den))} = ${res(U(r.VA, 'V'))}`),
  });

  function widgetBalance(host) {
    const c = CC.widgetCard('Millman è una media pesata', 'Ogni ramo "tira" V_A verso la sua f.e.m. con un peso 1/R');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'hint';
    const draw = (v) => {
      const pts = [{ x: v.E1, g: 1 / v.R1, n: 'E₁', col: 'var(--g1)' }, { x: v.E2, g: 1 / v.R2, n: 'E₂', col: 'var(--g2)' }, { x: 0, g: 1 / v.R3, n: 'R₃ (0 V)', col: 'var(--g3)' }];
      const VAv = pts.reduce((s, q) => s + q.x * q.g, 0) / pts.reduce((s, q) => s + q.g, 0);
      const W = 480, x0 = 30, x1 = W - 30, max = 30;
      const X = (x) => x0 + ((x1 - x0) * x) / max;
      let s = `<line class="axis" x1="${x0}" y1="90" x2="${x1}" y2="90"/>`;
      for (let k = 0; k <= 30; k += 5) s += `<line class="gridl" x1="${X(k)}" y1="86" x2="${X(k)}" y2="94"/><text x="${X(k)}" y="110" text-anchor="middle">${k} V</text>`;
      const gmax = Math.max(...pts.map((q) => q.g));
      pts.forEach((q, i) => {
        const r = 6 + 18 * Math.sqrt(q.g / gmax);
        s += `<circle cx="${X(q.x)}" cy="${90 - r - 2}" r="${r}" fill="${q.col}" opacity=".75"/><text class="small" x="${X(q.x)}" y="${i % 2 ? 132 : 124}" text-anchor="middle">${q.n}</text>`;
      });
      s += `<path d="M${X(VAv) - 9} 104 L${X(VAv)} 90 L${X(VAv) + 9} 104 Z" fill="var(--ink)"/><text x="${X(VAv)}" y="20" text-anchor="middle" class="barlbl dark">V_A = ${App.si(VAv, 'V')}</text><line class="guide" x1="${X(VAv)}" y1="26" x2="${X(VAv)}" y2="88"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 140" role="img" style="width:100%;height:auto"><title>V_A come media pesata delle f.e.m.</title>${s}</svg>`;
      out.innerHTML = `${VA} è la media delle f.e.m. dei rami (0 V per il ramo senza generatore), pesata con le conduttanze 1/<var>R</var>: i cerchi più grandi pesano di più. Un ramo con <var>R</var> piccola trascina ${VA} verso la sua f.e.m. Il generatore con f.e.m. più bassa di ${VA} assorbe potenza.`;
    };
    const sl = CC.sliders(c, [
      { id: 'E1', label: '<var>E</var><sub>1</sub> (V)', min: 0, max: 30, step: 0.5, value: 20 },
      { id: 'R1', label: '<var>R</var><sub>1</sub> (Ω)', min: 0.5, max: 20, step: 0.5, value: 2 },
      { id: 'E2', label: '<var>E</var><sub>2</sub> (V)', min: 0, max: 30, step: 0.5, value: 8 },
      { id: 'R2', label: '<var>R</var><sub>2</sub> (Ω)', min: 0.5, max: 20, step: 0.5, value: 4 },
      { id: 'R3', label: '<var>R</var><sub>3</sub> (Ω)', min: 0.5, max: 20, step: 0.5, value: 4 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm7', short: 'Millman', title: 'Potenziali di nodo e teorema di Millman', num: 7,
    intro: 'Si sceglie un nodo di massa (B = 0 V) e si scrive la legge dei nodi sugli altri nodi usando i potenziali come incognite: con 2 nodi basta una sola equazione, e il risultato è V_A = 12 V.',
    goals: ['Potenziale di nodo', 'Millman con segni', 'Correnti da V_A'],
    widgets: [widgetBalance],
    example: m7[0], exampleTitle: 'Esempio 7.1 — una sola equazione',
    families: m7,
    theory: `
      <article class="note"><h4>Potenziali di nodo</h4>
        <p>Ogni ramo scrive la sua corrente uscente da A come (<var>V</var><sub>A</sub> − <var>E</var> del ramo) / <var>R</var> del ramo:</p>
        <div class="eq"><span>${frac('<var>V</var><sub>A</sub> − <var>E</var><sub>1</sub>', '<var>R</var><sub>1</sub>')} + ${frac('<var>V</var><sub>A</sub> − <var>E</var><sub>2</sub>', '<var>R</var><sub>2</sub>')} + ${frac('<var>V</var><sub>A</sub>', '<var>R</var><sub>3</sub>')} = 0</span></div></article>
      <article class="note"><h4>Teorema di Millman</h4>
        <p>Con due soli nodi (rami tutti in parallelo tra A e B) l'equazione diventa:</p>
        <div class="eq"><span><var>V</var><sub>AB</sub> = ${frac('Σ <var>E</var><sub><var>k</var></sub> / <var>R</var><sub><var>k</var></sub>', 'Σ 1 / <var>R</var><sub><var>k</var></sub>')}</span></div>
        <p>Segno di <var>E</var>: + se il suo morsetto + è rivolto verso A, − se è rivolto verso B. Un ramo senza generatore mette 0 al numeratore ma conta al denominatore.</p>
        <p>È il metodo più veloce quando tutti i rami stanno tra <strong>due soli nodi</strong>: un calcolo, poi solo Ohm.</p></article>`,
  });

  // =====================================================================
  // MODULO 8 — Sovrapposizione degli effetti
  // =====================================================================
  const m8 = [];
  m8.push({
    id: 'm8-sov', title: 'Un generatore alla volta', level: 2,
    defaults: DOC,
    gen: twoGenGen,
    solve: (p) => DC.superposition(p),
    text: (p) => twoText(p) + ' Con la sovrapposizione degli effetti trova il contributo di ciascun generatore alla corrente in ' + R_(3) + ' e al potenziale di A, poi i totali.',
    fig: (p, r, sol) => twoFig(p, sol),
    asks: (p, r) => [h.qI('<var>I</var>′<sub>3</sub> (solo E₁)', r.a.I3), h.qI('<var>I</var>″<sub>3</sub> (solo E₂)', r.b.I3), h.qI(I_(3), r.I3), h.qV('<var>V</var>′<sub>A</sub>', r.a.VA), h.qV('<var>V</var>″<sub>A</sub>', r.b.VA)],
    hint: () => 'Spegnere un generatore di tensione vuol dire sostituirlo con un filo. Poi è un circuito misto.',
    steps: (p) => M.superposition(p),
    table: twoTable,
  });
  m8.push({
    id: 'm8-pot', title: 'Le potenze non si sovrappongono', level: 2,
    gen: twoGenGen,
    solve: (p) => { const s = DC.superposition(p); return { s, Pa: p.R3 * s.a.I3 ** 2, Pb: p.R3 * s.b.I3 ** 2, P: p.R3 * s.I3 ** 2 }; },
    text: (p) => twoText(p) + ' Calcola la potenza in ' + R_(3) + ' con solo E₁ acceso, con solo E₂ acceso, e quella vera con tutti e due.',
    fig: (p, r, sol) => twoFig(p, sol),
    asks: (p, r) => [h.qP('<var>P</var>′<sub>3</sub>', r.Pa), h.qP('<var>P</var>″<sub>3</sub>', r.Pb), h.qP('<var>P</var><sub>3</sub> vera', r.P)],
    steps: (p, r) => step(`<var>I</var>′<sub>3</sub> = ${U(r.s.a.I3, 'A')}, <var>I</var>″<sub>3</sub> = ${U(r.s.b.I3, 'A')}, ${I_(3)} = ${U(r.s.I3, 'A')}`) +
      step(`<var>P</var>′<sub>3</sub> = ${N(p.R3)}·${N(r.s.a.I3)}² = ${res(U(r.Pa, 'W'))}; <var>P</var>″<sub>3</sub> = ${N(p.R3)}·${N(r.s.b.I3)}² = ${res(U(r.Pb, 'W'))}`) +
      step(`<var>P</var><sub>3</sub> = ${N(p.R3)}·${N(r.s.I3)}² = ${res(U(r.P, 'W'))} ≠ ${N(r.Pa)} + ${N(r.Pb)} = ${N(r.Pa + r.Pb)} W`, 'La potenza dipende da I²: (a + b)² non è a² + b². Le potenze si calcolano solo alla fine, con le correnti totali.'),
  });

  function widgetSuper(host) {
    const c = CC.widgetCard('Accendi e spegni i generatori', 'Ogni generatore da solo, poi insieme');
    const fig = document.createElement('div');
    const bars = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'hint';
    const on = { E1: true, E2: true };
    const row = document.createElement('div');
    row.className = 'row';
    ['E1', 'E2'].forEach((k) => {
      const t = document.createElement('label');
      t.className = 'switch';
      t.innerHTML = `<input type="checkbox" checked><span class="track"></span><span><var>E</var><sub>${k[1]}</sub> acceso</span>`;
      t.querySelector('input').addEventListener('change', (e) => { on[k] = e.target.checked; draw(); });
      row.appendChild(t);
    });
    const p = DOC;
    const s = DC.superposition(p);
    const draw = () => {
      const off = !on.E1 && !on.E2 ? 'both' : !on.E1 ? 'E1' : !on.E2 ? 'E2' : null;
      const I3 = (on.E1 ? s.a.I3 : 0) + (on.E2 ? s.b.I3 : 0);
      const I1 = (on.E1 ? s.a.I1 : 0) + (on.E2 ? s.b.I1 : 0);
      const I2 = (on.E1 ? s.a.I2 : 0) + (on.E2 ? s.b.I2 : 0);
      const f = S.twoGen(p, { off, cur: { I1, I2, I3 } }).svg;
      fig.innerHTML = f;
      const W = 460, sc = (W - 140) / 3.5;
      const bar = (y, val, col, lbl) => `<text class="small" x="0" y="${y + 14}">${lbl}</text><rect x="120" y="${y}" width="${Math.max(0, val * sc)}" height="18" fill="${col}" opacity=".85"/><text class="small" x="${126 + Math.max(0, val * sc)}" y="${y + 14}">${App.si(val, 'A')}</text>`;
      bars.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 92" role="img" style="width:100%;height:auto"><title>Contributi alla corrente in R3</title>
        ${bar(4, on.E1 ? s.a.I3 : 0, 'var(--g1)', 'I₃′ da E₁')}${bar(30, on.E2 ? s.b.I3 : 0, 'var(--g2)', 'I₃″ da E₂')}
        <rect x="120" y="58" width="${(on.E1 ? s.a.I3 : 0) * sc}" height="18" fill="var(--g1)" opacity=".85"/><rect x="${120 + (on.E1 ? s.a.I3 : 0) * sc}" y="58" width="${(on.E2 ? s.b.I3 : 0) * sc}" height="18" fill="var(--g2)" opacity=".85"/>
        <text class="small" x="0" y="72">I₃ totale</text><text class="small" x="${126 + I3 * sc}" y="72">${App.si(I3, 'A')}</text></svg>`;
      const P = p.R3 * I3 * I3;
      out.innerHTML = on.E1 && on.E2
        ? `Le correnti si sommano: ${N(s.a.I3)} + ${N(s.b.I3)} = ${N(I3)} A. Le potenze no: 4·2,5² + 4·0,5² = 26 W, ma quella vera è 4·3² = ${N(P)} W.`
        : off === 'both' ? 'Senza generatori non circola corrente.' : `Con un solo generatore il circuito si risolve con serie, parallelo e partitori. In ${R_(3)}: ${U(I3, 'A')}.`;
    };
    c.append(row, fig, bars, out);
    host.appendChild(c);
    draw();
  }

  CC.lessons.push({
    id: 'm8', short: 'Sovrapposizione', title: 'Sovrapposizione degli effetti', num: 8,
    intro: 'In un circuito lineare ogni corrente (e ogni tensione) è la somma degli effetti prodotti da ciascun generatore preso da solo. Sommando i due casi parziali si ritrovano I₁ = 4 A, I₂ = −1 A, I₃ = 3 A.',
    goals: ['Spegnere un generatore', 'Casi parziali', 'Somma con i segni', 'Perché le potenze non si sommano'],
    widgets: [widgetSuper],
    example: m8[0], exampleTitle: 'Esempio 8.1 — i due casi parziali',
    families: m8,
    theory: `
      <article class="note"><h4>Procedura</h4>
        <ol>
          <li>Tieni acceso <strong>un solo</strong> generatore.</li>
          <li>Gli altri si "spengono": generatore di tensione → <strong>cortocircuito</strong> (filo), generatore di corrente → <strong>circuito aperto</strong>. Le loro resistenze interne restano.</li>
          <li>Risolvi il circuito parziale con serie, parallelo e partitori.</li>
          <li>Ripeti per ogni generatore, poi <strong>somma</strong> i risultati, rispettando sempre gli stessi versi di riferimento.</li>
        </ol></article>
      <article class="note"><h4>Attenzione alle potenze</h4>
        <p>Le potenze <strong>non</strong> si sovrappongono (dipendono da <var>I</var>²): si calcolano solo alla fine con le correnti totali. Nell'esempio <var>P</var>′<sub>3</sub> + <var>P</var>″<sub>3</sub> = 25 + 1 = 26 W, ma la vera è 4 · 3² = 36 W.</p></article>`,
  });

  // =====================================================================
  // MODULO 9 — Thevenin, Norton, generatore reale
  // =====================================================================
  const m9 = [];
  m9.push({
    id: 'm9-th', title: 'Thevenin sul carico', level: 2,
    defaults: DOC,
    gen: twoGenGen,
    solve: (p) => DC.thevenin(p),
    text: (p) => twoText(p) + ' Trova l\'equivalente di Thevenin visto dai morsetti di ' + R_(3) + ' e la corrente in ' + R_(3) + '.',
    fig: (p, r, sol) => (sol ? S.twoGen(p, { open: true, Vth: r.Vth }) : twoFig(p, false)),
    asks: (p, r) => [h.qV('<var>V</var><sub>th</sub>', r.Vth), h.qR('<var>R</var><sub>th</sub>', r.Rth), h.qI(I_(3), r.I3)],
    hint: () => 'Togli R₃: resta un solo anello. Per R_th spegni i generatori (corti) e guarda da A-B.',
    steps: (p) => M.thevenin(p),
  });
  m9.push({
    id: 'm9-norton', title: 'Norton sullo stesso carico', level: 2,
    gen: twoGenGen,
    solve: (p) => DC.thevenin(p),
    text: (p) => twoText(p) + ' Trova l\'equivalente di Norton visto da ' + R_(3) + ' e ricava ' + I_(3) + ' con il partitore di corrente.',
    fig: (p, r, sol) => (sol ? S.thevenin({ In: r.In, Rth: r.Rth, RL: p.R3 }, { norton: true, cur: { I: r.I3 } }) : twoFig(p, false)),
    asks: (p, r) => [h.qI('<var>I</var><sub>n</sub>', r.In), h.qR('<var>R</var><sub>n</sub>', r.Rth), h.qI(I_(3), r.I3)],
    hint: () => 'Metti in corto A e B: ogni generatore manda E/R nel corto.',
    steps: (p, r) => step(`Corto tra A e B: <var>I</var><sub>n</sub> = ${frac(E_(1), R_(1))} + ${frac(E_(2), R_(2))} = ${N(p.E1 / p.R1)} + ${N(p.E2 / p.R2)} = ${res(U(r.In, 'A'))}`, 'Con A-B in corto, ogni generatore vede solo la sua resistenza.') +
      step(`<var>R</var><sub>n</sub> = <var>R</var><sub>th</sub> = ${R_(1)} // ${R_(2)} = ${res(U(r.Rth, 'Ω'))}`) +
      step(`${I_(3)} = <var>I</var><sub>n</sub> · ${frac('<var>R</var><sub>n</sub>', '<var>R</var><sub>n</sub> + ' + R_(3))} = ${N(r.In)} · ${frac(N(r.Rth), N(r.Rth + p.R3))} = ${res(U(r.I3, 'A'))}`, 'Partitore di corrente tra Rₙ e R₃.'),
  });
  const loadGen = () => L.nice(() => ({ E: pick([6, 9, 12, 16, 20, 24]), Rth: pick([0.5, 1, 1.5, 2, 3, 4, 5]), RL: pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15]) }),
    (p) => { const I = p.E / (p.Rth + p.RL); return h.twoDec(I) && h.twoDec(I * p.RL); }, { E: 16, Rth: 2, RL: 6 });
  m9.push({
    id: 'm9-carico', title: 'Cambia il carico', level: 1,
    gen: loadGen,
    solve: (p) => { const I = p.E / (p.Rth + p.RL); return { I, V: I * p.RL, P: I * I * p.RL }; },
    text: (p) => `Una rete ha equivalente di Thevenin <var>V</var><sub>th</sub> = ${U(p.E, 'V')}, <var>R</var><sub>th</sub> = ${U(p.Rth, 'Ω')}. Collega un carico <var>R</var><sub>L</sub> = ${U(p.RL, 'Ω')}: trova corrente, tensione e potenza sul carico.`,
    fig: (p, r, sol) => S.thevenin(p, { cur: sol ? { I: r.I } : null }),
    asks: (p, r) => [h.qI(I_(''), r.I), h.qV('<var>V</var><sub>AB</sub>', r.V), h.qP('<var>P</var> sul carico', r.P)],
    steps: (p, r) => step(`<var>I</var> = ${frac('<var>V</var><sub>th</sub>', '<var>R</var><sub>th</sub> + <var>R</var><sub>L</sub>')} = ${frac(N(p.E), N(p.Rth + p.RL))} = ${res(U(r.I, 'A'))}`, 'Con l\'equivalente pronto, ogni nuovo carico è un solo calcolo.') +
      step(`<var>V</var><sub>AB</sub> = <var>R</var><sub>L</sub>·<var>I</var> = ${res(U(r.V, 'V'))}; <var>P</var> = <var>V</var>·<var>I</var> = ${res(U(r.P, 'W'))}`),
  });
  m9.push({
    id: 'm9-reale', title: 'Generatore reale', level: 1,
    defaults: { E: 12, Rth: 0.5, RL: 5.5 },
    gen: () => L.nice(() => ({ E: pick([1.5, 4.5, 6, 9, 12, 24]), Rth: pick([0.1, 0.2, 0.5, 1, 1.5, 2]), RL: pick([1, 2, 3.5, 4, 5.5, 8, 9.5, 10, 12]) }),
      (p) => { const I = p.E / (p.Rth + p.RL); return clean(I, 3) && clean(p.E / p.Rth, 3); }, { E: 12, Rth: 0.5, RL: 5.5 }),
    solve: (p) => { const I = p.E / (p.Rth + p.RL); return { I, V: p.E - p.Rth * I, eta: p.RL / (p.Rth + p.RL), Icc: p.E / p.Rth }; },
    text: (p) => `Una batteria ha <var>E</var> = ${U(p.E, 'V')} e resistenza interna <var>R</var><sub>i</sub> = ${U(p.Rth, 'Ω')}; alimenta un carico <var>R</var><sub>L</sub> = ${U(p.RL, 'Ω')}. Trova corrente, tensione ai morsetti, rendimento e corrente di cortocircuito.`,
    fig: (p, r, sol) => S.thevenin(p, { real: true, cur: sol ? { I: r.I } : null }),
    asks: (p, r) => [h.qI(I_(''), r.I), h.qV('<var>V</var><sub>AB</sub>', r.V), { label: 'Rendimento η', unit: '%', value: r.eta * 100 }, h.qI('<var>I</var><sub>cc</sub>', r.Icc)],
    steps: (p, r) => step(`<var>I</var> = ${frac('<var>E</var>', '<var>R</var><sub>i</sub> + <var>R</var><sub>L</sub>')} = ${frac(N(p.E), N(p.Rth + p.RL))} = ${res(U(r.I, 'A'))}`, 'Un generatore reale è già un equivalente di Thevenin.') +
      step(`<var>V</var><sub>AB</sub> = <var>E</var> − <var>R</var><sub>i</sub>·<var>I</var> = ${N(p.E)} − ${N(p.Rth * r.I)} = ${res(U(r.V, 'V'))}`, 'Sotto carico la tensione scende.') +
      step(`η = ${frac('<var>P</var><sub>carico</sub>', '<var>P</var><sub>generata</sub>')} = ${frac(N(r.V * r.I), N(p.E * r.I))} = ${res(N(r.eta * 100) + ' %')}`) +
      step(`<var>I</var><sub>cc</sub> = ${frac('<var>E</var>', '<var>R</var><sub>i</sub>')} = ${res(U(r.Icc, 'A'))}`, 'Corrente di cortocircuito: pericolosa, per questo esistono i fusibili.'),
  });
  m9.push({
    id: 'm9-part', title: 'Il partitore sotto carico', level: 3,
    gen: () => L.nice(() => ({ E: pick([10, 12, 15, 20, 24]), R1: pick([1, 2, 3, 4, 5, 6, 8, 10]) * 1000, R2: pick([1, 2, 3, 4, 5, 6, 8, 10]) * 1000, RL: pick([1, 2, 3, 4, 5, 6, 8, 10, 20]) * 1000 }),
      (p) => { const Vth = (p.E * p.R2) / (p.R1 + p.R2); const Rth = DC.par(p.R1, p.R2); return clean(Vth) && clean(Rth, 3) && clean((Vth * p.RL) / (Rth + p.RL), 3); }, { E: 12, R1: 7000, R2: 5000, RL: 5000 }),
    solve: (p) => { const Vth = (p.E * p.R2) / (p.R1 + p.R2); const Rth = DC.par(p.R1, p.R2); return { Vth, Rth, Vl: (Vth * p.RL) / (Rth + p.RL) }; },
    text: (p) => `Partitore: <var>E</var> = ${U(p.E, 'V')}, ${R_(1)} = ${U(p.R1, 'Ω')} in alto, ${R_(2)} = ${U(p.R2, 'Ω')} verso massa. All'uscita colleghi un carico <var>R</var><sub>L</sub> = ${U(p.RL, 'Ω')}. Quanto vale l'uscita a vuoto, e quanto con il carico? Usa Thevenin.`,
    fig: (p) => S.divider(p, { arrows: false }),
    asks: (p, r) => [h.qV('<var>V</var><sub>out</sub> a vuoto', r.Vth), h.qR('<var>R</var><sub>th</sub>', r.Rth), h.qV('<var>V</var><sub>out</sub> con carico', r.Vl)],
    steps: (p, r) => step(`<var>V</var><sub>th</sub> = <var>E</var>·${frac(R_(2), R_(1) + ' + ' + R_(2))} = ${res(U(r.Vth, 'V'))}`, 'A vuoto è il partitore del Modulo 2.') +
      step(`<var>R</var><sub>th</sub> = ${R_(1)} // ${R_(2)} = ${res(U(r.Rth, 'Ω'))}`, 'Spegni E (corto): da A-B vedi R₁ e R₂ in parallelo.') +
      step(`<var>V</var><sub>out</sub> = <var>V</var><sub>th</sub>·${frac('<var>R</var><sub>L</sub>', '<var>R</var><sub>th</sub> + <var>R</var><sub>L</sub>')} = ${res(U(r.Vl, 'V'))}`, 'Il carico abbassa l\'uscita: per un partitore "rigido" serve R_L molto più grande di R_th.'),
  });

  function widgetLoad(host) {
    const c = CC.widgetCard('Un equivalente, tanti carichi', 'Equivalente del circuito di riferimento: 16 V, 1,333 Ω');
    const t = DC.thevenin(DOC);
    const fig = document.createElement('div');
    const chart = document.createElement('div');
    const tbl = document.createElement('div');
    const rows = [];
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'btn ghost small';
    add.textContent = 'Aggiungi alla tabella';
    let cur = 4;
    const draw = (v) => {
      cur = v.RL;
      const I = t.Vth / (t.Rth + cur);
      fig.innerHTML = S.thevenin({ E: t.Vth, Rth: t.Rth, RL: cur }, { cur: { I }, hlRL: true }).svg;
      const ch = CC.chart({ W: 420, H: 200, xmax: 10, ymax: 50, xu: 'Ω', yu: 'W', xlabel: 'R_L', ylabel: 'P' });
      let d = '';
      for (let k = 1; k <= 200; k++) { const R = (10 * k) / 200; const P = (t.Vth ** 2 * R) / (t.Rth + R) ** 2; d += (k === 1 ? 'M' : 'L') + ch.X(R).toFixed(1) + ' ' + ch.Y(P).toFixed(1); }
      const P = I * I * cur;
      chart.innerHTML = `<svg class="chart" viewBox="0 0 420 200" role="img" style="width:100%;height:auto"><title>Potenza sul carico al variare di R_L</title>${ch.s}<path class="gen" d="${d}"/>
        <line class="guide" x1="${ch.X(t.Rth)}" y1="${ch.Y(0)}" x2="${ch.X(t.Rth)}" y2="${ch.Y(48)}"/><text class="small" x="${ch.X(t.Rth) + 4}" y="${ch.Y(46)}">R_L = R_th</text>
        <circle class="op" cx="${ch.X(Math.min(cur, 10))}" cy="${ch.Y(P)}" r="5.5"/></svg>`;
    };
    const drawTable = () => {
      tbl.innerHTML = rows.length ? L.rivp(rows.map((r) => ({ name: 'R<sub>L</sub> = ' + App.si(r.RL, 'Ω'), R: r.RL, I: r.I, V: r.V, P: r.P }))) : '<p class="hint">Scegli un carico e premi "Aggiungi alla tabella": ogni riga è un solo calcolo, <var>I</var> = 16 / (1,333 + <var>R</var><sub>L</sub>).</p>';
    };
    const sl = CC.sliders(c, [{ id: 'RL', label: 'Carico <var>R</var><sub>L</sub> (Ω)', min: 0.2, max: 10, step: 0.1, value: 4 }], draw);
    add.addEventListener('click', () => {
      const I = t.Vth / (t.Rth + cur);
      rows.push({ RL: cur, I, V: I * cur, P: I * I * cur });
      if (rows.length > 6) rows.shift();
      drawTable();
    });
    c.append(fig, chart, add, tbl);
    host.appendChild(c);
    draw(sl.values);
    drawTable();
  }

  CC.lessons.push({
    id: 'm9', short: 'Thevenin', title: 'Thevenin, Norton e generatore reale', num: 9,
    intro: 'Qualsiasi rete lineare vista da due morsetti A-B equivale a un generatore di tensione con una resistenza in serie (Thevenin) oppure a un generatore di corrente con una resistenza in parallelo (Norton). Per il circuito del Modulo 5, visto da R₃: Vth = 16 V, Rth = 1,333 Ω.',
    goals: ['Vth a vuoto', 'Rth a generatori spenti', 'Norton', 'Generatore reale e partitore sotto carico'],
    widgets: [widgetLoad],
    example: m9[0], exampleTitle: 'Esempio 9.1 — Thevenin sul carico R₃',
    families: m9,
    theory: `
      <article class="note"><h4>Procedura di Thevenin</h4>
        <ol>
          <li>Stacca il carico: A e B restano aperti.</li>
          <li><var>V</var><sub>th</sub> = tensione a vuoto tra A e B (con un metodo qualsiasi).</li>
          <li><var>R</var><sub>th</sub> = resistenza vista da A-B con i generatori spenti (tensione → corto, corrente → aperto).</li>
          <li>Ricollega il carico: <span class="f"><var>I</var> = <var>V</var><sub>th</sub> / (<var>R</var><sub>th</sub> + <var>R</var><sub>L</sub>)</span>.</li>
        </ol></article>
      <article class="note"><h4>Norton</h4>
        <div class="eq"><span><var>R</var><sub>n</sub> = <var>R</var><sub>th</sub></span><span><var>I</var><sub>n</sub> = ${frac('<var>V</var><sub>th</sub>', '<var>R</var><sub>th</sub>')}</span></div>
        <p><var>I</var><sub>n</sub> è la corrente di cortocircuito tra A e B.</p></article>
      <article class="note"><h4>Generatore reale</h4>
        <div class="eq"><span><var>V</var><sub>AB</sub> = <var>E</var> − <var>R</var><sub>i</sub>·<var>I</var></span><span><var>I</var><sub>cc</sub> = <var>E</var>/<var>R</var><sub>i</sub></span></div>
        <p>Una batteria è già un equivalente di Thevenin: <var>E</var> a vuoto, <var>R</var><sub>i</sub> in serie. Prova anche il <a href="#circuito" data-route="circuito">laboratorio del circuito</a>.</p></article>`,
  });
})();
