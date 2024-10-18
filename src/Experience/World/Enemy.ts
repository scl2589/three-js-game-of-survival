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
        // Enemy.enemies.push(this.group);
    }

    addTextToPlane(plane: THREE.Mesh, textValue: string, font: Font) {
        const textGeometry = new TextGeometry(textValue, { font: font, size: 1.1, depth: 0.1 });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-0.5, -0.5, 0.1);
        plane.add(textMesh);
    }

    getRandomValue = () => Math.ceil(Math.random() * 9);


    updateEnemy(character: Character) {
        const characterPos = character.model?.getWorldPosition(new THREE.Vector3());
        if (!characterPos) return false;


        const enemyPos = this.group.getWorldPosition(new THREE.Vector3());

        if (Math.abs(enemyPos.z - characterPos.z) < 5 && character.checkCollision(this.group)) {
            // 충돌로 인한 점수 감소 로직 추가
            this.world.calculateScore('-', Math.max(this.world.score * 0.2, this.group.userData.value));
            return true;
        }

        // 캐릭터가 적을 지나쳤을 때
        if (enemyPos.z > characterPos.z + 5) {
            return true;
        }

        let isCollided = false;

        // 총알과 적의 충돌 로직
        character.bullets.forEach((bullet) => {
            if (this.checkCollision(this.group, bullet)) {
                // bullet 제거
                character.bullets.splice(character.bullets.indexOf(bullet), 1);
                this.gameScene.remove(bullet);

                const plane = this.group.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined;

                if (this.group.userData.value === undefined || !plane) return;

                this.group.userData.value -= 1;

                // 적의 HP가 0이므로 점수 추가
                if (this.group.userData.value <= 0) {
                    this.world.calculateScore('+', 100)
                    isCollided = true;
                    return
                }

                // 총알에 맞았으므로 적의 HP 감소
                const oldTextMesh = plane.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
                if (oldTextMesh) {
                    plane.remove(oldTextMesh);
                    oldTextMesh.geometry.dispose(); // Properly dispose of old geometry
                }

                const newTextGeometry = new TextGeometry(this.group.userData.value.toString(), {
                    font: this.experience.font,
                    size: 1.1,
                    depth: 0.1
                });
                const newTextMesh = new THREE.Mesh(newTextGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
                newTextMesh.position.set(-0.5, -0.5, 0.1); // Adjust position of the text on the plane

                plane.add(newTextMesh);
            }

            if (bullet.position.z <= -50) {
                character.bullets.splice(character.bullets.indexOf(bullet), 1);
                this.gameScene.remove(bullet);
            }
        })
        return isCollided;
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

    private get world() {
        return this.experience.world;
    }
}
