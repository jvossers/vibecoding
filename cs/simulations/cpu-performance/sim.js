/**
 * CPU Performance Simulator — simulation logic.
 *
 * Compare two CPUs side-by-side: adjust clock speed, cores and cache
 * to see how they affect task processing throughput.
 */
(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────────── */
  var canvas     = document.getElementById('cpu-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');

  var cpuAClock = document.getElementById('cpu-a-clock');
  var cpuACores = document.getElementById('cpu-a-cores');
  var cpuACache = document.getElementById('cpu-a-cache');
  var cpuBClock = document.getElementById('cpu-b-clock');
  var cpuBCores = document.getElementById('cpu-b-cores');
  var cpuBCache = document.getElementById('cpu-b-cache');
  var generateBtn = document.getElementById('btn-generate');

  var statASteps  = document.getElementById('stat-a-steps');
  var statARate   = document.getElementById('stat-a-rate');
  var statBSteps  = document.getElementById('stat-b-steps');
  var statBRate   = document.getElementById('stat-b-rate');
  var statWinner  = document.getElementById('stat-winner');

  /* ── Constants ──────────────────────────────────────────────── */
  var TASK_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  var TOTAL_TASKS = 12;

  var CACHE_MULTIPLIER = {
    small:  1.0,
    medium: 1.15,
    large:  1.30
  };

  /* ── State ──────────────────────────────────────────────────── */
  var tasks = [];         // shared task list (work units + color)
  var cpuA = null;        // { clock, cores, cache, queue, coreSlots, completed, steps, finished }
  var cpuB = null;
  var stepCount = 0;
  var bothFinished = false;

  /* ── Engine ─────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      generateTasks();
      resetCPUs();
      stepCount = 0;
      bothFinished = false;
    })
    .onStep(function () {
      if (bothFinished) return false;
      stepCount++;
      processCPU(cpuA);
      processCPU(cpuB);
      if (cpuA.finished && cpuB.finished) {
        bothFinished = true;
        return false;
      }
    })
    .onRender(function () {
      draw();
      updateStats();
    });

  /* ── Generate tasks button ──────────────────────────────────── */
  generateBtn.addEventListener('click', function () { engine.reset(); });

  /* ── Config change → reset ──────────────────────────────────── */
  [cpuAClock, cpuACores, cpuACache, cpuBClock, cpuBCores, cpuBCache].forEach(function (el) {
    el.addEventListener('change', function () { engine.reset(); });
  });

  /* ── Task generation ────────────────────────────────────────── */
  function generateTasks() {
    tasks = [];
    for (var i = 0; i < TOTAL_TASKS; i++) {
      tasks.push({
        id: i,
        workTotal: Math.floor(Math.random() * 4) + 1,   // 1-4 work units
        color: TASK_COLORS[i % TASK_COLORS.length]
      });
    }
  }

  /* ── CPU setup ──────────────────────────────────────────────── */
  function readConfig(clockEl, coresEl, cacheEl) {
    return {
      clock: parseInt(clockEl.value, 10),
      coreCount: parseInt(coresEl.value, 10),
      cache: cacheEl.value
    };
  }

  function resetCPUs() {
    var cfgA = readConfig(cpuAClock, cpuACores, cpuACache);
    var cfgB = readConfig(cpuBClock, cpuBCores, cpuBCache);

    cpuA = makeCPU(cfgA);
    cpuB = makeCPU(cfgB);
  }

  function makeCPU(cfg) {
    // deep copy tasks into the queue
    var queue = [];
    for (var i = 0; i < tasks.length; i++) {
      queue.push({
        id: tasks[i].id,
        workTotal: tasks[i].workTotal,
        workDone: 0,
        color: tasks[i].color
      });
    }
    var coreSlots = [];
    for (var c = 0; c < cfg.coreCount; c++) {
      coreSlots.push(null); // empty core
    }
    return {
      clock: cfg.clock,
      coreCount: cfg.coreCount,
      cache: cfg.cache,
      queue: queue,
      coreSlots: coreSlots,
      completed: [],
      steps: 0,
      finished: false
    };
  }

  /* ── Processing logic ───────────────────────────────────────── */
  function processCPU(cpu) {
    if (cpu.finished) return;
    cpu.steps++;

    var speed = cpu.clock * CACHE_MULTIPLIER[cpu.cache];

    // Load tasks into empty cores from queue
    for (var c = 0; c < cpu.coreSlots.length; c++) {
      if (cpu.coreSlots[c] === null && cpu.queue.length > 0) {
        cpu.coreSlots[c] = cpu.queue.shift();
      }
    }

    // Process each core
    for (var c2 = 0; c2 < cpu.coreSlots.length; c2++) {
      var task = cpu.coreSlots[c2];
      if (task === null) continue;

      task.workDone += speed;

      if (task.workDone >= task.workTotal) {
        cpu.completed.push(task);
        cpu.coreSlots[c2] = null;

        // Immediately load next task if available
        if (cpu.queue.length > 0) {
          cpu.coreSlots[c2] = cpu.queue.shift();
        }
      }
    }

    // Check if finished
    if (cpu.completed.length >= TOTAL_TASKS) {
      cpu.finished = true;
    }
  }

  /* ── Stats ──────────────────────────────────────────────────── */
  function updateStats() {
    statASteps.textContent = cpuA.steps;
    statBSteps.textContent = cpuB.steps;

    var rateA = cpuA.steps > 0 ? (cpuA.completed.length / cpuA.steps).toFixed(1) : '0.0';
    var rateB = cpuB.steps > 0 ? (cpuB.completed.length / cpuB.steps).toFixed(1) : '0.0';
    statARate.textContent = rateA;
    statBRate.textContent = rateB;

    if (bothFinished) {
      if (cpuA.steps < cpuB.steps) {
        statWinner.textContent = 'CPU A wins!';
        statWinner.style.color = '#10b981';
      } else if (cpuB.steps < cpuA.steps) {
        statWinner.textContent = 'CPU B wins!';
        statWinner.style.color = '#10b981';
      } else {
        statWinner.textContent = 'Tie!';
        statWinner.style.color = '';
      }
    } else {
      statWinner.textContent = '';
      statWinner.style.color = '';
    }
  }

  /* ── Canvas drawing ─────────────────────────────────────────── */
  function draw() {
    var size = SimulationEngine.resizeCanvas(canvas, 300, 0.45, 450);
    var w = size.w;
    var h = size.h;
    var tc = SimulationEngine.themeColors();

    // Background
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    // Divider
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw each CPU
    drawCPU(cpuA, 0, 0, w / 2, h, 'CPU A', tc);
    drawCPU(cpuB, w / 2, 0, w / 2, h, 'CPU B', tc);
  }

  function drawCPU(cpu, ox, oy, aw, ah, label, tc) {
    var pad = Math.min(16, aw * 0.04);
    var innerW = aw - pad * 2;
    var innerH = ah - pad * 2;

    // Label
    ctx.fillStyle = tc.text;
    ctx.font = 'bold ' + Math.max(13, Math.min(16, aw * 0.04)) + 'px ' + getFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, ox + aw / 2, oy + pad);

    var labelH = 24;
    var sectionTop = oy + pad + labelH;
    var sectionH = innerH - labelH;

    // Layout: queue on top, cores + cache in the middle, completed at bottom
    var queueH = sectionH * 0.18;
    var cpuAreaH = sectionH * 0.55;
    var completedH = sectionH * 0.22;
    var gapH = (sectionH - queueH - cpuAreaH - completedH) / 2;

    var queueY = sectionTop;
    var cpuY = queueY + queueH + gapH;
    var completedY = cpuY + cpuAreaH + gapH;

    // ── Task Queue ──
    drawTaskQueue(cpu.queue, ox + pad, queueY, innerW, queueH, tc, 'Queue');

    // ── Cores + Cache area ──
    var cacheW = innerW * 0.2;
    var coresW = innerW - cacheW - pad * 0.5;

    drawCores(cpu, ox + pad, cpuY, coresW, cpuAreaH, tc);
    drawCache(cpu.cache, ox + pad + coresW + pad * 0.5, cpuY, cacheW, cpuAreaH, tc);

    // ── Completed area ──
    drawTaskQueue(cpu.completed, ox + pad, completedY, innerW, completedH, tc, 'Done');
  }

  function drawTaskQueue(taskList, x, y, w, h, tc, label) {
    // Section label
    ctx.fillStyle = tc.muted;
    ctx.font = Math.max(10, Math.min(12, w * 0.035)) + 'px ' + getFont();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label + ' (' + taskList.length + ')', x, y);

    var labelOffset = 16;
    var blockArea = h - labelOffset;
    var blockSize = Math.min(Math.max(12, blockArea * 0.7), 24);
    var gap = Math.min(4, blockSize * 0.2);
    var maxBlocks = Math.floor((w + gap) / (blockSize + gap));
    var count = Math.min(taskList.length, maxBlocks);
    var by = y + labelOffset + (blockArea - blockSize) / 2;

    for (var i = 0; i < count; i++) {
      var bx = x + i * (blockSize + gap);
      ctx.fillStyle = taskList[i].color;
      roundRect(ctx, bx, by, blockSize, blockSize, 3);
      ctx.fill();

      // Show work units text inside block
      if (blockSize >= 16) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.max(8, blockSize * 0.45) + 'px ' + getFont();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(taskList[i].workTotal.toString(), bx + blockSize / 2, by + blockSize / 2);
      }
    }

    // Show overflow indicator
    if (taskList.length > maxBlocks) {
      ctx.fillStyle = tc.muted;
      ctx.font = Math.max(10, blockSize * 0.5) + 'px ' + getFont();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('+' + (taskList.length - maxBlocks), x + count * (blockSize + gap) + 2, by + blockSize / 2);
    }
  }

  function drawCores(cpu, x, y, w, h, tc) {
    var coreCount = cpu.coreCount;
    var cols = coreCount <= 2 ? coreCount : 2;
    var rows = Math.ceil(coreCount / cols);
    var gap = Math.min(8, w * 0.04);
    var coreW = (w - gap * (cols - 1)) / cols;
    var coreH = (h - gap * (rows - 1)) / rows;

    for (var i = 0; i < coreCount; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = x + col * (coreW + gap);
      var cy = y + row * (coreH + gap);

      // Core background
      ctx.fillStyle = tc.surface;
      roundRect(ctx, cx, cy, coreW, coreH, 6);
      ctx.fill();

      // Core border
      ctx.strokeStyle = tc.border;
      ctx.lineWidth = 1.5;
      roundRect(ctx, cx, cy, coreW, coreH, 6);
      ctx.stroke();

      // Core label
      ctx.fillStyle = tc.muted;
      ctx.font = Math.max(9, Math.min(11, coreW * 0.12)) + 'px ' + getFont();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Core ' + (i + 1), cx + 6, cy + 4);

      // Task inside core
      var task = cpu.coreSlots[i];
      if (task !== null) {
        var taskPad = Math.min(10, coreW * 0.1);
        var taskY = cy + 18;
        var taskW = coreW - taskPad * 2;
        var taskH = coreH - 26 - taskPad;

        if (taskH > 8 && taskW > 8) {
          // Task block
          ctx.fillStyle = task.color;
          roundRect(ctx, cx + taskPad, taskY, taskW, taskH * 0.6, 4);
          ctx.fill();

          // Work units label inside task
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold ' + Math.max(10, Math.min(14, taskH * 0.3)) + 'px ' + getFont();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(task.workTotal.toString(), cx + taskPad + taskW / 2, taskY + taskH * 0.3);

          // Progress bar background
          var barY = taskY + taskH * 0.65 + 4;
          var barH = Math.min(8, taskH * 0.15);
          ctx.fillStyle = tc.bg;
          roundRect(ctx, cx + taskPad, barY, taskW, barH, 2);
          ctx.fill();

          // Progress bar fill
          var progress = Math.min(1, task.workDone / task.workTotal);
          if (progress > 0) {
            ctx.fillStyle = task.color;
            roundRect(ctx, cx + taskPad, barY, taskW * progress, barH, 2);
            ctx.fill();
          }

          // Progress text
          ctx.fillStyle = tc.muted;
          ctx.font = Math.max(8, Math.min(10, taskH * 0.15)) + 'px ' + getFont();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(Math.round(progress * 100) + '%', cx + taskPad + taskW / 2, barY + barH + 2);
        }
      } else {
        // Empty core indicator
        ctx.fillStyle = tc.muted;
        ctx.font = Math.max(10, Math.min(12, coreW * 0.12)) + 'px ' + getFont();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('idle', cx + coreW / 2, cy + coreH / 2 + 4);
      }
    }
  }

  function drawCache(cacheSize, x, y, w, h, tc) {
    // Cache height varies by size setting
    var cacheRatio = { small: 0.35, medium: 0.6, large: 0.9 };
    var ratio = cacheRatio[cacheSize] || 0.35;
    var cacheH = h * ratio;
    var cacheY = y + (h - cacheH) / 2;

    // Cache background
    ctx.fillStyle = tc.surfaceAlt;
    roundRect(ctx, x, cacheY, w, cacheH, 6);
    ctx.fill();

    // Cache border
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    roundRect(ctx, x, cacheY, w, cacheH, 6);
    ctx.stroke();

    // Cache label
    ctx.fillStyle = tc.muted;
    ctx.font = Math.max(9, Math.min(11, w * 0.18)) + 'px ' + getFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Cache', x + w / 2, cacheY + 6);

    // Size label
    var sizeLabels = { small: 'S', medium: 'M', large: 'L' };
    ctx.fillStyle = tc.primary;
    ctx.font = 'bold ' + Math.max(12, Math.min(18, w * 0.3)) + 'px ' + getFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sizeLabels[cacheSize], x + w / 2, cacheY + cacheH / 2 + 4);

    // Speed bonus label
    var bonusLabel = { small: '1.0x', medium: '1.15x', large: '1.3x' };
    ctx.fillStyle = tc.muted;
    ctx.font = Math.max(8, Math.min(10, w * 0.16)) + 'px ' + getFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(bonusLabel[cacheSize], x + w / 2, cacheY + cacheH - 4);
  }

  /* ── Drawing helpers ────────────────────────────────────────── */
  function roundRect(c, x, y, w, h, r) {
    if (w < 0) w = 0;
    if (h < 0) h = 0;
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r);
    c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h);
    c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r);
    c.arcTo(x, y, x + r, y, r);
    c.closePath();
  }

  function getFont() {
    return "'Segoe UI', system-ui, -apple-system, sans-serif";
  }

  /* ── Resize handling ────────────────────────────────────────── */
  SimulationEngine.debounceResize(function () { engine.render(); });

  /* ── Init ───────────────────────────────────────────────────── */
  engine.reset();
})();
