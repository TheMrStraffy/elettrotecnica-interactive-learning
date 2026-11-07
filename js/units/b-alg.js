/* Biennio — Formule inverse, proporzionalità, equazioni di primo grado, sistemi 2×2 */
(function () {
  'use strict';
  const App = window.App;
  const P = window.Phys;
  const DC = window.DC;
  const L = App.Lessons;
  const { N, U, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const v = (x) => `<var>${x}</var>`;
  const sq = (x) => `√(${x})`;
  const sg = (x) => (x < 0 ? '(' + N(x) + ')' : N(x));
  const lessons = [];

  // =====================================================================
  // 1 — Formule inverse
  // =====================================================================
  // Ogni formula: le variabili con forma esplicita, passaggi, due forme sbagliate tipiche e i valori per i conti.
  const FORMULAS = [
    { id: 'ohm', main: 'V', u: { V: 'V', R: 'Ω', I: 'A' }, gen: () => ({ R: pick([10, 47, 100, 220, 470, 1000]), I: pick([0.01, 0.02, 0.05, 0.1, 0.2, 0.5]) }), calc: { V: (x) => x.R * x.I },
      vars: {
        V: { f: `${v('R')} · ${v('I')}`, st: [] },
        R: { f: `${v('V')} / ${v('I')}`, st: [[`${v('V')} / ${v('I')} = ${v('R')}`, `Dividi entrambi i membri per ${v('I')}.`]], wrong: [`${v('V')} · ${v('I')}`, `${v('I')} / ${v('V')}`] },
        I: { f: `${v('V')} / ${v('R')}`, st: [[`${v('V')} / ${v('R')} = ${v('I')}`, `Dividi entrambi i membri per ${v('R')}.`]], wrong: [`${v('V')} · ${v('R')}`, `${v('R')} / ${v('V')}`] },
      } },
    { id: 'pot', main: 'P', u: { P: 'W', V: 'V', I: 'A' }, gen: () => ({ V: pick([5, 9, 12, 24, 230]), I: pick([0.1, 0.25, 0.5, 1, 2, 5]) }), calc: { P: (x) => x.V * x.I },
      vars: {
        P: { f: `${v('V')} · ${v('I')}`, st: [] },
        V: { f: `${v('P')} / ${v('I')}`, st: [[`${v('P')} / ${v('I')} = ${v('V')}`, `Dividi per ${v('I')}.`]], wrong: [`${v('P')} · ${v('I')}`, `${v('I')} / ${v('P')}`] },
        I: { f: `${v('P')} / ${v('V')}`, st: [[`${v('P')} / ${v('V')} = ${v('I')}`, `Dividi per ${v('V')}.`]], wrong: [`${v('P')} · ${v('V')}`, `${v('V')} / ${v('P')}`] },
      } },
    { id: 'joule', main: 'P', u: { P: 'W', R: 'Ω', I: 'A' }, gen: () => ({ R: pick([2, 5, 10, 22, 47, 100]), I: pick([0.1, 0.2, 0.5, 1, 2, 3]) }), calc: { P: (x) => x.R * x.I * x.I },
      vars: {
        P: { f: `${v('R')} · ${v('I')}²`, st: [] },
        R: { f: `${v('P')} / ${v('I')}²`, st: [[`${v('P')} / ${v('I')}² = ${v('R')}`, `Dividi per ${v('I')}².`]], wrong: [`${v('P')} / ${v('I')}`, `${v('P')} · ${v('I')}²`] },
        I: { f: sq(`${v('P')} / ${v('R')}`), st: [[`${v('P')} / ${v('R')} = ${v('I')}²`, `Dividi per ${v('R')}.`], [`${sq(`${v('P')} / ${v('R')}`)} = ${v('I')}`, 'Fai la radice quadrata di entrambi i membri: è l\'operazione inversa del quadrato.']], wrong: [`${v('P')} / ${v('R')}`, sq(`${v('P')} · ${v('R')}`)] },
      } },
    { id: 'pv2', main: 'P', u: { P: 'W', V: 'V', R: 'Ω' }, gen: () => ({ V: pick([5, 10, 12, 20, 24]), R: pick([4, 5, 8, 10, 20, 50, 100]) }), calc: { P: (x) => (x.V * x.V) / x.R },
      vars: {
        P: { f: `${v('V')}² / ${v('R')}`, st: [] },
        V: { f: sq(`${v('P')} · ${v('R')}`), st: [[`${v('P')} · ${v('R')} = ${v('V')}²`, `Moltiplica per ${v('R')}.`], [`${sq(`${v('P')} · ${v('R')}`)} = ${v('V')}`, 'Radice quadrata di entrambi i membri.']], wrong: [sq(`${v('P')} / ${v('R')}`), `${v('P')} · ${v('R')}`] },
        R: { f: `${v('V')}² / ${v('P')}`, st: [[`${v('P')} · ${v('R')} = ${v('V')}²`, `Moltiplica per ${v('R')}.`], [`${v('R')} = ${v('V')}² / ${v('P')}`, `Dividi per ${v('P')}.`]], wrong: [`${v('P')} / ${v('V')}²`, `${v('V')} / ${v('P')}`] },
      } },
    { id: 'rho', main: 'R', u: { R: 'Ω', ρ: 'Ω·mm²/m', L: 'm', S: 'mm²' }, gen: () => ({ ρ: 0.0175, L: pick([10, 20, 50, 100, 200]), S: pick([0.5, 1, 1.5, 2.5, 4]) }), calc: { R: (x) => (x.ρ * x.L) / x.S },
      vars: {
        R: { f: `${v('ρ')} · ${v('L')} / ${v('S')}`, st: [] },
        L: { f: `${v('R')} · ${v('S')} / ${v('ρ')}`, st: [[`${v('R')} · ${v('S')} = ${v('ρ')} · ${v('L')}`, `Moltiplica per ${v('S')}.`], [`${v('R')} · ${v('S')} / ${v('ρ')} = ${v('L')}`, `Dividi per ${v('ρ')}.`]], wrong: [`${v('R')} / (${v('ρ')} · ${v('S')})`, `${v('ρ')} · ${v('S')} / ${v('R')}`] },
        S: { f: `${v('ρ')} · ${v('L')} / ${v('R')}`, st: [[`${v('R')} · ${v('S')} = ${v('ρ')} · ${v('L')}`, `Moltiplica per ${v('S')}.`], [`${v('S')} = ${v('ρ')} · ${v('L')} / ${v('R')}`, `Dividi per ${v('R')}.`]], wrong: [`${v('R')} · ${v('L')} / ${v('ρ')}`, `${v('R')} / (${v('ρ')} · ${v('L')})`] },
      } },
    { id: 'gen', main: 'V', u: { V: 'V', E: 'V', r: 'Ω', I: 'A' }, gen: () => ({ E: pick([4.5, 9, 12, 24]), r: pick([0.1, 0.2, 0.5, 1, 2]), I: pick([0.5, 1, 1.5, 2]) }), calc: { V: (x) => x.E - x.r * x.I },
      vars: {
        V: { f: `${v('E')} − ${v('r')} · ${v('I')}`, st: [] },
        E: { f: `${v('V')} + ${v('r')} · ${v('I')}`, st: [[`${v('V')} + ${v('r')} · ${v('I')} = ${v('E')}`, `Somma ${v('r')}·${v('I')} a entrambi i membri: il termine "passa" dall'altra parte cambiando segno.`]], wrong: [`${v('V')} − ${v('r')} · ${v('I')}`, `${v('V')} · ${v('r')} · ${v('I')}`] },
        r: { f: `(${v('E')} − ${v('V')}) / ${v('I')}`, st: [[`${v('r')} · ${v('I')} = ${v('E')} − ${v('V')}`, `Porta ${v('V')} a destra e ${v('r')}·${v('I')} a sinistra (cambiano segno).`], [`${v('r')} = (${v('E')} − ${v('V')}) / ${v('I')}`, `Dividi per ${v('I')}.`]], wrong: [`(${v('V')} − ${v('E')}) / ${v('I')}`, `${v('E')} / ${v('I')} − ${v('V')}`] },
        I: { f: `(${v('E')} − ${v('V')}) / ${v('r')}`, st: [[`${v('r')} · ${v('I')} = ${v('E')} − ${v('V')}`, 'Isola il termine con I.'], [`${v('I')} = (${v('E')} − ${v('V')}) / ${v('r')}`, `Dividi per ${v('r')}.`]], wrong: [`${v('E')} − ${v('V')} / ${v('r')}`, `(${v('E')} + ${v('V')}) / ${v('r')}`] },
      } },
    { id: 'circ', main: 'I', u: { I: 'A', E: 'V', R: 'Ω', r: 'Ω' }, gen: () => ({ E: pick([6, 9, 12, 24]), R: pick([5, 10, 20, 47, 100]), r: pick([0.5, 1, 2]) }), calc: { I: (x) => x.E / (x.R + x.r) },
      vars: {
        I: { f: `${v('E')} / (${v('R')} + ${v('r')})`, st: [] },
        E: { f: `${v('I')} · (${v('R')} + ${v('r')})`, st: [[`${v('I')} · (${v('R')} + ${v('r')}) = ${v('E')}`, `Moltiplica per (${v('R')} + ${v('r')}), tutta la parentesi.`]], wrong: [`${v('I')} · ${v('R')} + ${v('r')}`, `${v('I')} / (${v('R')} + ${v('r')})`] },
        R: { f: `${v('E')} / ${v('I')} − ${v('r')}`, st: [[`${v('I')} · (${v('R')} + ${v('r')}) = ${v('E')}`, `Moltiplica per (${v('R')} + ${v('r')}).`], [`${v('R')} + ${v('r')} = ${v('E')} / ${v('I')}`, `Dividi per ${v('I')}.`], [`${v('R')} = ${v('E')} / ${v('I')} − ${v('r')}`, `Sottrai ${v('r')}.`]], wrong: [`${v('E')} / (${v('I')} − ${v('r')})`, `${v('E')} · ${v('I')} − ${v('r')}`] },
      } },
  ];
  const showF = (F) => `${v(F.main)} = ${F.vars[F.main].f}`;
  const inverseList = [];
  FORMULAS.forEach((F, i) => Object.keys(F.vars).forEach((x) => { if (x !== F.main) inverseList.push([i, x]); }));

  const a1 = [];
  a1.push({
    id: 'inv-scegli', title: 'Qual è la formula inversa?', level: 1,
    gen: () => { const [i, x] = pick(inverseList); return { i, x }; },
    solve: (p) => {
      const F = FORMULAS[p.i];
      const V0 = F.vars[p.x];
      const right = `${v(p.x)} = ${V0.f}`;
      const opts = App.shuffle([right, ...V0.wrong.map((w) => `${v(p.x)} = ${w}`)]);
      return { F, V0, right, opts, ans: opts.indexOf(right) };
    },
    text: (p, r) => `Da <span class="f">${showF(r.F)}</span> ricava ${v(p.x)}.`,
    asks: (p, r) => [h.choice('Formula inversa', r.opts, r.ans)],
    steps: (p, r) => step(showF(r.F), 'Formula di partenza.') + r.V0.st.map(([e, w]) => step(e, w)).join('') + step(res(r.right)),
  });
  a1.push({
    id: 'inv-calc', title: 'Ricava e calcola', level: 2,
    gen: () => {
      const [i, x] = pick(inverseList);
      const F = FORMULAS[i];
      const base = F.gen();
      base[F.main] = F.calc[F.main](base);
      return { i, x, vals: base };
    },
    solve: (p) => ({ F: FORMULAS[p.i], want: p.vals[p.x] }),
    text: (p, r) => `Formula: <span class="f">${showF(r.F)}</span>. Conosci ${Object.keys(r.F.vars).filter((k) => k !== p.x).map((k) => `${v(k)} = ${N(p.vals[k])} ${r.F.u[k]}`).join(', ')}. Trova ${v(p.x)}.`,
    asks: (p, r) => [{ label: v(p.x), unit: r.F.u[p.x], value: r.want }],
    hint: (p, r) => `Prima ricava la formula inversa: ${v(p.x)} = ${r.F.vars[p.x].f}.`,
    steps: (p, r) => r.F.vars[p.x].st.map(([e, w]) => step(e, w)).join('') + step(`${v(p.x)} = ${r.F.vars[p.x].f} = ${res(N(r.want) + ' ' + r.F.u[p.x])}`, 'Sostituisci i valori solo alla fine.'),
  });

  function widgetInverse(host) {
    const c = K.widgetCard('Rigira la formula', 'Scegli la formula e l\'incognita, poi vai avanti un passo alla volta');
    const sel = document.createElement('select');
    sel.className = 'input';
    sel.setAttribute('aria-label', 'Formula');
    sel.innerHTML = FORMULAS.map((F, i) => `<option value="${i}">${F.main} = ${F.vars[F.main].f.replace(/<[^>]+>/g, '')}</option>`).join('');
    sel.style.maxWidth = '280px';
    const vars = document.createElement('div');
    vars.className = 'seg';
    const box = document.createElement('ol');
    box.className = 'steps';
    const nav = document.createElement('div');
    nav.className = 'row';
    nav.innerHTML = '<button type="button" class="btn small">Passo successivo</button><button type="button" class="btn ghost small">Ricomincia</button>';
    const [next, reset] = nav.children;
    let F = FORMULAS[0], x = 'I', k = 0;
    const draw = () => {
      const st = F.vars[x].st;
      let s = step(showF(F), 'Formula di partenza. Quello che fai a un membro lo devi fare anche all\'altro.');
      st.slice(0, k).forEach(([e, w]) => { s += step(e, w); });
      if (k >= st.length) s += step(res(`${v(x)} = ${F.vars[x].f}`), x === F.main ? 'È già la forma diretta.' : 'Formula inversa pronta.');
      box.innerHTML = s;
      next.disabled = k >= st.length;
      vars.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.x === x)));
    };
    const pickF = () => {
      F = FORMULAS[Number(sel.value)];
      vars.innerHTML = Object.keys(F.vars).map((y) => `<button type="button" data-x="${y}">Trova ${y}</button>`).join('');
      x = Object.keys(F.vars).find((y) => y !== F.main);
      k = 0;
      draw();
    };
    vars.addEventListener('click', (e) => { if (e.target.dataset.x) { x = e.target.dataset.x; k = 0; draw(); } });
    sel.addEventListener('change', pickF);
    next.addEventListener('click', () => { k++; draw(); });
    reset.addEventListener('click', () => { k = 0; draw(); });
    c.append(sel, vars, box, nav);
    host.appendChild(c);
    sel.value = '2';
    pickF();
  }

  lessons.push({
    id: 'inverse', num: 1, short: 'Formule inverse', title: 'Formule inverse',
    intro: 'Una formula è un\'uguaglianza: per ricavare un\'altra grandezza fai la stessa operazione su entrambi i membri finché l\'incognita resta da sola. Ogni operazione ha la sua inversa.',
    goals: ['Operazioni inverse', 'Formule con quadrati e radici', 'Sostituire alla fine'],
    widgets: [widgetInverse],
    example: a1[1], exampleTitle: 'Esempio: ricava e calcola',
    families: a1,
    theory: `
      <article class="note"><h4>Le operazioni inverse</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Se l'incognita è…</th><th>…fai a entrambi i membri</th></tr></thead><tbody>
          <tr><td>sommata a qualcosa</td><td>sottrai</td></tr><tr><td>sottratta</td><td>somma</td></tr>
          <tr><td>moltiplicata</td><td>dividi</td></tr><tr><td>divisa</td><td>moltiplica</td></tr>
          <tr><td>al quadrato</td><td>radice quadrata</td></tr></tbody></table></div>
        <p>"Portare dall'altra parte cambiando segno" è solo la scorciatoia di sommare o sottrarre lo stesso termine a entrambi i membri.</p></article>
      <article class="note"><h4>Il metodo</h4>
        <ol><li>Guarda dove si trova l'incognita e quali operazioni la "avvolgono".</li>
          <li>Togli gli involucri dall'esterno verso l'interno: prima somme e sottrazioni, poi prodotti e divisioni, poi potenze.</li>
          <li>Sostituisci i numeri solo alla fine, con le unità.</li>
          <li>Controlla con l'analisi dimensionale: <span class="f"><var>I</var> = √(<var>P</var>/<var>R</var>)</span> deve dare ampere.</li></ol></article>
      <article class="note"><h4>Attenzione alle parentesi</h4>
        <p>In <span class="f"><var>I</var> = <var>E</var>/(<var>R</var> + <var>r</var>)</span> il denominatore è tutta la somma: moltiplicando si ottiene <span class="f"><var>I</var>·(<var>R</var> + <var>r</var>) = <var>E</var></span>, non <var>I</var>·<var>R</var> + <var>r</var>.</p></article>`,
  });

  // =====================================================================
  // 2 — Proporzionalità e grafici
  // =====================================================================
  const a2 = [];
  const KINDS = [
    { k: 'diretta', f: (x, c) => c * x, law: '<var>y</var> = <var>k</var> · <var>x</var>', test: '<var>y</var> / <var>x</var> è costante' },
    { k: 'inversa', f: (x, c) => c / x, law: '<var>y</var> = <var>k</var> / <var>x</var>', test: '<var>x</var> · <var>y</var> è costante' },
    { k: 'quadratica', f: (x, c) => c * x * x, law: '<var>y</var> = <var>k</var> · <var>x</var>²', test: '<var>y</var> / <var>x</var>² è costante' },
  ];
  a2.push({
    id: 'prop-tipo', title: 'Che proporzionalità è?', level: 1,
    gen: () => ({ t: rand(0, 2), c: pick([2, 3, 4, 5, 6, 12, 24]), xs: [1, 2, 3, 4] }),
    solve: (p) => ({ K0: KINDS[p.t], ys: p.xs.map((x) => KINDS[p.t].f(x, p.c)) }),
    text: (p, r) => `Questi dati vengono da un esperimento. Che legame c'è tra <var>x</var> e <var>y</var>?
      <div class="table-wrap"><table class="tbl" style="width:auto"><tbody><tr><th>x</th>${p.xs.map((x) => `<td>${x}</td>`).join('')}</tr><tr><th>y</th>${r.ys.map((y) => `<td>${N(y)}</td>`).join('')}</tr></tbody></table></div>`,
    asks: (p) => [h.choice('Proporzionalità', KINDS.map((k) => k.k), p.t)],
    hint: () => 'Calcola y/x, x·y e y/x² per ogni colonna: quello che resta costante ti dà la risposta.',
    steps: (p, r) => step(`${r.K0.test}: ${p.xs.map((x, i) => N(p.t === 0 ? r.ys[i] / x : p.t === 1 ? r.ys[i] * x : r.ys[i] / (x * x))).join(', ')}`, 'È sempre lo stesso numero, la costante k = ' + N(p.c) + '.') +
      step(`Proporzionalità ${res(r.K0.k)}: ${r.K0.law}`, ['Raddoppiando x raddoppia y: il grafico è una retta che passa per l\'origine.', 'Raddoppiando x, y si dimezza: il grafico è un\'iperbole.', 'Raddoppiando x, y quadruplica: il grafico è una parabola.'][p.t]),
  });
  a2.push({
    id: 'prop-k', title: 'Dalla tabella alla resistenza', level: 1,
    gen: () => ({ R: pick([10, 22, 47, 100, 220, 470]), Vs: [2, 4, 6, 8, 10] }),
    solve: (p) => ({ Is: p.Vs.map((x) => x / p.R) }),
    text: (p, r) => `Misure su un resistore:
      <div class="table-wrap"><table class="tbl" style="width:auto"><tbody><tr><th><var>V</var> (V)</th>${p.Vs.map((x) => `<td>${x}</td>`).join('')}</tr><tr><th><var>I</var> (mA)</th>${r.Is.map((x) => `<td>${N(x * 1000, 3)}</td>`).join('')}</tr></tbody></table></div>
      <var>V</var> e <var>I</var> sono direttamente proporzionali. Quanto vale la costante di proporzionalità, cioè la resistenza?`,
    asks: (p) => [{ label: '<var>R</var> = <var>V</var>/<var>I</var>', unit: 'Ω', value: p.R }],
    steps: (p, r) => step(`<var>R</var> = ${frac('<var>V</var>', '<var>I</var>')} = ${frac(N(p.Vs[0]), N(r.Is[0]))} = ${res(U(p.R, 'Ω'))}`, 'Prendi una colonna qualsiasi: il rapporto è sempre lo stesso. È la legge di Ohm.') +
      step('Il grafico <var>I</var>–<var>V</var> è una retta per l\'origine', 'La pendenza della retta I(V) è 1/R: più la retta è ripida, più piccola è la resistenza.'),
  });
  const FACT = [
    { g: () => ({ n: pick([2, 3, 4, 0.5]) }), m: ({ n }) => ({ t: `In <span class="f"><var>P</var> = <var>R</var>·<var>I</var>²</span>, con <var>R</var> costante, la corrente viene moltiplicata per ${N(n)}. Per quanto viene moltiplicata la potenza?`, f: n * n, why: `Proporzionalità quadratica: il fattore va al quadrato, ${N(n)}² = ${N(n * n)}.` }) },
    { g: () => ({ n: pick([2, 3, 4, 5]) }), m: ({ n }) => ({ t: `In <span class="f"><var>I</var> = <var>V</var>/<var>R</var></span>, con <var>V</var> costante, la resistenza diventa ${n} volte più grande. Per quanto viene moltiplicata la corrente?`, f: 1 / n, why: `Proporzionalità inversa: la corrente diventa 1/${n} = ${N(1 / n)}.` }) },
    { g: () => ({ a: pick([2, 3]), b: pick([2, 4]) }), m: ({ a, b }) => ({ t: `In <span class="f"><var>R</var> = ρ<var>L</var>/<var>S</var></span> la lunghezza viene moltiplicata per ${a} e la sezione per ${b}. Per quanto viene moltiplicata la resistenza?`, f: a / b, why: `Diretta con L (× ${a}), inversa con S (÷ ${b}): ${a}/${b} = ${N(a / b)}.` }) },
    { g: () => ({ n: pick([2, 3, 10]) }), m: ({ n }) => ({ t: `Nella legge di Coulomb la forza è inversamente proporzionale al quadrato della distanza. Se la distanza viene moltiplicata per ${n}, per quanto viene moltiplicata la forza?`, f: 1 / (n * n), why: `Inversa quadratica: 1/${n}² = ${N(1 / (n * n))}.` }) },
    { g: () => ({ n: pick([2, 3]) }), m: ({ n }) => ({ t: `In <span class="f"><var>P</var> = <var>V</var>²/<var>R</var></span>, con <var>R</var> costante, la tensione viene moltiplicata per ${n}. Per quanto viene moltiplicata la potenza?`, f: n * n, why: `La tensione è al quadrato: ${n}² = ${n * n}.` }) },
  ];
  a2.push({
    id: 'prop-fatt', title: 'Di quanto cambia?', level: 2,
    gen: () => { const k = rand(0, FACT.length - 1); return { k, q: FACT[k].g() }; },
    solve: (p) => FACT[p.k].m(p.q),
    text: (p, r) => r.t,
    asks: (p, r) => [{ label: 'Fattore', unit: '×', value: r.f }],
    hint: () => 'Non servono i valori: basta sapere che tipo di proporzionalità lega le grandezze.',
    steps: (p, r) => step(`Fattore = ${res(N(r.f))}`, r.why),
  });

  function widgetProp(host) {
    const c = K.widgetCard('Tre tipi di proporzionalità', 'Muovi x e premi "raddoppia"');
    const seg = document.createElement('div');
    seg.className = 'seg';
    const CASES = [
      { k: 'diretta', lbl: 'Diretta: <var>I</var> = <var>V</var>/<var>R</var>, R = 100 Ω', x: 'V', xu: 'V', y: 'I', yu: 'A', f: (x) => x / 100, max: 20 },
      { k: 'inversa', lbl: 'Inversa: <var>I</var> = <var>V</var>/<var>R</var>, V = 12 V', x: 'R', xu: 'Ω', y: 'I', yu: 'A', f: (x) => 12 / x, max: 100, min: 5 },
      { k: 'quadratica', lbl: 'Quadratica: <var>P</var> = <var>R</var>·<var>I</var>², R = 10 Ω', x: 'I', xu: 'A', y: 'P', yu: 'W', f: (x) => 10 * x * x, max: 3 },
    ];
    seg.innerHTML = CASES.map((x, i) => `<button type="button" data-i="${i}">${x.k}</button>`).join('');
    const lbl = document.createElement('p');
    lbl.className = 'f widget-out';
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn ghost small';
    btn.textContent = 'Raddoppia x';
    let ci = 0, xv = 4, prev = null;
    const draw = () => {
      const C0 = CASES[ci];
      const xmin = C0.min || 0;
      xv = App.clamp(xv, Math.max(xmin, C0.max / 40), C0.max);
      const ymax = K.niceMax(Math.max(...Array.from({ length: 50 }, (_, k) => C0.f(Math.max(xmin, C0.max / 40) + ((C0.max - Math.max(xmin, C0.max / 40)) * k) / 49))));
      const ch = K.chart({ W: 420, H: 220, xmax: C0.max, ymax, xu: C0.xu, yu: C0.yu, xlabel: C0.x, ylabel: C0.y });
      let d = '';
      for (let k = 0; k <= 120; k++) { const x = Math.max(xmin, C0.max / 40) + ((C0.max - Math.max(xmin, C0.max / 40)) * k) / 120; d += (k ? 'L' : 'M') + ch.X(x).toFixed(1) + ' ' + ch.Y(Math.min(C0.f(x), ymax)).toFixed(1); }
      let s = ch.s + `<path class="gen" d="${d}"/>`;
      if (prev) s += `<circle cx="${ch.X(prev)}" cy="${ch.Y(C0.f(prev))}" r="5" fill="var(--ink-3)"/>`;
      s += `<circle class="op" cx="${ch.X(xv)}" cy="${ch.Y(C0.f(xv))}" r="6"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 420 220" role="img" style="width:100%;height:auto"><title>Grafico della proporzionalità ${C0.k}</title>${s}</svg>`;
      lbl.innerHTML = C0.lbl;
      out.innerHTML = `${C0.x} = ${App.si(xv, C0.xu)} → ${C0.y} = ${res(App.si(C0.f(xv), C0.yu))}` + (prev ? ` <span class="hint">prima: ${C0.y} = ${App.si(C0.f(prev), C0.yu)}, fattore × ${N(C0.f(xv) / C0.f(prev), 3)}</span>` : '');
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === ci)));
      btn.disabled = xv * 2 > C0.max;
    };
    seg.addEventListener('click', (e) => { if (e.target.dataset.i) { ci = Number(e.target.dataset.i); xv = CASES[ci].max / 5; prev = null; sl.fields.x.set(xv / CASES[ci].max * 100); draw(); } });
    const sl = K.sliders(c, [{ id: 'x', label: 'x (in % del massimo)', min: 2, max: 100, step: 1, value: 20, sig: 3 }], (vv) => { prev = null; xv = (vv.x / 100) * CASES[ci].max; draw(); });
    btn.addEventListener('click', () => { prev = xv; xv = xv * 2; sl.fields.x.set((xv / CASES[ci].max) * 100); draw(); });
    c.querySelector('.card-head').after(seg);
    c.insertBefore(lbl, c.querySelector('.fields'));
    c.append(btn, fig, out);
    host.appendChild(c);
    xv = CASES[0].max / 5;
    draw();
  }

  lessons.push({
    id: 'proporzioni', num: 2, short: 'Proporzionalità', title: 'Proporzionalità e grafici',
    intro: 'Molte leggi dell\'elettrotecnica sono proporzionalità: diretta (V e I in un resistore), inversa (I e R a tensione costante), quadratica (P e I). Riconoscerle permette di prevedere i risultati senza fare conti.',
    goals: ['Diretta, inversa, quadratica', 'Riconoscere dai dati', 'Fattori di scala'],
    widgets: [widgetProp],
    example: a2[1], exampleTitle: 'Esempio: dalla tabella alla resistenza',
    families: a2,
    theory: `
      <article class="note"><h4>Tre leggi</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Tipo</th><th>Legge</th><th>Grafico</th><th>Se x raddoppia</th></tr></thead><tbody>
          <tr><td>Diretta</td><td class="f"><var>y</var> = <var>k</var>·<var>x</var></td><td>retta per l'origine</td><td>y raddoppia</td></tr>
          <tr><td>Inversa</td><td class="f"><var>y</var> = <var>k</var>/<var>x</var></td><td>iperbole</td><td>y si dimezza</td></tr>
          <tr><td>Quadratica</td><td class="f"><var>y</var> = <var>k</var>·<var>x</var>²</td><td>parabola</td><td>y quadruplica</td></tr></tbody></table></div></article>
      <article class="note"><h4>Nelle formule elettriche</h4>
        <ul><li><span class="f"><var>V</var> = <var>R</var>·<var>I</var></span>: con R costante V e I sono direttamente proporzionali, k = R.</li>
          <li><span class="f"><var>I</var> = <var>V</var>/<var>R</var></span>: con V costante, I e R sono inversamente proporzionali.</li>
          <li><span class="f"><var>P</var> = <var>R</var>·<var>I</var>²</span>: con R costante, P cresce con il quadrato della corrente.</li>
          <li><span class="f"><var>F</var> = <var>k</var><var>Q</var><sub>1</sub><var>Q</var><sub>2</sub>/<var>r</var>²</span>: inversa quadratica con la distanza.</li></ul></article>`,
  });

  // =====================================================================
  // 3 — Equazioni di primo grado
  // =====================================================================
  const a3 = [];
  const eqHTML = (a, b, c, d) => `${coef(a)}<var>x</var> ${b < 0 ? '−' : '+'} ${N(Math.abs(b))} = ${c ? coef(c) + '<var>x</var> ' + (d < 0 ? '−' : '+') + ' ' + N(Math.abs(d)) : N(d)}`;
  function coef(a) { return a === 1 ? '' : a === -1 ? '−' : N(a); }
  const eqSteps = (a, b, c, d) => {
    const x = (d - b) / (a - c);
    let s = step(eqHTML(a, b, c, d), 'Equazione di partenza.');
    if (c) s += step(`${coef(a)}<var>x</var> ${c < 0 ? '+' : '−'} ${N(Math.abs(c))}<var>x</var> = ${N(d)} ${b < 0 ? '+' : '−'} ${N(Math.abs(b))}`, 'Porta i termini con x a sinistra e i numeri a destra, cambiando segno.');
    else s += step(`${coef(a)}<var>x</var> = ${N(d)} ${b < 0 ? '+' : '−'} ${N(Math.abs(b))}`, `${b < 0 ? 'Somma' : 'Sottrai'} ${N(Math.abs(b))} a entrambi i membri.`);
    s += step(`${N(a - c)}<var>x</var> = ${N(d - b)}`, 'Riduci i termini simili.');
    s += step(`<var>x</var> = ${frac(N(d - b), sg(a - c))} = ${res(N(x))}`, `Dividi entrambi i membri per ${N(a - c)}.`);
    s += step(`Verifica: ${N(a)}·${sg(x)} ${b < 0 ? '−' : '+'} ${N(Math.abs(b))} = ${N(a * x + b)} e ${c ? N(c) + '·' + sg(x) + (d < 0 ? ' − ' : ' + ') + N(Math.abs(d)) + ' = ' : ''}${N(c * x + d)}${ok}`);
    return s;
  };
  a3.push({
    id: 'eq-1', title: 'Equazione semplice', level: 1,
    gen: () => { const a = pick([2, 3, 4, 5, -2, -3]); const x = rand(-9, 9); const b = rand(-20, 20) || 3; return { a, b, c: 0, d: a * x + b }; },
    solve: (p) => ({ x: (p.d - p.b) / p.a }),
    text: (p) => `Risolvi: <span class="f">${eqHTML(p.a, p.b, 0, p.d)}</span>`,
    asks: (p, r) => [{ label: '<var>x</var>', unit: '', value: r.x, tol: 0.001 }],
    steps: (p) => eqSteps(p.a, p.b, 0, p.d),
  });
  a3.push({
    id: 'eq-2', title: 'Incognita da entrambe le parti', level: 2,
    gen: () => { let a, c; do { a = rand(-6, 9); c = rand(-6, 6); } while (a === c || !a || !c); const x = pick([-4, -3, -2, -1.5, -1, 0.5, 1, 2, 2.5, 3, 4, 5]); const b = rand(-15, 15) || 2; return { a, b, c, d: (a - c) * x + b }; },
    solve: (p) => ({ x: (p.d - p.b) / (p.a - p.c) }),
    text: (p) => `Risolvi: <span class="f">${eqHTML(p.a, p.b, p.c, p.d)}</span>`,
    asks: (p, r) => [{ label: '<var>x</var>', unit: '', value: r.x, tol: 0.001 }],
    hint: () => 'Termini con x a sinistra, numeri a destra: chi passa dall\'altra parte cambia segno.',
    steps: (p) => eqSteps(p.a, p.b, p.c, p.d),
  });
  const APPS = [
    {
      g: () => ({ E: pick([9, 12, 24]), r: pick([0.5, 1, 2]), R: pick([4, 5, 10, 11]) }),
      m: ({ E, r, R }) => { const I2 = E / (R + r); return { t: `Un generatore con <var>E</var> = ${E} V e <var>r</var> = ${N(r)} Ω fa scorrere <var>I</var> = ${N(I2)} A in un carico. Dall'equazione <span class="f"><var>E</var> = (<var>R</var> + <var>r</var>)·<var>I</var></span> trova <var>R</var>.`, x: R, u: 'Ω', st: step(`${E} = (<var>R</var> + ${N(r)}) · ${N(I2)}`) + step(`<var>R</var> + ${N(r)} = ${frac(E, N(I2))} = ${N(E / I2)}`, 'Dividi per I.') + step(`<var>R</var> = ${N(E / I2)} − ${N(r)} = ${res(N(R) + ' Ω')}`) }; },
    },
    {
      g: () => { const E = pick([10, 12, 15, 20]); return { E, R1: pick([1, 2, 3, 4, 6]) * 1000, Vo: pick([2, 4, 5, 6].filter((x) => x < E)) }; },
      m: ({ E, R1, Vo }) => { const R2 = (Vo * R1) / (E - Vo); return { t: `In un partitore <span class="f"><var>V</var><sub>out</sub> = <var>E</var>·<var>R</var><sub>2</sub>/(<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>)</span> con <var>E</var> = ${E} V, <var>R</var><sub>1</sub> = ${U(R1, 'Ω')}, vuoi <var>V</var><sub>out</sub> = ${Vo} V. Trova <var>R</var><sub>2</sub>.`, x: R2, u: 'Ω', st: step(`${Vo}·(<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>) = ${E}·<var>R</var><sub>2</sub>`, 'Moltiplica per il denominatore.') + step(`${Vo}·<var>R</var><sub>1</sub> = (${E} − ${Vo})·<var>R</var><sub>2</sub>`, 'Termini con R₂ da una parte, il resto dall\'altra.') + step(`<var>R</var><sub>2</sub> = ${frac(Vo + ' · ' + N(R1), N(E - Vo))} = ${res(U(R2, 'Ω'))}`) }; },
    },
    {
      g: () => ({ R0: pick([100, 200, 1000]), t: pick([20, 40, 50, 80, 100]) }),
      m: ({ R0, t }) => { const a = 0.004; const Rt = R0 * (1 + a * t); return { t: `Un filo di metallo con α = 0,004 °C⁻¹ ha <var>R</var><sub>0</sub> = ${R0} Ω a 0 °C. Da <span class="f"><var>R</var><sub><var>t</var></sub> = <var>R</var><sub>0</sub>(1 + α<var>t</var>)</span>, a che temperatura vale ${N(Rt)} Ω?`, x: t, u: '°C', st: step(`1 + α<var>t</var> = ${frac(N(Rt), R0)} = ${N(Rt / R0)}`, 'Dividi per R₀.') + step(`α<var>t</var> = ${N(Rt / R0 - 1)}`, 'Sottrai 1.') + step(`<var>t</var> = ${frac(N(Rt / R0 - 1), '0,004')} = ${res(N(t) + ' °C')}`, 'Dividi per α. È il principio dei termometri a resistenza.') }; },
    },
  ];
  a3.push({
    id: 'eq-fis', title: 'Equazioni dai circuiti', level: 2,
    gen: () => { const k = rand(0, APPS.length - 1); return { k, q: APPS[k].g() }; },
    solve: (p) => APPS[p.k].m(p.q),
    text: (p, r) => r.t,
    asks: (p, r) => [{ label: 'Risultato', unit: r.u, value: r.x }],
    steps: (p, r) => r.st,
  });
  a3.push({
    id: 'eq-err', title: 'Trova l\'errore', level: 2,
    gen: () => { let a, c; do { a = rand(2, 7); c = rand(-4, 4); } while (a === c || !c); const x = rand(-5, 6); const b = rand(-12, 12) || 4; return { a, b, c, d: (a - c) * x + b, w: rand(0, 2) }; },
    solve: (p) => {
      const lines = [
        `${coef(p.a)}<var>x</var> ${p.c < 0 ? '+' : '−'} ${N(Math.abs(p.c))}<var>x</var> = ${N(p.d)} ${p.b < 0 ? '+' : '−'} ${N(Math.abs(p.b))}`,
        `${N(p.a - p.c)}<var>x</var> = ${N(p.d - p.b)}`,
        `<var>x</var> = ${N((p.d - p.b) / (p.a - p.c))}`,
      ];
      const wrong = lines.slice();
      if (p.w === 0) wrong[0] = `${coef(p.a)}<var>x</var> ${p.c < 0 ? '−' : '+'} ${N(Math.abs(p.c))}<var>x</var> = ${N(p.d)} ${p.b < 0 ? '+' : '−'} ${N(Math.abs(p.b))}`;
      if (p.w === 1) wrong[1] = `${N(p.a - p.c)}<var>x</var> = ${N(p.d + p.b)}`;
      if (p.w === 2) wrong[2] = `<var>x</var> = ${N((p.a - p.c) / (p.d - p.b || 1))}`;
      return { lines, wrong };
    },
    text: (p, r) => `Svolgimento di <span class="f">${eqHTML(p.a, p.b, p.c, p.d)}</span>:<ol class="wrong">${r.wrong.map((l) => `<li class="f">${l}</li>`).join('')}</ol>Uno dei passaggi è sbagliato.`,
    asks: (p) => [h.choice('Il passaggio sbagliato è il', ['1º', '2º', '3º'], p.w)],
    steps: (p, r) => step(r.lines[p.w], ['Un termine che passa dall\'altra parte cambia segno: il termine con x a destra va portato a sinistra con il segno opposto.', 'Il numero che passa a destra cambia segno: d − b, non d + b.', 'Per isolare x si divide il termine noto per il coefficiente di x, non il contrario.'][p.w]),
  });

  function widgetEq(host) {
    const c = K.widgetCard('Un passo alla volta', 'Ogni passaggio fa la stessa cosa ai due membri');
    const box = document.createElement('ol');
    box.className = 'steps';
    const nav = document.createElement('div');
    nav.className = 'row';
    nav.innerHTML = '<button type="button" class="btn small">Passo successivo</button><button type="button" class="btn ghost small">Nuova equazione</button>';
    const [next, nuova] = nav.children;
    let eq, k;
    const fresh = () => {
      let a, cc;
      do { a = rand(-5, 9); cc = rand(-5, 5); } while (a === cc || !a);
      const x = rand(-6, 6);
      const b = rand(-12, 12) || 5;
      eq = { a, b, c: cc, d: (a - cc) * x + b };
      k = 1;
      draw();
    };
    const draw = () => {
      const tmp = document.createElement('ol');
      tmp.innerHTML = eqSteps(eq.a, eq.b, eq.c, eq.d);
      const items = [...tmp.children];
      box.innerHTML = items.slice(0, k).map((li) => li.outerHTML).join('');
      next.disabled = k >= items.length;
    };
    next.addEventListener('click', () => { k++; draw(); });
    nuova.addEventListener('click', fresh);
    c.append(box, nav);
    host.appendChild(c);
    fresh();
  }

  lessons.push({
    id: 'equazioni', num: 3, short: 'Equazioni', title: 'Equazioni di primo grado',
    intro: 'Un\'equazione è una bilancia in equilibrio: puoi sommare, sottrarre, moltiplicare o dividere, purché lo faccia su entrambi i piatti. Così si trova l\'incognita, e così si progettano i circuiti.',
    goals: ['Principi di equivalenza', 'Incognita da entrambe le parti', 'Equazioni dai circuiti', 'Verifica'],
    widgets: [widgetEq],
    example: a3[1], exampleTitle: 'Esempio: incognita da entrambe le parti',
    families: a3,
    theory: `
      <article class="note"><h4>I due principi di equivalenza</h4>
        <ol><li>Sommando o sottraendo lo stesso numero (o termine) a entrambi i membri si ottiene un'equazione equivalente. Da qui la regola del "trasporto": un termine passa dall'altra parte cambiando segno.</li>
          <li>Moltiplicando o dividendo entrambi i membri per lo stesso numero <strong>diverso da zero</strong> si ottiene un'equazione equivalente.</li></ol></article>
      <article class="note"><h4>Procedura</h4>
        <ol><li>Togli le parentesi e i denominatori.</li><li>Porta i termini con <var>x</var> a sinistra e i numeri a destra.</li>
          <li>Riduci i termini simili: <var>a</var><var>x</var> = <var>b</var>.</li><li>Dividi per <var>a</var>: <var>x</var> = <var>b</var>/<var>a</var>.</li><li>Verifica sostituendo nell'equazione di partenza.</li></ol>
        <p>Se <var>a</var> = 0 l'equazione è impossibile (0 = <var>b</var> con <var>b</var> ≠ 0) o indeterminata (0 = 0).</p></article>`,
  });

  // =====================================================================
  // 4 — Sistemi 2×2
  // =====================================================================
  const a4 = [];
  const sysGen = () => {
    let a, b, c, d;
    do { [a, b, c, d] = [rand(-5, 6), rand(-5, 6), rand(-5, 6), rand(-5, 6)]; } while (a * d - b * c === 0 || !a || !b || !c || !d);
    const x = rand(-5, 6), y = rand(-5, 6);
    return { a, b, c, d, e: a * x + b * y, f: c * x + d * y };
  };
  const term = (k, nm, first) => (k === 0 ? '' : `${k < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '}${Math.abs(k) === 1 ? '' : N(Math.abs(k))}<var>${nm}</var>`);
  const sysHTML = (p, x = 'x', y = 'y') => `<span class="sys"><span>${term(p.a, x, true)}${term(p.b, y)} = ${N(p.e)}</span><span>${term(p.c, x, true)}${term(p.d, y)} = ${N(p.f)}</span></span>`;
  const cramerSteps = (p, x = 'x', y = 'y') => {
    const s = P.solve2(p.a, p.b, p.c, p.d, p.e, p.f);
    return step(`Δ = ${N(p.a)}·${sg(p.d)} − ${sg(p.b)}·${sg(p.c)} = ${res(N(s.D))}`, 'Determinante dei coefficienti.') +
      step(`Δ<sub>${x}</sub> = ${N(p.e)}·${sg(p.d)} − ${sg(p.b)}·${sg(p.f)} = ${N(s.Dx)}`, 'Sostituisci la colonna dei coefficienti di x con i termini noti.') +
      step(`Δ<sub>${y}</sub> = ${N(p.a)}·${sg(p.f)} − ${sg(p.e)}·${sg(p.c)} = ${N(s.Dy)}`, 'Ora la colonna di y.') +
      step(`<var>${x}</var> = ${frac(N(s.Dx), N(s.D))} = ${res(N(s.x))}; <var>${y}</var> = ${frac(N(s.Dy), N(s.D))} = ${res(N(s.y))}`);
  };
  a4.push({
    id: 'sis-sost', title: 'Metodo di sostituzione', level: 2,
    gen: () => { let b, c, d; do { b = rand(-4, 5); c = rand(-5, 6); d = rand(-5, 6); } while (!b || !c || !d || d - b * c === 0); const x = rand(-5, 6), y = rand(-5, 6); return { a: 1, b, c, d, e: x + b * y, f: c * x + d * y }; },
    solve: (p) => P.solve2(p.a, p.b, p.c, p.d, p.e, p.f),
    text: (p) => `Risolvi con il metodo di sostituzione: ${sysHTML(p)}`,
    asks: (p, r) => [{ label: '<var>x</var>', unit: '', value: r.x, tol: 0.001 }, { label: '<var>y</var>', unit: '', value: r.y, tol: 0.001 }],
    hint: () => 'Nella prima equazione x ha coefficiente 1: ricava x e sostituiscilo nella seconda.',
    steps: (p, r) => step(`<var>x</var> = ${N(p.e)}${p.b < 0 ? ' + ' : ' − '}${Math.abs(p.b) === 1 ? '' : N(Math.abs(p.b))}<var>y</var>`, 'Ricava x dalla prima equazione.') +
      step(`${N(p.c)}·(${N(p.e)}${p.b < 0 ? ' + ' : ' − '}${N(Math.abs(p.b))}<var>y</var>)${term(p.d, 'y')} = ${N(p.f)}`, 'Sostituisci nella seconda.') +
      step(`${N(p.c * p.e)} ${-p.c * p.b + p.d < 0 ? '−' : '+'} ${N(Math.abs(-p.c * p.b + p.d))}<var>y</var> = ${N(p.f)} → <var>y</var> = ${res(N(r.y))}`, 'Ora è un\'equazione con la sola y.') +
      step(`<var>x</var> = ${N(p.e)} − ${sg(p.b)}·${sg(r.y)} = ${res(N(r.x))}`, 'Torna alla prima per trovare x.'),
  });
  a4.push({
    id: 'sis-cramer', title: 'Regola di Cramer', level: 2,
    gen: sysGen,
    solve: (p) => P.solve2(p.a, p.b, p.c, p.d, p.e, p.f),
    text: (p) => `Risolvi con Cramer: ${sysHTML(p)}`,
    asks: (p, r) => [{ label: 'Δ', unit: '', value: r.D, tol: 0 }, { label: 'Δ<sub>x</sub>', unit: '', value: r.Dx, tol: 0 }, { label: 'Δ<sub>y</sub>', unit: '', value: r.Dy, tol: 0 }, { label: '<var>x</var>', unit: '', value: r.x, tol: 0.001 }, { label: '<var>y</var>', unit: '', value: r.y, tol: 0.001 }],
    hint: () => 'Δ = a·d − b·c. Per Δx sostituisci a e c con i termini noti; per Δy sostituisci b e d.',
    steps: (p) => cramerSteps(p),
  });
  a4.push({
    id: 'sis-tipo', title: 'Determinato, impossibile o indeterminato?', level: 1,
    gen: () => {
      const t = rand(0, 2);
      const a = rand(1, 4), b = rand(-4, 4) || 1, e = rand(-10, 10);
      if (t === 0) { const p = sysGen(); return { ...p, t }; }
      const k = pick([2, 3, -2]);
      return { a, b, c: k * a, d: k * b, e, f: t === 2 ? k * e : k * e + pick([1, 2, 3]), t };
    },
    solve: (p) => P.solve2(p.a, p.b, p.c, p.d, p.e, p.f),
    text: (p) => `Senza risolverlo fino in fondo: il sistema ${sysHTML(p)} che tipo di sistema è?`,
    asks: (p, r) => [h.choice('Il sistema è', ['determinato (una soluzione)', 'impossibile (nessuna soluzione)', 'indeterminato (infinite soluzioni)'], ['determinato', 'impossibile', 'indeterminato'].indexOf(r.kind))],
    hint: () => 'Calcola Δ: se è diverso da zero c\'è una sola soluzione.',
    steps: (p, r) => step(`Δ = ${N(p.a)}·${sg(p.d)} − ${sg(p.b)}·${sg(p.c)} = ${N(r.D)}`) + step(res(r.kind), r.kind === 'determinato' ? 'Δ ≠ 0: le due rette si incontrano in un punto.' : r.kind === 'impossibile' ? 'Δ = 0 e i termini noti non sono proporzionali: rette parallele, nessun punto in comune.' : 'Δ = 0 e anche Δx = Δy = 0: è la stessa retta scritta due volte.'),
  });
  a4.push({
    id: 'sis-maglie', title: 'Il sistema di un circuito', level: 3,
    gen: () => K.twoGenGen(),
    solve: (p) => { const m = DC.mesh(p); return { m, sys: { a: m.a11, b: m.a12, c: m.a12, d: m.a22, e: m.b1, f: m.b2 } }; },
    text: (p, r) => `Con il metodo delle maglie (lo vedrai in 3ª) il circuito con <var>E</var><sub>1</sub> = ${N(p.E1)} V, <var>R</var><sub>1</sub> = ${N(p.R1)} Ω, <var>E</var><sub>2</sub> = ${N(p.E2)} V, <var>R</var><sub>2</sub> = ${N(p.R2)} Ω, <var>R</var><sub>3</sub> = ${N(p.R3)} Ω dà il sistema ${sysHTML(r.sys, 'I_a', 'I_b').replace(/<var>I_a<\/var>/g, '<var>I</var><sub>a</sub>').replace(/<var>I_b<\/var>/g, '<var>I</var><sub>b</sub>')}. Risolvilo.`,
    fig: (p, r, sol) => App.Schem.T.twoGen(p, { mesh: true, Ia: sol ? r.m.Ia : null, Ib: sol ? r.m.Ib : null }),
    asks: (p, r) => [h.qI('<var>I</var><sub>a</sub>', r.m.Ia), h.qI('<var>I</var><sub>b</sub>', r.m.Ib)],
    steps: (p, r) => cramerSteps(r.sys, 'I<sub>a</sub>', 'I<sub>b</sub>').replace(/<var>I<sub>a<\/sub><\/var>/g, '<var>I</var><sub>a</sub>').replace(/<var>I<sub>b<\/sub><\/var>/g, '<var>I</var><sub>b</sub>') +
      step('Le correnti di maglia sono in ampere', 'È lo stesso sistema del Modulo 6 delle reti in corrente continua: l\'algebra del biennio serve proprio lì.'),
  });

  function widgetLines(host) {
    const c = K.widgetCard('Due rette, un punto', 'Ogni equazione è una retta; la soluzione è dove si incontrano');
    const fig = document.createElement('div');
    const out = document.createElement('div');
    const draw = (q) => {
      const p = { a: Math.round(q.a), b: Math.round(q.b), c: Math.round(q.c), d: Math.round(q.d), e: Math.round(q.e), f: Math.round(q.f) };
      const s = P.solve2(p.a, p.b, p.c, p.d, p.e, p.f);
      const W = 300, H = 300, R0 = 10;
      const X = (x) => W / 2 + (x * W) / (2 * R0), Y = (y) => H / 2 - (y * H) / (2 * R0);
      let g = '';
      for (let k = -R0; k <= R0; k += 2) g += `<line class="gridl" x1="${X(k)}" y1="0" x2="${X(k)}" y2="${H}"/><line class="gridl" x1="0" y1="${Y(k)}" x2="${W}" y2="${Y(k)}"/>`;
      g += `<line class="axis" x1="0" y1="${Y(0)}" x2="${W}" y2="${Y(0)}"/><line class="axis" x1="${X(0)}" y1="0" x2="${X(0)}" y2="${H}"/>`;
      const line = (a, b, e, cls) => {
        if (b !== 0) return `<line class="${cls}" x1="${X(-R0)}" y1="${Y((e - a * -R0) / b)}" x2="${X(R0)}" y2="${Y((e - a * R0) / b)}"/>`;
        if (a !== 0) return `<line class="${cls}" x1="${X(e / a)}" y1="0" x2="${X(e / a)}" y2="${H}"/>`;
        return '';
      };
      g += line(p.a, p.b, p.e, 'gen') + line(p.c, p.d, p.f, 'load');
      if (s.kind === 'determinato' && Math.abs(s.x) <= R0 && Math.abs(s.y) <= R0) g += `<circle class="op" cx="${X(s.x)}" cy="${Y(s.y)}" r="6"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;max-width:340px;height:auto"><title>Le due rette del sistema</title><defs><clipPath id="lc"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#lc)">${g}</g></svg>`;
      out.innerHTML = `<div class="sys-big">${sysHTML(p)}</div><p class="f">Δ = ${N(s.D)}, Δ<sub>x</sub> = ${N(s.Dx)}, Δ<sub>y</sub> = ${N(s.Dy)}</p><p>${s.kind === 'determinato' ? `Sistema determinato: <var>x</var> = ${res(N(s.x, 3))}, <var>y</var> = ${res(N(s.y, 3))}.` : s.kind === 'impossibile' ? '<strong>Impossibile</strong>: Δ = 0, rette parallele, nessuna soluzione.' : '<strong>Indeterminato</strong>: Δ = 0 e anche Δx = Δy = 0, la stessa retta: infinite soluzioni.'}</p><p class="hint">Prova a rendere i coefficienti della seconda equazione multipli di quelli della prima: le rette diventano parallele.</p>`;
    };
    const wrap = document.createElement('div');
    wrap.className = 'sys-widget';
    const left = document.createElement('div');
    K.sliders(left, [
      { id: 'a', label: '<var>a</var> (x, 1ª)', min: -5, max: 5, step: 1, value: 2, sig: 2 },
      { id: 'b', label: '<var>b</var> (y, 1ª)', min: -5, max: 5, step: 1, value: 3, sig: 2 },
      { id: 'e', label: 'termine noto 1ª', min: -15, max: 15, step: 1, value: 12, sig: 2 },
      { id: 'c', label: '<var>c</var> (x, 2ª)', min: -5, max: 5, step: 1, value: 1, sig: 2 },
      { id: 'd', label: '<var>d</var> (y, 2ª)', min: -5, max: 5, step: 1, value: -1, sig: 2 },
      { id: 'f', label: 'termine noto 2ª', min: -15, max: 15, step: 1, value: 1, sig: 2 },
    ], draw);
    wrap.append(left, fig);
    c.append(wrap, out);
    host.appendChild(c);
    draw({ a: 2, b: 3, e: 12, c: 1, d: -1, f: 1 });
  }

  lessons.push({
    id: 'sistemi', num: 4, short: 'Sistemi', title: 'Sistemi di due equazioni in due incognite',
    intro: 'Con i principi di Kirchhoff, in 3ª, ogni circuito con due generatori diventa un sistema. Qui impari a risolverlo per sostituzione e con la regola di Cramer, e a capire quando una soluzione non c\'è.',
    goals: ['Sostituzione', 'Cramer', 'Significato geometrico', 'Il sistema di un circuito'],
    widgets: [widgetLines],
    example: a4[1], exampleTitle: 'Esempio: regola di Cramer',
    families: a4,
    theory: `
      <article class="note"><h4>Sostituzione</h4>
        <ol><li>Ricava un'incognita da una delle due equazioni (scegli quella con coefficiente 1).</li><li>Sostituiscila nell'altra: ottieni un'equazione in una sola incognita.</li><li>Risolvila, poi torna indietro per trovare l'altra incognita.</li></ol></article>
      <article class="note"><h4>Regola di Cramer</h4>
        <p>Per <span class="f"><var>a</var><var>x</var> + <var>b</var><var>y</var> = <var>e</var>, <var>c</var><var>x</var> + <var>d</var><var>y</var> = <var>f</var></span>:</p>
        <div class="eq"><span>Δ = <var>a</var><var>d</var> − <var>b</var><var>c</var></span><span>Δ<sub>x</sub> = <var>e</var><var>d</var> − <var>b</var><var>f</var></span><span>Δ<sub>y</sub> = <var>a</var><var>f</var> − <var>e</var><var>c</var></span><span><var>x</var> = Δ<sub>x</sub>/Δ, <var>y</var> = Δ<sub>y</sub>/Δ</span></div></article>
      <article class="note"><h4>Tre casi</h4>
        <ul><li><strong>Δ ≠ 0</strong>: determinato, una sola soluzione (rette incidenti).</li>
          <li><strong>Δ = 0</strong>, Δ<sub>x</sub> o Δ<sub>y</sub> ≠ 0: impossibile (rette parallele).</li>
          <li><strong>Δ = Δ<sub>x</sub> = Δ<sub>y</sub> = 0</strong>: indeterminato (rette coincidenti).</li></ul></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'alg', year: '1–2', yearLabel: '1ª–2ª', title: 'Formule inverse, equazioni e sistemi', route: 'alg-inverse', lessonWord: 'Lezione',
    desc: 'Rigirare le formule, riconoscere le proporzionalità, risolvere equazioni e sistemi 2×2: l\'algebra che serve per Kirchhoff.',
    lessons,
  });
})();
