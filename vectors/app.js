/* Two Trapeziums: interactive walkthrough. Vanilla JS, no build step. */
(function () {
  'use strict';
  const G = window.Geo;
  const L = window.Lesson;
  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- maths rendering ---------------- */
  const MACROS = { '\\V': '\\overrightarrow{#1}', '\\va': '\\mathbf{a}', '\\vb': '\\mathbf{b}' };

  function texFallback(tex) {
    let s = tex.replace(/-/g, '−').replace(/=/g, ' = ').replace(/\+/g, ' + ');
    const frac = (a, b) => {
      const map = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '4/3': '4⁄3', '5/3': '5⁄3', '3/2': '3⁄2' };
      return map[a + '/' + b] || a + '⁄' + b;
    };
    s = s.replace(/\\[td]?frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, a, b) => (/^\w+$/.test(a) && /^\w+$/.test(b) ? frac(a, b) : '(' + a + ')/(' + b + ')'));
    s = s.replace(/\\[td]?frac(\d)(\d)/g, (_, a, b) => frac(a, b));
    s = s.replace(/\\V\{(\w+)\}/g, '<span class="vec-fb">$1</span>');
    s = s.replace(/\\va/g, '<b>a</b>').replace(/\\vb/g, '<b>b</b>');
    s = s.replace(/\\boxed\{([^{}]+)\}/g, '<span class="box-fb">$1</span>');
    s = s.replace(/\\text\{([^{}]+)\}/g, '$1');
    s = s.replace(/\\(Big|big)([()])/g, '$2');
    s = s.replace(/\\Rightarrow/g, ' ⇒ ').replace(/\\times/g, '×').replace(/\\lambda/g, 'λ').replace(/\\mu/g, 'μ');
    s = s.replace(/\\qquad|\\quad/g, '&emsp;').replace(/\\[;, ]/g, ' ').replace(/\\,/g, ' ');
    return '<span class="fb">' + s + '</span>';
  }

  function renderTex(el, tex) {
    if (window.katex) {
      try { window.katex.render(tex, el, { macros: Object.assign({}, MACROS), throwOnError: false }); return; } catch (e) { /* fall through */ }
    }
    el.innerHTML = texFallback(tex);
  }

  function fitEquations() {
    document.querySelectorAll('.eq').forEach((box) => {
      const avail = box.clientWidth - 20;
      box.querySelectorAll('.eq-line').forEach((line) => {
        line.style.fontSize = '';
        const w = line.scrollWidth;
        if (w > avail && avail > 0) line.style.fontSize = Math.max(0.6, avail / w) + 'em';
      });
    });
  }

  /* ---------------- state ---------------- */
  const state = { screen: 'intro', approachId: 'a', stepIndex: 0, showHint: false, showWhy: false, showAllLabels: false, compareTab: 'a', quizIndex: 0 };
  let completed = new Set();
  try { completed = new Set(JSON.parse(localStorage.getItem('vectors-completed') || '[]')); } catch (e) { /* storage unavailable */ }
  const saveCompleted = () => { try { localStorage.setItem('vectors-completed', JSON.stringify([...completed])); } catch (e) { /* ignore */ } };

  const approach = () => L.approaches.find((a) => a.id === state.approachId) || L.approaches[0];
  const step = () => approach().steps[state.stepIndex];

  /* ---------------- routing (URL hash) ---------------- */
  function hashFor(s) {
    if (s.screen === 'lesson') return '#approach=' + s.approachId + '&step=' + (s.stepIndex + 1);
    if (s.screen === 'choose') return '#methods';
    if (s.screen === 'compare') return '#compare';
    return '#';
  }
  function go(patch) {
    Object.assign(state, patch, { showHint: false, showWhy: false });
    const h = hashFor(state);
    if (location.hash !== h && !(h === '#' && !location.hash)) history.pushState(null, '', h === '#' ? location.pathname + location.search : h);
    render();
  }
  function readHash() {
    const h = location.hash.slice(1);
    if (h === 'methods') return { screen: 'choose' };
    if (h === 'compare') return completed.size ? { screen: 'compare' } : { screen: 'choose' };
    const p = new URLSearchParams(h);
    const ap = L.approaches.find((a) => a.id === p.get('approach'));
    if (ap) {
      const n = Math.min(Math.max(parseInt(p.get('step'), 10) || 1, 1), ap.steps.length);
      return { screen: 'lesson', approachId: ap.id, stepIndex: n - 1 };
    }
    return { screen: 'intro' };
  }
  window.addEventListener('popstate', () => { Object.assign(state, readHash(), { showHint: false, showWhy: false }); render(); });

  /* ---------------- diagram ---------------- */
  const EDGES = {
    AB: { p: ['A', 'B'], kind: 'a', label: '4a', lab: { side: -1 } },
    DC: { p: ['D', 'C'], kind: 'a', label: '2a', lab: { side: 1, at: 0.42 } },
    EF: { p: ['E', 'F'], kind: 'a', label: '3a', lab: { side: 1 } },
    DA: { p: ['A', 'D'], kind: 'b', label: 'b', lab: { side: 1 } },
    FC: { p: ['C', 'F'], kind: 'b', label: 'b', lab: { side: -1 } },
    BC: { p: ['B', 'C'], kind: 'plain' },
    DE: { p: ['D', 'E'], kind: 'plain' },
    MNE: { p: ['M', 'E'], kind: 'me' }
  };
  const POINT_LABEL = { A: [-20, 20], B: [-18, -12], C: [6, -26], D: [-2, 32], E: [18, 20], F: [18, -10], M: [10, -20], N: [19, -2] };
  // vec: arrow from p[0] to p[1]; off = sideways shift (px); side = which side the label goes
  const OVERLAYS = {
    DAB: { route: ['D', 'A', 'B'] },
    DCFE: { route: ['D', 'C', 'F', 'E'] },
    CDAB: { route: ['C', 'D', 'A', 'B'] },
    NCM: { route: ['N', 'C', 'M'] },
    DB: { p: ['D', 'B'], side: 1 },
    DM: { p: ['D', 'M'], side: -1 },
    DE: { p: ['D', 'E'], off: 9, side: 1 },
    ME: { p: ['M', 'E'], cls: 'me', side: -1, at: 0.62 },
    DN: { p: ['D', 'N'], cls: 'n', off: -9, side: -1 },
    NC: { p: ['N', 'C'], cls: 'n', off: -9, side: -1 },
    CM: { p: ['C', 'M'], off: -9, side: -1 },
    NM: { p: ['N', 'M'], side: 1 },
    NE: { p: ['N', 'E'], side: -1, at: 0.55 }
  };

  const P = (g, n) => g[n];
  const norm = (v) => { const l = G.len(v) || 1; return { x: v.x / l, y: v.y / l }; };
  const perp = (d) => ({ x: -d.y, y: d.x });
  const f = (n) => Math.round(n * 10) / 10;
  const pts = (arr) => arr.map((p) => f(p.x) + ',' + f(p.y)).join(' ');

  function head(tip, d, size, attrs) {
    const n = perp(d);
    const back = G.sub(tip, G.scale(d, size));
    const l = G.add(back, G.scale(n, size * 0.48));
    const r = G.sub(back, G.scale(n, size * 0.48));
    return `<polygon ${attrs} points="${pts([tip, l, r])}"/>`;
  }

  function labelAt(mid, nrm, dist, text, cls) {
    const at = G.add(mid, G.scale(nrm, dist));
    const anchor = nrm.x > 0.45 ? 'start' : nrm.x < -0.45 ? 'end' : 'middle';
    return `<text class="${cls}" x="${f(at.x)}" y="${f(at.y)}" text-anchor="${anchor}" dominant-baseline="central">${text}</text>`;
  }

  function fmtLabel(t) {
    // bold the vector letters a and b in labels such as "3a − ½b"
    return t.replace(/(^|[^A-Za-z])([ab])(?![A-Za-z])/g, '$1<tspan font-style="italic" font-weight="800">$2</tspan>');
  }

  let lastShown = [];
  let lastFocus = [];

  function drawDiagram(g, view, opts) {
    const focus = view.focus || null;
    const show = view.show || [];
    const labels = view.labels || {};
    const animate = opts && opts.animate && !reduceMotion();
    const isDim = (id) => focus && !focus.includes(id);
    const allLabels = state.showAllLabels;
    const out = [];

    // axes (coordinate method)
    if (show.includes('axes')) {
      const a0 = G.sub(g.D, G.scale(g.a, 1.2)), a1 = G.add(g.D, G.scale(g.a, 3.4));
      const b0 = G.sub(g.D, G.scale(g.b, 1.35)), b1 = G.add(g.D, G.scale(g.b, 1.2));
      let s = `<g class="axes${animate && !lastShown.includes('axes') ? ' fade-in' : ''}">`;
      s += `<line class="axis" x1="${f(a0.x)}" y1="${f(a0.y)}" x2="${f(a1.x)}" y2="${f(a1.y)}"/>`;
      s += `<line class="axis" x1="${f(b0.x)}" y1="${f(b0.y)}" x2="${f(b1.x)}" y2="${f(b1.y)}"/>`;
      s += head(a1, norm(g.a), 10, 'style="fill:var(--ink-2)"');
      s += head(b1, norm(g.b), 10, 'style="fill:var(--ink-2)"');
      for (let i = -1; i <= 3; i++) {
        if (!i) continue;
        const t = G.add(g.D, G.scale(g.a, i));
        s += `<line class="tick" x1="${f(t.x - 5)}" y1="${f(t.y)}" x2="${f(t.x + 5)}" y2="${f(t.y)}"/>`;
        s += `<text class="axislabel" x="${f(t.x + 9)}" y="${f(t.y + 4)}">${i}</text>`;
      }
      for (const i of [-1, 1]) {
        const t = G.add(g.D, G.scale(g.b, i)), n = perp(norm(g.b));
        s += `<line class="tick" x1="${f(t.x - n.x * 5)}" y1="${f(t.y - n.y * 5)}" x2="${f(t.x + n.x * 5)}" y2="${f(t.y + n.y * 5)}"/>`;
      }
      s += `<text class="axislabel" x="${f(a1.x + 8)}" y="${f(a1.y + 6)}">a-axis</text>`;
      s += `<text class="axislabel" x="${f(b1.x + 6)}" y="${f(b1.y - 4)}">b-axis</text>`;
      s += '</g>';
      out.push(s);
    }

    // highlighted routes (drawn under the edges, like a highlighter pen)
    for (const id of show) {
      const o = OVERLAYS[id];
      if (!o || !o.route) continue;
      const arr = o.route.map((n) => P(g, n));
      let length = 0;
      for (let i = 1; i < arr.length; i++) length += G.len(G.sub(arr[i], arr[i - 1]));
      const fresh = animate && !lastShown.includes(id);
      out.push(`<polyline class="ov route" points="${pts(arr)}"${fresh ? ` style="stroke-dasharray:${f(length)};stroke-dashoffset:${f(length)};animation:trace .7s ease-in-out forwards"` : ''}/>`);
    }

    // edges with mid-arrows and labels
    for (const [id, e] of Object.entries(EDGES)) {
      const p = P(g, e.p[0]), q = P(g, e.p[1]);
      const dim = isDim(id) ? ' dim' : '';
      out.push(`<line class="edge ${e.kind}${dim}" x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}"/>`);
      if (e.kind === 'a' || e.kind === 'b') {
        const d = norm(G.sub(q, p));
        const mid = G.lerp(p, q, 0.5);
        out.push(head(G.add(mid, G.scale(d, 8)), d, 13, `class="ahead ${e.kind}${dim}"`));
        const showLab = view.showGivenLabels || !focus || focus.includes(id) || allLabels;
        if (showLab) {
          const at = G.lerp(p, q, e.lab.at || 0.5);
          const n = G.scale(perp(d), e.lab.side);
          out.push(labelAt(at, n, 16, fmtLabel(e.label), 'elabel ' + e.kind + (isDim(id) && !allLabels ? ' dim' : '')));
        }
      }
    }

    // construction vectors
    for (const id of show) {
      const o = OVERLAYS[id];
      if (!o || o.route) continue;
      const p0 = P(g, o.p[0]), q0 = P(g, o.p[1]);
      const d = norm(G.sub(q0, p0));
      const n = perp(d);
      const shift = G.scale(n, o.off || 0);
      const p = G.add(G.add(p0, G.scale(d, 7)), shift);
      const q = G.add(G.sub(q0, G.scale(d, 7)), shift);
      const hs = Math.min(16, G.len(G.sub(q, p)) * 0.45);
      const lineEnd = G.sub(q, G.scale(d, hs * 0.6));
      const length = G.len(G.sub(lineEnd, p));
      const cls = 'ov vec' + (o.cls ? ' ' + o.cls : '');
      const fresh = animate && !lastShown.includes(id);
      out.push(`<line class="${cls}" x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(lineEnd.x)}" y2="${f(lineEnd.y)}"${fresh ? ` style="stroke-dasharray:${f(length)};stroke-dashoffset:${f(length)};animation:trace .55s ease-out forwards"` : ''}/>`);
      const fill = `fill:var(--${o.cls || 'acc'})`;
      out.push(head(q, d, hs, fresh ? `class="fade-in" style="${fill};animation-delay:.45s"` : `style="${fill}"`));
      if (labels[id]) {
        const mid = G.lerp(p, q, o.at || 0.5);
        const ln = G.scale(n, o.side || 1);
        out.push(labelAt(mid, ln, 14, fmtLabel(labels[id]), 'ovlabel' + (o.cls ? ' ' + o.cls : '') + (fresh ? ' fade-in' : '')));
      }
    }

    // ratio marks
    const tick = (pt, d, cls) => { const n = perp(d); return `<line x1="${f(pt.x - n.x * 7)}" y1="${f(pt.y - n.y * 7)}" x2="${f(pt.x + n.x * 7)}" y2="${f(pt.y + n.y * 7)}" class="${cls}"/>`; };
    if (show.includes('ratioDC')) {
      const d = norm(G.sub(g.C, g.D)), n = perp(d);
      const fresh = animate && !lastShown.includes('ratioDC');
      let s = `<g class="ratio dc${fresh ? ' fade-in' : ''}"${fresh ? ' style="animation-delay:.5s"' : ''}>`;
      s += tick(g.D, d, '') + tick(g.N, d, '') + tick(g.C, d, '');
      const m1 = G.add(G.lerp(g.D, g.N, 0.5), G.scale(n, -34)), m2 = G.add(G.lerp(g.N, g.C, 0.5), G.scale(n, -34));
      s += `<text x="${f(m1.x)}" y="${f(m1.y)}" text-anchor="middle" dominant-baseline="central">5</text><text x="${f(m2.x)}" y="${f(m2.y)}" text-anchor="middle" dominant-baseline="central">1</text></g>`;
      out.push(s);
    }
    if (show.includes('ratioME')) {
      const d = norm(G.sub(g.E, g.M)), n = perp(d);
      const fresh = animate && !lastShown.includes('ratioME');
      let s = `<g class="ratio me${fresh ? ' fade-in' : ''}">`;
      s += tick(g.M, d, '') + tick(g.N, d, '') + tick(g.E, d, '');
      const m1 = G.add(G.lerp(g.M, g.N, 0.5), G.scale(n, 24)), m2 = G.add(G.lerp(g.N, g.E, 0.5), G.scale(n, 24));
      s += `<text x="${f(m1.x)}" y="${f(m1.y)}" dominant-baseline="central">1</text><text x="${f(m2.x)}" y="${f(m2.y)}" dominant-baseline="central">2</text></g>`;
      out.push(s);
    }

    // points
    for (const name of ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N']) {
      const p = P(g, name);
      const dim = isDim(name);
      const fresh = animate && focus && focus.includes(name) && !lastFocus.includes(name);
      const cls = 'pt' + (name === 'N' && view.nGreen ? ' n' : '') + (fresh ? ' ring pulse' : '');
      const [dx, dy] = POINT_LABEL[name];
      out.push(`<g class="${cls}" id="point-${name}">` +
        (fresh ? `<circle class="ring" cx="${f(p.x)}" cy="${f(p.y)}" r="9"/>` : '') +
        `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="5.5"${dim ? ' class="dim"' : ''}/>` +
        `<text x="${f(p.x + dx)}" y="${f(p.y + dy)}" text-anchor="middle" dominant-baseline="central"${dim && !allLabels ? ' class="dim"' : ''}>${name}</text></g>`);
    }

    $('diagram').innerHTML = `<desc id="diagram-desc">${diagramDesc(view)}</desc>` + out.join('');
    if (opts && opts.remember) { lastShown = show.slice(); lastFocus = (focus || []).slice(); }
  }

  function diagramDesc(view) {
    const base = 'Two trapeziums ABCD and CDEF sharing side DC. AB, DC and EF point upwards; AD and CF are vector b. M is the midpoint of BC, and the straight line from M to E crosses DC at N.';
    const hl = (view.show || []).filter((s) => OVERLAYS[s] && !OVERLAYS[s].route);
    return base + (hl.length ? ' Highlighted: ' + hl.map((s) => 'vector ' + s).join(', ') + '.' : '');
  }

  /* geometry mode: schematic until an answer step, then morph to scale */
  let geoMix = 0; // 0 = schematic, 1 = accurate
  let morphRaf = 0;
  const geomAt = (m) => G.build(G.mix(G.SCHEMATIC, G.ACCURATE, m));

  function showDiagram(view, accurate) {
    const target = accurate ? 1 : 0;
    cancelAnimationFrame(morphRaf);
    const note = $('fig-note');
    note.textContent = accurate ? 'Now drawn accurately' : 'Diagram not drawn accurately';
    note.classList.toggle('accurate', accurate);
    if (geoMix === target || reduceMotion()) {
      geoMix = target;
      drawDiagram(geomAt(geoMix), view, { animate: true, remember: true });
      return;
    }
    const from = geoMix, start = performance.now(), dur = 1100;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / dur);
      geoMix = from + (target - from) * ease(t);
      drawDiagram(geomAt(geoMix), view, { animate: t === 0 });
      if (t < 1) morphRaf = requestAnimationFrame(frame);
      else { geoMix = target; drawDiagram(geomAt(geoMix), view, { animate: false, remember: true }); }
    };
    drawDiagram(geomAt(geoMix), view, { animate: true });
    morphRaf = requestAnimationFrame(frame);
  }

  /* ---------------- screens ---------------- */
  const app = $('app');

  function renderHeader() {
    const s = state.screen;
    $('btn-back').hidden = s === 'intro';
    $('method-wrap').hidden = s !== 'lesson';
    $('btn-labels').hidden = s !== 'lesson';
    $('btn-reset').hidden = s !== 'lesson';
    $('btn-labels').setAttribute('aria-pressed', String(state.showAllLabels));
    $('title').textContent = s === 'compare' ? 'Compare methods' : 'Two Trapeziums';
    if (s === 'lesson') $('method-select').value = state.approachId;
  }

  function renderCards() {
    $('cards').innerHTML = L.approaches.map((a) => `
      <button class="card${completed.has(a.id) ? ' done' : ''}" data-approach="${a.id}">
        <span class="badge" aria-hidden="true">${completed.has(a.id) ? '✓' : a.short}</span>
        <span class="name">${a.name}<span class="dots" aria-label="Difficulty ${a.level} of 3">${[1, 2, 3].map((i) => `<i class="${i <= a.level ? 'on' : ''}"></i>`).join('')}</span></span>
        <span class="blurb">${a.blurb}</span>
        <span class="learn"><b>Shows:</b> ${a.learn.toLowerCase()} · ${a.steps.length} steps</span>
      </button>`).join('');
  }

  function renderStep() {
    const ap = approach(), st = step(), n = ap.steps.length, i = state.stepIndex;
    $('step-kicker').textContent = `${ap.name} · Step ${i + 1} of ${n}`;
    $('step-title').textContent = st.title;
    $('step-text').innerHTML = st.text;
    const eq = $('step-eq');
    eq.innerHTML = '';
    st.eq.forEach((tex) => {
      const div = document.createElement('div');
      div.className = 'eq-line' + (/\\boxed/.test(tex) ? ' answer' : '');
      renderTex(div, tex);
      eq.appendChild(div);
    });
    $('btn-hint').setAttribute('aria-expanded', String(state.showHint));
    $('btn-why').setAttribute('aria-expanded', String(state.showWhy));
    $('btn-prev').disabled = i === 0;
    $('btn-next').disabled = false;
    $('next-label').textContent = i === n - 1 ? 'Compare' : i === n - 2 ? 'Finish' : 'Next';
    $('progress').innerHTML = ap.steps.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('');
    $('progress-text').textContent = `Step ${i + 1} of ${n}`;
    if (st.final && !completed.has(ap.id)) { completed.add(ap.id); saveCompleted(); }
    renderSheet();
    requestAnimationFrame(fitEquations);
  }

  function renderSheet() {
    const sh = $('sheet');
    const st = state.screen === 'lesson' ? step() : null;
    if (!st || (!state.showHint && !state.showWhy)) { sh.hidden = true; return; }
    sh.hidden = false;
    $('sheet-title').textContent = state.showHint ? 'Hint' : 'Why this step?';
    $('sheet-body').textContent = state.showHint ? st.hint : st.why;
  }

  function renderCompare() {
    const tabs = L.compare.map((c) => ({ id: c.id, label: 'Method ' + c.id.toUpperCase(), short: c.id.toUpperCase() })).concat([{ id: 'quiz', label: 'Check yourself', short: 'Check yourself' }]);
    $('tabs').innerHTML = tabs.map((t) => `<button class="tab" role="tab" data-tab="${t.id}" aria-selected="${state.compareTab === t.id}" aria-label="${t.label}">${t.short}</button>`).join('');
    const body = $('tab-body');
    if (state.compareTab === 'quiz') {
      const q = L.quiz[state.quizIndex];
      body.innerHTML = `<p class="quiz-q">${state.quizIndex + 1}/${L.quiz.length}. ${q.q}</p>
        <div class="opts">${q.options.map((o, k) => `<button class="opt" data-opt="${k}">${o.replace(/([ab])(?![a-z])/g, '<b>$1</b>')}</button>`).join('')}</div>
        <p class="feedback" id="feedback" aria-live="polite"></p>
        <div class="row"><button class="btn" id="quiz-next">${state.quizIndex < L.quiz.length - 1 ? 'Next question' : 'Start again'}</button></div>`;
    } else {
      const c = L.compare.find((x) => x.id === state.compareTab);
      body.innerHTML = `<h3>${c.name}</h3><p class="idea">${c.idea}</p><p>${c.summary}</p>
        <div class="row"><button class="btn" data-goto="${c.id}">Step through it</button><button class="btn" data-home>Start over</button></div>`;
    }
  }

  const COMPARE_VIEW = { focus: ['D', 'C', 'N', 'M', 'E', 'DC', 'MNE'], nGreen: true, show: ['DN', 'NC', 'ratioDC'] };

  function render() {
    app.dataset.screen = state.screen;
    renderHeader();
    if (state.screen === 'intro' || state.screen === 'choose') {
      if (state.screen === 'choose') renderCards();
      showDiagram({ showGivenLabels: true }, false);
      $('sheet').hidden = true;
    } else if (state.screen === 'lesson') {
      renderStep();
      showDiagram(step(), !!step().final);
    } else if (state.screen === 'compare') {
      renderCompare();
      showDiagram(COMPARE_VIEW, true);
      $('sheet').hidden = true;
    }
  }

  /* ---------------- actions ---------------- */
  const next = () => {
    if (state.screen !== 'lesson') return;
    if (state.stepIndex < approach().steps.length - 1) go({ stepIndex: state.stepIndex + 1 });
    else go({ screen: 'compare', compareTab: state.approachId });
  };
  const prev = () => { if (state.screen === 'lesson' && state.stepIndex > 0) go({ stepIndex: state.stepIndex - 1 }); };

  $('btn-start').addEventListener('click', () => go({ screen: 'choose' }));
  $('btn-next').addEventListener('click', next);
  $('btn-prev').addEventListener('click', prev);
  $('btn-back').addEventListener('click', () => go({ screen: state.screen === 'choose' ? 'intro' : 'choose' }));
  $('btn-reset').addEventListener('click', () => { state.showAllLabels = false; go({ stepIndex: 0 }); });
  $('btn-labels').addEventListener('click', () => { state.showAllLabels = !state.showAllLabels; renderHeader(); drawDiagram(geomAt(geoMix), step(), { remember: true }); });
  $('btn-hint').addEventListener('click', () => { state.showHint = !state.showHint; state.showWhy = false; renderStep(); });
  $('btn-why').addEventListener('click', () => { state.showWhy = !state.showWhy; state.showHint = false; renderStep(); });
  $('sheet-close').addEventListener('click', () => { state.showHint = state.showWhy = false; renderStep(); });
  $('btn-reveal').addEventListener('click', () => {
    if (window.confirm('Skip straight to the answer? It is more useful to step through a method first.')) {
      const a = L.approaches[0];
      go({ screen: 'lesson', approachId: a.id, stepIndex: a.steps.length - 1 });
    }
  });
  $('cards').addEventListener('click', (e) => {
    const c = e.target.closest('[data-approach]');
    if (c) go({ screen: 'lesson', approachId: c.dataset.approach, stepIndex: 0 });
  });
  const sel = $('method-select');
  sel.innerHTML = L.approaches.map((a) => `<option value="${a.id}">${a.short} · ${a.name}</option>`).join('');
  sel.addEventListener('change', () => go({ approachId: sel.value, stepIndex: 0 }));

  $('tabs').addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) { state.compareTab = t.dataset.tab; renderCompare(); }
  });
  $('tab-body').addEventListener('click', (e) => {
    const goto = e.target.closest('[data-goto]');
    if (goto) return go({ screen: 'lesson', approachId: goto.dataset.goto, stepIndex: 0 });
    if (e.target.closest('[data-home]')) return go({ screen: 'intro' });
    const opt = e.target.closest('[data-opt]');
    if (opt) {
      const q = L.quiz[state.quizIndex], k = +opt.dataset.opt;
      document.querySelectorAll('.opt').forEach((b) => b.classList.remove('wrong'));
      opt.classList.add(k === q.answer ? 'right' : 'wrong');
      $('feedback').textContent = (k === q.answer ? 'Correct. ' : 'Not quite. ') + q.explain;
    }
    if (e.target.closest('#quiz-next')) { state.quizIndex = (state.quizIndex + 1) % L.quiz.length; renderCompare(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('select, input, textarea')) return;
    if (e.key === 'Escape' && (state.showHint || state.showWhy)) { state.showHint = state.showWhy = false; renderStep(); return; }
    if (state.screen !== 'lesson') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); go({ stepIndex: 0 }); }
    else if (e.key === 'End') { e.preventDefault(); go({ stepIndex: approach().steps.length - 1 }); }
  });

  // swipe on the diagram to change step
  let sx = null, sy = 0;
  const fig = $('figure');
  fig.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  fig.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  });

  // keep SVG text a steady on-screen size whether the diagram is small (phone) or large (desktop)
  function scaleLabels() {
    const svg = $('diagram');
    const scale = svg.clientHeight ? Math.min(svg.clientWidth / 428, svg.clientHeight / 516) : 0.6;
    svg.style.setProperty('--k', Math.max(0.55, Math.min(1, 0.85 / scale)).toFixed(3));
  }
  window.addEventListener('resize', () => { fitEquations(); scaleLabels(); });

  /* ---------------- start ---------------- */
  function renderStaticMaths() {
    document.querySelectorAll('[data-tex]').forEach((el) => renderTex(el, el.dataset.tex));
  }
  const style = document.createElement('style');
  style.textContent = '@keyframes trace { to { stroke-dashoffset: 0; } }';
  document.head.appendChild(style);
  renderStaticMaths();
  Object.assign(state, readHash());
  render();
  scaleLabels();
  if (window.ResizeObserver) new ResizeObserver(scaleLabels).observe($('figure'));
})();
