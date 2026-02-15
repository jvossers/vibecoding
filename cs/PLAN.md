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

| Ref | Topic | Subtopics |
|-----|-------|-----------|
| **1.1** | **Systems Architecture** | |
| 1.1.1 | Architecture of the CPU | Fetch-Decode-Execute cycle, ALU, Control Unit, Cache, Registers (PC, MAR, MDR, CIR, ACC), Von Neumann architecture |
| 1.1.2 | CPU Performance | Clock speed, cache size, core count |
| 1.1.3 | Embedded Systems | Definition, examples, vs general-purpose systems |
| **1.2** | **Memory and Storage** | |
| 1.2.1 | Primary Storage | RAM, ROM, virtual memory, cache |
| 1.2.2 | Secondary Storage | HDDs, SSDs, USB, optical storage |
| 1.2.3 | Units | Bit through terabyte, file size calculations |
| 1.2.4 | Data Storage | Binary/denary/hex conversions, binary addition & shifts, ASCII/Unicode, image representation (colour depth, resolution), sound (sample rate, bit depth) |
| 1.2.5 | Compression | Lossy vs lossless compression techniques |
| **1.3** | **Networks, Connections and Protocols** | |
| 1.3.1 | Networks and Topologies | Star, mesh topologies, routers, switches, WAPs, packet switching, DNS |
| 1.3.2 | Wired/Wireless, Protocols and Layers | IPv4/IPv6, MAC addresses, encryption, TCP/IP, HTTP/S, FTP, POP, IMAP, SMTP, protocol layers |
| **1.4** | **Network Security** | |
| 1.4.1 | Threats to Computer Systems | Malware (viruses, worms, trojans, spyware, ransomware), social engineering, phishing, brute-force, DoS/DDoS, SQL injection |
| 1.4.2 | Preventing Vulnerabilities | Penetration testing, anti-malware, firewalls, access levels, passwords, encryption, physical security |
| **1.5** | **Systems Software** | |
| 1.5.1 | Operating Systems | GUI/CLI, multitasking, memory management, drivers, user/file management |
| 1.5.2 | Utility Software | Encryption, defragmentation, compression, backup |
| **1.6** | **Impacts of Digital Technology** | |
| 1.6.1 | Ethical, Legal, Cultural and Environmental | Privacy, Data Protection Act 2018, Computer Misuse Act 1990, Copyright Act 1988, open-source vs proprietary |

### Paper 2: Computational Thinking, Algorithms and Programming (J277/02)

| Ref | Topic | Subtopics |
|-----|-------|-----------|
| **2.1** | **Algorithms** | |
| 2.1.1 | Computational Thinking | Abstraction, decomposition, algorithmic thinking |
| 2.1.2 | Designing Algorithms | Flowcharts, pseudocode, trace tables, logic errors |
| 2.1.3 | Searching and Sorting | Linear search, binary search, bubble sort, merge sort, insertion sort |
| **2.2** | **Programming Fundamentals** | |
| 2.2.1 | Programming Fundamentals | Variables, constants, operators, sequence/selection/iteration |
| 2.2.2 | Data Types | Integer, real/float, Boolean, character, string, casting |
| 2.2.3 | Additional Techniques | String manipulation, arrays, functions/procedures, file handling, scope, SQL, random numbers |
| **2.3** | **Producing Robust Programs** | |
| 2.3.1 | Defensive Design | Input validation, authentication, naming conventions, comments |
| 2.3.2 | Testing | Logic/syntax errors, iterative/terminal testing, normal/boundary/invalid/erroneous data |
| **2.4** | **Boolean Logic** | |
| 2.4.1 | Boolean Logic | AND, OR, NOT gates, truth tables, logic diagrams |
| **2.5** | **Languages and IDEs** | |
| 2.5.1 | Languages | High-level vs low-level, compiler vs interpreter |
| 2.5.2 | The IDE | Editor, diagnostics, breakpoints, syntax highlighting |

---

## 10 Simulations Selected for Day 1

These were chosen for maximum educational impact through interactivity — topics
where "seeing it happen" beats reading about it.

### 1. Fetch-Execute Cycle Simulator (1.1.1)
**Why:** The FDE cycle is abstract and hard to visualise from a textbook. An animated
CPU diagram showing instructions flowing through registers (PC, MAR, MDR, CIR, ACC)
with step-by-step controls makes the process concrete.

**Interaction:** Step/play/pause through a small program. Registers highlight as values
change. Memory bus animations show data movement. Students can load different simple
programs (e.g. add two numbers, store result).

### 2. Binary/Denary/Hexadecimal Converter (1.2.4)
**Why:** Number base conversion is a core exam skill. Interactive place-value columns
with toggle-able bits build intuition far faster than pen-and-paper drills.

