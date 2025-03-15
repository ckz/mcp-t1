/**
 * Enemy Base Class
 * Base class for all enemy types
 */
class Enemy extends Entity {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture, type || 'enemy');
        
        // Set default enemy properties
        this.score = 100;
        this.isBoss = false;
        this.nextFire = 0;
        this.fireRate = 2000;
        
        // Set physics properties
        this.setOrigin(0.5);
    }
    
    update(time, delta) {
        // Check if enemy can fire
        if (time > this.nextFire) {
            this.fireWeapon();
            this.nextFire = time + this.fireRate;
        }
    }
    
    // Override damage method to ensure it's available
    damage(amount) {
        // Call parent method if it exists
        if (super.damage) {
            return super.damage(amount);
        }
        
        // Fallback implementation
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
    
    fireWeapon() {
        // Create bullet
        const bullet = this.scene.enemyBullets.get(this.x, this.y + 20);
        
        if (bullet) {
            // Calculate direction to player
            const player = this.scene.player;
            
            if (player && player.active) {
                // Aimed shot
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    player.x, player.y
                );
                
                bullet.fire(Math.cos(angle), Math.sin(angle));
            } else {
                // Straight down if no player
                bullet.fire(0, 1);
            }
        }
    }
}

/**
 * Basic Enemy Class
 * Standard enemy with simple behavior
 */
class BasicEnemy extends Enemy {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'basic-enemy');
        
        // Set enemy properties
        this.setMaxHealth(GAME_SETTINGS.enemies.basic.health);
        this.speed = GAME_SETTINGS.enemies.basic.speed;
        this.score = GAME_SETTINGS.enemies.basic.score;
        this.fireRate = GAME_SETTINGS.enemies.basic.fireRate;
        
        // Set movement pattern
        this.movementPattern = 'straight';
        this.movementTimer = 0;
        
        // Set velocity
        this.setVelocityY(this.speed);
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Update movement pattern
        this.updateMovement(time, delta);
    }
    
    updateMovement(time, delta) {
        // Simple straight down movement
        if (this.movementPattern === 'straight') {
            this.setVelocityY(this.speed);
        }
        // Sine wave movement
        else if (this.movementPattern === 'sine') {
            this.movementTimer += delta;
            const xOffset = Math.sin(this.movementTimer / 500) * 2;
            this.setVelocity(xOffset * this.speed, this.speed);
        }
    }
}

/**
 * Fast Enemy Class
 * Faster but weaker enemy
 */
class FastEnemy extends Enemy {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'fast-enemy');
        
        // Set enemy properties
        this.setMaxHealth(GAME_SETTINGS.enemies.fast.health);
        this.speed = GAME_SETTINGS.enemies.fast.speed;
        this.score = GAME_SETTINGS.enemies.fast.score;
        this.fireRate = GAME_SETTINGS.enemies.fast.fireRate;
        
        // Set movement pattern
        this.movementPattern = 'zigzag';
        this.movementTimer = 0;
        this.zigzagDirection = 1;
        
        // Set velocity
        this.setVelocityY(this.speed);
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Update movement pattern
        this.updateMovement(time, delta);
    }
    
    updateMovement(time, delta) {
        // Zigzag movement
        this.movementTimer += delta;
        
        if (this.movementTimer > 1000) {
            this.movementTimer = 0;
            this.zigzagDirection *= -1;
        }
        
        this.setVelocity(this.zigzagDirection * this.speed, this.speed * 0.8);
        
        // Ensure enemy stays within screen bounds
        if (this.x < 20 || this.x > config.width - 20) {
            this.zigzagDirection *= -1;
        }
    }
}

/**
 * Tank Enemy Class
 * Slower but tougher enemy
 */
