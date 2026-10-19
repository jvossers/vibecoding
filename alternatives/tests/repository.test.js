import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createCatalogueRepository } from '../js/data/catalogueRepository.js';
import { createReviewStore, REVIEW_STORAGE_KEY } from '../js/data/reviewStore.js';
import { diskFetch } from './helpers.js';

function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    dump: () => Object.fromEntries(m),
  };
}

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

  test('relationships keep their direction', async () => {
    const tip = await repo.getProductBySku('QMT-AL0200-S96');
    const rels = await repo.relationshipsFor(tip.id);
    const supersedes = rels.find((r) => r.relationship.type === 'supersedes');
    assert.equal(supersedes.direction, 'outgoing');
    const legacy = await repo.getProductBySku('QMT-HC0200-B');
    const back = (await repo.relationshipsFor(legacy.id)).find((r) => r.relationship.type === 'supersedes');
    assert.equal(back.direction, 'incoming');
    assert.equal(back.other.id, tip.id);
  });

  test('seeded alternatives are grouped by source', async () => {
    const tip = await repo.getProductBySku('QMT-AL0200-S96');
    const seeds = await repo.seedsForSource(tip.id);
    assert.ok(seeds.length >= 2);
    assert.ok(seeds.every((s) => s.sourceProductId === tip.id));
  });

  test('a failed fetch rejects and can be retried', async () => {
    let calls = 0;
    const flaky = createCatalogueRepository({
      baseUrl: 'data/',
      fetchImpl: async (url) => { calls += 1; return calls <= 4 ? { ok: false, status: 503 } : diskFetch(url); },
    });
    await assert.rejects(flaky.listProducts(), /HTTP 503/);
    assert.ok((await flaky.listProducts()).length > 0);
  });
});

describe('review store', () => {
  const seed = { reviewStatus: 'pending', reviewNote: null, reviewedAt: null };

  test('decisions persist across store instances (i.e. a page refresh)', () => {
    const storage = memoryStorage();
    const a = createReviewStore({ storage, now: () => '2026-10-01T10:00:00.000Z' });
    a.setStatus('s1', 'c1', 'approved_for_demo', { classification: 'candidate', seed });
    a.setNote('s1', 'c1', '  Checked the data sheet  ', { seed });
    const b = createReviewStore({ storage });
    const r = b.get('s1', 'c1', seed);
    assert.equal(r.reviewStatus, 'approved_for_demo');
    assert.equal(r.reviewNote, 'Checked the data sheet');
    assert.equal(r.reviewedAt, '2026-10-01T10:00:00.000Z');
    assert.ok(storage.dump()[REVIEW_STORAGE_KEY]);
  });

  test('reset forgets local decisions and restores seeded ones', () => {
    const storage = memoryStorage();
    const store = createReviewStore({ storage });
    const seeded = { reviewStatus: 'rejected', reviewNote: 'Seeded', reviewedAt: '2026-09-01T00:00:00.000Z' };
    store.setStatus('s1', 'c1', 'pending', { classification: 'candidate', seed: seeded });
    assert.equal(store.get('s1', 'c1', seeded).reviewStatus, 'pending');
    store.reset();
    assert.equal(store.get('s1', 'c1', seeded).reviewStatus, 'rejected');
    assert.equal(createReviewStore({ storage }).localPairs().length, 0);
  });

  test('blocked or unassessable pairs cannot be approved', () => {
    const store = createReviewStore({ storage: memoryStorage() });
    assert.throws(() => store.setStatus('s', 'c', 'approved_for_demo', { classification: 'not_compatible' }));
    assert.throws(() => store.setStatus('s', 'c', 'approved_for_demo', { classification: 'insufficient_data' }));
    assert.doesNotThrow(() => store.setStatus('s', 'c', 'rejected', { classification: 'not_compatible' }));
  });

  test('works without storage (private mode) and survives corrupt data', () => {
    const none = createReviewStore({ storage: null });
    none.setStatus('s', 'c', 'rejected', { classification: 'candidate' });
    assert.equal(none.get('s', 'c').reviewStatus, 'rejected');
    const storage = memoryStorage();
    storage.setItem(REVIEW_STORAGE_KEY, '{not json');
    assert.equal(createReviewStore({ storage }).get('s', 'c').reviewStatus, 'pending');
  });
});
