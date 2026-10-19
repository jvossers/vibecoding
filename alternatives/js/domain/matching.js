// Deterministic, explainable matching rules for pipette-tip alternatives.
//
// Order of evaluation:
//   1. hard requirements (category, instrument family / interface, volume,
//      sterility, filtration, low retention, wide bore, packaging, claims)
//   2. unknowns on a hard requirement -> "insufficient_data"
//   3. conditions (partial coverage, relaxed source properties) -> "conditional"
//   4. only then a similarity score from the advisory differences.
// A blocker always wins: blocked or unassessable candidates never get a score.

import {
  CATEGORY_LABELS, PACKAGING_LABELS, TIP_FORMAT_LABELS, INTERFACE_LABELS,
  formatBool, formatEnum, formatList, formatNumber, formatVolume, familyNames, isUnknown,
} from './attributes.js';

export const CLASSIFICATION_LABELS = {
  candidate: 'Potential alternative',
  conditional: 'Conditional',
  insufficient_data: 'Insufficient data',
  not_compatible: 'Not compatible',
};

export const CLASSIFICATION_ORDER = { candidate: 0, conditional: 1, insufficient_data: 2, not_compatible: 3 };

export const SUBSTITUTABLE_CATEGORIES = new Set(['pipette_tip']);

// Score penalty per difference severity. Blocking differences never reach scoring.
export const SEVERITY_WEIGHTS = { conditional: 12, advisory: 5, unknown: 3, info: 1.5 };

// A partial overlap must still cover this share of the required span to stay conditional;
// less than that (e.g. a 10 µL tip for 2–200 µL work) is a blocker.
export const MIN_PARTIAL_COVERAGE = 0.75;

const PACKAGING_FIELDS = new Set(['packagingType', 'unitsPerPack', 'racksPerPack', 'colour']);
const STOCK_ORDER = { in_stock: 0, low_stock: 1, out_of_stock: 2, discontinued: 3 };

export const pairKey = (sourceId, candidateId) => `${sourceId}::${candidateId}`;

export const isEligible = (classification) => classification === 'candidate' || classification === 'conditional';

export function defaultRequirements(source) {
  const s = source?.specifications ?? {};
  return {
    volumeMinUl: s.volumeMinUl ?? null,
    volumeMaxUl: s.volumeMaxUl ?? null,
    sterile: s.sterile === true,
    filtered: s.filtered === true,
    lowRetention: s.lowRetention === true,
    wideBore: s.tipFormat === 'wide_bore',
    instrumentFamily: '', // '' = any family the source is listed for
    packagingType: '', // '' = any packaging
    cleanlinessClaims: [],
  };
}

function requiredRange(req) {
  const min = req.volumeMinUl, max = req.volumeMaxUl;
  if (isUnknown(min) && isUnknown(max)) return null;
  return { lo: min ?? max, hi: max ?? min, partial: isUnknown(min) || isUnknown(max) };
}

