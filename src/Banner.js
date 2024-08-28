import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

export class Banner {
    constructor() {
        this.mesh = new THREE.Group();
        this.color = this.getRandomColor()

        // Flag
        const flagGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 32);
        const flagMaterial = new THREE.MeshBasicMaterial({color: this.color});

        const flag1 = new THREE.Mesh(flagGeometry, flagMaterial);
        flag1.position.set(0, 0, 0);

        const flag2 = new THREE.Mesh(flagGeometry, flagMaterial);
        flag2.position.set(5, 0, 0);

        // Plane
        const planeGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);
        const planeMaterial = new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.2});

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(2.5, 0, 0);

        this.mesh.add(flag1, flag2, plane);

        this.operator = this.getRandomOperator();
        this.value = this.getRandomValue();

        // Add text to the banner
        const loader  = new FontLoader();
        const textValue = `${this.operator}${this.value}`
        loader.load('/fonts/optimer_bold.typeface.json', font => {
            const textGeometry = new TextGeometry(textValue, {
                font: font,
                size: 1.8,
                depth: 0.1,
            })
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000})
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-1.5, -0.5, 0.1);
            plane.add(textMesh);
        })
    }

    getRandomOperator = () => {
        const operators = ['x', '+', '-', '÷'];
        return operators[Math.floor(Math.random() * operators.length)]
    }

    getRandomValue = () => Math.ceil(Math.random() * 9);

    getRandomColor = () => {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static getNonOverlappingPositions(minX, maxX, minDistance) {
        const getRandomX = (min, max) => Math.random() * (max - min) + min;
        const x1 = getRandomX(minX, maxX);
        let x2;

        do {
            x2 = getRandomX(minX, maxX);
        } while (Math.abs(x1 - x2) < minDistance);

        return [x1, x2];
    }



}
