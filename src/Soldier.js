import * as THREE from 'three';

export class Soldier {
    constructor(color, name) {
        const soldierGeometry = new THREE.BoxGeometry(2, 4, 2);
        const soldierMaterial = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(soldierGeometry, soldierMaterial);
        this.mesh.name = name;
        this.mesh.position.y = 2; // Position the soldier above the ground
    }

    move(direction, distance) {
        switch (direction) {
            case 'forward':
                this.mesh.position.z -= distance;
                break;
            case 'backward':
                this.mesh.position.z += distance;
                break;
            case 'left':
                this.mesh.position.x -= distance;
                break;
            case 'right':
                this.mesh.position.x += distance;
                break;
        }
    }
}
