/**
 * Packet Switching Simulator
 *
 * Splits a message into packets, animates them across a simple network
 * diagram (potentially different routes), and reassembles at the destination.
 * Uses pre-computed steps.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var canvas     = document.getElementById('pkt-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');
  var msgInput   = document.getElementById('msg-input');
  var pktSizeSel = document.getElementById('pkt-size');
  var pktTbody   = document.getElementById('pkt-tbody');
  var reassembled = document.getElementById('reassembled');

  /* ── Colours ─────────────────────────────────────────────────── */
  var PKT_COLOURS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

  /* ── Fixed network layout (nodes + edges) ────────────────────── */
  // Positions are in 0..1 space, scaled to canvas at draw time
  var NET_NODES = [
    { id: 'src',  label: 'Source',   rx: 0.08, ry: 0.5 },
    { id: 'r1',   label: 'Router A', rx: 0.3,  ry: 0.25 },
    { id: 'r2',   label: 'Router B', rx: 0.3,  ry: 0.75 },
    { id: 'r3',   label: 'Router C', rx: 0.55, ry: 0.2 },
    { id: 'r4',   label: 'Router D', rx: 0.55, ry: 0.8 },
    { id: 'r5',   label: 'Router E', rx: 0.75, ry: 0.5 },
    { id: 'dst',  label: 'Dest',     rx: 0.92, ry: 0.5 }
  ];
  var NET_EDGES = [
    ['src','r1'],['src','r2'],
    ['r1','r3'],['r1','r5'],
    ['r2','r4'],['r2','r5'],
    ['r3','r5'],['r4','r5'],
    ['r5','dst']
  ];

  // Pre-compute some routes (source → dest)
  var ROUTES = [
    ['src','r1','r3','r5','dst'],
    ['src','r1','r5','dst'],
    ['src','r2','r5','dst'],
    ['src','r2','r4','r5','dst']
  ];

  /* ── State ───────────────────────────────────────────────────── */
  var packets = [];
  var steps = [];
  var stepIndex = 0;

  /* ── Engine ──────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl);
  engine
    .onReset(function () { buildPackets(); generateSteps(); stepIndex = 0; })
    .onStep(function () { if (stepIndex >= steps.length - 1) return false; stepIndex++; })
    .onRender(drawFrame);

  msgInput.addEventListener('input', function () { engine.reset(); });
  pktSizeSel.addEventListener('change', function () { engine.reset(); });

  /* ── Build packets from message ──────────────────────────────── */
  function buildPackets() {
    var msg = msgInput.value || 'Hello';
    var size = parseInt(pktSizeSel.value, 10);
    packets = [];
    for (var i = 0; i < msg.length; i += size) {
      var data = msg.slice(i, i + size);
      var route = ROUTES[packets.length % ROUTES.length];
      packets.push({
        seq: packets.length + 1,
        data: data,
        route: route,
        colour: PKT_COLOURS[packets.length % PKT_COLOURS.length],
        routeStep: -1, // -1 = not sent yet
        arrived: false
      });
    }
  }

  /* ── Generate steps ──────────────────────────────────────────── */
  function generateSteps() {
    steps = [];
    // Snapshot: copy packet states
    function snap() {
      steps.push(packets.map(function (p) {
        return { seq: p.seq, data: p.data, route: p.route.slice(), colour: p.colour, routeStep: p.routeStep, arrived: p.arrived };
      }));
    }

    // Reset all
    packets.forEach(function (p) { p.routeStep = -1; p.arrived = false; });
    snap(); // initial

    // Simulate: advance all packets through their routes, one hop at a time
    // Packets are staggered — packet i starts after i steps delay
    var maxHops = 0;
    packets.forEach(function (p) { if (p.route.length > maxHops) maxHops = p.route.length; });
    var totalSteps = maxHops + packets.length;

    for (var t = 0; t < totalSteps; t++) {
      var moved = false;
      for (var pi = 0; pi < packets.length; pi++) {
        var p = packets[pi];
        if (p.arrived) continue;
        // Stagger start
        if (t < pi) continue;
        if (p.routeStep < p.route.length - 1) {
          p.routeStep++;
          moved = true;
          if (p.routeStep === p.route.length - 1) p.arrived = true;
        }
      }
      snap();
      if (!moved) break;
    }
  }

  /* ── Drawing ─────────────────────────────────────────────────── */
  function drawFrame() {
    if (!steps.length) return;
    var size = SimulationEngine.resizeCanvas(canvas, 300, 0.45);
    var w = size.w;
    var h = size.h;
    var pad = 30;
    var snap = steps[stepIndex];

    var tc = SimulationEngine.themeColors();
    ctx.fillStyle = tc.bg; ctx.fillRect(0, 0, w, h);

    // Scale node positions
    var nodePos = {};
    NET_NODES.forEach(function (n) {
      nodePos[n.id] = { x: pad + n.rx * (w - pad * 2), y: pad + n.ry * (h - pad * 2) };
    });

    // Draw edges
    ctx.strokeStyle = tc.borderMuted; ctx.lineWidth = 1.5;
    NET_EDGES.forEach(function (e) {
      var a = nodePos[e[0]], b = nodePos[e[1]];
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    // Draw packets on their current node
    var nodePackets = {}; // nodeId -> [packets]
    snap.forEach(function (p) {
      if (p.routeStep < 0) return;
      var nodeId = p.route[p.routeStep];
      if (!nodePackets[nodeId]) nodePackets[nodeId] = [];
      nodePackets[nodeId].push(p);
    });

    // Draw nodes
    NET_NODES.forEach(function (n) {
      var pos = nodePos[n.id];
      var isEndpoint = n.id === 'src' || n.id === 'dst';
      var r = isEndpoint ? 22 : 16;
      ctx.fillStyle = isEndpoint ? tc.primary : tc.muted;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = (isEndpoint ? 'bold ' : '') + '10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(n.label, pos.x, pos.y + 3);
    });

    // Draw packet chips near nodes
    Object.keys(nodePackets).forEach(function (nodeId) {
      var pos = nodePos[nodeId];
      var pkts = nodePackets[nodeId];
      pkts.forEach(function (p, i) {
        var px = pos.x + 25 + i * 22;
        var py = pos.y - 8;
        ctx.fillStyle = p.colour;
        ctx.fillRect(px, py, 18, 16);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(p.seq, px + 9, py + 11);
      });
    });
    ctx.textAlign = 'left';

    // Update packet table
    updateTable(snap);

    // Reassembled message
    var arrived = snap.filter(function (p) { return p.arrived; }).sort(function (a, b) { return a.seq - b.seq; });
    if (arrived.length === snap.length && arrived.length > 0) {
      reassembled.textContent = '"' + arrived.map(function (p) { return p.data; }).join('') + '"';
    } else {
      var parts = [];
      for (var i = 0; i < snap.length; i++) {
        var found = arrived.find(function (p) { return p.seq === i + 1; });
        parts.push(found ? found.data : '░'.repeat(snap[0].data.length));
      }
      reassembled.textContent = parts.join(' | ');
    }
  }

  function updateTable(snap) {
    pktTbody.innerHTML = '';
    snap.forEach(function (p) {
      var tr = document.createElement('tr');
      var status = p.routeStep < 0 ? 'Waiting' : p.arrived ? 'Arrived' : 'In transit (' + p.route[p.routeStep] + ')';
      var cells = [
        '<span class="pkt-chip" style="background:' + p.colour + '">' + p.seq + '</span>',
        '<code>' + p.data + '</code>',
        p.seq + '/' + snap.length,
        '192.168.1.1',
        '192.168.1.2',
        status
      ];
      cells.forEach(function (c) { var td = document.createElement('td'); td.innerHTML = c; tr.appendChild(td); });
      pktTbody.appendChild(tr);
    });
  }

  /* ── Resize ──────────────────────────────────────────────────── */
  SimulationEngine.debounceResize(drawFrame);

  engine.reset();
})();
