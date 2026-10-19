// Screen C: the alternative finder (primary demo screen).

import { h, clear, debounce, append } from './dom.js';
import {
  icon, productThumb, statusChip, classificationChip, reviewChip, skuTag, scoreRing, emptyState, callout,
} from './components.js';
import { openComparison, severityByField, SEVERITY_LABELS } from './comparison.js';
import {
  INTERFACE_LABELS, PACKAGING_LABELS, RELATIONSHIP_LABELS, TIP_FORMAT_LABELS, UNAVAILABLE,
  formatVolume, formatBool, formatEnum, formatNumber, isUnknown,
} from '../domain/attributes.js';
import { defaultRequirements, findAlternatives, isEligible, CLASSIFICATION_LABELS } from '../domain/matching.js';
import { applyFilters } from '../domain/search.js';

const MAX_COMPARE = 3;
const TABS = [
  ['all', 'All assessed'],
  ['candidate', CLASSIFICATION_LABELS.candidate],
  ['conditional', CLASSIFICATION_LABELS.conditional],
  ['insufficient_data', CLASSIFICATION_LABELS.insufficient_data],
];
const STOCK_ORDER = { in_stock: 0, low_stock: 1, out_of_stock: 2, discontinued: 3 };

// ---------------------------------------------------------------- URL state

function readRequirements(query, defaults) {
  const req = { ...defaults, cleanlinessClaims: [...defaults.cleanlinessClaims] };
  const num = (k) => (query.has(k) ? (query.get(k) === '' ? null : Number(query.get(k))) : undefined);
  const bool = (k) => (query.has(k) ? query.get(k) === '1' : undefined);
  const vmin = num('vmin'), vmax = num('vmax');
  if (vmin !== undefined && !Number.isNaN(vmin)) req.volumeMinUl = vmin;
  if (vmax !== undefined && !Number.isNaN(vmax)) req.volumeMaxUl = vmax;
  for (const [k, key] of [['st', 'sterile'], ['fi', 'filtered'], ['lr', 'lowRetention'], ['wb', 'wideBore']]) {
    const v = bool(k); if (v !== undefined) req[key] = v;
  }
  if (query.has('fam')) req.instrumentFamily = query.get('fam');
  if (query.has('pk')) req.packagingType = query.get('pk');
  if (query.has('cl')) req.cleanlinessClaims = query.get('cl').split('|').filter(Boolean);
  return req;
}

function writeRequirements(params, req, defaults) {
  const same = (a, b) => (a ?? null) === (b ?? null);
  if (!same(req.volumeMinUl, defaults.volumeMinUl)) params.set('vmin', req.volumeMinUl ?? '');
  if (!same(req.volumeMaxUl, defaults.volumeMaxUl)) params.set('vmax', req.volumeMaxUl ?? '');
  for (const [k, key] of [['st', 'sterile'], ['fi', 'filtered'], ['lr', 'lowRetention'], ['wb', 'wideBore']]) {
    if (req[key] !== defaults[key]) params.set(k, req[key] ? '1' : '0');
  }
  if (req.instrumentFamily) params.set('fam', req.instrumentFamily);
  if (req.packagingType) params.set('pk', req.packagingType);
  if (req.cleanlinessClaims.length) params.set('cl', req.cleanlinessClaims.join('|'));
}

function changedKeys(req, defaults) {
  const out = new Set();
  for (const k of Object.keys(defaults)) {
    const a = req[k], b = defaults[k];
    if (Array.isArray(a) ? a.join('|') !== b.join('|') : (a ?? null) !== (b ?? null)) out.add(k);
  }
  return out;
}

// ---------------------------------------------------------------- Picker

