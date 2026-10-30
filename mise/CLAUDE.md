# CLAUDE.md

**Mise** is the Phase 1 static prototype of a recipe workflow visualiser: photograph a recipe and see it as swimlanes (independent components) joined by prerequisite arrows that converge at the plate.

- **Tech:** `index.html`, `styles.css`, `app.js`, `data/sample-recipes.js`. No dependencies or build step. It must keep working from `file://`, so the data file is a plain script that sets `window.SAMPLE_RECIPES`, not a module or JSON fetch.
- **No backend and no AI.** The camera/upload only makes a local object URL for the preview. The "analysis" is a timed animation ending on a random fixture. Never imply the photo was read: the processing screen and the result banner say it is simulated. Don't add uploads, OCR or model calls without the user asking for a later phase.
- **Layout:** `buildModel` gives each step a column equal to its longest prerequisite chain; steps sharing a lane and column stack into slots. `route` draws orthogonal edges that only run vertically in column gutters and horizontally in lane padding, so they never cross a node. Lane labels sit outside the pan/zoom viewport so they stay pinned left.
- **Fixtures:** each step's `quote` must be an exact substring of one `recipe.method` paragraph (it's highlighted in the "Original recipe" tab). Only add an arrow for a genuine prerequisite; timing advice ("while the chicken rests") goes in `note`. A lane with id `assembly` gets the dark "finish" colour.
- Add `?fast` to the URL to speed up delays (handy for Playwright). `#<sample id>` opens a sample.
