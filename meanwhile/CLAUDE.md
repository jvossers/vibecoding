# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Meanwhile** is a history browser built on swim lanes. You pick lanes, which can be countries, continents, people or themes, and see their events and eras side by side on one zoomable timeline. That shows what was happening at the same time: for example the Netherlands, Albert Einstein and Africa in 1905.

- **Tech:** static site, vanilla HTML/CSS/JS, no framework, no backend. The only build step turns the source data into tiles (`node build/build.mjs`).
- **Live at:** `labs.vossers.com/meanwhile/` (GitHub Pages, like the other vibes in this repo).

## Files

```
index.html          the whole app: markup, CSS, JS
source/data.json    the source of truth: ~140 scopes (lanes) and ~1,050 events/eras
build/build.mjs     turns source/data.json into data/ (run it after every data change)
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

It then drives the app at desktop and phone sizes: lanes render, roll-up toggles, event details open, zoom and pan work, the lane picker and search work, share links restore the view, BCE years display, and there is no horizontal scroll at 390px. It also checks loading: the default view fetches only a few tiles, labels don't move when new tiles arrive, and a shared link to an unloaded event still opens it with its description. Screenshots go to `tests/out/`, which is gitignored.

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
- **Importance:** 1 = world-historic, 2 = notable, 3 = local detail. It drives roll-up and level of detail.
- A person's lifespan era is generated from `born`/`died`, so don't add it as an event.
- An event can belong to several scopes. Tag the most specific place and the people involved; roll-up takes care of the parents.
- Event ids are slugs of the title (plus `-2` etc. if needed). Keep them stable, because share links use them (`e=`).

## How the data is loaded (tiles)

Built for hundreds of thousands of events. The app never loads everything; `build/build.mjs` splits the data the way maps split into tiles.

What the build writes to `data/`:
- **`manifest.json`:** fetched at start.
  - every scope, plus per-lane `stats`: event count, time extent, a 25-year histogram for the overview bar and the busiest-places suggestions, and places that share many events with the lane
  - the tile index: `tiles[scope] = [[lod, from, to, file], …]`
  - a content hash `v`, added to every fetch (`?v=`) so caches refresh when the data changes
- **`tiles/<scope>/<lod>/<from|all>.json`:** one lane, one detail level, one period.
  - Records are compact arrays: `[id, title, start, end|0, importance, lod, flags, scopes, via|0]`.
  - Roll-up is done at build time, so a continent's tiles already include its countries' qualifying events. `via` names the child place an event came from; 0 means it's the lane's own.
  - Each level holds only the events new at that level. A period splits 1000 → 100 → 10 → 1 years until a tile has ≤ 120 events. Eras go in every period they overlap.
- **`details/<shard>.json`:** descriptions, fetched when an event is opened. The shard is a hash of the id; `detailShard()` is the same in the build and the app.
- **`search.json`:** every event in short form, fetched on the first event search, or to open a shared link to an event that isn't loaded.

**Detail level (`lod`):** for now this is `importance - 1`. Step 2 of the plan replaces it with a score-based level that caps how many events any screen can show.

In the app:
- `loadVisible()` runs when the view comes to rest. It fetches tiles for the lanes on screen, a screen's width either side, and full detail around a selected event.
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
- **Level of detail by zoom (`maxLod()`):** zoomed far out shows lod 0 only, then ≤ 1, then everything (about > 1500 years, > 400 years and closer on a desktop screen).

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
