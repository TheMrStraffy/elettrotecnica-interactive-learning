/* Scheda 7 — Sfide: domande generate a caso su tutti gli argomenti */
(function () {
  'use strict';
  const App = window.App;
  const L = window.Logic;
  const $ = (id) => document.getElementById(id);
  const si = App.si;
  const num = App.num;
  const pick = App.pick;
  const rand = App.rand;
  const bin = (v, n) => v.toString(2).padStart(n, '0');
  const v = (x) => '<var>' + x + '</var>';
  const ov = (x) => '<span class="ov">' + x + '</span>';

  // ---------- Domande numeriche di elettrotecnica ----------
  const ELE = [
    () => {
      const V = pick([5, 9, 12, 24]);
      const R = App.randE12(100, 4700);
      const I = V / R;
      return { tag: 'Legge di Ohm', q: `Un resistore da ${si(R, 'Ω')} è collegato a ${V} V. Quanta corrente lo attraversa?`, type: 'num', unit: 'mA', ans: I * 1000,
        explain: `${v('I')} = ${v('V')} / ${v('R')} = ${V} V / ${si(R, 'Ω')} = ${si(I, 'A')}.` };
    },
    () => {
      const I = pick([2, 5, 10, 20, 25, 40]) / 1000;
      const R = App.randE12(100, 2200);
      return { tag: 'Legge di Ohm', q: `In un resistore da ${si(R, 'Ω')} scorrono ${si(I, 'A')}. Qual è la tensione ai suoi capi?`, type: 'num', unit: 'V', ans: R * I,
        explain: `${v('V')} = ${v('R')} · ${v('I')} = ${si(R, 'Ω')} · ${si(I, 'A')} = ${si(R * I, 'V')}. Attenzione a convertire i mA in A.` };
    },
    () => {
      const V = pick([3, 5, 6, 9, 12]);
      const I = pick([10, 15, 20, 30, 50]) / 1000;
      return { tag: 'Legge di Ohm', q: `Ai capi di un componente ohmico ci sono ${V} V e passano ${si(I, 'A')}. Quanto vale la sua resistenza?`, type: 'num', unit: 'Ω', ans: V / I,
        explain: `${v('R')} = ${v('V')} / ${v('I')} = ${V} V / ${num(I, 3)} A = ${si(V / I, 'Ω')}.` };
    },
    () => {
      const R = App.randE12(10, 470);
      const I = pick([0.05, 0.1, 0.2, 0.25, 0.5]);
      return { tag: 'Potenza', q: `Una corrente di ${si(I, 'A')} attraversa un resistore da ${si(R, 'Ω')}. Quanta potenza dissipa?`, type: 'num', unit: 'W', ans: R * I * I,
        explain: `${v('P')} = ${v('R')} · ${v('I')}² = ${si(R, 'Ω')} · (${num(I, 3)} A)² = ${si(R * I * I, 'W')}. Raddoppiando la corrente la potenza quadruplica.` };
    },
    () => {
      const V = pick([12, 24, 230]);
      const P = V === 230 ? pick([60, 100, 1000, 2000]) : pick([6, 12, 24, 36]);
      return { tag: 'Potenza', q: `Un utilizzatore da ${P} W funziona a ${V} V. Quanta corrente assorbe?`, type: 'num', unit: 'A', ans: P / V,
        explain: `${v('P')} = ${v('V')} · ${v('I')} → ${v('I')} = ${v('P')} / ${v('V')} = ${P} / ${V} = ${si(P / V, 'A')}.` };
    },
    () => {
      const E = pick([9, 12, 24]);
      const r = pick([0.5, 1, 2]);
      const R = pick([10, 22, 47, 100]);
      const I = E / (R + r);
      return { tag: 'Generatore reale', q: `Un generatore con ${v('E')} = ${E} V e ${v('r')} = ${num(r)} Ω alimenta un carico da ${R} Ω. Qual è la tensione ai morsetti?`, type: 'num', unit: 'V', ans: R * I,
        explain: `${v('I')} = ${v('E')}/(${v('R')} + ${v('r')}) = ${E}/${num(R + r)} = ${si(I, 'A')}; ${v('V')} = ${v('E')} − ${v('r')}·${v('I')} = ${si(R * I, 'V')}.` };
    },
    () => {
      const Rs = [App.randE12(10, 1000), App.randE12(10, 1000), App.randE12(10, 1000)];
      const S = Rs.reduce((a, b) => a + b, 0);
      return { tag: 'Serie', q: `Tre resistori in serie: ${Rs.map((x) => si(x, 'Ω')).join(', ')}. Resistenza equivalente?`, type: 'num', unit: 'Ω', ans: S,
        explain: `In serie si sommano: ${Rs.map((x) => num(x)).join(' + ')} = ${num(S, 4)} Ω.` };
    },
    () => {
      const a = App.randE12(22, 1000);
      const b = App.randE12(22, 1000);
      const p = (a * b) / (a + b);
      return { tag: 'Parallelo', q: `Due resistori in parallelo: ${si(a, 'Ω')} e ${si(b, 'Ω')}. Resistenza equivalente?`, type: 'num', unit: 'Ω', ans: p,
        explain: `Prodotto diviso somma: (${num(a)} · ${num(b)}) / (${num(a)} + ${num(b)}) = ${num(p, 4)} Ω. È più piccola della minore.` };
    },
    () => {
      const L2 = pick([10, 20, 50, 100]);
      const S = pick([0.5, 1, 1.5, 2.5]);
      const R = (0.0175 * L2) / S;
      return { tag: '2ª legge di Ohm', q: `Un filo di rame (ρ = 0,0175 Ω·mm²/m) è lungo ${L2} m e ha sezione ${num(S)} mm². Quanto vale la sua resistenza?`, type: 'num', unit: 'Ω', ans: R,
        explain: `${v('R')} = ρ·${v('L')}/${v('S')} = 0,0175 · ${L2} / ${num(S)} = ${num(R, 3)} Ω.` };
    },
    () => {
      const P = pick([100, 500, 1000, 2000]);
      const h = pick([2, 3, 5, 8]);
      return { tag: 'Energia', q: `Un apparecchio da ${P} W resta acceso ${h} ore. Quanta energia consuma?`, type: 'num', unit: 'kWh', ans: (P * h) / 1000,
        explain: `${v('W')} = ${v('P')} · ${v('t')} = ${P} W · ${h} h = ${P * h} Wh = ${num((P * h) / 1000)} kWh.` };
    },
    () => {
      const Q = pick([2, 3, 6, 12]);
      const t = pick([4, 5, 10, 20]);
      return { tag: 'Corrente', q: `In ${t} s attraverso la sezione di un filo passano ${Q} C di carica. Qual è l'intensità di corrente?`, type: 'num', unit: 'A', ans: Q / t,
        explain: `${v('I')} = ${v('Q')} / ${v('t')} = ${Q} C / ${t} s = ${num(Q / t)} A.` };
    },
    () => {
      const cases = [
        [pick([0.047, 0.15, 0.22, 0.0033]), 'A', 'mA', 1000],
        [pick([2.2, 4.7, 0.33, 10]), 'kΩ', 'Ω', 1000],
        [pick([350, 1200, 47, 5]), 'mV', 'V', 0.001],
        [pick([1500, 250, 33]), 'µA', 'mA', 0.001],
      ];
      const [x, from, to, f] = pick(cases);
      return { tag: 'Unità di misura', q: `Converti ${num(x, 4)} ${from} in ${to}.`, type: 'num', unit: to, ans: x * f,
        explain: `${num(x, 4)} ${from} = ${num(x * f, 4)} ${to}. Ricorda: k = 10³, m = 10⁻³, µ = 10⁻⁶.` };
    },
  ];

  // ---------- Domande concettuali di elettrotecnica ----------
  const ELE_MC = [
    ['La forza elettromotrice si misura in…', ['volt', 'newton', 'ampere', 'watt'], 'Nonostante il nome non è una forza: è un lavoro per unità di carica (J/C), quindi volt.'],
    ['Come si inserisce un amperometro in un circuito?', ['In serie al componente', 'In parallelo al componente', 'Tra i poli del generatore', 'Indifferente'], 'Deve essere attraversato dalla stessa corrente, quindi va in serie. Ha resistenza interna quasi nulla.'],
    ['Come si inserisce un voltmetro?', ['In parallelo ai due punti da misurare', 'In serie al carico', 'Al posto del carico', 'Indifferente'], 'Misura una differenza di potenziale tra due punti: si collega a quei due punti, in parallelo. Ha resistenza interna altissima.'],
    ['A tensione costante raddoppi la resistenza. La corrente…', ['si dimezza', 'raddoppia', 'resta uguale', 'quadruplica'], `${v('I')} = ${v('V')}/${v('R')}: con ${v('R')} doppia la corrente è metà.`],
    ['Un generatore reale a vuoto (interruttore aperto): la tensione ai morsetti è…', ['uguale alla f.e.m.', 'zero', 'minore della f.e.m.', 'maggiore della f.e.m.'], `Con ${v('I')} = 0 la caduta interna ${v('r')}·${v('I')} è nulla: ${v('V')} = ${v('E')}.`],
    ['Due resistori uguali di valore R in parallelo equivalgono a…', ['R/2', '2R', 'R', 'R²'], 'Con n resistori uguali in parallelo: R/n.'],
    ['In un collegamento in serie è uguale per tutti i resistori…', ['la corrente', 'la tensione', 'la potenza', 'niente'], 'C\'è un solo percorso: la stessa corrente attraversa tutti.'],
    ['In un collegamento in parallelo è uguale per tutti i rami…', ['la tensione', 'la corrente', 'la potenza', 'niente'], 'Tutti i rami sono collegati agli stessi due nodi, quindi hanno la stessa ddp.'],
    ['Il 1° principio di Kirchhoff (ai nodi) esprime la conservazione…', ['della carica', 'dell\'energia', 'della potenza', 'della massa'], 'Le cariche non si accumulano nei nodi: quanta corrente entra, tanta ne esce.'],
    ['Il 2° principio di Kirchhoff (alle maglie) esprime la conservazione…', ['dell\'energia', 'della carica', 'della corrente', 'della resistenza'], 'Percorrendo una maglia e tornando al punto di partenza la somma delle tensioni è zero.'],
    ['Raddoppi la sezione di un filo. La sua resistenza…', ['si dimezza', 'raddoppia', 'resta uguale', 'quadruplica'], `${v('R')} = ρ${v('L')}/${v('S')}: la sezione sta al denominatore.`],
    ['Un metallo si scalda. La sua resistenza…', ['aumenta', 'diminuisce', 'resta uguale', 'si annulla'], 'Nei metalli il coefficiente di temperatura α è positivo.'],
    ['Il verso convenzionale della corrente nel circuito esterno va…', ['dal polo + al polo −', 'dal polo − al polo +', 'nel verso degli elettroni', 'dipende dal carico'], 'È il verso in cui si muoverebbero cariche positive. Gli elettroni vanno al contrario.'],
    ['1 kWh equivale a…', ['3,6 MJ', '1000 J', '3600 J', '1 MJ'], '1000 W · 3600 s = 3 600 000 J.'],
    ['Un resistore marrone, nero, rosso, oro vale…', ['1 kΩ ± 5%', '102 Ω ± 5%', '10 Ω ± 2%', '100 Ω ± 5%'], 'Marrone 1, nero 0, rosso × 100: 10 × 100 = 1000 Ω. Oro: ± 5%.'],
    ['Il carico riceve la massima potenza quando…', ['R = r (resistenza interna)', 'R è la più grande possibile', 'R = 0', 'R = 2r'], 'Teorema del massimo trasferimento di potenza. In quel punto però il rendimento è solo del 50%.'],
    ['Raddoppi la corrente in un resistore. La potenza dissipata…', ['quadruplica', 'raddoppia', 'si dimezza', 'resta uguale'], `${v('P')} = ${v('R')}·${v('I')}²: 2² = 4.`],
    ['In cortocircuito (R = 0) la corrente è limitata solo da…', ['la resistenza interna del generatore', 'il voltmetro', 'niente, è sempre infinita', 'la potenza del carico'], `${v('I')}<sub>cc</sub> = ${v('E')}/${v('r')}.`],
  ];

  // ---------- Domande di elettronica digitale ----------
  const DIG = [
    () => {
      const x = rand(5, 255);
      return { tag: 'Binario', q: `Converti ${x}<sub>10</sub> in binario.`, type: 'bin', ans: x,
        explain: `Divisioni successive per 2, resti letti dal basso: ${x} = ${bin(x, 8)}<sub>2</sub>.` };
    },
    () => {
      const x = rand(5, 255);
      return { tag: 'Binario', q: `Quanto vale in decimale <span class="mono">${bin(x, 8)}</span><sub>2</sub>?`, type: 'int', ans: x,
        explain: `Somma dei pesi dei bit a 1: ${[...bin(x, 8)].map((b, i) => (b === '1' ? 1 << (7 - i) : 0)).filter(Boolean).join(' + ')} = ${x}.` };
    },
    () => {
      const x = rand(16, 255);
      return { tag: 'Esadecimale', q: `Converti <span class="mono">${bin(x, 8).slice(0, 4)} ${bin(x, 8).slice(4)}</span><sub>2</sub> in esadecimale.`, type: 'hex', ans: x,
        explain: `Ogni gruppo di 4 bit è una cifra hex: ${bin(x, 8).slice(0, 4)} = ${(x >> 4).toString(16).toUpperCase()}, ${bin(x, 8).slice(4)} = ${(x & 15).toString(16).toUpperCase()} → ${x.toString(16).toUpperCase()}<sub>16</sub>.` };
    },
    () => {
      const x = rand(16, 255);
      return { tag: 'Esadecimale', q: `Quanto vale in decimale ${x.toString(16).toUpperCase()}<sub>16</sub>?`, type: 'int', ans: x,
        explain: `${(x >> 4).toString(16).toUpperCase()} · 16 + ${(x & 15).toString(16).toUpperCase()} = ${x >> 4} · 16 + ${x & 15} = ${x}.` };
    },
    () => {
      const x = rand(1, 100);
      const c2 = (256 - x) & 255;
      return { tag: 'Complemento a 2', q: `Scrivi −${x} in complemento a 2 su 8 bit.`, type: 'bin8', ans: c2,
        explain: `+${x} = ${bin(x, 8)} → inverti i bit: ${bin(~x & 255, 8)} → aggiungi 1: ${bin(c2, 8)}.` };
    },
    () => {
      const a = rand(3, 15);
      const b = rand(3, 15);
      return { tag: 'Somma binaria', q: `Calcola <span class="mono">${bin(a, 4)}</span> + <span class="mono">${bin(b, 4)}</span> (risultato in binario).`, type: 'bin', ans: a + b,
        explain: `${a} + ${b} = ${a + b} = ${(a + b).toString(2)}<sub>2</sub>. Regole: 1 + 1 = 10 (scrivo 0, riporto 1), 1 + 1 + 1 = 11.` };
    },
    () => {
      const g = pick(['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR']);
      const A = rand(0, 1);
      const B = rand(0, 1);
      const y = App.Gates.evalGate(g, [!!A, !!B]) ? 1 : 0;
      return { tag: 'Porte logiche', q: `Porta <strong>${g}</strong> con ${v('A')} = ${A} e ${v('B')} = ${B}. Quanto vale l'uscita?`, type: 'mc', choices: ['0', '1'], ansIndex: y,
        explain: `${App.Gates.DESC[g][0]}. ${App.Gates.DESC[g][1].replace(/<strong>|<\/strong>/g, '')}` };
    },
    () => {
      const n = 3;
      const exprs = [["A'B + C", `${ov(v('A'))}${v('B')} + ${v('C')}`], ["AB' + A'C", `${v('A')}${ov(v('B'))} + ${ov(v('A'))}${v('C')}`], ["(A + B)C'", `(${v('A')} + ${v('B')})${ov(v('C'))}`], ["A'B'C + AB", `${ov(v('A'))}${ov(v('B'))}${v('C')} + ${v('A')}${v('B')}`]];
      const [src, html] = pick(exprs);
      const m = rand(0, 7);
      const val = L.evaluate(L.parse(src, n), m, n) ? 1 : 0;
      const bits = L.binary(m, n);
      return { tag: 'Algebra di Boole', q: `${v('F')} = ${html}. Quanto vale ${v('F')} per ${v('A')} = ${bits[0]}, ${v('B')} = ${bits[1]}, ${v('C')} = ${bits[2]}?`, type: 'mc', choices: ['0', '1'], ansIndex: val,
        explain: `Sostituisci i valori: una variabile negata vale il contrario, il prodotto è 1 solo se tutti i fattori sono 1, la somma è 1 se almeno un termine è 1. Risultato: ${val}.` };
    },
    () => {
      const m = rand(0, 15);
      const lits = L.mintermLiterals(4, m);
      return { tag: 'Mintermini', q: `A quale mintermine corrisponde il prodotto ${App.productHTML(lits)} (4 variabili, ${v('A')} è il bit più significativo)?`, type: 'int', ans: m, prefix: 'm',
        explain: `Variabile diretta = 1, negata = 0: ${L.binary(m, 4)}<sub>2</sub> = ${m}, quindi m${m}.` };
    },
    () => {
      const k = pick([1, 2, 3]);
      const size = 1 << k;
      return { tag: 'Karnaugh', q: `In una mappa a 4 variabili raggruppi ${size} celle adiacenti. Quante variabili restano nel termine prodotto?`, type: 'int', ans: 4 - k,
        explain: `Un gruppo di 2<sup>k</sup> celle elimina k variabili: ${size} = 2<sup>${k}</sup>, quindi restano 4 − ${k} = ${4 - k} variabili.` };
    },
    () => {
      const x = pick([100, 200, 300, 500, 1000, 60, 20]);
      const bits = Math.ceil(Math.log2(x + 1));
      return { tag: 'Binario', q: `Quanti bit servono, al minimo, per rappresentare il numero ${x} in binario senza segno?`, type: 'int', ans: bits,
        explain: `Con n bit arrivi a 2<sup>n</sup> − 1: 2<sup>${bits - 1}</sup> − 1 = ${(1 << (bits - 1)) - 1} non basta, 2<sup>${bits}</sup> − 1 = ${(1 << bits) - 1} sì.` };
    },
  ];

  const DIG_MC = [
    ['Quale porta dà 1 solo quando gli ingressi sono diversi?', ['XOR', 'XNOR', 'AND', 'NOR'], 'OR esclusivo: 0 1 1 0.'],
    ['Quali sono le porte universali?', ['NAND e NOR', 'AND e OR', 'XOR e XNOR', 'solo NOT'], 'Con sole NAND (o sole NOR) si realizzano NOT, AND e OR, quindi qualunque circuito.'],
    ['Righe e colonne della mappa di Karnaugh seguono il codice…', ['Gray', 'binario naturale', 'BCD', 'esadecimale'], 'Nel codice Gray due valori vicini differiscono per un solo bit: così celle adiacenti sono semplificabili.'],
    [`Secondo De Morgan, ${ov(v('A') + '·' + v('B'))} è uguale a…`, [`${ov(v('A'))} + ${ov(v('B'))}`, `${ov(v('A'))}·${ov(v('B'))}`, `${v('A')} + ${v('B')}`, `${v('A')}·${v('B')}`], 'Si nega ogni variabile e il prodotto diventa somma.'],
    [`${v('A')} + ${v('A')}${v('B')} si semplifica in…`, [v('A'), v('B'), `${v('A')} + ${v('B')}`, '1'], `Assorbimento: ${v('A')}(1 + ${v('B')}) = ${v('A')}·1 = ${v('A')}.`],
    [`${v('A')} + ${ov(v('A'))}${v('B')} si semplifica in…`, [`${v('A')} + ${v('B')}`, v('A'), v('B'), `${ov(v('A'))}${v('B')}`], `Teorema: ${v('A')} + ${ov(v('A'))}${v('B')} = ${v('A')} + ${v('B')}.`],
    [`Quanto vale ${v('A')}·${ov(v('A'))}?`, ['0', '1', v('A'), ov(v('A'))], 'Una variabile e la sua negata non possono essere 1 insieme.'],
    ['Una cella X (indifferenza) nella mappa di Karnaugh…', ['si usa come 1 o come 0, come conviene', 'va sempre raggruppata', 'non si può mai raggruppare', 'vale sempre 1'], 'Si include in un gruppo solo se lo rende più grande.'],
    ['Un gruppo valido in una mappa di Karnaugh contiene…', ['1, 2, 4, 8 o 16 celle', 'un numero qualsiasi di celle', 'solo celle della stessa riga', 'almeno 3 celle'], 'Solo potenze di 2, di forma rettangolare (anche a cavallo dei bordi).'],
    ['Una cifra esadecimale corrisponde a…', ['4 bit', '8 bit', '3 bit', '16 bit'], '16 = 2⁴.'],
    ['In BCD il numero 59 si scrive…', ['0101 1001', '0011 1011', '0101 1010', '1001 0101'], 'Ogni cifra decimale in 4 bit: 5 = 0101, 9 = 1001.'],
    ['Con 8 bit in complemento a 2 il numero più piccolo rappresentabile è…', ['−128', '−127', '−255', '0'], 'Da −2⁷ = −128 a 2⁷ − 1 = +127.'],
    ['Nella forma canonica SP (somma di prodotti) ogni mintermine…', ['vale 1 in una sola riga della tabella', 'vale 0 in una sola riga', 'contiene solo variabili dirette', 'ha una sola variabile'], 'Per questo la forma SP si scrive sommando i mintermini delle righe in cui F = 1.'],
  ];

  function mcQuestion(item, topic) {
    const [q, choices, explain] = item;
    const order = App.shuffle(choices.map((c, i) => i));
    return { tag: 'Concetti', q, type: 'mc', choices: order.map((i) => choices[i]), ansIndex: order.indexOf(0), explain, topic };
  }

  function nextQuestion() {
    const t = quiz.topic;
    const pool = [];
    if (t !== 'dig') { ELE.forEach((g) => pool.push(() => g())); ELE_MC.forEach((m) => pool.push(() => mcQuestion(m))); }
    if (t !== 'ele') { DIG.forEach((g) => pool.push(() => g())); DIG_MC.forEach((m) => pool.push(() => mcQuestion(m))); }
    let q;
    do { q = pick(pool)(); } while (quiz.q && q.q === quiz.q.q && pool.length > 1);
    return q;
  }

  // ---------- Stato della partita ----------
  const quiz = { topic: 'all', mode: 'free', q: null, answered: false, score: 0, right: 0, total: 0, streak: 0, best: App.store.get('best', 0), timer: null, end: 0, earned: 0 };

  function renderScore() {
    $('qz-score').textContent = quiz.score;
    $('qz-streak').textContent = quiz.streak;
    $('qz-ratio').textContent = quiz.right + '/' + quiz.total;
    $('qz-best').textContent = quiz.best;
  }

  function ask() {
    quiz.q = nextQuestion();
    quiz.answered = false;
    const q = quiz.q;
    $('qz-tag').textContent = q.tag;
    $('qz-q').innerHTML = q.q;
    const fb = $('qz-fb');
    fb.className = 'feedback';
    fb.innerHTML = '';
    $('qz-next').hidden = true;
    const choices = $('qz-choices');
    const row = $('qz-answer');
    if (q.type === 'mc') {
      row.hidden = true;
      choices.hidden = false;
      choices.innerHTML = '';
      q.choices.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'choice';
        b.innerHTML = c;
        b.addEventListener('click', () => answer(i, b));
        choices.appendChild(b);
      });
    } else {
      choices.hidden = true;
      row.hidden = false;
      const inp = $('qz-in');
      inp.value = '';
      inp.inputMode = q.type === 'num' ? 'decimal' : q.type === 'hex' ? 'text' : 'numeric';
      inp.placeholder = { num: 'es. 12,5', int: 'numero intero', bin: 'es. 101101', bin8: '8 bit, es. 11010110', hex: 'es. 3F' }[q.type];
      $('qz-unit').textContent = q.type === 'num' ? q.unit : q.type === 'hex' ? '₁₆' : q.type.startsWith('bin') ? '₂' : q.prefix || '';
      if (window.matchMedia('(pointer: fine)').matches) inp.focus();
    }
  }

  function parseAnswer(q, raw) {
    const s = raw.trim().replace(/\s+/g, '');
    if (!s) return { empty: true };
    if (q.type === 'num') return { value: App.parseNum(s) };
    if (q.type === 'int') return { value: /^[-−]?\d+$/.test(s.replace(/^m/i, '')) ? Number(s.replace(/^m/i, '').replace('−', '-')) : NaN };
    if (q.type === 'bin' || q.type === 'bin8') return { value: /^[01]+$/.test(s) ? parseInt(s, 2) : NaN, len: s.length };
    if (q.type === 'hex') return { value: /^(0x)?[0-9a-f]+$/i.test(s) ? parseInt(s.replace(/^0x/i, ''), 16) : NaN };
    return { value: NaN };
  }

  function answer(choice, btn) {
    if (quiz.answered) return;
    const q = quiz.q;
    let ok;
    let wrongNote = '';
    if (q.type === 'mc') {
      ok = choice === q.ansIndex;
      $('qz-choices').querySelectorAll('.choice').forEach((b, i) => {
        b.disabled = true;
        if (i === q.ansIndex) b.classList.add('right');
      });
      if (!ok && btn) btn.classList.add('wrong');
    } else {
      const a = parseAnswer(q, $('qz-in').value);
      if (a.empty) { App.feedback($('qz-fb'), 'warn', 'Scrivi qualcosa', 'Inserisci la risposta, poi premi Verifica.'); return; }
      if (Number.isNaN(a.value)) { App.feedback($('qz-fb'), 'warn', 'Formato', { num: 'Serve un numero (va bene la virgola).', int: 'Serve un numero intero.', bin: 'Usa solo 0 e 1.', bin8: 'Usa solo 0 e 1.', hex: 'Usa le cifre 0–9 e A–F.' }[q.type]); return; }
      if (q.type === 'num') {
        ok = App.relErr(a.value, q.ans) < 0.02;
        if (!ok && (App.relErr(a.value, q.ans * 1000) < 0.02 || App.relErr(a.value, q.ans / 1000) < 0.02)) wrongNote = ' Il numero è giusto ma l\'unità no: attenzione ai multipli.';
      } else if (q.type === 'bin8') {
        ok = a.value === q.ans && a.len === 8;
        if (a.value === q.ans && a.len !== 8) wrongNote = ' Il valore torna, ma servono esattamente 8 bit (il primo è il segno).';
      } else ok = a.value === q.ans;
    }
    quiz.answered = true;
    quiz.total++;
    const correctText = q.type === 'mc' ? q.choices[q.ansIndex]
      : q.type === 'num' ? num(q.ans, 4) + ' ' + q.unit
        : q.type.startsWith('bin') ? '<span class="mono">' + bin(q.ans, q.type === 'bin8' ? 8 : 1) + '</span>'
          : q.type === 'hex' ? q.ans.toString(16).toUpperCase() : (q.prefix || '') + q.ans;
    if (ok) {
      quiz.right++;
      quiz.streak++;
      const pts = 10 + Math.min(quiz.streak - 1, 5) * 2;
      quiz.score += pts;
      const xp = quiz.streak >= 5 ? 8 : 5;
      if (quiz.mode === 'timed') quiz.earned += xp;
      else App.xp.add(xp, q.tag);
      App.feedback($('qz-fb'), 'ok', quiz.streak >= 3 ? quiz.streak + ' di fila!' : 'Giusto!', `+${pts} punti. ${q.explain}`);
    } else {
      quiz.streak = 0;
      App.feedback($('qz-fb'), 'bad', 'Sbagliato', `Risposta corretta: <strong>${correctText}</strong>.${wrongNote} ${q.explain}`);
    }
    renderScore();
    if (quiz.mode === 'timed') setTimeout(() => { if (quiz.timer) ask(); }, ok ? 700 : 2200);
    else {
      $('qz-next').hidden = false;
      $('qz-next').focus();
    }
  }

  function startTimed() {
    quiz.mode = 'timed';
    quiz.score = quiz.right = quiz.total = quiz.streak = quiz.earned = 0;
    quiz.end = Date.now() + 90000;
    $('qz-timer').hidden = false;
    $('qz-start').textContent = 'Ricomincia la sfida';
    clearInterval(quiz.timer);
    quiz.timer = setInterval(() => {
      const left = Math.max(0, quiz.end - Date.now());
      $('qz-time').textContent = Math.ceil(left / 1000) + ' s';
      $('qz-bar').style.width = (left / 90000) * 100 + '%';
      if (left <= 0) finishTimed();
    }, 200);
    renderScore();
    ask();
  }

  function finishTimed() {
    clearInterval(quiz.timer);
    quiz.timer = null;
    const record = quiz.score > quiz.best;
    if (record) { quiz.best = quiz.score; App.store.set('best', quiz.best); }
    $('qz-choices').querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
    quiz.answered = true;
    App.feedback($('qz-fb'), record ? 'ok' : 'warn', record ? 'Nuovo record!' : 'Tempo scaduto',
      `${quiz.right} risposte giuste su ${quiz.total}, ${quiz.score} punti.` + (record ? '' : ` Il record è ${quiz.best}.`));
    if (quiz.earned) App.xp.add(quiz.earned + (record ? 20 : 0), 'Sfida a tempo');
    quiz.mode = 'free';
    $('qz-timer').hidden = true;
    $('qz-next').hidden = false;
    $('qz-start').textContent = 'Sfida a tempo (90 s)';
    renderScore();
  }

  App.onReady(function initQuiz() {
    if (!$('qz-q')) return;
    $('qz-topic').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      quiz.topic = b.dataset.t;
      $('qz-topic').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (!quiz.timer) ask();
    }));
    $('qz-check').addEventListener('click', () => answer());
    $('qz-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') { if (quiz.answered && !quiz.timer) ask(); else answer(); } });
    $('qz-next').addEventListener('click', ask);
    $('qz-start').addEventListener('click', startTimed);
    renderScore();
    ask();
  });
})();
