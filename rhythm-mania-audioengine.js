class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isPlaying = false;
    this.startTime = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx({ latencyHint: 'interactive' });

    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  async resume() {
    this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  getCurrentTimeMs() {
    if (!this.isPlaying) return 0;
    return (this.ctx.currentTime - this.startTime) * 1000;
  }

  // Precise procedural synth hit sounds (zero asset loading delay)
  playHitSound(judgement) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    let freq = 440;
    if (judgement === 'MARVELOUS') freq = 880;
    else if (judgement === 'PERFECT') freq = 660;
    else if (judgement === 'GREAT') freq = 520;
    else if (judgement === 'OK') freq = 330;
    else return; // Miss makes no tone

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Programmatic synth sequencer for cyber chiptune backing track
  startBackingTrack(bpm, totalBars) {
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime;
    const beatDur = 60 / bpm;
    const barDur = beatDur * 4;

    for (let bar = 0; bar < totalBars; bar++) {
      const barStart = this.startTime + bar * barDur;

      // 4-on-the-floor Bass Drum
      for (let beat = 0; beat < 4; beat++) {
        this.scheduleKick(barStart + beat * beatDur);
        this.scheduleHiHat(barStart + (beat + 0.5) * beatDur);
      }

      // Arpeggiated bassline
      const rootNotes = [110, 98, 87.3, 73.4]; // A2 -> G2 -> F2 -> D2
      const root = rootNotes[bar % 4];
      for (let i = 0; i < 16; i++) {
        const freq = (i % 2 === 0) ? root : root * 1.5;
        this.scheduleBassSynth(barStart + i * (beatDur / 4), freq, beatDur / 4);
      }
    }
  }

  scheduleKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.08);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  scheduleHiHat(time) {
    // White noise buffer burst
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    noise.start(time);
    noise.stop(time + 0.03);
  }

  scheduleBassSynth(time, freq, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur);
  }

  stopAll() {
    if (this.songElement) { this.songElement.pause(); this.songElement.currentTime = 0; }
    this.isPlaying = false;
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  startSongFile(elementId) {
    if (this.songElement) { this.songElement.pause(); this.songElement.currentTime = 0; }
    this.songElement = document.getElementById(elementId);
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime;
    if (this.songElement) { this.songElement.volume = 0.55; this.songElement.currentTime = 0; this.songElement.play().catch(() => {}); }
  }
}
