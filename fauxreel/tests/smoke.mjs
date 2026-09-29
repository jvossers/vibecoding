// Faux Reel smoke test: serves the app, drives it in headless Chromium, and checks
// that it loads cleanly, every app/phone/theme renders, the library is valid,
// share links work and a real GIF exports. Screenshots land in tests/out/.
//
//   cd tests && npm install && npm test
//
// Env: APP_DIR (folder with index.html; default ../web if it exists, else ..),
//      PLAYWRIGHT_CHROMIUM (path to a Chromium binary, e.g. /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = process.env.APP_DIR
  || (fs.existsSync(path.join(here, '..', 'web', 'index.html')) ? path.join(here, '..', 'web') : path.join(here, '..'));
const OUT = path.join(here, 'out');
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
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

let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failures++; };

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
// Fonts and CDNs may be blocked in sandboxes; don't let them hang the test.
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());

try {
  // 1. Loads cleanly at phone width
  await page.goto(BASE);
  await page.waitForFunction(() => typeof scene !== 'undefined' && scene && scene.msgs.length > 0, null, { timeout: 10000 });
  await page.screenshot({ path: path.join(OUT, 'home.png') });
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  check(scrollW <= 390, `no horizontal scroll at 390px (scrollWidth ${scrollW})`);

  // 2. Every app × phone × theme renders a non-blank frame, both framings
  const apps = await page.evaluate(() => Object.keys(APPS));
  const bad = await page.evaluate(apps => {
    const out = [];
    for (const app of apps) for (const device of ['ios', 'android']) for (const theme of ['light', 'dark']) for (const frame of ['none', 'phone']) {
      Object.assign(state, { app, device, theme, frame });
      rebuild(false);
      const S = scene, { w, h } = canvasSize(S), c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      for (const t of [0, S.chatEnd * 0.6, S.chatEnd, S.duration]) drawFrame(ctx, S, t);
      const px = ctx.getImageData(0, 0, w, h).data;
      let distinct = new Set();
      for (let i = 0; i < px.length; i += 4 * 97) distinct.add(px[i] << 16 | px[i + 1] << 8 | px[i + 2]);
      if (distinct.size < 8) out.push(`${app}/${device}/${theme}/${frame}`);
    }
    return out;
  }, apps);
  check(bad.length === 0, `${apps.length} apps × 2 phones × 2 themes × 2 framings render${bad.length ? ': blank ' + bad.join(', ') : ''}`);

  // Screenshot one mid-chat frame per app for eyeballing
  for (const app of apps) {
    const png = await page.evaluate(app => {
      Object.assign(state, { app, device: 'ios', theme: 'light', frame: 'none' });
      rebuild(false);
      const S = scene, c = document.createElement('canvas');
      c.width = S.W * 1.5; c.height = S.H * 1.5;
      const ctx = c.getContext('2d'); ctx.scale(1.5, 1.5);
      drawFrame(ctx, S, S.chatEnd * 0.7);
      return c.toDataURL('image/png');
    }, app);
    fs.writeFileSync(path.join(OUT, `app-${app}.png`), Buffer.from(png.split(',')[1], 'base64'));
  }

  // 3. Library: every chat is valid
  await page.click('[data-tab=script]');
  await page.click('#libOpen');
  await page.waitForSelector('.lib-card', { timeout: 10000 });
  await page.screenshot({ path: path.join(OUT, 'library.png') });
  const lib = await page.evaluate(() => {
    const problems = [];
    for (const c of lib.items) {
      const p = parseTranscript(c.text);
      const lines = c.text.split('\n').filter(l => l.trim() && !/^\(\s*(pause|wait)/i.test(l));
      if (lines.some(l => !/^[^:]{1,40}:/.test(l))) problems.push(`#${c.id} ${c.title}: line without "Name:"`);
      if (p.participants.length < 2) problems.push(`#${c.id} ${c.title}: fewer than 2 speakers`);
      if (!p.participants.includes(c.me)) problems.push(`#${c.id} ${c.title}: "me" (${c.me}) doesn't speak`);
      for (const g of c.tags) if (!LIB_TAGS[g]) problems.push(`#${c.id} ${c.title}: unknown tag ${g}`);
      if (!APPS[c.app]) problems.push(`#${c.id} ${c.title}: unknown app`);
    }
    return { count: lib.items.length, problems };
  });
  check(lib.problems.length === 0, `${lib.count} library chats valid${lib.problems.length ? '\n    ' + lib.problems.slice(0, 20).join('\n    ') : ''}`);
  await page.click('#libClose');

  // 4. Share link opens the right chat
  const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  p2.on('pageerror', e => errors.push(e.message));
  await p2.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p2.goto(BASE + '#chat=3');
  await p2.waitForFunction(() => typeof lib !== 'undefined' && lib.items && document.getElementById('transcript').value === lib.items[3].text, null, { timeout: 10000 })
    .then(() => check(true, '#chat=3 share link loads chat 3'))
    .catch(() => check(false, '#chat=3 share link loads chat 3'));
  await p2.close();

  // 5. GIF export produces a real GIF
  await page.evaluate(() => { state.format = 'gif'; state.size = 's'; syncSegs(); });
  await page.click('[data-tab=export]');
  await page.click('#exportBtn');
  await page.waitForSelector('#result.show', { timeout: 120000 });
  const gif = await page.evaluate(async () => {
    const b = new Uint8Array(await (await fetch(document.getElementById('downloadBtn').href)).arrayBuffer());
    return { head: String.fromCharCode(...b.slice(0, 6)), size: b.length, tail: b[b.length - 1] };
  });
  check(gif.head === 'GIF89a' && gif.tail === 0x3B && gif.size > 10000, `GIF export (${(gif.size / 1024).toFixed(0)} KB, header ${gif.head})`);
  await page.screenshot({ path: path.join(OUT, 'export.png'), fullPage: true });

  check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
} catch (e) {
  check(false, `test crashed: ${e.message}`);
} finally {
  await browser.close();
  server.close();
}

console.log(failures ? `\n${failures} check(s) failed` : `\nAll checks passed. Screenshots in ${path.relative(process.cwd(), OUT) || OUT}`);
process.exit(failures ? 1 : 0);
