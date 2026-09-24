/* Scheda 2 — Resistori: codice colori, seconda legge di Ohm, temperatura */
(function () {
  'use strict';
  const App = window.App;
  const $ = (id) => document.getElementById(id);

  const COLORS = [
    { id: 'nero', hex: '#1c1c1c', digit: 0, mult: 1 },
    { id: 'marrone', hex: '#7b4a22', digit: 1, mult: 10, tol: 1 },
    { id: 'rosso', hex: '#d22b1f', digit: 2, mult: 100, tol: 2 },
    { id: 'arancio', hex: '#f07c12', digit: 3, mult: 1e3 },
    { id: 'giallo', hex: '#f4cf0f', digit: 4, mult: 1e4 },
    { id: 'verde', hex: '#1d9a3a', digit: 5, mult: 1e5, tol: 0.5 },
    { id: 'blu', hex: '#1e5ed6', digit: 6, mult: 1e6, tol: 0.25 },
    { id: 'viola', hex: '#8a3fc6', digit: 7, mult: 1e7, tol: 0.1 },
    { id: 'grigio', hex: '#8b8f94', digit: 8, mult: 1e8, tol: 0.05 },
    { id: 'bianco', hex: '#f5f5f2', digit: 9, mult: 1e9 },
    { id: 'oro', hex: '#c8a02a', mult: 0.1, tol: 5 },
    { id: 'argento', hex: '#c3c9cf', mult: 0.01, tol: 10 },
    { id: 'nessuna', hex: 'none', tol: 20 },
  ];
  const C = Object.fromEntries(COLORS.map((c) => [c.id, c]));
  const DIGITS = COLORS.filter((c) => c.digit !== undefined);
  const MULTS = COLORS.filter((c) => c.mult !== undefined);
  const TOLS = COLORS.filter((c) => c.tol !== undefined);

  const state = {
    bands: 4,
    digits: ['giallo', 'viola', 'nero'],
    mult: 'rosso',
    tol: 'oro',
  };

  function valueOf(s) {
    const n = s.bands === 4 ? 2 : 3;
    let base = 0;
    for (let i = 0; i < n; i++) base = base * 10 + C[s.digits[i]].digit;
    return { base, value: base * C[s.mult].mult, tol: C[s.tol].tol };
  }

  // ---------- Disegno del resistore ----------
  function resistorSVG(s, idPrefix) {
    const body = s.bands === 4 ? '#dcc59c' : '#8fb8d6';
    const xs = s.bands === 4 ? [124, 152, 180, 262] : [118, 142, 166, 190, 262];
    const cols = (s.bands === 4 ? s.digits.slice(0, 2) : s.digits.slice(0, 3)).concat([s.mult, s.tol]);
    const clip = idPrefix + '-clip';
    let bands = '';
    cols.forEach((c, i) => {
      if (C[c].hex === 'none') return;
      bands += `<rect x="${xs[i]}" y="22" width="16" height="66" fill="${C[c].hex}"/>`;
    });
    return `
      <title>Resistore a ${s.bands} fasce: ${cols.join(', ')}</title>
      <defs>
        <clipPath id="${clip}"><path d="M96 34 Q96 22 112 22 H128 Q138 30 150 30 H250 Q262 30 272 22 H288 Q304 22 304 34 V76 Q304 88 288 88 H272 Q262 80 250 80 H150 Q138 80 128 88 H112 Q96 88 96 76 Z"/></clipPath>
        <linearGradient id="${idPrefix}-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".45"/>
          <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity=".18"/>
        </linearGradient>
      </defs>
      <line class="lead" x1="12" y1="55" x2="100" y2="55"/>
      <line class="lead" x1="300" y1="55" x2="388" y2="55"/>
      <g clip-path="url(#${clip})">
        <rect x="90" y="18" width="220" height="74" fill="${body}"/>
        ${bands}
        <rect x="90" y="18" width="220" height="74" fill="url(#${idPrefix}-gloss)"/>
      </g>`;
  }

  // ---------- Selettori di colore ----------
  function swatchRow(label, list, current, onPick) {
    const row = document.createElement('div');
    row.className = 'band-row';
    row.innerHTML = `<span class="label">${label}</span><div class="swatches" role="group" aria-label="${label}"></div>`;
    const box = row.querySelector('.swatches');
    list.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (c.hex === 'none' ? ' none' : '');
      if (c.hex !== 'none') b.style.background = c.hex;
      const info = c.digit !== undefined && label.includes('cifra') ? c.digit : label === 'Moltiplicatore' ? '×' + App.num(c.mult, 3) : '±' + App.num(c.tol, 3) + '%';
      b.title = c.id + ' (' + info + ')';
      b.setAttribute('aria-label', c.id + ', ' + info);
      b.setAttribute('aria-pressed', String(c.id === current));
      b.addEventListener('click', () => onPick(c.id));
      box.appendChild(b);
    });
    return row;
  }

  function renderPickers() {
    const host = $('band-pickers');
    host.innerHTML = '';
    const n = state.bands === 4 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const list = i === 0 ? DIGITS.filter((c) => c.digit > 0) : DIGITS;
      host.appendChild(swatchRow((i + 1) + 'ª cifra', list, state.digits[i], (id) => { state.digits[i] = id; update(); }));
    }
    host.appendChild(swatchRow('Moltiplicatore', MULTS, state.mult, (id) => { state.mult = id; update(); }));
    host.appendChild(swatchRow('Tolleranza', TOLS, state.tol, (id) => { state.tol = id; update(); }));
  }

  function update() {
    renderPickers();
    $('res-svg').innerHTML = resistorSVG(state, 'rs');
    const { base, value, tol } = valueOf(state);
    const n = state.bands === 4 ? 2 : 3;
    $('res-value').innerHTML = App.si(value, 'Ω') + ' <small>± ' + App.num(tol, 3) + ' %</small>';
    $('res-range').textContent = 'Valore reale compreso tra ' + App.si(value * (1 - tol / 100), 'Ω', 4) + ' e ' + App.si(value * (1 + tol / 100), 'Ω', 4) + '.';
    const names = state.digits.slice(0, n).map((d) => d + ' (' + C[d].digit + ')').join(', ');
    $('res-read').innerHTML = 'Lettura: ' + names + ' → <strong>' + base + '</strong>; ' + state.mult + ' → × ' + App.num(C[state.mult].mult, 3) +
      '; quindi ' + base + ' × ' + App.num(C[state.mult].mult, 3) + ' = <strong>' + App.num(value, 6) + ' Ω</strong>. Fascia ' + state.tol + ': ± ' + App.num(tol, 3) + ' %.';
    $('res-code').textContent = 'Sugli schemi: ' + schemaCode(value);
    $('res-bands').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.n) === state.bands)));
  }

  /** Notazione da schema elettrico: 4700 → 4k7, 0,47 → R47, 1500000 → 1M5 */
  function schemaCode(v) {
    const table = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, 'R']];
    for (const [f, p] of table) {
      if (v >= f || p === 'R') {
        const x = Number((v / f).toPrecision(3));
        const [int, dec] = String(x).split('.');
        return (int === '0' ? '' : int) + p + (dec || '');
      }
    }
    return String(v);
  }

  /** Dal valore alle fasce. Restituisce un messaggio se non si può rappresentare esattamente. */
  function bandsFor(value, nBands) {
    const nd = nBands === 4 ? 2 : 3;
    if (!(value > 0)) return { error: 'Scrivi un valore positivo, per esempio 4k7 o 220.' };
    const e = Math.floor(Math.log10(value) + 1e-9) - (nd - 1);
    const k = App.clamp(e, -2, 9);
    const digits = Math.round(value / Math.pow(10, k));
    if (digits >= Math.pow(10, nd)) return { error: 'Valore troppo grande per il codice colori.' };
    if (digits < Math.pow(10, nd - 1)) return { error: 'Valore troppo piccolo: il moltiplicatore più piccolo è l\'argento (× 0,01).' };
    const exact = Math.abs(digits * Math.pow(10, k) - value) / value < 1e-6;
    const ds = String(digits).split('').map((d) => DIGITS[Number(d)].id);
    const mult = MULTS.find((c) => Math.abs(Math.log10(c.mult) - k) < 1e-9).id;
    return {
      digits: ds, mult, exact,
      note: exact ? '' : 'Con ' + nBands + ' fasce hai solo ' + nd + ' cifre significative: ho arrotondato a ' + App.si(digits * Math.pow(10, k), 'Ω', nd) + '.' + (nBands === 4 ? ' Prova con 5 fasce.' : ''),
    };
  }

  // ---------- Gioco: leggi il resistore ----------
  const game = { streak: 0, answered: false, value: 0 };

  function newGame() {
    const k = App.rand(-1, 5);
    const d = App.pick(App.E12);
    const value = Number((d * Math.pow(10, k + 1)).toPrecision(2));
    const b = bandsFor(value, 4);
    const s = { bands: 4, digits: b.digits.concat(['nero']), mult: b.mult, tol: App.pick(['oro', 'oro', 'argento', 'marrone']) };
    game.value = value;
    game.answered = false;
    $('game-svg').innerHTML = resistorSVG(s, 'gm');

    const norm = (x) => Number(x.toPrecision(2));
    const opts = new Set([value, norm(value * 10), norm(value / 10)]);
    const digs = String(Math.round(d * 10));
    if (digs[0] !== digs[1] && digs[1] !== '0') opts.add(norm(Number(digs[1] + digs[0]) * Math.pow(10, k)));
    while (opts.size < 4) opts.add(norm(App.pick(App.E12) * Math.pow(10, k + App.rand(0, 2))));
    const list = [...opts].slice(0, 4);
    const host = $('game-choices');
    host.innerHTML = '';
    App.shuffle(list).forEach((v) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      btn.textContent = App.si(v, 'Ω');
      btn.addEventListener('click', () => answer(btn, v, s));
      host.appendChild(btn);
    });
    const fb = $('game-fb');
    fb.className = 'feedback';
    fb.innerHTML = '';
  }

  function answer(btn, v, s) {
    if (game.answered) return;
    game.answered = true;
    const ok = Math.abs(v - game.value) / game.value < 1e-6;
    $('game-choices').querySelectorAll('button').forEach((b) => {
      b.disabled = true;
      if (b.textContent === App.si(game.value, 'Ω')) b.classList.add('right');
    });
    const n1 = C[s.digits[0]].digit, n2 = C[s.digits[1]].digit;
    const expl = s.digits[0] + ' = ' + n1 + ', ' + s.digits[1] + ' = ' + n2 + ', ' + s.mult + ' = × ' + App.num(C[s.mult].mult, 3) +
      ' → ' + n1 + '' + n2 + ' × ' + App.num(C[s.mult].mult, 3) + ' = ' + App.si(game.value, 'Ω') + ' (tolleranza ' + s.tol + ', ± ' + C[s.tol].tol + ' %).';
    if (ok) {
      game.streak++;
      App.feedback($('game-fb'), 'ok', game.streak > 2 ? game.streak + ' di fila!' : 'Esatto!', expl);
      App.xp.add(game.streak >= 3 ? 15 : 10, 'Codice colori');
    } else {
      game.streak = 0;
      btn.classList.add('wrong');
      App.feedback($('game-fb'), 'bad', 'Rivedi', expl);
    }
    $('game-streak').textContent = game.streak;
  }

  // ---------- Seconda legge di Ohm ----------
  const MATERIALS = [
    { id: 'rame', name: 'Rame', rho: 0.0175, alpha: 0.0039, hex: '#c07a3a' },
    { id: 'alluminio', name: 'Alluminio', rho: 0.028, alpha: 0.004, hex: '#a9b1b9' },
    { id: 'argento', name: 'Argento', rho: 0.016, alpha: 0.0038, hex: '#cfd4d8' },
    { id: 'oro', name: 'Oro', rho: 0.0244, alpha: 0.0034, hex: '#d4af37' },
    { id: 'ferro', name: 'Ferro', rho: 0.1, alpha: 0.005, hex: '#6d7176' },
    { id: 'tungsteno', name: 'Tungsteno', rho: 0.055, alpha: 0.0045, hex: '#8b9099' },
    { id: 'costantana', name: 'Costantana', rho: 0.49, alpha: 0.00001, hex: '#a67c52' },
    { id: 'nichelcromo', name: 'Nichel-cromo', rho: 1.1, alpha: 0.0004, hex: '#7b746a' },
  ];
  const SECTIONS = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
  const wire = { mat: 'rame', L: 40, S: 1.5, T: 20 };
  let fL, fT;

  function renderWire() {
    const m = MATERIALS.find((x) => x.id === wire.mat);
    const rhoT = m.rho * (1 + m.alpha * (wire.T - 20));
    const R = (rhoT * wire.L) / wire.S;
    $('w-R').innerHTML = App.si(R, 'Ω') + ' <small>G = ' + App.si(1 / R, 'S') + '</small>';
    $('w-steps').innerHTML = `
      <li><span class="calc">ρ<sub><var>t</var></sub> = ρ<sub>20</sub> · (1 + α · (<var>t</var> − 20)) = ${App.num(m.rho, 3)} · (1 + ${App.num(m.alpha, 2)} · (${App.num(wire.T, 3)} − 20)) = <span class="res">${App.num(rhoT, 4)}</span> <span class="u">Ω·mm²/m</span>
        <span class="why">${m.name}: resistività a 20 °C e coefficiente di temperatura α = ${App.num(m.alpha, 2)} °C⁻¹.</span></span></li>
      <li><span class="calc"><var>R</var> = ρ · <span class="frac"><span><var>L</var></span><span><var>S</var></span></span> = ${App.num(rhoT, 4)} · <span class="frac"><span>${App.num(wire.L, 3)} m</span><span>${App.num(wire.S, 3)} mm²</span></span> = <span class="res">${App.si(R, 'Ω')}</span>
        <span class="why">Seconda legge di Ohm: la resistenza cresce con la lunghezza e diminuisce con la sezione.</span></span></li>`;
    // disegno del filo: spessore proporzionale al diametro
    const d = Math.sqrt((4 * wire.S) / Math.PI);
    const th = App.clamp(3 + d * 4.2, 3, 44);
    const len = App.clamp(70 + 70 * Math.log10(wire.L * 10), 40, 330);
    const warm = App.clamp((wire.T - 20) / 180, 0, 1);
    $('w-vis').innerHTML = `
      <title>Filo di ${m.name.toLowerCase()}: lunghezza ${App.num(wire.L, 3)} m, sezione ${App.num(wire.S, 3)} mm²</title>
      <line x1="20" y1="35" x2="${20 + len}" y2="35" stroke="${m.hex}" stroke-width="${th}" stroke-linecap="round"/>
      <line x1="20" y1="35" x2="${20 + len}" y2="35" stroke="var(--bad)" stroke-opacity="${(warm * 0.6).toFixed(2)}" stroke-width="${th}" stroke-linecap="round"/>
      <line x1="20" y1="${35 - th / 2 + 2}" x2="${20 + len}" y2="${35 - th / 2 + 2}" stroke="#fff" stroke-opacity=".35" stroke-width="${Math.max(1, th / 6)}" stroke-linecap="round"/>
      <text x="${Math.min(20 + len + 12, 360)}" y="39" class="val" style="fill:var(--ink-2);font-family:var(--f-mono);font-size:12px">⌀ ${App.num(d, 2)} mm</text>`;
  }

  App.onReady(function initResistors() {
    if (!$('res-svg')) return;
    $('res-bands').querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        const n = Number(b.dataset.n);
        if (n === state.bands) return;
        const { value } = valueOf(state);
        state.bands = n;
        const r = bandsFor(value, n);
        if (!r.error) { state.digits = r.digits.concat(['nero']).slice(0, 3); state.mult = r.mult; }
        if (n === 5 && ['oro', 'argento', 'nessuna'].includes(state.tol)) state.tol = 'marrone';
        update();
      })
    );
    const inp = $('res-input');
    const fb = $('res-input-fb');
    const fromInput = () => {
      const v = App.parseNum(inp.value);
      if (!inp.value.trim()) { fb.textContent = ''; inp.classList.remove('invalid'); return; }
      const r = bandsFor(v, state.bands);
      if (r.error || !isFinite(v)) {
        inp.classList.add('invalid');
        fb.textContent = r.error || 'Non riesco a leggere il valore: prova con 4k7, 220, 1M, 0,47.';
        return;
      }
      inp.classList.remove('invalid');
      state.digits = r.digits.concat(['nero']).slice(0, 3);
      state.mult = r.mult;
      fb.textContent = r.note;
      update();
    };
    inp.addEventListener('input', fromInput);

    $('game-next').addEventListener('click', newGame);

    // seconda legge di Ohm
    const sel = $('w-mat');
    sel.innerHTML = MATERIALS.map((m) => `<option value="${m.id}">${m.name} (ρ = ${App.num(m.rho, 3)} Ω·mm²/m)</option>`).join('');
    sel.value = wire.mat;
    sel.addEventListener('change', () => { wire.mat = sel.value; renderWire(); });
    const ss = $('w-S');
    ss.innerHTML = SECTIONS.map((s) => `<option value="${s}">${App.num(s, 3)} mm²</option>`).join('');
    ss.value = String(wire.S);
    ss.addEventListener('change', () => { wire.S = Number(ss.value); renderWire(); });
    fL = App.linkField($('w-L-r'), $('w-L'), { min: 0.1, max: 1000, log: true, value: wire.L, onChange: (v) => { wire.L = v; renderWire(); } });
    fT = App.linkField($('w-T-r'), $('w-T'), { min: -20, max: 200, step: 1, value: wire.T, onChange: (v) => { wire.T = v; renderWire(); } });

    update();
    newGame();
    renderWire();
  });

  App.Resistors = { COLORS, resistorSVG, bandsFor, schemaCode };
})();
