class SoundManager {
  private enabled: boolean = false;
  private ctx: AudioContext | null = null;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && !this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.enabled || !this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCollision() {
    this.playTone(150, 'sine', 0.1, 0.1);
  }

  playConversion() {
    this.playTone(440, 'triangle', 0.2, 0.1);
    setTimeout(() => this.playTone(660, 'triangle', 0.2, 0.05), 50);
  }

  playWinner() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((note, i) => {
        setTimeout(() => this.playTone(note, 'square', 0.5, 0.05), i * 150);
    });
  }
}

export const soundManager = new SoundManager();
