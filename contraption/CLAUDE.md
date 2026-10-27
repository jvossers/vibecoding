# CLAUDE.md

Contraption is a browser puzzle game in the spirit of The Incredible Machine. Live at https://labs.vossers.com/contraption/.

## Files

- `index.html`: the whole UI. Home screen, game screen, canvas drawing for every part, drag and drop, link tools (rope and belt), run loop, share links, sound and local saves.
- `engine.js`: no DOM. The part catalogue (`TYPES`), geometry (overlap and hit tests), the physics simulation (`Sim`), the puzzles (`PUZZLES`) and share-link encoding. Loads in the browser as `window.Contraption` and in Node through `require`.
- `mockups.html`: the first static mockups. It is linked from the home footer.
- `tools/check-puzzles.js`: the puzzle regression check (see below).

Physics comes from planck.js 1.4.2 (a Box2D port), loaded from jsDelivr. There is no build step.

## How the engine works

- Coordinates are field pixels on a 960 × 640 field, with y pointing down. Physics runs in metres at 40 px per metre (`PPM`) with a fixed 60 Hz step, so a machine plays out the same way every time on the same browser.
- A part is `{ id, t, x, y, a, w, f, aw, fx }`: type, centre, angle in degrees, length for resizable parts, flip (1 or -1), cat starts awake, fixed by the puzzle.
- Each type's `shapes(p)` returns convex shapes in local coordinates. The same shapes drive physics fixtures, overlap checks while building, and hit tests. If you change a part's look in `index.html`, keep it inside its shapes.
- Links are `{ k: 'rope' | 'belt', a, b, c? }`. A rope with `c` runs from `a` over pulley `b` to `c`. Belts only carry power: power flows from mouse wheels (`power: 'source'`) through belts to conveyors and fans.
- Characters (`cat`, `mouse`) are steered every step in `Sim.updateCharacter`. They step up small ledges, turn around at walls, and react to cheese, yarn, the cushion and each other.
- Goals: `zone` (a part of a type or id sits inside a rect for 0.4 s), `hoop` (passes down through a hoop), `event` (`pop`, `eat`, `nap`, `wake`, `snip`, `burn`), `toppled` and `all`.

## Changing puzzles or physics

Any change to `engine.js` can break a puzzle. Run the check after every change:

```bash
npm i --no-save planck@1.4.2
node contraption/tools/check-puzzles.js
```

It confirms that each puzzle stays unsolved with no player parts, that its reference solution in `SOLUTIONS` solves it, and that no parts overlap. When you add a puzzle, add a solution there too. Solutions must be placements a player could make: inside the field and not overlapping anything.

## Share links

`#s=<code>` holds base64url JSON: `[1, puzzleIndex or -1, parts, links]`. Parts are `[typeIndex, x, y, angle, w, flipped, awake]` and links point at parts by index into fixed parts followed by player parts. The order of `TYPE_IDS` and `PUZZLES` is part of the format, so add new types and puzzles at the end, never in the middle.
