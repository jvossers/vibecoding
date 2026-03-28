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
- **Expandable detail panels**: Each card has a `.step-detail` div that toggles via `.expanded` class on the parent `.timeline-item`. Only one card is open at a time. Contains sub-sections like "What to do", "The words", "Why it matters"

### Design system

- **Fonts**: Cinzel (headings) + Cormorant Garamond (body) from Google Fonts
- **Palette**: Burgundy (`--burgundy`) for section headings, gold (`--fixed-color`) for fixed/ordinary elements, purple (`--variable-color`) for variable/proper elements, warm parchment (`--warm-white: #e8ddca`) background
- **Animations**: Scroll-triggered fade-in via IntersectionObserver, expand/collapse via max-height transition
- **Background textures**: CSS radial gradients for warmth + inline SVG noise filter for subtle grain

### Content accuracy

This site explains Catholic liturgy to newcomers. When editing content, ensure theological and liturgical accuracy per the Roman Missal (Third Edition). The distinction between Ordinary (fixed) and Proper (variable) parts of the Mass is central to the design.
