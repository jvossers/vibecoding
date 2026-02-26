# Piano Sight Reading Practice App

## Overview

A web app for practicing musical sight reading. Random notes appear on treble/bass clef staves and the user identifies them by clicking piano keys. Rounds of 10 correct answers are timed, with highscores saved to localStorage.

## Architecture

No build step, no dependencies, no frameworks. Open `index.html` directly in a browser.

### Files

| File | Contents |
|------|----------|
| `index.html` | Markup only — DOM structure for staff canvas, piano keys, start panel, summary overlay |
| `style.css` | All CSS — dark theme, flexbox layout, transitions, toggle/segmented-button components |
| `app.js` | All JS — audio synth, canvas rendering, game state, timer, settings persistence, event listeners |

## Key conventions

- **Naming**: camelCase for variables/functions, UPPER_CASE for constants (`ROUND_SIZE`, `STORAGE_KEY_PREFIX`, `LINE_GAP`), DOM refs end with `El` (`timerEl`, `feedbackEl`).
- **Data attributes**: Piano keys use `data-note`, clef buttons use `data-clef`, note count buttons use `data-count`.
- **No external dependencies** — vanilla JS, Canvas 2D, Web Audio API, localStorage only.
- **Segmented buttons**: Shared pattern for option groups (clef selector, note count). Initialized via `initSegmentedButtons(selector)`.

## Game mechanics

- 10 correct answers per round; wrong guesses subtract 1 from score (min 0).
- Timer pauses while feedback/next-button is shown.
- Highscore = fastest completion time, persisted in localStorage.
- Notes chosen randomly from treble (F5–C4) or bass (B3–G2) clef.

### Configuration (persisted across refreshes)

- **Clef**: Treble / Bass / Mixed (both) — segmented button selector.
- **Note count** (1–4): Number of notes displayed per turn as a left-to-right sequence. User guesses each in order; one wrong guess fails the whole set.
- Highscores are tracked per combination of clef + note count.

### Multi-note flow

- Notes rendered as separate sequential notes across the staff (not chords).
- Correctly guessed notes dim on the staff and accumulate as green chips in feedback.
- Wrong guess shows the wrong note in red alongside confirmed notes, plus the full expected sequence.

## Audio

Two-oscillator synthesis per note: triangle wave fundamental (0.35 gain, 1.2s decay) + sine overtone at 2x frequency (0.1 gain, 0.8s decay).

## Design

Dark theme (#1a1a1a bg, #52b788 green accent, #e5383b red errors). Responsive layout using flexbox and max-width constraints. Staff rendered on canvas with LINE_GAP=18, NOTE_RADIUS=8.

## Running

Open `index.html` in any modern browser. No server or build required (Web Audio API may need HTTPS in some browsers).
