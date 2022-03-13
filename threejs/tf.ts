// import {} from "@mediapipe/camera_utils";
// import {} from "@mediapipe/control_utils";
import { Detector } from './lib/Detector';

// get video file from user and extract frames from video
function loadVideo(detector: Detector) {
  const videoElement = document.createElement('video');
  const videoFile = document.getElementById('videoFile').files[0];
  const reader = new FileReader();
  reader.readAsDataURL(videoFile);
  reader.onload = function () {
    detector.reset();
    const canvas = detector.canvas;
    videoElement.src = reader.result;

    async function loop() {
      // get height and width of video
      const videoHeight = videoElement.videoHeight;
      const videoWidth = videoElement.videoWidth;

      // set canvas dimensions
      canvas.setDimensions(videoWidth, videoHeight);
      // add canvas to dom
      document.body.appendChild(canvas.canvas);

      await detector.send({ image: videoElement });
      requestAnimationFrame(() => loop());
    }

    // play video when ready
    videoElement.oncanplay = async () => {
      await videoElement.play();
      loop();
    };
  };
}

async function init(detector: Detector) {
  await detector.init();
  // show loading message
  document.getElementById('loading-indicator').style.display = 'none';
  document.getElementById('content').style.display = '';

  document
    .getElementById('videoFile')
    .addEventListener('change', loadVideo.bind(null, detector));
}

const detector = new Detector();
init(detector);
