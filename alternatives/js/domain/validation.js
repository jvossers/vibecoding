// Integrity checks for the synthetic catalogue. Used by the generator (which refuses
// to write inconsistent fixtures), by the tests, and by the app at load time.

import { BRAND, isUnknown } from './attributes.js';

export const CATEGORIES = ['pipette_tip', 'pipette', 'accessory'];
export const STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'];
export const TIP_FORMATS = ['standard', 'extended', 'wide_bore', 'other'];
export const PACKAGING_TYPES = ['rack', 'refill', 'bulk', 'box', 'other'];
export const RELATIONSHIP_TYPES = ['compatible_with', 'accessory_for', 'same_family', 'related', 'supersedes', 'published_substitute'];
export const CLASSIFICATIONS = ['candidate', 'conditional', 'not_compatible', 'insufficient_data'];
export const REVIEW_STATUSES = ['pending', 'approved_for_demo', 'rejected'];

const ENVELOPE = ['id', 'sku', 'name', 'brand', 'family', 'category', 'subcategory', 'description',
  'status', 'stockQuantity', 'imagePath', 'tags', 'specifications', 'documentation', 'updatedAt'];

// Reads the pack size stated in a product name, e.g. "Rack of 96", "(960 tips)", "Bulk bag of 1,000".
export function packSizeFromName(name) {
  const tips = name.match(/\(([\d,]+) tips\)/);
  if (tips) return Number(tips[1].replace(/,/g, ''));
  const of = name.match(/(?:Rack|Box|Bag|Pack) of ([\d,]+)/i);
  if (of) return Number(of[1].replace(/,/g, ''));
  return null;
}

export function racksFromName(name) {
  const m = name.match(/(\d+) (?:Racks|Inserts) × (\d+)/);
  return m ? { racks: Number(m[1]), perRack: Number(m[2]) } : null;
}

const isoDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v)) && /T/.test(v);

export function validateProduct(p, { families = {} } = {}) {
  const errors = [];
  const err = (msg) => errors.push(`${p.sku ?? p.id}: ${msg}`);

  for (const key of ENVELOPE) if (!(key in p)) err(`missing field ${key}`);
  if (p.brand !== BRAND) err(`brand must be the fictional ${BRAND}`);
  if (!CATEGORIES.includes(p.category)) err(`unknown category ${p.category}`);
  if (!STATUSES.includes(p.status)) err(`unknown status ${p.status}`);
  if (!isUnknown(p.stockQuantity) && (!Number.isInteger(p.stockQuantity) || p.stockQuantity < 0)) err('stockQuantity must be a non-negative integer or null');
  if (p.status === 'out_of_stock' && p.stockQuantity !== 0 && p.stockQuantity !== null) err('out_of_stock must have 0 or unknown stock');
  if ((p.status === 'in_stock' || p.status === 'low_stock') && p.stockQuantity === 0) err(`${p.status} cannot have 0 stock`);
  if (!Array.isArray(p.tags)) err('tags must be an array');
  if (!Array.isArray(p.documentation)) err('documentation must be an array');
  if (!isoDate(p.updatedAt)) err('updatedAt must be an ISO datetime');

  const s = p.specifications ?? {};
  if (!isUnknown(s.volumeMinUl) && !isUnknown(s.volumeMaxUl) && s.volumeMinUl > s.volumeMaxUl) err('volumeMinUl > volumeMaxUl');

  if (p.category === 'pipette_tip') {
    if (s.filtered !== true && !isUnknown(s.filterMaterial)) err('filterMaterial set but tip is not known to be filtered');
    if (s.sterile !== true && !isUnknown(s.sterilizationMethod)) err('sterilizationMethod set but tip is not known to be sterile');
    if (!isUnknown(s.tipFormat) && !TIP_FORMATS.includes(s.tipFormat)) err(`unknown tipFormat ${s.tipFormat}`);
    if (!isUnknown(s.packagingType) && !PACKAGING_TYPES.includes(s.packagingType)) err(`unknown packagingType ${s.packagingType}`);
    if (!Array.isArray(s.compatibleInstrumentFamilies)) err('compatibleInstrumentFamilies must be an array (empty = not recorded)');
    if (!isUnknown(s.cleanlinessClaims) && !Array.isArray(s.cleanlinessClaims)) err('cleanlinessClaims must be an array or null');

    // Name and fields must tell the same story.
    const named = packSizeFromName(p.name);
    if (named !== s.unitsPerPack) err(`name states pack size ${named}, unitsPerPack is ${s.unitsPerPack}`);
    const racks = racksFromName(p.name);
    if (racks) {
      if (racks.racks !== s.racksPerPack) err(`name states ${racks.racks} racks, racksPerPack is ${s.racksPerPack}`);
      if (racks.racks * racks.perRack !== s.unitsPerPack) err('racks × tips per rack does not equal unitsPerPack');
    }
    const nameSterile = /\bSterile\b/.test(p.name) && !/Non-sterile/.test(p.name);
    if (nameSterile !== (s.sterile === true)) err('name and sterile field disagree');
    if (/Non-sterile/.test(p.name) !== (s.sterile === false)) err('name and non-sterile field disagree');
    if (/\bFilter\b/.test(p.name) !== (s.filtered === true)) err('name and filtered field disagree');

    const ifaces = new Set();
    for (const f of s.compatibleInstrumentFamilies ?? []) {
      if (!families[f]) err(`unknown instrument family ${f}`);
      else ifaces.add(families[f].tipInterfaceType);
    }
    if (ifaces.size > 1) err('tip lists families with different tip interfaces');
  } else if (p.category === 'pipette') {
    if (!families[s.instrumentFamilyId]) err(`unknown instrument family ${s.instrumentFamilyId}`);
    else if (families[s.instrumentFamilyId].tipInterfaceType !== s.tipInterfaceType) err('tipInterfaceType disagrees with its family');
    if (!Number.isInteger(s.channelCount) || s.channelCount < 1) err('channelCount must be a positive integer');
    if (s.adjustableVolume === false && s.volumeMinUl !== s.volumeMaxUl) err('fixed-volume pipette must have min = max');
  } else if (p.category === 'accessory') {
    for (const f of s.compatibleInstrumentFamilies ?? []) if (!families[f]) err(`unknown instrument family ${f}`);
  }
  return errors;
}

