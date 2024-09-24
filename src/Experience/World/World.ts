import Experience from "../Experience";
import Character from "./Character.ts";
import Enemy from './Enemy';
import Environment from "./Environment";
import RoadSet from './RoadSet';
import Banner from './Banner';

export default class World {
  experience: Experience;
  bannerManager?: Banner;
  roadSets: RoadSet[];
  character?: Character;
  enemy?: Enemy;
  environment?: Environment;
  score: number;
  enemyInitialized: boolean;
  enemyStartTime: number;
  bannerInitialized: boolean;
  bannerStartTime: number;

  constructor() {
    this.experience = Experience.getInstance();
    this.roadSets = [];
    this.score = 10;
    this.bannerInitialized = false;
    this.bannerStartTime = 0;
    this.enemyInitialized = false;
    this.enemyStartTime = 0;

    this.resources.on("ready", () => {
      this.initRoadSets();
      this.initEnemies();
      this.character = new Character();
      this.environment = new Environment();
      this.bannerStartTime = this.time.elapsed;
      this.bannerManager = new Banner();
      this.enemyStartTime = this.time.elapsed + 1250;
    });
  }

  private get resources() {
    return this.experience.resources;
  }

  update() {
    const baseSpeed = 0.15;
    this.roadSets.forEach((roadSet) => roadSet.update(baseSpeed));

    if (this.character) {
      this.character.update();

      // Trigger banner initialization after 2.5 seconds
      if (!this.bannerInitialized && (this.time.elapsed - this.bannerStartTime) > 2500) {
        this.bannerManager = new Banner();
        this.bannerInitialized = true;
      }

      // Update banners if they exist
      if (this.bannerManager) {
        this.bannerManager.updateBanners(this.character);
      }

      if (!this.enemyInitialized && (this.time.elapsed - this.enemyStartTime ) > 2500) {
        this.enemy = new Enemy();
        this.enemyInitialized = true;
      }

      if (this.enemy) {
        this.enemy.updateEnemy(this.character)
      }
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
      this.gameScene.add(roadSet.group);
    }
  }

  initEnemies() {
    // Similar logic for initializing enemies
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score.toFixed(1)}`;
    }
  }

  calculateScore(operator: string, value: number) {
    switch (operator) {
      case '+': this.score += value; break;
      case '-': this.score -= value; break;
      case 'x': this.score *= value; break;
      case '÷': this.score /= value; break;
    }
    this.updateScoreDisplay();

    if (this.score <= 0 && this.character) {
      this.character.play('death');

      setTimeout(() => {
        window.alert("Game Over!\nThe game will restart once the alert is closed.");
        this.resetGame();
      }, 700);
    }
  }

  resetGame() {
    this.time.elapsed = 0;

    // Reset score
    this.score = 10;
    this.updateScoreDisplay();

    // Remove all road sets
    this.roadSets.forEach((roadSet) => {
      this.gameScene.remove(roadSet.group);
    });
    this.roadSets = [];

    // Re-initialize game elements
    this.initRoadSets();

    if (this.character) {
      this.character.play('walking')
      this.character.resetPosition();
    }

    if (this.enemy) {
      Enemy.enemies.forEach((enemyGroup) => {
        this.gameScene.remove(enemyGroup);
      });
      Enemy.enemies = [];
      Enemy.lastEnemyTime = 550;
    }

    if (this.bannerManager) {
      Banner.banners.forEach((bannerGroup) => {
        this.gameScene.remove(bannerGroup);
      });
      Banner.banners = [];
      Banner.lastBannerTime = 0;
    }
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get time() {
    return this.experience.time;
  }
}
