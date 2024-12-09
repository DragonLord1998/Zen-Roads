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
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

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

    // Create the car and attach a third-person camera
    const carBody = createCar(scene);
    attachThirdPersonCamera(scene);

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
