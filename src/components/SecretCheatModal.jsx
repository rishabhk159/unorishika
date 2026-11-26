import React, { useState, useEffect, useRef } from 'react';
import { X, Flame, Sparkles, AlertTriangle, CheckCircle2, Lock, Zap } from 'lucide-react';
import { socketService } from '../services/socketService';
import { soundManager } from '../services/soundManager';

export default function SecretCheatModal({ isOpen, onClose, currentRoomCode }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setSuccessResult(null);
      setLoading(false);
      // Auto-focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return; // Prevent duplicate requests
    if (!code.trim()) {
      setError('Please enter a secret cheat code.');
      soundManager.playError();
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Determine effective room code (from prop, URL, or socketService currentRoom)
      const roomCode =
        currentRoomCode ||
        socketService.currentRoom?.code ||
        (typeof window !== 'undefined'
          ? window.location.pathname.match(/\/game\/([A-Za-z0-9]+)/)?.[1]
          : null);

      if (!roomCode) {
        throw new Error('Cheat codes can only be used during an active game. Join or create a match first!');
      }

      const result = await socketService.activateCheat(roomCode, code.trim());

      // Success
      soundManager.playFanfare();
      setSuccessResult(result);
      setLoading(false);

      // Auto close after showing success animation
      setTimeout(() => {
        onClose();
        setSuccessResult(null);
        setCode('');
      }, 1900);
    } catch (err) {
      soundManager.playError();
      setError(err.message || 'Invalid secret cheat code.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div
        className="relative w-full max-w-md rounded-3xl bg-slate-950 border-2 border-purple-500/70 shadow-[0_0_50px_rgba(168,85,247,0.4),0_0_80px_rgba(239,68,68,0.25)] p-6 sm:p-8 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Neon Glow Orbs */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-purple-600 to-indigo-600 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.5)] mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Flame className="w-7 h-7 text-red-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-300 to-pink-500 font-display">
            🔥 UNO RISHIKA SECRET MODE
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-1 font-medium">
            Enter your secret cheat code.
          </p>
        </div>

        {/* SUCCESS STATE ANIMATION */}
        {successResult ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-scale-up">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-bounce">
                {successResult.code === '1414' ? (
                  <Sparkles className="w-10 h-10 text-yellow-300" />
                ) : successResult.code === '1212' ? (
                  <Zap className="w-10 h-10 text-yellow-300" />
                ) : (
                  <Flame className="w-10 h-10 text-amber-200" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-400/50 animate-ping pointer-events-none" />
            </div>
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-red-400 tracking-wider">
                {successResult.message}
              </span>
              <p className="text-xs text-slate-300 font-semibold">
                Synchronized with game server • Applying to your hand...
              </p>
            </div>
          </div>
        ) : (
          /* FORM BODY */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Secret Passcode</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                maxLength={10}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
                placeholder="ENTER CODE"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border-2 border-purple-500/50 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-white font-mono text-center text-xl sm:text-2xl font-bold tracking-[0.25em] placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm uppercase transition"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/70 border border-red-700/60 text-red-300 text-xs font-semibold animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:via-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold uppercase tracking-wider text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validating Cheat...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Activate Cheat</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
