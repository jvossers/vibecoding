/**
 * Binary / Denary / Hex Converter — simulation logic.
 * Reactive sim: no animation loop, just manual render on input changes.
 */
(function () {
  'use strict';

  var BITS = 8;
  var PLACE_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

  // DOM refs
  var placeRow   = document.getElementById('place-values');
  var cellRow    = document.getElementById('bit-cells');
  var binInput   = document.getElementById('binary-input');
  var denInput   = document.getElementById('denary-input');
  var hexInput   = document.getElementById('hex-input');
  var controlsEl = document.getElementById('controls');

  // State
  var bits = [0, 0, 0, 0, 0, 0, 0, 0];
  var cells = [];
  var updatingFromCode = false; // prevents input event loops

  /* ── Build the bit grid ──────────────────────────────────────── */
  PLACE_VALUES.forEach(function (pv, i) {
    var pvEl = document.createElement('div');
    pvEl.className = 'place-value';
    pvEl.textContent = pv;
    placeRow.appendChild(pvEl);

    var cell = document.createElement('div');
    cell.className = 'bit-cell';
    cell.textContent = '0';
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', 'Bit ' + pv);
    cell.tabIndex = 0;
    cell.addEventListener('click', function () { toggleBit(i); });
    cell.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBit(i); }
    });
    cellRow.appendChild(cell);
    cells.push(cell);
  });

  /* ── Engine (reset only, no play/speed) ──────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });
  engine.onReset(function () {
    bits = [0, 0, 0, 0, 0, 0, 0, 0];
    syncUI();
  });

  /* ── Core logic ──────────────────────────────────────────────── */
  function toggleBit(index) {
    bits[index] = bits[index] ? 0 : 1;
    syncUI();
  }

  function bitsToDecimal() {
    var val = 0;
    for (var i = 0; i < BITS; i++) val += bits[i] * PLACE_VALUES[i];
    return val;
  }

  function decimalToBits(n) {
    n = Math.max(0, Math.min(255, Math.floor(n)));
    for (var i = 0; i < BITS; i++) {
      bits[i] = n >= PLACE_VALUES[i] ? 1 : 0;
      if (bits[i]) n -= PLACE_VALUES[i];
    }
  }

  function syncUI() {
    var dec = bitsToDecimal();
    updatingFromCode = true;

    // Update bit cells
    cells.forEach(function (cell, i) {
      cell.textContent = bits[i];
      cell.classList.toggle('on', bits[i] === 1);
    });

    // Update input fields
    binInput.value = bits.join('');
    denInput.value = dec;
    hexInput.value = dec.toString(16).toUpperCase().padStart(2, '0');

    updatingFromCode = false;
  }

  /* ── Input field listeners ───────────────────────────────────── */
  binInput.addEventListener('input', function () {
    if (updatingFromCode) return;
    var raw = binInput.value.replace(/[^01]/g, '').slice(0, 8);
    bits = raw.padStart(8, '0').split('').map(Number);
    syncUI();
  });

  denInput.addEventListener('input', function () {
    if (updatingFromCode) return;
    var n = parseInt(denInput.value, 10);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(255, n));
    decimalToBits(n);
    syncUI();
  });

  hexInput.addEventListener('input', function () {
    if (updatingFromCode) return;
    var raw = hexInput.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 2);
    var n = parseInt(raw, 16);
    if (isNaN(n)) n = 0;
    decimalToBits(n);
    syncUI();
  });

  /* ── Practice mode ───────────────────────────────────────────── */
  var challengeQ    = document.getElementById('challenge-question');
  var challengeAns  = document.getElementById('challenge-answer');
  var challengeFb   = document.getElementById('challenge-feedback');
  var challengeStr  = document.getElementById('challenge-streak');
  var challengeNew  = document.getElementById('challenge-new');

  var streak = 0;
  var currentChallenge = null;

  var CHALLENGE_TYPES = [
    { q: function (n) { return 'Convert denary ' + n + ' to binary'; },
      fmt: 'binary',
      answer: function (n) { return n.toString(2).padStart(8, '0'); } },
    { q: function (n) { return 'Convert denary ' + n + ' to hex'; },
      fmt: 'hex',
      answer: function (n) { return n.toString(16).toUpperCase().padStart(2, '0'); } },
    { q: function (n) { return 'Convert binary ' + n.toString(2).padStart(8, '0') + ' to denary'; },
      fmt: 'denary',
      answer: function (n) { return '' + n; } },
    { q: function (n) { return 'Convert hex ' + n.toString(16).toUpperCase().padStart(2, '0') + ' to denary'; },
      fmt: 'denary',
      answer: function (n) { return '' + n; } }
  ];

  function newChallenge() {
    var n = Math.floor(Math.random() * 256);
    var type = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
    currentChallenge = { value: n, type: type };
    challengeQ.textContent = type.q(n);
    challengeAns.value = '';
    challengeFb.textContent = '';
    challengeFb.className = 'challenge-feedback';
    challengeAns.focus();
  }

  function checkAnswer() {
    if (!currentChallenge) return;
    var userAns = challengeAns.value.trim().toUpperCase();
    var correct = currentChallenge.type.answer(currentChallenge.value).toUpperCase();

    if (!userAns) return;

    if (userAns === correct) {
      streak++;
      challengeFb.textContent = 'Correct!';
      challengeFb.className = 'challenge-feedback correct';
      challengeStr.textContent = 'Streak: ' + streak;
      setTimeout(newChallenge, 800);
    } else {
      streak = 0;
      challengeFb.textContent = 'Not quite — the answer is ' + correct;
      challengeFb.className = 'challenge-feedback incorrect';
      challengeStr.textContent = 'Streak: 0';
    }
  }

  challengeAns.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkAnswer();
  });
  challengeNew.addEventListener('click', newChallenge);

  // Init
  syncUI();
  newChallenge();
})();
