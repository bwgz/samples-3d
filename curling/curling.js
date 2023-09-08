import * as THREE from "three";
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";

const RED = 0;

import { IceDimensions, meterToMeter, meterToCentimeter, meterToMillimeter, StoneDimensions } from "./dimensions.js";
import { IceModel } from "./models/ice/ice.js";
import { StoneSet } from "./models/stone/stone.js";
import { ArenaModel } from "./models/arena/arena.js";
import { Animation } from "./animation.js";
import { scene, renderer } from "./init.js";
import { setupLighting } from "./lighting.js";
import { gui } from "./datgui.js";

const converter = meterToCentimeter;
const iceDimensions = IceDimensions.generate(converter);
const stoneDimensions = StoneDimensions.generate(converter);

const sheet = {
    ice: null,
    stones: [],
};

let mixer;

const stats = Stats();
document.body.appendChild(stats.dom);

const lights = setupLighting();
lights.all.forEach((light) => scene.add(light));

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, converter(500));
//camera.lookAt(0, iceDimensions.hogLine, 0);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const dump = (string, object) => {
    const box = new THREE.Box3().setFromObject(object);
    const boundingBox = new THREE.Box3();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    boundingBox.setFromObject(object);
    box.getCenter(center);
    box.getSize(size);

    console.log(string + " - boundingBox: " + JSON.stringify(boundingBox));
    console.log(string + " - center: " + JSON.stringify(center));
    console.log(string + " - size: " + JSON.stringify(size));
};

ArenaModel.generate(iceDimensions).then((arena) => {
    //arena.rotateZ(Math.PI / 2)
    sheet.arena = arena;

    dump("original", arena);

    arena.scale.set(2.0, 2.0, 2.0);
    dump("after", arena);

    //arena.position.sub( center ); // center the model
    //arena.position.x = center.x;
    //arena.position.y = 0;
    //arena.position.x = 0;
    //arena.position.z = 0;
    //arena.rotation.z = Math.PI / 2;   // rotate the model

    //  camera.position.set(2470.860704331167, 82.51215509395111, 258.47720019519244);
    //  camera.lookAt(size.x / 2, size.y / 2, size.z / 2 );

    //camera.position.set(0, -100, 1000);
    //camera.lookAt(0, 0, 0);
    //controls.target.set(0, 0, 0);
    //controls.update();

    //console.log("render - camera.position: " + JSON.stringify(camera.position));
    //console.log("render - camera.rotation: " + JSON.stringify(camera.rotation));
    controls.update();

    //console.log("ArenaModel.generate - BoxSize: " + JSON.stringify(size));
    scene.add(arena);
});

IceModel.generate(iceDimensions).then((ice) => {
    const x = -3443 + iceDimensions.width / 2;
    const y = 4422 - iceDimensions.length / 2;
    const z = 9;
    ice.position.set(x, y, z);

    sheet.ice = ice;
    scene.add(ice);

    dump("arena", sheet.arena);
    dump("ice", ice);

    camera.position.set(x, y - 100, z + 100);
    camera.lookAt(x, y, z);
    controls.target.set(x, y, z);
    controls.update();

    const box = new THREE.Box3().setFromObject(ice);
    const size = new THREE.Vector3();
    box.getSize(size);
});

StoneSet.generate(stoneDimensions).then((stones) => {
    stones.forEach((stone, index) => {
        stone.position.x = iceDimensions.width / 2 - stoneDimensions.diameter / 2;
        stone.position.y = stoneDimensions.diameter * index + stoneDimensions.diameter / 2;
        //scene.add(stone);
    });

    sheet.stones[RED] = stones;

    console.log(iceDimensions);
    const stone = sheet.stones[RED][0];
    const stoneFolder = gui.addFolder("Stone");

    stoneFolder.add(stone.position, "x", -(iceDimensions.width / 2), iceDimensions.width / 2);
    stoneFolder.add(stone.position, "y", 0, iceDimensions.length);
    stoneFolder.open();

    //const clip = Animation.generate();
    //mixer = new THREE.AnimationMixer(sheet.stones[RED][0]);
    //const clipAction = mixer.clipAction(clip);
    //clipAction.play();
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
        //mixer.update(delta);
        //controls.target = sheet.stones[RED][0].position;
        controls.update();
    }

    //console.log("render - camera.position: " + JSON.stringify(camera.position));
    //console.log("render - camera.rotation: " + JSON.stringify(camera.rotation));
    renderer.render(scene, camera);

    stats.update();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

animate();
