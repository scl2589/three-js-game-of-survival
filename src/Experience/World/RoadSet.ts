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
    enemy?: Enemy;
    enemies: Enemy[] = [];
    road: Road;
    bannerManager?: Banner;
    banners: THREE.Group[] = [];

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();
        this.ground = new Ground();
        this.grass = new Grass();
        this.sidewalk = new Sidewalk();
        this.road = new Road();
        this.bannerManager = new Banner();

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

            this.clearEnemies();
            this.clearBanners();

            this.setRoad();
            return;
        }

        // enemy 업데이트 (deal with the collision)
        const enemiesToRemove: Enemy[] = []
        this.enemies.forEach((enemy) => {
            if (enemy.updateEnemy(this.world.character)) {
                enemiesToRemove.push(enemy);
            }
        });

        enemiesToRemove.forEach((enemy) => this.removeEnemy(enemy));

        // banner 업데이트
        // if (this.bannerManager) {
        //     this.bannerManager.updateBanners(this.world.character);
        // }

        this.banners.forEach((bannerGroup) => {
            const bannerGroupPos = bannerGroup.getWorldPosition(new THREE.Vector3());
            const characterPos = this.world.character.model?.getWorldPosition(new THREE.Vector3());
            if (!characterPos) return false;

            const [banner1, banner2] = bannerGroup.children;
            banner1.updateBanner();
            banner2.updateBanner();

            if (bannerGroupPos.z > characterPos.z + 5) {
                // console.log(bannerGroupPos.z, characterPos.z)
                this.gameScene.remove(bannerGroup);
                this.banners.splice(this.banners.indexOf(bannerGroup), 1);
            }


            if (bannerGroupPos.z > characterPos.z + 5) {
                // console.log(bannerGroupPos.z, characterPos.z)
                this.gameScene.remove(bannerGroup);
                this.banners.splice(this.banners.indexOf(bannerGroup), 1);
            }
        })
    }

    createBanner() {
        for (let i = 0; i < 4; i++) {
            const bannerGroup = Banner.initBanners(-(i+1) * 50 + 20);
            this.banners.push(bannerGroup);
            this.group.add(bannerGroup);
        }
    }

    createEnemy() {
        this.enemy = new Enemy(-100);
        for (let i = 0; i < 4; i++) {
            const enemy = new Enemy(-(i + 1) * 50);
            this.enemies.push(enemy);
            this.group.add(enemy.group)
        }
    }

// Method to remove a single enemy and dispose its resources
    removeEnemy(enemy: Enemy) {
        // Dispose of all meshes and materials
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

        // Remove from parent group and scene
        this.group.remove(enemy.group);
        this.gameScene.remove(enemy.group);

        // Remove from the enemies array
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

// Method to clear all enemies at once
    clearEnemies() {
        this.enemies.forEach((enemy) => this.removeEnemy(enemy));
        this.enemies = [];
    }

// Method to clear all banners and dispose their resources
    clearBanners() {
        this.banners.forEach((banner) => {
            banner.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.gameScene.remove(banner);
        });
        this.banners = [];
    }



    private get world() {
        return this.experience.world;
    }

}
