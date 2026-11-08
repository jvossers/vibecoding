// One-page slide for IT: how Parity goes from proof of concept to a Teams tab.
// Opened from the (i) button in the top bar (#/rollout). Prints as one A4 landscape page.

import { h, append, trustedSvg } from './dom.js';
import { icon } from './components.js';
import { formatNumber } from '../domain/attributes.js';

const svg = (paths) => trustedSvg(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`);

const STEP_ICONS = {
  export: svg('<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6"/>'),
  convert: svg('<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4"/>'),
  embed: svg('<path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5z"/><path d="M14 3.5V8h4.5M10 12l-2 2 2 2M14 12l2 2-2 2"/>'),
  publish: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9h17M8 4.5V9"/><path d="M12 17v-5M9.6 14.4 12 12l2.4 2.4"/>'),
};

const NOT_NEEDED = [
  'Web servers, app services or containers',
  'A database',
  'Integration with live systems or APIs',
  'Logins or user management: whoever can see the Teams channel can use it',
  'Third-party libraries, CDNs or licences',
  'Installs on desktops or phones',
];

export async function renderRollout(root, ctx) {
  const products = await ctx.repo.listProducts();
  const standalone = Boolean(document.getElementById('parity-data'));

  const steps = [
    { key: 'export', title: 'Export', body: 'Take the product catalogue from the system that already holds it (PIM or ERP) as CSV, Excel or JSON.' },
    { key: 'convert', title: 'Convert', body: 'A short script maps those columns to Parity’s product format. Built-in checks reject missing or inconsistent records.' },
    { key: 'embed', title: 'Embed', body: 'One build command packs the code, styles and catalogue into a single HTML file. No dependencies.' },
    { key: 'publish', title: 'Publish', body: 'Put the file in a Microsoft 365 location the team can reach and pin it as a Website tab in the Teams channel.' },
  ];

  const slide = h('article', { class: 'slide', 'aria-labelledby': 'slide-title' },
    h('header', { class: 'slide-head' },
      h('div', { class: 'eyebrow' }, 'For IT · Rolling out Parity'),
      h('h1', { id: 'slide-title' }, 'Rolling out Parity is one file, not a project'),
      h('p', { class: 'slide-lede' },
        'Parity is a static web page. Search, matching and the PDF export all run in the browser, so production is the same page with the real catalogue embedded in it. There is nothing to host, run or maintain.')),

    h('ol', { class: 'slide-steps' }, steps.map((s, i) => h('li', { class: 'slide-step' },
      h('div', { class: 'slide-step-top' },
        h('span', { class: 'slide-step-icon' }, STEP_ICONS[s.key]),
        h('span', { class: 'slide-step-n' }, `Step ${i + 1}`)),
      h('h2', {}, s.title),
      h('p', {}, s.body)))),

    h('div', { class: 'slide-file' },
      h('code', { class: 'slide-file-name' }, 'parity.html'),
      h('span', { class: 'slide-file-parts' },
        h('span', {}, 'App code'), h('span', { class: 'plus' }, '+'),
        h('span', {}, 'Styles'), h('span', { class: 'plus' }, '+'),
        h('span', {}, `Catalogue (${formatNumber(products.length)} products today)`)),
      h('span', { class: 'slide-file-note' }, 'One self-contained file. Works in Teams, in any browser, and offline.')),

    h('div', { class: 'slide-cols' },
      h('section', { class: 'slide-col slide-col-no', 'aria-labelledby': 'slide-no' },
        h('h2', { id: 'slide-no' }, 'What IT doesn’t need to provide'),
        h('ul', {}, NOT_NEEDED.map((t) => h('li', {}, icon('x'), t)))),
      h('section', { class: 'slide-col slide-col-yes', 'aria-labelledby': 'slide-yes' },
        h('h2', { id: 'slide-yes' }, 'Why it’s low-risk'),
        h('ul', {},
          h('li', {}, icon('check'), h('span', {}, h('b', {}, 'Read-only. '), 'It stores nothing and collects no user data.')),
          h('li', {}, icon('check'), h('span', {}, h('b', {}, 'No network calls. '), 'The file’s Content-Security-Policy blocks every outside request, so data can’t leave it.')),
          h('li', {}, icon('check'), h('span', {}, h('b', {}, 'Access stays in Microsoft 365. '), 'The file inherits the permissions of the team or site it lives in.')),
          h('li', {}, icon('check'), h('span', {}, h('b', {}, 'Small and auditable. '), 'About 1,400 lines of plain JavaScript that a developer can review in an afternoon.')),
          h('li', {}, icon('check'), h('span', {}, h('b', {}, 'Updates take minutes. '), 'New prices or products: export, run the script, replace the file.'))))),

    h('p', { class: 'slide-foot' },
      'Where the file lives is IT’s choice: a SharePoint site library or a free-tier static web app both work. Some tenants set SharePoint to download HTML files rather than display them; if so, the static web app is the simpler home.'));

  const actions = h('div', { class: 'slide-actions' },
    h('a', { class: 'back', href: ctx.lastCatalogueHash() }, icon('arrow-left'), 'Back to search'),
    h('span', { class: 'slide-actions-right' },
      standalone
        ? h('span', { class: 'chip chip-match' }, icon('check'), 'You are viewing the single-file build')
        : h('a', { class: 'btn', href: 'standalone/parity.html', download: 'parity.html' }, icon('download'), 'Download the single-file build'),
      h('button', { type: 'button', class: 'btn btn-primary', on: { click: () => window.print() } }, 'Print or save as PDF')));

  document.body.classList.add('route-rollout');
  const cleanup = () => {
    if (!location.hash.startsWith('#/rollout')) {
      document.body.classList.remove('route-rollout');
      window.removeEventListener('hashchange', cleanup);
    }
  };
  window.addEventListener('hashchange', cleanup);

  append(root, actions, slide);
}
