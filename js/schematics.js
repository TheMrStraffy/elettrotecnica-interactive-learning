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

  App.Schem = { T, nm, capV, capH, indV };
})();
