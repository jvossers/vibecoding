# CLAUDE.md

**Parity** is a static proof of concept: an internal sales tool that finds rule-checked alternatives for unavailable lab consumables, using an entirely synthetic catalogue (fictional brand "Quellmark"). See `README.md` for features, the rules and the architecture.

- **Tech:** plain HTML/CSS/ES modules, no dependencies, no build. Serve the folder over HTTP (`python3 -m http.server 8000`).
- **Live at:** `labs.vossers.com/alternatives/` (GitHub Pages, like the other vibes in this repo).

## Rules of the road

- Never use real manufacturer names, product names, SKUs, images or URLs. `tests/data.test.js` checks the data against a hashed deny-list.
- Data changes go through `scripts/generateSyntheticCatalogue.js`; run it after editing, then `node --test tests/*.test.js` (a test fails if the committed fixtures are stale).
- Matching logic lives only in `js/domain/matching.js` (shared by generator, UI and tests). Blockers must always win over the score; unknown values must stay `null` and surface as "Insufficient data", never as "No".
- Never word results as manufacturer approval or guaranteed interchangeability; use "Potential alternatives — review required".
- Render data and user input as text nodes (`h()` in `js/ui/dom.js`), never via `innerHTML`.
