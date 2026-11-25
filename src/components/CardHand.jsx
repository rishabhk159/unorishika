import React from 'react';
import UnoCard from './UnoCard';

export default function CardHand({
  cards = [],
  topCard,
  activeColor,
  isMyTurn,
  onPlayCard,
  isValidMove,
}) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hand fan display */}
      <div className="w-full max-w-4xl px-2 py-3 overflow-x-auto no-scrollbar flex items-center justify-center min-h-[160px] sm:min-h-[190px]">
        <div className="flex items-center justify-center -space-x-8 sm:-space-x-10 hover:-space-x-4 transition-all duration-300 py-4 px-8">
          {cards.map((card, index) => {
            const playable = isMyTurn && isValidMove(card, topCard, activeColor);
            // Slight tilt fan calculation
            const centerOffset = index - (cards.length - 1) / 2;
            const rotation = centerOffset * 2.5;

            return (
              <div
                key={card.id || index}
                className="transform transition-all duration-200 hover:z-30 hover:scale-110 -translate-y-0"
              >
                <UnoCard
                  card={card}
                  isPlayable={playable}
                  disabled={!isMyTurn || !playable}
                  size="md"
                  rotate={rotation}
                  onClick={() => onPlayCard(card)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
