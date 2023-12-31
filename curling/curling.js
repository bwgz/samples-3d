import * as THREE from "three";
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { ThirdPersonCamera } from "./camera.js";

const RED = 0;
const YELLOW = 1;

import {
    FloorDimensions,
    IceDimensions,
    meterToMeter,
    meterToCentimeter,
    meterToMillimeter,
    StoneDimensions,
    ScoreboardDimensions,
} from "./dimensions.js";
import { IceModel } from "./models/ice/ice.js";
import { StoneSet } from "./models/stone/stone.js";
import { ArenaModel } from "./models/arena/arena.js";
import { Animation } from "./animation.js";
import { scene, renderer } from "./init.js";
import { setupLighting } from "./lighting.js";
import { dumpGeometry } from "./utils.js";
import { ScoreboardModel } from "./models/scoreboard/scoreboard.js";
import { FloorModel } from "./models/floor/floor.js";

const converter = meterToCentimeter;
const floorDimensions = FloorDimensions.generate(converter);
const iceDimensions = IceDimensions.generate(converter);
const stoneDimensions = StoneDimensions.generate(converter);
const scoreboardDimensions = ScoreboardDimensions.generate(converter);

let thirdPersonCamera;

const cameras = {
    cameras: [],
    index: 0,
    active: null,
};

let origin = new THREE.Vector3(0, 0, 0);

const sheet = {
    arena: null,
    floor: null,
    ice: null,
    scoreboard: null,
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
const iceLevelCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, converter(100));
const skipCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, converter(100));
const scoreboardCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, converter(100));
const noseBleedCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, converter(100));
const orbitCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, converter(500));

cameras.cameras.push(shooterCamera);
cameras.cameras.push(nearCamera);
cameras.cameras.push(sideCamera);
cameras.cameras.push(farCamera);
cameras.cameras.push(skipCamera);
cameras.cameras.push(iceLevelCamera);
cameras.cameras.push(scoreboardCamera);
cameras.cameras.push(noseBleedCamera);
cameras.cameras.push(orbitCamera);

cameras.active = 0;

const orbitControls = new OrbitControls(orbitCamera, renderer.domElement);

let stats;

const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

