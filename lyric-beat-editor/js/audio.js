// Playback engine. The AudioContext clock is the only timing reference:
// every event time is derived from its absolute step index, so nothing drifts.

const LOOKAHEAD = 0.14;     // seconds of audio scheduled ahead
const TICK_MS = 25;
export const COUNT_IN_STEPS = 16; // four beats

let ctx = null;
let noise = null;

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('This browser has no Web Audio support.');
    ctx = new AC({ latencyHint: 'interactive' });
    const len = Math.floor(ctx.sampleRate * 0.4);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

function clap(out, t, level = 0.9) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1250; bp.Q.value = 1.1;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 650;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  // three quick bursts, then the tail: the "many hands" smear of a clap
  for (const off of [0, 0.011, 0.022]) {
    g.gain.setValueAtTime(level, t + off);
    g.gain.exponentialRampToValueAtTime(level * 0.25, t + off + 0.009);
  }
  g.gain.setValueAtTime(level, t + 0.031);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  src.connect(bp).connect(hp).connect(g).connect(out);
  src.start(t, Math.random() * 0.1);
  src.stop(t + 0.27);
}

function blip(out, t, freq, level, dur = 0.05, type = 'sine') {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + dur + 0.02);
}

/**
 * Engine for one playback run.
 * opts: { bpm, totalSteps, onsets:Set<number>, loop, cues, onEnd }
 * Events are recorded in `log` ({type, step, time}) so timing can be inspected.
 */
export class Player {
  constructor() { this.playing = false; this.log = []; }

  async start(opts) {
    const c = ensureContext();
    if (c.state !== 'running') await c.resume();
    this.stop(true);
    Object.assign(this, opts);
    this.sps = 60 / this.bpm / 4;
    this.master = c.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(c.destination);
    this.t0 = c.currentTime + 0.12;       // time of the first count-in click
    this.next = -COUNT_IN_STEPS;          // absolute step index, 0 = first bar's beat 1
    this.endTime = Infinity;
    this.log = [];
    this.playing = true;
    this.timer = setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  timeOf(step) { return this.t0 + (step + COUNT_IN_STEPS) * this.sps; }

  schedule() {
    if (!this.playing) return;
    const horizon = ctx.currentTime + LOOKAHEAD;
    while (this.endTime === Infinity) {
      const k = this.next;
      const t = this.timeOf(k);
      if (t > horizon) break;
      if (k >= this.totalSteps && !this.loop) { this.endTime = t; break; }
      this.emit(k, t);
      this.next++;
    }
  }

  emit(k, t) {
    const out = this.master;
    const note = (type) => this.log.push({ type, step: k, time: t });
    if (k < 0) {
      if (k % 4 === 0) { blip(out, t, k === -COUNT_IN_STEPS ? 1320 : 990, 0.5, 0.06, 'square'); note('count'); }
      return;
    }
    const s = k % this.totalSteps;
    if (s % 4 === 0) {
      const beat = (s % 16) / 4;
      if (beat === 1 || beat === 3) { clap(out, t); note('clap'); }
      else if (beat === 0) { blip(out, t, 1568, 0.32, 0.05, 'triangle'); note('accent'); }
      else { blip(out, t, 1046, 0.2, 0.04, 'triangle'); note('soft'); }
    }
    if (this.cues && this.onsets.has(s)) { blip(out, t, 2637, 0.11, 0.03, 'sine'); note('cue'); }
  }

  /** Position in steps, fractional; negative during the count-in. null when stopped. */
  position() {
    if (!this.playing) return null;
    const lat = Math.min(0.3, ctx.outputLatency || 0);
    const now = ctx.currentTime - lat;
    if (now >= this.endTime) return Infinity;
    return (now - this.t0) / this.sps - COUNT_IN_STEPS;
  }

  stop(silent = false) {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
    const m = this.master;
    // Cutting the master gain silences everything already scheduled.
    try {
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
      m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.015);
    } catch { /* ignore */ }
    setTimeout(() => m.disconnect(), 60);
    if (!silent && this.onEnd) this.onEnd();
  }
}
