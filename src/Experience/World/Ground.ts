import * as THREE from "three";

import Experience from "../Experience";

export default class Ground {
    experience: Experience;
    geometry?: THREE.PlaneGeometry;
    material?: THREE.MeshBasicMaterial;
    mesh: THREE.Mesh;

    constructor() {
        this.experience = Experience.getInstance();
        this.mesh = new THREE.Mesh();

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        this.geometry = new THREE.PlaneGeometry(200, 200, 10, 10);
    }

    setMaterial() {
        this.material = new THREE.MeshBasicMaterial({
            color: '#FFFFFF',
            wireframe: false,
        });
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = -Math.PI * 0.5;

        this.gameScene.add(this.mesh);
    }

    private get gameScene() {
        return this.experience.gameScene;
    }

}
