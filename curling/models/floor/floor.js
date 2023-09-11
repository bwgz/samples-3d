import * as THREE from "three";


class FloorModel {
    static generate(dimensions) {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = "/samples-3d/curling/models/floor/carpet-02.png";
            image.onload = () => {
                const width = dimensions.width;
                const height = dimensions.length;
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext("2d");
        
                context.fillStyle = context.createPattern(image, 'repeat');
                context.fillRect(0, 0, width, height);
              
                var texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
            
                var material = new THREE.MeshLambertMaterial({
                    map: texture,
                });
            
                const floor = new THREE.Mesh(new THREE.BoxGeometry(width, height, 32), material);
            
                resolve(floor);
            };
        });
    }
}

export { FloorModel };
