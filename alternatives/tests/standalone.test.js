import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildStandalone } from '../scripts/buildStandalone.js';

describe('single-file build', () => {
  const html = buildStandalone();

  test('standalone/parity.html is up to date', () => {
    assert.equal(readFileSync('standalone/parity.html', 'utf8'), html, 'Run: node scripts/buildStandalone.js');
  });

  test('is self-contained: no external scripts, styles or fetches', () => {
    assert.doesNotMatch(html, /<script[^>]+src=/);
    assert.doesNotMatch(html, /<link[^>]+stylesheet/);
    assert.match(html, /Content-Security-Policy" content="default-src 'none'/);
    const data = JSON.parse(html.match(/<script type="application\/json" id="parity-data">([\s\S]*?)<\/script>/)[1]);
    assert.ok(data.products.length >= 120 && data.families.length > 0);
  });
});
