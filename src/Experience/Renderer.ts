import * as THREE from "three";

import Experience from "./Experience";

export default class Renderer {
  experience: Experience;
  instance?: THREE.WebGLRenderer;

  constructor() {
    this.experience = Experience.getInstance();

    this.setInstance();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.instance.toneMapping = THREE.CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor("#211d20");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  resize() {
    if (!this.instance) {
      return;
    }
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    if (!this.instance || !this.camera.instance) {
      return;
    }
    this.instance.render(this.gameScene, this.camera.instance);
  }

  dispose() {
    if (!this.instance) {
      return;
    }
    this.instance.dispose();
  }

  get canvas() {
    return this.experience.canvas;
  }
  get sizes() {
    return this.experience.sizes;
  }
  get gameScene() {
    return this.experience.gameScene;
  }
  get camera() {
    return this.experience.camera;
  }
}
