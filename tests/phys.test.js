// Test del motore del biennio: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const P = require('../js/phys.js');

const near = (a, b, msg) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`);

test('analisi dimensionale', () => {
  assert.strictEqual(P.baseString(P.UNITS['Ω'].d), 'kg·m²·s⁻³·A⁻²');
  assert.strictEqual(P.unitOf(P.dims([['V', 1], ['A', 1]])), 'W');
  assert.strictEqual(P.unitOf(P.dims([['Ω', 1], ['A', 2]])), 'W');
  assert.strictEqual(P.unitOf(P.dims([['V', 2], ['Ω', -1]])), 'W');
  assert.strictEqual(P.unitOf(P.dims([['W', 1], ['s', 1]])), 'J');
  assert.strictEqual(P.unitOf(P.dims([['J', 1], ['C', -1]])), 'V');
  assert.strictEqual(P.unitOf(P.dims([['C', 1], ['V', -1]])), 'F');
  assert.strictEqual(P.unitOf(P.dims([['Ω', -1]])), 'S');
  assert.strictEqual(P.unitOf(P.dims([['W', 0.5], ['Ω', -0.5]])), 'A');
  assert.strictEqual(P.unitOf(P.dims([['N', 1], ['C', -1]])), null); // N/C = V/m non ha un nome
  assert.ok(P.sameDims(P.dims([['N', 1], ['C', -1]]), P.dims([['V', 1], ['m', -1]])));
  // ogni definizione dichiarata è coerente
  for (const [k, u] of Object.entries(P.UNITS)) if (!u.base) assert.ok(u.def, k);
});

test('notazione scientifica e ingegneristica', () => {
  assert.deepStrictEqual(P.sci(0.00047), { m: 4.7, e: -4 });
  assert.deepStrictEqual(P.sci(47000), { m: 4.7, e: 4 });
  assert.deepStrictEqual(P.sci(9.996, 3), { m: 1, e: 1 });
  assert.deepStrictEqual(P.eng(47000), { m: 47, e: 3 });
  assert.deepStrictEqual(P.eng(0.00047), { m: 470, e: -6 });
  assert.deepStrictEqual(P.eng(3.3e-9), { m: 3.3, e: -9 });
  assert.strictEqual(P.prefixOf(-6), 'µ');
  for (let k = 0; k < 2000; k++) {
    const x = Math.pow(10, -12 + Math.random() * 22) * (Math.random() < 0.5 ? -1 : 1);
    const s = P.sci(x, 6);
    assert.ok(Math.abs(s.m) >= 1 && Math.abs(s.m) < 10, 'mantissa ' + x);
    near(s.m * Math.pow(10, s.e), Number(x.toPrecision(6)), 'valore');
    const g = P.eng(x, 6);
    assert.ok(Math.abs(g.m) >= 1 && Math.abs(g.m) < 1000 && g.e % 3 === 0, 'ingegneristica ' + x);
  }
});

test('cifre significative e ordine di grandezza', () => {
  assert.strictEqual(P.sigCount('0,00470'), 3);
  assert.strictEqual(P.sigCount('12,30'), 4);
  assert.strictEqual(P.sigCount('1005'), 4);
  assert.strictEqual(P.sigCount('3,0'), 2);
  assert.strictEqual(P.sigCount('0,5'), 1);
  assert.strictEqual(P.roundSig(0.0047368, 2), 0.0047);
  assert.strictEqual(P.order(3000), 3);
  assert.strictEqual(P.order(4000), 4);
  assert.strictEqual(P.order(0.002), -3);
  assert.strictEqual(P.order(0.005), -2);
});

test('sistemi 2×2 ed equazioni', () => {
  const s = P.solve2(2, 3, 1, -1, 12, 1);
  near(s.x, 3, 'x');
  near(s.y, 2, 'y');
  assert.strictEqual(P.solve2(1, 2, 2, 4, 3, 7).kind, 'impossibile');
  assert.strictEqual(P.solve2(1, 2, 2, 4, 3, 6).kind, 'indeterminato');
  for (let k = 0; k < 500; k++) {
    const [a, b, c, d] = [1, 2, 3, 4].map(() => Math.round(Math.random() * 20 - 10));
    const [x, y] = [Math.random() * 10, Math.random() * 10];
    const r = P.solve2(a, b, c, d, a * x + b * y, c * x + d * y);
    if (r.kind === 'determinato') { near(r.x, x, 'x'); near(r.y, y, 'y'); }
  }
  near(P.solveLinear(3, 4, 1, 10), 3, 'equazione');
});

test('Coulomb e campo', () => {
  near(P.coulomb(1e-6, 1e-6, 1), 8.99e-3, 'due cariche da 1 µC a 1 m');
  near(P.coulomb(2e-6, 3e-6, 0.1, 80), (8.99e9 * 6e-12) / (0.01 * 80), 'in acqua');
  near(P.fieldPoint(1e-9, 0.1), 899, 'campo');
  const f = P.fieldAt([{ q: 1e-9, x: 0, y: 0 }], 0.1, 0);
  near(f.ex, 899, 'Ex');
  near(f.ey, 0, 'Ey');
  // dipolo: sull'asse mediano il campo è parallelo al dipolo
  const g = P.fieldAt([{ q: 1e-9, x: -0.05, y: 0 }, { q: -1e-9, x: 0.05, y: 0 }], 0, 0.1);
  assert.ok(Math.abs(g.ey) < 1e-9 && g.ex > 0);
});

test('condensatori e transitori', () => {
  near(P.capPlane(1e-4, 1e-3, 1), 8.854e-13, 'condensatore piano 1 cm², 1 mm');
  near(P.capSeries(2e-6, 2e-6), 1e-6, 'serie');
  near(P.capParallel(1e-6, 2.2e-6), 3.2e-6, 'parallelo');
  near(P.charge(10, 1, 1), 10 * (1 - Math.exp(-1)), 'carica a τ');
  assert.ok(Math.abs(P.charge(1, 1, 1) - 0.632) < 0.001);
  assert.ok(P.charge(1, 1, 5) > 0.99);
  for (let k = 0; k < 200; k++) {
    const E = 1 + Math.random() * 20, tau = 1e-3 + Math.random(), t = Math.random() * 3 * tau;
    near(P.timeToCharge(E, tau, P.charge(E, tau, t)), t, 'inversa della carica');
    near(P.timeToDischarge(E, tau, P.discharge(E, tau, t)), t, 'inversa della scarica');
  }
});

test('magnetismo', () => {
  near(P.bWire(1, 0.01), 2e-5, 'filo: 1 A a 1 cm = 20 µT');
  near(P.bSolenoid(1000, 1, 0.1), 4 * Math.PI * 1e-7 * 1e4, 'solenoide');
  near(P.lSolenoid(100, 1e-4, 0.1), (4 * Math.PI * 1e-7 * 1e4 * 1e-4) / 0.1, 'induttanza');
  near(P.forceWire(0.5, 2, 0.1, 90), 0.1, 'forza sul filo');
  near(P.forceWire(0.5, 2, 0.1, 30), 0.05, 'forza a 30°');
  near(P.forceParallel(1, 1, 1), 2e-7, 'definizione storica dell\'ampere');
  near(P.flux(0.2, 0.01, 60), 0.001, 'flusso');
});
