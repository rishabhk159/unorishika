import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, PlusCircle, Copy, Check, Users, Shield, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { AVATARS, getPlayerProfile, savePlayerProfile } from '../services/storage';
import { socketService } from '../services/socketService';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function CreateRoomModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { playClick, playError } = useSoundEffects();
  const profile = getPlayerProfile();

  const [username, setUsername] = useState(profile.username || 'Player');
  const [avatar, setAvatar] = useState(profile.avatar || '🔥');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please enter your display username.');
      playError();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    playClick();

    try {
      // Save profile updates
      savePlayerProfile({ ...profile, username: username.trim(), avatar });

      const room = await socketService.createRoom({
        username: username.trim(),
        avatar,
        maxPlayers,
      });

      setCreatedRoom(room);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create room.');
      playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdRoom) return;
    playClick();
    navigator.clipboard.writeText(createdRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterLobby = () => {
    if (!createdRoom) return;
    playClick();
    onClose();
    navigate(`/game/${createdRoom.code}`);
  };

  const handleClose = () => {
    setCreatedRoom(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">Create Private Room</h2>
              <p className="text-xs text-slate-400">Generate a unique 6-character code</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {!createdRoom ? (
            /* Creation Form */
            <form onSubmit={handleCreate} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Host Username
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

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Choose Host Avatar
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
                          ? 'bg-yellow-400/20 border-yellow-400 scale-105 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Capacity Selector (2–4 Players) */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-yellow-400" />
                  Player Capacity (Game Settings)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        playClick();
                        setMaxPlayers(count);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                        maxPlayers === count
                          ? 'bg-red-600 text-white border-red-400 shadow-md font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 block mt-1.5">
                  Host + {maxPlayers - 1} invited friends. Min 2 players required to begin.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2 mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                {isSubmitting ? 'Generating Room...' : 'Create Room & Generate Code'}
              </button>
            </form>
          ) : (
            /* Room Created Successfully View */
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
                Room Successfully Created!
              </div>

              {/* Big Room Code Display */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-yellow-400/80 shadow-[0_0_30px_rgba(255,222,0,0.2)] space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Your 6-Character Room Code
                </span>
                <span className="text-4xl sm:text-5xl font-black text-yellow-400 tracking-widest font-mono select-all">
                  {createdRoom.code}
                </span>
                <p className="text-xs text-slate-400 pt-1">
                  Share this code with your friends so they can join your lobby.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" />
                      <span>Copy Room Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleEnterLobby}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg"
                >
                  <span>Go to Lobby</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
