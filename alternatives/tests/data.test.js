import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { generateCatalogue } from '../scripts/generateSyntheticCatalogue.js';
import { validateCatalogue, packSizeFromName } from '../js/domain/validation.js';
import { findAlternatives, isAlternative } from '../js/domain/matching.js';
import { loadCatalogue } from './helpers.js';

const data = loadCatalogue();
const families = Object.fromEntries(data.families.map((f) => [f.id, f]));
const tips = data.products.filter((p) => p.category === 'pipette_tip');

describe('fixtures', () => {
  test('the committed fixtures pass every integrity check', () => {
    assert.deepEqual(validateCatalogue(data), []);
  });

  test('the generator is deterministic and the committed fixtures are up to date', () => {
    const a = generateCatalogue();
    const b = generateCatalogue();
    assert.deepEqual(a.products, b.products);
    assert.deepEqual(a.errors, []);
    assert.deepEqual(JSON.parse(JSON.stringify(a.products)), data.products, 'run: node scripts/generateSyntheticCatalogue.js');
    assert.deepEqual(JSON.parse(JSON.stringify(a.families)), data.families);
  });

  test('no stock or review data is stored', () => {
    for (const p of data.products) {
      for (const key of ['status', 'stockQuantity']) assert.ok(!(key in p), `${p.sku} has ${key}`);
    }
  });
});

describe('catalogue', () => {
  test('at least 120 SKUs, most of them tips', () => {
    assert.ok(data.products.length >= 120);
    assert.ok(tips.length >= 80);
  });

  test('a good share of tips have alternatives, and some have none', () => {
    const counts = tips.map((t) => findAlternatives(t, data.products).length);
    assert.ok(counts.filter((n) => n > 0).length >= 30);
    assert.ok(counts.some((n) => n === 0));
  });

  test('matching is symmetric for the current rules', () => {
    for (const a of tips) for (const b of findAlternatives(a, data.products)) assert.ok(isAlternative(b, a), `${a.sku} / ${b.sku}`);
  });

  test('named pack size matches its numeric value', () => {
    for (const p of tips) assert.equal(packSizeFromName(p.name), p.specifications.unitsPerPack, p.sku);
  });

  test('filtration and sterility fields agree', () => {
    for (const { sku, specifications: s } of tips) {
      if (s.filtered !== true) assert.equal(s.filterMaterial, null, sku);
      if (s.sterile !== true) assert.equal(s.sterilizationMethod, null, sku);
    }
  });

  test('compatibility references point to existing fictional instrument families', () => {
    for (const p of data.products) {
      const s = p.specifications;
      const refs = p.category === 'pipette' ? [s.instrumentFamilyId] : s.compatibleInstrumentFamilies ?? [];
      for (const f of refs) assert.ok(families[f], `${p.sku} -> ${f}`);
    }
  });

  test('SKUs and ids are unique', () => {
    assert.equal(new Set(data.products.map((p) => p.sku)).size, data.products.length);
    assert.equal(new Set(data.products.map((p) => p.id)).size, data.products.length);
  });
});

describe('synthetic branding', () => {
  // SHA-256 prefixes of real manufacturer and product names, so the names themselves
  // never appear in this repository.
  const DENY = new Set(['a7e69dea3f2b28ac', '2a7660930004620a', '1c7f4f61e69b994b', '267f61fc2e6481a9', '2166b51fcc4ebc9c', 'f41660b69c19f065',
    'f257f7d4d0910b7e', 'a0196147fec6598d', '827961b48d1f730d', 'e6a4f57d84437cc8', '7c3cc56409a93bb7', '580a5980bed9eea7', '46497eba130c2f1b',
    '660f5656e3e8f13c', '23f731f65889790f', 'dbf4524a747d72ed', 'f84ea5ed036ece75', 'f2d7182d63ca51d8', 'cee829dde8c65632', '4843f695eeb76fc5',
    'e2b666c9193f23be', 'c18312f72a8233e0', 'b6541a52b1d524e4', 'f29588d33692e4a3', '617b9093b6f0c3d1', 'b9b717f1ebdfee58', '5531d8c01d4826f4',
    'c4e05df089eeeb97', '1e1df5a70375269f', '81c9d6128b5fcd7b', '2cdea657c21f32ae', '2f403509be6bb23e', 'aabf272d001b3077', 'f102e8b17e2926cd',
    '92a7d6c71be758b5', 'bde759918135ed39', '2fd1cfd15db3f387', '2dddbc3ac50cd4d2']);

  test('no real manufacturer or product names anywhere in the data', () => {
    const words = new Set(JSON.stringify(data).toLowerCase().split(/[^a-z.]+/).filter(Boolean));
    for (const w of words) {
      const h = createHash('sha256').update(w).digest('hex').slice(0, 16);
      assert.ok(!DENY.has(h), `found a denied name in the fixtures (hash ${h})`);
    }
  });

  test('one fictional brand, no external URLs', () => {
    assert.deepEqual([...new Set(data.products.map((p) => p.brand))], ['Quellmark']);
    assert.doesNotMatch(JSON.stringify(data), /https?:\/\//);
  });
});
