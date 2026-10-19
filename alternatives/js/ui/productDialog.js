// Product dialog opened from the search results. Two tabs keep it free of vertical scrolling:
// "Alternatives" (shown first) and "Product details" (description and specifications).
// Clicking an alternative shows that product in the same dialog, with a way back.

import { h, clear, append } from './dom.js';
import { icon, productThumb, skuTag } from './components.js';
import { CATEGORY_LABELS } from '../domain/attributes.js';
import { rulesFor } from '../domain/matching.js';
import { exportPdf } from './exportSheet.js';
import { alternativesView, specGroups, noAlternativesNote, priceLine, alternativesChip } from './productParts.js';

let current = null; // the open dialog, if any

// Opens (or reuses) the dialog for a product. `onChange(id|null)` reports the product shown,
// or null when the dialog closes, so the caller can keep the URL in step.
export async function openProductDialog(ctx, productId, { onChange = () => {} } = {}) {
  if (!current) current = createDialog(onChange);
  current.history = [];
  await current.show(ctx, productId);
}

function createDialog(onChange) {
  const dlg = h('dialog', { class: 'pd', 'aria-labelledby': 'pd-title' });
  const state = { history: [], productId: null, tab: 'alternatives', silent: false };

  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    dlg.remove();
    current = null;
    if (!state.silent) onChange(null);
  });
  document.body.append(dlg);

  async function show(ctx, id, { pushHistory = false } = {}) {
    const product = await ctx.repo.getProduct(id);
    if (!product) return;
    if (pushHistory && state.productId) state.history.push(state.productId);
    const [families, alternatives] = await Promise.all([ctx.repo.familiesById(), ctx.repo.alternativesFor(product.id)]);
    const rules = rulesFor(product.category);
    const hasAlternatives = rules.length > 0;
    state.productId = product.id;
    state.tab = hasAlternatives ? 'alternatives' : 'details';
    onChange(product.id);
    render({ ctx, product, families, alternatives, rules, hasAlternatives });
    if (!dlg.open) dlg.showModal();
    dlg.querySelector('.pd-close').focus();
  }

  function render({ ctx, product, families, alternatives, rules, hasAlternatives }) {
    clear(dlg);
    const previous = state.history.at(-1);
    const back = previous
      ? h('button', {
        type: 'button', class: 'link-btn pd-back',
        on: { click: () => { state.history.pop(); show(ctx, previous); } },
      }, icon('arrow-left'), 'Back to the previous product')
      : null;

    const header = h('header', { class: 'pd-head' },
      productThumb(product, { size: 96, label: true }),
      h('div', { class: 'pd-title-block' },
        back,
        h('div', { class: 'eyebrow' }, `${product.family} · ${CATEGORY_LABELS[product.category]}`),
        h('h2', { id: 'pd-title' }, product.name),
        h('div', { class: 'meta' }, skuTag(product.sku, { copy: true }), priceLine(product), alternativesChip(product, alternatives))),
      h('div', { class: 'pd-actions' },
        hasAlternatives
          ? h('button', { type: 'button', class: 'btn btn-primary', on: { click: () => exportPdf({ product, alternatives, families, rules }) } }, icon('download'), 'Export PDF')
          : null,
        h('button', { type: 'button', class: 'pd-close', 'aria-label': 'Close', on: { click: () => dlg.close() } }, icon('x'))));

    // ---- Tab panels
    const openAlternative = (p, e) => { e.preventDefault(); show(ctx, p.id, { pushHistory: true }); };
    const panels = {
      alternatives: hasAlternatives
        ? h('div', { class: 'pd-alternatives' }, alternativesView({ product, alternatives, rules, onOpen: openAlternative }))
        : null,
      details: h('div', { class: 'pd-details' },
        h('p', { class: 'pd-desc' }, product.description),
        h('div', { class: 'spec-grid pd-specs' }, specGroups(product, families)),
        hasAlternatives ? null : noAlternativesNote(product)),
    };
    const labels = {
      alternatives: ['Alternatives', h('span', { class: 'n' }, String(alternatives.length))],
      details: ['Product details'],
    };
    const keys = Object.keys(panels).filter((k) => panels[k]);

    const tabs = keys.map((k) => h('button', {
      type: 'button', role: 'tab', class: 'pd-tab', id: `pd-tab-${k}`,
      'aria-controls': `pd-panel-${k}`, 'aria-selected': String(state.tab === k), tabindex: state.tab === k ? '0' : '-1',
      on: { click: () => select(k) },
    }, labels[k]));
    const tablist = h('div', { class: 'pd-tabs', role: 'tablist', 'aria-label': 'Product information' }, tabs);
    tablist.addEventListener('keydown', (e) => {
      const i = keys.indexOf(state.tab);
      const next = { ArrowRight: keys[(i + 1) % keys.length], ArrowLeft: keys[(i - 1 + keys.length) % keys.length], Home: keys[0], End: keys.at(-1) }[e.key];
      if (next) { e.preventDefault(); select(next); tabs[keys.indexOf(next)].focus(); }
    });
    const panelEls = keys.map((k) => h('section', {
      class: 'pd-panel', role: 'tabpanel', id: `pd-panel-${k}`, 'aria-labelledby': `pd-tab-${k}`, hidden: state.tab !== k, tabindex: '0',
    }, panels[k]));

    function select(k) {
      state.tab = k;
      keys.forEach((key, i) => {
        tabs[i].setAttribute('aria-selected', String(key === k));
        tabs[i].tabIndex = key === k ? 0 : -1;
        panelEls[i].hidden = key !== k;
      });
    }

    append(dlg, header, tablist, h('div', { class: 'pd-body' }, panelEls));
  }

  return {
    get history() { return state.history; },
    set history(v) { state.history = v; },
    show,
    // Closing because the page is changing: don't report back, the URL is already moving on.
    closeSilently: () => { state.silent = true; dlg.close(); },
  };
}

export function closeProductDialog() {
  current?.closeSilently();
}
