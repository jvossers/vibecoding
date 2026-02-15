/**
 * Compression Demonstrator
 * Lossless tab: Run-Length Encoding with step-by-step visualisation.
 * Lossy tab: Pixel colour quantisation to simulate quality loss.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var tabBtns     = document.querySelectorAll('[data-tab]');
  var losslessP   = document.getElementById('lossless-panel');
  var lossyP      = document.getElementById('lossy-panel');
  var rleInput    = document.getElementById('rle-input');
  var rleOutput   = document.getElementById('rle-output');
  var rleSteps    = document.getElementById('rle-steps');
  var rleOrig     = document.getElementById('rle-orig-size');
  var rleComp     = document.getElementById('rle-comp-size');
  var rleRatio    = document.getElementById('rle-ratio');
  var origCanvas  = document.getElementById('lossy-orig');
  var compCanvas  = document.getElementById('lossy-comp');
  var qSlider     = document.getElementById('quality-slider');
  var qVal        = document.getElementById('quality-val');
  var qPct        = document.getElementById('quality-pct');
  var lossyOrigSz = document.getElementById('lossy-orig-size');
  var lossyCompClr = document.getElementById('lossy-comp-colours');
  var lossyLoss   = document.getElementById('lossy-loss');
  var controlsEl  = document.getElementById('controls');

  var currentTab = 'lossless';

  // Tab colours for RLE groups
  var GROUP_COLOURS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

  /* ── Tab switching ───────────────────────────────────────────── */
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      losslessP.style.display = currentTab === 'lossless' ? '' : 'none';
      lossyP.style.display    = currentTab === 'lossy'    ? '' : 'none';
      if (currentTab === 'lossy') generateImage();
    });
  });

  /* ── Engine (reset only) ─────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, { controls: { play: false, speed: false, step: false } });
  engine.onReset(function () {
    doRLE();
    if (currentTab === 'lossy') generateImage();
  });

  /* ── RLE ─────────────────────────────────────────────────────── */
  rleInput.addEventListener('input', doRLE);

  function doRLE() {
    var text = rleInput.value;
    if (!text) {
      rleOutput.textContent = ''; rleSteps.innerHTML = '';
      rleOrig.textContent = '0'; rleComp.textContent = '0'; rleRatio.textContent = '—';
      return;
    }

    // Encode
    var encoded = '';
    var groups = [];
    var i = 0;
    while (i < text.length) {
      var ch = text[i];
      var count = 1;
      while (i + count < text.length && text[i + count] === ch) count++;
      encoded += count + ch;
      groups.push({ char: ch, count: count });
      i += count;
    }

    rleOutput.textContent = encoded;

    // Step-by-step groups
    rleSteps.innerHTML = '';
    groups.forEach(function (g, idx) {
      var span = document.createElement('span');
      span.className = 'rle-group';
      var bgColour = GROUP_COLOURS[idx % GROUP_COLOURS.length];
      span.style.background = bgColour + '1a'; // 10% opacity
      span.style.border = '1px solid ' + bgColour;

      var countSpan = document.createElement('span');
      countSpan.className = 'rle-count';
      countSpan.style.background = bgColour;
      countSpan.textContent = g.count;
      span.appendChild(countSpan);

      var charSpan = document.createTextNode(g.char.repeat(Math.min(g.count, 20)) + (g.count > 20 ? '…' : ''));
      span.appendChild(charSpan);

      var arrow = document.createTextNode(' → ' + g.count + g.char);
      span.appendChild(arrow);
      rleSteps.appendChild(span);
    });

    rleOrig.textContent = text.length;
    rleComp.textContent = encoded.length;
    var ratio = ((1 - encoded.length / text.length) * 100).toFixed(0);
    rleRatio.textContent = (ratio >= 0 ? ratio + '% smaller' : Math.abs(ratio) + '% larger');
  }

  /* ── Lossy: generate a simple pattern image ──────────────────── */
  var originalPixels = null;
  var IMG_SIZE = 200;

  function generateImage() {
    var octx = origCanvas.getContext('2d');
    origCanvas.width = IMG_SIZE; origCanvas.height = IMG_SIZE;

    // Draw a colourful pattern
    for (var y = 0; y < IMG_SIZE; y++) {
      for (var x = 0; x < IMG_SIZE; x++) {
        var r = Math.floor(128 + 127 * Math.sin(x * 0.05));
        var g = Math.floor(128 + 127 * Math.sin(y * 0.07));
        var b = Math.floor(128 + 127 * Math.sin((x + y) * 0.04));
        // Add noise
        r = clamp(r + randInt(-15, 15));
        g = clamp(g + randInt(-15, 15));
        b = clamp(b + randInt(-15, 15));
        octx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        octx.fillRect(x, y, 1, 1);
      }
    }

    originalPixels = octx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
    applyLossy();
  }

  function applyLossy() {
    if (!originalPixels) return;
    var quality = parseInt(qSlider.value, 10);
    qVal.textContent = quality;
    qPct.textContent = quality + '%';

    var cctx = compCanvas.getContext('2d');
    compCanvas.width = IMG_SIZE; compCanvas.height = IMG_SIZE;

    // Quantise: reduce colour precision based on quality
    var levels = Math.max(2, Math.round(quality / 100 * 256));
    var step = 256 / levels;

    var imgData = cctx.createImageData(IMG_SIZE, IMG_SIZE);
    var orig = originalPixels.data;
    var dest = imgData.data;
    var colourSet = {};

    for (var i = 0; i < orig.length; i += 4) {
      var r = Math.round(Math.floor(orig[i] / step) * step);
      var g = Math.round(Math.floor(orig[i + 1] / step) * step);
      var b = Math.round(Math.floor(orig[i + 2] / step) * step);
      dest[i] = r; dest[i + 1] = g; dest[i + 2] = b; dest[i + 3] = 255;
      colourSet[r + ',' + g + ',' + b] = true;
    }

    cctx.putImageData(imgData, 0, 0);

    var totalPixels = IMG_SIZE * IMG_SIZE;
    lossyOrigSz.textContent = totalPixels.toLocaleString();
    lossyCompClr.textContent = Object.keys(colourSet).length;

    // Calculate average pixel difference
    var totalDiff = 0;
    for (var j = 0; j < orig.length; j += 4) {
      totalDiff += Math.abs(orig[j] - dest[j]) + Math.abs(orig[j + 1] - dest[j + 1]) + Math.abs(orig[j + 2] - dest[j + 2]);
    }
    var avgDiff = (totalDiff / (totalPixels * 3)).toFixed(1);
    lossyLoss.textContent = avgDiff + ' avg per channel';
  }

  qSlider.addEventListener('input', applyLossy);

  function clamp(v) { return Math.max(0, Math.min(255, v)); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* ── Init ────────────────────────────────────────────────────── */
  doRLE();
})();
