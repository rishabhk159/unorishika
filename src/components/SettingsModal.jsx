import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sparkles, BookOpen, LogOut, Check, Sliders, Shield } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function SettingsModal({
  isOpen,
  onClose,
  animationsEnabled = true,
  onToggleAnimations,
  onOpenRules,
  onRequestLeave,
}) {
  const { muted, toggleMute, playClick } = useSoundEffects();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Sliders className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-display">Game Settings</h3>
              <p className="text-xs text-slate-400">Audio, graphics, and controls</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6">
          {/* Sound Effects Option */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${muted ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sound Effects</h4>
                <p className="text-xs text-slate-400">Card flips, UNO alerts & victory fanfares</p>
              </div>
            </div>
            <button
              onClick={() => {
                playClick();
                toggleMute();
              }}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                !muted ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  !muted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Smooth Animations Option */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${animationsEnabled ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Card Animations</h4>
                <p className="text-xs text-slate-400">Card draw, play, & tilt movement</p>
              </div>
            </div>
            <button
              onClick={() => {
                playClick();
                onToggleAnimations?.();
              }}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                animationsEnabled ? 'bg-yellow-400' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  animationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Game Instructions Button */}
          <button
            onClick={() => {
              playClick();
              onOpenRules?.();
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-left transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Game Instructions & Rules</h4>
                <p className="text-xs text-slate-400">Official UNO cards breakdown & guide</p>
              </div>
            </div>
          </button>

          {/* Exit Game with Confirmation */}
          <button
            onClick={() => {
              playClick();
              onRequestLeave?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold text-xs uppercase tracking-wider transition"
          >
            <LogOut className="w-4 h-4" />
            Leave Match
          </button>
        </div>
      </div>
    </div>
  );
}
