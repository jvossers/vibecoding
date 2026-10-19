// Reusable UI pieces rendered with plain DOM functions.

import { h, trustedSvg, append } from './dom.js';
import { illustrationOptions, illustrationSvg } from './illustrations.js';
import { STATUS_LABELS, formatNumber, isUnknown } from '../domain/attributes.js';
import { CLASSIFICATION_LABELS } from '../domain/matching.js';

const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6v.4M12 16.6v.1"/>',
  ban: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  swap: '<path d="M4 7h13l-3-3M20 17H7l3 3"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  doc: '<path d="M6.5 3.5h7l4 4v13h-11z"/><path d="M13.5 3.5v4h4M9 12.5h6M9 16h6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  layers: '<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5"/>',
  box: '<path d="M3.5 7.5 12 3.5l8.5 4v9l-8.5 4-8.5-4z"/><path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  note: '<path d="M4.5 4.5h15v11l-4 4h-11z"/><path d="M15.5 19.5v-4h4M8 9h8M8 12.5h5"/>',
  compare: '<rect x="3.5" y="4.5" width="7" height="15" rx="1.5"/><rect x="13.5" y="4.5" width="7" height="15" rx="1.5"/>',
  shield: '<path d="M12 3.5 4.5 6.5v5c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9v-5z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  filter: '<path d="M4 5h16l-6.2 7.2V19l-3.6-1.8v-5z"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  sort: '<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>',
  tube: '<path d="M9 3.5h6M10 3.5v13a2 2 0 0 0 4 0v-13"/><path d="M10 11h4"/>',
  pipette: '<path d="m14 4 6 6M16.5 6.5 8 15l-3 4 1 1 4-3 8.5-8.5"/>',
  inbox: '<path d="M3.5 13.5 6 5.5h12l2.5 8v5h-17z"/><path d="M3.5 13.5h5l1 2h5l1-2h5"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4.5 19.5h4l10-10-4-4-10 10z"/><path d="m13 7 4 4"/>',
};

export function icon(name, cls = '') {
  return trustedSvg(`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] ?? ''}</svg>`);
}

