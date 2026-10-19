// Catalogue search and filtering. Pure functions so they can be tested in Node.

import { isUnknown } from './attributes.js';

export const DEFAULT_FILTERS = {
  q: '', category: '', status: '', volMin: null, volMax: null, sterile: '', filtered: '', family: '', fits: '',
};

const KEYWORDS = {
  sterile: (s) => s.sterile === true,
  'non-sterile': (s) => s.sterile === false,
  nonsterile: (s) => s.sterile === false,
  filtered: (s) => s.filtered === true,
  filter: (s) => s.filtered === true,
  unfiltered: (s) => s.filtered === false,
  'non-filtered': (s) => s.filtered === false,
  'low-retention': (s) => s.lowRetention === true,
};

export function normalise(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[μu]l\b/g, 'µl') // Greek mu or plain "ul" -> micro sign
    .replace(/(\d)(µl|ml)\b/g, '$1 $2') // "200µl" -> "200 µl"
    .replace(/(\d),(\d{3})/g, '$1$2');
}

export function tokenize(query) {
  return normalise(query).split(/[\s,;]+/).filter(Boolean);
}

const haystacks = new WeakMap();
function haystack(p) {
  let h = haystacks.get(p);
  if (!h) {
    const s = p.specifications ?? {};
    const text = normalise([p.sku, p.name, p.family, p.subcategory, p.category.replace('_', ' '), ...p.tags,
      s.volumeMaxUl, s.material, s.filterMaterial].filter((x) => !isUnknown(x)).join(' '));
    h = { text, words: new Set(text.split(/[^a-z0-9.µ-]+/)) };
    haystacks.set(p, h);
  }
  return h;
}

export function matchesQuery(p, query) {
  const tokens = tokenize(query);
  if (!tokens.length) return true;
  const h = haystack(p);
  return tokens.every((t) => {
    if (KEYWORDS[t]) return KEYWORDS[t](p.specifications ?? {});
    if (/^\d+(\.\d+)?$/.test(t)) return h.words.has(t) || p.sku.toLowerCase().includes(t.padStart(4, '0'));
    return h.text.includes(t);
  });
}

// Higher is better: exact SKU, SKU prefix, then name hits.
export function queryRank(p, query) {
  const q = String(query ?? '').trim().toUpperCase();
  if (!q) return 0;
  if (p.sku === q) return 100;
  if (p.sku.startsWith(q)) return 60;
  if (p.sku.includes(q)) return 40;
  if (p.name.toUpperCase().startsWith(q)) return 20;
  return 0;
}

function triState(value, want) {
  if (!want) return true;
  if (want === 'unknown') return isUnknown(value);
  return value === (want === 'yes');
}

export function applyFilters(products, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const lo = isUnknown(f.volMin) || f.volMin === '' ? null : Number(f.volMin);
  const hi = isUnknown(f.volMax) || f.volMax === '' ? null : Number(f.volMax);
  const out = products.filter((p) => {
    const s = p.specifications ?? {};
    if (f.category && p.category !== f.category) return false;
    if (f.status === 'unavailable') { if (!['out_of_stock', 'discontinued'].includes(p.status)) return false; }
    else if (f.status && p.status !== f.status) return false;
    if (f.family && p.family !== f.family) return false;
    if (f.fits) {
      const fams = p.category === 'pipette' ? [s.instrumentFamilyId] : s.compatibleInstrumentFamilies ?? [];
      if (!fams.includes(f.fits)) return false;
    }
    if (f.sterile && (p.category !== 'pipette_tip' || !triState(s.sterile, f.sterile))) return false;
    if (f.filtered && (p.category !== 'pipette_tip' || !triState(s.filtered, f.filtered))) return false;
    if (lo !== null || hi !== null) {
      const min = s.volumeMinUl ?? s.volumeMaxUl, max = s.volumeMaxUl ?? s.volumeMinUl;
      if (isUnknown(min) || isUnknown(max)) return false;
      if (lo !== null && max < lo) return false;
      if (hi !== null && min > hi) return false;
    }
    return matchesQuery(p, f.q);
  });
  if (f.q) {
    return out.map((p, i) => ({ p, i, r: queryRank(p, f.q) })).sort((a, b) => b.r - a.r || a.i - b.i).map((x) => x.p);
  }
  return out;
}

export function filtersFromParams(params) {
  const f = { ...DEFAULT_FILTERS };
  for (const key of Object.keys(DEFAULT_FILTERS)) {
    const v = params.get(key);
    if (v !== null && v !== '') f[key] = key === 'volMin' || key === 'volMax' ? Number(v) : v;
  }
  return f;
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  for (const [key, v] of Object.entries(filters)) {
    if (v !== null && v !== '' && v !== undefined && !Number.isNaN(v) && v !== DEFAULT_FILTERS[key]) params.set(key, String(v));
  }
  return params;
}
