import * as THREE from 'three';
import { RoadSet } from './RoadSet.js';
import { Soldier } from './Soldier.js';
import { Character } from './Character.js';

export class Game {
    constructor(textureLoader, scene) {
        this.textureLoader = textureLoader;
        this.scene = scene;
        this.roadSets = [];
        this.soldiers = new THREE.Group();

        this.initSoldiers();
        this.initRoadSets();
        this.initCharacter();
    }

    initCharacter() {
        this.character = new Character();
        this.scene.add(this.character.mesh);
    }

    // Initialize soldiers and add them to the scene
    initSoldiers() {
        const redSoldier = new Soldier('pink', 'RedSoldier');
        redSoldier.mesh.position.set(-8, 2, -100);
        this.soldiers.add(redSoldier.mesh);

        const blueSoldier = new Soldier(0x0000ff, 'BlueSoldier');
        blueSoldier.mesh.position.set(8, 2, -100);
        this.soldiers.add(blueSoldier.mesh);

        this.scene.add(this.soldiers);
    }

    // Initialize road sets and add them to the scene
    initRoadSets() {
        const numberOfRoadSets = 3;
        const initialPositionZ = -200;
        const spacing = 200;

        for (let i = 0; i < numberOfRoadSets; i++) {
            const roadSet = new RoadSet(this.textureLoader);
            roadSet.group.position.z = initialPositionZ + i * spacing;
            this.roadSets.push(roadSet);
            this.scene.add(roadSet.group);
        }
    }

    animate() {
        const speed = 0.15;
        this.roadSets.forEach((roadSet) => roadSet.move(speed));
    }
}
