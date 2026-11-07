// Test del risolutore di reti e dei metodi delle lezioni: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const DC = require('../js/dc.js');

const near = (a, b, msg) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`);

let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (a) => a[Math.floor(rnd() * a.length)];

test('esercizi del documento, moduli 1–4', () => {
  let s = DC.solve(DC.nets.single({ E: 12, R: 4 }));
  near(s.i.R, 3, 'Es. 1.1 I');
  near(s.p.R, 36, 'Es. 1.1 P');
  s = DC.solve(DC.nets.series({ E: 24, R: [100, 220, 180] }));
  near(s.i.R1, 0.048, 'Es. 2.1 I');
  near(s.v.N1, 19.2, 'Es. 2.1 V_B');
  near(s.v.N2, 8.64, 'Es. 2.1 V_C');
  s = DC.solve(DC.nets.parallel({ E: 12, R: [60, 30, 20] }));
  near(s.i.E, 1.2, 'Es. 3.1 I');
  s = DC.solve(DC.nets.currentDivider({ I: 1, R1: 30, R2: 20 }));
  near(s.i.R1, 0.4, 'Es. 3.2 I2');
  s = DC.solve(DC.nets.mixA({ E: 36, R1: 8, R2: 30, R3: 60, R4: 8 }));
  near(s.i.E, 1, 'Es. 4.1 I');
  near(s.v.A - s.v.B, 20, 'Es. 4.1 V_AB');
  s = DC.solve(DC.nets.mixB({ E: 12, R1: 4, R2: 8, R3: 6 }));
  near(s.i.E, 3, 'Es. 4.2 I');
});

test('circuito di riferimento (moduli 5–9, 11): cinque metodi, stesso risultato', () => {
  const p = { E1: 20, R1: 2, E2: 8, R2: 4, R3: 4 };
  const s = DC.solve(DC.nets.twoGen(p));
  near(s.i.R1, 4, 'I1');
  near(s.i.R2, -1, 'I2');
  near(s.i.R3, 3, 'I3');
  near(s.v.A, 12, 'V_A');
  near(s.p.E1, 80, 'P E1');
  near(s.p.E2, -8, 'P E2 assorbita');
  const m = DC.mesh(p);
  near(m.D, 32, 'Δ');
  near(m.Ia, 4, 'Ia');
  near(m.Ib, 1, 'Ib');
  const t = DC.thevenin(p);
  near(t.Vth, 16, 'Vth');
  near(t.Rth, 4 / 3, 'Rth');
  near(t.In, 12, 'In');
  const sp = DC.superposition(p);
  near(sp.a.I1, 5, "I1'");
  near(sp.b.I2, 1.5, "I2''");
});

test('metodi del circuito di riferimento contro il risolutore, 2000 circuiti casuali', () => {
  for (let k = 0; k < 2000; k++) {
    const p = { E1: 1 + rnd() * 40, R1: 0.5 + rnd() * 50, E2: rnd() * 40, R2: 0.5 + rnd() * 50, R3: 0.5 + rnd() * 50 };
    const s = DC.solve(DC.nets.twoGen(p));
    for (const [name, r] of [['rami', DC.branch(p)], ['maglie', DC.mesh(p)], ['Millman', DC.millman(p)], ['sovrapposizione', DC.superposition(p)]]) {
      near(r.I1, s.i.R1, name + ' I1');
      near(r.I2, s.i.R2, name + ' I2');
      near(r.I3, s.i.R3, name + ' I3');
      near(r.VA, s.v.A, name + ' VA');
    }
    const t = DC.thevenin(p);
    near(t.I3, s.i.R3, 'Thevenin I3');
    near(t.In, t.Vth / t.Rth, 'Norton');
    // sovrapposizione: i casi parziali sono reti vere
    const a = DC.solve(DC.nets.twoGen(p, 'E2'));
    near(DC.superposition(p).a.I3, a.i.R3, "I3'");
  }
});

test('ponte con stella-triangolo contro il risolutore', () => {
  const doc = DC.bridgeDeltaStar({ E: 30, R1: 20, R2: 30, R3: 50, R4: 25, R5: 50 });
  near(doc.Req, 30, 'Req');
  near(doc.I5, 0.1, 'I5');
  for (let k = 0; k < 1000; k++) {
    const p = { E: 1 + rnd() * 30, R1: 1 + rnd() * 100, R2: 1 + rnd() * 100, R3: 1 + rnd() * 100, R4: 1 + rnd() * 100, R5: 1 + rnd() * 100 };
    const s = DC.solve(DC.nets.bridge(p));
    const b = DC.bridgeDeltaStar(p);
    near(b.I, s.i.E, 'I');
    near(b.I5, s.i.R5, 'I5');
    near(b.I1, s.i.R1, 'I1');
    near(b.VC, s.v.C, 'VC');
  }
  // stella → triangolo è l'inversa
  for (let k = 0; k < 200; k++) {
    const t = DC.deltaToStar(1 + rnd() * 90, 1 + rnd() * 90, 1 + rnd() * 90);
    const d = DC.starToDelta(t.Ra, t.Rb, t.Rc);
    near(d.Rab + d.Rac + d.Rbc, t.S, 'somma lati');
  }
});

test('Millman a tre rami e reti miste', () => {
  for (let k = 0; k < 500; k++) {
    const br = [0, 1, 2].map(() => ({ E: pick([0, 3, 6, 9, 12]), up: rnd() < 0.7, R: pick([1, 2, 3, 4, 6]) }));
    const s = DC.solve(DC.nets.millman3({ br }));
    const m = DC.millmanN(br);
    near(m.VA, s.v.A, 'VA');
    m.I.forEach((x, j) => near(x, s.i['R' + (j + 1)], 'I' + (j + 1)));
    const q = { E: 10 + rnd() * 30, R1: 1 + rnd() * 20, R2: 1 + rnd() * 20, R3: 1 + rnd() * 20, R4: 1 + rnd() * 20 };
    near(DC.solve(DC.nets.mixA(q)).i.E, q.E / (q.R1 + DC.par(q.R2, q.R3) + q.R4), 'mixA');
    near(DC.solve(DC.nets.mixB(q)).i.E, q.E / DC.par(q.R1 + q.R2, q.R3), 'mixB');
    near(DC.solve(DC.nets.mixC(q)).i.E, q.E / (q.R1 + DC.par(q.R2, q.R3 + q.R4)), 'mixC');
  }
});

test('numeri puliti', () => {
  assert.ok(DC.clean(0.048));
  assert.ok(DC.clean(-1));
  assert.ok(!DC.clean(2 / 3));
  assert.ok(!DC.clean(1.3333));
});