async function renderPicker(root, ctx, query) {
  const products = await ctx.repo.listProducts();
  const families = await ctx.repo.familiesById();
  const tips = products.filter((p) => p.category === 'pipette_tip');
  const unavailable = tips.filter((p) => UNAVAILABLE.has(p.status));
  const eligibleCount = (p) => findAlternatives(p, products, defaultRequirements(p), { families })
    .filter((r) => isEligible(r.classification)).length;

  const grid = h('div', { class: 'picker-grid' });
  const title = h('h2', { style: { margin: '6px 0 14px' } });
  const input = h('input', { type: 'search', id: 'pick-q', placeholder: 'Search tips by SKU, name or attribute', value: query.get('q') ?? '', 'aria-label': 'Search for a source product' });

  const card = (p) => {
    const n = eligibleCount(p);
    return h('a', { class: 'pick', href: `#/alternatives/${p.id}` }, productThumb(p, { size: 56 }),
      h('span', {}, h('strong', {}, p.name),
        h('span', { class: 'meta' }, skuTag(p.sku), statusChip(p),
          h('span', { class: `chip plain ${n ? 'chip-blue' : 'chip-muted'}` }, n ? `${n} pass the rules` : 'none pass the rules'))));
  };

  const draw = () => {
    const q = input.value.trim();
    const list = q ? applyFilters(tips, { q }).slice(0, 24) : unavailable;
    clear(grid);
    title.textContent = q ? `Matching tips (${list.length})` : `Unavailable now — start here (${unavailable.length})`;
    if (!list.length) grid.append(emptyState({ title: 'No tips match', body: 'Try a SKU such as QMT-AL0200-S96, or a phrase like “1000 µL sterile”.' }));
    else grid.append(...list.map(card));
    const params = new URLSearchParams(); if (q) params.set('q', q);
    ctx.replaceQuery('/alternatives', params);
  };
  input.addEventListener('input', debounce(draw, 150));

  append(root, 
    h('div', { class: 'page-head' }, h('div', {},
      h('div', { class: 'eyebrow' }, 'Alternative finder'),
      h('h1', {}, 'Which product did the customer ask for?'),
      h('p', { class: 'lede' }, 'Pick the requested tip. The finder applies deterministic rules — category, instrument fit, volume, sterility, filtration — before scoring, and explains every result.'))),
    h('div', { class: 'picker-search' }, input),
    title, grid);
  draw();
}

// ---------------------------------------------------------------- Finder

