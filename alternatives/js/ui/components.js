// Reusable UI pieces rendered with plain DOM functions.

import { h, trustedSvg } from './dom.js';
import { isUnknown } from '../domain/attributes.js';

const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.6v.4M12 16.6v.1"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8.5 8"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 19.5h14"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
};

export function icon(name) {
  return trustedSvg(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] ?? ''}</svg>`);
}

// Placeholder where a product photo will go. Labelled in words so nobody mistakes it for
// a real image or an icon; the wording shortens as the box gets smaller.
export function productThumb(product, { size = 40, label = false } = {}) {
  const tier = size >= 120 ? 'lg' : size >= 56 ? 'md' : 'sm';
  const text = { lg: ['Product photo', 'placeholder'], md: ['Product', 'photo'], sm: ['Photo'] }[tier];
  return h('span', {
    class: `thumb photo-ph photo-ph-${tier}`,
    style: { width: `${size}px`, height: `${size}px` },
    role: label ? 'img' : null,
    'aria-label': label ? `Product photo placeholder for ${product.name}` : null,
    'aria-hidden': label ? null : 'true',
  }, tier === 'sm' ? null : icon('image'), h('span', { class: 'photo-ph-text' }, text.map((t) => h('span', {}, t))));
}

export function boolValue(v) {
  if (isUnknown(v)) return h('span', { class: 'bool unknown' }, 'Not recorded');
  return v ? h('span', { class: 'bool yes' }, icon('check'), 'Yes') : h('span', { class: 'bool no' }, icon('x'), 'No');
}

export function valueOrUnknown(text) {
  return text === 'Not recorded' ? h('span', { class: 'unknown-text' }, 'Not recorded') : text;
}

export function skuTag(sku, { copy = false } = {}) {
  const el = h('span', { class: 'sku' }, sku);
  if (copy) {
    el.append(h('button', {
      type: 'button',
      'aria-label': `Copy SKU ${sku}`,
      title: 'Copy SKU',
      on: {
        click: async () => {
          try { await navigator.clipboard.writeText(sku); toast(`Copied ${sku}`); } catch { toast('Copy is not available in this browser'); }
        },
      },
    }, icon('copy')));
  }
  return el;
}

export function emptyState({ title, body, action = null }) {
  const art = trustedSvg(`<svg class="empty-art" viewBox="0 0 120 96" aria-hidden="true">
    <rect x="8" y="14" width="104" height="72" rx="12" fill="#E8F2F9"/>
    <path d="M44 28h16l-6.5 40h-3z" fill="#fff" stroke="#002C58" stroke-width="2" stroke-linejoin="round"/>
    <path d="M62 28h16l-6.5 40h-3z" fill="none" stroke="#9AB0C4" stroke-width="2" stroke-dasharray="4 3" stroke-linejoin="round"/>
  </svg>`);
  return h('div', { class: 'empty' }, art, h('h3', {}, title), body ? h('p', {}, body) : null, action);
}

export function toast(message) {
  const host = document.getElementById('toasts');
  const el = h('div', { class: 'toast' }, icon('check'), h('span', {}, message));
  host.append(el);
  setTimeout(() => el.remove(), 2800);
}
