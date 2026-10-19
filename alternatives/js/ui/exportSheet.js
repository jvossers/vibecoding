// One-page PDF summary of a product and its alternatives, for emailing to a customer.
// It is built as a print-only sheet and handed to the browser's own print dialog, where the
// user picks "Save as PDF". No PDF library is involved.

import { h, append } from './dom.js';
import { icon, productThumb, toast } from './components.js';
import {
  PACKAGING_LABELS, TIP_FORMAT_LABELS, formatVolume, formatBool, formatEnum, formatNumber, formatPrice, familyNames, isUnknown,
} from '../domain/attributes.js';

const PREPARED_BY_KEY = 'parity.preparedBy';

const packaging = (s) => (isUnknown(s.packagingType) ? 'Not recorded' : `${formatEnum(PACKAGING_LABELS, s.packagingType)} · ${formatNumber(s.unitsPerPack)}`);

// Columns of the alternatives table on the sheet; values that differ from the requested product are highlighted.
const COLUMNS = [
  ['Volume', (p) => formatVolume(p.specifications.volumeMinUl, p.specifications.volumeMaxUl), 'vol'],
  ['Sterile', (p) => formatBool(p.specifications.sterile)],
  ['Filtered', (p) => formatBool(p.specifications.filtered)],
  ['Packaging', (p) => packaging(p.specifications)],
  ['Price', (p) => formatPrice(p.price), 'num'],
];

export function buildSheet({ product, alternatives, families, rules, preparedFor = '', preparedBy = '', note = '', date = new Date() }) {
  const s = product.specifications;
  const dateText = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const meta = [['Date', dateText], ['Prepared for', preparedFor], ['Prepared by', preparedBy]].filter(([, v]) => v);

  const spec = (label, value) => h('div', {}, h('dt', {}, label), h('dd', {}, value));

  return h('article', { class: 'print-sheet' },
    h('header', { class: 'ps-head' },
      h('div', { class: 'ps-brand' },
        markSvg(),
        h('div', {}, h('div', { class: 'ps-brand-name' }, product.brand), h('div', { class: 'ps-brand-sub' }, 'Product alternatives'))),
      h('div', { class: 'ps-meta' }, meta.map(([k, v]) => h('div', {}, `${k}: `, h('b', {}, v))))),

    h('h1', {}, `Alternatives for ${product.sku}`),
    h('p', { class: 'ps-lede' }, 'The product you asked for is shown below, followed by products that match it on every listed requirement.'),

    h('div', { class: 'ps-label ps-label-requested' }, 'Requested product'),
    h('section', { class: 'ps-requested' },
      productThumb(product, { size: 84 }),
      h('div', {},
        h('div', { class: 'ps-pname' }, product.name),
        h('div', { class: 'ps-sub' }, h('span', { class: 'ps-sku' }, product.sku), ` ${product.family} · ${product.subcategory}`),
        h('dl', { class: 'ps-specs' },
          spec('Volume', formatVolume(s.volumeMinUl, s.volumeMaxUl)),
          spec('Sterile', formatBool(s.sterile)),
          spec('Filtered', formatBool(s.filtered)),
          spec('Low retention', formatBool(s.lowRetention)),
          spec('Tip format', formatEnum(TIP_FORMAT_LABELS, s.tipFormat)),
          spec('Pipette fit', familyNames(s.compatibleInstrumentFamilies, families)),
          spec('Packaging', packaging(s)))),
      h('div', { class: 'ps-price' }, formatPrice(product.price), h('small', {}, 'per pack'))),

    h('div', { class: 'ps-matched' }, 'Matched on:', rules.map((r) => h('span', { class: 'ps-chip' }, `✓ ${r.label}`))),

    h('div', { class: 'ps-label ps-label-alts' }, 'Alternatives', h('span', { class: 'ps-n' }, String(alternatives.length))),
    alternatives.length
      ? h('table', { class: 'ps-table' },
        h('thead', {}, h('tr', {}, h('th', {}), h('th', {}, 'Product'), COLUMNS.map(([label, , cls]) => h('th', { class: cls === 'num' ? 'num' : null }, label)))),
        h('tbody', {}, alternatives.map((alt, i) => h('tr', {},
          h('td', { class: 'ps-idx' }, String(i + 1)),
          h('td', {}, h('span', { class: 'ps-pn' }, alt.name), h('span', { class: 'ps-sku' }, alt.sku)),
          COLUMNS.map(([, get, cls]) => {
            const v = get(alt);
            const classes = [cls, v !== get(product) ? 'diff' : null].filter(Boolean).join(' ');
            return h('td', { class: classes || null }, v);
          })))))
      : h('p', { class: 'ps-none' }, 'No other product matches this one on all of the requirements above.'),

    note ? h('section', { class: 'ps-note' }, h('b', {}, 'Note'), note) : null,

    h('footer', { class: 'ps-foot' },
      h('span', {}, h('span', { class: 'ps-legend' }), 'Highlighted values differ from the requested product. Prices in GBP per pack, excluding VAT. Please confirm availability and pricing before ordering.'),
      h('span', { class: 'ps-demo' }, 'Demo — synthetic catalogue')));
}