class TankEnemy extends Enemy {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'tank-enemy');
        
        // Set enemy properties
        this.setMaxHealth(GAME_SETTINGS.enemies.tank.health);
        this.speed = GAME_SETTINGS.enemies.tank.speed;
        this.score = GAME_SETTINGS.enemies.tank.score;
        this.fireRate = GAME_SETTINGS.enemies.tank.fireRate;
        
        // Set movement pattern
        this.movementPattern = 'follow';
        
        // Set velocity
        this.setVelocityY(this.speed);
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Update movement pattern
        this.updateMovement(time, delta);
    }
    
    updateMovement(time, delta) {
        // Follow player horizontally
        const player = this.scene.player;
        
        if (player && player.active) {
            // Calculate direction to player
            const dirX = player.x - this.x;
            
            // Move towards player horizontally, but slower
            this.setVelocity(
                Phaser.Math.Clamp(dirX, -this.speed * 0.5, this.speed * 0.5),
                this.speed * 0.7
            );
        } else {
            // Move straight down if no player
            this.setVelocityY(this.speed);
        }
    }
    
    fireWeapon() {
        // Tank fires 3 bullets in a spread
        const bullet1 = this.scene.enemyBullets.get(this.x, this.y + 20);
        const bullet2 = this.scene.enemyBullets.get(this.x - 20, this.y + 10);
        const bullet3 = this.scene.enemyBullets.get(this.x + 20, this.y + 10);
        
        if (bullet1) bullet1.fire(0, 1);
        if (bullet2) bullet2.fire(-0.3, 1);
        if (bullet3) bullet3.fire(0.3, 1);
    }
}

/**
 * Mini Boss Enemy Class
 * Mid-level boss with more complex patterns
 */
class MiniBoss extends Enemy {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'mini-boss');
        
        // Set enemy properties
        this.setMaxHealth(GAME_SETTINGS.enemies.miniBoss.health);
        this.speed = GAME_SETTINGS.enemies.miniBoss.speed;
        this.score = GAME_SETTINGS.enemies.miniBoss.score;
        this.fireRate = GAME_SETTINGS.enemies.miniBoss.fireRate;
        this.isBoss = true;
        
        // Set movement pattern
        this.movementPattern = 'circle';
        this.movementTimer = 0;
        this.circleRadius = 100;
        this.circleSpeed = 0.001;
        this.centerX = x;
        
        // Attack pattern
        this.attackPattern = 'spread';
        this.attackPhase = 0;
        
        // Set physics properties
        this.setScale(1.5);
        this.body.setSize(80, 80);
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Update movement pattern
        this.updateMovement(time, delta);
        
        // Change attack pattern based on health
        if (this.health < this.maxHealth * 0.5 && this.attackPattern !== 'spiral') {
            this.attackPattern = 'spiral';
            this.fireRate = GAME_SETTINGS.enemies.miniBoss.fireRate * 0.8;
        }
    }
    
    updateMovement(time, delta) {
        this.movementTimer += delta * this.circleSpeed;
        
        if (this.movementPattern === 'circle') {
            // Circular movement
            this.x = this.centerX + Math.cos(this.movementTimer) * this.circleRadius;
            this.y = 150 + Math.sin(this.movementTimer) * 50;
            
            // Ensure mini boss stays within screen bounds
            if (this.x < 50) {
                this.centerX += 5;
            } else if (this.x > config.width - 50) {
                this.centerX -= 5;
            }
        }
    }
    
    fireWeapon() {
        // Different attack patterns
        if (this.attackPattern === 'spread') {
            this.fireSpreadPattern();
        } else if (this.attackPattern === 'spiral') {
            this.fireSpiralPattern();
        }
    }
    
    fireSpreadPattern() {
        // Fire 5 bullets in a spread
        const bulletCount = 5;
        const angleStep = 20;
        const startAngle = -((bulletCount - 1) * angleStep) / 2;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle + 90); // +90 to point downward
            
            const bullet = this.scene.enemyBullets.get(this.x, this.y + 20);
            if (bullet) {
                bullet.fire(Math.cos(radians), Math.sin(radians));
                bullet.setTint(0xff0000);
            }
        }
    }
    
    fireSpiralPattern() {
        // Fire bullets in a spiral pattern
        const bulletCount = 8;
        const angleStep = 45;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = this.attackPhase + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle);
            
            const bullet = this.scene.enemyBullets.get(this.x, this.y);
            if (bullet) {
                bullet.fire(Math.cos(radians), Math.sin(radians));
                bullet.setTint(0xff0000);
            }
        }
        
        // Increment attack phase for next spiral
        this.attackPhase = (this.attackPhase + 15) % 360;
    }
}

