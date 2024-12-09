// car.js
// This module is responsible for creating the car, its wheels, and updating their motion.

import { keys } from './controls.js';

let carBody; // The car mesh
let wheels = []; // Array to store wheel meshes
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

    // Add wheels
    const wheelPositions = [
        new BABYLON.Vector3(1, -0.2, 1.5),
        new BABYLON.Vector3(-1, -0.2, 1.5),
        new BABYLON.Vector3(1, -0.2, -1.5),
        new BABYLON.Vector3(-1, -0.2, -1.5),
    ];
    for (let i = 0; i < wheelPositions.length; i++) {
        const wheel = createWheel(scene);
        wheel.position = wheelPositions[i];
        wheel.rotation.z = Math.PI / 2; // Rotate wheels to align with the car
        wheel.parent = carBody; // Attach to the car body
        wheels.push(wheel);
    }

    return carBody;
}

function createWheel(scene) {
    // Create the tire (outer cylinder)
    const tire = BABYLON.MeshBuilder.CreateCylinder("tire", { diameter: 0.6, height: 0.2, tessellation: 24 }, scene);
    const tireMat = new BABYLON.StandardMaterial("tireMat", scene);
    tireMat.diffuseColor = BABYLON.Color3.Black(); // Black for the tire
    tire.material = tireMat;

    // Create the rim (inner torus)
    const rim = BABYLON.MeshBuilder.CreateTorus("rim", { diameter: 0.5, thickness: 0.08, tessellation: 24 }, scene);
    const rimMat = new BABYLON.StandardMaterial("rimMat", scene);
    rimMat.diffuseColor = BABYLON.Color3.Gray(); // Gray for the rim
    rim.material = rimMat;
    rim.parent = tire; // Attach the rim to the tire

    // Offset the rim slightly to make it visible inside the tire
    rim.position.y = 0.01;

    // Add spokes to the rim
    const spokeCount = 8; // Increase the number of spokes for better detail
    for (let i = 0; i < spokeCount; i++) {
        const spoke = BABYLON.MeshBuilder.CreateBox("spoke", { width: 0.05, height: 0.05, depth: 0.4 }, scene);
        const spokeMat = new BABYLON.StandardMaterial("spokeMat", scene);
        spokeMat.diffuseColor = BABYLON.Color3.Gray(); // Gray spokes
        spoke.material = spokeMat;

        // Rotate and position the spokes evenly around the rim
        spoke.rotation.z = (Math.PI * 2 * i) / spokeCount;
        spoke.position.x = Math.cos((Math.PI * 2 * i) / spokeCount) * 0.25; // Offset from center
        spoke.position.z = Math.sin((Math.PI * 2 * i) / spokeCount) * 0.25; // Offset from center
        spoke.parent = rim; // Attach to the rim
    }

    return tire; // Return the entire wheel assembly
}

function updateCarMotion() {
    if (!carBody || !carBody.physicsImpostor) return;

    if (!carBody.rotationQuaternion) {
        carBody.rotationQuaternion = new BABYLON.Quaternion();
    }

    // Smooth acceleration and deceleration
    if (keys.backward) { // Inverted: Backward key increases forward speed
        currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
    } else if (keys.forward) { // Inverted: Forward key decreases speed (reverse)
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

    // Spin the wheels based on the car's speed
    const wheelRotationSpeed = currentSpeed / (Math.PI * 0.6); // Adjust rotation based on speed and wheel size
    wheels.forEach((wheel) => {
        wheel.rotation.x += wheelRotationSpeed; // Spin the wheel along the X-axis
    });
}

function attachThirdPersonCamera(scene) {
    const camera = new BABYLON.FollowCamera("FollowCamera", new BABYLON.Vector3(0, 5, -10), scene);
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
