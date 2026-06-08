import { H as Hls } from './hls-dru42stk.js';

const menuButton = document.querySelector('[data-menu-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
        mobilePanel.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(current + 1), 5600);
    }
}

const filterInput = document.querySelector('[data-filter-input]');
const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));
const cards = Array.from(document.querySelectorAll('[data-card]'));
const emptyState = document.querySelector('[data-empty-state]');

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const applyFilters = () => {
    if (!cards.length) {
        return;
    }

    const term = normalize(filterInput ? filterInput.value : '');
    const activeButton = filterButtons.find((button) => button.classList.contains('is-active'));
    const activeType = activeButton ? activeButton.dataset.filterButton : 'all';
    let visibleCount = 0;

    cards.forEach((card) => {
        const searchable = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
        ].join(' '));
        const typeText = normalize(card.dataset.type);
        const genreText = normalize(card.dataset.genre);
        const matchesTerm = !term || searchable.includes(term);
        const matchesType = activeType === 'all' || typeText.includes(activeType) || genreText.includes(activeType);
        const shouldShow = matchesTerm && matchesType;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
            visibleCount += 1;
        }
    });

    if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
};

if (filterInput) {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) {
        filterInput.value = query;
    }
    filterInput.addEventListener('input', applyFilters);
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        applyFilters();
    });
});

applyFilters();

const video = document.querySelector('[data-video-player]');
const playButton = document.querySelector('[data-play-button]');
const cover = document.querySelector('[data-video-cover]');

if (video) {
    const source = video.querySelector('source');
    const streamUrl = source ? source.getAttribute('src') : video.getAttribute('src');

    if (streamUrl && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
    } else if (streamUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
    }

    const startPlayback = async () => {
        if (cover) {
            cover.classList.add('is-hidden');
        }
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    };

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', () => {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });
}
