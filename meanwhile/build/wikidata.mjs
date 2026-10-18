// Imports events from Wikidata into source/wikidata.json, which build/build.mjs
// merges with the hand-curated source/data.json (curated events win).
//
//   node build/wikidata.mjs --check            check every scope's Wikidata id names the right thing
//   node build/wikidata.mjs                    import for every place and person with a Wikidata id
//   node build/wikidata.mjs --only netherlands,einstein --min-links 20
//
// For places it fetches every well-covered battle, war, treaty, disaster, etc.
// worldwide (see CLASSES) with a date (point in time, start/end, or inception/
// dissolution) and sorts them into lanes by country (P17), continent (P30),
// located in (P131) or location (P276). For people
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
const PER_PERSON = 30;   // …and per person (mostly honours, past the first few)

// ---------- queries ----------
const dated = `
  { ?item p:P585/psv:P585 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] }
  UNION
  { ?item p:P580/psv:P580 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] .
    OPTIONAL { ?item p:P582/psv:P582 [ wikibase:timeValue ?end; wikibase:timePrecision ?endPrec ] } }`;
// Places: rather than asking "what happened in the Netherlands" (which makes the
// query service scan every street and building there, and time out), we fetch
// every well-covered item of each event-like class worldwide, with where it
// happened, and sort them into place lanes here.
export const CLASSES = {
  Q178561: 'battle', Q188055: 'siege', Q198: 'war', Q8465: 'civil war', Q103495: 'world war',
  Q1006311: 'war of national liberation', Q350604: 'armed conflict', Q831663: 'military campaign',
  Q645883: 'military operation', Q131569: 'treaty', Q10931: 'revolution', Q45382: "coup d'état",
  Q124734: 'rebellion', Q273120: 'protest', Q3199915: 'massacre', Q41397: 'genocide',
  Q2223653: 'terrorist attack', Q3882219: 'assassination', Q7944: 'earthquake', Q8068: 'flood',
  Q8065: 'natural disaster', Q3839081: 'disaster', Q168983: 'conflagration', Q44512: 'epidemic',
  Q12184: 'pandemic', Q852190: 'shipwreck', Q744913: 'aviation accident', Q2401485: 'expedition',
  Q159821: 'Summer Olympic Games', Q82414: 'Winter Olympic Games', Q209715: 'coronation',
  Q13418847: 'historical event', Q11514315: 'historical period', Q3024240: 'historical country',
};
export function eventsQuery(cls, minLinks) {
  return `SELECT ?item ?itemLabel ?itemDescription ?date ?datePrec ?end ?endPrec ?links WHERE {
  ?item wdt:P31/wdt:P279? wd:${cls} .
  ?item wikibase:sitelinks ?links . FILTER(?links >= ${minLinks})
  FILTER NOT EXISTS { ?item wdt:P31 wd:Q5 }
  # places that still exist (Venice is also an "Italian city-state"): a population, no end
  FILTER NOT EXISTS { ?item wdt:P1082 [] . FILTER NOT EXISTS { ?item wdt:P576 [] } }
  ${dated}
  UNION
  { ?item p:P571/psv:P571 [ wikibase:timeValue ?date; wikibase:timePrecision ?datePrec ] .
    OPTIONAL { ?item p:P576/psv:P576 [ wikibase:timeValue ?end; wikibase:timePrecision ?endPrec ] } }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
}`;
}
// Where each item happened: its country, continent, region or location, and the
// country, continent and region of that location; for former states, the country
// their capital is in now.
export function locationsQuery(cls, minLinks) {
  return `SELECT ?item (GROUP_CONCAT(DISTINCT STRAFTER(STR(?l), "entity/"); separator=" ") AS ?locs) WHERE {
  ?item wdt:P31/wdt:P279? wd:${cls} .
  ?item wikibase:sitelinks ?links . FILTER(?links >= ${minLinks})
  { ?item wdt:P17|wdt:P30|wdt:P131|wdt:P276 ?l }
  UNION { ?item wdt:P17|wdt:P131|wdt:P276 ?x . ?x wdt:P17|wdt:P30|wdt:P131 ?l }
  UNION { ?item wdt:P36/wdt:P17 ?l }
} GROUP BY ?item`;
}
// rows: event rows from eventsQuery; locs: Map(item QID → [location QIDs]).
// Returns Map(scope id → rows) for the place scopes (limited to `only`, if given).
// An item goes to the most specific places that match (Amsterdam, not also the
// Netherlands; the build rolls it up). Continents count only when no country,
// region or city matched. Items spanning several continents or many countries
// go to the world lane, but only if they're widely covered; otherwise nowhere.
export const WORLD_LINKS = 80;
export function assignPlaces(rows, locs, src, only) {
  const places = src.scopes.filter((s) => s.type !== 'person' && s.wikidata);
  const byQid = new Map(places.map((s) => [s.wikidata, s]));
  const parent = new Map(src.scopes.map((s) => [s.id, s.parent]));
  const ancestors = (id) => { const out = []; for (let p = parent.get(id); p; p = parent.get(p)) out.push(p); return out; };
  const target = new Map();
  for (const [qid, list] of locs) {
    let hit = list.map((q) => byQid.get(q)).filter(Boolean);
    if (hit.some((s) => s.type !== 'continent')) hit = hit.filter((s) => s.type !== 'continent');
    let ids = [...new Set(hit.map((s) => s.id))];
    const above = new Set(ids.flatMap(ancestors));
    ids = ids.filter((id) => !above.has(id));
    if (ids.length > 4 || (ids.length > 1 && hit.every((s) => s.type === 'continent'))) ids = ['world'];
    if (ids.length) target.set(qid, ids);
  }
  const out = new Map();
  for (const r of rows) {
    const qid = r.item && r.item.value.split('/').pop();
    for (const id of target.get(qid) || []) {
      if (only && !only.has(id)) continue;
      // the world lane is for the big events, not former states that spanned continents
      if (id === 'world' && (+((r.links && r.links.value) || 0) < WORLD_LINKS || r.cls === 'Q3024240')) continue;
      if (!out.has(id)) out.set(id, []);
      out.get(id).push(r);
    }
  }
  return out;
}
// The sitelinks count is OPTIONAL and filtered here, not in the query: as a FILTER
// the service evaluates it first, over every item, and times out.
export function personQuery(qid) {
  const time = '?v wikibase:timeValue ?date . ?v wikibase:timePrecision ?datePrec .';
  return `SELECT ?item ?itemLabel ?itemDescription ?date ?datePrec ?links ?kind WHERE {
  { wd:${qid} wdt:P800 ?item . BIND("work" AS ?kind) ?item p:P577 ?st . ?st psv:P577 ?v . ${time} }
  UNION { wd:${qid} wdt:P800 ?item . BIND("inception" AS ?kind) ?item p:P571 ?st . ?st psv:P571 ?v . ${time} }
  UNION { wd:${qid} p:P166 ?st . ?st ps:P166 ?item . BIND("award" AS ?kind) ?st pqv:P585 ?v . ${time} }
  UNION { wd:${qid} p:P793 ?st . ?st ps:P793 ?item . BIND("event" AS ?kind) ?st pqv:P585 ?v . ${time} }
  OPTIONAL { ?item wikibase:sitelinks ?links }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
} LIMIT 300`;
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
// Whether date a is later than b ("2021" isn't later than "2021-07-11").
const yearOf = (d) => { const m = /^(-?\d+)(?:-(\d\d))?(?:-(\d\d))?/.exec(d); return +m[1] + ((+m[2] || 1) - 1) / 12 + ((+m[3] || 1) - 1) / 365; };
export const after = (a, b) => yearOf(a) > yearOf(b);
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
      const generic = label[0] !== label[0].toUpperCase(); // "funeral", "quantum mechanics"
      // works: only titled ones (Guernica, iTunes), not fields or ideas ("quantum mechanics")
      if ((kind === 'work' || kind === 'inception') && label === label.toLowerCase()) continue;
      // awards read better with whom they went to; generic events need the name too,
      // unless they have it already ("coronation of Elizabeth II")
      const named = label.includes(scope.name) || label.includes(scope.name.split(' ').pop());
      const cap = label[0].toUpperCase() + label.slice(1);
      const title = scope.type !== 'person' ? cap
        : kind === 'award' ? (/^(honorary (citizen|member)|member|fellow|foreign member)/i.test(label)
          ? `${scope.name} becomes ${/^([aeiou]|hon)/i.test(label) ? 'an' : 'a'} ${generic ? label : label[0].toLowerCase() + label.slice(1)}`
          : `${scope.name} receives ${generic ? (/^([aeiou]|hon)/.test(label) ? 'an ' : 'a ') : 'the '}${label}`)
        : kind === 'event' && generic ? (named ? cap : `${scope.name}'s ${label}`) : label;
      const year = +/^-?\d+/.exec(start.date)[0];
      let e = byItem.get(qid + '|' + title);
      if (!e) {
        // one item can be several events: an award for each winner, or a person's
        // "funeral" next to a place's event of the same item
        e = { id: 'wd-' + qid.toLowerCase() + (kind === 'award' || title !== label ? '-' + scopeId : ''), title, start: start.date, scopes: [], importance: importanceOf(links), score: Math.round(links / 4), wikidata: qid };
        if (end && after(end.date, start.date)) e.end = end.date;
        if (start.approx) e.approx = true;
        const desc = r.itemDescription && r.itemDescription.value;
        if (desc) e.desc = desc[0].toUpperCase() + desc.slice(1) + '.';
        byItem.set(qid + '|' + title, e);
      } else {
        // several dates (a point in time and a start/end): keep the earliest start, and an end
        if (after(e.start, start.date)) e.start = start.date;
        if (!e.end && end && after(end.date, e.start)) e.end = end.date;
      }
      if (!e.scopes.includes(scopeId)) e.scopes.push(scopeId);
    }
  }
  // skip what's already curated (by now each event has its earliest start)
  const dupe = (e) => (curated.get(norm(e.title)) || []).some((y) => Math.abs(y - +/^-?\d+/.exec(e.start)[0]) <= 1);
  // keep each place's best-covered events
  const out = [...byItem.values()].filter((e) => !dupe(e));
  const keep = new Set();
  for (const scopeId of rowsByScope.keys()) {
    out.filter((e) => e.scopes.includes(scopeId)).sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1))
      .slice(0, scopes.get(scopeId).type === 'person' ? PER_PERSON : PER_SCOPE).forEach((e) => keep.add(e));
  }
  return out.filter((e) => keep.has(e)).sort((a, b) => (a.id < b.id ? -1 : 1));
}

