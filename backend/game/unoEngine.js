/**
 * Complete Official UNO Game Engine (Server-Side)
 * 
 * Rules supported:
 * 1. Standard 108-card deck.
 * 2. Random Fisher-Yates deck shuffle.
 * 3. 7 cards per player initial deal.
 * 4. First card on discard pile (non-Wild Draw 4).
 * 5. Matching color, number, or symbol.
 * 6. Skip, Reverse (including 2-player reverse = skip).
 * 7. Draw Two (+2).
 * 8. Wild (color choice).
 * 9. Wild Draw Four (+4) with official Challenge Rule.
 * 10. Draw from deck when no playable cards exist.
 * 11. Reshuffle discard pile when draw deck empties.
 * 12. UNO declaration & catch vulnerability penalty (draw 2).
 * 13. Automatic winner detection and scoring.
 */

export const CARD_COLORS = ['red', 'blue', 'green', 'yellow'];
export const SPECIAL_TYPES = ['skip', 'reverse', 'draw2'];
export const WILD_TYPES = ['wild', 'wild4'];

/**
 * 1. Generate Standard 108-card UNO Deck
 */
export function generateDeck() {
  const deck = [];
  let idCounter = 1;

  CARD_COLORS.forEach((color) => {
    // One 0 card per color (4 cards total)
    deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: 0 });

    // Two each of 1-9 per color (2 * 9 * 4 = 72 cards)
    for (let num = 1; num <= 9; num++) {
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: num });
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: num });
    }

    // Two each of action cards per color (2 * 3 * 4 = 24 cards)
    SPECIAL_TYPES.forEach((type) => {
      deck.push({ id: `c-${idCounter++}`, color, type, value: type });
      deck.push({ id: `c-${idCounter++}`, color, type, value: type });
    });
  });

  // Four Wild cards (4 cards)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'wild', type: 'wild', value: 'wild' });
  }

  // Four Wild Draw Four cards (4 cards)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'wild', type: 'wild4', value: 'wild4' });
  }

  return shuffleDeck(deck);
}

/**
 * 2. Fisher-Yates Random Shuffle
 */
export function shuffleDeck(cards) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 3. Draw Cards with Automatic Reshuffle of Discard Pile
 */
export function drawCardsFromDeck(gameState, count = 1) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    if (gameState.deck.length === 0) {
      reshuffleDiscardIntoDeck(gameState);
    }
    if (gameState.deck.length > 0) {
      drawn.push(gameState.deck.pop());
    }
  }
  return drawn;
}

export function reshuffleDiscardIntoDeck(gameState) {
  if (gameState.discardPile.length <= 1) {
    return; // No cards to reshuffle
  }
  // Keep the current top card on discard pile
  const top = gameState.discardPile.pop();
  const eligibleCards = gameState.discardPile.map((c) => {
    // Reset any chosenColor metadata
    const { chosenColor, ...rest } = c;
    return rest;
  });
  gameState.deck = shuffleDeck(eligibleCards);
  gameState.discardPile = [top];
}

/**
 * 4. Card Validation Rules
 */
export function canPlayCard(card, topCard, activeColor) {
  if (!card || !topCard) return false;

  // Wild cards can always be played
  if (card.color === 'wild') return true;

  // Check matching color
  const targetColor = activeColor || topCard.chosenColor || topCard.color;
  if (card.color === targetColor) return true;

  // Check matching number
  if (card.type === 'number' && topCard.type === 'number') {
    return card.value === topCard.value;
  }

  // Check matching action symbol (e.g. skip on skip)
  if (card.type !== 'number' && card.type === topCard.type) {
    return true;
  }

  return false;
}

/**
 * Check if a player has any cards matching a specific color
 * Used for the official Wild Draw Four challenge rule
 */
export function playerHasColor(hand, targetColor) {
  if (!targetColor || targetColor === 'wild') return false;
  return hand.some((c) => c.color === targetColor);
}

/**
 * 5. Initialize New Game State
 */
