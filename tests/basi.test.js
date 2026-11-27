const test = require('node:test');
const assert = require('node:assert');
const B = require('../js/basi.js');

const near = (a, b, msg, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${msg}: ${a} invece di ${b}`);

test('lavoro, energia, potenza', () => {
  near(B.work(10, 5), 50, 'forza parallela');
  near(B.work(10, 5, 60), 25, 'a 60°');
  assert.ok(Math.abs(B.work(10, 5, 90)) < 1e-12, 'forza perpendicolare: lavoro nullo');
  near(B.work(10, 5, 180), -50, 'forza opposta: lavoro negativo');
  // conservazione: l'energia potenziale persa diventa cinetica
  for (const h of [0.5, 2, 10, 45]) {
    const v = B.speedFromHeight(h);
    near(B.kinetic(3, v), B.potential(3, h), `caduta da ${h} m`);
    near(B.heightFromSpeed(v), h, 'formula inversa');
  }
  near(B.power(1200, 60), 20, 'potenza');
  near(B.chainEff([0.9, 0.8, 0.5]), 0.36, 'rendimenti in cascata');
  near(B.kWh(2000, 1.5), 3, 'kWh');
  near(B.toJ(1), 3.6e6, '1 kWh');
  near(B.toKWh(B.toJ(2.5)), 2.5, 'andata e ritorno');
});

test('generatore reale e potenza', () => {
  for (const [E, r, R] of [[12, 0.5, 10], [4.5, 1.2, 3.3], [230, 0.1, 50]]) {
    const g = B.realGen(E, r, R);
    near(g.V, E - r * g.I, 'V = E − rI');
    near(g.Pg, g.Pu + g.Pr, 'bilancio delle potenze');
    near(g.eta, g.V / E, 'rendimento = V/E');
    near(B.internalR(E, g.V, g.I), r, 'r da due misure');
  }
  const open = B.realGen(9, 1, Infinity);
  assert.strictEqual(open.I, 0);
  assert.strictEqual(open.V, 9);
  const sc = B.realGen(9, 1, 0);
  near(sc.I, 9, 'cortocircuito');
  assert.strictEqual(sc.V, 0);
  near(B.maxCurrent(100, 0.25), 0.05, 'resistore da 1/4 W');
  near(B.maxVoltage(100, 0.25), 5, 'resistore da 1/4 W');
  near(B.batteryHours(2000, 250), 8, 'batteria');
});

test('codice colori e valori normalizzati', () => {
  assert.deepStrictEqual(B.toBands(4700), ['giallo', 'viola', 'rosso', 'oro']);
  assert.deepStrictEqual(B.toBands(0.47), ['giallo', 'viola', 'argento', 'oro']);
  assert.deepStrictEqual(B.toBands(4700, 5), ['giallo', 'viola', 'nero', 'marrone', 'marrone']);
  assert.strictEqual(B.toBands(4750), null, 'servono tre cifre');
  // andata e ritorno su tutta la E24, da 1 Ω a 10 MΩ
  for (let d = 0.1; d <= 1e5; d *= 10) {
    for (const x of B.E24) {
      const R = Number((x * d).toPrecision(3));
      for (const n of [4, 5]) {
        const b = B.toBands(R, n);
        assert.ok(b, `${R} con ${n} fasce`);
        assert.strictEqual(b.length, n);
        near(B.fromBands(b).value, R, `${R} con ${n} fasce`);
      }
    }
  }
  assert.strictEqual(B.fromBands(['marrone', 'nero', 'nero', 'oro']).tol, 5);
  assert.deepStrictEqual(B.tolRange(1000, 5), [950, 1050]);
  assert.strictEqual(B.nearestE(4600), 4700);
  assert.strictEqual(B.nearestE(1050), 1000);
  assert.strictEqual(B.nearestE(9300), 10000);
  assert.strictEqual(B.nearestE(5000, B.E24), 5100);
  for (const [R, s] of [[4700, '4k7'], [0.47, 'R47'], [1500000, '1M5'], [220, '220R'], [1000, '1k'], [2.2, '2R2'], [10000, '10k']]) assert.strictEqual(B.schemaCode(R), s);
  // in E12 ogni valore sta entro ±10 % dal vicino più vicino: gli intervalli si toccano
  for (let i = 1; i < B.E12.length; i++) assert.ok(B.E12[i] * 0.9 <= B.E12[i - 1] * 1.1 + 0.5);
});

test('seconda legge di Ohm e temperatura', () => {
  near(B.wireR(0.0175, 100, 1.5), 1.1667, 'rame', 1e-4);
  near(B.wireL(B.wireR(1.1, 3, 0.5), 1.1, 0.5), 3, 'lunghezza');
  near(B.section(2), Math.PI, 'sezione da diametro');
  near(B.atTemp(10, 0.004, 120), 14, 'riscaldamento');
  near(B.tempFrom(14, 10, 0.004), 120, 'temperatura dalla resistenza');
  near(B.ntc(10000, 3950, 25), 10000, 'NTC a 25 °C');
  assert.ok(B.ntc(10000, 3950, 60) < 10000 && B.ntc(10000, 3950, 0) > 10000, 'NTC scende scaldandosi');
});

test('strumenti di misura', () => {
  const d = B.loadedDivider(10, 1e6, 1e6, 10e6);
  near(d.ideal, 5, 'partitore ideale');
  near(d.meas, 10 * (1e6 * 10e6 / 11e6) / (1e6 + 1e6 * 10e6 / 11e6), 'partitore caricato');
  assert.ok(d.err < 0, 'il voltmetro abbassa la tensione');
  near(B.loadedDivider(10, 1e3, 1e3, Infinity).err, 0, 'voltmetro ideale');
  near(B.ammeterErr(10, 100, 1).meas, 10 / 101, 'amperometro');
  const m = B.dmm(3.3, 20);
  near(m.resol, 0.01, 'risoluzione');
  near(m.abs, 0.005 * 3.3 + 0.02, 'errore assoluto', 1e-9);
  assert.ok(B.dmm(25, 20).over, 'fuori portata');
  assert.strictEqual(B.bestRange(3.3, [0.2, 2, 20, 200, 600]), 20);
  assert.strictEqual(B.bestRange(1.999, [0.2, 2, 20]), 2);
  assert.strictEqual(B.bestRange(900, [0.2, 2, 20, 200, 600]), null);
  const a = B.analog(20, 100, 1.5);
  near(a.abs, 1.5, 'classe 1,5 su 100 V');
  near(a.rel, 0.075, 'a un quinto della scala');
});

test('sicurezza elettrica', () => {
  assert.strictEqual(B.bodyEffect(0.2e-3).zone, 1);
  assert.strictEqual(B.bodyEffect(5e-3).zone, 2);
  assert.strictEqual(B.bodyEffect(20e-3).zone, 3);
  assert.strictEqual(B.bodyEffect(100e-3).zone, 4);
  assert.strictEqual(B.rcdTime(0.02), null);
  assert.strictEqual(B.rcdTime(0.03), 0.3);
  assert.strictEqual(B.rcdTime(0.1), 0.15);
  assert.strictEqual(B.rcdTime(0.2), 0.04);
  near(B.maxRE(0.03), 1666.67, 'terra per un differenziale da 30 mA', 1e-5);
  // senza terra la persona prende quasi tutta la tensione; con la terra molto meno
  const base = { Rbody: 1000, Rfloor: 1000, RE: 20, rcd: false };
  const noEarth = B.fault({ ...base, earth: false });
  const earth = B.fault({ ...base, earth: true });
  assert.ok(noEarth.Ib > 0.1, 'senza terra: corrente pericolosa');
  assert.ok(earth.Ib < noEarth.Ib, 'la terra abbassa la corrente nel corpo');
  // nel sistema TT la terra da sola non basta: la carcassa resta ben sopra 50 V…
  assert.ok(earth.Vc > 50, 'senza differenziale la tensione resta pericolosa');
  near(earth.Vc, earth.Ig * (20 * 2000 / 2020), 'tensione verso terra della carcassa');
  // …ma la terra porta una corrente di guasto grande e il differenziale scatta subito
  assert.strictEqual(B.fault({ ...base, earth: true, rcd: true }).t, 0.04);
  // scarpe isolanti: la corrente scende sotto la soglia di percezione
  assert.strictEqual(B.fault({ Rbody: 1000, Rfloor: 1e6, earth: false }).effect.zone, 1);
});
