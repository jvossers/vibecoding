import { loadDict, analyse, flatten } from './syllables.js';
import { fit, STEPS_PER_BAR, MAX_BARS } from './fit.js';
import { Player } from './audio.js';

const $ = id => document.getElementById(id);
const STORE = 'lyric-beat-editor:v1';
const SAMPLE = 'Snow fell, trains stopped. Noon came, trains ran.';

// Hard-coded arrangement for the sample, so the page plays before any analysis runs.
const sampleSyllables = () => ['Snow', 'fell', 'trains', 'stopped', 'Noon', 'came', 'trains', 'ran'].map((w, i) => ({
  label: w, stress: 1, uncertain: false, word: w, wordKey: w.toLowerCase(), wordIndex: i, sylIndex: 0, sylCount: 1,
  breakBefore: i > 0 && i % 2 === 0, step: i * 2,
}));

// Source text, working lyrics and the arrangement are kept apart on purpose:
// `source` is what the user typed, `working` is the text the grid was built from,
// `syllables` (with integer `step`s) is the only source of timing.
const state = {
  source: SAMPLE,
  working: SAMPLE,
  syllables: sampleSyllables(),
  bars: 1,
  bpm: 90,
  loop: false,
  cues: false,
  overrides: {},
  layouts: [],
  layoutId: null,
  selected: null,
};

try {
  const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
  if (saved && Array.isArray(saved.syllables)) {
    for (const k of ['source', 'working', 'syllables', 'bars', 'bpm', 'loop', 'cues', 'overrides']) {
      if (saved[k] !== undefined) state[k] = saved[k];
    }
  }
} catch { /* storage unavailable */ }

function save() {
  try {
    const { source, working, syllables, bars, bpm, loop, cues, overrides } = state;
    localStorage.setItem(STORE, JSON.stringify({ source, working, syllables, bars, bpm, loop, cues, overrides }));
  } catch { /* storage unavailable */ }
}

const player = new Player();
const narrow = window.matchMedia('(max-width: 700px)');
const stepsPerRow = () => (narrow.matches ? 8 : 16);
const totalSteps = () => state.bars * STEPS_PER_BAR;

const grid = $('grid');
let rows = [];          // { el, lane, head }
let chips = [];         // chip element per syllable
let liveRow = -1, liveChip = null, lastCount = 0, raf = 0;

/* ---------------- grid rendering ---------------- */

function renderGrid() {
  const spr = stepsPerRow();
  const hadFocus = grid.contains(document.activeElement);
  grid.textContent = '';
  rows = [];
  for (let r = 0; r < totalSteps() / spr; r++) {
    const first = r * spr;
    const row = document.createElement('div');
    row.className = 'row' + (first % STEPS_PER_BAR === 0 ? ' barstart' : '');
    row.style.setProperty('--n', spr);
    if (first % STEPS_PER_BAR === 0) {
      const lab = document.createElement('div');
      lab.className = 'barlabel';
      lab.textContent = 'BAR ' + (first / STEPS_PER_BAR + 1);
      row.append(lab);
    }
    const ruler = document.createElement('div');
    ruler.className = 'ruler';
    ruler.setAttribute('aria-hidden', 'true');
    const lane = document.createElement('div');
    lane.className = 'lane';
    for (let c = 0; c < spr; c++) {
      const s = first + c, inBar = s % STEPS_PER_BAR;
      const tick = document.createElement('span');
      if (inBar % 4 === 0) { tick.className = 'beat'; tick.textContent = inBar / 4 + 1; }
      else tick.textContent = inBar % 4 === 2 ? '&' : '·';
      ruler.append(tick);
      const cell = document.createElement('div');
      cell.className = 'cell' + (inBar % 4 === 0 ? ' beat' : '') + (inBar === 4 || inBar === 12 ? ' clap' : '');
      cell.dataset.step = s;
      cell.style.gridColumn = c + 1;
      lane.append(cell);
    }
    const head = document.createElement('div');
    head.className = 'playhead';
    lane.append(head);
    row.append(ruler, lane);
    grid.append(row);
    rows.push({ el: row, lane, head });
  }
  chips = state.syllables.map((syl, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.i = i;
    return b;
  });
  placeChips();
  if (hadFocus && state.selected != null) chips[state.selected]?.focus({ preventScroll: true });
  $('barsOut').textContent = state.bars + (state.bars === 1 ? ' bar' : ' bars');
  $('barsDown').disabled = state.bars <= 1;
  $('barsUp').disabled = state.bars >= MAX_BARS;
}

