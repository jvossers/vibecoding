// Pattern library for Backbeat.
//
// Each pattern is a loop. Tracks are written one character per step, bars
// separated by "|". Spaces are ignored, an empty bar is a bar of rests and
// "%" repeats the previous bar of that track.
//
//   .  nothing        x  hit         X  accent       g  ghost note
//   o  open hi-hat    c  cross-stick (snare only)
//
// Instruments: cr crash, hh hi-hat, rd ride, t1 high tom, t2 mid tom,
// sn snare, ft floor tom, k kick, hf hi-hat pedal.
//
// `grid` names an entry in GRIDS; `grids` sets one per bar when bars differ
// (for example a sextuplet fill after a bar of 16ths). `sections` label
// stretches of the loop in bars (fractions allowed). `stick` is an optional
// sticking line in the same format as a track. `beatQ` is the tempo unit in
// quarter notes (1.5 for dotted-quarter pulse in 12/8).

const GRIDS = {
  '8':      { ts: '4/4', groups: [2, 2, 2, 2], nv: 2 },
  '16':     { ts: '4/4', groups: [4, 4, 4, 4], nv: 1 },
  '8t':     { ts: '4/4', groups: [3, 3, 3, 3], tup: 3 },
  '16t':    { ts: '4/4', groups: [6, 6, 6, 6], tup: 6 },
  '3/4-8':  { ts: '3/4', groups: [2, 2, 2], nv: 2 },
  '5/4-8':  { ts: '5/4', groups: [2, 2, 2, 2, 2], nv: 2 },
  '12/8':   { ts: '12/8', groups: [3, 3, 3, 3], nv: 2 },
  '7/8':    { ts: '7/8', groups: [4, 4, 6], nv: 1 }
};

const H8 = 'x.x.x.x.x.x.x.x.';
const H8C = '..x.x.x.x.x.x.x.';
const BB = '....x.......x...';
const CR = 'x...............';

