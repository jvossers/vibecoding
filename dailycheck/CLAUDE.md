# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Vinker" — a checklist for tasks you repeat several times a day (push-ups AM/lunch/PM, water
the garden once). You define a daily template once; every day the app gives you a fresh empty copy
to tick off. Single-file vanilla HTML/CSS/JS, no build tools, no dependencies, no back end. All
state lives in `localStorage`.

> **The folder is `dailycheck/` and must stay that way.** The app was called Dailycheck until
> August 2026; the URL `labs.vossers.com/dailycheck/` has been shared with people and renaming the
> folder would break their links and their home-screen shortcuts. The folder name is a legacy path,
> not the brand. Everything user-facing says "Vinker".

`PLAN.md` is the reviewed design brief this was built from. Where the code deviates, this file wins
— deviations are listed at the bottom.

## Running Locally

Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
```

Deployed via GitHub Pages at labs.vossers.com/dailycheck/ (legacy path — see above)

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

- `--row` is 44px for every checkbox row, so two columns side by side keep their checkboxes aligned.
  `--headh` (58px) only has to be *the same for every column*; it stopped needing to be a multiple
  of `--row` when the ruled background went away, and it grew to fit the accent tick and streak
  badge on their own line under the name.
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

### Schedules

A category can run on only some weekdays. `days` is an array in JS `getDay()` numbering
(0 = Sunday); absent, empty or all seven means daily, so everything that predates the feature and
every import without the field is daily by default.

- **Three separate questions, and conflating them is a bug factory:**
  - `runsOn(cat, day)` — does the current schedule name this day? Nothing else. Deliberately does
    not care whether the category has checkboxes, or an empty one would vanish from the day view.
  - `showsOn(cat, day)` — render the column? `runsOn` **or** the day has ticks, so entries the user
    made are never hidden. Drives `catsOn`, the not-today list and `dayTotals`, so the count always
    matches the boxes on screen.
  - `countsOn(cat, day)` — does this day count towards the streak? The only one that consults
    `schedSince`.
- **Editing a schedule must not rewrite history.** `schedSince` records the day the schedule was
  last changed. For days *before* it we don't know what the schedule was, so `countsOn` judges by
  behaviour: a day with ticks counts as a day it applied, a day without is forgiven. Without this,
  adding Wednesday to a Saturday-only category would make every past Wednesday a missed scheduled
  day and kill the streak instantly — the same trap as slot `since`. Editing config never destroys
  history.
- **`schedSince` must never drive rendering.** It did, once (the round-7 bug): a category created
  today and set to Saturdays has a `schedSince` of today, so yesterday fell into the
  judge-by-behaviour branch, found no ticks, and hid the column from yesterday's panel — on a
  Saturday. Rendering asks `showsOn`, which knows only the current schedule and the ticks.
- **Non-applicable categories are hidden, not greyed out.** A ghost column costs a full column of
  screen for something you can't tick, and the cost scales with how much you use scheduling.
  Instead `restHTML()` emits one dim line — `Not today — Groceries (Sat)`. If *nothing* runs today
  it emits `Nothing scheduled today`, and since `total` is 0 such a day is never "done".
- **Streaks step over unscheduled days.** `streakFor` skips days the category doesn't run — they
  neither count nor break — so a Saturday-only category keeps its streak all week. The walk is
  bounded by `KEEP_DAYS + 7`: with the behaviour rule above, days with no ticks read as "doesn't
  apply", so an unbounded walk would run backwards forever.
- Counts (`dayTotals`) only consider what runs that day, so a Wednesday reads `0/6`, not `0/7`.
- The editor shows seven toggles, **Monday first** (`WEEK` = `[1..6,0]`), and refuses to switch off
  the last remaining day — a category with no days would silently never appear again.
- Known gap: completing a Saturday-only category *from yesterday's panel on a Sunday* increments
  the streak but shows no badge or burst, because the column isn't on today's screen. It surfaces
  next Saturday.

Deliberately not built: any way to record an off-schedule tick. Solving it means showing hidden
categories again, which undoes the decision above.

### Ticking

Every checkbox is operable at all times — one tap, no gating. `toggleSlot()` flips `aria-pressed`,
writes the timestamp, replays the pop animation, updates the day count and refreshes streaks.

### Streaks

Per category, shown under the column name next to its accent tick, as a flame plus a number.

- **`streakFor(cat)`** counts consecutive complete days back from today. Today counts only once it
  is complete; until then the number shown is the run up to yesterday. That is deliberate — the
  number the user is protecting stays visible all day, and ticking the last box of a category is
  what makes it tick over, which is when the burst fires.
- **`isComplete(cat, day)`** requires every checkbox *that counts for that day* to be ticked. A slot
  counts if it existed then (`since` <= day, where slots with no `since` predate the field and count
  as always having existed) **or if it was actually ticked then**. That second clause is not
  optional — yesterday's panel renders against the *current* template, so a checkbox added today can
  be ticked for yesterday, and skipping it silently threw that tick away (the round-6 bug: a new
  category ticked both yesterday and today showed a streak of 1). The `since` exemption exists to
  stop a template edit *penalising* past days; it must never discard a deliberate tick.
  A category with nothing counting on a day — no checkboxes, or none created yet and none ticked —
  is never complete, so a new category cannot inherit a streak from before it existed.
  Covered by tests: old-only ticked, old+new ticked, new-only ticked (must not count), neither.
- **Badges live on today's panel only**; they are a "right now" number. A tick in *yesterday* can
  still change one (it can repair a broken run), so `refreshStreaks()` runs after every tick
  wherever it happened and bursts wherever the number went up.
- **`KEEP_DAYS` bounds the longest possible streak**, since streaks are derived from stored history
  and nothing else. It was raised from 60 to 400 for exactly this reason. Lower it and you silently
  cap streaks.
- The burst is ten sparks plus a ring, laid into the DOM once at render and replayed by toggling
  `.pop` (with a forced reflow between remove and add). Losing a streak removes `.pop` — a drop is
  not a celebration.

The icon is a filled flame at 11×13px. A thunderbolt was the alternative; to swap, replace the
`SICON` path with `M9.6 1 L3 9.3 h3.7 L6.2 15 l6.4-8.7 h-3.9 z` on a `0 0 16 16` viewBox.

### Rendering model

`render()` builds the DOM; **interactions mutate it in place**. A full `innerHTML` rebuild would
destroy every CSS transition mid-flight, so rebuilds happen only on template change, day rollover,
import and cross-tab sync. Ticking updates one `aria-pressed` plus the day count
(`refreshCounts`). A single delegated click listener on `#main` handles day headers and slots.

