/**
 * Sorting Algorithm Visualiser — simulation logic.
 *
 * Design: pre-compute all steps at setup, then play back by index.
 * Each step snapshot captures: array state, highlighted indices, stats.
 * Swap steps include a swapPair so the renderer can animate bars sliding.
 */
(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────────── */
  var canvas     = document.getElementById('sort-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');
  var sizeSelect  = document.getElementById('arr-size');
  var orderSelect = document.getElementById('arr-order');
  var algoBtns    = document.querySelectorAll('.algo-btn');
  var statComps   = document.getElementById('stat-comparisons');
  var statSwaps   = document.getElementById('stat-swaps');
  var statStep    = document.getElementById('stat-step');

  /* ── Colours ─────────────────────────────────────────────────── */
  var CLR_DEFAULT   = '#94a3b8'; // slate-400
  var CLR_COMPARING = '#f59e0b'; // amber
  var CLR_SWAPPING  = '#ef4444'; // red
  var CLR_SORTED    = '#10b981'; // green
  var CLR_BG        = '#f8fafc';

  /* ── State ───────────────────────────────────────────────────── */
  var currentAlgo = 'bubble';
  var steps = [];
  var stepIndex = 0;

  /* ── Animation state ─────────────────────────────────────────── */
  var ANIM_DURATION = 250; // ms per swap transition
  var lastRenderedStep = -1;
  var animT = 1;          // 0..1  (1 = done / no animation)
  var animSwap = null;    // [indexA, indexB] or null
  var animStartTime = 0;
  var animRafId = null;

  /* ── Engine ──────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      generateSteps();
      stepIndex = 0;
      lastRenderedStep = -1;
      cancelAnim();
    })
    .onStep(function () {
      if (stepIndex >= steps.length - 1) return false;
      stepIndex++;
    })
    .onRender(function () {
      onStepChange();
    });

  /* ── Algorithm selector buttons ──────────────────────────────── */
  algoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      algoBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentAlgo = btn.getAttribute('data-algo');
      engine.reset();
    });
  });

  /* ── Config changes → reset ──────────────────────────────────── */
  sizeSelect.addEventListener('change', function () { engine.reset(); });
  orderSelect.addEventListener('change', function () { engine.reset(); });

  /* ── Array generation ────────────────────────────────────────── */
  function generateArray() {
    var n = parseInt(sizeSelect.value, 10);
    var arr = [];
    for (var i = 1; i <= n; i++) arr.push(i);

    var order = orderSelect.value;
    if (order === 'random') {
      fisherYates(arr);
    } else if (order === 'reversed') {
      arr.reverse();
    } else if (order === 'nearly') {
      var swaps = Math.max(1, Math.floor(n * 0.1));
      for (var s = 0; s < swaps; s++) {
        var idx = Math.floor(Math.random() * (n - 1));
        var tmp = arr[idx]; arr[idx] = arr[idx + 1]; arr[idx + 1] = tmp;
      }
    }
    return arr;
  }

  function fisherYates(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  }

  /* ── Step generation (pre-compute entire sort) ───────────────── */
  function generateSteps() {
    var arr = generateArray();
    steps = [];

    switch (currentAlgo) {
      case 'bubble':    genBubble(arr);    break;
      case 'insertion': genInsertion(arr); break;
      case 'merge':     genMerge(arr);     break;
    }
  }

  function snap(arr, highlights, comparisons, swaps, swapPair) {
    steps.push({
      arr: arr.slice(),
      highlights: highlights || {},
      comparisons: comparisons || 0,
      swaps: swaps || 0,
      swapPair: swapPair || null   // [i, j] when two bars just swapped
    });
  }

  /* ── Bubble Sort ─────────────────────────────────────────────── */
  function genBubble(arr) {
    var n = arr.length, comps = 0, swp = 0;
    snap(arr, {}, comps, swp);

    for (var i = 0; i < n - 1; i++) {
      var swapped = false;
      for (var j = 0; j < n - 1 - i; j++) {
        comps++;
        var hl = {};
        hl[j] = CLR_COMPARING;
        hl[j + 1] = CLR_COMPARING;
        for (var s = n - i; s < n; s++) hl[s] = CLR_SORTED;
        snap(arr, hl, comps, swp);

        if (arr[j] > arr[j + 1]) {
          var tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;
          swp++;
          swapped = true;
          var hl2 = {};
          hl2[j] = CLR_SWAPPING;
          hl2[j + 1] = CLR_SWAPPING;
          for (var s2 = n - i; s2 < n; s2++) hl2[s2] = CLR_SORTED;
          snap(arr, hl2, comps, swp, [j, j + 1]);
        }
      }
      if (!swapped) break;
    }

    var final_hl = {};
    for (var f = 0; f < n; f++) final_hl[f] = CLR_SORTED;
    snap(arr, final_hl, comps, swp);
  }

  /* ── Insertion Sort ──────────────────────────────────────────── */
  function genInsertion(arr) {
    var n = arr.length, comps = 0, swp = 0;
    snap(arr, {}, comps, swp);

    for (var i = 1; i < n; i++) {
      var key = arr[i];
      var j = i - 1;

      var hl = {};
      hl[i] = CLR_COMPARING;
      snap(arr, hl, comps, swp);

      while (j >= 0 && arr[j] > key) {
        comps++;
        arr[j + 1] = arr[j];
        swp++;
        var hl2 = {};
        hl2[j] = CLR_SWAPPING;
        hl2[j + 1] = CLR_SWAPPING;
        snap(arr, hl2, comps, swp, [j, j + 1]);
        j--;
      }
      if (j >= 0) comps++;
      arr[j + 1] = key;

      var hl3 = {};
      hl3[j + 1] = CLR_SORTED;
      snap(arr, hl3, comps, swp);
    }

    var final_hl = {};
    for (var f = 0; f < n; f++) final_hl[f] = CLR_SORTED;
    snap(arr, final_hl, comps, swp);
  }

  /* ── Merge Sort ──────────────────────────────────────────────── */
  function genMerge(arr) {
    var comps = { v: 0 }, swp = { v: 0 };
    snap(arr, {}, 0, 0);
    mergeSortRec(arr, 0, arr.length - 1, comps, swp);

    var final_hl = {};
    for (var f = 0; f < arr.length; f++) final_hl[f] = CLR_SORTED;
    snap(arr, final_hl, comps.v, swp.v);
  }

  function mergeSortRec(arr, lo, hi, comps, swp) {
    if (lo >= hi) return;
    var mid = Math.floor((lo + hi) / 2);
    mergeSortRec(arr, lo, mid, comps, swp);
    mergeSortRec(arr, mid + 1, hi, comps, swp);
    merge(arr, lo, mid, hi, comps, swp);
  }

  function merge(arr, lo, mid, hi, comps, swp) {
    var left = arr.slice(lo, mid + 1);
    var right = arr.slice(mid + 1, hi + 1);
    var i = 0, j = 0, k = lo;

    while (i < left.length && j < right.length) {
      comps.v++;
      var hl = {};
      hl[lo + i] = CLR_COMPARING;
      hl[mid + 1 + j] = CLR_COMPARING;
      snap(arr, hl, comps.v, swp.v);

      if (left[i] <= right[j]) {
        arr[k] = left[i]; i++;
      } else {
        arr[k] = right[j]; j++;
      }
      swp.v++;
      var hl2 = {};
      hl2[k] = CLR_SWAPPING;
      snap(arr, hl2, comps.v, swp.v);
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i]; i++; k++;
      swp.v++;
      snap(arr, {}, comps.v, swp.v);
    }
    while (j < right.length) {
      arr[k] = right[j]; j++; k++;
      swp.v++;
      snap(arr, {}, comps.v, swp.v);
    }
  }

  /* ── Animation helpers ───────────────────────────────────────── */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function cancelAnim() {
    if (animRafId) { cancelAnimationFrame(animRafId); animRafId = null; }
    animT = 1;
    animSwap = null;
  }

  function onStepChange() {
    if (steps.length === 0) return;
    var frame = steps[stepIndex];

    if (stepIndex !== lastRenderedStep) {
      lastRenderedStep = stepIndex;
      cancelAnim();

      if (frame.swapPair) {
        animSwap = frame.swapPair;
        animT = 0;
        animStartTime = performance.now();
        runAnimLoop();
        return; // first drawBars happens inside the loop
      }
    }

    drawBars();
  }

  function runAnimLoop() {
    animRafId = requestAnimationFrame(function tick(now) {
      animT = Math.min(1, (now - animStartTime) / ANIM_DURATION);
      drawBars();
      if (animT < 1) {
        animRafId = requestAnimationFrame(tick);
      } else {
        animSwap = null;
        animRafId = null;
      }
    });
  }

  /* ── Canvas drawing ──────────────────────────────────────────── */
  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth;
    var h = Math.max(280, Math.min(400, w * 0.5));

    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBars() {
    if (steps.length === 0) return;
    var frame = steps[stepIndex];
    var arr = frame.arr;
    var hl  = frame.highlights;
    var n   = arr.length;
    var maxVal = n;

    resizeCanvas();
    var w = canvas.width / (window.devicePixelRatio || 1);
    var h = canvas.height / (window.devicePixelRatio || 1);

    ctx.fillStyle = CLR_BG;
    ctx.fillRect(0, 0, w, h);

    var pad = 4;
    var barW = (w - pad * 2) / n;
    var gap = Math.max(1, barW * 0.1);
    var usableBarW = barW - gap;
    var ease = animSwap ? easeInOutCubic(animT) : 1;

    for (var i = 0; i < n; i++) {
      var barH = (arr[i] / maxVal) * (h - pad * 2 - 20);
      var baseX = pad + i * barW + gap / 2;
      var x = baseX;

      // Animate swapping bars: each bar slides from the other's position
      if (animSwap && animT < 1) {
        var si = animSwap[0], sj = animSwap[1];
        if (i === si || i === sj) {
          var otherIdx = (i === si) ? sj : si;
          var fromX = pad + otherIdx * barW + gap / 2;
          x = fromX + (baseX - fromX) * ease;
        }
      }

      var y = h - pad - barH;
      ctx.fillStyle = hl[i] || CLR_DEFAULT;
      ctx.fillRect(x, y, usableBarW, barH);
    }

    statComps.textContent = frame.comparisons;
    statSwaps.textContent = frame.swaps;
    statStep.textContent  = stepIndex + ' / ' + (steps.length - 1);
  }

  /* ── Resize handling ─────────────────────────────────────────── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { drawBars(); }, 100);
  });

  /* ── Init ────────────────────────────────────────────────────── */
  engine.reset();
})();