manager.onLoad = function () {
    console.log("Loading complete!");
    const gui = new dat.gui.GUI();
    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(cameras, "active", {
        shooter: 0,
        near: 1,
        side: 2,
        far: 3,
        skip: 4,
        iceLevelCamera: 5,
        scoreboard: 6,
        noseBleed: 7,
        orbitCamera: 8,
    });
    cameraFolder.open();
    stats = Stats();

    document.body.appendChild(stats.dom);
    const arena = sheet.arena;
    const floor = sheet.floor;
    const ice = sheet.ice;
    const scoreboard = sheet.scoreboard;
    const redStones = sheet.stones[RED];
    const yellowStones = sheet.stones[YELLOW];

    // arena model's ice surface is length: 2400, width: 1104
    // typical hockey rink is 61 meters long

    const desiredArenaIceLength = floorDimensions.length;
    const actualArenaIceLength = 2400;
    console.log("designed arena ice length", desiredArenaIceLength);

    const scale = desiredArenaIceLength / actualArenaIceLength;
    arena.scale.set(scale, scale, scale);
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
    const x = center.x + iceDimensions.width / 2 + 125;
    const y = center.y - iceDimensions.length / 2;
    const z = 11;

    floor.position.set(x, center.y, z);

    origin.x = x;
    origin.y = y;
    origin.z = z + 2;

    console.log("orgin", origin);

    ice.position.set(origin.x, origin.y, origin.z);
    dumpGeometry("ice after move", ice);

    scoreboard.position.set(origin.x, origin.y + iceDimensions.length + scoreboardDimensions.back, origin.z);

    const lights = setupLighting(origin, iceDimensions);
    lights.all.forEach((light) => scene.add(light));

    shooterCamera.position.set(origin.x, origin.y - meterToCentimeter(1), origin.z + meterToCentimeter(2));
    shooterCamera.lookAt(origin.x, origin.y + meterToCentimeter(20), origin.z);

    nearCamera.position.set(origin.x, origin.y - meterToCentimeter(5), origin.z + meterToCentimeter(6));
    nearCamera.lookAt(origin.x, origin.y, origin.z + meterToCentimeter(6));

    orbitControls.target.set(origin.x, origin.y, origin.z + meterToCentimeter(6));
    orbitControls.update();

    sideCamera.position.set(
        origin.x + meterToCentimeter(18),
        origin.y + iceDimensions.length / 2,
        origin.z + meterToCentimeter(5)
    );
    sideCamera.lookAt(center.x, center.y, origin.z);
    sideCamera.rotateZ(Math.PI / 2);

    farCamera.position.set(origin.x, origin.y + meterToCentimeter(50), origin.z + meterToCentimeter(6));
    farCamera.lookAt(
        origin.x,
        origin.y + iceDimensions.hogLine + iceDimensions.hogToHog,
        origin.z - meterToCentimeter(6)
    );
    farCamera.rotateZ(Math.PI);

    iceLevelCamera.position.set(origin.x, origin.y + iceDimensions.hogLine + iceDimensions.hogToHog, origin.z + 1);
    iceLevelCamera.lookAt(origin.x, origin.y + iceDimensions.length, origin.z);

    scoreboardCamera.position.set(
        origin.x,
        origin.y + iceDimensions.length - iceDimensions.backLine,
        origin.z + meterToCentimeter(1)
    );
    scoreboardCamera.lookAt(scoreboard.position.x, scoreboard.position.y, scoreboard.position.z);

    noseBleedCamera.position.set(
        origin.x + meterToCentimeter(40),
        y + iceDimensions.length / 2,
        origin.z + meterToCentimeter(20)
    );
    noseBleedCamera.lookAt(origin.x, y + iceDimensions.length / 2, origin.z + meterToCentimeter(1));
    noseBleedCamera.rotateZ(Math.PI / 2);

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
        stone.position.z = origin.z;
        scene.add(stone);
    });

    yellowStones.forEach((stone, index) => {
        stone.position.x = origin.x - iceDimensions.width / 2 + stoneDimensions.diameter / 2;
        stone.position.y =
            center.y - iceDimensions.length / 2 + stoneDimensions.diameter * index + stoneDimensions.diameter / 2;
        stone.position.z = origin.z;
        scene.add(stone);
    });

    scene.add(arena);
    scene.add(floor);
    scene.add(ice);
    scene.add(scoreboard);

    shot.stones = sheet.stones;

    shot.stones[RED][0].position.x = origin.x - iceDimensions.width / 2 + stoneDimensions.diameter / 2;
    shot.stones[RED][0].position.y = origin.y + iceDimensions.length - stoneDimensions.diameter / 2;

    shot.stones[RED][1].position.x = origin.x + stoneDimensions.diameter / 2;
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

    shot.stones[YELLOW][2].position.x = origin.x - stoneDimensions.diameter * 1.5;
    shot.stones[YELLOW][2].position.y =
        origin.y +
        iceDimensions.hogLine +
        iceDimensions.hogToHog +
        iceDimensions.hogLine -
        (iceDimensions.teeLine - iceDimensions.fourFootRadius);

    shot.stones[YELLOW][3].position.x = origin.x + iceDimensions.width / 2 - stoneDimensions.diameter / 2;
    shot.stones[YELLOW][3].position.y = origin.y + iceDimensions.length - stoneDimensions.diameter / 2;

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

manager.itemStart("floor");
FloorModel.generate(floorDimensions).then((floor) => {
    sheet.floor = floor;
    manager.itemEnd("floor");
});

manager.itemStart("ice");
IceModel.generate(iceDimensions).then((ice) => {
    sheet.ice = ice;
    manager.itemEnd("ice");
});

manager.itemStart("scoreboard");
ScoreboardModel.generate(scoreboardDimensions).then((scoreboard) => {
    sheet.scoreboard = scoreboard;
    manager.itemEnd("scoreboard");
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
        scoreboardCamera.updateProjectionMatrix();
        iceLevelCamera.updateProjectionMatrix();
        noseBleedCamera.updateProjectionMatrix();
        orbitCamera.updateProjectionMatrix();
    }

    renderer.render(scene, cameras.cameras[cameras.active]);

    if (stats) {
        stats.update();
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

animate();
