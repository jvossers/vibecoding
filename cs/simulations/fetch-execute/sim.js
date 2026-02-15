/**
 * Fetch-Execute Cycle Simulator
 *
 * Pre-computes every micro-step of the FDE cycle for a small program,
 * then plays back snapshots showing register/memory state and active bus.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var canvas      = document.getElementById('fde-canvas');
  var ctx         = canvas.getContext('2d');
  var controlsEl  = document.getElementById('controls');
  var progSelect  = document.getElementById('program-select');
  var statPhase   = document.getElementById('stat-phase');
  var statCycle   = document.getElementById('stat-cycle');

  /* ── Colours ─────────────────────────────────────────────────── */
  var C = {
    bg:      '#f8fafc', box:     '#ffffff', border:  '#cbd5e1',
    text:    '#1e293b', muted:   '#64748b', active:  '#2563eb',
    activeBg:'#dbeafe', fetch:   '#6366f1', decode:  '#f59e0b',
    execute: '#10b981', bus:     '#ef4444'
  };

  /* ── Programs ────────────────────────────────────────────────── */
  var PROGRAMS = {
    add: {
      name: 'Add two numbers',
      memory: [
        { addr: 0, raw: 'LDA 7', op: 'LDA', arg: 7 },
        { addr: 1, raw: 'ADD 8', op: 'ADD', arg: 8 },
        { addr: 2, raw: 'STA 9', op: 'STA', arg: 9 },
        { addr: 3, raw: 'HLT',   op: 'HLT', arg: null },
        null, null, null,
        { addr: 7, raw: '5', op: 'DAT', arg: 5 },
        { addr: 8, raw: '3', op: 'DAT', arg: 3 },
        { addr: 9, raw: '0', op: 'DAT', arg: 0 }
      ]
    },
    count: {
      name: 'Count to 5',
      memory: [
        { addr: 0, raw: 'LDA 6', op: 'LDA', arg: 6 },
        { addr: 1, raw: 'ADD 7', op: 'ADD', arg: 7 },
        { addr: 2, raw: 'STA 6', op: 'STA', arg: 6 },
        { addr: 3, raw: 'CMP 8', op: 'CMP', arg: 8 },
        { addr: 4, raw: 'BNE 0', op: 'BNE', arg: 0 },
        { addr: 5, raw: 'HLT',   op: 'HLT', arg: null },
        { addr: 6, raw: '0', op: 'DAT', arg: 0 },
        { addr: 7, raw: '1', op: 'DAT', arg: 1 },
        { addr: 8, raw: '5', op: 'DAT', arg: 5 }
      ]
    },
    'load-store': {
      name: 'Load & Store',
      memory: [
        { addr: 0, raw: 'LDA 4', op: 'LDA', arg: 4 },
        { addr: 1, raw: 'STA 5', op: 'STA', arg: 5 },
        { addr: 2, raw: 'OUT',   op: 'OUT', arg: null },
        { addr: 3, raw: 'HLT',   op: 'HLT', arg: null },
        { addr: 4, raw: '42', op: 'DAT', arg: 42 },
        { addr: 5, raw: '0',  op: 'DAT', arg: 0 }
      ]
    }
  };

  /* ── State ───────────────────────────────────────────────────── */
  var steps = [];
  var stepIndex = 0;

  /* ── Engine ──────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);
  engine
    .onReset(function () { generateSteps(); stepIndex = 0; })
    .onStep(function ()  { if (stepIndex >= steps.length - 1) return false; stepIndex++; })
    .onRender(drawFrame);

  progSelect.addEventListener('change', function () { engine.reset(); });

  /* ── Step generation ─────────────────────────────────────────── */
  function generateSteps() {
    var prog = PROGRAMS[progSelect.value];
    var mem = prog.memory.map(function (m) { return m ? { addr: m.addr, raw: m.raw, op: m.op, arg: m.arg } : null; });
    // pad to 10 slots
    while (mem.length < 10) mem.push(null);

    var regs = { PC: 0, MAR: 0, MDR: '', CIR: '', ACC: 0 };
    var cmpFlag = false;
    steps = [];

    function snap(phase, busFrom, busTo, desc) {
      steps.push({
        regs: { PC: regs.PC, MAR: regs.MAR, MDR: regs.MDR, CIR: regs.CIR, ACC: regs.ACC },
        mem: mem.map(function (m) { return m ? { addr: m.addr, raw: m.raw, op: m.op, arg: m.arg } : null; }),
        phase: phase, busFrom: busFrom || null, busTo: busTo || null, desc: desc || ''
      });
    }

    snap('ready', null, null, 'Ready to begin');
    var maxCycles = 50;

    for (var cyc = 0; cyc < maxCycles; cyc++) {
      var pc = regs.PC;
      var instr = mem[pc];
      if (!instr || instr.op === 'HLT') {
        snap('halted', null, null, 'Program halted');
        break;
      }

      // FETCH phase
      regs.MAR = regs.PC;
      snap('fetch', 'PC', 'MAR', 'PC copied to MAR');

      regs.MDR = instr.raw;
      snap('fetch', 'Memory', 'MDR', 'Instruction at address ' + regs.MAR + ' loaded into MDR');

      regs.CIR = instr.raw;
      snap('fetch', 'MDR', 'CIR', 'MDR copied to CIR');

      regs.PC = regs.PC + 1;
      snap('fetch', null, 'PC', 'PC incremented to ' + regs.PC);

      // DECODE phase
      snap('decode', 'CIR', 'CU', 'Control Unit decodes: ' + instr.op + (instr.arg !== null ? ' ' + instr.arg : ''));

      // EXECUTE phase
      if (instr.op === 'LDA') {
        regs.MAR = instr.arg;
        snap('execute', null, 'MAR', 'MAR set to ' + instr.arg);
        var val = mem[instr.arg] ? mem[instr.arg].arg : 0;
        regs.MDR = '' + val;
        snap('execute', 'Memory', 'MDR', 'Value ' + val + ' loaded from address ' + instr.arg);
        regs.ACC = val;
        snap('execute', 'MDR', 'ACC', 'ACC set to ' + val);
      } else if (instr.op === 'ADD') {
        regs.MAR = instr.arg;
        var addVal = mem[instr.arg] ? mem[instr.arg].arg : 0;
        regs.MDR = '' + addVal;
        snap('execute', 'Memory', 'MDR', 'Value ' + addVal + ' loaded from address ' + instr.arg);
        regs.ACC = regs.ACC + addVal;
        snap('execute', 'ALU', 'ACC', 'ALU adds: ACC = ' + (regs.ACC - addVal) + ' + ' + addVal + ' = ' + regs.ACC);
      } else if (instr.op === 'STA') {
        regs.MAR = instr.arg;
        regs.MDR = '' + regs.ACC;
        snap('execute', 'ACC', 'MDR', 'ACC value ' + regs.ACC + ' copied to MDR');
        if (mem[instr.arg]) mem[instr.arg].arg = regs.ACC;
        if (mem[instr.arg]) mem[instr.arg].raw = '' + regs.ACC;
        snap('execute', 'MDR', 'Memory', 'Value ' + regs.ACC + ' stored at address ' + instr.arg);
      } else if (instr.op === 'CMP') {
        var cmpVal = mem[instr.arg] ? mem[instr.arg].arg : 0;
        cmpFlag = (regs.ACC === cmpVal);
        snap('execute', 'ALU', null, 'Compare ACC(' + regs.ACC + ') with ' + cmpVal + ' → ' + (cmpFlag ? 'equal' : 'not equal'));
      } else if (instr.op === 'BNE') {
        if (!cmpFlag) {
          regs.PC = instr.arg;
          snap('execute', null, 'PC', 'Not equal — branch to address ' + instr.arg);
        } else {
          snap('execute', null, null, 'Equal — no branch, continue');
        }
      } else if (instr.op === 'OUT') {
        snap('execute', 'ACC', null, 'Output: ' + regs.ACC);
      }
    }
  }

  /* ── Drawing ─────────────────────────────────────────────────── */
  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth;
    var h = Math.max(360, w * 0.55);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame() {
    if (!steps.length) return;
    var s = steps[stepIndex];
    resizeCanvas();
    var w = parseFloat(canvas.style.width);
    var h = parseFloat(canvas.style.height);

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    var phaseColor = s.phase === 'fetch' ? C.fetch : s.phase === 'decode' ? C.decode : s.phase === 'execute' ? C.execute : C.muted;

    // Layout
    var regW = 130, regH = 44, gap = 10;
    var cpuX = 20, cpuY = 20;
    var cpuW = regW * 2 + gap * 3;
    var cpuH = regH * 3 + gap * 4 + 30;

    // CPU box
    ctx.strokeStyle = phaseColor; ctx.lineWidth = 2;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(cpuX, cpuY, cpuW, cpuH);
    ctx.strokeRect(cpuX, cpuY, cpuW, cpuH);
    ctx.fillStyle = phaseColor; ctx.font = 'bold 13px system-ui';
    ctx.fillText('CPU', cpuX + 8, cpuY + 18);

    // Draw registers
    var regDefs = [
      { name: 'PC',  val: s.regs.PC,  x: cpuX + gap,          y: cpuY + 30 },
      { name: 'MAR', val: s.regs.MAR, x: cpuX + gap,          y: cpuY + 30 + regH + gap },
      { name: 'MDR', val: s.regs.MDR, x: cpuX + gap + regW + gap, y: cpuY + 30 + regH + gap },
      { name: 'CIR', val: s.regs.CIR, x: cpuX + gap,          y: cpuY + 30 + (regH + gap) * 2 },
      { name: 'ACC', val: s.regs.ACC, x: cpuX + gap + regW + gap, y: cpuY + 30 + (regH + gap) * 2 }
    ];

    regDefs.forEach(function (r) {
      var isActive = s.busTo === r.name || s.busFrom === r.name;
      ctx.fillStyle = isActive ? C.activeBg : C.box;
      ctx.fillRect(r.x, r.y, regW, regH);
      ctx.strokeStyle = isActive ? C.active : C.border;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(r.x, r.y, regW, regH);

      ctx.fillStyle = C.muted; ctx.font = 'bold 11px system-ui';
      ctx.fillText(r.name, r.x + 6, r.y + 16);
      ctx.fillStyle = C.text; ctx.font = '14px monospace';
      ctx.fillText('' + r.val, r.x + 6, r.y + 34);
    });

    // ALU / CU labels
    ctx.fillStyle = C.muted; ctx.font = '11px system-ui';
    ctx.fillText('ALU', cpuX + gap + regW + gap + regW - 26, cpuY + 18);

    // Memory panel
    var memX = cpuX + cpuW + 40;
    var memW = Math.min(140, w - memX - 20);
    var memH = cpuH;
    var isMemActive = s.busFrom === 'Memory' || s.busTo === 'Memory';

    ctx.fillStyle = isMemActive ? '#fef3c7' : '#f1f5f9';
    ctx.fillRect(memX, cpuY, memW, memH);
    ctx.strokeStyle = isMemActive ? C.decode : C.border; ctx.lineWidth = isMemActive ? 2 : 1;
    ctx.strokeRect(memX, cpuY, memW, memH);
    ctx.fillStyle = C.muted; ctx.font = 'bold 13px system-ui';
    ctx.fillText('Memory', memX + 6, cpuY + 18);

    var rowH = Math.min(26, (memH - 30) / 10);
    s.mem.forEach(function (m, i) {
      if (!m) return;
      var ry = cpuY + 26 + i * rowH;
      var isAddr = s.regs.MAR === m.addr && (s.busFrom === 'Memory' || s.busTo === 'Memory');
      if (isAddr) {
        ctx.fillStyle = C.activeBg;
        ctx.fillRect(memX + 2, ry - 2, memW - 4, rowH - 2);
      }
      ctx.fillStyle = C.muted; ctx.font = '11px monospace';
      ctx.fillText(m.addr + ':', memX + 8, ry + 12);
      ctx.fillStyle = C.text; ctx.font = '12px monospace';
      ctx.fillText(m.raw, memX + 32, ry + 12);
    });

    // Bus line
    if (s.busFrom && s.busTo) {
      ctx.strokeStyle = C.bus; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      var busY = cpuY + cpuH + 10;
      ctx.beginPath(); ctx.moveTo(cpuX + cpuW / 2, busY); ctx.lineTo(memX + memW / 2, busY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.bus; ctx.font = 'bold 11px system-ui';
      ctx.fillText(s.busFrom + ' → ' + s.busTo, cpuX + cpuW / 2 + 4, busY - 4);
    }

    // Description bar
    var descY = cpuY + cpuH + 30;
    ctx.fillStyle = phaseColor;
    ctx.fillRect(cpuX, descY, w - 40, 32);
    ctx.fillStyle = '#fff'; ctx.font = '13px system-ui';
    var phaseLabel = s.phase.charAt(0).toUpperCase() + s.phase.slice(1);
    ctx.fillText(phaseLabel + ': ' + s.desc, cpuX + 10, descY + 20);

    // Stats
    statPhase.textContent = phaseLabel;
    statPhase.style.color = phaseColor;
    var cycleNum = 0;
    for (var i = 0; i <= stepIndex; i++) { if (steps[i].phase === 'fetch' && (i === 0 || steps[i - 1].phase !== 'fetch')) cycleNum++; }
    statCycle.textContent = cycleNum;
  }

  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(drawFrame, 100); });
  engine.reset();
})();
