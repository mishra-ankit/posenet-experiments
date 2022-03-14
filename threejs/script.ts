// @ts-typechecked
import { POSE_CONNECTIONS, Results } from '@mediapipe/pose';
import Stats from 'stats-js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {
  BONES,
  BONE_MAPPING,
  Detector,
  getBoneAngle,
  transform,
} from './lib/Detector';

import { GUI } from 'dat.gui';

const scene = new THREE.Scene();
const spheres = [];

// render the vector ith arrow helper
const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(),
  new THREE.Vector3(),
  0.1,
  0x00ff00
);
scene.add(arrowHelper);

for (let i = 0; i < POSE_CONNECTIONS.length; i++) {
  const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  spheres.push(sphere);
}

const boneArr = [
  // {
  //   detectorBone: BONES.rightForeArm,
  //   sign: 1,
  //   // offset: THREE.Math.degToRad(180),
  // },
  // { detectorBone: BONES.leftForeArm, sign: 1, offset: THREE.Math.degToRad(180) },
  { detectorBone: BONES.leftArm, sign: 1 },
  { detectorBone: BONES.rightArm, sign: 1, offset: Math.PI },
  // { detectorBone: BONES.rightLeg, sign: 1, offset: -window.rad(90) },
  // { detectorBone: BONES.rightUpLeg, sign: -1, offset: -window.rad(90) },
];

function boneLookAtLocal(bone: THREE.Bone, position: THREE.Vector3) {
  bone.updateMatrixWorld();
  const direction = position.clone().normalize();
}

function boneLookAtWorld(bone, v) {
  const parent = bone.parent;
  scene.attach(bone);
  boneLookAtLocal(bone, v);
  parent.attach(bone);
}

function handleResults(results: any) {
  if (!results.poseLandmarks) return;
  if (!window.getBone) return;
  // console.log(results);

  // const { x, y, z } = transform(
  //   results.poseWorldLandmarks[Detector.POSE_LANDMARKS.RIGHT_ELBOW]
  // );
  // const bone = window.getBone('RightArm') as THREE.Bone;
  // console.log(x,y,z);
  // bone.lookAt(x * 10, y * 10, z * 10);
  // boneLookAtWorld(bone, new THREE.Vector3(x, y, z));

  boneArr.forEach(({ detectorBone, sign, offset }) => {
    const [startIndex, endIndex] = BONE_MAPPING[detectorBone];
    const [start, end] = [
      results.poseWorldLandmarks[startIndex],
      results.poseWorldLandmarks[endIndex],
    ];
    const { angle1, angle2 } = getBoneAngle(
      detectorBone,
      results.poseTransformed
    );
    const adjustedAngle = (sign ?? 1) * (angle1 + (offset ?? 0));
    const bone = window.getBone(detectorBone) as THREE.Bone;

    // get Vector from 2 points
    // const v1 = new THREE.Vector3(start.x, start.y, start.z);
    // const v2 = new THREE.Vector3(end.x, end.y, end.z);
    // const v = v2.clone().sub(v1) as THREE.Vector3;
    // arrowHelper.setDirection(v);
    // arrowHelper.setLength(20);

    // boneLookAtWorld(bone, v);

    // bone.rotation.z = adjustedAngle;
    // console.log(angle2)
    // change eular order
    // THREE.Euler.DefaultOrder = 'XYZ';
    // Math.PI + angle2
    // bone.setRotationFromEuler(new THREE.Euler(0, 0, adjustedAngle));
    // bone.rotation.set(0, 0, adjustedAngle);
    // const position = new THREE.Vector3();
    // const quaternion = new THREE.Quaternion();
    // const scale = new THREE.Vector3();
    // bone.rotateOnWorldAxis(new THREE.Vector3(0, 0, 0), adjustedAngle);
    // bone.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), adjustedAngle);
    // const m = bone.matrixWorld.extractRotation(bone.parent.matrixWorld);
    // bone.setRotationFromMatrix(m);
    // bone.matrixWorld.decompose( position, quaternion, scale );
    // bone.lookAt(new THREE.Vector3(5, 5, 5));
    bone.rotation.z = adjustedAngle;
    // bone.rotation.x = angle2;
    // console.log(detectorBone, adjustedAngle);
    // convert radians to degrees
  });

  results.poseWorldLandmarks.forEach((val, boneIndex) => {
    const sphere = spheres[boneIndex];
    const { x, y, z, visibility } = transform(val);
    // draw a sphere at left elbow
    // const scale = 1;
    // const offset = 2;
    // draw a sphere at the position of the left elbow
    // const leftElbow = new THREE.Vector3(
    //   ((x - 0.6) * scale),
    //   ((1 - y) * scale) + offset,
    //   (z * scale)
    // );

    // const pos = new THREE.Vector3(x, y * scale, z);

    // console.log({ x, y, z });

    // boneLookAtWorld(window.getBone('LeftForeArm'), leftElbow);
    if (visibility > 0.5) {
      sphere.position.set(x, y, z);
    } else {
      sphere.position.set(0, 0, 0);
    }
  });
}

async function initDetection() {
  const detector = new Detector();
  await detector.init(handleResults);
  const videoElement = document.getElementById('video') as HTMLVideoElement;

  cameraInputToVideo(videoElement);

  videoElement.addEventListener('loadeddata', () => {
    loop();
  });

  async function loop() {
    await detector.send({ image: videoElement });
    requestAnimationFrame(() => loop());
  }
}

function cameraInputToVideo(video: HTMLVideoElement) {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function () {
        console.log('Something went wrong!');
      });
  }
}

initDetection();

scene.add(new THREE.AxesHelper(5));

const light = new THREE.PointLight();
light.position.set(0.8, 1.4, 1.0);
scene.add(light);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, -7);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const fbxLoader = new FBXLoader();
const remy = new URL('../models/remy.fbx', import.meta.url);
fbxLoader.load(
  remy.href,
  (object) => {
    const modelScale = 0.015;
    object.scale.set(modelScale, modelScale, modelScale);
    scene.add(object);

    // skeleton helper
    const skeletonHelper = new THREE.SkeletonHelper(object);
    skeletonHelper.material.linewidth = 3;
    skeletonHelper.visible = true;
    scene.add(skeletonHelper);

    const bones = skeletonHelper.bones;
    window.bones = bones;

    // show infinite grid
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);

    const NECK_BONE_ROOT_NAME = 'Neck';
    const commonBonePrefix = bones
      .filter((i) => i.name.endsWith(NECK_BONE_ROOT_NAME))[0]
      .name.replace(NECK_BONE_ROOT_NAME, '');
    window.getBone = (name): THREE.Bone =>
      object.getObjectByName(`${commonBonePrefix}${name}`);
    const allBoneNames = bones.map((i, index) =>
      i.name.replace(commonBonePrefix, '')
    );
    // console.log({ commonBonePrefix, allBones });

    // window.rightArm = window.getBone('RightForeArm');

    // add GUI to control bone position
    createGUI(scene, allBoneNames);
  },
  (xhr) => {
    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error);
  }
);

window.addEventListener('resize', onWindowResize, false);

function createGUI(scene, bonesNames) {
  const gui = new GUI();
  bonesNames.forEach((entry, index) => {
    const i = entry;
    const folder = gui.addFolder(i + index);
    // console.log(i);
    const bone = window.getBone(i) as THREE.Bone;
    // console.log(bone);
    folder.add(bone.rotation, 'x', -Math.PI, Math.PI);
    folder.add(bone.rotation, 'y', -Math.PI, Math.PI);
    folder.add(bone.rotation, 'z', -Math.PI, Math.PI);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
