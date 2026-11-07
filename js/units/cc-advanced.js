/* Reti in corrente continua — Moduli 10–11, confronto dei metodi, verifica, scelta del metodo */
(function () {
  'use strict';
  const App = window.App;
  const DC = window.DC;
  const S = App.Schem.T;
  const L = App.Lessons;
  const { N, U, V, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const clean = DC.clean;
  const CC = App.CC;
  const h = CC.h;
  const R_ = (k) => V('R' + k);
  const I_ = (k) => V('I' + k);
  const E_ = (k) => V('E' + k);
  const Req = '<var>R</var><sub>eq</sub>';

  // =====================================================================
  // MODULO 10 — Stella-triangolo e ponte di Wheatstone
  // =====================================================================
  const m10 = [];
  const DY_R = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100];
  m10.push({
    id: 'm10-dy', title: 'Da triangolo a stella', level: 2,
    defaults: { Rac: 20, Rad: 30, Rcd: 50 },
    gen: () => L.nice(() => ({ Rac: pick(DY_R), Rad: pick(DY_R), Rcd: pick(DY_R) }), (p) => { const t = DC.deltaToStar(p.Rac, p.Rad, p.Rcd); return clean(t.Ra) && clean(t.Rb) && clean(t.Rc); }, { Rac: 20, Rad: 30, Rcd: 50 }),
    solve: (p) => { const t = DC.deltaToStar(p.Rac, p.Rad, p.Rcd); return { S: t.S, Ra: t.Ra, Rc: t.Rb, Rd: t.Rc }; },
    text: (p) => `Triangolo con <var>R</var><sub>AC</sub> = ${N(p.Rac)} Ω, <var>R</var><sub>AD</sub> = ${N(p.Rad)} Ω, <var>R</var><sub>CD</sub> = ${N(p.Rcd)} Ω. Trova la stella equivalente.`,
    fig: (p, r, sol) => S.deltaStar(p, { star: sol ? r : null }),
    asks: (p, r) => [h.qR('<var>R</var><sub>A</sub>', r.Ra), h.qR('<var>R</var><sub>C</sub>', r.Rc), h.qR('<var>R</var><sub>D</sub>', r.Rd)],
    hint: () => 'Ogni resistenza della stella = prodotto dei due lati che toccano quel nodo / somma dei tre lati.',
    steps: (p, r) => step(`Σ = ${N(p.Rac)} + ${N(p.Rad)} + ${N(p.Rcd)} = ${N(r.S)} Ω`) +
      step(`<var>R</var><sub>A</sub> = ${frac('<var>R</var><sub>AC</sub>·<var>R</var><sub>AD</sub>', 'Σ')} = ${frac(N(p.Rac) + '·' + N(p.Rad), N(r.S))} = ${res(U(r.Ra, 'Ω'))}`, 'Al nodo A arrivano i lati AC e AD.') +
      step(`<var>R</var><sub>C</sub> = ${frac(N(p.Rac) + '·' + N(p.Rcd), N(r.S))} = ${res(U(r.Rc, 'Ω'))}; <var>R</var><sub>D</sub> = ${frac(N(p.Rad) + '·' + N(p.Rcd), N(r.S))} = ${res(U(r.Rd, 'Ω'))}`),
  });
  m10.push({
    id: 'm10-yd', title: 'Da stella a triangolo', level: 2,
    gen: () => L.nice(() => ({ Ra: pick(DY_R), Rc: pick(DY_R), Rd: pick(DY_R) }), (p) => { const d = DC.starToDelta(p.Ra, p.Rc, p.Rd); return clean(d.Rab) && clean(d.Rac) && clean(d.Rbc); }, { Ra: 6, Rc: 10, Rd: 15 }),
    solve: (p) => { const d = DC.starToDelta(p.Ra, p.Rc, p.Rd); return { P: d.P, Rac: d.Rab, Rad: d.Rac, Rcd: d.Rbc }; },
    text: (p) => `Stella con <var>R</var><sub>A</sub> = ${N(p.Ra)} Ω, <var>R</var><sub>C</sub> = ${N(p.Rc)} Ω, <var>R</var><sub>D</sub> = ${N(p.Rd)} Ω. Trova il triangolo equivalente.`,
    fig: (p, r, sol) => S.deltaStar(sol ? r : { Rac: '?', Rad: '?', Rcd: '?' }, { star: { Ra: p.Ra, Rc: p.Rc, Rd: p.Rd } }),
    asks: (p, r) => [h.qR('<var>R</var><sub>AC</sub>', r.Rac), h.qR('<var>R</var><sub>AD</sub>', r.Rad), h.qR('<var>R</var><sub>CD</sub>', r.Rcd)],
    hint: () => 'Ogni lato = somma dei prodotti a coppie / resistenza della stella opposta a quel lato.',
    steps: (p, r) => step(`Somma dei prodotti a coppie: ${N(p.Ra)}·${N(p.Rc)} + ${N(p.Ra)}·${N(p.Rd)} + ${N(p.Rc)}·${N(p.Rd)} = ${N(r.P)}`) +
      step(`<var>R</var><sub>AC</sub> = ${frac(N(r.P), '<var>R</var><sub>D</sub>')} = ${res(U(r.Rac, 'Ω'))}`, 'Il lato AC è opposto al ramo della stella che va in D.') +
      step(`<var>R</var><sub>AD</sub> = ${frac(N(r.P), '<var>R</var><sub>C</sub>')} = ${res(U(r.Rad, 'Ω'))}; <var>R</var><sub>CD</sub> = ${frac(N(r.P), '<var>R</var><sub>A</sub>')} = ${res(U(r.Rcd, 'Ω'))}`),
  });

  const BR_R = [10, 20, 25, 30, 40, 50, 60, 75, 100];
  const bridgeGen = () => L.nice(() => ({ E: pick([10, 12, 20, 24, 30, 40]), R1: pick(BR_R), R2: pick(BR_R), R3: pick(BR_R), R4: pick(BR_R), R5: pick(BR_R) }),
    (p) => { const b = DC.bridgeDeltaStar(p); return clean(b.Req) && h.twoDec(b.I) && Math.abs(b.I5) > 0.009 && h.twoDec(b.I5) && clean(b.VC) && clean(b.VD) && clean(b.RA) && clean(b.RC) && clean(b.RD); },
    { E: 30, R1: 20, R2: 30, R3: 50, R4: 25, R5: 50 });
  const bridgeSteps = (p) => {
    const b = DC.bridgeDeltaStar(p);
    return step(`Triangolo A-C-D (${R_(1)}, ${R_(2)}, ${R_(5)}): Σ = ${N(b.S)} Ω; <var>R</var><sub>A</sub> = ${N(b.RA)} Ω, <var>R</var><sub>C</sub> = ${N(b.RC)} Ω, <var>R</var><sub>D</sub> = ${N(b.RD)} Ω`, 'Nel ponte nessun resistore è in serie o in parallelo: si trasforma un triangolo in stella.') +
      step(`Dal centro stella partono due rami verso B: ${N(b.RC)} + ${N(p.R3)} = ${N(b.left)} Ω e ${N(b.RD)} + ${N(p.R4)} = ${N(b.right)} Ω → parallelo ${N(b.Rp)} Ω`) +
      step(`${Req} = ${N(b.RA)} + ${N(b.Rp)} = ${res(U(b.Req, 'Ω'))}; <var>I</var> = ${frac(N(p.E), N(b.Req))} = ${res(U(b.I, 'A'))}`) +
      step(`${I_(3)} = ${N(b.I)}·${frac(N(b.right), N(b.left + b.right))} = ${U(b.I3, 'A')}; ${I_(4)} = ${U(b.I4, 'A')}`, 'Partitore di corrente sui due rami.') +
      step(`<var>V</var><sub>C</sub> = ${R_(3)}·${I_(3)} = ${res(U(b.VC, 'V'))}; <var>V</var><sub>D</sub> = ${R_(4)}·${I_(4)} = ${res(U(b.VD, 'V'))}`) +
      step(`${I_(1)} = ${frac(N(p.E) + ' − ' + N(b.VC), N(p.R1))} = ${U(b.I1, 'A')}; ${I_(2)} = ${frac(N(p.E) + ' − ' + N(b.VD), N(p.R2))} = ${U(b.I2, 'A')}; ${I_(5)} = ${frac(N(b.VC) + ' − ' + N(b.VD), N(p.R5))} = ${res(U(b.I5, 'A'))}`, 'Torna al circuito vero: le altre correnti con Ohm. ' + (Math.abs(b.I5) < 1e-9 ? 'I₅ = 0: il ponte è bilanciato.' : b.I5 > 0 ? 'I₅ va da C verso D.' : 'I₅ è negativa: va da D verso C.')) +
      step(`Nodo C: ${N(b.I1)} = ${N(b.I3)} + ${N(b.I5)}${ok}`);
  };
  m10.push({
    id: 'm10-ponte', title: 'Ponte non bilanciato', level: 3,
    defaults: { E: 30, R1: 20, R2: 30, R3: 50, R4: 25, R5: 50 },
    gen: bridgeGen,
    solve: (p) => DC.bridgeDeltaStar(p),
    text: (p) => `<var>E</var> = ${U(p.E, 'V')}, ${R_(1)} = ${N(p.R1)} Ω (A-C), ${R_(2)} = ${N(p.R2)} Ω (A-D), ${R_(3)} = ${N(p.R3)} Ω (C-B), ${R_(4)} = ${N(p.R4)} Ω (D-B), ${R_(5)} = ${N(p.R5)} Ω (C-D). Trova ${Req}, la corrente totale, i potenziali di C e D e la corrente in ${R_(5)} (positiva da C verso D).`,
    fig: (p, r, sol) => S.bridge(p, { cur: sol ? { I: r.I, I5: r.I5 } : null }),
    asks: (p, r) => [h.qR(Req, r.Req), h.qI(I_(''), r.I), h.qV('<var>V</var><sub>C</sub>', r.VC), h.qV('<var>V</var><sub>D</sub>', r.VD), h.qI(I_(5), r.I5)],
    hint: () => 'Trasforma il triangolo A-C-D (R₁, R₂, R₅) in una stella: il circuito torna riducibile.',
    steps: (p) => bridgeSteps(p),
    table: (p) => L.rivpFromNet(DC.nets.bridge(p), DC.solve(DC.nets.bridge(p))),
  });
  m10.push({
    id: 'm10-bil', title: 'Bilancia il ponte', level: 2,
    gen: () => L.nice(() => ({ E: pick([10, 12, 15, 20, 24, 30]), R1: pick(BR_R), R2: pick(BR_R), R3: pick(BR_R) }), (p) => {
      const R4 = (p.R2 * p.R3) / p.R1;
      const Rq = DC.par(p.R1 + p.R3, p.R2 + R4);
      return clean(R4) && R4 >= 5 && R4 <= 500 && clean(Rq, 3) && clean(p.E / Rq, 3);
    }, { E: 30, R1: 20, R2: 30, R3: 50 }),
    solve: (p) => { const R4 = (p.R2 * p.R3) / p.R1; const Rq = DC.par(p.R1 + p.R3, p.R2 + R4); return { R4, Rq, I: p.E / Rq }; },
    text: (p) => `Nel ponte ${R_(1)} = ${N(p.R1)} Ω, ${R_(2)} = ${N(p.R2)} Ω, ${R_(3)} = ${N(p.R3)} Ω, <var>E</var> = ${U(p.E, 'V')}. Quanto deve valere ${R_(4)} perché in ${R_(5)} non passi corrente? Con quel valore, trova ${Req} e la corrente totale.`,
    fig: (p, r, sol) => S.bridge({ ...p, R4: sol ? r.R4 : '?', R5: 'qualsiasi' }, { arrows: false }),
    asks: (p, r) => [h.qR(R_(4), r.R4), h.qR(Req, r.Rq), h.qI(I_(''), r.I)],
    hint: () => 'Ponte bilanciato: R₁·R₄ = R₂·R₃. Poi R₅ si può togliere.',
    steps: (p, r) => step(`${R_(1)}·${R_(4)} = ${R_(2)}·${R_(3)} → ${R_(4)} = ${frac(N(p.R2) + '·' + N(p.R3), N(p.R1))} = ${res(U(r.R4, 'Ω'))}`, 'Condizione di equilibrio: V_C = V_D e in R₅ non passa corrente.') +
      step(`${Req} = (${N(p.R1)} + ${N(p.R3)}) // (${N(p.R2)} + ${N(r.R4)}) = ${res(U(r.Rq, 'Ω'))}`, 'Senza corrente in R₅ lo si può togliere: restano due serie in parallelo.') +
      step(`<var>I</var> = ${frac(N(p.E), N(r.Rq))} = ${res(U(r.I, 'A'))}`, 'È il principio con cui il ponte di Wheatstone misura una resistenza incognita.'),
  });

  function widgetGalv(host) {
    const c = CC.widgetCard('Il ponte di Wheatstone come strumento', 'Regola Rₓ finché il galvanometro segna zero');
    const p = { E: 12, R1: 100, R2: 200, R3: 150, R5: 50 };
    const target = (p.R2 * p.R3) / p.R1;
    const fig = document.createElement('div');
    const out = document.createElement('div');
    const fb = document.createElement('div');
    fb.className = 'feedback';
    let won = false;
    const draw = (v) => {
      const q = { ...p, R4: v.R4 };
      const s = DC.solve(DC.nets.bridge(q));
      const I5 = s.i.R5;
      fig.innerHTML = S.bridge({ ...q, R4: v.R4 }, { galv: I5 / 0.004, arrows: false }).svg.replace('<tspan class="sb" dy="4">4</tspan>', '<tspan class="sb" dy="4">x</tspan>');
      out.innerHTML = `<p class="f">${R_(1)}·<var>R</var><sub>x</sub> = ${N(p.R1)} · ${N(v.R4)} = ${N(p.R1 * v.R4)} &nbsp;&nbsp; ${R_(2)}·${R_(3)} = ${N(p.R2 * p.R3)}</p>
        <p class="f">Corrente nel galvanometro: ${res(U(I5, 'A'))} ${Math.abs(I5) < 2e-5 ? '' : I5 > 0 ? '(da C verso D)' : '(da D verso C)'}; <var>V</var><sub>C</sub> = ${U(s.v.C, 'V')}, <var>V</var><sub>D</sub> = ${U(s.v.D, 'V')}</p>`;
      if (!won && Math.abs(v.R4 - target) / target < 0.01) {
        won = true;
        App.feedback(fb, 'ok', 'Bilanciato!', `<var>R</var><sub>x</sub> = ${R_(2)}·${R_(3)}/${R_(1)} = ${N(target)} Ω. Con l'ago a zero i prodotti in croce sono uguali: così si misura una resistenza incognita.`);
        App.xp.add(15, 'Ponte di Wheatstone');
      }
    };
    const sl = CC.sliders(c, [{ id: 'R4', label: 'Resistenza incognita <var>R</var><sub>x</sub> (Ω)', min: 50, max: 1000, log: true, value: 150 }], draw);
    c.append(fig, out, fb);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm10', short: 'Stella-triangolo', title: 'Stella-triangolo e ponte di Wheatstone', num: 10,
    intro: 'Nel ponte nessun resistore è in serie o in parallelo con un altro: si trasforma un triangolo in una stella equivalente e il circuito torna riducibile.',
    goals: ['Triangolo → stella', 'Stella → triangolo', 'Ponte non bilanciato', 'Condizione di equilibrio'],
    widgets: [widgetGalv],
    example: m10[2], exampleTitle: 'Esempio 10.1 — ponte non bilanciato',
    families: m10,
    theory: `
      <article class="note"><h4>Triangolo → stella</h4>
        <p>Ogni resistenza della stella = prodotto dei due lati del triangolo che toccano quel nodo, diviso la somma dei tre lati.</p>
        <div class="eq"><span><var>R</var><sub>A</sub> = ${frac('<var>R</var><sub>AC</sub> · <var>R</var><sub>AD</sub>', '<var>R</var><sub>AC</sub> + <var>R</var><sub>AD</sub> + <var>R</var><sub>CD</sub>')}</span></div></article>
      <article class="note"><h4>Stella → triangolo</h4>
        <p>Ogni lato = somma dei prodotti a coppie della stella, diviso la resistenza della stella <strong>opposta</strong> a quel lato.</p>
        <div class="eq"><span><var>R</var><sub>AC</sub> = ${frac('<var>R</var><sub>A</sub><var>R</var><sub>C</sub> + <var>R</var><sub>A</sub><var>R</var><sub>D</sub> + <var>R</var><sub>C</sub><var>R</var><sub>D</sub>', '<var>R</var><sub>D</sub>')}</span></div></article>
      <article class="note"><h4>Ponte bilanciato</h4>
        <p>Il ponte è bilanciato quando <var>V</var><sub>C</sub> = <var>V</var><sub>D</sub>, cioè in <var>R</var><sub>5</sub> non passa corrente:</p>
        <div class="eq"><span><var>R</var><sub>1</sub> · <var>R</var><sub>4</sub> = <var>R</var><sub>2</sub> · <var>R</var><sub>3</sub></span></div>
        <p>Allora <var>R</var><sub>5</sub> si può togliere e il circuito diventa due serie in parallelo. È il principio del ponte di Wheatstone per misurare una resistenza incognita.</p></article>`,
  });

  // =====================================================================
  // MODULO 11 — Potenza, energia, massimo trasferimento
  // =====================================================================
  const m11 = [];
  m11.push({
    id: 'm11-bil', title: 'Bilancio delle potenze', level: 2,
    defaults: CC.DOC,
    gen: CC.twoGenGen,
    solve: (p) => { const s = DC.solve(DC.nets.twoGen(p)); return { s, P1: s.p.R1, P2: s.p.R2, P3: s.p.R3, PE1: s.p.E1, PE2: s.p.E2 }; },
    text: (p) => `${E_(1)} = ${N(p.E1)} V, ${R_(1)} = ${N(p.R1)} Ω, ${E_(2)} = ${N(p.E2)} V, ${R_(2)} = ${N(p.R2)} Ω, ${R_(3)} = ${N(p.R3)} Ω (circuito di riferimento). Trova la potenza di ogni resistore e di ogni generatore, e verifica il bilancio.`,
    fig: (p, r, sol) => S.twoGen(p, sol ? { cur: { I1: r.s.i.R1, I2: r.s.i.R2, I3: r.s.i.R3 } } : {}),
    asks: (p, r) => [h.qP(V('P1'), r.P1), h.qP(V('P2'), r.P2), h.qP(V('P3'), r.P3), h.qP('Potenza di ' + E_(1), Math.abs(r.PE1)), h.qP('Potenza di ' + E_(2), Math.abs(r.PE2)),
      h.choice(E_(2), ['eroga', 'assorbe', 'né l\'uno né l\'altro'], Math.abs(r.PE2) < 1e-9 ? 2 : r.PE2 > 0 ? 0 : 1)],
    hint: () => 'Prima le correnti (un metodo qualsiasi dei moduli 5–9). Poi P = R·I² sui resistori e P = E·I sui generatori.',
    steps: (p, r) => {
      const b = DC.branch(p);
      const er = [r.PE1, r.PE2].filter((x) => x > 0).reduce((a, x) => a + x, 0);
      const as = r.P1 + r.P2 + r.P3 + [r.PE1, r.PE2].filter((x) => x < 0).reduce((a, x) => a - x, 0);
      return step(`Correnti: ${I_(1)} = ${U(b.I1, 'A')}, ${I_(2)} = ${U(b.I2, 'A')}, ${I_(3)} = ${U(b.I3, 'A')}`, 'Dai moduli precedenti, con un metodo qualsiasi.') +
        step(`${E_(1)}: la corrente ${b.I1 >= 0 ? 'esce dal +' : 'entra nel +'} → ${b.I1 >= 0 ? 'eroga' : 'assorbe'} ${N(p.E1)} · ${N(Math.abs(b.I1))} = ${res(U(Math.abs(r.PE1), 'W'))}`) +
        step(`${E_(2)}: la corrente ${b.I2 >= 0 ? 'esce dal +' : 'entra nel +'} → ${b.I2 >= 0 ? 'eroga' : 'assorbe'} ${N(p.E2)} · ${N(Math.abs(b.I2))} = ${res(U(Math.abs(r.PE2), 'W'))}`) +
        step(`${V('P1')} = ${N(p.R1)}·${N(b.I1)}² = ${res(U(r.P1, 'W'))}; ${V('P2')} = ${res(U(r.P2, 'W'))}; ${V('P3')} = ${res(U(r.P3, 'W'))}`) +
        step(`Erogate ${N(er)} W = assorbite ${N(as)} W${ok}`, 'Il bilancio delle potenze è la verifica finale più affidabile.');
    },
    table: (p) => L.rivpFromNet(DC.nets.twoGen(p), DC.solve(DC.nets.twoGen(p))),
  });
  m11.push({
    id: 'm11-en', title: 'Energia e costo', level: 1,
    defaults: { P: 36, t: 2, c: 0.25 },
    gen: () => ({ P: pick([36, 60, 100, 500, 1000, 1500, 2000]), t: pick([0.5, 1, 2, 3, 4, 8]), c: pick([0.2, 0.25, 0.3]) }),
    solve: (p) => ({ kWh: (p.P * p.t) / 1000, J: p.P * p.t * 3600, eur: ((p.P * p.t) / 1000) * p.c }),
    text: (p) => `Un utilizzatore assorbe ${U(p.P, 'W')} per ${N(p.t)} ore. Quanta energia consuma, in kWh e in joule? Quanto costa con l'energia a ${N(p.c)} €/kWh?`,
    asks: (p, r) => [{ label: 'Energia', unit: 'kWh', value: r.kWh }, { label: 'Energia', unit: 'MJ', value: r.J / 1e6 }, { label: 'Costo', unit: '€', value: r.eur }],
    steps: (p, r) => step(`<var>W</var> = <var>P</var>·<var>t</var> = ${N(p.P)} W · ${N(p.t)} h = ${N(p.P * p.t)} Wh = ${res(N(r.kWh) + ' kWh')}`) +
      step(`In joule (1 h = 3600 s): ${N(p.P)} · ${N(p.t * 3600)} s = ${N(r.J)} J = ${res(N(r.J / 1e6) + ' MJ')}`) +
      step(`Costo: ${N(r.kWh)} · ${N(p.c)} = ${res(N(r.eur) + ' €')}`),
  });
  m11.push({
    id: 'm11-max', title: 'Massimo trasferimento di potenza', level: 2,
    gen: () => L.nice(() => ({ Vth: pick([6, 8, 10, 12, 16, 20, 24]), Rth: pick([0.5, 1, 2, 4, 5, 8, 10]), k: pick([2, 3, 4]) }), (p) => clean((p.Vth * p.Vth) / (4 * p.Rth)), { Vth: 16, Rth: 4, k: 3 }),
    solve: (p) => {
      const Pmax = (p.Vth * p.Vth) / (4 * p.Rth);
      const RL = p.k * p.Rth;
      const I = p.Vth / (p.Rth + RL);
      return { Pmax, RL, P: I * I * RL, eta: RL / (p.Rth + RL) };
    },
    text: (p, r) => `Una rete ha <var>V</var><sub>th</sub> = ${N(p.Vth)} V e <var>R</var><sub>th</sub> = ${N(p.Rth)} Ω. Quale carico riceve la massima potenza, e quanta? Con un carico di ${N(r.RL)} Ω quanta potenza arriva e con che rendimento?`,
    fig: (p, r) => S.thevenin({ E: p.Vth, Rth: p.Rth, RL: '?' }, { arrows: false }),
    asks: (p, r) => [h.qR('<var>R</var><sub>L</sub> ottimo', p.Rth), h.qP('<var>P</var><sub>max</sub>', r.Pmax), h.qP('<var>P</var> con ' + N(r.RL) + ' Ω', r.P), { label: 'Rendimento con ' + N(r.RL) + ' Ω', unit: '%', value: r.eta * 100 }],
    steps: (p, r) => step(`<var>R</var><sub>L</sub> = <var>R</var><sub>th</sub> = ${res(N(p.Rth) + ' Ω')}`, 'Massimo trasferimento: carico uguale alla resistenza di Thevenin. Rendimento 50%.') +
      step(`<var>P</var><sub>max</sub> = ${frac('<var>V</var><sub>th</sub>²', '4 <var>R</var><sub>th</sub>')} = ${frac(N(p.Vth) + '²', '4 · ' + N(p.Rth))} = ${res(U(r.Pmax, 'W'))}`) +
      step(`Con ${N(r.RL)} Ω: <var>I</var> = ${frac(N(p.Vth), N(p.Rth + r.RL))} = ${U(p.Vth / (p.Rth + r.RL), 'A')}, <var>P</var> = ${res(U(r.P, 'W'))}, η = ${res(N(r.eta * 100) + ' %')}`, 'Meno potenza, ma rendimento più alto. Nelle reti di potenza si lavora lontano dal massimo trasferimento; nell\'elettronica dei segnali lo si cerca (adattamento).'),
  });

  function widgetPower(host) {
    const c = CC.widgetCard('Potenza o rendimento?', 'Le due curve al variare del carico');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'f widget-out';
    const draw = (v) => {
      const Pmax = (v.Vth * v.Vth) / (4 * v.Rth);
      const Rmax = 5 * v.Rth;
      const ch = CC.chart({ W: 440, H: 230, xmax: Rmax, ymax: CC.niceMax(Pmax * 1.1), xu: 'Ω', yu: 'W', xlabel: 'R_L', ylabel: 'P' });
      let dP = '', dE = '';
      for (let k = 1; k <= 200; k++) {
        const R = (Rmax * k) / 200;
        const P = (v.Vth ** 2 * R) / (v.Rth + R) ** 2;
        const eta = R / (v.Rth + R);
        dP += (k === 1 ? 'M' : 'L') + ch.X(R).toFixed(1) + ' ' + ch.Y(P).toFixed(1);
        dE += (k === 1 ? 'M' : 'L') + ch.X(R).toFixed(1) + ' ' + ch.Y(eta * CC.niceMax(Pmax * 1.1)).toFixed(1);
      }
      const RL = Math.min(v.RL, Rmax);
      const I = v.Vth / (v.Rth + RL);
      const P = I * I * RL;
      const eta = RL / (v.Rth + RL);
      fig.innerHTML = `<svg class="chart" viewBox="0 0 440 230" role="img" style="width:100%;height:auto"><title>Potenza e rendimento in funzione del carico</title>${ch.s}
        <path class="gen" d="${dP}"/><path class="load" d="${dE}" stroke-dasharray="5 4"/>
        <line class="guide" x1="${ch.X(v.Rth)}" y1="${ch.Y(0)}" x2="${ch.X(v.Rth)}" y2="${ch.Y(Pmax)}"/>
        <circle class="op" cx="${ch.X(RL)}" cy="${ch.Y(P)}" r="5.5"/></svg>
        <div class="legend"><span><i style="background:var(--pen)"></i>Potenza sul carico</span><span><i style="background:var(--energy)"></i>Rendimento (scala 0–100%)</span></div>`;
      out.innerHTML = `<var>R</var><sub>L</sub> = ${U(RL, 'Ω')}: <var>P</var> = ${res(U(P, 'W'))}, η = ${res(N(eta * 100, 3) + ' %')} &nbsp; · &nbsp; <var>P</var><sub>max</sub> = ${U(Pmax, 'W')} con <var>R</var><sub>L</sub> = <var>R</var><sub>th</sub>`;
    };
    const sl = CC.sliders(c, [
      { id: 'Vth', label: '<var>V</var><sub>th</sub> (V)', min: 1, max: 30, step: 0.5, value: 16 },
      { id: 'Rth', label: '<var>R</var><sub>th</sub> (Ω)', min: 0.5, max: 10, step: 0.1, value: 1.3 },
      { id: 'RL', label: '<var>R</var><sub>L</sub> (Ω)', min: 0.1, max: 50, step: 0.1, value: 4 },
    ], draw);
    c.append(fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm11', short: 'Potenza', title: 'Potenza, energia e massimo trasferimento', num: 11,
    intro: 'In ogni circuito la potenza erogata dai generatori è uguale a quella assorbita (resistori e generatori in carica): è la verifica finale più affidabile di qualsiasi esercizio.',
    goals: ['Chi eroga e chi assorbe', 'Energia e costo', 'Massimo trasferimento e rendimento'],
    widgets: [widgetPower],
    example: m11[0], exampleTitle: 'Esempio 11.1 — bilancio del circuito di riferimento',
    families: m11,
    theory: `
      <article class="note"><h4>Potenza ed energia</h4>
        <div class="eq"><span><var>P</var> = <var>V</var>·<var>I</var> = <var>R</var>·<var>I</var>² = ${frac('<var>V</var>²', '<var>R</var>')}</span><span><var>W</var> = <var>P</var>·<var>t</var></span><span>Σ <var>P</var><sub>erogate</sub> = Σ <var>P</var><sub>assorbite</sub></span></div></article>
      <article class="note"><h4>Eroga o assorbe?</h4>
        <ul><li>La corrente <strong>esce dal +</strong> → eroga <var>P</var> = <var>E</var>·<var>I</var>.</li><li>La corrente <strong>entra nel +</strong> → assorbe <var>P</var> = <var>E</var>·<var>I</var> (batteria in carica, motore).</li></ul></article>
      <article class="note"><h4>Massimo trasferimento di potenza</h4>
        <p>Il carico riceve il massimo quando la sua resistenza è uguale a quella di Thevenin; in quel punto il rendimento è solo del 50%.</p>
        <div class="eq"><span><var>R</var><sub>L</sub> = <var>R</var><sub>th</sub> ⇒ <var>P</var><sub>max</sub> = ${frac('<var>V</var><sub>th</sub>²', '4 <var>R</var><sub>th</sub>')}</span><span>η = ${frac('<var>P</var><sub>carico</sub>', '<var>P</var><sub>generata</sub>')}</span></div></article>`,
  });

  // =====================================================================
  // Cinque metodi a confronto
  // =====================================================================
  function widgetCompare(host) {
    const c = CC.widgetCard('Stesso circuito, cinque metodi', 'Cambia i valori: tutti gli svolgimenti si ricalcolano');
    let p = { ...CC.DOC };
    let method = 'branch';
    const names = { branch: 'Correnti di ramo', mesh: 'Maglie', millman: 'Millman', superposition: 'Sovrapposizione', thevenin: 'Thevenin' };
    const inputs = document.createElement('div');
    inputs.className = 'mini-inputs';
    inputs.innerHTML = ['E1', 'R1', 'E2', 'R2', 'R3'].map((k) => `<label>${V(k)} <input class="input num" data-k="${k}" inputmode="decimal" value="${App.num(p[k])}"> <span class="unit">${k[0] === 'E' ? 'V' : 'Ω'}</span></label>`).join('');
    const btns = document.createElement('div');
    btns.className = 'row';
    btns.innerHTML = '<button type="button" class="btn ghost small" data-a="doc">Numeri del documento</button><button type="button" class="btn ghost small" data-a="rnd">Circuito casuale</button>';
    const fig = document.createElement('div');
    const summary = document.createElement('div');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Metodo');
    seg.innerHTML = Object.entries(names).map(([k, n]) => `<button type="button" data-m="${k}">${n}</button>`).join('');
    const stepsBox = document.createElement('ol');
    stepsBox.className = 'steps';
    const draw = () => {
      const b = DC.branch(p);
      fig.innerHTML = S.twoGen(p, { cur: { I1: b.I1, I2: b.I2, I3: b.I3 }, VA: b.VA }).svg;
      const rows = [['Correnti di ramo', DC.branch(p)], ['Maglie', DC.mesh(p)], ['Millman', DC.millman(p)], ['Sovrapposizione', DC.superposition(p)], ['Thevenin', { ...DC.thevenin(p), I1: NaN, I2: NaN }]];
      summary.innerHTML = `<div class="table-wrap"><table class="tbl"><thead><tr><th>Metodo</th><th>I₁</th><th>I₂</th><th>I₃</th><th>V_A</th></tr></thead><tbody>${rows.map(([n, r]) => `<tr><td>${n}</td><td>${Number.isNaN(r.I1) ? '—' : U(r.I1, 'A')}</td><td>${Number.isNaN(r.I2) ? '—' : U(r.I2, 'A')}</td><td>${U(r.I3, 'A')}</td><td>${U(r.VA, 'V')}</td></tr>`).join('')}</tbody></table></div>
        <p class="hint">Thevenin trova direttamente solo la corrente nel carico <var>R</var><sub>3</sub>: è il metodo giusto quando ti interessa un solo ramo.</p>`;
      stepsBox.innerHTML = CC.methods[method](p);
      seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.m === method)));
    };
    inputs.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => {
      const v = App.parseNum(inp.value);
      const okv = isFinite(v) && (inp.dataset.k[0] === 'E' ? v >= 0 && v <= 1000 : v > 0 && v <= 1e6);
      inp.classList.toggle('invalid', !okv);
      if (okv) { p[inp.dataset.k] = v; draw(); }
    }));
    const sync = () => inputs.querySelectorAll('input').forEach((inp) => { inp.value = App.num(p[inp.dataset.k]); inp.classList.remove('invalid'); });
    btns.addEventListener('click', (e) => {
      const a = e.target.dataset.a;
      if (!a) return;
      p = a === 'doc' ? { ...CC.DOC } : CC.twoGenGen();
      sync();
      draw();
    });
    seg.addEventListener('click', (e) => { if (e.target.dataset.m) { method = e.target.dataset.m; draw(); } });
    c.append(inputs, btns, fig, summary, seg, stepsBox);
    host.appendChild(c);
    draw();
  }

  CC.lessons.push({
    id: 'confronto', short: '5 metodi', title: 'Cinque metodi, un risultato', num: '★',
    intro: 'Il circuito di riferimento dei moduli 5–9 risolto con correnti di ramo, maglie, Millman, sovrapposizione e Thevenin. Cambia i valori e guarda le cinque colonne: coincidono sempre.',
    goals: ['Confrontare i metodi', 'Scegliere il più rapido'],
    widgets: [widgetCompare],
    families: [],
    theory: `
      <article class="note"><h4>Perché il risultato è sempre lo stesso</h4>
        <p>Tutti i metodi applicano le stesse leggi (Ohm e Kirchhoff) in un ordine diverso: cambiano le incognite scelte, non il circuito. Se due metodi danno risultati diversi, c'è un errore di segno o di calcolo.</p></article>
      <article class="note"><h4>Quante equazioni</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Metodo</th><th>Incognite</th><th>Equazioni</th></tr></thead><tbody>
          <tr><td>Correnti di ramo</td><td>3 correnti</td><td>1 nodo + 2 maglie</td></tr>
          <tr><td>Correnti di maglia</td><td><var>I</var><sub>a</sub>, <var>I</var><sub>b</sub></td><td>2</td></tr>
          <tr><td>Millman</td><td><var>V</var><sub>A</sub></td><td>1</td></tr>
          <tr><td>Sovrapposizione</td><td>—</td><td>2 circuiti semplici</td></tr>
          <tr><td>Thevenin</td><td><var>V</var><sub>th</sub>, <var>R</var><sub>th</sub></td><td>1 anello + 1 parallelo</td></tr>
        </tbody></table></div></article>`,
  });

  // =====================================================================
  // Esercizi di verifica (dal documento)
  // =====================================================================
  const byId = Object.fromEntries(CC.lessons.flatMap((l) => l.families || []).map((f) => [f.id, f]));
  const once = (fam, id, title, first) => {
    let used = false;
    return { ...fam, id, title, gen: () => { if (!used) { used = true; return JSON.parse(JSON.stringify(first)); } return fam.gen(); } };
  };
  const v5 = {
    ...byId['m9-th'],
    asks: (p, r) => [h.qV('<var>V</var><sub>th</sub>', r.Vth), h.qR('<var>R</var><sub>th</sub>', r.Rth), h.qI(I_(3), r.I3), h.qP('<var>P</var><sub>max</sub> trasferibile', (r.Vth * r.Vth) / (4 * r.Rth))],
    steps: (p, r) => byId['m9-th'].steps(p, r) + step(`<var>P</var><sub>max</sub> = ${frac('<var>V</var><sub>th</sub>²', '4<var>R</var><sub>th</sub>')} = ${res(U((r.Vth * r.Vth) / (4 * r.Rth), 'W'))}`, 'Con R_L = R_th.'),
  };
  const VERIFY = [
    ['m2-full', 'V1 · Serie', { E: 12, R: [1000, 2000, 3000] }],
    ['m3-full', 'V2 · Parallelo', { E: 6, R: [100, 150] }],
    ['m4-a', 'V3 · Misto', { E: 20, R1: 4, R2: 12, R3: 6, R4: 2 }],
    ['m7-millman', 'V4 · Millman', { E1: 12, R1: 6, E2: 6, R2: 3, R3: 6 }],
    ['m8-sov', 'V4 · verifica con la sovrapposizione', { E1: 12, R1: 6, E2: 6, R2: 3, R3: 6 }],
    [v5, 'V5 · Thevenin e potenza massima', { E1: 12, R1: 6, E2: 6, R2: 3, R3: 6 }],
    ['m9-reale', 'V6 · Pila reale', { E: 9, Rth: 1, RL: 8 }],
    ['m10-ponte', 'V7 · Ponte', { E: 12, R1: 100, R2: 200, R3: 150, R4: 300, R5: 1000 }],
  ];
  const verifyFams = () => VERIFY.map(([f, title, first], k) => once(typeof f === 'string' ? byId[f] : f, 'ver-' + (k + 1), title, first));

  CC.lessons.push({
    id: 'verifica', short: 'Verifica', title: 'Esercizi di verifica', num: '✓',
    intro: 'I sette esercizi di verifica del documento, uno per gruppo di moduli. Prova prima da solo su carta, disegna lo schema, poi scrivi i risultati. "Altro esercizio" ti dà un circuito nuovo dello stesso tipo.',
    goals: ['Ripasso di tutti i moduli', 'Correzione automatica'],
    widgets: [],
    families: verifyFams(),
    theory: `
      <article class="note"><h4>Come lavorare</h4>
        <ol>
          <li>Ridisegna lo schema e dai un nome a nodi, rami e resistenze.</li>
          <li>Converti le unità (kΩ → Ω, mA → A) prima di calcolare.</li>
          <li>Fissa massa e versi delle correnti; non cambiarli a metà.</li>
          <li>Risolvi con il metodo scelto, tenendo 3-4 cifre significative.</li>
          <li>Verifica la legge dei nodi e almeno una maglia, poi il bilancio delle potenze.</li>
        </ol>
        <p>Le risposte entro l'1,5% sono considerate giuste, così gli arrotondamenti non ti penalizzano.</p></article>`,
  });

  // =====================================================================
  // Quale metodo usare
  // =====================================================================
  function widgetChooser(host) {
    const c = CC.widgetCard('Quale metodo uso?', 'Rispondi a tre domande sul circuito');
    const Q = [
      { k: 'gen', q: 'Quanti generatori ci sono?', o: [['uno', 'Uno solo'], ['piu', 'Due o più']] },
      { k: 'red', q: 'Si riduce con soli serie e paralleli?', o: [['si', 'Sì'], ['no', 'No, ci sono ponti o triangoli']], when: (a) => a.gen === 'uno' },
      { k: 'nodi', q: 'Tutti i rami stanno tra due soli nodi?', o: [['si', 'Sì'], ['no', 'No']], when: (a) => a.gen === 'piu' },
      { k: 'uno', q: 'Ti interessa una sola resistenza, o il carico cambia?', o: [['si', 'Sì'], ['no', 'No, voglio tutte le correnti']] },
    ];
    const ans = {};
    const form = document.createElement('div');
    form.className = 'chooser';
    const out = document.createElement('div');
    out.className = 'feedback ok';
    const rec = () => {
      if (ans.uno === 'si') return ['Thevenin / Norton', 'm9', 'Riduci tutto il resto a un generatore equivalente: ogni nuovo carico è un solo calcolo.'];
      if (ans.gen === 'uno') return ans.red === 'no' ? ['Stella-triangolo', 'm10', 'Trasforma un triangolo in stella e il circuito torna riducibile.'] : ['Riduzione e risalita', 'm4', 'Serie, paralleli e partitori bastano.'];
      if (ans.nodi === 'si') return ['Millman', 'm7', 'Una sola equazione, poi solo Ohm.'];
      return ['Correnti di maglia', 'm6', 'Più generatori e poche maglie: meno equazioni delle correnti di ramo. La sovrapposizione è utile se vuoi capire il peso di ciascun generatore; le correnti di ramo funzionano sempre.'];
    };
    const draw = () => {
      form.innerHTML = Q.filter((q) => !q.when || q.when(ans)).map((q) => `<fieldset><legend>${q.q}</legend>${q.o.map(([v, t]) => `<label><input type="radio" name="ch-${q.k}" value="${v}" ${ans[q.k] === v ? 'checked' : ''}> ${t}</label>`).join('')}</fieldset>`).join('');
      form.querySelectorAll('input').forEach((i) => i.addEventListener('change', () => { ans[i.name.slice(3)] = i.value; draw(); }));
      const done = Q.filter((q) => !q.when || q.when(ans)).every((q) => ans[q.k]);
      if (done) {
        const [m, id, why] = rec();
        out.hidden = false;
        out.innerHTML = `<span class="stamp">${m}</span><div>${why} <a href="#cc-${id}" data-route="cc-${id}">Vai al modulo</a></div>`;
      } else out.hidden = true;
    };
    c.append(form, out);
    host.appendChild(c);
    draw();
  }

  CC.lessons.push({
    id: 'metodo', short: 'Metodo', title: 'Formulario e scelta del metodo', num: 'Σ',
    intro: 'Tutte le formule delle reti in corrente continua, una guida per scegliere il metodo più rapido e la checklist da seguire in ogni esercizio.',
    goals: ['Formulario', 'Scelta del metodo', 'Checklist'],
    widgets: [widgetChooser],
    families: [],
    theory: `
      <article class="note"><h4>Quale metodo usare</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Il circuito ha…</th><th>Metodo più rapido</th></tr></thead><tbody>
          <tr><td>Un solo generatore, solo serie e paralleli</td><td>Riduzione e risalita (moduli 2–4)</td></tr>
          <tr><td>Tutti i rami tra due soli nodi</td><td>Millman (modulo 7)</td></tr>
          <tr><td>Più generatori e poche maglie</td><td>Correnti di maglia (modulo 6)</td></tr>
          <tr><td>…e vuoi capire il peso di ciascuno</td><td>Sovrapposizione (modulo 8)</td></tr>
          <tr><td>Ti interessa una sola resistenza, o il carico cambia</td><td>Thevenin / Norton (modulo 9)</td></tr>
          <tr><td>Triangoli o ponti non riducibili</td><td>Stella-triangolo (modulo 10)</td></tr>
          <tr><td>Nessuna scorciatoia</td><td>Correnti di ramo (modulo 5): funziona sempre</td></tr>
        </tbody></table></div></article>
      <article class="note"><h4>Formule</h4>
        <div class="table-wrap"><table class="tbl"><tbody>
          <tr><td>Legge di Ohm</td><td class="f"><var>V</var> = <var>R</var>·<var>I</var></td></tr>
          <tr><td>Potenza</td><td class="f"><var>P</var> = <var>V</var>·<var>I</var> = <var>R</var>·<var>I</var>² = <var>V</var>²/<var>R</var></td></tr>
          <tr><td>Energia</td><td class="f"><var>W</var> = <var>P</var>·<var>t</var></td></tr>
          <tr><td>Serie</td><td class="f">${Req} = Σ <var>R</var><sub><var>k</var></sub></td></tr>
          <tr><td>Partitore di tensione</td><td class="f"><var>V</var><sub><var>k</var></sub> = <var>E</var>·<var>R</var><sub><var>k</var></sub>/${Req}</td></tr>
          <tr><td>Parallelo</td><td class="f">1/${Req} = Σ 1/<var>R</var><sub><var>k</var></sub></td></tr>
          <tr><td>Partitore di corrente</td><td class="f"><var>I</var><sub>1</sub> = <var>I</var>·<var>R</var><sub>2</sub>/(<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>)</td></tr>
          <tr><td>LKC, LKT</td><td class="f">Σ <var>I</var><sub>entr</sub> = Σ <var>I</var><sub>usc</sub>; Σ <var>E</var> = Σ <var>R</var>·<var>I</var></td></tr>
          <tr><td>Millman</td><td class="f"><var>V</var><sub>AB</sub> = Σ(<var>E</var><sub><var>k</var></sub>/<var>R</var><sub><var>k</var></sub>) / Σ(1/<var>R</var><sub><var>k</var></sub>)</td></tr>
          <tr><td>Thevenin, Norton</td><td class="f"><var>I</var> = <var>V</var><sub>th</sub>/(<var>R</var><sub>th</sub> + <var>R</var><sub>L</sub>); <var>I</var><sub>n</sub> = <var>V</var><sub>th</sub>/<var>R</var><sub>th</sub></td></tr>
          <tr><td>Generatore reale</td><td class="f"><var>V</var><sub>AB</sub> = <var>E</var> − <var>R</var><sub>i</sub>·<var>I</var>; <var>I</var><sub>cc</sub> = <var>E</var>/<var>R</var><sub>i</sub></td></tr>
          <tr><td>Triangolo → stella</td><td>prodotto dei due lati adiacenti / somma dei tre</td></tr>
          <tr><td>Stella → triangolo</td><td>somma dei prodotti a coppie / R stella opposta</td></tr>
          <tr><td>Ponte bilanciato</td><td class="f"><var>R</var><sub>1</sub>·<var>R</var><sub>4</sub> = <var>R</var><sub>2</sub>·<var>R</var><sub>3</sub></td></tr>
          <tr><td>Massimo trasferimento</td><td class="f"><var>R</var><sub>L</sub> = <var>R</var><sub>th</sub>; <var>P</var><sub>max</sub> = <var>V</var><sub>th</sub>²/(4<var>R</var><sub>th</sub>)</td></tr>
        </tbody></table></div></article>
      <article class="note"><h4>Checklist per ogni esercizio</h4>
        <ul class="checklist">
          <li><label><input type="checkbox"> Ridisegna lo schema e dai un nome a nodi, rami e resistenze.</label></li>
          <li><label><input type="checkbox"> Converti le unità (kΩ → Ω, mA → A) prima di calcolare.</label></li>
          <li><label><input type="checkbox"> Fissa massa e versi delle correnti; non cambiarli a metà.</label></li>
          <li><label><input type="checkbox"> Risolvi con il metodo scelto, tenendo 3-4 cifre significative.</label></li>
          <li><label><input type="checkbox"> Una corrente negativa va tenuta con il segno; il verso vero è l'opposto.</label></li>
          <li><label><input type="checkbox"> Verifica la legge dei nodi a ogni nodo e quella delle maglie su almeno una maglia.</label></li>
          <li><label><input type="checkbox"> Compila la tabella R, I, V, P e controlla il bilancio delle potenze.</label></li>
        </ul></article>`,
  });

  // Laboratorio già esistente (serie, parallelo, misto)
  CC.lessons.push({ id: 'lab', short: 'Laboratorio', title: 'Laboratorio: serie, parallelo, misto', num: '⚗', section: 'reti' });

  const ORDER = ['m1', 'm2', 'm3', 'm4', 'lab', 'm5', 'm6', 'm7', 'm8', 'm9', 'confronto', 'm10', 'm11', 'verifica', 'metodo'];
  CC.lessons.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'cc', year: '3', yearLabel: '3ª', title: 'Reti in corrente continua', route: 'cc-m1', notesTag: 'dal documento, con qualche aggiunta',
    desc: 'Dalla legge di Ohm a Thevenin e al ponte di Wheatstone: 11 moduli, cinque metodi sullo stesso circuito, verifica finale.',
    badge: 'Dal tuo documento',
    lessons: CC.lessons,
  });
})();
