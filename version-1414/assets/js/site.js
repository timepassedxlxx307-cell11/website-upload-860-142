(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      var frame = image.closest('.poster, .hero-poster, .detail-cover');
      if (frame) {
        frame.classList.add('image-missing');
      }
    });
  });

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        showHero(idx);
      });
    });

    window.setInterval(function () {
      showHero(active + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var regionValue = '';
    var yearValue = '';

    filterSelects.forEach(function (select) {
      if (select.getAttribute('data-filter-select') === 'region') {
        regionValue = select.value;
      }
      if (select.getAttribute('data-filter-select') === 'year') {
        yearValue = select.value;
      }
    });

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchRegion = !regionValue || (card.getAttribute('data-region') || '').indexOf(regionValue) !== -1;
      var matchYear = !yearValue || (card.getAttribute('data-year') || '') === yearValue;
      card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var buttons = player.querySelectorAll('[data-player-trigger]');
    var overlay = player.querySelector('.player-overlay');
    var hlsInstance = null;

    function activatePlayer() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (!video.getAttribute('data-ready')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          }
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }
      video.play().catch(function () {});
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', activatePlayer);
    });

    video.addEventListener('click', function () {
      if (!video.getAttribute('data-ready')) {
        activatePlayer();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });

  var results = document.querySelector('[data-search-results]');
  if (results && window.SiteCatalog) {
    var params = new URLSearchParams(window.location.search);
    var queryText = (params.get('q') || '').trim();
    var searchInput = document.querySelector('.search-page-form input[name="q"]');

    if (searchInput) {
      searchInput.value = queryText;
    }

    function movieCard(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card" data-card data-title="' + escapeHtml(item.title) + '" data-region="' + escapeHtml(item.region) + '" data-type="' + escapeHtml(item.type) + '" data-year="' + escapeHtml(item.year) + '" data-genre="' + escapeHtml(item.genre) + '" data-tags="' + escapeHtml((item.tags || []).join(',')) + '">' +
        '<a class="poster" href="' + item.link + '" style="--poster-image: url(\'' + item.cover + '\')">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '封面" loading="lazy">' +
        '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</div>' +
        '<h2><a href="' + item.link + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.line) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];
      });
    }

    function runSearch() {
      var q = queryText.toLowerCase();
      var matches = window.SiteCatalog.filter(function (item) {
        if (!q) {
          return true;
        }
        var haystack = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.line].join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(movieCard).join('');
    }

    runSearch();
  }
})();
