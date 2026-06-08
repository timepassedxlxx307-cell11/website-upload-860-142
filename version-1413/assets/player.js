(function () {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('play-overlay');
  if (!video || !overlay) {
    return;
  }

  var playlist = video.getAttribute('data-playlist');
  var attached = false;

  function attachMedia() {
    if (attached || !playlist) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playlist;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(playlist);
      hls.attachMedia(video);
    } else {
      video.src = playlist;
    }
  }

  function start() {
    attachMedia();
    overlay.classList.add('is-hidden');
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
})();
