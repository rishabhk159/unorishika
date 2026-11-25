import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Star, Award, Users, Eye, Sparkles, Crown } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function ScoreboardModal({
  isOpen,
  winner,
  players = [],
  scoreboard = {},
  roundsPlayed = 1,
  isHost = false,
  onPlayAgain,
  onLeave,
}) {
  const { playWin, playClick } = useSoundEffects();
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMinimized(false);
      playWin();
      try {
        // Multi-stage confetti blast
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7, x: 0.3 } });
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7, x: 0.7 } });
        }, 200);
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sorted scoreboard ranks (by wins, then points)
  const scoreboardList = Object.values(scoreboard || {}).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.score - a.score;
  });

  // If minimized to let player inspect table
  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl animate-bounce"
        >
          <Trophy className="w-4 h-4" />
          Show Scoreboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-yellow-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,222,0,0.3)] text-center space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Trophy & Winner Announcement */}
        <div className="relative flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-xl animate-bounce">
            <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
            <Crown className="w-6 h-6 text-amber-900 absolute -top-3 -right-2 drop-shadow" />
          </div>

          <span className="text-xs font-black tracking-widest uppercase px-3.5 py-1 bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/40 mt-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ROUND {roundsPlayed} CHAMPION
          </span>

          <h2 className="text-3xl font-black text-white mt-1.5 font-display">
            {winner?.name || 'Winner'} Won!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Successfully discarded all cards and conquered Round {roundsPlayed}!
          </p>
        </div>

        {/* Room Cumulative Leaderboard */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-400" />
              Room Scoreboard ({roundsPlayed} {roundsPlayed === 1 ? 'Round' : 'Rounds'} Played)
            </span>
            <span>Wins / Points</span>
          </div>

          <div className="space-y-2">
            {scoreboardList.map((entry, idx) => {
              const isWinner = entry.name === winner?.name;
              return (
                <div
                  key={entry.id || idx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isWinner
                      ? 'bg-yellow-500/15 border-yellow-500/50 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm w-5 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="text-xl">{entry.avatar || '🎮'}</span>
                    <div className="text-left">
                      <span className="font-bold text-sm block">
                        {entry.name}
                      </span>
                      {isWinner && (
                        <span className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider">
                          Round Winner
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-white">
                      {entry.wins} {entry.wins === 1 ? 'Win' : 'Wins'}
                    </div>
                    <span className="text-[11px] font-bold text-yellow-400">
                      {entry.score} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => {
              playClick();
              setMinimized(true);
            }}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700"
          >
            <Eye className="w-4 h-4" />
            Inspect Table
          </button>

          <button
            onClick={() => {
              playClick();
              onLeave();
            }}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700"
          >
            <Home className="w-4 h-4" />
            Exit Room
          </button>

          {isHost ? (
            <button
              onClick={() => {
                playClick();
                onPlayAgain();
              }}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg animate-pulse"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          ) : (
            <div className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              Waiting for host...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
