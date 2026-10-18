// Meanwhile smoke test: checks source/data.json and the built tiles in data/, then serves the app and drives it in
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

// 1. source/data.json is consistent
// the curated data plus anything imported from Wikidata (source/wikidata.json)
const { build, LIMITS, words, detailShard, loadSource } = await import('../build/build.mjs');
const data = loadSource();
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

// 2. the built tiles (build/build.mjs) hold exactly what each lane should show
const built = build(data);
const manifest = built.get('manifest.json');
const tilesOf = (id) => built.get(`lanes/${id}.json`).tiles;
const allTiles = () => data.scopes.flatMap(s => tilesOf(s.id));
const onDisk = JSON.parse(fs.readFileSync(path.join(APP_DIR, 'data', 'manifest.json'), 'utf8'));
check(onDisk.v === manifest.v, `data/ is up to date with source/data.json (run node build/build.mjs) — ${onDisk.v} vs ${manifest.v}`);
{
  const scopes = new Map(data.scopes.map(s => [s.id, s]));
  const chainOf = (id) => { const c = []; let x = scopes.get(id); while (x) { c.push(x.id); x = x.parent && scopes.get(x.parent); } return c; };
  let mismatch = [], oversize = [];
  for (const s of data.scopes) {
    // the roll-up rule, written out independently of the build
    const want = new Set(data.events.filter(e => {
      const ds = e.scopes.map(id => chainOf(id).indexOf(s.id)).filter(d => d >= 0);
      if (!ds.length) return false;
      const d = Math.min(...ds), era = !!(e.end || e.ongoing);
      return d === 0 || (d === 1 && e.importance <= 2 && (!era || e.importance === 1)) || (d >= 2 && e.importance === 1 && !era);
    }).map(e => e.id));
    const got = new Set();
    for (const [, , from, to, file] of tilesOf(s.id)) {
      const t = built.get(file);
      if (t.events.length > LIMITS.MAX_PER_TILE && to - from > 1) oversize.push(file);
      t.events.forEach(r => got.add(r[0]));
    }
    if (want.size !== got.size || [...want].some(id => !got.has(id))) mismatch.push(`${s.id} (${got.size}/${want.size})`);
  }
  check(!mismatch.length, 'every lane\'s tiles hold exactly its events' + (mismatch.length ? ': ' + mismatch.slice(0, 5).join(', ') : ''));
  check(!oversize.length, 'no tile over ' + LIMITS.MAX_PER_TILE + ' events' + (oversize.length ? ': ' + oversize.join(', ') : ''));
  // density: at every detail level, a screen-width of time holds a bounded number
  // of point events at or above that level (the build's count is binned, so allow 2×)
  const year = (d) => { const m = DATE.exec(d); return +m[1] + ((+m[2] || 1) - 1) / 12 + ((+m[3] || 1) - 1) / 365; };
  let worst = { n: 0 }, worstLocal = { n: 0 };
  for (const s of data.scopes) {
    const items = new Map();
    for (const [, , , , file] of tilesOf(s.id)) for (const r of built.get(file).events) if (!r[3]) items.set(r[0], { y: year(r[2]), lod: r[5] });
    const list = [...items.values()];
    for (let L = 0; L < LIMITS.LOD_COUNT; L++) {
      const w = LIMITS.SCREEN / Math.pow(2, L + LIMITS.LOD_BASE);
      const ys = list.filter(x => x.lod <= L).map(x => x.y).sort((a, b) => a - b);
      for (let i = 0, j = 0; i < ys.length; i++) { while (ys[i] - ys[j] > w) j++; if (i - j + 1 > worst.n) worst = { n: i - j + 1, scope: s.id, L }; }
      for (let i = 0, j = 0; i < ys.length; i++) { while (ys[i] - ys[j] > w / 4) j++; if (i - j + 1 > worstLocal.n) worstLocal = { n: i - j + 1, scope: s.id, L }; }
    }
  }
  check(worst.n <= 2 * LIMITS.CAP, `no screen gets crowded at any zoom (worst: ${worst.n} events in one screen, ${worst.scope} at lod ${worst.L})`);
  check(worstLocal.n <= 2 * LIMITS.LOCAL_CAP, `events don't bunch up within a screen (worst: ${worstLocal.n} in a quarter screen, ${worstLocal.scope} at lod ${worstLocal.L})`);
  const lods = new Set(); allTiles().forEach(([, , , , f]) => built.get(f).events.forEach(r => lods.add(r[5])));
  check(lods.size >= 6, `events spread over ${lods.size} detail levels`);
  const tileCount = [...built.keys()].filter(f => f.startsWith('tiles/')).length;
  check(tileCount > data.scopes.length, `${tileCount} tiles for ${data.scopes.length} lanes`);
}

