import * as THREE from "three";
import Experience from "../Experience";
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
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

        // this.setGeometry();
        // this.setMaterial();
        // this.setMesh();
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
        Banner.banners.push(this.group);
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

    static initBanners(zPosition: number) {
        const banner1 = new Banner();
        banner1.createBanner()
        const banner2 = new Banner();
        banner2.createBanner();

        const [x1, x2] = this.getNonOverlappingPositions(-10, 5, 7);

        banner1.group.position.set(x1, 2, zPosition);
        banner2.group.position.set(x2, 2, zPosition);

        const bannerGroup = new THREE.Group();
        bannerGroup.add(banner1.group, banner2.group);

        Banner.banners.push(bannerGroup);
        return bannerGroup;
        // gameScene.add(bannerGroup);
    }

    updateBanners(character: Character) {
        const characterPos = character.model?.getWorldPosition(new THREE.Vector3());
        if (!characterPos) return false;
        // console.log("Banner.banners", Banner.banners);
        Banner.banners.forEach((bannerGroup, index) => {
            const bannerGroupPos = bannerGroup.getWorldPosition(new THREE.Vector3());
            for (let j = 0; j < bannerGroup.children.length; j++) {
                const banner = bannerGroup.children[j] ;
                const bannerPos = banner.getWorldPosition(new THREE.Vector3());
                if (character.model && Math.abs(bannerPos.z - characterPos.z) <= 1 && character.checkCollision(banner)) {
                    this.handleCollision(banner, bannerGroup);
                    // bannerGroup.remove(banner);
                }
            }
            // 캐릭터를 지났으면 제거하기 :)
            if (character.model && bannerGroupPos.z > characterPos.z + 5) {
                this.gameScene.remove(bannerGroup);
                Banner.banners.splice(index, 1);
            }
        });
    }

    handleCollision(banner: THREE.Object3D<THREE.Object3DEventMap>, bannerGroup) {
        const { operator, value } = banner.userData;
        this.world.calculateScore(operator, value)
        this.gameScene.remove(banner);
        bannerGroup.remove(banner);
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
