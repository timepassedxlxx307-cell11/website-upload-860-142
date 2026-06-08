(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initNavigation() {
    var button = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-target"));
      if (!scope) {
        return;
      }
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-item]"));
      var type = panel.querySelector("[data-filter='type']");
      var year = panel.querySelector("[data-filter='year']");
      var keyword = panel.querySelector("[data-filter='keyword']");
      var reset = panel.querySelector("[data-filter-reset]");

      function apply() {
        var typeValue = type ? type.value : "all";
        var yearValue = year ? year.value : "all";
        var keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
        items.forEach(function (item) {
          var itemType = item.getAttribute("data-type") || "";
          var itemYear = item.getAttribute("data-year") || "";
          var search = (item.getAttribute("data-search") || "").toLowerCase();
          var visible = true;
          if (typeValue !== "all" && itemType !== typeValue) {
            visible = false;
          }
          if (yearValue !== "all" && itemYear !== yearValue) {
            visible = false;
          }
          if (keywordValue && search.indexOf(keywordValue) === -1) {
            visible = false;
          }
          item.style.display = visible ? "" : "none";
        });
      }

      [type, year, keyword].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (type) {
            type.value = "all";
          }
          if (year) {
            year.value = "all";
          }
          if (keyword) {
            keyword.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  function cardHtml(movie) {
    var title = escapeHtml(movie.title);
    var meta = escapeHtml(movie.category + " · " + movie.region);
    var search = escapeHtml([movie.title, movie.region, movie.genre, movie.tags].join(" "));
    return "<a class=\"movie-card\" href=\"./" + escapeHtml(movie.url) + "\" data-item data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-search=\"" + search + "\">" +
      "<span class=\"movie-poster\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + title + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"movie-year\">" + escapeHtml(movie.year) + "</span><span class=\"play-mark\">▶</span></span>" +
      "<span class=\"movie-title line-clamp-2\">" + title + "</span><span class=\"movie-meta\">" + meta + "</span></a>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-empty-result]");
    if (!form || !input || !results || typeof MOVIES_INDEX === "undefined") {
      return;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var matched = MOVIES_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(cardHtml).join("");
      if (empty) {
        empty.style.display = matched.length ? "none" : "block";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener("input", render);
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      input.value = q;
    }
    render();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    if (!video || !cover || !source) {
      return;
    }
    var attached = false;
    var hlsPlayer = null;

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(source);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsPlayer.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsPlayer.recoverMediaError();
          } else {
            cover.classList.remove("is-hidden");
            cover.querySelector("span:last-child").textContent = "重新播放";
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        cover.querySelector("span:last-child").textContent = "视频暂时无法播放";
      }
    }

    function playVideo() {
      attachSource();
      video.controls = true;
      cover.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
