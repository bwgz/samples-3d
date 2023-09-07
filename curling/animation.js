import * as THREE from "three";

class Animation {
  static generate() {
    const keys = 30;

    const easeIn = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(12.715, 5.6, 0),
      new THREE.Vector3(18.326, 8.773, 0),
      new THREE.Vector3(keys, keys, 0)
    );

    const easeIns = easeIn.getPoints(keys);

    let curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(64.624, 308.361, 0),
      new THREE.Vector3(146.213, 762.221, 0),
      new THREE.Vector3(0, 1000, 0)
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

    curve.getPoints(keys).forEach((point, index) => {
      times.push(easeIns[index].y);
      points.push(point.x * 10, point.y * 40, 0);
      const rotation = rotations[index % rotations.length];
      quaternions.push(rotation.x, rotation.y, rotation.z, rotation.w);
    });
    const positionKF = new THREE.VectorKeyframeTrack(
      ".position",
      times,
      points
    );
    const quaternionKF = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      times,
      quaternions
    );

    const clip = new THREE.AnimationClip("Action", 40, [
      positionKF,
      quaternionKF,
    ]);

    return clip;
  }
}

export { Animation };
