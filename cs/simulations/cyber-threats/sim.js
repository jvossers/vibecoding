/**
 * Cyber Threats Simulator — simulation logic.
 *
 * DOM-only, reset-only engine. Walkthroughs with CSS fade-in animations,
 * brute-force live animation, DoS/DDoS visual, SQL injection demo, quiz mode.
 */
(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────────────── */
  var controlsEl        = document.getElementById('controls');
  var mainToolbar       = document.getElementById('main-toolbar');
  var malwareSubtoolbar = document.getElementById('malware-subtoolbar');
  var walkthroughPanel  = document.getElementById('walkthrough-panel');
  var bruteForcePanel   = document.getElementById('brute-force-panel');
  var dosPanel          = document.getElementById('dos-panel');
  var sqlPanel          = document.getElementById('sql-panel');
  var quizPanel         = document.getElementById('quiz-panel');
  var modeBtns          = mainToolbar.querySelectorAll('[data-mode]');
  var malwareBtns       = malwareSubtoolbar.querySelectorAll('[data-malware]');

  /* ── All panels ─────────────────────────────────────────────────── */
  var panels = [walkthroughPanel, bruteForcePanel, dosPanel, sqlPanel, quizPanel];

  /* ── State ──────────────────────────────────────────────────────── */
  var currentMode    = 'malware';
  var currentMalware = 'virus';
  var bruteTimer     = null;
  var dosTimer       = null;

  /* ── Attack walkthrough data ────────────────────────────────────── */
  var walkthroughs = {
    virus: {
      title: 'Virus',
      desc: 'A program that attaches itself to legitimate files and spreads when the host program is executed.',
      icon: 'malware-icon',
      steps: [
        { title: 'Infected file downloaded', detail: 'The user downloads a file from an untrusted source. The virus code is hidden inside.' },
        { title: 'Virus attaches to programs', detail: 'The virus inserts its code into other executable files and documents on the system.' },
        { title: 'Host program executed', detail: 'When the user runs an infected program, the virus code activates alongside it.' },
        { title: 'Spreads and corrupts', detail: 'The virus replicates to other files, potentially corrupting data, deleting files, or slowing the system.' }
      ]
    },
    worm: {
      title: 'Worm',
      desc: 'Self-replicating malware that spreads across networks without needing user interaction.',
      icon: 'malware-icon',
      steps: [
        { title: 'Enters via network vulnerability', detail: 'The worm exploits a security flaw in network software or an operating system to gain entry.' },
        { title: 'Self-replicates automatically', detail: 'Unlike a virus, the worm copies itself without needing a host program or user action.' },
        { title: 'Spreads across the network', detail: 'The worm scans for other vulnerable machines and transmits copies of itself to them.' },
        { title: 'Consumes resources', detail: 'Mass replication consumes bandwidth and processing power, dramatically slowing systems and networks.' }
      ]
    },
    trojan: {
      title: 'Trojan',
      desc: 'Malware disguised as legitimate software that creates a backdoor for attackers.',
      icon: 'malware-icon',
      steps: [
        { title: 'Appears as legitimate software', detail: 'The trojan is disguised as a useful application, such as a free game or utility tool.' },
        { title: 'User installs it willingly', detail: 'Because it looks genuine, the user downloads and installs it without suspicion.' },
        { title: 'Hidden payload activates', detail: 'Once installed, the malicious code runs silently in the background without the user knowing.' },
        { title: 'Backdoor created', detail: 'The trojan opens a backdoor allowing attackers remote access to the system, data theft, or further malware installation.' }
      ]
    },
    spyware: {
      title: 'Spyware',
      desc: 'Software that secretly monitors user activity and sends data to attackers.',
      icon: 'malware-icon',
      steps: [
        { title: 'Installed secretly', detail: 'Spyware is often bundled with free software or arrives through drive-by downloads without user knowledge.' },
        { title: 'Monitors user activity', detail: 'The spyware silently tracks everything the user does — websites visited, applications used, files accessed.' },
        { title: 'Records sensitive data', detail: 'Keyloggers capture every keystroke, including passwords, credit card numbers, and private messages.' },
        { title: 'Data sent to attacker', detail: 'All collected information is transmitted to the attacker\'s server, enabling identity theft or fraud.' }
      ]
    },
    ransomware: {
      title: 'Ransomware',
      desc: 'Malware that encrypts files and demands payment for the decryption key.',
      icon: 'malware-icon',
      steps: [
        { title: 'Delivered via phishing email', detail: 'The ransomware arrives as an attachment or link in a convincing phishing email.' },
        { title: 'Encrypts all user files', detail: 'Once activated, it rapidly encrypts documents, photos, and other files using strong encryption.' },
        { title: 'Ransom demand displayed', detail: 'A message demands payment (often in cryptocurrency) in exchange for the decryption key.' },
        { title: 'Data at risk', detail: 'Files remain locked unless the ransom is paid or data is restored from a backup. Paying does not guarantee recovery.' }
      ]
    },
    'social-engineering': {
      title: 'Social Engineering',
      desc: 'Manipulating people into revealing confidential information or performing actions that compromise security.',
      icon: 'social-icon',
      steps: [
        { title: 'Attacker researches target', detail: 'The attacker gathers information about the victim from social media, company websites, and other public sources.' },
        { title: 'Creates convincing pretext', detail: 'A fake email, phone call, or website is crafted to look legitimate — often impersonating a trusted organisation.' },
        { title: 'Victim reveals information', detail: 'The victim is tricked into giving away passwords, personal details, or clicking a malicious link.' },
        { title: 'Attacker gains access', detail: 'Using the stolen information, the attacker accesses systems, steals data, or launches further attacks.' }
      ]
    }
  };

  /* ── Quiz data ──────────────────────────────────────────────────── */
  var quizQuestions = [
    { scenario: 'An employee receives an email that looks like it\'s from their bank asking them to verify their account details.', answer: 'Social Engineering' },
    { scenario: 'A program encrypts all files on a computer and demands payment to unlock them.', answer: 'Ransomware' },
    { scenario: 'Malicious code is hidden inside a free game download.', answer: 'Trojan' },
    { scenario: 'A hacker tries every possible combination to guess a user\'s password.', answer: 'Brute Force' },
    { scenario: 'A website\'s login form is exploited by entering database commands instead of a username.', answer: 'SQL Injection' },
    { scenario: 'A program secretly records everything typed on the keyboard.', answer: 'Spyware' },
    { scenario: 'Thousands of compromised computers simultaneously send requests to crash a website.', answer: 'DDoS' },
    { scenario: 'A program spreads across a network without any user interaction.', answer: 'Worm' },
    { scenario: 'A malicious program attaches itself to documents and spreads when users share those files.', answer: 'Virus' },
    { scenario: 'An attacker phones the IT help desk pretending to be a senior manager to get a password reset.', answer: 'Social Engineering' }
  ];

  var quizOptions = ['Virus', 'Worm', 'Trojan', 'Spyware', 'Ransomware', 'Social Engineering', 'Brute Force', 'SQL Injection', 'DDoS', 'DoS'];

  var quizState = {
    questions: [],
    current: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    answered: false
  };

  /* ── Brute force state ──────────────────────────────────────────── */
  var bruteState = {
    password: 'ab12',
    attempts: 0,
    found: false,
    currentGuess: '',
    charSet: 'abcdefghijklmnopqrstuvwxyz0123456789',
    selectedOption: '4-char'
  };

  var brutePasswords = {
    '4-char':   { pw: 'ab12', chars: 'abcdefghijklmnopqrstuvwxyz0123456789', label: '4-char (a-z, 0-9)', time: '~1.7 million combinations' },
    '8-char':   { pw: 'pa55w0rd', chars: 'abcdefghijklmnopqrstuvwxyz0123456789', label: '8-char (a-z, 0-9)', time: '~2.8 trillion combinations' },
    '12-char':  { pw: 'S3cur3!P@ss#', chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%', label: '12-char (mixed + symbols)', time: '~10^21 combinations' }
  };

  /* ── DoS state ──────────────────────────────────────────────────── */
  var dosState = {
    mode: 'normal',  // normal, dos, ddos
    arrowCount: 0
  };

  /* ── Engine (reset-only) ────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  engine.onReset(function () {
    stopAllTimers();
    renderCurrentMode();
  });

  engine.onRender(function () {
    // no-op — rendering done by mode functions
  });

  /* ── Mode switching ─────────────────────────────────────────────── */
  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      stopAllTimers();
      renderCurrentMode();
    });
  });

  /* ── Malware sub-buttons ────────────────────────────────────────── */
  malwareBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      malwareBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentMalware = btn.getAttribute('data-malware');
      renderWalkthrough(currentMalware);
    });
  });

  /* ── Helpers ────────────────────────────────────────────────────── */
  function showPanel(panel) {
    panels.forEach(function (p) { p.style.display = 'none'; });
    panel.style.display = '';
  }

  function stopAllTimers() {
    if (bruteTimer) { clearInterval(bruteTimer); bruteTimer = null; }
    if (dosTimer) { clearInterval(dosTimer); dosTimer = null; }
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ── Render current mode ────────────────────────────────────────── */
  function renderCurrentMode() {
    malwareSubtoolbar.style.display = currentMode === 'malware' ? '' : 'none';

    switch (currentMode) {
      case 'malware':
        showPanel(walkthroughPanel);
        renderWalkthrough(currentMalware);
        break;
      case 'social-engineering':
        showPanel(walkthroughPanel);
        renderWalkthrough('social-engineering');
        break;
      case 'brute-force':
        showPanel(bruteForcePanel);
        renderBruteForce();
        break;
      case 'dos':
        showPanel(dosPanel);
        renderDoS();
        break;
      case 'sql-injection':
        showPanel(sqlPanel);
        renderSQLInjection();
        break;
      case 'quiz':
        showPanel(quizPanel);
        initQuiz();
        break;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     WALKTHROUGH RENDERER
     ═══════════════════════════════════════════════════════════════════ */
  function renderWalkthrough(key) {
    var data = walkthroughs[key];
    if (!data) return;

    var html = '<div class="attack-header">';
    html += '<div class="attack-icon ' + data.icon + '">';

    // Icon symbols
    var icons = {
      virus: '\u26A0', worm: '\uD83D\uDC1B', trojan: '\uD83C\uDFC7',
      spyware: '\uD83D\uDD75', ransomware: '\uD83D\uDD12',
      'social-engineering': '\uD83C\uDFA3'
    };
    html += icons[key] || '\u26A0';
    html += '</div>';
    html += '<div class="attack-header-text">';
    html += '<h3>' + data.title + '</h3>';
    html += '<p>' + data.desc + '</p>';
    html += '</div></div>';

    html += '<div class="steps-container">';
    for (var i = 0; i < data.steps.length; i++) {
      var step = data.steps[i];
      html += '<div class="step-card">';
      html += '<span class="step-number">' + (i + 1) + '</span>';
      html += '<div class="step-content">';
      html += '<h4>' + step.title + '</h4>';
      html += '<p>' + step.detail + '</p>';
      html += '</div></div>';
    }
    html += '</div>';

    walkthroughPanel.innerHTML = html;
  }

  /* ═══════════════════════════════════════════════════════════════════
     BRUTE FORCE RENDERER
     ═══════════════════════════════════════════════════════════════════ */
  function renderBruteForce() {
    var opt = brutePasswords[bruteState.selectedOption];
    bruteState.password = opt.pw;
    bruteState.charSet = opt.chars;
    bruteState.attempts = 0;
    bruteState.found = false;
    bruteState.currentGuess = '';

    var html = '<div class="attack-header">';
    html += '<div class="attack-icon brute-icon">\uD83D\uDD11</div>';
    html += '<div class="attack-header-text">';
    html += '<h3>Brute Force Attack</h3>';
    html += '<p>Trying every possible combination to crack a password. Watch how password length and complexity affect cracking time.</p>';
    html += '</div></div>';

    html += '<div class="brute-demo">';

    // Selector buttons
    html += '<div class="brute-selector">';
    var optKeys = ['4-char', '8-char', '12-char'];
    for (var i = 0; i < optKeys.length; i++) {
      var k = optKeys[i];
      var bpw = brutePasswords[k];
      var cls = k === bruteState.selectedOption ? ' active' : '';
      html += '<button class="brute-opt-btn' + cls + '" data-brute-opt="' + k + '">' + bpw.label + '</button>';
    }
    html += '</div>';

    // Display
    html += '<div class="brute-display">';
    html += '<div class="brute-target-label">Target password</div>';
    html += '<div class="brute-target" id="brute-target">';
    for (var j = 0; j < bruteState.password.length; j++) {
      html += '<span>*</span>';
    }
    html += '</div>';
    html += '<div class="brute-attempt" id="brute-attempt">';
    for (var m = 0; m < bruteState.password.length; m++) {
      html += '<span class="brute-char">_</span>';
    }
    html += '</div>';
    html += '<div class="brute-counter" id="brute-counter">Attempts: 0</div>';
    html += '<div class="brute-status" id="brute-status"></div>';
    html += '</div>';

    // Start button
    html += '<button class="algo-btn" id="brute-start-btn" style="align-self:center">Start Cracking</button>';

    // Comparison table
    html += '<div class="brute-comparison">';
    html += '<h4>Time Comparison</h4>';
    html += '<table class="comparison-table">';
    html += '<thead><tr><th>Password</th><th>Charset</th><th>Combinations</th><th>Est. Time</th></tr></thead>';
    html += '<tbody>';
    html += '<tr><td>4-char</td><td>a-z, 0-9</td><td>36^4 = ~1.7M</td><td>Seconds</td></tr>';
    html += '<tr><td>8-char</td><td>a-z, 0-9</td><td>36^8 = ~2.8T</td><td>Days-Weeks</td></tr>';
    html += '<tr><td>12-char</td><td>A-Z, a-z, 0-9, symbols</td><td>66^12 = ~10^21</td><td>Millions of years</td></tr>';
    html += '</tbody></table>';
    html += '</div>';

    html += '</div>';

    bruteForcePanel.innerHTML = html;

    // Wire up selector buttons
    var optBtns = bruteForcePanel.querySelectorAll('[data-brute-opt]');
    optBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        optBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        bruteState.selectedOption = btn.getAttribute('data-brute-opt');
        stopAllTimers();
        renderBruteForce();
      });
    });

    // Wire up start button
    var startBtn = document.getElementById('brute-start-btn');
    startBtn.addEventListener('click', function () {
      startBruteForce();
    });
  }

  function startBruteForce() {
    if (bruteTimer) { clearInterval(bruteTimer); bruteTimer = null; }

    var pw = bruteState.password;
    var chars = bruteState.charSet;
    bruteState.attempts = 0;
    bruteState.found = false;

    var attemptEl  = document.getElementById('brute-attempt');
    var counterEl  = document.getElementById('brute-counter');
    var statusEl   = document.getElementById('brute-status');
    var targetEl   = document.getElementById('brute-target');
    var startBtn   = document.getElementById('brute-start-btn');

    if (!attemptEl) return;

    startBtn.disabled = true;
    startBtn.textContent = 'Cracking...';
    statusEl.textContent = 'Attempting combinations...';
    statusEl.className = 'brute-status running';

    // For short passwords, simulate finding each char
    // For long passwords, simulate the speed difference
    var foundChars = [];
    for (var i = 0; i < pw.length; i++) foundChars.push(false);
    var currentCharIdx = 0;
    var currentCharAttempt = 0;

    bruteTimer = setInterval(function () {
      if (bruteState.found) {
        clearInterval(bruteTimer);
        bruteTimer = null;
        return;
      }

      // Simulate multiple attempts per tick for speed
      var attemptsPerTick = bruteState.selectedOption === '4-char' ? 5 : 3;

      for (var t = 0; t < attemptsPerTick; t++) {
        bruteState.attempts++;
        currentCharAttempt++;

        // Build current guess display
        var charEls = attemptEl.querySelectorAll('.brute-char');
        var guessIdx = currentCharAttempt % chars.length;
        var guessChar = chars[guessIdx];

        // Update the current char being tested
        if (currentCharIdx < pw.length) {
          for (var c = 0; c < charEls.length; c++) {
            if (c < currentCharIdx) {
              charEls[c].textContent = pw[c];
              charEls[c].className = 'brute-char correct';
            } else if (c === currentCharIdx) {
              charEls[c].textContent = guessChar;
              charEls[c].className = 'brute-char testing';
            } else {
              charEls[c].textContent = chars[Math.floor(Math.random() * chars.length)];
              charEls[c].className = 'brute-char';
            }
          }

          // Check if we found the right char
          var targetCharIdx = chars.indexOf(pw[currentCharIdx]);
          if (targetCharIdx >= 0 && currentCharAttempt >= targetCharIdx + 1) {
            foundChars[currentCharIdx] = true;
            currentCharIdx++;
            currentCharAttempt = 0;

            if (currentCharIdx >= pw.length) {
              // All chars found!
              bruteState.found = true;
              for (var f = 0; f < charEls.length; f++) {
                charEls[f].textContent = pw[f];
                charEls[f].className = 'brute-char correct';
              }
              // Reveal target
              targetEl.innerHTML = '';
              for (var r = 0; r < pw.length; r++) {
                var sp = document.createElement('span');
                sp.textContent = pw[r];
                targetEl.appendChild(sp);
              }
              statusEl.textContent = 'Password cracked!';
              statusEl.className = 'brute-status cracked';
              startBtn.disabled = false;
              startBtn.textContent = 'Start Cracking';
              clearInterval(bruteTimer);
              bruteTimer = null;
              break;
            }
          }

          // For 8-char and 12-char, simulate early stop (demo purposes)
          if (bruteState.selectedOption !== '4-char' && bruteState.attempts > 300) {
            // Quickly find remaining chars for demo
            for (var q = currentCharIdx; q < pw.length; q++) {
              foundChars[q] = true;
            }
            bruteState.found = true;

            for (var ff = 0; ff < charEls.length; ff++) {
              charEls[ff].textContent = pw[ff];
              charEls[ff].className = 'brute-char correct';
            }
            targetEl.innerHTML = '';
            for (var rr = 0; rr < pw.length; rr++) {
              var sp2 = document.createElement('span');
              sp2.textContent = pw[rr];
              targetEl.appendChild(sp2);
            }
            var demoNote = bruteState.selectedOption === '8-char'
              ? 'Password cracked! (demo accelerated \u2014 would take days/weeks in reality)'
              : 'Password cracked! (demo accelerated \u2014 would take millions of years in reality)';
            statusEl.textContent = demoNote;
            statusEl.className = 'brute-status cracked';
            startBtn.disabled = false;
            startBtn.textContent = 'Start Cracking';
            clearInterval(bruteTimer);
            bruteTimer = null;
            break;
          }
        }
      }

      counterEl.textContent = 'Attempts: ' + bruteState.attempts.toLocaleString();
    }, 50);
  }

  /* ═══════════════════════════════════════════════════════════════════
     DoS / DDoS RENDERER
     ═══════════════════════════════════════════════════════════════════ */
  function renderDoS() {
    dosState.mode = 'normal';
    dosState.arrowCount = 0;

    var html = '<div class="attack-header">';
    html += '<div class="attack-icon dos-icon">\uD83D\uDCA5</div>';
    html += '<div class="attack-header-text">';
    html += '<h3>DoS / DDoS Attack</h3>';
    html += '<p>Flooding a server with requests to make it unavailable to legitimate users.</p>';
    html += '</div></div>';

    html += '<div class="dos-visual">';

    // Controls
    html += '<div class="dos-controls">';
    html += '<button class="dos-btn active" data-dos-mode="normal">Normal Traffic</button>';
    html += '<button class="dos-btn" data-dos-mode="dos">DoS Attack</button>';
    html += '<button class="dos-btn" data-dos-mode="ddos">DDoS Attack</button>';
    html += '</div>';

    // Scene
    html += '<div class="dos-scene" id="dos-scene">';

    // Attackers area
    html += '<div class="dos-attackers" id="dos-attackers"></div>';

    // Requests area
    html += '<div class="dos-requests" id="dos-requests"></div>';

    // Server
    html += '<div class="dos-server">';
    html += '<div class="server-icon normal" id="dos-server-icon">';
    html += '<div class="server-led" id="dos-server-led"></div>';
    html += '<div class="server-bar"></div>';
    html += '<div class="server-bar"></div>';
    html += '<div class="server-bar"></div>';
    html += '</div>';
    html += '<span class="server-label">Web Server</span>';
    html += '</div>';

    html += '</div>'; // scene

    html += '<div class="dos-status-text" id="dos-status">Server operating normally. Handling legitimate requests.</div>';

    html += '</div>'; // dos-visual

    dosPanel.innerHTML = html;

    // Wire up mode buttons
    var dosBtns = dosPanel.querySelectorAll('[data-dos-mode]');
    dosBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        dosBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        dosState.mode = btn.getAttribute('data-dos-mode');
        if (dosTimer) { clearInterval(dosTimer); dosTimer = null; }
        startDoSAnimation();
      });
    });

    startDoSAnimation();
  }

  function startDoSAnimation() {
    var attackersEl = document.getElementById('dos-attackers');
    var requestsEl = document.getElementById('dos-requests');
    var serverIcon = document.getElementById('dos-server-icon');
    var serverLed  = document.getElementById('dos-server-led');
    var statusEl   = document.getElementById('dos-status');

    if (!attackersEl) return;

    // Clear
    attackersEl.innerHTML = '';
    requestsEl.innerHTML = '';
    dosState.arrowCount = 0;

    // Build attackers based on mode
    var attackers = [];
    if (dosState.mode === 'normal') {
      attackers = [
        { label: 'User 1', type: 'legit', symbol: '\uD83D\uDC64' },
        { label: 'User 2', type: 'legit', symbol: '\uD83D\uDC64' },
        { label: 'User 3', type: 'legit', symbol: '\uD83D\uDC64' }
      ];
      serverIcon.className = 'server-icon normal';
      serverLed.className = 'server-led';
      statusEl.textContent = 'Server operating normally. Handling legitimate requests.';
    } else if (dosState.mode === 'dos') {
      attackers = [
        { label: 'User 1', type: 'legit', symbol: '\uD83D\uDC64' },
        { label: 'Attacker', type: 'malicious', symbol: '\uD83D\uDC80' }
      ];
      serverIcon.className = 'server-icon stressed';
      serverLed.className = 'server-led amber';
      statusEl.textContent = 'DoS attack! Single attacker flooding server with requests.';
    } else {
      attackers = [
        { label: 'User 1', type: 'legit', symbol: '\uD83D\uDC64' },
        { label: 'Bot 1', type: 'malicious', symbol: '\uD83E\uDD16' },
        { label: 'Bot 2', type: 'malicious', symbol: '\uD83E\uDD16' },
        { label: 'Bot 3', type: 'malicious', symbol: '\uD83E\uDD16' },
        { label: 'Bot 4', type: 'malicious', symbol: '\uD83E\uDD16' },
        { label: 'Bot 5', type: 'malicious', symbol: '\uD83E\uDD16' }
      ];
      serverIcon.className = 'server-icon overloaded';
      serverLed.className = 'server-led red';
      statusEl.textContent = 'DDoS attack! Multiple bots (botnet) overwhelming the server!';
    }

    // Render attackers
    for (var i = 0; i < attackers.length; i++) {
      var atk = attackers[i];
      var div = document.createElement('div');
      div.className = 'dos-attacker';
      div.style.animationDelay = (i * 0.15) + 's';

      var iconDiv = document.createElement('div');
      iconDiv.className = 'attacker-icon ' + atk.type;
      iconDiv.textContent = atk.symbol;

      var lbl = document.createElement('span');
      lbl.textContent = atk.label;

      div.appendChild(iconDiv);
      div.appendChild(lbl);
      attackersEl.appendChild(div);
    }

    // Animate request arrows
    var interval;
    if (dosState.mode === 'normal') {
      interval = 1200;
    } else if (dosState.mode === 'dos') {
      interval = 200;
    } else {
      interval = 80;
    }

    dosTimer = setInterval(function () {
      if (!requestsEl || !requestsEl.parentElement) {
        clearInterval(dosTimer);
        dosTimer = null;
        return;
      }

      dosState.arrowCount++;

      // Limit arrows on screen
      if (requestsEl.children.length > 30) {
        requestsEl.removeChild(requestsEl.firstChild);
      }

      var arrow = document.createElement('div');
      arrow.className = 'dos-arrow';

      // Random y position
      var sceneH = requestsEl.parentElement.clientHeight;
      var y = Math.floor(Math.random() * (sceneH - 10));
      arrow.style.top = y + 'px';
      arrow.style.left = '0';

      if (dosState.mode !== 'normal') {
        // Most arrows are malicious in attack mode
        if (Math.random() > 0.2) {
          arrow.classList.add('malicious');
        }
      }

      requestsEl.appendChild(arrow);

      // Clean up after animation
      setTimeout(function () {
        if (arrow.parentElement) {
          arrow.parentElement.removeChild(arrow);
        }
      }, 1100);

      // Transition server state during DoS
      if (dosState.mode === 'dos' && dosState.arrowCount > 15) {
        serverIcon.className = 'server-icon overloaded';
        serverLed.className = 'server-led red';
        statusEl.textContent = 'Server overwhelmed! Legitimate users cannot connect.';
      }
    }, interval);
  }

  /* ═══════════════════════════════════════════════════════════════════
     SQL INJECTION RENDERER
     ═══════════════════════════════════════════════════════════════════ */
  function renderSQLInjection() {
    var html = '<div class="attack-header">';
    html += '<div class="attack-icon sql-icon">\uD83D\uDDC3</div>';
    html += '<div class="attack-header-text">';
    html += '<h3>SQL Injection</h3>';
    html += '<p>Exploiting input fields to execute malicious SQL commands on a database.</p>';
    html += '</div></div>';

    html += '<div class="sql-demo">';

    // Login form
    html += '<div class="sql-form" id="sql-form">';
    html += '<h4>User Login</h4>';
    html += '<div class="sql-field">';
    html += '<label for="sql-username">Username</label>';
    html += '<input type="text" id="sql-username" value="" placeholder="Enter username">';
    html += '</div>';
    html += '<div class="sql-field">';
    html += '<label for="sql-password">Password</label>';
    html += '<input type="text" id="sql-password" value="" placeholder="Enter password">';
    html += '</div>';
    html += '<button class="sql-login-btn" id="sql-login-btn">Log In</button>';
    html += '<div style="margin-top:var(--sp-3); font-size:var(--fs-xs); color:var(--clr-text-muted)">';
    html += 'Try entering <code style="color:#ef4444; font-family:var(--font-mono)">\' OR \'1\'=\'1</code> as the username';
    html += '</div>';
    html += '</div>';

    // Steps area (hidden initially)
    html += '<div class="sql-steps-container" id="sql-steps" style="display:none"></div>';

    html += '</div>';

    sqlPanel.innerHTML = html;

    // Wire up login button
    var loginBtn = document.getElementById('sql-login-btn');
    loginBtn.addEventListener('click', function () {
      runSQLDemo();
    });

    // Allow Enter key
    var usernameInput = document.getElementById('sql-username');
    var passwordInput = document.getElementById('sql-password');
    usernameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') runSQLDemo();
    });
    passwordInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') runSQLDemo();
    });
  }

  function runSQLDemo() {
    var username = document.getElementById('sql-username').value;
    var password = document.getElementById('sql-password').value;
    var stepsEl  = document.getElementById('sql-steps');

    if (!stepsEl) return;
    stepsEl.style.display = '';
    stepsEl.innerHTML = '';

    var isInjection = username.indexOf("'") !== -1 || username.indexOf('OR') !== -1 ||
                      username.indexOf('or') !== -1 || username.indexOf('=') !== -1;

    // Step 1: Show the input
    var step1 = createStepCard(1, 'User submits login form',
      'Username: <code>' + escapeHtml(username) + '</code><br>Password: <code>' + escapeHtml(password) + '</code>');
    stepsEl.appendChild(step1);

    // Step 2: Show the query
    var safeUser = escapeHtml(username);
    var safePass = escapeHtml(password);
    var queryHtml;
    if (isInjection) {
      queryHtml = "SELECT * FROM users WHERE user='<span class=\"sql-highlight\">" + safeUser + "</span>' AND pass='" + safePass + "'";
    } else {
      queryHtml = "SELECT * FROM users WHERE user='" + safeUser + "' AND pass='" + safePass + "'";
    }

    var step2 = createStepCard(2, 'Query constructed',
      '<div class="sql-query-display">' + queryHtml + '</div>');
    step2.style.animationDelay = '0.4s';
    stepsEl.appendChild(step2);

    // Step 3: Result
    if (isInjection) {
      var step3 = createStepCard(3, 'Injection succeeds!',
        'The condition <code>\'1\'=\'1\'</code> is always TRUE, so the database returns <strong>all records</strong>.');
      step3.style.animationDelay = '0.7s';
      stepsEl.appendChild(step3);

      // Step 4: Data breach table
      var tableHtml = '<table class="sql-result-table">';
      tableHtml += '<thead><tr><th>ID</th><th>Username</th><th>Password</th><th>Email</th></tr></thead>';
      tableHtml += '<tbody>';
      tableHtml += '<tr><td>1</td><td>admin</td><td>admin123</td><td>admin@example.com</td></tr>';
      tableHtml += '<tr><td>2</td><td>jsmith</td><td>password1</td><td>john@example.com</td></tr>';
      tableHtml += '<tr><td>3</td><td>sbrown</td><td>letmein</td><td>sarah@example.com</td></tr>';
      tableHtml += '<tr><td>4</td><td>mwilson</td><td>qwerty99</td><td>mike@example.com</td></tr>';
      tableHtml += '</tbody></table>';
      tableHtml += '<div class="sql-breach-label">DATA BREACH \u2014 All user records exposed!</div>';

      var step4 = createStepCard(4, 'Database returns all records', tableHtml);
      step4.style.animationDelay = '1.0s';
      stepsEl.appendChild(step4);
    } else {
      var step3b;
      if (username === 'admin' && password === 'admin123') {
        step3b = createStepCard(3, 'Login successful',
          'Credentials match. User authenticated normally. No injection detected.');
      } else {
        step3b = createStepCard(3, 'Login failed',
          'No matching record found. The query returned 0 rows. This is normal, safe behaviour.');
      }
      step3b.style.animationDelay = '0.7s';
      stepsEl.appendChild(step3b);
    }
  }

  function createStepCard(num, title, contentHtml) {
    var div = document.createElement('div');
    div.className = 'step-card';

    var numEl = document.createElement('span');
    numEl.className = 'step-number';
    numEl.textContent = num;

    var contentDiv = document.createElement('div');
    contentDiv.className = 'step-content';

    var h4 = document.createElement('h4');
    h4.textContent = title;

    var p = document.createElement('div');
    p.style.cssText = 'font-size:var(--fs-sm);color:var(--clr-text-muted);line-height:1.6';
    p.innerHTML = contentHtml;

    contentDiv.appendChild(h4);
    contentDiv.appendChild(p);
    div.appendChild(numEl);
    div.appendChild(contentDiv);

    return div;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ═══════════════════════════════════════════════════════════════════
     QUIZ MODE
     ═══════════════════════════════════════════════════════════════════ */
  function initQuiz() {
    quizState.questions = shuffleArray(quizQuestions);
    quizState.current = 0;
    quizState.score = 0;
    quizState.streak = 0;
    quizState.maxStreak = 0;
    quizState.answered = false;
    renderQuiz();
  }

  function renderQuiz() {
    if (quizState.current >= quizState.questions.length) {
      renderQuizComplete();
      return;
    }

    var q = quizState.questions[quizState.current];

    var html = '<div class="quiz-container">';

    // Progress
    html += '<div class="quiz-progress">';
    html += '<span>Q' + (quizState.current + 1) + '/' + quizState.questions.length + '</span>';
    html += '<div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' + ((quizState.current / quizState.questions.length) * 100) + '%"></div></div>';
    html += '<span class="quiz-streak">Streak: ' + quizState.streak + '</span>';
    html += '</div>';

    // Scenario
    html += '<div class="quiz-scenario">"' + q.scenario + '"</div>';

    // Build options: always include correct answer + 5 random others
    var options = buildQuizOptions(q.answer);

    html += '<div class="quiz-options" id="quiz-options">';
    for (var i = 0; i < options.length; i++) {
      html += '<button class="quiz-option" data-answer="' + escapeHtml(options[i]) + '">' + options[i] + '</button>';
    }
    html += '</div>';

    // Feedback
    html += '<div class="quiz-feedback" id="quiz-feedback"></div>';

    html += '</div>';

    quizPanel.innerHTML = html;
    quizState.answered = false;

    // Wire up option buttons
    var optBtns = quizPanel.querySelectorAll('.quiz-option');
    optBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (quizState.answered) return;
        handleQuizAnswer(btn, q.answer);
      });
    });
  }

  function buildQuizOptions(correctAnswer) {
    // Always include the correct answer
    var opts = [correctAnswer];
    var pool = quizOptions.filter(function (o) { return o !== correctAnswer; });
    pool = shuffleArray(pool);

    // Pick 5 more distractors (for 6 total options)
    for (var i = 0; i < 5 && i < pool.length; i++) {
      opts.push(pool[i]);
    }

    return shuffleArray(opts);
  }

  function handleQuizAnswer(btn, correctAnswer) {
    quizState.answered = true;
    var chosen = btn.getAttribute('data-answer');
    var feedbackEl = document.getElementById('quiz-feedback');
    var allBtns = quizPanel.querySelectorAll('.quiz-option');

    // Disable all buttons
    allBtns.forEach(function (b) {
      b.classList.add('disabled');
      if (b.getAttribute('data-answer') === correctAnswer) {
        b.classList.add('correct');
      }
    });

    if (chosen === correctAnswer) {
      quizState.score++;
      quizState.streak++;
      if (quizState.streak > quizState.maxStreak) quizState.maxStreak = quizState.streak;
      btn.classList.add('correct');
      feedbackEl.textContent = 'Correct!';
      feedbackEl.className = 'quiz-feedback correct';
    } else {
      quizState.streak = 0;
      btn.classList.add('incorrect');
      feedbackEl.textContent = 'Incorrect \u2014 the answer is ' + correctAnswer + '.';
      feedbackEl.className = 'quiz-feedback incorrect';
    }

    // Update streak display
    var streakEl = quizPanel.querySelector('.quiz-streak');
    if (streakEl) streakEl.textContent = 'Streak: ' + quizState.streak;

    // Auto-advance after delay
    setTimeout(function () {
      quizState.current++;
      renderQuiz();
    }, 1800);
  }

  function renderQuizComplete() {
    var pct = Math.round((quizState.score / quizState.questions.length) * 100);

    var html = '<div class="quiz-complete">';
    html += '<h3>Quiz Complete!</h3>';
    html += '<div class="quiz-score">' + quizState.score + ' / ' + quizState.questions.length + '</div>';
    html += '<div class="quiz-score-label">' + pct + '% correct \u2014 Best streak: ' + quizState.maxStreak + '</div>';

    if (pct === 100) {
      html += '<p style="color:#10b981;font-weight:600;margin-bottom:var(--sp-4)">Perfect score! Excellent knowledge of cyber threats.</p>';
    } else if (pct >= 70) {
      html += '<p style="color:var(--clr-primary);font-weight:600;margin-bottom:var(--sp-4)">Good work! Review the ones you missed using the walkthroughs.</p>';
    } else {
      html += '<p style="color:#f59e0b;font-weight:600;margin-bottom:var(--sp-4)">Keep practising! Use the walkthroughs to learn each threat type.</p>';
    }

    html += '<button class="quiz-restart-btn" id="quiz-restart-btn">Try Again</button>';
    html += '</div>';

    quizPanel.innerHTML = html;

    document.getElementById('quiz-restart-btn').addEventListener('click', function () {
      initQuiz();
    });
  }

  /* ── Init ────────────────────────────────────────────────────────── */
  renderCurrentMode();
})();
