import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { applyFilters, matchesQuery, filtersFromParams, filtersToParams, normalise } from '../js/domain/search.js';
import { loadCatalogue } from './helpers.js';

const { products } = loadCatalogue();
const skus = (list) => list.map((p) => p.sku);

describe('search', () => {
  test('normalises micro-litre spellings', () => {
    assert.equal(normalise('200uL'), '200 µl');
    assert.equal(normalise('200 μl'), '200 µl');
    assert.equal(normalise('1,000 µL'), '1000 µl');
  });

  test('exact SKU ranks first', () => {
    const res = applyFilters(products, { q: 'QMT-AL0200-S96' });
    assert.equal(res[0].sku, 'QMT-AL0200-S96');
  });

  test('attribute keywords mean the attribute, not a substring', () => {
    const sterile = applyFilters(products, { q: 'sterile' });
    assert.ok(sterile.length > 0);
    assert.ok(sterile.every((p) => p.specifications.sterile === true));
    const non = applyFilters(products, { q: 'non-sterile' });
    assert.ok(non.every((p) => p.specifications.sterile === false));
  });

  test('numbers match whole volumes', () => {
    const res = applyFilters(products, { q: 'aerolock 200 µl filter' });
    assert.ok(res.length >= 3);
    assert.ok(res.every((p) => p.family === 'Aerolock' && p.specifications.volumeMaxUl === 200));
  });

  test('unknown words return nothing', () => {
    assert.equal(applyFilters(products, { q: 'zzzzqx' }).length, 0);
  });

  test('user text is only ever compared, never interpreted', () => {
    assert.equal(matchesQuery(products[0], '<img src=x onerror=alert(1)>'), false);
  });
});

describe('filters', () => {
  test('category, status and family', () => {
    const res = applyFilters(products, { category: 'pipette_tip', status: 'out_of_stock', family: 'Aerolock' });
    assert.ok(res.length >= 3);
    assert.ok(res.every((p) => p.category === 'pipette_tip' && p.status === 'out_of_stock' && p.family === 'Aerolock'));
  });

  test('unavailable groups out-of-stock and discontinued', () => {
    const res = applyFilters(products, { status: 'unavailable' });
    assert.ok(res.every((p) => p.status === 'out_of_stock' || p.status === 'discontinued'));
    assert.ok(res.some((p) => p.status === 'discontinued'));
  });

  test('volume range keeps products that overlap it and drops unknown volumes', () => {
    const res = applyFilters(products, { volMin: 50, volMax: 50 });
    assert.ok(res.length > 0);
    for (const p of res) {
      const s = p.specifications;
      assert.ok((s.volumeMinUl ?? s.volumeMaxUl) <= 50 && (s.volumeMaxUl ?? s.volumeMinUl) >= 50, p.sku);
    }
  });

  test('sterile/filtered tri-state includes "not recorded"', () => {
    const unknown = applyFilters(products, { sterile: 'unknown' });
    assert.ok(unknown.length > 0);
    assert.ok(unknown.every((p) => p.specifications.sterile === null));
    const no = applyFilters(products, { filtered: 'no' });
    assert.ok(no.every((p) => p.specifications.filtered === false));
  });

  test('fits filters by instrument family for tips and pipettes', () => {
    const res = applyFilters(products, { fits: 'ifam-vector-lock' });
    assert.ok(res.some((p) => p.category === 'pipette'));
    assert.ok(res.some((p) => p.category === 'pipette_tip'));
    assert.ok(skus(res).every((s) => s.startsWith('QMT-LK') || s.startsWith('QMP-VL') || s.startsWith('QMA-')));
  });

  test('filters round-trip through URL parameters', () => {
    const f = { q: 'tip', category: 'pipette_tip', status: '', volMin: 10, volMax: null, sterile: 'yes', filtered: '', family: '', fits: '' };
    const back = filtersFromParams(filtersToParams(f));
    assert.deepEqual(back, f);
  });
});
