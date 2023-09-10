import * as THREE from "three";

const generateSpotLight = (origin, dimensions, offset) => {
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    const x = origin.x;
    const y = origin.y + offset;
    const z = origin.z + dimensions.oneMeter * 12;
    spotLight.position.set(x, y, z);
    spotLight.angle = Math.PI * 0.35;
    spotLight.penumbra = 1;
    spotLight.decay = 0.0075;
    spotLight.distance = dimensions.oneMeter * 22;
    spotLight.target.position.set(origin.x, y, origin.z);

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = dimensions.oneMeter * 15;
    spotLight.shadow.focus = 1;

    return spotLight;
};

const setupLighting = (origin, dimensions) => {
    const lights = {
        all: [],
        ambient: [],
        spot: [],
    };

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    lights.ambient.push(ambient);   

    let spotLight = generateSpotLight(origin, dimensions, dimensions.teeLine);
    lights.spot.push(spotLight);
    lights.spot.push(spotLight.target);
    let helper = new THREE.CameraHelper(spotLight.shadow.camera);
    //lights.all.push(helper);

    spotLight = generateSpotLight(origin, dimensions, dimensions.hogLine + dimensions.hogToHog * 0.33);
    lights.spot.push(spotLight);
    lights.spot.push(spotLight.target);
    helper = new THREE.CameraHelper(spotLight.shadow.camera);
    //lights.all.push(helper);

    spotLight = generateSpotLight(origin, dimensions, dimensions.hogLine + dimensions.hogToHog * 0.66);
    lights.spot.push(spotLight);
    lights.spot.push(spotLight.target);
    helper = new THREE.CameraHelper(spotLight.shadow.camera);

    spotLight = generateSpotLight(
        origin,
        dimensions,
        dimensions.hogLine + dimensions.hogToHog + (dimensions.hogLine - dimensions.teeLine)
    );
    lights.spot.push(spotLight);
    lights.spot.push(spotLight.target);
    helper = new THREE.CameraHelper(spotLight.shadow.camera);
    //lights.all.push(helper);

    lights.all.push(...lights.ambient);
    lights.all.push(...lights.spot);

    return lights;
};

export { setupLighting };
