import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Experience from "./Experience";

export default class Camera {
  experience: Experience;
  instance?: THREE.PerspectiveCamera;
  controls?: OrbitControls;

  constructor() {
    this.experience = Experience.getInstance();

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      150
    );
    this.instance.position.set(0, 200, 800);
    this.gameScene.add(this.instance);
  }
  setOrbitControls() {
    if (!this.instance) {
      return;
    }
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.minPolarAngle = Math.PI / 2.25;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
  }

  resize() {
    if (!this.instance) {
      return;
    }
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (!this.controls) {
      return;
    }
    this.controls.update();
  }

  dispose() {
    if (!this.controls) {
      return;
    }
    this.controls.dispose();
  }

  get sizes() {
    return this.experience.sizes;
  }
  get gameScene() {
    return this.experience.gameScene;
  }
  get canvas() {
    return this.experience.canvas;
  }
}
