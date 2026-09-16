let masterVolume = 0.14;

const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  playTone(freq, type, duration) {
    if (masterVolume <= 0) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(masterVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e){}
  },
  quack() {
    this.playTone(320, "sawtooth", 0.12);
    setTimeout(() => this.playTone(270, "sawtooth", 0.16), 70);
  },
  pop() { this.playTone(620, "sine", 0.05); },
  coin() {
    this.playTone(587.33, "triangle", 0.08);
    setTimeout(() => this.playTone(880, "triangle", 0.16), 65);
  },
  flap() { this.playTone(400, "sine", 0.08); }
};