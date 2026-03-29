# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Understanding the Mass" — a single-page informational site that walks newcomers through the structure of a Roman Catholic Mass. Vertical scrolling timeline with expandable detail cards. Single-file vanilla HTML/CSS/JS, no build tools or dependencies.

## Running Locally

Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
```

Deployed via GitHub Pages at labs.vossers.com/mass/

## Architecture

Everything lives in a single `index.html`:

- **Hero section**: Landing with rose window SVG ornament, title, and scroll prompt
- **Sticky legend bar**: Distinguishes fixed (gold, "Same every week") vs variable (purple, "Changes each week") parts of the Mass using color coding
- **Vertical timeline**: Chronological steps grouped into four sections (Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist, Concluding Rites). Each step is a `.timeline-item` with class `fixed` or `variable`
- **Sticky section headers**: Section headers (Part I–IV) use `position: sticky` to remain visible below the legend bar while scrolling. Each section's header + items are wrapped in a `.section-group` div so headers push each other out naturally. A full-width `::after` pseudo-element provides the background and subtle box-shadow. Legend bar height is measured via JS and stored in `--legend-height` CSS variable. Sentinel elements + IntersectionObserver toggle a `.stuck` class (currently unused visually but available for future styling)
- **Expandable detail panels**: Each card has a `.step-detail` div that toggles via `.expanded` class on the parent `.timeline-item`. Only one card is open at a time. Contains sub-sections like "What to do", "The words", "Why it matters"
- **Duration estimates**: Each step shows an estimated duration in minutes (e.g. "2–4 min") in the card header
- **Language picker**: Fixed top-right EN/PL/NL buttons. Choice persisted in `localStorage`

### Internationalisation (i18n)

The page supports English, Polish, and Dutch. All content is data-driven:

- **`DATA` object**: Holds every section and step with all translatable strings keyed by language code (`en`, `pl`, `nl`). This includes step names, descriptions, notes, and all expandable detail panel content
- **`UI` object**: Holds static UI strings (hero text, legend labels, footer quote, "min" abbreviation, etc.) keyed by language code
- **`data-i18n` attributes**: Used on static HTML elements (hero, legend, footer) — swapped by `updateUI(lang)`
- **`renderTimeline(lang)`**: Rebuilds the entire timeline from the `DATA` object when language changes
- **`setLanguage(lang)`**: Orchestrates language switch — updates button states, UI strings, timeline, document `lang` attribute, and page `<title>`

When adding new steps or editing content, all three languages must be updated in the `DATA` object.

### Timeline line segments

The vertical line is not a single continuous line. Each `.timeline-item` draws its own segment via `::before`, with `.section-first` and `.section-last` classes controlling where segments start/end. This creates natural gaps at section headers.

### Design system

- **Fonts**: Cinzel (headings) + Cormorant Garamond (body) from Google Fonts
- **Palette**: Burgundy (`--burgundy`) for section headings, gold (`--fixed-color`) for fixed/ordinary elements, purple (`--variable-color`) for variable/proper elements, off-white (`--warm-white: #f7f6f3`) background
- **Timeline nodes**: Solid ring-style dots (border only, transparent centre) so the line passes through them
- **Animations**: Scroll-triggered fade-in via IntersectionObserver, expand/collapse via max-height transition
- **Background textures**: CSS radial gradients for warmth + inline SVG noise filter for subtle grain

### Content accuracy

This site explains Catholic liturgy to newcomers. When editing content, ensure theological and liturgical accuracy per the Roman Missal (Third Edition). The distinction between Ordinary (fixed) and Proper (variable) parts of the Mass is central to the design. Prayer texts in Polish and Dutch should use the official liturgical translations for each language.
