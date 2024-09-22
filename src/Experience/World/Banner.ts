import * as THREE from "three";

import Experience from "../Experience";
import {Font, FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

class customBannerGroup extends THREE.Group {
    operator?: string;
    value?: number;
}

export default class Banner {
    experience: Experience;
    poleGeometry?: THREE.CylinderGeometry;
    planeGeometry?: THREE.PlaneGeometry;
    poleMaterial?: THREE.MeshBasicMaterial;
    planeMaterial?: THREE.MeshBasicMaterial;
    group: customBannerGroup;

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();
        this.group.operator = this.getRandomOperator();
        this.group.value = this.getRandomValue();

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        this.poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 32);
        this.planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);
    }

    setMaterial() {
        this.poleMaterial = new THREE.MeshBasicMaterial({
            color: this.getRandomColor(),
            wireframe: false,
        });

        this.planeMaterial = new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.2});
    }

    setMesh() {
        const pole1 = new THREE.Mesh(this.poleGeometry, this.poleMaterial);
        pole1.position.set(0, 0, 0);

        const pole2 = new THREE.Mesh(this.poleGeometry, this.poleMaterial);
        pole2.position.set(5, 0, 0);

        const plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
        plane.position.set(2.5, 0, 0);

        // Add text to the banner
        const loader  = new FontLoader();
        const textValue = `${this.group.operator}${this.group.value}`
        loader.load('/fonts/optimer_bold.typeface.json', (font: Font) => {
            const textGeometry = new TextGeometry(textValue, {
                font: font,
                size: 1.8,
                depth: 0.1,
            })
            textGeometry.computeBoundingBox();

            const textWidth = textGeometry.boundingBox ? textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x : 0;

            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000})
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-textWidth/2, -0.5, 0.1);
            plane.add(textMesh);
        })

        this.group.add(pole1, pole2, plane)

        this.gameScene.add(this.group);
    }

    getRandomOperator = () => {
        const operators = ['x', '+', '-', '÷'];
        return operators[Math.floor(Math.random() * operators.length)]
    }

    getRandomValue = () => Math.ceil(Math.random() * 9);

    getRandomColor = () => {
        return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
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

}
