# Multiplayer Implementation Plan

This document outlines the plan to convert Geography Blackjack from a single-player game with simulated bots to a real-time multiplayer game supporting up to 100 concurrent players.

## Technology Stack

- **Backend**: Node.js (LTS) with Express
- **Real-time Communication**: Socket.io (recommended for Azure compatibility)
- **Frontend**: Existing HTML/CSS/JS (modified to connect to backend)
- **Hosting**: Azure App Service (Linux plan)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Game Server                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Express   │  │  WebSocket  │  │   Game Engine   │  │
│  │   (HTTP)    │  │   Server    │  │  (State/Logic)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                  │
         │                  │ WebSocket connections
         │                  │
    ┌────┴────┐    ┌───────┴───────┐
    │ Static  │    │   Players     │
    │  Files  │    │  (up to 100)  │
    └─────────┘    └───────────────┘
```

## Game Flow

### Current (Client-Side)
1. Client generates bots, target country, and country deck
2. Client runs timer and processes rounds locally
3. Client simulates bot decisions

### New (Server-Side)
1. Server manages game lobby and waits for players
2. Server starts game when conditions are met (min players or timeout)
3. Server controls round timer and broadcasts state
4. Server processes all player actions and determines outcomes
5. Server broadcasts results to all players

## Server Components

### 1. Express Server (`server.js`)

```
/server
  ├── server.js          # Express + WebSocket setup
  ├── game.js            # Game state and logic
  ├── player.js          # Player management
  └── constants.js       # Shared constants
```

**Responsibilities:**
- Serve static files (HTML, CSS, JS)
- Initialize WebSocket server
- Handle HTTP endpoints (health check, stats)

### 2. Game Engine (`game.js`)

**State to manage:**
```javascript
{
  phase: 'waiting' | 'playing' | 'ended',
  targetCountry: { name, area, code },
  currentCountry: { name, area, code },
  availableCountries: [...],
  players: Map<playerId, PlayerState>,
  roundNumber: 0,
  roundStartTime: timestamp,
  roundEndTime: timestamp
}
```

**PlayerState:**
```javascript
{
  id: string,
  totalArea: number,
  status: 'playing' | 'stood' | 'busted',
  countriesAccepted: [...],
  connected: boolean
}
```

**Core functions to move from client:**
- `startGame()` - Initialize game state, select target, shuffle deck
- `processRound()` - Handle timer expiry, auto-hit players who didn't act
- `handlePlayerAction(playerId, action)` - Process stand action
- `endGame()` - Calculate rankings, broadcast results
- `getPublicState()` - Return sanitized state for broadcast

### 3. Player Manager (`player.js`)

**Responsibilities:**
- Track connected players
- Handle join/leave
- Assign player IDs
- Track player positions in grid

## Socket.io Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ }` | Player wants to join game |
| `stand` | `{ }` | Player chooses to stand |

Note: Socket.io handles reconnection automatically via its built-in mechanism.

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `welcome` | `{ playerId, playerIndex }` | Confirm join, assign ID |
| `gameState` | `{ phase, targetCountry, players, ... }` | Full state update |
| `roundStart` | `{ country, roundNumber, endTime }` | New round beginning |
| `roundEnd` | `{ }` | Round finished |
| `playerUpdate` | `{ playerId, status, totalArea }` | Single player changed |
| `gameOver` | `{ rankings, yourRank }` | Game ended |
| `error` | `{ message }` | Error occurred |

### Built-in Socket.io Events
- `connect` - Client connected
- `disconnect` - Client disconnected
- `reconnect` - Client reconnected after temporary disconnect

## Implementation Phases

### Phase 1: Basic Server Setup
- [ ] Initialize Node.js project with Express and Socket.io
- [ ] Set up Socket.io server with Azure-compatible settings
- [ ] Serve static files from /public
- [ ] Basic connection handling (join/leave)

### Phase 2: Game State Management
- [ ] Move `countries` and `targetCountries` data to server
- [ ] Implement game state object
- [ ] Implement `startGame()` on server
- [ ] Implement round timer on server

### Phase 3: Player Actions
- [ ] Handle `stand` action from clients
- [ ] Implement auto-hit on timer expiry
- [ ] Broadcast state changes to all players
- [ ] Handle player disconnection gracefully

### Phase 4: Game Flow
- [ ] Implement lobby/waiting phase
- [ ] Start game when minimum players join (e.g., 2) or timeout
- [ ] Implement `endGame()` with rankings
- [ ] Handle game restart

### Phase 5: Frontend Updates
- [ ] Add WebSocket connection logic
- [ ] Remove bot simulation code
- [ ] Update UI based on server messages
- [ ] Show connection status
- [ ] Handle reconnection

### Phase 6: Azure Deployment
- [ ] Restructure files (move HTML to /public)
- [ ] Create package.json with dependencies
- [ ] Configure server for Azure (PORT env, Socket.io settings)
- [ ] Create Azure App Service (Linux, B1 plan)
- [ ] Enable WebSockets in Azure portal
- [ ] Deploy and test

### Phase 7: Polish
- [ ] Add bot backfill if < 100 players (optional)
- [ ] Add spectator mode for late joiners
- [ ] Optimize state broadcasts (delta updates)
- [ ] Add connection quality indicator

## Frontend Changes

### Remove from Client
- Bot generation (`generateBots()`)
- Round processing (`processRound()`)
- Timer management
- Country deck shuffling
- Game state initialization

### Add to Client
```html
<!-- Add Socket.io client library -->
<script src="/socket.io/socket.io.js"></script>
```

