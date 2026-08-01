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
- **Categories are plain columns — always expanded.** Every column shows its name, its labels and
  its checkboxes at all times, and every checkbox is always tickable. There is no open/collapsed
  state and nothing to tap before ticking. When the columns do not all fit, the row scrolls
  sideways; it never shrinks them below a readable width.

An earlier revision made the columns a *horizontal accordion* — one open column with labels, the
rest collapsed to 42px strips with their names rotated 90°. That is gone. If you are tempted to
reintroduce rotated column headers, note why they were dropped: vertical text is hard to read at a
glance, and it capped category names at about 9 characters. Horizontal names fit ~15 and wrap to a
second line.

### Column geometry

- `--headh` (44px) is **exactly one `--row` (44px) unit**. That is load-bearing: the ruled-paper
  background is a 44px `repeating-linear-gradient`, so every rule lands on a slot-row boundary and
  columns of different lengths sit on the same ruling. Change one without the other and the
  alignment breaks.
- The ruling is drawn on `.clip::after` (the day-body wrapper), *not* on `.cols`, so it holds still
  while the columns scroll sideways. It sits at `z-index: 0`, behind the columns.
- Columns are top-aligned stacks, not a grid. Garden's single checkbox does not get filler rows.
- Width is `flex: 1 0 var(--colw)` with `min-width: var(--colmin)`. `--colw` is **31.5%**, chosen so
  that three columns have free space left over and grow to fill a phone exactly (130px each at
  390px, no scrolling — the common case), while a fourth pushes past the edge and leaves a sliver
  showing. `--colmin` (126px) is the point at which a label like `Lunch ×15` starts to clip; below
  ~360px wide the row scrolls rather than squeezing. `flex-shrink` is 0 throughout.
- `.cols` scrolls with `scroll-snap-type: x proximity` and `scroll-snap-align: start` on each
  column, so swiping settles on a column edge instead of mid-label.

### Scroll hint

CSS cannot ask whether a box is scrollable, so `syncScrollHint()` toggles `.more-right` on the day
wrapper and `.clip::before` fades the right edge. It is deliberately narrow (20px): a wider fade
swallowed the ~12px sliver of the next column, hiding the very thing that signals "keep swiping".
Re-synced on scroll, on day open, and on resize. Listeners are attached in `render()` because a
rebuild replaces the elements.

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
- **Texture**: SVG `feTurbulence` grain overlay, a warm radial vignette from the top, hairline
  column dividers and the 44px ruling.
- **Motion**: one staggered load-in (`--i` per column), then quiet. The only other motion is the day
  accordion and the tick pop. `--dur`/`--dur-fast` collapse to 1ms under `prefers-reduced-motion`.

## Deviations from PLAN.md

`PLAN.md` §3.2–§4 were rewritten after review round 2 dropped the column accordion; the rest of the
plan still stands. Remaining deviations:

- `ui.openDay` was dropped. The app always opens Today on load; persisting "Yesterday was open"
  would be actively annoying.
- The per-column `done/total` count was removed along with the accordion. With every checkbox and
  label on screen it was redundant, and a ~130px column has no room for a name *and* a count.
