/**
 * SocketService - Frontend Socket.IO Real-Time Client for UNO RISHIKA
 * Server-authoritative gameplay with automatic reconnection support.
 */

import { io } from 'socket.io-client';
import { generateRoomCode } from './mockUnoEngine';

// Supports dynamic backend URL: allows same host on port 5000 for LAN testing on phones
const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  if (typeof window !== 'undefined' && window.location.hostname) {
    // If running in local development (Vite dev server on port 3000/5173), connect to local backend port 5000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    // In production (Firebase Hosting with Cloud Run rewrites), use same origin
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();
const ROOMS_STORAGE_KEY = 'uno_rishika_active_rooms';
const BC_CHANNEL_NAME = 'uno_rishika_multiplayer_sync';

class SocketService {
  constructor() {
    this.listeners = new Map();
    this.currentRoom = null;
    this.myPlayerId = this.getOrCreatePlayerId();
    this.socket = null;
    this.isConnected = false;

    this.initSocket();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BC_CHANNEL_NAME);
        this.channel.onmessage = (event) => this.handleBroadcastMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel fallback setup', e);
      }
    }
  }

  initSocket() {
    try {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 8000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log(`[Socket.IO] Connected to backend at ${BACKEND_URL} (ID: ${this.socket.id})`);
        this.trigger('connection_status', { connected: true });
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[Socket.IO] Disconnected from backend');
        this.trigger('connection_status', { connected: false });
      });

      this.socket.on('connect_error', () => {
        this.isConnected = false;
      });

      this.socket.on('room_updated', (room) => {
        this.currentRoom = room;
        this.trigger('room_updated', room);
      });

      this.socket.on('player_joined', (player) => {
        this.trigger('player_joined', player);
      });

      this.socket.on('player_left', (data) => {
        this.trigger('player_left', data);
      });

      this.socket.on('game_started', (room) => {
        this.currentRoom = room;
        this.trigger('game_started', room);
      });

      this.socket.on('game_event', (eventData) => {
        this.trigger('game_event', eventData);
      });

      this.socket.on('chat_received', (msg) => {
        this.trigger('chat_received', msg);
      });
    } catch (e) {
      console.warn('Socket.IO initialization error:', e);
    }
  }

  getOrCreatePlayerId() {
    let id = sessionStorage.getItem('uno_rishika_client_id');
    if (!id) {
      id = 'p_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('uno_rishika_client_id', id);
    }
    return id;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const filtered = this.listeners.get(event).filter((cb) => cb !== callback);
    this.listeners.set(event, filtered);
  }

  trigger(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  broadcast(type, payload) {
    if (this.channel) {
      this.channel.postMessage({ type, payload, senderId: this.myPlayerId });
    }
  }

  handleBroadcastMessage(data) {
    if (!data || data.senderId === this.myPlayerId) return;
    if (this.isConnected) return;

    if (data.type === 'ROOM_UPDATED') {
      const room = data.payload;
      if (this.currentRoom && this.currentRoom.code === room.code) {
        this.currentRoom = room;
        this.trigger('room_updated', room);
      }
    } else if (data.type === 'GAME_STARTED') {
      const { roomCode } = data.payload;
      if (this.currentRoom && this.currentRoom.code === roomCode) {
        this.currentRoom.status = 'playing';
        this.trigger('game_started', this.currentRoom);
      }
    } else if (data.type === 'GAME_EVENT') {
      this.trigger('game_event', data.payload);
    } else if (data.type === 'CHAT_MESSAGE') {
      const { roomCode, message } = data.payload;
      if (this.currentRoom && this.currentRoom.code === roomCode) {
        this.trigger('chat_received', message);
      }
    }
  }

  getAllRooms() {
    try {
      const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveRooms(rooms) {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms', e);
    }
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    if (this.currentRoom && this.currentRoom.code === roomCode.toUpperCase()) {
      return this.currentRoom;
    }
    const rooms = this.getAllRooms();
    return rooms[roomCode.toUpperCase()] || null;
  }

  saveRoom(room) {
    const rooms = this.getAllRooms();
    rooms[room.code] = room;
    this.saveRooms(rooms);
    this.broadcast('ROOM_UPDATED', room);
  }

  createRoom({ username, avatar, maxPlayers = 4 }) {
    return new Promise((resolve, reject) => {
      if (!username || !username.trim()) {
        return reject(new Error('Please enter a username to create a room.'));
      }

      if (this.socket && this.socket.connected) {
        this.socket.emit(
          'create_room',
          { username: username.trim(), avatar, maxPlayers },
          (response) => {
            if (response?.success) {
              this.currentRoom = response.room;
              this.myPlayerId = response.playerId;
              sessionStorage.setItem(`uno_player_id_${response.room.code}`, response.playerId);
              this.saveRoom(response.room);
              this.trigger('room_created', response.room);
              resolve(response.room);
            } else {
              reject(new Error(response?.error || 'Failed to create room on server.'));
            }
          }
        );
        return;
      }

      // Local fallback
      const roomCode = generateRoomCode();
      const hostPlayer = {
        id: this.myPlayerId,
        name: username.trim(),
        avatar: avatar || '🔥',
        isHost: true,
        connected: true,
        cards: [],
        hasCalledUno: false,
      };

      const newRoom = {
        code: roomCode,
        hostId: this.myPlayerId,
        hostName: username.trim(),
        maxPlayers: Math.min(Math.max(parseInt(maxPlayers, 10) || 4, 2), 4),
        status: 'lobby',
        players: [hostPlayer],
        createdAt: Date.now(),
      };

      this.saveRoom(newRoom);
      this.currentRoom = newRoom;
      this.trigger('room_created', newRoom);
      resolve(newRoom);
    });
  }

  joinRoom({ roomCode, username, avatar }) {
    return new Promise((resolve, reject) => {
      if (!roomCode || typeof roomCode !== 'string') {
        return reject(new Error('Please enter a room code.'));
      }

      const formattedCode = roomCode.trim().toUpperCase();
      if (formattedCode.length !== 6) {
        return reject(new Error('Room code must be exactly 6 characters.'));
      }

      if (!username || !username.trim()) {
        return reject(new Error('Please enter your display username.'));
      }

      const existingPlayerId = sessionStorage.getItem(`uno_player_id_${formattedCode}`);

      if (this.socket && this.socket.connected) {
        this.socket.emit(
          'join_room',
          { roomCode: formattedCode, username: username.trim(), avatar, existingPlayerId },
          (response) => {
            if (response?.success) {
              this.currentRoom = response.room;
              this.myPlayerId = response.playerId;
              sessionStorage.setItem(`uno_player_id_${formattedCode}`, response.playerId);
              this.saveRoom(response.room);
              this.trigger('room_updated', response.room);
              resolve(response.room);
            } else {
              reject(new Error(response?.error || `Unable to join room "${formattedCode}".`));
            }
          }
        );
        return;
      }

      const room = this.getRoom(formattedCode);
      if (!room) {
        return reject(new Error(`Room "${formattedCode}" does not exist. Please check the code.`));
      }

      if (room.status !== 'lobby') {
        return reject(new Error(`Match in room "${formattedCode}" is already in progress.`));
      }

      const existingPlayerIndex = room.players.findIndex((p) => p.id === this.myPlayerId);
      if (existingPlayerIndex !== -1) {
        room.players[existingPlayerIndex].name = username.trim();
        room.players[existingPlayerIndex].avatar = avatar || room.players[existingPlayerIndex].avatar;
        room.players[existingPlayerIndex].connected = true;
        this.saveRoom(room);
        this.currentRoom = room;
        this.trigger('room_updated', room);
        return resolve(room);
      }

      if (room.players.length >= room.maxPlayers) {
        return reject(new Error(`Room "${formattedCode}" is already full (${room.players.length}/${room.maxPlayers} players).`));
      }

      const newPlayer = {
        id: this.myPlayerId,
        name: username.trim(),
        avatar: avatar || '🎮',
        isHost: false,
        connected: true,
        cards: [],
        hasCalledUno: false,
      };

      room.players.push(newPlayer);
      this.saveRoom(room);
      this.currentRoom = room;
      this.trigger('room_updated', room);
      this.trigger('player_joined', newPlayer);
      resolve(room);
    });
  }

  leaveRoom(roomCode) {
    const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
    if (!code) return;

    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', { roomCode: code }, () => {});
    }

    const room = this.getRoom(code);
    if (room) {
      room.players = room.players.filter((p) => p.id !== this.myPlayerId);
      if (room.players.length === 0) {
        const rooms = this.getAllRooms();
        delete rooms[room.code];
        this.saveRooms(rooms);
      } else {
        if (room.hostId === this.myPlayerId) {
          room.players[0].isHost = true;
          room.hostId = room.players[0].id;
          room.hostName = room.players[0].name;
        }
        this.saveRoom(room);
      }
    }

    sessionStorage.removeItem(`uno_player_id_${code}`);
    this.currentRoom = null;
    this.trigger('left_room', { roomCode: code });
  }

  startGame(roomCode) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();

      if (this.socket && this.socket.connected) {
        this.socket.emit('start_game', { roomCode: code }, (response) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to start game on server.'));
          }
        });
        return;
      }

      const room = this.getRoom(code);
      if (!room) return reject(new Error('Room not found.'));
      if (room.hostId !== this.myPlayerId) {
        return reject(new Error('Only the room host can start the game.'));
      }
      if (room.players.length < 2) {
        return reject(new Error('At least 2 players are required to start the game.'));
      }

      room.status = 'playing';
      this.saveRoom(room);
      this.currentRoom = room;
      this.broadcast('GAME_STARTED', { roomCode: room.code });
      this.trigger('game_started', room);
      resolve(room);
    });
  }

  playCard(roomCode, cardId, chosenColor) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
      if (this.socket && this.socket.connected) {
        this.socket.emit('play_card', { roomCode: code, cardId, chosenColor }, (response) => {
          if (response?.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || 'Invalid move.'));
          }
        });
      } else {
        resolve();
      }
    });
  }

  drawCard(roomCode) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
      if (this.socket && this.socket.connected) {
        this.socket.emit('draw_card', { roomCode: code }, (response) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Unable to draw card.'));
          }
        });
      } else {
        resolve();
      }
    });
  }

  passTurn(roomCode) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
      if (this.socket && this.socket.connected) {
        this.socket.emit('pass_turn', { roomCode: code }, (response) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Unable to pass turn.'));
          }
        });
      } else {
        resolve();
      }
    });
  }

  declareUno(roomCode) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
      if (this.socket && this.socket.connected) {
        this.socket.emit('declare_uno', { roomCode: code }, (response) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Unable to declare UNO.'));
          }
        });
      } else {
        resolve();
      }
    });
  }

  catchUno(roomCode, targetPlayerId) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
      if (this.socket && this.socket.connected) {
        this.socket.emit('catch_uno', { roomCode: code, targetPlayerId }, (response) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Unable to catch player.'));
          }
        });
      } else {
        resolve();
      }
    });
  }

  resolveChallenge(roomCode, chooseToChallenge) {
    return new Promise((resolve, reject) => {
      const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
      if (this.socket && this.socket.connected) {
        this.socket.emit('resolve_challenge', { roomCode: code, chooseToChallenge }, (response) => {
          if (response?.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || 'Unable to resolve challenge.'));
          }
        });
      } else {
        resolve();
      }
    });
  }

  addBotPlayer(roomCode) {
    const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
    const room = this.getRoom(code);
    if (!room) return;
    if (room.players.length >= room.maxPlayers) return;

    const botNames = ['Rishika (Pro)', 'Alex (Fast)', 'Shadow (Ninja)', 'Sparky', 'Zack'];
    const botAvatars = ['👑', '🦊', '🥷', '👾', '🐯'];
    const availableIndex = room.players.length;

    const botPlayer = {
      id: 'bot_' + Math.random().toString(36).substring(2, 7),
      name: botNames[(availableIndex - 1) % botNames.length],
      avatar: botAvatars[(availableIndex - 1) % botAvatars.length],
      isHost: false,
      isBot: true,
      connected: true,
      cards: [],
      hasCalledUno: false,
    };

    room.players.push(botPlayer);
    this.saveRoom(room);
    this.currentRoom = room;
    this.trigger('room_updated', room);
    return botPlayer;
  }

  sendChat(roomCode, text, senderName) {
    const code = (roomCode || this.currentRoom?.code || '').toUpperCase();
    const message = {
      id: 'msg_' + Date.now(),
      sender: senderName,
      text,
      timestamp: Date.now(),
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('send_chat', { roomCode: code, text, senderName });
    } else {
      this.broadcast('CHAT_MESSAGE', { roomCode: code, message });
    }

    return message;
  }

  activateCheat(roomCode, code) {
    return new Promise((resolve, reject) => {
      const targetRoom = (roomCode || this.currentRoom?.code || '').toUpperCase().trim();
      if (!this.socket || !this.socket.connected) {
        return reject(new Error('Server is currently offline. Please wait for reconnection.'));
      }

      this.socket.emit('activate_cheat', { roomCode: targetRoom, code }, (response) => {
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Failed to activate cheat code.'));
        }
      });
    });
  }
}

export const socketService = new SocketService();
