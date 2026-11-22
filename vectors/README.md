# Two Trapeziums: GCSE vectors walkthrough

An interactive, step-by-step solution to a GCSE Higher vectors question (two trapeziums ABCD and CDEF, find k where DN : NC = k : 1). Live at https://labs.vossers.com/vectors/.

- Four methods: shared origin, collinearity (NM / NE), section formula (1 : 2 blend) and coordinates in the (a, b) basis.
- One idea per step. The diagram highlights the routes and vectors each step uses. Every step has a hint and a "why this step?" note.
- **No spoilers.** Until the last step of a method, the diagram is drawn "not accurately" (AB = 3.4a and EF = 3.2a, so N sits at a non-integer 7 : 3). On the last step it morphs to scale and shows the answer. The compare screen only unlocks once a method has been finished.
- Phone-first, full-screen layout with no page scrolling. Swipe the diagram or use ← / → / Home / End to change step. Supports light and dark mode and reduced motion.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page shell |
| `styles.css` | Layout and theme |
| `geometry.js` | Pure vector functions and the diagram model (D = (500, 420), a = (0, −100), b = (160, −35)) |
| `steps.js` | All lesson content as data: approaches, steps, highlights, hints |
| `app.js` | Rendering, navigation, URL hash (`#approach=b&step=4`) |
| `tests/run.mjs` | Unit tests |

No build step. KaTeX loads from cdnjs. Without it, equations fall back to readable HTML.

## Tests

```
node vectors/tests/run.mjs
```

They check the vector arithmetic, the diagram's consistency (M is the midpoint of BC, M, N and E are collinear, the parallel sides, AD = CF), the answer k = 5, and that no step before the last one gives the answer away.

## The maths

With D as origin: DB = 4a − b, DM = 3a − ½b, DE = b − a, so ME = −4a + 3⁄2 b. The b-part of DM + t·ME is zero at t = ⅓, giving DN = 5⁄3 a and NC = 1⁄3 a, so **k = 5**. (The original plan said k = 1 in places. Its own §4 working, and this check, give k = 5.)
