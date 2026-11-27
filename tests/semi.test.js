// Test dei motori della 4ª, parte 2: semiconduttori, operazionali, logica sequenziale.
const test = require('node:test');
const assert = require('node:assert');
const S = require('../js/semi.js');
const Q = require('../js/seq.js');

const near = (a, b, msg, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`);

test('diodo', () => {
  // il punto di lavoro sta sulla caratteristica e sulla retta di carico
  for (const [E, R] of [[5, 1000], [12, 470], [1, 100], [24, 10000]]) {
    const op = S.diodeOP(E, R);
    near(op.I, S.shockley(op.V), 'sulla caratteristica', 1e-6);
    near(op.I, (E - op.V) / R, 'sulla retta di carico', 1e-9);
    assert.ok(op.V > 0.4 && op.V < 0.9, 'tensione di un diodo al silicio in conduzione: ' + op.V);
  }
  assert.deepStrictEqual(S.diodeThreshold(0.5, 100), { on: false, V: 0.5, I: 0 });
  near(S.diodeThreshold(5.7, 1000).I, 0.005, 'modello a soglia');
  near(S.ledR(5, 2, 0.01), 300, 'resistore per il LED');
});

test('raddrizzatori, ripple, Zener', () => {
  const h = S.rectifier('half', 12, 50);
  near(h.Vm, 12 * Math.SQRT2, 'picco');
  near(h.Vp, 12 * Math.SQRT2 - 0.7, 'una caduta');
  near(h.Vdc, h.Vp / Math.PI, 'valore medio a una semionda');
  assert.strictEqual(h.fr, 50);
  const b = S.rectifier('bridge', 12, 50);
  near(b.Vp, 12 * Math.SQRT2 - 1.4, 'due cadute nel ponte');
  near(b.Vdc, (2 * b.Vp) / Math.PI, 'valore medio a doppia semionda');
  assert.strictEqual(b.fr, 100);
  assert.strictEqual(b.conducting, 2);
  near(S.rectifier('ct', 12).PIV, 2 * 12 * Math.SQRT2 - 0.7, 'PIV con presa centrale');
  const r = S.ripple(16, 0.5, 2200e-6, 100);
  near(r.Vr, 0.5 / (100 * 2200e-6), 'ripple');
  near(S.rippleC(0.5, r.Vr, 100), 2200e-6, 'capacità inversa');
  const z = S.zener(12, 100, 5.1, 510, 0.005);
  near(z.Is, 0.069, 'corrente nella serie');
  near(z.IL, 0.01, 'corrente nel carico');
  near(z.Iz, 0.059, 'corrente nello Zener');
  assert.ok(z.regulating);
  const z2 = S.zener(6, 1000, 5.1, 470, 0.005);
  assert.ok(!z2.regulating && z2.Vout < 5.1, 'tensione troppo bassa: non stabilizza');
  near(S.zenerRs(12, 5.1, 0.02, 0.005), 6.9 / 0.025, 'Rs di progetto');
});

test('transistor', () => {
  const off = S.bjtSwitch(0, 10000, 12, 1000, 100);
  assert.strictEqual(off.region, 'interdizione');
  const sat = S.bjtSwitch(5, 4300, 12, 1000, 100);
  assert.strictEqual(sat.region, 'saturazione');
  const act = S.bjtSwitch(1.7, 100000, 12, 1000, 100);
  assert.strictEqual(act.region, 'attiva');
  near(act.IC, 0.001, 'IC = β IB');
  near(act.VCE, 11, 'VCE');
  // RB calcolata per saturare con k = 2: con quella RB il transistor è davvero saturo
  const RB = S.baseResistor(5, 0.02, 100, 2);
  assert.strictEqual(S.bjtSwitch(5, RB, 12, 590, 100).region, 'saturazione');
  // polarizzazione a partitore: l'approssimazione e il calcolo esatto sono vicini con β grande
  const a = S.dividerBias(12, 47000, 10000, 2200, 1000, 200);
  const e = S.dividerBias(12, 47000, 10000, 2200, 1000, 200, 0.7, true);
  near(a.VB, 12 * 10 / 57, 'VB');
  assert.ok(Math.abs(a.IC - e.IC) / e.IC < 0.06, 'IC stabile');
  near(a.VCE, 12 - a.IC * 3200, 'VCE');
  // stabilità rispetto a β
  const e2 = S.dividerBias(12, 47000, 10000, 2200, 1000, 400, 0.7, true);
  assert.ok(Math.abs(e2.IC - e.IC) / e.IC < 0.03, 'raddoppiare β cambia poco IC');
  near(S.re(0.001), 26, 're a 1 mA');
  near(S.ceGain(4700, 0.001), -4700 / 26, 'guadagno con RE bypassata');
  // MOSFET
  assert.strictEqual(S.mosfet(1, 5, 0.5e-3, 2).region, 'interdizione');
  near(S.mosfet(4, 10, 0.5e-3, 2).ID, 0.5e-3 * 4, 'saturazione');
  assert.strictEqual(S.mosfet(4, 0.5, 0.5e-3, 2).region, 'ohmica');
});

test('operazionali', () => {
  near(S.opInv(100000, 10000), -10, 'invertente');
  near(S.opNonInv(90000, 10000), 10, 'non invertente');
  near(S.opSum(10000, [1, 2, 3], [10000, 10000, 10000]), -6, 'sommatore');
  near(S.opDiff(10000, 20000, 1, 3), 4, 'differenziale');
  near(S.opOut(-10, 2, 13), -13, 'saturazione');
  near(S.comparator(2, 1, 12), 12, 'comparatore');
  near(S.comparator(1, 2, 12), -12, 'comparatore');
  near(S.slewFreq(0.5e6, 10), 0.5e6 / (2 * Math.PI * 10), 'slew rate');
  near(S.closedBW(1e6, 10), 1e5, 'GBW');
  // DAC a 4 bit: ogni bit pesa il doppio del successivo
  const v = (bits) => S.dacWeighted(bits, 5, 80000, 10000);
  near(v([0, 0, 0, 1]) * 2, v([0, 0, 1, 0]), 'pesi binari');
  near(v([1, 1, 1, 1]), v([0, 0, 0, 1]) * 15, 'fondo scala');
});

test('logica sequenziale', () => {
  assert.strictEqual(Q.srNext(1, 0, 0).Q, 1);
  assert.strictEqual(Q.srNext(0, 0, 1).Q, 1);
  assert.strictEqual(Q.srNext(0, 1, 1).Q, 0);
  assert.strictEqual(Q.srNext(1, 1, 1).state, 'vietato');
  // JK: tabella completa
  for (const Q0 of [0, 1]) {
    assert.strictEqual(Q.ffNext('JK', { J: 0, K: 0 }, Q0), Q0);
    assert.strictEqual(Q.ffNext('JK', { J: 1, K: 0 }, Q0), 1);
    assert.strictEqual(Q.ffNext('JK', { J: 0, K: 1 }, Q0), 0);
    assert.strictEqual(Q.ffNext('JK', { J: 1, K: 1 }, Q0), 1 - Q0);
    assert.strictEqual(Q.ffNext('T', { T: 1 }, Q0), 1 - Q0);
  }
  assert.deepStrictEqual(Q.ffRun('D', [{ D: 1 }, { D: 0 }, { D: 1 }]), [1, 0, 1]);
  assert.strictEqual(Q.ffCount(10), 4);
  assert.strictEqual(Q.ffCount(16), 4);
  assert.strictEqual(Q.ffCount(17), 5);
  assert.strictEqual(Q.counterAfter(10, 7, 5), 2);
  assert.strictEqual(Q.counterAfter(16, 2, 5, true), 13);
  assert.deepStrictEqual(Q.counterSeq(6, 4, 3), [4, 5, 0, 1]);
  near(Q.divided(1000, 0), 500, 'Q0 divide per 2');
  near(Q.divided(1000, 3), 62.5, 'Q3 divide per 16');
  assert.deepStrictEqual(Q.resetOutputs(10), [1, 3]);
  assert.deepStrictEqual(Q.resetOutputs(6), [1, 2]);
  const s = Q.shiftRun([0, 0, 0, 0], [1, 0, 1, 1]);
  assert.deepStrictEqual(s.reg, [1, 1, 0, 1]);
  assert.strictEqual(Q.ringSeq(4, 4)[4].join(''), '1000');
  assert.strictEqual(Q.ringSeq(4, 8, true)[8].join(''), '0000');
  assert.strictEqual(new Set(Q.ringSeq(4, 8, true).slice(0, 8).map((r) => r.join(''))).size, 8);
  assert.strictEqual(Q.ringStates(4, true), 8);
  assert.strictEqual(Q.toNum([1, 0, 1, 1]), 11);
});

test('logica sequenziale: confronto con le porte e con il conteggio binario', () => {
  // latch SR: le due NOR retroazionate, fatte assestare, danno quello che dice srNext
  const nor = (a, b) => (a || b ? 0 : 1);
  for (const S of [0, 1]) for (const R of [0, 1]) for (const Q0 of [0, 1]) {
    let q = Q0;
    let qn = 1 - Q0;
    for (let k = 0; k < 6; k++) { q = nor(R, qn); qn = nor(S, q); }
    const r = Q.srNext(S, R, Q0);
    assert.strictEqual(r.Q, q, `S=${S} R=${R} Q=${Q0}`);
    assert.strictEqual(r.Qn, qn, `Q̅ con S=${S} R=${R} Q=${Q0}`);
  }
  // il JK fa da D (J = D, K = D̅) e da T (J = K = T)
  for (const Q0 of [0, 1]) for (const x of [0, 1]) {
    assert.strictEqual(Q.ffNext('JK', { J: x, K: 1 - x }, Q0), Q.ffNext('D', { D: x }, Q0));
    assert.strictEqual(Q.ffNext('JK', { J: x, K: x }, Q0), Q.ffNext('T', { T: x }, Q0));
  }
  // contatore binario con la NAND di reset sulle uscite a 1 in N: conta davvero modulo N
  for (let N = 2; N <= 16; N++) {
    const rs = Q.resetOutputs(N);
    let st = 0;
    for (let k = 1; k <= 3 * N; k++) {
      st = (st + 1) & 15;
      if (N < 16 && rs.every((b) => (st >> b) & 1)) st = 0;
      assert.strictEqual(st, Q.counterAfter(N, 0, k), `modulo ${N}, impulso ${k}`);
    }
  }
  // anello: n stati; Johnson: 2n stati, poi si ripete
  for (let n = 2; n <= 8; n++) {
    for (const j of [false, true]) {
      const m = Q.ringStates(n, j);
      const seq = Q.ringSeq(n, 2 * m, j).map((r) => r.join(''));
      assert.strictEqual(new Set(seq.slice(0, m)).size, m);
      assert.strictEqual(seq[m], seq[0]);
    }
  }
});
