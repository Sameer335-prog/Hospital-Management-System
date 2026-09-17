/**
 * audioAlert.js
 * Standalone Web Audio API sound synthesizer for clinical notifications.
 * Generates a pleasant two-tone hospital/clinical chime without external media files.
 */

class AudioAlertManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  unlockOnUserGesture() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };
    window.addEventListener('click', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchstart', unlock, true);
  }

  playChime(type = 'default') {
    if (!this.enabled) return;

    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      if (type === 'reminder') {
        // Urgent / 2-Hour Pre-Appointment reminder: 3 gentle harmonic tones
        const freqs = [659.25, 783.99, 1046.5]; // E5 -> G5 -> C6
        freqs.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.36);
        });
      } else {
        // Standard booking confirmation chime: 2 harmonious clinic tones
        const freqs = [587.33, 880]; // D5 -> A5
        freqs.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);

          gain.gain.setValueAtTime(0, now + idx * 0.14);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.14 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.4);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + 0.42);
        });
      }
    } catch {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const audioAlert = new AudioAlertManager();
if (typeof window !== 'undefined') {
  audioAlert.unlockOnUserGesture();
}
