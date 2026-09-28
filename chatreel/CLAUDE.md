# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChatReel — paste a chat transcript and get it replayed as a fake phone screen recording (WhatsApp, Telegram, Messenger, iMessage or Signal, on an iPhone or Android frame), exported as GIF, MP4 or WebM. Single-file vanilla HTML/CSS/JS, no build tools. Mobile-first.

## Running Locally

Open `index.html` directly in a browser, or use any static file server:
```bash
npx serve .
```

Deployed via GitHub Pages at labs.vossers.com/chatreel/

## Architecture

Everything lives in `index.html`. The phone screen is drawn entirely on a `<canvas>` (not DOM) so the same code renders the live preview and every exported frame.

- **Parsing** (`parseTranscript`): `Name: message` lines, continuation lines, `(pause N)` directives, `#` comments, and both WhatsApp export formats (`[d/m/y, h:mm:ss] Name: msg` and `d/m/y, h:mm - Name: msg`). Timestamped lines without a speaker are system lines and get dropped.
- **Scene** (`buildScene` → `layout` + `timeline`): one immutable object per settings combination. `layout` places every bubble in content coordinates up front. `timeline` gives each message `typingStart` / `inputStart` / `inputEnd` / `appear` / `delivered` / `read` times, plus scroll keyframes.
- **Rendering is a pure function of time**: `drawFrame(ctx, scene, t)`. `visibleState` works out which messages are shown, who is typing and what's in the input box at `t`; `scrollAt` eases between precomputed scroll targets. That lets the preview scrub and lets exports render frames offline, faster than real time.
- **Themes** (`theme(app, dark, ios)`): colours and bubble rules per app. App-specific drawing (headers, input bars, tails, ticks) branches on `S.app` inside `drawHeader`, `drawInputBar`, `bubbleShape`, `drawTicks`.
- **Coordinates**: the logical screen is 390×844 (iPhone) or 412×892 (Android). "Phone on backdrop" framing uses a 540×960 canvas with the phone scaled inside. Callers scale the context for DPR or export size.
- **GIF export**: built-in encoder, no library. Median-cut palette sampled from key frames, then each frame is diffed against the previous one. Unchanged pixels become transparent and the frame is cropped to the changed box, and identical frames just extend the previous delay. That keeps a 30-second chat to about 100–300 KB.
- **Video export**: WebCodecs `VideoEncoder` plus `mp4-muxer` / `webm-muxer`, loaded on demand from jsdelivr. Renders offline at 30 fps. If WebCodecs or the codec is unavailable, it falls back to `MediaRecorder` on `canvas.captureStream()`, which records in real time.
- **Persistence**: settings and the transcript are saved in `localStorage` (`chatreel`, `chatreel.text`).
