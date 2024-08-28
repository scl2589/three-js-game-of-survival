import * as THREE from 'three';
import { RoadSet } from './RoadSet.js';
import { Soldier } from './Soldier.js';
import { Character } from './Character.js';
import {Banner} from './Banner.js'


export class Game {
    constructor(textureLoader, scene) {
        this.textureLoader = textureLoader;
        this.scene = scene;
        this.roadSets = [];
        this.soldiers = new THREE.Group();
        this.banners = [];
        this.lastBannerTime = 0;
        this.bannerInterval = 2500; // 2.5seconds

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

    createBanners() {
        const minX = -10;
        const maxX = 5;
        const bannerWidth = 5;
        const minDistance = bannerWidth + 1; // buffer in between the banners

        const [x1, x2] = Banner.getNonOverlappingPositions(minX, maxX, minDistance);

        const banner1 = new Banner();
        banner1.mesh.position.set(x1, 2, -200)

        const banner2 = new Banner();
        banner2.mesh.position.set(x2, 2, -200)

        this.banners.push(banner1, banner2);
        this.scene.add(banner1.mesh, banner2.mesh);
    }

    animate(time) {
        const speed = 0.15;
        this.roadSets.forEach((roadSet) => roadSet.move(speed));

        // Check if it's time to create new banners
        if (time - this.lastBannerTime > this.bannerInterval) {
            this.createBanners();
            this.lastBannerTime = time;
        }

        // Move banners
        const bannerSpeed = 0.5;
        this.banners.forEach((banner, index) => {
            banner.mesh.position.z += bannerSpeed;

            // Remove banner if it's passed the character's position + 5
            if (banner.mesh.position.z > this.character.mesh.position.z + 5) {
                this.scene.remove(banner.mesh);
                this.banners.splice(index, 1);
            }
        });
    }
}
