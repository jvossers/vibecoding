# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Meanwhile** is a history browser built on swim lanes. You pick lanes, which can be countries, continents, people or themes, and see their events and eras side by side on one zoomable timeline. That shows what was happening at the same time: for example the Netherlands, Albert Einstein and Africa in 1905.

- **Tech:** static site, vanilla HTML/CSS/JS, no framework, no backend. The only build step turns the source data into tiles (`node build/build.mjs`).
- **Live at:** `labs.vossers.com/meanwhile/` (GitHub Pages, like the other vibes in this repo).

## Files

```
index.html          the whole app: markup, CSS, JS
source/data.json    hand-curated: ~140 scopes (lanes) and ~1,050 events/eras
source/wikidata.json  imported by build/wikidata.mjs (once run); curated events win over it
build/build.mjs     turns the source into data/ (run it after every data change)
build/wikidata.mjs  imports events from Wikidata into source/wikidata.json
data/               generated; what the app loads (manifest, tiles, details, search)
tests/smoke.mjs     data and tile checks + Playwright smoke test
```

## Running locally

`index.html` fetches files from `data/`, so it needs http, not `file://`:
```bash
node build/build.mjs          # after editing source/data.json
python3 -m http.server 8765   # then open http://localhost:8765/
```

## Testing

```bash
cd tests && npm install && npm test
# or, in the cloud container, with the preinstalled browser:
PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm test
```
The test first checks the data:
- **`source/data.json`:** parents and scopes exist, dates parse, ends come after starts, and ids are unique.
- **`data/`:** it is up to date with the source.
- **Tiles:** every lane's tiles hold exactly the events its roll-up rule selects, and no tile is too big.
- **Small files:** the manifest stays small, every scope has a lane file, every person is in one people file, and every event has a details record.
- **Importer:** using a made-up sample response, Wikidata dates, coverage ranking, de-duplication, merging an item found in two places, award titles and the output format, and that imported events reach lane tiles, search and details.
- **Search:** every event and lane is findable by each word of its title or name, also in a build with tiny search files (`build(src, { searchMax: 20 })`) that forces the three-letter split.

It then drives the app at desktop and phone sizes: lanes render, roll-up toggles, event details open, zoom and pan work, the lane picker and search work, share links restore the view, BCE years display, and there is no horizontal scroll at 390px. It also checks loading: the default view fetches only a few tiles, labels don't move when new tiles arrive, and a shared link to an unloaded event still opens it with its description. The label check serves a build with tiny tiles (`build(src, { maxPerTile: 8 })`) so that panning really fetches new periods. It also checks density: at every detail level, no screen-width (or quarter screen) of any lane holds more than twice the caps. Screenshots go to `tests/out/`, which is gitignored.

## Data model (`source/data.json`)

