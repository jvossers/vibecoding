# CLAUDE.md

## Project Overview

"Trio": helps a Year 11 student choose three A levels. It scores a combination for university
access, career prospects, breadth and coherence, suggests the best next subject, and lists which
degree areas and university courses the combination meets. Single-file vanilla HTML/CSS/JS, no
build tools, no dependencies, no back end. State lives in `localStorage` (`trio.v1`) and can be
shared via the URL hash.

`PLAN.md` is the design brief and scoring model; `mockups/` is the reviewed mockup it was built from.

## Running Locally

Open `index.html` directly in a browser. Deployed via GitHub Pages at labs.vossers.com/alevels/

## Architecture (all in `index.html`)

- **Data**: `SUBJECTS`, `AREAS` (degree areas with `career`/`pop` weights) and `COURSES`
  (university courses). Rules use `req` (groups, each met by a *different* subject; matched by
  `unmatched()`) and `pref` (recommended).
- **Engine**: `raw()` scores a selection (cached); `score()` normalises against the best of all
  valid triples (`MAX`) and blends by priority and goals; `best()` finds the best completion of a
  partial selection.
- **Render**: one `render()` that redraws every card from `st`.

Course requirements are simplified. When editing them, keep the footer disclaimer accurate.
