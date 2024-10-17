import * as THREE from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

import Experience from "../Experience";
import Character from './Character'
import Animation from "../Utils/Animation";

export default class Enemy extends Animation {
    experience: Experience;
    group: THREE.Group;
    model?: THREE.Group<THREE.Object3DEventMap>;
    animationMixer?: THREE.AnimationMixer;
    planeMaterial?: THREE.MeshBasicMaterial;
    randomEnemy: number;
    static planeGeometry?: THREE.PlaneGeometry;
    static enemies: THREE.Group[] = [];
    static font?: Font;

    constructor(position: number) {
        super();
        this.experience = Experience.getInstance();
        this.randomEnemy = Math.ceil(Math.random() * 3);
        this.group = new THREE.Group();
        this.setGeometry();
        this.setMaterial();
        this.setMesh(position);
    }

    setGeometry() {
        if (!Enemy.planeGeometry) {
            Enemy.planeGeometry = new THREE.PlaneGeometry(3, 2, 10, 10);
        }
    }

    setMaterial() {
        if (!this.planeMaterial) {
            this.planeMaterial = new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.2 });
        }
    }

    async setMesh(position: number) {
        this.model = SkeletonUtils.clone(this.resource.scene) as THREE.Group;
        if (!this.model) return;

        this.group.add(this.model);

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
            }
        });

        const plane = new THREE.Mesh(Enemy.planeGeometry, this.planeMaterial);
        plane.position.set(0, 4.3, 0);

        if (this.experience.font) {
            const value = this.getRandomValue();
            this.group.userData = { value: value };
            this.addTextToPlane(plane, value.toString(), this.experience.font);
        }

        this.group.add(plane);

        this.animationMixer = new THREE.AnimationMixer(this.model);

        this.setAnimations(this.animationMixer, {
            idle: this.animationMixer.clipAction(this.resource.animations[3]),
            walking: this.animationMixer.clipAction(this.resource.animations[13]),
            running: this.animationMixer.clipAction(this.resource.animations[10]),
            death: this.animationMixer.clipAction(this.resource.animations[0])
        });
        this.play("walking");
        this.group.position.setZ(position);
        this.group.position.setX(Math.random() * 20 - 10);
        Enemy.enemies.push(this.group);
    }

    addTextToPlane(plane: THREE.Mesh, textValue: string, font: Font) {
        const textGeometry = new TextGeometry(textValue, { font: font, size: 1.1, depth: 0.1 });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-0.5, -0.5, 0.1);
        plane.add(textMesh);
    }

    getRandomValue = () => Math.ceil(Math.random() * 9);


    updateEnemy(character: Character, index: number) {
        // super.update(this.time.delta * 0.001);

        // Enemy.enemies.forEach((enemy, index) => {
            if (this.group.userData.collided) {
                return;
            }

            const characterPos = character.model?.getWorldPosition(new THREE.Vector3());
            if (!characterPos) return;

            const enemyPos = this.group.getWorldPosition(new THREE.Vector3());
            if (character.model && Math.abs(enemyPos.z - characterPos.z) < 5 && character.checkCollision(this.group)) {
                // 충돌로 인한 점수 감소 로직 추가
                this.group.userData.collided = true;

                this.world.calculateScore('-', this.group.userData.value);
                // Enemy.enemies.splice(index, 1);
                // TODO: 충돌로 인해 enemy 없애는 작업 추가
                this.gameScene.remove(this.group);
                return;
            }

            // 총알과 적의 충돌 로직
            // character.bullets.forEach((bullet) => {
            //     if (this.checkCollision(enemy, bullet)) {
            //         character.bullets.splice(character.bullets.indexOf(bullet), 1);
            //         this.gameScene.remove(bullet);
            //         // TODO: HP 감소 로직 추가
            //         // textMesh 업데이트하기
            //         if (enemy.userData.value !== undefined) {
            //             const plane = enemy.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined;
            //
            //             if (plane) {
            //                 enemy.userData.value -= 1;
            //
            //                 if (enemy.userData.value === 0) {
            //                     // TODO: enemy HP가 0이므로 점수 추가 로직
            //                     this.gameScene.remove(enemy);
            //                     return;
            //                 }
            //
            //                 const oldTextMesh = plane.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
            //                 if (oldTextMesh) {
            //                     plane.remove(oldTextMesh);
            //                     oldTextMesh.geometry.dispose(); // Properly dispose of old geometry
            //                 }
            //
            //                 const newTextGeometry = new TextGeometry(enemy.userData.value.toString(), {
            //                     font: this.experience.font,
            //                     size: 1.1,
            //                     depth: 0.1
            //                 });
            //                 const newTextMesh = new THREE.Mesh(newTextGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
            //                 newTextMesh.position.set(-0.5, -0.5, 0.1); // Adjust position of the text on the plane
            //
            //                 plane.add(newTextMesh);
            //             }
            //         }
            //         // character.bullets.splice(character.bullets.indexOf(bullet), 1);
            //         // this.gameScene.remove(bullet);
            //         // this.gameScene.remove(enemy);
            //         return;
            //     }
            //
            //     if (bullet.position.z <= -100) {
            //         character.bullets.splice(character.bullets.indexOf(bullet), 1);
            //         this.gameScene.remove(bullet);
            //     }
            // })

            if (character.model && this.group.position.z > character.model.position.z + 5) {
                this.gameScene.remove(this.group);
                Enemy.enemies.splice(this.group, 1);
            }
        // })

    }

    checkCollision(enemy: THREE.Object3D<THREE.Object3DEventMap>, bullet: THREE.Mesh) {
        const enemyBox = new THREE.Box3().setFromObject(enemy);
        const bulletBox = new THREE.Box3().setFromObject(bullet);
        return enemyBox.intersectsBox(bulletBox);
    }

    private get resources() {
        return this.experience.resources;
    }

    private get resource() {
        const resource = `enemyModel${this.randomEnemy}`
        return this.resources.items[resource] as GLTF;
    }

    private get gameScene() {
        return this.experience.gameScene;
    }

    private get time() {
        return this.experience.time;
    }

    private get world() {
        return this.experience.world;
    }
}
