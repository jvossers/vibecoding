// Text analysis: words -> syllables with stress, using CMUdict stress patterns
// plus a spelling heuristic for how to display each syllable.

let dict = null;
let dictPromise = null;

export function loadDict(url = 'data/cmudict-stress.txt') {
  if (dict) return Promise.resolve(dict);
  if (!dictPromise) {
    dictPromise = fetch(url)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(text => { dict = parseDict(text); return dict; })
      .catch(err => { dictPromise = null; throw err; });
  }
  return dictPromise;
}

export function parseDict(text) {
  const map = new Map();
  for (const line of text.split('\n')) {
    const sp = line.indexOf(' ');
    if (sp < 1) continue;
    const pattern = line.slice(0, sp);
    for (const w of line.slice(sp + 1).split(' ')) map.set(w, pattern);
  }
  return map;
}

// Monosyllables that are normally unstressed in running speech.
const WEAK = new Set(('a an the of to in on at by for from with as and but or nor so if than that ' +
  'is am are was were be been do does did has have had can could will would shall should may might must ' +
  'i you he she it we they me him her us them my your his its our their this these those ' +
  "i'm i'll i've i'd you're you'll he's she's it's we're they're there's that's " +
  'not no some any up out off into').split(' '));

const VOWELS = 'aeiouy';
const isV = (w, i) => {
  const c = w[i];
  if (!c || !VOWELS.includes(c)) return false;
  if (c === 'y') return i > 0 && !(i + 1 < w.length && VOWELS.includes(w[i + 1])); // "yes" vs "happy"
  return true;
};

function vowelGroups(w) {
  const g = [];
  let i = 0;
  while (i < w.length) {
    if (isV(w, i)) {
      let j = i;
      while (j < w.length && isV(w, j)) j++;
      // "qu" belongs to the consonant
      if (w[i] === 'u' && i > 0 && w[i - 1] === 'q') { if (j - i > 1) g.push([i + 1, j]); }
      else g.push([i, j]);
      i = j;
    } else i++;
  }
  return g;
}

// Remove vowel groups that are usually silent. Returns a new groups array.
function dropSilent(w, groups, target) {
  let g = groups.slice();
  const last = () => g[g.length - 1];
  const tooMany = () => target == null ? true : g.length > target;
  if (g.length > 1 && tooMany()) {
    const [s, e] = last();
    // final silent e: "came", "phrase" (but not "table", "the")
    if (e === w.length && e - s === 1 && w[s] === 'e' && !isV(w, s - 1)) {
      const le = w[s - 1] === 'l' && s >= 2 && !isV(w, s - 2);
      if (!le) g.pop();
    }
  }
  if (g.length > 1 && tooMany()) {
    const [s, e] = last();
    // "-ed" / "-es" with a silent e: "stopped", "trains" is fine, "makes"
    if (e === w.length - 1 && e - s === 1 && w[s] === 'e') {
      const endC = w[w.length - 1], before = w[s - 1];
      if (endC === 'd' && before !== 't' && before !== 'd') g.pop();
      else if (endC === 's' && !'sxz'.includes(before) && !(before === 'h' && 'cs'.includes(w[s - 2])) &&
               !(before === 'g') && !(before === 'c')) g.pop();
    }
  }
  return g;
}

const HIATUS = ['ia', 'io', 'iu', 'eo', 'ua', 'uo', 'ea', 'ie', 'ue', 'oe', 'ii', 'ui', 'ya', 'yi', 'yo'];
const DIGRAPHS = ['th', 'sh', 'ch', 'ph', 'wh', 'gh'];

function splitGroups(w, groups, target) {
  let g = groups.slice();
  let guard = 0;
  while (g.length < target && guard++ < 8) {
    let done = false;
    for (let k = 0; k < g.length && !done; k++) {
      const [s, e] = g[k];
      for (let i = s; i < e - 1 && !done; i++) {
        if (HIATUS.includes(w.slice(i, i + 2))) { g.splice(k, 1, [s, i + 1], [i + 1, e]); done = true; }
      }
    }
    if (!done) break;
  }
  return g;
}

