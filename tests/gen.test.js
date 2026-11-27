// Test del generatore di esercizi: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const G = require('../js/gen.js');

const F = { name: (q) => q, val: (q, v) => String(v), num: (k) => String(k), frac: (a, b) => `(${a})/(${b})`, root: (x) => `sqrt(${x})` };

test('le formule di ogni relazione sono coerenti con lo stato del circuito', () => {
  for (const t of Object.values(G.TOPO)) {
    for (let k = 0; k < 50; k++) {
      const vals = t.state(t.primary());
      t.rels.forEach((r, ri) => {
        for (const [x, e] of Object.entries(r.forms)) {
          const v = G.evaluate(e, vals);
          if (!isFinite(v)) continue;
          assert.ok(Math.abs(v - vals[x]) <= 1e-7 * Math.max(1, Math.abs(vals[x])), `${t.key} relazione ${ri} per ${x}: ${v} ≠ ${vals[x]}`);
        }
      });
    }
  }
});

test('esercizi risolvibili, dati puliti, passaggi che portano alle domande', () => {
  for (const key of Object.keys(G.TOPO)) {
    for (const level of [1, 2, 3]) {
      let made = 0;
      for (let k = 0; k < 60; k++) {
        const ex = G.make(key, { level });
        if (!ex) continue;
        made++;
        const t = G.TOPO[key];
        // i dati sono puliti, non nulli e non coincidono con le domande
        ex.givens.forEach((q) => assert.ok(G.clean(ex.vals[q]), `${key}: dato ${q} = ${ex.vals[q]} non pulito`));
        ex.asks.forEach((q) => assert.ok(!ex.givens.includes(q), `${key}: ${q} è dato e chiesto`));
        assert.strictEqual(ex.givens.length, t.dof, `${key}: numero di dati`);
        // rifacendo i passaggi dai soli dati si ottengono i valori giusti
        const have = {};
        ex.givens.forEach((q) => { have[q] = ex.vals[q]; });
        ex.steps.forEach((s) => {
          const e = t.rels[s.ri].forms[s.x];
          G.deps(e).forEach((d) => assert.ok(d in have, `${key}: il passaggio per ${s.x} usa ${d} non ancora noto`));
          have[s.x] = G.evaluate(e, have);
          assert.ok(Math.abs(have[s.x] - ex.vals[s.x]) <= 1e-3 * Math.abs(ex.vals[s.x]), `${key}: ${s.x} ${have[s.x]} ≠ ${ex.vals[s.x]}`);
          // il testo si scrive senza errori
          G.render(e, F, 'sym', have);
          G.render(e, F, 'num', have);
        });
        ex.asks.forEach((q) => assert.ok(q in have, `${key} livello ${level}: la domanda ${q} non viene raggiunta`));
        assert.ok(G.robust(t, ex.givens, ex.steps, ex.vals, ex.asks), `${key}: risposte sensibili agli arrotondamenti`);
        if (level === 2) assert.ok(ex.givens.some((q) => !t.classic.includes(q)), `${key}: livello 2 senza dato rovesciato`);
      }
      assert.ok(made >= 50, `${key} livello ${level}: generati solo ${made} esercizi su 60`);
    }
  }
});

test('casi noti', () => {
  const t = G.TOPO.series2;
  const vals = t.state({ E: 12, R: [4, 2] });
  assert.strictEqual(vals.I, 2);
  // dati E, R1 e I: si ricava R2 = 12/2 − 4 = 2
  const { known, steps } = G.propagate(t, ['E', 'R1', 'I'], vals);
  assert.ok(known.has('R2'));
  const st = G.prune(steps, ['R2']);
  assert.deepStrictEqual(st.map((s) => s.x), ['Req', 'R2']);
  // Thevenin: con E, R1, R2, R3 e la corrente nel carico si trova R_L
  const th = G.TOPO.thev;
  const v2 = th.state({ E: 12, R1: 6, R2: 3, R3: 3, RL: 5 });
  assert.strictEqual(v2.Vth, 4);
  assert.strictEqual(v2.Rth, 5);
  assert.strictEqual(v2.IL, 0.4);
  const p2 = G.propagate(th, ['E', 'R1', 'R2', 'R3', 'IL'], v2);
  assert.ok(p2.known.has('RL'));
  // Millman: due generatori uguali e R uguali → V_A = 2/3 di E
  const tg = G.TOPO.twoGen;
  const v3 = tg.state({ E1: 12, E2: 12, R1: 2, R2: 2, R3: 2 });
  assert.ok(Math.abs(v3.VA - 8) < 1e-12);
});
