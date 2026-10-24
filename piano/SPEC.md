# Sight Reading Practice: User Experience and Implementation

This document describes the piano sight reading game in `piano/` as it works today. It is meant as a complete hand-off for an agent that will build a multiplayer version later. It describes only the current single-player game. It does not propose a multiplayer design.

- Live URL: https://labs.vossers.com/piano/
- Files: `index.html` (markup), `style.css` (all styling), `app.js` (all logic). About 1,100 lines in total.
- No build step, no dependencies, no frameworks, no network calls. Vanilla JS, Canvas 2D, Web Audio API and `localStorage`.
- Landing page entry in `_landing/projects.json`: title "Sight Reading Practice", group "Teaching", description "Name notes on the treble and bass clef against the clock."

---

## 1. The game in one paragraph

The player sees one or more notes on a single music staff (treble or bass clef) and names them by tapping keys on an on-screen one-octave piano. A round ends when the player has answered 10 turns correctly. Each wrong turn takes one point off the score (it never goes below 0). The time to finish the round is the player's result. The fastest time is saved as a personal best for each combination of clef setting and notes per turn.

---

## 2. User experience

### 2.1 Screen layout (top to bottom)

The page is a single centred column on a dark background (`#1a1a1a`). Most content is limited to a width of 460px, so on desktop the game looks like a phone app in the middle of the screen.

1. **Title**: "Sight Reading Practice" (`<h1>`), always visible.
2. **HUD row** (visible only while playing), spaced across the row:
   - Progress, for example `3 / 10` (correct turns so far out of 10).
   - Timer, for example `12.4s` or `1:05.3`. It updates every 100 ms.
   - Best time for the current settings, for example `Best: 18.2s`. Empty if there is none.
   - A small `✕` that resets the best time. It appears only when a best time exists.
