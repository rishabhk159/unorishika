import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, LogIn, User, Trophy, Shield, Sparkles, BookOpen, Check, Play, Edit3, Flame, RotateCcw } from 'lucide-react';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import { getPlayerProfile, savePlayerProfile, getPlayerStats, AVATARS } from '../services/storage';
import { socketService } from '../services/socketService';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function DashboardPage({ onOpenRules }) {
  const navigate = useNavigate();
  const { playClick, playError } = useSoundEffects();

  const [profile, setProfile] = useState(getPlayerProfile());
  const [stats, setStats] = useState(getPlayerStats());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinModalCode, setJoinModalCode] = useState('');
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    playClick();

    const updated = {
      ...profile,
      username: usernameInput.trim(),
      avatar: selectedAvatar,
    };
    savePlayerProfile(updated);
    setProfile(updated);
    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleQuickPlay = async () => {
    playClick();
    try {
      // Create room and add bot players for instant test match
      const room = await socketService.createRoom({
        username: profile.username || 'You',
        avatar: profile.avatar || '🔥',
        maxPlayers: 4,
      });

      // Add bots for immediate play
      socketService.addBotPlayer(room.code);
      socketService.addBotPlayer(room.code);
      socketService.addBotPlayer(room.code);

      navigate(`/game/${room.code}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickJoinSubmit = (e) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) return;
    setJoinModalCode(quickCodeInput.trim().toUpperCase());
    setIsJoinModalOpen(true);
  };

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/60 via-slate-900 to-blue-950/60 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2 border-yellow-300">
              {profile.avatar}
            </div>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="absolute -bottom-1 -right-1 p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-full border border-slate-600 shadow"
              title="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                {profile.username}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold uppercase tracking-wider">
                {profile.title || 'UNO Challenger'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Level {profile.level || 1} • {stats.wins} Wins • {stats.gamesPlayed} Matches Played
            </p>
          </div>
        </div>

        {/* Quick Launch Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleQuickPlay}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            Instant Play (Solo/Bots)
          </button>
        </div>
      </div>

      {/* Main Grid: Create Room, Join Room, Profile Edit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Create & Join Rooms */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Create Room Card */}
            <div className="glass-card rounded-3xl p-6 border border-slate-700/80 shadow-xl flex flex-col justify-between space-y-6 hover:border-yellow-400/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white font-display">Create Room</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start a new private game room. A unique 6-character code will be generated for your friends.
                </p>
              </div>

              <button
                onClick={() => {
                  playClick();
                  setIsCreateModalOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:brightness-110 text-white font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Room
              </button>
            </div>

            {/* Join Room Card */}
            <div className="glass-card rounded-3xl p-6 border border-slate-700/80 shadow-xl flex flex-col justify-between space-y-6 hover:border-blue-400/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white font-display">Join Existing Room</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Have a friend who already created a room? Enter their 6-character room code below.
                </p>

                <form onSubmit={handleQuickJoinSubmit} className="space-y-3 pt-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={quickCodeInput}
                    onChange={(e) => setQuickCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter 6-Char Code (e.g. 7X9A2K)"
                    className="w-full bg-slate-900 border border-slate-700 text-yellow-400 font-mono font-bold tracking-widest px-4 py-3 rounded-xl focus:outline-none focus:border-yellow-400 uppercase text-center placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal text-sm"
                  />
                  <button
                    type="submit"
                    disabled={quickCodeInput.length < 4}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Enter Game Lobby
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Player Statistics Showcase */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Player Statistics & Records
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">Matches</span>
                <span className="text-2xl font-black text-white font-display">
                  {stats.gamesPlayed}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">Victories</span>
                <span className="text-2xl font-black text-emerald-400 font-display">
                  {stats.wins}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">Win Rate</span>
                <span className="text-2xl font-black text-yellow-400 font-display">
                  {winRate}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
                <span className="text-xs text-slate-400 block mb-1">UNO Shouts</span>
                <span className="text-2xl font-black text-red-400 font-display">
                  {stats.unoCalls}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Player Profile Customizer & Rules Quick Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card / Editor */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-yellow-400" />
                Player Profile
              </h3>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">
                  Display Username
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-bold px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400 text-sm"
                  placeholder="Your player name"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">
                  Choose Avatar Emoji
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setSelectedAvatar(av.emoji);
                      }}
                      className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all border ${
                        selectedAvatar === av.emoji
                          ? 'bg-yellow-400/20 border-yellow-400 scale-105 shadow-md'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Quick Rules Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Game Instructions
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Each player starts with 7 cards.</li>
              <li>Match top card by Color, Number, or Symbol.</li>
              <li>Draw 1 card when you have no valid plays.</li>
              <li>Press UNO button when down to 1 card!</li>
            </ul>

            <button
              onClick={onOpenRules}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-yellow-400 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View Full Rules & Cards
            </button>
          </div>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* JOIN ROOM MODAL */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        initialCode={joinModalCode}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
