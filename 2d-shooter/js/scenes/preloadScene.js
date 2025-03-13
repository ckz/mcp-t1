/**
 * Preload Scene
 * Loads all game assets, graphics and audio
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Load player ship sprites
        this.load.spritesheet('player', 'assets/images/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Load enemy sprites
        this.load.spritesheet('enemy-basic', 'assets/images/enemy-basic.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('enemy-fast', 'assets/images/enemy-fast.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('enemy-tank', 'assets/images/enemy-tank.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('mini-boss', 'assets/images/mini-boss.png', {
            frameWidth: 96,
            frameHeight: 96
        });
        this.load.spritesheet('boss', 'assets/images/boss.png', {
            frameWidth: 192,
            frameHeight: 192
        });
        
        // Load projectile sprites
        this.load.image('bullet-player', 'assets/images/bullet-player.png');
        this.load.image('bullet-enemy', 'assets/images/bullet-enemy.png');
        this.load.image('laser', 'assets/images/laser.png');
        this.load.spritesheet('explosion', 'assets/images/explosion.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Load power-up sprites
        this.load.image('powerup-weapon', 'assets/images/powerup-weapon.png');
        this.load.image('powerup-shield', 'assets/images/powerup-shield.png');
        this.load.image('powerup-speed', 'assets/images/powerup-speed.png');
        this.load.image('powerup-bomb', 'assets/images/powerup-bomb.png');
        this.load.image('powerup-life', 'assets/images/powerup-life.png');
        
        // Load background layers
        this.load.image('bg-stars', 'assets/images/bg-stars.png');
        this.load.image('bg-nebula', 'assets/images/bg-nebula.png');
        this.load.image('bg-planets', 'assets/images/bg-planets.png');
        
        // Load UI elements
        this.load.image('life-icon', 'assets/images/life-icon.png');
        this.load.image('bomb-icon', 'assets/images/bomb-icon.png');
        this.load.image('title', 'assets/images/title.png');
        
        // Load audio
        this.load.audio('music-menu', 'assets/audio/music-menu.mp3');
        this.load.audio('music-game', 'assets/audio/music-game.mp3');
        this.load.audio('music-boss', 'assets/audio/music-boss.mp3');
        this.load.audio('sfx-explosion', 'assets/audio/sfx-explosion.mp3');
        this.load.audio('sfx-laser', 'assets/audio/sfx-laser.mp3');
        this.load.audio('sfx-powerup', 'assets/audio/sfx-powerup.mp3');
        this.load.audio('sfx-player-hit', 'assets/audio/sfx-player-hit.mp3');
        this.load.audio('sfx-enemy-hit', 'assets/audio/sfx-enemy-hit.mp3');
        this.load.audio('sfx-bomb', 'assets/audio/sfx-bomb.mp3');
    }

    create() {
        // Create animations
        
        // Player animations
        this.anims.create({
            key: 'player-idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-left',
            frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player-right',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Explosion animation
        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 20,
            repeat: 0
        });
        
        // Enemy animations
        this.anims.create({
            key: 'enemy-basic-fly',
            frames: this.anims.generateFrameNumbers('enemy-basic', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'enemy-fast-fly',
            frames: this.anims.generateFrameNumbers('enemy-fast', { start: 0, end: 1 }),
            frameRate: 12,
            repeat: -1
        });
        
        this.anims.create({
            key: 'enemy-tank-fly',
            frames: this.anims.generateFrameNumbers('enemy-tank', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });
        
        this.anims.create({
            key: 'mini-boss-fly',
            frames: this.anims.generateFrameNumbers('mini-boss', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'boss-idle',
            frames: this.anims.generateFrameNumbers('boss', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        
        // Setup audio
        this.sound.pauseOnBlur = false;
        
        // Transition to the menu scene
        this.scene.start('MenuScene');
    }
}