**Interaction:** Click binary place-value columns (128, 64, 32... 1) to toggle bits on/off.
Denary and hex update live. Enter any base and see the others update. Includes practice
mode with random challenges and streak tracking.

### 3. Binary Arithmetic Visualiser (1.2.4)
**Why:** Binary addition with carries and bit shifting are common exam questions.
Seeing carry bits propagate step-by-step prevents the typical mistakes.

**Interaction:** Enter two binary numbers, watch addition proceed column-by-column
with animated carry bits. Overflow detection and explanation. Separate tab for
left/right bit shifts showing multiplication/division effect.

### 4. Image Representation Explorer (1.2.4)
**Why:** Students struggle to connect colour depth, resolution and file size. A hands-on
pixel editor makes the relationship tangible.

**Interaction:** Grid of editable pixels. Sliders to change resolution (grid size) and
colour depth (1-bit, 2-bit, 8-bit, 24-bit). File size calculation updates live. Side-by-side
comparison of same image at different settings. Students can draw simple images and
see how quality/size trade off.

### 5. Sorting Algorithm Visualiser (2.1.3)
**Why:** Classic CS education tool. Watching bars swap, split, and merge makes
algorithm behaviour intuitive and comparison meaningful.

**Interaction:** Side-by-side or switchable view of bubble sort, merge sort and insertion
sort. Speed control and step-through mode. Comparison counter showing how many
operations each algorithm uses. Randomise, nearly-sorted, and reverse-sorted starting
configurations.

### 6. Searching Algorithm Visualiser (2.1.3)
**Why:** Understanding why binary search requires sorted data and how it halves the
search space each time is much clearer when animated.

**Interaction:** A numbered list of items. Students pick a target value. Linear search
highlights items one-by-one; binary search highlights the midpoint and eliminated half.
Step counter comparison. Students can try on sorted vs unsorted data to see binary
search fail on unsorted.

### 7. Boolean Logic Gate Simulator (2.4.1)
**Why:** Logic gates and truth tables are heavily tested. Building circuits and seeing
outputs change in real-time builds deep understanding.

**Interaction:** Drag-and-drop AND, OR, NOT gates onto a canvas. Wire inputs/outputs
by clicking connectors. Toggle input switches (0/1) and see output update live.
Auto-generated truth table for the built circuit. Pre-built challenge circuits to analyse.

### 8. Network Topology Builder (1.3.1)
**Why:** Star vs mesh topology advantages/disadvantages are abstract until you see
packet routing and single-point-of-failure scenarios play out.

**Interaction:** Drag devices (PCs, servers, switches, routers) onto a canvas and connect
them with cables. Send a message between two nodes and watch it route. Simulate a
device/cable failure and see impact. Toggle between star and mesh layouts. Shows
advantages/disadvantages dynamically based on the scenario.

### 9. Compression Demonstrator (1.2.5)
**Why:** "Lossy removes data, lossless doesn't" is easy to memorise but hard to truly
understand without seeing it in action.

**Interaction:** Lossless tab: enter text and see Run-Length Encoding (RLE) applied
step-by-step with a size comparison. Lossy tab: load a simple image, apply increasing
levels of compression, and see visual quality degrade while file size shrinks. Direct
comparison mode showing original vs compressed with metrics.

### 10. Packet Switching Simulator (1.3.2)
**Why:** How data splits into packets, routes across a network, and reassembles is
a key networking concept that benefits enormously from visual simulation.

**Interaction:** Type a message that gets split into numbered packets. Packets animate
across a network diagram, potentially taking different routes. Packets arrive and
reassemble (possibly out of order). Shows headers, sequencing, and error checking.
Students can simulate congestion or a broken link to see rerouting.

---

## 10 More Simulations — Batch 2

These cover the remaining syllabus areas where interactivity adds the most value,
prioritised by exam frequency and difficulty of understanding from text alone.

### 11. Sound Representation Explorer (1.2.4)
**Why:** Sample rate and bit depth are abstract until you hear a waveform degrade
as you lower them. Students need to understand the trade-off between quality and
file size for sound encoding.

**Interaction:** Sliders for sample rate and bit depth with a live waveform display.
File size calculation updates in real-time. Playback comparison lets students hear the
difference between high and low quality settings. Visual overlay of original vs sampled
waveform shows where data is lost.

### 12. ASCII / Unicode Explorer (1.2.4)
**Why:** Students must convert characters to and from binary/denary in the exam.
A character map that instantly shows encodings builds fluency with the number systems.

**Interaction:** Interactive character map — click a character to see its decimal code,
binary, and hex representation. Type text and watch the binary stream build character
by character. Toggle between ASCII (7-bit) and Unicode to see why Unicode needs more
bits. Includes practice mode with random character/code conversion challenges.

