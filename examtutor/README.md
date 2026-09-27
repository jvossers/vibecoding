# Full Marks: GCSE exam technique trainer

Students see an exam-style question with several candidate answers. **Every answer is creditworthy, but each earns a different number of marks.** The student picks the answer that earns **the most marks** and the one that earns **the fewest**, then sees the marks, the examiner's reasoning for each one, and a technique tip.

The app is all about exam *technique* (command words, levels, showing working, using the source), not about subject content.

## Structure

```
examtutor/
├── index.html            ← the engine (no build step, no dependencies)
└── data/
    ├── boards.json       ← exam boards (AQA, Pearson Edexcel, OCR)
    ├── subjects.json     ← subjects, their spec codes per board, and their question files
    ├── maths.json
    ├── english-language.json
    └── …
```

The engine never needs editing to add content. Edit or add JSON files instead.

Run it through a web server (browsers block `fetch` from `file://`):

```
cd examtutor && python3 -m http.server   # then open http://localhost:8000
```

## Exam boards

Students pick their exam board **per subject**, because schools often mix boards, e.g. AQA English with Edexcel Maths. The choice is remembered in the browser. A mixed paper uses each subject's chosen board.

Each question has a `boards` list saying which boards it suits:

- **Technique that is the same on every board** (show your working, convert units, 'describe' versus 'explain') lists every board, e.g. `["AQA", "Edexcel", "OCR"]`. It shows an *All boards* tag.
- **Board-specific formats** (question numbering, mark totals, level descriptors, set texts, History topics) list only that board, e.g. `["AQA"]`. It shows an *AQA format* tag.
- If a question differs between boards, write a separate question for each board rather than one question with exceptions.
- If `boards` is left out, the question counts for every board its subject lists.

To add a board, add it to `data/boards.json` and add its spec code to each subject's `specs`.

## Adding a subject

Add an entry to `data/subjects.json` and create the file it points to. The keys of `specs` are the boards this subject is offered for:

```json
{ "id": "computer-science", "name": "Computer Science", "file": "computer-science.json",
  "colour": "#44546a", "specs": { "AQA": "8525", "OCR": "J277" } }
```

## Question format

```json
{
  "subject": "Mathematics",
  "questions": [
    {
      "id": "maths-005",                     // unique, stable
      "boards": ["AQA", "Edexcel", "OCR"],   // boards this question suits
      "paper": "Non-calculator paper",       // shown in the paper header; keep it board-neutral for all-board questions
      "number": "5",                         // printed question number (optional)
      "topic": "Estimation",
      "skill": "Round to 1 s.f. and show it", // the exam technique being tested
      "marks": 3,                            // total marks available
      "stimulus": {                          // optional source/figure box
        "label": "Source A",
        "caption": "Italic intro or figure description",
        "text": "Extract text. Line breaks (\n) are kept, so poetry works.",
        "table": { "headers": ["Year", "Value"], "rows": [["1990", "4.8"]] }
      },
      "prompt": "The question itself. \\n\\n makes a new paragraph.",
      "promptLead": "You could include:",   // optional line before bullets
      "bullets": ["point one", "point two"], // optional
      "answers": [                           // 3–5 recommended
        { "text": "Candidate's answer…", "marks": 3, "explanation": "Why it earns 3." },
        { "text": "…",                    "marks": 2, "explanation": "…" }
      ],
      "tip": "Examiner's tip shown after marking."
    }
  ]
}
```

Guidelines for writing questions:

- Give the best and the weakest answer **unique marks** so there is one right pick for each. Ties are allowed; any tied answer then counts as correct.
- Answers are shuffled and relabelled (Candidate A, B, …) every time, so **don't mention letters** in explanations.
- Every answer should be *relevant and creditworthy*. The lesson is in why good answers score differently.
- In each explanation, name the level or mark-scheme points, and say what the answer would need to score higher.
