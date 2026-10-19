// Product page: the product, its alternatives (from the rules) and its specifications.

import { h, append } from './dom.js';
import { icon, productThumb, boolValue, skuTag, valueOrUnknown, emptyState } from './components.js';
import {
  CATEGORY_LABELS, INTERFACE_LABELS, TIP_FORMAT_LABELS, PACKAGING_LABELS,
  formatVolume, formatNumber, formatEnum, formatLength, formatList, isUnknown, familyNames,
} from '../domain/attributes.js';
import { rulesFor } from '../domain/matching.js';

// Columns of the alternatives table. Rule fields always agree; the others may differ.
const ALT_COLUMNS = [
  ['Volume', (s) => formatVolume(s.volumeMinUl, s.volumeMaxUl)],
  ['Sterile', (s) => s.sterile, 'bool'],
  ['Filtered', (s) => s.filtered, 'bool'],
  ['Low retention', (s) => s.lowRetention, 'bool'],
  ['Format', (s) => formatEnum(TIP_FORMAT_LABELS, s.tipFormat)],
  ['Packaging', (s) => (isUnknown(s.packagingType) ? 'Not recorded' : `${formatEnum(PACKAGING_LABELS, s.packagingType)} · ${formatNumber(s.unitsPerPack)}`)],
];

