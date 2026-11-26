/**
 * Test Suite for UNO RISHIKA SECRET CHEAT MODE
 * 
 * Verifies:
 * 1. Code 2420 gives 4 normal playable UNO cards and updates card count.
 * 2. Code 1414 gives 1 Wild card that allows color selection.
 * 3. Code 1212 gives 1 Draw Two card with random color from Red, Blue, Green, Yellow.
 * 4. Cheat restrictions (active game only, invalid codes rejected, room existence).
 * 5. Multi-client Socket.IO real-time synchronization (confidential hand security).
 */

import assert from 'assert';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';

import { initGame, playCard, CARD_COLORS } from '../game/unoEngine.js';
import { RoomManager } from '../game/roomManager.js';
import { registerSocketHandlers } from '../socket/socketHandlers.js';

console.log('====================================================');
console.log('🔥 Testing UNO RISHIKA SECRET CHEAT MODE...');
console.log('====================================================\n');

// PART 1: UNIT TESTS ON GAME ENGINE & ROOM MANAGER
{
  console.log('--- PART 1: Engine & RoomManager Unit Tests ---');
  const rm = new RoomManager();
  const { room, player: p1 } = rm.createRoom({ socketId: 's1', username: 'Player1' });
  const { player: p2 } = rm.joinRoom({ socketId: 's2', roomCode: room.code, username: 'Player2' });

  // 1. Restriction: Cheat should fail before game starts
  assert.throws(
    () => rm.activateCheat(room.code, p1.id, '2420'),
    /active game/i,
    'Cheat code must be rejected when room is still in lobby'
  );
  console.log('✅ Pass: Inactive game restriction enforced.');

  // 2. Start game
  rm.startGame(room.code, p1.id);
  assert.strictEqual(room.status, 'playing');
  const gp1 = room.gameState.players.find((p) => p.id === p1.id);
  const gp2 = room.gameState.players.find((p) => p.id === p2.id);
  assert.strictEqual(gp1.cards.length, 7, 'Player 1 starts with 7 cards');
  assert.strictEqual(gp2.cards.length, 7, 'Player 2 starts with 7 cards');

  // 3. Restriction: Invalid cheat code
  assert.throws(
    () => rm.activateCheat(room.code, p1.id, '9999'),
    /invalid/i,
    'Invalid code must be rejected'
  );
  assert.throws(
    () => rm.activateCheat(room.code, p1.id, 'abcd'),
    /invalid/i,
    'Invalid alphanumeric code must be rejected'
  );
  console.log('✅ Pass: Invalid code rejection enforced.');

  // 4. Test CODE 2420 (+4 normal playable cards)
  const result2420 = rm.activateCheat(room.code, p1.id, '2420');
  assert.strictEqual(result2420.success, true);
  assert.strictEqual(result2420.cardsAdded, 4);
  assert.strictEqual(result2420.message, '🔥 +4 CARDS UNLOCKED!');
  assert.strictEqual(gp1.cards.length, 11, 'Player 1 must have 11 cards (7 + 4)');
  // Verify all 4 added cards are normal playable cards (standard color and valid type)
  result2420.newCards.forEach((c) => {
    assert(CARD_COLORS.includes(c.color), `Color ${c.color} must be red, blue, green, or yellow`);
    assert(['number', 'skip', 'reverse', 'draw2'].includes(c.type), 'Card must be normal number or action card');
  });
  console.log('✅ Pass: Code 2420 correctly gave 4 normal playable UNO cards.');

  // 5. Test CODE 1414 (+1 Wild card)
  const result1414 = rm.activateCheat(room.code, p1.id, '1414');
  assert.strictEqual(result1414.success, true);
  assert.strictEqual(result1414.cardsAdded, 1);
  assert.strictEqual(result1414.message, '🌈 WILD CARD UNLOCKED!');
  assert.strictEqual(gp1.cards.length, 12, 'Player 1 must have 12 cards');
  const wildCard = result1414.newCards[0];
  assert.strictEqual(wildCard.type, 'wild');
  assert.strictEqual(wildCard.color, 'wild');
  console.log('✅ Pass: Code 1414 correctly gave 1 Wild card.');

  // 6. Test CODE 1212 (+1 Draw Two card with random color)
  const result1212 = rm.activateCheat(room.code, p2.id, '1212');
  assert.strictEqual(result1212.success, true);
  assert.strictEqual(result1212.cardsAdded, 1);
  assert.strictEqual(result1212.message, '⚡ DRAW TWO CARD UNLOCKED!');
  assert.strictEqual(gp2.cards.length, 8, 'Player 2 must have 8 cards (7 + 1)');
  const draw2Card = result1212.newCards[0];
  assert.strictEqual(draw2Card.type, 'draw2');
  assert(CARD_COLORS.includes(draw2Card.color), `Draw 2 color ${draw2Card.color} must be red, blue, green, or yellow`);
  console.log('✅ Pass: Code 1212 correctly gave 1 Draw Two card.');

  // 7. Verify cheats recording in game state
  assert.strictEqual(room.gameState.cheatsUsed.length, 3, 'Must record 3 cheat activations');
  console.log('✅ Pass: Cheats logged in game state.');

  // 8. Confidential hand security check via getSanitizedRoom
  const sanitizedForP1 = rm.getSanitizedRoom(room.code, p1.id);
  const sanitizedForP2 = rm.getSanitizedRoom(room.code, p2.id);

  // Player 1 sees own 12 cards, sees Player 2 has 8 cards
  assert.strictEqual(sanitizedForP1.players.find((p) => p.id === p1.id).cards.length, 12);
  assert.strictEqual(sanitizedForP1.players.find((p) => p.id === p2.id).cardsCount, 8);
  assert.strictEqual(sanitizedForP1.players.find((p) => p.id === p2.id).cards, undefined, 'Private hand hidden');

  // Player 2 sees own 8 cards, sees Player 1 has 12 cards
  assert.strictEqual(sanitizedForP2.players.find((p) => p.id === p2.id).cards.length, 8);
  assert.strictEqual(sanitizedForP2.players.find((p) => p.id === p1.id).cardsCount, 12);
  assert.strictEqual(sanitizedForP2.players.find((p) => p.id === p1.id).cards, undefined, 'Private hand hidden');
  console.log('✅ Pass: Sanitized room preserves confidential hands while synchronizing card count.\n');
}

