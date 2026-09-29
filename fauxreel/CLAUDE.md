# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Faux Reel** ("for real", but faux). Paste a chat transcript, or pick one of ~500 funny ready-made chats, and it plays back as a fake phone screen recording of a chat app. It supports WhatsApp, Telegram, Messenger, iMessage, Instagram and Signal, on an iPhone or Android screen, in light or dark mode. The result exports as a GIF, MP4 or WebM to share. It started as a "vibe" in the `jvossers/vibecoding` repo (first as `chatreel/`, then `fauxreel/`) and is being moved into its own repo.

- **Audience:** people making funny chat videos for WhatsApp groups, TikTok, Reels and Shorts. Mobile-first: most people will use it on a phone.
- **Tech:** static site, vanilla HTML/CSS/JS, **no build step, no framework, no backend (yet)**. Everything runs in the browser, including video and GIF encoding.
- **Longer background** lives in [`docs/`](docs/): product strategy, competitors, naming and past design options. Read `docs/strategy.md` before making product decisions.

## Where it lives / status

- **Current:** GitHub Pages at `labs.vossers.com/fauxreel/`. The old `labs.vossers.com/chatreel/` redirects there, keeping `?query` and `#chat=` links.
- **Planned:** its own GitHub repo, deployed on **Azure Static Web Apps** with a custom domain (probably `fauxreel.app`, still to be registered). Static first, with an Azure Functions `/api` later. See "Deploy" below.

## Repo layout

Today (inside `vibecoding/fauxreel/`):
```
index.html          the whole app: markup, CSS, JS
library.js          ~500 sample chats, loaded on demand
docs/               strategy, competitors, naming, design options (HTML)
tests/smoke.mjs     Playwright smoke test (see Testing)
CLAUDE.md
```
Planned for the standalone repo: `web/` (index.html and library.js), `api/` (Azure Functions, later), `docs/`, `tests/`, and `CLAUDE.md` at the root. The app only uses relative paths (`library.js`, `./`), so it runs unchanged from any folder.

## Running locally

Any static file server works. Opening `index.html` as a file also mostly works, except that `library.js` and the video muxers need http.
```bash
npx serve .            # or: python3 -m http.server 8765
```

## Testing

There's no unit-test framework. `tests/smoke.mjs` is an end-to-end smoke test in headless Chromium. It:
- serves the app itself;
- loads it and fails on any page error;
- renders a frame for every app × phone × theme;
- checks that every library chat is valid;
- checks that a `#chat=N` link opens the right chat;
- exports a real GIF and checks the file.

Screenshots go to `tests/out/`, which is gitignored.
```bash
cd tests && npm install && npm test
# Claude Code on the web: Chromium is preinstalled; the script uses PLAYWRIGHT_CHROMIUM if set
```
Always check UI changes **at phone width (390px)**, and look at the screenshots rather than only checking that nothing crashed. In the Claude Code cloud sandbox, Google Fonts and jsdelivr are blocked. Screenshots therefore use fallback fonts, and MP4/WebM exports fall back to the real-time recorder. Neither is a bug.

## Working agreements

- Keep it **no-build**: one `index.html` plus `library.js`. Don't add a framework or bundler without asking.
- Match the existing code style: plain functions, small helpers, terse comments only where something isn't obvious.
- After every change, verify with the smoke test and screenshots, then commit with a clear message. In past sessions the owner asked to "merge to main and push after every code change". Confirm at the start of a new session whether that still applies.
- User-facing text: plain, friendly English, in keeping with the playful tone.

## Architecture (index.html)

The phone screen is drawn entirely on a `<canvas>` (not DOM), so the same code renders the live preview and every exported frame.

