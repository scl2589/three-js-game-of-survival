import * as THREE from "three";

import Experience from "../Experience";
import Animation from "../Utils/Animation";
import { GLTF } from "three/examples/jsm/Addons.js";
import {Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

class customEnemyGroup extends THREE.Group {
    value?: number;
}

export default class Enemy extends Animation {
    experience: Experience;
    model?: THREE.Group<THREE.Object3DEventMap>;
    animationMixer?: THREE.AnimationMixer;
    planeGeometry?: THREE.PlaneGeometry;
    planeMaterial?: THREE.MeshBasicMaterial;
    randomEnemy: number;
    group: customEnemyGroup;


    constructor() {
        super();
        this.experience = Experience.getInstance();
        this.randomEnemy = Math.ceil(Math.random() * 3);
        this.group = new THREE.Group();
        this.group.value = 10;
        this.setGeometry();
        this.setMaterial();
        this.setModel();
        this.debug.on("open", () => this._updateDebug());
        this._updateDebug();
    }

    setGeometry() {
        this.planeGeometry = new THREE.PlaneGeometry(3, 3, 10, 10);
    }

    setMaterial() {
        this.planeMaterial = new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.2});
    }

    setModel() {
        // cloning needed in order to use multiple instances of the same model
        this.model = this.resource.scene.clone();
        this.model.position.set(0, 0, 0);

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
            }
        });

        const plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        plane.position.set(0, 3, 0)

        // Add text to the banner
        const loader  = new FontLoader();
        const textValue = this.group.value.toString();
        loader.load('/fonts/optimer_bold.typeface.json', (font: Font) => {
            const textGeometry = new TextGeometry(textValue, {
                font: font,
                size: 1.5,
                depth: 0.1,
            })
            textGeometry.computeBoundingBox();

            const textWidth = textGeometry.boundingBox ? textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x : 0;
            const textHeight = textGeometry.boundingBox ? textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y : 0;


            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000})
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-textWidth/2, -textHeight/2, 0.1);
            plane.add(textMesh);
        })

        this.group.add(this.model, plane)
        this.gameScene.add(this.group);

        // Add animations
        this.animationMixer = new THREE.AnimationMixer(this.model);

        this.setAnimations(this.animationMixer, {
            idle: this.animationMixer.clipAction(this.resource.animations[3]),
            walking: this.animationMixer.clipAction(this.resource.animations[13]),
            running: this.animationMixer.clipAction(this.resource.animations[10]),
            death: this.animationMixer.clipAction(this.resource.animations[0])
        });
        this.play("walking");
    }

    update() {
        super.update(this.time.delta * 0.001);
        // if (this.model) {
        //     console.log("MODEL HERE", this.model.position)
        //     this.model.position.z += 0.1;
        // }
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

    private _updateDebug() {
        if (!this.debug.ui) {
            return;
        }

        const debugFolder = this.debug.ui.addFolder("enemy");
        super.updateDebug(debugFolder);

        if (this.model) {
            debugFolder
                .add(this.model.position, "x")
                .name("posX")
                .max(4)
                .min(-4)
                .step(0.1);
            debugFolder
                .add(this.model.position, "z")
                .name("posZ")
                .max(4)
                .min(-4)
                .step(0.1);
            debugFolder
                .add(this.model.rotation, "y")
                .name("roY")
                .max(4)
                .min(-4)
                .step(0.1);
        }
    }

    checkCollision(object: THREE.Object3D) {
        if (!this.model) return;
        const characterBox = new THREE.Box3().setFromObject(this.model);
        const objectBox = new THREE.Box3().setFromObject(object);
        return characterBox.intersectsBox(objectBox);
    }


    private get gameScene() {
        return this.experience.gameScene;
    }

    private get resources() {
        return this.experience.resources;
    }

    private get resource() {
        const resource = `enemyModel${this.randomEnemy}`
        return this.resources.items[resource] as GLTF;
    }

    private get time() {
        return this.experience.time;
    }

    private get debug() {
        return this.experience.debug;
    }
}