function markSvg() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of [
    ['rect', { width: 40, height: 40, rx: 10, fill: '#002C58' }],
    ['path', { d: 'M8.5 10h12.5l-5.4 21.5h-1.7z', fill: '#FFFFFF' }],
    ['path', { d: 'M19 10h12.5l-5.4 21.5h-1.7z', fill: 'none', stroke: '#7FB6DC', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }],
  ]) {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    svg.append(el);
  }
  return svg;
}

// Renders the sheet into a print-only container, opens the print dialog and cleans up afterwards.
export function printSheet(sheet, fileName) {
  document.getElementById('print-root')?.remove();
  const holder = h('div', { id: 'print-root' }, sheet);
  document.body.append(holder);
  document.body.classList.add('printing-sheet');
  const previousTitle = document.title;
  document.title = fileName; // browsers use the title as the suggested PDF file name
  const done = () => {
    document.body.classList.remove('printing-sheet');
    holder.remove();
    document.title = previousTitle;
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
}

export function openExportDialog({ product, alternatives, families, rules }) {
  let savedBy = '';
  try { savedBy = localStorage.getItem(PREPARED_BY_KEY) ?? ''; } catch { /* storage blocked */ }

  const field = (id, label, input) => h('div', { class: 'field' }, h('label', { for: id }, label), input);
  const forInput = h('input', { id: 'x-for', type: 'text', autocomplete: 'organization', placeholder: 'Customer or lab name', maxlength: '80' });
  const byInput = h('input', { id: 'x-by', type: 'text', autocomplete: 'name', placeholder: 'Your name', maxlength: '80', value: savedBy });
  const noteInput = h('textarea', { id: 'x-note', rows: '4', maxlength: '500', placeholder: 'e.g. The rack of 96 is currently unavailable; the refill packs fit the racks you already have.' });

  const form = h('form', { class: 'export-form', method: 'dialog' },
    h('p', { class: 'muted small' }, 'Creates a one-page summary of this product and its alternatives. All fields are optional. In the print dialog, choose “Save as PDF”.'),
    field('x-for', 'Prepared for', forInput),
    field('x-by', 'Prepared by', byInput),
    field('x-note', 'Note to the customer', noteInput),
    h('div', { class: 'dlg-actions' },
      h('button', { type: 'button', class: 'btn', on: { click: () => dlg.close() } }, 'Cancel'),
      h('button', { type: 'submit', class: 'btn btn-primary' }, icon('download'), 'Export PDF')));

  const dlg = h('dialog', { class: 'export-dialog', 'aria-labelledby': 'x-title' },
    h('div', { class: 'dlg-head' }, h('h2', { id: 'x-title' }, 'Export PDF'),
      h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close', on: { click: () => dlg.close() } }, icon('x'))),
    form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const preparedBy = byInput.value.trim();
    try { localStorage.setItem(PREPARED_BY_KEY, preparedBy); } catch { /* storage blocked */ }
    const sheet = buildSheet({
      product, alternatives, families, rules,
      preparedFor: forInput.value.trim(), preparedBy, note: noteInput.value.trim(),
    });
    dlg.close();
    // Let the dialog close before the print dialog takes over.
    setTimeout(() => {
      try { printSheet(sheet, `Alternatives – ${product.sku}`); } catch { toast('Printing is not available in this browser'); }
    }, 50);
  });
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  append(document.body, dlg);
  dlg.showModal();
  forInput.focus();
}
