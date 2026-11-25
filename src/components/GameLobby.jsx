import React, { useState } from 'react';
import { 
  Copy, Check, Users, Play, Crown, LogOut, 
  ShieldAlert, Sparkles, Share2, UserPlus, Info, 
  CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function GameLobby({
  roomCode,
  players = [],
  isHost,
  hostName,
  maxPlayers = 4,
  onStartGame,
  onLeaveRoom,
  onAddBot,
}) {
  const [copied, setCopied] = useState(false);
  const { playClick } = useSoundEffects();

  const handleCopyCode = () => {
    playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Join my UNO RISHIKA room!',
        text: `Play UNO with me on UNO RISHIKA! Room Code: ${roomCode}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const canStart = isHost && players.length >= 2;
  const isFull = players.length >= maxPlayers;

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-7 animate-fadeIn">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Multiplayer Room Lobby
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
          Match Staging Area
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Share your room code with friends. Minimum 2 players required to start!
        </p>
      </div>

      {/* Prominent Room Code Banner with Copy & Share */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border-2 border-dashed border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Room Code (Share with Friends)
          </span>
          <span className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-widest font-mono">
            {roomCode}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyCode}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs transition active:scale-95 shadow"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            title="Share Room link"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-bold text-xs transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Settings & Room Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
          <span className="text-white font-bold">{players.length} / {maxPlayers} Players</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Minimum to Start</span>
          <span className="text-yellow-400 font-bold">2 Players Required</span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Room Host</span>
          <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            {hostName || 'Host'}
          </span>
        </div>
      </div>

      {/* Players List Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            Connected Players ({players.length}/{maxPlayers})
          </span>
          <span className={players.length >= 2 ? 'text-emerald-400' : 'text-amber-400'}>
            {players.length >= 2 ? 'Ready to Start' : 'Waiting for Players...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p, index) => (
            <div
              key={p.id || index}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                p.isHost
                  ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shadow">
                  {p.avatar || '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">
                      {p.name} {p.isSelf ? '(You)' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {p.isBot ? 'Bot Player (Ready)' : 'Connected & Ready'}
                  </span>
                </div>
              </div>

              {p.isHost && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                  <Crown className="w-3 h-3 text-amber-400" />
                  Host
                </span>
              )}
            </div>
          ))}

          {/* Empty player slots */}
          {Array.from({ length: Math.max(maxPlayers - players.length, 0) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-3.5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-center text-slate-500 text-xs font-semibold gap-2"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              Empty Slot (Invite Friend)
            </div>
          ))}
        </div>
      </div>

      {/* Host Helper: Add Test Bot Option */}
      {isHost && !isFull && onAddBot && (
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Testing alone or need another opponent?
          </span>
          <button
            onClick={() => {
              playClick();
              onAddBot();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 font-bold transition flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Add Test Bot
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => {
            playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition border border-slate-700"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          Leave Room
        </button>

        {isHost ? (
          <div className="w-full sm:w-auto flex-1 flex flex-col items-center sm:items-end gap-1">
            <button
              onClick={() => {
                playClick();
                onStartGame();
              }}
              disabled={!canStart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2 ${
                canStart
                  ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {canStart ? 'Start UNO Match!' : 'Need at least 2 Players to Start'}
            </button>
            {!canStart && (
              <span className="text-[11px] text-amber-400/90 font-medium">
                Waiting for at least 1 more player to join
              </span>
            )}
          </div>
        ) : (
          <div className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
            Waiting for {hostName || 'Host'} to start the game...
          </div>
        )}
      </div>
    </div>
  );
}