export function evaluateCandidate(source, candidate, requirements = {}, { families = {} } = {}) {
  const s = source.specifications ?? {};
  const c = candidate.specifications ?? {};
  const req = { ...defaultRequirements(source), ...requirements };

  const matchingAttributes = [];
  const differences = [];
  const blockingReasons = [];
  const conditions = [];
  const criticalUnknowns = [];

  const add = (field, sourceValue, candidateValue, severity, note) =>
    differences.push({ field, sourceValue, candidateValue, severity, note });
  const match = (text) => matchingAttributes.push(text);
  const block = (field, sv, cv, reason) => { blockingReasons.push(reason); add(field, sv, cv, 'blocking', reason); };
  const condition = (field, sv, cv, text) => { conditions.push(text); add(field, sv, cv, 'conditional', text); };
  const unknown = (field, sv, cv, note, critical) => { add(field, sv, cv, 'unknown', note); if (critical) criticalUnknowns.push(note); };

  const finish = () => {
    let classification;
    if (blockingReasons.length) classification = 'not_compatible';
    else if (criticalUnknowns.length) classification = 'insufficient_data';
    else if (conditions.length) classification = 'conditional';
    else classification = 'candidate';

    let score = null;
    if (isEligible(classification)) {
      const penalty = differences.reduce((sum, d) => sum + (SEVERITY_WEIGHTS[d.severity] ?? 0), 0);
      score = Math.max(1, Math.min(100, Math.round(100 - penalty)));
      if (classification === 'conditional') score = Math.min(score, 89);
    }
    const specEquivalent = classification === 'candidate'
      && differences.every((d) => PACKAGING_FIELDS.has(d.field) && d.severity !== 'unknown');

    return {
      id: `alt:${pairKey(source.id, candidate.id)}`,
      sourceProductId: source.id,
      candidateProductId: candidate.id,
      classification,
      score,
      matchingAttributes,
      differences,
      blockingReasons,
      conditions,
      unknowns: differences.filter((d) => d.severity === 'unknown').map((d) => d.note),
      explanation: explain(classification, { blockingReasons, criticalUnknowns, conditions, differences, specEquivalent }),
      specEquivalent,
      generatedBy: 'demo_rules',
    };
  };

  // 1. Category: only like-for-like consumables are substitutable.
  if (!SUBSTITUTABLE_CATEGORIES.has(source.category)) {
    block('category', CATEGORY_LABELS[source.category], CATEGORY_LABELS[candidate.category],
      `Alternatives are only generated for consumables; a ${CATEGORY_LABELS[source.category].toLowerCase()} is equipment.`);
    return finish();
  }
  if (candidate.category !== source.category) {
    block('category', CATEGORY_LABELS[source.category], CATEGORY_LABELS[candidate.category],
      `Category mismatch: a ${CATEGORY_LABELS[candidate.category].toLowerCase()} is not a substitute for a ${CATEGORY_LABELS[source.category].toLowerCase()}.`);
    return finish();
  }

  // 2. Instrument family and tip interface.
  const sFams = s.compatibleInstrumentFamilies ?? [];
  const cFams = c.compatibleInstrumentFamilies ?? [];
  const required = req.instrumentFamily ? [req.instrumentFamily] : sFams;
  const reqText = familyNames(required, families);
  const candText = familyNames(cFams, families);
  if (required.length === 0) {
    unknown('compatibleInstrumentFamilies', reqText, candText,
      'Source instrument compatibility not recorded — choose the customer’s instrument family.', true);
  } else if (cFams.length === 0) {
    unknown('compatibleInstrumentFamilies', reqText, candText,
      'Candidate instrument compatibility not recorded.', true);
  } else {
    const shared = required.filter((f) => cFams.includes(f));
    if (shared.length === 0) {
      const ifaces = (ids) => [...new Set(ids.map((id) => families[id]?.tipInterfaceType).filter(Boolean))];
      const reqIf = ifaces(required), candIf = ifaces(cFams);
      const ifaceClash = reqIf.length && candIf.length && !reqIf.some((i) => candIf.includes(i));
      block('compatibleInstrumentFamilies', reqText, candText, ifaceClash
        ? `Tip interface mismatch: ${reqIf.map((i) => INTERFACE_LABELS[i]).join('/')} required, candidate fits ${candIf.map((i) => INTERFACE_LABELS[i]).join('/')}.`
        : `Not listed as compatible with ${reqText}.`);
    } else if (shared.length < required.length) {
      const missing = required.filter((f) => !cFams.includes(f));
      condition('compatibleInstrumentFamilies', reqText, candText,
        `Listed for ${familyNames(shared, families)} only, not ${familyNames(missing, families)} — confirm the customer’s pipette.`);
    } else {
      match(`Listed for ${reqText}`);
    }
  }

  // 3. Volume coverage.
  const range = requiredRange(req);
  const rText = range ? formatVolume(req.volumeMinUl, req.volumeMaxUl) : 'Not set';
  const cText = formatVolume(c.volumeMinUl, c.volumeMaxUl);
  if (!range) {
    unknown('volume', rText, cText, 'No required volume set — enter the customer’s working range.', true);
  } else if (range.lo > range.hi) {
    unknown('volume', rText, cText, 'Required volume range is invalid (minimum above maximum).', true);
  } else if (isUnknown(c.volumeMinUl) || isUnknown(c.volumeMaxUl)) {
    unknown('volume', rText, cText, 'Candidate volume range not fully recorded.', true);
  } else if (c.volumeMaxUl < range.lo || c.volumeMinUl > range.hi) {
    block('volume', rText, cText, `No volume overlap: candidate ${cText}, required ${rText}.`);
  } else if (c.volumeMinUl <= range.lo && c.volumeMaxUl >= range.hi) {
    if (range.partial) {
      condition('volume', rText, cText, `Required range only partly specified; checked at ${formatNumber(range.lo)} µL only.`);
    } else {
      match(`Covers the required ${rText}`);
    }
    if (c.volumeMaxUl > range.hi * 1.5) {
      add('volume', rText, cText, 'advisory', `Larger nominal volume (${formatNumber(c.volumeMaxUl)} µL): check accuracy at the low end of the range.`);
    }
  } else {
    const lo = Math.max(c.volumeMinUl, range.lo), hi = Math.min(c.volumeMaxUl, range.hi);
    const share = range.hi > range.lo ? (hi - lo) / (range.hi - range.lo) : 0;
    const pct = Math.round(share * 100);
    if (share >= MIN_PARTIAL_COVERAGE) {
      condition('volume', rText, cText, `Partial volume coverage: covers ${formatVolume(lo, hi)} (${pct}%) of the required ${rText}.`);
    } else {
      block('volume', rText, cText, `Covers only ${formatVolume(lo, hi)} (${pct}%) of the required ${rText}.`);
    }
  }

  // 4. Sterility and filtration: hard when required; a relaxed source property stays conditional.
  const critical = (field, label, adjective, negative, isRequired) => {
    const sv = s[field], cv = c[field];
    if (isRequired) {
      if (cv === true) match(label);
      else if (cv === false) block(field, sv === true ? 'Yes' : 'Required', formatBool(cv), `${label} required, but the candidate is ${negative}.`);
      else unknown(field, 'Required', formatBool(cv), `${label} status not recorded for the candidate — cannot confirm the requirement.`, true);
    } else if (sv === true) {
      if (cv === true) match(label);
      else if (cv === false) condition(field, formatBool(sv), formatBool(cv), `Source is ${adjective}; candidate is ${negative}. Requirement relaxed — confirm the application does not need it.`);
      else unknown(field, formatBool(sv), formatBool(cv), `${label} status not recorded for the candidate.`, false);
    } else if (isUnknown(cv)) {
      unknown(field, formatBool(sv), formatBool(cv), `${label} status not recorded for the candidate.`, false);
    } else if (isUnknown(sv)) {
      add(field, formatBool(sv), formatBool(cv), 'info', `${label} not recorded for the source; candidate: ${formatBool(cv).toLowerCase()}.`);
    } else if (sv === cv) {
      match(`${label}: ${formatBool(cv).toLowerCase()}, as source`);
    } else {
      add(field, formatBool(sv), formatBool(cv), 'info', `Candidate is ${adjective} — exceeds the requirement.`);
    }
  };
  critical('sterile', 'Sterile', 'sterile', 'non-sterile', req.sterile);
  critical('filtered', 'Filtered', 'filtered', 'unfiltered', req.filtered);

  if (s.sterile === true && c.sterile === true && s.sterilizationMethod && c.sterilizationMethod
      && s.sterilizationMethod !== c.sterilizationMethod) {
    add('sterilizationMethod', s.sterilizationMethod, c.sterilizationMethod, 'info', 'Different sterilisation method.');
  }
  if (c.filtered === true && s.filtered === true) {
    if (isUnknown(c.filterMaterial)) {
      unknown('filterMaterial', s.filterMaterial ?? 'Not recorded', 'Not recorded', 'Filter material not recorded for the candidate.', false);
    } else if (s.filterMaterial && s.filterMaterial !== c.filterMaterial) {
      add('filterMaterial', s.filterMaterial, c.filterMaterial, 'info', 'Different filter material.');
    }
  }

  // 5. Low retention.
  {
    const sv = s.lowRetention, cv = c.lowRetention;
    if (req.lowRetention) {
      if (cv === true) match('Low retention');
      else if (cv === false) block('lowRetention', sv === true ? 'Yes' : 'Required', 'No', 'Low retention required, but the candidate is a standard-retention tip.');
      else unknown('lowRetention', 'Required', 'Not recorded', 'Low-retention property not recorded for the candidate.', true);
    } else if (isUnknown(cv)) {
      if (!isUnknown(sv)) unknown('lowRetention', formatBool(sv), 'Not recorded', 'Low-retention property not recorded for the candidate.', false);
    } else if (!isUnknown(sv)) {
      if (sv === cv) match(cv ? 'Low retention, as source' : 'Standard retention, as source');
      else if (cv) add('lowRetention', 'No', 'Yes', 'info', 'Candidate is low retention — exceeds the requirement.');
      else add('lowRetention', 'Yes', 'No', 'advisory', 'Source is low retention; candidate is not — more residual liquid with viscous or detergent-containing samples.');
    }
  }

  // 6. Tip format (wide bore is a hard requirement when requested) and length.
  {
    const sf = s.tipFormat, cf = c.tipFormat;
    const fmt = (v) => formatEnum(TIP_FORMAT_LABELS, v);
    if (req.wideBore) {
      if (cf === 'wide_bore') match('Wide bore');
      else if (isUnknown(cf)) unknown('tipFormat', 'Wide bore', 'Not recorded', 'Tip format not recorded — cannot confirm wide bore.', true);
      else block('tipFormat', 'Wide bore', fmt(cf), `Wide bore required, but the candidate is ${fmt(cf).toLowerCase()}.`);
    } else if (sf === 'wide_bore' && !isUnknown(cf) && cf !== 'wide_bore') {
      condition('tipFormat', fmt(sf), fmt(cf), 'Source is wide bore; requirement relaxed — confirm samples are not viscous or shear-sensitive.');
    } else if (cf === 'wide_bore' && sf !== 'wide_bore') {
      condition('tipFormat', fmt(sf), fmt(cf), 'Candidate is wide bore: reduced accuracy at small volumes — confirm suitability.');
    } else if (isUnknown(cf)) {
      if (!isUnknown(sf)) unknown('tipFormat', fmt(sf), 'Not recorded', 'Tip format not recorded for the candidate.', false);
    } else if (!isUnknown(sf)) {
      if (sf === cf) match(`Same tip format (${fmt(cf).toLowerCase()})`);
      else add('tipFormat', fmt(sf), fmt(cf), 'advisory', `Tip format differs (${fmt(sf).toLowerCase()} vs ${fmt(cf).toLowerCase()}) — check reach and ejector clearance.`);
    }

    const sl = s.tipLengthMm, cl = c.tipLengthMm;
    if (!isUnknown(sl) && !isUnknown(cl)) {
      const delta = Math.abs(cl - sl);
      const sevr = delta > 8 && sf === cf ? 'advisory' : 'info';
      if (delta > 2) add('tipLengthMm', `${formatNumber(sl)} mm`, `${formatNumber(cl)} mm`, sevr, `Tip length differs by ${formatNumber(delta)} mm.`);
    } else if (!isUnknown(sl)) {
      unknown('tipLengthMm', `${formatNumber(sl)} mm`, 'Not recorded', 'Tip length not recorded for the candidate.', false);
    }
  }

  // 7. Material.
  if (!isUnknown(s.material)) {
    if (isUnknown(c.material)) unknown('material', s.material, 'Not recorded', 'Body material not recorded for the candidate.', false);
    else if (s.material === c.material) match(`Same body material (${c.material.toLowerCase()})`);
    else add('material', s.material, c.material, 'advisory', 'Different body material.');
  }

  // 8. Cleanliness claims (synthetic statements, never certifications).
  {
    const reqClaims = req.cleanlinessClaims ?? [];
    const sClaims = s.cleanlinessClaims ?? [];
    const cClaims = c.cleanlinessClaims;
    if (reqClaims.length) {
      if (isUnknown(cClaims)) {
        unknown('cleanlinessClaims', reqClaims.join(', '), 'Not recorded', 'Stated claims not recorded for the candidate.', true);
      } else {
        const missing = reqClaims.filter((x) => !cClaims.includes(x));
        if (missing.length) block('cleanlinessClaims', reqClaims.join(', '), formatList(cClaims), `Required claim not stated: ${missing.join(', ')}.`);
        else match(`States ${reqClaims.join(', ')}`);
      }
    }
    const extra = sClaims.filter((x) => !reqClaims.includes(x));
    if (extra.length) {
      if (isUnknown(cClaims)) {
        if (!reqClaims.length) unknown('cleanlinessClaims', formatList(sClaims), 'Not recorded', 'Stated claims not recorded for the candidate.', false);
      } else {
        const missing = extra.filter((x) => !cClaims.includes(x));
        if (missing.length) add('cleanlinessClaims', formatList(sClaims), formatList(cClaims), 'advisory', `Does not state: ${missing.join(', ')}.`);
      }
    }
  }

  // 9. Packaging: only a blocker when the customer needs a specific format.
  {
    const sp = s.packagingType, cp = c.packagingType;
    const fmt = (v) => formatEnum(PACKAGING_LABELS, v);
    if (req.packagingType) {
      if (cp === req.packagingType) match(`${fmt(cp)} packaging, as required`);
      else if (isUnknown(cp)) unknown('packagingType', fmt(req.packagingType), 'Not recorded', 'Packaging not recorded — cannot confirm the required format.', true);
      else block('packagingType', fmt(req.packagingType), fmt(cp), `${fmt(req.packagingType)} packaging required; candidate is ${fmt(cp).toLowerCase()}.`);
    } else if (!isUnknown(sp)) {
      if (isUnknown(cp)) unknown('packagingType', fmt(sp), 'Not recorded', 'Packaging not recorded for the candidate.', false);
      else if (sp === cp) match(`Same packaging (${fmt(cp).toLowerCase()})`);
      else add('packagingType', fmt(sp), fmt(cp), 'advisory', `Different packaging (${fmt(sp).toLowerCase()} vs ${fmt(cp).toLowerCase()}) — confirm the customer can use it.`);
    }
    if (!isUnknown(s.unitsPerPack) && !isUnknown(c.unitsPerPack) && s.unitsPerPack !== c.unitsPerPack) {
      add('unitsPerPack', formatNumber(s.unitsPerPack), formatNumber(c.unitsPerPack), 'info',
        `Pack quantity ${formatNumber(s.unitsPerPack)} vs ${formatNumber(c.unitsPerPack)} tips — adjust the order quantity.`);
    }
  }

  // 10. Minor attributes.
  if (!isUnknown(s.autoclavable) && !isUnknown(c.autoclavable) && s.autoclavable !== c.autoclavable) {
    add('autoclavable', formatBool(s.autoclavable), formatBool(c.autoclavable), 'info', c.autoclavable ? 'Candidate is autoclavable.' : 'Candidate is not autoclavable.');
  }
  if (!isUnknown(s.colour) && !isUnknown(c.colour) && s.colour !== c.colour) {
    add('colour', s.colour, c.colour, 'info', 'Different colour.');
  }

  return finish();
}

