'use strict';

// ---------- Instruments ----------

// pos: staff position in half-steps above the bottom line (E4 = 0).
const INST = {
  cr: { name: 'Crash', short: 'Crash', pos: 10, head: 'x', voice: 'up', color: '#F2C14E', fam: 0 },
  hh: { name: 'Hi-hat', short: 'Hi-hat', pos: 9, head: 'x', voice: 'up', color: '#F2C14E', fam: 0 },
  rd: { name: 'Ride', short: 'Ride', pos: 8, head: 'x', voice: 'up', color: '#E9B949', fam: 0 },
  t1: { name: 'High tom', short: 'Tom 1', pos: 7, head: 'o', voice: 'up', color: '#7CC0F0', fam: 2 },
  t2: { name: 'Mid tom', short: 'Tom 2', pos: 6, head: 'o', voice: 'up', color: '#4FA3E0', fam: 2 },
  sn: { name: 'Snare', short: 'Snare', pos: 5, head: 'o', voice: 'up', color: '#EDEDED', fam: 1 },
  ft: { name: 'Floor tom', short: 'Floor', pos: 3, head: 'o', voice: 'up', color: '#3B86C6', fam: 2 },
  k: { name: 'Kick', short: 'Kick', pos: 1, head: 'o', voice: 'down', color: '#A07CFF', fam: 3 },
  hf: { name: 'Hi-hat pedal', short: 'HH foot', pos: -1, head: 'x', voice: 'down', color: '#C7A85A', fam: 3 }
};
const LANE_ORDER = ['cr', 'hh', 'rd', 't1', 't2', 'sn', 'ft', 'k', 'hf'];
const TYPE_LABEL = { groove: 'Groove', fill: 'Fill', combo: 'Groove + fill' };
const BANDS = ['', 'Beginner', 'Beginner', 'Improver', 'Improver', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced', 'Expert', 'Expert'];
const VEL = { x: 0.72, X: 1, g: 0.25, o: 0.72, c: 0.8 };

// ---------- Model ----------

function splitTrack(str) {
  return str.replace(/\s+/g, '').split('|');
}

function buildModel(p) {
  const tracks = {};
  let nb = p.grids ? p.grids.length : 0;
  for (const inst of Object.keys(p.t)) {
    tracks[inst] = splitTrack(p.t[inst]);
    nb = Math.max(nb, tracks[inst].length);
  }
  const bars = [], groups = [], steps = [];
  let s = 0, q = 0;
  for (let b = 0; b < nb; b++) {
    const g = GRIDS[p.grids ? p.grids[b] : p.grid];
    const len = g.groups.reduce((a, c) => a + c, 0);
    const stepQ = g.tup ? 1 / g.tup : g.nv / 4;
    const nvN = g.tup ? (g.tup === 3 ? 2 : 1) : g.nv;
    const bar = { g, len, stepQ, nvN, start: s, qStart: q, q: len * stepQ };
    bars.push(bar);
    g.groups.forEach((glen, gIdx) => {
      groups.push({ bar: b, idx: gIdx, start: s, len: glen, nvN, tup: g.tup || 0, len16: glen * nvN, q });
      for (let i = 0; i < glen; i++) {
        const straight = q + i * stepQ;
        let sq = straight;
        if (p.swing && !g.tup && glen % 2 === 0 && i % 2 === 1) sq += stepQ / 3;
        steps.push({ s, bar: b, group: groups.length - 1, gi: i, bi: s - bar.start, q: sq, straightQ: straight });
        s++;
      }
      q += glen * stepQ;
    });
  }

  const resolve = (segs, inst) => {
    const out = [];
    for (let b = 0; b < nb; b++) {
      let seg = segs[b];
      if (seg === '%') seg = out[b - 1];
      if (seg === undefined || seg === '') seg = '.'.repeat(bars[b].len);
      if (seg.length !== bars[b].len) console.warn(`Backbeat: ${p.id} ${inst} bar ${b + 1} has ${seg.length} steps, expected ${bars[b].len}`);
      out.push(seg);
    }
    return out;
  };

  const hits = [];
  const hitsAt = steps.map(() => []);
  const used = {};
  for (const inst of Object.keys(tracks)) {
    resolve(tracks[inst], inst).forEach((seg, b) => {
      for (let i = 0; i < bars[b].len; i++) {
        const ch = seg[i];
        if (!ch || ch === '.') continue;
        const h = { s: bars[b].start + i, inst, v: ch };
        hits.push(h);
        hitsAt[h.s].push(h);
        used[inst] = true;
      }
    });
  }
  let stick = null;
  if (p.stick) {
    stick = [];
    resolve(splitTrack(p.stick), 'stick').forEach((seg) => {
      for (const ch of seg) stick.push(ch === '.' ? '' : ch);
    });
  }

  const ts = (p.grids ? GRIDS[p.grids[0]] : GRIDS[p.grid]).ts;
  const den = Number(ts.split('/')[1]);
  steps.forEach((st) => {
    const bar = bars[st.bar], grp = groups[st.group];
    const posQ = st.straightQ - bar.qStart;
    if (den === 8) {
      const e = posQ * 2;
      const whole = Math.abs(e - Math.round(e)) < 1e-6;
      st.count = whole ? String(Math.round(e) + 1) : '+';
      st.strong = st.gi === 0;
    } else {
      st.strong = st.gi === 0;
      if (st.gi === 0) st.count = String(grp.idx + 1);
      else if (grp.tup === 3) st.count = ['', '&', 'a'][st.gi];
      else if (grp.tup === 6) st.count = st.gi === 3 ? '&' : '·';
      else if (bar.nvN === 2) st.count = '&';
      else st.count = ['', 'e', '&', 'a'][st.gi];
    }
  });

  const voiceUsed = { up: false, down: false };
  hits.forEach((h) => { voiceUsed[INST[h.inst].voice] = true; });

  return {
    p, ts, bars, groups, steps, hits, hitsAt, used, stick, voiceUsed,
    totalQ: q, beatQ: p.beatQ || 1
  };
}

// ---------- Layout ----------

// Shared horizontal mapping for both panels: the grid starts at G and every
// bar is the same width, with its steps spaced evenly inside it.
function makeLayout(m, width) {
  const G = width < 700 ? 64 : width < 1100 ? 88 : 112;
  const R = 24;
  const W = Math.max(100, width - G - R);
  const barW = W / m.bars.length;
  let minCell = Infinity;
  m.bars.forEach((bar, b) => {
    bar.x0 = b * barW;
    bar.cell = barW / bar.len;
    minCell = Math.min(minCell, bar.cell);
  });
  const xAt = (sf) => {
    const s = Math.min(Math.floor(sf), m.steps.length - 1);
    const bar = m.bars[m.steps[s].bar];
    return G + bar.x0 + (sf - bar.start + 0.5) * bar.cell;
  };
  m.steps.forEach((st) => {
    const bar = m.bars[st.bar];
    st.cell = bar.cell;
    st.x = G + bar.x0 + (st.bi + 0.5) * bar.cell;
  });
  const barFracX = (f) => {
    const b = Math.min(Math.floor(f), m.bars.length - 1);
    return G + b * barW + (f - b) * barW;
  };
  return { G, R, W, barW, minCell, xAt, barFracX, width };
}

// ---------- Notation ----------

const BEAMS = { 1: 2, 2: 1, 3: 1, 4: 0, 6: 0 };

function decompose(d, vals) {
  const out = [];
  let left = Math.round(d * 1000) / 1000;
  while (left > 0.001) {
    const v = vals.find((x) => x <= left + 0.001) || left;
    out.push(v);
    left -= v;
  }
  return out;
}

// Works out notes, rests and beaming for each beat group and voice, and the
// vertical range the notation needs (in staff half-steps).
function analyse(m) {
  if (m.an) return m.an;
  const vgs = [];
  let maxPos = 11, minPos = -3;
  m.groups.forEach((g) => {
    ['up', 'down'].forEach((voice) => {
      if (!m.voiceUsed[voice]) return;
      const onsets = [];
      for (let s = g.start; s < g.start + g.len; s++) {
        const hs = m.hitsAt[s].filter((h) => INST[h.inst].voice === voice);
        if (hs.length) onsets.push({ s, hs });
      }
      const vals = !g.tup && g.len16 >= 6 ? [6, 4, 3, 2, 1] : [4, 3, 2, 1];
      const items = [];
      const rests = (s0, d16) => {
        let at = s0;
        decompose(d16, vals).forEach((v) => {
          items.push({ kind: 'rest', s: at, len16: v });
          at += v / g.nvN;
        });
      };
      let wholeQuarter = false;
      if (!onsets.length) {
        if (g.tup) items.push({ kind: 'rest', s: g.start, len16: 4 });
        else rests(g.start, g.len16);
      } else {
        if (onsets[0].s > g.start) rests(g.start, (onsets[0].s - g.start) * g.nvN);
        onsets.forEach((on, i) => {
          const next = i + 1 < onsets.length ? onsets[i + 1].s : g.start + g.len;
          const d = (next - on.s) * g.nvN;
          if (g.tup && onsets.length === 1 && on.s === g.start) {
            wholeQuarter = true;
            items.push({ kind: 'note', s: on.s, hs: on.hs, len16: 4 });
            return;
          }
          const v = vals.find((x) => x <= d + 0.001) || 1;
          items.push({ kind: 'note', s: on.s, hs: on.hs, len16: v });
          if (d - v > 0.001) rests(on.s + v / g.nvN, d - v);
        });
      }
      const notes = items.filter((it) => it.kind === 'note');
      const beamed = notes.length >= 2 && notes.every((n) => BEAMS[n.len16] >= 1);
      let beamPos = null, artTop = 0;
      if (notes.length) {
        const ps = notes.flatMap((n) => n.hs.map((h) => INST[h.inst].pos));
        if (voice === 'up') {
          beamPos = Math.max(13, Math.max(...ps) + 7);
          let top = beamPos;
          const acc = notes.some((n) => n.hs.some((h) => h.v === 'X'));
          const open = notes.some((n) => n.hs.some((h) => h.v === 'o'));
          if (acc) top += 2.4;
          if (open) top += 2.4;
          artTop = top;
          if (g.tup && !wholeQuarter) top += 3.4;
          maxPos = Math.max(maxPos, top + 0.8);
        } else {
          beamPos = Math.min(-6, Math.min(...ps) - 7);
          let bottom = beamPos;
          if (notes.some((n) => n.hs.some((h) => h.v === 'X'))) bottom -= 2.4;
          artTop = bottom;
          minPos = Math.min(minPos, bottom - 0.8);
        }
      }
      const tupMark = g.tup && !wholeQuarter && notes.length > 0 &&
        (voice === 'up' || !m.voiceUsed.up || !vgs.some((o) => o.g === g && o.voice === 'up' && o.notes.length));
      vgs.push({ g, voice, items, notes, beamed, beamPos, artTop, tupMark });
    });
  });
  m.an = { vgs, maxPos, minPos };
  return m.an;
}

const r1 = (n) => Math.round(n * 10) / 10;

function drawNotation(svg, m, L, H) {
  const an = analyse(m);
  const topPad = m.p.sections ? 20 : 8;
  const botPad = m.stick ? 18 : 6;
  const span = an.maxPos - an.minPos;
  let sp = (H - topPad - botPad) / (span + 1);
  sp = Math.max(1.6, Math.min(sp, L.minCell * 0.36, (L.G - 8) / 13, (L.R - 2) / 3.4, 7));
  const y0 = topPad + (H - topPad - botPad - span * sp) / 2;
  const Y = (pos) => y0 + (an.maxPos - pos) * sp;
  const x0 = L.G, xEnd = L.G + L.W;
  const sw = Math.max(1, 0.24 * sp);
  const o = [];

  // Section labels and the swing marking.
  if (m.p.sections) {
    m.p.sections.forEach(([label, a, b]) => {
      const xa = L.barFracX(a) + (a > 0 ? 3 : 0), xb = L.barFracX(b) - 3;
      const fill = label === 'Fill';
      o.push(`<text x="${r1(xa)}" y="11" class="sec${fill ? ' fill' : ''}">${label.toUpperCase()}</text>`);
      o.push(`<rect x="${r1(xa)}" y="14" width="${r1(xb - xa)}" height="1.5" class="secline${fill ? ' fill' : ''}"/>`);
    });
  }
  if (m.p.swing) o.push(`<text x="6" y="${m.p.sections ? 11 : 12}" class="sec">SWING</text>`);

  // Staff, clef, time signature, repeat signs and bar lines.
  for (let pos = 0; pos <= 8; pos += 2) {
    o.push(`<rect x="${r1(x0 - 12.5 * sp)}" y="${r1(Y(pos) - 0.5)}" width="${r1(L.W + 15.8 * sp)}" height="1" class="staff"/>`);
  }
  const ink = (x, y, w, h) => o.push(`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" class="ink"/>`);
  ink(x0 - 11.4 * sp, Y(7), 0.75 * sp, 4 * sp);
  ink(x0 - 10.2 * sp, Y(7), 0.75 * sp, 4 * sp);
  const [num, den] = m.ts.split('/');
  o.push(`<text x="${r1(x0 - 6.8 * sp)}" y="${r1(Y(6))}" class="tsig" style="font-size:${r1(4.6 * sp)}px">${num}</text>`);
  o.push(`<text x="${r1(x0 - 6.8 * sp)}" y="${r1(Y(2))}" class="tsig" style="font-size:${r1(4.6 * sp)}px">${den}</text>`);
  ink(x0 - 3.9 * sp, Y(8), 0.75 * sp, 8 * sp);
  ink(x0 - 2.7 * sp, Y(8), sw, 8 * sp);
  [5, 3].forEach((pos) => o.push(`<circle cx="${r1(x0 - 1.6 * sp)}" cy="${r1(Y(pos))}" r="${r1(0.42 * sp)}" class="ink"/>`));
  for (let b = 1; b < m.bars.length; b++) ink(x0 + b * L.barW - 0.5, Y(8), 1, 8 * sp);
  [5, 3].forEach((pos) => o.push(`<circle cx="${r1(xEnd + 1.1 * sp)}" cy="${r1(Y(pos))}" r="${r1(0.42 * sp)}" class="ink"/>`));
  ink(xEnd + 1.9 * sp, Y(8), sw, 8 * sp);
  ink(xEnd + 2.5 * sp, Y(8), 0.75 * sp, 8 * sp);

  const headR = 1.3 * sp;
  const stemOff = 1.15 * sp;

  an.vgs.forEach((vg) => {
    const up = vg.voice === 'up';
    const g = vg.g;
    const bar = m.bars[g.bar];
    const beamY = vg.beamPos !== null ? Y(vg.beamPos) : 0;
    const beamH = 0.9 * sp;
    const stemXs = [];

    vg.items.forEach((it) => {
      const x = L.xAt(it.s);
      if (it.kind === 'rest') {
        drawRest(o, x, Y(up ? (m.voiceUsed.down ? 8 : 4) : 0), it.len16, sp);
        return;
      }
      const ps = it.hs.map((h) => INST[h.inst].pos);
      const hi = Math.max(...ps), lo = Math.min(...ps);
      // Ledger lines.
      for (let pos = 10; pos <= hi; pos += 2) o.push(`<rect x="${r1(x - headR - 0.6 * sp)}" y="${r1(Y(pos) - 0.5)}" width="${r1(2 * headR + 1.2 * sp)}" height="1" class="staff"/>`);
      for (let pos = -2; pos >= lo; pos -= 2) o.push(`<rect x="${r1(x - headR - 0.6 * sp)}" y="${r1(Y(pos) - 0.5)}" width="${r1(2 * headR + 1.2 * sp)}" height="1" class="staff"/>`);
      o.push(`<g class="nh" data-s="${it.s}">`);
      it.hs.forEach((h) => drawHead(o, x, Y(INST[h.inst].pos), h, sp, bar.cell > 5.2 * sp));
      o.push('</g>');
      // Stem.
      const beams = BEAMS[it.len16];
      const sx = up ? x + stemOff - sw / 2 : x - stemOff - sw / 2;
      if (it.len16 <= 6) {
        const yA = up ? beamY : Y(hi);
        const yB = up ? Y(lo) : beamY;
        ink(sx, yA, sw, yB - yA);
      }
      stemXs.push({ sx, beams });
      if (!vg.beamed && beams > 0) {
        for (let f = 0; f < beams; f++) {
          const fy = up ? beamY + f * 1.6 * sp : beamY - f * 1.6 * sp;
          const d = up ? 1 : -1;
          o.push(`<path d="M${r1(sx + sw)} ${r1(fy)} q${r1(0.3 * sp)} ${r1(d * 2 * sp)} ${r1(1.8 * sp)} ${r1(d * 3 * sp)} q${r1(0.7 * sp)} ${r1(d * 1.2 * sp)} ${r1(0)} ${r1(d * 3 * sp)}" class="flag" stroke-width="${r1(0.5 * sp)}"/>`);
        }
      }
      // Dot for dotted notes, placed in a space.
      if (it.len16 === 3 || it.len16 === 6) {
        const pos = up ? lo : hi;
        const dy = Y(pos % 2 === 0 ? pos + 1 : pos);
        o.push(`<circle cx="${r1(x + headR + 1 * sp)}" cy="${r1(dy)}" r="${r1(0.42 * sp)}" class="ink"/>`);
      }
      // Accents and open hi-hat marks.
      let ay = up ? Y(vg.beamPos + 1.6) : Y(vg.beamPos - 1.6);
      if (it.hs.some((h) => h.v === 'X')) {
        o.push(`<path d="M${r1(x - 0.9 * sp)} ${r1(ay - 0.6 * sp)} L${r1(x + 0.9 * sp)} ${r1(ay)} L${r1(x - 0.9 * sp)} ${r1(ay + 0.6 * sp)}" class="flag" stroke-width="${r1(0.3 * sp)}"/>`);
        ay = up ? ay - 2.4 * sp : ay + 2.4 * sp;
      }
      if (it.hs.some((h) => h.v === 'o')) {
        o.push(`<circle cx="${r1(x)}" cy="${r1(ay)}" r="${r1(0.7 * sp)}" class="flag" stroke-width="${r1(0.28 * sp)}"/>`);
      }
    });

    // Beams.
    if (vg.beamed) {
      const a = stemXs[0], z = stemXs[stemXs.length - 1];
      const by = up ? beamY : beamY - beamH;
      ink(a.sx, by, z.sx - a.sx + sw, beamH);
      const by2 = up ? by + 1.5 * sp : by - 1.5 * sp;
      stemXs.forEach((st, i) => {
        if (st.beams < 2) return;
        const prev = stemXs[i - 1], next = stemXs[i + 1];
        if (next && next.beams >= 2) ink(st.sx, by2, next.sx - st.sx + sw, beamH);
        else if (!(prev && prev.beams >= 2)) {
          const len = Math.min(1.8 * sp, bar.cell * 0.5);
          if (!next) ink(st.sx - len, by2, len + sw, beamH);
          else ink(st.sx, by2, len, beamH);
        }
      });
    }

    // Tuplet number.
    if (vg.tupMark) {
      const xa = L.xAt(g.start), xb = L.xAt(g.start + g.len - 1);
      const ty = up ? Y(vg.artTop + 1.8) : Y(vg.artTop - 2.6);
      o.push(`<text x="${r1((xa + xb) / 2)}" y="${r1(ty)}" class="tup" style="font-size:${r1(2.8 * sp + 2)}px">${g.tup}</text>`);
    }
  });

  // Sticking.
  if (m.stick) {
    m.steps.forEach((st, i) => {
      if (m.stick[i]) o.push(`<text x="${r1(st.x)}" y="${r1(H - 5)}" class="stk" style="font-size:${r1(Math.min(11, st.cell * 1.05))}px" data-s="${i}">${m.stick[i]}</text>`);
    });
  }

  svg.setAttribute('viewBox', `0 0 ${L.width} ${H}`);
  svg.innerHTML = o.join('');
}

function drawHead(o, x, y, h, sp, room) {
  const shape = INST[h.inst].head;
  const k = 1.05 * sp;
  if (shape === 'x' || h.v === 'c') {
    o.push(`<path d="M${r1(x - k)} ${r1(y - k)}L${r1(x + k)} ${r1(y + k)}M${r1(x + k)} ${r1(y - k)}L${r1(x - k)} ${r1(y + k)}" class="hx" stroke-width="${r1(0.42 * sp)}"/>`);
    if (h.v === 'c') o.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(1.55 * sp)}" class="hx" stroke-width="${r1(0.25 * sp)}"/>`);
  } else {
    o.push(`<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(1.3 * sp)}" ry="${r1(0.92 * sp)}" transform="rotate(-20 ${r1(x)} ${r1(y)})" class="ho"/>`);
  }
  if (h.v === 'g' && room) {
    const a = 2 * sp, b = 1.3 * sp;
    o.push(`<path d="M${r1(x - a)} ${r1(y - b)}q${r1(-0.8 * sp)} ${r1(b)} 0 ${r1(2 * b)}M${r1(x + a)} ${r1(y - b)}q${r1(0.8 * sp)} ${r1(b)} 0 ${r1(2 * b)}" class="hx" stroke-width="${r1(0.25 * sp)}"/>`);
  }
}

