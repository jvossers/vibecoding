import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createCatalogueRepository } from '../js/data/catalogueRepository.js';
import { diskFetch } from './helpers.js';

describe('catalogue repository', () => {
  const repo = createCatalogueRepository({ baseUrl: 'data/', fetchImpl: diskFetch });

  test('loads products and finds them by id and SKU', async () => {
    const products = await repo.listProducts();
    assert.ok(products.length >= 120);
    const p = await repo.getProductBySku('qmt-al0200-s96');
    assert.equal(p.sku, 'QMT-AL0200-S96');
    assert.equal((await repo.getProduct(p.id)).sku, p.sku);
    assert.equal(await repo.getProduct('nope'), null);
  });

  test('works out alternatives from the rules', async () => {
    const p = await repo.getProductBySku('QMT-CF1000-R96');
    const alts = await repo.alternativesFor(p.id);
    assert.ok(alts.length >= 2);
    assert.ok(alts.every((a) => a.category === 'pipette_tip' && a.id !== p.id));
    assert.deepEqual(await repo.alternativesFor('nope'), []);
  });

  test('pipettes have no alternatives', async () => {
    const p = await repo.getProductBySku('QMP-AX0200');
    assert.deepEqual(await repo.alternativesFor(p.id), []);
  });

  test('a failed fetch rejects and can be retried', async () => {
    let calls = 0;
    const flaky = createCatalogueRepository({
      baseUrl: 'data/',
      fetchImpl: async (url) => { calls += 1; return calls <= 2 ? { ok: false, status: 503 } : diskFetch(url); },
    });
    await assert.rejects(flaky.listProducts(), /HTTP 503/);
    assert.ok((await flaky.listProducts()).length > 0);
  });
});
