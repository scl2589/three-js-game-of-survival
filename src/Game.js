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

    createBanner() {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
        const color = colors[Math.floor(Math.random() * colors.length)];


        const operators = ['x', '+', '-', '÷'];
        const value = Math.ceil(Math.random() * 10);
        const operator = operators[Math.floor(Math.random() * operators.length)];

        const banner = new Banner(color, operator, value);
        banner.mesh.position.set(Math.random() * 16 - 8, 2, -200); // Random x position
        this.banners.push(banner);
        this.scene.add(banner.mesh);
    }

    animate(time) {
        const speed = 0.15;
        this.roadSets.forEach((roadSet) => roadSet.move(speed));

        // Check if it's time to create new banners
        if (time - this.lastBannerTime > this.bannerInterval) {
            this.createBanner();
            this.createBanner();
            this.lastBannerTime = time;
        }

        // Move banners
        const bannerSpeed = 0.5;
        this.banners.forEach((banner, index) => {
            banner.mesh.position.z += bannerSpeed;

            // Remove banner if it's passed the camera
            if (banner.mesh.position.z > 10) {
                this.scene.remove(banner.mesh);
                this.banners.splice(index, 1);
            }
        });
    }
}