function drawRest(o, x, y, len16, sp) {
  const s = sp;
  const dot = len16 === 3 || len16 === 6;
  const base = len16 === 6 ? 4 : len16 === 3 ? 2 : len16;
  if (base === 4) {
    o.push(`<path d="M${r1(x - 0.4 * s)} ${r1(y - 3 * s)}L${r1(x + 0.8 * s)} ${r1(y - 1.5 * s)}L${r1(x - 0.4 * s)} ${r1(y - 0.1 * s)}L${r1(x + 0.7 * s)} ${r1(y + 1.3 * s)}Q${r1(x - 0.9 * s)} ${r1(y + 0.8 * s)} ${r1(x + 0.1 * s)} ${r1(y + 2.8 * s)}" class="rest" stroke-width="${r1(0.55 * s)}"/>`);
  } else {
    o.push(`<circle cx="${r1(x - 0.5 * s)}" cy="${r1(y - 1.2 * s)}" r="${r1(0.55 * s)}" class="ink"/>`);
    o.push(`<path d="M${r1(x - 0.5 * s)} ${r1(y - 0.8 * s)}Q${r1(x + 0.2 * s)} ${r1(y - 0.6 * s)} ${r1(x + 0.8 * s)} ${r1(y - 1.6 * s)}L${r1(x - 0.1 * s)} ${r1(y + 2.4 * s)}" class="rest" stroke-width="${r1(0.3 * s)}"/>`);
    if (base === 1) {
      o.push(`<circle cx="${r1(x - 0.8 * s)}" cy="${r1(y + 0.4 * s)}" r="${r1(0.55 * s)}" class="ink"/>`);
      o.push(`<path d="M${r1(x - 0.8 * s)} ${r1(y + 0.8 * s)}Q${r1(x - 0.1 * s)} ${r1(y + 1 * s)} ${r1(x + 0.5 * s)} ${r1(y + 0.1 * s)}" class="rest" stroke-width="${r1(0.3 * s)}"/>`);
    }
  }
  if (dot) o.push(`<circle cx="${r1(x + 1.6 * s)}" cy="${r1(y - 1 * s)}" r="${r1(0.4 * s)}" class="ink"/>`);
}