// 3. the Wikidata importer turns query results into events correctly. The rows
// below are a made-up sample in the query service's format, not real data.
{
  const { convert, parseTime, importanceOf, assignPlaces } = await import('../build/wikidata.mjs');
  check(parseTime('+1574-10-03T00:00:00Z', 11).date === '1574-10-03' && parseTime('+1574-10-01T00:00:00Z', 10).date === '1574-10'
    && parseTime('-0044-01-01T00:00:00Z', 9).date === '-44' && parseTime('+1500-01-01T00:00:00Z', 7).approx === true
    && parseTime('+1500-01-01T00:00:00Z', 5) === null, 'importer reads Wikidata dates (day/month/year/century, BCE, too vague)');
  check(importanceOf(90) === 1 && importanceOf(40) === 2 && importanceOf(10) === 3, 'importer ranks by Wikipedia coverage');
  const row = (q, label, date, prec, links, more = {}) => ({ item: { value: 'http://www.wikidata.org/entity/' + q }, itemLabel: { value: label }, date: { value: date }, datePrec: { value: String(prec) }, links: { value: String(links) }, ...more });
  const rows = new Map([
    ['netherlands', [
      row('Q900001', 'Sample flood', '+1421-11-18T00:00:00Z', 11, 45, { itemDescription: { value: 'sample flood in the sample' } }),
      row('Q900002', 'Q900002', '+1600-01-01T00:00:00Z', 9, 50),                           // no English label
      row('Q900003', 'Battle of Waterloo', '+1815-06-18T00:00:00Z', 11, 120),               // already curated
      row('Q900004', 'Sample war', '+1568-01-01T00:00:00Z', 9, 95, { end: { value: '+1648-01-01T00:00:00Z' }, endPrec: { value: '9' } }),
    ]],
    ['belgium', [row('Q900004', 'Sample war', '+1568-01-01T00:00:00Z', 9, 95)]],
    ['einstein', [row('Q900005', 'Sample Prize', '+1921-01-01T00:00:00Z', 9, 60, { kind: { value: 'award' } }),
      row('Q900006', 'sample field', '+1900-01-01T00:00:00Z', 9, 60, { kind: { value: 'inception' } }),   // a field, not a work
      row('Q900007', 'sample ceremony', '+1950-01-01T00:00:00Z', 9, 60, { kind: { value: 'event' } })]],
  ]);
  const out = convert(rows, data);
  const byQ = Object.fromEntries(out.map(e => [e.wikidata, e]));
  check(out.length === 4 && !byQ.Q900002 && !byQ.Q900003 && !byQ.Q900006, `importer skips unlabelled, already-curated and concept events (${out.length} kept)`);
  check(byQ.Q900001.start === '1421-11-18' && byQ.Q900001.importance === 2 && byQ.Q900001.desc === 'Sample flood in the sample.', 'importer keeps date, importance and description');
  check(byQ.Q900004.end === '1648' && byQ.Q900004.scopes.join() === 'netherlands,belgium' && byQ.Q900004.importance === 1, 'importer merges one item found in two places, with its end date');
  check(byQ.Q900005.title === 'Albert Einstein receives the Sample Prize' && byQ.Q900005.scopes.join() === 'einstein' && byQ.Q900007.title === "Albert Einstein's sample ceremony", 'importer names awards and generic events after the person');
  const keys = new Set(['title', 'start', 'end', 'scopes', 'importance', 'desc', 'approx', 'ongoing', 'score', 'wikidata']);
  check(out.every(e => /^wd-q\d+/.test(e.id) && Object.keys(e).every(k => k === 'id' || keys.has(k))), 'imported events use the source format with stable wd- ids');
  // places are sorted into the most specific matching lanes
  const qid = (id) => data.scopes.find(s => s.id === id).wikidata;
  const locs = new Map([
    ['Q900011', [qid('amsterdam'), qid('netherlands'), qid('europe')]],   // city beats its country and continent
    ['Q900012', [qid('nigeria'), qid('africa'), qid('europe')]],          // a country beats any continent
    ['Q900013', [qid('africa'), 'Q999999999']],                           // only a continent
    ['Q900014', ['nigeria', 'kenya', 'ghana', 'egypt', 'china'].map(qid)], // too many places: world, if widely covered
    ['Q900016', [qid('africa'), qid('asia')]],                            // several continents: likewise
    ['Q900017', [qid('africa'), qid('asia')]],
  ]);
  const placed = assignPlaces(['Q900011', 'Q900012', 'Q900013', 'Q900014', 'Q900015', 'Q900016', 'Q900017']
    .map(q => row(q, 'x', '+1900-01-01T00:00:00Z', 9, q === 'Q900017' ? 20 : 90)), locs, data);
  const where = (q) => [...placed].filter(([, rs]) => rs.some(r => r.item.value.endsWith('/' + q))).map(([id]) => id).join();
  check(where('Q900011') === 'amsterdam' && where('Q900012') === 'nigeria' && where('Q900013') === 'africa' && where('Q900014') === 'world' && where('Q900015') === ''
    && where('Q900016') === 'world' && where('Q900017') === '',
    'importer puts place events in the most specific lanes');
  // …and flow through the build like curated ones
  const withImport = build({ ...data, events: [...data.events, ...out] });
  const nlTiles = withImport.get('lanes/netherlands.json').tiles.flatMap(([, , , , f]) => withImport.get(f).events.map(r => r[0]));
  const sa = withImport.get('search/sa.json') || [];
  check(nlTiles.includes('wd-q900001') && sa.some(r => r[1] === 'wd-q900001') && withImport.get(`details/${detailShard('wd-q900001')}.json`)['wd-q900001'],
    'imported events reach lane tiles, search and details');
}

