/**
 * Environment class for the game world
 */
class Environment {
    constructor(scene, options = {}) {
        this.scene = scene;
        
        // Environment properties
        this.scrollSpeed = options.scrollSpeed || 10;
        this.groundSize = options.groundSize || 1000;
        this.textureSize = options.textureSize || 100;
        this.mountainRadius = options.mountainRadius || 500;
        this.mountainCount = options.mountainCount || 20;
        this.cloudCount = options.cloudCount || 30;
        
        // Environment objects
        this.ground = null;
        this.mountains = null;
        this.clouds = null;
        this.stars = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the environment
     */
    init() {
        // Create ground
        this.createGround();
        
        // Create distant mountains
        this.createMountains();
        
        // Create clouds
        this.createClouds();
        
        // Create stars
        this.createStars();
        
        return this;
    }
    
    /**
     * Create the scrolling ground plane
     */
    createGround() {
        // Create ground geometry
        const groundGeometry = new THREE.PlaneGeometry(this.groundSize, this.groundSize, 32, 32);
        
        // Create grid texture for ground
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Fill background
        context.fillStyle = '#111122';
        context.fillRect(0, 0, 512, 512);
        
        // Draw grid lines
        context.strokeStyle = '#2233ff';
        context.lineWidth = 2;
        
        const gridSize = 64;
        for (let i = 0; i <= canvas.width; i += gridSize) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, canvas.height);
            context.stroke();
            
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(canvas.width, i);
            context.stroke();
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(this.groundSize / this.textureSize, this.groundSize / this.textureSize);
        
        // Create ground material
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create ground mesh
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -2;
        this.ground.receiveShadow = true;
        
        // Add to scene
        this.scene.add(this.ground);
    }
    
    /**
     * Create distant mountains
     */
    createMountains() {
        // Create mountain geometry
        const mountainGeometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < this.mountainCount; i++) {
            const angle = (i / this.mountainCount) * Math.PI * 2;
            const radius = this.mountainRadius + (Math.random() * 100 - 50);
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const height = 30 + Math.random() * 70;
            
            // Create a simple triangle for each mountain
            vertices.push(
                x, 0, z,
                x + 20, 0, z + 20,
                x, height, z
            );
        }
        
        mountainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        mountainGeometry.computeVertexNormals();
        
        // Create mountain material
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x334466,
            roughness: 1,
            flatShading: true
        });
        
        // Create mountain mesh
        this.mountains = new THREE.Mesh(mountainGeometry, mountainMaterial);
        
        // Add to scene
        this.scene.add(this.mountains);
    }
    
    /**
     * Create clouds
     */
    createClouds() {
        // Create cloud group
        this.clouds = new THREE.Group();
        
        // Create individual clouds
        for (let i = 0; i < this.cloudCount; i++) {
            const cloudGeometry = new THREE.SphereGeometry(5 + Math.random() * 15, 8, 8);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7 + Math.random() * 0.3,
                roughness: 1
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * 200;
            cloud.position.set(
                Math.sin(angle) * radius,
                40 + Math.random() * 60,
                Math.cos(angle) * radius
            );
            
            cloud.scale.y = 0.5;
            this.clouds.add(cloud);
        }
        
        // Add to scene
        this.scene.add(this.clouds);
    }
    
    /**
     * Create stars
     */
    createStars() {
        // Create star geometry
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random position in a sphere
            const radius = 500;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i3 + 2] = radius * Math.cos(phi);
            
            // Random color (white to blue)
            const colorFactor = Math.random();
            starColors[i3] = 0.8 + colorFactor * 0.2; // R
            starColors[i3 + 1] = 0.8 + colorFactor * 0.2; // G
            starColors[i3 + 2] = 1.0; // B
            
            // Random size
            starSizes[i] = Math.random() * 2;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        
        // Create star material
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        // Create star points
        this.stars = new THREE.Points(starGeometry, starMaterial);
        
        // Add to scene
        this.scene.add(this.stars);
    }
    
    /**
     * Update the environment
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Scroll ground texture
        if (this.ground && this.ground.material && this.ground.material.map) {
            this.ground.material.map.offset.y += this.scrollSpeed * deltaTime / this.textureSize;
        }
        
        // Rotate clouds
        if (this.clouds) {
            this.clouds.rotation.y += deltaTime * 0.01;
        }
        
        // Rotate stars
        if (this.stars) {
            this.stars.rotation.y += deltaTime * 0.005;
        }
    }
    
    /**
     * Set the scroll speed
     * @param {number} speed - New scroll speed
     */
    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
    }
    
    /**
     * Create a random terrain feature at a position
     * @param {THREE.Vector3} position - Position to create the feature
     */
    createTerrainFeature(position) {
        // Randomly select a feature type
        const featureType = Math.random() < 0.7 ? 'rock' : 'tree';
        
        if (featureType === 'rock') {
            this.createRock(position);
        } else {
            this.createTree(position);
        }
    }
    
    /**
     * Create a rock at a position
     * @param {THREE.Vector3} position - Position to create the rock
     */
    createRock(position) {
        // Create rock geometry
        const rockGeometry = new THREE.DodecahedronGeometry(1 + Math.random() * 2, 0);
        
        // Distort vertices for more natural look
        const positionAttribute = rockGeometry.getAttribute('position');
        const vertices = positionAttribute.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] += (Math.random() - 0.5) * 0.4;
            vertices[i + 1] += (Math.random() - 0.5) * 0.4;
            vertices[i + 2] += (Math.random() - 0.5) * 0.4;
        }
        
        positionAttribute.needsUpdate = true;
        rockGeometry.computeVertexNormals();
        
        // Create rock material
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
        
        // Create rock mesh
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.copy(position);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        // Add to scene
        this.scene.add(rock);
        
        // Remove after a delay
        setTimeout(() => {
            this.scene.remove(rock);
            rockGeometry.dispose();
            rockMaterial.dispose();
        }, 10000);
    }
    
    /**
     * Create a tree at a position
     * @param {THREE.Vector3} position - Position to create the tree
     */
    createTree(position) {
        // Create tree group
        const tree = new THREE.Group();
        
        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Create foliage
        const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.8,
            metalness: 0.1
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 4;
        foliage.castShadow = true;
        tree.add(foliage);
        
        // Position tree
        tree.position.copy(position);
        
        // Add to scene
        this.scene.add(tree);
        
        // Remove after a delay
        setTimeout(() => {
            this.scene.remove(tree);
            trunkGeometry.dispose();
            trunkMaterial.dispose();
            foliageGeometry.dispose();
            foliageMaterial.dispose();
        }, 10000);
    }
    
    /**
     * Create a random terrain feature at a random position
     * @param {number} minX - Minimum X coordinate
     * @param {number} maxX - Maximum X coordinate
     * @param {number} minZ - Minimum Z coordinate
     * @param {number} maxZ - Maximum Z coordinate
     */
    createRandomTerrainFeature(minX, maxX, minZ, maxZ) {
        const position = new THREE.Vector3(
            minX + Math.random() * (maxX - minX),
            0,
            minZ + Math.random() * (maxZ - minZ)
        );
        
        this.createTerrainFeature(position);
    }
}