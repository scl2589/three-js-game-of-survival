import * as THREE from "three";

import Experience from "../Experience";

export default class Environment {
  experience: Experience;
  directionalLight?: THREE.DirectionalLight;
  ambientLight?: THREE.AmbientLight;
  environmentMap?: {
    intensity: number;
    texture: THREE.Texture;
    updateMaterials: () => void;
  }

  constructor() {
    this.experience = Experience.getInstance();
    this.setLight();
    this.setEnvironmentMap();
    this.debug.on("open", () => this._updateDebug());
    this._updateDebug();
  }

  setLight() {
    this.directionalLight = new THREE.DirectionalLight("#ffffff", 4);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.far = 15;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.normalBias = 0.05;
    this.directionalLight.position.set(5, 10, 7.5);
    this.gameScene.add(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.gameScene.add(this.ambientLight)

  }

  setEnvironmentMap() {
    this.environmentMap = {
      intensity: 0.4,
      texture: this.resource,
      updateMaterials: () => this._updateMaterials(),
    };

    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;
    this.environmentMap.updateMaterials();
    this.gameScene.environment = this.environmentMap.texture;
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get resources() {
    return this.experience.resources;
  }

  private get resource() {
    return this.resources.items.environmentMapTexture as THREE.Texture;
  }

  private get debug() {
    return this.experience.debug;
  }

  private _updateDebug() {
    if (!this.debug.ui) {
      return;
    }

    const debugFolder = this.debug.ui.addFolder("environment");

    if (this.directionalLight) {
      debugFolder
        .add(this.directionalLight, "intensity")
        .name("sunLightIntensity")
        .min(0)
        .max(10)
        .step(0.001);

      debugFolder
        .add(this.directionalLight.position, "x")
        .name("sunLightX")
        .min(-5)
        .max(5)
        .step(0.001);

      debugFolder
        .add(this.directionalLight.position, "y")
        .name("sunLightY")
        .min(-5)
        .max(5)
        .step(0.001);

      debugFolder
        .add(this.directionalLight.position, "z")
        .name("sunLightZ")
        .min(-5)
        .max(5)
        .step(0.001);
    }

    if (this.environmentMap) {
      debugFolder
        .add(this.environmentMap, "intensity")
        .name("envMapIntensity")
        .min(0)
        .max(4)
        .step(0.001)
        .onChange(this.environmentMap.updateMaterials);
    }
  }

  private _updateMaterials() {
    this.gameScene.traverse((child) => {
      if (!this.environmentMap) {
        return;
      }

      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.envMap = this.environmentMap.texture;
        child.material.envMapIntensity = this.environmentMap.intensity;
        child.material.needsUpdate = true;
      }
    });
  }
}