export function productThumb(product, { size = 40, label = false } = {}) {
  if (!product.imagePath) {
    return h('span', { class: 'thumb placeholder', style: { width: `${size}px`, height: `${size}px` }, title: 'No illustration on file' }, icon('question'));
  }
  const svg = trustedSvg(illustrationSvg(illustrationOptions(product), { title: label ? `Illustration of ${product.name}` : '' }));
  if (!label) { svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role'); }
  return h('span', { class: 'thumb', style: { width: `${size}px`, height: `${size}px` } }, svg);
}

const STATUS_CLASS = { in_stock: 'chip-success', low_stock: 'chip-warning', out_of_stock: 'chip-danger', discontinued: 'chip-muted' };

export function statusChip(product, { withQty = false } = {}) {
  let text = STATUS_LABELS[product.status];
  if (withQty) {
    if (isUnknown(product.stockQuantity)) text += ' · qty not recorded';
    else if (product.status !== 'discontinued') text += ` · ${formatNumber(product.stockQuantity)} packs`;
  }
  return h('span', { class: `chip ${STATUS_CLASS[product.status]}` }, text);
}

const CLASS_CHIP = { candidate: 'chip-success', conditional: 'chip-warning', insufficient_data: 'chip-unknown', not_compatible: 'chip-danger' };
export function classificationChip(classification, { large = false } = {}) {
  return h('span', { class: `chip ${CLASS_CHIP[classification]}${large ? ' chip-lg' : ''}` }, CLASSIFICATION_LABELS[classification]);
}

export const REVIEW_LABELS = { pending: 'Pending review', approved_for_demo: 'Approved for demo', rejected: 'Rejected' };
const REVIEW_CHIP = { pending: 'chip-outline', approved_for_demo: 'chip-blue', rejected: 'chip-muted' };
export function reviewChip(status) {
  return h('span', { class: `chip ${REVIEW_CHIP[status]}`, title: 'Prototype-only review status' }, REVIEW_LABELS[status]);
}

export function boolValue(v, { yes = 'Yes', no = 'No' } = {}) {
  if (isUnknown(v)) return h('span', { class: 'bool unknown', title: 'Not recorded — unknown is not the same as no' }, icon('question'), 'Not recorded');
  return v ? h('span', { class: 'bool yes' }, icon('check'), yes) : h('span', { class: 'bool no' }, icon('x'), no);
}

export function valueOrUnknown(text) {
  return text === 'Not recorded' ? h('span', { class: 'unknown-text' }, 'Not recorded') : text;
}

export function skuTag(sku, { copy = false, toast } = {}) {
  const el = h('span', { class: 'sku' }, sku);
  if (copy) {
    el.append(h('button', {
      type: 'button',
      'aria-label': `Copy SKU ${sku}`,
      title: 'Copy SKU',
      on: {
        click: async (e) => {
          e.preventDefault();
          try { await navigator.clipboard.writeText(sku); toast?.(`Copied ${sku}`); } catch { toast?.('Copy not available in this browser'); }
        },
      },
    }, icon('copy')));
  }
  return el;
}

export function scoreRing(score, classification) {
  const r = 30, c = 2 * Math.PI * r;
  const has = typeof score === 'number';
  const colour = { candidate: '#217A58', conditional: '#A86416' }[classification] ?? '#9AB0C4';
  const dash = has ? (score / 100) * c : 0;
  const svg = trustedSvg(`<svg viewBox="0 0 72 72" aria-hidden="true">
    <circle cx="36" cy="36" r="${r}" fill="none" stroke="#E6EDF3" stroke-width="6"/>
    ${has ? `<circle cx="36" cy="36" r="${r}" fill="none" stroke="${colour}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 36 36)"/>` : `<circle cx="36" cy="36" r="${r}" fill="none" stroke="#C9D5E0" stroke-width="6" stroke-dasharray="3 5"/>`}
    <text x="36" y="42" text-anchor="middle" class="score-num">${has ? Math.round(score) : '—'}</text>
  </svg>`);
  return h('div', { class: 'score', role: 'img', 'aria-label': has ? `Similarity score ${score} out of 100` : 'Score withheld' },
    svg,
    h('span', { class: 'score-cap' }, has ? 'similarity' : classification === 'not_compatible' ? 'withheld: blocked' : 'withheld: data gap'));
}

export function emptyState({ title, body, action = null }) {
  const art = trustedSvg(`<svg class="empty-art" viewBox="0 0 120 96" aria-hidden="true">
    <rect x="8" y="14" width="104" height="72" rx="12" fill="#E8F2F9"/>
    <path d="M44 28h16l-6.5 40h-3z" fill="#fff" stroke="#002C58" stroke-width="2" stroke-linejoin="round"/>
    <path d="M62 28h16l-6.5 40h-3z" fill="none" stroke="#9AB0C4" stroke-width="2" stroke-dasharray="4 3" stroke-linejoin="round"/>
    <circle cx="88" cy="68" r="10" fill="#fff" stroke="#277CB5" stroke-width="2"/><path d="m95 75 7 7" stroke="#277CB5" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`);
  return h('div', { class: 'empty' }, art, h('h3', {}, title), body ? h('p', {}, body) : null, action);
}

export function skeletonRows(rows = 8, cols = 7) {
  return h('tbody', {}, Array.from({ length: rows }, () => h('tr', {},
    Array.from({ length: cols }, (_, i) => h('td', {}, h('div', { class: 'skeleton', style: { width: `${i === 1 ? 70 : 40 + ((i * 17) % 40)}%` } }))))));
}

export function callout(kind, title, body, action = null) {
  const ic = { danger: 'alert', warning: 'alert', info: 'info' }[kind] ?? 'info';
  return h('div', { class: `callout callout-${kind}`, role: kind === 'danger' ? 'alert' : null },
    icon(ic), h('div', { class: 'grow' }, h('strong', {}, title), body ? h('p', {}, body) : null), action);
}

// Dialog helpers built on the native <dialog> element.
export function openDialog({ title, body, footer = [], size = '' }) {
  const dlg = h('dialog', { class: size, 'aria-labelledby': 'dlg-title' });
  const close = () => dlg.close();
  append(dlg, 
    h('div', { class: 'dlg-head' }, h('h2', { id: 'dlg-title' }, title),
      h('button', { type: 'button', class: 'btn btn-ghost icon-btn', 'aria-label': 'Close dialog', on: { click: close } }, icon('x'))),
    h('div', { class: 'dlg-body' }, body),
    footer.length ? h('div', { class: 'dlg-foot' }, footer) : null,
  );
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  document.body.append(dlg);
  dlg.showModal();
  return dlg;
}

export function confirmDialog({ title, body, confirmLabel = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    let ok = false;
    const confirmBtn = h('button', { type: 'button', class: `btn ${danger ? 'btn-primary' : 'btn-primary'}`, on: { click: () => { ok = true; dlg.close(); } } }, confirmLabel);
    const dlg = openDialog({
      title, size: 'small', body: h('p', {}, body),
      footer: [h('button', { type: 'button', class: 'btn btn-secondary', on: { click: () => dlg.close() } }, 'Cancel'), confirmBtn],
    });
    dlg.addEventListener('close', () => resolve(ok));
    confirmBtn.focus();
  });
}

export function toast(message) {
  const host = document.getElementById('toasts');
  const el = h('div', { class: 'toast' }, icon('check'), h('span', {}, message));
  host.append(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 250); }, 3200);
}
