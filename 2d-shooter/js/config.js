/**
 * Game configuration settings
 */
const config = {
    // Game dimensions and rendering settings
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    
    // Physics settings
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    
    // Scene list
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        GameScene,
        UIScene
    ],
    
    // Pixel art settings
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true
    },
    
    // Scale settings
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    
    // DOM element to render in
    parent: 'game-container'
};

// Game settings
const GAME_SETTINGS = {
    // Player settings
    player: {
        speed: 300,
        startingLives: 3,
        invincibilityTime: 2000, // ms
        fireRate: 200, // ms between shots
        startingBombs: 2
    },
    
    // Weapon settings
    weapons: {
        basic: {
            speed: 500,
            damage: 1,
            fireRate: 200
        },
        spread: {
            speed: 450,
            damage: 1,
            fireRate: 300,
            count: 3,
            angle: 15
        },
        laser: {
            speed: 600,
            damage: 2,
            fireRate: 400,
            width: 8,
            length: 600
        },
        homing: {
            speed: 350,
            damage: 1,
            fireRate: 500,
            trackingSpeed: 0.05
        }
    },
    
    // Enemy settings
    enemies: {
        basic: {
            speed: 150,
            health: 2,
            score: 100,
            fireRate: 2000
        },
        fast: {
            speed: 250,
            health: 1,
            score: 150,
            fireRate: 2500
        },
        tank: {
            speed: 100,
            health: 5,
            score: 200,
            fireRate: 3000
        },
        miniBoss: {
            speed: 80,
            health: 30,
            score: 1000,
            fireRate: 1500
        },
        boss: {
            speed: 60,
            health: 100,
            score: 5000,
            fireRate: 1000,
            phaseThresholds: [0.7, 0.4, 0.2] // Health percentages for phase changes
        }
    },
    
    // Power-up settings
    powerUps: {
        duration: 10000, // ms
        types: ['weapon', 'shield', 'speed', 'bomb', 'life'],
        dropRate: 0.2 // Probability of enemy dropping a power-up
    },
    
    // Level settings
    level: {
        scrollSpeed: 2, // Pixels per frame
        enemySpawnRate: 2000, // ms between enemy spawns
        bossSpawnTime: 120000, // ms until boss spawns (2 minutes)
        parallaxLayers: 3
    },
    
    // Scoring settings
    scoring: {
        multiplierDuration: 5000, // ms
        multiplierMax: 4,
        noHitBonus: 1000,
        timeBonus: 10 // Points per second remaining
    }
};