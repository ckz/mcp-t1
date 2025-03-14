/**
 * Player Class
 * Handles player ship behavior, movement, and weapons
 */
class Player extends Entity {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'player');
        
        // Set player properties
        this.setMaxHealth(3);
        this.speed = GAME_SETTINGS.player.speed;
        this.isInvulnerable = false;
        
        // Set player collision body
        this.setSize(40, 40); // Smaller hitbox than sprite
        this.setOffset(12, 12);
        
        // Weapon properties
        this.weaponLevel = 1;
        this.weaponType = 'basic';
        this.nextFire = 0;
        this.fireRate = GAME_SETTINGS.player.fireRate;
        
        // Shield properties
        this.shield = null;
        this.shieldTimer = null;
        
        // Speed boost properties
        this.speedBoostTimer = null;
        this.normalSpeed = this.speed;
        
        // Start player animation
        this.play('player-idle');
        
        // Create engine particles
        this.createEngineParticles();
    }
    
    update(time, delta) {
        // Handle player movement
        this.handleMovement();
        
        // Auto-fire weapon
        if (time > this.nextFire) {
            this.fireWeapon();
        }
        
        // Update shield position if active
        if (this.shield) {
            this.shield.setPosition(this.x, this.y);
        }
    }
    
    handleMovement() {
        // Get cursor keys
        const cursors = this.scene.cursors;
        
        // Reset velocity
        this.setVelocity(0);
        
        // Horizontal movement
        if (cursors.left.isDown || this.scene.input.keyboard.checkDown(Phaser.Input.Keyboard.KeyCodes.A)) {
            this.setVelocityX(-this.speed);
            this.play('player-left', true);
        } else if (cursors.right.isDown || this.scene.input.keyboard.checkDown(Phaser.Input.Keyboard.KeyCodes.D)) {
            this.setVelocityX(this.speed);
            this.play('player-right', true);
        } else {
            this.play('player-idle', true);
        }
        
        // Vertical movement
        if (cursors.up.isDown || this.scene.input.keyboard.checkDown(Phaser.Input.Keyboard.KeyCodes.W)) {
            this.setVelocityY(-this.speed);
        } else if (cursors.down.isDown || this.scene.input.keyboard.checkDown(Phaser.Input.Keyboard.KeyCodes.S)) {
            this.setVelocityY(this.speed);
        }
        
        // Normalize diagonal movement
        if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
            this.body.velocity.normalize().scale(this.speed);
        }
    }
    
    fireWeapon() {
        // Set next fire time
        this.nextFire = this.scene.time.now + this.fireRate;
        
        // Play fire sound
        this.scene.sound.play('sfx-laser', { volume: 0.2 });
        
        // Fire based on weapon type and level
        switch (this.weaponType) {
            case 'spread':
                this.fireSpreadShot();
                break;
            case 'laser':
                this.fireLaserShot();
                break;
            case 'homing':
                this.fireHomingShot();
                break;
            default:
                this.fireBasicShot();
        }
    }
    
    fireBasicShot() {
        // Create bullet group if it doesn't exist
        const bullets = this.scene.playerBullets;
        
        // Basic shot - single or double based on level
        if (this.weaponLevel === 1) {
            // Single shot
            const bullet = bullets.get(this.x, this.y - 20);
            if (bullet) {
                bullet.fire(0, -1);
            }
        } else {
            // Double shot
            const bullet1 = bullets.get(this.x - 15, this.y - 10);
            const bullet2 = bullets.get(this.x + 15, this.y - 10);
            
            if (bullet1) {
                bullet1.fire(0, -1);
            }
            
            if (bullet2) {
                bullet2.fire(0, -1);
            }
        }
    }
    
    fireSpreadShot() {
        // Create bullet group if it doesn't exist
        const bullets = this.scene.playerBullets;
        
        // Spread shot - 3 or 5 bullets based on level
        const count = this.weaponLevel === 1 ? 3 : 5;
        const angleStep = GAME_SETTINGS.weapons.spread.angle;
        const startAngle = -(count - 1) * angleStep / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = startAngle + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle - 90); // -90 to point upward
            
            const bullet = bullets.get(this.x, this.y - 20);
            if (bullet) {
                bullet.fire(Math.cos(radians), Math.sin(radians));
            }
        }
    }
    
    fireLaserShot() {
        // Create bullet group if it doesn't exist
        const bullets = this.scene.playerBullets;
        
        // Laser shot - 1 or 2 powerful beams
        const count = this.weaponLevel === 1 ? 1 : 2;
        const positions = count === 1 ? [0] : [-15, 15];
        
        for (let i = 0; i < count; i++) {
            const bullet = bullets.get(this.x + positions[i], this.y - 20);
            if (bullet) {
                bullet.fire(0, -1);
                bullet.setScale(2, 3); // Make laser bigger
                bullet.damage = GAME_SETTINGS.weapons.laser.damage;
            }
        }
    }
    
    fireHomingShot() {
        // Create bullet group if it doesn't exist
        const bullets = this.scene.playerBullets;
        
        // Find closest enemy
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.scene.enemies.getChildren().forEach(enemy => {
            if (enemy.active && enemy.y > 0) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        });
        
        // Homing shot - tracks enemies
        const bullet = bullets.get(this.x, this.y - 20);
        if (bullet) {
            bullet.fire(0, -1);
            bullet.setTint(0xff00ff);
            
            if (closestEnemy) {
                bullet.setData('target', closestEnemy);
                bullet.setData('trackingSpeed', GAME_SETTINGS.weapons.homing.trackingSpeed);
            }
        }
    }
    
    upgradeWeapon() {
        // Cycle through weapon types or upgrade level
        if (this.weaponLevel < 2) {
            // Upgrade current weapon
            this.weaponLevel++;
        } else {
            // Change weapon type
            this.weaponLevel = 1;
            
            switch (this.weaponType) {
                case 'basic':
                    this.weaponType = 'spread';
                    this.fireRate = GAME_SETTINGS.weapons.spread.fireRate;
                    break;
                case 'spread':
                    this.weaponType = 'laser';
                    this.fireRate = GAME_SETTINGS.weapons.laser.fireRate;
                    break;
                case 'laser':
                    this.weaponType = 'homing';
                    this.fireRate = GAME_SETTINGS.weapons.homing.fireRate;
                    break;
                case 'homing':
                    this.weaponType = 'basic';
                    this.fireRate = GAME_SETTINGS.weapons.basic.fireRate;
                    break;
            }
        }
        
        // Update UI
        this.scene.events.emit('updatePowerUp', 'weapon', this.weaponLevel);
    }
    
    activateShield() {
        // Create shield if it doesn't exist
        if (!this.shield) {
            this.shield = this.scene.add.circle(this.x, this.y, 50, 0x00ffff, 0.3);
            this.shield.setStrokeStyle(2, 0x00ffff);
        }
        
        // Clear existing shield timer
        if (this.shieldTimer) {
            this.shieldTimer.remove();
        }
        
        // Set invulnerability
        this.isInvulnerable = true;
        
        // Update UI
        this.scene.events.emit('updatePowerUp', 'shield');
        
        // Set shield timer
        this.shieldTimer = this.scene.time.delayedCall(
            GAME_SETTINGS.powerUps.duration,
            () => {
                // Remove shield
                if (this.shield) {
                    this.shield.destroy();
                    this.shield = null;
                }
                
                // Remove invulnerability
                this.isInvulnerable = false;
            }
        );
    }
    
    activateSpeedBoost() {
        // Increase speed
        this.speed = this.normalSpeed * 1.5;
        
        // Clear existing speed boost timer
        if (this.speedBoostTimer) {
            this.speedBoostTimer.remove();
        }
        
        // Update UI
        this.scene.events.emit('updatePowerUp', 'speed');
        
        // Set speed boost timer
        this.speedBoostTimer = this.scene.time.delayedCall(
            GAME_SETTINGS.powerUps.duration,
            () => {
                // Reset speed
                this.speed = this.normalSpeed;
            }
        );
    }
    
    setInvulnerable() {
        // Set invulnerability
        this.isInvulnerable = true;
        
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                this.alpha = 1;
                this.isInvulnerable = false;
            }
        });
    }
    
    createEngineParticles() {
        // Create particle emitter for engine exhaust
        const particles = this.scene.add.particles('bullet-player');
        
        particles.createEmitter({
            speed: 50,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            follow: this,
            followOffset: { x: 0, y: 20 },
            frequency: 100,
            alpha: { start: 0.5, end: 0 },
            tint: 0x00ffff
        });
    }
}

// Note: PlayerBullet class is now defined in bullet.js