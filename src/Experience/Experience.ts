import * as THREE from "three";

import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import sources from "./sources";
import Debug from "./Utils/Debug";
import GUI from "lil-gui";

export default class Experience {
  canvas: HTMLCanvasElement;
  debug: Debug;
  sizes: Sizes;
  time: Time;
  gameScene: THREE.Scene;
  startScene: THREE.Scene;
  resources: Resources;
  camera: Camera;
  renderer: Renderer;
  world: World;
  currentScene: THREE.Scene;

  static instance: Experience;
  static getInstance(canvas?: HTMLCanvasElement) {
    if (this.instance) {
      return this.instance;
    }

    if (!canvas) {
      throw new Error("Canvas is required to create an instance of Experience");
    }

    new Experience(canvas);
    return this.instance;
  }

  constructor(canvas: HTMLCanvasElement) {
    Experience.instance = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.sizes = new Sizes();
    this.time = new Time();
    this.renderer = new Renderer();
    this.gameScene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.world = new World();
    this.startScene = new THREE.Scene();
    this.currentScene = this.startScene;
    this.camera = new Camera();

    this.addClickEvent();
  }

  addClickEvent() {
    document.addEventListener('DOMContentLoaded', () => {
      const startButton = document.getElementById('startButton');
      const canvas: HTMLCanvasElement | null = document.querySelector('canvas.webgl');

      startButton?.addEventListener('click', () => {
        startButton.style.display = 'none';
        canvas ? canvas.style.display = 'block' : null;

        this.initGame();
      });
    });
  }

  initGame() {
    // Setup
    this.gameScene.background = new THREE.Color(0xAFC5FF)

    // Sizes resize event
    this.sizes.on("resize", () => this.resize());

    // Time tick event
    this.time.on("tick", () => this.update());
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    // Traverse the whole scene
    this.gameScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.dispose();
    this.renderer.dispose();

    if (this.debug.active) {
      (this.debug.ui as GUI).destroy();
    }
  }
}