const beatName = step => {
  const inBar = step % STEPS_PER_BAR;
  return `bar ${Math.floor(step / STEPS_PER_BAR) + 1}, beat ${Math.floor(inBar / 4) + 1}${['', ' e', ' and', ' a'][inBar % 4]}`;
};

/** Position every chip from the arrangement without recreating elements. */
function placeChips() {
  const spr = stepsPerRow();
  const taken = new Set(state.syllables.map(s => s.step));
  grid.querySelectorAll('.cell').forEach(c => c.classList.toggle('free', !taken.has(+c.dataset.step)));
  state.syllables.forEach((syl, i) => {
    const el = chips[i];
    const r = Math.floor(syl.step / spr), c = syl.step % spr;
    const next = state.syllables[i + 1];
    const room = Math.min(4, spr - c, next ? next.step - syl.step : 4);
    el.style.gridColumn = `${c + 1} / span ${room}`;
    el.textContent = syl.label;
    el.className = 'chip' + (syl.stress === 1 ? ' strong' : '') + (syl.uncertain ? ' unsure' : '') +
      (room === 1 && syl.label.length > 3 ? ' tight' : '') + (i === state.selected ? ' sel' : '');
    el.tabIndex = i === (state.selected ?? 0) ? 0 : -1;
    el.setAttribute('aria-label', `${syl.label}, ${syl.sylCount > 1 ? `part of ${syl.word}, ` : ''}${beatName(syl.step)}` +
      (syl.uncertain ? ', split uncertain' : ''));
    el.setAttribute('aria-pressed', i === state.selected);
    const lane = rows[r].lane;
    if (el.parentNode !== lane) lane.insertBefore(el, rows[r].head);
  });
}

/* ---------------- selection and moving ---------------- */

function say(msg) { $('live').textContent = ''; requestAnimationFrame(() => { $('live').textContent = msg; }); }

function select(i, focus = false) {
  if (player.playing) return;
  state.selected = i;
  document.body.classList.toggle('selecting', i != null);
  placeChips();
  const ed = $('editor');
  ed.hidden = i == null;
  if (i != null) {
    const syl = state.syllables[i];
    $('splitIn').value = state.syllables.filter(s => s.wordIndex === syl.wordIndex).map(s => s.label).join('·');
    $('splitIn').setAttribute('aria-label', `Syllable split for ${syl.word}`);
    updateNudgeButtons();
    if (focus) chips[i].focus({ preventScroll: false });
  }
}

function range(i) {
  const prev = state.syllables[i - 1], next = state.syllables[i + 1];
  return [prev ? prev.step + 1 : 0, next ? next.step - 1 : totalSteps() - 1];
}

function updateNudgeButtons() {
  const i = state.selected;
  if (i == null) return;
  const [lo, hi] = range(i), s = state.syllables[i].step;
  $('earlier').disabled = s <= lo;
  $('later').disabled = s >= hi;
}

/** Move syllable i to `step` if that keeps word order and avoids collisions. */
function moveTo(i, step, { quiet = false } = {}) {
  if (player.playing) return false;
  const [lo, hi] = range(i);
  const syl = state.syllables[i];
  if (step < lo || step > hi) {
    if (!quiet) {
      chips[i].classList.remove('nope'); void chips[i].offsetWidth; chips[i].classList.add('nope');
      say('Syllables stay in order. Move its neighbour first.');
    }
    return false;
  }
  if (step === syl.step) return true;
  syl.step = step;
  placeChips();
  updateNudgeButtons();
  save();
  if (!quiet) say(`${syl.label} moved to ${beatName(step)}`);
  return true;
}

const nudge = (i, d) => moveTo(i, state.syllables[i].step + d);

grid.addEventListener('click', e => {
  if (suppressClick) { suppressClick = false; return; }
  const chip = e.target.closest('.chip');
  if (chip) { select(+chip.dataset.i); return; }
  const cell = e.target.closest('.cell');
  if (cell && state.selected != null) moveTo(state.selected, +cell.dataset.step);
});

