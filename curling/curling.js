import * as THREE from "three";
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { ThirdPersonCamera } from "./camera.js";

const RED = 0;
const YELLOW = 1;

import { IceDimensions, meterToMeter, meterToCentimeter, meterToMillimeter, StoneDimensions } from "./dimensions.js";
import { IceModel } from "./models/ice/ice.js";
import { StoneSet } from "./models/stone/stone.js";
import { ArenaModel } from "./models/arena/arena.js";
import { Animation } from "./animation.js";
import { scene, renderer } from "./init.js";
import { setupLighting } from "./lighting.js";
import { dumpGeometry } from "./utils.js";

const converter = meterToCentimeter;
const iceDimensions = IceDimensions.generate(converter);
const stoneDimensions = StoneDimensions.generate(converter);

let thirdPersonCamera;

const cameras = {
    cameras: [],
    index: 0,
    live: null,
};

let origin = new THREE.Vector3(0, 0, 0);

const sheet = {
    arena: null,
    ice: null,
    stones: [],
};

const shot = {
    shooter: null,
    stones: null,
};

const progressBarContainer = document.querySelector(".progress-bar-container");
const progressBar = document.getElementById("progress-bar");

let mixer;

// camera
const shooterCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, converter(100));
const nearCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, converter(100));
const sideCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, converter(100));
const farCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, converter(100));
const skipCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, converter(100));

cameras.cameras.push(shooterCamera);
cameras.cameras.push(nearCamera);
cameras.cameras.push(sideCamera);
cameras.cameras.push(farCamera);
cameras.cameras.push(skipCamera);

cameras.live = 0;

let stats;

const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

