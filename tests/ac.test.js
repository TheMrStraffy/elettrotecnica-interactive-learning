// Test del motore della corrente alternata: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const A = require('../js/ac.js');

const near = (a, b, msg, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`);
const nearZ = (z, w, msg) => { near(z.re, w.re, msg + ' (re)'); near(z.im, w.im, msg + ' (im)'); };
const rnd = () => (Math.random() - 0.5) * 20;

test('numeri complessi', () => {
  nearZ(A.mul(A.cx(0, 1), A.cx(0, 1)), A.cx(-1, 0), 'j² = −1');
  nearZ(A.polar(5, Math.atan2(4, 3) * A.R2D), A.cx(3, 4), 'polare → rettangolare');
  near(A.abs(A.cx(3, 4)), 5, 'modulo');
  near(A.argDeg(A.cx(0, -2)), -90, 'argomento');
  for (let k = 0; k < 500; k++) {
    const a = A.cx(rnd(), rnd());
    const b = A.cx(rnd(), rnd());
    nearZ(A.mul(A.div(a, b), b), a, 'divisione inversa della moltiplicazione');
    near(A.abs(A.mul(a, b)), A.abs(a) * A.abs(b), 'moduli che si moltiplicano', 1e-9);
    const d = A.argDeg(A.mul(a, b)) - A.argDeg(a) - A.argDeg(b);
    near(Math.cos(d * A.D2R), 1, 'argomenti che si sommano', 1e-9);
    nearZ(A.add(a, A.conj(a)), A.cx(2 * a.re, 0), 'coniugato');
  }
});

test('sinusoidi', () => {
  near(A.peak(230), 325.27, 'rete a 230 V', 1e-4);
  near(A.eff(A.peak(12)), 12, 'efficace');
  near(A.period(50), 0.02, 'periodo');
  near(A.omega(50), 100 * Math.PI, 'pulsazione');
  near(A.inst(10, 50, 0, 0.005), 10, 'picco a T/4');
  near(A.inst(10, 50, 90, 0), 10, 'sfasata di 90°');
  near(A.delay(90, 50), 0.005, 'ritardo');
});

test('reattanze, impedenze e risonanza', () => {
  near(A.XL(50, 0.1), 10 * Math.PI, 'XL');
  near(A.XC(50, 100e-6), 1 / (0.01 * Math.PI), 'XC');
  const Z = A.series(A.ZR(30), A.cx(0, 40));
  near(A.abs(Z), 50, 'triangolo 3-4-5');
  // parallelo di due resistori uguali
  nearZ(A.parallel(A.ZR(10), A.ZR(10)), A.cx(5, 0), 'parallelo');
  // alla risonanza XL = XC e l'impedenza serie è R
  for (let k = 0; k < 200; k++) {
    const L = 1e-3 * (1 + Math.random() * 100);
    const C = 1e-9 * (1 + Math.random() * 1000);
    const fr = A.f0(L, C);
    near(A.XL(fr, L), A.XC(fr, C), 'XL = XC alla risonanza', 1e-9);
    const Zs = A.series(A.ZR(10), A.ZL(fr, L), A.ZC(fr, C));
    near(Zs.im, 0, 'parte immaginaria nulla', 1e-6);
    near(A.Ctune(fr, L), C, 'C di accordo', 1e-9);
    near(A.Ltune(fr, C), L, 'L di accordo', 1e-9);
    // Q serie = XL / R
    near(A.Qseries(10, L, C), A.XL(fr, L) / 10, 'Q serie', 1e-9);
  }
  // L e C in parallelo alla risonanza: impedenza enorme
  const fr = A.f0(1e-3, 1e-6);
  assert.ok(A.abs(A.parallel(A.ZL(fr, 1e-3), A.ZC(fr, 1e-6))) > 1e9);
});

test('potenze e rifasamento', () => {
  // V = 230∠0, carico 30 + j40: I = 4,6∠−53,13°
  const I = A.div(A.cx(230, 0), A.cx(30, 40));
  const p = A.power(A.cx(230, 0), I);
  near(p.P, 30 * 4.6 * 4.6, 'P = R I²', 1e-9);
  near(p.Q, 40 * 4.6 * 4.6, 'Q = X I²', 1e-9);
  near(p.cos, 0.6, 'cosφ');
  const t = A.triangle(1000, 0.8);
  near(t.S, 1250, 'S');
  near(t.Q, 750, 'Q');
  near(A.triangle(1000, 0.8, true).Q, -750, 'Q capacitiva');
  const b = A.boucherot([{ P: 1000, Q: 750 }, { P: 500, Q: -750 }]);
  near(b.Q, 0, 'Boucherot');
  near(b.cos, 1, 'cosφ totale');
  const r = A.powerFactor(1000, 0.6, 0.9, 230, 50);
  near(r.Qc, 1000 * (4 / 3 - Math.tan(Math.acos(0.9))), 'Qc');
  near(A.cosWithC(1000, 0.6, r.C, 230, 50), 0.9, 'cosφ dopo il rifasamento', 1e-9);
  assert.ok(r.I2 < r.I1);
});

test('decibel e filtri', () => {
  near(A.dB(10), 20, 'dB');
  near(A.dB(Math.SQRT1_2), -3.0103, '−3 dB', 1e-4);
  near(A.fromdB(-6), 0.501187, 'da dB', 1e-5);
  near(A.dBp(2), 3.0103, 'dB di potenza', 1e-4);
  near(A.fromdBp(A.dBp(7)), 7, 'inversa');
  const fc = A.fcRC(1000, 100e-9);
  near(fc, 1591.549, 'fc', 1e-6);
  near(A.gain('lp', fc, fc), Math.SQRT1_2, '|H(fc)|');
  near(A.phaseDeg('lp', fc, fc), -45, 'fase a fc');
  near(A.phaseDeg('hp', fc, fc), 45, 'fase passa-alto');
  near(A.gain('hp', fc * 1e4, fc), 1, 'passa-alto ad alta frequenza', 1e-7);
  near(A.asymGain('lp', fc * 100, fc), -40, 'asintoto −20 dB/decade');
  near(A.asymGain('hp', fc / 10, fc), -20, 'asintoto passa-alto');
  near(A.asymPhase('lp', fc, fc), -45, 'fase asintotica');
  near(A.asymPhase('lp', fc * 20, fc), -90, 'fase asintotica oltre 10 fc');
  near(A.fcRL(100, 10e-3), 100 / (2 * Math.PI * 0.01), 'fc RL');
  // somma di lp e hp con la stessa fc: |H_lp|² + |H_hp|² = 1
  for (let k = 0; k < 100; k++) {
    const f = Math.pow(10, Math.random() * 6);
    near(A.gain('lp', f, fc) ** 2 + A.gain('hp', f, fc) ** 2, 1, 'complementari', 1e-9);
  }
});
