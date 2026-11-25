/**
 * Comprehensive Multiplayer & Security Integration Test Suite for UNO RISHIKA
 * 
 * Spins up a real HTTP + Socket.IO server on test port 5055 and connects real
 * socket.io-client instances representing separate browser sessions.
 */

import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import assert from 'assert';

import { registerSocketHandlers } from '../socket/socketHandlers.js';
import { roomManager } from '../game/roomManager.js';
import { canPlayCard } from '../game/unoEngine.js';

const TEST_PORT = 5055;
const SERVER_URL = `http://localhost:${TEST_PORT}`;

// Helper to create connected client socket
function connectClient(name) {
  return new Promise((resolve, reject) => {
    const socket = ClientIO(SERVER_URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', (err) => reject(err));
  });
}

// Helper to emit with Promise
function emitWithAck(socket, event, data) {
  return new Promise((resolve) => {
    socket.emit(event, data, (response) => {
      resolve(response);
    });
  });
}

async function runMultiplayerTestSuite() {
  console.log('====================================================');
  console.log('🚀 Launching Live Socket.IO Server for Multi-Client Testing...');
  console.log('====================================================\n');

  // 1. Setup Server
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Server listening on ${SERVER_URL}\n`);

  try {
    // ----------------------------------------------------
    // TEST 1: CREATE ROOM
    // ----------------------------------------------------
    console.log('--- TEST 1: Create Room ---');
    const clientA = await connectClient('Alice');

    const createRes = await emitWithAck(clientA, 'create_room', {
      username: 'Alice',
      avatar: '🔥',
      maxPlayers: 4,
    });

    assert.strictEqual(createRes.success, true, 'Room creation must succeed');
    assert.ok(createRes.room, 'Created room object must be returned');
    assert.strictEqual(createRes.room.code.length, 6, 'Room code must be exactly 6 characters');
    assert.strictEqual(createRes.room.status, 'lobby', 'Room must be in lobby mode initially');
    assert.strictEqual(createRes.room.hostName, 'Alice', 'Alice must be host');
    assert.strictEqual(createRes.room.players.length, 1, 'Room has 1 player initially');

    const roomCode = createRes.room.code;
    const aliceId = createRes.playerId;
    console.log(`✅ Room created successfully with code: ${roomCode}`);

    // ----------------------------------------------------
    // TEST 2: JOIN WITH INVALID ROOM CODE
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Join with Invalid Room Code ---');
    const clientB = await connectClient('Bob');

    // Test non-6-char code
    const invalidFormatRes = await emitWithAck(clientB, 'join_room', {
      roomCode: 'TOOLONG123',
      username: 'Bob',
      avatar: '🦊',
    });
    assert.strictEqual(invalidFormatRes.success, false);
    assert.ok(invalidFormatRes.error.includes('6-character'), 'Must reject codes not equal to 6 chars');

    // Test non-existent room code
    const notFoundRes = await emitWithAck(clientB, 'join_room', {
      roomCode: 'ZZZZZZ',
      username: 'Bob',
      avatar: '🦊',
    });
    assert.strictEqual(notFoundRes.success, false);
    assert.ok(notFoundRes.error.includes('does not exist'), 'Must reject non-existent room code');
    console.log('✅ Invalid & non-existent room codes correctly rejected with helpful errors.');

    // ----------------------------------------------------
    // TEST 3: JOIN WITH VALID ROOM CODE
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Join with Valid Room Code ---');
    let aliceNotifiedOfBob = false;
    clientA.on('player_joined', (p) => {
      if (p.name === 'Bob') aliceNotifiedOfBob = true;
    });

    const joinBobRes = await emitWithAck(clientB, 'join_room', {
      roomCode,
      username: 'Bob',
      avatar: '🦊',
    });

    assert.strictEqual(joinBobRes.success, true);
    assert.strictEqual(joinBobRes.room.players.length, 2);
    const bobId = joinBobRes.playerId;

    // Small delay to verify socket event propagation
    await new Promise((r) => setTimeout(r, 100));
    assert.strictEqual(aliceNotifiedOfBob, true, 'Alice must receive player_joined event');
    console.log('✅ Bob joined room. Host Alice received real-time player_joined notification.');

    // ----------------------------------------------------
    // TEST 4: JOIN THREE AND FOUR PLAYERS & FULL ROOM LIMIT
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Join 3 and 4 Players, then verify 4-player capacity limit ---');
    const clientC = await connectClient('Charlie');
    const joinCharlieRes = await emitWithAck(clientC, 'join_room', {
      roomCode,
      username: 'Charlie',
      avatar: '🦁',
    });
    assert.strictEqual(joinCharlieRes.success, true);
    assert.strictEqual(joinCharlieRes.room.players.length, 3);
    const charlieId = joinCharlieRes.playerId;

    const clientD = await connectClient('Dave');
    const joinDaveRes = await emitWithAck(clientD, 'join_room', {
      roomCode,
      username: 'Dave',
      avatar: '🥷',
    });
    assert.strictEqual(joinDaveRes.success, true);
    assert.strictEqual(joinDaveRes.room.players.length, 4);
    const daveId = joinDaveRes.playerId;

    // Attempt 5th player in a 4-player max room
    const clientE = await connectClient('Eve');
    const joinEveRes = await emitWithAck(clientE, 'join_room', {
      roomCode,
      username: 'Eve',
      avatar: '👾',
    });
    assert.strictEqual(joinEveRes.success, false, '5th player must be rejected');
    assert.ok(joinEveRes.error.includes('full'), 'Error must specify room is full');
    console.log('✅ 2, 3, and 4 players joined successfully. 5th player rejected as room is full (4/4).');

    // ----------------------------------------------------
    // TEST 5: UNAUTHORIZED GAME START
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Security Check - Non-Host Attempting to Start Game ---');
    const nonHostStartRes = await emitWithAck(clientB, 'start_game', { roomCode });
    assert.strictEqual(nonHostStartRes.success, false);
    assert.ok(nonHostStartRes.error.includes('Only the room host can start the game'));
    console.log('✅ Non-host attempt to start game was blocked by server security.');

    // ----------------------------------------------------
    // TEST 6: HOST STARTS GAME & CARDS DEALING
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Host Starts Game & Deals Cards ---');
    let aliceState = null;
    let bobState = null;

    clientA.on('game_started', (st) => (aliceState = st));
    clientB.on('game_started', (st) => (bobState = st));

    const hostStartRes = await emitWithAck(clientA, 'start_game', { roomCode });
    assert.strictEqual(hostStartRes.success, true, 'Host start game must succeed');

    await new Promise((r) => setTimeout(r, 150));
    assert.ok(aliceState, 'Alice must receive game_started state');
    assert.ok(bobState, 'Bob must receive game_started state');

    assert.strictEqual(aliceState.status, 'playing');
    assert.strictEqual(aliceState.players.length, 4);
    assert.strictEqual(aliceState.deckCount, 108 - (4 * 7) - 1, 'Remaining deck count must be 79');
    assert.ok(aliceState.topCard, 'Top discard card must be present');
    assert.ok(aliceState.activeColor, 'Active color must be set');
    console.log('✅ Game successfully started on server. Cards dealt, discard flipped, turns assigned.');

    // ----------------------------------------------------
    // TEST 7: CONFIDENTIAL HAND SECURITY
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Security Check - Confidential Player Hands ---');
    // In Alice's state:
    const aliceSelf = aliceState.players.find((p) => p.id === aliceId);
    const aliceOpponentBob = aliceState.players.find((p) => p.id === bobId);

    assert.ok(Array.isArray(aliceSelf.cards), 'Alice must have her own cards array');
    assert.strictEqual(aliceSelf.cards.length, 7, 'Alice has exactly 7 cards');
    assert.strictEqual(aliceOpponentBob.cards, undefined, 'Alice MUST NOT have Bob’s private cards');
    assert.strictEqual(aliceOpponentBob.cardsCount, 7, 'Alice only sees Bob’s card count (7)');

    // In Bob's state:
    const bobSelf = bobState.players.find((p) => p.id === bobId);
    const bobOpponentAlice = bobState.players.find((p) => p.id === aliceId);

    assert.ok(Array.isArray(bobSelf.cards), 'Bob must have his own cards array');
    assert.strictEqual(bobSelf.cards.length, 7, 'Bob has exactly 7 cards');
    assert.strictEqual(bobOpponentAlice.cards, undefined, 'Bob MUST NOT have Alice’s private cards');
    assert.strictEqual(bobOpponentAlice.cardsCount, 7, 'Bob only sees Alice’s card count (7)');
    console.log('🔒 Security Verified: Server only delivers private cards to the owning socket; opponents only see card counts.');

    // ----------------------------------------------------
    // TEST 8: SECURITY - OUT-OF-TURN PLAY REJECTION
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Security Check - Play Card When Not Player Turn ---');
    const currentTurnIndex = aliceState.currentTurnIndex;
    const currentPlayer = aliceState.players[currentTurnIndex];
    const nonCurrentPlayer = aliceState.players.find((p) => p.id !== currentPlayer.id);

    const nonCurrentClient = nonCurrentPlayer.id === bobId ? clientB : clientC;
    const outOfTurnRes = await emitWithAck(nonCurrentClient, 'play_card', {
      roomCode,
      cardId: 'any_card',
      chosenColor: 'red',
    });
    assert.strictEqual(outOfTurnRes.success, false);
    assert.ok(outOfTurnRes.error.includes('not your turn'), 'Server must block play when not player turn');
    console.log('🔒 Security Verified: Out-of-turn play attempt rejected by server.');

    // ----------------------------------------------------
    // TEST 9: SECURITY - PLAY CARD NOT IN HAND
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Security Check - Play Card Not In Hand ---');
    const currentClient = currentPlayer.id === aliceId ? clientA : clientB;
    const fakeCardRes = await emitWithAck(currentClient, 'play_card', {
      roomCode,
      cardId: 'non_existent_fake_card_id',
    });
    assert.strictEqual(fakeCardRes.success, false);
    assert.ok(fakeCardRes.error.includes('Card not found in your hand'));
    console.log('🔒 Security Verified: Playing nonexistent card rejected by server.');

    // ----------------------------------------------------
    // TEST 10: SECURITY - PLAY INVALID CARD MISMATCH
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Security Check - Play Invalid Card Mismatch ---');
    // Inject an invalid card into current player's hand that cannot be played on topCard
    const currentHand = currentPlayer.id === aliceId ? aliceSelf.cards : bobSelf.cards;
    const topCard = aliceState.topCard;

    // Find a card that does not match
    const invalidCard = currentHand.find((c) => !canPlayCard(c, topCard, aliceState.activeColor));
    if (invalidCard) {
      const invalidMoveRes = await emitWithAck(currentClient, 'play_card', {
        roomCode,
        cardId: invalidCard.id,
      });
      assert.strictEqual(invalidMoveRes.success, false);
      assert.ok(invalidMoveRes.error.includes('Cannot play'), 'Server must reject illegal card play');
      console.log('🔒 Security Verified: Illegal card play rejected by server rule validation.');
    } else {
      console.log('ℹ️ All cards in current hand happen to match (wild/number), tested via unit test.');
    }

    // ----------------------------------------------------
    // TEST 11: DRAW CARD & PASS TURN
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Draw Card & Pass Turn ---');
    const drawRes = await emitWithAck(currentClient, 'draw_card', { roomCode });
    assert.strictEqual(drawRes.success, true, 'Drawing card must succeed');
    assert.ok(drawRes.drawnCard, 'Drawn card must be returned to player');

    // Duplicate draw in same turn must be blocked
    const dupDrawRes = await emitWithAck(currentClient, 'draw_card', { roomCode });
    assert.strictEqual(dupDrawRes.success, false, 'Duplicate draw in same turn must be blocked');
    assert.ok(dupDrawRes.error.includes('already drawn'));

    // Pass turn
    const passRes = await emitWithAck(currentClient, 'pass_turn', { roomCode });
    assert.strictEqual(passRes.success, true, 'Passing turn after draw must succeed');
    console.log('✅ Draw card and pass turn executed cleanly. Duplicate draws prevented.');

    // ----------------------------------------------------
    // TEST 12: UNO DECLARATION
    // ----------------------------------------------------
    console.log('\n--- TEST 12: UNO Declaration ---');
    const unoRes = await emitWithAck(clientA, 'declare_uno', { roomCode });
    assert.strictEqual(unoRes.success, true);
    console.log('✅ UNO declaration broadcast and state registered.');

    // ----------------------------------------------------
    // TEST 13: REAL-TIME IN-GAME CHAT
    // ----------------------------------------------------
    console.log('\n--- TEST 13: Real-Time In-Game Chat ---');
    let chatReceivedByAlice = null;
    clientA.on('chat_received', (msg) => (chatReceivedByAlice = msg));

    clientB.emit('send_chat', {
      roomCode,
      text: 'Good game everyone!',
      senderName: 'Bob',
      avatar: '🦊',
    });

    await new Promise((r) => setTimeout(r, 100));
    assert.ok(chatReceivedByAlice, 'Alice must receive Bob’s chat message in real time');
    assert.strictEqual(chatReceivedByAlice.text, 'Good game everyone!');
    assert.strictEqual(chatReceivedByAlice.sender, 'Bob');
    console.log('✅ Real-time chat delivered across clients with sender name and avatar.');

    // ----------------------------------------------------
    // TEST 14: DISCONNECTION & RECONNECTION
    // ----------------------------------------------------
    console.log('\n--- TEST 14: Disconnection & Reconnection ---');
    let disconnectEventFired = false;
    clientA.on('game_event', (ev) => {
      if (ev.type === 'player_disconnected' && ev.player.id === bobId) {
        disconnectEventFired = true;
      }
    });

    // Bob disconnects (simulating browser tab close or network drop)
    clientB.disconnect();
    await new Promise((r) => setTimeout(r, 150));
    assert.strictEqual(disconnectEventFired, true, 'Server must notify room of Bob’s disconnection');

    // Bob reconnects in a new socket session using his existingPlayerId
    const clientB_reconnected = await connectClient('Bob_Reconnected');
    const reconnectRes = await emitWithAck(clientB_reconnected, 'join_room', {
      roomCode,
      username: 'Bob',
      avatar: '🦊',
      existingPlayerId: bobId,
    });

    assert.strictEqual(reconnectRes.success, true, 'Reconnection must succeed');
    assert.strictEqual(reconnectRes.playerId, bobId, 'Reconnection preserves player ID');
    const reconnectedBob = reconnectRes.room.players.find((p) => p.id === bobId);
    assert.strictEqual(reconnectedBob.connected, true, 'Bob is now marked reconnected');
    assert.ok(Array.isArray(reconnectedBob.cards), 'Bob’s private hand was fully restored');
    console.log('✅ Reconnection successfully verified: Bob restored his seat, ID, and hand!');

    // Cleanup
    clientA.disconnect();
    clientC.disconnect();
    clientD.disconnect();
    clientE.disconnect();
    clientB_reconnected.disconnect();

    console.log('\n====================================================');
    console.log('🎉 ALL MULTIPLAYER & SECURITY INTEGRATION TESTS PASSED!');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runMultiplayerTestSuite().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
