import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, PlusCircle, LogIn, Users, Zap, Shield, Sparkles, Trophy, MessageSquare, ArrowRight, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import UnoCard from '../components/UnoCard';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function LandingPage({ onOpenRules }) {
  const navigate = useNavigate();
  const { playClick } = useSoundEffects();

  const [quickCode, setQuickCode] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinModalInitialCode, setJoinModalInitialCode] = useState('');

  const handleOpenCreate = () => {
    playClick();
    setIsCreateOpen(true);
  };

  const handleOpenJoin = (code = '') => {
    playClick();
    setJoinModalInitialCode(code);
    setIsJoinOpen(true);
  };

  const handleJoinQuick = (e) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    handleOpenJoin(quickCode.trim().toUpperCase());
  };

  const handlePlayOnline = () => {
    playClick();
    navigate('/dashboard');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                Classic Multiplayer Card Game
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display leading-[1.08]">
              UNO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500">RISHIKA</span>
            </h1>

            <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-xl mx-auto lg:mx-0">
              Play UNO with your friends online in real time.
            </p>

            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Create a private room, share your 6-digit code, and battle your friends from any device. Classic rules, action cards, wild cards, and instant UNO shouts!
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handlePlayOnline}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 group transition transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                Play Online
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleOpenCreate}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Create Room
              </button>

              <button
                onClick={() => handleOpenJoin()}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <LogIn className="w-5 h-5 text-blue-400" />
                Join Room
              </button>
            </div>

            {/* Quick Room Code Input Box */}
            <form
              onSubmit={handleJoinQuick}
              className="pt-2 max-w-md mx-auto lg:mx-0 flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-xl"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-char Room Code"
                  className="w-full bg-slate-950/70 text-yellow-400 font-mono font-bold tracking-widest px-4 py-2.5 rounded-xl border border-slate-800 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 uppercase text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={quickCode.length < 4}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-4 h-4" />
                Join Room
              </button>
            </form>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time multiplayer rooms
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 4 players per room
              </span>
            </div>
          </div>

          {/* Right Column: Interactive 3D UNO Card Cluster Showcase */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-72 h-80 sm:w-80 sm:h-96 flex items-center justify-center">
              {/* Card 1: Wild 4 (rotated left) */}
              <div className="absolute transform -rotate-12 -translate-x-12 translate-y-4 hover:rotate-0 hover:scale-110 transition-all duration-300 z-10 animate-float-slow">
                <UnoCard
                  card={{ id: 'hero-wild', color: 'wild', type: 'wild4', value: 'wild4' }}
                  size="lg"
                  isPlayable
                />
              </div>

              {/* Card 2: Red 7 (rotated center-right) */}
              <div className="absolute transform rotate-6 translate-x-8 -translate-y-6 hover:rotate-0 hover:scale-110 transition-all duration-300 z-20">
                <UnoCard
                  card={{ id: 'hero-red', color: 'red', type: 'number', value: 7 }}
                  size="lg"
                  isPlayable
                />
              </div>

              {/* Card 3: Yellow Skip (bottom right) */}
              <div className="absolute transform rotate-20 translate-x-16 translate-y-12 hover:rotate-0 hover:scale-110 transition-all duration-300 z-15">
                <UnoCard
                  card={{ id: 'hero-yellow', color: 'yellow', type: 'skip', value: 'skip' }}
                  size="md"
                />
              </div>

              {/* Card 4: Blue +2 (bottom left) */}
              <div className="absolute transform -rotate-24 -translate-x-20 translate-y-14 hover:rotate-0 hover:scale-110 transition-all duration-300 z-0 opacity-80">
                <UnoCard
                  card={{ id: 'hero-blue', color: 'blue', type: 'draw2', value: 'draw2' }}
                  size="sm"
                />
              </div>

              {/* Card 5: Green 5 (top center) */}
              <div className="absolute transform -rotate-3 -translate-y-16 hover:rotate-0 hover:scale-110 transition-all duration-300 z-5 opacity-90">
                <UnoCard
                  card={{ id: 'hero-green', color: 'green', type: 'number', value: 5 }}
                  size="md"
                />
              </div>

              {/* Central Glowing UNO Rishika Crest Badge */}
              <div className="absolute -bottom-6 z-30 bg-slate-950/90 border-2 border-yellow-400 px-5 py-2 rounded-full shadow-[0_0_20px_rgba(255,222,0,0.6)] flex items-center gap-2 animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="font-black italic text-xs uppercase tracking-wider text-yellow-400">
                  SHOUT "UNO!" TO WIN
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO PLAY SECTION */}
      <section className="w-full bg-[#0A0E17] py-20 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Easy 4-Step Rules
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
              How to Play UNO RISHIKA
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Follow official classic rules. Be the first to empty your hand to win!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative group hover:border-yellow-400/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deal & Setup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every player receives 7 cards. One card is flipped face-up in the center to form the Discard Pile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative group hover:border-yellow-400/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 flex items-center justify-center font-black text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Match Cards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Match by Color, Number, or Symbol. If you don't have a matching card, draw one from the deck.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative group hover:border-yellow-400/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Use Special Cards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop Skips, Reverses, Draw Twos, Wilds, and Wild Draw Fours to disrupt your opponents!
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 relative group hover:border-yellow-400/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                04
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Shout UNO!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you play your second-to-last card, hit the UNO button. Discard your last card to win!
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onOpenRules}
              className="inline-flex items-center gap-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 transition"
            >
              <HelpCircle className="w-4 h-4" />
              Read full official card breakdown & rules modal
            </button>
          </div>
        </div>
      </section>

      {/* GAME FEATURES SECTION */}
      <section className="w-full py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            Engineered For Fun
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
            Built for Real-Time Multiplayer
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Everything you need for seamless gaming sessions with your friends or family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Room Codes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a unique 6-character room code in one click. Share the code with your friends and start playing without login.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">2 to 4 Players</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Support for head-to-head duels or 4-player multiplayer parties. Live indicators show who is connected and whose turn it is.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Official Game Logic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validates every card move against current active color and symbol. Eliminates illegal plays and maintains fair play.
            </p>
          </div>
        </div>
      </section>

      {/* CREATE ROOM MODAL */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* JOIN ROOM MODAL */}
      <JoinRoomModal
        isOpen={isJoinOpen}
        initialCode={joinModalInitialCode}
        onClose={() => setIsJoinOpen(false)}
      />
    </div>
  );
}
