import Experience from "../Experience";
import Character from "./Character.ts";
import Enemy from './Enemy'
import Environment from "./Environment";
import RoadSet from './RoadSet'
import Banner from './Banner'
import * as THREE from "three";

class CustomBanner extends THREE.Mesh {
  operator: string;
  value: number;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, value: number, operator: string) {
    super(geometry, material);
    this.value = value;
    this.operator = operator;
  }
}

// Represents a group of banners
class CustomBannerGroup extends THREE.Group {}

// class CustomEnemyGroup extends THREE.Group {}

export default class World {
  experience: Experience;
  banners: CustomBannerGroup[];
  enemies: CustomBannerGroup[];
  roadSets: RoadSet[];
  character?: Character;
  enemy?: Enemy;
  environment?: Environment;
  lastBannerTime: number;
  bannerInterval: number;
  lastEnemyTime: number;
  score: number;


  constructor() {
    this.experience = Experience.getInstance();
    this.roadSets = [];
    this.banners = [];
    this.enemies = [];
    this.score = 10;
    this.lastBannerTime = 0;
    this.bannerInterval = 2500; // 2.5 seconds
    this.lastEnemyTime = 0;

    this.resources.on("ready", () => {
      // Setup
      this.initRoadSets();
      this.initEnemies();
      this.character = new Character();
      this.environment = new Environment();
    });
  }

  private get resources() {
    return this.experience.resources;
  }

  update() {
    const initialInterval = 2500
    const minInterval = 1000;
    const timeFactor = 0.1;

    if (this.roadSets) {
      const baseSpeed = 0.15;
      // 바닥 움직이기
      this.roadSets.forEach((roadSet: RoadSet) => roadSet.update(baseSpeed))
    }

    if (this.character) {
      this.character.update();
    }

    // if (this.enemies) {
    //   this.enemies.forEach((enemyGroup) => {
    //     enemyGroup.children.forEach((enemy) => {
    //       console.log("ENEMY", enemy)
    //     })
    //   })
    // }

    // if (this.enemies) {
    //   // Check if it's time to create new banners
    //   if (this.time.elapsed - this.lastEnemyTime > this.bannerInterval) {
    //     this.initEnemies();
    //     this.lastEnemyTime = this.time.elapsed;
    //   }
    //
    //   // Move Enemies
    //   const enemySpeed = 0.5;
    //   for (let i = this.enemies.length - 1; i >= 0; i--) {
    //     const enemyGroup = this.enemies[i];
    //     enemyGroup.position.z += enemySpeed;
    //
    //     if (!(this.character && this.character.model)) return;
    //
    //     // Check collision of each banner with the character
    //     for (let i = 0; i < enemyGroup.children.length; i++) {
    //       const enemy = enemyGroup.children[i] as CustomBanner;
    //       if (enemyGroup.position.z === this.character.model.position.z && this.character.checkCollision(enemy)) {
    //
    //         // const bannerValue = enemy.value;
    //         enemyGroup.remove(enemy);
    //       }
    //     }
    //
    //     // Remove banner if it's passed the character's position + 5
    //     if (enemyGroup.position.z > this.character.model.position.z + 5) {
    //       this.gameScene.remove(enemyGroup);
    //       this.enemies.splice(i, 1);
    //     }
    //   };
    // }

    if (this.banners && this.character && this.character.model) {
      // this.bannerInterval =  Math.max(initialInterval - this.time.elapsed * timeFactor, minInterval);
      this.bannerInterval =  Math.max(initialInterval - this.time.elapsed * timeFactor, minInterval);

      // Check if it's time to create new banners
      if (this.time.elapsed - this.lastBannerTime > this.bannerInterval) {
        this.initBanners();
        this.lastBannerTime = this.time.elapsed;
      }

      // Move banners
      const bannerSpeed = 0.5;
      for (let i = this.banners.length - 1; i >= 0; i--) {
        const bannerGroup = this.banners[i];
        bannerGroup.position.z += bannerSpeed;

        // Check collision of each banner with the character
        for (let i = 0; i < bannerGroup.children.length; i++) {
          const banner = bannerGroup.children[i] as CustomBanner;
          if (bannerGroup.position.z === this.character.model.position.z && this.character.checkCollision(banner)) {

            const bannerValue = banner.value;
            const bannerOperator = banner.operator;
            this.calculateScore(bannerOperator, bannerValue)
            bannerGroup.remove(banner);
          }
        }

        // Remove banner if it's passed the character's position + 5
        if (bannerGroup.position.z > this.character.model.position.z + 5) {
          this.gameScene.remove(bannerGroup);
          this.banners.splice(i, 1);
        }
      };
    }

  }

