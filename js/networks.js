/* Scheda 3 — Serie, parallelo, reti miste, partitori e principi di Kirchhoff */
(function () {
  'use strict';
  const App = window.App;
  const $ = (id) => document.getElementById(id);
  const si = (x, u) => App.si(x, u);
  const SUB = ['₁', '₂', '₃'];

  const state = { config: 'misto', E: 12, R: [100, 220, 330], three: true };

  function solve(cfg, E, R, three) {
    const Rs = cfg === 'misto' || three ? R.slice(0, 3) : R.slice(0, 2);
    const out = { cfg, E, Rs, V: [], I: [] };
    if (cfg === 'serie') {
      out.Req = Rs.reduce((a, b) => a + b, 0);
      out.It = E / out.Req;
      Rs.forEach((r, k) => { out.I[k] = out.It; out.V[k] = r * out.It; });
    } else if (cfg === 'parallelo') {
      out.Req = 1 / Rs.reduce((a, r) => a + 1 / r, 0);
      Rs.forEach((r, k) => { out.V[k] = E; out.I[k] = E / r; });
      out.It = E / out.Req;
    } else {
      const [R1, R2, R3] = Rs;
      out.R23 = (R2 * R3) / (R2 + R3);
      out.Req = R1 + out.R23;
      out.It = E / out.Req;
      out.V[0] = R1 * out.It;
      out.I[0] = out.It;
      out.V23 = out.R23 * out.It;
      out.V[1] = out.V[2] = out.V23;
      out.I[1] = out.V23 / R2;
      out.I[2] = out.V23 / R3;
    }
    return out;
  }

  // ---------- Disegno ----------
  function hRes(cx, y, k, sol, above) {
    return `<rect class="comp" x="${cx - 30}" y="${y - 10}" width="60" height="20"/>
      <text class="txt" x="${cx}" y="${y - 20}" text-anchor="middle"><tspan class="var" style="font-size:17px">R</tspan>${SUB[k]} = ${si(sol.Rs[k], 'Ω')}</text>
      <text class="val" x="${cx}" y="${y + 29}" text-anchor="middle">V${SUB[k]} = ${si(sol.V[k], 'V')}</text>` + (above || '');
  }
  function vRes(x, cy, k, sol) {
    return `<rect class="comp" x="${x - 10}" y="${cy - 30}" width="20" height="60"/>
      <text class="txt" x="${x + 17}" y="${cy - 12}"><tspan class="var" style="font-size:17px">R</tspan>${SUB[k]} = ${si(sol.Rs[k], 'Ω')}</text>
      <text class="val" x="${x + 17}" y="${cy + 6}">V${SUB[k]} = ${si(sol.V[k], 'V')}</text>
      <text class="val" x="${x + 17}" y="${cy + 22}">I${SUB[k]} = ${si(sol.I[k], 'A')}</text>`;
  }
  function gen(sol) {
    return `<path class="wire" d="M60 40 V113 M60 157 V230"/>
      <circle class="comp" cx="60" cy="135" r="22"/>
      <text class="txt" x="60" y="132" text-anchor="middle">+</text>
      <text class="txt" x="60" y="151" text-anchor="middle">−</text>
      <text class="var" x="30" y="128" text-anchor="end" style="font-size:18px">E</text>
      <text class="val" x="30" y="146" text-anchor="end">${si(sol.E, 'V')}</text>
      <line class="arrow" x1="44" y1="100" x2="44" y2="72"/><path class="arrowhead" d="M39.5 72 L44 63 L48.5 72 Z"/>
      <text class="val" x="70" y="92">I = ${si(sol.It, 'A')}</text>`;
  }
  const dot = (x, y) => `<circle class="dot" cx="${x}" cy="${y}" r="4"/>`;

  function draw(sol) {
    const n = sol.Rs.length;
    let s = gen(sol);
    if (sol.cfg === 'serie') {
      if (n === 3) {
        s += `<path class="wire" d="M60 40 H160 M220 40 H310 M370 40 H460 V105 M460 165 V230 H60"/>`;
        s += hRes(190, 40, 0, sol) + hRes(340, 40, 1, sol) + vResSerie(460, 135, 2, sol);
      } else {
        s += `<path class="wire" d="M60 40 H230 M290 40 H460 V105 M460 165 V230 H60"/>`;
        s += hRes(260, 40, 0, sol) + vResSerie(460, 135, 1, sol);
      }
    } else if (sol.cfg === 'parallelo') {
      const xs = n === 3 ? [200, 320, 440] : [240, 400];
      const last = xs[xs.length - 1];
      s += `<path class="wire" d="M60 40 H${last} M60 230 H${last}"/>`;
      xs.forEach((x, k) => {
        s += `<path class="wire" d="M${x} 40 V105 M${x} 165 V230"/>` + vRes(x, 135, k, sol);
        if (k < xs.length - 1) s += dot(x, 40) + dot(x, 230);
      });
      s += `<text class="small" x="${last}" y="248" text-anchor="end">stessa tensione su ogni ramo: V = E</text>`;
    } else {
      s += `<path class="wire" d="M60 40 H150 M210 40 H440 M300 40 V105 M300 165 V230 M440 40 V105 M440 165 V230 H60"/>`;
      s += hRes(180, 40, 0, sol) + vRes(300, 135, 1, sol) + vRes(440, 135, 2, sol) + dot(300, 40) + dot(300, 230);
      s += `<text class="small" x="300" y="30" text-anchor="middle">nodo A</text><text class="small" x="300" y="248" text-anchor="middle">nodo B</text>`;
    }
    $('net-svg').innerHTML = '<title>Schema della rete: ' + sol.cfg + '</title>' + s;
  }
  function vResSerie(x, cy, k, sol) {
    return `<rect class="comp" x="${x - 10}" y="${cy - 30}" width="20" height="60"/>
      <text class="txt" x="${x - 17}" y="${cy - 4}" text-anchor="end"><tspan class="var" style="font-size:17px">R</tspan>${SUB[k]} = ${si(sol.Rs[k], 'Ω')}</text>
      <text class="val" x="${x - 17}" y="${cy + 14}" text-anchor="end">V${SUB[k]} = ${si(sol.V[k], 'V')}</text>`;
  }

  // ---------- Passaggi ----------
  const R = (k) => `<var>R</var><sub>${k + 1}</sub>`;
  const V = (k) => `<var>V</var><sub>${k + 1}</sub>`;
  const I = (k) => `<var>I</var><sub>${k + 1}</sub>`;
  const li = (calc, why) => `<li><span class="calc">${calc}<span class="why">${why}</span></span></li>`;

  function steps(sol) {
    const n = sol.Rs.length;
    const idx = [...Array(n).keys()];
    let h = '';
    if (sol.cfg === 'serie') {
      h += li(`<var>R</var><sub>eq</sub> = ${idx.map(R).join(' + ')} = ${idx.map((k) => si(sol.Rs[k], 'Ω')).join(' + ')} = <span class="res">${si(sol.Req, 'Ω')}</span>`,
        'In serie le resistenze si sommano: la resistenza equivalente è più grande della più grande.');
      h += li(`<var>I</var> = <span class="frac"><span><var>E</var></span><span><var>R</var><sub>eq</sub></span></span> = <span class="frac"><span>${si(sol.E, 'V')}</span><span>${si(sol.Req, 'Ω')}</span></span> = <span class="res">${si(sol.It, 'A')}</span>`,
        'Una sola corrente attraversa tutti i resistori in serie.');
      idx.forEach((k) => {
        h += li(`${V(k)} = <var>E</var> · <span class="frac"><span>${R(k)}</span><span><var>R</var><sub>eq</sub></span></span> = ${si(sol.E, 'V')} · <span class="frac"><span>${si(sol.Rs[k], 'Ω')}</span><span>${si(sol.Req, 'Ω')}</span></span> = <span class="res">${si(sol.V[k], 'V')}</span>`,
          k === 0 ? 'Partitore di tensione: ogni resistore prende una fetta di <var>E</var> proporzionale alla sua resistenza. Equivale a ' + R(k) + '·<var>I</var>.' : 'Stesso partitore per ' + R(k) + '.');
      });
    } else if (sol.cfg === 'parallelo') {
      h += li(`<span class="frac"><span>1</span><span><var>R</var><sub>eq</sub></span></span> = ${idx.map((k) => '<span class="frac"><span>1</span><span>' + R(k) + '</span></span>').join(' + ')} = ${idx.map((k) => App.num(1 / sol.Rs[k], 3)).join(' + ')} = ${App.num(1 / sol.Req, 3)} S`,
        'In parallelo si sommano le conduttanze <var>G</var> = 1/<var>R</var>.');
      h += li(`<var>R</var><sub>eq</sub> = <span class="res">${si(sol.Req, 'Ω')}</span>`,
        'È più piccola della resistenza più piccola: ogni ramo in più è una strada in più per la corrente.' + (n === 2 ? ' Con due rami: <var>R</var><sub>eq</sub> = <var>R</var><sub>1</sub>·<var>R</var><sub>2</sub> / (<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>).' : ''));
      idx.forEach((k) => {
        h += li(`${I(k)} = <span class="frac"><span><var>E</var></span><span>${R(k)}</span></span> = <span class="frac"><span>${si(sol.E, 'V')}</span><span>${si(sol.Rs[k], 'Ω')}</span></span> = <span class="res">${si(sol.I[k], 'A')}</span>`,
          k === 0 ? 'Ogni ramo ha ai capi la stessa tensione <var>E</var>, quindi ciascuna corrente segue la legge di Ohm.' : 'Stessa tensione, resistenza diversa, corrente diversa.');
      });
      h += li(`<var>I</var> = ${idx.map(I).join(' + ')} = <span class="res">${si(sol.It, 'A')}</span> = <span class="frac"><span><var>E</var></span><span><var>R</var><sub>eq</sub></span></span> <span class="check">✓</span>`,
        'La corrente totale si divide tra i rami (e si ricompone nel nodo di uscita).');
    } else {
      const [R1, R2, R3] = sol.Rs;
      h += li(`<var>R</var><sub>23</sub> = <span class="frac"><span>${R(1)} · ${R(2)}</span><span>${R(1)} + ${R(2)}</span></span> = <span class="frac"><span>${si(R2, 'Ω')} · ${si(R3, 'Ω')}</span><span>${si(R2, 'Ω')} + ${si(R3, 'Ω')}</span></span> = <span class="res">${si(sol.R23, 'Ω')}</span>`,
        'Passo 1: riduci il parallelo tra <var>R</var><sub>2</sub> e <var>R</var><sub>3</sub> (prodotto diviso somma).');
      h += li(`<var>R</var><sub>eq</sub> = ${R(0)} + <var>R</var><sub>23</sub> = ${si(R1, 'Ω')} + ${si(sol.R23, 'Ω')} = <span class="res">${si(sol.Req, 'Ω')}</span>`,
        'Passo 2: ora <var>R</var><sub>1</sub> e <var>R</var><sub>23</sub> sono in serie.');
      h += li(`<var>I</var> = <span class="frac"><span><var>E</var></span><span><var>R</var><sub>eq</sub></span></span> = <span class="frac"><span>${si(sol.E, 'V')}</span><span>${si(sol.Req, 'Ω')}</span></span> = <span class="res">${si(sol.It, 'A')}</span>`,
        'Passo 3: corrente erogata dal generatore, che attraversa anche <var>R</var><sub>1</sub>.');
      h += li(`${V(0)} = ${R(0)} · <var>I</var> = <span class="res">${si(sol.V[0], 'V')}</span>;   <var>V</var><sub>AB</sub> = <var>R</var><sub>23</sub> · <var>I</var> = <span class="res">${si(sol.V23, 'V')}</span>`,
        'Passo 4: torna indietro sullo schema originale e calcola le tensioni.');
      h += li(`${I(1)} = <var>I</var> · <span class="frac"><span>${R(2)}</span><span>${R(1)} + ${R(2)}</span></span> = <span class="res">${si(sol.I[1], 'A')}</span>;   ${I(2)} = <var>I</var> · <span class="frac"><span>${R(1)}</span><span>${R(1)} + ${R(2)}</span></span> = <span class="res">${si(sol.I[2], 'A')}</span>`,
        'Passo 5: partitore di corrente. Attenzione: al numeratore va la resistenza dell\'altro ramo, perché la corrente preferisce la strada più facile.');
    }
    $('net-steps').innerHTML = h;
  }

  function kirchhoff(sol) {
    const box = $('net-kirchhoff');
    const n = sol.Rs.length;
    const idx = [...Array(n).keys()];
    let lkc, lkt;
    if (sol.cfg === 'serie') {
      lkc = `In una serie non ci sono nodi con più di due rami: la stessa <var>I</var> = ${si(sol.It, 'A')} attraversa tutto.`;
      lkt = `<var>E</var> = ${idx.map(V).join(' + ')} → ${si(sol.E, 'V')} = ${idx.map((k) => si(sol.V[k], 'V')).join(' + ')} <span class="check">✓</span>`;
    } else if (sol.cfg === 'parallelo') {
      lkc = `Nodo superiore: <var>I</var> = ${idx.map(I).join(' + ')} → ${si(sol.It, 'A')} = ${idx.map((k) => si(sol.I[k], 'A')).join(' + ')} <span class="check">✓</span>`;
      lkt = `Maglia generatore–${R(0)}: <var>E</var> − ${V(0)} = 0 → ${si(sol.E, 'V')} − ${si(sol.V[0], 'V')} = 0 <span class="check">✓</span>`;
    } else {
      lkc = `Nodo A: ${I(0)} = ${I(1)} + ${I(2)} → ${si(sol.I[0], 'A')} = ${si(sol.I[1], 'A')} + ${si(sol.I[2], 'A')} <span class="check">✓</span>`;
      lkt = `Maglia esterna: <var>E</var> − ${V(0)} − ${V(2)} = 0 → ${si(sol.E, 'V')} − ${si(sol.V[0], 'V')} − ${si(sol.V[2], 'V')} = 0 <span class="check">✓</span><br>
        Maglia interna ${R(1)}–${R(2)}: ${V(1)} − ${V(2)} = 0 → rami in parallelo, stessa tensione <span class="check">✓</span>`;
    }
    const Ptot = sol.E * sol.It;
    const Psum = idx.reduce((a, k) => a + sol.V[k] * sol.I[k], 0);
    box.innerHTML = `
      <div class="form-row"><span class="label">1° principio (LKC, ai nodi)</span><div class="f">${lkc}</div></div>
      <div class="form-row"><span class="label">2° principio (LKT, alle maglie)</span><div class="f">${lkt}</div></div>
      <div class="form-row"><span class="label">Bilancio delle potenze</span><div class="f"><var>P</var><sub>gen</sub> = <var>E</var>·<var>I</var> = ${si(Ptot, 'W')} = ${idx.map((k) => si(sol.V[k] * sol.I[k], 'W')).join(' + ')} = ${si(Psum, 'W')} <span class="check">✓</span></div></div>`;
  }

  function render() {
    const sol = solve(state.config, state.E, state.R, state.three);
    draw(sol);
    steps(sol);
    kirchhoff(sol);
    $('net-Req').textContent = si(sol.Req, 'Ω');
    $('net-It').textContent = si(sol.It, 'A');
    $('net-r3-wrap').hidden = state.config === 'misto';
    $('net-R3-field').style.opacity = state.config === 'misto' || state.three ? '' : '0.45';
  }

  // ---------- Esercizio ----------
  const ex = { sol: null, ask: null };

  function newExercise() {
    const cfg = App.pick(['serie', 'parallelo', 'misto']);
    const three = cfg === 'misto' || Math.random() < 0.5;
    const Rv = [App.randE12(10, 4700), App.randE12(10, 4700), App.randE12(10, 4700)];
    const E = App.pick([5, 9, 12, 24]);
    const sol = solve(cfg, E, Rv, three);
    const n = sol.Rs.length;
    const asks = [
      { q: 'la resistenza equivalente <var>R</var><sub>eq</sub>', unit: 'Ω', val: sol.Req },
      { q: 'la corrente <var>I</var> erogata dal generatore', unit: 'mA', val: sol.It * 1000 },
    ];
    if (cfg !== 'parallelo') asks.push({ q: 'la tensione <var>V</var><sub>1</sub> ai capi di <var>R</var><sub>1</sub>', unit: 'V', val: sol.V[0] });
    if (cfg !== 'serie') asks.push({ q: 'la corrente <var>I</var><sub>2</sub> nel ramo di <var>R</var><sub>2</sub>', unit: 'mA', val: sol.I[1] * 1000 });
    ex.sol = sol;
    ex.ask = App.pick(asks);
    const desc = { serie: 'in serie', parallelo: 'in parallelo', misto: '<var>R</var><sub>1</sub> in serie con il parallelo di <var>R</var><sub>2</sub> e <var>R</var><sub>3</sub>' }[cfg];
    const list = sol.Rs.map((r, k) => `<var>R</var><sub>${k + 1}</sub> = ${si(r, 'Ω')}`).join(', ');
    $('ex-q').innerHTML = `Generatore ideale <var>E</var> = ${sol.E} V, ${n} resistori ${desc}: ${list}. Calcola ${ex.ask.q}.`;
    $('ex-unit').textContent = ex.ask.unit;
    $('ex-in').value = '';
    const fb = $('ex-fb');
    fb.className = 'feedback';
    fb.innerHTML = '';
  }

  function checkExercise() {
    const v = App.parseNum($('ex-in').value);
    const fb = $('ex-fb');
    if (!isFinite(v)) { App.feedback(fb, 'warn', 'Manca il numero', 'Scrivi il risultato nell\'unità indicata (va bene la virgola).'); return; }
    const want = ex.ask.val;
    const err = App.relErr(v, want);
    if (err < 0.02) {
      App.feedback(fb, 'ok', 'Giusto!', 'Risultato: ' + App.num(want, 4) + ' ' + ex.ask.unit + '.');
      App.xp.add(15, 'Esercizio sulle reti');
    } else if (App.relErr(v, want * 1000) < 0.02 || App.relErr(v, want / 1000) < 0.02) {
      App.feedback(fb, 'warn', 'Occhio alle unità', 'Il numero è giusto ma è in un\'altra unità: la risposta va data in ' + ex.ask.unit + '.');
    } else {
      App.feedback(fb, 'bad', 'Non ancora', 'Ricontrolla i passaggi. Se vuoi, carica il circuito qui sopra e guarda la soluzione passo passo.');
    }
  }

  function loadExercise() {
    const sol = ex.sol;
    state.config = sol.cfg;
    state.E = sol.E;
    state.three = sol.Rs.length === 3;
    sol.Rs.forEach((r, k) => { state.R[k] = r; fields.R[k].set(r); });
    fields.E.set(sol.E);
    $('net-three').checked = state.three;
    syncConfigButtons();
    render();
    $('net-svg').scrollIntoView({ behavior: App.reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }

  const fields = { R: [] };

  function syncConfigButtons() {
    $('net-config').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cfg === state.config)));
  }

  App.onReady(function initNetworks() {
    if (!$('net-svg')) return;
    $('net-config').querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => { state.config = b.dataset.cfg; syncConfigButtons(); render(); })
    );
    fields.E = App.linkField($('net-E-r'), $('net-E'), { min: 1, max: 48, step: 0.5, value: state.E, onChange: (v) => { state.E = v; render(); } });
    [0, 1, 2].forEach((k) => {
      fields.R[k] = App.linkField($('net-R' + (k + 1) + '-r'), $('net-R' + (k + 1)), { min: 1, max: 100000, log: true, value: state.R[k], onChange: (v) => { state.R[k] = v; render(); } });
    });
    $('net-three').addEventListener('change', (e) => { state.three = e.target.checked; render(); });
    $('ex-new').addEventListener('click', newExercise);
    $('ex-check').addEventListener('click', checkExercise);
    $('ex-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') checkExercise(); });
    $('ex-load').addEventListener('click', loadExercise);
    syncConfigButtons();
    render();
    newExercise();
  });

  App.Networks = { solve };
})();
