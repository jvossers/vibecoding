// Fit engine: places syllables (in order) on a 16-steps-per-bar grid.
// Each layout style is a set of costs fed to the same dynamic programme.

export const STEPS_PER_BAR = 16;
export const MAX_BARS = 4;
const BAR_PENALTY = 6;

const TRESILLO = new Set([0, 3, 6, 8, 11, 14]);

const STYLES = [
  {
    id: 'eighths', name: 'Even eighths', hint: 'Two syllables per beat, steady.',
    allowed: s => s % 2 === 0,
    pos: (s, strong) => { const b = s % 4 === 0; return strong ? (b ? 0 : 1) : (b ? 0.5 : 0); },
    gap: g => (g === 2 ? 0 : g === 4 ? 1.5 : g === 6 ? 4 : 3 + g),
    brk: g => (g === 2 ? 1 : g <= 6 ? 0 : 0.3 + 0.2 * (g - 8 > 0 ? g - 8 : 0)),
  },
  {
    id: 'beats', name: 'Stress on the beat', hint: 'Strong syllables land on the beats.',
    allowed: () => true,
    pos: (s, strong) => {
      const m = s % 4;
      if (strong) return m === 0 ? 0 : m === 2 ? 1.5 : 4;
      return m === 0 ? 1 : m === 2 ? 0 : 0.5;
    },
    gap: g => (g === 1 ? 0.8 : g === 2 ? 0 : g === 3 ? 0.8 : g === 4 ? 1.2 : 2 + g),
    brk: g => (g === 1 ? 4 : g === 2 ? 1 : g === 3 ? 0.5 : g <= 8 ? 0 : 0.2 * (g - 8)),
  },
  {
    id: 'sync', name: 'Syncopated', hint: 'Pushes strong syllables off the beat.',
    allowed: () => true,
    pos: (s, strong) => {
      const b = s % STEPS_PER_BAR;
      if (strong) return TRESILLO.has(b) ? 0 : b % 2 === 0 ? 1.5 : 2.5;
      return TRESILLO.has(b) ? 0.8 : 0.3;
    },
    gap: g => (g === 1 ? 0.8 : g === 2 ? 0.2 : g === 3 ? 0 : g === 4 ? 1 : 2 + g),
    brk: g => (g === 1 ? 4 : g === 2 ? 1.2 : g <= 8 ? 0 : 0.2 * (g - 8)),
  },
];

function solve(syls, bars, style) {
  const S = bars * STEPS_PER_BAR, N = syls.length;
  if (N > S) return null;
  const INF = Infinity;
  let prev = new Float64Array(S).fill(INF);
  const back = [];
  const posCost = (i, s) => {
    if (!style.allowed(s)) return INF;
    const st = syls[i].stress;
    const strong = style.pos(s, true), weak = style.pos(s, false);
    let c = st === 1 ? strong : st === 2 ? (strong + weak) / 2 : weak;
    if (i === 0 || syls[i].breakBefore) c -= s % STEPS_PER_BAR === 0 ? 1 : s % 4 === 0 ? 0.5 : 0;
    return c;
  };
  for (let s = 0; s < S; s++) prev[s] = posCost(0, s) + (s === 0 ? 0 : 0.5 + 0.25 * s);
  for (let i = 1; i < N; i++) {
    const cur = new Float64Array(S).fill(INF);
    const bk = new Int16Array(S).fill(-1);
    const gapFn = syls[i].breakBefore ? style.brk : style.gap;
    for (let s = i; s < S; s++) {
      const pc = posCost(i, s);
      if (pc === INF) continue;
      let best = INF, bi = -1;
      for (let p = i - 1; p < s; p++) {
        if (prev[p] === INF) continue;
        const c = prev[p] + gapFn(s - p);
        if (c < best) { best = c; bi = p; }
      }
      if (bi >= 0) { cur[s] = best + pc; bk[s] = bi; }
    }
    back.push(bk);
    prev = cur;
  }
  let end = -1, best = INF;
  for (let s = 0; s < S; s++) if (prev[s] < best) { best = prev[s]; end = s; }
  if (end < 0) return null;
  const steps = new Array(N);
  steps[N - 1] = end;
  for (let i = N - 1; i > 0; i--) steps[i - 1] = back[i - 1][steps[i]];
  return { steps, cost: best };
}

function stats(syls, steps) {
  let strong = 0, onBeat = 0, breaks = 0, roomy = 0;
  syls.forEach((s, i) => {
    if (s.stress === 1) { strong++; if (steps[i] % 4 === 0) onBeat++; }
    if (s.breakBefore) { breaks++; if (steps[i] - steps[i - 1] >= 3) roomy++; }
  });
  return { strong, onBeat, breaks, roomy };
}

/**
 * Returns { layouts, overflow }. Each layout: { id, name, hint, bars, steps, stats }.
 * Layouts are ranked best first. `overflow` is true when nothing fits in MAX_BARS.
 */
export function fit(syls, minBars = 1) {
  if (!syls.length) return { layouts: [], overflow: false };
  const found = [];
  for (const style of STYLES) {
    let best = null;
    for (let bars = minBars; bars <= MAX_BARS; bars++) {
      const r = solve(syls, bars, style);
      if (!r) continue;
      const total = r.cost + BAR_PENALTY * bars;
      if (!best || total < best.total - 1e-9) best = { ...r, bars, total };
    }
    if (best) found.push({ id: style.id, name: style.name, hint: style.hint, bars: best.bars, steps: best.steps });
  }
  const unique = [];
  for (const l of found) {
    if (unique.some(u => u.steps.join() === l.steps.join())) continue;
    l.stats = stats(syls, l.steps);
    unique.push(l);
  }
  const minB = Math.min(...unique.map(l => l.bars));
  const score = l => (l.stats.strong ? 2 * l.stats.onBeat / l.stats.strong : 0) +
    (l.stats.breaks ? l.stats.roomy / l.stats.breaks : 0) - 1.5 * (l.bars - minB);
  unique.forEach((l, i) => { l.score = score(l) - i * 1e-6; });
  unique.sort((a, b) => b.score - a.score);
  return { layouts: unique, overflow: unique.length === 0 };
}
