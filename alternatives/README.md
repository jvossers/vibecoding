# Parity — Product Alternatives Finder (proof of concept)

**Demo — Synthetic Catalogue.** Parity is an internal sales-assistant prototype. When a customer asks for a lab consumable that is out of stock, it finds technically plausible alternatives, explains why each one qualifies or doesn't, and lets staff mark candidates for internal review.

Everything in it is invented: the brand (**Quellmark**), the product ranges, the SKUs, the specifications, the instrument families, the relationships and the documents. No real manufacturer data, names, codes, images or URLs are used. Results are *potential alternatives — review required*. They are not certified, endorsed or validated by anyone.

## Run it

You need a static file server, because the app loads its JSON data with `fetch()` (browsers block that for `file://` pages). Nothing has to be installed and there is no build step.

```bash
cd alternatives
python3 -m http.server 8000
# open http://localhost:8000/
```

Any static server works, for example `npx http-server` or `php -S localhost:8000`. The server only serves files; there is no backend.

## Commands

| Command | What it does |
|---|---|
| `node --test tests/*.test.js` (or `npm test`) | Runs the 79 automated tests using Node's built-in test runner. No packages needed. |
| `node scripts/generateSyntheticCatalogue.js` (or `npm run generate`) | Regenerates `data/*.json` and `assets/illustrations/*.svg` from the fixed seed. |
| `node scripts/generateSyntheticCatalogue.js --check` | Validates the generated catalogue and prints its counts without writing files. |

`package.json` only sets `"type": "module"` so Node treats the `.js` files as ES modules. It has no dependencies, and `npm install` is never needed. Node 18 or newer works.

## What's in the demo

- **Catalogue** (landing screen): global search (press `/`), summary cards, and filters for category, stock status, volume range, sterile, filtered, product range and instrument family. Filters live in the URL, so a filtered view can be shared.
- **Product detail**: illustration, availability, description, and specifications grouped into performance, compatibility, hygiene/cleanliness and packaging. Unknown values read "Not recorded" and are never shown as "No". Related products appear in their own section, labelled with the relationship type and direction, and are never presented as substitutes.
- **Alternative finder** (the main demo screen): the source product stays pinned at the top. The requirement controls default from the source (volume, sterile, filtered, low retention, wide bore, instrument family, packaging, required claims), and results recompute as soon as a control changes. Ranked candidate cards show a classification label, a score ring, a source-vs-candidate attribute strip and an expandable "Why this result" panel (blockers, conditions, unknowns, differences, matches). There are tabs per classification, an *In stock only* toggle, an *Include excluded* toggle, a comparison of the source with up to 3 candidates, and review actions.
- **Review queue**: seeded and locally reviewed pairs, filterable by status, classification and text. Each pair links back to its comparison. Statuses are clearly marked as prototype-only.
- **Reset demo data** (sidebar) clears review decisions, notes and recently viewed items from `localStorage`.

Good places to start:

| Scenario | Link |
|---|---|
| Out-of-stock sterile filter tip with a spec-equivalent pack, a strong alternative, conditionals and look-alikes that are blocked | `#/alternatives/p-qmt-al0200-s96` |
| Non-sterile tip with many alternatives, packaging differences and a larger-volume option | `#/alternatives/p-qmt-cf1000-r96` |
| No safe alternative: secure-lock tips. Turn on *Include excluded* to see the interface blockers | `#/alternatives/p-qmt-lk0200-fs96` |
| Low retention required: nothing passes until the requirement is relaxed, after which standard filter tips appear with an advisory difference | `#/alternatives/p-qmt-ss0200-fs96` |
| Incomplete legacy source: everything is *Insufficient data* until you choose an instrument family | `#/alternatives/p-qmt-hc0200-a` |
| Equipment is never a substitute | `#/alternatives/p-qmp-ax0200` |

## Matching rules

The rules are deterministic and run in the browser. There is no LLM at runtime. They live in `js/domain/matching.js`, and the generator, the UI and the tests all share that one module.

