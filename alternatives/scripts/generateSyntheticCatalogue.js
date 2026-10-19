// Deterministic generator for the synthetic Quellmark catalogue.
//
//   node scripts/generateSyntheticCatalogue.js          writes data/*.json and assets/illustrations/*.svg
//   node scripts/generateSyntheticCatalogue.js --check  only validates and prints a summary
//
// Everything here is invented: the brand, ranges, codes and specifications. Alternatives are
// not stored: the app derives them from the rules in js/domain/rules.js.
// Uses only Node's built-in modules.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { BRAND, formatNumber } from '../js/domain/attributes.js';
import { findAlternatives } from '../js/domain/matching.js';
import { validateCatalogue } from '../js/domain/validation.js';
import { illustrationSvg, ILLUSTRATION_KINDS, illustrationKind } from '../js/ui/illustrations.js';

export const SEED = 20261019;

// mulberry32: small, fast, reproducible.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Fictional instrument families
// ---------------------------------------------------------------------------

export const INSTRUMENT_FAMILIES = [
  { id: 'ifam-axis', name: 'Axis', kind: 'Manual single-channel, adjustable', tipInterfaceType: 'universal_cone', description: 'Fictional manual air-displacement pipettes with a universal Q-Cone tip cone.' },
  { id: 'ifam-axis-multi', name: 'Axis Multi', kind: 'Manual multichannel', tipInterfaceType: 'universal_cone', description: 'Fictional 8- and 12-channel manual pipettes sharing the Q-Cone interface.' },
  { id: 'ifam-vector', name: 'Vector', kind: 'Electronic single-channel', tipInterfaceType: 'universal_cone', description: 'Fictional motorised pipettes with programmable modes and a Q-Cone tip cone.' },
  { id: 'ifam-vector-lock', name: 'Vector Lock', kind: 'Electronic, secure-lock cone', tipInterfaceType: 'lock_cone', description: 'Fictional electronic pipettes with a Q-Lock cone that only seats Lockline tips.' },
  { id: 'ifam-fixa', name: 'Fixa', kind: 'Fixed-volume', tipInterfaceType: 'universal_cone', description: 'Fictional fixed-volume pipettes for routine single-volume steps.' },
  { id: 'ifam-axis-macro', name: 'Axis Macro', kind: 'Manual large-volume', tipInterfaceType: 'macro_cone', description: 'Fictional 5 mL and 10 mL pipettes with a wide macro cone.' },
  { id: 'ifam-microdose', name: 'Microdose', kind: 'Positive displacement', tipInterfaceType: 'capillary_piston', description: 'Fictional positive-displacement pipettes using disposable capillary pistons.' },
];

const UNIVERSAL = ['ifam-axis', 'ifam-axis-multi', 'ifam-vector', 'ifam-fixa'];

// ---------------------------------------------------------------------------
// Tip geometry per nominal volume (synthetic values)
// ---------------------------------------------------------------------------

const VOLUMES = {
  10: { min: 0.1, max: 10, len: 31.5, ext: 46 },
  20: { min: 0.5, max: 20, len: 51, ext: 60 },
  100: { min: 1, max: 100, len: 51 },
  200: { min: 2, max: 200, len: 51.5, ext: 77 },
  300: { min: 5, max: 300, len: 57 },
  1000: { min: 100, max: 1000, len: 78, ext: 102 },
  1200: { min: 100, max: 1200, len: 90 },
  5000: { min: 500, max: 5000, len: 150 },
  10000: { min: 1000, max: 10000, len: 243 },
};

const COLOUR_BY_VOLUME = { 10: 'Natural', 20: 'Natural', 100: 'Natural', 200: 'Yellow tint', 300: 'Natural', 1000: 'Blue tint', 1200: 'Blue tint', 5000: 'Natural', 10000: 'Natural' };

