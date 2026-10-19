// Catalogue search and filtering. Pure functions so they can be tested in Node.

export const DEFAULT_FILTERS = { q: '', category: '', family: '', volume: '', sterile: '', filtered: '' };

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
      s.volumeMaxUl, s.material, s.filterMaterial].filter((x) => x !== null && x !== undefined).join(' '));
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

// Nominal volumes present in the catalogue, for the volume filter.
export function nominalVolumes(products) {
  return [...new Set(products.map((p) => p.specifications?.volumeMaxUl).filter((v) => typeof v === 'number'))].sort((a, b) => a - b);
}

export function applyFilters(products, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const yesNo = (value, want) => !want || value === (want === 'yes');
  const out = products.filter((p) => {
    const s = p.specifications ?? {};
    if (f.category && p.category !== f.category) return false;
    if (f.family && p.family !== f.family) return false;
    if (f.volume && s.volumeMaxUl !== Number(f.volume)) return false;
    if (f.sterile && (p.category !== 'pipette_tip' || !yesNo(s.sterile, f.sterile))) return false;
    if (f.filtered && (p.category !== 'pipette_tip' || !yesNo(s.filtered, f.filtered))) return false;
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
    if (v) f[key] = v;
  }
  return f;
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  for (const [key, v] of Object.entries(filters)) if (v && v !== DEFAULT_FILTERS[key]) params.set(key, String(v));
  return params;
}
