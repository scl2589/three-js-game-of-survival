export type Source = {
  name: string;
  type: string;
  path: string[];
};

export default [
    // grass
  {
    name: "grassColorTexture",
    type: "texture",
    path: ["./grass/grass_BaseColor.jpg"],
  },
  {
    name: "grassNormalTexture",
    type: "texture",
    path: ["./grass/grass_Normal.jpg"],
  },
  {
    name: "grassAmbientOcclusionTexture",
    type: "texture",
    path: ["./grass/grass_AmbientOcclusion.jpg"],
  },
  {
    name: "grassMetallicTexture",
    type: "texture",
    path: ["./grass/grass_Metallic.jpg"],
  },
  {
    name: "grassRoughnessTexture",
    type: "texture",
    path: ["./grass/grass_Roughness.jpg"],
  },
  // Sidewalk
  {
    name: "sidewalkColorTexture",
    type: "texture",
    path: ["./sidewalk/sidewalk_diff_1k.jpg"],
  },
  {
    name: "sidewalkNormalTexture",
    type: "texture",
    path: ["./sidewalk/sidewalk_nor_gl_1k.jpg"],
  },
  {
    name: "sidewalkARMTexture",
    type: "texture",
    path: ["./sidewalk/sidewalk_arm_1k.jpg"],
  },
  {
    name: "sidewalkDisplacementTexture",
    type: "texture",
    path: ["./sidewalk/sidewalk_disp_1k.jpg"],
  },
  // Road
  {
    name: "roadColorTexture",
    type: "texture",
    path: ["./road/Road_001_color.jpg"],
  },
  {
    name: "roadNormalTexture",
    type: "texture",
    path: ["./road/Road_001_normal.jpg"],
  },
  {
    name: "roadAmbientOcclusionTexture",
    type: "texture",
    path: ["./road/Road_001_ambientOcclusion.jpg"],
  },
  {
    name: "roadDisplacementTexture",
    type: "texture",
    path: ["./road/Road_001_height.png"],
  },
  {
    name: "roadRoughnessTexture",
    type: "texture",
    path: ["./road/Road_001_roughness.jpg"],
  },
  {
    name: "characterModel1",
    type: "gltfModel",
    path: ["models/Character/Character1.glb"],
  },
  {
    name: "characterModel2",
    type: "gltfModel",
    path: ["models/Character/Character2.glb"],
  },
  {
    name: "characterModel3",
    type: "gltfModel",
    path: ["models/Character/Character3.glb"],
  },
  {
    name: "enemyModel1",
    type: "gltfModel",
    path: ["models/Enemy/Enemy1.glb"],
  },
  {
    name: "enemyModel2",
    type: "gltfModel",
    path: ["models/Enemy/Enemy2.glb"],
  },
  {
    name: "enemyModel3",
    type: "gltfModel",
    path: ["models/Enemy/Enemy3.glb"],
  },
  {
    name: "environmentMapTexture",
    type: "cubeTexture",
    path: [
      "textures/environmentMap/px.jpg",
      "textures/environmentMap/nx.jpg",
      "textures/environmentMap/py.jpg",
      "textures/environmentMap/nx.jpg",
      "textures/environmentMap/pz.jpg",
      "textures/environmentMap/nz.jpg",
    ],
  },
] as Source[];
