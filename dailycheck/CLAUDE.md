# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Dailycheck" — a checklist for tasks you repeat several times a day (push-ups AM/lunch/PM, water
the garden once). You define a daily template once; every day the app gives you a fresh empty copy
to tick off. Single-file vanilla HTML/CSS/JS, no build tools, no dependencies, no back end. All
state lives in `localStorage`.

`PLAN.md` is the reviewed design brief this was built from. Where the code deviates, this file wins
— deviations are listed at the bottom.

## Running Locally

Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
```

Deployed via GitHub Pages at labs.vossers.com/dailycheck/

## Architecture

Everything lives in a single `index.html`. It is built for a phone: unlock, open, tick, gone.

### Layout

- **Days are a vertical accordion.** Today and Yesterday only. Today is open on load. Single-open;
  clicking the open day closes it. Header carries the day name, date and a `done/total` count, so a
  collapsed Yesterday still says whether you finished. Height animates via a
  `grid-template-rows: 0fr → 1fr` transition, which animates to `auto` height without measuring JS.
- **Categories are plain columns — always expanded, two to a row.** Every column shows its name,
  its labels and its checkboxes at all times, and every checkbox is always tickable. There is no
  open/collapsed state and nothing to tap before ticking. A third category wraps onto a new row,
  and so on every two. Nothing scrolls sideways.

An earlier revision made the columns a *horizontal accordion* — one open column with labels, the
rest collapsed to 42px strips with their names rotated 90°. That is gone. If you are tempted to
reintroduce rotated column headers, note why they were dropped: vertical text is hard to read at a
glance, and it capped category names at about 9 characters. Horizontal names fit ~15 and wrap to a
second line.

### Column geometry

- `--headh` and `--row` are both 44px, so the checkbox rows of two columns sitting side by side line
  up with each other. Nothing draws that alignment any more — see below — but it is still what makes
  a row of columns read as a row.
- Columns are top-aligned stacks, not a grid. Garden's single checkbox does not get filler rows.
- Width is a flat `flex: 0 0 50%` on a wrapping flex row — exactly two per row, no growing, no
  shrinking, no scrolling. **One exception:** `.cols:not(:has(.col:nth-child(3))) .col` sets
  `flex-grow: 1`, so a lone category uses the row it already owns. From three upwards the grid
  stays strict; without that guard the odd column on the last row would stretch to full width and
  read as broken.
- **There are no lines inside a day at all.** No ruled-paper background behind the columns, no
  dividers between them, no rule under each checkbox row, and since round 5 no wrapped-row boundary
  either. Whitespace, the 44px rhythm and the column header's own styling (uppercase mono, dimmed,
  accent tick) do all the separating.
- The wrapped-row boundary may come back — the user asked to try it removed first. It was:

  ```css
  .col:nth-child(2n + 1):not(:first-child)::before {
    content: ""; position: absolute; left: 0; top: 0;
    width: 200%; height: 1px;            /* every column is a half, so 200% is full width */
    background: var(--rule);
  }
  ```

  `.col` keeps `position: relative` as its anchor. Nothing else needs changing to restore it.
- Row offsets are still whole multiples of 44 (0 / 132 / 308 with 5 categories), which is worth
  keeping even without the ruling. Measure only *after* the staggered load-in finishes — during the
  animation `translateY` makes it look 1px out.
- At two per row a column is 195px on a 390px phone and still 160px at 320px, so labels have room
  to spare and no narrow-screen special case is needed. Verified: no clipped labels at either width.

Note the coupling: `--colw`, the `nth-child` selectors and the row rule's `width` all encode the
same "columns per row" number. Changing the count means changing all four.

### Ticking

Every checkbox is operable at all times — one tap, no gating. `toggleSlot()` flips `aria-pressed`,
writes the timestamp, replays the pop animation and updates the day count.

### Rendering model

`render()` builds the DOM; **interactions mutate it in place**. A full `innerHTML` rebuild would
destroy every CSS transition mid-flight, so rebuilds happen only on template change, day rollover,
import and cross-tab sync. Ticking updates one `aria-pressed` plus the day count
(`refreshCounts`). A single delegated click listener on `#main` handles day headers and slots.

