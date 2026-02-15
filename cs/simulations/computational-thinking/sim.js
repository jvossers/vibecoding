/**
 * Computational Thinking Workshop — simulation logic.
 *
 * Three tabs: Decomposition, Abstraction, Algorithmic Thinking.
 * DOM-only, reset-only engine (no play/step/speed).
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════
   *  DATA
   * ════════════════════════════════════════════════════════════════ */

  var DECOMP_PROBLEMS = [
    {
      title: 'Build a login system',
      correct: [
        'Design the user interface',
        'Create a database to store usernames and passwords',
        'Write code to check if credentials match',
        'Add password hashing for security',
        'Handle incorrect login attempts',
        'Add a \'forgot password\' feature'
      ],
      distractors: [
        'Choose a colour scheme for the whole website',
        'Decide what products to sell',
        'Set up a delivery system'
      ]
    },
    {
      title: 'Create a weather app',
      correct: [
        'Connect to a weather data API',
        'Design the user interface layout',
        'Display current temperature and conditions',
        'Add a search function for locations',
        'Show a 5-day forecast',
        'Handle errors when data is unavailable'
      ],
      distractors: [
        'Build a shopping cart',
        'Add a music player',
        'Create a chat feature'
      ]
    },
    {
      title: 'Develop a school quiz game',
      correct: [
        'Create a question database',
        'Build a scoring system',
        'Display questions one at a time',
        'Add a timer for each question',
        'Show results at the end',
        'Randomise question order'
      ],
      distractors: [
        'Add a video streaming feature',
        'Build a social network',
        'Create an online shop'
      ]
    },
    {
      title: 'Plan a school event booking system',
      correct: [
        'Store event details in a database',
        'Allow users to view available events',
        'Implement a booking/reservation system',
        'Send confirmation emails',
        'Check for double-bookings',
        'Add a cancellation feature'
      ],
      distractors: [
        'Design a homework tracker',
        'Create a music playlist',
        'Build a GPS navigation system'
      ]
    }
  ];

  var ABSTRACTION_SCENARIOS = [
    {
      title: 'Design a map for a train network',
      necessary: [
        'Station names',
        'Which stations connect to which',
        'Line names/colours',
        'Interchange stations'
      ],
      unnecessary: [
        'Exact geographic distances between stations',
        'The colour of station buildings',
        'How many staff work at each station',
        'The type of trains used on each line',
        'Precise geographic positions of stations',
        'Opening hours of station shops'
      ]
    },
    {
      title: 'Model a car for a racing game',
      necessary: [
        'Speed/acceleration values',
        'Handling/steering response',
        'Brake effectiveness',
        'Visual appearance (3D model)'
      ],
      unnecessary: [
        'Engine oil type',
        'Tyre manufacturer name',
        'VIN (Vehicle Identification Number)',
        'Interior upholstery material',
        'Exact weight of wing mirrors',
        'Service history'
      ]
    },
    {
      title: 'Create a student record system',
      necessary: [
        'Student name',
        'Student ID number',
        'Date of birth',
        'Class/form group',
        'Grades/marks for each subject'
      ],
      unnecessary: [
        'Student\'s favourite colour',
        'How they travel to school',
        'Their pet\'s name',
        'What they had for lunch',
        'Their shoe size',
        'Their favourite TV show'
      ]
    }
  ];

  var ALGORITHMIC_TASKS = [
    {
      title: 'Making a cup of tea',
      steps: [
        'Fill kettle with water',
        'Turn on kettle',
        'Get a mug from the cupboard',
        'Place tea bag in mug',
        'Wait for kettle to boil',
        'Pour boiling water into mug',
        'Wait 2\u20133 minutes for tea to brew',
        'Remove tea bag',
        'Add milk if desired',
        'Stir and serve'
      ]
    },
    {
      title: 'Logging into a website',
      steps: [
        'Open web browser',
        'Type website URL',
        'Press Enter to load page',
        'Click \u2018Login\u2019 button',
        'Enter username',
        'Enter password',
        'Click \u2018Submit\u2019',
        'System checks credentials',
        'If correct, redirect to homepage',
        'Display welcome message'
      ]
    },
    {
      title: 'Binary search for a number',
      steps: [
        'Start with a sorted list',
        'Set low pointer to first element',
        'Set high pointer to last element',
        'Calculate midpoint',
        'Compare target with midpoint value',
        'If target equals midpoint, found it',
        'If target is less, move high pointer to midpoint \u2212 1',
        'If target is greater, move low pointer to midpoint + 1',
        'Repeat from calculate midpoint',
        'If low > high, target is not in the list'
      ]
    }
  ];

  /* ══════════════════════════════════════════════════════════════════
   *  DOM REFS
   * ════════════════════════════════════════════════════════════════ */

  var controlsEl = document.getElementById('controls');
  var tabButtons = document.querySelectorAll('.algo-btn[data-tab]');

  /* ── State ──────────────────────────────────────────────────────── */
  var activeTab = 'decomposition';

  // Decomposition state
  var decompIndex = 0;
  var decompSelected = {};  // card text -> true
  var decompChecked = false;

  // Abstraction state
  var absIndex = 0;
  var absRemoved = {};  // item text -> true
  var absChecked = false;

  // Algorithmic state
  var algoIndex = 0;
  var algoSlots = [];       // ordered list of placed step texts
  var algoAvailable = [];   // remaining step texts to place
  var algoChecked = false;

  /* ── Container for tab content ──────────────────────────────────── */
  var contentWrap = document.createElement('div');
  contentWrap.className = 'ct-content';
  // Insert before controls
  controlsEl.parentNode.insertBefore(contentWrap, controlsEl);

  /* ── Engine (reset-only) ────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  engine
    .onReset(function () {
      decompIndex = 0;
      decompSelected = {};
      decompChecked = false;
      absIndex = 0;
      absRemoved = {};
      absChecked = false;
      algoIndex = 0;
      algoSlots = [];
      algoAvailable = [];
      algoChecked = false;
      renderTab();
    })
    .onRender(function () {
      // no-op — DOM driven by events
    });

  /* ── Tab switching ──────────────────────────────────────────────── */
  for (var t = 0; t < tabButtons.length; t++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        for (var j = 0; j < tabButtons.length; j++) {
          tabButtons[j].classList.toggle('active', tabButtons[j] === btn);
        }
        renderTab();
      });
    })(tabButtons[t]);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  RENDER ROUTER
   * ════════════════════════════════════════════════════════════════ */

  function renderTab() {
    contentWrap.innerHTML = '';
    if (activeTab === 'decomposition') renderDecomposition();
    else if (activeTab === 'abstraction') renderAbstraction();
    else if (activeTab === 'algorithmic') renderAlgorithmic();
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 1: DECOMPOSITION
   * ════════════════════════════════════════════════════════════════ */

  function renderDecomposition() {
    var problem = DECOMP_PROBLEMS[decompIndex];

    // Progress
    var progressBar = buildProgressBar(decompIndex + 1, DECOMP_PROBLEMS.length, 'Problem');
    contentWrap.appendChild(progressBar);

    // Problem card
    var problemCard = el('div', 'ct-problem-card');
    problemCard.innerHTML = '<h3 class="ct-problem-title">' + escHtml(problem.title) + '</h3>' +
      '<p class="ct-problem-desc">Select all the valid sub-problems for this task. Avoid the distractors!</p>';
    contentWrap.appendChild(problemCard);

    // Sub-task cards
    var allCards = [];
    for (var i = 0; i < problem.correct.length; i++) {
      allCards.push({ text: problem.correct[i], isCorrect: true });
    }
    for (var d = 0; d < problem.distractors.length; d++) {
      allCards.push({ text: problem.distractors[d], isCorrect: false });
    }
    SimulationEngine.fisherYates(allCards);

    var grid = el('div', 'ct-card-grid');
    for (var c = 0; c < allCards.length; c++) {
      (function (card) {
        var cardEl = el('button', 'ct-card');
        cardEl.type = 'button';
        cardEl.textContent = card.text;

        if (decompSelected[card.text]) {
          cardEl.classList.add('ct-card--selected');
        }

        if (decompChecked) {
          cardEl.disabled = true;
          if (card.isCorrect && decompSelected[card.text]) {
            cardEl.classList.add('ct-card--correct');
          } else if (card.isCorrect && !decompSelected[card.text]) {
            cardEl.classList.add('ct-card--missed');
          } else if (!card.isCorrect && decompSelected[card.text]) {
            cardEl.classList.add('ct-card--wrong');
          }
        } else {
          cardEl.addEventListener('click', function () {
            if (decompSelected[card.text]) {
              delete decompSelected[card.text];
              cardEl.classList.remove('ct-card--selected');
            } else {
              decompSelected[card.text] = true;
              cardEl.classList.add('ct-card--selected');
            }
          });
        }

        grid.appendChild(cardEl);
      })(allCards[c]);
    }
    contentWrap.appendChild(grid);

    // Action buttons
    var actions = el('div', 'ct-actions');
    if (!decompChecked) {
      var checkBtn = el('button', 'ct-action-btn ct-action-btn--primary');
      checkBtn.type = 'button';
      checkBtn.textContent = 'Check Answers';
      checkBtn.addEventListener('click', function () {
        decompChecked = true;
        renderTab();
      });
      actions.appendChild(checkBtn);
    } else {
      // Show score
      var correctCount = 0;
      var totalCorrect = problem.correct.length;
      var wrongCount = 0;
      for (var k = 0; k < problem.correct.length; k++) {
        if (decompSelected[problem.correct[k]]) correctCount++;
      }
      for (var m = 0; m < problem.distractors.length; m++) {
        if (decompSelected[problem.distractors[m]]) wrongCount++;
      }
      var score = correctCount - wrongCount;
      if (score < 0) score = 0;

      var feedback = el('div', 'ct-feedback');
      feedback.innerHTML = '<span class="ct-feedback-score">You identified <strong>' + correctCount + '/' + totalCorrect + '</strong> correct sub-problems' +
        (wrongCount > 0 ? ' and selected <strong>' + wrongCount + '</strong> distractor' + (wrongCount > 1 ? 's' : '') : '') + '.</span>';
      actions.appendChild(feedback);

      if (decompIndex < DECOMP_PROBLEMS.length - 1) {
        var nextBtn = el('button', 'ct-action-btn ct-action-btn--primary');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next Problem';
        nextBtn.addEventListener('click', function () {
          decompIndex++;
          decompSelected = {};
          decompChecked = false;
          renderTab();
        });
        actions.appendChild(nextBtn);
      } else {
        var doneMsg = el('div', 'ct-done');
        doneMsg.textContent = 'All decomposition problems complete! Press Reset to try again.';
        actions.appendChild(doneMsg);
      }
    }
    contentWrap.appendChild(actions);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 2: ABSTRACTION
   * ════════════════════════════════════════════════════════════════ */

  function renderAbstraction() {
    var scenario = ABSTRACTION_SCENARIOS[absIndex];

    // Progress
    var progressBar = buildProgressBar(absIndex + 1, ABSTRACTION_SCENARIOS.length, 'Scenario');
    contentWrap.appendChild(progressBar);

    // Scenario card
    var scenarioCard = el('div', 'ct-problem-card');
    scenarioCard.innerHTML = '<h3 class="ct-problem-title">' + escHtml(scenario.title) + '</h3>' +
      '<p class="ct-problem-desc">Click on the <strong>unnecessary</strong> details to remove them (abstraction). Keep only what is essential.</p>';
    contentWrap.appendChild(scenarioCard);

    // Abstraction meter
    var totalUnnecessary = scenario.unnecessary.length;
    var removedCount = 0;
    for (var u = 0; u < scenario.unnecessary.length; u++) {
      if (absRemoved[scenario.unnecessary[u]]) removedCount++;
    }
    var pct = totalUnnecessary > 0 ? Math.round((removedCount / totalUnnecessary) * 100) : 0;

    var meterWrap = el('div', 'ct-meter-wrap');
    meterWrap.innerHTML =
      '<div class="ct-meter-label">Abstraction level: <strong>' + pct + '%</strong></div>' +
      '<div class="ct-meter-track"><div class="ct-meter-fill" style="width:' + pct + '%"></div></div>';
    contentWrap.appendChild(meterWrap);

    // All details list
    var allDetails = [];
    for (var n = 0; n < scenario.necessary.length; n++) {
      allDetails.push({ text: scenario.necessary[n], isUnnecessary: false });
    }
    for (var un = 0; un < scenario.unnecessary.length; un++) {
      allDetails.push({ text: scenario.unnecessary[un], isUnnecessary: true });
    }
    SimulationEngine.fisherYates(allDetails);

    var detailList = el('div', 'ct-detail-list');
    for (var di = 0; di < allDetails.length; di++) {
      (function (detail) {
        var itemEl = el('button', 'ct-detail-item');
        itemEl.type = 'button';

        var textSpan = el('span', 'ct-detail-text');
        textSpan.textContent = detail.text;

        var tagSpan = el('span', 'ct-detail-tag');

        if (absRemoved[detail.text]) {
          itemEl.classList.add('ct-detail--removed');
          tagSpan.textContent = 'Removed';
          tagSpan.classList.add('ct-tag--removed');
        }

        if (absChecked) {
          itemEl.disabled = true;
          if (detail.isUnnecessary && absRemoved[detail.text]) {
            itemEl.classList.add('ct-detail--correct');
            tagSpan.textContent = 'Correctly removed';
            tagSpan.className = 'ct-detail-tag ct-tag--correct';
          } else if (detail.isUnnecessary && !absRemoved[detail.text]) {
            itemEl.classList.add('ct-detail--missed');
            tagSpan.textContent = 'Should remove';
            tagSpan.className = 'ct-detail-tag ct-tag--missed';
          } else if (!detail.isUnnecessary && absRemoved[detail.text]) {
            itemEl.classList.add('ct-detail--wrong');
            tagSpan.textContent = 'Needed!';
            tagSpan.className = 'ct-detail-tag ct-tag--wrong';
          } else {
            itemEl.classList.add('ct-detail--kept');
            tagSpan.textContent = 'Correctly kept';
            tagSpan.className = 'ct-detail-tag ct-tag--kept';
          }
        } else {
          itemEl.addEventListener('click', function () {
            if (absRemoved[detail.text]) {
              delete absRemoved[detail.text];
            } else {
              absRemoved[detail.text] = true;
            }
            renderTab();
          });
        }

        itemEl.appendChild(textSpan);
        itemEl.appendChild(tagSpan);
        detailList.appendChild(itemEl);
      })(allDetails[di]);
    }
    contentWrap.appendChild(detailList);

    // Actions
    var actions = el('div', 'ct-actions');
    if (!absChecked) {
      var checkBtn = el('button', 'ct-action-btn ct-action-btn--primary');
      checkBtn.type = 'button';
      checkBtn.textContent = 'Check Abstraction';
      checkBtn.addEventListener('click', function () {
        absChecked = true;
        renderTab();
      });
      actions.appendChild(checkBtn);
    } else {
      // Score
      var correctRemoved = 0;
      var wrongRemoved = 0;
      for (var cr = 0; cr < scenario.unnecessary.length; cr++) {
        if (absRemoved[scenario.unnecessary[cr]]) correctRemoved++;
      }
      for (var wr = 0; wr < scenario.necessary.length; wr++) {
        if (absRemoved[scenario.necessary[wr]]) wrongRemoved++;
      }

      var feedback = el('div', 'ct-feedback');
      feedback.innerHTML = '<span class="ct-feedback-score">You correctly removed <strong>' + correctRemoved + '/' + totalUnnecessary + '</strong> unnecessary details' +
        (wrongRemoved > 0 ? ' but also removed <strong>' + wrongRemoved + '</strong> necessary detail' + (wrongRemoved > 1 ? 's' : '') : '') + '.</span>';
      actions.appendChild(feedback);

      if (absIndex < ABSTRACTION_SCENARIOS.length - 1) {
        var nextBtn = el('button', 'ct-action-btn ct-action-btn--primary');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next Scenario';
        nextBtn.addEventListener('click', function () {
          absIndex++;
          absRemoved = {};
          absChecked = false;
          renderTab();
        });
        actions.appendChild(nextBtn);
      } else {
        var doneMsg = el('div', 'ct-done');
        doneMsg.textContent = 'All abstraction scenarios complete! Press Reset to try again.';
        actions.appendChild(doneMsg);
      }
    }
    contentWrap.appendChild(actions);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 3: ALGORITHMIC THINKING
   * ════════════════════════════════════════════════════════════════ */

  function renderAlgorithmic() {
    var task = ALGORITHMIC_TASKS[algoIndex];

    // Initialise available steps on first render of this task
    if (algoSlots.length === 0 && algoAvailable.length === 0) {
      algoAvailable = task.steps.slice();
      SimulationEngine.fisherYates(algoAvailable);
    }

    // Progress
    var progressBar = buildProgressBar(algoIndex + 1, ALGORITHMIC_TASKS.length, 'Task');
    contentWrap.appendChild(progressBar);

    // Task card
    var taskCard = el('div', 'ct-problem-card');
    taskCard.innerHTML = '<h3 class="ct-problem-title">' + escHtml(task.title) + '</h3>' +
      '<p class="ct-problem-desc">Click a step card below, then click a numbered slot to place it in order. Build the correct algorithm sequence!</p>';
    contentWrap.appendChild(taskCard);

    // Slots area (the ordered sequence the student is building)
    var slotsArea = el('div', 'ct-slots-area');
    var slotsTitle = el('div', 'ct-slots-title');
    slotsTitle.textContent = 'Algorithm sequence (' + algoSlots.length + '/' + task.steps.length + ' placed)';
    slotsArea.appendChild(slotsTitle);

    var slotsGrid = el('div', 'ct-slots-grid');
    for (var s2 = 0; s2 < task.steps.length; s2++) {
      (function (slotIdx) {
        var slotEl = el('div', 'ct-slot');
        var numEl = el('span', 'ct-slot-num');
        numEl.textContent = (slotIdx + 1) + '.';
        slotEl.appendChild(numEl);

        if (slotIdx < algoSlots.length) {
          var textEl = el('span', 'ct-slot-text');
          textEl.textContent = algoSlots[slotIdx];
          slotEl.appendChild(textEl);
          slotEl.classList.add('ct-slot--filled');

          if (algoChecked) {
            slotEl.classList.add(
              algoSlots[slotIdx] === task.steps[slotIdx] ? 'ct-slot--correct' : 'ct-slot--wrong'
            );
          } else {
            slotEl.style.cursor = 'pointer';
            slotEl.title = 'Click to remove';
            slotEl.addEventListener('click', function () {
              var removed = algoSlots.splice(slotIdx, 1)[0];
              algoAvailable.push(removed);
              renderTab();
            });
          }
        } else if (slotIdx === algoSlots.length && !algoChecked) {
          slotEl.classList.add('ct-slot--next');
          var placeholder = el('span', 'ct-slot-placeholder');
          placeholder.textContent = 'Click a step below to place here';
          slotEl.appendChild(placeholder);
        } else {
          slotEl.classList.add('ct-slot--empty');
        }

        slotsGrid.appendChild(slotEl);
      })(s2);
    }
    slotsArea.appendChild(slotsGrid);
    contentWrap.appendChild(slotsArea);

    // Available steps (to pick from)
    if (algoAvailable.length > 0 && !algoChecked) {
      var availTitle = el('div', 'ct-avail-title');
      availTitle.textContent = 'Available steps (click to place):';
      contentWrap.appendChild(availTitle);

      var availGrid = el('div', 'ct-avail-grid');
      for (var a = 0; a < algoAvailable.length; a++) {
        (function (availIdx) {
          var stepBtn = el('button', 'ct-avail-step');
          stepBtn.type = 'button';
          stepBtn.textContent = algoAvailable[availIdx];
          stepBtn.addEventListener('click', function () {
            algoSlots.push(algoAvailable[availIdx]);
            algoAvailable.splice(availIdx, 1);
            renderTab();
          });
          availGrid.appendChild(stepBtn);
        })(a);
      }
      contentWrap.appendChild(availGrid);
    }

    // Actions
    var actions = el('div', 'ct-actions');
    if (!algoChecked) {
      var checkBtn = el('button', 'ct-action-btn ct-action-btn--primary');
      checkBtn.type = 'button';
      checkBtn.textContent = 'Check Order';
      checkBtn.disabled = algoSlots.length < task.steps.length;
      if (algoSlots.length < task.steps.length) {
        checkBtn.classList.add('ct-action-btn--disabled');
      }
      checkBtn.addEventListener('click', function () {
        if (algoSlots.length < task.steps.length) return;
        algoChecked = true;
        renderTab();
      });
      actions.appendChild(checkBtn);
    } else {
      var correctCount = 0;
      for (var ch = 0; ch < task.steps.length; ch++) {
        if (algoSlots[ch] === task.steps[ch]) correctCount++;
      }

      var feedback = el('div', 'ct-feedback');
      feedback.innerHTML = '<span class="ct-feedback-score">You got <strong>' + correctCount + '/' + task.steps.length + '</strong> steps in the correct position.</span>';
      actions.appendChild(feedback);

      if (algoIndex < ALGORITHMIC_TASKS.length - 1) {
        var nextBtn = el('button', 'ct-action-btn ct-action-btn--primary');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next Task';
        nextBtn.addEventListener('click', function () {
          algoIndex++;
          algoSlots = [];
          algoAvailable = [];
          algoChecked = false;
          renderTab();
        });
        actions.appendChild(nextBtn);
      } else {
        var doneMsg = el('div', 'ct-done');
        doneMsg.textContent = 'All algorithmic thinking tasks complete! Press Reset to try again.';
        actions.appendChild(doneMsg);
      }
    }
    contentWrap.appendChild(actions);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  HELPERS
   * ════════════════════════════════════════════════════════════════ */

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildProgressBar(current, total, label) {
    var wrap = el('div', 'ct-progress-wrap');
    var pct = Math.round((current / total) * 100);
    wrap.innerHTML =
      '<div class="ct-progress-label">' + label + ' <strong>' + current + ' / ' + total + '</strong></div>' +
      '<div class="ct-progress-track"><div class="ct-progress-fill" style="width:' + pct + '%"></div></div>';
    return wrap;
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  engine.reset();
})();
