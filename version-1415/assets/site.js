(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags,
      card.textContent
    ].join(" ").toLowerCase();
  }

  function filterCards(root, value) {
    var cards = root.querySelectorAll("[data-card]");
    var term = (value || "").trim().toLowerCase();
    cards.forEach(function (card) {
      card.hidden = term !== "" && textOf(card).indexOf(term) === -1;
    });
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    };
    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        start();
      });
    });
    start();
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        var target = "./search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var section = input.closest("section") || document;
      var list = section.querySelector("[data-card-list]") || document;
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial && !input.value) {
        input.value = initial;
      }
      filterCards(list, input.value);
      input.addEventListener("input", function () {
        filterCards(list, input.value);
      });
      section.querySelectorAll("[data-filter-chip]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          section.querySelectorAll("[data-filter-chip]").forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          var value = chip.dataset.filterChip === "全部" ? "" : chip.dataset.filterChip;
          input.value = value;
          filterCards(list, value);
        });
      });
    });
  }

  window.initMoviePage = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playerStart");
    var message = document.getElementById("playerMessage");
    var player = null;
    var loaded = false;
    if (!video || !streamUrl) return;

    function showMessage(text) {
      if (!message) return;
      message.textContent = text;
      message.hidden = false;
    }

    function loadStream() {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
        player.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            player.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            player.recoverMediaError();
          } else {
            showMessage("视频暂时无法加载");
          }
        });
      } else {
        showMessage("视频暂时无法加载");
      }
    }

    function playVideo() {
      loadStream();
      if (button) button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (button) button.classList.remove("is-hidden");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      if (button) button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (button) button.classList.remove("is-hidden");
    });
    video.addEventListener("ended", function () {
      if (button) button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (player) player.destroy();
    });
  };

  ready(function () {
    setupHeader();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
