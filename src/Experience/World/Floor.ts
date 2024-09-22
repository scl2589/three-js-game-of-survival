import * as THREE from "three";

import Experience from "../Experience";

export default class Floor {
  experience: Experience;
  geometry?: THREE.CircleGeometry;
  material?: THREE.MeshStandardMaterial;
  mesh?: THREE.Mesh;

  constructor() {
    this.experience = Experience.getInstance();

    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.CircleGeometry(5, 64);
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      map: this.textures.color,
      normalMap: this.textures.normal,
    });
  }

  setTextures() {
    this.textures.color.colorSpace = THREE.SRGBColorSpace;
    this.textures.color.repeat.set(1.5, 1.5);
    this.textures.color.wrapS = THREE.RepeatWrapping;
    this.textures.color.wrapT = THREE.RepeatWrapping;
    this.textures.normal.repeat.set(1.5, 1.5);
    this.textures.normal.wrapS = THREE.RepeatWrapping;
    this.textures.normal.wrapT = THREE.RepeatWrapping;
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.receiveShadow = true;

    this.gameScene.add(this.mesh);
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get resources() {
    return this.experience.resources;
  }

  private get textures() {
    return {
      color: this.resources.items.grassColorTexture as THREE.Texture,
      normal: this.resources.items.grassNormalTexture as THREE.Texture,
    };
  }
}
