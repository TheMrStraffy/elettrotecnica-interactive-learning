/* Scheda 4 — Sistemi di numerazione: binario, ottale, esadecimale, BCD, complemento a 2 */
(function () {
  'use strict';
  const App = window.App;
  const $ = (id) => document.getElementById(id);
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = (n) => String(n).split('').map((d) => SUP[d]).join('');
  const bin = (v, n) => (v >>> 0).toString(2).padStart(n, '0');
  const group = (s, k) => {
    const out = [];
    for (let i = s.length; i > 0; i -= k) out.unshift(s.slice(Math.max(0, i - k), i));
    return out;
  };

  // ---------- Registro ----------
  const reg = { n: 8, v: 0b10100100, base: 2 };

  function signed(v, n) { return v >= 1 << (n - 1) ? v - (1 << n) : v; }

  function renderRegister() {
    const host = $('bin-bits');
    const n = reg.n;
    host.innerHTML = '';
    host.style.setProperty('--n', n);
    for (let i = n - 1; i >= 0; i--) {
      const on = (reg.v >> i) & 1;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bit' + (on ? ' on' : '') + (i % 4 === 3 && i !== n - 1 ? ' nib' : '');
      b.setAttribute('aria-pressed', String(!!on));
      b.setAttribute('aria-label', 'bit ' + i + ', peso ' + (1 << i) + ', vale ' + on);
      b.innerHTML = `<span class="w">2${sup(i)}</span><span class="b">${on}</span><span class="w2">${1 << i}</span>`;
      b.addEventListener('click', () => { reg.v ^= 1 << i; renderAll(); });
      host.appendChild(b);
    }
    const v = reg.v;
    const s = bin(v, n);
    $('bin-dec').textContent = v;
    $('bin-sgn').textContent = signed(v, n);
    $('bin-hex').textContent = v.toString(16).toUpperCase().padStart(Math.ceil(n / 4), '0');
    $('bin-oct').textContent = v.toString(8);
    $('bin-bcd').textContent = String(v).split('').map((d) => bin(Number(d), 4)).join(' ');
    $('bin-range').innerHTML = `Con ${n} bit: senza segno da 0 a ${(1 << n) - 1} (2${sup(n)} − 1); in complemento a 2 da −${1 << (n - 1)} a ${(1 << (n - 1)) - 1}. MSB = bit ${n - 1} (peso ${1 << (n - 1)}), LSB = bit 0.`;

    // somma dei pesi
    const parts = [];
    const vals = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = (v >> i) & 1;
      parts.push(`${d}·2${sup(i)}`);
      if (d) vals.push(1 << i);
    }
    $('bin-weights').innerHTML = `<span class="mono">${group(s, 4).join(' ')}</span><sub>2</sub> = ${parts.join(' + ')} = ${vals.length ? vals.join(' + ') : '0'} = <span class="res">${v}</span><sub>10</sub>`;
    $('bin-hexgroup').innerHTML = group(s, 4).map((g) => `<span class="grp"><span class="mono">${g}</span><b>${parseInt(g, 2).toString(16).toUpperCase()}</b></span>`).join('') + `<span class="eqres">= ${v.toString(16).toUpperCase()}<sub>16</sub></span>`;
    $('bin-octgroup').innerHTML = group(s, 3).map((g) => `<span class="grp"><span class="mono">${g.padStart(3, '0')}</span><b>${parseInt(g, 2).toString(8)}</b></span>`).join('') + `<span class="eqres">= ${v.toString(8)}<sub>8</sub></span>`;
    if (!inputFocused) $('bin-in').value = v;
  }

  // ---------- Divisioni successive ----------
  function renderDivisions() {
    const b = reg.base;
    let N = reg.v;
    const digit = (d) => d.toString(16).toUpperCase();
    const rows = [];
    if (N === 0) rows.push([0, 0, 0]);
    while (N > 0) {
      rows.push([N, Math.floor(N / b), N % b]);
      N = Math.floor(N / b);
    }
    const res = reg.v.toString(b).toUpperCase();
    $('div-table').innerHTML = `
      <thead><tr><th>Dividendo</th><th>: ${b}</th><th>Quoziente</th><th>Resto</th></tr></thead>
      <tbody>${rows.map((r, i) => `<tr><td>${r[0]}</td><td>: ${b}</td><td>${r[1]}</td><td class="rem">${digit(r[2])}${b === 16 && r[2] > 9 ? ' <span class="hint">(' + r[2] + ')</span>' : ''}${i === rows.length - 1 ? ' <span class="hint">← MSB</span>' : i === 0 ? ' <span class="hint">← LSB</span>' : ''}</td></tr>`).join('')}</tbody>`;
    $('div-result').innerHTML = `Leggi i resti dal basso verso l'alto: ${reg.v}<sub>10</sub> = <span class="res">${res}</span><sub>${b}</sub>`;
    $('div-base').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(Number(x.dataset.b) === b)));
  }

  // ---------- Aritmetica ----------
  const ar = { a: 45, b: 28, op: 'add' };

  function addCols(x, y, n) {
    let c = 0;
    let sum = 0;
    const carries = [];
    for (let i = 0; i < n; i++) {
      carries[i] = c;
      const s = ((x >> i) & 1) + ((y >> i) & 1) + c;
      sum |= (s & 1) << i;
      c = s >> 1;
    }
    return { sum, carries, cout: c };
  }

  function renderArith() {
    const n = 8;
    const mask = 255;
    const A = ar.a & mask;
    const B = ar.b & mask;
    const sub = ar.op === 'sub';
    const B2 = sub ? (~B + 1) & mask : B;
    const r = addCols(A, B2, n);
    const cell = (s, cls = '') => `<td class="${cls}">${s}</td>`;
    const rowBits = (v, cls) => [...bin(v, n)].map((d) => cell(d, cls)).join('');
    const carryRow = [cell(r.cout ? '1' : '', 'carry')];
    for (let i = n - 1; i >= 0; i--) carryRow.push(cell(r.carries[i] ? '1' : '', 'carry'));
    let pre = '';
    if (sub) {
      const c1 = ~B & mask;
      pre = `<p class="f">Complemento a 2 di <var>B</var>: ${B}<sub>10</sub> = <span class="mono">${bin(B, n)}</span> → inverti i bit (C1) <span class="mono">${bin(c1, n)}</span> → aggiungi 1 → <span class="mono res">${bin(B2, n)}</span> = −${B} in C2.</p>`;
    }
    const sRes = signed(r.sum, n);
    const ovfSigned = sub
      ? (signed(A, n) - signed(B, n)) !== sRes
      : ((A ^ r.sum) & (B2 ^ r.sum) & 0x80) !== 0;
    let notes = '';
    if (!sub) {
      notes += r.cout
        ? `<p>Riporto finale = 1: il risultato vero (${A + B}) non sta in 8 bit senza segno (max 255). <strong>Overflow</strong> per i numeri senza segno.</p>`
        : `<p>Nessun riporto finale: in 8 bit senza segno ${A} + ${B} = <span class="res">${r.sum}</span>.</p>`;
      if (ovfSigned) notes += `<p>Letti in complemento a 2 (${signed(A, n)} + ${signed(B, n)}) c'è <strong>overflow</strong>: due numeri dello stesso segno danno un risultato di segno opposto.</p>`;
    } else {
      notes += `<p>Il riporto finale ${r.cout ? '(1) ' : ''}si scarta. Risultato: <span class="mono">${bin(r.sum, n)}</span> = <span class="res">${sRes}</span> in complemento a 2${A >= B ? '' : ' (è negativo: il MSB è 1)'}. Controllo: ${A} − ${B} = ${A - B}${A - B === sRes ? ' <span class="check">✓</span>' : ''}.</p>`;
      if (sRes < 0) notes += `<p>Per leggere un negativo: fai di nuovo il C2 di <span class="mono">${bin(r.sum, n)}</span> → <span class="mono">${bin((~r.sum + 1) & mask, n)}</span> = ${-sRes}, quindi il valore è −${-sRes}.</p>`;
    }
    $('ar-table').innerHTML = `
      <tbody>
        <tr class="lab-row"><th>riporti</th>${carryRow.join('')}</tr>
        <tr><th><var>A</var> = ${A}</th>${cell('')}${rowBits(A)}</tr>
        <tr><th>${sub ? 'C2(<var>B</var>)' : '<var>B</var> = ' + B}</th>${cell('+', 'op')}${rowBits(B2, sub ? 'res' : '')}</tr>
        <tr class="sum"><th>${sub ? '<var>A</var> − <var>B</var>' : '<var>A</var> + <var>B</var>'}</th>${cell(r.cout ? '1' : '', sub ? 'drop' : 'carry')}${rowBits(r.sum, 'res')}</tr>
      </tbody>`;
    $('ar-pre').innerHTML = pre;
    $('ar-notes').innerHTML = notes;
    $('ar-op').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.op === ar.op)));
  }

  // ---------- Gioco: accendi i bit ----------
  const game = { target: 0, v: 0, t0: 0, done: false };

  function newGame() {
    game.target = App.rand(1, 255);
    game.v = 0;
    game.done = false;
    game.t0 = Date.now();
    $('bg-target').textContent = game.target;
    const fb = $('bg-fb');
    fb.className = 'feedback';
    fb.innerHTML = '';
    renderGame();
  }

  function renderGame() {
    const host = $('bg-bits');
    host.innerHTML = '';
    host.style.setProperty('--n', 8);
    for (let i = 7; i >= 0; i--) {
      const on = (game.v >> i) & 1;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bit' + (on ? ' on' : '') + (i === 3 ? ' nib' : '');
      b.setAttribute('aria-pressed', String(!!on));
      b.setAttribute('aria-label', 'bit di peso ' + (1 << i));
      b.innerHTML = `<span class="w">${1 << i}</span><span class="b">${on}</span>`;
      b.addEventListener('click', () => {
        if (game.done) return;
        game.v ^= 1 << i;
        renderGame();
        if (game.v === game.target) {
          game.done = true;
          const s = Math.round((Date.now() - game.t0) / 1000);
          const pts = s <= 10 ? 15 : 10;
          App.feedback($('bg-fb'), 'ok', 'Preso!', `${game.target} = <span class="mono">${bin(game.target, 8)}</span>₂ in ${s} s.` + (s <= 10 ? ' Velocissimo.' : ''));
          App.xp.add(pts, 'Numeri binari');
        }
      });
      host.appendChild(b);
    }
    $('bg-now').textContent = game.v;
  }

  let inputFocused = false;

  function renderAll() {
    renderRegister();
    renderDivisions();
  }

  App.onReady(function initBinary() {
    if (!$('bin-bits')) return;
    $('bin-n').querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        reg.n = Number(b.dataset.n);
        reg.v &= (1 << reg.n) - 1;
        $('bin-n').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        renderAll();
      })
    );
    const inp = $('bin-in');
    const fmt = $('bin-fmt');
    const fromInput = () => {
      const raw = inp.value.trim().replace(/\s+/g, '');
      const base = Number(fmt.value);
      const ok = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[base].test(raw);
      const v = ok ? parseInt(raw, base) : NaN;
      const max = (1 << reg.n) - 1;
      if (!ok || v > max) {
        inp.classList.toggle('invalid', raw.length > 0);
        $('bin-in-fb').textContent = raw.length ? (ok ? 'Troppo grande per ' + reg.n + ' bit (massimo ' + max + ').' : 'Cifre non valide in base ' + base + '.') : '';
        return;
      }
      inp.classList.remove('invalid');
      $('bin-in-fb').textContent = '';
      reg.v = v;
      renderAll();
    };
    inp.addEventListener('focus', () => { inputFocused = true; });
    inp.addEventListener('blur', () => { inputFocused = false; });
    inp.addEventListener('input', fromInput);
    fmt.addEventListener('change', () => {
      inp.value = reg.v.toString(Number(fmt.value)).toUpperCase();
      fromInput();
    });
    $('div-base').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { reg.base = Number(b.dataset.b); renderDivisions(); }));

    const fa = App.linkField($('ar-a-r'), $('ar-a'), { min: 0, max: 255, step: 1, sig: 3, value: ar.a, onChange: (v) => { ar.a = Math.round(v); renderArith(); } });
    const fb = App.linkField($('ar-b-r'), $('ar-b'), { min: 0, max: 255, step: 1, sig: 3, value: ar.b, onChange: (v) => { ar.b = Math.round(v); renderArith(); } });
    $('ar-op').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { ar.op = b.dataset.op; renderArith(); }));
    $('ar-rand').addEventListener('click', () => {
      ar.a = App.rand(0, 255);
      ar.b = App.rand(0, 255);
      fa.set(ar.a);
      fb.set(ar.b);
      renderArith();
    });
    $('bg-new').addEventListener('click', newGame);

    renderAll();
    renderArith();
    newGame();
  });
})();