### 13. Trace Table Stepper (2.1.2)
**Why:** Trace tables are one of the most common exam question formats. Students
must manually track variable values through pseudocode — an error-prone process
that's much clearer when animated.

**Interaction:** Enter or select from pre-built pseudocode snippets. Step through
execution line by line and watch the trace table build row by row as variables update.
The current line highlights in the code panel. Students can attempt to fill in the
next row before revealing the answer. Supports loops, selection, and simple functions.

### 14. CPU Performance Simulator (1.1.2)
**Why:** Clock speed, cache size, and core count are tested but the trade-offs are
hard to intuit. Students memorise definitions without understanding how these factors
interact to affect real performance.

**Interaction:** Simulate running tasks on CPUs with adjustable specs — clock speed,
number of cores, and cache size. Animated task bars show throughput and queue depth.
Side-by-side comparison mode lets students race two CPU configurations against
each other. Demonstrates diminishing returns and parallelism limits.

### 15. Memory Management Visualiser (1.5.1)
**Why:** Virtual memory, RAM allocation, and multitasking are abstract OS concepts.
Seeing processes compete for limited RAM makes paging and thrashing tangible.

**Interaction:** Visual RAM grid showing coloured process blocks being allocated and
deallocated. Launch and close processes to see memory fill up. When RAM is full,
pages swap to a disk area — students can see the performance penalty. Trigger
thrashing by launching too many processes. Labels show page tables and virtual
address mapping.

### 16. Defragmentation Visualiser (1.5.2)
**Why:** Students memorise "defrag rearranges files" but don't see why it matters
or how fragmentation occurs over time through normal file operations.

**Interaction:** Disk grid with coloured blocks representing files. Create, delete,
and resize files to watch fragmentation develop naturally. Run defrag and watch
blocks consolidate with smooth animations. A read-head animation shows the speed
difference between reading a fragmented vs contiguous file. Before/after access
time comparison.

### 17. Cipher & Encryption Tool (1.4.2)
**Why:** Encryption is a core security topic. The Caesar cipher is a required
example, and understanding the concept of a key and brute-force attack is essential
for exam answers.

**Interaction:** Interactive Caesar cipher — adjust the shift key with a slider and
see plaintext transform to ciphertext live with a letter-mapping wheel animation.
Brute-force visualiser tries all 26 keys in sequence, showing each attempt until
the plaintext is found. Explains why simple substitution is weak and how longer
keys increase security.

### 18. SQL Query Playground (2.2.3)
**Why:** SQL SELECT, WHERE, ORDER BY, and wildcard queries are tested in the exam.
Students need practice writing and debugging queries against a visible dataset.

**Interaction:** Pre-loaded sample table (e.g. student records with name, age, grade,
subject). Type SQL queries in an editor with syntax highlighting. Results filter
in real-time as you type. Error feedback highlights syntax mistakes. Includes
guided challenges: "Find all students with grade > 7", "Sort by name descending",
etc. Supports SELECT, FROM, WHERE, ORDER BY, AND/OR, and wildcards.

### 19. File Size Calculator (1.2.3)
**Why:** Unit conversions and file size calculations are common exam questions.
Students often lose marks on the arithmetic — seeing the calculation build step
by step prevents errors.

**Interaction:** Interactive calculator with tabs for image, sound, and text files.
Adjust parameters (resolution, colour depth for images; sample rate, bit depth,
duration for sound; character count, bits per character for text). Watch the
calculation build step by step with unit breakdowns (bits → bytes → KB → MB).
Includes practice mode with exam-style questions and mark-scheme answers.

### 20. Secondary Storage Comparator (1.2.2)
**Why:** Students must compare storage types by speed, capacity, cost, portability,
and durability. A side-by-side animated comparison makes the differences memorable.

**Interaction:** Animated side-by-side display of HDD (spinning platter with read arm),
SSD (instant flash access), optical disc (laser read), and USB flash drive. Adjust
file size and watch transfer time bars race. Comparison table shows capacity, speed,
cost per GB, durability, and portability stats. Click each device for a cutaway
animation showing how it physically stores data.

---

## Site Architecture

```
cs/
├── index.html                  # Landing page with topic browser
├── css/
│   ├── main.css                # Global styles (layout, nav, typography, theme)
│   └── simulation.css          # Shared simulation component styles (canvas, controls, panels)
├── js/
│   ├── nav.js                  # Navigation, topic filtering, search
│   ├── simulation-engine.js    # Shared simulation framework (animation loop, step/play/pause,
│   │                           #   speed control, state management)
│   └── canvas-utils.js         # Shared drawing utilities (arrows, labels, wires, grids,
│                               #   drag-and-drop, hit testing)
├── simulations/
│   ├── fetch-execute/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── binary-converter/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── binary-arithmetic/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── image-representation/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── sorting-algorithms/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── searching-algorithms/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── boolean-logic/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── network-topology/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── compression/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── packet-switching/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── sound-representation/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── ascii-unicode/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── trace-table/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── cpu-performance/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── memory-management/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── defragmentation/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── cipher-encryption/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── sql-playground/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   ├── file-size-calculator/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── sim.js
│   └── secondary-storage/
│       ├── index.html
│       ├── style.css
│       └── sim.js
└── PLAN.md
```

