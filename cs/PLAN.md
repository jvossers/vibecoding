# OCR GCSE Computer Science Interactive Simulations Website

## Project Overview

A static website helping GCSE Computer Science students understand topics from the
OCR J277 syllabus through interactive simulations. Built with vanilla HTML, CSS and
JavaScript (no frameworks). All JS and CSS in separate files, with shared code in
common libraries.

Source: [OCR GCSE Computer Science J277 Specification](https://www.ocr.org.uk/qualifications/gcse/computer-science-j277-from-2020/)

---

## Complete OCR J277 Syllabus Topic List

### Paper 1: Computer Systems (J277/01)

| Ref | Topic | Subtopics | Simulation |
|-----|-------|-----------|------------|
| **1.1** | **Systems Architecture** | | |
| 1.1.1 | Architecture of the CPU | Fetch-Decode-Execute cycle, ALU, Control Unit, Cache, Registers (PC, MAR, MDR, CIR, ACC), Von Neumann architecture | Fetch-Execute Cycle Simulator |
| 1.1.2 | CPU Performance | Clock speed, cache size, core count | CPU Performance Simulator |
| 1.1.3 | Embedded Systems | Definition, examples, vs general-purpose systems | Embedded Systems Identifier |
| **1.2** | **Memory and Storage** | | |
| 1.2.1 | Primary Storage | RAM, ROM, virtual memory, cache | Primary Storage Explorer |
| 1.2.2 | Secondary Storage | HDDs, SSDs, USB, optical storage | Secondary Storage Comparator |
| 1.2.3 | Units | Bit through terabyte, file size calculations | File Size Calculator |
| 1.2.4 | Data Storage | Binary/denary/hex conversions, binary addition & shifts, ASCII/Unicode, image representation (colour depth, resolution), sound (sample rate, bit depth) | Binary/Denary/Hex Converter, Binary Arithmetic Visualiser, Image Representation Explorer, ASCII/Unicode Explorer, Sound Representation Explorer |
| 1.2.5 | Compression | Lossy vs lossless compression techniques | Compression Demonstrator |
| **1.3** | **Networks, Connections and Protocols** | | |
| 1.3.1 | Networks and Topologies | Star, mesh topologies, routers, switches, WAPs, packet switching, DNS | Network Topology Builder |
| 1.3.2 | Wired/Wireless, Protocols and Layers | IPv4/IPv6, MAC addresses, encryption, TCP/IP, HTTP/S, FTP, POP, IMAP, SMTP, protocol layers | Packet Switching Simulator |
| **1.4** | **Network Security** | | |
| 1.4.1 | Threats to Computer Systems | Malware (viruses, worms, trojans, spyware, ransomware), social engineering, phishing, brute-force, DoS/DDoS, SQL injection | Cyber Threats Simulator |
| 1.4.2 | Preventing Vulnerabilities | Penetration testing, anti-malware, firewalls, access levels, passwords, encryption, physical security | Cipher & Encryption Tool |
| **1.5** | **Systems Software** | | |
| 1.5.1 | Operating Systems | GUI/CLI, multitasking, memory management, drivers, user/file management | Memory Management Visualiser |
| 1.5.2 | Utility Software | Encryption, defragmentation, compression, backup | Defragmentation Visualiser |
| **1.6** | **Impacts of Digital Technology** | | |
| 1.6.1 | Ethical, Legal, Cultural and Environmental | Privacy, Data Protection Act 2018, Computer Misuse Act 1990, Copyright Act 1988, open-source vs proprietary | Ethics & Law Scenario Sorter |

### Paper 2: Computational Thinking, Algorithms and Programming (J277/02)

| Ref | Topic | Subtopics | Simulation |
|-----|-------|-----------|------------|
| **2.1** | **Algorithms** | | |
| 2.1.1 | Computational Thinking | Abstraction, decomposition, algorithmic thinking | Computational Thinking Workshop |
| 2.1.2 | Designing Algorithms | Flowcharts, pseudocode, trace tables, logic errors | Trace Table Stepper |
| 2.1.3 | Searching and Sorting | Linear search, binary search, bubble sort, merge sort, insertion sort | Sorting Algorithm Visualiser, Searching Algorithm Visualiser |
| **2.2** | **Programming Fundamentals** | | |
| 2.2.1 | Programming Fundamentals | Variables, constants, operators, sequence/selection/iteration | Programming Fundamentals Playground |
| 2.2.2 | Data Types | Integer, real/float, Boolean, character, string, casting | Data Types Explorer |
| 2.2.3 | Additional Techniques | String manipulation, arrays, functions/procedures, file handling, scope, SQL, random numbers | SQL Query Playground |
| **2.3** | **Producing Robust Programs** | | |
| 2.3.1 | Defensive Design | Input validation, authentication, naming conventions, comments | Defensive Design Tester |
| 2.3.2 | Testing | Logic/syntax errors, iterative/terminal testing, normal/boundary/invalid/erroneous data | Testing & Test Data Workshop |
| **2.4** | **Boolean Logic** | | |
| 2.4.1 | Boolean Logic | AND, OR, NOT gates, truth tables, logic diagrams | Boolean Logic Gate Simulator |
| **2.5** | **Languages and IDEs** | | |
| 2.5.1 | Languages | High-level vs low-level, compiler vs interpreter | Language Translator Visualiser |
| 2.5.2 | The IDE | Editor, diagnostics, breakpoints, syntax highlighting | *(none — students learn IDE features by using a real IDE; exam questions are simple 2-mark recall)* |

---

## Simulation Coverage: 30 of 31 Topics

**Only 2.5.2 (The IDE) has no simulation.** Every other topic in the J277 specification now has at least one interactive simulation.

### Batch 1 (10 simulations)
1. Fetch-Execute Cycle Simulator (1.1.1)
2. Binary / Denary / Hex Converter (1.2.4)
3. Binary Arithmetic Visualiser (1.2.4)
4. Image Representation Explorer (1.2.4)
5. Sorting Algorithm Visualiser (2.1.3)
6. Searching Algorithm Visualiser (2.1.3)
7. Boolean Logic Gate Simulator (2.4.1)
8. Network Topology Builder (1.3.1)
9. Compression Demonstrator (1.2.5)
10. Packet Switching Simulator (1.3.2)

### Batch 2 (10 simulations)
11. Sound Representation Explorer (1.2.4)
12. ASCII / Unicode Explorer (1.2.4)
13. Trace Table Stepper (2.1.2)
14. CPU Performance Simulator (1.1.2)
15. Memory Management Visualiser (1.5.1)
16. Defragmentation Visualiser (1.5.2)
17. Cipher & Encryption Tool (1.4.2)
18. SQL Query Playground (2.2.3)
19. File Size Calculator (1.2.3)
20. Secondary Storage Comparator (1.2.2)

### Batch 3 (10 simulations)
21. Embedded Systems Identifier (1.1.3) — DOM-only, reset-only engine
22. Primary Storage Explorer (1.2.1) — Canvas+DOM, full play/pause/step
23. Cyber Threats Simulator (1.4.1) — DOM-only, reset-only engine
24. Ethics & Law Scenario Sorter (1.6.1) — DOM-only, reset-only engine
25. Computational Thinking Workshop (2.1.1) — DOM-only, reset-only engine
26. Programming Fundamentals Playground (2.2.1) — DOM-only, reset-only engine
27. Data Types Explorer (2.2.2) — DOM-only, reset-only engine
28. Defensive Design Tester (2.3.1) — DOM-only, reset-only engine
29. Testing & Test Data Workshop (2.3.2) — DOM-only, reset-only engine
30. Language Translator Visualiser (2.5.1) — Canvas+DOM, full play/pause/step

---

## Site Architecture

```
cs/
├── index.html                  # Landing page with topic browser
├── PLAN.md                     # This file
├── css/
│   ├── main.css                # CSS custom properties (light + dark), layout, typography, cards
│   └── simulation.css          # Shared simulation styles (canvas, controls, panels, toolbar)
├── js/
│   ├── theme.js                # Dark mode toggle (localStorage, data-theme attribute)
│   ├── nav.js                  # Landing page topic browser + simulation page breadcrumbs
│   ├── topics-data.js          # Full syllabus data (TopicsData array with simulation slugs)
│   └── simulation-engine.js    # SimulationEngine class + static helpers (resizeCanvas,
│                               #   themeColors, fisherYates, debounceResize)
├── simulations/
│   ├── fetch-execute/          # 1.1.1
│   ├── cpu-performance/        # 1.1.2
│   ├── embedded-systems/       # 1.1.3
│   ├── primary-storage/        # 1.2.1
│   ├── secondary-storage/      # 1.2.2
│   ├── file-size-calculator/   # 1.2.3
│   ├── binary-converter/       # 1.2.4
│   ├── binary-arithmetic/      # 1.2.4
│   ├── image-representation/   # 1.2.4
│   ├── ascii-unicode/          # 1.2.4
│   ├── sound-representation/   # 1.2.4
│   ├── compression/            # 1.2.5
│   ├── network-topology/       # 1.3.1
│   ├── packet-switching/       # 1.3.2
│   ├── cyber-threats/          # 1.4.1
│   ├── cipher-encryption/      # 1.4.2
│   ├── memory-management/      # 1.5.1
│   ├── defragmentation/        # 1.5.2
│   ├── ethics-law/             # 1.6.1
│   ├── computational-thinking/ # 2.1.1
│   ├── trace-table/            # 2.1.2
│   ├── sorting-algorithms/     # 2.1.3
│   ├── searching-algorithms/   # 2.1.3
│   ├── programming-fundamentals/ # 2.2.1
│   ├── data-types/             # 2.2.2
│   ├── sql-playground/         # 2.2.3
│   ├── defensive-design/       # 2.3.1
│   ├── testing/                # 2.3.2
│   ├── boolean-logic/          # 2.4.1
│   └── language-translators/   # 2.5.1
│       ├── index.html          # (each sim has these 3 files)
│       ├── style.css
│       └── sim.js
```

Each simulation directory contains exactly 3 files: `index.html`, `sim.js`, `style.css`.

---

## Shared Libraries

### `simulation-engine.js`
- `SimulationEngine` class with play/pause/step/reset controls
- Emits 4 events: `onReset`, `onStep`, `onRender`, `onStateChange`
- Two modes: **reactive** (reset-only, for DOM-only sims) and **animated** (full controls with requestAnimationFrame loop)
- Speed slider: 0.25x, 0.5x, 1x, 1.5x, 2x, 4x
- Default step interval: 500ms
- Static helpers:
  - `SimulationEngine.themeColors()` — reads CSS vars for canvas drawing (bg, text, muted, primary, primaryFg, accent, border, surface)
  - `SimulationEngine.resizeCanvas(canvas, minH, ratio, maxH)` — DPR-aware canvas scaling
  - `SimulationEngine.fisherYates(arr)` — in-place array shuffle
  - `SimulationEngine.debounceResize(fn)` — debounced window resize handler

### `theme.js`
- Reads theme from `localStorage('gcse-cs-theme')`, default `'dark'`
- Creates toggle button in `.site-header .container`
- Sets `data-theme` attribute on `<html>`, emits `themechange` custom event

### `nav.js`
- **Landing page mode:** Renders all topics as card grid with filter buttons (All / Paper 1 / Paper 2 / Interactive) and debounced search
- **Simulation page mode:** Renders breadcrumb from TopicsData (Home > Paper > Section > Topic > Simulation Name)

### `topics-data.js`
- `window.TopicsData` array — full J277 syllabus with refs, titles, subtopics, and simulation slugs
- Used by `nav.js` for both landing page and breadcrumbs

### `main.css`
- CSS custom properties for light and dark themes (`--clr-bg`, `--clr-surface`, `--clr-text`, `--clr-primary`, etc.)
- Typography scale (`--fs-xs` through `--fs-2xl`), spacing (`--sp-1` through `--sp-12`)
- Border radii, shadows, transition timing
- Dark theme via `[data-theme="dark"]` overrides
- Card grid, filter bar, footer styles

### `simulation.css`
- `.sim-page` — grid layout (main area + 300px sidebar on desktop, stacked on mobile)
- `.sim-area`, `.canvas-container`, `.control-bar`, `.ctrl-btn`, `.speed-control`
- `.sim-sidebar`, `.info-panel`, `.key-fact`, `.exam-tip`, `.challenge-panel`
- `.sim-toolbar` with `.algo-btn` tab switchers
- `.stats-bar` with `.stat-item` counters
- `.comparison-table` for algorithm/feature comparisons

---

## Simulation Page Template

Each simulation page follows a consistent layout:

1. **Dark mode init** — inline script in `<head>` reads localStorage before paint
2. **Header** — site title linking to landing page
3. **Breadcrumb** — Home > Paper X > Section > Topic > Simulation Name
4. **Simulation area** — interactive content (canvas and/or DOM)
5. **Toolbar** (optional) — tab buttons (`.algo-btn`) for multi-mode simulations
6. **Control bar** — play/pause/step/reset/speed (animated sims) or reset-only (reactive sims)
7. **Stats bar** (optional) — counters for comparisons, swaps, steps, etc.
8. **Sidebar** — key facts, exam tips, and optional challenge/practice panel
9. **Footer** — OCR specification attribution

Script load order: `theme.js` > `topics-data.js` > `nav.js` > `simulation-engine.js` > `sim.js`

---

## Design Principles

- **Mobile-first responsive** — many students will use phones/tablets
- **Dark mode by default** — with toggle to light mode, persisted in localStorage
- **Accessible** — keyboard navigable, sufficient contrast, ARIA labels on controls
- **Exam-aligned** — info panels use OCR specification terminology
- **Fast** — no build step, no dependencies, instant load from any static host
- **Consistent** — all sims follow the same patterns (IIFE, SimulationEngine, CSS vars)

---

## Simulation Types

### DOM-Only (Reset-Only Engine)
Used for quiz/sort/classify simulations where there's no animation loop. The SimulationEngine provides only a reset button. All interaction is event-driven.

Examples: Binary Converter, Embedded Systems, Cyber Threats, Ethics & Law, Computational Thinking, Programming Fundamentals, Data Types, Defensive Design, Testing

### Canvas + DOM (Full Animated Engine)
Used for visual simulations with step-through animation. Pre-computes all steps at setup (like sorting's `snap()` pattern), then plays back by index. Full play/pause/step/speed controls.

Examples: Sorting Algorithms, Fetch-Execute Cycle, Primary Storage, Language Translators, CPU Performance, Memory Management
