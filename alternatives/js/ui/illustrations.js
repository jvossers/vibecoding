// Generated geometric product silhouettes (no photography, no third-party artwork).
// Returns SVG markup built only from numbers and allow-listed colours, never from
// product text, so it is safe to insert as markup. The generator script also uses it
// to write the generic files under assets/illustrations/.

const NAVY = '#002C58';
const BLUE = '#277CB5';
const TINTS = {
  natural: '#F3F6F9',
  clear: '#FFFFFF',
  yellow: '#F5E6AE',
  blue: '#CFE3F3',
  green: '#D3EADB',
  grey: '#DDE4EA',
};

export function tintFor(colour) {
  const c = String(colour ?? '').toLowerCase();
  if (c.includes('yellow')) return TINTS.yellow;
  if (c.includes('blue')) return TINTS.blue;
  if (c.includes('green')) return TINTS.green;
  if (c.includes('clear')) return TINTS.clear;
  if (c.includes('grey') || c.includes('gray')) return TINTS.grey;
  return TINTS.natural;
}

export function illustrationKind(product) {
  const s = product.specifications ?? {};
  if (product.category === 'pipette_tip') {
    if (product.subcategory === 'Capillary pistons') return 'capillary';
    if (s.tipFormat === 'wide_bore') return 'tip-widebore';
    if (s.tipFormat === 'extended') return 'tip-extended';
    if (s.filtered) return 'tip-filtered';
    return 'tip-standard';
  }
  if (product.category === 'pipette') {
    if (s.channelCount > 1) return 'pipette-multi';
    if (/electronic/i.test(product.subcategory)) return 'pipette-electronic';
    if ((s.volumeMaxUl ?? 0) > 1200) return 'pipette-macro';
    return 'pipette-single';
  }
  const t = s.accessoryType ?? '';
  if (/stand|carousel|charging/i.test(t)) return 'accessory-stand';
  if (/rack|station/i.test(t)) return 'accessory-rack';
  return 'accessory-kit';
}

export function illustrationOptions(product) {
  const s = product.specifications ?? {};
  return {
    kind: illustrationKind(product),
    tint: tintFor(s.colour),
    filtered: s.filtered === true,
    lowRetention: s.lowRetention === true,
    length: Number(s.tipLengthMm) || 51,
    channels: Number(s.channelCount) || 1,
  };
}

const n = (v) => Math.round(Number(v) * 10) / 10;

function backdrop() {
  let grid = '';
  for (let i = 20; i < 160; i += 20) {
    grid += `<line x1="${i}" y1="6" x2="${i}" y2="154" /><line x1="6" y1="${i}" x2="154" y2="${i}" />`;
  }
  return `<rect x="0" y="0" width="160" height="160" rx="18" fill="#E8F2F9"/>`
    + `<g stroke="#D3E3EF" stroke-width="1">${grid}</g>`
    + `<circle cx="80" cy="76" r="54" fill="#FFFFFF" opacity="0.55"/>`;
}