3. **Staff panel** (visible only while playing): a rounded dark-grey card (`#2a2a2a`) holding a 240px-tall canvas with a five-line staff, a clef and the notes.
4. **Feedback area**: a row of chips and short messages under the staff (details in 2.4).
5. **Start panel** (visible only on the start screen): the settings and the Start button.
6. **Piano**: fixed to the bottom of the viewport, 120px tall, always visible on every screen. It has 7 white keys (C D E F G A B) and 5 black keys (C# D# F# G# A#), each labelled with its note name. The keyboard is at most 500px wide.
7. **NEXT bar**: a full-width 120px bar that covers the piano exactly when it is shown (details in 2.4).
8. **Summary overlay**: a full-screen dark overlay shown at the end of a round.

The body has 140px of bottom padding so the content isn't hidden behind the fixed piano. The viewport meta sets `user-scalable=no` so that fast tapping on phones doesn't zoom the page.

### 2.2 Screen states

| State | What is visible | How you get there |
|---|---|---|
| **Start screen** | Title, start panel, piano (playable, makes sound, but answers nothing) | Page load; "Play Again" on the summary |
| **Playing, awaiting input** | Title, HUD, staff, feedback, piano | Start button; NEXT bar |
| **Playing, turn resolved** | As above, but the NEXT bar covers the piano and the timer is paused | Finishing a turn (right or wrong), unless it was the 10th correct turn |
| **Summary** | Full-screen overlay over everything | The 10th correct turn |

"Play Again" goes back to the **start screen**, not straight into a new round, so the player can change settings between rounds.

### 2.3 Start screen settings

Three option groups, each a row of joined (segmented) buttons. The selected buttons are green (`#2d7a56` background, `#52b788` text and border).

1. **Clef**: `Treble` | `Bass` | `Mixed`. Pick one. The default is Mixed. Mixed picks treble or bass at random for each turn, 50/50. All notes in one turn share the same clef.
2. **Notes at once**: `1` | `2` | `3` | `4`. Pick one. The default is 1. This is the number of notes shown per turn.
3. **Include notes**: `C D E F G A B`. Each button toggles on or off independently. All are on by default. You can't turn off the last one that is on (that click does nothing). Only notes whose letter is on can appear.

Every change is saved to `localStorage` at once and restored on the next visit.

Then there is a large green **Start** button.

### 2.4 Playing a turn

1. A new turn draws the clef symbol and N notes, spaced evenly left to right across the staff. They are separate notes in sequence, not a chord.
2. The player names the notes **from left to right**, one key press per note.
3. Every key press plays a short synthesized piano-like tone for the key pressed, whether the answer is right or wrong. The key turns grey while it is held down.
4. **Correct note, more notes to go**: the note dims to grey (`#555`) on the staff. A green chip such as `D ✓` is added to the feedback row, followed by a grey line such as "2 notes left".
5. **Last note of the turn correct**: the turn counts as correct. Progress goes up by 1. The feedback shows all the green chips. The **green NEXT bar** covers the piano and the timer pauses.
6. **Wrong note at any point**: the whole turn fails at once, even if earlier notes in it were right. Progress goes down by 1 (but not below 0). The feedback shows any green chips already earned, a red chip with the wrong key (for example `F ✗`), and the line "The notes were C, E, G" (all the expected letters for the turn). The **red NEXT bar** covers the piano and the timer pauses.
7. While the turn is resolved, key presses still make sound but don't count as answers. The NEXT bar sits on top of the piano anyway, so in practice the player taps NEXT.
8. Tapping NEXT hides the bar, resumes the timer and starts a new turn. **NEXT ignores taps for the first 200 ms after it appears.** The bar shows up exactly where the player's finger just was, so this stops a quick double-tap from skipping the feedback.
9. When the turn brings the score to 10, the NEXT bar is not shown. The timer stops and the summary appears straight away.

Black keys are valid input, but the game never shows sharps or flats, so a black key is always a wrong answer.

Only taps, clicks and touches work (`pointerdown`). There are no keyboard shortcuts and no MIDI input.

### 2.5 Timer behaviour

- The timer starts when the first turn is drawn (right after Start).
- It pauses while the NEXT bar is visible and resumes when NEXT is tapped. **The time a player spends reading feedback doesn't count.** Only time spent answering does.
- It stops on the 10th correct turn.
- Display format (`formatTime`): under a minute it shows `12.3s`. From one minute it shows `m:ss.s`, for example `1:05.3`.

### 2.6 Round summary overlay

It shows:

- **Round Complete** (heading)
- `Time: <strong>18.2s</strong>`
- `Accuracy: <strong>77%</strong> (10/13)`, calculated as `round(10 / turnsPlayed × 100)`. See the quirks in section 5.
- `New Best Time!` in yellow (`#f9c74f`), only if this run beat the stored best or there was no stored best.
- `Best time: 18.2s`
- A **Play Again** button, which returns to the start screen.

### 2.7 Best times

- One best time (the fastest round) is stored for each **clef setting × notes per turn**. That makes 3 × 4 = 12 possible records.
- The "Include notes" filter is **not** part of the key. A run using only C and G overwrites the same record as a run using all seven letters.
- The HUD shows the best time for the settings in use. The `✕` asks "Reset high score?" with `confirm()` and then deletes that one record.

### 2.8 Visual design

| Element | Colour |
|---|---|
| Page background | `#1a1a1a` |
| Card / staff background | `#2a2a2a` |
| Body text | `#e0e0e0` |
| Staff lines and ledger lines | `#8899aa` |
| Clef glyph | `#ddeeff` |
| Active note head and stem | `#ffffff` |
| Already-answered (dimmed) note | `#555` |
| Accent / correct | `#52b788` (chip background `#1b4332`) |
| Error | `#e5383b` (chip background `#461220`) |
| New-best highlight | `#f9c74f` |
| Piano background | `#111` |

The font is the system UI stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`). There is no light theme.

---

## 3. Musical content

### 3.1 Note ranges and staff positions

Positions are measured in half-steps of the staff (one line or one space). Offset `0` is the top staff line and offset `8` is the bottom line. Each offset step is `LINE_GAP / 2` = 9px.

**Treble clef** (`trebleNotes`), F5 down to C4 (middle C), 11 notes:

| Note | F5 | E5 | D5 | C5 | B4 | A4 | G4 | F4 | E4 | D4 | C4 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Offset | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |

**Bass clef** (`bassNotes`), B3 down to G2, 10 notes:

| Note | B3 | A3 | G3 | F3 | E3 | D3 | C3 | B2 | A2 | G2 |
|---|---|---|---|---|---|---|---|---|---|---|
| Offset | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |

Only natural notes (no sharps or flats) are ever shown. The only note that needs a ledger line is C4 in treble (offset 10). B3 in bass sits in the space just above the staff and needs no ledger line. The ledger-line code covers any offset > 8 or < 0, so it would also handle wider ranges.

### 3.2 Answer checking

Only the **letter** is checked. The octave is ignored: `noteLetter('C4') === 'C'`, and the player presses the single `C` key. The piano has one octave and all answers map to it.

### 3.3 Note selection (`randomNotes(clef, count)`)

1. Take the pool for the clef and keep only the notes whose letter is in `enabledNoteLetters`.
2. Shuffle the pool (Fisher–Yates, `Math.random`, no seed).
3. Go through the shuffled list and take notes until `count` is reached, **skipping any letter already taken**. A single turn never has the same letter twice, for example not both C4 and C5.
4. If there are fewer distinct letters on than `count`, the turn shows **fewer notes than requested**. For example, with only C and E on and "4 notes at once" selected, every turn shows 2 notes.

Every turn is drawn independently, so the same set of notes can come up on back-to-back turns.

---

## 4. Implementation

### 4.1 File layout

```
piano/
  index.html   # DOM only, loads style.css and app.js (plain <script>, no modules)
  style.css    # all CSS
  app.js       # all logic, top-level globals, runs immediately on load
  CLAUDE.md    # short conventions file for agents
  SPEC.md      # this document
```

Conventions: camelCase for functions and variables, UPPER_CASE for constants, and DOM references end in `El`. The settings buttons use `data-clef`, `data-count` and `data-note-toggle`, and the piano keys use `data-note`.

### 4.2 Key DOM elements (`index.html`)

| id / selector | Purpose |
|---|---|
| `.hud` | HUD row. Hidden with an inline `style.display = 'none'` on the start screen |
| `#progress` | `x / 10` |
| `#timer` | Elapsed time |
| `#highscore` | `Best: …` |
| `#resetHs` | `✕` reset button, shown via the `.visible` class |
| `.staff-container` > `canvas#staff` | Staff drawing. The container is hidden on the start screen |
| `#feedback` | Chips and messages (written with `innerHTML`) |
| `#startPanel` | Settings plus `#startBtn`, shown via `.visible` |
| `#clefBtns`, `#noteCountBtns`, `#noteToggleBtns` | Option groups |
| `#summary` | Overlay, shown via `.visible`. Children: `#summaryTime`, `#summaryAccuracy`, `#newBest`, `#summaryBest`, `#playAgain` |
| `#nextBtn` | NEXT bar, shown via `.visible`. The `.wrong` class makes it red |
| `.piano .keys .key[data-note]` | 12 keys. Black keys also have the `.black` class |

Note: the settings are read **from the DOM** (`.selected` classes) at Start, not from a separate state object. `currentClefSelection()`, `currentNoteCount()` and `currentEnabledNotes()` query the buttons.

### 4.3 Constants

```js
ROUND_SIZE = 10                       // correct turns per round
STORAGE_KEY_PREFIX = 'sightReadingHighscore'
SETTINGS_STORAGE_KEY = 'sightReadingSettings'
LINE_GAP = 18                         // px between staff lines
NOTE_RADIUS = 8                       // px, note-head base radius
```

### 4.4 Game state (module-level `let` globals in `app.js`)

| Variable | Meaning |
|---|---|
| `enabledClefs` | `['treble']`, `['bass']` or `['treble','bass']`. Fixed at Start |
| `noteCount` | 1–4. Fixed at Start |
| `enabledNoteLetters` | Array of letters. Fixed at Start |
| `currentClef` | Clef of the current turn |
| `currentNotes` | Array of note names for the turn, for example `['E4','A4','C5']` |
| `guessIndex` | Index of the next note to answer. Notes with a lower index are drawn dimmed |
| `confirmedNotes` | Letters answered correctly so far in this turn (used to build the green chips) |
| `guessed` | `true` once the turn is resolved. Blocks further answers |
| `correctCount` | Score shown as progress (goes up on a correct turn, down on a wrong one, minimum 0) |
| `totalGuesses` | Number of **turns** resolved this round (correct plus wrong), not key presses |
| `startTime`, `elapsedBeforePause`, `timerInterval` | Pausable timer (see 4.7) |
| `roundOver` | `true` after the 10th correct turn |
| `gameStarted` | `true` between Start and Play Again |
| `nextBtnReady` | `false` for 200 ms after NEXT appears |

There is no state object, no events and no separation between state and view. Handlers change the globals and then call `render()` or write to the DOM directly.

### 4.5 Control flow

```
load
 ├─ loadSettings()          restore .selected classes from localStorage
 ├─ wire up buttons and keys
 ├─ displayHighscore()
 └─ showStartScreen()       reset counters, hide HUD/staff/summary/NEXT, show start panel

Start click → startGame()
 ├─ read enabledClefs / noteCount / enabledNoteLetters from the DOM
 ├─ show HUD and staff, gameStarted = true
 ├─ displayHighscore(), updateProgress()
 ├─ nextRound()             pick clef, randomNotes(), reset guessIndex/confirmedNotes/guessed, render()
 └─ startTimer()

key pointerdown
 ├─ resume AudioContext if suspended, playNote(key)
 └─ if gameStarted && !roundOver && !guessed → handleGuess(letter)

handleGuess(letter)
 ├─ correct and more notes left → guessIndex++, render (dims it), "N notes left"
 ├─ correct and last note       → totalGuesses++, correctCount++
 │     ├─ correctCount == 10 → showSummary()
 │     └─ else               → guessed = true, showNextBtn(false)   // green, pauses timer
 └─ wrong                       → totalGuesses++, correctCount = max(0, correctCount-1),
                                   guessed = true, show expected notes, showNextBtn(true)  // red

NEXT click (if nextBtnReady) → hideNextBtn() (resumes timer) → nextRound()

showSummary()
 ├─ roundOver = true, stopTimer()
 ├─ accuracy = round(ROUND_SIZE / totalGuesses * 100)
 ├─ compare with the stored best, save if faster or none, show "New Best Time!"
 └─ show overlay

Play Again → showStartScreen()
window resize → render()
```

Note: "round" in the code (`nextRound()`) means one **turn**. In the UI and in this document, "round" means the whole run of 10 correct turns.

### 4.6 Rendering (Canvas 2D)

`render()` redraws everything on each call: on each new turn, after each correct note (to dim it) and on window resize.

- **Sizing (`sizeCanvas`)**: width = parent width − 16px, height = 240px fixed. The backing store is scaled by `devicePixelRatio` and `ctx.setTransform(dpr,…)` is used, so drawing code works in CSS pixels.
- **Staff (`drawStaff`)**: `staffTop = h/2 − 2·LINE_GAP` (the staff is centred vertically). Five 1px lines from `x=30` to `x=w−10`, plus 2px vertical bar lines at both ends.
- **Clefs**: Unicode musical symbols drawn with `fillText`, using the font stack `Bravura, Noto Music, serif`:
  - Treble `U+1D11E` at 93px, position `(34, staffTop + 4·LINE_GAP + 6)`.
  - Bass `U+1D122` at 60px, position `(36, staffTop + 2.1·LINE_GAP)`.
  - No web font is loaded, so the glyph depends on the fonts the device has. On some systems it may look different or not show at all.
- **Notes (`drawNotes`)**: the horizontal area from `x=100` to `x=w−10` is split into `count` equal slots, and each note sits in the centre of its slot. `y = staffTop + offset · LINE_GAP/2`.
  - Ledger lines, `NOTE_RADIUS+6` px either side of the note centre, for even offsets ≥ 10 or ≤ −2.
  - Note head: a filled ellipse with radii `(NOTE_RADIUS+1, NOTE_RADIUS−1)`, rotated −0.3 rad (a filled quarter-note head).
  - Stem: 2px, `3·LINE_GAP` long. **Stem up on the right** when `offset >= 4` (the middle line or lower), otherwise **stem down on the left**. (Standard engraving puts the stem down on the middle line. Here the middle line gets a stem up.)
  - Notes with index `< guessIndex` are drawn in `#555`.

### 4.7 Timer

This is a pausable stopwatch built on `performance.now()`:

- `startTimer()`: `startTime = now`, `elapsedBeforePause = 0`, and a 100 ms `setInterval` that writes `formatTime(elapsedBeforePause + now − startTime)`.
- `pauseTimer()` / `stopTimer()`: add `now − startTime` to `elapsedBeforePause` and clear the interval. The two functions do the same thing.
- `resumeTimer()`: `startTime = now` and restart the interval.
- The final time is `elapsedBeforePause` after `stopTimer()`.

`showNextBtn()` pauses the timer. `hideNextBtn()` resumes it only if `gameStarted && !roundOver`. `showStartScreen()` also calls `hideNextBtn()`, but at that point `gameStarted` is already false, so the timer is not resumed.

### 4.8 Audio (Web Audio)

- One `AudioContext` is created when the script loads. It is resumed on the first `pointerdown` on a key, because browsers require a user gesture before audio can play.
- `NOTE_FREQ` holds the 12 frequencies for C4–B4, including sharps. **Pressing a key always plays that key in the 4th octave.** The notes on the staff are never played back, and the octave shown on the staff doesn't affect the sound.
- Each press creates two oscillators routed straight to the output:
  - triangle at f, gain 0.35, exponential decay to 0.001 over 1.2 s;
  - sine at 2f, gain 0.1, exponential decay over 0.8 s.
- There are no other sounds (no success or error sounds).

### 4.9 Persistence (`localStorage`)

| Key | Value |
|---|---|
| `sightReadingSettings` | `{"clef":"treble"\|"bass"\|"both","noteCount":1-4,"enabledNotes":["C",…]}` |
| `sightReadingHighscore_<clefs>_n<count>` | `{"ms": 18234.5}` (fastest time in milliseconds) |

`<clefs>` is the sorted clef list joined with `+`: `treble`, `bass` or `bass+treble` (Mixed). Example: `sightReadingHighscore_bass+treble_n2`.

`loadHighscore()` throws away any stored value that has no `ms` field (an older format). Every read is wrapped in `try/catch`. **The writes are not wrapped**, so `saveSettings()` and `saveHighscore()` could throw if storage is blocked.

### 4.10 Input handling

- Piano keys: `pointerdown` (calls `preventDefault`, adds `.active`, plays the sound and maybe answers), `pointerup` and `pointerleave` (remove `.active`).
- Segmented groups (`initSegmentedButtons('.clef-btns')` and `('.note-count-btns')`): a click selects that button only, then `saveSettings()` and `displayHighscore()` run.
- Note toggles: a click toggles the button unless it is the last one selected, then `saveSettings()` runs.
- `#startBtn` → `startGame`. `#nextBtn` → checks `nextBtnReady`, then `hideNextBtn()` and `nextRound()`. `#playAgain` → `showStartScreen`. `#resetHs` → `confirm`, then `removeItem` and `displayHighscore`.
- Black-key positions are set in CSS: each key is 9% wide and placed at `left: calc(100%/7·k − 4.5%)` for k = 1, 2, 4, 5, 6.

---

## 5. Known quirks and edge cases (current behaviour, not fixed)

These are recorded so that a new version can either copy them on purpose or fix them on purpose.

1. **Accuracy is understated after mistakes.** Accuracy is `10 / totalGuesses`, but each wrong turn also takes a point away, so it takes 10 + (number of wrong turns) correct turns to finish. Example: 1 wrong turn means 11 correct turns out of 12 played, but the summary shows `83% (10/12)` instead of 11/12 (92%).
2. **The "Include notes" filter is not part of the best-time key.** Easier filtered runs can set the record for the full-alphabet setting with the same clef and note count.
3. **A turn can show fewer notes than requested** when fewer distinct letters are on than "Notes at once" (see 3.3).
4. **Black keys are always wrong** because accidentals are never shown.
5. **Played pitch ≠ displayed pitch.** The sound always comes from the C4–B4 octave of the key pressed.
6. **Changing settings on the start screen calls `displayHighscore()`, but the HUD is hidden there**, so the player can't see a best time before pressing Start.
7. **The initial HTML for progress says `1 / 10`**. `updateProgress()` replaces it with `0 / 10` when Start is pressed, so players never see the wrong value.
8. **No keyboard or MIDI input**, and no way to quit a round early (other than reloading the page).
9. **Clef glyphs depend on the device's fonts** (no web font is loaded).
10. **Unused CSS:** `.feedback .next-hint` is defined but never used.
11. **The stem on the middle-line note (B4 treble, D3 bass) points up**, which differs from standard engraving.
12. **`piano/CLAUDE.md` doesn't mention the "Include notes" setting**. This document is more complete.

---

## 6. Facts relevant to extending the game

These are not design proposals. They are properties of the current code that matter when the game is extended:

- **All randomness is local and unseeded** (`Math.random` in `randomNotes` and the per-turn clef pick). Nothing would currently let two clients see the same sequence of notes.
- **The game is fully client-side.** The only state outside the page is `localStorage`. There is no server, no account, and no identity for the player.
- **The scoring rules** come down to: a turn is correct only if every note is right in order; any mistake ends the turn and costs a point (minimum 0); the round ends at 10; the result is the time, not counting feedback pauses.
- **Settings are frozen at Start** (`enabledClefs`, `noteCount`, `enabledNoteLetters`). The rest of the round reads only these globals, apart from the best-time key, which `storageKey()` builds from the **live DOM selection**. That is safe only because the start panel is hidden during play.
- **One turn's data** is fully described by `{ clef, notes: ['E4','A4','C5'] }`. One answer is a letter from the 12 piano keys.
- **The view code is tied to the globals** (`drawNotes` reads `guessIndex` directly). Feedback HTML is built inline in `handleGuess`.
- The project is published by GitHub Pages from the `main` branch. New files in `piano/` go live at `https://labs.vossers.com/piano/<file>`.
