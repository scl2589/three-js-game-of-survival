import * as THREE from "three";

import Experience from "../Experience";
import Ground from "./Ground.ts";
import Grass from "./Grass.ts";
import Sidewalk from "./Sidewalk.ts";
import Road from "./Road.ts";
import Enemy from './Enemy.ts';
import Banner from './Banner';

export default class RoadSet {
    experience: Experience;
    group: THREE.Group;
    ground: Ground;
    grass: Grass;
    sidewalk: Sidewalk;
    enemies: Enemy[] = [];
    road: Road;
    banners: Banner[] = [];

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();
        this.ground = new Ground();
        this.grass = new Grass();
        this.sidewalk = new Sidewalk();
        this.road = new Road();

        this.setRoad();
    }

    private get gameScene() {
        return this.experience.gameScene;
    }

    setRoad() {
        this.createBanner();
        this.createEnemy();

        this.group.add(this.ground.mesh, this.grass.group, this.sidewalk.group, this.road.mesh);
        this.gameScene.add(this.group);
    }

    update(speed: number, deltaTime: number) {
        this.group.position.z += speed * deltaTime;


        // roadset이 화면 밖으로 나가면 다시 뒤로 보내기
        if (this.group.position.z > 300) {
            this.group.position.z -= 600;

            this.setRoad();
            return;
        }

        // enemy 업데이트 (deal with the collision)
        const enemiesToRemove: Enemy[] = []
        this.enemies.forEach((enemy) => {
            if (!this.world.character) return;
            if (enemy.updateEnemy(this.world.character)) {
                enemiesToRemove.push(enemy);
            }
        });

        enemiesToRemove.forEach((enemy) => this.removeEnemy(enemy));

        // banner 업데이트
        const bannersToRemove: Banner[] = []
        this.banners.forEach((banner) => {
           if (banner.updateBanner()) {
               bannersToRemove.push(banner)
           }
        })
        bannersToRemove.forEach((banner) => this.removeBanner(banner))
    }

    createBanner() {
        for (let i = 0; i < 4; i++) {
            const [x1, x2] = Banner.getNonOverlappingPositions(-10, 5, 7);

            const banner1 = new Banner();
            banner1.initBanners(x1, 2, -(i+1) * 50 + 25);
            const banner2 = new Banner();
            banner2.initBanners(x2, 2, -(i+1) * 50 + 25);

            this.banners.push(banner1);
            this.banners.push(banner2);
            this.group.add(banner1.group, banner2.group);
        }
    }

    createEnemy() {
        for (let i = 0; i < 4; i++) {
            const enemy = new Enemy(-(i + 1) * 50);
            this.enemies.push(enemy);
            this.group.add(enemy.group)
        }
    }


    removeEnemy(enemy: Enemy) {
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


        enemy.animationMixer?.stopAllAction();
        enemy.animationMixer?.uncacheRoot(enemy.group!);

        enemy.animationMixer = undefined;


        // Remove from parent group and scene
        this.group.remove(enemy.group);
        this.gameScene.remove(enemy.group);

        // Remove from the enemies array
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    removeBanner(banner:Banner) {
        banner.group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.group.remove(banner.group);
        this.gameScene.remove(banner.group);

        const index = this.banners.indexOf(banner);
        if (index > -1) {
            this.banners.splice(index, 1);
        }
    }


    private get world() {
        return this.experience.world;
    }

}
