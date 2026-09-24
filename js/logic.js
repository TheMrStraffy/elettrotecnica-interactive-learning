/*
 * Motore di logica booleana (2–4 variabili)
 * - forme canoniche (mintermini / maxtermini)
 * - minimizzazione con il metodo di Quine–McCluskey + copertura minima
 * - lettore di espressioni scritte dallo studente (A'B + C, !A·B, ¬(A+B) ...)
 * Funziona sia nel browser (window.Logic) sia in Node (require) per i test.
 */
(function (root) {
  'use strict';

  const VARS = ['A', 'B', 'C', 'D'];

  function popcount(x) {
    let c = 0;
    while (x) { c += x & 1; x >>= 1; }
    return c;
  }

  // Un implicante è { bits, mask }: mask ha 1 dove la variabile è stata eliminata.
  function covers(imp, m) {
    return (m & ~imp.mask) === imp.bits;
  }

  function cellsOf(n, imp) {
    const out = [];
    for (let m = 0; m < 1 << n; m++) if (covers(imp, m)) out.push(m);
    return out;
  }

  function literalCount(n, imp) {
    return n - popcount(imp.mask);
  }

  function key(t) { return t.bits + ':' + t.mask; }

  function primeImplicants(ones, dcs) {
    let terms = [...new Set([...ones, ...dcs])].map((m) => ({ bits: m, mask: 0 }));
    const primes = [];
    while (terms.length) {
      const used = new Set();
      const next = new Map();
      for (let i = 0; i < terms.length; i++) {
        for (let j = i + 1; j < terms.length; j++) {
          const a = terms[i];
          const b = terms[j];
          if (a.mask !== b.mask) continue;
          const diff = a.bits ^ b.bits;
          if (popcount(diff) !== 1) continue;
          const t = { bits: a.bits & ~diff, mask: a.mask | diff };
          next.set(key(t), t);
          used.add(key(a));
          used.add(key(b));
        }
      }
      for (const t of terms) if (!used.has(key(t))) primes.push(t);
      terms = [...next.values()];
    }
    return primes;
  }

  function combinations(k, size, cb) {
    const idx = [];
    (function rec(start) {
      if (idx.length === size) { cb(idx); return; }
      for (let i = start; i < k; i++) {
        idx.push(i);
        rec(i + 1);
        idx.pop();
      }
    })(0);
  }

  // Ordina i gruppi: prima i più grandi, poi per prima cella.
  function sortImplicants(list) {
    return list.slice().sort((a, b) => popcount(b.mask) - popcount(a.mask) || a.bits - b.bits);
  }

  /**
   * Copertura minima degli "uni" con implicanti primi.
   * Criterio: meno termini possibile, a parità di termini meno letterali.
   */
  function minimalCover(n, ones, primes) {
    if (!ones.length) return [];
    const useful = primes.filter((p) => ones.some((m) => covers(p, m)));
    const chosen = [];
    for (const m of ones) {
      const c = useful.filter((p) => covers(p, m));
      if (c.length === 1 && !chosen.includes(c[0])) chosen.push(c[0]);
    }
    const remaining = ones.filter((m) => !chosen.some((p) => covers(p, m)));
    if (!remaining.length) return sortImplicants(chosen);

    const rest = useful.filter((p) => !chosen.includes(p) && remaining.some((m) => covers(p, m)));
    let best = null;
    for (let size = 1; size <= rest.length && !best; size++) {
      combinations(rest.length, size, (idx) => {
        const sel = idx.map((i) => rest[i]);
        if (!remaining.every((m) => sel.some((p) => covers(p, m)))) return;
        const cost = sel.reduce((s, p) => s + literalCount(n, p), 0);
        if (!best || cost < best.cost) best = { sel, cost };
      });
    }
    return sortImplicants(chosen.concat(best ? best.sel : []));
  }

  /**
   * Analizza una funzione data come elenco di uscite per riga: 0, 1 oppure 'x' (indifferenza).
   */
  function analyze(n, outputs) {
    const ones = [];
    const zeros = [];
    const dcs = [];
    outputs.forEach((v, m) => {
      if (v === 1) ones.push(m);
      else if (v === 0) zeros.push(m);
      else dcs.push(m);
    });
    const sop = minimalCover(n, ones, primeImplicants(ones, dcs));
    const pos = minimalCover(n, zeros, primeImplicants(zeros, dcs));
    return { n, ones, zeros, dcs, sop, pos };
  }

  // ---------- Letterali e testo ----------

  /** Letterali di un implicante letto come prodotto (gruppo di 1). */
  function productLiterals(n, imp) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const bit = 1 << (n - 1 - i);
      if (imp.mask & bit) continue;
      out.push({ v: VARS[i], neg: !(imp.bits & bit) });
    }
    return out;
  }

  /** Letterali di un implicante di 0 letto come somma (gruppo di 0 → maxtermine ridotto). */
  function sumLiterals(n, imp) {
    return productLiterals(n, imp).map((l) => ({ v: l.v, neg: !l.neg }));
  }

  function mintermLiterals(n, m) { return productLiterals(n, { bits: m, mask: 0 }); }
  function maxtermLiterals(n, m) { return sumLiterals(n, { bits: m, mask: 0 }); }

  function litText(l) { return l.v + (l.neg ? "'" : ''); }

  function sopText(n, imps) {
    if (!imps.length) return '0';
    return imps.map((p) => {
      const lits = productLiterals(n, p);
      return lits.length ? lits.map(litText).join('') : '1';
    }).join(' + ');
  }

  function posText(n, imps) {
    if (!imps.length) return '1';
    return imps.map((p) => {
      const lits = sumLiterals(n, p);
      if (!lits.length) return '0';
      const s = lits.map(litText).join(' + ');
      return lits.length > 1 ? '(' + s + ')' : s;
    }).join(' · ');
  }

  function binary(m, n) {
    return m.toString(2).padStart(n, '0');
  }

  // ---------- Lettore di espressioni ----------

  class ParseError extends Error {
    constructor(message, pos) {
      super(message);
      this.name = 'ParseError';
      this.pos = pos;
    }
  }

  const NEG_PREFIX = '!~¬';
  const NEG_POSTFIX = "'’′̅";
  const AND_OPS = '*·.&∙⋅';
  const OR_OPS = '+|∨';

  function parse(src, n) {
    const s = String(src).replace(/\s+/g, '');
    let i = 0;
    if (!s.length) throw new ParseError('Scrivi un\'espressione.', 0);

    const peek = () => s[i];

    function expr() {
      let node = term();
      while (i < s.length && OR_OPS.includes(peek())) {
        i++;
        node = { op: 'or', a: node, b: term() };
      }
      return node;
    }
    function startsFactor(c) {
      return /[A-Za-z01(]/.test(c) || NEG_PREFIX.includes(c);
    }
    function term() {
      let node = factor();
      while (i < s.length) {
        const c = peek();
        if (AND_OPS.includes(c)) {
          i++;
          node = { op: 'and', a: node, b: factor() };
        } else if (startsFactor(c)) {
          node = { op: 'and', a: node, b: factor() };
        } else break;
      }
      return node;
    }
    function factor() {
      const c = peek();
      if (c !== undefined && NEG_PREFIX.includes(c)) {
        i++;
        return { op: 'not', a: factor() };
      }
      let node = primary();
      while (i < s.length && NEG_POSTFIX.includes(peek())) {
        i++;
        node = { op: 'not', a: node };
      }
      return node;
    }
    function primary() {
      const c = peek();
      if (c === undefined) throw new ParseError('L\'espressione finisce a metà: manca una variabile.', i);
      if (c === '(') {
        i++;
        const e = expr();
        if (peek() !== ')') throw new ParseError('Manca una parentesi chiusa ")".', i);
        i++;
        return e;
      }
      if (/[A-Za-z]/.test(c)) {
        const idx = c.toUpperCase().charCodeAt(0) - 65;
        if (idx < 0 || idx >= n) {
          throw new ParseError(
            'La variabile ' + c.toUpperCase() + ' non esiste qui: con ' + n + ' variabili usa ' + VARS.slice(0, n).join(', ') + '.',
            i
          );
        }
        i++;
        return { op: 'var', i: idx };
      }
      if (c === '0' || c === '1') {
        i++;
        return { op: 'const', v: c === '1' };
      }
      if (c === ')') throw new ParseError('C\'è una parentesi chiusa ")" di troppo.', i);
      if (OR_OPS.includes(c) || AND_OPS.includes(c)) throw new ParseError('Manca una variabile prima di "' + c + '".', i);
      throw new ParseError('Carattere non riconosciuto: "' + c + '".', i);
    }

    const tree = expr();
    if (i < s.length) {
      if (s[i] === ')') throw new ParseError('C\'è una parentesi chiusa ")" di troppo.', i);
      throw new ParseError('Carattere non riconosciuto: "' + s[i] + '".', i);
    }
    return tree;
  }

  function evaluate(tree, m, n) {
    switch (tree.op) {
      case 'var': return !!(m & (1 << (n - 1 - tree.i)));
      case 'const': return tree.v;
      case 'not': return !evaluate(tree.a, m, n);
      case 'and': return evaluate(tree.a, m, n) && evaluate(tree.b, m, n);
      case 'or': return evaluate(tree.a, m, n) || evaluate(tree.b, m, n);
      default: throw new Error('nodo sconosciuto');
    }
  }

  /** Se l'espressione è una somma di prodotti di letterali restituisce termini e letterali, altrimenti null. */
  function sopShape(tree) {
    const terms = [];
    (function flattenOr(t) {
      if (t.op === 'or') { flattenOr(t.a); flattenOr(t.b); } else terms.push(t);
    })(tree);
    let literals = 0;
    for (const t of terms) {
      let ok = true;
      (function flattenAnd(x) {
        if (x.op === 'and') { flattenAnd(x.a); flattenAnd(x.b); return; }
        if (x.op === 'var' || x.op === 'const') { if (x.op === 'var') literals++; return; }
        if (x.op === 'not' && x.a.op === 'var') { literals++; return; }
        ok = false;
      })(t);
      if (!ok) return null;
    }
    return { terms: terms.length, literals };
  }

  /** Righe in cui l'espressione non coincide con la funzione (le indifferenze non contano). */
  function mismatches(tree, n, outputs) {
    const out = [];
    for (let m = 0; m < 1 << n; m++) {
      const want = outputs[m];
      if (want !== 0 && want !== 1) continue;
      const got = evaluate(tree, m, n) ? 1 : 0;
      if (got !== want) out.push({ m, got, want });
    }
    return out;
  }

  // ---------- Mappa di Karnaugh ----------

  const GRAY2 = [0, 1, 3, 2];

  function kmapLayout(n) {
    if (n === 2) return { rowVars: 'A', colVars: 'B', rowCodes: [0, 1], colCodes: [0, 1], rbits: 1, cbits: 1 };
    if (n === 3) return { rowVars: 'A', colVars: 'BC', rowCodes: [0, 1], colCodes: GRAY2, rbits: 1, cbits: 2 };
    return { rowVars: 'AB', colVars: 'CD', rowCodes: GRAY2, colCodes: GRAY2, rbits: 2, cbits: 2 };
  }

  function kmapIndex(layout, r, c) {
    return (layout.rowCodes[r] << layout.cbits) | layout.colCodes[c];
  }

  function groupSize(imp) { return 1 << popcount(imp.mask); }

  const api = {
    VARS,
    popcount,
    covers,
    cellsOf,
    literalCount,
    primeImplicants,
    minimalCover,
    analyze,
    productLiterals,
    sumLiterals,
    mintermLiterals,
    maxtermLiterals,
    sopText,
    posText,
    binary,
    parse,
    evaluate,
    sopShape,
    mismatches,
    ParseError,
    kmapLayout,
    kmapIndex,
    groupSize,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof window !== 'undefined' ? window : globalThis);
