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
  countdownInterval?: ReturnType<typeof setInterval>;
  startSound?: THREE.Audio;
  gameSound?: THREE.Audio;
  endSound?: THREE.Audio;
  timeoutRef?: ReturnType<typeof setTimeout>

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
    this.remainingTime = 30;
    this.loadFont();
    this.loadSounds();

    this.addClickEvent();
  }

  addClickEvent() {
    document.addEventListener('DOMContentLoaded', () => {
      const startButton = document.getElementById('startButton');
      const canvas: HTMLCanvasElement | null = document.querySelector('canvas.webgl');

      startButton?.addEventListener('click', () => {
        this.playStartSound();

        setTimeout(() => {
          startButton.style.display = 'none';
          canvas ? canvas.style.display = 'block' : null;

          this.initGame();
        }, 1000);

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
    this.playGameSound();

    // Sizes resize event
    this.sizes.on("resize", () => this.resize());

    // Reset time and time tick event
    this.time.reset();
    this.time.on("tick", () => this.update());

    this.updateCountdown();

    // instructions
    this.createInstructionsText();

    this.hideInstructionsText();
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

  hideInstructionsText() {
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

  updateCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }

    this.countdownInterval = setInterval(() => {
      if (this.remainingTime < 1) {
        this.world.endGame();
        return;
      }

      this.remainingTime -= 1

      const countdownElement = document.getElementById('countdown');
      if (!countdownElement) return;
      countdownElement.textContent = `Time: ${this.remainingTime}`;
    }, 1000);

    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = undefined;
    }


    this.timeoutRef = setTimeout(() => {
        clearInterval(this.countdownInterval);
        this.countdownInterval = undefined;
    }, 32000)
  }

  loadSounds() {
    const audioLoader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();

    this.startSound = new THREE.Audio(listener);
    audioLoader.load('/sounds/game_start.mp3', (buffer) => {
      this.startSound?.setBuffer(buffer);
      this.startSound?.setVolume(0.5);
    });

    this.gameSound = new THREE.Audio(listener);
    audioLoader.load('/sounds/bgm.mp3', (buffer) => {
      this.gameSound?.setBuffer(buffer);
      this.gameSound?.setLoop(true);
      this.gameSound?.setVolume(0.5);
    });

    this.endSound = new THREE.Audio(listener);
    audioLoader.load('/sounds/game_over.mp3', (buffer) => {
      this.endSound?.setBuffer(buffer);
      this.endSound?.setVolume(0.5);
    });
  }

  playStartSound() {
    this.stopAllSounds();
    this.startSound?.play();
  }

  playGameSound() {
    this.stopAllSounds();
    this.gameSound?.play();
  }

  playEndSound() {
    this.stopAllSounds();
    this.endSound?.play();
  }

  stopAllSounds() {
    this.startSound?.stop();
    this.gameSound?.stop();
    this.endSound?.stop();
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
