/* Biennio — Grandezze, unità di misura, prefissi, notazione scientifica, cifre significative */
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
  const B = (App.B = App.B || {});

  // ---------- Aiuti per la notazione scientifica ----------
  const ex = (e) => (e < 0 ? '−' + -e : String(e));
  B.sciH = (m, e) => `${N(m)} · 10<sup>${ex(e)}</sup>`;
  B.sciOf = (x, sig = 3) => { const s = P.sci(x, sig); return B.sciH(s.m, s.e); };
  /** Scrittura decimale completa, con le cifre raggruppate a tre: 0,000 000 047 */
  B.dec = (x) => {
    const v = Number(x.toPrecision(6));
    let t = Math.abs(v) >= 1 ? String(v) : v.toFixed(Math.min(20, 5 - Math.floor(Math.log10(Math.abs(v)))));
    if (/e/.test(t)) t = v.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
    if (t.includes('.')) t = t.replace(/0+$/, '').replace(/\.$/, '');
    const [i, d] = t.split('.');
    const gi = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
    const gd = d ? d.replace(/(\d{3})(?=\d)/g, '$1\u2009') : '';
    return gi + (gd ? ',' + gd : '');
  };
  B.qSci = (label, x, sig = 3) => {
    const s = P.sci(x, sig);
    return [{ label: label + ': mantissa', unit: '', value: s.m }, { label: label + ': esponente di 10', unit: '', value: s.e, tol: 0 }];
  };
  const PREF = [['G', 9], ['M', 6], ['k', 3], ['', 0], ['m', -3], ['µ', -6], ['n', -9], ['p', -12]];
  B.PREF = PREF;
  const prefName = { G: 'giga', M: 'mega', k: 'kilo', '': 'unità base', m: 'milli', 'µ': 'micro', n: 'nano', p: 'pico' };

  const lessons = [];

  // =====================================================================
  // 1 — Il Sistema Internazionale e l'analisi dimensionale
  // =====================================================================
  const s1 = [];
  const FORMS = [
    { f: '<var>V</var> · <var>I</var>', t: [['V', 1], ['A', 1]], q: 'tensione × corrente' },
    { f: '<var>R</var> · <var>I</var>²', t: [['Ω', 1], ['A', 2]], q: 'resistenza × corrente²' },
    { f: '<var>V</var>² / <var>R</var>', t: [['V', 2], ['Ω', -1]], q: 'tensione² / resistenza' },
    { f: '<var>V</var> / <var>R</var>', t: [['V', 1], ['Ω', -1]], q: 'tensione / resistenza' },
    { f: '<var>R</var> · <var>I</var>', t: [['Ω', 1], ['A', 1]], q: 'resistenza × corrente' },
    { f: '<var>Q</var> / <var>t</var>', t: [['C', 1], ['s', -1]], q: 'carica / tempo' },
    { f: '<var>I</var> · <var>t</var>', t: [['A', 1], ['s', 1]], q: 'corrente × tempo' },
    { f: '<var>P</var> · <var>t</var>', t: [['W', 1], ['s', 1]], q: 'potenza × tempo' },
    { f: '<var>V</var> · <var>Q</var>', t: [['V', 1], ['C', 1]], q: 'tensione × carica' },
    { f: '<var>L</var> / <var>Q</var>', t: [['J', 1], ['C', -1]], q: 'lavoro / carica' },
    { f: '<var>F</var> · <var>s</var>', t: [['N', 1], ['m', 1]], q: 'forza × spostamento' },
    { f: '1 / <var>R</var>', t: [['Ω', -1]], q: 'inverso della resistenza' },
    { f: '<var>W</var> / <var>t</var>', t: [['J', 1], ['s', -1]], q: 'energia / tempo' },
    { f: '<var>P</var> / <var>I</var>', t: [['W', 1], ['A', -1]], q: 'potenza / corrente' },
  ];
  const UNIT_CHOICES = ['W', 'J', 'A', 'V', 'Ω', 'C', 'S', 'N'];
  const uname = (u) => `${u} (${P.UNITS[u].name})`;

  s1.push({
    id: 'si-unita', title: 'Che unità ha?', level: 1,
    gen: () => ({ k: rand(0, FORMS.length - 1), seed: Math.random() }),
    solve: (p) => {
      const F = FORMS[p.k];
      const u = P.unitOf(P.dims(F.t));
      const others = App.shuffle(UNIT_CHOICES.filter((x) => x !== u)).slice(0, 3);
      const opts = App.shuffle([u, ...others]);
      return { F, u, opts, ans: opts.indexOf(u) };
    },
    text: (p, r) => `In elettrotecnica le formule moltiplicano e dividono grandezze. Che unità di misura ha il risultato di <span class="f">${r.F.f}</span> (${r.F.q})?`,
    asks: (p, r) => [h.choice('Unità', r.opts.map(uname), r.ans)],
    steps: (p, r) => step(`${r.F.f} → ${r.F.t.map(([u, e]) => u + (e === 1 ? '' : P.sup(e))).join(' · ')} = ${P.baseString(P.dims(r.F.t))}`, 'Scomponi ogni unità in unità di base e somma gli esponenti.') +
      step(`= ${res(uname(r.u))}`, `Nel SI quella combinazione ha un nome: ${P.UNITS[r.u].name}, unità di ${P.UNITS[r.u].q}.`),
  });

  const ALLU = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd', 'N', 'J', 'W', 'C', 'V', 'Ω', 'S', 'F', 'Hz'];
  s1.push({
    id: 'si-fond', title: 'Fondamentale o derivata?', level: 1,
    gen: () => ({ u: pick(ALLU) }),
    solve: (p) => {
      const U0 = P.UNITS[p.u];
      const qs = App.shuffle([...new Set(ALLU.map((x) => P.UNITS[x].q))].filter((q) => q !== U0.q)).slice(0, 3);
      const opts = App.shuffle([U0.q, ...qs]);
      return { U0, opts, ans: opts.indexOf(U0.q) };
    },
    text: (p) => `L'unità <strong>${p.u}</strong> è fondamentale o derivata nel Sistema Internazionale? Quale grandezza misura?`,
    asks: (p, r) => [h.choice('Tipo', ['fondamentale', 'derivata'], r.U0.base ? 0 : 1), h.choice('Grandezza', r.opts, r.ans)],
    steps: (p, r) => step(`${p.u} = ${P.UNITS[p.u].name}: ${res(r.U0.base ? 'unità fondamentale' : 'unità derivata')}`, r.U0.base ? 'È una delle 7 unità di base del SI.' : `Si ricava dalle unità di base: ${p.u} = ${r.U0.def} = ${P.baseString(r.U0.d)}.`) +
      step(`Misura: ${res(r.U0.q)}`),
  });

  const EQS = [
    { e: '<var>P</var> = <var>V</var> · <var>I</var>', l: [['W', 1]], r: [['V', 1], ['A', 1]] },
    { e: '<var>P</var> = <var>V</var> · <var>I</var>²', l: [['W', 1]], r: [['V', 1], ['A', 2]] },
    { e: '<var>W</var> = <var>P</var> · <var>t</var>', l: [['J', 1]], r: [['W', 1], ['s', 1]] },
    { e: '<var>I</var> = <var>V</var> · <var>R</var>', l: [['A', 1]], r: [['V', 1], ['Ω', 1]] },
    { e: '<var>Q</var> = <var>I</var> / <var>t</var>', l: [['C', 1]], r: [['A', 1], ['s', -1]] },
    { e: '<var>Q</var> = <var>I</var> · <var>t</var>', l: [['C', 1]], r: [['A', 1], ['s', 1]] },
    { e: '<var>V</var> = <var>L</var> / <var>Q</var>', l: [['V', 1]], r: [['J', 1], ['C', -1]] },
    { e: '<var>R</var> = <var>V</var>² / <var>P</var>', l: [['Ω', 1]], r: [['V', 2], ['W', -1]] },
    { e: '<var>R</var> = <var>P</var> / <var>V</var>²', l: [['Ω', 1]], r: [['W', 1], ['V', -2]] },
    { e: '<var>I</var> = √(<var>P</var> / <var>R</var>)', l: [['A', 1]], r: [['W', 0.5], ['Ω', -0.5]] },
    { e: '<var>V</var> = √(<var>P</var> · <var>R</var>)', l: [['V', 1]], r: [['W', 0.5], ['Ω', 0.5]] },
    { e: '<var>P</var> = <var>R</var> / <var>I</var>²', l: [['W', 1]], r: [['Ω', 1], ['A', -2]] },
  ];
  const fmtT = (t) => t.map(([u, e]) => u + (e === 1 ? '' : P.sup(e))).join(' · ');
  s1.push({
    id: 'si-dim', title: 'È dimensionalmente giusta?', level: 2,
    gen: () => ({ k: rand(0, EQS.length - 1) }),
    solve: (p) => { const E = EQS[p.k]; const dl = P.dims(E.l), dr = P.dims(E.r); return { E, dl, dr, okd: P.sameDims(dl, dr) }; },
    text: (p, r) => `Un compagno scrive <span class="f">${r.E.e}</span>. Senza fare conti, controlla le unità di misura: la formula può essere giusta?`,
    asks: (p, r) => [h.choice('La formula', ['è coerente: le unità tornano', 'è sbagliata: le unità non tornano'], r.okd ? 0 : 1)],
    steps: (p, r) => step(`Primo membro: ${fmtT(r.E.l)} = ${P.baseString(r.dl)}`) +
      step(`Secondo membro: ${fmtT(r.E.r)} = ${P.baseString(r.dr)}`, 'Un esponente ½ è una radice quadrata.') +
      step(r.okd ? `Coincidono${ok}` : res('Non coincidono: la formula è sbagliata'), r.okd ? 'L\'analisi dimensionale non garantisce che la formula sia giusta (potrebbe mancare un numero), ma se le unità non tornano è sicuramente sbagliata.' : 'Se le unità dei due membri sono diverse la formula non può essere giusta.'),
  });

  const DERIVED = ['N', 'J', 'W', 'C', 'V', 'Ω', 'S'];
  s1.push({
    id: 'si-base', title: 'Scomponi nelle unità di base', level: 3,
    gen: () => ({ u: pick(DERIVED) }),
    solve: (p) => ({ d: P.UNITS[p.u].d }),
    text: (p) => `Scrivi <strong>1 ${p.u}</strong> (${P.UNITS[p.u].name}) come prodotto di potenze di kg, m, s, A: kg<sup>a</sup> · m<sup>b</sup> · s<sup>c</sup> · A<sup>d</sup>. Trova gli esponenti.`,
    asks: (p, r) => ['kg (a)', 'm (b)', 's (c)', 'A (d)'].map((l, k) => ({ label: 'Esponente di ' + l, unit: '', value: r.d[k], tol: 0 })),
    hint: (p) => `Parti dalla definizione: ${p.u} = ${P.UNITS[p.u].def}.`,
    steps: (p, r) => step(`${p.u} = ${P.UNITS[p.u].def}`, 'Definizione.') + step(`${p.u} = ${res(P.baseString(r.d))}`, 'Sostituisci passo per passo fino alle unità di base.'),
  });

  const CHAINS = {
    N: ['N = kg·m/s²', 'Forza = massa × accelerazione (2ª legge della dinamica).'],
    J: ['J = N·m', 'Lavoro = forza × spostamento.'],
    W: ['W = J/s', 'Potenza = energia trasferita in un secondo.'],
    C: ['C = A·s', 'Carica = corrente × tempo: 1 A per 1 s trasporta 1 C.'],
    V: ['V = J/C = W/A', 'Tensione = lavoro per unità di carica.'],
    'Ω': ['Ω = V/A', 'Resistenza: 1 V fa passare 1 A (legge di Ohm).'],
    S: ['S = 1/Ω = A/V', 'Conduttanza: il contrario della resistenza.'],
    F: ['F = C/V', 'Capacità: carica accumulata per volt (lo vedrai con i condensatori, in 3ª).'],
    Hz: ['Hz = 1/s', 'Frequenza: cicli al secondo (corrente alternata, in 4ª).'],
  };
  function widgetUnits(host) {
    const c = K.widgetCard('La calcolatrice delle unità', 'Combina due unità e guarda che cosa ottieni');
    const chips = document.createElement('div');
    chips.className = 'chips';
    const info = document.createElement('div');
    info.className = 'forms';
    const calc = document.createElement('div');
    calc.className = 'unit-calc';
    const opts = ['V', 'A', 'Ω', 'W', 'J', 'C', 's', 'N', 'm', 'S'].map((u) => `<option value="${u}">${u}</option>`).join('');
    calc.innerHTML = `<select class="input" aria-label="Prima unità">${opts}</select><select class="input op" aria-label="Operazione"><option value="1">×</option><option value="-1">÷</option></select><select class="input" aria-label="Seconda unità">${opts}</select><span class="eqsign">=</span><output class="f unit-out"></output>`;
    const [u1, op, u2] = calc.querySelectorAll('select');
    u1.value = 'V'; u2.value = 'A';
    const out = calc.querySelector('output');
    const doCalc = () => {
      const d = P.dims([[u1.value, 1], [u2.value, Number(op.value)]]);
      const n = P.unitOf(d);
      out.innerHTML = n ? `<strong>${n}</strong> <span class="hint">${P.UNITS[n].name}, ${P.UNITS[n].q}</span>` : `${P.baseString(d)} <span class="hint">nessun nome speciale${P.sameDims(d, P.dims([['V', 1], ['m', -1]])) ? ' (è V/m, l\'unità del campo elettrico)' : ''}</span>`;
    };
    [u1, op, u2].forEach((s) => s.addEventListener('change', doCalc));
    const show = (u) => {
      chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.u === u)));
      info.innerHTML = `<div class="form-row"><span class="label">${P.UNITS[u].name} · ${P.UNITS[u].q}</span><div class="f">${CHAINS[u][0]} = ${P.baseString(P.UNITS[u].d)}</div><span class="meta">${CHAINS[u][1]}</span></div>`;
    };
    Object.keys(CHAINS).forEach((u) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill';
      b.dataset.u = u;
      b.textContent = u;
      b.addEventListener('click', () => show(u));
      chips.appendChild(b);
    });
    const lab = document.createElement('p');
    lab.className = 'label';
    lab.textContent = 'Prova: V × A, J ÷ s, V ÷ Ω, C ÷ s, W × s';
    c.append(chips, info, lab, calc);
    host.appendChild(c);
    show('Ω');
    doCalc();
  }

  lessons.push({
    id: 'si', num: 1, short: 'Unità SI', title: 'Il Sistema Internazionale e le unità derivate',
    intro: 'Ogni grandezza fisica ha un\'unità di misura. Nel Sistema Internazionale ce ne sono 7 fondamentali; tutte le altre, compresi volt, ohm e watt, si ottengono moltiplicandole e dividendole.',
    goals: ['Unità fondamentali e derivate', 'Unità delle formule elettriche', 'Analisi dimensionale'],
    widgets: [widgetUnits],
    example: s1[0], exampleTitle: 'Esempio: l\'unità di V · I',
    families: s1,
    theory: `
      <article class="note"><h4>Le 7 unità fondamentali</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Grandezza</th><th>Unità</th><th>Simbolo</th></tr></thead><tbody>
          <tr><td>lunghezza</td><td>metro</td><td>m</td></tr><tr><td>massa</td><td>chilogrammo</td><td>kg</td></tr>
          <tr><td>tempo</td><td>secondo</td><td>s</td></tr><tr><td>intensità di corrente</td><td>ampere</td><td>A</td></tr>
          <tr><td>temperatura</td><td>kelvin</td><td>K</td></tr><tr><td>quantità di sostanza</td><td>mole</td><td>mol</td></tr>
          <tr><td>intensità luminosa</td><td>candela</td><td>cd</td></tr></tbody></table></div>
        <p>La corrente è una grandezza <strong>fondamentale</strong>: la carica (coulomb) è derivata, <span class="f">1 C = 1 A · 1 s</span>.</p></article>
      <article class="note"><h4>Le unità derivate dell'elettrotecnica</h4>
        <div class="table-wrap"><table class="tbl"><tbody>
          <tr><td>forza</td><td>newton</td><td class="f">N = kg·m/s²</td></tr>
          <tr><td>energia, lavoro</td><td>joule</td><td class="f">J = N·m</td></tr>
          <tr><td>potenza</td><td>watt</td><td class="f">W = J/s</td></tr>
          <tr><td>carica</td><td>coulomb</td><td class="f">C = A·s</td></tr>
          <tr><td>tensione</td><td>volt</td><td class="f">V = J/C = W/A</td></tr>
          <tr><td>resistenza</td><td>ohm</td><td class="f">Ω = V/A</td></tr>
          <tr><td>conduttanza</td><td>siemens</td><td class="f">S = 1/Ω</td></tr></tbody></table></div></article>
      <article class="note"><h4>Analisi dimensionale</h4>
        <p>I due membri di un'uguaglianza devono avere la <strong>stessa unità</strong>, e si possono sommare solo grandezze omogenee (non si sommano volt e ampere). È un controllo velocissimo per scoprire una formula ricordata male: <span class="f"><var>P</var> = <var>V</var>·<var>I</var>²</span> dà V·A², che non è un watt.</p>
        <p>Scrivi le unità con il simbolo giusto: maiuscolo se deriva da un nome di persona (V, A, W, Ω, C, J, N), minuscolo altrimenti (m, s, kg). Tra numero e unità va uno spazio: 12 V, non 12V.</p></article>`,
  });

  // =====================================================================
  // 2 — Multipli e sottomultipli
  // =====================================================================
  const s2 = [];
  const UNITS_PRE = ['Ω', 'A', 'V', 'W', 'F', 'Hz'];
  const MANT = [1, 1.5, 2.2, 3.3, 4.7, 10, 22, 33, 47, 68, 100, 150, 220, 330, 470, 680];
  const allowed = (u) => ({ 'Ω': ['M', 'k', '', 'm'], A: ['k', '', 'm', 'µ', 'n'], V: ['k', '', 'm', 'µ'], W: ['G', 'M', 'k', '', 'm'], F: ['m', 'µ', 'n', 'p'], Hz: ['G', 'M', 'k', ''] }[u]);
  const pexp = (p) => PREF.find((x) => x[0] === p)[1];
  const fmtNum = (x) => App.num(x, 6);

  s2.push({
    id: 'pre-conv', title: 'Converti', level: 1,
    defaults: { u: 'Ω', m: 4.7, p1: 'k', p2: '' },
    gen: () => {
      const u = pick(UNITS_PRE);
      const ps = allowed(u);
      const i = rand(0, ps.length - 1);
      let j = i;
      while (j === i) j = rand(Math.max(0, i - 2), Math.min(ps.length - 1, i + 2));
      return { u, m: pick(MANT), p1: ps[i], p2: ps[j] };
    },
    solve: (p) => { const d = pexp(p.p1) - pexp(p.p2); return { d, v: Number((p.m * Math.pow(10, d)).toPrecision(6)) }; },
    text: (p) => `Converti <strong>${fmtNum(p.m)} ${p.p1}${p.u}</strong> in <strong>${p.p2}${p.u}</strong>.`,
    asks: (p, r) => [{ label: 'Risultato', unit: p.p2 + p.u, value: r.v, tol: 0.002 }],
    hint: () => 'Ogni gradino tra due prefissi vicini vale × 1000 (scendendo verso i più piccoli) o ÷ 1000 (salendo).',
    steps: (p, r) => step(`${p.p1 || 'unità base'} = 10<sup>${ex(pexp(p.p1))}</sup>, ${p.p2 || 'unità base'} = 10<sup>${ex(pexp(p.p2))}</sup>: differenza 10<sup>${ex(r.d)}</sup>`, r.d > 0 ? 'Vai verso un prefisso più piccolo: il numero diventa più grande.' : 'Vai verso un prefisso più grande: il numero diventa più piccolo.') +
      step(`${fmtNum(p.m)} ${p.p1}${p.u} = ${fmtNum(p.m)} · 10<sup>${ex(r.d)}</sup> ${p.p2}${p.u} = ${res(fmtNum(r.v) + ' ' + p.p2 + p.u)}`, `La virgola si sposta di ${Math.abs(r.d)} posti verso ${r.d > 0 ? 'destra' : 'sinistra'}.`),
  });

  s2.push({
    id: 'pre-scelta', title: 'Il prefisso giusto', level: 1,
    gen: () => {
      const u = pick(['F', 'A', 'Ω', 'V']);
      const ps = allowed(u).filter((x) => x !== '');
      return { u, m: pick([1, 2.2, 4.7, 10, 22, 47, 100, 220, 470]), p: pick(ps) };
    },
    solve: (p) => {
      const val = p.m * Math.pow(10, pexp(p.p));
      const right = `${fmtNum(p.m)} ${p.p}${p.u}`;
      const wrongs = [`${fmtNum(p.m * 10)} ${p.p}${p.u}`, `${fmtNum(p.m / 10)} ${p.p}${p.u}`];
      const other = PREF.find((x) => x[1] === pexp(p.p) + 3) || PREF.find((x) => x[1] === pexp(p.p) - 3);
      wrongs.push(`${fmtNum(p.m)} ${other[0]}${p.u}`);
      const opts = App.shuffle([right, ...wrongs]);
      return { val, right, opts, ans: opts.indexOf(right) };
    },
    text: (p, r) => `Quale scrittura corrisponde a <strong>${B.dec(r.val)} ${p.u}</strong>?`,
    asks: (p, r) => [h.choice('Scrittura', r.opts, r.ans)],
    steps: (p, r) => step(`${B.dec(r.val)} ${p.u} = ${B.sciOf(r.val)} ${p.u}`, 'Scrivila prima in notazione scientifica.') + step(`10<sup>${ex(pexp(p.p))}</sup> = ${prefName[p.p]} (${p.p}) → ${res(r.right)}`, 'Porta l\'esponente a un multiplo di 3 e sostituiscilo con il prefisso.'),
  });

  s2.push({
    id: 'pre-calc', title: 'Ohm con i prefissi', level: 2,
    gen: () => L.nice(() => ({ V: pick([3.3, 5, 9, 12, 24]), R: pick([0.22, 0.47, 1, 1.5, 2.2, 3.3, 4.7, 10, 22, 47]) }), (p) => DC.clean(p.V / p.R), { V: 12, R: 4.7 }),
    solve: (p) => ({ I: p.V / p.R, P: (p.V * p.V) / p.R }),
    text: (p) => `<var>V</var> = ${N(p.V)} V ai capi di <var>R</var> = ${N(p.R)} kΩ. Trova la corrente in mA e la potenza in mW.`,
    asks: (p, r) => [{ label: 'Corrente', unit: 'mA', value: r.I }, { label: 'Potenza', unit: 'mW', value: r.P }],
    hint: () => 'Volt diviso kiloohm dà milliampere: 1 V / 1 kΩ = 1 mA.',
    steps: (p, r) => step(`<var>I</var> = ${frac(N(p.V) + ' V', N(p.R) + ' kΩ')} = ${frac(N(p.V), N(p.R) + ' · 10³')} A = ${N(r.I)} · 10<sup>−3</sup> A = ${res(N(r.I) + ' mA')}`, 'Volt / kiloohm = milliampere: il prefisso "k" al denominatore diventa "m" nel risultato.') +
      step(`<var>P</var> = <var>V</var>·<var>I</var> = ${N(p.V)} V · ${N(r.I)} mA = ${res(N(r.P) + ' mW')}`, 'Volt × milliampere = milliwatt.'),
  });
  s2.push({
    id: 'pre-area', title: 'Millimetri quadrati e metri quadrati', level: 2,
    defaults: { S: 1.5 },
    gen: () => ({ S: pick([0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25]) }),
    solve: (p) => ({ m2: p.S * 1e-6 }),
    text: (p) => `La sezione di un cavo è <var>S</var> = ${N(p.S)} mm². Scrivila in m², in notazione scientifica.`,
    asks: (p, r) => B.qSci('<var>S</var> in m²', r.m2),
    hint: () => '1 mm = 10⁻³ m, quindi 1 mm² = (10⁻³ m)² = 10⁻⁶ m². Attenzione: non 10⁻³!',
    steps: (p, r) => step('1 mm² = (10<sup>−3</sup> m)² = 10<sup>−6</sup> m²', 'Il prefisso va elevato al quadrato insieme all\'unità: è l\'errore più comune con la seconda legge di Ohm.') +
      step(`${N(p.S)} mm² = ${N(p.S)} · 10<sup>−6</sup> m² = ${res(B.sciOf(r.m2) + ' m²')}`),
  });

  function widgetPrefix(host) {
    const c = K.widgetCard('La scala dei prefissi', 'Ogni gradino vale × 1000');
    const row = document.createElement('div');
    row.className = 'answer-row';
    row.innerHTML = `<input class="input" id="pw-val" value="4,7" inputmode="decimal" aria-label="Valore" style="max-width:120px">
      <select class="input" id="pw-from" aria-label="Prefisso di partenza" style="max-width:90px">${PREF.map(([p]) => `<option value="${p}">${p || '—'}</option>`).join('')}</select>
      <select class="input" id="pw-unit" aria-label="Unità" style="max-width:80px">${UNITS_PRE.map((u) => `<option>${u}</option>`).join('')}</select>
      <span>→</span>
      <select class="input" id="pw-to" aria-label="Prefisso di arrivo" style="max-width:90px">${PREF.map(([p]) => `<option value="${p}">${p || '—'}</option>`).join('')}</select>`;
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out f';
    const [val, from, unit, to] = row.querySelectorAll('input, select');
    from.value = 'k';
    to.value = '';
    const draw = () => {
      const v = App.parseNum(val.value);
      const i1 = PREF.findIndex((x) => x[0] === from.value);
      const i2 = PREF.findIndex((x) => x[0] === to.value);
      const W = 520, step0 = (W - 40) / (PREF.length - 1);
      const X = (i) => 20 + i * step0;
      let s = '';
      PREF.forEach(([p, e], i) => {
        const y = 40 + i * 12;
        const on = i === i1 ? 'from' : i === i2 ? 'to' : '';
        s += `<rect x="${X(i) - 26}" y="${y}" width="52" height="34" rx="6" class="stair ${on}"/>`;
        s += `<text x="${X(i)}" y="${y + 15}" text-anchor="middle" class="stair-p">${p || '1'}</text><text x="${X(i)}" y="${y + 28}" text-anchor="middle" class="small">10${P.sup(e)}</text>`;
      });
      if (i1 !== i2) {
        const a = Math.min(i1, i2), b = Math.max(i1, i2);
        for (let i = a; i < b; i++) {
          const x1 = X(i) + 26, x2 = X(i + 1) - 26, y = 40 + i * 12 + 6;
          s += `<path class="stair-arrow" d="M${x1} ${y} C ${(x1 + x2) / 2} ${y - 22}, ${(x1 + x2) / 2} ${y - 22}, ${x2} ${y + 12}"/>`;
          s += `<text x="${(X(i) + X(i + 1)) / 2}" y="${y - 14}" text-anchor="middle" class="small">${i2 > i1 ? '×1000' : '÷1000'}</text>`;
        }
      }
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 160" role="img" style="width:100%;height:auto"><title>Scala dei prefissi da giga a pico</title>${s}</svg>`;
      if (!isFinite(v)) { out.textContent = 'Scrivi un numero.'; return; }
      const d = PREF[i1][1] - PREF[i2][1];
      const r = Number((v * Math.pow(10, d)).toPrecision(8));
      out.innerHTML = `${fmtNum(v)} ${from.value}${unit.value} = ${fmtNum(v)} · 10<sup>${ex(d)}</sup> ${to.value}${unit.value} = ${res(App.num(r, 8) + ' ' + to.value + unit.value)} <span class="hint">${d === 0 ? '' : `${Math.abs(d) / 3} gradin${Math.abs(d) === 3 ? 'o' : 'i'}: la virgola si sposta di ${Math.abs(d)} posti verso ${d > 0 ? 'destra' : 'sinistra'}`}</span>`;
    };
    [val, from, unit, to].forEach((x) => x.addEventListener(x.tagName === 'INPUT' ? 'input' : 'change', draw));
    c.append(row, fig, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'prefissi', num: 2, short: 'Prefissi', title: 'Multipli e sottomultipli',
    intro: 'In elettronica si va dai picofarad ai megaohm: i prefissi evitano di scrivere file di zeri. Ogni prefisso è una potenza di 10, e quelli usati sono a passi di 1000.',
    goals: ['Prefissi da giga a pico', 'Conversioni', 'Calcoli con i prefissi', 'Aree: mm² e m²'],
    widgets: [widgetPrefix],
    example: s2[0], exampleTitle: 'Esempio: 4,7 kΩ in Ω',
    families: s2,
    theory: `
      <article class="note"><h4>I prefissi</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Prefisso</th><th>Simbolo</th><th>Fattore</th><th>Esempio</th></tr></thead><tbody>
          <tr><td>giga</td><td>G</td><td>10⁹</td><td>1 GΩ, isolamento di un cavo</td></tr>
          <tr><td>mega</td><td>M</td><td>10⁶</td><td>10 MΩ, ingresso di un multimetro</td></tr>
          <tr><td>kilo</td><td>k</td><td>10³</td><td>4,7 kΩ</td></tr>
          <tr><td>milli</td><td>m</td><td>10⁻³</td><td>20 mA, corrente di un LED</td></tr>
          <tr><td>micro</td><td>µ</td><td>10⁻⁶</td><td>100 µF</td></tr>
          <tr><td>nano</td><td>n</td><td>10⁻⁹</td><td>10 nF</td></tr>
          <tr><td>pico</td><td>p</td><td>10⁻¹²</td><td>22 pF</td></tr></tbody></table></div>
        <p>Attenzione alle maiuscole: <strong>m</strong> (milli, 10⁻³) e <strong>M</strong> (mega, 10⁶) differiscono di un miliardo di volte. Il kilo si scrive con la <strong>k minuscola</strong>.</p></article>
      <article class="note"><h4>Come si converte</h4>
        <ol><li>Guarda quanti gradini separano i due prefissi: ognuno vale un fattore 1000.</li>
          <li>Verso un prefisso <strong>più piccolo</strong> il numero diventa <strong>più grande</strong> (moltiplica); verso uno più grande, dividi.</li>
          <li>Controlla con il buon senso: 4,7 kΩ = 4700 Ω, non 0,0047 Ω.</li></ol></article>
      <article class="note"><h4>Combinazioni comode</h4>
        <ul><li>V / kΩ = mA, e mA · kΩ = V: con i kiloohm la legge di Ohm dà direttamente i milliampere.</li>
          <li>V · mA = mW.</li>
          <li>Con le aree il prefisso va al quadrato: 1 mm² = 10⁻⁶ m², 1 cm² = 100 mm².</li></ul></article>`,
  });

  // =====================================================================
  // 3 — Notazione scientifica e ordini di grandezza
  // =====================================================================
  const s3 = [];
  const decStr = (x) => B.dec(x);
  s3.push({
    id: 'not-scrivi', title: 'Scrivi in notazione scientifica', level: 1,
    defaults: { m: 4.7, e: -4 },
    gen: () => ({ m: pick([1.2, 1.5, 2.2, 3.3, 4.7, 5.6, 6.8, 8.2, 1.6, 2.5, 7.5, 9.1]), e: pick([-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7]) }),
    solve: (p) => ({ x: Number((p.m * Math.pow(10, p.e)).toPrecision(4)) }),
    text: (p, r) => `Scrivi <strong>${decStr(r.x)}</strong> in notazione scientifica, nella forma <var>a</var> · 10<sup><var>n</var></sup> con 1 ≤ <var>a</var> &lt; 10.`,
    asks: (p, r) => B.qSci('Numero', r.x),
    hint: () => 'Sposta la virgola fino ad avere una sola cifra diversa da zero prima della virgola; conta i posti.',
    steps: (p, r) => step(`${decStr(r.x)} → ${N(p.m)}`, `Sposta la virgola di ${Math.abs(p.e)} posti verso ${p.e < 0 ? 'destra' : 'sinistra'}.`) +
      step(`${decStr(r.x)} = ${res(B.sciH(p.m, p.e))}`, p.e < 0 ? 'Numero minore di 1: esponente negativo.' : 'Numero maggiore di 10: esponente positivo.'),
  });

  s3.push({
    id: 'not-ing', title: 'Dalla notazione scientifica al prefisso', level: 1,
    gen: () => ({ m: pick([1, 1.5, 2.2, 3.3, 4.7, 6.8]), e: pick([-11, -10, -8, -7, -5, -4, -2, -1, 1, 2, 4, 5, 7, 8]), u: pick(['Ω', 'F', 'A', 'V', 'Hz', 'W']) }),
    solve: (p) => { const g = P.eng(p.m * Math.pow(10, p.e)); return { g, pre: P.prefixOf(g.e) }; },
    text: (p, r) => `Scrivi <strong>${B.sciH(p.m, p.e)} ${p.u}</strong> con il prefisso adatto. Quanto vale in ${r.pre}${p.u}?`,
    asks: (p, r) => [{ label: 'Valore', unit: r.pre + p.u, value: r.g.m, tol: 0.002 }],
    hint: () => 'Porta l\'esponente al multiplo di 3 immediatamente più piccolo; la mantissa diventa un numero tra 1 e 999.',
    steps: (p, r) => step(`${B.sciH(p.m, p.e)} = ${B.sciH(r.g.m, r.g.e)}`, 'Notazione ingegneristica: esponente multiplo di 3.') + step(`10<sup>${ex(r.g.e)}</sup> = ${r.pre || 'unità'} → ${res(N(r.g.m) + ' ' + r.pre + p.u)}`),
  });

  s3.push({
    id: 'not-op', title: 'Calcola con le potenze di 10', level: 2,
    gen: () => ({ a: pick([1.5, 2, 2.5, 3, 4, 5, 6, 8]), m: rand(-6, 6), b: pick([1.5, 2, 3, 4, 5, 6]), n: rand(-6, 6), div: Math.random() < 0.5 }),
    solve: (p) => ({ x: p.div ? (p.a * Math.pow(10, p.m)) / (p.b * Math.pow(10, p.n)) : p.a * Math.pow(10, p.m) * p.b * Math.pow(10, p.n) }),
    text: (p) => `Calcola <span class="f">(${B.sciH(p.a, p.m)}) ${p.div ? '÷' : '×'} (${B.sciH(p.b, p.n)})</span> e scrivi il risultato in notazione scientifica.`,
    asks: (p, r) => B.qSci('Risultato', r.x),
    hint: (p) => (p.div ? 'Dividi le mantisse e sottrai gli esponenti.' : 'Moltiplica le mantisse e somma gli esponenti.'),
    steps: (p, r) => {
      const mm = p.div ? p.a / p.b : p.a * p.b;
      const ee = p.div ? p.m - p.n : p.m + p.n;
      const s = P.sci(r.x);
      return step(`Mantisse: ${N(p.a)} ${p.div ? '÷' : '×'} ${N(p.b)} = ${N(mm)}`) +
        step(`Esponenti: ${ex(p.m)} ${p.div ? '−' : '+'} ${p.div ? '(' + ex(p.n) + ')' : '(' + ex(p.n) + ')'} = ${ex(ee)}`) +
        step(`${N(mm)} · 10<sup>${ex(ee)}</sup> = ${res(B.sciH(s.m, s.e))}`, mm >= 10 || mm < 1 ? 'Normalizza: la mantissa deve stare tra 1 e 10.' : 'Già normalizzato.');
    },
  });

  s3.push({
    id: 'not-ordine', title: 'Ordine di grandezza', level: 2,
    gen: () => ({ m: pick([1.2, 2, 2.9, 3.5, 4.7, 6, 8.5, 9.9]), e: rand(-9, 9) }),
    solve: (p) => { const x = p.m * Math.pow(10, p.e); return { x, o: P.order(x) }; },
    text: (p) => `Qual è l'ordine di grandezza di ${B.sciH(p.m, p.e)}? Scrivi l'esponente della potenza di 10 più vicina.`,
    asks: (p, r) => [{ label: 'Ordine di grandezza: 10 elevato a', unit: '', value: r.o, tol: 0 }],
    hint: () => 'Se la mantissa è minore di √10 ≈ 3,16 si tiene l\'esponente, altrimenti si aumenta di 1.',
    steps: (p, r) => step(`Mantissa ${N(p.m)} ${p.m >= Math.sqrt(10) ? '≥' : '<'} 3,16`, 'Su una scala logaritmica 3,16 = √10 è a metà strada tra 1 e 10.') + step(`Ordine di grandezza: ${res('10<sup>' + ex(r.o) + '</sup>')}`),
  });

  s3.push({
    id: 'not-ohm', title: 'Ohm in notazione scientifica', level: 2,
    gen: () => ({ vm: pick([1.5, 2, 3, 4.5, 6, 9]), ve: pick([-3, -2, 0, 1, 2]), rm: pick([1, 1.5, 2, 3, 5]), re: pick([2, 3, 4, 5, 6]) }),
    solve: (p) => ({ I: (p.vm * Math.pow(10, p.ve)) / (p.rm * Math.pow(10, p.re)) }),
    text: (p) => `Una tensione <var>V</var> = ${B.sciH(p.vm, p.ve)} V è applicata a <var>R</var> = ${B.sciH(p.rm, p.re)} Ω. Trova la corrente in notazione scientifica.`,
    asks: (p, r) => B.qSci('<var>I</var> in A', r.I),
    steps: (p, r) => step(`<var>I</var> = ${frac(B.sciH(p.vm, p.ve), B.sciH(p.rm, p.re))} = ${N(p.vm / p.rm)} · 10<sup>${ex(p.ve - p.re)}</sup> A`) + step(`= ${res(B.sciOf(r.I) + ' A')} = ${U(r.I, 'A')}`, 'Con il prefisso il risultato si legge meglio.'),
  });

  const SCALE = {
    Corrente: { u: 'A', items: [[1e-6, 'orologio al quarzo'], [0.02, 'LED acceso'], [0.03, 'soglia del differenziale salvavita'], [0.26, 'lampadina da 60 W a 230 V'], [16, 'presa di casa al massimo'], [150, 'motorino d\'avviamento dell\'auto'], [30000, 'fulmine (valore tipico)']] },
    Tensione: { u: 'V', items: [[0.01, 'segnale di un microfono'], [0.07, 'membrana di un neurone'], [1.5, 'pila stilo'], [12, 'batteria dell\'auto'], [230, 'presa di casa (valore efficace)'], [380000, 'linea ad alta tensione']] },
    Resistenza: { u: 'Ω', items: [[0.0117, 'filo di rame da 1 m, 1,5 mm²'], [47, 'resistore di potenza'], [10000, 'resistore tipico'], [1e7, 'ingresso di un multimetro'], [1e9, 'isolamento di un cavo']] },
    Potenza: { u: 'W', items: [[0.04, 'LED'], [10, 'lampadina LED'], [2000, 'asciugacapelli'], [100000, 'motore di un\'auto elettrica'], [1e9, 'centrale elettrica']] },
  };
  function widgetScale(host) {
    const c = K.widgetCard('Dal più piccolo al più grande', 'Valori tipici reali su una scala a potenze di 10');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = Object.keys(SCALE).map((k) => `<button type="button" data-k="${k}">${k}</button>`).join('');
    const fig = document.createElement('div');
    const conv = document.createElement('div');
    conv.className = 'answer-row';
    conv.innerHTML = '<label class="label" for="nw-in">Scrivi un numero</label><input class="input" id="nw-in" value="0,00047" inputmode="decimal" style="max-width:160px">';
    const out = document.createElement('div');
    out.className = 'forms';
    let key = 'Corrente';
    let sel = 1;
    const drawScale = () => {
      const S0 = SCALE[key];
      const W = 540, x0 = 24, x1 = W - 24, lo = -12, hi = 9;
      const X = (v) => x0 + ((x1 - x0) * (Math.log10(v) - lo)) / (hi - lo);
      let s = `<line class="axis" x1="${x0}" y1="70" x2="${x1}" y2="70"/>`;
      for (let e = lo; e <= hi; e += 3) s += `<line class="gridl" x1="${X(Math.pow(10, e))}" y1="64" x2="${X(Math.pow(10, e))}" y2="76"/><text x="${X(Math.pow(10, e))}" y="92" text-anchor="middle">${P.prefixOf(e) || '1'}${S0.u}</text>`;
      S0.items.forEach(([v], i) => {
        const on = i === sel;
        s += `<g class="mk${on ? ' on' : ''}" data-i="${i}" role="button" tabindex="0"><circle cx="${X(v)}" cy="70" r="${on ? 8 : 6}"/><line x1="${X(v)}" y1="${i % 2 ? 78 : 40}" x2="${X(v)}" y2="${i % 2 ? 100 : 62}" class="guide"/></g>`;
      });
      const [v, t] = S0.items[sel];
      s += `<text x="${App.clamp(X(v), 90, W - 90)}" y="${sel % 2 ? 118 : 30}" text-anchor="middle" class="barlbl dark">${t}: ${App.si(v, S0.u)}</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 126" role="img" style="width:100%;height:auto"><title>Scala logaritmica: ${key.toLowerCase()}</title>${s}</svg>`;
      fig.querySelectorAll('.mk').forEach((g) => {
        const act = () => { sel = Number(g.dataset.i); drawScale(); showNum(SCALE[key].items[sel][0], SCALE[key].u); };
        g.addEventListener('click', act);
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
    };
    const showNum = (x, u = '') => {
      if (!isFinite(x) || x === 0) { out.innerHTML = '<p class="hint">Scrivi un numero diverso da zero, per esempio 0,00047 o 230000.</p>'; return; }
      const s = P.sci(x, 4), g = P.eng(x, 4);
      const pre = P.prefixOf(g.e);
      out.innerHTML = `<div class="form-row"><span class="label">Decimale</span><div class="f">${B.dec(x)} ${u}</div></div>
        <div class="form-row"><span class="label">Notazione scientifica</span><div class="f">${B.sciH(s.m, s.e)} ${u}</div></div>
        <div class="form-row"><span class="label">Notazione ingegneristica e prefisso</span><div class="f">${B.sciH(g.m, g.e)} ${u}${pre !== undefined ? ` = <strong>${N(g.m)} ${pre}${u}</strong>` : ''}</div></div>
        <div class="form-row"><span class="label">Ordine di grandezza</span><div class="f">10<sup>${ex(P.order(x))}</sup></div></div>`;
    };
    seg.addEventListener('click', (e) => { if (e.target.dataset.k) { key = e.target.dataset.k; sel = 1; drawScale(); showNum(SCALE[key].items[sel][0], SCALE[key].u); } });
    conv.querySelector('input').addEventListener('input', (e) => showNum(App.parseNum(e.target.value)));
    c.append(seg, fig, conv, out);
    host.appendChild(c);
    drawScale();
    showNum(0.00047);
  }

  lessons.push({
    id: 'notazione', num: 3, short: 'Notazione', title: 'Notazione scientifica e ordini di grandezza',
    intro: 'La carica di un elettrone vale 0,000 000 000 000 000 000 16 C: scritta così è illeggibile. Con la notazione scientifica diventa 1,6 · 10⁻¹⁹ C, e i calcoli con le potenze di 10 diventano somme di esponenti.',
    goals: ['a · 10ⁿ', 'Notazione ingegneristica', 'Operazioni con le potenze', 'Ordine di grandezza'],
    widgets: [widgetScale],
    example: s3[0], exampleTitle: 'Esempio: 0,00047',
    families: s3,
    theory: `
      <article class="note"><h4>La forma <var>a</var> · 10<sup><var>n</var></sup></h4>
        <p>Un numero in notazione scientifica ha una <strong>mantissa</strong> <var>a</var> con 1 ≤ <var>a</var> &lt; 10 e un <strong>esponente</strong> intero <var>n</var>. Spostando la virgola a sinistra l'esponente cresce, a destra diminuisce.</p>
        <div class="eq"><span>47 000 = 4,7 · 10⁴</span><span>0,000 47 = 4,7 · 10⁻⁴</span></div></article>
      <article class="note"><h4>Notazione ingegneristica</h4>
        <p>L'esponente è un multiplo di 3 e la mantissa sta tra 1 e 999: si legge subito con il prefisso. 4,7 · 10⁴ Ω = 47 · 10³ Ω = 47 kΩ.</p></article>
      <article class="note"><h4>Operazioni</h4>
        <ul><li>Prodotto: moltiplichi le mantisse, <strong>sommi</strong> gli esponenti: (2 · 10³)(3 · 10⁻⁵) = 6 · 10⁻².</li>
          <li>Quoziente: dividi le mantisse, <strong>sottrai</strong> gli esponenti.</li>
          <li>Potenza: (10<sup><var>a</var></sup>)<sup><var>b</var></sup> = 10<sup><var>a</var>·<var>b</var></sup>.</li>
          <li>Somma: solo con lo stesso esponente. Prima porta i numeri allo stesso esponente.</li></ul>
        <p>Alla fine <strong>normalizza</strong>: 12 · 10³ = 1,2 · 10⁴.</p></article>
      <article class="note"><h4>Ordine di grandezza</h4>
        <p>È la potenza di 10 più vicina al numero. Su una scala logaritmica il punto di mezzo tra 1 e 10 è √10 ≈ 3,16: 2,9 · 10⁵ ha ordine 10⁵, 3,5 · 10⁵ ha ordine 10⁶. Serve a capire al volo se un risultato è plausibile.</p></article>`,
  });

  // =====================================================================
  // 4 — Cifre significative, errori e tolleranze
  // =====================================================================
  const s4 = [];
  const SIGNUMS = ['0,00470', '12,30', '1005', '3,0', '0,5', '0,0208', '230,0', '4,700', '0,060', '2,54', '1,000', '0,10'];
  s4.push({
    id: 'cif-conta', title: 'Quante cifre significative?', level: 1,
    gen: () => ({ s: pick(SIGNUMS) }),
    solve: (p) => ({ n: P.sigCount(p.s) }),
    text: (p) => `Quante cifre significative ha <strong>${p.s}</strong>?`,
    asks: (p, r) => [{ label: 'Cifre significative', unit: '', value: r.n, tol: 0 }],
    hint: () => 'Gli zeri all\'inizio non contano; quelli in mezzo e quelli finali dopo la virgola sì.',
    steps: (p, r) => step(`${p.s} → ${res(r.n + ' cifre significative')}`, /^0[.,]0*/.test(p.s) ? 'Gli zeri iniziali servono solo a posizionare la virgola: non sono significativi.' : /[.,]\d*0$/.test(p.s) ? 'Gli zeri finali dopo la virgola sono significativi: dicono che la misura è precisa fino a quella cifra.' : 'Gli zeri compresi tra cifre diverse da zero sono significativi.'),
  });
  s4.push({
    id: 'cif-arr', title: 'Arrotonda', level: 1,
    gen: () => ({ x: Number((Math.pow(10, rand(-3, 3)) * (1 + Math.random() * 9)).toPrecision(6)), n: rand(2, 4) }),
    solve: (p) => ({ r: P.roundSig(p.x, p.n) }),
    text: (p) => `Arrotonda <strong>${App.num(p.x, 6)}</strong> a <strong>${p.n}</strong> cifre significative.`,
    asks: (p, r) => [{ label: 'Valore arrotondato', unit: '', value: r.r, tol: 1e-9 }],
    hint: () => 'Guarda la prima cifra che togli: se è 5 o più, la cifra precedente aumenta di 1.',
    steps: (p, r) => step(`${App.num(p.x, 6)} → ${res(App.num(r.r, 6))}`, `Tieni ${p.n} cifre a partire dalla prima diversa da zero e arrotonda l'ultima.`),
  });
  s4.push({
    id: 'cif-err', title: 'Errore assoluto e relativo', level: 2,
    gen: () => L.nice(() => { const v = pick([100, 220, 470, 1000, 4700, 10000]); return { v, m: Number((v * (1 + (rand(-60, 60) / 1000))).toPrecision(4)) }; }, (p) => p.m !== p.v, { v: 1000, m: 1023 }),
    solve: (p) => ({ ea: Math.abs(p.m - p.v), er: (Math.abs(p.m - p.v) / p.v) * 100 }),
    text: (p) => `Un resistore con valore nominale ${U(p.v, 'Ω')} viene misurato con il multimetro: ${U(p.m, 'Ω', 4)}. Trova lo scarto assoluto rispetto al nominale e lo scarto relativo percentuale.`,
    asks: (p, r) => [{ label: 'Scarto assoluto', unit: 'Ω', value: r.ea }, { label: 'Scarto relativo', unit: '%', value: r.er }],
    steps: (p, r) => step(`Δ = |${N(p.m)} − ${N(p.v)}| = ${res(N(r.ea) + ' Ω')}`) + step(`ε = ${frac('Δ', 'valore nominale')} · 100 = ${frac(N(r.ea), N(p.v))} · 100 = ${res(N(r.er) + ' %')}`, 'Lo scarto relativo permette di confrontare misure di grandezze diverse.'),
  });
  const TOLS = [['oro', 5], ['argento', 10], ['marrone', 1], ['rosso', 2]];
  s4.push({
    id: 'cif-toll', title: 'Entro la tolleranza?', level: 2,
    gen: () => { const v = pick([100, 220, 330, 470, 1000, 2200, 4700]); const t = pick(TOLS); const dev = (rand(-140, 140) / 100) * t[1]; return { v, t, m: Number((v * (1 + dev / 100)).toPrecision(4)) }; },
    solve: (p) => { const lo = p.v * (1 - p.t[1] / 100), hi = p.v * (1 + p.t[1] / 100); return { lo, hi, inside: p.m >= lo && p.m <= hi }; },
    text: (p) => `Resistore da ${U(p.v, 'Ω')} con fascia di tolleranza ${p.t[0]} (± ${p.t[1]} %). Il multimetro misura ${U(p.m, 'Ω', 4)}. Trova il valore minimo e massimo ammessi: il resistore è buono?`,
    asks: (p, r) => [h.qR('Minimo', r.lo), h.qR('Massimo', r.hi), h.choice('Il resistore', ['è entro la tolleranza', 'è fuori tolleranza'], r.inside ? 0 : 1)],
    steps: (p, r) => step(`Minimo = ${N(p.v)} · (1 − ${N(p.t[1] / 100)}) = ${res(U(r.lo, 'Ω', 4))}`) + step(`Massimo = ${N(p.v)} · (1 + ${N(p.t[1] / 100)}) = ${res(U(r.hi, 'Ω', 4))}`) +
      step(`${U(p.m, 'Ω', 4)} ${r.inside ? 'è compreso' : 'non è compreso'} nell'intervallo → ${res(r.inside ? 'entro la tolleranza' : 'fuori tolleranza')}`),
  });
  s4.push({
    id: 'cif-res', title: 'Quante cifre nel risultato?', level: 3,
    gen: () => ({ V: pick(['12,0', '9,00', '5,0', '3,30', '24']), R: pick(['4,7', '2,20', '1,5', '6,80', '3,3']) }),
    solve: (p) => {
      const v = App.parseNum(p.V), rr = App.parseNum(p.R);
      const n = Math.min(P.sigCount(p.V), P.sigCount(p.R));
      const I = v / rr;
      const right = App.num(P.roundSig(I, n), 6) + ' mA';
      const opts = [...new Set([App.num(P.roundSig(I, 4), 6) + ' mA', App.num(P.roundSig(I, 3), 6) + ' mA', App.num(P.roundSig(I, 2), 6) + ' mA', App.num(P.roundSig(I, 1), 6) + ' mA', right])].slice(0, 4);
      if (!opts.includes(right)) opts[0] = right;
      const sh = App.shuffle(opts);
      return { n, I, right, opts: sh, ans: sh.indexOf(right) };
    },
    text: (p) => `Misuri <var>V</var> = ${p.V} V e <var>R</var> = ${p.R} kΩ. Calcoli <var>I</var> = <var>V</var>/<var>R</var> con la calcolatrice. Come scrivi il risultato, con il numero giusto di cifre significative?`,
    asks: (p, r) => [h.choice('<var>I</var> =', r.opts, r.ans)],
    steps: (p, r) => step(`${p.V} ha ${P.sigCount(p.V)} cifre significative, ${p.R} ne ha ${P.sigCount(p.R)}`) +
      step(`La calcolatrice dà ${App.num(r.I, 8)} mA → ${res(r.right)}`, `In un prodotto o in un quoziente il risultato ha tante cifre significative quante il dato meno preciso: ${r.n}. Le altre cifre della calcolatrice non hanno significato.`),
  });

  function widgetDigits(host) {
    const c = K.widgetCard('Cifre significative e tolleranza', 'Cambia il numero di cifre e il valore misurato');
    const fig = document.createElement('div');
    const out = document.createElement('div');
    out.className = 'forms';
    const row = document.createElement('div');
    row.className = 'answer-row';
    row.innerHTML = '<label class="label" for="dw-in">Numero</label><input class="input" id="dw-in" value="0,0047368" inputmode="decimal" style="max-width:160px">';
    const inp = row.querySelector('input');
    let nSig = 3;
    const tol = document.createElement('div');
    const drawNum = () => {
      const x = App.parseNum(inp.value);
      if (!isFinite(x) || x === 0) { out.innerHTML = '<p class="hint">Scrivi un numero diverso da zero.</p>'; return; }
      const r = P.roundSig(x, nSig);
      const str = App.num(r, nSig + 2);
      let seen = false;
      const colored = [...str].map((ch) => {
        if (/\d/.test(ch)) {
          if (ch !== '0') seen = true;
          return `<b class="${seen ? 'sig' : 'nsig'}">${ch}</b>`;
        }
        return ch;
      }).join('');
      out.innerHTML = `<div class="form-row"><span class="label">Arrotondato a ${nSig} cifre significative</span><div class="digits">${colored}</div><span class="meta">Le cifre in blu sono significative; gli zeri iniziali (grigi) servono solo a posizionare la virgola.</span></div>
        <div class="form-row"><span class="label">In notazione scientifica non ci sono dubbi</span><div class="f">${B.sciH(P.sci(r, nSig).m, P.sci(r, nSig).e)}</div></div>`;
    };
    const sl = K.sliders(c, [{ id: 'n', label: 'Cifre significative', min: 1, max: 6, step: 1, value: 3, sig: 2 }], (v) => { nSig = Math.round(v.n); drawNum(); });
    inp.addEventListener('input', drawNum);
    const sl2 = K.sliders(tol, [{ id: 'm', label: 'Valore misurato di un resistore da 1 kΩ ± 5 % (Ω)', min: 900, max: 1100, step: 1, value: 1032, sig: 4 }], (v) => drawTol(v.m));
    const drawTol = (m) => {
      const W = 520, x0 = 30, x1 = W - 30;
      const X = (v) => x0 + ((x1 - x0) * (v - 900)) / 200;
      const inside = m >= 950 && m <= 1050;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} 80" role="img" style="width:100%;height:auto"><title>Intervallo di tolleranza</title>
        <line class="axis" x1="${x0}" y1="40" x2="${x1}" y2="40"/>
        <rect x="${X(950)}" y="30" width="${X(1050) - X(950)}" height="20" fill="var(--ok)" opacity=".2"/>
        ${[900, 950, 1000, 1050, 1100].map((v) => `<line class="gridl" x1="${X(v)}" y1="34" x2="${X(v)}" y2="46"/><text x="${X(v)}" y="66" text-anchor="middle">${v}</text>`).join('')}
        <circle cx="${X(m)}" cy="40" r="7" fill="${inside ? 'var(--ok)' : 'var(--bad)'}"/>
        <text x="${X(m)}" y="20" text-anchor="middle" class="barlbl dark">${m} Ω · ${inside ? 'entro tolleranza' : 'fuori tolleranza'} (${App.num(((m - 1000) / 10), 3)} %)</text></svg>`;
    };
    c.append(row, out, tol, fig);
    host.appendChild(c);
    drawNum();
    drawTol(sl2.values.m);
    void sl;
  }

  lessons.push({
    id: 'misure', num: 4, short: 'Cifre ed errori', title: 'Cifre significative, errori e tolleranze',
    intro: 'Ogni misura ha un\'incertezza. Le cifre significative dicono quanto è precisa una misura; errori e tolleranze dicono quanto può allontanarsi dal valore vero o nominale.',
    goals: ['Contare le cifre significative', 'Arrotondare', 'Errore assoluto e relativo', 'Tolleranza dei componenti'],
    widgets: [widgetDigits],
    example: s4[0], exampleTitle: 'Esempio: quante cifre significative?',
    families: s4,
    theory: `
      <article class="note"><h4>Cifre significative</h4>
        <ul><li>Tutte le cifre diverse da zero sono significative.</li>
          <li>Gli zeri <strong>tra</strong> cifre significative contano: 1005 ha 4 cifre.</li>
          <li>Gli zeri <strong>iniziali</strong> non contano: 0,0047 ha 2 cifre.</li>
          <li>Gli zeri <strong>finali dopo la virgola</strong> contano: 4,700 ha 4 cifre e dice che la misura è precisa al millesimo.</li>
          <li>Per un intero come 1200 c'è ambiguità: si toglie scrivendo 1,2 · 10³ (2 cifre) o 1,200 · 10³ (4 cifre).</li></ul></article>
      <article class="note"><h4>Nei calcoli</h4>
        <p>In un prodotto o in un quoziente il risultato si arrotonda al numero di cifre significative del dato <strong>meno preciso</strong>. La calcolatrice dà 2,553191 mA, ma con dati a 2 cifre si scrive 2,6 mA.</p></article>
      <article class="note"><h4>Errori e tolleranze</h4>
        <div class="eq"><span>Δ = |<var>x</var><sub>misurato</sub> − <var>x</var><sub>riferimento</sub>|</span><span>ε<sub>%</sub> = ${frac('Δ', '<var>x</var><sub>riferimento</sub>')} · 100</span></div>
        <p>La <strong>tolleranza</strong> di un componente è lo scarto massimo ammesso rispetto al valore nominale: un resistore da 1 kΩ ± 5 % può valere da 950 Ω a 1050 Ω. È scritta nell'ultima fascia del codice colori.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'mis', year: '1–2', yearLabel: '1ª–2ª', title: 'Grandezze, unità e notazione scientifica', route: 'mis-si', lessonWord: 'Lezione',
    desc: 'Sistema Internazionale, prefissi da giga a pico, notazione scientifica, cifre significative ed errori.',
    lessons,
  });
})();
