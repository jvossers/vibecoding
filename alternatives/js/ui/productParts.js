// Building blocks shared by the product dialog and the product page: the alternatives
// comparison (requested product, matched-on rules, alternatives) and the specification groups.

import { h } from './dom.js';
import { icon, productThumb, boolValue, skuTag, valueOrUnknown, emptyState } from './components.js';
import {
  CATEGORY_LABELS, INTERFACE_LABELS, TIP_FORMAT_LABELS, PACKAGING_LABELS,
  formatVolume, formatNumber, formatEnum, formatPrice, formatLength, formatList, isUnknown, familyNames,
} from '../domain/attributes.js';

// Columns of the comparison tables. Rule fields always agree; the others may differ.
const ALT_COLUMNS = [
  ['Volume', (s) => formatVolume(s.volumeMinUl, s.volumeMaxUl)],
  ['Sterile', (s) => s.sterile, 'bool'],
  ['Filtered', (s) => s.filtered, 'bool'],
  ['Low retention', (s) => s.lowRetention, 'bool'],
  ['Packaging', (s) => (isUnknown(s.packagingType) ? 'Not recorded' : `${formatEnum(PACKAGING_LABELS, s.packagingType)} · ${formatNumber(s.unitsPerPack)}`)],
  ['Price', (s, p) => formatPrice(p.price)],
];

export function noAlternativesNote(product) {
  return h('p', { class: 'note' }, `Alternatives are only worked out for pipette tips. This is a ${CATEGORY_LABELS[product.category].toLowerCase()}.`);
}

// Requested product, then the rules it was matched on, then the alternatives. The two tables
// share column widths so values line up. `onOpen(product, event)` handles clicks on an alternative.
export function alternativesView({ product, alternatives, rules, onOpen = null }) {
  const s = product.specifications;
  const cell = (p, [label, get, kind], highlight) => {
    const v = get(p.specifications, p);
    const differs = highlight && v !== get(s, product);
    return h('td', { 'data-label': label, class: differs ? 'differs' : null, title: differs ? 'Differs from the requested product' : null },
      kind === 'bool' ? boolValue(v) : valueOrUnknown(v));
  };
  const productCell = (p, requested) => h('td', { class: 'cell-first' }, h('div', { class: 'cell-product' }, productThumb(p),
    h('div', {},
      requested
        ? h('div', { class: 'product-name' }, p.name)
        : h('a', { href: `#/product/${p.id}`, on: onOpen ? { click: (e) => onOpen(p, e) } : null }, p.name),
      h('div', { class: 'sub' }, skuTag(p.sku), p.family))));
  const table = (rows, caption) => h('div', { class: 'table-wrap' }, h('table', { class: 'data alts stack' },
    h('caption', { class: 'visually-hidden' }, caption),
    h('colgroup', {}, ['38%', '14%', '9%', '9%', '11%', '11%', '8%'].map((w) => h('col', { style: { width: w } }))),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Product'), ALT_COLUMNS.map(([label]) => h('th', { scope: 'col' }, label)))),
    h('tbody', {}, rows)));

  return [
    h('div', { class: 'compare-panel requested-panel' },
      h('div', { class: 'panel-label' }, 'Requested product'),
      table(h('tr', {}, productCell(product, true), ALT_COLUMNS.map((c) => cell(product, c, false))), 'Requested product')),
    h('div', { class: 'matched-on' },
      h('span', { class: 'arrow', 'aria-hidden': 'true' }, icon('arrow-down')),
      'Matched on:', rules.map((r) => h('span', { class: 'chip chip-match' }, icon('check'), r.label))),
    h('div', { class: 'compare-panel alternatives-panel' },
      h('div', { class: 'panel-label' }, 'Alternatives', h('span', { class: 'count' }, String(alternatives.length))),
      alternatives.length
        ? table(alternatives.map((alt) => h('tr', {}, productCell(alt, false), ALT_COLUMNS.map((c) => cell(alt, c, true)))), 'Alternatives')
        : emptyState({ title: 'No alternatives', body: 'No other product matches this one on all of the fields above.' })),
  ];
}

export function specGroups(product, families) {
  const s = product.specifications;
  const group = (title, rows) => h('div', { class: 'spec-group' }, h('h3', {}, title),
    h('dl', { class: 'specs' }, rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, typeof v === 'string' ? valueOrUnknown(v) : v)])));

  if (product.category === 'pipette_tip') {
    const ifaces = [...new Set(s.compatibleInstrumentFamilies.map((id) => families[id]?.tipInterfaceType).filter(Boolean))];
    return [
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
  }
  if (product.category === 'pipette') {
    return [
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
  }
  return [group('Details', [
    ['Accessory type', s.accessoryType],
    ['Material', s.material ?? 'Not recorded'],
    ['Fits', familyNames(s.compatibleInstrumentFamilies, families)],
  ])];
}

export function priceLine(product) {
  return h('span', { class: 'price' }, formatPrice(product.price), h('span', { class: 'per' }, product.category === 'pipette_tip' ? ' per pack' : ' each'));
}

export function alternativesChip(product, alternatives) {
  if (product.category !== 'pipette_tip') return null;
  const n = alternatives.length;
  return h('span', { class: `chip ${n ? 'chip-count' : ''}` }, `${n || 'No'} alternative${n === 1 ? '' : 's'}`);
}
