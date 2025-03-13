/**
 * UI Scene
 * Handles all UI elements that overlay the game scene
 */
class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init() {
        // Initialize UI elements
        this.scoreText = null;
        this.livesIcons = [];
        this.bombIcons = [];
        this.powerUpIndicator = null;
        this.bossHealthBar = null;
        this.bossNameText = null;
        this.currentBoss = null;
    }

    create() {
        // Create score display
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            font: '20px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        
        // Create lives display
        this.createLivesDisplay();
        
        // Create bombs display
        this.createBombsDisplay();
        
        // Create power-up indicator
        this.createPowerUpIndicator();
        
        // Create boss health bar (hidden initially)
        this.createBossHealthBar();
        
        // Listen for game events
        const gameScene = this.scene.get('GameScene');
        
        gameScene.events.on('updateScore', this.updateScore, this);
        gameScene.events.on('updateLives', this.updateLives, this);
        gameScene.events.on('updateBombs', this.updateBombs, this);
        gameScene.events.on('updatePowerUp', this.updatePowerUp, this);
    }

    createLivesDisplay() {
        // Create lives text
        this.add.text(config.width - 20, 20, 'LIVES:', {
            font: '20px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);
        
        // Create life icons
        const startX = config.width - 40;
        const y = 50;
        
        for (let i = 0; i < GAME_SETTINGS.player.startingLives; i++) {
            const lifeIcon = this.add.image(startX - (i * 30), y, 'life-icon')
                .setScale(0.5);
            this.livesIcons.push(lifeIcon);
        }
    }
    
    createBombsDisplay() {
        // Create bombs text
        this.add.text(config.width - 20, 80, 'BOMBS:', {
            font: '20px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);
        
        // Create bomb icons
        const startX = config.width - 40;
        const y = 110;
        
        for (let i = 0; i < GAME_SETTINGS.player.startingBombs; i++) {
            const bombIcon = this.add.image(startX - (i * 30), y, 'bomb-icon')
                .setScale(0.5);
            this.bombIcons.push(bombIcon);
        }
    }
    
    createPowerUpIndicator() {
        // Create power-up indicator container
        this.powerUpIndicator = this.add.container(20, config.height - 60);
        
        // Add background
        const bg = this.add.rectangle(0, 0, 150, 40, 0x000000, 0.5)
            .setOrigin(0, 0);
        this.powerUpIndicator.add(bg);
        
        // Add text
        const text = this.add.text(10, 10, 'WEAPON: LVL 1', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.powerUpIndicator.add(text);
        
        // Hide initially
        this.powerUpIndicator.setVisible(false);
    }
    
    createBossHealthBar() {
        // Create boss health container
        this.bossHealthContainer = this.add.container(config.width / 2, 20)
            .setVisible(false);
        
        // Add boss name text
        this.bossNameText = this.add.text(0, -25, 'BOSS', {
            font: '20px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0);
        this.bossHealthContainer.add(this.bossNameText);
        
        // Add health bar background
        const barWidth = 400;
        const barHeight = 20;
        const barBg = this.add.rectangle(0, 0, barWidth, barHeight, 0x000000, 0.8)
            .setOrigin(0.5, 0)
            .setStrokeStyle(2, 0xffffff);
        this.bossHealthContainer.add(barBg);
        
        // Add health bar
        this.bossHealthBar = this.add.rectangle(-barWidth / 2, 0, barWidth, barHeight, 0xff0000)
            .setOrigin(0, 0);
        this.bossHealthContainer.add(this.bossHealthBar);
    }
    
    updateScore(score) {
        this.scoreText.setText(`SCORE: ${score}`);
    }
    
    updateLives(lives) {
        // Update life icons
        for (let i = 0; i < this.livesIcons.length; i++) {
            this.livesIcons[i].setVisible(i < lives);
        }
        
        // Add more icons if needed
        if (lives > this.livesIcons.length) {
            const startX = config.width - 40;
            const y = 50;
            
            for (let i = this.livesIcons.length; i < lives; i++) {
                const lifeIcon = this.add.image(startX - (i * 30), y, 'life-icon')
                    .setScale(0.5);
                this.livesIcons.push(lifeIcon);
            }
        }
    }
    
    updateBombs(bombs) {
        // Update bomb icons
        for (let i = 0; i < this.bombIcons.length; i++) {
            this.bombIcons[i].setVisible(i < bombs);
        }
        
        // Add more icons if needed
        if (bombs > this.bombIcons.length) {
            const startX = config.width - 40;
            const y = 110;
            
            for (let i = this.bombIcons.length; i < bombs; i++) {
                const bombIcon = this.add.image(startX - (i * 30), y, 'bomb-icon')
                    .setScale(0.5);
                this.bombIcons.push(bombIcon);
            }
        }
    }
    
    updatePowerUp(type, level) {
        // Show power-up indicator
        this.powerUpIndicator.setVisible(true);
        
        // Update text
        const text = this.powerUpIndicator.getAt(1);
        
        switch (type) {
            case 'weapon':
                text.setText(`WEAPON: LVL ${level}`);
                break;
            case 'shield':
                text.setText('SHIELD ACTIVE');
                break;
            case 'speed':
                text.setText('SPEED BOOST');
                break;
        }
        
        // Clear after duration
        this.time.delayedCall(3000, () => {
            if (type !== 'weapon') {
                this.powerUpIndicator.setVisible(false);
            }
        });
    }
    
    showBossHealth(boss) {
        // Store reference to boss
        this.currentBoss = boss;
        
        // Show boss health container
        this.bossHealthContainer.setVisible(true);
        
        // Update boss name
        this.bossNameText.setText(boss.name || 'BOSS');
        
        // Reset health bar
        const barWidth = 400;
        this.bossHealthBar.width = barWidth;
        
        // Listen for boss health changes
        boss.on('healthChanged', this.updateBossHealth, this);
    }
    
    updateBossHealth() {
        if (!this.currentBoss) return;
        
        // Calculate health percentage
        const healthPercent = this.currentBoss.health / this.currentBoss.maxHealth;
        
        // Update health bar width
        const barWidth = 400;
        this.bossHealthBar.width = barWidth * healthPercent;
        
        // Change color based on health
        if (healthPercent < 0.3) {
            this.bossHealthBar.fillColor = 0xff0000; // Red
        } else if (healthPercent < 0.6) {
            this.bossHealthBar.fillColor = 0xffff00; // Yellow
        } else {
            this.bossHealthBar.fillColor = 0x00ff00; // Green
        }
    }
    
    hideBossHealth() {
        // Hide boss health container
        this.bossHealthContainer.setVisible(false);
        
        // Clear boss reference
        this.currentBoss = null;
    }
    
    showPauseMenu() {
        // Create pause menu container
        this.pauseMenu = this.add.container(config.width / 2, config.height / 2);
        
        // Add background
        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff);
        this.pauseMenu.add(bg);
        
        // Add title
        const title = this.add.text(0, -70, 'PAUSED', {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.pauseMenu.add(title);
        
        // Add resume button
        const resumeButton = this.add.text(0, 0, 'RESUME', {
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
            this.resumeGame();
        });
        this.pauseMenu.add(resumeButton);
        
        // Add quit button
        const quitButton = this.add.text(0, 60, 'QUIT', {
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
            this.quitGame();
        });
        this.pauseMenu.add(quitButton);
        
        // Add ESC key handler
        this.input.keyboard.once('keydown-ESC', () => {
            this.resumeGame();
        });
    }
    
    resumeGame() {
        // Remove pause menu
        if (this.pauseMenu) {
            this.pauseMenu.destroy();
            this.pauseMenu = null;
        }
        
        // Resume game scene
        this.scene.resume('GameScene');
        this.scene.resume();
    }
    
    quitGame() {
        // Stop all scenes
        this.scene.stop('GameScene');
        this.scene.stop();
        
        // Return to menu
        this.scene.start('MenuScene');
    }
    
    showGameOver(score) {
        // Create game over container
        this.gameOverMenu = this.add.container(config.width / 2, config.height / 2);
        
        // Add background
        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xff0000);
        this.gameOverMenu.add(bg);
        
        // Add title
        const title = this.add.text(0, -100, 'GAME OVER', {
            font: '48px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.gameOverMenu.add(title);
        
        // Add score
        const scoreText = this.add.text(0, -20, `FINAL SCORE: ${score}`, {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.gameOverMenu.add(scoreText);
        
        // Add restart button
        const restartButton = this.add.text(0, 60, 'RESTART', {
            font: '28px Arial',
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
            this.restartGame();
        });
        this.gameOverMenu.add(restartButton);
        
        // Add menu button
        const menuButton = this.add.text(0, 130, 'MAIN MENU', {
            font: '28px Arial',
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
            this.quitGame();
        });
        this.gameOverMenu.add(menuButton);
    }
    
    restartGame() {
        // Remove game over menu
        if (this.gameOverMenu) {
            this.gameOverMenu.destroy();
            this.gameOverMenu = null;
        }
        
        // Restart game scene
        this.scene.get('GameScene').scene.restart();
        this.scene.restart();
    }
}