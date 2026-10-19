// Catalogue: search, a single row of filters, and a results table showing how many
// alternatives each product has.

import { h, clear, debounce, append } from './dom.js';
import { icon, productThumb, boolValue, skuTag, emptyState } from './components.js';
import { CATEGORY_LABELS, formatVolume, formatNumber } from '../domain/attributes.js';
import { applyFilters, filtersFromParams, filtersToParams, nominalVolumes, DEFAULT_FILTERS } from '../domain/search.js';

const PAGE = 50;

export async function renderCatalogue(root, ctx, { query }) {
  const state = { filters: filtersFromParams(query), limit: PAGE };

  const head = h('div', { class: 'page-head' },
    h('h1', {}, 'Find an alternative'),
    h('p', {}, 'Search for the product the customer asked for, then open it to see the products that match it.'));
  const loading = h('div', { class: 'card' }, h('div', { style: { padding: '22px', display: 'grid', gap: '14px' } },
    Array.from({ length: 6 }, (_, i) => h('div', { class: 'skeleton', style: { width: `${60 + ((i * 13) % 35)}%` } }))));
  root.append(head, loading);

  const products = await ctx.repo.listProducts();
  const counts = new Map(await Promise.all(products.map(async (p) => [p.id, (await ctx.repo.alternativesFor(p.id)).length])));
  loading.remove();

  // ---- Filters
  const select = (name, label, options) => {
    const s = h('select', { id: `f-${name}`, name }, options.map(([v, t]) => h('option', { value: v }, t)));
    s.value = state.filters[name];
    return h('div', { class: 'field' }, h('label', { for: `f-${name}` }, label), s);
  };
  const ranges = [...new Set(products.map((p) => p.family))].sort();
  const anyYesNo = [['', 'Any'], ['yes', 'Yes'], ['no', 'No']];

  const form = h('form', { class: 'filter-bar', role: 'search' },
    h('div', { class: 'field search-field' },
      h('label', { for: 'f-q' }, 'Search'),
      h('input', { id: 'f-q', name: 'q', type: 'search', value: state.filters.q, placeholder: 'SKU, name or “200 µL sterile”', autocomplete: 'off' }),
      icon('search')),
    select('category', 'Category', [['', 'All'], ...Object.entries(CATEGORY_LABELS).map(([v, t]) => [v, `${t}s`])]),
    select('family', 'Range', [['', 'All'], ...ranges.map((r) => [r, r])]),
    select('volume', 'Volume', [['', 'All'], ...nominalVolumes(products).map((v) => [String(v), `${formatNumber(v)} µL`])]),
    select('sterile', 'Sterile', anyYesNo),
    select('filtered', 'Filtered', anyYesNo),
  );

  const resultsHead = h('div', { class: 'results-head' });
  const table = h('table', { class: 'data stack' });
  const pager = h('div', { class: 'pager' });
  root.append(h('section', { class: 'card', 'aria-label': 'Catalogue' }, form, resultsHead, h('div', { class: 'table-wrap' }, table), pager));

  const readForm = () => {
    const fd = new FormData(form);
    return Object.fromEntries(Object.keys(DEFAULT_FILTERS).map((k) => [k, String(fd.get(k) ?? '').trim()]));
  };

  function row(p) {
    const s = p.specifications;
    const isTip = p.category === 'pipette_tip';
    const n = counts.get(p.id);
    const open = () => ctx.navigate(`#/product/${p.id}`);
    const tr = h('tr', { class: 'clickable', on: { click: (e) => { if (!e.target.closest('a, button')) open(); } } },
      h('td', { class: 'cell-first' }, h('div', { class: 'cell-product' }, productThumb(p),
        h('div', {}, h('a', { href: `#/product/${p.id}` }, p.name),
          h('div', { class: 'sub' }, skuTag(p.sku), `${p.family} · ${p.subcategory}`)))),
      h('td', { 'data-label': 'Volume', class: 'num' }, formatVolume(s.volumeMinUl, s.volumeMaxUl)),
      h('td', { 'data-label': 'Sterile' }, isTip ? boolValue(s.sterile) : h('span', { class: 'muted' }, '—')),
      h('td', { 'data-label': 'Filtered' }, isTip ? boolValue(s.filtered) : h('span', { class: 'muted' }, '—')),
      h('td', { 'data-label': 'Alternatives' }, !isTip
        ? h('span', { class: 'muted' }, '—')
        : n ? h('span', { class: 'chip chip-count' }, `${n} alternative${n === 1 ? '' : 's'}`) : h('span', { class: 'muted small' }, 'None')));
    return tr;
  }

  function render() {
    const list = applyFilters(products, state.filters);
    const active = Object.entries(state.filters).some(([k, v]) => v !== DEFAULT_FILTERS[k]);
    clear(resultsHead);
    append(resultsHead,
      h('span', { 'aria-live': 'polite' }, h('strong', {}, String(list.length)), ` product${list.length === 1 ? '' : 's'}`),
      active ? h('button', { type: 'button', class: 'link-btn small', on: { click: () => { form.reset(); setTimeout(update, 0); } } }, 'Clear filters') : null);

    clear(table);
    clear(pager);
    pager.hidden = list.length <= state.limit;
    if (!list.length) {
      table.append(h('tbody', {}, h('tr', {}, h('td', { colspan: '5' }, emptyState({
        title: 'No products match',
        body: 'Try a shorter search or clear the filters.',
      })))));
      return;
    }
    table.append(
      h('thead', {}, h('tr', {}, ['Product', 'Volume', 'Sterile', 'Filtered', 'Alternatives'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, list.slice(0, state.limit).map(row)));
    append(pager, h('span', {}, `Showing ${Math.min(state.limit, list.length)} of ${list.length}`),
      h('button', { type: 'button', class: 'btn btn-sm', on: { click: () => { state.limit = Infinity; render(); } } }, `Show all ${list.length}`));
  }

  const update = () => {
    const next = readForm();
    // A blur also fires "change"; re-rendering then would swallow the click that caused it.
    if (JSON.stringify(next) === JSON.stringify(state.filters)) return;
    state.filters = next;
    state.limit = PAGE;
    ctx.replaceQuery('/', filtersToParams(state.filters));
    render();
  };
  form.addEventListener('input', debounce(update, 150));
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => { e.preventDefault(); update(); });

  render();
  if (!state.filters.q) form.querySelector('#f-q').focus({ preventScroll: true });
}
