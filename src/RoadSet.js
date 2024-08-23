import * as THREE from "three";

export class RoadSet {
    constructor(textureLoader) {
        this.group = new THREE.Group();

        this.createGround();
        this.createGrass(textureLoader);
        this.createRoad(textureLoader);
        this.createSidewalk(textureLoader);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 10, 10 )
        const groundMaterial = new THREE.MeshBasicMaterial({
            color: '#FFFFFF',
            wireframe: false,
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI * -0.5

        this.group.add(ground)
    }

    createGrass(textureLoader) {
        // Texture
        const grassNormalTexture = textureLoader.load('./grass/grass_Normal.jpg')
        const grassColorTexture = textureLoader.load('./grass/grass_BaseColor.jpg')
        const grassAmbientOcclusionTexture = textureLoader.load('./grass/grass_AmbientOcclusion.jpg')
        const grassMetallicTexture = textureLoader.load('./grass/grass_Metallic.jpg')
        const grassRoughnessTexture = textureLoader.load('./grass/grass_Roughness.jpg')
        const grassDisplacementTexture = textureLoader.load('./grass/grass_Displacement.jpg')

        grassColorTexture.colorSpace = THREE.SRGBColorSpace
        grassColorTexture.repeat.set(2, 12)

        grassColorTexture.wrapS = THREE.RepeatWrapping
        grassColorTexture.wrapT = THREE.RepeatWrapping

        // Geometry
        const grassGeometry = new THREE.PlaneGeometry(30, 200, 10, 10);
        const grassMaterial = new THREE.MeshStandardMaterial({
            map: grassColorTexture,
            aoMap: grassAmbientOcclusionTexture,
            roughnessMap: grassRoughnessTexture,
            metalnessMap: grassMetallicTexture,
            normalMap: grassNormalTexture,
            wireframe: false,
        });
        const grass1 = new THREE.Mesh(grassGeometry, grassMaterial);
        grass1.rotation.x = Math.PI * -0.5
        grass1.position.set(-15, 0.02, 0)

        const grass2 = new THREE.Mesh(grassGeometry, grassMaterial);
        grass2.rotation.x = Math.PI * -0.5
        grass2.position.set(15, 0.02, 0)

        this.group.add(grass1, grass2)
    }

    createRoad(textureLoader) {
        const roadNormalTexture = textureLoader.load('./road/Road_001_normal.jpg');
        const roadDisplacementTexture = textureLoader.load('./road/Road_001_height.jpg');
        const roadRoughnessTexture = textureLoader.load('./road/Road_001_roughness.jpg');
        const roadAmbientOcclusionTexture = textureLoader.load('./road/Road_001_ambientOcclusion.jpg');
        const roadColorTexture = textureLoader.load('./road/Road_001_color.jpg');

        roadColorTexture.colorSpace = THREE.SRGBColorSpace;

        roadColorTexture.repeat.set(3, 10);
        roadNormalTexture.repeat.set(3, 10);

        roadColorTexture.wrapS = THREE.RepeatWrapping;
        roadColorTexture.wrapT = THREE.RepeatWrapping;

        roadNormalTexture.wrapS = THREE.RepeatWrapping;
        roadNormalTexture.wrapT = THREE.RepeatWrapping;

        roadDisplacementTexture.wrapS = THREE.RepeatWrapping;
        roadDisplacementTexture.wrapT = THREE.RepeatWrapping;

        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 200),
            new THREE.MeshStandardMaterial({
                map: roadColorTexture,
                aoMap: roadAmbientOcclusionTexture,
                roughnessMap: roadRoughnessTexture,
                displacementMap: roadDisplacementTexture,
                displacementScale: 0.1,
                displacementBias: -0.2,
                normalMap: roadNormalTexture,
            })
        );

        road.rotation.x = Math.PI * -0.5;
        road.position.y = 0.3; // Avoid z-fighting

        this.group.add(road);
    }

    createSidewalk(textureLoader) {
        const sidewalkNormalTexture = textureLoader.load('./sidewalk/sidewalk_nor_gl_1k.jpg');
        const sidewalkColorTexture = textureLoader.load('./sidewalk/sidewalk_diff_1k.jpg');
        const sidewalkARMTexture = textureLoader.load('./sidewalk/sidewalk_arm_1k.jpg');
        const sidewalkDisplacementTexture = textureLoader.load('./sidewalk/sidewalk_disp_1k.jpg');

        sidewalkColorTexture.colorSpace = THREE.SRGBColorSpace;

        sidewalkColorTexture.repeat.set(2, 12);
        sidewalkARMTexture.repeat.set(2, 12);
        sidewalkNormalTexture.repeat.set(2, 12);
        sidewalkDisplacementTexture.repeat.set(2, 12);

        sidewalkColorTexture.wrapS = THREE.RepeatWrapping;
        sidewalkColorTexture.wrapT = THREE.RepeatWrapping;

        sidewalkARMTexture.wrapS = THREE.RepeatWrapping;
        sidewalkARMTexture.wrapT = THREE.RepeatWrapping;

        sidewalkNormalTexture.wrapS = THREE.RepeatWrapping;
        sidewalkNormalTexture.wrapT = THREE.RepeatWrapping;

        sidewalkDisplacementTexture.wrapS = THREE.RepeatWrapping;
        sidewalkDisplacementTexture.wrapT = THREE.RepeatWrapping;

        const sidewalkMaterial = new THREE.MeshStandardMaterial({
            map: sidewalkColorTexture,
            aoMap: sidewalkARMTexture,
            roughnessMap: sidewalkARMTexture,
            metalnessMap: sidewalkARMTexture,
            normalMap: sidewalkNormalTexture,
            displacementMap: sidewalkDisplacementTexture,
            displacementScale: 0.3,
            displacementBias: -0.2,
        });

        const sidewalk1 = new THREE.Mesh(new THREE.BoxGeometry(10, 200, 2), sidewalkMaterial);
        sidewalk1.position.set(-30, 0, 0);
        sidewalk1.rotation.x = Math.PI * -0.5;

        const sidewalk2 = new THREE.Mesh(new THREE.BoxGeometry(10, 200, 2), sidewalkMaterial);
        sidewalk2.position.set(30, 0, 0);
        sidewalk2.rotation.x = Math.PI * -0.5;

        this.group.add(sidewalk1, sidewalk2);
    }

    move(speed) {
        this.group.position.z += speed;

        // Recycling logic
        if (this.group.position.z > 200) {
            this.group.position.z -= 600; // Move it back behind the last set
        }
    }


}
