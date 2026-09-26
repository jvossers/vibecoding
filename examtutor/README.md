# Full Marks: GCSE exam technique trainer

Students see an exam-style question with several candidate answers. **Every answer is creditworthy, but each earns a different number of marks.** The student ranks the answers from most to fewest marks, then sees the marks, the examiner's reasoning for each one, and a technique tip.

The app is all about exam *technique* (command words, levels, showing working, using the source), not about subject content.

## Structure

```
examtutor/
├── index.html            ← the engine (no build step, no dependencies)
└── data/
    ├── subjects.json     ← list of subjects and which file holds each one's questions
    ├── maths.json
    ├── english-language.json
    └── …
```

The engine never needs editing to add content. Edit or add JSON files instead.

Run it through a web server (browsers block `fetch` from `file://`):

```
cd examtutor && python3 -m http.server   # then open http://localhost:8000
```

## Adding a subject

Add an entry to `data/subjects.json` and create the file it points to:

```json
{ "id": "computer-science", "name": "Computer Science", "board": "AQA-style",
  "file": "computer-science.json", "colour": "#44546a" }
```

## Question format

```json
{
  "subject": "Mathematics",
  "questions": [
    {
      "id": "maths-005",                     // unique, stable
      "paper": "Paper 1 (Non-calculator)",   // shown in the paper header
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

- Give each answer **different marks** so there is one correct ranking. Ties are allowed; either order then counts as correct.
- Answers are shuffled and relabelled (Candidate A, B, …) every time, so **don't mention letters** in explanations.
- Every answer should be *relevant and creditworthy*. The lesson is in why good answers score differently.
- In each explanation, name the level or mark-scheme points, and say what the answer would need to score higher.
