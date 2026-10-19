// Entry point: wires the repository, review store, router and shell together.

import { createCatalogueRepository } from './data/catalogueRepository.js';
import { createReviewStore } from './data/reviewStore.js';
import { h, clear, debounce } from './ui/dom.js';
import { toast, confirmDialog, productThumb, statusChip, emptyState } from './ui/components.js';
import { applyFilters } from './domain/search.js';
import { validateCatalogue } from './domain/validation.js';
import { isEligible } from './domain/matching.js';
import { renderCatalogue } from './ui/catalogue.js';
import { renderProductDetail } from './ui/productDetail.js';
import { renderAlternativeFinder } from './ui/alternativeFinder.js';
import { renderReviewQueue, reviewQueueItems } from './ui/reviewQueue.js';

const RECENT_KEY = 'parity.recent.v1';
const repo = createCatalogueRepository({ baseUrl: './data/' });
const reviews = createReviewStore();

const view = document.getElementById('view');
const shell = document.getElementById('shell');

// ------------------------------------------------------------- Recent items

function readRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function remember(product) {
  const ids = [product.id, ...readRecent().filter((id) => id !== product.id)].slice(0, 5);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  drawRecent();
}
async function drawRecent() {
  const list = document.getElementById('recent-list');
  const items = (await Promise.all(readRecent().map((id) => repo.getProduct(id)))).filter(Boolean);
  clear(list);
  if (!items.length) list.append(h('li', { class: 'recent-empty' }, 'Products you open appear here.'));
  for (const p of items) list.append(h('li', {}, h('a', { href: `#/product/${p.id}` }, h('span', { class: 'mono' }, p.sku), p.name)));
}

async function refreshBadges() {
  const items = await reviewQueueItems(ctx);
  document.getElementById('review-count').textContent = String(items.filter((i) => i.review.reviewStatus === 'pending' && isEligible(i.result.classification)).length);
}
reviews.subscribe(refreshBadges);

// ------------------------------------------------------------------- Router

const ROUTES = [
  { pattern: /^\/?$/, nav: 'catalogue', title: 'Catalogue', render: renderCatalogue },
  { pattern: /^\/product\/([^/]+)$/, keys: ['id'], nav: 'catalogue', title: 'Product', render: renderProductDetail },
  { pattern: /^\/alternatives(?:\/([^/]+))?$/, keys: ['id'], nav: 'alternatives', title: 'Find alternatives', render: renderAlternativeFinder },
  { pattern: /^\/review$/, nav: 'review', title: 'Review queue', render: renderReviewQueue },
];

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path: decodeURIComponent(path), query: new URLSearchParams(qs) };
}

const ctx = {
  repo,
  reviews,
  toast,
  confirm: confirmDialog,
  remember,
  refreshBadges,
  navigate: (hash) => { location.hash = hash; },
  // Updates the address bar without re-rendering, so filters and requirements are shareable.
  replaceQuery(path, params) {
    const qs = params.toString();
    history.replaceState(null, '', `#${path}${qs ? `?${qs}` : ''}`);
  },
};

let cleanup = null;
let lastPath = null;
let renderToken = 0;

async function route() {
  const { path, query } = parseHash();
  const match = ROUTES.map((r) => ({ r, m: path.match(r.pattern) })).find((x) => x.m);
  const token = ++renderToken;
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  document.querySelectorAll('dialog[open]').forEach((d) => d.close());
  shell.classList.remove('nav-open');
  document.getElementById('menu-btn').setAttribute('aria-expanded', 'false');

  for (const a of document.querySelectorAll('.nav a')) {
    if (match && a.dataset.nav === match.r.nav) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }

  clear(view);
  view.setAttribute('aria-busy', 'true');
  const pathChanged = path !== lastPath;
  lastPath = path;
  if (pathChanged) window.scrollTo(0, 0);

  if (!match) {
    view.append(emptyState({ title: 'Page not found', body: 'That address is not part of this prototype.', action: h('a', { class: 'btn btn-primary', href: '#/' }, 'Go to the catalogue') }));
    view.setAttribute('aria-busy', 'false');
    return;
  }
  const params = Object.fromEntries((match.r.keys ?? []).map((k, i) => [k, match.m[i + 1] ? decodeURIComponent(match.m[i + 1]) : undefined]));
  try {
    const holder = h('div', {});
    view.append(holder);
    const result = await match.r.render(holder, ctx, { params, query });
    if (token !== renderToken) { if (typeof result === 'function') result(); return; }
    cleanup = result ?? null;
    const heading = view.querySelector('h1');
    document.title = `${heading?.textContent ?? match.r.title} · Parity (synthetic demo)`;
    if (pathChanged && document.activeElement !== document.getElementById('global-q')) view.focus({ preventScroll: true });
  } catch (err) {
    if (token !== renderToken) return;
    clear(view);
    view.append(loadError(err));
  } finally {
    if (token === renderToken) view.setAttribute('aria-busy', 'false');
  }
}

