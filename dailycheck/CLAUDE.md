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

### The two nested accordions

The interface is two accordions running in different axes:

- **Outer, vertical — days.** Today and Yesterday only. Today is open on load. Single-open;
  clicking the open day closes it. Header carries the day name, date and a `done/total` count, so a
  collapsed Yesterday still says whether you finished. Height animates via a
  `grid-template-rows: 0fr → 1fr` transition, which animates to `auto` height without measuring JS.
- **Inner, horizontal — categories.** Each category is a column in a flex row; exactly one is open.
  **The rule the whole layout serves: every checkbox for the day stays visible; only the open
  column's labels are shown.** Collapsing a column hides its text, never its checkboxes.

### Column geometry

- `--headh` (88px) is **exactly two `--row` (44px) units**. That is load-bearing: the ruled-paper
  background is a 44px `repeating-linear-gradient`, so every rule lands on a slot-row boundary and
  columns of different lengths sit on the same ruling. Changing one without the other breaks the
  alignment.
- The ruling is drawn on `.clip::after` (the day-body wrapper), *not* on `.cols`, so it stays fixed
  if the column row ever scrolls sideways. It sits at `z-index: 0`, behind the columns, and the open
  column's wash is translucent so the rules read through it.
- Columns are top-aligned stacks, not a grid. Garden's single checkbox does not get filler rows.
- Open column width is `max(--minopen, calc(100% - (n-1) * --strip))`, where `--n` is written onto
  `.cols` by JS. That is exactly the space the collapsed strips leave over, so the row fills the
  screen and nothing scrolls — until roughly seven categories, where the strips alone outgrow a
  phone. Past that `.cols` scrolls horizontally and the open column holds at `--minopen` (150px)
  rather than collapsing to a sliver. `flex-shrink` is 0 throughout; the transition is on
  `flex-basis`.

### The pivoting column title

`writing-mode` cannot be animated, so `.col-title` is absolutely positioned and rotated:
`rotate(-90deg)` with `transform-origin: 0 100%` when collapsed, `rotate(0deg)` when open. It pivots
around its own bottom-left corner while `left` and `letter-spacing` transition alongside, so the
text appears to swing down and relax into place.

Two traps worth knowing:

- The open state uses `max-width: none`, **not** a percentage. A percentage clamp resolves against
  the column's in-flight width and squeezes the title to nothing mid-slide. The collapsed clamp is
  re-applied through a `max-width 0ms linear var(--dur)` transition — i.e. only after the column has
  finished closing.
- Collapsed titles fit about 9 characters before ellipsizing; that is the practical ceiling on a
  category name's *vertical* rendering. The full name always shows when the column is open.

### Ticking

**Checkboxes are only operable while their column is open.** Collapsed boxes are `disabled` (set by
`syncDisabled()`) and `pointer-events: none`, so a tap falls through to the column and opens it
instead — the whole collapsed strip is one big "open me" target and a mis-aimed thumb can never
silently mark a task done. Screen readers still announce their pressed state.

### Rendering model

`render()` builds the DOM; **interactions mutate it in place**. A full `innerHTML` rebuild would
destroy every CSS transition mid-flight, so rebuilds happen only on template change, day rollover,
import and cross-tab sync. Ticking updates one `aria-pressed` plus the counts (`refreshCounts`);
opening a column just moves the `.open` class. A single delegated click listener on `#days` handles
day headers, slots and columns, with the column's open state as the gate between the last two.

## Storage

One `localStorage` key, `dailycheck.v1`, holding the whole blob:

```jsonc
{
  "version": 1,
  "template": { "categories": [ { "id", "name", "accent": 0-3, "slots": [ { "id", "label" } ] } ] },
  "days": { "2026-08-01": { "<slotId>": 1754043210000 } },
  "ui": { "openCategory": "c_x" }
}
```

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
- **Fonts**: Fraunces (day headers, wordmark, intro) + DM Mono (everything else). The mono does real
  work in the rotated column headers.
- **Palette**: warm near-black `--ink`, aged paper `--paper`, and four accents in one warm family —
  brass `--a0`, copper `--a1`, moss `--a2`, clay `--a3`. Categories pick one; ticked boxes fill with
  it. Dark only; no light theme. Everything routes through custom properties on `:root`.
- **Texture**: SVG `feTurbulence` grain overlay, a warm radial vignette from the top, hairline
  column dividers and the 44px ruling.
- **Motion**: one staggered load-in (`--i` per column), then quiet. `--dur`/`--dur-fast` collapse to
  1ms under `prefers-reduced-motion`.

## Deviations from PLAN.md

- `ui.openDay` was dropped. The app always opens Today on load; persisting "Yesterday was open"
  would be actively annoying. Only `openCategory` persists.
- Collapsed checkboxes are `disabled` `<button>`s rather than inert `<span>`s. Same effect, but it
  keeps the DOM shape identical between states and preserves the accessible name and pressed state.
- Collapsed strips stayed at 42px (the plan floated dropping them further); below that the rotated
  title stops being readable.
