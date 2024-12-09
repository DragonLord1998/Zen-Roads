// car.js
// This module is responsible for creating the car, setting up its physics, and updating its motion.

import { keys } from './controls.js';

let carBody; // The car mesh
let camera; // The third-person follow camera

const forwardDir = new BABYLON.Vector3(0, 0, 1);

// Movement parameters
let maxSpeed = 20; // Maximum speed
let acceleration = 0.1; // Acceleration increment
let steeringSensitivity = 0.02; // Steering sensitivity
let drag = 0.95; // Friction-like drag for smooth stops

let currentSpeed = 0; // Current forward/backward speed
let currentSteering = 0; // Current steering angle

function createCar(scene) {
    // Create the car body
    carBody = BABYLON.MeshBuilder.CreateBox("carBody", { width: 2, height: 0.5, depth: 4 }, scene);
    const carMat = new BABYLON.StandardMaterial("carMat", scene);
    carMat.diffuseColor = BABYLON.Color3.Blue();
    carBody.material = carMat;
    carBody.position.set(0, 1, 0);

    carBody.physicsImpostor = new BABYLON.PhysicsImpostor(
        carBody,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 50, friction: 0.8, restitution: 0.1 },
        scene
    );

    // Add wheels (visual only)
    const wheelMat = new BABYLON.StandardMaterial("wheelMat", scene);
    wheelMat.diffuseColor = BABYLON.Color3.Black();
    const wheelPositions = [
        new BABYLON.Vector3(1, -0.2, 1.5),
        new BABYLON.Vector3(-1, -0.2, 1.5),
        new BABYLON.Vector3(1, -0.2, -1.5),
        new BABYLON.Vector3(-1, -0.2, -1.5),
    ];
    for (let i = 0; i < wheelPositions.length; i++) {
        const wheel = BABYLON.MeshBuilder.CreateCylinder("wheel" + i, { diameter: 0.5, height: 0.2 }, scene);
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

    // Smooth acceleration and deceleration
    if (keys.forward) {
        currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
    } else if (keys.backward) {
        currentSpeed = Math.max(currentSpeed - acceleration, -maxSpeed / 2); // Reverse speed limit
    } else {
        currentSpeed *= drag; // Apply drag when no keys are pressed
    }

    // Smooth steering
    if (keys.left) {
        currentSteering = Math.max(currentSteering - steeringSensitivity, -0.2); // Left turn limit
    } else if (keys.right) {
        currentSteering = Math.min(currentSteering + steeringSensitivity, 0.2); // Right turn limit
    } else {
        currentSteering *= 0.8; // Return to center steering gradually
    }

    // Apply forward motion
    let rotationMatrix = new BABYLON.Matrix();
    BABYLON.Matrix.FromQuaternionToRef(carBody.rotationQuaternion, rotationMatrix);
    const carForward = BABYLON.Vector3.TransformNormal(forwardDir, rotationMatrix).normalize();
    carBody.physicsImpostor.setLinearVelocity(carForward.scale(currentSpeed));

    // Apply steering
    const angularVel = carBody.physicsImpostor.getAngularVelocity().clone();
    angularVel.y = currentSteering * 5; // Apply steering as angular velocity
    carBody.physicsImpostor.setAngularVelocity(angularVel);
}

function attachThirdPersonCamera(scene) {
    camera = new BABYLON.FollowCamera("FollowCamera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.radius = 10; // Distance from the car
    camera.heightOffset = 4; // Height above the car
    camera.rotationOffset = 0; // Angle to the car
    camera.cameraAcceleration = 0.05; // How quickly the camera follows the car
    camera.maxCameraSpeed = 20; // Max follow speed
    camera.lockedTarget = carBody; // Attach the camera to the car
    scene.activeCamera = camera;
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
}

export { createCar, updateCarMotion, attachThirdPersonCamera };
