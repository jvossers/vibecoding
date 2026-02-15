/**
 * nav.js — Landing-page topic browser & simulation-page breadcrumbs.
 *
 * On the landing page: renders TopicsData into a filterable card grid.
 * On a simulation page: reads data-topic-ref / data-sim-slug from <body>
 * and renders a breadcrumb trail into #breadcrumb.
 */
(function () {
  'use strict';

  var data = window.TopicsData;
  if (!data) return;

  var isSimPage = document.body.hasAttribute('data-topic-ref');

  /* ── Simulation page: breadcrumb ───────────────────────────────── */
  if (isSimPage) {
    var topicRef = document.body.getAttribute('data-topic-ref');
    var simSlug  = document.body.getAttribute('data-sim-slug');
    var breadcrumbEl = document.getElementById('breadcrumb');
    if (!breadcrumbEl) return;

    // Walk the topic tree to find section + topic + simulation
    var crumbs = [{ label: 'Home', href: '../../index.html' }];

    for (var s = 0; s < data.length; s++) {
      var section = data[s];
      for (var t = 0; t < section.topics.length; t++) {
        var topic = section.topics[t];
        if (topic.ref === topicRef) {
          var paperLabel = 'Paper ' + section.paper;
          crumbs.push({ label: paperLabel });
          crumbs.push({ label: section.ref + ' ' + section.title });
          crumbs.push({ label: topic.ref + ' ' + topic.title });

          // Find the simulation name
          for (var si = 0; si < topic.simulations.length; si++) {
            if (topic.simulations[si].slug === simSlug) {
              crumbs.push({ label: topic.simulations[si].name });
              break;
            }
          }
          break;
        }
      }
    }

    var ol = document.createElement('ol');
    ol.className = 'breadcrumb';
    crumbs.forEach(function (c) {
      var li = document.createElement('li');
      if (c.href) {
        var a = document.createElement('a');
        a.href = c.href;
        a.textContent = c.label;
        li.appendChild(a);
      } else {
        li.textContent = c.label;
      }
      ol.appendChild(li);
    });
    breadcrumbEl.appendChild(ol);
    return;
  }

  /* ── Landing page: topic browser ───────────────────────────────── */
  var container  = document.getElementById('topic-container');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var searchInput = document.querySelector('.search-input');
  if (!container) return;

  var currentFilter = 'all';
  var searchTerm = '';

  function renderTopics() {
    container.innerHTML = '';

    data.forEach(function (section) {
      // Filter by paper
      if (currentFilter === '1' && section.paper !== 1) return;
      if (currentFilter === '2' && section.paper !== 2) return;

      var matchingTopics = section.topics.filter(function (topic) {
        // Interactive-only filter
        if (currentFilter === 'interactive' && topic.simulations.length === 0) return false;

        // Search filter
        if (searchTerm) {
          var hay = (topic.ref + ' ' + topic.title + ' ' + topic.subtopics.join(' ')).toLowerCase();
          if (hay.indexOf(searchTerm) === -1) return false;
        }
        return true;
      });

      if (matchingTopics.length === 0) return;

      // Section heading
      var heading = document.createElement('h2');
      heading.className = 'section-heading';
      var paperSpan = document.createElement('span');
      paperSpan.className = 'paper-label';
      paperSpan.setAttribute('data-paper', section.paper);
      paperSpan.textContent = 'P' + section.paper;
      heading.appendChild(paperSpan);
      heading.appendChild(document.createTextNode(section.ref + ' ' + section.title));
      container.appendChild(heading);

      // Card grid
      var grid = document.createElement('div');
      grid.className = 'card-grid';

      matchingTopics.forEach(function (topic) {
        var card = document.createElement('div');
        card.className = 'topic-card';

        // Header row: ref badge + title
        var header = document.createElement('div');
        header.className = 'card-header';
        var badge = document.createElement('span');
        badge.className = 'ref-badge';
        badge.textContent = topic.ref;
        var title = document.createElement('span');
        title.className = 'card-title';
        title.textContent = topic.title;
        header.appendChild(badge);
        header.appendChild(title);
        card.appendChild(header);

        // Subtopics
        var sub = document.createElement('p');
        sub.className = 'subtopics';
        sub.textContent = topic.subtopics.join(' · ');
        card.appendChild(sub);

        // Badges & sim links
        if (topic.simulations.length > 0) {
          var badges = document.createElement('div');
          badges.className = 'card-badges';

          var interBadge = document.createElement('span');
          interBadge.className = 'badge-interactive';
          interBadge.textContent = '✦ Interactive';
          badges.appendChild(interBadge);
          card.appendChild(badges);

          topic.simulations.forEach(function (sim) {
            var link = document.createElement('a');
            link.className = 'sim-link';
            link.href = 'simulations/' + sim.slug + '/index.html';
            link.textContent = '→ ' + sim.name;
            card.appendChild(link);
          });
        }

        grid.appendChild(card);
      });

      container.appendChild(grid);
    });
  }

  // Filter buttons
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderTopics();
    });
  });

  // Debounced search
  var debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderTopics();
      }, 200);
    });
  }

  renderTopics();
})();
