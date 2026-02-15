/**
 * Embedded Systems Identifier — simulation logic.
 *
 * Shows devices one at a time and asks the student to categorise each
 * as embedded or general-purpose. Tracks score, gives feedback, and
 * shows a summary table after all 10 devices.
 */
(function () {
  'use strict';

  /* ── Device data ──────────────────────────────────────────────── */
  var DEVICES = [
    {
      name: 'Washing Machine',
      icon: '\uD83E\uDDFA',
      answer: 'Embedded',
      explanation: 'Built into the appliance with a dedicated function: controlling the wash cycle. Cannot install new software.'
    },
    {
      name: 'Traffic Light',
      icon: '\uD83D\uDEA6',
      answer: 'Embedded',
      explanation: 'Dedicated to controlling light sequences at a junction. Single fixed purpose.'
    },
    {
      name: 'Smartphone',
      icon: '\uD83D\uDCF1',
      answer: 'General-Purpose',
      explanation: 'Can install apps, browse the web, play games \u2014 multiple purposes, not dedicated to one task.'
    },
    {
      name: 'Laptop',
      icon: '\uD83D\uDCBB',
      answer: 'General-Purpose',
      explanation: 'A general-purpose computer that can run many different applications.'
    },
    {
      name: 'Smart Thermostat',
      icon: '\uD83C\uDF21\uFE0F',
      answer: 'Embedded',
      explanation: 'Built into the heating system with a single dedicated function: temperature control.'
    },
    {
      name: 'Car Engine Management',
      icon: '\uD83D\uDE97',
      answer: 'Embedded',
      explanation: 'Embedded within the car to monitor and control the engine. Dedicated, fixed function.'
    },
    {
      name: 'Microwave',
      icon: '\uD83D\uDD25',
      answer: 'Embedded',
      explanation: 'Built into the appliance to control heating time and power. Single dedicated purpose.'
    },
    {
      name: 'Games Console',
      icon: '\uD83C\uDFAE',
      answer: 'General-Purpose',
      explanation: 'Can run many different games and applications. Users can install new software.'
    },
    {
      name: 'Fitness Tracker',
      icon: '\u231A',
      answer: 'Embedded',
      explanation: 'Dedicated to monitoring health metrics. Limited, fixed functionality built into the device.'
    },
    {
      name: 'Digital Watch',
      icon: '\u23F0',
      answer: 'Embedded',
      explanation: 'Dedicated to telling time. Fixed purpose, cannot install arbitrary software.'
    }
  ];

  var TOTAL = DEVICES.length;

  /* ── DOM refs ─────────────────────────────────────────────────── */
  var controlsEl    = document.getElementById('controls');
  var deviceCard    = document.getElementById('device-card');
  var deviceIcon    = document.getElementById('device-icon');
  var deviceName    = document.getElementById('device-name');
  var deviceDesc    = document.getElementById('device-desc');
  var catButtons    = document.getElementById('category-buttons');
  var feedbackArea  = document.getElementById('feedback-area');
  var progressText  = document.getElementById('progress-text');
  var progressFill  = document.getElementById('progress-fill');
  var scoreText     = document.getElementById('score-text');
  var summaryWrap   = document.getElementById('summary-wrap');
  var summaryScore  = document.getElementById('summary-score');
  var summaryBody   = document.getElementById('summary-body');

  var catBtns = catButtons.querySelectorAll('.cat-btn');

  /* ── State ────────────────────────────────────────────────────── */
  var shuffled  = [];   // shuffled copy of DEVICES
  var current   = 0;    // index of current device
  var score     = 0;
  var results   = [];   // { device, userAnswer, correct }
  var answered  = false;

  /* ── Engine (reset-only) ──────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  engine
    .onReset(function () {
      shuffled = DEVICES.slice();
      SimulationEngine.fisherYates(shuffled);
      current  = 0;
      score    = 0;
      results  = [];
      answered = false;

      // Show card and buttons, hide summary
      deviceCard.style.display = '';
      catButtons.style.display = '';
      feedbackArea.style.display = 'none';
      feedbackArea.innerHTML = '';
      summaryWrap.style.display = 'none';
      summaryBody.innerHTML = '';

      enableButtons(true);
      showDevice();
      updateProgress();
    })
    .onRender(function () {
      // no-op for DOM-only sim — state driven by events
    });

  /* ── Button handlers ──────────────────────────────────────────── */
  for (var i = 0; i < catBtns.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        handleAnswer(btn.getAttribute('data-answer'));
      });
    })(catBtns[i]);
  }

  /* ── Answer logic ─────────────────────────────────────────────── */
  function handleAnswer(userAnswer) {
    answered = true;
    enableButtons(false);

    var device  = shuffled[current];
    var correct = (userAnswer === device.answer);

    if (correct) score++;

    results.push({
      device: device,
      userAnswer: userAnswer,
      correct: correct
    });

    // Highlight chosen button
    for (var j = 0; j < catBtns.length; j++) {
      var btn = catBtns[j];
      var btnAnswer = btn.getAttribute('data-answer');
      if (btnAnswer === device.answer) {
        btn.classList.add('cat-btn--correct');
      }
      if (btnAnswer === userAnswer && !correct) {
        btn.classList.add('cat-btn--wrong');
      }
    }

    // Show feedback
    feedbackArea.style.display = 'flex';
    var icon = correct ? '\u2705' : '\u274C';
    var cls  = correct ? 'feedback--correct' : 'feedback--wrong';
    feedbackArea.className = 'feedback-area ' + cls;
    feedbackArea.innerHTML =
      '<span class="feedback-icon">' + icon + '</span>' +
      '<span class="feedback-text">' +
        '<strong>' + (correct ? 'Correct!' : 'Incorrect \u2014 it\'s ' + device.answer + '.') + '</strong> ' +
        device.explanation +
      '</span>';

    updateProgress();

    // Auto-advance after a delay
    setTimeout(function () {
      advance();
    }, correct ? 1500 : 2500);
  }

  function advance() {
    current++;

    if (current >= TOTAL) {
      showSummary();
      return;
    }

    answered = false;
    clearButtonStates();
    enableButtons(true);
    feedbackArea.style.display = 'none';
    feedbackArea.innerHTML = '';
    showDevice();
    updateProgress();
  }

  /* ── Display helpers ──────────────────────────────────────────── */
  function showDevice() {
    var device = shuffled[current];
    deviceIcon.textContent = device.icon;
    deviceName.textContent = device.name;
    deviceDesc.textContent = 'Is this an embedded system or a general-purpose system?';
  }

  function updateProgress() {
    var done = Math.min(results.length, TOTAL);
    progressText.textContent = done + ' / ' + TOTAL;
    progressFill.style.width = (done / TOTAL * 100) + '%';
    scoreText.textContent = score;
  }

  function enableButtons(enabled) {
    for (var i = 0; i < catBtns.length; i++) {
      catBtns[i].disabled = !enabled;
    }
  }

  function clearButtonStates() {
    for (var i = 0; i < catBtns.length; i++) {
      catBtns[i].classList.remove('cat-btn--correct', 'cat-btn--wrong');
    }
  }

  /* ── Summary ──────────────────────────────────────────────────── */
  function showSummary() {
    deviceCard.style.display = 'none';
    catButtons.style.display = 'none';
    feedbackArea.style.display = 'none';

    summaryWrap.style.display = '';
    summaryScore.innerHTML =
      'You scored <strong>' + score + ' / ' + TOTAL + '</strong>' +
      (score === TOTAL ? ' \u2014 Perfect!' : score >= 7 ? ' \u2014 Well done!' : ' \u2014 Keep practising!');

    summaryBody.innerHTML = '';
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var tr = document.createElement('tr');
      var icon = r.correct ? '\u2705' : '\u274C';
      tr.innerHTML =
        '<td>' + r.device.icon + ' ' + r.device.name + '</td>' +
        '<td>' + r.device.answer + '</td>' +
        '<td>' + r.userAnswer + '</td>' +
        '<td>' + icon + '</td>';
      if (!r.correct) {
        tr.className = 'summary-row--wrong';
      }
      summaryBody.appendChild(tr);
    }

    engine.finish();
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  engine.reset();
})();
