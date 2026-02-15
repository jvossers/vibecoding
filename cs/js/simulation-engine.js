/**
 * SimulationEngine — shared framework for all simulations.
 *
 * Usage (reactive sim — no animation loop):
 *   const engine = new SimulationEngine(controlsEl, { controls: { play: false, speed: false } });
 *   engine.onReset(() => { ... }).onRender(() => { ... });
 *   engine.render();
 *
 * Usage (animated sim — full controls):
 *   const engine = new SimulationEngine(controlsEl);
 *   engine
 *     .onReset(() => setupState())
 *     .onStep(() => { if (done) return false; advanceOneStep(); })
 *     .onRender(() => drawCanvas())
 *     .onStateChange(state => updateUI(state));
 *   engine.reset();
 */
(function () {
  'use strict';

  var SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4];
  var DEFAULT_INTERVAL = 500; // ms between steps at 1x

  function SimulationEngine(containerEl, opts) {
    opts = opts || {};
    var controlOpts = opts.controls || {};

    this._showPlay  = controlOpts.play  !== false;
    this._showSpeed = controlOpts.speed !== false;
    this._showStep  = controlOpts.step  !== false;

    this._onReset       = null;
    this._onStep        = null;
    this._onRender      = null;
    this._onStateChange = null;

    this._playing   = false;
    this._finished  = false;
    this._speed     = 1;
    this._lastTick  = 0;
    this._rafId     = null;
    this._els       = {};

    // Re-render when theme changes so canvases pick up new colours
    var self = this;
    window.addEventListener('themechange', function () { self.render(); });

    if (containerEl) {
      this._buildControls(containerEl);
    }
  }

  /* ── Theme-aware colours for canvas drawing ────────────────────── */
  SimulationEngine.themeColors = (function () {
    var cache = null;
    window.addEventListener('themechange', function () { cache = null; });
    return function () {
      if (!cache) {
        var s = getComputedStyle(document.documentElement);
        cache = {
          bg:          s.getPropertyValue('--clr-bg').trim(),
          surface:     s.getPropertyValue('--clr-surface').trim(),
          surfaceAlt:  s.getPropertyValue('--clr-surface-alt').trim(),
          border:      s.getPropertyValue('--clr-border').trim(),
          borderMuted: s.getPropertyValue('--clr-border-muted').trim(),
          text:        s.getPropertyValue('--clr-text').trim(),
          muted:       s.getPropertyValue('--clr-text-muted').trim(),
          primary:     s.getPropertyValue('--clr-primary').trim(),
          primaryFg:   s.getPropertyValue('--clr-primary-fg').trim(),
          primaryLight:s.getPropertyValue('--clr-primary-light').trim(),
          accent:      s.getPropertyValue('--clr-accent').trim(),
          highlight:   s.getPropertyValue('--clr-highlight').trim()
        };
      }
      return cache;
    };
  })();

  /* ── Fluent callback registration ────────────────────────────── */
  SimulationEngine.prototype.onReset = function (fn) { this._onReset = fn; return this; };
  SimulationEngine.prototype.onStep  = function (fn) { this._onStep  = fn; return this; };
  SimulationEngine.prototype.onRender = function (fn) { this._onRender = fn; return this; };
  SimulationEngine.prototype.onStateChange = function (fn) { this._onStateChange = fn; return this; };

  /* ── Public API ──────────────────────────────────────────────── */
  SimulationEngine.prototype.play = function () {
    if (this._finished) return;
    this._playing = true;
    this._lastTick = performance.now();
    this._updateButtons();
    this._emitState('playing');
    this._scheduleLoop();
  };

  SimulationEngine.prototype.pause = function () {
    this._playing = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    this._updateButtons();
    this._emitState('paused');
  };

  SimulationEngine.prototype.step = function () {
    if (this._finished) return;
    this.pause();
    this._doStep();
    this.render();
  };

  SimulationEngine.prototype.reset = function () {
    this.pause();
    this._finished = false;
    if (this._onReset) this._onReset();
    this._updateButtons();
    this.render();
    this._emitState('reset');
  };

  SimulationEngine.prototype.render = function () {
    if (this._onRender) this._onRender();
  };

  SimulationEngine.prototype.finish = function () {
    this._finished = true;
    this.pause();
    this._updateButtons();
    this._emitState('finished');
  };

  /* ── Internal ────────────────────────────────────────────────── */
  SimulationEngine.prototype._doStep = function () {
    if (this._onStep) {
      var cont = this._onStep();
      if (cont === false) {
        this.finish();
      }
    }
  };

  SimulationEngine.prototype._scheduleLoop = function () {
    var self = this;
    self._rafId = requestAnimationFrame(function tick(now) {
      if (!self._playing) return;
      var interval = DEFAULT_INTERVAL / self._speed;
      if (now - self._lastTick >= interval) {
        self._lastTick = now;
        self._doStep();
        self.render();
        if (self._finished) return;
      }
      self._rafId = requestAnimationFrame(tick);
    });
  };

  SimulationEngine.prototype._emitState = function (state) {
    if (this._onStateChange) this._onStateChange(state);
  };

  SimulationEngine.prototype._updateButtons = function () {
    var e = this._els;
    if (e.play)  e.play.style.display  = this._playing ? 'none' : '';
    if (e.pause) e.pause.style.display = this._playing ? '' : 'none';
    if (e.step)  e.step.disabled  = this._finished;
    if (e.play)  e.play.disabled  = this._finished;
  };

  /* ── Build control-bar DOM ───────────────────────────────────── */
  SimulationEngine.prototype._buildControls = function (container) {
    var self = this;
    var bar = document.createElement('div');
    bar.className = 'control-bar';

    function btn(label, title, cls) {
      var b = document.createElement('button');
      b.className = 'ctrl-btn' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.title = title;
      b.type = 'button';
      return b;
    }

    if (this._showPlay) {
      var playBtn  = btn('▶', 'Play');
      var pauseBtn = btn('⏸', 'Pause');
      pauseBtn.style.display = 'none';
      playBtn.addEventListener('click',  function () { self.play(); });
      pauseBtn.addEventListener('click', function () { self.pause(); });
      bar.appendChild(playBtn);
      bar.appendChild(pauseBtn);
      this._els.play  = playBtn;
      this._els.pause = pauseBtn;
    }

    if (this._showStep) {
      var stepBtn = btn('⏭', 'Step');
      stepBtn.addEventListener('click', function () { self.step(); });
      bar.appendChild(stepBtn);
      this._els.step = stepBtn;
    }

    // Reset always shown
    var resetBtn = btn('↺', 'Reset');
    resetBtn.addEventListener('click', function () { self.reset(); });
    bar.appendChild(resetBtn);
    this._els.reset = resetBtn;

    if (this._showSpeed) {
      var speedWrap = document.createElement('div');
      speedWrap.className = 'speed-control';
      var speedText = document.createElement('span');
      speedText.textContent = 'Speed';
      var slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 0;
      slider.max = SPEEDS.length - 1;
      slider.value = SPEEDS.indexOf(1);
      slider.setAttribute('aria-label', 'Playback speed');
      var valLabel = document.createElement('span');
      valLabel.className = 'speed-label';
      valLabel.textContent = '1×';

      slider.addEventListener('input', function () {
        self._speed = SPEEDS[+slider.value];
        valLabel.textContent = self._speed + '×';
      });

      speedWrap.appendChild(speedText);
      speedWrap.appendChild(slider);
      speedWrap.appendChild(valLabel);
      bar.appendChild(speedWrap);
    }

    container.appendChild(bar);
  };

  /* ── Shared utilities ────────────────────────────────────────────── */

  /** DPR-aware canvas resize. Returns { w, h } in CSS pixels. */
  SimulationEngine.resizeCanvas = function (canvas, minH, ratio, maxH) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.parentElement.clientWidth;
    var h = Math.max(minH, w * ratio);
    if (maxH) h = Math.min(maxH, h);
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  };

  /** Fisher-Yates shuffle (in-place). */
  SimulationEngine.fisherYates = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  };

  /** Debounced window-resize handler (100 ms). */
  SimulationEngine.debounceResize = function (fn) {
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(fn, 100);
    });
  };

  window.SimulationEngine = SimulationEngine;
})();
