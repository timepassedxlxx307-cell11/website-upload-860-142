document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".js-player[data-stream]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".play-gate");
    var streamUrl = player.getAttribute("data-stream");
    var hlsInstance = null;

    function attachVideo() {
      if (!video || !streamUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = streamUrl;
        }
      } else if (window.Hls && Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.src) {
        video.src = streamUrl;
      }
    }

    function startVideo() {
      attachVideo();
      player.classList.add("is-playing");
      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          player.classList.remove("is-playing");
        }
      });
    }
  });
});