// 4. the small files: manifest, lanes, people, details, search
{
  const size = JSON.stringify(manifest).length;
  check(size < 20000, `manifest stays small (${Math.round(size / 1024)} KB)`);
  check(data.scopes.every(s => built.has(`lanes/${s.id}.json`)), 'every scope has a lane file');
  const people = data.scopes.filter(s => s.type === 'person');
  const inFiles = manifest.people.flatMap(p => built.get(p.file).map(x => x.id));
  check(inFiles.length === people.length && people.every(p => inFiles.includes(p.id)), `every person is in exactly one people file (${manifest.people.length} files)`);
  const missingDetail = data.events.filter(e => !(built.get(`details/${detailShard(e.id)}.json`) || {})[e.id]);
  check(!missingDetail.length, 'every event has a details record' + (missingDetail.length ? ': ' + missingDetail[0].id : ''));
  // every event and lane can be found by each word of its title or name, using the
  // app's rule for picking a search file (searchFile in index.html)
  const findable = (b) => {
    const keys = new Set(b.get('manifest.json').search), misses = [];
    const fileFor = (w) => keys.has(w.slice(0, 2)) ? w.slice(0, 2) : w.length >= 3 && keys.has(w.slice(0, 3)) ? w.slice(0, 3) : keys.has(w + '_') ? w + '_' : null;
    const has = (w, kind, id) => { const k = fileFor(w); return k && b.get(`search/${k}.json`).some(r => r[0] === kind && r[1] === id); };
    for (const e of data.events) for (const w of words(e.title)) if (!has(w, 'e', e.id)) misses.push(`${e.id}/${w}`);
    for (const sc of data.scopes) for (const w of words(sc.name)) if (!has(w, 's', sc.id)) misses.push(`${sc.id}/${w}`);
    return misses;
  };
  const misses = findable(built);
  check(!misses.length, 'every event and lane is findable by each word' + (misses.length ? ': ' + misses.slice(0, 3).join(', ') : ''));
  const tiny = build(data, { searchMax: 20 });
  const split = tiny.get('manifest.json').search.filter(k => k.length === 3).length;
  const tinyMisses = findable(tiny);
  check(split > 0 && !tinyMisses.length, `…also when busy prefixes split into 3-letter files (${split} of them)` + (tinyMisses.length ? ': ' + tinyMisses.slice(0, 3).join(', ') : ''));
}

// 5. the app
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
  await page.waitForSelector('.lane .ev-dot', { state: 'attached', timeout: 10000 });
  return page;
}
// the view animates towards its target; wait until it has arrived
const still = page => page.waitForFunction(() => !velocity && state.start === target.start && state.end === target.end);
const span = page => page.evaluate(() => state.end - state.start);

