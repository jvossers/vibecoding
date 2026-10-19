// Product page: the product, its alternatives (from the rules) and its specifications.
// Search results open the product dialog instead; this page keeps direct links working.

import { h, append } from './dom.js';
import { icon, productThumb, skuTag, emptyState } from './components.js';
import { CATEGORY_LABELS } from '../domain/attributes.js';
import { rulesFor } from '../domain/matching.js';
import { exportPdf } from './exportSheet.js';
import { alternativesView, specGroups, noAlternativesNote, priceLine, alternativesChip } from './productParts.js';

export async function renderProductDetail(root, ctx, { params }) {
  const product = await ctx.repo.getProduct(params.id);
  const back = h('a', { class: 'back', href: ctx.lastCatalogueHash() }, icon('arrow-left'), 'Back to search');
  if (!product) {
    append(root, back, emptyState({ title: 'Product not found', body: 'This record does not exist in the synthetic catalogue.' }));
    return;
  }
  const [families, alternatives] = await Promise.all([ctx.repo.familiesById(), ctx.repo.alternativesFor(product.id)]);
  const rules = rulesFor(product.category);

  append(root, back, h('section', { class: 'card product-head', 'aria-labelledby': 'p-title' },
    productThumb(product, { size: 180, label: true }),
    h('div', {},
      h('div', { class: 'eyebrow' }, `${product.family} · ${CATEGORY_LABELS[product.category]}`),
      h('h1', { id: 'p-title' }, product.name),
      h('div', { class: 'meta' }, skuTag(product.sku, { copy: true }), priceLine(product), alternativesChip(product, alternatives)),
      h('p', { class: 'desc' }, product.description))));

  const altCard = h('section', { class: 'card', 'aria-labelledby': 'alt-title' });
  root.append(altCard);
  if (!rules.length) {
    append(altCard, h('div', { class: 'card-head' }, h('h2', { id: 'alt-title' }, 'Alternatives')), noAlternativesNote(product));
  } else {
    append(altCard,
      h('div', { class: 'card-head' },
        h('div', {},
          h('h2', { id: 'alt-title' }, `Alternatives (${alternatives.length})`),
          h('p', {}, 'Products that match the requested product on every rule. Check availability in the stock system.')),
        h('button', {
          type: 'button', class: 'btn btn-primary',
          on: { click: () => exportPdf({ product, alternatives, families, rules }) },
        }, icon('download'), 'Export PDF')),
      alternativesView({ product, alternatives, rules }));
  }

  root.append(h('section', { class: 'card', 'aria-labelledby': 'spec-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'spec-title' }, 'Specifications')),
    h('div', { class: 'spec-grid' }, specGroups(product, families))));
}
