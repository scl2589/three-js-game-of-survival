import * as THREE from "three";

import Experience from "../Experience";
import Animation from "../Utils/Animation";
import { GLTF } from "three/examples/jsm/Addons.js";

export default class Character extends Animation {
  experience: Experience;
  initialPosition: THREE.Vector3;
  model?: THREE.Group<THREE.Object3DEventMap>;
  animationMixer?: THREE.AnimationMixer;


  constructor() {
    super();

    this.experience = Experience.getInstance();
    this.initialPosition = new THREE.Vector3(0, 0.1, 30);
    this.setModel();
    this.debug.on("open", () => this._updateDebug());
    this._updateDebug();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.position.set(0,0.1, 30)
    this.model.rotateY(Math.PI);
    this.gameScene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    const animationMixer = new THREE.AnimationMixer(this.model);
    this.setAnimations(animationMixer, {
      idle: animationMixer.clipAction(this.resource.animations[3]),
      walking: animationMixer.clipAction(this.resource.animations[13]),
      running: animationMixer.clipAction(this.resource.animations[10]),
      death: animationMixer.clipAction(this.resource.animations[0]),
      shoot: animationMixer.clipAction(this.resource.animations[12])
    });
    this.play("walking");

    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case "ArrowLeft":
          // Left pressed
            this.move('left')
          break;
        case "ArrowRight":
          // Right pressed
          this.move('right')
          break;
      }
    });

  }

  update() {
    super.update(this.time.delta * 0.001);
  }

  private _updateDebug() {
    if (!this.debug.ui) {
      return;
    }

    const debugFolder = this.debug.ui.addFolder("character");
    super.updateDebug(debugFolder);

    if (this.model) {
      debugFolder
        .add(this.model.position, "x")
        .name("posX")
        .max(4)
        .min(-4)
        .step(0.1);
      debugFolder
        .add(this.model.position, "z")
        .name("posZ")
        .max(4)
        .min(-4)
        .step(0.1);
      debugFolder
        .add(this.model.rotation, "y")
        .name("roY")
        .max(4)
        .min(-4)
        .step(0.1);
    }
  }

  move(direction: 'left' | 'right') {
    if (!this.model) return;
    switch (direction) {
      case 'left':
        if (this.model.position.x <= -8) return;
        this.model.position.x -= 1;
        break;
      case 'right':
        if (this.model.position.x >= 8) return;
        this.model.position.x += 1;
        break;
    }
  }

  checkCollision(object: THREE.Object3D) {
    if (!this.model) return;
    const characterBox = new THREE.Box3().setFromObject(this.model);
    const objectBox = new THREE.Box3().setFromObject(object);
    return characterBox.intersectsBox(objectBox);
  }

  resetPosition() {
    if (!this.model) return;
    this.model.position.copy(this.initialPosition);
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get resources() {
    return this.experience.resources;
  }

  private get resource() {
    return this.resources.items.characterModel1 as GLTF;
  }

  private get time() {
    return this.experience.time;
  }

  private get debug() {
    return this.experience.debug;
  }
}