export const setupEnvironment = (scene) => {
    // Load HDR environment texture
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
      "https://playground.babylonjs.com/textures/environment.dds",
      scene
    );
    scene.environmentTexture = hdrTexture;
  
    // Create skybox
    scene.createDefaultSkybox(hdrTexture, true, 1000);
  
    // Adjust environment intensity
    scene.environmentIntensity = 1.0;
  };
  