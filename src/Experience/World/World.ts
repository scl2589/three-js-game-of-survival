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
  baseSpeed: number;
  regenTime: number;

  constructor() {
    this.experience = Experience.getInstance();
    this.roadSets = [];
    this.score = 10;
    this.bannerInitialized = false;
    this.bannerStartTime = 0;
    this.enemyInitialized = false;
    this.enemyStartTime = 0;
    this.baseSpeed = 0.15
    this.regenTime = 2500;

    this.resources.on("ready", () => {
      this.initRoadSets();
      this.character = new Character();
      this.environment = new Environment();

      this.bannerStartTime = this.time.elapsed;
      this.enemyStartTime = this.time.elapsed;
    });
  }

  private get resources() {
    return this.experience.resources;
  }

  update() {
    const deltaTime = this.time.delta / 10; // 밀리초를 초 단위로 변환
    const speedMultiplier = 1 + (this.time.elapsed / 10000)
    const currentSpeed = this.baseSpeed * speedMultiplier;

    this.regenTime = 2500 / speedMultiplier / 5;



    this.roadSets.forEach((roadSet) => roadSet.update(currentSpeed, deltaTime, this.character));

    if (this.character) {
      this.character.update();

      // Trigger banner initialization after 2.5 seconds
      if (!this.bannerInitialized && (this.time.elapsed - this.bannerStartTime) > this.regenTime) {
        this.bannerManager = new Banner();
        this.bannerInitialized = true;
      }

      // Update banners if they exist
      if (this.bannerManager) {
        this.bannerManager.updateBanners(this.character, currentSpeed);
      }

      // if (!this.enemyInitialized && (this.time.elapsed - this.enemyStartTime ) > this.regenTime) {
      //   this.enemy = new Enemy();
      //   this.enemyInitialized = true;
      // }
      //
      // if (this.enemy) {
      //   this.enemy.updateEnemy(this.character,currentSpeed)
      // }
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
    this.time.reset();

    // Reset score
    this.score = 10;
    this.updateScoreDisplay();

    // Reset speed and initial values
    this.baseSpeed = 0.15;
    this.regenTime = 2500;

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

    // if (this.enemy) {
    //   Enemy.enemies.forEach((enemyGroup) => {
    //     this.gameScene.remove(enemyGroup);
    //   });
    //   Enemy.enemies = [];
    //   Enemy.lastEnemyTime = this.time.elapsed + 1250;
    // }

    if (this.bannerManager) {
      Banner.banners.forEach((bannerGroup) => {
        this.gameScene.remove(bannerGroup);
      });
      Banner.banners = [];
      Banner.lastBannerTime = this.time.elapsed;
    }
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get time() {
    return this.experience.time;
  }
}
