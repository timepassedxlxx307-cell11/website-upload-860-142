(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return String(params.get("q") || "").trim();
  }

  function createCard(movie) {
    var item = document.createElement("a");
    item.className = "movie-card";
    item.href = movie.url;
    item.setAttribute("data-title", movie.title);
    item.setAttribute("data-region", movie.region);
    item.setAttribute("data-type", movie.type);
    item.setAttribute("data-year", movie.year);
    item.setAttribute("data-genre", movie.genre);
    item.setAttribute("data-tags", (movie.tags || []).join(" "));

    item.innerHTML = "" +
      "<div class=\"poster-wrap\">" +
        "<img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\">" +
        "<div class=\"poster-mask\"><span>▶</span></div>" +
        "<b>" + movie.year + "</b>" +
      "</div>" +
      "<h3>" + movie.title + "</h3>" +
      "<p>" + movie.region + " · " + movie.type + "</p>";

    return item;
  }

  ready(function () {
    var grid = document.querySelector("[data-search-grid]");
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var year = document.querySelector("[data-search-year]");
    var status = document.querySelector("[data-search-status]");

    if (!grid || !window.MOVIE_INDEX) {
      return;
    }

    var initial = getQuery();
    if (input) {
      input.value = initial;
    }

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function render() {
      var keyword = normalized(input && input.value);
      var categoryValue = category ? category.value : "all";
      var yearValue = year ? year.value : "all";
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (categoryValue !== "all" && movie.category !== categoryValue) {
          return false;
        }
        if (yearValue !== "all" && movie.year !== yearValue) {
          return false;
        }
        return true;
      }).slice(0, 96);

      grid.innerHTML = "";
      list.forEach(function (movie) {
        grid.appendChild(createCard(movie));
      });

      if (status) {
        if (keyword) {
          status.textContent = "关键词 “" + keyword + "” 的相关影片";
        } else {
          status.textContent = "输入关键词，快速查找影片标题、地区、类型和标签。";
        }
      }
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  });
})();
