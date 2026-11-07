/* Reti in corrente continua — Moduli 1–4: Ohm, serie, parallelo, circuiti misti */
(function () {
  'use strict';
  const App = window.App;
  const DC = window.DC;
  const S = App.Schem.T;
  const L = App.Lessons;
  const { N, U, V, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const clean = DC.clean;
  const CC = (App.CC = App.CC || { lessons: [] });

  // ---------- Domande con unità scelta in base al valore ----------
  const h = (CC.h = {
    qI(label, I) { const big = Math.abs(I) >= 1 || Math.abs(I) < 1e-9; return { label, unit: big ? 'A' : 'mA', value: big ? I : I * 1000 }; },
    qV(label, v) { return { label, unit: 'V', value: v }; },
    qR(label, R) { return R >= 1000 ? { label, unit: 'kΩ', value: R / 1000 } : { label, unit: 'Ω', value: R }; },
    qP(label, P) { return Math.abs(P) >= 1 ? { label, unit: 'W', value: P } : { label, unit: 'mW', value: P * 1000 }; },
    choice(label, options, answer) { return { label, type: 'choice', options, answer }; },
    e12(min, max) {
      const out = [];
      for (let d = 1; d <= 1e6; d *= 10) for (const v of App.E12) { const x = Number((v * d).toPrecision(2)); if (x >= min && x <= max) out.push(x); }
      return out;
    },
    twoDec: (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6,
  });
  const I_ = (k) => V('I' + (k == null ? '' : k));
  const R_ = (k) => V('R' + (k == null ? '' : k));
  const V_ = (k) => V('V' + (k == null ? '' : k));
  const Req = '<var>R</var><sub>eq</sub>';

  /** Mini-grafico SVG riutilizzabile: assi, griglia, scala. */
  CC.chart = function (o) {
    const { W = 360, H = 220, x0 = 50, x1 = W - 14, y0 = H - 34, y1 = 14, xmax, ymax, xmin = 0, ymin = 0, xu, yu, xlabel, ylabel, ticks = 4 } = o;
    const X = (x) => x0 + ((x1 - x0) * (x - xmin)) / (xmax - xmin);
    const Y = (y) => y0 - ((y0 - y1) * (y - ymin)) / (ymax - ymin);
    let s = '';
    for (let k = 0; k <= ticks; k++) {
      const xv = xmin + ((xmax - xmin) * k) / ticks;
      const yv = ymin + ((ymax - ymin) * k) / ticks;
      s += `<line class="gridl" x1="${X(xv)}" y1="${y0}" x2="${X(xv)}" y2="${y1}"/><line class="gridl" x1="${x0}" y1="${Y(yv)}" x2="${x1}" y2="${Y(yv)}"/>`;
      s += `<text x="${X(xv)}" y="${y0 + 15}" text-anchor="${k === 0 ? 'start' : k === ticks ? 'end' : 'middle'}">${xu ? App.si(xv, xu, 2) : App.num(xv, 2)}</text>`;
      s += `<text x="${x0 - 6}" y="${Y(yv) + 3.5}" text-anchor="end">${yu ? App.si(yv, yu, 2) : App.num(yv, 2)}</text>`;
    }
    s += `<line class="axis" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}"/><line class="axis" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}"/>`;
    if (xlabel) s += `<text class="axname" x="${x1}" y="${y0 - 6}" text-anchor="end">${xlabel}</text>`;
    if (ylabel) s += `<text class="axname" x="${x0 + 6}" y="${y1 + 12}">${ylabel}</text>`;
    return { X, Y, s, W, H };
  };
  CC.niceMax = function (x) {
    if (!(x > 0) || !isFinite(x)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= x * 0.999) return m * p;
    return 10 * p;
  };

  /** Crea una scheda con cursori collegati. fields: [{id, label, min, max, log, step, value}] */
  CC.sliders = function (host, fields, onChange) {
    const box = document.createElement('div');
    box.className = 'fields compact';
    const out = {};
    fields.forEach((f) => {
      const id = 'w-' + f.id + '-' + Math.random().toString(36).slice(2, 7);
      const d = document.createElement('div');
      d.className = 'field';
      d.innerHTML = `<label for="${id}"><span>${f.label}</span></label><input type="range" id="${id}-r" aria-label="${f.aria || f.id}"><input class="num" id="${id}" inputmode="decimal" autocomplete="off">`;
      box.appendChild(d);
      out[f.id] = App.linkField(d.querySelector('input[type=range]'), d.querySelector('.num'), {
        min: f.min, max: f.max, log: f.log, step: f.step, value: f.value, sig: f.sig || 3,
        onChange: (v) => { values[f.id] = v; onChange(values); },
      });
    });
    const values = Object.fromEntries(fields.map((f) => [f.id, f.value]));
    host.appendChild(box);
    return { fields: out, values };
  };

  CC.widgetCard = function (title, sub) {
    const c = document.createElement('div');
    c.className = 'card widget';
    c.innerHTML = `<div class="card-head"><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>`;
    return c;
  };

  // =====================================================================
  // MODULO 1 — Legge di Ohm
  // =====================================================================
  const m1 = [];

  m1.push({
    id: 'm1-i', title: 'Trova la corrente', level: 1,
    defaults: { E: 12, R: 4 },
    gen: () => L.nice(() => ({ E: pick([4.5, 5, 6, 9, 12, 24]), R: pick(h.e12(10, 4700)) }), (p) => clean(p.E / p.R) && clean((p.E * p.E) / p.R), { E: 12, R: 4 }),
    solve: (p) => ({ I: p.E / p.R, P: (p.E * p.E) / p.R }),
    text: (p) => `Un generatore ideale da ${U(p.E, 'V')} alimenta un solo resistore da ${U(p.R, 'Ω')}. Trova la corrente e la potenza dissipata.`,
    fig: (p, r, sol) => S.single(p, { cur: sol ? { I: r.I } : null }),
    asks: (p, r) => [h.qI('Corrente ' + I_(), r.I), h.qP('Potenza ' + V('P'), r.P)],
    hint: () => `C'è un solo resistore: tutta la f.e.m. cade su di lui. Poi <var>I</var> = <var>V</var>/<var>R</var>.`,
    steps: (p, r) =>
      step(`${V_('R')} = <var>E</var> = ${U(p.E, 'V')}`, 'Un solo resistore: tutta la f.e.m. cade su di lui.') +
      step(`<var>I</var> = ${frac(V_('R'), '<var>R</var>')} = ${frac(U(p.E, 'V'), U(p.R, 'Ω'))} = ${res(U(r.I, 'A'))}`, 'Legge di Ohm.') +
      step(`<var>P</var> = <var>V</var> · <var>I</var> = ${N(p.E)} · ${N(r.I)} = ${res(U(r.P, 'W'))}`) +
      step(`<var>P</var> = <var>R</var> · <var>I</var>² = ${N(p.R)} · ${N(r.I)}² = ${U(p.R * r.I * r.I, 'W')}${ok}`, 'Verifica con l\'altra formula.'),
    table: (p) => L.rivpFromNet(DC.nets.single(p), DC.solve(DC.nets.single(p))),
  });

  m1.push({
    id: 'm1-v', title: 'Trova la tensione', level: 1,
    defaults: { R: 220, I: 0.05 },
    gen: () => L.nice(() => ({ R: pick(h.e12(47, 2200)), I: pick([5, 10, 15, 20, 25, 30, 40, 50]) / 1000 }), (p) => clean(p.R * p.I), { R: 220, I: 0.05 }),
    solve: (p) => ({ V: p.R * p.I, P: p.R * p.I * p.I }),
    text: (p) => `Un resistore da ${U(p.R, 'Ω')} è attraversato da ${U(p.I, 'A')}. Trova la tensione ai suoi capi e la potenza. Che resistore serve, come potenza?`,
    asks: (p, r) => [h.qV('Tensione ' + V_(), r.V), h.qP('Potenza ' + V('P'), r.P)],
    hint: (p) => `Prima converti: ${U(p.I, 'A')} = ${N(p.I)} A.`,
    steps: (p, r) =>
      step(`${U(p.I, 'A')} = ${N(p.I)} A`, 'Converti i milliampere in ampere prima di moltiplicare.') +
      step(`<var>V</var> = <var>R</var> · <var>I</var> = ${N(p.R)} · ${N(p.I)} = ${res(U(r.V, 'V'))}`) +
      step(`<var>P</var> = <var>V</var> · <var>I</var> = ${N(r.V)} · ${N(p.I)} = ${res(U(r.P, 'W'))}`,
        r.P > 0.25 ? 'Più di ¼ W: un resistore da ¼ W si brucerebbe, serve almeno quello da ' + (r.P <= 0.5 ? '½ W' : r.P <= 1 ? '1 W' : r.P <= 2 ? '2 W' : '5 W') + '.' : 'Basta un resistore da ¼ W.'),
  });

  m1.push({
    id: 'm1-r', title: 'Trova la resistenza', level: 1,
    defaults: { V: 9, I: 0.03 },
    gen: () => L.nice(() => ({ V: pick([3, 5, 6, 9, 12, 15, 24]), I: pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60]) / 1000 }), (p) => clean(p.V / p.I, 3), { V: 9, I: 0.03 }),
    solve: (p) => ({ R: p.V / p.I, P: p.V * p.I }),
    text: (p) => `Ai capi di un resistore misuri ${U(p.V, 'V')} e l'amperometro segna ${U(p.I, 'A')}. Quanto vale la resistenza? Quanta potenza dissipa?`,
    asks: (p, r) => [h.qR('Resistenza ' + R_(), r.R), h.qP('Potenza ' + V('P'), r.P)],
    steps: (p, r) =>
      step(`<var>R</var> = ${frac('<var>V</var>', '<var>I</var>')} = ${frac(U(p.V, 'V'), N(p.I) + ' A')} = ${res(U(r.R, 'Ω'))}`) +
      step(`<var>P</var> = <var>V</var> · <var>I</var> = ${N(p.V)} · ${N(p.I)} = ${res(U(r.P, 'W'))}`),
  });

  const DEVICES = [
    { n: 'una lampada a incandescenza', V: 230, P: [25, 40, 60, 100] },
    { n: 'una lampadina da auto', V: 12, P: [5, 21, 55] },
    { n: 'una stufetta elettrica', V: 230, P: [1000, 1500, 2000] },
    { n: 'un saldatore', V: 230, P: [30, 40, 60] },
  ];
  m1.push({
    id: 'm1-targa', title: 'Dai dati di targa', level: 2,
    defaults: { d: 0, V: 230, P: 60 },
    gen: () => { const d = rand(0, DEVICES.length - 1); return { d, V: DEVICES[d].V, P: pick(DEVICES[d].P) }; },
    solve: (p) => ({ I: p.P / p.V, R: (p.V * p.V) / p.P }),
    text: (p) => `Su ${DEVICES[p.d].n} c'è scritto <strong>${p.V} V, ${p.P} W</strong>. Trova la corrente assorbita e la resistenza a regime.`,
    asks: (p, r) => [h.qI('Corrente ' + I_(), r.I), h.qR('Resistenza ' + R_(), r.R)],
    hint: () => `Dalla potenza: <var>P</var> = <var>V</var>·<var>I</var> e <var>P</var> = <var>V</var>²/<var>R</var>.`,
    steps: (p, r) =>
      step(`<var>I</var> = ${frac('<var>P</var>', '<var>V</var>')} = ${frac(p.P + ' W', p.V + ' V')} = ${res(U(r.I, 'A'))}`) +
      step(`<var>R</var> = ${frac('<var>V</var>²', '<var>P</var>')} = ${frac(p.V + '²', p.P)} = ${frac(N(p.V * p.V, 6), p.P)} = ${res(U(r.R, 'Ω'))}`) +
      step(`<var>R</var> · <var>I</var> = ${N(r.R)} · ${N(r.I)} ≈ ${N(r.R * r.I)} V${ok}`, 'Verifica: torna la tensione di targa. Il filamento a freddo ha una resistenza molto più bassa.'),
  });

  m1.push({
    id: 'm1-rov', title: 'Problema rovesciato: dalla potenza', level: 2,
    gen: () => L.nice(() => ({ R: pick([10, 20, 22, 47, 50, 100, 220, 470, 1000]), I: pick([0.05, 0.1, 0.2, 0.3, 0.5, 1, 2]) }), (p) => clean(p.R * p.I * p.I) && p.R * p.I * p.I <= 200, { R: 100, I: 0.2 }),
    solve: (p) => ({ P: p.R * p.I * p.I, V: p.R * p.I }),
    text: (p, r) => `Un resistore da ${U(p.R, 'Ω')} dissipa ${U(r.P, 'W')}. Che tensione ha ai capi? Quale corrente lo attraversa?`,
    asks: (p, r) => [h.qV('Tensione ' + V_(), r.V), h.qI('Corrente ' + I_(), p.I)],
    hint: () => `<var>P</var> = <var>V</var>²/<var>R</var>, quindi <var>V</var> = √(<var>P</var>·<var>R</var>).`,
    steps: (p, r) =>
      step(`<var>V</var> = √(<var>P</var> · <var>R</var>) = √(${N(r.P)} · ${N(p.R)}) = √${N(r.P * p.R)} = ${res(U(r.V, 'V'))}`, 'Dalla formula P = V²/R ricavi V.') +
      step(`<var>I</var> = ${frac('<var>V</var>', '<var>R</var>')} = ${frac(N(r.V), N(p.R))} = ${res(U(p.I, 'A'))}`) +
      step(`<var>P</var> = <var>R</var>·<var>I</var>² = ${N(p.R)} · ${N(p.I)}² = ${U(r.P, 'W')}${ok}`),
  });

  const RATINGS = [['¼ W', 0.25], ['½ W', 0.5], ['1 W', 1], ['2 W', 2], ['5 W', 5]];
  m1.push({
    id: 'm1-scelta', title: 'Quale resistore compro?', level: 2,
    gen: () => L.nice(() => ({ R: pick(h.e12(10, 1000)), V: pick([5, 9, 12, 15, 24]) }), (p) => {
      const P = (p.V * p.V) / p.R;
      return P <= 4.5 && RATINGS.every(([, w]) => Math.abs(P - w) / w > 0.08);
    }, { R: 100, V: 9 }),
    solve: (p) => { const P = (p.V * p.V) / p.R; return { P, k: RATINGS.findIndex(([, w]) => w >= P) }; },
    text: (p) => `Devi mettere un resistore da ${U(p.R, 'Ω')} direttamente su ${p.V} V. Quanta potenza dissipa? Qual è il resistore più piccolo che non si brucia?`,
    asks: (p, r) => [h.qP('Potenza ' + V('P'), r.P), h.choice('Potenza nominale', RATINGS.map((x) => x[0]), r.k)],
    steps: (p, r) =>
      step(`<var>P</var> = ${frac('<var>V</var>²', '<var>R</var>')} = ${frac(p.V + '²', N(p.R))} = ${res(U(r.P, 'W'))}`, 'Conosci V e R: la formula giusta è V²/R.') +
      step(`Serve un resistore da almeno ${res(RATINGS[r.k][0])}`, 'Il primo valore commerciale che supera la potenza dissipata. Nella pratica si tiene un margine: meglio il doppio.'),
  });

  function widgetOhm(host) {
    const c = CC.widgetCard('La legge di Ohm, dal vivo', 'Muovi tensione e resistenza');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'f widget-out';
    const note = document.createElement('p');
    note.className = 'hint';
    const draw = (v) => {
      const I = v.V / v.R;
      const Imax = CC.niceMax(24 / Math.max(v.R / 2, 1e-9));
      const ch = CC.chart({ W: 380, H: 230, xmax: 24, ymax: Imax, xu: 'V', yu: 'A', xlabel: 'V', ylabel: 'I' });
      let s = ch.s;
      [[v.R / 2, 'R/2'], [v.R * 2, '2R']].forEach(([r, t]) => {
        const xEnd = Math.min(24, Imax * r);
        s += `<line class="ref" x1="${ch.X(0)}" y1="${ch.Y(0)}" x2="${ch.X(xEnd)}" y2="${ch.Y(xEnd / r)}"/><text class="small" x="${ch.X(xEnd) - 4}" y="${ch.Y(xEnd / r) - 6}" text-anchor="end">${t}</text>`;
      });
      const xEnd = Math.min(24, Imax * v.R);
      s += `<line class="gen" x1="${ch.X(0)}" y1="${ch.Y(0)}" x2="${ch.X(xEnd)}" y2="${ch.Y(xEnd / v.R)}"/>`;
      s += `<line class="guide" x1="${ch.X(v.V)}" y1="${ch.Y(I)}" x2="${ch.X(v.V)}" y2="${ch.Y(0)}"/><line class="guide" x1="${ch.X(v.V)}" y1="${ch.Y(I)}" x2="${ch.X(0)}" y2="${ch.Y(I)}"/>`;
      s += `<circle class="op" cx="${ch.X(v.V)}" cy="${ch.Y(Math.min(I, Imax))}" r="5.5"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${ch.W} ${ch.H}" role="img" style="width:100%;max-width:520px;height:auto"><title>Caratteristica tensione-corrente del resistore</title>${s}</svg>`;
      out.innerHTML = `<var>I</var> = ${frac('<var>V</var>', '<var>R</var>')} = ${frac(U(v.V, 'V'), U(v.R, 'Ω'))} = ${res(U(I, 'A'))} &nbsp;&nbsp; <var>P</var> = <var>V</var>·<var>I</var> = ${res(U(v.V * I, 'W'))}`;
      note.innerHTML = 'La caratteristica di un resistore è una retta che passa per l\'origine: raddoppi <var>V</var> e raddoppia <var>I</var>. Più la retta è ripida, più piccola è la resistenza (le linee tratteggiate sono <var>R</var>/2 e 2<var>R</var>).';
    };
    const sl = CC.sliders(c, [
      { id: 'V', label: 'Tensione <var>V</var> (V)', min: 0, max: 24, step: 0.5, value: 12 },
      { id: 'R', label: 'Resistenza <var>R</var> (Ω)', min: 10, max: 10000, log: true, value: 100 },
    ], draw);
    c.append(fig, out, note);
    const link = document.createElement('p');
    link.className = 'hint';
    link.innerHTML = 'Con generatore reale, interruttore e strumenti: <a href="#circuito" data-route="circuito">laboratorio del circuito elementare</a>.';
    c.appendChild(link);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm1', short: 'Ohm', title: 'Legge di Ohm', num: 1,
    intro: 'Tensione, corrente e resistenza sono legate da una sola formula: conosci due grandezze, ricavi la terza. Poi la potenza, in tre forme equivalenti.',
    goals: ['V, I, R su un resistore', 'Conversioni mA ↔ A', 'Potenza ed effetto Joule'],
    widgets: [widgetOhm],
    example: m1[0], exampleTitle: 'Esempio 1.1 — trova la corrente',
    families: m1,
    theory: `
      <article class="note"><h4>Le grandezze</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Grandezza</th><th>Simbolo</th><th>Unità</th><th>Multipli usati</th></tr></thead><tbody>
          <tr><td>Tensione (DDP, cdt, f.e.m.)</td><td class="f"><var>V</var>, <var>E</var></td><td>volt (V)</td><td>mV, kV</td></tr>
          <tr><td>Intensità di corrente</td><td class="f"><var>I</var></td><td>ampere (A)</td><td>mA = 10⁻³ A, µA = 10⁻⁶ A</td></tr>
          <tr><td>Resistenza</td><td class="f"><var>R</var></td><td>ohm (Ω)</td><td>kΩ = 10³ Ω, MΩ = 10⁶ Ω</td></tr>
          <tr><td>Conduttanza</td><td class="f"><var>G</var> = 1/<var>R</var></td><td>siemens (S)</td><td>mS</td></tr>
          <tr><td>Potenza</td><td class="f"><var>P</var></td><td>watt (W)</td><td>mW, kW</td></tr>
          <tr><td>Energia</td><td class="f"><var>W</var></td><td>joule (J), Wh</td><td>kWh</td></tr>
        </tbody></table></div></article>
      <article class="note"><h4>DDP, cdt e f.e.m.: tre nomi per volt diversi</h4>
        <ul>
          <li><strong>DDP</strong> tra due punti A e B: <span class="f"><var>V</var><sub>AB</sub> = <var>V</var><sub>A</sub> − <var>V</var><sub>B</sub></span>. Si misura con il voltmetro in parallelo.</li>
          <li><strong>Caduta di tensione (cdt)</strong>: la DDP ai capi di un resistore attraversato da corrente, <span class="f"><var>V</var><sub>R</sub> = <var>R</var>·<var>I</var></span>. Il morsetto da cui <em>entra</em> la corrente è il più positivo.</li>
          <li><strong>Forza elettromotrice</strong>: la tensione che un generatore produce a vuoto. Se la corrente esce dal +, il generatore eroga potenza.</li>
        </ul></article>
      <article class="note"><h4>Legge di Ohm e potenza</h4>
        <div class="eq"><span><var>V</var> = <var>R</var> · <var>I</var></span><span><var>I</var> = ${frac('<var>V</var>', '<var>R</var>')}</span><span><var>R</var> = ${frac('<var>V</var>', '<var>I</var>')}</span></div>
        <p>La potenza dissipata (effetto Joule) ha tre forme equivalenti: usa quella con i dati che hai già.</p>
        <div class="eq"><span><var>P</var> = <var>V</var> · <var>I</var> = <var>R</var> · <var>I</var>² = ${frac('<var>V</var>²', '<var>R</var>')}</span></div>
        <p>Prima di ogni calcolo <strong>converti in unità base</strong>: 50 mA = 0,05 A, 2,2 kΩ = 2200 Ω. Con V in volt e R in kΩ la corrente esce direttamente in mA: un trucco comodo, se sei sicuro di quello che fai.</p></article>
      <article class="note"><h4>Convenzioni di segno (da fissare prima di ogni calcolo)</h4>
        <ul>
          <li>Disegna una freccia di verso <strong>arbitrario</strong> per ogni corrente. Se alla fine esce negativa, il verso vero è l'opposto: il valore numerico resta giusto.</li>
          <li>Sul resistore la cdt ha il + dove entra la corrente (convenzione degli utilizzatori).</li>
          <li>Scegli un nodo di riferimento (massa, 0 V): tutti i potenziali si misurano rispetto a lui.</li>
          <li>Alla fine <strong>verifica</strong>: somma delle correnti a ogni nodo = 0 e potenza erogata = potenza assorbita.</li>
        </ul></article>`,
  });

  // =====================================================================
  // MODULO 2 — Serie e partitore di tensione
  // =====================================================================
  const m2 = [];
  const seriesSolve = (p) => {
    const Rq = p.R.reduce((a, b) => a + b, 0);
    const I = p.E / Rq;
    const Vs = p.R.map((r) => r * I);
    const pot = [p.E];
    Vs.slice(0, -1).forEach((v) => pot.push(pot[pot.length - 1] - v));
    return { Rq, I, Vs, pot };
  };
  const seriesGen = () => L.nice(() => ({ E: pick([6, 9, 10, 12, 15, 18, 20, 24, 30]), R: [pick(h.e12(47, 1000)), pick(h.e12(47, 1000)), pick(h.e12(47, 1000))] }),
    (p) => { const r = seriesSolve(p); return clean(r.I, 2) && r.Vs.every((v) => clean(v, 3)); }, { E: 24, R: [100, 220, 180] });

  m2.push({
    id: 'm2-full', title: 'Serie completa', level: 1,
    defaults: { E: 24, R: [100, 220, 180] },
    gen: seriesGen,
    solve: seriesSolve,
    text: (p) => `<var>E</var> = ${U(p.E, 'V')}, ${p.R.map((r, k) => `${R_(k + 1)} = ${U(r, 'Ω')}`).join(', ')} in serie. Trova ${Req}, la corrente e le tre cadute di tensione.`,
    fig: (p, r, sol) => S.series(p, { cur: sol ? { I: r.I } : null, pot: sol ? r.pot : null }),
    asks: (p, r) => [h.qR(Req, r.Rq), h.qI('Corrente ' + I_(), r.I)].concat(r.Vs.map((v, k) => h.qV(V_(k + 1), v))),
    hint: () => 'In serie le resistenze si sommano e la corrente è la stessa ovunque.',
    steps: (p, r) =>
      step(`${Req} = ${p.R.map((x) => N(x)).join(' + ')} = ${res(U(r.Rq, 'Ω'))}`) +
      step(`<var>I</var> = ${frac('<var>E</var>', Req)} = ${frac(N(p.E), N(r.Rq))} = ${res(U(r.I, 'A'))}`, 'Una sola corrente per tutti i resistori.') +
      r.Vs.map((v, k) => step(`${V_(k + 1)} = ${R_(k + 1)} · <var>I</var> = ${N(p.R[k])} · ${N(r.I)} = ${res(U(v, 'V'))}`)).join('') +
      step(`${r.Vs.map((v) => N(v)).join(' + ')} = ${N(r.Vs.reduce((a, b) => a + b, 0))} V = <var>E</var>${ok}`, 'Verifica con la legge delle tensioni: le cdt si sommano fino a dare la f.e.m.') +
      step(`${V_(2)} = <var>E</var> · ${frac(R_(2), Req)} = ${N(p.E)} · ${frac(N(p.R[1]), N(r.Rq))} = ${U(r.Vs[1], 'V')}${ok}`, 'Stesso risultato con il partitore di tensione, senza passare da I.'),
    table: (p) => L.rivpFromNet(DC.nets.series(p), DC.solve(DC.nets.series(p))),
  });

  m2.push({
    id: 'm2-nodi', title: 'Potenziali dei nodi', level: 2,
    gen: seriesGen,
    solve: seriesSolve,
    text: (p) => `Stessa serie: <var>E</var> = ${U(p.E, 'V')}, ${p.R.map((r, k) => `${R_(k + 1)} = ${U(r, 'Ω')}`).join(', ')}. Con la massa in basso (0 V), trova i potenziali dei nodi A, B, C e la DDP <var>V</var><sub>BC</sub>.`,
    fig: (p, r, sol) => S.series(p, { cur: sol ? { I: r.I } : null, pot: sol ? r.pot : null }),
    asks: (p, r) => [h.qV('<var>V</var><sub>A</sub>', r.pot[0]), h.qV('<var>V</var><sub>B</sub>', r.pot[1]), h.qV('<var>V</var><sub>C</sub>', r.pot[2]), h.qV('<var>V</var><sub>BC</sub>', r.pot[1] - r.pot[2])],
    hint: () => 'Parti dal + del generatore e scendi: ogni resistore "toglie" la sua caduta di tensione.',
    steps: (p, r) =>
      step(`<var>I</var> = ${frac(N(p.E), N(r.Rq))} = ${U(r.I, 'A')}`) +
      step(`<var>V</var><sub>A</sub> = <var>E</var> = ${res(U(r.pot[0], 'V'))}`, 'A è collegato al + del generatore, il − è a massa.') +
      step(`<var>V</var><sub>B</sub> = <var>V</var><sub>A</sub> − ${R_(1)}·<var>I</var> = ${N(r.pot[0])} − ${N(r.Vs[0])} = ${res(U(r.pot[1], 'V'))}`) +
      step(`<var>V</var><sub>C</sub> = <var>V</var><sub>B</sub> − ${R_(2)}·<var>I</var> = ${N(r.pot[1])} − ${N(r.Vs[1])} = ${res(U(r.pot[2], 'V'))}`) +
      step(`<var>V</var><sub>BC</sub> = <var>V</var><sub>B</sub> − <var>V</var><sub>C</sub> = ${res(U(r.pot[1] - r.pot[2], 'V'))}`, 'È proprio la caduta su R₂. E V_C = R₃·I: dopo R₃ si arriva a 0 V.'),
  });

  m2.push({
    id: 'm2-part', title: 'Partitore senza calcolare I', level: 1,
    defaults: { E: 12, R1: 7000, R2: 5000 },
    gen: () => L.nice(() => ({ E: pick([5, 9, 10, 12, 15, 24]), R1: pick([1, 1.5, 2, 2.2, 3, 3.3, 4.7, 5, 6.8, 10]) * 1000, R2: pick([1, 1.5, 2, 2.2, 3, 3.3, 4.7, 5, 6.8, 10]) * 1000 }),
      (p) => clean((p.E * p.R2) / (p.R1 + p.R2)) && clean(p.E / (p.R1 + p.R2), 3), { E: 12, R1: 7000, R2: 5000 }),
    solve: (p) => ({ Vout: (p.E * p.R2) / (p.R1 + p.R2), V1: (p.E * p.R1) / (p.R1 + p.R2), I: p.E / (p.R1 + p.R2) }),
    text: (p) => `Vuoi ricavare una tensione più bassa da una batteria da ${U(p.E, 'V')} con ${R_(1)} = ${U(p.R1, 'Ω')} (in alto) e ${R_(2)} = ${U(p.R2, 'Ω')} (verso massa). Quanto vale <var>V</var><sub>out</sub>?`,
    fig: (p, r, sol) => S.divider(p, { cur: sol ? { I: r.I } : null, Vout: sol ? r.Vout : null }),
    asks: (p, r) => [h.qV('<var>V</var><sub>out</sub>', r.Vout), h.qV(V_(1), r.V1), h.qI('Corrente ' + I_(), r.I)],
    steps: (p, r) =>
      step(`<var>V</var><sub>out</sub> = <var>E</var> · ${frac(R_(2), R_(1) + ' + ' + R_(2))} = ${N(p.E)} · ${frac(U(p.R2, 'Ω'), U(p.R1 + p.R2, 'Ω'))} = ${res(U(r.Vout, 'V'))}`, 'Partitore di tensione: la quota di E proporzionale alla resistenza.') +
      step(`${V_(1)} = <var>E</var> − <var>V</var><sub>out</sub> = ${res(U(r.V1, 'V'))}`) +
      step(`<var>I</var> = ${frac(U(p.E, 'V'), U(p.R1 + p.R2, 'Ω'))} = ${res(U(r.I, 'A'))}`, 'Attenzione: il partitore vale solo a vuoto. Se colleghi un carico in parallelo a R₂, l\'uscita scende (lo vedi nel Modulo 9).'),
  });

  m2.push({
    id: 'm2-prog', title: 'Progetta il partitore', level: 2,
    gen: () => L.nice(() => {
      const E = pick([5, 9, 12, 15, 24]);
      return { E, Vo: pick([1, 1.5, 2, 2.5, 3, 3.3, 4, 5, 6, 8, 10].filter((x) => x < E)), R2: pick([1, 2, 2.2, 3.3, 4.7, 10]) * 1000 };
    }, (p) => clean((p.R2 * (p.E - p.Vo)) / p.Vo, 3), { E: 12, Vo: 5, R2: 5000 }),
    solve: (p) => ({ R1: (p.R2 * (p.E - p.Vo)) / p.Vo }),
    text: (p) => `Da <var>E</var> = ${U(p.E, 'V')} vuoi <var>V</var><sub>out</sub> = ${U(p.Vo, 'V')} ai capi di ${R_(2)} = ${U(p.R2, 'Ω')}. Quanto deve valere ${R_(1)}?`,
    fig: (p) => S.divider({ E: p.E, R1: '?', R2: p.R2 }, { arrows: false, Vout: p.Vo }),
    asks: (p, r) => [h.qR(R_(1), r.R1)],
    hint: () => 'La corrente in R₂ è V_out/R₂; la stessa corrente attraversa R₁, che ha ai capi E − V_out.',
    steps: (p, r) =>
      step(`<var>I</var> = ${frac('<var>V</var><sub>out</sub>', R_(2))} = ${frac(U(p.Vo, 'V'), U(p.R2, 'Ω'))} = ${U(p.Vo / p.R2, 'A')}`, 'Stessa corrente in R₂ e in R₁ (serie).') +
      step(`${V_(1)} = <var>E</var> − <var>V</var><sub>out</sub> = ${N(p.E)} − ${N(p.Vo)} = ${U(p.E - p.Vo, 'V')}`) +
      step(`${R_(1)} = ${frac(V_(1), '<var>I</var>')} = ${R_(2)} · ${frac('<var>E</var> − <var>V</var><sub>out</sub>', '<var>V</var><sub>out</sub>')} = ${res(U(r.R1, 'Ω'))}`, 'Problema rovesciato: invece della tensione cerchi la resistenza.'),
  });

  const LEDS = [['rosso', 2], ['giallo', 2.1], ['verde', 2.2], ['blu', 3], ['bianco', 3.2]];
  m2.push({
    id: 'm2-led', title: 'Resistore in serie a un LED', level: 2,
    defaults: { E: 9, led: 0, I: 0.02 },
    gen: () => L.nice(() => ({ E: pick([5, 9, 12]), led: rand(0, LEDS.length - 1), I: pick([0.01, 0.015, 0.02]) }), (p) => {
      const R = (p.E - LEDS[p.led][1]) / p.I;
      const list = h.e12(10, 10000);
      return R > 30 && !list.some((x) => Math.abs(x - R) / R < 0.03);
    }, { E: 9, led: 0, I: 0.02 }),
    solve: (p) => {
      const Vr = p.E - LEDS[p.led][1];
      const R = Vr / p.I;
      const list = h.e12(10, 10000);
      const k = list.findIndex((x) => x >= R);
      const opts = list.slice(Math.max(0, k - 1), k + 3);
      const Rc = list[k];
      return { Vr, R, Rc, opts, ans: opts.indexOf(Rc), Ir: Vr / Rc, P: (Vr * Vr) / Rc };
    },
    text: (p) => `Alimentazione ${U(p.E, 'V')}, LED ${LEDS[p.led][0]} con circa ${N(LEDS[p.led][1])} V ai capi, corrente desiderata ${U(p.I, 'A')}. Calcola il resistore in serie, scegli il valore commerciale della serie E12 che non supera la corrente, e trova la corrente reale.`,
    asks: (p, r) => [h.qR('<var>R</var> calcolata', r.R), h.choice('Valore E12', r.opts.map((x) => U(x, 'Ω')), r.ans), h.qI('Corrente reale', r.Ir)],
    hint: () => 'Il resistore prende la tensione che "avanza": E − V_LED. Poi Ohm.',
    steps: (p, r) =>
      step(`<var>V</var><sub>R</sub> = <var>E</var> − <var>V</var><sub>LED</sub> = ${N(p.E)} − ${N(LEDS[p.led][1])} = ${U(r.Vr, 'V')}`, 'LED e resistore sono in serie: le tensioni si sommano.') +
      step(`<var>R</var> = ${frac('<var>V</var><sub>R</sub>', '<var>I</var>')} = ${frac(N(r.Vr), N(p.I))} = ${res(U(r.R, 'Ω'))}`) +
      step(`Valore commerciale: ${res(U(r.Rc, 'Ω'))}`, 'Si prende il valore E12 subito più grande, così la corrente resta sotto quella voluta.') +
      step(`<var>I</var><sub>reale</sub> = ${frac(N(r.Vr), N(r.Rc))} = ${res(U(r.Ir, 'A'))}; <var>P</var><sub>R</sub> = ${U(r.P, 'W')}`, r.P <= 0.25 ? 'Basta un resistore da ¼ W.' : 'Serve un resistore da più di ¼ W.'),
  });

  function widgetLadder(host) {
    const c = CC.widgetCard('La scala dei potenziali', 'Ogni resistore è un gradino');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'hint';
    let prop = false;
    const tog = document.createElement('label');
    tog.className = 'switch';
    tog.innerHTML = '<input type="checkbox"><span class="track"></span><span>Larghezza proporzionale a <var>R</var></span>';
    const draw = (v) => {
      const R = [v.R1, v.R2, v.R3];
      const r = seriesSolve({ E: v.E, R });
      const W = 460, H = 230, x0 = 48, x1 = W - 16, y0 = H - 30, y1 = 18;
      const tot = prop ? r.Rq : 3;
      const ws = R.map((x) => ((x1 - x0) * (prop ? x : 1)) / tot);
      const Y = (pv) => y0 - ((y0 - y1) * pv) / Math.max(v.E, 1e-9);
      let s = `<line class="axis" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}"/><line class="axis" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}"/>`;
      let x = x0;
      let pv = v.E;
      const cols = ['var(--g1)', 'var(--g2)', 'var(--g3)'];
      const names = ['A', 'B', 'C', ''];
      R.forEach((rv, k) => {
        const nx = x + ws[k];
        const np = pv - r.Vs[k];
        s += `<rect x="${x}" y="${y1}" width="${ws[k]}" height="${y0 - y1}" fill="${cols[k]}" opacity=".07"/>`;
        s += `<line x1="${x}" y1="${Y(pv)}" x2="${nx}" y2="${Y(np)}" stroke="${cols[k]}" stroke-width="3"/>`;
        s += `<text class="small" x="${(x + nx) / 2}" y="${y0 + 16}" text-anchor="middle">R${k + 1} · ${App.si(r.Vs[k], 'V')}</text>`;
        s += `<circle cx="${x}" cy="${Y(pv)}" r="4" class="op"/><text class="small" x="${x + 6}" y="${Y(pv) - 8}">${names[k]} ${App.si(pv, 'V')}</text>`;
        x = nx;
        pv = np;
      });
      s += `<circle cx="${x}" cy="${Y(0)}" r="4" class="op"/><text class="small" x="${x - 6}" y="${Y(0) - 8}" text-anchor="end">0 V</text>`;
      s += `<text class="axname" x="${x0 + 6}" y="${y1 + 4}">potenziale</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Potenziale lungo la serie</title>${s}</svg>`;
      out.innerHTML = `<var>I</var> = ${U(r.I, 'A')}. Il gradino più alto è sul resistore più grande: la cdt è proporzionale a <var>R</var>. ` +
        (prop ? 'Con le larghezze proporzionali a R il potenziale scende lungo un\'unica retta: la pendenza è la corrente, uguale per tutti.' : 'Attiva le larghezze proporzionali: vedrai che i tre segmenti si allineano.');
    };
    const sl = CC.sliders(c, [
      { id: 'E', label: '<var>E</var> (V)', min: 1, max: 30, step: 0.5, value: 24 },
      { id: 'R1', label: '<var>R</var><sub>1</sub> (Ω)', min: 10, max: 10000, log: true, value: 100 },
      { id: 'R2', label: '<var>R</var><sub>2</sub> (Ω)', min: 10, max: 10000, log: true, value: 220 },
      { id: 'R3', label: '<var>R</var><sub>3</sub> (Ω)', min: 10, max: 10000, log: true, value: 180 },
    ], draw);
    tog.querySelector('input').addEventListener('change', (e) => { prop = e.target.checked; draw(sl.values); });
    c.append(tog, fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm2', short: 'Serie', title: 'Resistenze in serie e partitore di tensione', num: 2,
    intro: 'In serie la corrente è la stessa in ogni resistore e le resistenze si sommano; le cadute di tensione si sommano fino a dare la f.e.m.',
    goals: ['Req e corrente unica', 'Cadute di tensione e potenziali', 'Partitore di tensione', 'Progetto: partitore e LED'],
    widgets: [widgetLadder],
    example: m2[0], exampleTitle: 'Esempio 2.1 — serie completa',
    families: m2,
    theory: `
      <article class="note"><h4>Serie</h4>
        <p>Due componenti sono <strong>in serie</strong> se tra loro non c'è nessun nodo con altri rami: la stessa corrente li attraversa tutti.</p>
        <div class="eq"><span>${Req} = <var>R</var><sub>1</sub> + <var>R</var><sub>2</sub> + <var>R</var><sub>3</sub></span><span><var>I</var> = ${frac('<var>E</var>', Req)}</span><span><var>E</var> = <var>V</var><sub>1</sub> + <var>V</var><sub>2</sub> + <var>V</var><sub>3</sub></span></div>
        <p>${Req} è sempre <strong>maggiore</strong> della resistenza più grande.</p></article>
      <article class="note"><h4>Partitore di tensione</h4>
        <p>La cdt su una resistenza è la quota di <var>E</var> proporzionale al suo valore, senza calcolare prima <var>I</var>:</p>
        <div class="eq"><span><var>V</var><sub><var>k</var></sub> = <var>E</var> · ${frac('<var>R</var><sub><var>k</var></sub>', Req)}</span></div>
        <p>Vale solo <strong>a vuoto</strong>: un carico collegato all'uscita si mette in parallelo a <var>R</var><sub>2</sub> e abbassa la tensione.</p></article>
      <article class="note"><h4>Potenziali dei nodi</h4>
        <p>Fissata la massa (0 V), il potenziale di un nodo è la DDP tra quel nodo e la massa. Partendo dal + del generatore, ogni resistore attraversato nel verso della corrente fa <strong>scendere</strong> il potenziale della sua cdt. La DDP tra due nodi è la differenza dei loro potenziali.</p></article>`,
  });

  // =====================================================================
  // MODULO 3 — Parallelo e partitore di corrente
  // =====================================================================
  const m3 = [];
  const parSolve = (p) => {
    const I = p.R.map((r) => p.E / r);
    const It = I.reduce((a, b) => a + b, 0);
    return { Ik: I, It, Rq: p.E / It };
  };
  const PAR_R = [10, 12, 15, 20, 24, 30, 40, 50, 60, 75, 100, 120, 150, 200, 300];

  m3.push({
    id: 'm3-full', title: 'Parallelo completo', level: 1,
    defaults: { E: 12, R: [60, 30, 20] },
    gen: () => L.nice(() => ({ E: pick([6, 9, 10, 12, 15, 24, 30]), R: [pick(PAR_R), pick(PAR_R), pick(PAR_R)] }),
      (p) => { const r = parSolve(p); return r.Ik.every((x) => clean(x)) && clean(r.Rq, 3); }, { E: 12, R: [60, 30, 20] }),
    solve: parSolve,
    text: (p) => `<var>E</var> = ${U(p.E, 'V')} alimenta ${p.R.length === 2 ? 'due' : 'tre'} resistori in parallelo: ${p.R.map((r, k) => `${R_(k + 1)} = ${U(r, 'Ω')}`).join(', ')}. Trova le correnti di ramo, la corrente totale e ${Req}.`,
    fig: (p, r, sol) => S.parallel(p, { cur: sol ? { I: r.It, I1: r.Ik[0], I2: r.Ik[1], I3: r.Ik[2] } : null }),
    asks: (p, r) => r.Ik.map((x, k) => h.qI(I_(k + 1), x)).concat([h.qI('Totale ' + I_(), r.It), h.qR(Req, r.Rq)]),
    hint: () => 'In parallelo ogni ramo ha la stessa tensione E: applica Ohm a ciascun ramo.',
    steps: (p, r) =>
      step(`<var>V</var> = <var>E</var> = ${U(p.E, 'V')} su ogni ramo`) +
      r.Ik.map((x, k) => step(`${I_(k + 1)} = ${frac(N(p.E), N(p.R[k]))} = ${res(U(x, 'A'))}`)).join('') +
      step(`<var>I</var> = ${r.Ik.map((x) => N(x)).join(' + ')} = ${res(U(r.It, 'A'))}`, 'Legge delle correnti al nodo A.') +
      step(`${frac('1', Req)} = ${p.R.map((x) => frac('1', N(x))).join(' + ')} = ${N(1 / r.Rq)} S → ${Req} = ${res(U(r.Rq, 'Ω'))}`, 'Con le conduttanze.') +
      step(`<var>E</var>/${Req} = ${N(p.E)}/${N(r.Rq)} = ${U(r.It, 'A')}${ok}`, `${Req} = ${U(r.Rq, 'Ω')} è minore del ramo più piccolo (${U(Math.min(...p.R), 'Ω')}).`),
    table: (p) => L.rivpFromNet(DC.nets.parallel(p), DC.solve(DC.nets.parallel(p))),
  });

  m3.push({
    id: 'm3-part', title: 'Partitore di corrente', level: 1,
    defaults: { I: 1, R1: 30, R2: 20 },
    gen: () => L.nice(() => ({ I: pick([0.5, 1, 1.5, 2, 3, 4, 5]), R1: pick(PAR_R), R2: pick(PAR_R) }),
      (p) => p.R1 !== p.R2 && clean((p.I * p.R2) / (p.R1 + p.R2)) && clean((p.I * p.R1) / (p.R1 + p.R2)), { I: 1, R1: 30, R2: 20 }),
    solve: (p) => ({ I1: (p.I * p.R2) / (p.R1 + p.R2), I2: (p.I * p.R1) / (p.R1 + p.R2), Rp: DC.par(p.R1, p.R2) }),
    text: (p) => `In un parallelo di ${R_(1)} = ${U(p.R1, 'Ω')} e ${R_(2)} = ${U(p.R2, 'Ω')} entra <var>I</var> = ${U(p.I, 'A')}. Trova le due correnti senza calcolare prima la tensione, poi la tensione.`,
    fig: (p, r, sol) => S.currentDivider(p, { cur: sol ? { I1: r.I1, I2: r.I2 } : null }),
    asks: (p, r) => [h.qI(I_(1), r.I1), h.qI(I_(2), r.I2), h.qV('Tensione ' + V_(), r.Rp * p.I)],
    hint: () => 'Nella formula di I₁ al numeratore c\'è R₂, l\'altra resistenza.',
    steps: (p, r) =>
      step(`${I_(1)} = <var>I</var> · ${frac(R_(2), R_(1) + ' + ' + R_(2))} = ${N(p.I)} · ${frac(N(p.R2), N(p.R1 + p.R2))} = ${res(U(r.I1, 'A'))}`) +
      step(`${I_(2)} = <var>I</var> · ${frac(R_(1), R_(1) + ' + ' + R_(2))} = ${N(p.I)} · ${frac(N(p.R1), N(p.R1 + p.R2))} = ${res(U(r.I2, 'A'))}`, 'Più corrente nel ramo con meno resistenza.') +
      step(`<var>V</var> = ${Req} · <var>I</var> = ${N(r.Rp)} · ${N(p.I)} = ${res(U(r.Rp * p.I, 'V'))}`, `Verifica: ${R_(1)}·${I_(1)} = ${N(p.R1 * r.I1)} V${ok}`),
  });

  m3.push({
    id: 'm3-ugu', title: 'Resistori uguali', level: 1,
    gen: () => L.nice(() => ({ n: pick([2, 3]), R: pick(h.e12(100, 4700)), E: pick([5, 6, 9, 12, 24]) }), (p) => clean((p.E * p.n) / p.R) && clean(p.R / p.n, 3), { n: 2, R: 1000, E: 5 }),
    solve: (p) => ({ Rq: p.R / p.n, It: (p.E * p.n) / p.R, Ik: p.E / p.R }),
    text: (p) => `${p.n === 2 ? 'Due' : 'Tre'} resistori da ${U(p.R, 'Ω')} in parallelo su ${U(p.E, 'V')}. Trova ${Req}, la corrente totale e quella in ogni ramo.`,
    fig: (p, r, sol) => S.parallel({ E: p.E, R: Array(p.n).fill(p.R) }, { cur: sol ? { I: r.It, I1: r.Ik, I2: r.Ik, I3: r.Ik } : null }),
    asks: (p, r) => [h.qR(Req, r.Rq), h.qI('Totale ' + I_(), r.It), h.qI('Per ramo', r.Ik)],
    steps: (p, r) =>
      step(`${Req} = ${frac('<var>R</var>', '<var>n</var>')} = ${frac(N(p.R), p.n)} = ${res(U(r.Rq, 'Ω'))}`, '<var>n</var> resistori uguali in parallelo: R/n.') +
      step(`<var>I</var> = ${frac(N(p.E), N(r.Rq))} = ${res(U(r.It, 'A'))}`) +
      step(`Per ramo: ${frac('<var>I</var>', '<var>n</var>')} = ${res(U(r.Ik, 'A'))}`, 'Rami uguali, correnti uguali.'),
  });

  m3.push({
    id: 'm3-agg', title: 'Che resistore aggiungo?', level: 2,
    gen: () => L.nice(() => { const R1 = pick([100, 120, 150, 200, 220, 300, 330, 470, 600, 1000]); return { R1, Rq: pick([20, 40, 50, 60, 75, 80, 100, 120, 150, 200, 250, 300].filter((x) => x < R1 * 0.85)) }; },
      (p) => p.Rq && clean((p.R1 * p.Rq) / (p.R1 - p.Rq), 3), { R1: 300, Rq: 200 }),
    solve: (p) => ({ Rx: (p.R1 * p.Rq) / (p.R1 - p.Rq) }),
    text: (p) => `Hai un resistore da ${U(p.R1, 'Ω')} ma ti serve ${U(p.Rq, 'Ω')}. Quale resistore devi mettergli in parallelo?`,
    asks: (p, r) => [h.qR('<var>R</var><sub>x</sub>', r.Rx)],
    hint: () => 'Le conduttanze si sommano: 1/Rx = 1/Req − 1/R₁.',
    steps: (p, r) =>
      step(`${frac('1', '<var>R</var><sub>x</sub>')} = ${frac('1', Req)} − ${frac('1', R_(1))} = ${frac('1', N(p.Rq))} − ${frac('1', N(p.R1))}`, 'Problema rovesciato: dalla Req al resistore mancante.') +
      step(`<var>R</var><sub>x</sub> = ${frac(R_(1) + ' · ' + Req, R_(1) + ' − ' + Req)} = ${frac(N(p.R1) + ' · ' + N(p.Rq), N(p.R1 - p.Rq))} = ${res(U(r.Rx, 'Ω'))}`) +
      step(`${frac(N(p.R1) + ' · ' + N(r.Rx), N(p.R1 + r.Rx))} = ${U(DC.par(p.R1, r.Rx), 'Ω')}${ok}`, 'Verifica con prodotto diviso somma. Il parallelo può solo abbassare la resistenza.'),
  });

  m3.push({
    id: 'm3-err', title: 'Trova l\'errore', level: 2,
    gen: () => L.nice(() => ({ I: pick([1, 2, 3]), R1: pick(PAR_R), R2: pick(PAR_R), w: rand(0, 2) }), (p) => p.R1 !== p.R2 && clean((p.I * p.R2) / (p.R1 + p.R2)), { I: 1, R1: 30, R2: 20, w: 0 }),
    solve: (p) => {
      const I1 = (p.I * p.R2) / (p.R1 + p.R2), I2 = p.I - I1, Rp = DC.par(p.R1, p.R2);
      const lines = [
        `${Req} = ${frac(N(p.R1) + ' · ' + N(p.R2), N(p.R1) + ' + ' + N(p.R2))} = ${U(Rp, 'Ω')}`,
        `${I_(1)} = <var>I</var> · ${frac(R_(2), R_(1) + ' + ' + R_(2))} = ${N(p.I)} · ${frac(N(p.R2), N(p.R1 + p.R2))} = ${U(I1, 'A')}`,
        `${I_(2)} = <var>I</var> − ${I_(1)} = ${U(I2, 'A')}`,
      ];
      const wrong = lines.slice();
      if (p.w === 0) wrong[0] = `${Req} = ${N(p.R1)} + ${N(p.R2)} = ${U(p.R1 + p.R2, 'Ω')}`;
      if (p.w === 1) wrong[1] = `${I_(1)} = <var>I</var> · ${frac(R_(1), R_(1) + ' + ' + R_(2))} = ${N(p.I)} · ${frac(N(p.R1), N(p.R1 + p.R2))} = ${U((p.I * p.R1) / (p.R1 + p.R2), 'A')}`;
      if (p.w === 2) wrong[2] = `${I_(2)} = <var>I</var> + ${I_(1)} = ${U(p.I + I1, 'A')}`;
      return { lines, wrong };
    },
    text: (p, r) => `Un compagno ha risolto questo partitore: <var>I</var> = ${U(p.I, 'A')} entra in ${R_(1)} = ${U(p.R1, 'Ω')} // ${R_(2)} = ${U(p.R2, 'Ω')}. Uno dei tre passaggi è sbagliato.<ol class="wrong">${r.wrong.map((l) => `<li class="f">${l}</li>`).join('')}</ol>`,
    asks: (p) => [h.choice('Il passaggio sbagliato è il', ['1º', '2º', '3º'], p.w)],
    steps: (p, r) => step(r.lines[p.w], ['Due resistori in parallelo non si sommano: prodotto diviso somma.', 'Al numeratore va la resistenza dell\'altro ramo, R₂: la corrente preferisce la strada più facile.', 'La corrente entrante si divide: I₂ = I − I₁, non I + I₁.'][p.w]) + r.lines.filter((_, k) => k !== p.w).map((l) => step(l)).join(''),
  });

  function widgetSplit(host) {
    const c = CC.widgetCard('Dove va la corrente?', 'Attiva i rami e cambia le resistenze');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'hint';
    const act = [true, true, true];
    const toggles = document.createElement('div');
    toggles.className = 'row';
    [0, 1, 2].forEach((k) => {
      const t = document.createElement('label');
      t.className = 'switch';
      t.innerHTML = `<input type="checkbox" checked><span class="track"></span>Ramo ${k + 1}`;
      t.querySelector('input').addEventListener('change', (e) => {
        act[k] = e.target.checked;
        if (!act.some(Boolean)) { act[k] = true; e.target.checked = true; }
        draw(sl.values);
      });
      toggles.appendChild(t);
    });
    const cols = ['var(--g1)', 'var(--g2)', 'var(--g3)'];
    const draw = (v) => {
      const R = [v.R1, v.R2, v.R3];
      const I = R.map((r, k) => (act[k] ? v.E / r : 0));
      const It = I.reduce((a, b) => a + b, 0);
      const Rq = v.E / It;
      const W = 460;
      let s = '';
      let x = 20;
      I.forEach((ik, k) => {
        const w = ((W - 40) * ik) / It;
        if (w > 0) {
          s += `<rect x="${x}" y="30" width="${w}" height="34" fill="${cols[k]}" opacity=".85"/>`;
          if (w > 46) s += `<text x="${x + w / 2}" y="52" text-anchor="middle" class="barlbl">I${k + 1} ${Math.round((100 * ik) / It)}%</text>`;
        }
        x += w;
      });
      s += `<text class="small" x="20" y="20">Corrente totale ${App.si(It, 'A')}</text>`;
      const Rmin = Math.min(...R.filter((_, k) => act[k]));
      s += `<text class="small" x="20" y="92">R_eq = ${App.si(Rq, 'Ω')}  ·  ramo più piccolo = ${App.si(Rmin, 'Ω')}</text>`;
      const RqX = 20 + ((W - 40) * Math.min(Rq, Rmin)) / Rmin;
      s += `<rect x="20" y="100" width="${W - 40}" height="8" rx="4" fill="var(--surface-3)"/><rect x="20" y="100" width="${RqX - 20}" height="8" rx="4" fill="var(--pen)"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 118" role="img" style="width:100%;height:auto"><title>Ripartizione della corrente nei rami</title>${s}</svg>`;
      out.innerHTML = `Il ramo con la resistenza più piccola si prende la fetta più grande. Ogni ramo in più è una strada in più: la corrente totale cresce e ${Req} scende, sempre sotto il ramo più piccolo (barra blu).`;
    };
    const sl = CC.sliders(c, [
      { id: 'E', label: '<var>E</var> (V)', min: 1, max: 30, step: 0.5, value: 12 },
      { id: 'R1', label: '<var>R</var><sub>1</sub> (Ω)', min: 5, max: 1000, log: true, value: 60 },
      { id: 'R2', label: '<var>R</var><sub>2</sub> (Ω)', min: 5, max: 1000, log: true, value: 30 },
      { id: 'R3', label: '<var>R</var><sub>3</sub> (Ω)', min: 5, max: 1000, log: true, value: 20 },
    ], draw);
    c.append(toggles, fig, out);
    host.appendChild(c);
    draw(sl.values);
  }

  CC.lessons.push({
    id: 'm3', short: 'Parallelo', title: 'Resistenze in parallelo e partitore di corrente', num: 3,
    intro: 'In parallelo tutti i rami hanno la stessa tensione e la corrente totale è la somma delle correnti di ramo. La resistenza equivalente è sempre minore della più piccola.',
    goals: ['Correnti di ramo', 'Req con le conduttanze', 'Partitore di corrente', 'Trova l\'errore'],
    widgets: [widgetSplit],
    example: m3[0], exampleTitle: 'Esempio 3.1 — parallelo completo',
    families: m3,
    theory: `
      <article class="note"><h4>Parallelo</h4>
        <p>Due componenti sono <strong>in parallelo</strong> se sono collegati agli stessi due nodi: hanno la stessa tensione.</p>
        <div class="eq"><span>${frac('1', Req)} = ${frac('1', '<var>R</var><sub>1</sub>')} + ${frac('1', '<var>R</var><sub>2</sub>')} + ${frac('1', '<var>R</var><sub>3</sub>')}</span><span><var>I</var> = <var>I</var><sub>1</sub> + <var>I</var><sub>2</sub> + <var>I</var><sub>3</sub></span></div>
        <p>Casi rapidi: due resistori → <strong>prodotto diviso somma</strong>; <var>n</var> resistori uguali → <var>R</var>/<var>n</var>.</p>
        <div class="eq"><span>${Req} = ${frac('<var>R</var><sub>1</sub> · <var>R</var><sub>2</sub>', '<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>')}</span></div></article>
      <article class="note"><h4>Partitore di corrente</h4>
        <div class="eq"><span><var>I</var><sub>1</sub> = <var>I</var> · ${frac('<var>R</var><sub>2</sub>', '<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>')}</span><span><var>I</var><sub>2</sub> = <var>I</var> · ${frac('<var>R</var><sub>1</sub>', '<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>')}</span></div>
        <p>La corrente maggiore passa nella resistenza <strong>minore</strong>: nella formula di <var>I</var><sub>1</sub> c'è <var>R</var><sub>2</sub>, l'altra resistenza. È l'errore più frequente nelle verifiche.</p></article>`,
  });

  // =====================================================================
  // MODULO 4 — Circuiti misti
  // =====================================================================
  const m4 = [];
  const MIX_R = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60];
  const mixASolve = (p) => {
    const R23 = DC.par(p.R2, p.R3);
    const Rq = p.R1 + R23 + p.R4;
    const I = p.E / Rq;
    const VAB = R23 * I;
    return { R23, Rq, I, VAB, V1: p.R1 * I, V4: p.R4 * I, I2: VAB / p.R2, I3: VAB / p.R3 };
  };

  m4.push({
    id: 'm4-a', title: 'Riduzione e risalita', level: 2,
    defaults: { E: 36, R1: 8, R2: 30, R3: 60, R4: 8 },
    gen: () => L.nice(() => ({ E: pick([10, 12, 18, 20, 24, 30, 36, 48]), R1: pick(MIX_R), R2: pick(MIX_R), R3: pick(MIX_R), R4: pick(MIX_R) }),
      (p) => { const r = mixASolve(p); return clean(r.R23) && clean(r.I) && clean(r.I2) && clean(r.I3); }, { E: 36, R1: 8, R2: 30, R3: 60, R4: 8 }),
    solve: mixASolve,
    text: (p) => `<var>E</var> = ${U(p.E, 'V')}, ${R_(1)} = ${N(p.R1)} Ω, ${R_(2)} = ${N(p.R2)} Ω, ${R_(3)} = ${N(p.R3)} Ω, ${R_(4)} = ${N(p.R4)} Ω. Trova ${Req}, la corrente totale, <var>V</var><sub>AB</sub> e le correnti nei rami del parallelo.`,
    fig: (p, r, sol) => S.mixA(p, { cur: sol ? { I: r.I, I2: r.I2, I3: r.I3 } : null }),
    asks: (p, r) => [h.qR(Req, r.Rq), h.qI(I_(), r.I), h.qV('<var>V</var><sub>AB</sub>', r.VAB), h.qI(I_(2), r.I2), h.qI(I_(3), r.I3)],
    hint: () => 'R₂ e R₃ stanno tra gli stessi nodi A e B: riducile per prime.',
    steps: (p, r) =>
      step(`<var>R</var><sub>23</sub> = ${frac(N(p.R2) + ' · ' + N(p.R3), N(p.R2) + ' + ' + N(p.R3))} = ${res(U(r.R23, 'Ω'))}`, 'Riduzione, passo 1: R₂ e R₃ tra gli stessi nodi A e B → parallelo.') +
      step(`${Req} = ${N(p.R1)} + ${N(r.R23)} + ${N(p.R4)} = ${res(U(r.Rq, 'Ω'))}`, 'Passo 2: R₁, R₂₃ e R₄ sono attraversati dalla stessa corrente → serie.') +
      step(`<var>I</var> = ${frac(N(p.E), N(r.Rq))} = ${res(U(r.I, 'A'))}`, 'Risalita: la corrente totale passa in R₁ e in R₄.') +
      step(`${V_(1)} = ${U(r.V1, 'V')}, ${V_(4)} = ${U(r.V4, 'V')}, <var>V</var><sub>AB</sub> = <var>R</var><sub>23</sub>·<var>I</var> = ${res(U(r.VAB, 'V'))}`, `Oppure ${N(p.E)} − ${N(r.V1)} − ${N(r.V4)} = ${N(r.VAB)} V${ok}`) +
      step(`${I_(2)} = ${frac(N(r.VAB), N(p.R2))} = ${res(U(r.I2, 'A'))}, ${I_(3)} = ${frac(N(r.VAB), N(p.R3))} = ${res(U(r.I3, 'A'))}`, `Verifica al nodo A: ${N(r.I2)} + ${N(r.I3)} = ${N(r.I)} A${ok}`),
    table: (p) => L.rivpFromNet(DC.nets.mixA(p), DC.solve(DC.nets.mixA(p))),
  });

  const mixBSolve = (p) => {
    const R12 = p.R1 + p.R2;
    const Rq = DC.par(R12, p.R3);
    const I = p.E / Rq;
    return { R12, Rq, I, I3: p.E / p.R3, I12: p.E / R12, V1: (p.R1 * p.E) / R12, V2: (p.R2 * p.E) / R12 };
  };
  m4.push({
    id: 'm4-b', title: 'Serie dentro un parallelo', level: 2,
    defaults: { E: 12, R1: 4, R2: 8, R3: 6 },
    gen: () => L.nice(() => ({ E: pick([6, 10, 12, 15, 18, 20, 24]), R1: pick(MIX_R), R2: pick(MIX_R), R3: pick(MIX_R) }),
      (p) => { const r = mixBSolve(p); return clean(r.Rq) && clean(r.I) && clean(r.I3) && clean(r.V1); }, { E: 12, R1: 4, R2: 8, R3: 6 }),
    solve: mixBSolve,
    text: (p) => `<var>E</var> = ${U(p.E, 'V')} alimenta due rami in parallelo: ramo 1 = ${R_(1)} = ${N(p.R1)} Ω in serie con ${R_(2)} = ${N(p.R2)} Ω; ramo 2 = ${R_(3)} = ${N(p.R3)} Ω. Trova ${Req}, la corrente totale, ${I_(3)} e la tensione su ${R_(1)}.`,
    fig: (p, r, sol) => S.mixB(p, { cur: sol ? { I: r.I, I3: r.I3 } : null }),
    asks: (p, r) => [h.qR(Req, r.Rq), h.qI(I_(), r.I), h.qI(I_(3), r.I3), h.qV(V_(1), r.V1)],
    steps: (p, r) =>
      step(`<var>R</var><sub>12</sub> = ${N(p.R1)} + ${N(p.R2)} = ${U(r.R12, 'Ω')}`, 'Nel ramo 1, R₁ e R₂ sono in serie.') +
      step(`${Req} = ${frac(N(r.R12) + ' · ' + N(p.R3), N(r.R12) + ' + ' + N(p.R3))} = ${res(U(r.Rq, 'Ω'))}`, 'Poi il ramo 1 è in parallelo a R₃.') +
      step(`<var>I</var> = ${frac(N(p.E), N(r.Rq))} = ${res(U(r.I, 'A'))}`) +
      step(`${I_(3)} = ${frac(N(p.E), N(p.R3))} = ${res(U(r.I3, 'A'))}, <var>I</var><sub>12</sub> = ${frac(N(p.E), N(r.R12))} = ${U(r.I12, 'A')}`, `Ogni ramo ha ai capi E. ${N(r.I3)} + ${N(r.I12)} = ${N(r.I)} A${ok}`) +
      step(`${V_(1)} = ${R_(1)} · <var>I</var><sub>12</sub> = ${res(U(r.V1, 'V'))}`, `Partitore dentro il ramo 1; ${V_(2)} = ${U(r.V2, 'V')}, la somma fa E${ok}`),
    table: (p) => L.rivpFromNet(DC.nets.mixB(p), DC.solve(DC.nets.mixB(p))),
  });

  const mixCSolve = (p) => {
    const R34 = p.R3 + p.R4;
    const Rp = DC.par(p.R2, R34);
    const Rq = p.R1 + Rp;
    const I = p.E / Rq;
    const VA = Rp * I;
    return { R34, Rp, Rq, I, VA, I2: VA / p.R2, I34: VA / R34, V4: (p.R4 * VA) / R34 };
  };
  m4.push({
    id: 'm4-c', title: 'Parallelo con un ramo in serie', level: 3,
    gen: () => L.nice(() => ({ E: pick([12, 15, 18, 20, 24, 30, 36]), R1: pick(MIX_R), R2: pick(MIX_R), R3: pick(MIX_R), R4: pick(MIX_R) }),
      (p) => { const r = mixCSolve(p); return clean(r.Rp) && clean(r.I) && clean(r.I2) && clean(r.V4); }, { E: 24, R1: 2, R2: 12, R3: 4, R4: 8 }),
    solve: mixCSolve,
    text: (p) => `<var>E</var> = ${U(p.E, 'V')}, ${R_(1)} = ${N(p.R1)} Ω in serie; poi ${R_(2)} = ${N(p.R2)} Ω in parallelo alla serie di ${R_(3)} = ${N(p.R3)} Ω e ${R_(4)} = ${N(p.R4)} Ω. Trova ${Req}, <var>I</var>, ${I_(2)} e la tensione su ${R_(4)}.`,
    fig: (p, r, sol) => S.mixC(p, { cur: sol ? { I: r.I, I2: r.I2, I34: r.I34 } : null }),
    asks: (p, r) => [h.qR(Req, r.Rq), h.qI(I_(), r.I), h.qI(I_(2), r.I2), h.qV(V_(4), r.V4)],
    hint: () => 'Parti dal fondo: R₃ e R₄ in serie, poi in parallelo a R₂, poi in serie a R₁.',
    steps: (p, r) =>
      step(`<var>R</var><sub>34</sub> = ${N(p.R3)} + ${N(p.R4)} = ${U(r.R34, 'Ω')}`, 'Riduzione dal fondo del circuito.') +
      step(`<var>R</var><sub>p</sub> = ${frac(N(p.R2) + ' · ' + N(r.R34), N(p.R2) + ' + ' + N(r.R34))} = ${U(r.Rp, 'Ω')}`) +
      step(`${Req} = ${N(p.R1)} + ${N(r.Rp)} = ${res(U(r.Rq, 'Ω'))}`) +
      step(`<var>I</var> = ${frac(N(p.E), N(r.Rq))} = ${res(U(r.I, 'A'))}, <var>V</var><sub>A</sub> = <var>R</var><sub>p</sub>·<var>I</var> = ${U(r.VA, 'V')}`, 'Risalita.') +
      step(`${I_(2)} = ${frac(N(r.VA), N(p.R2))} = ${res(U(r.I2, 'A'))}, <var>I</var><sub>34</sub> = ${frac(N(r.VA), N(r.R34))} = ${U(r.I34, 'A')}`) +
      step(`${V_(4)} = ${R_(4)} · <var>I</var><sub>34</sub> = ${res(U(r.V4, 'V'))}`),
    table: (p) => L.rivpFromNet(DC.nets.mixC(p), DC.solve(DC.nets.mixC(p))),
  });

  const RECOG = [
    { t: 'mixA', a: [2, 3], ans: 1, why: 'R₂ e R₃ sono collegati agli stessi due nodi A e B.' },
    { t: 'mixA', a: [1, 2], ans: 2, why: 'Tra R₁ e R₂ c\'è il nodo A, dove arriva anche R₃: non sono in serie. E non hanno entrambi gli estremi in comune.' },
    { t: 'mixB', a: [1, 2], ans: 0, why: 'Nel nodo M tra R₁ e R₂ non arriva nessun altro ramo: stessa corrente, sono in serie.' },
    { t: 'mixB', a: [2, 3], ans: 2, why: 'R₂ ha un estremo nel nodo M, R₃ no: non sono in parallelo, e in mezzo c\'è il nodo di massa con altri rami.' },
    { t: 'mixC', a: [3, 4], ans: 0, why: 'Tra R₃ e R₄ non ci sono altri rami: sono in serie.' },
    { t: 'mixC', a: [2, 3], ans: 2, why: 'R₂ è in parallelo alla serie R₃ + R₄, non a R₃ da sola.' },
    { t: 'mixC', a: [1, 2], ans: 2, why: 'Nel nodo A tra R₁ e R₂ arriva anche R₃.' },
  ];
  m4.push({
    id: 'm4-ric', title: 'Riconosci i collegamenti', level: 1,
    gen: () => ({ k: rand(0, RECOG.length - 1), v: { E: 12, R1: 10, R2: 20, R3: 30, R4: 40 } }),
    solve: (p) => RECOG[p.k],
    text: (p, r) => `Nello schema, come sono collegati ${R_(r.a[0])} e ${R_(r.a[1])}?`,
    fig: (p, r) => S[r.t](p.v, { arrows: false }),
    asks: (p, r) => [h.choice('Collegamento', ['in serie', 'in parallelo', 'né in serie né in parallelo'], r.ans)],
    steps: (p, r) => step(['In serie', 'In parallelo', 'Né in serie né in parallelo'][r.ans], r.why),
  });

  function widgetReduce(host) {
    const c = CC.widgetCard('Riduci e risali, un passo alla volta', 'Esempio 4.1 del documento');
    const p = { E: 36, R1: 8, R2: 30, R3: 60, R4: 8 };
    const r = mixASolve(p);
    const stages = [
      { st: 0, hl: true, txt: `R₂ e R₃ sono collegati agli stessi nodi A e B: sono in <strong>parallelo</strong>.` },
      { st: 1, txt: `<var>R</var><sub>23</sub> = ${frac('30 · 60', '30 + 60')} = 20 Ω. Ora R₁, R₂₃ e R₄ sono attraversati dalla stessa corrente: <strong>serie</strong>.` },
      { st: 2, txt: `${Req} = 8 + 20 + 8 = 36 Ω. Il circuito è diventato un generatore con un solo resistore.` },
      { st: 2, cur: { I: r.I }, txt: `Inizia la risalita: <var>I</var> = 36 / 36 = 1 A.` },
      { st: 1, cur: { I: r.I }, txt: `Torna allo schema precedente: <var>V</var><sub>1</sub> = 8 V, <var>V</var><sub>4</sub> = 8 V, <var>V</var><sub>AB</sub> = <var>R</var><sub>23</sub>·<var>I</var> = 20 V.` },
      { st: 0, cur: { I: r.I, I2: r.I2, I3: r.I3 }, txt: `Schema originale: <var>I</var><sub>2</sub> = 20/30 = 0,667 A, <var>I</var><sub>3</sub> = 20/60 = 0,333 A. Verifica al nodo A: 0,667 + 0,333 = 1 A ✓` },
    ];
    let k = 0;
    const fig = document.createElement('div');
    const txt = document.createElement('p');
    txt.className = 'stage-txt';
    const nav = document.createElement('div');
    nav.className = 'row';
    nav.innerHTML = '<button type="button" class="btn ghost small">◀ Indietro</button><span class="tag stage-n"></span><button type="button" class="btn small">Avanti ▶</button>';
    const [prev, , next] = nav.children;
    const draw = () => {
      const s = stages[k];
      fig.innerHTML = S.mixA({ ...p, R23: r.R23, Req: r.Rq }, { stage: s.st, hl: s.hl, cur: s.cur || {}, arrows: !!s.cur }).svg;
      txt.innerHTML = s.txt;
      nav.querySelector('.stage-n').textContent = (k < 3 ? 'Riduzione ' : 'Risalita ') + (k + 1) + '/' + stages.length;
      prev.disabled = k === 0;
      next.disabled = k === stages.length - 1;
    };
    prev.addEventListener('click', () => { k = Math.max(0, k - 1); draw(); });
    next.addEventListener('click', () => { k = Math.min(stages.length - 1, k + 1); draw(); });
    c.append(fig, txt, nav);
    host.appendChild(c);
    draw();
  }

  CC.lessons.push({
    id: 'm4', short: 'Misto', title: 'Circuiti misti serie-parallelo', num: 4,
    intro: 'Il metodo ha due fasi: la riduzione (unisci serie e paralleli fino a una sola resistenza) e la risalita (dalla corrente totale torni indietro e trovi ogni tensione e corrente).',
    goals: ['Riconoscere serie e paralleli', 'Ridurre a Req', 'Risalire a tutte le grandezze'],
    widgets: [widgetReduce],
    example: m4[0], exampleTitle: 'Esempio 4.1 — riduzione e risalita',
    families: m4,
    theory: `
      <article class="note"><h4>Come riconoscere i collegamenti</h4>
        <ul>
          <li>Due resistori sono <strong>in serie</strong> se tra loro non c'è nessun nodo con altri rami.</li>
          <li>Sono <strong>in parallelo</strong> se sono collegati agli stessi due nodi.</li>
          <li>Altrimenti non sono né in serie né in parallelo: guarda i gruppi più grandi (un resistore può essere in parallelo a una <em>serie</em> di altri).</li>
        </ul></article>
      <article class="note"><h4>Riduzione e risalita</h4>
        <ol>
          <li><strong>Riduzione</strong>: parti dal punto più lontano dal generatore e unisci serie e paralleli, ridisegnando lo schema a ogni passo, fino a una sola ${Req}.</li>
          <li>Calcola la corrente totale <var>I</var> = <var>E</var>/${Req}.</li>
          <li><strong>Risalita</strong>: torna indietro sugli schemi intermedi. Nei tratti in serie conosci la corrente e trovi la tensione; nei paralleli conosci la tensione e trovi le correnti (o usi i partitori).</li>
          <li>Verifica con Kirchhoff ai nodi e con il bilancio delle potenze.</li>
        </ol></article>`,
  });
})();