// Packaging variants. The name fragment and numeric fields are produced together so they cannot drift.
const PACKS = {
  R96: { sterile: false, packagingType: 'rack', units: 96, racks: 1, label: 'Rack of 96' },
  S96: { sterile: true, packagingType: 'rack', units: 96, racks: 1, label: 'Rack of 96' },
  S960: { sterile: true, packagingType: 'rack', units: 960, racks: 10, label: '10 Racks × 96 (960 tips)' },
  F960: { sterile: false, packagingType: 'refill', units: 960, racks: 10, label: 'Refill, 10 Inserts × 96 (960 tips)' },
  B1000: { sterile: false, packagingType: 'bulk', units: 1000, racks: null, label: 'Bulk Bag of 1,000' },
  FS96: { sterile: true, filtered: true, packagingType: 'rack', units: 96, racks: 1, label: 'Rack of 96' },
  FS24: { sterile: true, filtered: true, packagingType: 'rack', units: 24, racks: 1, label: 'Rack of 24' },
  X50: { sterile: false, packagingType: 'box', units: 50, racks: null, label: 'Box of 50' },
  X200: { sterile: false, packagingType: 'box', units: 200, racks: null, label: 'Box of 200' },
  SX96: { sterile: true, packagingType: 'rack', units: 96, racks: 1, label: 'Rack of 96' },
};

const CLAIMS = {
  core: ['DNase-free', 'RNase-free'],
  molecular: ['DNase-free', 'RNase-free', 'Human DNA-free', 'PCR inhibitor-free'],
  pyro: ['DNase-free', 'RNase-free', 'Pyrogen-free'],
};

