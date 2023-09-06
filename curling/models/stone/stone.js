import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const generateStone = (callback) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("http://localhost:3000/curling/models/stone/red/");

    mtlLoader.load('11720_Curling_Stone_v1_L3.mtl', (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.setPath("http://localhost:3000/curling/models/stone/red/");
        objLoader.load('11720_Curling_Stone_v1_L3.obj', (obj) => {
            const stone = obj;
            stone.scale.set(1.25, 1.25, 1.25);

            stone.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            stone.castShadow = true;

            console.log(stone)
            callback(stone);
        });
    });
}

export { generateStone };