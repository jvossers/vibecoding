# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tilt — abstract particle simulations driven by phone movement. A box of particles pours toward whichever way the phone is tilted, swirls when the phone is twisted, scatters when shaken, and gathers into a vortex under a finger. Six modes share that simulation and input but look and feel different:

- **Sand** — glowing additive points, indigo → cyan → pink with speed.
- **Ink** — translucent blots on cream paper with fading trails; fast ink turns vermilion.
- **Embers** — sparse flickering sparks that float *against* gravity (negative `G`), random-walk (`jitter`) and leave long-exposure trails.
- **Mercury** — opaque chrome beads (fake sphere normals + studio-environment reflection) with slight `cohesion` so they pool.
- **Confetti** — opaque paper rectangles spinning and flipping in the fragment shader, five-colour palette, floaty drag.
- **String** — tangled strands of wool yarn: particles threaded into chains (`strand`), drawn as overlapping matte discs with fuzzy edges, one colour per strand.

Single-file `index.html` using Three.js (ES module from jsDelivr via an import map), no build tools.

## Running Locally

Open via any static file server (ES modules don't load from `file://`):
```bash
npx serve .
```

Motion sensors need HTTPS, so test on a real phone through the deployed site (labs.vossers.com/tilt/) or a tunnel. On desktop, Chrome DevTools → More tools → Sensors can fake orientation; otherwise the mouse stands in for tilt.

## Architecture

- **Modes**: the `MODES` array at the top is the only place a mode is defined — physics constants plus a fragment shader body, background colour, UI theme (`dark`/`light`), box-edge colour and blend type (`add`, `normal`, `opaque`). `setMode()` swaps the `Points` material (cached per mode), resizes the active particle range (`setDrawRange`; buffers are allocated for the largest mode, extra particles spawn scattered), rebuilds the pressure grid for that mode's `cells`, and writes the mode id to the URL hash so modes are linkable (`#ink`). A pill bar at the top switches modes (colour dots hidden under 440px so six fit); on desktop ←/→ or 1–6 also do. To add a mode, add an entry to `MODES` — nothing else needs touching.
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
- **Strands** (modes with `strand`): particle `i` belongs to strand `floor(i / strand)`. After the normal force/integration pass, `solveStrands()` runs position-based dynamics — 6 Gauss-Seidel passes of distance constraints between neighbours (rest `segment`) and between every other point (rest `1.9 × segment`, weighted by `stiffness`, to resist kinks), clamping to the walls each pass — then velocity is recomputed from the actual displacement (`prev` holds start-of-step positions). The pressure grid still runs, which keeps strands from collapsing into each other. Entering a strand mode always respawns particles as wandering threads (`spawnStrands`); `assignSeeds()` gives every point in a strand the same seed so colour is per strand. `countFor` rounds strand modes to whole strands.
- **Rendering**: one `THREE.Points` draw call. `measureSpeeds()` writes the per-particle speed attribute; the mode's shader decides what to do with it. `uFlash` brightens everything briefly after a shake.

## Tuning

Feel parameters live per mode in `MODES` (documented in the comment above it): `count` (touch devices get 65%), `cells` (grid resolution — fewer particles need a coarser grid or the pressure gets noisy), `G`, `fill`, `damp`, `bounce`, `swirl`, `pull`, `cohesion`, `jitter`, `burst`, `size`, `sizeVar`, `speedRef`, `trail`, and for strands `strand`, `segment`, `stiffness` (keep `size` ≈ 2× `segment` so a strand reads as continuous). `SHAKE_THRESHOLD` is global.
