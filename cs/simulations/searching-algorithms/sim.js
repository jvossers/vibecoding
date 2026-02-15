/**
 * Searching Algorithm Visualiser
 * Pre-computed steps for linear and binary search with DOM-based rendering.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var listEl     = document.getElementById('search-list');
  var controlsEl = document.getElementById('controls');
  var algoBtns   = document.querySelectorAll('.algo-btn');
  var targetIn   = document.getElementById('search-target');
  var sizeSelect = document.getElementById('list-size');
  var sortedToggle = document.getElementById('sorted-toggle');
  var statComps  = document.getElementById('stat-comps');
  var statResult = document.getElementById('stat-result');
  var statStep   = document.getElementById('stat-step');

  var currentAlgo = 'linear';
  var steps = [];
  var stepIndex = 0;

  /* ── Engine ──────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);
  engine
    .onReset(function () { generateSteps(); stepIndex = 0; })
    .onStep(function ()  { if (stepIndex >= steps.length - 1) return false; stepIndex++; })
    .onRender(renderStep);

  /* ── Controls ────────────────────────────────────────────────── */
  algoBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      algoBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentAlgo = btn.getAttribute('data-algo');
      // Binary search requires sorted
      if (currentAlgo === 'binary') sortedToggle.checked = true;
      engine.reset();
    });
  });
  targetIn.addEventListener('change', function () { engine.reset(); });
  sizeSelect.addEventListener('change', function () { engine.reset(); });
  sortedToggle.addEventListener('change', function () {
    if (currentAlgo === 'binary' && !sortedToggle.checked) {
      sortedToggle.checked = true; // binary search needs sorted
    }
    engine.reset();
  });

  /* ── Generate list ───────────────────────────────────────────── */
  function generateList() {
    var n = parseInt(sizeSelect.value, 10);
    var arr = [];
    if (sortedToggle.checked) {
      // Sorted unique values spread across 1..n*2
      var pool = [];
      for (var i = 1; i <= n * 2; i++) pool.push(i);
      // Pick n values
      fisherYates(pool);
      arr = pool.slice(0, n).sort(function (a, b) { return a - b; });
    } else {
      for (var j = 1; j <= n * 2; j++) arr.push(j);
      fisherYates(arr);
      arr = arr.slice(0, n);
    }
    return arr;
  }

  var fisherYates = SimulationEngine.fisherYates;

  /* ── Step generation ─────────────────────────────────────────── */
  function generateSteps() {
    var arr = generateList();
    var target = parseInt(targetIn.value, 10);
    steps = [];

    // Initial state
    steps.push({ arr: arr, states: {}, comps: 0, result: null });

    if (currentAlgo === 'linear') {
      genLinear(arr, target);
    } else {
      genBinary(arr, target);
    }
  }

  function snap(arr, states, comps, result) {
    steps.push({ arr: arr, states: Object.assign({}, states), comps: comps, result: result });
  }

  function genLinear(arr, target) {
    var comps = 0;
    var states = {};
    for (var i = 0; i < arr.length; i++) {
      comps++;
      states[i] = 'checking';
      snap(arr, states, comps, null);

      if (arr[i] === target) {
        states[i] = 'found';
        snap(arr, states, comps, 'Found at index ' + i);
        return;
      }
      states[i] = 'eliminated';
    }
    snap(arr, states, comps, 'Not found');
  }

  function genBinary(arr, target) {
    var lo = 0, hi = arr.length - 1;
    var comps = 0;
    var states = {};

    while (lo <= hi) {
      var mid = Math.floor((lo + hi) / 2);
      comps++;

      // Mark range and midpoint
      states = {};
      for (var i = 0; i < arr.length; i++) {
        if (i < lo || i > hi) states[i] = 'eliminated';
        else if (i === mid) states[i] = 'midpoint';
        else states[i] = 'in-range';
      }
      snap(arr, states, comps, null);

      if (arr[mid] === target) {
        states[mid] = 'found';
        snap(arr, states, comps, 'Found at index ' + mid);
        return;
      }

      // Show comparison result
      states[mid] = 'checking';
      snap(arr, states, comps, null);

      if (target < arr[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
      states[mid] = 'eliminated';
    }

    snap(arr, states, comps, 'Not found');
  }

  /* ── Render ──────────────────────────────────────────────────── */
  function renderStep() {
    if (!steps.length) return;
    var s = steps[stepIndex];
    listEl.innerHTML = '';

    s.arr.forEach(function (val, i) {
      var el = document.createElement('div');
      el.className = 'search-item';
      if (s.states[i]) el.classList.add(s.states[i]);

      var idx = document.createElement('span');
      idx.className = 'idx';
      idx.textContent = i;
      el.appendChild(idx);
      el.appendChild(document.createTextNode(val));
      listEl.appendChild(el);
    });

    statComps.textContent = s.comps;
    statResult.textContent = s.result || '—';
    statStep.textContent = stepIndex + ' / ' + (steps.length - 1);
  }

  engine.reset();
})();
