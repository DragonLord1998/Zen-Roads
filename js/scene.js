import { Car } from './car.js';

export const createScene = async (engine, canvas) => {
  const scene = new BABYLON.Scene(engine);

  // Add a camera
  const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Add a light
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  // Wait for Ammo.js to be ready
  const ammo = await Ammo();
  const physicsPlugin = new BABYLON.AmmoJSPlugin(true, ammo);
  scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), physicsPlugin);

  // Add ground with physics impostor
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
  ground.position.y = 0; // Ensure the ground is at y = 0
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor, // Make the ground static
    { mass: 0, friction: 1, restitution: 0.5 },
    scene
  );

  // Create the car
  const car = new Car(scene, new BABYLON.Vector3(0, 1, 0)); // Car starts above the ground

  // Capture keyboard inputs
  const inputMap = {};
  scene.actionManager = new BABYLON.ActionManager(scene);

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
      inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    })
  );

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
      inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    })
  );

  // Apply car controls
  car.applyControls(inputMap);

  return scene;
};