  initRoadSets() {
    const numberOfRoadSets = 3;
    const initialPositionZ = -200;
    const spacing = 200;

    for (let i = 0; i < numberOfRoadSets; i++) {
      const roadSet = new RoadSet();
      roadSet.group.position.z = initialPositionZ + i * spacing;
      this.roadSets.push(roadSet);
      this.gameScene.add(roadSet.group)
    }
  }

  initBanners() {
    const minX = -10;
    const maxX = 5;
    const bannerWidth = 5;
    const minDistance = bannerWidth + 1; // buffer in between the banners

    const [x1, x2] = Banner.getNonOverlappingPositions(minX, maxX, minDistance);

    const banner1 = new Banner();
    banner1.group.position.set(x1, 2, 0)

    const banner2 = new Banner();
    banner2.group.position.set(x2, 2, 0)

    const bannerGroup = new CustomBannerGroup();
    bannerGroup.position.z = -100;
    bannerGroup.add(banner1.group, banner2.group);
    this.banners.push(bannerGroup)
    this.gameScene.add(bannerGroup);
  }

  initEnemies () {
    const minX = -10;
    const maxX = 5;
    const enemyWidth = 5;
    const minDistance = enemyWidth + 1; // buffer in between the enemies

    const [x1, x2] = Enemy.getNonOverlappingPositions(minX, maxX, minDistance);

    const enemy1 = new Enemy();
    const enemy2 = new Enemy();

    enemy1.group.position.set(x1, 2, 0)
    enemy2.group.position.set(x2, 2, 0)

    const enemyGroup = new CustomBannerGroup();
    enemyGroup.position.z = -100

    // console.log("POS", enemy1.group.position)

    enemyGroup.add(enemy1.group, enemy2.group);
    console.log('Enemy group children:', enemyGroup.children);
    this.enemies.push(enemyGroup);
    this.gameScene.add(enemyGroup);
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score.toFixed(1)}`;
    }
  }

  async calculateScore(operator: string, value: number) {
    switch (operator) {
      case '+':
        this.score += value;
        break;
      case '-':
        this.score -= value;
        break;
      case 'x':
        this.score *= value;
        break;
      case '÷':
        this.score /= value;
        break;
    }

    // Update the score
    this.updateScoreDisplay();

    if (this.score <= 0) {
      setTimeout(async () => {
        if (this.character) {
          await this.character.play("death");
        }
        setTimeout(() => {
          window.alert("Game Over!\nThe game will restart once the alert is closed.");
          this.resetGame();
        }, 700)
      })
    }
  }

  resetGame() {
    // Reset start time
    this.time.elapsed = 0;

    // Reset score
    this.score = 10;
    this.updateScoreDisplay();

    // Remove all existing banners
    this.banners.forEach((bannerGroup) => {
      this.gameScene.remove(bannerGroup);
    });
    this.banners = [];

    // Remove all road sets
    this.roadSets.forEach((roadSet) => {
      this.gameScene.remove(roadSet.group);
    });
    this.roadSets = [];

    // Re-initialize game elements
    this.initRoadSets();

    if (this.character) {
      this.character.resetPosition();
      this.character.play("walking");
    }

    // Reset the last banner creation time
    this.lastBannerTime = 0;
    this.bannerInterval = 2500;
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get time() {
    return this.experience.time;
  }

}