// ---------- Lanes ----------

function drawLanes(svg, m, L, H) {
  const lanes = LANE_ORDER.filter((i) => m.used[i]);
  const countH = 18;
  const rowH = Math.min(64, (H - countH - 2) / Math.max(1, lanes.length));
  const o = [];
  m.groups.forEach((g, gi) => {
    const bar = m.bars[g.bar];
    const xa = L.G + bar.x0 + (g.start - bar.start) * bar.cell;
    const w = g.len * bar.cell;
    o.push(`<rect x="${r1(xa)}" y="0" width="${r1(w)}" height="${H}" class="${gi % 2 ? 'band alt' : 'band'}"/>`);
    o.push(`<rect x="${r1(xa)}" y="0" width="1" height="${H}" class="${g.idx === 0 ? 'barline' : 'beatline'}"/>`);
  });
  o.push(`<rect x="${r1(L.G + L.W)}" y="0" width="1" height="${H}" class="barline"/>`);
  (m.p.sections || []).forEach(([label, a, b]) => {
    if (label !== 'Fill') return;
    const xa = L.barFracX(a), xb = L.barFracX(b);
    o.push(`<rect x="${r1(xa)}" y="0" width="${r1(xb - xa)}" height="${H}" class="filltint"/>`);
  });
  m.steps.forEach((st) => {
    const small = !st.strong && st.cell < 9;
    if (small) return;
    o.push(`<text x="${r1(st.x)}" y="13" class="cnt${st.strong ? ' strong' : ''}" data-s="${st.s}">${st.count}</text>`);
  });
  o.push(`<text id="posText" x="8" y="13" class="pos"></text>`);
  lanes.forEach((inst, i) => {
    const y = countH + i * rowH;
    const info = INST[inst];
    o.push(`<rect x="0" y="${r1(y)}" width="${L.width}" height="1" class="rowline"/>`);
    o.push(`<circle cx="12" cy="${r1(y + rowH / 2)}" r="3.5" fill="${info.color}" class="ldot" data-inst="${inst}"/>`);
    o.push(`<text x="21" y="${r1(y + rowH / 2)}" class="lname" data-inst="${inst}">${L.G < 80 ? info.short : info.name}</text>`);
    m.hits.filter((h) => h.inst === inst).forEach((h) => {
      const st = m.steps[h.s];
      let bw = Math.min(st.cell * 0.74, 26);
      let bh = rowH * (h.v === 'g' ? 0.34 : h.v === 'X' ? 0.8 : 0.6);
      if (h.v === 'c') bw *= 0.5;
      const cls = h.v === 'g' ? 'hit ghost' : h.v === 'o' ? 'hit open' : h.v === 'X' ? 'hit acc' : 'hit';
      o.push(`<rect x="${r1(st.x - bw / 2)}" y="${r1(y + (rowH - bh) / 2)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(Math.min(4, bw / 3))}" class="${cls}" style="--c:${info.color}" data-s="${h.s}" data-inst="${inst}"/>`);
    });
  });
  svg.setAttribute('viewBox', `0 0 ${L.width} ${H}`);
  svg.innerHTML = o.join('');
}

