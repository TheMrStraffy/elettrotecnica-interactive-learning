/* Da Ohm a Karnaugh — funzioni condivise: numeri, memoria, punti esperienza, schede */
(function () {
  'use strict';
  const App = (window.App = window.App || {});

  // ---------- Memoria locale (se il browser la blocca, l'app funziona lo stesso) ----------
  App.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem('dok:' + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem('dok:' + key, JSON.stringify(value)); } catch (e) { /* niente memoria: pazienza */ }
    },
  };

  // ---------- Numeri all'italiana (virgola decimale) ----------
  App.num = function (x, sig = 3) {
    if (Number.isNaN(x)) return '—';
    if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
    if (x === 0) return '0';
    const r = Number(x.toPrecision(sig));
    const s = r.toLocaleString('it-IT', { maximumFractionDigits: 12, useGrouping: Math.abs(r) >= 10000 });
    return s.replace('-', '−');
  };

  const PREFIXES = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n']];

  /** 0.0896, 'A' → "89,6 mA" */
  App.si = function (x, unit, sig = 3) {
    if (Number.isNaN(x)) return '— ' + unit;
    if (!isFinite(x)) return '∞ ' + unit;
    if (x === 0) return '0 ' + unit;
    const a = Math.abs(x);
    for (const [f, p] of PREFIXES) {
      const v = Number((a / f).toPrecision(sig));
      if (v >= 1) return App.num(Math.sign(x) * v, sig) + ' ' + p + unit;
    }
    return App.num(x / 1e-9, sig) + ' n' + unit;
  };

  /** Legge "4,7k", "4k7", "0.047", "47 mA", "1M5", "220Ω" → numero. NaN se non valido. */
  App.parseNum = function (str) {
    if (str == null) return NaN;
    let s = String(str).trim().replace(/\s+/g, '').replace(',', '.').replace('−', '-');
    s = s.replace(/(ohm|Ω|V|A|W|S|J)$/i, '');
    if (!s) return NaN;
    const m = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([GMkKmuµn]?)(\d*)$/);
    if (!m) {
      const r = s.match(/^[Rr](\d+)$/); // R47 = 0,47 Ω
      return r ? Number('0.' + r[1]) : NaN;
    }
    if (m[3] && m[1].includes('.')) return NaN;
    const mult = { G: 1e9, M: 1e6, k: 1e3, K: 1e3, m: 1e-3, u: 1e-6, 'µ': 1e-6, n: 1e-9, '': 1 }[m[2]];
    const base = m[3] ? Number(m[1] + '.' + m[3]) : Number(m[1]);
    return base * mult;
  };

  App.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  App.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  App.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  App.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  App.relErr = (got, want) => (want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want));

  App.E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  App.E24 = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];

  /** Valore normalizzato E12 a caso tra min e max (Ω). */
  App.randE12 = function (min, max) {
    const all = [];
    for (let d = 1; d <= 1e6; d *= 10) for (const v of App.E12) {
      const x = Number((v * d).toPrecision(2));
      if (x >= min && x <= max) all.push(x);
    }
    return App.pick(all);
  };

  App.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  App.reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  // ---------- Letterali booleani in HTML (negazione con soprallineatura) ----------
  App.lit = (l) => (l.neg ? '<span class="ov"><var>' + l.v + '</var></span>' : '<var>' + l.v + '</var>');
  App.productHTML = (lits) => (lits.length ? lits.map(App.lit).join('') : '1');
  App.sumHTML = (lits, paren = true) => {
    if (!lits.length) return '0';
    const s = lits.map(App.lit).join(' + ');
    return paren && lits.length > 1 ? '(' + s + ')' : s;
  };

  // ---------- Punti esperienza ----------
  const LEVELS = [
    [0, 'Principiante'],
    [60, 'Apprendista'],
    [160, 'Tecnico'],
    [320, 'Perito'],
    [550, 'Progettista'],
    [900, 'Ingegnere'],
  ];

  function levelOf(p) {
    let i = 0;
    while (i + 1 < LEVELS.length && p >= LEVELS[i + 1][0]) i++;
    return i;
  }

  App.xp = {
    points: App.store.get('xp', 0),
    add(n, why) {
      const before = levelOf(this.points);
      this.points += n;
      App.store.set('xp', this.points);
      renderXP();
      App.toast('+' + n + ' XP', why || '');
      const after = levelOf(this.points);
      if (after > before) setTimeout(() => App.toast('Livello su!', 'Ora sei ' + LEVELS[after][1] + '.'), 700);
    },
  };

  function renderXP() {
    const p = App.xp.points;
    const i = levelOf(p);
    const rank = document.getElementById('xp-rank');
    if (!rank) return;
    rank.textContent = 'Livello ' + (i + 1) + ' · ' + LEVELS[i][1];
    document.getElementById('xp-points').textContent = p;
    const fill = document.getElementById('xp-fill');
    const next = document.getElementById('xp-next');
    if (i + 1 < LEVELS.length) {
      const [lo] = LEVELS[i];
      const [hi, name] = LEVELS[i + 1];
      fill.style.width = (100 * (p - lo)) / (hi - lo) + '%';
      next.textContent = hi - p + ' XP al prossimo livello: ' + name;
    } else {
      fill.style.width = '100%';
      next.textContent = 'Livello massimo raggiunto. Continua ad allenarti!';
    }
  }

  // ---------- Avvisi a comparsa ----------
  App.toast = function (stamp, text) {
    let host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="stamp">' + App.esc(stamp) + '</span><span>' + App.esc(text) + '</span>';
    host.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  };

  /** Mostra un esito nel box .feedback: kind = ok | bad | warn */
  App.feedback = function (el, kind, stamp, html) {
    el.className = 'feedback ' + kind;
    el.innerHTML = '<span class="stamp">' + stamp + '</span><div>' + html + '</div>';
  };

  // ---------- Cursore + casella numerica collegati ----------
  /**
   * opts: { min, max, log, sig, value, onChange(v) }
   * Il cursore può essere logaritmico (utile per le resistenze, da 1 Ω a 10 kΩ).
   */
  App.linkField = function (range, box, opts) {
    const sig = opts.sig || 3;
    const toPos = (v) => (opts.log ? Math.log10(v) : v);
    const fromPos = (p) => (opts.log ? Math.pow(10, p) : p);
    if (opts.log) {
      range.min = Math.log10(opts.min);
      range.max = Math.log10(opts.max);
      range.step = 0.001;
    } else {
      range.min = opts.min;
      range.max = opts.max;
      range.step = opts.step || 'any';
    }
    let value = opts.value;
    const show = () => {
      range.value = toPos(value);
      if (document.activeElement !== box) box.value = App.num(value, sig).replace(/\./g, '');
      box.classList.remove('invalid');
    };
    range.addEventListener('input', () => {
      let v = fromPos(Number(range.value));
      v = opts.log ? Number(v.toPrecision(sig)) : v;
      value = v;
      box.value = App.num(value, sig).replace(/\./g, '');
      opts.onChange(value);
    });
    const commit = (final) => {
      const v = App.parseNum(box.value);
      if (!isFinite(v) || v < opts.min || v > opts.max) {
        if (final) { box.classList.add('invalid'); box.title = 'Valore tra ' + App.num(opts.min) + ' e ' + App.num(opts.max); }
        return;
      }
      box.classList.remove('invalid');
      value = v;
      range.value = toPos(v);
      opts.onChange(value);
    };
    box.addEventListener('input', () => commit(false));
    box.addEventListener('change', () => { commit(true); if (!box.classList.contains('invalid')) show(); });
    show();
    return {
      set(v) { value = v; show(); },
      get() { return value; },
      disable(on) { range.disabled = on; box.disabled = on; },
    };
  };

  // ---------- Schede ----------
  function initTabs() {
    const tabs = [...document.querySelectorAll('.tab')];
    const nav = document.querySelector('.tabs');
    function show(id, focus) {
      tabs.forEach((t) => {
        const on = t.getAttribute('aria-controls') === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        if (on) {
          if (focus) t.focus();
          t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
      App.store.set('tab', id);
      document.dispatchEvent(new CustomEvent('dok:tab', { detail: id }));
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        show(t.getAttribute('aria-controls'));
        const top = nav.getBoundingClientRect().top + window.scrollY - 1;
        if (window.scrollY > top) window.scrollTo({ top });
      });
      t.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = tabs.length - 1;
        if (j !== null) {
          e.preventDefault();
          show(tabs[j].getAttribute('aria-controls'), true);
        }
      });
    });
    document.querySelectorAll('[data-goto]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        show(a.dataset.goto);
        window.scrollTo({ top: nav.getBoundingClientRect().top + window.scrollY - 1 });
      })
    );
    const ids = tabs.map((t) => t.getAttribute('aria-controls'));
    const hash = location.hash.slice(1);
    const saved = App.store.get('tab', ids[0]);
    show(ids.includes(hash) ? hash : ids.includes(saved) ? saved : ids[0]);
  }

  App.isVisible = (el) => !!el && !el.closest('[hidden]');

  const inits = [];
  App.onReady = (fn) => inits.push(fn);

  document.addEventListener('DOMContentLoaded', () => {
    renderXP();
    for (const fn of inits) {
      try { fn(); } catch (e) { console.error(e); }
    }
    initTabs();
  });
})();
