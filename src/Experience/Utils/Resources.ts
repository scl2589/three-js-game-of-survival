import * as THREE from "three";

import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import EventEmitter from "./EventEmitter";
import { Source } from "../sources";

export default class Resources extends EventEmitter {
  sources: Source[];
  items: { [key: string]: GLTF | THREE.Texture | THREE.CubeTexture };
  toLoad: number;
  loaded: number;
  loaders: {
    gltfLoader: GLTFLoader;
    textureLoader: THREE.TextureLoader;
    cubeTextureLoader: THREE.CubeTextureLoader;
  };

  constructor(sources: Source[]) {
    super();

    // Options
    this.sources = sources;

    // Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
    };

    this.startLoading();
  }

  startLoading() {
    this.sources.forEach((source) => {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path[0], (file) => {
          this.sourceLoaded(source, file);
        });
        return;
      }
      if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path[0], (file) => {
          this.sourceLoaded(source, file);
        });
        return;
      }
      if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
        return;
      }
    });
  }

  sourceLoaded(source: Source, file: GLTF | THREE.Texture | THREE.CubeTexture) {
    this.items[source.name] = file;
    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