grid.addEventListener('keydown', e => {
  const chip = e.target.closest('.chip');
  if (!chip || player.playing) return;
  const i = +chip.dataset.i;
  const n = state.syllables.length;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    if (state.selected !== i) select(i);
    nudge(i, e.key === 'ArrowLeft' ? -1 : 1);
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    select(Math.max(0, Math.min(n - 1, i + (e.key === 'ArrowUp' ? -1 : 1))), true);
  } else if (e.key === 'Home' || e.key === 'End') {
    e.preventDefault();
    select(e.key === 'Home' ? 0 : n - 1, true);
  } else if (e.key === 'Escape') {
    select(null);
  }
});

// Pointer dragging. Horizontal drags move the syllable; vertical drags still scroll the page.
let drag = null, suppressClick = false;
grid.addEventListener('pointerdown', e => {
  const chip = e.target.closest('.chip');
  if (!chip || player.playing || (e.pointerType === 'mouse' && e.button !== 0)) return;
  drag = { i: +chip.dataset.i, x: e.clientX, y: e.clientY, active: false, id: e.pointerId };
});
window.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.active) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
    drag.active = true;
    select(drag.i);
    chips[drag.i].classList.add('drag');
  }
  const spr = stepsPerRow();
  let r = rows.findIndex(row => { const b = row.lane.getBoundingClientRect(); return e.clientY >= b.top - 14 && e.clientY <= b.bottom + 14; });
  if (r < 0) r = Math.floor(state.syllables[drag.i].step / spr);
  const b = rows[r].lane.getBoundingClientRect();
  const c = Math.max(0, Math.min(spr - 1, Math.floor((e.clientX - b.left) / (b.width / spr))));
  const [lo, hi] = range(drag.i);
  moveTo(drag.i, Math.max(lo, Math.min(hi, r * spr + c)), { quiet: true });
  chips[drag.i].classList.add('drag');
});
const endDrag = e => {
  if (!drag || e.pointerId !== drag.id) return;
  if (drag.active) {
    chips[drag.i].classList.remove('drag');
    suppressClick = e.type === 'pointerup';
    setTimeout(() => { suppressClick = false; }, 0);
    say(`${state.syllables[drag.i].label} moved to ${beatName(state.syllables[drag.i].step)}`);
  }
  drag = null;
};
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

$('earlier').addEventListener('click', () => state.selected != null && nudge(state.selected, -1));
$('later').addEventListener('click', () => state.selected != null && nudge(state.selected, 1));
$('deselect').addEventListener('click', () => select(null));

/* ---------------- fitting ---------------- */

function setStatus(msg, warn = false) {
  const el = $('fitStatus');
  el.textContent = msg;
  el.classList.toggle('warn', warn);
}

function renderWorking() {
  const stale = state.source.trim() !== state.working.trim();
  const el = $('working');
  el.textContent = '';
  if (stale && state.working) {
    const em = document.createElement('em');
    em.textContent = 'Text changed. ';
    el.append(em, `The grid still shows “${state.working.trim().replace(/\s+/g, ' ')}”. Press Fit words to update it.`);
  }
}

function renderLayouts() {
  const box = $('layouts');
  box.textContent = '';
  box.hidden = state.layouts.length < 2;
  for (const l of state.layouts) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout';
    b.setAttribute('aria-pressed', l.id === state.layoutId);
    const name = document.createElement('b');
    name.textContent = l.name;
    const info = document.createElement('small');
    const st = l.stats;
    info.textContent = `${st.onBeat} of ${st.strong} stresses on a beat · ${l.bars} ${l.bars === 1 ? 'bar' : 'bars'}`;
    b.append(name, info);
    b.addEventListener('click', () => { if (!player.playing) applyLayout(l); });
    box.append(b);
  }
}

function applyLayout(layout) {
  state.layoutId = layout.id;
  state.bars = layout.bars;
  state.syllables = state.fitSyllables.map((s, i) => ({ ...s, step: layout.steps[i] }));
  state.selected = null;
  $('editor').hidden = true;
  document.body.classList.remove('selecting');
  renderGrid();
  renderLayouts();
  save();
}

