import { useState, useEffect } from 'react';
import { soundManager } from '../services/soundManager';

export function useSoundEffects() {
  const [muted, setMuted] = useState(soundManager.isMuted());

  useEffect(() => {
    setMuted(soundManager.isMuted());
  }, []);

  const toggleMute = () => {
    const state = soundManager.toggleMute();
    setMuted(state);
    return state;
  };

  return {
    muted,
    toggleMute,
    playClick: () => soundManager.playClick(),
    playCardPlay: () => soundManager.playCardPlay(),
    playCardDraw: () => soundManager.playCardDraw(),
    playUnoCall: () => soundManager.playUnoCall(),
    playSpecialAction: () => soundManager.playSpecialAction(),
    playTurnAlert: () => soundManager.playTurnAlert(),
    playWin: () => soundManager.playWin(),
    playError: () => soundManager.playError(),
  };
}