```javascript
// Socket.io connection (auto-connects to same host)
const socket = io({
  transports: ['websocket', 'polling'],
  reconnection: true
});

// Handle server messages
socket.on('gameState', (data) => updateFullState(data));
socket.on('roundStart', (data) => startRound(data));
socket.on('playerUpdate', (data) => updatePlayer(data));
socket.on('gameOver', (data) => showResults(data));
socket.on('welcome', (data) => { playerId = data.playerId; });

// Connection status
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => showReconnecting());

// Send actions
function stand() {
  socket.emit('stand');
}
```

### Keep on Client
- All rendering/UI code
- Progress bar animations
- Grid rendering
- Leaderboard display
- CSS and styling

## Timing Considerations

### Round Timer
- Server is authoritative on time
- Send `roundEndTime` timestamp to clients
- Clients display countdown based on their clock
- Server processes round at exact time regardless of client state

### Latency Handling
- Accept `stand` actions up to 500ms after round end (grace period)
- Show "waiting for server" state during latency
- Optimistic UI updates with server reconciliation

## Scaling Considerations

### For 100 Players
- Single Node.js process can handle 100 WebSocket connections easily
- State broadcasts: ~1KB per update × 100 players = 100KB per round
- At 3-second rounds, bandwidth is minimal

### State Broadcast Optimization
- Only send changed data (delta updates)
- Batch player status updates
- Compress large payloads if needed

## File Structure (Final)

```
/geo
  ├── public/
  │   ├── index.html       # Game client (modified)
  │   └── original.html    # Single-player backup
  ├── server/
  │   ├── game.js          # Game logic
  │   ├── player.js        # Player management
  │   └── constants.js     # Shared data (countries, etc.)
  ├── server.js            # Express + Socket.io entry (root for Azure)
  ├── package.json         # Node.js dependencies
  ├── CLAUDE.md
  └── MULTIPLAYER_PLAN.md
```

## Azure App Service Deployment

### Why Socket.io over raw WebSocket

Socket.io is recommended for Azure App Service because:
- Automatic fallback to long-polling if WebSocket fails
- Built-in reconnection handling
- Better compatibility with Azure's reverse proxy
- Handles connection upgrades gracefully

### Azure Configuration

#### 1. Enable WebSockets in Azure Portal
```
App Service → Configuration → General settings → Web sockets: On
```

#### 2. Required App Settings
```
WEBSITE_NODE_DEFAULT_VERSION = ~18  (or latest LTS)
SCM_DO_BUILD_DURING_DEPLOYMENT = true
```

#### 3. Server Port Configuration
Azure provides the port via environment variable. Server must use:
```javascript
const PORT = process.env.PORT || 3000;
```

### package.json

```json
{
  "name": "geography-blackjack",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
```

### Server Setup for Azure

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.io with Azure-compatible settings
const io = new Server(server, {
  cors: { origin: '*' },
  pingTimeout: 60000,      // Increased for Azure
  pingInterval: 25000,     // Keep connection alive
  transports: ['websocket', 'polling']  // WebSocket preferred, polling fallback
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (useful for Azure)
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Client Connection for Azure

```javascript
// In index.html
const socket = io({
  transports: ['websocket', 'polling'],  // Try WebSocket first
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});
```

### Deployment Options

#### Option A: GitHub Actions (Recommended)
1. Connect Azure App Service to GitHub repo
2. Azure auto-deploys on push to main branch
3. Add workflow file `.github/workflows/azure.yml`

#### Option B: Azure CLI
```bash
# Login
az login

# Create resource group (if needed)
az group create --name geo-blackjack-rg --location westeurope

# Create App Service plan (Linux, B1 tier minimum for WebSockets)
az appservice plan create \
  --name geo-blackjack-plan \
  --resource-group geo-blackjack-rg \
  --is-linux \
  --sku B1

# Create web app
az webapp create \
  --name geo-blackjack \
  --resource-group geo-blackjack-rg \
  --plan geo-blackjack-plan \
  --runtime "NODE:18-lts"

# Enable WebSockets
az webapp config set \
  --name geo-blackjack \
  --resource-group geo-blackjack-rg \
  --web-sockets-enabled true

# Deploy from local
az webapp up --name geo-blackjack
```

#### Option C: VS Code Azure Extension
1. Install Azure App Service extension
2. Right-click on project folder → Deploy to Web App
3. Follow prompts

### Azure-Specific Considerations

#### Idle Timeout
- Azure App Service has a 230-second idle timeout
- Socket.io pingInterval of 25s keeps connection alive
- No additional configuration needed

#### Scaling
- B1 tier: Supports ~100 concurrent WebSocket connections easily
- If more capacity needed, scale up to B2/B3 or use Premium tier
- For multiple instances, would need Redis adapter for Socket.io (out of scope)

#### Logging
```javascript
// Use console.log - Azure captures stdout
console.log('Player connected:', socket.id);

// View logs via Azure CLI
az webapp log tail --name geo-blackjack --resource-group geo-blackjack-rg
```

#### Custom Domain (Optional)
```bash
az webapp config hostname add \
  --webapp-name geo-blackjack \
  --resource-group geo-blackjack-rg \
  --hostname yourdomain.com
```

## Security Considerations

- Validate all client messages
- Rate limit actions (prevent spam)
- Sanitize player display names if added later
- Server is authoritative (clients cannot cheat)

## Testing Strategy

1. **Unit tests**: Game logic (rankings, bust detection)
2. **Integration tests**: WebSocket message flow
3. **Load tests**: 100 concurrent connections
4. **Manual testing**: Play through full game cycles

## Success Criteria

- [ ] 100 players can connect and play simultaneously
- [ ] Game state is synchronized across all clients
- [ ] Round timer is consistent for all players
- [ ] Disconnected players are handled gracefully
- [ ] Game results match expected rankings
- [ ] Latency < 100ms for action acknowledgment