- **Parsing** (`parseTranscript`): `Name: message` lines, continuation lines, `(pause N)` directives, `#` comments, and both WhatsApp export formats (`[d/m/y, h:mm:ss] Name: msg` and `d/m/y, h:mm - Name: msg`). Timestamped lines without a speaker are system lines and get dropped.
- **Scene** (`buildScene` → `layout` + `timeline`): one immutable object per settings combination. `layout` places every bubble in content coordinates up front. `timeline` gives each message `typingStart` / `inputStart` / `inputEnd` / `appear` / `delivered` / `read` times, plus scroll keyframes. `S.chatEnd` is when the chat finishes; `S.duration` adds the end card.
- **Rendering is a pure function of time**: `drawFrame(ctx, scene, t)`. `visibleState` works out which messages are shown, who is typing and what's in the input box at `t`; `scrollAt` eases between precomputed scroll targets. That lets the preview scrub and lets exports render frames offline, faster than real time.
- **Themes** (`theme(app, dark, ios)`): colours and bubble rules per app. App-specific drawing (headers, input bars, tails, ticks) branches on `S.app` inside `drawHeader`, `drawInputBar`, `bubbleShape`, `drawTicks`, `drawFurniture` (top-of-chat items such as date chips, the encryption notice and profile intros) and `drawScreen` (the "Delivered/Read/Seen" labels).
- **Coordinates**: the logical screen is 390×844 (iPhone) or 412×892 (Android). "Phone on backdrop" framing uses a 540×960 canvas with the phone scaled inside. Callers scale the context for DPR or export size.
- **Icons**: Material-style SVG path strings in `ICONS`, drawn with `Path2D` (`drawIcon`). No app logos, on purpose (see Trademarks).
- **GIF export**: built-in encoder, no library. Median-cut palette sampled from key frames, then each frame is diffed against the previous one. Unchanged pixels become transparent and the frame is cropped to the changed box, and identical frames just extend the previous delay. That keeps a 30-second chat to about 100–300 KB.
- **Video export**: WebCodecs `VideoEncoder` plus `mp4-muxer` / `webm-muxer`, loaded on demand from jsdelivr. Renders offline at 30 fps. If WebCodecs or the codec is unavailable, it falls back to `MediaRecorder` on `canvas.captureStream()`, which records in real time.
- **Sharing**: the export result has Download, plus Share via the Web Share API (`navigator.canShare({files})`) where supported.
- **Persistence**: settings and the transcript are saved in `localStorage` (`chatreel`, `chatreel.text`). The keys keep the app's old name on purpose, so people who used it before the rename keep their settings. **Don't rename them.**

### Adding a new chat app (checklist)
Instagram was added this way; follow its code paths.
1. Add an entry to `APPS` (name and picker dot colour).
2. Add a `case` to `theme()` with the colours, bubble radius, tail style, `typing: 'bubble' | 'header'`, `timeInside`, `nameInside`, `avatarAt` and `avatarAlways`.
3. Add or adjust app branches in `layout` (furniture, avatar size), `S.inputH` / `S.headerH`, `headerSubtitle`, `drawHeader`, `drawInputBar`, and read receipts in `drawTicks` or the label in `drawScreen` / `scrollTarget`.
4. Give it a letter in `LIB_APPS` so library chats can default to it.
5. Render light/dark × iPhone/Android, one-on-one and group, while typing, with a message half-typed, and with the receipt showing.

## UI design ("Bubblegum")

Chosen from 8 directions in `docs/redesign-options.html` (option C).
- Light, candy palette defined as CSS variables on `:root` (`--bg`, `--pink`, `--mint`, `--butter`, `--blush` …). Fonts: Bagel Fat One (logo + export button) and Rubik (UI). The app UI is light-only; the rendered chat has its own light/dark setting.
- Controls borrow chat-bubble shapes: one tail corner (`--bubble`), and the selected tab / "whose phone" chip flips to a "sent" bubble (`--bubble-sent`) in dark ink.
- Buttons feel like toy keys: a solid bottom shadow that disappears when pressed (`:active` moves the button down).
- Selected choices turn mint. Speed choices are tilted emoji "stickers" and turn butter-yellow when picked.
- The preview progress bar has one segment per message (`renderSegs` / `updateSegs`). Each segment's width matches that message's share of the timeline, so the invisible range input on top still scrubs linearly. Segments that end in one of my messages are green, others pink.
- The logo (top left) links to `./`, the app's home page.

