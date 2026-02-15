/**
 * Defensive Design Tester
 * Tab 1: Input Validation — 5 validation types with live feedback and pseudocode.
 * Tab 2: Authentication — password strength meter + plaintext vs hashed storage.
 * Tab 3: Code Quality — side-by-side bad/good code with clickable issue discovery.
 */
(function () {
  'use strict';

  /* ── DOM refs ──────────────────────────────────────────────────── */
  var tabBtns        = document.querySelectorAll('.sim-toolbar [data-tab]');
  var validationPanel = document.getElementById('validation-panel');
  var authPanel       = document.getElementById('auth-panel');
  var qualityPanel    = document.getElementById('quality-panel');
  var controlsEl      = document.getElementById('controls');

  /* Auth DOM */
  var passwordInput   = document.getElementById('password-input');
  var strengthFill    = document.getElementById('strength-fill');
  var strengthLabel   = document.getElementById('strength-label');
  var checklistItems  = document.querySelectorAll('#password-checklist li');
  var plainPwEl       = document.getElementById('plain-pw');
  var hashedPwEl      = document.getElementById('hashed-pw');

  /* Quality DOM */
  var exampleBtns     = document.querySelectorAll('.dd-example-btn');
  var badCodeEl       = document.getElementById('bad-code');
  var goodCodeEl      = document.getElementById('good-code');
  var issuesChecklist = document.getElementById('issues-checklist');
  var issuesHint      = document.getElementById('issues-hint');

  /* ── State ─────────────────────────────────────────────────────── */
  var currentTab    = 'validation';
  var currentExample = 0;
  var foundIssues   = [];

  /* ══════════════════════════════════════════════════════════════════
     TAB 1: INPUT VALIDATION
     ══════════════════════════════════════════════════════════════════ */

  var VALIDATIONS = [
    {
      type: 'Range Check',
      label: 'Enter an exam score (0-100)',
      placeholder: 'e.g. 85',
      pseudocode: 'IF score >= 0 AND score <= 100 THEN\n    valid\nELSE\n    invalid',
      validate: function (val) {
        if (val === '') return null;
        var n = Number(val);
        if (isNaN(n)) return false;
        return n >= 0 && n <= 100;
      }
    },
    {
      type: 'Length Check',
      label: 'Enter a username (3-15 characters)',
      placeholder: 'e.g. alice123',
      pseudocode: 'IF LEN(username) >= 3 AND\n   LEN(username) <= 15 THEN\n    valid\nELSE\n    invalid',
      validate: function (val) {
        if (val === '') return null;
        return val.length >= 3 && val.length <= 15;
      }
    },
    {
      type: 'Presence Check',
      label: 'Enter your email (required)',
      placeholder: 'e.g. alice@example.com',
      pseudocode: 'IF email != "" THEN\n    valid\nELSE\n    invalid',
      validate: function (val) {
        if (val === '') return null;
        return val.trim() !== '';
      }
    },
    {
      type: 'Format Check',
      label: 'Enter a date (DD/MM/YYYY)',
      placeholder: 'e.g. 25/12/2025',
      pseudocode: 'IF date MATCHES "DD/MM/YYYY"\n   pattern THEN\n    valid\nELSE\n    invalid',
      validate: function (val) {
        if (val === '') return null;
        return /^\d{2}\/\d{2}\/\d{4}$/.test(val);
      }
    },
    {
      type: 'Type Check',
      label: 'Enter your age (must be a number)',
      placeholder: 'e.g. 16',
      pseudocode: 'IF INPUT is numeric THEN\n    valid\nELSE\n    invalid',
      validate: function (val) {
        if (val === '') return null;
        return /^\d+$/.test(val);
      }
    }
  ];

  /* Build validation fields */
  (function buildValidationFields() {
    var container = document.getElementById('validation-fields');
    var group = document.createElement('div');
    group.className = 'dd-field-group';

    for (var i = 0; i < VALIDATIONS.length; i++) {
      var v = VALIDATIONS[i];
      var card = document.createElement('div');
      card.className = 'dd-field-card';

      /* Left side: type label, input, result */
      var left = document.createElement('div');
      left.className = 'dd-field-left';

      var typeBadge = document.createElement('span');
      typeBadge.className = 'dd-field-type';
      typeBadge.textContent = v.type;

      var label = document.createElement('label');
      label.className = 'dd-label';
      label.textContent = v.label;

      var inputWrap = document.createElement('div');
      inputWrap.className = 'dd-input-wrap';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'dd-input';
      input.placeholder = v.placeholder;
      input.autocomplete = 'off';
      input.spellcheck = false;

      var icon = document.createElement('span');
      icon.className = 'dd-result-icon empty';
      icon.innerHTML = '&#9679;';

      inputWrap.appendChild(input);
      inputWrap.appendChild(icon);

      left.appendChild(typeBadge);
      left.appendChild(label);
      left.appendChild(inputWrap);

      /* Right side: pseudocode */
      var pseudo = document.createElement('div');
      pseudo.className = 'dd-pseudocode';
      pseudo.textContent = v.pseudocode;

      card.appendChild(left);
      card.appendChild(pseudo);
      group.appendChild(card);

      /* Live validation */
      (function (validateFn, iconEl) {
        input.addEventListener('input', function () {
          var result = validateFn(this.value);
          iconEl.className = 'dd-result-icon';
          if (result === null) {
            iconEl.className += ' empty';
            iconEl.innerHTML = '&#9679;';
          } else if (result) {
            iconEl.className += ' valid';
            iconEl.innerHTML = '&#10004;';
          } else {
            iconEl.className += ' invalid';
            iconEl.innerHTML = '&#10008;';
          }
        });
      })(v.validate, icon);
    }

    container.appendChild(group);
  })();

  /* ══════════════════════════════════════════════════════════════════
     TAB 2: AUTHENTICATION
     ══════════════════════════════════════════════════════════════════ */

  function checkPassword(pw) {
    var checks = {
      length:  pw.length >= 8,
      upper:   /[A-Z]/.test(pw),
      lower:   /[a-z]/.test(pw),
      digit:   /\d/.test(pw),
      special: /[!@#$%^&*]/.test(pw)
    };
    var count = 0;
    for (var k in checks) {
      if (checks[k]) count++;
    }
    return { checks: checks, count: count };
  }

  function fakeHash(str) {
    if (!str) return '---';
    /* Simple visual hash — not cryptographic, just for demonstration */
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    /* Generate a hex-like string */
    var hex = '';
    for (var j = 0; j < 4; j++) {
      var segment = ((h >>> (j * 8)) & 0xff).toString(16);
      if (segment.length < 2) segment = '0' + segment;
      hex += segment;
    }
    /* Extend it to look more like a real hash */
    var h2 = 0xa5b3c7d1;
    for (var m = 0; m < str.length; m++) {
      h2 ^= str.charCodeAt(m);
      h2 = Math.imul(h2, 0x01000193);
    }
    for (var n = 0; n < 4; n++) {
      var seg2 = ((h2 >>> (n * 8)) & 0xff).toString(16);
      if (seg2.length < 2) seg2 = '0' + seg2;
      hex += seg2;
    }
    return hex.substring(0, 4) + '...' + hex.substring(hex.length - 4);
  }

  function updateAuth() {
    var pw = passwordInput.value;
    var result = checkPassword(pw);

    /* Update checklist */
    checklistItems.forEach(function (li) {
      var key = li.getAttribute('data-check');
      var iconEl = li.querySelector('.dd-check-icon');
      if (result.checks[key]) {
        li.classList.add('met');
        iconEl.innerHTML = '&#9745;';
      } else {
        li.classList.remove('met');
        iconEl.innerHTML = '&#9744;';
      }
    });

    /* Strength bar */
    var pct = 0;
    var label = '---';
    var color = 'var(--clr-border)';

    if (pw.length > 0) {
      if (result.count <= 1) {
        pct = 20; label = 'Weak'; color = '#ef4444';
      } else if (result.count <= 2) {
        pct = 40; label = 'Weak'; color = '#ef4444';
      } else if (result.count <= 3) {
        pct = 60; label = 'Medium'; color = '#f59e0b';
      } else if (result.count <= 4) {
        pct = 80; label = 'Strong'; color = '#10b981';
      } else {
        pct = 100; label = 'Very Strong'; color = '#10b981';
      }
    }

    strengthFill.style.width = pct + '%';
    strengthFill.style.backgroundColor = color;
    strengthLabel.textContent = label;
    strengthLabel.style.color = pw.length > 0 ? color : 'var(--clr-text-muted)';

    /* Storage comparison */
    plainPwEl.textContent = pw || '---';
    hashedPwEl.textContent = fakeHash(pw);
  }

  passwordInput.addEventListener('input', updateAuth);

  /* ══════════════════════════════════════════════════════════════════
     TAB 3: CODE QUALITY
     ══════════════════════════════════════════════════════════════════ */

  var CODE_EXAMPLES = [
    {
      title: 'Variable Naming',
      bad: [
        'x = input("Enter value")',
        'y = x * 1.2',
        'print(y)'
      ],
      good: [
        'price = input("Enter price")',
        'price_with_vat = price * 1.2',
        'print(price_with_vat)'
      ],
      issues: [
        { lines: [0, 1, 2], text: 'Meaningless variable names (x, y) make code hard to understand' },
        { lines: [0, 1, 2], text: 'No comments explaining what the code does' }
      ],
      /* Map: which bad lines trigger which issue indices */
      lineIssues: {
        0: [0, 1],
        1: [0, 1],
        2: [0, 1]
      }
    },
    {
      title: 'Indentation & Structure',
      bad: [
        'if age>=18:',
        'print("Adult")',
        'else:',
        'print("Minor")',
        'if student==True:',
        'print("Student discount")'
      ],
      good: [
        'if age >= 18:',
        '    print("Adult")',
        'else:',
        '    print("Minor")',
        '    if student == True:',
        '        print("Student discount")'
      ],
      issues: [
        { lines: [1, 3, 5], text: 'No indentation makes the code structure unclear' },
        { lines: [0, 4], text: 'No spacing around operators (>=, ==) reduces readability' }
      ],
      lineIssues: {
        0: [1],
        1: [0],
        2: [],
        3: [0],
        4: [1],
        5: [0]
      }
    },
    {
      title: 'Comments & Documentation',
      bad: [
        'def calc(a,b,c):',
        '    return (-b+(b**2-4*a*c)**0.5)/(2*a)'
      ],
      good: [
        'def solve_quadratic(a, b, c):',
        '    # Calculate one root using the',
        '    # quadratic formula',
        '    # a, b, c are coefficients of',
        '    # ax\u00B2 + bx + c = 0',
        '    discriminant = b**2 - 4*a*c',
        '    root = (-b + discriminant**0.5) / (2*a)',
        '    return root'
      ],
      issues: [
        { lines: [0], text: 'Cryptic function name "calc" gives no indication of purpose' },
        { lines: [0, 1], text: 'No comments or parameter explanation' },
        { lines: [1], text: 'Complex formula crammed into one line with no breakdown' }
      ],
      lineIssues: {
        0: [0, 1],
        1: [1, 2]
      }
    },
    {
      title: 'Input Validation',
      bad: [
        'age = int(input("Age: "))',
        'print("You are " + str(age))'
      ],
      good: [
        'age_input = input("Age: ")',
        'if age_input.isdigit() and \\',
        '   0 < int(age_input) < 150:',
        '    age = int(age_input)',
        '    print("You are " + str(age))',
        'else:',
        '    print("Please enter a valid age")'
      ],
      issues: [
        { lines: [0], text: 'No input validation \u2014 program crashes on non-numeric input' },
        { lines: [0, 1], text: 'No error handling for invalid data types' }
      ],
      lineIssues: {
        0: [0, 1],
        1: [1]
      }
    }
  ];

  function loadCodeExample(idx) {
    currentExample = idx;
    foundIssues = [];

    var ex = CODE_EXAMPLES[idx];

    /* Update nav buttons */
    exampleBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-example'), 10) === idx);
    });

    /* Build bad code with clickable lines */
    badCodeEl.innerHTML = '';
    for (var i = 0; i < ex.bad.length; i++) {
      var span = document.createElement('span');
      span.className = 'dd-code-line';
      span.textContent = ex.bad[i];
      span.setAttribute('data-line', i);

      /* Highlight lines that have issues */
      var lineIssues = ex.lineIssues[i];
      if (lineIssues && lineIssues.length > 0) {
        span.classList.add('highlighted');
      }

      (function (lineIdx) {
        span.addEventListener('click', function () {
          revealIssuesForLine(lineIdx);
        });
      })(i);

      badCodeEl.appendChild(span);
    }

    /* Build good code (hidden initially) */
    goodCodeEl.innerHTML = '';
    for (var j = 0; j < ex.good.length; j++) {
      var gSpan = document.createElement('span');
      gSpan.className = 'dd-good-line';
      gSpan.textContent = ex.good[j];
      goodCodeEl.appendChild(gSpan);
    }

    /* Build issues checklist */
    issuesChecklist.innerHTML = '';
    for (var k = 0; k < ex.issues.length; k++) {
      var li = document.createElement('li');
      li.className = 'hidden-issue';
      li.innerHTML = '<span class="dd-check-icon">&#9744;</span> ' +
        '<span class="dd-issue-text">???</span>';
      li.setAttribute('data-issue', k);
      issuesChecklist.appendChild(li);
    }

    issuesHint.style.display = '';
  }

  function revealIssuesForLine(lineIdx) {
    var ex = CODE_EXAMPLES[currentExample];
    var lineIssues = ex.lineIssues[lineIdx];
    if (!lineIssues || lineIssues.length === 0) return;

    var anyNew = false;
    for (var i = 0; i < lineIssues.length; i++) {
      var issueIdx = lineIssues[i];
      if (foundIssues.indexOf(issueIdx) === -1) {
        foundIssues.push(issueIdx);
        anyNew = true;

        /* Update issue checklist */
        var li = issuesChecklist.querySelector('[data-issue="' + issueIdx + '"]');
        if (li) {
          li.classList.remove('hidden-issue');
          li.classList.add('revealed-issue');
          var iconEl = li.querySelector('.dd-check-icon');
          iconEl.innerHTML = '&#9745;';
          var textEl = li.querySelector('.dd-issue-text');
          textEl.textContent = ex.issues[issueIdx].text;
        }
      }
    }

    if (anyNew) {
      /* Mark clicked bad code line as found */
      var lineEl = badCodeEl.querySelector('[data-line="' + lineIdx + '"]');
      if (lineEl) {
        lineEl.classList.remove('highlighted');
        lineEl.classList.add('found');
      }

      /* Reveal good code lines */
      updateGoodCodeReveal();

      /* Check if all issues found */
      if (foundIssues.length >= ex.issues.length) {
        issuesHint.textContent = 'All issues found! Well done.';
        /* Mark all remaining bad lines as found */
        var allLines = badCodeEl.querySelectorAll('.dd-code-line.highlighted');
        for (var j = 0; j < allLines.length; j++) {
          allLines[j].classList.remove('highlighted');
          allLines[j].classList.add('found');
        }
        /* Reveal all good code */
        var allGood = goodCodeEl.querySelectorAll('.dd-good-line');
        for (var k = 0; k < allGood.length; k++) {
          allGood[k].classList.add('revealed');
        }
      }
    }
  }

  function updateGoodCodeReveal() {
    var ex = CODE_EXAMPLES[currentExample];
    var totalIssues = ex.issues.length;
    if (totalIssues === 0) return;

    var ratio = foundIssues.length / totalIssues;
    var goodLines = goodCodeEl.querySelectorAll('.dd-good-line');
    var linesToReveal = Math.ceil(ratio * goodLines.length);

    for (var i = 0; i < goodLines.length; i++) {
      if (i < linesToReveal) {
        goodLines[i].classList.add('revealed');
      }
    }
  }

  /* Example button clicks */
  exampleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      loadCodeExample(parseInt(btn.getAttribute('data-example'), 10));
    });
  });

  /* ══════════════════════════════════════════════════════════════════
     TAB SWITCHING
     ══════════════════════════════════════════════════════════════════ */

  function showTab(tab) {
    currentTab = tab;
    tabBtns.forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('[data-tab="' + tab + '"]').classList.add('active');

    validationPanel.style.display = tab === 'validation' ? '' : 'none';
    authPanel.style.display       = tab === 'auth'       ? '' : 'none';
    qualityPanel.style.display    = tab === 'quality'    ? '' : 'none';
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showTab(btn.getAttribute('data-tab'));
    });
  });

  /* ══════════════════════════════════════════════════════════════════
     ENGINE (reset-only)
     ══════════════════════════════════════════════════════════════════ */

  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  engine
    .onReset(function () {
      /* Reset validation inputs */
      var inputs = validationPanel.querySelectorAll('.dd-input');
      inputs.forEach(function (inp) {
        inp.value = '';
        inp.dispatchEvent(new Event('input'));
      });

      /* Reset password */
      passwordInput.value = '';
      updateAuth();

      /* Reset code quality */
      loadCodeExample(currentExample);
    })
    .onRender(function () {
      /* No continuous rendering needed — DOM-only sim */
    });

  /* ── Init ──────────────────────────────────────────────────────── */
  loadCodeExample(0);
  engine.render();
})();
