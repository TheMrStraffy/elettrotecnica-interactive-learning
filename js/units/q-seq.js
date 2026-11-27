/* 4ª — Logica sequenziale: latch, flip-flop, contatori, registri a scorrimento */
(function () {
  'use strict';
  const App = window.App;
  const SQ = window.Seq;
  const L = App.Lessons;
  const { N, U, frac, res } = L.fmt;
  // qui i passaggi sono spesso frasi: possono andare a capo
  const step = (calc, why) => L.fmt.step(calc, why).replace('class="calc"', 'class="calc prose"');
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const mc = App.B.mc;
  const lessons = [];
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const range = (n) => Array.from({ length: n }, (_, k) => k);
  const bitsH = (s) => `<span class="mono">${s}</span>`;
  const bitQ = (label, answer, o) => Object.assign({ label, type: 'text', fmt: 'bits', exact: true, answer: String(answer) }, o || {});
  const bin = (x, n) => x.toString(2).padStart(n, '0');
  const ovl = (x) => `<span class="ov">${x}</span>`;
  const Qb = ovl('<var>Q</var>');
  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const subU = (k) => String(k).split('').map((c) => SUBD[Number(c)]).join('');
  // nomi dentro gli SVG
  const sv = (name, s) => (s == null ? name : `${name}<tspan class="sb" dy="3">${s}</tspan>`);
  const so = (name) => `<tspan class="ovl">${name}</tspan>`;

  /** Tabella compatta (stile tabella della verità). */
  const tt = (head, rows, hl) => `<div class="table-wrap"><table class="tt"><thead><tr>${head.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr${hl === i ? ' class="hl"' : ''}>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  /** Opzioni a scelta multipla: la giusta più i distrattori, senza doppioni, rimescolate. */
  function optsFrom(right, wrongs, filler) {
    const list = [right];
    const add = (w) => { if (list.length < 4 && !list.includes(w)) list.push(w); };
    wrongs.forEach(add);
    for (let g = 0; list.length < 4 && g < 300; g++) add(filler());
    const o = App.shuffle(list.map((_, i) => i));
    return { opts: o.map((i) => list[i]), ans: o.indexOf(0) };
  }

  // =====================================================================
  // Diagramma temporale
  // =====================================================================
  /**
   * rows: [{ name, v: [0/1 per tick], cls, ck, unk, labels: [[tick, testo]] }]
   * ticks: durata; edges: tick con la riga tratteggiata del fronte; above: [[tick, testo]] sopra il diagramma;
   * hl: [[da, a]] fasce evidenziate.
   */
  function timSVG(o) {
    const rows = o.rows;
    const T = o.ticks;
    const W = o.W || 520;
    const lw = o.lw || 46;
    const rh = 34;
    const top = o.above ? 24 : 10;
    const H = top + rows.length * rh + 4;
    const X = (t) => (lw + ((W - lw - 10) * t) / T).toFixed(1);
    let s = '';
    (o.hl || []).forEach(([a, b]) => { s += `<rect class="thl" x="${X(a)}" y="${top - 6}" width="${(X(b) - X(a)).toFixed(1)}" height="${rows.length * rh + 6}"/>`; });
    (o.edges || []).forEach((t) => { s += `<line class="edge" x1="${X(t)}" x2="${X(t)}" y1="${top - 6}" y2="${H - 2}"/>`; });
    (o.above || []).forEach(([t, txt]) => { s += `<text class="tv up" x="${X(t)}" y="${top - 10}" text-anchor="middle">${txt}</text>`; });
    rows.forEach((r, i) => {
      const yH = top + i * rh + 5;
      const yL = top + i * rh + rh - 9;
      const yM = (yH + yL) / 2;
      s += `<text class="tn${r.ck ? ' ck' : ''}" x="${lw - 8}" y="${yM + 5}" text-anchor="end">${r.name}</text>`;
      if (r.unk) {
        s += `<line class="tunk" x1="${X(0)}" x2="${X(T)}" y1="${yM}" y2="${yM}"/>`;
        (r.labels || []).forEach(([t]) => { s += `<text class="tq" x="${X(t)}" y="${yM + 5}" text-anchor="middle">?</text>`; });
        return;
      }
      let d = '';
      let prev = null;
      for (let t = 0; t < T; t++) {
        const y = r.v[t] ? yH : yL;
        if (prev === null) d = `M${X(0)} ${y}`;
        else if (y !== prev) d += `H${X(t)}V${y}`;
        prev = y;
      }
      d += `H${X(T)}`;
      s += `<path class="tw${r.cls ? ' ' + r.cls : ''}" d="${d}"/>`;
      (r.labels || []).forEach(([t, txt]) => { s += `<text class="tv" x="${X(t)}" y="${yM + 4}" text-anchor="middle">${txt}</text>`; });
    });
    return `<svg class="tim" viewBox="0 0 ${W} ${H}" role="img" style="max-width:${W}px"><title>${o.title || 'Diagramma temporale'}</title>${s}</svg>`;
  }

  // Intervalli senza clock (latch): 3 tick per intervallo
  const IV = 3;
  const ivRow = (name, vals, extra) => Object.assign({ name, v: vals.flatMap((x) => [x, x, x]) }, extra || {});
  const ivLabels = (vals) => vals.map((x, k) => [IV * k + 1.5, String(x)]);
  const ivAbove = (n) => range(n).map((k) => [IV * k + 1.5, String(k + 1)]);
  const ivEdges = (n) => range(n - 1).map((k) => IV * (k + 1));

  // Con il clock: 4 tick per periodo, fronte di salita al tick 4k+2, due tick finali
  const ckTicks = (n) => 4 * n + 2;
  const ckRow = (n) => ({ name: 'CLK', ck: true, cls: 'clk', v: range(ckTicks(n)).map((t) => (t % 4 >= 2 && t < 4 * n ? 1 : 0)) });
  const perRow = (name, vals, extra) => Object.assign({ name, v: range(ckTicks(vals.length)).map((t) => vals[Math.min(vals.length - 1, Math.floor(t / 4))]) }, extra || {});
  const ckEdges = (n) => range(n).map((k) => 4 * k + 2);
  const ckAbove = (n) => range(n).map((k) => [4 * k + 2, String(k + 1)]);
  /** Riga di Q: Q0 prima del primo fronte, poi il valore dopo ciascun fronte. */
  const qRow = (name, Q0, outs, show, extra) => Object.assign({
    name, cls: 'q', unk: !show,
    v: range(ckTicks(outs.length)).map((t) => (t < 2 ? Q0 : outs[Math.min(outs.length - 1, Math.floor((t - 2) / 4))])),
    labels: outs.map((x, k) => [4 * k + 4, String(x)]),
  }, extra || {});

  // =====================================================================
  // Interruttori, LED e bit
  // =====================================================================
  function tog(id, label, aria, x, y, on) {
    return `<g class="in-toggle${on ? ' on' : ''}" data-in="${id}" role="button" tabindex="0" aria-label="${aria}: ${on ? 1 : 0}. Premi per cambiare" aria-pressed="${!!on}">
      <rect x="${x}" y="${y - 13}" width="30" height="26" rx="5"/>
      <text class="tv" x="${x + 15}" y="${y + 5}" text-anchor="middle">${on ? 1 : 0}</text>
      <text class="tl" x="${x - 6}" y="${y + 5}" text-anchor="end">${label}</text></g>`;
  }
  const led = (x, y, on, label) => `<g class="led${on ? ' on' : ''}"><circle cx="${x}" cy="${y}" r="10"/><text class="tl" x="${x + 16}" y="${y + 5}">${label} = ${on ? 1 : 0}</text></g>`;
  const ledTop = (x, y, on, label) => `<g class="led${on ? ' on' : ''}"><circle cx="${x}" cy="${y}" r="9"/><text class="tl sm" x="${x}" y="${y - 15}" text-anchor="middle">${label}</text></g>`;
  const wire = (d, on) => `<path class="sig${on ? ' on' : ''}" d="${d}"/>`;
  const jdot = (x, y, on) => `<circle class="jdot${on ? ' on' : ''}" cx="${x}" cy="${y}" r="3.5"/>`;

  /** Gli interruttori SVG rispondono al clic e alla tastiera; dopo il ridisegno il fuoco torna sullo stesso. */
  function bindSvgToggles(host, onToggle) {
    const refocus = (id) => { const again = host.querySelector(`.in-toggle[data-in="${id}"]`); if (again) again.focus(); };
    host.addEventListener('click', (e) => { const t = e.target.closest('.in-toggle'); if (t) onToggle(t.dataset.in); });
    host.addEventListener('keydown', (e) => {
      const t = e.target.closest('.in-toggle');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const id = t.dataset.in; onToggle(id); refocus(id); }
    });
  }

  function bitButtons(labels, state, onChange) {
    const box = el('div', 'bits msi-bits');
    box.style.setProperty('--n', labels.length);
    box.innerHTML = labels.map((l, i) => `<button type="button" class="bit" data-i="${i}"><span class="w">${l}</span><span class="b">0</span></button>`).join('');
    const paint = () => box.querySelectorAll('.bit').forEach((b, i) => {
      b.classList.toggle('on', !!state[i]);
      b.querySelector('.b').textContent = state[i] ? '1' : '0';
      b.setAttribute('aria-pressed', String(!!state[i]));
    });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.bit');
      if (!b) return;
      const i = Number(b.dataset.i);
      state[i] = state[i] ? 0 : 1;
      paint();
      onChange();
    });
    paint();
    box.repaint = paint;
    return box;
  }
  function group(cap, child) {
    const g = el('div', 'msi-grp');
    g.innerHTML = `<span class="msi-cap">${cap}</span>`;
    g.appendChild(child);
    return g;
  }
  function segOf(items, cur, onPick) {
    const seg = el('div', 'seg');
    seg.innerHTML = items.map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('');
    const paint = (k) => seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { paint(b.dataset.k); onPick(b.dataset.k); } });
    paint(cur);
    return seg;
  }
  /** Clock automatico: si ferma da solo quando il widget non è più visibile. */
  function autoClock(c, btn, tick, ms = 900) {
    let timer = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; btn.textContent = 'Clock automatico'; btn.setAttribute('aria-pressed', 'false'); };
    btn.addEventListener('click', () => {
      if (timer) { stop(); return; }
      btn.textContent = 'Ferma il clock';
      btn.setAttribute('aria-pressed', 'true');
      timer = setInterval(() => { if (!c.isConnected || !App.isVisible(c)) { stop(); return; } tick(); }, App.reducedMotion ? ms * 1.6 : ms);
    });
    return stop;
  }

  // =====================================================================
  // 1 — Latch
  // =====================================================================
  const STATE = { set: 'set', reset: 'reset', memoria: 'memoria', vietato: 'vietato' };
  /** Latch SR (NOR) o S̅R̅ (NAND): ingressi come arrivano ai piedini. */
  function latchStep(nand, a, b, Q) {
    const S = nand ? 1 - a : a;
    const R = nand ? 1 - b : b;
    const r = SQ.srNext(S, R, Q);
    if (r.state === 'vietato') return nand ? { Q: 1, Qn: 1, state: r.state } : r;
    return r;
  }
  function latchRun(nand, Q0, seq) {
    let Q = Q0;
    return seq.map(([a, b]) => { const r = latchStep(nand, a, b, Q); Q = r.Q; return r; });
  }
  const latchWhy = {
    set: 'Set: Q va a 1.',
    reset: 'Reset: Q va a 0.',
    memoria: 'Memoria: Q resta com\'era.',
    vietato: 'Vietato: Q e Q̅ valgono uguale.',
  };

  const l1 = [];
  const srDef = { Q0: 0, seq: [[1, 0], [0, 0], [0, 1], [0, 0], [1, 0], [0, 0]] };
  l1.push({
    id: 'sr-seq', title: 'Latch SR: segui gli ingressi', level: 1,
    defaults: srDef,
    gen: () => L.nice(() => ({ Q0: rand(0, 1), seq: range(6).map(() => pick([[1, 0], [0, 1], [0, 0], [0, 0]])) }),
      (p) => p.seq.some((x) => x[0]) && p.seq.some((x) => x[1]) && p.seq.filter((x) => !x[0] && !x[1]).length >= 2, srDef),
    solve: (p) => { const out = latchRun(false, p.Q0, p.seq); return { out, bits: out.map((r) => r.Q).join('') }; },
    text: (p) => `Un latch SR a porte NOR parte con <var>Q</var> = ${p.Q0}. Gli ingressi <var>S</var> e <var>R</var> cambiano come nel diagramma. Scrivi il valore di <var>Q</var> in ciascuno dei ${p.seq.length} intervalli, da sinistra a destra.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: IV * p.seq.length, edges: ivEdges(p.seq.length), above: ivAbove(p.seq.length), title: 'Ingressi del latch SR', rows: [ivRow('S', p.seq.map((x) => x[0]), { cls: 'in' }), ivRow('R', p.seq.map((x) => x[1]), { cls: 'in2' }), ivRow('Q', r.out.map((x) => x.Q), { cls: 'q', unk: !sol, labels: ivLabels(r.out.map((x) => x.Q)) })] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> negli intervalli 1…${p.seq.length}`, r.bits)],
    steps: (p, r) => step('<var>S</var> = 1 → set (<var>Q</var> = 1); <var>R</var> = 1 → reset (<var>Q</var> = 0); entrambi a 0 → memoria.', 'Il latch ricorda l\'ultimo comando ricevuto: è una memoria da un bit.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`, 'Negli intervalli di memoria il valore copia quello dell\'intervallo prima.'),
    table: (p, r) => tt(['intervallo', '<var>S</var>', '<var>R</var>', 'stato', '<var>Q</var>'], p.seq.map((x, k) => [k + 1, x[0], x[1], STATE[r.out[k].state], r.out[k].Q])),
  });
  const nandDef = { Q0: 1, seq: [[1, 0], [1, 1], [0, 1], [1, 1], [1, 0], [1, 1]] };
  l1.push({
    id: 'sr-nand', title: 'Latch S̅R̅ con le NAND', level: 2,
    defaults: nandDef,
    gen: () => L.nice(() => ({ Q0: rand(0, 1), seq: range(6).map(() => pick([[0, 1], [1, 0], [1, 1], [1, 1]])) }),
      (p) => p.seq.some((x) => !x[0]) && p.seq.some((x) => !x[1]) && p.seq.filter((x) => x[0] && x[1]).length >= 2, nandDef),
    solve: (p) => { const out = latchRun(true, p.Q0, p.seq); return { out, bits: out.map((r) => r.Q).join('') }; },
    text: (p) => `Il latch è fatto con due porte NAND, quindi gli ingressi ${ovl('<var>S</var>')} e ${ovl('<var>R</var>')} sono <strong>attivi bassi</strong>. Parte con <var>Q</var> = ${p.Q0}. Scrivi <var>Q</var> nei ${p.seq.length} intervalli.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: IV * p.seq.length, edges: ivEdges(p.seq.length), above: ivAbove(p.seq.length), title: 'Ingressi del latch con NAND', rows: [ivRow(so('S'), p.seq.map((x) => x[0]), { cls: 'in' }), ivRow(so('R'), p.seq.map((x) => x[1]), { cls: 'in2' }), ivRow('Q', r.out.map((x) => x.Q), { cls: 'q', unk: !sol, labels: ivLabels(r.out.map((x) => x.Q)) })] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> negli intervalli 1…${p.seq.length}`, r.bits)],
    hint: () => 'Il comando arriva quando l\'ingresso va a 0. Con entrambi a 1 il latch ricorda.',
    steps: (p, r) => step(`${ovl('<var>S</var>')} = 0 → set; ${ovl('<var>R</var>')} = 0 → reset; entrambi a 1 → memoria.`, 'Una NAND con un ingresso a 0 dà sempre 1: per questo il comando è lo 0. Il trattino sopra il nome ricorda proprio che l\'ingresso è attivo basso.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`),
    table: (p, r) => tt(['intervallo', ovl('<var>S</var>'), ovl('<var>R</var>'), 'stato', '<var>Q</var>'], p.seq.map((x, k) => [k + 1, x[0], x[1], STATE[r.out[k].state], r.out[k].Q])),
  });
  const dlDef = { Q0: 0, seq: [[1, 1], [0, 0], [0, 1], [1, 0], [0, 1], [1, 1], [0, 0]] };
  l1.push({
    id: 'd-latch', title: 'Latch D con abilitazione', level: 2,
    defaults: dlDef,
    gen: () => L.nice(() => ({ Q0: rand(0, 1), seq: range(7).map(() => [rand(0, 1), rand(0, 1)]) }),
      (p) => { let Q = p.Q0; let memDiff = 0; p.seq.forEach(([en, d]) => { if (!en && d !== Q) memDiff++; if (en) Q = d; }); return memDiff >= 2 && p.seq.filter((x) => x[0]).length >= 2; }, dlDef),
    solve: (p) => { let Q = p.Q0; const out = p.seq.map(([en, d]) => { if (en) Q = d; return Q; }); return { out, bits: out.join('') }; },
    text: (p) => `Un latch D con ingresso di abilitazione EN parte con <var>Q</var> = ${p.Q0}. Quando EN = 1 è trasparente (<var>Q</var> copia <var>D</var>), quando EN = 0 ricorda. Scrivi <var>Q</var> nei ${p.seq.length} intervalli.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: IV * p.seq.length, edges: ivEdges(p.seq.length), above: ivAbove(p.seq.length), title: 'Ingressi del latch D', rows: [ivRow('EN', p.seq.map((x) => x[0]), { cls: 'clk', ck: true }), ivRow('D', p.seq.map((x) => x[1]), { cls: 'in' }), ivRow('Q', r.out, { cls: 'q', unk: !sol, labels: ivLabels(r.out) })] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> negli intervalli 1…${p.seq.length}`, r.bits)],
    steps: (p, r) => step('EN = 1 → <var>Q</var> = <var>D</var>; EN = 0 → <var>Q</var> resta com\'era.', 'Dentro c\'è un latch SR con <var>S</var> = <var>D</var>·EN e <var>R</var> = ' + ovl('<var>D</var>') + '·EN: lo stato vietato non può più capitare.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`, 'Attenzione: finché EN è alto, ogni cambiamento di D passa subito in uscita. Il flip-flop della prossima lezione invece guarda D solo in un istante.'),
    table: (p, r) => tt(['intervallo', 'EN', '<var>D</var>', '<var>Q</var>'], p.seq.map((x, k) => [k + 1, x[0], x[1], r.out[k]])),
  });
  const fbDef = { Q0: 0, seq: [[1, 0], [1, 1], [0, 1], [0, 0], [1, 0], [0, 0]] };
  l1.push({
    id: 'sr-forbidden', title: 'Lo stato vietato', level: 3,
    defaults: fbDef,
    gen: () => L.nice(() => {
      const seq = range(6).map(() => pick([[1, 0], [0, 1], [0, 0]]));
      const k = rand(1, 4);
      seq[k] = [1, 1];
      seq[k + 1] = pick([[1, 0], [0, 1]]);
      return { Q0: rand(0, 1), seq };
    }, (p) => p.seq.filter((x) => x[0] && x[1]).length === 1 && p.seq.some((x) => !x[0] && !x[1]), fbDef),
    solve: (p) => { const out = latchRun(false, p.Q0, p.seq); return { out, q: out.map((r) => r.Q).join(''), qn: out.map((r) => r.Qn).join('') }; },
    text: (p) => `Latch SR a porte NOR, parte con <var>Q</var> = ${p.Q0}. In un intervallo <var>S</var> e <var>R</var> sono entrambi a 1. Scrivi <var>Q</var> e ${Qb} in tutti i ${p.seq.length} intervalli.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: IV * p.seq.length, edges: ivEdges(p.seq.length), above: ivAbove(p.seq.length), hl: p.seq.map((x, k) => (x[0] && x[1] ? [IV * k, IV * k + IV] : null)).filter(Boolean), title: 'Ingressi del latch SR con lo stato vietato', rows: [ivRow('S', p.seq.map((x) => x[0]), { cls: 'in' }), ivRow('R', p.seq.map((x) => x[1]), { cls: 'in2' }), ivRow('Q', r.out.map((x) => x.Q), { cls: 'q', unk: !sol, labels: ivLabels(r.out.map((x) => x.Q)) }), ivRow(so('Q'), r.out.map((x) => x.Qn), { cls: 'q2', unk: !sol, labels: ivLabels(r.out.map((x) => x.Qn)) })] }) }),
    asks: (p, r) => [bitQ('<var>Q</var>', r.q), bitQ(Qb, r.qn)],
    hint: () => 'Con S = R = 1 tutte e due le NOR hanno un ingresso a 1: che cosa danno in uscita?',
    steps: (p, r) => step('<var>S</var> = <var>R</var> = 1: entrambe le NOR hanno un ingresso a 1 → <var>Q</var> = ' + Qb + ' = 0', 'Le due uscite non sono più una il contrario dell\'altra: per questo lo stato si chiama vietato.') +
      step(`<var>Q</var> = ${res(bitsH(r.q))}, ${Qb} = ${res(bitsH(r.qn))}`, 'Qui si esce dal vietato abbassando un solo ingresso, quindi il risultato è certo. Se si abbassassero tutti e due nello stesso istante vincerebbe la porta più veloce: lo stato finale sarebbe imprevedibile.'),
    table: (p, r) => tt(['intervallo', '<var>S</var>', '<var>R</var>', 'stato', '<var>Q</var>', Qb], p.seq.map((x, k) => [k + 1, x[0], x[1], STATE[r.out[k].state], r.out[k].Q, r.out[k].Qn])),
  });
  l1.push({
    id: 'latch-mc', title: 'Concetti sui latch', level: 1,
    ...mc([
      ['Un circuito sequenziale si distingue da uno combinatorio perché…', ['l\'uscita dipende anche dalla storia passata (ha memoria)', 'usa solo porte NAND', 'non ha ingressi', 'è sempre più veloce'], 'La retroazione (uscita riportata all\'ingresso) è ciò che dà memoria.'],
      ['Nel latch SR a NOR, con S = 0 e R = 0…', ['l\'uscita resta com\'era (memoria)', 'Q va a 1', 'Q va a 0', 'è lo stato vietato'], 'Nessun comando: il latch ricorda.'],
      ['Nel latch S̅R̅ a NAND, il comando di set si dà con…', ['S̅ = 0', 'S̅ = 1', 'S̅ = R̅ = 1', 'R̅ = 0'], 'Gli ingressi sono attivi bassi.'],
      ['Il latch D risolve un problema del latch SR:', ['lo stato vietato non può più capitare', 'non ha più bisogno di alimentazione', 'diventa combinatorio', 'non può più memorizzare'], 'S e R vengono da D e dal suo negato: non sono mai entrambi a 1.'],
      ['Un uso tipico del latch SR è…', ['eliminare i rimbalzi di un pulsante meccanico', 'amplificare un segnale audio', 'raddrizzare la tensione di rete', 'misurare la frequenza'], 'Al primo contatto il latch cambia stato e i rimbalzi successivi danno solo "memoria".'],
    ]),
  });

  function widgetLatch(host) {
    const c = K.widgetCard('Il latch SR', 'Due porte retroazionate: premi gli ingressi e guarda le uscite');
    let nand = false;
    let a = 0;
    let b = 0;
    let Q = 0;
    let Qn = 1;
    let state = 'memoria';
    let hist = [];
    const fig = el('div', 'msi-fig');
    const out = el('div', 'forms');
    const tbl = el('div');
    const tim = el('div', 'msi-fig seq-fig');
    const names = () => (nand ? [so('S'), so('R')] : ['S', 'R']);
    const push = () => { hist.push({ a, b, Q, Qn }); if (hist.length > 12) hist = hist.slice(-12); };
    const apply = () => { const r = latchStep(nand, a, b, Q); Q = r.Q; Qn = r.Qn; state = r.state; };
    const draw = () => {
      const type = nand ? 'NAND' : 'NOR';
      const g1 = App.Gates.gateSVG(type, 2, 'ansi', 180, 40, 1.15);
      const g2 = App.Gates.gateSVG(type, 2, 'ansi', 180, 150, 1.15);
      // NOR: in alto R e Q̅ → Q, in basso S e Q → Q̅.  NAND: in alto S̅ e Q̅ → Q, in basso R̅ e Q → Q̅.
      const top = nand ? a : b;
      const bot = nand ? b : a;
      const [nTop, nBot] = nand ? [so('S'), so('R')] : ['R', 'S'];
      const [aTop, aBot] = nand ? ['S negato', 'R negato'] : ['R', 'S'];
      let s = '';
      s += wire(`M80 ${g1.pins[0].y} H${g1.pins[0].x}`, top) + wire(`M80 ${g2.pins[1].y} H${g2.pins[1].x}`, bot);
      s += wire(`M${g1.out.x} ${g1.out.y} H380`, Q) + wire(`M${g2.out.x} ${g2.out.y} H380`, Qn);
      s += wire(`M300 ${g1.out.y} V118 H150 V${g2.pins[0].y} H${g2.pins[0].x}`, Q) + jdot(300, g1.out.y, Q);
      s += wire(`M320 ${g2.out.y} V132 H165 V${g1.pins[1].y} H${g1.pins[1].x}`, Qn) + jdot(320, g2.out.y, Qn);
      s += g1.svg + g2.svg;
      s += tog(nand ? 's' : 'r', nTop, aTop, 50, g1.pins[0].y, top) + tog(nand ? 'r' : 's', nBot, aBot, 50, g2.pins[1].y, bot);
      s += led(395, g1.out.y, Q, 'Q') + led(395, g2.out.y, Qn, so('Q'));
      fig.innerHTML = `<svg class="logic" viewBox="0 0 470 215" role="img" style="max-width:470px"><title>Latch SR con due porte ${type}</title>${s}</svg>`;
      const msg = {
        set: 'Set: <var>Q</var> va a 1. Ora puoi togliere il comando: il latch ricorda.',
        reset: 'Reset: <var>Q</var> va a 0.',
        memoria: 'Memoria: nessun comando, le uscite restano come prima grazie alla retroazione.',
        vietato: `Stato vietato: <var>Q</var> = ${Qb} = ${nand ? 1 : 0}. Se togliessi i due comandi nello stesso istante, lo stato finale dipenderebbe dalla porta più veloce.`,
      }[state];
      out.innerHTML = `<div class="form-row"><span class="label">Stato</span><div class="f">${res(state)}</div><span class="meta">${msg}</span></div>`;
      const [n1, n2] = nand ? [ovl('<var>S</var>'), ovl('<var>R</var>')] : ['<var>S</var>', '<var>R</var>'];
      const rows = nand
        ? [[0, 0, '1 1', 'vietato'], [0, 1, '1 0', 'set'], [1, 0, '0 1', 'reset'], [1, 1, '<var>Q</var> ' + Qb, 'memoria']]
        : [[0, 0, '<var>Q</var> ' + Qb, 'memoria'], [0, 1, '0 1', 'reset'], [1, 0, '1 0', 'set'], [1, 1, '0 0', 'vietato']];
      tbl.innerHTML = tt([n1, n2, '<var>Q</var> ' + Qb, 'stato'], rows, a * 2 + b);
      const n = hist.length;
      tim.innerHTML = timSVG({ ticks: IV * n, edges: ivEdges(n), title: 'Storia degli ingressi e delle uscite', rows: [
        ivRow(names()[0], hist.map((x) => x.a), { cls: 'in' }), ivRow(names()[1], hist.map((x) => x.b), { cls: 'in2' }),
        ivRow('Q', hist.map((x) => x.Q), { cls: 'q' }), ivRow(so('Q'), hist.map((x) => x.Qn), { cls: 'q2' })] });
    };
    const reset = () => { a = nand ? 1 : 0; b = nand ? 1 : 0; Q = 0; Qn = 1; state = 'memoria'; hist = []; push(); draw(); };
    bindSvgToggles(fig, (id) => { if (id === 's') a = 1 - a; else b = 1 - b; apply(); push(); draw(); });
    const seg = segOf([['nor', 'Porte NOR (S, R)'], ['nand', 'Porte NAND (S̅, R̅)']], 'nor', (k) => { nand = k === 'nand'; reset(); });
    const side = el('div', 'seq-side');
    side.append(tbl, out);
    c.append(seg, fig, side, tim);
    const note = el('p', 'hint');
    note.innerHTML = 'Nel diagramma ogni colonna è un tuo comando. Prova: set, poi togli il comando (memoria), poi reset. ' + 'Con le NAND gli ingressi a riposo stanno a 1 e il comando è lo 0.';
    c.appendChild(note);
    host.appendChild(c);
    reset();
  }

  lessons.push({
    id: 'latch', num: 1, short: 'Latch', title: 'Il latch: una memoria da un bit',
    intro: 'Finora l\'uscita dipendeva solo dagli ingressi di quel momento. Se riporti l\'uscita di una porta all\'ingresso di un\'altra, il circuito si ricorda che cosa è successo prima: è il primo circuito sequenziale.',
    goals: ['Retroazione e memoria', 'Latch SR con NOR e con NAND', 'Lo stato vietato', 'Latch D con abilitazione'],
    widgets: [widgetLatch],
    example: l1[0], exampleTitle: 'Esempio: un latch che ricorda',
    families: l1,
    theory: `
      <article class="note"><h4>Latch SR (porte NOR)</h4>
        <p><var>S</var> = 1 mette <var>Q</var> a 1 (set), <var>R</var> = 1 lo mette a 0 (reset), con entrambi a 0 il latch ricorda. <var>S</var> = <var>R</var> = 1 è vietato: <var>Q</var> e ${Qb} vanno entrambe a 0.</p></article>
      <article class="note"><h4>Latch ${ovl('S')}${ovl('R')} (porte NAND)</h4>
        <p>Stesso comportamento, ma gli ingressi sono attivi bassi: il comando è lo 0, il riposo è 1. Il vietato è ${ovl('<var>S</var>')} = ${ovl('<var>R</var>')} = 0, con le due uscite a 1.</p></article>
      <article class="note"><h4>Latch D</h4>
        <p>Con EN = 1 l'uscita copia <var>D</var> (trasparente); con EN = 0 tiene l'ultimo valore. Ha un solo ingresso dati, quindi il vietato non esiste più.</p></article>`,
  });

  // =====================================================================
  // 2 — Flip-flop
  // =====================================================================
  const f2 = [];
  const ffInp = (type, x) => (type === 'D' ? { D: x[0] } : type === 'T' ? { T: x[0] } : { J: x[0], K: x[1] });
  const ffDef = { Q0: 0, d: [1, 1, 0, 1, 0, 0] };
  f2.push({
    id: 'ff-d', title: 'Flip-flop D', level: 1,
    defaults: ffDef,
    gen: () => L.nice(() => ({ Q0: rand(0, 1), d: range(6).map(() => rand(0, 1)) }), (p) => p.d.some((x) => x) && p.d.some((x) => !x) && p.d.some((x, k) => k && x === p.d[k - 1]), ffDef),
    solve: (p) => { const out = SQ.ffRun('D', p.d.map((x) => ({ D: x })), p.Q0); return { out, bits: out.join('') }; },
    text: (p) => `Un flip-flop D attivo sul fronte di salita parte con <var>Q</var> = ${p.Q0}. Leggi <var>D</var> nel diagramma e scrivi <var>Q</var> dopo ciascuno dei ${p.d.length} fronti di salita del clock.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: ckTicks(p.d.length), edges: ckEdges(p.d.length), above: ckAbove(p.d.length), title: 'Clock e ingresso del flip-flop D', rows: [ckRow(p.d.length), perRow('D', p.d, { cls: 'in' }), qRow('Q', p.Q0, r.out, sol)] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> dopo i fronti 1…${p.d.length}`, r.bits)],
    steps: (p, r) => step('A ogni fronte di salita <var>Q</var> prende il valore che <var>D</var> ha in quell\'istante; tra un fronte e l\'altro resta fermo.', 'Il flip-flop D è un "campionatore": fotografa D quando arriva il clock.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`, 'È la sequenza di D ritardata di un colpo di clock: per questo si chiama anche "delay".'),
  });
  const jkDef = { Q0: 0, jk: [[1, 0], [0, 0], [1, 1], [1, 1], [0, 1], [1, 1]] };
  f2.push({
    id: 'ff-jk', title: 'Flip-flop JK', level: 1,
    defaults: jkDef,
    gen: () => L.nice(() => ({ Q0: rand(0, 1), jk: range(6).map(() => [rand(0, 1), rand(0, 1)]) }), (p) => p.jk.filter((x) => x[0] && x[1]).length >= 2 && p.jk.some((x) => !x[0] && !x[1]) && p.jk.some((x) => x[0] !== x[1]), jkDef),
    solve: (p) => { const out = SQ.ffRun('JK', p.jk.map((x) => ({ J: x[0], K: x[1] })), p.Q0); return { out, bits: out.join('') }; },
    text: (p) => `Un flip-flop JK attivo sul fronte di salita parte con <var>Q</var> = ${p.Q0}. Scrivi <var>Q</var> dopo ciascuno dei ${p.jk.length} fronti.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: ckTicks(p.jk.length), edges: ckEdges(p.jk.length), above: ckAbove(p.jk.length), title: 'Clock e ingressi del flip-flop JK', rows: [ckRow(p.jk.length), perRow('J', p.jk.map((x) => x[0]), { cls: 'in' }), perRow('K', p.jk.map((x) => x[1]), { cls: 'in2' }), qRow('Q', p.Q0, r.out, sol)] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> dopo i fronti 1…${p.jk.length}`, r.bits)],
    steps: (p, r) => step('<var>J</var><var>K</var> = 00 memoria, 01 reset, 10 set, 11 commuta (<var>Q</var> → ' + Qb + ').', 'È come il latch SR (J = set, K = reset), ma la combinazione 11 invece di essere vietata fa invertire l\'uscita.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`),
    table: (p, r) => tt(['fronte', '<var>J</var>', '<var>K</var>', '<var>Q</var> prima', '<var>Q</var> dopo'], p.jk.map((x, k) => [k + 1, x[0], x[1], k ? r.out[k - 1] : p.Q0, r.out[k]])),
  });
  const tDef = { Q0: 0, t: [1, 1, 0, 1, 0, 1], f: 1000 };
  f2.push({
    id: 'ff-t', title: 'Flip-flop T e divisione per 2', level: 2,
    defaults: tDef,
    gen: () => L.nice(() => ({ Q0: rand(0, 1), t: range(6).map(() => rand(0, 1)), f: pick([50, 100, 1000, 2000, 10000]) }), (p) => p.t.filter((x) => x).length >= 3 && p.t.some((x) => !x), tDef),
    solve: (p) => { const out = SQ.ffRun('T', p.t.map((x) => ({ T: x })), p.Q0); return { out, bits: out.join(''), fq: p.f / 2 }; },
    text: (p) => `Un flip-flop T (attivo sul fronte di salita) parte con <var>Q</var> = ${p.Q0}. Scrivi <var>Q</var> dopo ciascuno dei ${p.t.length} fronti. Poi: se <var>T</var> restasse sempre a 1 con un clock a ${U(p.f, 'Hz')}, che frequenza avrebbe <var>Q</var>?`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: ckTicks(p.t.length), edges: ckEdges(p.t.length), above: ckAbove(p.t.length), title: 'Clock e ingresso del flip-flop T', rows: [ckRow(p.t.length), perRow('T', p.t, { cls: 'in' }), qRow('Q', p.Q0, r.out, sol)] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> dopo i fronti 1…${p.t.length}`, r.bits), { label: '<var>f</var><sub>Q</sub>', unit: 'Hz', value: r.fq }],
    steps: (p, r) => step('<var>T</var> = 1 → commuta; <var>T</var> = 0 → memoria.', 'Il flip-flop T è un JK con J = K = T.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`) +
      step(`Con <var>T</var> = 1 fisso <var>Q</var> commuta a ogni fronte: un periodo di <var>Q</var> dura due periodi di clock → <var>f</var><sub>Q</sub> = ${frac('<var>f</var>', '2')} = ${res(U(r.fq, 'Hz'))}`, 'È il mattone dei contatori e dei divisori di frequenza.'),
  });
  const glDef = { Q0: 0, d: [1, 0, 0, 1, 1, 0], v: [0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0] };
  f2.push({
    id: 'ff-glitch', title: 'D che cambia tra un fronte e l\'altro', level: 3,
    defaults: glDef,
    gen: () => L.nice(() => {
      const n = 6;
      const d = range(n).map(() => rand(0, 1));
      const v = [];
      for (let k = 0; k < n; k++) {
        const before = k ? v[4 * k - 1] : rand(0, 1);
        v.push(Math.random() < 0.5 ? before : d[k], d[k], d[k], Math.random() < 0.6 ? d[k] : 1 - d[k]);
      }
      v.push(rand(0, 1), rand(0, 1));
      return { Q0: rand(0, 1), d, v };
    }, (p) => { let ch = 0; for (let t = 1; t < p.v.length; t++) if (p.v[t] !== p.v[t - 1]) ch++; return ch >= p.d.length + 2 && p.d.some((x) => x) && p.d.some((x) => !x); }, glDef),
    solve: (p) => { const out = SQ.ffRun('D', p.d.map((x) => ({ D: x })), p.Q0); return { out, bits: out.join('') }; },
    text: (p) => `Un flip-flop D attivo sul fronte di salita parte con <var>Q</var> = ${p.Q0}. Questa volta <var>D</var> cambia anche lontano dai fronti, con qualche impulso breve. Scrivi <var>Q</var> dopo ciascuno dei ${p.d.length} fronti.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: ckTicks(p.d.length), edges: ckEdges(p.d.length), above: ckAbove(p.d.length), title: 'Clock e un ingresso D irregolare', rows: [ckRow(p.d.length), { name: 'D', cls: 'in', v: p.v }, qRow('Q', p.Q0, r.out, sol)] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> dopo i fronti 1…${p.d.length}`, r.bits)],
    hint: () => 'Guarda D solo sulle righe tratteggiate: quello che fa in mezzo non conta.',
    steps: (p, r) => step(`<var>D</var> letto sui fronti: ${bitsH(p.d.join(''))}`, 'Il flip-flop è sensibile solo al fronte: gli impulsi tra un fronte e l\'altro vengono ignorati. Un latch D con EN = CLK invece li lascerebbe passare mentre il clock è alto.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`, 'Per questo nei sistemi digitali tutto si sincronizza sul fronte del clock: i disturbi tra un fronte e l\'altro non fanno danni.'),
  });
  const clrDef = { Q0: 0, jk: [[1, 1], [1, 1], [1, 0], [0, 0], [1, 1], [1, 1]], clr: range(26).map((t) => (t === 4 ? 0 : 1)) };
  f2.push({
    id: 'ff-clr', title: 'Il clear asincrono', level: 3,
    defaults: clrDef,
    gen: () => L.nice(() => {
      const n = 6;
      const jk = range(n).map(() => pick([[1, 1], [1, 1], [1, 0], [0, 1], [0, 0]]));
      const clr = Array(ckTicks(n)).fill(1);
      const k = rand(0, n - 2);
      if (Math.random() < 0.5) clr[4 * k + 4] = 0; // tra il fronte k e il successivo
      else { clr[4 * k + 5] = 0; clr[4 * k + 6] = 0; clr[4 * k + 7] = 0; } // a cavallo del fronte k+1
      return { Q0: rand(0, 1), jk, clr };
    }, (p) => {
      if (!p.clr.length) return false;
      const a = simClr(p).out.join('');
      const b = SQ.ffRun('JK', p.jk.map((x) => ffInp('JK', x)), p.Q0).join('');
      return a !== b;
    }, clrDef),
    solve: (p) => { const r = simClr(p); return { ...r, bits: r.out.join('') }; },
    text: (p) => `Un flip-flop JK (fronte di salita) ha anche l'ingresso ${ovl('CLR')} di azzeramento <strong>asincrono</strong>, attivo basso: quando è a 0 porta subito <var>Q</var> a 0 e tiene fermo il flip-flop, senza aspettare il clock. Parte con <var>Q</var> = ${p.Q0}. Scrivi <var>Q</var> subito dopo ciascuno dei ${p.jk.length} fronti.`,
    fig: (p, r, sol) => ({ svg: timSVG({ ticks: ckTicks(p.jk.length), edges: ckEdges(p.jk.length), above: ckAbove(p.jk.length), title: 'Flip-flop JK con clear asincrono', rows: [ckRow(p.jk.length), perRow('J', p.jk.map((x) => x[0]), { cls: 'in' }), perRow('K', p.jk.map((x) => x[1]), { cls: 'in2' }), { name: so('CLR'), cls: 'clr', v: p.clr, ck: true }, { name: 'Q', cls: 'q', unk: !sol, v: r.ticks, labels: r.out.map((x, k) => [4 * k + 2.8, String(x)]) }] }) }),
    asks: (p, r) => [bitQ(`<var>Q</var> dopo i fronti 1…${p.jk.length}`, r.bits)],
    hint: () => 'Dove CLR̅ va a 0, Q va a 0 in quell\'istante e i fronti che capitano mentre è a 0 non contano.',
    steps: (p, r) => step('Fronte per fronte con la tabella del JK (00 memoria, 01 reset, 10 set, 11 commuta)…', 'Il JK con J = K = 1 commuta: dopo un azzeramento la sequenza riparte da 0.') +
      step(`…ma dove ${ovl('CLR')} = 0 <var>Q</var> va a 0 subito, anche in mezzo tra due fronti.`, 'Gli ingressi asincroni (CLR, PRE) hanno la precedenza sul clock: servono per mettere il circuito in uno stato noto all\'accensione.') +
      step(`<var>Q</var> = ${res(bitsH(r.bits))}`),
  });
  /** Simulazione tick per tick di un JK con clear asincrono. */
  function simClr(p) {
    const T = ckTicks(p.jk.length);
    let Q = p.Q0;
    const ticks = [];
    const out = [];
    for (let t = 0; t < T; t++) {
      if (!p.clr[t]) Q = 0;
      else if (t % 4 === 2 && t < 4 * p.jk.length) Q = SQ.ffNext('JK', ffInp('JK', p.jk[(t - 2) / 4]), Q);
      if (t % 4 === 2 && t < 4 * p.jk.length) out.push(Q);
      ticks.push(Q);
    }
    return { ticks, out };
  }
  f2.push({
    id: 'ff-mc', title: 'Concetti sui flip-flop', level: 1,
    ...mc([
      ['La differenza tra latch e flip-flop è che il flip-flop…', ['cambia stato solo sul fronte del clock', 'non ha memoria', 'ha più uscite', 'funziona solo con le NAND'], 'Il latch è sensibile al livello, il flip-flop al fronte.'],
      ['Nel flip-flop JK con J = K = 1, a ogni fronte…', ['l\'uscita commuta', 'l\'uscita va a 1', 'l\'uscita va a 0', 'l\'uscita resta com\'è'], 'È il modo "toggle".'],
      ['Per ottenere un flip-flop T da un JK si collega…', ['J = K = T', 'J = T, K = 0', 'J = 1, K = T', 'J = T, K = T̅'], 'Con T = 1 commuta, con T = 0 ricorda.'],
      ['Per ottenere un flip-flop D da un JK si collega…', ['J = D, K = D̅', 'J = K = D', 'J = 1, K = D', 'J = D, K = 1'], 'Così J e K sono sempre opposti: set o reset a seconda di D.'],
      ['Gli ingressi PRESET e CLEAR sono detti asincroni perché…', ['agiscono subito, senza aspettare il clock', 'funzionano solo con il clock', 'sono collegati al clock', 'si usano solo nei latch'], 'Hanno la precedenza su tutti gli altri ingressi.'],
      ['Il triangolino sull\'ingresso di clock nel simbolo del flip-flop indica…', ['che è attivo sul fronte', 'che è un amplificatore', 'che è attivo basso', 'che è un ingresso asincrono'], 'Con un pallino davanti al triangolo il fronte attivo è quello di discesa.'],
    ]),
  });

  /** Simbolo del flip-flop con ingressi, clock e uscite. */
  function ffSVG(type, inp, Q, flash) {
    const pins = type === 'JK' ? [['J', 50, inp.J], ['K', 120, inp.K]] : [[type, 55, type === 'D' ? inp.D : inp.T]];
    const yC = type === 'JK' ? 85 : 115;
    let s = '';
    pins.forEach(([n, y, v]) => { s += wire(`M80 ${y} H120`, v) + `<text class="tl" x="72" y="${y + 5}" text-anchor="end">${n}</text><text class="pn" x="128" y="${y + 5}">${n}</text>`; });
    s += wire(`M80 ${yC} H120`, flash) + `<text class="tl ck" x="72" y="${yC + 5}" text-anchor="end">CLK</text>`;
    s += '<rect class="ffbox" x="120" y="25" width="100" height="120" rx="3"/>';
    s += `<path class="ffck${flash ? ' on' : ''}" d="M120 ${yC - 9} L133 ${yC} L120 ${yC + 9}"/>`;
    s += `<text class="pn" x="212" y="55" text-anchor="end">Q</text><text class="pn" x="212" y="125" text-anchor="end">${so('Q')}</text>`;
    s += `<text class="pn ty" x="170" y="${type === 'JK' ? 140 : 92}" text-anchor="middle">FF ${type}</text>`;
    s += wire('M220 50 H270', Q) + wire('M220 120 H270', 1 - Q) + led(284, 50, Q, 'Q') + led(284, 120, 1 - Q, so('Q'));
    return `<svg class="logic" viewBox="0 0 360 165" role="img" style="max-width:360px"><title>Flip-flop ${type}</title>${s}</svg>`;
  }

  function widgetFF(host) {
    const c = K.widgetCard('I flip-flop', 'Scegli il tipo, imposta gli ingressi, dai il colpo di clock');
    let type = 'JK';
    const inp = [1, 1];
    let Q = 0;
    let hist = [];
    let flash = 0;
    const fig = el('div', 'msi-fig');
    const tbl = el('div');
    const out = el('div', 'forms');
    const tim = el('div', 'msi-fig seq-fig');
    const ctl = el('div', 'msi-ctl');
    const btns = el('div', 'row');
    btns.innerHTML = '<button type="button" class="btn small">Fronte di clock ↑</button><button type="button" class="btn ghost small" aria-pressed="false">Clock automatico</button><button type="button" class="btn ghost small">Azzera</button>';
    const [bClk, bAuto, bClr] = btns.children;
    let inBox;
    const names = () => (type === 'JK' ? ['J', 'K'] : [type]);
    const cur = () => ffInp(type, inp);
    const draw = () => {
      fig.innerHTML = ffSVG(type, cur(), Q, flash);
      const qq = '<var>Q</var>';
      const rows = type === 'D' ? [[0, '0', 'reset'], [1, '1', 'set']]
        : type === 'T' ? [[0, qq, 'memoria'], [1, Qb, 'commuta']]
          : [[0, 0, qq, 'memoria'], [0, 1, '0', 'reset'], [1, 0, '1', 'set'], [1, 1, Qb, 'commuta']];
      const head = type === 'JK' ? ['<var>J</var>', '<var>K</var>', qq + ' dopo il fronte', ''] : [`<var>${type}</var>`, qq + ' dopo il fronte', ''];
      tbl.innerHTML = tt(head, rows, type === 'JK' ? inp[0] * 2 + inp[1] : inp[0]);
      const n = hist.length;
      if (!n) { tim.innerHTML = '<p class="hint">Premi «Fronte di clock» per vedere il diagramma temporale.</p>'; } else {
        const rowsT = [{ name: 'CLK', ck: true, cls: 'clk', v: hist.flatMap(() => [0, 0, 1, 1]) }];
        names().forEach((nm, i) => rowsT.push({ name: nm, cls: i ? 'in2' : 'in', v: hist.flatMap((x) => Array(4).fill(x.inp[i])) }));
        rowsT.push({ name: 'Q', cls: 'q', v: hist.flatMap((x) => [x.before, x.before, x.after, x.after]) });
        tim.innerHTML = timSVG({ ticks: 4 * n, edges: range(n).map((k) => 4 * k + 2), rows: rowsT, title: 'Storia dei colpi di clock' });
      }
      out.innerHTML = `<div class="form-row"><span class="label">Uscita</span><div class="f"><var>Q</var> = ${res(String(Q))}</div><span class="meta">Cambiare gli ingressi non basta: l'uscita si aggiorna solo al fronte di salita del clock.</span></div>`;
    };
    const clock = () => {
      const before = Q;
      Q = SQ.ffNext(type, cur(), Q);
      hist.push({ inp: inp.slice(0, names().length), before, after: Q });
      if (hist.length > 8) hist = hist.slice(-8);
      flash = 1;
      draw();
      setTimeout(() => { flash = 0; if (c.isConnected) fig.innerHTML = ffSVG(type, cur(), Q, 0); }, 260);
    };
    const build = () => {
      const box = bitButtons(names(), inp, draw);
      if (inBox) inBox.replaceWith(group('Ingressi', box)); else ctl.appendChild(group('Ingressi', box));
      inBox = box.parentNode;
    };
    const seg = segOf([['D', 'D'], ['JK', 'JK'], ['T', 'T']], type, (k) => { type = k; hist = []; build(); draw(); });
    bClk.addEventListener('click', clock);
    bClr.addEventListener('click', () => { Q = 0; hist = []; draw(); });
    autoClock(c, bAuto, clock, 1000);
    c.append(seg, ctl, btns, fig);
    const side = el('div', 'seq-side');
    side.append(tbl, out);
    c.append(side, tim);
    host.appendChild(c);
    build();
    draw();
  }

  lessons.push({
    id: 'flipflop', num: 2, short: 'Flip-flop', title: 'Flip-flop D, JK e T',
    intro: 'Il flip-flop è un latch che guarda gli ingressi solo in un istante preciso: il fronte del clock. Così tutti i flip-flop di un sistema cambiano insieme, al ritmo dello stesso segnale.',
    goals: ['Sensibile al fronte', 'D, JK e T', 'Diagrammi temporali', 'Ingressi asincroni'],
    widgets: [widgetFF],
    example: f2[0], exampleTitle: 'Esempio: leggere un diagramma temporale',
    families: f2,
    theory: `
      <article class="note"><h4>Fronte del clock</h4>
        <p>Il triangolino sul clock nel simbolo indica che il flip-flop cambia sul fronte di salita (con un pallino davanti, su quello di discesa). Tra due fronti l'uscita non cambia, qualunque cosa facciano gli ingressi.</p></article>
      <article class="note"><h4>Tabelle caratteristiche</h4>
        <p><strong>D</strong>: <var>Q</var><sub>n+1</sub> = <var>D</var>. <strong>T</strong>: 0 memoria, 1 commuta. <strong>JK</strong>: 00 memoria, 01 reset, 10 set, 11 commuta.</p>
        <p>Il JK fa tutto: con <var>J</var> = <var>K</var> = <var>T</var> diventa un T, con <var>J</var> = <var>D</var> e <var>K</var> = ${ovl('<var>D</var>')} diventa un D.</p></article>
      <article class="note"><h4>Ingressi asincroni</h4>
        <p>${ovl('PRE')} e ${ovl('CLR')} (di solito attivi bassi) forzano <var>Q</var> a 1 o a 0 subito, senza clock. Si usano per l'inizializzazione.</p></article>`,
  });

  // =====================================================================
  // 3 — Contatori
  // =====================================================================
  const c3 = [];
  c3.push({
    id: 'cnt-ff', title: 'Quanti flip-flop?', level: 1,
    defaults: { N: 10 },
    gen: () => ({ N: pick([5, 6, 7, 10, 12, 16, 24, 32, 60, 100]) }),
    solve: (p) => ({ n: SQ.ffCount(p.N), max: p.N - 1 }),
    text: (p) => `Vuoi un contatore modulo ${p.N} (conta da 0 a ${p.N - 1} e poi ricomincia). Quanti flip-flop servono come minimo? Qual è il numero più alto che compare?`,
    asks: (p, r) => [{ label: 'Flip-flop', unit: '', value: r.n }, { label: 'Stato massimo', unit: '', value: r.max }],
    steps: (p, r) => step(`Con <var>n</var> flip-flop ci sono 2<sup><var>n</var></sup> stati: serve 2<sup><var>n</var></sup> ≥ ${p.N} → <var>n</var> = ${res(r.n)} (2<sup>${r.n}</sup> = ${2 ** r.n})`, r.n > 1 ? `Con ${r.n - 1} ci sarebbero solo ${2 ** (r.n - 1)} stati: troppo pochi.` : '') +
      step(`Il conteggio va da 0 a ${res(r.max)} = ${bitsH(bin(r.max, r.n))}`, 2 ** r.n === p.N ? 'Qui il modulo è una potenza di 2: il contatore ricomincia da solo.' : `Gli stati da ${p.N} a ${2 ** r.n - 1} non devono comparire: bisogna azzerare il contatore quando arriva a ${p.N}.`),
  });
  const caDef = { N: 10, s: 7, n: 5, down: false };
  c3.push({
    id: 'cnt-after', title: 'Dove arriva il contatore', level: 1,
    defaults: caDef,
    gen: () => { const N0 = pick([6, 8, 10, 12, 16]); return { N: N0, s: rand(0, N0 - 1), n: rand(3, 40), down: Math.random() < 0.3 }; },
    solve: (p) => { const k = SQ.ffCount(p.N); const v = SQ.counterAfter(p.N, p.s || 0, p.n, p.down); return { k, v, b: bin(v, k) }; },
    text: (p) => `Un contatore ${p.down ? '<strong>all\'indietro</strong>' : 'in avanti'} modulo ${p.N} parte da ${p.s || 0}. Dopo ${p.n} impulsi di clock in che stato si trova? Scrivilo in decimale e in binario con tutti i bit.`,
    asks: (p, r) => [{ label: 'Stato (decimale)', unit: '', value: r.v }, bitQ(`Stato in binario (${r.k} bit)`, r.b)],
    steps: (p, r) => step(`(${p.s || 0} ${p.down ? '−' : '+'} ${p.n}) mod ${p.N} = ${res(r.v)}`, p.down ? 'All\'indietro, dopo lo 0 il contatore torna a ' + (p.N - 1) + '.' : 'Ogni ' + p.N + ' impulsi il contatore torna dove era: conta solo il resto della divisione.') +
      step(`${r.v} = ${res(bitsH(r.b))}`, `Il modulo ${p.N} richiede ${r.k} flip-flop: scrivi ${r.k} bit.`),
  });
  c3.push({
    id: 'cnt-div', title: 'Divisore di frequenza', level: 2,
    defaults: { mode: 'f', f: 32768, k: 3 },
    gen: () => (Math.random() < 0.5
      ? { mode: 'f', f: pick([1000, 32768, 1e6, 50, 16000]), k: rand(0, 4) }
      : { mode: 'n', fo: pick([1, 2, 50, 100, 125, 1000]), m: rand(3, 15) }),
    solve: (p) => (p.mode === 'f' ? { fo: SQ.divided(p.f, p.k) } : { fi: p.fo * 2 ** p.m }),
    text: (p, r) => (p.mode === 'f'
      ? `Un contatore binario asincrono riceve un clock a ${U(p.f, 'Hz')}. Che frequenza ha l'uscita <var>Q</var><sub>${p.k}</sub>?`
      : `Da un oscillatore a ${U(r.fi, 'Hz')} vuoi ottenere ${U(p.fo, 'Hz')} con una catena di flip-flop T (ognuno divide per 2). Quanti flip-flop servono?`),
    asks: (p, r) => (p.mode === 'f' ? [{ label: `<var>f</var><sub>Q${p.k}</sub>`, unit: 'Hz', value: r.fo }] : [{ label: 'Flip-flop', unit: '', value: p.m }]),
    steps: (p, r) => (p.mode === 'f'
      ? step(`Ogni flip-flop divide per 2: <var>Q</var><sub>0</sub> = <var>f</var>/2, <var>Q</var><sub>1</sub> = <var>f</var>/4, …`, 'Q₀ commuta a ogni impulso, Q₁ ogni due, Q₂ ogni quattro…') + step(`<var>f</var><sub>Q${p.k}</sub> = ${frac(U(p.f, 'Hz'), '2<sup>' + (p.k + 1) + '</sup>')} = ${res(U(r.fo, 'Hz'))}`)
      : step(`${frac(U(r.fi, 'Hz'), U(p.fo, 'Hz'))} = ${N(r.fi / p.fo)} = 2<sup>${p.m}</sup> → ${res(p.m + ' flip-flop')}`, r.fi === 32768 ? 'È proprio quello che succede negli orologi al quarzo: 32 768 Hz diviso 15 volte per 2 dà 1 Hz, il battito dei secondi.' : 'Il rapporto di divisione deve essere una potenza di 2; altrimenti serve un contatore modulo N.')),
  });
  c3.push({
    id: 'cnt-reset', title: 'Contatore modulo N con reset', level: 2,
    defaults: { N: 10 },
    gen: () => ({ N: pick([3, 5, 6, 7, 9, 10, 11, 12, 13, 14]) }),
    solve: (p) => {
      const k = SQ.ffCount(p.N);
      const name = (list) => list.slice().reverse().map((i) => 'Q' + subU(i)).join(' e ');
      const right = name(SQ.resetOutputs(p.N));
      const wr = [SQ.resetOutputs(p.N - 1), p.N + 1 < 2 ** k ? SQ.resetOutputs(p.N + 1) : [], range(k).filter((i) => !((p.N >> i) & 1)), range(k)].filter((x) => x.length).map(name);
      const o = optsFrom(right, wr, () => name(range(k).filter(() => Math.random() < 0.5).concat([rand(0, k - 1)]).filter((x, i, a) => a.indexOf(x) === i).sort()));
      return { k, b: bin(p.N, k), right, ...o };
    },
    text: (p) => `Un contatore asincrono in avanti deve contare modulo ${p.N}. Si azzera con una NAND collegata agli ingressi ${ovl('CLR')} di tutti i flip-flop. Quante uscite servono, quali vanno alla NAND e quale stato compare solo per un istante?`,
    asks: (p, r) => [{ label: 'Flip-flop', unit: '', value: r.k }, h.choice('Ingressi della NAND', r.opts, r.ans), { label: 'Stato transitorio (decimale)', unit: '', value: p.N }],
    steps: (p, r) => step(`2<sup>${r.k}</sup> ≥ ${p.N} → ${res(r.k + ' flip-flop')}`) +
      step(`${p.N} = ${bitsH(r.b)} → alla NAND vanno le uscite a 1: ${res(r.right)}`, `Gli stati sopra ${p.N} non arrivano mai, quindi basta guardare i bit che valgono 1 in ${p.N}: è la prima volta che sono tutti a 1 insieme.`) +
      step(`Quando il contatore arriva a ${p.N} la NAND va a 0 e lo azzera subito: ${res(p.N)} dura pochi nanosecondi.`, 'È il difetto del reset asincrono: lo stato N compare come un impulso brevissimo (glitch). I contatori sincroni con caricamento lo evitano.'),
  });
  const crDef = { N: 6, down: false };
  c3.push({
    id: 'cnt-read', title: 'Leggi il diagramma del contatore', level: 3,
    defaults: crDef,
    gen: () => ({ N: pick([5, 6, 7, 8]), down: Math.random() < 0.35 }),
    solve: (p) => { const n = p.N + 3; const seq = SQ.counterSeq(p.N, 0, n, p.down); return { n, seq }; },
    text: (p) => 'Il diagramma mostra il clock e le uscite <var>Q</var><sub>0</sub> (bit meno significativo), <var>Q</var><sub>1</sub>, <var>Q</var><sub>2</sub> di un contatore. Leggi i numeri nel tempo: conta in avanti o all\'indietro? Qual è il suo modulo?',
    fig: (p, r, sol) => {
      const n = r.n;
      const T = 1 + 2 * n;
      const val = (t) => (t < 1 ? r.seq[0] : r.seq[Math.floor((t - 1) / 2) + 1]);
      const rows = [{ name: 'CLK', ck: true, cls: 'clk', v: range(T).map((t) => (t >= 1 && (t - 1) % 2 === 0 ? 1 : 0)) }];
      [0, 1, 2].forEach((b) => rows.push({ name: sv('Q', b), cls: 'q', v: range(T).map((t) => (val(t) >> b) & 1) }));
      return { svg: timSVG({ ticks: T, edges: range(n).map((k) => 1 + 2 * k), above: sol ? r.seq.map((x, k) => [k ? 2 * k : 0.5, String(x)]) : null, title: 'Uscite di un contatore', rows }) };
    },
    asks: (p, r) => [h.choice('Verso del conteggio', ['in avanti', 'all\'indietro'], p.down ? 1 : 0), { label: 'Modulo', unit: '', value: p.N }],
    hint: () => 'In ogni intervallo leggi le uscite dal basso verso l\'alto, Q₂Q₁Q₀ (Q₂ è il bit più pesante), e trasforma il numero in decimale.',
    steps: (p, r) => step(`Numeri letti: ${r.seq.join(', ')}`, 'Q₀ vale 1, Q₁ vale 2, Q₂ vale 4.') +
      step(`${p.down ? 'Scendono' : 'Salgono'} di uno alla volta → ${res(p.down ? 'all\'indietro' : 'in avanti')}`) +
      step(`Ricomincia dopo ${p.N} stati (da 0 a ${p.N - 1}) → modulo ${res(p.N)}`, p.N === 8 ? 'Con 3 flip-flop e nessun reset il modulo è 2³ = 8.' : `Con 3 flip-flop potrebbe arrivare a 8: qui c'è un reset che lo fa ripartire prima.`),
  });
  c3.push({
    id: 'cnt-mc', title: 'Concetti sui contatori', level: 1,
    ...mc([
      ['In un contatore asincrono (ripple)…', ['il clock entra solo nel primo flip-flop, gli altri sono comandati dall\'uscita del precedente', 'tutti i flip-flop ricevono lo stesso clock', 'non ci sono flip-flop', 'si usa solo il latch SR'], 'Il cambiamento si propaga come un\'onda: da qui il nome ripple.'],
      ['Il difetto del contatore asincrono è…', ['i ritardi si sommano e compaiono stati intermedi', 'consuma troppa corrente', 'non può contare all\'indietro', 'conta solo fino a 2'], 'Ogni flip-flop aggiunge il suo ritardo di propagazione.'],
      ['In un contatore sincrono…', ['tutti i flip-flop ricevono lo stesso clock e cambiano insieme', 'il clock entra solo nel primo', 'non serve il clock', 'le uscite cambiano in momenti diversi'], 'Una rete combinatoria decide quali flip-flop devono commutare.'],
      ['Ogni flip-flop di un contatore binario rispetto al precedente…', ['divide la frequenza per 2', 'moltiplica la frequenza per 2', 'lascia la frequenza invariata', 'inverte la fase'], 'Per questo un contatore è anche un divisore di frequenza.'],
      ['Un contatore modulo 10 si chiama anche…', ['contatore decadico (BCD)', 'registro a scorrimento', 'contatore ad anello', 'multiplexer'], 'Il 74HC90 e il 74HC160 sono contatori decadici integrati.'],
    ]),
  });

  /** Catena di quattro flip-flop T, con i LED delle uscite e la NAND di reset. */
  function counterSVG(st, N, down, flash) {
    const q = range(4).map((k) => (st >> k) & 1);
    const rs = !down && N < 16 ? SQ.resetOutputs(N) : [];
    let s = '';
    const X = (i) => 70 + i * 110;
    s += wire(`M18 120 H${X(0)}`, flash) + '<text class="tl ck" x="18" y="108">CLK</text>';
    range(4).forEach((i) => {
      const x = X(i);
      s += wire(`M${x - 16} 85 H${x}`, 1) + `<text class="tl sm" x="${x - 9}" y="79" text-anchor="middle">1</text>`;
      s += `<rect class="ffbox" x="${x}" y="70" width="60" height="70" rx="3"/><path class="ffck" d="M${x} 111 L${x + 11} 120 L${x} 129"/>`;
      s += `<text class="pn" x="${x + 6}" y="90">T</text><text class="pn" x="${x + 54}" y="90" text-anchor="end">Q</text><text class="pn" x="${x + 54}" y="125" text-anchor="end">${so('Q')}</text>`;
      s += `<text class="pn ty" x="${x + 30}" y="156" text-anchor="middle">FF${i}</text>`;
      if (down) {
        s += wire(`M${x + 60} 85 H${x + 80} V45`, q[i]);
        if (i < 3) s += wire(`M${x + 80} 85 H${x + 95} V120 H${x + 110}`, q[i]) + jdot(x + 80, 85, q[i]);
      } else {
        s += wire(`M${x + 60} 85 H${x + 80} V45`, q[i]);
        if (i < 3) s += wire(`M${x + 60} 120 H${x + 110}`, 1 - q[i]);
      }
      s += ledTop(x + 80, 36, q[i], sv('Q', i)) + `<text class="tl sm w" x="${x + 80}" y="62" text-anchor="start" dx="8">${1 << i}</text>`;
    });
    if (rs.length) {
      const g = App.Gates.gateSVG('NAND', rs.length, 'ansi', 150, 168);
      s += g.svg;
      g.pins.forEach((p, j) => { s += wire(`M120 ${p.y} H${p.x}`, q[rs[j]]) + `<text class="tl sm" x="115" y="${p.y + 4}" text-anchor="end">${sv('Q', rs[j])}</text>`; });
      const allOne = rs.every((k) => q[k]);
      s += wire(`M${g.out.x} ${g.out.y} H260`, !allOne) + `<text class="tl sm" x="266" y="${g.out.y + 4}">→ ${so('CLR')} di tutti i flip-flop</text>`;
    } else {
      s += `<text class="tl sm" x="120" y="196">${down ? 'All\'indietro: il clock del flip-flop successivo viene da Q.' : 'Modulo 16: nessun reset, il contatore ricomincia da solo.'}</text>`;
    }
    return `<svg class="logic" viewBox="0 0 520 ${rs.length ? 236 : 210}" role="img" style="max-width:520px"><title>Contatore asincrono a 4 bit</title>${s}</svg>`;
  }

  function widgetCounter(host) {
    const c = K.widgetCard('Il contatore asincrono', 'Quattro flip-flop T in catena: ognuno divide per 2 la frequenza del precedente');
    let N = 10;
    let down = false;
    let st = 0;
    let hist = [];
    let flash = 0;
    const fig = el('div', 'msi-fig seq-fig');
    const out = el('div', 'forms');
    const chips = el('div', 'seq-chips');
    const tim = el('div', 'msi-fig seq-fig');
    const btns = el('div', 'row');
    btns.innerHTML = '<button type="button" class="btn small">Impulso di clock ↑</button><button type="button" class="btn ghost small" aria-pressed="false">Clock automatico</button><button type="button" class="btn ghost small">Azzera</button>';
    const [bClk, bAuto, bClr] = btns.children;
    const draw = () => {
      fig.innerHTML = counterSVG(st, N, down, flash);
      const k = SQ.ffCount(N);
      out.innerHTML = `<div class="form-row"><span class="label">Conteggio</span><div class="f"><var>Q</var><sub>3</sub><var>Q</var><sub>2</sub><var>Q</var><sub>1</sub><var>Q</var><sub>0</sub> = ${bitsH(bin(st, 4))} = ${res(String(st))}</div><span class="meta">${N < 16 && !down ? `Modulo ${N}: quando arriverebbe a ${N} = ${bitsH(bin(N, 4))}, la NAND vede tutti i suoi ingressi a 1 e azzera. Bastano ${k} flip-flop.` : N < 16 ? `All'indietro modulo ${N}: dopo lo 0 si ricarica ${N - 1} (con un contatore a caricamento parallelo).` : 'Conta da 0 a 15, poi ricomincia.'}</span></div>`;
      chips.innerHTML = '<span class="msi-cap">Sequenza degli stati</span>' + SQ.counterSeq(N, 0, N - 1, down).map((x) => `<span class="seqchip${x === st ? ' on' : ''}">${x}</span>`).join('');
      const n = hist.length;
      if (n < 2) { tim.innerHTML = '<p class="hint">Dai qualche impulso per vedere il diagramma temporale: Q₀ cambia a ogni impulso, Q₁ ogni due, Q₂ ogni quattro.</p>'; return; }
      const T = 2 * n;
      const rows = [{ name: 'CLK', ck: true, cls: 'clk', v: range(T).map((t) => (t % 2 === 0 && t ? 1 : 0)) }];
      range(4).forEach((b) => rows.push({ name: sv('Q', b), cls: 'q', v: range(T).map((t) => (hist[Math.floor(t / 2)] >> b) & 1) }));
      tim.innerHTML = timSVG({ ticks: T, edges: range(n - 1).map((k2) => 2 * k2 + 2), above: hist.map((x, k2) => [2 * k2 + 1, String(x)]), rows, title: 'Diagramma temporale del contatore' });
    };
    const clock = () => {
      st = SQ.counterAfter(N, st, 1, down);
      hist.push(st);
      if (hist.length > 17) hist = hist.slice(-17);
      flash = 1;
      draw();
      setTimeout(() => { flash = 0; if (c.isConnected) fig.innerHTML = counterSVG(st, N, down, 0); }, 260);
    };
    const restart = () => { st = 0; hist = [0]; draw(); };
    const sl = K.sliders(c, [{ id: 'N', label: 'Modulo <var>N</var>', min: 2, max: 16, step: 1, value: 10, sig: 2 }], (v) => { N = Math.round(v.N); restart(); });
    const seg = segOf([['up', 'In avanti'], ['down', 'All\'indietro']], 'up', (k) => { down = k === 'down'; restart(); });
    bClk.addEventListener('click', clock);
    bClr.addEventListener('click', restart);
    autoClock(c, bAuto, clock, 700);
    c.append(seg, btns, fig, out, chips, tim);
    host.appendChild(c);
    N = Math.round(sl.values.N);
    restart();
  }

  lessons.push({
    id: 'contatori', num: 3, short: 'Contatori', title: 'Contatori e divisori di frequenza',
    intro: 'Metti in fila dei flip-flop T: il primo commuta a ogni impulso, il secondo ogni due, il terzo ogni quattro. Le uscite, lette insieme, contano gli impulsi in binario.',
    goals: ['Contatore asincrono', 'Modulo N e reset', 'Divisore di frequenza', 'Asincrono e sincrono'],
    widgets: [widgetCounter],
    example: c3[1], exampleTitle: 'Esempio: dove arriva il contatore',
    families: c3,
    theory: `
      <article class="note"><h4>Contatore asincrono</h4>
        <p>Flip-flop T con <var>T</var> = 1: il clock entra nel primo, ogni altro è comandato dall'uscita del precedente. <var>n</var> flip-flop contano da 0 a 2<sup><var>n</var></sup> − 1.</p>
        <div class="eq"><span><var>f</var><sub>Q<var>k</var></sub> = ${frac('<var>f</var><sub>clock</sub>', '2<sup><var>k</var>+1</sup>')}</span></div></article>
      <article class="note"><h4>Modulo N</h4>
        <p>Servono <var>n</var> flip-flop con 2<sup><var>n</var></sup> ≥ <var>N</var>. Una NAND collegata alle uscite che valgono 1 nel numero <var>N</var> azzera tutto quando il conteggio arriva a <var>N</var>.</p></article>
      <article class="note"><h4>Sincrono</h4>
        <p>Tutti i flip-flop hanno lo stesso clock; una rete combinatoria decide quali commutano. Niente ritardi accumulati e niente stati spuri. Esempi integrati: 74HC161 (binario), 74HC160 (decadico).</p></article>`,
  });

  // =====================================================================
  // 4 — Registri a scorrimento
  // =====================================================================
  const r4 = [];
  const shDef = { reg: [1, 0, 1, 1], ins: [0, 1, 1] };
  r4.push({
    id: 'shr-run', title: 'Fai scorrere i bit', level: 1,
    defaults: shDef,
    gen: () => ({ reg: range(4).map(() => rand(0, 1)), ins: range(rand(2, 4)).map(() => rand(0, 1)) }),
    solve: (p) => { const r = SQ.shiftRun(p.reg, p.ins); return { ...r, b: r.reg.join(''), o: r.outs.join('') }; },
    text: (p) => `Un registro a scorrimento a 4 bit contiene <var>Q</var><sub>0</sub><var>Q</var><sub>1</sub><var>Q</var><sub>2</sub><var>Q</var><sub>3</sub> = ${bitsH(p.reg.join(''))}. A ogni clock il bit seriale entra in <var>Q</var><sub>0</sub> e tutto scorre verso <var>Q</var><sub>3</sub>; il bit di <var>Q</var><sub>3</sub> esce. Entrano, in ordine, i bit ${bitsH(p.ins.join(', '))}. Che cosa contiene alla fine? Quali bit sono usciti, in ordine?`,
    asks: (p, r) => [bitQ('Contenuto <var>Q</var><sub>0</sub>…<var>Q</var><sub>3</sub>', r.b), bitQ('Bit usciti', r.o)],
    steps: (p, r) => {
      let reg = p.reg.slice();
      let s = '';
      p.ins.forEach((b, k) => { const x = SQ.shift(reg, b); s += step(`Clock ${k + 1}: entra ${b} → ${bitsH(x.reg.join(''))}, esce ${x.out}`); reg = x.reg; });
      return s + step(`Contenuto ${res(bitsH(r.b))}, usciti ${res(bitsH(r.o))}`, 'Ogni flip-flop D copia il valore del vicino: è una catena di D con lo stesso clock.');
    },
  });
  const mulDef = { x: 22, k: 2, left: true };
  r4.push({
    id: 'shr-mul', title: 'Scorrere vuol dire moltiplicare', level: 2,
    defaults: mulDef,
    gen: () => { const left = Math.random() < 0.55; const k = rand(1, 3); const big = Math.random() < 0.25; return { left, k, x: left ? (big ? rand(64, 255) : rand(3, (256 >> k) - 1)) : rand(10, 255) }; },
    solve: (p) => { const v = p.left ? (p.x << p.k) & 255 : p.x >> p.k; const lost = p.left ? (p.x << p.k) > 255 : p.x % (1 << p.k) !== 0; return { v, lost }; },
    text: (p) => `Un registro a 8 bit contiene ${bitsH(bin(p.x, 8))} (= ${p.x}). Lo fai scorrere di ${p.k} ${p.k > 1 ? 'posizioni' : 'posizione'} verso ${p.left ? 'sinistra (da destra entrano zeri)' : 'destra (da sinistra entrano zeri)'}. Quanto vale il numero alla fine?`,
    asks: (p, r) => [{ label: 'Valore finale', unit: '', value: r.v }],
    steps: (p, r) => step(`${bitsH(bin(p.x, 8))} → ${bitsH(bin(r.v, 8))} = ${res(r.v)}`, p.left ? `Ogni posizione a sinistra moltiplica per 2: ${p.x} · 2<sup>${p.k}</sup> = ${p.x << p.k}.` : `Ogni posizione a destra divide per 2 scartando il resto: ${p.x} / 2<sup>${p.k}</sup> = ${N(p.x / (1 << p.k), 4)} → parte intera.`) +
      (r.lost ? step(p.left ? `Attenzione: ${p.x << p.k} non sta in 8 bit, i bit usciti a sinistra si perdono (${p.x << p.k} − 256·${Math.floor((p.x << p.k) / 256)} = ${r.v}).` : 'I bit usciti a destra si perdono: è il resto della divisione.', p.left ? 'È un overflow: il registro ha una capacità limitata.' : 'Per questo lo scorrimento a destra è una divisione intera.') : ''),
  });
  const ringDef = { n: 4, j: false, k: 6 };
  r4.push({
    id: 'ring', title: 'Contatore ad anello e Johnson', level: 2,
    defaults: ringDef,
    gen: () => { const n = pick([3, 4, 5, 6]); const j = Math.random() < 0.5; return { n, j, k: rand(2, 2 * n + 3) }; },
    solve: (p) => { const seq = SQ.ringSeq(p.n, p.k, p.j); return { seq, b: seq[p.k].join(''), states: SQ.ringStates(p.n, p.j) }; },
    text: (p) => `Un contatore ${p.j ? 'Johnson (l\'uscita dell\'ultimo flip-flop torna nel primo <strong>negata</strong>)' : 'ad anello (l\'uscita dell\'ultimo flip-flop torna nel primo)'} ha ${p.n} flip-flop e parte da ${bitsH(p.j ? '0'.repeat(p.n) : '1' + '0'.repeat(p.n - 1))}. Quanti stati diversi attraversa? Che cosa contiene dopo ${p.k} clock?`,
    asks: (p, r) => [{ label: 'Stati diversi', unit: '', value: r.states }, bitQ(`Contenuto dopo ${p.k} clock`, r.b)],
    steps: (p, r) => step(p.j ? `Johnson: 2 · ${p.n} = ${res(r.states)} stati` : `Anello: un solo 1 che gira tra ${p.n} posizioni → ${res(r.states)} stati`, p.j ? 'Si riempie di 1 da sinistra, poi di 0: il doppio degli stati dell\'anello, con gli stessi flip-flop.' : 'Ogni stato ha un solo 1: non serve un decoder per sapere a che punto è.') +
      step(`Sequenza: ${r.seq.slice(0, Math.min(r.seq.length, r.states + 1)).map((x) => bitsH(x.join(''))).join(' → ')}${p.k > r.states ? ' …' : ''}`) +
      step(`Dopo ${p.k} clock: ${p.k} mod ${r.states} = ${p.k % r.states} → ${res(bitsH(r.b))}`),
  });
  r4.push({
    id: 'shr-uart', title: 'Trasmissione seriale', level: 3,
    defaults: { B: 10, baud: 9600, fr: 10 },
    gen: () => ({ B: pick([1, 2, 4, 10, 20, 64, 100]), baud: pick([1200, 2400, 9600, 19200, 115200]), fr: pick([10, 10, 11]) }),
    solve: (p) => { const bits = p.B * p.fr; return { bits, t: bits / p.baud }; },
    text: (p) => `Una porta seriale (UART) trasmette ${p.B} byte a ${N(p.baud)} bit/s. Ogni byte viaggia dentro un pacchetto con 1 bit di start, 8 bit di dati${p.fr === 11 ? ', 1 bit di parità' : ''} e 1 bit di stop. Quanti bit passano sul filo e quanto tempo serve?`,
    asks: (p, r) => [{ label: 'Bit trasmessi', unit: '', value: r.bits }, r.t >= 1 ? { label: 'Tempo', unit: 's', value: r.t } : { label: 'Tempo', unit: 'ms', value: r.t * 1000 }],
    hint: () => 'Attenzione: per ogni byte non viaggiano 8 bit.',
    steps: (p, r) => step(`Ogni byte: 1 + 8${p.fr === 11 ? ' + 1' : ''} + 1 = ${p.fr} bit → ${p.B} · ${p.fr} = ${res(r.bits)} bit`, 'Start e stop servono al ricevitore per capire dove comincia e finisce ogni byte, perché non c\'è un filo di clock.') +
      step(`<var>t</var> = ${frac(r.bits, N(p.baud) + ' bit/s')} = ${res(U(r.t, 's'))}`, 'In trasmissione un registro PISO (ingresso parallelo, uscita seriale) spinge fuori un bit a ogni clock; in ricezione un registro SIPO li raccoglie e li rende in parallelo. Il bit meno significativo parte per primo.'),
  });
  r4.push({
    id: 'shr-mc', title: 'Concetti sui registri', level: 1,
    ...mc([
      ['Un registro a scorrimento SIPO…', ['riceve i bit uno alla volta e li rende tutti insieme in parallelo', 'riceve in parallelo e trasmette in parallelo', 'non ha clock', 'conta gli impulsi'], 'Serial In, Parallel Out: è il ricevitore di una linea seriale.'],
      ['Per caricare 8 bit in seriale in un registro SIPO servono…', ['8 colpi di clock', '1 colpo di clock', '3 colpi di clock', '256 colpi di clock'], 'Un bit per colpo.'],
      ['In un registro a scorrimento ogni cella è…', ['un flip-flop D', 'un latch SR senza abilitazione', 'una porta XOR', 'un multiplexer'], 'Il D di ogni cella è collegato alla Q della cella precedente.'],
      ['Un contatore Johnson a 4 flip-flop ha…', ['8 stati', '4 stati', '16 stati', '2 stati'], '2n stati con n flip-flop.'],
      ['Lo scorrimento di un numero binario di una posizione verso sinistra…', ['lo moltiplica per 2', 'lo divide per 2', 'lo nega', 'non lo cambia'], 'Come aggiungere uno zero in fondo a un numero decimale lo moltiplica per 10.'],
    ]),
  });

  /** Registro a 4 flip-flop D in catena, con ingresso seriale o retroazione (anello, Johnson). */
  function shiftSVG(reg, mode, sin, flash) {
    let s = '';
    const X = (i) => 80 + i * 100;
    const fb = mode === 'ring' ? reg[3] : mode === 'johnson' ? 1 - reg[3] : sin;
    if (mode === 'sipo') s += tog('in', 'IN', 'Ingresso seriale', 36, 75, sin) + wire(`M66 75 H${X(0)}`, sin);
    else {
      const y = mode === 'ring' ? 75 : 105;
      s += wire(`M${X(3) + 56} ${y} H470 V160 H40 V75 H${X(0)}`, fb) + (mode === 'ring' ? jdot(470, 75, fb) : '');
      s += `<text class="tl sm" x="255" y="176" text-anchor="middle">${mode === 'ring' ? 'Q₃ torna in D₀' : 'Q̅₃ torna in D₀ (Johnson)'}</text>`;
    }
    s += wire(`M18 140 H${X(3) - 12}`, flash) + '<text class="tl ck" x="18" y="132">CLK</text>';
    range(4).forEach((i) => {
      const x = X(i);
      s += wire(`M${x - 12} 140 V105 H${x}`, flash) + jdot(x - 12, 140, flash);
      s += `<rect class="ffbox" x="${x}" y="60" width="56" height="60" rx="3"/><path class="ffck" d="M${x} 96 L${x + 10} 105 L${x} 114"/>`;
      s += `<text class="pn" x="${x + 6}" y="80">D</text><text class="pn" x="${x + 50}" y="80" text-anchor="end">Q</text>`;
      if (i === 3) s += `<text class="pn" x="${x + 50}" y="110" text-anchor="end">${so('Q')}</text>`;
      const end = i < 3 ? X(i + 1) : mode === 'johnson' ? x + 72 : 470;
      s += wire(`M${x + 56} 75 H${end}`, reg[i]) + wire(`M${x + 72} 75 V43`, reg[i]) + (end > x + 72 ? jdot(x + 72, 75, reg[i]) : '');
      s += ledTop(x + 72, 34, reg[i], sv('Q', i));
    });
    if (mode === 'johnson') s += wire(`M${X(3) + 56} 105 H470`, 1 - reg[3]);
    if (mode === 'sipo') s += '<text class="tl sm" x="476" y="79">OUT</text>';
    return `<svg class="logic" viewBox="0 0 520 ${mode === 'sipo' ? 155 : 185}" role="img" style="max-width:520px"><title>Registro a scorrimento a 4 bit</title>${s}</svg>`;
  }

  function widgetShift(host) {
    const c = K.widgetCard('Il registro a scorrimento', 'Quattro flip-flop D in catena: a ogni clock ogni bit passa alla cella dopo');
    let mode = 'sipo';
    let reg = [0, 0, 0, 0];
    let sin = 1;
    let hist = [];
    let flash = 0;
    let queue = [];
    const word = [1, 0, 1, 1];
    const fig = el('div', 'msi-fig seq-fig');
    const out = el('div', 'forms');
    const tim = el('div', 'msi-fig seq-fig');
    const btns = el('div', 'row');
    btns.innerHTML = '<button type="button" class="btn small">Clock ↑</button><button type="button" class="btn ghost small" aria-pressed="false">Clock automatico</button><button type="button" class="btn ghost small">Azzera</button>';
    const [bClk, bAuto, bClr] = btns.children;
    const send = el('div', 'msi-ctl');
    const bSend = el('button', 'btn ghost small');
    bSend.type = 'button';
    bSend.textContent = 'Invia la parola in seriale';
    send.append(group('Parola da inviare', bitButtons(['4°', '3°', '2°', '1°'], word, () => {})), bSend);
    const draw = () => {
      fig.innerHTML = shiftSVG(reg, mode, sin, flash);
      const msg = mode === 'sipo'
        ? (queue.length ? `Sto inviando la parola: mancano ${queue.length} bit. Parte per primo il bit più a destra (il meno significativo), come in una UART.` : 'Imposta IN e dai un colpo di clock: il bit entra in Q₀ e gli altri scorrono a destra. Dopo 4 clock la parola inviata in seriale è disponibile in parallelo su Q₀…Q₃.')
        : mode === 'ring' ? `Anello: l'1 gira tra le ${4} celle, ${SQ.ringStates(4)} stati. Ogni uscita resta a 1 per un clock su quattro: comanda 4 cose a turno senza decoder.`
          : `Johnson: Q̅₃ torna in D₀, ${SQ.ringStates(4, true)} stati con 4 flip-flop. Genera anche onde quadre sfasate tra loro.`;
      out.innerHTML = `<div class="form-row"><span class="label">Contenuto</span><div class="f"><var>Q</var><sub>0</sub>…<var>Q</var><sub>3</sub> = ${res(bitsH(reg.join('')))}</div><span class="meta">${msg}</span></div>`;
      const n = hist.length;
      if (n < 2) { tim.innerHTML = ''; return; }
      const T = 2 * n;
      const rows = [{ name: 'CLK', ck: true, cls: 'clk', v: range(T).map((t) => (t % 2 === 0 && t ? 1 : 0)) }];
      if (mode === 'sipo') rows.push({ name: 'IN', ck: true, cls: 'in', v: range(T).map((t) => { const k = Math.floor(t / 2); return t % 2 ? hist[k].sin : hist[Math.max(0, k - 1)].sin; }) });
      range(4).forEach((b) => rows.push({ name: sv('Q', b), cls: 'q', v: range(T).map((t) => hist[Math.floor(t / 2)].reg[b]) }));
      tim.innerHTML = timSVG({ ticks: T, edges: range(n - 1).map((k) => 2 * k + 2), rows, title: 'Diagramma temporale del registro' });
    };
    const record = () => { hist.push({ reg: reg.slice(), sin }); if (hist.length > 12) hist = hist.slice(-12); };
    const clock = () => {
      if (mode === 'sipo' && queue.length) sin = queue.shift();
      const inBit = mode === 'ring' ? reg[3] : mode === 'johnson' ? 1 - reg[3] : sin;
      if (hist.length) hist[hist.length - 1].sin = sin;
      reg = SQ.shift(reg, inBit).reg;
      record();
      flash = 1;
      draw();
      setTimeout(() => { flash = 0; if (c.isConnected) fig.innerHTML = shiftSVG(reg, mode, sin, 0); }, 260);
    };
    const restart = () => { reg = mode === 'ring' ? [1, 0, 0, 0] : [0, 0, 0, 0]; queue = []; hist = []; record(); draw(); send.hidden = mode !== 'sipo'; };
    bindSvgToggles(fig, () => { sin = 1 - sin; if (hist.length) hist[hist.length - 1].sin = sin; draw(); });
    const seg = segOf([['sipo', 'Ingresso seriale'], ['ring', 'Anello'], ['johnson', 'Johnson']], mode, (k) => { mode = k; restart(); });
    bClk.addEventListener('click', clock);
    bClr.addEventListener('click', restart);
    const stopAuto = autoClock(c, bAuto, clock, 800);
    bSend.addEventListener('click', () => {
      stopAuto();
      queue = word.slice().reverse();
      let k = 0;
      const t = setInterval(() => { if (!c.isConnected || k++ >= 4 || mode !== 'sipo') { clearInterval(t); return; } clock(); }, App.reducedMotion ? 900 : 550);
    });
    c.append(seg, btns, send, fig, out, tim);
    host.appendChild(c);
    restart();
  }

  lessons.push({
    id: 'registri', num: 4, short: 'Registri', title: 'Registri a scorrimento',
    intro: 'Una fila di flip-flop D con lo stesso clock, ciascuno collegato al precedente: a ogni colpo i bit avanzano di un posto. Serve a trasformare dati seriali in paralleli e viceversa, a moltiplicare per 2, a costruire contatori speciali.',
    goals: ['SIPO, PISO, SISO, PIPO', 'Scorrimento = ×2 o ÷2', 'Anello e Johnson', 'Trasmissione seriale'],
    widgets: [widgetShift],
    example: r4[0], exampleTitle: 'Esempio: quattro bit in fila',
    families: r4,
    theory: `
      <article class="note"><h4>Come funziona</h4>
        <p>Ogni cella è un flip-flop D con <var>D</var><sub><var>k</var></sub> = <var>Q</var><sub><var>k</var>−1</sub>. Al fronte del clock tutte le celle copiano la vicina nello stesso istante, quindi ogni bit avanza di un solo posto.</p></article>
      <article class="note"><h4>I quattro tipi</h4>
        <p>SISO (ritardo di <var>n</var> clock), SIPO (da seriale a parallelo, il ricevitore), PISO (da parallelo a seriale, il trasmettitore), PIPO (memoria di una parola). Esempi integrati: 74HC164 (SIPO), 74HC165 (PISO), 74HC595 (SIPO con latch d'uscita).</p></article>
      <article class="note"><h4>Contatori ad anello e Johnson</h4>
        <p>Riportando l'ultima uscita nel primo ingresso: <var>n</var> stati (anello), oppure 2<var>n</var> stati se la si riporta negata (Johnson).</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'seq', year: '4', yearLabel: '4ª', title: 'Logica sequenziale', route: 'seq-latch', lessonWord: 'Lezione',
    desc: 'Latch SR e D, flip-flop D, JK e T con i diagrammi temporali, contatori asincroni e modulo N, divisori di frequenza, registri a scorrimento, anello e Johnson.',
    lessons,
  });
})();
