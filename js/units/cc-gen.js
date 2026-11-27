/* Reti in CC — generatore di esercizi: cambiano i valori e anche le incognite */
(function () {
  'use strict';
  const App = window.App;
  const G = window.Gen;
  const L = App.Lessons;
  const S = App.Schem.T;
  const CC = App.CC;
  const h = CC.h;
  const { U, frac, step, res, name } = L.fmt;
  const pick = App.pick;

  const unit = (q) => G.unitOf(q);
  const F = {
    name: (q) => name(q),
    val: (q, v) => U(v, unit(q)),
    num: (k) => App.num(k),
    frac,
    root: (x) => `√<span class="ov">${x}</span>`,
  };
  const why = (t) => t.replace(/\{(\w+)\}/g, (_, q) => name(q));

  /** Descrizione a parole di una grandezza. */
  function desc(q) {
    const m = q.match(/^([A-Z])(\d)$/);
    if (m) {
      const k = m[2];
      return { R: `la resistenza ${name('R' + k)}`, V: `la tensione ai capi di ${name('R' + k)}`, I: `la corrente in ${name('R' + k)}`, P: `la potenza dissipata da ${name('R' + k)}`, E: `la f.e.m. ${name('E' + k)}` }[m[1]];
    }
    return {
      E: 'la f.e.m. del generatore', R: 'la resistenza', I: 'la corrente', P: 'la potenza',
      Req: 'la resistenza equivalente', Ptot: 'la potenza erogata dal generatore',
      R23: `la resistenza del parallelo ${name('R2')} ∥ ${name('R3')}`, V23: 'la tensione tra A e B',
      VA: 'il potenziale del nodo A', Vth: 'la tensione di Thevenin', Rth: 'la resistenza di Thevenin',
      In: 'la corrente di Norton', IL: 'la corrente nel carico', VL: 'la tensione sul carico',
      PL: 'la potenza sul carico', RL: 'la resistenza di carico',
    }[q] || name(q);
  }

  const INTRO = {
    single: 'Un generatore alimenta un resistore.',
    series: 'I resistori sono in serie e sono alimentati dal generatore <var>E</var>.',
    parallel: 'I resistori sono in parallelo e sono alimentati dal generatore <var>E</var>.',
    mix3: `${name('R1')} è in serie al parallelo di ${name('R2')} e ${name('R3')}.`,
    twoGen: `Due generatori reali alimentano ${name('R3')}; B è a massa e le frecce indicano i versi scelti per le correnti (un valore negativo vuol dire che la corrente va al contrario).`,
    thev: `Tra i morsetti A e B della rete è collegato il carico ${name('RL')}.`,
  };

  const askOf = (q, v) => {
    const u = unit(q);
    const lbl = name(q);
    return u === 'Ω' ? h.qR(lbl, v) : u === 'A' ? h.qI(lbl, v) : u === 'W' ? h.qP(lbl, v) : h.qV(lbl, v);
  };

  function figure(p, sol) {
    const t = G.TOPO[p.key];
    const known = (q) => sol || p.givens.includes(q);
    const R = (q) => (known(q) ? p.vals[q] : '?');
    const C = (q) => (known(q) ? p.vals[q] : null);
    const n = Number(p.key.slice(-1)) || 0;
    const ks = Array.from({ length: n }, (_, k) => k + 1);
    switch (t.fig) {
      case 'single': return S.single({ E: R('E'), R: R('R') }, { cur: { I: C('I') } });
      case 'series': return S.series({ E: R('E'), R: ks.map((k) => R('R' + k)) }, { cur: { I: C('I') } });
      case 'parallel': {
        const cur = { I: C('I') };
        ks.forEach((k) => { cur['I' + k] = C('I' + k); });
        return S.parallel({ E: R('E'), R: ks.map((k) => R('R' + k)) }, { cur });
      }
      case 'mix3': return S.mix3({ E: R('E'), R1: R('R1'), R2: R('R2'), R3: R('R3') }, { cur: { I: C('I'), I2: C('I2'), I3: C('I3') } });
      case 'twoGen': return S.twoGen({ E1: R('E1'), E2: R('E2'), R1: R('R1'), R2: R('R2'), R3: R('R3') }, { cur: { I1: C('I1'), I2: C('I2'), I3: C('I3') }, VA: C('VA') });
      default: return S.thevNet({ E: R('E'), R1: R('R1'), R2: R('R2'), R3: R('R3'), RL: R('RL') }, { cur: { IL: C('IL') } });
    }
  }

  /** Famiglia di esercizi sui circuiti indicati; choose() dice quali circuiti e che livello usare. */
  function family(id, title, choose) {
    const fam = {
      id, title, level: 2,
      gen: () => {
        let ex = null;
        for (let k = 0; !ex && k < 6; k++) { const c = choose(); ex = G.make(c.key, { level: c.level }); }
        if (!ex) ex = G.make('series2', { level: 1 });
        fam.level = ex.level;
        return ex;
      },
      solve: (p) => p,
      text: (p) => {
        const t = G.TOPO[p.key];
        const dati = p.givens.map((q) => `${name(q)} = ${U(p.vals[q], unit(q))}`).join(', ');
        const trova = p.asks.map((q) => desc(q) + (desc(q).includes(name(q)) ? '' : ' ' + name(q))).join('; ');
        const tag = p.level === 2 ? ' <span class="tag">problema rovesciato</span>' : p.level === 3 ? ' <span class="tag">dati a sorpresa</span>' : '';
        return `${INTRO[t.fig]} <strong>Dati:</strong> ${dati}. <strong>Trova:</strong> ${trova}.${tag}`;
      },
      fig: (p, r, sol) => figure(p, sol),
      asks: (p) => p.asks.map((q) => askOf(q, p.vals[q])),
      hint: () => 'Cerca una relazione con una sola incognita: la legge di Ohm su un resistore di cui conosci due grandezze su tre, oppure una somma (serie, Kirchhoff, bilancio delle potenze) a cui manca un solo termine. Ogni risultato diventa un dato per il passo dopo.',
      steps: (p) => {
        const t = G.TOPO[p.key];
        const have = {};
        p.givens.forEach((q) => { have[q] = p.vals[q]; });
        return p.steps.map((s) => {
          const r = t.rels[s.ri];
          const e = r.forms[s.x];
          const sym = G.render(e, F, 'sym', have);
          const num = G.render(e, F, 'num', have);
          const v = G.evaluate(e, have);
          have[s.x] = v;
          const out = p.asks.includes(s.x) ? res(U(v, unit(s.x))) : U(v, unit(s.x));
          return step(e.t === 'v' ? `${name(s.x)} = ${sym} = ${out}` : `${name(s.x)} = ${sym} = ${num} = ${out}`, why(r.why));
        }).join('');
      },
      table: (p) => {
        const t = G.TOPO[p.key];
        return `<div class="table-wrap"><table class="tbl gen-sum"><thead><tr><th>Grandezza</th><th>Valore</th><th></th></tr></thead><tbody>` +
          t.pool.map((q) => `<tr${p.asks.includes(q) ? ' class="hl"' : ''}><td>${name(q)}</td><td class="mono">${U(p.vals[q], unit(q))}</td><td>${p.givens.includes(q) ? 'dato' : p.asks.includes(q) ? 'richiesto' : ''}</td></tr>`).join('') +
          '</tbody></table></div>';
      },
    };
    return fam;
  }

  const LVL = () => pick([1, 2, 2, 3]);
  const PER_LESSON = {
    m1: ['single'], m2: ['series2', 'series3'], m3: ['parallel2', 'parallel3'], m4: ['mix3'],
    m5: ['twoGen'], m6: ['twoGen'], m7: ['twoGen'], m8: ['twoGen'], m9: ['thev'],
  };
  Object.entries(PER_LESSON).forEach(([lid, keys]) => {
    const l = CC.lessons.find((x) => x.id === lid);
    if (!l) return;
    l.families = l.families || [];
    l.families.push(family('gen-' + lid, '🎲 Incognite a sorpresa', () => ({ key: pick(keys), level: LVL() })));
  });

  // ---------- Lezione "Generatore" ----------
  const TOP = [
    ['single', 'Ohm', ['single']],
    ['series', 'Serie', ['series2', 'series3']],
    ['parallel', 'Parallelo', ['parallel2', 'parallel3']],
    ['mix', 'Misto', ['mix3']],
    ['two', 'Due generatori', ['twoGen']],
    ['thev', 'Thevenin', ['thev']],
  ];
  const LEVELS = [[0, 'Mescola'], [1, 'Dati classici'], [2, 'Problema rovesciato'], [3, 'Tutto a sorpresa']];

  function widgetGen(host) {
    const c = CC.widgetCard('Generatore di esercizi', 'Scegli i circuiti e la difficoltà: cambiano i valori e anche le incognite');
    const on = new Set(TOP.map((t) => t[0]));
    let level = 0;
    const segT = document.createElement('div');
    segT.className = 'seg';
    segT.setAttribute('aria-label', 'Circuiti');
    segT.innerHTML = TOP.map(([k, l]) => `<button type="button" data-k="${k}">${l}</button>`).join('');
    const segL = document.createElement('div');
    segL.className = 'seg';
    segL.setAttribute('aria-label', 'Difficoltà');
    segL.innerHTML = LEVELS.map(([k, l]) => `<button type="button" data-l="${k}">${l}</button>`).join('');
    const note = document.createElement('p');
    note.className = 'hint';
    const holder = document.createElement('div');
    const fam = family('gen-libero', 'Esercizio generato', () => {
      const keys = TOP.filter((t) => on.has(t[0])).flatMap((t) => t[2]);
      return { key: pick(keys), level: level || LVL() };
    });
    const paint = () => {
      segT.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(on.has(b.dataset.k))));
      segL.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.l) === level)));
      note.innerHTML = [
        'Livelli misti: a volte i dati classici, a volte un problema rovesciato o dati a sorpresa.',
        'Dati classici: conosci il generatore e le resistenze, cambiano le domande.',
        'Problema rovesciato: una delle resistenze (o la f.e.m.) diventa incognita, e al suo posto conosci un\'altra grandezza: una corrente, una tensione, una potenza…',
        'Tutto a sorpresa: i dati sono scelti a caso fra tutte le grandezze del circuito. A volte serve un giro lungo per arrivare alla risposta.',
      ][level];
    };
    const rebuild = () => { holder.innerHTML = ''; holder.appendChild(L.exerciseCard('cc', fam)); };
    segT.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const k = b.dataset.k;
      if (on.has(k)) { if (on.size > 1) on.delete(k); } else on.add(k);
      paint();
      rebuild();
    });
    segL.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      level = Number(b.dataset.l);
      paint();
      rebuild();
    });
    const g1 = document.createElement('div');
    g1.className = 'msi-grp';
    g1.innerHTML = '<span class="msi-cap">Circuiti (uno o più)</span>';
    g1.appendChild(segT);
    const g2 = document.createElement('div');
    g2.className = 'msi-grp';
    g2.innerHTML = '<span class="msi-cap">Difficoltà</span>';
    g2.appendChild(segL);
    const ctl = document.createElement('div');
    ctl.className = 'msi-ctl';
    ctl.append(g1, g2);
    c.append(ctl, note);
    host.append(c, holder);
    paint();
    rebuild();
  }

  const i = CC.lessons.findIndex((x) => x.id === 'verifica');
  CC.lessons.splice(i < 0 ? CC.lessons.length : i + 1, 0, {
    id: 'generatore', short: 'Generatore', title: 'Generatore di esercizi', num: '🎲',
    intro: 'Esercizi infiniti sui circuiti delle lezioni da Ohm a Thevenin. Non cambiano solo i numeri: cambia anche che cosa conosci e che cosa devi trovare. Lo svolgimento mostra una strada possibile, passo per passo.',
    goals: ['Riconoscere quali relazioni usare', 'Problemi rovesciati', 'Risolvere a catena'],
    widgets: [widgetGen],
    theory: `
      <article class="note"><h4>Come si risolve un problema qualsiasi</h4>
        <ol><li>Scrivi i dati sullo schema e segna le incognite.</li>
          <li>Cerca una relazione in cui manca <strong>una sola</strong> grandezza e ricavala.</li>
          <li>Il risultato diventa un nuovo dato: ricomincia dal punto 2 finché non arrivi alla domanda.</li></ol></article>
      <article class="note"><h4>Le relazioni che hai a disposizione</h4>
        <ul><li><strong>Ohm</strong> su ogni resistore: <var>V</var> = <var>R</var> · <var>I</var> (e le due formule inverse).</li>
          <li><strong>Serie</strong>: stessa corrente, <var>R</var><sub>eq</sub> = somma, tensioni che si sommano.</li>
          <li><strong>Parallelo</strong>: stessa tensione, correnti che si sommano, 1/<var>R</var><sub>eq</sub> = somma delle 1/<var>R</var>.</li>
          <li><strong>Kirchhoff</strong>: correnti ai nodi, tensioni alle maglie.</li>
          <li><strong>Potenza</strong>: <var>P</var> = <var>V</var> · <var>I</var> = <var>R</var> · <var>I</var>² = <var>V</var>² / <var>R</var>, e il bilancio: erogata = dissipata.</li>
          <li><strong>Millman</strong> e <strong>Thevenin</strong> quando le relazioni semplici non bastano.</li></ul></article>
      <article class="note"><h4>Problema rovesciato</h4>
        <p>Se l'incognita è una resistenza o la f.e.m., di solito si parte dall'altra parte: dalla grandezza che conosci in più (una corrente, una tensione, una potenza) si risale con Ohm. Esempio: dati <var>E</var>, ${name('R1')} e <var>I</var> in una serie, prima <var>R</var><sub>eq</sub> = <var>E</var>/<var>I</var>, poi ${name('R2')} = <var>R</var><sub>eq</sub> − ${name('R1')}.</p></article>`,
  });
})();
