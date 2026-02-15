/**
 * Cipher & Encryption Tool
 * Encrypt/Decrypt tab: live Caesar cipher with alphabet mapping visualisation.
 * Brute Force tab: step through all 26 possible decryption keys.
 */
(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────────── */
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ── DOM refs ──────────────────────────────────────────────────── */
  var tabBtns          = document.querySelectorAll('[data-tab]');
  var encDecPanel      = document.getElementById('encrypt-decrypt-panel');
  var brutePanel       = document.getElementById('brute-force-panel');
  var plaintextInput   = document.getElementById('plaintext-input');
  var shiftSlider      = document.getElementById('shift-slider');
  var shiftValueEl     = document.getElementById('shift-value');
  var dirEncrypt       = document.getElementById('dir-encrypt');
  var dirDecrypt       = document.getElementById('dir-decrypt');
  var cipherOutput     = document.getElementById('cipher-output');
  var plainAlphaEl     = document.getElementById('plain-alpha');
  var cipherAlphaEl    = document.getElementById('cipher-alpha');
  var mappingLinesSvg  = document.getElementById('mapping-lines');
  var letterDetailEl   = document.getElementById('letter-detail');
  var bruteInput       = document.getElementById('brute-input');
  var bruteGrid        = document.getElementById('brute-grid');
  var controlsEl       = document.getElementById('controls');

  /* ── State ─────────────────────────────────────────────────────── */
  var currentTab  = 'encrypt-decrypt';
  var shift       = 3;
  var encrypting  = true;
  var bruteStep   = -1; // current brute-force key index (-1 = not started)

  /* ── Alphabet cell references ──────────────────────────────────── */
  var plainCells  = [];
  var cipherCells = [];

  /* ── Build static alphabet cells ───────────────────────────────── */
  (function buildAlphabets() {
    for (var i = 0; i < 26; i++) {
      var pc = document.createElement('span');
      pc.className = 'alpha-cell';
      pc.textContent = ALPHA[i];
      plainAlphaEl.appendChild(pc);
      plainCells.push(pc);

      var cc = document.createElement('span');
      cc.className = 'alpha-cell';
      cipherAlphaEl.appendChild(cc);
      cipherCells.push(cc);
    }
  })();

  /* ── Build brute-force rows ────────────────────────────────────── */
  var bruteRows = [];
  (function buildBruteRows() {
    for (var k = 0; k < 26; k++) {
      var row = document.createElement('div');
      row.className = 'brute-row';

      var keySpan = document.createElement('span');
      keySpan.className = 'brute-key';
      keySpan.textContent = 'Key ' + k + ':';

      var textSpan = document.createElement('span');
      textSpan.className = 'brute-text';

      row.appendChild(keySpan);
      row.appendChild(textSpan);
      bruteGrid.appendChild(row);
      bruteRows.push({ row: row, textSpan: textSpan });
    }
  })();

  /* ── Tab switching ─────────────────────────────────────────────── */
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      encDecPanel.style.display = currentTab === 'encrypt-decrypt' ? '' : 'none';
      brutePanel.style.display  = currentTab === 'brute-force'     ? '' : 'none';

      if (currentTab === 'brute-force') {
        engine.reset();
      } else {
        updateCipher();
      }
    });
  });

  /* ── Direction toggle ──────────────────────────────────────────── */
  dirEncrypt.addEventListener('click', function () {
    encrypting = true;
    dirEncrypt.classList.add('active');
    dirDecrypt.classList.remove('active');
    updateCipher();
  });
  dirDecrypt.addEventListener('click', function () {
    encrypting = false;
    dirDecrypt.classList.add('active');
    dirEncrypt.classList.remove('active');
    updateCipher();
  });

  /* ── Shift slider ──────────────────────────────────────────────── */
  shiftSlider.addEventListener('input', function () {
    shift = parseInt(shiftSlider.value, 10);
    shiftValueEl.textContent = shift;
    updateCipher();
  });

  /* ── Plaintext input ───────────────────────────────────────────── */
  plaintextInput.addEventListener('input', function () {
    updateCipher();
  });

  /* ── Brute-force input ─────────────────────────────────────────── */
  bruteInput.addEventListener('input', function () {
    if (currentTab === 'brute-force') {
      engine.reset();
    }
  });

  /* ── Caesar cipher function ────────────────────────────────────── */
  function caesarShift(text, key) {
    var result = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var upper = ch.toUpperCase();
      var idx = ALPHA.indexOf(upper);
      if (idx === -1) {
        result += ch;
      } else {
        var shifted = (idx + key + 26) % 26;
        var newCh = ALPHA[shifted];
        result += ch === upper ? newCh : newCh.toLowerCase();
      }
    }
    return result;
  }

  /* ── Update encrypt/decrypt view ───────────────────────────────── */
  function updateCipher() {
    var text = plaintextInput.value;
    var key = encrypting ? shift : -shift;
    var output = caesarShift(text, key);

    cipherOutput.textContent = output;

    // Update cipher alphabet row
    var displayShift = encrypting ? shift : -shift;
    for (var i = 0; i < 26; i++) {
      var mapped = (i + displayShift + 26) % 26;
      cipherCells[i].textContent = ALPHA[mapped];
    }

    // Highlight used letters
    var usedPlain = {};
    var upperText = text.toUpperCase();
    for (var j = 0; j < upperText.length; j++) {
      var idx = ALPHA.indexOf(upperText[j]);
      if (idx !== -1) usedPlain[idx] = true;
    }

    for (var k = 0; k < 26; k++) {
      plainCells[k].classList.toggle('highlight', !!usedPlain[k]);
      var mappedIdx = (k + displayShift + 26) % 26;
      cipherCells[k].classList.toggle('highlight', !!usedPlain[k]);
    }

    // Draw mapping lines
    drawMappingLines(displayShift, usedPlain);

    // Letter-by-letter breakdown
    buildLetterBreakdown(text, key);
  }

  /* ── Mapping lines (SVG) ───────────────────────────────────────── */
  function drawMappingLines(displayShift, usedPlain) {
    // Clear existing lines
    while (mappingLinesSvg.firstChild) {
      mappingLinesSvg.removeChild(mappingLinesSvg.firstChild);
    }

    if (plainCells.length === 0) return;

    // Position SVG between the two rows
    var plainRect = plainAlphaEl.getBoundingClientRect();
    var cipherRect = cipherAlphaEl.getBoundingClientRect();
    var parentRect = mappingLinesSvg.parentElement.getBoundingClientRect();

    var svgTop = plainRect.bottom - parentRect.top;
    var svgHeight = cipherRect.top - plainRect.bottom;

    mappingLinesSvg.style.top = svgTop + 'px';
    mappingLinesSvg.style.height = Math.max(svgHeight, 4) + 'px';
    mappingLinesSvg.setAttribute('viewBox', '0 0 ' + parentRect.width + ' ' + Math.max(svgHeight, 4));

    for (var i = 0; i < 26; i++) {
      if (!usedPlain[i]) continue;

      var pCell = plainCells[i];
      var pRect = pCell.getBoundingClientRect();
      var x1 = pRect.left + pRect.width / 2 - parentRect.left;
      var y1 = 0;

      // Find which cipher cell this maps to
      var cIdx = (i + displayShift + 26) % 26;
      var cCell = cipherCells[cIdx];
      var cRect = cCell.getBoundingClientRect();
      var x2 = cRect.left + cRect.width / 2 - parentRect.left;
      var y2 = Math.max(svgHeight, 4);

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('active-line');
      mappingLinesSvg.appendChild(line);
    }
  }

  /* ── Letter-by-letter breakdown ────────────────────────────────── */
  function buildLetterBreakdown(text, key) {
    letterDetailEl.innerHTML = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var upper = ch.toUpperCase();
      var idx = ALPHA.indexOf(upper);
      var pair = document.createElement('div');

      if (idx === -1) {
        pair.className = 'letter-pair non-alpha';
        var fromEl = document.createElement('span');
        fromEl.className = 'lp-from';
        fromEl.textContent = ch === ' ' ? '\u2423' : ch;
        var arrEl = document.createElement('span');
        arrEl.className = 'lp-arrow';
        arrEl.textContent = '\u2192';
        var toEl = document.createElement('span');
        toEl.className = 'lp-to';
        toEl.textContent = ch === ' ' ? '\u2423' : ch;
        pair.appendChild(fromEl);
        pair.appendChild(arrEl);
        pair.appendChild(toEl);
      } else {
        pair.className = 'letter-pair';
        var shifted = (idx + key + 26) % 26;
        var outCh = ALPHA[shifted];
        if (ch !== upper) outCh = outCh.toLowerCase();

        var from2 = document.createElement('span');
        from2.className = 'lp-from';
        from2.textContent = ch;

        var shiftLabel = document.createElement('span');
        shiftLabel.className = 'lp-shift';
        shiftLabel.textContent = (key >= 0 ? '+' : '') + key;

        var arr2 = document.createElement('span');
        arr2.className = 'lp-arrow';
        arr2.textContent = '\u2193';

        var to2 = document.createElement('span');
        to2.className = 'lp-to';
        to2.textContent = outCh;

        pair.appendChild(from2);
        pair.appendChild(shiftLabel);
        pair.appendChild(arr2);
        pair.appendChild(to2);
      }
      letterDetailEl.appendChild(pair);
    }
  }

  /* ── Engine: full controls for brute-force mode ────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      bruteStep = -1;
      // Pre-populate all rows with text but mark as not revealed
      var ciphertext = bruteInput.value;
      for (var k = 0; k < 26; k++) {
        var decrypted = caesarShift(ciphertext, -k);
        bruteRows[k].textSpan.textContent = decrypted;
        bruteRows[k].row.classList.remove('revealed', 'current');
      }
    })
    .onStep(function () {
      if (bruteStep >= 25) return false;
      bruteStep++;
    })
    .onRender(function () {
      if (currentTab === 'encrypt-decrypt') {
        updateCipher();
        return;
      }
      // Brute force rendering
      for (var k = 0; k < 26; k++) {
        var row = bruteRows[k].row;
        if (k <= bruteStep) {
          row.classList.add('revealed');
        } else {
          row.classList.remove('revealed');
        }
        row.classList.toggle('current', k === bruteStep);
      }
      // Scroll current row into view
      if (bruteStep >= 0 && bruteStep < 26) {
        bruteRows[bruteStep].row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });

  /* ── Resize handler: redraw mapping lines ──────────────────────── */
  SimulationEngine.debounceResize(function () {
    if (currentTab === 'encrypt-decrypt') {
      updateCipher();
    }
  });

  /* ── Init ──────────────────────────────────────────────────────── */
  updateCipher();
})();
