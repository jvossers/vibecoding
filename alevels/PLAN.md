# Trio — A level combination picker (working title)

Helps a Year 11 student (and their parents) choose the A levels they'll take in Year 12: score a
combination for university entry and careers, and suggest the best next subject.

Status: **v1 built** at `index.html` (labs.vossers.com/alevels/). `mockups/index.html` is the
reviewed clickable mockup it was built from, kept for reference.

## Core interactions

| Picked | What the page does |
|---|---|
| 0 | Shows the strongest starting combinations; offers a goal ("I'd like to study…") as a second way in |
| 1 | Suggests a pair to finish the set (shown in slots 2–3 as dashed "Suggested" cards with an Add button); rates every other subject with a 4-bar fit meter; score shows "up to" |
| 2 | Auto-suggests the third subject; ranks all options with a plain-language reason and the named university courses each one unlocks |
| 3 | Final score; "Swap one?" shows single changes that would raise it (never ones that hurt the chosen goal) |

Always visible: **Doors this opens** (degree areas open / close / shut) and **University courses**
(meets / close / not yet, with what's missing).

## Scoring model (prototype)

Each degree area and each university course has subject rules:
- `req` — groups of subjects; each group must be met by a *different* chosen subject
  (e.g. Medicine = Chemistry + one of Biology/Physics/Maths)
- `pref` — recommended, not required. Missing one = "close" (counts 0.6), missing a required = 0 (shut)
- Selective courses mark a combination "close" if it has two or more subjects from the
  "less-preferred" list

Measures, each normalised so 100 = the best three-subject combination in the data:
- **University access** — courses whose requirements are met, most selective weighted ×1.3
- **Career prospects** — open degree areas weighted by a graduate-outcomes index (popularity
  deliberately left out: it isn't career value)
- **Keeps options open** — degree areas open, weighted by popularity
- **Goal fit** — when goals are set (average across up to three)

Overall = the priority-weighted mix of the three measures; with goals, 60% mix + 40% goal fit. With fewer than three picks, every score is the best
reachable completion. The verdict label is a rank against all possible combinations
(Excellent = top 10%, Strong = top 30%, Good = top 60%), shown as "better than N%".

### Scoring review (Oct 2026)

The first "Fits together" only looked at degrees naming a subject in a small group and scored the
share of them you qualified for. That ignored 15 subjects entirely (Bio + Chem + Business scored
100) and punished useful ones (Bio + Chem + Maths scored 71). Replaced with the per-subject rule
above; career no longer double-counts popularity; Sociology & Criminology area added.
Then **removed "Fits together" altogether**: it was a judgement call that was hard to explain and
could not be checked against the course table, and goals do the "suits me" steering better. Its
one useful signal is now a sentence in "Things to know": a subject that opens no extra degree or
course alongside the other two is named (e.g. Business with Biology + Chemistry).

## Data needed for the real version

- **University course requirements and typical offers** — UCAS course search and each
  university's course pages; Russell Group "Informed Choices". Store a `checkedOn` date per course
  and show it.
- **Career / earnings by degree subject** — DfE LEO graduate outcomes (earnings 1, 3, 5 years
  after graduation by subject); HESA Graduate Outcomes for employment rates.
- **Subjects actually offered** — let the student hide subjects their school doesn't offer.
- Start with Russell Group + a handful of popular others (~30 universities × top 25 subject areas)
  rather than every course in UCAS.

## Decisions taken for v1 (were open questions)

1. **No grades asked.** Each course shows its typical offer instead; grade-level advice can come later.
2. **Up to three goals** ("I'd like to study…"); goal fit is their average, 40% of overall.
3. **Three A levels only.** A fourth is mentioned in "Things to know", not scored.
4. **England, Wales and NI A levels only.** No Highers or IB.
5. **"My school doesn't offer…"** hides subjects from suggestions (saved locally).
6. **State saved** in localStorage; **shareable link** via `#s=maths,cs&g=cs&p=balanced`.
7. Data is **inline** in `index.html` so it works from `file://` with no build step.

## Next steps

- Verify every course row against the university's page and record a checked date.
- Replace the coarse career index with real LEO figures per subject.
- Optional predicted grades to compare against typical offers.
