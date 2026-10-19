// Applies the rules in rules.js. The result is a plain yes or no: a candidate either
// passes every rule or it is not an alternative. There are no scores.

import { RULES } from './rules.js';

const isUnknown = (v) => v === null || v === undefined || (Array.isArray(v) && v.length === 0);

const COMPARE = {
  equal: (a, b) => a === b,
  sameSet: (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x) => b.includes(x)),
};

export function rulesFor(category, rules = RULES) {
  return rules[category] ?? [];
}

export function fieldMatches(rule, source, candidate) {
  const compare = COMPARE[rule.compare];
  if (!compare) throw new Error(`Unknown compare type "${rule.compare}" in rule ${rule.id}`);
  return rule.fields.every((f) => {
    const a = source.specifications?.[f];
    const b = candidate.specifications?.[f];
    return !isUnknown(a) && !isUnknown(b) && compare(a, b);
  });
}

export function isAlternative(source, candidate, rules = RULES) {
  if (source.id === candidate.id || source.category !== candidate.category) return false;
  const list = rulesFor(source.category, rules);
  return list.length > 0 && list.every((rule) => fieldMatches(rule, source, candidate));
}

export function findAlternatives(source, products, { rules = RULES } = {}) {
  return products
    .filter((p) => isAlternative(source, p, rules))
    .sort((a, b) => (a.family === source.family ? 0 : 1) - (b.family === source.family ? 0 : 1) || a.sku.localeCompare(b.sku));
}
