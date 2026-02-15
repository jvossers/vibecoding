/**
 * Defragmentation Visualiser — simulation logic.
 *
 * Design: pre-compute all defrag moves at reset, then play back by index.
 * Each step captures: disk state, currently-moving block, head position, stats.
 */
(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────────── */
  var COLS = 8;
  var ROWS = 16;
  var TOTAL_BLOCKS = COLS * ROWS; // 128

  var FILE_COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  /* ── DOM refs ──────────────────────────────────────────────────── */
  var canvas       = document.getElementById('defrag-canvas');
  var ctx          = canvas.getContext('2d');
  var controlsEl   = document.getElementById('controls');
  var fileCountEl  = document.getElementById('file-count');
  var fileCountLbl = document.getElementById('file-count-label');
  var btnFragment  = document.getElementById('btn-fragment');
  var btnDefrag    = document.getElementById('btn-defragment');
  var statFrag     = document.getElementById('stat-frag');
  var statMoves    = document.getElementById('stat-moves');
  var statFiles    = document.getElementById('stat-files');
  var statDistBefore = document.getElementById('stat-dist-before');
  var statDistAfter  = document.getElementById('stat-dist-after');

  /* ── State ─────────────────────────────────────────────────────── */
  var disk = [];            // length 128, each entry: null or { fileIndex: N }
  var files = [];           // array of { name, colorIndex, blockCount }
  var steps = [];           // pre-computed defrag steps
  var stepIndex = 0;
  var movingBlock = -1;     // index of block currently being moved (-1 = none)
  var headPos = 0;          // current read/write head row
  var distanceBefore = 0;
  var distanceAfter = 0;
  var isFragmented = false;

  /* ── Engine ────────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);

  engine
    .onReset(function () {
      createFiles();
      placeFilesContiguous();
      steps = [];
      stepIndex = 0;
      movingBlock = -1;
      headPos = 0;
      distanceBefore = 0;
      distanceAfter = 0;
      isFragmented = false;
      updateStats();
    })
    .onStep(function () {
      if (stepIndex >= steps.length) return false;
      var s = steps[stepIndex];
      // Deep copy the snapshot into the live disk
      disk = [];
      for (var i = 0; i < s.disk.length; i++) {
        disk.push(s.disk[i] ? { fileIndex: s.disk[i].fileIndex } : null);
      }
      movingBlock = s.movingBlock;
      headPos = s.headRow;
      stepIndex++;
      updateStats();
      // Signal finished on the last step
      if (stepIndex >= steps.length) {
        movingBlock = -1;
        return false;
      }
    })
    .onRender(function () {
      drawDisk();
    });

  /* ── File count slider ─────────────────────────────────────────── */
  fileCountEl.addEventListener('input', function () {
    fileCountLbl.textContent = fileCountEl.value;
    engine.reset();
  });

  /* ── Fragment button ───────────────────────────────────────────── */
  btnFragment.addEventListener('click', function () {
    engine.pause();
    fragmentDisk();
    isFragmented = true;
    steps = [];
    stepIndex = 0;
    movingBlock = -1;
    distanceBefore = calcTotalHeadDistance(disk);
    distanceAfter = 0;
    updateStats();
    engine.render();
  });

  /* ── Defragment button ─────────────────────────────────────────── */
  btnDefrag.addEventListener('click', function () {
    if (!isFragmented) {
      // Auto-fragment first
      fragmentDisk();
      isFragmented = true;
      distanceBefore = calcTotalHeadDistance(disk);
      engine.render();
    }
    precomputeDefragSteps();
    stepIndex = 0;
    movingBlock = -1;
    updateStats();
    engine.render();
    engine.play();
  });

  /* ── Create files ──────────────────────────────────────────────── */
  function createFiles() {
    var count = parseInt(fileCountEl.value, 10);
    files = [];
    for (var i = 0; i < count; i++) {
      var blockCount = 8 + Math.floor(Math.random() * 13); // 8-20 blocks
      files.push({
        name: 'File ' + String.fromCharCode(65 + i), // A, B, C...
        colorIndex: i,
        blockCount: blockCount
      });
    }
    // Ensure total blocks don't exceed disk
    var total = 0;
    for (var j = 0; j < files.length; j++) total += files[j].blockCount;
    while (total > TOTAL_BLOCKS - 4) { // leave a few empty
      // Reduce largest file
      var maxIdx = 0;
      for (var k = 1; k < files.length; k++) {
        if (files[k].blockCount > files[maxIdx].blockCount) maxIdx = k;
      }
      files[maxIdx].blockCount--;
      total--;
    }
  }

  /* ── Place files contiguously ──────────────────────────────────── */
  function placeFilesContiguous() {
    disk = [];
    for (var i = 0; i < TOTAL_BLOCKS; i++) disk.push(null);
    var pos = 0;
    for (var f = 0; f < files.length; f++) {
      for (var b = 0; b < files[f].blockCount; b++) {
        if (pos < TOTAL_BLOCKS) {
          disk[pos] = { fileIndex: f };
          pos++;
        }
      }
    }
  }

  /* ── Fragment the disk ─────────────────────────────────────────── */
  function fragmentDisk() {
    // Collect all blocks with their file info
    var blocks = [];
    for (var i = 0; i < TOTAL_BLOCKS; i++) {
      blocks.push(disk[i]); // null or { fileIndex }
    }
    // Fisher-Yates shuffle to scatter
    SimulationEngine.fisherYates(blocks);
    disk = blocks;
  }

  /* ── Calculate head distance ───────────────────────────────────── */
  function calcTotalHeadDistance(d) {
    var totalDist = 0;
    for (var f = 0; f < files.length; f++) {
      var positions = [];
      for (var i = 0; i < d.length; i++) {
        if (d[i] && d[i].fileIndex === f) {
          positions.push(i);
        }
      }
      for (var j = 1; j < positions.length; j++) {
        totalDist += Math.abs(positions[j] - positions[j - 1]);
      }
    }
    return totalDist;
  }

  /* ── Calculate fragmentation percentage ────────────────────────── */
  function calcFragmentation(d) {
    var fragments = 0;
    var totalFileBlocks = 0;
    for (var f = 0; f < files.length; f++) {
      var positions = [];
      for (var i = 0; i < d.length; i++) {
        if (d[i] && d[i].fileIndex === f) {
          positions.push(i);
        }
      }
      totalFileBlocks += positions.length;
      // Count gaps: number of non-contiguous jumps
      for (var j = 1; j < positions.length; j++) {
        if (positions[j] !== positions[j - 1] + 1) {
          fragments++;
        }
      }
    }
    if (totalFileBlocks === 0) return 0;
    // Max possible fragments ~ totalFileBlocks - files.length
    var maxFragments = totalFileBlocks - files.length;
    if (maxFragments <= 0) return 0;
    return Math.round((fragments / maxFragments) * 100);
  }

  /* ── Pre-compute defrag steps ──────────────────────────────────── */
  function precomputeDefragSteps() {
    steps = [];
    // Deep copy disk state (each entry is null or an object)
    var working = [];
    for (var w = 0; w < disk.length; w++) {
      working.push(disk[w] ? { fileIndex: disk[w].fileIndex } : null);
    }
    var writePos = 0; // next target position for contiguous placement

    for (var f = 0; f < files.length; f++) {
      // Re-scan for this file's positions each time (positions may have
      // shifted due to swaps from earlier files)
      var positions = [];
      for (var i = 0; i < working.length; i++) {
        if (working[i] && working[i].fileIndex === f) {
          positions.push(i);
        }
      }

      // Move each block of this file to next contiguous position
      for (var b = 0; b < positions.length; b++) {
        var srcPos = positions[b];
        var tgtPos = writePos;

        if (srcPos !== tgtPos) {
          // If target is occupied by a different file's block, swap
          if (working[tgtPos] !== null) {
            // Move the occupying block to where we came from
            var displaced = { fileIndex: working[tgtPos].fileIndex };
            working[srcPos] = displaced;
            // Update positions array: if a later entry in *this file's*
            // positions pointed to tgtPos we already moved past it, but
            // the displaced block might now sit at srcPos and belong to
            // a future file — that's fine, we re-scan per file.
          } else {
            working[srcPos] = null;
          }
          working[tgtPos] = { fileIndex: f };

          // Snapshot the disk for this step
          var snapshot = [];
          for (var s = 0; s < working.length; s++) {
            snapshot.push(working[s] ? { fileIndex: working[s].fileIndex } : null);
          }
          var headRow = Math.floor(tgtPos / COLS);
          steps.push({
            disk: snapshot,
            movingBlock: tgtPos,
            headRow: headRow,
            blocksMoved: steps.length + 1
          });
        }
        writePos++;
      }
    }

    // Calculate after distance from the final state
    if (steps.length > 0) {
      distanceAfter = calcTotalHeadDistance(steps[steps.length - 1].disk);
    } else {
      distanceAfter = calcTotalHeadDistance(disk);
    }
  }

  /* ── Update stats display ──────────────────────────────────────── */
  function updateStats() {
    var frag = calcFragmentation(disk);
    statFrag.textContent = frag + '%';
    statMoves.textContent = stepIndex;
    statFiles.textContent = files.length;
    statDistBefore.textContent = distanceBefore;
    statDistAfter.textContent = (stepIndex >= steps.length && steps.length > 0)
      ? distanceAfter
      : '--';
  }

  /* ── Helpers for grid coord conversion ─────────────────────────── */
  function blockToCol(idx) { return idx % COLS; }
  function blockToRow(idx) { return Math.floor(idx / COLS); }

  /* ── Draw disk grid ────────────────────────────────────────────── */
  function drawDisk() {
    var size = SimulationEngine.resizeCanvas(canvas, 400, 0.7, 600);
    var w = size.w;
    var h = size.h;
    var tc = SimulationEngine.themeColors();

    // Clear
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    // Layout calculations
    var legendHeight = 50;
    var headMargin = 30; // space for read head indicator on left
    var padding = 12;
    var gridTop = padding;
    var gridLeft = padding + headMargin;
    var availW = w - gridLeft - padding;
    var availH = h - gridTop - padding - legendHeight;
    var cellW = Math.floor(availW / COLS);
    var cellH = Math.floor(availH / ROWS);
    // Use smaller dimension to keep cells somewhat square-ish but fill space
    var cellSize = Math.min(cellW, cellH);
    var gridW = cellSize * COLS;
    var gridH = cellSize * ROWS;

    // Center the grid horizontally within available area
    var offsetX = gridLeft + Math.floor((availW - gridW) / 2);
    var offsetY = gridTop;

    // Draw grid cells
    for (var i = 0; i < TOTAL_BLOCKS; i++) {
      var col = blockToCol(i);
      var row = blockToRow(i);
      var x = offsetX + col * cellSize;
      var y = offsetY + row * cellSize;

      // Fill
      if (disk[i] !== null) {
        ctx.fillStyle = FILE_COLORS[disk[i].fileIndex % FILE_COLORS.length];
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        ctx.fillStyle = tc.surface;
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      // Border
      ctx.strokeStyle = tc.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

      // Highlight currently-moving block
      if (i === movingBlock) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1.5, y + 1.5, cellSize - 3, cellSize - 3);
        ctx.strokeStyle = tc.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
      }
    }

    // Draw read head indicator (arrow on the left side)
    var headY = offsetY + headPos * cellSize + cellSize / 2;
    var arrowX = offsetX - 6;
    ctx.fillStyle = tc.primary;
    ctx.beginPath();
    ctx.moveTo(arrowX, headY);
    ctx.lineTo(arrowX - 12, headY - 7);
    ctx.lineTo(arrowX - 12, headY + 7);
    ctx.closePath();
    ctx.fill();

    // Label for head
    ctx.fillStyle = tc.muted;
    ctx.font = '10px ' + getFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HEAD', arrowX - 12, headY - 14);

    // Draw legend below grid
    var legendY = offsetY + gridH + 14;
    var legendX = offsetX;
    var swatchSize = 14;
    var spacing = 8;

    ctx.font = '12px ' + getFont();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    var curX = legendX;
    for (var f = 0; f < files.length; f++) {
      // Color swatch
      ctx.fillStyle = FILE_COLORS[f % FILE_COLORS.length];
      ctx.fillRect(curX, legendY, swatchSize, swatchSize);
      ctx.strokeStyle = tc.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(curX, legendY, swatchSize, swatchSize);

      // Label
      ctx.fillStyle = tc.text;
      var label = files[f].name + ' (' + files[f].blockCount + ')';
      ctx.fillText(label, curX + swatchSize + 4, legendY + swatchSize / 2);

      var textW = ctx.measureText(label).width;
      curX += swatchSize + 4 + textW + spacing;

      // Wrap to next line if needed
      if (curX > offsetX + gridW - 40 && f < files.length - 1) {
        curX = legendX;
        legendY += swatchSize + 6;
      }
    }
  }

  /* ── Font helper ───────────────────────────────────────────────── */
  function getFont() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--font-sans').trim() || 'sans-serif';
  }

  /* ── Resize handling ───────────────────────────────────────────── */
  SimulationEngine.debounceResize(function () { engine.render(); });

  /* ── Init ──────────────────────────────────────────────────────── */
  engine.reset();
})();
