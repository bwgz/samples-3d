

import * as THREE from 'three';

const setupLighting = () => {
    const lights = {
        all: [],
        ambient: [],
        spot: [],
    };

    const ambient = new THREE.AmbientLight(0xffffff, 2);
    lights.ambient.push(ambient);
    
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
    lights.spot.push(spotLight);

    const helper = new THREE.CameraHelper(spotLight.shadow.camera)
    lights.all.push(helper);

    lights.all.push(...lights.ambient);
    lights.all.push(...lights.spot);

    return lights;
    }

export { setupLighting };