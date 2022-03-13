import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS, Pose, Results, InputMap } from '@mediapipe/pose';

export class Detector {
  canvas: Canvas;
  poseNet: Pose;

  constructor() {
    this.canvas = new Canvas();
  }

  async init() {
    this.poseNet = await this.initPoseNet();
    console.log('PoseNet initialized');
  }

  send(inputMap: InputMap) {
    this.poseNet.send(inputMap);
  }

  reset() {
    this.poseNet.reset();
  }

  onResults(results: Results) {
    if (!results.poseLandmarks) {
      return;
    }
    this.canvas.update(results);
  }

  private async initPoseNet() {
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
    pose.onResults((results) => this.onResults(results));
    await pose.initialize();
    return pose;
  }
}

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
