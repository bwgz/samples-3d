import * as THREE from "three";

class Animation {
    static generate(origin, dimensions, finish) {
        const keys = 100;
        const speed = 25;

        const easeIn = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(36.05, 84.727, 0),
            new THREE.Vector3(61.055, 95.491, 0),
            new THREE.Vector3(100, 100, 0)
        );

        const easeIns = easeIn.getPoints(keys);

        let curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(24.617, 61.423, 0),
            new THREE.Vector3(20.12, 85.783, 0),
            new THREE.Vector3(0, 100, 0)
        );

        const times = [];
        const points = [];
        const quaternions = [];

        const zAxis = new THREE.Vector3(0, 0, 1);
        
        const rotations = [
            new THREE.Quaternion().setFromAxisAngle(zAxis, 0),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 0.25),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 0.5),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 0.75),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 1.25),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 1.5),
            new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI * 1.75),
        ];

        console.log(dimensions);
        curve.getPoints(keys).forEach((point, index) => {
            //console.log("animation - easeIns[index].x", easeIns[index].x);
            times.push((easeIns[index].x / 100) * speed); // 25 seconds for running stone
            //console.log("animation - in", point)
            const x = origin.x + (dimensions.width * (point.x / 100));
            const y = origin.y + dimensions.hack + (finish.y * (point.y / 100));
            const z = origin.z;
            points.push(x, y, z);
            //console.log("animation - out", x, y, z);
            const rotation = new THREE.Quaternion().setFromAxisAngle(zAxis, (Math.PI * (easeIns[index].x / 100) * (speed / 5)));
            quaternions.push(rotation.x, rotation.y, rotation.z, rotation.w);
        });
        const positionKF = new THREE.VectorKeyframeTrack(".position", times, points);
        const quaternionKF = new THREE.QuaternionKeyframeTrack(".quaternion", times, quaternions);

        const clip = new THREE.AnimationClip("Action", 40, [positionKF, quaternionKF]);

        return clip;
    }
}

export { Animation };
