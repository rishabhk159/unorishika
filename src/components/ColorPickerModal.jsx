import React, { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function ColorPickerModal({ isOpen, onSelectColor }) {
  const { playClick, playSpecialAction } = useSoundEffects();
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  const colors = [
    {
      id: 'red',
      label: 'Red',
      bg: 'bg-red-600 hover:bg-red-500 hover:shadow-glow-red',
      border: 'border-red-400',
      ring: 'ring-red-400',
    },
    {
      id: 'yellow',
      label: 'Yellow',
      bg: 'bg-yellow-400 hover:bg-yellow-300 hover:shadow-glow-yellow text-slate-950',
      border: 'border-yellow-300',
      ring: 'ring-yellow-300',
    },
    {
      id: 'green',
      label: 'Green',
      bg: 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-glow-green',
      border: 'border-emerald-400',
      ring: 'ring-emerald-400',
    },
    {
      id: 'blue',
      label: 'Blue',
      bg: 'bg-blue-600 hover:bg-blue-500 hover:shadow-glow-blue',
      border: 'border-blue-400',
      ring: 'ring-blue-400',
    },
  ];

  const handlePick = (colorId) => {
    setSelected(colorId);
    playSpecialAction();
    setTimeout(() => {
      onSelectColor(colorId);
      setSelected(null);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-6 overflow-hidden animate-scaleUp">
        {/* Animated Background Color Ring Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600 flex items-center justify-center text-white shadow-xl animate-color-burst">
            <Palette className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white font-display tracking-tight">
            Choose Next Color
          </h3>
          <p className="text-xs text-slate-300">
            Pick a color to continue the game
          </p>
        </div>

        {/* 4 Quadrants Color Grid */}
        <div className="grid grid-cols-2 gap-3.5 relative z-10">
          {colors.map((c) => {
            const isPicked = selected === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handlePick(c.id)}
                className={`h-24 rounded-2xl font-black text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 border-2 ${c.border} ${c.bg} shadow-xl flex flex-col items-center justify-center tracking-wider font-display ${
                  isPicked ? `scale-110 ring-4 ${c.ring} shadow-2xl` : ''
                }`}
              >
                <span>{c.label}</span>
                <span className="w-2 h-2 rounded-full bg-white/60 mt-1" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
