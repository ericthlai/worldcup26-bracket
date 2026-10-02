import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/group-results-2026.json', import.meta.url), 'utf8'));
const annexSource = readFileSync(new URL('../data/annexc.js', import.meta.url), 'utf8');

function loadApp(page, { withAnnexC = true, withKnockout = false } = {}) {
  class Component {
    setState(patch) { Object.assign(this.state, patch); }
  }
  const window = {};
  const context = vm.createContext({
    preact: { Component, h() {}, render() {}, createRef: () => ({}) },
    htm: { bind: () => () => null },
    window, document: { getElementById: () => ({}) },
    localStorage: { getItem: () => null, setItem() {} },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {}
  });
  if (withAnnexC) vm.runInContext(annexSource, context);
  const source = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
  const script = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  vm.runInContext(script + '\nglobalThis.TestApp = App;', context);
  const app = new context.TestApp({});
  app.fetchOdds = () => {};
  app.fetchResults = () => {};
  app.componentDidMount();
  const results = {};
  for (const [x, y, sx, sy] of fixture.results) {
    const [a, b, sa, sb] = x < y ? [x, y, sx, sy] : [y, x, sy, sx];
    results[a + '|' + b] = { a, b, sa, sb, fin: true, live: false, win: sa === sb ? null : (sa > sb ? a : b) };
  }
  if (withKnockout) {
    for (const [x, y, sx, sy, win] of fixture.knockout) {
      const [a, b, sa, sb] = x < y ? [x, y, sx, sy] : [y, x, sy, sx];
      results[a + '|' + b] = { a, b, sa, sb, fin: true, live: false, win };
    }
  }
  app.state.results = results;
  return { app, window };
}

const plain = value => JSON.parse(JSON.stringify(value));

test('data/annexc.js is a structurally valid Annex C table', () => {
  const { app, window } = loadApp('index.html');
  const { winners, rows } = plain(window.WC_ANNEXC);
  const keys = Object.keys(rows);
  assert.equal(winners, 'ABDEGIKL');
  assert.equal(keys.length, 495);
  const slots = app.KO.filter(m => m.no <= 88 && m.b.k === 't');
  assert.equal(slots.length, 8);
  for (const key of keys) {
    assert.match(key, /^[A-L]{8}$/);
    assert.equal([...new Set(key)].sort().join(''), key, 'key must be 8 distinct sorted letters: ' + key);
    assert.equal([...rows[key]].sort().join(''), key, 'value must be a permutation of its key: ' + key);
    for (const m of slots) {
      assert.ok(m.b.gs.includes(rows[key][winners.indexOf(m.a.g)]), `${key}: slot ${m.no} outside its allowed groups`);
    }
  }
  // Anchor rows (first and last rows of FIFA Annexe C).
  assert.equal(rows.EFGHIJKL, 'EJIFHGLK');
  assert.equal(rows.ABCDEFGH, 'HGBCAFDE');
});

for (const page of ['index.html', 'zh/index.html']) {
  test(page + ': group tables match the official final standings', () => {
    const { app } = loadApp(page);
    for (const [g, order] of Object.entries(fixture.groupOrder)) {
      assert.deepEqual(plain(app.groupTable(g).rows.map(r => r.code)), order, 'group ' + g);
    }
  });

  test(page + ': best thirds follow the Annex C table', () => {
    const { app } = loadApp(page);
    const realRank = {};
    for (const g of Object.keys(fixture.groupOrder)) realRank[g] = app.groupTable(g).rows.map(r => r.code);
    assert.deepEqual(plain(app.computeRealThirds(realRank)), fixture.realThirds);
  });

  test(page + ': the real bracket resolves every knockout match once all results are in', () => {
    const { app } = loadApp(page, { withKnockout: true });
    const R = app.realData();
    assert.equal(Object.keys(R.realWinners).length, 32, 'every knockout match resolves to a real winner');
    assert.equal(R.realWinners[103], 'eng');
    assert.equal(R.realWinners[104], 'esp');
  });

  test(page + ': best-third assignment falls back to eligibility matching without the table', () => {
    const { app, window } = loadApp(page, { withAnnexC: false });
    assert.equal(window.WC_ANNEXC, undefined);
    const realRank = {};
    for (const g of Object.keys(fixture.groupOrder)) realRank[g] = app.groupTable(g).rows.map(r => r.code);
    const out = app.computeRealThirds(realRank);
    assert.equal(Object.keys(out).length, 8);
    assert.equal(new Set(Object.values(out)).size, 8, 'each qualified third is used once');
  });
}