1. **Category.** Only like-for-like consumables are compared. A pipette or accessory is never a substitute for a tip: it is classified *Not compatible* with a category blocker. Equipment that fits the source is deliberately added to the candidate pool, so the excluded list shows this rule at work.
2. **Instrument family / tip interface.** The candidate must be listed for the customer's family. A different interface (for example the Q-Lock secure cone versus the universal Q-Cone, or capillary pistons) is a blocker. If the family is left as "any listed for the source" and a candidate covers only some of the source's families, it is *Conditional* ("confirm the customer's pipette").
3. **Volume.** The candidate's range must cover the required range. Partial overlap that covers at least 75 % of the required span is *Conditional*, with a visible warning. Less overlap, or no overlap, is a blocker. A tip with a much larger nominal volume gets an advisory note about accuracy.
4. **Sterility and filtration.** When the source is sterile or filtered, a non-sterile or unfiltered candidate is blocked. An unknown value gives *Insufficient data*, never a match. If the user relaxes one of these requirements for a sterile or filtered source, the candidate can only become *Conditional*, never a clean match.
5. **Use-case requirements.** Low retention, wide bore, a specific packaging format and required cleanliness claims are hard rules once selected. If not selected, differences are advisory, for example a packaging difference.
6. **Advisory differences.** Material, length, tip format, claims not stated, pack quantity, sterilisation method, colour and autoclavability lower the score but never change eligibility.
7. **Scoring after gating.** Classification is decided first: blockers lead to *Not compatible*, then unknowns on a hard requirement lead to *Insufficient data*, then conditions lead to *Conditional*; anything left is a *Potential alternative*. Only the last two get a 0–100 similarity score, and *Conditional* scores are capped at 89. A high score can never override a blocker, and the score is shown as "withheld" otherwise.
8. **Wording.** Results are labelled *Potential alternatives — review required*. "Approved for demo" is an internal UI state. It can only be set on eligible candidates and is not a technical or regulatory approval.

Synthetic relationships, including fictional "substitute notes", appear on candidate cards as context ("On file: …") but never affect the rules. One note deliberately points at a candidate the rules block.

## Architecture

```
index.html                     app shell (sidebar, top bar, view outlet)
css/styles.css                 design tokens and all styling (plain CSS)
js/app.js                      hash router, global search, shell, reset
js/data/catalogueRepository.js the only data-access module (async; swap for an API client later)
js/data/reviewStore.js         review decisions: seeded statuses + localStorage overrides
js/domain/attributes.js        labels and formatting; unknown is always "Not recorded"
js/domain/matching.js          the rules, scoring, explanations, candidate pool, ranking
js/domain/search.js            catalogue search and filters (pure functions)
js/domain/validation.js        integrity checks for products, relationships and alternatives
js/ui/dom.js                   tiny DOM helpers (text nodes only for data and input)
js/ui/components.js            chips, score ring, thumbnails, dialogs, toasts, icons
js/ui/illustrations.js         generated geometric product silhouettes (SVG)
js/ui/catalogue.js             screen A
js/ui/productDetail.js         screen B
js/ui/alternativeFinder.js     screen C (requirements, candidate cards, compare tray)
js/ui/comparison.js            side-by-side comparison dialog
js/ui/reviewQueue.js           screen D
data/products.json             139 synthetic SKUs
data/relationships.json        directed synthetic relationships (all six types)
data/alternatives.json         seeded candidate pairs, derived from the rules
data/instrument-families.json  7 fictional instrument families and their tip interfaces
assets/illustrations/*.svg     generic generated illustrations, one per product kind
assets/docs/placeholder.html   local stand-in for every listed document
scripts/generateSyntheticCatalogue.js  deterministic generator (seed 20261019)
tests/*.test.js                node:test suites
```

