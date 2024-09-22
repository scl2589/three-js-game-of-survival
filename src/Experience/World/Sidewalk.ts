import * as THREE from "three";

import Experience from "../Experience";

export default class Sidewalk {
    experience: Experience;
    group: THREE.Group;
    geometry?: THREE.BoxGeometry;
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
        this.geometry = new THREE.BoxGeometry(10, 200, 2);
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            map: this.textures.color,
            aoMap: this.textures.arm,
            roughnessMap: this.textures.arm,
            metalnessMap: this.textures.arm,
            normalMap: this.textures.normal,
            displacementMap: this.textures.displacement,
            displacementScale: 0.3,
            displacementBias: -0.2,
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
        this.mesh1.position.set(-30, 0, 0)

        this.mesh2 = new THREE.Mesh(this.geometry, this.material);
        this.mesh2.rotation.x = Math.PI * -0.5
        this.mesh2.position.set(30, 0, 0)

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
            color: this.resources.items.sidewalkColorTexture as THREE.Texture,
            normal: this.resources.items.sidewalkNormalTexture as THREE.Texture,
            arm: this.resources.items.sidewalkARMTexture as THREE.Texture,
            displacement: this.resources.items.sidewalkDisplacementTexture as THREE.Texture,
        };
    }
}
