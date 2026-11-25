// Web Audio API based Synthesized Sound Effects for UNO RISHIKA
// 100% reliable, zero asset loading delay, responsive and customizable volume.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('uno_rishika_muted') === 'true';
    this.volume = 0.4;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('uno_rishika_muted', this.muted);
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.3, pitchSlide = null) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (pitchSlide) {
        osc.frequency.exponentialRampToValueAtTime(pitchSlide, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Sound effects
  playClick() {
    this.playTone(800, 'sine', 0.06, 0.2, 500);
  }

  playCardPlay() {
    this.playTone(320, 'triangle', 0.12, 0.4, 480);
    setTimeout(() => this.playTone(600, 'sine', 0.08, 0.3, 720), 40);
  }

  playCardDraw() {
    this.playTone(220, 'sine', 0.18, 0.35, 160);
  }

  playUnoCall() {
    if (this.muted) return;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.35);
      }, idx * 70);
    });
  }

  playSpecialAction() {
    // Reverse or skip
    this.playTone(500, 'square', 0.12, 0.25, 300);
    setTimeout(() => this.playTone(400, 'sine', 0.15, 0.3, 700), 100);
  }

  playTurnAlert() {
    this.playTone(640, 'sine', 0.1, 0.25);
    setTimeout(() => this.playTone(960, 'sine', 0.14, 0.3), 90);
  }

  playWin() {
    if (this.muted) return;
    const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.4);
      }, i * 140);
    });
  }

  playError() {
    this.playTone(180, 'sawtooth', 0.22, 0.3, 110);
  }
}

export const soundManager = new SoundManager();
