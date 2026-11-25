import {
  initGame,
  playCard,
  playerDrawCard,
  playerPassTurn,
  declareUno,
  catchUnoFailure,
  resolveWildDrawFourChallenge,
  calculateScore,
} from './unoEngine.js';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomCode -> room object
    this.socketToPlayer = new Map(); // socket.id -> { roomCode, playerId }
  }

  generateUniqueRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom({ socketId, username, avatar, maxPlayers = 4 }) {
    const code = this.generateUniqueRoomCode();
    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);

    const hostPlayer = {
      id: playerId,
      socketId,
      name: username.trim(),
      avatar: avatar || '🔥',
      isHost: true,
      connected: true,
      cards: [],
      hasCalledUno: false,
    };

    const room = {
      code,
      hostId: playerId,
      hostName: username.trim(),
      maxPlayers: Math.min(Math.max(parseInt(maxPlayers, 10) || 4, 2), 4),
      status: 'lobby', // 'lobby' | 'playing' | 'ended'
      players: [hostPlayer],
      gameState: null,
      roundsPlayed: 0,
      scoreboard: {
        [playerId]: {
          id: playerId,
          name: username.trim(),
          avatar: avatar || '🔥',
          wins: 0,
          score: 0,
        },
      },
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.socketToPlayer.set(socketId, { roomCode: code, playerId });

    return { room, player: hostPlayer };
  }

  joinRoom({ socketId, roomCode, username, avatar, existingPlayerId }) {
    const code = (roomCode || '').toUpperCase().trim();
    const room = this.rooms.get(code);

    if (!room) {
      throw new Error(`Room "${code}" does not exist. Check the code and try again.`);
    }

    // 1. Reconnection handling
    if (existingPlayerId) {
      const playersList = room.gameState ? room.gameState.players : room.players;
      const existingPlayer = playersList.find((p) => p.id === existingPlayerId);
      if (existingPlayer) {
        existingPlayer.socketId = socketId;
        existingPlayer.connected = true;
        this.socketToPlayer.set(socketId, { roomCode: code, playerId: existingPlayerId });
        return { room, player: existingPlayer, reconnected: true };
      }
    }

    // 2. Reject if match in progress
    if (room.status !== 'lobby') {
      throw new Error(`Game in room "${code}" is already in progress.`);
    }

    // 3. Reject if full
    if (room.players.length >= room.maxPlayers) {
      throw new Error(`Room "${code}" is already full (${room.players.length}/${room.maxPlayers} players).`);
    }

    const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
    const newPlayer = {
      id: playerId,
      socketId,
      name: username.trim(),
      avatar: avatar || '🦊',
      isHost: false,
      connected: true,
      cards: [],
      hasCalledUno: false,
    };

    room.players.push(newPlayer);
    if (!room.scoreboard[playerId]) {
      room.scoreboard[playerId] = {
        id: playerId,
        name: username.trim(),
        avatar: avatar || '🦊',
        wins: 0,
        score: 0,
      };
    }

    this.socketToPlayer.set(socketId, { roomCode: code, playerId });

    return { room, player: newPlayer, reconnected: false };
  }

  handleDisconnect(socketId) {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return null;

    const { roomCode, playerId } = mapping;
    const room = this.rooms.get(roomCode);
    this.socketToPlayer.delete(socketId);

    if (!room) return null;

    const playersList = room.gameState ? room.gameState.players : room.players;
    const targetPlayer = playersList.find((p) => p.id === playerId);

    if (room.status === 'playing') {
      if (targetPlayer) {
        targetPlayer.connected = false;
      }
      return { roomCode, room, player: targetPlayer, isPlaying: true };
    } else {
      room.players = room.players.filter((p) => p.id !== playerId);

      if (room.players.length === 0) {
        this.rooms.delete(roomCode);
        return { roomCode, room: null, player: targetPlayer, deleted: true };
      }

      if (room.hostId === playerId) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
        room.hostName = room.players[0].name;
      }

      return { roomCode, room, player: targetPlayer, deleted: false, isPlaying: false };
    }
  }

  leaveRoom(socketId) {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return null;

    const { roomCode, playerId } = mapping;
    const room = this.rooms.get(roomCode);
    this.socketToPlayer.delete(socketId);

    if (!room) return null;

    const playersList = room.gameState ? room.gameState.players : room.players;
    const leavingPlayer = playersList.find((p) => p.id === playerId);

    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.gameState) {
      room.gameState.players = room.gameState.players.filter((p) => p.id !== playerId);
    }

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return { roomCode, room: null, leavingPlayer, deleted: true };
    }

    if (room.hostId === playerId) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
      room.hostName = room.players[0].name;
    }

    return { roomCode, room, leavingPlayer, deleted: false };
  }

  startGame(roomCode, playerId) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room) throw new Error('Room not found.');

    if (room.hostId !== playerId) {
      throw new Error('Only the room host can start the game.');
    }

    if (room.players.length < 2) {
      throw new Error('At least 2 players are required to start the game.');
    }

    // Ensure all players are in scoreboard
    room.players.forEach((p) => {
      if (!room.scoreboard[p.id]) {
        room.scoreboard[p.id] = {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          wins: 0,
          score: 0,
        };
      }
    });

    room.gameState = initGame(room.players);
    room.roundsPlayed += 1;
    room.status = 'playing';

    return room;
  }

  restartGame(roomCode, playerId) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room) throw new Error('Room not found.');

    if (room.hostId !== playerId) {
      throw new Error('Only the room host can restart or start the next round.');
    }

    // Reset hands and deal fresh game state while preserving scoreboard & round count
    const playersList = room.gameState ? room.gameState.players : room.players;
    room.gameState = initGame(playersList);
    room.roundsPlayed += 1;
    room.status = 'playing';

    return room;
  }

  playCard(roomCode, playerId, cardId, chosenColor) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room || !room.gameState) throw new Error('Game not initialized.');

    const result = playCard(room.gameState, playerId, cardId, chosenColor);
    if (result.winner) {
      room.status = 'ended';
      // Update scoreboard
      const points = result.score || calculateScore(room.gameState, result.winner.id);
      if (room.scoreboard[result.winner.id]) {
        room.scoreboard[result.winner.id].wins += 1;
        room.scoreboard[result.winner.id].score += points;
      }
    }
    return result;
  }

  drawCard(roomCode, playerId) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room || !room.gameState) throw new Error('Game not initialized.');

    return playerDrawCard(room.gameState, playerId);
  }

  passTurn(roomCode, playerId) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room || !room.gameState) throw new Error('Game not initialized.');

    return playerPassTurn(room.gameState, playerId);
  }

  declareUno(roomCode, playerId) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room || !room.gameState) throw new Error('Game not initialized.');

    return declareUno(room.gameState, playerId);
  }

  catchUno(roomCode, callerId, targetPlayerId) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room || !room.gameState) throw new Error('Game not initialized.');

    return catchUnoFailure(room.gameState, callerId, targetPlayerId);
  }

  resolveChallenge(roomCode, challengerId, chooseToChallenge) {
    const room = this.rooms.get((roomCode || '').toUpperCase());
    if (!room || !room.gameState) throw new Error('Game not initialized.');

    return resolveWildDrawFourChallenge(room.gameState, challengerId, chooseToChallenge);
  }

  getRoom(roomCode) {
    return this.rooms.get((roomCode || '').toUpperCase().trim());
  }

  getSanitizedRoom(roomCode, forPlayerId) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const gs = room.gameState;
    const playersList = gs ? gs.players : room.players;

    return {
      code: room.code,
      hostId: room.hostId,
      hostName: room.hostName,
      maxPlayers: room.maxPlayers,
      status: room.status,
      roundsPlayed: room.roundsPlayed,
      scoreboard: room.scoreboard,
      activeColor: gs ? gs.activeColor : null,
      topCard: gs ? gs.topCard : null,
      currentTurnIndex: gs ? gs.currentTurnIndex : 0,
      turnDirection: gs ? gs.turnDirection : 1,
      hasDrawnThisTurn: gs ? gs.hasDrawnThisTurn : false,
      deckCount: gs ? gs.deck.length : 0,
      discardCount: gs ? gs.discardPile.length : 0,
      pendingChallenge: gs ? gs.pendingChallenge : null,
      winner: gs ? gs.winner : null,
      actionLog: gs ? gs.actionLog.slice(-10) : [],
      // Confidential Hand Security: each player only receives their own private cards!
      players: playersList.map((p) => {
        const isSelf = p.id === forPlayerId;
        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isHost: p.isHost,
          connected: p.connected,
          cardsCount: p.cards ? p.cards.length : 0,
          declaredUno: p.declaredUno || false,
          unoVulnerable: p.unoVulnerable || false,
          cards: isSelf ? (p.cards || []) : undefined,
        };
      }),
    };
  }
}

export const roomManager = new RoomManager();
