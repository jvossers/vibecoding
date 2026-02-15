/**
 * Ethics & Law Scenario Sorter — simulation logic.
 *
 * Three tabs: Identify the Law, Ethical Dilemmas, Open Source vs Proprietary.
 * DOM-only, reset-only engine.
 */
(function () {
  'use strict';

  /* ================================================================
   *  DATA
   * ================================================================ */

  var LAW_LABELS = {
    DPA:  'Data Protection Act 2018',
    CMA:  'Computer Misuse Act 1990',
    CDPA: 'Copyright Designs & Patents Act 1988'
  };

  var SCENARIOS = [
    { text: 'A company sells customer email addresses to advertisers without consent.', law: 'DPA', explanation: 'Personal data must be processed fairly and lawfully with the data subject\u2019s consent.' },
    { text: 'A hacker gains unauthorised access to a bank\u2019s computer system.', law: 'CMA', explanation: 'Unauthorised access to computer material is an offence under Section 1.' },
    { text: 'A student copies a commercial software program and shares it with friends.', law: 'CDPA', explanation: 'Copying and distributing copyrighted software without permission is illegal.' },
    { text: 'A hospital stores patient records without adequate security measures.', law: 'DPA', explanation: 'Data must be stored securely with appropriate technical measures.' },
    { text: 'Someone writes a virus intended to damage computer systems.', law: 'CMA', explanation: 'Creating malware with intent to impair computer operation is an offence under Section 3.' },
    { text: 'A musician\u2019s song is used in a YouTube video without permission.', law: 'CDPA', explanation: 'Using creative works without the creator\u2019s permission infringes their copyright.' },
    { text: 'A company keeps customer data for 20 years \u2018just in case\u2019 they need it.', law: 'DPA', explanation: 'Data should not be kept for longer than necessary.' },
    { text: 'An employee accesses their colleague\u2019s email account without permission.', law: 'CMA', explanation: 'Unauthorised access to computer material, even without intent to commit further offences.' },
    { text: 'A website streams pirated films for free.', law: 'CDPA', explanation: 'Distributing copyrighted material without authorisation is an offence.' },
    { text: 'A school collects fingerprint data from students without informing parents.', law: 'DPA', explanation: 'Data subjects must be informed about what data is collected and why.' },
    { text: 'A person modifies data in a company database to commit fraud.', law: 'CMA', explanation: 'Unauthorised modification of computer material with intent is a Section 3 offence.' },
    { text: 'An app developer uses open-source code but removes the licence attribution.', law: 'CDPA', explanation: 'Open-source licences still require attribution; removing it violates copyright.' },
    { text: 'A marketing company buys a list of phone numbers and sends spam texts.', law: 'DPA', explanation: 'Direct marketing without consent violates data protection principles.' },
    { text: 'A teenager uses software to perform a DDoS attack on their school\u2019s website.', law: 'CMA', explanation: 'Impairing the operation of a computer system is a Section 3 offence.' },
    { text: 'A game designer copies the exact character designs from another game.', law: 'CDPA', explanation: 'Artistic works including character designs are protected by copyright.' }
  ];

  var DILEMMAS = [
    {
      question: 'Should companies use AI to screen job applications?',
      forText: 'Faster, removes some human bias, handles large volumes',
      againstText: 'AI can perpetuate existing biases in training data, lacks human judgement',
      model: 'On one hand, AI screening can process applications faster and may reduce some forms of human bias. On the other hand, AI systems can perpetuate discrimination if trained on biased data, and may miss qualities that a human interviewer would value. Overall, AI could assist but shouldn\u2019t replace human decision-making entirely.'
    },
    {
      question: 'Should autonomous (self-driving) cars be allowed on public roads?',
      forText: 'Could reduce accidents caused by human error, more efficient traffic',
      againstText: 'Technology isn\u2019t 100% reliable, ethical dilemmas in crash scenarios',
      model: 'On one hand, autonomous vehicles could significantly reduce accidents caused by human error such as tiredness or distraction. On the other hand, the technology is not yet proven to be completely safe, and there are unresolved ethical questions about how a car should react in unavoidable crash scenarios. Overall, gradual introduction with strict testing requirements would balance innovation with safety.'
    },
    {
      question: 'Should social media platforms verify users\u2019 real identities?',
      forText: 'Reduces cyberbullying and trolling, increases accountability',
      againstText: 'Privacy concerns, some users need anonymity for safety (whistleblowers)',
      model: 'On one hand, real identity verification could reduce cyberbullying and make users more accountable for their online behaviour. On the other hand, anonymity is important for protecting vulnerable people such as whistleblowers or those living under oppressive regimes. Overall, a balance is needed \u2014 perhaps optional verification with stronger moderation tools.'
    },
    {
      question: 'Is it ethical for the government to monitor citizens\u2019 internet activity?',
      forText: 'Helps prevent terrorism and serious crime, protects national security',
      againstText: 'Invasion of privacy, potential for misuse, chilling effect on free speech',
      model: 'On one hand, monitoring can help intelligence services prevent terrorist attacks and other serious crimes. On the other hand, mass surveillance invades the privacy of innocent citizens and could be misused by those in power. Overall, targeted monitoring with judicial oversight is more ethically justifiable than blanket surveillance.'
    },
    {
      question: 'Should coding/programming be compulsory in all schools?',
      forText: 'Computational thinking benefits all careers, digital literacy is essential',
      againstText: 'Not all students need to code, takes time from other subjects',
      model: 'On one hand, learning to code develops problem-solving skills and computational thinking that are valuable in many careers beyond software development. On the other hand, not every student will pursue a technology career, and curriculum time is limited. Overall, teaching computational thinking concepts is valuable for all students, even if in-depth programming should remain optional.'
    },
    {
      question: 'Should companies collect user data to personalise services?',
      forText: 'Better user experience, more relevant recommendations',
      againstText: 'Privacy invasion, data can be breached or misused',
      model: 'On one hand, personalisation can greatly improve user experience \u2014 for example, relevant search results or product recommendations. On the other hand, extensive data collection creates privacy risks and the potential for data breaches affecting millions. Overall, companies should collect only the minimum data necessary and give users clear control over what is collected.'
    }
  ];

  var OS_CHARS = [
    { text: 'Source code is freely available', answer: 'open' },
    { text: 'Developed and sold by a company', answer: 'prop' },
    { text: 'Users can modify and improve the code', answer: 'open' },
    { text: 'Requires purchasing a licence', answer: 'prop' },
    { text: 'Community-driven development', answer: 'open' },
    { text: 'Professional customer support included', answer: 'prop' },
    { text: 'Free to use and distribute', answer: 'open' },
    { text: 'Source code is kept secret', answer: 'prop' },
    { text: 'May have limited documentation', answer: 'open' },
    { text: 'Regular scheduled updates and patches', answer: 'prop' },
    { text: 'Examples: Linux, Firefox, LibreOffice', answer: 'open' },
    { text: 'Examples: Windows, Microsoft Office, Photoshop', answer: 'prop' }
  ];

  /* ================================================================
   *  DOM REFS
   * ================================================================ */

  var controlsEl = document.getElementById('controls');

  // Tab buttons
  var tabBtns = document.querySelectorAll('.algo-btn[data-tab]');
  var panels = {
    laws:       document.getElementById('panel-laws'),
    ethics:     document.getElementById('panel-ethics'),
    opensource: document.getElementById('panel-opensource')
  };

  // Tab 1 — Laws
  var lawsProgress     = document.getElementById('laws-progress');
  var lawsProgressFill = document.getElementById('laws-progress-fill');
  var lawsScore        = document.getElementById('laws-score');
  var lawsCard         = document.getElementById('laws-card');
  var lawsNumber       = document.getElementById('laws-number');
  var lawsText         = document.getElementById('laws-text');
  var lawsButtons      = document.getElementById('laws-buttons');
  var lawsBtnEls       = lawsButtons.querySelectorAll('.law-btn');
  var lawsFeedback     = document.getElementById('laws-feedback');
  var lawsSummary      = document.getElementById('laws-summary');
  var lawsSummaryScore = document.getElementById('laws-summary-score');
  var lawsSummaryBody  = document.getElementById('laws-summary-body');

  // Tab 2 — Ethics
  var ethicsProgress     = document.getElementById('ethics-progress');
  var ethicsProgressFill = document.getElementById('ethics-progress-fill');
  var ethicsCard         = document.getElementById('ethics-card');
  var ethicsQuestion     = document.getElementById('ethics-question');
  var ethicsForBtn       = document.getElementById('ethics-for');
  var ethicsAgainstBtn   = document.getElementById('ethics-against');
  var ethicsForText      = document.getElementById('ethics-for-text');
  var ethicsAgainstText  = document.getElementById('ethics-against-text');
  var ethicsModel        = document.getElementById('ethics-model');
  var ethicsModelText    = document.getElementById('ethics-model-text');
  var ethicsNextBtn      = document.getElementById('ethics-next');
  var ethicsSummary      = document.getElementById('ethics-summary');

  // Tab 3 — Open Source
  var osProgress     = document.getElementById('os-progress');
  var osProgressFill = document.getElementById('os-progress-fill');
  var osScore        = document.getElementById('os-score');
  var osPool         = document.getElementById('os-pool');
  var osDropOpen     = document.getElementById('os-drop-open');
  var osDropProp     = document.getElementById('os-drop-prop');
  var osSummary      = document.getElementById('os-summary');
  var osSummaryScore = document.getElementById('os-summary-score');

  /* ================================================================
   *  STATE
   * ================================================================ */

  var activeTab = 'laws';

  // Tab 1 state
  var lawsShuffled = [];
  var lawsCurrent  = 0;
  var lawsCorrect  = 0;
  var lawsResults  = [];
  var lawsAnswered = false;
  var lawsTimer    = null;

  // Tab 2 state
  var ethicsShuffled = [];
  var ethicsCurrent  = 0;
  var ethicsPicked   = false;

  // Tab 3 state
  var osShuffled     = [];
  var osCorrectCount = 0;
  var osSorted       = 0;
  var osSelected     = null; // index of selected card in pool

  /* ================================================================
   *  ENGINE (reset-only)
   * ================================================================ */

  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });

  engine
    .onReset(function () {
      resetLaws();
      resetEthics();
      resetOpenSource();
    })
    .onRender(function () {
      // DOM-only — state driven by events
    });

  /* ================================================================
   *  TAB SWITCHING
   * ================================================================ */

  for (var t = 0; t < tabBtns.length; t++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        if (tab === activeTab) return;
        activeTab = tab;
        for (var i = 0; i < tabBtns.length; i++) {
          tabBtns[i].classList.toggle('active', tabBtns[i] === btn);
        }
        panels.laws.style.display       = tab === 'laws'       ? '' : 'none';
        panels.ethics.style.display      = tab === 'ethics'     ? '' : 'none';
        panels.opensource.style.display   = tab === 'opensource' ? '' : 'none';
      });
    })(tabBtns[t]);
  }

  /* ================================================================
   *  TAB 1 — IDENTIFY THE LAW
   * ================================================================ */

  function resetLaws() {
    if (lawsTimer) { clearTimeout(lawsTimer); lawsTimer = null; }
    lawsShuffled = SCENARIOS.slice();
    SimulationEngine.fisherYates(lawsShuffled);
    lawsCurrent  = 0;
    lawsCorrect  = 0;
    lawsResults  = [];
    lawsAnswered = false;

    lawsCard.style.display    = '';
    lawsButtons.style.display = '';
    lawsFeedback.style.display = 'none';
    lawsFeedback.innerHTML     = '';
    lawsSummary.style.display  = 'none';
    lawsSummaryBody.innerHTML  = '';

    enableLawButtons(true);
    clearLawButtonStates();
    showLawScenario();
    updateLawsProgress();
  }

  function showLawScenario() {
    var sc = lawsShuffled[lawsCurrent];
    lawsNumber.textContent = 'Scenario ' + (lawsCurrent + 1) + ' of ' + SCENARIOS.length;
    lawsText.textContent = sc.text;
  }

  function updateLawsProgress() {
    var done = Math.min(lawsResults.length, SCENARIOS.length);
    lawsProgress.textContent     = done + ' / ' + SCENARIOS.length;
    lawsProgressFill.style.width = (done / SCENARIOS.length * 100) + '%';
    lawsScore.textContent        = lawsCorrect;
  }

  function enableLawButtons(enabled) {
    for (var i = 0; i < lawsBtnEls.length; i++) {
      lawsBtnEls[i].disabled = !enabled;
    }
  }

  function clearLawButtonStates() {
    for (var i = 0; i < lawsBtnEls.length; i++) {
      lawsBtnEls[i].classList.remove('law-btn--correct', 'law-btn--wrong');
    }
  }

  function handleLawAnswer(userLaw) {
    if (lawsAnswered) return;
    lawsAnswered = true;
    enableLawButtons(false);

    var sc      = lawsShuffled[lawsCurrent];
    var correct = (userLaw === sc.law);

    if (correct) lawsCorrect++;

    lawsResults.push({
      scenario:   sc,
      userAnswer: userLaw,
      correct:    correct
    });

    // Highlight buttons
    for (var j = 0; j < lawsBtnEls.length; j++) {
      var btn    = lawsBtnEls[j];
      var btnLaw = btn.getAttribute('data-law');
      if (btnLaw === sc.law) {
        btn.classList.add('law-btn--correct');
      }
      if (btnLaw === userLaw && !correct) {
        btn.classList.add('law-btn--wrong');
      }
    }

    // Show feedback
    lawsFeedback.style.display = '';
    var icon = correct ? '\u2705' : '\u274C';
    var cls  = correct ? 'feedback--correct' : 'feedback--wrong';
    lawsFeedback.className = 'feedback-area ' + cls;
    lawsFeedback.innerHTML =
      '<span class="feedback-icon">' + icon + '</span>' +
      '<span class="feedback-text">' +
        '<strong>' + (correct ? 'Correct! ' + LAW_LABELS[sc.law] : 'Incorrect \u2014 the answer is ' + LAW_LABELS[sc.law] + '.') + '</strong> ' +
        sc.explanation +
      '</span>';

    updateLawsProgress();

    // Auto-advance
    lawsTimer = setTimeout(function () {
      lawsCurrent++;
      if (lawsCurrent >= SCENARIOS.length) {
        showLawsSummary();
        return;
      }
      lawsAnswered = false;
      clearLawButtonStates();
      enableLawButtons(true);
      lawsFeedback.style.display = 'none';
      lawsFeedback.innerHTML     = '';
      showLawScenario();
      updateLawsProgress();
    }, correct ? 1800 : 2800);
  }

  function showLawsSummary() {
    lawsCard.style.display    = 'none';
    lawsButtons.style.display = 'none';
    lawsFeedback.style.display = 'none';

    lawsSummary.style.display = '';
    lawsSummaryScore.innerHTML =
      'You scored <strong>' + lawsCorrect + ' / ' + SCENARIOS.length + '</strong>' +
      (lawsCorrect === SCENARIOS.length ? ' \u2014 Perfect!' : lawsCorrect >= 10 ? ' \u2014 Well done!' : ' \u2014 Keep practising!');

    lawsSummaryBody.innerHTML = '';
    for (var i = 0; i < lawsResults.length; i++) {
      var r  = lawsResults[i];
      var tr = document.createElement('tr');
      var ic = r.correct ? '\u2705' : '\u274C';
      tr.innerHTML =
        '<td>' + truncate(r.scenario.text, 60) + '</td>' +
        '<td>' + LAW_LABELS[r.scenario.law] + '</td>' +
        '<td>' + LAW_LABELS[r.userAnswer] + '</td>' +
        '<td>' + ic + '</td>';
      if (!r.correct) tr.className = 'summary-row--wrong';
      lawsSummaryBody.appendChild(tr);
    }

    engine.finish();
  }

  // Bind law buttons
  for (var lb = 0; lb < lawsBtnEls.length; lb++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        handleLawAnswer(btn.getAttribute('data-law'));
      });
    })(lawsBtnEls[lb]);
  }

  /* ================================================================
   *  TAB 2 — ETHICAL DILEMMAS
   * ================================================================ */

  function resetEthics() {
    ethicsShuffled = DILEMMAS.slice();
    SimulationEngine.fisherYates(ethicsShuffled);
    ethicsCurrent = 0;
    ethicsPicked  = false;

    ethicsCard.style.display    = '';
    ethicsModel.style.display   = 'none';
    ethicsSummary.style.display = 'none';
    ethicsForBtn.disabled       = false;
    ethicsAgainstBtn.disabled   = false;
    ethicsForBtn.classList.remove('viewpoint-btn--selected');
    ethicsAgainstBtn.classList.remove('viewpoint-btn--selected');

    showDilemma();
    updateEthicsProgress();
  }

  function showDilemma() {
    var d = ethicsShuffled[ethicsCurrent];
    ethicsQuestion.textContent    = d.question;
    ethicsForText.textContent     = d.forText;
    ethicsAgainstText.textContent = d.againstText;
  }

  function updateEthicsProgress() {
    var done = Math.min(ethicsCurrent, DILEMMAS.length);
    ethicsProgress.textContent     = done + ' / ' + DILEMMAS.length;
    ethicsProgressFill.style.width = (done / DILEMMAS.length * 100) + '%';
  }

  function handleEthicsChoice(side) {
    if (ethicsPicked) return;
    ethicsPicked = true;
    ethicsForBtn.disabled     = true;
    ethicsAgainstBtn.disabled = true;

    if (side === 'for') {
      ethicsForBtn.classList.add('viewpoint-btn--selected');
    } else {
      ethicsAgainstBtn.classList.add('viewpoint-btn--selected');
    }

    // Reveal model answer
    var d = ethicsShuffled[ethicsCurrent];
    ethicsModelText.textContent = d.model;
    ethicsModel.style.display   = '';
  }

  function advanceEthics() {
    ethicsCurrent++;
    ethicsPicked = false;

    ethicsForBtn.disabled     = false;
    ethicsAgainstBtn.disabled = false;
    ethicsForBtn.classList.remove('viewpoint-btn--selected');
    ethicsAgainstBtn.classList.remove('viewpoint-btn--selected');
    ethicsModel.style.display = 'none';

    updateEthicsProgress();

    if (ethicsCurrent >= DILEMMAS.length) {
      ethicsCard.style.display    = 'none';
      ethicsSummary.style.display = '';
      updateEthicsProgress();
      return;
    }

    showDilemma();
  }

  ethicsForBtn.addEventListener('click', function () { handleEthicsChoice('for'); });
  ethicsAgainstBtn.addEventListener('click', function () { handleEthicsChoice('against'); });
  ethicsNextBtn.addEventListener('click', function () { advanceEthics(); });

  /* ================================================================
   *  TAB 3 — OPEN SOURCE VS PROPRIETARY
   * ================================================================ */

  function resetOpenSource() {
    osShuffled     = OS_CHARS.slice();
    SimulationEngine.fisherYates(osShuffled);
    osCorrectCount = 0;
    osSorted       = 0;
    osSelected     = null;

    osPool.innerHTML     = '';
    osDropOpen.innerHTML = '';
    osDropProp.innerHTML = '';
    osSummary.style.display = 'none';

    // Build cards in pool
    for (var i = 0; i < osShuffled.length; i++) {
      var card = document.createElement('div');
      card.className = 'os-char-card';
      card.textContent = osShuffled[i].text;
      card.setAttribute('data-idx', i);
      osPool.appendChild(card);

      (function (cardEl, idx) {
        cardEl.addEventListener('click', function () {
          if (cardEl.classList.contains('os-char-card--sorted')) return;
          selectOsCard(cardEl, idx);
        });
      })(card, i);
    }

    updateOsProgress();
  }

  function selectOsCard(cardEl, idx) {
    // If already selected, deselect
    if (osSelected === idx) {
      cardEl.classList.remove('os-char-card--selected');
      osSelected = null;
      return;
    }

    // Deselect any previous
    var prev = osPool.querySelector('.os-char-card--selected');
    if (prev) prev.classList.remove('os-char-card--selected');

    osSelected = idx;
    cardEl.classList.add('os-char-card--selected');
  }

  function handleOsSort(targetColumn) {
    if (osSelected === null) return;

    var idx      = osSelected;
    var charData = osShuffled[idx];
    var cardEl   = osPool.querySelector('[data-idx="' + idx + '"]');

    if (!cardEl || cardEl.classList.contains('os-char-card--sorted')) {
      osSelected = null;
      return;
    }

    var correct = (targetColumn === charData.answer);
    var dropZone = targetColumn === 'open' ? osDropOpen : osDropProp;

    // Remove selection styling
    cardEl.classList.remove('os-char-card--selected');
    osSelected = null;
    osSorted++;

    if (correct) {
      osCorrectCount++;
      // Move card to correct column
      cardEl.classList.add('os-char-card--correct', 'os-char-card--sorted');
      osPool.removeChild(cardEl);
      dropZone.appendChild(cardEl);
    } else {
      // Flash wrong, then move to CORRECT column
      cardEl.classList.add('os-char-card--wrong');
      var correctZone = charData.answer === 'open' ? osDropOpen : osDropProp;

      setTimeout(function () {
        cardEl.classList.remove('os-char-card--wrong');
        cardEl.classList.add('os-char-card--correct', 'os-char-card--sorted');
        osPool.removeChild(cardEl);
        correctZone.appendChild(cardEl);
      }, 600);
    }

    updateOsProgress();

    // Check completion
    if (osSorted >= OS_CHARS.length) {
      setTimeout(function () {
        showOsSummary();
      }, 800);
    }
  }

  function updateOsProgress() {
    osProgress.textContent     = osSorted + ' / ' + OS_CHARS.length;
    osProgressFill.style.width = (osSorted / OS_CHARS.length * 100) + '%';
    osScore.textContent        = osCorrectCount;
  }

  function showOsSummary() {
    osSummary.style.display = '';
    osSummaryScore.innerHTML =
      'You scored <strong>' + osCorrectCount + ' / ' + OS_CHARS.length + '</strong>' +
      (osCorrectCount === OS_CHARS.length ? ' \u2014 Perfect!' : osCorrectCount >= 9 ? ' \u2014 Well done!' : ' \u2014 Keep practising!');
  }

  // Column click handlers — sort selected card into that column
  document.getElementById('os-col-open').addEventListener('click', function (e) {
    // Don't trigger if clicking a card already in the column
    if (e.target.classList.contains('os-char-card')) return;
    handleOsSort('open');
  });
  document.getElementById('os-col-prop').addEventListener('click', function (e) {
    if (e.target.classList.contains('os-char-card')) return;
    handleOsSort('prop');
  });

  /* ================================================================
   *  UTILITIES
   * ================================================================ */

  function truncate(str, max) {
    if (str.length <= max) return str;
    return str.substring(0, max - 1) + '\u2026';
  }

  /* ================================================================
   *  INIT
   * ================================================================ */

  engine.reset();
})();
