# DAILYCHECK — a daily repeating-task checklist

**Status:** plan, revised after review round 1. No code written yet.
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

**Labels are just text on checkboxes.** Sets and reps live *in* the label — `AM ×15`, `PM ×8` —
and the app treats that as an opaque string. There is no numeric rep field, no totals, no volume
tracking. A tick is binary: done or not. This keeps both the data model and the editor as small as
they can be, and it means changing your rep target is a rename, not a migration.

---

## 3. Screen layout

Two accordions nested inside each other, running in **different axes**.

### 3.1 Outer accordion — days (vertical, conventional)

Today and Yesterday only, in that order. Today is open on load; Yesterday is collapsed.
Opening one collapses the other (single-open). Header shows the day name, the date, and a progress
count so a collapsed Yesterday still tells you whether you finished.

```
┌────────────────────────────────────┐
│  DAILYCHECK                   ⚙︎    │   ← thin top bar
├────────────────────────────────────┤
│  TODAY        Sat 1 Aug      4/6  ▾│   ← open
│  ┌──────────────────────────────┐  │
│  │   (inner column accordion)   │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  YESTERDAY    Fri 31 Jul     6/6  ▸│   ← collapsed
└────────────────────────────────────┘
```

Tomorrow is deliberately **out of scope for v1** (you asked for today + yesterday). An archive /
history view is noted in §10 as a later addition — the storage schema below is designed so it can be
added without a migration.

### 3.2 Inner accordion — categories (horizontal)

This is the distinctive part. Inside a day, categories are columns laid out left-to-right in a
flex row. Exactly one column is open at a time.

**The rule that drives everything: every checkbox for the day is always visible. Only the *labels*
of the open column are visible.** Collapsing a column hides its text, never its checkboxes.

Open column: full-width-ish, horizontal header text, each row shows `[ ✓ ]  Lunch ×15`.
Collapsed column: ~42px wide, header text rotated 90°, bare checkboxes only — visible, dimmed,
and **not tickable** (§4).

```
   PUSH-UPS open                          PULL-UPS open
┌───────────────────────┬────┬────┐   ┌────┬───────────────────────┬────┐
│ PUSH-UPS         2/3  │ P  │ G  │   │ P  │ PULL-UPS         0/2  │ G  │
│                       │ U  │ A  │   │ U  │                       │ A  │
│  ▣  AM ×15            │ L  │ R  │   │ S  │  ☐  AM ×8             │ R  │
│  ▣  Lunch ×15         │ L  │ D  │   │ H  │  ☐  PM ×8             │ D  │
│  ☐  PM ×15            │ ·  │ E  │   │ ·  │                       │ E  │
│                       │ U  │ N  │   │ U  │                       │ N  │
│                       │    │    │   │ P  │                       │    │
│                       │ ▣  │ ☐  │   │ S  │                       │ ☐  │
│                       │ ☐  │    │   │ ▣  │                       │    │
│                       │    │    │   │ ▣  │                       │    │
└───────────────────────┴────┴────┘   └────┴───────────────────────┴────┘
```

Tapping a collapsed column anywhere opens it and closes the previous one, sliding smoothly.
The checkbox count on screen never changes — 3 + 2 + 1 = 6 boxes, before and after. That's the
whole trick, and it's what keeps a phone-sized screen usable with many categories.

Notes on the geometry:

- Columns are **top-aligned stacks**, not a grid. A column with one slot is short; a column with
  three is taller. No filler rows, no forced alignment — a grid would waste vertical space and lie
  about the structure.
- Collapsed columns sit at a fixed ~42px. Because their checkboxes are no longer tap targets, the
  strip only has to be wide enough to *read* — it doesn't have to clear 44px for a thumb. The open
  column gets that width back (`flex: 1`).
- Beyond ~6 categories the collapsed strips would squeeze the open column too far. Fallback: the
  column row scrolls horizontally, with the open column pinned into view on selection. Rare case,
  but it degrades sensibly rather than breaking.
- Vertical checkbox order within a column follows the template order (AM → Lunch → PM), not
  completion state. The layout must be *muscle-memory stable*: the same box is always in the same
  place, so the shape of a column's ticks is recognisable at a glance.

### 3.3 Animating the rotation

`writing-mode` can't be animated, so the header label is a positioned element animated with
`transform: rotate()`:

- collapsed: `rotate(-90deg)` with `transform-origin` at the top-left of the strip
- open: `rotate(0deg)`

Rotation and width transition together on the same duration/easing, so the text appears to pivot
into place as the column widens. Slot labels fade + slide in slightly behind the width (small
`transition-delay`) so they don't smear while the column is still narrow.

Timings: ~260ms width, ~260ms rotation, ~160ms label fade delayed ~100ms, easing
`cubic-bezier(0.22, 1, 0.36, 1)`. Day accordion uses a grid-rows `0fr → 1fr` transition (height:auto
animation without measuring JS). All motion is wrapped in `@media (prefers-reduced-motion: reduce)`
to collapse to instant state changes.

---

## 4. Interaction details

