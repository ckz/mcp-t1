/**
 * Player class for the player's aircraft
 */
class Player extends Entity {
    constructor(scene, options = {}) {
        super(scene, {
            type: 'player',
            health: 100,
            maxHealth: 100,
            speed: 15,
            ...options
        });
        
        // Player-specific properties
        this.lives = options.lives || 3;
        this.weaponType = options.weaponType || 'normal';
        this.weaponLevel = options.weaponLevel || 1;
        this.bombCount = options.bombCount || 2;
        this.barrageEnergy = options.barrageEnergy || 100;
        this.maxBarrageEnergy = options.maxBarrageEnergy || 100;
        this.barrageActive = false;
        this.barrageTimer = 0;
        this.barrageDuration = 5; // seconds
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.fireRate = options.fireRate || 0.1; // seconds between shots
        this.fireTimer = 0;
        this.controls = {
            moveLeft: false,
            moveRight: false,
            moveForward: false,
            moveBackward: false,
            fireBomb: false,
            fireBarrage: false
        };
        
        // Boundaries
        this.bounds = options.bounds || {
            minX: -25,
            maxX: 25,
            minZ: -20,
            maxZ: 20
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the player
     */
    init() {
        // Create player model
        this.createModel();
        
        // Create engine particles
        this.createEngineParticles();
        
        // Set initial position
        this.position.set(0, 0, 10);
        this.object.position.copy(this.position);
        this.object.rotation.y = Math.PI; // Face forward (away from camera)
        
        // Create collider
        this.collider = new THREE.Box3().setFromObject(this.object);
        
        return this;
    }
    
    /**
     * Create the player model
     */
    createModel() {
        // Create a group to hold the player model
        this.object = new THREE.Group();
        
        // Create a simple ship model
        const bodyGeometry = new THREE.ConeGeometry(1, 4, 4);
        bodyGeometry.rotateX(Math.PI / 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3366ff,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.object.add(body);
        
        // Add wings
        const wingGeometry = new THREE.BoxGeometry(4, 0.2, 1.5);
        const wingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2255dd,
            metalness: 0.5,
            roughness: 0.5
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.z = 0.5;
        this.object.add(wings);
        
        // Add cockpit
        const cockpitGeometry = new THREE.SphereGeometry(0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        cockpitGeometry.rotateX(Math.PI / 2);
        const cockpitMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x88ccff,
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = -0.5;
        cockpit.position.y = 0.5;
        this.object.add(cockpit);
        
        // Add engine glow
        const engineLight = new THREE.PointLight(0x3366ff, 1, 5);
        engineLight.position.z = 2;
        this.object.add(engineLight);
        
        // Add to scene
        this.scene.add(this.object);
    }
    
    /**
     * Create engine particle effects
     */
    createEngineParticles() {
        this.effects.engineTrail = createParticleTrail(this.scene, this.object, 0x3366ff, 20);
    }
    
    /**
     * Update the player
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle weapons
        this.handleWeapons(deltaTime);
        
        // Handle invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer -= deltaTime;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
                this.object.visible = true;
            } else {
                // Blink effect
                this.object.visible = Math.floor(this.invulnerableTimer * 10) % 2 === 0;
            }
        }
        
        // Handle barrage
        if (this.barrageActive) {
            this.barrageTimer -= deltaTime;
            if (this.barrageTimer <= 0) {
                this.barrageActive = false;
            }
        } else {
            // Recharge barrage energy
            this.barrageEnergy = Math.min(this.maxBarrageEnergy, this.barrageEnergy + deltaTime * 10);
        }
        
        // Call parent update
        super.update(deltaTime);
    }
    
    /**
     * Handle player movement based on controls
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleMovement(deltaTime) {
        // Reset velocity
        this.velocity.set(0, 0, 0);
        
        // Apply movement based on controls
        if (this.controls.moveLeft) {
            this.velocity.x = -this.speed;
        }
        if (this.controls.moveRight) {
            this.velocity.x = this.speed;
        }
        if (this.controls.moveForward) {
            this.velocity.z = -this.speed;
        }
        if (this.controls.moveBackward) {
            this.velocity.z = this.speed;
        }
        
        // Normalize diagonal movement
        if (this.velocity.lengthSq() > 0) {
            this.velocity.normalize().multiplyScalar(this.speed);
        }
        
        // Apply movement
        const newPosition = this.position.clone().add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Enforce boundaries
        newPosition.x = clamp(newPosition.x, this.bounds.minX, this.bounds.maxX);
        newPosition.z = clamp(newPosition.z, this.bounds.minZ, this.bounds.maxZ);
        
        // Update position
        this.position.copy(newPosition);
        
        // Bank the ship based on movement
        const targetRotationX = this.velocity.z * 0.05;
        const targetRotationZ = -this.velocity.x * 0.1;
        
        // Smoothly interpolate rotation
        this.rotation.x = lerp(this.rotation.x, targetRotationX, 0.1);
        this.rotation.z = lerp(this.rotation.z, targetRotationZ, 0.1);
    }
    
    /**
     * Handle player weapons
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleWeapons(deltaTime) {
        // Auto-fire
        this.fireTimer -= deltaTime;
        if (this.fireTimer <= 0) {
            this.fireWeapon();
            this.fireTimer = this.fireRate;
        }
        
        // Handle bomb
        if (this.controls.fireBomb) {
            this.fireBomb();
            this.controls.fireBomb = false;
        }
        
        // Handle barrage
        if (this.controls.fireBarrage) {
            this.fireBarrage();
            this.controls.fireBarrage = false;
        }
    }
    
    /**
     * Fire the player's primary weapon
     */
    fireWeapon() {
        if (!this.active) return;
        
        // Get weapon properties based on type and level
        const weaponConfig = this.getWeaponConfig();
        
        // Create bullets based on weapon type
        switch (this.weaponType) {
            case 'normal':
                this.fireNormalWeapon(weaponConfig);
                break;
            case 'spread':
                this.fireSpreadWeapon(weaponConfig);
                break;
            case 'laser':
                this.fireLaserWeapon(weaponConfig);
                break;
            case 'missile':
                this.fireMissileWeapon(weaponConfig);
                break;
        }
    }
    
    /**
     * Fire the normal weapon
     * @param {Object} config - Weapon configuration
     */
    fireNormalWeapon(config) {
        // Create bullet positions based on level
        const positions = [];
        
        if (config.bulletCount === 1) {
            // Single bullet
            positions.push(this.position.clone());
        } else if (config.bulletCount === 2) {
            // Two bullets side by side
            positions.push(
                this.position.clone().add(new THREE.Vector3(-0.5, 0, 0)),
                this.position.clone().add(new THREE.Vector3(0.5, 0, 0))
            );
        } else if (config.bulletCount >= 3) {
            // Three bullets in a row
            positions.push(
                this.position.clone().add(new THREE.Vector3(-1, 0, 0)),
                this.position.clone(),
                this.position.clone().add(new THREE.Vector3(1, 0, 0))
            );
        }
        
        // Create bullets
        for (const position of positions) {
            // Create bullet (this will be handled by the game class)
            if (this.onFireBullet) {
                this.onFireBullet(position, new THREE.Vector3(0, 0, -1), 'normal');
            }
        }
    }
    
    /**
     * Fire the spread weapon
     * @param {Object} config - Weapon configuration
     */
    fireSpreadWeapon(config) {
        // Calculate spread angle based on level
        const spreadAngle = config.spreadAngle;
        const bulletCount = config.bulletCount;
        
        // Create bullets in a spread pattern
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / (bulletCount - 1) - 0.5) * spreadAngle;
            const direction = new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle));
            
            // Create bullet
            if (this.onFireBullet) {
                this.onFireBullet(this.position.clone(), direction, 'normal');
            }
        }
    }
    
