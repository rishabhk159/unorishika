import React from 'react';
import { Ban, RotateCcw, Plus, Sparkles } from 'lucide-react';

// Maps card colors to rich gradients and shadow styles
const COLOR_STYLES = {
  red: {
    bg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
    border: 'border-red-400',
    text: 'text-red-500',
    glow: 'hover:shadow-glow-red hover:border-red-300',
    activeGlow: 'shadow-glow-red ring-2 ring-red-400',
    badge: 'bg-red-600'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
    border: 'border-blue-400',
    text: 'text-blue-500',
    glow: 'hover:shadow-glow-blue hover:border-blue-300',
    activeGlow: 'shadow-glow-blue ring-2 ring-blue-400',
    badge: 'bg-blue-600'
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500 via-green-600 to-green-700',
    border: 'border-emerald-400',
    text: 'text-emerald-500',
    glow: 'hover:shadow-glow-green hover:border-emerald-300',
    activeGlow: 'shadow-glow-green ring-2 ring-emerald-400',
    badge: 'bg-emerald-600'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-yellow-500',
    border: 'border-yellow-300',
    text: 'text-amber-500',
    glow: 'hover:shadow-glow-yellow hover:border-yellow-200',
    activeGlow: 'shadow-glow-yellow ring-2 ring-yellow-300',
    badge: 'bg-yellow-500'
  },
  wild: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-black',
    border: 'border-amber-400/80',
    text: 'text-white',
    glow: 'hover:shadow-[0_0_25px_rgba(255,255,255,0.7)] hover:border-white',
    activeGlow: 'shadow-[0_0_25px_rgba(255,255,255,0.8)] ring-2 ring-white',
    badge: 'bg-slate-700'
  }
};

export default function UnoCard({
  card,
  isPlayable = false,
  onClick,
  isBack = false,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className = '',
  disabled = false,
  rotate = 0,
}) {
  // Card dimensions
  const sizes = {
    xs: 'w-10 h-14 text-xs rounded-md',
    sm: 'w-14 h-20 text-sm rounded-lg',
    md: 'w-20 h-28 sm:w-24 sm:h-36 text-base rounded-xl',
    lg: 'w-24 h-36 sm:w-28 sm:h-44 text-lg rounded-2xl',
    xl: 'w-32 h-48 sm:w-36 sm:h-52 text-xl rounded-2xl',
  };

  if (isBack) {
    return (
      <div
        style={{ transform: `rotate(${rotate}deg)` }}
        className={`relative ${sizes[size]} bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-slate-700/80 shadow-card flex items-center justify-center overflow-hidden transition-all duration-300 ${className}`}
      >
        {/* Card back center oval with UNO */}
        <div className="absolute inset-2 rounded-lg border border-red-500/30 flex items-center justify-center overflow-hidden">
          <div className="w-[125%] h-8 sm:h-12 bg-red-600 -rotate-[28deg] flex items-center justify-center shadow-lg border-y-2 border-yellow-400">
            <span className="font-black italic tracking-tighter text-yellow-300 text-xs sm:text-base font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              UNO
            </span>
          </div>
        </div>
      </div>
    );
  }

  const colorStyle = COLOR_STYLES[card.color] || COLOR_STYLES.wild;

  // Render symbol/content in center
  const renderCardContent = () => {
    if (card.type === 'number') {
      return (
        <span className="font-black text-2xl sm:text-4xl italic tracking-tighter text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] font-display">
          {card.value}
        </span>
      );
    }
    if (card.type === 'skip') {
      return <Ban className="w-8 h-8 sm:w-12 sm:h-12 text-white stroke-[3] drop-shadow-md" />;
    }
    if (card.type === 'reverse') {
      return <RotateCcw className="w-8 h-8 sm:w-12 sm:h-12 text-white stroke-[3] drop-shadow-md" />;
    }
    if (card.type === 'draw2') {
      return (
        <div className="flex items-center text-white font-black text-xl sm:text-3xl italic drop-shadow-md">
          <Plus className="w-4 h-4 sm:w-6 sm:h-6 stroke-[3]" />
          <span>2</span>
        </div>
      );
    }
    if (card.type === 'wild') {
      return (
        <div className="grid grid-cols-2 gap-1 w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden p-1 bg-black/40 border border-white/40 shadow-inner">
          <div className="bg-red-500 rounded-tl-full"></div>
          <div className="bg-blue-500 rounded-tr-full"></div>
          <div className="bg-yellow-400 rounded-bl-full"></div>
          <div className="bg-emerald-500 rounded-br-full"></div>
        </div>
      );
    }
    if (card.type === 'wild4') {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-2 gap-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden p-0.5 bg-black/40 border border-white/40">
            <div className="bg-red-500"></div>
            <div className="bg-blue-500"></div>
            <div className="bg-yellow-400"></div>
            <div className="bg-emerald-500"></div>
          </div>
          <div className="flex items-center text-white font-black text-xs sm:text-base italic drop-shadow mt-0.5">
            +4
          </div>
        </div>
      );
    }
    return card.value;
  };

  // Corner mini label
  const cornerLabel = () => {
    if (card.type === 'number') return card.value;
    if (card.type === 'skip') return '⊘';
    if (card.type === 'reverse') return '⇄';
    if (card.type === 'draw2') return '+2';
    if (card.type === 'wild') return 'W';
    if (card.type === 'wild4') return '+4';
    return card.value;
  };

  return (
    <div
      onClick={isPlayable && !disabled ? onClick : undefined}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`relative select-none ${sizes[size]} ${colorStyle.bg} border-2 ${colorStyle.border} shadow-card overflow-hidden transition-all duration-200 cursor-pointer ${
        isPlayable && !disabled
          ? `cursor-pointer ${colorStyle.glow} hover:-translate-y-4 hover:scale-105 z-20 ${colorStyle.activeGlow}`
          : disabled
          ? 'opacity-60 cursor-not-allowed filter grayscale-[30%]'
          : ''
      } ${className}`}
    >
      {/* Corner Top-Left */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className="font-black text-[11px] sm:text-xs text-white drop-shadow font-display">
          {cornerLabel()}
        </span>
      </div>

      {/* Corner Bottom-Right (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className="font-black text-[11px] sm:text-xs text-white drop-shadow font-display">
          {cornerLabel()}
        </span>
      </div>

      {/* Central UNO Ellipse Oval */}
      <div className="absolute inset-2 sm:inset-3 rounded-full bg-slate-950/20 border border-white/30 -rotate-12 flex items-center justify-center shadow-inner overflow-hidden">
        <div className="rotate-12 flex items-center justify-center">
          {renderCardContent()}
        </div>
      </div>

      {/* Playable indicator badge */}
      {isPlayable && !disabled && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75 m-1 pointer-events-none" />
      )}

      {/* Subtle glossy sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