## Chat library

- `library.js` holds ~500 funny sample chats as `window.CHAT_LIBRARY` entries `{t, g, a, me, x}` (title, comma-separated tags, app letter, whose phone, transcript). It's only loaded (script tag) the first time the library sheet or 🎲 is used, so first page load stays light.
- App letters: `w` WhatsApp, `t` Telegram, `m` Messenger, `i` iMessage, `g` Instagram, `s` Signal.
- Tags are fixed in `LIB_TAGS` in `index.html` (history, celebs, news, traditions, culture, family, friends, dating, work, school, tech, food, sport, travel, pets, fantasy). A new tag needs an entry there to get a label.
- The sheet has search (title + transcript, all words must match), one tag filter at a time, and infinite scroll in pages of 40 (IntersectionObserver). 🎲 picks at random from the current filter.
- A chat's id is its index in the array. `#chat=N` in the URL opens that chat, so **only append new chats at the end** or old share links will point at the wrong chat. Changing a chat's `a` (default app) is safe.
- When adding chats, every line must be `Name: message` (or `(pause N)`), `me` must be one of the speakers, and there should be at least two speakers. The smoke test enforces this.
- Tone: funny and affectionate. Stereotypes stay gentle. Real living people appear only kindly or through their fans, never mocked.

## Branding in exports

- Every render (preview and export) has a tiny, low-contrast "fauxreel" wordmark (`drawWatermark`). On the screen it sits in the home-indicator strip at the bottom-left. With the phone on a backdrop, it sits on the backdrop under the phone. It never covers messages.
- After the chat ends (`S.chatEnd`), a 2.6 s end card (`END_MS`, `drawEndCard`) fades in: two bubbles ("wait… is this real? 👀" / "faux real 😏"), the wordmark and a pill with `BRAND_URL`.
- `BRAND_URL` is currently `labs.vossers.com/fauxreel`. **Change it to the real domain once that's live.**
- There's deliberately no switch to turn either off. Removing them is a planned Pro feature, and taking away a free option later would upset users.

## Deploy (planned: Azure Static Web Apps)

- Why Static Web Apps rather than a Storage account static website: free managed HTTPS on custom domains (`.app` domains *require* HTTPS; Storage needs Front Door for that), deploys from GitHub Actions, per-PR preview environments, and a built-in `/api` (Azure Functions) on the same domain for later.
- Settings: app location `web/`, API location `api/` (once it exists), no build command.
- Once live, set `BRAND_URL`, then turn `vibecoding/fauxreel/` and `/chatreel/` into redirects to the new domain, keeping `#chat=` links.

## Product decisions so far

- **Name:** Faux Reel. "Faux" (fake) sounds like "fo", so it reads as "for real" and as "fake reel". Domain idea: `fauxreel.app`. See `docs/naming.md`.
- **Launch model:** free, no login, no ads. Grow through shared videos (watermark and end card), search-friendly landing pages, and posting library chats on TikTok and Reels. Try paid ads only on a small test budget, and check the platforms' rules on trademarks and "fake" tools first.
- **Money later:** a Pro tier, not ads. Candidates: no watermark or end card, AI-written chats, AI voice narration, background video, profile photos and images, more apps, 1080p and longer chats. Unlock with a licence key (Lemon Squeezy, Paddle or Stripe) stored locally, so there's still no login. See `docs/strategy.md`.
- **Trademarks:** mimic the look of chat apps for parody, but never use their logos, and never put their names in the product name or domain.
- **Misuse:** fake-chat tools can be abused. Keep the watermark, and add a short terms page and an "entertainment / parody" note before launch.
