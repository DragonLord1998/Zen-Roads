// app.js
// Main entry point of the application.
// Sets up the Babylon.js engine, scene, physics, ground, and then creates and updates the car.

import { createCar, updateCarMotion, attachThirdPersonCamera } from './car.js';

document.addEventListener("DOMContentLoaded", async function () {
    const canvas = document.getElementById("renderCanvas");

    // Use the standard Babylon.js Engine for stability
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Wait for Ammo.js to be ready
    await Ammo();
    console.log("Ammo.js loaded and ready.");

    // Enable physics with Ammo.js
    const physicsPlugin = new BABYLON.AmmoJSPlugin(true);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);
    console.log("Physics enabled.");

    // Add a light
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;
    hemiLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);

    // Create a directional light for shadows (like the sun)
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(10, 15, 10);
    dirLight.intensity = 1.2;

    // Create a shadow generator
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.bias = 0.001;

    // Create a ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = BABYLON.Color3.Green();
    ground.material = groundMat;

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 0.8, restitution: 0.2 },
        scene
    );

    // Make the ground receive shadows
    ground.receiveShadows = true;

    // Function to create cubes with collisions
    function createCubes(scene) {
        for (let i = 0; i < 5; i++) {
            const cube = BABYLON.MeshBuilder.CreateBox(`cube${i}`, { size: 2 }, scene);
            const cubeMat = new BABYLON.StandardMaterial(`cubeMat${i}`, scene);
            cubeMat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            cube.material = cubeMat;

            // Randomize cube position
            cube.position.set(
                Math.random() * 20 - 10, // X between -10 and 10
                1,                      // Y
                Math.random() * 20 - 10 // Z between -10 and 10
            );

            // Add physics impostor for collisions
            cube.physicsImpostor = new BABYLON.PhysicsImpostor(
                cube,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 1, friction: 0.8, restitution: 0.5 },
                scene
            );

            // Enable shadows for the cube
            cube.receiveShadows = true;
            shadowGenerator.addShadowCaster(cube);
        }
    }

    // Add the cubes to the scene
    createCubes(scene);

    // Create the car and attach a third-person camera
    const carBody = createCar(scene);
    attachThirdPersonCamera(scene);

    // Enable shadows on the car
    carBody.receiveShadows = true;
    shadowGenerator.addShadowCaster(carBody);

    // Adjust background for a better look
    scene.clearColor = new BABYLON.Color3(0.7, 0.8, 1); // Light sky-blue background

    // Run the render loop
    engine.runRenderLoop(() => {
        updateCarMotion();
        scene.render();
    });

    // Handle window resize
    window.addEventListener("resize", () => {
        engine.resize();
    });
});
