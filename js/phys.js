/*
 * Fisica e matematica del biennio: analisi dimensionale, notazione scientifica,
 * cifre significative, sistemi 2×2, Coulomb e campo elettrico.
 * Funziona nel browser (window.Phys) e in Node (require) per i test.
 */
(function (root) {
  'use strict';

  // ---------- Analisi dimensionale ----------
  // Esponenti delle grandezze fondamentali: [kg, m, s, A, K, mol, cd]
  const BASE = ['kg', 'm', 's', 'A', 'K', 'mol', 'cd'];
  const UNITS = {
    kg: { d: [1, 0, 0, 0, 0, 0, 0], name: 'chilogrammo', q: 'massa', base: true },
    m: { d: [0, 1, 0, 0, 0, 0, 0], name: 'metro', q: 'lunghezza', base: true },
    s: { d: [0, 0, 1, 0, 0, 0, 0], name: 'secondo', q: 'tempo', base: true },
    A: { d: [0, 0, 0, 1, 0, 0, 0], name: 'ampere', q: 'intensità di corrente', base: true },
    K: { d: [0, 0, 0, 0, 1, 0, 0], name: 'kelvin', q: 'temperatura', base: true },
    mol: { d: [0, 0, 0, 0, 0, 1, 0], name: 'mole', q: 'quantità di sostanza', base: true },
    cd: { d: [0, 0, 0, 0, 0, 0, 1], name: 'candela', q: 'intensità luminosa', base: true },
    N: { d: [1, 1, -2, 0, 0, 0, 0], name: 'newton', q: 'forza', def: 'kg·m/s²' },
    J: { d: [1, 2, -2, 0, 0, 0, 0], name: 'joule', q: 'energia, lavoro', def: 'N·m' },
    W: { d: [1, 2, -3, 0, 0, 0, 0], name: 'watt', q: 'potenza', def: 'J/s' },
    C: { d: [0, 0, 1, 1, 0, 0, 0], name: 'coulomb', q: 'carica elettrica', def: 'A·s' },
    V: { d: [1, 2, -3, -1, 0, 0, 0], name: 'volt', q: 'tensione, potenziale', def: 'J/C = W/A' },
    'Ω': { d: [1, 2, -3, -2, 0, 0, 0], name: 'ohm', q: 'resistenza', def: 'V/A' },
    S: { d: [-1, -2, 3, 2, 0, 0, 0], name: 'siemens', q: 'conduttanza', def: '1/Ω = A/V' },
    F: { d: [-1, -2, 4, 2, 0, 0, 0], name: 'farad', q: 'capacità', def: 'C/V' },
    H: { d: [1, 2, -2, -2, 0, 0, 0], name: 'henry', q: 'induttanza', def: 'V·s/A' },
    Hz: { d: [0, 0, -1, 0, 0, 0, 0], name: 'hertz', q: 'frequenza', def: '1/s' },
    Pa: { d: [1, -1, -2, 0, 0, 0, 0], name: 'pascal', q: 'pressione', def: 'N/m²' },
    T: { d: [1, 0, -2, -1, 0, 0, 0], name: 'tesla', q: 'induzione magnetica', def: 'N/(A·m)' },
  };

  /** Prodotto di potenze: [['V', 1], ['A', -1]] → vettore degli esponenti. */
  function dims(terms) {
    const out = [0, 0, 0, 0, 0, 0, 0];
    terms.forEach(([u, e]) => UNITS[u].d.forEach((x, k) => { out[k] += x * e; }));
    return out.map((x) => Math.round(x * 1e9) / 1e9);
  }
  const sameDims = (a, b) => a.every((x, k) => Math.abs(x - b[k]) < 1e-9);
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '.': '·' };
  const sup = (n) => String(n).split('').map((c) => SUP[c] || c).join('');
  /** Vettore → "kg·m²·s⁻³·A⁻¹" */
  function baseString(d) {
    const parts = [];
    d.forEach((e, k) => { if (e) parts.push(BASE[k] + (e === 1 ? '' : sup(e))); });
    return parts.length ? parts.join('·') : 'adimensionale';
  }
  /** Nome dell'unità derivata con quelle dimensioni, se esiste. */
  function unitOf(d) {
    for (const [k, u] of Object.entries(UNITS)) if (sameDims(u.d, d)) return k;
    return null;
  }

  // ---------- Notazione scientifica e ingegneristica ----------
  /** x = m · 10^e con 1 ≤ |m| < 10, mantissa arrotondata a sig cifre. */
  function sci(x, sig = 3) {
    if (x === 0) return { m: 0, e: 0 };
    let e = Math.floor(Math.log10(Math.abs(x)));
    let m = Number((x / Math.pow(10, e)).toPrecision(sig));
    if (Math.abs(m) >= 10) { m = Number((m / 10).toPrecision(sig)); e += 1; }
    if (Math.abs(m) < 1) { m = Number((m * 10).toPrecision(sig)); e -= 1; }
    return { m, e };
  }
  /** x = m · 10^e con e multiplo di 3 e 1 ≤ |m| < 1000. */
  function eng(x, sig = 3) {
    const s = sci(x, sig);
    if (s.m === 0) return s;
    const e = Math.floor(s.e / 3) * 3;
    return { m: Number((s.m * Math.pow(10, s.e - e)).toPrecision(sig)), e };
  }
  const PREFIX = { 12: 'T', 9: 'G', 6: 'M', 3: 'k', 0: '', '-3': 'm', '-6': 'µ', '-9': 'n', '-12': 'p' };
  const prefixOf = (e) => PREFIX[e];

  /** Cifre significative di un numero scritto come stringa decimale (virgola o punto). */
  function sigCount(str) {
    let s = String(str).trim().replace(/^[+-]/, '');
    const hasSep = /[.,]/.test(s);
    s = s.replace(/[.,]/g, '');
    s = s.replace(/^0+/, '');
    if (!hasSep) s = s.replace(/0+$/, '');
    return s.length;
  }
  const roundSig = (x, n) => Number(x.toPrecision(n));

  /** Ordine di grandezza: la potenza di 10 più vicina (si confronta la mantissa con √10). */
  function order(x) {
    const e = Math.floor(Math.log10(Math.abs(x)));
    const m = Math.abs(x) / Math.pow(10, e);
    return m >= Math.sqrt(10) ? e + 1 : e;
  }

  // ---------- Algebra ----------
  /** a·x + b·y = e, c·x + d·y = f */
  function solve2(a, b, c, d, e, f) {
    const D = a * d - b * c;
    const Dx = e * d - b * f;
    const Dy = a * f - e * c;
    if (Math.abs(D) < 1e-12) {
      const kind = Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12 ? 'indeterminato' : 'impossibile';
      return { D, Dx, Dy, kind };
    }
    return { D, Dx, Dy, x: Dx / D, y: Dy / D, kind: 'determinato' };
  }
  /** a·x + b = c·x + d */
  const solveLinear = (a, b, c, d) => (d - b) / (a - c);

  // ---------- Elettrostatica ----------
  const K = 8.99e9; // N·m²/C²
  const QE = 1.602e-19; // C
  const coulomb = (q1, q2, r, er = 1) => (K * Math.abs(q1 * q2)) / (er * r * r);
  const fieldPoint = (Q, r) => (K * Math.abs(Q)) / (r * r);
  /** Campo (vettore) nel punto (x, y) generato da cariche [{q, x, y}], coordinate in metri. */
  function fieldAt(charges, x, y) {
    let ex = 0, ey = 0;
    charges.forEach((c) => {
      const dx = x - c.x, dy = y - c.y;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2);
      const e = (K * c.q) / r2;
      ex += (e * dx) / r;
      ey += (e * dy) / r;
    });
    return { ex, ey };
  }

  const api = { BASE, UNITS, dims, sameDims, baseString, unitOf, sup, sci, eng, prefixOf, sigCount, roundSig, order, solve2, solveLinear, K, QE, coulomb, fieldPoint, fieldAt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Phys = api;
})(typeof window !== 'undefined' ? window : globalThis);
