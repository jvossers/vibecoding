# Cadence (lyric beat editor)

Static app that fits lyrics to a 4/4 beat grid and plays a clap track for practice. Plain HTML, CSS and ES modules, no build step. Phone-first.

- `js/app.js`: state, grid rendering, editing, playback UI. `source` (textarea), `working` (text the grid was built from) and `syllables` (the arrangement, integer `step` per syllable) are kept separate on purpose; the arrangement is the only source of timing.
- `js/audio.js`: Web Audio engine. Every event time is derived from its absolute step index on the audio clock. The playhead reads the same clock.
- `js/syllables.js`: syllable counts and stress from CMUdict, plus a spelling heuristic for display splits.
- `js/fit.js`: layout styles as cost functions over one dynamic programme. The sample line must fit as straight eighths in one bar.
- `data/cmudict-stress.txt`: compacted CMUdict, rebuilt with `node tools/build-dict.mjs path/to/cmudict.dict`. Keep `data/CMUDICT-LICENSE.txt`.

Tempo, bars, loop, cues and grid edits are locked during playback. A "Rewrite with AI" mode (in-browser model) was planned and deliberately left out; do not add it unless asked.

It needs a web server (modules and `fetch`): `python3 -m http.server` in this folder.
