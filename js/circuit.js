/* Scheda 1 — Il circuito elementare: generatore reale, interruttore, carico, strumenti */
(function () {
  'use strict';
  const App = window.App;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);

  const state = {
    E: 9,
    r: 1,
    R: 470,
    Prated: 0.25,
    closed: true,
    short: false,
    electrons: false,
    mission: null,
  };

  function solve() {
    const { E, r, R, closed, short } = state;
    if (!closed) return { I: 0, V: E, Vr: 0, P: 0, Pr: 0, eta: NaN, open: true };
    const Rload = short ? 0 : R;
    const Rt = Rload + r;
    const I = Rt === 0 ? (E === 0 ? 0 : Infinity) : E / Rt;
    const Vr = isFinite(I) ? r * I : NaN;
    const V = short ? 0 : R * I;
    const P = short ? 0 : V * I;
    const Pr = isFinite(I) ? r * I * I : Infinity;
    const eta = E > 0 && isFinite(I) ? V / E : NaN;
    return { I, V, Vr, P, Pr, eta, open: false };
  }

  // ---------- Schema ----------
  const PATH_NORMAL = 'M130 86 V60 H470 V270 H130 Z';
  const PATH_SHORT = 'M130 86 V60 H470 V100 H525 V230 H470 V270 H130 Z';
  const N_CHARGES = 18;
  let svg, lever, shortGroup, resRect, resGroup, flowPath, charges = [], labels = {};

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function buildSchematic() {
    svg = $('ckt-svg');
    svg.innerHTML = `
      <title>Schema: generatore reale con resistenza interna r, interruttore, amperometro, carico R e voltmetro ai morsetti</title>
      <!-- ramo del voltmetro, collegato ai morsetti A e B -->
      <path class="wire" d="M130 60 H40 V148 M40 182 V270 H130"/>
      <circle class="comp" cx="40" cy="165" r="17"/>
      <text class="txt" x="40" y="170.5" text-anchor="middle">V</text>
      <!-- generatore reale -->
      <rect class="dashbox" x="84" y="86" width="104" height="160" rx="6"/>
      <text class="small" x="184" y="239" text-anchor="end">gen. reale</text>
      <path class="wire" d="M130 86 V60 M130 86 V104 M130 146 V170 M130 214 V246 M130 246 V270"/>
      <rect class="comp" x="123" y="104" width="14" height="42"/>
      <circle class="comp" cx="130" cy="192" r="22"/>
      <text class="txt" x="130" y="189" text-anchor="middle">+</text>
      <text class="txt" x="130" y="208" text-anchor="middle">−</text>
      <text class="var" x="146" y="130">r</text>
      <text class="var" x="158" y="198">E</text>
      <circle class="comp" cx="130" cy="86" r="4.5"/>
      <circle class="comp" cx="130" cy="246" r="4.5"/>
      <text class="txt" x="116" y="80" text-anchor="end">A</text>
      <text class="txt" x="116" y="262" text-anchor="end">B</text>
      <circle class="dot" cx="130" cy="60" r="3.8"/>
      <circle class="dot" cx="130" cy="270" r="3.8"/>
      <!-- linea superiore con interruttore e amperometro -->
      <path class="wire" d="M130 60 H215 M265 60 H313 M347 60 H470 V125 M470 205 V270 H130"/>
      <circle class="comp" cx="215" cy="60" r="3.8"/>
      <circle class="comp" cx="265" cy="60" r="3.8"/>
      <line id="ckt-lever" class="wire" x1="215" y1="60" x2="263" y2="60"/>
      <text class="small" x="240" y="86" text-anchor="middle">interruttore</text>
      <circle class="comp" cx="330" cy="60" r="17"/>
      <text class="txt" x="330" y="65.5" text-anchor="middle">A</text>
      <!-- carico -->
      <g id="ckt-res">
        <rect id="ckt-res-rect" class="comp" x="459" y="125" width="22" height="80"/>
      </g>
      <circle class="smoke s1" cx="470" cy="120" r="7"/>
      <circle class="smoke s2" cx="466" cy="120" r="6"/>
      <circle class="smoke s3" cx="474" cy="120" r="6"/>
      <text class="var" x="446" y="160" text-anchor="end">R</text>
      <!-- cortocircuito -->
      <g id="ckt-short" style="display:none">
        <path class="short" d="M470 100 H525 V230 H470"/>
        <circle class="dot" cx="470" cy="100" r="3.8"/>
        <circle class="dot" cx="470" cy="230" r="3.8"/>
        <text class="small" x="530" y="170" text-anchor="end" style="fill:var(--bad)" transform="rotate(-90 530 170)">corto</text>
      </g>
      <!-- verso della corrente -->
      <g id="ckt-arrow">
        <line class="arrow" x1="372" y1="42" x2="420" y2="42"/>
        <path class="arrowhead" d="M420 37 L430 42 L420 47 Z"/>
      </g>
      <path id="ckt-flow" d="${PATH_NORMAL}" fill="none" stroke="none"/>
    `;
    lever = $('ckt-lever');
    shortGroup = $('ckt-short');
    resRect = $('ckt-res-rect');
    resGroup = $('ckt-res');
    flowPath = $('ckt-flow');

    labels.E = el('text', { class: 'val', x: 158, y: 216 }, svg);
    labels.r = el('text', { class: 'val', x: 146, y: 148 }, svg);
    labels.R = el('text', { class: 'val', x: 446, y: 178, 'text-anchor': 'end' }, svg);
    labels.I = el('text', { class: 'val', x: 552, y: 30, 'text-anchor': 'end' }, svg);
    labels.V = el('text', { class: 'val', x: 44, y: 50 }, svg);

    const g = el('g', { id: 'ckt-charges' }, svg);
    for (let i = 0; i < N_CHARGES; i++) charges.push(el('circle', { class: 'charge', r: 4 }, g));
  }

  // ---------- Animazione delle cariche ----------
  let offset = 0;
  let last = 0;

  function speedFor(I) {
    if (!isFinite(I)) return 340;
    if (I < 1e-5) return 0;
    return App.clamp(25 + 55 * Math.log10(I / 1e-4), 12, 320);
  }

  function placeCharges() {
    const L = flowPath.getTotalLength();
    const gap = L / N_CHARGES;
    charges.forEach((c, i) => {
      let s = (offset + i * gap) % L;
      if (s < 0) s += L;
      const p = flowPath.getPointAtLength(s);
      c.setAttribute('cx', p.x.toFixed(1));
      c.setAttribute('cy', p.y.toFixed(1));
    });
  }

  function tick(t) {
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (App.isVisible(svg) && !document.hidden) {
      const sol = solve();
      const v = App.reducedMotion ? 0 : speedFor(sol.I);
      offset += (state.electrons ? -1 : 1) * v * dt;
      if (v > 0 || App.reducedMotion) placeCharges();
    }
    requestAnimationFrame(tick);
  }

  // ---------- Aggiornamento ----------
  function render() {
    const sol = solve();
    const { E, r, R } = state;

    // interruttore e cortocircuito
    if (state.closed) { lever.setAttribute('x2', 263); lever.setAttribute('y2', 60); }
    else { lever.setAttribute('x2', 257); lever.setAttribute('y2', 34); }
    shortGroup.style.display = state.short ? '' : 'none';
    flowPath.setAttribute('d', state.short ? PATH_SHORT : PATH_NORMAL);

    const flowing = !sol.open && sol.I > 1e-5;
    charges.forEach((c) => {
      c.style.display = flowing ? '' : 'none';
      c.classList.toggle('electron', state.electrons);
    });
    $('ckt-arrow').style.display = flowing ? '' : 'none';
    placeCharges();

    labels.E.textContent = App.si(E, 'V');
    labels.r.textContent = App.si(r, 'Ω');
    labels.R.textContent = App.si(R, 'Ω');
    labels.I.textContent = flowing ? (state.electrons ? 'e⁻ ←   I = ' : 'I = ') + App.si(sol.I, 'A') : '';
    labels.V.textContent = 'V = ' + App.si(sol.V, 'V');

    // riscaldamento del carico (effetto Joule)
    const ratio = sol.P / state.Prated;
    const burn = ratio > 1 && !state.short;
    const pct = Math.round(App.clamp(ratio, 0, 1) * 85);
    resRect.style.fill = burn ? 'var(--bad)' : 'color-mix(in srgb, var(--energy) ' + pct + '%, var(--surface))';
    resGroup.classList.toggle('burning', burn && !App.reducedMotion);
    svg.classList.toggle('burning-on', burn && !App.reducedMotion);

    // strumenti
    $('m-I').textContent = sol.open ? '0 A' : App.si(sol.I, 'A');
    $('m-V').textContent = App.si(sol.V, 'V');
    $('m-P').textContent = App.si(sol.P, 'W');
    $('m-eta').textContent = Number.isNaN(sol.eta) ? '—' : App.num(sol.eta * 100, 3) + ' %';
    $('m-P').parentElement.classList.toggle('alert', burn);
    $('m-I').parentElement.classList.toggle('alert', !isFinite(sol.I));

    const warn = $('ckt-warn');
    if (burn) {
      App.feedback(warn, 'bad', 'Si brucia!',
        'Il resistore da ' + ratedLabel() + ' sta dissipando ' + App.si(sol.P, 'W') + ', ' + App.num(ratio, 2) +
        ' volte la sua potenza massima. Aumenta <var>R</var>, riduci <var>E</var> oppure scegli un resistore più grosso.');
    } else if (state.short && state.closed) {
      App.feedback(warn, 'bad', 'Cortocircuito',
        isFinite(sol.I)
          ? 'Il carico è scavalcato da un filo: <var>V</var> = 0 e la corrente vale <var>I</var><sub>cc</sub> = <var>E</var>/<var>r</var> = ' + App.si(sol.I, 'A') +
            '. Tutta la potenza (' + App.si(sol.Pr, 'W') + ') si trasforma in calore dentro il generatore.'
          : 'Con un generatore ideale (<var>r</var> = 0) la corrente di cortocircuito sarebbe infinita. Nella realtà <var>r</var> non è mai zero: per questo esistono fusibili e interruttori magnetotermici.');
    } else if (ratio > 0.7) {
      App.feedback(warn, 'warn', 'Scotta', 'Il resistore lavora al ' + Math.round(ratio * 100) + '% della sua potenza massima: è caldo ma regge.');
    } else {
      warn.className = 'feedback';
      warn.innerHTML = '';
    }

    renderSteps(sol);
    renderGraph(sol);
    checkMission(sol);
    $('ckt-switch-label').textContent = state.closed ? 'Interruttore chiuso' : 'Interruttore aperto';
  }

  function ratedLabel() {
    return { 0.25: '¼ W', 0.5: '½ W', 1: '1 W', 5: '5 W' }[state.Prated] || App.si(state.Prated, 'W');
  }

  function renderSteps(sol) {
    const { E, r, R } = state;
    const si = App.si;
    const box = $('ckt-steps');
    if (sol.open) {
      box.innerHTML = `
        <li><span class="calc"><var>I</var> = 0<span class="why">Interruttore aperto: il circuito è interrotto e non circola corrente.</span></span></li>
        <li><span class="calc"><var>V</var> = <var>E</var> − <var>r</var>·<var>I</var> = ${si(E, 'V')} − ${si(r, 'Ω')} · 0 = <span class="res">${si(E, 'V')}</span>
          <span class="why">Senza corrente non c'è caduta interna: il voltmetro ai morsetti A–B legge proprio la f.e.m. È così che si misura <var>E</var>.</span></span></li>`;
      return;
    }
    if (state.short) {
      box.innerHTML = `
        <li><span class="calc"><var>I</var><sub>cc</sub> = <span class="frac"><span><var>E</var></span><span><var>r</var></span></span> = <span class="frac"><span>${si(E, 'V')}</span><span>${si(r, 'Ω')}</span></span> = <span class="res">${si(sol.I, 'A')}</span>
          <span class="why">Con il carico cortocircuitato resta solo la resistenza interna a limitare la corrente.</span></span></li>
        <li><span class="calc"><var>V</var><sub>AB</sub> = 0<span class="why">Tra i morsetti c'è un filo ideale: nessuna differenza di potenziale.</span></span></li>`;
      return;
    }
    const I = sol.I;
    box.innerHTML = `
      <li><span class="calc"><var>I</var> = <span class="frac"><span><var>E</var></span><span><var>R</var> + <var>r</var></span></span> = <span class="frac"><span>${si(E, 'V')}</span><span>${si(R, 'Ω')} + ${si(r, 'Ω')}</span></span> = <span class="res">${si(I, 'A')}</span>
        <span class="why">Legge di Ohm per il circuito completo: la f.e.m. spinge la corrente attraverso tutta la resistenza della maglia.</span></span></li>
      <li><span class="calc"><var>V</var> = <var>R</var> · <var>I</var> = ${si(R, 'Ω')} · ${si(I, 'A')} = <span class="res">${si(sol.V, 'V')}</span>
        <span class="why">Prima legge di Ohm sul carico. È anche la ddp ai morsetti A–B, quella che legge il voltmetro.</span></span></li>
      <li><span class="calc"><var>V</var><sub>r</sub> = <var>r</var> · <var>I</var> = ${si(r, 'Ω')} · ${si(I, 'A')} = <span class="res">${si(sol.Vr, 'V')}</span>
        <span class="why">Caduta di tensione dentro il generatore.</span></span></li>
      <li><span class="calc"><var>V</var> + <var>V</var><sub>r</sub> = ${si(sol.V, 'V')} + ${si(sol.Vr, 'V')} = ${si(sol.V + sol.Vr, 'V')} = <var>E</var> <span class="check">✓</span>
        <span class="why">La f.e.m. si ripartisce tra carico e resistenza interna (legge di Kirchhoff delle tensioni).</span></span></li>
      <li><span class="calc"><var>P</var> = <var>V</var> · <var>I</var> = <var>R</var> · <var>I</var>² = <span class="res">${si(sol.P, 'W')}</span>
        <span class="why">Potenza trasformata in calore nel carico (effetto Joule). Nel generatore si perdono <var>r</var>·<var>I</var>² = ${si(sol.Pr, 'W')}.</span></span></li>
      <li><span class="calc">η = <span class="frac"><span><var>V</var></span><span><var>E</var></span></span> = <span class="frac"><span><var>R</var></span><span><var>R</var> + <var>r</var></span></span> = <span class="res">${App.num(sol.eta * 100, 3)} %</span>
        <span class="why">Rendimento: quanta parte della potenza prodotta arriva al carico.</span></span></li>`;
  }

  // ---------- Grafico V–I ----------
  function niceCeil(x) {
    if (!(x > 0) || !isFinite(x)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= x * 0.999) return m * p;
    return 10 * p;
  }

  function renderGraph(sol) {
    const g = $('ckt-graph');
    const { E, r, R } = state;
    const W = 340, H = 236, x0 = 52, x1 = 326, y0 = 200, y1 = 14;
    const Icc = r > 0 ? E / r : Infinity;
    const Iop = E / (R + r);
    let Imax = niceCeil(Math.min(Icc, Math.max(Iop * 1.8, 1e-6)));
    if (state.short && isFinite(Icc)) Imax = niceCeil(Icc * 1.05);
    const Vmax = niceCeil(Math.max(E * 1.12, 0.1));
    const X = (i) => x0 + ((x1 - x0) * i) / Imax;
    const Y = (v) => y0 - ((y0 - y1) * v) / Vmax;

    let s = '';
    for (let k = 0; k <= 4; k++) {
      const i = (Imax * k) / 4;
      const v = (Vmax * k) / 4;
      s += `<line class="gridl" x1="${X(i)}" y1="${y0}" x2="${X(i)}" y2="${y1}"/>`;
      s += `<line class="gridl" x1="${x0}" y1="${Y(v)}" x2="${x1}" y2="${Y(v)}"/>`;
      s += `<text x="${X(i)}" y="${y0 + 15}" text-anchor="${k === 0 ? 'start' : k === 4 ? 'end' : 'middle'}">${App.si(i, 'A', 2)}</text>`;
      s += `<text x="${x0 - 6}" y="${Y(v) + 3.5}" text-anchor="end">${App.si(v, 'V', 2)}</text>`;
    }
    s += `<line class="axis" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}"/><line class="axis" x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}"/>`;
    s += `<text class="axname" x="${x1}" y="${y0 - 6}" text-anchor="end">I</text><text class="axname" x="${x0 + 6}" y="${y1 + 12}">V</text>`;

    // caratteristica del generatore: V = E − r·I
    const iEnd = r > 0 ? Math.min(Imax, Icc) : Imax;
    s += `<line class="gen" x1="${X(0)}" y1="${Y(E)}" x2="${X(iEnd)}" y2="${Y(E - r * iEnd)}"/>`;
    // retta di carico: V = R·I
    if (!state.short) {
      const iL = Math.min(Imax, Vmax / R);
      s += `<line class="load" x1="${X(0)}" y1="${Y(0)}" x2="${X(iL)}" y2="${Y(R * iL)}"/>`;
    }
    // punto di lavoro
    let pi, pv;
    if (sol.open) { pi = 0; pv = E; }
    else if (state.short) { pi = isFinite(Icc) ? Icc : null; pv = 0; }
    else { pi = sol.I; pv = sol.V; }
    if (pi !== null && pi <= Imax * 1.001) {
      s += `<line class="guide" x1="${X(pi)}" y1="${Y(pv)}" x2="${X(pi)}" y2="${y0}"/>`;
      s += `<line class="guide" x1="${X(pi)}" y1="${Y(pv)}" x2="${x0}" y2="${Y(pv)}"/>`;
      s += `<circle class="op" cx="${X(pi)}" cy="${Y(pv)}" r="5.5"/>`;
    }
    g.setAttribute('viewBox', `0 0 ${W} ${H}`);
    g.innerHTML = '<title>Caratteristica del generatore e retta del carico; il punto di lavoro è la loro intersezione</title>' + s;
    $('ckt-graph-note').innerHTML = sol.open
      ? 'Circuito aperto: il punto di lavoro sta sull\'asse <var>V</var>, a <var>V</var> = <var>E</var>.'
      : state.short
        ? 'Cortocircuito: il punto di lavoro sta sull\'asse <var>I</var>, a <var>I</var><sub>cc</sub> = <var>E</var>/<var>r</var>.'
        : 'Punto di lavoro: <var>I</var> = ' + App.si(sol.I, 'A') + ', <var>V</var> = ' + App.si(sol.V, 'V') + '. Più ripida è la retta di carico, più piccola è <var>R</var>.';
  }

  // ---------- Missioni ----------
  const MISSIONS = [
    function current() {
      const E = App.pick([4.5, 9, 12, 24]);
      const r = App.pick([0.5, 1, 2]);
      const Rx = App.randE12(22, 2200);
      const I = Number((E / (Rx + r)).toPrecision(2));
      return {
        E, r,
        text: `Con <var>E</var> = ${App.si(E, 'V')} e <var>r</var> = ${App.si(r, 'Ω')}, regola <var>R</var> finché l'amperometro segna <strong>${App.si(I, 'A')}</strong>.`,
        hint: `Dalla legge di Ohm del circuito: <var>R</var> = <var>E</var>/<var>I</var> − <var>r</var> = ${App.si(E, 'V')} / ${App.si(I, 'A')} − ${App.si(r, 'Ω')} ≈ ${App.si(E / I - r, 'Ω')}.`,
        check: (sol) => !sol.open && App.relErr(sol.I, I) < 0.02,
      };
    },
    function voltage() {
      const E = 12;
      const r = App.pick([2, 4, 5]);
      const V = App.pick([6, 8, 9, 10]);
      const Rx = (r * V) / (E - V);
      return {
        E, r,
        text: `Il generatore ha <var>E</var> = 12 V ma una resistenza interna grande, <var>r</var> = ${r} Ω. Scegli <var>R</var> perché ai morsetti restino <strong>${V} V</strong>.`,
        hint: `Partitore di tensione: <var>V</var> = <var>E</var>·<var>R</var>/(<var>R</var> + <var>r</var>), quindi <var>R</var> = <var>r</var>·<var>V</var>/(<var>E</var> − <var>V</var>) = ${App.si(Rx, 'Ω')}.`,
        check: (sol) => !sol.open && Math.abs(sol.V - V) / V < 0.015,
      };
    },
    function maxPower() {
      const E = 12;
      const r = App.pick([4, 8, 10, 15]);
      return {
        E, r,
        text: `<var>E</var> = 12 V, <var>r</var> = ${r} Ω. Trova il valore di <var>R</var> che fa dissipare al carico la <strong>massima potenza possibile</strong>. Guarda il wattmetro mentre muovi il cursore.`,
        hint: `Teorema del massimo trasferimento di potenza: il carico riceve il massimo quando <var>R</var> = <var>r</var>. In quel punto il rendimento è del 50%.`,
        check: (sol) => !sol.open && Math.abs(state.R - r) / r < 0.03,
      };
    },
  ];

  let fields = {};

  function startMission() {
    const m = App.pick(MISSIONS)();
    state.mission = m;
    state.E = m.E;
    state.r = m.r;
    state.closed = true;
    state.short = false;
    state.Prated = 5;
    fields.E.set(m.E);
    fields.r.set(m.r);
    fields.E.disable(true);
    fields.r.disable(true);
    $('ckt-closed').checked = true;
    $('ckt-short-t').checked = false;
    $('ckt-short-t').disabled = true;
    $('ckt-closed').disabled = true;
    $('ckt-prated').value = '5';
    $('mission-text').innerHTML = m.text + ' <span class="hint">(Il resistore è da 5 W, così non si brucia mentre cerchi.)</span>';
    $('mission-hint').hidden = false;
    $('mission-stop').hidden = false;
    $('mission-go').textContent = 'Cambia missione';
    const fb = $('mission-fb');
    fb.className = 'feedback';
    fb.innerHTML = '';
    render();
  }

  function stopMission() {
    state.mission = null;
    fields.E.disable(false);
    fields.r.disable(false);
    $('ckt-short-t').disabled = false;
    $('ckt-closed').disabled = false;
    $('mission-text').innerHTML = 'Una missione blocca <var>E</var> e <var>r</var> e ti chiede di trovare il carico giusto. Prima fai il conto a mano, poi verifica con il cursore.';
    $('mission-hint').hidden = true;
    $('mission-stop').hidden = true;
    $('mission-go').textContent = 'Nuova missione';
  }

  function checkMission(sol) {
    const m = state.mission;
    if (!m || m.done) return;
    if (m.check(sol)) {
      m.done = true;
      App.feedback($('mission-fb'), 'ok', 'Missione compiuta!', 'Con <var>R</var> = ' + App.si(state.R, 'Ω') + ' ci sei. ' + m.hint);
      App.xp.add(25, 'Missione del circuito');
      $('mission-go').textContent = 'Nuova missione';
    }
  }

  // ---------- Triangolo di Ohm ----------
  function initTriangle() {
    const out = $('tri-out');
    const why = $('tri-why');
    const forms = {
      V: ['<var>V</var> = <var>R</var> · <var>I</var>', 'Copri V: restano R e I affiancati, quindi si moltiplicano.'],
      R: ['<var>R</var> = <span class="frac"><span><var>V</var></span><span><var>I</var></span></span>', 'Copri R: V sta sopra I, quindi si divide.'],
      I: ['<var>I</var> = <span class="frac"><span><var>V</var></span><span><var>R</var></span></span>', 'Copri I: V sta sopra R, quindi si divide.'],
    };
    const texts = document.querySelectorAll('#tri-svg [data-q]');
    function pickQ(q) {
      texts.forEach((t) => {
        const on = t.dataset.q === q;
        t.classList.toggle('covered', on);
        t.setAttribute('aria-pressed', String(on));
      });
      out.innerHTML = forms[q][0];
      why.textContent = forms[q][1];
    }
    texts.forEach((t) => {
      t.addEventListener('click', () => pickQ(t.dataset.q));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickQ(t.dataset.q); }
      });
    });
    pickQ('I');
  }

  App.onReady(function initCircuit() {
    if (!$('ckt-svg')) return;
    buildSchematic();

    fields.E = App.linkField($('ckt-E-r'), $('ckt-E'), { min: 0, max: 24, step: 0.5, value: state.E, onChange: (v) => { state.E = v; render(); } });
    fields.r = App.linkField($('ckt-rr-r'), $('ckt-rr'), { min: 0, max: 20, step: 0.1, value: state.r, onChange: (v) => { state.r = v; render(); } });
    fields.R = App.linkField($('ckt-R-r'), $('ckt-R'), { min: 1, max: 10000, log: true, value: state.R, onChange: (v) => { state.R = v; render(); } });

    $('ckt-closed').addEventListener('change', (e) => { state.closed = e.target.checked; render(); });
    $('ckt-short-t').addEventListener('change', (e) => { state.short = e.target.checked; render(); });
    $('ckt-flow-mode').querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        state.electrons = b.dataset.mode === 'e';
        $('ckt-flow-mode').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        $('ckt-flow-note').innerHTML = state.electrons
          ? 'Gli elettroni (carica negativa) escono dal polo − e rientrano nel polo +: verso opposto a quello convenzionale.'
          : 'Verso convenzionale: la corrente esce dal polo + del generatore, attraversa il carico e rientra dal polo −.';
        render();
      })
    );
    $('ckt-prated').addEventListener('change', (e) => { state.Prated = Number(e.target.value); render(); });
    $('mission-go').addEventListener('click', startMission);
    $('mission-stop').addEventListener('click', () => { stopMission(); render(); });
    $('mission-hint').addEventListener('click', () => {
      if (state.mission) App.feedback($('mission-fb'), 'warn', 'Suggerimento', state.mission.hint);
    });

    initTriangle();
    render();
    requestAnimationFrame(tick);
  });
})();
