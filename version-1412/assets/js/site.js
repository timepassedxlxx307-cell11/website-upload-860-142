document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector(".nav-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var filterList = document.querySelector("[data-filter-list]");

  if (filterForm && filterList) {
    var input = filterForm.querySelector("input");
    var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
        card.style.display = haystack.indexOf(query) >= 0 ? "" : "none";
      });
    });
  }

  var results = document.getElementById("searchResults");
  var title = document.getElementById("searchTitle");
  var input = document.getElementById("searchPageInput");

  if (results && typeof MOVIE_INDEX !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (input) {
      input.value = query;
    }

    var items = MOVIE_INDEX.filter(function (item) {
      if (!query) {
        return true;
      }
      var haystack = [item.title, item.region, item.type, item.year, item.category, item.tags, item.oneLine].join(" ").toLowerCase();
      return haystack.indexOf(query.toLowerCase()) >= 0;
    }).slice(0, 96);

    if (title) {
      title.textContent = query ? "与“" + query + "”相关的内容" : "推荐内容";
    }

    results.innerHTML = items.map(function (item) {
      return [
        "<article class=\"movie-card\">",
        "  <a class=\"movie-poster\" href=\"" + item.url + "\">",
        "    <img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
        "    <span class=\"score-badge\">" + item.score + "</span>",
        "  </a>",
        "  <div class=\"movie-card-body\">",
        "    <div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
        "    <h2><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h2>",
        "    <p>" + escapeHtml(item.oneLine) + "</p>",
        "    <div class=\"tag-row\"><span>" + escapeHtml(item.category) + "</span></div>",
        "  </div>",
        "</article>"
      ].join("\n");
    }).join("\n");
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
