/**
 * Language Translator Visualiser — simulation logic.
 *
 * Pre-computes all steps for compiler/interpreter/comparison tabs,
 * then plays back via SimulationEngine with full play/pause/step/speed.
 */
(function () {
  'use strict';

  /* ── DOM refs ────────────────────────────────────────────────── */
  var canvas      = document.getElementById('sim-canvas');
  var ctx         = canvas.getContext('2d');
  var controlsEl  = document.getElementById('controls');
  var statsBar    = document.getElementById('stats-bar');
  var levelPanel  = document.getElementById('level-panel');
  var tabBtns     = document.querySelectorAll('.algo-btn');
  var errorToggle = document.getElementById('error-toggle');

  /* ── Fixed feedback colours ─────────────────────────────────── */
  var CLR_SUCCESS = '#10b981';
  var CLR_ERROR   = '#ef4444';
  var CLR_WARN    = '#f59e0b';

  /* ── Source code lines ──────────────────────────────────────── */
  var SOURCE_LINES = [
    'x = 10',
    'y = 20',
    'z = x + y',
    'print(z)',
    'print("Done")'
  ];

  var ERROR_LINE = 2; // 0-indexed (line 3: z = x + y)

  /* ── State ──────────────────────────────────────────────────── */
  var currentTab = 'compiler';
  var hasError   = false;
  var steps      = [];
  var stepIndex  = 0;

  /* ── Engine ─────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);
  engine
    .onReset(function () {
      hasError = errorToggle.checked;
      generateSteps();
      stepIndex = 0;
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

  errorToggle.addEventListener('change', function () { engine.reset(); });

  /* ── Build level panel (DOM, static) ────────────────────────── */
  levelPanel.innerHTML =
    '<table class="level-table">' +
    '<caption>High &amp; Low Level Languages</caption>' +
    '<thead><tr><th>Level</th><th>Example</th><th>Description</th></tr></thead>' +
    '<tbody>' +
    '<tr><td>High-level</td><td><code>print("Hello")</code></td><td>Human-readable, portable, needs translating</td></tr>' +
    '<tr><td>Assembly</td><td><code>MOV AX, 48656C</code><br><code>INT 21h</code></td><td>Mnemonics, CPU-specific, needs assembler</td></tr>' +
    '<tr><td>Machine Code</td><td><code>10110000 01001000</code></td><td>Binary, directly executed by CPU</td></tr>' +
    '</tbody></table>';

  /* ================================================================
   *  STEP GENERATION
   * ================================================================ */

  function generateSteps() {
    steps = [];
    switch (currentTab) {
      case 'compiler':    genCompilerSteps();    break;
      case 'interpreter': genInterpreterSteps(); break;
      case 'comparison':  genComparisonSteps();  break;
    }
  }

  /* ── Compiler steps ─────────────────────────────────────────── */
  function genCompilerSteps() {
    // Step schema: { phase, highlightLines[], statusText, sourceVisible, compilerLabel,
    //   objectCode, output[], memory{}, isError, stats{} }

    // 1. Show source code
    steps.push({
      phase: 'source', highlightLines: [], statusText: 'Source code ready',
      sourceVisible: true, compilerLabel: '', objectCode: null, output: [], memory: {}
    });

    if (hasError) {
      // 2. All lines enter compiler
      steps.push({
        phase: 'compiling', highlightLines: [0,1,2,3,4], statusText: 'All lines sent to compiler...',
        sourceVisible: true, compilerLabel: 'COMPILER', objectCode: null, output: [], memory: {}
      });
      // 3. Lexical analysis
      steps.push({
        phase: 'lexical', highlightLines: [0,1,2,3,4], statusText: 'Lexical Analysis: tokenising all lines...',
        sourceVisible: true, compilerLabel: 'Lexical Analysis', objectCode: null, output: [], memory: {}
      });
      // 4. Syntax analysis - finds error
      steps.push({
        phase: 'syntax-error', highlightLines: [ERROR_LINE], statusText: 'Syntax Analysis: ERROR found on line ' + (ERROR_LINE + 1) + '!',
        sourceVisible: true, compilerLabel: 'Syntax Analysis', objectCode: null, output: [], memory: {},
        isError: true
      });
      // 5. Compilation failed
      steps.push({
        phase: 'error', highlightLines: [ERROR_LINE], statusText: 'Error: Compilation failed at line ' + (ERROR_LINE + 1) + '. NO output produced.',
        sourceVisible: true, compilerLabel: 'FAILED', objectCode: null, output: [], memory: {},
        isError: true,
        stats: { compileTime: 'FAILED', executeTime: '-', rerunTime: '-' }
      });
      return;
    }

    // 2. All lines enter compiler
    steps.push({
      phase: 'compiling', highlightLines: [0,1,2,3,4], statusText: 'All lines sent to compiler...',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: null, output: [], memory: {}
    });

    // 3. Lexical analysis
    steps.push({
      phase: 'lexical', highlightLines: [0,1,2,3,4], statusText: 'Lexical Analysis: tokenising all lines...',
      sourceVisible: true, compilerLabel: 'Lexical Analysis', objectCode: null, output: [], memory: {}
    });

    // 4. Syntax analysis
    steps.push({
      phase: 'syntax', highlightLines: [0,1,2,3,4], statusText: 'Syntax Analysis: checking grammar of all lines...',
      sourceVisible: true, compilerLabel: 'Syntax Analysis', objectCode: null, output: [], memory: {}
    });

    // 5. Code generation
    steps.push({
      phase: 'codegen', highlightLines: [0,1,2,3,4], statusText: 'Code Generation: producing object code...',
      sourceVisible: true, compilerLabel: 'Code Generation', objectCode: null, output: [], memory: {}
    });

    // 6. Object code appears
    steps.push({
      phase: 'object-ready', highlightLines: [], statusText: 'Object code produced!',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: [], memory: {}
    });

    // 7. Compilation complete
    steps.push({
      phase: 'compiled', highlightLines: [], statusText: 'Compilation complete!',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: [], memory: {}
    });

    // 8. Execute -> output 30
    steps.push({
      phase: 'executing', highlightLines: [], statusText: 'Object code executing... Output: 30',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: ['30'], memory: {}
    });

    // 9. Output Done
    steps.push({
      phase: 'executing', highlightLines: [], statusText: 'Executing... Output: Done',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: ['30', 'Done'], memory: {}
    });

    // 10. Program finished
    steps.push({
      phase: 'finished', highlightLines: [], statusText: 'Program finished.',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: ['30', 'Done'], memory: {},
      stats: { compileTime: '5 steps', executeTime: '2 steps', rerunTime: '2 steps (no recompile)' }
    });

    // 11. Second run: skip compilation
    steps.push({
      phase: 'rerun', highlightLines: [], statusText: 'Second run: Object code already exists -- execute directly!',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: [], memory: {},
      stats: { compileTime: '5 steps', executeTime: '2 steps', rerunTime: '2 steps (no recompile)' }
    });

    // 12. Instant output
    steps.push({
      phase: 'rerun-done', highlightLines: [], statusText: 'Output shown instantly: 30, Done',
      sourceVisible: true, compilerLabel: 'COMPILER', objectCode: genObjectCode(), output: ['30', 'Done'], memory: {},
      stats: { compileTime: '5 steps', executeTime: '2 steps', rerunTime: '2 steps (no recompile)' }
    });
  }

  /* ── Interpreter steps ──────────────────────────────────────── */
  function genInterpreterSteps() {
    var runLabels = ['First run', 'Second run'];

    for (var run = 0; run < 2; run++) {
      var mem = {};
      var out = [];

      if (run === 1) {
        steps.push({
          phase: 'rerun-start', highlightLine: -1, statusText: 'Second run: Must re-interpret every line!',
          sourceVisible: true, interpreterLabel: 'INTERPRETER', output: [], memory: {},
          runLabel: runLabels[run]
        });
      } else {
        // 1. Show source
        steps.push({
          phase: 'source', highlightLine: -1, statusText: 'Source code ready (' + runLabels[run] + ')',
          sourceVisible: true, interpreterLabel: '', output: [], memory: {},
          runLabel: runLabels[run]
        });
      }

      for (var i = 0; i < SOURCE_LINES.length; i++) {
        if (hasError && i === ERROR_LINE) {
          // Translating line - error
          steps.push({
            phase: 'translating', highlightLine: i, statusText: 'Translating line ' + (i + 1) + '...',
            sourceVisible: true, interpreterLabel: 'Translating', output: out.slice(), memory: copyObj(mem),
            runLabel: runLabels[run]
          });
          // Error!
          steps.push({
            phase: 'error', highlightLine: i, statusText: 'Error! Interpretation stopped at line ' + (i + 1) + '.',
            sourceVisible: true, interpreterLabel: 'ERROR', output: out.slice(), memory: copyObj(mem),
            isError: true, runLabel: runLabels[run]
          });
          // Key difference note
          var partial = out.length > 0 ? 'Lines 1-' + i + ' already executed -- partial output produced!' : 'No output before error.';
          steps.push({
            phase: 'error-note', highlightLine: i, statusText: partial,
            sourceVisible: true, interpreterLabel: 'STOPPED', output: out.slice(), memory: copyObj(mem),
            isError: true, runLabel: runLabels[run]
          });
          break; // stop this run
        }

        // Translating line
        steps.push({
          phase: 'translating', highlightLine: i, statusText: 'Translating line ' + (i + 1) + '...',
          sourceVisible: true, interpreterLabel: 'Translating', output: out.slice(), memory: copyObj(mem),
          runLabel: runLabels[run]
        });

        // Executing line
        var execText = '';
        if (i === 0) { mem.x = 10; execText = 'Executing: x = 10'; }
        else if (i === 1) { mem.y = 20; execText = 'Executing: y = 20'; }
        else if (i === 2) { mem.z = mem.x + mem.y; execText = 'Executing: z = x + y'; }
        else if (i === 3) { out.push('30'); execText = 'Executing: print(z)'; }
        else if (i === 4) { out.push('Done'); execText = 'Executing: print("Done")'; }

        steps.push({
          phase: 'executing', highlightLine: i, statusText: execText,
          sourceVisible: true, interpreterLabel: 'Executing', output: out.slice(), memory: copyObj(mem),
          runLabel: runLabels[run]
        });
      }

      if (!(hasError && run === 0)) {
        // If no error or second run also errors, show finished
        if (!hasError) {
          steps.push({
            phase: 'finished', highlightLine: -1, statusText: 'Program finished (' + runLabels[run] + ').',
            sourceVisible: true, interpreterLabel: 'INTERPRETER', output: out.slice(), memory: copyObj(mem),
            runLabel: runLabels[run],
            stats: run === 1 ? { firstOutput: 'step 5', totalTime: '7 steps', rerunTime: '7 steps (re-interpret all)' } : null
          });
        }
      }

      if (hasError) break; // only one run when error
    }
  }

  /* ── Comparison steps ───────────────────────────────────────── */
  function genComparisonSteps() {
    // Side-by-side: compiler on left, interpreter on right
    // We merge the timelines so both advance together

    // Compiler phases (simplified)
    var compPhases = [
      { label: 'Source code ready', detail: '', hl: [], objCode: null, out: [] },
      { label: 'All lines to compiler', detail: 'COMPILER', hl: [0,1,2,3,4], objCode: null, out: [] },
      { label: 'Lexical Analysis', detail: 'Lexical Analysis', hl: [0,1,2,3,4], objCode: null, out: [] },
      { label: 'Syntax Analysis', detail: 'Syntax Analysis', hl: [0,1,2,3,4], objCode: null, out: [] },
      { label: 'Code Generation', detail: 'Code Generation', hl: [0,1,2,3,4], objCode: null, out: [] },
      { label: 'Object code produced', detail: 'COMPILER', hl: [], objCode: true, out: [] },
      { label: 'Compilation complete', detail: 'COMPILER', hl: [], objCode: true, out: [] },
      { label: 'Execute: print(z) -> 30', detail: 'Execute', hl: [], objCode: true, out: ['30'] },
      { label: 'Execute: print("Done")', detail: 'Execute', hl: [], objCode: true, out: ['30', 'Done'] },
      { label: 'Program finished', detail: '', hl: [], objCode: true, out: ['30', 'Done'] }
    ];

    // Interpreter phases
    var intPhases = [
      { label: 'Source code ready', hl: -1, out: [], mem: {} },
      { label: 'Translating line 1...', hl: 0, out: [], mem: {} },
      { label: 'x = 10', hl: 0, out: [], mem: { x: 10 } },
      { label: 'Translating line 2...', hl: 1, out: [], mem: { x: 10 } },
      { label: 'y = 20', hl: 1, out: [], mem: { x: 10, y: 20 } },
      { label: 'Translating line 3...', hl: 2, out: [], mem: { x: 10, y: 20 } },
      { label: 'z = x + y = 30', hl: 2, out: [], mem: { x: 10, y: 20, z: 30 } },
      { label: 'print(z) -> 30', hl: 3, out: ['30'], mem: { x: 10, y: 20, z: 30 } },
      { label: 'print("Done")', hl: 4, out: ['30', 'Done'], mem: { x: 10, y: 20, z: 30 } },
      { label: 'Program finished', hl: -1, out: ['30', 'Done'], mem: { x: 10, y: 20, z: 30 } }
    ];

    var maxLen = Math.max(compPhases.length, intPhases.length);

    for (var i = 0; i < maxLen; i++) {
      var ci = Math.min(i, compPhases.length - 1);
      var ii = Math.min(i, intPhases.length - 1);
      steps.push({
        phase: 'comparison',
        compiler: compPhases[ci],
        interpreter: intPhases[ii],
        statusText: 'Step ' + (i + 1) + ' of ' + maxLen,
        compStep: ci,
        intStep: ii
      });
    }

    // Final comparison stats
    steps.push({
      phase: 'comparison-stats',
      compiler: compPhases[compPhases.length - 1],
      interpreter: intPhases[intPhases.length - 1],
      statusText: 'Comparison complete',
      compStats: { firstOutput: 'step 8', totalTime: '10 steps', rerunTime: '2 steps' },
      intStats:  { firstOutput: 'step 8', totalTime: '10 steps', rerunTime: '10 steps' }
    });
  }

  /* ── Helpers ────────────────────────────────────────────────── */
  function genObjectCode() {
    return [
      '01001010 00001010',
      '01001011 00010100',
      '00110010 01001010',
      '11110001 01001100',
      '11110001 01000100'
    ];
  }

  function copyObj(o) {
    var r = {};
    for (var k in o) { if (o.hasOwnProperty(k)) r[k] = o[k]; }
    return r;
  }

  /* ================================================================
   *  CANVAS DRAWING
   * ================================================================ */

  function drawFrame() {
    if (!steps.length) return;
    var s = steps[stepIndex];

    var size = SimulationEngine.resizeCanvas(canvas, 380, 0.55, 520);
    var w = size.w;
    var h = size.h;
    var tc = SimulationEngine.themeColors();

    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, w, h);

    if (currentTab === 'comparison') {
      drawComparison(w, h, tc, s);
    } else if (currentTab === 'interpreter') {
      drawInterpreter(w, h, tc, s);
    } else {
      drawCompiler(w, h, tc, s);
    }

    updateStats(s);
  }

  /* ── Draw rounded rectangle ─────────────────────────────────── */
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function fillRoundRect(x, y, w, h, r, fill, stroke) {
    roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  /* ── Draw arrow between two points ──────────────────────────── */
  function drawArrow(x1, y1, x2, y2, color) {
    var headLen = 10;
    var angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  /* ── Draw source code box ───────────────────────────────────── */
  function drawSourceBox(x, y, bw, bh, tc, highlightLines, label) {
    fillRoundRect(x, y, bw, bh, 6, tc.surface, tc.border);

    // Title
    ctx.fillStyle = tc.muted;
    ctx.font = 'bold 11px ' + fontStack();
    ctx.fillText(label || 'Source Code', x + 8, y + 16);

    var lineH = Math.min(22, (bh - 28) / SOURCE_LINES.length);
    var startY = y + 28;

    for (var i = 0; i < SOURCE_LINES.length; i++) {
      var ly = startY + i * lineH;
      var isHl = highlightLines && highlightLines.indexOf(i) !== -1;

      if (isHl) {
        ctx.fillStyle = tc.primaryLight;
        ctx.fillRect(x + 4, ly - 2, bw - 8, lineH);
      }

      // Line number
      ctx.fillStyle = tc.muted;
      ctx.font = '11px monospace';
      ctx.fillText((i + 1) + '', x + 10, ly + 12);

      // Code
      ctx.fillStyle = isHl ? tc.primary : tc.text;
      ctx.font = '12px monospace';
      ctx.fillText(SOURCE_LINES[i], x + 28, ly + 12);
    }
  }

  /* ── Draw compiler "machine" box ────────────────────────────── */
  function drawMachineBox(x, y, bw, bh, tc, label, isError, isActive) {
    var bg = isError ? CLR_ERROR : (isActive ? tc.primary : tc.surfaceAlt);
    var border = isError ? CLR_ERROR : (isActive ? tc.primary : tc.border);
    fillRoundRect(x, y, bw, bh, 6, bg, border);

    // Gear-like decoration
    ctx.fillStyle = isError ? '#fff' : (isActive ? tc.primaryFg : tc.muted);
    ctx.font = 'bold 13px ' + fontStack();

    var lines = label.split('\n');
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + bw / 2 - ctx.measureText(lines[i]).width / 2, y + bh / 2 + i * 16 - (lines.length - 1) * 8 + 5);
    }

    // Animated "gear" dots if active
    if (isActive && !isError) {
      var time = Date.now() / 300;
      for (var g = 0; g < 3; g++) {
        var gx = x + bw / 2 - 12 + g * 12;
        var gy = y + bh - 14;
        var sz = 3 + Math.sin(time + g) * 1.5;
        ctx.beginPath();
        ctx.arc(gx, gy, sz, 0, Math.PI * 2);
        ctx.fillStyle = tc.primaryFg;
        ctx.fill();
      }
    }
  }

  /* ── Draw object code box ───────────────────────────────────── */
  function drawObjectCodeBox(x, y, bw, bh, tc, objectCode) {
    fillRoundRect(x, y, bw, bh, 6, tc.surface, CLR_SUCCESS);

    ctx.fillStyle = CLR_SUCCESS;
    ctx.font = 'bold 11px ' + fontStack();
    ctx.fillText('Object Code', x + 8, y + 16);

    if (objectCode) {
      var lineH = Math.min(20, (bh - 28) / objectCode.length);
      for (var i = 0; i < objectCode.length; i++) {
        ctx.fillStyle = tc.text;
        ctx.font = '10px monospace';
        ctx.fillText(objectCode[i], x + 8, y + 30 + i * lineH);
      }
    }
  }

  /* ── Draw output box ────────────────────────────────────────── */
  function drawOutputBox(x, y, bw, bh, tc, output) {
    fillRoundRect(x, y, bw, bh, 6, tc.surface, tc.border);

    ctx.fillStyle = tc.muted;
    ctx.font = 'bold 11px ' + fontStack();
    ctx.fillText('Output', x + 8, y + 16);

    if (output && output.length > 0) {
      for (var i = 0; i < output.length; i++) {
        ctx.fillStyle = CLR_SUCCESS;
        ctx.font = 'bold 13px monospace';
        ctx.fillText('> ' + output[i], x + 10, y + 34 + i * 20);
      }
    } else {
      ctx.fillStyle = tc.muted;
      ctx.font = '11px ' + fontStack();
      ctx.fillText('(no output yet)', x + 10, y + 34);
    }
  }

  /* ── Draw memory box (interpreter) ──────────────────────────── */
  function drawMemoryBox(x, y, bw, bh, tc, memory) {
    fillRoundRect(x, y, bw, bh, 6, tc.surface, tc.border);

    ctx.fillStyle = tc.muted;
    ctx.font = 'bold 11px ' + fontStack();
    ctx.fillText('Memory', x + 8, y + 16);

    var keys = [];
    for (var k in memory) { if (memory.hasOwnProperty(k)) keys.push(k); }

    if (keys.length === 0) {
      ctx.fillStyle = tc.muted;
      ctx.font = '11px ' + fontStack();
      ctx.fillText('(empty)', x + 10, y + 34);
    } else {
      for (var i = 0; i < keys.length; i++) {
        ctx.fillStyle = tc.primary;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(keys[i] + ' = ' + memory[keys[i]], x + 10, y + 34 + i * 18);
      }
    }
  }

  /* ── Draw status bar ────────────────────────────────────────── */
  function drawStatusBar(x, y, w, tc, text, isError) {
    var barH = 30;
    var bg = isError ? CLR_ERROR : tc.primary;
    fillRoundRect(x, y, w, barH, 4, bg, null);

    ctx.fillStyle = isError ? '#fff' : tc.primaryFg;
    ctx.font = 'bold 12px ' + fontStack();

    // Truncate if too long
    var maxChars = Math.floor(w / 7);
    var displayText = text.length > maxChars ? text.substring(0, maxChars - 3) + '...' : text;
    ctx.fillText(displayText, x + 10, y + 19);
  }

  /* ── Font stack ─────────────────────────────────────────────── */
  function fontStack() {
    return "'Segoe UI', system-ui, sans-serif";
  }

  /* ================================================================
   *  COMPILER TAB DRAWING
   * ================================================================ */
  function drawCompiler(w, h, tc, s) {
    var pad = 16;
    var usable = w - pad * 2;

    // Layout: source box (left), machine box (center), object/output (right)
    var srcW = Math.min(160, usable * 0.28);
    var machW = Math.min(160, usable * 0.26);
    var rightW = Math.min(160, usable * 0.28);
    var gapX = (usable - srcW - machW - rightW) / 2;
    if (gapX < 20) gapX = 20;

    var srcX = pad;
    var machX = srcX + srcW + gapX;
    var rightX = machX + machW + gapX;

    var topY = pad;
    var boxH = Math.min(160, h * 0.42);

    // Source code
    if (s.sourceVisible) {
      drawSourceBox(srcX, topY, srcW, boxH, tc, s.highlightLines);
    }

    // Compiler machine
    var machLabel = s.compilerLabel || '';
    var isActive = s.phase !== 'source' && s.phase !== 'finished' && s.phase !== 'rerun-done';
    if (machLabel) {
      drawMachineBox(machX, topY, machW, boxH, tc, machLabel, s.isError, isActive);
    }

    // Arrows
    if (s.phase !== 'source' && !s.isError) {
      drawArrow(srcX + srcW, topY + boxH / 2, machX, topY + boxH / 2, tc.primary);
    }
    if (s.phase === 'source') {
      // no arrows
    } else if (s.isError) {
      drawArrow(srcX + srcW, topY + boxH / 2, machX, topY + boxH / 2, CLR_ERROR);
    }

    // Right side: object code or output
    var objH = Math.min(boxH * 0.55, 100);
    var outY = topY + objH + 10;
    var outH = boxH - objH - 10;

    if (s.objectCode) {
      drawObjectCodeBox(rightX, topY, rightW, objH, tc, s.objectCode);
      drawArrow(machX + machW, topY + boxH * 0.3, rightX, topY + objH / 2, CLR_SUCCESS);

      // Output box below object code
      drawOutputBox(rightX, outY, rightW, outH, tc, s.output);
      if (s.output.length > 0) {
        drawArrow(rightX + rightW / 2, topY + objH, rightX + rightW / 2, outY, CLR_SUCCESS);
      }
    } else if (!s.isError && s.phase !== 'source') {
      // Show placeholder
      fillRoundRect(rightX, topY, rightW, boxH, 6, tc.surfaceAlt, tc.borderMuted);
      ctx.fillStyle = tc.muted;
      ctx.font = '11px ' + fontStack();
      ctx.fillText('Object code', rightX + 10, topY + boxH / 2 - 6);
      ctx.fillText('(not yet)', rightX + 10, topY + boxH / 2 + 10);
    }

    // Rerun indicator
    if (s.phase === 'rerun' || s.phase === 'rerun-done') {
      var rerunY = topY + boxH + 14;
      fillRoundRect(machX - 10, rerunY, machW + 20, 28, 4, CLR_WARN, null);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px ' + fontStack();
      ctx.fillText('RERUN: No recompile needed!', machX - 4, rerunY + 18);
    }

    // Status bar
    var statusY = h - pad - 34;
    drawStatusBar(pad, statusY, w - pad * 2, tc, s.statusText, s.isError);
  }

  /* ================================================================
   *  INTERPRETER TAB DRAWING
   * ================================================================ */
  function drawInterpreter(w, h, tc, s) {
    var pad = 16;
    var usable = w - pad * 2;

    // Layout: source (left), interpreter box (center), memory + output (right)
    var srcW = Math.min(160, usable * 0.28);
    var machW = Math.min(140, usable * 0.22);
    var rightW = Math.min(180, usable * 0.32);
    var gapX = (usable - srcW - machW - rightW) / 2;
    if (gapX < 16) gapX = 16;

    var srcX = pad;
    var machX = srcX + srcW + gapX;
    var rightX = machX + machW + gapX;

    var topY = pad;
    var boxH = Math.min(170, h * 0.44);

    // Highlight array for source box
    var hlLines = [];
    if (s.highlightLine >= 0) hlLines = [s.highlightLine];

    drawSourceBox(srcX, topY, srcW, boxH, tc, hlLines);

    // Interpreter machine
    var machLabel = s.interpreterLabel || 'INTERPRETER';
    var isActive = s.phase === 'translating' || s.phase === 'executing';
    if (machLabel) {
      drawMachineBox(machX, topY, machW, boxH * 0.5, tc, machLabel, s.isError, isActive);
    }

    // Arrow from source to machine
    if (s.highlightLine >= 0) {
      var lineY = topY + 28 + s.highlightLine * Math.min(22, (boxH - 28) / SOURCE_LINES.length) + 8;
      drawArrow(srcX + srcW, lineY, machX, topY + boxH * 0.25, s.isError ? CLR_ERROR : tc.primary);
    }

    // Arrow from machine to output/memory
    if (s.phase === 'executing' && !s.isError) {
      drawArrow(machX + machW, topY + boxH * 0.25, rightX, topY + 30, CLR_SUCCESS);
    }

    // Memory box (top right)
    var memH = Math.min(boxH * 0.45, 90);
    drawMemoryBox(rightX, topY, rightW, memH, tc, s.memory || {});

    // Output box (bottom right)
    var outY = topY + memH + 10;
    var outH = boxH - memH - 10;
    drawOutputBox(rightX, outY, rightW, outH, tc, s.output || []);

    // Run label
    if (s.runLabel) {
      ctx.fillStyle = tc.muted;
      ctx.font = 'bold 11px ' + fontStack();
      ctx.fillText(s.runLabel, srcX, h - pad - 44);
    }

    // Status bar
    var statusY = h - pad - 34;
    drawStatusBar(pad, statusY, w - pad * 2, tc, s.statusText, s.isError);
  }

  /* ================================================================
   *  COMPARISON TAB DRAWING
   * ================================================================ */
  function drawComparison(w, h, tc, s) {
    var pad = 12;
    var halfW = (w - pad * 3) / 2;
    var leftX = pad;
    var rightX = pad * 2 + halfW;

    // Headers
    ctx.fillStyle = tc.primary;
    ctx.font = 'bold 13px ' + fontStack();
    ctx.fillText('COMPILER', leftX + halfW / 2 - 30, pad + 14);

    ctx.fillStyle = tc.accent;
    ctx.fillText('INTERPRETER', rightX + halfW / 2 - 40, pad + 14);

    // Divider
    ctx.strokeStyle = tc.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w / 2, pad + 20);
    ctx.lineTo(w / 2, h - pad - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    var topY = pad + 24;
    var boxH = Math.min(140, (h - topY - 90) * 0.65);

    if (s.phase === 'comparison-stats') {
      // Show final comparison stats
      drawComparisonFinal(w, h, tc, s, leftX, rightX, halfW, topY);
    } else {
      // Compiler side
      var comp = s.compiler;
      var srcW = Math.min(halfW * 0.48, 130);
      var machW = Math.min(halfW * 0.38, 100);

      // Source box (small)
      drawSourceBox(leftX, topY, srcW, boxH, tc, comp.hl, 'Source');

      // Compiler box
      var cmX = leftX + srcW + 6;
      if (comp.detail) {
        drawMachineBox(cmX, topY, machW, boxH * 0.5, tc, comp.detail, false, true);
        drawArrow(leftX + srcW, topY + boxH * 0.25, cmX, topY + boxH * 0.25, tc.primary);
      }

      // Object code / output
      if (comp.objCode) {
        var objY = topY + boxH * 0.55;
        fillRoundRect(cmX, objY, machW, boxH * 0.4, 4, tc.surface, CLR_SUCCESS);
        ctx.fillStyle = CLR_SUCCESS;
        ctx.font = 'bold 9px ' + fontStack();
        ctx.fillText('Object Code', cmX + 4, objY + 12);
        ctx.font = '8px monospace';
        ctx.fillStyle = tc.text;
        ctx.fillText('01001010...', cmX + 4, objY + 24);
      }

      // Compiler output
      var cOutY = topY + boxH + 8;
      drawOutputBox(leftX, cOutY, halfW, 50, tc, comp.out);

      // Compiler status
      ctx.fillStyle = tc.primary;
      ctx.font = '11px ' + fontStack();
      ctx.fillText(comp.label, leftX, cOutY + 66);

      // Interpreter side
      var interp = s.interpreter;
      var iSrcW = Math.min(halfW * 0.48, 130);
      var iMachW = Math.min(halfW * 0.38, 100);

      var iHl = interp.hl >= 0 ? [interp.hl] : [];
      drawSourceBox(rightX, topY, iSrcW, boxH, tc, iHl, 'Source');

      // Interpreter box
      var imX = rightX + iSrcW + 6;
      if (interp.hl >= 0) {
        drawMachineBox(imX, topY, iMachW, boxH * 0.5, tc, 'Interpret', false, true);
        var iLineY = topY + 28 + interp.hl * Math.min(22, (boxH - 28) / SOURCE_LINES.length) + 8;
        drawArrow(rightX + iSrcW, iLineY, imX, topY + boxH * 0.25, tc.accent);
      }

      // Memory display
      var iMemY = topY + boxH * 0.55;
      var memKeys = [];
      for (var mk in interp.mem) { if (interp.mem.hasOwnProperty(mk)) memKeys.push(mk); }
      if (memKeys.length > 0) {
        ctx.fillStyle = tc.muted;
        ctx.font = '9px monospace';
        var memStr = memKeys.map(function (k) { return k + '=' + interp.mem[k]; }).join(' ');
        ctx.fillText(memStr, imX, iMemY + 10);
      }

      // Interpreter output
      var iOutY = topY + boxH + 8;
      drawOutputBox(rightX, iOutY, halfW, 50, tc, interp.out);

      // Interpreter status
      ctx.fillStyle = tc.accent;
      ctx.font = '11px ' + fontStack();
      ctx.fillText(interp.label, rightX, iOutY + 66);
    }

    // Status bar
    var statusY = h - pad - 34;
    drawStatusBar(pad, statusY, w - pad * 2, tc, s.statusText, false);
  }

  /* ── Final comparison stats ─────────────────────────────────── */
  function drawComparisonFinal(w, h, tc, s, leftX, rightX, halfW, topY) {
    // Compiler stats
    var cs = s.compStats;
    var is = s.intStats;

    // Compiler column
    fillRoundRect(leftX, topY, halfW, 140, 6, tc.surface, tc.primary);
    ctx.fillStyle = tc.primary;
    ctx.font = 'bold 14px ' + fontStack();
    ctx.fillText('Compiler', leftX + 12, topY + 24);

    ctx.font = '12px ' + fontStack();
    ctx.fillStyle = tc.text;
    ctx.fillText('First output: ' + cs.firstOutput, leftX + 12, topY + 50);
    ctx.fillText('Total time: ' + cs.totalTime, leftX + 12, topY + 70);
    ctx.fillStyle = CLR_SUCCESS;
    ctx.font = 'bold 12px ' + fontStack();
    ctx.fillText('Rerun time: ' + cs.rerunTime, leftX + 12, topY + 94);

    ctx.fillStyle = tc.muted;
    ctx.font = '11px ' + fontStack();
    ctx.fillText('Object code saved - fast reruns!', leftX + 12, topY + 118);

    // Interpreter column
    fillRoundRect(rightX, topY, halfW, 140, 6, tc.surface, tc.accent);
    ctx.fillStyle = tc.accent;
    ctx.font = 'bold 14px ' + fontStack();
    ctx.fillText('Interpreter', rightX + 12, topY + 24);

    ctx.font = '12px ' + fontStack();
    ctx.fillStyle = tc.text;
    ctx.fillText('First output: ' + is.firstOutput, rightX + 12, topY + 50);
    ctx.fillText('Total time: ' + is.totalTime, rightX + 12, topY + 70);
    ctx.fillStyle = CLR_WARN;
    ctx.font = 'bold 12px ' + fontStack();
    ctx.fillText('Rerun time: ' + is.rerunTime, rightX + 12, topY + 94);

    ctx.fillStyle = tc.muted;
    ctx.font = '11px ' + fontStack();
    ctx.fillText('Must re-interpret every time!', rightX + 12, topY + 118);

    // Output boxes
    var outY = topY + 154;
    drawOutputBox(leftX, outY, halfW, 50, tc, s.compiler.out);
    drawOutputBox(rightX, outY, halfW, 50, tc, s.interpreter.out);
  }

  /* ── Stats bar update ───────────────────────────────────────── */
  function updateStats(s) {
    var html = '';

    html += '<div class="stat-item"><span class="stat-label">Step:</span> <span class="stat-value">' +
      (stepIndex + 1) + ' / ' + steps.length + '</span></div>';

    html += '<div class="stat-item"><span class="stat-label">Tab:</span> <span class="stat-value">' +
      currentTab.charAt(0).toUpperCase() + currentTab.slice(1) + '</span></div>';

    if (s.stats) {
      var st = s.stats;
      if (st.compileTime !== undefined) {
        html += '<div class="stat-item"><span class="stat-label">Compile:</span> <span class="stat-value">' + st.compileTime + '</span></div>';
        html += '<div class="stat-item"><span class="stat-label">Execute:</span> <span class="stat-value">' + st.executeTime + '</span></div>';
        html += '<div class="stat-item"><span class="stat-label">Rerun:</span> <span class="stat-value">' + st.rerunTime + '</span></div>';
      }
      if (st.firstOutput !== undefined) {
        html += '<div class="stat-item"><span class="stat-label">First output:</span> <span class="stat-value">' + st.firstOutput + '</span></div>';
        html += '<div class="stat-item"><span class="stat-label">Total:</span> <span class="stat-value">' + st.totalTime + '</span></div>';
        html += '<div class="stat-item"><span class="stat-label">Rerun:</span> <span class="stat-value">' + st.rerunTime + '</span></div>';
      }
    }

    if (s.compStats) {
      html += '<div class="stat-item"><span class="stat-label">Compiler rerun:</span> <span class="stat-value">' + s.compStats.rerunTime + '</span></div>';
      html += '<div class="stat-item"><span class="stat-label">Interpreter rerun:</span> <span class="stat-value">' + s.intStats.rerunTime + '</span></div>';
    }

    statsBar.innerHTML = html;
  }

  /* ── Resize handling ────────────────────────────────────────── */
  SimulationEngine.debounceResize(drawFrame);

  /* ── Init ───────────────────────────────────────────────────── */
  engine.reset();
})();
