# CLAUDE.md

Guidance for AI agents (Claude Code and others) working anywhere in this repository.

## Repository layout

Each top-level folder is a separate, self-contained project (usually a single `index.html`, no build step). The repo is served by GitHub Pages at https://labs.vossers.com/, so `foo/index.html` is live at `https://labs.vossers.com/foo/`. Many folders have their own `CLAUDE.md` with project-specific guidance.

## Landing page (`index.html` at the root)

The root `index.html` lists the projects. It is **generated**, so never edit it by hand.

- Generator: `_landing/build.mjs` (Node, no dependencies). Run `node _landing/build.mjs` from the repo root.
- Config: `_landing/projects.json`. It holds each project's title, one-line description and group, the group order, and the `hidden` list.
- The `.github/workflows/landing-page.yml` workflow re-runs the generator on every push to `main` and commits the result. Still run it yourself and commit the updated `index.html` with your change, so the page is right as soon as you merge.
- `_landing/` is not published: Jekyll on GitHub Pages skips folders whose names start with `_`. Keep it that way, and never add a `.nojekyll` file, because that would publish the hidden list.

### Projects are listed by default

Every top-level folder with an `index.html` appears on the landing page unless its name starts with `.` or `_`, or it is in `hidden`. **A new project is listed unless the user explicitly says it should be hidden.** Never hide a project on your own initiative.

When you create a new project folder:

1. Add an entry under `projects` in `_landing/projects.json`: `title` (short name), `description` (one plain sentence, under about 100 characters) and `group` (one of the names in `groups`). Without an entry the project still appears, using its `<title>` and meta description, in an "Other" group at the bottom.
2. Run `node _landing/build.mjs` and commit `index.html` along with the project.

### Hidden (unlisted) projects

Some projects are only for people who are sent the link. If the user says a project should be hidden, unlisted, private or not discoverable:

1. Add the folder name to `hidden` in `_landing/projects.json`, and remove its entry from `projects` if there is one.
2. Add `<meta name="robots" content="noindex">` to the project's `<head>` so search engines don't index it.
3. Don't link to it from the landing page, from other projects, or from any README.
4. Don't list it in a `robots.txt` or sitemap. Those files are public and would advertise it.
5. Run `node _landing/build.mjs` and commit.

To un-hide a project, do the reverse: remove it from `hidden`, add a `projects` entry, remove the `noindex` meta, and rebuild.

Tell the user about this limit when it's relevant: the GitHub repository is public, so anyone browsing it can still see hidden folders. Hiding keeps a project off the landing page and out of search results. It does not make the project private.
