# UNO RISHIKA – Modern Real-Time Multiplayer UNO Card Game

A complete, modern, responsive, real-time multiplayer UNO card web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express.js**, and **Socket.IO**.

---

## 🌟 Architecture & Features

### 1. Full-Stack Multiplayer Architecture
- **Backend (`/backend`)**:
  - **Node.js** & **Express.js** HTTP server with health check endpoints.
  - **Socket.IO** server for ultra-low-latency real-time multiplayer communication.
  - **Room Manager**: Single source of truth for room codes, host privileges, capacity (2–4 players), and connected player lists.
  - **Confidential Hand Security**: Opponents only receive card counts (`cardsCount`), keeping private hands 100% confidential.
  - **CORS Configured**: Pre-configured for Vite frontend ports (`http://localhost:3000`, `http://localhost:5173`).

- **Frontend (`/src`)**:
  - **React 18** + **Vite** + **Tailwind CSS**.
  - **Socket.IO Client**: Directly communicates with backend events (`create_room`, `join_room`, `leave_room`, `start_game`, etc.).
  - **Web Audio API**: Real-time synthesized sound effects without external audio asset lag.
  - **Offline/Local Resilience**: Automatically falls back to cross-tab communication if server is restarting.

### 2. Room System & Real-Time Events
- **`create_room`**: Host specifies name, avatar, and capacity (2–4 players); server generates unique 6-character room code.
- **`join_room`**: Validates 6-character code, room existence, game state, and capacity limit.
- **`player_joined`**: Broadcasts new player alerts to all lobby members in real time.
- **`player_left`**: Broadcasts departures; if the host leaves, automatically promotes the next player to host.
- **`room_updated`**: Synchronizes player lists, host indicators, and connection statuses instantly.
- **`start_game`**: Restricted to the host; enforces minimum 2-player rule before dealing cards.
- **`send_chat` / `chat_received`**: Real-time in-game chat messaging and quick emojis.

---

## 🚀 How to Run Frontend & Backend

### Prerequisites:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

---

### Option A: Run Both Simultaneously (Recommended)

From the project root directory, run:
```bash
npm run dev:all
```
This runs both:
- **Backend Socket.IO server**: [http://localhost:5000](http://localhost:5000)
- **Frontend Vite app**: [http://localhost:3000](http://localhost:3000)

---

### Option B: Run in Separate Terminals

#### Terminal 1 — Backend Server:
```bash
cd backend
npm run dev
# or from root: npm run server
```
Server will start on port `5000` with health check at `http://localhost:5000/api/health`.

#### Terminal 2 — Frontend Application:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🧪 Testing Real-Time Multiplayer

1. Open **Tab 1** (`http://localhost:3000`), click **Create Room**, pick your username (e.g., *Player 1*), and copy the 6-character room code.
2. Open **Tab 2** (or another browser/incognito window), click **Join Room**, enter the code and username (e.g., *Player 2*).
3. Both players will appear in the lobby instantly via Socket.IO.
4. On Tab 1, Player 1 (Host) clicks **Start UNO Match!**
5. Both players transition into the match in real time with their own confidential 7-card hands dealt by the server!

---

## 📁 Directory Structure

```
uno/
├── backend/
│   ├── package.json
│   ├── server.js              # Express app & Socket.IO server setup
│   ├── game/
│   │   ├── roomManager.js     # Server-side room state & player sanitization
│   │   └── unoEngine.js       # 108 card deck generator & move rules
│   └── socket/
│       └── socketHandlers.js  # Socket.IO event controllers
├── src/
│   ├── components/
│   │   ├── CreateRoomModal.jsx# Create room popup with host options
│   │   ├── JoinRoomModal.jsx  # Join room popup with code validation
│   │   ├── GameLobby.jsx      # Multiplayer staging lobby
│   │   ├── CardHand.jsx       # 3D player card fan
│   │   ├── UnoCard.jsx        # Interactive UNO card component
│   │   ├── PlayerSeat.jsx     # Opponents around table
│   │   ├── GameChat.jsx       # Live in-game chat panel
│   │   ├── ColorPickerModal.jsx# 4-color chooser for Wild cards
│   │   └── ScoreboardModal.jsx# Winner celebration with confetti
│   ├── services/
│   │   ├── socketService.js   # Socket.IO client interface
│   │   └── soundManager.js    # Web Audio API sound synthesizer
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── GamePage.jsx
│   └── styles/
│       └── index.css
├── package.json
└── vite.config.js
```
