/**
 * Bullet class for projectiles
 */
class Bullet extends Entity {
    constructor(scene, options = {}) {
        super(scene, {
            type: 'bullet',
            ...options
        });
        
        // Bullet-specific properties
        this.bulletType = options.bulletType || 'normal';
        this.isPlayerBullet = options.isPlayerBullet || false;
        this.damage = options.damage || 1;
        this.speed = options.speed || 40;
        this.lifespan = options.lifespan || 3; // seconds
        this.age = 0;
        this.direction = options.direction || new THREE.Vector3(0, 0, -1);
        this.target = options.target || null; // For homing missiles
        this.homingStrength = options.homingStrength || 0.1;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the bullet
     */
    init() {
        // Create bullet model based on type
        this.createModel();
        
        // Set initial velocity based on direction and speed
        this.velocity.copy(this.direction.normalize().multiplyScalar(this.speed));
        
        // Create collider
        this.collider = new THREE.Box3().setFromObject(this.object);
        
        return this;
    }
    
    /**
     * Create the bullet model based on type
     */
    createModel() {
        // Create a group to hold the bullet model
        this.object = new THREE.Group();
        
        // Create model based on bullet type
        switch (this.bulletType) {
            case 'normal':
                this.createNormalBullet();
                break;
            case 'laser':
                this.createLaserBullet();
                break;
            case 'missile':
                this.createMissileBullet();
                break;
        }
        
        // Add to scene
        this.scene.add(this.object);
    }
    
    /**
     * Create a normal bullet model
     */
    createNormalBullet() {
        // Create a simple sphere bullet
        const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bulletMaterial = new THREE.MeshStandardMaterial({ 
            color: this.isPlayerBullet ? 0x00ffff : 0xff0000,
            emissive: this.isPlayerBullet ? 0x00aaaa : 0xaa0000,
            metalness: 0.5,
            roughness: 0.5
        });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.object.add(bullet);
        
        // Add bullet light
        const bulletLight = new THREE.PointLight(
            this.isPlayerBullet ? 0x00ffff : 0xff0000,
            0.5,
            3
        );
        this.object.add(bulletLight);
    }
    
    /**
     * Create a laser bullet model
     */
    createLaserBullet() {
        // Create a cylinder for the laser beam
        const laserGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        laserGeometry.rotateX(Math.PI / 2);
        const laserMaterial = new THREE.MeshStandardMaterial({ 
            color: this.isPlayerBullet ? 0x00ffff : 0xff0000,
            emissive: this.isPlayerBullet ? 0x00ffff : 0xff0000,
            transparent: true,
            opacity: 0.7,
            metalness: 0.8,
            roughness: 0.2
        });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        this.object.add(laser);
        
        // Add laser light
        const laserLight = new THREE.PointLight(
            this.isPlayerBullet ? 0x00ffff : 0xff0000,
            0.7,
            5
        );
        this.object.add(laserLight);
        
        // Set damage based on type
        this.damage = this.isPlayerBullet ? 3 : 5;
    }
    
    /**
     * Create a missile bullet model
     */
    createMissileBullet() {
        // Create a cone for the missile
        const missileGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
        missileGeometry.rotateX(Math.PI / 2);
        const missileMaterial = new THREE.MeshStandardMaterial({ 
            color: this.isPlayerBullet ? 0xffaa00 : 0xff5500,
            emissive: this.isPlayerBullet ? 0xaa5500 : 0xaa2200,
            metalness: 0.6,
            roughness: 0.4
        });
        const missile = new THREE.Mesh(missileGeometry, missileMaterial);
        this.object.add(missile);
        
        // Add fins
        const finGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.2);
        const finMaterial = new THREE.MeshStandardMaterial({ 
            color: this.isPlayerBullet ? 0xdd8800 : 0xdd4400,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const positions = [
            [0.2, 0, 0.3],
            [-0.2, 0, 0.3],
            [0, 0.2, 0.3],
            [0, -0.2, 0.3]
        ];
        
        for (const [x, y, z] of positions) {
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            fin.position.set(x, y, z);
            this.object.add(fin);
        }
        
        // Add exhaust particles
        this.createExhaustParticles();
        
        // Add missile light
        const missileLight = new THREE.PointLight(
            this.isPlayerBullet ? 0xffaa00 : 0xff5500,
            0.7,
            4
        );
        this.object.add(missileLight);
        
        // Set damage based on type
        this.damage = this.isPlayerBullet ? 2 : 3;
    }
    
    /**
     * Create exhaust particles for missiles
     */
    createExhaustParticles() {
        // Create particle system for exhaust
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            particlePositions[i3] = (Math.random() - 0.5) * 0.2;
            particlePositions[i3 + 1] = (Math.random() - 0.5) * 0.2;
            particlePositions[i3 + 2] = 0.5 + Math.random() * 0.5;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: this.isPlayerBullet ? 0xffaa00 : 0xff5500,
            size: 0.1,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        this.exhaustParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.object.add(this.exhaustParticles);
        
        // Store initial positions for animation
        this.particleInitialPositions = particlePositions.slice();
    }
    
    /**
     * Update the bullet
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Update age
        this.age += deltaTime;
        
        // Check if bullet has expired
        if (this.age >= this.lifespan) {
            this.destroy();
            return;
        }
        
        // Update based on bullet type
        switch (this.bulletType) {
            case 'normal':
                // Normal bullets just move in a straight line
                break;
            case 'laser':
                // Lasers might get longer over time
                this.updateLaser(deltaTime);
                break;
            case 'missile':
                // Missiles track targets
                this.updateMissile(deltaTime);
                break;
        }
        
        // Call parent update
        super.update(deltaTime);
    }
    
    /**
     * Update laser bullet
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateLaser(deltaTime) {
        // Lasers could pulse or change opacity
        if (this.object.children[0] && this.object.children[0].material) {
            const material = this.object.children[0].material;
            material.opacity = 0.5 + Math.sin(this.age * 10) * 0.2;
        }
    }
    
    /**
     * Update missile bullet
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateMissile(deltaTime) {
        // Update exhaust particles
        if (this.exhaustParticles) {
            const positions = this.exhaustParticles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                const i3 = i * 3;
                
                // Move particles back
                positions[i3 + 2] += 0.1;
                
                // Reset particles that go too far
                if (positions[i3 + 2] > 1.5) {
                    positions[i3] = (Math.random() - 0.5) * 0.2;
                    positions[i3 + 1] = (Math.random() - 0.5) * 0.2;
                    positions[i3 + 2] = 0.5;
                }
            }
            
            this.exhaustParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Track target if available
        if (this.target && this.target.active) {
            // Calculate direction to target
            const targetDirection = new THREE.Vector3()
                .subVectors(this.target.position, this.position)
                .normalize();
            
            // Gradually adjust velocity toward target
            this.velocity.lerp(targetDirection.multiplyScalar(this.speed), this.homingStrength);
            
            // Adjust rotation to face direction of travel
            if (this.velocity.lengthSq() > 0.001) {
                const lookDirection = this.velocity.clone().normalize();
                const lookAt = new THREE.Vector3().addVectors(this.position, lookDirection);
                this.object.lookAt(lookAt);
            }
        }
    }
    
    /**
     * Check if this bullet collides with an entity
     * @param {Entity} entity - The entity to check collision with
     * @returns {boolean} - Whether the bullet collides with the entity
     */
    collidesWith(entity) {
        if (!this.active || !entity.active) return false;
        
        // Skip collision check with entities of the same team
        if (this.isPlayerBullet && entity.type === 'player') return false;
        if (!this.isPlayerBullet && entity.type === 'enemy') return false;
        
        // Check collision
        return super.collidesWith(entity);
    }
    
    /**
     * Handle collision with an entity
     * @param {Entity} entity - The entity that was hit
     */
    onCollision(entity) {
        // Apply damage to the entity
        if (entity.applyDamage) {
            entity.applyDamage(this.damage);
        }
        
        // Destroy the bullet (except for lasers, which can penetrate)
        if (this.bulletType !== 'laser') {
            this.destroy();
        }
    }
}