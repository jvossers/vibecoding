/**
 * Image Representation Explorer
 * Pixel editor with adjustable resolution and colour depth.
 */
(function () {
  'use strict';

  /* ── DOM ──────────────────────────────────────────────────────── */
  var canvas     = document.getElementById('pixel-canvas');
  var ctx        = canvas.getContext('2d');
  var paletteEl  = document.getElementById('palette');
  var resSelect  = document.getElementById('img-resolution');
  var depthSelect = document.getElementById('img-depth');
  var controlsEl = document.getElementById('controls');
  var statPixels = document.getElementById('stat-pixels');
  var statDepth  = document.getElementById('stat-depth');
  var statSize   = document.getElementById('stat-size');

  /* ── Palette definitions by colour depth ─────────────────────── */
  var PALETTES = {
    1: ['#ffffff', '#000000'],
    2: ['#ffffff', '#aaaaaa', '#555555', '#000000'],
    4: [
      '#000000','#800000','#008000','#808000',
      '#000080','#800080','#008080','#c0c0c0',
      '#808080','#ff0000','#00ff00','#ffff00',
      '#0000ff','#ff00ff','#00ffff','#ffffff'
    ],
    8: null, // generated
    24: null  // full colour picker
  };

  // Generate 256-colour palette (web-safe-ish)
  function gen256() {
    var p = [];
    for (var r = 0; r < 6; r++)
      for (var g = 0; g < 6; g++)
        for (var b = 0; b < 6; b++)
          p.push('rgb(' + (r * 51) + ',' + (g * 51) + ',' + (b * 51) + ')');
    // pad to 256 with greys
    for (var i = p.length; i < 256; i++) {
      var v = Math.round((i - 216) * 6.375);
      p.push('rgb(' + v + ',' + v + ',' + v + ')');
    }
    return p;
  }

  /* ── State ───────────────────────────────────────────────────── */
  var resolution = 8;
  var depth = 8;
  var palette = [];
  var selectedColour = '#000000';
  var pixels = []; // flat array of colour strings
  var painting = false;
  var DISPLAY_SIZE = 360;

  /* ── Engine (reset only) ─────────────────────────────────────── */
  var engine = new SimulationEngine(controlsEl, { controls: { play: false, speed: false, step: false } });
  engine.onReset(function () { initGrid(); });

  resSelect.addEventListener('change', function () { engine.reset(); });
  depthSelect.addEventListener('change', function () { engine.reset(); });

  /* ── Initialise grid ─────────────────────────────────────────── */
  function initGrid() {
    resolution = parseInt(resSelect.value, 10);
    depth = parseInt(depthSelect.value, 10);

    // Build palette
    if (depth === 24) {
      palette = gen256(); // show subset for picking; actual drawing uses colour input
    } else if (depth === 8) {
      palette = gen256();
    } else {
      palette = PALETTES[depth];
    }
    selectedColour = palette[palette.length - 1]; // default to last (usually black)

    buildPalette();

    // Init pixel array to white
    var total = resolution * resolution;
    pixels = [];
    for (var i = 0; i < total; i++) pixels.push('#ffffff');

    updateStats();
    drawGrid();
  }

  /* ── Build palette swatches ──────────────────────────────────── */
  function buildPalette() {
    paletteEl.innerHTML = '';
    var show = palette.slice(0, 64); // show at most 64 swatches
    show.forEach(function (c) {
      var sw = document.createElement('div');
      sw.className = 'palette-swatch' + (c === selectedColour ? ' active' : '');
      sw.style.background = c;
      sw.title = c;
      sw.addEventListener('click', function () {
        selectedColour = c;
        paletteEl.querySelectorAll('.palette-swatch').forEach(function (s) { s.classList.remove('active'); });
        sw.classList.add('active');
      });
      paletteEl.appendChild(sw);
    });

    // For 24-bit, add a colour picker input
    if (depth === 24) {
      var picker = document.createElement('input');
      picker.type = 'color';
      picker.value = '#000000';
      picker.style.width = '28px';
      picker.style.height = '28px';
      picker.style.border = 'none';
      picker.style.cursor = 'pointer';
      picker.title = 'Custom colour';
      picker.addEventListener('input', function () { selectedColour = picker.value; });
      paletteEl.appendChild(picker);
    }
  }

  /* ── Draw pixel grid on canvas ───────────────────────────────── */
  function drawGrid() {
    var size = Math.min(DISPLAY_SIZE, canvas.parentElement.clientWidth - 32);
    var dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var cellSize = size / resolution;

    for (var y = 0; y < resolution; y++) {
      for (var x = 0; x < resolution; x++) {
        ctx.fillStyle = pixels[y * resolution + x];
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = SimulationEngine.themeColors().border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  /* ── Paint on canvas ─────────────────────────────────────────── */
  function paintAt(e) {
    var rect = canvas.getBoundingClientRect();
    var size = rect.width;
    var cellSize = size / resolution;
    var x = Math.floor((e.clientX - rect.left) / cellSize);
    var y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x < 0 || x >= resolution || y < 0 || y >= resolution) return;
    pixels[y * resolution + x] = selectedColour;
    drawGrid();
  }

  canvas.addEventListener('mousedown', function (e) { painting = true; paintAt(e); });
  canvas.addEventListener('mousemove', function (e) { if (painting) paintAt(e); });
  window.addEventListener('mouseup', function () { painting = false; });

  // Touch support
  canvas.addEventListener('touchstart', function (e) { e.preventDefault(); painting = true; paintAt(e.touches[0]); });
  canvas.addEventListener('touchmove', function (e) { e.preventDefault(); if (painting) paintAt(e.touches[0]); });
  canvas.addEventListener('touchend', function () { painting = false; });

  /* ── Stats ───────────────────────────────────────────────────── */
  function updateStats() {
    var totalPixels = resolution * resolution;
    var bits = totalPixels * depth;
    var bytes = bits / 8;

    statPixels.textContent = resolution + ' × ' + resolution + ' = ' + totalPixels;
    statDepth.textContent = depth + ' bits';

    if (bytes >= 1024) {
      statSize.textContent = (bytes / 1024).toFixed(1) + ' KB';
    } else {
      statSize.textContent = bytes + ' B';
    }
  }

  SimulationEngine.debounceResize(drawGrid);

  engine.reset();
})();