## Storage

One `localStorage` key, `vinker.v1`, holding the whole blob:

```jsonc
{
  "version": 1,
  "template": { "categories": [
    { "id", "name", "accent": 0-7,
      "days": [3, 6], "schedSince": "2026-08-05",     // both absent = daily
      "slots": [ { "id", "label", "since": "2026-08-05" } ] } ] },
  "days": { "2026-08-01": { "<slotId>": 1754043210000 } },
  "ui": {}
}
```

**Migration from the old keys.** The app was renamed twice: `dailycheck.v1` → `dayafterday.v1` →
`vinker.v1`. `OLD_KEYS` lists the legacy keys newest-first; `load()` takes the first one it finds,
copies it across, and then **deletes them all** via `dropLegacyKeys()`. That deletion is the
important half. Leave a legacy key in place and "Delete everything" becomes undoable: it removes
`vinker.v1`, the next load finds the old key still there, and cheerfully restores what the user
just deleted. `wipe()` calls `dropLegacyKeys()` for the same reason. All four paths are tested —
migrating from either old key, from both at once, and wiping with a stale key present.

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
- **The mark**: a filled, tapered checkmark that also reads as a bird in flight — *vink* is Dutch
  for both the tick and a finch. It replaced a tally gate at the rename. It is drawn as a filled
  path rather than a stroke because at 23×15px a stroked curve reads as a squiggle; the taper is
  what makes it a bird rather than a check. Same path serves the top bar and the favicon.
- **Fonts**: Fraunces (day headers, wordmark, intro) + DM Mono (everything else). Column names are
  uppercase mono with wide tracking, clamped to two lines.
- **Palette**: warm near-black `--ink`, aged paper `--paper`, and eight accents — brass, copper,
  moss, clay, verdigris, indigo, plum, rose (`--a0`…`--a7`). The first four are warm, the last four
  lean cooler so a long list of categories stays tellable apart; all are muted enough to sit in the
  ink world. Categories pick one; ticked boxes, the accent tick and the streak all use it. To add
  more, define `--a8` and bump `ACCENTS` — `ACCENT_LIST` and the editor swatches follow. Dark only;
  no light theme.
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
