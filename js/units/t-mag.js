/* 3ª — Magnetismo, induzione elettromagnetica, induttori e transitori RL */
(function () {
  'use strict';
  const App = window.App;
  const P = window.Phys;
  const L = App.Lessons;
  const S = App.Schem.T;
  const { N, U, frac, step, res, ok } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const B = App.B;
  const mc = B.mc;
  const lessons = [];
  const BT = (x) => (x >= 1e-3 ? { unit: 'mT', value: x * 1e3 } : { unit: 'µT', value: x * 1e6 });
  const qB = (label, x) => ({ label, ...BT(x) });
  const EARTH = 5e-5;

  // =====================================================================
  // 1 — Il campo magnetico
  // =====================================================================
  const m1 = [];
  m1.push({
    id: 'mag-filo', title: 'Campo attorno a un filo', level: 1,
    defaults: { I: 10, r: 2 },
    gen: () => ({ I: pick([1, 2, 5, 10, 16, 20, 50]), r: pick([0.5, 1, 2, 4, 5, 10]) }),
    solve: (p) => ({ B0: P.bWire(p.I, p.r / 100) }),
    text: (p) => `Un filo rettilineo lungo è percorso da ${p.I} A. Quanto vale il campo magnetico a ${N(p.r)} cm dal filo?`,
    asks: (p, r) => [qB('<var>B</var>', r.B0)],
    hint: () => 'B = µ₀·I/(2π·r), con µ₀ = 4π·10⁻⁷ H/m e r in metri.',
    steps: (p, r) => step(`<var>B</var> = ${frac('µ<sub>0</sub> <var>I</var>', '2π <var>r</var>')} = ${frac('4π·10<sup>−7</sup> · ' + p.I, '2π · ' + N(p.r / 100))} = ${frac('2·10<sup>−7</sup> · ' + p.I, N(p.r / 100))} = ${res(U(r.B0, 'T'))}`, 'Il 2π si semplifica: B = 2·10⁻⁷·I/r.') +
      step(`Confronto con il campo terrestre (≈ 50 µT): ${N(r.B0 / EARTH, 3)} volte`, r.B0 > EARTH ? 'Abbastanza per deviare l\'ago di una bussola vicina: è l\'esperienza di Ørsted.' : 'Più debole del campo terrestre.'),
  });
  m1.push({
    id: 'mag-sol', title: 'Campo dentro un solenoide', level: 2,
    gen: () => ({ N: pick([100, 200, 500, 1000, 2000]), I: pick([0.1, 0.2, 0.5, 1, 2]), l: pick([5, 10, 20, 25]), core: rand(0, 1) }),
    solve: (p) => ({ mur: p.core ? 1000 : 1, B0: P.bSolenoid(p.N, p.I, p.l / 100, p.core ? 1000 : 1) }),
    text: (p) => `Un solenoide lungo ${p.l} cm ha ${p.N} spire ed è percorso da ${U(p.I, 'A')}. ${p.core ? 'Dentro c\'è un nucleo di ferro con µ<sub>r</sub> = 1000.' : 'Dentro c\'è aria (µ<sub>r</sub> = 1).'} Quanto vale il campo all'interno?`,
    asks: (p, r) => [qB('<var>B</var>', r.B0)],
    steps: (p, r) => step(`<var>B</var> = µ<sub>0</sub>µ<sub>r</sub>${frac('<var>N</var> <var>I</var>', '<var>l</var>')} = 4π·10<sup>−7</sup> · ${r.mur} · ${frac(p.N + ' · ' + N(p.I), N(p.l / 100))} = ${res(U(r.B0, 'T'))}`, p.core ? 'Il ferro moltiplica il campo di µr volte: è il principio dell\'elettromagnete e dei relè.' : 'Dentro un solenoide lungo il campo è quasi uniforme.'),
  });
  m1.push({
    id: 'mag-I', title: 'Quanta corrente serve?', level: 2,
    gen: () => ({ B0: pick([10, 20, 50, 100, 200]) * 1e-6, r: pick([1, 2, 5, 10]) }),
    solve: (p) => ({ I: (p.B0 * 2 * Math.PI * (p.r / 100)) / P.MU0 }),
    text: (p) => `Che corrente deve scorrere in un filo perché a ${p.r} cm il campo valga ${U(p.B0, 'T')}?`,
    asks: (p, r) => [{ label: '<var>I</var>', unit: 'A', value: r.I }],
    steps: (p, r) => step(`<var>I</var> = ${frac('2π <var>r</var> <var>B</var>', 'µ<sub>0</sub>')} = ${frac(N(p.r / 100) + ' · ' + B.sciOf(p.B0), '2·10<sup>−7</sup>')} = ${res(U(r.I, 'A'))}`, 'Formula inversa.'),
  });
  m1.push({
    id: 'mag-mc', title: 'Concetti sul magnetismo', level: 1,
    ...mc([
      ['Corrente uscente dal foglio: le linee del campo magnetico attorno al filo girano in senso…', ['antiorario', 'orario', 'radiale, verso l\'esterno', 'radiale, verso il filo'], 'Regola della mano destra: pollice nel verso della corrente (verso di te), le dita si chiudono in senso antiorario.'],
      ['Spezzando una calamita a metà ottieni…', ['due calamite, ognuna con un polo nord e un polo sud', 'un polo nord e un polo sud separati', 'due pezzi di ferro smagnetizzati', 'due poli nord'], 'I poli magnetici non si possono separare: non esistono "monopoli".'],
      ['Fuori da una calamita le linee di campo vanno…', ['dal polo nord al polo sud', 'dal polo sud al polo nord', 'da un polo nord all\'altro', 'in cerchio attorno ai poli'], 'Dentro la calamita proseguono da S a N: sono linee chiuse.'],
      ['L\'unità di misura dell\'induzione magnetica B è…', ['il tesla', 'il weber', 'l\'henry', 'il gauss'], '1 T = 1 N/(A·m). Il weber è l\'unità del flusso, l\'henry dell\'induttanza.'],
      ['Ørsted scoprì che…', ['una corrente devia l\'ago di una bussola', 'una calamita genera corrente', 'le cariche ferme generano campo magnetico', 'il ferro è sempre magnetico'], 'Fu la prima prova che elettricità e magnetismo sono legati (1820).'],
    ]),
  });

  function widgetField(host) {
    const c = K.widgetCard('Il campo di un filo e di un solenoide', 'Cambia corrente e distanza; la bussola segue il campo');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<button type="button" data-m="filo">Filo</button><button type="button" data-m="sol">Solenoide</button>';
    const dirSeg = document.createElement('div');
    dirSeg.className = 'seg';
    dirSeg.innerHTML = '<button type="button" data-d="1">Corrente uscente ⊙</button><button type="button" data-d="-1">Corrente entrante ⊗</button>';
    const pFilo = document.createElement('div');
    const pSol = document.createElement('div');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    let mode = 'filo', dir = 1, vf, vs;
    const core = document.createElement('label');
    core.className = 'switch';
    core.innerHTML = '<input type="checkbox"><span class="track"></span><span>Nucleo di ferro (µ<sub>r</sub> = 1000)</span>';
    const drawFilo = (v) => {
      vf = v;
      const W = 520, H = 260, cx = 200, cy = 130;
      let s = '';
      [30, 55, 80, 105].forEach((rr) => {
        s += `<circle cx="${cx}" cy="${cy}" r="${rr}" class="fline"/>`;
        const ax = cx, ay = cy - rr;
        s += dir > 0 ? `<polygon class="fhead2" points="${ax + 5},${ay - 5} ${ax - 5},${ay} ${ax + 5},${ay + 5}"/>` : `<polygon class="fhead2" points="${ax - 5},${ay - 5} ${ax + 5},${ay} ${ax - 5},${ay + 5}"/>`;
      });
      s += `<circle cx="${cx}" cy="${cy}" r="12" class="wirex"/>` + (dir > 0 ? `<circle cx="${cx}" cy="${cy}" r="3.5" fill="var(--ink)"/>` : `<path d="M${cx - 6} ${cy - 6} L${cx + 6} ${cy + 6} M${cx + 6} ${cy - 6} L${cx - 6} ${cy + 6}" stroke="var(--ink)" stroke-width="2"/>`);
      const px = cx + v.r * 20, py = cy;
      const ang = dir > 0 ? -90 : 90;
      s += `<g transform="translate(${px} ${py}) rotate(${ang})"><polygon points="0,-4 18,0 0,4" fill="var(--bad)"/><polygon points="0,-4 -18,0 0,4" fill="var(--ink-3)"/><circle r="2.5" fill="var(--surface)"/></g>`;
      s += `<path class="guide" d="M${cx} ${cy + 16} V${cy + 116} M${px} ${cy + 16} V${cy + 116}"/><path class="axis" d="M${cx} ${cy + 112} H${px}"/><text x="${(cx + px) / 2}" y="${cy + 127}" text-anchor="middle" class="small">r = ${N(v.r)} cm</text>`;
      const B0 = P.bWire(v.I, v.r / 100);
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Linee del campo attorno a un filo visto in sezione</title>${s}</svg>`;
      out.innerHTML = `<var>B</var> = µ<sub>0</sub><var>I</var>/(2π<var>r</var>) = ${res(U(B0, 'T'))}, cioè ${N(B0 / EARTH, 3)} volte il campo terrestre. Le linee sono circonferenze ${dir > 0 ? 'antiorarie' : 'orarie'} (regola della mano destra); la punta rossa della bussola indica il verso del campo. Raddoppiando la distanza il campo si dimezza.`;
    };
    const drawSol = (v) => {
      vs = v;
      const mur = core.querySelector('input').checked ? 1000 : 1;
      const W = 520, H = 220, x0 = 110, x1 = 410, cy = 110;
      const n = App.clamp(Math.round(v.N / 50), 4, 16);
      let s = mur > 1 ? `<rect x="${x0}" y="${cy - 26}" width="${x1 - x0}" height="52" fill="var(--ink-3)" opacity=".18"/>` : '';
      for (let k = 0; k <= 3; k++) {
        const y = cy - 18 + k * 12;
        s += `<line class="fline" x1="${x0 - 30}" y1="${y}" x2="${x1 + 30}" y2="${y}"/><polygon class="fhead2" points="${x1 + 30},${y - 4} ${x1 + 38},${y} ${x1 + 30},${y + 4}"/>`;
      }
      s += `<path class="fline" d="M${x1 + 38} ${cy - 18} C ${x1 + 110} ${cy - 120}, ${x0 - 110} ${cy - 120}, ${x0 - 30} ${cy - 18}"/><path class="fline" d="M${x1 + 38} ${cy + 18} C ${x1 + 110} ${cy + 120}, ${x0 - 110} ${cy + 120}, ${x0 - 30} ${cy + 18}"/>`;
      for (let k = 0; k < n; k++) {
        const x = x0 + ((k + 0.5) * (x1 - x0)) / n;
        s += `<ellipse cx="${x}" cy="${cy}" rx="7" ry="34" class="turn"/>`;
      }
      s += `<text x="${x0 - 40}" y="${cy + 5}" text-anchor="end" class="node">S</text><text x="${x1 + 48}" y="${cy + 5}" class="node">N</text>`;
      const B0 = P.bSolenoid(v.N, v.I, v.l / 100, mur);
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Campo di un solenoide</title>${s}</svg>`;
      out.innerHTML = `<var>B</var> = µ<sub>0</sub>µ<sub>r</sub><var>N</var><var>I</var>/<var>l</var> = ${res(U(B0, 'T'))}. Dentro il solenoide il campo è quasi uniforme, fuori si richiude come quello di una calamita: un'estremità fa da polo nord. ${mur > 1 ? 'Il nucleo di ferro moltiplica il campo per mille: è un elettromagnete.' : 'Prova ad aggiungere il nucleo di ferro.'}`;
    };
    const slF = K.sliders(pFilo, [
      { id: 'I', label: 'Corrente <var>I</var> (A)', min: 0.5, max: 50, step: 0.5, value: 10 },
      { id: 'r', label: 'Distanza della bussola <var>r</var> (cm)', min: 0.5, max: 5, step: 0.1, value: 2, sig: 2 },
    ], drawFilo);
    const slS = K.sliders(pSol, [
      { id: 'N', label: 'Spire <var>N</var>', min: 50, max: 2000, step: 10, value: 500, sig: 4 },
      { id: 'I', label: 'Corrente <var>I</var> (A)', min: 0.1, max: 5, step: 0.1, value: 1, sig: 2 },
      { id: 'l', label: 'Lunghezza <var>l</var> (cm)', min: 5, max: 50, step: 1, value: 20, sig: 2 },
    ], drawSol);
    pSol.appendChild(core);
    core.querySelector('input').addEventListener('change', () => drawSol(vs));
    const show = () => {
      pFilo.hidden = mode !== 'filo';
      dirSeg.hidden = mode !== 'filo';
      pSol.hidden = mode !== 'sol';
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
      dirSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.d) === dir)));
      if (mode === 'filo') drawFilo(vf || slF.values); else drawSol(vs || slS.values);
    };
    seg.addEventListener('click', (e) => { if (e.target.dataset.m) { mode = e.target.dataset.m; show(); } });
    dirSeg.addEventListener('click', (e) => { if (e.target.dataset.d) { dir = Number(e.target.dataset.d); show(); } });
    c.querySelector('.card-head').after(seg);
    c.append(dirSeg, pFilo, pSol, fig, out);
    host.appendChild(c);
    show();
  }

  lessons.push({
    id: 'campo', num: 1, short: 'Campo magnetico', title: 'Il campo magnetico',
    intro: 'Calamite e correnti creano attorno a sé un campo magnetico. Ogni filo percorso da corrente è circondato da linee di campo circolari; un solenoide crea dentro di sé un campo uniforme, come una calamita.',
    goals: ['Poli e linee di campo', 'Filo: B = µ₀I/(2πr)', 'Solenoide: B = µ₀µᵣNI/l', 'Regola della mano destra'],
    widgets: [widgetField],
    example: m1[0], exampleTitle: 'Esempio: campo attorno a un filo',
    families: m1,
    theory: `
      <article class="note"><h4>Calamite e linee di campo</h4>
        <p>Ogni calamita ha un polo nord e un polo sud: poli uguali si respingono, opposti si attraggono. Le linee di campo escono dal nord ed entrano nel sud; sono sempre chiuse. L'induzione magnetica <var>B</var> si misura in <strong>tesla</strong> (T): il campo terrestre vale circa 50 µT, una calamita da frigorifero qualche millitesla.</p></article>
      <article class="note"><h4>Filo rettilineo</h4>
        <div class="eq"><span><var>B</var> = ${frac('µ<sub>0</sub> <var>I</var>', '2π <var>r</var>')}</span><span class="u">µ₀ = 4π · 10⁻⁷ H/m</span></div>
        <p><strong>Regola della mano destra</strong>: il pollice nel verso della corrente, le dita piegate danno il verso delle linee di campo.</p></article>
      <article class="note"><h4>Solenoide</h4>
        <div class="eq"><span><var>B</var> = µ<sub>0</sub> µ<sub>r</sub> ${frac('<var>N</var> <var>I</var>', '<var>l</var>')}</span></div>
        <p>Un nucleo ferromagnetico (µ<sub>r</sub> da centinaia a migliaia) moltiplica il campo: è il principio di elettromagneti, relè, trasformatori e motori.</p></article>`,
  });

  // =====================================================================
  // 2 — Forze magnetiche
  // =====================================================================
  const m2 = [];
  m2.push({
    id: 'for-fil', title: 'Forza su un conduttore', level: 1,
    defaults: { B: 0.2, I: 5, L: 10, a: 90 },
    gen: () => ({ B: pick([0.05, 0.1, 0.2, 0.5, 1]), I: pick([1, 2, 5, 10]), L: pick([5, 10, 20, 50]), a: pick([90, 90, 30, 45, 60]) }),
    solve: (p) => ({ F: P.forceWire(p.B, p.I, p.L / 100, p.a) }),
    text: (p) => `Un tratto di filo lungo ${p.L} cm, percorso da ${p.I} A, è immerso in un campo di ${N(p.B)} T e forma con le linee di campo un angolo di ${p.a}°. Quanto vale la forza?`,
    asks: (p, r) => [{ label: '<var>F</var>', unit: 'N', value: r.F }],
    hint: () => 'F = B·I·L·sin α, con L in metri.',
    steps: (p, r) => step(`<var>F</var> = <var>B</var>·<var>I</var>·<var>L</var>·sin α = ${N(p.B)} · ${p.I} · ${N(p.L / 100)} · sin ${p.a}° = ${res(U(r.F, 'N'))}`, p.a === 90 ? 'Filo perpendicolare al campo: sin 90° = 1, forza massima.' : `sin ${p.a}° = ${N(Math.sin((p.a * Math.PI) / 180), 3)}: un filo parallelo al campo non sentirebbe forza.`),
  });
  m2.push({
    id: 'for-par', title: 'Due fili paralleli', level: 2,
    gen: () => ({ I1: pick([1, 2, 5, 10, 20]), I2: pick([1, 2, 5, 10, 20]), d: pick([1, 2, 5, 10]), same: Math.random() < 0.5 }),
    solve: (p) => ({ F: P.forceParallel(p.I1, p.I2, p.d / 100, 1) }),
    text: (p) => `Due fili paralleli distano ${p.d} cm e sono percorsi da ${p.I1} A e ${p.I2} A, ${p.same ? 'nello stesso verso' : 'in versi opposti'}. Quanto vale la forza su ogni metro di filo? Si attraggono o si respingono?`,
    asks: (p, r) => [{ label: '<var>F</var> per metro', unit: 'mN', value: r.F * 1000 }, h.choice('I fili', ['si attraggono', 'si respingono'], p.same ? 0 : 1)],
    steps: (p, r) => step(`${frac('<var>F</var>', '<var>L</var>')} = ${frac('µ<sub>0</sub> <var>I</var><sub>1</sub> <var>I</var><sub>2</sub>', '2π <var>d</var>')} = ${frac('2·10<sup>−7</sup> · ' + p.I1 + ' · ' + p.I2, N(p.d / 100))} = ${res(U(r.F, 'N'))} al metro`) +
      step(res(p.same ? 'Si attraggono' : 'Si respingono'), 'Correnti concordi si attraggono, discordi si respingono (al contrario delle cariche!). Su questo effetto si basava la vecchia definizione dell\'ampere.'),
  });
  const DIRS = { destra: [1, 0], sinistra: [-1, 0], 'verso l\'alto': [0, 1], 'verso il basso': [0, -1] };
  m2.push({
    id: 'for-verso', title: 'Da che parte spinge?', level: 1,
    gen: () => ({ i: pick(Object.keys(DIRS)), b: pick(['entrante nel foglio', 'uscente dal foglio']) }),
    solve: (p) => {
      const [lx, ly] = DIRS[p.i];
      const bz = p.b.startsWith('entrante') ? -1 : 1;
      const f = [ly * bz, -lx * bz];
      const name = Object.keys(DIRS).find((k) => DIRS[k][0] === f[0] && DIRS[k][1] === f[1]);
      const opts = Object.keys(DIRS);
      return { name, opts, ans: opts.indexOf(name) };
    },
    text: (p) => `Un filo nel piano del foglio è percorso da corrente ${p.i === 'destra' || p.i === 'sinistra' ? 'verso ' + p.i : p.i}. Il campo magnetico è ${p.b}. In che direzione è spinto il filo?`,
    asks: (p, r) => [h.choice('La forza è diretta', r.opts, r.ans)],
    hint: () => 'Regola della mano sinistra: indice nel verso del campo, medio nel verso della corrente, il pollice dà la forza. Oppure: F = I·L × B.',
    steps: (p, r) => step(res(r.name), 'La forza è sempre perpendicolare sia al filo sia al campo. Invertendo la corrente o il campo si inverte la forza: è così che il motore elettrico gira.'),
  });
  m2.push({
    id: 'for-lor', title: 'Forza di Lorentz', level: 3,
    gen: () => ({ v: pick([1, 2, 5]) * Math.pow(10, rand(5, 7)), B: pick([0.01, 0.05, 0.1, 0.5, 1]) }),
    solve: (p) => ({ F: P.QE * p.v * p.B }),
    text: (p) => `Un elettrone entra a ${B.sciOf(p.v)} m/s perpendicolarmente a un campo magnetico di ${N(p.B)} T. Quanto vale la forza che subisce?`,
    asks: (p, r) => B.qSci('<var>F</var> (N)', r.F),
    steps: (p, r) => step(`<var>F</var> = <var>q</var>·<var>v</var>·<var>B</var> = 1,602·10<sup>−19</sup> · ${B.sciOf(p.v)} · ${N(p.B)} = ${res(B.sciOf(r.F) + ' N')}`, 'La forza è perpendicolare alla velocità: non cambia il modulo della velocità ma la curva, e l\'elettrone si muove su una circonferenza. Così funzionavano i televisori a tubo catodico.'),
  });

  function widgetForce(host) {
    const c = K.widgetCard('Fili nel campo, fili tra loro', 'Inverti corrente e campo: guarda la freccia della forza');
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<button type="button" data-m="b">Filo nel campo</button><button type="button" data-m="p">Due fili paralleli</button>';
    const ctl = document.createElement('div');
    ctl.className = 'row';
    ctl.innerHTML = '<div class="seg" data-g="i"><button type="button" data-v="1">Corrente →</button><button type="button" data-v="-1">Corrente ←</button></div><div class="seg" data-g="b"><button type="button" data-v="-1">Campo entrante ×</button><button type="button" data-v="1">Campo uscente ·</button></div>';
    const ctl2 = document.createElement('div');
    ctl2.className = 'seg';
    ctl2.innerHTML = '<button type="button" data-v="1">Correnti concordi</button><button type="button" data-v="-1">Correnti discordi</button>';
    const pB = document.createElement('div');
    const pP = document.createElement('div');
    const fig = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    let mode = 'b', ci = 1, cb = -1, same = 1, vb, vp;
    const drawB = (v) => {
      vb = v;
      const W = 520, H = 230;
      let s = '';
      for (let x = 40; x < W; x += 40) for (let y = 30; y < H; y += 40) s += cb < 0 ? `<path d="M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}" stroke="var(--ink-3)" stroke-width="1.4"/>` : `<circle cx="${x}" cy="${y}" r="2.6" fill="var(--ink-3)"/>`;
      const len = 120 + v.L * 4;
      const x0 = W / 2 - len / 2, y = H / 2;
      s += `<line x1="${x0}" y1="${y}" x2="${x0 + len}" y2="${y}" stroke="var(--energy)" stroke-width="6" stroke-linecap="round"/>`;
      const ax = ci > 0 ? x0 + len - 20 : x0 + 20;
      s += `<polygon points="${ax - ci * 10},${y - 9} ${ax + ci * 6},${y} ${ax - ci * 10},${y + 9}" fill="var(--ink)"/>`;
      const F = v.B / 1000 * v.I * (v.L / 100);
      const up = ci * -cb > 0;
      const fl = App.clamp(20 + 25 * Math.log10(F / 1e-4 + 1), 20, 90);
      s += `<line class="farrow" x1="${W / 2}" y1="${y}" x2="${W / 2}" y2="${up ? y - fl : y + fl}"/><polygon class="fhead" points="${W / 2 - 7},${up ? y - fl : y + fl} ${W / 2},${up ? y - fl - 12 : y + fl + 12} ${W / 2 + 7},${up ? y - fl : y + fl}"/>`;
      s += `<text x="${W / 2 + 12}" y="${up ? y - fl : y + fl + 6}" class="barlbl dark">F</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Forza su un filo in un campo magnetico</title>${s}</svg>`;
      out.innerHTML = `<var>F</var> = <var>B</var><var>I</var><var>L</var> = ${res(U(F, 'N'))}, diretta verso ${up ? "l'alto" : 'il basso'}. Invertendo la corrente o il campo la forza si inverte; invertendo entrambi resta uguale.`;
    };
    const drawP = (v) => {
      vp = v;
      const W = 520, H = 230;
      const dpx = 60 + v.d * 20;
      const x1 = W / 2 - dpx / 2, x2 = W / 2 + dpx / 2;
      let s = `<line x1="${x1}" y1="20" x2="${x1}" y2="${H - 20}" stroke="var(--energy)" stroke-width="5"/><line x1="${x2}" y1="20" x2="${x2}" y2="${H - 20}" stroke="var(--energy)" stroke-width="5"/>`;
      s += `<polygon points="${x1 - 8},44 ${x1},28 ${x1 + 8},44" fill="var(--ink)"/>`;
      s += same > 0 ? `<polygon points="${x2 - 8},44 ${x2},28 ${x2 + 8},44" fill="var(--ink)"/>` : `<polygon points="${x2 - 8},${H - 44} ${x2},${H - 28} ${x2 + 8},${H - 44}" fill="var(--ink)"/>`;
      const F = P.forceParallel(v.I1, v.I2, v.d / 100);
      const fl = App.clamp(20 + 18 * Math.log10(F / 1e-7 + 1), 18, 70);
      const att = same > 0;
      [[x1, att ? 1 : -1], [x2, att ? -1 : 1]].forEach(([x, d]) => {
        s += `<line class="farrow" x1="${x}" y1="${H / 2}" x2="${x + d * fl}" y2="${H / 2}"/><polygon class="fhead" points="${x + d * fl},${H / 2 - 7} ${x + d * (fl + 12)},${H / 2} ${x + d * fl},${H / 2 + 7}"/>`;
      });
      s += `<text x="${x1 - 10}" y="${H - 6}" text-anchor="end" class="small">I₁ = ${N(v.I1)} A</text><text x="${x2 + 10}" y="${H - 6}" class="small">I₂ = ${N(v.I2)} A</text>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Due fili paralleli</title>${s}</svg>`;
      out.innerHTML = `<var>F</var>/<var>L</var> = µ<sub>0</sub><var>I</var><sub>1</sub><var>I</var><sub>2</sub>/(2π<var>d</var>) = ${res(U(F, 'N'))} per metro: i fili ${att ? 'si attraggono' : 'si respingono'}. Ogni filo è immerso nel campo dell'altro.`;
    };
    const slB = K.sliders(pB, [
      { id: 'B', label: 'Campo <var>B</var> (mT)', min: 10, max: 1000, log: true, value: 200 },
      { id: 'I', label: 'Corrente <var>I</var> (A)', min: 0.5, max: 20, step: 0.5, value: 5 },
      { id: 'L', label: 'Lunghezza nel campo <var>L</var> (cm)', min: 1, max: 50, step: 1, value: 10, sig: 2 },
    ], drawB);
    const slP = K.sliders(pP, [
      { id: 'I1', label: '<var>I</var><sub>1</sub> (A)', min: 1, max: 50, step: 1, value: 10, sig: 2 },
      { id: 'I2', label: '<var>I</var><sub>2</sub> (A)', min: 1, max: 50, step: 1, value: 10, sig: 2 },
      { id: 'd', label: 'Distanza <var>d</var> (cm)', min: 1, max: 15, step: 0.5, value: 5, sig: 2 },
    ], drawP);
    const show = () => {
      pB.hidden = ctl.hidden = mode !== 'b';
      pP.hidden = ctl2.hidden = mode !== 'p';
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
      ctl.querySelectorAll('[data-g="i"] button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === ci)));
      ctl.querySelectorAll('[data-g="b"] button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === cb)));
      ctl2.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === same)));
      if (mode === 'b') drawB(vb || slB.values); else drawP(vp || slP.values);
    };
    seg.addEventListener('click', (e) => { if (e.target.dataset.m) { mode = e.target.dataset.m; show(); } });
    ctl.addEventListener('click', (e) => {
      const g = e.target.closest('[data-g]');
      if (!g || !e.target.dataset.v) return;
      if (g.dataset.g === 'i') ci = Number(e.target.dataset.v); else cb = Number(e.target.dataset.v);
      show();
    });
    ctl2.addEventListener('click', (e) => { if (e.target.dataset.v) { same = Number(e.target.dataset.v); show(); } });
    c.querySelector('.card-head').after(seg);
    c.append(ctl, ctl2, pB, pP, fig, out);
    host.appendChild(c);
    show();
  }

  lessons.push({
    id: 'forza', num: 2, short: 'Forza magnetica', title: 'Forze magnetiche su correnti e cariche',
    intro: 'Un campo magnetico spinge le cariche in movimento: un filo percorso da corrente in un campo subisce una forza perpendicolare. È il principio di funzionamento del motore elettrico e degli altoparlanti.',
    goals: ['F = BIL sin α', 'Verso della forza', 'Due fili paralleli', 'Forza di Lorentz'],
    widgets: [widgetForce],
    example: m2[0], exampleTitle: 'Esempio: forza su un conduttore',
    families: m2,
    theory: `
      <article class="note"><h4>Forza su un conduttore</h4>
        <div class="eq"><span><var>F</var> = <var>B</var> · <var>I</var> · <var>L</var> · sin α</span></div>
        <p>α è l'angolo tra il filo e il campo: massima a 90°, nulla se il filo è parallelo alle linee. La forza è perpendicolare sia al filo sia al campo. <strong>Regola della mano sinistra</strong>: indice = campo, medio = corrente, pollice = forza.</p></article>
      <article class="note"><h4>Due fili paralleli</h4>
        <div class="eq"><span>${frac('<var>F</var>', '<var>L</var>')} = ${frac('µ<sub>0</sub> <var>I</var><sub>1</sub> <var>I</var><sub>2</sub>', '2π <var>d</var>')}</span></div>
        <p>Correnti concordi si attraggono, discordi si respingono. Fino al 2019 l'ampere era definito proprio così: la corrente che in due fili a 1 m di distanza produce 2 · 10⁻⁷ N per metro.</p></article>
      <article class="note"><h4>Forza di Lorentz</h4>
        <div class="eq"><span><var>F</var> = <var>q</var> · <var>v</var> · <var>B</var> · sin α</span></div>
        <p>Su una carica in moto la forza è perpendicolare alla velocità: la carica curva senza accelerare né rallentare.</p></article>
      <article class="note"><h4>Il motore elettrico</h4>
        <p>Una spira percorsa da corrente in un campo magnetico subisce due forze opposte sui lati: nasce una coppia che la fa ruotare. Il collettore inverte la corrente a ogni mezzo giro, così la rotazione continua.</p></article>`,
  });

  // =====================================================================
  // 3 — Induzione elettromagnetica
  // =====================================================================
  const m3 = [];
  m3.push({
    id: 'ind-flux', title: 'Flusso magnetico', level: 1,
    defaults: { B: 0.2, S: 50, a: 60 },
    gen: () => ({ B: pick([0.05, 0.1, 0.2, 0.5, 1]), S: pick([10, 20, 50, 100, 200]), a: pick([0, 30, 45, 60, 90]) }),
    solve: (p) => ({ F: P.flux(p.B, p.S * 1e-4, p.a) }),
    text: (p) => `Una spira di area ${p.S} cm² è in un campo uniforme di ${N(p.B)} T; la normale alla spira forma un angolo di ${p.a}° con il campo. Quanto vale il flusso?`,
    asks: (p, r) => [{ label: 'Φ', unit: 'mWb', value: r.F * 1000 }],
    steps: (p, r) => step(`Φ = <var>B</var>·<var>S</var>·cos α = ${N(p.B)} · ${B.sciOf(p.S * 1e-4)} · cos ${p.a}° = ${res(U(r.F, 'Wb'))}`, p.a === 90 ? 'Normale perpendicolare al campo: le linee scorrono parallele alla spira e non la attraversano, flusso nullo.' : p.a === 0 ? 'Spira perpendicolare al campo: flusso massimo.' : 'Conta solo la componente del campo che attraversa la spira.'),
  });
  m3.push({
    id: 'ind-fem', title: 'Legge di Faraday', level: 2,
    gen: () => ({ N: pick([10, 50, 100, 200, 500]), B1: pick([0, 0.1, 0.2]), B2: pick([0.3, 0.5, 0.8, 1]), S: pick([10, 20, 50]), dt: pick([5, 10, 20, 50, 100]) }),
    solve: (p) => { const dF = (p.B2 - p.B1) * p.S * 1e-4; return { dF, e: (p.N * dF) / (p.dt / 1000) }; },
    text: (p) => `Una bobina di ${p.N} spire, area ${p.S} cm², è perpendicolare a un campo che passa da ${N(p.B1)} T a ${N(p.B2)} T in ${p.dt} ms. Quanto vale la f.e.m. indotta (in valore assoluto)?`,
    asks: (p, r) => [{ label: '|<var>e</var>|', unit: 'V', value: r.e }],
    hint: () => '|e| = N·ΔΦ/Δt con ΔΦ = ΔB·S.',
    steps: (p, r) => step(`ΔΦ = Δ<var>B</var>·<var>S</var> = ${N(p.B2 - p.B1)} · ${B.sciOf(p.S * 1e-4)} = ${U(r.dF, 'Wb')}`) +
      step(`|<var>e</var>| = <var>N</var>·${frac('ΔΦ', 'Δ<var>t</var>')} = ${p.N} · ${frac(U(r.dF, 'Wb'), U(p.dt / 1000, 's'))} = ${res(U(r.e, 'V'))}`, 'Più veloce è la variazione, più alta la f.e.m.: per questo una bobina "aprendo" un circuito può dare una scintilla.'),
  });
  m3.push({
    id: 'ind-alt', title: 'L\'alternatore', level: 3,
    gen: () => ({ N: pick([50, 100, 200]), B: pick([0.1, 0.2, 0.5]), S: pick([50, 100, 200]), f: pick([10, 25, 50]) }),
    solve: (p) => ({ w: 2 * Math.PI * p.f, Em: p.N * p.B * p.S * 1e-4 * 2 * Math.PI * p.f }),
    text: (p) => `Una bobina di ${p.N} spire, area ${p.S} cm², ruota a ${p.f} giri al secondo in un campo di ${N(p.B)} T. Quanto vale il picco della f.e.m. indotta?`,
    asks: (p, r) => [{ label: '<var>E</var><sub>max</sub>', unit: 'V', value: r.Em }],
    steps: (p, r) => step(`ω = 2π<var>f</var> = 2π · ${p.f} = ${N(r.w)} rad/s`) + step(`<var>E</var><sub>max</sub> = <var>N</var>·<var>B</var>·<var>S</var>·ω = ${p.N} · ${N(p.B)} · ${B.sciOf(p.S * 1e-4)} · ${N(r.w)} = ${res(U(r.Em, 'V'))}`, 'La f.e.m. è sinusoidale: e(t) = E_max · sin(ωt). È la corrente alternata della 4ª: in Italia f = 50 Hz.'),
  });
  m3.push({
    id: 'ind-mc', title: 'Concetti sull\'induzione', level: 1,
    ...mc([
      ['Un magnete fermo dentro una bobina collegata a un amperometro…', ['non induce corrente', 'induce una corrente costante', 'induce una corrente alternata', 'la scalda'], 'Serve una variazione di flusso: magnete fermo, flusso costante, nessuna f.e.m.'],
      ['La legge di Lenz dice che la corrente indotta…', ['si oppone alla variazione di flusso che l\'ha generata', 'rinforza la variazione di flusso', 'è sempre oraria', 'non dipende dal flusso'], 'È il segno meno nella legge di Faraday-Neumann-Lenz: conservazione dell\'energia.'],
      ['La f.e.m. indotta in una bobina è più grande se…', ['il flusso cambia più rapidamente', 'il flusso è grande ma costante', 'la bobina ha meno spire', 'il campo è uniforme'], 'e = −N·ΔΦ/Δt: conta la rapidità della variazione, e le spire moltiplicano l\'effetto.'],
      ['L\'unità di misura del flusso magnetico è…', ['il weber (T·m²)', 'il tesla', 'l\'henry', 'il volt'], '1 Wb = 1 T · 1 m² = 1 V · 1 s.'],
      ['Avvicinando il polo nord di una calamita a una bobina, la corrente indotta crea verso la calamita…', ['un polo nord, che la respinge', 'un polo sud, che la attira', 'nessun polo', 'un campo uniforme'], 'Lenz: la bobina si oppone all\'avvicinamento, quindi respinge la calamita.'],
    ]),
  });

  function widgetAlternator(host) {
    const c = K.widgetCard('La spira che ruota', 'Il flusso cambia, nasce una f.e.m.: è l\'alternatore');
    const fig = document.createElement('div');
    const chart = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'btn small';
    play.textContent = 'Fai girare';
    let timer = null, last;
    const draw = (v) => {
      last = v;
      const th = (v.a * Math.PI) / 180;
      const W = 520, H = 200, cx = W / 2, cy = 100;
      let s = `<rect x="20" y="40" width="50" height="120" rx="6" fill="var(--bad)" opacity=".85"/><text x="45" y="106" text-anchor="middle" class="barlbl">N</text>`;
      s += `<rect x="${W - 70}" y="40" width="50" height="120" rx="6" fill="var(--pen)" opacity=".85"/><text x="${W - 45}" y="106" text-anchor="middle" class="barlbl">S</text>`;
      for (let y = 55; y <= 145; y += 22) s += `<line class="fline" x1="72" y1="${y}" x2="${W - 72}" y2="${y}"/><polygon class="fhead2" points="${W - 82},${y - 4} ${W - 74},${y} ${W - 82},${y + 4}"/>`;
      const wpx = 110 * Math.abs(Math.sin(th));
      s += `<rect x="${cx - wpx / 2}" y="${cy - 60}" width="${Math.max(wpx, 2)}" height="120" fill="${Math.sin(th) >= 0 ? 'var(--g3)' : 'var(--g4)'}" opacity=".3" stroke="var(--energy)" stroke-width="4"/>`;
      s += `<line x1="${cx}" y1="${cy - 80}" x2="${cx}" y2="${cy + 80}" stroke="var(--ink-3)" stroke-dasharray="4 4"/>`;
      fig.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>Spira che ruota tra due poli magnetici</title>${s}</svg>`;
      const ch = K.chart({ W: 460, H: 200, xmax: 360, ymax: 1, ymin: -1, xu: '', yu: '', xlabel: 'angolo (°)', ylabel: '', ticks: 4 });
      let dF = '', dE = '';
      for (let k = 0; k <= 120; k++) {
        const a = (360 * k) / 120, t = (a * Math.PI) / 180;
        dF += (k ? 'L' : 'M') + ch.X(a).toFixed(1) + ' ' + ch.Y(Math.cos(t)).toFixed(1);
        dE += (k ? 'L' : 'M') + ch.X(a).toFixed(1) + ' ' + ch.Y(Math.sin(t)).toFixed(1);
      }
      const a0 = ((v.a % 360) + 360) % 360;
      chart.innerHTML = `<svg class="chart" viewBox="0 0 460 200" role="img" style="width:100%;height:auto"><title>Flusso e f.e.m. in un giro</title>${ch.s}<line class="axis" x1="${ch.X(0)}" y1="${ch.Y(0)}" x2="${ch.X(360)}" y2="${ch.Y(0)}"/><path class="gen" d="${dF}"/><path class="load" d="${dE}"/><line class="guide" x1="${ch.X(a0)}" y1="${ch.Y(-1)}" x2="${ch.X(a0)}" y2="${ch.Y(1)}"/><circle class="op" cx="${ch.X(a0)}" cy="${ch.Y(Math.cos((a0 * Math.PI) / 180))}" r="5"/><circle cx="${ch.X(a0)}" cy="${ch.Y(Math.sin((a0 * Math.PI) / 180))}" r="4" fill="var(--energy)"/></svg>
        <div class="legend"><span><i style="background:var(--pen)"></i>flusso Φ / Φ<sub>max</sub></span><span><i style="background:var(--energy)"></i>f.e.m. e / E<sub>max</sub></span></div>`;
      out.innerHTML = `Angolo ${Math.round(a0)}°: Φ = ${N(Math.cos(th), 2)} Φ<sub>max</sub>, <var>e</var> = ${N(Math.sin(th), 2)} <var>E</var><sub>max</sub>. La f.e.m. è massima quando il flusso passa per zero, perché è lì che cambia più in fretta; è nulla quando il flusso è massimo. Il risultato è una tensione sinusoidale.`;
    };
    const sl = K.sliders(c, [{ id: 'a', label: 'Angolo di rotazione (°)', min: 0, max: 360, step: 1, value: 45, sig: 3 }], draw);
    play.addEventListener('click', () => {
      if (timer) { clearInterval(timer); timer = null; play.textContent = 'Fai girare'; return; }
      play.textContent = 'Ferma';
      let a = last.a;
      timer = setInterval(() => {
        if (!App.isVisible(c)) { clearInterval(timer); timer = null; play.textContent = 'Fai girare'; return; }
        a = (a + 4) % 360;
        sl.fields.a.set(a);
        draw({ a });
      }, App.reducedMotion ? 250 : 40);
    });
    c.append(play, fig, chart, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'induzione', num: 3, short: 'Induzione', title: 'Induzione elettromagnetica',
    intro: 'Una corrente crea un campo magnetico; Faraday scoprì il contrario: un campo magnetico che cambia crea una f.e.m. Da qui vengono alternatori, trasformatori e quasi tutta l\'energia elettrica che usiamo.',
    goals: ['Flusso Φ = BS cos α', 'Faraday-Neumann-Lenz', 'Legge di Lenz', 'Principio dell\'alternatore'],
    widgets: [widgetAlternator],
    example: m3[0], exampleTitle: 'Esempio: flusso magnetico',
    families: m3,
    theory: `
      <article class="note"><h4>Flusso magnetico</h4>
        <div class="eq"><span>Φ = <var>B</var> · <var>S</var> · cos α</span><span class="u">weber [Wb] = T·m²</span></div>
        <p>Misura "quante linee di campo" attraversano una superficie; α è l'angolo tra il campo e la normale alla superficie.</p></article>
      <article class="note"><h4>Legge di Faraday-Neumann-Lenz</h4>
        <div class="eq"><span><var>e</var> = −<var>N</var> · ${frac('ΔΦ', 'Δ<var>t</var>')}</span></div>
        <p>Il flusso può cambiare perché cambia <var>B</var>, perché cambia l'area o perché la spira ruota. Il segno meno è la <strong>legge di Lenz</strong>: la corrente indotta crea un campo che si oppone alla variazione.</p></article>
      <article class="note"><h4>Dall'alternatore al trasformatore</h4>
        <p>Una bobina che ruota in un campo produce <span class="f"><var>e</var>(<var>t</var>) = <var>N</var><var>B</var><var>S</var>ω sin(ω<var>t</var>)</span>: una tensione alternata. Nel trasformatore una corrente alternata nel primario crea un flusso variabile che induce una f.e.m. nel secondario.</p></article>`,
  });

  // =====================================================================
  // 4 — Induttori e transitori RL
  // =====================================================================
  const m4 = [];
  m4.push({
    id: 'ind-L', title: 'Induttanza di un solenoide', level: 2,
    gen: () => ({ N: pick([100, 200, 500, 1000]), S: pick([1, 2, 5, 10]), l: pick([2, 5, 10, 20]), core: rand(0, 1) }),
    solve: (p) => ({ mur: p.core ? 200 : 1, L0: P.lSolenoid(p.N, p.S * 1e-4, p.l / 100, p.core ? 200 : 1) }),
    text: (p) => `Una bobina di ${p.N} spire, sezione ${p.S} cm², lunga ${p.l} cm, ${p.core ? 'avvolta su un nucleo di ferrite con µ<sub>r</sub> = 200' : 'in aria'}. Quanto vale l'induttanza?`,
    asks: (p, r) => [{ label: '<var>L</var>', unit: 'mH', value: r.L0 * 1000 }],
    hint: () => 'L = µ₀·µᵣ·N²·S/l: le spire contano al quadrato.',
    steps: (p, r) => step(`<var>L</var> = µ<sub>0</sub>µ<sub>r</sub>${frac('<var>N</var>² <var>S</var>', '<var>l</var>')} = 4π·10<sup>−7</sup> · ${r.mur} · ${frac(p.N + '² · ' + B.sciOf(p.S * 1e-4), N(p.l / 100))} = ${res(U(r.L0, 'H'))}`, 'Raddoppiando le spire l\'induttanza quadruplica.'),
  });
  m4.push({
    id: 'ind-v', title: 'Tensione ai capi di un induttore', level: 1,
    gen: () => ({ L0: pick([1, 10, 50, 100, 500]) / 1000, di: pick([0.1, 0.5, 1, 2]), dt: pick([0.1, 1, 5, 10]) }),
    solve: (p) => ({ v: (p.L0 * p.di) / (p.dt / 1000) }),
    text: (p) => `In un induttore da ${U(p.L0, 'H')} la corrente cresce di ${U(p.di, 'A')} in ${N(p.dt)} ms. Quanto vale la tensione ai suoi capi durante la variazione?`,
    asks: (p, r) => [{ label: '<var>v</var><sub>L</sub>', unit: 'V', value: r.v }],
    steps: (p, r) => step(`<var>v</var><sub>L</sub> = <var>L</var>·${frac('Δ<var>i</var>', 'Δ<var>t</var>')} = ${U(p.L0, 'H')} · ${frac(U(p.di, 'A'), U(p.dt / 1000, 's'))} = ${res(U(r.v, 'V'))}`, 'L\'induttore si oppone alle variazioni di corrente: più rapide sono, più alta la tensione.'),
  });
  const rlGen = () => ({ E: pick([5, 9, 12, 24]), R: pick([10, 22, 47, 100, 220]), L: pick([10, 22, 47, 100, 220, 470]) / 1000 });
  m4.push({
    id: 'rl-tau', title: 'Costante di tempo RL', level: 1,
    gen: rlGen,
    solve: (p) => ({ tau: p.L / p.R, If: p.E / p.R }),
    text: (p) => `Un induttore da ${U(p.L, 'H')} in serie a ${U(p.R, 'Ω')} viene collegato a ${p.E} V. Trova la costante di tempo e la corrente finale.`,
    fig: (p) => S.rc(p, { kind: 'L', pos: 1 }),
    asks: (p, r) => [{ label: 'τ', unit: 'ms', value: r.tau * 1000 }, { label: '<var>I</var> finale', unit: 'mA', value: r.If * 1000 }],
    steps: (p, r) => step(`τ = ${frac('<var>L</var>', '<var>R</var>')} = ${frac(U(p.L, 'H'), U(p.R, 'Ω'))} = ${res(U(r.tau, 's'))}`, 'Attenzione: qui R sta al denominatore, al contrario di RC.') + step(`<var>I</var> = <var>E</var>/<var>R</var> = ${res(U(r.If, 'A'))}`, 'A regime l\'induttore ideale è un cortocircuito: resta solo R.'),
  });
  m4.push({
    id: 'rl-it', title: 'Corrente dopo un tempo', level: 2,
    gen: () => { const p = rlGen(); p.k = pick([0.5, 1, 2, 3]); return p; },
    solve: (p) => { const tau = p.L / p.R; const If = p.E / p.R; const i = P.charge(If, tau, p.k * tau); return { tau, t: p.k * tau, i, vL: p.E * Math.exp(-p.k) }; },
    text: (p, r) => `<var>E</var> = ${p.E} V, <var>R</var> = ${U(p.R, 'Ω')}, <var>L</var> = ${U(p.L, 'H')}. Chiudi l'interruttore: quanto valgono corrente e tensione sull'induttore dopo ${U(r.t, 's')}?`,
    fig: (p, r, sol) => S.rc(p, { kind: 'L', pos: 1, i: sol ? r.i : null }),
    asks: (p, r) => [{ label: '<var>i</var>', unit: 'mA', value: r.i * 1000 }, { label: '<var>v</var><sub>L</sub>', unit: 'V', value: r.vL }],
    steps: (p, r) => step(`τ = <var>L</var>/<var>R</var> = ${U(r.tau, 's')}; <var>t</var> = ${N(p.k)}τ`) +
      step(`<var>i</var> = ${frac('<var>E</var>', '<var>R</var>')}(1 − e<sup>−<var>t</var>/τ</sup>) = ${res(U(r.i, 'A'))}`, 'È la stessa curva della tensione del condensatore in carica.') +
      step(`<var>v</var><sub>L</sub> = <var>E</var>·e<sup>−<var>t</var>/τ</sup> = ${res(U(r.vL, 'V'))}`, 'All\'inizio l\'induttore "blocca" la corrente e ha tutta la tensione; a regime è un filo.'),
  });
  m4.push({
    id: 'ind-en', title: 'Energia nell\'induttore', level: 1,
    gen: () => ({ L0: pick([10, 50, 100, 500, 1000]) / 1000, I: pick([0.5, 1, 2, 5]) }),
    solve: (p) => ({ W: 0.5 * p.L0 * p.I * p.I }),
    text: (p) => `Un induttore da ${U(p.L0, 'H')} è percorso da ${p.I} A. Quanta energia è immagazzinata nel suo campo magnetico?`,
    asks: (p, r) => [{ label: '<var>W</var>', unit: 'mJ', value: r.W * 1000 }],
    steps: (p, r) => step(`<var>W</var> = ½<var>L</var><var>I</var>² = 0,5 · ${U(p.L0, 'H')} · ${p.I}² = ${res(U(r.W, 'J'))}`, 'È il "doppio" di ½CV² del condensatore. Aprendo il circuito questa energia deve andare da qualche parte: per questo si mette un diodo in parallelo ai relè.'),
  });
  m4.push({
    id: 'rl-mc', title: 'Concetti sugli induttori', level: 1,
    ...mc([
      ['In continua, a regime, un induttore ideale si comporta come…', ['un cortocircuito', 'un circuito aperto', 'un condensatore', 'un generatore'], 'La corrente è costante, quindi Δi/Δt = 0 e la tensione ai capi è zero.'],
      ['Che cosa non può cambiare di colpo in un induttore?', ['la corrente', 'la tensione', 'la resistenza', 'niente'], 'È il duale del condensatore, in cui non può saltare la tensione.'],
      ['Aprendo di colpo un circuito con un relè, ai capi della bobina…', ['nasce un picco di tensione', 'la tensione si annulla subito', 'passa una corrente infinita', 'non succede niente'], 'v = L·Δi/Δt con Δt piccolissimo: la tensione può arrivare a centinaia di volt. Si protegge con un diodo di ricircolo.'],
      ['La costante di tempo di un circuito RL vale…', ['L/R', 'R·L', 'R/L', '1/(R·L)'], 'Più resistenza, transitorio più breve: al contrario del circuito RC.'],
    ]),
  });

  function widgetRL(host) {
    const c = K.widgetCard('Il transitorio RL', 'All\'inizio l\'induttore frena la corrente, a regime diventa un filo');
    const fig = document.createElement('div');
    const chart = document.createElement('div');
    const out = document.createElement('p');
    out.className = 'widget-out';
    const draw = (v) => {
      const R = v.R, Lh = v.L / 1000, tau = Lh / R, If = v.E / R;
      const tk = v.t;
      const i = If * (1 - Math.exp(-tk));
      const vL = v.E * Math.exp(-tk);
      fig.innerHTML = S.rc({ E: v.E, R, L: Lh }, { kind: 'L', pos: 1, i }).svg;
      const ch = K.chart({ W: 460, H: 220, xmax: 5, ymax: 1, xu: '', yu: '', xlabel: 't / τ', ylabel: '', ticks: 5 });
      let dI = '', dV = '';
      for (let k = 0; k <= 150; k++) { const x = (5 * k) / 150; dI += (k ? 'L' : 'M') + ch.X(x).toFixed(1) + ' ' + ch.Y(1 - Math.exp(-x)).toFixed(1); dV += (k ? 'L' : 'M') + ch.X(x).toFixed(1) + ' ' + ch.Y(Math.exp(-x)).toFixed(1); }
      chart.innerHTML = `<svg class="chart" viewBox="0 0 460 220" role="img" style="width:100%;height:auto"><title>Transitorio RL</title>${ch.s}<path class="gen" d="${dI}"/><path class="load" d="${dV}" stroke-dasharray="5 4"/><line class="guide" x1="${ch.X(tk)}" y1="${ch.Y(0)}" x2="${ch.X(tk)}" y2="${ch.Y(1)}"/><circle class="op" cx="${ch.X(tk)}" cy="${ch.Y(1 - Math.exp(-tk))}" r="5"/></svg>
        <div class="legend"><span><i style="background:var(--pen)"></i>i / (E/R)</span><span><i style="background:var(--energy)"></i>v<sub>L</sub> / E</span></div>`;
      out.innerHTML = `τ = <var>L</var>/<var>R</var> = ${U(tau, 's')}. A <var>t</var> = ${N(tk, 2)}τ: <var>i</var> = ${res(U(i, 'A'))} (su ${U(If, 'A')} finali), <var>v</var><sub>L</sub> = ${res(U(vL, 'V'))}. Confronta con il condensatore: qui è la <strong>corrente</strong> a salire lentamente, e la tensione sull'induttore a calare.`;
    };
    const sl = K.sliders(c, [
      { id: 'E', label: '<var>E</var> (V)', min: 1, max: 24, step: 0.5, value: 12 },
      { id: 'R', label: '<var>R</var> (Ω)', min: 1, max: 1000, log: true, value: 100 },
      { id: 'L', label: '<var>L</var> (mH)', min: 1, max: 1000, log: true, value: 100 },
      { id: 't', label: 'Tempo (multipli di τ)', min: 0, max: 5, step: 0.05, value: 1, sig: 3 },
    ], draw);
    c.append(fig, chart, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'induttori', num: 4, short: 'Induttori e RL', title: 'Induttori e transitori RL',
    intro: 'Una bobina si oppone alle variazioni della corrente che la attraversa: è l\'autoinduzione. In un circuito RL la corrente non può salire di colpo, ma cresce con costante di tempo τ = L/R.',
    goals: ['Induttanza', 'v = L·Δi/Δt', 'τ = L/R', 'Energia ½LI²'],
    widgets: [widgetRL],
    example: m4[2], exampleTitle: 'Esempio: costante di tempo RL',
    families: m4,
    theory: `
      <article class="note"><h4>Induttanza</h4>
        <div class="eq"><span><var>L</var> = µ<sub>0</sub>µ<sub>r</sub> ${frac('<var>N</var>² <var>S</var>', '<var>l</var>')}</span><span class="u">henry [H] = V·s/A</span></div>
        <div class="eq"><span><var>v</var><sub>L</sub> = <var>L</var> · ${frac('Δ<var>i</var>', 'Δ<var>t</var>')}</span><span><var>W</var> = ½ <var>L</var> <var>I</var>²</span></div></article>
      <article class="note"><h4>Transitorio RL</h4>
        <div class="eq"><span><var>i</var>(<var>t</var>) = ${frac('<var>E</var>', '<var>R</var>')}(1 − e<sup>−<var>t</var>/τ</sup>)</span><span><var>v</var><sub>L</sub>(<var>t</var>) = <var>E</var> e<sup>−<var>t</var>/τ</sup></span><span>τ = ${frac('<var>L</var>', '<var>R</var>')}</span></div></article>
      <article class="note"><h4>Condensatore e induttore a confronto</h4>
        <div class="table-wrap"><table class="tbl"><thead><tr><th></th><th>Condensatore</th><th>Induttore</th></tr></thead><tbody>
          <tr><td>Non può saltare</td><td>la tensione</td><td>la corrente</td></tr>
          <tr><td>All'istante iniziale</td><td>cortocircuito</td><td>circuito aperto</td></tr>
          <tr><td>A regime in continua</td><td>circuito aperto</td><td>cortocircuito</td></tr>
          <tr><td>Costante di tempo</td><td>τ = <var>R</var><var>C</var></td><td>τ = <var>L</var>/<var>R</var></td></tr>
          <tr><td>Energia</td><td>½<var>C</var><var>V</var>²</td><td>½<var>L</var><var>I</var>²</td></tr></tbody></table></div></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'mag', year: '3', yearLabel: '3ª', title: 'Magnetismo e induttori', route: 'mag-campo', lessonWord: 'Lezione',
    desc: 'Campo magnetico di fili e solenoidi, forze magnetiche, induzione e alternatore, induttori e transitori RL.',
    lessons,
  });
})();
