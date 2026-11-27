/*
 * Generatore di esercizi sulle reti in corrente continua con incognite variabili.
 *
 * Ogni circuito tipo è descritto da grandezze (E, R1, I, V2, P3…) e da relazioni
 * (Ohm, serie, parallelo, Kirchhoff, potenza, Millman, Thevenin). Il generatore:
 *   1. sceglie valori "puliti" e calcola tutte le grandezze;
 *   2. sceglie quali grandezze dare e quali chiedere;
 *   3. risolve "a catena": usa ogni volta una relazione con una sola incognita,
 *      e tiene solo i passaggi che servono per le domande.
 * Funziona sia nel browser (window.Gen) sia in Node (require) per i test.
 */
(function (root) {
  'use strict';

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  /** Un numero è "pulito" se si scrive con al più tre cifre significative. */
  function clean(x, sig = 3) {
    if (!isFinite(x) || x === 0) return false;
    return Math.abs(x - Number(x.toPrecision(sig))) <= 1e-9 * Math.abs(x);
  }

  /** Unità di misura dalla prima lettera del nome. */
  function unitOf(q) {
    const c = q[0];
    return c === 'R' ? 'Ω' : c === 'I' ? 'A' : c === 'P' ? 'W' : 'V';
  }

  // ---------- Espressioni ----------
  const V = (n) => ({ t: 'v', n });
  const K = (k) => ({ t: 'k', k });
  const add = (...a) => (a.length === 1 ? a[0] : { t: '+', a });
  const sub = (a, b) => ({ t: '-', a, b });
  const mul = (...a) => ({ t: '*', a });
  const div = (a, b) => ({ t: '/', a, b });
  const inv = (a) => div(K(1), a);
  const sq = (a) => ({ t: 'sq', a });
  const sqrt = (a) => ({ t: 'sqrt', a });

  function evaluate(e, vals) {
    switch (e.t) {
      case 'v': return vals[e.n];
      case 'k': return e.k;
      case '+': return e.a.reduce((s, x) => s + evaluate(x, vals), 0);
      case '-': return evaluate(e.a, vals) - evaluate(e.b, vals);
      case '*': return e.a.reduce((s, x) => s * evaluate(x, vals), 1);
      case '/': return evaluate(e.a, vals) / evaluate(e.b, vals);
      case 'sq': { const x = evaluate(e.a, vals); return x * x; }
      case 'sqrt': return Math.sqrt(evaluate(e.a, vals));
      default: throw new Error('espressione ' + e.t);
    }
  }

  function deps(e, out = new Set()) {
    if (e.t === 'v') out.add(e.n);
    else if (e.a && Array.isArray(e.a)) e.a.forEach((x) => deps(x, out));
    else { if (e.a) deps(e.a, out); if (e.b) deps(e.b, out); }
    return out;
  }

  /**
   * Scrive un'espressione. F = { name(q), val(q, x), num(k), frac(a, b), root(x) }.
   * mode 'sym' usa i nomi, 'num' i valori con le unità.
   * Precedenze: 1 somma, 2 prodotto, 2.5 valore con unità, 4 potenza, 5 atomo (le frazioni sono atomi).
   */
  function render(e, F, mode, vals) {
    function r(x) {
      switch (x.t) {
        case 'v': {
          if (mode === 'sym') return { s: F.name(x.n), p: 5 };
          const v = vals[x.n];
          return { s: F.val(x.n, v), p: v < 0 ? 2.2 : 2.5 };
        }
        case 'k': return { s: F.num(x.k), p: 5 };
        case '+': return { s: x.a.map((y) => r(y).s).join(' + '), p: 1 };
        case '-': { const a = r(x.a); const b = r(x.b); return { s: a.s + ' − ' + (b.p < 2 || b.p === 2.2 ? '(' + b.s + ')' : b.s), p: 1 }; }
        case '*': return { s: x.a.map((y) => { const z = r(y); return z.p <= 2.2 ? '(' + z.s + ')' : z.s; }).join(' · '), p: 2 };
        case '/': return { s: F.frac(r(x.a).s, r(x.b).s), p: 5 };
        case 'sq': { const a = r(x.a); return { s: (a.p < 5 ? '(' + a.s + ')' : a.s) + '<sup>2</sup>', p: 4 }; }
        case 'sqrt': return { s: F.root(r(x.a).s), p: 5 };
        default: return { s: '?', p: 5 };
      }
    }
    return r(e).s;
  }

  // ---------- Relazioni ----------
  // forms: { grandezza: espressione per ricavarla }. why: testo con {Q} sostituiti dai nomi.
  // vars: tutte le grandezze che compaiono, anche quelle che la relazione non sa ricavare (le R in Millman)
  const rel = (forms, why, pri = 1) => {
    const vars = new Set(Object.keys(forms));
    Object.values(forms).forEach((e) => deps(e, vars));
    return { forms, vars: [...vars], why, pri };
  };

  const ohm = (Vq, Rq, Iq, why) => rel({ [Vq]: mul(V(Rq), V(Iq)), [Iq]: div(V(Vq), V(Rq)), [Rq]: div(V(Vq), V(Iq)) }, why || 'Legge di Ohm su {' + Rq + '}.');
  const vi = (Pq, Vq, Iq, why) => rel({ [Pq]: mul(V(Vq), V(Iq)), [Vq]: div(V(Pq), V(Iq)), [Iq]: div(V(Pq), V(Vq)) }, why || 'Potenza: P = V · I.');
  const ri2 = (Pq, Rq, Iq, why) => rel({ [Pq]: mul(V(Rq), sq(V(Iq))), [Rq]: div(V(Pq), sq(V(Iq))), [Iq]: sqrt(div(V(Pq), V(Rq))) }, why || 'Potenza dissipata: P = R · I².', 2);
  const v2r = (Pq, Vq, Rq, why) => rel({ [Pq]: div(sq(V(Vq)), V(Rq)), [Rq]: div(sq(V(Vq)), V(Pq)), [Vq]: sqrt(mul(V(Pq), V(Rq))) }, why || 'Potenza dissipata: P = V² / R.', 2);
  function sum(tot, parts, why) {
    const forms = { [tot]: add(...parts.map(V)) };
    parts.forEach((q) => {
      const others = parts.filter((x) => x !== q);
      forms[q] = others.length ? sub(V(tot), add(...others.map(V))) : V(tot);
    });
    return rel(forms, why);
  }
  function par(Rp, Rs, why) {
    const forms = {};
    forms[Rp] = Rs.length === 2 ? div(mul(V(Rs[0]), V(Rs[1])), add(V(Rs[0]), V(Rs[1]))) : inv(add(...Rs.map((q) => inv(V(q)))));
    Rs.forEach((q) => {
      const others = Rs.filter((x) => x !== q);
      forms[q] = others.length === 1 ? div(mul(V(Rp), V(others[0])), sub(V(others[0]), V(Rp))) : inv(sub(inv(V(Rp)), add(...others.map((o) => inv(V(o))))));
    });
    return rel(forms, why);
  }
  /** Ramo con generatore: V_A = E − R·I (la corrente entra nel nodo A). */
  const branch = (VA, E, R, I) => rel({
    [VA]: sub(V(E), mul(V(R), V(I))),
    [E]: add(V(VA), mul(V(R), V(I))),
    [I]: div(sub(V(E), V(VA)), V(R)),
    [R]: div(sub(V(E), V(VA)), V(I)),
  }, 'Ramo di {' + E + '}: V<sub>A</sub> = ' + '{' + E + '} − {' + R + '}·{' + I + '} (la corrente {' + I + '} va verso il nodo A).');
  const millman = rel({
    VA: div(add(div(V('E1'), V('R1')), div(V('E2'), V('R2'))), add(inv(V('R1')), inv(V('R2')), inv(V('R3')))),
    E1: mul(V('R1'), sub(mul(V('VA'), add(inv(V('R1')), inv(V('R2')), inv(V('R3')))), div(V('E2'), V('R2')))),
    E2: mul(V('R2'), sub(mul(V('VA'), add(inv(V('R1')), inv(V('R2')), inv(V('R3')))), div(V('E1'), V('R1')))),
  }, 'Teorema di Millman: il potenziale del nodo A è la media delle E/R pesata con le conduttanze 1/R.', 3);

  // ---------- Valori di partenza ----------
  const EV = [4.5, 5, 6, 9, 10, 12, 15, 18, 20, 24, 30, 36, 48];
  const RB = [1, 1.5, 2, 2.2, 3, 3.3, 4, 4.7, 5, 6, 6.8, 8, 10, 12, 15, 18, 20, 22, 24, 30, 33, 40, 47, 50, 60, 68, 80, 100];
  const scaleR = () => pick([1, 1, 10, 10, 100, 1000]);
  const Rnice = (sc) => Number((pick(RB) * sc).toPrecision(3));

  // ---------- Circuiti tipo ----------
  const range = (n) => Array.from({ length: n }, (_, k) => k + 1);

  function series(n) {
    const ks = range(n);
    const R = ks.map((k) => 'R' + k);
    const Vs = ks.map((k) => 'V' + k);
    const Ps = ks.map((k) => 'P' + k);
    const rels = [
      sum('Req', R, 'In serie le resistenze si sommano.'),
      ohm('E', 'Req', 'I', 'Legge di Ohm su tutto il circuito: E = R<sub>eq</sub> · I.'),
      ...ks.map((k) => ohm('V' + k, 'R' + k, 'I', 'Legge di Ohm su {R' + k + '}: in serie la corrente è la stessa, I.')),
      sum('E', Vs, 'Kirchhoff alle tensioni: le cadute sui resistori sommate danno E.'),
      ...ks.map((k) => vi('P' + k, 'V' + k, 'I', 'Potenza dissipata da {R' + k + '}: P = V · I.')),
      vi('Ptot', 'E', 'I', 'Potenza erogata dal generatore: P = E · I.'),
      sum('Ptot', Ps, 'Bilancio: la potenza erogata è uguale alla somma delle potenze dissipate.'),
      ...ks.map((k) => ri2('P' + k, 'R' + k, 'I')),
      ...ks.map((k) => v2r('P' + k, 'V' + k, 'R' + k)),
    ];
    return {
      key: 'series' + n, fig: 'series', title: n + ' resistori in serie', dof: n + 1,
      pool: ['E', ...R, 'Req', 'I', ...Vs, ...Ps, 'Ptot'],
      classic: ['E', ...R],
      primary: () => { const sc = scaleR(); return { E: pick(EV), R: ks.map(() => Rnice(sc)) }; },
      state: (p) => {
        const s = { E: p.E };
        p.R.forEach((r, i) => { s['R' + (i + 1)] = r; });
        s.Req = p.R.reduce((a, b) => a + b, 0);
        s.I = p.E / s.Req;
        ks.forEach((k) => { s['V' + k] = s['R' + k] * s.I; s['P' + k] = s['V' + k] * s.I; });
        s.Ptot = p.E * s.I;
        return s;
      },
      rels,
    };
  }

  function parallel(n) {
    const ks = range(n);
    const R = ks.map((k) => 'R' + k);
    const Is = ks.map((k) => 'I' + k);
    const Ps = ks.map((k) => 'P' + k);
    const rels = [
      par('Req', R, 'Resistenze in parallelo.'),
      ohm('E', 'Req', 'I', 'Legge di Ohm su tutto il circuito: E = R<sub>eq</sub> · I.'),
      ...ks.map((k) => ohm('E', 'R' + k, 'I' + k, 'Legge di Ohm su {R' + k + '}: in parallelo ogni ramo ha la tensione E.')),
      sum('I', Is, 'Kirchhoff al nodo A: la corrente del generatore si divide nei rami.'),
      ...ks.map((k) => vi('P' + k, 'E', 'I' + k, 'Potenza dissipata da {R' + k + '}: P = E · I<sub>' + k + '</sub>.')),
      vi('Ptot', 'E', 'I', 'Potenza erogata dal generatore: P = E · I.'),
      sum('Ptot', Ps, 'Bilancio: la potenza erogata è uguale alla somma delle potenze dissipate.'),
      ...ks.map((k) => ri2('P' + k, 'R' + k, 'I' + k)),
      ...ks.map((k) => v2r('P' + k, 'E', 'R' + k)),
    ];
    return {
      key: 'parallel' + n, fig: 'parallel', title: n + ' resistori in parallelo', dof: n + 1,
      pool: ['E', ...R, 'Req', 'I', ...Is, ...Ps, 'Ptot'],
      classic: ['E', ...R],
      primary: () => { const sc = scaleR(); return { E: pick(EV), R: ks.map(() => Rnice(sc)) }; },
      state: (p) => {
        const s = { E: p.E };
        p.R.forEach((r, i) => { s['R' + (i + 1)] = r; });
        s.Req = 1 / p.R.reduce((a, r) => a + 1 / r, 0);
        s.I = p.E / s.Req;
        ks.forEach((k) => { s['I' + k] = p.E / s['R' + k]; s['P' + k] = p.E * s['I' + k]; });
        s.Ptot = p.E * s.I;
        return s;
      },
      rels,
    };
  }

  const single = {
    key: 'single', fig: 'single', title: 'Generatore e resistore', dof: 2,
    pool: ['E', 'R', 'I', 'P'],
    classic: ['E', 'R'],
    primary: () => ({ E: pick(EV), R: Rnice(scaleR()) }),
    state: (p) => { const I = p.E / p.R; return { E: p.E, R: p.R, I, P: p.E * I }; },
    rels: [
      ohm('E', 'R', 'I', 'Legge di Ohm: su R c\'è tutta la tensione E del generatore.'),
      vi('P', 'E', 'I', 'Potenza: P = E · I.'),
      ri2('P', 'R', 'I'),
      v2r('P', 'E', 'R'),
    ],
  };

  const mix3 = {
    key: 'mix3', fig: 'mix3', title: 'Circuito misto', dof: 4,
    pool: ['E', 'R1', 'R2', 'R3', 'R23', 'Req', 'I', 'I2', 'I3', 'V1', 'V23', 'P1', 'P2', 'P3', 'Ptot'],
    classic: ['E', 'R1', 'R2', 'R3'],
    primary: () => { const sc = scaleR(); return { E: pick(EV), R1: Rnice(sc), R2: Rnice(sc), R3: Rnice(sc) }; },
    state: (p) => {
      const s = { ...p };
      s.R23 = (p.R2 * p.R3) / (p.R2 + p.R3);
      s.Req = p.R1 + s.R23;
      s.I = p.E / s.Req;
      s.V1 = p.R1 * s.I;
      s.V23 = s.R23 * s.I;
      s.I2 = s.V23 / p.R2;
      s.I3 = s.V23 / p.R3;
      s.P1 = s.V1 * s.I;
      s.P2 = s.V23 * s.I2;
      s.P3 = s.V23 * s.I3;
      s.Ptot = p.E * s.I;
      return s;
    },
    rels: [
      par('R23', ['R2', 'R3'], '{R2} e {R3} sono in parallelo tra A e B.'),
      sum('Req', ['R1', 'R23'], '{R1} è in serie al parallelo.'),
      ohm('E', 'Req', 'I', 'Legge di Ohm su tutto il circuito.'),
      ohm('V1', 'R1', 'I', 'Legge di Ohm su {R1}: ci passa tutta la corrente I.'),
      ohm('V23', 'R23', 'I', 'Legge di Ohm sul parallelo: la tensione tra A e B.'),
      ohm('V23', 'R2', 'I2', 'Legge di Ohm su {R2}: ha ai capi la tensione V<sub>23</sub>.'),
      ohm('V23', 'R3', 'I3', 'Legge di Ohm su {R3}: ha ai capi la tensione V<sub>23</sub>.'),
      sum('E', ['V1', 'V23'], 'Kirchhoff alle tensioni sulla maglia esterna.'),
      sum('I', ['I2', 'I3'], 'Kirchhoff al nodo A.'),
      vi('P1', 'V1', 'I', 'Potenza dissipata da {R1}.'),
      vi('P2', 'V23', 'I2', 'Potenza dissipata da {R2}.'),
      vi('P3', 'V23', 'I3', 'Potenza dissipata da {R3}.'),
      vi('Ptot', 'E', 'I', 'Potenza erogata dal generatore.'),
      sum('Ptot', ['P1', 'P2', 'P3'], 'Bilancio delle potenze.'),
      ri2('P1', 'R1', 'I'), ri2('P2', 'R2', 'I2'), ri2('P3', 'R3', 'I3'),
    ],
  };

  const twoGen = {
    key: 'twoGen', fig: 'twoGen', title: 'Due generatori', dof: 5,
    pool: ['E1', 'E2', 'R1', 'R2', 'R3', 'I1', 'I2', 'I3', 'VA'],
    classic: ['E1', 'E2', 'R1', 'R2', 'R3'],
    primary: () => { const sc = pick([1, 1, 10, 100]); return { E1: pick(EV), E2: pick(EV), R1: Rnice(sc), R2: Rnice(sc), R3: Rnice(sc) }; },
    state: (p) => {
      const s = { ...p };
      s.VA = (p.E1 / p.R1 + p.E2 / p.R2) / (1 / p.R1 + 1 / p.R2 + 1 / p.R3);
      s.I1 = (p.E1 - s.VA) / p.R1;
      s.I2 = (p.E2 - s.VA) / p.R2;
      s.I3 = s.VA / p.R3;
      return s;
    },
    rels: [
      branch('VA', 'E1', 'R1', 'I1'),
      branch('VA', 'E2', 'R2', 'I2'),
      ohm('VA', 'R3', 'I3', 'Legge di Ohm su {R3}: ha ai capi V<sub>A</sub> (B è a massa).'),
      sum('I3', ['I1', 'I2'], 'Kirchhoff al nodo A: le correnti che arrivano escono da {R3}.'),
      millman,
    ],
  };

  const thev = {
    key: 'thev', fig: 'thev', title: 'Thevenin con carico', dof: 5,
    pool: ['E', 'R1', 'R2', 'R3', 'RL', 'Vth', 'Rth', 'In', 'IL', 'VL', 'PL'],
    ask: ['Vth', 'Rth', 'In', 'IL', 'VL', 'PL', 'E', 'R1', 'R2', 'R3', 'RL'],
    classic: ['E', 'R1', 'R2', 'R3', 'RL'],
    primary: () => { const sc = pick([1, 10, 100, 1000]); return { E: pick(EV), R1: Rnice(sc), R2: Rnice(sc), R3: Rnice(sc), RL: Rnice(sc) }; },
    state: (p) => {
      const s = { ...p };
      s.Rs = p.R1 + p.R2;
      s.I0 = p.E / s.Rs;
      s.Vth = p.R2 * s.I0;
      s.R12 = (p.R1 * p.R2) / s.Rs;
      s.Rth = s.R12 + p.R3;
      s.In = s.Vth / s.Rth;
      s.Rtot = s.Rth + p.RL;
      s.IL = s.Vth / s.Rtot;
      s.VL = p.RL * s.IL;
      s.PL = s.VL * s.IL;
      return s;
    },
    rels: [
      sum('Rs', ['R1', 'R2'], 'A vuoto (senza carico) in {R3} non passa corrente: {R1} e {R2} sono in serie.'),
      ohm('E', 'Rs', 'I0', 'Corrente a vuoto nella serie {R1} + {R2}.'),
      ohm('Vth', 'R2', 'I0', 'A vuoto la tensione tra A e B è quella su {R2}: è la tensione di Thevenin.'),
      par('R12', ['R1', 'R2'], 'Spento E (al suo posto un corto), da A e B si vedono {R1} e {R2} in parallelo.'),
      sum('Rth', ['R12', 'R3'], 'Resistenza di Thevenin: il parallelo {R1} ∥ {R2} è in serie a {R3}.'),
      ohm('Vth', 'Rth', 'In', 'Corrente di Norton: la corrente di cortocircuito tra A e B.'),
      sum('Rtot', ['Rth', 'RL'], 'Con il carico, l\'equivalente è una serie R<sub>th</sub> + R<sub>L</sub>.'),
      ohm('Vth', 'Rtot', 'IL', 'Legge di Ohm sull\'equivalente di Thevenin con il carico.'),
      ohm('VL', 'RL', 'IL', 'Legge di Ohm sul carico.'),
      vi('PL', 'VL', 'IL', 'Potenza sul carico.'),
      ri2('PL', 'RL', 'IL'),
    ],
  };

  const TOPO = {};
  [single, series(2), series(3), parallel(2), parallel(3), mix3, twoGen, thev].forEach((t) => { TOPO[t.key] = t; });

  // ---------- Soluzione a catena ----------
  /**
   * Parte dalle grandezze note e applica le relazioni con una sola incognita.
   * Ritorna { known, steps }: steps = [{ x, ri, from:[...] }] nell'ordine di calcolo.
   */
  function propagate(topo, givens, vals) {
    const known = new Set(givens);
    const steps = [];
    const order = topo.rels.map((r, i) => i).sort((a, b) => topo.rels[a].pri - topo.rels[b].pri || a - b);
    let progress = true;
    while (progress) {
      progress = false;
      for (const ri of order) {
        const r = topo.rels[ri];
        const unk = r.vars.filter((q) => !known.has(q));
        if (unk.length !== 1) continue;
        const x = unk[0];
        const e = r.forms[x];
        if (!e) continue; // la relazione c'entra, ma non sa ricavare questa grandezza
        const v = evaluate(e, vals);
        // una relazione che non dà un valore (divisione per zero, radice di un negativo) non si usa
        if (!isFinite(v) || Math.abs(v - vals[x]) > 1e-6 * Math.max(1, Math.abs(vals[x]))) continue;
        known.add(x);
        steps.push({ x, ri, from: [...deps(e)] });
        progress = true;
        break; // riparte dalle relazioni più semplici
      }
    }
    return { known, steps };
  }

  /** Tiene solo i passaggi necessari per le grandezze cercate. */
  function prune(steps, targets) {
    const need = new Set(targets);
    const keep = [];
    for (let i = steps.length - 1; i >= 0; i--) {
      if (need.has(steps[i].x)) { keep.unshift(steps[i]); steps[i].from.forEach((q) => need.add(q)); }
    }
    return keep;
  }

  /**
   * Rifà i passaggi come li farebbe uno studente, arrotondando ogni risultato a 4 cifre:
   * scarta gli esercizi in cui l'arrotondamento sposta una risposta di più dello 0,5%
   * (succede quando si sottraggono due numeri quasi uguali).
   */
  function robust(topo, givens, st, vals, asks) {
    const have = {};
    givens.forEach((q) => { have[q] = vals[q]; });
    for (const s of st) {
      const v = evaluate(topo.rels[s.ri].forms[s.x], have);
      if (!isFinite(v)) return false;
      have[s.x] = Number(v.toPrecision(4));
    }
    return asks.every((q) => Math.abs(have[q] - vals[q]) <= 0.005 * Math.abs(vals[q]));
  }

  /**
   * Crea un esercizio.
   * level 1: dati "classici" (E e resistenze), cambiano le domande.
   *       2: uno dei dati classici diventa incognita, al suo posto un'altra grandezza (problema rovesciato).
   *       3: dati scelti a caso tra le grandezze con valori puliti.
   */
  function make(key, opts = {}) {
    const topo = TOPO[key];
    const level = opts.level || 1;
    const nAsk = opts.asks || (level === 1 ? 2 : pick([2, 3]));
    for (let tries = 0; tries < 2000; tries++) {
      const vals = topo.state(topo.primary());
      const okv = (q) => clean(vals[q]) && Math.abs(vals[q]) < 1e7;
      if (!topo.classic.every(okv)) continue;
      // niente rami con corrente nulla (succede con due generatori "in equilibrio"): sono casi degeneri
      if (topo.pool.some((q) => Math.abs(vals[q]) < 1e-9)) continue;
      const cleanPool = topo.pool.filter(okv);
      let givens = topo.classic.slice();
      let dropped = null;
      if (level === 2) {
        dropped = pick(topo.classic);
        const cand = shuffle(cleanPool.filter((q) => !topo.classic.includes(q)));
        if (!cand.length) continue;
        givens = givens.filter((q) => q !== dropped).concat(cand[0]);
      } else if (level === 3) {
        if (cleanPool.length < topo.dof + 2) continue;
        givens = shuffle(cleanPool).slice(0, topo.dof);
        // un esercizio "a sorpresa" deve avere almeno un dato non classico
        if (givens.every((q) => topo.classic.includes(q))) continue;
      }
      const { known, steps } = propagate(topo, givens, vals);
      // il circuito deve essere determinato: tutte le grandezze ricavabili
      if (!topo.pool.every((q) => known.has(q))) continue;
      const askable = (topo.ask || topo.pool).filter((q) => !givens.includes(q) && Math.abs(vals[q]) > 1e-12);
      const na = Math.min(nAsk, askable.length);
      if (!na) continue;
      let asks = shuffle(askable).slice(0, na);
      if (dropped && !asks.includes(dropped)) asks = [dropped, ...asks.slice(0, na - 1)];
      // almeno una domanda che richieda più di un passaggio
      const st = prune(steps, asks);
      if (level > 1 && st.length < 2) continue;
      if (!robust(topo, givens, st, vals, asks)) continue;
      const order = topo.pool.concat(Object.keys(vals).filter((q) => !topo.pool.includes(q)));
      asks.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      givens.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return { key, level, vals, givens, asks, steps: st.map((s) => ({ x: s.x, ri: s.ri })) };
    }
    return null;
  }

  const api = { TOPO, make, propagate, prune, robust, evaluate, render, deps, clean, unitOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Gen = api;
})(typeof window !== 'undefined' ? window : globalThis);
