/*
 * Reti in corrente continua: risolutore generale (analisi nodale modificata)
 * e i metodi "da quaderno" (correnti di ramo, maglie, Millman, sovrapposizione,
 * Thevenin/Norton, stella-triangolo) scritti come nelle lezioni.
 * Il risolutore è il riferimento: i test controllano che ogni metodo dia lo stesso risultato.
 * Funziona nel browser (window.DC) e in Node (require) per i test.
 */
(function (root) {
  'use strict';

  /**
   * Elementi della rete (il nodo '0' è la massa):
   *   { type: 'R', name, a, b, value }   corrente positiva da a verso b
   *   { type: 'V', name, p, n, value }   generatore di tensione, + sul nodo p
   *   { type: 'I', name, from, to, value } generatore di corrente, la corrente esce in "to"
   * Restituisce i potenziali dei nodi, la corrente di ogni elemento e la sua potenza.
   * Per un generatore di tensione la corrente è quella che esce dal + verso il circuito
   * e la potenza è positiva se erogata.
   */
  function solve(elements) {
    const nodes = [];
    const idx = (n) => {
      if (n === '0') return -1;
      let k = nodes.indexOf(n);
      if (k < 0) { nodes.push(n); k = nodes.length - 1; }
      return k;
    };
    elements.forEach((e) => {
      if (e.type === 'R') { idx(e.a); idx(e.b); }
      else if (e.type === 'V') { idx(e.p); idx(e.n); }
      else if (e.type === 'I') { idx(e.from); idx(e.to); }
    });
    const vs = elements.filter((e) => e.type === 'V');
    const N = nodes.length;
    const M = N + vs.length;
    const A = Array.from({ length: M }, () => new Array(M).fill(0));
    const z = new Array(M).fill(0);
    elements.forEach((e) => {
      if (e.type === 'R') {
        const g = 1 / e.value;
        const a = idx(e.a);
        const b = idx(e.b);
        if (a >= 0) A[a][a] += g;
        if (b >= 0) A[b][b] += g;
        if (a >= 0 && b >= 0) { A[a][b] -= g; A[b][a] -= g; }
      } else if (e.type === 'I') {
        const f = idx(e.from);
        const t = idx(e.to);
        if (f >= 0) z[f] -= e.value;
        if (t >= 0) z[t] += e.value;
      }
    });
    vs.forEach((e, k) => {
      const row = N + k;
      const p = idx(e.p);
      const n = idx(e.n);
      // variabile: corrente che entra nel + dal circuito e attraversa il generatore verso il −
      if (p >= 0) { A[p][row] += 1; A[row][p] += 1; }
      if (n >= 0) { A[n][row] -= 1; A[row][n] -= 1; }
      z[row] = e.value;
    });
    const x = gauss(A, z);
    const v = { 0: 0 };
    nodes.forEach((n, k) => { v[n] = x[k]; });
    const i = {};
    const p = {};
    elements.forEach((e) => {
      if (e.type === 'R') {
        i[e.name] = (v[e.a] - v[e.b]) / e.value;
        p[e.name] = e.value * i[e.name] * i[e.name];
      } else if (e.type === 'V') {
        i[e.name] = -x[N + vs.indexOf(e)];
        p[e.name] = e.value * i[e.name];
      } else {
        i[e.name] = e.value;
        p[e.name] = (v[e.to] - v[e.from]) * e.value;
      }
    });
    return { v, i, p, nodes };
  }

  function gauss(A0, b0) {
    const n = b0.length;
    const A = A0.map((r) => r.slice());
    const b = b0.slice();
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      if (Math.abs(A[piv][c]) < 1e-12) throw new Error('rete non risolvibile');
      [A[c], A[piv]] = [A[piv], A[c]];
      [b[c], b[piv]] = [b[piv], b[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = A[r][c] / A[c][c];
        if (!f) continue;
        for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
        b[r] -= f * b[c];
      }
    }
    return b.map((v, k) => v / A[k][k]);
  }

  const par = (...rs) => 1 / rs.reduce((s, r) => s + 1 / r, 0);

  // ---------- Reti tipo usate nelle lezioni (stessi nomi dei disegni) ----------
  const nets = {
    single: (p) => [
      { type: 'V', name: 'E', p: 'A', n: '0', value: p.E },
      { type: 'R', name: 'R', a: 'A', b: '0', value: p.R },
    ],
    series: (p) => {
      const out = [{ type: 'V', name: 'E', p: 'N0', n: '0', value: p.E }];
      p.R.forEach((r, k) => out.push({ type: 'R', name: 'R' + (k + 1), a: 'N' + k, b: k === p.R.length - 1 ? '0' : 'N' + (k + 1), value: r }));
      return out;
    },
    parallel: (p) => [{ type: 'V', name: 'E', p: 'A', n: '0', value: p.E }].concat(
      p.R.map((r, k) => ({ type: 'R', name: 'R' + (k + 1), a: 'A', b: '0', value: r }))
    ),
    currentDivider: (p) => [
      { type: 'I', name: 'I', from: '0', to: 'A', value: p.I },
      { type: 'R', name: 'R1', a: 'A', b: '0', value: p.R1 },
      { type: 'R', name: 'R2', a: 'A', b: '0', value: p.R2 },
    ],
    // R1 in serie, R2 // R3 tra A e B, R4 sul ritorno
    mixA: (p) => [
      { type: 'V', name: 'E', p: 'P', n: '0', value: p.E },
      { type: 'R', name: 'R1', a: 'P', b: 'A', value: p.R1 },
      { type: 'R', name: 'R2', a: 'A', b: 'B', value: p.R2 },
      { type: 'R', name: 'R3', a: 'A', b: 'B', value: p.R3 },
      { type: 'R', name: 'R4', a: 'B', b: '0', value: p.R4 },
    ],
    // (R1 + R2) // R3
    mixB: (p) => [
      { type: 'V', name: 'E', p: 'A', n: '0', value: p.E },
      { type: 'R', name: 'R1', a: 'A', b: 'M', value: p.R1 },
      { type: 'R', name: 'R2', a: 'M', b: '0', value: p.R2 },
      { type: 'R', name: 'R3', a: 'A', b: '0', value: p.R3 },
    ],
    // R1 + R2 // (R3 + R4)
    mixC: (p) => [
      { type: 'V', name: 'E', p: 'P', n: '0', value: p.E },
      { type: 'R', name: 'R1', a: 'P', b: 'A', value: p.R1 },
      { type: 'R', name: 'R2', a: 'A', b: '0', value: p.R2 },
      { type: 'R', name: 'R3', a: 'A', b: 'Q', value: p.R3 },
      { type: 'R', name: 'R4', a: 'Q', b: '0', value: p.R4 },
    ],
    // circuito di riferimento: E1-R1 | R3 | R2-E2 tra i nodi A e B (massa)
    twoGen: (p, off) => [
      { type: 'V', name: 'E1', p: 'P1', n: '0', value: off === 'E1' ? 0 : p.E1 },
      { type: 'R', name: 'R1', a: 'P1', b: 'A', value: p.R1 },
      { type: 'V', name: 'E2', p: 'P2', n: '0', value: off === 'E2' ? 0 : p.E2 },
      { type: 'R', name: 'R2', a: 'P2', b: 'A', value: p.R2 },
      { type: 'R', name: 'R3', a: 'A', b: '0', value: p.R3 },
    ],
    // tre rami tra A e B (massa), ogni ramo: generatore in basso, resistore in alto
    millman3: (p) => {
      const out = [];
      p.br.forEach((b, k) => {
        const m = 'M' + (k + 1);
        if (b.E) out.push({ type: 'V', name: 'E' + (k + 1), p: b.up ? m : '0', n: b.up ? '0' : m, value: b.E });
        out.push({ type: 'R', name: 'R' + (k + 1), a: b.E ? m : '0', b: 'A', value: b.R });
      });
      return out;
    },
    // ponte: R1 A-C, R2 A-D, R3 C-B, R4 D-B, R5 C-D, generatore tra A e B (massa)
    bridge: (p) => [
      { type: 'V', name: 'E', p: 'A', n: '0', value: p.E },
      { type: 'R', name: 'R1', a: 'A', b: 'C', value: p.R1 },
      { type: 'R', name: 'R2', a: 'A', b: 'D', value: p.R2 },
      { type: 'R', name: 'R3', a: 'C', b: '0', value: p.R3 },
      { type: 'R', name: 'R4', a: 'D', b: '0', value: p.R4 },
      { type: 'R', name: 'R5', a: 'C', b: 'D', value: p.R5 },
    ],
    real: (p) => [
      { type: 'V', name: 'E', p: 'P', n: '0', value: p.E },
      { type: 'R', name: 'Ri', a: 'P', b: 'A', value: p.Ri },
      { type: 'R', name: 'RL', a: 'A', b: '0', value: p.RL },
    ],
  };

  // ---------- Metodi sul circuito di riferimento ----------
  function branch(p) {
    const a1 = p.E1 / p.R1, b1 = p.R3 / p.R1, a2 = p.E2 / p.R2, b2 = p.R3 / p.R2;
    const I3 = (a1 + a2) / (1 + b1 + b2);
    const I1 = a1 - b1 * I3;
    const I2 = a2 - b2 * I3;
    return { a1, b1, a2, b2, I1, I2, I3, VA: p.R3 * I3 };
  }

  function mesh(p) {
    const a11 = p.R1 + p.R3, a12 = -p.R3, a22 = p.R2 + p.R3, b1 = p.E1, b2 = -p.E2;
    const D = a11 * a22 - a12 * a12;
    const Da = b1 * a22 - a12 * b2;
    const Db = a11 * b2 - a12 * b1;
    const Ia = Da / D, Ib = Db / D;
    return { a11, a12, a22, b1, b2, D, Da, Db, Ia, Ib, I1: Ia, I2: -Ib, I3: Ia - Ib, VA: p.R3 * (Ia - Ib) };
  }

  function millman(p) {
    const num = p.E1 / p.R1 + p.E2 / p.R2;
    const den = 1 / p.R1 + 1 / p.R2 + 1 / p.R3;
    const VA = num / den;
    return { num, den, VA, I1: (p.E1 - VA) / p.R1, I2: (p.E2 - VA) / p.R2, I3: VA / p.R3 };
  }

  function superposition(p) {
    const R23 = par(p.R2, p.R3);
    const Req1 = p.R1 + R23;
    const I1a = p.E1 / Req1;
    const VAa = R23 * I1a;
    const a = { R23, Req: Req1, I1: I1a, VA: VAa, I3: VAa / p.R3, I2: -VAa / p.R2 };
    const R13 = par(p.R1, p.R3);
    const Req2 = p.R2 + R13;
    const I2b = p.E2 / Req2;
    const VAb = R13 * I2b;
    const b = { R13, Req: Req2, I2: I2b, VA: VAb, I3: VAb / p.R3, I1: -VAb / p.R1 };
    return { a, b, I1: a.I1 + b.I1, I2: a.I2 + b.I2, I3: a.I3 + b.I3, VA: a.VA + b.VA };
  }

  function thevenin(p) {
    const I0 = (p.E1 - p.E2) / (p.R1 + p.R2);
    const Vth = p.E1 - p.R1 * I0;
    const Rth = par(p.R1, p.R2);
    const In = p.E1 / p.R1 + p.E2 / p.R2;
    const I3 = Vth / (Rth + p.R3);
    return { I0, Vth, Rth, In, I3, VA: p.R3 * I3 };
  }

  function millmanN(br) {
    const num = br.reduce((s, b) => s + (b.E ? (b.up ? 1 : -1) * b.E : 0) / b.R, 0);
    const den = br.reduce((s, b) => s + 1 / b.R, 0);
    const VA = num / den;
    return { num, den, VA, I: br.map((b) => ((b.E ? (b.up ? 1 : -1) * b.E : 0) - VA) / b.R) };
  }

  function deltaToStar(Rab, Rac, Rbc) {
    const S = Rab + Rac + Rbc;
    return { S, Ra: (Rab * Rac) / S, Rb: (Rab * Rbc) / S, Rc: (Rac * Rbc) / S };
  }

  function starToDelta(Ra, Rb, Rc) {
    const P = Ra * Rb + Ra * Rc + Rb * Rc;
    return { P, Rab: P / Rc, Rac: P / Rb, Rbc: P / Ra };
  }

  /** Ponte risolto con la trasformazione del triangolo A-C-D, come nel Modulo 10. */
  function bridgeDeltaStar(p) {
    const t = deltaToStar(p.R1, p.R2, p.R5); // lati A-C, A-D, C-D → stelle in A, C, D
    const RA = t.Ra, RC = t.Rb, RD = t.Rc;
    const left = RC + p.R3;
    const right = RD + p.R4;
    const Rp = par(left, right);
    const Req = RA + Rp;
    const I = p.E / Req;
    const I3 = (I * right) / (left + right);
    const I4 = (I * left) / (left + right);
    const VC = p.R3 * I3;
    const VD = p.R4 * I4;
    return {
      S: t.S, RA, RC, RD, left, right, Rp, Req, I, I3, I4, VC, VD,
      I1: (p.E - VC) / p.R1, I2: (p.E - VD) / p.R2, I5: (VC - VD) / p.R5,
    };
  }

  /** Un numero è "pulito" se ha al massimo 3 cifre significative. */
  function clean(x, sig = 3) {
    if (!isFinite(x)) return false;
    if (Math.abs(x) < 1e-12) return true;
    return Math.abs(x - Number(x.toPrecision(sig))) <= 1e-9 * Math.max(1, Math.abs(x));
  }

  const api = { solve, par, nets, branch, mesh, millman, superposition, thevenin, millmanN, deltaToStar, starToDelta, bridgeDeltaStar, clean };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DC = api;
})(typeof window !== 'undefined' ? window : globalThis);
