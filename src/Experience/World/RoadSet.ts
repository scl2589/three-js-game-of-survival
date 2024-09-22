import * as THREE from "three";

import Experience from "../Experience";
import Ground from "./Ground.ts";
import Grass from "./Grass.ts";
import Sidewalk from "./Sidewalk.ts";
import Road from "./Road.ts";

export default class RoadSet {
    experience: Experience;
    group: THREE.Group;
    ground?: Ground;
    grass?: Grass;
    sidewalk?: Sidewalk;
    road?: Road;

    constructor() {
        this.experience = Experience.getInstance();
        this.group = new THREE.Group();

        this.ground = new Ground();
        this.grass = new Grass();
        this.sidewalk = new Sidewalk();
        this.road = new Road();

        this.group.add(this.ground.mesh, this.grass?.group, this.sidewalk?.group, this.road.mesh);
        this.gameScene.add(this.group);
    }

    private get gameScene() {
        return this.experience.gameScene;
    }

    update(speed: number) {
        this.group.position.z += speed;
        if (this.group.position.z > 200) {
            this.group.position.z -= 600; // Move it back behind the last set
        }
    }

}
