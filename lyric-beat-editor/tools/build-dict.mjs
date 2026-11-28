// Compacts CMUdict into data/cmudict-stress.txt.
// Usage: node tools/build-dict.mjs path/to/cmudict.dict
// Output: one line per stress pattern, "<pattern> word word word ...".
// The pattern has one digit per vowel phoneme: 1 primary, 2 secondary, 0 unstressed.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('Pass the path to cmudict.dict'); process.exit(1); }

const groups = new Map();
const seen = new Set();
for (const raw of readFileSync(src, 'utf8').split('\n')) {
  const line = raw.split('#')[0].trim();
  if (!line) continue;
  const [word, ...phones] = line.split(/\s+/);
  if (word.includes('(') || seen.has(word)) continue; // first pronunciation only
  if (!/^[a-z'][a-z'.-]*$/.test(word)) continue;
  const pattern = phones.map(p => p.match(/\d/)?.[0] ?? '').join('');
  if (!pattern) continue;
  seen.add(word);
  if (!groups.has(pattern)) groups.set(pattern, []);
  groups.get(pattern).push(word);
}

const out = [...groups].sort((a, b) => a[0].localeCompare(b[0]))
  .map(([p, words]) => p + ' ' + words.join(' ')).join('\n') + '\n';
const dest = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'cmudict-stress.txt');
writeFileSync(dest, out);
console.log(`${seen.size} words, ${groups.size} patterns, ${(out.length / 1024).toFixed(0)} KB`);
