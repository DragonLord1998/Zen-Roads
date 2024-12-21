import { createScene } from './scene.js';

const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas, true);

async function initApp() {
  const scene = await createScene(engine, canvas);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
}

initApp();
