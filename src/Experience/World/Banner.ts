import * as THREE from "three";
import Experience from "../Experience";
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export default class Banner {
    experience: Experience;
    group: THREE.Group;
    static banners: THREE.Group[] = [];

    poleMaterial?: THREE.MeshBasicMaterial;
    planeMaterial?: THREE.MeshBasicMaterial;

    static poleGeometry?: THREE.CylinderGeometry;
    static planeGeometry?: THREE.PlaneGeometry;
    static font?: Font;

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();
    }

    createBanner() {
        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        if (!Banner.poleGeometry) {
            Banner.poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 32);
        }
        if (!Banner.planeGeometry) {
            Banner.planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);
        }
    }

    setMaterial() {
        if (!this.poleMaterial) {
            this.poleMaterial = new THREE.MeshBasicMaterial({ color: this.getRandomColor() });
        }
        if (!this.planeMaterial) {
            this.planeMaterial = new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.2 });
        }
    }

    async setMesh() {
        const pole1 = new THREE.Mesh(Banner.poleGeometry, this.poleMaterial);
        pole1.position.set(0, 0, 0);
        const pole2 = new THREE.Mesh(Banner.poleGeometry, this.poleMaterial);
        pole2.position.set(5, 0, 0);
        const plane = new THREE.Mesh(Banner.planeGeometry, this.planeMaterial);
        plane.position.set(2.5, 0, 0);

        if (this.experience.font) {
            const operator = this.getRandomOperator();
            const value = operator === '÷' ? this.getRandomValue() + 1 : this.getRandomValue();
            const textValue = `${operator}${value}`;

            this.group.userData = {operator, value}
            this.addTextToPlane(plane, textValue, this.experience.font);
        }

        this.group.add(pole1, pole2, plane);
    }



    async addTextToPlane(plane: THREE.Mesh, textValue: string, font: Font) {
        const textGeometry = new TextGeometry(textValue, { font: font, size: 1.8, depth: 0.1 });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.5, -0.5, 0.1);
        plane.add(textMesh);
    }

    getRandomOperator = () => ['x', '+', '-', '÷'][Math.floor(Math.random() * 4)];
    getRandomValue = () => Math.floor(Math.random() * 9);
    getRandomColor = () => `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;

    initBanners(xPosition: number, yPosition: number,  zPosition: number) {
        this.createBanner()

        this.group.position.set(xPosition, yPosition, zPosition);
    }

    updateBanner() {
        const bannerPos = this.group.getWorldPosition(new THREE.Vector3());
        const characterPos = this.world.character?.model?.getWorldPosition(new THREE.Vector3());
        if (!characterPos) return false;

        // 캐릭터와 banner가 충돌했을 때
        if (Math.abs(bannerPos.z - characterPos.z) <= 1 && this.world.character?.checkCollision(this.group)) {
            this.handleCollision()
            return true;
        }

        // banner가 캐릭터 뒤로 넘어갔을 때
        if (bannerPos.z > characterPos.z + 5) {
            return true;
        }

        return false;
    }


    handleCollision() {
        const { operator, value } = this.group.userData;
        this.world.calculateScore(operator, value);
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

    private get world() {
        return this.experience.world;
    }
}
