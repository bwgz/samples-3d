import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";



const types = new Map();
types.set("red", {
    path: "/samples-3d/curling/models/stone/red/",
    mtl: "11720_Curling_Stone_v1_L3.mtl",
    obj: "11720_Curling_Stone_v1_L3.obj",
});

types.set("yellow", {
    path: "/samples-3d/curling/models/stone/yellow/",
    mtl: "11720_Curling_Stone_v1_L3.mtl",
    obj: "11720_Curling_Stone_v1_L3.obj",
});

types.set("blue", {
    path: "/samples-3d/curling/models/stone/blue/",
    mtl: "11720_Curling_Stone_v1_L3.mtl",
    obj: "11720_Curling_Stone_v1_L3.obj",
});

const dump = (child) => {
    const size = new THREE.Vector3();
    const box = new THREE.Box3().setFromObject(child).getSize(size);
    console.log("traverse - BoxSize: " + JSON.stringify(size));
    child.traverse(dump);
};

class StoneModel {
    static generate(dimensions, type) {
        return new Promise((resolve) => {
            const mtlLoader = new MTLLoader();
            mtlLoader.setPath(type.path);

            mtlLoader.load(type.mtl, (mtl) => {
                mtl.preload();
                const objLoader = new OBJLoader();
                objLoader.setMaterials(mtl);
                objLoader.setPath(type.path);
                objLoader.load(type.obj, (obj) => {
                    const stone = obj;

                    const box = new THREE.Box3().setFromObject(stone);
                    const size = new THREE.Vector3();
                    box.getSize(size);

                    const actual = Math.max(size.x, size.y);
                    const expected = dimensions.diameter;
                    const scale = expected / actual;
                    stone.scale.set(scale, scale, scale);

                    const traverser = (child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.material.color.set(0xffffff);
                            child.material.metalness = 0;
                        }
                    };
                    stone.traverse(traverser);
                    stone.castShadow = true;
                    stone.receiveShadow = true;

                    resolve(stone);
                });
            });
        });
    }
}

class StoneSet {
    static generate(dimensions, color) {
        const type = types.get(color);
        return new Promise((resolve) => {
            StoneModel.generate(dimensions, type).then((stone) => {
                const stones = [];

                for (let i = 1; i <= 8; i++) {
                    stones.push(stone.clone());
                }

                resolve(stones);
            });
        });
    }
}

export { StoneModel, StoneSet };