export function initGame(players) {
  const deck = generateDeck();

  // Deal 7 cards to each player
  const playerStates = players.map((p) => {
    const hand = deck.splice(0, 7);
    return {
      ...p,
      cards: hand,
      declaredUno: false,
      unoVulnerable: false,
    };
  });

  // Flip valid starting card (cannot start with Wild Draw 4)
  let initialIndex = deck.findIndex((c) => c.type !== 'wild4');
  if (initialIndex === -1) initialIndex = 0;
  const initialTopCard = deck.splice(initialIndex, 1)[0];

  const gameState = {
    players: playerStates,
    deck,
    discardPile: [initialTopCard],
    topCard: initialTopCard,
    activeColor: initialTopCard.color === 'wild' ? 'red' : initialTopCard.color,
    currentTurnIndex: 0,
    turnDirection: 1, // 1 = clockwise, -1 = counter-clockwise
    hasDrawnThisTurn: false,
    pendingChallenge: null, // For Wild Draw Four challenge
    winner: null,
    status: 'playing',
    actionLog: [],
  };

  // Handle Action card effects on initial flip
  handleInitialCardEffect(gameState, initialTopCard);

  return gameState;
}

function handleInitialCardEffect(gameState, card) {
  const numPlayers = gameState.players.length;
  if (card.type === 'skip') {
    gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % numPlayers;
    gameState.actionLog.push(`Initial card was Skip: ${gameState.players[0].name} skipped!`);
  } else if (card.type === 'reverse') {
    gameState.turnDirection = -1;
    if (numPlayers === 2) {
      gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % numPlayers;
    } else {
      gameState.currentTurnIndex = (numPlayers - 1);
    }
    gameState.actionLog.push(`Initial card was Reverse: Direction reversed!`);
  } else if (card.type === 'draw2') {
    const firstPlayer = gameState.players[0];
    const drawn = drawCardsFromDeck(gameState, 2);
    firstPlayer.cards.push(...drawn);
    gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % numPlayers;
    gameState.actionLog.push(`Initial card was Draw Two: ${firstPlayer.name} drew 2 and skipped!`);
  } else if (card.type === 'wild') {
    gameState.actionLog.push(`Initial card was Wild: Active color defaulted to RED.`);
  }
}

/**
 * 6. Execute Playing a Card (Server Validated)
 */
export function playCard(gameState, playerId, cardId, chosenColor) {
  if (gameState.status !== 'playing') {
    throw new Error('Game is not currently active.');
  }

  // Check if there is an unresolved challenge
  if (gameState.pendingChallenge) {
    throw new Error('You must resolve the Wild Draw Four challenge first.');
  }

  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error('It is not your turn.');
  }

  const cardIndex = currentPlayer.cards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error('Card not found in your hand.');
  }

  const cardToPlay = currentPlayer.cards[cardIndex];

  // Validate play move against top card & active color
  if (!canPlayCard(cardToPlay, gameState.topCard, gameState.activeColor)) {
    throw new Error(`Cannot play ${cardToPlay.color} ${cardToPlay.value} on ${gameState.activeColor} ${gameState.topCard.value}.`);
  }

  // Validate chosen color for Wild cards
  let finalColor = cardToPlay.color;
  if (cardToPlay.color === 'wild') {
    if (!chosenColor || !CARD_COLORS.includes(chosenColor.toLowerCase())) {
      throw new Error('Please choose a valid color (red, blue, green, or yellow).');
    }
    finalColor = chosenColor.toLowerCase();
  }

  // Check official rule legality for Wild Draw Four
  let isWild4Legal = true;
  if (cardToPlay.type === 'wild4') {
    // Player may only play wild4 if they have no matching color cards
    const matchingColor = gameState.activeColor || gameState.topCard.color;
    const handWithoutCard = currentPlayer.cards.filter((c) => c.id !== cardId);
    isWild4Legal = !playerHasColor(handWithoutCard, matchingColor);
  }

  // Remove card from player hand
  currentPlayer.cards.splice(cardIndex, 1);

  // Check UNO declaration vulnerability
  if (currentPlayer.cards.length === 1) {
    if (!currentPlayer.declaredUno) {
      currentPlayer.unoVulnerable = true;
    }
  } else {
    currentPlayer.declaredUno = false;
    currentPlayer.unoVulnerable = false;
  }

  // Place on discard pile
  const playedCardWithMetadata = { ...cardToPlay, chosenColor: finalColor };
  gameState.discardPile.push(playedCardWithMetadata);
  gameState.topCard = playedCardWithMetadata;
  gameState.activeColor = finalColor;
  gameState.hasDrawnThisTurn = false;

  gameState.actionLog.push(
    `${currentPlayer.name} played ${cardToPlay.color === 'wild' ? 'WILD' : cardToPlay.color.toUpperCase()} ${cardToPlay.value}`
  );

  // Check for Winner
  if (currentPlayer.cards.length === 0) {
    gameState.winner = currentPlayer;
    gameState.status = 'ended';
    gameState.actionLog.push(`🏆 ${currentPlayer.name} has no cards left and WINS the game!`);
    return {
      gameState,
      winner: currentPlayer,
      score: calculateScore(gameState, currentPlayer.id),
    };
  }

  // Process Action Cards Effects
  processActionCardEffects(gameState, cardToPlay, finalColor, isWild4Legal);

  return { gameState, winner: null };
}

