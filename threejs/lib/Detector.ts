import 'regenerator-runtime/runtime';

import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import {
  InputMap,
  NormalizedLandmark,
  NormalizedLandmarkList,
  Pose,
  POSE_CONNECTIONS,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  Results,
} from '@mediapipe/pose';

export enum BONES {
  leftForeArm = 'LeftForeArm',
  rightForeArm = 'RightForeArm',
  rightArm = 'RightArm',
  leftArm = 'LeftArm',
  rightLeg = 'RightLeg',
  rightUpLeg = 'RightUpLeg',
  leftUpLeg = 'LeftUpLeg',
  head = 'Head',
}

export const BONE_MAPPING = {
  [BONES.leftForeArm]: [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [BONES.rightForeArm]: [
    POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.RIGHT_WRIST,
  ],
  [BONES.rightArm]: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [BONES.leftArm]: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [BONES.rightUpLeg]: [
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS_RIGHT.RIGHT_KNEE,
  ],
  [BONES.leftUpLeg]: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS_LEFT.LEFT_KNEE],
  [BONES.head]: [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.RIGHT_EYE],
};

// console.log(BONE_MAPPING);

export function transform(
  p: NormalizedLandmark,
  scale = 3
): NormalizedLandmark {
  return {
    ...p,
    x: p.x * scale,
    y: (-p.y + 1) * scale,
    z: -p.z * scale,
  };
}

// get angle between two 2d points
function getAngle(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx);
}

// get angle with x plane
function getAngleX(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  return Math.atan2(dz, dx);
}

export function getBoneAngle(boneName, keypoints: NormalizedLandmarkList) {
  const bone = BONE_MAPPING[boneName];
  const p1 = keypoints[bone[0]];
  const p2 = keypoints[bone[1]];
  if (!p1 || !p2) {
    return 0;
  }
  return {
    angle1: getAngle(p1, p2),
    angle2: getAngleX(p1, p2),
  };
}

export class Detector {
  static get POSE_LANDMARKS() {
    return POSE_LANDMARKS;
  }
  static get POSE_CONNECTIONS() {
    return POSE_CONNECTIONS;
  }
  canvas: Canvas;
  poseNet: Pose;

  constructor() {
    this.canvas = new Canvas();
  }

  async init(handleResults = (r: any) => null) {
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
    pose.onResults((results) => {
      this.onResults(results);
      if (results.poseLandmarks) {
        const poseTransformed = results.poseWorldLandmarks.map((i) =>
          transform(i)
        );
        handleResults({ ...results, poseTransformed });
      }
    });
    await pose.initialize();
    this.poseNet = pose;
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

  public show() {
    // set canvas style
    this.canvas.style.cssText = `
        position: absolute;
        top: 0;
        width: 300px;
        height: 200px;
        background: white;
        z-index: 1000 !important;`;
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
