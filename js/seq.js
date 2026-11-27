/*
 * Logica sequenziale: latch, flip-flop, contatori, registri a scorrimento.
 * Funziona sia nel browser (window.Seq) sia in Node (require) per i test.
 * I bit sono numeri 0/1.
 */
(function (root) {
  'use strict';

  /** Latch SR con porte NOR. Ritorna lo stato dopo aver applicato S e R. */
  function srNext(S, R, Q) {
    if (S && R) return { Q: 0, Qn: 0, state: 'vietato' };
    if (S) return { Q: 1, Qn: 0, state: 'set' };
    if (R) return { Q: 0, Qn: 1, state: 'reset' };
    return { Q, Qn: Q ? 0 : 1, state: 'memoria' };
  }

  /** Stato dopo un fronte di clock. type: 'D' | 'JK' | 'T'; inp: { D } | { J, K } | { T }. */
  function ffNext(type, inp, Q) {
    if (type === 'D') return inp.D ? 1 : 0;
    if (type === 'T') return inp.T ? 1 - Q : Q;
    const { J, K } = inp;
    if (J && K) return 1 - Q;
    if (J) return 1;
    if (K) return 0;
    return Q;
  }

  /** Sequenza delle uscite dopo ogni fronte. */
  function ffRun(type, inputs, Q0 = 0) {
    const out = [];
    let Q = Q0;
    inputs.forEach((inp) => { Q = ffNext(type, inp, Q); out.push(Q); });
    return out;
  }

  /** Numero minimo di flip-flop per un contatore modulo N. */
  const ffCount = (N) => Math.ceil(Math.log2(N));

  /** Stato di un contatore modulo N dopo n impulsi, partendo da start (in avanti o all'indietro). */
  function counterAfter(N, start, n, down = false) {
    const s = down ? start - n : start + n;
    return ((s % N) + N) % N;
  }

  /** Sequenza degli stati (compreso quello iniziale) per n impulsi. */
  function counterSeq(N, start, n, down = false) {
    return Array.from({ length: n + 1 }, (_, k) => counterAfter(N, start, k, down));
  }

  /** Frequenza dell'uscita Qk di un contatore binario: ogni flip-flop divide per 2. */
  const divided = (f, k) => f / Math.pow(2, k + 1);

  /** Uscite da mandare alla porta di reset per un contatore asincrono modulo N (le Qk che valgono 1 in N). */
  function resetOutputs(N) {
    const out = [];
    for (let k = 0; 1 << k <= N; k++) if ((N >> k) & 1) out.push(k);
    return out;
  }

  /**
   * Registro a scorrimento: reg = [Q0, Q1, …]; il bit seriale entra in Q0 e tutto scorre verso l'ultimo.
   * Ritorna il nuovo contenuto e il bit uscito.
   */
  function shift(reg, inBit) {
    return { reg: [inBit ? 1 : 0, ...reg.slice(0, -1)], out: reg[reg.length - 1] };
  }

  /** Contenuto dopo una sequenza di bit seriali. */
  function shiftRun(reg, bits) {
    let r = reg.slice();
    const outs = [];
    bits.forEach((b) => { const s = shift(r, b); r = s.reg; outs.push(s.out); });
    return { reg: r, outs };
  }

  /** Contatore ad anello (l'ultima uscita torna nel primo) e Johnson (torna negata). */
  function ringSeq(n, steps, johnson = false) {
    let r = johnson ? Array(n).fill(0) : [1, ...Array(n - 1).fill(0)];
    const seq = [r.slice()];
    for (let k = 0; k < steps; k++) {
      const last = r[n - 1];
      r = shift(r, johnson ? 1 - last : last).reg;
      seq.push(r.slice());
    }
    return seq;
  }
  /** Numero di stati distinti: n per l'anello, 2n per il Johnson. */
  const ringStates = (n, johnson = false) => (johnson ? 2 * n : n);

  const toNum = (bits) => bits.reduce((x, b) => x * 2 + b, 0);

  const api = { srNext, ffNext, ffRun, ffCount, counterAfter, counterSeq, divided, resetOutputs, shift, shiftRun, ringSeq, ringStates, toNum };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Seq = api;
})(typeof window !== 'undefined' ? window : globalThis);
