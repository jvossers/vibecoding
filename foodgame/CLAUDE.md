# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Feed Me Right!" — a mobile-first browser game where players tap healthy foods and avoid junk food. An comically oversized character grows bigger when unhealthy food is tapped, eventually exploding (game over). Whack-a-mole style with increasing speed/difficulty.

## Architecture

This is a **single-file application** (`index.html`) with no build step, no dependencies, and no framework. All HTML, CSS, and JS are inline. To run, open `index.html` in a browser or serve it with any static file server.

### Key sections in index.html

- **CSS**: All styles including character rendering (pure CSS, no images/canvas), animations, screen transitions, responsive breakpoints, and mobile optimizations
- **Screen system**: Three screens managed via `.screen.hidden` class toggling — start screen, game screen, game over screen
- **Game state (`G` object)**: Central mutable state holding score, size (0-100), level, spawn timers, and active food items
- **Character rendering (`updateCharacter()`)**: Dynamically resizes the CSS-drawn character based on `G.size` — body inflates, head shrinks proportionally, visual cues (sweat, color shift, expression) change at thresholds
- **Food spawning**: Timed spawns using recursive `setTimeout` (not `setInterval`), with position randomization avoiding HUD and character zones
- **Difficulty scaling**: Level increments every 15s, increasing spawn rate, max active items, score multiplier, and reducing food lifetime

### Design decisions

- **No canvas**: Character and all visuals are DOM/CSS for simplicity and accessibility
- **`pointerdown` events**: Used instead of `click`/`touchstart` for unified touch+mouse handling with zero tap delay
- **Mobile-hostile gesture prevention**: Context menu, pull-to-refresh, and pinch-zoom are all disabled to prevent accidental game interruption
- **Google Fonts**: Bagel Fat One (display) + Nunito (UI) loaded externally — requires internet connection
