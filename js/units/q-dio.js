/* 4ª — Diodi e raddrizzatori */
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
  const LEDS = [['rosso', 1.8], ['giallo', 2.0], ['verde', 2.2], ['blu', 3.0], ['bianco', 3.2]];
  const e12up = (x) => { for (let d = 1; d <= 1e7; d *= 10) for (const v of App.E12) { const y = Number((v * d).toPrecision(2)); if (y >= x * (1 - 1e-9)) return y; } return x; };

  // =====================================================================
  // 1 — Il diodo
  // =====================================================================
  const d1 = [];
  d1.push({
    id: 'dio-on', title: 'Conduce o no?', level: 1,
    defaults: { E: 5, R: 1000, rev: false, Vg: 0.7, t: 'al silicio' },
    gen: () => { const [t, Vg] = pick([['al silicio', 0.7], ['al silicio', 0.7], ['al germanio', 0.3]]); return { E: pick([3, 5, 9, 12]), R: pick([220, 470, 1000, 2200]), rev: Math.random() < 0.35, Vg, t }; },
    solve: (p) => (p.rev ? { on: false, I: 0, VR: 0, VD: -p.E } : { on: true, I: (p.E - p.Vg) / p.R, VR: p.E - p.Vg, VD: p.Vg }),
    text: (p) => `Un diodo ${p.t} (soglia ${N(p.Vg)} V) è in serie a un resistore da ${U(p.R, 'Ω')} e a un generatore da ${p.E} V, ${p.rev ? 'con il catodo verso il polo positivo' : 'con l\'anodo verso il polo positivo'}. Il diodo conduce? Quanta corrente passa?`,
    fig: (p, r, sol) => S.dioSeries({ E: p.E, R: p.R, rev: p.rev }, { on: sol && r.on, I: sol ? r.I : null }),
    asks: (p, r) => [h.choice('Il diodo', ['conduce (polarizzazione diretta)', 'è interdetto (polarizzazione inversa)'], r.on ? 0 : 1), h.qI('<var>I</var>', r.I)],
    steps: (p, r) => (r.on
      ? step(`Anodo verso il + → ${res('polarizzazione diretta')}: il diodo conduce e ha ai capi circa ${N(p.Vg)} V`, 'Modello a soglia: sotto la soglia non passa niente, sopra la tensione resta circa costante.') +
        step(`<var>I</var> = ${frac('<var>E</var> − <var>V</var><sub>γ</sub>', '<var>R</var>')} = ${frac(p.E + ' − ' + N(p.Vg) + ' V', U(p.R, 'Ω'))} = ${res(U(r.I, 'A'))}`, 'Kirchhoff alla maglia: la tensione del generatore si divide tra diodo e resistore.')
      : step(`Catodo verso il + → ${res('polarizzazione inversa')}: il diodo è interdetto`, 'Passa solo una corrente di saturazione inversa di nanoampere: in pratica zero.') +
        step(`<var>I</var> ≈ ${res('0 A')}; tutta la tensione (${p.E} V) è ai capi del diodo`, 'Il resistore non ha caduta di tensione perché non ci passa corrente.')),
  });
  d1.push({
    id: 'dio-led', title: 'Il resistore del LED', level: 1,
    gen: () => { const [c, VF] = pick(LEDS); return { c, VF, E: pick([5, 5, 9, 12, 3.3]), I: pick([5, 10, 15, 20]) }; },
    solve: (p) => { const R = SM.ledR(p.E, p.VF, p.I / 1000); return { R, P: (p.E - p.VF) * p.I / 1000, Rc: e12up(R) }; },
    text: (p) => `Vuoi accendere un LED ${p.c} (tensione di soglia ${N(p.VF)} V) con ${p.I} mA, alimentandolo a ${N(p.E)} V. Quanto deve valere il resistore in serie? Quanta potenza dissipa?`,
    fig: (p) => S.dioSeries({ E: p.E, R: '?', kind: 'led', D: p.c }, { on: true }),
    asks: (p, r) => [h.qR('<var>R</var>', r.R), h.qP('<var>P</var><sub>R</sub>', r.P)],
    steps: (p, r) => step(`<var>V</var><sub>R</sub> = <var>E</var> − <var>V</var><sub>F</sub> = ${N(p.E)} − ${N(p.VF)} = ${N(p.E - p.VF)} V`) +
      step(`<var>R</var> = ${frac('<var>V</var><sub>R</sub>', '<var>I</var>')} = ${frac(N(p.E - p.VF) + ' V', p.I + ' mA')} = ${res(U(r.R, 'Ω'))}`, `Si sceglie il valore commerciale E12 subito sopra: ${U(r.Rc, 'Ω')}, così la corrente non supera quella voluta.`) +
      step(`<var>P</var><sub>R</sub> = <var>V</var><sub>R</sub> · <var>I</var> = ${res(U(r.P, 'W'))}`, 'Un resistore da ¼ W va bene finché P resta sotto i 250 mW.'),
  });
  d1.push({
    id: 'dio-two', title: 'Più diodi in serie', level: 2,
    gen: () => ({ E: pick([5, 9, 12, 15]), R: pick([220, 330, 470, 1000]), n: pick([2, 3]), led: Math.random() < 0.5 }),
    solve: (p) => { const Vd = p.led ? 0.7 * (p.n - 1) + 2 : 0.7 * p.n; return { Vd, I: Math.max(0, (p.E - Vd) / p.R) }; },
    text: (p) => `${p.led ? `Un LED rosso (2 V) e ${p.n - 1} diod${p.n > 2 ? 'i' : 'o'} al silicio` : `${p.n} diodi al silicio`} sono in serie, in diretta, con un resistore da ${U(p.R, 'Ω')} su ${p.E} V. Quanta corrente passa e quanta tensione resta sul resistore?`,
    asks: (p, r) => [h.qI('<var>I</var>', r.I), h.qV('<var>V</var><sub>R</sub>', p.E - r.Vd)],
    steps: (p, r) => step(`Cadute sui diodi: ${p.led ? '2 V + ' + (p.n - 1) + ' · 0,7 V' : p.n + ' · 0,7 V'} = ${N(r.Vd)} V`, 'In serie le soglie si sommano.') +
      step(`<var>V</var><sub>R</sub> = ${p.E} − ${N(r.Vd)} = ${res(N(p.E - r.Vd) + ' V')}; <var>I</var> = <var>V</var><sub>R</sub>/<var>R</var> = ${res(U(r.I, 'A'))}`),
  });
  d1.push({
    id: 'dio-load', title: 'La retta di carico', level: 2,
    gen: () => { const E = pick([2, 3, 5, 6]); const R = pick([100, 220, 470, 1000]); const op = SM.diodeOP(E, R); return { E, R, VD: Number(op.V.toFixed(2)) }; },
    solve: (p) => ({ Isc: p.E / p.R, I: (p.E - p.VD) / p.R }),
    text: (p) => `Un diodo è in serie a ${U(p.R, 'Ω')} su ${p.E} V. Sul grafico della caratteristica disegni la retta di carico: dove incontra l'asse delle correnti? Il punto di lavoro cade a <var>V</var><sub>D</sub> = ${N(p.VD)} V: quanto vale la corrente?`,
    fig: (p, r, sol) => ({ svg: ivChart(p.E, p.R, 'exp', sol, 260) }),
    asks: (p, r) => [h.qI('<var>I</var><sub>cc</sub> (asse I)', r.Isc), h.qI('<var>I</var>', r.I)],
    steps: (p, r) => step(`Retta di carico: <var>I</var> = ${frac('<var>E</var> − <var>V</var><sub>D</sub>', '<var>R</var>')}`, 'Sono tutti i punti che rispettano Kirchhoff alla maglia, qualunque sia il diodo.') +
      step(`Con <var>V</var><sub>D</sub> = 0: <var>I</var> = <var>E</var>/<var>R</var> = ${res(U(r.Isc, 'A'))}; con <var>I</var> = 0: <var>V</var><sub>D</sub> = <var>E</var> = ${p.E} V`, 'Bastano i due punti sugli assi per tracciarla.') +
      step(`<var>I</var> = (${p.E} − ${N(p.VD)}) V / ${U(p.R, 'Ω')} = ${res(U(r.I, 'A'))}`, 'Il punto di lavoro è l\'incrocio tra la retta (il circuito) e la curva (il diodo).'),
  });
  d1.push({
    id: 'dio-mc', title: 'Concetti sul diodo', level: 1,
    ...mc([
      ['Un diodo al silicio in conduzione ha ai capi circa…', ['0,6–0,7 V', '0 V', '5 V', '0,1 V'], 'È la tensione di soglia del silicio; nel germanio è circa 0,3 V, nei LED da 1,8 a 3,3 V secondo il colore.'],
      ['In polarizzazione inversa un diodo…', ['lascia passare solo una corrente piccolissima', 'conduce come in diretta', 'si comporta come un resistore da 1 kΩ', 'genera tensione'], 'Finché non si supera la tensione di rottura.'],
      ['L\'anodo è…', ['il terminale da cui entra la corrente in conduzione (lato del triangolo)', 'il terminale con la fascetta', 'sempre collegato a massa', 'il terminale negativo'], 'La fascetta sul corpo del diodo segna il catodo.'],
      ['Perché un LED ha sempre un resistore in serie?', ['per limitare la corrente, che altrimenti crescerebbe moltissimo', 'per aumentare la luce', 'per proteggerlo dalla tensione inversa', 'per farlo lampeggiare'], 'Sopra la soglia la corrente sale in modo esponenziale: senza resistore il LED si brucia.'],
    ]),
  });

  /** Caratteristica I–V del diodo con la retta di carico. model: 'exp' | 'soglia' | 'ideale'. */
  function ivChart(E, R, model, showQ = true, H = 240) {
    const xmax = Math.max(1.5, E);
    const ymax = K.niceMax((E / R) * 1.15);
    const ch = K.chart({ W: 460, H, xmax, ymax, xu: 'V', yu: 'A', xlabel: 'V<tspan class="sb" dy="3">D</tspan>', ylabel: 'I', ticks: 4 });
    let s = ch.s;
    const curve = (fn) => {
      let d = '';
      for (let k = 0; k <= 200; k++) {
        const v = (xmax * k) / 200;
        const i = fn(v);
        if (i > ymax * 1.05) { d += `L${ch.X(v)} ${ch.Y(ymax * 1.05)}`; break; }
        d += (k ? 'L' : 'M') + ch.X(v).toFixed(1) + ' ' + ch.Y(i).toFixed(1);
      }
      return d;
    };
    const fn = model === 'exp' ? (v) => SM.shockley(v) : model === 'soglia' ? (v) => (v < 0.7 ? 0 : (v - 0.7) * 1e6) : (v) => (v <= 0 ? 0 : v * 1e9);
    s += `<path class="gen" d="${curve(fn)}"/>`;
    s += `<line class="load" x1="${ch.X(0)}" y1="${ch.Y(E / R)}" x2="${ch.X(E)}" y2="${ch.Y(0)}"/>`;
    if (showQ) {
      const op = model === 'exp' ? SM.diodeOP(E, R) : model === 'soglia' ? (E > 0.7 ? { V: 0.7, I: (E - 0.7) / R } : { V: E, I: 0 }) : { V: 0, I: E / R };
      s += `<line class="guide" x1="${ch.X(op.V)}" y1="${ch.Y(0)}" x2="${ch.X(op.V)}" y2="${ch.Y(op.I)}"/><circle class="op" cx="${ch.X(op.V)}" cy="${ch.Y(op.I)}" r="5.5"/>`;
    }
    return `<svg class="chart" viewBox="0 0 460 ${H}" role="img" style="width:100%;height:auto"><title>Caratteristica del diodo e retta di carico</title>${s}</svg>`;
  }

  function widgetDiode(host) {
    const c = K.widgetCard('Caratteristica e retta di carico', 'Il punto di lavoro è dove la curva del diodo incontra la retta del circuito');
    let model = 'exp';
    let rev = false;
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-m="exp">Diodo vero (esponenziale)</button><button type="button" data-m="soglia">Modello a soglia (0,7 V)</button><button type="button" data-m="ideale">Ideale</button>';
    const tog = el('label', 'switch');
    tog.innerHTML = '<input type="checkbox"><span class="track"></span><span>Gira il diodo (polarizzazione inversa)</span>';
    const grid = el('div', 'q-two');
    const sch = el('div');
    const fig = el('div');
    grid.append(sch, fig);
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const R = v.R;
      const op = rev ? { V: -v.E, I: 0 } : model === 'exp' ? SM.diodeOP(v.E, R) : model === 'soglia' ? (v.E > 0.7 ? { V: 0.7, I: (v.E - 0.7) / R } : { V: v.E, I: 0 }) : { V: 0, I: v.E / R };
      sch.innerHTML = S.dioSeries({ E: v.E, R, rev }, { on: op.I > 0, I: op.I }).svg;
      fig.innerHTML = rev ? '<p class="hint">In inversa la retta di carico incontra la curva sull\'asse delle tensioni: corrente zero, tutta la tensione sul diodo.</p>' : ivChart(v.E, R, model);
      out.innerHTML = `<div class="form-row"><span class="label">Punto di lavoro</span><div class="f"><var>V</var><sub>D</sub> = ${U(op.V, 'V')}; <var>I</var> = ${res(U(op.I, 'A'))}</div><span class="meta">${rev ? 'Polarizzazione inversa: il diodo non conduce.' : model === 'exp' ? 'Con la curva vera la tensione cambia poco anche se la corrente cambia molto.' : model === 'soglia' ? 'Il modello a soglia è quello che si usa nei calcoli a mano.' : 'Ideale: in conduzione è un corto.'}</span></div>
        <div class="form-row"><span class="label">Resistore</span><div class="f"><var>V</var><sub>R</sub> = ${U(rev ? 0 : v.E - op.V, 'V')}; potenza sul diodo ${U(op.V * op.I, 'W')}</div></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === model)));
    };
    const sl = K.sliders(c, [
      { id: 'E', label: '<var>E</var> (V)', min: 0.2, max: 12, step: 0.1, value: 5 },
      { id: 'R', label: '<var>R</var> (Ω)', min: 100, max: 10000, log: true, value: 1000 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { model = b.dataset.m; draw(last); } });
    tog.querySelector('input').addEventListener('change', (e) => { rev = e.target.checked; draw(last); });
    c.querySelector('.card-head').after(seg);
    c.append(tog, grid, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'diodo', num: 1, short: 'Diodo', title: 'Il diodo e la retta di carico',
    intro: 'Il diodo è una valvola a senso unico per la corrente: conduce quando l\'anodo è più positivo del catodo di almeno una soglia, e blocca quasi tutto nel verso opposto.',
    goals: ['Polarizzazione diretta e inversa', 'Modello a soglia', 'Resistore per i LED', 'Retta di carico e punto di lavoro'],
    widgets: [widgetDiode],
    example: d1[0], exampleTitle: 'Esempio: diodo in diretta',
    families: d1,
    theory: `
      <article class="note"><h4>La giunzione PN</h4>
        <p>Un cristallo di silicio drogato P (anodo) unito a uno drogato N (catodo). In diretta la barriera si abbassa e la corrente cresce in modo esponenziale: <var>I</var> = <var>I</var><sub>s</sub>(e<sup><var>V</var>/(<var>n</var><var>V</var><sub>T</sub>)</sup> − 1). In inversa passa solo la corrente di saturazione, di nanoampere, fino alla tensione di rottura.</p></article>
      <article class="note"><h4>Modelli per i calcoli</h4>
        <ul><li><strong>Ideale</strong>: corto in diretta, aperto in inversa.</li><li><strong>A soglia</strong>: in diretta una tensione costante <var>V</var><sub>γ</sub> (0,7 V silicio, 0,3 V germanio, 1,8–3,3 V LED).</li><li><strong>Esponenziale</strong>: la curva vera, per il computer.</li></ul></article>
      <article class="note"><h4>Retta di carico</h4>
        <p>Il circuito impone <var>I</var> = (<var>E</var> − <var>V</var><sub>D</sub>)/<var>R</var>: una retta che passa per (<var>E</var>, 0) e (0, <var>E</var>/<var>R</var>). Il punto di lavoro è il suo incrocio con la caratteristica del diodo.</p></article>`,
  });

  // =====================================================================
  // 2 — Raddrizzatori
  // =====================================================================
  const r2 = [];
  r2.push({
    id: 'rad-half', title: 'Raddrizzatore a una semionda', level: 1,
    defaults: { V: 12, f: 50 },
    gen: () => ({ V: pick([6, 9, 12, 15, 18, 24]), f: pick([50, 50, 60]) }),
    solve: (p) => SM.rectifier('half', p.V, p.f),
    text: (p) => `Il secondario di un trasformatore dà ${p.V} V efficaci a ${p.f} Hz e alimenta un raddrizzatore a una semionda (diodo al silicio) su un resistore. Quanto vale il picco della tensione d'uscita? E il suo valore medio?`,
    fig: () => S.halfWave({ V: '', RL: '' }),
    asks: (p, r) => [h.qV('<var>V</var><sub>p</sub>', r.Vp), h.qV('<var>V</var><sub>med</sub>', r.Vdc)],
    steps: (p, r) => step(`<var>V</var><sub>m</sub> = √2 · ${p.V} V = ${U(r.Vm, 'V')}`, 'Il trasformatore è indicato con il valore efficace.') +
      step(`<var>V</var><sub>p</sub> = <var>V</var><sub>m</sub> − 0,7 V = ${res(U(r.Vp, 'V'))}`, 'Una sola caduta: in ogni istante conduce un diodo.') +
      step(`<var>V</var><sub>med</sub> = ${frac('<var>V</var><sub>p</sub>', 'π')} = ${res(U(r.Vdc, 'V'))}`, 'Per metà periodo l\'uscita è zero: la media è bassa. Il ripple ha la frequenza della rete, ' + p.f + ' Hz.'),
  });
  r2.push({
    id: 'rad-bridge', title: 'Raddrizzatore a ponte', level: 2,
    gen: () => ({ V: pick([6, 9, 12, 15, 18, 24]), f: pick([50, 50, 60]) }),
    solve: (p) => SM.rectifier('bridge', p.V, p.f),
    text: (p) => `Un ponte di Graetz è alimentato da ${p.V} V efficaci a ${p.f} Hz. Trova il picco in uscita, il valore medio (senza condensatore), la frequenza del ripple e la tensione inversa massima su ogni diodo.`,
    fig: () => S.bridge({ V: '', RL: '' }, { half: 'pos' }),
    asks: (p, r) => [h.qV('<var>V</var><sub>p</sub>', r.Vp), h.qV('<var>V</var><sub>med</sub>', r.Vdc), Q.qHz('<var>f</var><sub>r</sub>', r.fr), h.qV('PIV', r.PIV)],
    steps: (p, r) => step(`<var>V</var><sub>m</sub> = √2 · ${p.V} = ${U(r.Vm, 'V')}; <var>V</var><sub>p</sub> = <var>V</var><sub>m</sub> − 2 · 0,7 = ${res(U(r.Vp, 'V'))}`, 'Nel ponte conducono sempre due diodi in serie: due cadute.') +
      step(`<var>V</var><sub>med</sub> = ${frac('2<var>V</var><sub>p</sub>', 'π')} = ${res(U(r.Vdc, 'V'))}`, 'Doppia semionda: tutte e due le metà del periodo arrivano al carico.') +
      step(`<var>f</var><sub>r</sub> = 2<var>f</var> = ${res(r.fr + ' Hz')}`, 'L\'uscita ha due "gobbe" per ogni periodo della rete.') +
      step(`PIV ≈ <var>V</var><sub>m</sub> − 0,7 = ${res(U(r.PIV, 'V'))}`, 'Il diodo interdetto vede la tensione del secondario meno quella del diodo che conduce in parallelo a lui.'),
  });
  r2.push({
    id: 'rad-which', title: 'Chi conduce nel ponte', level: 1,
    gen: () => ({ half: pick(['pos', 'neg']), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => ({ ans: p.half === 'pos' ? 0 : 1 }),
    text: (p) => `Nel ponte in figura, durante la semionda ${p.half === 'pos' ? 'positiva (morsetto in alto del secondario positivo)' : 'negativa (morsetto in basso positivo)'}, quali diodi conducono?`,
    fig: (p, r, sol) => S.bridge({ V: '', RL: '' }, { half: sol ? p.half : null }),
    asks: (p) => { const opts = ['D1 e D3', 'D2 e D4', 'tutti e quattro', 'D1 e D2']; return [h.choice('Conducono', p.o.map((i) => opts[i]), p.o.indexOf(p.half === 'pos' ? 0 : 1))]; },
    steps: (p) => step(p.half === 'pos' ? 'La corrente esce dall\'alto, attraversa D1, il carico (dal + al −) e torna attraverso D3' : 'La corrente esce dal basso, attraversa D2, il carico (sempre dal + al −) e torna attraverso D4', 'In ogni semionda conducono due diodi opposti; nel carico la corrente ha sempre lo stesso verso.') + step(`Conducono ${res(p.half === 'pos' ? 'D1 e D3' : 'D2 e D4')}`),
  });
  r2.push({
    id: 'rad-mc', title: 'Concetti sui raddrizzatori', level: 1,
    ...mc([
      ['Rispetto a una semionda, il raddrizzatore a doppia semionda…', ['dà un valore medio doppio e un ripple a frequenza doppia', 'dà metà valore medio', 'non ha bisogno di diodi', 'funziona solo in continua'], 'Sfrutta anche la semionda negativa.'],
      ['Quanti diodi conducono contemporaneamente in un ponte di Graetz?', ['due', 'uno', 'quattro', 'nessuno'], 'Sempre una coppia opposta.'],
      ['Con presa centrale sul trasformatore servono…', ['due diodi, ma un secondario doppio', 'quattro diodi', 'un solo diodo', 'un condensatore al posto dei diodi'], 'Ogni metà del secondario lavora per una semionda; la PIV è circa 2Vm.'],
      ['Il valore medio di una sinusoide raddrizzata a doppia semionda è…', ['2Vp/π ≈ 0,637 Vp', 'Vp/π', 'Vp/√2', 'Vp'], 'È la media delle "gobbe".'],
    ]),
  });

  function widgetRect(host) {
    const c = K.widgetCard('Raddrizzatori', 'Tensione del secondario (tratteggiata) e uscita, a 50 Hz');
    let kind = 'bridge';
    let half = 'pos';
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-k="half">Una semionda</button><button type="button" data-k="bridge">Ponte di Graetz</button>';
    const seg2 = el('div', 'seg');
    seg2.innerHTML = '<button type="button" data-h="pos">Semionda positiva</button><button type="button" data-h="neg">Semionda negativa</button>';
    const sch = el('div', 'ex-fig');
    const wave = el('div');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const r = SM.rectifier(kind, v.V, 50);
      const drops = kind === 'bridge' ? 1.4 : 0.7;
      const fn = (t) => { const x = r.Vm * Math.sin(2 * Math.PI * 50 * t); const y = kind === 'half' ? x : Math.abs(x); return Math.max(0, y - drops); };
      const ymax = K.niceMax(r.Vm * 1.1);
      sch.innerHTML = (kind === 'bridge' ? S.bridge({ V: v.V + ' V', RL: '' }, { half }) : S.halfWave({ V: v.V + ' V', RL: '' }, { on: half === 'pos' })).svg;
      wave.innerHTML = Q.waveSVG({ W: 520, H: 210, tmax: 0.04, ymax, traces: [{ amp: r.Vm, f: 50, deg: 0, cls: 'ref', dash: true }, { fn, cls: 'gen' }], hl: [{ y: r.Vdc, cls: 'p2', label: 'media' }], title: 'Tensione raddrizzata' });
      out.innerHTML = `<div class="form-row"><span class="label">Uscita</span><div class="f"><var>V</var><sub>p</sub> = ${U(r.Vp, 'V')}; <var>V</var><sub>med</sub> = ${res(U(r.Vdc, 'V'))}</div><span class="meta">Ripple a ${r.fr} Hz; PIV su ogni diodo ${U(r.PIV, 'V')}.</span></div>
        <div class="form-row"><span class="label">${half === 'pos' ? 'Semionda positiva' : 'Semionda negativa'}</span><div class="f">${kind === 'half' ? (half === 'pos' ? 'Il diodo conduce: l\'uscita segue la tensione del secondario.' : 'Il diodo è interdetto: l\'uscita è zero.') : half === 'pos' ? 'Conducono D1 e D3.' : 'Conducono D2 e D4: la corrente nel carico ha lo stesso verso.'}</div></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === kind)));
      seg2.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.h === half)));
    };
    const sl = K.sliders(c, [{ id: 'V', label: 'Secondario (V efficaci)', min: 3, max: 24, step: 0.5, value: 12 }], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { kind = b.dataset.k; draw(last); } });
    seg2.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { half = b.dataset.h; draw(last); } });
    const row = el('div', 'row');
    row.append(seg, seg2);
    c.querySelector('.card-head').after(row);
    c.append(sch, wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'raddrizzatori', num: 2, short: 'Raddrizzatori', title: 'Raddrizzatori a una e a due semionde',
    intro: 'Per ricavare una tensione continua dalla rete servono diodi che lascino passare la corrente in un solo verso. Con uno si usa metà dell\'onda, con quattro (il ponte di Graetz) tutte e due le metà.',
    goals: ['Una semionda', 'Ponte di Graetz', 'Valore medio e frequenza del ripple', 'Tensione inversa sui diodi'],
    widgets: [widgetRect],
    example: r2[0], exampleTitle: 'Esempio: una semionda da 12 V',
    families: r2,
    theory: `
      <article class="note"><h4>Formule</h4>
        <table class="tbl"><thead><tr><th></th><th>Una semionda</th><th>Ponte</th></tr></thead><tbody>
          <tr><td>Picco</td><td><var>V</var><sub>m</sub> − 0,7</td><td><var>V</var><sub>m</sub> − 1,4</td></tr>
          <tr><td>Valore medio</td><td><var>V</var><sub>p</sub>/π</td><td>2<var>V</var><sub>p</sub>/π</td></tr>
          <tr><td>Ripple</td><td><var>f</var></td><td>2<var>f</var></td></tr>
          <tr><td>PIV</td><td><var>V</var><sub>m</sub></td><td>≈ <var>V</var><sub>m</sub></td></tr></tbody></table>
        <p><var>V</var><sub>m</sub> = √2 · <var>V</var><sub>eff</sub> del secondario.</p></article>
      <article class="note"><h4>Il ponte</h4>
        <p>In ogni semionda conducono due diodi opposti (D1–D3 o D2–D4) e la corrente attraversa il carico sempre nello stesso verso. Esistono ponti già pronti in un unico contenitore con i terminali ~ ~ + −.</p></article>`,
  });

  // =====================================================================
  // 3 — Livellamento e ripple
  // =====================================================================
  const l3 = [];
  l3.push({
    id: 'rip-v', title: 'Quanto ripple?', level: 2,
    defaults: { Vp: 15.6, IL: 0.5, C: 2200e-6, kind: 'bridge' },
    gen: () => ({ Vp: pick([7.1, 11.3, 15.6, 19.8, 32.5]), IL: pick([0.05, 0.1, 0.2, 0.5, 1]), C: pick([470, 1000, 2200, 4700]) * 1e-6, kind: pick(['half', 'bridge']) }),
    solve: (p) => { const fr = p.kind === 'half' ? 50 : 100; return { fr, ...SM.ripple(p.Vp, p.IL, p.C, fr) }; },
    text: (p) => `Dopo un raddrizzatore ${p.kind === 'half' ? 'a una semionda' : 'a ponte'} (rete a 50 Hz) la tensione ha un picco di ${N(p.Vp)} V. Un condensatore da ${App.si(p.C, 'F')} livella la tensione e il carico assorbe ${U(p.IL, 'A')}. Quanto vale l'ondulazione (ripple) picco-picco? E la tensione minima?`,
    asks: (p, r) => [h.qV('<var>V</var><sub>r</sub>', r.Vr), h.qV('<var>V</var><sub>min</sub>', r.Vmin), h.qV('<var>V</var><sub>med</sub>', r.Vdc)],
    hint: () => 'Tra un picco e l\'altro il condensatore si scarica fornendo la corrente al carico: ΔV = I · Δt / C, con Δt circa uguale al periodo del ripple.',
    steps: (p, r) => step(`<var>f</var><sub>r</sub> = ${r.fr} Hz → tra due picchi passano ${U(1 / r.fr, 's')}`) +
      step(`<var>V</var><sub>r</sub> = ${frac('<var>I</var><sub>L</sub>', '<var>f</var><sub>r</sub> <var>C</var>')} = ${frac(U(p.IL, 'A'), r.fr + ' Hz · ' + App.si(p.C, 'F'))} = ${res(U(r.Vr, 'V'))}`, 'Approssimazione: la scarica è lineare e dura tutto il periodo del ripple.') +
      step(`<var>V</var><sub>min</sub> = <var>V</var><sub>p</sub> − <var>V</var><sub>r</sub> = ${res(U(r.Vmin, 'V'))}; <var>V</var><sub>med</sub> ≈ <var>V</var><sub>p</sub> − <var>V</var><sub>r</sub>/2 = ${res(U(r.Vdc, 'V'))}`),
  });
  const STDC = [100, 220, 330, 470, 680, 1000, 1500, 2200, 3300, 4700, 6800, 10000, 15000, 22000, 33000, 47000, 68000];
  l3.push({
    id: 'rip-c', title: 'Scegli il condensatore', level: 2,
    gen: () => L.nice(() => ({ IL: pick([0.1, 0.2, 0.25, 0.5, 1, 2]), Vr: pick([0.5, 1, 1.5, 2]), kind: pick(['half', 'bridge']), o: App.shuffle([0, 1, 2, 3]) }), (p) => { const C = SM.rippleC(p.IL, p.Vr, p.kind === 'half' ? 50 : 100) * 1e6; const i = STDC.findIndex((x) => x >= C * (1 - 1e-9)); return i >= 2 && i < STDC.length - 1; }, { IL: 0.5, Vr: 1, kind: 'bridge', o: [0, 1, 2, 3] }),
    solve: (p) => {
      const fr = p.kind === 'half' ? 50 : 100;
      const C = SM.rippleC(p.IL, p.Vr, fr);
      const i = STDC.findIndex((x) => x * 1e-6 >= C * (1 - 1e-9));
      const opts = [STDC[i], STDC[i - 1], STDC[i - 2], STDC[i + 1]].map((x) => App.si(x * 1e-6, 'F'));
      return { fr, C, std: STDC[i] * 1e-6, opts: p.o.map((k) => opts[k]), ans: p.o.indexOf(0) };
    },
    text: (p) => `Un alimentatore con raddrizzatore ${p.kind === 'half' ? 'a una semionda' : 'a ponte'} (50 Hz) deve fornire ${U(p.IL, 'A')} con un ripple di al massimo ${N(p.Vr)} V. Che capacità serve almeno? Qual è il valore commerciale più piccolo che basta?`,
    asks: (p, r) => [Q.qC('<var>C</var> minima', r.C), h.choice('Valore commerciale', r.opts, r.ans)],
    steps: (p, r) => step(`<var>C</var> = ${frac('<var>I</var><sub>L</sub>', '<var>f</var><sub>r</sub> <var>V</var><sub>r</sub>')} = ${frac(U(p.IL, 'A'), r.fr + ' Hz · ' + N(p.Vr) + ' V')} = ${res(App.si(r.C, 'F', 4))}`) +
      step(`Il primo valore commerciale non più piccolo è ${res(App.si(r.std, 'F'))}`, 'Uno più piccolo darebbe troppo ripple; uno più grande va bene ma costa e ingombra di più. Attenzione anche alla tensione di lavoro dell\'elettrolitico.'),
  });
  l3.push({
    id: 'rip-mc', title: 'Concetti sul livellamento', level: 1,
    ...mc([
      ['Aumentando la corrente assorbita dal carico, il ripple…', ['aumenta', 'diminuisce', 'resta uguale', 'sparisce'], 'Il condensatore si scarica più in fretta tra un picco e l\'altro.'],
      ['A parità di C e di carico, il ripple è minore con…', ['il ponte (doppia semionda)', 'una semionda', 'un diodo al germanio', 'un trasformatore più piccolo'], 'Con il ponte il condensatore viene ricaricato due volte per periodo.'],
      ['Il condensatore di livellamento si collega…', ['in parallelo al carico', 'in serie al carico', 'prima dei diodi', 'al posto del trasformatore'], 'Si carica sui picchi e fornisce corrente nei "buchi".'],
      ['Dopo il livellamento, per una tensione davvero costante si usa…', ['uno stabilizzatore (Zener o regolatore integrato)', 'un secondo trasformatore', 'un fusibile', 'un induttore in parallelo'], 'Lo stabilizzatore elimina il ripple residuo e le variazioni della rete.'],
    ]),
  });

  function widgetRipple(host) {
    const c = K.widgetCard('Il condensatore di livellamento', 'Ponte da 12 V efficaci: cambia il condensatore e la corrente del carico');
    let kind = 'bridge';
    const seg = el('div', 'seg');
    seg.innerHTML = '<button type="button" data-k="half">Una semionda</button><button type="button" data-k="bridge">Ponte</button>';
    const wave = el('div');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const r = SM.rectifier(kind, 12, 50);
      const C = v.C * 1e-6;
      const IL = v.I / 1000;
      const drops = kind === 'bridge' ? 1.4 : 0.7;
      const rect = (t) => { const x = r.Vm * Math.sin(2 * Math.PI * 50 * t); return Math.max(0, (kind === 'half' ? x : Math.abs(x)) - drops); };
      // simulazione: il condensatore segue il raddrizzato quando è più alto, altrimenti si scarica a corrente costante
      const n = 2000;
      const T = 0.06;
      const pts = [];
      let vc = 0;
      for (let k = 0; k <= n; k++) {
        const t = (T * k) / n;
        vc = Math.max(rect(t), vc - (IL / C) * (T / n));
        if (vc < 0) vc = 0;
        pts.push([t, vc]);
      }
      const tail = pts.filter(([t]) => t > 0.02).map(([, y]) => y);
      const vmax = Math.max(...tail);
      const vmin = Math.min(...tail);
      const fn = (t) => pts[Math.min(n, Math.round((t / T) * n))][1];
      wave.innerHTML = Q.waveSVG({ W: 520, H: 220, tmax: T, ymax: K.niceMax(r.Vm), traces: [{ fn: rect, cls: 'ref', dash: true }, { fn, cls: 'gen' }], title: 'Raddrizzato (tratteggiato) e tensione sul condensatore' });
      const f = SM.ripple(r.Vp, IL, C, r.fr);
      out.innerHTML = `<div class="form-row"><span class="label">Ripple</span><div class="f">simulato ${U(vmax - vmin, 'V')}; formula <var>I</var>/(<var>f</var><sub>r</sub><var>C</var>) = ${res(U(f.Vr, 'V'))}</div><span class="meta">La formula è un po' pessimista: il condensatore si ricarica prima della fine del periodo.</span></div>
        <div class="form-row"><span class="label">Uscita</span><div class="f">da ${U(vmin, 'V')} a ${U(vmax, 'V')}</div></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === kind)));
    };
    const sl = K.sliders(c, [
      { id: 'C', label: '<var>C</var> (µF)', min: 47, max: 10000, log: true, value: 1000 },
      { id: 'I', label: 'Corrente del carico (mA)', min: 10, max: 2000, log: true, value: 300 },
    ], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { kind = b.dataset.k; draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(wave, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'livellamento', num: 3, short: 'Livellamento', title: 'Il condensatore di livellamento',
    intro: 'La tensione raddrizzata è fatta di "gobbe". Un condensatore in parallelo al carico si carica sui picchi e fornisce corrente negli intervalli: resta un\'ondulazione, il ripple, tanto più piccola quanto più grande è la capacità.',
    goals: ['Scarica tra due picchi', 'Formula del ripple', 'Scelta del condensatore'],
    widgets: [widgetRipple],
    example: l3[0], exampleTitle: 'Esempio: ripple di un alimentatore',
    families: l3,
    theory: `
      <article class="note"><h4>Ripple</h4>
        <div class="eq"><span><var>V</var><sub>r</sub> ≈ ${frac('<var>I</var><sub>L</sub>', '<var>f</var><sub>r</sub> <var>C</var>')}</span><span><var>V</var><sub>med</sub> ≈ <var>V</var><sub>p</sub> − <var>V</var><sub>r</sub>/2</span></div>
        <p><var>f</var><sub>r</sub> = 50 Hz con una semionda, 100 Hz con il ponte. Viene da Δ<var>Q</var> = <var>C</var>Δ<var>V</var> = <var>I</var>Δ<var>t</var>.</p></article>
      <article class="note"><h4>In pratica</h4>
        <p>Si usano condensatori elettrolitici (attenzione alla polarità e alla tensione massima). Valore tipico: circa 1000–2000 µF per ampere di carico con il ponte.</p></article>`,
  });

  // =====================================================================
  // 4 — Zener
  // =====================================================================
  const z4 = [];
  const ZV = [3.3, 4.7, 5.1, 6.2, 9.1, 12];
  z4.push({
    id: 'zen-i', title: 'Correnti nello stabilizzatore', level: 2,
    defaults: { Vin: 12, Rs: 100, Vz: 5.1, RL: 510 },
    gen: () => L.nice(() => ({ Vin: pick([9, 12, 15, 18, 24]), Rs: pick([47, 68, 100, 150, 220, 330]), Vz: pick(ZV), RL: pick([220, 330, 470, 1000, 2200]) }), (p) => { const z = SM.zener(p.Vin, p.Rs, p.Vz, p.RL); return z.regulating && z.Iz > 0.002 && z.Pz < 2; }, { Vin: 12, Rs: 100, Vz: 5.1, RL: 510 }),
    solve: (p) => SM.zener(p.Vin, p.Rs, p.Vz, p.RL),
    text: (p) => `Uno Zener da ${N(p.Vz)} V stabilizza la tensione su un carico da ${U(p.RL, 'Ω')}. L'ingresso vale ${p.Vin} V e la resistenza serie ${U(p.Rs, 'Ω')}. Trova le correnti e la potenza dissipata dallo Zener.`,
    fig: (p) => S.zener({ Vin: p.Vin, Rs: p.Rs, Vz: N(p.Vz) + ' V', RL: p.RL }, { on: true }),
    asks: (p, r) => [h.qI('<var>I</var><sub>s</sub>', r.Is), h.qI('<var>I</var><sub>L</sub>', r.IL), h.qI('<var>I</var><sub>z</sub>', r.Iz), h.qP('<var>P</var><sub>z</sub>', r.Pz)],
    steps: (p, r) => step(`Lo Zener tiene <var>V</var><sub>out</sub> = ${N(p.Vz)} V; su <var>R</var><sub>s</sub> restano ${p.Vin} − ${N(p.Vz)} = ${N(p.Vin - p.Vz)} V`, 'Verifica: senza Zener il partitore Rs–RL darebbe più di Vz, quindi lo Zener conduce.') +
      step(`<var>I</var><sub>s</sub> = ${frac(N(p.Vin - p.Vz) + ' V', U(p.Rs, 'Ω'))} = ${res(U(r.Is, 'A'))}; <var>I</var><sub>L</sub> = ${frac(N(p.Vz) + ' V', U(p.RL, 'Ω'))} = ${res(U(r.IL, 'A'))}`) +
      step(`<var>I</var><sub>z</sub> = <var>I</var><sub>s</sub> − <var>I</var><sub>L</sub> = ${res(U(r.Iz, 'A'))}`, 'Kirchhoff al nodo: lo Zener prende la corrente che il carico non usa.') +
      step(`<var>P</var><sub>z</sub> = <var>V</var><sub>z</sub> · <var>I</var><sub>z</sub> = ${res(U(r.Pz, 'W'))}`, 'Deve stare sotto la potenza massima dello Zener (spesso 0,5 o 1,3 W).'),
  });
  z4.push({
    id: 'zen-rs', title: 'Progetta la resistenza serie', level: 2,
    gen: () => ({ Vin: pick([9, 12, 15, 24]), Vz: pick(ZV), IL: pick([10, 20, 25, 50]) / 1000, Iz: pick([5, 10]) / 1000 }),
    solve: (p) => { const Rs = SM.zenerRs(p.Vin, p.Vz, p.IL, p.Iz); return { Rs, Pr: (p.Vin - p.Vz) * (p.IL + p.Iz), Pz0: p.Vz * (p.IL + p.Iz) }; },
    text: (p) => `Vuoi ${N(p.Vz)} V stabilizzati per un carico che assorbe fino a ${U(p.IL, 'A')}, partendo da ${p.Vin} V. Lo Zener deve condurre almeno ${U(p.Iz, 'A')}. Quanto vale <var>R</var><sub>s</sub>? Quanto dissipa lo Zener se il carico viene staccato?`,
    asks: (p, r) => [h.qR('<var>R</var><sub>s</sub>', r.Rs), h.qP('<var>P</var><sub>z</sub> a vuoto', r.Pz0)],
    steps: (p, r) => step(`<var>R</var><sub>s</sub> = ${frac('<var>V</var><sub>in</sub> − <var>V</var><sub>z</sub>', '<var>I</var><sub>L,max</sub> + <var>I</var><sub>z,min</sub>')} = ${frac(N(p.Vin - p.Vz) + ' V', U(p.IL + p.Iz, 'A'))} = ${res(U(r.Rs, 'Ω'))}`, 'Con il carico più pesante deve restare abbastanza corrente per lo Zener.') +
      step(`A vuoto tutta la corrente passa nello Zener: <var>P</var><sub>z</sub> = ${N(p.Vz)} V · ${U(p.IL + p.Iz, 'A')} = ${res(U(r.Pz0, 'W'))}`, 'È il caso peggiore per lo Zener: va scelto per questa potenza.'),
  });
  z4.push({
    id: 'zen-ok', title: 'Stabilizza o no?', level: 2,
    gen: () => ({ Vin: pick([6, 7, 8, 9, 12]), Rs: pick([220, 330, 470, 1000]), Vz: pick([5.1, 6.2]), RL: pick([220, 470, 1000, 4700]) }),
    solve: (p) => { const Vopen = (p.Vin * p.RL) / (p.Rs + p.RL); return { Vopen, ok: Vopen > p.Vz, z: SM.zener(p.Vin, p.Rs, p.Vz, p.RL) }; },
    text: (p) => `Uno Zener da ${N(p.Vz)} V, una resistenza serie da ${U(p.Rs, 'Ω')} e un carico da ${U(p.RL, 'Ω')}, con ${p.Vin} V in ingresso. Lo Zener riesce a stabilizzare? Quanto vale la tensione sul carico?`,
    asks: (p, r) => [h.choice('Lo Zener', ['conduce e stabilizza', 'resta interdetto: non stabilizza'], r.ok ? 0 : 1), h.qV('<var>V</var><sub>out</sub>', r.z.Vout)],
    hint: () => 'Togli lo Zener e calcola la tensione che il partitore Rs–RL darebbe sul carico: se supera Vz, lo Zener conduce.',
    steps: (p, r) => step(`Senza Zener: <var>V</var> = ${p.Vin} · ${frac(U(p.RL, 'Ω'), U(p.Rs + p.RL, 'Ω'))} = ${U(r.Vopen, 'V')}`, 'Partitore di tensione tra Rs e RL.') +
      step(r.ok ? `${U(r.Vopen, 'V')} > ${N(p.Vz)} V → ${res('lo Zener conduce')} e <var>V</var><sub>out</sub> = ${res(N(p.Vz) + ' V')}` : `${U(r.Vopen, 'V')} < ${N(p.Vz)} V → ${res('lo Zener non conduce')}: <var>V</var><sub>out</sub> = ${res(U(r.Vopen, 'V'))}`, r.ok ? 'La tensione in più resta su Rs.' : 'Carico troppo pesante (RL piccola) o ingresso troppo basso.'),
  });
  z4.push({
    id: 'zen-mc', title: 'Concetti sullo Zener', level: 1,
    ...mc([
      ['Lo Zener in uno stabilizzatore lavora…', ['in polarizzazione inversa, nella zona di rottura', 'in diretta', 'interdetto', 'come un LED'], 'Nella zona Zener la tensione resta quasi costante anche se la corrente cambia molto.'],
      ['A che cosa serve la resistenza serie Rs?', ['ad assorbire la differenza di tensione e a limitare la corrente', 'ad aumentare la tensione d\'uscita', 'a scaricare il condensatore', 'a proteggere il carico dalla tensione inversa'], 'Senza Rs lo Zener sarebbe in corto con l\'ingresso.'],
      ['Se il carico viene staccato, la corrente nello Zener…', ['aumenta: prende tutta la corrente di Rs', 'diminuisce', 'si annulla', 'cambia verso'], 'È la condizione peggiore per la potenza sullo Zener.'],
      ['Oggi per stabilizzare si usano spesso…', ['regolatori integrati come il 7805', 'solo Zener', 'trasformatori', 'resistori di precisione'], 'Il 7805 dà 5 V con 1 A e la protezione termica: lo vedrai in 5ª.'],
    ]),
  });

  function widgetZener(host) {
    const c = K.widgetCard('Lo stabilizzatore con Zener', 'Zener da 5,1 V (0,5 W, corrente minima 1 mA): cambia ingresso, Rs e carico');
    const sch = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const draw = (v) => {
      const z = SM.zener(v.Vin, v.Rs, 5.1, v.RL, 0.001);
      const status = z.Iz <= 0 ? ['bad', 'Lo Zener non conduce: la tensione sul carico scende sotto 5,1 V.'] : z.Iz < 0.001 ? ['warn', 'Lo Zener conduce appena: stabilizza male.'] : z.Pz > 0.5 ? ['bad', 'Troppa potenza sullo Zener: si brucerebbe (oltre 0,5 W).'] : ['ok', 'Stabilizza: 5,1 V sul carico.'];
      sch.innerHTML = S.zener({ Vin: v.Vin, Rs: v.Rs, Vz: '5,1 V', RL: v.RL }, { on: z.Iz > 0, Is: z.Is, Iz: z.Iz > 0 ? z.Iz : null, IL: z.IL }).svg;
      out.innerHTML = `<div class="form-row"><span class="label">Uscita</span><div class="f"><var>V</var><sub>out</sub> = ${res(U(z.Vout, 'V'))}</div><span class="meta" style="color:var(--${status[0] === 'ok' ? 'ok' : 'bad'})">${status[1]}</span></div>
        <div class="form-row"><span class="label">Correnti</span><div class="f"><var>I</var><sub>s</sub> = ${U(z.Is, 'A')}; <var>I</var><sub>L</sub> = ${U(z.IL, 'A')}; <var>I</var><sub>z</sub> = ${U(Math.max(0, z.Iz), 'A')}</div><span class="meta">Potenza sullo Zener: ${U(Math.max(0, z.Pz), 'W')}</span></div>`;
    };
    const sl = K.sliders(c, [
      { id: 'Vin', label: '<var>V</var><sub>in</sub> (V)', min: 3, max: 24, step: 0.5, value: 12 },
      { id: 'Rs', label: '<var>R</var><sub>s</sub> (Ω)', min: 22, max: 2200, log: true, value: 150 },
      { id: 'RL', label: '<var>R</var><sub>L</sub> (Ω)', min: 22, max: 10000, log: true, value: 470 },
    ], draw);
    c.append(sch, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'zener', num: 4, short: 'Zener', title: 'Il diodo Zener e lo stabilizzatore',
    intro: 'Un diodo Zener lavora in inversa, dove la tensione resta quasi costante: con una resistenza in serie diventa il più semplice stabilizzatore di tensione, che assorbe le variazioni dell\'ingresso e del carico.',
    goals: ['Funzionamento in rottura', 'Correnti e potenza', 'Progetto di Rs', 'Quando non stabilizza'],
    widgets: [widgetZener],
    example: z4[0], exampleTitle: 'Esempio: correnti nello stabilizzatore',
    families: z4,
    theory: `
      <article class="note"><h4>Le relazioni</h4>
        <div class="eq"><span><var>I</var><sub>s</sub> = ${frac('<var>V</var><sub>in</sub> − <var>V</var><sub>z</sub>', '<var>R</var><sub>s</sub>')}</span><span><var>I</var><sub>L</sub> = ${frac('<var>V</var><sub>z</sub>', '<var>R</var><sub>L</sub>')}</span><span><var>I</var><sub>z</sub> = <var>I</var><sub>s</sub> − <var>I</var><sub>L</sub></span></div>
        <p>Lo Zener stabilizza solo se <var>I</var><sub>z</sub> resta tra la corrente minima e quella massima (legata alla potenza <var>P</var><sub>z</sub> = <var>V</var><sub>z</sub><var>I</var><sub>z</sub>).</p></article>
      <article class="note"><h4>Progetto</h4>
        <p><var>R</var><sub>s</sub> = (<var>V</var><sub>in,min</sub> − <var>V</var><sub>z</sub>)/(<var>I</var><sub>L,max</sub> + <var>I</var><sub>z,min</sub>), poi si controlla la potenza nel caso peggiore: ingresso massimo e carico staccato.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'dio', year: '4', yearLabel: '4ª', title: 'Diodi e raddrizzatori', route: 'dio-diodo', lessonWord: 'Lezione',
    desc: 'Diodo e retta di carico, LED, raddrizzatori a una semionda e a ponte, condensatore di livellamento e ripple, stabilizzatore con Zener.',
    lessons,
  });
})();
