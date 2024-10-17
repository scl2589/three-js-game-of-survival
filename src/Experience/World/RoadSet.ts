import * as THREE from "three";

import Experience from "../Experience";
import Ground from "./Ground.ts";
import Grass from "./Grass.ts";
import Sidewalk from "./Sidewalk.ts";
import Road from "./Road.ts";
import Enemy from './Enemy.ts';

export default class RoadSet {
    experience: Experience;
    group: THREE.Group;
    ground: Ground;
    grass: Grass;
    sidewalk: Sidewalk;
    enemy?: Enemy;
    enemies: Enemy[] = [];
    road: Road;

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();
        this.ground = new Ground();
        this.grass = new Grass();
        this.sidewalk = new Sidewalk();
        this.road = new Road();

        this.createEnemy();

        this.group.add(this.ground.mesh, this.grass.group, this.sidewalk.group, this.road.mesh);
        this.gameScene.add(this.group);
    }

    private get gameScene() {
        return this.experience.gameScene;
    }

    update(speed: number, deltaTime: number) {
        this.group.position.z += speed * deltaTime;
        if (this.group.position.z > 200) {
            this.group.position.z -= 600; // Move it back behind the last set
            this.enemies.forEach((enemy) => {
                this.gameScene.remove(enemy.group);
            });
            this.enemies = [];
            return;
        }

        const enemiesToRemove: Enemy[] = []
        this.enemies.forEach((enemy) => {
            if (enemy.updateEnemy(this.world.character)) {
                enemiesToRemove.push(enemy);
            }
        });

        enemiesToRemove.forEach((enemy) => this.removeEnemy(enemy));
    }

    createEnemy() {
        this.enemy = new Enemy(-100);
        for (let i = 0; i < 4; i++) {
            const enemy = new Enemy(-(i + 1) * 50);
            this.enemies.push(enemy);

            this.group.add(enemy.group)
        }
    }

    removeEnemy(enemy: Enemy) {
        // Dispose of geometry and material to avoid memory leaks
        enemy.group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        // Remove from parent group
        this.group.remove(enemy.group);

        // Also remove from the scene if necessary
        this.gameScene.remove(enemy.group);

        // Remove enemy from the array
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }


    private get world() {
        return this.experience.world;
    }

}
