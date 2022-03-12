const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const pose = initPoseNet();

function onResults(results) {
  if (!results.poseLandmarks) {
    return;
  }

  // console.log(results.poseLandmarks);

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00FF00';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
    { color: '#00FF00', lineWidth: 4 });
  drawLandmarks(canvasCtx, results.poseLandmarks,
    { color: '#FF0000', lineWidth: 2 });
  canvasCtx.restore();
}

function initPoseNet() {
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });
  pose.setOptions({
    modelComplexity: 1,
    // selfieMode: true,
    // smoothLandmarks: true,
    enableSegmentation: false,
    // minDetectionConfidence: 0.5,
    // minTrackingConfidence: 0.5
  });
  pose.onResults(onResults);
  // pose.send({ image: videoElement }); // to initialize loading

  return pose;
}

// get video file from user and extract frames from video
function loadVideo() {
  const videoFile = document.getElementById('videoFile').files[0];
  const reader = new FileReader();
  reader.readAsDataURL(videoFile);
  reader.onload = function () {
    videoElement.src = reader.result;

    async function loop() {
      await pose.send({ image: videoElement });
      requestAnimationFrame(() => loop());
    }

    loop(pose);

    // play video when ready
    videoElement.oncanplay = () => {
      videoElement.play();
    };
  };
}

document.getElementById('videoFile').addEventListener('change', loadVideo);

// init();