/**
 * Boss Enemy Class
 * Final boss with complex patterns and phases
 */
class Boss extends Enemy {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture, 'boss');
        
        // Set enemy properties
        this.setMaxHealth(GAME_SETTINGS.enemies.boss.health);
        this.speed = GAME_SETTINGS.enemies.boss.speed;
        this.score = GAME_SETTINGS.enemies.boss.score;
        this.fireRate = GAME_SETTINGS.enemies.boss.fireRate;
        this.isBoss = true;
        this.name = 'DREADNOUGHT';
        
        // Set movement pattern
        this.movementPattern = 'hover';
        this.movementTimer = 0;
        this.hoverDirection = 1;
        this.hoverDistance = 200;
        this.hoverSpeed = 1;
        this.startX = x;
        
        // Attack pattern
        this.attackPattern = 'phase1';
        this.attackPhase = 0;
        this.attackTimer = null;
        
        // Phase thresholds
        this.phaseThresholds = GAME_SETTINGS.enemies.boss.phaseThresholds;
        this.currentPhase = 0;
        
        // Set physics properties
        this.setScale(1);
        this.body.setSize(150, 150);
        
        // Create shield effect
        this.shield = scene.add.circle(x, y, 100, 0xff0000, 0.2);
        this.shield.setStrokeStyle(2, 0xff0000);
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Update movement pattern
        this.updateMovement(time, delta);
        
        // Update shield position
        if (this.shield) {
            this.shield.setPosition(this.x, this.y);
        }
        
        // Check for phase changes
        this.checkPhaseChange();
    }
    
    updateMovement(time, delta) {
        this.movementTimer += delta * 0.001 * this.hoverSpeed;
        
        if (this.movementPattern === 'hover') {
            // Hover movement
            this.x = this.startX + Math.sin(this.movementTimer) * this.hoverDistance;
            
            // Ensure boss stays within screen bounds
            if (this.x < 100) {
                this.startX += 5;
            } else if (this.x > config.width - 100) {
                this.startX -= 5;
            }
        }
    }
    
    checkPhaseChange() {
        // Calculate current health percentage
        const healthPercent = this.health / this.maxHealth;
        
        // Check if we need to change phase
        if (this.currentPhase < this.phaseThresholds.length && 
            healthPercent <= this.phaseThresholds[this.currentPhase]) {
            
            // Move to next phase
            this.currentPhase++;
            this.changePhase(this.currentPhase);
        }
    }
    
    changePhase(phase) {
        // Change attack pattern based on phase
        switch (phase) {
            case 1:
                this.attackPattern = 'phase2';
                this.fireRate *= 0.8;
                this.hoverSpeed *= 1.5;
                this.shield.setFillStyle(0xffff00, 0.2);
                this.shield.setStrokeStyle(2, 0xffff00);
                break;
            case 2:
                this.attackPattern = 'phase3';
                this.fireRate *= 0.8;
                this.hoverDistance *= 1.2;
                this.shield.setFillStyle(0x00ff00, 0.2);
                this.shield.setStrokeStyle(2, 0x00ff00);
                break;
            case 3:
                this.attackPattern = 'phase4';
                this.fireRate *= 0.7;
                this.shield.setFillStyle(0x00ffff, 0.2);
                this.shield.setStrokeStyle(2, 0x00ffff);
                break;
        }
        
        // Camera shake effect
        if (this.scene && this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(500, 0.01);
        }
        
        // Flash effect
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 5
            });
        }
    }
    
    startAttackPattern() {
        // Start attack timer
        if (this.scene && this.scene.time) {
            this.attackTimer = this.scene.time.addEvent({
                delay: this.fireRate,
                callback: this.fireWeapon,
                callbackScope: this,
                loop: true
            });
        }
    }
    
    fireWeapon() {
        // Different attack patterns based on phase
        switch (this.attackPattern) {
            case 'phase1':
                this.firePhase1Pattern();
                break;
            case 'phase2':
                this.firePhase2Pattern();
                break;
            case 'phase3':
                this.firePhase3Pattern();
                break;
            case 'phase4':
                this.firePhase4Pattern();
                break;
        }
    }
    
    firePhase1Pattern() {
        // Phase 1: Simple spread pattern
        const bulletCount = 5;
        const angleStep = 20;
        const startAngle = -((bulletCount - 1) * angleStep) / 2;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle + 90); // +90 to point downward
            
            const bullet = this.scene.enemyBullets.get(this.x, this.y + 50);
            if (bullet) {
                bullet.fire(Math.cos(radians), Math.sin(radians));
                bullet.setTint(0xff0000);
            }
        }
    }
    
    firePhase2Pattern() {
        // Phase 2: Double spread pattern
        this.firePhase1Pattern();
        
        // Add aimed shots
        const player = this.scene.player;
        if (player && player.active) {
            // Calculate angle to player
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                player.x, player.y
            );
            
            // Fire 3 bullets towards player
            for (let i = -1; i <= 1; i++) {
                const bulletAngle = angle + Phaser.Math.DegToRad(i * 10);
                const bullet = this.scene.enemyBullets.get(this.x, this.y + 30);
                
                if (bullet) {
                    bullet.fire(Math.cos(bulletAngle), Math.sin(bulletAngle));
                    bullet.setTint(0xffff00);
                }
            }
        }
    }
    
    firePhase3Pattern() {
        // Phase 3: Spiral pattern
        const bulletCount = 12;
        const angleStep = 30;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = this.attackPhase + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle);
            
            const bullet = this.scene.enemyBullets.get(this.x, this.y);
            if (bullet) {
                bullet.fire(Math.cos(radians), Math.sin(radians));
                bullet.setTint(0x00ff00);
            }
        }
        
        // Increment attack phase for next spiral
        this.attackPhase = (this.attackPhase + 10) % 360;
    }
    
    firePhase4Pattern() {
        // Phase 4: Bullet hell pattern
        this.firePhase3Pattern();
        
        // Add random bullets
        for (let i = 0; i < 5; i++) {
            const angle = Phaser.Math.Between(0, 360);
            const radians = Phaser.Math.DegToRad(angle);
            
            const bullet = this.scene.enemyBullets.get(
                this.x + Phaser.Math.Between(-50, 50),
                this.y + Phaser.Math.Between(-30, 50)
            );
            
            if (bullet) {
                bullet.fire(Math.cos(radians), Math.sin(radians));
                bullet.setTint(0x00ffff);
            }
        }
    }
    
    destroy() {
        // Remove shield
        if (this.shield) {
            this.shield.destroy();
        }
        
        // Remove attack timer
        if (this.attackTimer) {
            this.attackTimer.remove();
        }
        
        // Create multiple explosions
        if (this.scene && this.scene.time) {
            for (let i = 0; i < 10; i++) {
                this.scene.time.delayedCall(i * 200, () => {
                    if (this.scene) {
                        const x = this.x + Phaser.Math.Between(-50, 50);
                        const y = this.y + Phaser.Math.Between(-50, 50);
                        const scale = Phaser.Math.FloatBetween(0.5, 1.5);
                        
                        const explosion = new Explosion(this.scene, x, y);
                        if (this.scene.explosions) {
                            this.scene.explosions.add(explosion);
                        }
                        explosion.setScale(scale);
                        explosion.play('explosion');
                        
                        // Play explosion sound
                        if (this.scene.sound) {
                            this.scene.sound.play('sfx-explosion', {
                                volume: 0.3 * scale
                            });
                        }
                    }
                });
            }
        }
        
        // Call parent destroy method
        super.destroy();
    }
}

// Note: EnemyBullet class is now defined in bullet.js