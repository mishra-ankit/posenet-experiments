import Stats from 'https://unpkg.com/three@0.138.0/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://unpkg.com/three@0.138.0/examples/jsm/libs/lil-gui.module.min.js';
import * as FBXLoader from "https://unpkg.com/three@0.138.0/examples/js/loaders/FBXLoader.js"

var container, stats, controls;
var camera, scene, renderer, light;

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(100, 200, 300);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

  light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 200, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 200, 100);
  light.castShadow = true;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = - 100;
  light.shadow.camera.left = - 120;
  light.shadow.camera.right = 120;
  scene.add(light);

  // scene.add( new CameraHelper( light.shadow.camera ) );

  // ground
  var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  var grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // model

  var loader = new THREE.FBXLoader();
  loader.load('theboss.fbx', function (object) {

    // object.getObjectByName('rp_eric_rigged_001_geo');

    object.scale.set(0.35, 0.22, 0.35);
    object.position.set(- 2.1, - 37.50, - 0.50);
    object.rotation.set(0.0, 1.55, 0.0);

    scene.add(object);

    mesh = object.children[1];

    object.traverse(function (child) {

      if (child.isMesh) {

        console.log(child);

      }

    });

  });

  //dat.Gui

  var params = {

    bone0: 0.0,
    bone1: 0.0,

  }

  var gui = new GUI();
  var folder = gui.addFolder('Bones');

  folder.add(params, 'bone0', -1, 1).step(0.01).name('head').onChange(function (value) { mesh.skeleton.bones[6].rotation.x = value; });
  folder.add(params, 'bone0', -1, 1).step(0.01).name('head').onChange(function (value) { mesh.skeleton.bones[6].rotation.y = value; });

  folder.add(params, 'bone1', -1, 1).step(0.01).name('jaw').onChange(function (value) { mesh.skeleton.bones[8].rotation.x = value; });

}