export function validateRelationship(r, byId) {
  const errors = [];
  const err = (msg) => errors.push(`relationship ${r.id}: ${msg}`);
  const a = byId[r.sourceProductId], b = byId[r.targetProductId];
  if (!a) err(`unknown source ${r.sourceProductId}`);
  if (!b) err(`unknown target ${r.targetProductId}`);
  if (!RELATIONSHIP_TYPES.includes(r.type)) err(`unknown type ${r.type}`);
  if (r.origin !== 'synthetic_demo') err('origin must be synthetic_demo');
  if (r.sourceProductId === r.targetProductId) err('self-relationship');
  if (!isoDate(r.createdAt)) err('createdAt must be an ISO datetime');
  if (a && b) {
    if (r.type === 'compatible_with') {
      if (a.category !== 'pipette_tip' || b.category !== 'pipette') err('compatible_with must point from a tip to a pipette');
      else if (!a.specifications.compatibleInstrumentFamilies.includes(b.specifications.instrumentFamilyId)) err('tip does not list the pipette family');
    }
    if (r.type === 'accessory_for' && (a.category !== 'accessory' || b.category !== 'pipette')) err('accessory_for must point from an accessory to a pipette');
    if ((r.type === 'supersedes' || r.type === 'published_substitute') && a.category !== b.category) err(`${r.type} must link same-category products`);
    if (r.type === 'same_family' && a.family !== b.family) err('same_family must link products in one family');
  }
  return errors;
}

export function validateAlternative(alt, byId) {
  const errors = [];
  const err = (msg) => errors.push(`alternative ${alt.id}: ${msg}`);
  const a = byId[alt.sourceProductId], b = byId[alt.candidateProductId];
  if (!a) err(`unknown source ${alt.sourceProductId}`);
  if (!b) err(`unknown candidate ${alt.candidateProductId}`);
  if (!CLASSIFICATIONS.includes(alt.classification)) err(`unknown classification ${alt.classification}`);
  if (!REVIEW_STATUSES.includes(alt.reviewStatus)) err(`unknown reviewStatus ${alt.reviewStatus}`);
  if (alt.generatedBy !== 'demo_rules') err('generatedBy must be demo_rules');
  const scored = alt.classification === 'candidate' || alt.classification === 'conditional';
  if (scored && (typeof alt.score !== 'number' || alt.score < 0 || alt.score > 100)) err('eligible candidates need a 0–100 score');
  if (!scored && alt.score !== null) err('blocked or unassessable candidates must not have a score');
  if (alt.classification === 'not_compatible' && !alt.blockingReasons?.length) err('not_compatible needs blocking reasons');
  if (alt.classification === 'conditional' && !alt.conditions?.length) err('conditional needs conditions');
  if (alt.reviewStatus === 'approved_for_demo' && !scored) err('only eligible candidates can be approved for demo review');
  if (alt.reviewStatus !== 'pending' && !isoDate(alt.reviewedAt)) err('reviewed records need reviewedAt');
  if (a && b && a.category === 'pipette_tip' && b.category !== 'pipette_tip' && scored) err('equipment presented as a substitute consumable');
  return errors;
}

export function validateCatalogue({ products, relationships = [], alternatives = [], families = [] }) {
  const errors = [];
  const familyMap = Object.fromEntries(families.map((f) => [f.id, f]));
  const byId = {};
  const skus = new Set();
  for (const p of products) {
    if (byId[p.id]) errors.push(`duplicate id ${p.id}`);
    if (skus.has(p.sku)) errors.push(`duplicate sku ${p.sku}`);
    byId[p.id] = p;
    skus.add(p.sku);
  }
  for (const p of products) errors.push(...validateProduct(p, { families: familyMap }));
  const relIds = new Set();
  for (const r of relationships) {
    if (relIds.has(r.id)) errors.push(`duplicate relationship ${r.id}`);
    relIds.add(r.id);
    errors.push(...validateRelationship(r, byId));
  }
  const altIds = new Set();
  for (const a of alternatives) {
    if (altIds.has(a.id)) errors.push(`duplicate alternative ${a.id}`);
    altIds.add(a.id);
    errors.push(...validateAlternative(a, byId));
  }
  return errors;
}
