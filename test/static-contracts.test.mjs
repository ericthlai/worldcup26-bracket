import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePaths = ['index.html', 'zh/index.html'];
const expectedFeed =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200';

for (const pagePath of pagePaths) {
  test(`${pagePath} requests the complete tournament result set`, async () => {
    const source = await readFile(new URL(`../${pagePath}`, import.meta.url), 'utf8');

    assert.equal(
      source.split(expectedFeed).length - 1,
      1,
      'the bounded ESPN tournament feed should appear exactly once',
    );
    assert.doesNotMatch(
      source,
      /scoreboard\?dates=20260611-20260719['"]/,
      'an unbounded request can silently stop at ESPN\'s 100-event default',
    );
  });

  test(`${pagePath} retains the corrected Match 61 and 66 venues`, async () => {
    const source = await readFile(new URL(`../${pagePath}`, import.meta.url), 'utf8');

    assert.match(source, /\[61,'2026-06-26','G','bel','nzl','bcplace'\]/);
    assert.match(source, /\[66,'2026-06-26','I','sen','irq','bmo'\]/);
  });
}
