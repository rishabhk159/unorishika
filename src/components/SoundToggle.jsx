import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export default function SoundToggle({ className = '' }) {
  const { muted, toggleMute, playClick } = useSoundEffects();

  const handleToggle = () => {
    playClick();
    toggleMute();
  };

  return (
    <button
      onClick={handleToggle}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
      className={`p-2.5 rounded-full transition-all duration-200 border border-slate-700/60 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white hover:scale-105 active:scale-95 shadow-md flex items-center justify-center ${className}`}
    >
      {muted ? (
        <VolumeX className="w-5 h-5 text-rose-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-emerald-400" />
      )}
    </button>
  );
}
