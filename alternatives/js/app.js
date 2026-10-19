// Entry point: wires the repository and the router together.

import { createCatalogueRepository } from './data/catalogueRepository.js';
import { h, clear } from './ui/dom.js';
import { emptyState } from './ui/components.js';
import { validateCatalogue } from './domain/validation.js';
import { renderCatalogue } from './ui/catalogue.js';
import { renderProductDetail } from './ui/productDetail.js';
import { closeProductDialog } from './ui/productDialog.js';

const repo = createCatalogueRepository({ baseUrl: './data/' });
const view = document.getElementById('view');

const ROUTES = [
  { pattern: /^\/?$/, title: 'Find an alternative', render: renderCatalogue },
  { pattern: /^\/product\/([^/]+)$/, keys: ['id'], title: 'Product', render: renderProductDetail },
];

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path: decodeURIComponent(path), query: new URLSearchParams(qs) };
}

let catalogueHash = '#/';

const ctx = {
  repo,
  navigate: (hash) => { location.hash = hash; },
  // Updates the address bar without re-rendering, so a filtered view can be shared and returned to.
  replaceQuery(path, params) {
    const qs = params.toString();
    const hash = `#${path}${qs ? `?${qs}` : ''}`;
    history.replaceState(null, '', hash);
    if (path === '/') catalogueHash = hash;
  },
  lastCatalogueHash: () => catalogueHash,
};

let renderToken = 0;
let lastPath = null;

async function route() {
  const { path, query } = parseHash();
  const match = ROUTES.map((r) => ({ r, m: path.match(r.pattern) })).find((x) => x.m);
  const token = ++renderToken;
  if (match?.r.render === renderCatalogue) catalogueHash = location.hash || '#/';

  closeProductDialog();
  clear(view);
  view.setAttribute('aria-busy', 'true');
  if (path !== lastPath) window.scrollTo(0, 0);
  const pathChanged = path !== lastPath;
  lastPath = path;

  if (!match) {
    view.append(emptyState({ title: 'Page not found', body: 'That address is not part of this prototype.', action: h('a', { class: 'btn', href: '#/' }, 'Go to search') }));
    view.setAttribute('aria-busy', 'false');
    return;
  }
  const params = Object.fromEntries((match.r.keys ?? []).map((k, i) => [k, decodeURIComponent(match.m[i + 1])]));
  try {
    const holder = h('div', {});
    view.append(holder);
    await match.r.render(holder, ctx, { params, query });
    if (token !== renderToken) return;
    document.title = `${view.querySelector('h1')?.textContent ?? match.r.title} · Parity (synthetic demo)`;
    if (pathChanged && match.r.render !== renderCatalogue) view.focus({ preventScroll: true });
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
  return h('div', { class: 'card error-panel', role: 'alert' },
    h('h2', {}, 'The demo data could not be loaded'),
    h('p', { style: { margin: '10px 0' } }, fileProtocol
      ? 'Browsers block fetch() for files opened directly from disk. Serve this folder with any static HTTP server, then open it in the browser:'
      : `Something went wrong: ${err.message}`),
    h('pre', {}, 'python3 -m http.server 8000\n# then open http://localhost:8000/'),
    h('button', { type: 'button', class: 'btn', on: { click: route } }, 'Try again'));
}

window.addEventListener('hashchange', route);
route();
repo.load().then((data) => {
  const errors = validateCatalogue(data);
  if (errors.length) console.warn(`Synthetic catalogue has ${errors.length} integrity issues`, errors);
}).catch(() => { /* the view shows the error */ });
