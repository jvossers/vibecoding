# Mise: recipe workflow prototype (Phase 1)

A static prototype that redraws a recipe as a **dependency graph in swimlanes**. Each lane is something you can prepare on its own, arrows mark real prerequisites, and merge nodes show where streams come together. Left to right means "comes after", not elapsed time.

Live at https://labs.vossers.com/mise/

## Running it

Open `index.html` in a browser. Nothing needs building and no server is required. The camera needs a secure origin (https or `localhost`). From `file://`, or when the camera is blocked, the app falls back to a photo picker.

Add `?fast` to the URL to speed up the simulated analysis 10×. Add `#roast` (or another sample id) to open a sample directly.

## What is real and what is mocked

| Part | Status |
|---|---|
| Camera capture and photo upload | Real, but the photo **stays in the browser**. It is shown as a preview and never uploaded or read. |
| "Analysis" | **Simulated.** A timed animation, after which a random hand-made sample is shown. The result page says so. |
| Workflows | Hard-coded fixtures in `data/sample-recipes.js` (spaghetti, roast dinner, fish tacos, banana bread). |
| Validation | Duplicate ids, unknown lane or dependency ids, and cycles are checked before rendering. |
| Layout and rendering | Real: columns from the longest prerequisite chain, orthogonal edge routing in SVG, no libraries. |

## Files

- `index.html`: markup for the home, camera, processing and result screens.
- `styles.css`: styles, including dark mode and the mobile bottom sheet.
- `app.js`: validation, layout, SVG rendering, pan/zoom, detail panel, text views, camera and the simulation.
- `data/sample-recipes.js`: the fixtures, in the draft provider-neutral workflow format (`schemaVersion` 1.0).
