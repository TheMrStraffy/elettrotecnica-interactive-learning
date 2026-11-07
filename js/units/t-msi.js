/* 3ª — Circuiti combinatori integrati: decoder, encoder, multiplexer, sommatori, comparatori, display */
(function () {
  'use strict';
  const App = window.App;
  const Lg = window.Logic;
  const L = App.Lessons;
  const { N, U, frac, res } = L.fmt;
  // qui i passaggi sono spesso frasi: possono andare a capo
  const step = (calc, why) => L.fmt.step(calc, why).replace('class="calc"', 'class="calc prose"');
  const pick = App.pick;
  const rand = App.rand;
  const K = App.CC;
  const h = K.h;
  const mc = App.B.mc;
  const lessons = [];

  // ---------- Formattazione ----------
  const bin = (x, n) => x.toString(2).padStart(n, '0');
  const spaced = (s) => s.split('').join(' ');
  const bitsH = (s) => `<span class="mono">${s}</span>`;
  const ovl = (x) => `<span class="ov">${x}</span>`;
  const sopH = (n, imps) => (imps.length ? imps.map((p) => App.productHTML(Lg.productLiterals(n, p))).join(' + ') : '0');
  const mintH = (n, m) => App.productHTML(Lg.mintermLiterals(n, m));
  const litCount = (n, imps) => imps.reduce((s, p) => s + Lg.literalCount(n, p), 0);
  const Y_ = (k, neg) => (neg ? ovl('<var>Y</var><sub>' + k + '</sub>') : '<var>Y</var><sub>' + k + '</sub>');
  const I_ = (k) => `<var>I</var><sub>${k}</sub>`;
  const S_ = (k, neg) => (neg ? ovl('<var>S</var><sub>' + k + '</sub>') : '<var>S</var><sub>' + k + '</sub>');
  const sub = (name, s) => `${name}<tspan class="sb" dy="3">${s}</tspan>`;
  const sgn = (x) => (x > 0 ? '+' + x : x < 0 ? '−' + Math.abs(x) : '0');
  const bitQ = (label, answer, o) => Object.assign({ label, type: 'text', fmt: 'bits', answer: String(answer) }, o || {});
  const b01 = (label, v) => h.choice(label, ['0', '1'], v);
  const yesno = (label, yes) => h.choice(label, ['sì', 'no'], yes ? 0 : 1);
  const ABC = ['A', 'B', 'C', 'D'];
  const range = (n) => Array.from({ length: n }, (_, k) => k);
  const signed4 = (x) => (x >= 8 ? x - 16 : x);

  /** Opzioni a scelta multipla: la giusta più i distrattori, senza doppioni, rimescolate. */
  function optsFrom(right, wrongs, filler, key = String) {
    const list = [right];
    const seen = new Set([key(right)]);
    const add = (w) => { if (list.length < 4 && !seen.has(key(w))) { seen.add(key(w)); list.push(w); } };
    wrongs.forEach(add);
    for (let g = 0; list.length < 4 && g < 300; g++) add(filler());
    const o = App.shuffle(list.map((_, i) => i));
    return { opts: o.map((i) => list[i]), ans: o.indexOf(0) };
  }

  /** Mappa di Karnaugh a 4 variabili in sola lettura, con i gruppi della forma minima. */
  function kmapH(outs, groups, cur) {
    const d = document.createElement('div');
    d.className = 'kmap';
    App.Karnaugh.renderMap(d, 4, outs, groups, { readonly: true, cur });
    return `<div class="kmap-wrap">${d.outerHTML}</div>`;
  }

  /** Addizione in colonna con la riga dei riporti. */
  function colTable(a, b, n, cin, la = 'A', lb = 'B') {
    const r = Lg.rippleAdd(a, b, n, cin);
    const td = (x, cls) => `<td${cls ? ` class="${cls}"` : ''}>${x}</td>`;
    let car = td(r.carries[n] ? '1' : '', 'car');
    let ra = td('');
    let rb = td('');
    let rs = td(r.cout ? '1' : '0', 'cout');
    for (let k = n - 1; k >= 0; k--) {
      car += td(k === 0 ? (cin ? '1' : '') : r.carries[k] ? '1' : '', 'car');
      ra += td((a >> k) & 1);
      rb += td((b >> k) & 1);
      rs += td((r.sum >> k) & 1);
    }
    return `<div class="table-wrap"><table class="tt colsum"><tbody><tr><th>riporti</th>${car}</tr><tr><th>${la}</th>${ra}</tr><tr><th>${lb}</th>${rb}</tr><tr class="sum"><th>somma</th>${rs}</tr></tbody></table></div>`;
  }

  // =====================================================================
  // Disegni: decoder, multiplexer, sommatore, display
  // =====================================================================

  /** o: { n, ins:[{name, v, w}], ens:[{name, v, neg}], low, active, show, mint, title } */
  function decoderSVG(o) {
    const n = o.n;
    const NO = 1 << n;
    const sp = NO > 4 ? 27 : 40;
    const top = 14;
    const x0 = 150;
    const x1 = 290;
    const chipH = NO * sp + 14;
    const ym = top + chipH / 2;
    const ens = o.ens || [];
    const W = 450;
    const H = top + chipH + (ens.length ? 56 : 16);
    const show = o.show !== false;
    let s = `<rect class="chip" x="${x0}" y="${top}" width="${x1 - x0}" height="${chipH}" rx="6"/>`;
    s += `<text class="cname" x="${(x0 + x1) / 2 + 6}" y="${ym - 4}" text-anchor="middle">${o.title || 'DEC'}</text><text class="csub" x="${(x0 + x1) / 2 + 6}" y="${ym + 13}" text-anchor="middle">${n} → ${NO}</text>`;
    o.ins.forEach((p, i) => {
      const y = ym + (i - (o.ins.length - 1) / 2) * sp * 1.6;
      s += `<line class="pin${p.v ? ' on' : ''}" x1="${x0 - 56}" y1="${y}" x2="${x0}" y2="${y}"/>`;
      s += `<text class="pval${p.v ? ' on' : ''}" x="${x0 - 64}" y="${y + 4.5}" text-anchor="end">${p.v}</text>`;
      s += `<text class="plbl" x="${x0 + 8}" y="${y + 4}">${p.name}</text>`;
      if (p.w) s += `<text class="wn" x="${x0 - 28}" y="${y - 7}" text-anchor="middle">peso ${p.w}</text>`;
    });
    ens.forEach((e, i) => {
      const x = x0 + ((i + 1) * (x1 - x0)) / (ens.length + 1);
      const yb = top + chipH;
      s += `<line class="pin${e.v ? ' on' : ''}" x1="${x}" y1="${yb + (e.neg ? 8 : 0)}" x2="${x}" y2="${yb + 30}"/>`;
      if (e.neg) s += `<circle class="bub" cx="${x}" cy="${yb + 4}" r="4"/>`;
      s += `<text class="plbl${e.neg ? ' ovl' : ''}" x="${x}" y="${yb - 8}" text-anchor="middle">${e.name}</text>`;
      s += `<text class="pval${e.v ? ' on' : ''}" x="${x}" y="${yb + 46}" text-anchor="middle">${e.v}</text>`;
    });
    for (let k = 0; k < NO; k++) {
      const y = top + 7 + sp / 2 + k * sp;
      const act = o.active === k;
      const lvl = o.low ? (act ? 0 : 1) : act ? 1 : 0;
      s += `<line class="pin${show && lvl ? ' on' : ''}" x1="${x1 + (o.low ? 8 : 0)}" y1="${y}" x2="${x1 + 50}" y2="${y}"/>`;
      if (o.low) s += `<circle class="bub" cx="${x1 + 4}" cy="${y}" r="4"/>`;
      s += `<text class="plbl${o.low ? ' ovl' : ''}" x="${x1 - 8}" y="${y + 4}" text-anchor="end">${sub('Y', k)}</text>`;
      if (show) {
        s += `<text class="pval${lvl ? ' on' : ''}" x="${x1 + 60}" y="${y + 4.5}">${lvl}</text>`;
        s += `<g class="led${act ? ' on' : ''}"><circle cx="${x1 + 88}" cy="${y}" r="7"/></g>`;
        if (o.mint) s += `<text class="wn" x="${x1 + 104}" y="${y + 4}">m${k}</text>`;
      }
    }
    return `<svg class="msi" viewBox="0 0 ${W} ${H}" role="img" style="max-width:${W}px"><title>Decoder ${n} → ${NO}</title>${s}</svg>`;
  }

  /** o: { data:[0|1], sels:[{name, v}] (dal più significativo), show } */
  function muxSVG(o) {
    const NI = o.data.length;
    const sp = NI > 4 ? 28 : 40;
    const top = 28;
    const x0 = 150;
    const x1 = 270;
    const hL = NI * sp + 12;
    const yc = top + hL / 2;
    const hR = Math.max(56, hL * 0.42);
    const yIn = (k) => top + 6 + sp / 2 + k * sp;
    const botY = (x) => top + hL - ((x - x0) / (x1 - x0)) * ((hL - hR) / 2);
    const ns = o.sels.length;
    const sel = o.sels.reduce((a, q) => a * 2 + q.v, 0);
    const show = o.show !== false;
    const y = o.data[sel];
    const W = 420;
    const H = top + hL + 52;
    let s = `<polygon class="chip" points="${x0},${top} ${x1},${yc - hR / 2} ${x1},${yc + hR / 2} ${x0},${top + hL}"/>`;
    s += `<text class="csub" x="${x0 + 4}" y="${top - 8}">MUX ${NI}:1</text>`;
    o.data.forEach((v, k) => {
      const yy = yIn(k);
      const on = show && k === sel;
      s += `<line class="pin${v ? ' on' : ''}" x1="${x0 - 56}" y1="${yy}" x2="${x0}" y2="${yy}"/>`;
      s += `<text class="pval${v ? ' on' : ''}" x="${x0 - 64}" y="${yy + 4.5}" text-anchor="end">${v}</text>`;
      s += `<text class="plbl" x="${x0 + 7}" y="${yy + 4}">${sub('I', k)}</text>`;
      s += `<circle class="contact${on ? ' on' : ''}" cx="${x0 + 34}" cy="${yy}" r="3.5"/>`;
    });
    if (show) s += `<line class="wiper" x1="${x0 + 34}" y1="${yIn(sel)}" x2="${x1 - 16}" y2="${yc}"/>`;
    s += `<circle class="contact${show ? ' on' : ''}" cx="${x1 - 16}" cy="${yc}" r="4"/>`;
    s += `<line class="pin${show && y ? ' on' : ''}" x1="${x1 - 12}" y1="${yc}" x2="${x1 + 56}" y2="${yc}"/>`;
    s += `<text class="plbl" x="${x1 + 26}" y="${yc - 7}" text-anchor="middle">Y</text>`;
    if (show) s += `<text class="pval${y ? ' on' : ''}" x="${x1 + 64}" y="${yc + 4.5}">${y}</text><g class="led${y ? ' on' : ''}"><circle cx="${x1 + 92}" cy="${yc}" r="8"/></g>`;
    o.sels.forEach((q, i) => {
      const x = x0 + ((i + 1) * (x1 - x0)) / (ns + 1);
      s += `<line class="pin${q.v ? ' on' : ''}" x1="${x}" y1="${botY(x)}" x2="${x}" y2="${top + hL + 26}"/>`;
      s += `<text class="plbl" x="${x + 6}" y="${top + hL + 20}">${sub('S', q.name)}</text>`;
      s += `<text class="pval${q.v ? ' on' : ''}" x="${x}" y="${top + hL + 44}" text-anchor="middle">${q.v}</text>`;
    });
    return `<svg class="msi" viewBox="0 0 ${W} ${H}" role="img" style="max-width:${W}px"><title>Multiplexer ${NI}:1</title>${s}</svg>`;
  }

  /** Sommatore ripple-carry a 4 bit; con M = 1 i bit di B passano per uno XOR e C0 = 1. */
  function adderSVG(a, b, M, show) {
    const bb = M ? ~b & 15 : b;
    const r = Lg.rippleAdd(a, bb, 4, M);
    const W = 560;
    const H = 236;
    const bx = (k) => 60 + (3 - k) * 120;
    let s = '';
    for (let k = 3; k >= 0; k--) {
      const x = bx(k);
      const ak = (a >> k) & 1;
      const bk = (b >> k) & 1;
      const bk2 = (bb >> k) & 1;
      s += `<rect class="fa" x="${x}" y="88" width="80" height="62" rx="6"/><text class="cname" x="${x + 40}" y="124" text-anchor="middle">FA</text>`;
      s += `<line class="pin${ak ? ' on' : ''}" x1="${x + 22}" y1="40" x2="${x + 22}" y2="88"/>`;
      s += `<text class="wn" x="${x + 22}" y="13" text-anchor="middle">${sub('A', k)}</text><text class="pval${ak ? ' on' : ''}" x="${x + 22}" y="31" text-anchor="middle">${ak}</text>`;
      s += `<text class="wn" x="${x + 58}" y="13" text-anchor="middle">${sub('B', k)}</text><text class="pval${bk ? ' on' : ''}" x="${x + 58}" y="31" text-anchor="middle">${bk}</text>`;
      if (M) {
        s += `<line class="pin${bk ? ' on' : ''}" x1="${x + 58}" y1="40" x2="${x + 58}" y2="54"/><circle class="xor" cx="${x + 58}" cy="62" r="8"/><path class="xor" d="M${x + 50} 62 H${x + 66} M${x + 58} 54 V70"/>`;
        s += `<text class="wn" x="${x + 70}" y="58">M</text>`;
        s += `<line class="pin${bk2 ? ' on' : ''}" x1="${x + 58}" y1="70" x2="${x + 58}" y2="88"/><text class="cv${bk2 ? ' on' : ''}" x="${x + 64}" y="84">${bk2}</text>`;
      } else {
        s += `<line class="pin${bk ? ' on' : ''}" x1="${x + 58}" y1="40" x2="${x + 58}" y2="88"/>`;
      }
      // riporto che entra nello stadio k
      const ck = r.carries[k];
      const xs = k === 0 ? W - 14 : bx(k - 1);
      const xe = x + 80;
      s += `<line class="pin${(show || k === 0) && ck ? ' on' : ''}" x1="${xs}" y1="119" x2="${xe}" y2="119"/><polygon class="ahead" points="${xe + 7},115 ${xe},119 ${xe + 7},123"/>`;
      s += `<text class="wn" x="${(xs + xe) / 2 + 3}" y="110" text-anchor="middle">${sub('C', k)}</text>`;
      if (show || k === 0) s += `<text class="cv${ck ? ' on' : ''}" x="${(xs + xe) / 2 + 3}" y="138" text-anchor="middle">${ck}</text>`;
      // somma
      const sk = (r.sum >> k) & 1;
      s += `<line class="pin${show && sk ? ' on' : ''}" x1="${x + 40}" y1="150" x2="${x + 40}" y2="184"/>`;
      if (show) s += `<text class="pval${sk ? ' on' : ''}" x="${x + 40}" y="202" text-anchor="middle">${sk}</text>`;
      s += `<text class="wn" x="${x + 40}" y="222" text-anchor="middle">${sub('S', k)}</text>`;
    }
    const c4 = r.carries[4];
    s += `<line class="pin${show && c4 ? ' on' : ''}" x1="${bx(3)}" y1="119" x2="14" y2="119"/><polygon class="ahead" points="21,115 14,119 21,123"/>`;
    s += `<text class="wn" x="36" y="110" text-anchor="middle">${sub('C', 4)}</text>`;
    if (show) s += `<text class="cv${c4 ? ' on' : ''}" x="36" y="138" text-anchor="middle">${c4}</text>`;
    return `<svg class="msi" viewBox="0 0 ${W} ${H}" role="img" style="max-width:${W}px"><title>Sommatore a 4 bit ripple-carry</title>${s}</svg>`;
  }

  /** Display a 7 segmenti. on = segmenti accesi ('abcdefg'), o: { labels, sel, click } */
  const SEG_GEO = (() => {
    const t = 14;
    const L0 = 22;
    const R0 = 104;
    const T0 = 18;
    const M0 = 104;
    const B0 = 190;
    const g = 3;
    const hs = (x1, x2, y) => `${x1},${y} ${x1 + t / 2},${y - t / 2} ${x2 - t / 2},${y - t / 2} ${x2},${y} ${x2 - t / 2},${y + t / 2} ${x1 + t / 2},${y + t / 2}`;
    const vs = (x, y1, y2) => `${x},${y1} ${x + t / 2},${y1 + t / 2} ${x + t / 2},${y2 - t / 2} ${x},${y2} ${x - t / 2},${y2 - t / 2} ${x - t / 2},${y1 + t / 2}`;
    return {
      pts: { a: hs(L0 + g, R0 - g, T0), b: vs(R0, T0 + g, M0 - g), c: vs(R0, M0 + g, B0 - g), d: hs(L0 + g, R0 - g, B0), e: vs(L0, M0 + g, B0 - g), f: vs(L0, T0 + g, M0 - g), g: hs(L0 + g, R0 - g, M0) },
      lbl: { a: [63, T0 + 26], b: [R0 - 20, (T0 + M0) / 2 + 4], c: [R0 - 20, (M0 + B0) / 2 + 4], d: [63, B0 - 14], e: [L0 + 20, (M0 + B0) / 2 + 4], f: [L0 + 20, (T0 + M0) / 2 + 4], g: [63, M0 - 14] },
    };
  })();
  function segSVG(on, o = {}) {
    const W = 170;
    const H = 236;
    let s = `<rect class="dbody" x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12"/><g transform="translate(26,14) skewX(-5)">`;
    'abcdefg'.split('').forEach((k) => {
      s += `<polygon class="sg${on.includes(k) ? ' on' : ''}${o.sel === k ? ' sel' : ''}${o.click ? ' click' : ''}" data-s="${k}" points="${SEG_GEO.pts[k]}"><title>segmento ${k}</title></polygon>`;
      if (o.labels) s += `<text class="slbl" x="${SEG_GEO.lbl[k][0]}" y="${SEG_GEO.lbl[k][1]}" text-anchor="middle">${k}</text>`;
    });
    s += '</g>';
    return `<svg class="msi seg7" viewBox="0 0 ${W} ${H}" role="img" style="max-width:${o.w || W}px"><title>Display a 7 segmenti${on ? ': accesi ' + on.split('').join(', ') : ''}</title>${s}</svg>`;
  }

  // ---------- Controlli dei widget ----------
  function bitButtons(labels, state, onChange, weights) {
    const box = document.createElement('div');
    box.className = 'bits msi-bits';
    box.style.setProperty('--n', labels.length);
    box.innerHTML = labels.map((l, i) => `<button type="button" class="bit" data-i="${i}"><span class="w">${l}</span><span class="b">0</span>${weights ? `<span class="w2">${weights[i]}</span>` : ''}</button>`).join('');
    const paint = () => box.querySelectorAll('.bit').forEach((b, i) => {
      b.classList.toggle('on', !!state[i]);
      b.querySelector('.b').textContent = state[i] ? '1' : '0';
      b.setAttribute('aria-pressed', String(!!state[i]));
    });
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.bit');
      if (!b) return;
      const i = Number(b.dataset.i);
      state[i] = state[i] ? 0 : 1;
      paint();
      onChange();
    });
    paint();
    box.repaint = paint;
    return box;
  }
  function sw(label, on, onChange) {
    const t = document.createElement('label');
    t.className = 'switch';
    t.innerHTML = `<input type="checkbox"${on ? ' checked' : ''}><span class="track"></span><span>${label}</span>`;
    t.querySelector('input').addEventListener('change', (e) => onChange(e.target.checked));
    return t;
  }
  function group(cap, el) {
    const g = document.createElement('div');
    g.className = 'msi-grp';
    g.innerHTML = `<span class="msi-cap">${cap}</span>`;
    g.appendChild(el);
    return g;
  }
  const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const toNum = (arr) => arr.reduce((x, v) => x * 2 + v, 0);

  // =====================================================================
  // 1 — Decoder, demultiplexer ed encoder
  // =====================================================================
  const d1 = [];
  d1.push({
    id: 'dec-out', title: 'Quale uscita si accende?', level: 1,
    defaults: { n: 3, code: 5 },
    gen: () => { const n = pick([2, 3, 3]); return { n, code: rand(0, (1 << n) - 1) }; },
    solve: (p) => ({ NO: 1 << p.n, b: bin(p.code, p.n) }),
    text: (p, r) => `Un decoder ${p.n} → ${r.NO} (uscite attive alte, abilitato) riceve ${ABC.slice(0, p.n).map((x) => `<var>${x}</var>`).join(' ')} = ${bitsH(spaced(r.b))}, con <var>A</var> bit più significativo. Quale uscita va a 1? Quante restano a 0?`,
    fig: (p, r, sol) => ({ svg: decoderSVG({ n: p.n, ins: ABC.slice(0, p.n).map((x, i) => ({ name: x, v: Number(r.b[i]) })), ens: [{ name: 'EN', v: 1 }], active: p.code, show: sol }) }),
    asks: (p, r) => [h.choice('Uscita attiva', range(r.NO).map((k) => 'Y' + k), p.code), { label: 'Uscite a 0', unit: '', value: r.NO - 1 }],
    steps: (p, r) => step(`${bitsH(r.b)}<sub>2</sub> = ${r.b.split('').map((c, i) => c + '·' + (1 << (p.n - 1 - i))).join(' + ')} = ${p.code} → ${res(Y_(p.code) + ' = 1')}`, 'Il decoder legge gli ingressi come un numero binario e attiva l\'uscita che ha quel numero.') +
      step(`${Y_(p.code)} = ${mintH(p.n, p.code)} = <var>m</var><sub>${p.code}</sub>`, 'Ogni uscita è un mintermine: vale 1 solo per la sua combinazione di ingressi.') +
      step(`Le altre ${res(r.NO - 1)} uscite restano a 0.`, `In tutto le uscite sono 2<sup>${p.n}</sup> = ${r.NO}.`),
  });
  d1.push({
    id: 'dec-138', title: 'Il 74HC138 e i suoi enable', level: 2,
    gen: () => {
      const code = rand(0, 7);
      if (Math.random() < 0.6) return { code, g1: 1, g2a: 0, g2b: 0 };
      return L.nice(() => ({ code, g1: rand(0, 1), g2a: rand(0, 1), g2b: rand(0, 1) }), (q) => !(q.g1 === 1 && q.g2a === 0 && q.g2b === 0), { code, g1: 0, g2a: 0, g2b: 0 });
    },
    solve: (p) => ({ en: p.g1 === 1 && p.g2a === 0 && p.g2b === 0, b: bin(p.code, 3) }),
    text: (p, r) => `Un 74HC138 ha A<sub>2</sub> A<sub>1</sub> A<sub>0</sub> = ${bitsH(spaced(r.b))} (A<sub>2</sub> è il bit più significativo) e sugli ingressi di abilitazione G<sub>1</sub> = ${p.g1}, ${ovl('G')}<sub>2A</sub> = ${p.g2a}, ${ovl('G')}<sub>2B</sub> = ${p.g2b}. Il chip è abilitato? Quale uscita va a 0?`,
    fig: (p, r, sol) => ({ svg: decoderSVG({ n: 3, ins: [sub('A', 2), sub('A', 1), sub('A', 0)].map((x, i) => ({ name: x, v: Number(r.b[i]) })), ens: [{ name: sub('G', 1), v: p.g1 }, { name: sub('G', '2A'), v: p.g2a, neg: true }, { name: sub('G', '2B'), v: p.g2b, neg: true }], low: true, active: r.en ? p.code : -1, show: sol, title: '74HC138' }) }),
    asks: (p, r) => [yesno('Abilitato?', r.en), h.choice('Uscita a 0', [...range(8).map((k) => 'Y' + k), 'nessuna: tutte a 1'], r.en ? p.code : 8)],
    hint: () => 'Il 138 lavora solo con G1 = 1 e con i due G2 (attivi bassi, hanno il pallino) a 0. Le uscite sono attive basse: quella scelta va a 0.',
    steps: (p, r) => step(`Abilitazione: G<sub>1</sub> = 1 e ${ovl('G')}<sub>2A</sub> = ${ovl('G')}<sub>2B</sub> = 0? → ${res(r.en ? 'sì' : 'no')}`, r.en ? 'Le tre condizioni sono rispettate.' : 'Non va: ' + [p.g1 !== 1 ? 'G1 dovrebbe essere 1' : '', p.g2a !== 0 ? 'G2A dovrebbe essere 0' : '', p.g2b !== 0 ? 'G2B dovrebbe essere 0' : ''].filter(Boolean).join(', ') + '.') +
      (r.en
        ? step(`${bitsH(r.b)}<sub>2</sub> = ${p.code} → ${res(Y_(p.code, true) + ' = 0')}, le altre sette a 1`, 'Uscite attive basse: "attiva" vuol dire a 0, ed è quello che indica il pallino sul simbolo.')
        : step(`Disabilitato: ${res('tutte le uscite a 1')}, qualunque cosa ci sia su A<sub>2</sub> A<sub>1</sub> A<sub>0</sub>`, 'A riposo un\'uscita attiva bassa sta a 1. Tre enable servono a collegare più chip: ne lavora uno alla volta.')),
  });
  const rev3 = (k) => ((k & 1) << 2) | (k & 2) | ((k >> 2) & 1);
  const sortN = (a) => a.slice().sort((x, y) => x - y);
  const GATES = ['NAND', 'OR', 'AND', 'NOR'];
  d1.push({
    id: 'dec-func', title: 'Una funzione con decoder e porta', level: 2,
    gen: () => {
      const ones = L.nice(() => range(8).filter(() => Math.random() < 0.45), (s) => s.length >= 2 && s.length <= 5, [1, 3, 6]);
      const comp = range(8).filter((k) => !ones.includes(k));
      const filler = () => sortN(App.shuffle(range(8)).slice(0, ones.length));
      const { opts, ans } = optsFrom(ones, [sortN(ones.map(rev3)), sortN(ones.map((k) => (k + 1) % 8)), comp], filler, (s) => s.join(','));
      return { ones, opts, ans, m: rand(0, 2), go: App.shuffle([0, 1, 2, 3]) };
    },
    solve: (p) => { const outs = range(8).map((k) => (p.ones.includes(k) ? 1 : 0)); return { outs, sop: Lg.analyze(3, outs).sop }; },
    text: (p, r) => {
      const f = p.m === 0 ? `<var>F</var>(<var>A</var>, <var>B</var>, <var>C</var>) = Σ<var>m</var>(${p.ones.join(', ')})`
        : p.m === 1 ? `la funzione che nella tabella di verità (righe da 0 a 7, <var>A</var> bit più significativo) vale ${bitsH(spaced(r.outs.join('')))}`
          : `<var>F</var> = ${sopH(3, r.sop)}`;
      return `Vuoi realizzare ${f} con un decoder 3 → 8 (ingressi <var>A</var> <var>B</var> <var>C</var>, <var>A</var> più significativo) e una sola porta. Quali uscite colleghi alla porta? E se il decoder fosse un 74HC138, con le uscite attive basse, che porta useresti?`;
    },
    asks: (p) => [h.choice('Uscite da collegare', p.opts.map((s) => s.map((k) => 'Y' + k).join(', ')), p.ans), h.choice('Porta con il 74HC138', p.go.map((i) => GATES[i]), p.go.indexOf(0))],
    hint: () => 'Ogni uscita del decoder è un mintermine: cerca i mintermini della funzione.',
    steps: (p, r) => (p.m === 1 ? step(`Righe con <var>F</var> = 1: ${p.ones.join(', ')} → <var>F</var> = Σ<var>m</var>(${p.ones.join(', ')})`, 'Ogni riga della tabella è un mintermine.') : '') +
      (p.m === 2 ? step(r.sop.map((g) => `${App.productHTML(Lg.productLiterals(3, g))} → <var>m</var><sub>${Lg.cellsOf(3, g).join('</sub>, <var>m</var><sub>')}</sub>`).join('; '), 'Espandi ogni prodotto: le variabili che mancano possono valere 0 o 1, quindi ogni prodotto copre più righe.') : '') +
      step(`<var>F</var> = ${p.ones.map((k) => Y_(k)).join(' + ')} → ${res('OR a ' + p.ones.length + ' ingressi su ' + p.ones.map((k) => 'Y' + k).join(', '))}`, 'Il decoder fa i mintermini, la OR li somma: è la prima forma canonica costruita con i pezzi.') +
      step(`Con uscite attive basse ${Y_('k', true)} = ${ovl('<var>m</var><sub>k</sub>')}: <var>F</var> = ${ovl(p.ones.map((k) => ovl('<var>m</var><sub>' + k + '</sub>')).join(' · '))} → ${res('NAND')}`, 'De Morgan: una OR di segnali attivi alti equivale a una NAND degli stessi segnali negati.'),
  });
  d1.push({
    id: 'dec-size', title: 'Quanti ingressi, quante uscite', level: 1,
    gen: () => { const k = rand(0, 2); return k === 0 ? { k, n: rand(2, 5) } : k === 1 ? { k, D: pick([5, 6, 10, 12, 20, 30, 50, 64, 100, 200]) } : { k, n: pick([4, 5, 6]) }; },
    solve: (p) => (p.k === 0 ? { x: 1 << p.n } : p.k === 1 ? { x: Math.ceil(Math.log2(p.D) - 1e-9) } : { x: 1 << (p.n - 3) }),
    text: (p) => (p.k === 0 ? `Quante uscite ha un decoder con ${p.n} ingressi?`
      : p.k === 1 ? `Un microcontrollore deve selezionare uno alla volta ${p.D} dispositivi con un decoder. Quanti fili di indirizzo (ingressi del decoder) servono almeno?`
        : `Vuoi un decoder ${p.n} → ${1 << p.n} ma hai solo decoder 3 → 8 con ingresso di abilitazione. Quanti decoder 3 → 8 servono per avere tutte le uscite (senza contare l'eventuale decoder che pilota gli enable)?`),
    asks: (p, r) => [{ label: p.k === 0 ? 'Uscite' : p.k === 1 ? 'Ingressi' : 'Decoder 3 → 8', unit: '', value: r.x }],
    steps: (p, r) => (p.k === 0 ? step(`2<sup>${p.n}</sup> = ${res(r.x)}`, 'Con n bit si scrivono 2ⁿ numeri diversi: un\'uscita per ciascuno.')
      : p.k === 1 ? step(`2<sup>${r.x - 1}</sup> = ${1 << (r.x - 1)} < ${p.D} ≤ 2<sup>${r.x}</sup> = ${1 << r.x} → ${res(r.x + ' ingressi')}`, `Le uscite in più (${(1 << r.x) - p.D}) restano inutilizzate.`)
        : step(`${1 << p.n} uscite / 8 = ${res(r.x)}`, 'I 3 bit bassi vanno in parallelo a tutti i chip.') + step(p.n === 4 ? 'Il bit alto va su G1 di un chip e su G2A (attivo basso) dell\'altro: non serve altro.' : `I ${p.n - 3} bit alti entrano in un decoder ${p.n - 3} → ${1 << (p.n - 3)} che abilita un chip alla volta.`, 'È l\'espansione ad albero: si usa per indirizzare i banchi di memoria.')),
  });
  d1.push({
    id: 'enc-pri', title: 'Encoder a priorità', level: 2,
    gen: () => {
      const t = Math.random();
      if (t < 0.1) return { ins: Array(8).fill(0) };
      if (t < 0.35) { const a = Array(8).fill(0); a[rand(0, 7)] = 1; return { ins: a }; }
      return { ins: L.nice(() => range(8).map(() => (Math.random() < 0.35 ? 1 : 0)), (a) => a.filter(Boolean).length >= 2, [0, 1, 0, 0, 1, 0, 1, 0]) };
    },
    solve: (p) => { const k = Lg.priorityEncode(p.ins); return { k, code: k < 0 ? '000' : bin(k, 3), act: p.ins.map((v, j) => (v ? j : -1)).filter((j) => j >= 0) }; },
    text: (p) => `Un encoder a priorità 8 → 3 (ingressi e uscite attivi alti) riceve <var>I</var><sub>7</sub> … <var>I</var><sub>0</sub> = ${bitsH(spaced(p.ins.slice().reverse().join('')))}. Quanto valgono le uscite A<sub>2</sub> A<sub>1</sub> A<sub>0</sub> e l'uscita <var>V</var> (dato valido)?`,
    asks: (p, r) => [bitQ('A<sub>2</sub> A<sub>1</sub> A<sub>0</sub>', r.code, { ph: '3 bit' }), b01('<var>V</var>', r.k >= 0 ? 1 : 0)],
    hint: () => 'Leggi gli ingressi da sinistra: il primo 1 che trovi (quello di indice più alto) vince.',
    steps: (p, r) => (r.k < 0
      ? step(`Nessun ingresso attivo → A<sub>2</sub>A<sub>1</sub>A<sub>0</sub> = ${res('000')}, <var>V</var> = ${res(0)}`, 'Anche "I0 attivo" darebbe 000: è V a dire se il codice vale qualcosa.')
      : step(`Ingressi a 1: ${r.act.slice().reverse().map(I_).join(', ')} → vince ${I_(r.k)}`, r.act.length > 1 ? 'Gli altri hanno priorità più bassa e vengono ignorati.' : 'Un solo ingresso attivo: funziona come un encoder normale.') +
        step(`${r.k} = ${res(r.code)}, <var>V</var> = ${res(1)}`, 'L\'encoder fa il contrario del decoder: da una linea attiva al suo numero. Esempio tipico: una tastiera, o le richieste di interrupt.')),
  });
  d1.push({
    id: 'dec-mc', title: 'Concetti su decoder ed encoder', level: 1,
    ...mc([
      ['Un decoder con 4 ingressi ha…', ['16 uscite', '8 uscite', '4 uscite', '32 uscite'], '2⁴ = 16: un\'uscita per ogni combinazione.'],
      ['Ogni uscita di un decoder n → 2ⁿ corrisponde a…', ['un mintermine degli ingressi', 'un maxtermine degli ingressi', 'una porta XOR', 'un bit di riporto'], 'L\'uscita k vale 1 solo per la combinazione k: è il mintermine mₖ.'],
      ['Un demultiplexer è, in pratica,…', ['un decoder che usa l\'enable come ingresso dati', 'un multiplexer con le uscite negate', 'un encoder a priorità', 'un sommatore senza riporto'], 'Il dato sull\'enable compare solo sull\'uscita selezionata: è lo stesso circuito.'],
      ['Nel 74HC138 l\'uscita selezionata…', ['va a 0, perché le uscite sono attive basse', 'va a 1', 'va in alta impedenza', 'oscilla tra 0 e 1'], 'Il pallino sulle uscite indica che sono attive basse.'],
      ['Un encoder a priorità con due ingressi attivi insieme…', ['codifica quello di indice più alto', 'codifica quello di indice più basso', 'segnala un errore', 'dà la somma dei due indici'], 'È proprio il senso della "priorità": l\'ingresso più importante vince.'],
      ['A che cosa serve l\'uscita V (o GS) di un encoder?', ['a distinguere "I0 attivo" da "nessun ingresso attivo"', 'a raddoppiare la velocità', 'a indicare il riporto', 'ad abilitare il display'], 'In entrambi i casi il codice è 000: solo V dice se è valido.'],
    ]),
  });

  function widgetDecoder(host) {
    const c = K.widgetCard('Il decoder 3 → 8', 'Cambia gli ingressi: si accende una sola uscita');
    const st = [1, 0, 1];
    let en = 1;
    let low = false;
    const fig = el('div', 'msi-fig');
    const out = el('p', 'f widget-out');
    const note = el('p', 'hint');
    const ctl = el('div', 'msi-ctl');
    const draw = () => {
      const code = toNum(st);
      fig.innerHTML = decoderSVG({ n: 3, ins: ABC.slice(0, 3).map((x, i) => ({ name: x, v: st[i], w: 4 >> i })), ens: [{ name: 'EN', v: en }], low, active: en ? code : -1, show: true, mint: true });
      out.innerHTML = en
        ? `<var>A</var><var>B</var><var>C</var> = ${bitsH(bin(code, 3))} = ${code} → ${Y_(code, low)} = ${low ? 0 : 1}, cioè <var>m</var><sub>${code}</sub> = ${mintH(3, code)}`
        : `EN = 0: nessuna uscita attiva, tutte a ${low ? 1 : 0}.`;
      note.innerHTML = low
        ? 'Uscite attive basse, come nel 74HC138: l\'uscita scelta va a 0 e le altre stanno a 1 (è quello che dice il pallino). Il LED segna l\'uscita attiva.'
        : 'Ogni uscita è un mintermine degli ingressi: unendo con una OR le uscite giuste ottieni qualsiasi funzione di tre variabili. Se sull\'EN mandi un dato, l\'uscita scelta lo copia: il decoder diventa un demultiplexer.';
    };
    ctl.append(group('Ingressi', bitButtons(ABC.slice(0, 3), st, draw, ['4', '2', '1'])), sw('Abilitato (EN = 1)', true, (v) => { en = v ? 1 : 0; draw(); }), sw('Uscite attive basse', false, (v) => { low = v; draw(); }));
    c.append(ctl, fig, out, note);
    host.appendChild(c);
    draw();
  }

  function widgetEncoder(host) {
    const c = K.widgetCard('L\'encoder a priorità 8 → 3', 'Accendi più ingressi: vince quello di indice più alto');
    const st = [0, 0, 1, 0, 0, 1, 0, 0]; // posizione 0 = I7
    const outRow = el('div', 'msi-outrow');
    const out = el('p', 'hint');
    let box;
    const draw = () => {
      const ins = st.slice().reverse();
      const k = Lg.priorityEncode(ins);
      const code = k < 0 ? 0 : k;
      box.querySelectorAll('.bit').forEach((b, pos) => {
        const idx = 7 - pos;
        b.classList.toggle('win', idx === k);
        b.classList.toggle('ign', k >= 0 && idx < k && st[pos] === 1);
      });
      outRow.innerHTML = '<span class="msi-cap">Uscite</span>' + [2, 1, 0].map((i) => { const v = (code >> i) & 1; return `<span class="bit ro${v ? ' on' : ''}"><span class="w">A<sub>${i}</sub></span><span class="b">${v}</span></span>`; }).join('') +
        `<span class="bit ro${k >= 0 ? ' on' : ''}"><span class="w">V</span><span class="b">${k >= 0 ? 1 : 0}</span></span>`;
      const low = ins.map((v, j) => (v && j < k ? j : -1)).filter((j) => j >= 0);
      out.innerHTML = k < 0
        ? 'Nessun ingresso attivo: le uscite danno 000 ma con <var>V</var> = 0, quindi il codice non vale.'
        : `Il più alto attivo è ${I_(k)} → ${bitsH(bin(k, 3))} con <var>V</var> = 1.` + (low.length ? ` ${low.map(I_).join(', ')} ${low.length > 1 ? 'vengono ignorati' : 'viene ignorato'}: ha${low.length > 1 ? 'nno' : ''} priorità più bassa.` : '');
    };
    box = bitButtons(range(8).map((p) => `I<sub>${7 - p}</sub>`), st, draw);
    const sc = el('div', 'bits-scroll');
    sc.appendChild(box);
    c.append(group('Ingressi', sc), outRow, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'decoder', num: 1, short: 'Decoder', title: 'Decoder, demultiplexer ed encoder',
    intro: 'I circuiti integrati MSI (media scala di integrazione) mettono in un solo chip funzioni combinatorie complete. Il decoder trasforma un numero binario in una linea attiva su tante; l\'encoder fa il contrario.',
    goals: ['Decoder n → 2ⁿ', 'Enable e uscite attive basse', 'Funzioni con decoder + OR', 'Encoder a priorità'],
    widgets: [widgetDecoder, widgetEncoder],
    example: d1[0], exampleTitle: 'Esempio: l\'uscita attiva di un decoder',
    families: d1,
    theory: `
      <article class="note"><h4>Decoder</h4>
        <p>Ha <var>n</var> ingressi e 2<sup><var>n</var></sup> uscite: si attiva solo l'uscita che ha per indice il numero scritto sugli ingressi. Ogni uscita è quindi un <strong>mintermine</strong>: per un 2 → 4, ${Y_(0)} = ${mintH(2, 0)}, ${Y_(1)} = ${mintH(2, 1)}, ${Y_(2)} = ${mintH(2, 2)}, ${Y_(3)} = ${mintH(2, 3)}.</p>
        <p>L'ingresso di <strong>abilitazione</strong> (enable) accende o spegne tutto il chip. Se sull'enable arriva un dato, l'uscita selezionata lo copia: il decoder diventa un <strong>demultiplexer</strong>, che smista un segnale su più linee.</p></article>
      <article class="note"><h4>Il 74HC138</h4>
        <ul><li>Decoder 3 → 8: ingressi A<sub>2</sub> A<sub>1</sub> A<sub>0</sub> (A<sub>2</sub> il più significativo; su alcuni datasheet si chiamano C B A, con C il più significativo).</li>
          <li>Tre enable: G<sub>1</sub> attivo alto, ${ovl('G')}<sub>2A</sub> e ${ovl('G')}<sub>2B</sub> attivi bassi. Funziona solo con G<sub>1</sub> = 1 e ${ovl('G')}<sub>2A</sub> = ${ovl('G')}<sub>2B</sub> = 0.</li>
          <li>Uscite <strong>attive basse</strong> ${Y_(0, true)} … ${Y_(7, true)}: quella selezionata va a 0. Due 138 con il bit più alto su G<sub>1</sub> dell'uno e su ${ovl('G')}<sub>2A</sub> dell'altro fanno un decoder 4 → 16.</li></ul></article>
      <article class="note"><h4>Funzioni con un decoder</h4>
        <p>Una funzione in forma canonica è una somma di mintermini, e il decoder li fornisce tutti: basta una OR sulle uscite giuste. Con le uscite attive basse si usa una NAND (De Morgan): <var>F</var> = Σ<var>m</var>(1, 3, 6) = ${ovl(ovl('<var>Y</var><sub>1</sub>') + ' · ' + ovl('<var>Y</var><sub>3</sub>') + ' · ' + ovl('<var>Y</var><sub>6</sub>'))}. Ripassa le <a href="#karnaugh" data-route="karnaugh">forme canoniche</a>.</p></article>
      <article class="note"><h4>Encoder a priorità</h4>
        <p>Ha 2<sup><var>n</var></sup> ingressi e <var>n</var> uscite: dà il numero dell'ingresso attivo. Se ne sono attivi più di uno vince quello di indice più alto. L'uscita <var>V</var> (o GS, group select) dice se almeno un ingresso è attivo. Il 74HC148 è un 8 → 3 con ingressi e uscite attivi bassi.</p></article>`,
  });

  // =====================================================================
  // 2 — Multiplexer
  // =====================================================================
  const m2 = [];
  const dataList = (d) => `<var>I</var><sub>0</sub> … <var>I</var><sub>${d.length - 1}</sub> = ${bitsH(spaced(d.join('')))}`;
  const selNames = (n) => range(n).map((i) => `S<sub>${n - 1 - i}</sub>`).join(' ');
  const selArr = (n, sel) => range(n).map((i) => ({ name: n - 1 - i, v: (sel >> (n - 1 - i)) & 1 }));
  m2.push({
    id: 'mux-out', title: 'Che cosa esce dal multiplexer?', level: 1,
    defaults: { n: 2, data: [1, 0, 0, 1], sel: 2 },
    gen: () => { const n = pick([2, 3]); return { n, data: range(1 << n).map(() => rand(0, 1)), sel: rand(0, (1 << n) - 1) }; },
    solve: (p) => ({ y: p.data[p.sel], sb: bin(p.sel, p.n) }),
    text: (p, r) => `Un multiplexer ${1 << p.n}:1 ha sugli ingressi dati ${dataList(p.data)} e sulle selezioni ${selNames(p.n)} = ${bitsH(spaced(r.sb))}. Quale ingresso arriva all'uscita, e quanto vale <var>Y</var>?`,
    fig: (p, r, sol) => ({ svg: muxSVG({ data: p.data, sels: selArr(p.n, p.sel), show: sol }) }),
    asks: (p, r) => [h.choice('Ingresso selezionato', p.data.map((_, k) => 'I' + k), p.sel), b01('<var>Y</var>', r.y)],
    steps: (p, r) => step(`${selNames(p.n)} = ${bitsH(r.sb)}<sub>2</sub> = ${p.sel} → passa ${I_(p.sel)}`, 'Le selezioni sono un numero binario: scelgono quale ingresso collegare all\'uscita, come un commutatore rotativo.') +
      step(`<var>Y</var> = ${I_(p.sel)} = ${res(r.y)}`, 'Gli altri ingressi, qualunque valore abbiano, non contano.'),
  });
  m2.push({
    id: 'mux-ser', title: 'Da parallelo a seriale', level: 2,
    gen: () => {
      const n = pick([2, 3]);
      const data = L.nice(() => range(1 << n).map(() => rand(0, 1)), (d) => d.some(Boolean) && !d.every(Boolean) && d.join('') !== d.slice().reverse().join(''), n === 2 ? [1, 1, 0, 1] : [1, 0, 1, 1, 0, 0, 1, 0]);
      return { n, data, down: Math.random() < 0.35 };
    },
    solve: (p) => { const order = p.data.map((_, k) => (p.down ? p.data.length - 1 - k : k)); return { order, seq: order.map((k) => p.data[k]).join('') }; },
    text: (p) => `Sugli ingressi di un multiplexer ${1 << p.n}:1 c'è un dato parallelo: ${dataList(p.data)}. Un contatore collegato alle selezioni ${p.down ? 'parte da ' + ((1 << p.n) - 1) + ' e scende' : 'parte da 0 e sale'} di un passo a ogni impulso di clock. Scrivi i bit che escono da <var>Y</var>, nell'ordine in cui escono.`,
    asks: (p, r) => [bitQ('Sequenza su <var>Y</var>', r.seq, { exact: true, ph: (1 << p.n) + ' bit' })],
    hint: (p) => `A ogni clock la selezione vale ${p.down ? (1 << p.n) - 1 + ', ' + ((1 << p.n) - 2) + ', …' : '0, 1, 2, …'}: guarda quale ingresso esce ogni volta.`,
    steps: (p, r) => step(`Selezione: ${r.order.join(', ')} → escono ${r.order.map(I_).join(', ')}`, `Il contatore ${p.down ? 'all\'indietro' : 'in avanti'} fa scorrere il commutatore su tutti gli ingressi.`) +
      step(`<var>Y</var> = ${res(bitsH(spaced(r.seq)))}`, 'È un convertitore parallelo-seriale: gli stessi bit, prima su più fili insieme, ora su un filo solo uno dopo l\'altro. È l\'idea alla base delle trasmissioni seriali (UART, USB…).'),
  });
  m2.push({
    id: 'mux-f8', title: 'Una funzione con il mux 8:1', level: 2,
    gen: () => ({ outs: L.nice(() => range(8).map(() => rand(0, 1)), (o) => { const s = o.filter(Boolean).length; return s >= 2 && s <= 6; }, [0, 1, 1, 0, 1, 0, 0, 1]), m: rand(0, 1) }),
    solve: (p) => ({ ones: range(8).filter((k) => p.outs[k]), sop: Lg.analyze(3, p.outs).sop }),
    text: (p, r) => `Realizza ${p.m === 0 ? `<var>F</var>(<var>A</var>, <var>B</var>, <var>C</var>) = Σ<var>m</var>(${r.ones.join(', ')})` : `<var>F</var> = ${sopH(3, r.sop)}`} con un multiplexer 8:1 (come il 74HC151), collegando <var>A</var> <var>B</var> <var>C</var> alle selezioni S<sub>2</sub> S<sub>1</sub> S<sub>0</sub>. Che cosa colleghi a ogni ingresso dati? Scrivi i valori di <var>I</var><sub>0</sub> … <var>I</var><sub>7</sub> di seguito (1 = V<sub>CC</sub>, 0 = massa).`,
    asks: (p) => [bitQ('<var>I</var><sub>0</sub> … <var>I</var><sub>7</sub>', p.outs.join(''), { exact: true, ph: '8 bit, da I0 a I7' })],
    hint: () => 'Con le variabili sulle selezioni, la combinazione k sceglie l\'ingresso Iₖ: su Iₖ va il valore di F nella riga k.',
    steps: (p, r) => (p.m === 1 ? step(r.sop.map((g) => `${App.productHTML(Lg.productLiterals(3, g))} → ${Lg.cellsOf(3, g).join(', ')}`).join('; ') + ` → Σ<var>m</var>(${r.ones.join(', ')})`, 'Prima espandi la funzione nei suoi mintermini.') : '') +
      step(`<var>I</var><sub><var>k</var></sub> = <var>F</var>(<var>k</var>): ${res(bitsH(spaced(p.outs.join(''))))}`, 'Ogni ingresso dati è una riga della tabella di verità: il mux "legge" la tabella alla riga indicata dalle variabili.') +
      step(`Ingressi a V<sub>CC</sub>: ${r.ones.map(I_).join(', ')}; gli altri a massa`, 'Niente semplificazione: con un mux 2ⁿ:1 si realizza qualunque funzione di n variabili.'),
  });
  const PAIR = ['0', '1', 'C', 'C̅'];
  const PAIR_H = ['0', '1', '<var>C</var>', ovl('<var>C</var>')];
  m2.push({
    id: 'mux-f4', title: 'Tre variabili con un mux 4:1', level: 3,
    defaults: { outs: [0, 1, 1, 1, 1, 0, 0, 0], m: 0 },
    gen: () => ({ outs: L.nice(() => range(8).map(() => rand(0, 1)), (o) => [0, 1, 2, 3].filter((k) => o[2 * k] !== o[2 * k + 1]).length >= 2, [0, 1, 1, 1, 1, 0, 0, 0]), m: rand(0, 2) }),
    solve: (p) => ({
      ik: [0, 1, 2, 3].map((k) => { const f0 = p.outs[2 * k]; const f1 = p.outs[2 * k + 1]; return f0 === f1 ? f0 : f1 ? 2 : 3; }),
      ones: range(8).filter((k) => p.outs[k]),
      sop: Lg.analyze(3, p.outs).sop,
    }),
    text: (p, r) => {
      const f = p.m === 0 ? `<var>F</var>(<var>A</var>, <var>B</var>, <var>C</var>) = Σ<var>m</var>(${r.ones.join(', ')})`
        : p.m === 1 ? `la funzione che nella tabella di verità (righe da 0 a 7) vale ${bitsH(spaced(p.outs.join('')))}`
          : `<var>F</var> = ${sopH(3, r.sop)}`;
      return `Realizza ${f} con un solo multiplexer 4:1: <var>A</var> va su S<sub>1</sub>, <var>B</var> su S<sub>0</sub>, e sugli ingressi dati puoi mettere 0, 1, <var>C</var> oppure ${ovl('<var>C</var>')}. Che cosa colleghi a <var>I</var><sub>0</sub> … <var>I</var><sub>3</sub>?`;
    },
    asks: (p, r) => r.ik.map((v, k) => h.choice(I_(k), PAIR, v)),
    hint: () => 'Dividi la tabella in coppie di righe con gli stessi A e B: guarda come cambia F quando C passa da 0 a 1.',
    steps: (p, r) => (p.m === 2 ? step(`Espandi: <var>F</var> = Σ<var>m</var>(${r.ones.join(', ')})`, 'Ogni prodotto copre le righe in cui vale 1.') : '') +
      [0, 1, 2, 3].map((k) => step(`<var>A</var><var>B</var> = ${bin(k, 2)}: righe ${2 * k} e ${2 * k + 1} → <var>F</var> = ${p.outs[2 * k]}, ${p.outs[2 * k + 1]} → ${I_(k)} = ${res(PAIR_H[r.ik[k]])}`, k === 0 ? 'Nella coppia C vale prima 0 e poi 1: se F è uguale in tutte e due le righe è una costante, se segue C è C, se fa il contrario è C negato.' : '')).join('') +
      step('Servono solo il mux e una porta NOT per avere ' + ovl('<var>C</var>') + '.', 'Un mux 2ⁿ:1 realizza qualunque funzione di n + 1 variabili: è il trucco usato anche nelle FPGA, che sono fatte di piccoli multiplexer.'),
  });
  m2.push({
    id: 'mux-size', title: 'Selezioni e alberi di mux', level: 1,
    gen: () => { const k = rand(0, 3); return { k, n: k === 3 ? pick([4, 6]) : k === 2 ? pick([2, 3, 4]) : pick([3, 4, 5, 6]) }; },
    solve: (p) => ({ x: p.k === 0 ? p.n : p.k === 1 ? 1 << p.n : p.k === 2 ? (1 << p.n) - 1 : ((1 << p.n) - 1) / 3 }),
    text: (p) => [
      `Quante linee di selezione ha un multiplexer ${1 << p.n}:1?`,
      `Un multiplexer ha ${p.n} linee di selezione. Quanti ingressi dati può avere?`,
      `Hai solo multiplexer 2:1. Quanti ne servono per costruire, ad albero, un ${1 << p.n}:1?`,
      `Hai solo multiplexer 4:1. Quanti ne servono per costruire, ad albero, un ${1 << p.n}:1?`,
    ][p.k],
    asks: (p, r) => [{ label: ['Selezioni', 'Ingressi', 'Mux 2:1', 'Mux 4:1'][p.k], unit: '', value: r.x }],
    steps: (p, r) => [
      step(`${1 << p.n} = 2<sup>${p.n}</sup> → ${res(p.n)} selezioni`, 'Con n bit di selezione si sceglie fra 2ⁿ ingressi.'),
      step(`2<sup>${p.n}</sup> = ${res(1 << p.n)} ingressi`),
      step(`${1 << (p.n - 1)} + ${p.n > 2 ? range(p.n - 1).map((i) => 1 << (p.n - 2 - i)).join(' + ') : '1'} = ${res(r.x)}`, 'Il primo livello dimezza gli ingressi, il secondo li dimezza ancora… fino a un solo mux. In generale servono N − 1 mux 2:1.'),
      step(`${p.n === 4 ? '4 + 1' : '16 + 4 + 1'} = ${res(r.x)}`, 'Ogni livello divide per quattro: il primo usa i 2 bit bassi di selezione, il successivo i 2 bit dopo.'),
    ][p.k],
  });
  m2.push({
    id: 'mux-mc', title: 'Concetti sul multiplexer', level: 1,
    ...mc([
      ['Un multiplexer…', ['porta su un\'unica uscita uno fra più ingressi', 'distribuisce un ingresso su più uscite', 'somma i suoi ingressi', 'memorizza un bit'], 'È un commutatore comandato dalle selezioni. Il contrario è il demultiplexer.'],
      ['Con un mux 8:1 e nient\'altro si può realizzare…', ['qualsiasi funzione di 3 variabili', 'solo funzioni di 2 variabili', 'qualsiasi funzione di 8 variabili', 'solo le porte AND e OR'], 'Gli ingressi dati sono la colonna della tabella di verità.'],
      ['Nel 74HC151, se l\'enable (attivo basso) è a 1…', ['l\'uscita Y resta a 0 qualunque sia la selezione', 'passa sempre l\'ingresso I0', 'l\'uscita va a 1', 'il chip si danneggia'], 'Disabilitato, il chip "chiude" l\'uscita: serve per mettere più mux in parallelo.'],
      ['Un mux con un contatore sulle selezioni trasforma…', ['un dato parallelo in una sequenza seriale', 'un dato seriale in uno parallelo', 'una tensione in una corrente', 'un numero in complemento a 2'], 'A ogni passo del contatore esce un bit diverso.'],
      ['Il 74HC157 contiene…', ['quattro multiplexer 2:1 con la selezione in comune', 'un multiplexer 16:1', 'un decoder 3 → 8', 'un sommatore a 4 bit'], 'Serve a scegliere fra due parole di 4 bit: per esempio fra due numeri da mandare a un display.'],
    ]),
  });

  function widgetMux(host) {
    const c = K.widgetCard('Il multiplexer 4:1', 'Le selezioni scelgono quale ingresso arriva all\'uscita');
    const data = [1, 0, 1, 1];
    const sel = [1, 0];
    const hist = [];
    const fig = el('div', 'msi-fig');
    const out = el('p', 'f widget-out');
    const note = el('p', 'hint');
    const ctl = el('div', 'msi-ctl');
    const play = el('button', 'btn ghost small');
    play.type = 'button';
    const LBL = '▶ Fai scorrere la selezione';
    play.textContent = LBL;
    let timer = null;
    let bS;
    const S1 = (neg) => S_(1, neg);
    const S0 = (neg) => S_(0, neg);
    const draw = () => {
      const code = toNum(sel);
      fig.innerHTML = muxSVG({ data, sels: [{ name: 1, v: sel[0] }, { name: 0, v: sel[1] }], show: true });
      out.innerHTML = '<var>Y</var> = ' + [0, 1, 2, 3].map((k) => { const t = `${S1(!(k & 2))}${S0(!(k & 1))}${I_(k)}`; return k === code ? `<span class="hlterm">${t}</span>` : t; }).join(' + ');
      note.innerHTML = `S<sub>1</sub>S<sub>0</sub> = ${bitsH(bin(code, 2))} = ${code}: solo il termine evidenziato può valere 1, quindi <var>Y</var> = ${I_(code)} = ${data[code]}.` + (hist.length ? ` Uscita nel tempo: <span class="mono">${hist.join(' ')}</span>` : '');
    };
    const stop = () => { if (timer) clearInterval(timer); timer = null; play.textContent = LBL; };
    play.addEventListener('click', () => {
      if (timer) { stop(); return; }
      let n = 0;
      hist.length = 0;
      const go = () => { sel[0] = n >> 1; sel[1] = n & 1; bS.repaint(); hist.push(data[n]); draw(); };
      go();
      play.textContent = '■ Ferma';
      timer = setInterval(() => { n++; if (n > 3) { stop(); return; } go(); }, 900);
    });
    bS = bitButtons(['S<sub>1</sub>', 'S<sub>0</sub>'], sel, () => { stop(); hist.length = 0; draw(); });
    ctl.append(group('Ingressi dati', bitButtons(range(4).map((k) => `I<sub>${k}</sub>`), data, () => { hist.length = 0; draw(); })), group('Selezioni', bS), play);
    c.append(ctl, fig, out, note);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'mux', num: 2, short: 'Multiplexer', title: 'Il multiplexer',
    intro: 'Il multiplexer è un commutatore elettronico: le linee di selezione scelgono quale fra tanti ingressi arriva all\'unica uscita. Con lo stesso chip si realizzano funzioni logiche e si trasformano dati paralleli in seriali.',
    goals: ['Mux 2ⁿ:1', 'Espressione dell\'uscita', 'Funzioni con il mux', 'Parallelo → seriale'],
    widgets: [widgetMux],
    example: m2.find((f) => f.id === 'mux-f4'), exampleTitle: 'Esempio: tre variabili con un mux 4:1',
    families: m2,
    theory: `
      <article class="note"><h4>Come funziona</h4>
        <p>Un mux 2<sup><var>n</var></sup>:1 ha 2<sup><var>n</var></sup> ingressi dati, <var>n</var> selezioni e un'uscita. Per il 4:1:</p>
        <div class="eq"><span><var>Y</var> = ${S_(1, true)}${S_(0, true)}${I_(0)} + ${S_(1, true)}${S_(0)}${I_(1)} + ${S_(1)}${S_(0, true)}${I_(2)} + ${S_(1)}${S_(0)}${I_(3)}</span></div>
        <p>Per ogni selezione un solo prodotto può valere 1: quello dell'ingresso scelto. È la stessa struttura del decoder, con un ingresso dati in più in ogni prodotto.</p></article>
      <article class="note"><h4>Chip tipici</h4>
        <ul><li><strong>74HC151</strong>: 8:1, enable ${ovl('E')} attivo basso, uscita <var>Y</var> e la sua negata.</li>
          <li><strong>74HC153</strong>: due 4:1 con le selezioni in comune.</li>
          <li><strong>74HC157</strong>: quattro 2:1, per scegliere fra due parole di 4 bit.</li></ul></article>
      <article class="note"><h4>Funzioni con il mux</h4>
        <ul><li>Mux 2<sup><var>n</var></sup>:1 e <var>n</var> variabili: le variabili vanno sulle selezioni e sugli ingressi si mette la colonna della tabella di verità (0 a massa, 1 a V<sub>CC</sub>).</li>
          <li>Mux 2<sup><var>n</var></sup>:1 e <var>n</var> + 1 variabili: le prime <var>n</var> sulle selezioni; per ogni coppia di righe l'ingresso vale 0, 1, l'ultima variabile o la sua negata.</li></ul></article>
      <article class="note"><h4>Parallelo → seriale</h4>
        <p>Con un contatore sulle selezioni, i bit presenti insieme sugli ingressi escono uno dopo l'altro su un solo filo. All'arrivo un demultiplexer, sincronizzato con lo stesso contatore, li rimette in parallelo: è il principio della multiplazione a divisione di tempo.</p></article>`,
  });

  // =====================================================================
  // 3 — Sommatori e sottrattori
  // =====================================================================
  const a3 = [];
  a3.push({
    id: 'add-fa', title: 'Half adder e full adder', level: 1,
    gen: () => ({ half: Math.random() < 0.3, a: rand(0, 1), b: rand(0, 1), c: rand(0, 1) }),
    solve: (p) => { const t = p.a + p.b + (p.half ? 0 : p.c); return { s: t & 1, co: t >> 1, t }; },
    text: (p) => (p.half ? `Un half adder riceve <var>A</var> = ${p.a} e <var>B</var> = ${p.b}. Quanto valgono la somma <var>S</var> e il riporto <var>C</var>?` : `Un full adder riceve <var>A</var> = ${p.a}, <var>B</var> = ${p.b} e il riporto in ingresso <var>C</var><sub>in</sub> = ${p.c}. Quanto valgono <var>S</var> e <var>C</var><sub>out</sub>?`),
    asks: (p, r) => [b01('<var>S</var>', r.s), b01(p.half ? '<var>C</var>' : '<var>C</var><sub>out</sub>', r.co)],
    steps: (p, r) => step(`Conta gli 1 in ingresso: ${r.t} = ${bitsH(bin(r.t, 2))}<sub>2</sub>`, 'Un sommatore a 1 bit conta gli 1: il bit basso del conteggio è la somma, quello alto è il riporto.') +
      step(`<var>S</var> = <var>A</var> ⊕ <var>B</var>${p.half ? '' : ' ⊕ <var>C</var><sub>in</sub>'} = ${res(r.s)}`, 'Lo XOR vale 1 quando gli 1 sono in numero dispari.') +
      step(p.half ? `<var>C</var> = <var>A</var> · <var>B</var> = ${res(r.co)}` : `<var>C</var><sub>out</sub> = <var>A</var><var>B</var> + <var>C</var><sub>in</sub>(<var>A</var> ⊕ <var>B</var>) = ${res(r.co)}`, 'Il riporto vale 1 quando almeno due ingressi sono a 1.'),
  });
  a3.push({
    id: 'add-4', title: 'Somma binaria a 4 bit', level: 1,
    gen: () => ({ a: rand(1, 15), b: rand(1, 15), m: rand(0, 1) }),
    solve: (p) => { const s = p.a + p.b; return { s, sw: bin(s, s > 15 ? 5 : 4) }; },
    text: (p) => (p.m === 0
      ? `Somma in colonna <var>A</var> = ${bitsH(bin(p.a, 4))} e <var>B</var> = ${bitsH(bin(p.b, 4))}. Scrivi il risultato in binario (con l'eventuale riporto finale) e in decimale.`
      : `Con un sommatore a 4 bit vuoi calcolare ${p.a} + ${p.b}. Scrivi i due addendi in binario a 4 bit e poi il risultato, con l'eventuale riporto finale.`),
    asks: (p, r) => (p.m === 0
      ? [bitQ('<var>A</var> + <var>B</var>', r.sw), { label: 'In decimale', unit: '', value: r.s }]
      : [bitQ('<var>A</var>', bin(p.a, 4), { exact: true, ph: '4 bit' }), bitQ('<var>B</var>', bin(p.b, 4), { exact: true, ph: '4 bit' }), bitQ('<var>A</var> + <var>B</var>', r.sw)]),
    steps: (p, r) => (p.m === 1 ? step(`${p.a} = ${bitsH(bin(p.a, 4))}, ${p.b} = ${bitsH(bin(p.b, 4))}`, 'Pesi 8, 4, 2, 1.') : '') +
      step('Da destra, colonna per colonna: 0 + 1 = 1; 1 + 1 = 10, scrivo 0 e riporto 1; 1 + 1 + 1 = 11, scrivo 1 e riporto 1.', 'Le regole sono quelle della somma decimale, con la base 2 al posto della base 10.') +
      step(`Risultato: ${res(bitsH(r.sw))} = ${r.s}`, r.s > 15 ? 'Il risultato supera 15 e con 4 bit non ci sta: il quinto bit è il riporto finale C4 = 1.' : 'Il risultato sta in 4 bit: il riporto finale C4 vale 0.'),
    table: (p) => colTable(p.a, p.b, 4, 0),
  });
  a3.push({
    id: 'add-carry', title: 'Segui i riporti', level: 2,
    gen: () => L.nice(() => ({ a: rand(1, 15), b: rand(1, 15) }), (p) => Lg.rippleAdd(p.a, p.b, 4).carries.slice(1).filter(Boolean).length >= 2, { a: 11, b: 7 }),
    solve: (p) => { const r = Lg.rippleAdd(p.a, p.b, 4); return { r, cw: [4, 3, 2, 1].map((k) => r.carries[k]).join(''), sw: bin(r.sum, 4) }; },
    text: (p) => `In un sommatore ripple-carry a 4 bit entrano <var>A</var> = ${bitsH(bin(p.a, 4))} e <var>B</var> = ${bitsH(bin(p.b, 4))}, con C<sub>0</sub> = 0. Quanto valgono i riporti tra uno stadio e l'altro, e le uscite di somma?`,
    fig: (p, r, sol) => ({ svg: adderSVG(p.a, p.b, 0, sol) }),
    asks: (p, r) => [bitQ('C<sub>4</sub> C<sub>3</sub> C<sub>2</sub> C<sub>1</sub>', r.cw, { exact: true, ph: '4 bit' }), bitQ('S<sub>3</sub> S<sub>2</sub> S<sub>1</sub> S<sub>0</sub>', r.sw, { exact: true, ph: '4 bit' })],
    hint: () => 'Parti dallo stadio 0 (a destra): ogni full adder somma A, B e il riporto che arriva dallo stadio precedente.',
    steps: (p, r) => [0, 1, 2, 3].map((k) => { const ak = (p.a >> k) & 1; const bk = (p.b >> k) & 1; const ck = r.r.carries[k]; const t = ak + bk + ck; return step(`Stadio ${k}: ${ak} + ${bk} + ${ck} = ${t} → S<sub>${k}</sub> = ${t & 1}, C<sub>${k + 1}</sub> = ${t >> 1}`, k === 0 ? 'Ogni stadio deve aspettare il riporto del precedente: per questo si chiama ripple, "a onda".' : ''); }).join('') +
      step(`Riporti C<sub>4</sub>…C<sub>1</sub> = ${res(bitsH(r.cw))}, somma ${res(bitsH(r.sw))}`, `${p.a} + ${p.b} = ${p.a + p.b}${p.a + p.b > 15 ? ': con C4 = 1 il risultato è 16 + ' + r.r.sum : ''}.`),
  });
  a3.push({
    id: 'add-sub', title: 'Sottrarre con il sommatore', level: 2,
    defaults: { a: 9, b: 5, m: 0 },
    gen: () => L.nice(() => ({ a: rand(0, 15), b: rand(1, 15), m: rand(0, 1) }), (p) => p.a !== p.b, { a: 9, b: 5, m: 0 }),
    solve: (p) => { const nb = ~p.b & 15; return { nb, r: Lg.rippleAdd(p.a, nb, 4, 1), d: p.a - p.b }; },
    text: (p) => `Un sommatore-sottrattore a 4 bit con M = 1 (sottrazione) calcola <var>A</var> − <var>B</var>, con ${p.m === 0 ? `<var>A</var> = ${bitsH(bin(p.a, 4))} e <var>B</var> = ${bitsH(bin(p.b, 4))}` : `<var>A</var> = ${p.a} e <var>B</var> = ${p.b}`}. Le porte XOR complementano i bit di <var>B</var> e il riporto iniziale è C<sub>0</sub> = 1. Trova ${ovl('<var>B</var>')}, la somma <var>S</var>, il riporto finale C<sub>4</sub> e il risultato in decimale.`,
    fig: (p, r, sol) => ({ svg: adderSVG(p.a, p.b, 1, sol) }),
    asks: (p, r) => [bitQ(ovl('<var>B</var>'), bin(r.nb, 4), { exact: true, ph: '4 bit' }), bitQ('<var>S</var>', bin(r.r.sum, 4), { exact: true, ph: '4 bit' }), b01('C<sub>4</sub>', r.r.cout), { label: '<var>A</var> − <var>B</var>', unit: '', value: r.d, signNote: 'Controlla il segno: con C4 = 0 il risultato della sottrazione è negativo.' }],
    hint: () => 'A − B = A + (B complementato) + 1. Il riporto finale dice il segno: C4 = 1 risultato positivo, C4 = 0 negativo.',
    steps: (p, r) => (p.m === 1 ? step(`<var>A</var> = ${bitsH(bin(p.a, 4))}, <var>B</var> = ${bitsH(bin(p.b, 4))}`) : '') +
      step(`${ovl('<var>B</var>')} = ${res(bitsH(bin(r.nb, 4)))}`, 'Ogni XOR con M = 1 inverte il suo bit: è il complemento a 1.') +
      step(`<var>S</var> = <var>A</var> + ${ovl('<var>B</var>')} + 1 = ${bitsH(bin(p.a, 4))} + ${bitsH(bin(r.nb, 4))} + 1 = ${res(bitsH(bin(r.r.sum, 4)))} con C<sub>4</sub> = ${res(r.r.cout)}`, 'Il +1 entra come riporto iniziale C0 = M: complemento a 1 più 1 è il complemento a 2.') +
      step(r.r.cout ? `C<sub>4</sub> = 1 → risultato positivo: <var>A</var> − <var>B</var> = ${bitsH(bin(r.r.sum, 4))} = ${res(r.d)}` : `C<sub>4</sub> = 0 → risultato negativo: <var>A</var> − <var>B</var> = ${r.r.sum} − 16 = ${res(r.d)}`, r.r.cout ? 'Il riporto finale a 1 vuol dire che non è servito il "prestito": A ≥ B.' : `S contiene il risultato in complemento a 2 su 5 bit (il quinto bit, il segno, è il negato di C4): ${r.r.sum} − 16 = ${r.d}.`),
    table: (p, r) => colTable(p.a, r.nb, 4, 1, '<var>A</var>', ovl('<var>B</var>')),
  });
  a3.push({
    id: 'add-ovf', title: 'Numeri con segno e overflow', level: 3,
    gen: () => { const want = Math.random() < 0.5; return L.nice(() => ({ a: rand(-8, 7), b: rand(-8, 7) }), (p) => p.a !== 0 && p.b !== 0 && (p.a + p.b > 7 || p.a + p.b < -8) === want, want ? { a: 5, b: 4 } : { a: -3, b: 6 }); },
    solve: (p) => { const ua = p.a & 15; const ub = p.b & 15; const r = Lg.rippleAdd(ua, ub, 4); return { ua, ub, r, v: signed4(r.sum), ovf: r.overflow }; },
    text: (p) => `Con un sommatore a 4 bit, usando il complemento a 2, calcoli (${sgn(p.a)}) + (${sgn(p.b)}). Scrivi i bit di somma, di' se c'è overflow e quale numero si legge in uscita interpretandolo in complemento a 2.`,
    asks: (p, r) => [bitQ('<var>S</var><sub>3</sub> … <var>S</var><sub>0</sub>', bin(r.r.sum, 4), { exact: true, ph: '4 bit' }), yesno('Overflow?', r.ovf), { label: 'Valore letto', unit: '', value: r.v, signNote: 'In complemento a 2 il bit più a sinistra pesa −8: se vale 1 il numero letto è negativo.' }],
    hint: () => 'Con 4 bit in C2 si va da −8 a +7. Il bit più a sinistra pesa −8.',
    steps: (p, r) => step(`<var>A</var> = ${sgn(p.a)} → ${bitsH(bin(r.ua, 4))}; <var>B</var> = ${sgn(p.b)} → ${bitsH(bin(r.ub, 4))}`, 'Per un negativo: scrivi il modulo in binario, inverti i bit e aggiungi 1. Controllo: −8 + il valore degli altri tre bit.') +
      step(`${bitsH(bin(r.ua, 4))} + ${bitsH(bin(r.ub, 4))} = ${res(bitsH(bin(r.r.sum, 4)))} (C<sub>4</sub> = ${r.r.cout}, che in C2 si scarta)`) +
      step(`Letto in C2: ${bitsH(bin(r.r.sum, 4))} = ${(r.r.sum >> 3) & 1 ? '−8 + ' + (r.r.sum & 7) + ' = ' : ''}${res(r.v)}`) +
      step(r.ovf ? `${res('Overflow')}: ${sgn(p.a)} + (${sgn(p.b)}) = ${sgn(p.a + p.b)} è fuori dall'intervallo −8 … +7, e il valore letto è sbagliato` : `${res('Nessun overflow')}: ${sgn(p.a + p.b)} sta fra −8 e +7`, `Regola: V = C4 ⊕ C3 = ${r.r.carries[4]} ⊕ ${r.r.carries[3]} = ${r.r.carries[4] ^ r.r.carries[3]}. In pratica: due addendi dello stesso segno danno un risultato di segno opposto. Con addendi di segno diverso l'overflow non può esserci.`),
  });
  a3.push({
    id: 'add-tpd', title: 'Quanto è lento il ripple-carry?', level: 1,
    gen: () => ({ n: pick([4, 8, 16, 32]), t: pick([5, 8, 10, 12, 15, 20]), m: rand(0, 1) }),
    solve: (p) => ({ T: p.n * p.t, f: 1000 / (p.n * p.t) }),
    text: (p) => `In un sommatore ripple-carry a ${p.n} bit ogni full adder impiega ${p.t} ns a produrre il proprio riporto. ${p.m === 0 ? 'Quanto tempo serve, nel caso peggiore, perché il risultato sia stabile?' : 'Quante somme al secondo può fare al massimo, se deve sempre aspettare il caso peggiore?'}`,
    asks: (p, r) => [p.m === 0 ? { label: '<var>t</var><sub>tot</sub>', unit: 'ns', value: r.T } : { label: '<var>f</var><sub>max</sub>', unit: 'MHz', value: r.f }],
    steps: (p, r) => step(`<var>t</var><sub>tot</sub> = <var>n</var> · <var>t</var><sub>pd</sub> = ${p.n} · ${p.t} ns = ${p.m === 0 ? res(r.T + ' ns') : r.T + ' ns'}`, 'Caso peggiore: il riporto nasce nello stadio 0 e deve attraversarli tutti, come in 0111…1 + 0000…1. (È una stima: trascura il ritardo dell\'ultima somma.)') +
      (p.m === 1 ? step(`<var>f</var><sub>max</sub> = ${frac('1', '<var>t</var><sub>tot</sub>')} = ${frac('1', r.T + ' ns')} = ${res(N(r.f) + ' MHz')}`, '1/(1 ns) = 1 GHz = 1000 MHz.') : '') +
      step('Il ritardo cresce con il numero di bit: per questo i sommatori veloci usano il carry look-ahead, che calcola tutti i riporti in parallelo.', 'Il 74HC283 lo fa già al suo interno sui suoi 4 bit.'),
  });
  a3.push({
    id: 'add-mc', title: 'Concetti sui sommatori', level: 1,
    ...mc([
      ['Un half adder ha…', ['2 ingressi e 2 uscite (S e C)', '3 ingressi e 2 uscite', '2 ingressi e 1 uscita', '4 ingressi e 3 uscite'], 'Somma due bit e non ha il riporto in ingresso: per questo è "mezzo" sommatore.'],
      ['In un full adder la somma vale…', ['A ⊕ B ⊕ Cin', 'A · B · Cin', 'A + B + Cin (OR)', '(A ⊕ B) · Cin'], 'La somma è 1 quando gli ingressi a 1 sono in numero dispari.'],
      ['Per sottrarre B con un sommatore…', ['si complementano i bit di B e si mette il riporto iniziale a 1', 'si scambiano A e B', 'si negano le uscite di somma', 'si usa un half adder al posto dell\'ultimo full adder'], 'A − B = A + B̅ + 1: complemento a 2.'],
      ['In complemento a 2 c\'è overflow quando…', ['due addendi dello stesso segno danno un risultato di segno opposto', 'il riporto finale vale 1', 'il risultato è zero', 'si sommano due numeri di segno opposto'], 'Equivale a V = C4 ⊕ C3.'],
      ['Il 74HC283 è…', ['un sommatore a 4 bit', 'un decoder 3 → 8', 'un multiplexer 8:1', 'un comparatore a 4 bit'], 'Due 283 in cascata (C4 del primo su C0 del secondo) fanno un sommatore a 8 bit.'],
      ['Perché un sommatore ripple-carry è lento con tanti bit?', ['ogni stadio deve aspettare il riporto del precedente', 'usa troppe porte NOT', 'i bit si sommano uno al secondo', 'gli serve un clock'], 'Il ritardo cresce con il numero di stadi; il carry look-ahead risolve il problema.'],
    ]),
  });

  function widgetAdder(host) {
    const c = K.widgetCard('Il sommatore a 4 bit', 'Quattro full adder in fila: il riporto passa da uno all\'altro');
    const A = [1, 0, 1, 1];
    const B = [0, 1, 1, 0];
    let M = 0;
    const fig = el('div', 'msi-fig');
    const out = el('div', 'forms');
    const ctl = el('div', 'msi-ctl');
    const draw = () => {
      const a = toNum(A);
      const b = toNum(B);
      const bb = M ? ~b & 15 : b;
      const r = Lg.rippleAdd(a, bb, 4, M);
      const V = r.carries[4] ^ r.carries[3];
      fig.innerHTML = adderSVG(a, b, M, true);
      const sa = signed4(a);
      const sb = signed4(b);
      const ss = signed4(r.sum);
      const row = (lab, f, meta) => `<div class="form-row"><span class="label">${lab}</span><div class="f">${f}</div>${meta ? `<span class="meta">${meta}</span>` : ''}</div>`;
      out.innerHTML = M
        ? row('Operazione', `${bitsH(bin(a, 4))} + ${bitsH(bin(bb, 4))} + 1 = ${r.cout ? '<strong>1</strong> ' : '<strong>0</strong> '}${bitsH(bin(r.sum, 4))}`, `A − B = A + ${ovl('B')} + 1: gli XOR invertono B, il riporto iniziale aggiunge 1.`) +
          row('Senza segno', `${a} − ${b} = ${res(a - b)}`, r.cout ? 'C4 = 1: risultato positivo, si legge direttamente.' : `C4 = 0: risultato negativo, vale ${r.sum} − 16 = ${a - b}.`) +
          row('In C2', `(${sgn(sa)}) − (${sgn(sb)}) = ${sgn(sa - sb)} → letto ${sgn(ss)}`, V ? '<span style="color:var(--bad)">Overflow: V = C4 ⊕ C3 = 1, il risultato non sta fra −8 e +7.</span>' : 'V = C4 ⊕ C3 = 0: nessun overflow.')
        : row('Operazione', `${bitsH(bin(a, 4))} + ${bitsH(bin(b, 4))} = ${r.cout ? '<strong>1</strong> ' : ''}${bitsH(bin(r.sum, 4))}`, 'Ogni stadio somma i suoi due bit e il riporto che arriva da destra.') +
          row('Senza segno', `${a} + ${b} = ${res(a + b)}`, r.cout ? 'C4 = 1: il risultato supera 15 e non sta in 4 bit.' : 'C4 = 0: il risultato sta in 4 bit.') +
          row('In C2', `(${sgn(sa)}) + (${sgn(sb)}) = ${sgn(sa + sb)} → letto ${sgn(ss)}`, V ? '<span style="color:var(--bad)">Overflow: V = C4 ⊕ C3 = 1, il risultato non sta fra −8 e +7.</span>' : 'V = C4 ⊕ C3 = 0: nessun overflow. Lo stesso circuito somma numeri con e senza segno.');
    };
    ctl.append(group('<var>A</var>', bitButtons(range(4).map((k) => `A<sub>${3 - k}</sub>`), A, () => draw(), ['8', '4', '2', '1'])), group('<var>B</var>', bitButtons(range(4).map((k) => `B<sub>${3 - k}</sub>`), B, () => draw(), ['8', '4', '2', '1'])), sw('Sottrai: A − B (M = 1)', false, (v) => { M = v ? 1 : 0; draw(); }));
    c.append(ctl, fig, out);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'sommatori', num: 3, short: 'Sommatori', title: 'Sommatori e sottrattori',
    intro: 'Sommare due numeri binari vuol dire ripetere, bit per bit, una piccola operazione: due bit più il riporto. Il full adder la fa con poche porte; mettendone quattro in fila si ottiene un sommatore a 4 bit, e con qualche XOR anche un sottrattore.',
    goals: ['Half adder e full adder', 'Ripple-carry', 'Sottrazione in C2', 'Overflow'],
    widgets: [widgetAdder],
    example: a3.find((f) => f.id === 'add-sub'), exampleTitle: 'Esempio: una sottrazione con il sommatore',
    families: a3,
    theory: `
      <article class="note"><h4>Half adder e full adder</h4>
        <div class="eq"><span>Half adder: <var>S</var> = <var>A</var> ⊕ <var>B</var>, <var>C</var> = <var>A</var><var>B</var></span></div>
        <div class="eq"><span>Full adder: <var>S</var> = <var>A</var> ⊕ <var>B</var> ⊕ <var>C</var><sub>in</sub>, <var>C</var><sub>out</sub> = <var>A</var><var>B</var> + <var>C</var><sub>in</sub>(<var>A</var> ⊕ <var>B</var>)</span></div>
        <p>Il full adder si costruisce con due half adder e una OR. Ripassa la <a href="#binario" data-route="binario">somma binaria</a>.</p></article>
      <article class="note"><h4>Sommatore ripple-carry</h4>
        <p>Quattro full adder in cascata: il riporto di uscita di ogni stadio entra nel successivo. È semplice, ma lento con molti bit, perché il riporto deve attraversare tutti gli stadi. Il <strong>74HC283</strong> è un sommatore a 4 bit con carry look-ahead interno; più chip si collegano in cascata.</p></article>
      <article class="note"><h4>Sommatore-sottrattore</h4>
        <p>Con un segnale <var>M</var>: ogni bit di <var>B</var> passa per uno XOR con <var>M</var>, e <var>M</var> entra anche come riporto iniziale C<sub>0</sub>.</p>
        <ul><li><var>M</var> = 0: <var>S</var> = <var>A</var> + <var>B</var>.</li><li><var>M</var> = 1: <var>S</var> = <var>A</var> + ${ovl('<var>B</var>')} + 1 = <var>A</var> − <var>B</var> (complemento a 2).</li></ul></article>
      <article class="note"><h4>Riporto e overflow</h4>
        <ul><li>Numeri senza segno: il risultato è troppo grande quando C<sub>4</sub> = 1.</li>
          <li>Numeri con segno in C2 (da −8 a +7 con 4 bit): l'overflow è <var>V</var> = C<sub>4</sub> ⊕ C<sub>3</sub>. Succede solo sommando due numeri dello stesso segno.</li></ul></article>`,
  });

  // =====================================================================
  // 4 — Comparatori e display a 7 segmenti
  // =====================================================================
  const c4 = [];
  const REL = ['A > B', 'A = B', 'A < B'];
  const relOf = (a, b) => (a > b ? 0 : a === b ? 1 : 2);
  c4.push({
    id: 'cmp-1', title: 'Il comparatore a 1 bit', level: 1,
    gen: () => ({ k: rand(0, 2), a: rand(0, 1), b: rand(0, 1), o: App.shuffle([0, 1, 2, 3]) }),
    solve: (p) => ({ rel: relOf(p.a, p.b) }),
    text: (p) => `Un comparatore a 1 bit ha tre uscite: <var>G</var> (A > B), <var>E</var> (A = B) e <var>L</var> (A < B). Quale espressione realizza l'uscita ${['<var>G</var>', '<var>E</var>', '<var>L</var>'][p.k]}? E con <var>A</var> = ${p.a}, <var>B</var> = ${p.b}, quale uscita vale 1?`,
    asks: (p, r) => { const ex = ["A · B'", "(A ⊕ B)' (XNOR)", "A' · B", 'A ⊕ B (XOR)']; return [h.choice('Espressione', p.o.map((i) => ex[i]), p.o.indexOf(p.k)), h.choice('Uscita a 1', ['G (A > B)', 'E (A = B)', 'L (A < B)'], r.rel)]; },
    steps: (p, r) => step(`<var>G</var> = <var>A</var>${ovl('<var>B</var>')}, <var>E</var> = ${ovl('<var>A</var> ⊕ <var>B</var>')}, <var>L</var> = ${ovl('<var>A</var>')}<var>B</var>`, 'A > B con un bit solo vuol dire A = 1 e B = 0; uguali vuol dire XOR = 0, cioè XNOR = 1.') +
      step(`<var>A</var> = ${p.a}, <var>B</var> = ${p.b} → ${res(['<var>G</var>', '<var>E</var>', '<var>L</var>'][r.rel] + ' = 1')}`, 'Una e una sola delle tre uscite vale 1.'),
  });
  c4.push({
    id: 'cmp-4', title: 'Confronto a 4 bit', level: 2,
    gen: () => { const a = rand(0, 15); const b = Math.random() < 0.15 ? a : L.nice(() => rand(0, 15), (x) => x !== a, (a + 5) % 16); return { a, b, m: rand(0, 1) }; },
    solve: (p) => { let k = 3; while (k >= 0 && ((p.a >> k) & 1) === ((p.b >> k) & 1)) k--; return { k, rel: relOf(p.a, p.b) }; },
    text: (p) => `Un comparatore a 4 bit (come il 74HC85) riceve ${p.m === 0 ? `<var>A</var> = ${bitsH(bin(p.a, 4))} e <var>B</var> = ${bitsH(bin(p.b, 4))}` : `<var>A</var> = ${p.a} e <var>B</var> = ${p.b}, scritti in binario sui suoi ingressi`}. Quale uscita si attiva, e quale coppia di bit decide il confronto?`,
    asks: (p, r) => [h.choice('Uscita attiva', REL, r.rel), h.choice('Bit che decide', ['A3, B3 (peso 8)', 'A2, B2 (peso 4)', 'A1, B1 (peso 2)', 'A0, B0 (peso 1)', 'nessuno: sono tutti uguali'], r.k < 0 ? 4 : 3 - r.k)],
    hint: () => 'Confronta i bit partendo da sinistra, dal più pesante: decide la prima coppia diversa.',
    steps: (p, r) => (p.m === 1 ? step(`<var>A</var> = ${bitsH(bin(p.a, 4))}, <var>B</var> = ${bitsH(bin(p.b, 4))}`) : '') +
      [3, 2, 1, 0].filter((k) => k >= r.k).map((k) => { const ak = (p.a >> k) & 1; const bk = (p.b >> k) & 1; return step(`Bit ${k}: A<sub>${k}</sub> = ${ak}, B<sub>${k}</sub> = ${bk} → ${ak === bk ? 'uguali, si passa al successivo' : res(ak > bk ? 'A > B' : 'A < B')}`); }).join('') +
      (r.k < 0 ? step(`Tutti i bit uguali → ${res('A = B')}`, '<var>E</var> = x<sub>3</sub>x<sub>2</sub>x<sub>1</sub>x<sub>0</sub>, con x<sub>k</sub> = XNOR dei due bit.') : step(`${r.k < 3 ? 'I bit più pesanti sono uguali; ' : ''}i bit sotto il ${r.k} non contano più`, 'Come per i numeri decimali: 7xxx è sempre più grande di 6xxx.')),
  });
  c4.push({
    id: 'cmp-8', title: 'Due comparatori in cascata', level: 3,
    gen: () => {
      const ah = rand(0, 15);
      const al = rand(0, 15);
      const t = Math.random();
      const bh = t < 0.55 ? ah : L.nice(() => rand(0, 15), (x) => x !== ah, (ah + 3) % 16);
      const bl = t < 0.12 ? al : rand(0, 15);
      return { a: ah * 16 + al, b: bh * 16 + bl };
    },
    solve: (p) => { const hiEq = p.a >> 4 === p.b >> 4; return { hiEq, who: p.a === p.b ? 2 : hiEq ? 1 : 0, rel: relOf(p.a, p.b) }; },
    text: (p) => `Per confrontare due numeri a 8 bit si usano due 74HC85: il comparatore dei 4 bit bassi passa il suo esito agli ingressi di cascata di quello dei 4 bit alti, che dà le uscite finali. Con <var>A</var> = ${bitsH(bin(p.a >> 4, 4) + ' ' + bin(p.a & 15, 4))} e <var>B</var> = ${bitsH(bin(p.b >> 4, 4) + ' ' + bin(p.b & 15, 4))}, chi decide il confronto e quale uscita finale si attiva?`,
    asks: (p, r) => [h.choice('Decide', ['il comparatore dei 4 bit alti', 'quello dei 4 bit bassi, perché i 4 alti sono uguali', 'nessuno: i due numeri sono uguali'], r.who), h.choice('Uscita finale', REL, r.rel)],
    steps: (p, r) => step(`Bit alti: ${bitsH(bin(p.a >> 4, 4))} e ${bitsH(bin(p.b >> 4, 4))} → ${r.hiEq ? 'uguali' : (p.a >> 4) > (p.b >> 4) ? 'A > B' : 'A < B'}`, 'Il chip dei bit alti guarda prima i suoi ingressi; solo se sono tutti uguali passa in uscita quello che arriva dagli ingressi di cascata.') +
      (r.hiEq ? step(`Bit bassi: ${bitsH(bin(p.a & 15, 4))} e ${bitsH(bin(p.b & 15, 4))} → ${res(REL[r.rel])}`, 'Il chip dei bit bassi ha gli ingressi di cascata fissi su "A = B".') : step(`${res(REL[r.rel])}: i bit bassi non contano`, 'Lo stesso principio del confronto a 4 bit, a blocchi di 4.')),
  });
  c4.push({
    id: 'seg-which', title: 'Quali segmenti si accendono?', level: 1,
    gen: () => ({ d: rand(0, 9), m: rand(0, 1) }),
    solve: (p) => ({ segs: Lg.SEG7[p.d], b: bin(p.d, 4) }),
    text: (p, r) => (p.m === 0
      ? `Un decoder BCD → 7 segmenti (display a catodo comune, 6 e 9 con la "coda") riceve <var>A</var> <var>B</var> <var>C</var> <var>D</var> = ${bitsH(spaced(r.b))}, con <var>A</var> il bit da 8. Quali segmenti si accendono? Scrivi le lettere, per esempio <span class="mono">a, b, c</span>.`
      : `Sul display a 7 segmenti sono accesi i segmenti ${r.segs.split('').join(', ')}. Che cifra si legge, e quale codice BCD <var>A</var> <var>B</var> <var>C</var> <var>D</var> arriva al decoder?`),
    fig: (p, r, sol) => ({ svg: segSVG(p.m === 1 || sol ? r.segs : '', { labels: true, w: 130 }) }),
    asks: (p, r) => (p.m === 0
      ? [{ label: 'Segmenti accesi', type: 'text', fmt: 'set', answer: r.segs, answerHTML: r.segs.split('').join(', '), ph: 'es. a, b, c' }]
      : [{ label: 'Cifra', unit: '', value: p.d }, bitQ('<var>A</var> <var>B</var> <var>C</var> <var>D</var>', r.b, { exact: true, ph: '4 bit' })]),
    steps: (p, r) => (p.m === 0
      ? step(`${bitsH(r.b)} = ${p.d}`, 'Il codice BCD è il binario naturale di una sola cifra, da 0000 a 1001.') + step(`Per disegnare il ${p.d} servono ${res(r.segs.split('').join(', '))}`, `${r.segs.length} segmenti accesi${r.segs.length < 7 ? ', spenti ' + 'abcdefg'.split('').filter((x) => !r.segs.includes(x)).join(', ') : ''}. I segmenti si nominano da a (in alto) in senso orario, con g al centro.`)
      : step(`I segmenti ${r.segs.split('').join(', ')} disegnano il ${res(p.d)}`) + step(`${p.d} in BCD = ${res(bitsH(r.b))}`, 'Pesi 8, 4, 2, 1.')),
  });
  const e12up = (x) => { for (let d = 1; d <= 1e6; d *= 10) for (const v of App.E12) { const y = Number((v * d).toPrecision(2)); if (y >= x * (1 - 1e-9)) return y; } return x; };
  c4.push({
    id: 'seg-r', title: 'Il resistore di ogni segmento', level: 1,
    gen: () => L.nice(() => ({ vcc: pick([5, 5, 3.3, 12]), vf: pick([1.8, 2, 2.1]), i: pick([5, 8, 10, 15, 20]), R: pick([150, 220, 270, 330, 470, 680, 1000, 1500]), m: rand(0, 1) }), (p) => { const I = (p.vcc - p.vf) / p.R; return p.m === 0 || (I >= 0.003 && I <= 0.025); }, { vcc: 5, vf: 2, i: 10, R: 330, m: 0 }),
    solve: (p) => ({ Rc: (p.vcc - p.vf) / (p.i / 1000), I: (p.vcc - p.vf) / p.R }),
    text: (p) => (p.m === 0
      ? `Un segmento di un display a catodo comune è acceso da un'uscita a ${N(p.vcc)} V. Il LED del segmento ha una tensione di soglia di ${N(p.vf)} V e deve condurre ${p.i} mA. Quanto deve valere il resistore in serie, e quanta potenza dissipa?`
      : `Ogni segmento di un display a catodo comune ha in serie un resistore da ${U(p.R, 'Ω')} ed è acceso da un'uscita a ${N(p.vcc)} V; la tensione di soglia del LED è ${N(p.vf)} V. Quanta corrente scorre in un segmento? Quanta ne assorbe in tutto il display quando mostra l'8?`),
    asks: (p, r) => (p.m === 0 ? [h.qR('<var>R</var>', r.Rc), { label: '<var>P</var><sub>R</sub>', unit: 'mW', value: (p.vcc - p.vf) * p.i }] : [{ label: '<var>I</var> segmento', unit: 'mA', value: r.I * 1000 }, { label: '<var>I</var> con l\'8', unit: 'mA', value: 7 * r.I * 1000 }]),
    steps: (p, r) => step(`Sul resistore: <var>V</var><sub>R</sub> = ${N(p.vcc)} − ${N(p.vf)} = ${N(p.vcc - p.vf)} V`, 'Kirchhoff alla maglia: la tensione dell\'uscita si divide fra LED e resistore.') +
      (p.m === 0
        ? step(`<var>R</var> = ${frac('<var>V</var><sub>R</sub>', '<var>I</var>')} = ${frac(N(p.vcc - p.vf) + ' V', p.i + ' mA')} = ${res(U(r.Rc, 'Ω'))}`, `Valore commerciale E12 per eccesso: ${U(e12up(r.Rc), 'Ω')}, così la corrente non supera quella prevista.`) + step(`<var>P</var><sub>R</sub> = <var>V</var><sub>R</sub> · <var>I</var> = ${N(p.vcc - p.vf)} V · ${p.i} mA = ${res(N((p.vcc - p.vf) * p.i) + ' mW')}`, 'Un resistore da ¼ W basta e avanza.')
        : step(`<var>I</var> = ${frac('<var>V</var><sub>R</sub>', '<var>R</var>')} = ${frac(N(p.vcc - p.vf) + ' V', U(p.R, 'Ω'))} = ${res(U(r.I, 'A'))}`) + step(`L'8 accende tutti e 7 i segmenti: 7 · ${U(r.I, 'A')} = ${res(U(7 * r.I, 'A'))}`, 'Un resistore per segmento, non uno solo in comune: altrimenti la luminosità cambierebbe con il numero di segmenti accesi.')),
  });
  c4.push({
    id: 'seg-kmap', title: 'Sintesi di un segmento con la mappa', level: 3,
    defaults: { s: 'e', m: 0 },
    gen: () => ({ s: pick('abcdefg'.split('')), m: Math.random() < 0.7 ? 0 : 1 }),
    solve: (p) => {
      const on = Lg.segMinterms(p.s);
      const outs = range(16).map((k) => (k > 9 ? (p.m === 0 ? 'x' : 0) : on.includes(k) ? 1 : 0));
      const an = Lg.analyze(4, outs);
      const an0 = p.m === 0 ? Lg.analyze(4, outs.map((v) => (v === 'x' ? 0 : v))) : null;
      return { on, outs, an, an0 };
    },
    text: (p, r) => `Il segmento <strong>${p.s}</strong> del display si accende per le cifre ${r.on.join(', ')}. L'ingresso è il codice BCD <var>A</var> <var>B</var> <var>C</var> <var>D</var> (<var>A</var> il bit da 8)${p.m === 0 ? '; i codici da 10 a 15 non arrivano mai, quindi sono indifferenze' : '; per i codici da 10 a 15 il segmento deve restare spento'}. Trova la forma minima del segmento come somma di prodotti.`,
    fig: (p) => ({ svg: segSVG(p.s, { labels: true, sel: p.s, w: 110 }) }),
    asks: (p, r) => [{ label: `<var>${p.s}</var> =`, type: 'expr', n: 4, outputs: r.outs, answerHTML: sopH(4, r.an.sop) }],
    hint: (p) => (p.m === 0 ? 'Metti 1 nelle celle delle cifre con il segmento acceso, X nelle celle da 10 a 15: le X puoi usarle per fare gruppi più grandi.' : 'Qui le celle da 10 a 15 valgono 0: niente indifferenze.'),
    steps: (p, r) => step(`<var>${p.s}</var> = Σ<var>m</var>(${r.on.join(', ')})${p.m === 0 ? ' + <var>d</var>(10, 11, 12, 13, 14, 15)' : ''}`, 'I mintermini sono le cifre con il segmento acceso.') +
      step(`Gruppi nella mappa (sotto): ${r.an.sop.map((g) => App.productHTML(Lg.productLiterals(4, g))).join(', ')}`, p.m === 0 ? 'Le X si prendono solo se aiutano ad allargare un gruppo.' : 'Ogni 1 deve stare in almeno un gruppo, il più grande possibile.') +
      step(`<var>${p.s}</var> = ${res(sopH(4, r.an.sop))}`, `${r.an.sop.length} prodott${r.an.sop.length === 1 ? 'o' : 'i'}, ${litCount(4, r.an.sop)} letterali.`) +
      (p.m === 0 ? step(`Senza indifferenze: <var>${p.s}</var> = ${sopH(4, r.an0.sop)}`, litCount(4, r.an0.sop) > litCount(4, r.an.sop) ? `${litCount(4, r.an0.sop)} letterali invece di ${litCount(4, r.an.sop)}: le indifferenze fanno risparmiare porte.` : 'Qui le indifferenze non fanno risparmiare nulla.') : ''),
    table: (p, r) => kmapH(r.outs, r.an.sop),
  });
  c4.push({
    id: 'seg-mc', title: 'Concetti su comparatori e display', level: 1,
    ...mc([
      ['In un display a catodo comune, per accendere un segmento…', ['si porta a livello alto il suo anodo', 'si porta a livello basso il suo anodo', 'si lascia scollegato', 'si inverte la tensione di alimentazione'], 'I catodi sono tutti a massa: il segmento si accende quando il suo anodo è a 1 (attraverso il resistore).'],
      ['In un display ad anodo comune il segmento si accende con…', ['un livello basso sul suo catodo', 'un livello alto sul suo catodo', 'l\'anodo comune a massa', 'una tensione alternata'], 'Gli anodi sono al positivo: serve un decoder con uscite attive basse, come il 7447.'],
      ['Il 74HC4511 riceve in ingresso…', ['un codice BCD a 4 bit', 'un numero in C2 a 8 bit', '7 bit, uno per segmento', 'un segnale analogico'], 'Converte il BCD nei 7 segnali dei segmenti; per i codici da 10 a 15 spegne il display.'],
      ['Nella sintesi dei segmenti i codici da 1010 a 1111 si trattano come…', ['indifferenze, perché non arrivano mai', 'sempre 1', 'sempre 0', 'errori da segnalare'], 'Le indifferenze permettono gruppi più grandi nelle mappe.'],
      ['Per sapere se A = B a 4 bit si usa…', ['una AND delle quattro XNOR fra bit corrispondenti', 'una OR delle quattro XOR', 'un sommatore', 'un multiplexer 4:1'], 'I numeri sono uguali se ogni coppia di bit è uguale: XNOR = 1 per tutte.'],
      ['In un comparatore a 4 bit, chi decide se A > B?', ['la prima coppia di bit diversi, partendo dal più pesante', 'la somma dei bit', 'sempre il bit meno pesante', 'il numero di bit a 1'], 'Come nei numeri decimali: si confronta dalla cifra più a sinistra.'],
    ]),
  });

  function widgetCompare(host) {
    const c = K.widgetCard('Il comparatore a 4 bit', 'Si confronta dal bit più pesante: decide la prima differenza');
    const A = [1, 0, 1, 1];
    const B = [1, 0, 0, 1];
    const ctl = el('div', 'msi-ctl');
    const leds = el('div', 'msi-leds');
    const tbl = el('div', 'table-wrap');
    const out = el('p', 'hint');
    const draw = () => {
      const a = toNum(A);
      const b = toNum(B);
      let kd = 3;
      while (kd >= 0 && A[3 - kd] === B[3 - kd]) kd--;
      const rel = relOf(a, b);
      leds.innerHTML = REL.map((t, i) => `<span class="lamp${i === rel ? ' on' : ''}">${t.replace('>', '&gt;').replace('<', '&lt;')}</span>`).join('');
      tbl.innerHTML = '<table class="tt"><thead><tr><th>bit</th><th>peso</th><th><var>A</var></th><th><var>B</var></th><th class="sep">confronto</th></tr></thead><tbody>' +
        [3, 2, 1, 0].map((k) => { const ak = A[3 - k]; const bk = B[3 - k]; const t = kd < 0 || k > kd ? 'uguali: avanti' : k === kd ? `<strong>decide: ${ak > bk ? 'A &gt; B' : 'A &lt; B'}</strong>` : 'non conta più'; return `<tr${k === kd ? ' class="hl"' : ''}><td>${k}</td><td>${1 << k}</td><td>${ak}</td><td>${bk}</td><td class="sep">${t}</td></tr>`; }).join('') + '</tbody></table>';
      out.innerHTML = `<var>A</var> = ${a}, <var>B</var> = ${b}. ` + (kd < 0 ? 'Tutte le coppie sono uguali: <var>E</var> = x<sub>3</sub>x<sub>2</sub>x<sub>1</sub>x<sub>0</sub> = 1, dove x<sub>k</sub> è lo XNOR dei due bit.' : `La prima differenza è al bit ${kd}: i bit sotto non possono più cambiare l'esito.`);
    };
    ctl.append(group('<var>A</var>', bitButtons(range(4).map((k) => `A<sub>${3 - k}</sub>`), A, () => draw(), ['8', '4', '2', '1'])), group('<var>B</var>', bitButtons(range(4).map((k) => `B<sub>${3 - k}</sub>`), B, () => draw(), ['8', '4', '2', '1'])));
    c.append(ctl, leds, tbl, out);
    host.appendChild(c);
    draw();
  }

  function widgetSeg(host) {
    const c = K.widgetCard('Dal codice BCD al display', 'Cambia il codice e scegli un segmento per vederne la mappa');
    const st = [0, 1, 1, 0];
    let sel = 'e';
    const ctl = el('div', 'msi-ctl');
    const grid = el('div', 'msi-seg');
    const left = el('div');
    const right = el('div');
    const segBtns = el('div', 'seg');
    segBtns.setAttribute('aria-label', 'Segmento da studiare');
    segBtns.innerHTML = 'abcdefg'.split('').map((x) => `<button type="button" data-s="${x}">${x}</button>`).join('');
    const mapBox = el('div');
    const out = el('p', 'f widget-out');
    const draw = () => {
      const code = toNum(st);
      const on = code <= 9 ? Lg.SEG7[code] : '';
      left.innerHTML = segSVG(on, { labels: true, sel, click: true });
      const mins = Lg.segMinterms(sel);
      const outs = range(16).map((k) => (k > 9 ? 'x' : mins.includes(k) ? 1 : 0));
      const an = Lg.analyze(4, outs);
      mapBox.innerHTML = `<p class="f"><var>${sel}</var> = Σ<var>m</var>(${mins.join(', ')}) + <var>d</var>(10 … 15)</p>${kmapH(outs, an.sop, code)}<p class="f"><var>${sel}</var> = ${res(sopH(4, an.sop))}</p>`;
      segBtns.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.s === sel)));
      out.innerHTML = code <= 9
        ? `${bitsH(bin(code, 4))} = ${code} → accesi <strong>${on.split('').join(' ')}</strong>; il segmento ${sel} è ${on.includes(sel) ? 'acceso' : 'spento'} (cella ${code} della mappa).`
        : `${bitsH(bin(code, 4))} = ${code} non è un codice BCD: il decoder spegne il display. Nelle mappe questi codici sono indifferenze (X).`;
    };
    const choose = (e) => { const t = e.target.closest('[data-s]'); if (t) { sel = t.dataset.s; draw(); } };
    left.addEventListener('click', choose);
    segBtns.addEventListener('click', choose);
    ctl.append(group('Codice BCD', bitButtons(ABC, st, () => draw(), ['8', '4', '2', '1'])));
    right.append(segBtns, mapBox);
    grid.append(left, right);
    c.append(ctl, out, grid);
    host.appendChild(c);
    draw();
  }

  lessons.push({
    id: 'comparatori', num: 4, short: 'Comparatori e display', title: 'Comparatori e display a 7 segmenti',
    intro: 'Il comparatore dice quale di due numeri è il più grande; il decoder per display trasforma una cifra BCD nei sette segnali che disegnano il numero. Ogni segmento è una funzione di quattro variabili: un ottimo esercizio di mappe di Karnaugh con le indifferenze.',
    goals: ['Comparatore a 1 e a 4 bit', 'Cascata di comparatori', 'Display a 7 segmenti', 'Sintesi con le indifferenze'],
    widgets: [widgetCompare, widgetSeg],
    example: c4.find((f) => f.id === 'seg-kmap'), exampleTitle: 'Esempio: la forma minima del segmento e',
    families: c4,
    theory: `
      <article class="note"><h4>Comparatore</h4>
        <p>A 1 bit: <var>G</var> = <var>A</var>${ovl('<var>B</var>')} (A > B), <var>E</var> = ${ovl('<var>A</var> ⊕ <var>B</var>')} (A = B), <var>L</var> = ${ovl('<var>A</var>')}<var>B</var> (A < B).</p>
        <p>A 4 bit, con x<sub>k</sub> = XNOR(A<sub>k</sub>, B<sub>k</sub>):</p>
        <div class="eq"><span><var>E</var> = x<sub>3</sub>x<sub>2</sub>x<sub>1</sub>x<sub>0</sub></span><span><var>G</var> = A<sub>3</sub>${ovl('B')}<sub>3</sub> + x<sub>3</sub>A<sub>2</sub>${ovl('B')}<sub>2</sub> + x<sub>3</sub>x<sub>2</sub>A<sub>1</sub>${ovl('B')}<sub>1</sub> + x<sub>3</sub>x<sub>2</sub>x<sub>1</sub>A<sub>0</sub>${ovl('B')}<sub>0</sub></span></div>
        <p>Il <strong>74HC85</strong> ha anche tre ingressi di cascata: si collegano alle uscite del chip dei bit meno pesanti per confrontare 8, 12, 16 bit.</p></article>
      <article class="note"><h4>Display a 7 segmenti</h4>
        <ul><li>Sette LED a forma di barra, da <strong>a</strong> (in alto) in senso orario fino a <strong>f</strong>, più <strong>g</strong> al centro (e spesso il punto decimale).</li>
          <li><strong>Catodo comune</strong>: catodi a massa, il segmento si accende con un 1. <strong>Anodo comune</strong>: anodi al positivo, si accende con uno 0.</li>
          <li>Un resistore per ogni segmento limita la corrente: <var>R</var> = (V<sub>CC</sub> − V<sub>F</sub>) / <var>I</var>.</li></ul></article>
      <article class="note"><h4>Decoder BCD → 7 segmenti</h4>
        <p>Il <strong>74HC4511</strong> (catodo comune, uscite attive alte) e il <strong>7447</strong> (anodo comune, uscite attive basse) ricevono una cifra BCD e pilotano i sette segmenti. Per i codici da 10 a 15 il 4511 spegne il display. Attenzione: il 4511 disegna il 6 senza il segmento a e il 9 senza il d; qui usiamo la versione "con la coda", più leggibile, come fanno molti decoder e i microcontrollori.</p></article>
      <article class="note"><h4>Sintesi di un segmento</h4>
        <p>Ogni segmento è una funzione di <var>A</var> <var>B</var> <var>C</var> <var>D</var>: vale 1 per le cifre in cui è acceso. I codici da 10 a 15 non arrivano mai e diventano <strong>indifferenze</strong>: nella mappa si segnano con X e si usano solo se allargano un gruppo. Ripassa le <a href="#karnaugh" data-route="karnaugh">mappe di Karnaugh</a>.</p></article>`,
  });

  App.unitsData = App.unitsData || [];
  App.unitsData.push({
    id: 'msi', year: '3', yearLabel: '3ª', title: 'Circuiti combinatori integrati', route: 'msi-decoder', lessonWord: 'Lezione',
    desc: 'Decoder, encoder, multiplexer, sommatori e sottrattori, comparatori, display a 7 segmenti: i chip MSI e come si usano per realizzare funzioni.',
    lessons,
  });
})();
