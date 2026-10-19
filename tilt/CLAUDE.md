# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tilt — an abstract particle simulation driven by phone movement. A box of glowing "sand" (14k particles on touch devices, 22k on desktop) pours toward whichever way the phone is tilted, swirls when the phone is twisted, scatters when shaken, and gathers into a vortex under a finger. Single-file `index.html` using Three.js (ES module from jsDelivr via an import map), no build tools.

## Running Locally

Open via any static file server (ES modules don't load from `file://`):
```bash
npx serve .
```

Motion sensors need HTTPS, so test on a real phone through the deployed site (labs.vossers.com/tilt/) or a tunnel. On desktop, Chrome DevTools → More tools → Sensors can fake orientation; otherwise the mouse stands in for tilt.

## Architecture

- **Start screen**: the "Tap to start" button exists because iOS only allows `DeviceOrientationEvent.requestPermission()` / `DeviceMotionEvent.requestPermission()` from a user gesture. Android and desktop resolve immediately. Also requests a screen wake lock, since nobody touches the screen while tilting.
- **Input**:
  - `deviceorientation` → `beta`/`gamma` are converted to a gravity vector in device coordinates (`cosβ·sinγ, −sinβ, −cosβ·cosγ`), then rotated by `screen.orientation.angle` (`toScreen`) so tilt stays correct in landscape. Orientation angles are used instead of `accelerationIncludingGravity` because the latter's sign differs between iOS and Android.
  - `devicemotion` → `rotationRate.alpha` drives swirl (`spin`); acceleration magnitude above `SHAKE_THRESHOLD` triggers `burst()` (magnitude only, so the sign issue doesn't matter).
  - Pointer hold attracts particles to the touch point with a tangential vortex. Without sensors, mouse position sets the tilt; double-click or Space bursts.
  - Gravity is smoothed toward `gTarget` every frame (low-pass) to hide sensor noise.
- **World**: a box of half-extents `HX × HY × HZ` (`HY = 1`, `HX = aspect`). The camera is placed so the box's front face exactly fills the screen, so the back face reads as a tunnel and screen coords map linearly to world x/y.
- **Simulation (`step`)**: particles repel each other through a coarse 3D density grid rather than neighbour search. Each particle deposits trilinear weights into 8 grid nodes; nodes above `restDensity` get pressure `K·(ρ − rest)`; each particle is pushed down the gradient of the trilinear-interpolated pressure. Grid nodes sit exactly on the walls and wall nodes are doubled (`wallBoost`) because they only gather density from one side — without that, sand clumps along edges and in corners. `FILL` sets how much of the box the settled sand occupies. Two half-steps per frame for stability.
- **Rendering**: one `THREE.Points` draw call with a custom `ShaderMaterial` — soft round sprites, additive blending, perspective size, dimmer toward the back. `paint()` colours by speed (indigo at rest → cyan flowing → pink when flung); `uFlash` brightens everything briefly after a shake.

## Tuning

All feel parameters are constants at the top of the script: `N`, `G`, `FILL`, `DAMP`, `BOUNCE`, `SWIRL`, `PULL`, `SHAKE_THRESHOLD`, `CELLS_Y` (grid resolution — cost scales with it).