// PART 2: LIVE MULTIPLAYER SOCKET.IO INTEGRATION TEST
async function runSocketIntegrationTest() {
  console.log('--- PART 2: Live Socket.IO Multiplayer Integration Test ---');
  const TEST_PORT = 5088;
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));

  const client1 = ClientIO(`http://127.0.0.1:${TEST_PORT}`, { transports: ['websocket'] });
  const client2 = ClientIO(`http://127.0.0.1:${TEST_PORT}`, { transports: ['websocket'] });

  await Promise.all([
    new Promise((res) => client1.on('connect', res)),
    new Promise((res) => client2.on('connect', res)),
  ]);
  console.log('✅ Clients connected to test server.');

  // 1. Create Room (Alice)
  let roomCode = '';
  let aliceId = '';
  await new Promise((resolve) => {
    client1.emit('create_room', { username: 'Alice', maxPlayers: 2 }, (res) => {
      assert(res.success);
      roomCode = res.room.code;
      aliceId = res.playerId;
      resolve();
    });
  });

  // 2. Join Room (Bob)
  let bobId = '';
  await new Promise((resolve) => {
    client2.emit('join_room', { roomCode, username: 'Bob' }, (res) => {
      assert(res.success);
      bobId = res.playerId;
      resolve();
    });
  });

  // 3. Start Game
  await new Promise((resolve) => {
    client1.emit('start_game', { roomCode }, (res) => {
      assert(res.success);
      resolve();
    });
  });

  // Wait for initial room_updated
  await new Promise((res) => setTimeout(res, 100));

  // 4. Bob monitors Alice's cardsCount via room_updated
  let bobReceivedAliceCardsCount = 0;
  client2.on('room_updated', (updatedRoom) => {
    const aliceInBobView = updatedRoom.players.find((p) => p.id === aliceId);
    if (aliceInBobView) {
      bobReceivedAliceCardsCount = aliceInBobView.cardsCount;
      // Confirm Bob cannot see Alice's actual cards
      assert.strictEqual(aliceInBobView.cards, undefined, "Bob must not see Alice's private cards");
    }
  });

  // 5. Alice activates cheat code 2420 (+4 cards)
  const cheatRes = await new Promise((resolve) => {
    client1.emit('activate_cheat', { roomCode, code: '2420' }, resolve);
  });

  assert.strictEqual(cheatRes.success, true);
  assert.strictEqual(cheatRes.cardsAdded, 4);
  assert.strictEqual(cheatRes.message, '🔥 +4 CARDS UNLOCKED!');

  // Allow socket broadcast delivery
  await new Promise((res) => setTimeout(res, 150));

  // Verify Bob's view of Alice's card count updated from 7 to 11
  assert.strictEqual(bobReceivedAliceCardsCount, 11, "Bob should see Alice's card count updated to 11");
  console.log("✅ Pass: Real-time broadcast updated Alice's card count to 11 for Bob while keeping cards secret.");

  // 6. Alice activates cheat code 1414 (+1 Wild card)
  const wildCheatRes = await new Promise((resolve) => {
    client1.emit('activate_cheat', { roomCode, code: '1414' }, resolve);
  });
  assert.strictEqual(wildCheatRes.success, true);
  assert.strictEqual(wildCheatRes.cardsAdded, 1);
  assert.strictEqual(wildCheatRes.message, '🌈 WILD CARD UNLOCKED!');

  await new Promise((res) => setTimeout(res, 150));
  assert.strictEqual(bobReceivedAliceCardsCount, 12, "Bob should see Alice's card count updated to 12");
  console.log("✅ Pass: Code 1414 synchronized successfully over live sockets.");

  // 7. Cleanup
  client1.disconnect();
  client2.disconnect();
  server.close();
  console.log('✅ Pass: Live Socket.IO session cleanly terminated.\n');
}

runSocketIntegrationTest()
  .then(() => {
    console.log('====================================================');
    console.log('🎉 ALL SECRET CHEAT MODE TESTS PASSED 100%!');
    console.log('====================================================');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  });