/**
 * 7. Action Card Rules Processor
 */
function processActionCardEffects(gameState, card, finalColor, isWild4Legal) {
  const numPlayers = gameState.players.length;

  if (card.type === 'reverse') {
    gameState.turnDirection *= -1;
    gameState.actionLog.push(`Direction reversed!`);
    if (numPlayers === 2) {
      // In 2-player UNO, Reverse functions like a Skip!
      advanceTurn(gameState, 2);
    } else {
      advanceTurn(gameState, 1);
    }
  } else if (card.type === 'skip') {
    const skippedPlayerIndex = getNextPlayerIndex(gameState, 1);
    gameState.actionLog.push(`${gameState.players[skippedPlayerIndex].name} was SKIPPED!`);
    advanceTurn(gameState, 2);
  } else if (card.type === 'draw2') {
    const targetPlayerIndex = getNextPlayerIndex(gameState, 1);
    const targetPlayer = gameState.players[targetPlayerIndex];
    const drawn = drawCardsFromDeck(gameState, 2);
    targetPlayer.cards.push(...drawn);
    gameState.actionLog.push(`${targetPlayer.name} drew 2 cards and was skipped!`);
    advanceTurn(gameState, 2);
  } else if (card.type === 'wild4') {
    const targetPlayerIndex = getNextPlayerIndex(gameState, 1);
    const targetPlayer = gameState.players[targetPlayerIndex];

    // Setup Challenge Opportunity for the next player
    gameState.pendingChallenge = {
      playedBy: gameState.players[gameState.currentTurnIndex].id,
      targetPlayerId: targetPlayer.id,
      isLegal: isWild4Legal,
      targetPlayerIndex,
    };
    gameState.actionLog.push(
      `${targetPlayer.name} faces Wild Draw Four! May challenge or accept.`
    );
    // Note: Turn moves to targetPlayer so they can challenge or accept
    gameState.currentTurnIndex = targetPlayerIndex;
  } else {
    // Normal card or standard Wild: advance by 1
    advanceTurn(gameState, 1);
  }
}

/**
 * 8. Challenge Rule for Wild Draw Four
 * Next player can either Challenge or Accept
 */
