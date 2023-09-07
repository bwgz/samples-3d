import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

const dump = (child) => {
  const size = new THREE.Vector3();
  const box = new THREE.Box3().setFromObject(child).getSize(size);
  console.log("traverse - BoxSize: " + JSON.stringify(size));
  child.traverse(dump);
};

class StoneModel {
  static generate() {
    return new Promise((resolve) => {
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath("/samples-3d/curling/models/stone/red/");

      mtlLoader.load("11720_Curling_Stone_v1_L3.mtl", (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.setPath("/samples-3d/curling/models/stone/red/");
        objLoader.load("11720_Curling_Stone_v1_L3.obj", (obj) => {
          const stone = obj;

          stone.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          stone.castShadow = true;

          resolve(stone);
        });
      });
    });
  }
}

class StoneSet {
  static generate(dimensions) {
    return new Promise((resolve) => {
      StoneModel.generate().then((stone) => {
        const stones = [];
        const box = new THREE.Box3().setFromObject(stone);
        const size = new THREE.Vector3();
        box.getSize(size);

        const actual = Math.max(size.x, size.y);
        const expected = dimensions.diameter;
        const scale = expected / actual;
        stone.scale.set(scale, scale, scale);

        for (let i = 1; i <= 8; i++) {
          stones.push(stone.clone());
        }

        resolve(stones);
      });
    });
  }
}

export { StoneModel, StoneSet };
