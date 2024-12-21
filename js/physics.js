export const initializePhysics = async (scene) => {
    // Wait for Ammo.js to be ready
    const ammo = await Ammo(); // Ensure Ammo.js is fully loaded before proceeding
  
    const physicsPlugin = new BABYLON.AmmoJSPlugin(true, ammo);
    const gravityVector = new BABYLON.Vector3(0, -9.8, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);
  
    return physicsPlugin;
  };
  