// Tip ranges. `compat` lists the fictional instrument families the range is known to fit.
const TIP_FAMILIES = [
  {
    key: 'corefit', name: 'Corefit', code: 'CF', subcategory: 'Standard tips', filtered: false, lowRetention: false,
    tipFormat: 'standard', material: 'Virgin polypropylene', compat: UNIVERSAL, claims: CLAIMS.core, autoclavable: true,
    blurb: 'Corefit is the everyday Quellmark tip: a smooth-bore virgin polypropylene body with a ribbed collar that seats evenly on the Q-Cone.',
    items: [[10, ['R96', 'S96', 'F960', 'B1000']], [20, ['R96', 'S96', 'F960', 'B1000']], [200, ['R96', 'S96', 'F960', 'B1000']],
      [300, ['R96', 'F960']], [1000, ['R96', 'S96', 'F960', 'B1000']], [1200, ['R96', 'B1000']]],
  },
  {
    key: 'aerolock', name: 'Aerolock', code: 'AL', subcategory: 'Filter tips', filtered: true, filterMaterial: 'Sintered polyethylene frit',
    lowRetention: false, tipFormat: 'standard', material: 'Virgin polypropylene', compat: UNIVERSAL, claims: CLAIMS.molecular, autoclavable: false,
    blurb: 'Aerolock filter tips place a sintered polyethylene frit high in the bore to keep aerosols and splashes away from the pipette shaft.',
    items: [[10, ['S96', 'S960', 'R96']], [20, ['S96', 'S960', 'R96']], [100, ['S96', 'S960', 'R96']], [200, ['S96', 'S960', 'R96']],
      [1000, ['S96', 'S960', 'R96']], [1200, ['S96']]],
  },
  {
    key: 'slipstream', name: 'Slipstream', code: 'SS', subcategory: 'Low-retention tips', filtered: false, lowRetention: true,
    tipFormat: 'standard', material: 'Low-binding polypropylene blend', compat: UNIVERSAL, claims: CLAIMS.molecular, autoclavable: true,
    blurb: 'Slipstream tips use a low-binding polymer blend so viscous and detergent-rich samples leave less residue in the tip.',
    items: [[10, ['FS96', 'R96', 'S96']], [20, ['FS96', 'R96', 'S96']], [200, ['FS96', 'R96', 'S96']], [1000, ['FS96', 'R96', 'S96']]],
    filterMaterial: 'Sintered polyethylene frit',
  },
  {
    key: 'longreach', name: 'Longreach', code: 'LR', subcategory: 'Extended-length tips', filtered: false, lowRetention: false,
    tipFormat: 'extended', material: 'Virgin polypropylene', compat: ['ifam-axis', 'ifam-axis-multi', 'ifam-vector'], claims: CLAIMS.core, autoclavable: true,
    blurb: 'Longreach extended tips reach the bottom of deep-well plates and tall tubes without the pipette shaft touching the vessel.',
    items: [[10, ['FS96', 'R96']], [20, ['FS96', 'R96']], [200, ['FS96', 'R96']], [1000, ['FS96', 'R96']]],
    filterMaterial: 'Sintered polyethylene frit',
    compatibilityNotes: 'Extended length: confirm tip ejector clearance on Axis Multi before switching.',
  },
  {
    key: 'openbore', name: 'Openbore', code: 'OB', subcategory: 'Wide-bore tips', filtered: false, lowRetention: false,
    tipFormat: 'wide_bore', material: 'Virgin polypropylene', compat: ['ifam-axis', 'ifam-vector'], claims: CLAIMS.pyro, autoclavable: true,
    blurb: 'Openbore tips have a widened orifice for cell suspensions, genomic DNA and viscous liquids where shear and clogging matter.',
    items: [[200, ['FS96', 'R96']], [1000, ['FS96', 'R96']]],
    filterMaterial: 'Sintered polyethylene frit',
    volumeOverride: { 200: { min: 5, max: 200 }, 1000: { min: 100, max: 1000 } },
  },
  {
    key: 'lockline', name: 'Lockline', code: 'LK', subcategory: 'Secure-lock tips', filtered: false, lowRetention: false,
    tipFormat: 'standard', material: 'Virgin polypropylene', compat: ['ifam-vector-lock'], claims: CLAIMS.core, autoclavable: true,
    blurb: 'Lockline tips click onto the Q-Lock cone of Vector Lock pipettes; they do not seat on the universal Q-Cone.',
    items: [[10, ['FS96', 'R96', 'F960']], [200, ['FS96', 'R96', 'F960']], [1000, ['FS96', 'R96', 'F960']]],
    filterMaterial: 'Self-sealing polymer barrier',
    compatibilityNotes: 'Q-Lock cone only. Not for universal-cone pipettes.',
  },
  {
    key: 'microdose', name: 'Microdose', code: 'CP', subcategory: 'Capillary pistons', filtered: false, lowRetention: false,
    tipFormat: 'other', material: 'Polypropylene capillary, polyethylene piston', compat: ['ifam-microdose'], claims: CLAIMS.core, autoclavable: false,
    blurb: 'Microdose capillary pistons bring their own disposable piston, so the sample never contacts an air cushion. For Microdose pipettes only.',
    items: [[10, ['X200', 'SX96']], [100, ['X200', 'SX96']], [1000, ['X200', 'SX96']]],
    volumeOverride: { 10: { min: 1, max: 10, len: 54 }, 100: { min: 10, max: 100, len: 64 }, 1000: { min: 100, max: 1000, len: 96 } },
    compatibilityNotes: 'Positive displacement: requires a Microdose pipette.',
  },
  {
    key: 'multiflex', name: 'Multiflex', code: 'MF', subcategory: 'Multichannel tips', filtered: false, lowRetention: false,
    tipFormat: 'standard', material: 'Virgin polypropylene', compat: ['ifam-axis-multi', 'ifam-vector'], claims: CLAIMS.core, autoclavable: true,
    blurb: 'Multiflex tips are moulded with a flexible collar that seals evenly across all channels of a multichannel head.',
    items: [[20, ['R96', 'FS96']], [300, ['R96', 'FS96']], [1200, ['R96', 'FS96']]],
    filterMaterial: 'Sintered polyethylene frit',
    compatibilityNotes: 'Optimised for multichannel heads; single-channel Axis fit not characterised.',
  },
  {
    key: 'macro', name: 'Macro', code: 'MX', subcategory: 'Macro tips', filtered: false, lowRetention: false,
    tipFormat: 'standard', material: 'Virgin polypropylene', compat: ['ifam-axis-macro'], claims: CLAIMS.core, autoclavable: true,
    blurb: 'Macro tips cover 5 mL and 10 mL work on Axis Macro pipettes, with a broad collar for the macro cone.',
    items: [[5000, ['X50', 'FS24']], [10000, ['X50', 'FS24']]],
    filterMaterial: 'Sintered polyethylene frit',
  },
  {
    key: 'terra', name: 'Terra', code: 'TR', subcategory: 'Reduced-impact tips', filtered: false, lowRetention: false,
    tipFormat: 'standard', material: 'Bio-attributed polypropylene', compat: UNIVERSAL, claims: CLAIMS.core, autoclavable: true,
    blurb: 'Terra tips use bio-attributed polypropylene and refill inserts that reuse the original rack to cut packaging.',
    items: [[10, ['F960', 'S96']], [200, ['F960', 'S96']], [1000, ['F960', 'S96']]],
    colour: 'Green tint',
  },
];

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const vcode = (v) => String(v).padStart(4, '0');

