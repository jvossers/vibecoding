// Screen B: product detail with grouped specifications and related products.

import { h, append } from './dom.js';
import { icon, productThumb, statusChip, boolValue, skuTag, valueOrUnknown, callout, emptyState } from './components.js';
import {
  CATEGORY_LABELS, INTERFACE_LABELS, RELATIONSHIP_LABELS, TIP_FORMAT_LABELS, PACKAGING_LABELS, UNAVAILABLE,
  formatVolume, formatNumber, formatEnum, formatLength, formatList, isUnknown,
} from '../domain/attributes.js';

const REL_ORDER = ['supersedes', 'published_substitute', 'same_family', 'compatible_with', 'accessory_for', 'related'];

export async function renderProductDetail(root, ctx, { params }) {
  const product = await ctx.repo.getProduct(params.id);
  if (!product) {
    append(root, emptyState({ title: 'Product not found', body: 'This record does not exist in the synthetic catalogue.', action: h('a', { class: 'btn btn-primary', href: '#/' }, 'Back to catalogue') }));
    return;
  }
  ctx.remember(product);
  const [families, related] = await Promise.all([ctx.repo.familiesById(), ctx.repo.relationshipsFor(product.id)]);
  const s = product.specifications;
  const isTip = product.category === 'pipette_tip';
  const unavailable = UNAVAILABLE.has(product.status);
  const famName = (id) => families[id]?.name ?? id;

  append(root, h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' },
    h('a', { href: '#/' }, 'Catalogue'), h('span', { 'aria-hidden': 'true' }, '›'),
    h('a', { href: `#/?family=${encodeURIComponent(product.family)}` }, product.family), h('span', { 'aria-hidden': 'true' }, '›'),
    h('span', { 'aria-current': 'page' }, product.sku)));

  const findBtn = (cls = 'btn-lg') => h('a', { class: `btn btn-accent ${cls}`, href: `#/alternatives/${product.id}` }, icon('swap'), 'Find alternatives');

  if (isTip && unavailable) {
    append(root, h('div', { style: { marginBottom: '20px' } }, callout(product.status === 'out_of_stock' ? 'danger' : 'warning',
      product.status === 'out_of_stock' ? 'This item is out of stock' : 'This item is discontinued',
      'Run the rule-based finder to see potential alternatives, why each one qualifies, and what still needs checking.',
      findBtn('btn-sm'))));
  }

  // ---- Hero
  const facts = [];
  const fact = (label, value) => facts.push(h('div', { class: 'fact' }, h('dt', {}, label), h('dd', {}, value)));
  if (isTip) {
    fact('Volume', valueOrUnknown(formatVolume(s.volumeMinUl, s.volumeMaxUl)));
    fact('Sterile', boolValue(s.sterile));
    fact('Filtered', boolValue(s.filtered));
    fact('Low retention', boolValue(s.lowRetention));
    fact('Pack', isUnknown(s.unitsPerPack) ? valueOrUnknown('Not recorded') : `${formatNumber(s.unitsPerPack)} tips`);
  } else if (product.category === 'pipette') {
    fact('Volume', formatVolume(s.volumeMinUl, s.volumeMaxUl));
    fact('Channels', String(s.channelCount));
    fact('Adjustable', boolValue(s.adjustableVolume));
    fact('Tip interface', INTERFACE_LABELS[s.tipInterfaceType]);
  } else {
    fact('Type', s.accessoryType);
    fact('Fits', s.compatibleInstrumentFamilies.map(famName).join(', '));
  }

  const actions = isTip
    ? [findBtn(unavailable ? 'btn-lg' : ''), h('a', { class: 'btn btn-secondary', href: '#/' }, icon('arrow-left'), 'Back to catalogue')]
    : [h('a', { class: 'btn btn-primary', href: `#/?fits=${product.category === 'pipette' ? s.instrumentFamilyId : s.compatibleInstrumentFamilies[0]}&category=pipette_tip` }, icon('search'), 'Show compatible tips'),
      h('span', { class: 'small muted' }, 'Alternatives are generated for consumables only; equipment is never offered as a substitute.')];

  append(root, h('section', { class: 'product-hero', 'aria-labelledby': 'p-title' },
    h('div', { class: 'hero-art' }, productThumb(product, { size: 340, label: true }),
      h('span', { class: 'art-note' }, product.imagePath ? 'Generated illustration' : 'No illustration on file')),
    h('div', { class: 'hero-body' },
      h('div', { class: 'eyebrow' }, `${product.brand} · ${product.family} · ${CATEGORY_LABELS[product.category]}`),
      h('h1', { id: 'p-title' }, product.name),
      h('div', { class: 'hero-meta' }, skuTag(product.sku, { copy: true, toast: ctx.toast }), statusChip(product, { withQty: true }),
        h('span', { class: 'small muted' }, `Record updated ${new Date(product.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`)),
      h('p', { class: 'desc' }, product.description),
      h('dl', { class: 'facts' }, facts),
      h('div', { class: 'hero-actions' }, actions),
    )));

  // ---- Specification groups
  const group = (title, ic, rows, note = null) => h('section', { class: 'card' },
    h('div', { class: 'card-head' }, h('h2', {}, icon(ic), title)),
    h('dl', { class: 'specs' }, rows.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, typeof v === 'string' ? valueOrUnknown(v) : v)])),
    note ? h('p', { class: 'spec-note' }, note) : null);

  const famLinks = (ids) => (ids.length
    ? h('span', { class: 'fam-links' }, ids.map((id) => h('a', { class: 'chip chip-outline plain', href: `#/?fits=${id}` }, famName(id))))
    : valueOrUnknown('Not recorded'));

  let groups;
  if (isTip) {
    const ifaces = [...new Set(s.compatibleInstrumentFamilies.map((id) => families[id]?.tipInterfaceType).filter(Boolean))];
    groups = [
      group('Performance', 'pipette', [
        ['Volume range', formatVolume(s.volumeMinUl, s.volumeMaxUl)],
        ['Tip format', formatEnum(TIP_FORMAT_LABELS, s.tipFormat)],
        ['Low retention', boolValue(s.lowRetention)],
        ['Tip length', formatLength(s.tipLengthMm)],
        ['Body material', s.material ?? 'Not recorded'],
      ]),
      group('Compatibility', 'link', [
        ['Instrument families', famLinks(s.compatibleInstrumentFamilies)],
        ['Tip interface', ifaces.length ? ifaces.map((i) => INTERFACE_LABELS[i]).join(', ') : 'Not recorded'],
        ['Notes', s.compatibilityNotes ?? '—'],
      ], 'Compatibility is scoped to the fictional families listed; anything not listed is treated as unknown, not compatible.'),
      group('Hygiene & cleanliness', 'shield', [
        ['Sterile', boolValue(s.sterile)],
        ['Sterilisation method', s.sterilizationMethod ?? (s.sterile === false ? '—' : 'Not recorded')],
        ['Filtered', boolValue(s.filtered)],
        ['Filter material', s.filterMaterial ?? (s.filtered === false ? '—' : 'Not recorded')],
        ['Stated claims', formatList(s.cleanlinessClaims)],
        ['Autoclavable', boolValue(s.autoclavable)],
      ], 'Claims are synthetic statements for this demo. They are not certifications or test results.'),
      group('Packaging', 'box', [
        ['Packaging', formatEnum(PACKAGING_LABELS, s.packagingType)],
        ['Tips per pack', isUnknown(s.unitsPerPack) ? 'Not recorded' : formatNumber(s.unitsPerPack)],
        ['Racks per pack', isUnknown(s.racksPerPack) ? '—' : formatNumber(s.racksPerPack)],
        ['Colour', s.colour ?? 'Not recorded'],
      ]),
    ];
  } else if (product.category === 'pipette') {
    const tips = await ctx.repo.tipsForFamily(s.instrumentFamilyId);
    groups = [
      group('Performance', 'pipette', [
        ['Volume range', formatVolume(s.volumeMinUl, s.volumeMaxUl)],
        ['Channels', String(s.channelCount)],
        ['Adjustable volume', boolValue(s.adjustableVolume)],
        ['Accuracy notes', s.accuracyNotes ?? 'Not recorded'],
      ]),
      group('Compatibility', 'link', [
        ['Instrument family', famLinks([s.instrumentFamilyId])],
        ['Family type', families[s.instrumentFamilyId]?.kind ?? 'Not recorded'],
        ['Tip interface', INTERFACE_LABELS[s.tipInterfaceType]],
        ['Tips listed for family', h('a', { href: `#/?fits=${s.instrumentFamilyId}&category=pipette_tip` }, `${tips.length} tip SKUs`)],
      ], 'Instruments are listed for compatibility only and never appear as substitutes for consumables.'),
    ];
  } else {
    groups = [group('Details', 'box', [
      ['Accessory type', s.accessoryType],
      ['Material', s.material ?? 'Not recorded'],
      ['Fits', famLinks(s.compatibleInstrumentFamilies)],
    ])];
  }
  append(root, h('div', { class: 'spec-grid' }, groups));

  // ---- Related products (separate from alternatives) and documentation
  const byType = {};
  for (const r of related) (byType[r.relationship.type] ??= []).push(r);
  const relItems = REL_ORDER.filter((t) => byType[t]).flatMap((t) => [
    h('li', { class: 'rel-group-title', role: 'presentation' }, `${RELATIONSHIP_LABELS[t].out}${byType[t].length > 1 ? ` (${byType[t].length})` : ''}`),
    ...byType[t].map(({ relationship, direction, other }) => h('li', {},
      productThumb(other, { size: 44 }),
      h('div', {},
        h('div', { class: 'rel-type' }, icon(direction === 'outgoing' ? 'arrow' : 'arrow-left'), RELATIONSHIP_LABELS[relationship.type][direction === 'outgoing' ? 'out' : 'in']),
        h('a', { href: `#/product/${other.id}` }, other.name), ' ', skuTag(other.sku),
        h('div', { class: 'rel-note' }, relationship.evidenceNote)),
      statusChip(other))),
  ]);
  const relCard = h('section', { class: 'card', 'aria-labelledby': 'rel-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'rel-title' }, icon('link'), 'Related products'), h('span', { class: 'chip chip-muted plain' }, 'Not substitutes')),
    h('div', { class: 'card-pad', style: { paddingBottom: '0' } }, callout('info', 'Context, not recommendations',
      `Synthetic relationships between catalogue records. They are never presented as substitutes and are not manufacturer evidence.${isTip ? ' Use Find alternatives for rule-checked candidates.' : ''}`)),
    relItems.length ? h('ul', { class: 'rel-list' }, relItems) : h('p', { class: 'card-pad muted' }, 'No related products on file.'));

  const docCard = h('section', { class: 'card', 'aria-labelledby': 'doc-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'doc-title' }, icon('doc'), 'Documentation')),
    product.documentation.length
      ? h('ul', { class: 'doc-list' }, product.documentation.map((d) => h('li', {}, icon('doc'),
        h('div', { class: 'grow' }, d.path ? h('a', { href: d.path, target: '_blank', rel: 'noopener' }, d.title) : h('span', {}, d.title),
          h('div', { class: 'small muted' }, d.path ? 'Local placeholder page' : 'No file attached')))))
      : h('p', { class: 'card-pad muted' }, 'No documents on file for this legacy record.'),
    h('div', { class: 'card-head', style: { borderTop: '1px solid var(--border)', borderBottom: '0' } }, h('h3', {}, 'Record')),
    h('dl', { class: 'specs' },
      h('dt', {}, 'Internal id'), h('dd', {}, h('code', {}, product.id)),
      h('dt', {}, 'Tags'), h('dd', {}, product.tags.join(', ') || '—')));

  append(root, h('div', { class: 'two-col' }, relCard, docCard));
}
