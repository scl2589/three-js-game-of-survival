import * as THREE from "three";

import Experience from "../Experience";

export default class Sidewalk {
    experience: Experience;
    geometry?: THREE.PlaneGeometry;
    material?: THREE.MeshStandardMaterial;
    mesh: THREE.Mesh;

    constructor() {
        this.experience = Experience.getInstance();
        this.mesh = new THREE.Mesh();

        this.setGeometry();
        this.setTextures();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        this.geometry = new THREE.PlaneGeometry(20, 200);
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures.color,
            normalMap: this.textures.normal,
            aoMap: this.textures.ambientOcclusion,
            roughnessMap: this.textures.roughness,
            displacementMap: this.textures.displacement,
            displacementScale: 0.1,
            displacementBias: -0.2,
        });
    }

    setTextures() {
        this.textures.color.colorSpace = THREE.SRGBColorSpace;
        this.textures.color.repeat.set(3, 20);
        this.textures.color.wrapS = THREE.RepeatWrapping;
        this.textures.color.wrapT = THREE.RepeatWrapping;
        this.textures.normal.repeat.set(3, 20);
        this.textures.normal.wrapS = THREE.RepeatWrapping;
        this.textures.normal.wrapT = THREE.RepeatWrapping;
        this.textures.displacement.repeat.set(3, 20);
        this.textures.displacement.wrapS = THREE.RepeatWrapping;
        this.textures.displacement.wrapT = THREE.RepeatWrapping;
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI * -0.5;
        this.mesh.position.y = 0.3; // Avoid z-fighting
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
            color: this.resources.items.roadColorTexture as THREE.Texture,
            normal: this.resources.items.roadNormalTexture as THREE.Texture,
            ambientOcclusion: this.resources.items.roadAmbientOcclusionTexture as THREE.Texture,
            roughness: this.resources.items.roadRoughnessTexture as THREE.Texture,
            displacement: this.resources.items.roadDisplacementTexture as THREE.Texture,
        };
    }
}