function explain(classification, { blockingReasons, criticalUnknowns, conditions, differences, specEquivalent }) {
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  if (classification === 'not_compatible') {
    return `Excluded by ${plural(blockingReasons.length, 'hard rule')}: ${blockingReasons[0]} Score withheld.`;
  }
  if (classification === 'insufficient_data') {
    const more = criticalUnknowns.length > 1 ? ` (+${criticalUnknowns.length - 1} more)` : '';
    return `Cannot be assessed: ${criticalUnknowns[0]}${more} Score withheld until the data is confirmed.`;
  }
  const advisory = differences.filter((d) => d.severity === 'advisory');
  const advText = advisory.length
    ? ` ${plural(advisory.length, 'advisory difference')} to check.`
    : '';
  if (classification === 'conditional') {
    return `Passes hard requirements with ${plural(conditions.length, 'condition')}: ${conditions[0]}${advText}`;
  }
  if (specEquivalent) {
    return differences.length
      ? 'Specification matches the source; differs only in packaging or pack quantity.'
      : 'Specification matches the source on every recorded attribute.';
  }
  return `Passes all hard requirements.${advText || ' Only minor differences.'}`;
}

// Products worth evaluating for a source: tips whose volume range touches the required
// range (or whose volume is unknown but nominally the same), plus any explicitly linked ids.
export function candidatePool(source, products, requirements, { extraIds = [] } = {}) {
  const s = source.specifications ?? {};
  const range = requiredRange(requirements ?? {}) ?? requiredRange(defaultRequirements(source));
  const extra = new Set(extraIds);
  const nominal = s.volumeMaxUl ? `${s.volumeMaxUl} µl` : null;
  return products.filter((p) => {
    if (p.id === source.id) return false;
    if (extra.has(p.id)) return true;
    if (p.category !== 'pipette_tip') return false;
    if (!range) return true;
    const { volumeMinUl: min, volumeMaxUl: max } = p.specifications;
    if (isUnknown(min) && isUnknown(max)) return nominal !== null && p.tags.includes(nominal);
    return (max ?? min) >= range.lo && (min ?? 0) <= range.hi;
  });
}

export function rankResults(results, productsById) {
  return [...results].sort((a, b) =>
    CLASSIFICATION_ORDER[a.classification] - CLASSIFICATION_ORDER[b.classification]
    || (b.score ?? -1) - (a.score ?? -1)
    || STOCK_ORDER[productsById[a.candidateProductId]?.status] - STOCK_ORDER[productsById[b.candidateProductId]?.status]
    || productsById[a.candidateProductId].sku.localeCompare(productsById[b.candidateProductId].sku));
}

export function findAlternatives(source, products, requirements, { families = {}, extraIds = [] } = {}) {
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const pool = candidatePool(source, products, requirements, { extraIds });
  return rankResults(pool.map((p) => evaluateCandidate(source, p, requirements, { families })), byId);
}
