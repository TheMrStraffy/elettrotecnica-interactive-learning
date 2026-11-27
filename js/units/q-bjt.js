/* 4ª — Transistor BJT e MOSFET */
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
  const REG = ['interdizione', 'attiva', 'saturazione'];
  const regCls = (r) => (r === 'saturazione' ? 'sat' : r === 'attiva' ? 'act' : 'off');
  const sub = (b, s) => `<var>${b}</var><sub>${s}</sub>`;
  const IB_ = sub('I', 'B');
  const IC_ = sub('I', 'C');
  const IE_ = sub('I', 'E');
  const VCE_ = sub('V', 'CE');

  /** Caratteristiche d'uscita (IC–VCE per alcune IB) con retta di carico e punto di lavoro. */
  function outChart(o) {
    const { VCC, RC, beta } = o;
    const RE = o.RE || 0;
    const ibs = o.ibs || [20e-6, 40e-6, 60e-6, 80e-6, 100e-6];
    // fondo scala diviso in 4 tacche con passo tondo (come i 3 V dell'asse VCE)
    const need = Math.max(VCC / (RC + RE), ibs.length ? beta * Math.max(...ibs) : 0, o.Q ? o.Q.IC : 0) * 1.1;
    const p10 = Math.pow(10, Math.floor(Math.log10(need)));
    const icMax = p10 * [1, 1.2, 1.6, 2, 2.4, 3.2, 4, 6, 8, 10].find((m) => m * p10 >= need * 0.999);
    const ch = K.chart({ W: 460, H: 250, xmax: VCC, ymax: icMax, xu: 'V', yu: 'A', xlabel: 'V<tspan class="sb" dy="3">CE</tspan>', ylabel: 'I<tspan class="sb" dy="3">C</tspan>', ticks: 4 });
    let s = ch.s;
    ibs.forEach((ib) => {
      let d = '';
      for (let k = 0; k <= 80; k++) {
        const v = (VCC * k) / 80;
        const ic = Math.min(icMax * 1.1, beta * ib * (1 - Math.exp(-v / 0.12)) * (1 + v / 120));
        d += (k ? 'L' : 'M') + ch.X(v).toFixed(1) + ' ' + ch.Y(ic).toFixed(1);
      }
      s += `<path class="ref" d="${d}"/><text class="wlbl" x="${ch.X(VCC) - 2}" y="${ch.Y(Math.min(icMax, beta * ib * (1 + VCC / 120))) - 4}" text-anchor="end">${N(ib * 1e6)} µA</text>`;
    });
    s += `<line class="load" x1="${ch.X(0)}" y1="${ch.Y(VCC / (RC + RE))}" x2="${ch.X(VCC)}" y2="${ch.Y(0)}"/>`;
    if (o.Q) s += `<line class="guide" x1="${ch.X(o.Q.VCE)}" y1="${ch.Y(0)}" x2="${ch.X(o.Q.VCE)}" y2="${ch.Y(o.Q.IC)}"/><circle class="op" cx="${ch.X(o.Q.VCE)}" cy="${ch.Y(o.Q.IC)}" r="5.5"/>`;
    return `<svg class="chart" viewBox="0 0 460 250" role="img" style="width:100%;height:auto"><title>Caratteristiche d'uscita e retta di carico</title>${s}</svg>`;
  }

  // =====================================================================
  // 1 — Il BJT
  // =====================================================================
  const b1 = [];
  b1.push({
    id: 'bjt-cur', title: 'Le correnti del transistor', level: 1,
    defaults: { m: 0, IB: 50e-6, beta: 200 },
    gen: () => ({ m: rand(0, 2), IB: pick([10, 20, 25, 40, 50, 80, 100]) * 1e-6, beta: pick([50, 80, 100, 150, 200, 250, 300]) }),
    solve: (p) => { const IC = p.beta * p.IB; return { IC, IE: IC + p.IB }; },
    text: (p, r) => [
      `In un transistor NPN la corrente di base è ${U(p.IB, 'A')} e quella di collettore ${U(r.IC, 'A')}. Quanto valgono il guadagno β e la corrente di emettitore?`,
      `Un transistor con β = ${p.beta} ha una corrente di base di ${U(p.IB, 'A')}. Quanto valgono ${IC_} e ${IE_} in zona attiva?`,
      `In un transistor con β = ${p.beta} la corrente di emettitore è ${U(r.IE, 'A')}. Quanto valgono la corrente di base e quella di collettore?`,
    ][p.m],
    asks: (p, r) => [
      [{ label: 'β', unit: '', value: p.beta }, h.qI(IE_, r.IE)],
      [h.qI(IC_, r.IC), h.qI(IE_, r.IE)],
      [h.qI(IB_, p.IB), h.qI(IC_, r.IC)],
    ][p.m],
    steps: (p, r) => [
      step(`β = ${frac(IC_, IB_)} = ${frac(U(r.IC, 'A'), U(p.IB, 'A'))} = ${res(N(p.beta))}`, 'β (o h<sub>FE</sub>) dice quante volte la corrente di collettore è più grande di quella di base.') + step(`${IE_} = ${IC_} + ${IB_} = ${res(U(r.IE, 'A'))}`, 'Kirchhoff: tutto quello che entra da base e collettore esce dall\'emettitore.'),
      step(`${IC_} = β ${IB_} = ${p.beta} · ${U(p.IB, 'A')} = ${res(U(r.IC, 'A'))}`, 'In zona attiva una piccola corrente di base comanda una corrente di collettore β volte più grande.') + step(`${IE_} = ${IC_} + ${IB_} = ${res(U(r.IE, 'A'))}`),
      step(`${IE_} = (β + 1) ${IB_} → ${IB_} = ${frac(IE_, 'β + 1')} = ${res(U(p.IB, 'A'))}`) + step(`${IC_} = β ${IB_} = ${res(U(r.IC, 'A'))}`, `Quasi uguale a I<sub>E</sub>: il rapporto α = I<sub>C</sub>/I<sub>E</sub> = ${N(p.beta / (p.beta + 1), 4)}.`),
    ][p.m],
  });
  b1.push({
    id: 'bjt-region', title: 'In che zona lavora?', level: 2,
    gen: () => {
      const want = rand(0, 2);
      return L.nice(() => ({ Vin: pick([0, 0.3, 1.2, 1.7, 2.5, 3.3, 5]), RB: pick([10, 22, 47, 100, 220, 470]) * 1000, VCC: pick([9, 12, 15]), RC: pick([470, 1000, 2200, 4700]), beta: pick([100, 150, 200]) }), (p) => REG.indexOf(SM.bjtSwitch(p.Vin, p.RB, p.VCC, p.RC, p.beta).region) === want, { Vin: 5, RB: 47000, VCC: 12, RC: 1000, beta: 100 });
    },
    solve: (p) => SM.bjtSwitch(p.Vin, p.RB, p.VCC, p.RC, p.beta),
    text: (p) => `Un NPN con β = ${p.beta} ha la base collegata a ${N(p.Vin)} V attraverso ${U(p.RB, 'Ω')}, l'emettitore a massa e il collettore a ${p.VCC} V attraverso ${U(p.RC, 'Ω')}. In che zona lavora? Quanto valgono ${IC_} e ${VCE_}?`,
    fig: (p, r, sol) => S.switch({ VCC: p.VCC, RC: p.RC, RB: p.RB, Vin: p.Vin }, { state: sol ? regCls(r.region) : null }),
    asks: (p, r) => [h.choice('Zona', REG, REG.indexOf(r.region)), h.qI(IC_, r.IC), h.qV(VCE_, r.VCE)],
    hint: () => 'Calcola IB, poi β·IB, e confrontala con la corrente massima che il collettore può portare: (VCC − 0,2)/RC.',
    steps: (p, r) => (r.region === 'interdizione'
      ? step(`<var>V</var><sub>in</sub> = ${N(p.Vin)} V < 0,7 V: la giunzione base-emettitore non conduce → ${res('interdizione')}`, 'Transistor spento: interruttore aperto.') + step(`${IC_} = ${res('0')}; ${VCE_} = <var>V</var><sub>CC</sub> = ${res(p.VCC + ' V')}`)
      : step(`${IB_} = ${frac('<var>V</var><sub>in</sub> − 0,7', '<var>R</var><sub>B</sub>')} = ${U(r.IB, 'A')}; β${IB_} = ${U(p.beta * r.IB, 'A')}`) +
        step(`${IC_}<sub>,sat</sub> = ${frac('<var>V</var><sub>CC</sub> − 0,2', '<var>R</var><sub>C</sub>')} = ${U(r.ICsat, 'A')}`, 'La corrente più grande che il circuito di collettore permette.') +
        (r.region === 'saturazione'
          ? step(`β${IB_} > ${IC_}<sub>,sat</sub> → ${res('saturazione')}: ${IC_} = ${res(U(r.IC, 'A'))}, ${VCE_} ≈ ${res('0,2 V')}`, 'La base "chiede" più corrente di quanta il collettore ne possa dare: interruttore chiuso.')
          : step(`β${IB_} < ${IC_}<sub>,sat</sub> → ${res('zona attiva')}: ${IC_} = ${res(U(r.IC, 'A'))}, ${VCE_} = <var>V</var><sub>CC</sub> − <var>R</var><sub>C</sub>${IC_} = ${res(U(r.VCE, 'V'))}`, 'Zona lineare: è quella usata negli amplificatori.'))),
  });
  b1.push({
    id: 'bjt-mc', title: 'Concetti sul BJT', level: 1,
    ...mc([
      ['In zona attiva…', ['IC = β IB e VCE è tra 0,2 V e VCC', 'IC = 0', 'VCE ≈ 0,2 V qualunque sia IB', 'la base non conduce'], 'È la zona dell\'amplificazione.'],
      ['Un transistor saturo si comporta come…', ['un interruttore chiuso (VCE ≈ 0,2 V)', 'un interruttore aperto', 'un generatore di tensione', 'un diodo in inversa'], 'Aumentare ancora IB non fa crescere IC.'],
      ['Nel simbolo dell\'NPN la freccia è…', ['sull\'emettitore e punta verso l\'esterno', 'sulla base', 'sul collettore', 'sull\'emettitore e punta verso l\'interno'], 'Nel PNP punta verso l\'interno: "Punta Nel Piatto".'],
      ['Il β di un transistor…', ['varia molto da esemplare a esemplare e con la temperatura', 'è sempre esattamente 100', 'dipende solo da RC', 'è uguale per tutti i BJT'], 'Per questo i circuiti buoni non dipendono dal valore esatto di β.'],
    ]),
  });

  function widgetBJT(host) {
    const c = K.widgetCard('Caratteristiche d\'uscita', 'VCC = 12 V: cambia la corrente di base e la resistenza di collettore');
    const grid = el('div', 'q-two');
    const sch = el('div');
    const fig = el('div');
    grid.append(sch, fig);
    const out = el('div', 'forms');
    const draw = (v) => {
      const IB = v.IB * 1e-6;
      const ICsat = (12 - 0.2) / v.RC;
      const region = IB <= 0 ? 'interdizione' : v.beta * IB >= ICsat ? 'saturazione' : 'attiva';
      const IC = region === 'interdizione' ? 0 : Math.min(v.beta * IB, ICsat);
      const VCE = region === 'saturazione' ? 0.2 : 12 - IC * v.RC;
      sch.innerHTML = S.switch({ VCC: 12, RC: v.RC, RB: '', Vin: null }, { state: regCls(region) }).svg;
      fig.innerHTML = outChart({ VCC: 12, RC: v.RC, beta: v.beta, Q: { VCE, IC } });
      out.innerHTML = `<div class="form-row"><span class="label">Punto di lavoro</span><div class="f">${IC_} = ${U(IC, 'A')}; ${VCE_} = ${U(VCE, 'V')}</div><span class="meta">Zona ${res(region)}. ${region === 'attiva' ? 'IC = β·IB: muovi IB e il punto scorre sulla retta di carico.' : region === 'saturazione' ? 'Il punto è nel "ginocchio" a sinistra: aumentare IB non serve più.' : 'Senza corrente di base il transistor è spento.'}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'IB', label: IB_ + ' (µA)', min: 0, max: 100, step: 1, value: 40 },
      { id: 'RC', label: '<var>R</var><sub>C</sub> (Ω)', min: 470, max: 10000, log: true, value: 1000 },
      { id: 'beta', label: 'β', min: 50, max: 300, step: 5, value: 150 },
    ], draw);
    c.append(grid, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'bjt', num: 1, short: 'BJT', title: 'Il transistor bipolare (BJT)',
    intro: 'Il transistor bipolare ha tre terminali: una piccola corrente nella base comanda una corrente molto più grande tra collettore ed emettitore. A seconda di quanto lo si "apre" lavora come interruttore o come amplificatore.',
    goals: ['IC = β IB e IE = IC + IB', 'Interdizione, zona attiva, saturazione', 'Caratteristiche d\'uscita e retta di carico'],
    widgets: [widgetBJT],
    example: b1[0], exampleTitle: 'Esempio: le tre correnti',
    families: b1,
    theory: `
      <article class="note"><h4>Correnti</h4>
        <div class="eq"><span>${IC_} = β ${IB_}</span><span>${IE_} = ${IC_} + ${IB_} = (β + 1) ${IB_}</span></div>
        <p>β (h<sub>FE</sub>) va da circa 50 a più di 300; in conduzione <var>V</var><sub>BE</sub> ≈ 0,7 V, come un diodo.</p></article>
      <article class="note"><h4>Tre zone</h4>
        <ul><li><strong>Interdizione</strong>: <var>V</var><sub>BE</sub> < 0,6 V, nessuna corrente: interruttore aperto.</li>
          <li><strong>Attiva</strong>: ${IC_} = β${IB_}, ${VCE_} tra 0,2 V e <var>V</var><sub>CC</sub>: amplificatore.</li>
          <li><strong>Saturazione</strong>: β${IB_} supera quello che il circuito permette, ${VCE_} ≈ 0,2 V: interruttore chiuso.</li></ul></article>
      <article class="note"><h4>Retta di carico</h4>
        <p>Il circuito di collettore impone ${VCE_} = <var>V</var><sub>CC</sub> − <var>R</var><sub>C</sub>${IC_}: la retta va da (<var>V</var><sub>CC</sub>, 0) a (0, <var>V</var><sub>CC</sub>/<var>R</var><sub>C</sub>). Il punto di lavoro è dove incontra la curva della ${IB_} imposta.</p></article>`,
  });

  // =====================================================================
  // 2 — Interruttore
  // =====================================================================
  const s2 = [];
  const LOADS = [
    { n: 'un LED (2 V) con 470 Ω', VCC: 12, I: (12 - 2 - 0.2) / 470 },
    { n: 'un relè da 12 V con bobina da 240 Ω', VCC: 12, I: 12 / 240 },
    { n: 'una lampadina da 12 V, 2,4 W', VCC: 12, I: 0.2 },
    { n: 'un cicalino da 5 V e 30 mA', VCC: 5, I: 0.03 },
    { n: 'un LED (2 V) con 150 Ω', VCC: 5, I: (5 - 2 - 0.2) / 150 },
  ];
  s2.push({
    id: 'sw-rb', title: 'Progetta la resistenza di base', level: 2,
    defaults: { l: 1, Vin: 5, beta: 100, k: 2 },
    gen: () => ({ l: rand(0, LOADS.length - 1), Vin: pick([5, 3.3]), beta: pick([50, 80, 100, 150]), k: pick([2, 3, 5]) }),
    solve: (p) => { const IC = LOADS[p.l].I; const IB = (p.k * IC) / p.beta; return { IC, IB, RB: (p.Vin - 0.7) / IB }; },
    text: (p) => `L'uscita di un microcontrollore (${N(p.Vin)} V) deve accendere ${LOADS[p.l].n} tramite un NPN con β minimo ${p.beta}. Con un fattore di sovrapilotaggio ${p.k} (per essere sicuri di saturare), quanto devono valere ${IB_} e <var>R</var><sub>B</sub>?`,
    fig: (p) => S.switch({ VCC: LOADS[p.l].VCC, RC: '', RB: '?', Vin: p.Vin, load: 'carico' }),
    asks: (p, r) => [h.qI(IB_, r.IB), h.qR('<var>R</var><sub>B</sub>', r.RB)],
    steps: (p, r) => step(`Corrente del carico: ${IC_} = ${res(U(r.IC, 'A'))}`, 'È la corrente che il transistor saturo deve far passare.') +
      step(`${IB_} = <var>k</var> · ${frac(IC_, 'β<sub>min</sub>')} = ${p.k} · ${frac(U(r.IC, 'A'), p.beta)} = ${res(U(r.IB, 'A'))}`, 'Si usa il β minimo del datasheet e si abbonda: così satura con qualunque esemplare.') +
      step(`<var>R</var><sub>B</sub> = ${frac('<var>V</var><sub>in</sub> − 0,7', IB_)} = ${frac(N(p.Vin - 0.7) + ' V', U(r.IB, 'A'))} = ${res(U(r.RB, 'Ω'))}`, 'Poi si sceglie il valore commerciale subito sotto (più corrente di base, saturazione più sicura).'),
  });
  s2.push({
    id: 'sw-check', title: 'Satura o no?', level: 2,
    gen: () => ({ l: rand(0, LOADS.length - 1), Vin: pick([5, 3.3]), beta: pick([50, 100, 200]), RB: pick([1, 2.2, 4.7, 10, 22, 47]) * 1000 }),
    solve: (p) => { const IC = LOADS[p.l].I; const IB = (p.Vin - 0.7) / p.RB; return { IC, IB, sat: p.beta * IB >= IC, ICmax: p.beta * IB }; },
    text: (p) => `Un NPN con β = ${p.beta} pilota ${LOADS[p.l].n}. La base è collegata a ${N(p.Vin)} V attraverso ${U(p.RB, 'Ω')}. Il transistor va in saturazione?`,
    asks: (p, r) => [h.qI(IB_, r.IB), h.choice('Il transistor', ['satura: il carico ha tutta la corrente', 'resta in zona attiva: il carico ha meno corrente'], r.sat ? 0 : 1)],
    steps: (p, r) => step(`${IB_} = (${N(p.Vin)} − 0,7) V / ${U(p.RB, 'Ω')} = ${res(U(r.IB, 'A'))}`) +
      step(`β${IB_} = ${U(r.ICmax, 'A')} ${r.sat ? '≥' : '<'} ${U(r.IC, 'A')} → ${res(r.sat ? 'satura' : 'non satura')}`, r.sat ? 'Il transistor può dare più corrente di quella che serve: fa da interruttore chiuso.' : 'In zona attiva il transistor scalda (VCE alta) e il carico lavora male: serve una RB più piccola o un transistor con β più alto (o un MOSFET).'),
  });
  s2.push({
    id: 'sw-pow', title: 'BJT o MOSFET: chi scalda meno', level: 1,
    gen: () => ({ I: pick([0.1, 0.2, 0.5, 1, 2]), Ron: pick([0.02, 0.05, 0.1, 0.2]), Vsat: pick([0.2, 0.3]) }),
    solve: (p) => ({ Pb: p.Vsat * p.I, Pm: p.I * p.I * p.Ron }),
    text: (p) => `Un carico assorbe ${U(p.I, 'A')}. Usando come interruttore un BJT saturo (${VCE_} = ${N(p.Vsat)} V) o un MOSFET acceso (<var>R</var><sub>DS(on)</sub> = ${U(p.Ron, 'Ω')}), quanta potenza dissipa ciascuno?`,
    asks: (p, r) => [h.qP('<var>P</var> BJT', r.Pb), h.qP('<var>P</var> MOSFET', r.Pm)],
    steps: (p, r) => step(`BJT: <var>P</var> = ${VCE_} · <var>I</var> = ${N(p.Vsat)} V · ${U(p.I, 'A')} = ${res(U(r.Pb, 'W'))}`) +
      step(`MOSFET: <var>P</var> = <var>R</var><sub>DS(on)</sub> <var>I</var>² = ${U(p.Ron, 'Ω')} · ${N(p.I)}² = ${res(U(r.Pm, 'W'))}`, r.Pm < r.Pb ? 'Il MOSFET scalda meno: per questo si usa con le correnti forti. In più il gate non assorbe corrente.' : 'Qui il MOSFET scalda di più: con correnti grandi conta molto avere una R_DS(on) bassa.'),
  });
  s2.push({
    id: 'sw-mc', title: 'Concetti sull\'interruttore', level: 1,
    ...mc([
      ['Perché si sceglie IB più grande del minimo necessario?', ['per saturare anche con un β più basso del previsto', 'per far durare di più il transistor', 'per ridurre la corrente del carico', 'perché la base non assorbe corrente'], 'Il fattore di sovrapilotaggio copre le differenze tra esemplari e la temperatura.'],
      ['Un MOSFET si comanda…', ['con la tensione tra gate e source (il gate non assorbe corrente in continua)', 'con la corrente di base', 'con la corrente di drain', 'solo con l\'alternata'], 'Basta superare la tensione di soglia; per accenderlo bene serve VGS ben sopra la soglia.'],
      ['Con un relè pilotato da un transistor si mette un diodo in parallelo alla bobina perché…', ['allo spegnimento la bobina genera una sovratensione che romperebbe il transistor', 'aumenta la corrente', 'fa accendere un LED', 'serve a raddrizzare'], 'È il diodo di ricircolo (o "volano"): ricordi l\'induttore che si oppone alle variazioni di corrente?'],
      ['Un transistor in zona attiva usato come interruttore…', ['dissipa molta potenza e scalda', 'non dissipa niente', 'si comporta come un corto', 'è la scelta migliore'], 'Interruttore = sempre saturo o interdetto.'],
    ]),
  });

  function widgetSwitch(host) {
    const c = K.widgetCard('Il transistor come interruttore', 'Un LED da 12 V comandato da un\'uscita a 5 V');
    let mos = false;
    let on = true;
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-m="0">BJT</button><button type="button" data-m="1">MOSFET</button>';
    const tog = el('label', 'switch');
    tog.innerHTML = '<input type="checkbox" checked><span class="track"></span><span>Uscita del microcontrollore a 1 (5 V)</span>';
    const sch = el('div', 'ex-fig');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const Vin = on ? 5 : 0;
      const ICsat = (12 - 2 - 0.2) / 470;
      let state;
      let IC;
      let msg;
      if (mos) {
        const conducting = Vin > 2;
        state = conducting ? 'sat' : 'off';
        IC = conducting ? ICsat : 0;
        msg = conducting ? `V<sub>GS</sub> = 5 V supera la soglia (2 V): il MOSFET conduce con R<sub>DS(on)</sub> ≈ 0,1 Ω e il gate non assorbe corrente.` : 'V<sub>GS</sub> = 0: il MOSFET è spento.';
      } else {
        const r = SM.bjtSwitch(Vin, v.RB * 1000, 12 - 2, 470, v.beta);
        state = regCls(r.region);
        IC = r.IC;
        const k = r.IB > 0 ? (v.beta * r.IB) / ICsat : 0;
        msg = r.region === 'interdizione' ? 'Base a 0 V: transistor interdetto, LED spento.' : r.region === 'saturazione' ? `Saturo: I<sub>B</sub> = ${U(r.IB, 'A')}, fattore di sovrapilotaggio ${N(k, 2)}.` : `Zona attiva: β·I<sub>B</sub> = ${U(v.beta * r.IB, 'A')} non basta per i ${U(ICsat, 'A')} del LED. Il LED è più debole e il transistor scalda: abbassa R<sub>B</sub>.`;
      }
      const bright = IC / ICsat;
      sch.innerHTML = S.switch({ VCC: 12, RC: 470, RB: mos ? null : v.RB * 1000, Vin, led: true, mos }, { on: bright > 0.05, state }).svg.replace('class="ray-on"', `class="ray-on" style="opacity:${App.clamp(bright, 0.15, 1)}"`);
      out.innerHTML = `<div class="form-row"><span class="label">LED</span><div class="f"><var>I</var> = ${res(U(IC, 'A'))} ${bright > 0.95 ? '(acceso pieno)' : bright > 0.05 ? '(acceso a metà)' : '(spento)'}</div><span class="meta">${msg}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.m === '1') === mos)));
      c.querySelectorAll('.fields .field').forEach((f) => { f.hidden = mos; });
    };
    const sl = K.sliders(c, [
      { id: 'RB', label: '<var>R</var><sub>B</sub> (kΩ)', min: 1, max: 100, log: true, value: 4.7 },
      { id: 'beta', label: 'β', min: 30, max: 300, step: 5, value: 100 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { mos = b.dataset.m === '1'; draw(last); } });
    tog.querySelector('input').addEventListener('change', (e) => { on = e.target.checked; draw(last); });
    c.querySelector('.card-head').after(seg);
    c.append(tog, sch, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'interruttore', num: 2, short: 'Interruttore', title: 'Il transistor come interruttore',
    intro: 'Un microcontrollore dà pochi milliampere: per accendere un relè, una lampadina o un motore serve un transistor che faccia da interruttore comandato, sempre o tutto acceso (saturo) o tutto spento (interdetto).',
    goals: ['Corrente di base e sovrapilotaggio', 'Verifica della saturazione', 'BJT e MOSFET a confronto'],
    widgets: [widgetSwitch],
    example: s2[0], exampleTitle: 'Esempio: pilotare un relè',
    families: s2,
    theory: `
      <article class="note"><h4>Progetto con il BJT</h4>
        <ol><li>Corrente del carico: ${IC_}.</li><li>${IB_} = <var>k</var> · ${IC_}/β<sub>min</sub>, con <var>k</var> da 2 a 5.</li><li><var>R</var><sub>B</sub> = (<var>V</var><sub>in</sub> − 0,7)/${IB_}, poi il valore commerciale più vicino per difetto.</li></ol></article>
      <article class="note"><h4>MOSFET</h4>
        <p>Si comanda in tensione: conduce quando <var>V</var><sub>GS</sub> supera la soglia <var>V</var><sub>th</sub>. Acceso è una piccola resistenza <var>R</var><sub>DS(on)</sub>, quindi dissipa <var>R</var><sub>DS(on)</sub><var>I</var>². Per i 3,3–5 V dei microcontrollori servono MOSFET "logic level".</p></article>
      <article class="note"><h4>Carichi induttivi</h4>
        <p>Relè e motori vogliono un diodo in antiparallelo alla bobina: quando il transistor si apre, la corrente dell'induttanza ha una strada per esaurirsi senza creare sovratensioni.</p></article>`,
  });

  // =====================================================================
  // 3 — Polarizzazione
  // =====================================================================
  const p3 = [];
  p3.push({
    id: 'pol-div', title: 'Polarizzazione a partitore', level: 2,
    defaults: { VCC: 12, R1: 47000, R2: 10000, RC: 2200, RE: 1000 },
    gen: () => L.nice(() => ({ VCC: pick([9, 12, 15]), R1: pick([22, 33, 47, 56, 68, 82, 100]) * 1000, R2: pick([4.7, 6.8, 8.2, 10, 12, 15]) * 1000, RC: pick([1, 1.5, 2.2, 3.3, 4.7]) * 1000, RE: pick([0.47, 0.68, 1, 1.5]) * 1000 }), (p) => { const r = SM.dividerBias(p.VCC, p.R1, p.R2, p.RC, p.RE); return r.VE > 0.3 && r.VCE > 1.5; }, { VCC: 12, R1: 47000, R2: 10000, RC: 2200, RE: 1000 }),
    solve: (p) => SM.dividerBias(p.VCC, p.R1, p.R2, p.RC, p.RE),
    text: (p) => `Nel circuito <var>V</var><sub>CC</sub> = ${p.VCC} V, <var>R</var><sub>1</sub> = ${U(p.R1, 'Ω')}, <var>R</var><sub>2</sub> = ${U(p.R2, 'Ω')}, <var>R</var><sub>C</sub> = ${U(p.RC, 'Ω')}, <var>R</var><sub>E</sub> = ${U(p.RE, 'Ω')}. Trascurando la corrente di base, trova ${sub('V', 'B')}, ${IC_} e ${VCE_}.`,
    fig: (p, r, sol) => S.bjtBias({ VCC: p.VCC, R1: p.R1, R2: p.R2, RC: p.RC, RE: p.RE }, sol ? { VB: r.VB, VE: r.VE, IC: r.IC } : {}),
    asks: (p, r) => [h.qV(sub('V', 'B'), r.VB), h.qI(IC_, r.IC), h.qV(VCE_, r.VCE)],
    steps: (p, r) => step(`${sub('V', 'B')} = <var>V</var><sub>CC</sub> ${frac('<var>R</var><sub>2</sub>', '<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>')} = ${res(U(r.VB, 'V'))}`, 'Partitore di tensione: la corrente di base è piccola rispetto a quella del partitore.') +
      step(`${sub('V', 'E')} = ${sub('V', 'B')} − 0,7 = ${U(r.VE, 'V')}; ${IE_} = ${frac(sub('V', 'E'), '<var>R</var><sub>E</sub>')} = ${U(r.IE, 'A')} ≈ ${res(IC_ + ' = ' + U(r.IC, 'A'))}`, 'La corrente la decide RE, non β: ecco perché il punto di lavoro è stabile.') +
      step(`${VCE_} = <var>V</var><sub>CC</sub> − ${IC_}(<var>R</var><sub>C</sub> + <var>R</var><sub>E</sub>) = ${res(U(r.VCE, 'V'))}`, 'Zona attiva, lontano da saturazione e interdizione: pronto per amplificare.'),
  });
  p3.push({
    id: 'pol-base', title: 'Polarizzazione con la sola RB', level: 1,
    gen: () => ({ VCC: pick([9, 12]), RB: pick([220, 330, 470, 680, 1000]) * 1000, RC: pick([1, 2.2, 3.3]) * 1000, b1: pick([100, 150]), b2: pick([200, 250, 300]) }),
    solve: (p) => { const a = SM.baseBias(p.VCC, p.RB, p.RC, p.b1); const b = SM.baseBias(p.VCC, p.RB, p.RC, p.b2); return { a, b }; },
    text: (p) => `Un NPN è polarizzato con una sola resistenza di base: <var>V</var><sub>CC</sub> = ${p.VCC} V, <var>R</var><sub>B</sub> = ${U(p.RB, 'Ω')}, <var>R</var><sub>C</sub> = ${U(p.RC, 'Ω')}. Quanto vale ${IC_} se β = ${p.b1}? E se si sostituisce il transistor con uno che ha β = ${p.b2}?`,
    asks: (p, r) => [h.qI(IC_ + ' (β = ' + p.b1 + ')', r.a.IC), h.qI(IC_ + ' (β = ' + p.b2 + ')', r.b.IC)],
    steps: (p, r) => step(`${IB_} = (${p.VCC} − 0,7)/${U(p.RB, 'Ω')} = ${U(r.a.IB, 'A')}`, 'La corrente di base è fissata da RB.') +
      step(`${IC_} = β${IB_}: con β = ${p.b1} → ${res(U(r.a.IC, 'A'))}; con β = ${p.b2} → ${res(U(r.b.IC, 'A'))}`, `Il punto di lavoro cambia del ${N((100 * (r.b.IC - r.a.IC)) / r.a.IC, 3)} %: questa polarizzazione dipende troppo da β. Il partitore con RE la rende stabile.`),
  });
  p3.push({
    id: 'pol-retta', title: 'La retta di carico statica', level: 2,
    gen: () => ({ VCC: pick([9, 12, 15]), RC: pick([1, 2.2, 3.3, 4.7]) * 1000, RE: pick([0.47, 1]) * 1000, IC: pick([0.5, 1, 1.5, 2]) / 1000 }),
    solve: (p) => ({ ICsat: p.VCC / (p.RC + p.RE), VCE: p.VCC - p.IC * (p.RC + p.RE) }),
    text: (p) => `Per un amplificatore con <var>V</var><sub>CC</sub> = ${p.VCC} V, <var>R</var><sub>C</sub> = ${U(p.RC, 'Ω')} e <var>R</var><sub>E</sub> = ${U(p.RE, 'Ω')}: dove la retta di carico taglia l'asse ${IC_}? Con ${IC_} = ${U(p.IC, 'A')}, dov'è il punto di lavoro?`,
    fig: (p, r, sol) => ({ svg: outChart({ VCC: p.VCC, RC: p.RC, RE: p.RE, beta: 1, ibs: [], Q: sol && r.VCE > 0 ? { VCE: r.VCE, IC: p.IC } : null }) }),
    asks: (p, r) => [h.qI(IC_ + ' di saturazione', r.ICsat), h.qV(VCE_ + ' nel punto Q', r.VCE)],
    steps: (p, r) => step(`${IC_}<sub>,sat</sub> = ${frac('<var>V</var><sub>CC</sub>', '<var>R</var><sub>C</sub> + <var>R</var><sub>E</sub>')} = ${res(U(r.ICsat, 'A'))}`, 'Punto sull\'asse verticale (VCE = 0).') +
      step(`${VCE_} = ${p.VCC} − ${U(p.IC, 'A')} · ${U(p.RC + p.RE, 'Ω')} = ${res(U(r.VCE, 'V'))}`, r.VCE > p.VCC * 0.35 && r.VCE < p.VCC * 0.65 ? 'Il punto è circa a metà retta: il segnale può oscillare quanto più possibile senza tagliarsi.' : 'Il punto non è a metà retta: il segnale si taglierà prima da una parte.'),
  });
  p3.push({
    id: 'pol-mc', title: 'Concetti sulla polarizzazione', level: 1,
    ...mc([
      ['Perché la polarizzazione a partitore con RE è stabile?', ['IC è fissata da VB e RE, quasi senza dipendere da β', 'RE aumenta β', 'il partitore elimina la corrente di base', 'perché RC è grande'], 'Se IC cresce, cresce VE, diminuisce VBE e la corrente torna giù: è una retroazione.'],
      ['Per amplificare il segnale il punto di lavoro conviene…', ['circa a metà della retta di carico', 'in saturazione', 'in interdizione', 'sull\'asse di VCE'], 'Così l\'uscita può salire e scendere della stessa quantità.'],
      ['La corrente nel partitore R1–R2 si sceglie…', ['almeno una decina di volte più grande di IB', 'uguale a IB', 'più piccola di IB', 'uguale a IC'], 'Così la base non "carica" il partitore e VB resta quella calcolata.'],
    ]),
  });

  function widgetBias(host) {
    const c = K.widgetCard('Polarizzazione a partitore', 'VCC = 12 V: muovi β e guarda quanto poco cambia IC');
    const grid = el('div', 'q-two');
    const sch = el('div');
    const fig = el('div');
    grid.append(sch, fig);
    const out = el('div', 'forms');
    const draw = (v) => {
      const p = { R1: v.R1 * 1000, R2: v.R2 * 1000, RC: v.RC * 1000, RE: v.RE * 1000 };
      const ap = SM.dividerBias(12, p.R1, p.R2, p.RC, p.RE, v.beta);
      const ex = SM.dividerBias(12, p.R1, p.R2, p.RC, p.RE, v.beta, 0.7, true);
      const sat = ex.VCE <= 0.2;
      const IC = sat ? (12 - 0.2) / (p.RC + p.RE) : ex.IC;
      const VCE = sat ? 0.2 : ex.VCE;
      sch.innerHTML = S.bjtBias({ VCC: 12, ...p }, { VB: ex.VB, VE: IC * p.RE, IC, state: sat ? 'sat' : 'act' }).svg;
      fig.innerHTML = outChart({ VCC: 12, RC: p.RC, RE: p.RE, beta: v.beta, ibs: [], Q: { VCE, IC } });
      out.innerHTML = `<div class="form-row"><span class="label">Punto di lavoro</span><div class="f">${IC_} = ${res(U(IC, 'A'))}; ${VCE_} = ${U(VCE, 'V')}</div><span class="meta">${sat ? 'Saturo: abbassa R2 o alza RE.' : `Calcolo approssimato (senza IB): ${U(ap.IC, 'A')}; la differenza è del ${N((100 * Math.abs(ap.IC - ex.IC)) / ex.IC, 2)} %.`}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'R1', label: '<var>R</var><sub>1</sub> (kΩ)', min: 10, max: 150, log: true, value: 47 },
      { id: 'R2', label: '<var>R</var><sub>2</sub> (kΩ)', min: 2.2, max: 47, log: true, value: 10 },
      { id: 'RC', label: '<var>R</var><sub>C</sub> (kΩ)', min: 0.47, max: 10, log: true, value: 2.2 },
      { id: 'RE', label: '<var>R</var><sub>E</sub> (kΩ)', min: 0.1, max: 4.7, log: true, value: 1 },
      { id: 'beta', label: 'β', min: 50, max: 400, step: 10, value: 150 },
    ], draw);
    c.append(grid, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'polarizzazione', num: 3, short: 'Polarizzazione', title: 'Polarizzazione e punto di lavoro',
    intro: 'Per amplificare, il transistor deve stare a riposo in zona attiva, con un punto di lavoro stabile. Il partitore sulla base con una resistenza di emettitore lo fissa quasi senza dipendere dal β, che varia molto da un pezzo all\'altro.',
    goals: ['Partitore e resistenza di emettitore', 'Retta di carico statica', 'Stabilità rispetto a β'],
    widgets: [widgetBias],
    example: p3[0], exampleTitle: 'Esempio: punto di lavoro',
    families: p3,
    theory: `
      <article class="note"><h4>Il calcolo approssimato</h4>
        <div class="eq"><span>${sub('V', 'B')} = <var>V</var><sub>CC</sub> ${frac('<var>R</var><sub>2</sub>', '<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>')}</span><span>${IC_} ≈ ${IE_} = ${frac(sub('V', 'B') + ' − 0,7', '<var>R</var><sub>E</sub>')}</span><span>${VCE_} = <var>V</var><sub>CC</sub> − ${IC_}(<var>R</var><sub>C</sub> + <var>R</var><sub>E</sub>)</span></div>
        <p>Vale se la corrente del partitore è molto più grande di ${IB_}. Il calcolo esatto usa l'equivalente di Thevenin del partitore.</p></article>
      <article class="note"><h4>Perché RE stabilizza</h4>
        <p>Se ${IC_} aumenta (per la temperatura o un β più alto), aumenta la tensione su <var>R</var><sub>E</sub>, diminuisce <var>V</var><sub>BE</sub> e la corrente torna indietro: è una retroazione negativa.</p></article>`,
  });

  // =====================================================================
  // 4 — Amplificatore
  // =====================================================================
  const a4 = [];
  a4.push({
    id: 'amp-av', title: 'Guadagno dell\'emettitore comune', level: 2,
    defaults: { IE: 1e-3, RC: 4700, REu: 0, vin: 0.01 },
    gen: () => ({ IE: pick([0.5, 1, 1.3, 2, 2.6]) / 1000, RC: pick([2.2, 3.3, 4.7, 10]) * 1000, REu: pick([0, 0, 100, 220, 470]), vin: pick([1, 2, 5, 10, 20]) / 1000 }),
    solve: (p) => { const re = SM.re(p.IE); const Av = SM.ceGain(p.RC, p.IE, p.REu); return { re, Av, vout: Math.abs(Av) * p.vin }; },
    text: (p) => `Un amplificatore a emettitore comune lavora con ${IE_} = ${U(p.IE, 'A')} e <var>R</var><sub>C</sub> = ${U(p.RC, 'Ω')}; ${p.REu ? `una parte di <var>R</var><sub>E</sub>, ${U(p.REu, 'Ω')}, non è bypassata dal condensatore` : '<var>R</var><sub>E</sub> è tutta bypassata dal condensatore'}. In ingresso c'è un segnale di ${U(p.vin, 'V')} di picco. Quanto valgono <var>r</var><sub>e</sub>, il guadagno e l'ampiezza d'uscita?`,
    asks: (p, r) => [h.qR('<var>r</var><sub>e</sub>', r.re), { label: '<var>A</var><sub>v</sub>', unit: '', value: r.Av, signNote: 'Controlla il segno: l\'emettitore comune inverte il segnale, quindi Av è negativo.' }, h.qV('<var>v</var><sub>out</sub> (picco)', r.vout)],
    steps: (p, r) => step(`<var>r</var><sub>e</sub> = ${frac('26 mV', IE_)} = ${res(U(r.re, 'Ω'))}`, 'Resistenza dinamica della giunzione base-emettitore.') +
      step(`<var>A</var><sub>v</sub> = −${frac('<var>R</var><sub>C</sub>', '<var>r</var><sub>e</sub>' + (p.REu ? ' + <var>R</var><sub>E</sub>′' : ''))} = −${frac(U(p.RC, 'Ω'), U(r.re + p.REu, 'Ω'))} = ${res(N(r.Av, 4))}`, p.REu ? 'La resistenza non bypassata abbassa il guadagno ma lo rende stabile e meno distorto.' : 'Guadagno alto, ma dipende dalla temperatura (re cambia).') +
      step(`<var>v</var><sub>out</sub> = |<var>A</var><sub>v</sub>| · <var>v</var><sub>in</sub> = ${res(U(r.vout, 'V'))}`, 'Il segno meno vuol dire che l\'uscita è in opposizione di fase (sfasata di 180°).'),
  });
  a4.push({
    id: 'amp-swing', title: 'Quanto può oscillare l\'uscita', level: 2,
    gen: () => L.nice(() => ({ VCC: pick([9, 12, 15]), VE: pick([1, 1.2, 1.5, 2]), VCE: pick([3, 4, 5, 6, 7]), Av: pick([50, 100, 150, 200]) }), (p) => p.VCE < p.VCC - p.VE - 1, { VCC: 12, VE: 1, VCE: 5, Av: 100 }),
    solve: (p) => { const down = p.VCE - 0.2; const up = p.VCC - p.VE - p.VCE; const sw = Math.min(down, up); return { down, up, sw, vin: sw / p.Av }; },
    text: (p) => `Un amplificatore (<var>V</var><sub>CC</sub> = ${p.VCC} V, ${sub('V', 'E')} = ${N(p.VE)} V) ha il punto di lavoro a ${VCE_} = ${N(p.VCE)} V e guadagno ${p.Av} in modulo. Qual è la massima ampiezza d'uscita senza tagli? E il massimo segnale d'ingresso?`,
    asks: (p, r) => [h.qV('<var>v</var><sub>out,max</sub>', r.sw), h.qV('<var>v</var><sub>in,max</sub>', r.vin)],
    hint: () => 'Verso il basso l\'uscita si ferma alla saturazione (VCE ≈ 0,2 V), verso l\'alto all\'interdizione (VCE = VCC − VE). Vale il lato più corto.',
    steps: (p, r) => step(`Verso la saturazione: ${N(p.VCE)} − 0,2 = ${U(r.down, 'V')}; verso l'interdizione: ${p.VCC} − ${N(p.VE)} − ${N(p.VCE)} = ${U(r.up, 'V')}`, 'Approssimazione a vuoto: la retta di carico dinamica coincide con quella statica.') +
      step(`<var>v</var><sub>out,max</sub> = ${res(U(r.sw, 'V'))} (il lato più corto)`) + step(`<var>v</var><sub>in,max</sub> = ${U(r.sw, 'V')} / ${p.Av} = ${res(U(r.vin, 'V'))}`, 'Oltre, una delle due semionde dell\'uscita si "schiaccia": distorsione.'),
  });
  a4.push({
    id: 'amp-mos', title: 'Il MOSFET in saturazione', level: 2,
    gen: () => L.nice(() => ({ k: pick([0.25, 0.5, 1, 2]) / 1000, Vth: pick([1, 1.5, 2]), VGS: pick([2.5, 3, 3.5, 4, 5]), VDD: pick([12, 15]), RD: pick([1, 2.2, 3.3, 4.7]) * 1000 }), (p) => p.VGS > p.Vth, { k: 0.5e-3, Vth: 2, VGS: 4, VDD: 12, RD: 2200 }),
    solve: (p) => {
      const sat = SM.mosfet(p.VGS, 100, p.k, p.Vth).ID;
      const VDS = p.VDD - sat * p.RD;
      const inSat = VDS >= p.VGS - p.Vth;
      return { ID: sat, VDS, inSat };
    },
    text: (p) => `Un MOSFET a canale n (<var>k</var> = ${App.si(p.k, 'A/V²')}, <var>V</var><sub>th</sub> = ${N(p.Vth)} V) ha <var>V</var><sub>GS</sub> = ${N(p.VGS)} V, <var>R</var><sub>D</sub> = ${U(p.RD, 'Ω')} e <var>V</var><sub>DD</sub> = ${p.VDD} V. Supponendo che lavori in saturazione, quanto valgono <var>I</var><sub>D</sub> e <var>V</var><sub>DS</sub>? L'ipotesi è giusta?`,
    asks: (p, r) => [h.qI('<var>I</var><sub>D</sub>', r.ID), h.qV('<var>V</var><sub>DS</sub>', r.VDS), h.choice('In saturazione?', ['sì: VDS ≥ VGS − Vth', 'no: è in zona ohmica'], r.inSat ? 0 : 1)],
    steps: (p, r) => step(`<var>I</var><sub>D</sub> = <var>k</var>(<var>V</var><sub>GS</sub> − <var>V</var><sub>th</sub>)² = ${App.si(p.k, 'A/V²')} · (${N(p.VGS - p.Vth)} V)² = ${res(U(r.ID, 'A'))}`, 'Legge quadratica: la corrente dipende dalla tensione di comando, non da una corrente.') +
      step(`<var>V</var><sub>DS</sub> = <var>V</var><sub>DD</sub> − <var>R</var><sub>D</sub><var>I</var><sub>D</sub> = ${res(U(r.VDS, 'V'))}`) +
      step(`Verifica: <var>V</var><sub>DS</sub> ${r.inSat ? '≥' : '<'} <var>V</var><sub>GS</sub> − <var>V</var><sub>th</sub> = ${N(p.VGS - p.Vth)} V → ${res(r.inSat ? 'saturazione' : 'zona ohmica')}`, r.inSat ? 'Ipotesi confermata.' : 'Ipotesi sbagliata: andrebbe rifatto il calcolo con la formula della zona ohmica (anche VDS negativa è un segnale).'),
  });
  a4.push({
    id: 'amp-mc', title: 'Concetti sull\'amplificatore', level: 1,
    ...mc([
      ['L\'amplificatore a emettitore comune…', ['amplifica e inverte il segnale (sfasamento di 180°)', 'amplifica senza invertire', 'ha guadagno minore di 1', 'funziona solo in continua'], 'Quando l\'ingresso sale, IC sale e VCE scende.'],
      ['I condensatori di accoppiamento in ingresso e uscita servono a…', ['far passare il segnale bloccando la continua di polarizzazione', 'aumentare il guadagno', 'livellare la tensione', 'proteggere dalla sovratensione'], 'Così il punto di lavoro non viene spostato da chi sta prima o dopo.'],
      ['Se il segnale d\'ingresso è troppo grande, l\'uscita…', ['si taglia (clipping): distorsione', 'diventa più grande senza problemi', 'si inverte due volte', 'si annulla'], 'Il transistor arriva alla saturazione o all\'interdizione.'],
      ['Il condensatore di bypass su RE…', ['aumenta il guadagno in alternata senza cambiare la polarizzazione', 'cambia il punto di lavoro', 'diminuisce il guadagno', 'serve a raddrizzare'], 'Per il segnale RE è cortocircuitata, per la continua no.'],
    ]),
  });

  function widgetAmp(host) {
    const c = K.widgetCard('L\'amplificatore a emettitore comune', 'VCC = 12 V, IC = 1 mA, RC = 4,7 kΩ, VE = 1 V: alza il segnale fino a tagliarlo');
    let bypass = true;
    const tog = el('label', 'switch');
    tog.innerHTML = '<input type="checkbox" checked><span class="track"></span><span>R<sub>E</sub> bypassata dal condensatore</span>';
    const wave = el('div');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const IC = 1e-3;
      const VCEQ = 12 - 4700 * IC - 1;
      const Av = bypass ? SM.ceGain(4700, IC) : SM.ceGain(4700, IC, 1000);
      const vin = v.vin / 1000;
      const lo = 0.2;
      const hi = 12 - 1;
      const fn = (t) => App.clamp(VCEQ + Av * vin * Math.sin(2 * Math.PI * 1000 * t), lo, hi);
      const clip = VCEQ + Math.abs(Av) * vin > hi || VCEQ - Math.abs(Av) * vin < lo;
      wave.innerHTML = Q.waveSVG({ W: 520, H: 230, tmax: 0.002, ymin: 0, ymax: 12, yu: 'V', traces: [{ fn, cls: 'gen' }, { fn: (t) => VCEQ + (5 * Math.sin(2 * Math.PI * 1000 * t) * v.vin) / 100, cls: 'p2', dash: true }], hl: [{ y: VCEQ, cls: 'guide', label: 'riposo' }], title: 'v_CE (blu) e ingresso ingrandito (arancio)' });
      out.innerHTML = `<div class="form-row"><span class="label">Guadagno</span><div class="f"><var>A</var><sub>v</sub> = −<var>R</var><sub>C</sub>/(<var>r</var><sub>e</sub>${bypass ? '' : ' + <var>R</var><sub>E</sub>'}) = ${res(N(Av, 3))}</div><span class="meta">Uscita in opposizione di fase: quando l'ingresso sale, v<sub>CE</sub> scende.</span></div>
        <div class="form-row"><span class="label">Uscita</span><div class="f">${U(Math.abs(Av) * vin, 'V')} di picco attorno a ${U(VCEQ, 'V')}</div><span class="meta" style="color:var(--${clip ? 'bad' : 'ok'})">${clip ? 'Il segnale si taglia: saturazione in basso o interdizione in alto.' : 'Nessun taglio: l\'uscita è una sinusoide pulita.'}</span></div>`;
    };
    const sl = K.sliders(c, [{ id: 'vin', label: 'Ingresso <var>v</var><sub>in</sub> (mV di picco)', min: 1, max: 1000, log: true, value: 10 }], draw);
    tog.querySelector('input').addEventListener('change', (e) => { bypass = e.target.checked; draw(last); });
    c.append(tog, wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'amplificatore', num: 4, short: 'Amplificatore', title: 'L\'amplificatore a transistor',
    intro: 'Polarizzato in zona attiva, il transistor trasforma piccole variazioni della tensione di base in grandi variazioni della tensione di collettore: è l\'amplificatore a emettitore comune. Il MOSFET fa lo stesso comandato in tensione.',
    goals: ['Guadagno e resistenza re', 'Opposizione di fase', 'Massima escursione e clipping', 'MOSFET in saturazione'],
    widgets: [widgetAmp],
    example: a4[0], exampleTitle: 'Esempio: guadagno con RE bypassata',
    families: a4,
    theory: `
      <article class="note"><h4>Guadagno</h4>
        <div class="eq"><span><var>r</var><sub>e</sub> ≈ ${frac('26 mV', IE_)}</span><span><var>A</var><sub>v</sub> ≈ −${frac('<var>R</var><sub>C</sub>', '<var>r</var><sub>e</sub> + <var>R</var><sub>E</sub>′')}</span></div>
        <p><var>R</var><sub>E</sub>′ è la parte di <var>R</var><sub>E</sub> non bypassata. Con un carico <var>R</var><sub>L</sub> accoppiato in uscita, al posto di <var>R</var><sub>C</sub> va <var>R</var><sub>C</sub> ∥ <var>R</var><sub>L</sub>.</p></article>
      <article class="note"><h4>MOSFET</h4>
        <p>In saturazione (<var>V</var><sub>DS</sub> ≥ <var>V</var><sub>GS</sub> − <var>V</var><sub>th</sub>): <var>I</var><sub>D</sub> = <var>k</var>(<var>V</var><sub>GS</sub> − <var>V</var><sub>th</sub>)². Il gate è isolato: nessuna corrente di ingresso, impedenza altissima.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'bjt', year: '4', yearLabel: '4ª', title: 'Transistor BJT e MOSFET', route: 'bjt-bjt', lessonWord: 'Lezione',
    desc: 'Correnti e zone di lavoro, caratteristiche d\'uscita, transistor e MOSFET come interruttori, polarizzazione a partitore, amplificatore a emettitore comune.',
    lessons,
  });
})();
