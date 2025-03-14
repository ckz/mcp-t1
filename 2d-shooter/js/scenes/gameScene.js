/**
 * Game Scene
 * Main gameplay scene with player, enemies, projectiles, and game logic
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // Initialize game variables
        this.score = 0;
        this.level = 1;
        this.playerLives = GAME_SETTINGS.player.startingLives;
        this.playerBombs = GAME_SETTINGS.player.startingBombs;
        this.gameOver = false;
        this.paused = false;
        this.bossActive = false;
        
        // Initialize timers
        this.enemySpawnTimer = 0;
        this.powerUpTimer = 0;
        this.levelTimer = 0;
        this.bossTimer = 0;
        
        // Initialize groups
        this.playerBullets = null;
        this.enemyBullets = null;
        this.enemies = null;
        this.powerUps = null;
        this.explosions = null;
        
        // Initialize player
        this.player = null;
        
        // Initialize input
        this.cursors = null;
        this.fireKey = null;
        this.bombKey = null;
        
        // Initialize background
        this.bgLayers = [];
    }

    create() {
        // Start UI scene
        this.scene.launch('UIScene');
        
        // Create background layers
        this.createBackground();
        
        // Create game objects groups
        this.createGroups();
        
        // Create player
        this.createPlayer();
        
        // Setup input
        this.setupInput();
        
        // Setup collisions
        this.setupCollisions();
        
        // Start game music
        this.gameMusic = this.sound.add('music-game', {
            volume: 0.4,
            loop: true
        });
        this.gameMusic.play();
        
        // Setup game events
        this.events.on('resume', () => {
            this.paused = false;
        });
        
        // Start enemy spawning
        this.time.addEvent({
            delay: GAME_SETTINGS.level.enemySpawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        
        // Start boss timer
        this.bossTimer = this.time.addEvent({
            delay: GAME_SETTINGS.level.bossSpawnTime,
            callback: this.spawnBoss,
            callbackScope: this
        });
    }

    update(time, delta) {
        if (this.gameOver || this.paused) return;
        
        // Update player
        if (this.player && this.player.active) {
            this.player.update(time, delta);
        }
        
        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.update(time, delta);
            }
        });
        
        // Update background parallax
        this.updateBackground();
        
        // Check if enemies are off screen
        this.checkEnemiesOffscreen();
        
        // Check if power-ups are off screen
        this.checkPowerUpsOffscreen();
        
        // Auto-fire player weapon
        if (this.player && this.player.active && time > this.player.nextFire) {
            this.player.fireWeapon();
        }
    }
    
    createBackground() {
        // Create parallax background layers
        this.bgLayers = [
            this.add.tileSprite(0, 0, config.width, config.height, 'bg-stars')
                .setOrigin(0)
                .setScrollFactor(0),
            this.add.tileSprite(0, 0, config.width, config.height, 'bg-nebula')
                .setOrigin(0)
                .setScrollFactor(0)
                .setAlpha(0.5),
            this.add.tileSprite(0, 0, config.width, config.height, 'bg-planets')
                .setOrigin(0)
                .setScrollFactor(0)
                .setAlpha(0.8)
        ];
    }
    
    updateBackground() {
        // Scroll background layers at different speeds
        this.bgLayers[0].tilePositionY -= GAME_SETTINGS.level.scrollSpeed * 0.5;
        this.bgLayers[1].tilePositionY -= GAME_SETTINGS.level.scrollSpeed * 0.2;
        this.bgLayers[2].tilePositionY -= GAME_SETTINGS.level.scrollSpeed * 0.1;
    }
    
    createGroups() {
        // Create physics groups
        this.playerBullets = this.physics.add.group({
            classType: PlayerBullet,
            maxSize: 30,
            runChildUpdate: true
        });
        
        this.enemyBullets = this.physics.add.group({
            classType: EnemyBullet,
            maxSize: 50,
            runChildUpdate: true
        });
        
        this.enemies = this.physics.add.group({
            runChildUpdate: true,
            classType: Enemy
        });
        
        this.powerUps = this.physics.add.group({
            classType: PowerUp,
            runChildUpdate: true
        });
        
        this.explosions = this.add.group({
            classType: Explosion,
            maxSize: 20,
            runChildUpdate: true
        });
    }
    
    createPlayer() {
        // Create player ship
        this.player = new Player(
            this,
            config.width / 2,
            config.height - 100,
            'player'
        );
        
        // Set player data
        this.player.setData('lives', this.playerLives);
        this.player.setData('bombs', this.playerBombs);
        
        // Add player to scene
        this.add.existing(this.player);
        this.physics.add.existing(this.player);
        
        // Set player collision with world bounds
        this.player.setCollideWorldBounds(true);
    }
    
    setupInput() {
        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.bombKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // Setup bomb key
        this.bombKey.on('down', () => {
            if (this.player && this.player.active && this.playerBombs > 0) {
                this.useBomb();
            }
        });
        
        // Setup pause key
        this.input.keyboard.on('keydown-ESC', () => {
            this.pauseGame();
        });
    }
    
    setupCollisions() {
        // Player bullets hit enemies
        this.physics.add.overlap(
            this.playerBullets,
            this.enemies,
            this.playerBulletHitEnemy,
            null,
            this
        );
        
        // Enemy bullets hit player
        this.physics.add.overlap(
            this.enemyBullets,
            this.player,
            this.enemyBulletHitPlayer,
            null,
            this
        );
        
        // Enemies hit player
        this.physics.add.overlap(
            this.enemies,
            this.player,
            this.enemyHitPlayer,
            null,
            this
        );
        
        // Player collects power-ups
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            this.playerCollectPowerUp,
            null,
            this
        );
    }
    
    spawnEnemy() {
        if (this.gameOver || this.paused || this.bossActive) return;
        
        // Determine enemy type based on level and randomness
        let enemyType = 'basic';
        const rand = Math.random();
        
        if (this.level >= 3 && rand < 0.1) {
            enemyType = 'tank';
        } else if (this.level >= 2 && rand < 0.3) {
            enemyType = 'fast';
        }
        
        // Determine spawn position
        const x = Phaser.Math.Between(50, config.width - 50);
        const y = -50;
        
        // Create enemy based on type
        let enemy;
        
        switch (enemyType) {
            case 'fast':
                enemy = new FastEnemy(this, x, y, 'enemy-fast');
                break;
            case 'tank':
                enemy = new TankEnemy(this, x, y, 'enemy-tank');
                break;
            default:
                enemy = new BasicEnemy(this, x, y, 'enemy-basic');
        }
        
        // Add enemy to group
        if (enemy) {
            this.enemies.add(enemy);
            
            // Start enemy animation
            enemy.play(`enemy-${enemyType}-fly`);
        }
    }
    
    spawnBoss() {
        if (this.gameOver || this.paused) return;
        
        // Set boss active flag
        this.bossActive = true;
        
        // Stop regular enemy spawning
        this.time.removeAllEvents();
        
        // Create boss warning text
        const warningText = this.add.text(config.width / 2, config.height / 2, 'WARNING: BOSS APPROACHING', {
            font: '32px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Flash warning text
        if (this.tweens) {
            this.tweens.add({
                targets: warningText,
                alpha: 0,
                duration: 500,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    warningText.destroy();
                    
                    // Switch to boss music
                    this.gameMusic.stop();
                    this.gameMusic = this.sound.add('music-boss', {
                        volume: 0.5,
                        loop: true
                    });
                    this.gameMusic.play();
                    
                    // Spawn the boss
                    const boss = new Boss(this, config.width / 2, -100, 'boss');
                    this.enemies.add(boss);
                    boss.play('boss-idle');
                    
                    // Notify UI scene
                    this.scene.get('UIScene').showBossHealth(boss);
                    
                    // Move boss into position
                    if (this.tweens) {
                        this.tweens.add({
                            targets: boss,
                            y: 150,
                            duration: 2000,
                            ease: 'Power2',
                            onComplete: () => {
                                boss.startAttackPattern();
                            }
                        });
                    } else {
                        // Fallback if tweens not available
                        boss.y = 150;
                        boss.startAttackPattern();
                    }
                }
            });
        } else {
            // Fallback if tweens not available
            warningText.destroy();
            
            // Switch to boss music
            this.gameMusic.stop();
            this.gameMusic = this.sound.add('music-boss', {
                volume: 0.5,
                loop: true
            });
            this.gameMusic.play();
            
            // Spawn the boss
            const boss = new Boss(this, config.width / 2, 150, 'boss');
            this.enemies.add(boss);
            boss.play('boss-idle');
            
            // Notify UI scene
            this.scene.get('UIScene').showBossHealth(boss);
            
            // Start attack pattern
            boss.startAttackPattern();
        }
    }
    
    playerBulletHitEnemy(bullet, enemy) {
        // Check if enemy has damage method
        if (typeof enemy.damage !== 'function') {
            console.warn('Enemy does not have damage method:', enemy);
            bullet.destroy();
            return;
        }
        
        // Apply damage to enemy
        enemy.damage(bullet.attackPower);
        
        // Destroy bullet
        bullet.destroy();
        
        // Check if enemy is destroyed
        if (enemy.health <= 0) {
            // Add score
            this.addScore(enemy.score);
            
            // Create explosion
            this.createExplosion(enemy.x, enemy.y);
            
            // Chance to spawn power-up
            if (Math.random() < GAME_SETTINGS.powerUps.dropRate) {
                this.spawnPowerUp(enemy.x, enemy.y);
            }
            
            // Check if it was a boss
            if (enemy.isBoss) {
                this.bossDefeated();
            }
            
            // Destroy enemy
            enemy.destroy();
        } else {
            // Play hit sound
            this.sound.play('sfx-enemy-hit', { volume: 0.3 });
        }
    }
    
    enemyBulletHitPlayer(bullet, player) {
        if (player.isInvulnerable) return;
        
        // Destroy bullet
        bullet.destroy();
        
        // Damage player
        this.damagePlayer();
    }
    
    enemyHitPlayer(enemy, player) {
        if (player.isInvulnerable) return;
        
        // Damage player
        this.damagePlayer();
        
        // Check if enemy has damage method
        if (typeof enemy.damage === 'function') {
            // Damage enemy
            enemy.damage(1);
            
            // Check if enemy is destroyed
            if (enemy.health <= 0) {
                // Create explosion
                this.createExplosion(enemy.x, enemy.y);
                
                // Destroy enemy
                enemy.destroy();
            }
        }
    }
    
    playerCollectPowerUp(player, powerUp) {
        // Apply power-up effect
        switch (powerUp.type) {
            case 'weapon':
                player.upgradeWeapon();
                break;
            case 'shield':
                player.activateShield();
                break;
            case 'speed':
                player.activateSpeedBoost();
                break;
            case 'bomb':
                this.playerBombs++;
                this.events.emit('updateBombs', this.playerBombs);
                break;
            case 'life':
                this.playerLives++;
                this.events.emit('updateLives', this.playerLives);
                break;
        }
        
        // Play power-up sound
        this.sound.play('sfx-powerup');
        
        // Destroy power-up
        powerUp.destroy();
    }
    
    damagePlayer() {
        // Reduce player lives
        this.playerLives--;
        
        // Update UI
        this.events.emit('updateLives', this.playerLives);
        
        // Play hit sound
        this.sound.play('sfx-player-hit');
        
        // Create explosion effect
        this.createExplosion(this.player.x, this.player.y, 0.5);
        
        // Check if game over
        if (this.playerLives <= 0) {
            this.gameOver = true;
            this.player.destroy();
            this.createExplosion(this.player.x, this.player.y);
            this.gameOverSequence();
        } else {
            // Store player position and data before potential destruction
            const playerX = this.player.x;
            const playerY = this.player.y;
            const weaponLevel = this.player.weaponLevel;
            const weaponType = this.player.weaponType;
            
            // Check if player health is zero (destroyed)
            if (this.player.health <= 0) {
                // Create full explosion
                this.createExplosion(playerX, playerY);
                
                // Destroy current player
                this.player.destroy();
                
                // Respawn player after a delay
                this.time.delayedCall(1000, () => {
                    // Create new player
                    this.createPlayer();
                    
                    // Restore player position and weapon data
                    this.player.x = playerX;
                    this.player.y = playerY;
                    this.player.weaponLevel = weaponLevel;
                    this.player.weaponType = weaponType;
                    
                    // Make player invulnerable temporarily
                    this.player.setInvulnerable();
                });
            } else {
                // Make player invulnerable temporarily
                this.player.setInvulnerable();
            }
        }
    }
    
    useBomb() {
        // Reduce bomb count
        this.playerBombs--;
        
        // Update UI
        this.events.emit('updateBombs', this.playerBombs);
        
        // Play bomb sound
        this.sound.play('sfx-bomb');
        
        // Create bomb effect
        const bombEffect = this.add.circle(
            this.player.x,
            this.player.y,
            20,
            0xffffff,
            1
        );
        
        // Expand bomb effect
        if (this.tweens) {
            this.tweens.add({
                targets: bombEffect,
                radius: 400,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    bombEffect.destroy();
                }
            });
        } else {
            // Fallback if tweens not available
            setTimeout(() => {
                bombEffect.destroy();
            }, 1000);
        }
        
        // Destroy all enemy bullets
        this.enemyBullets.clear(true, true);
        
        // Damage all enemies
        this.enemies.getChildren().forEach(enemy => {
            // Check if enemy has damage method
            if (typeof enemy.damage === 'function') {
                enemy.damage(enemy.isBoss ? 10 : enemy.health);
                
                if (enemy.health <= 0) {
                    // Add score
                    this.addScore(enemy.score);
                    
                    // Create explosion
                    this.createExplosion(enemy.x, enemy.y);
                    
                    // Destroy enemy
                    enemy.destroy();
                }
            }
        });
        
        // Camera shake effect
        this.cameras.main.shake(500, 0.01);
    }
    
    createExplosion(x, y, scale = 1) {
        // Create explosion sprite
        const explosion = new Explosion(this, x, y);
        this.explosions.add(explosion);
        explosion.setScale(scale);
        explosion.play('explosion');
        
        // Play explosion sound
        this.sound.play('sfx-explosion', {
            volume: 0.3 * scale
        });
    }
    
    spawnPowerUp(x, y) {
        // Select random power-up type
        const types = GAME_SETTINGS.powerUps.types;
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Create power-up
        const powerUp = new PowerUp(this, x, y, `powerup-${type}`, type);
        this.powerUps.add(powerUp);
    }
    
    addScore(points) {
        this.score += points;
        this.events.emit('updateScore', this.score);
    }
    
    checkEnemiesOffscreen() {
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.y > config.height + 100) {
                enemy.destroy();
            }
        });
    }
    
    checkPowerUpsOffscreen() {
        this.powerUps.getChildren().forEach(powerUp => {
            if (powerUp.y > config.height + 50) {
                powerUp.destroy();
            }
        });
    }
    
    bossDefeated() {
        // Reset boss active flag
        this.bossActive = false;
        
        // Hide boss health bar
        this.scene.get('UIScene').hideBossHealth();
        
        // Switch back to regular music
        this.gameMusic.stop();
        this.gameMusic = this.sound.add('music-game', {
            volume: 0.4,
            loop: true
        });
        this.gameMusic.play();
        
        // Increase level
        this.level++;
        
        // Show level complete message
        const levelText = this.add.text(config.width / 2, config.height / 2, `LEVEL ${this.level - 1} COMPLETE!`, {
            font: '32px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Remove text after delay
        this.time.delayedCall(3000, () => {
            levelText.destroy();
            
            // Resume enemy spawning
            this.time.addEvent({
                delay: GAME_SETTINGS.level.enemySpawnRate * 0.8, // Spawn faster in higher levels
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
            
            // Start boss timer for next level
            this.bossTimer = this.time.addEvent({
                delay: GAME_SETTINGS.level.bossSpawnTime,
                callback: this.spawnBoss,
                callbackScope: this
            });
        });
    }
    
    pauseGame() {
        this.paused = true;
        this.scene.pause();
        this.scene.pause('UIScene');
        
        // Create pause menu
        const pauseMenu = this.scene.get('UIScene');
        pauseMenu.showPauseMenu();
    }
    
    gameOverSequence() {
        // Stop game music
        this.gameMusic.stop();
        
        // Show game over screen
        this.scene.get('UIScene').showGameOver(this.score);
        
        // Add restart button
        const restartButton = this.add.text(config.width / 2, config.height / 2 + 100, 'RESTART', {
            font: '24px Arial',
            fill: '#ffffff',
            backgroundColor: '#222222',
            padding: {
                x: 20,
                y: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            // Restart game
            this.scene.restart();
            this.scene.get('UIScene').scene.restart();
        });
    }
}
