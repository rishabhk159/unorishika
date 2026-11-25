// UNO Game Engine & Card Logic (Classic Rules)

export const CARD_COLORS = ['red', 'blue', 'green', 'yellow'];
export const SPECIAL_TYPES = ['skip', 'reverse', 'draw2'];
export const WILD_TYPES = ['wild', 'wild4'];

// Generates standard 108 UNO cards
export function generateDeck() {
  const deck = [];
  let idCounter = 1;

  CARD_COLORS.forEach((color) => {
    // One 0 card per color
    deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: 0 });

    // Two of each 1-9
    for (let num = 1; num <= 9; num++) {
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: num });
      deck.push({ id: `c-${idCounter++}`, color, type: 'number', value: num });
    }

    // Two of each action card
    SPECIAL_TYPES.forEach((type) => {
      deck.push({ id: `c-${idCounter++}`, color, type, value: type });
      deck.push({ id: `c-${idCounter++}`, color, type, value: type });
    });
  });

  // Four Wild and Four Wild Draw 4
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'wild', type: 'wild', value: 'wild' });
    deck.push({ id: `c-${idCounter++}`, color: 'wild', type: 'wild4', value: 'wild4' });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(cards) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if a card can be played onto current top card and active color
export function isValidMove(card, topCard, activeColor) {
  if (!card || !topCard) return false;

  // Wild cards can always be played
  if (card.color === 'wild') return true;

  // Matches the chosen color or current top card color
  const targetColor = activeColor || topCard.chosenColor || topCard.color;
  if (card.color === targetColor) return true;

  // Matches the number or action type
  if (card.type === 'number' && topCard.type === 'number') {
    return card.value === topCard.value;
  }

  // Matches special action symbol (e.g. skip on skip)
  if (card.type !== 'number' && card.type === topCard.type) {
    return true;
  }

  return false;
}

// Helper to format room code
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
