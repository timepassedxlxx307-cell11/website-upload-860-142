(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('.hero-slide', root);
        var dots = qsa('[data-hero-dot]', root);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prevButton = qs('[data-hero-prev]', root);
        var nextButton = qs('[data-hero-next]', root);
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !normalize(input.value)) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function setupFilters() {
        var panel = qs('[data-filter-panel]');
        var grid = qs('[data-filterable]');
        if (!panel || !grid) {
            return;
        }
        var keyword = qs('input[name="keyword"]', panel);
        var year = qs('select[name="year"]', panel);
        var type = qs('select[name="type"]', panel);
        var cards = qsa('.movie-card', grid);
        var empty = qs('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (grid.hasAttribute('data-use-query') && initial && keyword) {
            keyword.value = initial;
        }

        function apply() {
            var q = normalize(keyword && keyword.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var matchKeyword = !q || haystack.indexOf(q) !== -1;
                var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
                var matchType = !t || normalize(card.getAttribute('data-type')) === t;
                var match = matchKeyword && matchYear && matchType;
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            panel.addEventListener(eventName, apply);
        });
        panel.addEventListener('reset', function () {
            window.setTimeout(apply, 0);
        });
        apply();
    }

    function prepareVideo(video, streamUrl) {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = streamUrl;
    }

    window.initMoviePlayer = function (videoId, streamUrl) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var shell = video.closest('.player-shell');
        var cover = shell ? qs('[data-player-target="' + videoId + '"]', shell) : null;

        function start() {
            prepareVideo(video, streamUrl);
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
