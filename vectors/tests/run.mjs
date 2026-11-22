// Run with: node vectors/tests/run.mjs  (no dependencies)
import { createRequire } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const G = require('../geometry.js');
const L = require('../steps.js');
const close = (x, y, eps = 1e-9) => assert.ok(Math.abs(x - y) < eps, `${x} ≈ ${y}`);

test('vector arithmetic', () => {
  assert.deepEqual(G.add({ x: 1, y: 2 }, { x: 3, y: -1 }), { x: 4, y: 1 });
  assert.deepEqual(G.sub({ x: 1, y: 2 }, { x: 3, y: -1 }), { x: -2, y: 3 });
  assert.deepEqual(G.scale({ x: 1, y: -2 }, 3), { x: 3, y: -6 });
  assert.deepEqual(G.midpoint({ x: 0, y: 0 }, { x: 4, y: 6 }), { x: 2, y: 3 });
  close(G.cross({ x: 1, y: 0 }, { x: 0, y: 1 }), 1);
});

test('accurate diagram matches the plan coordinates', () => {
  const g = G.build(G.ACCURATE);
  assert.deepEqual(g.C, { x: 500, y: 220 });
  assert.deepEqual(g.A, { x: 340, y: 455 });
  assert.deepEqual(g.B, { x: 340, y: 55 });
  assert.deepEqual(g.F, { x: 660, y: 185 });
  assert.deepEqual(g.E, { x: 660, y: 485 });
  assert.deepEqual(g.M, { x: 420, y: 137.5 });
  close(g.N.x, 500); close(g.N.y, 420 - 500 / 3);
});

test('diagram is internally consistent (both modes)', () => {
  for (const mode of [G.ACCURATE, G.SCHEMATIC]) {
    const g = G.build(mode);
    const M = G.midpoint(g.B, g.C);
    close(g.M.x, M.x); close(g.M.y, M.y);
    assert.ok(G.collinear(g.M, g.N, g.E), 'M, N, E collinear');
    assert.ok(G.collinear(g.D, g.N, g.C), 'N on DC');
    close(G.cross(G.sub(g.B, g.A), G.sub(g.C, g.D)), 0); // AB ∥ DC
    close(G.cross(G.sub(g.F, g.E), G.sub(g.C, g.D)), 0); // EF ∥ DC
    assert.deepEqual(G.sub(g.D, g.A), G.sub(g.F, g.C));  // AD = CF = b
    close(g.tME, 1 / 3);                                 // MN : NE = 1 : 2
  }
});

test('answer: DN = 5/3 a, NC = 1/3 a, k = 5', () => {
  const s = G.solveInBasis();
  assert.deepEqual(s.M, [3, -0.5]);   // DM = 3a − ½b
  assert.deepEqual(s.E, [-1, 1]);     // DE = b − a
  close(s.t, 1 / 3);
  close(s.DN, 5 / 3); close(s.NC, 1 / 3); close(s.k, 5);
  close(G.build(G.ACCURATE).uDC, 5 / 6);
});

test('schematic diagram does not suggest an integer ratio', () => {
  const k = G.solveInBasis(G.SCHEMATIC.ab, G.SCHEMATIC.ef).k;
  assert.ok(Math.abs(k - Math.round(k)) > 0.2, `schematic k = ${k}`);
});

test('every approach ends with k = 5, and only the final step reveals it', () => {
  const spoiler = /k\s*=\s*5|5\s*:\s*1|boxed|5⁄3|\\tfrac53|ratioDC/;
  for (const a of L.approaches) {
    const last = a.steps[a.steps.length - 1];
    assert.ok(last.final, `${a.id} last step is final`);
    assert.ok(last.eq.some((e) => /\\boxed\{k=5\}/.test(e)), `${a.id} boxes k=5`);
    a.steps.slice(0, -1).forEach((s, i) => {
      assert.ok(!s.final, `${a.id} step ${i + 1} not final`);
      const text = JSON.stringify(s);
      // the value 5/3 may appear as working (x = 5/3, DN = 5/3 a) only in the step just before the end
      const allowed = i === a.steps.length - 2 ? /k\s*=\s*5|5\s*:\s*1|boxed|ratioDC/ : spoiler;
      assert.ok(!allowed.test(text), `${a.id} step ${i + 1} leaks the answer: ${text.match(allowed)}`);
    });
  }
});
