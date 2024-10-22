import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, query, orderBy, limit } from "firebase/firestore";

import Experience from "../Experience";
import Character from "./Character.ts";
import Environment from "./Environment";
import RoadSet from './RoadSet';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default class World {
  experience: Experience;
  roadSets: RoadSet[];
  character?: Character;
  environment?: Environment;
  score: number;
  baseSpeed: number;
  regenTime: number;
  gameStatus: string;

  constructor() {
    this.experience = Experience.getInstance();
    this.roadSets = [];
    this.score = 10;
    this.baseSpeed = 0.15
    this.regenTime = 2500;
    this.gameStatus = 'start'

    this.updateLeaderboard();

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


  updateRemainingTime() {
    const scoreElement = document.getElementById('countdown');
    if (scoreElement) {
      scoreElement.textContent = `Time: ${this.experience.remainingTime}`;
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

    if (this.score <= 0) {
        this.endGame();
    }
  }


  resetGame() {
    this.regenTime = 2500;

    // remove all objects from the scene
    this.experience.destroy();

    // Reset score
    this.score = 10.0;
    this.experience.remainingTime = 31;
    this.updateScoreDisplay();
    this.updateRemainingTime();

    this.gameStatus = 'start'

    if (this.character) {
      this.character.play('walking')
      this.character.resetPosition();
      this.character.resetBullets();
    }
  }

  async updateLeaderboard() {
    const scores = await this.getAllScores();

    const scoreboard = document.querySelector('.scores');
    if (!scoreboard || !scores) return;
    scoreboard.textContent = '';

    scores.map((rank, index) => {
      const containerElement = document.createElement('div');
      containerElement.classList.add('score-container');

      const leftElement = document.createElement('div');
      leftElement.classList.add('nickname-container')

      const rankElement = document.createElement('div');
      rankElement.classList.add('ranking');
      rankElement.textContent = `${index+ 1}. `;

      const nicknameElement = document.createElement('div');
      nicknameElement.classList.add('nickname');
      nicknameElement.textContent = `${rank.nickname}`;

      leftElement.appendChild(rankElement)
      leftElement.appendChild(nicknameElement)

      const scoreElement = document.createElement('div');
      scoreElement.classList.add('score');
      scoreElement.textContent = `${rank.score.toLocaleString()}`;

      containerElement.appendChild(leftElement)
      containerElement.appendChild(scoreElement)
      scoreboard?.appendChild(containerElement);
    })
  }

  // Function to get all scores
  async getAllScores() {
    const scoresRef = collection(db, "scoreboard");
    const q = query(scoresRef, orderBy("score", "desc"), limit(10));

    try {
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map(doc => ({
        nickname: doc.id,
        score: doc.data().score,
      }));
      return scores;
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  }

  endGame() {
    if (this.gameStatus === 'end' || !this.character) return;
    this.gameStatus = 'end';

    this.experience.playEndSound();
    this.character.play('death');

    setTimeout(async() => {
      const nickname = prompt(`Game Over!\nYour score is: ${this.score}\nPlease type your nickname for your ranking.`);
      if (nickname) {
        // add to the db
        const userRef = doc(db, "scoreboard", nickname);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().score < this.score) {
          await setDoc(userRef, {
            score: Math.floor(this.score),
            timestamp: new Date()
          });
        }
      }
      this.resetGame();
      await this.updateLeaderboard();
      this.experience.changeToStartScene();
    }, 700);
  }

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get time() {
    return this.experience.time;
  }
}
