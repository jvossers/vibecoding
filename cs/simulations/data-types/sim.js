/**
 * Data Types Explorer — simulation logic.
 * Reactive sim: no animation loop, just manual render on input changes.
 */
(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────────────
  var controlsEl   = document.getElementById('controls');
  var valueInput   = document.getElementById('value-input');
  var btnInteger   = document.getElementById('btn-integer');
  var btnReal      = document.getElementById('btn-real');
  var btnBoolean   = document.getElementById('btn-boolean');
  var btnCharacter = document.getElementById('btn-character');
  var btnString    = document.getElementById('btn-string');
  var castSelect   = document.getElementById('cast-select');
  var castingDemo  = document.getElementById('casting-demo');
  var castSteps    = document.getElementById('cast-steps');
  var memorySection = document.getElementById('memory-section');
  var memoryCards  = document.getElementById('memory-cards');

  // Challenge refs
  var challengeQ   = document.getElementById('challenge-question');
  var challengeOpts = document.getElementById('challenge-options');
  var challengeFb  = document.getElementById('challenge-feedback');
  var challengeStr = document.getElementById('challenge-streak');
  var challengeNew = document.getElementById('challenge-new');

  var typeButtons = {
    integer:   btnInteger,
    real:      btnReal,
    boolean:   btnBoolean,
    character: btnCharacter,
    string:    btnString
  };

  // ── State ─────────────────────────────────────────────────────────
  var streak = 0;
  var currentChallenge = null;
  var challengeAnswered = false;

  // ── Engine (reset only, no play/speed/step) ─────────────────────
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });
  engine.onReset(function () {
    valueInput.value = '';
    castSelect.value = '';
    castingDemo.style.display = 'none';
    memorySection.style.display = 'none';
    updateDetection();
    streak = 0;
    challengeStr.textContent = 'Streak: 0';
    newChallenge();
  });

  // ── Detection helpers ─────────────────────────────────────────────
  function isInteger(val) {
    if (val === '') return false;
    return /^-?\d+$/.test(val);
  }

  function isReal(val) {
    if (val === '') return false;
    return /^-?\d+(\.\d+)?$/.test(val) && !isNaN(parseFloat(val));
  }

  function isBoolean(val) {
    var lower = val.toLowerCase();
    return lower === 'true' || lower === 'false' ||
           lower === '0' || lower === '1';
  }

  function isCharacter(val) {
    if (val.length === 1) return true;
    // Also accept if it is a single-digit number (maps to ASCII)
    if (/^\d+$/.test(val)) {
      var n = parseInt(val, 10);
      return n >= 0 && n <= 127;
    }
    return false;
  }

  function isString() {
    // Everything can be a string
    return true;
  }

  function detectTypes(val) {
    if (val === '') {
      return { integer: false, real: false, boolean: false, character: false, string: true };
    }
    return {
      integer:   isInteger(val),
      real:      isReal(val),
      boolean:   isBoolean(val),
      character: isCharacter(val),
      string:    isString(val)
    };
  }

  function bestType(val) {
    if (val === '') return 'string';
    var lower = val.toLowerCase();
    if (lower === 'true' || lower === 'false') return 'boolean';
    if (val.length === 1 && !/^\d$/.test(val)) return 'character';
    if (isInteger(val)) return 'integer';
    if (isReal(val)) return 'real';
    return 'string';
  }

  // ── Update type detection display ─────────────────────────────────
  function updateDetection() {
    var val = valueInput.value;
    var types = detectTypes(val);
    var best = val !== '' ? bestType(val) : '';

    var keys = ['integer', 'real', 'boolean', 'character', 'string'];
    for (var i = 0; i < keys.length; i++) {
      var btn = typeButtons[keys[i]];
      btn.classList.remove('match', 'no-match', 'best-match');
      if (val === '') {
        if (keys[i] === 'string') {
          btn.classList.add('match');
        } else {
          btn.classList.add('no-match');
        }
      } else if (types[keys[i]]) {
        if (keys[i] === best) {
          btn.classList.add('best-match');
        } else {
          btn.classList.add('match');
        }
      } else {
        btn.classList.add('no-match');
      }
    }

    updateMemory(val);
    updateCasting();
  }

  // ── Memory representation ─────────────────────────────────────────
  function toBinary8(n) {
    // 8-bit binary, handle negatives with two's complement
    if (n < 0) {
      n = 256 + n;
    }
    return (n & 0xFF).toString(2).padStart(8, '0');
  }

  function toBinary16(n) {
    if (n < 0) {
      n = 65536 + n;
    }
    return (n & 0xFFFF).toString(2).padStart(16, '0');
  }

  function buildBitsHTML(binary) {
    var html = '';
    for (var i = 0; i < binary.length; i++) {
      var cls = binary[i] === '1' ? 'memory-bit one' : 'memory-bit';
      html += '<span class="' + cls + '">' + binary[i] + '</span>';
      if ((i + 1) % 8 === 0 && i < binary.length - 1) {
        html += '<span style="width:var(--sp-2);display:inline-block"></span>';
      }
    }
    return html;
  }

  function updateMemory(val) {
    if (val === '') {
      memorySection.style.display = 'none';
      return;
    }
    memorySection.style.display = '';
    memoryCards.innerHTML = '';

    // As Integer
    if (isInteger(val)) {
      var intVal = parseInt(val, 10);
      var card = document.createElement('div');
      card.className = 'memory-card';
      var bits = intVal >= 0 && intVal <= 255 ? toBinary8(intVal) : toBinary16(intVal);
      card.innerHTML =
        '<div class="memory-card-label">As Integer (binary)</div>' +
        '<div class="memory-card-value">' + intVal + ' = </div>' +
        '<div class="memory-bits" style="margin-top:var(--sp-2)">' + buildBitsHTML(bits) + '</div>';
      memoryCards.appendChild(card);
    }

    // As Character (ASCII)
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      var card2 = document.createElement('div');
      card2.className = 'memory-card';
      card2.innerHTML =
        '<div class="memory-card-label">As Character (ASCII)</div>' +
        '<div class="memory-card-value">\'' + escapeHTML(val) + '\' = ' + code + '</div>' +
        '<div class="memory-bits" style="margin-top:var(--sp-2)">' + buildBitsHTML(toBinary8(code)) + '</div>';
      memoryCards.appendChild(card2);
    } else if (isInteger(val)) {
      var n = parseInt(val, 10);
      if (n >= 0 && n <= 127) {
        var ch = String.fromCharCode(n);
        var displayCh = n === 32 ? 'SP (space)' : (n < 32 ? 'control char' : "'" + escapeHTML(ch) + "'");
        var card2b = document.createElement('div');
        card2b.className = 'memory-card';
        card2b.innerHTML =
          '<div class="memory-card-label">As Character (ASCII)</div>' +
          '<div class="memory-card-value">' + n + ' = ' + displayCh + '</div>' +
          '<div class="memory-bits" style="margin-top:var(--sp-2)">' + buildBitsHTML(toBinary8(n)) + '</div>';
        memoryCards.appendChild(card2b);
      }
    }

    // As String (ASCII codes per character)
    if (val.length >= 1) {
      var card3 = document.createElement('div');
      card3.className = 'memory-card';
      var codesStr = '';
      var bytesHTML = '';
      for (var i = 0; i < val.length && i < 20; i++) {
        var c = val.charCodeAt(i);
        codesStr += (i > 0 ? '  ' : '') + c;
        var charLabel = val[i] === ' ' ? 'SP' : escapeHTML(val[i]);
        bytesHTML +=
          '<div class="memory-byte-group">' +
          '<span class="memory-byte-label">' + charLabel + ':</span>' +
          '<div class="memory-bits">' + buildBitsHTML(toBinary8(c)) + '</div>' +
          '<span style="margin-left:var(--sp-2);font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--clr-text-muted)">' + c + '</span>' +
          '</div>';
      }
      if (val.length > 20) {
        codesStr += '  ...';
      }
      card3.innerHTML =
        '<div class="memory-card-label">As String (ASCII codes)</div>' +
        '<div class="memory-card-value" style="margin-bottom:var(--sp-2)">"' + escapeHTML(val.substring(0, 20)) + (val.length > 20 ? '...' : '') + '" = ' + codesStr + '</div>' +
        bytesHTML;
      memoryCards.appendChild(card3);
    }
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Casting demo ──────────────────────────────────────────────────
  function updateCasting() {
    var val = valueInput.value;
    var target = castSelect.value;

    if (!target || val === '') {
      castingDemo.style.display = 'none';
      return;
    }

    castingDemo.style.display = '';
    castSteps.innerHTML = '';

    var sourceType = bestType(val);
    var steps = [];
    var resultText = '';
    var resultClass = 'success';
    var note = '';

    switch (target) {
      case 'integer':
        steps.push('Read ' + sourceType + ' "' + escapeHTML(val) + '"');
        if (isInteger(val)) {
          steps.push('Parse as integer');
          resultText = parseInt(val, 10).toString();
        } else if (isReal(val)) {
          steps.push('Truncate decimal part');
          resultText = Math.trunc(parseFloat(val)).toString();
          note = 'Decimal part lost';
        } else if (isBoolean(val)) {
          var lower = val.toLowerCase();
          if (lower === 'true') {
            steps.push('True = 1');
            resultText = '1';
          } else if (lower === 'false') {
            steps.push('False = 0');
            resultText = '0';
          } else if (lower === '0' || lower === '1') {
            steps.push('Parse as integer');
            resultText = lower;
          }
        } else {
          steps.push('Cannot parse "' + escapeHTML(val) + '" as integer');
          resultText = 'Error!';
          resultClass = 'error';
        }
        break;

      case 'real':
        steps.push('Read ' + sourceType + ' "' + escapeHTML(val) + '"');
        if (isReal(val) || isInteger(val)) {
          steps.push('Convert to real (float)');
          var f = parseFloat(val);
          resultText = f === Math.floor(f) ? f.toFixed(1) : f.toString();
        } else if (isBoolean(val)) {
          var lower2 = val.toLowerCase();
          if (lower2 === 'true') {
            steps.push('True = 1.0');
            resultText = '1.0';
          } else if (lower2 === 'false') {
            steps.push('False = 0.0');
            resultText = '0.0';
          } else {
            steps.push('Parse numeric value');
            resultText = parseFloat(val).toFixed(1);
          }
        } else {
          steps.push('Cannot parse "' + escapeHTML(val) + '" as real');
          resultText = 'Error!';
          resultClass = 'error';
        }
        break;

      case 'boolean':
        steps.push('Read ' + sourceType + ' "' + escapeHTML(val) + '"');
        var lv = val.toLowerCase();
        if (lv === 'true' || lv === '1') {
          steps.push(lv === '1' ? '1 = True' : 'Already Boolean');
          resultText = 'True';
        } else if (lv === 'false' || lv === '0') {
          steps.push(lv === '0' ? '0 = False' : 'Already Boolean');
          resultText = 'False';
        } else if (isInteger(val)) {
          var n = parseInt(val, 10);
          steps.push(n + ' ≠ 0, so True');
          resultText = 'True';
        } else if (isReal(val)) {
          var rv = parseFloat(val);
          steps.push(rv + (rv !== 0 ? ' ≠ 0, so True' : ' = 0, so False'));
          resultText = rv !== 0 ? 'True' : 'False';
        } else {
          steps.push('Cannot convert "' + escapeHTML(val) + '" to Boolean');
          resultText = 'Error!';
          resultClass = 'error';
        }
        break;

      case 'character':
        steps.push('Read ' + sourceType + ' "' + escapeHTML(val) + '"');
        if (val.length === 1) {
          steps.push('Already a single character');
          resultText = "'" + escapeHTML(val) + "'";
        } else if (isInteger(val)) {
          var code = parseInt(val, 10);
          if (code >= 0 && code <= 127) {
            steps.push('CHR(' + code + ')');
            var ch = String.fromCharCode(code);
            resultText = "'" + escapeHTML(ch) + "' (ASCII " + code + ')';
          } else {
            steps.push('Code ' + code + ' out of ASCII range (0-127)');
            resultText = 'Error!';
            resultClass = 'error';
          }
        } else {
          steps.push('Cannot convert multi-character string to character');
          resultText = 'Error!';
          resultClass = 'error';
        }
        break;

      case 'string':
        steps.push('Read ' + sourceType + ' "' + escapeHTML(val) + '"');
        steps.push('Convert to string representation');
        if (isBoolean(val)) {
          var lb = val.toLowerCase();
          if (lb === 'true' || lb === '1') {
            resultText = '"True"';
          } else if (lb === 'false' || lb === '0') {
            resultText = '"False"';
          } else {
            resultText = '"' + escapeHTML(val) + '"';
          }
        } else {
          resultText = '"' + escapeHTML(val) + '"';
        }
        break;
    }

    // Build DOM
    for (var i = 0; i < steps.length; i++) {
      var stepEl = document.createElement('div');
      stepEl.className = 'cast-step';
      stepEl.style.animationDelay = (i * 0.1) + 's';
      stepEl.innerHTML =
        '<span class="cast-step-num">' + (i + 1) + '</span>' +
        '<span class="cast-step-text">' + steps[i] + '</span>';
      castSteps.appendChild(stepEl);
    }

    var resultEl = document.createElement('div');
    resultEl.className = 'cast-result ' + resultClass;
    resultEl.style.animationDelay = (steps.length * 0.1) + 's';
    var functionName = target === 'integer' ? 'int' :
                       target === 'real' ? 'float' :
                       target === 'boolean' ? 'bool' :
                       target === 'character' ? 'chr' : 'str';
    resultEl.innerHTML = functionName + '("' + escapeHTML(val) + '") = ' + resultText;
    if (note) {
      resultEl.innerHTML += '<div class="cast-note">' + note + '</div>';
    }
    castSteps.appendChild(resultEl);
  }

  // ── Event listeners ───────────────────────────────────────────────
  valueInput.addEventListener('input', function () {
    updateDetection();
  });

  castSelect.addEventListener('change', function () {
    updateCasting();
  });

  // ── Challenge questions ───────────────────────────────────────────
  var CHALLENGES = [
    {
      question: 'What data type should you use for a phone number?',
      options: ['Integer', 'String', 'Real', 'Character'],
      answer: 'String',
      explanation: 'Starts with 0 which would be lost as an integer. No arithmetic needed.'
    },
    {
      question: "What data type for someone's age?",
      options: ['String', 'Real', 'Integer', 'Boolean'],
      answer: 'Integer',
      explanation: 'Whole number, used in calculations.'
    },
    {
      question: 'What data type for a price in pounds?',
      options: ['Integer', 'String', 'Real', 'Boolean'],
      answer: 'Real',
      explanation: 'Needs decimal places for pence (e.g., \u00a39.99).'
    },
    {
      question: "What is int('3.14')?",
      options: ['3.14', '3', 'Error', '"3"'],
      answer: 'Error',
      explanation: 'Cannot directly cast a decimal string to int in most languages (or truncates).'
    },
    {
      question: 'What is str(True)?',
      options: ['"True"', '1', 'True', 'Error'],
      answer: '"True"',
      explanation: 'Boolean converted to its text representation.'
    },
    {
      question: 'What data type for a yes/no survey answer?',
      options: ['String', 'Integer', 'Character', 'Boolean'],
      answer: 'Boolean',
      explanation: 'Only two possible values: True or False.'
    },
    {
      question: "What is ASC('Z')?",
      options: ['26', '90', '122', '65'],
      answer: '90',
      explanation: 'Z is ASCII code 90.'
    },
    {
      question: 'What data type for the number of students in a class?',
      options: ['Real', 'String', 'Integer', 'Boolean'],
      answer: 'Integer',
      explanation: 'Always a whole number.'
    },
    {
      question: 'What is CHR(48)?',
      options: ['"0"', '"A"', '"9"', '"H"'],
      answer: '"0"',
      explanation: 'ASCII code 48 is the character \'0\'.'
    },
    {
      question: 'What data type for an email address?',
      options: ['Character', 'Integer', 'Boolean', 'String'],
      answer: 'String',
      explanation: 'Text containing letters, numbers, and symbols.'
    }
  ];

  var challengeOrder = [];
  var challengeIndex = 0;

  function shuffleChallenges() {
    challengeOrder = [];
    for (var i = 0; i < CHALLENGES.length; i++) {
      challengeOrder.push(i);
    }
    // Fisher-Yates shuffle
    for (var j = challengeOrder.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = challengeOrder[j];
      challengeOrder[j] = challengeOrder[k];
      challengeOrder[k] = tmp;
    }
    challengeIndex = 0;
  }

  function newChallenge() {
    if (challengeIndex >= challengeOrder.length) {
      shuffleChallenges();
    }
    currentChallenge = CHALLENGES[challengeOrder[challengeIndex]];
    challengeIndex++;
    challengeAnswered = false;

    challengeQ.textContent = currentChallenge.question;
    challengeFb.textContent = '';
    challengeFb.className = 'challenge-feedback';
    challengeOpts.innerHTML = '';

    // Render option buttons
    for (var i = 0; i < currentChallenge.options.length; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'challenge-option-btn';
      btn.textContent = currentChallenge.options[i];
      btn.addEventListener('click', handleOptionClick);
      challengeOpts.appendChild(btn);
    }
  }

  function handleOptionClick() {
    if (challengeAnswered) return;
    challengeAnswered = true;

    var chosen = this.textContent;
    var correct = currentChallenge.answer;
    var buttons = challengeOpts.querySelectorAll('.challenge-option-btn');

    // Disable all buttons
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      if (buttons[i].textContent === correct) {
        buttons[i].classList.add('correct');
      }
    }

    if (chosen === correct) {
      this.classList.add('correct');
      streak++;
      challengeFb.textContent = 'Correct! ' + currentChallenge.explanation;
      challengeFb.className = 'challenge-feedback correct';
    } else {
      this.classList.add('incorrect');
      streak = 0;
      challengeFb.textContent = 'Not quite. ' + currentChallenge.explanation;
      challengeFb.className = 'challenge-feedback incorrect';
    }
    challengeStr.textContent = 'Streak: ' + streak;
  }

  challengeNew.addEventListener('click', newChallenge);

  // ── Initialise ────────────────────────────────────────────────────
  updateDetection();
  shuffleChallenges();
  newChallenge();
})();