try {
  const page = await open({ viewport: { width: 1440, height: 900 } });
  check(await page.locator('.lane').count() === 4, 'default view shows 4 lanes');
  check(await page.locator('.ev-label').count() > 20, 'event labels are drawn');
  check(await page.locator('.card').count() === 4, 'a "meanwhile" card per lane');
  check((await page.textContent('#mw-when')) === '1905', 'cursor starts at 1905');
  await page.screenshot({ path: path.join(OUT, 'desktop.png') });
  const tilesLoaded = await page.evaluate(() => [...tileState.values()].filter(v => v === 'done').length);
  const tilesTotal = allTiles().length;
  check(tilesLoaded > 0 && tilesLoaded < tilesTotal / 10, `default view loads only the tiles it needs (${tilesLoaded} of ${tilesTotal})`);

  // roll-up: Nigeria's independence (tagged only with Nigeria) shows in the Africa lane only with
  // sub-regions on. Africa is busy around 1960, so it only appears when zoomed in to a few years.
  await page.evaluate(() => setRange(1957, 1963, true, true));
  await page.waitForTimeout(700);
  const nigeria = data.events.find(e => e.title === 'Nigeria becomes independent').id;
  const inAfrica = () => page.locator(`.lane:nth-child(4) [data-id="${nigeria}"]`).count();
  check(await inAfrica() > 0, 'child-country event rolls up into the Africa lane');
  await page.locator('.lane:nth-child(4) [data-rollup]').uncheck();
  await page.waitForTimeout(100);
  check(await inAfrica() === 0, 'turning off "Include sub-regions" hides it');
  await page.locator('.lane:nth-child(4) [data-rollup]').check();
  await page.evaluate(() => { setRange(1850, 1970, true, true); state.cursor = 1905; requestRender(); });
  await page.waitForTimeout(700);

  // select an event
  await page.locator('.ev-label', { hasText: "Einstein's annus mirabilis" }).click();
  check(await page.locator('#detail.open h2').textContent() === "Einstein's annus mirabilis", 'clicking an event opens its details');
  check(await page.locator('#detail button.row').count() > 0, 'details list what else happened within a year');
  await page.waitForFunction(() => location.hash.includes('e=einsteins-annus-mirabilis'), null, { timeout: 3000 }).catch(() => {});
  check(page.url().includes('e=einsteins-annus-mirabilis'), 'selection is saved in the URL');
  await page.screenshot({ path: path.join(OUT, 'desktop-detail.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // zoom and pan
  const box = await page.locator('.lane:nth-child(2) .track').boundingBox();
  const s0 = await span(page);
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.wheel(0, -400);
  await still(page);
  check(await span(page) < s0, 'scrolling the wheel zooms in');
  const st0 = await page.evaluate(() => state.start);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 200, box.y + 40, { steps: 5 });
  await page.mouse.up();
  await still(page);
  check(await page.evaluate(() => state.start) > st0, 'dragging pans the timeline');
  // smoothness: while panning, labels keep their rows and lanes keep their height
  const snap = () => page.evaluate(() => {
    const rows = {}, heights = [...document.querySelectorAll('.lane')].map(l => l.style.height);
    document.querySelectorAll('.ev-label').forEach(l => { rows[l.dataset.id] = l.style.top; });
    return { rows, heights };
  });
  await page.waitForTimeout(400); // lane heights settle ~120ms after the view stops
  const before = await snap();
  await page.evaluate(() => { window.__frames = []; let last = performance.now(); const f = (t) => { window.__frames.push(t - last); last = t; if (window.__frames.length < 400) requestAnimationFrame(f); }; requestAnimationFrame(f); return 0; });
  await page.mouse.move(box.x + box.width * 0.8, box.y + 40);
  await page.mouse.down();
  let moved = 0;
  for (let k = 0; k < 30; k++) { await page.mouse.move(box.x + box.width * 0.8 - k * 15, box.y + 40); const now = await snap(); moved += Object.keys(now.rows).filter(id => id in before.rows && now.rows[id] !== before.rows[id]).length + now.heights.filter((h, i) => h !== before.heights[i]).length; }
  await page.mouse.up();
  check(moved === 0, `panning keeps every label on its row and every lane at its height (${moved} changes)`);
  const frames = await page.evaluate(() => window.__frames.slice(2));
  const slow = frames.filter(f => f > 50).length;
  console.log(`  frames during drag: ${frames.length}, median ${frames.sort((a, b) => a - b)[frames.length >> 1].toFixed(1)}ms, >50ms: ${slow}`);
  await still(page);
  await page.locator('#presets [data-preset="10"]').click();
  await still(page);
  check(Math.abs(await span(page) - 10) < 0.01, 'Decade preset shows 10 years');

  // the lane picker: suggestions, browsing and search
  await page.click('#add-lane');
  check(await page.locator('#pk-list .pk-card:visible').count() >= 10, 'picker opens with suggestions to browse');
  await page.screenshot({ path: path.join(OUT, 'picker.png') });
  await page.locator('#pk-tabs [data-tab="people"]').click();
  await page.waitForFunction(() => !document.querySelector('#pk-list .pk-empty'), null, { timeout: 5000 }).catch(() => {});
  const people = data.scopes.filter(s => s.type === 'person').length;
  check(await page.locator('#pk-list .pk-card').count() === people, `People tab lists all ${people} people`);
  await page.locator('#pk-tabs [data-tab="places"]').click();
  check(await page.locator('#pk-list [data-toggle="amsterdam"]').count() === 1, 'Places tab includes cities');
  await page.locator('#pk-search').pressSequentially('fra');
  check(await page.locator('#pk-list [data-toggle="france"]:visible').count() === 1, 'typing "fra" shows France');
  await page.locator('#pk-search').fill('');
  await page.locator('#pk-search').pressSequentially('darw');
  await page.waitForSelector('#pk-list [data-toggle="darwin"]', { timeout: 5000 }).catch(() => {});
  const listBox = await page.locator('#pk-list').boundingBox();
  check(listBox && listBox.height > 250, `results area has room (${listBox && Math.round(listBox.height)}px tall)`);
  await page.keyboard.press('Enter');
  check(await page.locator('#pk-list [data-toggle="darwin"][aria-pressed="true"]').count() === 1, 'Enter adds the first result');
  await page.locator('#pk-search').fill('plague');
  await page.waitForFunction(() => document.querySelectorAll('#pk-list .pk-card').length > 0, null, { timeout: 5000 }).catch(() => {});
  check(await page.locator('#pk-list .pk-card').count() > 0, 'searching an event word ("plague") suggests lanes');
  await page.screenshot({ path: path.join(OUT, 'picker-search.png') });
  await page.click('#pk-done');
  check(await page.locator('.lane').count() === 5, 'adding a lane from the picker');

  // search jumps to an event
  await page.fill('#search-input', 'Fall of the Berlin Wall');
  await page.keyboard.press('Enter'); // straight away, before the search file has arrived
  await page.waitForSelector('#detail.open h2', { timeout: 5000 }).catch(() => {});
  check((await page.locator('#detail.open h2').textContent()) === 'Fall of the Berlin Wall', 'search jumps to an event');

  // tiles that arrive while panning never move labels that were already placed.
  // Today's data fits in one tile per detail band, so serve a build with tiny
  // tiles (8 events) to make panning fetch new periods, as it will with big data.
  {
    const small = build(data, { maxPerTile: 8 });
    const p3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    p3.on('pageerror', e => errors.push(e.message));
    await p3.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p3.route(/\/data\//, (r) => {
      const v = small.get(new URL(r.request().url()).pathname.split('/data/')[1]);
      return v ? r.fulfill({ contentType: 'application/json', body: JSON.stringify(v) }) : r.fulfill({ status: 404, body: '' });
    });
    await p3.goto(BASE + '#lanes=europe,world&from=1700&to=1760&at=1730');
    await p3.waitForSelector('.lane .ev-dot', { state: 'attached' });
    await p3.waitForTimeout(800);
    const rows = () => p3.evaluate(() => { const o = {}; document.querySelectorAll('.ev-label').forEach(l => { o[l.dataset.id] = l.style.top; }); return o; });
    const before = await rows();
    const n0 = await p3.evaluate(() => tileState.size);
    await p3.evaluate(() => { setRange(1300, 1360, true, true); });
    await p3.waitForTimeout(800);
    await p3.evaluate(() => { setRange(1700, 1760, true, true); });
    await p3.waitForTimeout(800);
    const after = await rows();
    const n1 = await p3.evaluate(() => tileState.size);
    const moved = Object.keys(before).filter(id => id in after && after[id] !== before[id]);
    check(n1 > n0, `panning to another period loads more tiles (${n0} → ${n1})`);
    check(!moved.length, `labels keep their rows when new tiles arrive (${moved.length} moved)`);
    await p3.close();
  }

  // a shared link to an event outside your lanes still opens it, with its description
  {
    const p4 = await open({ viewport: { width: 1440, height: 900 } }, '#lanes=netherlands&from=1960&to=1980&at=1969&e=apollo-11-moon-landing');
    await p4.waitForSelector('#detail.open h2', { timeout: 8000 }).catch(() => {});
    check((await p4.locator('#detail.open h2').textContent().catch(() => '')) === 'Apollo 11 Moon landing', 'shared link opens an event whose tile isn\'t loaded');
    await p4.goto(BASE + '#lanes=netherlands&from=1910&to=1925&at=1918.86&e=kaiser-wilhelm-ii-flees-to-the-netherlands');
    await p4.waitForFunction(() => (document.querySelector('#detail.open p') || {}).textContent?.includes('Huis Doorn'), null, { timeout: 8000 }).catch(() => {});
    check(((await p4.locator('#detail.open p').first().textContent().catch(() => '')) || '').includes('Huis Doorn'), 'event description is fetched when the event opens');
    await p4.close();
  }

  // shared link restores the view
  const p2 = await open({ viewport: { width: 1280, height: 800 } }, '#lanes=darwin,lincoln&from=1800&to=1890&at=1809.1');
  check(await p2.locator('.lane').count() === 2, 'share link restores lanes');
  check((await p2.textContent('#range-label')).startsWith('1800'), 'share link restores the range');
  await p2.click('#zoom-out'); await p2.click('#zoom-out'); await p2.click('#zoom-out'); await p2.click('#zoom-out');
  await p2.click('#zoom-out'); await p2.click('#zoom-out'); await p2.click('#zoom-out');
  await still(p2);
  check((await span(p2)) > 3000, 'zooms out to thousands of years');
  await p2.goto(BASE + '#lanes=italy,china,egypt&from=-300&to=300&at=-44');
  await p2.waitForFunction(() => state.cursor === -44);
  await p2.waitForTimeout(100);
  check((await p2.textContent('#mw-when')) === '44 BCE', 'BCE years display correctly');
  await p2.screenshot({ path: path.join(OUT, 'ancient.png') });

  // one light theme only, even on a device set to dark mode
  const pd = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await pd.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await pd.goto(BASE); await pd.waitForSelector('.lane .ev-dot', { state: 'attached' });
  const bg = await pd.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check(bg === 'rgb(251, 250, 246)', `light background even when the device prefers dark (${bg})`);
  check(await pd.locator('#theme-btn').count() === 0, 'no dark-mode toggle');

  // phone
  const ph = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const scrollW = await ph.evaluate(() => document.documentElement.scrollWidth);
  check(scrollW <= 390, `no horizontal scroll at 390px (scrollWidth ${scrollW})`);
  await ph.screenshot({ path: path.join(OUT, 'phone.png'), fullPage: true });
  // lane names on a phone are coloured tags with dark or white text, not grey on grey
  const tag = await ph.evaluate(() => { const el = document.querySelector('.lane:nth-child(2) .mobile-name'); const cs = getComputedStyle(el); return { bg: cs.backgroundColor, fg: cs.color, op: cs.opacity }; });
  check(tag.bg === 'rgb(242, 96, 63)' && tag.fg === 'rgb(17, 17, 17)' && tag.op === '1', `phone lane name is readable (${tag.fg} on ${tag.bg})`);
  await ph.locator('.lane:nth-child(2) .ev-label:visible').first().tap();
  await ph.waitForSelector('#detail.open', { timeout: 3000 }).catch(() => {});
  check(await ph.locator('#detail.open').count() === 1, 'tapping an event opens the details sheet on a phone');
  await ph.screenshot({ path: path.join(OUT, 'phone-detail.png') });
  await ph.keyboard.press('Escape');
  await ph.waitForTimeout(300);
  await ph.locator('#add-lane').tap();
  check(await ph.locator('#pk-list .pk-card:visible').count() >= 6, 'picker works on a phone');
  await ph.screenshot({ path: path.join(OUT, 'phone-picker.png') });

  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
} catch (e) {
  console.error(e); failures++;
} finally {
  await browser.close(); server.close();
}
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
