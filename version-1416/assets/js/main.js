(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.hasAttribute("hidden");
        if (open) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function showHero(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showHero(index + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showHero(0);
      restartHero();
      if (prev) {
        prev.addEventListener("click", function () {
          showHero(index - 1);
          restartHero();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showHero(index + 1);
          restartHero();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showHero(dotIndex);
          restartHero();
        });
      });
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var keyword = filterRoot.querySelector("[data-filter-keyword]");
      var year = filterRoot.querySelector("[data-filter-year]");
      var region = filterRoot.querySelector("[data-filter-region]");
      var type = filterRoot.querySelector("[data-filter-type]");
      var reset = filterRoot.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
      var empty = document.querySelector(".no-result");

      function valueOf(control) {
        return control ? String(control.value || "").trim().toLowerCase() : "";
      }

      function applyFilter() {
        var keywordValue = valueOf(keyword);
        var yearValue = valueOf(year);
        var regionValue = valueOf(region);
        var typeValue = valueOf(type);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var match = true;

          if (keywordValue && text.indexOf(keywordValue) === -1) {
            match = false;
          }
          if (yearValue && yearValue !== "all" && card.getAttribute("data-year") !== yearValue) {
            match = false;
          }
          if (regionValue && regionValue !== "all" && card.getAttribute("data-region") !== regionValue) {
            match = false;
          }
          if (typeValue && typeValue !== "all" && card.getAttribute("data-type") !== typeValue) {
            match = false;
          }

          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [keyword, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (keyword) {
            keyword.value = "";
          }
          [year, region, type].forEach(function (control) {
            if (control) {
              control.value = "all";
            }
          });
          applyFilter();
        });
      }
    }
  });
})();