// ---------- Audio ----------

const audio = {
  ctx: null, out: null, noise: null, openHat: null,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
      this.ctx = new AC({ latencyHint: 'interactive' });
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.ratio.value = 4;
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.9;
      this.out.connect(comp);
      comp.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  env(t, peak, decay, attack) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + (attack || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(this.out);
    return g;
  },

  noiseInto(node, t, dur) {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    n.connect(node);
    n.start(t, Math.random() * 1.2);
    n.stop(t + dur + 0.05);
  },

  filter(type, freq, q, dest) {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    if (q) f.Q.value = q;
    f.connect(dest);
    return f;
  },

  tone(type, t, f0, f1, glide, peak, decay) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t + glide);
    osc.connect(this.env(t, peak, decay));
    osc.start(t);
    osc.stop(t + decay + 0.05);
  },

  chokeHat(t) {
    if (this.openHat && this.openHat.until > t) {
      this.openHat.g.gain.cancelScheduledValues(t);
      this.openHat.g.gain.setTargetAtTime(0.0001, t, 0.012);
    }
    this.openHat = null;
  },

  drum(inst, v, t) {
    const vel = VEL[v] || 0.7;
    switch (inst) {
      case 'k':
        this.tone('sine', t, 150, 46, 0.12, vel * 1.1, 0.45);
        this.noiseInto(this.filter('highpass', 2500, 0, this.env(t, vel * 0.18, 0.02)), t, 0.03);
        break;
      case 'sn':
        if (v === 'c') {
          this.noiseInto(this.filter('bandpass', 1900, 2.5, this.env(t, vel * 1.1, 0.05)), t, 0.06);
          this.tone('triangle', t, 520, 0, 0, vel * 0.35, 0.04);
        } else {
          this.noiseInto(this.filter('highpass', 1300, 0, this.env(t, vel * 0.7, v === 'g' ? 0.1 : 0.2)), t, 0.22);
          this.tone('triangle', t, 200, 165, 0.06, vel * 0.45, 0.1);
        }
        break;
      case 'hh': {
        this.chokeHat(t);
        const open = v === 'o';
        const decay = open ? 0.45 : 0.055;
        const g = this.env(t, vel * (open ? 0.32 : 0.38), decay);
        this.noiseInto(this.filter('highpass', 7000, 0, this.filter('bandpass', 10000, 0.7, g)), t, decay);
        if (open) this.openHat = { g, until: t + decay };
        break;
      }
      case 'hf':
        this.chokeHat(t);
        this.noiseInto(this.filter('highpass', 5500, 0, this.env(t, vel * 0.3, 0.045)), t, 0.05);
        break;
      case 'rd':
        this.noiseInto(this.filter('highpass', 5000, 0, this.filter('bandpass', 8500, 1.2, this.env(t, vel * 0.26, 0.9))), t, 0.9);
        this.tone('sine', t, 2650, 0, 0, vel * 0.05, 0.35);
        this.tone('sine', t, 3950, 0, 0, vel * 0.03, 0.25);
        break;
      case 'cr':
        this.noiseInto(this.filter('highpass', 3500, 0, this.env(t, vel * 0.5, 1.6, 0.004)), t, 1.6);
        break;
      case 't1':
      case 't2':
      case 'ft': {
        const f = inst === 't1' ? 230 : inst === 't2' ? 170 : 115;
        this.tone('sine', t, f, f * 0.66, 0.3, vel * 0.95, 0.45);
        this.noiseInto(this.filter('bandpass', f * 5, 1, this.env(t, vel * 0.15, 0.05)), t, 0.06);
        break;
      }
    }
  },

  click(t, accent) {
    this.tone('square', t, accent ? 1760 : 1175, 0, 0, accent ? 0.22 : 0.14, 0.035);
  }
};

