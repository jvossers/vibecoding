/**
 * Boolean Logic Gate Simulator
 *
 * Place AND/OR/NOT gates, Input and Output nodes on a canvas.
 * Wire them together by dragging between connectors.
 * Toggle input values and see signals propagate live.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var canvas     = document.getElementById('logic-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');
  var gateBtns   = document.querySelectorAll('[data-gate]');
  var clearBtn   = document.getElementById('clear-circuit');
  var ttWrap     = document.getElementById('truth-table-wrap');

  /* ── Colours (accent colours stay fixed, structural from theme) ─ */
  var CLR_ACCENT = { hi: '#10b981', wireHi: '#10b981' };

  /* ── Constants ───────────────────────────────────────────────── */
  var GW = 80, GH = 50, PIN_R = 6;

  /* ── State ───────────────────────────────────────────────────── */
  var nodes = [];    // { id, type, x, y, value, inputs:[], outputs:[] }
  var wires = [];    // { from: {node,pin}, to: {node,pin} }
  var nextId = 1;
  var placingType = null;
  var draggingWire = null; // { fromNode, fromPin, mx, my }
  var draggingNode = null; // { node, offX, offY }
  var hoverPin = null;

  /* ── Engine (reset = clear) ──────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, { controls: { play: false, speed: false, step: false } });
  engine.onReset(function () {
    nodes = []; wires = []; nextId = 1;
    draggingWire = null; draggingNode = null;
    draw();
  });

  clearBtn.addEventListener('click', function () { engine.reset(); });

  /* ── Gate placement buttons ──────────────────────────────────── */
  gateBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      placingType = btn.getAttribute('data-gate');
      gateBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      canvas.style.cursor = 'crosshair';
    });
  });

  /* ── Pin positions helper ────────────────────────────────────── */
  function getPins(n) {
    var pins = { inputs: [], outputs: [] };
    if (n.type === 'INPUT') {
      pins.outputs.push({ x: n.x + GW, y: n.y + GH / 2, idx: 0 });
    } else if (n.type === 'OUTPUT') {
      pins.inputs.push({ x: n.x, y: n.y + GH / 2, idx: 0 });
    } else if (n.type === 'NOT') {
      pins.inputs.push({ x: n.x, y: n.y + GH / 2, idx: 0 });
      pins.outputs.push({ x: n.x + GW, y: n.y + GH / 2, idx: 0 });
    } else { // AND, OR
      pins.inputs.push({ x: n.x, y: n.y + GH * 0.3, idx: 0 });
      pins.inputs.push({ x: n.x, y: n.y + GH * 0.7, idx: 1 });
      pins.outputs.push({ x: n.x + GW, y: n.y + GH / 2, idx: 0 });
    }
    return pins;
  }

  function hitTestPin(mx, my) {
    for (var i = 0; i < nodes.length; i++) {
      var pins = getPins(nodes[i]);
      var all = pins.inputs.map(function (p) { return { node: nodes[i], side: 'input', pin: p }; })
        .concat(pins.outputs.map(function (p) { return { node: nodes[i], side: 'output', pin: p }; }));
      for (var j = 0; j < all.length; j++) {
        var dx = mx - all[j].pin.x, dy = my - all[j].pin.y;
        if (dx * dx + dy * dy < (PIN_R + 4) * (PIN_R + 4)) return all[j];
      }
    }
    return null;
  }

  function hitTestNode(mx, my) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      var n = nodes[i];
      if (mx >= n.x && mx <= n.x + GW && my >= n.y && my <= n.y + GH) return n;
    }
    return null;
  }

  /* ── Evaluate circuit ────────────────────────────────────────── */
  function evaluate() {
    // Reset all non-input values
    nodes.forEach(function (n) { if (n.type !== 'INPUT') n.value = 0; });

    // Topological evaluation (simple iterative for small circuits)
    for (var iter = 0; iter < 20; iter++) {
      nodes.forEach(function (n) {
        if (n.type === 'INPUT') return;
        var ins = getInputValues(n);
        if (n.type === 'AND')    n.value = (ins.length >= 2 && ins[0] && ins[1]) ? 1 : 0;
        else if (n.type === 'OR')  n.value = (ins.length >= 2 && (ins[0] || ins[1])) ? 1 : 0;
        else if (n.type === 'NOT') n.value = (ins.length >= 1 && !ins[0]) ? 1 : 0;
        else if (n.type === 'OUTPUT') n.value = ins.length >= 1 ? ins[0] : 0;
      });
    }
  }

  function getInputValues(node) {
    var pins = getPins(node);
    return pins.inputs.map(function (pin) {
      // Find wire connected to this input pin
      for (var i = 0; i < wires.length; i++) {
        if (wires[i].to.node === node && wires[i].to.pin === pin.idx) {
          return wires[i].from.node.value;
        }
      }
      return 0;
    });
  }

  /* ── Draw ─────────────────────────────────────────────────────── */
  function draw() {
    evaluate();
    var size = SimulationEngine.resizeCanvas(canvas, 350, 0.5);
    var w = size.w;
    var h = size.h;

    var tc = SimulationEngine.themeColors();
    ctx.fillStyle = tc.bg; ctx.fillRect(0, 0, w, h);

    // Grid dots
    ctx.fillStyle = tc.border;
    for (var gx = 20; gx < w; gx += 20)
      for (var gy = 20; gy < h; gy += 20)
        ctx.fillRect(gx - 0.5, gy - 0.5, 1, 1);

    // Wires
    wires.forEach(function (wr) {
      var fromPins = getPins(wr.from.node).outputs[wr.from.pin];
      var toPins = getPins(wr.to.node).inputs[wr.to.pin];
      if (!fromPins || !toPins) return;
      ctx.strokeStyle = wr.from.node.value ? CLR_ACCENT.wireHi : tc.muted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromPins.x, fromPins.y);
      var mx = (fromPins.x + toPins.x) / 2;
      ctx.bezierCurveTo(mx, fromPins.y, mx, toPins.y, toPins.x, toPins.y);
      ctx.stroke();
    });

    // Dragging wire preview
    if (draggingWire) {
      ctx.strokeStyle = tc.primary; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(draggingWire.sx, draggingWire.sy);
      ctx.lineTo(draggingWire.mx, draggingWire.my); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Nodes
    nodes.forEach(function (n) {
      // Box
      ctx.fillStyle = tc.surface;
      ctx.strokeStyle = tc.muted; ctx.lineWidth = 1.5;
      ctx.fillRect(n.x, n.y, GW, GH);
      ctx.strokeRect(n.x, n.y, GW, GH);

      // Value indicator (top-right corner)
      ctx.fillStyle = n.value ? CLR_ACCENT.hi : tc.borderMuted;
      ctx.beginPath(); ctx.arc(n.x + GW - 10, n.y + 10, 5, 0, Math.PI * 2); ctx.fill();

      // Label
      ctx.fillStyle = tc.text; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(n.type, n.x + GW / 2, n.y + GH / 2 + 5);
      ctx.textAlign = 'left';

      // Pins
      var pins = getPins(n);
      pins.inputs.concat(pins.outputs).forEach(function (p) {
        ctx.fillStyle = tc.primary;
        ctx.beginPath(); ctx.arc(p.x, p.y, PIN_R, 0, Math.PI * 2); ctx.fill();
      });
    });

    updateTruthTable();
  }

  /* ── Mouse interaction ───────────────────────────────────────── */
  function getPos(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener('mousedown', function (e) {
    var pos = getPos(e);

    // Placing a new gate?
    if (placingType) {
      nodes.push({ id: nextId++, type: placingType, x: pos.x - GW / 2, y: pos.y - GH / 2, value: 0 });
      placingType = null;
      gateBtns.forEach(function (b) { b.classList.remove('active'); });
      canvas.style.cursor = 'default';
      draw();
      return;
    }

    // Hit test pins first
    var pinHit = hitTestPin(pos.x, pos.y);
    if (pinHit && pinHit.side === 'output') {
      draggingWire = { fromNode: pinHit.node, fromPin: pinHit.pin.idx, sx: pinHit.pin.x, sy: pinHit.pin.y, mx: pos.x, my: pos.y };
      return;
    }

    // Toggle input
    var nodeHit = hitTestNode(pos.x, pos.y);
    if (nodeHit && nodeHit.type === 'INPUT') {
      nodeHit.value = nodeHit.value ? 0 : 1;
      draw();
      return;
    }

    // Drag node
    if (nodeHit) {
      draggingNode = { node: nodeHit, offX: pos.x - nodeHit.x, offY: pos.y - nodeHit.y };
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    var pos = getPos(e);
    if (draggingWire) {
      draggingWire.mx = pos.x; draggingWire.my = pos.y;
      draw();
    }
    if (draggingNode) {
      draggingNode.node.x = pos.x - draggingNode.offX;
      draggingNode.node.y = pos.y - draggingNode.offY;
      draw();
    }
  });

  canvas.addEventListener('mouseup', function (e) {
    var pos = getPos(e);
    if (draggingWire) {
      var pinHit = hitTestPin(pos.x, pos.y);
      if (pinHit && pinHit.side === 'input' && pinHit.node !== draggingWire.fromNode) {
        // Remove existing wire to this input pin
        wires = wires.filter(function (w) {
          return !(w.to.node === pinHit.node && w.to.pin === pinHit.pin.idx);
        });
        wires.push({
          from: { node: draggingWire.fromNode, pin: draggingWire.fromPin },
          to: { node: pinHit.node, pin: pinHit.pin.idx }
        });
      }
      draggingWire = null;
      draw();
    }
    draggingNode = null;
  });

  /* ── Truth table generation ──────────────────────────────────── */
  function updateTruthTable() {
    var inputs = nodes.filter(function (n) { return n.type === 'INPUT'; });
    var outputs = nodes.filter(function (n) { return n.type === 'OUTPUT'; });
    if (inputs.length === 0 || outputs.length === 0) { ttWrap.innerHTML = ''; return; }
    if (inputs.length > 4) { ttWrap.innerHTML = '<p style="font-size:0.8rem;color:#64748b">Too many inputs for truth table</p>'; return; }

    // Save current input values
    var saved = inputs.map(function (n) { return n.value; });

    var rows = Math.pow(2, inputs.length);
    var html = '<table class="comparison-table"><thead><tr>';
    inputs.forEach(function (n, i) { html += '<th>In ' + (i + 1) + '</th>'; });
    outputs.forEach(function (n, i) { html += '<th>Out ' + (i + 1) + '</th>'; });
    html += '</tr></thead><tbody>';

    for (var r = 0; r < rows; r++) {
      html += '<tr>';
      for (var b = 0; b < inputs.length; b++) {
        var bit = (r >> (inputs.length - 1 - b)) & 1;
        inputs[b].value = bit;
        html += '<td>' + bit + '</td>';
      }
      evaluate();
      outputs.forEach(function (n) { html += '<td>' + n.value + '</td>'; });
      html += '</tr>';
    }
    html += '</tbody></table>';
    ttWrap.innerHTML = html;

    // Restore input values
    inputs.forEach(function (n, i) { n.value = saved[i]; });
    evaluate();
  }

  /* ── Resize ──────────────────────────────────────────────────── */
  SimulationEngine.debounceResize(draw);

  draw();
})();