function tip({ tint, filtered, lowRetention, length, kind }) {
  const extended = kind === 'tip-extended';
  const wide = kind === 'tip-widebore';
  const top = 34;
  const body = Math.max(56, Math.min(104, 34 + length * 0.7));
  const end = top + body;
  const topW = extended ? 20 : 26;
  const endW = wide ? 10 : 3;
  let out = `<ellipse cx="80" cy="${n(end + 6)}" rx="22" ry="3.5" fill="${NAVY}" opacity="0.10"/>`;
  out += `<path d="M${80 - topW / 2} ${top} L${80 + topW / 2} ${top} L${n(80 + endW / 2)} ${n(end)} L${n(80 - endW / 2)} ${n(end)} Z" fill="${tint}" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>`;
  out += `<rect x="${80 - topW / 2 - 4}" y="16" width="${topW + 8}" height="${top - 16}" rx="3" fill="${tint}" stroke="${NAVY}" stroke-width="2"/>`;
  for (let i = 0; i < 3; i += 1) {
    const x = 80 - topW / 2 + 2 + i * ((topW - 4) / 2);
    out += `<line x1="${n(x)}" y1="20" x2="${n(x)}" y2="${top - 4}" stroke="${NAVY}" stroke-width="1.2" opacity="0.45"/>`;
  }
  if (filtered) {
    const fy = top + 6, fh = 12;
    const w0 = topW - (topW - endW) * ((fy - top) / body);
    const w1 = topW - (topW - endW) * ((fy + fh - top) / body);
    out += `<path d="M${n(80 - w0 / 2 + 1)} ${fy} L${n(80 + w0 / 2 - 1)} ${fy} L${n(80 + w1 / 2 - 1)} ${fy + fh} L${n(80 - w1 / 2 + 1)} ${fy + fh} Z" fill="#FFFFFF" stroke="${BLUE}" stroke-width="1.5"/>`;
    for (let i = 0; i < 4; i += 1) {
      out += `<circle cx="${n(80 - 6 + i * 4)}" cy="${fy + 4 + (i % 2) * 4}" r="1.1" fill="${BLUE}"/>`;
    }
  }
  if (lowRetention) {
    out += `<path d="M${80 - topW / 2 + 5} ${top + 4} L${n(80 - endW / 2 + 0.5)} ${n(end - 10)}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.9"/>`;
  }
  return out;
}

function capillary() {
  return `<ellipse cx="80" cy="146" rx="18" ry="3" fill="${NAVY}" opacity="0.10"/>`
    + `<rect x="74" y="34" width="12" height="104" rx="3" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2"/>`
    + `<rect x="78" y="22" width="4" height="96" rx="1.5" fill="${BLUE}"/>`
    + `<rect x="70" y="14" width="20" height="12" rx="3" fill="#F3F6F9" stroke="${NAVY}" stroke-width="2"/>`
    + `<rect x="76.5" y="114" width="7" height="6" rx="1" fill="${NAVY}"/>`;
}

function pipette({ kind, channels }) {
  const macro = kind === 'pipette-macro';
  const multi = kind === 'pipette-multi';
  const electronic = kind === 'pipette-electronic';
  const bodyW = macro ? 34 : 28;
  const x0 = 80 - bodyW / 2;
  let out = `<ellipse cx="80" cy="150" rx="${multi ? 40 : 20}" ry="3" fill="${NAVY}" opacity="0.10"/>`;
  out += `<rect x="73" y="8" width="14" height="10" rx="4" fill="${BLUE}" stroke="${NAVY}" stroke-width="2"/>`;
  out += `<rect x="77" y="16" width="6" height="8" fill="${NAVY}"/>`;
  out += `<rect x="${x0}" y="22" width="${bodyW}" height="${multi ? 70 : 82}" rx="12" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2"/>`;
  out += `<path d="M${x0 + bodyW} 36 q14 4 12 18 q-2 6 -12 4" fill="#F3F6F9" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>`;
  if (electronic) {
    out += `<rect x="${x0 + 5}" y="32" width="${bodyW - 10}" height="18" rx="3" fill="${NAVY}"/>`;
    out += `<rect x="${x0 + 8}" y="36" width="${bodyW - 16}" height="4" rx="1" fill="#7FB6DC"/>`;
    out += `<circle cx="74" cy="60" r="3" fill="${BLUE}"/><circle cx="86" cy="60" r="3" fill="${BLUE}"/>`;
  } else {
    out += `<rect x="${x0 + 6}" y="34" width="${bodyW - 12}" height="10" rx="2" fill="#E8F2F9" stroke="${BLUE}" stroke-width="1.2"/>`;
    for (let i = 0; i < 3; i += 1) out += `<line x1="${x0 + 9 + i * ((bodyW - 18) / 2)}" y1="36" x2="${x0 + 9 + i * ((bodyW - 18) / 2)}" y2="42" stroke="${NAVY}" stroke-width="1.2"/>`;
  }
  if (multi) {
    const count = Math.min(8, channels);
    out += `<rect x="38" y="92" width="84" height="16" rx="4" fill="#F3F6F9" stroke="${NAVY}" stroke-width="2"/>`;
    for (let i = 0; i < count; i += 1) {
      const cx = 44 + i * (72 / (count - 1));
      out += `<path d="M${n(cx - 3)} 108 L${n(cx + 3)} 108 L${n(cx + 1)} 134 L${n(cx - 1)} 134 Z" fill="#FFFFFF" stroke="${NAVY}" stroke-width="1.6" stroke-linejoin="round"/>`;
    }
    return out;
  }
  const cone = macro ? 12 : 8;
  out += `<rect x="${80 - cone / 2 - 3}" y="104" width="${cone + 6}" height="10" rx="2" fill="#F3F6F9" stroke="${NAVY}" stroke-width="2"/>`;
  out += `<path d="M${80 - cone / 2} 114 L${80 + cone / 2} 114 L${80 + 1.5} 144 L${80 - 1.5} 144 Z" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>`;
  return out;
}

