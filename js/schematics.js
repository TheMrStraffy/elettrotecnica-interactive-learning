/* Schemi elettrici in SVG per le lezioni sulle reti in corrente continua */
(function () {
  'use strict';
  const App = window.App;
  const si = (x, u) => App.si(x, u);

  // ---------- Etichette con pedice: 'R_1' → R₁ ----------
  function nm(name) {
    const [b, s] = String(name).split('_');
    return `<tspan class="nm">${b}</tspan>` + (s ? `<tspan class="sb" dy="4">${s}</tspan>` : '');
  }
  function label(x, y, name, val, anchor) {
    let s = `<text x="${x}" y="${y}" text-anchor="${anchor}">${nm(name)}</text>`;
    if (val != null && val !== '') s += `<text class="val" x="${x}" y="${y + 16}" text-anchor="${anchor}">${val}</text>`;
    return s;
  }
  const fmtR = (v) => (v == null ? null : typeof v === 'string' ? v : si(v, 'Ω'));
  const fmtV = (v) => (v == null ? null : typeof v === 'string' ? v : si(v, 'V'));

  // ---------- Componenti ----------
  const wire = (d, cls = 'wire') => `<path class="${cls}" d="${d}"/>`;
  const dot = (x, y) => `<circle class="dot" cx="${x}" cy="${y}" r="3.8"/>`;
  const term = (x, y) => `<circle class="term" cx="${x}" cy="${y}" r="4.5"/>`;
  const nodeLbl = (x, y, t, anchor = 'middle') => `<text class="node" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;

  function resH(cx, cy, name, val, o = {}) {
    const cls = 'comp' + (o.hl ? ' hl' : '');
    return `<rect class="${cls}" x="${cx - 28}" y="${cy - 9}" width="56" height="18" rx="1.5"/>` +
      `<text x="${cx}" y="${cy - 16}" text-anchor="middle">${nm(name)}</text>` +
      (val != null ? `<text class="val" x="${cx}" y="${cy + 26}" text-anchor="middle">${fmtR(val)}</text>` : '');
  }

  function resV(cx, cy, name, val, o = {}) {
    const cls = 'comp' + (o.hl ? ' hl' : '');
    const left = o.side === 'left';
    return `<rect class="${cls}" x="${cx - 9}" y="${cy - 28}" width="18" height="56" rx="1.5"/>` +
      label(left ? cx - 16 : cx + 16, cy - 4, name, fmtR(val), left ? 'end' : 'start');
  }

  function gen(cx, cy, name, val, o = {}) {
    const up = o.up !== false;
    const left = o.side !== 'right';
    return `<circle class="comp${o.hl ? ' hl' : ''}" cx="${cx}" cy="${cy}" r="18"/>` +
      `<text class="pm" x="${cx}" y="${cy + (up ? -2 : 13)}" text-anchor="middle">+</text>` +
      `<text class="pm" x="${cx}" y="${cy + (up ? 13 : -2)}" text-anchor="middle">−</text>` +
      label(left ? cx - 26 : cx + 26, cy - 3, name, fmtV(val), left ? 'end' : 'start');
  }

  function isrc(cx, cy, name, val, o = {}) {
    const left = o.side !== 'right';
    return `<circle class="comp" cx="${cx}" cy="${cy}" r="18"/>` +
      `<path class="wire" d="M${cx} ${cy + 10} V${cy - 6}" style="stroke-width:2"/>` +
      `<path class="ahead" d="M${cx - 5} ${cy - 4} L${cx} ${cy - 12} L${cx + 5} ${cy - 4} Z"/>` +
      label(left ? cx - 26 : cx + 26, cy - 3, name, val != null ? si(val, 'A') : null, left ? 'end' : 'start');
  }

  function short(cx, cy, name, side = 'left') {
    const left = side === 'left';
    return wire(`M${cx} ${cy - 18} V${cy + 18}`) +
      `<circle class="ghost" cx="${cx}" cy="${cy}" r="18"/>` +
      `<text class="small" x="${left ? cx - 26 : cx + 26}" y="${cy + 4}" text-anchor="${left ? 'end' : 'start'}">${name} spento</text>`;
  }

  function ground(x, y) {
    return `<path class="wire" d="M${x} ${y} V${y + 10} M${x - 11} ${y + 10} H${x + 11} M${x - 7} ${y + 14} H${x + 7} M${x - 3} ${y + 18} H${x + 3}" style="stroke-width:1.8"/>`;
  }

  /** Freccia della corrente su un filo: dir = r | l | u | d. */
  function arrow(x, y, dir, name, val, o = {}) {
    const s = 6.5;
    const pts = {
      r: `${x - s} ${y - s} ${x + s} ${y} ${x - s} ${y + s}`,
      l: `${x + s} ${y - s} ${x - s} ${y} ${x + s} ${y + s}`,
      u: `${x - s} ${y + s} ${x} ${y - s} ${x + s} ${y + s}`,
      d: `${x - s} ${y - s} ${x} ${y + s} ${x + s} ${y - s}`,
    }[dir];
    const txt = nm(name) + (val != null ? ` <tspan class="iv">= ${si(val, 'A')}</tspan>` : '');
    let lx = x, ly = y - 11, anchor = 'middle';
    if (dir === 'u' || dir === 'd') {
      const left = o.side === 'left';
      lx = left ? x - 11 : x + 11;
      ly = y + 5;
      anchor = left ? 'end' : 'start';
    } else if (o.side === 'below') ly = y + 22;
    return `<polygon class="iarrow" points="${pts}"/><text class="ilbl" x="${lx}" y="${ly}" text-anchor="${anchor}">${txt}</text>`;
  }

  /** Corrente di maglia: arco orario con etichetta al centro. */
  function meshArrow(cx, cy, name, val) {
    const r = 30;
    return `<path class="mesh" d="M${cx - r * 0.7} ${cy - r * 0.7} A${r} ${r} 0 1 1 ${cx - r} ${cy + 4}"/>` +
      `<polygon class="meshhead" points="${cx - r * 0.7 - 7} ${cy - r * 0.7 + 3} ${cx - r * 0.7 + 3} ${cy - r * 0.7 - 6} ${cx - r * 0.7 + 4} ${cy - r * 0.7 + 7}"/>` +
      `<text class="ilbl" x="${cx}" y="${cy + 5}" text-anchor="middle">${nm(name)}</text>` +
      (val != null ? `<text class="ilbl iv" x="${cx}" y="${cy + 21}" text-anchor="middle">${si(val, 'A')}</text>` : '');
  }

  /** Resistore lungo un segmento qualsiasi (per triangoli e stelle). */
  function resLine(x1, y1, x2, y2, name, val, flip) {
    const dx = x2 - x1, dy = y2 - y1;
    const L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const h = 24;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    let nx = -uy, ny = ux;
    if (flip) { nx = -nx; ny = -ny; }
    const lx = mx + nx * 30, ly = my + ny * 30;
    const anchor = Math.abs(nx) < 0.3 ? 'middle' : nx > 0 ? 'start' : 'end';
    return wire(`M${x1} ${y1} L${mx - ux * h} ${my - uy * h} M${mx + ux * h} ${my + uy * h} L${x2} ${y2}`) +
      `<rect class="comp" x="${mx - h}" y="${my - 8}" width="${2 * h}" height="16" rx="1.5" transform="rotate(${ang} ${mx} ${my})"/>` +
      label(lx, ly - 4, name, fmtR(val), anchor);
  }

  function frame(w, h, title, body) {
    return { w, h, svg: `<svg class="schematic dcs" viewBox="0 0 ${w} ${h}" role="img"><title>${title}</title>${body}</svg>` };
  }

  const cur = (o, k) => (o.cur && o.cur[k] != null ? o.cur[k] : null);
  const showArrows = (o) => o.arrows !== false;

  // ---------- Circuiti tipo ----------
  const T = {};

  T.single = (p, o = {}) => {
    let s = wire('M80 117 V50 H330 V107 M330 163 V220 H80 V153');
    s += gen(80, 135, 'E', p.E) + resV(330, 135, 'R', p.R);
    if (showArrows(o)) s += arrow(205, 50, 'r', 'I', cur(o, 'I'));
    return frame(440, 250, 'Generatore con un resistore', s);
  };

  T.series = (p, o = {}) => {
    const n = p.R.length;
    const hx = n === 3 ? [190, 340] : [260];
    let s = '';
    let x = 70;
    let d = 'M70 122 V50';
    hx.forEach((cx) => { d += ` H${cx - 28} M${cx + 28} 50`; x = cx + 28; });
    d += ' H470 V112 M470 168 V230 H70 V158';
    s += wire(d);
    s += gen(70, 140, 'E', p.E);
    hx.forEach((cx, k) => { s += resH(cx, 50, 'R_' + (k + 1), p.R[k]); });
    s += resV(470, 140, 'R_' + n, p.R[n - 1]);
    const nodes = n === 3 ? [[110, 'A'], [265, 'B'], [415, 'C']] : [[110, 'A'], [365, 'B']];
    nodes.forEach(([nx, t], k) => {
      s += dot(nx, 50);
      const pot = o.pot ? ` = ${si(o.pot[k], 'V')}` : '';
      s += nodeLbl(nx, 36, t + pot);
    });
    s += ground(270, 230) + `<text class="small" x="286" y="252">massa, 0 V</text>`;
    if (showArrows(o)) s += arrow(160, 230, 'l', 'I', cur(o, 'I'), { side: 'below' });
    return frame(560, 262, 'Resistori in serie', s);
  };

  T.divider = (p, o = {}) => {
    let s = wire('M70 122 V50 H280 V67 M280 123 V157 M280 213 V230 H70 V158 M280 140 H400 M280 230 H400');
    s += gen(70, 140, 'E', p.E) + resV(280, 95, 'R_1', p.R1) + resV(280, 185, 'R_2', p.R2);
    s += dot(280, 140) + term(400, 140) + term(400, 230);
    s += `<path class="varrow" d="M420 224 V146"/><polygon class="vhead" points="415,152 420,142 425,152"/>`;
    s += label(430, 182, 'V_out', o.Vout != null ? si(o.Vout, 'V') : null, 'start');
    if (showArrows(o)) s += arrow(175, 50, 'r', 'I', cur(o, 'I'));
    return frame(520, 250, 'Partitore di tensione', s);
  };

  T.parallel = (p, o = {}) => {
    const n = p.R.length;
    const xs = n === 3 ? [210, 340, 470] : [250, 430];
    const last = xs[xs.length - 1];
    let s = wire(`M70 117 V45 H${last} M70 153 V225 H${last}`);
    s += gen(70, 135, 'E', p.E);
    xs.forEach((x, k) => {
      s += wire(`M${x} 45 V107 M${x} 163 V225`) + resV(x, 135, 'R_' + (k + 1), p.R[k]);
      if (k < xs.length - 1) s += dot(x, 45) + dot(x, 225);
      if (showArrows(o)) s += arrow(x, 80, 'd', 'I_' + (k + 1), cur(o, 'I' + (k + 1)));
    });
    s += nodeLbl(xs[0] - 10, 34, 'A', 'end') + nodeLbl(xs[0] - 10, 246, 'B', 'end');
    if (showArrows(o)) s += arrow(135, 45, 'r', 'I', cur(o, 'I'));
    return frame(xs.length === 3 ? 580 : 540, 256, 'Resistori in parallelo', s);
  };

  T.currentDivider = (p, o = {}) => {
    let s = wire('M70 117 V45 H430 V107 M430 163 V225 H70 V153 M250 45 V107 M250 163 V225');
    s += isrc(70, 135, 'I', p.I) + resV(250, 135, 'R_1', p.R1) + resV(430, 135, 'R_2', p.R2);
    s += dot(250, 45) + dot(250, 225);
    if (showArrows(o)) s += arrow(250, 80, 'd', 'I_1', cur(o, 'I1')) + arrow(430, 80, 'd', 'I_2', cur(o, 'I2'));
    return frame(540, 256, 'Partitore di corrente', s);
  };

  T.mixA = (p, o = {}) => {
    const st = o.stage || 0;
    let s = gen(70, 140, 'E', p.E);
    if (st < 2) {
      s += wire('M70 122 V50 H142 M198 50 H270 M142 230 H70 V158');
      s += resH(170, 50, 'R_1', p.R1) + resH(170, 230, 'R_4', p.R4);
      if (st === 0) {
        s += wire('M270 50 H420 V112 M270 50 V112 M270 168 V230 M420 168 V230 H198');
        s += resV(270, 140, 'R_2', p.R2, { hl: o.hl }) + resV(420, 140, 'R_3', p.R3, { hl: o.hl });
        s += dot(270, 50) + dot(270, 230);
        if (showArrows(o)) s += arrow(270, 84, 'd', 'I_2', cur(o, 'I2')) + arrow(420, 84, 'd', 'I_3', cur(o, 'I3'));
      } else {
        s += wire('M270 50 V112 M270 168 V230 H198');
        s += resV(270, 140, 'R_23', p.R23, { hl: true });
      }
      s += nodeLbl(270, 38, 'A') + nodeLbl(284, 252, 'B', 'start');
    } else {
      s += wire('M70 122 V50 H330 V112 M330 168 V230 H70 V158');
      s += resV(330, 140, 'R_eq', p.Req, { hl: true });
    }
    if (showArrows(o)) s += arrow(110, 50, 'r', 'I', cur(o, 'I'));
    return frame(520, 262, 'Circuito misto', s);
  };

  T.mixB = (p, o = {}) => {
    let s = wire('M70 122 V50 H410 V112 M410 168 V230 H70 V158 M260 50 V70 M260 126 V154 M260 210 V230');
    s += gen(70, 140, 'E', p.E) + resV(260, 98, 'R_1', p.R1) + resV(260, 182, 'R_2', p.R2) + resV(410, 140, 'R_3', p.R3);
    s += dot(260, 50) + dot(260, 230) + dot(260, 140) + nodeLbl(248, 145, 'M', 'end');
    if (showArrows(o)) s += arrow(130, 50, 'r', 'I', cur(o, 'I')) + arrow(410, 80, 'd', 'I_3', cur(o, 'I3'));
    return frame(520, 252, 'Serie dentro un parallelo', s);
  };

  T.mixC = (p, o = {}) => {
    let s = wire('M70 122 V50 H142 M198 50 H342 M398 50 H470 V112 M270 50 V112 M270 168 V230 M470 168 V230 H70 V158');
    s += gen(70, 140, 'E', p.E) + resH(170, 50, 'R_1', p.R1) + resV(270, 140, 'R_2', p.R2) + resH(370, 50, 'R_3', p.R3) + resV(470, 140, 'R_4', p.R4);
    s += dot(270, 50) + dot(270, 230) + nodeLbl(270, 26, 'A');
    if (showArrows(o)) s += arrow(110, 50, 'r', 'I', cur(o, 'I')) + arrow(270, 84, 'd', 'I_2', cur(o, 'I2')) + arrow(434, 50, 'r', 'I_34', cur(o, 'I34'));
    return frame(560, 252, 'Parallelo con un ramo in serie', s);
  };

  /** Circuito di riferimento dei moduli 5–9: E1-R1 | R3 | R2-E2. */
  T.twoGen = (p, o = {}) => {
    let s = wire('M80 122 V50 H157 M213 50 H367 M423 50 H500 V122 M500 158 V230 H80 V158');
    const off1 = o.off === 'E1' || o.off === 'both';
    const off2 = o.off === 'E2' || o.off === 'both';
    s += off1 ? short(80, 140, 'E₁') : gen(80, 140, 'E_1', p.E1, { hl: o.hlGen === 'E1' });
    s += off2 ? short(500, 140, 'E₂', 'right') : gen(500, 140, 'E_2', p.E2, { side: 'right', hl: o.hlGen === 'E2' });
    s += resH(185, 50, 'R_1', p.R1) + resH(395, 50, 'R_2', p.R2);
    if (o.open) {
      s += wire('M290 50 V78 M290 202 V230') + term(290, 82) + term(290, 198);
      s += `<path class="varrow" d="M306 192 V92"/><polygon class="vhead" points="301,98 306,88 311,98"/>`;
      s += label(316, 140, 'V_th', o.Vth != null ? si(o.Vth, 'V') : null, 'start');
    } else {
      s += wire('M290 50 V112 M290 168 V230') + resV(290, 140, 'R_3', p.R3, { hl: o.hlR3 });
      if (showArrows(o) && !o.mesh) s += arrow(290, 82, 'd', 'I_3', cur(o, 'I3'), { side: 'left' });
    }
    s += dot(290, 50) + dot(290, 230);
    s += nodeLbl(290, 36, 'A' + (o.VA != null ? ' = ' + si(o.VA, 'V') : ''));
    s += ground(290, 230) + nodeLbl(276, 250, 'B', 'end');
    if (o.mesh) {
      s += meshArrow(185, 140, 'I_a', o.Ia) + meshArrow(395, 140, 'I_b', o.Ib);
    } else if (showArrows(o)) {
      const flip2 = o.flipI2;
      s += arrow(121, 50, 'r', 'I_1', cur(o, 'I1'));
      s += arrow(461, 50, flip2 ? 'r' : 'l', 'I_2', cur(o, 'I2'));
    }
    return frame(580, 262, 'Circuito di riferimento con due generatori', s);
  };

  T.millman3 = (p, o = {}) => {
    const xs = [130, 290, 450];
    let s = wire('M130 50 H450 M130 230 H450');
    p.br.forEach((b, k) => {
      const x = xs[k];
      s += resV(x, 95, 'R_' + (k + 1), b.R);
      if (b.E) {
        s += wire(`M${x} 50 V67 M${x} 123 V162 M${x} 198 V230`) + gen(x, 180, 'E_' + (k + 1), b.E, { side: 'right', up: b.up });
      } else s += wire(`M${x} 50 V67 M${x} 123 V230`);
      if (showArrows(o)) s += arrow(x, 142, 'u', 'I_' + (k + 1), cur(o, 'I' + (k + 1)), { side: 'left' });
    });
    s += dot(290, 50) + dot(290, 230) + nodeLbl(290, 36, 'A' + (o.VA != null ? ' = ' + si(o.VA, 'V') : ''));
    s += ground(290, 230) + nodeLbl(276, 252, 'B', 'end');
    return frame(570, 262, 'Tre rami tra due nodi', s);
  };

  T.bridge = (p, o = {}) => {
    let s = wire('M70 122 V40 H430 V57 M230 40 V57 M230 113 V167 M230 223 V240 M430 113 V167 M430 223 V240 H70 V158');
    s += gen(70, 140, 'E', p.E);
    s += resV(230, 85, 'R_1', p.R1, { side: 'left' }) + resV(230, 195, 'R_3', p.R3, { side: 'left' });
    s += resV(430, 85, 'R_2', p.R2) + resV(430, 195, 'R_4', p.R4);
    if (o.galv) {
      const ang = App.clamp(o.galv * 60, -60, 60);
      s += wire('M230 140 H310 M350 140 H430');
      s += `<circle class="comp" cx="330" cy="140" r="20"/><path class="arc" d="M316 132 A16 16 0 0 1 344 132"/>`;
      s += `<line class="needle" x1="330" y1="150" x2="330" y2="124" transform="rotate(${ang.toFixed(1)} 330 150)"/><text class="small" x="330" y="174" text-anchor="middle">G</text>`;
    } else {
      s += wire('M230 140 H302 M358 140 H430') + resH(330, 140, 'R_5', p.R5);
      if (showArrows(o)) s += arrow(392, 140, 'r', 'I_5', cur(o, 'I5'));
    }
    s += dot(230, 40) + dot(230, 240) + dot(230, 140) + dot(430, 140);
    s += nodeLbl(330, 30, 'A') + nodeLbl(330, 258, 'B') + nodeLbl(222, 135, 'C', 'end') + nodeLbl(440, 135, 'D', 'start');
    if (showArrows(o)) s += arrow(140, 40, 'r', 'I', cur(o, 'I'));
    return frame(560, 266, 'Ponte di Wheatstone', s);
  };

  /** Equivalente di Thevenin (o generatore reale) con carico. */
  T.thevenin = (p, o = {}) => {
    const nE = o.real ? 'E' : 'V_th';
    const nR = o.real ? 'R_i' : 'R_th';
    let s = `<rect class="dashbox" x="28" y="22" width="222" height="232" rx="6"/>`;
    s += `<text class="small" x="40" y="246">${o.real ? 'generatore reale' : 'equivalente di Thevenin'}</text>`;
    if (o.norton) {
      s += wire('M90 117 V50 H260 M90 163 V230 H260 M180 50 V112 M180 168 V230');
      s += isrc(90, 140, 'I_n', p.In) + resV(180, 140, 'R_n', p.Rth) + dot(180, 50) + dot(180, 230);
    } else {
      s += wire('M90 122 V50 H152 M208 50 H260 M90 158 V230 H260');
      s += gen(90, 140, nE, p.E) + resH(180, 50, nR, p.Rth);
    }
    s += term(260, 50) + term(260, 230) + nodeLbl(260, 36, 'A') + nodeLbl(260, 252, 'B');
    if (p.RL != null) {
      s += wire('M264 50 H380 V112 M380 168 V230 H264') + resV(380, 140, 'R_L', p.RL, { hl: o.hlRL });
      if (showArrows(o)) s += arrow(322, 50, 'r', 'I', cur(o, 'I'));
    } else {
      s += `<path class="varrow" d="M276 222 V58"/><polygon class="vhead" points="271,64 276,54 281,64"/>`;
      s += label(286, 144, 'V_AB', o.V != null ? si(o.V, 'V') : null, 'start');
    }
    return frame(470, 262, o.real ? 'Generatore reale con carico' : 'Equivalente di Thevenin', s);
  };

  /** R1 in serie al parallelo R2 // R3 (generatore di esercizi). */
  T.mix3 = (p, o = {}) => {
    let s = gen(70, 140, 'E', p.E);
    s += wire('M70 122 V50 H142 M198 50 H420 V112 M270 50 V112 M270 168 V230 M420 168 V230 H70 V158');
    s += resH(170, 50, 'R_1', p.R1) + resV(270, 140, 'R_2', p.R2) + resV(420, 140, 'R_3', p.R3);
    s += dot(270, 50) + dot(270, 230) + nodeLbl(270, 38, 'A') + nodeLbl(284, 252, 'B', 'start');
    if (showArrows(o)) s += arrow(110, 50, 'r', 'I', cur(o, 'I')) + arrow(270, 84, 'd', 'I_2', cur(o, 'I2')) + arrow(420, 84, 'd', 'I_3', cur(o, 'I3'));
    return frame(520, 262, 'Circuito misto', s);
  };

  /** Rete E-R1-R2-R3 con il carico RL tra A e B (generatore di esercizi su Thevenin). */
  T.thevNet = (p, o = {}) => {
    let s = wire('M70 122 V50 H142 M198 50 H342 M398 50 H456 M270 50 V112 M270 168 V230 M70 158 V230 H456');
    s += gen(70, 140, 'E', p.E) + resH(170, 50, 'R_1', p.R1) + resV(270, 140, 'R_2', p.R2) + resH(370, 50, 'R_3', p.R3);
    s += `<rect class="dashbox" x="36" y="18" width="438" height="244" rx="6"/><text class="small" x="48" y="256">rete da sostituire con l'equivalente</text>`;
    s += dot(270, 50) + dot(270, 230) + term(460, 50) + term(460, 230) + nodeLbl(452, 38, 'A', 'end') + nodeLbl(452, 250, 'B', 'end');
    s += wire('M464 50 H570 V112 M570 168 V230 H464') + resV(570, 140, 'R_L', p.RL);
    if (showArrows(o)) s += arrow(522, 50, 'r', 'I_L', cur(o, 'IL'));
    return frame(660, 270, 'Rete con carico tra A e B', s);
  };

  /** Triangolo (a sinistra) e stella equivalente (a destra). */
  T.deltaStar = (p, o = {}) => {
    let s = '';
    const A = [140, 42], C = [50, 212], D = [230, 212];
    s += resLine(A[0], A[1], C[0], C[1], 'R_AC', p.Rac, false) + resLine(A[0], A[1], D[0], D[1], 'R_AD', p.Rad, true) + resLine(C[0], C[1], D[0], D[1], 'R_CD', p.Rcd, true);
    s += dot(...A) + dot(...C) + dot(...D) + nodeLbl(140, 28, 'A') + nodeLbl(38, 232, 'C') + nodeLbl(242, 232, 'D');
    const A2 = [430, 42], C2 = [340, 212], D2 = [520, 212], O = [430, 150];
    s += resLine(O[0], O[1], A2[0], A2[1], 'R_A', o.star ? o.star.Ra : null, false);
    s += resLine(O[0], O[1], C2[0], C2[1], 'R_C', o.star ? o.star.Rc : null, false);
    s += resLine(O[0], O[1], D2[0], D2[1], 'R_D', o.star ? o.star.Rd : null, true);
    s += dot(...A2) + dot(...C2) + dot(...D2) + dot(...O) + nodeLbl(430, 28, 'A') + nodeLbl(328, 232, 'C') + nodeLbl(532, 232, 'D') + nodeLbl(446, 160, 'O', 'start');
    s += `<text class="node" x="285" y="140" text-anchor="middle">⇄</text>`;
    return frame(570, 250, 'Triangolo e stella equivalente', s);
  };


  // ---------- Condensatori, induttori, deviatore ----------
  const fmtC = (v) => (v == null ? null : typeof v === 'string' ? v : si(v, 'F'));
  const fmtL = (v) => (v == null ? null : typeof v === 'string' ? v : si(v, 'H'));

  /** Condensatore su un filo orizzontale: occupa da cx−28 a cx+28 come un resistore. */
  function capH(cx, cy, name, val, o = {}) {
    const g = 5;
    return wire(`M${cx - 28} ${cy} H${cx - g} M${cx + g} ${cy} H${cx + 28}`) +
      `<path class="plate" d="M${cx - g} ${cy - 14} V${cy + 14} M${cx + g} ${cy - 14} V${cy + 14}"/>` +
      `<text x="${cx}" y="${cy - 20}" text-anchor="middle">${nm(name)}</text>` +
      (val != null ? `<text class="val" x="${cx}" y="${cy + 30}" text-anchor="middle">${fmtC(val)}</text>` : '') +
      (o.extra ? `<text class="vlbl" x="${cx}" y="${cy + 46}" text-anchor="middle">${o.extra}</text>` : '');
  }

  /** Condensatore su un filo verticale: da cy−28 a cy+28. */
  function capV(cx, cy, name, val, o = {}) {
    const g = 5;
    const left = o.side === 'left';
    return wire(`M${cx} ${cy - 28} V${cy - g} M${cx} ${cy + g} V${cy + 28}`) +
      `<path class="plate${o.hl ? ' hl' : ''}" d="M${cx - 14} ${cy - g} H${cx + 14} M${cx - 14} ${cy + g} H${cx + 14}"/>` +
      (o.pol ? `<text class="pm" x="${cx - 20}" y="${cy - 8}" text-anchor="middle">+</text>` : '') +
      label(left ? cx - 22 : cx + 22, cy - 4, name, fmtC(val), left ? 'end' : 'start') +
      (o.extra ? `<text class="vlbl" x="${left ? cx - 22 : cx + 22}" y="${cy + 30}" text-anchor="${left ? 'end' : 'start'}">${o.extra}</text>` : '');
  }

  /** Induttore su un filo verticale: quattro spire da cy−20 a cy+20. */
  function indV(cx, cy, name, val, o = {}) {
    const left = o.side === 'left';
    let d = `M${cx} ${cy - 20}`;
    for (let k = 0; k < 4; k++) d += ' a5 5 0 0 1 0 10';
    return wire(`M${cx} ${cy - 28} V${cy - 20} M${cx} ${cy + 20} V${cy + 28}`) + `<path class="coil" d="${d}"/>` +
      label(left ? cx - 16 : cx + 16, cy - 4, name, fmtL(val), left ? 'end' : 'start') +
      (o.extra ? `<text class="vlbl" x="${left ? cx - 16 : cx + 16}" y="${cy + 30}" text-anchor="${left ? 'end' : 'start'}">${o.extra}</text>` : '');
  }

  /** Induttore su un filo orizzontale: da cx−28 a cx+28. */
  function indH(cx, cy, name, val, o = {}) {
    let d = `M${cx - 20} ${cy}`;
    for (let k = 0; k < 4; k++) d += ' a5 5 0 0 1 10 0';
    return wire(`M${cx - 28} ${cy} H${cx - 20} M${cx + 20} ${cy} H${cx + 28}`) + `<path class="coil" d="${d}"/>` +
      `<text x="${cx}" y="${cy - 14}" text-anchor="middle">${nm(name)}</text>` +
      (val != null ? `<text class="val" x="${cx}" y="${cy + 24}" text-anchor="middle">${fmtL(val)}</text>` : '') +
      (o.extra ? `<text class="vlbl" x="${cx}" y="${cy + 40}" text-anchor="middle">${o.extra}</text>` : '');
  }

  /** Generatore sinusoidale. */
  function acGen(cx, cy, name, val, o = {}) {
    const left = o.side !== 'right';
    return `<circle class="comp" cx="${cx}" cy="${cy}" r="18"/><path class="wire" d="M${cx - 11} ${cy} q5.5 -13 11 0 t11 0" style="stroke-width:1.8"/>` +
      label(left ? cx - 26 : cx + 26, cy - 3, name, val == null ? null : typeof val === 'string' ? val : si(val, 'V'), left ? 'end' : 'start');
  }

  const fmtAny = (k, v) => (k === 'L' ? fmtL(v) : k === 'C' ? fmtC(v) : fmtR(v));
  /** Componente orizzontale o verticale secondo il tipo: R, L, C. */
  const partH = (q, cx, cy) => (q.k === 'L' ? indH : q.k === 'C' ? capH : resH)(cx, cy, q.name, q.val, { extra: q.extra });
  const partV = (q, cx, cy, side) => (q.k === 'L' ? indV : q.k === 'C' ? capV : resV)(cx, cy, q.name, q.val, { side, extra: q.extra });

  /** Circuito serie in alternata: p.parts = [{ k: 'R'|'L'|'C', name, val, extra }], p.V = valore del generatore. */
  T.acSeries = (p, o = {}) => {
    const n = p.parts.length;
    const xs = n === 1 ? [300] : n === 2 ? [210, 370] : [170, 290, 410];
    let d = 'M70 122 V50';
    xs.forEach((x) => { d += ` H${x - 28} M${x + 28} 50`; });
    d += ' H480 V230 H70 V158';
    let s = wire(d) + acGen(70, 140, 'V', p.V);
    p.parts.forEach((q, k) => { s += partH(q, xs[k], 50); });
    if (o.arrows !== false) s += arrow(110, 50, 'r', 'I', o.I != null ? o.I : null);
    return frame(540, 262, 'Circuito serie in alternata', s);
  };

  /** Rami in parallelo su un generatore sinusoidale. */
  T.acParallel = (p, o = {}) => {
    const n = p.parts.length;
    const xs = n === 2 ? [250, 410] : [210, 340, 470];
    const last = xs[n - 1];
    let s = wire(`M70 122 V45 H${last} M70 158 V230 H${last}`) + acGen(70, 140, 'V', p.V);
    p.parts.forEach((q, k) => {
      const x = xs[k];
      s += wire(`M${x} 45 V112 M${x} 168 V230`) + partV(q, x, 140);
      if (k < n - 1) s += dot(x, 45) + dot(x, 230);
      if (o.arrows !== false) s += arrow(x, 82, 'd', 'I_' + q.k, null);
    });
    if (o.arrows !== false) s += arrow(140, 45, 'r', 'I', null);
    return frame(n === 3 ? 580 : 520, 262, 'Rami in parallelo in alternata', s);
  };

  /** Filtro del primo ordine: elemento in serie (sopra) ed elemento verso massa; ingresso a sinistra, uscita a destra. */
  T.filter = (p, o = {}) => {
    let s = wire('M64 50 H142 M198 50 H360 M270 50 V112 M270 168 V230 M64 230 H360');
    s += term(60, 50) + term(60, 230) + term(364, 50) + term(364, 230) + dot(270, 50) + dot(270, 230);
    s += partH(p.ser, 170, 50) + partV(p.sh, 270, 140, 'left');
    s += `<path class="varrow" d="M40 222 V58"/><polygon class="vhead" points="35,64 40,54 45,64"/>` + label(32, 146, 'V_in', o.vin, 'end');
    s += `<path class="varrow" d="M384 222 V58"/><polygon class="vhead" points="379,64 384,54 389,64"/>` + label(394, 146, 'V_out', o.vout, 'start');
    return frame(480, 262, 'Filtro del primo ordine', s);
  };

  /** Circuito RC (o RL) con deviatore: posizione 1 = carica dal generatore, 2 = scarica a massa. */
  T.rc = (p, o = {}) => {
    const isL = o.kind === 'L';
    const pos = o.pos === 2 ? 2 : 1;
    let s = wire('M70 122 V50 H200 M214 96 V230 M70 158 V230 H470 M256 50 H292 M348 50 H470 V112 M470 168 V230');
    s += gen(70, 140, 'E', p.E) + resH(320, 50, 'R', p.R);
    s += isL ? indV(470, 140, 'L', p.L, { extra: o.v || '' }) : capV(470, 140, 'C', p.C, { extra: o.v || '' });
    s += term(200, 50) + term(214, 92) + term(256, 50);
    s += pos === 1 ? `<line class="wire" x1="256" y1="50" x2="204" y2="50"/>` : `<line class="wire" x1="256" y1="50" x2="217" y2="89"/>`;
    s += `<text class="small" x="196" y="34" text-anchor="middle">1 · carica</text><text class="small" x="226" y="118">2 · ${isL ? 'corto' : 'scarica'}</text>`;
    s += ground(300, 230);
    if (o.i != null || o.arrows) s += arrow(410, 50, o.i != null && o.i < 0 ? 'l' : 'r', 'i', o.i != null ? Math.abs(o.i) : null);
    return frame(612, 262, isL ? 'Circuito RL con deviatore' : 'Circuito RC con deviatore', s);
  };

  /** Reti di condensatori: kind = par | ser | mix (C1 in serie al parallelo C2 // C3). */
  T.capNet = (p, o = {}) => {
    const n = p.C.length;
    const ex = (k) => (o.extra ? o.extra[k] : '');
    let s = gen(70, 140, 'E', p.E);
    if (p.kind === 'par') {
      const xs = n === 3 ? [210, 340, 470] : [250, 430];
      const last = xs[xs.length - 1];
      s += wire(`M70 122 V45 H${last} M70 158 V235 H${last}`);
      xs.forEach((x, k) => {
        s += wire(`M${x} 45 V112 M${x} 168 V235`) + capV(x, 140, 'C_' + (k + 1), p.C[k], { extra: ex(k) });
        if (k < xs.length - 1) s += dot(x, 45) + dot(x, 235);
      });
    } else if (p.kind === 'ser') {
      const hx = n === 3 ? [190, 340] : [260];
      let d = 'M70 122 V50';
      hx.forEach((cx) => { d += ` H${cx - 28} M${cx + 28} 50`; });
      d += ' H470 V112 M470 168 V235 H70 V158';
      s += wire(d);
      hx.forEach((cx, k) => { s += capH(cx, 50, 'C_' + (k + 1), p.C[k], { extra: ex(k) }); });
      s += capV(470, 140, 'C_' + n, p.C[n - 1], { extra: ex(n - 1) });
    } else {
      s += wire('M70 122 V50 H162 M218 50 H440 V112 M300 50 V112 M300 168 V235 M440 168 V235 H70 V158');
      s += capH(190, 50, 'C_1', p.C[0], { extra: ex(0) }) + capV(300, 140, 'C_2', p.C[1], { extra: ex(1) }) + capV(440, 140, 'C_3', p.C[2], { extra: ex(2) });
      s += dot(300, 50) + dot(300, 235) + nodeLbl(300, 36, 'A');
    }
    return frame(612, 262, 'Rete di condensatori', s);
  };


  // ---------- Semiconduttori e operazionali ----------

  /**
   * Corpo di un diodo centrato in (cx, cy), orientato secondo ang (gradi: 0 = verso destra, 90 = verso il basso).
   * kind: 'd' (diodo), 'z' (Zener), 'led'. on: in conduzione (evidenziato). Occupa ±12 lungo la direzione.
   */
  function diodeBody(cx, cy, ang, kind = 'd', on = false) {
    let g = `<path class="dio${on ? ' on' : ''}" d="M${cx - 10} ${cy - 11} L${cx - 10} ${cy + 11} L${cx + 10} ${cy} Z"/>`;
    g += kind === 'z'
      ? `<path class="wire" d="M${cx + 5} ${cy - 15} L${cx + 10} ${cy - 11} V${cy + 11} L${cx + 15} ${cy + 15}"/>`
      : `<path class="wire" d="M${cx + 10} ${cy - 11} V${cy + 11}"/>`;
    g += `<path class="wire" d="M${cx - 12} ${cy} H${cx - 10} M${cx + 10} ${cy} H${cx + 12}"/>`;
    if (kind === 'led') {
      const ray = (x, y) => `<path class="ray" d="M${x} ${y} l9 -9 m-5 0 h5 v5"/>`;
      g += `<g class="${on ? 'ray-on' : ''}">${ray(cx + 2, cy - 12)}${ray(cx + 9, cy - 8)}</g>`;
    }
    return `<g transform="rotate(${ang} ${cx} ${cy})">${g}</g>`;
  }
  /** Diodo su un filo orizzontale (da cx−28 a cx+28); dir 'r' = conduce verso destra. */
  function diodeH(cx, cy, name, val, o = {}) {
    return wire(`M${cx - 28} ${cy} H${cx - 12} M${cx + 12} ${cy} H${cx + 28}`) + diodeBody(cx, cy, o.dir === 'l' ? 180 : 0, o.kind, o.on) +
      `<text x="${cx}" y="${cy - 20}" text-anchor="middle">${nm(name)}</text>` + (val != null ? `<text class="val" x="${cx}" y="${cy + 28}" text-anchor="middle">${val}</text>` : '');
  }
  /** Diodo su un filo verticale (da cy−28 a cy+28); dir 'd' = conduce verso il basso. */
  function diodeV(cx, cy, name, val, o = {}) {
    const left = o.side === 'left';
    return wire(`M${cx} ${cy - 28} V${cy - 12} M${cx} ${cy + 12} V${cy + 28}`) + diodeBody(cx, cy, o.dir === 'u' ? 270 : 90, o.kind, o.on) +
      label(left ? cx - 20 : cx + 20, cy - 4, name, val, left ? 'end' : 'start');
  }

  /** Transistor NPN: base a (cx−40, cy), collettore (cx+10, cy−36), emettitore (cx+10, cy+36). */
  function npn(cx, cy, name, o = {}) {
    const st = o.state ? ' ' + o.state : '';
    let s = `<circle class="comp bjt${st}" cx="${cx}" cy="${cy}" r="24"/>`;
    s += wire(`M${cx - 40} ${cy} H${cx - 9} M${cx - 9} ${cy - 15} V${cy + 15} M${cx - 9} ${cy - 7} L${cx + 10} ${cy - 20} V${cy - 36} M${cx - 9} ${cy + 7} L${cx + 10} ${cy + 20} V${cy + 36}`);
    s += `<polygon class="ahead" points="${cx + 10},${cy + 20} ${cx - 1},${cy + 19} ${cx + 5},${cy + 11}"/>`;
    if (name) s += `<text x="${cx + 30}" y="${cy + 5}">${nm(name)}</text>`;
    if (o.pins) s += `<text class="small" x="${cx - 36}" y="${cy - 6}">B</text><text class="small" x="${cx + 15}" y="${cy - 26}">C</text><text class="small" x="${cx + 15}" y="${cy + 34}">E</text>`;
    return s;
  }
  /** MOSFET a canale n ad arricchimento: gate (cx−40, cy), drain (cx+10, cy−36), source (cx+10, cy+36). */
  function nmos(cx, cy, name, o = {}) {
    const st = o.state ? ' ' + o.state : '';
    let s = `<circle class="comp bjt${st}" cx="${cx}" cy="${cy}" r="24"/>`;
    s += wire(`M${cx - 40} ${cy + 10} H${cx - 12} M${cx - 12} ${cy - 14} V${cy + 14}`);
    s += wire(`M${cx - 5} ${cy - 16} V${cy - 8} M${cx - 5} ${cy - 4} V${cy + 4} M${cx - 5} ${cy + 8} V${cy + 16}`);
    s += wire(`M${cx - 5} ${cy - 12} H${cx + 10} V${cy - 36} M${cx - 5} ${cy + 12} H${cx + 10} V${cy + 36} M${cx + 10} ${cy} V${cy + 12} M${cx - 5} ${cy} H${cx + 10}`);
    s += `<polygon class="ahead" points="${cx - 4},${cy} ${cx + 4},${cy - 4} ${cx + 4},${cy + 4}"/>`;
    if (name) s += `<text x="${cx + 30}" y="${cy + 5}">${nm(name)}</text>`;
    if (o.pins) s += `<text class="small" x="${cx - 36}" y="${cy + 4}">G</text><text class="small" x="${cx + 15}" y="${cy - 26}">D</text><text class="small" x="${cx + 15}" y="${cy + 34}">S</text>`;
    return s;
  }
  /** Morsetto con etichetta (ingresso o uscita). */
  function port(x, y, name, val, anchor = 'end') {
    return term(x, y) + label(anchor === 'end' ? x - 10 : x + 10, y - 2, name, val, anchor);
  }
  /** Alimentazione positiva: una barretta con l'etichetta. */
  function rail(x, y, text) {
    return wire(`M${x - 12} ${y} H${x + 12}`) + `<text class="small" x="${x}" y="${y - 7}" text-anchor="middle">${text}</text>`;
  }
  /** Operazionale: lato sinistro in x, centro in y; ingressi a y−20 e y+20, uscita a (x+80, y). plusTop: + in alto. */
  function opamp(x, y, o = {}) {
    const top = o.plusTop ? '+' : '−';
    const bot = o.plusTop ? '−' : '+';
    return `<path class="comp" d="M${x} ${y - 42} L${x} ${y + 42} L${x + 80} ${y} Z"/>` +
      `<text class="pm" x="${x + 9}" y="${y - 15}">${top}</text><text class="pm" x="${x + 9}" y="${y + 26}">${bot}</text>`;
  }

  /** E – R – diodo (o LED) verso massa. p: { E, R, kind, D, rev } */
  T.dioSeries = (p, o = {}) => {
    let s = wire('M70 122 V50 H172 M228 50 H340 V112 M340 168 V230 H70 V158');
    s += gen(70, 140, 'E', p.E) + resH(200, 50, 'R', p.R) + diodeV(340, 140, p.name || (p.kind === 'led' ? 'LED' : 'D'), p.D, { kind: p.kind, dir: p.rev ? 'u' : 'd', on: o.on });
    if (o.arrows !== false) s += arrow(270, 50, 'r', 'I', o.I != null ? o.I : null);
    return frame(470, 262, 'Diodo in serie a un resistore', s);
  };

  /** Raddrizzatore a una semionda, con condensatore di livellamento facoltativo. */
  T.halfWave = (p, o = {}) => {
    let s = wire('M70 122 V50 H172 M228 50 H420 V112 M420 168 V230 H70 V158');
    s += acGen(70, 140, 'v_s', p.V) + diodeH(200, 50, 'D', null, { on: o.on });
    s += resV(420, 140, 'R_L', p.RL);
    if (p.C != null) s += wire('M300 50 V112 M300 168 V230') + capV(300, 140, 'C', p.C) + dot(300, 50) + dot(300, 230);
    s += term(500, 50) + term(500, 230) + wire('M420 50 H496 M420 230 H496') + label(510, 146, 'v_o', null, 'start');
    return frame(580, 262, 'Raddrizzatore a una semionda', s);
  };

  /** Ponte di Graetz con carico (e condensatore facoltativo); o.half: 'pos' | 'neg' evidenzia i diodi in conduzione. */
  T.graetz = (p, o = {}) => {
    const Tn = [230, 40];
    const Rn = [310, 140];
    const Bn = [230, 240];
    const Ln = [150, 140];
    const pos = o.half === 'pos';
    const neg = o.half === 'neg';
    const seg = (a, b, name, on, lx, ly) => {
      const cx = (a[0] + b[0]) / 2;
      const cy = (a[1] + b[1]) / 2;
      const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
      const ux = Math.cos((ang * Math.PI) / 180);
      const uy = Math.sin((ang * Math.PI) / 180);
      return wire(`M${a[0]} ${a[1]} L${cx - 12 * ux} ${cy - 12 * uy} M${cx + 12 * ux} ${cy + 12 * uy} L${b[0]} ${b[1]}`) + diodeBody(cx, cy, ang, 'd', on) +
        `<text x="${cx + lx}" y="${cy + ly}" text-anchor="middle">${nm(name)}</text>`;
    };
    let s = acGen(70, 140, 'v_s', p.V) + wire(`M70 122 V40 H${Tn[0]} M70 158 V240 H${Bn[0]}`);
    s += seg(Tn, Rn, 'D_1', pos, -18, 26) + seg(Bn, Rn, 'D_2', neg, -18, -12) + seg(Ln, Bn, 'D_3', pos, 18, -12) + seg(Ln, Tn, 'D_4', neg, 18, 26);
    s += dot(...Tn) + dot(...Rn) + dot(...Bn) + dot(...Ln);
    s += wire(`M${Rn[0]} ${Rn[1]} H420 V162 M420 218 V240`) + resV(420, 190, 'R_L', p.RL) + ground(420, 240) + wire(`M${Ln[0]} ${Ln[1]} V204`) + ground(150, 204);
    if (p.C != null) s += wire('M420 140 H500 V162 M500 218 V240') + capV(500, 190, 'C', p.C) + ground(500, 240) + dot(420, 140);
    s += `<text class="small" x="${p.C != null ? 470 : 440}" y="128" text-anchor="middle">+ v<tspan class="sb" dy="3">o</tspan></text>`;
    return frame(p.C != null ? 600 : 520, 280, 'Raddrizzatore a ponte di Graetz', s);
  };

  /** Stabilizzatore con Zener: Vin – Rs – (Zener ∥ RL). */
  T.zener = (p, o = {}) => {
    let s = wire('M70 122 V50 H172 M228 50 H420 V112 M300 50 V112 M300 168 V230 M420 168 V230 H70 V158');
    s += gen(70, 140, 'V_in', p.Vin) + resH(200, 50, 'R_s', p.Rs) + diodeV(300, 140, 'D_z', p.Vz, { kind: 'z', dir: 'u', on: o.on }) + resV(420, 140, 'R_L', p.RL);
    s += dot(300, 50) + dot(300, 230);
    if (o.arrows !== false) s += arrow(266, 50, 'r', 'I_s', o.Is) + arrow(300, 92, 'd', 'I_z', o.Iz, { side: 'left' }) + arrow(420, 84, 'd', 'I_L', o.IL);
    return frame(540, 262, 'Stabilizzatore con diodo Zener', s);
  };

  /** Transistor (BJT o MOSFET) come interruttore: Vin – RB – base; carico (RC o LED + R) verso VCC. */
  T.switch = (p, o = {}) => {
    const mos = p.mos;
    let s = rail(310, 26, p.VCC != null ? '+' + si(p.VCC, 'V') : '+V<tspan dy="3" class="sb">CC</tspan>');
    if (p.led) s += wire('M310 26 V36 M310 92 V100 M310 156 V164') + resV(310, 64, 'R_C', p.RC) + diodeV(310, 128, 'LED', null, { kind: 'led', on: o.on });
    else s += wire('M310 26 V62 M310 118 V164') + resV(310, 90, p.load || 'R_C', p.RC);
    s += mos ? nmos(300, 200, 'M', { pins: true, state: o.state }) : npn(300, 200, 'Q', { pins: true, state: o.state });
    s += wire(`M310 236 V250`) + ground(310, 250);
    s += wire(`M128 ${mos ? 210 : 200} H${mos ? 260 : 172} ${mos ? '' : 'M228 200 H260'}`);
    if (!mos) s += resH(200, 200, 'R_B', p.RB);
    s += port(124, mos ? 210 : 200, 'V_in', p.Vin != null ? si(p.Vin, 'V') : null);
    return frame(440, 290, mos ? 'MOSFET come interruttore' : 'Transistor come interruttore', s);
  };

  /** Polarizzazione a partitore: R1, R2 sulla base, RC sul collettore, RE sull'emettitore. */
  T.bjtBias = (p, o = {}) => {
    let s = rail(150, 24, '+' + (p.VCC != null ? si(p.VCC, 'V') : 'V<tspan dy="3" class="sb">CC</tspan>')) + wire('M150 24 H270');
    s += wire('M150 24 V62 M150 118 V222 M150 278 V296 M150 170 H220') + resV(150, 90, 'R_1', p.R1, { side: 'left' }) + resV(150, 250, 'R_2', p.R2, { side: 'left' }) + ground(150, 296) + dot(150, 170);
    s += wire('M270 24 V62 M270 118 V134 M270 206 V222 M270 278 V296') + resV(270, 90, 'R_C', p.RC) + resV(270, 250, 'R_E', p.RE) + ground(270, 296);
    s += npn(260, 170, null, { state: o.state });
    if (o.VB != null) s += `<text class="vlbl" x="160" y="186">V<tspan class="sb" dy="3">B</tspan><tspan dy="-3"> = ${si(o.VB, 'V')}</tspan></text>`;
    if (o.VE != null) s += `<text class="vlbl" x="290" y="222">V<tspan class="sb" dy="3">E</tspan><tspan dy="-3"> = ${si(o.VE, 'V')}</tspan></text>`;
    if (o.VC != null) s += `<text class="vlbl" x="290" y="130">V<tspan class="sb" dy="3">C</tspan><tspan dy="-3"> = ${si(o.VC, 'V')}</tspan></text>`;
    if (o.IC != null) s += arrow(270, 126, 'd', 'I_C', o.IC, { side: 'left' });
    return frame(420, 320, 'Polarizzazione a partitore', s);
  };

  /** Operazionale nelle configurazioni tipiche. p.kind: inv | noninv | follower | sum | diff | comp. */
  T.opamp = (p, o = {}) => {
    const k = p.kind;
    const X = 220;
    const Y = 140;
    const v = (q) => (p[q] == null ? null : typeof p[q] === 'string' ? p[q] : si(p[q], 'Ω'));
    const vv = (q) => (p[q] == null ? null : typeof p[q] === 'string' ? p[q] : si(p[q], 'V'));
    let s = opamp(X, Y);
    s += wire(`M${X + 80} ${Y} H400`) + dot(330, Y) + port(404, Y, 'V_out', o.Vout != null ? si(o.Vout, 'V') : null, 'start');
    const fb = (rname) => wire(`M200 ${Y - 20} V50 H222 M278 50 H330 V${Y}`) + resH(250, 50, rname, v(rname.replace('_', ''))) + dot(200, Y - 20);
    if (k === 'inv') {
      s += port(56, Y - 20, 'V_in', vv('Vin')) + wire(`M60 ${Y - 20} H102 M158 ${Y - 20} H${X}`) + resH(130, Y - 20, 'R_1', v('R1')) + fb('R_f');
      s += wire(`M${X} ${Y + 20} H205 V170`) + ground(205, 170);
    } else if (k === 'noninv') {
      s += fb('R_f') + wire(`M${X} ${Y - 20} H170 V${Y - 8}`) + resV(170, Y + 20, 'R_1', v('R1'), { side: 'left' }) + ground(170, Y + 48);
      s += wire(`M${X} ${Y + 20} H205 V${Y + 90} H60`) + port(56, Y + 90, 'V_in', vv('Vin'));
    } else if (k === 'follower') {
      s += wire(`M${X} ${Y - 20} H200 V70 H330 V${Y}`) + dot(330, Y) + port(56, Y + 20, 'V_in', vv('Vin')) + wire(`M60 ${Y + 20} H${X}`);
    } else if (k === 'sum') {
      const ys = p.n === 4 ? [Y - 95, Y - 31, Y + 33, Y + 97] : [Y - 80, Y - 20, Y + 40];
      ys.forEach((y, i) => {
        s += port(56, y, 'V_' + (i + 1), vv('V' + (i + 1))) + wire(`M60 ${y} H102 M158 ${y} H180`) + resH(130, y, 'R_' + (i + 1), v('R' + (i + 1)));
      });
      s += wire(`M180 ${ys[0]} V${ys[ys.length - 1]} M180 ${Y - 20} H${X}`) + dot(180, Y - 20);
      s += wire(`M200 ${Y - 20} V30 H222 M278 30 H330 V${Y}`) + resH(250, 30, 'R_f', v('Rf')) + dot(200, Y - 20);
      s += wire(`M${X} ${Y + 20} H205 V${Y + 50}`) + ground(205, Y + 50);
    } else if (k === 'diff') {
      s += port(56, Y - 20, 'V_1', vv('V1')) + wire(`M60 ${Y - 20} H102 M158 ${Y - 20} H${X}`) + resH(130, Y - 20, 'R_1', v('R1')) + fb('R_2');
      s += port(56, Y + 45, 'V_2', vv('V2')) + wire(`M60 ${Y + 45} H102 M158 ${Y + 45} H200 V${Y + 20} H${X} M200 ${Y + 45} V${Y + 67} M200 ${Y + 123} V${Y + 130}`) + resH(130, Y + 45, 'R_3', v('R3')) + resV(200, Y + 95, 'R_4', v('R4')) + ground(200, Y + 130) + dot(200, Y + 45);
    } else {
      s += port(56, Y - 20, 'V_ref', vv('Vref')) + wire(`M60 ${Y - 20} H${X}`) + port(56, Y + 20, 'V_in', vv('Vin')) + wire(`M60 ${Y + 20} H${X}`);
    }
    if (o.supply) s += `<text class="small" x="${X + 20}" y="${Y - 50}">+${o.supply} V</text><text class="small" x="${X + 20}" y="${Y + 60}">−${o.supply} V</text>`;
    const H = k === 'diff' ? 300 : k === 'noninv' ? 260 : k === 'sum' ? (p.n === 4 ? 285 : 230) : 220;
    return frame(500, H, 'Amplificatore operazionale', s);
  };


  // ---------- Strumenti di misura e circuiti del biennio ----------
  /** Strumento: cerchio con la lettera (A, V, Ω) e la lettura accanto. side: 'above' | 'below' | 'left' | 'right'. */
  function meter(cx, cy, letter, reading, o = {}) {
    const side = o.side || 'above';
    const pos = { above: [cx, cy - 24, 'middle'], below: [cx, cy + 34, 'middle'], left: [cx - 24, cy + 4, 'end'], right: [cx + 24, cy + 4, 'start'] }[side];
    return `<circle class="comp meter${o.bad ? ' bad' : ''}" cx="${cx}" cy="${cy}" r="16"/><text class="mt" x="${cx}" y="${cy + 6}" text-anchor="middle">${letter}</text>` +
      (reading != null ? `<text class="rd${o.bad ? ' bad' : ''}" x="${pos[0]}" y="${pos[1]}" text-anchor="${pos[2]}">${reading}</text>` : '');
  }
  const termN = (x, y, name) => term(x, y) + `<text class="node" x="${x + 8}" y="${y - 8}">${name}</text>`;

  /** Generatore reale (E e r nel riquadro) con amperometro, voltmetro ai morsetti e carico R. o.open: interruttore aperto. */
  T.realGen = (p, o = {}) => {
    let s = `<rect class="dashbox" x="28" y="22" width="166" height="232" rx="6"/><text class="small" x="36" y="248">generatore reale</text>`;
    s += wire('M70 122 V50 H102 M158 50 H190 M70 158 V230 H190') + gen(70, 140, 'E', p.E) + resH(130, 50, 'r', p.r);
    s += termN(190, 50, 'A') + termN(190, 230, 'B');
    s += wire('M194 50 H284 M316 50 H350') + meter(300, 50, 'A', o.A, { side: 'above' });
    if (o.open) s += wire('M350 50 L384 30') + `<circle class="term" cx="350" cy="50" r="3"/><circle class="term" cx="392" cy="50" r="3"/>` + wire('M392 50 H430 V112');
    else s += wire('M350 50 H430 V112');
    s += wire('M430 168 V230 H194') + resV(430, 140, 'R', p.R);
    s += wire('M240 50 V124 M240 156 V230') + dot(240, 50) + dot(240, 230) + meter(240, 140, 'V', o.V, { side: 'right' });
    return frame(500, 270, 'Generatore reale con carico, amperometro e voltmetro', s);
  };

  /**
   * Inserzione degli strumenti: generatore E (con r), R1 facoltativo, carico R2.
   * o.A: 'serie' | 'parallelo' | null; o.V: 'parallelo' (ai capi di R2) | 'serie' | null; o.rA, o.rV: letture; o.blown: fusibile bruciato.
   */
  T.measure = (p, o = {}) => {
    let s = gen(70, 140, 'E', p.E);
    s += wire('M70 122 V50 H110');
    if (p.R1 != null) s += wire('M110 50 H142 M198 50 H230') + resH(170, 50, 'R_1', p.R1);
    else s += wire('M110 50 H230');
    if (o.A === 'serie') s += wire('M230 50 H264 M296 50 H360') + meter(280, 50, 'A', o.rA, { side: 'above', bad: o.blown });
    else s += wire('M230 50 H360');
    s += wire('M360 50 V112 M360 168 V230') + resV(360, 140, p.R1 != null ? 'R_2' : 'R', p.R2, { hl: o.hlR });
    if (o.V === 'serie') s += wire('M360 230 H246 M214 230 H70 V158') + meter(230, 230, 'V', o.rV, { side: 'below' });
    else s += wire('M360 230 H70 V158');
    let x = 360;
    if (o.A === 'parallelo') { s += wire(`M360 50 H440 V124 M440 156 V230 H360`) + dot(360, 50) + dot(360, 230) + meter(440, 140, 'A', o.rA, { side: 'right', bad: o.blown }); x = 440; }
    if (o.V === 'parallelo') {
      const vx = x + 80;
      s += wire(`M${x} 50 H${vx} V124 M${vx} 156 V230 H${x}`) + dot(x, 50) + dot(x, 230) + meter(vx, 140, 'V', o.rV, { side: 'right' });
      x = vx;
    }
    return frame(Math.max(460, x + 110), 270, 'Circuito con gli strumenti di misura', s);
  };

  /** Guasto a massa: rete con terra di cabina RN, differenziale, apparecchio con carcassa, terra RE e persona. */
  T.fault = (p, o = {}) => {
    let s = gen(60, 120, 'V', p.V);
    s += wire('M60 102 V40 H140') + `<rect class="comp${o.trip ? ' hl' : ''}" x="140" y="26" width="52" height="28" rx="3"/><text class="mt sm" x="166" y="45" text-anchor="middle">${o.rcd ? 'ΔI' : '—'}</text>`;
    s += `<text class="small" x="166" y="18" text-anchor="middle">${o.rcd ? (o.trip ? 'differenziale: scatta' : 'differenziale') : 'senza differenziale'}</text>`;
    s += wire(o.trip ? 'M192 40 H206 M222 40 H280' : 'M192 40 H280') + (o.trip ? '<path class="wire" d="M206 40 L220 28"/>' : '');
    s += `<rect class="case" x="280" y="20" width="110" height="80" rx="6"/><text class="small" x="384" y="94" text-anchor="end">carcassa</text>`;
    s += `<path class="fault" d="M280 40 H312 L320 52 L328 40 L336 60"/><text class="small bad" x="300" y="76" text-anchor="middle">guasto</text>`;
    s += wire('M60 138 V160') + resV(60, 190, 'R_N', p.RN) + wire('M60 218 V240') + ground(60, 240);
    s += `<text class="small" x="18" y="280">terra della cabina</text>`;
    if (o.earth) s += wire('M320 100 V160') + resV(320, 190, 'R_E', p.RE, { side: 'left' }) + wire('M320 218 V240') + ground(320, 240) + `<text class="small" x="320" y="280" text-anchor="middle">terra dell'impianto</text>`;
    else s += `<text class="small bad" x="320" y="130" text-anchor="middle">nessun collegamento a terra</text>`;
    // la persona tocca la carcassa
    const px = 450;
    s += `<g class="person${o.danger ? ' danger' : ''}"><circle cx="${px}" cy="62" r="11"/><path d="M${px} 73 V130 M${px} 88 L392 70 M${px} 88 L${px + 22} 115 M${px} 130 L${px - 13} 176 M${px} 130 L${px + 13} 176"/></g>`;
    s += wire(`M${px} 178 V190`) + resV(px, 210, 'R_p', p.Rfloor) + ground(px, 238);
    s += `<text class="small" x="${px + 26}" y="100">corpo</text><text class="small" x="${px + 26}" y="114">${p.Rbody != null ? si(p.Rbody, 'Ω') : ''}</text>`;
    s += `<path class="earthline" d="M40 259 H500"/>`;
    if (o.Ib != null) s += `<text class="rd${o.danger ? ' bad' : ''}" x="${px + 8}" y="40">I<tspan class="sb" dy="3">b</tspan><tspan dy="-3"> = ${si(o.Ib, 'A')}</tspan></text>`;
    if (o.Ig != null && o.earth) s += `<text class="rd" x="330" y="150">I<tspan class="sb" dy="3">g</tspan><tspan dy="-3"> = ${si(o.Ig, 'A')}</tspan></text>`;
    return frame(540, 290, 'Guasto a massa di un apparecchio e persona che lo tocca', s);
  };

  App.Schem = { T, nm, capV, capH, indV, indH, acGen, diodeH, diodeV, diodeBody, npn, nmos, opamp, port, rail, meter };
})();
