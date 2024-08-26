import * as THREE from 'three';

export class Character {
    constructor() {
        const characterGeometry = new THREE.BoxGeometry(2, 4, 2);
        const characterMaterial = new THREE.MeshBasicMaterial({ color: 'green' });

        this.mesh = new THREE.Mesh(characterGeometry, characterMaterial);
        this.mesh.position.set(0, 2, 30)
    }

    move(direction) {
        switch (direction) {
            case 'left':
                if (this.mesh.position.x <= -8) return;
                this.mesh.position.x -= 1;
                break;
            case 'right':
                if (this.mesh.position.x >= 8) return;
                this.mesh.position.x += 1;
                break;
        }
    }
}
