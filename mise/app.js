// Mise: Phase 1 static prototype.
// No backend and no AI. The camera and upload only produce a local preview;
// the "analysis" is a timed animation that ends on one of the fixtures in
// data/sample-recipes.js.

(() => {
  'use strict';

  const RECIPES = window.SAMPLE_RECIPES || [];
  const FAST = new URLSearchParams(location.search).has('fast');
  const SVGNS = 'http://www.w3.org/2000/svg';

  // Graph geometry, in diagram units.
  const G = {
    NODE_W: 164, NODE_H: 64, GUT: 52,
    PAD_L: 20, PAD_R: 28, PAD_T: 0, PAD_B: 0,
    LABEL_H: 28,  // strip at the top of each lane reserved for its name
    LANE_PAD: 20, SLOT_GAP: 16,
    TRACK: 7,     // spacing between parallel edge runs in a lane channel
    PORT: 10,     // spacing between edge attachment points on a node side
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const wait = ms => new Promise(r => setTimeout(r, FAST ? ms / 10 : ms));

  function svg(tag, attrs = {}, parent) {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  const state = {
    recipe: null,
    model: null,       // validated + laid-out graph
    selected: null,    // step id
    focusLane: null,   // lane id
    fromPhoto: false,
    photoURL: null,
    lastSampleId: null,
  };

  /* ------------------------------------------------------------------ *
   * Validation and layout
   * ------------------------------------------------------------------ */

  function validate(r) {
    const errors = [];
    const ids = new Set();
    for (const s of r.steps) {
      if (ids.has(s.id)) errors.push(`Duplicate step id "${s.id}"`);
      ids.add(s.id);
    }
    const laneIds = new Set(r.lanes.map(l => l.id));
    for (const s of r.steps) {
      if (!laneIds.has(s.laneId)) errors.push(`Step "${s.id}" is in unknown lane "${s.laneId}"`);
      for (const d of s.dependsOn) if (!ids.has(d)) errors.push(`Step "${s.id}" depends on unknown step "${d}"`);
    }
    // Kahn's algorithm: anything left over sits on a cycle.
    const indeg = new Map(r.steps.map(s => [s.id, s.dependsOn.filter(d => ids.has(d)).length]));
    const queue = [...indeg].filter(([, n]) => n === 0).map(([id]) => id);
    const order = [];
    while (queue.length) {
      const id = queue.shift();
      order.push(id);
      for (const s of r.steps) if (s.dependsOn.includes(id)) {
        indeg.set(s.id, indeg.get(s.id) - 1);
        if (indeg.get(s.id) === 0) queue.push(s.id);
      }
    }
    if (order.length < r.steps.length) errors.push('The steps contain a dependency cycle');
    return { ok: errors.length === 0, errors, order };
  }

  function buildModel(r) {
    const byId = new Map(r.steps.map(s => [s.id, s]));
    const dependents = new Map(r.steps.map(s => [s.id, []]));
    r.steps.forEach(s => s.dependsOn.forEach(d => dependents.get(d).push(s.id)));

    // Column = longest chain of prerequisites before the step. Purely logical.
    const col = new Map();
    const depth = id => {
      if (col.has(id)) return col.get(id);
      const s = byId.get(id);
      const d = s.dependsOn.length ? Math.max(...s.dependsOn.map(depth)) + 1 : 0;
      col.set(id, d);
      return d;
    };
    r.steps.forEach(s => depth(s.id));
    const cols = Math.max(...col.values()) + 1;

    let colorIdx = 0;
    const lanes = r.lanes.map((l, i) => ({
      ...l, index: i,
      color: l.id === 'assembly' ? 'var(--lane-final)' : `var(--lane-${(colorIdx++ % 6) + 1})`,
    }));
    const laneById = new Map(lanes.map(l => [l.id, l]));

    // Steps of one lane that share a column stack into slots.
    const groups = new Map();
    for (const s of r.steps) {
      const key = s.laneId + '|' + col.get(s.id);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s.id);
    }
    lanes.forEach(l => {
      l.slots = 1;
      for (const [key, g] of groups) if (key.startsWith(l.id + '|')) l.slots = Math.max(l.slots, g.length);
      l.steps = r.steps.filter(s => s.laneId === l.id).map(s => s.id);
    });

    // Edge topology first. A long edge (skipping columns) runs horizontally
    // along a channel at the top or bottom of its target lane; edges whose
    // runs overlap get separate tracks, and lanes get padding to fit them.
    const edges = [];
    for (const s of r.steps) for (const d of s.dependsOn) edges.push({ from: d, to: s.id });
    const channels = new Map();
    for (const e of edges) {
      const la = laneById.get(byId.get(e.from).laneId), lb = laneById.get(byId.get(e.to).laneId);
      const ca = col.get(e.from), cb = col.get(e.to);
      if (cb > ca + 1) {
        e.side = la.index <= lb.index ? 'top' : 'bottom';
        e.channel = lb.id + '|' + e.side;
        if (!channels.has(e.channel)) channels.set(e.channel, []);
        channels.get(e.channel).push(e);
      }
    }
    const channelCount = new Map();
    for (const [key, list] of channels) {
      // Edges from sources farther from the channel take the tracks farther
      // from the target nodes, so they nest instead of crossing.
      const near = e => {
        const a = byId.get(e.from), la = laneById.get(a.laneId), lb = laneById.get(byId.get(e.to).laneId);
        const g = groups.get(a.laneId + '|' + col.get(e.from));
        const slot = g.indexOf(e.from);
        return Math.abs(la.index - lb.index) * 100 + (e.side === 'top' ? g.length - slot : slot);
      };
      list.sort((p, q) => near(q) - near(p));
      const { tracks, count } = assignTracks(list, e => col.get(e.from), e => col.get(e.to) - 1, 0, true);
      list.forEach((e, i) => { e.chTrack = tracks[i]; });
      channelCount.set(key, count);
    }

    let y = G.PAD_T;
    for (const l of lanes) {
      const topTracks = channelCount.get(l.id + '|top') || 0;
      const botTracks = channelCount.get(l.id + '|bottom') || 0;
      l.padTop = G.LABEL_H + Math.max(G.LANE_PAD, topTracks * G.TRACK + 10);
      l.padBottom = Math.max(G.LANE_PAD, botTracks * G.TRACK + 10);
      l.top = y;
      l.height = l.padTop + l.padBottom + l.slots * G.NODE_H + (l.slots - 1) * G.SLOT_GAP;
      y += l.height;
      l.bottom = y;
    }
    const height = y + G.PAD_B;
    const width = G.PAD_L + cols * (G.NODE_W + G.GUT) - G.GUT + G.PAD_R;

    const nodes = new Map();
    for (const s of r.steps) {
      const l = laneById.get(s.laneId);
      const c = col.get(s.id);
      const g = groups.get(s.laneId + '|' + c);
      const slot = g.indexOf(s.id);
      const pitch = G.NODE_H + G.SLOT_GAP;
      const offset = (l.slots - g.length) * pitch / 2; // centre short stacks
      nodes.set(s.id, {
        step: s, lane: l, col: c, slot, ins: [], outs: [],
        x: G.PAD_L + c * (G.NODE_W + G.GUT),
        y: l.top + l.padTop + offset + slot * pitch,
      });
    }
    for (const e of edges) {
      const b = nodes.get(e.to);
      if (e.channel) e.cy = e.side === 'top' ? b.lane.top + G.LABEL_H + 7 + e.chTrack * G.TRACK : b.lane.bottom - 7 - e.chTrack * G.TRACK;
      nodes.get(e.from).outs.push(e);
      b.ins.push(e);
    }

    // Ports: every edge gets its own point on the node's side, ordered by
    // where it comes from or goes to, so lines don't converge on one spot.
    const mid = n => n.y + G.NODE_H / 2;
    const spread = (list, n, key, set) => {
      list.sort((p, q) => key(p) - key(q));
      list.forEach((e, i) => set(e, mid(n) + (i - (list.length - 1) / 2) * G.PORT));
    };
    for (const [, n] of nodes) {
      spread(n.ins, n, e => e.channel ? e.cy : mid(nodes.get(e.from)), (e, v) => { e.ty = v; });
      spread(n.outs, n, e => e.channel ? e.cy : mid(nodes.get(e.to)), (e, v) => { e.sy = v; });
    }

    // Vertical runs happen in the gutters between columns; overlapping runs
    // in the same gutter get separate tracks there too.
    const gutters = new Map();
    const addRun = (gutter, e, key, yin, yout) => {
      if (!gutters.has(gutter)) gutters.set(gutter, []);
      gutters.get(gutter).push({ e, key, yin, yout, lo: Math.min(yin, yout), hi: Math.max(yin, yout) });
    };
    for (const e of edges) {
      const ca = col.get(e.from), cb = col.get(e.to);
      if (e.channel) { addRun(ca, e, 'x1', e.sy, e.cy); addRun(cb - 1, e, 'x2', e.cy, e.ty); }
      else addRun(ca, e, 'x1', e.sy, e.ty);
    }
    // Every run enters its gutter from the left at yin and leaves to the right
    // at yout. With A left of B, A's exit line crosses B's vertical if yout(A)
    // lies within B's span, and B's entry line crosses A's vertical if yin(B)
    // lies within A's span. Runs are ordered left to right to avoid those.
    const inside = (y, r) => y > r.lo + 0.5 && y < r.hi - 0.5;
    const cost = (A, B) => inside(A.yout, B) + inside(B.yin, A);
    for (const [gutter, runs] of gutters) {
      const order = [];
      for (const run of runs.filter(r => r.hi - r.lo > 0.5)) {
        // Insert where it adds the fewest crossings with the runs placed so far.
        let best = 0, bestCost = Infinity;
        for (let pos = 0; pos <= order.length; pos++) {
          let c = 0;
          order.forEach((o, i) => { c += i < pos ? cost(o, run) : cost(run, o); });
          if (c < bestCost) { bestCost = c; best = pos; }
        }
        order.splice(best, 0, run);
      }
      const centre = G.PAD_L + gutter * (G.NODE_W + G.GUT) + G.NODE_W + G.GUT / 2;
      const sp = Math.min(9, 26 / Math.max(1, order.length - 1));
      order.forEach((run, i) => { run.e[run.key] = centre + (i - (order.length - 1) / 2) * sp; });
      runs.forEach(run => { if (run.e[run.key] === undefined) run.e[run.key] = centre; });
    }

    for (const e of edges) {
      const a = nodes.get(e.from), b = nodes.get(e.to);
      const sx = a.x + G.NODE_W, tx = b.x;
      e.points = e.channel
        ? [[sx, e.sy], [e.x1, e.sy], [e.x1, e.cy], [e.x2, e.cy], [e.x2, e.ty], [tx, e.ty]]
        : Math.abs(e.sy - e.ty) < 1 ? [[sx, e.sy], [tx, e.ty]]
        : [[sx, e.sy], [e.x1, e.sy], [e.x1, e.ty], [tx, e.ty]];
    }

    const sinks = r.steps.filter(s => dependents.get(s.id).length === 0).map(s => s.id);
    return { byId, dependents, nodes, edges, lanes, laneById, width, height, cols, sinks };
  }

  // Greedy interval colouring: items whose [lo, hi] ranges overlap (within
  // gap) get different track numbers. Returns tracks in input order.
  // Interval colouring: items whose [lo, hi] ranges overlap get different
  // track numbers, each taking the lowest free one. Items are placed in the
  // given order (keepOrder) or by start. Returns tracks in input order.
  function assignTracks(items, lo, hi, gap = 0, keepOrder = false) {
    const order = items.map((_, i) => i);
    if (!keepOrder) order.sort((p, q) => lo(items[p]) - lo(items[q]) || hi(items[p]) - hi(items[q]));
    const taken = [];
    const tracks = new Array(items.length);
    for (const i of order) {
      let t = 0;
      while ((taken[t] || []).some(j => lo(items[i]) <= hi(items[j]) + gap && lo(items[j]) <= hi(items[i]) + gap)) t++;
      (taken[t] = taken[t] || []).push(i);
      tracks[i] = t;
    }
    return { tracks, count: taken.length };
  }

  function roundedPath(raw, r = 10) {
    const pts = raw.filter((p, i) => i === 0 || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) > 0.5);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const ax = x1 + (x0 - x1) / l1 * rr, ay = y1 + (y0 - y1) / l1 * rr;
      const bx = x1 + (x2 - x1) / l2 * rr, by = y1 + (y2 - y1) / l2 * rr;
      d += ` L${ax},${ay} Q${x1},${y1} ${bx},${by}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last[0]},${last[1]}`;
  }

  function wrap(text, max = 19, lines = 2) {
    const words = text.split(/\s+/);
    const out = [''];
    for (const w of words) {
      const cur = out[out.length - 1];
      if (!cur) out[out.length - 1] = w;
      else if ((cur + ' ' + w).length <= max) out[out.length - 1] = cur + ' ' + w;
      else out.push(w);
    }
    if (out.length > lines) {
      out.length = lines;
      out[lines - 1] = out[lines - 1].replace(/.{0,1}$/, '…');
    }
    return out;
  }

  function upstreamOf(id, m, acc = new Set()) {
    for (const d of m.byId.get(id).dependsOn) if (!acc.has(d)) { acc.add(d); upstreamOf(d, m, acc); }
    return acc;
  }

  /* ------------------------------------------------------------------ *
   * Graph rendering
   * ------------------------------------------------------------------ */

  const graphEl = $('#graph');
  const canvasEl = $('#canvas');
  let viewport, labelsLayer, edgesG, edgeEls = [], nodeEls = new Map();
  const view = { x: 0, y: 0, k: 1 };

  function renderGraph() {
    const m = state.model;
    graphEl.textContent = '';
    edgeEls = [];
    nodeEls = new Map();

    const defs = svg('defs', {}, graphEl);
    // One arrowhead per lane, since each edge takes its source lane's colour.
    for (const l of m.lanes) {
      const mk = svg('marker', {
        id: `arrow-${l.index}`, viewBox: '0 0 10 10', refX: 9, refY: 5,
        markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse',
      }, defs);
      svg('path', { d: 'M0,1 L10,5 L0,9 z', style: `fill:${l.color}` }, mk);
    }

    viewport = svg('g', { class: 'viewport' }, graphEl);

    const bands = svg('g', {}, viewport);
    m.lanes.forEach((l, i) => {
      // Bands run far past both ends so panning never reveals a blank edge.
      const bx = -BAND_OVERHANG, bw = m.width + BAND_OVERHANG * 2;
      svg('rect', { x: bx, y: l.top, width: bw, height: l.height, class: 'lane-band', fill: l.color }, bands);
      svg('rect', { x: bx, y: l.top, width: bw, height: G.LABEL_H, class: 'lane-head', fill: l.color }, bands);
      if (i > 0) svg('line', { x1: bx, x2: bx + bw, y1: l.top, y2: l.top, class: 'lane-sep' }, bands);
    });

    // Each edge is a halo plus a line, drawn one after another, so where two
    // edges cross the later one visibly passes over the earlier.
    edgesG = svg('g', {}, viewport);
    for (const e of m.edges) {
      const lane = m.nodes.get(e.from).lane;
      const g = svg('g', { class: 'edge', style: `--ec:${lane.color}` }, edgesG);
      const d = roundedPath(e.points);
      svg('path', { d, class: 'edge-halo' }, g);
      svg('path', { d, class: 'edge-line', 'marker-end': `url(#arrow-${lane.index})` }, g);
      edgeEls.push({ el: g, from: e.from, to: e.to });
    }

    const nodesG = svg('g', {}, viewport);
    for (const [id, n] of m.nodes) {
      const s = n.step;
      const deps = s.dependsOn.length;
      const isFinal = m.sinks.includes(id);
      const cls = ['node'];
      if (s.source === 'inferred') cls.push('inferred');
      if (isFinal) cls.push('final');
      const g = svg('g', {
        class: cls.join(' '), transform: `translate(${n.x},${n.y})`, tabindex: 0, role: 'button',
        'aria-label': `${s.label}. ${n.lane.title} lane.` + (deps ? ` Needs ${deps} step${deps > 1 ? 's' : ''} first.` : ' Can start straight away.') + (s.source === 'inferred' ? ' Inferred step.' : ''),
        style: `--c:${n.lane.color}`,
      }, nodesG);
      g.dataset.id = id;
      svg('rect', { class: 'ring', x: -5, y: -5, width: G.NODE_W + 10, height: G.NODE_H + 10, rx: 16 }, g);
      svg('rect', { class: 'bg', width: G.NODE_W, height: G.NODE_H, rx: 12 }, g);
      if (!isFinal) svg('rect', { class: 'tab', x: 12, y: 0, width: 26, height: 3.5, rx: 1.75 }, g);

      const lines = wrap(s.label);
      const meta = [];
      if (s.time) meta.push(`⏱ ${s.time}`);
      if (deps > 1) meta.push(`joins ${deps}`);
      if (s.source === 'inferred') meta.push('inferred');
      const baseY = lines.length === 1 ? (meta.length ? 29 : 37) : (meta.length ? 23 : 29);
      const t = svg('text', { class: 'label', x: 14, y: baseY }, g);
      lines.forEach((ln, i) => {
        const span = svg('tspan', { x: 14, dy: i ? 17 : 0 }, t);
        span.textContent = ln;
      });
      if (meta.length) {
        const mt = svg('text', { class: 'meta', x: 14, y: baseY + (lines.length - 1) * 17 + 18 }, g);
        mt.textContent = meta.join(' · ');
      }
      // Merge: a bar on the left edge spanning the incoming arrows' ports.
      if (deps > 1) {
        const ys = n.ins.map(e => e.ty - n.y);
        const y0 = Math.min(...ys) - 7, y1 = Math.max(...ys) + 7;
        svg('rect', { class: 'merge-bar', x: -2, y: y0, width: 4, height: y1 - y0, rx: 2 }, g);
      }

      g.addEventListener('click', () => { if (!suppressClick) select(id); });
      g.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(id); }
        if (ev.key === 'Escape') select(null);
      });
      g.addEventListener('focus', () => ensureVisible(id));
      nodeEls.set(id, g);
    }

    // Lane labels live outside the viewport so they stay pinned to the
    // left edge while the diagram pans horizontally. Each sits in its lane's
    // reserved top strip, which nodes and edges never enter.
    labelsLayer = svg('g', { class: 'labels' }, graphEl);
    for (const l of m.lanes) {
      const g = svg('g', { class: 'lane-label', style: `--c:${l.color}` }, labelsLayer);
      const cy = l.top + G.LABEL_H / 2;
      const pill = svg('rect', { x: 6, y: cy - 10, height: 20, rx: 10 }, g);
      svg('circle', { cx: 17, cy, r: 4, fill: l.color }, g);
      const t = svg('text', { x: 26, y: cy + 4 }, g);
      svg('tspan', {}, t).textContent = l.title;
      svg('tspan', { class: 'lane-count', dx: 6 }, t).textContent = `${l.steps.length} step${l.steps.length === 1 ? '' : 's'}`;
      let tw = 0;
      try { tw = t.getComputedTextLength(); } catch {}
      pill.setAttribute('width', (tw || (l.title.length + 8) * 6.6) + 30);
      g.addEventListener('click', () => { if (!suppressClick) toggleLane(l.id); });
    }

    applyHighlight();
  }

  function applyHighlight() {
    const m = state.model;
    const sel = state.selected;
    const up = sel ? upstreamOf(sel, m) : null;
    const down = sel ? new Set(m.dependents.get(sel)) : null;

    for (const [id, g] of nodeEls) {
      const lane = m.nodes.get(id).lane.id;
      g.classList.toggle('is-selected', id === sel);
      g.classList.toggle('is-upstream', !!up && up.has(id));
      let dim = false;
      if (sel) dim = id !== sel && !up.has(id) && !down.has(id);
      else if (state.focusLane) dim = lane !== state.focusLane;
      g.classList.toggle('is-dim', dim);
    }
    for (const e of edgeEls) {
      let cls = 'normal';
      let dim = false;
      if (sel) {
        if ((e.to === sel || up.has(e.to)) && up.has(e.from)) cls = 'hi';
        else if (e.from === sel) cls = 'next';
        else dim = true;
      } else if (state.focusLane) {
        const a = m.nodes.get(e.from).lane.id, b = m.nodes.get(e.to).lane.id;
        dim = a !== state.focusLane && b !== state.focusLane;
      }
      e.el.setAttribute('class', `edge${cls !== 'normal' ? ' is-' + cls : ''}${dim ? ' is-dim' : ''}`);
    }
    // Raise the highlighted chain above everything else.
    for (const e of edgeEls) if (/is-(hi|next)/.test(e.el.getAttribute('class'))) edgesG.appendChild(e.el);
    document.querySelectorAll('.lane-chip').forEach(c => {
      const on = c.dataset.lane === state.focusLane;
      c.setAttribute('aria-pressed', String(on));
      c.classList.toggle('dim', !!state.focusLane && !on);
    });
  }

  /* ------------------------------------------------------------------ *
   * Pan and zoom
   * ------------------------------------------------------------------ */

  const BAND_OVERHANG = 20000;
  const LABEL_INSET = 12; // screen px

  // Smallest zoom at which the lanes still fill the canvas from top to bottom.
  const minZoom = () => Math.max(0.2, canvasEl.clientHeight / state.model.height);

  // Keep the diagram covering the canvas: vertically it may never leave a
  // gap, horizontally it either fills the width or stays centred.
  function clampView() {
    const m = state.model;
    const W = canvasEl.clientWidth, H = canvasEl.clientHeight;
    const sw = m.width * view.k, sh = m.height * view.k;
    view.x = sw > W ? Math.min(0, Math.max(W - sw, view.x)) : (W - sw) / 2;
    view.y = sh > H ? Math.min(0, Math.max(H - sh, view.y)) : (H - sh) / 2;
  }

  function applyView() {
    if (!viewport) return;
    clampView();
    viewport.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`);
    // Inset from the left so the canvas's rounded corner never clips the first label.
    labelsLayer.setAttribute('transform', `translate(${Math.max(0, view.x) + LABEL_INSET},${view.y}) scale(${view.k})`);
  }

  // Sizes the canvas to the diagram, then fits it. On narrow screens the
  // diagram keeps a readable scale and pans sideways instead of shrinking.
  function fit() {
    const m = state.model;
    if (!m) return;
    const availW = canvasEl.clientWidth;
    if (isFull()) {
      canvasEl.style.height = '';
      // Fill the width so text stays readable; pan vertically if it's taller.
      view.k = Math.max(minZoom(), Math.min(availW / m.width, 1.3));
      view.x = 0;
      view.y = 0;
      applyView();
      return;
    }
    // The canvas is sized to the diagram's height, so the lanes fill it exactly.
    const maxH = Math.max(320, Math.min(window.innerHeight * 0.72, 760));
    const minK = window.innerWidth < 700 ? 0.62 : 0.5;
    let k = Math.min(availW / m.width, 1.1);
    let narrow = false;
    if (k < minK) { k = minK; narrow = true; }
    k = Math.min(k, maxH / m.height);
    canvasEl.style.height = Math.floor(m.height * k) + 'px';
    view.k = k;
    view.x = 0;
    view.y = 0;
    $('#canvasHint').textContent = narrow
      ? 'Drag to pan, pinch to zoom. Left → right is "comes after", not time.'
      : 'Left → right shows what must come first. It is not a timeline.';
    applyView();
  }

  function zoomAt(factor, cx, cy) {
    const k = Math.min(2.5, Math.max(minZoom(), view.k * factor));
    view.x = cx - (cx - view.x) * (k / view.k);
    view.y = cy - (cy - view.y) * (k / view.k);
    view.k = k;
    applyView();
  }

  function zoomCentre(factor) {
    zoomAt(factor, canvasEl.clientWidth / 2, canvasEl.clientHeight / 2);
  }

  function ensureVisible(id) {
    const n = state.model.nodes.get(id);
    const W = canvasEl.clientWidth, H = canvasEl.clientHeight;
    const x0 = n.x * view.k + view.x, y0 = n.y * view.k + view.y;
    const x1 = x0 + G.NODE_W * view.k, y1 = y0 + G.NODE_H * view.k;
    const leftLimit = 10;
    let dx = 0, dy = 0;
    if (x0 < leftLimit) dx = leftLimit + 10 - x0;
    else if (x1 > W - 10) dx = W - 10 - x1;
    if (y0 < 50) dy = 50 - y0;
    else if (y1 > H - 10) dy = H - 10 - y1;
    if (dx || dy) { view.x += dx; view.y += dy; applyView(); }
  }

  // Pointer position in the diagram's own pixel space. In forced landscape
  // the canvas is rotated 90° clockwise, so screen axes map onto its axes.
  function toLocal(e) {
    const r = graphEl.getBoundingClientRect();
    if (isRotated()) return { x: e.clientY - r.top, y: r.right - e.clientX };
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  const pointers = new Map();
  let drag = null, pinch = null, suppressClick = false;

  graphEl.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const p = toLocal(e);
    pointers.set(e.pointerId, p);
    if (pointers.size === 1) {
      suppressClick = false;
      drag = { x: p.x, y: p.y, vx: view.x, vy: view.y, moved: false };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, vx: view.x, vy: view.y };
      suppressClick = true;
      for (const id of pointers.keys()) try { graphEl.setPointerCapture(id); } catch {}
    }
  });
  graphEl.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const p = toLocal(e);
    pointers.set(e.pointerId, p);
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const k = Math.min(2.5, Math.max(minZoom(), pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d));
      view.x = pinch.cx - (pinch.cx - pinch.vx) * (k / pinch.k);
      view.y = pinch.cy - (pinch.cy - pinch.vy) * (k / pinch.k);
      view.k = k;
      applyView();
    } else if (drag) {
      const dx = p.x - drag.x, dy = p.y - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 5) {
        drag.moved = true;
        suppressClick = true;
        graphEl.classList.add('dragging');
        try { graphEl.setPointerCapture(e.pointerId); } catch {}
      }
      if (drag.moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; applyView(); }
    }
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {
      const [p] = pointers.values();
      drag = { x: p.x, y: p.y, vx: view.x, vy: view.y, moved: true };
    } else if (pointers.size === 0) {
      drag = null;
      graphEl.classList.remove('dragging');
    }
  };
  graphEl.addEventListener('pointerup', endPointer);
  graphEl.addEventListener('pointercancel', endPointer);
  graphEl.addEventListener('click', e => {
    if (!suppressClick && !e.target.closest('.node, .lane-label')) select(null);
  });
  graphEl.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const p = toLocal(e);
      zoomAt(Math.exp(-e.deltaY * 0.01), p.x, p.y);
    } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      e.preventDefault();
      view.x -= e.shiftKey ? e.deltaY : e.deltaX;
      applyView();
    }
  }, { passive: false });

  $('#zoomIn').addEventListener('click', () => zoomCentre(1.25));
  $('#zoomOut').addEventListener('click', () => zoomCentre(0.8));
  $('#fitBtn').addEventListener('click', fit);

  /* Full screen, locked to landscape. Chrome on Android can lock the real
   * orientation once the page is full screen. Where that isn't possible
   * (iPhone Safari, or orientation lock refused), the canvas is rotated
   * 90° with CSS whenever the screen is portrait. */
  const portraitMQ = window.matchMedia('(orientation: portrait)');
  const isFull = () => canvasEl.classList.contains('is-full');
  const isRotated = () => canvasEl.classList.contains('force-landscape') && portraitMQ.matches;

  async function enterFull() {
    canvasEl.classList.add('is-full');
    document.body.classList.add('diagram-full');
    setFullButton(true);
    let locked = false;
    try {
      const root = document.documentElement;
      if (root.requestFullscreen && !document.fullscreenElement) await root.requestFullscreen({ navigationUI: 'hide' });
      else if (root.webkitRequestFullscreen && !document.webkitFullscreenElement) root.webkitRequestFullscreen();
    } catch {}
    try {
      if (screen.orientation && screen.orientation.lock) { await screen.orientation.lock('landscape'); locked = true; }
    } catch {}
    canvasEl.classList.toggle('force-landscape', !locked);
    requestAnimationFrame(fit);
    setTimeout(fit, 350); // orientation changes settle late on some phones
  }

  function exitFull() {
    if (!isFull()) return;
    canvasEl.classList.remove('is-full', 'force-landscape');
    document.body.classList.remove('diagram-full');
    setFullButton(false);
    try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch {}
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    requestAnimationFrame(fit);
  }

  function setFullButton(on) {
    const b = $('#fullBtn');
    b.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
    b.title = on ? 'Exit full screen' : 'Full screen';
    b.setAttribute('aria-pressed', String(on));
  }

  $('#fullBtn').addEventListener('click', () => (isFull() ? exitFull() : enterFull()));
  const onFsChange = () => { if (!document.fullscreenElement && !document.webkitFullscreenElement) exitFull(); };
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  portraitMQ.addEventListener('change', () => { if (isFull()) setTimeout(fit, 100); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isFull() && !state.selected) exitFull(); });
  $('#resetBtn').addEventListener('click', () => { state.focusLane = null; select(null); fit(); });
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!$('#result').hidden) fit(); }, 150); });

  /* ------------------------------------------------------------------ *
   * Selection, detail panel, text views
   * ------------------------------------------------------------------ */

  const detailEl = $('#detail');

  function select(id) {
    state.selected = id;
    applyHighlight();
    renderDetail();
    renderList();
    renderSource();
    if (id) {
      ensureVisible(id);
      // On phones the details open as a bottom sheet; keep the diagram in view above it.
      if (window.innerWidth <= 960 && !isFull()) {
        const top = canvasEl.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.2) window.scrollBy({ top: top - 8, behavior: 'smooth' });
      }
    }
  }

  function toggleLane(id) {
    state.focusLane = state.focusLane === id ? null : id;
    if (state.selected) state.selected = null;
    applyHighlight();
    renderDetail();
    renderList();
    renderSource();
  }

  function stepButton(id, extra = '') {
    const m = state.model;
    const n = m.nodes.get(id);
    return `<li><button type="button" data-go="${esc(id)}" style="--c:${n.lane.color}"><i></i>${esc(n.step.label)}<small>${esc(n.lane.title)}${extra}</small></button></li>`;
  }

  function renderDetail() {
    const m = state.model;
    const id = state.selected;
    detailEl.classList.toggle('open', !!id);
    renderFullInfo();
    if (!id) {
      const merges = state.recipe.steps.filter(s => s.dependsOn.length > 1).length;
      const starts = state.recipe.steps.filter(s => !s.dependsOn.length).length;
      detailEl.innerHTML = `
        <div class="d-overview">
          <p class="eyebrow">Overview</p>
          <h3>${esc(state.recipe.recipe.title)}</h3>
          <div class="d-stats">
            <div><b>${m.lanes.length}</b><span>lanes</span></div>
            <div><b>${starts}</b><span>starting points</span></div>
            <div><b>${merges}</b><span>merges</span></div>
          </div>
          <h4>How to read it</h4>
          <ul>
            <li>Each band is a component you can prepare on its own.</li>
            <li>An arrow means "can't start until this is done".</li>
            <li>Steps with no incoming arrow can start whenever you like.</li>
            <li>Position shows order, not time. Durations are listed on the steps.</li>
          </ul>
          <p class="d-empty">Select a step to see the original instruction and what it depends on.</p>
        </div>`;
      return;
    }
    const n = m.nodes.get(id);
    const s = n.step;
    const deps = s.dependsOn;
    const next = m.dependents.get(id);
    const allUp = upstreamOf(id, m);
    const badges = [
      s.source === 'inferred' ? '<span class="badge inferred">Inferred</span>' : '<span class="badge explicit">From the recipe</span>',
      s.time ? `<span class="badge">⏱ ${esc(s.time)}</span>` : '',
      s.temp ? `<span class="badge">🌡 ${esc(s.temp)}</span>` : '',
      deps.length > 1 ? `<span class="badge">Merge of ${deps.length}</span>` : '',
    ].join('');
    detailEl.innerHTML = `
      <button class="d-close" type="button" aria-label="Close details"><span></span></button>
      <span class="d-lane" style="--c:${n.lane.color}"><i></i>${esc(n.lane.title)}</span>
      <h3>${esc(s.label)}</h3>
      <div class="d-badges">${badges}</div>
      ${s.quote ? `<blockquote class="d-quote" style="--c:${n.lane.color}">“${esc(s.quote)}”</blockquote>` : '<p>This step isn\'t written in the recipe. It was filled in to make the workflow complete.</p>'}
      ${s.note ? `<p class="d-note">${esc(s.note)}</p>` : ''}
      <h4>Needs first</h4>
      ${deps.length ? `<ul class="d-links">${deps.map(d => stepButton(d)).join('')}</ul>` : '<p class="d-empty">Nothing. This can start straight away.</p>'}
      ${allUp.size > deps.length ? `<p class="d-empty">${allUp.size} steps in total lead up to this one; they're highlighted in the diagram.</p>` : ''}
      <h4>Unlocks</h4>
      ${next.length ? `<ul class="d-links">${next.map(d => stepButton(d)).join('')}</ul>` : '<p class="d-empty">Nothing. This is the finish.</p>'}
    `;
    detailEl.querySelector('.d-close').addEventListener('click', () => select(null));
  }

  // Compact step card shown inside the canvas while it is full screen,
  // where the normal detail panel is out of sight.
  function renderFullInfo() {
    const box = $('#fullInfo');
    const id = state.selected;
    box.hidden = !id;
    if (!id) return;
    const m = state.model;
    const n = m.nodes.get(id);
    const s = n.step;
    const needs = s.dependsOn.map(d => m.byId.get(d).label);
    box.style.setProperty('--c', n.lane.color);
    box.innerHTML = `
      <button type="button" class="fi-close" aria-label="Close">×</button>
      <span class="d-lane"><i></i>${esc(n.lane.title)}</span>
      <strong>${esc(s.label)}</strong>
      ${s.quote ? `<q>${esc(s.quote)}</q>` : '<em>Inferred: not written in the recipe.</em>'}
      <small>${needs.length ? 'After: ' + needs.map(esc).join(', ') : 'Can start straight away'}${s.time ? ' · ⏱ ' + esc(s.time) : ''}</small>`;
    box.querySelector('.fi-close').addEventListener('click', () => select(null));
  }

  detailEl.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) select(b.dataset.go);
  });

  function renderList() {
    const m = state.model;
    const panel = $('#panelList');
    panel.innerHTML = `<div class="text-lanes">${m.lanes.map(l => `
      <section class="text-lane" style="--c:${l.color}">
        <h3><i></i>${esc(l.title)}</h3>
        <ol>${l.steps.map(id => {
          const s = m.byId.get(id);
          const after = s.dependsOn.map(d => m.byId.get(d).label);
          return `<li><button type="button" class="step-link${id === state.selected ? ' current' : ''}" data-go="${esc(id)}">${esc(s.label)}</button>${s.source === 'inferred' ? '<span class="tag-inferred">inferred</span>' : ''}
            <span class="after">${after.length ? 'After: ' + after.map(esc).join(', ') : 'Can start straight away'}${s.time ? ' · ' + esc(s.time) : ''}</span></li>`;
        }).join('')}</ol>
      </section>`).join('')}</div>`;
  }
  $('#panelList').addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) select(b.dataset.go);
  });

  function renderSource() {
    const r = state.recipe.recipe;
    const quote = state.selected ? state.model.byId.get(state.selected).quote : null;
    const method = r.method.map(p => {
      if (quote && p.includes(quote)) {
        const i = p.indexOf(quote);
        return esc(p.slice(0, i)) + `<mark>${esc(quote)}</mark>` + esc(p.slice(i + quote.length));
      }
      return esc(p);
    });
    $('#panelSource').innerHTML = `
      <div class="source-cols">
        <div><h3>Ingredients</h3><ul>${r.ingredients.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>
        <div><h3>Method</h3><ol>${method.map(p => `<li>${p}</li>`).join('')}</ol>
          <p class="source-note">${state.fromPhoto ? 'This is the sample recipe\'s text, not a transcription of your photo.' : 'Select a step to highlight where it comes from.'}</p></div>
      </div>`;
  }

  // Tabs
  const tabs = [$('#tabList'), $('#tabSource')];
  function showTab(t) {
    tabs.forEach(b => {
      const on = b === t;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      $('#' + b.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showTab(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        showTab(n); n.focus();
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.selected && $('#camera').hidden) select(null);
  });

  /* ------------------------------------------------------------------ *
   * Screens
   * ------------------------------------------------------------------ */

  function show(screen) {
    for (const id of ['home', 'processing', 'result']) $('#' + id).hidden = id !== screen;
    if (screen !== 'result') { detailEl.classList.remove('open'); exitFull(); }
    window.scrollTo(0, 0);
  }

  function loadRecipe(id, { fromPhoto = false } = {}) {
    const r = RECIPES.find(x => x.id === id) || RECIPES[0];
    const v = validate(r);
    if (!v.ok) { alert('This sample is malformed:\n' + v.errors.join('\n')); return; }
    state.recipe = r;
    state.model = buildModel(r);
    state.selected = null;
    state.focusLane = null;
    state.fromPhoto = fromPhoto;
    state.lastSampleId = r.id;

    $('#recipeSelect').value = r.id;
    $('#rTitle').textContent = r.recipe.title;
    const merges = r.steps.filter(s => s.dependsOn.length > 1).length;
    $('#rMeta').innerHTML = [
      `Serves ${r.recipe.servings}`,
      esc(r.recipe.totalTime),
      `${r.steps.length} steps`,
      `${r.lanes.length} lanes`,
      `${merges} merge${merges === 1 ? '' : 's'}`,
    ].map(x => `<span>${x}</span>`).join('');

    $('#simBanner').hidden = !fromPhoto;
    if (fromPhoto) {
      $('#simThumb').src = state.photoURL;
      $('#simName').textContent = '“' + r.recipe.title + '”';
    }

    $('#laneChips').innerHTML = state.model.lanes.map(l =>
      `<button type="button" class="lane-chip" data-lane="${esc(l.id)}" aria-pressed="false" style="--c:${l.color}"><i></i>${esc(l.title)}</button>`
    ).join('');

    show('result');
    renderGraph();
    renderDetail();
    renderList();
    renderSource();
    showTab($('#tabList'));
    fit();
  }

  $('#laneChips').addEventListener('click', e => {
    const c = e.target.closest('.lane-chip');
    if (c) toggleLane(c.dataset.lane);
  });

  $('#recipeSelect').innerHTML = RECIPES.map(r => `<option value="${esc(r.id)}">${esc(r.recipe.title)}</option>`).join('');
  $('#recipeSelect').addEventListener('change', e => loadRecipe(e.target.value, { fromPhoto: false }));
  $('#backBtn').addEventListener('click', () => { history.replaceState(null, '', location.pathname + location.search); show('home'); });
  $('#retakeBtn').addEventListener('click', openCamera);

  // Sample cards, each with a tiny lane sketch drawn from the fixture.
  function miniSketch(r) {
    const m = buildModel(r);
    const W = 240, H = 54;
    const sx = W / m.width, sy = H / m.height;
    let out = `<svg class="mini" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`;
    for (const l of m.lanes) out += `<rect x="0" y="${l.top * sy}" width="${W}" height="${l.height * sy - 1}" fill="${l.color}" fill-opacity=".08" />`;
    for (const e of m.edges) {
      const pts = e.points.map(([x, y]) => `${(x * sx).toFixed(1)},${(y * sy).toFixed(1)}`).join(' ');
      out += `<polyline points="${pts}" fill="none" stroke="var(--edge)" stroke-width="1" vector-effect="non-scaling-stroke" />`;
    }
    for (const [, n] of m.nodes) out += `<rect x="${n.x * sx}" y="${n.y * sy}" width="${G.NODE_W * sx}" height="${G.NODE_H * sy}" rx="2" fill="${n.lane.color}" fill-opacity=".85" />`;
    return out + '</svg>';
  }
  $('#sampleGrid').innerHTML = RECIPES.map(r => {
    const merges = r.steps.filter(s => s.dependsOn.length > 1).length;
    return `<button type="button" class="sample-card" data-id="${esc(r.id)}">
      ${miniSketch(r)}
      <h3>${esc(r.recipe.title)}</h3>
      <p>${esc(r.blurb)}</p>
      <span class="stats">${r.lanes.length} lanes · ${r.steps.length} steps · ${merges} merge${merges === 1 ? '' : 's'}</span>
    </button>`;
  }).join('');
  $('#sampleGrid').addEventListener('click', e => {
    const c = e.target.closest('.sample-card');
    if (c) { history.replaceState(null, '', '#' + c.dataset.id); loadRecipe(c.dataset.id); }
  });

  /* ------------------------------------------------------------------ *
   * Camera and upload (local preview only)
   * ------------------------------------------------------------------ */

  const camEl = $('#camera');
  const video = $('#video');
  let stream = null;
  let facing = 'environment';

  function stopStream() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    video.srcObject = null;
  }

  async function startStream() {
    stopStream();
    $('#camError').hidden = true;
    $('#shutter').disabled = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play().catch(() => {});
      $('#shutter').disabled = false;
      const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      $('#camFlip').hidden = devices.filter(d => d.kind === 'videoinput').length < 2;
      video.style.transform = facing === 'user' ? 'scaleX(-1)' : '';
    } catch (err) {
      const blocked = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      $('#camErrorText').textContent = blocked
        ? 'Camera access was blocked. Allow it in your browser settings, or choose a photo instead.'
        : 'No camera is available here. You can choose a photo instead.';
      $('#camError').hidden = false;
    }
  }

  async function openCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Old browsers or insecure origins: fall back to the OS camera picker.
      $('#cameraInput').click();
      return;
    }
    camEl.hidden = false;
    document.body.style.overflow = 'hidden';
    await startStream();
    $('#shutter').focus();
  }

  function closeCamera() {
    stopStream();
    camEl.hidden = true;
    document.body.style.overflow = '';
  }

  function capture() {
    if (!stream || !video.videoWidth) return;
    const c = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    c.width = Math.round(video.videoWidth * scale);
    c.height = Math.round(video.videoHeight * scale);
    const ctx = c.getContext('2d');
    if (facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, c.width, c.height);
    const flash = $('#camFlash');
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    c.toBlob(blob => {
      setTimeout(() => { closeCamera(); startProcessing(URL.createObjectURL(blob)); }, FAST ? 0 : 280);
    }, 'image/jpeg', 0.88);
  }

  $('#snapBtn').addEventListener('click', openCamera);
  $('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
  $('#camCancel').addEventListener('click', closeCamera);
  $('#shutter').addEventListener('click', capture);
  $('#camFlip').addEventListener('click', () => { facing = facing === 'environment' ? 'user' : 'environment'; startStream(); });
  $('#camFallback').addEventListener('click', () => { closeCamera(); $('#fileInput').click(); });
  camEl.addEventListener('keydown', e => { if (e.key === 'Escape') closeCamera(); });

  for (const input of [$('#fileInput'), $('#cameraInput')]) {
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      input.value = '';
      if (f) startProcessing(URL.createObjectURL(f));
    });
  }

  /* ------------------------------------------------------------------ *
   * Simulated processing
   * ------------------------------------------------------------------ */

  const STAGES = [
    ['Straightening the page', 900],
    ['Reading ingredients and method', 1300],
    ['Finding parts you can prep independently', 1200],
    ['Linking real prerequisites', 1000],
    ['Laying out the swimlanes', 700],
  ];
  let runId = 0;

  async function startProcessing(url) {
    if (state.photoURL && state.photoURL !== url) URL.revokeObjectURL(state.photoURL);
    state.photoURL = url;
    const my = ++runId;
    $('#procImg').src = url;
    const list = $('#procSteps');
    list.innerHTML = STAGES.map(([t]) => `<li>${esc(t)}</li>`).join('');
    const boxes = $('#procBoxes');
    boxes.textContent = '';
    show('processing');

    const items = [...list.children];
    for (let i = 0; i < STAGES.length; i++) {
      if (my !== runId) return;
      items[i].classList.add('active');
      if (i === 1 || i === 2) sprinkleBoxes(boxes, i === 1 ? 7 : 4);
      await wait(STAGES[i][1]);
      if (my !== runId) return;
      items[i].classList.replace('active', 'done');
    }
    await wait(350);
    if (my !== runId) return;

    // Pick a sample, avoiding the one shown last time.
    const pool = RECIPES.filter(r => r.id !== state.lastSampleId);
    const pick = pool[Math.floor(Math.random() * pool.length)] || RECIPES[0];
    history.replaceState(null, '', location.pathname + location.search);
    loadRecipe(pick.id, { fromPhoto: true });
  }

  // Decorative boxes over the photo while the "reading" stages run.
  function sprinkleBoxes(host, n) {
    for (let i = 0; i < n; i++) {
      const b = document.createElement('span');
      const w = 25 + Math.random() * 55;
      b.style.cssText = `left:${5 + Math.random() * (90 - w)}%;top:${6 + Math.random() * 84}%;width:${w}%;height:${3 + Math.random() * 4}%;animation-delay:${(i * (FAST ? 20 : 140))}ms`;
      host.appendChild(b);
    }
  }

  $('#procCancel').addEventListener('click', () => { runId++; show('home'); });

  /* Light by default, whatever the system setting; dark is opt-in. */
  const themeBtn = $('#themeBtn');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.title = t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.setAttribute('aria-label', themeBtn.title);
    $('meta[name="theme-color"]').content = t === 'dark' ? '#17140f' : '#f6f1e8';
  }
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('mise-theme') === 'dark' ? 'dark' : 'light'; } catch {}
  setTheme(savedTheme);
  themeBtn.addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(t);
    try { localStorage.setItem('mise-theme', t); } catch {}
  });

  /* ------------------------------------------------------------------ *
   * Start
   * ------------------------------------------------------------------ */

  const initial = location.hash.slice(1);
  if (RECIPES.some(r => r.id === initial)) loadRecipe(initial);
})();