async function doFit() {
  if (player.playing) return;
  const text = $('source').value;
  state.source = text;
  if (!text.trim()) { setStatus('Type or paste some words first.', true); return; }
  $('fitBtn').disabled = true;
  let dictOk = true;
  try {
    setStatus('Loading pronunciation data…');
    await loadDict();
  } catch {
    dictOk = false;
  }
  $('fitBtn').disabled = false;
  const syls = flatten(analyse(text, state.overrides));
  if (!syls.length) { setStatus('No words found in that text.', true); return; }
  const { layouts, overflow } = fit(syls);
  if (overflow) {
    setStatus(`That is ${syls.length} syllables, more than ${MAX_BARS} bars can hold (${MAX_BARS * STEPS_PER_BAR}). ` +
      'Split the text and fit one part at a time. Nothing was changed.', true);
    return;
  }
  state.working = text;
  state.fitSyllables = syls;
  state.layouts = layouts;
  applyLayout(layouts[0]);
  renderWorking();
  const unsure = new Set(syls.filter(s => s.uncertain).map(s => s.word)).size;
  let msg = `${syls.length} syllables over ${layouts[0].bars} ${layouts[0].bars === 1 ? 'bar' : 'bars'}.`;
  if (unsure) msg += ` ${unsure} ${unsure === 1 ? 'word has a dashed outline' : 'words have dashed outlines'}: tap to check the split.`;
  if (!dictOk) msg = 'Pronunciation data did not load, so syllables are estimated from spelling. ' + msg;
  setStatus(msg, !dictOk);
}

$('fitBtn').addEventListener('click', doFit);
$('source').addEventListener('input', () => { state.source = $('source').value; renderWorking(); save(); });
$('sampleBtn').addEventListener('click', () => {
  if (player.playing) return;
  $('source').value = SAMPLE;
  doFit();
});

// Correcting a split. Same syllable count: relabel in place. Different count: refit.
$('splitForm').addEventListener('submit', e => {
  e.preventDefault();
  const i = state.selected;
  if (i == null || player.playing) return;
  const syl = state.syllables[i];
  const parts = $('splitIn').value.split(/[·\-\s.|/]+/).filter(Boolean);
  if (parts.join('').toLowerCase() !== syl.word.toLowerCase()) {
    say(`Keep the letters of “${syl.word}” and separate syllables with a hyphen.`);
    setStatus(`Keep the letters of “${syl.word}” and separate syllables with a hyphen, like ${syl.word.slice(0, 2)}-${syl.word.slice(2)}.`, true);
    return;
  }
  // keep the original capitalisation
  let at = 0;
  const cased = parts.map(p => { const out = syl.word.slice(at, at + p.length); at += p.length; return out; });
  state.overrides[syl.wordKey] = cased;
  const same = cased.length === syl.sylCount;
  if (same) {
    for (const s of state.syllables) {
      if (s.wordKey === syl.wordKey && s.sylCount === cased.length) { s.label = cased[s.sylIndex]; s.uncertain = false; }
    }
    for (const s of state.fitSyllables || []) {
      if (s.wordKey === syl.wordKey && s.sylCount === cased.length) { s.label = cased[s.sylIndex]; s.uncertain = false; }
    }
    placeChips();
    save();
    setStatus(`Split for “${syl.word}” updated.`);
  } else if (state.source.trim() === state.working.trim()) {
    doFit().then(() => setStatus(`“${syl.word}” now has ${cased.length} ${cased.length === 1 ? 'syllable' : 'syllables'}, so the words were fitted again.`));
  } else {
    save();
    setStatus(`Saved. “${syl.word}” will use ${cased.length} syllables the next time you press Fit words.`);
  }
});

/* ---------------- bars, tempo, toggles ---------------- */

function setBars(n) {
  if (player.playing) return;
  n = Math.max(1, Math.min(MAX_BARS, n));
  const last = Math.max(-1, ...state.syllables.map(s => s.step));
  if (last >= n * STEPS_PER_BAR) {
    setStatus(`Bar ${n + 1} still has syllables in it. Move them earlier before removing the bar.`, true);
    return;
  }
  state.bars = n;
  renderGrid();
  save();
}
$('barsDown').addEventListener('click', () => setBars(state.bars - 1));
$('barsUp').addEventListener('click', () => setBars(state.bars + 1));

function setBpm(v) {
  if (player.playing) return;
  state.bpm = Math.max(60, Math.min(160, Math.round(v) || 90));
  $('bpm').value = state.bpm;
  $('bpmOut').textContent = state.bpm;
  save();
}
$('bpm').addEventListener('input', e => setBpm(+e.target.value));
$('bpmDown').addEventListener('click', () => setBpm(state.bpm - 1));
$('bpmUp').addEventListener('click', () => setBpm(state.bpm + 1));