    /**
     * Fire the laser weapon
     * @param {Object} config - Weapon configuration
     */
    fireLaserWeapon(config) {
        // Create laser positions based on level
        const positions = [];
        
        if (config.bulletCount === 1) {
            // Single laser
            positions.push(this.position.clone());
        } else if (config.bulletCount >= 2) {
            // Two lasers side by side
            positions.push(
                this.position.clone().add(new THREE.Vector3(-0.5, 0, 0)),
                this.position.clone().add(new THREE.Vector3(0.5, 0, 0))
            );
        }
        
        // Create lasers
        for (const position of positions) {
            // Create laser bullet
            if (this.onFireBullet) {
                this.onFireBullet(position, new THREE.Vector3(0, 0, -1), 'laser');
            }
        }
    }
    
    /**
     * Fire the missile weapon
     * @param {Object} config - Weapon configuration
     */
    fireMissileWeapon(config) {
        // Create missile positions based on level
        const positions = [];
        
        if (config.bulletCount === 1) {
            // Single missile
            positions.push(this.position.clone());
        } else if (config.bulletCount >= 2) {
            // Two missiles side by side
            positions.push(
                this.position.clone().add(new THREE.Vector3(-0.7, 0, 0)),
                this.position.clone().add(new THREE.Vector3(0.7, 0, 0))
            );
        }
        
        // Create missiles
        for (const position of positions) {
            // Create missile bullet
            if (this.onFireBullet) {
                this.onFireBullet(position, new THREE.Vector3(0, 0, -1), 'missile');
            }
        }
    }
    
