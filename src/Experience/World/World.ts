import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, query, orderBy } from "firebase/firestore";

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

  constructor() {
    this.experience = Experience.getInstance();
    this.roadSets = [];
    this.score = 10;
    this.baseSpeed = 0.15
    this.regenTime = 2500;

    this.addScoreboard();

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

      setTimeout(async() => {
        const score = this.time.elapsed
        const nickname = prompt(`Game Over!\nYour score is: ${score}\nPlease type your nickname for your ranking.`);
        if (nickname) {
          // add to the db
          const userRef = doc(db, "scoreboard", nickname);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists() || userSnap.data().score < score) {
            await setDoc(userRef, {
              score: score,
              timestamp: new Date()
            });
          }
        }
        await this.addScoreboard();
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

  async addScoreboard() {
    const scores = await this.getAllScores();

    const scoreboard = document.querySelector('.scores');
    if (!scoreboard || !scores) return;
    scoreboard.textContent = '';

    scores.map((rank, index) => {
      const containerElement = document.createElement('div');
      containerElement.classList.add('score-container');

      const rankElement = document.createElement('div');
      rankElement.classList.add('ranking');
      rankElement.textContent = `${index+ 1}. `;

      const nicknameElement = document.createElement('div');
      nicknameElement.classList.add('nickname');
      nicknameElement.textContent = `${rank.nickname}`;

      const scoreElement = document.createElement('div');
      scoreElement.classList.add('score');
      scoreElement.textContent = `${rank.score.toLocaleString()}`;

      containerElement.appendChild(rankElement)
      containerElement.appendChild(nicknameElement);
      containerElement.appendChild(scoreElement)
      scoreboard?.appendChild(containerElement);
    })
  }

  // Function to get all scores
  async getAllScores() {
    const scoresRef = collection(db, "scoreboard");
    const q = query(scoresRef, orderBy("score", "desc"));

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

  private get gameScene() {
    return this.experience.gameScene;
  }

  private get time() {
    return this.experience.time;
  }
}
