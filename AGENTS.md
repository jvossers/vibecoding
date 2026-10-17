# AGENTS.md

This repo holds lots of small, independent web projects ("vibes"). Each top-level folder is its own standalone project. Every project is served as a static site by GitHub Pages at `https://<your-domain>/<folder>/`.

> **Setting up a repo like this?** Make a GitHub repo and add a `CNAME` file at the root with your domain (e.g. `labs.example.com`). Turn on GitHub Pages under Settings → Pages, deploying from the `main` branch, `/ (root)`. Point a DNS `CNAME` record for that domain at `<username>.github.io`. Then drop this file in the root. Delete this note once you're done.

## Repo layout

```
/
├── AGENTS.md          this file: rules for every project
├── CNAME              custom domain for GitHub Pages
├── .gitignore
├── bird/              one project per folder
│   ├── index.html
│   └── AGENTS.md      optional: notes for this project only
├── piano/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── …
```

- **The root holds only project folders** and a few repo-wide files (`AGENTS.md`, `CNAME`, `.gitignore`). Don't put app code at the root.
- **One folder = one project = one URL.** The folder name is the URL path, so keep it short, lowercase, with no spaces (`bird`, `foodgame`, `rivercrossing`).
- **Projects are fully self-contained.** A project never imports from another folder, and nothing is shared between them. Use relative paths only (`./style.css`, `library.js`). That way any project can later move to its own repo and run unchanged.
- **Never rename a folder after its URL has been shared.** It would break people's links and home-screen shortcuts. If a rename can't be avoided, leave a redirect in the old folder: an `index.html` with `<meta http-equiv="refresh">` plus `location.replace('../newname/' + location.search + location.hash)`, so query strings and `#hash` links still work. The brand name can change even when the folder name can't.
- When you work on one project, change only that folder.

## Default stack for a new project

Every new project starts as **one `index.html`** with all its HTML, CSS (`<style>`) and JS (`<script>`) inline.

- **Vanilla HTML/CSS/JS.** No framework, no bundler, no build step, no `package.json`, no backend. Don't add any of these without asking first.
- **It must run by opening the file**, or with any static server:
  ```bash
  npx serve .            # or: python3 -m http.server 8000
  ```
- **Split files only once the project is big enough to need it.** Go to `index.html` + `style.css` + `app.js` (or one shared CSS/JS file for a multi-page site). It's still no build. Large data can go in its own `.js` file, loaded on demand.
- **Persistence is `localStorage`.** Give keys a namespace for the project (`myapp.v1`) and keep all state in one JSON blob with a `version` field. Wrap every read and write in `try/catch`, so private mode falls back to in-memory instead of showing a blank screen. **Never rename a storage key once it has shipped**, or users lose their data. Migrate the old key and then delete it.
- **External resources sparingly:** Google Fonts, a CDN library loaded on demand, a flag/image CDN. The app should still work, perhaps uglier, if they fail to load.
- Dates that users see or store use the **local** date (`YYYY-MM-DD` from local time), not UTC.

## Mobile first

Most people open these on a phone.

- Design for and check at **390px wide** first, then desktop. There should be no horizontal page scroll.
- Use `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- For games and tap-heavy UIs, use `pointerdown` instead of `click`. Add `touch-action: manipulation`, `user-select: none` and `-webkit-tap-highlight-color: transparent` to stop tap delays and highlights.
- Size canvas games to the window and scale everything from one reference size. Use a fixed-timestep loop so speed doesn't depend on frame rate.
- Respect `prefers-reduced-motion`.

## Design

- Pick a clear, distinctive look for each project (fonts, palette, texture, motion). Avoid the generic "AI default" style.
- Define colours as CSS custom properties on `:root` (`--bg`, `--ink`, `--accent` …) and use them everywhere.
- If there's a theme switch, JS resolves System to `dark`/`light` and sets `data-theme` on `<html>` from a tiny inline `<head>` script before first paint, so the page never flashes the wrong theme.
- Code style: plain functions, small helpers, camelCase, `UPPER_CASE` constants, DOM refs ending in `El` (`scoreEl`). Comment only what isn't obvious.

## Per-project docs

When a project grows beyond a toy, give it its own `AGENTS.md` inside its folder. It applies on top of this file. Keep it current as the code changes. A good one covers:

1. **Overview**: what it is, who it's for, its live URL.
2. **Running locally**: usually just `npx serve .`.
3. **Architecture**: which file does what, key functions, data shapes, storage keys.
4. **Conventions and gotchas**: things that must not change (storage keys, folder name, ID order of shareable items) and *why*.
5. **Design system**: fonts, palette variables, motion.
6. **Decisions**: what was tried and dropped, and why, so it doesn't get rebuilt.

Other optional files in a project folder: `PLAN.md` (the design brief it was built from), `README.md`, `docs/`, and `tests/` (e.g. a Playwright smoke test with its own `package.json`, kept inside `tests/` so the app itself stays build-free).

## Checking your work

- Open the page and actually look at it, at phone width and desktop width. Check there are no console errors.
- For bigger projects, a headless-browser smoke test should load the page, fail on any page error, and take screenshots. Look at the screenshots, not just the exit code.

## Git

- Commit messages start with the project folder: `bird: fix pipe gap on small screens`.
- Keep each commit to one project.
- Pushing to `main` deploys, so only push what works.
