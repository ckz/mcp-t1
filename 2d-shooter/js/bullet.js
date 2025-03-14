/**
 * Bullet Class
 * Base class for all projectiles in the game
 */
class Bullet extends Entity {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture, type || 'bullet');
        
        // Set default bullet properties
        this.speed = 300;
        this.attackPower = 1;  // Renamed from damage to avoid method name conflict
        this.lifespan = 2000; // ms
        this.born = 0;
        
        // Set physics properties
        this.setScale(0.8);
        this.body.setSize(10, 10);
        
        // Deactivate initially
        this.setActive(false);
        this.setVisible(false);
    }
    
    update(time, delta) {
        // Check lifespan
        this.born += delta;
        if (this.born > this.lifespan) {
            this.destroy();
            return;
        }
        
        // Check if bullet is out of bounds
        if (this.y < -50 || this.y > config.height + 50 || 
            this.x < -50 || this.x > config.width + 50) {
            this.destroy();
        }
    }
    
    fire(dirX, dirY) {
        // Activate bullet
        this.setActive(true);
        this.setVisible(true);
        
        // Reset born timer
        this.born = 0;
        
        // Set velocity
        this.setVelocity(dirX * this.speed, dirY * this.speed);
        
        // Set rotation to match direction
        if (dirX !== 0) {
            this.setRotation(Math.atan2(dirY, dirX));
        }
    }
}

/**
 * PlayerBullet Class
 * Projectiles fired by the player
 */
class PlayerBullet extends Bullet {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet-player', 'player-bullet');
        
        // Set bullet properties
        this.speed = GAME_SETTINGS.weapons.basic.speed;
        this.attackPower = GAME_SETTINGS.weapons.basic.damage;
        
        // Add trail effect
        this.createTrailEffect();
    }
    
    createTrailEffect() {
        // Create particle emitter for bullet trail
        this.trailEmitter = this.scene.add.particles(this.x, this.y, 'bullet-player', {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speed: 20,
            lifespan: 200,
            blendMode: 'ADD',
            tint: 0x60a5fa,
            follow: this
        });
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Handle homing behavior
        const target = this.getData('target');
        if (target && target.active) {
            const trackingSpeed = this.getData('trackingSpeed') || 0.05;
            
            // Calculate angle to target
            const targetAngle = Phaser.Math.Angle.Between(
                this.x, this.y,
                target.x, target.y
            );
            
            // Get current velocity angle
            const currentAngle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
            
            // Gradually rotate towards target
            let newAngle = Phaser.Math.Angle.RotateTo(
                currentAngle,
                targetAngle,
                trackingSpeed
            );
            
            // Update velocity
            this.setVelocity(
                Math.cos(newAngle) * this.speed,
                Math.sin(newAngle) * this.speed
            );
            
            // Update rotation
            this.setRotation(newAngle);
        }
    }
    
    destroy() {
        // Clean up trail emitter
        if (this.trailEmitter) {
            this.trailEmitter.destroy();
        }
        
        super.destroy();
    }
}

/**
 * EnemyBullet Class
 * Projectiles fired by enemies
 */
class EnemyBullet extends Bullet {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet-enemy', 'enemy-bullet');
        
        // Set bullet properties
        this.speed = 300;
        this.attackPower = 1;
        
        // Add trail effect
        this.createTrailEffect();
    }
    
    createTrailEffect() {
        // Create particle emitter for bullet trail
        this.trailEmitter = this.scene.add.particles(this.x, this.y, 'bullet-enemy', {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speed: 20,
            lifespan: 200,
            blendMode: 'ADD',
            tint: 0xf87171,
            follow: this
        });
    }
    
    destroy() {
        // Clean up trail emitter
        if (this.trailEmitter) {
            this.trailEmitter.destroy();
        }
        
        super.destroy();
    }
}

/**
 * LaserBullet Class
 * Laser projectiles (usually fired by player)
 */
class LaserBullet extends Bullet {
    constructor(scene, x, y) {
        super(scene, x, y, 'laser', 'laser-bullet');
        
        // Set bullet properties
        this.speed = GAME_SETTINGS.weapons.laser.speed;
        this.attackPower = GAME_SETTINGS.weapons.laser.damage;
        
        // Set physics properties
        this.setScale(1, 3);
        this.body.setSize(8, 32);
        
        // Add glow effect
        this.createGlowEffect();
    }
    
    createGlowEffect() {
        // Create particle emitter for laser glow
        this.glowEmitter = this.scene.add.particles(this.x, this.y, 'laser', {
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.3, end: 0 },
            speed: 10,
            lifespan: 100,
            blendMode: 'ADD',
            tint: 0x93c5fd,
            follow: this
        });
    }
    
    destroy() {
        // Clean up glow emitter
        if (this.glowEmitter) {
            this.glowEmitter.destroy();
        }
        
        super.destroy();
    }
}

/**
 * BossBullet Class
 * Special projectiles fired by bosses
 */
class BossBullet extends EnemyBullet {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        // Set bullet properties
        this.attackPower = 2;
        this.setScale(1.5);
        
        // Set tint based on boss phase
        this.setTint(0xff0000);
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Add pulsing effect
        const pulseFactor = 0.9 + 0.1 * Math.sin(time * 0.01);
        this.setScale(1.5 * pulseFactor);
    }
}

/**
 * BulletManager Class
 * Manages bullet pools and firing patterns
 */