- **No dependencies.** The app uses plain HTML, CSS and ES modules, and is rendered with small DOM functions. There is no framework, bundler, transpiler, CDN, web font or external API.
- **Data access.** Views only call the async methods of `createCatalogueRepository()` (`listProducts`, `getProduct`, `relationshipsFor`, `seedsForSource`…). Replacing the fixtures with an HTTP API means reimplementing that one module.
- **Safe rendering.** All product data and user input reach the DOM as text nodes. The only markup parsed from strings is the fixed icon set and the generated SVG illustrations, which are built from numbers and allow-listed colours.
- **State in the URL.** Catalogue filters, finder requirements, tabs and the comparison selection are written to the hash with `history.replaceState`, so a view survives a refresh and can be shared.
- **Persistence.** Review decisions and notes are overrides stored under `parity.reviews.v1` in `localStorage`, on top of the seeded statuses in `alternatives.json`. The store keeps working in memory if storage is blocked.

## Synthetic data

`scripts/generateSyntheticCatalogue.js` builds the catalogue from a fixed seed, so every run produces identical files. A test checks that the committed fixtures match a fresh generation.

- **139 SKUs:** 103 pipette tips across 11 fictional ranges (Corefit, Aerolock, Slipstream, Longreach, Openbore, Lockline, Microdose capillary pistons, Multiflex, Macro, Terra and the legacy Heritage records), 26 pipettes in 7 instrument families, and 10 accessories.
- **21 out-of-stock and 8 discontinued products.** 28 unavailable products act as sources, and 34 sources have 2–5 eligible candidates.
- **296 seeded candidate pairs:** 98 potential, 62 conditional, 63 not compatible (close look-alikes blocked by sterility, filtration or interface) and 73 insufficient data. 18 are spec-equivalent apart from packaging.
- **210 relationships** covering `compatible_with`, `accessory_for`, `same_family`, `related`, `supersedes` and `published_substitute`. All have `origin: synthetic_demo`, and direction is meaningful (for example new → superseded).
- **12 legacy "Heritage" records** with explicit `null` values for sterility, filtration, compatibility, volume or packaging, to exercise the *Insufficient data* path.
- **Internal consistency is validated:** the pack size in a name matches `unitsPerPack` (and racks × tips), "Sterile"/"Non-sterile"/"Filter" in a name match the fields, filter material and sterilisation method exist only when applicable, and every compatibility reference points to an existing family with a single tip interface.

## Tests

`node --test tests/*.test.js` covers:

- **Matching:** volume coverage, partial and invalid ranges, sterility, filtration, instrument families and interfaces, unknown values, relaxed requirements, low retention, wide bore, packaging and claims, a pipette never being a substitute, scores never overriding blockers, and deterministic ranking.
- **Data:** the fixtures validate, the generator is deterministic and up to date, the required counts are met, relationships have intact references and direction, stored alternatives match a fresh evaluation, no approvals exist on blocked pairs, and a hashed deny-list check confirms that no real manufacturer or product names appear in the data.
- **Repository and review store:** lookups, relationship direction, retry after a failed fetch, persistence across instances (as on a page refresh), reset, the approval guard, and missing or corrupt storage.
- **Search and filters:** unit spellings (`uL`, `μl`, `1,000`), SKU ranking, attribute keywords, whole-number volumes, tri-state unknown filters, instrument-family filtering and URL round-trips.

## Limitations

- **Unvalidated data.** The specifications and rules are illustrative, not engineering data. Real substitution needs validated data and qualified human review.
- **Simplified compatibility.** Compatibility works at instrument-family level. Real fit also depends on cone geometry, ejector clearance and pipette model.
- **Hand-tuned scoring.** The score is a simple weighted penalty with hand-picked weights, meant to show ranking rather than any measured similarity.
- **Browser-local reviews.** Review decisions live only in this browser's `localStorage`. There are no users, audit trail or shared queue.
- **No sale actions.** There is no ordering, pricing or customer context. Stock figures are random but fixed by the seed.
- **System fonts only**, because no external font files may be loaded.
