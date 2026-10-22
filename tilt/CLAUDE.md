# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tilt — abstract particle simulations driven by phone movement. A box of particles pours toward whichever way the phone is tilted, swirls when the phone is twisted, scatters when shaken, and gathers into a vortex under a finger. Ten modes share that simulation and input but look and feel different:

- **Sand** — glowing additive points, indigo → cyan → pink with speed.
- **Ink** — translucent blots on cream paper with fading trails; fast ink turns vermilion.
- **Embers** — sparse flickering sparks that float *against* gravity (negative `G`), random-walk (`jitter`) and leave long-exposure trails.
- **Mercury** — opaque chrome beads (fake sphere normals + studio-environment reflection) with slight `cohesion` so they pool.
- **Confetti** — opaque paper rectangles spinning and flipping in the fragment shader, five-colour palette, floaty drag.
- **String** — tangled strands of wool yarn: particles threaded into chains (`strand`), drawn as overlapping matte discs with fuzzy edges, one colour per strand.
- **Snow** — a snow globe: soft specks and six-armed flakes sinking slowly through viscous water (low `G`, high `damp`) around fixed `scenery` (a snowy mound with three pines). A shake whips up a blizzard that takes seconds to settle.
- **Iron** — iron filings on paper: dark needles (`align`) that swing onto the field lines of a bar magnet held under the finger, keep that alignment when it's lifted, and drift toward their direction of travel when poured.
- **Bubbles** — soap bubbles (`pop`) that float up against gravity: a see-through film that brightens toward the rim, swirling iridescent colour and a highlight. Touch pops the bubbles under the finger, a shake pops a share of them, and popped bubbles grow back from the low side.
- **Paper** — one sheet of lined notebook paper (`sheet`) drawn as a mesh: blue rules, red margin, three punched holes, plain back, flat-shaded facets so creases read crisply. Holding a finger crumples it into a ball; creases stay when released (`yield`); a shake flattens it most of the way, and it slowly relaxes on its own (`relax`).

Single-file `index.html` using Three.js (ES module from jsDelivr via an import map), no build tools.

## Running Locally

