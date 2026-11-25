import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, AlertCircle, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { AVATARS, getPlayerProfile, savePlayerProfile } from '../services/storage';
import { socketService } from '../services/socketService';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function JoinRoomModal({ isOpen, onClose, initialCode = '' }) {
  const navigate = useNavigate();
  const { playClick, playError } = useSoundEffects();
  const profile = getPlayerProfile();

  const [roomCode, setRoomCode] = useState(initialCode || '');
  const [username, setUsername] = useState(profile.username || 'Player');
  const [avatar, setAvatar] = useState(profile.avatar || '🦊');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCodeChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 6) {
      setRoomCode(val);
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Code validation
    if (!roomCode.trim()) {
      setErrorMessage('Please enter a 6-character room code.');
      playError();
      return;
    }

    if (roomCode.trim().length !== 6) {
      setErrorMessage('Room code must be exactly 6 characters.');
      playError();
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please enter your display username.');
      playError();
      return;
    }

    setIsSubmitting(true);
    playClick();

    try {
      // Save profile updates
      savePlayerProfile({ ...profile, username: username.trim(), avatar });

      const room = await socketService.joinRoom({
        roomCode: roomCode.trim(),
        username: username.trim(),
        avatar,
      });

      onClose();
      navigate(`/game/${room.code}`);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to join room.');
      playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">Join Existing Room</h2>
              <p className="text-xs text-slate-400">Enter code to play with friends</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleJoin} className="p-6 space-y-5">
          {/* Detailed Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-start gap-2.5 text-rose-300 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-rose-200">Room Entry Error</span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* 6-Character Room Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Room Code
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {roomCode.length}/6 characters
              </span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={handleCodeChange}
              placeholder="e.g. 7X9A2K"
              className="w-full bg-slate-950 border border-slate-700 text-yellow-400 font-mono font-black tracking-widest text-xl px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-400 uppercase text-center placeholder:text-slate-600 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Your Username
            </label>
            <input
              type="text"
              maxLength={16}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-slate-950 border border-slate-700 text-white font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
              required
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Select Your Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setAvatar(av.emoji);
                  }}
                  className={`h-11 rounded-xl flex items-center justify-center text-xl transition border ${
                    avatar === av.emoji
                      ? 'bg-blue-600/30 border-blue-400 scale-105 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || roomCode.length < 4}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            {isSubmitting ? 'Checking Room...' : 'Join Game Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
