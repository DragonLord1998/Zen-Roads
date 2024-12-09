// app.js
// Main entry point of the application.

import { createCar, updateCarMotion, attachThirdPersonCamera } from './car.js';

document.addEventListener("DOMContentLoaded", async function () {
    const canvas = document.getElementById("renderCanvas");

    // Initialize Babylon.js engine and scene
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Load Ammo.js for physics
    await Ammo();
    const physicsPlugin = new BABYLON.AmmoJSPlugin(true);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

    // Lighting setup
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(10, 15, 10);
    dirLight.intensity = 1.2;

    // Shadow generator setup
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.bias = 0.001;

    // Ground creation
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
    ground.receiveShadows = true;

    // Function to create cubes with collisions
    function createCubes(scene, shadowGenerator) {
        for (let i = 0; i < 5; i++) {
            const cube = BABYLON.MeshBuilder.CreateBox(`cube${i}`, { size: 2 }, scene);

            const cubeMat = new BABYLON.StandardMaterial(`cubeMat${i}`, scene);
            cubeMat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            cube.material = cubeMat;

            // Randomize cube position
            cube.position.set(
                Math.random() * 20 - 10,  // X between -10 and 10
                3,                       // Y height to let cubes fall
                Math.random() * 20 - 10  // Z between -10 and 10
            );

            // Add physics impostor for collisions
            cube.physicsImpostor = new BABYLON.PhysicsImpostor(
                cube,
                BABYLON.PhysicsImpostor.BoxImpostor,
                { mass: 2, friction: 0.8, restitution: 0.5 },
                scene
            );

            // Enable shadows for the cube
            cube.receiveShadows = true;
            shadowGenerator.addShadowCaster(cube);
        }
    }

    // Create the cubes with collisions
    createCubes(scene, shadowGenerator);

    // Create the car and attach camera
    const carBody = createCar(scene);
    attachThirdPersonCamera(scene);

    // Enable shadows for the car
    carBody.receiveShadows = true;
    shadowGenerator.addShadowCaster(carBody);

    // Background environment color
    scene.clearColor = new BABYLON.Color3(0.7, 0.8, 1); // Sky-blue background

    // Render loop
    engine.runRenderLoop(() => {
        updateCarMotion();
        scene.render();
    });

    // Handle window resizing
    window.addEventListener("resize", () => {
        engine.resize();
    });
});