/** Split a spelling into `n` display pieces. Returns { parts, uncertain }. */
export function splitSpelling(display, n) {
  if (n <= 1) return { parts: [display], uncertain: false };
  const w = display.toLowerCase();
  if (w.endsWith("n't") && w.length > 4) { // "would-n't"
    const head = splitSpelling(display.slice(0, -3), n - 1);
    return { parts: [...head.parts, display.slice(-3)], uncertain: head.uncertain };
  }
  let g = dropSilent(w, vowelGroups(w), n);
  if (g.length < n) g = splitGroups(w, g, n);
  if (g.length !== n) return { parts: evenSplit(display, n), uncertain: true };

  const cuts = [];
  for (let k = 0; k < g.length - 1; k++) {
    const a = g[k][1], b = g[k + 1][0];
    const cons = b - a;
    if (cons <= 0) cuts.push(a);
    else if (cons === 1) cuts.push(w[a] === 'x' || w[a] === "'" ? b : a);
    else {
      const pair = w.slice(a, a + 2);
      if (pair === 'ck') cuts.push(a + 2);
      else if (cons === 2 && DIGRAPHS.includes(pair)) cuts.push(a);
      else if (DIGRAPHS.includes(pair)) cuts.push(a + 2);
      else if (cons === 2 && w[a] !== w[a + 1] && 'lr'.includes(w[a + 1]) && !'lrnm'.includes(w[a])) cuts.push(a);
      else cuts.push(a + 1);
    }
  }
  const parts = [];
  let prev = 0;
  for (const c of cuts) { parts.push(display.slice(prev, c)); prev = c; }
  parts.push(display.slice(prev));
  if (parts.some(p => !p)) return { parts: evenSplit(display, n), uncertain: true };
  return { parts, uncertain: false };
}

function evenSplit(display, n) {
  const parts = [];
  const len = display.length;
  if (len < n) {
    parts.push(display);
    while (parts.length < n) parts.push('–');
    return parts;
  }
  for (let k = 0; k < n; k++) parts.push(display.slice(Math.round(k * len / n), Math.round((k + 1) * len / n)));
  return parts;
}

function guessCount(w) {
  const g = dropSilent(w, vowelGroups(w), null);
  return Math.max(1, g.length);
}

const normalise = s => s.toLowerCase().replace(/[‘’ʼ]/g, "'");

function lookup(key) {
  if (!dict) return null;
  if (dict.has(key)) return dict.get(key);
  const bare = key.replace(/^'+|'+$/g, '');
  if (dict.has(bare)) return dict.get(bare);
  if (bare.endsWith("'s") && dict.has(bare.slice(0, -2))) return dict.get(bare.slice(0, -2));
  if (bare.endsWith("in'") && dict.has(bare.slice(0, -1) + 'g')) return dict.get(bare.slice(0, -1) + 'g');
  return null;
}

/**
 * Turn text into words. Each word: { display, key, breakAfter, syllables:[{label,stress,uncertain}] }.
 * `overrides` maps word key -> array of display pieces chosen by the user.
 */
export function analyse(text, overrides = {}) {
  const words = [];
  const re = /([A-Za-z0-9À-ɏ]+(?:['‘’ʼ][A-Za-zÀ-ɏ]+)*['’]?)|([^\sA-Za-z0-9À-ɏ]+)|(\n)/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1]) {
      const display = m[1].replace(/[‘’ʼ]/g, "'");
      words.push(makeWord(display, overrides));
    } else if (words.length) {
      const p = m[2] ?? '\n';
      if (m[3] || /[,.;:!?—–…)\]"”/]/.test(p)) words[words.length - 1].breakAfter = true;
    }
  }
  if (words.length) words[words.length - 1].breakAfter = false;
  return words;
}

function makeWord(display, overrides) {
  const key = normalise(display);
  const pattern = lookup(key);
  const override = overrides[key];
  let parts, stresses, uncertain;
  if (override) {
    parts = override;
    stresses = pattern && pattern.length === parts.length ? [...pattern].map(Number)
      : parts.map((_, i) => (i === 0 ? 1 : 0));
    uncertain = false;
  } else if (pattern) {
    const s = splitSpelling(display, pattern.length);
    parts = s.parts;
    stresses = [...pattern].map(Number);
    uncertain = s.uncertain;
  } else {
    const n = /^\d+$/.test(key) ? Math.max(1, key.length) : guessCount(key);
    parts = splitSpelling(display, n).parts;
    stresses = parts.map((_, i) => (i === 0 ? 1 : 0));
    uncertain = true;
  }
  if (parts.length === 1 && WEAK.has(key)) stresses = [0];
  return {
    display, key, breakAfter: false, known: !!pattern,
    syllables: parts.map((label, i) => ({ label, stress: stresses[i], uncertain })),
  };
}

/** Flatten words into the syllable list used by the fit engine and the grid. */
export function flatten(words) {
  const out = [];
  words.forEach((w, wi) => w.syllables.forEach((s, si) => out.push({
    label: s.label, stress: s.stress, uncertain: s.uncertain,
    word: w.display, wordKey: w.key, wordIndex: wi, sylIndex: si, sylCount: w.syllables.length,
    breakBefore: si === 0 && wi > 0 && words[wi - 1].breakAfter,
  })));
  return out;
}