// ---------- fetching ----------
async function sparql(query) {
  const key = crypto.createHash('sha1').update(query).digest('hex').slice(0, 16);
  const file = path.join(CACHE, key + '.json');
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  for (let attempt = 1; ; attempt++) {
    // the service gives up on a query after 60s; don't wait forever on a stuck connection
    const res = await fetch(ENDPOINT + '?format=json&query=' + encodeURIComponent(query), { headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(120000) })
      .catch((err) => ({ ok: false, status: err.name === 'TimeoutError' ? 504 : 0, text: async () => err.message }));
    if (res.ok) {
      const rows = (await res.json()).results.bindings;
      fs.mkdirSync(CACHE, { recursive: true });
      fs.writeFileSync(file, JSON.stringify(rows));
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      return rows;
    }
    if (attempt >= 4 || ![0, 429, 500, 502, 503, 504].includes(res.status)) throw new Error(`query service: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
    // 429: the service limits each client's query time per minute
    const wait = res.status === 429 ? 1000 * (+(res.headers && res.headers.get('retry-after')) || 60) : 5000 * attempt;
    await new Promise((r) => setTimeout(r, wait));
  }
}
// Look up English labels, to confirm each scope's Wikidata id is the right thing.
async function labels(qids) {
  const out = {};
  for (let i = 0; i < qids.length; i += 50) {
    const url = `${API}?action=wbgetentities&format=json&props=labels&languages=en|mul&ids=${encodeURIComponent(qids.slice(i, i + 50).join('|'))}`;
    let res;
    for (let attempt = 1; ; attempt++) {
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.ok || attempt >= 5 || ![429, 500, 502, 503, 504].includes(res.status)) break;
      await new Promise((r) => setTimeout(r, 1000 * (+res.headers.get('retry-after') || 5 * attempt)));
    }
    if (!res.ok) throw new Error(`wikidata api: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
    for (const [q, ent] of Object.entries((await res.json()).entities)) out[q] = ent.labels && (ent.labels.en || ent.labels.mul) ? (ent.labels.en || ent.labels.mul).value : null;
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
  const people = targets.filter((s) => s.type === 'person');
  const placeIds = new Set(targets.filter((s) => s.type !== 'person').map((s) => s.id));
  if (!only || placeIds.size) {
    const rows = [];
    const locs = new Map();
    for (const [cls, name] of Object.entries(CLASSES)) {
      try {
        const ev = await sparql(eventsQuery(cls, minLinks));
        for (const r of await sparql(locationsQuery(cls, minLinks))) locs.set(r.item.value.split('/').pop(), r.locs.value.split(' '));
        rows.push(...ev.map((r) => ({ ...r, cls })));
        console.log(`${name}: ${ev.length} rows`);
      } catch (err) {
        console.log(`${name}: failed (${err.message}); skipped`);
      }
    }
    if (!only) placeIds.add('world');
    for (const [id, r] of assignPlaces(rows, locs, src, placeIds)) rowsByScope.set(id, r);
    console.log(`places: ${rowsByScope.size} lanes got events`);
  }
  for (const [i, s] of people.entries()) {
    try {
      const died = s.died ? +/^-?\d+/.exec(s.died)[0] : Infinity;
      const rows = (await sparql(personQuery(s.wikidata))).filter((r) => +((r.links && r.links.value) || 0) >= Math.min(minLinks, 5)
        && !(r.kind.value === 'award' && +/^[+-]?\d+/.exec(r.date.value)[0] > died)); // no posthumous honours
      rowsByScope.set(s.id, rows);
      console.log(`${i + 1}/${people.length} ${s.id}: ${rows.length} rows`);
    } catch (err) {
      console.log(`${i + 1}/${people.length} ${s.id}: failed (${err.message}); skipped`);
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