export async function renderProductDetail(root, ctx, { params }) {
  const product = await ctx.repo.getProduct(params.id);
  const back = h('a', { class: 'back', href: ctx.lastCatalogueHash() }, icon('arrow-left'), 'Back to search');
  if (!product) {
    append(root, back, emptyState({ title: 'Product not found', body: 'This record does not exist in the synthetic catalogue.' }));
    return;
  }
  const [families, alternatives] = await Promise.all([ctx.repo.familiesById(), ctx.repo.alternativesFor(product.id)]);
  const s = product.specifications;
  const isTip = product.category === 'pipette_tip';

  // ---- Header
  append(root, back, h('section', { class: 'card product-head', 'aria-labelledby': 'p-title' },
    productThumb(product, { size: 180, label: true }),
    h('div', {},
      h('div', { class: 'eyebrow' }, `${product.family} · ${CATEGORY_LABELS[product.category]}`),
      h('h1', { id: 'p-title' }, product.name),
      h('div', { class: 'meta' }, skuTag(product.sku, { copy: true }),
        isTip ? h('span', { class: `chip ${alternatives.length ? 'chip-count' : ''}` }, `${alternatives.length || 'No'} alternative${alternatives.length === 1 ? '' : 's'}`) : null),
      h('p', { class: 'desc' }, product.description))));

  // ---- Alternatives
  const altCard = h('section', { class: 'card', 'aria-labelledby': 'alt-title' });
  root.append(altCard);
  const rules = rulesFor(product.category);
  if (!rules.length) {
    append(altCard,
      h('div', { class: 'card-head' }, h('h2', { id: 'alt-title' }, 'Alternatives')),
      h('p', { class: 'note' }, `Alternatives are only worked out for pipette tips. This is a ${CATEGORY_LABELS[product.category].toLowerCase()}.`));
  } else {
    append(altCard,
      h('div', { class: 'card-head' },
        h('h2', { id: 'alt-title' }, `Alternatives (${alternatives.length})`),
        h('p', {}, 'Products that match this one on every rule. Check availability in the stock system.')),
      h('div', { class: 'matched-on' }, 'Matched on:', rules.map((r) => h('span', { class: 'chip chip-match' }, icon('check'), r.label))));

    if (!alternatives.length) {
      altCard.append(emptyState({ title: 'No alternatives', body: 'No other product matches this one on all of the fields above.' }));
    } else {
      const cell = (p, [label, get, kind], highlight) => {
        const v = get(p.specifications);
        const ref = get(s);
        const differs = highlight && v !== ref;
        return h('td', { 'data-label': label, class: differs ? 'differs' : null, title: differs ? 'Differs from the requested product' : null },
          kind === 'bool' ? boolValue(v) : valueOrUnknown(v));
      };
      const productCell = (p, requested) => h('td', { class: 'cell-first' }, h('div', { class: 'cell-product' }, productThumb(p),
        h('div', {}, requested ? h('span', { class: 'tag' }, 'Requested product') : null,
          requested ? h('div', { style: { fontWeight: '650', color: 'var(--navy-900)', lineHeight: '1.3' } }, p.name) : h('a', { href: `#/product/${p.id}` }, p.name),
          h('div', { class: 'sub' }, skuTag(p.sku), p.family))));

      altCard.append(h('div', { class: 'table-wrap' }, h('table', { class: 'data alts stack' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Product'), ALT_COLUMNS.map(([label]) => h('th', { scope: 'col' }, label)))),
        h('tbody', {},
          h('tr', { class: 'requested' }, productCell(product, true), ALT_COLUMNS.map((c) => cell(product, c, false))),
          alternatives.map((alt) => h('tr', {}, productCell(alt, false), ALT_COLUMNS.map((c) => cell(alt, c, true))))))));
    }
  }

  // ---- Specifications
  const group = (title, rows) => h('div', { class: 'spec-group' }, h('h3', {}, title),
    h('dl', { class: 'specs' }, rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, typeof v === 'string' ? valueOrUnknown(v) : v)])));

  let groups;
  if (isTip) {
    const ifaces = [...new Set(s.compatibleInstrumentFamilies.map((id) => families[id]?.tipInterfaceType).filter(Boolean))];
    groups = [
      group('Performance', [
        ['Volume range', formatVolume(s.volumeMinUl, s.volumeMaxUl)],
        ['Tip format', formatEnum(TIP_FORMAT_LABELS, s.tipFormat)],
        ['Low retention', boolValue(s.lowRetention)],
        ['Tip length', formatLength(s.tipLengthMm)],
        ['Body material', s.material ?? 'Not recorded'],
      ]),
      group('Compatibility', [
        ['Pipette families', familyNames(s.compatibleInstrumentFamilies, families)],
        ['Tip interface', ifaces.length ? ifaces.map((i) => INTERFACE_LABELS[i]).join(', ') : 'Not recorded'],
        ['Notes', s.compatibilityNotes ?? '—'],
      ]),
      group('Hygiene', [
        ['Sterile', boolValue(s.sterile)],
        ['Sterilisation method', s.sterilizationMethod ?? '—'],
        ['Filtered', boolValue(s.filtered)],
        ['Filter material', s.filterMaterial ?? '—'],
        ['Stated claims', formatList(s.cleanlinessClaims)],
        ['Autoclavable', boolValue(s.autoclavable)],
      ]),
      group('Packaging', [
        ['Packaging', formatEnum(PACKAGING_LABELS, s.packagingType)],
        ['Tips per pack', formatNumber(s.unitsPerPack)],
        ['Racks per pack', isUnknown(s.racksPerPack) ? '—' : formatNumber(s.racksPerPack)],
        ['Colour', s.colour ?? 'Not recorded'],
      ]),
    ];
  } else if (product.category === 'pipette') {
    groups = [
      group('Performance', [
        ['Volume range', formatVolume(s.volumeMinUl, s.volumeMaxUl)],
        ['Channels', String(s.channelCount)],
        ['Adjustable volume', boolValue(s.adjustableVolume)],
        ['Accuracy notes', s.accuracyNotes ?? 'Not recorded'],
      ]),
      group('Compatibility', [
        ['Pipette family', families[s.instrumentFamilyId]?.name ?? 'Not recorded'],
        ['Family type', families[s.instrumentFamilyId]?.kind ?? 'Not recorded'],
        ['Tip interface', INTERFACE_LABELS[s.tipInterfaceType]],
      ]),
    ];
  } else {
    groups = [group('Details', [
      ['Accessory type', s.accessoryType],
      ['Material', s.material ?? 'Not recorded'],
      ['Fits', familyNames(s.compatibleInstrumentFamilies, families)],
    ])];
  }
  root.append(h('section', { class: 'card', 'aria-labelledby': 'spec-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'spec-title' }, 'Specifications')),
    h('div', { class: 'spec-grid' }, groups)));
}