export async function renderAlternativeFinder(root, ctx, { params, query }) {
  if (!params.id) return renderPicker(root, ctx, query);

  const [source, products, families, seeds] = await Promise.all([
    ctx.repo.getProduct(params.id), ctx.repo.listProducts(), ctx.repo.familiesById(), ctx.repo.seedsForSource(params.id),
  ]);
  if (!source) {
    append(root, emptyState({ title: 'Product not found', body: 'Choose a source product to find alternatives for.', action: h('a', { class: 'btn btn-primary', href: '#/alternatives' }, 'Choose a product') }));
    return;
  }
  ctx.remember(source);
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const related = await ctx.repo.relationshipsFor(source.id);
  const seedById = Object.fromEntries(seeds.map((s) => [s.candidateProductId, s]));
  const relByOther = {};
  for (const r of related) (relByOther[r.other.id] ??= []).push(r);
  const allClaims = [...new Set(products.flatMap((p) => p.specifications.cleanlinessClaims ?? []))].sort();
  const s = source.specifications;
  const isTip = source.category === 'pipette_tip';

  // ---- Pinned source summary
  const attrs = [skuTag(source.sku)];
  if (isTip) {
    attrs.push(
      h('span', { class: 'chip chip-outline plain' }, formatVolume(s.volumeMinUl, s.volumeMaxUl)),
      h('span', { class: `chip plain ${s.sterile === null ? 'chip-unknown' : 'chip-outline'}` }, s.sterile === null ? 'Sterility not recorded' : s.sterile ? 'Sterile' : 'Non-sterile'),
      h('span', { class: `chip plain ${s.filtered === null ? 'chip-unknown' : 'chip-outline'}` }, s.filtered === null ? 'Filtration not recorded' : s.filtered ? 'Filtered' : 'Unfiltered'),
      s.lowRetention ? h('span', { class: 'chip chip-outline plain' }, 'Low retention') : null,
      h('span', { class: 'chip chip-outline plain' }, formatEnum(PACKAGING_LABELS, s.packagingType)),
    );
  }
  append(root, h('section', { class: 'source-pin', 'aria-label': 'Source product' }, h('div', { class: 'source-pin-inner' },
    productThumb(source, { size: 56 }),
    h('div', { style: { minWidth: 0 } },
      h('div', { class: 'label' }, 'Source product', statusChip(source, { withQty: true })),
      h('h1', {}, source.name),
      h('div', { class: 'attrs' }, attrs)),
    h('div', { class: 'pin-actions' },
      h('a', { class: 'btn btn-secondary btn-sm', href: `#/product/${source.id}` }, icon('doc'), 'Product details'),
      h('a', { class: 'btn btn-ghost btn-sm', href: '#/alternatives' }, icon('swap'), 'Change source')))));

  if (!isTip) {
    append(root, callout('info', 'Alternatives are generated for consumables only',
      'A pipette or accessory is equipment: it is never offered as a substitute. See the compatible tips instead.',
      h('a', { class: 'btn btn-secondary btn-sm', href: `#/product/${source.id}` }, 'View product')));
    return;
  }

  // ---- State
  const defaults = defaultRequirements(source);
  const state = {
    req: readRequirements(query, defaults),
    tab: TABS.some(([k]) => k === query.get('tab')) ? query.get('tab') : 'all',
    excluded: query.get('ex') === '1',
    inStock: query.get('stock') === '1',
    sort: ['rank', 'score', 'stock'].includes(query.get('sort')) ? query.get('sort') : 'rank',
    compare: (query.get('cmp') ?? '').split(',').filter((id) => productsById[id]).slice(0, MAX_COMPARE),
    focus: query.get('focus'),
    open: new Set(query.get('focus') ? [query.get('focus')] : []),
    notes: new Set(),
  };
  let results = [];

  const syncUrl = () => {
    const p = new URLSearchParams();
    writeRequirements(p, state.req, defaults);
    if (state.tab !== 'all') p.set('tab', state.tab);
    if (state.excluded) p.set('ex', '1');
    if (state.inStock) p.set('stock', '1');
    if (state.sort !== 'rank') p.set('sort', state.sort);
    if (state.compare.length) p.set('cmp', state.compare.join(','));
    ctx.replaceQuery(`/alternatives/${source.id}`, p);
  };

  // ---- Incomplete source warning
  const gaps = [];
  if (isUnknown(s.volumeMinUl) || isUnknown(s.volumeMaxUl)) gaps.push('volume range');
  if (isUnknown(s.sterile)) gaps.push('sterility');
  if (isUnknown(s.filtered)) gaps.push('filtration');
  if (!s.compatibleInstrumentFamilies.length) gaps.push('instrument compatibility');
  if (gaps.length) {
    append(root, h('div', { style: { marginBottom: '18px' } }, callout('warning', 'Source record is incomplete',
      `Not recorded: ${gaps.join(', ')}. Confirm these with the customer and set them below — unknowns are never assumed, so affected candidates stay “Insufficient data”.`)));
  }

  // ---- Requirements panel
  const reqForm = h('form', { class: 'req-body', id: 'req-form' });
  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm' }, icon('rotate'), 'Reset');
  const reqPanel = h('aside', { class: 'card req-panel', 'aria-labelledby': 'req-title' },
    h('div', { class: 'card-head' }, h('h2', { id: 'req-title' }, icon('sliders'), 'Requirements'), resetBtn),
    reqForm,
    h('div', { class: 'req-foot' },
      h('span', {}, 'Rules run in your browser and recompute instantly.'),
      h('span', {}, 'Hard requirements block. Advisory differences only lower the score, and a score is only given after every hard requirement passes.')));

  const sourceHint = (v, yes, no) => `Source: ${isUnknown(v) ? 'not recorded' : v ? yes : no}`;
  function drawRequirements() {
    clear(reqForm);
    const changed = changedKeys(state.req, defaults);
    const tag = (k) => (changed.has(k) ? h('span', { class: 'req-changed' }, 'changed') : null);
    const sw = (key, label, hint) => h('div', { class: 'switch-row' },
      h('div', { class: 'txt' }, h('label', { for: `r-${key}` }, label, tag(key)), h('span', { class: 'hint' }, hint)),
      h('span', { class: 'switch' }, h('input', { type: 'checkbox', id: `r-${key}`, name: key, checked: state.req[key], role: 'switch' })));

    const famNames = s.compatibleInstrumentFamilies.map((id) => families[id]?.name).join(', ');
    const famSelect = h('select', { id: 'r-fam', name: 'instrumentFamily' },
      h('option', { value: '' }, famNames ? `Any listed for the source (${famNames})` : 'Not recorded on source — choose one'),
      Object.values(families).map((f) => h('option', { value: f.id }, `${f.name} — ${INTERFACE_LABELS[f.tipInterfaceType]}`)));
    famSelect.value = state.req.instrumentFamily;
    const pkSelect = h('select', { id: 'r-pk', name: 'packagingType' },
      h('option', { value: '' }, 'Any packaging (difference is advisory)'),
      Object.entries(PACKAGING_LABELS).filter(([k]) => k !== 'other').map(([k, t]) => h('option', { value: k }, `${t} only`)));
    pkSelect.value = state.req.packagingType;

    append(reqForm, 
      h('div', { class: 'req-section-title' }, 'Working range'),
      h('fieldset', {}, h('legend', {}, 'Required volume (µL)', tag('volumeMinUl') ?? tag('volumeMaxUl')),
        h('div', { class: 'range-pair' },
          h('input', { type: 'number', name: 'volumeMinUl', min: '0', step: 'any', inputmode: 'decimal', 'aria-label': 'Required minimum volume, µL', value: state.req.volumeMinUl ?? '', placeholder: 'min' }),
          h('span', { 'aria-hidden': 'true' }, '–'),
          h('input', { type: 'number', name: 'volumeMaxUl', min: '0', step: 'any', inputmode: 'decimal', 'aria-label': 'Required maximum volume, µL', value: state.req.volumeMaxUl ?? '', placeholder: 'max' })),
        h('span', { class: 'hint small muted' }, `Source: ${formatVolume(s.volumeMinUl, s.volumeMaxUl)}`)),
      h('div', { class: 'req-section-title' }, 'Hard requirements'),
      sw('sterile', 'Sterile', sourceHint(s.sterile, 'sterile', 'non-sterile')),
      sw('filtered', 'Filtered', sourceHint(s.filtered, 'filtered', 'unfiltered')),
      sw('lowRetention', 'Low retention', sourceHint(s.lowRetention, 'low retention', 'standard')),
      sw('wideBore', 'Wide bore', `Source: ${formatEnum(TIP_FORMAT_LABELS, s.tipFormat).toLowerCase()}`),
      h('div', { class: 'field' }, h('label', { for: 'r-fam' }, 'Customer’s instrument family', tag('instrumentFamily')), famSelect),
      h('div', { class: 'field' }, h('label', { for: 'r-pk' }, 'Packaging', tag('packagingType')), pkSelect),
      h('fieldset', {}, h('legend', {}, 'Claims the customer needs', tag('cleanlinessClaims')),
        h('div', { class: 'check-list' }, allClaims.map((c) => h('label', { class: 'check' },
          h('input', { type: 'checkbox', name: 'claim', value: c, checked: state.req.cleanlinessClaims.includes(c) }), c))),
        h('span', { class: 'hint small muted' }, 'Synthetic claims, not certifications.')),
    );
    resetBtn.disabled = changed.size === 0;
  }

  function readRequirementsForm() {
    const fd = new FormData(reqForm);
    const num = (v) => (v === null || v === '' ? null : Number(v));
    state.req = {
      volumeMinUl: num(fd.get('volumeMinUl')),
      volumeMaxUl: num(fd.get('volumeMaxUl')),
      sterile: fd.has('sterile'),
      filtered: fd.has('filtered'),
      lowRetention: fd.has('lowRetention'),
      wideBore: fd.has('wideBore'),
      instrumentFamily: fd.get('instrumentFamily') ?? '',
      packagingType: fd.get('packagingType') ?? '',
      cleanlinessClaims: fd.getAll('claim'),
    };
  }

  const onReqChange = () => {
    readRequirementsForm();
    const changed = changedKeys(state.req, defaults);
    for (const el of reqForm.querySelectorAll('.req-changed')) el.remove();
    resetBtn.disabled = changed.size === 0;
    // Refresh the "changed" tags without redrawing (keeps focus and caret).
    const label = (sel) => reqForm.querySelector(sel);
    const mark = (k, el) => { if (changed.has(k) && el) el.append(h('span', { class: 'req-changed' }, 'changed')); };
    mark('sterile', label('label[for="r-sterile"]'));
    mark('filtered', label('label[for="r-filtered"]'));
    mark('lowRetention', label('label[for="r-lowRetention"]'));
    mark('wideBore', label('label[for="r-wideBore"]'));
    mark('instrumentFamily', label('label[for="r-fam"]'));
    mark('packagingType', label('label[for="r-pk"]'));
    if (changed.has('volumeMinUl') || changed.has('volumeMaxUl')) mark('volumeMinUl', reqForm.querySelector('fieldset legend'));
    mark('cleanlinessClaims', reqForm.querySelectorAll('fieldset legend')[1]);
    compute();
  };
  reqForm.addEventListener('change', onReqChange);
  reqForm.addEventListener('input', debounce((e) => { if (e.target.type === 'number') onReqChange(); }, 200));
  reqForm.addEventListener('submit', (e) => e.preventDefault());
  resetBtn.addEventListener('click', () => {
    state.req = { ...defaults, cleanlinessClaims: [] };
    drawRequirements();
    compute();
    ctx.toast('Requirements reset to the source defaults');
  });

  // ---- Results panel
  const tabsEl = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Filter by classification' });
  const toolbar = h('div', { class: 'results-toolbar' });
  const listEl = h('ol', { class: 'cand-list', 'aria-label': 'Candidates' });
  const resultsCard = h('section', { class: 'card', 'aria-labelledby': 'res-title' }, toolbar, tabsEl, listEl);
  append(root, h('div', { class: 'finder-layout' }, reqPanel, resultsCard));

  const exToggle = h('input', { type: 'checkbox', id: 'ex-toggle', checked: state.excluded });
  const stockToggle = h('input', { type: 'checkbox', id: 'stock-toggle', checked: state.inStock });
  const sortSel = h('select', { id: 'sort-sel', 'aria-label': 'Sort candidates', style: { width: 'auto' } },
    h('option', { value: 'rank' }, 'Sort: eligibility, then score'), h('option', { value: 'score' }, 'Sort: score'), h('option', { value: 'stock' }, 'Sort: availability'));
  sortSel.value = state.sort;
  const summaryLine = h('p', {});
  append(toolbar, 
    h('div', { class: 'results-title' }, h('h2', { id: 'res-title' }, 'Potential alternatives — review required'), summaryLine),
    h('label', { class: 'toggle-inline', for: 'stock-toggle' }, h('span', { class: 'switch' }, stockToggle), 'In stock only'),
    h('label', { class: 'toggle-inline', for: 'ex-toggle' }, h('span', { class: 'switch' }, exToggle), 'Include excluded'),
    sortSel);
  exToggle.addEventListener('change', () => { state.excluded = exToggle.checked; drawResults(); });
  stockToggle.addEventListener('change', () => { state.inStock = stockToggle.checked; drawResults(); });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; drawResults(); });

  // ---- Compare tray
  const tray = h('div', { class: 'compare-tray', role: 'region', 'aria-label': 'Comparison selection', hidden: true });
  append(root, tray);

  function drawTray() {
    clear(tray);
    tray.hidden = state.compare.length === 0;
    if (tray.hidden) return;
    append(tray, 
      h('span', { class: 'tray-title' }, icon('compare'), ` Compare ${state.compare.length}/${MAX_COMPARE}`),
      h('div', { class: 'tray-items' }, state.compare.map((id) => {
        const p = productsById[id];
        return h('span', { class: 'tray-item' }, productThumb(p, { size: 28 }), p.sku,
          h('button', { type: 'button', 'aria-label': `Remove ${p.sku} from comparison`, on: { click: () => toggleCompare(id, false) } }, icon('x')));
      })),
      h('button', { type: 'button', class: 'btn btn-secondary btn-sm', on: { click: () => { state.compare = []; afterCompareChange(); } } }, 'Clear'),
      h('button', { type: 'button', class: 'btn btn-accent btn-sm', on: { click: showComparison } }, icon('compare'), 'Open comparison'));
  }

  function showComparison() {
    const chosen = state.compare.map((id) => results.find((r) => r.candidateProductId === id)).filter(Boolean);
    if (!chosen.length) return;
    openComparison({ source, results: chosen, productsById, families, onRemove: (id) => toggleCompare(id, false) });
  }

  function toggleCompare(id, on) {
    if (on && !state.compare.includes(id)) {
      if (state.compare.length >= MAX_COMPARE) { ctx.toast(`Compare up to ${MAX_COMPARE} candidates at a time`); return; }
      state.compare.push(id);
    } else if (!on) state.compare = state.compare.filter((x) => x !== id);
    afterCompareChange();
  }
  function afterCompareChange() {
    drawTray();
    syncUrl();
    for (const box of listEl.querySelectorAll('input[data-compare]')) {
      box.checked = state.compare.includes(box.dataset.compare);
      box.disabled = !box.checked && state.compare.length >= MAX_COMPARE;
      box.closest('.cand')?.classList.toggle('is-compared', box.checked);
    }
  }

  // ---- Candidate card
  const relChips = (candId) => (relByOther[candId] ?? [])
    .filter((r) => r.relationship.type !== 'compatible_with')
    .map((r) => h('span', { class: 'chip chip-outline plain', title: r.relationship.evidenceNote },
      icon('link'), ` On file: ${RELATIONSHIP_LABELS[r.relationship.type][r.direction === 'outgoing' ? 'out' : 'in'].toLowerCase()}`));

  const famShort = (ids) => (ids?.length ? ids.map((id) => families[id]?.name ?? id).join(', ') : 'Not recorded');
  const STRIP = [
    ['volume', 'Volume', (x) => formatVolume(x.volumeMinUl, x.volumeMaxUl)],
    ['sterile', 'Sterile', (x) => formatBool(x.sterile)],
    ['filtered', 'Filtered', (x) => formatBool(x.filtered)],
    ['lowRetention', 'Low ret.', (x) => formatBool(x.lowRetention)],
    ['tipFormat', 'Format', (x) => formatEnum(TIP_FORMAT_LABELS, x.tipFormat)],
    ['compatibleInstrumentFamilies', 'Fits', (x) => famShort(x.compatibleInstrumentFamilies)],
    ['packagingType', 'Pack', (x) => (isUnknown(x.packagingType) ? 'Not recorded' : `${formatEnum(PACKAGING_LABELS, x.packagingType)}${isUnknown(x.unitsPerPack) ? '' : ` · ${formatNumber(x.unitsPerPack)}`}`)],
  ];

  function attrStrip(result, cand) {
    const sev = severityByField(result);
    const isPipette = cand.category !== 'pipette_tip';
    return h('div', { class: 'attr-strip' }, h('table', {},
      h('caption', { class: 'visually-hidden' }, 'Key attributes, source compared with candidate'),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Product')), STRIP.map(([, label]) => h('th', { scope: 'col' }, label)))),
      h('tbody', {},
        h('tr', {}, h('th', { scope: 'row' }, 'Source'), STRIP.map(([, , fmt]) => h('td', {}, fmt(s)))),
        h('tr', {}, h('th', { scope: 'row' }, 'Candidate'), STRIP.map(([field, , fmt]) => {
          if (isPipette) return h('td', { class: 'muted' }, field === 'volume' ? formatVolume(cand.specifications.volumeMinUl, cand.specifications.volumeMaxUl) : '—');
          const v = fmt(cand.specifications);
          const sv = sev[field] ?? (v === 'Not recorded' ? 'unknown' : null);
          return h('td', { class: sv ? `sev-${sv}` : v === fmt(s) ? 'sev-match' : '', title: sv ? SEVERITY_LABELS[sv] : null }, v);
        })))));
  }

  function whyPanel(result) {
    const by = (sev) => result.differences.filter((d) => d.severity === sev);
    const list = (cls, title, ic, items) => (items.length ? h('div', { class: cls }, h('h4', {}, icon(ic), title), h('ul', {}, items)) : null);
    const diffItem = (d) => h('li', {}, h('span', { class: 'sev-tag' }, SEVERITY_LABELS[d.severity]), d.note,
      h('span', { class: 'from-to' }, `Source: ${d.sourceValue} → Candidate: ${d.candidateValue}`));
    const advisory = [...by('advisory'), ...by('info')];
    const sections = [
      list('w-block', `Blockers (${result.blockingReasons.length})`, 'ban', result.blockingReasons.map((t) => h('li', {}, t))),
      list('w-cond', `Conditions (${result.conditions.length})`, 'alert', result.conditions.map((t) => h('li', {}, t))),
      list('w-unknown', `Unknowns (${by('unknown').length})`, 'question', by('unknown').map((d) => h('li', {}, d.note,
        h('span', { class: 'from-to' }, `Source: ${d.sourceValue} → Candidate: ${d.candidateValue}`)))),
      list('w-diff', `Differences (${advisory.length})`, 'info', advisory.map(diffItem)),
      list('w-match', `Matching (${result.matchingAttributes.length})`, 'check', result.matchingAttributes.map((t) => h('li', {}, t))),
    ].filter(Boolean);
    return h('div', { class: 'why' }, sections.length ? sections : h('p', { class: 'why-none' }, 'No attributes to compare.'),
      h('p', { class: 'why-foot' }, `Generated by deterministic demo rules (${result.generatedBy}). ${isEligible(result.classification)
        ? 'Potential alternative — review required: confirm the conditions and differences with the customer before substituting.'
        : 'No score is shown because a hard requirement failed or could not be confirmed.'}`));
  }

  function candidateCard(result, index) {
    const cand = productsById[result.candidateProductId];
    const seed = seedById[cand.id] ?? null;
    const review = ctx.reviews.get(source.id, cand.id, seed);
    const eligible = isEligible(result.classification);
    const compared = state.compare.includes(cand.id);
    const li = h('li', { class: `cand${compared ? ' is-compared' : ''}${state.focus === cand.id ? ' is-focus' : ''}`, dataset: { class: result.classification, cand: cand.id }, id: `cand-${cand.id}` });

    const counts = h('span', { class: 'sum-counts' },
      result.blockingReasons.length ? h('span', { class: 'chip chip-danger' }, `${result.blockingReasons.length} blocker${result.blockingReasons.length > 1 ? 's' : ''}`) : null,
      result.conditions.length ? h('span', { class: 'chip chip-warning' }, `${result.conditions.length} condition${result.conditions.length > 1 ? 's' : ''}`) : null,
      result.unknowns.length ? h('span', { class: 'chip chip-unknown' }, `${result.unknowns.length} unknown`) : null);
    const details = h('details', { open: state.open.has(cand.id) },
      h('summary', {}, icon('chevron'), 'Why this result', counts), whyPanel(result));
    details.addEventListener('toggle', () => { if (details.open) state.open.add(cand.id); else state.open.delete(cand.id); });

    const approve = h('button', {
      type: 'button', class: 'btn btn-success btn-sm', 'aria-pressed': String(review.reviewStatus === 'approved_for_demo'),
      disabled: !eligible, title: eligible ? 'Prototype-only status; not a technical or regulatory approval' : 'Blocked or unassessable candidates cannot be approved',
      on: { click: () => setStatus(review.reviewStatus === 'approved_for_demo' ? 'pending' : 'approved_for_demo') },
    }, icon('check'), review.reviewStatus === 'approved_for_demo' ? 'Approved for demo' : 'Approve for demo review');
    const reject = h('button', {
      type: 'button', class: 'btn btn-danger btn-sm', 'aria-pressed': String(review.reviewStatus === 'rejected'),
      on: { click: () => setStatus(review.reviewStatus === 'rejected' ? 'pending' : 'rejected') },
    }, icon('x'), review.reviewStatus === 'rejected' ? 'Rejected' : 'Reject');
    const noteBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-expanded': String(state.notes.has(cand.id)), on: { click: () => { if (state.notes.has(cand.id)) state.notes.delete(cand.id); else state.notes.add(cand.id); redraw(); } } },
      icon('note'), review.reviewNote ? 'Edit note' : 'Add note');
    const compareBox = h('input', { type: 'checkbox', dataset: { compare: cand.id }, checked: compared, disabled: !compared && state.compare.length >= MAX_COMPARE });
    compareBox.addEventListener('change', () => toggleCompare(cand.id, compareBox.checked));

    function setStatus(status) {
      ctx.reviews.setStatus(source.id, cand.id, status, { classification: result.classification, seed });
      ctx.toast(status === 'pending' ? 'Review status cleared' : status === 'approved_for_demo' ? 'Approved for demo review (prototype-only status)' : 'Candidate rejected for this source');
      redraw();
    }
    function redraw() {
      const fresh = candidateCard(result, index);
      li.replaceWith(fresh);
      fresh.querySelector(state.notes.has(cand.id) ? 'textarea' : '.cand-actions .btn-ghost')?.focus();
    }

    append(li, 
      h('div', { class: 'cand-top' },
        h('span', { class: 'cand-rank', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')),
        productThumb(cand, { size: 64 }),
        h('div', { class: 'cand-main' },
          h('div', { class: 'cand-labels' }, classificationChip(result.classification),
            result.specEquivalent ? h('span', { class: 'chip chip-blue plain' }, 'Spec-equivalent') : null,
            relChips(cand.id), review.inQueue || review.changedLocally ? reviewChip(review.reviewStatus) : null),
          h('a', { class: 'cand-name', href: `#/product/${cand.id}` }, cand.name),
          h('div', { class: 'cand-meta' }, skuTag(cand.sku), h('span', {}, `${cand.family} · ${cand.subcategory}`), statusChip(cand, { withQty: true })),
          h('p', { class: 'cand-expl' }, result.explanation)),
        scoreRing(result.score, result.classification)),
      attrStrip(result, cand),
      details,
      review.reviewNote && !state.notes.has(cand.id)
        ? h('div', { class: 'note-display' }, h('strong', {}, 'Note: '), review.reviewNote,
          review.reviewedAt ? h('div', { class: 'muted' }, `Reviewed ${new Date(review.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`) : null)
        : null,
      state.notes.has(cand.id) ? noteEditor(cand, seed, review, redraw) : null,
      h('div', { class: 'cand-actions' },
        h('label', { class: 'compare-check' }, compareBox, 'Compare'),
        h('span', { class: 'spacer' }),
        approve, reject, noteBtn),
    );
    return li;
  }

  function noteEditor(cand, seed, review, redraw) {
    const ta = h('textarea', { 'aria-label': `Review note for ${cand.sku}`, maxlength: '600', placeholder: 'e.g. Customer confirmed they only use Axis pipettes.' });
    ta.value = review.reviewNote ?? '';
    const save = () => {
      ctx.reviews.setNote(source.id, cand.id, ta.value, { seed });
      state.notes.delete(cand.id);
      ctx.toast(ta.value.trim() ? 'Note saved' : 'Note removed');
      redraw();
    };
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); if (e.key === 'Escape') { state.notes.delete(cand.id); redraw(); } });
    return h('div', { class: 'note-box' }, ta, h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn btn-ghost btn-sm', on: { click: () => { state.notes.delete(cand.id); redraw(); } } }, 'Cancel'),
      h('button', { type: 'button', class: 'btn btn-primary btn-sm', on: { click: save } }, 'Save note')));
  }

  // ---- Compute and draw
  // Equipment that fits the source is pulled into the pool on purpose, so the excluded list
  // shows that the category rule keeps it out of the substitutes.
  const fittingEquipment = products.filter((p) => p.category === 'pipette'
    && s.compatibleInstrumentFamilies.includes(p.specifications.instrumentFamilyId)
    && p.specifications.volumeMaxUl <= (s.volumeMaxUl ?? 0) && p.specifications.volumeMaxUl >= (s.volumeMaxUl ?? 0) / 4).slice(0, 2);

  function compute() {
    const extraIds = [...new Set([...seeds.map((x) => x.candidateProductId), ...related.map((r) => r.other.id),
      ...fittingEquipment.map((p) => p.id), ...(state.focus ? [state.focus] : [])])];
    results = findAlternatives(source, products, state.req, { families, extraIds });
    drawResults();
  }

  function drawResults() {
    syncUrl();
    const avail = (r) => !state.inStock || ['in_stock', 'low_stock'].includes(productsById[r.candidateProductId].status);
    const pool = results.filter(avail);
    const counts = Object.fromEntries(['candidate', 'conditional', 'insufficient_data', 'not_compatible'].map((k) => [k, pool.filter((r) => r.classification === k).length]));
    const assessed = counts.candidate + counts.conditional + counts.insufficient_data;

    clear(tabsEl);
    for (const [key, label] of TABS) {
      const n = key === 'all' ? assessed : counts[key];
      tabsEl.append(h('button', {
        type: 'button', role: 'tab', class: 'tab', 'aria-selected': String(state.tab === key),
        on: { click: () => { state.tab = key; drawResults(); } },
      }, label, h('span', { class: 'n' }, String(n))));
    }
    clear(summaryLine);
    append(summaryLine, `${counts.candidate + counts.conditional} pass the hard rules · ${counts.insufficient_data} need data · ${counts.not_compatible} excluded`,
      state.excluded ? '' : ' (hidden)');
    exToggle.parentElement.parentElement.lastChild.textContent = `Include excluded (${counts.not_compatible})`;

    let shown = pool.filter((r) => r.classification !== 'not_compatible' && (state.tab === 'all' || r.classification === state.tab));
    let excluded = state.excluded ? pool.filter((r) => r.classification === 'not_compatible') : [];
    const sorter = {
      rank: null,
      score: (a, b) => (b.score ?? -1) - (a.score ?? -1),
      stock: (a, b) => STOCK_ORDER[productsById[a.candidateProductId].status] - STOCK_ORDER[productsById[b.candidateProductId].status] || (b.score ?? -1) - (a.score ?? -1),
    }[state.sort];
    if (sorter) { shown = [...shown].sort(sorter); excluded = [...excluded].sort(sorter); }

    clear(listEl);
    if (!shown.length) {
      listEl.append(h('li', {}, emptyState({
        title: assessed ? 'Nothing in this view' : 'No potential alternatives pass the hard rules',
        body: assessed
          ? 'Switch tab or turn off “In stock only”.'
          : `Every candidate failed a hard requirement for these settings. Turn on “Include excluded” to see why, or relax a requirement you have confirmed with the customer.`,
        action: !state.excluded && counts.not_compatible ? h('button', { type: 'button', class: 'btn btn-secondary', on: { click: () => { exToggle.checked = true; state.excluded = true; drawResults(); } } }, `Show ${counts.not_compatible} excluded`) : null,
      })));
    }
    shown.forEach((r, i) => listEl.append(candidateCard(r, i)));
    if (excluded.length) {
      listEl.append(h('li', { class: 'excluded-head', role: 'presentation' }, `Excluded by hard rules (${excluded.length}) — shown to demonstrate the logic`));
      excluded.forEach((r, i) => listEl.append(candidateCard(r, shown.length + i)));
    }
    afterCompareChange();
  }

  drawRequirements();
  // A focused pair from the review queue may be excluded under default requirements.
  if (state.focus) {
    const r0 = findAlternatives(source, products, state.req, { families, extraIds: [state.focus] }).find((r) => r.candidateProductId === state.focus);
    if (r0?.classification === 'not_compatible') { state.excluded = true; exToggle.checked = true; }
    if (r0 && !state.compare.includes(state.focus) && query.get('compare') === '1') state.compare.push(state.focus);
  }
  compute();
  if (state.focus) {
    const el = document.getElementById(`cand-${state.focus}`);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    if (query.get('compare') === '1') requestAnimationFrame(showComparison);
  }
  return () => tray.remove();
}

