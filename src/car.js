// car.js
// This module is responsible for creating the car, its wheels, steering wheel, and headlights.

import { keys } from './controls.js';

let carBody; 
let wheels = []; 
const forwardDir = new BABYLON.Vector3(0, 0, 1);

// Movement parameters
let maxSpeed = 20;
let acceleration = 0.1; 
let steeringSensitivity = 0.02; 
let drag = 0.95; 

let currentSpeed = 0; 
let currentSteering = 0; 

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

    // Create and attach wheels
    createWheels(scene);

    // Add a steering wheel
    const steeringWheel = BABYLON.MeshBuilder.CreateCylinder("steeringWheel", {
        diameter: 0.6,
        height: 0.05,
        tessellation: 24
    }, scene);
    const steeringMat = new BABYLON.StandardMaterial("steeringMat", scene);
    steeringMat.diffuseColor = BABYLON.Color3.Gray();
    steeringWheel.material = steeringMat;
    steeringWheel.position.set(0, 1.3, 1);  // Adjust position inside the car
    steeringWheel.rotation.x = Math.PI / 2; // Rotate to match steering orientation
    steeringWheel.parent = carBody;

    // Create headlights
    createHeadlights(scene);

    return carBody;
}

function createWheels(scene) {
    const wheelPositions = [
        new BABYLON.Vector3(1, -0.2, 1.5),
        new BABYLON.Vector3(-1, -0.2, 1.5),
        new BABYLON.Vector3(1, -0.2, -1.5),
        new BABYLON.Vector3(-1, -0.2, -1.5),
    ];

    for (let i = 0; i < wheelPositions.length; i++) {
        const wheel = BABYLON.MeshBuilder.CreateCylinder("wheel", {
            diameter: 0.6,
            height: 0.2,
            tessellation: 24
        }, scene);

        const wheelMat = new BABYLON.StandardMaterial("wheelMat", scene);
        wheelMat.diffuseColor = BABYLON.Color3.Black();
        wheel.material = wheelMat;

        wheel.position = wheelPositions[i];
        wheel.rotation.z = Math.PI / 2; 
        wheel.parent = carBody;
        wheels.push(wheel);
    }
}

function createHeadlights(scene) {
    const headlightMat = new BABYLON.StandardMaterial("headlightMat", scene);
    headlightMat.emissiveColor = BABYLON.Color3.White(); // Glowing effect

    const headlightLeft = BABYLON.MeshBuilder.CreateSphere("headlightLeft", {
        diameter: 0.4
    }, scene);
    headlightLeft.material = headlightMat;
    headlightLeft.position.set(-0.7, 0.2, -2.1); // Left front of the car
    headlightLeft.parent = carBody;

    const headlightRight = headlightLeft.clone("headlightRight");
    headlightRight.position.x = 0.7; // Right front of the car
}

function updateCarMotion() {
    if (!carBody || !carBody.physicsImpostor) return;

    if (!carBody.rotationQuaternion) {
        carBody.rotationQuaternion = new BABYLON.Quaternion();
    }

    // Smooth acceleration and deceleration
    if (keys.backward) { 
        currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
    } else if (keys.forward) { 
        currentSpeed = Math.max(currentSpeed - acceleration, -maxSpeed / 2); 
    } else {
        currentSpeed *= drag; 
    }

    // Smooth steering
    if (keys.left) {
        currentSteering = Math.max(currentSteering - steeringSensitivity, -0.2); 
    } else if (keys.right) {
        currentSteering = Math.min(currentSteering + steeringSensitivity, 0.2); 
    } else {
        currentSteering *= 0.8; 
    }

    let rotationMatrix = new BABYLON.Matrix();
    BABYLON.Matrix.FromQuaternionToRef(carBody.rotationQuaternion, rotationMatrix);
    const carForward = BABYLON.Vector3.TransformNormal(forwardDir, rotationMatrix).normalize();
    carBody.physicsImpostor.setLinearVelocity(carForward.scale(currentSpeed));

    const angularVel = carBody.physicsImpostor.getAngularVelocity().clone();
    angularVel.y = currentSteering * 5; 
    carBody.physicsImpostor.setAngularVelocity(angularVel);

    const wheelRotationSpeed = currentSpeed / (Math.PI * 0.6); 
    wheels.forEach((wheel) => {
        wheel.rotation.x += wheelRotationSpeed; 
    });
}

function attachThirdPersonCamera(scene) {
    const camera = new BABYLON.FollowCamera("FollowCamera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.radius = 10; 
    camera.heightOffset = 4; 
    camera.rotationOffset = 0; 
    camera.cameraAcceleration = 0.05; 
    camera.maxCameraSpeed = 20; 
    camera.lockedTarget = carBody; 
    scene.activeCamera = camera;
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
}

export { createCar, updateCarMotion, attachThirdPersonCamera };

