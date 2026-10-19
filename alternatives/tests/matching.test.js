import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { isAlternative, findAlternatives, fieldMatches, rulesFor } from '../js/domain/matching.js';
import { RULES } from '../js/domain/rules.js';
import { tip, pipette } from './helpers.js';

describe('rules', () => {
  test('every rule names specification fields and a known compare type', () => {
    for (const list of Object.values(RULES)) {
      for (const rule of list) {
        assert.ok(rule.id && rule.label);
        assert.ok(Array.isArray(rule.fields) && rule.fields.length > 0);
        assert.ok(['equal', 'sameSet'].includes(rule.compare), rule.id);
      }
    }
  });

  test('an unknown compare type is reported', () => {
    assert.throws(() => fieldMatches({ id: 'x', fields: ['sterile'], compare: 'fuzzy' }, tip(), tip()), /Unknown compare type/);
  });
});

describe('matching is all or nothing', () => {
  test('a tip that agrees on every rule field is an alternative', () => {
    assert.equal(isAlternative(tip(), tip()), true);
  });

  test('fields outside the rules may differ', () => {
    const other = tip({ packagingType: 'bulk', unitsPerPack: 1000, racksPerPack: null, material: 'Other', colour: 'Blue' });
    assert.equal(isAlternative(tip(), other), true);
  });

  for (const [field, value] of [
    ['volumeMinUl', 5], ['volumeMaxUl', 300], ['sterile', false], ['filtered', false],
    ['lowRetention', true], ['tipFormat', 'extended'], ['compatibleInstrumentFamilies', ['fam-a']],
  ]) {
    test(`a different ${field} means no match`, () => {
      assert.equal(isAlternative(tip(), tip({ [field]: value })), false);
    });
  }

  test('instrument families compare as a set, in any order', () => {
    assert.equal(isAlternative(tip({ compatibleInstrumentFamilies: ['fam-a', 'fam-b'] }), tip({ compatibleInstrumentFamilies: ['fam-b', 'fam-a'] })), true);
  });

  test('unknown values never match, even if both are unknown', () => {
    assert.equal(isAlternative(tip({ sterile: null }), tip({ sterile: null })), false);
    assert.equal(isAlternative(tip(), tip({ filtered: null })), false);
    assert.equal(isAlternative(tip({ compatibleInstrumentFamilies: [] }), tip({ compatibleInstrumentFamilies: [] })), false);
  });

  test('a product is not its own alternative', () => {
    const t = tip();
    assert.equal(isAlternative(t, t), false);
  });
});

describe('categories', () => {
  test('a pipette is never an alternative to a tip', () => {
    assert.equal(isAlternative(tip(), pipette()), false);
  });

  test('categories without rules have no alternatives', () => {
    assert.deepEqual(rulesFor('pipette'), []);
    assert.equal(isAlternative(pipette(), pipette()), false);
  });

  test('custom rules can be passed in', () => {
    const rules = { pipette: [{ id: 'fam', label: 'Family', fields: ['instrumentFamilyId'], compare: 'equal' }] };
    assert.equal(isAlternative(pipette(), pipette(), rules), true);
  });
});

describe('findAlternatives', () => {
  test('returns only matches, same range first, then by SKU', () => {
    const src = tip({}, { family: 'Alpha' });
    const other = tip({}, { family: 'Beta', sku: 'A-1' });
    const same = tip({}, { family: 'Alpha', sku: 'Z-9' });
    const miss = tip({ sterile: false });
    const res = findAlternatives(src, [src, other, same, miss, pipette()]);
    assert.deepEqual(res.map((p) => p.id), [same.id, other.id]);
  });
});