export function resolveWildDrawFourChallenge(gameState, challengerId, chooseToChallenge) {
  const challenge = gameState.pendingChallenge;
  if (!challenge) {
    throw new Error('No pending Wild Draw Four challenge to resolve.');
  }

  if (challenge.targetPlayerId !== challengerId) {
    throw new Error('Only the targeted player may resolve the challenge.');
  }

  const challenger = gameState.players.find((p) => p.id === challengerId);
  const playedByPlayer = gameState.players.find((p) => p.id === challenge.playedBy);

  if (!chooseToChallenge) {
    // Accept: Challenger simply draws 4 cards and loses their turn
    const drawn = drawCardsFromDeck(gameState, 4);
    challenger.cards.push(...drawn);
    gameState.actionLog.push(`${challenger.name} accepted the +4 and drew 4 cards.`);
    gameState.pendingChallenge = null;
    advanceTurn(gameState, 1);
    return { outcome: 'accepted', cardsDrawn: 4, penalizedPlayer: challenger.name };
  }

  // Challenged! Check if player was legal or guilty
  if (!challenge.isLegal) {
    // GUILTY! The player who played the Wild Draw 4 held a card matching the color!
    // Penalty: Played-by player draws 4 cards instead.
    const drawn = drawCardsFromDeck(gameState, 4);
    playedByPlayer.cards.push(...drawn);
    gameState.actionLog.push(
      `CHALLENGE SUCCEEDED! ${playedByPlayer.name} was guilty of having matching color! ${playedByPlayer.name} drew 4 cards!`
    );
    gameState.pendingChallenge = null;
    // Challenger does NOT lose turn; challenger plays now
    return { outcome: 'guilty', cardsDrawn: 4, penalizedPlayer: playedByPlayer.name };
  } else {
    // INNOCENT! Player legally had no matching color card.
    // Penalty: Challenger must draw 6 cards (4 + 2 penalty) and lose turn!
    const drawn = drawCardsFromDeck(gameState, 6);
    challenger.cards.push(...drawn);
    gameState.actionLog.push(
      `CHALLENGE FAILED! ${playedByPlayer.name} was innocent! ${challenger.name} drew 6 cards and was skipped!`
    );
    gameState.pendingChallenge = null;
    advanceTurn(gameState, 1);
    return { outcome: 'innocent', cardsDrawn: 6, penalizedPlayer: challenger.name };
  }
}

/**
 * 9. Draw Card when Player Cannot (or Chooses not to) Play
 */
export function playerDrawCard(gameState, playerId) {
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error('It is not your turn.');
  }
  if (gameState.hasDrawnThisTurn) {
    throw new Error('You have already drawn a card this turn.');
  }

  const [drawnCard] = drawCardsFromDeck(gameState, 1);
  if (!drawnCard) {
    throw new Error('No cards remaining in deck.');
  }

  currentPlayer.cards.push(drawnCard);
  gameState.hasDrawnThisTurn = true;
  currentPlayer.unoVulnerable = false; // Reset if they had 1 card and drew

  gameState.actionLog.push(`${currentPlayer.name} drew a card.`);

  // Return whether the drawn card can be played immediately
  const isPlayable = canPlayCard(drawnCard, gameState.topCard, gameState.activeColor);

  return { drawnCard, isPlayable };
}

/**
 * 10. Pass Turn after Drawing
 */
export function playerPassTurn(gameState, playerId) {
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error('It is not your turn.');
  }
  if (!gameState.hasDrawnThisTurn) {
    throw new Error('You must draw a card before you can pass your turn.');
  }

  gameState.hasDrawnThisTurn = false;
  gameState.actionLog.push(`${currentPlayer.name} passed their turn.`);
  advanceTurn(gameState, 1);
}

/**
 * 11. Declare UNO Rule
 */
export function declareUno(gameState, playerId) {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found.');

  player.declaredUno = true;
  player.unoVulnerable = false;
  gameState.actionLog.push(`🔥 ${player.name} SHOUTED UNO! 🔥`);
  return true;
}

/**
 * 12. Catch a Player who forgot to say UNO (Draw 2 penalty)
 */
export function catchUnoFailure(gameState, callerId, targetPlayerId) {
  const target = gameState.players.find((p) => p.id === targetPlayerId);
  const caller = gameState.players.find((p) => p.id === callerId);

  if (!target || !caller) throw new Error('Player not found.');

  if (target.cards.length === 1 && target.unoVulnerable) {
    const drawn = drawCardsFromDeck(gameState, 2);
    target.cards.push(...drawn);
    target.unoVulnerable = false;
    target.declaredUno = false;
    gameState.actionLog.push(
      `🚨 ${caller.name} caught ${target.name} not declaring UNO! ${target.name} drew 2 penalty cards!`
    );
    return { caught: true, targetName: target.name };
  }

  return { caught: false };
}