// Synthetic list prices in GBP, per pack (tips) or per unit (instruments, accessories).
// Derived from the product's attributes so they stay consistent: a 10-rack pack costs about
// ten racks less a discount, sterile costs more than non-sterile, and so on.
const TIP_RACK_PRICE = {
  Corefit: 6.4, Aerolock: 14.9, Slipstream: 12.5, Longreach: 11.8, Openbore: 13.2,
  Lockline: 15.6, Microdose: 19.5, Multiflex: 9.8, Macro: 16.5, Terra: 7.2,
};
const VOLUME_FACTOR = { 10: 0.9, 20: 0.95, 100: 1, 200: 1, 300: 1.05, 1000: 1.1, 1200: 1.2, 5000: 1.35, 10000: 1.6 };
const PIPETTE_PRICE = {
  'ifam-axis': 245, 'ifam-axis-multi': 690, 'ifam-vector': 545, 'ifam-vector-lock': 585,
  'ifam-fixa': 149, 'ifam-axis-macro': 329, 'ifam-microdose': 425,
};
const ACCESSORY_PRICE = {
  'Pipette stand': 64, 'Carousel stand': 118, 'Charging stand': 189, 'Empty tip rack': 9.5, 'Refill station': 24,
  'Service kit': 38, Tool: 29, 'Calibration kit': 245, 'Cone filters': 17.5,
};
const toPrice = (n) => Math.round(n * 20) / 20; // nearest 5p

export function priceFor(p) {
  const s = p.specifications;
  if (p.category === 'pipette') {
    const channels = s.channelCount > 8 ? 1.15 : 1;
    return toPrice(PIPETTE_PRICE[s.instrumentFamilyId] * channels + (s.volumeMaxUl >= 1000 ? 15 : 0));
  }
  if (p.category === 'accessory') return toPrice(ACCESSORY_PRICE[s.accessoryType]);
  const perTip = (TIP_RACK_PRICE[p.family] * (VOLUME_FACTOR[s.volumeMaxUl] ?? 1) * (s.sterile ? 1.25 : 1) * (s.filtered ? 1.1 : 1)) / 96;
  const packDiscount = { rack: s.unitsPerPack > 96 ? 0.92 : 1, refill: 0.85, bulk: 0.7, box: 1 }[s.packagingType] ?? 1;
  return toPrice(perTip * s.unitsPerPack * packDiscount);
}
const volLabel = (v) => (v >= 5000 ? `${v / 1000} mL` : `${v} µL`);
const slug = (sku) => `p-${sku.toLowerCase()}`;

function tipName(fam, vol, pack, filtered, sterile) {
  const kind = fam.key === 'microdose' ? 'Capillary Pistons' : filtered ? 'Filter Tips' : 'Tips';
  const sterility = sterile ? 'Sterile' : 'Non-sterile';
  const extra = { longreach: 'Extended ', openbore: 'Wide-bore ', slipstream: 'Low-retention ', multiflex: 'Multichannel ' }[fam.key] ?? '';
  return `${fam.name} ${volLabel(vol)} ${extra}${kind}, ${sterility}, ${pack.label}`;
}

function tipTags(p) {
  const s = p.specifications;
  const t = [p.family.toLowerCase(), p.subcategory.toLowerCase()];
  if (s.volumeMaxUl) t.push(`${s.volumeMaxUl} µl`);
  if (s.filtered === true) t.push('filtered', 'filter');
  if (s.filtered === false) t.push('non-filtered');
  if (s.sterile === true) t.push('sterile');
  if (s.sterile === false) t.push('non-sterile');
  if (s.lowRetention) t.push('low retention');
  if (s.tipFormat === 'extended') t.push('extended', 'long');
  if (s.tipFormat === 'wide_bore') t.push('wide bore');
  if (s.packagingType) t.push(s.packagingType);
  return [...new Set(t)];
}