// ---------- Player engine ----------

const engine = {
  m: null, events: [], playing: false, startTime: 0, secPerQ: 0.5, loopSec: 2,
  evIdx: 0, loopIdx: 0, lastT: 0, timer: null, countInEnd: 0,

  load(m) {
    this.stop();
    this.m = m;
    const ev = m.hits.map((h) => ({ q: m.steps[h.s].q, inst: h.inst, v: h.v }));
    m.groups.forEach((g) => ev.push({ q: g.q, click: true, accent: g.idx === 0 }));
    ev.sort((a, b) => a.q - b.q || (a.click ? -1 : 1));
    this.events = ev;
  },

  setTempo(bpm) {
    const ctx = audio.ctx;
    const newSec = 60 / (bpm * this.m.beatQ);
    if (this.playing && ctx) {
      const now = ctx.currentTime;
      if (now >= this.startTime) {
        const posQ = (now - this.startTime) / this.secPerQ;
        this.startTime = now - posQ * newSec;
      } else {
        this.startTime = now + (this.startTime - now) * (newSec / this.secPerQ);
      }
      this.secPerQ = newSec;
      this.loopSec = this.m.totalQ * newSec;
      // Continue scheduling from just after the last event already queued.
      const qAbs = (this.lastT - this.startTime) / newSec;
      this.loopIdx = Math.floor(qAbs / this.m.totalQ);
      const qIn = qAbs - this.loopIdx * this.m.totalQ;
      this.evIdx = this.events.findIndex((e) => e.q > qIn + 1e-6);
      if (this.evIdx < 0) { this.evIdx = 0; this.loopIdx++; }
    } else {
      this.secPerQ = newSec;
      this.loopSec = this.m.totalQ * newSec;
    }
  },

  start(bpm, countIn) {
    const ctx = audio.ensure();
    if (!ctx || !this.m) return;
    this.setTempo(bpm);
    const lead = 0.12;
    let t0 = ctx.currentTime + lead;
    if (countIn) {
      const bar = this.m.bars[0];
      this.m.groups.filter((g) => g.bar === 0).forEach((g) => {
        audio.click(t0 + (g.q - bar.qStart) * this.secPerQ, g.idx === 0);
      });
      t0 += bar.q * this.secPerQ;
    }
    this.countInEnd = t0;
    this.startTime = t0;
    this.lastT = t0 - 0.001;
    this.evIdx = 0;
    this.loopIdx = 0;
    this.playing = true;
    this.tick();
    this.timer = setInterval(() => this.tick(), 25);
  },

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
  },

  tick() {
    if (!this.playing) return;
    const ctx = audio.ctx;
    const horizon = ctx.currentTime + 0.12;
    for (let guard = 0; guard < 512; guard++) {
      const ev = this.events[this.evIdx];
      const t = this.startTime + this.loopIdx * this.loopSec + ev.q * this.secPerQ;
      if (t > horizon) break;
      if (t >= ctx.currentTime - 0.03) {
        if (ev.click) { if (settings.metro) audio.click(t, ev.accent); }
        else if (settings.sound) audio.drum(ev.inst, ev.v, t);
      }
      this.lastT = t;
      this.evIdx++;
      if (this.evIdx >= this.events.length) { this.evIdx = 0; this.loopIdx++; }
    }
  },

  // The AudioContext time of the sound reaching the speakers right now.
  // getOutputTimestamp and outputLatency are each missing or under-reported
  // on some browsers, so take whichever estimate lags more, then apply the
  // user's own sync nudge.
  heardTime() {
    const ctx = audio.ctx;
    let t = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
    if (ctx.getOutputTimestamp) {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.performanceTime > 0 && ts.contextTime > 0) {
        t = Math.min(t, ts.contextTime + (performance.now() - ts.performanceTime) / 1000);
      }
    }
    return t - (settings.syncMs || 0) / 1000;
  },

  // Position for the display: { countIn, step, frac, loop } or null.
  position() {
    if (!this.playing) return null;
    const now = this.heardTime();
    if (now < this.startTime) {
      const bar = this.m.bars[0];
      const into = (now - (this.startTime - bar.q * this.secPerQ)) / this.secPerQ;
      const gs = this.m.groups.filter((g) => g.bar === 0);
      let n = 0;
      gs.forEach((g, i) => { if (into >= g.q - bar.qStart - 1e-6) n = i + 1; });
      return { countIn: Math.max(1, n) };
    }
    const qAbs = (now - this.startTime) / this.secPerQ;
    const loop = Math.floor(qAbs / this.m.totalQ);
    const q = qAbs - loop * this.m.totalQ;
    const steps = this.m.steps;
    let lo = 0, hi = steps.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (steps[mid].q <= q) lo = mid; else hi = mid - 1;
    }
    const nextQ = lo + 1 < steps.length ? steps[lo + 1].q : this.m.totalQ;
    return { step: lo, frac: Math.min(1, (q - steps[lo].q) / (nextQ - steps[lo].q)), loop };
  }
};

