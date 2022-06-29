import {
  Bone,
  CylinderGeometry,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import {
  BONES,
  BONE_MAPPING,
  Detector,
  getBoneAngle,
  transform,
} from './lib/Detector';

const boneArr = [
  // {
  //   detectorBone: BONES.rightForeArm,
  //   sign: 1,
  //   // offset: Math.degToRad(180),
  // },
  //   { detectorBone: BONES.leftForeArm, sign: 1, offset: MathUtils.degToRad(0) },
  { detectorBone: BONES.leftArm, sign: 1 },
  // { detectorBone: BONES.rightArm, sign: 1, offset: Math.PI },
  // { detectorBone: BONES.rightLeg, sign: 1, offset: -window.rad(90) },
  // { detectorBone: BONES.rightUpLeg, sign: 1, offset: Math.degToRad(90) },
  // { detectorBone: BONES.leftUpLeg, sign: 1, offset: Math.degToRad(90) },
  // { detectorBone: BONES.head, offset: Math.degToRad(180) },
];

const cylinderMesh = function (pointX, pointY) {
  const material = new MeshBasicMaterial({ color: 0x5b5b5b });
  // Make the geometry (of "direction" length)
  const geometry = new CylinderGeometry(0.04, 0.04, 1, 6, 4, true);
  // Make a mesh with the geometry
  const mesh = new Mesh(geometry, material);
  // Position it where we want
  mesh.position.copy(pointX);
  // And make it point to where we want
  mesh.lookAt(pointY);
  return mesh;
};

const meshes = [];

export function handleResults(results: any, getBone, spheres, scene) {
  if (!results.poseLandmarks) return;
  Detector.POSE_CONNECTIONS.forEach((connection, index) => {
    const [startIndex, endIndex] = connection;
    const [start, end] = [
      results.poseTransformed[startIndex],
      results.poseTransformed[endIndex],
    ];

    const vStart = new Vector3(start.x, start.y, start.z);
    const vEnd = new Vector3(end.x, end.y, end.z);
    // const direction = new Vector3().subVectors(vEnd, vStart);
    let mesh = meshes[index];
    if (!mesh) {
      mesh = cylinderMesh(vStart, vEnd);
      meshes.push(mesh);
      scene.add(mesh);
    }
    mesh.position.copy(vStart);
    mesh.lookAt(vEnd);
  });

  //   boneArr.forEach(({ detectorBone, sign, offset }, index) => {
  //     const bone = getBone(detectorBone) as Bone;

  //     const [startIndex, endIndex] = BONE_MAPPING[detectorBone];
  //     const [start, end] = [
  //       results.poseTransformed[startIndex],
  //       results.poseTransformed[endIndex],
  //     ];
  //   });

  //   results.poseWorldLandmarks.forEach((val, boneIndex) => {
  //     const sphere = spheres[boneIndex];
  //     const { x, y, z, visibility } = transform(val);
  //     if (visibility > 0.5) {
  //       sphere.position.set(x, y, z);
  //     } else {
  //       sphere.position.set(0, 0, 0);
  //     }
  //   });
}

function setBoneRotation(bone, ang) {
  bone.rotation.order = 'YZX';
  bone.rotation.z = ang.z;
  //   bone.rotation.y = ang.y;
  //   bone.rotation.x = ang.x;
}
