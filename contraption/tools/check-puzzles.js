// Checks every puzzle: it must not solve itself, and the reference solution must solve it.
// Run from the repo root: npm i --no-save planck@1.4.2 && node contraption/tools/check-puzzles.js
const CE = require('../engine.js');

const SOLUTIONS = {
  roll: { parts: [{ t: 'plank', x: 450, y: 300, w: 400, a: 15 }] },
  bounce: { parts: [{ t: 'trampoline', x: 400, y: 627 }] },
  dunk: { parts: [{ t: 'seesaw', x: 545, y: 620, f: -1 }, { t: 'ball_basket', x: 493, y: 600 }] },
  loose: { parts: [{ t: 'plank', x: 540, y: 500, w: 100 }, { t: 'candle', x: 492, y: 470 }] },
  breeze: { parts: [{ t: 'fan', x: 420, y: 276 }], links: [{ k: 'belt', a: 'f2', b: 'u0' }] },
  dominoes: { parts: [], links: [{ k: 'belt', a: 'f0', b: 'f2' }] },
  wake: { parts: [{ t: 'plank', x: 220, y: 300, w: 100, a: 30 }, { t: 'ball_base', x: 190, y: 268 }] },
  cheese: { parts: [{ t: 'plank', x: 530, y: 550, w: 340, a: -30 }] },
  lift: { parts: [{ t: 'plank', x: 600, y: 280, w: 80, a: 60 }] },
  chain: { parts: [{ t: 'ball_base', x: 600, y: 400 }] }
};

function settleY(p, others) {
  // drop a part straight down until it would touch something (keeps hand-written y values honest)
  for (let y = p.y; y < CE.FIELD_H; y++) {
    const q = { ...p, y: y + 1 };
    if (!CE.inField(q) || others.some(o => CE.partsOverlap(q, o))) return y;
  }
  return p.y;
}

let failed = 0;
for (const pz of CE.PUZZLES) {
  const fixed = pz.parts.map(p => ({ ...p }));
  for (let i = 0; i < fixed.length; i++) for (let j = i + 1; j < fixed.length; j++)
    if (CE.partsOverlap(fixed[i], fixed[j])) { console.log(`  ${pz.id}: fixed parts ${fixed[i].id} and ${fixed[j].id} overlap`); failed++; }
  const runFor = (parts, links, secs) => {
    const sim = new CE.Sim([...fixed.map(p => ({ ...p })), ...parts], [...pz.links, ...links], pz.goal);
    for (let i = 0; i < secs * 60 && !sim.solved; i++) sim.step();
    return sim;
  };
  const idle = runFor([], [], 15);
  const sol = SOLUTIONS[pz.id];
  const parts = sol.parts.map((p, i) => Object.assign(CE.newPart(p.t, p.x, p.y), p, { id: 'u' + i }));
  for (const p of parts) if (p.t === 'ball_basket' || p.t === 'ball_base' && pz.id === 'wake') p.y = settleY(p, [...fixed, ...parts.filter(q => q !== p)]);
  const bad = parts.filter(p => !CE.inField(p) || [...fixed, ...parts].some(q => q !== p && CE.partsOverlap(p, q)));
  const run = runFor(parts, sol.links || [], 15);
  const ok = !idle.solved && run.solved && !bad.length;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${pz.id.padEnd(9)} idle:${idle.solved ? 'solved!' : 'unsolved'}  solution:${run.solved ? 'solved in ' + run.solvedAt.toFixed(1) + 's' : 'unsolved'}${bad.length ? '  overlapping: ' + bad.map(p => p.t) : ''}`);
}
process.exit(failed ? 1 : 0);
