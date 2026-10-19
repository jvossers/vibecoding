# CLAUDE.md

**Parity** is a static proof of concept: a sales tool that shows rule-based alternatives for lab consumables, using an entirely synthetic catalogue (fictional brand "Quellmark"). See `README.md` for details.

- **Tech:** plain HTML/CSS/ES modules, no dependencies, no build. Serve the folder over HTTP (`python3 -m http.server 8000`).
- **Live at:** `labs.vossers.com/alternatives/` (GitHub Pages, like the other vibes in this repo).

## Rules of the road

- Matching is all-or-nothing: an alternative passes every rule in `js/domain/rules.js` or it is not shown. No scores, confidence levels, review workflow or stock levels — the user asked for these to be left out.
- The rules in `rules.js` are placeholders until the user supplies the real ones.
- Never use real manufacturer names, product names, SKUs, images or URLs. `tests/data.test.js` checks the data against a hashed deny-list.
- Data changes go through `scripts/generateSyntheticCatalogue.js`; run it after editing, then `node --test tests/*.test.js` (a test fails if the committed fixtures are stale).
- Render data and user input as text nodes (`h()` in `js/ui/dom.js`), never via `innerHTML`.
