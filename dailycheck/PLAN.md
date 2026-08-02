# DAILYCHECK — a daily repeating-task checklist

**Status:** built. Revised after review rounds 1–3; this describes what was implemented.
`CLAUDE.md` documents the code as it stands.
**Location:** `/dailycheck/index.html` → deployed at `labs.vossers.com/dailycheck/`
**Stack:** single-file vanilla HTML/CSS/JS. No build, no dependencies, no back end. All state in `localStorage`.

---

## 1. What it is

A checklist for tasks you repeat *every day, several times a day*.

Not a to-do list (things you do once and delete). It's a **daily template**: you define once what a
day looks like, and every day the app hands you a fresh, empty copy of it to tick off.

The worked example from your description:

| Category | Slots (checkboxes) |
|---|---|
| Push-ups | AM ×15 · Lunch ×15 · PM ×15 |
| Pull-ups | AM ×8 · PM ×8 |
| Garden | Water |

That's 6 checkboxes for the day. Tomorrow, 6 empty ones again.

**Primary use case:** phone, one-handed, five seconds. Unlock → open page → tick → gone.
Everything below is subordinate to that.

---

## 2. Core concepts

- **Category** — a recurring activity (Push-ups). Becomes a *column*.
- **Slot** — one checkbox within a category, with a label (AM, Lunch, PM). Categories can have
  different numbers of slots; Garden has one, Push-ups has three.
- **Template** — the full set of categories + slots. Defined once, edited rarely.
- **Day** — a calendar day in the user's local timezone. Each day is an independent set of tick
  states generated from the template.

A tick means "this slot is done for this day". Unticking is allowed (mis-taps happen).

**Streak** — per category, the number of consecutive days it was fully checked, counting back from
today. Today counts once it is complete; until then the number shown is the run up to yesterday, so
what you stand to lose is visible all day. Completing a category is what makes it tick over — and
that is when the fireworks fire.

**Labels are just text on checkboxes.** Sets and reps live *in* the label — `AM ×15`, `PM ×8` —
and the app treats that as an opaque string. There is no numeric rep field, no totals, no volume
tracking. A tick is binary: done or not. This keeps both the data model and the editor as small as
they can be, and it means changing your rep target is a rename, not a migration.

---

## 3. Screen layout

A vertical accordion of days, each containing a row of category columns.

### 3.1 Day accordion (vertical)

Today and Yesterday only, in that order. Today is open on load; Yesterday is collapsed.
Opening one collapses the other (single-open). Header shows the day name, the date, and a progress
count so a collapsed Yesterday still tells you whether you finished.

```
┌────────────────────────────────────┐
│  DAILYCHECK                   ⚙︎    │   ← thin top bar
├────────────────────────────────────┤
│  TODAY        Sat 1 Aug      4/6  ▾│   ← open
│  ┌──────────────────────────────┐  │
│  │   (row of category columns)  │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  YESTERDAY    Fri 31 Jul     6/6  ▸│   ← collapsed
└────────────────────────────────────┘
```

Tomorrow is deliberately **out of scope for v1** (you asked for today + yesterday). An archive /
history view is noted in §10 as a later addition — the storage schema below is designed so it can be
added without a migration.

### 3.2 Categories — plain columns, always expanded

Inside a day, categories are columns laid out left-to-right in a flex row. **Every column is always
expanded**: name, labels and checkboxes visible, all the time. There is no open/collapsed state and
nothing to tap before ticking.

**Two columns to a row.** A third category wraps onto a new row, and so on every two. Nothing
scrolls sideways — every checkbox for the day is on screen at once.

```
┌───────────────────────┬───────────────────────┐
│ PUSH-UPS                PULL-UPS              │
│ ▔▔▔                     ▔▔▔                   │
│  ▣  AM ×15               ▣  AM ×8             │
│  ▣  Lunch ×15            ☐  PM ×8             │
│  ☐  PM ×15                                    │
│                                               │   ← wrapped row, no rule
│ GARDEN                                        │
│ ▔▔▔                                           │
│  ☐  Water                                     │
└───────────────────────────────────────────────┘
```

Notes on the geometry:

- Columns are **top-aligned stacks**, not a grid. A column with one slot is short; a column with
  three is taller. No filler rows, no forced alignment — a grid would waste vertical space and lie
  about the structure.
- Width is a flat half (`flex: 0 0 50%`), so the grid stays strict however many categories there
  are. The one exception: a single category spreads across the row it already owns — from three
  upwards that would leave the odd column on the last row stretched to full width, which reads as
  broken.
- The column header and every checkbox row are both 44px, so two columns side by side keep their
  checkboxes aligned. Names wrap to two lines before ellipsizing — roughly 15 characters a line.
