# Parity — Product Alternatives Finder (proof of concept)

**Demo — Synthetic Catalogue.** Parity is an internal sales-assistant prototype. A sales rep searches for the product a customer asked for, opens it, and sees the products that match it under a fixed set of rules.

Everything in it is invented: the brand (**Quellmark**), the product ranges, the SKUs and the specifications. No real manufacturer data, names, codes, images or URLs are used.

The app doesn't show stock. Reps check availability in the stock system.

## Run it

The app loads its JSON data with `fetch()`, so it needs a static file server (browsers block `fetch()` for `file://` pages). There is nothing to install and no build step.

```bash
cd alternatives
python3 -m http.server 8000
# open http://localhost:8000/
```

## Commands

| Command | What it does |
|---|---|
| `node --test tests/*.test.js` (or `npm test`) | Runs the tests with Node's built-in test runner. No packages needed. |
| `node scripts/generateSyntheticCatalogue.js` (or `npm run generate`) | Regenerates `data/*.json` and `assets/illustrations/*.svg` from a fixed seed. |
| `node scripts/generateSyntheticCatalogue.js --check` | Validates the catalogue and prints counts, including how many tips have alternatives under the current rules. |

`package.json` only sets `"type": "module"`. It has no dependencies, and `npm install` is never needed.

## Using it

- **Search page:** one search box. Filters for category, range, volume, sterile and filtered sit behind an **Advanced search** button; they open automatically when a shared link already applies them, and the button shows how many are active. Each row shows the product's price and how many alternatives it has. The filters are kept in the URL, so "Back to search" returns to the same view.
- **Product page:** the product, then its **Alternatives** section: the requested product in its own panel, the fields it was matched on, and then a separate table with only the matching products (columns line up with the requested product). Columns that are not part of the rules (packaging and price) are highlighted where they differ. Full specifications follow.

## Export PDF

The product page has an **Export PDF** button for emailing a summary to a customer. One click builds a one-page A4 summary (the requested product, the rules it was matched on, and all alternatives with prices) and opens the browser's print dialog, where the rep chooses **Save as PDF**. The suggested file name is `Alternatives – <SKU>`.

This uses the browser's own print engine (`js/ui/exportSheet.js` plus the print styles in `css/styles.css`), so there is no PDF library, and the PDF has real, selectable text. Browsers can't attach files to emails by themselves, so the rep attaches the saved PDF in their email client.

## Matching rules

A product is an alternative only if it is in the same category and **every** rule passes. There are no scores, confidence levels or partial matches.

The rules live in one file, `js/domain/rules.js`. **The current rules are placeholders**, to be replaced with the real ones:

| Rule | Fields | Compare |
|---|---|---|
| Volume range | `volumeMinUl`, `volumeMaxUl` | equal |
| Pipette fit | `compatibleInstrumentFamilies` | same set |
| Sterile | `sterile` | equal |
| Filtered | `filtered` | equal |
| Low retention | `lowRetention` | equal |
| Tip format | `tipFormat` | equal |

Each rule names one or more `specifications` fields and a compare type: `equal`, or `sameSet` for lists in any order. A missing (`null`) value never matches. Rules are grouped by category; only pipette tips have rules at the moment, so pipettes and accessories have no alternatives.

To change the rules, edit `rules.js`, then run `node scripts/generateSyntheticCatalogue.js --check` to see the effect and `node --test tests/*.test.js` to check them.

With the placeholder rules, 41 of the 91 tips have at least one alternative (68 in total). Most matches are the same tip in a different pack size, or the same tip from another range.

## Architecture

```
index.html                     page shell (top bar, view outlet)
css/styles.css                 design tokens and all styling (plain CSS)
js/app.js                      hash router (search page, product page)
js/data/catalogueRepository.js the only data-access module; swap for an API client later
js/domain/rules.js             THE MATCHING RULES (placeholder)
js/domain/matching.js          applies the rules: isAlternative(), findAlternatives()
js/domain/search.js            search and filters (pure functions)
js/domain/validation.js        integrity checks for the catalogue
js/domain/attributes.js        labels and formatting
js/ui/catalogue.js             search page
js/ui/productDetail.js         product page with alternatives
js/ui/exportSheet.js           one-page PDF summary (via the browser's print dialog)
js/ui/components.js, dom.js    small DOM helpers (text nodes only for data and input)
js/ui/illustrations.js         generated geometric product silhouettes (SVG)
data/products.json             127 synthetic SKUs (91 tips, 26 pipettes, 10 accessories), each with a price
data/instrument-families.json  7 fictional pipette families and their tip interfaces
scripts/generateSyntheticCatalogue.js  deterministic generator
tests/*.test.js                node:test suites
```

- **Data access:** views only call the async methods of `createCatalogueRepository()` (`listProducts`, `getProduct`, `alternativesFor`, …). If alternatives later come from another system, only that module changes.
- **Rendering:** all product data and user input reach the page as text nodes.

## Prices

Every product has a synthetic list price in GBP (`price` on the product): per pack for tips, and per unit for pipettes and accessories. The generator derives prices from the product's attributes (range, volume, sterile, filtered, pack size and packaging), so they stay consistent. For example, a 10-rack pack costs a little less than ten single racks.

## Limitations

- **Illustrative data:** the matching rules and the specifications are placeholders, not real engineering data.
- **No stock:** availability is checked in the stock system, outside this app.
