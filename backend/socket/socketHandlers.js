import { roomManager } from '../game/roomManager.js';

export function registerSocketHandlers(io, socket) {
  const broadcastRoomUpdate = (roomCode, eventName = 'room_updated') => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const playersList = room.gameState ? room.gameState.players : room.players;
    playersList.forEach((player) => {
      if (player.socketId) {
        const sanitized = roomManager.getSanitizedRoom(roomCode, player.id);
        io.to(player.socketId).emit(eventName, sanitized);
      }
    });
  };

  // 1. CREATE ROOM
  socket.on('create_room', ({ username, avatar, maxPlayers }, callback) => {
    try {
      if (!username || !username.trim()) {
        return callback?.({ success: false, error: 'Username is required.' });
      }

      const { room, player } = roomManager.createRoom({
        socketId: socket.id,
        username,
        avatar,
        maxPlayers,
      });

      socket.join(room.code);
      const sanitized = roomManager.getSanitizedRoom(room.code, player.id);
      callback?.({ success: true, room: sanitized, playerId: player.id });
      broadcastRoomUpdate(room.code, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 2. JOIN / RECONNECT ROOM
  socket.on('join_room', ({ roomCode, username, avatar, existingPlayerId }, callback) => {
    try {
      if (!roomCode || roomCode.trim().length !== 6) {
        return callback?.({ success: false, error: 'Invalid 6-character room code.' });
      }
      if (!username || !username.trim()) {
        return callback?.({ success: false, error: 'Username is required.' });
      }

      const { room, player, reconnected } = roomManager.joinRoom({
        socketId: socket.id,
        roomCode,
        username,
        avatar,
        existingPlayerId,
      });

      socket.join(room.code);
      const sanitized = roomManager.getSanitizedRoom(room.code, player.id);
      callback?.({ success: true, room: sanitized, playerId: player.id });

      if (reconnected) {
        io.to(room.code).emit('game_event', {
          type: 'player_reconnected',
          text: `${player.name} reconnected to the match!`,
          player: { id: player.id, name: player.name },
        });
      } else {
        socket.to(room.code).emit('player_joined', {
          id: player.id,
          name: player.name,
          avatar: player.avatar,
          isHost: player.isHost,
        });
      }

      broadcastRoomUpdate(room.code, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 3. LEAVE ROOM
  socket.on('leave_room', ({ roomCode }, callback) => {
    try {
      const result = roomManager.leaveRoom(socket.id);
      if (result) {
        socket.leave(result.roomCode);
        if (!result.deleted && result.room) {
          socket.to(result.roomCode).emit('player_left', {
            id: result.leavingPlayer?.id,
            name: result.leavingPlayer?.name,
          });
          broadcastRoomUpdate(result.roomCode, 'room_updated');
        }
      }
      callback?.({ success: true });
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 4. START GAME
  socket.on('start_game', ({ roomCode }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping || mapping.roomCode !== roomCode.toUpperCase()) {
        return callback?.({ success: false, error: 'Unauthorized room operation.' });
      }

      const room = roomManager.startGame(roomCode.toUpperCase(), mapping.playerId);
      callback?.({ success: true });

      io.to(room.code).emit('game_event', {
        type: 'match_started',
        text: `Round ${room.roundsPlayed} has started! Cards are dealt!`,
      });

      broadcastRoomUpdate(room.code, 'game_started');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 4.1 RESTART / PLAY AGAIN (Next Round)
  socket.on('restart_game', ({ roomCode }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping || mapping.roomCode !== roomCode.toUpperCase()) {
        return callback?.({ success: false, error: 'Unauthorized room operation.' });
      }

      const room = roomManager.restartGame(roomCode.toUpperCase(), mapping.playerId);
      callback?.({ success: true });

      io.to(room.code).emit('game_event', {
        type: 'match_started',
        text: `Next Round (Round ${room.roundsPlayed}) started!`,
      });

      broadcastRoomUpdate(room.code, 'game_started');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 5. PLAY CARD
  socket.on('play_card', ({ roomCode, cardId, chosenColor }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) return callback?.({ success: false, error: 'Not in a game room.' });

      const room = roomManager.getRoom(roomCode);
      const player = room?.gameState?.players.find((p) => p.id === mapping.playerId);

      const result = roomManager.playCard(roomCode, mapping.playerId, cardId, chosenColor);
      callback?.({ success: true, result });

      const playedCard = room.gameState.topCard;

      io.to(roomCode.toUpperCase()).emit('game_event', {
        type: 'card_played',
        text: `${player?.name} played ${playedCard.color === 'wild' ? 'WILD' : playedCard.color.toUpperCase()} ${playedCard.value}`,
        player: { id: player?.id, name: player?.name },
        card: playedCard,
      });

      if (playedCard.type === 'skip') {
        io.to(roomCode.toUpperCase()).emit('game_event', {
          type: 'player_skipped',
          text: `A player was skipped!`,
        });
      } else if (playedCard.type === 'reverse') {
        io.to(roomCode.toUpperCase()).emit('game_event', {
          type: 'direction_reversed',
          text: `Play direction reversed!`,
          direction: room.gameState.turnDirection,
        });
      } else if (playedCard.color === 'wild' && chosenColor) {
        io.to(roomCode.toUpperCase()).emit('game_event', {
          type: 'color_selected',
          text: `Active color changed to ${chosenColor.toUpperCase()}!`,
          color: chosenColor,
        });
      }

      if (result.winner) {
        io.to(roomCode.toUpperCase()).emit('game_event', {
          type: 'game_won',
          text: `🏆 ${result.winner.name} finished all cards and WON Round ${room.roundsPlayed}!`,
          winner: result.winner,
          score: result.score,
        });
      }

      broadcastRoomUpdate(roomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 6. DRAW CARD
  socket.on('draw_card', ({ roomCode }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) return callback?.({ success: false, error: 'Not in a game room.' });

      const room = roomManager.getRoom(roomCode);
      const player = room?.gameState?.players.find((p) => p.id === mapping.playerId);

      const result = roomManager.drawCard(roomCode, mapping.playerId);
      callback?.({ success: true, ...result });

      io.to(roomCode.toUpperCase()).emit('game_event', {
        type: 'card_drawn',
        text: `${player?.name} drew a card.`,
        player: { id: player?.id, name: player?.name },
      });

      broadcastRoomUpdate(roomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 7. PASS TURN
  socket.on('pass_turn', ({ roomCode }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) return callback?.({ success: false, error: 'Not in a game room.' });

      const room = roomManager.getRoom(roomCode);
      const player = room?.gameState?.players.find((p) => p.id === mapping.playerId);

      roomManager.passTurn(roomCode, mapping.playerId);
      callback?.({ success: true });

      io.to(roomCode.toUpperCase()).emit('game_event', {
        type: 'turn_passed',
        text: `${player?.name} passed turn.`,
        player: { id: player?.id, name: player?.name },
      });

      broadcastRoomUpdate(roomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 8. DECLARE UNO
  socket.on('declare_uno', ({ roomCode }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) return callback?.({ success: false, error: 'Not in a game room.' });

      const room = roomManager.getRoom(roomCode);
      const player = room?.gameState?.players.find((p) => p.id === mapping.playerId);

      roomManager.declareUno(roomCode, mapping.playerId);
      callback?.({ success: true });

      io.to(roomCode.toUpperCase()).emit('game_event', {
        type: 'uno_declared',
        text: `🔥 ${player?.name} SHOUTED UNO! 🔥`,
        player: { id: player?.id, name: player?.name },
      });

      broadcastRoomUpdate(roomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 9. CATCH UNO FAILURE
  socket.on('catch_uno', ({ roomCode, targetPlayerId }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) return callback?.({ success: false, error: 'Not in a game room.' });

      const room = roomManager.getRoom(roomCode);
      const caller = room?.gameState?.players.find((p) => p.id === mapping.playerId);
      const target = room?.gameState?.players.find((p) => p.id === targetPlayerId);

      const result = roomManager.catchUno(roomCode, mapping.playerId, targetPlayerId);
      callback?.({ success: true, ...result });

      if (result.caught) {
        io.to(roomCode.toUpperCase()).emit('game_event', {
          type: 'uno_caught',
          text: `🚨 ${caller?.name} caught ${target?.name} without declaring UNO! +2 cards penalty!`,
          target: { id: target?.id, name: target?.name },
        });
      }

      broadcastRoomUpdate(roomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 10. RESOLVE WILD DRAW FOUR CHALLENGE
  socket.on('resolve_challenge', ({ roomCode, chooseToChallenge }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) return callback?.({ success: false, error: 'Not in a game room.' });

      const result = roomManager.resolveChallenge(roomCode, mapping.playerId, chooseToChallenge);
      callback?.({ success: true, result });

      io.to(roomCode.toUpperCase()).emit('game_event', {
        type: 'challenge_resolved',
        text: result.outcome === 'guilty'
          ? `⚔️ Challenge succeeded! ${result.penalizedPlayer} drew 4 cards!`
          : result.outcome === 'innocent'
          ? `⚔️ Challenge failed! ${result.penalizedPlayer} drew 6 cards and was skipped!`
          : `${result.penalizedPlayer} accepted the +4 cards.`,
        outcome: result.outcome,
      });

      broadcastRoomUpdate(roomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 11. SECRET CHEAT ACTIVATION (UNO RISHIKA SECRET MODE)
  socket.on('activate_cheat', ({ roomCode, code }, callback) => {
    try {
      const mapping = roomManager.socketToPlayer.get(socket.id);
      if (!mapping) {
        return callback?.({ success: false, error: 'You are not in a game room.' });
      }

      const effectiveRoomCode = (roomCode || mapping.roomCode || '').toUpperCase().trim();
      if (!effectiveRoomCode) {
        return callback?.({ success: false, error: 'Room code is missing.' });
      }

      if (!code || typeof code !== 'string') {
        return callback?.({ success: false, error: 'Secret cheat code is required.' });
      }

      const result = roomManager.activateCheat(effectiveRoomCode, mapping.playerId, code.trim());

      callback?.({ success: true, ...result });

      // Synchronize with all players: requesting player receives updated hand,
      // other players receive updated card count without seeing the cheat code or private cards!
      broadcastRoomUpdate(effectiveRoomCode, 'room_updated');
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  // 12. IN-GAME CHAT
  socket.on('send_chat', ({ roomCode, text, senderName, avatar }) => {
    if (!roomCode || !text) return;
    const msg = {
      id: 'msg_' + Date.now(),
      sender: senderName || 'Player',
      avatar: avatar || '🎮',
      text: text.trim(),
      timestamp: Date.now(),
    };
    io.to(roomCode.toUpperCase()).emit('chat_received', msg);
  });

  // 12. DISCONNECTION
  socket.on('disconnect', () => {
    const result = roomManager.handleDisconnect(socket.id);
    if (result && !result.deleted && result.room) {
      io.to(result.roomCode).emit('game_event', {
        type: 'player_disconnected',
        text: `${result.player?.name || 'A player'} disconnected.`,
        player: { id: result.player?.id, name: result.player?.name },
      });
      broadcastRoomUpdate(result.roomCode, 'room_updated');
    }
  });
}
