/**
 * Memory Management Visualiser — simulation logic.
 *
 * Shows processes loading into RAM using either contiguous or paging allocation.
 * When RAM is full, pages are swapped to a virtual-memory disk area.
 * Auto-play mode adds/removes processes over time with random TTLs.
 */
(function () {
  'use strict';

  /* ── DOM refs ──────────────────────────────────────────────────── */
  var canvas       = document.getElementById('mem-canvas');
  var ctx          = canvas.getContext('2d');
  var controlsEl   = document.getElementById('controls');
  var btnNew       = document.getElementById('btn-new-process');
  var btnEnd       = document.getElementById('btn-end-process');
  var endSelect    = document.getElementById('end-process-select');
  var ramBtns      = document.querySelectorAll('[data-ram]');
  var modeBtns     = document.querySelectorAll('[data-mode]');
  var statUsage    = document.getElementById('stat-usage');
  var statProcs    = document.getElementById('stat-procs');
  var statFaults   = document.getElementById('stat-faults');
  var statSwaps    = document.getElementById('stat-swaps');
  var logBody      = document.getElementById('event-log-body');
  var legendEl     = document.getElementById('legend-items');

  /* ── Process colours ──────────────────────────────────────────── */
  var PALETTE = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  /* ── State ─────────────────────────────────────────────────────── */
  var ramSize       = 32;           // number of RAM cells
  var allocMode     = 'paging';     // 'paging' | 'contiguous'
  var ram           = [];           // array of length ramSize, null = free, else process id
  var disk          = [];           // pages on disk: { pid, pageIndex }
  var processes     = {};           // pid -> { name, color, pages, ttl, accessOrder }
  var nextPid       = 1;
  var pageFaults    = 0;
  var swapCount     = 0;
  var stepNum       = 0;
  var accessCounter = 0;            // for LRU tracking

  /* ── Derived layout constants (set in render) ──────────────────── */
  var RAM_COLS = 8;

  /* ── Engine ────────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      resetState();
    })
    .onStep(function () {
      autoStep();
    })
    .onRender(function () {
      drawCanvas();
      updateStats();
      updateLegend();
    });

  /* ── Manual buttons ────────────────────────────────────────────── */
  btnNew.addEventListener('click', function () {
    addRandomProcess();
    engine.render();
  });

  btnEnd.addEventListener('click', function () {
    var pid = parseInt(endSelect.value, 10);
    if (pid && processes[pid]) {
      endProcess(pid);
      engine.render();
    }
  });

  /* ── RAM size buttons ──────────────────────────────────────────── */
  ramBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      ramBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      ramSize = parseInt(btn.getAttribute('data-ram'), 10);
      engine.reset();
    });
  });

  /* ── Mode buttons ──────────────────────────────────────────────── */
  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      allocMode = btn.getAttribute('data-mode');
      engine.reset();
    });
  });

  /* ── State management ──────────────────────────────────────────── */
  function resetState() {
    ram = [];
    for (var i = 0; i < ramSize; i++) ram.push(null);
    disk = [];
    processes = {};
    nextPid = 1;
    pageFaults = 0;
    swapCount = 0;
    stepNum = 0;
    accessCounter = 0;
    logBody.innerHTML = '';
    updateEndSelect();
  }

  /* ── Auto-step logic ───────────────────────────────────────────── */
  function autoStep() {
    stepNum++;

    // Tick down TTLs and remove expired processes
    var pids = Object.keys(processes);
    for (var i = 0; i < pids.length; i++) {
      var pid = parseInt(pids[i], 10);
      var proc = processes[pid];
      proc.ttl--;
      if (proc.ttl <= 0) {
        endProcess(pid);
      }
    }

    // Random chance to add a new process (70% if there's room, always try if empty)
    var activeCount = Object.keys(processes).length;
    if (activeCount === 0 || Math.random() < 0.7) {
      addRandomProcess();
    }

    updateEndSelect();
  }

  /* ── Add a random process ──────────────────────────────────────── */
  function addRandomProcess() {
    var pages = 2 + Math.floor(Math.random() * 5); // 2-6 pages
    var ttl   = 3 + Math.floor(Math.random() * 6); // 3-8 steps
    var pid   = nextPid++;
    var name  = 'P' + pid;
    var color = PALETTE[(pid - 1) % PALETTE.length];

    var proc = {
      name: name,
      color: color,
      pages: pages,
      ttl: ttl,
      accessOrder: ++accessCounter
    };

    if (allocMode === 'contiguous') {
      if (!allocateContiguous(pid, proc, pages)) {
        return; // logged inside
      }
    } else {
      allocatePaging(pid, proc, pages);
    }

    processes[pid] = proc;
    addLog('Loaded ' + name + ' (' + pages + ' pages, TTL ' + ttl + ')', color);
    updateEndSelect();
  }

  /* ── Contiguous allocation ─────────────────────────────────────── */
  function allocateContiguous(pid, proc, pages) {
    var start = findContiguousBlock(pages);
    if (start === -1) {
      // Try to free space by swapping out the oldest process
      var oldest = findOldestProcess();
      if (oldest !== -1) {
        swapProcessToDisk(oldest);
        start = findContiguousBlock(pages);
      }
    }
    if (start === -1) {
      addLog('ERROR: Cannot fit ' + proc.name + ' (' + pages + ' pages) — no contiguous block', '#ef4444');
      return false;
    }
    for (var i = start; i < start + pages; i++) {
      ram[i] = pid;
    }
    return true;
  }

  function findContiguousBlock(size) {
    var run = 0;
    for (var i = 0; i < ram.length; i++) {
      if (ram[i] === null) {
        run++;
        if (run >= size) return i - size + 1;
      } else {
        run = 0;
      }
    }
    return -1;
  }

  /* ── Paging allocation ─────────────────────────────────────────── */
  function allocatePaging(pid, proc, pages) {
    var freeCount = countFreeRAM();
    var needed = pages - freeCount;

    // Swap out pages if not enough free RAM
    if (needed > 0) {
      swapLRUPages(needed);
    }

    // Now allocate into free cells
    var placed = 0;
    for (var i = 0; i < ram.length && placed < pages; i++) {
      if (ram[i] === null) {
        ram[i] = pid;
        placed++;
      }
    }
  }

  /* ── Swap oldest process (contiguous mode) ─────────────────────── */
  function findOldestProcess() {
    var oldestPid = -1;
    var oldestAccess = Infinity;
    var pids = Object.keys(processes);
    for (var i = 0; i < pids.length; i++) {
      var pid = parseInt(pids[i], 10);
      if (processes[pid].accessOrder < oldestAccess) {
        oldestAccess = processes[pid].accessOrder;
        oldestPid = pid;
      }
    }
    return oldestPid;
  }

  function swapProcessToDisk(pid) {
    var proc = processes[pid];
    if (!proc) return;
    var pageIdx = 0;
    for (var i = 0; i < ram.length; i++) {
      if (ram[i] === pid) {
        disk.push({ pid: pid, pageIndex: pageIdx++ });
        ram[i] = null;
        swapCount++;
        pageFaults++;
      }
    }
    addLog('Swapped ' + proc.name + ' to disk (virtual memory)', proc.color, 'swap');
  }

  /* ── Swap LRU pages to disk (paging mode) ──────────────────────── */
  function swapLRUPages(count) {
    // Build list of (pid, ramIndex) sorted by process accessOrder (ascending = oldest first)
    var entries = [];
    for (var i = 0; i < ram.length; i++) {
      if (ram[i] !== null) {
        var proc = processes[ram[i]];
        if (proc) {
          entries.push({ idx: i, pid: ram[i], access: proc.accessOrder });
        }
      }
    }
    entries.sort(function (a, b) { return a.access - b.access; });

    var swapped = 0;
    for (var j = 0; j < entries.length && swapped < count; j++) {
      var e = entries[j];
      disk.push({ pid: e.pid, pageIndex: 0 });
      ram[e.idx] = null;
      swapCount++;
      pageFaults++;
      swapped++;
    }

    if (swapped > 0) {
      addLog('Swapped ' + swapped + ' page(s) to disk — page fault!', null, 'swap');
    }
  }

  /* ── End a process ─────────────────────────────────────────────── */
  function endProcess(pid) {
    var proc = processes[pid];
    if (!proc) return;

    // Free RAM cells
    for (var i = 0; i < ram.length; i++) {
      if (ram[i] === pid) ram[i] = null;
    }

    // Remove from disk
    disk = disk.filter(function (d) { return d.pid !== pid; });

    addLog(proc.name + ' ended — memory freed', proc.color, 'end');
    delete processes[pid];
    updateEndSelect();
  }

  /* ── Helpers ───────────────────────────────────────────────────── */
  function countFreeRAM() {
    var c = 0;
    for (var i = 0; i < ram.length; i++) {
      if (ram[i] === null) c++;
    }
    return c;
  }

  function updateEndSelect() {
    var html = '<option value="">-- select --</option>';
    var pids = Object.keys(processes);
    for (var i = 0; i < pids.length; i++) {
      var pid = pids[i];
      var proc = processes[pid];
      html += '<option value="' + pid + '">' + proc.name + '</option>';
    }
    endSelect.innerHTML = html;
  }

  function addLog(msg, color, cls) {
    var div = document.createElement('div');
    div.className = 'log-entry' + (cls ? ' log-' + cls : '');
    div.textContent = 'Step ' + stepNum + ': ' + msg;
    if (color) div.style.borderLeftColor = color;
    logBody.insertBefore(div, logBody.firstChild);
    // Limit log entries
    while (logBody.children.length > 50) {
      logBody.removeChild(logBody.lastChild);
    }
  }

  /* ── Update stats ──────────────────────────────────────────────── */
  function updateStats() {
    var used = 0;
    for (var i = 0; i < ram.length; i++) {
      if (ram[i] !== null) used++;
    }
    var pct = Math.round((used / ram.length) * 100);
    statUsage.textContent = pct + '%';
    statProcs.textContent = Object.keys(processes).length;
    statFaults.textContent = pageFaults;
    statSwaps.textContent = swapCount;
  }

  /* ── Update legend ─────────────────────────────────────────────── */
  function updateLegend() {
    var html = '';
    var pids = Object.keys(processes);
    for (var i = 0; i < pids.length; i++) {
      var proc = processes[pids[i]];
      html += '<div class="legend-item">' +
        '<span class="legend-swatch" style="background:' + proc.color + '"></span>' +
        proc.name + ' (TTL ' + proc.ttl + ')' +
        '</div>';
    }
    if (pids.length === 0) {
      html = '<div class="legend-note">No active processes</div>';
    }
    legendEl.innerHTML = html;
  }

  /* ── Canvas drawing ────────────────────────────────────────────── */
  function drawCanvas() {
    var size = SimulationEngine.resizeCanvas(canvas, 300, 0.5, 500);
    var w = size.w;
    var h = size.h;
    var tc = SimulationEngine.themeColors();

    // Clear
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    var pad = 12;
    var labelH = 24;
    var dividerX = Math.floor(w * 0.72);

    // ── Draw RAM grid ──────────────────────────────────────────
    drawSectionLabel(tc, pad, pad, 'RAM (' + ramSize + ' frames)', tc.text);
    var ramTop = pad + labelH;
    var ramW = dividerX - pad * 2;
    var ramH = h - ramTop - pad;
    drawGrid(tc, ram, pad, ramTop, ramW, ramH, RAM_COLS);

    // ── Draw Disk area ─────────────────────────────────────────
    var diskX = dividerX + pad;
    var diskW = w - diskX - pad;
    drawSectionLabel(tc, diskX, pad, 'Disk (Virtual Memory)', tc.muted);
    var diskTop = pad + labelH;
    var diskH = h - diskTop - pad;
    drawDiskGrid(tc, diskX, diskTop, diskW, diskH);

    // ── Divider line ───────────────────────────────────────────
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(dividerX, pad);
    ctx.lineTo(dividerX, h - pad);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawSectionLabel(tc, x, y, text, color) {
    ctx.fillStyle = color;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }

  function drawGrid(tc, cells, x, y, w, h, cols) {
    var rows = Math.ceil(cells.length / cols);
    var cellW = Math.floor(w / cols);
    var cellH = Math.floor(h / rows);
    var gap = 2;
    var radius = 4;

    for (var i = 0; i < cells.length; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = x + col * cellW + gap;
      var cy = y + row * cellH + gap;
      var cw = cellW - gap * 2;
      var ch = cellH - gap * 2;

      var pid = cells[i];
      var proc = pid !== null ? processes[pid] : null;

      // Cell background
      if (proc) {
        ctx.fillStyle = proc.color;
      } else {
        ctx.fillStyle = tc.surface;
      }

      roundRect(ctx, cx, cy, cw, ch, radius);
      ctx.fill();

      // Cell border
      ctx.strokeStyle = pid !== null ? adjustAlpha(proc ? proc.color : tc.border, 0.6) : tc.borderMuted;
      ctx.lineWidth = 1;
      roundRect(ctx, cx, cy, cw, ch, radius);
      ctx.stroke();

      // Cell label
      if (proc) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(proc.name, cx + cw / 2, cy + ch / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
      } else {
        // Empty cell — show index
        ctx.fillStyle = tc.borderMuted;
        ctx.font = '9px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('' + i, cx + cw / 2, cy + ch / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
      }
    }
  }

  function drawDiskGrid(tc, x, y, w, h) {
    if (disk.length === 0) {
      ctx.fillStyle = tc.muted;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText('(empty)', x + 8, y + 8);
      return;
    }

    var cols = 4;
    var rows = Math.ceil(disk.length / cols);
    var cellW = Math.floor(w / cols);
    var cellH = Math.min(Math.floor(h / Math.max(rows, 1)), 40);
    var gap = 2;
    var radius = 4;

    for (var i = 0; i < disk.length; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = x + col * cellW + gap;
      var cy = y + row * cellH + gap;
      var cw = cellW - gap * 2;
      var ch = cellH - gap * 2;

      var d = disk[i];
      var proc = processes[d.pid];
      var color = proc ? proc.color : tc.muted;

      ctx.fillStyle = color;
      roundRect(ctx, cx, cy, cw, ch, radius);
      ctx.fill();

      ctx.strokeStyle = adjustAlpha(color, 0.5);
      ctx.lineWidth = 1;
      roundRect(ctx, cx, cy, cw, ch, radius);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(proc ? proc.name : '?', cx + cw / 2, cy + ch / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
    }
  }

  /* ── Drawing helpers ───────────────────────────────────────────── */
  function roundRect(context, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function adjustAlpha(hex, alpha) {
    // Convert hex to rgba
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ── Resize handling ───────────────────────────────────────────── */
  SimulationEngine.debounceResize(function () { engine.render(); });

  /* ── Init ──────────────────────────────────────────────────────── */
  engine.reset();
})();
