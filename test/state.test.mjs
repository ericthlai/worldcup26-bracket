import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

function loadApp(page, saved = null) {
  const writes = [];
  class Component {
    setState(patch) { Object.assign(this.state, patch); }
  }
  const context = vm.createContext({
    preact: { Component, h() {}, render() {}, createRef: () => ({}) },
    htm: { bind: () => () => null },
    window: {}, document: { getElementById: () => ({}) },
    localStorage: {
      getItem: () => saved,
      setItem: (key, value) => writes.push({ key, value })
    },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {}
  });
  const source = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
  const script = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  vm.runInContext(script + '\nglobalThis.TestApp = App;', context);
  const app = new context.TestApp({});
  app.fetchOdds = () => {};
  app.fetchResults = () => {};
  return { app, writes, storage: context.localStorage };
}

const plain = value => JSON.parse(JSON.stringify(value));

for (const page of ['index.html', 'zh/index.html']) {
  test(page + ': restore removes malformed groups, duplicates, and foreign teams', () => {
    const saved = JSON.stringify({
      rank: { A: ['mex', 'mex', 'bra', 'rsa', null], B: 'can', C: null, Z: ['mex'] },
      thirds: { invalid: 'mex', '74b': 'bra' },
      winners: { invalid: 'mex', '104': 'unknown' }
    });
    const { app } = loadApp(page, saved);
    app.componentDidMount();
    assert.deepEqual(plain(app.state.rank), { A: ['mex', 'rsa'] });
    assert.deepEqual(plain(app.state.thirds), {});
    assert.deepEqual(plain(app.state.winners), {});
    assert.doesNotThrow(() => app.tapTeam('B', 'can'));
  });

  test(page + ': invalid collection types recover without losing valid picks', () => {
    const { app } = loadApp(page, JSON.stringify({
      rank: { A: ['mex', 'rsa'] }, thirds: [], winners: 'mex'
    }));
    app.componentDidMount();
    assert.deepEqual(plain(app.state.rank), { A: ['mex', 'rsa'] });
    assert.deepEqual(plain(app.state.thirds), {});
    assert.deepEqual(plain(app.state.winners), {});
    assert.doesNotThrow(() => app.setWinner(73, 'rsa'));
  });

  test(page + ': valid partial picks and dependent winners survive, then cascade on reset', () => {
    const { app } = loadApp(page, JSON.stringify({
      rank: { A: ['mex', 'rsa', 'kor'], B: ['can', 'sui'] },
      thirds: { '74b': 'kor' }, winners: { 73: 'rsa', 90: 'rsa' }
    }));
    app.componentDidMount();
    assert.equal(app.state.thirds['74b'], 'kor');
    assert.equal(app.state.winners[90], 'rsa');
    app.resetGroup('A');
    assert.deepEqual(plain(app.state.thirds), {});
    assert.deepEqual(plain(app.state.winners), {});
  });

  test(page + ': a pick is saved before an immediate navigation or language switch', () => {
    const { app, writes } = loadApp(page);
    app.tapTeam('A', 'mex');
    assert.equal(writes.length, 1);
    assert.equal(writes[0].key, 'wc26v2-state');
    assert.deepEqual(JSON.parse(writes[0].value).rank, { A: ['mex'] });
  });

  test(page + ': invalid JSON and unavailable storage do not prevent picking', () => {
    const { app, storage } = loadApp(page, '{broken');
    app.componentDidMount();
    storage.setItem = () => { throw new Error('Storage unavailable'); };
    assert.doesNotThrow(() => app.tapTeam('A', 'mex'));
  });
}
