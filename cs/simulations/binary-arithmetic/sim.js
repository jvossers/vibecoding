/**
 * Binary Arithmetic Visualiser
 * Addition with animated carries + bit shifting with visual explanation.
 */
(function () {
  'use strict';

  var BITS = 8;

  /* ── DOM ──────────────────────────────────────────────────────── */
  var modeBtns    = document.querySelectorAll('[data-mode]');
  var addPanel    = document.getElementById('addition-panel');
  var shiftPanel  = document.getElementById('shift-panel');
  var addGrid     = document.getElementById('addition-grid');
  var overflowMsg = document.getElementById('overflow-msg');
  var inputA      = document.getElementById('input-a');
  var inputB      = document.getElementById('input-b');
  var shiftInput  = document.getElementById('shift-input');
  var shiftDir    = document.getElementById('shift-dir');
  var shiftPlaces = document.getElementById('shift-places');
  var shiftDisp   = document.getElementById('shift-display');
  var controlsEl  = document.getElementById('controls');

  var currentMode = 'addition';

  /* ── Mode switching ──────────────────────────────────────────── */
  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      addPanel.style.display = currentMode === 'addition' ? '' : 'none';
      shiftPanel.style.display = currentMode === 'shift' ? '' : 'none';
      engine.reset();
    });
  });

  /* ── Engine (step-through addition, reactive shift) ──────────── */
  var steps = [];
  var stepIndex = 0;

  var engine = new SimulationEngine(controlsEl);
  engine
    .onReset(function () {
      if (currentMode === 'addition') { generateAddSteps(); stepIndex = 0; }
      else { renderShift(); }
    })
    .onStep(function () {
      if (currentMode !== 'addition') return false;
      if (stepIndex >= steps.length - 1) return false;
      stepIndex++;
    })
    .onRender(function () {
      if (currentMode === 'addition') renderAddStep();
    });

  /* ── Input change listeners ──────────────────────────────────── */
  inputA.addEventListener('input', function () { engine.reset(); });
  inputB.addEventListener('input', function () { engine.reset(); });
  shiftInput.addEventListener('input', function () { engine.reset(); });
  shiftDir.addEventListener('change', function () { engine.reset(); });
  shiftPlaces.addEventListener('change', function () { engine.reset(); });

  /* ── Parse binary string to array of ints ────────────────────── */
  function parseBin(str) {
    var s = str.replace(/[^01]/g, '').slice(0, BITS);
    s = s.padStart(BITS, '0');
    return s.split('').map(Number);
  }

  /* ── Generate addition steps ─────────────────────────────────── */
  function generateAddSteps() {
    var a = parseBin(inputA.value);
    var b = parseBin(inputB.value);
    steps = [];

    var carry = new Array(BITS + 1).fill(0);
    var result = new Array(BITS).fill(0);
    var colDone = -1; // no columns done yet

    // initial state
    steps.push({ a: a.slice(), b: b.slice(), carry: carry.slice(), result: result.slice(), col: -1 });

    for (var i = BITS - 1; i >= 0; i--) {
      var sum = a[i] + b[i] + carry[i + 1];
      result[i] = sum % 2;
      carry[i] = Math.floor(sum / 2);
      colDone = i;
      steps.push({ a: a.slice(), b: b.slice(), carry: carry.slice(), result: result.slice(), col: i });
    }

    // Final — check overflow
    steps.push({ a: a.slice(), b: b.slice(), carry: carry.slice(), result: result.slice(), col: -2, overflow: carry[0] === 1 });
  }

  /* ── Render current addition step ────────────────────────────── */
  function renderAddStep() {
    if (!steps.length) return;
    var s = steps[stepIndex];
    addGrid.innerHTML = '';

    function makeRow(label, cells, cls, highlightCol) {
      var row = document.createElement('div');
      row.className = 'add-row' + (cls ? ' ' + cls : '');
      var lbl = document.createElement('span');
      lbl.className = 'row-label';
      lbl.textContent = label;
      row.appendChild(lbl);
      cells.forEach(function (val, i) {
        var cell = document.createElement('div');
        cell.className = 'add-cell' + (cls ? ' ' + cls.replace('add-row', '').trim() : '');
        if (i === highlightCol) cell.classList.add('highlight');
        cell.textContent = val !== undefined ? val : '';
        row.appendChild(cell);
      });
      return row;
    }

    // Carry row (offset by 1: carry[0] is final overflow, carry[1..8] align with cols 0..7)
    var carryVis = [];
    for (var ci = 0; ci < BITS; ci++) {
      carryVis.push(s.carry[ci + 1] || (s.col !== -1 && s.col !== -2 && ci >= s.col ? s.carry[ci + 1] : ''));
    }
    // Only show carries that have been computed
    for (var cv = 0; cv < BITS; cv++) {
      if (s.col === -1) { carryVis[cv] = ''; }
      else if (s.col >= 0 && cv < s.col) { carryVis[cv] = ''; }
    }
    // Show overflow carry
    if (s.col === -2 && s.carry[0]) {
      carryVis.unshift(s.carry[0]);
      carryVis.pop();
    }
    addGrid.appendChild(makeRow('carry', carryVis, 'carry-cell', s.col >= 0 ? s.col : -1));

    addGrid.appendChild(makeRow('A', s.a, '', s.col >= 0 ? s.col : -1));
    addGrid.appendChild(makeRow('B', s.b, '', s.col >= 0 ? s.col : -1));

    // Result row
    var resVis = s.result.map(function (v, i) {
      if (s.col === -2) return v;
      if (s.col === -1) return '';
      return i >= s.col ? v : '';
    });
    addGrid.appendChild(makeRow('=', resVis, 'result-row', s.col >= 0 ? s.col : -1));

    // Denary labels
    var denA = parseInt(s.a.join(''), 2);
    var denB = parseInt(s.b.join(''), 2);
    var denR = parseInt(s.result.join(''), 2);

    if (s.col === -2) {
      if (s.overflow) {
        overflowMsg.textContent = 'Overflow! ' + denA + ' + ' + denB + ' = ' + (denA + denB) + ' which exceeds 255 (8-bit max). Result truncated to ' + denR + '.';
        overflowMsg.className = 'overflow-msg error';
      } else {
        overflowMsg.textContent = denA + ' + ' + denB + ' = ' + denR + ' — no overflow.';
        overflowMsg.className = 'overflow-msg ok';
      }
    } else {
      overflowMsg.textContent = '';
      overflowMsg.className = 'overflow-msg';
    }
  }

  /* ── Render bit shift (reactive, no steps) ───────────────────── */
  function renderShift() {
    var bits = parseBin(shiftInput.value);
    var dir = shiftDir.value;
    var places = parseInt(shiftPlaces.value, 10);
    shiftDisp.innerHTML = '';

    var original = bits.slice();
    var shifted = new Array(BITS).fill(0);

    if (dir === 'left') {
      for (var i = 0; i < BITS; i++) {
        var src = i + places;
        shifted[i] = src < BITS ? original[src] : 0;
      }
    } else {
      for (var j = 0; j < BITS; j++) {
        var src2 = j - places;
        shifted[j] = src2 >= 0 ? original[src2] : 0;
      }
    }

    // Original row
    var origRow = document.createElement('div');
    origRow.className = 'shift-row';
    var origLabel = document.createElement('span');
    origLabel.className = 'row-label';
    origLabel.textContent = 'Before';
    origRow.appendChild(origLabel);
    original.forEach(function (b) {
      var cell = document.createElement('div');
      cell.className = 'shift-cell active';
      cell.textContent = b;
      origRow.appendChild(cell);
    });
    shiftDisp.appendChild(origRow);

    // Shifted row
    var shiftRow = document.createElement('div');
    shiftRow.className = 'shift-row';
    var shiftLabel = document.createElement('span');
    shiftLabel.className = 'row-label';
    shiftLabel.textContent = 'After';
    shiftRow.appendChild(shiftLabel);
    shifted.forEach(function (b, i) {
      var cell = document.createElement('div');
      cell.className = 'shift-cell';
      if (dir === 'left' && i >= BITS - places) cell.classList.add('new');
      else if (dir === 'right' && i < places) cell.classList.add('new');
      else cell.classList.add('active');
      cell.textContent = b;
      shiftRow.appendChild(cell);
    });
    shiftDisp.appendChild(shiftRow);

    // Denary explanation
    var origDen = parseInt(original.join(''), 2);
    var shiftDen = parseInt(shifted.join(''), 2);
    var lbl = document.createElement('p');
    lbl.className = 'shift-value-label';
    var op = dir === 'left' ? '×' : '÷';
    var factor = Math.pow(2, places);
    lbl.textContent = origDen + ' ' + op + ' ' + factor + ' = ' + shiftDen +
      (dir === 'right' && origDen % factor !== 0 ? ' (remainder lost)' : '');
    shiftDisp.appendChild(lbl);
  }

  engine.reset();
})();
