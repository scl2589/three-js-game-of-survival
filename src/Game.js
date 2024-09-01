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
        this.bannerInterval = 2500; // 2.5 seconds
        this.score = 10;

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
        banner1.mesh.position.set(x1, 2, 0)

        const banner2 = new Banner();
        banner2.mesh.position.set(x2, 2, 0)

        const bannerGroup = new THREE.Group();
        bannerGroup.position.z = -200

        bannerGroup.add(banner1.mesh, banner2.mesh)

        this.banners.push(bannerGroup);
        this.scene.add(bannerGroup);
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = `Score: ${this.score.toFixed(1)}`;
    }

    calculateScore(operator, value) {
        switch (operator) {
            case '+':
                this.score += value;
                break;
            case '-':
                this.score -= value;
                break;
            case 'x':
                this.score *= value;
                break;
            case '÷':
                this.score /= value;
                break;
        }

        // Update the score
        this.updateScoreDisplay();
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
        for (let i = this.banners.length - 1; i >= 0; i--) {
            const bannerGroup = this.banners[i];
            bannerGroup.position.z += bannerSpeed;

            // Check collision of each banner with the character
            for (let i = 0; i < bannerGroup.children.length; i++) {
                const banner = bannerGroup.children[i];
                if (bannerGroup.position.z === this.character.mesh.position.z && this.character.checkCollision(banner)) {
                    bannerGroup.remove(banner);
                    const bannerValue = banner.value;
                    const bannerOperator = banner.operator;
                    this.calculateScore(bannerOperator, bannerValue)
                }
            }

            // Remove banner if it's passed the character's position + 5
            if (bannerGroup.position.z > this.character.mesh.position.z + 5) {
                this.scene.remove(bannerGroup);
                this.banners.splice(i, 1);
            }
        };
    }
}
