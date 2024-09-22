import * as THREE from "three";
import GUI from "lil-gui";

export default class Animation {
  private animations: { [name: string]: THREE.AnimationAction };
  private current?: THREE.AnimationAction;
  private mixer?: THREE.AnimationMixer;

  constructor() {
    this.animations = {};
  }

  setAnimations(
    mixer: THREE.AnimationMixer,
    animations: { [name: string]: THREE.AnimationAction }
  ) {
    this.mixer = mixer;
    this.animations = animations;
  }

  play(name: string) {
    const newAction = this.animations[name];
    if (!newAction) {
      return this;
    }

    newAction.reset();
    newAction.play();
    if (this.current) {
      newAction.crossFadeFrom(this.current, 1, false);
    }

    this.current = newAction;
  }

  update(time: number) {
    if (!this.mixer) {
      return;
    }
    this.mixer.update(time);
  }

  updateDebug(debug: GUI) {
    const names = Object.keys(this.animations);
    const data = names.reduce(
      (obj, key) => ({ ...obj, [key]: () => this.play(key) }),
      {}
    );
    names.forEach((name) => {
      debug.add(data, name).name(`Play ${name}`);
    });
  }
}
