import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

export class Banner {
    constructor(color, operator, value) {
        this.mesh = new THREE.Group();

        // Flag
        const flagGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 32);
        const flagMaterial = new THREE.MeshBasicMaterial({color: color});

        const flag1 = new THREE.Mesh(flagGeometry, flagMaterial);
        flag1.position.set(0, 0, 0);

        const flag2 = new THREE.Mesh(flagGeometry, flagMaterial);
        flag2.position.set(5, 0, 0);

        // Banner
        const bannerGeometry = new THREE.PlaneGeometry(5, 5, 10, 10);
        const bannerMaterial = new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.2});

        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(2.5, 0, 0);

        this.mesh.add(flag1, flag2, banner);

        // Add text to the banner
        const loader  = new FontLoader();
        const textValue = `${operator}${value}`
        loader.load('/fonts/optimer_bold.typeface.json', font => {
            const textGeometry = new TextGeometry(textValue, {
                font: font,
                size: 1.8,
                depth: 0.1,
            })
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000})
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(-1.5, -0.5, 0.1);
            banner.add(textMesh);
        })

        this.operator = operator;
        this.value = value
    }

}
