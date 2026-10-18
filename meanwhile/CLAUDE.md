# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Meanwhile** is a history browser built on swim lanes. You pick lanes, which can be countries, continents, people or themes, and see their events and eras side by side on one zoomable timeline. That shows what was happening at the same time: for example the Netherlands, Albert Einstein and Africa in 1905.

- **Tech:** static site, vanilla HTML/CSS/JS, no build step, no framework, no backend.
- **Live at:** `labs.vossers.com/meanwhile/` (GitHub Pages, like the other vibes in this repo).

## Files

```
index.html        the whole app: markup, CSS, JS
data.json         scopes (lanes) and ~660 events/eras
tests/smoke.mjs   data checks + Playwright smoke test
```

## Running locally

`index.html` fetches `data.json`, so it needs http, not `file://`:
```bash
python3 -m http.server 8765   # then open http://localhost:8765/
```

## Testing

```bash
cd tests && npm install && npm test
# or, in the cloud container, with the preinstalled browser:
PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm test
```
The test validates `data.json`: parents and scopes exist, dates parse, ends come after starts, and ids are unique. It then drives the app at desktop and phone sizes: lanes render, roll-up toggles, event details open, zoom and pan work, the lane picker and search work, share links restore the view, BCE years display, and there is no horizontal scroll at 390px. Screenshots go to `tests/out/`, which is gitignored.

## Data model (`data.json`)

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
- **Scope types:** `world`, `continent`, `region`, `country`, `person`, `theme`. Places form a tree through `parent` (world › continent › region › country). People and themes have no parent.
- **Dates:** `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Negative years are BCE (`-44-03-15`). The precision you write is the precision shown. `approx: true` adds "c.".
- **Eras** have an `end`, or `ongoing: true` (runs to today). Everything else is a point event.
- **Importance:** 1 = world-historic, 2 = notable, 3 = local detail. It drives roll-up and level of detail.
- A person's lifespan era is generated from `born`/`died`, so don't add it as an event.
- An event can belong to several scopes. Tag the most specific place and the people involved; roll-up takes care of the parents.
- Event ids are slugs of the title (plus `-2` etc. if needed). Keep them stable, because share links use them (`e=`).

## How lanes are filled (roll-up)

`laneItems(scopeId, rollup)` in `index.html`:
- A lane always shows events tagged with its own scope.
- With "Include sub-regions" on (the default), it also shows events from descendant scopes:
  - one level down: importance ≤ 2
  - two or more levels down: importance 1 only
  - eras roll up only one level, and only at importance 1
- Rolled-up items are drawn hollow or dashed, and their tooltip says "via X".
- **Level of detail by zoom:** spans > 1500 years show importance 1 only, > 400 years show ≤ 2, otherwise everything.

## Layout decisions

- **Lane height grows to fit:** era rows (up to 6) on top, then a line of dots, then up to 4 rows of labels. Events that don't fit in the label rows stay as dots, which you can still hover and click.
- Eras narrower than 14px at the current zoom are drawn as points.
- **Interaction:**
  - mouse wheel zooms around the pointer; horizontal scroll or shift+wheel pans
  - drag pans; pinch zooms on touch
  - tap or click moves the cursor
  - ←/→ pan, +/− zoom, `/` opens search
- **URL hash holds the whole view:** `#lanes=world,netherlands,einstein&from=1850&to=1970&at=1905&e=<event id>`. A `!` after a lane id means roll-up is off for that lane.
- At ≤ 760px the label column is hidden, each lane shows its name as a tag inside the track, and the detail panel becomes a bottom sheet.

## Ideas not built yet

- A vertical timeline on phones (lanes as columns), as in the mockups.
- More ancient, Asian, African and South American data. Coverage is densest for Europe and 1500–2000.
- User-added events and lanes.
