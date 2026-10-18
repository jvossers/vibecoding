// Builds the files the app loads from source/data.json (plus source/wikidata.json,
// if build/wikidata.mjs has imported events):
//
//   data/manifest.json              settings plus small indexes (people files, search files,
//                                   busiest places per century); fetched first, always
//   data/scopes/places.json         every place and theme; fetched at start
//   data/scopes/people-<n>.json     people, by period of birth; fetched when needed
//   data/lanes/<scope>.json         one lane's record, stats and tile index
//   data/tiles/<scope>/<band>/*.json events for one lane, a band of detail levels, one period
//   data/details/<shard>.json       full event records with descriptions, by id
//   data/search/<prefix>.json       search entries filed by the first 2 (or 3) letters of each word
//
// A lane's tiles already include the events rolled up from its child places, so
// the app never needs the whole data set.
//
// Detail levels (lod): every event gets, per lane, the coarsest zoom at which it
// can be shown without that screen getting crowded (assignLods). lod 0 shows even
// when all of history is on screen; each next lod needs twice the zoom. Tiles group
// levels into BANDS, and a band's period is split into smaller ones
// (1000 → 100 → 10 → 1 years) until each tile has at most MAX_PER_TILE events.
//
//   node build/build.mjs            (from the meanwhile/ folder, or anywhere)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'source', 'data.json');
const IMPORTED = path.join(ROOT, 'source', 'wikidata.json'); // from build/wikidata.mjs, optional
const OUT = path.join(ROOT, 'data');
const MAX_PER_TILE = 120;
// lod L is shown from 2^(L + LOD_BASE) px per year: lod 0 at ≤ 1/8 px/yr (~10,000
// years on a screen), lod 15 at 4096 px/yr (a few months, the app's deepest zoom).
const LOD_BASE = -3, LOD_COUNT = 16;
const SCREEN = 1200;     // px; the width the density cap is measured against
const CAP = 30;          // at most this many events in a screen-width around any event
const LOCAL_CAP = 10;    // …and this many in 3/8 of a screen, so they can't bunch up
const ERA_CAP = 4;       // at most this many eras overlapping at once
const BANDS = [[0, 4], [5, 7], [8, 10], [11, 15]];
const PERIODS = [1000, 100, 10, 1];           // tile sizes in years, coarsest first
const ALL = [-99999, 99999];                  // the "whole of history" tile
const HIST_ORIGIN = -4000, HIST_BIN = 25;     // per-lane event counts, for the overview bar
const DETAIL_SHARDS = 16;
const SEARCH_MAX = 1500;  // entries per search file before it splits by three letters
// people files, by year of birth
const PEOPLE_PERIODS = [[-1e9, 500, 'Ancient world'], [500, 1450, 'Middle Ages'], [1450, 1700, 'Renaissance and early modern'], [1700, 1850, 'Age of revolutions'], [1850, 1e9, 'Modern times']];
export const LIMITS = { LOD_BASE, LOD_COUNT, SCREEN, CAP, LOCAL_CAP, ERA_CAP, MAX_PER_TILE, SEARCH_MAX };
const NOW = new Date().getUTCFullYear() + 1;  // open-ended ("ongoing") eras run to here

const DATE = /^(-?\d+)(?:-(\d\d))?(?:-(\d\d))?$/;
function year(s) {
  const m = DATE.exec(s);
  if (!m) throw new Error('bad date: ' + s);
  return +m[1] + ((+m[2] || 1) - 1) / 12 + ((+m[3] || 1) - 1) / 365;
}
// Shared with the app (index.html, detailShard): which details file an event's description is in.
export function detailShard(id) {
  let h = 5381;
  for (const c of id) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return (h % DETAIL_SHARDS).toString(16);
}

// The source: hand-curated events plus, if present, those imported from Wikidata.
// Curated events win: an imported event with the same id or Wikidata id is dropped.
export function loadSource() {
  const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  if (!fs.existsSync(IMPORTED)) return src;
  const ids = new Set(src.events.map((e) => e.id)), qids = new Set(src.events.map((e) => e.wikidata).filter(Boolean));
  const scopes = new Set(src.scopes.map((s) => s.id));
  const extra = JSON.parse(fs.readFileSync(IMPORTED, 'utf8')).events
    .filter((e) => !ids.has(e.id) && !qids.has(e.wikidata))
    .map((e) => ({ ...e, scopes: e.scopes.filter((id) => scopes.has(id)) }))
    .filter((e) => e.scopes.length);
  return { ...src, events: [...src.events, ...extra] };
}

