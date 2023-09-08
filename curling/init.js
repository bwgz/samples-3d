import * as THREE from 'three';
import Stats from 'https://unpkg.com/three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

const stats = Stats();
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(1000);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

export { scene, renderer };