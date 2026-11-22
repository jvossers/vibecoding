/* Pure vector geometry for the two-trapezium diagram.
   Classic script (works from file://) that also loads in Node via require(). */
(function (root) {
  'use strict';
  const add = (p, q) => ({ x: p.x + q.x, y: p.y + q.y });
  const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
  const scale = (p, k) => ({ x: p.x * k, y: p.y * k });
  const midpoint = (p, q) => scale(add(p, q), 0.5);
  const lerp = (p, q, t) => add(p, scale(sub(q, p), t));
  const cross = (p, q) => p.x * q.y - p.y * q.x;
  const len = (p) => Math.hypot(p.x, p.y);
  const collinear = (p, q, r, eps = 1e-6) =>
    Math.abs(cross(sub(q, p), sub(r, p))) <= eps * Math.max(1, len(sub(q, p)) * len(sub(r, p)));

  /* Intersection of line p1→p2 with line p3→p4, returned as the point and
     the parameters along each line. */
  function intersect(p1, p2, p3, p4) {
    const r = sub(p2, p1), s = sub(p4, p3);
    const d = cross(r, s);
    const t = cross(sub(p3, p1), s) / d;
    const u = cross(sub(p3, p1), r) / d;
    return { point: add(p1, scale(r, t)), t, u };
  }

  /* Screen basis from the plan: D=(500,420), a=(0,-100), b=(160,-35).
     ab / ef are the drawn multiples of a for AB and EF. The true problem has
     ab=4, ef=3. The "not drawn accurately" version used before the answer is
     revealed uses different lengths so the picture can't give the ratio away. */
  const BASIS = { D: { x: 500, y: 420 }, a: { x: 0, y: -100 }, b: { x: 160, y: -35 } };
  const ACCURATE = { ab: 4, ef: 3 };
  const SCHEMATIC = { ab: 3.4, ef: 3.2 };

  function build(opts = ACCURATE, basis = BASIS) {
    const { D, a, b } = basis;
    const C = add(D, scale(a, 2));
    const A = sub(D, b);
    const B = add(A, scale(a, opts.ab));
    const F = add(C, b);
    const E = sub(F, scale(a, opts.ef));
    const M = midpoint(B, C);
    const hit = intersect(M, E, D, C); // t along ME, u along DC
    const N = hit.point;
    return { A, B, C, D, E, F, M, N, a, b, tME: hit.t, uDC: hit.u };
  }

  function mix(o1, o2, p) {
    return { ab: o1.ab + (o2.ab - o1.ab) * p, ef: o1.ef + (o2.ef - o1.ef) * p };
  }

  /* The same problem in the (a, b) basis with D as origin: exact algebra. */
  function solveInBasis(ab = 4, ef = 3) {
    const D = [0, 0], C = [2, 0], A = [0, -1], B = [ab, -1], F = [2, 1], E = [2 - ef, 1];
    const M = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const ME = [E[0] - M[0], E[1] - M[1]];
    const t = -M[1] / ME[1];
    const dn = M[0] + t * ME[0];
    return { D, C, A, B, F, E, M, ME, t, DN: dn, NC: 2 - dn, k: dn / (2 - dn) };
  }

  const api = { add, sub, scale, midpoint, lerp, cross, len, collinear, intersect,
    BASIS, ACCURATE, SCHEMATIC, build, mix, solveInBasis };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Geo = api;
})(typeof window !== 'undefined' ? window : globalThis);
