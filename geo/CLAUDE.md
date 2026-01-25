# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Geography Blackjack - a browser game where players try to fill a target country with other countries' land areas without exceeding 100%. Countries are auto-accepted when the timer expires; players can only choose to "stand" to lock in their score.

## Development

No build system or dependencies. Open HTML files directly in a browser to run.

## Files

### index.html (Multiplayer)
The main multiplayer version simulating 10-100 concurrent players:
- Random target country from 10 Greenland-sized countries (±25% of 2,166,086 km²)
- Only offers countries smaller than the selected target
- 3-second auto-hit timer per round (no manual hit button)
- "Adding" label clarifies which country is being offered
- Visual grid showing all players' status with colored dots (playing/stood/busted)
- "Competing against X online players in realtime" message above grid
- Progress bar showing fill percentage
- Spectator mode when standing: watch remaining players, shows "would be" score
- Simulated bot opponents with varying risk tolerances (some will bust)
- Stand button fixed to bottom of screen on mobile
- Game results leaderboard: ranks, medals (🥇🥈🥉), grouped by score, winning country flags

### MULTIPLAYER_PLAN.md
Implementation plan for converting to real multiplayer with Node.js/Express/Socket.io backend, targeting Azure App Service (Linux) deployment.

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
- `startGame()`: Initializes/resets game state with random player count
- `stand()`: Locks in score, enters spectator mode
- `processRound()`: Handles bot decisions and auto-hit for player
- `enterSpectatorMode()`: Shows spectator UI when player stands
- `endGame()`: Generates grouped leaderboard with rankings and medals

External dependency: Flag images from `flagcdn.com`
