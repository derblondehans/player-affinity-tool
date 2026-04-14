# player-affinity-tool for Planets.nu

A tool to idetify for a certain game, which players have been playing together in former games.
Thx to Tim Wissemann, who had the idea for this game.
Thx to Joshua, who made it a browser game.
Thx to Whisperer, who wrote the initial version of this tool.
Thx to all supporters of VGA Planets!

## Update

### Version 1.1
- Fixed bug with dead players and replacement players
- Added number of turns players played during a game together

---

## Tools


### 2. `planets_matrix.html` – Collaboration Matrix
A public tool (no login required) that analyzes which players in a game have played together before.

**Features:**
- Enter any Game ID to start the analysis
- Fetches all players of that game via the public API
- Loads the full game history of each player
- Renders a color-coded N×N collaboration matrix
- Detail view lists all shared games per player pair (with game ID)

---

## Requirements

- [Node.js](https://nodejs.org) (for the local proxy)
- A modern browser (Chrome, Firefox, Edge)

---

## Setup

### 1. Start the proxy

The Planets.nu API does not support CORS, so a local proxy is required. It runs on `localhost:8765` and forwards requests to `api.planets.nu` via HTTPS.

```bash
node proxy.js
```

You should see:

```
  ✦ VGA Planets CORS-Proxy v1.6.0 läuft
  → http://localhost:8765
```

Keep this terminal window open while using the tools.

### 2. Open the tool

Open  `planets_matrix.html` directly in your browser (double-click or `File → Open`).

> **Note for Bitdefender / antivirus users:** The proxy runs entirely on your local machine. No data is sent to any external proxy service. If your antivirus blocks `localhost:8765`, add it as an exception.

---

## How it works

```
Browser → localhost:8765 (proxy.js) → https://api.planets.nu
```

The proxy:
- Accepts requests from the browser on `http://localhost:8765`
- Forwards them to `https://api.planets.nu` (tries HTTPS first, falls back to HTTP)
- Handles GZIP decompression
- Adds CORS headers so the browser accepts the response

---

## API Endpoints Used

| Endpoint | Auth required | Description |
|---|---|---|
| `/games/list` | No | Lists games for a given username |
| `/game/loadinfo` | No | Public game info and player list |

All endpoints are part of the official [Planets.nu API](https://help.planets.nu/API).

---

## Collaboration Matrix – How the analysis works

1. `/game/loadinfo?gameid=X` returns all players in a game (public endpoint)
2. For each player, `/games/list?username=Y&status=2,3` returns their game history
3. The tool computes pairwise intersections to find shared games
4. Results are shown as a color-coded matrix and a detailed pair list

---

## Licenses

### This project
Developed with [Claude](https://claude.ai) (Anthropic). Free to use and modify.

### React 18
MIT License – Copyright (c) Meta Platforms, Inc. and affiliates.
https://github.com/facebook/react/blob/main/LICENSE

### Babel Standalone
MIT License – Copyright (c) 2014-present Sebastian McKenzie and other contributors.
https://github.com/babel/babel/blob/main/LICENSE

### Node.js
MIT License – Copyright Node.js contributors.
https://github.com/nodejs/node/blob/main/LICENSE

### Planets.nu API
Usage in accordance with the official API documentation.
Please respect the [Planets.nu Terms of Service](https://planets.nu/terms).

---

## Screenshots

> *Add screenshots here after first deployment.*

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.
