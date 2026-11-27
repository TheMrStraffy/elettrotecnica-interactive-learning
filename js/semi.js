/*
 * Componenti a semiconduttore e operazionali: modelli e formule della 4ª.
 * Funziona sia nel browser (window.Semi) sia in Node (require) per i test.
 */
(function (root) {
  'use strict';

  const VT = 0.025852; // tensione termica a 300 K (kT/q), circa 26 mV

  // ---------- Diodo ----------
  /** Equazione di Shockley: corrente per una tensione ai capi (parametri tipici di un 1N4148). */
  const shockley = (V, Is = 2.5e-9, n = 1.75) => Is * (Math.exp(V / (n * VT)) - 1);

  /**
   * Punto di lavoro di E – R – diodo in serie con il modello esponenziale (bisezione sulla retta di carico).
   * Ritorna { V, I }.
   */
  function diodeOP(E, R, Is = 2.5e-9, n = 1.75) {
    if (E <= 0) return { V: E, I: 0 };
    let lo = 0;
    let hi = E;
    for (let k = 0; k < 200; k++) {
      const m = (lo + hi) / 2;
      // f(V) = corrente del diodo − corrente della retta di carico
      if (shockley(m, Is, n) - (E - m) / R > 0) hi = m; else lo = m;
    }
    const V = (lo + hi) / 2;
    return { V, I: (E - V) / R };
  }

  /** Modello a soglia: conduce se E > Vγ. */
  function diodeThreshold(E, R, Vg = 0.7) {
    if (E <= Vg) return { on: false, V: E, I: 0 };
    return { on: true, V: Vg, I: (E - Vg) / R };
  }

  /** Resistore per un LED: R = (V − VF)/I. */
  const ledR = (V, VF, I) => (V - VF) / I;

  // ---------- Raddrizzatori ----------
  /**
   * kind: 'half' (una semionda), 'bridge' (ponte di Graetz), 'ct' (presa centrale).
   * Vrms: tensione efficace del secondario (per 'ct', di ciascuna metà).
   */
  function rectifier(kind, Vrms, f = 50, Vd = 0.7) {
    const Vm = Vrms * Math.SQRT2;
    const drops = kind === 'bridge' ? 2 : 1;
    const Vp = Math.max(0, Vm - drops * Vd);
    const full = kind !== 'half';
    return {
      Vm,
      Vp, // picco in uscita
      Vdc: full ? (2 * Vp) / Math.PI : Vp / Math.PI, // valore medio senza condensatore
      fr: full ? 2 * f : f, // frequenza del ripple
      // tensione inversa di picco su ogni diodo
      PIV: kind === 'half' ? Vm : kind === 'bridge' ? Vm - Vd : 2 * Vm - Vd,
      conducting: kind === 'bridge' ? 2 : 1,
    };
  }

  /** Ripple con condensatore di livellamento (approssimazione della scarica lineare). */
  function ripple(Vp, IL, C, fr) {
    const Vr = IL / (fr * C);
    return { Vr, Vmin: Vp - Vr, Vdc: Vp - Vr / 2 };
  }
  /** Capacità per non superare un certo ripple. */
  const rippleC = (IL, Vr, fr) => IL / (fr * Vr);

  // ---------- Zener ----------
  /** Stabilizzatore con Zener: Vin – Rs – (Zener ∥ RL). */
  function zener(Vin, Rs, Vz, RL, Izmin = 0) {
    // senza Zener la tensione sul carico sarebbe quella del partitore
    const Vopen = RL === Infinity ? Vin : (Vin * RL) / (Rs + RL);
    if (Vopen < Vz) {
      const I = Vin / (Rs + (RL === Infinity ? 1e18 : RL));
      return { regulating: false, Vout: Vopen, Is: I, IL: I, Iz: 0, Pz: 0 };
    }
    const Is = (Vin - Vz) / Rs;
    const IL = RL === Infinity ? 0 : Vz / RL;
    const Iz = Is - IL;
    return { regulating: Iz >= Izmin, Vout: Vz, Is, IL, Iz, Pz: Vz * Iz };
  }
  /** Resistenza serie per avere almeno Iz con il carico più pesante. */
  const zenerRs = (Vin, Vz, ILmax, Iz) => (Vin - Vz) / (ILmax + Iz);

  // ---------- BJT ----------
  /**
   * NPN con resistenza di base e di collettore (emettitore a massa).
   * Ritorna { region: 'interdizione' | 'attiva' | 'saturazione', IB, IC, VCE }.
   */
  function bjtSwitch(Vin, RB, VCC, RC, beta, VBE = 0.7, VCEsat = 0.2) {
    if (Vin <= VBE) return { region: 'interdizione', IB: 0, IC: 0, VCE: VCC };
    const IB = (Vin - VBE) / RB;
    const ICsat = (VCC - VCEsat) / RC;
    if (beta * IB >= ICsat) return { region: 'saturazione', IB, IC: ICsat, VCE: VCEsat, ICsat };
    const IC = beta * IB;
    return { region: 'attiva', IB, IC, VCE: VCC - IC * RC, ICsat };
  }

  /** Resistenza di base per saturare con un fattore di sovrapilotaggio k. */
  const baseResistor = (Vin, IC, beta, k = 2, VBE = 0.7) => (Vin - VBE) / ((k * IC) / beta);

  /**
   * Polarizzazione a partitore (R1 verso VCC, R2 verso massa), RC, RE.
   * exact: tiene conto della corrente di base con l'equivalente di Thevenin del partitore.
   */
  function dividerBias(VCC, R1, R2, RC, RE, beta = 100, VBE = 0.7, exact = false) {
    const Vth = (VCC * R2) / (R1 + R2);
    const Rth = (R1 * R2) / (R1 + R2);
    const IE = exact ? (Vth - VBE) / (RE + Rth / (beta + 1)) : (Vth - VBE) / RE;
    const IC = exact ? (beta * IE) / (beta + 1) : IE;
    const VE = IE * RE;
    const VCE = VCC - IC * RC - VE;
    return { VB: exact ? VE + VBE : Vth, VE, IE, IC, VCE, ICsat: VCC / (RC + RE), region: VCE > 0.2 ? 'attiva' : 'saturazione' };
  }

  /** Polarizzazione con sola resistenza di base (fissa). */
  function baseBias(VCC, RB, RC, beta, VBE = 0.7) {
    const IB = (VCC - VBE) / RB;
    const IC = Math.min(beta * IB, VCC / RC);
    return { IB, IC, VCE: VCC - IC * RC };
  }

  /** Resistenza dinamica di emettitore re = VT/IE (circa 26 mV / IE). */
  const re = (IE) => 0.026 / IE;
  /** Guadagno dell'emettitore comune: −RC/(re + RE non bypassata). */
  const ceGain = (RC, IE, REu = 0) => -RC / (re(IE) + REu);

  // ---------- MOSFET (canale n, ad arricchimento) ----------
  /** Modello quadratico: ID = k (VGS − Vth)² in saturazione, lineare sotto. */
  function mosfet(VGS, VDS, k, Vth) {
    const Vov = VGS - Vth;
    if (Vov <= 0) return { region: 'interdizione', ID: 0 };
    if (VDS >= Vov) return { region: 'saturazione', ID: k * Vov * Vov };
    return { region: 'ohmica', ID: k * (2 * Vov * VDS - VDS * VDS) };
  }

  // ---------- Operazionali ----------
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const opInv = (Rf, R1) => -Rf / R1;
  const opNonInv = (Rf, R1) => 1 + Rf / R1;
  /** Sommatore invertente: Vout = −Rf Σ Vk/Rk. */
  const opSum = (Rf, Vs, Rs) => -Rf * Vs.reduce((s, v, i) => s + v / Rs[i], 0);
  /** Differenziale con R2/R1 uguali sui due ingressi: Vout = (R2/R1)(V2 − V1). */
  const opDiff = (R1, R2, V1, V2) => (R2 / R1) * (V2 - V1);
  /** Uscita con saturazione. */
  const opOut = (Av, Vin, Vsat) => clamp(Av * Vin, -Vsat, Vsat);
  /** Comparatore ad anello aperto. */
  const comparator = (Vp, Vn, Vsat, A = 1e5) => clamp(A * (Vp - Vn), -Vsat, Vsat);
  /** Frequenza massima senza distorsione da slew rate: f = SR/(2π Vp). */
  const slewFreq = (SR, Vp) => SR / (2 * Math.PI * Vp);
  /** Banda ad anello chiuso: GBW / guadagno di rumore (1 + Rf/R1). */
  const closedBW = (GBW, noiseGain) => GBW / noiseGain;
  /** DAC a resistori pesati: Vout = −Rf · Vref · Σ bk / Rk, con Rk = R / 2^k. */
  function dacWeighted(bits, Vref, R, Rf) {
    const n = bits.length;
    let s = 0;
    bits.forEach((b, i) => { if (b) s += Vref / (R / Math.pow(2, n - 1 - i)); });
    return -Rf * s;
  }

  const api = {
    VT, shockley, diodeOP, diodeThreshold, ledR,
    rectifier, ripple, rippleC,
    zener, zenerRs,
    bjtSwitch, baseResistor, dividerBias, baseBias, re, ceGain,
    mosfet,
    opInv, opNonInv, opSum, opDiff, opOut, comparator, slewFreq, closedBW, dacWeighted, clamp,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Semi = api;
})(typeof window !== 'undefined' ? window : globalThis);
