// Test del motore logico: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const L = require('../js/logic.js');

function outputsFrom(n, ones, dcs = []) {
  return Array.from({ length: 1 << n }, (_, m) => (ones.includes(m) ? 1 : dcs.includes(m) ? 'x' : 0));
}

function allImplicants(n) {
  const out = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    for (let bits = 0; bits < 1 << n; bits++) {
      if (bits & mask) continue;
      out.push({ bits, mask });
    }
  }
  return out;
}

// Copertura minima per forza bruta: (termini, letterali) più piccoli possibile.
function bruteMinimum(n, outputs) {
  const imps = allImplicants(n).filter((p) => L.cellsOf(n, p).every((m) => outputs[m] !== 0));
  const ones = outputs.map((v, m) => (v === 1 ? m : -1)).filter((m) => m >= 0);
  if (!ones.length) return { terms: 0, literals: 0 };
  for (let size = 1; size <= ones.length; size++) {
    let best = null;
    const idx = [];
    (function rec(start) {
      if (idx.length === size) {
        const sel = idx.map((i) => imps[i]);
        if (ones.every((m) => sel.some((p) => L.covers(p, m)))) {
          const lits = sel.reduce((s, p) => s + L.literalCount(n, p), 0);
          if (best === null || lits < best) best = lits;
        }
        return;
      }
      for (let i = start; i < imps.length; i++) { idx.push(i); rec(i + 1); idx.pop(); }
    })(0);
    if (best !== null) return { terms: size, literals: best };
  }
  throw new Error('impossibile');
}

function checkCover(n, outputs, imps, target) {
  for (let m = 0; m < 1 << n; m++) {
    const v = imps.some((p) => L.covers(p, m)) ? 1 : 0;
    if (outputs[m] === target) assert.strictEqual(v, 1, 'riga ' + m + ' non coperta');
    if (outputs[m] === (target ? 0 : 1)) assert.strictEqual(v, 0, 'riga ' + m + ' coperta per errore');
  }
}

test('esempi classici', () => {
  // Σm(0,2,4,5,6) = C' + AB'
  let r = L.analyze(3, outputsFrom(3, [0, 2, 4, 5, 6]));
  assert.strictEqual(L.sopText(3, r.sop), "C' + AB'");
  // Maggioranza
  r = L.analyze(3, outputsFrom(3, [3, 5, 6, 7]));
  assert.strictEqual(r.sop.length, 3);
  // XOR a 3 ingressi: nessuna semplificazione
  r = L.analyze(3, outputsFrom(3, [1, 2, 4, 7]));
  assert.strictEqual(r.sop.length, 4);
  assert.ok(r.sop.every((p) => p.mask === 0));
  // Segmento "a" del display a 7 segmenti (BCD, 10–15 indifferenti) = A + C + BD + B'D'
  r = L.analyze(4, outputsFrom(4, [0, 2, 3, 5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15]));
  assert.strictEqual(r.sop.length, 4);
  assert.strictEqual(r.sop.reduce((s, p) => s + L.literalCount(4, p), 0), 6);
  // costanti
  assert.strictEqual(L.sopText(2, L.analyze(2, [1, 1, 1, 1]).sop), '1');
  assert.strictEqual(L.sopText(2, L.analyze(2, [0, 0, 0, 0]).sop), '0');
  assert.strictEqual(L.posText(2, L.analyze(2, [0, 0, 0, 0]).pos), '0');
});

test('tutte le 256 funzioni a 3 variabili: forma SP e PS minime e corrette', () => {
  const n = 3;
  for (let f = 0; f < 256; f++) {
    const outputs = Array.from({ length: 8 }, (_, m) => (f >> m) & 1);
    const r = L.analyze(n, outputs);
    checkCover(n, outputs, r.sop, 1);
    checkCover(n, outputs, r.pos, 0);
    const want = bruteMinimum(n, outputs);
    const lits = r.sop.reduce((s, p) => s + L.literalCount(n, p), 0);
    assert.deepStrictEqual({ terms: r.sop.length, literals: lits }, want, 'funzione ' + f);
  }
});

test('funzioni casuali a 4 variabili con indifferenze', () => {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let k = 0; k < 150; k++) {
    const outputs = Array.from({ length: 16 }, () => {
      const x = rnd();
      return x < 0.4 ? 0 : x < 0.85 ? 1 : 'x';
    });
    const r = L.analyze(4, outputs);
    checkCover(4, outputs, r.sop, 1);
    checkCover(4, outputs, r.pos, 0);
    const want = bruteMinimum(4, outputs);
    const lits = r.sop.reduce((s, p) => s + L.literalCount(4, p), 0);
    assert.deepStrictEqual({ terms: r.sop.length, literals: lits }, want);
  }
});

test('lettore di espressioni', () => {
  const n = 3;
  const same = (a, b) => {
    const ta = L.parse(a, n);
    const tb = L.parse(b, n);
    for (let m = 0; m < 8; m++) assert.strictEqual(L.evaluate(ta, m, n), L.evaluate(tb, m, n), a + ' vs ' + b + ' riga ' + m);
  };
  same("A'B + C", '!A·B + C');
  same("(A+B)'", "A'B'");
  same('¬(A·B)', "A' + B'");
  same('A B', 'AB');
  same("A''", 'A');
  same('A̅B', "A'B");
  same('a+b', 'A+B');
  assert.deepStrictEqual(L.sopShape(L.parse("A'B + AC + B", 3)), { terms: 3, literals: 5 });
  assert.strictEqual(L.sopShape(L.parse('A(B+C)', 3)), null);
  assert.throws(() => L.parse('A+', 3), L.ParseError);
  assert.throws(() => L.parse('(A+B', 3), L.ParseError);
  assert.throws(() => L.parse('A+D', 3), /non esiste/);
  assert.throws(() => L.parse('A)', 3), /di troppo/);
});

test('mappa di Karnaugh: codice Gray', () => {
  const lay = L.kmapLayout(4);
  // riga AB=11 (terza), colonna CD=10 (quarta) → 1110 = 14
  assert.strictEqual(L.kmapIndex(lay, 2, 3), 14);
  const lay3 = L.kmapLayout(3);
  assert.strictEqual(L.kmapIndex(lay3, 1, 2), 7);
});
