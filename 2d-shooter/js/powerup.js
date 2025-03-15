/**
 * PowerUp Class
 * Handles different types of power-ups that the player can collect
 */
class PowerUp extends Entity {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture, 'powerup');
        
        // Set power-up properties
        this.type = type || 'weapon';
        this.speed = 100;
        
        // Set physics properties
        this.setScale(0.7);
        this.body.setSize(30, 30);
        
        // Set velocity
        this.setVelocityY(this.speed);
        
        // Add glow effect
        this.createGlowEffect();
        
        // Add floating animation
        this.createFloatingAnimation();
    }
    
    update(time, delta) {
        // Rotate power-up
        this.angle += 1;
    }
    
    createGlowEffect() {
        // Add glow based on power-up type
        let color;
        
        switch (this.type) {
            case 'weapon':
                color = 0xff0000; // Red
                break;
            case 'shield':
                color = 0x00ffff; // Cyan
                break;
            case 'speed':
                color = 0xffff00; // Yellow
                break;
            case 'bomb':
                color = 0xff00ff; // Magenta
                break;
            case 'life':
                color = 0x00ff00; // Green
                break;
            default:
                color = 0xffffff; // White
        }
        
        // Create glow effect using a particle emitter
        const particles = this.scene.add.particles(this.texture.key);
        
        this.glowEmitter = particles.createEmitter({
            alpha: { start: 0.5, end: 0 },
            scale: { start: 0.5, end: 0.2 },
            speed: 20,
            lifespan: 500,
            blendMode: 'ADD',
            tint: color,
            follow: this
        });
    }
    
    createFloatingAnimation() {
        // Add floating up and down animation
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.add({
                targets: this,
                y: this.y + 10,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    destroy() {
        // Stop particle emitter
        if (this.glowEmitter) {
            this.glowEmitter.stop();
        }
        
        // Call parent destroy method
        super.destroy();
    }
}

/**
 * PowerUpManager Class
 * Manages spawning and tracking of power-ups
 */
class PowerUpManager {
    constructor(scene) {
        this.scene = scene;
        this.powerUps = scene.powerUps;
        this.spawnTimer = 0;
        this.spawnRate = 15000; // 15 seconds between random power-up spawns
    }
    
    update(time, delta) {
        // Check if it's time to spawn a random power-up
        this.spawnTimer += delta;
        
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            this.spawnRandomPowerUp();
        }
    }
    
    spawnRandomPowerUp() {
        // Don't spawn if game is over or paused
        if (this.scene.gameOver || this.scene.paused) return;
        
        // Select random power-up type
        const types = GAME_SETTINGS.powerUps.types;
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Select random position
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = -50;
        
        // Create power-up
        const powerUp = new PowerUp(this.scene, x, y, `powerup-${type}`, type);
        this.powerUps.add(powerUp);
    }
    
    spawnPowerUp(x, y, type) {
        // Don't spawn if game is over or paused
        if (this.scene.gameOver || this.scene.paused) return;
        
        // If no type specified, select random
        if (!type) {
            const types = GAME_SETTINGS.powerUps.types;
            type = types[Math.floor(Math.random() * types.length)];
        }
        
        // Create power-up
        const powerUp = new PowerUp(this.scene, x, y, `powerup-${type}`, type);
        this.powerUps.add(powerUp);
        
        return powerUp;
    }
}