Open via any static file server (ES modules don't load from `file://`):
```bash
npx serve .
```

Motion sensors need HTTPS, so test on a real phone through the deployed site (labs.vossers.com/tilt/) or a tunnel. On desktop, Chrome DevTools → More tools → Sensors can fake orientation; otherwise the mouse stands in for tilt.

## Architecture

- **Modes**: the `MODES` array at the top is the only place a mode is defined — physics constants plus a fragment shader body, background colour, UI theme (`dark`/`light`), box-edge colour and blend type (`add`, `normal`, `opaque`). `setMode()` swaps the `Points` material (cached per mode), resizes the active particle range (`setDrawRange`; buffers are allocated for the largest mode, extra particles spawn scattered), rebuilds the pressure grid for that mode's `cells`, and writes the mode id to the URL hash so modes are linkable (`#ink`). A pill bar at the top switches modes (under 440px it drops the colour dots and wraps onto two rows); on desktop ←/→ or 1–9 also do (10th mode via the bar or arrows). To add a mode, add an entry to `MODES` — nothing else needs touching.
- **Shaders**: one shared vertex shader sizes points in world units (`uSize × uProj / depth`, `uProj` = pixels per world unit, updated on resize) and passes `vSpeed` (0–1, normalised by the mode's `speedRef`), `vSeed` (stable per-particle random) and `vDepth` (0 back → 1 front). Each mode's fragment shader is appended to a shared header declaring those plus `uTime` and `uFlash`. All materials share one `uniforms` object.
- **Trails**: modes with `trail > 0` render into a half-float render target, fade it toward the background by `trail` each frame with a quad, draw the particles on top, then blit to the screen. Half-float matters: fading an 8-bit buffer stalls a few levels short of the background and leaves permanent ghosts. The fade/blit quads are raw `ShaderMaterial`s so colours match the particle shaders (no colour-space conversion).

- **Start screen**: the "Tap to start" button exists because iOS only allows `DeviceOrientationEvent.requestPermission()` / `DeviceMotionEvent.requestPermission()` from a user gesture. Android and desktop resolve immediately. Also requests a screen wake lock, since nobody touches the screen while tilting.
- **Input**:
  - `deviceorientation` → `beta`/`gamma` are converted to a gravity vector in device coordinates (`cosβ·sinγ, −sinβ, −cosβ·cosγ`), then rotated by `screen.orientation.angle` (`toScreen`) so tilt stays correct in landscape. Orientation angles are used instead of `accelerationIncludingGravity` because the latter's sign differs between iOS and Android.
  - `devicemotion` → `rotationRate.alpha` drives swirl (`spin`); acceleration magnitude above `SHAKE_THRESHOLD` triggers `burst()` (magnitude only, so the sign issue doesn't matter).
  - Pointer hold attracts particles to the touch point with a tangential vortex. Without sensors, mouse position sets the tilt; double-click or Space bursts.
  - Gravity is smoothed toward `gTarget` every frame (low-pass) to hide sensor noise.
- **World**: a box of half-extents `HX × HY × HZ` (`HY = 1`, `HX = aspect`). The camera is placed so the box's front face exactly fills the screen, so the back face reads as a tunnel and screen coords map linearly to world x/y.
- **Simulation (`step`)**: reads all constants from the current mode. Particles repel each other through a coarse 3D density grid rather than neighbour search. Each particle deposits trilinear weights into 8 grid nodes; nodes above `restDensity` get pressure `K·(ρ − rest)`; each particle is pushed down the gradient of the trilinear-interpolated pressure. Grid nodes sit exactly on the walls and wall nodes are doubled (`wallBoost`) because they only gather density from one side — without that, sand clumps along edges and in corners. `fill` sets how much of the box the settled particles occupy. With `cohesion`, under-dense nodes get a negative pressure that pulls particles together — keep it small (~0.05): at 1 the pull is ~20× gravity and particles freeze into a grid-shaped lattice. `jitter` adds random acceleration. Two half-steps per frame for stability.
- **Links** (strand and sheet modes): pairs of particles held at a rest distance, stored as typed arrays (`linkA`, `linkB`, `linkRest`, `linkFlat` = original rest, `linkK` = stiffness, `linkPlastic`) and built by `setLinks()` when a linked mode is entered. After the normal force/integration pass, `solveLinks()` runs position-based dynamics — Gauss-Seidel passes over every link (6 for strands, 10 for sheets), clamping to the walls each pass — then velocity is recomputed from the actual displacement (`prev` holds start-of-step positions). The pressure grid still runs, which keeps strands from collapsing into each other and gives a crumpled sheet volume.
- **Strands** (modes with `strand`): particle `i` belongs to strand `floor(i / strand)`. `strandLinks()` links neighbours (rest `segment`) and every other point (rest `1.9 × segment`, weighted by `stiffness`, to resist kinks). Entering a strand mode respawns particles as wandering threads (`spawnStrands`); `assignSeeds()` gives every point in a strand the same seed so colour is per strand. `countFor` rounds strand modes to whole strands.
- **Sheets** (modes with `sheet`): a `cols × rows` grid (`countFor` ignores `count`). `sheetLinks()` adds stretch links between neighbours (stiff, not plastic), and plastic shear (diagonal) and bend (every other point, weighted by `stiffness`) links. `deformLinks()` gives plastic links crease memory: squeezed more than `yield` past rest, the rest length follows — compression only, so release doesn't unfold the creases — and rest lengths ease back toward `linkFlat` at `relax` per second; a shake (`burst`) moves them up to 85% of the way back. Drawing: `sheetMesh` is a triangle mesh whose geometry shares the particle position attribute (no copying) with grid UVs and an index from `buildSheetGeometry()`; its material uses `sheetVertexShader` + `sheetHeader` (varyings `vUv`, `vView`, `vDepth`) and is double-sided, and the mode's `frag` computes flat per-triangle normals from `dFdx/dFdy(vView)` and picks front/back with `gl_FrontFacing`. Points are hidden while a sheet mode is active. Entering the mode, and tapping Start while in it, spawns a fresh slightly turned and rippled sheet (`spawnSheet`), scaled down if the box is too small.
- **Scenery** (modes with `scenery`): a function building a fixed Three.js object, created once per mode and added to the scene while the mode is active. It's fixed to the box, like the scene inside a real snow globe, and particles don't collide with it (depth testing hides flakes behind it).
- **Needles** (modes with `align`): `angles` is a per-particle attribute passed to every shader as `vAngle`. `alignNeedles()` turns each needle toward the dipole field of a bar magnet at the finger (pointing up the screen), at a rate ∝ 1/r³; without a finger, moving filings turn toward their velocity. Angles wrap at π because a needle has no head or tail. A shake scrambles them. `vortex: 0` stops the finger swirling filings around.
- **Bubbles** (modes with `pop`): `scales` is a per-particle size multiplier (`aScale`, used by every shader; 1 for other modes). `pop(i)` moves a particle to a random spot on the wall gravity points at and sets its scale to 0; `updateBubbles()` pops any bubble under the finger and regrows scales back to 1 over about a second. `touchHint` lets a mode replace the start screen's "Touch to gather" hint.
- **Rendering**: one `THREE.Points` draw call. `measureSpeeds()` writes the per-particle speed attribute; the mode's shader decides what to do with it. `uFlash` brightens everything briefly after a shake.

## Tuning

Feel parameters live per mode in `MODES` (documented in the comment above it): `count` (touch devices get 65%), `cells` (grid resolution — fewer particles need a coarser grid or the pressure gets noisy), `G`, `fill`, `damp`, `bounce`, `swirl`, `pull`, `cohesion`, `jitter`, `burst`, `size`, `sizeVar`, `speedRef`, `trail`, `vortex`, `touchHint`, `shakeHint`, for sheets `sheet`, `stiffness`, `yield`, `relax` (with low `fill` so pressure doesn't inflate the ball and unfold it), and for strands `strand`, `segment`, `stiffness` (keep `size` ≈ 2× `segment` so a strand reads as continuous). `SHAKE_THRESHOLD` is global.
