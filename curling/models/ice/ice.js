import * as THREE from 'three';

const meterToMillimeter = (m) => m * 1000;
const centimeterToMillimeter = (cm) => cm * 10;
const meterToCentimeter = (m) => m * 100;

const pantoneWhite = '#f4f5f0';
const grayWhite= '#F2F3F5';

const iceColor = grayWhite

const generateEnd = (rink) => {
    const canvas = document.createElement('canvas');
    canvas.width = rink.width;
    canvas.height = rink.hogLine;
    const context = canvas.getContext('2d');

    let x, y, width, height, radius;

    x = 0; y = 0; width = rink.width; height = rink.hogLine;
    context.fillStyle = iceColor;
    context.fillRect(x, y, width, height);

    x = 0; y = rink.backLine; width = rink.width; height = rink.lineWidth;
    context.fillStyle = 'black';
    context.fillRect(x, y, width, height);

    const pin = {
        x: rink.centerLine,
        y: rink.backLine + rink.twelveFoot
    }

    // twelve foot
    context.beginPath();
    context.arc(pin.x, pin.y, rink.twelveFoot, 0, 2 * Math.PI);
    context.fillStyle = "blue";
    context.fill();

    // eight foot
    radius = rink.eightFoot;
    context.beginPath();
    context.arc(pin.x, pin.y, rink.eightFoot, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();

    // four foot
    radius = rink.fourFoot;
    context.beginPath();
    context.arc(pin.x, pin.y, rink.fourFoot, 0, 2 * Math.PI);
    context.fillStyle = "red";
    context.fill();

    // center line
    x = 0;
    y = pin.y - (rink.lineWidth / 2);
    context.fillStyle = 'black';
    context.fillRect(x, y, width, rink.lineWidth);

    // hog line
    x = 0;
    y = rink.hogLine + rink.lineWidth / 2;
    context.fillStyle = 'black';
    context.fillRect(x, y, width, rink.lineWidth);

    // center line
    x = rink.centerLine - (rink.lineWidth / 2);
    y = rink.hack;
    height = rink.hogLine - rink.hack;
    context.fillStyle = 'black';
    context.fillRect(x, y, rink.lineWidth, height);

    // button
    radius = rink.button;
    context.beginPath();
    context.arc(pin.x, pin.y, rink.button, 0, 2 * Math.PI);
    context.fillStyle = "white";
    context.fill();

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshStandardMaterial({
        map: texture
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(rink.width, rink.hogLine, 32), material);
}

const generateHogToHog = (rink) => {
    const canvas = document.createElement('canvas');
    canvas.width = rink.width;
    canvas.height = rink.hogToHog;
    const context = canvas.getContext('2d');

    let x, y, width, height;

    x = 0; y = 0; width = rink.width; height = rink.hogToHog;
    context.fillStyle = iceColor;
    context.fillRect(x, y, width, height);

    var texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // hog lines
    x = 0;
    y = 0;
    width = rink.width;
    context.fillStyle = 'red';
    context.fillRect(x, y, width, rink.hogLineWidth);

    // hog lines
    x = 0;
    y = rink.hogToHog - rink.hogLineWidth;
    width = rink.width;
    context.fillStyle = 'red';
    context.fillRect(x, y, width, rink.hogLineWidth);

    // center line
    x = rink.centerLine - (rink.lineWidth / 2);
    y = 0;
    height = rink.hogToHog;
    context.fillStyle = 'black';
    context.fillRect(x, y, rink.lineWidth, height);

    var material = new THREE.MeshStandardMaterial({
        map: texture
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(rink.width, rink.hogToHog, 32), material);
}

const generateIce = (rink) => {
    const near = generateEnd(rink);
    const middle = generateHogToHog(rink);
    const far = near.clone()
    
    near.rotation.z = -Math.PI;
    near.position.y = (rink.hogLine / 2);
    
    middle.position.y = (rink.hogToHog / 2) + rink.hogLine;
    
    far.position.y = (rink.hogLine / 2) + rink.hogToHog + rink.hogLine;
    
    const group = new THREE.Group();
    group.add(near);
    group.add(middle);
    group.add(far);
    
    group.receiveShadow = true;
    
    return group;
   
}

export { generateIce };