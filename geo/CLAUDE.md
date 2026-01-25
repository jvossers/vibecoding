# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Geography Blackjack - a browser game where players try to fill a target country with other countries' land areas without exceeding 100%. Similar to blackjack, players can "hit" to accept a randomly offered country or "stand" to stop.

## Development

No build system or dependencies. Open HTML files directly in a browser to run.

## Files

### index.html (Multiplayer)
The main multiplayer version simulating 100 concurrent players:
- Random target country from 10 Greenland-sized countries (±25% of 2,166,086 km²)
- Only offers countries smaller than the selected target
- 3-second timer per round
- Visual avatar grid showing all players' status (playing/stood/busted)
- Progress bar showing fill percentage
- Spectator mode when standing: watch remaining players, shows "would be" score
- Simulated bot opponents with varying risk tolerances (some will bust)
- Round ends when all players have acted or timer expires
- Game results leaderboard: ranks, medals (🥇🥈🥉), grouped by score, winning country flags

### original.html (Single Player)
The original single-player version (backup):
- Fixed target: Greenland (2,166,086 km²)
- 5-second auto-hit timer per turn
- Dodge bonus celebration when standing before a bust country
- Mobile-responsive layout

## Architecture

Both files are standalone HTML with:
- Inline CSS styles in `<style>` block
- Inline JavaScript game logic in `<script>` block

Key data:
- `countries` array: Static data with name, area (km²), and ISO code
- `targetCountries` (index.html): 10 countries similar in size to Greenland (±25%)

Core functions:
- `startGame()`: Initializes/resets game state
- `hit()`: Accepts current country, checks for bust
- `stand()`: Locks in score, enters spectator mode
- `processRound()`: Handles bot decisions and auto-hit
- `enterSpectatorMode()`: Shows spectator UI when player stands
- `endGame()`: Generates grouped leaderboard with rankings and medals

External dependency: Flag images from `flagcdn.com`
