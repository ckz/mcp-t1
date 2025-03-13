/**
 * Enemy class for enemy aircraft
 */
class Enemy extends Entity {
    constructor(scene, options = {}) {
        super(scene, {
            type: 'enemy',
            ...options
        });
        
        // Enemy-specific properties
        this.enemyType = options.enemyType || 'small';
        this.movementPattern = options.movementPattern || 'straight';
        this.firingPattern = options.firingPattern || 'none';
        this.firingRate = options.firingRate || 2; // seconds between shots
        this.firingTimer = Math.random() * this.firingRate; // Random initial delay
        this.timeOffset = options.timeOffset || Math.random() * 10; // For movement patterns
        this.targetPosition = options.targetPosition || null;
        this.spawnTime = Date.now();
        this.isBoss = this.enemyType === 'boss';
        
        // Boss-specific properties
        if (this.isBoss) {
            this.phaseTimer = 0;
            this.currentPhase = 0;
            this.phases = [
                { duration: 20, movementPattern: 'hover', firingPattern: 'spread' },
                { duration: 15, movementPattern: 'strafe', firingPattern: 'barrage' },
                { duration: 10, movementPattern: 'charge', firingPattern: 'laser' }
            ];
        }
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the enemy
     */
    init() {
        // Create enemy model based on type
        this.createModel();
        
        // Create collider
        this.collider = new THREE.Box3().setFromObject(this.object);
        
        return this;
    }
    
    /**
     * Create the enemy model based on type
     */
    createModel() {
        // Create a group to hold the enemy model
        this.object = new THREE.Group();
        
        // Create model based on enemy type
        switch (this.enemyType) {
            case 'small':
                this.createSmallEnemy();
                break;
            case 'medium':
                this.createMediumEnemy();
                break;
            case 'large':
                this.createLargeEnemy();
                break;
            case 'boss':
                this.createBossEnemy();
                break;
        }
        
        // Add to scene
        this.scene.add(this.object);
    }
    
    /**
     * Create a small enemy model
     */
    createSmallEnemy() {
        // Create a simple tetrahedron enemy
        const bodyGeometry = new THREE.TetrahedronGeometry(1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff3333,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.object.add(body);
        
        // Add engine glow
        const engineLight = new THREE.PointLight(0xff3333, 0.5, 3);
        engineLight.position.z = 0.5;
        this.object.add(engineLight);
        
        // Set properties based on type
        this.health = 1;
        this.speed = 10 + Math.random() * 5;
        this.scoreValue = 100;
    }
    
    /**
     * Create a medium enemy model
     */
    createMediumEnemy() {
        // Create a simple octahedron enemy
        const bodyGeometry = new THREE.OctahedronGeometry(1.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff5533,
            metalness: 0.6,
            roughness: 0.4
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.object.add(body);
        
        // Add wings
        const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
        const wingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdd4422,
            metalness: 0.5,
            roughness: 0.5
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        this.object.add(wings);
        
        // Add engine glow
        const engineLight = new THREE.PointLight(0xff5533, 0.7, 4);
        engineLight.position.z = 0.7;
        this.object.add(engineLight);
        
        // Set properties based on type
        this.health = 3;
        this.speed = 7 + Math.random() * 3;
        this.scoreValue = 250;
        this.firingPattern = 'straight';
    }
    
    /**
     * Create a large enemy model
     */
    createLargeEnemy() {
        // Create a simple dodecahedron enemy
        const bodyGeometry = new THREE.DodecahedronGeometry(1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff7733,
            metalness: 0.5,
            roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.object.add(body);
        
        // Add wings
        const wingGeometry = new THREE.BoxGeometry(4, 0.3, 1.5);
        const wingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdd6622,
            metalness: 0.4,
            roughness: 0.6
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        this.object.add(wings);
        
        // Add cannons
        const cannonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const cannonMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const leftCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        leftCannon.position.set(-1, 0, -1);
        leftCannon.rotation.x = Math.PI / 2;
        this.object.add(leftCannon);
        
        const rightCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        rightCannon.position.set(1, 0, -1);
        rightCannon.rotation.x = Math.PI / 2;
        this.object.add(rightCannon);
        
        // Add engine glow
        const engineLight = new THREE.PointLight(0xff7733, 1, 5);
        engineLight.position.z = 1;
        this.object.add(engineLight);
        
        // Set properties based on type
        this.health = 5;
        this.speed = 5 + Math.random() * 2;
        this.scoreValue = 500;
        this.firingPattern = 'spread';
    }
    
    /**
     * Create a boss enemy model
     */
    createBossEnemy() {
        // Create a complex boss model
        const bodyGeometry = new THREE.IcosahedronGeometry(3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            metalness: 0.8,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.object.add(body);
        
        // Add wings
        const wingGeometry = new THREE.BoxGeometry(8, 0.5, 3);
        const wingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcc0000,
            metalness: 0.7,
            roughness: 0.3
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        this.object.add(wings);
        
        // Add top structure
        const topGeometry = new THREE.ConeGeometry(1.5, 3, 6);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xdd0000,
            metalness: 0.6,
            roughness: 0.4
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 2;
        this.object.add(top);
        
        // Add cannons
        const cannonGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
        const cannonMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const positions = [
            [-3, 0, -1],
            [-1.5, 0, -1.5],
            [0, 0, -2],
            [1.5, 0, -1.5],
            [3, 0, -1]
        ];
        
        for (const [x, y, z] of positions) {
            const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
            cannon.position.set(x, y, z);
            cannon.rotation.x = Math.PI / 2;
            this.object.add(cannon);
        }
        
        // Add engine glow
        const engineLight = new THREE.PointLight(0xff0000, 2, 8);
        engineLight.position.z = 2;
        this.object.add(engineLight);
        
        // Add aura effect
        const auraGeometry = new THREE.SphereGeometry(4, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        this.object.add(aura);
        
        // Set properties based on type
        this.health = 50;
        this.speed = 3;
        this.scoreValue = 5000;
        this.firingPattern = 'barrage';
    }
    
    /**
     * Update the enemy
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Update boss phases if this is a boss
        if (this.isBoss) {
            this.updateBossPhase(deltaTime);
        }
        
        // Handle movement
        this.handleMovement(deltaTime);
        
        // Handle weapons
        this.handleWeapons(deltaTime);
        
        // Call parent update
        super.update(deltaTime);
    }
    
    /**
     * Update boss phase
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateBossPhase(deltaTime) {
        this.phaseTimer += deltaTime;
        
        // Check if it's time to switch phases
        const currentPhaseConfig = this.phases[this.currentPhase];
        if (this.phaseTimer >= currentPhaseConfig.duration) {
            // Move to next phase
            this.currentPhase = (this.currentPhase + 1) % this.phases.length;
            this.phaseTimer = 0;
            
            // Update patterns
            const newPhaseConfig = this.phases[this.currentPhase];
            this.movementPattern = newPhaseConfig.movementPattern;
            this.firingPattern = newPhaseConfig.firingPattern;
            
            // Show phase change message
            showMessage(`BOSS PHASE ${this.currentPhase + 1}`, 2000, '#ff0000');
        }
    }
    
    /**
     * Handle enemy movement based on pattern
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleMovement(deltaTime) {
        const time = Date.now() / 1000 + this.timeOffset;
        
        switch (this.movementPattern) {
            case 'straight':
                this.moveStraight(deltaTime);
                break;
            case 'sine':
                this.moveSine(deltaTime, time);
                break;
            case 'circle':
                this.moveCircle(deltaTime, time);
                break;
            case 'hover':
                this.moveHover(deltaTime, time);
                break;
            case 'strafe':
                this.moveStrafe(deltaTime, time);
                break;
            case 'charge':
                this.moveCharge(deltaTime);
                break;
            case 'target':
                this.moveToTarget(deltaTime);
                break;
        }
    }
    
    /**
     * Move in a straight line
     * @param {number} deltaTime - Time since last update in seconds
     */
    moveStraight(deltaTime) {
        // Move forward
        this.velocity.z = this.speed;
    }
    
    /**
     * Move in a sine wave pattern
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} time - Current time
     */
    moveSine(deltaTime, time) {
        // Move forward
        this.velocity.z = this.speed;
        
        // Add sine wave movement on x-axis
        const amplitude = 10;
        const frequency = 0.5;
        this.position.x = Math.sin(time * frequency) * amplitude;
    }
    
    /**
     * Move in a circular pattern
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} time - Current time
     */
    moveCircle(deltaTime, time) {
        // Calculate circular movement
        const radius = 10;
        const speed = 0.5;
        
        this.position.x = Math.sin(time * speed) * radius;
        this.position.z = -20 + Math.cos(time * speed) * radius;
        
        // Set velocity to zero since we're directly setting position
        this.velocity.set(0, 0, 0);
    }
    
    /**
     * Hover in place with slight movement
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} time - Current time
     */
    moveHover(deltaTime, time) {
        // Hover at a fixed z position
        const targetZ = -20;
        this.position.z = lerp(this.position.z, targetZ, 0.05);
        
        // Add slight movement on x-axis
        const amplitude = 15;
        const frequency = 0.2;
        this.position.x = Math.sin(time * frequency) * amplitude;
        
        // Set velocity to zero since we're directly setting position
        this.velocity.set(0, 0, 0);
    }
    
    /**
     * Strafe from side to side
     * @param {number} deltaTime - Time since last update in seconds
     * @param {number} time - Current time
     */
    moveStrafe(deltaTime, time) {
        // Stay at a fixed z position
        const targetZ = -20;
        this.position.z = lerp(this.position.z, targetZ, 0.05);
        
        // Strafe from side to side
        const amplitude = 20;
        const frequency = 0.3;
        const targetX = Math.sin(time * frequency) * amplitude;
        
        // Smoothly move to target x position
        this.position.x = lerp(this.position.x, targetX, 0.1);
        
        // Set velocity to zero since we're directly setting position
        this.velocity.set(0, 0, 0);
    }
    
    /**
     * Charge at the player
     * @param {number} deltaTime - Time since last update in seconds
     */
    moveCharge(deltaTime) {
        // Check if we have a target
        if (this.targetPosition) {
            // Calculate direction to target
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.position)
                .normalize();
            
            // Set velocity toward target
            this.velocity.copy(direction.multiplyScalar(this.speed * 2));
        } else {
            // No target, move forward
            this.velocity.z = this.speed;
        }
    }
    
    /**
     * Move toward a target position
     * @param {number} deltaTime - Time since last update in seconds
     */
    moveToTarget(deltaTime) {
        // Check if we have a target
        if (this.targetPosition) {
            // Calculate direction to target
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.position)
                .normalize();
            
            // Set velocity toward target
            this.velocity.copy(direction.multiplyScalar(this.speed));
            
            // If close to target, stop
            if (this.position.distanceTo(this.targetPosition) < 1) {
                this.velocity.set(0, 0, 0);
            }
        } else {
            // No target, move forward
            this.velocity.z = this.speed;
        }
    }
    
    /**
     * Handle enemy weapons
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleWeapons(deltaTime) {
        // Update firing timer
        this.firingTimer -= deltaTime;
        
        // Check if it's time to fire
        if (this.firingTimer <= 0) {
            this.fireWeapon();
            this.firingTimer = this.firingRate;
        }
    }
    
    /**
     * Fire the enemy's weapon
     */
    fireWeapon() {
        if (!this.active) return;
        
        // Skip if no firing pattern
        if (this.firingPattern === 'none') return;
        
        // Fire based on pattern
        switch (this.firingPattern) {
            case 'straight':
                this.fireStraight();
                break;
            case 'spread':
                this.fireSpread();
                break;
            case 'barrage':
                this.fireBarrage();
                break;
            case 'laser':
                this.fireLaser();
                break;
        }
    }
    
    /**
     * Fire a straight bullet
     */
    fireStraight() {
        // Create a bullet (this will be handled by the game class)
        if (this.onFireBullet) {
            this.onFireBullet(
                this.position.clone(),
                new THREE.Vector3(0, 0, 1),
                'normal'
            );
        }
    }
    
    /**
     * Fire bullets in a spread pattern
     */
    fireSpread() {
        // Calculate spread
        const bulletCount = this.isBoss ? 7 : 3;
        const spreadAngle = this.isBoss ? Math.PI / 3 : Math.PI / 6;
        
        // Create bullets in a spread pattern
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / (bulletCount - 1) - 0.5) * spreadAngle;
            const direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
            
            // Create bullet
            if (this.onFireBullet) {
                this.onFireBullet(
                    this.position.clone(),
                    direction,
                    'normal'
                );
            }
        }
    }
    
    /**
     * Fire a barrage of bullets
     */
    fireBarrage() {
        // Calculate barrage
        const bulletCount = this.isBoss ? 12 : 8;
        
        // Create bullets in a circular pattern
        for (let i = 0; i < bulletCount; i++) {
            const angle = (i / bulletCount) * Math.PI * 2;
            const direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
            
            // Create bullet
            if (this.onFireBullet) {
                this.onFireBullet(
                    this.position.clone(),
                    direction,
                    'normal'
                );
            }
        }
    }
    
    /**
     * Fire a laser beam
     */
    fireLaser() {
        // Create a laser bullet
        if (this.onFireBullet) {
            this.onFireBullet(
                this.position.clone(),
                new THREE.Vector3(0, 0, 1),
                'laser'
            );
        }
    }
    
    /**
     * Apply damage to the enemy
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} - Whether the enemy was destroyed
     */
    applyDamage(amount) {
        if (!this.active) return false;
        
        // Apply damage
        this.health -= amount;
        
        // Flash effect
        this.flash();
        
        // Check if destroyed
        if (this.health <= 0) {
            // Create explosion
            createExplosion(
                this.scene,
                this.position,
                this.isBoss ? 5 : 2,
                this.isBoss ? 0xff0000 : 0xff5500
            );
            
            // Create flash
            createFlash(
                this.scene,
                this.position,
                this.isBoss ? 10 : 3,
                this.isBoss ? 0xff0000 : 0xff5500
            );
            
            // Chance to drop power-up
            if (Math.random() < this.getPowerUpChance()) {
                this.dropPowerUp();
            }
            
            // Destroy the enemy
            this.destroy();
            return true;
        }
        
        return false;
    }
    
    /**
     * Get the chance to drop a power-up based on enemy type
     * @returns {number} - Chance to drop a power-up (0-1)
     */
    getPowerUpChance() {
        switch (this.enemyType) {
            case 'small':
                return 0.05; // 5% chance
            case 'medium':
                return 0.1; // 10% chance
            case 'large':
                return 0.2; // 20% chance
            case 'boss':
                return 1.0; // 100% chance
            default:
                return 0.1;
        }
    }
    
    /**
     * Drop a power-up
     */
    dropPowerUp() {
        // Determine power-up type
        let powerUpType;
        
        if (this.isBoss) {
            // Boss always drops a weapon power-up
            powerUpType = 'weapon';
        } else {
            // Random power-up for other enemies
            const rand = Math.random();
            if (rand < 0.6) {
                powerUpType = 'weapon';
            } else if (rand < 0.9) {
                powerUpType = 'bomb';
            } else {
                powerUpType = 'life';
            }
        }
        
        // Create power-up (this will be handled by the game class)
        if (this.onDropPowerUp) {
            this.onDropPowerUp(this.position.clone(), powerUpType);
        }
    }
}