// `maxPerTile` and `searchMax` can be lowered to exercise splitting with little data (the tests do).
export function build(src = loadSource(), { maxPerTile = MAX_PER_TILE, searchMax = SEARCH_MAX } = {}) {
  const scopes = new Map(src.scopes.map((s) => [s.id, s]));
  const chain = new Map();
  for (const s of src.scopes) {
    const c = []; let x = s;
    while (x) { c.push(x.id); x = x.parent ? scopes.get(x.parent) : null; }
    chain.set(s.id, c); // self → … → root
  }
  const events = src.events.map((e) => {
    const y0 = year(e.start), era = !!(e.end || e.ongoing);
    const y1 = era ? (e.end ? year(e.end) : NOW) : y0;
    return { ...e, y0, y1, era, score: score(e) };
  });
  const flags = (e) => (e.approx ? 1 : 0) | (e.ongoing ? 2 : 0);
  // lod is per lane (it's in the tile record); the search index doesn't need it
  const record = (e, lod = 0) => [e.id, e.title, e.start, e.end || 0, e.importance, lod, flags(e), e.scopes];

  // Roll-up: an event shows in the lanes of the scopes it's tagged with, and (if
  // it qualifies) in their ancestors' lanes. Walking each tag's ancestors keeps
  // this proportional to the data, not events × scopes.
  const lanes = new Map(src.scopes.map((s) => [s.id, []]));
  for (const e of events) {
    const best = new Map(); // lane id → { d, via }
    for (const sid of e.scopes) {
      chain.get(sid).forEach((lane, d) => {
        const b = best.get(lane);
        if (!b || d < b.d) best.set(lane, { d, via: d ? sid : null });
      });
    }
    for (const [lane, { d, via }] of best) {
      if (d === 1 && e.importance > 2) continue;
      if (d >= 1 && e.era && (d > 1 || e.importance > 1)) continue; // eras roll up one level, big ones only
      if (d >= 2 && e.importance > 1) continue;
      lanes.get(lane).push({ e, via });
    }
  }

  const files = new Map(); // relative path → JSON value
  const bin = (y) => Math.floor((y - HIST_ORIGIN) / HIST_BIN);
  const isPerson = (s) => s.type === 'person';
  const isPlace = (s) => s.type !== 'person' && s.type !== 'theme';
  const people = src.scopes.filter(isPerson);
  const count = new Map(src.scopes.map((s) => [s.id, lanes.get(s.id).length]));
  const personRecord = (p) => ({ ...p, n: count.get(p.id) });
  for (const s of src.scopes) {
    const items = lanes.get(s.id);
    // stats for the overview bar, the lane picker and its suggestions
    const hist = {}, own = {}, rel = new Map();
    let a = Infinity, b = -Infinity;
    for (const { e, via } of items) {
      a = Math.min(a, e.y0); b = Math.max(b, e.y1);
      hist[bin(e.y0)] = (hist[bin(e.y0)] || 0) + 1;
      if (!via) own[bin(e.y0)] = (own[bin(e.y0)] || 0) + 1;
      for (const id of e.scopes) {
        const o = scopes.get(id);
        if (!isPlace(o) || chain.get(id).includes(s.id) || chain.get(s.id).includes(id)) continue;
        rel.set(id, (rel.get(id) || 0) + 1);
      }
    }
    const stats = {
      n: items.length,
      ext: items.length ? [round(a), round(b)] : null,
      hist, own,
      rel: [...rel].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, 6),
      // the best-covered people from this place, for "From …" suggestions
      people: people.filter((p) => p.home === s.id).sort((x, y) => count.get(y.id) - count.get(x.id)).slice(0, 4).map(personRecord),
    };
    // tiles, per band of detail levels
    assignLods(items);
    const entries = [];
    for (const [bandLo, bandHi] of BANDS) {
      const band = items.filter((it) => it.lod >= bandLo && it.lod <= bandHi);
      if (!band.length) continue;
      const split = (list, from, to, level) => {
        if (list.length <= maxPerTile || level >= PERIODS.length) {
          const name = from === ALL[0] ? 'all' : String(from);
          const file = `tiles/${s.id}/${bandLo}/${name}.json`;
          list.sort((x, y) => x.e.y0 - y.e.y0 || (x.e.id < y.e.id ? -1 : 1));
          files.set(file, { scope: s.id, lods: [bandLo, bandHi], from, to, events: list.map(({ e, via, lod }) => [...record(e, lod), via || 0]) });
          entries.push([bandLo, bandHi, from, to, file]);
          return;
        }
        const size = PERIODS[level];
        const lo = Math.max(from, Math.floor(Math.min(...list.map((x) => x.e.y0)) / size) * size);
        const hi = Math.min(to, Math.max(...list.map((x) => x.e.y1)));
        for (let f = lo; f <= hi; f += size) {
          const t = f + size;
          // points go in the period they fall in; eras in every period they overlap
          const sub = list.filter(({ e }) => (e.era ? e.y0 < t && e.y1 >= f : e.y0 >= f && e.y0 < t));
          if (sub.length) split(sub, f, t, level + 1);
        }
      };
      split(band, ALL[0], ALL[1], 0);
    }
    // one small file per lane: its record, stats and tile index, fetched when it's shown
    files.set(`lanes/${s.id}.json`, { scope: isPerson(s) ? personRecord(s) : { ...s, n: items.length }, stats, tiles: entries });
  }

  // every place and theme (needed for breadcrumbs and roll-up), loaded at start
  files.set('scopes/places.json', src.scopes.filter((s) => !isPerson(s)).map((s) => ({ ...s, n: count.get(s.id) })));
  // people, by period of birth, loaded when the People tab or a suggestion needs them
  const peopleIndex = PEOPLE_PERIODS.map(([from, to, title], i) => {
    const list = people.filter((p) => year(p.born) >= from && year(p.born) < to).sort((x, y) => year(x.born) - year(y.born)).map(personRecord);
    files.set(`scopes/people-${i}.json`, list);
    return { file: `scopes/people-${i}.json`, title, from, to, n: list.length };
  }).filter((x) => x.n);

  // busiest places per century, for the picker's "busiest places" suggestions
  const busy = {};
  for (const e of events) {
    const c = Math.floor(e.y0 / 100) * 100;
    for (const id of e.scopes) if (isPlace(scopes.get(id)) && id !== 'world') ((busy[c] = busy[c] || {})[id] = (busy[c][id] || 0) + 1);
  }
  for (const c of Object.keys(busy)) busy[c] = Object.entries(busy[c]).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, 12);

  // event details, sharded by id: the full record (so a shared link can open any
  // event), its description and the names of people it's tagged with
  const shards = {};
  for (const e of events) {
    const names = {};
    for (const id of e.scopes) if (isPerson(scopes.get(id))) names[id] = scopes.get(id).name;
    (shards[detailShard(e.id)] = shards[detailShard(e.id)] || {})[e.id] = [record(e), e.desc || '', names];
  }
  for (const [k, v] of Object.entries(shards)) files.set(`details/${k}.json`, v);

  // search: entries filed under the first letters of each word; a file that gets
  // too big is split by three letters. Events: ['e', ...record]; lanes:
  // ['s', id, name, type, extra] (extra: [born, died, role, home] for people).
  const entries = [
    ...events.map((e) => ({ text: e.title, row: ['e', ...record(e)] })),
    ...src.scopes.map((s) => ({
      text: [s.name, ...(s.aliases || []), s.role || ''].join(' '),
      row: ['s', s.id, s.name, s.type, isPerson(s) ? [s.born, s.died, s.role, s.home] : s.parent || 0],
    })),
  ];
  const byKey = new Map();
  const file = (k, x) => { if (!byKey.has(k)) byKey.set(k, new Set()); byKey.get(k).add(x); };
  for (const x of entries) for (const t of words(x.text)) file(t.slice(0, 2), x);
  for (const [k, set] of [...byKey]) {
    if (set.size <= searchMax) continue;
    byKey.delete(k);
    for (const x of set) for (const t of words(x.text)) if (t.startsWith(k)) file(t.length > 2 ? t.slice(0, 3) : k + '_', x);
  }
  const searchKeys = [...byKey.keys()].sort();
  for (const k of searchKeys) files.set(`search/${k}.json`, [...byKey.get(k)].map((x) => x.row));

  // a content hash, so the app can bust caches when the data changes
  const hash = crypto.createHash('sha1');
  for (const [p, v] of [...files].sort()) hash.update(p).update(JSON.stringify(v));
  const manifest = {
    v: hash.digest('hex').slice(0, 10),
    histOrigin: HIST_ORIGIN, histBin: HIST_BIN, detailShards: DETAIL_SHARDS,
    lodBase: LOD_BASE, lodCount: LOD_COUNT,
    people: peopleIndex,
    search: searchKeys,
    busy,
  };
  files.set('manifest.json', manifest);
  return files;
}
const round = (y) => Math.round(y * 100) / 100;
// Words for search: lower-case, without accents or filler words. Shared with the
// app (searchWords in index.html), which splits queries the same way.
const STOP = new Set(['of', 'the', 'and', 'in', 'on', 'at', 'to', 'for', 'by', 'an']);
export function words(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2 && !STOP.has(t));
}