// ---------- Settings ----------

const settings = { sound: true, metro: true, countIn: true, view: 'both', syncMs: 0 };
const STORE = 'backbeat:';

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE + 'settings') || '{}');
    Object.assign(settings, s);
  } catch (e) { /* storage unavailable */ }
}
function saveSettings() {
  try { localStorage.setItem(STORE + 'settings', JSON.stringify(settings)); } catch (e) { /* ignore */ }
}
function savedBpm(id) {
  try { return Number(localStorage.getItem(STORE + 'bpm:' + id)) || null; } catch (e) { return null; }
}
function saveBpm(id, bpm) {
  try { localStorage.setItem(STORE + 'bpm:' + id, String(bpm)); } catch (e) { /* ignore */ }
}

// ---------- UI ----------

const $ = (id) => document.getElementById(id);
const ORDERED = PATTERNS.slice().sort((a, b) => a.level - b.level);
const filters = { type: 'all', style: '', level: 0 };
let current = null; // { p, m, L, bpm }
let lastStep = -1, lastLoop = -1, litEls = [];
let wakeLock = null;

function previewSvg(p) {
  const m = buildModel(p);
  const n = m.steps.length;
  const w = 300, rowH = 12;
  const o = [];
  m.bars.forEach((bar, b) => { if (b) o.push(`<rect x="${(b * w) / m.bars.length}" y="0" width="1" height="48" class="pv-bar"/>`); });
  m.hits.forEach((h) => {
    const st = m.steps[h.s];
    const bar = m.bars[st.bar];
    const x = ((st.bar + (st.bi + 0.5) / bar.len) * w) / m.bars.length;
    const fam = INST[h.inst].fam;
    const cw = Math.min(6, (w / n) * 0.8);
    o.push(`<rect x="${r1(x - cw / 2)}" y="${fam * rowH + 3}" width="${r1(cw)}" height="6" rx="1.5" fill="${INST[h.inst].color}" opacity="${h.v === 'g' ? 0.45 : 1}"/>`);
  });
  return `<svg viewBox="0 0 ${w} 48" preserveAspectRatio="none" aria-hidden="true">${o.join('')}</svg>`;
}

