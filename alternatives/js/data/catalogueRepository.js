// The only module that knows where catalogue data comes from. Today it reads the local
// JSON fixtures and applies the rules in the browser; a future API client can implement
// the same async methods and the UI will not need to change.

import { findAlternatives } from '../domain/matching.js';

export function createCatalogueRepository({ baseUrl = './data/', fetchImpl = (...a) => globalThis.fetch(...a) } = {}) {
  let loading = null;

  async function fetchJson(file) {
    const res = await fetchImpl(`${baseUrl}${file}`);
    if (!res.ok) throw new Error(`Could not load ${file} (HTTP ${res.status})`);
    return res.json();
  }

  function load() {
    loading ??= (async () => {
      const [products, families] = await Promise.all([fetchJson('products.json'), fetchJson('instrument-families.json')]);
      return {
        products,
        families,
        productsById: new Map(products.map((p) => [p.id, p])),
        familiesById: Object.fromEntries(families.map((f) => [f.id, f])),
        alternatives: new Map(),
      };
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
    async familiesById() { return (await load()).familiesById; },
    async alternativesFor(productId) {
      const d = await load();
      if (!d.alternatives.has(productId)) {
        const source = d.productsById.get(productId);
        d.alternatives.set(productId, source ? findAlternatives(source, d.products) : []);
      }
      return d.alternatives.get(productId);
    },
  };
}
