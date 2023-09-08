import * as THREE from "three";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";

const dump = (child) => {
    const size = new THREE.Vector3();
    const box = new THREE.Box3().setFromObject(child).getSize(size);
    console.log("traverse - BoxSize: " + JSON.stringify(size));
    child.traverse(dump);
};

class ArenaModel {
    static generate() {
        return new Promise((resolve, reject) => {
            const mtlLoader = new ColladaLoader();
            mtlLoader.setPath("/samples-3d/curling/models/arena/");

            mtlLoader.load("model.dae", (result) => {
                try {
                    const scene = result.scene.children[0];
                    //scene.rotateX(Math.PI / 2);
                    scene.rotateZ(Math.PI / 2);


                    //const mesh_source = result.scene.children[0];
                    //console.log("ArenaModel.generate - mesh_source: " + JSON.stringify(mesh_source.geometry));
                    //const mesh = new THREE.Mesh(mesh_source.geometry, new THREE.MeshNormalMaterial());

                    resolve(scene);
                } catch (e) {
                    console.log(e);
                }
            });
        });
    }
}

export { ArenaModel };
