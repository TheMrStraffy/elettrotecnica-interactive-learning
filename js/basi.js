/*
 * Calcoli del biennio: lavoro ed energia, generatore reale, resistori (codice colori, serie normalizzate,
 * seconda legge di Ohm, temperatura), strumenti di misura e sicurezza elettrica.
 * Funziona sia nel browser (window.Basi) sia in Node (require) per i test.
 */
(function (root) {
  'use strict';
  const G = 9.81;
  const KWH = 3.6e6; // joule in un kWh

  // ---------- Lavoro, energia, potenza ----------
  const work = (F, s, deg = 0) => F * s * Math.cos((deg * Math.PI) / 180);
  const kinetic = (m, v) => 0.5 * m * v * v;
  const potential = (m, h, g = G) => m * g * h;
  /** Velocità in fondo a una discesa di altezza h, senza attrito (non dipende dalla massa). */
  const speedFromHeight = (h, g = G) => Math.sqrt(2 * g * h);
  const heightFromSpeed = (v, g = G) => (v * v) / (2 * g);
  /** Potenza (W) e rendimento. */
  const power = (W, t) => W / t;
  const efficiency = (Pu, Pa) => Pu / Pa;
  const chainEff = (list) => list.reduce((x, e) => x * e, 1);
  const kWh = (P, hours) => (P * hours) / 1000;
  const toKWh = (J) => J / KWH;
  const toJ = (kwh) => kwh * KWH;

  // ---------- Circuito elementare ----------
  /** Generatore reale (E, r) chiuso su un carico R. R = Infinity: circuito aperto; R = 0: cortocircuito. */
  function realGen(E, r, R) {
    const I = R === Infinity ? 0 : E / (R + r);
    const V = R === Infinity ? E : R * I;
    const Pu = V * I;
    const Pg = E * I;
    return { I, V, Vr: r * I, Pu, Pg, Pr: r * I * I, eta: Pg > 0 ? Pu / Pg : 1, Icc: E / r };
  }
  /** Resistenza interna da due letture: a vuoto V0 = E e con carico (V, I). */
  const internalR = (V0, V, I) => (V0 - V) / I;
  /** Corrente e tensione massime per un resistore di potenza nominale Pmax. */
  const maxCurrent = (R, Pmax) => Math.sqrt(Pmax / R);
  const maxVoltage = (R, Pmax) => Math.sqrt(Pmax * R);
  /** Durata di una batteria da capacità (mAh) e corrente (mA), in ore. */
  const batteryHours = (mAh, mA) => mAh / mA;

  // ---------- Resistori ----------
  const COLORS = ['nero', 'marrone', 'rosso', 'arancio', 'giallo', 'verde', 'blu', 'viola', 'grigio', 'bianco'];
  const MULT = { argento: -2, oro: -1, nero: 0, marrone: 1, rosso: 2, arancio: 3, giallo: 4, verde: 5, blu: 6, viola: 7, grigio: 8, bianco: 9 };
  const TOL = { marrone: 1, rosso: 2, verde: 0.5, blu: 0.25, viola: 0.1, grigio: 0.05, oro: 5, argento: 10, nessuna: 20 };
  const multColor = (e) => Object.keys(MULT).find((k) => MULT[k] === e);

  /** Valore da una lista di colori: cifre (2 o 3), moltiplicatore, tolleranza. */
  function fromBands(bands) {
    const nd = bands.length === 5 ? 3 : 2;
    let base = 0;
    for (let i = 0; i < nd; i++) base = base * 10 + COLORS.indexOf(bands[i]);
    const value = Number((base * Math.pow(10, MULT[bands[nd]])).toPrecision(6));
    return { value, tol: TOL[bands[nd + 1]] };
  }
  /** Colori per un valore (n = 4 o 5 fasce). Ritorna null se non si può scrivere con quelle cifre. */
  function toBands(value, n = 4, tol = n === 4 ? 'oro' : 'marrone') {
    const nd = n === 5 ? 3 : 2;
    const e = Math.floor(Math.log10(value) + 1e-9) - (nd - 1);
    const digits = Math.round(value / Math.pow(10, e));
    if (e < -2 || e > 9 || Math.abs(digits * Math.pow(10, e) - value) > value * 1e-9 || digits >= Math.pow(10, nd)) return null;
    const ds = String(digits).padStart(nd, '0').split('').map((c) => COLORS[Number(c)]);
    return [...ds, multColor(e), tol];
  }
  const tolRange = (R, tol) => [R * (1 - tol / 100), R * (1 + tol / 100)];

  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  const E24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
  /** Valore normalizzato più vicino (in proporzione) a R nella serie scelta. */
  function nearestE(R, series = E12) {
    const d = Math.pow(10, Math.floor(Math.log10(R)) - 1);
    const cands = [...series.map((x) => x * d), series[0] * d * 10, series[series.length - 1] * d / 10];
    return Number(cands.reduce((b, x) => (Math.abs(Math.log(x / R)) < Math.abs(Math.log(b / R)) ? x : b)).toPrecision(3));
  }
  /** Notazione da schema: 4k7, R47, 1M5, 220R. */
  function schemaCode(R) {
    const [div, letter] = R >= 1e6 ? [1e6, 'M'] : R >= 1e3 ? [1e3, 'k'] : [1, 'R'];
    const x = Number((R / div).toPrecision(3));
    const [i, f] = String(x).split('.');
    if (letter === 'R' && i === '0') return 'R' + f;
    return i + letter + (f || '');
  }

  /** Seconda legge di Ohm: ρ in Ω·mm²/m, L in m, S in mm². */
  const wireR = (rho, L, S) => (rho * L) / S;
  const wireL = (R, rho, S) => (R * S) / rho;
  const section = (d) => (Math.PI * d * d) / 4;
  /** Resistività (o resistenza) alla temperatura t, dato il valore a 20 °C e α. */
  const atTemp = (x20, alpha, t) => x20 * (1 + alpha * (t - 20));
  const tempFrom = (Rt, R20, alpha) => 20 + (Rt / R20 - 1) / alpha;
  /** Termistore NTC (modello β): R25 a 25 °C. */
  const ntc = (R25, beta, t) => R25 * Math.exp(beta * (1 / (t + 273.15) - 1 / 298.15));

  // ---------- Strumenti di misura ----------
  /** Partitore R1–R2 con un voltmetro di resistenza Rv sui capi di R2. */
  function loadedDivider(E, R1, R2, Rv) {
    const ideal = (E * R2) / (R1 + R2);
    const Rp = Rv === Infinity ? R2 : (R2 * Rv) / (R2 + Rv);
    const meas = (E * Rp) / (R1 + Rp);
    return { ideal, meas, err: (meas - ideal) / ideal };
  }
  /** Amperometro di resistenza Ra in serie a un circuito di resistenza totale Rt. */
  function ammeterErr(E, Rt, Ra) {
    const ideal = E / Rt;
    const meas = E / (Rt + Ra);
    return { ideal, meas, err: (meas - ideal) / ideal };
  }
  /** Multimetro digitale: portata (fondo scala), conteggi, precisione ±(p % della lettura + n digit). */
  function dmm(value, range, counts = 2000, p = 0.5, n = 2) {
    const resol = range / counts;
    if (Math.abs(value) >= range) return { over: true, resol };
    const shown = Math.round(value / resol) * resol;
    const abs = (p / 100) * Math.abs(shown) + n * resol;
    return { over: false, resol, shown, abs, rel: abs / Math.abs(shown) };
  }
  /** Portata migliore: la più piccola che contiene il valore. */
  const bestRange = (value, ranges) => ranges.find((r) => Math.abs(value) < r) || null;
  /** Strumento analogico di classe c: errore assoluto costante = c % del fondo scala. */
  function analog(reading, fullScale, cls) {
    const abs = (cls / 100) * fullScale;
    return { abs, rel: abs / reading };
  }

  // ---------- Sicurezza elettrica ----------
  /** Effetti della corrente alternata a 50 Hz sul corpo (soglie semplificate). */
  function bodyEffect(I) {
    if (I < 0.5e-3) return { zone: 1, name: 'non avvertita' };
    if (I < 10e-3) return { zone: 2, name: 'percepita, senza effetti pericolosi' };
    if (I < 30e-3) return { zone: 3, name: 'tetanizzazione: non si riesce a lasciare la presa' };
    return { zone: 4, name: 'pericolo di fibrillazione ventricolare' };
  }
  /** Tempo massimo di intervento di un differenziale (CEI EN 61008, tipo generale). */
  function rcdTime(I, Idn = 0.03) {
    if (I >= 5 * Idn) return 0.04;
    if (I >= 2 * Idn) return 0.15;
    if (I >= Idn) return 0.3;
    return null; // non interviene
  }
  /**
   * Guasto a massa di un apparecchio alimentato a V (sistema TT).
   * o: { V = 230, earth: bool, RE (terra dell'impianto), RN (terra della cabina), Rbody, Rfloor, rcd: bool, Idn }
   */
  function fault(o) {
    const V = o.V == null ? 230 : o.V;
    const RN = o.RN == null ? 10 : o.RN;
    const Rp = o.Rbody + o.Rfloor; // la persona: corpo più scarpe e pavimento
    let Vc;
    let Ig;
    if (o.earth) {
      const Rpar = (o.RE * Rp) / (o.RE + Rp);
      Ig = V / (Rpar + RN);
      Vc = Ig * Rpar;
    } else {
      Ig = V / (Rp + RN);
      Vc = Ig * Rp;
    }
    const Ib = Vc / Rp;
    const t = o.rcd ? rcdTime(Ig, o.Idn || 0.03) : null;
    return { Vc, Ig, Ib, Vtouch: Ib * o.Rbody, t, effect: bodyEffect(Ib) };
  }
  /** Resistenza di terra massima per l'impianto TT: RE · IΔn ≤ 50 V. */
  const maxRE = (Idn, VL = 50) => VL / Idn;

  const api = {
    G, KWH, work, kinetic, potential, speedFromHeight, heightFromSpeed, power, efficiency, chainEff, kWh, toKWh, toJ,
    realGen, internalR, maxCurrent, maxVoltage, batteryHours,
    COLORS, MULT, TOL, fromBands, toBands, tolRange, E12, E24, nearestE, schemaCode,
    wireR, wireL, section, atTemp, tempFrom, ntc,
    loadedDivider, ammeterErr, dmm, bestRange, analog,
    bodyEffect, rcdTime, fault, maxRE,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Basi = api;
})(typeof window !== 'undefined' ? window : globalThis);