function renderLibrary() {
  const list = $('list');
  const items = ORDERED.filter((p) =>
    (filters.type === 'all' || p.type === filters.type) &&
    (!filters.style || p.style === filters.style) &&
    (!filters.level || p.level === filters.level));
  if (!items.length) {
    list.innerHTML = '<p class="empty">No patterns match these filters.</p>';
    return;
  }
  const byLevel = {};
  items.forEach((p) => { (byLevel[p.level] = byLevel[p.level] || []).push(p); });
  list.innerHTML = Object.keys(byLevel).map((lv) => `
    <section class="lvl-sec">
      <h2>Level ${lv} <span>${BANDS[lv]}</span></h2>
      <div class="cards">
        ${byLevel[lv].map((p) => {
          const ts = (p.grids ? GRIDS[p.grids[0]] : GRIDS[p.grid]).ts;
          const nb = (p.grids ? p.grids.length : splitTrack(Object.values(p.t)[0]).length);
          return `<a class="card" href="#/p/${p.id}">
            <span class="card-top"><span class="tag ${p.type}">${TYPE_LABEL[p.type]}</span><span class="card-bpm">${p.bpm} BPM</span></span>
            <span class="card-name">${p.name}</span>
            <span class="card-meta">${p.style} · ${ts} · ${nb} bar${nb > 1 ? 's' : ''}${p.swing ? ' · swing' : ''}</span>
            <span class="pv">${previewSvg(p)}</span>
            <span class="meter" aria-label="Level ${p.level} of 10">${Array.from({ length: 10 }, (_, i) => `<i class="${i < p.level ? 'on' : ''}"></i>`).join('')}</span>
          </a>`;
        }).join('')}
      </div>
    </section>`).join('');
}

function initLibrary() {
  const styles = [...new Set(PATTERNS.map((p) => p.style))].sort();
  $('styleSel').innerHTML = '<option value="">All styles</option>' + styles.map((s) => `<option>${s}</option>`).join('');
  $('styleSel').addEventListener('change', (e) => { filters.style = e.target.value; renderLibrary(); });
  $('levelChips').innerHTML = ['All', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((l, i) => `<button type="button" data-level="${i}" aria-pressed="${i === 0}">${l}</button>`).join('');
  $('levelChips').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filters.level = Number(b.dataset.level);
    $('levelChips').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderLibrary();
  });
  $('typeSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    filters.type = b.dataset.type;
    $('typeSeg').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderLibrary();
  });
  $('count').textContent = `${PATTERNS.length} patterns`;
  renderLibrary();
}

// ---- Player ----

function openPattern(id) {
  const p = PATTERNS.find((x) => x.id === id);
  if (!p) { location.hash = ''; return; }
  stopPlayback();
  const m = buildModel(p);
  current = { p, m, L: null, bpm: savedBpm(p.id) || p.bpm };
  engine.load(m);
  $('pName').textContent = p.name;
  const ts = m.ts;
  $('pMeta').textContent = `Level ${p.level} · ${TYPE_LABEL[p.type]} · ${p.style} · ${ts}${p.swing ? ' · swing' : ''}`;
  $('pLevel').textContent = p.level;
  $('tipText').textContent = p.tip || '';
  const i = ORDERED.indexOf(p);
  const prev = ORDERED[i - 1], next = ORDERED[i + 1];
  $('prevBtn').disabled = !prev;
  $('nextBtn').disabled = !next;
  $('prevBtn').title = prev ? `Easier: ${prev.name} (level ${prev.level})` : 'This is the easiest pattern';
  $('nextBtn').title = next ? `Harder: ${next.name} (level ${next.level})` : 'This is the hardest pattern';
  updateBpm();
  $('library').hidden = true;
  $('player').hidden = false;
  document.title = `${p.name} – Backbeat`;
  requestAnimationFrame(renderStage);
}

function renderStage() {
  if (!current || $('player').hidden) return;
  const stage = $('stage');
  stage.dataset.view = settings.view;
  const np = $('notePanel'), lp = $('lanePanel');
  const width = stage.clientWidth;
  const L = makeLayout(current.m, width);
  current.L = L;
  if (settings.view !== 'lanes') drawNotation($('noteSvg'), current.m, L, np.clientHeight);
  if (settings.view !== 'notes') drawLanes($('laneSvg'), current.m, L, lp.clientHeight);
  const first = settings.view === 'lanes' ? lp : np;
  const last = settings.view === 'notes' ? np : lp;
  const ph = $('playhead');
  ph.style.left = first.offsetLeft + 'px';
  ph.style.top = first.offsetTop - 2 + 'px';
  ph.style.height = last.offsetTop + last.offsetHeight - first.offsetTop + 2 + 'px';
  ph.style.bottom = 'auto';
  // Index the elements that light up on each step.
  current.byStep = current.m.steps.map(() => []);
  stage.querySelectorAll('[data-s]').forEach((el) => {
    const arr = current.byStep[Number(el.dataset.s)];
    if (arr) arr.push(el);
  });
  current.labels = {};
  stage.querySelectorAll('#laneSvg [data-inst]:not(.hit)').forEach((el) => {
    (current.labels[el.dataset.inst] = current.labels[el.dataset.inst] || []).push(el);
  });
  lastStep = -1;
  showPosition(engine.position() || { step: 0, frac: 0, idle: true });
}

function showPosition(pos) {
  const cin = $('countIn');
  if (pos.countIn) {
    cin.hidden = false;
    cin.textContent = pos.countIn;
    $('playhead').style.opacity = '0';
    setLit(-1);
    return;
  }
  cin.hidden = true;
  const m = current.m, L = current.L;
  if (!L) return;
  const st = m.steps[pos.step];
  const nextX = pos.step + 1 < m.steps.length ? m.steps[pos.step + 1].x : L.G + L.W;
  const x = pos.idle ? st.x - st.cell / 2 : st.x + (nextX - st.x) * pos.frac;
  const ph = $('playhead');
  ph.style.opacity = pos.idle ? '0.5' : '1';
  ph.style.transform = `translateX(${x.toFixed(1)}px)`;
  if (pos.idle) { setLit(-1); return; }
  if (pos.step !== lastStep) {
    setLit(pos.step);
    const pt = document.getElementById('posText');
    if (pt) {
      const g = m.groups[st.group];
      pt.textContent = `${st.bar + 1}.${g.idx + 1}`;
    }
  }
  if (pos.loop !== lastLoop) {
    lastLoop = pos.loop;
    $('loopText').textContent = `Loop ${pos.loop + 1}`;
  }
}

