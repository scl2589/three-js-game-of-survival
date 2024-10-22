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
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

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
  font?: Font;
  instructionsText?: THREE.Mesh;
  remainingTime: number;

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
    this.loadFont();
    this.remainingTime = 30;

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

  changeToStartScene() {
    this.time.reset();
    this.currentScene = this.startScene;

    const gameInfoElement = document.getElementById('gameInfo');
    const startButton = document.getElementById('startButton');
    const canvas: HTMLCanvasElement | null = document.querySelector('canvas.webgl');

    if (!startButton || !canvas || !gameInfoElement) return;
    startButton.style.display = 'block';
    canvas.style.display = 'none'
    gameInfoElement.style.display = 'none';
  }


  initGame() {
    // Setup
    this.gameScene.background = new THREE.Color(0xAFC5FF)
    this.showGameInfo();

    // Sizes resize event
    this.sizes.on("resize", () => this.resize());

    // Reset time and time tick event
    this.time.reset();
    this.time.on("tick", () => this.update());

    this.updateCountdown();

    // instructions
    this.createInstructionsText();

    setTimeout(() => {
      if (this.instructionsText) {
        this.gameScene.remove(this.instructionsText);

        // Dispose of geometry and material
        this.instructionsText.geometry.dispose();
        const materials = this.instructionsText.material;
        if (Array.isArray(materials)) {
          materials.forEach((material) => {
            if (material && typeof material.dispose === "function") {
              material.dispose();
            }
          });
        } else {
          if (materials && typeof materials.dispose === "function") {
            materials.dispose();
          }
        }
        // Clear the reference
        this.instructionsText = undefined;
      }
    }, 5000);
  }

  showGameInfo() {
    const gameInfoElement = document.getElementById('gameInfo');
    if (!gameInfoElement) return;
    gameInfoElement.style.display = 'block';
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

  async loadFont() {
    const loader = new FontLoader();
    try {
      this.font = await loader.loadAsync('/fonts/optimer_bold.typeface.json');
    } catch (error) {
      console.error("Failed to load font:", error);
    }
  }


  async createInstructionsText() {
    if (!this.font) {
      console.error("Font not loaded.");
      return;
    }

    const textGeometry = new TextGeometry("Use < > keys to move\nUse spacebar to shoot", {
      font: this.font,
      size: 2,
      depth: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 5,
    });

    textGeometry.computeBoundingBox();
    textGeometry.center();

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.instructionsText = new THREE.Mesh(textGeometry, textMaterial);

    this.instructionsText.position.set(0, 10, -5);
    this.gameScene.add(this.instructionsText);
  }

  updateCountdown() {
    const countdownInterval = setInterval(() => {
      if (this.remainingTime < 1) {
        this.world.endGame();
        return;
      }

      this.remainingTime -= 1

      const countdownElement = document.getElementById('countdown');
      if (!countdownElement) return;
      countdownElement.textContent = `Time: ${this.remainingTime}`;
    }, 1000);

    setTimeout(() => {
        clearInterval(countdownInterval);
    }, 31000)
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
