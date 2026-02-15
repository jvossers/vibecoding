/**
 * Network Topology Builder
 *
 * Place PCs, servers, switches, routers, WAPs on a canvas.
 * Wire them, simulate message passing (BFS routing), simulate failures.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var canvas     = document.getElementById('net-canvas');
  var ctx        = canvas.getContext('2d');
  var controlsEl = document.getElementById('controls');
  var deviceBtns = document.querySelectorAll('[data-device]');
  var presetBtns = document.querySelectorAll('[data-preset]');
  var wireBtn    = document.getElementById('btn-wire');
  var failBtn    = document.getElementById('btn-fail');
  var sendBtn    = document.getElementById('btn-send');
  var clearBtn   = document.getElementById('btn-clear');

  /* ── Colours & sizes ─────────────────────────────────────────── */
  var DEVICE_CLR = { pc: '#3b82f6', server: '#8b5cf6', switch: '#f59e0b', router: '#10b981', wap: '#ec4899' };
  var NODE_R = 24;

  /* ── State ───────────────────────────────────────────────────── */
  var devices = [];  // { id, type, x, y, failed }
  var links = [];    // { a, b, failed }
  var nextId = 1;
  var placingType = null;
  var mode = 'place'; // 'place' | 'wire' | 'fail'
  var wireStart = null;
  var dragging = null;
  var messagePath = null;
  var messageStep = -1;
  var messageTimer = null;

  /* ── Engine ──────────────────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, { controls: { play: false, speed: false, step: false } });
  engine.onReset(function () {
    devices = []; links = []; nextId = 1;
    messagePath = null; messageStep = -1;
    draw();
  });

  clearBtn.addEventListener('click', function () { engine.reset(); });

  /* ── Mode buttons ────────────────────────────────────────────── */
  function setMode(m) {
    mode = m;
    wireBtn.classList.toggle('active', m === 'wire');
    failBtn.classList.toggle('active', m === 'fail');
    canvas.style.cursor = m === 'place' ? 'crosshair' : 'default';
  }
  wireBtn.addEventListener('click', function () { setMode(mode === 'wire' ? 'place' : 'wire'); placingType = null; deactivateDeviceBtns(); });
  failBtn.addEventListener('click', function () { setMode(mode === 'fail' ? 'place' : 'fail'); placingType = null; deactivateDeviceBtns(); });

  function deactivateDeviceBtns() { deviceBtns.forEach(function (b) { b.classList.remove('active'); }); }

  deviceBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      placingType = btn.getAttribute('data-device');
      deactivateDeviceBtns();
      btn.classList.add('active');
      setMode('place');
    });
  });

  /* ── Presets ──────────────────────────────────────────────────── */
  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var w = parseFloat(canvas.style.width) || 600;
      var h = parseFloat(canvas.style.height) || 360;
      devices = []; links = []; nextId = 1; messagePath = null; messageStep = -1;

      var preset = btn.getAttribute('data-preset');
      if (preset === 'star') {
        var sw = addDevice('switch', w / 2, h / 2);
        for (var i = 0; i < 5; i++) {
          var angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
          var pc = addDevice('pc', w / 2 + Math.cos(angle) * 130, h / 2 + Math.sin(angle) * 120);
          links.push({ a: sw, b: pc, failed: false });
        }
      } else if (preset === 'mesh') {
        var meshDevs = [];
        for (var j = 0; j < 5; j++) {
          var angle2 = (j / 5) * Math.PI * 2 - Math.PI / 2;
          meshDevs.push(addDevice('pc', w / 2 + Math.cos(angle2) * 130, h / 2 + Math.sin(angle2) * 120));
        }
        for (var a = 0; a < meshDevs.length; a++)
          for (var b = a + 1; b < meshDevs.length; b++)
            links.push({ a: meshDevs[a], b: meshDevs[b], failed: false });
      }
      draw();
    });
  });

  function addDevice(type, x, y) {
    var d = { id: nextId++, type: type, x: x, y: y, failed: false };
    devices.push(d);
    return d;
  }

  /* ── Send message (BFS shortest path) ────────────────────────── */
  sendBtn.addEventListener('click', function () {
    var pcs = devices.filter(function (d) { return d.type === 'pc' && !d.failed; });
    if (pcs.length < 2) return;
    var src = pcs[0], dst = pcs[pcs.length - 1];

    // BFS
    var visited = {}; visited[src.id] = true;
    var parent = {};
    var queue = [src];
    var found = false;

    while (queue.length > 0) {
      var curr = queue.shift();
      if (curr === dst) { found = true; break; }
      getNeighbours(curr).forEach(function (nb) {
        if (!visited[nb.id]) {
          visited[nb.id] = true;
          parent[nb.id] = curr;
          queue.push(nb);
        }
      });
    }

    if (!found) { messagePath = null; draw(); return; }

    // Reconstruct path
    var path = [];
    var node = dst;
    while (node) { path.unshift(node); node = parent[node.id] || null; }
    messagePath = path;
    messageStep = 0;

    clearInterval(messageTimer);
    messageTimer = setInterval(function () {
      messageStep++;
      if (messageStep >= messagePath.length) {
        clearInterval(messageTimer);
      }
      draw();
    }, 500);
    draw();
  });

  function getNeighbours(device) {
    var nbs = [];
    links.forEach(function (l) {
      if (l.failed) return;
      if (l.a === device && !l.b.failed) nbs.push(l.b);
      if (l.b === device && !l.a.failed) nbs.push(l.a);
    });
    return nbs;
  }

  /* ── Canvas ──────────────────────────────────────────────────── */
  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth;
    var h = Math.max(360, w * 0.55);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    resize();
    var w = parseFloat(canvas.style.width);
    var h = parseFloat(canvas.style.height);
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, w, h);

    // Links
    links.forEach(function (l) {
      ctx.strokeStyle = l.failed ? '#fca5a5' : '#94a3b8';
      ctx.lineWidth = l.failed ? 1 : 2;
      ctx.setLineDash(l.failed ? [6, 4] : []);
      ctx.beginPath(); ctx.moveTo(l.a.x, l.a.y); ctx.lineTo(l.b.x, l.b.y); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Message path animation
    if (messagePath && messageStep >= 0) {
      for (var pi = 0; pi < messageStep && pi < messagePath.length - 1; pi++) {
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(messagePath[pi].x, messagePath[pi].y);
        ctx.lineTo(messagePath[pi + 1].x, messagePath[pi + 1].y);
        ctx.stroke();
      }
      // Packet dot
      if (messageStep < messagePath.length) {
        var pkt = messagePath[messageStep];
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(pkt.x, pkt.y, 8, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Devices
    devices.forEach(function (d) {
      ctx.fillStyle = d.failed ? '#f1f5f9' : (DEVICE_CLR[d.type] || '#64748b');
      ctx.globalAlpha = d.failed ? 0.4 : 1;
      ctx.beginPath(); ctx.arc(d.x, d.y, NODE_R, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = d.failed ? '#fca5a5' : '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(d.x, d.y, NODE_R, 0, Math.PI * 2); ctx.stroke();

      // Failed X
      if (d.failed) {
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(d.x - 8, d.y - 8); ctx.lineTo(d.x + 8, d.y + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.x + 8, d.y - 8); ctx.lineTo(d.x - 8, d.y + 8); ctx.stroke();
      }

      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(d.type.toUpperCase(), d.x, d.y + 4);
      ctx.textAlign = 'left';
    });
  }

  /* ── Mouse interaction ───────────────────────────────────────── */
  function getPos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function hitDevice(mx, my) {
    for (var i = devices.length - 1; i >= 0; i--) {
      var dx = mx - devices[i].x, dy = my - devices[i].y;
      if (dx * dx + dy * dy < NODE_R * NODE_R) return devices[i];
    }
    return null;
  }
  function hitLink(mx, my) {
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      var dist = pointToSegDist(mx, my, l.a.x, l.a.y, l.b.x, l.b.y);
      if (dist < 8) return l;
    }
    return null;
  }
  function pointToSegDist(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - x1, py - y1);
    var t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  canvas.addEventListener('mousedown', function (e) {
    var pos = getPos(e);

    // Placing device
    if (mode === 'place' && placingType) {
      addDevice(placingType, pos.x, pos.y);
      placingType = null;
      deactivateDeviceBtns();
      draw();
      return;
    }

    // Wire mode
    if (mode === 'wire') {
      var d = hitDevice(pos.x, pos.y);
      if (d) {
        if (!wireStart) { wireStart = d; }
        else if (wireStart !== d) {
          // Check duplicate
          var exists = links.some(function (l) {
            return (l.a === wireStart && l.b === d) || (l.a === d && l.b === wireStart);
          });
          if (!exists) links.push({ a: wireStart, b: d, failed: false });
          wireStart = null;
          draw();
        }
      }
      return;
    }

    // Fail mode
    if (mode === 'fail') {
      var dev = hitDevice(pos.x, pos.y);
      if (dev) { dev.failed = !dev.failed; draw(); return; }
      var link = hitLink(pos.x, pos.y);
      if (link) { link.failed = !link.failed; draw(); return; }
      return;
    }

    // Default: drag device
    var dd = hitDevice(pos.x, pos.y);
    if (dd) dragging = { device: dd, ox: pos.x - dd.x, oy: pos.y - dd.y };
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var pos = getPos(e);
    dragging.device.x = pos.x - dragging.ox;
    dragging.device.y = pos.y - dragging.oy;
    draw();
  });

  canvas.addEventListener('mouseup', function () { dragging = null; });

  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 100); });
  draw();
})();