export function generateCatalogue(seed = SEED) {
  const rnd = prng(seed);
  const products = [];

  // --- Tips ---------------------------------------------------------------
  for (const fam of TIP_FAMILIES) {
    for (const [vol, packs] of fam.items) {
      for (const packCode of packs) {
        const pack = PACKS[packCode];
        const geo = { ...VOLUMES[vol], ...(fam.volumeOverride?.[vol] ?? {}) };
        const filtered = pack.filtered ?? fam.filtered;
        const sterile = pack.sterile;
        const sku = `QMT-${fam.code}${vcode(vol)}-${packCode}`;
        const length = fam.tipFormat === 'extended' ? geo.ext : geo.len;
        const p = {
          id: slug(sku),
          sku,
          name: tipName(fam, vol, pack, filtered, sterile),
          brand: BRAND,
          family: fam.name,
          category: 'pipette_tip',
          subcategory: filtered && fam.subcategory === 'Standard tips' ? 'Filter tips' : fam.subcategory,
          description: '',
          imagePath: null,
          tags: [],
          specifications: {
            volumeMinUl: geo.min,
            volumeMaxUl: geo.max,
            sterile,
            filtered,
            filterMaterial: filtered ? fam.filterMaterial : null,
            lowRetention: fam.lowRetention,
            material: fam.material,
            tipLengthMm: length,
            tipFormat: fam.tipFormat,
            packagingType: pack.packagingType,
            unitsPerPack: pack.units,
            racksPerPack: pack.racks,
            sterilizationMethod: sterile ? (fam.key === 'aerolock' || fam.key === 'slipstream' ? 'Electron-beam irradiation' : 'Gamma irradiation') : null,
            cleanlinessClaims: sterile ? [...fam.claims, ...(filtered && !fam.claims.includes('Pyrogen-free') ? ['Pyrogen-free'] : [])] : fam.claims.slice(0, 2),
            compatibleInstrumentFamilies: [...fam.compat],
            compatibilityNotes: fam.compatibilityNotes ?? null,
            colour: fam.colour ?? COLOUR_BY_VOLUME[vol],
            autoclavable: sterile || filtered ? false : fam.autoclavable,
          },
        };
        const packSentence = {
          rack: `Supplied ${pack.units === 96 ? 'in a single hinged rack of 96' : `as ${pack.racks} hinged racks of 96`}.`,
          refill: `Supplied as ${pack.racks} refill inserts of 96 for re-use with an existing rack.`,
          bulk: `Supplied loose in a resealable bag of ${formatNumber(pack.units)}.`,
          box: `Supplied in a box of ${pack.units}.`,
        }[pack.packagingType];
        p.description = [
          fam.blurb,
          `This ${volLabel(vol)} format covers ${formatNumber(geo.min)}–${formatNumber(geo.max)} µL${filtered ? ` with a ${fam.filterMaterial.toLowerCase()}` : ''}.`,
          packSentence,
          sterile ? 'Sterile pack: tips stay sealed until the lid is opened.' : 'Non-sterile: suitable where sterility is not required.',
        ].join(' ');
        products.push(p);
      }
    }
  }

  // --- Instruments -----------------------------------------------------------
  const PIPETTES = [
    ['AX0002', 'ifam-axis', 'Axis 2 Adjustable Pipette', 0.2, 2, 1, true],
    ['AX0010', 'ifam-axis', 'Axis 10 Adjustable Pipette', 1, 10, 1, true],
    ['AX0020', 'ifam-axis', 'Axis 20 Adjustable Pipette', 2, 20, 1, true],
    ['AX0100', 'ifam-axis', 'Axis 100 Adjustable Pipette', 10, 100, 1, true],
    ['AX0200', 'ifam-axis', 'Axis 200 Adjustable Pipette', 20, 200, 1, true],
    ['AX1000', 'ifam-axis', 'Axis 1000 Adjustable Pipette', 100, 1000, 1, true],
    ['AM0810', 'ifam-axis-multi', 'Axis Multi 8 × 10 µL Pipette', 1, 10, 8, true],
    ['AM0820', 'ifam-axis-multi', 'Axis Multi 8 × 200 µL Pipette', 20, 200, 8, true],
    ['AM1230', 'ifam-axis-multi', 'Axis Multi 12 × 300 µL Pipette', 30, 300, 12, true],
    ['AM0812', 'ifam-axis-multi', 'Axis Multi 8 × 1200 µL Pipette', 100, 1200, 8, true],
    ['VE0010', 'ifam-vector', 'Vector 10 Electronic Pipette', 0.5, 10, 1, true],
    ['VE0200', 'ifam-vector', 'Vector 200 Electronic Pipette', 10, 200, 1, true],
    ['VE1000', 'ifam-vector', 'Vector 1000 Electronic Pipette', 50, 1000, 1, true],
    ['VL0010', 'ifam-vector-lock', 'Vector Lock 10 Electronic Pipette', 0.5, 10, 1, true],
    ['VL0200', 'ifam-vector-lock', 'Vector Lock 200 Electronic Pipette', 10, 200, 1, true],
    ['VL1000', 'ifam-vector-lock', 'Vector Lock 1000 Electronic Pipette', 50, 1000, 1, true],
    ['FX0010', 'ifam-fixa', 'Fixa 10 µL Fixed-volume Pipette', 10, 10, 1, false],
    ['FX0020', 'ifam-fixa', 'Fixa 20 µL Fixed-volume Pipette', 20, 20, 1, false],
    ['FX0100', 'ifam-fixa', 'Fixa 100 µL Fixed-volume Pipette', 100, 100, 1, false],
    ['FX0200', 'ifam-fixa', 'Fixa 200 µL Fixed-volume Pipette', 200, 200, 1, false],
    ['FX1000', 'ifam-fixa', 'Fixa 1000 µL Fixed-volume Pipette', 1000, 1000, 1, false],
    ['MA5000', 'ifam-axis-macro', 'Axis Macro 5 mL Pipette', 500, 5000, 1, true],
    ['MA10K0', 'ifam-axis-macro', 'Axis Macro 10 mL Pipette', 1000, 10000, 1, true],
    ['MD0010', 'ifam-microdose', 'Microdose 10 Positive-displacement Pipette', 1, 10, 1, true],
    ['MD0100', 'ifam-microdose', 'Microdose 100 Positive-displacement Pipette', 10, 100, 1, true],
    ['MD1000', 'ifam-microdose', 'Microdose 1000 Positive-displacement Pipette', 100, 1000, 1, true],
  ];
  const famById = Object.fromEntries(INSTRUMENT_FAMILIES.map((f) => [f.id, f]));
  for (const [code, famId, name, min, max, channels, adjustable] of PIPETTES) {
    const fam = famById[famId];
    const sku = `QMP-${code}`;
    const electronic = famId.startsWith('ifam-vector');
    products.push({
      id: slug(sku),
      sku,
      name,
      brand: BRAND,
      family: fam.name,
      category: 'pipette',
      subcategory: electronic ? 'Electronic pipettes' : channels > 1 ? 'Multichannel pipettes' : adjustable ? 'Adjustable pipettes' : 'Fixed-volume pipettes',
      description: `${fam.description} This model covers ${min === max ? `a fixed ${formatNumber(min)} µL` : `${formatNumber(min)}–${formatNumber(max)} µL`}${channels > 1 ? ` across ${channels} channels` : ''}. Instruments are listed for reference; alternatives are only worked out for pipette tips.`,
      imagePath: null,
      tags: [fam.name.toLowerCase(), 'pipette', electronic ? 'electronic' : 'manual', channels > 1 ? 'multichannel' : 'single-channel'],
      specifications: {
        volumeMinUl: min,
        volumeMaxUl: max,
        channelCount: channels,
        adjustableVolume: adjustable,
        instrumentFamilyId: famId,
        tipInterfaceType: fam.tipInterfaceType,
        accuracyNotes: rnd() < 0.8 ? `Synthetic demo figure: systematic error ≤ ${(0.6 + rnd() * 1.6).toFixed(1)}% at nominal volume.` : null,
      },
    });
  }

  // --- Accessories -----------------------------------------------------------
  const ACCESSORIES = [
    ['ST-LIN6', 'Linear Pipette Stand, 6 Positions', 'Pipette stand', ['ifam-axis', 'ifam-axis-multi', 'ifam-vector', 'ifam-fixa']],
    ['ST-CAR6', 'Carousel Pipette Stand, 6 Positions', 'Carousel stand', ['ifam-axis', 'ifam-vector', 'ifam-vector-lock', 'ifam-axis-macro']],
    ['ST-CHG2', 'Vector Charging Stand, 2 Positions', 'Charging stand', ['ifam-vector', 'ifam-vector-lock']],
    ['RK-E96', 'Empty Autoclavable Tip Rack, 96 Positions', 'Empty tip rack', ['ifam-axis', 'ifam-axis-multi', 'ifam-vector', 'ifam-fixa']],
    ['RK-REF', 'Refill Station Base for 96-insert Refills', 'Refill station', ['ifam-axis', 'ifam-axis-multi', 'ifam-vector', 'ifam-fixa']],
    ['KT-LKS', 'Q-Lock Cone Service Kit', 'Service kit', ['ifam-vector-lock']],
    ['KT-MDE', 'Microdose Piston Ejector Tool', 'Tool', ['ifam-microdose']],
    ['KT-ORG', 'Cone O-ring Service Kit for Axis', 'Service kit', ['ifam-axis', 'ifam-axis-multi']],
    ['KT-CAL', 'Gravimetric Check Kit (synthetic demo)', 'Calibration kit', ['ifam-axis', 'ifam-axis-multi', 'ifam-vector', 'ifam-vector-lock', 'ifam-fixa', 'ifam-axis-macro', 'ifam-microdose']],
    ['KT-MXF', 'Macro Cone Filter Discs, Pack of 25', 'Cone filters', ['ifam-axis-macro']],
  ];
  for (const [code, name, type, fams] of ACCESSORIES) {
    const sku = `QMA-${code}`;
    products.push({
      id: slug(sku),
      sku,
      name,
      brand: BRAND,
      family: 'Benchware',
      category: 'accessory',
      subcategory: type,
      description: `${name} for ${fams.map((f) => famById[f].name).join(', ')} pipettes. Listed for reference.`,
      imagePath: null,
      tags: ['accessory', type.toLowerCase(), ...fams.map((f) => famById[f].name.toLowerCase())],
      specifications: {
        accessoryType: type,
        compatibleInstrumentFamilies: fams,
        material: /stand|rack|station/i.test(type) ? 'Polycarbonate and steel' : 'Mixed',
        notes: null,
      },
    });
  }

  for (const p of products) {
    p.imagePath = `assets/illustrations/${illustrationKind(p)}.svg`;
    p.price = priceFor(p);
    if (p.category === 'pipette_tip') p.tags = tipTags(p);
  }

  const catalogue = { products, families: INSTRUMENT_FAMILIES };
  const errors = validateCatalogue(catalogue);
  return { ...catalogue, errors, stats: summarise(catalogue) };
}

