import * as THREE from "three";

const GRAY_WHITE = "#F2F3F5";

const iceWhiteWashColor = GRAY_WHITE;
const iceWhiteWashAlpha = 0.2;

const generateEnd = (dimensions, image) => {
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.hogLine;
    const context = canvas.getContext("2d");

    let x, y, width, height;

    x = 0;
    y = 0;
    width = dimensions.width;
    height = dimensions.hogLine;

    // ice
    const pattern = context.createPattern(image, "repeat");
    context.fillStyle = pattern;
    context.fillRect(x, y, width, height);

    // white wash
    context.fillStyle = iceWhiteWashColor;
    context.globalAlpha = iceWhiteWashAlpha;
    context.fillRect(x, y, width, height);
    context.globalAlpha = 0.9;

    // back line
    x = 0;
    y = dimensions.backLine;
    width = dimensions.width;
    height = dimensions.backLineWidth;
    context.fillStyle = "black";
    context.fillRect(x, y, width, height);

    const pin = {
        x: dimensions.centerLine,
        y: dimensions.teeLine,
    };

    const TWO_PI = 2 * Math.PI;
    // twelve foot
    context.beginPath();
    context.arc(pin.x, pin.y, dimensions.twelveFootRadius, 0, TWO_PI);
    context.fillStyle = "blue";
    context.fill();

    // eight foot
    context.beginPath();
    context.arc(pin.x, pin.y, dimensions.eightFootRadius, 0, TWO_PI);
    context.fillStyle = "white";
    context.fill();

    // four foot
    context.beginPath();
    context.arc(pin.x, pin.y, dimensions.fourFootRadius, 0, TWO_PI);
    context.fillStyle = "red";
    context.fill();

    // tee line
    x = 0;
    y = dimensions.teeLine - dimensions.teeLineWidth / 2;
    context.fillStyle = "black";
    context.fillRect(x, y, width, dimensions.teeLineWidth);

    // center line
    x = dimensions.centerLine - dimensions.centerLineWidth / 2;
    y = dimensions.hack;
    context.fillStyle = "black";
    context.fillRect(x, y, dimensions.centerLineWidth, dimensions.hogLine - dimensions.hack);

    // button
    context.beginPath();
    context.arc(pin.x, pin.y, dimensions.buttonRadius, 0, TWO_PI);
    context.fillStyle = "white";
    context.fill();

    // pin
    context.beginPath();
    context.arc(pin.x, pin.y, dimensions.pinRadius, 0, TWO_PI);
    context.fillStyle = "black";
    context.fill();

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const bumpMap = new THREE.TextureLoader().load("/samples-3d/curling/models/ice/ice-bump-02.png");

    var material = new THREE.MeshLambertMaterial({
        map: texture,
        emissive: iceWhiteWashColor,
        emissiveIntensity: 0.1,
        reflectivity: 1,
        bumpMap: bumpMap,
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width, dimensions.hogLine, 32), material);
};

const generateHogToHog = (dimensions, image) => {
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.hogToHog;
    const context = canvas.getContext("2d");

    let x, y, width, height;

    x = 0;
    y = 0;
    width = dimensions.width;
    height = dimensions.hogToHog;

    // ice
    const pattern = context.createPattern(image, "repeat");
    context.fillStyle = pattern;
    context.fillRect(x, y, width, height);

    // white wash
    context.fillStyle = iceWhiteWashColor;
    context.globalAlpha = iceWhiteWashAlpha;
    context.fillRect(x, y, width, height);
    context.globalAlpha = 1;

    // center line
    x = dimensions.centerLine - dimensions.centerLineWidth / 2;
    y = 0;
    height = dimensions.hogToHog;
    context.fillStyle = "black";
    context.fillRect(x, y, dimensions.centerLineWidth, height);

    // hog lines
    x = 0;
    y = 0;
    width = dimensions.width;
    context.fillStyle = "red";
    context.fillRect(x, y, width, dimensions.hogLineWidth);

    // hog lines
    x = 0;
    y = dimensions.hogToHog - dimensions.hogLineWidth;
    width = dimensions.width;
    context.fillStyle = "red";
    context.fillRect(x, y, width, dimensions.hogLineWidth);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const bumpMap = new THREE.TextureLoader().load("/samples-3d/curling/models/ice/ice-bump-02.png");

    var material = new THREE.MeshLambertMaterial({
        map: texture,
        emissive: iceWhiteWashColor,
        emissiveIntensity: 0.1,
        reflectivity: 1,
        bumpMap: bumpMap,
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(dimensions.width, dimensions.hogToHog, 32), material);
};

class IceModel {
    static generateEnd(dimensions) {
        return generateEnd(dimensions);
    }

    static generate(dimensions) {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = "/samples-3d/curling/models/ice/ice-02.png";
            image.onload = () => {
                const near = generateEnd(dimensions, image);
                const middle = generateHogToHog(dimensions, image);
                const far = near.clone();

                near.rotation.z = -Math.PI;
                near.position.y = dimensions.hogLine / 2;
                near.receiveShadow = true;

                middle.position.y = dimensions.hogToHog / 2 + dimensions.hogLine;
                middle.receiveShadow = true;

                far.position.y = dimensions.hogLine / 2 + dimensions.hogToHog + dimensions.hogLine;
                far.receiveShadow = true;

                const group = new THREE.Group();
                group.add(near);
                group.add(middle);
                group.add(far);

                group.receiveShadow = true;

                resolve(group);
            };
        });
    }
}

export { IceModel };
