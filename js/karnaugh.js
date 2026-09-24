/* Scheda 6 — Tabella di verità, forme canoniche, mappe di Karnaugh, forma minima */
(function () {
  'use strict';
  const App = window.App;
  const L = window.Logic;
  const $ = (id) => document.getElementById(id);
  const GROUP_COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)', 'var(--g5)', 'var(--g6)'];

  const PRESETS = {
    es: { n: 3, ones: [0, 2, 4, 5, 6], dcs: [], label: 'Esempio degli appunti' },
    maj: { n: 3, ones: [3, 5, 6, 7], dcs: [], label: 'Maggioranza (3 ingressi)' },
    xor: { n: 3, ones: [1, 2, 4, 7], dcs: [], label: 'Parità dispari (XOR a 3)' },
    corners: { n: 4, ones: [0, 2, 8, 10], dcs: [], label: 'I quattro angoli' },
    seg: { n: 4, ones: [0, 2, 3, 5, 6, 7, 8, 9], dcs: [10, 11, 12, 13, 14, 15], label: 'Display 7 segmenti: segmento a' },
    two: { n: 2, ones: [1, 2, 3], dcs: [], label: 'OR a 2 ingressi' },
  };

  const st = { n: 3, out: [], mode: 'sop', ins: [false, false, false, false] };

  function load(p) {
    st.n = p.n;
    st.out = Array.from({ length: 1 << p.n }, (_, m) => (p.ones.includes(m) ? 1 : p.dcs.includes(m) ? 'x' : 0));
  }

  const cycle = (v) => (v === 0 ? 1 : v === 1 ? 'x' : 0);
  const show = (v) => (v === 'x' ? 'X' : String(v));

  // ---------- Tabella di verità ----------
  function renderTable(res) {
    const n = st.n;
    const cur = currentIndex();
    let h = '<thead><tr><th>m</th>' + L.VARS.slice(0, n).map((v) => `<th>${v}</th>`).join('') + '<th class="sep">F</th></tr></thead><tbody>';
    for (let m = 0; m < 1 << n; m++) {
      const bits = L.binary(m, n);
      const v = st.out[m];
      const cls = v === 1 ? 'one' : v === 'x' ? 'dc' : '';
      h += `<tr data-m="${m}" class="${m === cur ? 'hl' : ''}"><td class="idx">${m}</td>${[...bits].map((b) => `<td>${b}</td>`).join('')}<td class="sep"><button type="button" class="out ${cls}" data-m="${m}" aria-label="Riga ${m}: F = ${show(v)}. Premi per cambiare">${show(v)}</button></td></tr>`;
    }
    const t = $('k-tt');
    t.innerHTML = h + '</tbody>';
    t.querySelectorAll('button.out').forEach((b) => b.addEventListener('click', () => {
      const m = Number(b.dataset.m);
      st.out[m] = cycle(st.out[m]);
      renderAll();
      const again = $('k-tt').querySelector(`button.out[data-m="${m}"]`);
      if (again) again.focus();
    }));
    t.querySelectorAll('tr[data-m]').forEach((tr) => {
      tr.addEventListener('mouseenter', () => hover(Number(tr.dataset.m), true));
      tr.addEventListener('mouseleave', () => hover(Number(tr.dataset.m), false));
    });
  }

  function hover(m, on) {
    const cell = $('k-map').querySelector(`.cell[data-m="${m}"]`);
    const row = $('k-tt').querySelector(`tr[data-m="${m}"]`);
    if (cell) cell.style.outline = on ? '2.5px solid var(--ink)' : '';
    if (row) row.style.background = on ? 'var(--surface-3)' : '';
  }

  // ---------- Mappa ----------
  function contiguous(list) {
    const u = [...new Set(list)].sort((a, b) => a - b);
    return u[u.length - 1] - u[0] + 1 === u.length;
  }

  function renderMap(host, n, out, groups, opts) {
    const lay = L.kmapLayout(n);
    const R = lay.rowCodes.length;
    const Cn = lay.colCodes.length;
    host.style.gridTemplateColumns = `auto repeat(${Cn}, auto)`;
    const code = (v, bits) => v.toString(2).padStart(bits, '0');
    let h = `<div class="corner" aria-hidden="true"><span class="cv">${lay.colVars}</span><span class="rv">${lay.rowVars}</span></div>`;
    lay.colCodes.forEach((c) => { h += `<div class="hdr">${code(c, lay.cbits)}</div>`; });
    // posizione di ogni gruppo nella griglia
    const gInfo = groups.map((g, gi) => {
      const cells = new Set(L.cellsOf(n, g));
      const rows = [];
      const cols = [];
      for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) if (cells.has(L.kmapIndex(lay, r, c))) { rows.push(r); cols.push(c); }
      return { cells, wrapR: !contiguous(rows), wrapC: !contiguous(cols), color: GROUP_COLORS[gi % GROUP_COLORS.length], inset: 3 + (gi % 4) * 4 };
    });
    for (let r = 0; r < R; r++) {
      h += `<div class="hdr">${code(lay.rowCodes[r], lay.rbits)}</div>`;
      for (let c = 0; c < Cn; c++) {
        const m = L.kmapIndex(lay, r, c);
        const v = out[m];
        const cls = v === 1 ? 'one' : v === 'x' ? 'dc' : 'zero';
        let grp = '';
        gInfo.forEach((g) => {
          if (!g.cells.has(m)) return;
          const inG = (rr, cc) => g.cells.has(L.kmapIndex(lay, rr, cc));
          const side = (dr, dc) => {
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < R && cc >= 0 && cc < Cn) return !inG(rr, cc);
            const wraps = dr !== 0 ? g.wrapR : g.wrapC;
            return !(wraps && inG((rr + R) % R, (cc + Cn) % Cn));
          };
          const t = side(-1, 0), b = side(1, 0), l = side(0, -1), rt = side(0, 1);
          const i = g.inset;
          const rad = (a, bb) => (a && bb ? '12px' : '0');
          grp += `<span class="grp" style="--gc:${g.color};top:${t ? i : -1}px;bottom:${b ? i : -1}px;left:${l ? i : -1}px;right:${rt ? i : -1}px;border-width:${t ? 2.5 : 0}px ${rt ? 2.5 : 0}px ${b ? 2.5 : 0}px ${l ? 2.5 : 0}px;border-radius:${rad(t, l)} ${rad(t, rt)} ${rad(b, rt)} ${rad(b, l)}"></span>`;
        });
        const curCls = opts.cur === m ? ' cur' : '';
        const tag = opts.readonly ? 'div' : 'button type="button"';
        const close = opts.readonly ? 'div' : 'button';
        h += `<${tag} class="cell ${cls}${opts.readonly ? ' readonly' : ''}${curCls}" data-m="${m}" aria-label="Cella m${m} (${L.binary(m, n)}): ${show(v)}">${grp}<span class="mi">${m}</span>${show(v)}</${close}>`;
      }
    }
    host.innerHTML = h;
  }

  // ---------- Forme ----------
  function literalsOf(list, fn) { return list.reduce((s, x) => s + fn(x).length, 0); }

  function renderForms(res) {
    const n = st.n;
    const vars = L.VARS.slice(0, n).join(', ');
    const F = `<var>F</var>(${vars.split(', ').map((v) => '<var>' + v + '</var>').join(', ')})`;
    const d = res.dcs.length ? ` + <span class="f">Σ<sub>d</sub>(${res.dcs.join(', ')})</span>` : '';
    const dP = res.dcs.length ? ` · <span class="f">Π<sub>d</sub>(${res.dcs.join(', ')})</span>` : '';
    $('k-sigma').innerHTML = `${F} = Σ<sub>m</sub>(${res.ones.join(', ') || '—'})${d}`;
    $('k-pi').innerHTML = `${F} = Π<sub>M</sub>(${res.zeros.join(', ') || '—'})${dP}`;

    const canSOP = res.ones.length ? res.ones.map((m) => App.productHTML(L.mintermLiterals(n, m))).join(' + ') : '0';
    const canPOS = res.zeros.length ? res.zeros.map((m) => App.sumHTML(L.maxtermLiterals(n, m))).join(' · ') : '1';
    $('k-can-sop').innerHTML = `<var>F</var> = ${canSOP}`;
    $('k-can-pos').innerHTML = `<var>F</var> = ${canPOS}`;
    $('k-can-sop-meta').textContent = `${res.ones.length} mintermini × ${n} letterali = ${res.ones.length * n} letterali. Ogni mintermine vale 1 in una sola riga della tabella.`;
    $('k-can-pos-meta').textContent = `${res.zeros.length} maxtermini × ${n} letterali = ${res.zeros.length * n} letterali. Ogni maxtermine vale 0 in una sola riga.`;

    const minSOP = res.sop.length ? res.sop.map((p) => App.productHTML(L.productLiterals(n, p))).join(' + ') : '0';
    const minPOS = res.pos.length ? res.pos.map((p) => App.sumHTML(L.sumLiterals(n, p), res.pos.length > 1)).join(' · ') : '1';
    $('k-min-sop').innerHTML = `<var>F</var> = ${minSOP}`;
    $('k-min-pos').innerHTML = `<var>F</var> = ${minPOS}`;
    const lsop = literalsOf(res.sop, (p) => L.productLiterals(n, p));
    const lpos = literalsOf(res.pos, (p) => L.sumLiterals(n, p));
    $('k-min-sop-meta').textContent = `${res.sop.length} termin${res.sop.length === 1 ? 'e' : 'i'}, ${lsop} letterali (erano ${res.ones.length * n} nella forma espansa).`;
    $('k-min-pos-meta').textContent = `${res.pos.length} termin${res.pos.length === 1 ? 'e' : 'i'}, ${lpos} letterali (erano ${res.zeros.length * n} nella forma espansa).`;
  }

  function explainGroups(res) {
    const n = st.n;
    const sop = st.mode === 'sop';
    const groups = sop ? res.sop : res.pos;
    const host = $('k-groups');
    if (!groups.length) {
      host.innerHTML = `<li><span></span><span>${sop ? 'Nessun 1 da raggruppare: la funzione vale sempre 0.' : 'Nessuno 0 da raggruppare: la funzione vale sempre 1.'}</span></li>`;
      return;
    }
    host.innerHTML = groups.map((g, gi) => {
      const cells = L.cellsOf(n, g);
      const color = GROUP_COLORS[gi % GROUP_COLORS.length];
      const gone = [];
      const kept = [];
      for (let i = 0; i < n; i++) {
        const bit = 1 << (n - 1 - i);
        if (g.mask & bit) gone.push(L.VARS[i]);
        else kept.push(L.VARS[i] + ' = ' + (g.bits & bit ? 1 : 0));
      }
      const term = sop ? App.productHTML(L.productLiterals(n, g)) : App.sumHTML(L.sumLiterals(n, g), false);
      const rule = sop
        ? 'variabile a 1 → diretta, a 0 → negata'
        : 'nei gruppi di 0 si scrive al contrario: variabile a 0 → diretta, a 1 → negata';
      const txt = cells.length === 1 << n
        ? `Tutta la mappa: la funzione è costante.`
        : `${cells.length} cell${cells.length === 1 ? 'a' : 'e'} (m${cells.join(', m')}). ` +
          (gone.length ? `Cambiano ${gone.join(' e ')}: spariscono. ` : 'Nessuna variabile cambia. ') +
          `Restano ${kept.join(', ')} (${rule}).`;
      return `<li><span class="gchip" style="--gc:${color}">${term}</span><span>${txt}</span></li>`;
    }).join('');
  }

  // ---------- Circuito ----------
  function currentIndex() {
    let m = 0;
    for (let i = 0; i < st.n; i++) m = m * 2 + (st.ins[i] ? 1 : 0);
    return m;
  }

  function renderCircuit(res) {
    const F = App.Gates.sopCircuit($('k-circ'), st.n, res.sop, st.ins, 'ansi', (i) => {
      st.ins[Number(i)] = !st.ins[Number(i)];
      renderAll();
    });
    const m = currentIndex();
    const want = st.out[m];
    $('k-circ-note').innerHTML = `Ingressi ${L.binary(m, st.n)} → riga m${m} della tabella: <var>F</var> = ${show(want)}. Il circuito dà ${F ? 1 : 0}` +
      (want === 'x' ? ' (qui la funzione è indifferente, va bene tutto).' : want === (F ? 1 : 0) ? ' <span class="check">✓</span>' : '.') +
      ` Servono ${res.sop.filter((p) => L.productLiterals(st.n, p).length > 1).length} porte AND${res.sop.length > 1 ? ' e 1 porta OR' : ''}.`;
  }

  function renderAll() {
    const res = L.analyze(st.n, st.out);
    renderTable(res);
    renderMap($('k-map'), st.n, st.out, st.mode === 'sop' ? res.sop : res.pos, { cur: currentIndex() });
    $('k-map').querySelectorAll('.cell').forEach((c) => {
      const m = Number(c.dataset.m);
      c.addEventListener('click', () => {
        st.out[m] = cycle(st.out[m]);
        renderAll();
        const again = $('k-map').querySelector(`.cell[data-m="${m}"]`);
        if (again) again.focus();
      });
      c.addEventListener('mouseenter', () => hover(m, true));
      c.addEventListener('mouseleave', () => hover(m, false));
    });
    renderForms(res);
    explainGroups(res);
    renderCircuit(res);
    $('k-n').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.n) === st.n)));
    $('k-mode').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === st.mode)));
    $('k-groups-title').textContent = st.mode === 'sop' ? 'Gruppi di 1 → forma minima SP' : 'Gruppi di 0 → forma minima PS';
  }

  function randomFunction(n, withDc) {
    for (let tries = 0; tries < 200; tries++) {
      const size = 1 << n;
      const out = Array.from({ length: size }, () => (Math.random() < (n === 3 ? 0.5 : 0.45) ? 1 : 0));
      if (withDc) {
        const k = App.rand(2, 3);
        App.shuffle([...Array(size).keys()]).slice(0, k).forEach((m) => { out[m] = 'x'; });
      }
      const res = L.analyze(n, out);
      const ones = res.ones.length;
      if (ones < 2 || res.zeros.length < 2) continue;
      if (res.sop.length < 2 || res.sop.length > (n === 3 ? 3 : 4)) continue;
      if (res.sop.every((p) => p.mask === 0)) continue;
      return out;
    }
    return n === 3 ? [1, 0, 1, 0, 1, 1, 1, 0] : [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1];
  }

  // ---------- Allenamento ----------
  const tr = { level: 3, view: 'map', out: null, n: 3, solved: false, shown: false };

  function treeHTML(t, parent) {
    switch (t.op) {
      case 'var': return '<var>' + L.VARS[t.i] + '</var>';
      case 'const': return t.v ? '1' : '0';
      case 'not': return '<span class="ov">' + treeHTML(t.a, 'not') + '</span>';
      case 'and': return treeHTML(t.a, 'and') + treeHTML(t.b, 'and');
      case 'or': {
        const s = treeHTML(t.a, 'or') + ' + ' + treeHTML(t.b, 'or');
        return parent === 'and' ? '(' + s + ')' : s;
      }
      default: return '';
    }
  }

  function newTraining() {
    tr.n = tr.level === 3 ? 3 : 4;
    tr.out = randomFunction(tr.n, tr.level === 5);
    tr.solved = false;
    tr.shown = false;
    $('t-in').value = '';
    const fb = $('t-fb');
    fb.className = 'feedback';
    fb.innerHTML = '';
    renderTraining();
    renderPreview();
  }

  function renderTraining() {
    const res = L.analyze(tr.n, tr.out);
    const vars = L.VARS.slice(0, tr.n).map((v) => '<var>' + v + '</var>').join(', ');
    const host = $('t-problem');
    const mapHost = $('t-map');
    mapHost.hidden = tr.view !== 'map' && !tr.shown;
    if (!mapHost.hidden) renderMap(mapHost, tr.n, tr.out, tr.shown ? res.sop : [], { readonly: true });
    let txt;
    if (tr.view === 'map') txt = `Ricava la forma minima SP della funzione <var>F</var>(${vars}) rappresentata nella mappa.`;
    else if (tr.view === 'sigma') txt = `<var>F</var>(${vars}) = Σ<sub>m</sub>(${res.ones.join(', ')})` + (res.dcs.length ? ` + Σ<sub>d</sub>(${res.dcs.join(', ')})` : '') + '. Trova la forma minima SP.';
    else txt = `Semplifica la forma canonica: <var>F</var> = ${res.ones.map((m) => App.productHTML(L.mintermLiterals(tr.n, m))).join(' + ')}` + (res.dcs.length ? ` (indifferenze: m${res.dcs.join(', m')})` : '') + '.';
    host.innerHTML = txt;
    $('t-level').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.l) === tr.level)));
    $('t-view').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === tr.view)));
    $('t-keypad').querySelectorAll('[data-k="D"]').forEach((b) => { b.disabled = tr.n < 4; });
  }

  function renderPreview() {
    const src = $('t-in').value;
    const pv = $('t-preview');
    if (!src.trim()) {
      pv.innerHTML = '<span class="placeholder">L\'espressione appare qui con le negazioni sopralineate.</span>';
      return null;
    }
    try {
      const t = L.parse(src, tr.n);
      pv.innerHTML = '<var>F</var> = ' + treeHTML(t);
      return t;
    } catch (e) {
      pv.innerHTML = '<span class="placeholder">' + App.esc(e.message) + '</span>';
      return null;
    }
  }

  function checkTraining() {
    const fb = $('t-fb');
    let t;
    try {
      t = L.parse($('t-in').value, tr.n);
    } catch (e) {
      App.feedback(fb, 'warn', 'Non la leggo', App.esc(e.message) + ' Esempio di scrittura: <code>A\'B + AC</code> oppure <code>!A B + A C</code>.');
      return;
    }
    const res = L.analyze(tr.n, tr.out);
    const miss = L.mismatches(t, tr.n, tr.out);
    if (miss.length) {
      const m = miss[0];
      App.feedback(fb, 'bad', 'Non è equivalente',
        `Con ${L.VARS.slice(0, tr.n).join('')} = ${L.binary(m.m, tr.n)} (m${m.m}) la tua espressione vale ${m.got}, ma <var>F</var> vale ${m.want}.` +
        (miss.length > 1 ? ` Le righe sbagliate sono ${miss.length}: ${miss.map((x) => 'm' + x.m).join(', ')}.` : ''));
      return;
    }
    const shape = L.sopShape(t);
    const bestTerms = res.sop.length;
    const bestLits = res.sop.reduce((s, p) => s + L.literalCount(tr.n, p), 0);
    if (!shape) {
      App.feedback(fb, 'warn', 'Giusta, ma…', `È equivalente a <var>F</var>, però non è una somma di prodotti. La forma minima SP ha ${bestTerms} termini e ${bestLits} letterali.`);
      return;
    }
    if (shape.terms <= bestTerms && shape.literals <= bestLits) {
      const first = !tr.solved && !tr.shown;
      tr.solved = true;
      App.feedback(fb, 'ok', 'Perfetta!', `Equivalente e minima: ${shape.terms} termini, ${shape.literals} letterali.` + (first ? '' : ' (Niente punti: avevi già risolto o visto la soluzione.)'));
      if (first) App.xp.add(tr.level === 3 ? 20 : 30, 'Mappa di Karnaugh');
    } else {
      App.feedback(fb, 'warn', 'Quasi', `È equivalente a <var>F</var>, ma non minima: tu hai ${shape.terms} termini e ${shape.literals} letterali, si può arrivare a ${bestTerms} termini e ${bestLits} letterali. Cerca gruppi più grandi o ridondanti.`);
    }
  }

  function showSolution() {
    tr.shown = true;
    const res = L.analyze(tr.n, tr.out);
    renderTraining();
    const minSOP = res.sop.map((p) => App.productHTML(L.productLiterals(tr.n, p))).join(' + ') || '0';
    App.feedback($('t-fb'), 'warn', 'Soluzione', `<var>F</var> = ${minSOP}. I gruppi sono disegnati sulla mappa. Nuovo esercizio quando vuoi.`);
  }

  function insertKey(k) {
    const inp = $('t-in');
    const s = inp.selectionStart ?? inp.value.length;
    const e = inp.selectionEnd ?? inp.value.length;
    if (k === 'back') {
      if (s === e && s > 0) { inp.value = inp.value.slice(0, s - 1) + inp.value.slice(e); inp.setSelectionRange(s - 1, s - 1); }
      else { inp.value = inp.value.slice(0, s) + inp.value.slice(e); inp.setSelectionRange(s, s); }
    } else if (k === 'clear') {
      inp.value = '';
    } else {
      const ins = k === '+' ? ' + ' : k;
      inp.value = inp.value.slice(0, s) + ins + inp.value.slice(e);
      inp.setSelectionRange(s + ins.length, s + ins.length);
    }
    renderPreview();
  }

  App.onReady(function initKarnaugh() {
    if (!$('k-map')) return;
    load(PRESETS.es);
    const sel = $('k-preset');
    sel.innerHTML = Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${p.label} (${p.n} var.)</option>`).join('') + '<option value="rand">Casuale</option><option value="">Modificata da te</option>';
    sel.value = 'es';
    sel.addEventListener('change', () => {
      if (sel.value === 'rand') {
        st.n = App.pick([3, 4]);
        st.out = randomFunction(st.n, Math.random() < 0.3);
      } else load(PRESETS[sel.value]);
      renderAll();
    });
    $('k-n').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const n = Number(b.dataset.n);
      if (n === st.n) return;
      st.n = n;
      st.out = Array(1 << n).fill(0);
      sel.value = '';
      renderAll();
    }));
    $('k-mode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { st.mode = b.dataset.mode; renderAll(); }));
    $('k-clear').addEventListener('click', () => { st.out = Array(1 << st.n).fill(0); sel.value = ''; renderAll(); });
    $('k-invert').addEventListener('click', () => { st.out = st.out.map((v) => (v === 'x' ? 'x' : 1 - v)); sel.value = ''; renderAll(); });

    // allenamento
    $('t-level').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { tr.level = Number(b.dataset.l); newTraining(); }));
    $('t-view').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { tr.view = b.dataset.v; renderTraining(); }));
    $('t-in').addEventListener('input', renderPreview);
    $('t-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') checkTraining(); });
    $('t-keypad').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => insertKey(b.dataset.k)));
    $('t-check').addEventListener('click', checkTraining);
    $('t-show').addEventListener('click', showSolution);
    $('t-new').addEventListener('click', newTraining);

    renderAll();
    newTraining();
  });

  App.Karnaugh = { renderMap, randomFunction, treeHTML };
})();