function setLit(step) {
  litEls.forEach((el) => el.classList.remove('on'));
  litEls = [];
  lastStep = step;
  if (step < 0 || !current.byStep) return;
  current.byStep[step].forEach((el) => { el.classList.add('on'); litEls.push(el); });
  current.m.hitsAt[step].forEach((h) => {
    (current.labels[h.inst] || []).forEach((el) => { el.classList.add('on'); litEls.push(el); });
  });
}

function frame() {
  if (engine.playing && current) {
    const pos = engine.position();
    if (pos) showPosition(pos);
    requestAnimationFrame(frame);
  }
}

function startPlayback() {
  if (!current) return;
  engine.start(current.bpm, settings.countIn);
  if (!audio.ctx) return;
  lastLoop = -1;
  $('playBtn').setAttribute('aria-label', 'Stop');
  $('playBtn').classList.add('playing');
  requestWake();
  requestAnimationFrame(frame);
}

function stopPlayback() {
  engine.stop();
  $('playBtn').setAttribute('aria-label', 'Play');
  $('playBtn').classList.remove('playing');
  $('countIn').hidden = true;
  $('loopText').textContent = '';
  releaseWake();
  if (current && current.L) showPosition({ step: 0, frac: 0, idle: true });
}

function togglePlay() {
  if (engine.playing) stopPlayback(); else startPlayback();
}

function updateBpm() {
  $('bpmVal').textContent = current.bpm;
}

function changeBpm(d) {
  if (!current) return;
  current.bpm = Math.max(30, Math.min(260, current.bpm + d));
  updateBpm();
  saveBpm(current.p.id, current.bpm);
  if (engine.playing) engine.setTempo(current.bpm);
}

function holdRepeat(btn, fn) {
  let t1 = null, t2 = null;
  const stop = () => { clearTimeout(t1); clearInterval(t2); };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    fn();
    t1 = setTimeout(() => { t2 = setInterval(fn, 70); }, 400);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}

function syncToggles() {
  $('soundBtn').setAttribute('aria-pressed', String(settings.sound));
  $('metroBtn').setAttribute('aria-pressed', String(settings.metro));
  $('countInBtn').setAttribute('aria-pressed', String(settings.countIn));
  $('viewSeg').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === settings.view)));
  $('syncVal').textContent = `${settings.syncMs > 0 ? '+' : ''}${settings.syncMs} ms`;
}

function changeSync(d) {
  settings.syncMs = Math.max(-200, Math.min(400, settings.syncMs + d));
  syncToggles();
  saveSettings();
}

async function requestWake() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { wakeLock = null; }
}
function releaseWake() {
  try { if (wakeLock) wakeLock.release(); } catch (e) { /* ignore */ }
  wakeLock = null;
}

function updateRotateHint() {
  const portrait = window.matchMedia('(orientation: portrait) and (max-width: 600px)').matches;
  $('rotateHint').hidden = !portrait || sessionStorageGet('rotateDismissed');
}
function sessionStorageGet(k) {
  try { return sessionStorage.getItem(STORE + k); } catch (e) { return null; }
}
function sessionStorageSet(k, v) {
  try { sessionStorage.setItem(STORE + k, v); } catch (e) { /* ignore */ }
}

function closeMenu() {
  $('moreMenu').hidden = true;
  $('moreBtn').setAttribute('aria-expanded', 'false');
}

function initPlayer() {
  $('backBtn').addEventListener('click', () => { location.hash = ''; });
  $('playBtn').addEventListener('click', togglePlay);
  holdRepeat($('slowBtn'), () => changeBpm(-1));
  holdRepeat($('fastBtn'), () => changeBpm(1));
  $('soundBtn').addEventListener('click', () => { settings.sound = !settings.sound; syncToggles(); saveSettings(); });
  $('metroBtn').addEventListener('click', () => { settings.metro = !settings.metro; syncToggles(); saveSettings(); });
  $('countInBtn').addEventListener('click', () => { settings.countIn = !settings.countIn; syncToggles(); saveSettings(); });
  $('viewSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    settings.view = b.dataset.view;
    syncToggles();
    saveSettings();
    requestAnimationFrame(renderStage);
  });
  holdRepeat($('syncLessBtn'), () => changeSync(-10));
  holdRepeat($('syncMoreBtn'), () => changeSync(10));
  $('resetBpmBtn').addEventListener('click', () => { if (current) changeBpm(current.p.bpm - current.bpm); });
  const go = (d) => {
    const i = ORDERED.indexOf(current.p) + d;
    if (ORDERED[i]) location.hash = '#/p/' + ORDERED[i].id;
  };
  $('prevBtn').addEventListener('click', () => go(-1));
  $('nextBtn').addEventListener('click', () => go(1));
  $('moreBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = $('moreMenu').hidden;
    $('moreMenu').hidden = !open;
    $('moreBtn').setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!$('moreMenu').hidden && !$('moreMenu').contains(e.target)) closeMenu();
  });
  const fsBtn = $('fullscreenBtn');
  if (!document.fullscreenEnabled) fsBtn.hidden = true;
  fsBtn.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else {
        await document.documentElement.requestFullscreen();
        try { await screen.orientation.lock('landscape'); } catch (e) { /* not allowed */ }
      }
    } catch (e) { /* ignore */ }
    closeMenu();
  });
  $('rotateClose').addEventListener('click', () => { sessionStorageSet('rotateDismissed', '1'); updateRotateHint(); });
  syncToggles();

  let pending = false;
  const onResize = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; renderStage(); updateRotateHint(); });
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && engine.playing) requestWake();
  });
  document.addEventListener('keydown', (e) => {
    if ($('player').hidden || e.target.closest('input, select, textarea')) return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); changeBpm(1); }
    else if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); changeBpm(-1); }
    else if (e.key === 'Escape') closeMenu();
  });
}

function route() {
  const mm = location.hash.match(/^#\/p\/([\w-]+)/);
  if (mm) {
    openPattern(mm[1]);
    updateRotateHint();
  } else {
    stopPlayback();
    current = null;
    $('player').hidden = true;
    $('library').hidden = false;
    document.title = 'Backbeat – drum practice';
  }
  closeMenu();
}

loadSettings();
initLibrary();
initPlayer();
window.addEventListener('hashchange', route);
route();
