import React from 'react';
import UnoCard from './UnoCard';
import { Crown, Sparkles, Clock, WifiOff, Wifi } from 'lucide-react';

export default function PlayerSeat({
  player,
  isCurrentTurn,
  position = 'top',
  onCatchUno,
}) {
  const cardCount = player?.cardsCount ?? (player?.cards?.length || 0);
  const isUno = cardCount === 1;
  const isConnected = player?.connected !== false;

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-300 ${
        isCurrentTurn ? 'scale-105 z-20' : 'opacity-90 z-10'
      }`}
    >
      {/* Player Profile Card */}
      <div
        className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all duration-300 border ${
          isCurrentTurn
            ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_24px_rgba(255,222,0,0.55)] ring-2 ring-yellow-400'
            : isConnected
            ? 'bg-slate-900/85 border-slate-700/80 shadow-lg'
            : 'bg-slate-950/80 border-rose-900/60 opacity-60'
        }`}
      >
        {/* Turn Glow Indicator */}
        {isCurrentTurn && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 animate-pulse">
            <Clock className="w-2.5 h-2.5" />
            Turn
          </span>
        )}

        {/* Avatar with Online/Offline indicator */}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-lg shadow">
            {player.avatar || '👤'}
          </div>
          {player.isHost && (
            <Crown className="w-3.5 h-3.5 text-amber-400 absolute -bottom-1 -right-1 drop-shadow" />
          )}
          {/* Connection dot */}
          <span
            title={isConnected ? 'Online' : 'Disconnected'}
            className={`absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* Player Info */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white max-w-[80px] sm:max-w-[100px] truncate">
              {player.name}
            </span>
            {isUno && (
              <span className="bg-red-600 text-yellow-300 font-black italic text-[9px] px-1.5 py-0.2 rounded animate-bounce shadow">
                UNO!
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            {!isConnected && <span className="text-rose-400 font-bold">(Offline)</span>}
          </span>
        </div>
      </div>

      {/* Mini Card Fan representation */}
      <div className="flex items-center justify-center -space-x-5 mt-1.5 overflow-visible">
        {Array.from({ length: Math.min(cardCount, 6) }).map((_, i) => (
          <div
            key={i}
            className="transform transition-transform hover:-translate-y-2"
            style={{
              transform: `rotate(${(i - (Math.min(cardCount, 6) - 1) / 2) * 8}deg)`,
            }}
          >
            <UnoCard isBack size="xs" />
          </div>
        ))}
        {cardCount > 6 && (
          <span className="text-[10px] font-bold text-yellow-400 ml-3 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
            +{cardCount - 6}
          </span>
        )}
      </div>
    </div>
  );
}