- **No lines inside a day at all.** Whitespace, the 44px rhythm and the column header's own styling
  (uppercase mono, dimmed, with an accent tick) do the separating.
- On a 390px phone a column is 195px, and still 160px on a 320px screen — labels have room to
  spare at either width.
- Checkbox order within a column follows the template order (AM → Lunch → PM), never completion
  state. The layout must be *muscle-memory stable*: the same box is always in the same place.

### 3.3 Motion

There is no column animation left to speak of — columns no longer open or close. What remains:

- Day accordion: `grid-template-rows: 0fr → 1fr`, which animates to auto height without measuring JS.
- One staggered load-in, columns rising left to right at ~45ms intervals.
- The tick: a spring-ish scale pop plus a check mark stroking in.

Easing is `cubic-bezier(0.22, 1, 0.36, 1)` throughout, all of it wrapped in
`@media (prefers-reduced-motion: reduce)` to collapse to instant state changes.

---

## 4. Interaction details

**Every checkbox is tickable, always.** One tap, no gating, nothing to expand first. Checkboxes are
at least 44×44 CSS px including padding.

Everything else:

- **Feedback on tick:** the box fills with a spring-ish scale pop, a check mark strokes in
  (SVG `stroke-dashoffset`), and `navigator.vibrate(10)` fires where supported. The day header
  count ticks up.
- **Full completion:** when every box in a day is ticked, the day header gets a quiet celebratory
  state (accent underline sweep + the count turning gold). Restrained, not confetti — this is a
  daily tool and confetti gets old on day three.
- **No undo dialogs, no confirmations** on ticking. Tapping again unticks.
- **Editing the template requires an explicit trip to Settings** (⚙︎). Nothing destructive is
  reachable from the main screen.

---

## 5. Data model & storage

Single `localStorage` key: `dailycheck.v1`, one JSON blob.

```jsonc
{
  "version": 1,
  "template": {
    "categories": [
      { "id": "c_k3f9", "name": "Push-ups", "accent": 0,
        "slots": [ { "id": "s_a1", "label": "AM ×15" },
                   { "id": "s_a2", "label": "Lunch ×15" },
                   { "id": "s_a3", "label": "PM ×15" } ] },
      { "id": "c_m2p1", "name": "Pull-ups", "accent": 1,
        "slots": [ { "id": "s_b1", "label": "AM ×8" }, { "id": "s_b2", "label": "PM ×8" } ] },
      { "id": "c_q7z0", "name": "Garden", "accent": 2,
        "slots": [ { "id": "s_c1", "label": "Water" } ] }
    ]
  },
  "days": {
    "2026-08-01": { "s_a1": 1754043210000, "s_a2": 1754061000000 },
    "2026-07-31": { "s_a1": 1753956000000, "s_c1": 1753970000000 }
  },
  "ui": {}
}
```

Design decisions behind this shape:

- **Days are sparse and keyed by local date string** (`YYYY-MM-DD`, computed from local time, never
  UTC — a UTC key would flip the day at the wrong moment for anyone not on GMT). A day only exists
  in storage once something is ticked. No nightly "generate tomorrow" job, no empty-day rows.
- **Ticks are keyed by slot id, storing the timestamp** rather than `true`. Same storage cost,
  and it makes "you did this at 07:12" and any future streak/heat-map view possible for free.
- **Slot ids are stable and independent of labels.** Changing `AM ×15` to `AM ×20` preserves
  history — which is exactly why reps belong in the label rather than in a tracked field.
  Deleting a slot leaves orphan tick data in past days; the renderer ignores unknown ids rather than
  pruning them, so an accidental delete + re-add doesn't silently destroy yesterday.
- **Template is not versioned per day.** If you add a category today, yesterday's row renders
  against the *current* template — an added slot simply shows as unticked in yesterday. This is the
  honest simplification for v1; per-day template snapshots are the alternative and they're a
  meaningful complexity jump for little benefit at this scale. Flagging it as a deliberate trade-off.
- **Retention:** on load, prune `days` entries older than 60 days. Keeps the blob tiny
  (well under 10KB in practice) and leaves plenty of runway for a future archive view.
- **`ui` is empty.** It held the open-column id while the columns were an accordion; with every
  column always expanded there is no view state left to persist. Kept as a slot for future use —
  `normalize()` drops anything it doesn't recognise, including stale keys in imported files.
- Every mutation writes the whole blob synchronously. It's small; there's no reason to be clever.

### Day rollover

`todayKey()` is computed on every render, not cached at load. Recompute and re-render on:

- `visibilitychange` → visible (the phone-in-pocket case: the page was left open overnight)
- `pageshow` (bfcache restore)
- a timer set to fire just after the next local midnight

