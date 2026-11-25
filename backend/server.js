import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerSocketHandlers } from './socket/socketHandlers.js';
import { roomManager } from './game/roomManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all incoming client origins (mobile, local network IPs, etc.)
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Server health check & diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'UNO RISHIKA Real-Time Server',
    uptime: Math.floor(process.uptime()),
    activeRooms: roomManager.rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// Create HTTP and Socket.IO server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// Register socket handlers
io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

// Bind to 0.0.0.0 for cross-device local network & internet connectivity
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 UNO RISHIKA Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Socket.IO ready for cross-device multiplayer`);
  console.log(`=========================================`);
});
