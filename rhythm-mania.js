/* ==========================================================================
   PULSE // OVERDRIVE - CORE GAME CONTROLLER
   ========================================================================== */

const JUDGEMENTS = {
  MARVELOUS: { name: 'MARVELOUS', window: 22.5, score: 1000, accVal: 1.0,  color: '#638eaa', hpDelta: +2 },
  PERFECT:   { name: 'PERFECT',   window: 45.0, score: 800,  accVal: 0.8,  color: '#ab8550', hpDelta: +1 },
  GREAT:     { name: 'GREAT',     window: 90.0, score: 500,  accVal: 0.5,  color: '#568870', hpDelta: 0 },
  OK:        { name: 'OK',        window: 135.0,score: 200,  accVal: 0.2,  color: '#9977ad', hpDelta: -2 },
  MISS:      { name: 'MISS',      window: 180.0,score: 0,    accVal: 0.0,  color: '#ba6c8b', hpDelta: -8 }
};

const LANE_KEYS = ['KeyD', 'KeyF', 'KeyG', 'KeyJ', 'KeyK'];
const LANE_COLORS = ['#ff5a8f', '#ffb347', '#ffe66d', '#a8e6cf', '#c3a6ff'];

class RhythmGame {
  constructor() {
    this.canvas = document.getElementById('stage');
    this.ctx = this.canvas.getContext('2d');
    this.audio = new AudioEngine();

    // Configuration
    this.scrollSpeedMultiplier = 2.4;
    this.calibrationOffsetMs = 0;
    this.selectedDiff = 'easy';
    this.selectedSongId = 'song-one';

    // Game variables
    this.notes = [];
    this.activeHolds = Array(5).fill(null);
    this.particles = [];
    this.isRunning = false;
    this.score = 0;
    this.maxScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.health = 100;
    this.totalNotesCount = 0;

    this.stats = {
      MARVELOUS: 0,
      PERFECT: 0,
      GREAT: 0,
      OK: 0,
      MISS: 0,
      accuracyPoints: 0
    };

    // Responsive Canvas
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Input listeners
    this.lanePressed = Array(5).fill(false);
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    this.touchLanes = new Map();
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const lane = Math.max(0, Math.min(4, Math.floor((e.clientX - rect.left) / rect.width * 5)));
      this.canvas.setPointerCapture(e.pointerId);
      this.touchLanes.set(e.pointerId, lane);
      this.onKeyDown({ code: LANE_KEYS[lane], repeat: false, preventDefault() {} });
      e.preventDefault();
    });
    const releaseTouch = e => {
      const lane = this.touchLanes.get(e.pointerId);
      this.touchLanes.delete(e.pointerId);
      if(lane !== undefined && ![...this.touchLanes.values()].includes(lane)) this.onKeyUp({code:LANE_KEYS[lane],preventDefault(){}});
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture']) this.canvas.addEventListener(event, releaseTouch);
    window.addEventListener('arcade-input-reset',()=>{
      this.touchLanes.clear();
      LANE_KEYS.forEach(code=>this.onKeyUp({code,preventDefault(){}}));
    });

    this.setupUI();
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.hitLineY = this.h - 64;
    this.laneWidth = this.w / 5;
  }

  setupUI() {
    // Speed Slider
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.addEventListener('input', (e) => {
      this.scrollSpeedMultiplier = parseFloat(e.target.value);
      document.getElementById('speed-val').innerText = `${this.scrollSpeedMultiplier.toFixed(1)}x`;
    });

    // Offset Slider
    const offsetSlider = document.getElementById('offset-slider');
    offsetSlider.addEventListener('input', (e) => {
      this.calibrationOffsetMs = parseFloat(e.target.value);
      document.getElementById('offset-val').innerText = `${this.calibrationOffsetMs} ms`;
    });

    // Difficulty buttons
    document.querySelectorAll('.btn-diff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedDiff = e.target.dataset.diff;
      });
    });

    document.querySelectorAll('.btn-level').forEach(btn => btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-level').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      this.selectedSongId = e.currentTarget.dataset.song;
    }));

    // Start Button
    document.getElementById('btn-play').addEventListener('click', async () => {
      await this.audio.resume();
      document.getElementById('menu-screen').classList.add('hidden');
      this.startGame();
    });

    // Restart Button
    document.getElementById('btn-restart').addEventListener('click', () => {
      document.getElementById('results-screen').classList.add('hidden');
      document.getElementById('menu-screen').classList.remove('hidden');
    });
  }

  startGame() {
    this.activeHolds.fill(null);
    this.lanePressed.fill(false);
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.health = 100;
    this.stats = { MARVELOUS: 0, PERFECT: 0, GREAT: 0, OK: 0, MISS: 0, accuracyPoints: 0 };

    const beatMs = 60000 / SONG_DATABASE.bpm;
    const totalBars = this.selectedDiff === 'hard' ? 40 : 28;
    const notesPerBar = this.selectedDiff === 'hard' ? 6 : 3;
    const songVariation = this.selectedSongId === 'song-two' ? .35 : 0;
    const rawChart = Array.from({ length: totalBars * notesPerBar }, (_, index) => ({
      time: SONG_DATABASE.offset + index * (beatMs * 4 / notesPerBar) + Math.random() * beatMs * .12 + songVariation * beatMs,
      lane: Math.floor(Math.random() * 5),
      hold: this.selectedDiff === 'hard' && Math.random() < .12 ? beatMs : 0
    }));
    this.totalNotesCount = rawChart.length;
    this.maxScore = this.totalNotesCount * JUDGEMENTS.MARVELOUS.score;

    // Deep copy notes with processing state
    this.notes = rawChart.map(n => ({
      ...n,
      hit: false,
      missed: false,
      holdProgress: 0,
      holdCompleted: false
    }));

    this.audio.startSongFile(this.selectedSongId);
    this.isRunning = true;

    requestAnimationFrame((t) => this.renderLoop(t));
  }

  /* ======================== INPUT PROCESSING ======================== */
  onKeyDown(e) {
    const laneIndex = LANE_KEYS.indexOf(e.code);
    if (laneIndex === -1 || !this.isRunning || e.repeat) return;

    this.lanePressed[laneIndex] = true;
    const now = this.audio.getCurrentTimeMs() - this.calibrationOffsetMs;

    // Search for closest unhit note in lane within valid hit window
    const targetNote = this.notes.find(n => !n.hit && !n.missed && n.lane === laneIndex && Math.abs(n.time - now) <= JUDGEMENTS.MISS.window);

    if (targetNote) {
      const delta = now - targetNote.time;
      const absDelta = Math.abs(delta);

      let judge = JUDGEMENTS.MISS;
      if (absDelta <= JUDGEMENTS.MARVELOUS.window) judge = JUDGEMENTS.MARVELOUS;
      else if (absDelta <= JUDGEMENTS.PERFECT.window) judge = JUDGEMENTS.PERFECT;
      else if (absDelta <= JUDGEMENTS.GREAT.window) judge = JUDGEMENTS.GREAT;
      else if (absDelta <= JUDGEMENTS.OK.window) judge = JUDGEMENTS.OK;

      targetNote.hit = true;

      if (targetNote.hold > 0) {
        this.activeHolds[laneIndex] = targetNote;
      }

      this.applyJudgement(judge, delta);
      this.spawnParticles(laneIndex, judge.color);
      this.audio.playHitSound(judge.name);
    }
  }

  onKeyUp(e) {
    const laneIndex = LANE_KEYS.indexOf(e.code);
    if (laneIndex === -1) return;
    this.lanePressed[laneIndex] = false;
    if (!this.isRunning) { this.activeHolds[laneIndex] = null; return; }

    // Release held notes early
    const activeHold = this.activeHolds[laneIndex];
    if (activeHold) {
      const now = this.audio.getCurrentTimeMs() - this.calibrationOffsetMs;
      const holdEndTime = activeHold.time + activeHold.hold;

      if (now < holdEndTime - JUDGEMENTS.GREAT.window) {
        // Dropped sustain early
        activeHold.missed = true;
        this.applyJudgement(JUDGEMENTS.MISS, 0);
      }
      this.activeHolds[laneIndex] = null;
    }
  }

  applyJudgement(judge, deltaMs) {
    this.stats[judge.name]++;
    this.stats.accuracyPoints += judge.accVal;

    if (judge.name === 'MISS') {
      this.combo = 0;
    } else {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.score += judge.score + Math.min(this.combo * 4, 100);
    }

    // Life calculation
    this.health = Math.min(100, Math.max(0, this.health + judge.hpDelta));

    this.showJudgementHUD(judge, deltaMs);
    this.updateHUD();
  }

  showJudgementHUD(judge, deltaMs) {
    const jEl = document.getElementById('judgement-display');
    const cEl = document.getElementById('combo-container');
    const dEl = document.getElementById('delta-display');
    const countEl = document.getElementById('combo-counter');

    jEl.innerText = judge.name;
    jEl.style.color = judge.color;
    jEl.style.opacity = 1;
    jEl.style.transform = 'translate(-50%, -50%) scale(1.2)';

    if (this.combo > 2) {
      cEl.style.opacity = 1;
      countEl.innerText = this.combo;
      countEl.style.color = judge.color;
    } else {
      cEl.style.opacity = 0;
    }

    if (judge.name !== 'MISS') {
      const sign = deltaMs > 0 ? '+' : '';
      dEl.innerText = `${sign}${deltaMs.toFixed(1)} ms`;
      dEl.style.color = deltaMs > 0 ? '#ffaa00' : '#00aaff';
      dEl.style.opacity = 1;
    } else {
      dEl.style.opacity = 0;
    }

    setTimeout(() => {
      jEl.style.transform = 'translate(-50%, -50%) scale(1)';
      jEl.style.opacity = 0.8;
    }, 60);
  }

  updateHUD() {
    document.getElementById('score-display').innerText = Math.floor(this.score).toString().padStart(7, '0');

    const totalProcessed = Object.values(this.stats).reduce((a, b) => a + b, 0) - this.stats.accuracyPoints;
    const accuracy = totalProcessed > 0 ? (this.stats.accuracyPoints / totalProcessed) * 100 : 100;
    document.getElementById('acc-display').innerText = `${accuracy.toFixed(2)}%`;

    document.getElementById('life-bar-fill').style.width = `${this.health}%`;
  }

  /* ======================== PARTICLE SYSTEM ======================== */
  spawnParticles(laneIndex, color) {
    const originX = laneIndex * this.laneWidth + (this.laneWidth / 2);
    const originY = this.hitLineY;

    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * Math.random());
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.globalAlpha = 1.0;
  }

  /* ======================== MAIN RENDERING LOOP ======================== */
  renderLoop() {
    if (!this.isRunning) return;

    const currentTimeMs = this.audio.getCurrentTimeMs() - this.calibrationOffsetMs;
    const pxPerMs = (this.scrollSpeedMultiplier * 0.45);

    ArcadeArt.rhythmBackground(this.ctx,this.w,this.h,this.laneWidth,this.lanePressed,LANE_COLORS,this.hitLineY);

    // Process & Render Notes
    for (let n of this.notes) {
      if (n.hit && n.hold === 0) continue;

      const timeUntilHit = n.time - currentTimeMs;
      const noteY = this.hitLineY - (timeUntilHit * pxPerMs);
      const laneX = n.lane * this.laneWidth;

      // Miss validation: Note fell below threshold window
      if (!n.hit && !n.missed && timeUntilHit < -JUDGEMENTS.MISS.window) {
        n.missed = true;
        this.applyJudgement(JUDGEMENTS.MISS, 0);
      }

      // Sustain/Hold Body Rendering
      if (n.hold > 0 && (!n.missed)) {
        const holdHeight = n.hold * pxPerMs;
        const tailY = noteY - holdHeight;

        // Gradient for holds
        const grad = this.ctx.createLinearGradient(0, tailY, 0, noteY);
        grad.addColorStop(0, 'rgba(198, 174, 219, 0.3)');
        grad.addColorStop(1, LANE_COLORS[n.lane]);

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(laneX + 10, Math.max(0, tailY), this.laneWidth - 20, Math.min(this.h, noteY - tailY));

        // Processing hold completion
        if (this.activeHolds[n.lane] === n) {
          if (currentTimeMs >= n.time + n.hold) {
            n.holdCompleted = true;
            this.activeHolds[n.lane] = null;
            this.applyJudgement(JUDGEMENTS.MARVELOUS, 0);
          }
        }
      }

      // Standard Tap Note Head
      if (!n.hit && noteY > -30 && noteY < this.h + 30) {
        this.ctx.fillStyle = LANE_COLORS[n.lane];
        this.ctx.shadowColor = LANE_COLORS[n.lane];
        this.ctx.shadowBlur = 0;
        ArcadeArt.note(this.ctx,laneX+8,noteY-9,this.laneWidth-16,LANE_COLORS[n.lane]);
        this.ctx.shadowBlur = 0; // reset
      }
    }

    this.updateParticles();

    // Track completion percentage
    const lastNote = this.notes[this.notes.length - 1];
    const progress = Math.min(100, Math.max(0, (currentTimeMs / (lastNote.time + 1000)) * 100));
    document.getElementById('progress-display').innerText = `${progress.toFixed(0)}%`;

    // End condition
    if (currentTimeMs > lastNote.time + 2000 || this.health <= 0) {
      this.endGame();
      return;
    }

    requestAnimationFrame((t) => this.renderLoop(t));
  }

  endGame() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.audio.stopAll();

    const resultsEl = document.getElementById('results-screen');
    const totalJudged = this.stats.MARVELOUS + this.stats.PERFECT + this.stats.GREAT + this.stats.OK + this.stats.MISS;
    const finalAcc = totalJudged > 0 ? ((this.stats.accuracyPoints / totalJudged) * 100) : 0;

    // Grade calculation
    let grade = 'F';
    if (finalAcc >= 98 && this.health > 0) grade = 'SS';
    else if (finalAcc >= 95) grade = 'S';
    else if (finalAcc >= 90) grade = 'A';
    else if (finalAcc >= 80) grade = 'B';
    else if (finalAcc >= 70) grade = 'C';
    else if (this.health > 0) grade = 'D';

    document.getElementById('result-grade').innerText = `GRADE: ${grade}`;
    document.getElementById('res-score').innerText = Math.floor(this.score);
    document.getElementById('res-acc').innerText = `${finalAcc.toFixed(2)}%`;
    document.getElementById('res-combo').innerText = this.maxCombo;

    document.getElementById('res-c-marv').innerText = this.stats.MARVELOUS;
    document.getElementById('res-c-perf').innerText = this.stats.PERFECT;
    document.getElementById('res-c-great').innerText = this.stats.GREAT;
    document.getElementById('res-c-ok').innerText = this.stats.OK;
    document.getElementById('res-c-miss').innerText = this.stats.MISS;

    // A round only counts as cleared when the song reaches its end with life left.
    if (this.health > 0) {
      Arcade.earn(25);
    }

    resultsEl.classList.remove('hidden');
  }
}

// Instantiate Engine on Load
window.addEventListener('DOMContentLoaded', () => {
  new RhythmGame();
});
