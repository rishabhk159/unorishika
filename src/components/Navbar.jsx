import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Play, BookOpen, User, Layers } from 'lucide-react';
import SoundToggle from './SoundToggle';
import { getPlayerProfile } from '../services/storage';

export default function Navbar({ onOpenRules }) {
  const location = useLocation();
  const profile = getPlayerProfile();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Play / Lobby', path: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      {/* UNO color bar strip at top */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-red-600"></div>
        <div className="flex-1 bg-yellow-400"></div>
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-blue-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-yellow-500 to-blue-600 p-[2px] shadow-lg group-hover:rotate-3 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-xl italic tracking-tighter text-yellow-400 group-hover:scale-110 transition-transform">
                UNO
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white font-display">
                UNO <span className="text-yellow-400">RISHIKA</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                LIVE
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline -mt-1">
              Real-Time Multiplayer
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              How to Play
            </button>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <SoundToggle />

          {/* Player Profile Quick Pill */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-yellow-400/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center text-sm shadow">
              {profile.avatar || '🔥'}
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-yellow-400 max-w-[90px] truncate">
              {profile.username}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
