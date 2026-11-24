# Code Swipe

OCR GCSE Computer Science (J277) Paper 2 revision. Python puzzles, one full-screen card at a time, grouped into themes. The student picks a theme on the home screen, and its questions come in a random order. There's no build step.

- `index.html`: the app. The `THEMES` array near the top sets the theme order, names, icons, blurbs and spec references, and the `<script src="themes/...">` tags load each bank. Progress is saved per theme in localStorage (`codeswipe.v1.<id>`).
- `themes/<id>.js`: one question bank per theme. Each calls `CodeSwipe.add("<id>", [...])`. Every theme should have at least 150 questions.
- `tools/validate.py`: the validator (see below).
- `../strings/` is a redirect to `#strings`, kept for the old String Swipe link. It's in `hidden` in `_landing/projects.json`.

A theme can be opened directly with a hash, for example `codeswipe/#loops`.

## Question format

```js
{t:"Sub-topic", q:"Task text", c:`code with {{0}} gaps`, a:["answer for gap 0"], d:["distractor", "distractor"], o:"exact output", w:"Explanation"}
```

- Gap questions: `c` has `{{0}}`, `{{1}}`... (at most 3), `a` gives the correct chip for each gap in order, and `d` holds 2 to 4 distractors (at most 7 chips in total). `o` is the exact printed output.
- Predict questions: add `p:1`. `c` has no gaps and `a[0]` is the exact single-line output (or an exception name such as `TypeError`).
- `i`: lines the user types, one per input() call. Input prompts aren't included in `o`.
- `f`: files that exist before running, `{name: contents}`. `fo`: the expected file contents afterwards. Both are shown on the card.
- `c` is a JS template literal, so write a Python `"\n"` as `"\\n"` in the source, and avoid `${`. Keep lines under about 34 characters so they fit on a phone (the app shrinks the font if needed).

## Always validate after editing a bank

```
python3 codeswipe/tools/validate.py codeswipe/themes/*.js
```

The validator runs every snippet: it feeds in the `i` input, creates the `f` files in a temporary folder, and times out infinite loops. It checks that the correct chips give `o` and `fo`, that no other arrangement of chips gives the same result, and that results don't depend on random numbers. The last line must say `0 problems`. LONG LINE warnings are advisory.