function accessory({ kind }) {
  if (kind === 'accessory-stand') {
    return `<ellipse cx="80" cy="136" rx="46" ry="10" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2"/>`
      + `<rect x="76" y="34" width="8" height="102" rx="3" fill="${BLUE}" stroke="${NAVY}" stroke-width="2"/>`
      + `<path d="M84 52 h28 v8 h-28 z M48 72 h28 v8 h-28 z M84 92 h28 v8 h-28 z" fill="#F3F6F9" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  if (kind === 'accessory-rack') {
    let holes = '';
    for (let r = 0; r < 4; r += 1) for (let c = 0; c < 6; c += 1) holes += `<circle cx="${50 + c * 12 + r * 4}" cy="${62 + r * 8}" r="3" fill="${NAVY}" opacity="0.75"/>`;
    return `<ellipse cx="82" cy="134" rx="50" ry="5" fill="${NAVY}" opacity="0.10"/>`
      + `<path d="M40 56 L116 56 L130 90 L54 90 Z" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M54 90 L130 90 L130 128 L54 128 Z" fill="#E8F2F9" stroke="${NAVY}" stroke-width="2"/>`
      + `<path d="M40 56 L54 90 L54 128 L40 96 Z" fill="#CFE3F3" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>`
      + holes;
  }
  return `<ellipse cx="80" cy="134" rx="48" ry="5" fill="${NAVY}" opacity="0.10"/>`
    + `<rect x="34" y="62" width="92" height="66" rx="6" fill="#FFFFFF" stroke="${NAVY}" stroke-width="2"/>`
    + `<rect x="30" y="50" width="100" height="18" rx="5" fill="${BLUE}" stroke="${NAVY}" stroke-width="2"/>`
    + `<rect x="68" y="80" width="24" height="30" rx="3" fill="#E8F2F9" stroke="${NAVY}" stroke-width="1.6"/>`
    + `<circle cx="80" cy="95" r="6" fill="none" stroke="${NAVY}" stroke-width="1.6"/>`;
}

export function illustrationSvg(options, { title = '' } = {}) {
  const o = { tint: TINTS.natural, filtered: false, lowRetention: false, length: 51, channels: 1, ...options };
  let art;
  if (o.kind.startsWith('tip')) art = tip(o);
  else if (o.kind === 'capillary') art = capillary(o);
  else if (o.kind.startsWith('pipette')) art = pipette(o);
  else art = accessory(o);
  const safeTitle = String(title).replace(/[^\w µ.,()-]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${safeTitle}">${backdrop()}${art}</svg>`;
}

export const ILLUSTRATION_KINDS = [
  'tip-standard', 'tip-filtered', 'tip-extended', 'tip-widebore', 'capillary',
  'pipette-single', 'pipette-multi', 'pipette-electronic', 'pipette-macro',
  'accessory-stand', 'accessory-rack', 'accessory-kit',
];
