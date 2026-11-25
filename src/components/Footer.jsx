import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Sparkles, Trophy, Users, Zap } from 'lucide-react';

export default function Footer({ onOpenRules }) {
  return (
    <footer className="w-full bg-[#070A0F] border-t border-slate-800/90 text-slate-400 text-sm mt-auto">
      {/* Decorative colored glow strip */}
      <div className="h-0.5 w-full bg-gradient-to-r from-red-600 via-yellow-400 via-green-500 to-blue-600 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-400 text-slate-950 font-black italic flex items-center justify-center text-sm shadow">
                U
              </div>
              <span className="font-extrabold text-lg text-white font-display">
                UNO <span className="text-yellow-400">RISHIKA</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier online multiplayer card battle experience. Play private rooms with friends or challenge the world with classic official UNO rules and real-time synchronization.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Multiplayer Network Online
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  Home Landing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-yellow-400 transition-colors">
                  Create Private Room
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-yellow-400 transition-colors">
                  Join with Code
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenRules}
                  className="hover:text-yellow-400 transition-colors text-left"
                >
                  Official UNO Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Game Features */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">
              Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                Real-Time Socket Sync
              </li>
              <li className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Up to 4 Players in Room
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                Anti-Cheat Move Validation
              </li>
              <li className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Scoreboard & Avatars
              </li>
            </ul>
          </div>

          {/* Col 4: UNO Rishika Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-white text-xs">Ready to Play?</span>
              </div>
              <p className="text-xs text-slate-400">
                Share a room code with up to 3 friends and start playing in seconds!
              </p>
            </div>
            <Link
              to="/dashboard"
              className="mt-3 block text-center py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-lg"
            >
              Launch Game Room
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} UNO RISHIKA. Built with React, Vite & Tailwind CSS.
          </div>
          <div className="flex items-center gap-1">
            Crafted for competitive fun & fast online multiplayer
          </div>
        </div>
      </div>
    </footer>
  );
}