function loadError(err) {
  const fileProtocol = location.protocol === 'file:';
  return h('div', { class: 'card card-pad error-panel', role: 'alert' },
    h('h2', {}, 'The demo data could not be loaded'),
    h('p', { style: { margin: '10px 0' } }, fileProtocol
      ? 'Browsers block fetch() for files opened directly from disk. Serve this folder with any static HTTP server, then open it in the browser:'
      : `Something went wrong: ${err.message}`),
    h('pre', {}, 'python3 -m http.server 8000\n# then open http://localhost:8000/'),
    h('button', { type: 'button', class: 'btn btn-primary', on: { click: route } }, 'Try again'));
}

window.addEventListener('hashchange', route);

// ------------------------------------------------------------ Global search

function setupSearch() {
  const form = document.getElementById('global-search');
  const input = document.getElementById('global-q');
  const list = document.getElementById('global-suggest');
  let items = [];
  let active = -1;

  const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const highlight = (i) => {
    active = i;
    [...list.children].forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    if (i >= 0) input.setAttribute('aria-activedescendant', list.children[i].id);
  };
  const go = (hash) => { close(); input.blur(); ctx.navigate(hash); };

  const suggest = debounce(async () => {
    const q = input.value.trim();
    if (!q) { close(); return; }
    const products = await repo.listProducts();
    const matches = applyFilters(products, { q });
    items = matches.slice(0, 6);
    clear(list);
    items.forEach((p, i) => list.append(h('li', {
      id: `sg-${i}`, role: 'option', 'aria-selected': 'false',
      on: { mousedown: (e) => { e.preventDefault(); go(`#/product/${p.id}`); input.value = ''; } },
    }, productThumb(p, { size: 34 }), h('div', {}, h('div', { class: 's-name' }, p.name), h('div', { class: 's-meta mono' }, p.sku)), statusChip(p))));
    list.append(h('li', {
      id: `sg-${items.length}`, role: 'option', class: 's-all', 'aria-selected': 'false',
      on: { mousedown: (e) => { e.preventDefault(); go(`#/?q=${encodeURIComponent(q)}`); } },
    }, matches.length ? `See all ${matches.length} results in the catalogue` : 'No matches — open the catalogue'));
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    active = -1;
  }, 90);

  input.addEventListener('input', suggest);
  input.addEventListener('focus', () => { if (input.value.trim()) suggest(); });
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    const n = list.children.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); highlight((active + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight((active - 1 + n) % n); }
    else if (e.key === 'Escape') { close(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (active >= 0 && active < items.length) { go(`#/product/${items[active].id}`); input.value = ''; }
    else go(q ? `#/?q=${encodeURIComponent(q)}` : '#/');
  });
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); input.focus(); input.select(); }
  });
}

// --------------------------------------------------------------- Shell bits

function setupShell() {
  const menu = document.getElementById('menu-btn');
  menu.addEventListener('click', () => {
    const open = shell.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
    if (open) document.querySelector('.nav a')?.focus();
  });
  shell.addEventListener('click', (e) => {
    if (shell.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('#menu-btn')) shell.classList.remove('nav-open');
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') shell.classList.remove('nav-open'); });

  document.getElementById('reset-demo').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Reset demo data?',
      body: 'This clears review decisions, notes and recently viewed items stored in this browser, and restores the seeded review queue. The synthetic catalogue itself is unchanged.',
      confirmLabel: 'Reset demo data',
    });
    if (!ok) return;
    reviews.reset();
    try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
    drawRecent();
    toast('Demo data reset');
    route();
  });
}

// ------------------------------------------------------------------- Start

setupShell();
setupSearch();
route();
drawRecent();
repo.load().then(async (data) => {
  refreshBadges();
  const errors = validateCatalogue(data);
  if (errors.length) console.warn(`Synthetic catalogue has ${errors.length} integrity issues`, errors);
}).catch(() => { /* the view shows the error */ });
