/* 4ª — strumenti comuni: sinusoidi, fasori, scala logaritmica, oscilloscopio, formati dei complessi */
(function () {
  'use strict';
  const App = window.App;
  const A = window.AC;
  const K = App.CC;
  const { N } = App.Lessons.fmt;
  const Q = (App.Q = {});

  // ---------- Formati ----------
  /** a + jb, con il segno giusto e senza parti nulle. */
  Q.cRect = (z, unit = '', sig = 4) => {
    const re = Math.abs(z.re) < 1e-9 * (Math.abs(z.im) + 1) ? 0 : z.re;
    const im = Math.abs(z.im) < 1e-9 * (Math.abs(z.re) + 1) ? 0 : z.im;
    const u = unit ? ' ' + unit : '';
    if (!im) return N(re, sig) + u;
    const jb = 'j' + N(Math.abs(im), sig);
    if (!re) return (im < 0 ? '−' : '') + jb + u;
    return `${unit ? '(' : ''}${N(re, sig)} ${im < 0 ? '−' : '+'} ${jb}${unit ? ')' : ''}${u}`;
  };
  /** modulo ∠ angolo° */
  Q.cPol = (z, unit = '', sig = 4) => `${N(A.abs(z), sig)}${unit ? ' ' + unit : ''} ∠ ${N(A.argDeg(z), sig)}°`;
  Q.pol = (mag, deg, unit = '', sig = 4) => `${N(mag, sig)}${unit ? ' ' + unit : ''} ∠ ${N(deg, sig)}°`;

  // ---------- Domande ----------
  Q.qDeg = (label, deg) => ({ label, unit: '°', value: deg, signNote: 'Controlla il segno dell\'angolo: negativo vuol dire in ritardo (sotto l\'asse reale).' });
  Q.qHz = (label, f) => (f >= 1e6 ? { label, unit: 'MHz', value: f / 1e6 } : f >= 1000 ? { label, unit: 'kHz', value: f / 1000 } : { label, unit: 'Hz', value: f });
  Q.qL = (label, L) => (L >= 1 ? { label, unit: 'H', value: L } : L >= 1e-3 ? { label, unit: 'mH', value: L * 1e3 } : { label, unit: 'µH', value: L * 1e6 });
  Q.qC = (label, C) => (C >= 1e-6 ? { label, unit: 'µF', value: C * 1e6 } : C >= 1e-9 ? { label, unit: 'nF', value: C * 1e9 } : { label, unit: 'pF', value: C * 1e12 });
  Q.qT = (label, t) => (t >= 1 ? { label, unit: 's', value: t } : t >= 1e-3 ? { label, unit: 'ms', value: t * 1e3 } : { label, unit: 'µs', value: t * 1e6 });
  /** Potenze: base 'W', 'var' o 'VA'; sopra 1000 in k. */
  Q.qPow = (label, x, base) => (Math.abs(x) >= 1000 ? { label, unit: 'k' + base, value: x / 1000 } : { label, unit: base, value: x });
  Q.qX = (label, x) => K.h.qR(label, x);
  Q.fmtPow = (x, base) => (Math.abs(x) >= 1000 ? N(x / 1000) + ' k' + base : N(x) + ' ' + base);

  // ---------- Disegno ----------
  const arrowHead = (x1, y1, x2, y2, size = 8) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p = (da) => `${x2 - size * Math.cos(a + da)},${y2 - size * Math.sin(a + da)}`;
    return `${x2},${y2} ${p(0.42)} ${p(-0.42)}`;
  };
  Q.arrowHead = arrowHead;

  /**
   * Sinusoidi nel tempo. o: { W, H, tmax, ymax, traces: [{ amp, f, deg, cls, dash, off }], hl: [{ y, cls, label }], marks: [{ t, label }], ylabel, yu }
   */
  Q.waveSVG = (o) => {
    const W = o.W || 520;
    const H = o.H || 220;
    const ch = K.chart({ W, H, xmax: o.tmax, ymin: -o.ymax, ymax: o.ymax, xu: o.xu === undefined ? 's' : o.xu, yu: o.yu === undefined ? 'V' : o.yu, xlabel: o.xlabel || 't', ylabel: o.ylabel || '', ticks: 4 });
    let s = ch.s + `<line class="axis" x1="${ch.X(0)}" y1="${ch.Y(0)}" x2="${ch.X(o.tmax)}" y2="${ch.Y(0)}"/>`;
    (o.hl || []).forEach((l) => { s += `<line class="${l.cls || 'guide'}" x1="${ch.X(0)}" y1="${ch.Y(l.y)}" x2="${ch.X(o.tmax)}" y2="${ch.Y(l.y)}"/>` + (l.label ? `<text class="wlbl" x="${ch.X(o.tmax) - 4}" y="${ch.Y(l.y) - 4}" text-anchor="end">${l.label}</text>` : ''); });
    (o.marks || []).forEach((m) => { s += `<line class="guide" x1="${ch.X(m.t)}" y1="${ch.Y(o.ymax)}" x2="${ch.X(m.t)}" y2="${ch.Y(-o.ymax)}"/>` + (m.label ? `<text class="wlbl" x="${ch.X(m.t) + 4}" y="${ch.Y(o.ymax) + 12}">${m.label}</text>` : ''); });
    o.traces.forEach((tr) => {
      let d = '';
      const n = 360;
      for (let k = 0; k <= n; k++) {
        const t = (o.tmax * k) / n;
        const y = tr.fn ? tr.fn(t) : (tr.off || 0) + tr.amp * Math.sin(A.TAU * tr.f * t + tr.deg * A.D2R);
        d += (k ? 'L' : 'M') + ch.X(t).toFixed(1) + ' ' + ch.Y(App.clamp(y, -o.ymax * 1.05, o.ymax * 1.05)).toFixed(1);
      }
      s += `<path class="${tr.cls || 'gen'}" d="${d}"${tr.dash ? ' stroke-dasharray="6 4"' : ''}/>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>${o.title || 'Andamento nel tempo'}</title>${s}</svg>`;
  };

  /**
   * Diagramma dei fasori. o: { W, H, vecs: [{ z, from, label, cls }], max, title, axes }
   * Il disegno si adatta al fasore più lungo (contando anche quelli concatenati).
   */
  Q.phasorSVG = (o) => {
    const W = o.W || 300;
    const H = o.H || 300;
    const tips = [];
    o.vecs.forEach((v) => { const f = v.from || A.cx(0, 0); tips.push(f, A.add(f, v.z)); });
    const max = o.max || Math.max(1e-12, ...tips.map((z) => Math.max(Math.abs(z.re), Math.abs(z.im))));
    // centro: se tutto sta a destra/sopra, sposta l'origine per usare meglio lo spazio
    const minRe = Math.min(0, ...tips.map((z) => z.re));
    const maxRe = Math.max(0, ...tips.map((z) => z.re));
    const minIm = Math.min(0, ...tips.map((z) => z.im));
    const maxIm = Math.max(0, ...tips.map((z) => z.im));
    const pad = 34;
    const k = Math.min((W - 2 * pad) / Math.max(maxRe - minRe, max * 0.5), (H - 2 * pad) / Math.max(maxIm - minIm, max * 0.5));
    const ox = pad + (W - 2 * pad - (maxRe - minRe) * k) / 2 - minRe * k;
    const oy = H - pad - (H - 2 * pad - (maxIm - minIm) * k) / 2 + minIm * k;
    const P = (z) => [ox + z.re * k, oy - z.im * k];
    let s = `<line class="gridl" x1="8" y1="${oy}" x2="${W - 8}" y2="${oy}"/><line class="gridl" x1="${ox}" y1="8" x2="${ox}" y2="${H - 8}"/>`;
    s += `<text class="wlbl" x="${W - 10}" y="${oy - 5}" text-anchor="end">Re</text><text class="wlbl" x="${ox + 5}" y="16">Im</text>`;
    (o.arcs || []).forEach((a) => {
      const r = a.r || 34;
      const a1 = (a.from || 0) * A.D2R;
      const a2 = a.to * A.D2R;
      const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
      const sweep = a2 < a1 ? 1 : 0;
      s += `<path class="arc" d="M${ox + r * Math.cos(a1)} ${oy - r * Math.sin(a1)} A${r} ${r} 0 ${large} ${sweep} ${ox + r * Math.cos(a2)} ${oy - r * Math.sin(a2)}"/>`;
      const am = (a1 + a2) / 2;
      if (a.label) s += `<text class="wlbl" x="${ox + (r + 12) * Math.cos(am)}" y="${oy - (r + 12) * Math.sin(am) + 4}" text-anchor="middle">${a.label}</text>`;
    });
    // baricentro dei punti medi: le etichette si spostano dalla parte opposta, verso l'esterno
    const mids = o.vecs.map((v) => { const f = v.from || A.cx(0, 0); return P(A.add(f, A.scale(v.z, 0.5))); });
    const cxm = mids.reduce((a, m) => a + m[0], 0) / Math.max(1, mids.length);
    const cym = mids.reduce((a, m) => a + m[1], 0) / Math.max(1, mids.length);
    o.vecs.forEach((v) => {
      const f = v.from || A.cx(0, 0);
      const [x1, y1] = P(f);
      const [x2, y2] = P(A.add(f, v.z));
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 2) return;
      s += `<line class="ph ${v.cls || ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${v.dash ? ' stroke-dasharray="5 4"' : ''}/><polygon class="phh ${v.cls || ''}" points="${arrowHead(x1, y1, x2, y2)}"/>`;
      if (v.label) {
        let lx;
        let ly;
        if (v.tip || (v.cls === 'ps' && !v.mid)) {
          // il risultato: etichetta oltre la punta
          const ang = Math.atan2(y2 - y1, x2 - x1);
          lx = x2 + 14 * Math.cos(ang);
          ly = y2 + 14 * Math.sin(ang) + 4;
        } else {
          // gli altri: a metà del lato, dalla parte lontana dal centro del disegno
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          let nx = -(y2 - y1) / len;
          let ny = (x2 - x1) / len;
          if (v.side ? (v.side === 'r') !== (nx > 0) : nx * (mx - cxm) + ny * (my - cym) < 0) { nx = -nx; ny = -ny; }
          lx = mx + 14 * nx;
          ly = my + 14 * ny + 5;
        }
        s += `<text class="phl ${v.cls || ''}" x="${lx + (v.dx || 0)}" y="${ly + (v.dy || 0)}" text-anchor="middle">${v.label}</text>`;
      }
    });
    return `<svg class="chart phasor" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto;max-width:${W}px"><title>${o.title || 'Diagramma dei fasori'}</title>${s}</svg>`;
  };

  /** Grafico con asse x logaritmico (frequenza). o: { W, H, fmin, fmax, ymin, ymax, ystep, yu } */
  Q.logChart = (o) => {
    const W = o.W || 520;
    const H = o.H || 220;
    const x0 = 52;
    const x1 = W - 14;
    const y0 = H - 30;
    const y1 = 12;
    const l0 = Math.log10(o.fmin);
    const l1 = Math.log10(o.fmax);
    const X = (f) => x0 + ((x1 - x0) * (Math.log10(f) - l0)) / (l1 - l0);
    const Y = (y) => y0 - ((y0 - y1) * (y - o.ymin)) / (o.ymax - o.ymin);
    let s = '';
    for (let d = Math.floor(l0); d <= Math.ceil(l1); d++) {
      for (let m = 1; m < 10; m++) {
        const f = m * Math.pow(10, d);
        if (f < o.fmin * 0.999 || f > o.fmax * 1.001) continue;
        s += `<line class="gridl${m === 1 ? '' : ' minor'}" x1="${X(f)}" y1="${y0}" x2="${X(f)}" y2="${y1}"/>`;
        if (m === 1) s += `<text x="${X(f)}" y="${y0 + 15}" text-anchor="middle">${o.xfmt ? o.xfmt(f) : App.si(f, 'Hz', 2)}</text>`;
      }
    }
    for (let y = o.ymin; y <= o.ymax + 1e-9; y += o.ystep) {
      s += `<line class="gridl" x1="${x0}" y1="${Y(y)}" x2="${x1}" y2="${Y(y)}"/><text x="${x0 - 6}" y="${Y(y) + 3.5}" text-anchor="end">${N(y)}${o.yu ? ' ' + o.yu : ''}</text>`;
    }
    s += `<line class="axis" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}"/><line class="axis" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}"/>`;
    const path = (fn, n = 240) => {
      let d = '';
      for (let k = 0; k <= n; k++) {
        const f = Math.pow(10, l0 + ((l1 - l0) * k) / n);
        d += (k ? 'L' : 'M') + X(f).toFixed(1) + ' ' + Y(App.clamp(fn(f), o.ymin - 5, o.ymax + 5)).toFixed(1);
      }
      return d;
    };
    return { X, Y, s, W, H, path, wrap: (body, title) => `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto"><title>${title}</title><defs><clipPath id="clip-${W}-${H}"><rect x="${x0}" y="${y1 - 2}" width="${x1 - x0}" height="${y0 - y1 + 4}"/></clipPath></defs>${s}<g clip-path="url(#clip-${W}-${H})">${body}</g></svg>` };
  };

  /**
   * Schermo dell'oscilloscopio 10 × 8 divisioni. o: { vdiv, tdiv, amp, f, deg, off, amp2, deg2 }
   */
  Q.scopeSVG = (o) => {
    const W = 400;
    const H = 320;
    const dx = W / 10;
    const dy = H / 8;
    let s = `<rect class="scr" x="0" y="0" width="${W}" height="${H}" rx="6"/>`;
    for (let i = 1; i < 10; i++) s += `<line class="sgrid${i === 5 ? ' mid' : ''}" x1="${i * dx}" y1="0" x2="${i * dx}" y2="${H}"/>`;
    for (let j = 1; j < 8; j++) s += `<line class="sgrid${j === 4 ? ' mid' : ''}" x1="0" y1="${j * dy}" x2="${W}" y2="${j * dy}"/>`;
    const trace = (amp, deg, cls) => {
      let d = '';
      for (let k = 0; k <= 400; k++) {
        const t = (k / 400) * 10 * o.tdiv;
        const v = (o.off || 0) + amp * Math.sin(A.TAU * o.f * t + deg * A.D2R);
        d += (k ? 'L' : 'M') + ((k / 400) * W).toFixed(1) + ' ' + App.clamp(H / 2 - (v / o.vdiv) * dy, -5, H + 5).toFixed(1);
      }
      return `<path class="${cls}" d="${d}"/>`;
    };
    s += trace(o.amp, o.deg || 0, 'strace');
    if (o.amp2) s += trace(o.amp2, o.deg2 || 0, 'strace2');
    return `<div class="scope"><svg viewBox="0 0 ${W} ${H}" role="img"><title>Schermo dell'oscilloscopio</title>${s}</svg><p class="scope-lbl">${N(o.vdiv)} V/div · ${App.si(o.tdiv, 's')}/div</p></div>`;
  };
})();
