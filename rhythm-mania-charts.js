/**
 * PULSE // OVERDRIVE - Song & Chart Definitions
 * Lane index: 0 = D, 1 = F, 2 = J, 3 = K
 * Note format: { time: ms, lane: 0..3, hold: 0 (or duration in ms) }
 */
const SONG_DATABASE = {
  id: "cyberpunk_crush",
  title: "CYBERPUNK CRUSH",
  artist: "SynthRider",
  bpm: 140,
  offset: 120, // Initial chart lead-in padding (ms)

  // Procedural generator to construct tight musical patterns
  generateChart(difficulty) {
    const beatMs = (60 / this.bpm) * 1000;
    const notes = [];
    const totalBars = 32;

    for (let bar = 0; bar < totalBars; bar++) {
      const barTime = this.offset + bar * 4 * beatMs;

      // 4-on-the-floor kick anchors on lane 0 or 3
      for (let beat = 0; beat < 4; beat++) {
        const time = barTime + beat * beatMs;
        const kickLane = (bar % 2 === 0) ? 0 : 3;
        notes.push({ time, lane: kickLane, hold: 0 });

        // Off-beat hi-hat / snare accents
        if (beat === 1 || beat === 3) {
          notes.push({ time, lane: (kickLane === 0 ? 3 : 0), hold: 0 });
        }
      }

      // Hard difficulty adds 16th streams, syncopated triplets, and hold notes
      if (difficulty === 'hard') {
        const pattern = bar % 4;
        if (pattern === 1) {
          // 8th-note streams through center lanes
          for (let step = 0; step < 8; step++) {
            notes.push({
              time: barTime + step * (beatMs / 2),
              lane: 1 + (step % 2),
              hold: 0
            });
          }
        } else if (pattern === 3) {
          // Sustained chord holds
          notes.push({ time: barTime + beatMs, lane: 1, hold: beatMs * 1.5 });
          notes.push({ time: barTime + beatMs, lane: 2, hold: beatMs * 1.5 });
        } else {
          // Syncopated 16th-note double taps
          notes.push({ time: barTime + beatMs * 2.5, lane: 2, hold: 0 });
          notes.push({ time: barTime + beatMs * 2.75, lane: 1, hold: 0 });
        }
      } else {
        // Standard difficulty: simple 8th-note melodies
        if (bar % 2 === 1) {
          notes.push({ time: barTime + beatMs * 0.5, lane: 1, hold: 0 });
          notes.push({ time: barTime + beatMs * 2.5, lane: 2, hold: 0 });
        }
        if (bar % 4 === 3) {
          notes.push({ time: barTime + beatMs * 2, lane: 1, hold: beatMs * 1.0 });
        }
      }
    }

    // Sort chronologically (mandatory for processing pipeline)
    return notes.sort((a, b) => a.time - b.time);
  }
};