import * as THREE from "three";
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Game } from './Game.js';

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const canvas = document.querySelector('canvas.webgl');

    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        canvas.style.display = 'block';

        initGame();
    });
});

function initGame() {
    /**
     * Base
     */
    const gui = new GUI({ width: 360 });

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('canvas.webgl')
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Scene
    const gameScene = new THREE.Scene();
    // Add background color
    gameScene.background = new THREE.Color(0xAFC5FF);


    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 200, 800);
    gameScene.add(camera);

    /**
     * Light
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // General ambient light
    gameScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Main directional light
    directionalLight.position.set(5, 10, 7.5);
    gameScene.add(directionalLight);


    /**
     * Controls
     */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2.03;
    controls.minPolarAngle = Math.PI / 8;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    /**
     * Initialize and animate the game
     */
    const game = new Game(textureLoader, gameScene);

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    /**
     * 현재 Scene
     */
    let currentScene = gameScene; // Set the initial scene

    /**
     * Soldiers Movement Logic
     */
    let keys = {};
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case "ArrowLeft":
                // Left pressed
                keys[e.key] = 'ArrowLeft'
                break;
            case "ArrowRight":
                // Right pressed
                keys[e.key] = 'ArrowRight'
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function moveSoldiers(soldiers) {
        // Move all soldiers forward
        soldiers.children.forEach((s) => {
            s.position.z += 0.5;

            // Remove soldiers if they go out of bounds
            if (Math.abs(s.position.z) > 200 / 2) {
                gameScene.remove(s);
                soldiers.remove(s);
            }
        });
    }

    /**
     * Animate Loop
     */
    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        if (currentScene !== gameScene) return;

        // Move character
        if (keys['ArrowLeft']) game.character.move('left');
        if (keys['ArrowRight']) game.character.move('right');

        moveSoldiers(game.soldiers);
        game.animate(elapsedTime * 1000);

        controls.update();
        renderer.render(currentScene, camera);
        requestAnimationFrame(animate);
    }

    animate();
}
