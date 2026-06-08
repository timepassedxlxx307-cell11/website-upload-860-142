(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs("[data-menu-button]");
        var panel = qs("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        qsa("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input[name='q']", form);
                var value = input ? input.value.trim() : "";
                var target = "./search.html";

                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }

                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        var dotsWrap = qs("[data-hero-dots]");
        var slides = qsa("[data-hero-slide]");

        if (!hero || !dotsWrap || slides.length < 2) {
            return;
        }

        var index = 0;
        var timer = null;
        var dots = slides.map(function (_, dotIndex) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "切换推荐影片");
            dot.addEventListener("click", function () {
                setActive(dotIndex);
                startTimer();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function setActive(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setActive((index + 1) % slides.length);
            }, 5200);
        }

        setActive(0);
        startTimer();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyCardFilter(cards, query) {
        var q = normalize(query);

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            card.classList.toggle("is-hidden", q && text.indexOf(q) === -1);
        });
    }

    function setupLocalFilters() {
        qsa("[data-local-filter]").forEach(function (input) {
            var section = input.closest("section") || document;
            var cards = qsa("[data-card]", section);
            input.addEventListener("input", function () {
                applyCardFilter(cards, input.value);
            });
        });
    }

    function setupSearchPage() {
        var results = qs("[data-search-results]");

        if (!results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var panelInput = qs(".search-panel input[name='q']");
        var headerInputs = qsa("[data-search-form] input[name='q']");

        headerInputs.forEach(function (input) {
            input.value = query;
        });

        if (panelInput) {
            panelInput.value = query;
        }

        applyCardFilter(qsa("[data-card]", results), query);
    }

    function setupImages() {
        qsa("img.movie-image").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-empty");
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
        setupImages();
    });
}());
