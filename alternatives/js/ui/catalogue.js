// Screen A: catalogue search, filters and summary cards.

import { h, clear, debounce, append } from './dom.js';
import { icon, productThumb, statusChip, boolValue, skuTag, skeletonRows, emptyState } from './components.js';
import { CATEGORY_LABELS, STATUS_LABELS, UNAVAILABLE, formatVolume, formatNumber } from '../domain/attributes.js';
import { applyFilters, filtersFromParams, filtersToParams, DEFAULT_FILTERS } from '../domain/search.js';
import { reviewQueueItems } from './reviewQueue.js';
import { isEligible } from '../domain/matching.js';

const PAGE = 40;
const STOCK_ORDER = { in_stock: 0, low_stock: 1, out_of_stock: 2, discontinued: 3 };
const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name),
  volume: (a, b) => (a.specifications.volumeMaxUl ?? Infinity) - (b.specifications.volumeMaxUl ?? Infinity) || a.sku.localeCompare(b.sku),
  stock: (a, b) => STOCK_ORDER[a.status] - STOCK_ORDER[b.status] || (a.stockQuantity ?? -1) - (b.stockQuantity ?? -1),
};

export async function renderCatalogue(root, ctx, { query }) {
  const state = {
    filters: filtersFromParams(query),
    sort: SORTS[query.get('sort')] ? query.get('sort') : '',
    dir: query.get('dir') === 'desc' ? 'desc' : 'asc',
    limit: PAGE,
  };

  // Skeleton while the repository loads.
  const statsEl = h('div', { class: 'stats' }, Array.from({ length: 4 }, () => h('div', { class: 'stat' },
    h('div', { class: 'skeleton', style: { width: '50%' } }), h('div', { class: 'skeleton', style: { width: '30%', height: '30px', marginTop: '8px' } }))));
  const tbodyHolder = h('table', { class: 'data stack' }, skeletonRows());
  append(root, 
    h('div', { class: 'page-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, 'Quellmark synthetic catalogue'),
        h('h1', {}, 'Catalogue'),
        h('p', { class: 'lede' }, 'Search by SKU, name, range or technical attribute. Open a product for details, or go straight to rule-checked alternatives when an item is unavailable.')),
      h('a', { class: 'btn btn-primary', href: '#/alternatives' }, icon('swap'), 'Find alternatives')),
    statsEl,
    h('div', { class: 'card' }, h('div', { class: 'table-wrap' }, tbodyHolder)),
  );

  const [products, families, queue] = await Promise.all([
    ctx.repo.listProducts(), ctx.repo.listFamilies(), reviewQueueItems(ctx),
  ]);
  clear(root);

  // ---- Summary cards
  const count = (fn) => products.filter(fn).length;
  const tips = count((p) => p.category === 'pipette_tip');
  const pipettes = count((p) => p.category === 'pipette');
  const acc = count((p) => p.category === 'accessory');
  const oos = count((p) => p.status === 'out_of_stock');
  const disc = count((p) => p.status === 'discontinued');
  const pending = queue.filter((q) => q.review.reviewStatus === 'pending' && isEligible(q.result.classification)).length;
  const incomplete = count((p) => p.tags.includes('incomplete record'));

  const stat = (props, label, ic, value, note, extra = null) => h(props.href ? 'a' : 'div', { class: `stat ${props.cls ?? ''}`, href: props.href },
    h('span', { class: 'stat-label' }, icon(ic), label), h('span', { class: 'stat-value' }, value), h('span', { class: 'stat-note' }, note), extra);

  const bar = h('div', { class: 'stat-bar', 'aria-hidden': 'true' },
    h('span', { style: { width: `${(tips / products.length) * 100}%`, background: 'var(--navy-900)' } }),
    h('span', { style: { width: `${(pipettes / products.length) * 100}%`, background: 'var(--blue-500)' } }),
    h('span', { style: { width: `${(acc / products.length) * 100}%`, background: '#9FC3E0' } }));

  append(root, 
    h('div', { class: 'page-head' },
      h('div', {},
        h('div', { class: 'eyebrow' }, 'Quellmark synthetic catalogue'),
        h('h1', {}, 'Catalogue'),
        h('p', { class: 'lede' }, 'Search by SKU, name, range or technical attribute. Open a product for details, or go straight to rule-checked alternatives when an item is unavailable.')),
      h('a', { class: 'btn btn-primary', href: '#/alternatives' }, icon('swap'), 'Find alternatives')),
    h('div', { class: 'stats' },
      stat({}, 'Total SKUs', 'layers', formatNumber(products.length), `${tips} tips · ${pipettes} pipettes · ${acc} accessories`, bar),
      stat({ href: '#/?status=unavailable', cls: 'alert' }, 'Out of stock', 'alert', formatNumber(oos), `plus ${disc} discontinued — view unavailable`),
      stat({ href: '#/review?status=pending&eligible=1', cls: 'attention' }, 'Candidates awaiting review', 'inbox', formatNumber(pending), `eligible pairs · ${queue.length} pairs in the queue in total`),
      stat({ href: '#/?q=incomplete+record' }, 'Incomplete records', 'question', formatNumber(incomplete), 'legacy items with unknown attributes'),
    ),
  );

  // ---- Filters
  const familiesOf = (cat) => [...new Set(products.filter((p) => !cat || p.category === cat).map((p) => p.family))].sort();
  const sel = (name, label, options, value) => {
    const s = h('select', { id: `f-${name}`, name },
      options.map(([v, t]) => h('option', { value: v }, t)));
    s.value = value ?? '';
    return h('div', { class: 'field' }, h('label', { for: `f-${name}` }, label), s);
  };
  const seg = (name, legend, value) => h('fieldset', {},
    h('legend', {}, legend),
    h('div', { class: 'seg' }, [['', 'Any'], ['yes', 'Yes'], ['no', 'No'], ['unknown', '?']].map(([v, t]) =>
      h('label', { title: v === 'unknown' ? 'Not recorded' : null },
        h('input', { type: 'radio', name, value: v, checked: (value ?? '') === v, 'aria-label': v === 'unknown' ? 'Not recorded' : t }), t))));

  const form = h('form', { class: 'filter-body', id: 'filter-form' },
    h('div', { class: 'field' }, h('label', { for: 'f-q' }, 'Keyword or SKU'),
      h('input', { id: 'f-q', name: 'q', type: 'search', value: state.filters.q, placeholder: 'e.g. QMT-AL0200 or “low retention”' })),
    sel('category', 'Category', [['', 'All categories'], ...Object.entries(CATEGORY_LABELS).map(([v, t]) => [v, `${t}s`])], state.filters.category),
    sel('status', 'Stock status', [['', 'Any status'], ['unavailable', 'Unavailable (out of stock or discontinued)'], ...Object.entries(STATUS_LABELS)], state.filters.status),
    h('fieldset', {}, h('legend', {}, 'Volume range (µL)'),
      h('div', { class: 'range-pair' },
        h('input', { type: 'number', name: 'volMin', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'Min', 'aria-label': 'Minimum volume in microlitres', value: state.filters.volMin ?? '' }),
        h('span', { 'aria-hidden': 'true' }, '–'),
        h('input', { type: 'number', name: 'volMax', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'Max', 'aria-label': 'Maximum volume in microlitres', value: state.filters.volMax ?? '' })),
      h('span', { class: 'hint' }, 'Shows products whose range overlaps these volumes.')),
    seg('sterile', 'Sterile', state.filters.sterile),
    seg('filtered', 'Filtered', state.filters.filtered),
    sel('family', 'Product range', [['', 'All ranges'], ...familiesOf('').map((f) => [f, f])], state.filters.family),
    sel('fits', 'Fits instrument family', [['', 'Any instrument'], ...families.map((f) => [f.id, f.name])], state.filters.fits),
    h('button', { type: 'reset', class: 'btn btn-secondary' }, icon('rotate'), 'Clear filters'),
  );

  const filtersToggle = h('button', { type: 'button', class: 'btn btn-ghost btn-sm filters-toggle', style: { display: 'none' }, 'aria-expanded': 'false' }, icon('sliders'), 'Show filters');
  const filtersCard = h('aside', { class: 'card filters filters-collapsible', 'aria-label': 'Filters' },
    h('div', { class: 'card-head' }, h('h2', {}, icon('filter'), 'Filters'), filtersToggle), form);
  const setFiltersOpen = (open) => {
    filtersCard.classList.toggle('open', open);
    filtersToggle.setAttribute('aria-expanded', String(open));
    filtersToggle.lastChild.textContent = open ? 'Hide filters' : 'Show filters';
  };
  filtersToggle.addEventListener('click', () => setFiltersOpen(!filtersCard.classList.contains('open')));
  // On narrow screens the panel starts collapsed unless a filter is already active.
  setFiltersOpen(Object.entries(state.filters).some(([k, v]) => k !== 'q' && v !== null && v !== '' && v !== DEFAULT_FILTERS[k]));

  // ---- Results
  const resultsHead = h('div', { class: 'results-head' });
  const table = h('table', { class: 'data stack' });
  const pager = h('div', { class: 'pager' });
  const resultsCard = h('section', { class: 'card', 'aria-label': 'Results' }, resultsHead, h('div', { class: 'table-wrap' }, table), pager);
  append(root, h('div', { class: 'catalogue-layout' }, filtersCard, resultsCard));

  const readForm = () => {
    const fd = new FormData(form);
    const num = (v) => (v === '' || v === null ? null : Number(v));
    return {
      ...DEFAULT_FILTERS,
      q: String(fd.get('q') ?? '').trim(),
      category: fd.get('category') ?? '',
      status: fd.get('status') ?? '',
      volMin: num(fd.get('volMin')),
      volMax: num(fd.get('volMax')),
      sterile: fd.get('sterile') ?? '',
      filtered: fd.get('filtered') ?? '',
      family: fd.get('family') ?? '',
      fits: fd.get('fits') ?? '',
    };
  };

  const syncUrl = () => {
    const params = filtersToParams(state.filters);
    if (state.sort) { params.set('sort', state.sort); if (state.dir === 'desc') params.set('dir', 'desc'); }
    ctx.replaceQuery('/', params);
  };

  const FILTER_LABELS = {
    q: (v) => `“${v}”`,
    category: (v) => `${CATEGORY_LABELS[v]}s`,
    status: (v) => (v === 'unavailable' ? 'Unavailable' : STATUS_LABELS[v]),
    volMin: (v) => `≥ ${formatNumber(v)} µL`,
    volMax: (v) => `≤ ${formatNumber(v)} µL`,
    sterile: (v) => `Sterile: ${{ yes: 'yes', no: 'no', unknown: 'not recorded' }[v]}`,
    filtered: (v) => `Filtered: ${{ yes: 'yes', no: 'no', unknown: 'not recorded' }[v]}`,
    family: (v) => `Range: ${v}`,
    fits: (v) => `Fits ${families.find((f) => f.id === v)?.name ?? v}`,
  };

  function header(label, key, cls = '') {
    if (!key) return h('th', { scope: 'col', class: cls }, label);
    const active = state.sort === key;
    return h('th', { scope: 'col', class: cls, 'aria-sort': active ? (state.dir === 'asc' ? 'ascending' : 'descending') : null },
      h('button', {
        type: 'button',
        on: { click: () => { state.dir = active && state.dir === 'asc' ? 'desc' : 'asc'; state.sort = key; state.limit = PAGE; syncUrl(); renderResults(); } },
      }, label, icon('sort')));
  }

  function row(p) {
    const s = p.specifications;
    const isTip = p.category === 'pipette_tip';
    const unavailable = UNAVAILABLE.has(p.status);
    return h('tr', { class: unavailable ? 'is-unavailable' : null },
      h('td', { class: 'cell-first' }, h('div', { class: 'cell-product' }, productThumb(p),
        h('div', {}, h('a', { href: `#/product/${p.id}` }, p.name),
          h('div', { class: 'sub' }, skuTag(p.sku), ` ${p.family} · ${p.subcategory}`)))),
      h('td', { 'data-label': 'Volume', class: 'num' }, formatVolume(s.volumeMinUl, s.volumeMaxUl) === 'Not recorded' ? h('span', { class: 'unknown-text' }, 'Not recorded') : formatVolume(s.volumeMinUl, s.volumeMaxUl)),
      h('td', { 'data-label': 'Filtered' }, isTip ? boolValue(s.filtered) : h('span', { class: 'muted' }, '—')),
      h('td', { 'data-label': 'Sterile' }, isTip ? boolValue(s.sterile) : h('span', { class: 'muted' }, '—')),
      h('td', { 'data-label': 'Stock' }, statusChip(p)),
      h('td', { class: 'actions' }, isTip
        ? h('a', { class: `btn btn-sm ${unavailable ? 'btn-accent' : 'btn-secondary'}`, href: `#/alternatives/${p.id}` }, icon('swap'), 'Alternatives')
        : h('a', { class: 'btn btn-sm btn-ghost', href: `#/product/${p.id}` }, 'View', icon('arrow'))),
    );
  }

  function renderResults() {
    let list = applyFilters(products, state.filters);
    if (state.sort) {
      list = [...list].sort(SORTS[state.sort]);
      if (state.dir === 'desc') list.reverse();
    }

    clear(resultsHead);
    const active = Object.entries(state.filters).filter(([k, v]) => v !== null && v !== '' && v !== DEFAULT_FILTERS[k] && FILTER_LABELS[k]);
    append(resultsHead, 
      h('div', { class: 'count', 'aria-live': 'polite' }, `${list.length} `, h('span', {}, list.length === 1 ? 'product' : 'products'),
        state.filters.q && !state.sort ? h('span', {}, ' · sorted by relevance') : null),
      active.length ? h('div', { class: 'active-filters' }, active.map(([k, v]) => h('button', {
        type: 'button',
        'aria-label': `Remove filter ${FILTER_LABELS[k](v)}`,
        on: { click: () => { state.filters[k] = DEFAULT_FILTERS[k]; resetFormField(k); update(); } },
      }, FILTER_LABELS[k](v), icon('x')))) : null,
    );

    clear(table);
    if (!list.length) {
      table.append(h('tbody', {}, h('tr', {}, h('td', { colspan: '6' }, emptyState({
        title: 'No products match',
        body: 'Try a broader keyword, or clear some filters. Unknown values only match the “?” option.',
        action: h('button', { type: 'button', class: 'btn btn-secondary', on: { click: () => { form.reset(); } } }, icon('rotate'), 'Clear filters'),
      })))));
      clear(pager);
      return;
    }
    table.append(
      h('thead', {}, h('tr', {}, header('Product', 'name'), header('Volume', 'volume'),
        header('Filtered'), header('Sterile'), header('Stock', 'stock'), h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Actions')))),
      h('tbody', {}, list.slice(0, state.limit).map(row)),
    );
    clear(pager);
    pager.append(h('span', {}, `Showing ${Math.min(state.limit, list.length)} of ${list.length}`));
    if (list.length > state.limit) {
      pager.append(h('button', { type: 'button', class: 'btn btn-secondary btn-sm', on: { click: () => { state.limit = Infinity; renderResults(); } } }, `Show all ${list.length}`));
    }
  }

  function resetFormField(k) {
    const el = form.elements[k];
    if (!el) return;
    if (el instanceof RadioNodeList) { for (const r of el) r.checked = r.value === ''; } else el.value = '';
  }

  const update = () => { state.filters = readForm(); state.limit = PAGE; syncUrl(); renderResults(); };
  const updateSoon = debounce(update, 160);
  form.addEventListener('input', (e) => (e.target.name === 'q' || e.target.type === 'number' ? updateSoon() : update()));
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => { e.preventDefault(); update(); });
  form.addEventListener('reset', () => setTimeout(update, 0));

  renderResults();
}
