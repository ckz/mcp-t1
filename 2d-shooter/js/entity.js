/**
 * Entity Class
 * Base class for all game entities (player, enemies, projectiles)
 */
class Entity extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture);
        
        this.scene = scene;
        this.type = type || 'entity';
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set default properties
        this.health = 1;
        this.maxHealth = 1;
        this.speed = 0;
        this.attackPower = 1;  // Renamed from damage to avoid method name conflict
        this.isDestroyed = false;
    }
    
    update(time, delta) {
        // Override in subclasses
    }
    
    damage(amount) {
        // Reduce health
        this.health -= amount;
        
        // Emit health changed event
        this.emit('healthChanged', this.health, this.maxHealth);
        
        // Check if destroyed
        if (this.health <= 0) {
            this.health = 0;
            this.isDestroyed = true;
        }
        
        return this.isDestroyed;
    }
    
    heal(amount) {
        // Increase health up to max
        this.health = Math.min(this.health + amount, this.maxHealth);
        
        // Emit health changed event
        this.emit('healthChanged', this.health, this.maxHealth);
        
        return this.health;
    }
    
    setMaxHealth(value) {
        this.maxHealth = value;
        this.health = value;
    }
}

/**
 * Explosion Class
 * Visual effect for explosions
 */
class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'explosion');
        
        // Add to scene
        scene.add.existing(this);
        
        // Set origin to center
        this.setOrigin(0.5);
        
        // Play explosion animation
        this.on('animationcomplete', () => {
            this.destroy();
        });
    }
}
