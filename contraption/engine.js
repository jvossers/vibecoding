/* Contraption engine: part catalogue, geometry, physics simulation, puzzles and share codes.
   Works in the browser (global `Contraption`) and in Node (module.exports) for tests.
   All positions are in field pixels (960 x 640, y pointing down). Physics runs in metres. */
(function (root, planck) {
  'use strict';

  const PPM = 40;               // pixels per metre
  const FIELD_W = 960, FIELD_H = 640;
  const GRAVITY = 12;           // m/s², y down
  const DT = 1 / 60;
  const GRID = 10;
  const rad = d => d * Math.PI / 180;
  const V = (x, y) => planck.Vec2(x / PPM, y / PPM);

  /* ---------- geometry ---------- */

  const box = (cx, cy, w, h) => ({ k: 'poly', pts: [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]] });
  const circ = (x, y, r) => ({ k: 'circle', x, y, r });
  const poly = pts => ({ k: 'poly', pts });

  // local (unflipped) point -> world point for a part
  function toWorld(p, lx, ly) {
    const a = rad(p.a || 0), c = Math.cos(a), s = Math.sin(a), x = lx * (p.f || 1);
    return [p.x + x * c - ly * s, p.y + x * s + ly * c];
  }
  function toLocal(p, wx, wy) {
    const a = rad(p.a || 0), c = Math.cos(a), s = Math.sin(a), dx = wx - p.x, dy = wy - p.y;
    return [(dx * c + dy * s) * (p.f || 1), -dx * s + dy * c];
  }
  function flipShape(sh, f) {
    if (f !== -1) return sh;
    return sh.k === 'circle' ? circ(-sh.x, sh.y, sh.r) : poly(sh.pts.map(([x, y]) => [-x, y]));
  }
  function worldShapes(p) {
    return TYPES[p.t].shapes(p).map(sh => sh.k === 'circle'
      ? (([x, y]) => circ(x, y, sh.r))(toWorld(p, sh.x, sh.y))
      : poly(sh.pts.map(([x, y]) => toWorld(p, x, y))));
  }
  function bounds(shapes) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const sh of shapes) {
      if (sh.k === 'circle') { x0 = Math.min(x0, sh.x - sh.r); y0 = Math.min(y0, sh.y - sh.r); x1 = Math.max(x1, sh.x + sh.r); y1 = Math.max(y1, sh.y + sh.r); }
      else for (const [x, y] of sh.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    return { x0, y0, x1, y1 };
  }
  function partBounds(p) { return bounds(worldShapes(p)); }

  function axesOf(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
      const nx = y1 - y0, ny = x0 - x1, l = Math.hypot(nx, ny) || 1;
      out.push([nx / l, ny / l]);
    }
    return out;
  }
  function proj(sh, [ax, ay]) {
    if (sh.k === 'circle') { const c = sh.x * ax + sh.y * ay; return [c - sh.r, c + sh.r]; }
    let lo = Infinity, hi = -Infinity;
    for (const [x, y] of sh.pts) { const d = x * ax + y * ay; if (d < lo) lo = d; if (d > hi) hi = d; }
    return [lo, hi];
  }
  // true when two shapes overlap by more than `slack` px
  function shapesOverlap(a, b, slack) {
    if (a.k === 'circle' && b.k === 'circle') return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r - slack;
    const axes = [];
    if (a.k === 'poly') axes.push(...axesOf(a.pts));
    if (b.k === 'poly') axes.push(...axesOf(b.pts));
    const c = a.k === 'circle' ? a : b.k === 'circle' ? b : null;
    if (c) {
      const pg = c === a ? b : a; let best = null, bd = Infinity;
      for (const [x, y] of pg.pts) { const d = Math.hypot(x - c.x, y - c.y); if (d < bd) { bd = d; best = [x, y]; } }
      const l = bd || 1; axes.push([(best[0] - c.x) / l, (best[1] - c.y) / l]);
    }
    for (const ax of axes) {
      const [a0, a1] = proj(a, ax), [b0, b1] = proj(b, ax);
      if (Math.min(a1, b1) - Math.max(a0, b0) <= slack) return false;
    }
    return true;
  }
  function partsOverlap(p, q) {
    const A = worldShapes(p), B = worldShapes(q);
    const ba = bounds(A), bb = bounds(B);
    if (ba.x1 < bb.x0 || bb.x1 < ba.x0 || ba.y1 < bb.y0 || bb.y1 < ba.y0) return false;
    for (const a of A) for (const b of B) if (shapesOverlap(a, b, 1.5)) return true;
    return false;
  }
  function pointInShape(sh, x, y, pad) {
    if (sh.k === 'circle') return Math.hypot(x - sh.x, y - sh.y) <= sh.r + pad;
    if (pad) { const b = bounds([sh]); if (x < b.x0 - pad || x > b.x1 + pad || y < b.y0 - pad || y > b.y1 + pad) return false; }
    let sign = 0; const n = sh.pts.length;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = sh.pts[i], [x1, y1] = sh.pts[(i + 1) % n];
      const cr = (x1 - x0) * (y - y0) - (y1 - y0) * (x - x0);
      const len = Math.hypot(x1 - x0, y1 - y0) || 1;
      if (cr / len < -pad && sign > 0) return false;
      if (cr / len > pad && sign < 0) return false;
      if (Math.abs(cr / len) > pad) sign = sign || Math.sign(cr);
    }
    return true;
  }
  function hitPart(p, x, y, pad) {
    if (T[p.t].hitBox) { const [lx, ly] = toLocal(p, x, y); return Math.abs(lx) <= 22 + pad && ly >= -30 - pad && ly <= 20 + pad; }
    return worldShapes(p).some(sh => pointInShape(sh, x, y, pad));
  }
  function inField(p) { const b = partBounds(p); return b.x0 >= -1 && b.y0 >= -1 && b.x1 <= FIELD_W + 1 && b.y1 <= FIELD_H + 1; }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }

  /* ---------- part catalogue ---------- */
  // shapes(p): convex shapes in local px coords (before flip). They drive physics, overlap and hit tests.
  // body: 'dynamic' | 'static' | custom build(sim, p, rt).

  const T = {};
  const def = (id, o) => { T[id] = Object.assign({ id, rot: 0, flip: false, resize: null, rope: null, belt: null, power: null }, o); };

  def('ball_bowl', { name: 'Bowling ball', group: 'Balls', desc: 'Heavy. Knocks things over and barely bounces.',
    shapes: () => [circ(0, 0, 14)], body: 'dynamic', mat: { d: 6, f: 0.3, r: 0.05 }, damp: [0.05, 0.6], rope: [0, 0], trail: true });
  def('ball_basket', { name: 'Basketball', group: 'Balls', desc: 'Light and very bouncy.',
    shapes: () => [circ(0, 0, 14)], body: 'dynamic', mat: { d: 0.45, f: 0.5, r: 0.82 }, damp: [0.02, 0.2], rope: [0, 0], trail: true });
  def('ball_base', { name: 'Baseball', group: 'Balls', desc: 'Small and fast. Fits through narrow gaps.',
    shapes: () => [circ(0, 0, 9)], body: 'dynamic', mat: { d: 1.6, f: 0.4, r: 0.5 }, damp: [0.02, 0.4], rope: [0, 0], trail: true });
  def('yarn', { name: 'Ball of yarn', group: 'Balls', desc: 'Soft and light. Cats can’t resist batting it.',
    shapes: () => [circ(0, 0, 12)], body: 'dynamic', mat: { d: 0.35, f: 0.9, r: 0.15 }, damp: [0.2, 0.8], rope: [0, 0], trail: true });
  def('balloon', { name: 'Balloon', group: 'Balls', desc: 'Floats up. Pops on flames, cactus spines and scissors.',
    shapes: () => [circ(0, -2, 14)], body: 'dynamic', mat: { d: 0.15, f: 0.3, r: 0.4 }, damp: [1.5, 3], gravity: -0.55, rope: [0, 15], trail: true });

  def('crate', { name: 'Crate', group: 'Things', desc: 'A sturdy wooden box. Slides, stacks and pushes.',
    shapes: () => [box(0, 0, 36, 36)], body: 'dynamic', mat: { d: 0.9, f: 0.7, r: 0.05 }, rope: [0, -18], trail: true });
  def('domino', { name: 'Domino', group: 'Things', desc: 'Stands tall until something tips it over.',
    shapes: () => [box(0, 0, 10, 44)], body: 'dynamic', mat: { d: 1.4, f: 0.5, r: 0 } });
  def('bucket', { name: 'Bucket', group: 'Things', desc: 'Catches balls. Gets heavier as it fills.',
    shapes: () => [box(0, 18, 44, 4), box(-20, -1, 4, 34), box(20, -1, 4, 34)], body: 'dynamic', mat: { d: 0.5, f: 0.6, r: 0 }, rope: [0, -26], trail: true, hitBox: true });
  def('cheese', { name: 'Cheese', group: 'Things', desc: 'Pip the mouse will walk a long way for this.',
    shapes: () => [poly([[-15, 8], [15, 8], [15, -8], [-15, 2]])], body: 'dynamic', mat: { d: 0.6, f: 0.6, r: 0.1 } });

  def('plank', { name: 'Plank', group: 'Build', desc: 'A wooden ramp. Tilts in 15° steps.', rot: 15, resize: { min: 40, max: 480, step: 20, def: 160 },
    shapes: p => [box(0, 0, p.w, 10)], body: 'static', mat: { f: 0.35, r: 0.1 } });
  def('wall', { name: 'Wall', group: 'Build', desc: 'Solid brick. Stretch it or stand it on end.', rot: 90, resize: { min: 40, max: 640, step: 20, def: 120 },
    shapes: p => [box(0, 0, p.w, 20)], body: 'static', mat: { f: 0.6, r: 0.1 } });
  const SEESAW_PLANK = [box(0, 0, 150, 8), box(-72, -7, 6, 6), box(72, -7, 6, 6)];
  def('seesaw', { name: 'See-saw', group: 'Build', desc: 'Weight on one end flings the other end up.', flip: true,
    shapes: () => { const t = rad(15), c = Math.cos(t), s = Math.sin(t);
      const tf = ([x, y]) => [x * c - (y - 4) * s, -12 + x * s + (y - 4) * c];
      return [...SEESAW_PLANK.map(sh => poly(sh.pts.map(tf))), poly([[0, -12], [17, 20], [-17, 20]])]; },
    build: buildSeesaw });
  def('trampoline', { name: 'Trampoline', group: 'Build', desc: 'Bounces things back higher than they fell.', rot: 15,
    shapes: () => [box(0, 0, 70, 26)], build: buildTrampoline });
  def('peg', { name: 'Peg', group: 'Build', desc: 'A fixed point to tie a rope to.',
    shapes: () => [circ(0, 0, 6)], body: 'static', mat: { f: 0.5, r: 0.1 }, rope: [0, 0], anchor: true });
  def('pulley', { name: 'Pulley', group: 'Build', desc: 'Run a rope over it to lift one thing with another.',
    shapes: () => [circ(0, 0, 12)], body: 'static', mat: { f: 0.3, r: 0.1 }, pulley: true });
  def('hoop', { name: 'Hoop', group: 'Build', desc: 'A basketball hoop with a backboard.', flip: true,
    shapes: () => [box(31, -22, 6, 60), circ(-25, 6, 3), box(25, 6, 6, 4)], body: 'static', mat: { f: 0.4, r: 0.4 } });
  def('cushion', { name: 'Cushion', group: 'Build', desc: 'Mochi the cat naps the moment she reaches it.',
    shapes: () => [box(0, 0, 72, 14)], body: 'static', mat: { f: 0.9, r: 0 } });

  def('motor', { name: 'Mouse wheel', group: 'Power', desc: 'A mouse running in a wheel. Powers anything you belt to it.',
    shapes: () => [circ(0, -6, 24), box(0, 26, 52, 12)], body: 'static', mat: { f: 0.5, r: 0.1 }, belt: [0, -6], power: 'source' });
  def('conveyor', { name: 'Conveyor', group: 'Power', desc: 'Carries things along, but only while powered by a belt.', rot: 15, flip: true,
    resize: { min: 80, max: 480, step: 20, def: 160 },
    shapes: p => [box(0, 0, p.w, 18)], body: 'static', mat: { f: 1, r: 0 }, belt: p => [-(p.w / 2 - 9), 0], power: 'sink' });
  def('fan', { name: 'Fan', group: 'Power', desc: 'Blows light things away. Needs power from a belt.', rot: 90, flip: true,
    shapes: () => [circ(0, -4, 20), box(-2, 21, 30, 8)], body: 'static', mat: { f: 0.5, r: 0.1 }, belt: [0, -4], power: 'sink' });

  def('candle', { name: 'Candle', group: 'Hazards', desc: 'Pops balloons and burns through rope.',
    shapes: () => [box(0, 8, 14, 28), box(0, 23, 22, 4)], build: buildCandle });
  def('scissors', { name: 'Scissors', group: 'Hazards', desc: 'Snip shut when bumped, cutting any rope nearby.', flip: true,
    shapes: () => [poly([[-22, -8], [6, -6], [22, 0], [6, 6], [-22, 8]])], body: 'static', mat: { f: 0.4, r: 0.2 }, sharp: true });
  def('cactus', { name: 'Cactus', group: 'Hazards', desc: 'Spiky. Balloons do not survive meeting it.', rot: 90,
    shapes: () => [box(0, 4, 16, 38), circ(0, -15, 8), box(0, 21, 26, 6)], body: 'static', mat: { f: 0.6, r: 0.1 }, sharp: true });

  def('cat', { name: 'Mochi the cat', group: 'Characters', desc: 'Naps until something bumps her. Then she chases mice and yarn.', flip: true,
    shapes: () => [poly([[-24, -15], [24, -15], [24, 9], [19, 15], [-19, 15], [-24, 9]])], build: buildCharacter });
  def('mouse', { name: 'Pip the mouse', group: 'Characters', desc: 'Walks toward cheese. Runs from cats.', flip: true,
    shapes: () => [poly([[-14, -8], [14, -8], [14, 4], [10, 8], [-10, 8], [-14, 4]])], build: buildCharacter });

  const TYPES = T;
  const TYPE_IDS = Object.keys(T);
  const GROUPS = ['Balls', 'Things', 'Build', 'Power', 'Hazards', 'Characters'];
  const LINKS = {
    rope: { name: 'Rope', desc: 'Ties two things together, or runs over a pulley.' },
    belt: { name: 'Belt', desc: 'Carries power from a mouse wheel to a conveyor or fan.' }
  };

  function newPart(t, x, y) {
    const d = T[t], p = { t, x, y, a: 0, f: 1 };
    if (d.resize) p.w = d.resize.def;
    return p;
  }
  function ropePoint(p) { const d = T[p.t]; if (!d.rope) return null; return toWorld(p, d.rope[0], d.rope[1]); }
  function beltPoint(p) { const d = T[p.t]; if (!d.belt) return null; const b = typeof d.belt === 'function' ? d.belt(p) : d.belt; return toWorld(p, b[0], b[1]); }
  function canRope(p) { const d = T[p.t]; return !!(d.rope || d.pulley); }
  function canBelt(p) { return !!T[p.t].power; }

  /* ---------- custom builders ---------- */

  function fixtureFromShape(body, sh, f, opt) {
    sh = flipShape(sh, f);
    const shape = sh.k === 'circle' ? planck.Circle(V(sh.x, sh.y), sh.r / PPM) : planck.Polygon(sh.pts.map(([x, y]) => V(x, y)));
    return body.createFixture(Object.assign({ shape }, opt));
  }
  function matOpt(m) { return { density: m.d || 0, friction: m.f == null ? 0.5 : m.f, restitution: m.r || 0 }; }

  function buildSeesaw(sim, p, rt) {
    const f = p.f || 1;
    const base = sim.world.createBody({ type: 'static', position: V(p.x, p.y) });
    fixtureFromShape(base, poly([[0, -12], [17, 20], [-17, 20]]), f, { friction: 0.6 });
    const pivot = V(p.x, p.y - 12);
    const t = rad(15) * f;
    const plank = sim.world.createBody({ type: 'dynamic', position: planck.Vec2(pivot.x + Math.sin(t) * 4 / PPM, pivot.y - Math.cos(t) * 4 / PPM), angle: t });
    for (const sh of SEESAW_PLANK) fixtureFromShape(plank, sh, 1, { density: 1, friction: 0.6 });
    sim.world.createJoint(planck.RevoluteJoint({ enableLimit: true, lowerAngle: -rad(15) - t, upperAngle: rad(15) - t }, base, plank, pivot));
    base.setUserData({ rt }); plank.setUserData({ rt });
    rt.body = plank; rt.bodies = [base, plank];
  }
  function buildTrampoline(sim, p, rt) {
    const b = sim.world.createBody({ type: 'static', position: V(p.x, p.y), angle: rad(p.a || 0) });
    fixtureFromShape(b, box(0, -10, 70, 6), 1, { friction: 0.3, restitution: 1.08 });
    fixtureFromShape(b, box(-31, 4, 4, 18), 1, { friction: 0.5 });
    fixtureFromShape(b, box(31, 4, 4, 18), 1, { friction: 0.5 });
    b.setUserData({ rt }); rt.body = b; rt.bodies = [b];
  }
  function buildCandle(sim, p, rt) {
    const b = sim.world.createBody({ type: 'static', position: V(p.x, p.y) });
    for (const sh of T.candle.shapes(p)) fixtureFromShape(b, sh, 1, { friction: 0.5 });
    const flame = fixtureFromShape(b, circ(0, -14, 7), 1, { isSensor: true });
    flame.setUserData('flame');
    b.setUserData({ rt }); rt.body = b; rt.bodies = [b];
    rt.flame = toWorld(p, 0, -14);
  }
  function buildCharacter(sim, p, rt) {
    const b = sim.world.createBody({ type: 'dynamic', position: V(p.x, p.y), fixedRotation: true });
    const cat = p.t === 'cat';
    fixtureFromShape(b, T[p.t].shapes(p)[0], 1, { density: cat ? 1 : 0.8, friction: 0.05, restitution: 0 });
    b.setUserData({ rt }); rt.body = b; rt.bodies = [b];
    rt.dir = p.f || 1;
    rt.state = cat ? (p.aw ? 'awake' : 'asleep') : 'walk';
    rt.push = 0; rt.cool = 0; rt.timer = 0; rt.anim = 0;
  }

  /* ---------- simulation ---------- */

  class Sim {
    constructor(parts, links, goal) {
      const w = this.world = planck.World({ gravity: planck.Vec2(0, GRAVITY) });
      this.goal = goal || null;
      this.events = { pop: 0, eat: 0, nap: 0, wake: 0, snip: 0, burn: 0 };
      this.fx = [];
      this.sounds = [];
      this.time = 0; this.frame = 0;
      this.solved = false; this.goalHeld = 0; this.solvedAt = null;
      this.queue = [];
      this.rt = new Map();
      this.trails = new Map();

      const edges = w.createBody({ type: 'static' });
      edges.createFixture({ shape: planck.Edge(V(-40, FIELD_H), V(FIELD_W + 40, FIELD_H)), friction: 0.6, restitution: 0.1 });
      edges.createFixture({ shape: planck.Edge(V(0, 0), V(0, FIELD_H)), friction: 0.3 });
      edges.createFixture({ shape: planck.Edge(V(FIELD_W, 0), V(FIELD_W, FIELD_H)), friction: 0.3 });
      edges.createFixture({ shape: planck.Edge(V(-40, 0), V(FIELD_W + 40, 0)), friction: 0.3 });
      edges.setUserData({ rt: { p: { t: 'edge' } } });

      for (const p of parts) this.addPart(p);
      this.links = [];
      for (const l of links || []) this.addLink(l);
      this.propagatePower();

      w.on('begin-contact', c => this.onBegin(c));
      w.on('pre-solve', c => this.onPreSolve(c));
    }

    addPart(p) {
      const d = T[p.t];
      const rt = { p, id: p.id, t: p.t, bodies: [], alive: true, spin: 0, powered: false };
      if (d.build) d.build(this, p, rt);
      else {
        const dyn = d.body === 'dynamic';
        const b = this.world.createBody({ type: dyn ? 'dynamic' : 'static', position: V(p.x, p.y), angle: rad(p.a || 0),
          linearDamping: d.damp ? d.damp[0] : 0, angularDamping: d.damp ? d.damp[1] : 0.1, gravityScale: d.gravity == null ? 1 : d.gravity,
          bullet: p.t === 'ball_base' });
        for (const sh of d.shapes(p)) fixtureFromShape(b, sh, p.f || 1, Object.assign(matOpt(d.mat), { isSensor: !!d.anchor }));
        b.setUserData({ rt });
        rt.body = b; rt.bodies = [b];
      }
      if (rt.body && rt.body.isDynamic()) {
        let area = 0;
        for (let f = rt.body.getFixtureList(); f; f = f.getNext()) {
          const md = { mass: 0, center: planck.Vec2(), I: 0 }; f.getShape().computeMass(md, 1); area += md.mass;
        }
        rt.area = area;
      }
      this.rt.set(p.id, rt);
      if (d.trail) this.trails.set(p.id, []);
      return rt;
    }

    addLink(l) {
      const A = this.rt.get(l.a), B = this.rt.get(l.b), C = l.c != null ? this.rt.get(l.c) : null;
      if (!A || !B) return;
      const lk = { l, kind: l.k, cut: false, burn: 0 };
      if (l.k === 'belt') { lk.A = A; lk.B = B; this.links.push(lk); return; }
      if (C) {
        // A over pulley B to C
        const pa = ropePoint(A.p), pc = ropePoint(C.p), pb = [B.p.x, B.p.y];
        const r = 12, side = pa[0] <= pc[0] ? -1 : 1;
        const gA = [pb[0] + side * r, pb[1]], gC = [pb[0] - side * r, pb[1]];
        const lenA = Math.hypot(pa[0] - gA[0], pa[1] - gA[1]), lenC = Math.hypot(pc[0] - gC[0], pc[1] - gC[1]);
        lk.joint = this.world.createJoint(planck.PulleyJoint({
          bodyA: A.body, bodyB: C.body, groundAnchorA: V(...gA), groundAnchorB: V(...gC),
          localAnchorA: A.body.getLocalPoint(V(...pa)), localAnchorB: C.body.getLocalPoint(V(...pc)),
          lengthA: lenA / PPM, lengthB: lenC / PPM, ratio: 1 }));
        lk.A = A; lk.P = B; lk.B = C; lk.gA = gA; lk.gB = gC; lk.len = lenA + lenC;
        lk.la = A.body.getLocalPoint(V(...pa)); lk.lb = C.body.getLocalPoint(V(...pc));
      } else {
        const pa = ropePoint(A.p), pb = ropePoint(B.p);
        const len = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
        lk.joint = this.world.createJoint(planck.RopeJoint({ bodyA: A.body, bodyB: B.body,
          localAnchorA: A.body.getLocalPoint(V(...pa)), localAnchorB: B.body.getLocalPoint(V(...pb)), maxLength: len / PPM, collideConnected: true }));
        lk.A = A; lk.B = B; lk.len = len;
        lk.la = A.body.getLocalPoint(V(...pa)); lk.lb = B.body.getLocalPoint(V(...pb));
      }
      this.links.push(lk);
    }

    propagatePower() {
      const on = new Set();
      for (const rt of this.rt.values()) if (T[rt.t].power === 'source') on.add(rt);
      let grew = true;
      while (grew) {
        grew = false;
        for (const lk of this.links) if (lk.kind === 'belt' && !lk.cut) {
          if (on.has(lk.A) && !on.has(lk.B)) { on.add(lk.B); grew = true; }
          if (on.has(lk.B) && !on.has(lk.A)) { on.add(lk.A); grew = true; }
        }
      }
      for (const rt of this.rt.values()) rt.powered = on.has(rt);
      for (const lk of this.links) lk.powered = lk.kind === 'belt' && on.has(lk.A);
    }

    // world-space points of a rope for drawing and cutting: list of segments
    ropeSegments(lk) {
      const P = b => { const v = b; return [v.x * PPM, v.y * PPM]; };
      if (lk.P) {
        const a = P(lk.A.body.getWorldPoint(lk.la)), c = P(lk.B.body.getWorldPoint(lk.lb));
        return [[a, lk.gA], [lk.gB, c]];
      }
      return [[P(lk.A.body.getWorldPoint(lk.la)), P(lk.B.body.getWorldPoint(lk.lb))]];
    }

    onBegin(c) {
      const fa = c.getFixtureA(), fb = c.getFixtureB();
      const A = fa.getBody().getUserData(), B = fb.getBody().getUserData();
      if (!A || !B) return;
      this.pair(A.rt, B.rt, fa, fb, c);
      this.pair(B.rt, A.rt, fb, fa, c);
    }
    pair(a, b, fa, fb, c) {
      const ta = a.p.t, tb = b.p.t;
      if (ta === 'balloon' && (fb.getUserData() === 'flame' || T[tb] && T[tb].sharp)) this.queue.push(['pop', a]);
      if (ta === 'mouse' && tb === 'cheese') this.queue.push(['eat', a, b]);
      if (ta === 'cat') {
        if (fb.getUserData() === 'flame') this.queue.push(['wake', a, 'hot']);
        else if (b.body && b.body.isDynamic() && tb !== 'mouse') {
          const va = a.body.getLinearVelocity(), vb = b.body.getLinearVelocity();
          if (Math.hypot(va.x - vb.x, va.y - vb.y) > 1.2) this.queue.push(['wake', a]);
        }
        if (tb === 'yarn' && a.state === 'awake') this.queue.push(['bat', a, b]);
        if (tb === 'mouse' && a.state === 'awake') this.queue.push(['scare', b, a]);
      }
      if (ta === 'scissors' && b.body && b.body.isDynamic() && !a.snipped) {
        const v = b.body.getLinearVelocity();
        if (Math.hypot(v.x, v.y) > 1) this.queue.push(['snip', a]);
      }
      if (ta === 'trampoline') this.sound('boing');
    }
    onPreSolve(c) {
      for (const [fx, other, sign] of [[c.getFixtureA(), c.getFixtureB(), 1], [c.getFixtureB(), c.getFixtureA(), -1]]) {
        const ud = fx.getBody().getUserData();
        if (ud && ud.rt.t === 'conveyor' && ud.rt.powered) c.setTangentSpeed(sign * (ud.rt.p.f || 1) * -2.4);
      }
    }

    sound(s) { if (this.sounds.length < 8) this.sounds.push(s); }

    kill(rt) {
      if (!rt.alive) return;
      rt.alive = false;
      for (const lk of this.links) if (lk.kind === 'rope' && !lk.cut && (lk.A === rt || lk.B === rt)) { lk.cut = true; }
      for (const b of rt.bodies) this.world.destroyBody(b);
    }
    cutRope(lk, why) {
      if (lk.cut) return;
      const segs = this.ropeSegments(lk);
      lk.cut = true; lk.cutAt = segs;
      this.world.destroyJoint(lk.joint);
      this.events[why]++;
      this.sound('snip');
    }

    runQueue() {
      const q = this.queue; this.queue = [];
      for (const [k, a, b] of q) {
        if (!a.alive) continue;
        if (k === 'pop') {
          const pos = a.body.getPosition();
          this.fx.push({ k: 'pop', x: pos.x * PPM, y: pos.y * PPM, t: 0 });
          this.kill(a); this.events.pop++; this.sound('pop');
          for (const rt of this.rt.values()) if (rt.t === 'cat' && rt.alive && rt.state === 'asleep') this.wake(rt);
        } else if (k === 'eat') {
          if (!b.alive) continue;
          const pos = b.body.getPosition();
          this.fx.push({ k: 'crumbs', x: pos.x * PPM, y: pos.y * PPM, t: 0 });
          this.kill(b); this.events.eat++; a.state = 'happy'; a.timer = 1.2; this.sound('nom');
        } else if (k === 'nap') {
          if (a.state !== 'awake') continue;
          a.state = 'nap'; this.events.nap++; this.sound('purr');
        } else if (k === 'wake') {
          this.wake(a, b === 'hot');
        } else if (k === 'bat') {
          if (!b.alive) continue;
          const m = b.body.getMass();
          b.body.applyLinearImpulse(planck.Vec2(a.dir * 2.2 * m, -2.5 * m), b.body.getWorldCenter(), true);
        } else if (k === 'scare') {
          a.state = 'flee'; a.timer = 2; a.dir = Math.sign(a.body.getPosition().x - b.body.getPosition().x) || 1; this.sound('squeak');
        } else if (k === 'snip') {
          this.snip(a);
        }
      }
    }
    wake(rt, hot) {
      if (rt.state === 'asleep') { rt.state = 'awake'; this.events.wake++; this.sound('meow'); rt.timer = 0.4; }
      if (hot && rt.state !== 'nap') {
        const v = rt.body.getLinearVelocity(); rt.body.setLinearVelocity(planck.Vec2(-rt.dir * 2, -6.5 + Math.min(v.y, 0)));
        this.sound('meow');
      }
    }
    snip(rt) {
      rt.snipped = true; rt.snipT = 0;
      const [cx, cy] = toWorld(rt.p, 12, 0);
      for (const lk of this.links) if (lk.kind === 'rope' && !lk.cut) {
        if (this.ropeSegments(lk).some(([a, b]) => segDist(cx, cy, a[0], a[1], b[0], b[1]) < 30)) this.cutRope(lk, 'snip');
      }
      for (const o of this.rt.values()) if (o.t === 'balloon' && o.alive) {
        const q = o.body.getPosition();
        if (Math.hypot(q.x * PPM - cx, q.y * PPM - cy) < 36) this.queue.push(['pop', o]);
      }
      this.sound('snip');
    }

    groundInfo(body, hh) {
      let grounded = false, wallL = false, wallR = false, stepL = false, stepR = false;
      const cy = body.getPosition().y * PPM;
      for (let ce = body.getContactList(); ce; ce = ce.next) {
        const c = ce.contact;
        if (!c.isTouching() || c.getFixtureA().isSensor() || c.getFixtureB().isSensor()) continue;
        const wm = c.getWorldManifold(null); if (!wm) continue;
        let nx = wm.normal.x, ny = wm.normal.y;
        if (c.getFixtureA().getBody() === body) { nx = -nx; ny = -ny; } // normal now points from other into this body
        if (ny < -0.5) grounded = true;
        const ob = ce.other;
        if (Math.abs(nx) > 0.5 && (!ob.isDynamic() || ob.getMass() > body.getMass() * 1.5)) {
          let low = true;
          for (let i = 0; i < c.getManifold().pointCount; i++) if (wm.points[i].y * PPM - cy < -hh * 0.4) low = false;
          if (low) { if (nx > 0) stepL = true; else stepR = true; }
          else if (nx > 0) wallL = true; else wallR = true;
        }
      }
      return { grounded, wallL, wallR, stepL, stepR };
    }

    updateCharacter(rt) {
      const b = rt.body, pos = b.getPosition(), v = b.getLinearVelocity();
      const px = pos.x * PPM, py = pos.y * PPM;
      const g = this.groundInfo(b, rt.t === 'cat' ? 15 : 8);
      rt.grounded = g.grounded;
      rt.timer = Math.max(0, rt.timer - DT);
      let speed = 0;
      const nearest = (type, maxDy) => {
        let best = null, bd = Infinity;
        for (const o of this.rt.values()) if (o.t === type && o.alive && o.body) {
          const q = o.body.getPosition(), dx = q.x * PPM - px, dy = q.y * PPM - py;
          if (maxDy != null && Math.abs(dy) > maxDy) continue;
          const d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = { o, dx, dy, d }; }
        }
        return best;
      };
      if (rt.t === 'mouse') {
        const cat = nearest('cat', 70);
        if (rt.state === 'happy') { speed = 0; if (rt.timer <= 0) rt.state = 'walk'; }
        else {
          if (cat && cat.o.state === 'awake' && Math.abs(cat.dx) < 170) { rt.state = 'flee'; rt.dir = cat.dx > 0 ? -1 : 1; rt.timer = Math.max(rt.timer, 0.5); }
          if (rt.state === 'flee') { speed = 4.2; if (rt.timer <= 0) rt.state = 'walk'; }
          else {
            const ch = nearest('cheese', 120);
            if (ch && Math.abs(ch.dx) < 420 && Math.abs(ch.dx) > 6 && rt.cool === 0) rt.dir = ch.dx > 0 ? 1 : -1;
            speed = 2.2;
          }
        }
      } else {
        if (rt.state === 'awake') for (const o of this.rt.values()) if (o.t === 'cushion') {
          const [lx, ly] = toLocal(o.p, px, py);
          if (Math.abs(lx) < 84 && ly > -50 && ly < 10) { rt.state = 'nap'; this.events.nap++; this.sound('purr'); rt.napOn = o; }
        }
        if (rt.state === 'asleep' || rt.state === 'nap') speed = 0;
        else if (rt.timer > 0) speed = 0; // stretching after waking
        else {
          const target = nearest('mouse', 90) || nearest('yarn', 90);
          if (target && Math.abs(target.dx) > 10 && rt.cool === 0) rt.dir = target.dx > 0 ? 1 : -1;
          speed = 3;
        }
      }
      const pushing = (rt.dir > 0 && g.wallR) || (rt.dir < 0 && g.wallL) || (g.grounded && v.x * rt.dir < speed * 0.3);
      rt.push = pushing && speed > 0 ? rt.push + DT : 0;
      rt.cool = Math.max(0, rt.cool - DT);
      if (rt.push > 0.4) { rt.dir = -rt.dir; rt.push = 0; rt.cool = 1.5; }
      const step = (rt.dir > 0 && g.stepR) || (rt.dir < 0 && g.stepL);
      if (step && speed > 0) { b.setLinearVelocity(planck.Vec2(rt.dir * speed, -2.4)); rt.push = 0; }
      else if (g.grounded && speed > 0) b.setLinearVelocity(planck.Vec2(rt.dir * speed, Math.min(v.y, 0.5)));
      else if (g.grounded && speed === 0) b.setLinearVelocity(planck.Vec2(v.x * 0.8, v.y));
      rt.anim += speed * DT * 4;
    }

    updateFans() {
      for (const rt of this.rt.values()) {
        if (rt.t !== 'fan' || !rt.powered) continue;
        rt.spin += DT * 25;
        const p = rt.p, a = rad(p.a || 0), f = p.f || 1;
        const dir = planck.Vec2(Math.cos(a) * f, Math.sin(a) * f);
        for (let b = this.world.getBodyList(); b; b = b.getNext()) {
          if (!b.isDynamic()) continue;
          const ud = b.getUserData(); if (!ud || !ud.rt.area) continue;
          const q = b.getWorldCenter();
          const [lx, ly] = toLocal(p, q.x * PPM, q.y * PPM);
          if (lx < 20 || lx > 340 || ly < -34 || ly > 26) continue;
          const wind = 7 * (1 - (lx - 20) / 360), v = b.getLinearVelocity();
          const k = 3 * ud.rt.area * Math.max(0, wind - (v.x * dir.x + v.y * dir.y));
          b.applyForceToCenter(planck.Vec2(dir.x * k, dir.y * k), true);
        }
      }
    }

    checkGoal() {
      const g = this.goal; if (!g) return false;
      const test = g => {
        if (g.type === 'all') return g.goals.every(test);
        if (g.type === 'event') return this.events[g.event] >= (g.count || 1);
        if (g.type === 'zone' || g.type === 'hoop') {
          let r = g.rect;
          if (g.type === 'hoop') { const h = this.rt.get(g.hoop).p; r = hoopZone(h); }
          for (const rt of this.rt.values()) {
            if (!rt.alive || !rt.body || (g.who !== rt.t && g.who !== rt.id)) continue;
            const q = rt.body.getPosition(), x = q.x * PPM, y = q.y * PPM;
            if (x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]) {
              if (g.type === 'hoop' && rt.body.getLinearVelocity().y < -0.2) continue;
              return true;
            }
          }
          return false;
        }
        if (g.type === 'toppled') {
          let n = 0;
          for (const rt of this.rt.values()) if (rt.t === g.who) { n++; if (rt.alive && Math.abs(Math.sin(rt.body.getAngle())) < 0.7) return false; }
          return n > 0;
        }
        return false;
      };
      return test(g);
    }

    step() {
      for (const rt of this.rt.values()) if (rt.alive && (rt.t === 'cat' || rt.t === 'mouse')) this.updateCharacter(rt);
      this.updateFans();
      this.world.step(DT, 8, 3);
      this.runQueue();
      this.time += DT; this.frame++;

      for (const rt of this.rt.values()) {
        if (rt.t === 'motor') rt.spin += DT * 9;
        if (rt.t === 'conveyor' && rt.powered) rt.spin += DT * 2.4 * PPM * (rt.p.f || 1);
        if (rt.t === 'scissors' && rt.snipped) rt.snipT += DT;
      }
      // flames burn ropes
      const flames = [...this.rt.values()].filter(r => r.t === 'candle').map(r => r.flame);
      for (const lk of this.links) if (lk.kind === 'rope' && !lk.cut) {
        const segs = this.ropeSegments(lk);
        const hot = flames.some(([fx, fy]) => segs.some(([a, b]) => segDist(fx, fy, a[0], a[1], b[0], b[1]) < 14));
        lk.burn = hot ? lk.burn + DT : Math.max(0, lk.burn - DT);
        if (lk.burn > 0.35) this.cutRope(lk, 'burn');
      }
      // trails
      if (this.frame % 3 === 0) for (const [id, pts] of this.trails) {
        const rt = this.rt.get(id); if (!rt.alive) continue;
        const q = rt.body.getPosition(), x = q.x * PPM, y = q.y * PPM, last = pts[pts.length - 1];
        if (!last || Math.hypot(last[0] - x, last[1] - y) > 4) { pts.push([x, y]); if (pts.length > 600) pts.shift(); }
      }
      for (const e of this.fx) e.t += DT;
      this.fx = this.fx.filter(e => e.t < 1);
      // fallen out of the world
      for (const rt of this.rt.values()) if (rt.alive && rt.body && rt.body.isDynamic() && rt.body.getPosition().y * PPM > FIELD_H + 200) this.kill(rt);

      if (!this.solved && this.goal) {
        const met = this.checkGoal();
        this.goalHeld = met ? this.goalHeld + DT : 0;
        if (met && this.goalHeld >= (this.goal.hold != null ? this.goal.hold : this.goal.type === 'hoop' ? 0 : 0.4)) { this.solved = true; this.solvedAt = this.time; this.sound('win'); }
      }
    }

    // current pose of a part's main body in px / radians
    pose(rt) {
      if (!rt.body) return null;
      const q = rt.body.getPosition();
      return { x: q.x * PPM, y: q.y * PPM, a: rt.body.getAngle() };
    }
  }

  function hoopZone(h) {
    const pts = [toWorld(h, -21, 8), toWorld(h, 19, 34)];
    return [Math.min(pts[0][0], pts[1][0]), pts[0][1], Math.abs(pts[1][0] - pts[0][0]), pts[1][1] - pts[0][1]];
  }
  function goalZones(goal, parts) {
    const out = [];
    const walk = g => {
      if (!g) return;
      if (g.type === 'all') g.goals.forEach(walk);
      if (g.type === 'zone') out.push(g.rect);
      if (g.type === 'hoop') { const h = parts.find(p => p.id === g.hoop); if (h) out.push(hoopZone(h)); }
    };
    walk(goal);
    return out;
  }

  /* ---------- puzzles ---------- */
  // Fixed parts are listed in `parts`; the player places parts from `bin`.

  const P = (t, x, y, o) => Object.assign(newPart(t, x, y), o || {});
  const PUZZLES = [
    {
      id: 'roll', title: 'Roll Out', goal: { type: 'zone', who: 'ball_bowl', rect: [700, 500, 140, 140] },
      text: 'Get the bowling ball into the brick pen.', hint: 'Put a plank under the end of the shelf so the ball rolls down and over the pen wall.',
      bin: { plank: 2 }, par: { parts: 1, time: 6 },
      parts: [P('plank', 140, 200, { w: 200, a: 15 }), P('ball_bowl', 70, 162), P('wall', 690, 580, { w: 120, a: 90 }), P('wall', 850, 580, { w: 120, a: 90 })]
    },
    {
      id: 'bounce', title: 'Bounce House', goal: { type: 'zone', who: 'ball_basket', rect: [660, 400, 300, 240] },
      text: 'Bounce the basketball over the tall wall.', hint: 'Floors soak up bounce. A trampoline gives it back.',
      bin: { trampoline: 1, plank: 1 }, par: { parts: 1, time: 6.5 },
      parts: [P('plank', 120, 160, { w: 180, a: 15 }), P('ball_basket', 60, 121), P('wall', 600, 470, { w: 340, a: 90 })]
    },
    {
      id: 'dunk', title: 'Slam Dunk', goal: { type: 'hoop', who: 'ball_basket', hoop: 'f3' },
      text: 'Get the basketball through the hoop.', hint: 'Drop the bowling ball on the high end of a see-saw, with the basketball on the low end.',
      bin: { seesaw: 1, ball_basket: 1, plank: 1 }, par: { parts: 2, time: 5 },
      parts: [P('plank', 850, 200, { w: 180, a: -15 }), P('ball_bowl', 910, 163), P('wall', 940, 520, { w: 240, a: 90 }), P('hoop', 905, 294)]
    },
    {
      id: 'loose', title: 'Cut Loose', goal: { type: 'zone', who: 'balloon', rect: [380, 0, 200, 90] },
      text: 'Set the balloon free so it floats out through the gap in the ceiling.', hint: 'A candle flame burns through rope.',
      bin: { candle: 1, plank: 1 }, par: { parts: 2, time: 5 },
      parts: [P('wall', 190, 80, { w: 380 }), P('wall', 770, 80, { w: 380 }), P('peg', 480, 600), P('balloon', 480, 400)],
      links: [{ k: 'rope', a: 'f2', b: 'f3' }]
    },
    {
      id: 'breeze', title: 'Breeze', goal: { type: 'zone', who: 'balloon', rect: [760, 0, 200, 160] },
      text: 'Blow the balloon out from under the ceiling and up to the top right.', hint: 'Belt the mouse wheel to a fan.',
      bin: { fan: 1, belt: 1 }, par: { parts: 2, time: 6 },
      parts: [P('wall', 380, 240, { w: 760 }), P('balloon', 480, 266), P('motor', 90, 600)]
    },
    {
      id: 'dominoes', title: 'Domino Run', goal: { type: 'toppled', who: 'domino' },
      text: 'Knock over every domino.', hint: 'Power the conveyor with a belt and give the crate a ride.',
      bin: { belt: 1, plank: 1 }, par: { parts: 1, time: 8 },
      parts: [P('motor', 80, 288), P('wall', 80, 330, { w: 120 }), P('conveyor', 320, 330, { w: 240 }), P('crate', 250, 303),
        P('domino', 700, 618), P('domino', 740, 618), P('domino', 780, 618), P('domino', 820, 618), P('domino', 860, 618), P('domino', 900, 618)]
    },
    {
      id: 'wake', title: 'Rise and Shine', goal: { type: 'event', event: 'nap' },
      text: 'Wake Mochi so she can find her cushion.', hint: 'Anything that bumps into a sleeping cat wakes her up.',
      bin: { ball_base: 1, plank: 2 }, par: { parts: 2, time: 8 },
      parts: [P('wall', 420, 400, { w: 520 }), P('cat', 300, 374), P('wall', 170, 340, { w: 100, a: 90 }), P('cushion', 840, 633)]
    },
    {
      id: 'cheese', title: 'Cheese Please', goal: { type: 'event', event: 'eat' },
      text: 'Help Pip get to the cheese on the shelf.', hint: 'Mice can walk up gentle slopes.',
      bin: { plank: 3 }, par: { parts: 1, time: 12 },
      parts: [P('mouse', 60, 631), P('wall', 820, 480, { w: 280 }), P('cheese', 880, 462)]
    },
    {
      id: 'lift', title: 'Heavy Lifting', goal: { type: 'zone', who: 'crate', rect: [390, 260, 180, 140] },
      text: 'Lift the crate up to the dotted box.', hint: 'Fill the bucket and the crate goes up.',
      bin: { plank: 2 }, par: { parts: 1, time: 6 },
      parts: [P('pulley', 480, 80), P('crate', 470, 621), P('bucket', 660, 300), P('plank', 830, 130, { w: 160, a: -15 }), P('ball_bowl', 880, 95)],
      links: [{ k: 'rope', a: 'f1', b: 'f0', c: 'f2' }]
    },
    {
      id: 'chain', title: 'Chain Reaction', goal: { type: 'event', event: 'nap' },
      text: 'Wake Mochi without touching her. She’ll head for her cushion.', hint: 'A loud pop wakes any cat. Bump the scissors to cut the balloon loose.',
      bin: { ball_base: 1, plank: 2 }, par: { parts: 1, time: 10 },
      parts: [P('cat', 800, 624, { f: -1 }), P('cushion', 90, 633), P('peg', 560, 630), P('balloon', 560, 420), P('wall', 560, 40, { w: 200 }),
        P('cactus', 560, 76, { a: 180 }), P('wall', 610, 540, { w: 60 }), P('scissors', 590, 518, { f: -1 })],
      links: [{ k: 'rope', a: 'f2', b: 'f3' }]
    }
  ];
  PUZZLES.forEach(pz => { pz.parts.forEach((p, i) => { p.id = 'f' + i; p.fx = true; }); pz.links = pz.links || []; });

  /* ---------- share codes ---------- */

  const b64e = s => (typeof btoa === 'function' ? btoa(s) : Buffer.from(s, 'binary').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); return typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('binary'); };

  // state: { puzzle: index or -1, parts: [user parts], links: [user links], fixed: [fixed parts] }
  function encode(puzzle, fixed, parts, links) {
    const all = [...fixed, ...parts];
    const idx = id => all.findIndex(p => p.id === id);
    const enc = p => [TYPE_IDS.indexOf(p.t), Math.round(p.x), Math.round(p.y), Math.round(p.a || 0), p.w || 0, p.f === -1 ? 1 : 0, p.aw ? 1 : 0];
    const data = [1, puzzle, parts.map(enc), links.map(l => [l.k === 'belt' ? 1 : 0, idx(l.a), idx(l.b), l.c != null ? idx(l.c) : -1])];
    return b64e(JSON.stringify(data));
  }
  function decode(code) {
    try {
      const data = JSON.parse(b64d(code));
      if (!Array.isArray(data) || data[0] !== 1) return null;
      const puzzle = data[1] | 0;
      const fixed = puzzle >= 0 && PUZZLES[puzzle] ? PUZZLES[puzzle].parts : [];
      const parts = [];
      for (const [ti, x, y, a, w, f, aw] of data[2].slice(0, 300)) {
        const t = TYPE_IDS[ti]; if (!t) continue;
        const d = T[t], p = newPart(t, clamp(+x || 0, 0, FIELD_W), clamp(+y || 0, 0, FIELD_H));
        if (d.rot) p.a = Math.round((+a || 0) / d.rot) * d.rot % 360;
        if (d.resize) p.w = clamp(Math.round((+w || d.resize.def) / d.resize.step) * d.resize.step, d.resize.min, d.resize.max);
        if (d.flip && f) p.f = -1;
        if (t === 'cat' && aw) p.aw = 1;
        p.id = 'u' + parts.length;
        parts.push(p);
      }
      const all = [...fixed, ...parts];
      const links = [];
      for (const [k, a, b, c] of data[3].slice(0, 200)) {
        const A = all[a], B = all[b], C = c >= 0 ? all[c] : null;
        if (!A || !B) continue;
        links.push({ k: k ? 'belt' : 'rope', a: A.id, b: B.id, c: C ? C.id : undefined });
      }
      return { puzzle, parts, links };
    } catch (e) { return null; }
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const api = { PPM, FIELD_W, FIELD_H, GRID, DT, TYPES, TYPE_IDS, GROUPS, LINKS, PUZZLES, Sim,
    newPart, toWorld, toLocal, worldShapes, partBounds, partsOverlap, hitPart, inField, segDist,
    ropePoint, beltPoint, canRope, canBelt, goalZones, hoopZone, encode, decode, rad };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Contraption = api;
})(typeof window !== 'undefined' ? window : globalThis, typeof planck !== 'undefined' ? planck : require('planck'));
