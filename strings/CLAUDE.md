# String Swipe

OCR GCSE Computer Science (J277) Paper 2 revision: Python string manipulation puzzles, one full-screen card at a time. Single `index.html`, no build step.

## Question bank

The questions live in `index.html` between the `/*Q-START*/` and `/*Q-END*/` markers, as a `QUESTIONS` array. Each item:

- `t` topic, `q` task text, `c` Python code, `w` explanation shown after answering.
- Fill-the-gaps (default): `c` contains blanks `{{0}}`, `{{1}}`... `a` is the correct chip for each blank, in order. `d` are distractor chips. `o` is the exact output when the correct chips are used.
- Predict-the-output (`p:1`): `c` has no blanks. `a[0]` is the exact output and `d` are wrong outputs. If the code raises an error, the output is the exception name (for example `TypeError`).

Avoid backslashes in code (they sit inside JS template literals) and keep code lines under about 36 characters so they fit on a phone.

## Always validate after editing questions

`tools/validate.py` runs every snippet in Python. It checks that the correct chips produce `o`, and that no other arrangement of chips produces the same output (so every puzzle has exactly one answer). From the repo root:

```
node -e 'const s=require("fs").readFileSync("strings/index.html","utf8");const m=s.split("/*Q-START*/")[1].split("/*Q-END*/")[0];require("fs").writeFileSync("/tmp/q.json",JSON.stringify(new Function(m+";return QUESTIONS;")()))'
python3 strings/tools/validate.py /tmp/q.json
```

It must end with `0 problems`. `LONG` lines are warnings only.
