// Imports events from Wikidata into source/wikidata.json, which build/build.mjs
// merges with the hand-curated source/data.json (curated events win).
//
//   node build/wikidata.mjs --check            check every scope's Wikidata id names the right thing
//   node build/wikidata.mjs                    import for every place and person with a Wikidata id
//   node build/wikidata.mjs --only netherlands,einstein --min-links 20
//
// For places it asks for things with a date (point in time, or start/end) located
// in that place: country (P17), located in (P131) or location (P276). For people
// it asks for their notable works (P800, dated by publication or inception),
// awards with a date (P166) and significant events (P793). An event's importance
// and score come from how many Wikipedia languages cover it (sitelinks).
//
// Responses are cached in build/.cache/ (gitignored), so re-runs don't hit the
// query service again; delete the folder to refresh.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'source', 'data.json');
const OUT = path.join(ROOT, 'source', 'wikidata.json');
const CACHE = path.join(ROOT, 'build', '.cache');
const ENDPOINT = 'https://query.wikidata.org/sparql';
const API = 'https://www.wikidata.org/w/api.php';
const USER_AGENT = 'MeanwhileHistoryBrowser/0.1 (https://labs.vossers.com/meanwhile/; jvossers/vibecoding)';
const PAUSE_MS = 1500;   // between queries, to be polite to the public endpoint
const PER_SCOPE = 400;   // most-covered events per place

// ---------- queries ----------
const dated = `
  { ?item p:P585/psv:P585 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] }
  UNION
  { ?item p:P580/psv:P580 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] .
    OPTIONAL { ?item p:P582/psv:P582 [ wikibase:timeValue ?end; wikibase:timePrecision ?endPrec ] } }`;
export function placeQuery(qid, minLinks) {
  return `SELECT ?item ?itemLabel ?itemDescription ?date ?datePrec ?end ?endPrec ?links WHERE {
  { ?item wdt:P17 wd:${qid} } UNION { ?item wdt:P131 wd:${qid} } UNION { ?item wdt:P276 wd:${qid} }
  ?item wikibase:sitelinks ?links . FILTER(?links >= ${minLinks})
  FILTER NOT EXISTS { ?item wdt:P31 wd:Q5 }
  ${dated}
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} ORDER BY DESC(?links) LIMIT ${PER_SCOPE * 2}`;
}
export function personQuery(qid, minLinks) {
  return `SELECT ?item ?itemLabel ?itemDescription ?date ?datePrec ?end ?endPrec ?links ?kind WHERE {
  {
    wd:${qid} wdt:P800 ?item . BIND("work" AS ?kind)
    ?item p:P577|p:P571 ?st . ?st psv:P577|psv:P571 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] .
  } UNION {
    wd:${qid} p:P166 ?st . ?st ps:P166 ?item . BIND("award" AS ?kind)
    ?st pqv:P585 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] .
  } UNION {
    wd:${qid} p:P793 ?st . ?st ps:P793 ?item . BIND("event" AS ?kind)
    ?st pqv:P585 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] .
  }
  ?item wikibase:sitelinks ?links . FILTER(?links >= ${Math.min(minLinks, 5)})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 200`;
}

// ---------- converting results ----------
// Wikidata times look like "+1918-11-10T00:00:00Z" or "-0044-03-15T00:00:00Z",
// with a precision: 11 day, 10 month, 9 year, 8 decade, 7 century, 6 millennium.
export function parseTime(value, precision) {
  const m = /^([+-]?)(\d+)-(\d\d)-(\d\d)/.exec(value || '');
  if (!m) return null;
  const y = (m[1] === '-' ? -1 : 1) * +m[2];
  const p = +precision;
  if (p < 6 || (y === 0 && p >= 9)) return null;
  const date = p >= 11 ? `${y}-${m[3]}-${m[4]}` : p === 10 ? `${y}-${m[3]}` : String(y);
  return { date, approx: p <= 8 };
}
// How widely covered an event is, from the number of Wikipedia language versions.
export function importanceOf(links) { return links >= 80 ? 1 : links >= 30 ? 2 : 3; }