**Checkboxes are only tickable while their column is expanded.** A collapsed column's boxes are
*status only*: you can see whether they're ticked, you cannot change them. This is the safety rule
of the whole interface — the strips are narrow and you're tapping fast, so a mis-aimed thumb must
never silently mark push-ups done.

The consequences, which make the interaction simpler rather than more awkward:

- **The entire collapsed column is one big tap target.** Header, checkboxes, whitespace — all of it
  opens the column. There is no sub-region to aim at, so a hurried tap always does the harmless
  thing. Two taps to tick a non-open category: open, then tick.
- Collapsed boxes render dimmed (reduced opacity, no border emphasis) so "not interactive right now"
  is visible, while a tick still reads clearly at a glance — the whole point of keeping them on
  screen is the overview.
- Implementation: in a collapsed column the boxes are rendered as inert `<span>`s with
  `pointer-events: none` and an `aria-label` carrying their state, so the tap always lands on the
  column's open-handler behind them. Screen readers still announce what's done; nothing there can be
  activated. They become real `<button>`s again when the column opens.
- In the open column, checkboxes are at least 44×44 CSS px including padding.

Everything else:

- **Feedback on tick:** the box fills with a spring-ish scale pop, a check mark strokes in
  (SVG `stroke-dashoffset`), and `navigator.vibrate(10)` fires where supported. The day header count
  and the column count both animate up.
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
  "ui": { "openCategory": "c_k3f9", "openDay": "today" }
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
  delete (with confirm), pick an accent colour from the palette.
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
- Body doesn't scroll. The day accordion and its columns fit the viewport in the expected case; only
  the open column's slot list scrolls if a category ever has an unusual number of slots.
- `-webkit-tap-highlight-color: transparent`, `user-select: none`, `touch-action: manipulation`
  (kills the 300ms double-tap zoom delay).
- **Installable**: inline `<link rel="manifest">` via a data URI (keeps the single-file rule),
  `apple-mobile-web-app-capable`, a theme-colour meta, and an inline SVG icon — so "Add to Home
  Screen" gives a proper full-screen app with no browser chrome. This is the difference between a
  webpage and something you actually use every morning.
- Works offline once loaded — it's one file with no network calls after the font fetch, and fonts
  are `font-display: swap` so a cold offline start still renders.
- Responsive above 640px: the layout centres in a max-width column, the collapsed strips widen
  slightly, everything else is unchanged. Desktop is a courtesy, not the target.

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
  Rotated vertical column headers in uppercase mono with wide letter-spacing look *deliberate*
  rather than like broken CSS — the mono is doing real work here. Explicitly avoiding Inter,
  Roboto, system stacks, and Space Grotesk.
- **Texture:** an inline SVG `feTurbulence` grain overlay at very low opacity, a subtle warm radial
  vignette at the top of the page, and hairline rules between columns that read as ruled ledger
  paper. Checkboxes are square with a 1px inked border and a hand-drawn-feeling check path, not
  a rounded system checkbox.
- **Motion:** one orchestrated load-in (day header, then columns staggering in left to right at
  ~40ms intervals), then quiet. After load, the only motion is the accordion slide and the tick pop.
  A tool you open twenty times a day must not perform for you each time.
- Light theme is *not* included in v1 — the dark ink is the identity. (Easy to add later via
  `prefers-color-scheme` since everything routes through CSS custom properties.)

---

## 9. Implementation structure

Single `dailycheck/index.html`, roughly:

1. `<head>` — meta, inline manifest data URI, Google Fonts link, all CSS in one `<style>`.
2. CSS custom properties block (`:root`) → reset → shell/safe-area → day accordion → column
   accordion → checkbox → settings sheet → motion/reduced-motion.
3. Markup: top bar, `#days` container (rendered by JS), settings sheet template.
4. `<script>`:
   - `Store` — load/save/prune/export/import, all `localStorage` touching in one place, wrapped in
     try/catch so a private-mode failure degrades to in-memory rather than a blank screen.
   - `dateKey()`, `todayKey()`, `yesterdayKey()`, rollover scheduling.
   - `renderDay(dayKey)` / `renderColumns()` — full re-render is cheap at this size; no diffing.
   - Event delegation on the days container: one listener handles both "open this column" and
     "tick this box", with the open/collapsed state of the column as the gate between them.
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

## Decisions confirmed in review round 1

1. **Name / folder** — `dailycheck`, app title "DAILYCHECK".
2. **Labels are only checkbox text** — no numeric rep field anywhere in the model or the editor.
   Reps are written into the label (`AM ×15`) and the app never parses them. *(This is my reading of
   "labels only for check boxes" — if you meant something else by it, say so and I'll adjust before
   writing code.)*
3. **Checkboxes tickable only in an expanded column** — collapsed boxes are visible but inert, and
   the whole collapsed strip becomes a single "open me" target. Reverses what the first draft
   proposed.
4. **Design direction approved** — dark brass-and-ink ledger, as §8.

Nothing else is outstanding. On your go-ahead the next step is building `dailycheck/index.html`.
