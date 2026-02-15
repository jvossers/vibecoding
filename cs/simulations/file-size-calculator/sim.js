/**
 * File Size Calculator
 * Calculate file sizes for images, sounds and text with step-by-step breakdowns.
 */
(function () {
  'use strict';

  /* ── DOM refs ───────────────────────────────────────────────────── */
  var tabBtns      = document.querySelectorAll('[data-tab]');
  var imagePanel   = document.getElementById('image-panel');
  var soundPanel   = document.getElementById('sound-panel');
  var textPanel    = document.getElementById('text-panel');
  var controlsEl   = document.getElementById('controls');

  // Image inputs
  var imgWidth     = document.getElementById('img-width');
  var imgWidthVal  = document.getElementById('img-width-val');
  var imgHeight    = document.getElementById('img-height');
  var imgHeightVal = document.getElementById('img-height-val');
  var imgDepth     = document.getElementById('img-depth');
  var imageBreak   = document.getElementById('image-breakdown');

  // Sound inputs
  var sndRate      = document.getElementById('snd-rate');
  var sndDepth     = document.getElementById('snd-depth');
  var sndDuration  = document.getElementById('snd-duration');
  var sndDurVal    = document.getElementById('snd-duration-val');
  var sndChannels  = document.getElementById('snd-channels');
  var soundBreak   = document.getElementById('sound-breakdown');

  // Text inputs
  var txtChars     = document.getElementById('txt-chars');
  var txtCharsVal  = document.getElementById('txt-chars-val');
  var txtEncoding  = document.getElementById('txt-encoding');
  var textBreak    = document.getElementById('text-breakdown');

  var currentTab = 'image';

  /* ── Tab switching ─────────────────────────────────────────────── */
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      imagePanel.style.display = currentTab === 'image' ? '' : 'none';
      soundPanel.style.display = currentTab === 'sound' ? '' : 'none';
      textPanel.style.display  = currentTab === 'text'  ? '' : 'none';
      recalculate();
    });
  });

  /* ── Engine (reset only) ───────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });
  engine.onReset(function () {
    // Reset all inputs to defaults
    imgWidth.value = 1920;
    imgWidthVal.textContent = '1920';
    imgHeight.value = 1080;
    imgHeightVal.textContent = '1080';
    imgDepth.value = '24';

    sndRate.value = '44100';
    sndDepth.value = '16';
    sndDuration.value = 10;
    sndDurVal.textContent = '10';
    sndChannels.value = '2';

    txtChars.value = 500;
    txtCharsVal.textContent = '500';
    txtEncoding.value = '8';

    recalculate();
  });

  /* ── Input event listeners ─────────────────────────────────────── */
  imgWidth.addEventListener('input', function () {
    imgWidthVal.textContent = imgWidth.value;
    recalculate();
  });
  imgHeight.addEventListener('input', function () {
    imgHeightVal.textContent = imgHeight.value;
    recalculate();
  });
  imgDepth.addEventListener('change', recalculate);

  sndRate.addEventListener('change', recalculate);
  sndDepth.addEventListener('change', recalculate);
  sndDuration.addEventListener('input', function () {
    sndDurVal.textContent = sndDuration.value;
    recalculate();
  });
  sndChannels.addEventListener('change', recalculate);

  txtChars.addEventListener('input', function () {
    txtCharsVal.textContent = txtChars.value;
    recalculate();
  });
  txtEncoding.addEventListener('change', recalculate);

  /* ── Number formatting helper ──────────────────────────────────── */
  function fmt(n) {
    return n.toLocaleString('en-GB');
  }

  /* ── Smart size display ────────────────────────────────────────── */
  function smartSize(bytes) {
    if (bytes >= 1000000000) {
      return (bytes / 1000000000).toFixed(2) + ' GB';
    } else if (bytes >= 1000000) {
      return (bytes / 1000000).toFixed(2) + ' MB';
    } else if (bytes >= 1000) {
      return (bytes / 1000).toFixed(2) + ' KB';
    }
    return fmt(bytes) + ' bytes';
  }

  /* ── Build breakdown HTML ──────────────────────────────────────── */
  function buildBreakdown(container, formulaText, substitutionText, totalBits) {
    var totalBytes = totalBits / 8;
    var totalKB = totalBytes / 1000;
    var totalMB = totalKB / 1000;
    var totalGB = totalMB / 1000;

    var html = '';
    html += '<div class="breakdown-title">Step-by-step calculation</div>';

    // Formula box
    html += '<div class="breakdown-formula">';
    html += '<strong>Formula:</strong> ' + formulaText + '<br>';
    html += '<strong>Values:</strong> ' + substitutionText + '<br>';
    html += '<strong>Result:</strong> ' + fmt(totalBits) + ' bits';
    html += '</div>';

    // Conversion steps
    html += '<div class="breakdown-steps">';

    html += '<div class="step-row">';
    html += '<span class="step-label">Bits</span>';
    html += '<span class="step-calc">' + fmt(totalBits) + ' bits</span>';
    html += '</div>';

    html += '<div class="step-row">';
    html += '<span class="step-label">Bytes</span>';
    html += '<span class="step-calc">' + fmt(totalBits) + ' <span class="step-arrow">&divide;</span> 8</span>';
    html += '<span class="step-result">= ' + fmt(totalBytes) + ' bytes</span>';
    html += '</div>';

    html += '<div class="step-row">';
    html += '<span class="step-label">Kilobytes</span>';
    html += '<span class="step-calc">' + fmt(totalBytes) + ' <span class="step-arrow">&divide;</span> 1,000</span>';
    html += '<span class="step-result">= ' + totalKB.toFixed(2) + ' KB</span>';
    html += '</div>';

    html += '<div class="step-row">';
    html += '<span class="step-label">Megabytes</span>';
    html += '<span class="step-calc">' + totalKB.toFixed(2) + ' <span class="step-arrow">&divide;</span> 1,000</span>';
    html += '<span class="step-result">= ' + totalMB.toFixed(4) + ' MB</span>';
    html += '</div>';

    if (totalGB >= 0.01) {
      html += '<div class="step-row">';
      html += '<span class="step-label">Gigabytes</span>';
      html += '<span class="step-calc">' + totalMB.toFixed(4) + ' <span class="step-arrow">&divide;</span> 1,000</span>';
      html += '<span class="step-result">= ' + totalGB.toFixed(6) + ' GB</span>';
      html += '</div>';
    }

    html += '<div class="step-row final">';
    html += '<span class="step-label">File size</span>';
    html += '<span class="step-result">' + smartSize(totalBytes) + '</span>';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
  }

  /* ── Calculate image file size ─────────────────────────────────── */
  function calcImage() {
    var w = parseInt(imgWidth.value, 10);
    var h = parseInt(imgHeight.value, 10);
    var d = parseInt(imgDepth.value, 10);
    var totalBits = w * h * d;

    var formula = 'width &times; height &times; colour depth = file size (bits)';
    var substitution = fmt(w) + ' &times; ' + fmt(h) + ' &times; ' + d + ' = ' + fmt(totalBits) + ' bits';

    buildBreakdown(imageBreak, formula, substitution, totalBits);
  }

  /* ── Calculate sound file size ─────────────────────────────────── */
  function calcSound() {
    var rate = parseInt(sndRate.value, 10);
    var depth = parseInt(sndDepth.value, 10);
    var duration = parseInt(sndDuration.value, 10);
    var channels = parseInt(sndChannels.value, 10);
    var totalBits = rate * depth * duration * channels;

    var formula = 'sample rate &times; bit depth &times; duration &times; channels = file size (bits)';
    var substitution = fmt(rate) + ' &times; ' + depth + ' &times; ' + fmt(duration) + ' &times; ' + channels + ' = ' + fmt(totalBits) + ' bits';

    buildBreakdown(soundBreak, formula, substitution, totalBits);
  }

  /* ── Calculate text file size ──────────────────────────────────── */
  function calcText() {
    var chars = parseInt(txtChars.value, 10);
    var bitsPerChar = parseInt(txtEncoding.value, 10);
    var totalBits = chars * bitsPerChar;

    var encodingName = '';
    if (bitsPerChar === 7) encodingName = 'ASCII (7-bit)';
    else if (bitsPerChar === 8) encodingName = 'Extended ASCII (8-bit)';
    else encodingName = 'Unicode (16-bit)';

    var formula = 'characters &times; bits per character = file size (bits)';
    var substitution = fmt(chars) + ' &times; ' + bitsPerChar + ' (' + encodingName + ') = ' + fmt(totalBits) + ' bits';

    buildBreakdown(textBreak, formula, substitution, totalBits);
  }

  /* ── Recalculate based on current tab ──────────────────────────── */
  function recalculate() {
    calcImage();
    calcSound();
    calcText();
  }

  /* ── Init ───────────────────────────────────────────────────────── */
  recalculate();
})();
