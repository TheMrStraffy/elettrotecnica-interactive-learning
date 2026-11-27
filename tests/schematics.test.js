// Gli schemi tipo sono registrati per nome: un nome ripetuto sostituisce in silenzio quello di prima.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('nessun nome di schema ripetuto', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'schematics.js'), 'utf8');
  const names = [...src.matchAll(/^\s*T\.(\w+)\s*=/gm)].map((m) => m[1]);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  assert.ok(names.length > 20, 'trovati gli schemi');
  assert.deepStrictEqual(dup, [], 'nomi ripetuti: ' + dup.join(', '));
});

test('nessun aiuto ripetuto negli strumenti del quarto anno', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'units', 'q-base.js'), 'utf8');
  const names = [...src.matchAll(/^\s*Q\.(\w+)\s*=/gm)].map((m) => m[1]);
  assert.deepStrictEqual(names.filter((n, i) => names.indexOf(n) !== i), []);
});