class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.playerBullets = scene.playerBullets;
        this.enemyBullets = scene.enemyBullets;
    }
    
    firePlayerBullet(x, y, dirX = 0, dirY = -1, type = 'basic') {
        // Get bullet from pool
        let bullet;
        
        if (type === 'laser') {
            bullet = new LaserBullet(this.scene, x, y);
            this.playerBullets.add(bullet);
        } else {
            bullet = this.playerBullets.get(x, y);
            
            if (!bullet) {
                bullet = new PlayerBullet(this.scene, x, y);
                this.playerBullets.add(bullet);
            }
        }
        
        // Fire bullet
        if (bullet) {
            bullet.fire(dirX, dirY);
            
            // Set bullet properties based on type
            switch (type) {
                case 'spread':
                    bullet.attackPower = GAME_SETTINGS.weapons.spread.damage;
                    bullet.speed = GAME_SETTINGS.weapons.spread.speed;
                    break;
                case 'laser':
                    bullet.attackPower = GAME_SETTINGS.weapons.laser.damage;
                    bullet.speed = GAME_SETTINGS.weapons.laser.speed;
                    break;
                case 'homing':
                    bullet.attackPower = GAME_SETTINGS.weapons.homing.damage;
                    bullet.speed = GAME_SETTINGS.weapons.homing.speed;
                    
                    // Find closest enemy for homing
                    let closestEnemy = null;
                    let closestDistance = Infinity;
                    
                    this.scene.enemies.getChildren().forEach(enemy => {
                        if (enemy.active && enemy.y > 0) {
                            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestEnemy = enemy;
                            }
                        }
                    });
                    
                    if (closestEnemy) {
                        bullet.setData('target', closestEnemy);
                        bullet.setData('trackingSpeed', GAME_SETTINGS.weapons.homing.trackingSpeed);
                    }
                    break;
                default:
                    bullet.attackPower = GAME_SETTINGS.weapons.basic.damage;
                    bullet.speed = GAME_SETTINGS.weapons.basic.speed;
            }
            
            // Play sound
            this.scene.sound.play('sfx-laser', { volume: 0.2 });
        }
        
        return bullet;
    }
    
    fireEnemyBullet(x, y, dirX = 0, dirY = 1, isBoss = false) {
        // Get bullet from pool
        let bullet;
        
        if (isBoss) {
            bullet = new BossBullet(this.scene, x, y);
            this.enemyBullets.add(bullet);
        } else {
            bullet = this.enemyBullets.get(x, y);
            
            if (!bullet) {
                bullet = new EnemyBullet(this.scene, x, y);
                this.enemyBullets.add(bullet);
            }
        }
        
        // Fire bullet
        if (bullet) {
            bullet.fire(dirX, dirY);
        }
        
        return bullet;
    }
    
    firePattern(x, y, pattern, isBoss = false) {
        switch (pattern) {
            case 'spread':
                this.fireSpreadPattern(x, y, isBoss);
                break;
            case 'circle':
                this.fireCirclePattern(x, y, isBoss);
                break;
            case 'spiral':
                this.fireSpiralPattern(x, y, isBoss);
                break;
            case 'aimed':
                this.fireAimedPattern(x, y, isBoss);
                break;
            default:
                this.fireEnemyBullet(x, y, 0, 1, isBoss);
        }
    }
    
    fireSpreadPattern(x, y, isBoss = false) {
        // Fire bullets in a spread pattern
        const bulletCount = isBoss ? 7 : 3;
        const angleStep = isBoss ? 15 : 25;
        const startAngle = -((bulletCount - 1) * angleStep) / 2;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle + 90); // +90 to point downward
            
            this.fireEnemyBullet(x, y, Math.cos(radians), Math.sin(radians), isBoss);
        }
    }
    
    fireCirclePattern(x, y, isBoss = false) {
        // Fire bullets in a circle pattern
        const bulletCount = isBoss ? 12 : 8;
        const angleStep = 360 / bulletCount;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = i * angleStep;
            const radians = Phaser.Math.DegToRad(angle);
            
            this.fireEnemyBullet(x, y, Math.cos(radians), Math.sin(radians), isBoss);
        }
    }
    
    fireSpiralPattern(x, y, isBoss = false, startAngle = 0) {
        // Fire bullets in a spiral pattern
        const bulletCount = isBoss ? 8 : 5;
        const angleStep = 45;
        
        for (let i = 0; i < bulletCount; i++) {
            const angle = startAngle + i * angleStep;
            const radians = Phaser.Math.DegToRad(angle);
            
            this.fireEnemyBullet(x, y, Math.cos(radians), Math.sin(radians), isBoss);
        }
    }
    
    fireAimedPattern(x, y, isBoss = false) {
        // Fire bullets aimed at player
        const player = this.scene.player;
        
        if (player && player.active) {
            // Calculate angle to player
            const angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);
            
            // Fire main bullet at player
            this.fireEnemyBullet(x, y, Math.cos(angle), Math.sin(angle), isBoss);
            
            // Fire additional bullets if boss
            if (isBoss) {
                const spreadAngle = 20;
                const radSpread = Phaser.Math.DegToRad(spreadAngle);
                
                // Fire spread bullets
                this.fireEnemyBullet(x, y, Math.cos(angle - radSpread), Math.sin(angle - radSpread), isBoss);
                this.fireEnemyBullet(x, y, Math.cos(angle + radSpread), Math.sin(angle + radSpread), isBoss);
            }
        } else {
            // If no player, fire straight down
            this.fireEnemyBullet(x, y, 0, 1, isBoss);
        }
    }
}
