/**
 * Menu Scene
 * Displays the main menu with options to start the game
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create parallax background
        this.createBackground();
        
        // Add title
        this.add.image(width / 2, height / 4, 'title')
            .setOrigin(0.5)
            .setScale(0.8);
        
        // Create menu buttons
        this.createButtons();
        
        // Play menu music
        this.menuMusic = this.sound.add('music-menu', {
            volume: 0.5,
            loop: true
        });
        this.menuMusic.play();
        
        // Add keyboard input
        this.input.keyboard.on('keydown-SPACE', () => {
            this.startGame();
        });
        
        // Add ship animation in the background
        this.createShipAnimation();
    }
    
    update() {
        // Update background parallax
        this.bgStars.tilePositionY -= 0.5;
        this.bgNebula.tilePositionY -= 0.2;
        this.bgPlanets.tilePositionY -= 0.1;
        
        // Update ship animation
        if (this.demoShip) {
            this.demoShip.y += 0.5;
            if (this.demoShip.y > this.cameras.main.height + 50) {
                this.demoShip.y = -50;
                this.demoShip.x = Phaser.Math.Between(100, this.cameras.main.width - 100);
            }
        }
    }
    
    createBackground() {
        // Create parallax background layers
        this.bgStars = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-stars')
            .setOrigin(0)
            .setScrollFactor(0);
            
        this.bgNebula = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-nebula')
            .setOrigin(0)
            .setScrollFactor(0)
            .setAlpha(0.5);
            
        this.bgPlanets = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-planets')
            .setOrigin(0)
            .setScrollFactor(0)
            .setAlpha(0.8);
    }
    
    createButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Start Game button
        const startButton = this.add.text(width / 2, height / 2, 'START GAME', {
            font: '32px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            padding: {
                x: 20,
                y: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            startButton.setTint(0x00ffff);
        })
        .on('pointerout', () => {
            startButton.clearTint();
        })
        .on('pointerdown', () => {
            this.startGame();
        });
        
        // Add a pulsing effect to the start button
        this.tweens.add({
            targets: startButton,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Controls button
        const controlsButton = this.add.text(width / 2, height / 2 + 80, 'CONTROLS', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: {
                x: 15,
                y: 8
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            controlsButton.setTint(0x00ffff);
        })
        .on('pointerout', () => {
            controlsButton.clearTint();
        })
        .on('pointerdown', () => {
            this.showControls();
        });
    }
    
    createShipAnimation() {
        // Add a ship that flies in the background
        this.demoShip = this.add.sprite(
            Phaser.Math.Between(100, this.cameras.main.width - 100),
            -50,
            'player'
        )
        .setScale(1.5);
        
        this.demoShip.play('player-idle');
        
        // Add engine particles
        const particles = this.add.particles('bullet-player');
        
        particles.createEmitter({
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            follow: this.demoShip,
            followOffset: { x: 0, y: 20 },
            frequency: 50,
            alpha: { start: 0.5, end: 0 },
            tint: 0x00ffff
        });
    }
    
    showControls() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a semi-transparent background
        const controlsBg = this.add.rectangle(width / 2, height / 2, width - 100, height - 100, 0x000000, 0.8)
            .setOrigin(0.5)
            .setInteractive();
            
        // Add controls text
        const controlsText = this.add.text(width / 2, height / 2 - 120, 'CONTROLS', {
            font: '28px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const controls = [
            'ARROW KEYS / WASD: Move ship',
            'SPACE: Fire special weapon',
            'X: Deploy bomb',
            'ESC: Pause game'
        ];
        
        let yPos = height / 2 - 60;
        controls.forEach(control => {
            this.add.text(width / 2, yPos, control, {
                font: '20px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            yPos += 40;
        });
        
        // Add back button
        const backButton = this.add.text(width / 2, height / 2 + 120, 'BACK', {
            font: '24px Arial',
            fill: '#ffffff',
            backgroundColor: '#222222',
            padding: {
                x: 15,
                y: 8
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            // Remove all controls elements
            controlsBg.destroy();
            controlsText.destroy();
            backButton.destroy();
            
            // Remove all control text elements
            this.children.list
                .filter(child => child.type === 'Text' && controls.includes(child.text))
                .forEach(child => child.destroy());
        });
    }
    
    startGame() {
        // Stop menu music
        this.menuMusic.stop();
        
        // Play start game sound
        this.sound.play('sfx-powerup');
        
        // Start the game scene
        this.scene.start('GameScene');
    }
}