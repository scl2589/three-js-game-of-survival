import * as THREE from "three";

import Experience from "../Experience";

export default class Grass {
    experience: Experience;
    group: THREE.Group;
    geometry?: THREE.PlaneGeometry;
    material?: THREE.MeshStandardMaterial;
    mesh1?: THREE.Mesh;
    mesh2?: THREE.Mesh;

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();

        this.setGeometry();
        this.setTextures();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        this.geometry = new THREE.PlaneGeometry(20, 200, 10, 10);
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures.color,
            aoMap: this.textures.ambientOcclusion,
            roughnessMap: this.textures.roughness,
            metalnessMap: this.textures.metallic,
            normalMap: this.textures.normal,
            wireframe: false,
        });
    }

    setTextures() {
        this.textures.color.colorSpace = THREE.SRGBColorSpace;
        this.textures.color.repeat.set(2, 20);
        this.textures.color.wrapS = THREE.RepeatWrapping;
        this.textures.color.wrapT = THREE.RepeatWrapping;
        this.textures.normal.repeat.set(2, 20);
        this.textures.normal.wrapS = THREE.RepeatWrapping;
        this.textures.normal.wrapT = THREE.RepeatWrapping;
    }

    setMesh() {
        this.mesh1 = new THREE.Mesh(this.geometry, this.material);
        this.mesh1.rotation.x = Math.PI * -0.5
        this.mesh1.position.set(-15, 0.02, 0)

        this.mesh2 = new THREE.Mesh(this.geometry, this.material);
        this.mesh2.rotation.x = Math.PI * -0.5
        this.mesh2.position.set(15, 0.02, 0)

        this.group.add(this.mesh1, this.mesh2)
        this.gameScene.add(this.group);
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
            ambientOcclusion: this.resources.items.grassAmbientOcclusionTexture as THREE.Texture,
            roughness: this.resources.items.grassRoughnessTexture as THREE.Texture,
            metallic: this.resources.items.grassMetallicTexture as THREE.Texture,
        };
    }
}
