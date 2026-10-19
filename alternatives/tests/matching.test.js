import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateCandidate, defaultRequirements, findAlternatives, candidatePool } from '../js/domain/matching.js';
import { FAMILIES, tip, pipette } from './helpers.js';

const ctx = { families: FAMILIES };
const evaluate = (source, candidate, req = {}) =>
  evaluateCandidate(source, candidate, { ...defaultRequirements(source), ...req }, ctx);
const blockedOn = (r, field) => r.differences.some((d) => d.field === field && d.severity === 'blocking');

describe('defaults', () => {
  test('requirements default from the source product', () => {
    const src = tip({ sterile: true, filtered: false, lowRetention: true, tipFormat: 'wide_bore' });
    assert.deepEqual(defaultRequirements(src), {
      volumeMinUl: 2, volumeMaxUl: 200, sterile: true, filtered: false, lowRetention: true, wideBore: true,
      instrumentFamily: '', packagingType: '', cleanlinessClaims: [],
    });
  });

  test('unknown source values never become requirements', () => {
    const src = tip({ sterile: null, filtered: null, lowRetention: null });
    const req = defaultRequirements(src);
    assert.equal(req.sterile, false);
    assert.equal(req.filtered, false);
    assert.equal(req.lowRetention, false);
  });

  test('an identical tip is a potential alternative with a full score', () => {
    const r = evaluate(tip(), tip());
    assert.equal(r.classification, 'candidate');
    assert.equal(r.score, 100);
    assert.equal(r.specEquivalent, true);
    assert.equal(r.generatedBy, 'demo_rules');
  });
});

describe('volume', () => {
  const src = tip({ volumeMinUl: 2, volumeMaxUl: 200 });

  test('a range that encompasses the requirement passes', () => {
    const r = evaluate(src, tip({ volumeMinUl: 1, volumeMaxUl: 200 }));
    assert.equal(r.classification, 'candidate');
    assert.ok(r.matchingAttributes.some((m) => m.startsWith('Covers the required')));
  });

  test('partial overlap is only conditional, with a visible warning', () => {
    const r = evaluate(src, tip({ volumeMinUl: 5, volumeMaxUl: 300 }));
    assert.equal(r.classification, 'conditional');
    assert.match(r.conditions[0], /Partial volume coverage/);
    assert.ok(r.score <= 89);
  });

  test('a sliver of overlap is blocked', () => {
    const r = evaluate(src, tip({ volumeMinUl: 0.1, volumeMaxUl: 10 }));
    assert.equal(r.classification, 'not_compatible');
    assert.ok(blockedOn(r, 'volume'));
  });

  test('no overlap is blocked', () => {
    const r = evaluate(src, tip({ volumeMinUl: 500, volumeMaxUl: 5000 }));
    assert.equal(r.classification, 'not_compatible');
    assert.match(r.blockingReasons[0], /No volume overlap/);
  });

  test('unknown candidate volume yields insufficient data, not a match', () => {
    const r = evaluate(src, tip({ volumeMinUl: null, volumeMaxUl: 200 }));
    assert.equal(r.classification, 'insufficient_data');
    assert.equal(r.score, null);
  });

  test('no required volume yields insufficient data', () => {
    const r = evaluate(src, tip(), { volumeMinUl: null, volumeMaxUl: null });
    assert.equal(r.classification, 'insufficient_data');
  });

  test('a much larger tip gets an advisory difference', () => {
    const r = evaluate(tip({ volumeMinUl: 100, volumeMaxUl: 400 }), tip({ volumeMinUl: 100, volumeMaxUl: 1000 }));
    assert.equal(r.classification, 'candidate');
    assert.ok(r.differences.some((d) => d.field === 'volume' && d.severity === 'advisory'));
  });
});