manager.onLoad = function () {
    console.log("Loading complete!");
    stats = Stats();

    const gui = new dat.gui.GUI();
    gui.add(cameras, "live", { shooter: 0, near: 1, side: 2, far: 3, skip: 4 });

    document.body.appendChild(stats.dom);
    const arena = sheet.arena;
    const ice = sheet.ice;
    const redStones = sheet.stones[RED];
    const yellowStones = sheet.stones[YELLOW];

    arena.scale.set(2.0, 2.0, 2.0);
    dumpGeometry("arena after scale", arena);

    const box = new THREE.Box3().setFromObject(arena);
    const boundingBox = new THREE.Box3();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    boundingBox.setFromObject(arena);
    box.getCenter(center);
    box.getSize(size);

    dumpGeometry("ice", ice);
    console.log("iceDimensions", iceDimensions);
    const x = center.x + iceDimensions.width / 2 + 75;
    const y = center.y - iceDimensions.length / 2;
    const z = 9;
    origin.x = x;
    origin.y = y;
    origin.z = z;

    console.log("orgin", origin);

    ice.position.set(x, y, z);
    dumpGeometry("ice after move", ice);

    const lights = setupLighting(origin, iceDimensions);
    lights.all.forEach((light) => scene.add(light));

    shooterCamera.position.set(x, y - meterToCentimeter(1), z + meterToCentimeter(2));
    shooterCamera.lookAt(x, y + meterToCentimeter(20), z);

    nearCamera.position.set(x, y - meterToCentimeter(5), z + meterToCentimeter(6));
    nearCamera.lookAt(x, y, z + meterToCentimeter(6));

    sideCamera.position.set(x + meterToCentimeter(18), y + iceDimensions.length / 2, z + meterToCentimeter(5));
    sideCamera.lookAt(center.x, center.y, z);
    sideCamera.rotateZ(Math.PI / 2);

    farCamera.position.set(x, y + meterToCentimeter(50), z + meterToCentimeter(6));
    farCamera.lookAt(x, origin.y + iceDimensions.hogLine + iceDimensions.hogToHog, z - meterToCentimeter(6));
    farCamera.rotateZ(Math.PI);

    skipCamera.position.set(
        x,
        y + iceDimensions.hogLine + iceDimensions.hogToHog + iceDimensions.hogLine - iceDimensions.backLine,
        z + meterToCentimeter(2)
    );
    skipCamera.lookAt(x, y + iceDimensions.hogLine + iceDimensions.hogToHog, z - meterToCentimeter(1));
    skipCamera.rotateZ(Math.PI);

    redStones.forEach((stone, index) => {
        stone.position.x = origin.x + iceDimensions.width / 2 - stoneDimensions.diameter / 2;
        stone.position.y =
            center.y - iceDimensions.length / 2 + stoneDimensions.diameter * index + stoneDimensions.diameter / 2;
        stone.position.z = z;
        scene.add(stone);
    });

    yellowStones.forEach((stone, index) => {
        stone.position.x = origin.x - iceDimensions.width / 2 + stoneDimensions.diameter / 2;
        stone.position.y =
            center.y - iceDimensions.length / 2 + stoneDimensions.diameter * index + stoneDimensions.diameter / 2;
        stone.position.z = z;
        scene.add(stone);
    });

    scene.add(arena);
    scene.add(ice);

    shot.stones = sheet.stones;

    shot.stones[RED][0].position.x = origin.x - iceDimensions.width / 2 + stoneDimensions.diameter / 2;
    shot.stones[RED][0].position.y = origin.y + iceDimensions.length - stoneDimensions.diameter / 2;

    shot.stones[RED][1].position.x = origin.x;
    shot.stones[RED][1].position.y = origin.y + iceDimensions.hogLine + iceDimensions.hogToHog + meterToCentimeter(2);

    shot.stones[RED][2].position.x = origin.x + meterToCentimeter(1);
    shot.stones[RED][2].position.y = origin.y + iceDimensions.hogLine + iceDimensions.hogToHog + meterToCentimeter(3);

    shot.stones[RED][3].position.x = origin.x + meterToCentimeter(1.2);
    shot.stones[RED][3].position.y =
        origin.y + iceDimensions.hogLine + iceDimensions.hogToHog + meterToCentimeter(6.25);

    shot.stones[YELLOW][0].position.x = origin.x - stoneDimensions.diameter * 0.75;
    shot.stones[YELLOW][0].position.y =
        origin.y + iceDimensions.hogLine + iceDimensions.hogToHog + meterToCentimeter(2) + stoneDimensions.diameter / 2;

    shot.stones[YELLOW][1].position.x = origin.x - stoneDimensions.diameter / 2;
    shot.stones[YELLOW][1].position.y =
        origin.y +
        iceDimensions.hogLine +
        iceDimensions.hogToHog +
        iceDimensions.hogLine -
        (iceDimensions.teeLine + iceDimensions.twelveFootRadius);

    shot.stones[YELLOW][1].position.x = origin.x - stoneDimensions.diameter * 1.5;
    shot.stones[YELLOW][1].position.y =
        origin.y +
        iceDimensions.hogLine +
        iceDimensions.hogToHog +
        iceDimensions.hogLine -
        (iceDimensions.teeLine - iceDimensions.fourFootRadius);

    shot.shooter = shot.stones[RED][4];

    thirdPersonCamera = new ThirdPersonCamera({
        camera: shooterCamera,
        target: shot.shooter,
        converter: converter,
    });

    thirdPersonCamera.Update(0);

    const finish = new THREE.Vector3(0, 3800, 0);
    const clip = Animation.generate(origin, iceDimensions, finish);
    mixer = new THREE.AnimationMixer(shot.shooter);
    const clipAction = mixer.clipAction(clip);
    clipAction.play();

    progressBarContainer.style.display = "none";
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    progressBar.value = (itemsLoaded / itemsTotal) * 100;
};

manager.onError = function (url) {
    console.log("There was an error loading " + url);
};

// orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.update();

manager.itemStart("arena");
ArenaModel.generate(iceDimensions).then((arena) => {
    sheet.arena = arena;
    manager.itemEnd("arena");
});

manager.itemStart("ice");
IceModel.generate(iceDimensions).then((ice) => {
    sheet.ice = ice;
    manager.itemEnd("ice");
});

manager.itemStart("red stones");
StoneSet.generate(stoneDimensions, "red").then((stones) => {
    sheet.stones[RED] = stones;

    manager.itemEnd("red stones");
});

manager.itemStart("yellow stones");
StoneSet.generate(stoneDimensions, "yellow").then((stones) => {
    sheet.stones[YELLOW] = stones;

    manager.itemEnd("yellow stones");
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
        shooterCamera.aspect = canvas.clientWidth / canvas.clientHeight;
        shooterCamera.updateProjectionMatrix();
    }

    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
        const stone = shot.shooter;
        shooterCamera.position.set(
            stone.position.x,
            stone.position.y - meterToCentimeter(2),
            stone.position.z + meterToCentimeter(2)
        );

        thirdPersonCamera.Update(delta);

        shooterCamera.updateProjectionMatrix();
        nearCamera.updateProjectionMatrix();
        sideCamera.updateProjectionMatrix();
        farCamera.updateProjectionMatrix();
    }

    renderer.render(scene, cameras.cameras[cameras.live]);

    if (stats) {
        stats.update();
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

animate();
