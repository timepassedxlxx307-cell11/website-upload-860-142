(function () {
  var forms = document.querySelectorAll('.site-search-form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  if (filterInput) {
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-term]'));

    function applyFilter(value) {
      var query = String(value || '').trim().toLowerCase();
      filterCards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('filtered-out', Boolean(query) && text.indexOf(query) === -1);
      });
    }

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterInput.value = button.getAttribute('data-filter-term') || '';
        applyFilter(filterInput.value);
      });
    });
  }

  var libraryGrid = document.querySelector('[data-library-grid]');
  var loadMore = document.querySelector('[data-load-more]');
  if (libraryGrid && loadMore) {
    var libraryCards = Array.prototype.slice.call(libraryGrid.querySelectorAll('.library-card'));
    var visible = 80;

    function updateLibrary() {
      libraryCards.forEach(function (card, i) {
        card.classList.toggle('is-collapsed', i >= visible);
      });
      if (visible >= libraryCards.length) {
        loadMore.style.display = 'none';
      }
    }

    loadMore.addEventListener('click', function () {
      visible += 80;
      updateLibrary();
    });

    updateLibrary();
  }

  var searchGrid = document.querySelector('[data-search-grid]');
  if (searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var pageInput = document.querySelector('[data-search-page-input]');
    var status = document.querySelector('[data-search-status]');
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));

    if (pageInput) {
      pageInput.value = query;
    }

    function renderSearch(value) {
      var q = String(value || '').trim().toLowerCase();
      var hits = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = q && text.indexOf(q) !== -1;
        card.classList.toggle('search-card-hidden', !matched);
        if (matched) {
          hits += 1;
        }
      });
      if (status) {
        status.textContent = q ? '搜索到 ' + hits + ' 个匹配结果' : '输入关键词即可浏览匹配内容';
      }
    }

    renderSearch(query);
  }
})();
