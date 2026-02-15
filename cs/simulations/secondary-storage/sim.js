/**
 * Secondary Storage Comparator — simulation logic.
 *
 * Animates data transfers across HDD, SSD, Optical and USB devices,
 * each at their realistic relative speeds.
 */
(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────────── */
  var canvas     = document.getElementById('storage-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');
  var sizeBtns   = document.querySelectorAll('.algo-btn[data-size]');

  /* ── Device definitions ─────────────────────────────────────── */
  var DEVICES = [
    { key: 'hdd',     label: 'HDD',     speed: 150 },
    { key: 'ssd',     label: 'SSD',     speed: 550 },
    { key: 'optical', label: 'Optical', speed: 36  },
    { key: 'usb',     label: 'USB',     speed: 100 }
  ];

  /* ── State ──────────────────────────────────────────────────── */
  var fileSizeMB = 1;        // current file size in MB
  var progress   = [0, 0, 0, 0];  // 0..1 for each device
  var finished   = [false, false, false, false];
  var stepTime   = 0;        // simulated elapsed time in seconds
  var animPhase  = 0;        // increments each step for spinning animation

  /* How many simulated seconds pass per engine step */
  var TIME_PER_STEP = 0.05;

  /* ── Engine ─────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      progress = [0, 0, 0, 0];
      finished = [false, false, false, false];
      stepTime = 0;
      animPhase = 0;
    })
    .onStep(function () {
      /* Scale time step by file size so large files don't take forever */
      var scaledStep = TIME_PER_STEP * Math.max(1, fileSizeMB / 10);
      stepTime += scaledStep;
      animPhase++;

      var allDone = true;
      for (var i = 0; i < DEVICES.length; i++) {
        if (!finished[i]) {
          var transferred = DEVICES[i].speed * stepTime; // MB transferred
          progress[i] = Math.min(1, transferred / fileSizeMB);
          if (progress[i] >= 1) {
            progress[i] = 1;
            finished[i] = true;
          } else {
            allDone = false;
          }
        }
      }
      if (allDone) return false; // signal finish
    })
    .onRender(function () {
      drawCanvas();
    });

  /* ── File size selector buttons ─────────────────────────────── */
  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sizeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      fileSizeMB = parseInt(btn.getAttribute('data-size'), 10);
      engine.reset();
    });
  });

  /* ── Canvas drawing ─────────────────────────────────────────── */
  function drawCanvas() {
    var size = SimulationEngine.resizeCanvas(canvas, 300, 0.5, 450);
    var w = size.w;
    var h = size.h;
    var tc = SimulationEngine.themeColors();

    // Clear
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    var colW = w / 4;
    var pad = 12;
    var deviceAreaTop = pad;
    var deviceAreaH = h * 0.55;
    var labelY = deviceAreaTop + deviceAreaH + 20;
    var barY = labelY + 22;
    var barH = 16;
    var timeY = barY + barH + 18;

    for (var i = 0; i < DEVICES.length; i++) {
      var cx = colW * i + colW / 2;
      var left = colW * i + pad;
      var deviceW = colW - pad * 2;
      var deviceCx = left + deviceW / 2;
      var deviceCy = deviceAreaTop + deviceAreaH / 2;
      var deviceR = Math.min(deviceW, deviceAreaH) / 2 - 8;

      switch (DEVICES[i].key) {
        case 'hdd':
          drawHDD(tc, deviceCx, deviceCy, deviceR, progress[i], finished[i]);
          break;
        case 'ssd':
          drawSSD(tc, left, deviceAreaTop + 10, deviceW, deviceAreaH - 20, progress[i], finished[i]);
          break;
        case 'optical':
          drawOptical(tc, deviceCx, deviceCy, deviceR, progress[i], finished[i]);
          break;
        case 'usb':
          drawUSB(tc, left, deviceAreaTop + 10, deviceW, deviceAreaH - 20, progress[i], finished[i]);
          break;
      }

      // Label
      ctx.fillStyle = tc.text;
      ctx.font = 'bold ' + Math.max(12, Math.min(16, colW * 0.12)) + 'px ' + 'system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(DEVICES[i].label, cx, labelY);

      // Progress bar background
      var barLeft = left;
      var barWidth = deviceW;
      ctx.fillStyle = tc.border;
      roundRect(ctx, barLeft, barY, barWidth, barH, 4);
      ctx.fill();

      // Progress bar fill
      var fillW = barWidth * progress[i];
      if (fillW > 0) {
        ctx.fillStyle = finished[i] ? tc.accent : tc.primary;
        roundRect(ctx, barLeft, barY, Math.max(fillW, 4), barH, 4);
        ctx.fill();
      }

      // Percentage text
      ctx.fillStyle = tc.muted;
      ctx.font = Math.max(10, Math.min(12, colW * 0.09)) + 'px ' + 'system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(Math.floor(progress[i] * 100) + '%', cx, barY + barH + 3);

      // Transfer time
      if (finished[i]) {
        var transferTime = fileSizeMB / DEVICES[i].speed;
        ctx.fillStyle = tc.accent;
        ctx.font = Math.max(10, Math.min(12, colW * 0.09)) + 'px ' + 'system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(formatTime(transferTime), cx, timeY);
      }
    }
  }

  /* ── Device drawing functions ───────────────────────────────── */

  function drawHDD(tc, cx, cy, r, prog, done) {
    // Platter (spinning disc)
    var angle = animPhase * 0.15;

    // Outer platter
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = tc.muted;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner rings for texture
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = tc.surface;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Spinning indicator line on platter
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(r * 0.18, 0);
    ctx.lineTo(r * 0.65, 0);
    ctx.strokeStyle = tc.surfaceAlt;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.restore();

    // Read/write arm — sweeps based on progress
    var armAngle = -Math.PI * 0.3 + prog * Math.PI * 0.5;
    var armPivotX = cx + r * 0.85;
    var armPivotY = cy + r * 0.7;
    var armLen = r * 1.1;

    ctx.save();
    ctx.translate(armPivotX, armPivotY);
    ctx.rotate(armAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-armLen, 0);
    ctx.strokeStyle = done ? tc.accent : tc.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Arm head
    ctx.beginPath();
    ctx.arc(-armLen, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = done ? tc.accent : tc.primary;
    ctx.fill();
    ctx.restore();

    // Arm pivot
    ctx.beginPath();
    ctx.arc(armPivotX, armPivotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = tc.surface;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawSSD(tc, x, y, w, h, prog, done) {
    // SSD body
    roundRect(ctx, x, y, w, h, 6);
    ctx.fillStyle = tc.surface;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 6);
    ctx.stroke();

    // Label on device
    ctx.fillStyle = tc.muted;
    ctx.font = 'bold ' + Math.max(9, Math.min(11, w * 0.1)) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('SSD', x + w / 2, y + 6);

    // Memory cell grid
    var gridPad = 8;
    var gridX = x + gridPad;
    var gridY = y + 22;
    var gridW = w - gridPad * 2;
    var gridH = h - 30;
    var cols = 6;
    var rows = 4;
    var cellPadding = 2;
    var cellW = (gridW - (cols - 1) * cellPadding) / cols;
    var cellH = (gridH - (rows - 1) * cellPadding) / rows;
    var totalCells = cols * rows;
    var litCells = Math.floor(prog * totalCells);

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var cellIdx = row * cols + col;
        var cx = gridX + col * (cellW + cellPadding);
        var cy = gridY + row * (cellH + cellPadding);

        if (cellIdx < litCells) {
          ctx.fillStyle = done ? tc.accent : tc.accent;
        } else {
          ctx.fillStyle = tc.surfaceAlt;
        }
        roundRect(ctx, cx, cy, cellW, cellH, 2);
        ctx.fill();
        ctx.strokeStyle = tc.borderMuted;
        ctx.lineWidth = 0.5;
        roundRect(ctx, cx, cy, cellW, cellH, 2);
        ctx.stroke();
      }
    }

    // Connector pins at bottom
    var pinW = 4;
    var pinH = 3;
    var pinCount = 5;
    var pinGap = (w - pinCount * pinW) / (pinCount + 1);
    for (var p = 0; p < pinCount; p++) {
      var px = x + pinGap + p * (pinW + pinGap);
      ctx.fillStyle = tc.borderMuted;
      ctx.fillRect(px, y + h - 1, pinW, pinH);
    }
  }

  function drawOptical(tc, cx, cy, r, prog, done) {
    var angle = animPhase * 0.12;

    // Disc body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = tc.highlight;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rainbow-ish sheen effect (subtle arcs)
    for (var ring = 0; ring < 5; ring++) {
      var ringR = r * 0.3 + (r * 0.65 * ring / 5);
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = tc.borderMuted;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = tc.bg;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Spinning track marker
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(r * 0.2, 0);
    ctx.lineTo(r * 0.9, 0);
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.restore();

    // Laser beam — moves radially based on progress
    var laserAngle = -Math.PI / 2 + prog * Math.PI * 1.5;
    var laserDist = r * 0.2 + prog * r * 0.65;
    var laserX = cx + Math.cos(laserAngle) * laserDist;
    var laserY = cy + Math.sin(laserAngle) * laserDist;

    // Laser line from edge
    ctx.beginPath();
    ctx.moveTo(cx + r * 1.05, cy + r * 0.3);
    ctx.lineTo(laserX, laserY);
    ctx.strokeStyle = done ? tc.accent : tc.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Laser dot
    ctx.beginPath();
    ctx.arc(laserX, laserY, 3, 0, Math.PI * 2);
    ctx.fillStyle = done ? tc.accent : tc.primary;
    ctx.fill();

    // Glow effect around laser dot
    if (!done) {
      ctx.beginPath();
      ctx.arc(laserX, laserY, 7, 0, Math.PI * 2);
      ctx.fillStyle = tc.primary;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawUSB(tc, x, y, w, h, prog, done) {
    // USB stick proportions
    var bodyW = w * 0.6;
    var bodyH = h * 0.65;
    var bodyX = x + (w - bodyW) / 2;
    var bodyY = y + h * 0.15;

    // Connector (top part)
    var connW = bodyW * 0.55;
    var connH = bodyH * 0.22;
    var connX = bodyX + (bodyW - connW) / 2;
    var connY = bodyY - connH + 2;

    // Connector metal
    ctx.fillStyle = tc.borderMuted;
    roundRect(ctx, connX, connY, connW, connH, 2);
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1;
    roundRect(ctx, connX, connY, connW, connH, 2);
    ctx.stroke();

    // Connector slots
    var slotW = connW * 0.5;
    var slotH = connH * 0.35;
    var slotX = connX + (connW - slotW) / 2;
    var slotY = connY + (connH - slotH) / 2;
    ctx.fillStyle = tc.bg;
    ctx.fillRect(slotX, slotY, slotW, slotH);

    // Body
    roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 5);
    ctx.fillStyle = tc.surfaceAlt;
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 2;
    roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 5);
    ctx.stroke();

    // Chip inside body
    var chipW = bodyW * 0.5;
    var chipH = bodyH * 0.35;
    var chipX = bodyX + (bodyW - chipW) / 2;
    var chipY = bodyY + bodyH * 0.15;

    ctx.fillStyle = done ? tc.accent : tc.accent;
    roundRect(ctx, chipX, chipY, chipW, chipH, 3);
    ctx.fill();
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1;
    roundRect(ctx, chipX, chipY, chipW, chipH, 3);
    ctx.stroke();

    // Chip pins
    var pinCount = 4;
    var pinW = chipW / (pinCount * 2 - 1);
    for (var p = 0; p < pinCount; p++) {
      var px = chipX + p * pinW * 2;
      ctx.fillStyle = tc.borderMuted;
      ctx.fillRect(px, chipY + chipH, pinW, 3);
      ctx.fillRect(px, chipY - 3, pinW, 3);
    }

    // Activity LED
    var ledR = Math.min(5, bodyW * 0.06);
    var ledX = bodyX + bodyW * 0.75;
    var ledY = bodyY + bodyH * 0.75;

    // LED blinks during transfer
    var ledOn = !done && prog > 0 && prog < 1 && animPhase % 4 < 2;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledR, 0, Math.PI * 2);
    ctx.fillStyle = done ? tc.accent : (ledOn ? tc.primary : tc.borderMuted);
    ctx.fill();

    // USB label
    ctx.fillStyle = tc.muted;
    ctx.font = 'bold ' + Math.max(8, Math.min(10, bodyW * 0.12)) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('USB', bodyX + bodyW / 2, bodyY + bodyH * 0.58);

    // Keyring loop at bottom
    var loopCx = bodyX + bodyW / 2;
    var loopCy = bodyY + bodyH + 6;
    var loopR = Math.min(6, bodyW * 0.08);
    ctx.beginPath();
    ctx.arc(loopCx, loopCy, loopR, 0, Math.PI * 2);
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /* ── Utility helpers ────────────────────────────────────────── */

  function roundRect(c, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function formatTime(seconds) {
    if (seconds < 1) {
      return Math.round(seconds * 1000) + ' ms';
    } else if (seconds < 60) {
      return seconds.toFixed(1) + ' s';
    } else if (seconds < 3600) {
      var mins = Math.floor(seconds / 60);
      var secs = Math.round(seconds % 60);
      return mins + 'm ' + secs + 's';
    } else {
      var hrs = Math.floor(seconds / 3600);
      var remMins = Math.round((seconds % 3600) / 60);
      return hrs + 'h ' + remMins + 'm';
    }
  }

  /* ── Resize handling ────────────────────────────────────────── */
  SimulationEngine.debounceResize(function () { engine.render(); });

  /* ── Init ───────────────────────────────────────────────────── */
  engine.reset();
})();
