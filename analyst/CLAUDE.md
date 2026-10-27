# CLAUDE.md

**Elicit** is a UX prototype of an AI business analyst. It interviews a business stakeholder in a chat, invites other stakeholders, surfaces conflicts between their answers, gets sign-off, and writes the agreed requirements as Gherkin `.feature` files.

- **Tech:** one `index.html` (HTML, CSS, JS), no dependencies, no build. Live at `labs.vossers.com/analyst/`.
- **No LLM is connected.** The interview is scripted around one example initiative ("Self-service refunds"). Answers are read with simple rules (numbers, money amounts, keywords) that stand in for the model, so typed answers still change the output. The stakeholders' interviews are simulated and compressed into a few seconds.

## How it fits together

- `SCRIPT` is the interview: each node has `ask`, `why`, suggested `chips`, an `openQ` used when the user says "not sure", and `handle(text)`, which returns `{ ops, reply }`.
- `ops` are structured edits to the feature model (`story`, `background`, `upsert`, `remove`, `question`, `comment`, `note`, `status`), applied by `applyOps`. This is the seam where a real model would return tool calls.
- `featureBlocks` renders the model as Gherkin, both highlighted (panel) and plain (`featureText`, used for copy, download and the zip export).
- `runSim` plays the stakeholder phase: contributions, a suggestion to accept or reject, and a conflict over approval rules. `checkReady` then offers sign-off.
- Add `?fast` to the URL to speed up all delays (handy for Playwright tests).
