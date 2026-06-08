(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getQueryValue(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      button.textContent = panel.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupSearchForms() {
    selectAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    selectAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var category = root.querySelector("[data-filter-category]");
      var type = root.querySelector("[data-filter-type]");
      var year = root.querySelector("[data-filter-year]");
      var list = document.querySelector("[data-list]");
      var cards = list ? selectAll("[data-card]", list) : [];
      var initial = getQueryValue("q");

      if (input && initial) {
        input.value = initial;
      }

      function apply() {
        var text = normalize(input ? input.value : "");
        var selectedCategory = category ? normalize(category.value) : "";
        var selectedType = type ? normalize(type.value) : "";
        var selectedYear = year ? normalize(year.value) : "";

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var visible = true;

          if (text && haystack.indexOf(text) === -1) {
            visible = false;
          }
          if (selectedCategory && selectedCategory !== cardCategory) {
            visible = false;
          }
          if (selectedType && selectedType !== cardType) {
            visible = false;
          }
          if (selectedYear && selectedYear !== cardYear) {
            visible = false;
          }

          card.classList.toggle("hidden-by-filter", !visible);
        });
      }

      [input, category, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function createPlayer(container, source) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-play-button]");
    var state = container.querySelector("[data-player-state]");
    var hls = null;
    var ready = false;
    var waitingPlay = false;

    function showState(message) {
      if (!state) {
        return;
      }
      state.textContent = message;
      state.classList.add("show");
      window.setTimeout(function () {
        state.classList.remove("show");
      }, 2600);
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (waitingPlay && video.paused) {
            video.play().catch(function () {
              showState("点击视频后继续播放");
            });
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            showState("视频加载中，请稍候");
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            showState("正在恢复播放");
            return;
          }
          showState("视频暂时无法播放，请稍后重试");
        });
        return;
      }

      showState("视频暂时无法播放，请稍后重试");
    }

    function play() {
      prepare();
      waitingPlay = true;
      video.play().then(function () {
        container.classList.add("is-playing");
      }).catch(function () {
        showState("点击视频后继续播放");
      });
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
      container.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      container.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
      container.classList.remove("is-playing");
      waitingPlay = false;
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.StaticMoviePlayer = {
    init: function (id, source) {
      var container = document.getElementById(id);
      if (container && source) {
        createPlayer(container, source);
      }
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
