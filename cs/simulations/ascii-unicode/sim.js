/**
 * ASCII / Unicode Explorer — simulation logic.
 * Reactive sim: no animation loop, just manual render on input changes.
 */
(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────────────
  var controlsEl     = document.getElementById('controls');
  var textInput      = document.getElementById('text-input');
  var convTbody      = document.getElementById('conversion-tbody');
  var emptyHint      = document.getElementById('empty-hint');
  var charmapGrid    = document.getElementById('charmap-grid');
  var charDetail     = document.getElementById('char-detail');
  var detailChar     = document.getElementById('detail-char');
  var detailDec      = document.getElementById('detail-dec');
  var detailBin      = document.getElementById('detail-bin');
  var detailHex      = document.getElementById('detail-hex');
  var btnAscii       = document.getElementById('btn-ascii');
  var btnUnicode     = document.getElementById('btn-unicode');

  // ── State ─────────────────────────────────────────────────────────
  var mode = 'ascii';     // 'ascii' (7-bit) or 'unicode' (16-bit)
  var selectedCode = -1;  // currently selected charmap code, or -1
  var charmapCells = [];   // references to DOM cells

  // ── Engine (reset only, no play/speed) ────────────────────────────
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });
  engine.onReset(function () {
    textInput.value = '';
    selectedCode = -1;
    charDetail.style.display = 'none';
    updateCharmapSelection();
    updateConversionTable();
  });

  // ── Mode toggle ───────────────────────────────────────────────────
  btnAscii.addEventListener('click', function () {
    mode = 'ascii';
    btnAscii.classList.add('active');
    btnUnicode.classList.remove('active');
    refresh();
  });
  btnUnicode.addEventListener('click', function () {
    mode = 'unicode';
    btnUnicode.classList.add('active');
    btnAscii.classList.remove('active');
    refresh();
  });

  // ── Helpers ───────────────────────────────────────────────────────
  function bitCount() {
    return mode === 'ascii' ? 7 : 16;
  }

  function toBinary(code) {
    return code.toString(2).padStart(bitCount(), '0');
  }

  function toHex(code) {
    var digits = mode === 'ascii' ? 2 : 4;
    return code.toString(16).toUpperCase().padStart(digits, '0');
  }

  function displayChar(code) {
    if (code === 32) return 'SP';
    if (code < 32) return '';
    return String.fromCharCode(code);
  }

  // ── Build character map grid (ASCII 32–126) ───────────────────────
  function buildCharmap() {
    charmapGrid.innerHTML = '';
    charmapCells = [];
    for (var code = 32; code <= 126; code++) {
      var cell = document.createElement('div');
      cell.className = 'charmap-cell';
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('title', 'Dec: ' + code);
      cell.dataset.code = code;

      if (code === 32) {
        cell.textContent = 'SP';
        cell.classList.add('space-char');
      } else {
        cell.textContent = String.fromCharCode(code);
      }

      cell.addEventListener('click', handleCharmapClick);
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCharmapClick.call(this, e);
        }
      });

      charmapGrid.appendChild(cell);
      charmapCells.push(cell);
    }
  }

  function handleCharmapClick() {
    var code = parseInt(this.dataset.code, 10);
    if (selectedCode === code) {
      selectedCode = -1;
      charDetail.style.display = 'none';
    } else {
      selectedCode = code;
      showDetail(code);
    }
    updateCharmapSelection();
  }

  function updateCharmapSelection() {
    for (var i = 0; i < charmapCells.length; i++) {
      var c = parseInt(charmapCells[i].dataset.code, 10);
      charmapCells[i].classList.toggle('selected', c === selectedCode);
    }
  }

  function showDetail(code) {
    charDetail.style.display = '';
    detailChar.textContent = displayChar(code);
    detailDec.textContent = code;
    detailBin.textContent = toBinary(code);
    detailHex.textContent = toHex(code);
  }

  // ── Live conversion table ─────────────────────────────────────────
  function updateConversionTable() {
    var text = textInput.value;
    convTbody.innerHTML = '';

    if (text.length === 0) {
      emptyHint.style.display = '';
      return;
    }
    emptyHint.style.display = 'none';

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var code = text.charCodeAt(i);
      var tr = document.createElement('tr');

      var tdChar = document.createElement('td');
      tdChar.textContent = ch === ' ' ? 'SP (space)' : ch;
      tr.appendChild(tdChar);

      var tdDec = document.createElement('td');
      tdDec.textContent = code;
      tr.appendChild(tdDec);

      var tdBin = document.createElement('td');
      tdBin.textContent = toBinary(code);
      tr.appendChild(tdBin);

      var tdHex = document.createElement('td');
      tdHex.textContent = toHex(code);
      tr.appendChild(tdHex);

      convTbody.appendChild(tr);
    }
  }

  function refresh() {
    updateConversionTable();
    if (selectedCode >= 0) {
      showDetail(selectedCode);
    }
  }

  // ── Text input listener ───────────────────────────────────────────
  textInput.addEventListener('input', function () {
    updateConversionTable();
  });

  // ── Practice mode ─────────────────────────────────────────────────
  var challengeQ   = document.getElementById('challenge-question');
  var challengeAns = document.getElementById('challenge-answer');
  var challengeFb  = document.getElementById('challenge-feedback');
  var challengeStr = document.getElementById('challenge-streak');
  var challengeNew = document.getElementById('challenge-new');

  var streak = 0;
  var currentChallenge = null;

  // Printable ASCII range for challenges (33–126, skip space for clarity)
  var PRINTABLE_MIN = 33;
  var PRINTABLE_MAX = 126;

  // Well-known characters for more interesting questions
  var NOTABLE_CHARS = [
    { code: 65,  label: 'A' },
    { code: 66,  label: 'B' },
    { code: 67,  label: 'C' },
    { code: 72,  label: 'H' },
    { code: 90,  label: 'Z' },
    { code: 97,  label: 'a' },
    { code: 98,  label: 'b' },
    { code: 99,  label: 'c' },
    { code: 122, label: 'z' },
    { code: 48,  label: '0' },
    { code: 57,  label: '9' },
    { code: 33,  label: '!' },
    { code: 42,  label: '*' },
    { code: 64,  label: '@' }
  ];

  function randomCode() {
    return PRINTABLE_MIN + Math.floor(Math.random() * (PRINTABLE_MAX - PRINTABLE_MIN + 1));
  }

  function randomNotable() {
    return NOTABLE_CHARS[Math.floor(Math.random() * NOTABLE_CHARS.length)];
  }

  var CHALLENGE_TYPES = [
    // "What is the binary ASCII code for 'X'?"
    {
      generate: function () {
        var n = randomNotable();
        return {
          question: "What is the 7-bit binary ASCII code for '" + n.label + "'?",
          answer: n.code.toString(2).padStart(7, '0')
        };
      }
    },
    // "What character has ASCII code N?"
    {
      generate: function () {
        var n = randomNotable();
        return {
          question: 'What character has ASCII decimal code ' + n.code + '?',
          answer: n.label
        };
      }
    },
    // "What is the decimal ASCII code for 'X'?"
    {
      generate: function () {
        var n = randomNotable();
        return {
          question: "What is the decimal ASCII code for '" + n.label + "'?",
          answer: '' + n.code
        };
      }
    },
    // "What is the hex ASCII code for 'X'?"
    {
      generate: function () {
        var code = randomCode();
        var ch = String.fromCharCode(code);
        return {
          question: "What is the hex ASCII code for '" + ch + "'?",
          answer: code.toString(16).toUpperCase()
        };
      }
    },
    // "Convert decimal N to 7-bit binary"
    {
      generate: function () {
        var code = randomCode();
        return {
          question: 'Convert decimal ' + code + ' to 7-bit binary.',
          answer: code.toString(2).padStart(7, '0')
        };
      }
    }
  ];

  function newChallenge() {
    var type = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
    currentChallenge = type.generate();
    challengeQ.textContent = currentChallenge.question;
    challengeAns.value = '';
    challengeFb.textContent = '';
    challengeFb.className = 'challenge-feedback';
    challengeAns.focus();
  }

  function checkAnswer() {
    if (!currentChallenge) return;
    var userAns = challengeAns.value.trim();
    var correct = currentChallenge.answer;

    if (!userAns) return;

    // Case-insensitive comparison for hex answers, exact for characters
    var isCorrect = false;
    if (correct.length === 1 && /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"|,.<>?\/`~\\]$/.test(correct)) {
      // Character answer: exact match
      isCorrect = userAns === correct;
    } else {
      // Numeric/binary/hex answer: case-insensitive
      isCorrect = userAns.toUpperCase() === correct.toUpperCase();
    }

    if (isCorrect) {
      streak++;
      challengeFb.textContent = 'Correct!';
      challengeFb.className = 'challenge-feedback correct';
      challengeStr.textContent = 'Streak: ' + streak;
      setTimeout(newChallenge, 800);
    } else {
      streak = 0;
      challengeFb.textContent = 'Not quite \u2014 the answer is ' + correct;
      challengeFb.className = 'challenge-feedback incorrect';
      challengeStr.textContent = 'Streak: 0';
    }
  }

  challengeAns.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkAnswer();
  });
  challengeNew.addEventListener('click', newChallenge);

  // ── Initialise ────────────────────────────────────────────────────
  buildCharmap();
  updateConversionTable();
  newChallenge();
})();