describe('sterility', () => {
  const src = tip({ sterile: true });

  test('a non-sterile candidate is blocked for a sterile source', () => {
    const r = evaluate(src, tip({ sterile: false, sterilizationMethod: null }));
    assert.equal(r.classification, 'not_compatible');
    assert.ok(blockedOn(r, 'sterile'));
  });

  test('unknown sterility yields insufficient data', () => {
    const r = evaluate(src, tip({ sterile: null, sterilizationMethod: null }));
    assert.equal(r.classification, 'insufficient_data');
    assert.ok(r.differences.some((d) => d.field === 'sterile' && d.severity === 'unknown'));
  });

  test('relaxing the requirement for a sterile source leaves the candidate conditional, never clean', () => {
    const r = evaluate(src, tip({ sterile: false, sterilizationMethod: null }), { sterile: false });
    assert.equal(r.classification, 'conditional');
    assert.match(r.conditions.join(' '), /Source is sterile/);
  });

  test('a sterile candidate for a non-sterile source is fine (exceeds requirement)', () => {
    const r = evaluate(tip({ sterile: false, sterilizationMethod: null }), tip({ sterile: true }));
    assert.equal(r.classification, 'candidate');
    assert.ok(r.differences.some((d) => d.field === 'sterile' && d.severity === 'info'));
  });
});

describe('filtration', () => {
  const src = tip({ filtered: true });

  test('an unfiltered candidate is blocked for a filtered source', () => {
    const r = evaluate(src, tip({ filtered: false, filterMaterial: null }));
    assert.equal(r.classification, 'not_compatible');
    assert.ok(blockedOn(r, 'filtered'));
  });

  test('unknown filtration yields insufficient data', () => {
    const r = evaluate(src, tip({ filtered: null, filterMaterial: null }));
    assert.equal(r.classification, 'insufficient_data');
  });

  test('filter requirement can be switched on for an unfiltered source', () => {
    const plain = tip({ filtered: false, filterMaterial: null });
    const r = evaluate(plain, tip({ filtered: false, filterMaterial: null }), { filtered: true });
    assert.equal(r.classification, 'not_compatible');
  });
});

describe('instrument compatibility', () => {
  test('a different tip interface is a blocker', () => {
    const r = evaluate(tip(), tip({ compatibleInstrumentFamilies: ['fam-lock'] }));
    assert.equal(r.classification, 'not_compatible');
    assert.match(r.blockingReasons[0], /Tip interface mismatch/);
  });

  test('covering only some of the source families is conditional', () => {
    const r = evaluate(tip(), tip({ compatibleInstrumentFamilies: ['fam-a'] }));
    assert.equal(r.classification, 'conditional');
    assert.match(r.conditions[0], /Listed for Alpha only, not Beta/);
  });

  test('choosing the customer family resolves partial coverage', () => {
    const r = evaluate(tip(), tip({ compatibleInstrumentFamilies: ['fam-a'] }), { instrumentFamily: 'fam-a' });
    assert.equal(r.classification, 'candidate');
  });

  test('a family the candidate is not listed for is blocked', () => {
    const r = evaluate(tip(), tip({ compatibleInstrumentFamilies: ['fam-a'] }), { instrumentFamily: 'fam-b' });
    assert.equal(r.classification, 'not_compatible');
  });

  test('missing compatibility data yields insufficient data', () => {
    const r = evaluate(tip(), tip({ compatibleInstrumentFamilies: [] }));
    assert.equal(r.classification, 'insufficient_data');
  });

  test('missing source compatibility asks for a family and is resolved by choosing one', () => {
    const src = tip({ compatibleInstrumentFamilies: [] });
    assert.equal(evaluate(src, tip()).classification, 'insufficient_data');
    assert.equal(evaluate(src, tip(), { instrumentFamily: 'fam-a' }).classification, 'candidate');
  });
});

