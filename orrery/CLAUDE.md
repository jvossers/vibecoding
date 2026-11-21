# Orrery

A 3D solar system in one `index.html` (three.js 0.160 from jsDelivr, no build step), designed for phones first.

- Bodies: Sun, the eight planets, the Moon and Pluto (`dwarf: true`, shown with a dimmer orbit and an italic label).
- Planet positions: JPL "Approximate positions of the planets" Keplerian elements (`BODIES[].el` / `.rt`), good for 1800–2050. The Moon uses a short Meeus-style series in `moonGeo()`.
- Scene units: 1 AU = 10 (`AU`). Ecliptic coordinates map to scene axes with `toThree()` (ecliptic north = +Y).
- Display scaling: `visR()` blends true and enlarged radii by `state.sizeT`; `moonFactor()` widens the Moon's orbit by the same blend so it stays outside the enlarged Earth; `mapDist()` applies the optional square-root distance compression.
- The phase readout uses the true (unscaled) geometry; the "Moon from Earth" inset is a second camera rendered with a scissor into the `#inset .frame` rectangle.
- Textures are procedural (value-noise fbm) and generated a few at a time after the first frame.
- `?date=YYYY-MM-DD` (any `Date.parse` string) opens the page at that moment.
