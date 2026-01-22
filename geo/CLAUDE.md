# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Geography Blackjack - a single-page browser game where players try to fill a target country (Greenland) with other countries' land areas without exceeding 100%. Similar to blackjack, players can "hit" to accept a randomly offered country or "stand" to stop.

## Development

No build system or dependencies. Open `index.html` directly in a browser to run.

## Architecture

Single HTML file (`index.html`) containing:
- Inline CSS styles in `<style>` block
- Inline JavaScript game logic in `<script>` block

Key game components:
- `countries` array: Static data with name, area (km²), and ISO code for 87 countries
- `targetCountry`: Greenland (2,166,086 km²)
- Game state variables: `availableCountries`, `acceptedCountries`, `totalArea`, `turn`, `gameEnded`
- 5-second auto-hit timer per turn
- Highscore system: Stores best score with player name in sessionStorage (key: `geoblackjack_highscore`)

Core functions:
- `startGame()`: Initializes/resets game state
- `hit()`: Accepts current country, checks for bust
- `stand()`: Ends game with current score
- `offerNewCountry()`: Draws next random country from shuffled deck
- `showNameModal()` / `submitHighscoreName()`: Prompt for player name on new highscore
- `resetHighscore()`: Clears stored highscore

External dependency: Flag images from `flagcdn.com`
