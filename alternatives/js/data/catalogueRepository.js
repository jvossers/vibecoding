// The only module that knows where catalogue data comes from. Today it reads the local
// JSON fixtures; a future API client can implement the same async methods and the UI
// will not need to change.

const FILES = {
  products: 'products.json',
  relationships: 'relationships.json',
  alternatives: 'alternatives.json',
  families: 'instrument-families.json',
};

export function createCatalogueRepository({ baseUrl = './data/', fetchImpl = (...a) => globalThis.fetch(...a) } = {}) {
  let loading = null;

  async function fetchJson(file) {
    const res = await fetchImpl(`${baseUrl}${file}`);
    if (!res.ok) throw new Error(`Could not load ${file} (HTTP ${res.status})`);
    return res.json();
  }

  function load() {
    loading ??= (async () => {
      const [products, relationships, alternatives, families] = await Promise.all(
        [FILES.products, FILES.relationships, FILES.alternatives, FILES.families].map(fetchJson));
      const productsById = new Map(products.map((p) => [p.id, p]));
      const familiesById = Object.fromEntries(families.map((f) => [f.id, f]));
      const relBySource = new Map();
      const relByTarget = new Map();
      for (const r of relationships) {
        if (!relBySource.has(r.sourceProductId)) relBySource.set(r.sourceProductId, []);
        if (!relByTarget.has(r.targetProductId)) relByTarget.set(r.targetProductId, []);
        relBySource.get(r.sourceProductId).push(r);
        relByTarget.get(r.targetProductId).push(r);
      }
      const altBySource = new Map();
      for (const a of alternatives) {
        if (!altBySource.has(a.sourceProductId)) altBySource.set(a.sourceProductId, []);
        altBySource.get(a.sourceProductId).push(a);
      }
      return { products, relationships, alternatives, families, productsById, familiesById, relBySource, relByTarget, altBySource };
    })();
    loading.catch(() => { loading = null; });
    return loading;
  }

  return {
    load,
    async listProducts() { return (await load()).products; },
    async getProduct(id) { return (await load()).productsById.get(id) ?? null; },
    async getProductBySku(sku) {
      const want = String(sku).trim().toUpperCase();
      return (await load()).products.find((p) => p.sku === want) ?? null;
    },
    async listFamilies() { return (await load()).families; },
    async familiesById() { return (await load()).familiesById; },

    // Relationships for a product, with direction made explicit.
    async relationshipsFor(productId) {
      const d = await load();
      const out = (d.relBySource.get(productId) ?? []).map((relationship) => ({
        relationship, direction: 'outgoing', other: d.productsById.get(relationship.targetProductId),
      }));
      const inc = (d.relByTarget.get(productId) ?? []).map((relationship) => ({
        relationship, direction: 'incoming', other: d.productsById.get(relationship.sourceProductId),
      }));
      return [...out, ...inc].filter((x) => x.other);
    },

    // Seeded (pre-generated) candidate pairs, the starting point of the review queue.
    async listAlternativeSeeds() { return (await load()).alternatives; },
    async seedsForSource(productId) { return (await load()).altBySource.get(productId) ?? []; },

    async tipsForFamily(familyId) {
      return (await load()).products.filter((p) => p.category === 'pipette_tip'
        && p.specifications.compatibleInstrumentFamilies.includes(familyId));
    },
  };
}