function toggle(key, btn) {
  if (player.playing) return;
  state[key] = !state[key];
  btn.setAttribute('aria-pressed', state[key]);
  save();
}
$('loopBtn').addEventListener('click', e => toggle('loop', e.currentTarget));
$('cuesBtn').addEventListener('click', e => toggle('cues', e.currentTarget));

/* ---------------- playback ---------------- */

const LOCKED = ['fitBtn', 'sampleBtn', 'barsDown', 'barsUp', 'bpm', 'bpmDown', 'bpmUp', 'loopBtn', 'cuesBtn'];

async function play() {
  select(null);
  try {
    await player.start({
      bpm: state.bpm,
      totalSteps: totalSteps(),
      onsets: new Set(state.syllables.map(s => s.step)),
      loop: state.loop,
      cues: state.cues,
      onEnd: stopped,
    });
  } catch (err) {
    setStatus('Audio could not start: ' + err.message, true);
    return;
  }
  document.body.classList.add('playing', 'counting');
  $('playBtn').setAttribute('aria-label', 'Stop');
  LOCKED.forEach(id => { $(id).disabled = true; });
  lastCount = 0;
  showRow(0);
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}

// Keeps the current row on screen, clear of the dock. Scrolling never moves keyboard focus.
function showRow(r) {
  const b = rows[r].el.getBoundingClientRect();
  const dock = document.querySelector('.dock').getBoundingClientRect().height;
  const top = 12, bottom = window.innerHeight - dock - 12;
  if (b.top >= top && b.bottom <= bottom) return;
  const delta = b.bottom > bottom ? Math.min(b.bottom - bottom, b.top - top) : b.top - top;
  window.scrollBy({ top: delta, behavior: 'smooth' });
}

function clearLive() {
  if (liveRow >= 0) rows[liveRow]?.el.classList.remove('live');
  liveChip?.classList.remove('on');
  liveRow = -1; liveChip = null;
}

function stopped() {
  cancelAnimationFrame(raf);
  clearLive();
  document.body.classList.remove('playing', 'counting');
  $('playBtn').setAttribute('aria-label', 'Play');
  $('count').textContent = '';
  LOCKED.forEach(id => { $(id).disabled = false; });
  $('barsDown').disabled = state.bars <= 1;
  $('barsUp').disabled = state.bars >= MAX_BARS;
}

function frame() {
  const pos = player.position();
  if (pos == null) return;
  if (pos === Infinity) { player.stop(); return; }
  if (pos < 0) {
    const n = Math.max(1, Math.floor((pos + 16) / 4) + 1);
    if (n !== lastCount) {
      lastCount = n;
      const c = $('count');
      c.textContent = n;
      c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
    }
  } else {
    if (lastCount) { lastCount = 0; document.body.classList.remove('counting'); }
    const total = totalSteps(), spr = stepsPerRow();
    const p = pos % total, step = Math.floor(p), r = Math.floor(step / spr);
    if (r !== liveRow) {
      if (liveRow >= 0) rows[liveRow].el.classList.remove('live');
      liveRow = r;
      rows[r].el.classList.add('live');
      showRow(r);
    }
    const lane = rows[r].lane;
    rows[r].head.style.transform = `translateX(${((p - r * spr) / spr) * lane.clientWidth}px)`;
    // a syllable is lit from its onset until the next grid step
    const idx = state.syllables.findIndex(s => s.step === step);
    const chip = idx >= 0 ? chips[idx] : null;
    if (chip !== liveChip) {
      liveChip?.classList.remove('on');
      chip?.classList.add('on');
      liveChip = chip;
    }
  }
  raf = requestAnimationFrame(frame);
}

$('playBtn').addEventListener('click', () => (player.playing ? player.stop() : play()));
// Timers are throttled in background tabs, so stop rather than play out of time.
document.addEventListener('visibilitychange', () => { if (document.hidden && player.playing) player.stop(); });
narrow.addEventListener('change', () => { if (player.playing) player.stop(); renderGrid(); });

/* ---------------- start ---------------- */

$('source').value = state.source;
$('bpm').value = state.bpm;
$('bpmOut').textContent = state.bpm;
$('loopBtn').setAttribute('aria-pressed', state.loop);
$('cuesBtn').setAttribute('aria-pressed', state.cues);
renderGrid();
renderWorking();

window.__cadence = { state, player }; // handle for debugging and tests
