// Labels and formatting shared by the UI and the tests.
// Unknown (null) values are always rendered as "Not recorded", never as "No".

export const BRAND = 'Quellmark';

export const CATEGORY_LABELS = {
  pipette_tip: 'Pipette tip',
  pipette: 'Pipette',
  accessory: 'Accessory',
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
