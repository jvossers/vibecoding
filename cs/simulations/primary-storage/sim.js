/**
 * Primary Storage Explorer — simulation logic.
 *
 * Three tabs: RAM vs ROM, Virtual Memory, Cache Demo.
 * Pre-computes all steps at setup, then plays back by index.
 */
(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────────── */
  var canvas     = document.getElementById('sim-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');
  var statsBar   = document.getElementById('stats-bar');
  var tabBtns    = document.querySelectorAll('.algo-btn');

  /* ── Feedback colours ────────────────────────────────────────── */
  var CLR_GREEN = '#10b981';
  var CLR_RED   = '#ef4444';
  var CLR_AMBER = '#f59e0b';

  /* ── Process colours for virtual memory tab ──────────────────── */
  var PROC_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  /* ── State ───────────────────────────────────────────────────── */
  var currentTab = 'ram-rom';
  var steps = [];
  var stepIndex = 0;

  /* ── Engine ──────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      generateSteps();
      stepIndex = 0;
      buildStatsBar();
    })
    .onStep(function () {
      if (stepIndex >= steps.length - 1) return false;
      stepIndex++;
    })
    .onRender(drawFrame);

  /* ── Tab switching ──────────────────────────────────────────── */
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTab = btn.getAttribute('data-tab');
      engine.reset();
    });
  });

  /* ── Stats bar builder ──────────────────────────────────────── */
  function buildStatsBar() {
    statsBar.innerHTML = '';

    if (currentTab === 'ram-rom') {
      statsBar.innerHTML =
        '<div class="stat-item"><span class="stat-label">Power:</span> <span class="stat-value" id="stat-power">ON</span></div>' +
        '<div class="stat-item"><span class="stat-label">Step:</span> <span class="stat-value" id="stat-step">0</span></div>';
    } else if (currentTab === 'virtual-memory') {
      statsBar.innerHTML =
        '<div class="stat-item"><span class="stat-label">Page Swaps:</span> <span class="stat-value" id="stat-swaps">0</span></div>' +
        '<div class="stat-item"><span class="stat-label">RAM Used:</span> <span class="stat-value" id="stat-ram-used">0 / 8</span></div>' +
        '<div class="stat-item"><span class="stat-label">Step:</span> <span class="stat-value" id="stat-step">0</span></div>';
    } else if (currentTab === 'cache') {
      statsBar.innerHTML =
        '<div class="stat-item"><span class="stat-label">Hit Rate:</span> <span class="stat-value" id="stat-hitrate">0%</span></div>' +
        '<div class="stat-item"><span class="stat-label">Avg Access:</span> <span class="stat-value" id="stat-access">0 ns</span></div>' +
        '<div class="stat-item"><span class="stat-label">Step:</span> <span class="stat-value" id="stat-step">0</span></div>';
    }
  }

  /* =================================================================
   *  STEP GENERATION — each tab pre-computes its own step sequence
   * ================================================================= */
  function generateSteps() {
    steps = [];
    switch (currentTab) {
      case 'ram-rom':        genRamRom();        break;
      case 'virtual-memory': genVirtualMemory();  break;
      case 'cache':          genCache();          break;
    }
  }

  /* ── Helper: random hex byte ────────────────────────────────── */
  function randHex() {
    return '0x' + ('0' + Math.floor(Math.random() * 256).toString(16).toUpperCase()).slice(-2);
  }

  /* ── Helper: random data values for RAM ─────────────────────── */
  function randomRamData() {
    var data = [];
    for (var i = 0; i < 8; i++) data.push(randHex());
    return data;
  }

  /* ── ROM boot data (constant) ───────────────────────────────── */
  var ROM_DATA = ['BIOS', 'POST', 'BOOT', 'INIT', 'LOAD', 'CHCK', 'CONF', 'STRT'];

  /* ────────────────────────────────────────────────────────────────
   *  RAM vs ROM — toggle power on/off, show volatile vs non-volatile
   * ──────────────────────────────────────────────────────────────── */
  function genRamRom() {
    var ramData = randomRamData();

    // Step 0: Power ON, both populated
    snap_ramrom(true, ramData.slice(), ROM_DATA.slice(), 1.0, 'Power is ON. RAM holds program data; ROM holds firmware.', 'none');

    // Steps: gradually fade RAM data (power going off)
    snap_ramrom(false, ramData.slice(), ROM_DATA.slice(), 0.8, 'Power OFF! RAM begins losing data (volatile)...', 'fading');
    snap_ramrom(false, ramData.slice(), ROM_DATA.slice(), 0.5, 'RAM data fading... voltage dropping.', 'fading');
    snap_ramrom(false, ramData.slice(), ROM_DATA.slice(), 0.2, 'RAM nearly empty... data almost gone.', 'fading');

    // Step 4: RAM empty, ROM stays
    var emptyRam = [];
    for (var i = 0; i < 8; i++) emptyRam.push('----');
    snap_ramrom(false, emptyRam, ROM_DATA.slice(), 0.0, 'RAM is empty! ROM retains all data (non-volatile).', 'empty');

    // Steps: Power back on, RAM refills
    var newRam = randomRamData();
    snap_ramrom(true, newRam.slice(), ROM_DATA.slice(), 0.3, 'Power ON! New data loading into RAM...', 'filling');
    snap_ramrom(true, newRam.slice(), ROM_DATA.slice(), 0.6, 'RAM refilling with new program data...', 'filling');
    snap_ramrom(true, newRam.slice(), ROM_DATA.slice(), 1.0, 'RAM fully loaded with NEW data. ROM unchanged.', 'full');

    // Repeat cycle with different data
    snap_ramrom(false, newRam.slice(), ROM_DATA.slice(), 0.8, 'Power OFF again! RAM data fading...', 'fading');
    snap_ramrom(false, newRam.slice(), ROM_DATA.slice(), 0.4, 'RAM losing data...', 'fading');
    var emptyRam2 = [];
    for (var j = 0; j < 8; j++) emptyRam2.push('----');
    snap_ramrom(false, emptyRam2, ROM_DATA.slice(), 0.0, 'RAM cleared. ROM still has the same boot data.', 'empty');

    var newerRam = randomRamData();
    snap_ramrom(true, newerRam.slice(), ROM_DATA.slice(), 0.5, 'Power ON! Loading different data into RAM...', 'filling');
    snap_ramrom(true, newerRam.slice(), ROM_DATA.slice(), 1.0, 'Complete! Notice: RAM has different data each time; ROM never changes.', 'full');
  }

  function snap_ramrom(powerOn, ramData, romData, ramOpacity, desc, anim) {
    steps.push({
      tab: 'ram-rom',
      powerOn: powerOn,
      ramData: ramData,
      romData: romData,
      ramOpacity: ramOpacity,
      desc: desc,
      anim: anim
    });
  }

  /* ────────────────────────────────────────────────────────────────
   *  Virtual Memory — programs fill RAM, overflow to disk
   * ──────────────────────────────────────────────────────────────── */
  function genVirtualMemory() {
    var ram = [];          // 8 slots: null or { pid, page }
    var disk = [];         // array of { pid, page }
    var swaps = 0;
    var loadOrder = 0;     // for FIFO eviction

    for (var i = 0; i < 8; i++) ram.push(null);

    // Programs: P1 needs 3 pages, P2 needs 3, P3 needs 4, P4 needs 3
    var programs = [
      { id: 1, name: 'P1', pages: 3, color: PROC_COLORS[0] },
      { id: 2, name: 'P2', pages: 3, color: PROC_COLORS[1] },
      { id: 3, name: 'P3', pages: 4, color: PROC_COLORS[2] },
      { id: 4, name: 'P4', pages: 3, color: PROC_COLORS[3] }
    ];

    // Initial state
    snap_vm(ram, disk, swaps, 'RAM is empty. Programs will request memory pages.', null, false);

    // Load programs one page at a time
    for (var pi = 0; pi < programs.length; pi++) {
      var prog = programs[pi];
      for (var pg = 0; pg < prog.pages; pg++) {
        loadOrder++;
        var freeSlot = -1;
        for (var s = 0; s < 8; s++) {
          if (ram[s] === null) { freeSlot = s; break; }
        }

        if (freeSlot >= 0) {
          // Free space in RAM
          ram[freeSlot] = { pid: prog.id, page: pg, name: prog.name, color: prog.color, order: loadOrder };
          snap_vm(ram, disk, swaps, prog.name + ' page ' + pg + ' loaded into RAM slot ' + freeSlot + '.', { type: 'load', slot: freeSlot }, false);
        } else {
          // RAM full — swap oldest page to disk
          var oldestIdx = 0;
          var oldestOrder = ram[0].order;
          for (var oi = 1; oi < 8; oi++) {
            if (ram[oi] && ram[oi].order < oldestOrder) {
              oldestOrder = ram[oi].order;
              oldestIdx = oi;
            }
          }
          var evicted = ram[oldestIdx];
          disk.push({ pid: evicted.pid, page: evicted.page, name: evicted.name, color: evicted.color });
          swaps++;

          snap_vm(ram, disk, swaps,
            evicted.name + ' page ' + evicted.page + ' swapped to disk (oldest in RAM).',
            { type: 'swap', fromSlot: oldestIdx, toDisk: disk.length - 1 }, false);

          ram[oldestIdx] = { pid: prog.id, page: pg, name: prog.name, color: prog.color, order: loadOrder };
          snap_vm(ram, disk, swaps,
            prog.name + ' page ' + pg + ' loaded into RAM slot ' + oldestIdx + '.',
            { type: 'load', slot: oldestIdx }, false);
        }
      }
    }

    // Now simulate rapid swapping (thrashing)
    var thrashProgs = [
      { id: 5, name: 'P5', color: PROC_COLORS[4] },
      { id: 6, name: 'P6', color: PROC_COLORS[5] }
    ];

    for (var ti = 0; ti < 6; ti++) {
      var tp = thrashProgs[ti % 2];
      loadOrder++;
      var oldIdx2 = 0;
      var oldOrd2 = ram[0].order;
      for (var oi2 = 1; oi2 < 8; oi2++) {
        if (ram[oi2] && ram[oi2].order < oldOrd2) {
          oldOrd2 = ram[oi2].order;
          oldIdx2 = oi2;
        }
      }
      var ev2 = ram[oldIdx2];
      disk.push({ pid: ev2.pid, page: ev2.page, name: ev2.name, color: ev2.color });
      swaps++;
      var thrashing = swaps >= 10;

      snap_vm(ram, disk, swaps,
        ev2.name + ' page ' + ev2.page + ' swapped to disk.',
        { type: 'swap', fromSlot: oldIdx2, toDisk: disk.length - 1 }, thrashing);

      ram[oldIdx2] = { pid: tp.id, page: ti, name: tp.name, color: tp.color, order: loadOrder };
      snap_vm(ram, disk, swaps,
        tp.name + ' page ' + ti + ' loaded. ' + (thrashing ? 'THRASHING! Too many swaps!' : ''),
        { type: 'load', slot: oldIdx2 }, thrashing);
    }

    // Final thrashing state
    snap_vm(ram, disk, swaps,
      'System is thrashing! More time spent swapping than executing. Solution: add more RAM.',
      null, true);
  }

  function snap_vm(ram, disk, swaps, desc, action, thrashing) {
    steps.push({
      tab: 'virtual-memory',
      ram: ram.map(function (r) { return r ? { pid: r.pid, page: r.page, name: r.name, color: r.color, order: r.order } : null; }),
      disk: disk.map(function (d) { return { pid: d.pid, page: d.page, name: d.name, color: d.color }; }),
      swaps: swaps,
      desc: desc,
      action: action,
      thrashing: thrashing
    });
  }

  /* ────────────────────────────────────────────────────────────────
   *  Cache Demo — CPU requests data, check cache, then RAM, then disk
   * ──────────────────────────────────────────────────────────────── */
  function genCache() {
    var cache = [null, null];          // 2 slots: { addr, data, order }
    var ramSlots = [];                 // 8 slots: { addr, data }
    var diskSlots = [];                // 16 slots: { addr, data }
    var hits = 0;
    var misses = 0;
    var totalTime = 0;
    var accessOrder = 0;

    // Populate RAM and Disk with data
    for (var i = 0; i < 8; i++) {
      ramSlots.push({ addr: i, data: randHex() });
    }
    for (var j = 0; j < 16; j++) {
      diskSlots.push({ addr: j + 8, data: randHex() });
    }

    // Initial state
    snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime, 'CPU ready. Cache is empty. Requesting data addresses...', null, '');

    // Sequence of CPU requests — designed to show hits and misses
    var requests = [3, 5, 3, 7, 5, 1, 12, 3, 12, 1, 7, 5, 3, 7, 1, 12];

    for (var ri = 0; ri < requests.length; ri++) {
      var addr = requests[ri];
      accessOrder++;

      // Check cache first
      var cacheHit = -1;
      for (var ci = 0; ci < cache.length; ci++) {
        if (cache[ci] && cache[ci].addr === addr) {
          cacheHit = ci;
          break;
        }
      }

      if (cacheHit >= 0) {
        // Cache hit
        hits++;
        totalTime += 1; // 1ns cache access
        cache[cacheHit].order = accessOrder;
        snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime,
          'Cache HIT! Address ' + addr + ' found in cache. Access time: 1 ns.',
          { type: 'hit', cacheSlot: cacheHit, addr: addr }, 'hit');
      } else {
        // Cache miss — find data in RAM or Disk
        misses++;
        var foundInRam = -1;
        var foundInDisk = -1;
        var dataVal = '';

        for (var ri2 = 0; ri2 < ramSlots.length; ri2++) {
          if (ramSlots[ri2].addr === addr) {
            foundInRam = ri2;
            dataVal = ramSlots[ri2].data;
            break;
          }
        }
        if (foundInRam < 0) {
          for (var di = 0; di < diskSlots.length; di++) {
            if (diskSlots[di].addr === addr) {
              foundInDisk = di;
              dataVal = diskSlots[di].data;
              break;
            }
          }
        }

        var accessTime;
        var source;
        if (foundInRam >= 0) {
          accessTime = 10; // 10ns RAM
          source = 'RAM';
          snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime,
            'Cache MISS! Checking RAM for address ' + addr + '...',
            { type: 'miss-check', source: 'ram', ramSlot: foundInRam, addr: addr }, 'miss');
        } else {
          accessTime = 100; // 100ns Disk
          source = 'Disk';
          snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime,
            'Cache MISS! Not in RAM. Loading address ' + addr + ' from Disk...',
            { type: 'miss-check', source: 'disk', diskSlot: foundInDisk, addr: addr }, 'miss');
        }

        totalTime += accessTime;

        // Evict oldest from cache (LRU)
        var evictIdx = 0;
        if (cache[0] === null) {
          evictIdx = 0;
        } else if (cache[1] === null) {
          evictIdx = 1;
        } else {
          evictIdx = cache[0].order < cache[1].order ? 0 : 1;
        }

        var evicted = cache[evictIdx];
        cache[evictIdx] = { addr: addr, data: dataVal, order: accessOrder };

        var evictDesc = evicted ? ' (evicted address ' + evicted.addr + ')' : '';
        snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime,
          'Loaded address ' + addr + ' from ' + source + ' into cache' + evictDesc + '. Access: ' + accessTime + ' ns.',
          { type: 'load-cache', cacheSlot: evictIdx, addr: addr, source: source.toLowerCase() }, 'loaded');
      }
    }

    // Final summary
    var hitRate = Math.round((hits / (hits + misses)) * 100);
    var avgTime = Math.round(totalTime / (hits + misses));
    snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime,
      'Done! Hit rate: ' + hitRate + '%. Average access: ' + avgTime + ' ns. Cache improves speed by keeping frequently used data close to the CPU.',
      null, 'done');
  }

  function snap_cache(cache, ramSlots, diskSlots, hits, misses, totalTime, desc, action, status) {
    steps.push({
      tab: 'cache',
      cache: cache.map(function (c) { return c ? { addr: c.addr, data: c.data, order: c.order } : null; }),
      ram: ramSlots.map(function (r) { return { addr: r.addr, data: r.data }; }),
      disk: diskSlots.map(function (d) { return { addr: d.addr, data: d.data }; }),
      hits: hits,
      misses: misses,
      totalTime: totalTime,
      desc: desc,
      action: action,
      status: status
    });
  }

  /* =================================================================
   *  DRAWING — dispatches to per-tab renderer
   * ================================================================= */
  function drawFrame() {
    if (!steps.length) return;
    var s = steps[stepIndex];
    var size = SimulationEngine.resizeCanvas(canvas, 420, 0.6, 550);
    var w = size.w;
    var h = size.h;
    var tc = SimulationEngine.themeColors();

    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    switch (s.tab) {
      case 'ram-rom':        drawRamRom(s, w, h, tc);        break;
      case 'virtual-memory': drawVirtualMemory(s, w, h, tc); break;
      case 'cache':          drawCache(s, w, h, tc);         break;
    }

    // Update step stat (common to all tabs)
    var stepEl = document.getElementById('stat-step');
    if (stepEl) stepEl.textContent = stepIndex + ' / ' + (steps.length - 1);
  }

  /* ────────────────────────────────────────────────────────────────
   *  Draw helpers
   * ──────────────────────────────────────────────────────────────── */
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawCell(x, y, w, h, label, fillColor, textColor, opacity, borderColor) {
    ctx.save();
    ctx.globalAlpha = opacity !== undefined ? opacity : 1;
    roundRect(x, y, w, h, 4);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = borderColor || tc_border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = textColor;
    ctx.font = 'bold 11px ' + monoFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
    ctx.restore();
  }

  var monoFont = "'Cascadia Code', 'Fira Code', 'Consolas', monospace";
  var sansFont = "'Segoe UI', system-ui, sans-serif";
  var tc_border = '';

  /* ────────────────────────────────────────────────────────────────
   *  RAM vs ROM drawing
   * ──────────────────────────────────────────────────────────────── */
  function drawRamRom(s, w, h, tc) {
    tc_border = tc.border;
    var pad = 20;
    var midX = w / 2;
    var cellW = Math.min(80, (midX - pad * 2 - 10) / 1);
    var cellH = 34;
    var gapY = 6;

    // Power indicator
    var powerY = pad;
    var powerW = 120;
    var powerH = 30;
    var powerX = (w - powerW) / 2;
    roundRect(powerX, powerY, powerW, powerH, 6);
    ctx.fillStyle = s.powerOn ? CLR_GREEN : CLR_RED;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px ' + sansFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POWER ' + (s.powerOn ? 'ON' : 'OFF'), powerX + powerW / 2, powerY + powerH / 2);

    var topY = powerY + powerH + 20;

    // RAM section — left side
    var ramX = pad + (midX - pad * 2 - cellW) / 2;
    ctx.fillStyle = tc.text;
    ctx.font = 'bold 14px ' + sansFont;
    ctx.textAlign = 'center';
    ctx.fillText('RAM', midX / 2, topY);
    ctx.font = '11px ' + sansFont;
    ctx.fillStyle = tc.muted;
    ctx.fillText('(Volatile)', midX / 2, topY + 16);

    var gridTop = topY + 30;
    for (var i = 0; i < 8; i++) {
      var cy = gridTop + i * (cellH + gapY);
      var opacity = s.ramOpacity;
      var fillClr = s.ramData[i] === '----' ? tc.surfaceAlt : tc.primaryLight;
      var textClr = s.ramData[i] === '----' ? tc.muted : tc.text;
      if (s.anim === 'fading' || s.anim === 'filling') {
        opacity = Math.max(0.15, s.ramOpacity);
      }
      drawCell(ramX, cy, cellW, cellH, s.ramData[i], fillClr, textClr, opacity, tc.border);
      // Address label
      ctx.fillStyle = tc.muted;
      ctx.font = '10px ' + monoFont;
      ctx.textAlign = 'right';
      ctx.fillText('' + i, ramX - 6, cy + cellH / 2);
    }

    // ROM section — right side
    var romX = midX + (midX - pad * 2 - cellW) / 2;
    ctx.fillStyle = tc.text;
    ctx.font = 'bold 14px ' + sansFont;
    ctx.textAlign = 'center';
    ctx.fillText('ROM', midX + midX / 2, topY);
    ctx.font = '11px ' + sansFont;
    ctx.fillStyle = tc.muted;
    ctx.fillText('(Non-volatile)', midX + midX / 2, topY + 16);

    for (var j = 0; j < 8; j++) {
      var ry = gridTop + j * (cellH + gapY);
      drawCell(romX, ry, cellW, cellH, s.romData[j], tc.highlight, tc.text, 1.0, tc.border);
      ctx.fillStyle = tc.muted;
      ctx.font = '10px ' + monoFont;
      ctx.textAlign = 'right';
      ctx.fillText('' + j, romX - 6, ry + cellH / 2);
    }

    // Divider line
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, topY - 5);
    ctx.lineTo(midX, gridTop + 8 * (cellH + gapY));
    ctx.stroke();
    ctx.setLineDash([]);

    // Description bar at bottom
    drawDescBar(s.desc, w, h, tc, s.powerOn ? tc.primary : CLR_RED);

    // Stats
    var powerEl = document.getElementById('stat-power');
    if (powerEl) {
      powerEl.textContent = s.powerOn ? 'ON' : 'OFF';
      powerEl.style.color = s.powerOn ? CLR_GREEN : CLR_RED;
    }
  }

  /* ────────────────────────────────────────────────────────────────
   *  Virtual Memory drawing
   * ──────────────────────────────────────────────────────────────── */
  function drawVirtualMemory(s, w, h, tc) {
    tc_border = tc.border;
    var pad = 16;
    var cellW = Math.min(70, (w - pad * 2 - 60) / 8 - 4);
    var cellH = 38;

    // RAM label
    var ramLabelY = pad;
    ctx.fillStyle = tc.text;
    ctx.font = 'bold 14px ' + sansFont;
    ctx.textAlign = 'left';
    ctx.fillText('RAM (8 slots)', pad, ramLabelY + 14);

    // RAM grid — horizontal
    var ramY = ramLabelY + 26;
    var ramStartX = pad;
    var ramGap = 4;
    var totalRamW = 8 * (cellW + ramGap);
    if (totalRamW > w - pad * 2) {
      cellW = (w - pad * 2 - ramGap * 8) / 8;
      totalRamW = 8 * (cellW + ramGap);
    }

    for (var i = 0; i < 8; i++) {
      var rx = ramStartX + i * (cellW + ramGap);
      var slot = s.ram[i];
      var fillClr = slot ? slot.color : tc.surfaceAlt;
      var textClr = slot ? '#ffffff' : tc.muted;
      var label = slot ? slot.name + '.' + slot.page : '--';

      // Highlight the active slot
      var isActive = s.action && s.action.type === 'load' && s.action.slot === i;
      var borderClr = isActive ? CLR_GREEN : tc.border;
      var lw = isActive ? 2 : 1;

      ctx.save();
      roundRect(rx, ramY, cellW, cellH, 4);
      ctx.fillStyle = fillClr;
      ctx.fill();
      ctx.strokeStyle = borderClr;
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.fillStyle = textClr;
      ctx.font = 'bold 10px ' + monoFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, rx + cellW / 2, ramY + cellH / 2);
      ctx.restore();

      // Slot number
      ctx.fillStyle = tc.muted;
      ctx.font = '9px ' + monoFont;
      ctx.textAlign = 'center';
      ctx.fillText('' + i, rx + cellW / 2, ramY + cellH + 12);
    }

    // Arrow area between RAM and Disk
    var arrowY = ramY + cellH + 24;
    if (s.action && s.action.type === 'swap') {
      var fromX = ramStartX + s.action.fromSlot * (cellW + ramGap) + cellW / 2;
      var arrowMidY = arrowY + 12;
      ctx.strokeStyle = CLR_AMBER;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(fromX, ramY + cellH);
      ctx.lineTo(fromX, arrowMidY);
      ctx.lineTo(w / 2, arrowMidY);
      ctx.lineTo(w / 2, arrowMidY + 18);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = CLR_AMBER;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 5, arrowMidY + 14);
      ctx.lineTo(w / 2 + 5, arrowMidY + 14);
      ctx.lineTo(w / 2, arrowMidY + 22);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = CLR_AMBER;
      ctx.font = 'bold 11px ' + sansFont;
      ctx.textAlign = 'center';
      ctx.fillText('SWAP', w / 2 + 30, arrowMidY + 6);
    }

    // Disk area
    var diskLabelY = arrowY + 30;
    ctx.fillStyle = tc.text;
    ctx.font = 'bold 14px ' + sansFont;
    ctx.textAlign = 'left';
    ctx.fillText('Disk (Virtual Memory)', pad, diskLabelY + 14);

    var diskY = diskLabelY + 24;
    var diskCellW = Math.min(55, (w - pad * 2 - ramGap * 8) / 8);
    var diskCellH = 30;
    var diskCols = Math.min(8, Math.floor((w - pad * 2) / (diskCellW + ramGap)));
    if (diskCols < 1) diskCols = 1;

    for (var di = 0; di < s.disk.length; di++) {
      var col = di % diskCols;
      var row = Math.floor(di / diskCols);
      var dx = ramStartX + col * (diskCellW + ramGap);
      var dy = diskY + row * (diskCellH + ramGap);
      var dSlot = s.disk[di];

      var isNewDisk = s.action && s.action.type === 'swap' && s.action.toDisk === di;

      ctx.save();
      roundRect(dx, dy, diskCellW, diskCellH, 4);
      ctx.fillStyle = dSlot.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = isNewDisk ? CLR_AMBER : tc.borderMuted;
      ctx.lineWidth = isNewDisk ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px ' + monoFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dSlot.name + '.' + dSlot.page, dx + diskCellW / 2, dy + diskCellH / 2);
      ctx.restore();
    }

    // Thrashing warning
    if (s.thrashing) {
      var warnY = Math.min(diskY + Math.ceil(s.disk.length / diskCols) * (diskCellH + ramGap) + 10, h - 70);
      ctx.save();
      roundRect(pad, warnY, w - pad * 2, 28, 6);
      ctx.fillStyle = CLR_RED;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px ' + sansFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('THRASHING! System spending more time swapping than executing.', w / 2, warnY + 14);
      ctx.restore();
    }

    // Description bar
    drawDescBar(s.desc, w, h, tc, s.thrashing ? CLR_RED : tc.primary);

    // Stats
    var swapEl = document.getElementById('stat-swaps');
    if (swapEl) swapEl.textContent = s.swaps;
    var usedEl = document.getElementById('stat-ram-used');
    if (usedEl) {
      var used = 0;
      for (var ui = 0; ui < s.ram.length; ui++) { if (s.ram[ui]) used++; }
      usedEl.textContent = used + ' / 8';
    }
  }

  /* ────────────────────────────────────────────────────────────────
   *  Cache Demo drawing
   * ──────────────────────────────────────────────────────────────── */
  function drawCache(s, w, h, tc) {
    tc_border = tc.border;
    var pad = 16;
    var tierGap = 14;

    // Layout: 3 tiers stacked vertically
    // CPU label at top
    var cpuY = pad;
    var cpuW = 60;
    var cpuH = 28;
    var cpuX = (w - cpuW) / 2;
    roundRect(cpuX, cpuY, cpuW, cpuH, 6);
    ctx.fillStyle = tc.primary;
    ctx.fill();
    ctx.fillStyle = tc.primaryFg;
    ctx.font = 'bold 12px ' + sansFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CPU', cpuX + cpuW / 2, cpuY + cpuH / 2);

    // Cache tier
    var cacheY = cpuY + cpuH + tierGap;
    var cacheCellW = Math.min(100, (w - pad * 2 - 80) / 2);
    var cacheCellH = 36;
    var cacheStartX = (w - 2 * cacheCellW - 8) / 2;

    ctx.fillStyle = tc.text;
    ctx.font = 'bold 12px ' + sansFont;
    ctx.textAlign = 'left';
    ctx.fillText('Cache (2 slots) — 1 ns', pad, cacheY + 6);
    var cacheGridY = cacheY + 14;

    for (var ci = 0; ci < 2; ci++) {
      var cx = cacheStartX + ci * (cacheCellW + 8);
      var cSlot = s.cache[ci];
      var isHit = s.action && s.action.type === 'hit' && s.action.cacheSlot === ci;
      var isLoaded = s.action && s.action.type === 'load-cache' && s.action.cacheSlot === ci;

      var cFill = cSlot ? tc.primaryLight : tc.surfaceAlt;
      var cBorder = isHit ? CLR_GREEN : (isLoaded ? CLR_AMBER : tc.border);
      var cLW = (isHit || isLoaded) ? 3 : 1;

      ctx.save();
      roundRect(cx, cacheGridY, cacheCellW, cacheCellH, 5);
      ctx.fillStyle = cFill;
      ctx.fill();
      if (isHit) {
        ctx.fillStyle = CLR_GREEN;
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = cBorder;
      ctx.lineWidth = cLW;
      ctx.stroke();
      ctx.fillStyle = cSlot ? tc.text : tc.muted;
      ctx.font = 'bold 11px ' + monoFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var cLabel = cSlot ? '[' + cSlot.addr + '] ' + cSlot.data : 'empty';
      ctx.fillText(cLabel, cx + cacheCellW / 2, cacheGridY + cacheCellH / 2);
      ctx.restore();
    }

    // Connection line: CPU to Cache
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, cpuY + cpuH);
    ctx.lineTo(w / 2, cacheGridY);
    ctx.stroke();

    // RAM tier
    var ramY = cacheGridY + cacheCellH + tierGap + 6;
    var ramCellW = Math.min(65, (w - pad * 2 - 36) / 8);
    var ramCellH = 36;
    var ramGap2 = 4;

    ctx.fillStyle = tc.text;
    ctx.font = 'bold 12px ' + sansFont;
    ctx.textAlign = 'left';
    ctx.fillText('RAM (8 slots) — 10 ns', pad, ramY + 6);
    var ramGridY = ramY + 14;
    var ramTotalW = 8 * (ramCellW + ramGap2);
    var ramStartX2 = (w - ramTotalW) / 2;

    for (var ri = 0; ri < 8; ri++) {
      var rx = ramStartX2 + ri * (ramCellW + ramGap2);
      var rSlot = s.ram[ri];
      var isRamActive = s.action && s.action.type === 'miss-check' && s.action.source === 'ram' && s.action.ramSlot === ri;

      ctx.save();
      roundRect(rx, ramGridY, ramCellW, ramCellH, 4);
      ctx.fillStyle = isRamActive ? tc.highlight : tc.surfaceAlt;
      ctx.fill();
      if (isRamActive) {
        ctx.strokeStyle = CLR_AMBER;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = tc.borderMuted;
        ctx.lineWidth = 1;
      }
      ctx.stroke();
      ctx.fillStyle = tc.text;
      ctx.font = '9px ' + monoFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('[' + rSlot.addr + ']', rx + ramCellW / 2, ramGridY + 4);
      ctx.fillStyle = tc.muted;
      ctx.font = 'bold 10px ' + monoFont;
      ctx.textBaseline = 'bottom';
      ctx.fillText(rSlot.data, rx + ramCellW / 2, ramGridY + ramCellH - 4);
      ctx.restore();
    }

    // Connection line: Cache to RAM
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, cacheGridY + cacheCellH);
    ctx.lineTo(w / 2, ramGridY);
    ctx.stroke();

    // Disk tier
    var diskY = ramGridY + ramCellH + tierGap + 6;
    var diskCellW2 = Math.min(50, (w - pad * 2 - 36) / 8);
    var diskCellH2 = 30;
    var diskGap = 3;
    var diskCols = Math.min(8, Math.floor((w - pad * 2) / (diskCellW2 + diskGap)));
    if (diskCols < 1) diskCols = 1;

    ctx.fillStyle = tc.text;
    ctx.font = 'bold 12px ' + sansFont;
    ctx.textAlign = 'left';
    ctx.fillText('Disk (16 slots) — 100 ns', pad, diskY + 6);
    var diskGridY = diskY + 14;
    var diskTotalW = diskCols * (diskCellW2 + diskGap);
    var diskStartX = (w - diskTotalW) / 2;

    for (var dj = 0; dj < 16; dj++) {
      var col = dj % diskCols;
      var row = Math.floor(dj / diskCols);
      var ddx = diskStartX + col * (diskCellW2 + diskGap);
      var ddy = diskGridY + row * (diskCellH2 + diskGap);
      var dSlot = s.disk[dj];
      var isDiskActive = s.action && s.action.type === 'miss-check' && s.action.source === 'disk' && s.action.diskSlot === dj;

      ctx.save();
      roundRect(ddx, ddy, diskCellW2, diskCellH2, 3);
      ctx.fillStyle = isDiskActive ? tc.highlight : tc.surfaceAlt;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (isDiskActive) {
        ctx.strokeStyle = CLR_AMBER;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = tc.borderMuted;
        ctx.lineWidth = 1;
      }
      ctx.stroke();
      ctx.fillStyle = tc.muted;
      ctx.font = '8px ' + monoFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('[' + dSlot.addr + ']', ddx + diskCellW2 / 2, ddy + 3);
      ctx.fillStyle = tc.text;
      ctx.font = 'bold 9px ' + monoFont;
      ctx.textBaseline = 'bottom';
      ctx.fillText(dSlot.data, ddx + diskCellW2 / 2, ddy + diskCellH2 - 3);
      ctx.restore();
    }

    // Connection line: RAM to Disk
    ctx.strokeStyle = tc.borderMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, ramGridY + ramCellH);
    ctx.lineTo(w / 2, diskGridY);
    ctx.stroke();

    // Hit/Miss indicator
    if (s.status === 'hit') {
      drawStatusBadge('CACHE HIT', CLR_GREEN, w, cpuY, tc);
    } else if (s.status === 'miss') {
      drawStatusBadge('CACHE MISS', CLR_RED, w, cpuY, tc);
    } else if (s.status === 'loaded') {
      drawStatusBadge('LOADED', CLR_AMBER, w, cpuY, tc);
    }

    // Description bar
    drawDescBar(s.desc, w, h, tc, s.status === 'hit' ? CLR_GREEN : (s.status === 'miss' ? CLR_RED : tc.primary));

    // Stats
    var total = s.hits + s.misses;
    var hitRate = total > 0 ? Math.round((s.hits / total) * 100) : 0;
    var avgTime = total > 0 ? Math.round(s.totalTime / total) : 0;

    var hrEl = document.getElementById('stat-hitrate');
    if (hrEl) {
      hrEl.textContent = hitRate + '%';
      hrEl.style.color = hitRate >= 50 ? CLR_GREEN : CLR_RED;
    }
    var atEl = document.getElementById('stat-access');
    if (atEl) atEl.textContent = avgTime + ' ns';
  }

  function drawStatusBadge(text, color, w, cpuY, tc) {
    var bw = 100;
    var bh = 22;
    var bx = w - bw - 16;
    var by = cpuY;
    ctx.save();
    roundRect(bx, by, bw, bh, 4);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px ' + sansFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + bw / 2, by + bh / 2);
    ctx.restore();
  }

  /* ── Description bar (bottom of canvas) ─────────────────────── */
  function drawDescBar(desc, w, h, tc, barColor) {
    var barH = 36;
    var barY = h - barH - 8;
    var barX = 12;
    var barW = w - 24;

    ctx.save();
    roundRect(barX, barY, barW, barH, 6);
    ctx.fillStyle = barColor;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px ' + sansFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Truncate desc if too long
    var maxChars = Math.floor(barW / 6.5);
    var displayDesc = desc.length > maxChars ? desc.substring(0, maxChars - 3) + '...' : desc;
    ctx.fillText(displayDesc, barX + 10, barY + barH / 2);
    ctx.restore();
  }

  /* ── Resize handling ─────────────────────────────────────────── */
  SimulationEngine.debounceResize(drawFrame);

  /* ── Init ────────────────────────────────────────────────────── */
  engine.reset();
})();