const PATTERNS = [
  // ---------- Level 1 ----------
  {
    id: 'quarter-rock', name: 'Quarter-note beat', type: 'groove', style: 'Rock', level: 1, grid: '8', bpm: 70,
    tip: 'Hi-hat on every count. Snare joins on 2 and 4, kick on 1 and 3.',
    t: { hh: 'x.x.x.x.|%', sn: '..x...x.|%', k: 'x...x...|%' }
  },
  {
    id: 'basic-rock', name: 'Basic rock beat', type: 'groove', style: 'Rock', level: 1, grid: '8', bpm: 75,
    tip: 'Count "1 & 2 & 3 & 4 &" out loud. The hi-hat plays on every count.',
    t: { hh: 'xxxxxxxx|%', sn: '..x...x.|%', k: 'x...x...|%' }
  },
  {
    id: 'snare-quarter-fill', name: 'Quarter-note snare fill', type: 'fill', style: 'Rock', level: 1, grid: '8', bpm: 72,
    tip: 'One bar of beat, one bar of fill. The crash on "1" tells you the beat is back.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: { cr: 'x.......|', hh: '.xxxxxxx|', sn: '..x...x.|x.x.x.x.', k: 'x...x...|x.......' },
    stick: '|R.L.R.L.'
  },
  {
    id: 'eighth-snare-fill', name: '8th-note snare fill', type: 'fill', style: 'Rock', level: 1, grid: '8', bpm: 70,
    tip: 'Keep the fill exactly as fast as the hi-hat was. Don\'t rush it.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: { cr: 'x.......|', hh: '.xxxxxxx|', sn: '..x...x.|xxxxxxxx', k: 'x...x...|x.......' },
    stick: '|RLRLRLRL'
  },

  // ---------- Level 2 ----------
  {
    id: 'four-on-the-floor', name: 'Four on the floor', type: 'groove', style: 'Disco', level: 2, grid: '8', bpm: 100,
    tip: 'Kick on every beat. Keep all four exactly even.',
    t: { hh: 'xxxxxxxx|%', sn: '..x...x.|%', k: 'x.x.x.x.|%' }
  },
  {
    id: 'rock-and-of-3', name: 'Rock beat, extra kick', type: 'groove', style: 'Rock', level: 2, grid: '8', bpm: 80,
    tip: 'The second kick lands on the "and" of 3, together with the hi-hat.',
    t: { hh: 'xxxxxxxx|%', sn: '..x...x.|%', k: 'x...xx..|%' }
  },
  {
    id: 'ride-rock', name: 'Rock beat on the ride', type: 'groove', style: 'Rock', level: 2, grid: '8', bpm: 85,
    tip: 'Same beat, but your right hand moves to the ride cymbal.',
    t: { rd: 'xxxxxxxx|%', sn: '..x...x.|%', k: 'x...x...|x...xx..' }
  },
  {
    id: 'waltz', name: 'Waltz', type: 'groove', style: 'Waltz', level: 2, grid: '3/4-8', bpm: 90,
    tip: 'Three beats in a bar: kick on 1, snare on 2 and 3.',
    t: { hh: 'xxxxxx|%', sn: '..x.x.|%', k: 'x.....|%' }
  },
  {
    id: 'toms-eighth-fill', name: 'Snare down the toms', type: 'fill', style: 'Rock', level: 2, grid: '8', bpm: 80,
    tip: 'Two notes on each drum, moving from snare to floor tom.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: 'x.......|', hh: '.xxxxxxx|', sn: '..x...x.|xx......',
      t1: '|..xx....', t2: '|....xx..', ft: '|......xx', k: 'x...x...|x.......'
    },
    stick: '|RLRLRLRL'
  },
  {
    id: 'rock-snare-fill-combo', name: 'Rock beat + snare fill', type: 'combo', style: 'Rock', level: 2, grid: '8', bpm: 80,
    tip: 'Three and a half bars of beat, then a short fill on beats 3 and 4.',
    sections: [['Groove', 0, 3.5], ['Fill', 3.5, 4]],
    t: {
      cr: 'x.......|||', hh: '.xxxxxxx|xxxxxxxx|%|xxxx....',
      sn: '..x...x.|%|%|..x.xxxx', k: 'x...x...|%|%|%'
    },
    stick: '|||....RLRL'
  },

  // ---------- Level 3 ----------
  {
    id: 'disco-open-hat', name: 'Disco open hi-hat', type: 'groove', style: 'Disco', level: 3, grid: '16', bpm: 112,
    tip: 'Open the hi-hat on every "and", then close it on the beat with your foot.',
    t: { hh: 'x.o.x.o.x.o.x.o.|%', sn: BB + '|%', k: 'x...x...x...x...|%' }
  },
  {
    id: 'one-drop', name: 'One drop', type: 'groove', style: 'Reggae', level: 3, grid: '8', bpm: 72, swing: true,
    tip: 'No kick on 1! Kick and cross-stick land together on 3. Swing the hi-hat.',
    t: { hh: 'xxxxxxxx|%', sn: '....c...|%', k: '....x...|%' }
  },
  {
    id: 'motown', name: 'Motown backbeat', type: 'groove', style: 'Soul', level: 3, grid: '8', bpm: 100,
    tip: 'Snare on every beat, louder on 2 and 4.',
    t: { hh: 'xxxxxxxx|%', sn: 'x.X.x.X.|%', k: 'x...x..x|x..xx...' }
  },
  {
    id: 'blues-shuffle', name: 'Blues shuffle', type: 'groove', style: 'Blues', level: 3, grid: '8', bpm: 90, swing: true,
    tip: 'Swing every pair of 8th notes: long-short, long-short.',
    t: { rd: 'xxxxxxxx|%', sn: '..x...x.|%', k: 'x...x..x|x...x...' }
  },
  {
    id: 'rock-tom-fill-combo', name: 'Rock groove + snare-to-toms fill', type: 'combo', style: 'Rock', level: 3, grid: '16', bpm: 96,
    tip: 'The fill starts on beat 3 of bar 4. Land back on the crash.',
    sections: [['Groove', 0, 3.5], ['Fill', 3.5, 4]],
    t: {
      cr: CR + '|||', hh: H8C + '|' + H8 + '|%|x.x.x.x.........',
      sn: BB + '|%|%|....x...xxxx....',
      t1: '|||............xx..', t2: '|||..............x.', ft: '|||...............x',
      k: 'x.......x.x.....|x.x.....x.x.....|x.......x.x.....|x.......x...x...'
    },
    stick: '|||........RLRLRLRL'
  },
  {
    id: 'sixteenth-snare-fill', name: '16th-note snare fill', type: 'fill', style: 'Rock', level: 3, grid: '16', bpm: 80,
    tip: 'Eight even 16th notes on the snare across beats 3 and 4.',
    sections: [['Time', 0, 1.5], ['Fill', 1.5, 2]],
    t: { cr: CR + '|', hh: H8C + '|x.x.x.x.........', sn: BB + '|....x...xxxxxxxx', k: 'x.......x.......|%' },
    stick: '|........RLRLRLRL'
  },
  {
    id: 'syncopated-kick', name: 'Rock with syncopated kick', type: 'groove', style: 'Rock', level: 3, grid: '16', bpm: 90,
    tip: 'The kick on the "and" of 2 pushes the beat forward.',
    t: { hh: H8 + '|%', sn: BB + '|%', k: 'x.....x.x.......|x.....x.x.x.....' }
  },
  {
    id: 'slow-12-8-blues', name: 'Slow 12/8 blues', type: 'groove', style: 'Blues', level: 3, grid: '12/8', bpm: 50, beatQ: 1.5,
    tip: 'Four big beats per bar, each split into three. Snare on 2 and 4.',
    t: { rd: 'xxxxxxxxxxxx|%', sn: '...x.....x..|%', k: 'x.....x.....|x....xx.....' }
  },

  // ---------- Level 4 ----------
  {
    id: 'sixteenth-hats', name: '16th-note hi-hat groove', type: 'groove', style: 'Rock', level: 4, grid: '16', bpm: 80,
    tip: 'Both hands on the hi-hat, R L R L. Your right hand moves to the snare on 2 and 4.',
    t: { hh: 'xxxx.xxxxxxx.xxx|%', sn: BB + '|%', k: 'x.......xx......|x.......x.x.....' },
    stick: 'RLRLRLRLRLRLRLRL|%'
  },
  {
    id: 'half-time', name: 'Half-time groove', type: 'groove', style: 'Rock', level: 4, grid: '16', bpm: 72,
    tip: 'The snare only plays on 3, so the beat feels half as fast.',
    t: { hh: H8 + '|%', sn: '........x.......|%', k: 'x.....x...x.....|x.....x...x..x..' }
  },
  {
    id: 'punk', name: 'Punk beat', type: 'groove', style: 'Punk', level: 4, grid: '8', bpm: 170,
    tip: 'Kick on every 8th note except under the snare. Start slower and build up.',
    t: { hh: 'xxxxxxxx|%', sn: '..x...x.|%', k: 'xx.xxx.x|%' }
  },
  {
    id: 'toms-sixteenth-fill', name: '16ths around the toms', type: 'fill', style: 'Rock', level: 4, grid: '16', bpm: 80,
    tip: 'Four notes on each drum: snare, high tom, mid tom, floor tom.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: CR + '|', hh: H8C + '|', sn: BB + '|xxxx............',
      t1: '|....xxxx........', t2: '|........xxxx....', ft: '|............xxxx', k: 'x.......x.......|x...............'
    },
    stick: '|RLRLRLRLRLRLRLRL'
  },
  {
    id: 'rock-tom-sixteenth-combo', name: 'Rock groove + 16th tom fill', type: 'combo', style: 'Rock', level: 4, grid: '16', bpm: 90,
    tip: 'Two notes per tom on beat 3, then four on the floor tom.',
    sections: [['Groove', 0, 3.5], ['Fill', 3.5, 4]],
    t: {
      cr: CR + '|||', hh: H8C + '|' + H8 + '|%|x.x.x.x.........',
      sn: BB + '|%|%|....x...........',
      t1: '|||........xx......', t2: '|||..........xx....', ft: '|||............xxxx',
      k: 'x.....x.x.......|x.....x.x.x.....|x.....x.x.......|x.......x.......'
    },
    stick: '|||........RLRLRLRL'
  },
  {
    id: 'boom-bap', name: 'Boom-bap', type: 'groove', style: 'Hip-hop', level: 4, grid: '16', bpm: 88, swing: true,
    tip: 'Lazy, swung 16ths. Lean back and let the kick bounce.',
    t: { hh: H8 + '|%', sn: BB + '|%', k: 'x.....x...x.....|x.x...x...x..x..' }
  },
  {
    id: 'train-beat', name: 'Train beat', type: 'groove', style: 'Country', level: 4, grid: '16', bpm: 110,
    tip: 'Quiet 16ths on the snare with accents on 2 and 4. Alternate R L.',
    t: { sn: 'ggggXgggggggXggg|%', k: 'x.......x.......|%', hf: '....x.......x...|%' },
    stick: 'RLRLRLRLRLRLRLRL|%'
  },

  // ---------- Level 5 ----------
  {
    id: 'funk-ghosts', name: 'Funk with ghost notes', type: 'groove', style: 'Funk', level: 5, grid: '16', bpm: 90,
    tip: 'Ghost notes are barely there. Keep the stick low for those, high for the backbeat.',
    t: { hh: H8 + '|%', sn: '.g..X..g.g..X..g|.g..X..g.g.gX...', k: 'x.x.......x.....|x.x.......x..x..' }
  },
  {
    id: 'bossa-nova', name: 'Bossa nova', type: 'groove', style: 'Latin', level: 5, grid: '16', bpm: 110,
    tip: 'A two-bar cross-stick pattern over a steady ride and a "1 ... a 2" kick.',
    t: {
      rd: H8 + '|%', sn: 'c.....c.....c...|....c.....c.....',
      k: 'x..xx..xx..xx..x|%', hf: '....x.......x...|%'
    }
  },
  {
    id: 'triplet-shuffle', name: 'Triplet shuffle', type: 'groove', style: 'Blues', level: 5, grid: '8t', bpm: 100,
    tip: 'Each beat is a triplet. Play the first and last note of each: "1 . a 2 . a".',
    t: { rd: 'x.xx.xx.xx.x|%', sn: '...x.....x..|%', k: 'x.....x.....|x.....x..x..' }
  },
  {
    id: 'hand-foot-fill', name: 'Hands-and-feet triplet fill', type: 'fill', style: 'Rock', level: 5, grid: '16', bpm: 80,
    tip: 'Groups of three (R L kick) over 16th notes give a rolling three-against-four.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: { cr: CR + '|', hh: H8C + '|', sn: BB + '|xx.xx.xx.xx.xx..', k: 'x.......x.......|..x..x..x..x..xx' },
    stick: '|RLKRLKRLKRLKRLKK'
  },
  {
    id: 'half-time-combo', name: 'Half-time groove + tom fill', type: 'combo', style: 'Rock', level: 5, grid: '16', bpm: 75,
    tip: 'A slow, heavy groove and a fill that walks down the kit.',
    sections: [['Groove', 0, 3.5], ['Fill', 3.5, 4]],
    t: {
      cr: CR + '|||', hh: H8C + '|' + H8 + '|%|x.x.x.x.........',
      sn: '........x.......|%|%|........xx......',
      t1: '|||..........xx....', t2: '|||............xx..', ft: '|||..............xx',
      k: 'x.....x...x.....|x.....x...x..x..|x.....x...x.....|x.....x.........'
    },
    stick: '|||........RLRLRLRL'
  },

  // ---------- Level 6 ----------
  {
    id: 'double-bass', name: 'Double-bass 16ths', type: 'groove', style: 'Metal', level: 6, grid: '16', bpm: 110,
    tip: 'Alternate feet R L R L. Start slowly and keep every note the same volume.',
    t: { rd: 'x...x...x...x...|%', sn: BB + '|%', k: 'xxxxxxxxxxxxxxxx|%' }
  },
  {
    id: 'jazz-ride', name: 'Jazz ride pattern', type: 'groove', style: 'Jazz', level: 6, grid: '8', bpm: 120, swing: true,
    tip: '"Spang-a-lang" on the ride, hi-hat pedal on 2 and 4, kick feathered very softly.',
    t: { rd: 'x.xxx.xx|%', hf: '..x...x.|%', k: 'g.g.g.g.|%', sn: '|.....g.x' }
  },
  {
    id: 'funk-open-hat', name: 'Funk with open hi-hat', type: 'groove', style: 'Funk', level: 6, grid: '16', bpm: 92,
    tip: 'Let the open hi-hat ring for one 16th, then snap it shut.',
    t: {
      hh: 'x.x.x.x.x.o.x.x.|x.x.x.o.x.x.x.o.', sn: '....X..g.g..X...|....X..g.g..X...',
      k: 'x..x..x...x.....|x..x......x..x..'
    }
  },
  {
    id: 'afro-cuban-6-8', name: 'Afro-Cuban 6/8', type: 'groove', style: 'Latin', level: 6, grid: '12/8', bpm: 70, beatQ: 1.5,
    tip: 'Felt in four big beats, each split into three. The bell pattern on the ride is the anchor.',
    t: {
      rd: 'x.x.xx.x.x.x|%', k: 'x.....x.....|%', hf: '...x.....x..|%', sn: '..........c.|..c.......c.'
    }
  },
  {
    id: 'paradiddle-fill', name: 'Paradiddle around the kit', type: 'fill', style: 'Rock', level: 6, grid: '16', bpm: 80,
    tip: 'R L R R  L R L L. Right hand on the toms, left hand stays on the snare.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: CR + '|', hh: H8C + '|', sn: BB + '|.x..x.xx.x..x.xx',
      t1: '|x.xx.x..........', ft: '|........x.xx.x..', k: 'x.......x.......|x...x...x...x...'
    },
    stick: '|RLRRLRLLRLRRLRLL'
  },

  // ---------- Level 7 ----------
  {
    id: 'linear-funk', name: 'Linear funk', type: 'groove', style: 'Funk', level: 7, grid: '16', bpm: 85,
    tip: 'Linear: no two limbs ever play at the same time.',
    t: { hh: '.x.x.xx.x.xx.xx.|%', sn: '....x..x....x..x|%', k: 'x.x......x......|%' }
  },
  {
    id: 'gallop', name: 'Double-bass gallop', type: 'groove', style: 'Metal', level: 7, grid: '16', bpm: 110,
    tip: 'Gallop: one 8th note then two 16ths, "da, da-da", over and over.',
    t: { rd: 'x...x...x...x...|%', sn: BB + '|%', k: 'x.xxx.xxx.xxx.xx|%' }
  },
  {
    id: 'sextuplet-fill', name: 'Sextuplet fill', type: 'fill', style: 'Rock', level: 7, grids: ['16', '16t'], bpm: 76,
    tip: 'Six notes per beat in the fill bar. Count "1-la-li-&-la-li".',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: CR + '|', hh: H8C + '|', sn: BB + '|xxxxxx xxxxxx ...... ......',
      t1: '|...... ...... xxx... ......', t2: '|...... ...... ...xxx ......', ft: '|...... ...... ...... xxxxxx',
      k: 'x.......x.......|x..... ...... ...... ......'
    },
    stick: '|RLRLRL RLRLRL RLRLRL RLRLRL'
  },
  {
    id: 'linear-sixteenth-fill', name: 'Linear 16th fill', type: 'fill', style: 'Funk', level: 7, grid: '16', bpm: 80,
    tip: 'R L kick kick on each drum. Hands and feet never overlap.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: CR + '|', hh: H8C + '|', sn: BB + '|xx..............',
      t1: '|....xx..........', t2: '|........xx......', ft: '|............xx..',
      k: 'x.......x.......|..xx..xx..xx..xx'
    },
    stick: '|RLKKRLKKRLKKRLKK'
  },
  {
    id: 'linear-combo', name: 'Linear groove + fill', type: 'combo', style: 'Funk', level: 7, grid: '16', bpm: 82,
    tip: 'Three and a half bars of linear groove, then a linear fill down the toms.',
    sections: [['Groove', 0, 3.5], ['Fill', 3.5, 4]],
    t: {
      cr: CR + '|||', hh: '.x.x.xx.x.xx.xx.|%|%|.x.x.xx.........',
      sn: '....x..x....x..x|%|%|....x..xxx......',
      t1: '|||...........xx...', ft: '|||..............xx',
      k: 'x.x......x......|%|%|x.x.......x..x..'
    },
    stick: '|||........RLKRLKRL'
  },

  // ---------- Level 8 ----------
  {
    id: 'seven-eight', name: '7/8 rock', type: 'groove', style: 'Odd time', level: 8, grid: '7/8', bpm: 110,
    tip: 'Count in 8th notes: 1-2, 3-4, 5-6-7. Snare on 3 and 6.',
    t: { hh: 'x.x.x.x.x.x.x.|%', sn: '....x.....x...|%', k: 'x.......x...x.|x.x.....x.....' }
  },
  {
    id: 'five-four', name: '5/4 groove', type: 'groove', style: 'Odd time', level: 8, grid: '5/4-8', bpm: 100,
    tip: 'Five beats per bar. Snare on 2 and 4, kick on 1, 3 and 5.',
    t: { hh: 'xxxxxxxxxx|%', sn: '..x...x...|%', k: 'x...x...x.|x...x..xx.' }
  },
  {
    id: 'six-stroke-fill', name: 'Six-stroke roll fill', type: 'fill', style: 'Rock', level: 8, grids: ['16', '16t'], bpm: 72,
    tip: 'R LL RR L with accents on the first and last notes, then hands and feet on the floor tom.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: CR + '|', hh: H8C + '|', sn: BB + '|XggggX XggggX XggggX ......',
      ft: '|...... ...... ...... X.X.X.', k: 'x.......x.......|x..... ...... ...... .x.x.x'
    },
    stick: '|RLLRRL RLLRRL RLLRRL RKRKRK'
  },
  {
    id: 'funk-sixteenth-kicks', name: 'Funk with 16th kicks', type: 'groove', style: 'Funk', level: 8, grid: '16', bpm: 88,
    tip: 'Busy kick drum under a steady hi-hat. Ghost notes stay very quiet.',
    t: {
      hh: H8 + '|%', sn: '....X..g.g..X..g|.g..X..g.g..X...',
      k: 'x.xx...x..x..x..|x..x..xx..x...x.'
    }
  },

  // ---------- Level 9 ----------
  {
    id: 'half-time-shuffle', name: 'Half-time shuffle', type: 'groove', style: 'Funk', level: 9, grid: '8t', bpm: 76,
    tip: 'Hi-hat on the outside triplet notes, ghost notes in the middle, a big backbeat on 3.',
    t: {
      hh: 'x.xx.xx.xx.x|%', sn: '.g..g.X...g.|.g..g.X..gg.',
      k: 'x....x.....x|x....x..x...'
    }
  },
  {
    id: 'gospel-chops-fill', name: 'Gospel chops fill', type: 'fill', style: 'Gospel', level: 9, grids: ['16', '16t'], bpm: 80,
    tip: 'R L kick in sextuplets, moving around the kit one drum per beat.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: CR + '|', hh: 'xxxx.xxxxxxx.xxx|', sn: '....X.......X...|xx.xx. ...... ...... ......',
      t1: '|...... xx.xx. ...... ......', t2: '|...... ...... xx.xx. ......', ft: '|...... ...... ...... xx.xx.',
      k: 'x.....x...x.....|..x..x ..x..x ..x..x ..x..x'
    },
    stick: 'RLRLRLRLRLRLRLRL|RLKRLK RLKRLK RLKRLK RLKRLK'
  },
  {
    id: 'seven-eight-combo', name: '7/8 groove + fill', type: 'combo', style: 'Odd time', level: 9, grid: '7/8', bpm: 105,
    tip: 'Three bars of 7/8 groove, then a fill on the last "5-6-7".',
    sections: [['Groove', 0, 3 + 8 / 14], ['Fill', 3 + 8 / 14, 4]],
    t: {
      cr: 'x.............|||', hh: '..x.x.x.x.x.x.|x.x.x.x.x.x.x.|%|x.x.x.x.......',
      sn: '....x.....x...|%|%|....x...xx....', t1: '|||..........xx..', ft: '|||............xx',
      k: 'x.......x...x.|x.x.....x.....|x.......x...x.|x.......x.....'
    },
    stick: '|||........RLRLRL'
  },
  {
    id: 'jazz-comping', name: 'Jazz comping', type: 'groove', style: 'Jazz', level: 9, grid: '8', bpm: 140, swing: true,
    tip: 'Ride and hi-hat stay steady while the snare and kick talk to each other.',
    t: {
      rd: 'x.xxx.xx|%|%|%', hf: '..x...x.|%|%|%',
      sn: '...g..x.|.x....g.|....g..x|..x..x..', k: 'g.g.g.g.|g.g.gx..|g.g.g.g.|x.g.g.g.'
    }
  },

  // ---------- Level 10 ----------
  {
    id: 'gospel-combo', name: 'Gospel groove + chops fill', type: 'combo', style: 'Gospel', level: 10, grids: ['16', '16', '16', '16t'], bpm: 84,
    tip: 'A ghost-note groove for three bars, then a full bar of sextuplet chops.',
    sections: [['Groove', 0, 3], ['Fill', 3, 4]],
    t: {
      cr: CR + '|||', hh: H8C + '|' + H8 + '|%|',
      sn: '.g..X.gg.g..X..g|%|%|xx.xx. ...... ...... ......',
      t1: '|||...... xx.xx. ...... ......', t2: '|||...... ...... xx.xx. ......', ft: '|||...... ...... ...... xx.xx.',
      k: 'x..x..x...x.....|%|%|..x..x ..x..x ..x..x ..x..x'
    },
    stick: '|||RLKRLK RLKRLK RLKRLK RLKRLK'
  },
  {
    id: 'linear-sextuplet-fill', name: 'Linear sextuplets', type: 'fill', style: 'Funk', level: 10, grids: ['16', '16t'], bpm: 72,
    tip: 'R L R L kick kick on each drum. Six notes per beat, never two at once.',
    sections: [['Time', 0, 1], ['Fill', 1, 2]],
    t: {
      cr: 'x...............|', hh: '.x.x.xx.x.xx.xx.|', sn: '....x..x....x..x|xxxx.. ...... ...... ......',
      t1: '|...... xxxx.. ...... ......', t2: '|...... ...... xxxx.. ......', ft: '|...... ...... ...... xxxx..',
      k: 'x.x......x......|....xx ....xx ....xx ....xx'
    },
    stick: '|RLRLKK RLRLKK RLRLKK RLRLKK'
  },
  {
    id: 'blast-beat', name: 'Blast beat', type: 'groove', style: 'Metal', level: 10, grid: '16', bpm: 140,
    tip: 'Cymbal and kick together, snare in between. Start around 90 BPM.',
    t: { cr: H8 + '|%', sn: '.x.x.x.x.x.x.x.x|%', k: H8 + '|%' }
  }
];
