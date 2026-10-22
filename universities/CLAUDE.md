# CLAUDE.md

## Project Overview

"Campus Atlas": helps students who are starting or taking A levels explore UK universities and
build a UCAS shortlist. It shows each university on a map with its Russell Group membership, a
league-table tier, typical A-level offers per subject area and the cost of living. Single-file
vanilla HTML/CSS/JS, no build tools, no back end. State (predicted grades, A-level subjects,
shortlist, notes, filters) lives in `localStorage` (`campusatlas.v1`); a shortlist can be shared
via `#/shortlist?s=uni.area,uni.area`.

## Running Locally

Open `index.html` in a browser. Deployed via GitHub Pages at labs.vossers.com/universities/

## Architecture (all in `index.html`)

- **Data**: `SUBJECTS` (A-level subjects, same ids as `/alevels/`), `AREAS` (about 33 subject
  areas with `adj`/`floor`/`cap` offer rules, `req` required and `pref` preferred subjects) and
  `U_ROWS` (one row per university: location, Russell Group, tier, base offer level, setting,
  cost band, halls and shared-house rent ranges, website, subject areas offered, offer overrides).
- **Offers**: `LADDER` runs CCC…A*A*A* in 8-point UCAS tariff steps. A university's offer for an
  area is `base + adj`, clamped to the area's `floor`/`cap`, unless the row overrides it.
- **Fit**: `fitFor()` compares the best three predicted grades with the offer (Reach / Match /
  Safe) and checks `req` with `meets()` (each group met by a different subject).
- **Views**: hash router (`#/`, `#/uni/<id>`, `#/shortlist`, `#/about`). Explore renders its
  skeleton once and `updateExplore()` redraws results and map pins on each filter change.
- **Map**: Leaflet 1.9.4 from cdnjs with CARTO light tiles (no API key). If Leaflet fails to
  load, `renderFallbackMap()` draws a built-in UK outline with projected pins.

## Data caveats

All offers, tiers and living costs are estimates from general knowledge, not from an official
dataset. Keep the footer and the About page accurate when changing the data model. There is
deliberately nothing about distance or travel from home. Full course names (e.g. from the Discover
Uni open dataset) are a possible next step and are not included yet.