// rowsByScope: Map(scope id → SPARQL result rows). Returns events in the source format.
export function convert(rowsByScope, src) {
  const scopes = new Map(src.scopes.map((s) => [s.id, s]));
  const norm = (t) => t.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const curated = new Map(); // normalized title → years, to skip events we already have
  for (const e of src.events) {
    const k = norm(e.title);
    if (!curated.has(k)) curated.set(k, []);
    curated.get(k).push(+/^-?\d+/.exec(e.start)[0]);
  }
  const curatedIds = new Set(src.events.map((e) => e.wikidata).filter(Boolean));
  const byItem = new Map();
  for (const [scopeId, rows] of rowsByScope) {
    const scope = scopes.get(scopeId);
    for (const r of rows) {
      const qid = (r.item && r.item.value.split('/').pop()) || '';
      const label = r.itemLabel && r.itemLabel.value;
      if (!/^Q\d+$/.test(qid) || !label || label === qid) continue; // no English label
      if (curatedIds.has(qid)) continue;
      const start = parseTime(r.date && r.date.value, r.datePrec && r.datePrec.value);
      if (!start) continue;
      const end = r.end ? parseTime(r.end.value, r.endPrec && r.endPrec.value) : null;
      const links = +((r.links && r.links.value) || 0);
      const kind = r.kind && r.kind.value;
      // awards: "Nobel Prize in Physics" reads better with whom it went to
      const title = kind === 'award' && scope.type === 'person' ? `${scope.name} receives the ${label}` : label;
      const year = +/^-?\d+/.exec(start.date)[0];
      if ((curated.get(norm(title)) || []).some((y) => Math.abs(y - year) <= 1)) continue;
      let e = byItem.get(qid + '|' + title);
      if (!e) {
        e = { id: 'wd-' + qid.toLowerCase() + (kind === 'award' ? '-' + scopeId : ''), title, start: start.date, scopes: [], importance: importanceOf(links), score: Math.round(links / 4), wikidata: qid };
        if (end && end.date !== start.date && year <= +/^-?\d+/.exec(end.date)[0]) e.end = end.date;
        if (start.approx) e.approx = true;
        const desc = r.itemDescription && r.itemDescription.value;
        if (desc) e.desc = desc[0].toUpperCase() + desc.slice(1) + '.';
        byItem.set(qid + '|' + title, e);
      } else if (start.date < e.start) e.start = start.date; // several dates: keep the earliest
      if (!e.scopes.includes(scopeId)) e.scopes.push(scopeId);
    }
  }
  // keep each place's best-covered events
  const out = [...byItem.values()];
  const keep = new Set();
  for (const scopeId of rowsByScope.keys()) {
    out.filter((e) => e.scopes.includes(scopeId)).sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1)).slice(0, PER_SCOPE).forEach((e) => keep.add(e));
  }
  return out.filter((e) => keep.has(e)).sort((a, b) => (a.id < b.id ? -1 : 1));
}

// ---------- fetching ----------
async function sparql(query) {
  const key = crypto.createHash('sha1').update(query).digest('hex').slice(0, 16);
  const file = path.join(CACHE, key + '.json');
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(ENDPOINT + '?format=json&query=' + encodeURIComponent(query), { headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' } });
    if (res.ok) {
      const rows = (await res.json()).results.bindings;
      fs.mkdirSync(CACHE, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(rows));
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      return rows;
    }
    if (attempt >= 4 || ![429, 500, 502, 503, 504].includes(res.status)) throw new Error(`query service: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
}
// Look up English labels, to confirm each scope's Wikidata id is the right thing.
async function labels(qids) {
  const out = {};
  for (let i = 0; i < qids.length; i += 50) {
    const url = `${API}?action=wbgetentities&format=json&props=labels&languages=en&ids=${qids.slice(i, i + 50).join('|')}`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`wikidata api: ${res.status}`);
    for (const [q, ent] of Object.entries((await res.json()).entities)) out[q] = ent.labels && ent.labels.en ? ent.labels.en.value : null;
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
  const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const only = opt('--only', '') ? new Set(opt('--only').split(',')) : null;
  const minLinks = +opt('--min-links', 15);
  const targets = src.scopes.filter((s) => s.wikidata && (!only || only.has(s.id)));

  if (args.includes('--check')) {
    const got = await labels(targets.map((s) => s.wikidata));
    const simple = (t) => (t || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    let bad = 0;
    for (const s of targets) {
      const l = got[s.wikidata];
      const ok = l && (simple(l).includes(simple(s.name).split(' ')[0]) || simple(s.name).includes(simple(l).split(' ')[0]));
      if (!ok) { bad++; console.log(`✗ ${s.id}: ${s.wikidata} is "${l}"`); }
    }
    console.log(bad ? `${bad} of ${targets.length} ids look wrong; fix them in source/data.json` : `all ${targets.length} ids match`);
    process.exit(bad ? 1 : 0);
  }

  const rowsByScope = new Map();
  for (const [i, s] of targets.entries()) {
    const q = s.type === 'person' ? personQuery(s.wikidata, minLinks) : placeQuery(s.wikidata, minLinks);
    try {
      const rows = await sparql(q);
      rowsByScope.set(s.id, rows);
      console.log(`${i + 1}/${targets.length} ${s.id}: ${rows.length} rows`);
    } catch (err) {
      console.log(`${i + 1}/${targets.length} ${s.id}: failed (${err.message}); skipped`);
    }
  }
  if (!rowsByScope.size) {
    console.error('nothing came back from the query service; source/wikidata.json is unchanged. Is query.wikidata.org reachable?');
    process.exit(1);
  }
  const events = convert(rowsByScope, src);
  // keep scopes already imported that this run didn't cover (e.g. with --only)
  const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).events : [];
  const covered = new Set(rowsByScope.keys());
  const kept = previous.filter((e) => !e.scopes.some((id) => covered.has(id)));
  const merged = [...kept, ...events].sort((a, b) => (a.id < b.id ? -1 : 1));
  fs.writeFileSync(OUT, JSON.stringify({ source: 'Wikidata (CC0)', imported: new Date().toISOString().slice(0, 10), events: merged }, null, 0).replace(/\},\{/g, '},\n{'));
  console.log(`wrote ${merged.length} events to source/wikidata.json; now run node build/build.mjs`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
