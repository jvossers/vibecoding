// Labels and formatting shared by the matching rules, the UI and the tests.
// Unknown (null) values are always rendered as "Not recorded", never as "No".

export const BRAND = 'Quellmark';

export const CATEGORY_LABELS = {
  pipette_tip: 'Pipette tip',
  pipette: 'Pipette',
  accessory: 'Accessory',
};

export const STATUS_LABELS = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  discontinued: 'Discontinued',
};

export const TIP_FORMAT_LABELS = {
  standard: 'Standard',
  extended: 'Extended length',
  wide_bore: 'Wide bore',
  other: 'Other',
};

export const PACKAGING_LABELS = {
  rack: 'Rack',
  refill: 'Refill',
  bulk: 'Bulk bag',
  box: 'Box',
  other: 'Other',
};

export const INTERFACE_LABELS = {
  universal_cone: 'Q-Cone universal',
  lock_cone: 'Q-Lock secure cone',
  macro_cone: 'Macro cone',
  capillary_piston: 'Capillary-piston',
};

export const RELATIONSHIP_LABELS = {
  compatible_with: { out: 'Compatible with', in: 'Compatible tip' },
  accessory_for: { out: 'Accessory for', in: 'Accessory' },
  same_family: { out: 'Same family', in: 'Same family' },
  related: { out: 'Related', in: 'Related' },
  supersedes: { out: 'Supersedes', in: 'Superseded by' },
  published_substitute: { out: 'Substitute note (synthetic)', in: 'Noted as substitute for (synthetic)' },
};

export const UNAVAILABLE = new Set(['out_of_stock', 'discontinued']);

export const isUnknown = (v) => v === null || v === undefined;

export function formatNumber(n) {
  if (isUnknown(n)) return 'Not recorded';
  return Number(n).toLocaleString('en-GB', { maximumFractionDigits: 2 });
}

export function formatVolume(min, max) {
  if (isUnknown(min) && isUnknown(max)) return 'Not recorded';
  if (isUnknown(min)) return `? – ${formatNumber(max)} µL`;
  if (isUnknown(max)) return `${formatNumber(min)} – ? µL`;
  if (min === max) return `${formatNumber(min)} µL`;
  return `${formatNumber(min)} – ${formatNumber(max)} µL`;
}

export function formatBool(v) {
  if (isUnknown(v)) return 'Not recorded';
  return v ? 'Yes' : 'No';
}

export function formatList(list) {
  if (isUnknown(list)) return 'Not recorded';
  if (list.length === 0) return 'None stated';
  return list.join(', ');
}

export function formatEnum(map, v) {
  if (isUnknown(v)) return 'Not recorded';
  return map[v] ?? v;
}

export function formatLength(mm) {
  return isUnknown(mm) ? 'Not recorded' : `${formatNumber(mm)} mm`;
}

export function familyNames(ids, families) {
  if (isUnknown(ids)) return 'Not recorded';
  if (ids.length === 0) return 'Not recorded';
  return ids.map((id) => families[id]?.name ?? id).join(', ');
}

// The attribute rows used by candidate cards and the comparison table.
// `field` keys match the `field` of differences produced by matching.js.
export function tipAttributeRows(families) {
  return [
    { field: 'volume', label: 'Volume range', group: 'Performance', value: (s) => formatVolume(s.volumeMinUl, s.volumeMaxUl) },
    { field: 'tipFormat', label: 'Tip format', group: 'Performance', value: (s) => formatEnum(TIP_FORMAT_LABELS, s.tipFormat) },
    { field: 'lowRetention', label: 'Low retention', group: 'Performance', value: (s) => formatBool(s.lowRetention) },
    { field: 'tipLengthMm', label: 'Tip length', group: 'Performance', value: (s) => formatLength(s.tipLengthMm) },
    { field: 'material', label: 'Body material', group: 'Performance', value: (s) => s.material ?? 'Not recorded' },
    { field: 'compatibleInstrumentFamilies', label: 'Instrument families', group: 'Compatibility', value: (s) => familyNames(s.compatibleInstrumentFamilies, families) },
    { field: 'compatibilityNotes', label: 'Compatibility notes', group: 'Compatibility', value: (s) => s.compatibilityNotes ?? '—' },
    { field: 'sterile', label: 'Sterile', group: 'Hygiene', value: (s) => formatBool(s.sterile) },
    { field: 'sterilizationMethod', label: 'Sterilisation method', group: 'Hygiene', value: (s) => s.sterilizationMethod ?? (s.sterile === false ? '—' : 'Not recorded') },
    { field: 'filtered', label: 'Filtered', group: 'Hygiene', value: (s) => formatBool(s.filtered) },
    { field: 'filterMaterial', label: 'Filter material', group: 'Hygiene', value: (s) => s.filterMaterial ?? (s.filtered === false ? '—' : 'Not recorded') },
    { field: 'cleanlinessClaims', label: 'Stated claims', group: 'Hygiene', value: (s) => formatList(s.cleanlinessClaims) },
    { field: 'autoclavable', label: 'Autoclavable', group: 'Hygiene', value: (s) => formatBool(s.autoclavable) },
    { field: 'packagingType', label: 'Packaging', group: 'Packaging', value: (s) => formatEnum(PACKAGING_LABELS, s.packagingType) },
    { field: 'unitsPerPack', label: 'Tips per pack', group: 'Packaging', value: (s) => formatNumber(s.unitsPerPack) },
    { field: 'racksPerPack', label: 'Racks per pack', group: 'Packaging', value: (s) => (isUnknown(s.racksPerPack) ? '—' : formatNumber(s.racksPerPack)) },
    { field: 'colour', label: 'Colour', group: 'Packaging', value: (s) => s.colour ?? 'Not recorded' },
  ];
}
