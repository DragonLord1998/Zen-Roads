// car.js
// This module is responsible for creating the car, setting up its physics, and updating its motion.

import { keys } from './controls.js';

let carBody; // will hold the reference to the car mesh and its impostor
const forwardDir = new BABYLON.Vector3(0,0,1);

// Movement parameters (adjust as needed)
let accelerationForce = 1000;
let steeringIncrement = 0.05;

function createCar(scene) {
    // Create the car body
    carBody = BABYLON.MeshBuilder.CreateBox("carBody", {width:2, height:0.5, depth:4}, scene);
    const carMat = new BABYLON.StandardMaterial("carMat", scene);
    carMat.diffuseColor = BABYLON.Color3.Blue();
    carBody.material = carMat;
    carBody.position.set(0, 1, 0);

    carBody.physicsImpostor = new BABYLON.PhysicsImpostor(
        carBody,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 50, friction:0.8, restitution:0.1 },
        scene
    );

    // Add wheels (visual only)
    const wheelMat = new BABYLON.StandardMaterial("wheelMat", scene);
    wheelMat.diffuseColor = BABYLON.Color3.Black();
    const wheelPositions = [
        new BABYLON.Vector3(1, -0.2, 1.5),
        new BABYLON.Vector3(-1, -0.2, 1.5),
        new BABYLON.Vector3(1, -0.2, -1.5),
        new BABYLON.Vector3(-1, -0.2, -1.5)
    ];
    for (let i = 0; i < wheelPositions.length; i++) {
        const wheel = BABYLON.MeshBuilder.CreateCylinder("wheel"+i, {diameter:0.5, height:0.2}, scene);
        wheel.material = wheelMat;
        wheel.position = wheelPositions[i];
        wheel.parent = carBody;
    }

    return carBody;
}

function updateCarMotion() {
    if (!carBody || !carBody.physicsImpostor) return;

    if (!carBody.rotationQuaternion) {
        carBody.rotationQuaternion = new BABYLON.Quaternion();
    }

    let rotationMatrix = new BABYLON.Matrix();
    BABYLON.Matrix.FromQuaternionToRef(carBody.rotationQuaternion, rotationMatrix);

    const carForward = BABYLON.Vector3.TransformNormal(forwardDir, rotationMatrix).normalize();

    // Apply forward/backward force
    if (keys.forward) {
        carBody.physicsImpostor.applyForce(carForward.scale(accelerationForce), carBody.getAbsolutePosition());
    }
    if (keys.backward) {
        carBody.physicsImpostor.applyForce(carForward.scale(-accelerationForce), carBody.getAbsolutePosition());
    }

    // Simulate turning by adjusting angular velocity
    const angularVel = carBody.physicsImpostor.getAngularVelocity().clone();
    if (keys.left) {
        angularVel.y += steeringIncrement;
    }
    if (keys.right) {
        angularVel.y -= steeringIncrement;
    }
    carBody.physicsImpostor.setAngularVelocity(angularVel);
}

function attachCamera(scene) {
    const camera = new BABYLON.UniversalCamera("carCamera", new BABYLON.Vector3(0, 1, -1.5), scene);
    camera.parent = carBody; 
    camera.minZ = 0.1;
    scene.activeCamera = camera;
    scene.activeCamera.attachControl(scene.getEngine().getRenderingCanvas(), true);
}

export { createCar, updateCarMotion, attachCamera };
