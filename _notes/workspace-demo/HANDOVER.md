# Workspace concept demo: handover notes

The prototype is the single file `workspace-demo/index.html`, live at `https://labs.vossers.com/workspace-demo/`. It is a Teams-style concept demo for a multi-branch estate agency. All HTML, CSS, JavaScript, data and icons are inline. It makes no network requests at runtime; a Content-Security-Policy meta tag blocks them.

This folder (`_notes/`) is not published by GitHub Pages, because Jekyll skips folders whose names start with `_`. It is still visible to anyone browsing the public GitHub repository.

## Important limitations

- **The passphrase screen is not security.** The whole page, including all demo content, is delivered to the browser. Anyone with the file or URL can read the source, or bypass the gate by editing the page. The embedded salt and PBKDF2 verifier also let someone try to guess the passphrase offline. The gate only discourages casual viewing.
- **The page is unlisted, not private.** It is in `hidden` in `_landing/projects.json`, so it is not on the landing page. It has `<meta name="robots" content="noindex,nofollow,noarchive">`. It is not in any sitemap or robots.txt (the site has neither). But the GitHub repository is public, so the folder and file can be found there, and a forwarded link works for anyone. GitHub Pages cannot send an `X-Robots-Tag` header or require a login. Real access control needs hosting-level authentication (for example a reverse proxy or an access gateway), which is a separate hosting change.
- GitHub Pages does not show directory listings, so `/workspace-demo/` serves the page and nothing else.
- Do not add confidential client information or real employee or customer data to this file.

## Passphrase

- The passphrase is **not** stored in the repository. Only a random salt and a PBKDF2-SHA-256 verifier (310,000 iterations) are embedded, between the `/*GATE-START*/` and `/*GATE-END*/` markers.
- Matching ignores case, leading and trailing spaces, and repeated spaces.
- To change it, run this from the repo root, then commit the updated `index.html`:

  ```sh
  DEMO_PASSPHRASE='new passphrase here' node _notes/workspace-demo/make-verifier.mjs
  ```

  Each run uses a new salt. Prefix the command with a space, or clear your shell history afterwards, if you don't want the passphrase in your history.
- After a correct entry, the page sets `mg-teams-demo:v1:unlocked` in `sessionStorage` (the verifier, not the passphrase). It ends with the browser session. "Lock demo" in the profile menu clears it.
- The check uses Web Crypto (`crypto.subtle`), which needs a secure context: HTTPS, localhost, or (in most browsers) a local `file://` page.

## Five-to-seven-minute demo script

1. **About (20 s).** The welcome dialog appears on first open. It says the demo is fictional and not connected to Microsoft Teams. It can be reopened later from the ? button or "About & sources" in the footer.
2. **Company Hub › Announcements (1 min).** Show the pinned welcome post, the HR reply, reactions, and the attached guide (click it to preview). Like the post, then click again to undo.
3. **Branches (1–2 min).** Expand Branch offices. Open Barnet › Branch Operations: show the pinned post, the thread, and the @mention. Reply, and start a new post. Open Crouch End › Sales. Open the ⓘ details pane to show the public office address and directory. North Finchley shows the address-conflict warning.
4. **Training (1 min).** Human Resources › Training & Development › Courses tab. Open a course, play the simulated video, and mark a lesson complete. Point out the note that tracking is a proposed solution and that Clipchamp is not an LMS.
5. **Weekly forms (1–2 min).** Branch Managers › Weekly Reporting › Forms tab. Submit a demo response for Barnet and show the "saved locally — not submitted" confirmation, the summary table, the reminder badges and the "Proposed Power Automate workflow — not running" diagram. Branch Managers › Training Completion shows the fictional completion table.
6. **Close (30 s).** Structure, membership, permissions, licensing and automation would be confirmed in discovery (see the questions in the brief).

Also available: search (press `/`), Activity (fictional notifications that link to posts), Files, Calendar (fictional meetings), Notes tab (local notes per channel), saving posts, and filtering posts.

## Browser storage

- All user changes are stored in `localStorage` under one key, `mg-teams-demo:v1:state`: reactions, posts, replies, edits, deletions, saved items, read state, notes, course progress, form submissions and sidebar state. The seeded content is built into the page and never written to storage.
- Stored data is validated on load. Unreadable or wrong-version data is ignored, and a notice is shown. If storage is unavailable or full, the demo keeps working in memory and says that changes aren't being saved.
- "Reset demo data" (footer or profile menu) asks for confirmation, then removes only that key.
- User text is always rendered as plain text, never as HTML.

## Where the data lives in the file

All in the main `<script>`, in clearly labelled sections:

1. **Public website data:** `OFFICES`, `SERVICE_LOCATIONS`, `PUBLIC_PEOPLE` and `OTHER_SOURCES`. These were transcribed from the brief, which was researched on 16 November 2026. Branch managers appear only where the public page names one. North Finchley's address is flagged as `conflicting`.
2. **Proposed structure:** `GROUPS` and `TEAMS`. Branch Teams are generated from `OFFICES`.
3. **Fictional content:** `PERSONAS`, `FILES`, `SEED_POSTS` (with stable IDs), `SEED_UNREAD`, `ACTIVITY`, `COURSES`, `COMPLETION_BY_BRANCH`, `FORMS`, `WEEKS`, `SEED_SUBMISSIONS` and `MEETINGS`.

To replace sample data, edit those arrays. Keep post and reply IDs stable, because stored reactions and replies refer to them. If you change the shape of stored state, bump the version in `STORAGE_KEY` and in `schemaVersion`. Seeded content is dated around Monday 16 November 2026.

Every fictional post is written by a "Demo …" persona. Real people appear only in directory cards, with their source URLs. Nothing a visitor writes is attributed to anyone but "Demo You".
