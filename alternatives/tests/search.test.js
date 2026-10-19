import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { applyFilters, matchesQuery, filtersFromParams, filtersToParams, normalise, nominalVolumes, DEFAULT_FILTERS } from '../js/domain/search.js';
import { loadCatalogue } from './helpers.js';

const { products } = loadCatalogue();

describe('search', () => {
  test('normalises micro-litre spellings', () => {
    assert.equal(normalise('200uL'), '200 µl');
    assert.equal(normalise('200 μl'), '200 µl');
    assert.equal(normalise('1,000 µL'), '1000 µl');
  });

  test('exact SKU ranks first', () => {
    assert.equal(applyFilters(products, { q: 'QMT-AL0200-S96' })[0].sku, 'QMT-AL0200-S96');
  });

  test('attribute keywords mean the attribute, not a substring', () => {
    const sterile = applyFilters(products, { q: 'sterile' });
    assert.ok(sterile.length > 0);
    assert.ok(sterile.every((p) => p.specifications.sterile === true));
    assert.ok(applyFilters(products, { q: 'non-sterile' }).every((p) => p.specifications.sterile === false));
  });

  test('numbers match whole volumes', () => {
    const res = applyFilters(products, { q: 'aerolock 200 µl filter' });
    assert.ok(res.length >= 3);
    assert.ok(res.every((p) => p.family === 'Aerolock' && p.specifications.volumeMaxUl === 200));
  });

  test('unknown words return nothing, and input is only compared', () => {
    assert.equal(applyFilters(products, { q: 'zzzzqx' }).length, 0);
    assert.equal(matchesQuery(products[0], '<img src=x onerror=alert(1)>'), false);
  });
});

describe('filters', () => {
  test('category, range and volume', () => {
    const res = applyFilters(products, { category: 'pipette_tip', family: 'Aerolock', volume: '200' });
    assert.ok(res.length >= 3);
    assert.ok(res.every((p) => p.family === 'Aerolock' && p.specifications.volumeMaxUl === 200));
  });

  test('sterile and filtered yes/no only apply to tips', () => {
    const res = applyFilters(products, { sterile: 'yes', filtered: 'no' });
    assert.ok(res.length > 0);
    assert.ok(res.every((p) => p.category === 'pipette_tip' && p.specifications.sterile && !p.specifications.filtered));
  });

  test('volume options come from the catalogue', () => {
    const vols = nominalVolumes(products);
    assert.ok(vols.includes(200) && vols.includes(1000));
    assert.deepEqual(vols, [...vols].sort((a, b) => a - b));
  });

  test('filters round-trip through URL parameters', () => {
    const f = { ...DEFAULT_FILTERS, q: 'tip', category: 'pipette_tip', volume: '200', sterile: 'yes' };
    assert.deepEqual(filtersFromParams(filtersToParams(f)), f);
  });
});
