import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { generateCatalogue } from '../scripts/generateSyntheticCatalogue.js';
import { validateCatalogue, packSizeFromName } from '../js/domain/validation.js';
import { evaluateCandidate, defaultRequirements, isEligible } from '../js/domain/matching.js';
import { UNAVAILABLE } from '../js/domain/attributes.js';
import { loadCatalogue } from './helpers.js';

const data = loadCatalogue();
const byId = Object.fromEntries(data.products.map((p) => [p.id, p]));
const families = Object.fromEntries(data.families.map((f) => [f.id, f]));

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
    assert.deepEqual(JSON.parse(JSON.stringify(a.relationships)), data.relationships);
    assert.deepEqual(JSON.parse(JSON.stringify(a.alternatives)), data.alternatives);
  });

  test('a different seed changes the synthetic stock but not the structure', () => {
    const other = generateCatalogue(7);
    assert.equal(other.products.length, data.products.length);
    assert.notDeepEqual(other.products.map((p) => p.stockQuantity), data.products.map((p) => p.stockQuantity));
  });
});

describe('catalogue size and coverage', () => {
  const count = (fn) => data.products.filter(fn).length;

  test('120–180 SKUs, at least 100 tips plus instruments and accessories', () => {
    assert.ok(data.products.length >= 120 && data.products.length <= 180);
    assert.ok(count((p) => p.category === 'pipette_tip') >= 100);
    assert.ok(count((p) => p.category === 'pipette') > 0);
    assert.ok(count((p) => p.category === 'accessory') > 0);
  });

  test('at least 15 out-of-stock records', () => {
    assert.ok(count((p) => p.status === 'out_of_stock') >= 15);
  });

  test('at least 30 source products with 2–5 eligible candidates', () => {
    const eligible = {};
    for (const a of data.alternatives) if (isEligible(a.classification)) eligible[a.sourceProductId] = (eligible[a.sourceProductId] ?? 0) + 1;
    assert.ok(Object.values(eligible).filter((n) => n >= 2 && n <= 5).length >= 30);
  });

  test('at least 15 unavailable source products', () => {
    const sources = new Set(data.alternatives.map((a) => a.sourceProductId));
    assert.ok([...sources].filter((id) => UNAVAILABLE.has(byId[id].status)).length >= 15);
  });

  test('at least 10 close-looking products rejected by a critical mismatch', () => {
    const lookalikes = data.alternatives.filter((a) => a.classification === 'not_compatible'
      && byId[a.sourceProductId].specifications.volumeMaxUl === byId[a.candidateProductId].specifications.volumeMaxUl);
    assert.ok(lookalikes.length >= 10);
  });

  test('at least 10 insufficient-data examples and some incomplete products', () => {
    assert.ok(data.alternatives.filter((a) => a.classification === 'insufficient_data').length >= 10);
    const incomplete = data.products.filter((p) => p.category === 'pipette_tip'
      && Object.values(p.specifications).some((v) => v === null) && p.tags.includes('incomplete record'));
    assert.ok(incomplete.length >= 10);
  });

  test('a mixture of equivalent, conditional and blocked candidates', () => {
    assert.ok(data.alternatives.some((a) => a.specEquivalent));
    assert.ok(data.alternatives.some((a) => a.classification === 'conditional'));
    assert.ok(data.alternatives.some((a) => a.classification === 'candidate' && !a.specEquivalent));
  });
});

describe('internal consistency', () => {
  const tips = data.products.filter((p) => p.category === 'pipette_tip');

  test('named pack size matches its numeric value', () => {
    for (const p of tips) assert.equal(packSizeFromName(p.name), p.specifications.unitsPerPack, p.sku);
  });

  test('filtration and sterility fields agree', () => {
    for (const { sku, specifications: s } of tips) {
      if (s.filtered !== true) assert.equal(s.filterMaterial, null, sku);
      if (s.sterile !== true) assert.equal(s.sterilizationMethod, null, sku);
    }
  });

  test('unknowns are stored as null, never silently as false', () => {
    const legacy = tips.filter((p) => p.family === 'Heritage');
    assert.ok(legacy.some((p) => p.specifications.sterile === null));
    assert.ok(legacy.some((p) => p.specifications.filtered === null));
    assert.ok(legacy.some((p) => p.stockQuantity === null));
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

describe('relationships', () => {
  test('at least 20 relationships covering every type', () => {
    assert.ok(data.relationships.length >= 20);
    const types = new Set(data.relationships.map((r) => r.type));
    for (const t of ['compatible_with', 'accessory_for', 'same_family', 'related', 'supersedes', 'published_substitute']) assert.ok(types.has(t), t);
  });

  test('every relationship refers to existing products and is synthetic', () => {
    for (const r of data.relationships) {
      assert.ok(byId[r.sourceProductId] && byId[r.targetProductId], r.id);
      assert.equal(r.origin, 'synthetic_demo');
      assert.doesNotMatch(r.evidenceNote, /manufacturer[- ]published|approved|certified|guaranteed/i);
    }
  });

  test('direction is meaningful: tips point at the pipettes they fit', () => {
    for (const r of data.relationships.filter((x) => x.type === 'compatible_with')) {
      const a = byId[r.sourceProductId], b = byId[r.targetProductId];
      assert.equal(a.category, 'pipette_tip');
      assert.equal(b.category, 'pipette');
      assert.ok(a.specifications.compatibleInstrumentFamilies.includes(b.specifications.instrumentFamilyId));
    }
  });
});

describe('stored alternatives', () => {
  test('match a fresh evaluation with default requirements', () => {
    for (const a of data.alternatives) {
      const fresh = evaluateCandidate(byId[a.sourceProductId], byId[a.candidateProductId],
        defaultRequirements(byId[a.sourceProductId]), { families });
      assert.equal(fresh.classification, a.classification, a.id);
      assert.equal(fresh.score, a.score, a.id);
    }
  });

  test('equipment is never presented as a substitute consumable', () => {
    for (const a of data.alternatives) {
      if (isEligible(a.classification)) {
        assert.equal(byId[a.candidateProductId].category, 'pipette_tip');
        assert.equal(byId[a.sourceProductId].category, 'pipette_tip');
      }
    }
  });

  test('no approval on blocked or unassessable pairs', () => {
    for (const a of data.alternatives) if (a.reviewStatus === 'approved_for_demo') assert.ok(isEligible(a.classification), a.id);
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
    const text = JSON.stringify(data).toLowerCase();
    const words = new Set(text.split(/[^a-z.]+/).filter(Boolean));
    for (const w of words) {
      const h = createHash('sha256').update(w).digest('hex').slice(0, 16);
      assert.ok(!DENY.has(h), `found a denied name in the fixtures (hash ${h})`);
    }
  });

  test('one fictional brand, no external URLs', () => {
    assert.deepEqual([...new Set(data.products.map((p) => p.brand))], ['Quellmark']);
    assert.doesNotMatch(JSON.stringify(data), /https?:\/\//);
  });

  test('claims are not presented as certification', () => {
    assert.doesNotMatch(JSON.stringify(data.products), /certif|approved|guaranteed/i);
  });
});
