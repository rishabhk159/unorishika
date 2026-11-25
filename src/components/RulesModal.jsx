import React from 'react';
import { X, BookOpen, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-blue-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black italic shadow-lg">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">Official UNO Rules</h2>
              <p className="text-xs text-slate-400">Master the game, outplay your rivals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with custom scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Objective */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Game Objective
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Be the first player to get rid of all the cards in your hand. Match cards by color, number, or play special action cards to disrupt opponents.
            </p>
          </div>

          {/* Setup & Basic Play */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs text-yellow-400">
              Basic Gameplay
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">1. Initial Deal</span>
                Each player starts with 7 cards. One card is flipped from the deck to start the Discard Pile.
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">2. Matching Cards</span>
                On your turn, play a card matching either the <span className="text-red-400 font-semibold">color</span>, the <span className="text-yellow-400 font-semibold">number</span>, or the <span className="text-blue-400 font-semibold">symbol</span> of the top card.
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">3. Drawing Cards</span>
                If you have no playable card, click the Draw Pile to draw one card. You can play it right away if it matches!
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">4. Shouting UNO!</span>
                When you have only 1 card remaining, click the <span className="text-yellow-400 font-bold">UNO button</span> before your turn finishes!
              </div>
            </div>
          </div>

          {/* Action Cards Reference */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs text-yellow-400">
              Action & Wild Cards
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
                  +2
                </div>
                <div>
                  <strong className="text-white block">Draw Two (+2)</strong>
                  Next player must draw 2 cards and forfeits their turn.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white font-black flex items-center justify-center shrink-0">
                  ⇄
                </div>
                <div>
                  <strong className="text-white block">Reverse Card</strong>
                  Reverses the direction of play (clockwise ↔ counter-clockwise).
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-green-600 text-white font-black flex items-center justify-center shrink-0">
                  ⊘
                </div>
                <div>
                  <strong className="text-white block">Skip Card</strong>
                  Next player's turn is skipped immediately.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-500 via-yellow-400 to-blue-500 text-white font-black flex items-center justify-center shrink-0">
                  ★
                </div>
                <div>
                  <strong className="text-white block">Wild Card</strong>
                  Can be played on any card. You pick the active color that continues play.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-950 border border-yellow-400 text-yellow-300 font-black flex items-center justify-center shrink-0">
                  +4
                </div>
                <div>
                  <strong className="text-white block">Wild Draw Four (+4)</strong>
                  You choose the color AND the next player draws 4 cards and loses their turn!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-sm transition shadow-lg"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