describe('category and safety', () => {
  test('a pipette is never a substitute for a tip, whatever its attributes', () => {
    const r = evaluate(tip(), pipette());
    assert.equal(r.classification, 'not_compatible');
    assert.equal(r.score, null);
    assert.match(r.blockingReasons[0], /not a substitute/);
  });

  test('a pipette source gets no alternatives', () => {
    const r = evaluateCandidate(pipette(), pipette(), {}, ctx);
    assert.equal(r.classification, 'not_compatible');
  });

  test('score never overrides a blocker', () => {
    // Identical in every respect except sterility: would score ~100, but must be blocked.
    const r = evaluate(tip(), tip({ sterile: false, sterilizationMethod: null }));
    assert.equal(r.classification, 'not_compatible');
    assert.equal(r.score, null);
  });

  test('blocked and unassessable candidates have no score; eligible ones do', () => {
    const src = tip();
    const results = findAlternatives(src, [src,
      tip(), tip({ sterile: false, sterilizationMethod: null }), tip({ filtered: null, filterMaterial: null }),
      tip({ compatibleInstrumentFamilies: ['fam-a'] }), pipette()], defaultRequirements(src), { ...ctx, extraIds: [] });
    for (const r of results) {
      if (r.classification === 'candidate' || r.classification === 'conditional') assert.equal(typeof r.score, 'number');
      else assert.equal(r.score, null);
    }
    assert.deepEqual(results.map((r) => r.classification), ['candidate', 'conditional', 'insufficient_data', 'not_compatible']);
  });

  test('every result carries an explanation', () => {
    const src = tip();
    for (const c of [tip(), tip({ sterile: false, sterilizationMethod: null }), tip({ filtered: null, filterMaterial: null })]) {
      assert.ok(evaluate(src, c).explanation.length > 20);
    }
  });
});

describe('use-case requirements', () => {
  test('low retention, when required, blocks standard tips and flags unknowns', () => {
    const src = tip({ lowRetention: true });
    assert.equal(evaluate(src, tip({ lowRetention: false })).classification, 'not_compatible');
    assert.equal(evaluate(src, tip({ lowRetention: null })).classification, 'insufficient_data');
    assert.equal(evaluate(src, tip({ lowRetention: false }), { lowRetention: false }).classification, 'candidate');
  });

  test('wide bore, when required, is a hard rule', () => {
    const src = tip({ tipFormat: 'wide_bore' });
    assert.equal(evaluate(src, tip({ tipFormat: 'standard' })).classification, 'not_compatible');
    assert.equal(evaluate(src, tip({ tipFormat: 'wide_bore' })).classification, 'candidate');
  });

  test('packaging is advisory unless a format is required', () => {
    const src = tip({ packagingType: 'rack' });
    const bulk = tip({ packagingType: 'bulk', unitsPerPack: 1000, racksPerPack: null });
    const loose = evaluate(src, bulk);
    assert.equal(loose.classification, 'candidate');
    assert.ok(loose.differences.some((d) => d.field === 'packagingType' && d.severity === 'advisory'));
    assert.equal(evaluate(src, bulk, { packagingType: 'rack' }).classification, 'not_compatible');
  });

  test('required cleanliness claims are enforced; unknown claims are insufficient', () => {
    const src = tip();
    const req = { cleanlinessClaims: ['RNase-free'] };
    assert.equal(evaluate(src, tip({ cleanlinessClaims: ['DNase-free'] }), req).classification, 'not_compatible');
    assert.equal(evaluate(src, tip({ cleanlinessClaims: ['DNase-free', 'RNase-free'] }), req).classification, 'candidate');
    assert.equal(evaluate(src, tip({ cleanlinessClaims: null }), req).classification, 'insufficient_data');
  });

  test('advisory differences lower the score but not the classification', () => {
    const src = tip();
    const r = evaluate(src, tip({ material: 'Other polymer', tipLengthMm: 70, cleanlinessClaims: [] }));
    assert.equal(r.classification, 'candidate');
    assert.ok(r.score < 90);
  });
});

describe('candidate pool', () => {
  test('includes overlapping tips and linked products, excludes the source', () => {
    const src = tip({ volumeMinUl: 2, volumeMaxUl: 200 });
    const near = tip({ volumeMinUl: 5, volumeMaxUl: 300 });
    const far = tip({ volumeMinUl: 500, volumeMaxUl: 5000 });
    const linked = pipette();
    const pool = candidatePool(src, [src, near, far, linked], defaultRequirements(src), { extraIds: [linked.id] });
    assert.deepEqual(pool.map((p) => p.id), [near.id, linked.id]);
  });

  test('ranking is deterministic', () => {
    const src = tip();
    const items = [src, tip(), tip({ material: 'X' }), tip({ compatibleInstrumentFamilies: ['fam-a'] })];
    const a = findAlternatives(src, items, defaultRequirements(src), ctx).map((r) => r.candidateProductId);
    const b = findAlternatives(src, [...items].reverse(), defaultRequirements(src), ctx).map((r) => r.candidateProductId);
    assert.deepEqual(a, b);
  });
});
