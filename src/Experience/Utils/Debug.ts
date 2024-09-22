import GUI from "lil-gui";
import EventEmitter from "./EventEmitter";

export default class Debug extends EventEmitter {
  ui: GUI | null;

  constructor() {
    super();
    this.ui = null;

    window.addEventListener("hashchange", () => this._update());
    this._update();
  }

  private _update() {
    const has = window.location.hash === "#debug";

    if (this.ui) {
      this.ui.destroy();
      this.ui = null;
    }

    if (has) {
      this.ui = new GUI();
      this.trigger("open");
    }
  }

  get active() {
    return this.ui !== null;
  }
}
