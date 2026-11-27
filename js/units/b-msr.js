/* 2ª — Misure elettriche e sicurezza: inserzione degli strumenti, multimetro, effetto di carico, sicurezza */
(function () {
  'use strict';
  const App = window.App;
  const BS = window.Basi;
  const L = App.Lessons;
  const { N, U, frac, step, res } = L.fmt;
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const S = App.Schem.T;
  const lessons = [];
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const mc = (bank) => ({
    gen: () => ({ k: rand(0, bank.length - 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => { const [q, opts, why] = bank[p.k]; return { q, opts: p.o.map((i) => opts[i]), ans: p.o.indexOf(0), why }; },
    text: (p, r) => r.q,
    asks: (p, r) => [h.choice('Risposta', r.opts, r.ans)],
    steps: (p, r) => step(res(r.opts[r.ans]), r.why),
  });
  const V_ = '<var>V</var>';
  const I_ = '<var>I</var>';
  const R_ = '<var>R</var>';
  const Rv = '<var>R</var><sub>V</sub>';
  const Ra = '<var>R</var><sub>A</sub>';
  const par = (a, b) => (a === Infinity ? b : b === Infinity ? a : (a * b) / (a + b));
  const SI = (x, u, s = 3) => App.si(x, u, s);

  // =====================================================================
  // 1 — Amperometro e voltmetro
  // =====================================================================
  const i1 = [];
  i1.push({
    id: 'ins-read', title: 'Che cosa leggono gli strumenti?', level: 1,
    defaults: { E: 12, R1: 100, R2: 200 },
    gen: () => ({ E: pick([6, 9, 12, 24]), R1: pick([47, 100, 150, 220, 470]), R2: pick([100, 220, 330, 680, 1000]) }),
    solve: (p) => { const I = p.E / (p.R1 + p.R2); return { I, V2: I * p.R2 }; },
    text: (p) => `Un generatore ideale da ${U(p.E, 'V')} alimenta due resistori in serie, ${U(p.R1, 'Ω')} e ${U(p.R2, 'Ω')}. L'amperometro è in serie, il voltmetro ai capi del secondo resistore. Che cosa leggono (strumenti ideali)?`,
    fig: (p, r, sol) => S.measure(p, { A: 'serie', V: 'parallelo', rA: sol ? SI(r.I, 'A') : '?', rV: sol ? SI(r.V2, 'V') : '?' }),
    asks: (p, r) => [h.qI('Amperometro', r.I), h.qV('Voltmetro', r.V2)],
    steps: (p, r) => step(`${I_} = ${frac('<var>E</var>', R_ + '<sub>1</sub> + ' + R_ + '<sub>2</sub>')} = ${frac(N(p.E), N(p.R1 + p.R2))} = ${res(U(r.I, 'A'))}`, 'In serie la corrente è la stessa dappertutto: l\'amperometro la legge in qualsiasi punto dell\'anello.') +
      step(`${V_}<sub>2</sub> = ${R_}<sub>2</sub> · ${I_} = ${res(U(r.V2, 'V'))}`, 'Il voltmetro legge la tensione tra i due punti a cui è collegato.'),
  });
  i1.push({
    id: 'ins-amm', title: 'L\'amperometro non è ideale', level: 2,
    gen: () => ({ E: pick([1.5, 3, 4.5]), R: pick([1, 2, 4.7, 10, 100]), Ra: pick([0.1, 0.5, 1]) }),
    solve: (p) => BS.ammeterErr(p.E, p.R, p.Ra),
    text: (p) => `Una pila ideale da ${U(p.E, 'V')} alimenta un resistore da ${U(p.R, 'Ω')}. Per misurare la corrente inserisci un amperometro con resistenza interna ${U(p.Ra, 'Ω')}. Quanta corrente c'era senza strumento? Quanta ne legge? Di che percentuale sbaglia?`,
    asks: (p, r) => [h.qI(I_ + ' vera', r.ideal), h.qI(I_ + ' letta', r.meas), { label: 'Errore', unit: '%', value: r.err * 100, signNote: 'La corrente letta è minore di quella vera: l\'errore è negativo.' }],
    steps: (p, r) => step(`Senza strumento: ${I_} = ${frac(N(p.E), N(p.R))} = ${U(r.ideal, 'A')}`) +
      step(`Con lo strumento: ${I_} = ${frac(N(p.E), N(p.R) + ' + ' + N(p.Ra))} = ${res(U(r.meas, 'A'))}`, 'L\'amperometro aggiunge la sua resistenza all\'anello e la corrente cala.') +
      step(`Errore = ${frac(N(r.meas, 4) + ' − ' + N(r.ideal, 4), N(r.ideal, 4))} = ${res(N(r.err * 100, 3) + ' %')}`, p.Ra / p.R > 0.02 ? 'Errore sensibile: la resistenza dello strumento non è trascurabile rispetto al circuito.' : 'Errore piccolo: lo strumento ha una resistenza molto minore di quella del circuito.'),
  });
  i1.push({
    id: 'ins-wrong', title: 'Strumento collegato male', level: 3,
    gen: () => (Math.random() < 0.5 ? { mode: 'V', E: pick([9, 12, 24]), R: pick([10, 47, 100]), Rv: 10e6 } : { mode: 'A', E: pick([9, 12]), r: pick([0.1, 0.2, 0.5]), Ra: 0.1, fuse: 10 }),
    solve: (p) => (p.mode === 'V' ? { I: p.E / (p.R + p.Rv), Vr: (p.E * p.Rv) / (p.R + p.Rv) } : { I: p.E / (p.r + p.Ra) }),
    text: (p) => (p.mode === 'V'
      ? `Per sbaglio colleghi il voltmetro (${R_}<sub>V</sub> = 10 MΩ) in serie a una lampada da ${U(p.R, 'Ω')}, alimentata a ${U(p.E, 'V')}. Che cosa legge il voltmetro? Quanta corrente passa nella lampada?`
      : `Per sbaglio colleghi l'amperometro (${R_}<sub>A</sub> = 0,1 Ω, fusibile interno da 10 A) direttamente ai morsetti di una batteria da ${U(p.E, 'V')} con resistenza interna ${U(p.r, 'Ω')}. Quanta corrente prova a passare? Che cosa succede?`),
    asks: (p, r) => (p.mode === 'V' ? [h.qV('Lettura', r.Vr), { label: I_, unit: 'µA', value: r.I * 1e6 }] : [{ label: I_, unit: 'A', value: r.I }, h.choice('Che cosa succede?', ['il fusibile dello strumento brucia', 'lo strumento legge la tensione', 'non succede niente', 'la batteria si ricarica'], 0)]),
    steps: (p, r) => (p.mode === 'V'
      ? step(`Anello: ${R_} + ${Rv} = ${N(p.R)} Ω + 10 MΩ → ${I_} = ${res(SI(r.I, 'A'))}`, 'Il voltmetro ha una resistenza enorme: la corrente quasi si annulla e la lampada resta spenta.') + step(`${V_} letta = ${Rv} · ${I_} = ${res(SI(r.Vr, 'V', 4))}`, 'Legge quasi tutta la tensione del generatore: sembra tutto normale, invece il circuito è fermo.')
      : step(`${I_} = ${frac('<var>E</var>', '<var>r</var> + ' + Ra)} = ${frac(N(p.E), N(p.r) + ' + 0,1')} = ${res(U(r.I, 'A'))}`, 'L\'amperometro ha una resistenza piccolissima: messo in parallelo è quasi un cortocircuito.') + step(res('Supera i 10 A: il fusibile interno brucia'), 'Se lo strumento non avesse il fusibile si danneggerebbe, e con certe batterie (auto, litio) si rischia un incendio.')),
  });
  i1.push({
    id: 'ins-mc', title: 'Come si collegano', level: 1,
    ...mc([
      ['Per misurare la corrente in una lampada, l\'amperometro va…', ['in serie alla lampada, aprendo il circuito', 'in parallelo alla lampada', 'tra i poli della batteria', 'al posto della lampada'], 'Deve essere attraversato dalla corrente da misurare.'],
      ['Un buon voltmetro ha resistenza interna…', ['molto grande', 'molto piccola', 'uguale a quella del carico', 'nulla'], 'Così assorbe pochissima corrente e non disturba il circuito.'],
      ['Un buon amperometro ha resistenza interna…', ['molto piccola', 'molto grande', 'uguale a quella del carico', 'infinita'], 'Così non cambia la corrente dell\'anello.'],
      ['Prima di misurare una tensione sconosciuta con un tester…', ['si sceglie la portata più alta e poi si scende', 'si sceglie la portata più bassa', 'si mette il tester su "A"', 'si cortocircuitano i puntali'], 'Così lo strumento non va fuori scala.'],
      ['L\'ohmmetro si usa…', ['con il circuito spento e il componente scollegato', 'con il circuito acceso', 'in serie al generatore', 'solo in alternata'], 'L\'ohmmetro usa la sua pila interna: altre tensioni falserebbero la misura (o lo danneggerebbero).'],
    ]),
  });

  function widgetInsert(host) {
    const c = K.widgetCard('Dove metto gli strumenti?', 'Batteria 12 V (r = 0,2 Ω) e lampada da 24 Ω. Prova anche i collegamenti sbagliati');
    const E = 12;
    const r = 0.2;
    const R = 24;
    const RA = 0.05;
    const RV = 10e6;
    let A = 'serie';
    let Vp = 'parallelo';
    let blown = false;
    const ctl = el('div', 'msi-ctl');
    const segA = el('div', 'seg');
    segA.innerHTML = '<button type="button" data-k="serie">in serie</button><button type="button" data-k="parallelo">in parallelo alla lampada</button>';
    const segV = el('div', 'seg');
    segV.innerHTML = '<button type="button" data-k="parallelo">in parallelo alla lampada</button><button type="button" data-k="serie">in serie</button>';
    const grpA = el('div', 'msi-grp');
    grpA.innerHTML = '<span class="msi-cap">Amperometro</span>';
    grpA.appendChild(segA);
    const grpV = el('div', 'msi-grp');
    grpV.innerHTML = '<span class="msi-cap">Voltmetro</span>';
    grpV.appendChild(segV);
    const reset = el('button', 'btn ghost small');
    reset.type = 'button';
    reset.textContent = 'Cambia il fusibile';
    ctl.append(grpA, grpV, reset);
    const sch = el('div', 'ex-fig');
    const out = el('div', 'forms');
    const draw = () => {
      // resistenze: amperometro (se il fusibile è sano) e voltmetro
      const ra = blown ? Infinity : RA;
      let I;
      let IA;
      let VV;
      let IR;
      if (Vp === 'parallelo') {
        if (A === 'serie') {
          const load = par(R, RV);
          I = blown ? 0 : E / (r + RA + load);
          IA = I;
          VV = I * load;
          IR = VV / R;
        } else {
          const load = par(par(R, RV), ra);
          I = E / (r + load);
          VV = I * load;
          IA = blown ? 0 : VV / RA;
          IR = VV / R;
        }
      } else if (A === 'serie') {
        I = blown ? 0 : E / (r + RA + RV + R);
        IA = I;
        VV = I * RV;
        IR = I;
      } else {
        const load = par(R, ra);
        I = E / (r + RV + load);
        VV = I * RV;
        IA = blown ? 0 : (I * load) / RA;
        IR = (I * load) / R;
      }
      if (!blown && IA > 10) { blown = true; draw(); return; }
      const P = IR * IR * R;
      sch.innerHTML = S.measure({ E, R2: R }, { A, V: Vp, rA: blown ? 'fusibile bruciato' : SI(IA, 'A'), rV: SI(VV, 'V'), blown, hlR: P > 1 }).svg;
      const ok = A === 'serie' && Vp === 'parallelo';
      const msg = blown ? 'L\'amperometro in parallelo alla lampada è quasi un cortocircuito: la corrente ha superato 10 A e il fusibile interno è bruciato. Rimetti l\'amperometro in serie e cambia il fusibile.'
        : ok ? 'Collegamento giusto: l\'amperometro è attraversato dalla corrente della lampada, il voltmetro legge la sua tensione.'
          : Vp === 'serie' ? 'Il voltmetro in serie ha 10 MΩ: la corrente crolla a pochi microampere e la lampada si spegne. Il voltmetro però legge quasi 12 V: sembra tutto normale, invece il circuito è fermo.'
            : 'Collegamento sbagliato.';
      out.innerHTML = `<div class="form-row"><span class="label">Lampada</span><div class="f">${P > 1 ? res('accesa') : 'spenta'}: ${SI(IR, 'A')}, ${SI(P, 'W')}</div><span class="meta" style="color:var(--${ok ? 'ok' : 'bad'})">${msg}</span></div>`;
      segA.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === A)));
      segV.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === Vp)));
      reset.hidden = !blown;
    };
    segA.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { A = b.dataset.k; draw(); } });
    segV.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { Vp = b.dataset.k; draw(); } });
    reset.addEventListener('click', () => { blown = false; A = 'serie'; draw(); });
    c.append(ctl, sch, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'strumenti', num: 1, short: 'Strumenti', title: 'Amperometro e voltmetro',
    intro: 'Misurare vuol dire inserire uno strumento nel circuito senza cambiarlo troppo. L\'amperometro va in serie e deve "sparire" (resistenza quasi nulla); il voltmetro va in parallelo e non deve assorbire corrente (resistenza altissima).',
    goals: ['Amperometro in serie', 'Voltmetro in parallelo', 'Resistenza interna degli strumenti', 'Errori di collegamento'],
    widgets: [widgetInsert],
    example: i1[0], exampleTitle: 'Esempio: che cosa leggono gli strumenti',
    families: i1,
    theory: `
      <article class="note"><h4>Amperometro</h4><p>In serie, nel punto in cui vuoi la corrente: devi aprire il circuito. Resistenza interna ${Ra} piccolissima. Mai in parallelo: sarebbe un cortocircuito.</p></article>
      <article class="note"><h4>Voltmetro</h4><p>In parallelo ai due punti. Resistenza interna ${Rv} altissima (tester digitale: 10 MΩ). In serie bloccherebbe la corrente.</p></article>
      <article class="note"><h4>Ohmmetro</h4><p>Circuito spento, componente scollegato almeno da un lato: lo strumento manda una sua piccola corrente e misura la tensione.</p></article>`,
  });

  // =====================================================================
  // 2 — Il multimetro: portate, risoluzione, errori
  // =====================================================================
  const m2 = [];
  const RANGES = [0.2, 2, 20, 200, 600];
  const rName = (x) => (x < 1 ? N(x * 1000) + ' mV' : N(x) + ' V');
  m2.push({
    id: 'dmm-range', title: 'Quale portata?', level: 1,
    defaults: { v: 4.5 },
    gen: () => ({ v: pick([0.045, 0.12, 0.9, 1.5, 3.3, 4.5, 9, 12, 24, 48, 120, 230, 400]) }),
    solve: (p) => ({ best: BS.bestRange(p.v, RANGES) }),
    text: (p) => `Con un tester digitale a 2000 punti (portate 200 mV, 2 V, 20 V, 200 V, 600 V) devi misurare circa ${U(p.v, 'V')}. Quale portata scegli per la misura più precisa?`,
    asks: (p, r) => [h.choice('Portata', RANGES.map(rName), RANGES.indexOf(r.best))],
    steps: (p, r) => step(`La più piccola che contiene ${U(p.v, 'V')}: ${res(rName(r.best))}`, 'Con una portata più piccola lo strumento va fuori scala ("OL" o un "1" a sinistra); con una più grande perdi cifre decimali.'),
  });
  m2.push({
    id: 'dmm-res', title: 'La risoluzione', level: 1,
    gen: () => ({ range: pick([0.2, 2, 20, 200]), counts: pick([2000, 4000, 6000]) }),
    solve: (p) => { const rng = p.counts === 2000 ? p.range : p.range * (p.counts / 2000); return { rng, resol: rng / p.counts }; },
    text: (p, r) => `Un multimetro a ${N(p.counts)} punti è sulla portata ${rName(r.rng)}. Qual è la più piccola variazione di tensione che può mostrare (risoluzione)?`,
    asks: (p, r) => [{ label: 'Risoluzione', unit: 'mV', value: r.resol * 1000 }],
    steps: (p, r) => step(`Risoluzione = ${frac('portata', 'punti')} = ${frac(rName(r.rng), N(p.counts))} = ${res(App.si(r.resol, 'V', 3))}`, 'È il valore di 1 digit, l\'ultima cifra a destra del display.'),
  });
  m2.push({
    id: 'dmm-err', title: 'Quanto è precisa la misura?', level: 2,
    gen: () => { const range = pick([2, 20, 200]); return { range, v: Number((range * pick([0.08, 0.25, 0.4, 0.62, 0.9])).toPrecision(3)), p: pick([0.5, 0.8, 1]), n: pick([1, 2, 3]) }; },
    solve: (p) => BS.dmm(p.v, p.range, 2000, p.p, p.n),
    text: (p, r) => `Il display mostra ${N(r.shown, 4)} V sulla portata ${rName(p.range)} (2000 punti). Il manuale dice: precisione ± (${N(p.p)} % della lettura + ${p.n} digit). Quanto vale l'errore assoluto? E quello relativo?`,
    asks: (p, r) => [{ label: 'Errore assoluto ±', unit: 'mV', value: r.abs * 1000 }, { label: 'Errore relativo ±', unit: '%', value: r.rel * 100 }],
    steps: (p, r) => step(`1 digit = ${frac(rName(p.range), '2000')} = ${App.si(r.resol, 'V', 3)}`) +
      step(`± (${N(p.p / 100)} · ${N(r.shown, 4)} + ${p.n} · ${N(r.resol)}) = ${res('± ' + App.si(r.abs, 'V', 3))}`, 'La parte in percentuale dipende dalla lettura, quella in digit dalla portata.') +
      step(`Relativo: ${frac(App.si(r.abs, 'V', 3), N(r.shown, 4) + ' V')} = ${res('± ' + N(r.rel * 100, 3) + ' %')}`, `Risultato da scrivere: ${N(r.shown, 4)} V ± ${App.si(r.abs, 'V', 2)}.`),
  });
  m2.push({
    id: 'ana-cls', title: 'Lo strumento a lancetta', level: 2,
    gen: () => { const fs = pick([10, 30, 100, 300]); return { fs, cls: pick([0.5, 1, 1.5, 2.5]), v: Number((fs * pick([0.15, 0.3, 0.5, 0.8, 1])).toPrecision(2)) }; },
    solve: (p) => BS.analog(p.v, p.fs, p.cls),
    text: (p) => `Un voltmetro analogico di classe ${N(p.cls)}, sulla portata ${p.fs} V, indica ${N(p.v)} V. Quanto vale l'errore assoluto massimo? E quello relativo?`,
    asks: (p, r) => [{ label: 'Errore assoluto ±', unit: 'V', value: r.abs }, { label: 'Errore relativo ±', unit: '%', value: r.rel * 100 }],
    steps: (p, r) => step(`Assoluto = classe % del fondo scala = ${N(p.cls)} % · ${p.fs} V = ${res('± ' + U(r.abs, 'V'))}`, 'Negli strumenti analogici l\'errore assoluto è lo stesso su tutta la scala.') +
      step(`Relativo = ${frac(N(r.abs) + ' V', N(p.v) + ' V')} = ${res('± ' + N(r.rel * 100, 3) + ' %')}`, 'Per questo si sceglie la portata in cui la lancetta va oltre metà scala: a inizio scala l\'errore relativo diventa enorme.'),
  });
  m2.push({
    id: 'dmm-best', title: 'Due portate a confronto', level: 3,
    gen: () => ({ v: pick([1.234, 1.5, 1.85, 1.62]) }),
    solve: (p) => { const a = BS.dmm(p.v, 2); const b = BS.dmm(p.v, 20); return { a, b }; },
    text: (p, r) => `Misuri la stessa pila due volte con un tester a 2000 punti, precisione ± (0,5 % + 2 digit). Sulla portata 2 V leggi ${N(r.a.shown, 4)} V, sulla 20 V leggi ${N(r.b.shown, 4)} V. Calcola l'errore relativo delle due misure.`,
    asks: (p, r) => [{ label: 'Errore sulla 2 V ±', unit: '%', value: r.a.rel * 100 }, { label: 'Errore sulla 20 V ±', unit: '%', value: r.b.rel * 100 }],
    steps: (p, r) => step(`Portata 2 V: 1 digit = 1 mV → ± (0,005 · ${N(r.a.shown, 4)} + 0,002) = ± ${App.si(r.a.abs, 'V', 3)} → ${res(N(r.a.rel * 100, 3) + ' %')}`) +
      step(`Portata 20 V: 1 digit = 10 mV → ± (0,005 · ${N(r.b.shown, 4)} + 0,02) = ± ${App.si(r.b.abs, 'V', 3)} → ${res(N(r.b.rel * 100, 3) + ' %')}`, 'Sulla portata giusta l\'errore è molto più piccolo: i digit pesano di meno.'),
  });
  m2.push({
    id: 'dmm-mc', title: 'Concetti sul multimetro', level: 1,
    ...mc([
      ['Un tester "3 ½ cifre" mostra al massimo…', ['1999', '9999', '999', '19999'], 'La mezza cifra è il primo 1, che può valere solo 0 o 1: sono 2000 punti.'],
      ['Sul display compare "OL". Vuol dire…', ['fuori portata: serve una portata più alta', 'tensione zero', 'pila del tester carica', 'misura perfetta'], 'Over Load.'],
      ['Per misurare la corrente con il tester bisogna…', ['spostare il puntale rosso nella boccola "A" o "mA" e mettere lo strumento in serie', 'lasciare il puntale su "V" e mettersi in parallelo', 'usare la portata Ω', 'misurare a circuito spento'], 'Lasciare i puntali nella boccola A e poi misurare una tensione è uno degli errori più comuni: si brucia il fusibile.'],
      ['La classe di precisione 1,5 di un voltmetro analogico vuol dire…', ['errore massimo ± 1,5 % del fondo scala', 'errore ± 1,5 % della lettura', 'resistenza 1,5 MΩ', 'portata 1,5 V'], 'Per questo conviene leggere nella seconda metà della scala.'],
    ]),
  });

  function widgetDMM(host) {
    const c = K.widgetCard('Il multimetro digitale', '2000 punti, precisione ± (0,5 % + 2 digit): scegli la portata giusta');
    let rng = 20;
    const seg = el('div', 'seg');
    seg.innerHTML = RANGES.map((x) => `<button type="button" data-r="${x}">${rName(x)}</button>`).join('');
    const lcd = el('div', 'lcd');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const m = BS.dmm(v.V, rng);
      const dec = Math.max(0, -Math.round(Math.log10(m.resol)));
      const shownTxt = m.over ? 'OL' : (rng < 1 ? (m.shown * 1000).toFixed(1) : m.shown.toFixed(dec)).replace('.', ',');
      lcd.innerHTML = `<span class="lcd-v">${shownTxt}</span><span class="lcd-u">${rng < 1 ? 'mV' : 'V'}</span>`;
      out.innerHTML = m.over
        ? `<div class="form-row"><span class="label">Fuori portata</span><div class="f">${U(v.V, 'V')} non entra in ${rName(rng)}</div><span class="meta">Passa a una portata più alta.</span></div>`
        : `<div class="form-row"><span class="label">Risoluzione</span><div class="f">1 digit = ${App.si(m.resol, 'V', 3)}</div></div>
           <div class="form-row"><span class="label">Errore</span><div class="f">± ${App.si(m.abs, 'V', 3)} = ${res('± ' + N(m.rel * 100, 3) + ' %')}</div><span class="meta">${BS.bestRange(v.V, RANGES) === rng ? 'Questa è la portata migliore.' : 'Con la portata ' + rName(BS.bestRange(v.V, RANGES)) + ' leggeresti più cifre e l\'errore sarebbe più piccolo.'}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.r) === rng)));
    };
    const sl = K.sliders(c, [{ id: 'V', label: 'Tensione vera da misurare (V)', min: 0.01, max: 700, log: true, value: 4.5 }], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { rng = Number(b.dataset.r); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(lcd, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'multimetro', num: 2, short: 'Multimetro', title: 'Il multimetro: portate ed errori',
    intro: 'Ogni misura ha un errore. Il manuale del tester dice quanto è grande, ma dipende anche da te: dalla portata che scegli.',
    goals: ['Portata e fuori scala', 'Risoluzione (1 digit)', 'Errore ± (% + digit)', 'Classe degli strumenti analogici'],
    widgets: [widgetDMM],
    example: m2[2], exampleTitle: 'Esempio: l\'errore di una misura',
    families: m2,
    theory: `
      <article class="note"><h4>Digitale</h4><p>Un "3 ½ cifre" ha 2000 punti: risoluzione = portata / 2000. Errore: ± (<var>p</var> % della lettura + <var>n</var> digit). Si sceglie la portata più piccola che contiene la misura.</p></article>
      <article class="note"><h4>Analogico</h4><p>Errore assoluto = classe % del fondo scala, uguale su tutta la scala. L'errore relativo è più piccolo verso il fondo scala: si legge nella seconda metà.</p></article>
      <article class="note"><h4>Come si scrive</h4><p>Misura ± errore, con l'errore a una o due cifre significative e la misura arrotondata alla stessa cifra: 4,50 V ± 0,04 V.</p></article>`,
  });

  // =====================================================================
  // 3 — Effetto di carico
  // =====================================================================
  const c3 = [];
  c3.push({
    id: 'car-meas', title: 'Il voltmetro carica il circuito', level: 2,
    defaults: { E: 10, R: 1e6, Rv: 10e6 },
    gen: () => ({ E: pick([10, 12, 20]), R: pick([1e3, 10e3, 100e3, 470e3, 1e6]), Rv: pick([10e6, 1e6, 200e3]) }),
    solve: (p) => BS.loadedDivider(p.E, p.R, p.R, p.Rv),
    text: (p) => `Un partitore con due resistori uguali da ${U(p.R, 'Ω')} è alimentato a ${U(p.E, 'V')}. Misuri la tensione sul resistore in basso con un voltmetro da ${U(p.Rv, 'Ω')}. Quanto dovrebbe valere? Quanto legge?`,
    fig: (p, r, sol) => S.measure({ E: p.E, R1: p.R, R2: p.R }, { V: 'parallelo', rV: sol ? SI(r.meas, 'V') : '?' }),
    asks: (p, r) => [h.qV('Senza strumento', r.ideal), h.qV('Letta', r.meas), { label: 'Errore', unit: '%', value: r.err * 100 }],
    steps: (p, r) => step(`Senza voltmetro: ${V_} = ${frac('<var>E</var>', '2')} = ${U(r.ideal, 'V')}`) +
      step(`${R_} ∥ ${Rv} = ${SI(par(p.R, p.Rv), 'Ω', 4)}`, 'Il voltmetro si mette in parallelo al resistore e ne abbassa la resistenza.') +
      step(`${V_} letta = ${frac('<var>E</var> · ' + SI(par(p.R, p.Rv), 'Ω', 4), N(p.R / 1000) + ' kΩ + ' + SI(par(p.R, p.Rv), 'Ω', 4))} = ${res(U(r.meas, 'V'))}; errore ${res(N(r.err * 100, 3) + ' %')}`, Math.abs(r.err) > 0.01 ? 'Errore grande: la resistenza del voltmetro non è molto più grande di quella del circuito.' : 'Errore trascurabile: il voltmetro ha una resistenza molto maggiore.'),
  });
  c3.push({
    id: 'car-scelta', title: 'Quale strumento?', level: 1,
    gen: () => ({ R: pick([1e3, 4.7e3, 1e6, 4.7e6]), o: App.shuffle([0, 1, 2]) }),
    solve: (p) => {
      const opts0 = [['tester digitale (10 MΩ)', 10e6], ['oscilloscopio (1 MΩ)', 1e6], ['tester analogico 20 kΩ/V su 10 V (200 kΩ)', 200e3]];
      const errs = opts0.map((x) => BS.loadedDivider(10, p.R, p.R, x[1]).err);
      return { opts: p.o.map((i) => opts0[i][0]), ans: p.o.indexOf(0), errs, opts0 };
    },
    text: (p) => `Devi misurare la tensione a metà di un partitore fatto da due resistori da ${U(p.R, 'Ω')}. Quale strumento disturba di meno il circuito?`,
    asks: (p, r) => [h.choice('Strumento', r.opts, r.ans)],
    steps: (p, r) => step(r.opts0.map((x, i) => `${x[0]}: errore ${N(r.errs[i] * 100, 2)} %`).join('<br>'), 'L\'errore dipende dal rapporto tra la resistenza dello strumento e quella del circuito.') +
      step(res(r.opts0[0][0]), p.R <= 4.7e3 ? 'Qui in realtà vanno bene tutti: con resistenze piccole l\'effetto di carico è trascurabile.' : 'Con resistenze grandi solo un voltmetro ad alta impedenza dà una misura credibile.'),
  });
  c3.push({
    id: 'car-min', title: 'Quanto deve essere grande RV?', level: 3,
    gen: () => ({ R: pick([10e3, 47e3, 100e3, 1e6]), e: pick([1, 2, 5]) }),
    solve: (p) => { const eps = p.e / 100; return { Rv: (p.R * (1 - eps)) / (2 * eps) }; },
    text: (p) => `Partitore con due resistori uguali da ${U(p.R, 'Ω')}. Quanto deve valere almeno la resistenza del voltmetro perché l'errore di carico sia al massimo del ${p.e} %?`,
    asks: (p, r) => [{ label: Rv + ' minima', unit: 'kΩ', value: r.Rv / 1000 }],
    hint: () => 'Imponi che la tensione letta sia (1 − ε) volte quella vera e ricava RV.',
    steps: (p, r) => step(`Lettura / vero = ${frac('2 ' + R_ + '<sub>p</sub>', R_ + ' + ' + R_ + '<sub>p</sub>')} = 1 − ε, con ${R_}<sub>p</sub> = ${R_} ∥ ${Rv}`) +
      step(`→ ${R_}<sub>p</sub> = ${R_} · ${frac('1 − ε', '1 + ε')} → ${Rv} = ${frac(R_ + ' (1 − ε)', '2ε')} = ${res(SI(r.Rv, 'Ω'))}`, `Regola pratica: per un errore dell'1 % lo strumento deve avere una resistenza circa 100 volte quella "vista" dai suoi puntali (qui ${R_}/2).`),
  });
  c3.push({
    id: 'car-mc', title: 'Concetti sull\'effetto di carico', level: 1,
    ...mc([
      ['L\'effetto di carico di un voltmetro fa sì che la tensione letta sia…', ['più bassa di quella vera', 'più alta di quella vera', 'sempre esatta', 'negativa'], 'Il voltmetro in parallelo abbassa la resistenza del tratto che misura.'],
      ['Con un tester digitale da 10 MΩ l\'effetto di carico è trascurabile quando…', ['le resistenze del circuito sono molto più piccole di 10 MΩ', 'le resistenze del circuito sono di qualche MΩ', 'la tensione è alta', 'la corrente è grande'], 'Conta il rapporto tra le resistenze.'],
      ['Un tester analogico da 20 kΩ/V sulla portata 10 V ha resistenza…', ['200 kΩ', '20 kΩ', '2 MΩ', '10 MΩ'], 'Si moltiplica per il fondo scala: 20 000 · 10.'],
    ]),
  });

  function widgetLoad(host) {
    const c = K.widgetCard('Effetto di carico', 'Partitore da 10 V con due resistori uguali: quanto disturba il voltmetro?');
    const INST = [['ideale', Infinity], ['tester digitale 10 MΩ', 10e6], ['oscilloscopio 1 MΩ', 1e6], ['analogico 20 kΩ/V, portata 10 V', 200e3]];
    let k = 1;
    const seg = el('div', 'seg');
    seg.innerHTML = INST.map((x, i) => `<button type="button" data-i="${i}">${x[0]}</button>`).join('');
    const sch = el('div', 'ex-fig');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const d = BS.loadedDivider(10, v.R, v.R, INST[k][1]);
      sch.innerHTML = S.measure({ E: 10, R1: v.R, R2: v.R }, { V: 'parallelo', rV: SI(d.meas, 'V') }).svg;
      out.innerHTML = `<div class="form-row"><span class="label">Lettura</span><div class="f">${res(SI(d.meas, 'V'))} invece di ${SI(d.ideal, 'V')}</div><span class="meta" style="color:var(--${Math.abs(d.err) > 0.05 ? 'bad' : Math.abs(d.err) > 0.01 ? 'warn' : 'ok'})">Errore ${N(d.err * 100, 3)} %. ${Math.abs(d.err) > 0.05 ? 'Misura inutilizzabile: lo strumento cambia il circuito che sta misurando.' : Math.abs(d.err) > 0.01 ? 'Errore sensibile.' : 'Errore trascurabile.'}</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === k)));
    };
    const sl = K.sliders(c, [{ id: 'R', label: 'Resistori del partitore <var>R</var> (Ω)', min: 100, max: 10e6, log: true, value: 100e3 }], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { k = Number(b.dataset.i); draw(last); } });
    c.querySelector('.card-head').after(seg);
    c.append(sch, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'carico', num: 3, short: 'Effetto di carico', title: 'L\'effetto di carico',
    intro: 'Collegare uno strumento cambia il circuito. Quasi sempre di poco, ma con resistenze grandi il voltmetro può falsare la misura di parecchio.',
    goals: ['Voltmetro in parallelo e partitore', 'Errore di inserzione', 'Scelta dello strumento', 'Resistenza minima del voltmetro'],
    widgets: [widgetLoad],
    example: c3[0], exampleTitle: 'Esempio: il voltmetro sul partitore',
    families: c3,
    theory: `
      <article class="note"><h4>Perché succede</h4><p>Il voltmetro ha una resistenza ${Rv} che si mette in parallelo al tratto misurato. Se ${Rv} non è molto più grande delle resistenze del circuito, la tensione cala.</p></article>
      <article class="note"><h4>Regola pratica</h4><p>Per errori sotto l'1 % ${Rv} deve essere almeno circa 100 volte la resistenza vista dai puntali. Tester digitali: 10 MΩ; oscilloscopi: 1 MΩ (10 MΩ con la sonda ×10); analogici: (Ω/V) × portata.</p></article>`,
  });

  // =====================================================================
  // 4 — Sicurezza elettrica
  // =====================================================================
  const s4 = [];
  const ZONES = ['non avvertita', 'percepita, senza effetti pericolosi', 'tetanizzazione: non si riesce a lasciare la presa', 'pericolo di fibrillazione ventricolare'];
  s4.push({
    id: 'sic-Ib', title: 'Quanta corrente nel corpo?', level: 1,
    defaults: { V: 230, Rb: 1000, Rf: 1000 },
    gen: () => ({ V: pick([24, 50, 120, 230]), Rb: pick([1000, 1500, 2000]), Rf: pick([200, 1000, 3000, 50000]) }),
    solve: (p) => { const I = p.V / (p.Rb + p.Rf); return { I, z: BS.bodyEffect(I).zone - 1 }; },
    text: (p) => `Una persona tocca un conduttore a ${p.V} V verso terra. Il corpo ha ${U(p.Rb, 'Ω')} di resistenza, scarpe e pavimento ${U(p.Rf, 'Ω')}. Quanta corrente la attraversa? Che effetto ha?`,
    asks: (p, r) => [{ label: I_, unit: 'mA', value: r.I * 1000 }, h.choice('Effetto', ZONES, r.z)],
    steps: (p, r) => step(`${I_} = ${frac(V_, R_ + '<sub>corpo</sub> + ' + R_ + '<sub>pavimento</sub>')} = ${frac(p.V, N(p.Rb + p.Rf))} = ${res(SI(r.I, 'A'))}`, 'È la solita legge di Ohm: la tensione spinge la corrente attraverso il corpo e quello che c\'è tra i piedi e la terra.') +
      step(res(ZONES[r.z]), 'Soglie indicative: 0,5 mA percezione, 10 mA non si riesce a lasciare, 30 mA sensibilità del salvavita, oltre circa 50 mA pericolo per il cuore (dipende anche dal tempo).'),
  });
  s4.push({
    id: 'sic-RE', title: 'La terra dell\'impianto', level: 2,
    gen: () => ({ Idn: pick([0.03, 0.1, 0.3, 0.5]) }),
    solve: (p) => ({ RE: BS.maxRE(p.Idn) }),
    text: (p) => `In un impianto domestico (sistema TT) con interruttore differenziale da ${SI(p.Idn, 'A')}, quanto può valere al massimo la resistenza di terra perché la tensione sulle masse non superi 50 V prima che il differenziale intervenga?`,
    asks: (p, r) => [{ label: '<var>R</var><sub>E</sub> massima', unit: 'Ω', value: r.RE }],
    steps: (p, r) => step(`<var>R</var><sub>E</sub> · <var>I</var><sub>Δn</sub> ≤ 50 V → <var>R</var><sub>E</sub> ≤ ${frac('50', N(p.Idn))} = ${res(U(r.RE, 'Ω'))}`, 'Quando l\'isolamento si guasta poco a poco, la corrente verso terra cresce: appena arriva a IΔn il differenziale stacca. In quel momento la carcassa è a RE · IΔn, che deve restare sotto 50 V.'),
  });
  s4.push({
    id: 'sic-rcd', title: 'Quando stacca il differenziale?', level: 2,
    gen: () => ({ I: pick([0.01, 0.02, 0.035, 0.05, 0.08, 0.1, 0.2, 1]) }),
    solve: (p) => { const t = BS.rcdTime(p.I); return { t, k: t == null ? 0 : [0.3, 0.15, 0.04].indexOf(t) + 1 }; },
    text: (p) => `Un differenziale da 30 mA (tipo generale) vede una corrente di dispersione di ${SI(p.I, 'A')}. Entro quanto tempo, al massimo, deve intervenire?`,
    asks: (p, r) => [h.choice('Intervento', ['non è tenuto a intervenire', 'entro 0,3 s', 'entro 0,15 s', 'entro 0,04 s'], r.k)],
    steps: (p, r) => step(res(r.t == null ? 'Sotto 30 mA non è tenuto a intervenire' : 'Entro ' + N(r.t) + ' s'), 'Norma: a IΔn entro 0,3 s, a 2 IΔn entro 0,15 s, a 5 IΔn entro 0,04 s. Più la dispersione è forte, più deve essere veloce.'),
  });
  s4.push({
    id: 'sic-terra', title: 'La terra da sola basta?', level: 3,
    gen: () => ({ RE: pick([5, 10, 20, 50, 100]), RN: pick([1, 2, 5, 10]) }),
    solve: (p) => { const Ig = 230 / (p.RE + p.RN); return { Ig, Vc: Ig * p.RE }; },
    text: (p) => `Una lavatrice ha un guasto: la fase tocca la carcassa, che è collegata a terra con <var>R</var><sub>E</sub> = ${p.RE} Ω. La terra della cabina vale <var>R</var><sub>N</sub> = ${p.RN} Ω. Rete a 230 V, nessun differenziale, magnetotermico da 16 A. Quanta corrente va a terra? A che tensione si porta la carcassa?`,
    asks: (p, r) => [{ label: '<var>I</var><sub>g</sub>', unit: 'A', value: r.Ig }, h.qV('<var>V</var><sub>carcassa</sub>', r.Vc)],
    hint: () => 'La corrente di guasto passa attraverso RE e RN in serie (la persona, con la sua resistenza grande, si può trascurare).',
    steps: (p, r) => step(`<var>I</var><sub>g</sub> = ${frac('230', p.RE + ' + ' + p.RN)} = ${res(U(r.Ig, 'A'))}`, r.Ig < 16 ? 'Meno di 16 A: il magnetotermico non scatta e il guasto resta.' : 'Il magnetotermico prima o poi scatta, ma non abbastanza in fretta.') +
      step(`<var>V</var><sub>carcassa</sub> = <var>R</var><sub>E</sub> · <var>I</var><sub>g</sub> = ${res(U(r.Vc, 'V'))}`, 'Ben oltre 50 V: senza differenziale chi tocca la lavatrice prende la scossa anche se la terra c\'è. Terra e differenziale lavorano insieme: la terra fa passare la corrente di guasto, il differenziale la vede e stacca.'),
  });
  s4.push({
    id: 'sic-mc', title: 'Regole di sicurezza', level: 1,
    ...mc([
      ['L\'interruttore differenziale ("salvavita") interviene quando…', ['la corrente che va non è uguale a quella che torna, perché una parte disperde verso terra', 'la corrente supera 16 A', 'la tensione supera 230 V', 'c\'è un temporale'], 'Confronta fase e neutro: la differenza è la corrente dispersa, magari attraverso una persona.'],
      ['Il magnetotermico protegge soprattutto…', ['i cavi, da sovraccarichi e cortocircuiti', 'le persone dalla folgorazione', 'gli elettrodomestici dall\'umidità', 'la lampada dall\'accensione'], 'Interviene con correnti di parecchi ampere: troppi per proteggere una persona.'],
      ['Prima di lavorare su un impianto bisogna…', ['togliere tensione, impedire che venga ridata e verificare l\'assenza di tensione', 'mettere i guanti e lavorare sotto tensione', 'spegnere solo la luce', 'avvisare il vicino'], 'Sezionare, bloccare, verificare: sempre.'],
      ['Con le mani bagnate la resistenza del corpo…', ['diminuisce e la corrente aumenta', 'aumenta', 'resta uguale', 'diventa infinita'], 'L\'acqua abbassa la resistenza della pelle.'],
      ['50 V in alternata sono considerati…', ['il limite della tensione di contatto sopportabile a lungo in ambienti normali', 'una tensione sempre mortale', 'la tensione della rete domestica', 'la tensione di una pila'], 'Per questo nei giocattoli e nei luoghi bagnati si usano tensioni basse (12–24 V).'],
    ]),
  });

  function widgetSafety(host) {
    const c = K.widgetCard('Un guasto in casa', 'La fase tocca la carcassa metallica di un elettrodomestico e qualcuno la tocca. Che cosa lo protegge?');
    let earth = true;
    let rcd = true;
    let fl = 1;
    const FLOORS = [['scarpe di gomma, pavimento asciutto', 100e3], ['scarpe normali', 2000], ['piedi nudi bagnati', 200]];
    const ctl = el('div', 'msi-ctl');
    const mk = (txt, on, fn) => { const t = el('label', 'switch'); t.innerHTML = `<input type="checkbox"${on ? ' checked' : ''}><span class="track"></span><span>${txt}</span>`; t.querySelector('input').addEventListener('change', (e) => fn(e.target.checked)); return t; };
    const seg = el('div', 'seg');
    seg.innerHTML = FLOORS.map((x, i) => `<button type="button" data-i="${i}">${x[0]}</button>`).join('');
    const sch = el('div', 'ex-fig');
    const out = el('div', 'forms');
    let last;
    const draw = (v) => {
      last = v;
      const f = BS.fault({ V: 230, earth, RE: v.RE, RN: 10, Rbody: 1000, Rfloor: FLOORS[fl][1], rcd, Idn: 0.03 });
      const danger = f.effect.zone >= 3 && f.t == null;
      sch.innerHTML = S.fault({ V: 230, RE: v.RE, RN: 10, Rbody: 1000, Rfloor: FLOORS[fl][1] }, { earth, rcd, trip: f.t != null, Ib: f.Ib, Ig: f.Ig, danger: f.effect.zone >= 3 }).svg;
      const verdict = f.t != null
        ? `Il differenziale vede ${SI(f.Ig, 'A')} di dispersione e stacca entro ${N(f.t)} s.${earth ? ' Grazie alla terra la corrente di guasto passa nel conduttore di protezione e il differenziale interviene appena c\'è il guasto, anche prima che qualcuno tocchi.' : ' Senza terra però interviene solo quando la corrente passa già attraverso la persona: la scossa la prendi, anche se breve.'}`
        : danger ? `Pericolo: nessuno interrompe la corrente.${earth ? ' La terra da sola non basta: la carcassa resta a ' + SI(f.Vc, 'V') + ' e la corrente di guasto (' + SI(f.Ig, 'A') + ') non fa scattare il magnetotermico da 16 A.' : ''}`
          : rcd ? 'La corrente nel corpo è sotto i 30 mA: il differenziale non è tenuto a scattare, ma la corrente resta sotto la soglia di pericolo.' : 'La resistenza verso terra è così grande che la corrente resta piccola. Ma basta togliersi le scarpe o bagnarsi…';
      out.innerHTML = `<div class="form-row"><span class="label">Nel corpo</span><div class="f">${I_}<sub>b</sub> = ${res(SI(f.Ib, 'A'))}${f.t != null ? ' per al massimo ' + N(f.t) + ' s' : ''}: ${f.t != null && f.effect.zone >= 3 && f.Ib < 0.5 ? 'una scossa brevissima, interrotta prima che diventi pericolosa' : f.effect.name}</div><span class="meta" style="color:var(--${f.t != null || f.effect.zone <= 2 ? 'ok' : 'bad'})">${verdict}</span></div>
        <div class="form-row"><span class="label">Carcassa</span><div class="f"><var>V</var> verso terra = ${SI(f.Vc, 'V')}</div><span class="meta">Regola dell'impianto TT: <var>R</var><sub>E</sub> · 30 mA ≤ 50 V, cioè <var>R</var><sub>E</sub> ≤ 1667 Ω.</span></div>`;
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.i) === fl)));
    };
    ctl.append(mk('Carcassa collegata a terra', earth, (x) => { earth = x; draw(last); }), mk('Differenziale da 30 mA', rcd, (x) => { rcd = x; draw(last); }));
    const sl = K.sliders(c, [{ id: 'RE', label: 'Resistenza di terra <var>R</var><sub>E</sub> (Ω)', min: 1, max: 2000, log: true, value: 20 }], draw);
    seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { fl = Number(b.dataset.i); draw(last); } });
    c.querySelector('.card-head').after(ctl, seg);
    c.append(sch, out);
    host.appendChild(c);
    draw(sl.values);
  }

  lessons.push({
    id: 'sicurezza', num: 4, short: 'Sicurezza', title: 'Sicurezza elettrica',
    intro: 'A far male è la corrente che attraversa il corpo, e la legge di Ohm dice quanta ne passa. Messa a terra e interruttore differenziale lavorano insieme perché quella corrente non arrivi mai a livelli pericolosi.',
    goals: ['Effetti della corrente sul corpo', 'Tensione di contatto e 50 V', 'Messa a terra', 'Interruttore differenziale'],
    widgets: [widgetSafety],
    example: s4[0], exampleTitle: 'Esempio: la corrente nel corpo',
    families: s4,
    theory: `
      <article class="note"><h4>Effetti della corrente (alternata a 50 Hz)</h4>
        <p>Circa 0,5 mA: si sente. Circa 10 mA: i muscoli si contraggono e non si riesce a lasciare. 30 mA: soglia dei differenziali per le persone. Oltre circa 50 mA, se dura, rischio di fibrillazione del cuore. Contano intensità, durata e percorso.</p></article>
      <article class="note"><h4>Protezioni</h4>
        <p><strong>Messa a terra</strong>: collega le masse metalliche al terreno, così in caso di guasto la corrente ha una strada. <strong>Differenziale</strong>: confronta la corrente che va e quella che torna; se una parte si disperde (IΔn = 30 mA) stacca in decimi di secondo. <strong>Magnetotermico</strong>: protegge i cavi da sovraccarichi e cortocircuiti, non le persone.</p></article>
      <article class="note"><h4>Regole d'oro</h4><p>Mai lavorare sotto tensione. Togli tensione, impedisci che qualcuno la ridia, verifica con lo strumento che non ci sia. A scuola, in laboratorio, solo bassissime tensioni o banchi protetti, sempre con l'insegnante.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'msr', year: '2', yearLabel: '2ª', title: 'Misure elettriche e sicurezza', route: 'msr-strumenti', lessonWord: 'Lezione',
    desc: 'Amperometro e voltmetro, multimetro con portate ed errori, effetto di carico, effetti della corrente sul corpo, messa a terra e differenziale.',
    lessons,
  });
})();
