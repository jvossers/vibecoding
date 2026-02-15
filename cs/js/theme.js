/**
 * theme.js — Dark mode toggle.
 *
 * Reads preference from localStorage, creates a toggle button in the header.
 * A small inline <script> in each page's <head> sets the initial attribute
 * to prevent FOUC — this file just handles the toggle interaction.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'gcse-cs-theme';

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateIcon();
    window.dispatchEvent(new CustomEvent('themechange'));
  }

  function updateIcon() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '\u2600' : '\u263E';  // sun / moon
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', btn.title);
  }

  // Create toggle button in header
  var header = document.querySelector('.site-header .container');
  if (header) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    header.appendChild(btn);

    btn.addEventListener('click', function () {
      var next = getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });

    updateIcon();
  }
})();
