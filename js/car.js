export class Car {
  constructor(scene, position) {
    this.scene = scene;
    this.position = position || new BABYLON.Vector3(0, 1, 0);

    this.body = this.createCarBody();
    this.setupPhysics();
    this.steeringAngle = 0; // Track steering angle for Ackermann steering
    this.maxSteeringAngle = Math.PI / 6; // Max steering angle (~30 degrees)
  }

  createCarBody() {
    const carBody = BABYLON.MeshBuilder.CreateBox('carBody', { width: 2, height: 0.5, depth: 4 }, this.scene);
    carBody.position = this.position;

    const material = new BABYLON.StandardMaterial('carMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
    carBody.material = material;

    return carBody;
  }

  setupPhysics() {
    this.body.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 5, friction: 0.5, restitution: 0.2 },
      this.scene
    );
  }

  applyControls(inputMap) {
    const maxForce = 2; // Maximum force applied to the car
    const forwardForce = new BABYLON.Vector3(0, 0, maxForce); // Inverted forward force
    const backwardForce = new BABYLON.Vector3(0, 0, -maxForce); // Inverted backward force
    const leftSteering = -this.maxSteeringAngle; // Left turn
    const rightSteering = this.maxSteeringAngle; // Right turn

    this.scene.onBeforeRenderObservable.add(() => {
      // Apply forward or backward forces (inverted acceleration)
      if (inputMap['w']) {
        this.body.physicsImpostor.applyImpulse(forwardForce, this.body.getAbsolutePosition());
      }
      if (inputMap['s']) {
        this.body.physicsImpostor.applyImpulse(backwardForce, this.body.getAbsolutePosition());
      }

      // Update steering angle
      if (inputMap['a']) {
        this.steeringAngle = BABYLON.Scalar.Clamp(this.steeringAngle + 0.02, leftSteering, rightSteering);
      } else if (inputMap['d']) {
        this.steeringAngle = BABYLON.Scalar.Clamp(this.steeringAngle - 0.02, leftSteering, rightSteering);
      } else {
        // Slowly return wheels to center when no keys are pressed
        this.steeringAngle *= 0.9;
      }

      // Apply steering (rotate the body for simplicity)
      this.body.rotation.y = this.steeringAngle;
    });
  }
}
