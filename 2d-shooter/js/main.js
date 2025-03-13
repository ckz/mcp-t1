/**
 * Main Game Entry Point
 * Initializes the Phaser game and starts it
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Create Phaser game instance
    const game = new Phaser.Game(config);
    
    // Add game to window for debugging
    window.game = game;
    
    // Setup global audio
    setupAudio();
    
    // Setup mobile controls if needed
    if (isMobile()) {
        setupMobileControls();
    }
    
    // Handle window focus/blur
    window.addEventListener('blur', () => {
        // Pause game when window loses focus
        if (game.scene.isActive('GameScene')) {
            game.scene.pause('GameScene');
            game.scene.pause('UIScene');
        }
    });
    
    window.addEventListener('focus', () => {
        // Resume game when window gains focus if it was paused
        if (game.scene.isPaused('GameScene')) {
            // Don't auto-resume if in pause menu
            const uiScene = game.scene.getScene('UIScene');
            if (uiScene && !uiScene.pauseMenu) {
                game.scene.resume('GameScene');
                game.scene.resume('UIScene');
            }
        }
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause game when tab is hidden
            if (game.scene.isActive('GameScene')) {
                game.scene.pause('GameScene');
                game.scene.pause('UIScene');
            }
        } else {
            // Resume game when tab is visible if it was paused
            if (game.scene.isPaused('GameScene')) {
                // Don't auto-resume if in pause menu
                const uiScene = game.scene.getScene('UIScene');
                if (uiScene && !uiScene.pauseMenu) {
                    game.scene.resume('GameScene');
                    game.scene.resume('UIScene');
                }
            }
        }
    });
});

/**
 * Setup global audio settings
 */
function setupAudio() {
    // Create global audio manager using Howler.js
    window.audioManager = {
        muted: false,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        
        toggleMute: function() {
            this.muted = !this.muted;
            Howler.mute(this.muted);
            return this.muted;
        },
        
        setMusicVolume: function(volume) {
            this.musicVolume = volume;
            Howler.volume(volume);
        },
        
        setSfxVolume: function(volume) {
            this.sfxVolume = volume;
        }
    };
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 800);
}

/**
 * Setup mobile controls
 */
function setupMobileControls() {
    // Create mobile control container
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    document.getElementById('game-container').appendChild(mobileControls);
    
    // Create directional buttons
    const directions = [
        { id: 'up', text: '↑', x: 60, y: 0 },
        { id: 'left', text: '←', x: 0, y: 60 },
        { id: 'right', text: '→', x: 120, y: 60 },
        { id: 'down', text: '↓', x: 60, y: 120 }
    ];
    
    directions.forEach(dir => {
        const button = document.createElement('button');
        button.id = `mobile-${dir.id}`;
        button.textContent = dir.text;
        button.style.position = 'absolute';
        button.style.left = `${dir.x}px`;
        button.style.top = `${dir.y}px`;
        mobileControls.appendChild(button);
        
        // Add touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            simulateKeyPress(dir.id);
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            simulateKeyRelease(dir.id);
        });
    });
    
    // Create action buttons
    const actions = [
        { id: 'fire', text: 'FIRE', x: window.innerWidth - 140, y: 30 },
        { id: 'bomb', text: 'BOMB', x: window.innerWidth - 140, y: 110 }
    ];
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.id = `mobile-${action.id}`;
        button.textContent = action.text;
        button.style.position = 'absolute';
        button.style.left = `${action.x}px`;
        button.style.top = `${action.y}px`;
        button.style.width = '80px';
        button.style.height = '50px';
        button.style.fontSize = '16px';
        mobileControls.appendChild(button);
        
        // Add touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (action.id === 'fire') {
                simulateKeyPress('space');
            } else if (action.id === 'bomb') {
                simulateKeyPress('x');
            }
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (action.id === 'fire') {
                simulateKeyRelease('space');
            } else if (action.id === 'bomb') {
                simulateKeyRelease('x');
            }
        });
    });
}

/**
 * Simulate keyboard press for mobile controls
 * @param {string} key - Key to simulate
 */
function simulateKeyPress(key) {
    if (!window.game) return;
    
    const gameScene = window.game.scene.getScene('GameScene');
    if (!gameScene) return;
    
    // Map direction to key code
    let keyCode;
    switch (key) {
        case 'up':
            keyCode = Phaser.Input.Keyboard.KeyCodes.UP;
            break;
        case 'down':
            keyCode = Phaser.Input.Keyboard.KeyCodes.DOWN;
            break;
        case 'left':
            keyCode = Phaser.Input.Keyboard.KeyCodes.LEFT;
            break;
        case 'right':
            keyCode = Phaser.Input.Keyboard.KeyCodes.RIGHT;
            break;
        case 'space':
            keyCode = Phaser.Input.Keyboard.KeyCodes.SPACE;
            break;
        case 'x':
            keyCode = Phaser.Input.Keyboard.KeyCodes.X;
            break;
    }
    
    // Simulate key down event
    if (keyCode && gameScene.input && gameScene.input.keyboard) {
        gameScene.input.keyboard.emit('keydown-' + key.toUpperCase());
        
        // Update cursor keys for movement
        if (gameScene.cursors) {
            if (key === 'up') gameScene.cursors.up.isDown = true;
            if (key === 'down') gameScene.cursors.down.isDown = true;
            if (key === 'left') gameScene.cursors.left.isDown = true;
            if (key === 'right') gameScene.cursors.right.isDown = true;
        }
    }
}

/**
 * Simulate keyboard release for mobile controls
 * @param {string} key - Key to simulate
 */
function simulateKeyRelease(key) {
    if (!window.game) return;
    
    const gameScene = window.game.scene.getScene('GameScene');
    if (!gameScene) return;
    
    // Map direction to key code
    let keyCode;
    switch (key) {
        case 'up':
            keyCode = Phaser.Input.Keyboard.KeyCodes.UP;
            break;
        case 'down':
            keyCode = Phaser.Input.Keyboard.KeyCodes.DOWN;
            break;
        case 'left':
            keyCode = Phaser.Input.Keyboard.KeyCodes.LEFT;
            break;
        case 'right':
            keyCode = Phaser.Input.Keyboard.KeyCodes.RIGHT;
            break;
        case 'space':
            keyCode = Phaser.Input.Keyboard.KeyCodes.SPACE;
            break;
        case 'x':
            keyCode = Phaser.Input.Keyboard.KeyCodes.X;
            break;
    }
    
    // Simulate key up event
    if (keyCode && gameScene.input && gameScene.input.keyboard) {
        gameScene.input.keyboard.emit('keyup-' + key.toUpperCase());
        
        // Update cursor keys for movement
        if (gameScene.cursors) {
            if (key === 'up') gameScene.cursors.up.isDown = false;
            if (key === 'down') gameScene.cursors.down.isDown = false;
            if (key === 'left') gameScene.cursors.left.isDown = false;
            if (key === 'right') gameScene.cursors.right.isDown = false;
        }
    }
}