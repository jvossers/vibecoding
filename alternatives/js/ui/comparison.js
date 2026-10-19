// Side-by-side comparison of the source and up to three candidates.

import { h, clear } from './dom.js';
import { icon, openDialog, productThumb, classificationChip, statusChip, skuTag } from './components.js';
import { tipAttributeRows } from '../domain/attributes.js';

export const SEVERITY_RANK = { blocking: 5, conditional: 4, unknown: 3, advisory: 2, info: 1 };
export const SEVERITY_LABELS = { blocking: 'Blocker', conditional: 'Condition', unknown: 'Unknown', advisory: 'Advisory', info: 'Minor' };

// The worst severity recorded against each attribute field of one result.
export function severityByField(result) {
  const out = {};
  for (const d of result.differences) {
    const field = d.field === 'unitsPerPack' || d.field === 'racksPerPack' ? 'packagingType' : d.field;
    if (!out[field] || SEVERITY_RANK[d.severity] > SEVERITY_RANK[out[field]]) out[field] = d.severity;
    if (d.field !== field && (!out[d.field] || SEVERITY_RANK[d.severity] > SEVERITY_RANK[out[d.field]])) out[d.field] = d.severity;
  }
  return out;
}

export function openComparison({ source, results, productsById, families, onRemove }) {
  const rows = tipAttributeRows(families);
  const sev = results.map(severityByField);
  let diffOnly = false;

  const table = h('table', { class: 'compare' });
  const wrap = h('div', { class: 'compare-wrap' }, table);

  const head = () => h('thead', {}, h('tr', {},
    h('th', { scope: 'col' }, h('span', { class: 'small muted' }, 'Attribute')),
    h('th', { scope: 'col', class: 'col-source' }, h('div', { class: 'cmp-head' },
      productThumb(source, { size: 48 }), h('span', { class: 'eyebrow', style: { margin: 0 } }, 'Source'),
      h('a', { href: `#/product/${source.id}` }, source.name), skuTag(source.sku), statusChip(source))),
    results.map((r) => {
      const c = productsById[r.candidateProductId];
      return h('th', { scope: 'col' }, h('div', { class: 'cmp-head' },
        productThumb(c, { size: 48 }), classificationChip(r.classification),
        h('a', { href: `#/product/${c.id}` }, c.name), skuTag(c.sku), statusChip(c),
        h('span', { class: 'small muted' }, typeof r.score === 'number' ? `Similarity ${r.score}/100` : 'Score withheld'),
        onRemove ? h('button', { type: 'button', class: 'link-btn small', on: { click: () => { onRemove(c.id); dlg.close(); } } }, 'Remove from comparison') : null));
    })));

  const body = () => {
    const tbody = h('tbody', {});
    let group = null;
    for (const row of rows) {
      const severities = sev.map((m) => m[row.field]);
      const values = [source, ...results.map((r) => productsById[r.candidateProductId])].map((p) => row.value(p.specifications));
      const differs = severities.some(Boolean) || values.some((v) => v !== values[0]);
      if (diffOnly && !differs) continue;
      if (row.group !== group) {
        group = row.group;
        tbody.append(h('tr', { class: 'group-row' }, h('th', { scope: 'rowgroup', colspan: String(results.length + 2) }, group)));
      }
      tbody.append(h('tr', {},
        h('th', { scope: 'row' }, row.label),
        h('td', { class: 'col-source' }, values[0]),
        results.map((r, i) => {
          const s = severities[i];
          return h('td', { class: s ? `sev-${s}` : values[i + 1] === values[0] ? 'sev-match' : '' , title: s ? SEVERITY_LABELS[s] : null },
            values[i + 1], s ? h('span', { class: 'visually-hidden' }, ` (${SEVERITY_LABELS[s]})`) : null);
        })));
    }
    return tbody;
  };

  const render = () => { clear(table); table.append(head(), body()); };
  render();

  const toggle = h('label', { class: 'toggle-inline' },
    h('span', { class: 'switch' }, h('input', { type: 'checkbox', on: { change: (e) => { diffOnly = e.target.checked; render(); } } })),
    'Only rows with differences');

  const legend = h('div', { class: 'legend', 'aria-label': 'Legend' },
    ...['blocking', 'conditional', 'unknown', 'advisory', 'info'].map((k) => h('span', {}, h('i', { class: `sev-${k}` }), SEVERITY_LABELS[k])));

  const dlg = openDialog({
    title: `Compare with source (${results.length} candidate${results.length === 1 ? '' : 's'})`,
    body: h('div', { style: { display: 'grid', gap: '14px' } },
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px 24px', alignItems: 'center', justifyContent: 'space-between' } }, toggle, legend),
      wrap,
      h('p', { class: 'small muted' }, icon('info'), ' Potential alternatives — review required. Highlighting comes from the demo rules; confirm with the customer before substituting.')),
  });
  dlg.querySelector('.small.muted svg')?.setAttribute('style', 'width:14px;height:14px;vertical-align:-2px');
  return dlg;
}
