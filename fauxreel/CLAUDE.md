# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Faux Reel ("for real", but faux) — paste a chat transcript and get it replayed as a fake phone screen recording (WhatsApp, Telegram, Messenger, iMessage, Instagram or Signal, on an iPhone or Android frame), exported as GIF, MP4 or WebM. Single-file vanilla HTML/CSS/JS, no build tools. Mobile-first.

## Running Locally

Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
```

Deployed via GitHub Pages at labs.vossers.com/fauxreel/ (the old `/chatreel/` path redirects here, keeping `#chat=` links)

## Architecture

Everything lives in `index.html`. The phone screen is drawn entirely on a `<canvas>` (not DOM) so the same code renders the live preview and every exported frame.

- **Parsing** (`parseTranscript`): `Name: message` lines, continuation lines, `(pause N)` directives, `#` comments, and both WhatsApp export formats (`[d/m/y, h:mm:ss] Name: msg` and `d/m/y, h:mm - Name: msg`). Timestamped lines without a speaker are system lines and get dropped.
- **Scene** (`buildScene` → `layout` + `timeline`): one immutable object per settings combination. `layout` places every bubble in content coordinates up front. `timeline` gives each message `typingStart` / `inputStart` / `inputEnd` / `appear` / `delivered` / `read` times, plus scroll keyframes.
- **Rendering is a pure function of time**: `drawFrame(ctx, scene, t)`. `visibleState` works out which messages are shown, who is typing and what's in the input box at `t`; `scrollAt` eases between precomputed scroll targets. That lets the preview scrub and lets exports render frames offline, faster than real time.
- **Themes** (`theme(app, dark, ios)`): colours and bubble rules per app. App-specific drawing (headers, input bars, tails, ticks) branches on `S.app` inside `drawHeader`, `drawInputBar`, `bubbleShape`, `drawTicks`.
- **Coordinates**: the logical screen is 390×844 (iPhone) or 412×892 (Android). "Phone on backdrop" framing uses a 540×960 canvas with the phone scaled inside. Callers scale the context for DPR or export size.
- **GIF export**: built-in encoder, no library. Median-cut palette sampled from key frames, then each frame is diffed against the previous one. Unchanged pixels become transparent and the frame is cropped to the changed box, and identical frames just extend the previous delay. That keeps a 30-second chat to about 100–300 KB.
- **Video export**: WebCodecs `VideoEncoder` plus `mp4-muxer` / `webm-muxer`, loaded on demand from jsdelivr. Renders offline at 30 fps. If WebCodecs or the codec is unavailable, it falls back to `MediaRecorder` on `canvas.captureStream()`, which records in real time.
- **Persistence**: settings and the transcript are saved in `localStorage` (`chatreel`, `chatreel.text`). The keys keep the app's old name on purpose, so people who used it before the rename keep their settings.

## UI design ("Bubblegum")

- Light, candy palette defined as CSS variables on `:root` (`--bg`, `--pink`, `--mint`, `--butter`, `--blush` …). Fonts: Bagel Fat One (logo + export button) and Rubik (UI).
- Controls borrow chat-bubble shapes: one tail corner (`--bubble`), and the selected tab / "whose phone" chip flips to a "sent" bubble (`--bubble-sent`) in dark ink.
- Buttons feel like toy keys: a solid bottom shadow that disappears when pressed (`:active` moves the button down).
- Selected choices turn mint. Speed choices are tilted emoji "stickers" and turn butter-yellow when picked.
- The preview progress bar has one segment per message (`renderSegs` / `updateSegs`). Each segment's width matches that message's share of the timeline, so the invisible range input on top still scrubs linearly. Segments that end in one of my messages are green, others pink.

## Chat library

- `library.js` holds ~500 funny sample chats as `window.CHAT_LIBRARY` entries `{t, g, a, me, x}` (title, comma-separated tags, app letter, whose phone, transcript). It's only loaded (script tag) the first time the library sheet or 🎲 is used, so first page load stays light.
- Tags are fixed in `LIB_TAGS` in `index.html` (history, celebs, news, traditions, culture, family, friends, dating, work, school, tech, food, sport, travel, pets, fantasy). A new tag needs an entry there to get a label.
- The sheet has search (title + transcript, all words must match), one tag filter at a time, and infinite scroll in pages of 40 (IntersectionObserver).
- A chat's id is its index in the array. `#chat=N` in the URL opens that chat, so **only append new chats at the end** or old share links will point at the wrong chat.
- When adding chats, every line must be `Name: message` (or `(pause N)`), `me` must be one of the speakers, and there should be at least two speakers.

## Branding in exports

- Every render (preview and export) has a tiny, low-contrast "fauxreel" wordmark (`drawWatermark`). On the screen it sits in the home-indicator strip at the bottom-left. With the phone on a backdrop, it sits on the backdrop under the phone. It never covers messages.
- After the chat ends (`S.chatEnd`), a 2.6 s end card (`END_MS`, `drawEndCard`) fades in: two bubbles ("wait… is this real? 👀" / "faux real 😏"), the wordmark and a pill with `BRAND_URL`. `S.duration` includes the end card; drawing clamps the chat itself to `chatEnd`.
- `BRAND_URL` is currently `labs.vossers.com/fauxreel`. Change it to the short domain once that's live.
- There's no switch to turn either off. Removing them is a candidate Pro feature.
