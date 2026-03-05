# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AQA GCSE Chemistry revision site covering Reactivity of Metals topics (C4.2, C5.1–C5.3). Static HTML/CSS/JS with no build system, no frameworks, no dependencies. Hosted on GitHub Pages at labs.vossers.com.

**Target audience:** GCSE students taking Chemistry as part of **triple science** (separate sciences). Content should reflect the full AQA Chemistry specification, including higher-tier material not covered in combined science. Use language and explanations appropriate for 14–16 year olds studying at this level.

## Architecture

- **Single shared stylesheet** (`style.css`) and **single shared script** (`script.js`) across all pages
- Each topic is a standalone HTML page with consistent structure: hero section, content sections with definitions/tables/equations, tip/warning boxes
- `index.html` — home page with topic cards and RAG self-assessment checklist
- `quiz.html` — 16-question exam-style quiz (10 MC + 6 free-response)
- Topic pages: `c5-1-reactivity-series.html`, `c5-2-displacement-reactions.html`, `c5-3-extracting-metals.html`, `c4-2-equations-calculations.html`

## Key Patterns

**JavaScript (`script.js`):**
- DOM element references use `El` suffix (e.g., `scoreEl`, `menuToggle`)
- Functions: `initRAG()`, `updateProgress()`, `showAnswer()`, `checkMC()`, `checkFill()`, `updateQuizScore()`, `toggleCollapsible()`
- Data persisted in localStorage under key `gcse-chem-rag` as JSON
- RAG key format: `c51-order`, `c52-why`, etc.
- Quiz answers driven by `data-correct` and `data-rag-key` HTML attributes

**CSS (`style.css`):**
- CSS custom properties for theming: `--primary` (#1a5276), `--secondary` (#27ae60), `--accent` (#e67e22)
- RAG colors: red `--danger`, amber `--warning`, green `--secondary`
- Mobile-first responsive: breakpoints at 600px and 800px
- BEM-inspired class naming: `question-block`, `mc-options`, `answer-reveal`

**HTML:**
- Semantic HTML5 (header, nav, main, footer)
- Higher-tier content marked with `<span class="badge higher">H</span>`
- Each page has its own nav with active state set inline

## Development

No build step. Open any HTML file in a browser or use a local server:

```
npx serve .
```

## Monorepo Context

This is one project inside a multi-project repo (`vibecoding/`). Other sibling projects (piano, geo, cs) follow similar vanilla JS patterns.
