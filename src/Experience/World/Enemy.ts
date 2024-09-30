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
    static lastEnemyTime: number = 1250;
    static enemyInterval: number = 2500; // 2.5 seconds

    constructor() {
        super();
        this.experience = Experience.getInstance();
        this.randomEnemy = Math.ceil(Math.random() * 3);
        this.group = new THREE.Group();
        this.setGeometry();
        this.setMaterial();
        this.setMesh();
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

    async setMesh() {
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
        // this.play("walking");
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

    static createEnemy(gameScene: THREE.Scene) {
        const enemy1 = new Enemy();
        const enemy2 = new Enemy();


        const [x1, x2] = this.getNonOverlappingPositions(-10, 5, 7);
        enemy1.group.position.set(x1, 0, 0);
        enemy2.group.position.set(x2, 0, 0);

        const enemyGroup = new THREE.Group();
        enemyGroup.add(enemy1.group, enemy2.group)

        Enemy.enemies.push(enemyGroup);
        enemyGroup.position.z = -250
        gameScene.add(enemyGroup);
    }

    updateEnemy(character: Character) {
        super.update(this.time.delta * 0.001);
        const enemySpeed = 0.5;
        if (this.time.elapsed - Enemy.lastEnemyTime > Enemy.enemyInterval) {
            Enemy.createEnemy(this.gameScene);
            Enemy.lastEnemyTime = this.time.elapsed;
        }

        Enemy.enemies.forEach((enemyGroup, index) => {
            // enemies move
            enemyGroup.position.z += enemySpeed;

            for (let j = 0; j < enemyGroup.children.length; j++) {
                const enemy = enemyGroup.children[j];
                if (character.model && enemy.position.z >= character.model.position.z && character.checkCollision(enemy)) {
                    this.handleCollision(enemy);
                    enemyGroup.remove(enemy);
                }


                // textMesh 업데이트하기
                if (enemy.userData.value !== undefined) {
                    const plane = enemy.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh | undefined;

                    if (plane) {
                        enemy.userData.value += 1;

                        const oldTextMesh = plane.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
                        if (oldTextMesh) {
                            plane.remove(oldTextMesh);
                            oldTextMesh.geometry.dispose(); // Properly dispose of old geometry
                        }

                        const newTextGeometry = new TextGeometry(enemy.userData.value.toString(), {
                            font: this.experience.font,
                            size: 1.1,
                            depth: 0.1
                        });
                        const newTextMesh = new THREE.Mesh(newTextGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
                        newTextMesh.position.set(-0.5, -0.5, 0.1); // Adjust position of the text on the plane

                        plane.add(newTextMesh);
                    }
                }
            }

            if (character.model && enemyGroup.position.z > character.model.position.z + 5) {
                this.gameScene.remove(enemyGroup);
                Enemy.enemies.splice(index, 1);
            }
        })

    }

    handleCollision(enemy: THREE.Object3D<THREE.Object3DEventMap>) {
        // console.log("COLIDEDED")
    }

    static getNonOverlappingPositions(minX: number, maxX:number, minDistance:number) {
        const getRandomX = (min:number, max: number) => Math.random() * (max - min) + min;
        const x1 = getRandomX(minX, maxX);
        let x2;

        do {
            x2 = getRandomX(minX, maxX);
        } while (Math.abs(x1 - x2) < minDistance);

        return [x1, x2];
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
}
