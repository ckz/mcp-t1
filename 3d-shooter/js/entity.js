/**
 * Base Entity class for game objects
 */
class Entity {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.object = null;
        this.collider = null;
        this.active = true;
        this.type = options.type || 'entity';
        this.tags = options.tags || [];
        
        // Position and movement
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.velocity = options.velocity || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.speed = options.speed || 0;
        
        // Physics
        this.mass = options.mass || 1;
        this.friction = options.friction || 0.01;
        
        // Gameplay
        this.health = options.health || 1;
        this.maxHealth = options.maxHealth || this.health;
        this.damage = options.damage || 0;
        this.scoreValue = options.scoreValue || 0;
        
        // Visual effects
        this.effects = {};
    }
    
    /**
     * Initialize the entity
     */
    init() {
        // Override in subclasses
        return this;
    }
    
    /**
     * Update the entity's state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.active || !this.object) return;
        
        // Apply velocity
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Apply friction
        if (this.velocity.lengthSq() > 0.00001) {
            this.velocity.multiplyScalar(1 - this.friction);
        } else {
            this.velocity.set(0, 0, 0);
        }
        
        // Update object position and rotation
        this.object.position.copy(this.position);
        this.object.rotation.copy(this.rotation);
        
        // Update collider
        if (this.collider) {
            this.collider.setFromObject(this.object);
        }
        
        // Update effects
        for (const effect of Object.values(this.effects)) {
            if (effect && effect.update) {
                effect.update(deltaTime);
            }
        }
    }
    
    /**
     * Apply damage to the entity
     * @param {number} amount - Amount of damage to apply
     * @returns {boolean} - Whether the entity was destroyed
     */
    applyDamage(amount) {
        if (!this.active) return false;
        
        this.health -= amount;
        
        // Flash effect on hit
        this.flash();
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a visual flash effect when hit
     */
    flash() {
        if (!this.object || !this.active) return;
        
        // Store original materials
        if (!this.originalMaterials) {
            this.originalMaterials = [];
            this.object.traverse(child => {
                if (child.isMesh && child.material) {
                    this.originalMaterials.push({
                        mesh: child,
                        material: child.material.clone()
                    });
                }
            });
        }
        
        // Apply flash material
        const flashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.object.traverse(child => {
            if (child.isMesh) {
                child.material = flashMaterial;
            }
        });
        
        // Restore original materials after a short delay
        setTimeout(() => {
            if (this.object && this.active) {
                this.originalMaterials.forEach(item => {
                    item.mesh.material = item.material;
                });
            }
        }, 100);
    }
    
    /**
     * Check if this entity collides with another entity
     * @param {Entity} other - The other entity to check collision with
     * @returns {boolean} - Whether the entities collide
     */
    collidesWith(other) {
        if (!this.active || !other.active || !this.collider || !other.collider) {
            return false;
        }
        
        return this.collider.intersectsBox(other.collider);
    }
    
    /**
     * Destroy the entity
     */
    destroy() {
        if (!this.active) return;
        
        this.active = false;
        
        // Clean up effects
        for (const effect of Object.values(this.effects)) {
            if (effect && effect.dispose) {
                effect.dispose();
            }
        }
        
        // Remove from scene
        if (this.object) {
            this.scene.remove(this.object);
            
            // Dispose geometries and materials
            this.object.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
    
    /**
     * Add a tag to the entity
     * @param {string} tag - The tag to add
     */
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }
    
    /**
     * Check if the entity has a tag
     * @param {string} tag - The tag to check
     * @returns {boolean} - Whether the entity has the tag
     */
    hasTag(tag) {
        return this.tags.includes(tag);
    }
    
    /**
     * Remove a tag from the entity
     * @param {string} tag - The tag to remove
     */
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.splice(index, 1);
        }
    }
}