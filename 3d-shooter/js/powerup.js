/**
 * PowerUp class for collectible items
 */
class PowerUp extends Entity {
    constructor(scene, options = {}) {
        super(scene, {
            type: 'powerup',
            ...options
        });
        
        // PowerUp-specific properties
        this.powerUpType = options.powerUpType || 'weapon';
        this.speed = options.speed || 5;
        this.rotationSpeed = options.rotationSpeed || 1;
        this.bobAmplitude = options.bobAmplitude || 0.5;
        this.bobFrequency = options.bobFrequency || 2;
        this.spawnTime = Date.now();
        this.lifespan = options.lifespan || 10; // seconds
        this.age = 0;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the power-up
     */
    init() {
        // Create power-up model based on type
        this.createModel();
        
        // Set initial velocity (slowly moving downward)
        this.velocity.z = this.speed;
        
        // Create collider
        this.collider = new THREE.Box3().setFromObject(this.object);
        
        return this;
    }
    
    /**
     * Create the power-up model based on type
     */
    createModel() {
        // Create a group to hold the power-up model
        this.object = new THREE.Group();
        
        // Create model based on power-up type
        switch (this.powerUpType) {
            case 'weapon':
                this.createWeaponPowerUp();
                break;
            case 'bomb':
                this.createBombPowerUp();
                break;
            case 'life':
                this.createLifePowerUp();
                break;
        }
        
        // Add to scene
        this.scene.add(this.object);
    }
    
    /**
     * Create a weapon power-up model
     */
    createWeaponPowerUp() {
        // Create a glowing cube for weapon power-up
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            emissive: 0x00aaaa,
            metalness: 0.5,
            roughness: 0.5
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.object.add(cube);
        
        // Add inner cube
        const innerCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const innerCubeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0x88ffff,
            metalness: 0.8,
            roughness: 0.2
        });
        const innerCube = new THREE.Mesh(innerCubeGeometry, innerCubeMaterial);
        this.object.add(innerCube);
        
        // Add power-up light
        const powerUpLight = new THREE.PointLight(0x00ffff, 1, 5);
        this.object.add(powerUpLight);
        
        // Add aura effect
        this.createAura(0x00ffff);
    }
    
    /**
     * Create a bomb power-up model
     */
    createBombPowerUp() {
        // Create a glowing sphere for bomb power-up
        const sphereGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff00ff,
            emissive: 0xaa00aa,
            metalness: 0.5,
            roughness: 0.5
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.object.add(sphere);
        
        // Add spikes
        const spikeGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff88ff,
            emissive: 0xaa00aa,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const spikePositions = [
            [0, 0.7, 0],
            [0, -0.7, 0],
            [0.7, 0, 0],
            [-0.7, 0, 0],
            [0, 0, 0.7],
            [0, 0, -0.7]
        ];
        
        const spikeRotations = [
            [0, 0, 0],
            [Math.PI, 0, 0],
            [Math.PI / 2, 0, 0],
            [-Math.PI / 2, 0, 0],
            [Math.PI / 2, Math.PI / 2, 0],
            [-Math.PI / 2, Math.PI / 2, 0]
        ];
        
        for (let i = 0; i < spikePositions.length; i++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(...spikePositions[i]);
            spike.rotation.set(...spikeRotations[i]);
            this.object.add(spike);
        }
        
        // Add power-up light
        const powerUpLight = new THREE.PointLight(0xff00ff, 1, 5);
        this.object.add(powerUpLight);
        
        // Add aura effect
        this.createAura(0xff00ff);
    }
    
    /**
     * Create a life power-up model
     */
    createLifePowerUp() {
        // Create a heart shape for life power-up
        const heartShape = new THREE.Shape();
        
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.5, -1, -0.5, -1, 0);
        heartShape.bezierCurveTo(-1, 0.5, 0, 1, 0, 1.5);
        heartShape.bezierCurveTo(0, 1, 1, 0.5, 1, 0);
        heartShape.bezierCurveTo(1, -0.5, 0, -0.5, 0, 0);
        
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.5,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 0.1,
            bevelThickness: 0.1
        });
        
        heartGeometry.scale(0.5, 0.5, 0.5);
        heartGeometry.rotateX(Math.PI / 2);
        
        const heartMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00aa00,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        this.object.add(heart);
        
        // Add power-up light
        const powerUpLight = new THREE.PointLight(0x00ff00, 1, 5);
        this.object.add(powerUpLight);
        
        // Add aura effect
        this.createAura(0x00ff00);
    }
    
    /**
     * Create an aura effect around the power-up
     * @param {number} color - Color of the aura
     */
    createAura(color) {
        const auraGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        this.object.add(aura);
    }
    
    /**
     * Update the power-up
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Update age
        this.age += deltaTime;
        
        // Check if power-up has expired
        if (this.age >= this.lifespan) {
            this.destroy();
            return;
        }
        
        // Make power-up blink when about to expire
        if (this.age > this.lifespan - 3) {
            this.object.visible = Math.floor(this.age * 5) % 2 === 0;
        }
        
        // Rotate power-up
        this.rotation.y += this.rotationSpeed * deltaTime;
        
        // Bob up and down
        const time = Date.now() / 1000;
        const bobOffset = Math.sin(time * this.bobFrequency) * this.bobAmplitude;
        this.position.y = bobOffset;
        
        // Call parent update
        super.update(deltaTime);
    }
    
    /**
     * Handle collision with the player
     * @param {Player} player - The player that collected the power-up
     */
    onCollected(player) {
        if (!this.active) return;
        
        // Apply power-up effect
        if (player.collectPowerUp) {
            player.collectPowerUp(this.powerUpType);
        }
        
        // Create collection effect
        createFlash(this.scene, this.position, 3, this.getPowerUpColor(), 500);
        
        // Show message
        showMessage(this.getPowerUpMessage(), 2000, this.getPowerUpColor());
        
        // Destroy the power-up
        this.destroy();
    }
    
    /**
     * Get the color of the power-up
     * @returns {number} - Color as a hex value
     */
    getPowerUpColor() {
        switch (this.powerUpType) {
            case 'weapon':
                return 0x00ffff;
            case 'bomb':
                return 0xff00ff;
            case 'life':
                return 0x00ff00;
            default:
                return 0xffffff;
        }
    }
    
    /**
     * Get the message to display when collecting the power-up
     * @returns {string} - Message to display
     */
    getPowerUpMessage() {
        switch (this.powerUpType) {
            case 'weapon':
                return 'WEAPON UPGRADE!';
            case 'bomb':
                return 'BOMB ACQUIRED!';
            case 'life':
                return 'EXTRA LIFE!';
            default:
                return 'POWER-UP!';
        }
    }
}