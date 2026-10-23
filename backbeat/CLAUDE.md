# Backbeat

A drum practice companion. Pick a groove or fill from the library and it plays on loop, with drum notation on top and one lane per pad underneath. A playhead sweeps across both. Built for a phone in landscape next to the kit, and works on desktop too.

## Files

| File | Contents |
|------|----------|
| `index.html` | Markup for the library and player views |
| `style.css` | All styles. Dark theme, landscape-first player |
| `patterns.js` | `GRIDS` (time signatures and subdivisions) and the `PATTERNS` library |
| `app.js` | Model building, notation and lane rendering (SVG), Web Audio drum synth and scheduler, UI |

No build step and no dependencies apart from Google Fonts.

## Pattern format

See the comment at the top of `patterns.js`. Each pattern has tracks per instrument, one character per step, bars split by `|`, `%` repeats the previous bar, and an empty bar is rests. Grids can change per bar (`grids`), which is how a sextuplet fill bar follows a bar of 16ths. Every bar in a pattern takes the same horizontal width.

After editing patterns, check every track has the right length per bar: `buildModel` logs a `console.warn` for a mismatch.

## How it fits together

- `buildModel(p)` turns a pattern into bars, beam groups, steps (with timing in quarter notes, including swing) and hits.
- `makeLayout(m, width)` gives the shared x mapping. Both panels use the same gutter `G`, so one playhead lines up with the notation and the lanes.
- `analyse(m)` works out notes, rests, beaming and tuplets per beam group and voice (hands stems up, feet stems down). `drawNotation` scales the staff to the panel height.
- `engine` is a look-ahead scheduler on the AudioContext clock. The display reads the same clock, so highlights match the sound. Highlights flash and fade rather than staying lit for the whole step, so they never trail the playhead. `heardTime()` estimates what is coming out of the speakers now, and the user can nudge it with `syncMs`. The drum sound and metronome toggles are checked when each event is scheduled.
- Settings (`sound`, `metro`, `countIn`, `view`, `syncMs`) and the last tempo per pattern persist in localStorage.

Routing is by hash: `#/p/<pattern id>` opens the player.