// How much an event deserves a place when space is short. Importance dominates;
// a description and links to several places or people break ties, and an
// optional `score` in the source data adds a manual boost.
function score(e) {
  return (4 - e.importance) * 100 + (e.desc ? 10 : 0) + Math.min(4, e.scopes.length - 1) * 5 + (e.score || 0);
}

// Give each of a lane's items the coarsest lod at which it fits: best score first,
// an event takes lod L only if, at every level from L down to the finest, a
// screen-width around it holds fewer than CAP events and 3/8 of a screen fewer
// than LOCAL_CAP. An era fits as a bar while
// it is at least 14px long at that zoom and fewer than ERA_CAP eras overlap it;
// otherwise it competes for space as a point (the app draws it as a point too). Window counts use
// bins an eighth of a screen wide, so this is fast for big lanes. Events that fit
// nowhere get the finest lod.
export function assignLods(items) {
  const width = (L) => SCREEN / Math.pow(2, L + LOD_BASE); // years on screen at lod L
  const bins = Array.from({ length: LOD_COUNT }, () => new Map());
  const binOf = (L, y) => Math.floor(y / (width(L) / 8));
  const crowd = (L, y, r) => { const b = binOf(L, y); let n = 0; for (let k = b - r; k <= b + r; k++) n += bins[L].get(k) || 0; return n; };
  const eras = Array.from({ length: LOD_COUNT }, () => []);
  const overlap = (L, e) => eras[L].filter((o) => o.y0 < e.y1 && o.y1 > e.y0).length;
  const order = items.slice().sort((a, b) => b.e.score - a.e.score || a.e.y0 - b.e.y0 || (a.e.id < b.e.id ? -1 : 1));
  for (const it of order) {
    const e = it.e;
    const asBar = (L) => e.era && (e.y1 - e.y0) * Math.pow(2, L + LOD_BASE) >= 14 && overlap(L, e) < ERA_CAP;
    const fits = (L) => asBar(L) || (crowd(L, e.y0, 4) < CAP && crowd(L, e.y0, 1) < LOCAL_CAP);
    let L = LOD_COUNT - 1;
    if (fits(L)) while (L > 0 && fits(L - 1)) L--;
    it.lod = L;
    const bar = asBar(L);
    for (let k = L; k < LOD_COUNT; k++) {
      if (bar) eras[k].push(e);
      else { const b = binOf(k, e.y0); bins[k].set(b, (bins[k].get(b) || 0) + 1); }
    }
  }
  return items;
}

export function write(files, out = OUT) {
  fs.rmSync(out, { recursive: true, force: true });
  for (const [p, v] of files) {
    const f = path.join(out, p);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(v));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const files = build();
  write(files);
  const tiles = [...files.keys()].filter((p) => p.startsWith('tiles/')).length;
  const bytes = [...files.values()].reduce((n, v) => n + JSON.stringify(v).length, 0);
  console.log(`built ${files.size} files (${tiles} tiles, ${Math.round(bytes / 1024)} KB) into data/, version ${files.get('manifest.json').v}`);
}
