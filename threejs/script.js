import Stats from 'https://unpkg.com/three@0.138.0/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://unpkg.com/three@0.138.0/examples/jsm/libs/lil-gui.module.min.js';
import * as FBXLoader from "https://unpkg.com/three@0.138.0/examples/js/loaders/FBXLoader.js"

const clock = new THREE.Clock();
const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.PointLight()
light.position.set(0.8, 1.4, 1.0)
scene.add(light)

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0.8, 1.4, 1.0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

//const material = new THREE.MeshNormalMaterial()

const fbxLoader = new THREE.FBXLoader()
fbxLoader.load(
  'remy.fbx',
  (object) => {
    object.scale.set(.01, .01, .01)
    scene.add(object)

    // skeleton helper
    const skeletonHelper = new THREE.SkeletonHelper(object);
    skeletonHelper.material.linewidth = 3;
    skeletonHelper.visible = true;
    scene.add(skeletonHelper);

    const bones = skeletonHelper.bones;
    window.bones = bones;

    const NECK_BONE_ROOT_NAME = 'Neck';
    const commonBonePrefix = bones.filter(i => i.name.endsWith(NECK_BONE_ROOT_NAME))[0].name.replace(NECK_BONE_ROOT_NAME, '');
    console.log({ commonBonePrefix });
    

    window.rightArm = object.getObjectByName('mixamorigRightForeArm');
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

  const t = clock.getElapsedTime();

  if (window.rightArm) {

    window.rightArm.rotation.z += Math.sin(t) * 0.005;
    window.rightArm.rotation.x = -Math.PI/2

  }

  controls.update()

  render()

  stats.update()
}

function render() {
  renderer.render(scene, camera)
}

animate()