/**
 * Helper: Advance Turn
 */
export function advanceTurn(gameState, step = 1) {
  const numPlayers = gameState.players.length;
  gameState.currentTurnIndex = getNextPlayerIndex(gameState, step);
  gameState.hasDrawnThisTurn = false;
}

export function getNextPlayerIndex(gameState, step = 1) {
  const numPlayers = gameState.players.length;
  const delta = (step * gameState.turnDirection);
  return (gameState.currentTurnIndex + delta + numPlayers * 10) % numPlayers;
}

/**
 * Calculate Score based on remaining cards in opponent hands
 */
export function calculateScore(gameState, winnerId) {
  let score = 0;
  gameState.players.forEach((p) => {
    if (p.id !== winnerId && p.cards) {
      p.cards.forEach((c) => {
        if (c.type === 'number') {
          score += c.value;
        } else if (SPECIAL_TYPES.includes(c.type)) {
          score += 20; // Skip, Reverse, Draw 2 = 20 pts each
        } else if (WILD_TYPES.includes(c.type)) {
          score += 50; // Wild, Wild Draw 4 = 50 pts each
        }
      });
    }
  });
  return score;
}

/**
 * UNO RISHIKA SECRET CHEAT MODE Engine Logic
 * 
 * Codes:
 * - '2420': Gives 4 additional normal playable UNO cards.
 * - '1414': Gives 1 Wild card (allows Red, Blue, Green, Yellow selection).
 * - '1212': Gives 1 Draw Two card (random color from Red, Blue, Green, Yellow).
 */
export function generateNormalUnoCard() {
  const color = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
  const isSpecial = Math.random() < 0.25; // 25% chance of action card (skip/reverse/draw2)
  if (isSpecial) {
    const specialType = SPECIAL_TYPES[Math.floor(Math.random() * SPECIAL_TYPES.length)];
    return {
      id: `c-cheat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      color,
      type: specialType,
      value: specialType,
    };
  }
  const numValue = Math.floor(Math.random() * 10);
  return {
    id: `c-cheat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    color,
    type: 'number',
    value: numValue,
  };
}

export function applyCheatCode(gameState, playerId, cheatCode) {
  if (!gameState || !gameState.players) {
    throw new Error('Game is not currently active.');
  }

  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in active game.');
  }

  const codeStr = String(cheatCode).trim();
  let feedbackMessage = '';
  const newCards = [];

  if (codeStr === '2420') {
    // Code 2420: 4 additional normal playable UNO cards
    for (let i = 0; i < 4; i++) {
      newCards.push(generateNormalUnoCard());
    }
    feedbackMessage = '🔥 +4 CARDS UNLOCKED!';
  } else if (codeStr === '1414') {
    // Code 1414: 1 Wild card
    newCards.push({
      id: `c-cheat-wild-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      color: 'wild',
      type: 'wild',
      value: 'wild',
    });
    feedbackMessage = '🌈 WILD CARD UNLOCKED!';
  } else if (codeStr === '1212') {
    // Code 1212: 1 Draw Two card with random color
    const randomColor = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
    newCards.push({
      id: `c-cheat-draw2-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      color: randomColor,
      type: 'draw2',
      value: 'draw2',
    });
    feedbackMessage = '⚡ DRAW TWO CARD UNLOCKED!';
  } else {
    throw new Error('Invalid secret cheat code.');
  }

  // Add cards to player hand
  player.cards.push(...newCards);

  // If player was at 1 card, reset UNO declaration/vulnerability
  if (player.cards.length > 1) {
    player.declaredUno = false;
    player.unoVulnerable = false;
  }

  // Record cheat activation in game state
  if (!gameState.cheatsUsed) {
    gameState.cheatsUsed = [];
  }
  gameState.cheatsUsed.push({
    playerId,
    playerName: player.name,
    code: codeStr,
    cardsCount: newCards.length,
    timestamp: Date.now(),
  });

  return {
    success: true,
    code: codeStr,
    message: feedbackMessage,
    cardsAdded: newCards.length,
    newCards,
  };
}

