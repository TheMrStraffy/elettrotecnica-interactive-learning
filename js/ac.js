/*
 * Corrente alternata: numeri complessi, fasori, impedenze, risonanza, potenze, filtri.
 * Funziona sia nel browser (window.AC) sia in Node (require) per i test.
 * Gli angoli "in gradi" sono indicati con deg; internamente si lavora in radianti.
 */
(function (root) {
  'use strict';

  const TAU = 2 * Math.PI;
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;

  // ---------- Numeri complessi { re, im } ----------
  const cx = (re, im = 0) => ({ re, im });
  const polar = (mag, deg) => cx(mag * Math.cos(deg * D2R), mag * Math.sin(deg * D2R));
  const add = (...zs) => zs.reduce((s, z) => cx(s.re + z.re, s.im + z.im), cx(0, 0));
  const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const mul = (...zs) => zs.reduce((s, z) => cx(s.re * z.re - s.im * z.im, s.re * z.im + s.im * z.re), cx(1, 0));
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const inv = (z) => div(cx(1, 0), z);
  const conj = (z) => cx(z.re, -z.im);
  const scale = (z, k) => cx(z.re * k, z.im * k);
  const abs = (z) => Math.hypot(z.re, z.im);
  const argDeg = (z) => Math.atan2(z.im, z.re) * R2D;

  // ---------- Sinusoidi ----------
  const omega = (f) => TAU * f;
  const period = (f) => 1 / f;
  const eff = (vmax) => vmax / Math.SQRT2;
  const peak = (veff) => veff * Math.SQRT2;
  /** Valore istantaneo di Vmax·sin(ωt + φ). */
  const inst = (vmax, f, deg, t) => vmax * Math.sin(TAU * f * t + deg * D2R);
  /** Sfasamento in tempo: Δt = φ / (360° · f). */
  const delay = (deg, f) => deg / (360 * f);

  // ---------- Reattanze e impedenze ----------
  const XL = (f, L) => TAU * f * L;
  const XC = (f, C) => 1 / (TAU * f * C);
  const ZR = (R) => cx(R, 0);
  const ZL = (f, L) => cx(0, XL(f, L));
  const ZC = (f, C) => cx(0, -XC(f, C));
  const series = (...zs) => add(...zs);
  /** Parallelo; se le ammettenze si annullano (L e C alla risonanza) l'impedenza è infinita. */
  function parallel(...zs) {
    const ys = zs.map(inv);
    const Y = add(...ys);
    if (abs(Y) <= 1e-12 * Math.max(...ys.map(abs))) return cx(Infinity, 0);
    return inv(Y);
  }

  // ---------- Risonanza ----------
  const f0 = (L, C) => 1 / (TAU * Math.sqrt(L * C));
  /** Fattore di merito del circuito serie: Q = X0 / R. */
  const Qseries = (R, L, C) => Math.sqrt(L / C) / R;
  /** Fattore di merito del parallelo (R in parallelo a L e C): Q = R / X0. */
  const Qparallel = (R, L, C) => R / Math.sqrt(L / C);
  const bandwidth = (fr, Q) => fr / Q;
  /** C per accordare un circuito su f con l'induttanza L. */
  const Ctune = (f, L) => 1 / (TAU * TAU * f * f * L);
  const Ltune = (f, C) => 1 / (TAU * TAU * f * f * C);

  // ---------- Potenze (valori efficaci) ----------
  /** Potenza complessa S = V · I* → { P, Q, S, cos, deg }. */
  function power(V, I) {
    const S = mul(V, conj(I));
    const Sm = abs(S);
    return { P: S.re, Q: S.im, S: Sm, cos: Sm ? S.re / Sm : 1, deg: argDeg(S) };
  }
  /** Dal carico (P, cosφ, induttivo o capacitivo) alle altre potenze. */
  function triangle(P, cos, capacitive = false) {
    const phi = Math.acos(cos);
    const Q = P * Math.tan(phi) * (capacitive ? -1 : 1);
    return { P, Q, S: P / cos, deg: phi * R2D * (capacitive ? -1 : 1) };
  }
  /** Boucherot: carichi [{ P, Q }] → totale. */
  function boucherot(loads) {
    const P = loads.reduce((s, l) => s + l.P, 0);
    const Q = loads.reduce((s, l) => s + l.Q, 0);
    const S = Math.hypot(P, Q);
    return { P, Q, S, cos: P / S, deg: Math.atan2(Q, P) * R2D };
  }
  /** Rifasamento monofase: potenza reattiva e capacità del condensatore. */
  function powerFactor(P, cos1, cos2, V, f) {
    const Qc = P * (Math.tan(Math.acos(cos1)) - Math.tan(Math.acos(cos2)));
    return { Qc, C: Qc / (TAU * f * V * V), I1: P / (V * cos1), I2: P / (V * cos2) };
  }
  /** cosφ dopo aver aggiunto un condensatore C (carico induttivo P, cos1). */
  function cosWithC(P, cos1, C, V, f) {
    const Q = P * Math.tan(Math.acos(cos1)) - TAU * f * C * V * V;
    return P / Math.hypot(P, Q);
  }

  // ---------- Decibel e filtri del primo ordine ----------
  const dB = (ratio) => 20 * Math.log10(ratio);
  const dBp = (ratio) => 10 * Math.log10(ratio);
  const fromdB = (db) => Math.pow(10, db / 20);
  const fromdBp = (db) => Math.pow(10, db / 10);
  const fcRC = (R, C) => 1 / (TAU * R * C);
  const fcRL = (R, L) => R / (TAU * L);
  /** Funzione di trasferimento: kind 'lp' (passa-basso) o 'hp' (passa-alto). */
  function H(kind, f, fc) {
    const x = f / fc;
    return kind === 'lp' ? inv(cx(1, x)) : div(cx(0, x), cx(1, x));
  }
  const gain = (kind, f, fc) => abs(H(kind, f, fc));
  const phaseDeg = (kind, f, fc) => argDeg(H(kind, f, fc));
  /** Asintoti di Bode del modulo (dB) e della fase (gradi). */
  function asymGain(kind, f, fc) {
    const d = dB(f / fc);
    return kind === 'lp' ? Math.min(0, -d) : Math.min(0, d);
  }
  function asymPhase(kind, f, fc) {
    const lo = fc / 10;
    const hi = fc * 10;
    const t = f <= lo ? 0 : f >= hi ? 1 : Math.log10(f / lo) / 2;
    return kind === 'lp' ? -90 * t : 90 * (1 - t);
  }

  const api = {
    TAU, D2R, R2D,
    cx, polar, add, sub, mul, div, inv, conj, scale, abs, argDeg,
    omega, period, eff, peak, inst, delay,
    XL, XC, ZR, ZL, ZC, series, parallel,
    f0, Qseries, Qparallel, bandwidth, Ctune, Ltune,
    power, triangle, boucherot, powerFactor, cosWithC,
    dB, dBp, fromdB, fromdBp, fcRC, fcRL, H, gain, phaseDeg, asymGain, asymPhase,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AC = api;
})(typeof window !== 'undefined' ? window : globalThis);
