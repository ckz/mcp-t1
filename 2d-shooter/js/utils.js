/**
 * Utility Functions
 * Helper functions for the game
 */

/**
 * Creates a particle explosion effect
 * @param {Phaser.Scene} scene - The scene to add the explosion to
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} count - Number of particles
 * @param {number} speed - Particle speed
 * @param {number} scale - Particle scale
 * @param {number} color - Particle color (hex)
 * @param {number} lifespan - Particle lifespan in ms
 */
function createParticleExplosion(scene, x, y, count = 20, speed = 200, scale = 1, color = 0xffffff, lifespan = 800) {
    const particles = scene.add.particles('bullet-player');
    
    const emitter = particles.createEmitter({
        x: x,
        y: y,
        speed: { min: -speed, max: speed },
        scale: { start: scale, end: 0 },
        lifespan: lifespan,
        blendMode: 'ADD',
        tint: color
    });
    
    // Emit particles
    emitter.explode(count, x, y);
    
    // Destroy emitter after particles are done
    scene.time.delayedCall(lifespan + 100, () => {
        emitter.stop();
        particles.destroy();
    });
}

/**
 * Creates a screen flash effect
 * @param {Phaser.Scene} scene - The scene to add the flash to
 * @param {number} duration - Flash duration in ms
 * @param {number} color - Flash color (hex)
 */
function createScreenFlash(scene, duration = 100, color = 0xffffff) {
    if (!scene || !scene.add) return;
    
    const flash = scene.add.rectangle(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        color,
        0.8
    );
    
    if (scene.tweens) {
        scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    } else {
        // Fallback if tweens not available
        setTimeout(() => {
            flash.destroy();
        }, duration);
    }
}

/**
 * Creates a text popup effect
 * @param {Phaser.Scene} scene - The scene to add the popup to
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} text - Text to display
 * @param {object} style - Text style object
 * @param {number} duration - Popup duration in ms
 */
function createTextPopup(scene, x, y, text, style = {}, duration = 1000) {
    if (!scene || !scene.add) return null;
    
    // Default style
    const defaultStyle = {
        font: '20px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
    };
    
    // Merge styles
    const mergedStyle = { ...defaultStyle, ...style };
    
    // Create text
    const textObj = scene.add.text(x, y, text, mergedStyle)
        .setOrigin(0.5);
    
    // Animate text
    if (scene.tweens) {
        scene.tweens.add({
            targets: textObj,
            y: y - 50,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                textObj.destroy();
            }
        });
    } else {
        // Fallback if tweens not available
        setTimeout(() => {
            textObj.destroy();
        }, duration);
    }
    
    return textObj;
}

/**
 * Creates a score popup effect
 * @param {Phaser.Scene} scene - The scene to add the popup to
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} score - Score to display
 */
function createScorePopup(scene, x, y, score) {
    return createTextPopup(scene, x, y, `+${score}`, {
        font: '20px Arial',
        fill: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3
    });
}

/**
 * Shakes the camera
 * @param {Phaser.Scene} scene - The scene with the camera to shake
 * @param {number} duration - Shake duration in ms
 * @param {number} intensity - Shake intensity
 */
function shakeCamera(scene, duration = 100, intensity = 0.01) {
    scene.cameras.main.shake(duration, intensity);
}

/**
 * Formats a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculates angle between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Angle in radians
 */
function angleBetweenPoints(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Calculates distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance
 */
function distanceBetweenPoints(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a point is within screen bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} padding - Padding from edges
 * @returns {boolean} True if within bounds
 */
function isWithinScreenBounds(x, y, padding = 0) {
    return x >= padding && 
           x <= config.width - padding && 
           y >= padding && 
           y <= config.height - padding;
}

/**
 * Gets a random position within screen bounds
 * @param {number} padding - Padding from edges
 * @returns {object} Position object with x and y properties
 */
function getRandomScreenPosition(padding = 50) {
    return {
        x: Phaser.Math.Between(padding, config.width - padding),
        y: Phaser.Math.Between(padding, config.height - padding)
    };
}

/**
 * Creates a button with hover and click effects
 * @param {Phaser.Scene} scene - The scene to add the button to
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} text - Button text
 * @param {function} callback - Click callback function
 * @param {object} style - Text style object
 * @returns {Phaser.GameObjects.Text} Button object
 */
function createButton(scene, x, y, text, callback, style = {}) {
    // Default style
    const defaultStyle = {
        font: '24px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        backgroundColor: '#222222',
        padding: {
            x: 20,
            y: 10
        }
    };
    
    // Merge styles
    const mergedStyle = { ...defaultStyle, ...style };
    
    // Create button
    const button = scene.add.text(x, y, text, mergedStyle)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            button.setTint(0x00ffff);
        })
        .on('pointerout', () => {
            button.clearTint();
        })
        .on('pointerdown', () => {
            callback();
        });
    
    return button;
}

/**
 * Creates a progress bar
 * @param {Phaser.Scene} scene - The scene to add the progress bar to
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Bar width
 * @param {number} height - Bar height
 * @param {number} fillColor - Fill color (hex)
 * @param {number} backgroundColor - Background color (hex)
 * @returns {object} Progress bar object with update method
 */
function createProgressBar(scene, x, y, width, height, fillColor = 0x00ff00, backgroundColor = 0x000000) {
    // Create background
    const background = scene.add.rectangle(x, y, width, height, backgroundColor)
        .setOrigin(0, 0.5)
        .setStrokeStyle(2, 0xffffff);
    
    // Create fill
    const fill = scene.add.rectangle(x, y, width, height, fillColor)
        .setOrigin(0, 0.5);
    
    // Return progress bar object
    return {
        background: background,
        fill: fill,
        update: function(percent) {
            // Clamp percent between 0 and 1
            percent = Phaser.Math.Clamp(percent, 0, 1);
            
            // Update fill width
            this.fill.width = width * percent;
        },
        destroy: function() {
            this.background.destroy();
            this.fill.destroy();
        }
    };
}