export const setupControls = (scene) => {
    const inputMap = {}; 
    const car = scene.car; 
 
    scene.actionManager = new BABYLON.ActionManager(scene); 
    scene.actionManager.registerAction( 
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            inputMap[evt.sourceEvent.key] = true; 
        }) 
    ); 
    scene.actionManager.registerAction( 
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            inputMap[evt.sourceEvent.key] = false; 
        }) 
    ); 
 
    scene.onBeforeRenderObservable.add(() => {
        const carForce = 5; 
        if (inputMap['w']) { 
            car.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0, -carForce), car.getAbsolutePosition()); 
        } 
        if (inputMap['s']) { 
            car.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0, carForce), car.getAbsolutePosition()); 
        } 
        if (inputMap['a']) { 
            car.physicsImpostor.applyImpulse(new BABYLON.Vector3(-carForce, 0, 0), car.getAbsolutePosition()); 
        } 
        if (inputMap['d']) { 
            car.physicsImpostor.applyImpulse(new BABYLON.Vector3(carForce, 0, 0), car.getAbsolutePosition()); 
        } 
    }); 
}; 
