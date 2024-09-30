import * as THREE from "three";

import Experience from "../Experience";
import Animation from "../Utils/Animation";
import { GLTF } from "three/examples/jsm/Addons.js";
import {c} from "vite/dist/node/types.d-aGj9QkWt";

interface Bullet {
  mesh: THREE.Mesh;
  raycaster: THREE.Raycaster;
}

export default class Character extends Animation {
  experience: Experience;
  initialPosition: THREE.Vector3;
  model?: THREE.Group<THREE.Object3DEventMap>;
  animationMixer?: THREE.AnimationMixer;
  // bullets?: Bullet[];
  bullets: [];


  constructor() {
    super();

    this.experience = Experience.getInstance();
    this.initialPosition = new THREE.Vector3(0, 0.1, 30);
    this.bullets = [];
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
      switch (e.code) {
        case "ArrowLeft":
          // Left pressed
            this.move('left')
          break;
        case "ArrowRight":
          // Right pressed
          this.move('right')
          break;
        case "Space":
          // Space pressed
          this.shoot();
          break;
      }
    });

  }

  update() {
    super.update(this.time.delta * 0.001);

    // Move each bullet forward and check for intersections
    if (this.bullets) {
      this.bullets.forEach(bullet => {
        // const { mesh: bullet, raycaster } = bulletObj;

        // Move the bullet forward
        bullet.position.z -= 0.1;

        // // Update the raycaster's position to the current bullet position
        // raycaster.set(bullet.position, new THREE.Vector3(0, 0, -1));

        // // Check for intersections with objects, excluding the bullet itself
        // const intersects = raycaster.intersectObjects(this.gameScene.children, true)
        //     .filter(intersect => intersect.object !== bullet); // Exclude the bullet from intersections
        //
        // if (intersects.length > 0) {
        //   const hitObject = intersects[0].object;
        //   console.log('Bullet hit:', hitObject);
        //
        //   // Remove bullet from scene on hit
        //   // this.gameScene.remove(bullet);
        //   this.bullets = this.bullets.filter(b => b.mesh !== bullet);
        // }
        //
        // // Remove bullet if out of bounds
        if (bullet.position.z === -150) {
          this.gameScene.remove(bullet);
        }
      });
    }
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

  shoot() {
    if (!this.model) return;
    // make bullet geometry
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 'black' });
    const bullet = new THREE.Mesh(geometry, material);
    bullet.position.copy(this.model.position);
    bullet.position.y += 2;
    bullet.position.z -= 3;
    //
    // // Add raycaster to the bullet
    // const raycaster = new THREE.Raycaster();
    // const bulletDirection = new THREE.Vector3(0, 0, -1);
    // raycaster.set(bullet.position, bulletDirection);
    // console.log(bulletDirection)

    if (this.bullets) {
      // add bullet to scene
      // this.bullets.push({mesh: bullet, raycaster: raycaster});
      this.bullets.push(bullet)
      this.gameScene.add(bullet);
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
