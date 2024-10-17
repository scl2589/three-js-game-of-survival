import * as THREE from "three";

import Experience from "../Experience";
import Ground from "./Ground.ts";
import Grass from "./Grass.ts";
import Sidewalk from "./Sidewalk.ts";
import Road from "./Road.ts";
import Enemy from './Enemy.ts';
import Character from "./Character.ts";

export default class RoadSet {
    experience: Experience;
    group: THREE.Group;
    ground: Ground;
    grass: Grass;
    sidewalk: Sidewalk;
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

    update(speed: number, deltaTime: number, character: Character) {
        this.group.position.z += speed * deltaTime;
        if (this.group.position.z > 200) {
            this.group.position.z -= 600; // Move it back behind the last set

              Enemy.enemies.forEach((enemy) => {
                this.gameScene.remove(enemy);
              });
              Enemy.enemies = [];
              this.enemies = [];

              // this.createEnemy();
            return;
        }

        // if (this.world.character instanceof Character) {
        //     this.enemies.forEach((enemy) => console.log(enemy));
        // }

        // Check for collisions with the character
        this.enemies.forEach((enemy, index) => {

            enemy.updateEnemy(character, index);
        });


    }

    createEnemy() {
        for (let i = 0; i < 4; i++) {
            this.enemies.push(new Enemy(-(i + 1) * 50));
        }
        this.enemies.forEach((enemy) => this.group.add(enemy.group));
    }

    private get world() {
        return this.experience.world;
    }

}
