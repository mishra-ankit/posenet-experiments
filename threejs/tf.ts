// import {} from "@mediapipe/camera_utils";
// import {} from "@mediapipe/control_utils";
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils";
import {POSE_CONNECTIONS, Pose} from "@mediapipe/pose";

const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

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

async function initPoseNet() {
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },

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
  await pose.initialize();
  return pose;
}

// get video file from user and extract frames from video
function loadVideo(poseNet: Pose) {
  poseNet.reset();
  const videoFile = document.getElementById('videoFile').files[0];
  const reader = new FileReader();
  reader.readAsDataURL(videoFile);
  reader.onload = function () {
    videoElement.src = reader.result;

    async function loop() {
      await poseNet.send({ image: videoElement });
      requestAnimationFrame(() => loop());
    }

    // play video when ready
    videoElement.oncanplay = (async () => {
      await videoElement.play();
      loop();
    });
  };
}

async function init() {
  const poseNet = await initPoseNet();
  console.log('PoseNet initialized');
  // show loading message
  document.getElementById('loading-indicator').style.display = 'none';
  document.getElementById('content').style.display = '';

  document.getElementById('videoFile').addEventListener('change', loadVideo.bind(null, poseNet));
}


init();