## Storage

One `localStorage` key, `dailycheck.v1`, holding the whole blob:

```jsonc
{
  "version": 1,
  "template": { "categories": [ { "id", "name", "accent": 0-3, "slots": [ { "id", "label" } ] } ] },
  "days": { "2026-08-01": { "<slotId>": 1754043210000 } },
  "ui": {}
}
```

`ui` is currently empty — it held `openCategory` while the columns were an accordion. Kept as a
slot for future view state; `normalize()` drops anything it does not recognise.

- **Day keys are local `YYYY-MM-DD`, never UTC** — a UTC key flips the day at the wrong moment for
  anyone off GMT. `dateKey()` is the only place that formats them.
- **Ticks store a timestamp, not `true`.** Same cost, and it leaves the door open for streaks or a
  heat-map later.
- **Slot ids are stable and independent of labels**, so renaming `AM ×15` to `AM ×20` keeps history.
  Reps are text inside the label — the app never parses them and there is no numeric rep field.
- Deleting a slot leaves orphan ticks in past days; the renderer ignores unknown ids rather than
  pruning them, so a delete-and-re-add does not destroy yesterday.
- Yesterday renders against the *current* template — there are no per-day template snapshots. Add a
  category today and it appears unticked in yesterday. Deliberate simplification.
- `prune()` drops days older than 60 on load.
- `normalize()` is the single defensive gate: it runs on load *and* on import, coercing types,
  generating missing ids and dropping malformed day keys. Every `localStorage` call is wrapped in
  try/catch so private mode degrades to in-memory rather than a blank screen.

### Day rollover

`todayKey()` is recomputed on every render, never cached. `checkRollover()` re-renders when the date
has changed and is wired to `visibilitychange`, `pageshow` and a timer just past local midnight, so
a tab left open overnight rolls Today into Yesterday on its own. Verified with a fake clock.

## Design system

- **Aesthetic**: an analogue training ledger. Ink, brass, ruled lines. The screen visibly warms as
  the day fills in — that is the emotional point of the app.
- **Fonts**: Fraunces (day headers, wordmark, intro) + DM Mono (everything else). Column names are
  uppercase mono with wide tracking, clamped to two lines.
- **Palette**: warm near-black `--ink`, aged paper `--paper`, and four accents in one warm family —
  brass `--a0`, copper `--a1`, moss `--a2`, clay `--a3`. Categories pick one; ticked boxes fill with
  it. Dark only; no light theme. Everything routes through custom properties on `:root`.
- **Texture**: SVG `feTurbulence` grain overlay and a warm radial vignette from the top. No rules,
  no dividers — the ledger reads through type, colour and rhythm rather than drawn lines.
- **Motion**: one staggered load-in (`--i` per column, left to right and down), then quiet. The only
  other motion is the day accordion and the tick pop. `--dur`/`--dur-fast` collapse to 1ms under `prefers-reduced-motion`.

## Deviations from PLAN.md

`PLAN.md` §3.2–§4 were rewritten after review round 2 dropped the column accordion; the rest of the
plan still stands. Remaining deviations:

- `ui.openDay` was dropped. The app always opens Today on load; persisting "Yesterday was open"
  would be actively annoying.
- The per-column `done/total` count was removed along with the accordion. With every checkbox and
  label on screen it was redundant, and a ~130px column has no room for a name *and* a count.
- Horizontal scrolling (review round 3) is gone; columns wrap instead. Do not reintroduce
  `overflow-x` on `.cols` — the wrap is the whole layout now.
- The ruled-paper background and column dividers described in `PLAN.md` §8 were removed in review
  round 4 as too many lines, and the wrapped-row boundary in round 5. The snippet for restoring
  that last one is under "Column geometry" above.
