import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readData(file) {
  return JSON.parse(readFileSync(join(root, 'data', file), 'utf8'));
}

export function loadCatalogue() {
  return {
    products: readData('products.json'),
    relationships: readData('relationships.json'),
    alternatives: readData('alternatives.json'),
    families: readData('instrument-families.json'),
  };
}

// A fetch() stand-in that serves the fixtures from disk.
export async function diskFetch(url) {
  const file = String(url).split('/').pop();
  try {
    const text = readFileSync(join(root, 'data', file), 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(text) };
  } catch {
    return { ok: false, status: 404, json: async () => null };
  }
}

export const FAMILIES = {
  'fam-a': { id: 'fam-a', name: 'Alpha', tipInterfaceType: 'universal_cone' },
  'fam-b': { id: 'fam-b', name: 'Beta', tipInterfaceType: 'universal_cone' },
  'fam-lock': { id: 'fam-lock', name: 'Locker', tipInterfaceType: 'lock_cone' },
};

let n = 0;
export function tip(spec = {}, envelope = {}) {
  n += 1;
  return {
    id: `t${n}`,
    sku: `TEST-${n}`,
    name: `Test tip ${n}`,
    brand: 'Quellmark',
    family: 'Test',
    category: 'pipette_tip',
    subcategory: 'Test tips',
    status: 'in_stock',
    tags: [],
    specifications: {
      volumeMinUl: 2,
      volumeMaxUl: 200,
      sterile: true,
      filtered: true,
      filterMaterial: 'Frit',
      lowRetention: false,
      material: 'Polypropylene',
      tipLengthMm: 51,
      tipFormat: 'standard',
      packagingType: 'rack',
      unitsPerPack: 96,
      racksPerPack: 1,
      sterilizationMethod: 'Irradiation',
      cleanlinessClaims: ['DNase-free'],
      compatibleInstrumentFamilies: ['fam-a', 'fam-b'],
      compatibilityNotes: null,
      colour: 'Natural',
      autoclavable: false,
      ...spec,
    },
    ...envelope,
  };
}

export function pipette(spec = {}) {
  n += 1;
  return {
    id: `pp${n}`,
    sku: `TESTP-${n}`,
    name: `Test pipette ${n}`,
    brand: 'Quellmark',
    family: 'Alpha',
    category: 'pipette',
    subcategory: 'Adjustable pipettes',
    status: 'in_stock',
    tags: [],
    specifications: { volumeMinUl: 20, volumeMaxUl: 200, channelCount: 1, adjustableVolume: true, instrumentFamilyId: 'fam-a', tipInterfaceType: 'universal_cone', accuracyNotes: null, ...spec },
  };
}
