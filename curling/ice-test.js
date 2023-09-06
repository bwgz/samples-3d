import * as THREE from 'three';
import Stats from 'https://unpkg.com/three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

import { rink } from './dimensions.js';
import { generateIce } from './models/ice/ice.js';
import { generateStone } from './models/stone/stone.js';

let mixer;

const stats = Stats();
document.body.appendChild(stats.dom);

let stone = null;

// scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(300);
scene.add(axesHelper);

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, -100, 300);
camera.lookAt(0, 0, 0);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);

const ice = generateIce(rink);
scene.add(ice);

const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 7);
scene.add(ambient);

const spotLight = new THREE.SpotLight(0xFFFFFF, 50000.0);
spotLight.position.set(25, 250, 100);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 1;
spotLight.decay = 2;
spotLight.distance = 200;

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 200;
spotLight.shadow.focus = 1;

scene.add(spotLight);

const helper = new THREE.CameraHelper(spotLight.shadow.camera)
//scene.add(helper)

const clock = new THREE.Clock();

generateStone((object) => { 
    object.position.x = 0;
    object.position.y = 3500;

    scene.add(object);
});

let blueStone = null;
generateStone((object) => { 
    blueStone = object;
    object.position.x = 100;
    object.position.y = 3650;

    scene.add(object);
});

generateStone((object) => {
    stone = object;
    stone.position.y = 200;
    spotLight.target = stone;
    scene.add(stone);

    const keys = 30;

    const easeIn = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(12.715, 5.6, 0),
        new THREE.Vector3(18.326, 8.773, 0),
        new THREE.Vector3(keys, keys, 0),
    );

    const t = easeIn.getPoints(keys);

    let curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(64.624, 308.361, 0),
        new THREE.Vector3(146.213, 762.221, 0),
        new THREE.Vector3(0, 1000, 0),
    );

    const times = [];
    const points = [];
    const quaternions = [];

    const zAxis = new THREE.Vector3( 0, 0, 1 );
    const rotations = [
        new THREE.Quaternion().setFromAxisAngle(zAxis, 0),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 0.25),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 0.5),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 0.75),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 1.25),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 1.5),
        new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 1.75),
    ];

    curve.getPoints(keys).forEach((point, index) => {
        times.push(t[index].y);
        points.push(point.x, point.y * 4, 0);
        const rotation = rotations[index % rotations.length];
        quaternions.push(rotation.x, rotation.y, rotation.z, rotation.w);
    });
    const positionKF = new THREE.VectorKeyframeTrack('.position', times, points);
    const quaternionKF = new THREE.QuaternionKeyframeTrack('.quaternion', times, quaternions);

    const clip = new THREE.AnimationClip('Action', 35, [positionKF, quaternionKF]);
    mixer = new THREE.AnimationMixer(stone);
    const clipAction = mixer.clipAction(clip);
    clipAction.play();

    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }
    animate();
})

function trackCamera(camera, boxCenter) {
    camera.position.x = boxCenter.x;
    camera.position.y = boxCenter.y - 300;
    camera.lookAt(stone.position)
}

function trackSpot(spot, boxCenter) {
    spot.position.y = boxCenter.y;
}

function render() {
    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    if (stone) {
        const box = new THREE.Box3().setFromObject(stone);
        const boxCenter = box.getCenter(new THREE.Vector3());
        trackCamera(camera, boxCenter);
        trackSpot(spotLight, boxCenter);
        
        if (blueStone) {
            const blueBox = new THREE.Box3().setFromObject(blueStone);

            if (blueBox.intersectsBox(box)) {
                //console.log('hit');
                //blueStone.position.y += 0.3;
            }
        }
    }
    renderer.render(scene, camera);

    stats.update();
}

function animate() {
    render();
    requestAnimationFrame(animate);
}
