# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flappy Cockatiels — a Flappy Bird-style browser game featuring two cockatiels (a lead bird and its mate). Single-file vanilla HTML/CSS/JS application, no build tools or dependencies.

## Running Locally

Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
```

Deployed via GitHub Pages at labs.vossers.com/bird/

## Architecture

Everything lives in a single `index.html`:

- **CSS section**: Splash screen styling, CSS-based cockatiel sprites (both lead and mate with `.mate` color overrides), UI overlays (score, game over, buttons)
- **Canvas game engine**: Full-window canvas that renders sky, clouds, pipes, ground, and both cockatiels
- **Game loop**: `requestAnimationFrame`-based with a fixed timestep accumulator (`TICK = 1000/60`). Physics runs in exact 16.67ms steps regardless of frame timing — prevents speed bursts from mobile touch hiccups or frame drops

### Key game systems

- **Scaling**: All game values scale relative to a 900px-tall reference via `S(v)` helper and `scale = H / 900`. The canvas fills the full browser window. All dimensions (bird, pipes, gaps, speed) use the same scale factor so proportions are identical at any window size.
- **Difficulty progression**: `getDifficulty()` returns pipe gap (vertical distance between top/bottom pipe) and spawn interval (horizontal spacing) based on current score, using `lerp()`. Pipe speed is constant. Starts easy (wide gaps, far apart) and tightens over ~40 points. Each pipe stores its own `gap` value at spawn time so on-screen pipes keep their original difficulty.
- **Mate bird**: Records lead bird's `{ y, rotation, flapFrame }` into `pathHistory[]` each frame. Mate reads from `MATE_DELAY` frames back. Collision detection runs for both birds — either hitting a pipe or ground ends the game.
- **Drawing**: `drawCockatiel(x, y, rotation, flapFrame, colors, birdScale)` is parameterized — lead and mate use different color palettes (`LEAD_COLORS` grey cockatiel, `MATE_COLORS` lutino variant). Mate is drawn at 85% scale.
- **Two cockatiel representations**: CSS sprites on the splash screen (both birds in a `.birds-row` container, mate positioned behind), canvas-drawn versions during gameplay. Both should look visually consistent.
- **Mobile support**: Body/canvas have `user-select: none`, `-webkit-tap-highlight-color: transparent`, `-webkit-touch-callout: none`, and `touch-action: manipulation` to suppress tap artifacts.
