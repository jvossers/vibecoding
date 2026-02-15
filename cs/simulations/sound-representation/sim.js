/**
 * Sound Representation Explorer
 * Visualises how sample rate and bit depth affect digital sound quality and file size.
 */
(function () {
  'use strict';

  /* ── DOM refs ──────────────────────────────────────────────────── */
  var canvas        = document.getElementById('sound-canvas');
  var ctx           = canvas.getContext('2d');
  var controlsEl    = document.getElementById('controls');
  var rateSlider    = document.getElementById('sample-rate-slider');
  var depthSlider   = document.getElementById('bit-depth-slider');
  var rateValueEl   = document.getElementById('sample-rate-value');
  var depthValueEl  = document.getElementById('bit-depth-value');
  var channelBtn    = document.getElementById('channel-toggle');
  var statRate      = document.getElementById('stat-rate');
  var statDepth     = document.getElementById('stat-depth');
  var statLevels    = document.getElementById('stat-levels');
  var statSize      = document.getElementById('stat-size');
  var waveBtns      = document.querySelectorAll('#waveform-toolbar .algo-btn');

  /* ── Constants ─────────────────────────────────────────────────── */
  var RATE_STEPS = [4, 8, 16, 32, 64, 128, 256, 512];
  var WAVE_CYCLES = 3; // number of waveform cycles shown across canvas

  /* ── State ─────────────────────────────────────────────────────── */
  var waveform    = 'sine';
  var sampleRate  = RATE_STEPS[3]; // 32
  var bitDepth    = 4;
  var channels    = 1; // 1 = mono, 2 = stereo

  /* ── Engine (reset only, real-time sliders) ────────────────────── */
  var engine = new SimulationEngine(controlsEl, {
    controls: { play: false, speed: false, step: false }
  });
  engine.onReset(function () {
    rateSlider.value = 3;
    depthSlider.value = 4;
    sampleRate = RATE_STEPS[3];
    bitDepth = 4;
    channels = 1;
    waveform = 'sine';
    channelBtn.textContent = 'Mono';
    channelBtn.classList.add('active');

    waveBtns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-wave') === 'sine');
    });

    updateLabels();
    draw();
  });

  /* ── Waveform generation ───────────────────────────────────────── */
  // Returns value in [-1, 1] for a given t in [0, 1]
  function waveAt(t) {
    var phase = t * WAVE_CYCLES * 2 * Math.PI;
    switch (waveform) {
      case 'square':
        return Math.sin(phase) >= 0 ? 1 : -1;
      case 'sawtooth':
        var p = (t * WAVE_CYCLES) % 1;
        return 2 * p - 1;
      default: // sine
        return Math.sin(phase);
    }
  }

  /* ── Quantise a value to the nearest level ─────────────────────── */
  function quantise(val, levels) {
    // val in [-1, 1], map to [0, levels-1], round, map back
    var norm = (val + 1) / 2; // 0..1
    var step = Math.round(norm * (levels - 1));
    return (step / (levels - 1)) * 2 - 1;
  }

  /* ── Update labels and stats ───────────────────────────────────── */
  function updateLabels() {
    rateValueEl.textContent = sampleRate;
    depthValueEl.textContent = bitDepth + '-bit';
    statRate.textContent = sampleRate;
    statDepth.textContent = bitDepth + '-bit';

    var levels = Math.pow(2, bitDepth);
    statLevels.textContent = levels;

    // File size = sampleRate x bitDepth x duration x channels / 8
    var bits = sampleRate * bitDepth * 1 * channels;
    var bytes = bits / 8;

    if (bytes >= 1048576) {
      statSize.textContent = (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      statSize.textContent = (bytes / 1024).toFixed(2) + ' KB';
    } else {
      statSize.textContent = bytes.toFixed(1) + ' B';
    }
  }

  /* ── Draw ───────────────────────────────────────────────────────── */
  function draw() {
    var size = SimulationEngine.resizeCanvas(canvas, 280, 0.5, 400);
    var tc = SimulationEngine.themeColors();
    var w = size.w;
    var h = size.h;

    var pad = { top: 30, bottom: 30, left: 50, right: 20 };
    var plotW = w - pad.left - pad.right;
    var plotH = h - pad.top - pad.bottom;
    var midY = pad.top + plotH / 2;

    // Clear
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    var levels = Math.pow(2, bitDepth);

    // ── Draw quantisation level lines ───────────────────────────
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    for (var lv = 0; lv < levels; lv++) {
      var normLv = (lv / (levels - 1)) * 2 - 1; // -1..1
      var ly = midY - normLv * (plotH / 2);
      ctx.beginPath();
      ctx.moveTo(pad.left, ly);
      ctx.lineTo(pad.left + plotW, ly);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ── Axis labels ─────────────────────────────────────────────
    ctx.fillStyle = tc.muted;
    ctx.font = '11px ' + getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Y-axis: show a few level markers
    var labelCount = Math.min(levels, 9); // show at most 9 labels
    var labelStep = (levels - 1) / (labelCount - 1);
    for (var li = 0; li < labelCount; li++) {
      var idx = Math.round(li * labelStep);
      var normLabel = (idx / (levels - 1)) * 2 - 1;
      var labelY = midY - normLabel * (plotH / 2);
      ctx.fillText(idx.toString(), pad.left - 6, labelY);
    }

    // Y-axis title
    ctx.save();
    ctx.translate(12, midY);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = tc.muted;
    ctx.font = '11px ' + getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim();
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();

    // X-axis title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Time', pad.left + plotW / 2, h - 12);

    // ── Draw analog waveform (smooth) ───────────────────────────
    ctx.strokeStyle = tc.muted;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    var analogSteps = Math.max(plotW, 200);
    for (var ai = 0; ai <= analogSteps; ai++) {
      var at = ai / analogSteps;
      var av = waveAt(at);
      var ax = pad.left + at * plotW;
      var ay = midY - av * (plotH / 2);
      if (ai === 0) ctx.moveTo(ax, ay);
      else ctx.lineTo(ax, ay);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── Compute sample points ───────────────────────────────────
    var samples = [];
    for (var si = 0; si < sampleRate; si++) {
      var st = si / sampleRate;
      var sv = waveAt(st);
      var qv = quantise(sv, levels);
      samples.push({ t: st, original: sv, quantised: qv });
    }

    // ── Draw reconstructed (staircase) waveform ─────────────────
    ctx.strokeStyle = tc.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var ri = 0; ri < samples.length; ri++) {
      var rx = pad.left + samples[ri].t * plotW;
      var ry = midY - samples[ri].quantised * (plotH / 2);
      var nextX;
      if (ri < samples.length - 1) {
        nextX = pad.left + samples[ri + 1].t * plotW;
      } else {
        nextX = pad.left + plotW;
      }
      if (ri === 0) {
        ctx.moveTo(rx, ry);
      } else {
        ctx.lineTo(rx, ry);
      }
      ctx.lineTo(nextX, ry);
    }
    ctx.stroke();

    // ── Draw sample points ──────────────────────────────────────
    for (var pi = 0; pi < samples.length; pi++) {
      var px = pad.left + samples[pi].t * plotW;
      var py = midY - samples[pi].quantised * (plotH / 2);
      var dotRadius = Math.max(3, Math.min(6, plotW / sampleRate * 0.3));

      // Outer ring
      ctx.beginPath();
      ctx.arc(px, py, dotRadius + 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = tc.bg;
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py, dotRadius, 0, 2 * Math.PI);
      ctx.fillStyle = tc.accent;
      ctx.fill();
    }

    // ── Draw axes ───────────────────────────────────────────────
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Y axis
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    // X axis
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();
  }

  /* ── Event listeners ───────────────────────────────────────────── */
  rateSlider.addEventListener('input', function () {
    sampleRate = RATE_STEPS[parseInt(rateSlider.value, 10)];
    updateLabels();
    draw();
  });

  depthSlider.addEventListener('input', function () {
    bitDepth = parseInt(depthSlider.value, 10);
    updateLabels();
    draw();
  });

  channelBtn.addEventListener('click', function () {
    channels = channels === 1 ? 2 : 1;
    channelBtn.textContent = channels === 1 ? 'Mono' : 'Stereo';
    channelBtn.classList.toggle('active', channels === 1);
    updateLabels();
  });

  waveBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      waveform = btn.getAttribute('data-wave');
      waveBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      draw();
    });
  });

  /* ── Responsive resize ─────────────────────────────────────────── */
  SimulationEngine.debounceResize(draw);

  /* ── Initial render ────────────────────────────────────────────── */
  updateLabels();
  draw();
})();
