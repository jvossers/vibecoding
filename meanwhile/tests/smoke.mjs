// Meanwhile smoke test: checks data.json, then serves the app and drives it in
// headless Chromium (desktop and phone). Screenshots land in tests/out/.
//
//   cd tests && npm install && npm test
//
// Env: PLAYWRIGHT_CHROMIUM (path to a Chromium binary, e.g. /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.join(here, '..');
const OUT = path.join(here, 'out');
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failures++; };

// 1. data.json is consistent
const data = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'data.json'), 'utf8'));
const scopeIds = new Set(data.scopes.map(s => s.id));
const DATE = /^(-?\d+)(?:-(\d\d))?(?:-(\d\d))?$/;
const num = s => { const m = DATE.exec(s); return m ? +m[1] + ((+m[2] || 1) - 1) / 12 + ((+m[3] || 1) - 1) / 365 : NaN; };
check(data.scopes.every(s => !s.parent || scopeIds.has(s.parent)), 'every scope parent exists');
check(data.scopes.filter(s => s.type === 'person').every(s => !isNaN(num(s.born)) && !isNaN(num(s.died))), 'every person has born/died dates');
check(new Set(data.events.map(e => e.id)).size === data.events.length, `event ids are unique (${data.events.length} events)`);
const badScope = data.events.filter(e => !e.scopes.length || e.scopes.some(s => !scopeIds.has(s)));
check(!badScope.length, 'every event scope exists' + (badScope.length ? ': ' + badScope.map(e => e.id).join(', ') : ''));
const badDate = data.events.filter(e => isNaN(num(e.start)) || (e.end && (isNaN(num(e.end)) || num(e.end) < num(e.start))));
check(!badDate.length, 'every event date parses and ends after it starts' + (badDate.length ? ': ' + badDate.map(e => e.id).join(', ') : ''));
check(data.events.every(e => [1, 2, 3].includes(e.importance)), 'importance is 1, 2 or 3');

// 2. the app
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(APP_DIR, p);
  if (!file.startsWith(APP_DIR) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
const errors = [];
async function open(opts, hash = '') {
  const page = await browser.newPage(opts);
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(BASE + hash);
  await page.waitForSelector('.lane .ev-dot', { timeout: 10000 });
  return page;
}
const span = page => page.evaluate(() => state.end - state.start);

try {
  const page = await open({ viewport: { width: 1440, height: 900 } });
  check(await page.locator('.lane').count() === 4, 'default view shows 4 lanes');
  check(await page.locator('.ev-label').count() > 20, 'event labels are drawn');
  check(await page.locator('.card').count() === 4, 'a "meanwhile" card per lane');
  check((await page.textContent('#mw-when')) === '1905', 'cursor starts at 1905');
  await page.screenshot({ path: path.join(OUT, 'desktop.png') });

  // roll-up: Nigeria's independence (tagged only with Nigeria) shows in the Africa lane only with sub-regions on
  const ghana = data.events.find(e => e.title === 'Nigeria becomes independent').id;
  const inAfrica = () => page.locator(`.lane:nth-child(4) [data-id="${ghana}"]`).count();
  check(await inAfrica() > 0, 'child-country event rolls up into the Africa lane');
  await page.locator('.lane:nth-child(4) [data-rollup]').uncheck();
  await page.waitForTimeout(100);
  check(await inAfrica() === 0, 'turning off "Include sub-regions" hides it');
  await page.locator('.lane:nth-child(4) [data-rollup]').check();
  await page.waitForTimeout(100);

  // select an event
  await page.locator('.ev-label', { hasText: "Einstein's annus mirabilis" }).click();
  check(await page.locator('#detail.open h2').textContent() === "Einstein's annus mirabilis", 'clicking an event opens its details');
  check(await page.locator('#detail button.row').count() > 0, 'details list what else happened within a year');
  await page.waitForTimeout(250);
  check(page.url().includes('e=einsteins-annus-mirabilis'), 'selection is saved in the URL');
  await page.screenshot({ path: path.join(OUT, 'desktop-detail.png') });
  await page.keyboard.press('Escape');

  // zoom and pan
  const box = await page.locator('.lane:nth-child(2) .track').boundingBox();
  const s0 = await span(page);
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(100);
  check(await span(page) < s0, 'scrolling the wheel zooms in');
  const st0 = await page.evaluate(() => state.start);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 200, box.y + 40, { steps: 5 });
  await page.mouse.up();
  check(await page.evaluate(() => state.start) > st0, 'dragging pans the timeline');
  await page.locator('#presets [data-preset="10"]').click();
  check(Math.abs(await span(page) - 10) < 0.01, 'Decade preset shows 10 years');

  // add a lane from the picker
  await page.click('#add-lane');
  await page.fill('#pk-search', 'darwin');
  await page.locator('#pk-list [data-scope="darwin"]').check();
  await page.click('#pk-done');
  check(await page.locator('.lane').count() === 5, 'adding a lane from the picker');

  // search jumps to an event
  await page.fill('#search-input', 'Fall of the Berlin Wall');
  await page.keyboard.press('Enter');
  check((await page.locator('#detail.open h2').textContent()) === 'Fall of the Berlin Wall', 'search jumps to an event');

  // shared link restores the view
  const p2 = await open({ viewport: { width: 1280, height: 800 } }, '#lanes=darwin,lincoln&from=1800&to=1890&at=1809.1');
  check(await p2.locator('.lane').count() === 2, 'share link restores lanes');
  check((await p2.textContent('#range-label')).startsWith('1800'), 'share link restores the range');
  await p2.click('#zoom-out'); await p2.click('#zoom-out'); await p2.click('#zoom-out'); await p2.click('#zoom-out');
  await p2.click('#zoom-out'); await p2.click('#zoom-out'); await p2.click('#zoom-out');
  check((await span(p2)) > 3000, 'zooms out to thousands of years');
  await p2.goto(BASE + '#lanes=italy,china,egypt&from=-300&to=300&at=-44');
  await p2.waitForFunction(() => state.cursor === -44);
  await p2.waitForTimeout(100);
  check((await p2.textContent('#mw-when')) === '44 BCE', 'BCE years display correctly');
  await p2.screenshot({ path: path.join(OUT, 'ancient.png') });

  // phone
  const ph = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const scrollW = await ph.evaluate(() => document.documentElement.scrollWidth);
  check(scrollW <= 390, `no horizontal scroll at 390px (scrollWidth ${scrollW})`);
  await ph.screenshot({ path: path.join(OUT, 'phone.png'), fullPage: true });
  await ph.locator('.lane:nth-child(2) .ev-label').first().tap();
  await ph.waitForSelector('#detail.open', { timeout: 3000 }).catch(() => {});
  check(await ph.locator('#detail.open').count() === 1, 'tapping an event opens the details sheet on a phone');
  await ph.screenshot({ path: path.join(OUT, 'phone-detail.png') });

  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} catch (e) {
  console.error(e); failures++;
} finally {
  await browser.close(); server.close();
}
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
