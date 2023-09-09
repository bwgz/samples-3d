import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { dumpGeometry } from "../../utils.js";

class ArenaModel {
    static generate(dimensions) {
        return new Promise((resolve, reject) => {
            const mtlLoader = new ColladaLoader();
            mtlLoader.setPath("/samples-3d/curling/models/arena/");

            mtlLoader.load("model.dae", (result) => {
                try {
                    //dumpGeometry("scene after load", result.scene);
                    const arena = result.scene.children[0];
                    arena.rotateZ(Math.PI / 2);

                    dumpGeometry("arena after load", arena);
                    resolve(arena); 
                } catch (e) {
                    console.log(e);
                }
            });
        });
    }
}

export { ArenaModel };