---

## Shared Libraries

### `simulation-engine.js`
- Animation loop with requestAnimationFrame
- Step / play / pause / reset controls
- Speed slider (0.25x to 4x)
- State snapshot and restore (for stepping back)
- Event bus for simulation components to communicate

### `canvas-utils.js`
- Draw arrows, labels, boxes, wires on a canvas
- Grid snapping and alignment
- Drag-and-drop with hit-testing
- Responsive canvas sizing
- Tooltip positioning

### `nav.js`
- Renders topic list on the landing page grouped by paper/section
- Filter by paper (1 or 2), search by keyword
- Breadcrumb navigation on simulation pages
- Responsive hamburger menu for mobile

### `main.css`
- CSS custom properties for theming (light colour scheme)
- Responsive grid layout
- Typography scale
- Navigation and breadcrumb styles
- Card components for the topic browser

### `simulation.css`
- Control bar styles (play/pause/step/reset/speed)
- Canvas container with aspect-ratio handling
- Side panel layout for info/settings
- Responsive simulation layout (stacked on mobile)

---

## Landing Page Design

The `index.html` landing page will contain:

1. **Header** — Site title, brief description of the resource
2. **Topic browser** — All syllabus topics listed in a card grid, grouped by paper
   and section (1.1, 1.2, etc.). Each card shows:
   - Section number and title
   - List of subtopics
   - "Interactive" badge on topics that have a simulation
   - Clicking a simulation card navigates to it
   - Non-simulation topics show content summary (future expansion)
3. **Filter bar** — Filter by Paper 1 / Paper 2, search by keyword
4. **Footer** — Attribution to OCR J277 syllabus, disclaimer that this is a study aid

---

## Simulation Page Template

Each simulation page follows a consistent layout:

1. **Breadcrumb** — Home > Paper 1 > 1.1.1 Architecture of the CPU > FDE Cycle
2. **Title and syllabus context** — What this covers and why it matters
3. **Simulation area** — The interactive visualisation (canvas or DOM-based)
4. **Control bar** — Play / pause / step / reset / speed (where applicable)
5. **Info panel** — Key facts, definitions, and exam tips for the topic
6. **Challenge mode** (where applicable) — Practice questions using the simulation

---

## Implementation Order

Build in this order to establish shared infrastructure first:

1. **Shared CSS** (`main.css`, `simulation.css`)
2. **Landing page** (`index.html` with topic browser, `nav.js`)
3. **Simulation engine** (`simulation-engine.js`, `canvas-utils.js`)
4. **Binary Converter** — simplest simulation, validates the shared framework
5. **Binary Arithmetic** — extends converter work, tests step-through controls
6. **Sorting Algorithms** — classic visualisation, tests animation engine
7. **Searching Algorithms** — simpler variant, reuses visualisation patterns
8. **Boolean Logic Gates** — tests drag-and-drop and wiring from canvas-utils
9. **Fetch-Execute Cycle** — complex state machine, tests full engine capabilities
10. **Image Representation** — grid-based, different interaction model
11. **Compression** — text and image modes, tests dual-panel layout
12. **Network Topology** — graph-based, tests drag-and-drop at scale
13. **Packet Switching** — network animation, builds on topology work
14. **Sound Representation** — audio playback, extends data representation coverage
15. **ASCII / Unicode** — character map, lightweight DOM-based simulation
16. **Trace Table** — pseudocode stepper, tests line-by-line execution engine
17. **CPU Performance** — animated task bars, side-by-side comparison layout
18. **Memory Management** — grid-based allocation, page swapping animations
19. **Defragmentation** — disk grid with block consolidation, read-head animation
20. **Cipher & Encryption** — letter-mapping wheel, brute-force sequence animation
21. **SQL Playground** — query editor with live results, syntax highlighting
22. **File Size Calculator** — step-by-step calculation builder, practice mode
23. **Secondary Storage** — animated device comparison, transfer time racing

---

## Design Principles

- **Mobile-first responsive** — many students will use phones/tablets
- **Accessible** — keyboard navigable, sufficient contrast, ARIA labels on controls
- **Exam-aligned** — info panels use OCR specification terminology
- **Progressive** — simulations work without JS for content (graceful degradation for info panels)
- **Fast** — no build step, no dependencies, instant load from any static host
