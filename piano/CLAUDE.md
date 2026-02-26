# Piano Sight Reading Practice App

## Overview

A single-page web app for practicing musical sight reading. Random notes appear on treble/bass clef staves and the user identifies them by clicking piano keys. Rounds of 10 correct answers are timed, with highscores saved to localStorage.

## Architecture

Everything lives in **one file**: `index.html` (~777 lines). No build step, no dependencies, no frameworks. Open directly in a browser.

### File layout (top to bottom)

| Section | Lines (approx) | Contents |
|---------|----------------|----------|
| `<style>` | 7–304 | All CSS — dark theme, flexbox layout, transitions |
| `<body>` HTML | 306–351 | Canvas, piano keys, buttons, overlays |
| Audio setup | 353–425 | Web Audio API piano synth (triangle + sine oscillators) |
| Canvas rendering | 426–528 | Hi-DPI staff, clefs, notes, ledger lines |
| Game state & timer | 529–622 | State vars, timer start/pause/resume/stop, highscore |
| Game flow | 623–698 | handleGuess, showSummary, showStartScreen |
| Scale selector | 699–746 | Note filtering by selected scale |
| Event listeners | 747–776 | Pointer events on keys, buttons, resize |

## Key conventions

- **Naming**: camelCase for variables/functions, UPPER_CASE for constants (`ROUND_SIZE`, `STORAGE_KEY`, `LINE_GAP`), DOM refs end with `El` (`timerEl`, `feedbackEl`).
- **Data attributes**: Piano keys use `data-note` for note name mapping.
- **No external dependencies** — vanilla JS, Canvas 2D, Web Audio API, localStorage only.

## Game mechanics

- 10 correct answers per round; wrong guesses subtract 1 from score (min 0).
- Timer pauses while feedback/next-button is shown.
- Highscore = fastest completion time, persisted in localStorage.
- Notes chosen randomly from treble (F5–E4) or bass (B3–G2) clef.

## Audio

Two-oscillator synthesis per note: triangle wave fundamental (0.35 gain, 1.2s decay) + sine overtone at 2× frequency (0.1 gain, 0.8s decay).

## Design

Dark theme (#1a1a1a bg, #52b788 green accent, #e5383b red errors). Responsive layout using flexbox and max-width constraints.

## Running

Open `index.html` in any modern browser. No server or build required (Web Audio API may need HTTPS in some browsers).
