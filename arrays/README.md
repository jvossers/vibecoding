# Array Lab

A single self-contained HTML page for teaching 1D, 2D and 3D lists (arrays) in
Python, aimed at GCSE Computer Science.

Open `index.html` — no build step, no dependencies, works offline (it only
reaches out for web fonts, and falls back gracefully without them).

## What it does

* **Left panel** — a Python list literal you can edit. Every leaf value is a
  colour (`"#ff0000"`, or any CSS colour name), a number, or `True`/`False`/`None`.
* **Right panel** — the same list drawn as cubes. One index deep gives a row,
  two gives a grid, three gives a solid block you can spin, zoom and pan.
* **Live** — the picture redraws as you type.
* **Two-way link** — click a cube and the matching literal lights up in the
  code, plus the drill-down underneath shows how you would reach it:
  `cube` → `cube[1]` → `cube[1][2]` → `cube[1][2][0]`. Put the caret inside a
  colour in the code and its cube lights up instead.
* **Colour-coded indices** — the first bracket is amber, the second teal, the
  third pink, and the index numbers floating around the block use the same
  colours, so it is obvious which number means what.

## Controls

| Action | How |
| --- | --- |
| Spin | drag (one finger on a tablet) |
| Pan | shift-drag or right-drag (two fingers) |
| Zoom | scroll wheel (pinch) |
| Select a cube | click / tap it |
| Step between cubes | arrow keys; `PageUp` / `PageDown` for layers |
| Clear the selection | `Esc`, or click empty space |
| Copy an index path | click a line in "How you would reach it in Python" |

`gap` pulls the cubes apart, `see inside` makes everything translucent, and
`layer` isolates one slice of a 3D list — the three things that make the
inside of a block visible.

## Teaching ideas

* Start on **1D row**, add a colour, and watch `len()` change in the header.
* Move to **2D grid** and ask which index changes when you go down a row.
* Predict the path before clicking a cube; check with the drill-down.
* Break it on purpose — delete a `]`, or give one row fewer items (that is what
  the **ragged** preset shows) — and read the message in the status bar.
* **2D numbers** makes the point that arrays are not only about colours.

The parser accepts one assignment of the form `name = [...]`; anything after
the first list is ignored, and it draws at most three dimensions.
