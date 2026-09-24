/* Scheda 5 — Porte logiche e circuiti combinatori (simboli ANSI e IEC, segnali animati) */
(function () {
  'use strict';
  const App = window.App;
  const $ = (id) => document.getElementById(id);

  const INVERTING = { NOT: 1, NAND: 1, NOR: 1, XNOR: 1 };

  function evalGate(type, ins) {
    const ones = ins.filter(Boolean).length;
    switch (type) {
      case 'AND': return ones === ins.length;
      case 'OR': return ones > 0;
      case 'NOT': return !ins[0];
      case 'NAND': return ones !== ins.length;
      case 'NOR': return ones === 0;
      case 'XOR': return ones % 2 === 1;
      case 'XNOR': return ones % 2 === 0;
      case 'BUF': return !!ins[0];
      default: return false;
    }
  }

  /**
   * Geometria di una porta con k ingressi, disegnata a partire da (0,0).
   * Restituisce il markup, la posizione dei pin di ingresso e dell'uscita.
   */
  function gateGeom(type, k, style) {
    const n = type === 'NOT' ? 1 : k;
    const h = type === 'NOT' ? 30 : Math.max(40, 14 * n + 12);
    const pinsY = Array.from({ length: n }, (_, i) => (n === 1 ? h / 2 : (h * (2 * i + 1)) / (2 * n)));
    const inv = !!INVERTING[type];
    let body = '';
    let bodyEnd;
    let pinX = () => 0;
    if (style === 'iec') {
      const w = 40;
      const sym = { AND: '&amp;', NAND: '&amp;', OR: '≥1', NOR: '≥1', XOR: '=1', XNOR: '=1', NOT: '1', BUF: '1' }[type];
      body = `<rect x="0" y="0" width="${w}" height="${h}" rx="2"/><text class="glabel" x="${w / 2}" y="${Math.min(22, h / 2 + 6)}" text-anchor="middle">${sym}</text>`;
      bodyEnd = w;
    } else if (type === 'AND' || type === 'NAND') {
      const w = Math.max(50, h / 2 + 24);
      body = `<path d="M0 0 H${w - h / 2} A${h / 2} ${h / 2} 0 0 1 ${w - h / 2} ${h} H0 Z"/>`;
      bodyEnd = w;
    } else if (type === 'OR' || type === 'NOR' || type === 'XOR' || type === 'XNOR') {
      const w = Math.max(54, h / 2 + 30);
      const c = 13;
      const dx = type === 'XOR' || type === 'XNOR' ? 7 : 0;
      body = `<path transform="translate(${dx} 0)" d="M0 0 Q${c} ${h / 2} 0 ${h} Q${w * 0.62} ${h} ${w} ${h / 2} Q${w * 0.62} 0 0 0 Z"/>`;
      if (dx) body += `<path class="open" d="M0 0 Q${c} ${h / 2} 0 ${h}"/>`;
      pinX = (y) => { const t = y / h; return 2 * t * (1 - t) * c; };
      bodyEnd = w + dx;
    } else {
      const w = 30;
      body = `<path d="M0 0 L${w} ${h / 2} L0 ${h} Z"/>`;
      bodyEnd = w;
    }
    if (inv) body += `<circle cx="${bodyEnd + 4}" cy="${h / 2}" r="4"/>`;
    const out = { x: bodyEnd + (inv ? 8 : 0), y: h / 2 };
    return { h, body, pins: pinsY.map((y) => ({ x: pinX(y), y })), out };
  }

  function gateSVG(type, k, style, x, y, scale = 1) {
    const g = gateGeom(type, k, style);
    return {
      svg: `<g class="gate" transform="translate(${x} ${y}) scale(${scale})">${g.body}</g>`,
      pins: g.pins.map((p) => ({ x: x + p.x * scale, y: y + p.y * scale })),
      out: { x: x + g.out.x * scale, y: y + g.out.y * scale },
      h: g.h * scale,
    };
  }

  function toggleSVG(id, label, x, y, on) {
    return `<g class="in-toggle${on ? ' on' : ''}" data-in="${id}" role="button" tabindex="0" aria-label="Ingresso ${label}: ${on ? 1 : 0}. Premi per cambiare" aria-pressed="${on}">
      <rect x="${x}" y="${y - 13}" width="30" height="26" rx="5"/>
      <text class="tv" x="${x + 15}" y="${y + 5}" text-anchor="middle">${on ? 1 : 0}</text>
      <text class="tl" x="${x - 6}" y="${y + 5}" text-anchor="end">${label}</text>
    </g>`;
  }

  function ledSVG(x, y, on, label) {
    return `<g class="led${on ? ' on' : ''}"><circle cx="${x}" cy="${y}" r="10"/><text class="tl" x="${x + 16}" y="${y + 5}">${label} = ${on ? 1 : 0}</text></g>`;
  }

  function bindToggles(svg, onToggle) {
    svg.querySelectorAll('.in-toggle').forEach((t) => {
      t.addEventListener('click', () => onToggle(t.dataset.in));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(t.dataset.in);
          const again = svg.querySelector('.in-toggle[data-in="' + t.dataset.in + '"]');
          if (again) again.focus();
        }
      });
    });
  }

  // ---------- Simulatore di una porta ----------
  const DESC = {
    AND: ['<var>Y</var> = <var>A</var>·<var>B</var>', 'Prodotto logico. L\'uscita è 1 solo se <strong>tutti</strong> gli ingressi sono a 1. Pensala come due interruttori in serie: la lampada si accende solo se li chiudi entrambi.'],
    OR: ['<var>Y</var> = <var>A</var> + <var>B</var>', 'Somma logica. L\'uscita è 1 se <strong>almeno un</strong> ingresso è a 1. Come due interruttori in parallelo.'],
    NOT: ['<var>Y</var> = <span class="ov"><var>A</var></span>', 'Negazione (invertitore). L\'uscita è il contrario dell\'ingresso. Il pallino all\'uscita indica sempre una negazione.'],
    NAND: ['<var>Y</var> = <span class="ov"><var>A</var>·<var>B</var></span>', 'AND seguita da NOT: l\'uscita è 0 solo se tutti gli ingressi sono 1. È una <strong>porta universale</strong>: con sole NAND si costruisce qualunque circuito.'],
    NOR: ['<var>Y</var> = <span class="ov"><var>A</var> + <var>B</var></span>', 'OR seguita da NOT: l\'uscita è 1 solo se tutti gli ingressi sono 0. Anche la NOR è universale.'],
    XOR: ['<var>Y</var> = <var>A</var> ⊕ <var>B</var> = <span class="ov"><var>A</var></span><var>B</var> + <var>A</var><span class="ov"><var>B</var></span>', 'OR esclusivo: l\'uscita è 1 se gli ingressi sono <strong>diversi</strong>. Con più ingressi: 1 se il numero di ingressi a 1 è dispari (rivelatore di parità).'],
    XNOR: ['<var>Y</var> = <span class="ov"><var>A</var> ⊕ <var>B</var></span>', 'NOR esclusivo: l\'uscita è 1 se gli ingressi sono <strong>uguali</strong>. È il comparatore di uguaglianza a 1 bit.'],
  };
  const NAMES = ['A', 'B', 'C'];
  const sim = { type: 'AND', k: 2, style: 'ansi', ins: [true, false, false] };

  function exprFor(type, k) {
    const vars = NAMES.slice(0, k).map((v) => '<var>' + v + '</var>');
    const join = { AND: '·', NAND: '·', OR: ' + ', NOR: ' + ', XOR: ' ⊕ ', XNOR: ' ⊕ ' }[type];
    if (type === 'NOT') return DESC.NOT[0];
    if (k === 2) return DESC[type][0];
    const inner = vars.join(join);
    return '<var>Y</var> = ' + (INVERTING[type] ? '<span class="ov">' + inner + '</span>' : inner);
  }

  function renderSim() {
    const k = sim.type === 'NOT' ? 1 : sim.k;
    const scale = 1.5;
    const gx = 150;
    const geo = gateGeom(sim.type, k, sim.style);
    const gy = 80 - (geo.h * scale) / 2;
    const G = gateSVG(sim.type, k, sim.style, gx, gy, scale);
    const ins = sim.ins.slice(0, k);
    const y = evalGate(sim.type, ins);
    let s = '';
    G.pins.forEach((p, i) => {
      s += `<path class="sig${ins[i] ? ' on' : ''}" d="M62 ${p.y} H${p.x}"/>`;
      s += toggleSVG(String(i), NAMES[i], 32, p.y, ins[i]);
    });
    s += G.svg;
    s += `<path class="sig${y ? ' on' : ''}" d="M${G.out.x} ${G.out.y} H300"/>`;
    s += ledSVG(310, G.out.y, y, 'Y');
    const svg = $('gate-svg');
    svg.innerHTML = `<title>Porta ${sim.type} con ${k} ingress${k === 1 ? 'o' : 'i'}, simbolo ${sim.style.toUpperCase()}</title>` + s;
    bindToggles(svg, (i) => { sim.ins[Number(i)] = !sim.ins[Number(i)]; renderSim(); });

    $('gate-expr').innerHTML = exprFor(sim.type, k);
    $('gate-desc').innerHTML = DESC[sim.type][1];

    // tabella di verità
    const rows = 1 << k;
    const cur = ins.reduce((a, b) => a * 2 + (b ? 1 : 0), 0);
    let t = '<thead><tr>' + NAMES.slice(0, k).map((v) => `<th>${v}</th>`).join('') + '<th class="sep">Y</th></tr></thead><tbody>';
    for (let m = 0; m < rows; m++) {
      const bits = [...m.toString(2).padStart(k, '0')].map((b) => b === '1');
      const out = evalGate(sim.type, bits);
      t += `<tr class="${m === cur ? 'hl' : ''}" data-m="${m}" tabindex="0">` + bits.map((b) => `<td>${b ? 1 : 0}</td>`).join('') + `<td class="sep"><b>${out ? 1 : 0}</b></td></tr>`;
    }
    const tbl = $('gate-tt');
    tbl.innerHTML = t + '</tbody>';
    tbl.querySelectorAll('tr[data-m]').forEach((tr) => {
      const set = () => {
        const m = Number(tr.dataset.m);
        for (let i = 0; i < k; i++) sim.ins[i] = !!((m >> (k - 1 - i)) & 1);
        renderSim();
      };
      tr.addEventListener('click', set);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } });
    });
    $('gate-type').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === sim.type)));
    $('gate-k').querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.k) === sim.k));
      b.disabled = sim.type === 'NOT';
    });
    $('gate-style').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === sim.style)));
  }

  // ---------- Circuiti da netlist ----------
  /*
   * Ogni circuito: ingressi (con y), porte (tipo, posizione, sorgenti degli ingressi e,
   * se serve, la x della discesa verticale "via"), uscite. L'ordine delle porte è quello di calcolo.
   */
  const CIRCUITS = {
    half: {
      name: 'Semisommatore (half adder)',
      view: '0 0 520 200',
      inputs: [{ id: 'A', y: 50 }, { id: 'B', y: 110 }],
      gates: [
        { id: 'X', type: 'XOR', x: 200, y: 40, in: ['A', 'B'], via: [null, 160] },
        { id: 'N', type: 'AND', x: 200, y: 120, in: ['A', 'B'], via: [140, 172] },
      ],
      outputs: [{ id: 'S', from: 'X', name: 'S' }, { id: 'C', from: 'N', name: 'C' }],
      note: 'Somma due bit: <var>S</var> (somma) = <var>A</var> ⊕ <var>B</var>, <var>C</var> (riporto) = <var>A</var>·<var>B</var>. Prova 1 + 1: la somma è 0 con riporto 1, cioè 10 in binario.',
    },
    full: {
      name: 'Sommatore completo (full adder)',
      view: '0 0 620 290',
      inputs: [{ id: 'A', y: 40 }, { id: 'B', y: 80 }, { id: 'Cin', y: 150, label: 'Cᵢₙ' }],
      gates: [
        { id: 'X1', type: 'XOR', x: 130, y: 30, in: ['A', 'B'], via: [null, 110] },
        { id: 'X2', type: 'XOR', x: 300, y: 60, in: ['X1', 'Cin'], via: [240, 280] },
        { id: 'A2', type: 'AND', x: 300, y: 150, in: ['Cin', 'X1'], via: [286, 260] },
        { id: 'A1', type: 'AND', x: 300, y: 230, in: ['A', 'B'], via: [90, 100] },
        { id: 'O', type: 'OR', x: 440, y: 190, in: ['A2', 'A1'], via: [405, 420] },
      ],
      outputs: [{ id: 'S', from: 'X2', name: 'S' }, { id: 'Cout', from: 'O', name: 'Cₒᵤₜ' }],
      note: 'Somma due bit più il riporto in ingresso: <var>S</var> = <var>A</var> ⊕ <var>B</var> ⊕ <var>C</var><sub>in</sub>, <var>C</var><sub>out</sub> = <var>A</var><var>B</var> + <var>C</var><sub>in</sub>(<var>A</var> ⊕ <var>B</var>). Mettendone 8 in cascata ottieni il sommatore a 8 bit.',
    },
    mux: {
      name: 'Multiplexer 2:1',
      view: '0 0 580 220',
      inputs: [{ id: 'I0', y: 40, label: 'I₀' }, { id: 'I1', y: 100, label: 'I₁' }, { id: 'S', y: 180 }],
      gates: [
        { id: 'NS', type: 'NOT', x: 120, y: 165, in: ['S'] },
        { id: 'P0', type: 'AND', x: 280, y: 30, in: ['I0', 'NS'], via: [null, 230] },
        { id: 'P1', type: 'AND', x: 280, y: 120, in: ['I1', 'S'], via: [200, 96] },
        { id: 'O', type: 'OR', x: 420, y: 70, in: ['P0', 'P1'], via: [375, 390] },
      ],
      outputs: [{ id: 'Y', from: 'O', name: 'Y' }],
      note: 'Un selettore: con <var>S</var> = 0 l\'uscita copia <var>I</var><sub>0</sub>, con <var>S</var> = 1 copia <var>I</var><sub>1</sub>. <var>Y</var> = <span class="ov"><var>S</var></span>·<var>I</var><sub>0</sub> + <var>S</var>·<var>I</var><sub>1</sub>.',
    },
  };

  function renderNetlist(svg, c, values, style, onToggle) {
    const pos = {};
    const IN_X = 62;
    c.inputs.forEach((i) => { pos[i.id] = { x: IN_X, y: i.y }; });
    const drawn = [];
    const val = Object.assign({}, values);
    // calcolo dei segnali
    c.gates.forEach((g) => { val[g.id] = evalGate(g.type, g.in.map((s) => !!val[s])); });
    // porte
    const G = {};
    c.gates.forEach((g) => {
      G[g.id] = gateSVG(g.type, g.in.length, style, g.x, g.y);
      pos[g.id] = G[g.id].out;
    });
    // collegamenti
    const conns = [];
    c.gates.forEach((g) => g.in.forEach((src, k) => {
      const p = G[g.id].pins[k];
      const from = pos[src];
      const straight = Math.abs(from.y - p.y) < 0.5;
      const mx = straight ? null : (g.via && g.via[k] != null ? g.via[k] : p.x - 16);
      conns.push({ src, from, to: p, mx });
    }));
    // punti di giunzione: dove un segnale si divide
    const bySrc = {};
    conns.forEach((cn) => (bySrc[cn.src] = bySrc[cn.src] || []).push(cn));
    let dots = '';
    Object.values(bySrc).forEach((list) => {
      if (list.length < 2) return;
      const reach = Math.max(...list.map((cn) => (cn.mx == null ? cn.to.x : cn.mx)));
      list.forEach((cn) => { if (cn.mx != null && cn.mx < reach - 0.5) dots += `<circle class="jdot${val[cn.src] ? ' on' : ''}" cx="${cn.mx}" cy="${cn.from.y}" r="3.6"/>`; });
    });
    conns.forEach((cn) => {
      const d = cn.mx == null
        ? `M${cn.from.x} ${cn.from.y} H${cn.to.x}`
        : `M${cn.from.x} ${cn.from.y} H${cn.mx} V${cn.to.y} H${cn.to.x}`;
      drawn.push(`<path class="sig${val[cn.src] ? ' on' : ''}" d="${d}"/>`);
    });
    const W = Number(c.view.split(' ')[2]);
    const outX = Math.max(W - 90, ...c.outputs.map((o) => pos[o.from].x + 24));
    c.outputs.forEach((o) => {
      const p = pos[o.from];
      drawn.push(`<path class="sig${val[o.from] ? ' on' : ''}" d="M${p.x} ${p.y} H${outX}"/>`);
      drawn.push(ledSVG(outX + 10, p.y, val[o.from], o.name));
    });
    let s = drawn.join('') + dots + c.gates.map((g) => G[g.id].svg).join('');
    s += c.inputs.map((i) => toggleSVG(i.id, i.label || i.id, 26, i.y, !!val[i.id])).join('');
    svg.setAttribute('viewBox', c.view);
    svg.innerHTML = `<title>${c.name}</title>` + s;
    bindToggles(svg, onToggle);
    return val;
  }

  const circ = { key: 'half', style: 'ansi', values: { A: true, B: true, Cin: false, I0: true, I1: false, S: false } };

  function renderCircuit() {
    const c = CIRCUITS[circ.key];
    const val = renderNetlist($('circ-svg'), c, circ.values, circ.style, (id) => { circ.values[id] = !circ.values[id]; renderCircuit(); });
    $('circ-note').innerHTML = c.note;
    const ins = c.inputs.map((i) => (i.label || i.id) + ' = ' + (val[i.id] ? 1 : 0)).join(', ');
    const outs = c.outputs.map((o) => o.name.split(' ')[0] + ' = ' + (val[o.from] ? 1 : 0)).join(', ');
    let extra = '';
    if (circ.key === 'half' || circ.key === 'full') {
      const sum = c.inputs.reduce((a, i) => a + (val[i.id] ? 1 : 0), 0);
      extra = ` → in decimale: ${c.inputs.map((i) => (val[i.id] ? 1 : 0)).join(' + ')} = ${sum} = ${sum.toString(2).padStart(2, '0')}₂`;
    }
    $('circ-state').textContent = ins + ' → ' + outs + extra;
    $('circ-pick').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === circ.key)));
    $('circ-style').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === circ.style)));
  }

  // ---------- Circuito a due livelli AND-OR da una forma SP ----------
  /**
   * n variabili, implicanti (dal motore Logic), valori degli ingressi (array di bool).
   * Disegna binari verticali A, A̅, B, B̅… porte AND per i termini e una OR finale.
   */
  function sopCircuit(svg, n, imps, inputs, style, onToggle) {
    const L = window.Logic;
    const V = L.VARS.slice(0, n);
    const railX = (i, neg) => 50 + i * 56 + (neg ? 26 : 0);
    const top = 64;
    const terms = imps.map((p) => L.productLiterals(n, p));
    const hs = terms.map((t) => Math.max(40, 14 * Math.max(t.length, 1) + 12));
    const gx = 50 + n * 56 + 40;
    let y = top + 20;
    const places = terms.map((t, i) => { const p = y; y += hs[i] + 22; return p; });
    const bottom = Math.max(y, top + 120);
    const orX = gx + 130;
    const W = orX + 190;
    const val = (l) => (l.neg ? !inputs[L.VARS.indexOf(l.v)] : inputs[L.VARS.indexOf(l.v)]);
    let s = '';
    let dots = '';
    // binari e invertitori
    V.forEach((v, i) => {
      const on = inputs[i];
      const xT = railX(i, false);
      const xN = railX(i, true);
      s += `<path class="sig${on ? ' on' : ''}" d="M${xT} 40 V${bottom}"/>`;
      s += `<path class="sig${on ? ' on' : ''}" d="M${xT} 46 H${xN} V52"/>`;
      dots += `<circle class="jdot${on ? ' on' : ''}" cx="${xT}" cy="46" r="3.4"/>`;
      s += `<g class="gate" transform="translate(${xN - 9} 52)"><path d="M0 0 H18 L9 14 Z"/><circle cx="9" cy="17.5" r="3.5"/></g>`;
      s += `<path class="sig${!on ? ' on' : ''}" d="M${xN} 72 V${bottom}"/>`;
      s += `<text class="tl rail" x="${xN + 4}" y="${bottom + 14}">${v}̅</text><text class="tl rail" x="${xT + 4}" y="${bottom + 14}">${v}</text>`;
      s += toggleSVG(String(i), v, xT - 15, 22, on);
    });
    if (!terms.length || (terms.length === 1 && !terms[0].length)) {
      const c = terms.length ? 1 : 0;
      s += `<path class="sig${c ? ' on' : ''}" d="M${gx} ${top + 40} H${orX + 60}"/>` + ledSVG(orX + 72, top + 40, c, 'F') +
        `<text class="tl" x="${gx}" y="${top + 28}">costante ${c}</text>`;
      svg.setAttribute('viewBox', `0 0 ${W} ${bottom + 26}`);
      svg.innerHTML = '<title>Funzione costante</title>' + s + dots;
      bindToggles(svg, onToggle);
      return c;
    }
    const outs = [];
    terms.forEach((t, j) => {
      const gy = places[j];
      if (t.length === 1) {
        const l = t[0];
        const x = railX(L.VARS.indexOf(l.v), l.neg);
        const yy = gy + hs[j] / 2;
        dots += `<circle class="jdot${val(l) ? ' on' : ''}" cx="${x}" cy="${yy}" r="3.4"/>`;
        s += `<path class="sig${val(l) ? ' on' : ''}" d="M${x} ${yy} H${gx + 58}"/>`;
        outs.push({ x: gx + 58, y: yy, on: val(l) });
        return;
      }
      const G = gateSVG('AND', t.length, style, gx, gy);
      const on = t.every(val);
      t.forEach((l, k) => {
        const x = railX(L.VARS.indexOf(l.v), l.neg);
        const p = G.pins[k];
        dots += `<circle class="jdot${val(l) ? ' on' : ''}" cx="${x}" cy="${p.y}" r="3.4"/>`;
        s += `<path class="sig${val(l) ? ' on' : ''}" d="M${x} ${p.y} H${p.x}"/>`;
      });
      s += G.svg;
      outs.push({ x: G.out.x, y: G.out.y, on });
    });
    let F;
    if (outs.length === 1) {
      F = outs[0].on;
      s += `<path class="sig${F ? ' on' : ''}" d="M${outs[0].x} ${outs[0].y} H${orX + 60}"/>` + ledSVG(orX + 70, outs[0].y, F, 'F');
    } else {
      const midY = (outs[0].y + outs[outs.length - 1].y) / 2;
      const geo = gateGeom('OR', outs.length, style);
      const O = gateSVG('OR', outs.length, style, orX, midY - geo.h / 2);
      outs.forEach((o, k) => {
        const p = O.pins[k];
        const mx = orX - 18 - (k < outs.length / 2 ? k : outs.length - 1 - k) * 9;
        s += `<path class="sig${o.on ? ' on' : ''}" d="M${o.x} ${o.y} H${mx} V${p.y} H${p.x}"/>`;
      });
      s += O.svg;
      F = outs.some((o) => o.on);
      s += `<path class="sig${F ? ' on' : ''}" d="M${O.out.x} ${O.out.y} H${orX + 110}"/>` + ledSVG(orX + 120, O.out.y, F, 'F');
    }
    svg.setAttribute('viewBox', `0 0 ${W + 40} ${bottom + 26}`);
    svg.innerHTML = '<title>Circuito AND-OR della forma minima</title>' + s + dots;
    bindToggles(svg, onToggle);
    return F;
  }

  // maggioranza a 3 ingressi, disegnata dal motore logico
  const maj = { ins: [true, true, false] };
  function renderMajority(style) {
    const L = window.Logic;
    const r = L.analyze(3, [0, 0, 0, 1, 0, 1, 1, 1]);
    sopCircuit($('circ-svg'), 3, r.sop, maj.ins, style, (i) => { maj.ins[Number(i)] = !maj.ins[Number(i)]; renderMajority(style); });
    $('circ-note').innerHTML = 'Rivelatore di maggioranza: l\'uscita è 1 quando almeno due ingressi su tre sono a 1 (per esempio tre giudici che votano). Forma minima dalla mappa di Karnaugh: <var>F</var> = <var>A</var><var>B</var> + <var>A</var><var>C</var> + <var>B</var><var>C</var>.';
    const ones = maj.ins.filter(Boolean).length;
    $('circ-state').textContent = 'A = ' + +maj.ins[0] + ', B = ' + +maj.ins[1] + ', C = ' + +maj.ins[2] + ' → ' + ones + ' ingressi a 1 → F = ' + (ones >= 2 ? 1 : 0);
    $('circ-pick').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === 'maj')));
    $('circ-style').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === style)));
  }

  function refreshCircuit() {
    if (circ.key === 'maj') renderMajority(circ.style);
    else renderCircuit();
  }

  App.onReady(function initGates() {
    if (!$('gate-svg')) return;
    $('gate-type').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { sim.type = b.dataset.g; renderSim(); }));
    $('gate-k').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { sim.k = Number(b.dataset.k); renderSim(); }));
    $('gate-style').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { sim.style = b.dataset.s; renderSim(); }));
    $('circ-pick').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { circ.key = b.dataset.c; refreshCircuit(); }));
    $('circ-style').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { circ.style = b.dataset.s; refreshCircuit(); }));
    renderSim();
    refreshCircuit();
  });

  App.Gates = { evalGate, gateGeom, gateSVG, sopCircuit, DESC };
})();
