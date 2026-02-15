/**
 * Testing & Test Data Workshop — simulation logic.
 *
 * Three tabs: Error Types, Test Data Categories, Design Tests.
 * DOM-only, reset-only engine (no play/step/speed).
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════
   *  DATA — Tab 1: Error Types
   * ════════════════════════════════════════════════════════════════ */

  var ERROR_SCENARIOS = [
    {
      code: 'print("Hello World"',
      type: 'syntax',
      explanation: 'Missing closing bracket on the print statement.',
      corrected: 'print("Hello World")'
    },
    {
      code: 'average = num1 + num2 + num3 / 3',
      type: 'logic',
      explanation: 'Operator precedence means only num3 is divided by 3. Brackets are needed around the addition.',
      corrected: 'average = (num1 + num2 + num3) / 3'
    },
    {
      code: 'for i in range(10)\n    print(i)',
      type: 'syntax',
      explanation: 'Missing colon at the end of the for statement.',
      corrected: 'for i in range(10):\n    print(i)'
    },
    {
      code: 'total = 0\nfor i in range(1, 10):\n    total = total + i\nprint("Sum of 1 to 10:", total)',
      type: 'logic',
      explanation: 'range(1, 10) goes up to 9, not 10. Should be range(1, 11) to include 10.',
      corrected: 'total = 0\nfor i in range(1, 11):\n    total = total + i\nprint("Sum of 1 to 10:", total)'
    },
    {
      code: 'if score > 50\n    print("Pass")\nelse:\n    print("Fail")',
      type: 'syntax',
      explanation: 'Missing colon after the if condition.',
      corrected: 'if score > 50:\n    print("Pass")\nelse:\n    print("Fail")'
    },
    {
      code: 'def is_even(number):\n    if number % 2 == 1:\n        return True\n    else:\n        return False',
      type: 'logic',
      explanation: 'Logic reversed \u2014 checking if remainder is 1 (odd) and returning True. Should check == 0.',
      corrected: 'def is_even(number):\n    if number % 2 == 0:\n        return True\n    else:\n        return False'
    },
    {
      code: 'name = input("Enter name: ")\nprint("Hello" + name))',
      type: 'syntax',
      explanation: 'Extra closing bracket on the print statement.',
      corrected: 'name = input("Enter name: ")\nprint("Hello " + name)'
    },
    {
      code: '# Find the largest of three numbers\nlargest = a\nif b > a:\n    largest = b\nif c > a:\n    largest = c',
      type: 'logic',
      explanation: 'Second comparison should be "if c > largest:" not "if c > a:". If b is the largest and c > a but c < b, c would incorrectly replace b.',
      corrected: '# Find the largest of three numbers\nlargest = a\nif b > a:\n    largest = b\nif c > largest:\n    largest = c'
    }
  ];

  /* ══════════════════════════════════════════════════════════════════
   *  DATA — Tab 2: Test Data Categories
   * ════════════════════════════════════════════════════════════════ */

  var TEST_DATA_SPECS = [
    {
      title: 'Score 0\u2013100',
      description: 'A program accepts exam scores between 0 and 100 inclusive (whole numbers only).',
      values: [
        { display: '50',    category: 'Normal',    reason: 'Typical valid value within range' },
        { display: '0',     category: 'Boundary',  reason: 'At lower edge of range' },
        { display: '100',   category: 'Boundary',  reason: 'At upper edge of range' },
        { display: '1',     category: 'Boundary',  reason: 'Just inside lower edge' },
        { display: '99',    category: 'Boundary',  reason: 'Just inside upper edge' },
        { display: '-1',    category: 'Invalid',   reason: 'Just outside lower boundary' },
        { display: '101',   category: 'Invalid',   reason: 'Just outside upper boundary' },
        { display: '-50',   category: 'Invalid',   reason: 'Well outside range (below)' },
        { display: '200',   category: 'Invalid',   reason: 'Well outside range (above)' },
        { display: '"abc"', category: 'Erroneous', reason: 'Wrong data type entirely' },
        { display: '""',    category: 'Erroneous', reason: 'Empty / no input' },
        { display: '3.5',   category: 'Invalid',   reason: 'Expecting integer, got decimal' }
      ]
    },
    {
      title: 'Username (3\u201315 characters, letters only)',
      description: 'A program accepts a username that must be 3\u201315 characters long and contain only letters.',
      values: [
        { display: '"John"',             category: 'Normal',    reason: 'Typical valid username' },
        { display: '"abc"',              category: 'Boundary',  reason: 'Minimum length (3 chars)' },
        { display: '"abcdefghijklmno"',  category: 'Boundary',  reason: 'Maximum length (15 chars)' },
        { display: '"ab"',              category: 'Invalid',   reason: 'Too short (2 chars)' },
        { display: '"abcdefghijklmnop"', category: 'Invalid',   reason: 'Too long (16 chars)' },
        { display: '"John123"',          category: 'Invalid',   reason: 'Contains digits' },
        { display: '""',                 category: 'Erroneous', reason: 'Empty input' },
        { display: '12345',              category: 'Erroneous', reason: 'Wrong data type (number)' }
      ]
    }
  ];

  var CATEGORIES = ['Normal', 'Boundary', 'Invalid', 'Erroneous'];

  /* ══════════════════════════════════════════════════════════════════
   *  DATA — Tab 3: Design Tests
   * ════════════════════════════════════════════════════════════════ */

  var DESIGN_SCENARIOS = [
    {
      title: 'Grade Calculator',
      description: 'A program accepts a percentage (0\u2013100) and displays "Fail" for 0\u201339, "Pass" for 40\u201369, and "Merit" for 70\u2013100.',
      minRows: 8,
      requirements: {
        Normal: 1,
        Boundary: 2,
        Invalid: 1,
        Erroneous: 1
      },
      validate: function (value, category, expected) {
        var v = value.trim();
        var c = category;
        var e = expected.trim().toLowerCase();
        var num = parseFloat(v);

        // Check category correctness
        if (c === 'Normal') {
          if (isNaN(num) || num < 0 || num > 100) return { ok: false, msg: 'Normal data should be a typical value in range 0\u2013100.' };
          if (num === 0 || num === 39 || num === 40 || num === 69 || num === 70 || num === 100) return { ok: false, msg: 'Values like ' + v + ' are boundary values, not normal.' };
          // Check expected output
          if (num >= 0 && num <= 39 && e !== 'fail') return { ok: false, msg: 'For ' + v + ', expected output should be "Fail".' };
          if (num >= 40 && num <= 69 && e !== 'pass') return { ok: false, msg: 'For ' + v + ', expected output should be "Pass".' };
          if (num >= 70 && num <= 100 && e !== 'merit') return { ok: false, msg: 'For ' + v + ', expected output should be "Merit".' };
          return { ok: true, msg: 'Good normal test case.' };
        }
        if (c === 'Boundary') {
          var boundaries = [0, 1, 39, 40, 69, 70, 99, 100];
          if (isNaN(num) || boundaries.indexOf(num) === -1) return { ok: false, msg: 'Boundary values for this spec include: 0, 1, 39, 40, 69, 70, 99, 100.' };
          if (num >= 0 && num <= 39 && e !== 'fail') return { ok: false, msg: 'For ' + v + ', expected output should be "Fail".' };
          if (num >= 40 && num <= 69 && e !== 'pass') return { ok: false, msg: 'For ' + v + ', expected output should be "Pass".' };
          if (num >= 70 && num <= 100 && e !== 'merit') return { ok: false, msg: 'For ' + v + ', expected output should be "Merit".' };
          return { ok: true, msg: 'Good boundary test case.' };
        }
        if (c === 'Invalid') {
          if (isNaN(num)) return { ok: false, msg: 'Invalid data should be the correct type (number) but outside the valid range.' };
          if (num >= 0 && num <= 100) return { ok: false, msg: 'Value ' + v + ' is within range \u2014 that is normal or boundary, not invalid.' };
          if (e === '' || e.length === 0) return { ok: false, msg: 'Please provide an expected output (e.g., "Error" or "Invalid input").' };
          return { ok: true, msg: 'Good invalid test case.' };
        }
        if (c === 'Erroneous') {
          if (!isNaN(num) && v !== '') return { ok: false, msg: 'Erroneous data should be the completely wrong type (e.g., "abc", "").' };
          if (e === '' || e.length === 0) return { ok: false, msg: 'Please provide an expected output (e.g., "Error" or "Invalid input").' };
          return { ok: true, msg: 'Good erroneous test case.' };
        }
        return { ok: false, msg: 'Please select a category.' };
      }
    },
    {
      title: 'Password Strength Checker',
      description: 'A program accepts a password that must be at least 8 characters long and outputs "Strong" if it contains uppercase, lowercase, and a digit, or "Weak" otherwise.',
      minRows: 8,
      requirements: {
        Normal: 1,
        Boundary: 2,
        Invalid: 1,
        Erroneous: 1
      },
      validate: function (value, category, expected) {
        var v = value.trim();
        var c = category;
        var e = expected.trim().toLowerCase();

        if (c === 'Normal') {
          if (v.length < 8) return { ok: false, msg: 'Normal data should meet the minimum length of 8 characters.' };
          if (v.length === 8) return { ok: false, msg: 'A value of exactly 8 characters is a boundary value.' };
          if (e === '' || e.length === 0) return { ok: false, msg: 'Please provide an expected output ("Strong" or "Weak").' };
          return { ok: true, msg: 'Good normal test case.' };
        }
        if (c === 'Boundary') {
          if (v.length !== 7 && v.length !== 8 && v.length !== 9) return { ok: false, msg: 'Boundary values should be at or around 8 characters (7, 8, or 9 chars).' };
          if (e === '' || e.length === 0) return { ok: false, msg: 'Please provide an expected output.' };
          return { ok: true, msg: 'Good boundary test case.' };
        }
        if (c === 'Invalid') {
          if (v.length >= 8) return { ok: false, msg: 'Invalid data should fail the length requirement (fewer than 8 characters).' };
          if (v === '') return { ok: false, msg: 'An empty value is erroneous, not invalid.' };
          if (e === '' || e.length === 0) return { ok: false, msg: 'Please provide an expected output.' };
          return { ok: true, msg: 'Good invalid test case.' };
        }
        if (c === 'Erroneous') {
          if (e === '' || e.length === 0) return { ok: false, msg: 'Please provide an expected output (e.g., "Error").' };
          return { ok: true, msg: 'Good erroneous test case.' };
        }
        return { ok: false, msg: 'Please select a category.' };
      }
    }
  ];

  /* ══════════════════════════════════════════════════════════════════
   *  DOM REFS & STATE
   * ════════════════════════════════════════════════════════════════ */

  var controlsEl = document.getElementById('controls');
  var tabButtons = document.querySelectorAll('.algo-btn[data-tab]');

  var activeTab = 'errors';

  // Tab 1 state
  var errIndex = 0;
  var errAnswers = [];    // 'syntax' | 'logic' | null for each scenario
  var errScore = 0;

  // Tab 2 state
  var specIndex = 0;
  var tdValueIndex = 0;
  var tdShuffled = [];
  var tdAnswers = {};     // { valueDisplay: chosenCategory }
  var tdCorrect = 0;
  var tdTotal = 0;
  var tdFinished = false;

  // Tab 3 state
  var designIndex = 0;
  var designRows = [];
  var designChecked = false;
  var designResults = [];

  /* ── Content container ─────────────────────────────────────────── */
  var contentWrap = document.createElement('div');
  contentWrap.className = 'tw-content';
  controlsEl.parentNode.insertBefore(contentWrap, controlsEl);

  /* ── Engine (reset-only) ───────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  engine
    .onReset(function () {
      errIndex = 0;
      errAnswers = [];
      for (var i = 0; i < ERROR_SCENARIOS.length; i++) errAnswers.push(null);
      errScore = 0;

      specIndex = 0;
      tdValueIndex = 0;
      tdShuffled = [];
      tdAnswers = {};
      tdCorrect = 0;
      tdTotal = 0;
      tdFinished = false;
      initTestDataSpec();

      designIndex = 0;
      designRows = [];
      designChecked = false;
      designResults = [];
      initDesignRows();

      renderTab();
    })
    .onRender(function () {
      // no-op — DOM driven by events
    });

  /* ── Tab switching ─────────────────────────────────────────────── */
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
    if (activeTab === 'errors') renderErrors();
    else if (activeTab === 'testdata') renderTestData();
    else if (activeTab === 'design') renderDesign();
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 1: ERROR TYPES
   * ════════════════════════════════════════════════════════════════ */

  function renderErrors() {
    var scenario = ERROR_SCENARIOS[errIndex];
    var answer = errAnswers[errIndex];

    // Progress
    var progress = buildProgressBar(errIndex + 1, ERROR_SCENARIOS.length, 'Scenario');
    contentWrap.appendChild(progress);

    // Score
    var answeredCount = 0;
    errScore = 0;
    for (var i = 0; i < errAnswers.length; i++) {
      if (errAnswers[i] !== null) {
        answeredCount++;
        if (errAnswers[i] === ERROR_SCENARIOS[i].type) errScore++;
      }
    }
    if (answeredCount > 0) {
      var scoreEl = el('div', 'tw-score');
      scoreEl.innerHTML = 'Score: <strong>' + errScore + '/' + answeredCount + '</strong> correct';
      contentWrap.appendChild(scoreEl);
    }

    // Code panel
    var codeCard = el('div', 'tw-code-card');
    var codeLabel = el('div', 'tw-code-label');
    codeLabel.textContent = 'Spot the error in this code:';
    codeCard.appendChild(codeLabel);

    var codePre = el('pre', 'tw-code-block');
    var codeEl = el('code', '');
    codeEl.textContent = scenario.code;
    codePre.appendChild(codeEl);
    codeCard.appendChild(codePre);
    contentWrap.appendChild(codeCard);

    // Answer buttons
    if (answer === null) {
      var prompt = el('div', 'tw-prompt');
      prompt.textContent = 'What type of error is this?';
      contentWrap.appendChild(prompt);

      var btnRow = el('div', 'tw-btn-row');

      var syntaxBtn = el('button', 'tw-choice-btn tw-choice-syntax');
      syntaxBtn.type = 'button';
      syntaxBtn.textContent = 'Syntax Error';
      syntaxBtn.addEventListener('click', function () {
        errAnswers[errIndex] = 'syntax';
        renderTab();
      });

      var logicBtn = el('button', 'tw-choice-btn tw-choice-logic');
      logicBtn.type = 'button';
      logicBtn.textContent = 'Logic Error';
      logicBtn.addEventListener('click', function () {
        errAnswers[errIndex] = 'logic';
        renderTab();
      });

      btnRow.appendChild(syntaxBtn);
      btnRow.appendChild(logicBtn);
      contentWrap.appendChild(btnRow);
    } else {
      // Show result
      var isCorrect = answer === scenario.type;

      var resultCard = el('div', 'tw-result-card ' + (isCorrect ? 'tw-result--correct' : 'tw-result--wrong'));
      var resultIcon = isCorrect ? '\u2713' : '\u2717';
      var resultText = isCorrect ? 'Correct!' : 'Incorrect \u2014 this is a ' + scenario.type + ' error.';
      resultCard.innerHTML = '<span class="tw-result-icon">' + resultIcon + '</span> ' +
        '<span class="tw-result-text">' + escHtml(resultText) + '</span>';
      contentWrap.appendChild(resultCard);

      // Explanation
      var explCard = el('div', 'tw-explanation');
      explCard.innerHTML = '<strong>Explanation:</strong> ' + escHtml(scenario.explanation);
      contentWrap.appendChild(explCard);

      // Corrected code
      var corrCard = el('div', 'tw-code-card tw-corrected');
      var corrLabel = el('div', 'tw-code-label');
      corrLabel.textContent = 'Corrected code:';
      corrCard.appendChild(corrLabel);

      var corrPre = el('pre', 'tw-code-block tw-code-block--correct');
      var corrCode = el('code', '');
      corrCode.textContent = scenario.corrected;
      corrPre.appendChild(corrCode);
      corrCard.appendChild(corrPre);
      contentWrap.appendChild(corrCard);
    }

    // Nav buttons
    var navRow = el('div', 'tw-nav-row');

    if (errIndex > 0) {
      var prevBtn = el('button', 'tw-nav-btn');
      prevBtn.type = 'button';
      prevBtn.textContent = '\u2190 Previous';
      prevBtn.addEventListener('click', function () {
        errIndex--;
        renderTab();
      });
      navRow.appendChild(prevBtn);
    } else {
      navRow.appendChild(el('span', '')); // spacer
    }

    if (errIndex < ERROR_SCENARIOS.length - 1) {
      var nextBtn = el('button', 'tw-nav-btn tw-nav-btn--primary');
      nextBtn.type = 'button';
      nextBtn.textContent = 'Next \u2192';
      nextBtn.addEventListener('click', function () {
        errIndex++;
        renderTab();
      });
      navRow.appendChild(nextBtn);
    } else {
      // Final summary
      if (answeredCount === ERROR_SCENARIOS.length) {
        var doneMsg = el('div', 'tw-done');
        doneMsg.innerHTML = 'All done! Final score: <strong>' + errScore + '/' + ERROR_SCENARIOS.length + '</strong>. Press Reset to try again.';
        navRow.appendChild(doneMsg);
      } else {
        navRow.appendChild(el('span', '')); // spacer
      }
    }
    contentWrap.appendChild(navRow);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 2: TEST DATA CATEGORIES
   * ════════════════════════════════════════════════════════════════ */

  function initTestDataSpec() {
    var spec = TEST_DATA_SPECS[specIndex];
    tdShuffled = spec.values.slice();
    SimulationEngine.fisherYates(tdShuffled);
    tdValueIndex = 0;
    tdAnswers = {};
    tdCorrect = 0;
    tdTotal = 0;
    tdFinished = false;
  }

  function renderTestData() {
    var spec = TEST_DATA_SPECS[specIndex];

    // Spec selector
    var specProgress = buildProgressBar(specIndex + 1, TEST_DATA_SPECS.length, 'Specification');
    contentWrap.appendChild(specProgress);

    // Specification card
    var specCard = el('div', 'tw-spec-card');
    specCard.innerHTML = '<h3 class="tw-spec-title">' + escHtml(spec.title) + '</h3>' +
      '<p class="tw-spec-desc">' + escHtml(spec.description) + '</p>';
    contentWrap.appendChild(specCard);

    // Score
    if (tdTotal > 0) {
      var scoreEl = el('div', 'tw-score');
      scoreEl.innerHTML = 'Score: <strong>' + tdCorrect + '/' + tdTotal + '</strong> correct';
      contentWrap.appendChild(scoreEl);
    }

    if (!tdFinished) {
      // Current value card
      var currentValue = tdShuffled[tdValueIndex];
      var valueCard = el('div', 'tw-value-card');
      valueCard.innerHTML = '<div class="tw-value-label">Classify this test value:</div>' +
        '<div class="tw-value-display">' + escHtml(currentValue.display) + '</div>' +
        '<div class="tw-value-counter">Value ' + (tdValueIndex + 1) + ' of ' + tdShuffled.length + '</div>';
      contentWrap.appendChild(valueCard);

      // Category bins
      var binRow = el('div', 'tw-bin-row');
      for (var c = 0; c < CATEGORIES.length; c++) {
        (function (cat) {
          var binBtn = el('button', 'tw-bin-btn tw-bin--' + cat.toLowerCase());
          binBtn.type = 'button';
          binBtn.textContent = cat;
          binBtn.addEventListener('click', function () {
            var correct = currentValue.category;
            var isRight = cat === correct;
            tdAnswers[currentValue.display] = { chosen: cat, correct: correct, right: isRight, reason: currentValue.reason };
            tdTotal++;
            if (isRight) tdCorrect++;

            // Show quick feedback then advance
            showValueFeedback(isRight, correct, currentValue.reason);
          });
          binRow.appendChild(binBtn);
        })(CATEGORIES[c]);
      }
      contentWrap.appendChild(binRow);

      // Feedback area
      var feedbackArea = el('div', 'tw-value-feedback');
      feedbackArea.id = 'td-feedback';
      contentWrap.appendChild(feedbackArea);

    } else {
      // Summary table
      renderTestDataSummary(spec);
    }
  }

  function showValueFeedback(isRight, correctCat, reason) {
    var feedbackArea = document.getElementById('td-feedback');
    if (!feedbackArea) return;

    var cls = isRight ? 'tw-feedback--correct' : 'tw-feedback--wrong';
    var icon = isRight ? '\u2713' : '\u2717';
    var msg = isRight
      ? 'Correct! This is ' + correctCat + ' data.'
      : 'Not quite \u2014 this is ' + correctCat + ' data.';

    feedbackArea.innerHTML = '';
    var feedEl = el('div', 'tw-inline-feedback ' + cls);
    feedEl.innerHTML = '<span class="tw-fb-icon">' + icon + '</span> ' +
      '<span>' + escHtml(msg) + '</span>' +
      '<div class="tw-fb-reason">' + escHtml(reason) + '</div>';
    feedbackArea.appendChild(feedEl);

    // Auto-advance after 1.2s
    setTimeout(function () {
      tdValueIndex++;
      if (tdValueIndex >= tdShuffled.length) {
        tdFinished = true;
      }
      renderTab();
    }, 1200);
  }

  function renderTestDataSummary(spec) {
    var summaryTitle = el('div', 'tw-summary-title');
    summaryTitle.innerHTML = 'Final score: <strong>' + tdCorrect + '/' + tdTotal + '</strong>';
    contentWrap.appendChild(summaryTitle);

    // Summary table
    var tableWrap = el('div', 'tw-table-wrap');
    var table = el('table', 'comparison-table');
    var thead = el('thead', '');
    var headRow = el('tr', '');
    var headers = ['Value', 'Your Answer', 'Correct', 'Reason'];
    for (var h = 0; h < headers.length; h++) {
      var th = el('th', '');
      th.textContent = headers[h];
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el('tbody', '');
    for (var v = 0; v < tdShuffled.length; v++) {
      var val = tdShuffled[v];
      var ans = tdAnswers[val.display];
      var tr = el('tr', ans && ans.right ? 'tw-row-correct' : 'tw-row-wrong');

      var tdVal = el('td', 'mono');
      tdVal.textContent = val.display;
      tr.appendChild(tdVal);

      var tdChosen = el('td', '');
      tdChosen.textContent = ans ? ans.chosen : '\u2014';
      tr.appendChild(tdChosen);

      var tdCorrectCell = el('td', '');
      tdCorrectCell.textContent = val.category;
      tr.appendChild(tdCorrectCell);

      var tdReason = el('td', '');
      tdReason.textContent = val.reason;
      tr.appendChild(tdReason);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    contentWrap.appendChild(tableWrap);

    // Next spec button
    var actions = el('div', 'tw-actions');
    if (specIndex < TEST_DATA_SPECS.length - 1) {
      var nextBtn = el('button', 'tw-nav-btn tw-nav-btn--primary');
      nextBtn.type = 'button';
      nextBtn.textContent = 'Next Specification \u2192';
      nextBtn.addEventListener('click', function () {
        specIndex++;
        initTestDataSpec();
        renderTab();
      });
      actions.appendChild(nextBtn);
    } else {
      var doneMsg = el('div', 'tw-done');
      doneMsg.textContent = 'All specifications complete! Press Reset to try again.';
      actions.appendChild(doneMsg);
    }
    contentWrap.appendChild(actions);
  }

  /* ══════════════════════════════════════════════════════════════════
   *  TAB 3: DESIGN TESTS
   * ════════════════════════════════════════════════════════════════ */

  function initDesignRows() {
    designRows = [];
    designChecked = false;
    designResults = [];
    var scenario = DESIGN_SCENARIOS[designIndex];
    for (var i = 0; i < scenario.minRows; i++) {
      designRows.push({ value: '', category: '', expected: '' });
    }
  }

  function renderDesign() {
    var scenario = DESIGN_SCENARIOS[designIndex];

    // Progress
    var progress = buildProgressBar(designIndex + 1, DESIGN_SCENARIOS.length, 'Scenario');
    contentWrap.appendChild(progress);

    // Scenario card
    var scenarioCard = el('div', 'tw-spec-card');
    scenarioCard.innerHTML = '<h3 class="tw-spec-title">' + escHtml(scenario.title) + '</h3>' +
      '<p class="tw-spec-desc">' + escHtml(scenario.description) + '</p>' +
      '<p class="tw-spec-hint">Fill in the test table below. You need at least ' +
      scenario.requirements.Normal + ' normal, ' +
      scenario.requirements.Boundary + ' boundary, ' +
      scenario.requirements.Invalid + ' invalid, and ' +
      scenario.requirements.Erroneous + ' erroneous test case(s).</p>';
    contentWrap.appendChild(scenarioCard);

    // Test table
    var tableWrap = el('div', 'tw-table-wrap tw-design-table-wrap');
    var table = el('table', 'comparison-table tw-design-table');
    var thead = el('thead', '');
    var headRow = el('tr', '');
    var headers = ['#', 'Test Value', 'Category', 'Expected Output', ''];
    for (var h = 0; h < headers.length; h++) {
      var th = el('th', '');
      th.textContent = headers[h];
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = el('tbody', '');
    for (var r = 0; r < designRows.length; r++) {
      (function (rowIdx) {
        var row = designRows[rowIdx];
        var result = designChecked && designResults[rowIdx] ? designResults[rowIdx] : null;

        var tr = el('tr', '');
        if (result) {
          tr.className = result.ok ? 'tw-row-correct' : 'tw-row-wrong';
        }

        // Row number
        var tdNum = el('td', 'tw-row-num');
        tdNum.textContent = rowIdx + 1;
        tr.appendChild(tdNum);

        // Value input
        var tdValue = el('td', '');
        var valInput = el('input', 'tw-design-input');
        valInput.type = 'text';
        valInput.placeholder = 'e.g. 50';
        valInput.value = row.value;
        valInput.disabled = designChecked;
        valInput.addEventListener('input', function () {
          designRows[rowIdx].value = valInput.value;
        });
        tdValue.appendChild(valInput);
        tr.appendChild(tdValue);

        // Category select
        var tdCat = el('td', '');
        var catSelect = el('select', 'tw-design-select');
        var defaultOpt = el('option', '');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Select...';
        catSelect.appendChild(defaultOpt);
        for (var ci = 0; ci < CATEGORIES.length; ci++) {
          var opt = el('option', '');
          opt.value = CATEGORIES[ci];
          opt.textContent = CATEGORIES[ci];
          if (row.category === CATEGORIES[ci]) opt.selected = true;
          catSelect.appendChild(opt);
        }
        catSelect.disabled = designChecked;
        catSelect.addEventListener('change', function () {
          designRows[rowIdx].category = catSelect.value;
        });
        tdCat.appendChild(catSelect);
        tr.appendChild(tdCat);

        // Expected output
        var tdExp = el('td', '');
        var expInput = el('input', 'tw-design-input');
        expInput.type = 'text';
        expInput.placeholder = 'e.g. Pass';
        expInput.value = row.expected;
        expInput.disabled = designChecked;
        expInput.addEventListener('input', function () {
          designRows[rowIdx].expected = expInput.value;
        });
        tdExp.appendChild(expInput);
        tr.appendChild(tdExp);

        // Feedback column
        var tdFb = el('td', 'tw-design-fb');
        if (result) {
          var fbSpan = el('span', result.ok ? 'tw-fb-ok' : 'tw-fb-err');
          fbSpan.textContent = result.msg;
          tdFb.appendChild(fbSpan);
        }
        tr.appendChild(tdFb);

        tbody.appendChild(tr);
      })(r);
    }
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    contentWrap.appendChild(tableWrap);

    // Actions
    var actions = el('div', 'tw-actions');

    if (!designChecked) {
      // Add row button
      var addBtn = el('button', 'tw-nav-btn');
      addBtn.type = 'button';
      addBtn.textContent = '+ Add Row';
      addBtn.addEventListener('click', function () {
        designRows.push({ value: '', category: '', expected: '' });
        renderTab();
      });
      actions.appendChild(addBtn);

      // Check button
      var checkBtn = el('button', 'tw-nav-btn tw-nav-btn--primary');
      checkBtn.type = 'button';
      checkBtn.textContent = 'Check Test Plan';
      checkBtn.addEventListener('click', function () {
        checkDesignPlan();
        renderTab();
      });
      actions.appendChild(checkBtn);
    } else {
      // Show summary and next
      var okCount = 0;
      var filledCount = 0;
      for (var ri = 0; ri < designResults.length; ri++) {
        if (designResults[ri]) {
          filledCount++;
          if (designResults[ri].ok) okCount++;
        }
      }

      var summaryEl = el('div', 'tw-summary-title');
      summaryEl.innerHTML = 'Result: <strong>' + okCount + '/' + filledCount + '</strong> test cases valid';
      actions.appendChild(summaryEl);

      // Coverage check
      var coverageEl = el('div', 'tw-coverage');
      var counts = { Normal: 0, Boundary: 0, Invalid: 0, Erroneous: 0 };
      for (var cr = 0; cr < designRows.length; cr++) {
        if (designResults[cr] && designResults[cr].ok && designRows[cr].category) {
          counts[designRows[cr].category]++;
        }
      }
      var coverageHtml = '<strong>Coverage:</strong> ';
      var allMet = true;
      for (var cat in scenario.requirements) {
        var met = counts[cat] >= scenario.requirements[cat];
        if (!met) allMet = false;
        coverageHtml += '<span class="' + (met ? 'tw-cov-met' : 'tw-cov-miss') + '">' +
          cat + ': ' + counts[cat] + '/' + scenario.requirements[cat] +
          (met ? ' \u2713' : ' \u2717') + '</span> ';
      }
      coverageEl.innerHTML = coverageHtml;
      actions.appendChild(coverageEl);

      // Try again or next
      var retryBtn = el('button', 'tw-nav-btn');
      retryBtn.type = 'button';
      retryBtn.textContent = 'Try Again';
      retryBtn.addEventListener('click', function () {
        initDesignRows();
        renderTab();
      });
      actions.appendChild(retryBtn);

      if (designIndex < DESIGN_SCENARIOS.length - 1) {
        var nextBtn = el('button', 'tw-nav-btn tw-nav-btn--primary');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next Scenario \u2192';
        nextBtn.addEventListener('click', function () {
          designIndex++;
          initDesignRows();
          renderTab();
        });
        actions.appendChild(nextBtn);
      } else if (allMet) {
        var doneMsg = el('div', 'tw-done');
        doneMsg.textContent = 'All scenarios complete! Press Reset to try again.';
        actions.appendChild(doneMsg);
      }
    }
    contentWrap.appendChild(actions);
  }

  function checkDesignPlan() {
    var scenario = DESIGN_SCENARIOS[designIndex];
    designResults = [];
    designChecked = true;

    for (var i = 0; i < designRows.length; i++) {
      var row = designRows[i];
      if (row.value.trim() === '' && row.category === '' && row.expected.trim() === '') {
        designResults.push(null); // empty row, skip
        continue;
      }
      if (row.value.trim() === '') {
        designResults.push({ ok: false, msg: 'No test value provided.' });
        continue;
      }
      if (row.category === '') {
        designResults.push({ ok: false, msg: 'No category selected.' });
        continue;
      }
      if (row.expected.trim() === '') {
        designResults.push({ ok: false, msg: 'No expected output provided.' });
        continue;
      }
      designResults.push(scenario.validate(row.value, row.category, row.expected));
    }
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
    var wrap = el('div', 'tw-progress-wrap');
    var pct = Math.round((current / total) * 100);
    wrap.innerHTML =
      '<div class="tw-progress-label">' + label + ' <strong>' + current + ' / ' + total + '</strong></div>' +
      '<div class="tw-progress-track"><div class="tw-progress-fill" style="width:' + pct + '%"></div></div>';
    return wrap;
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  engine.reset();
})();
