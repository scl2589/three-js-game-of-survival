import Experience from "../Experience";
import Character from "./Character.ts";
import Environment from "./Environment";
import RoadSet from './RoadSet';
import * as THREE from "three";

export default class World {
  experience: Experience;
  roadSets: RoadSet[];
  character?: Character;
  environment?: Environment;
  score: number;
  baseSpeed: number;
  regenTime: number;

  constructor() {
    this.experience = Experience.getInstance();
    this.roadSets = [];
    this.score = 10;
    this.baseSpeed = 0.15
    this.regenTime = 2500;

    this.resources.on("ready", () => {
      this.initRoadSets();
      this.character = new Character();
      this.environment = new Environment();
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

    this.roadSets.forEach((roadSet) => roadSet.update(currentSpeed, deltaTime));

    if (this.character) {
      this.character.update();
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
        this.experience.changeToGameScene();
      }, 700);
    }
  }


  resetGame() {
    this.time.reset();
    this.regenTime = 2500;

    // remove all objects from the scene
    this.experience.destroy();

    // Reset score
    this.score = 10;
    this.updateScoreDisplay();

    if (this.character) {
      this.character.play('walking')
      this.character.resetPosition();
      this.character.resetBullets();
    }
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get time() {
    return this.experience.time;
  }
}