So a tab left open since yesterday shows the correct Today without a manual refresh — and
yesterday's ticks slide into the Yesterday panel rather than appearing to vanish.

---

## 6. Settings / template editor

Reached via ⚙︎ in the top bar. Opens as a full-screen sheet sliding up from the bottom.

- List of categories, each expandable to edit its slots.
- Per category: rename, reorder (▲▼ buttons — drag-and-drop is fiddly and unreliable on mobile),
  delete (with confirm), pick an accent colour from the palette. Column order in the editor is the
  left-to-right order on screen, so put what you tick most often first.
- Per slot: rename its label, reorder, delete, "+ Add checkbox".
- "+ Add category".
- **Export / Import**: dump the JSON blob to a downloadable file, and paste/upload it back.
  `localStorage` is genuinely fragile — cleared by "clear browsing data", by iOS Safari's 7-day
  eviction of unused site data, by switching phones. A one-tap backup is the difference between a
  tool you can trust with months of history and one you can't. Worth the ~30 lines.
- "Reset today" (clears today's ticks) and "Delete everything", both behind confirms, at the bottom.

Changes apply live on close. No save button.

### First run

Empty state offers two paths: **"Start from the example"** (loads exactly the Push-ups / Pull-ups /
Garden template above, so the app is immediately explorable) or **"Build my own"** (straight into
the editor). No wizard, no tour.

---

## 7. Mobile-first shell

- `<meta name="viewport" ... viewport-fit=cover>`; `100dvh` layout so it fills the screen and
  doesn't jump when Safari's chrome collapses; `env(safe-area-inset-*)` padding for notch and
  home-indicator.
- Body doesn't scroll in the expected case. Nothing scrolls horizontally, ever; enough categories to
  make the day taller than the screen will scroll the page vertically.
- `-webkit-tap-highlight-color: transparent`, `user-select: none`, `touch-action: manipulation`
  (kills the 300ms double-tap zoom delay).
- **Installable**: inline `<link rel="manifest">` via a data URI (keeps the single-file rule),
  `apple-mobile-web-app-capable`, a theme-colour meta, and an inline SVG icon — so "Add to Home
  Screen" gives a proper full-screen app with no browser chrome. This is the difference between a
  webpage and something you actually use every morning.
- Works offline once loaded — it's one file with no network calls after the font fetch, and fonts
  are `font-display: swap` so a cold offline start still renders.
- Responsive above 640px: the layout centres in a max-width column; still two across, just wider.
  Desktop is a courtesy, not the target.

---

## 8. Design direction — approved

**An analogue training ledger / tally counter.** Dark, inky, tactile, mechanical. Not a productivity
SaaS card layout, not a fitness app with gradients.

- **Palette:** deep ink background (`#12100E`-ish warm near-black), aged paper-white text, and a
  single hot accent — **amber/brass** (`#E8A33D`) for the "done" state. Untouched checkboxes are
  drawn in dim outline; ticking them fills with brass. The screen visibly *warms up* as the day
  fills in, which is the entire emotional point of the app. Per-category accents are three or four
  restrained variations on the same warm family so columns are distinguishable without becoming a
  fruit salad.
- **Typography:** `Fraunces` for the display/day headers (a high-contrast variable serif with an
  optical-size axis and a genuinely characterful "wonk" — gives the ledger feel without cosplaying
  as a Victorian invoice), paired with `DM Mono` for category names, slot labels, and counts.
  Column names are uppercase mono with wide tracking, clamped to two lines. Explicitly avoiding
  Inter, Roboto, system stacks, and Space Grotesk.
- **Texture:** an inline SVG `feTurbulence` grain overlay at very low opacity and a subtle warm
  radial vignette at the top of the page. Checkboxes are square with a 1px inked border and a
  hand-drawn-feeling check path, not a rounded system checkbox. *(Review round 4 removed the ruled
  ledger paper and the column dividers — too many lines. The ledger now reads through type, colour
  and rhythm.)*
- **Motion:** one orchestrated load-in (day header, then columns staggering in left to right at
  ~40ms intervals), then quiet. After load, the only motion is the accordion slide and the tick pop.
  A tool you open twenty times a day must not perform for you each time.
- Light theme is *not* included in v1 — the dark ink is the identity. (Easy to add later via
  `prefers-color-scheme` since everything routes through CSS custom properties.)

---

## 9. Implementation structure

Single `dailycheck/index.html`, roughly:

1. `<head>` — meta, inline manifest data URI, Google Fonts link, all CSS in one `<style>`.
2. CSS custom properties block (`:root`) → reset → shell/safe-area → day accordion → columns →
   checkbox → settings sheet → motion/reduced-motion.
3. Markup: top bar, `#days` container (rendered by JS), settings sheet template.
4. `<script>`:
   - `Store` — load/save/prune/export/import, all `localStorage` touching in one place, wrapped in
     try/catch so a private-mode failure degrades to in-memory rather than a blank screen.
   - `dateKey()`, `todayKey()`, `yesterdayKey()`, rollover scheduling.
   - `renderDay(dayKey)` / `renderColumns()` — full re-render is cheap at this size; no diffing.
   - Event delegation on the days container: one listener handles day headers and ticks.
   - `Editor` — the settings sheet.

Target: ~900–1100 lines including CSS, comfortably in line with the other apps in this repo.

A folder `CLAUDE.md` gets written alongside the implementation, matching the pattern in `mass/`
and `geo/`.

---

## 10. Explicitly out of scope for v1

Listed so we agree on what we're *not* building yet, not as a promise to build them:

- Tomorrow panel, and an **archive/history view** (week strip, streaks, completion heat-map).
  The schema in §5 already supports all of it.
- Per-day template snapshots (see the trade-off note in §5).
- A configurable "day starts at 04:00" boundary for late-night ticking.
- Reminders / notifications — needs a service worker and push permission; a different kind of app.
- Sync across devices — would need the back end you explicitly don't want. Export/Import is the
  deliberate manual substitute.
- Reps as tracked numeric data. Settled: they're text in the label (§2).

---

## Decisions confirmed in review

**Round 1**

1. **Name / folder** — `dailycheck`, app title "DAILYCHECK".
2. **Labels are only checkbox text** — no numeric rep field anywhere in the model or the editor.
   Reps are written into the label (`AM ×15`) and the app never parses them.
3. **Checkboxes tickable only in an expanded column** — superseded by round 2, which expanded every
   column and so made the gate moot.
4. **Design direction approved** — dark brass-and-ink ledger, as §8.

**Round 2 — the column accordion was dropped**

5. **No vertical column text, no column accordion.** Every column is expanded by default, with its
   name horizontal and its labels always visible.
6. Horizontal scrolling when the columns don't all fit — superseded by round 3.

Two things that fell out of round 2, both improvements: category names now fit ~15 characters a line
across two lines instead of ~9 vertically, and the day block is 44px shorter because the column
header shrank from two rows to one.

**Round 3 — wrapping instead of scrolling**

7. **No horizontal scrolling at all.** Columns wrap onto a new row instead.
8. **Two columns to a row** (first tried at three). Two is roomier: a column is 195px on a phone
   rather than 130px, so labels have space to spare and the narrow-screen special case that three
   columns needed is gone. The trade-off is height — three categories now take two rows.

**Round 7 — weekday schedules**

13. **A category can run on only some weekdays** — seven toggles in the editor, Monday first.
    Default is every day, so nothing that exists changes.
14. **Days it doesn't run, it is hidden**, with one dim line at the foot of the day listing what's
    off: `Not today — Groceries (Sat)`. Not a greyed-out ghost column: a ghost costs a full column
    of screen for something you can't tick, and the cost grows the more you use scheduling. The
    list being shorter on a Tuesday and longer on a Saturday is the signal that today is different.
15. **Streaks count consecutive *scheduled* days**, so a Saturday-only category holds its streak
    through the week and breaks the moment a Saturday ends unfinished.
16. **Editing a schedule never rewrites history** — days before the edit are judged by what you
    actually ticked, not by the new schedule.
17. The example template gains **Groceries → Delivery slot, Saturdays**, so the feature is visible
    on first run.

Decided against: any way to record an off-schedule tick. It would mean showing hidden categories
again, which undoes 14.

**Round 6 — streaks and more colours**

11. **A streak counter per category**, under the column name beside its accent tick: a flame and a
    number. It increments when the last box of that category is ticked for today, and a burst of
    sparks fires on the number. It resets when a day passes without that category fully checked.
12. **Eight accent colours** instead of four — brass, copper, moss, clay, verdigris, indigo, plum,
    rose.

Two things that fell out of building it. Day retention went from 60 to 400 days, because streaks
are derived from stored history and the retention window silently caps them. And checkboxes now
record the day they were added, so adding a checkbox to an existing category doesn't retroactively
break days that were complete at the time.

**Rounds 4 and 5 — fewer lines, then none**

9. **The ruled-paper background and the column dividers are gone.** Too many lines.
10. **The wrapped-row boundary rule is gone too**, on a try-it-and-see basis. Nothing is drawn
    inside a day now. The exact rule is recorded in `CLAUDE.md` in case it goes back.

This restores the property the very first draft was built around — *every checkbox for the day is
visible at once* — which horizontal scrolling had quietly given up. The cost is vertical: many
categories make the day taller, and the page scrolls down instead.
