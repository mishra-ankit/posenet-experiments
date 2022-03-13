// import {} from "@mediapipe/camera_utils";
// import {} from "@mediapipe/control_utils";
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS, Pose } from '@mediapipe/pose';

class Canvas {
  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // set canvas dimensions
  public setDimensions(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public update(results: any) {
    const canvasElement = this.canvas;
    const canvasCtx = this.ctx;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
    });
    canvasCtx.restore();
  }
}

const canvas = new Canvas();

window.result = [];

function onResults(results) {
  if (!results.poseLandmarks) {
    return;
  }

  window.result.push(results);
  canvas.update(results);

  // console.log(results.poseLandmarks);
}

async function initPoseNet(onResults) {
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
  const videoElement = document.createElement('video');
  poseNet.reset();
  window.result = [];
  const videoFile = document.getElementById('videoFile').files[0];
  const reader = new FileReader();
  reader.readAsDataURL(videoFile);
  reader.onload = function () {
    videoElement.src = reader.result;

    async function loop() {
      // get height and width of video
      const videoHeight = videoElement.videoHeight;
      const videoWidth = videoElement.videoWidth;

      // console.log(videoHeight, videoWidth);

      // set canvas dimensions
      canvas.setDimensions(videoWidth, videoHeight);
      // add canvas to dom
      document.body.appendChild(canvas.canvas);

      await poseNet.send({ image: videoElement });
      requestAnimationFrame(() => loop());
    }

    // play video when ready
    videoElement.oncanplay = async () => {
      await videoElement.play();
      loop();
    };
  };
}

async function init() {
  const poseNet = await initPoseNet(onResults);
  console.log('PoseNet initialized');
  // show loading message
  document.getElementById('loading-indicator').style.display = 'none';
  document.getElementById('content').style.display = '';

  document
    .getElementById('videoFile')
    .addEventListener('change', loadVideo.bind(null, poseNet));
}

init();
