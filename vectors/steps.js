/* Lesson content: approaches and their steps, kept separate from rendering.
   TeX macros (defined in app.js): \V{XY} = vector XY, \va = bold a, \vb = bold b.
   focus: points/edges to emphasise (others are dimmed).
   show: construction overlays to draw (vectors, routes, ratio marks).
   labels: overlay label text for this step.
   Only the step marked final may contain the answer. */
(function (root) {
  'use strict';
  const R = String.raw;

  const GIVEN_FOCUS = ['A', 'B', 'C', 'D', 'E', 'F', 'AB', 'DC', 'EF', 'DA', 'FC'];

  const approaches = [
    {
      id: 'a',
      name: 'Shared origin',
      short: 'A',
      level: 2,
      blurb: 'Write every point as a route from D, then walk along ME until you land on DC.',
      learn: 'Position vectors from one origin',
      steps: [
        {
          title: 'Turn the ratio into vectors',
          text: 'DC is 2 parts of the ratio and equals 2<b>a</b>, so one part is <b>a</b>. AB, DC and EF are parallel and all point upwards.',
          eq: [R`\V{AB}=4\va,\quad \V{DC}=2\va,\quad \V{EF}=3\va`, R`\V{AD}=\V{CF}=\vb`],
          focus: GIVEN_FOCUS,
          showGivenLabels: true,
          hint: 'DC is 2 parts of 4 : 2 : 3 and DC = 2a. How much is one part?',
          why: 'Parallel sides pointing the same way are multiples of the same vector. With 2 parts = 2a, each part is a, so AB = 4a and EF = 3a.'
        },
        {
          title: 'Start every route at D',
          text: 'N lies on DC, so the route from D to N is just some multiple of <b>a</b>. If every point is written as a route from D, the question becomes: <i>how many</i> <b>a</b>’s take us from D to N?',
          eq: [R`\V{DN}=\lambda\,\va\ \text{ for some number }\lambda`],
          focus: ['D', 'C', 'N', 'DC'],
          nGreen: true,
          hint: 'Which given point sits on the same line as N, at a known place?',
          why: 'Nothing forces us to use D: any start point works if you are consistent. D is convenient because it is on the line through N and DC = 2a is known, so DN will come out as a multiple of a that compares directly with DC. Routes from D also let us reach M (via DB) and E (via DC, CF, FE).'
        },
        {
          title: 'Get from D to B',
          text: 'Go D → A → B. D to A runs backwards along AD, so it is −<b>b</b>.',
          eq: [R`\V{DB}=\V{DA}+\V{AB}`, R`=-\vb+4\va`],
          focus: ['D', 'A', 'B', 'DA', 'AB'],
          show: ['DAB', 'DB'],
          labels: { DB: '4a − b' },
          hint: 'AD = b, so DA is the same arrow reversed.',
          why: 'Reversing a vector changes its sign: DA = −AD = −b. Adding vectors means following one route after the other.'
        },
        {
          title: 'Use the midpoint of BC',
          text: 'M is halfway between B and C. Both DB and DC start at D, so the route to M is their average.',
          eq: [R`\V{DM}=\tfrac12\big(\V{DB}+\V{DC}\big)`, R`=\tfrac12\big(4\va-\vb+2\va\big)`, R`=3\va-\tfrac12\vb`],
          focus: ['D', 'B', 'C', 'M', 'BC', 'DC'],
          show: ['DB', 'DM'],
          labels: { DB: '4a − b', DM: '3a − ½b' },
          hint: 'Add DB and DC, then halve the whole thing.',
          why: 'Like averaging coordinates: a midpoint’s position is the mean of the two end positions, provided both are measured from the same origin (here D). Halve the b as well: it is −½b, not −b.'
        },
        {
          title: 'Get from D to E',
          text: 'Go round the right-hand trapezium: D → C → F → E. F to E runs down EF, so it is −3<b>a</b>.',
          eq: [R`\V{DE}=\V{DC}+\V{CF}+\V{FE}`, R`=2\va+\vb-3\va=\vb-\va`],
          focus: ['D', 'C', 'F', 'E', 'DC', 'FC', 'EF'],
          show: ['DCFE', 'DE'],
          labels: { DE: 'b − a' },
          hint: 'FE is EF reversed.',
          why: 'Any route between two points gives the same vector, so choose one made only of sides you know.'
        },
        {
          title: 'The vector along ME',
          text: 'To go from M to E, go back from M to D, then on from D to E.',
          eq: [R`\V{ME}=-\V{DM}+\V{DE}`, R`=-\big(3\va-\tfrac12\vb\big)+\big(\vb-\va\big)`, R`=-4\va+\tfrac32\vb`],
          focus: ['D', 'M', 'E', 'MNE'],
          show: ['DM', 'DE', 'ME'],
          labels: { DM: '3a − ½b', DE: 'b − a', ME: '−4a + 3⁄2b' },
          hint: 'ME = DE − DM. Watch the signs when you remove the bracket.',
          why: 'With a shared origin, “end minus start” gives the vector between two points: ME = DE − DM.'
        },
        {
          title: 'Walk along ME until b disappears',
          text: 'N is on ME, so DN = DM + <i>t</i>·ME for some fraction <i>t</i>. N is also on DC, so DN contains no <b>b</b>.',
          eq: [R`\V{DN}=(3-4t)\va+\big(-\tfrac12+\tfrac32t\big)\vb`, R`-\tfrac12+\tfrac32t=0\ \Rightarrow\ t=\tfrac13`],
          focus: ['D', 'M', 'E', 'N', 'MNE'],
          nGreen: true,
          show: ['DM', 'ME'],
          labels: { DM: '3a − ½b', ME: '−4a + 3⁄2b' },
          hint: 'Collect the a terms and the b terms, then set the b coefficient to zero.',
          why: 'Starting at M the b-part is −½. Each whole ME adds 3⁄2 b, so it reaches zero after one third of ME: exactly where the line crosses DC.'
        },
        {
          final: true,
          title: 'Find DN : NC',
          text: 'Put <i>t</i> = ⅓ back in. NC is what is left of DC.',
          eq: [R`\V{DN}=\big(3-\tfrac43\big)\va=\tfrac53\va`, R`\V{NC}=2\va-\tfrac53\va=\tfrac13\va`, R`DN:NC=\tfrac53:\tfrac13=5:1`, R`\boxed{k=5}`],
          focus: ['D', 'C', 'N', 'DC', 'MNE'],
          nGreen: true,
          show: ['DN', 'NC', 'ratioDC'],
                    hint: 'Multiply both parts of 5⁄3 : 1⁄3 by 3.',
          why: 'The diagram is now redrawn to scale: N really is much nearer C than D.'
        }
      ]
    },
    {
      id: 'b',
      name: 'Collinearity',
      short: 'B',
      level: 2,
      blurb: 'Call DN = xa, write NM and NE in terms of x, and use the fact that they lie on one line.',
      learn: 'Parallel vectors are multiples',
      steps: [
        {
          title: 'Name the unknown',
          text: 'N is somewhere on DC, which is 2<b>a</b>. Call DN = <i>x</i><b>a</b>; NC is what is left.',
          eq: [R`\V{DN}=x\va,\qquad \V{NC}=(2-x)\va`],
          focus: ['D', 'C', 'N', 'DC'],
          nGreen: true,
          show: ['DN', 'NC'],
          labels: { DN: 'xa', NC: '(2 − x)a' },
          hint: 'DN + NC must make the whole of DC = 2a.',
          why: 'DN : NC = x : (2 − x), so finding x answers the question. This method works outward from N instead of from a fixed origin.'
        },
        {
          title: 'Route from C to M',
          text: 'Go C → D → A → B to get CB, then halve it, because M is the midpoint of BC.',
          eq: [R`\V{CB}=\V{CD}+\V{DA}+\V{AB}`, R`=-2\va-\vb+4\va=2\va-\vb`, R`\V{CM}=\tfrac12\V{CB}=\va-\tfrac12\vb`],
          focus: ['C', 'D', 'A', 'B', 'M', 'DC', 'DA', 'AB', 'BC'],
          show: ['CDAB', 'CM'],
          labels: { CM: 'a − ½b' },
          hint: 'CD and DA are DC and AD reversed.',
          why: 'Going halfway along a straight side is half its vector, so CM = ½CB.'
        },
        {
          title: 'From N to M',
          text: 'Go N → C, then C → M.',
          eq: [R`\V{NM}=\V{NC}+\V{CM}`, R`=(2-x)\va+\va-\tfrac12\vb`, R`=(3-x)\va-\tfrac12\vb`],
          focus: ['N', 'C', 'M', 'DC', 'BC'],
          nGreen: true,
          show: ['NCM', 'NM'],
          labels: { NM: '(3 − x)a − ½b' },
          hint: 'Collect the a terms: (2 − x) + 1.',
          why: 'Two known pieces, NC and CM, chain together to give NM.'
        },
        {
          title: 'From N to E',
          text: 'Go N → D, then D → C → F → E, which is <b>b</b> − <b>a</b>.',
          eq: [R`\V{DE}=2\va+\vb-3\va=\vb-\va`, R`\V{NE}=\V{ND}+\V{DE}`, R`=-x\va+\vb-\va=-(x+1)\va+\vb`],
          focus: ['N', 'D', 'C', 'F', 'E', 'DC', 'FC', 'EF'],
          nGreen: true,
          show: ['DCFE', 'NE'],
          labels: { NE: '−(x + 1)a + b' },
          hint: 'ND is DN reversed: −xa.',
          why: 'Any route works. Through D is easiest because DN is already named.'
        },
        {
          title: 'M, N and E are in a straight line',
          text: 'So NM is a multiple of NE. They point opposite ways from N, so the multiple is negative. Match the <b>b</b> parts to find it.',
          eq: [R`\V{NM}=\mu\,\V{NE}`, R`\vb\text{ parts: } -\tfrac12=\mu\times 1\ \Rightarrow\ \mu=-\tfrac12`],
          focus: ['M', 'N', 'E', 'MNE'],
          nGreen: true,
          show: ['NM', 'NE'],
          labels: { NM: '(3 − x)a − ½b', NE: '−(x + 1)a + b' },
          hint: 'The b parts are −½ and 1. What do you multiply 1 by to get −½?',
          why: 'Points in a straight line give vectors that are scalar multiples of each other. The b parts contain no x, so they give the multiple straight away.'
        },
        {
          title: 'Match the a parts',
          text: 'The same multiple, −½, must work for the <b>a</b> parts too.',
          eq: [R`3-x=-\tfrac12\times\big(-(x+1)\big)`, R`6-2x=x+1`, R`x=\tfrac53`],
          focus: ['M', 'N', 'E', 'MNE'],
          nGreen: true,
          show: ['NM', 'NE'],
          labels: { NM: '(3 − x)a − ½b', NE: '−(x + 1)a + b' },
          hint: 'Double both sides to clear the fraction.',
          why: 'If two vectors are multiples, every component scales by the same number. That gives one equation in x.'
        },
        {
          final: true,
          title: 'Find DN : NC',
          text: 'Use DN = <i>x</i><b>a</b> and NC = (2 − <i>x</i>)<b>a</b>.',
          eq: [R`\V{DN}=\tfrac53\va,\quad \V{NC}=\tfrac13\va`, R`DN:NC=\tfrac53:\tfrac13=5:1`, R`\boxed{k=5}`],
          focus: ['D', 'C', 'N', 'DC', 'MNE'],
          nGreen: true,
          show: ['DN', 'NC', 'ratioDC'],
                    hint: 'Multiply both parts by 3.',
          why: 'The diagram is now redrawn to scale: N really is much nearer C than D.'
        }
      ]
    },
    {
      id: 'c',
      name: 'Section formula',
      short: 'C',
      level: 3,
      blurb: 'Treat N as a weighted blend of M and E, and pick the weights that cancel b.',
      learn: 'Ratios along a line as weights',
      steps: [
        {
          title: 'Two routes from D',
          text: 'As in the shared-origin method: average DB and DC for M, and go D → C → F → E for E.',
          eq: [R`\V{DM}=\tfrac12\big(\V{DB}+\V{DC}\big)=3\va-\tfrac12\vb`, R`\V{DE}=\V{DC}+\V{CF}+\V{FE}=\vb-\va`],
          focus: ['D', 'M', 'E', 'B', 'C'],
          show: ['DM', 'DE'],
          labels: { DM: '3a − ½b', DE: 'b − a' },
          hint: 'DB = −b + 4a. Halve DB + DC.',
          why: 'Both vectors start at D, so they can be blended directly in the next step.'
        },
        {
          title: 'Every point on ME is a blend',
          text: 'A point P on ME mixes M and E like two paints: mostly M near M, mostly E near E. <i>t</i> is the share of E.',
          eq: [R`\V{DP}=(1-t)\,\V{DM}+t\,\V{DE}`],
          focus: ['D', 'M', 'E', 'MNE'],
          show: ['DM', 'DE', 'ME'],
          labels: { DM: '3a − ½b', DE: 'b − a' },
          hint: 'Try t = 0 and t = 1. Where do you end up?',
          why: 't = 0 gives M, t = 1 gives E and t = ½ gives the midpoint. Values in between slide along the line.'
        },
        {
          title: 'Choose the blend that cancels b',
          text: 'DM brings −½<b>b</b>, DE brings +1<b>b</b>. N is on DC, so the <b>b</b> must cancel.',
          eq: [R`(1-t)\big(-\tfrac12\big)+t(1)=0`, R`-\tfrac12+\tfrac32t=0\ \Rightarrow\ t=\tfrac13`, R`\V{DN}=\tfrac23\V{DM}+\tfrac13\V{DE}`],
          focus: ['D', 'M', 'E', 'N', 'MNE'],
          nGreen: true,
          show: ['DM', 'DE'],
          labels: { DM: '3a − ½b', DE: 'b − a' },
          hint: 'Two lots of −½ and one lot of +1 make zero.',
          why: 'Two parts DM to one part DE: 2 × (−½) + 1 × 1 = 0. As fractions of the whole mix, that is ⅔ and ⅓.'
        },
        {
          title: 'N splits ME in the ratio 1 : 2',
          text: 'With ⅓ of the weight on E, N is one third of the way from M to E. It is <i>not</i> the midpoint of ME.',
          eq: [R`MN:NE=1:2`],
          focus: ['M', 'N', 'E', 'MNE'],
          nGreen: true,
          show: ['ratioME'],
          hint: 'More weight on M pulls N towards M.',
          why: 'The heavier end wins: the weights ⅔ (on M) and ⅓ (on E) put N closer to M, and the pieces MN : NE are in the ratio 1 : 2.'
        },
        {
          title: 'Work out DN',
          text: 'Substitute DM and DE into the blend.',
          eq: [R`\V{DN}=\tfrac23\big(3\va-\tfrac12\vb\big)+\tfrac13\big(\vb-\va\big)`, R`=2\va-\tfrac13\vb+\tfrac13\vb-\tfrac13\va`, R`=\tfrac53\va`],
          focus: ['D', 'N', 'DC'],
          nGreen: true,
          show: ['DN'],
          labels: { DN: 'DN' },
          hint: 'The b terms cancel, as planned.',
          why: 'No b left confirms N is on DC.'
        },
        {
          final: true,
          title: 'Find DN : NC',
          text: 'NC is what is left of DC = 2<b>a</b>.',
          eq: [R`\V{NC}=2\va-\tfrac53\va=\tfrac13\va`, R`DN:NC=\tfrac53:\tfrac13=5:1`, R`\boxed{k=5}`],
          focus: ['D', 'C', 'N', 'DC', 'MNE'],
          nGreen: true,
          show: ['DN', 'NC', 'ratioDC'],
                    hint: 'Multiply both parts by 3.',
          why: 'The diagram is now redrawn to scale. This is a shortcut built on the shared-origin vectors rather than a separate geometric proof.'
        }
      ]
    },
    {
      id: 'd',
      name: 'Coordinates',
      short: 'D',
      level: 1,
      blurb: 'Use a and b as slanted axes, write each point as coordinates, and find where ME meets DC.',
      learn: 'Vectors as coordinates in a basis',
      steps: [
        {
          title: 'Use a and b as axes',
          text: 'Measure every point from D as (number of <b>a</b>’s, number of <b>b</b>’s). DC lies on the <b>a</b>-axis, where the second coordinate is 0.',
          eq: [R`D=(0,0),\qquad C=(2,0)`],
          focus: ['D', 'C', 'DC'],
          show: ['axes'],
          hint: 'C = D + 2a.',
          why: 'The axes are slanted, not at right angles, but coordinates still work: each point is “so many a, then so many b” from D.'
        },
        {
          title: 'Read off the corners',
          text: 'Follow the given sides from D.',
          eq: [R`A=(0,-1),\qquad B=(4,-1)`, R`F=(2,1),\qquad E=(-1,1)`],
          focus: GIVEN_FOCUS,
          showGivenLabels: true,
          show: ['axes'],
          hint: 'A = D − b, B = A + 4a, F = C + b, E = F − 3a.',
          why: 'Each side adds or subtracts a known number of a’s or b’s.'
        },
        {
          title: 'Midpoint M',
          text: 'Average the coordinates of B and C.',
          eq: [R`M=\Big(\tfrac{4+2}{2},\ \tfrac{-1+0}{2}\Big)=\big(3,-\tfrac12\big)`],
          focus: ['B', 'C', 'M', 'BC'],
          show: ['axes'],
          hint: 'Add, then halve, each coordinate.',
          why: 'Same midpoint rule as with ordinary x–y coordinates.'
        },
        {
          title: 'Describe the line ME',
          text: 'Start at M and add a fraction <i>t</i> of the step from M to E.',
          eq: [R`E-M=\big(-4,\ \tfrac32\big)`, R`P=\big(3-4t,\ -\tfrac12+\tfrac32t\big)`],
          focus: ['M', 'E', 'MNE'],
          show: ['axes', 'ME'],
          labels: { ME: '(−4, 3⁄2)' },
          hint: 'E − M = (−1 − 3, 1 − (−½)).',
          why: 't = 0 gives M and t = 1 gives E.'
        },
        {
          title: 'Where ME meets the a-axis',
          text: 'On DC the second coordinate is 0.',
          eq: [R`-\tfrac12+\tfrac32t=0\ \Rightarrow\ t=\tfrac13`, R`N=\big(3-\tfrac43,\ 0\big)=\big(\tfrac53,0\big)`],
          focus: ['M', 'E', 'N', 'MNE', 'DC'],
          nGreen: true,
          show: ['axes', 'ME'],
          hint: 'Solve for t, then put it into the first coordinate.',
          why: 'Crossing the a-axis is exactly where the b-coordinate hits zero.'
        },
        {
          final: true,
          title: 'Find DN : NC',
          text: 'Along the <b>a</b>-axis, D is at 0, N at 5⁄3 and C at 2.',
          eq: [R`DN=\tfrac53,\quad NC=2-\tfrac53=\tfrac13`, R`DN:NC=5:1`, R`\boxed{k=5}`],
          focus: ['D', 'C', 'N', 'DC', 'MNE'],
          nGreen: true,
          show: ['DN', 'NC', 'ratioDC'],
                    hint: 'Multiply both parts by 3.',
          why: 'The diagram is now redrawn to scale: N really is much nearer C than D.'
        }
      ]
    }
  ];

  const compare = [
    { id: 'a', name: 'Shared origin', idea: 'One origin makes every point comparable.',
      summary: 'Write points as routes from D: DM = 3a − ½b, DE = b − a. Walk from M along ME until the b-part is zero (t = ⅓), giving DN = 5⁄3 a.' },
    { id: 'b', name: 'Collinearity', idea: 'Vectors along one line are multiples.',
      summary: 'Let DN = xa. Then NM = (3 − x)a − ½b and NE = −(x + 1)a + b. Matching b-parts gives NM = −½NE; matching a-parts gives x = 5⁄3.' },
    { id: 'c', name: 'Section formula', idea: 'A ratio along a line is a set of weights.',
      summary: 'DN = ⅔DM + ⅓DE is the blend that cancels b. So MN : NE = 1 : 2, and DN = 5⁄3 a.' },
    { id: 'd', name: 'Coordinates', idea: 'a and b act as slanted axes.',
      summary: 'M = (3, −½), E = (−1, 1). Line ME reaches b-coordinate 0 at t = ⅓, giving N = (5⁄3, 0).' }
  ];

  const quiz = [
    { q: 'If DN = a and DC = 2a, what is NC?', options: ['a', '2a', '3a', '½a'], answer: 0,
      explain: 'NC = DC − DN = 2a − a = a.' },
    { q: 'In this question, N splits ME in the ratio MN : NE =', options: ['1 : 1', '1 : 2', '2 : 1', '5 : 1'], answer: 1,
      explain: 'N is one third of the way from M to E, so MN : NE = 1 : 2.' },
    { q: 'Which is DM?', options: ['3a − b', '3a − ½b', '4a − b', '2a + ½b'], answer: 1,
      explain: 'DM = ½(DB + DC) = ½(4a − b + 2a) = 3a − ½b. Halve the b too.' }
  ];

  const api = { approaches, compare, quiz };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Lesson = api;
})(typeof window !== 'undefined' ? window : globalThis);
