// Builds the files the app loads from source/data.json:
//
//   data/manifest.json             scopes (lanes), per-lane stats and the tile index
//   data/tiles/<scope>/<lod>/*.json events for one lane, one detail level, one period
//   data/details/<shard>.json      event descriptions, fetched when an event is opened
//   data/search.json               every event in short form, fetched on first search
//
// A lane's tiles already include the events rolled up from its child places, so
// the app never needs the whole data set. Each detail level only holds the events
// new at that level; a period is split into smaller ones (1000 → 100 → 10 → 1 years)
// until each tile has at most MAX_PER_TILE events.
//
//   node build/build.mjs            (from the meanwhile/ folder, or anywhere)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'source', 'data.json');
const OUT = path.join(ROOT, 'data');
const MAX_PER_TILE = 120;
const PERIODS = [1000, 100, 10, 1];           // tile sizes in years, coarsest first
const ALL = [-99999, 99999];                  // the "whole of history" tile
const HIST_ORIGIN = -4000, HIST_BIN = 25;     // per-lane event counts, for the overview bar
const DETAIL_SHARDS = 16;
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

export function build(src = JSON.parse(fs.readFileSync(SRC, 'utf8'))) {
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
    // Step 1 keeps today's importance tiers as the detail level (lod 0 = most important).
    return { ...e, y0, y1, era, lod: e.importance - 1 };
  });
  const flags = (e) => (e.approx ? 1 : 0) | (e.ongoing ? 2 : 0);
  const record = (e) => [e.id, e.title, e.start, e.end || 0, e.importance, e.lod, flags(e), e.scopes];

  // Roll-up: the same rule the app used to apply on the fly.
  const lanes = new Map(src.scopes.map((s) => [s.id, []]));
  for (const e of events) {
    for (const s of src.scopes) {
      let best = null;
      for (const sid of e.scopes) {
        const d = chain.get(sid).indexOf(s.id);
        if (d === 0) { best = { d: 0, via: null }; break; }
        if (d > 0 && (!best || d < best.d)) best = { d, via: sid };
      }
      if (!best) continue;
      if (best.d === 1 && e.importance > 2) continue;
      if (best.d >= 1 && e.era && (best.d > 1 || e.importance > 1)) continue; // eras roll up one level, big ones only
      if (best.d >= 2 && e.importance > 1) continue;
      lanes.get(s.id).push({ e, via: best.via });
    }
  }

  const files = new Map(); // relative path → JSON value
  const tileIndex = {};
  const stats = {};
  const bin = (y) => Math.floor((y - HIST_ORIGIN) / HIST_BIN);
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
        if (o.type === 'person' || o.type === 'theme' || chain.get(id).includes(s.id) || chain.get(s.id).includes(id)) continue;
        rel.set(id, (rel.get(id) || 0) + 1);
      }
    }
    stats[s.id] = {
      n: items.length,
      ext: items.length ? [round(a), round(b)] : null,
      hist, own,
      rel: [...rel].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, 6),
    };
    // tiles, per detail level
    const entries = [];
    const byLod = new Map();
    for (const it of items) { if (!byLod.has(it.e.lod)) byLod.set(it.e.lod, []); byLod.get(it.e.lod).push(it); }
    for (const lod of [...byLod.keys()].sort()) {
      const split = (list, from, to, level) => {
        if (list.length <= MAX_PER_TILE || level >= PERIODS.length) {
          const name = from === ALL[0] ? 'all' : String(from);
          const file = `tiles/${s.id}/${lod}/${name}.json`;
          list.sort((x, y) => x.e.y0 - y.e.y0 || (x.e.id < y.e.id ? -1 : 1));
          files.set(file, { scope: s.id, lod, from, to, events: list.map(({ e, via }) => [...record(e), via || 0]) });
          entries.push([lod, from, to, file]);
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
      split(byLod.get(lod), ALL[0], ALL[1], 0);
    }
    if (entries.length) tileIndex[s.id] = entries;
  }

  // descriptions, sharded by id
  const shards = {};
  for (const e of events) {
    if (!e.desc) continue;
    const k = detailShard(e.id);
    (shards[k] = shards[k] || {})[e.id] = e.desc;
  }
  for (const [k, v] of Object.entries(shards)) files.set(`details/${k}.json`, v);
  files.set('search.json', { events: events.map(record) });

  // a content hash, so the app can bust caches when the data changes
  const hash = crypto.createHash('sha1');
  for (const [p, v] of [...files].sort()) hash.update(p).update(JSON.stringify(v));
  const manifest = {
    v: hash.digest('hex').slice(0, 10),
    histOrigin: HIST_ORIGIN, histBin: HIST_BIN, detailShards: DETAIL_SHARDS,
    scopes: src.scopes.map((s) => ({ ...s, stats: stats[s.id] })),
    tiles: tileIndex,
  };
  files.set('manifest.json', manifest);
  return files;
}
const round = (y) => Math.round(y * 100) / 100;

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