```jsonc
{
  "scopes": [
    { "id": "netherlands", "name": "Netherlands", "type": "country", "parent": "europe", "aliases": [] },
    { "id": "einstein", "name": "Albert Einstein", "type": "person", "parent": null,
      "born": "1879-03-14", "died": "1955-04-18", "home": "germany", "role": "Physicist" }
  ],
  "events": [
    { "id": "...", "title": "...", "start": "1918-11-10", "end": "1918-11-11",   // end ⇒ an era
      "scopes": ["netherlands", "germany"], "importance": 1, "desc": "...", "approx": true, "ongoing": true }
  ]
}
```
- **Scope types:** `world`, `continent`, `region`, `country`, `city`, `person`, `theme`. Places form a tree through `parent` (world › continent › region › country › city, e.g. Europe › United Kingdom › Scotland, or Europe › Netherlands › Amsterdam). People and themes have no parent.
- **Dates:** `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Negative years are BCE (`-44-03-15`). The precision you write is the precision shown. `approx: true` adds "c.".
- **Eras** have an `end`, or `ongoing: true` (runs to today). Everything else is a point event.
- **Importance:** 1 = world-historic, 2 = notable, 3 = local detail. It decides which events roll up, and is the biggest part of an event's score (see detail levels below).
- **`wikidata`** (optional, on scopes and events): the Wikidata item id (`Q55` for the Netherlands). The importer uses scope ids to find events, and an event's id to avoid duplicates. Mansa Musa, World and the themes have none yet.
- **`score`** (optional number): a manual boost when space is short, added to the computed score. Later this could come from popularity, such as how many Wikipedia languages cover the event.
- A person's lifespan era is generated from `born`/`died`, so don't add it as an event.
- An event can belong to several scopes. Tag the most specific place and the people involved; roll-up takes care of the parents.
- Event ids are slugs of the title (plus `-2` etc. if needed). Keep them stable, because share links use them (`e=`).

## Importing from Wikidata

`build/wikidata.mjs` queries the Wikidata query service for every place and person with a `wikidata` id.
- **Places:** dated items (point in time, or start/end) whose country (P17), "located in" (P131) or location (P276) is that place. Humans are excluded.
- **People:** their notable works (P800, dated by publication or inception), dated awards (P166), and significant events (P793).
- **Importance and score:** from how many Wikipedia languages cover the item. 80+ is importance 1, 30+ is importance 2, and the score is links/4.
- **Kept:** the best-covered 400 per place.
- **Skipped:** items without an English label, items already curated (same Wikidata id, or same title within a year), and dates vaguer than a millennium.
- **Ids:** imported event ids are `wd-<qid>`, stable across re-runs. Awards get the person appended, e.g. `wd-q38104-einstein`.

```bash
node build/wikidata.mjs --check                 # confirm every scope's Wikidata id names the right thing
node build/wikidata.mjs                         # import (min 15 sitelinks); then:
node build/build.mjs
node build/wikidata.mjs --only netherlands,einstein --min-links 30   # re-import some lanes, keep the rest
```

- **Requirements:** needs network access to `query.wikidata.org` (and `www.wikidata.org` for `--check`).
- **Caching:** responses are cached in `build/.cache/` (gitignored); delete it to refresh.
- **Failures:** if every query fails, the importer stops without touching `source/wikidata.json`.
- **Date caveat:** BCE years are taken as Wikidata gives them (`-0044` → 44 BCE). Wikidata's historical year numbering may put some BCE dates one year off.
- **Licence:** Wikidata is CC0, so no attribution is required, but `source/wikidata.json` records its source.

## How the data is loaded (tiles)

Built for hundreds of thousands of events. The app never loads everything; `build/build.mjs` splits the data the way maps split into tiles.

What the build writes to `data/`:
Every file is small and fetched only when needed; nothing grows with the total amount of data except the number of files.
- **`manifest.json`:** fetched first, always (~2 KB compressed). It holds only:
  - settings (detail-level zoom mapping, histogram bins, details shard count)
  - the list of people files and search files
  - the busiest places per century, for the picker's suggestions
  - a content hash `v`, added to every fetch (`?v=`) so caches refresh when the data changes
- **`scopes/places.json`:** every place and theme with its event count `n`. Fetched at start, because breadcrumbs, roll-up and the Places tab need the whole tree. This should stay a few thousand records at most.
- **`scopes/people-<n>.json`:** people by period of birth (`manifest.people` lists the files with their year ranges). Fetched by the People tab, and by the "alive in this period" and "alive at the same time" suggestions, via `peopleFor()`. The People tab shows the best-covered 60 per period; search finds the rest.
- **`lanes/<id>.json`:** fetched when a lane is shown (`ensureLane()`). Contains:
  - the lane's full record
  - `stats`: event count, time extent, a 25-year histogram for the overview bar, places that share many events with it, and its best-covered people
  - its tile index: entries `[lodFrom, lodTo, from, to, file]`
- **`tiles/<scope>/<band>/<from|all>.json`:** one lane, one band of detail levels, one period.
  - Records are compact arrays: `[id, title, start, end|0, importance, lod, flags, scopes, via|0]`. `lod` is this event's detail level *in this lane*.
  - Roll-up is done at build time, so a continent's tiles already include its countries' qualifying events. `via` names the child place an event came from; 0 means it's the lane's own.
  - Levels are grouped into 4 bands (0–4, 5–7, 8–10, 11–13), so a view needs few requests. A band's period splits 1000 → 100 → 10 → 1 years until a tile has ≤ 120 events. Eras go in every period they overlap.
- **`details/<shard>.json`:** fetched when an event is opened, or for a shared link to an event that isn't loaded (`loadEvent()`).
  - Each entry is `id → [record, description, {personId: name}]`.
  - The shard is a hash of the id; `detailShard()` is the same in the build and the app.
- **`search/<prefix>.json`:** search entries filed under the first two letters of each word (`words()` in the build, `searchWords()` in the app: lower-case, accents and filler words like "of"/"the" removed).
  - A file over 1,500 entries splits by three letters, and two-letter words then go in `<prefix>_`.
  - Entries are events `['e', ...record]` and lanes `['s', id, name, type, extra]`, where extra is `[born, died, role, home]` for people and the parent for places.
  - A query loads the file for its longest word (`searchFile()`, `searchLookup()`) and keeps entries where every query word starts a word of the title. Matching is by word start, not anywhere in the text.
  - Search covers titles and names, not descriptions.

**Detail levels (`lod`, `assignLods()` in the build):** these guarantee that no screen gets crowded, however much data there is.
- **Zoom:** level L appears from 2^(L − 3) px per year. Level 0 shows even with ~10,000 years on screen; level 13 needs about a one-year view. There are 14 levels, one per doubling of zoom, matching the app's layout levels.
- **Order:** within each lane, events are taken best score first. The score is importance, plus small boosts for a description and for links to several places or people, plus the optional `score`.
- **Placement:** each event gets the coarsest level at which, at that level and every finer one:
  - a screen-width (1200px) around it holds fewer than 30 events
  - 3/8 of a screen holds fewer than 10, so events can't bunch up in one corner
- **Eras:** an era counts as a bar only where it's at least 14px long and fewer than 4 eras overlap it. Otherwise it competes for space as a point, as the app then draws it.
- **Scale:** window counts use bins an eighth of a screen wide, so this stays fast for big lanes.
- **Ripple effect:** a busy period pushes its lesser events to finer levels. Around 1960, for example, Nigeria's independence only appears in the Africa lane once you zoom in to a few years.

In the app:
- `loadVisible()` runs when the view comes to rest. It fetches the lane files for the lanes on screen, then their tiles for the period on screen plus a screen's width either side, and full detail around a selected event.
- At start the app loads the manifest, `places.json` and the lane files for the lanes in the link (or the defaults) in parallel. Anything else arrives on demand: people, search files, details.
- People can be known before their lane file arrives (from a search entry, a people file or an event's names). `registerScope()` merges whatever is known, and lanes render with what they have until the lane file fills in the rest.
- `maxLod(pxPerYear)` gives the finest level to show, using `lodBase` and `lodCount` from the manifest.
- `layoutLane()` is incremental: new events fill free rows and never move events already placed.

`data/` is committed for now, because GitHub Pages serves this repo straight from `main`. At much larger sizes, build it in a GitHub Action instead and keep it out of git.

## How lanes are filled (roll-up)

The rule, applied in `build/build.mjs` (the app reads the result with `laneItems(scopeId, rollup)`):
- A lane always shows events tagged with its own scope.
- With "Include sub-regions" on (the default), it also shows events from descendant scopes:
  - one level down: importance ≤ 2
  - two or more levels down: importance 1 only
  - eras roll up only one level, and only at importance 1
- Rolled-up items are drawn hollow or dashed, and their tooltip says "via X".
- **Level of detail by zoom:** a lane shows events whose per-lane `lod` is at most `maxLod()` for the zoom (see detail levels above).

## Adding lanes (the picker)

The "Add lane" dialog (`renderPicker()`) has a search box and five tabs. Each lane is a card that toggles on click:
- **Suggested** (the default):
  - `suggestions()`: lanes related to the current lanes. These are the parent, children and siblings of a place, people from that place, a person's home country, people alive at the same time, and places that share the most events with a lane.
  - People alive in the period on screen.
  - The busiest places in that period.
  - A few comparisons.
  - Each lane appears in only one section.
- **Places:** the whole place tree, grouped by continent.
- **People:** grouped by period, with lifespan bars.
- **Themes.**
- **Comparisons:** presets from `COMBOS`. Choosing one replaces your lanes and the view.

Search matches:
- names, aliases and roles
- the parent's name ("europe" lists European countries)
- event text: "plague" suggests the lanes whose events mention it

Enter toggles the first result. On a phone the dialog is full screen, and the current lanes show as removable chips.

## Look

The style is "Bold blocks", a light theme only. Dark mode was tried and removed on purpose. The look has:
- thick ink outlines, hard offset shadows and square corners
- solid primary-colour era blocks with uppercase labels
- diamond event markers, and a thick cursor with a yellow year tag
- Bricolage Grotesque, with Space Mono for numbers

How it's built:
- **Colours:** CSS custom properties on `:root`, in the theme block near the end of the `<style>`.
- **Lane colours:** they come from `PALETTE`. The World lane uses `WORLD_COLOR`.
- **Text on coloured blocks:** `inkOn(colour)` picks black or white, whichever has more contrast.
- **Lane names:** they are coloured tags. On phones the tag sits inside the track (`.mobile-name`).
- **Events:** solid diamonds are a lane's own events. Hollow diamonds and dashed, paler eras are rolled up from child places.

## Layout decisions

**Scrolling must stay smooth: nothing may jump while you pan or zoom.** The rendering is built around that:

- **Layout is per zoom level, not per frame.**
  - `layoutLane()` assigns rows once for each power of two of pixels-per-year (`zoomLevel()`), over all of the lane's events, in years rather than pixels. It is cached.
  - Panning never changes the layout. Zooming in within a level only spreads things apart.
  - Rows can only change when you cross a 2× zoom boundary.
- **The DOM is built once per level.**
  - `buildLanes()` runs only when the lanes, roll-up settings, zoom level or phone/desktop mode change.
  - Each frame, `positionLanes()` only moves elements with `transform` and hides those far off-screen.
  - Selection just toggles a class (`applySelection()`) and never re-lays out.
- **Vertical layout changes only at rest.**
  - Era rows and the dot line have fixed positions per level.
  - About 120ms after the view stops moving, `settleLanes()` adjusts each lane's height. It also slides the dots and labels up past era rows that are empty in view. Both animate with CSS.
- **Motion.**
  - The view animates towards `target` for wheel zoom, buttons and presets.
  - Drag and pinch set the view directly; a drag keeps momentum (`velocity`) after release.
  - `requestView()` is the cheap per-frame path. `requestRender()` also refreshes the cards, minimap bars and detail panel.
- The smoke test checks that dragging changes no label's row and no lane's height.

Other layout rules:

- **Rows per lane:** up to 6 rows of eras on top, then a line of dots, then up to 4 rows of labels. Events that don't fit in the label rows stay as dots, which you can still hover and click.
- Eras narrower than 14px at the zoom level are drawn as points. An era with less than 30px visible hides its text.
- **Interaction:**
  - mouse wheel zooms around the pointer; horizontal scroll or shift+wheel pans
  - drag pans; pinch zooms on touch
  - tap or click moves the cursor
  - ←/→ pan, +/− zoom, `/` opens search
- **URL hash holds the whole view:** `#lanes=world,netherlands,einstein&from=1850&to=1970&at=1905&e=<event id>`. A `!` after a lane id means roll-up is off for that lane.
- At ≤ 760px the label column is hidden, each lane shows its name as a tag inside the track, and the detail panel becomes a bottom sheet.

## Ideas not built yet

- A vertical timeline on phones (lanes as columns), as in the mockups.
- More data. Coverage is densest for Europe and 1500–2000, and some person lanes have only 2–3 events.
- User-added events and lanes.
