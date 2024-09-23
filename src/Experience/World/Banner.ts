import * as THREE from "three";
import Experience from "../Experience";
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import Character from './Character';

export default class Banner {
    experience: Experience;
    group: THREE.Group;
    static banners: THREE.Group[] = [];
    static lastBannerTime: number = 0;
    static bannerInterval: number = 2500; // 2.5 seconds

    poleMaterial?: THREE.MeshBasicMaterial;
    planeMaterial?: THREE.MeshBasicMaterial;

    static poleGeometry?: THREE.CylinderGeometry;
    static planeGeometry?: THREE.PlaneGeometry;
    static font?: Font;

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();
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

        if (!Banner.font) {
            await this.loadFont();
        }

        if (Banner.font) {
            const operator = this.getRandomOperator();
            const value = this.getRandomValue();
            const textValue = `${operator}${value}`;

            this.group.userData = {operator, value}
            this.addTextToPlane(plane, textValue, Banner.font);
        }

        this.group.add(pole1, pole2, plane);
        Banner.banners.push(this.group);
    }

    async addTextToPlane(plane: THREE.Mesh, textValue: string, font: Font) {
        const textGeometry = new TextGeometry(textValue, { font: font, size: 1.8, depth: 0.1 });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.5, -0.5, 0.1);
        plane.add(textMesh);
    }

    async loadFont() {
        const loader = new FontLoader();
        try {
            Banner.font = await loader.loadAsync('/fonts/optimer_bold.typeface.json');
        } catch (error) {
            console.error("Failed to load font:", error);
        }
    }

    getRandomOperator = () => ['x', '+', '-', '÷'][Math.floor(Math.random() * 4)];
    getRandomValue = () => Math.ceil(Math.random() * 9);
    getRandomColor = () => `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;

    static initBanners(gameScene: THREE.Scene) {
        const banner1 = new Banner();
        const banner2 = new Banner();

        const [x1, x2] = this.getNonOverlappingPositions(-10, 5, 7);

        banner1.group.position.set(x1, 2, 0);
        banner2.group.position.set(x2, 2, 0);

        const bannerGroup = new THREE.Group();
        bannerGroup.add(banner1.group, banner2.group);

        Banner.banners.push(bannerGroup);
        bannerGroup.position.z = -150;
        gameScene.add(bannerGroup);
    }

    updateBanners(character: Character) {
        const bannerSpeed = 0.5;
        if (this.time.elapsed - Banner.lastBannerTime > Banner.bannerInterval) {
            Banner.initBanners(this.gameScene);
            Banner.lastBannerTime = this.time.elapsed;
        }

        Banner.banners.forEach((bannerGroup, index) => {
            bannerGroup.position.z += bannerSpeed;

            for (let j = 0; j < bannerGroup.children.length; j++) {
                const banner = bannerGroup.children[j] ;

                if (character.model && banner.position.z >= character.model.position.z && character.checkCollision(banner)) {
                    this.handleCollision(banner);
                    bannerGroup.remove(banner);
                }
            }

            if (character.model && bannerGroup.position.z > character.model.position.z + 5) {
                this.gameScene.remove(bannerGroup);
                Banner.banners.splice(index, 1);
            }
        });
    }

    handleCollision(banner: THREE.Object3D<THREE.Object3DEventMap>) {
        const { operator, value } = banner.userData;
        this.world.calculateScore(operator, value)
        this.gameScene.remove(banner);
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
