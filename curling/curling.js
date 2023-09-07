import * as THREE from "three";
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";

const RED = 0;

import {
  IceDimensions,
  meterToMeter,
  meterToCentimeter,
  meterToMillimeter,
  StoneDimensions,
} from "./dimensions.js";
import { IceModel } from "./models/ice/ice.js";
import { StoneSet } from "./models/stone/stone.js";
import { Animation } from "./animation.js";
import { scene, renderer } from "./init.js";
import { setupLighting } from "./lighting.js";

const sheet = {
  ice: null,
  stones: [],
};

const converter = meterToMillimeter;
let mixer;

const stats = Stats();
document.body.appendChild(stats.dom);

const lights = setupLighting();
lights.forEach((light) => scene.add(light));

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  converter(50)
);
camera.position.set(0, 0, converter(5));

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

const iceDimensions = IceDimensions.generate(converter);
IceModel.generate(iceDimensions).then((ice) => {
  sheet.ice = ice;
  scene.add(ice);

  const box = new THREE.Box3().setFromObject(ice);
  const size = new THREE.Vector3();
  box.getSize(size);
  console.log("BoxSize: " + JSON.stringify(size));
});

camera.position.set(0, iceDimensions.teeLine, converter(5));
camera.lookAt(0, iceDimensions.teeLine, converter(5));

const stoneDimensions = StoneDimensions.generate(converter);
StoneSet.generate(stoneDimensions).then((stones) => {
  stones.forEach((stone, index) => {
    stone.position.x = iceDimensions.width / 2 - stoneDimensions.diameter / 2;
    stone.position.y = (stoneDimensions.diameter * index) + (stoneDimensions.diameter / 2);
    scene.add(stone);
  });

  sheet.stones[RED] = stones;
  const clip = Animation.generate();
  mixer = new THREE.AnimationMixer(sheet.stones[RED][0]);
  const clipAction = mixer.clipAction(clip);
  clipAction.play();
});

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}

const clock = new THREE.Clock();

function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
    controls.target = sheet.stones[RED][0].position;
    controls.update();
  }

  renderer.render(scene, camera);

  stats.update();
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

animate();
