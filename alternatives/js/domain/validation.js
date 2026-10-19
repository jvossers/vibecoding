// Integrity checks for the synthetic catalogue. Used by the generator (which refuses
// to write inconsistent fixtures), by the tests, and by the app at load time.

import { BRAND, isUnknown } from './attributes.js';

export const CATEGORIES = ['pipette_tip', 'pipette', 'accessory'];
export const TIP_FORMATS = ['standard', 'extended', 'wide_bore', 'other'];
export const PACKAGING_TYPES = ['rack', 'refill', 'bulk', 'box', 'other'];

const ENVELOPE = ['id', 'sku', 'name', 'brand', 'family', 'category', 'subcategory', 'description', 'price', 'imagePath', 'tags', 'specifications'];

// Reads the pack size stated in a product name, e.g. "Rack of 96", "(960 tips)", "Bulk Bag of 1,000".
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

export function validateProduct(p, { families = {} } = {}) {
  const errors = [];
  const err = (msg) => errors.push(`${p.sku ?? p.id}: ${msg}`);

  for (const key of ENVELOPE) if (!(key in p)) err(`missing field ${key}`);
  if (p.brand !== BRAND) err(`brand must be the fictional ${BRAND}`);
  if (!CATEGORIES.includes(p.category)) err(`unknown category ${p.category}`);
  if (!Array.isArray(p.tags)) err('tags must be an array');
  if (typeof p.price !== 'number' || !(p.price > 0)) err('price must be a positive number (GBP)');

  const s = p.specifications ?? {};
  if (!isUnknown(s.volumeMinUl) && !isUnknown(s.volumeMaxUl) && s.volumeMinUl > s.volumeMaxUl) err('volumeMinUl > volumeMaxUl');

  if (p.category === 'pipette_tip') {
    if (s.filtered !== true && !isUnknown(s.filterMaterial)) err('filterMaterial set but tip is not filtered');
    if (s.sterile !== true && !isUnknown(s.sterilizationMethod)) err('sterilizationMethod set but tip is not sterile');
    if (!isUnknown(s.tipFormat) && !TIP_FORMATS.includes(s.tipFormat)) err(`unknown tipFormat ${s.tipFormat}`);
    if (!isUnknown(s.packagingType) && !PACKAGING_TYPES.includes(s.packagingType)) err(`unknown packagingType ${s.packagingType}`);
    if (!Array.isArray(s.compatibleInstrumentFamilies)) err('compatibleInstrumentFamilies must be an array');

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

export function validateCatalogue({ products, families = [] }) {
  const errors = [];
  const familyMap = Object.fromEntries(families.map((f) => [f.id, f]));
  const ids = new Set();
  const skus = new Set();
  for (const p of products) {
    if (ids.has(p.id)) errors.push(`duplicate id ${p.id}`);
    if (skus.has(p.sku)) errors.push(`duplicate sku ${p.sku}`);
    ids.add(p.id);
    skus.add(p.sku);
    errors.push(...validateProduct(p, { families: familyMap }));
  }
  return errors;
}
