import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function ExitConfirmModal({ isOpen, onCancel, onConfirm }) {
  const { playClick } = useSoundEffects();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-scaleUp">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-white font-display">Leave Current Match?</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Are you sure you want to exit to the dashboard? Your seat and running room score will be retained if you rejoin.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              playClick();
              onCancel();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700"
          >
            Keep Playing
          </button>
          <button
            onClick={() => {
              playClick();
              onConfirm();
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Yes, Leave
          </button>
        </div>
      </div>
    </div>
  );
}