export function summarise({ products, families }) {
  const familiesById = Object.fromEntries(families.map((f) => [f.id, f]));
  const tips = products.filter((p) => p.category === 'pipette_tip');
  const counts = tips.map((t) => findAlternatives(t, products, { families: familiesById }).length);
  return {
    products: products.length,
    tips: tips.length,
    pipettes: products.filter((p) => p.category === 'pipette').length,
    accessories: products.filter((p) => p.category === 'accessory').length,
    tipsWithAlternatives: counts.filter((n) => n > 0).length,
    alternativePairs: counts.reduce((a, b) => a + b, 0),
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function main() {
  const check = process.argv.includes('--check');
  const { products, families, errors, stats } = generateCatalogue();
  if (errors.length) {
    console.error(`Catalogue failed validation (${errors.length} errors):\n  ${errors.slice(0, 40).join('\n  ')}`);
    process.exit(1);
  }
  console.table(stats);
  if (check) return;
  const write = (file, data) => writeFileSync(join(root, file), `${JSON.stringify(data, null, 2)}\n`);
  mkdirSync(join(root, 'data'), { recursive: true });
  write('data/products.json', products);
  write('data/instrument-families.json', families);
  mkdirSync(join(root, 'assets/illustrations'), { recursive: true });
  for (const kind of ILLUSTRATION_KINDS) {
    writeFileSync(join(root, `assets/illustrations/${kind}.svg`), `${illustrationSvg({ kind, filtered: kind === 'tip-filtered', length: kind === 'tip-extended' ? 77 : 51 }, { title: `Generic ${kind.replace('-', ' ')} illustration` })}\n`);
  }
  console.log('Wrote data/*.json and assets/illustrations/*.svg');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