    /**
     * Fire a bomb (screen-clearing attack)
     */
    fireBomb() {
        if (!this.active || this.bombCount <= 0) return;
        
        // Use a bomb
        this.bombCount--;
        
        // Trigger bomb effect (this will be handled by the game class)
        if (this.onFireBomb) {
            this.onFireBomb();
        }
        
        // Update UI
        if (this.onUpdateUI) {
            this.onUpdateUI();
        }
    }
    
    /**
     * Fire a barrage (special attack)
     */
    fireBarrage() {
        if (!this.active || this.barrageActive || this.barrageEnergy < 50) return;
        
        // Activate barrage
        this.barrageActive = true;
        this.barrageTimer = this.barrageDuration;
        this.barrageEnergy = 0;
        
        // Update UI
        if (this.onUpdateUI) {
            this.onUpdateUI();
        }
    }
    
    /**
     * Get weapon configuration based on type and level
     * @returns {Object} - Weapon configuration
     */
    getWeaponConfig() {
        const configs = {
            normal: [
                { bulletCount: 1, damage: 1 },
                { bulletCount: 2, damage: 1 },
                { bulletCount: 3, damage: 1 }
            ],
            spread: [
                { bulletCount: 3, damage: 1, spreadAngle: Math.PI / 8 },
                { bulletCount: 5, damage: 1, spreadAngle: Math.PI / 6 },
                { bulletCount: 7, damage: 1, spreadAngle: Math.PI / 4 }
            ],
            laser: [
                { bulletCount: 1, damage: 3 },
                { bulletCount: 1, damage: 4 },
                { bulletCount: 2, damage: 3 }
            ],
            missile: [
                { bulletCount: 1, damage: 2 },
                { bulletCount: 2, damage: 2 },
                { bulletCount: 2, damage: 3 }
            ]
        };
        
        // Get config for current weapon type and level
        const levelIndex = Math.min(this.weaponLevel - 1, 2);
        return configs[this.weaponType][levelIndex];
    }
    
    /**
     * Apply damage to the player
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} - Whether the player was destroyed
     */
    applyDamage(amount) {
        if (!this.active || this.invulnerable) return false;
        
        // Apply damage
        this.health -= amount;
        
        // Flash effect
        this.flash();
        
        // Shake camera
        if (this.onCameraShake) {
            this.onCameraShake(0.5);
        }
        
        // Check if destroyed
        if (this.health <= 0) {
            // Lose a life
            this.lives--;
            
            // Check if game over
            if (this.lives <= 0) {
                this.destroy();
                return true;
            } else {
                // Respawn
                this.respawn();
                return false;
            }
        }
        
        // Update UI
        if (this.onUpdateUI) {
            this.onUpdateUI();
        }
        
        return false;
    }
    
    /**
     * Respawn the player
     */
    respawn() {
        // Reset health
        this.health = this.maxHealth;
        
        // Reset position
        this.position.set(0, 0, 15);
        
        // Make invulnerable for a short time
        this.invulnerable = true;
        this.invulnerableTimer = 3; // 3 seconds
        
        // Update UI
        if (this.onUpdateUI) {
            this.onUpdateUI();
        }
    }
    
    /**
     * Collect a power-up
     * @param {string} type - Type of power-up
     */
    collectPowerUp(type) {
        switch (type) {
            case 'weapon':
                this.upgradeWeapon();
                break;
            case 'bomb':
                this.bombCount = Math.min(this.bombCount + 1, 5);
                break;
            case 'life':
                this.lives = Math.min(this.lives + 1, 5);
                break;
        }
        
        // Update UI
        if (this.onUpdateUI) {
            this.onUpdateUI();
        }
    }
    
    /**
     * Upgrade the player's weapon
     */
    upgradeWeapon() {
        // Cycle through weapon types if at max level
        if (this.weaponLevel >= 3) {
            // Cycle to next weapon type
            const weaponTypes = ['normal', 'spread', 'laser', 'missile'];
            const currentIndex = weaponTypes.indexOf(this.weaponType);
            const nextIndex = (currentIndex + 1) % weaponTypes.length;
            this.weaponType = weaponTypes[nextIndex];
            this.weaponLevel = 1;
        } else {
            // Upgrade current weapon
            this.weaponLevel++;
        }
        
        // Show message
        showMessage(`Weapon Upgraded: ${this.weaponType.toUpperCase()} Lv.${this.weaponLevel}`, 2000, '#00ffff');
    }
}